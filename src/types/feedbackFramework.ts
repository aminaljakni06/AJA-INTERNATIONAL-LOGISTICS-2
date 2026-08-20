/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Feedback & Toast Framework Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'progress'
  | 'undo';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export type AlertSeverity =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'critical'
  | 'maintenance'
  | 'emergency';

export type AlertVariant =
  | 'inline'
  | 'section'
  | 'global'
  | 'sticky'
  | 'banner';

export type ConfirmationCategory =
  | 'delete'
  | 'archive'
  | 'restore'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'cancel'
  | 'logout'
  | 'reset'
  | 'import'
  | 'export'
  | 'sync'
  | 'sensitive';

export type AIFeedbackStatus =
  | 'thinking'
  | 'generating'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'rate_limited'
  | 'provider_unavailable'
  | 'provider_switched';

export type IntegrationFeedbackStatus =
  | 'connected'
  | 'disconnected'
  | 'sync_complete'
  | 'sync_failed'
  | 'webhook_received'
  | 'import_complete'
  | 'export_complete'
  | 'connection_lost'
  | 'connection_restored';

export interface FeedbackAction {
  id: string;
  labelEn: string;
  labelAr: string;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export interface FeedbackMetadata {
  module?: string;
  correlationId?: string;
  timestamp?: string;
  userId?: string;
  companyId?: string;
  code?: string;
  helpUrl?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  titleEn: string;
  titleAr: string;
  messageEn?: string;
  messageAr?: string;
  durationMs?: number; // default 5000ms, 0 = persistent
  position?: ToastPosition;
  progressPercent?: number;
  dismissible?: boolean;
  actions?: FeedbackAction[];
  meta?: FeedbackMetadata;
  undoCallback?: () => void | Promise<void>;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  variant: AlertVariant;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  dismissible?: boolean;
  expandable?: boolean;
  expandedDetailsEn?: string;
  expandedDetailsAr?: string;
  actions?: FeedbackAction[];
  meta?: FeedbackMetadata;
}

export interface ConfirmationConfig {
  id?: string;
  category: ConfirmationCategory;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  confirmLabelEn?: string;
  confirmLabelAr?: string;
  cancelLabelEn?: string;
  cancelLabelAr?: string;
  isDangerous?: boolean;
  requireTypedText?: string; // e.g. require typing 'DELETE'
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ProgressFeedbackItem {
  id: string;
  titleEn: string;
  titleAr: string;
  percent: number; // 0 to 100
  statusTextEn?: string;
  statusTextAr?: string;
  isIndeterminate?: boolean;
  category: 'upload' | 'download' | 'import' | 'export' | 'background_task' | 'ai' | 'sync';
  cancelable?: boolean;
  onCancel?: () => void;
}

export interface NotificationPreference {
  category: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
  soundEnabled: boolean;
}
