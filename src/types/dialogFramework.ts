/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Dialog System Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog System Foundation
 * Version: 1.0
 */

import React from 'react';

/**
 * Supported Dialog Sizes across the platform
 */
export type DialogSize =
  | 'xs'          // 320px
  | 'sm'          // 440px
  | 'md'          // 560px
  | 'lg'          // 720px
  | 'xl'          // 960px
  | 'fullWidth'   // 1200px
  | 'fullscreen'  // 100vw x 100vh
  | 'auto'        // Content-driven width
  | 'responsive';  // Mobile 100%, Desktop 720px

/**
 * Functional Variants of Dialogs
 */
export type DialogVariant =
  | 'standard'
  | 'confirmation'
  | 'alert'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'fullscreen'
  | 'responsive'
  | 'scrollable'
  | 'nested'
  | 'persistent'
  | 'wizard'
  | 'preview'
  | 'form'
  | 'lookup'
  | 'media'
  | 'ai'
  | 'workflow';

/**
 * Motion Animation Patterns
 */
export type DialogAnimation = 'fade' | 'scale' | 'slide' | 'zoom' | 'drawer' | 'none';

/**
 * Action Button Definition in Footer/Toolbar
 */
export interface DialogAction {
  id: string;
  labelEn: string;
  labelAr: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
  onClick?: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  isDismiss?: boolean;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}

/**
 * Header & System Metadata
 */
export interface DialogMetadata {
  recordId?: string;
  moduleName?: string;
  workflowStatus?: string;
  breadcrumbs?: string[];
  documentationUrl?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  tenantId?: string;
  classification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

/**
 * Status Badge for Header
 */
export interface DialogStatusBadge {
  labelEn: string;
  labelAr: string;
  variant?: 'info' | 'warning' | 'success' | 'danger' | 'neutral' | 'amber';
}

/**
 * Internal Dialog State
 */
export interface DialogState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  isDirty: boolean;
  activeStep?: number;
  totalSteps?: number;
  error?: string | null;
  successMessage?: string | null;
}

/**
 * Global Configuration for Dialog Behavior
 */
export interface DialogConfiguration {
  id: string;
  size?: DialogSize;
  variant?: DialogVariant;
  animation?: DialogAnimation;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  showHelpButton?: boolean;
  showMinimizeButton?: boolean;
  showMaximizeButton?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  persistent?: boolean;
  reducedMotion?: boolean;
  requiredPermission?: string;
  zIndex?: number;
}

/**
 * Main Dialog Component Props
 */
export interface DialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  statusBadge?: DialogStatusBadge;
  icon?: React.ReactNode;
  actions?: DialogAction[];
  metadata?: DialogMetadata;
  config?: Partial<DialogConfiguration>;
  state?: Partial<DialogState>;
  isAr?: boolean;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onStateChange?: (state: Partial<DialogState>) => void;
}

/**
 * Programmatic Dialog Options
 */
export interface ShowDialogOptions extends Omit<DialogProps, 'isOpen' | 'onClose'> {
  id: string;
  onResult?: (result: DialogResult) => void;
}

/**
 * Confirmation Dialog Specific Options
 */
export interface ConfirmationDialogOptions {
  id?: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type?: 'confirm' | 'danger' | 'warning' | 'info' | 'success';
  confirmLabelEn?: string;
  confirmLabelAr?: string;
  cancelLabelEn?: string;
  cancelLabelAr?: string;
  requireExplicitWord?: string; // e.g., require user to type 'DELETE'
  isAr?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Result returned upon Dialog resolution
 */
export interface DialogResult<T = any> {
  dialogId: string;
  status: 'completed' | 'cancelled' | 'rejected' | 'failed' | 'dismissed';
  data?: T;
  timestamp: number;
}

/**
 * Dialog Analytics Interaction Event
 */
export interface DialogAnalyticsEvent {
  dialogId: string;
  action: 'open' | 'close' | 'submit' | 'cancel' | 'minimize' | 'maximize' | 'error' | 'step_change';
  durationMs?: number;
  moduleName?: string;
  recordId?: string;
  timestamp: number;
}
