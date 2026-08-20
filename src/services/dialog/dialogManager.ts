/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Dialog Manager Service
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import {
  DialogProps,
  ShowDialogOptions,
  ConfirmationDialogOptions,
  DialogResult,
  DialogAnalyticsEvent,
  DialogState,
} from '../../types/dialogFramework';
import {
  DialogType,
  DialogPriority,
  DialogInstance,
  DialogStack,
  DialogQueueItem,
  OpenDialogOptions,
  DialogManagerState,
  DialogAuditRecord,
} from '../../types/dialogOrchestrationFramework';
import { DialogRegistry } from './dialogRegistry';

type DialogListener = (instances: DialogInstance[]) => void;
type AnalyticsListener = (event: DialogAnalyticsEvent) => void;
type AuditListener = (record: DialogAuditRecord) => void;

class DialogManagerServiceClass {
  private instances: Map<string, DialogInstance> = new Map();
  private stackOrder: string[] = []; // Array of IDs in display order (bottom to top)
  private queue: DialogQueueItem[] = [];
  private isQueuePaused: boolean = false;
  private maxStackDepth: number = 5; // Guard against infinite stack depth

  private listeners: Set<DialogListener> = new Set();
  private analyticsListeners: Set<AnalyticsListener> = new Set();
  private auditListeners: Set<AuditListener> = new Set();
  private confirmationResolvers: Map<string, (confirmed: boolean) => void> = new Map();

  private zIndexBase: number = 1000;
  private zIndexStep: number = 20;

