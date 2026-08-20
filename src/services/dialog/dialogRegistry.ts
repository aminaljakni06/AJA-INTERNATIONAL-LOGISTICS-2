/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Dialog Registry
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import React from 'react';
import { DialogType, DialogRegistryEntry } from '../../types/dialogOrchestrationFramework';
import { EnterpriseConfirmationDialog } from '../../components/dialog/EnterpriseConfirmationDialog';
import { EnterpriseAlertDialog } from '../../components/dialog/EnterpriseAlertDialog';
import { EnterpriseFormDialog } from '../../components/dialog/EnterpriseFormDialog';
import { EnterpriseEntityDialog } from '../../components/dialog/EnterpriseEntityDialog';
import { EnterpriseWizardDialog } from '../../components/dialog/EnterpriseWizardDialog';
import { EnterpriseMediaPreviewDialog } from '../../components/dialog/EnterpriseMediaPreviewDialog';
import { EnterpriseAttachmentDialog } from '../../components/dialog/EnterpriseAttachmentDialog';
import { EnterpriseApprovalDialog } from '../../components/dialog/EnterpriseApprovalDialog';
import { EnterpriseWorkflowDialog } from '../../components/dialog/EnterpriseWorkflowDialog';
import { EnterpriseProtectedActionDialog } from '../../components/dialog/EnterpriseProtectedActionDialog';
import { EnterpriseQuickViewDialog } from '../../components/dialog/EnterpriseQuickViewDialog';
import { EnterpriseDecisionDialog } from '../../components/dialog/EnterpriseDecisionDialog';

class DialogRegistryClass {
  private registry: Map<DialogType, DialogRegistryEntry> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Register default enterprise dialog components
   */
  private registerDefaults() {
    this.register({
      type: 'confirmation',
      component: EnterpriseConfirmationDialog,
      defaultSize: 'sm',
      defaultPriority: 'high',
    });

    this.register({
      type: 'decision',
      component: EnterpriseDecisionDialog,
      defaultSize: 'md',
      defaultPriority: 'high',
    });

    this.register({
      type: 'alert',
      component: EnterpriseAlertDialog,
      defaultSize: 'sm',
      defaultPriority: 'critical',
    });

    this.register({
      type: 'form',
      component: EnterpriseFormDialog,
      defaultSize: 'lg',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'entity',
      component: EnterpriseEntityDialog,
      defaultSize: 'xl',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'wizard',
      component: EnterpriseWizardDialog,
      defaultSize: 'xl',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'media',
      component: EnterpriseMediaPreviewDialog,
      defaultSize: 'fullWidth',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'attachment',
      component: EnterpriseAttachmentDialog,
      defaultSize: 'xl',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'approval',
      component: EnterpriseApprovalDialog,
      defaultSize: 'md',
      defaultPriority: 'high',
    });

    this.register({
      type: 'workflow',
      component: EnterpriseWorkflowDialog,
      defaultSize: 'lg',
      defaultPriority: 'normal',
    });

    this.register({
      type: 'protectedAction',
      component: EnterpriseProtectedActionDialog,
      defaultSize: 'md',
      defaultPriority: 'high',
    });

    this.register({
      type: 'quickView',
      component: EnterpriseQuickViewDialog,
      defaultSize: 'lg',
      defaultPriority: 'normal',
    });
  }

  /**
   * Register a new or custom dialog component
   */
  public register(entry: DialogRegistryEntry): void {
    this.registry.set(entry.type, entry);
  }

  /**
   * Get registered entry for a given dialog type
   */
  public get(type: DialogType): DialogRegistryEntry | undefined {
    return this.registry.get(type);
  }

  /**
   * Check if a type is registered
   */
  public has(type: DialogType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered dialog types
   */
  public getRegisteredTypes(): DialogType[] {
    return Array.from(this.registry.keys());
  }
}

export const DialogRegistry = new DialogRegistryClass();
