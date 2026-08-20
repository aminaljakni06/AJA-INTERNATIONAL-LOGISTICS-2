/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer System Types & Framework Contracts
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import React from 'react';

/**
 * Supported Enterprise Drawer Types
 */
export type DrawerType =
  | 'standard'
  | 'detail'
  | 'form'
  | 'filter'
  | 'inspector'
  | 'navigation'
  | 'context'
  | 'workflow'
  | 'attachment'
  | 'custom';

/**
 * Drawer Screen Alignment Position
 */
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Standardized Drawer Width / Height Dimensions
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullWidth';

/**
 * Lifecycle and Display Status States
 */
export type DrawerStatusState =
  | 'opening'
  | 'open'
  | 'closing'
  | 'closed'
  | 'minimized'
  | 'maximized'
  | 'loading'
  | 'error';

/**
 * Priority Level for Drawer Display and Focus Trapping
 */
export type DrawerPriority = 'normal' | 'high' | 'critical' | 'system';

/**
 * Footer Action Button Configuration
 */
export interface DrawerAction {
  id: string;
  labelEn: string;
  labelAr?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  icon?: React.ReactNode;
  onClick: (drawerId: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  permission?: string;
}

/**
 * Audit & Contextual Metadata Attachment
 */
export interface DrawerMetadata {
  moduleName?: string;
  recordId?: string;
  entityType?: string;
  tenantId?: string;
  createdBy?: string;
  timestamp?: number;
  correlationId?: string;
  customFlags?: Record<string, any>;
}

/**
 * Dynamic Drawer UI State Trackers
 */
export interface DrawerState {
  isOpen: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isLoading?: boolean;
  isDirty?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

/**
 * Behavioral and Aesthetic Configuration
 */
export interface DrawerConfiguration {
  id: string;
  position?: DrawerPosition;
  size?: DrawerSize;
  modal?: boolean; // If true, renders dark backdrop and blocks page interaction
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  resizable?: boolean;
  minSizePx?: number;
  maxSizePx?: number;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  showCloseButton?: boolean;
  zIndex?: number;
  requiredPermission?: string;
  customWidth?: string;
}

/**
 * Runtime Drawer Instance State & Properties
 */
export interface DrawerInstance<TProps = any> {
  id: string;
  type: DrawerType;
  parentId?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  openTimestamp: number;
  priority: DrawerPriority;
  position: DrawerPosition;
  size: DrawerSize;
  state: DrawerState;
  config: DrawerConfiguration;
  permissions?: {
    requiredPermission?: string;
    tenantId?: string;
    role?: string;
  };
  props: TProps;
  onResult?: (result: DrawerResult) => void;
  resolvePromise?: (result: DrawerResult) => void;
  rejectPromise?: (reason: any) => void;
}

/**
 * Result Payload Returned Upon Drawer Close
 */
export interface DrawerResult<TData = any> {
  drawerId: string;
  status: 'completed' | 'cancelled' | 'dismissed' | 'error';
  data?: TData;
  timestamp: number;
}

/**
 * Options for Programmatic Drawer Invocation
 */
export interface OpenDrawerOptions<TProps = any> {
  id?: string;
  type?: DrawerType;
  parentId?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  priority?: DrawerPriority;
  position?: DrawerPosition;
  size?: DrawerSize;
  props?: TProps;
  component?: React.ComponentType<any>;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon?: React.ReactNode;
  actions?: DrawerAction[];
  metadata?: DrawerMetadata;
  config?: Partial<DrawerConfiguration>;
  isAr?: boolean;
  onResult?: (result: DrawerResult) => void;
}

/**
 * Registry Mapping Entry
 */
export interface DrawerRegistryEntry {
  type: DrawerType;
  component: React.ComponentType<any>;
  defaultPosition?: DrawerPosition;
  defaultSize?: DrawerSize;
  defaultPriority?: DrawerPriority;
  isLazy?: boolean;
  permission?: string;
}

/**
 * Global Drawer Manager Summary State
 */
export interface DrawerManagerState {
  instances: DrawerInstance[];
  activeDrawerId: string | null;
  activeCount: number;
  registeredTypes: DrawerType[];
}

/**
 * Direct React Props for Drawer UI Components
 */
export type DrawerDensity = 'comfortable' | 'compact' | 'spacious';

export interface DrawerHeaderProps {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon?: React.ReactNode;
  statusBadge?: {
    labelEn: string;
    labelAr?: string;
    variant?: 'active' | 'pending' | 'draft' | 'approved' | 'rejected' | 'cancelled' | 'info' | 'success' | 'warning' | 'danger' | 'completed';
  };
  headerActions?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  isAr?: boolean;
  className?: string;
  density?: DrawerDensity;
}

export interface DrawerToolbarProps {
  children: React.ReactNode;
  className?: string;
  isAr?: boolean;
  density?: DrawerDensity;
}

export interface DrawerBodyProps {
  isLoading?: boolean;
  loadingMessageEn?: string;
  loadingMessageAr?: string;
  error?: string | null;
  errorMessageEn?: string;
  errorMessageAr?: string;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitleEn?: string;
  emptyTitleAr?: string;
  emptyDescEn?: string;
  emptyDescAr?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: {
    labelEn: string;
    labelAr?: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  className?: string;
  density?: DrawerDensity;
  isAr?: boolean;
}

export interface DrawerFooterProps {
  actions?: DrawerAction[];
  primaryAction?: DrawerAction;
  secondaryAction?: DrawerAction;
  cancelAction?: DrawerAction;
  customContent?: React.ReactNode;
  sticky?: boolean;
  isAr?: boolean;
  className?: string;
  density?: DrawerDensity;
}

export interface DrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  position?: DrawerPosition;
  size?: DrawerSize;
  density?: DrawerDensity;
  icon?: React.ReactNode;
  actions?: DrawerAction[];
  metadata?: DrawerMetadata;
  config?: DrawerConfiguration;
  state?: DrawerState;
  isAr?: boolean;
  children?: React.ReactNode;
}
