/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Drawer Manager Service
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import {
  DrawerType,
  DrawerPriority,
  DrawerInstance,
  OpenDrawerOptions,
  DrawerResult,
  DrawerManagerState,
  DrawerPosition,
  DrawerSize,
} from '../../types/drawerFramework';
import { DrawerRegistry } from './drawerRegistry';

type DrawerListener = (instances: DrawerInstance[]) => void;

class DrawerManagerServiceClass {
  private instances: Map<string, DrawerInstance> = new Map();
  private stackOrder: string[] = []; // Array of drawer IDs in order from bottom to top
  private listeners: Set<DrawerListener> = new Set();
  private maxStackDepth: number = 5;

  private zIndexBase: number = 900;
  private zIndexStep: number = 15;

  /**
   * Subscribe to drawer stack updates
   */
  public subscribe(listener: DrawerListener): () => void {
    this.listeners.add(listener);
    listener(this.getStackInstances());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all active drawer instances in stacking order
   */
  public getStackInstances(): DrawerInstance[] {
    return this.stackOrder
      .map((id) => this.instances.get(id))
      .filter((inst): inst is DrawerInstance => inst !== undefined);
  }

  /**
   * Get top-most active drawer
   */
  public getActiveDrawer(): DrawerInstance | null {
    if (this.stackOrder.length === 0) return null;
    const topId = this.stackOrder[this.stackOrder.length - 1];
    return this.instances.get(topId) || null;
  }

  /**
   * Primary method to open a drawer
   */
  public openDrawer<TProps = any>(options: OpenDrawerOptions<TProps>): string {
    const drawerId =
      options.id || `drw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const drawerType: DrawerType = options.type || 'standard';
    const priority: DrawerPriority = options.priority || 'normal';

    if (this.stackOrder.length >= this.maxStackDepth) {
      console.warn(
        `[DrawerManager] Maximum drawer stack depth of ${this.maxStackDepth} reached.`,
        drawerId
      );
    }

    const registryEntry = DrawerRegistry.get(drawerType);

    const position: DrawerPosition =
      options.position || options.config?.position || registryEntry?.defaultPosition || 'right';
    const size: DrawerSize =
      options.size || options.config?.size || registryEntry?.defaultSize || 'md';

    const instance: DrawerInstance<TProps> = {
      id: drawerId,
      type: drawerType,
      parentId: options.parentId,
      module: options.module || options.metadata?.moduleName,
      entityType: options.entityType,
      entityId: options.entityId || options.metadata?.recordId,
      openTimestamp: Date.now(),
      priority,
      position,
      size,
      state: {
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        isLoading: false,
        isDirty: false,
        error: null,
        successMessage: null,
      },
      config: {
        id: drawerId,
        position,
        size,
        modal: options.config?.modal ?? true,
        dismissible: options.config?.dismissible ?? true,
        closeOnEscape: options.config?.closeOnEscape ?? true,
        closeOnOutsideClick: options.config?.closeOnOutsideClick ?? true,
        showCloseButton: options.config?.showCloseButton ?? true,
        stickyHeader: options.config?.stickyHeader ?? true,
        stickyFooter: options.config?.stickyFooter ?? true,
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
        descriptionEn: options.descriptionEn,
        descriptionAr: options.descriptionAr,
        icon: options.icon,
        actions: options.actions,
        metadata: options.metadata,
        isAr: options.isAr,
        component: options.component || registryEntry?.component,
      },
      onResult: options.onResult,
    };

    this.instances.set(drawerId, instance);
    this.stackOrder.push(drawerId);

    this.notifyListeners();
    return drawerId;
  }

  /**
   * Promise-based Drawer invocation
   */
  public openDrawerPromise<TData = any, TProps = any>(
    options: OpenDrawerOptions<TProps>
  ): Promise<DrawerResult<TData>> {
    return new Promise<DrawerResult<TData>>((resolve, reject) => {
      const drawerId = this.openDrawer({
        ...options,
        onResult: (result) => {
          if (options.onResult) options.onResult(result);
          resolve(result as DrawerResult<TData>);
        },
      });

      const instance = this.instances.get(drawerId);
      if (instance) {
        instance.resolvePromise = resolve;
        instance.rejectPromise = reject;
      }
    });
  }

  /**
   * Close specific drawer by ID
   */
  public closeDrawer(
    drawerId: string,
    resultStatus: DrawerResult['status'] = 'cancelled',
    data?: any
  ): void {
    const instance = this.instances.get(drawerId);
    if (!instance) return;

    const result: DrawerResult = {
      drawerId,
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

    this.stackOrder = this.stackOrder.filter((id) => id !== drawerId);
    this.instances.delete(drawerId);

    // Also close child drawers
    const childIds = Array.from(this.instances.values())
      .filter((inst) => inst.parentId === drawerId)
      .map((inst) => inst.id);

    childIds.forEach((childId) => this.closeDrawer(childId, 'cancelled'));

    this.notifyListeners();
  }

  /**
   * Close top-most / current active drawer
   */
  public closeCurrent(resultStatus: DrawerResult['status'] = 'cancelled', data?: any): void {
    const active = this.getActiveDrawer();
    if (active) {
      this.closeDrawer(active.id, resultStatus, data);
    }
  }

  /**
   * Close all active drawers
   */
  public closeAll(): void {
    const ids = [...this.stackOrder];
    ids.reverse().forEach((id) => this.closeDrawer(id, 'cancelled'));
  }

  /**
   * Replace an active drawer
   */
  public replaceDrawer<TProps = any>(
    oldDrawerId: string,
    newOptions: OpenDrawerOptions<TProps>
  ): string {
    this.closeDrawer(oldDrawerId, 'dismissed');
    return this.openDrawer(newOptions);
  }

  /**
   * Update open drawer properties
   */
  public updateDrawer(drawerId: string, updates: Partial<OpenDrawerOptions>): void {
    const instance = this.instances.get(drawerId);
    if (!instance) return;

    if (updates.titleEn) instance.props.titleEn = updates.titleEn;
    if (updates.titleAr) instance.props.titleAr = updates.titleAr;
    if (updates.descriptionEn) instance.props.descriptionEn = updates.descriptionEn;
    if (updates.descriptionAr) instance.props.descriptionAr = updates.descriptionAr;
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
   * Clear drawers belonging to a tenant upon context switch
   */
  public clearTenantDrawers(tenantId?: string): void {
    const idsToClose = Array.from(this.instances.values())
      .filter((inst) => !tenantId || inst.permissions?.tenantId === tenantId)
      .map((inst) => inst.id);

    idsToClose.forEach((id) => this.closeDrawer(id, 'cancelled'));
  }

  private notifyListeners() {
    const instances = this.getStackInstances();
    this.listeners.forEach((listener) => listener(instances));
  }
}

export const DrawerManagerService = new DrawerManagerServiceClass();