  /**
   * Subscribe to stack changes
   */
  public subscribe(listener: DialogListener): () => void {
    this.listeners.add(listener);
    listener(this.getStackInstances());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to analytics events
   */
  public subscribeAnalytics(listener: AnalyticsListener): () => void {
    this.analyticsListeners.add(listener);
    return () => {
      this.analyticsListeners.delete(listener);
    };
  }

  /**
   * Subscribe to security audit records
   */
  public subscribeAudit(listener: AuditListener): () => void {
    this.auditListeners.add(listener);
    return () => {
      this.auditListeners.delete(listener);
    };
  }

  /**
   * Get all active dialog instances in stacking order
   */
  public getStackInstances(): DialogInstance[] {
    return this.stackOrder
      .map((id) => this.instances.get(id))
      .filter((inst): inst is DialogInstance => inst !== undefined);
  }

  /**
   * Get current top-most (active) dialog instance
   */
  public getActiveDialog(): DialogInstance | null {
    if (this.stackOrder.length === 0) return null;
    const topId = this.stackOrder[this.stackOrder.length - 1];
    return this.instances.get(topId) || null;
  }

  /**
   * Backward-compatible getActiveDialogs for ShowDialogOptions
   */
  public getActiveDialogs(): ShowDialogOptions[] {
    return this.getStackInstances().map((inst) => ({
      id: inst.id,
      titleEn: inst.props.titleEn,
      titleAr: inst.props.titleAr,
      subtitleEn: inst.props.subtitleEn,
      subtitleAr: inst.props.subtitleAr,
      isAr: inst.props.isAr,
      config: inst.config,
      actions: inst.props.actions,
      metadata: inst.props.metadata,
      children: inst.props.children,
    }));
  }

  /**
   * Primary method to open a dialog with full orchestration
   */
  public openDialog<TProps = any>(options: OpenDialogOptions<TProps>): string {
    const dialogId =
      options.id || `dlg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dialogType: DialogType = options.type || 'custom';
    const priority: DialogPriority = options.priority || 'normal';

    // Stack depth limit check
    if (this.stackOrder.length >= this.maxStackDepth) {
      console.warn(
        `[DialogManager] Maximum dialog stack depth of ${this.maxStackDepth} reached. Queueing or ignoring new dialog.`,
        dialogId
      );
      if (options.queueIfBusy) {
        return this.enqueueDialog(options);
      }
    }

    const registryEntry = DialogRegistry.get(dialogType);

    const instance: DialogInstance<TProps> = {
      id: dialogId,
      type: dialogType,
      parentId: options.parentId,
      module: options.module || options.metadata?.moduleName,
      entityType: options.entityType,
      entityId: options.entityId || options.metadata?.recordId,
      openTimestamp: Date.now(),
      priority,
      size: options.config?.size || registryEntry?.defaultSize || 'md',
      state: {
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        isFullscreen: false,
        isLoading: false,
        isDirty: false,
        activeStep: 1,
        totalSteps: 1,
        error: null,
        successMessage: null,
      },
      config: {
        id: dialogId,
        size: options.config?.size || registryEntry?.defaultSize || 'md',
        variant: options.config?.variant || (dialogType as any),
        animation: options.config?.animation || 'fade',
        closeOnEscape: options.config?.closeOnEscape ?? true,
        closeOnBackdropClick: options.config?.closeOnBackdropClick ?? true,
        showCloseButton: options.config?.showCloseButton ?? true,
        stickyHeader: options.config?.stickyHeader ?? true,
        stickyFooter: options.config?.stickyFooter ?? true,
        persistent: options.config?.persistent ?? false,
        zIndex: this.zIndexBase + (this.stackOrder.length + 1) * this.zIndexStep,
        ...options.config,
      },
      permissions: {
        requiredPermission: options.config?.requiredPermission,
        tenantId: options.metadata?.tenantId,
      },
      props: {
        ...options.props,
        titleEn: options.titleEn,
        titleAr: options.titleAr,
        subtitleEn: options.subtitleEn,
        subtitleAr: options.subtitleAr,
        statusBadge: options.statusBadge,
        icon: options.icon,
        actions: options.actions,
        metadata: options.metadata,
        isAr: options.isAr,
        component: options.component || registryEntry?.component,
      },
      onResult: options.onResult,
    };

    this.instances.set(dialogId, instance);

    // Maintain priority & stack order
    this.insertIntoStack(dialogId, priority);

    this.notifyListeners();

    this.emitAnalytics({
      dialogId,
      action: 'open',
      moduleName: instance.module,
      recordId: instance.entityId,
      timestamp: Date.now(),
    });

    this.emitAudit({
      dialogId,
      type: dialogType,
      action: 'OPEN',
      module: instance.module,
      entityType: instance.entityType,
      entityId: instance.entityId,
      tenantId: instance.permissions?.tenantId,
      timestamp: Date.now(),
    });

    return dialogId;
  }

  /**
   * Backward-compatible showDialog method
   */
  public showDialog(options: ShowDialogOptions): string {
    return this.openDialog({
      id: options.id,
      type: (options.config?.variant as DialogType) || 'custom',
      titleEn: options.titleEn,
      titleAr: options.titleAr,
      subtitleEn: options.subtitleEn,
      subtitleAr: options.subtitleAr,
      statusBadge: options.statusBadge,
      icon: options.icon,
      actions: options.actions,
      metadata: options.metadata,
      config: options.config,
      isAr: options.isAr,
      props: {
        children: options.children,
      },
      onResult: options.onResult,
    });
  }

  /**
   * Promise-based Dialog Invocation
   */
  public openDialogPromise<TData = any, TProps = any>(
    options: OpenDialogOptions<TProps>
  ): Promise<DialogResult<TData>> {
    return new Promise<DialogResult<TData>>((resolve, reject) => {
      const dialogId = this.openDialog({
        ...options,
        onResult: (result) => {
          if (options.onResult) options.onResult(result);
          resolve(result as DialogResult<TData>);
        },
      });

      const instance = this.instances.get(dialogId);
      if (instance) {
        instance.resolvePromise = resolve;
        instance.rejectPromise = reject;
      }
    });
  }

  /**
   * Close a specific dialog by ID
   */
  public closeDialog(
    dialogId: string,
    resultStatus: DialogResult['status'] = 'cancelled',
    data?: any
  ): void {
    const instance = this.instances.get(dialogId);
    if (!instance) return;

    const durationMs = Date.now() - instance.openTimestamp;
    const result: DialogResult = {
      dialogId,
      status: resultStatus,
      data,
      timestamp: Date.now(),
    };

    if (instance.onResult) {
      instance.onResult(result);
    }
    if (instance.resolvePromise) {
      instance.resolvePromise(result);
    }

    // Remove from stack and instances map
    this.stackOrder = this.stackOrder.filter((id) => id !== dialogId);
    this.instances.delete(dialogId);

    // Also close any child dialogs opened from this parent
    const childIds = Array.from(this.instances.values())
      .filter((inst) => inst.parentId === dialogId)
      .map((inst) => inst.id);

    childIds.forEach((childId) => this.closeDialog(childId, 'cancelled'));

    this.notifyListeners();

    this.emitAnalytics({
      dialogId,
      action: resultStatus === 'completed' ? 'submit' : 'close',
      durationMs,
      moduleName: instance.module,
      recordId: instance.entityId,
      timestamp: Date.now(),
    });

    this.emitAudit({
      dialogId,
      type: instance.type,
      action: 'CLOSE',
      module: instance.module,
      entityType: instance.entityType,
      entityId: instance.entityId,
      tenantId: instance.permissions?.tenantId,
      timestamp: Date.now(),
    });

    // Check if there are queued dialogs ready to pop
    this.processQueue();
  }

  /**
   * Close top-most / current active dialog
   */
  public closeCurrent(resultStatus: DialogResult['status'] = 'cancelled', data?: any): void {
    const active = this.getActiveDialog();
    if (active) {
      this.closeDialog(active.id, resultStatus, data);
    }
  }

  /**
   * Close all active dialogs
   */
  public closeAll(): void {
    const ids = [...this.stackOrder];
    ids.reverse().forEach((id) => this.closeDialog(id, 'cancelled'));
    this.queue = [];
  }

  /**
   * Replace active dialog with another dialog
   */
  public replaceDialog<TProps = any>(
    oldDialogId: string,
    newOptions: OpenDialogOptions<TProps>
  ): string {
    this.closeDialog(oldDialogId, 'dismissed');
    return this.openDialog(newOptions);
  }

  /**
   * Update props or state of an open dialog
   */
  public updateDialog(dialogId: string, updates: Partial<OpenDialogOptions>): void {
    const instance = this.instances.get(dialogId);
    if (!instance) return;

    if (updates.titleEn) instance.props.titleEn = updates.titleEn;
    if (updates.titleAr) instance.props.titleAr = updates.titleAr;
    if (updates.subtitleEn) instance.props.subtitleEn = updates.subtitleEn;
    if (updates.subtitleAr) instance.props.subtitleAr = updates.subtitleAr;
    if (updates.actions) instance.props.actions = updates.actions;
    if (updates.config) {
      instance.config = { ...instance.config, ...updates.config };
    }
    if (updates.props) {
      instance.props = { ...instance.props, ...updates.props };
    }

    this.notifyListeners();
  }

  /**
   * Minimize a dialog
   */
  public minimizeDialog(dialogId: string): void {
    const instance = this.instances.get(dialogId);
    if (instance) {
      instance.state.isMinimized = !instance.state.isMinimized;
      this.notifyListeners();
    }
  }

  /**
   * Maximize a dialog
   */
  public maximizeDialog(dialogId: string): void {
    const instance = this.instances.get(dialogId);
    if (instance) {
      instance.state.isMaximized = !instance.state.isMaximized;
      if (instance.state.isMaximized) instance.state.isFullscreen = false;
      this.notifyListeners();
    }
  }

  /**
   * Helper to trigger a standard Confirmation / Decision Dialog
   */
  public async showConfirmation(options: ConfirmationDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const dialogId = options.id || `confirm_${Date.now()}`;
      this.confirmationResolvers.set(dialogId, resolve);

      this.openDialog({
        id: dialogId,
        type: 'confirmation',
        priority: 'high',
        titleEn: options.titleEn,
        titleAr: options.titleAr,
        subtitleEn: options.messageEn,
        subtitleAr: options.messageAr,
        isAr: options.isAr,
        config: {
          size: 'sm',
          variant: 'confirmation',
          closeOnBackdropClick: false,
          closeOnEscape: true,
        },
        actions: [
          {
            id: 'cancel',
            labelEn: options.cancelLabelEn || 'Cancel',
            labelAr: options.cancelLabelAr || 'إلغاء',
            variant: 'ghost',
            onClick: () => {
              this.closeDialog(dialogId, 'cancelled');
              this.resolveConfirmation(dialogId, false);
              if (options.onCancel) options.onCancel();
            },
          },
          {
            id: 'confirm',
            labelEn:
              options.confirmLabelEn ||
              (options.type === 'danger' ? 'Confirm Action' : 'Confirm'),
            labelAr:
              options.confirmLabelAr ||
              (options.type === 'danger' ? 'تأكيد الإجراء' : 'تأكيد'),
            variant: options.type === 'danger' ? 'danger' : 'primary',
            onClick: async () => {
              if (options.onConfirm) {
                await options.onConfirm();
              }
              this.closeDialog(dialogId, 'completed');
              this.resolveConfirmation(dialogId, true);
            },
          },
        ],
      });
    });
  }

  /**
   * Clean dialogs belonging to a tenant context upon switch
   */
  public clearTenantDialogs(tenantId?: string): void {
    const idsToClose = Array.from(this.instances.values())
      .filter((inst) => !tenantId || inst.permissions?.tenantId === tenantId)
      .map((inst) => inst.id);

    idsToClose.forEach((id) => this.closeDialog(id, 'cancelled'));
  }

  /**
   * Enqueue a dialog to open when active stack clears
   */
  private enqueueDialog<TProps = any>(options: OpenDialogOptions<TProps>): string {
    const queueId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const registryEntry = DialogRegistry.get(options.type || 'custom');

    const instance: DialogInstance<TProps> = {
      id: options.id || `dlg_q_${Date.now()}`,
      type: options.type || 'custom',
      parentId: options.parentId,
      module: options.module,
      entityType: options.entityType,
      entityId: options.entityId,
      openTimestamp: Date.now(),
      priority: options.priority || 'normal',
      size: options.config?.size || registryEntry?.defaultSize || 'md',
      state: {
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        isFullscreen: false,
        isLoading: false,
        isDirty: false,
        error: null,
      },
      config: {
        id: options.id || `dlg_q_${Date.now()}`,
        size: options.config?.size || registryEntry?.defaultSize || 'md',
        ...options.config,
      },
      props: options.props as any,
    };

    this.queue.push({
      queueId,
      instance,
      priority: options.priority || 'normal',
      enqueuedAt: Date.now(),
    });

    // Sort queue by priority
    this.queue.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));

    return queueId;
  }

  /**
   * Process and pop item from dialog queue if room available
   */
  private processQueue() {
    if (this.isQueuePaused || this.queue.length === 0) return;
    if (this.stackOrder.length < this.maxStackDepth) {
      const nextItem = this.queue.shift();
      if (nextItem) {
        this.openDialog({
          id: nextItem.instance.id,
          type: nextItem.instance.type,
          priority: nextItem.priority,
          props: nextItem.instance.props,
          config: nextItem.instance.config,
        });
      }
    }
  }

  /**
   * Insert dialog ID into stack maintaining priority
   */
  private insertIntoStack(dialogId: string, priority: DialogPriority) {
    if (this.stackOrder.includes(dialogId)) return;

    // Normal dialogs push to end. High/Critical/System insert appropriately
    const priorityScore = this.getPriorityScore(priority);
    let insertIdx = this.stackOrder.length;

    for (let i = 0; i < this.stackOrder.length; i++) {
      const existingInst = this.instances.get(this.stackOrder[i]);
      if (existingInst && this.getPriorityScore(existingInst.priority) < priorityScore) {
        insertIdx = i;
        break;
      }
    }

    this.stackOrder.splice(insertIdx, 0, dialogId);
  }

  private getPriorityScore(priority: DialogPriority): number {
    switch (priority) {
      case 'system':
        return 4;
      case 'critical':
        return 3;
      case 'high':
        return 2;
      case 'normal':
      default:
        return 1;
    }
  }

  private resolveConfirmation(dialogId: string, confirmed: boolean) {
    const resolver = this.confirmationResolvers.get(dialogId);
    if (resolver) {
      resolver(confirmed);
      this.confirmationResolvers.delete(dialogId);
    }
  }

  private notifyListeners() {
    const instances = this.getStackInstances();
    this.listeners.forEach((listener) => listener(instances));
  }

  private emitAnalytics(event: DialogAnalyticsEvent) {
    this.analyticsListeners.forEach((listener) => listener(event));
  }

  private emitAudit(record: DialogAuditRecord) {
    this.auditListeners.forEach((listener) => listener(record));
  }
}

export const DialogManagerService = new DialogManagerServiceClass();
