/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Manager & Orchestration Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import React from 'react';
import {
  DialogSize,
  DialogVariant,
  DialogAnimation,
  DialogAction,
  DialogMetadata,
  DialogStatusBadge,
  DialogState,
  DialogConfiguration,
  DialogProps,
  DialogResult,
  DialogAnalyticsEvent,
  ConfirmationDialogOptions,
} from './dialogFramework';

/**
 * Supported Dialog Types in Registry
 */
export type DialogType =
  | 'confirmation'
  | 'decision'
  | 'alert'
  | 'form'
  | 'entity'
  | 'wizard'
  | 'lookup'
  | 'media'
  | 'document'
  | 'attachment'
  | 'workflow'
  | 'approval'
  | 'protectedAction'
  | 'quickView'
  | 'custom';

/**
 * Priority Hierarchy for Dialog Display & Focus
 */
export type DialogPriority = 'normal' | 'high' | 'critical' | 'system';

/**
 * Runtime Dialog Instance Metadata & State
 */
export interface DialogInstance<TProps = any> {
  id: string;
  type: DialogType;
  parentId?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  mode?: 'create' | 'edit' | 'view' | 'approve' | 'inspect';
  openTimestamp: number;
  priority: DialogPriority;
  size: DialogSize;
  position?: { x: number; y: number };
  state: DialogState;
  config: DialogConfiguration;
  permissions?: {
    requiredPermission?: string;
    tenantId?: string;
    role?: string;
  };
  props: TProps;
  onResult?: (result: DialogResult) => void;
  resolvePromise?: (result: DialogResult) => void;
  rejectPromise?: (reason: any) => void;
}

/**
 * Stack Management State
 */
export interface DialogStack {
  instances: Map<string, DialogInstance>;
  stackOrder: string[]; // Order of dialog IDs from bottom to top
  activeDialogId: string | null;
  maxDepth: number;
  zIndexMap: Map<string, number>;
}

/**
 * Dialog Queue Item Definition
 */
export interface DialogQueueItem {
  queueId: string;
  instance: DialogInstance;
  priority: DialogPriority;
  enqueuedAt: number;
}

/**
 * Dialog Registry Mapping Contract
 */
export interface DialogRegistryEntry {
  type: DialogType;
  component: React.ComponentType<any>;
  defaultSize?: DialogSize;
  defaultPriority?: DialogPriority;
  isLazy?: boolean;
}

/**
 * Global Dialog Manager State Summary
 */
export interface DialogManagerState {
  stack: DialogStack;
  queue: DialogQueueItem[];
  isQueuePaused: boolean;
  activeCount: number;
  registeredTypes: DialogType[];
}

/**
 * Extended Programmatic Dialog Launch Options
 */
export interface OpenDialogOptions<TProps = any> {
  id?: string;
  type?: DialogType;
  parentId?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  priority?: DialogPriority;
  props?: TProps;
  component?: React.ComponentType<any>;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  statusBadge?: DialogStatusBadge;
  icon?: React.ReactNode;
  actions?: DialogAction[];
  metadata?: DialogMetadata;
  config?: Partial<DialogConfiguration>;
  isAr?: boolean;
  queueIfBusy?: boolean;
  onResult?: (result: DialogResult) => void;
}

/**
 * Audit Trail Record for Dialog Operations
 */
export interface DialogAuditRecord {
  dialogId: string;
  type: DialogType;
  action: 'OPEN' | 'CLOSE' | 'REPLACE' | 'MINIMIZE' | 'MAXIMIZE' | 'QUEUE' | 'CANCEL';
  module?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  tenantId?: string;
  timestamp: number;
  correlationId?: string;
}
