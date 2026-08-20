/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Domain Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

export type NotificationCategory =
  | 'SYSTEM'
  | 'SECURITY'
  | 'WORKFLOW'
  | 'SHIPMENT'
  | 'QUOTE'
  | 'CUSTOMER'
  | 'FINANCE'
  | 'PAYMENT'
  | 'INVOICE'
  | 'WAREHOUSE'
  | 'TRANSPORTATION'
  | 'DOCUMENT'
  | 'COMPLIANCE'
  | 'INTEGRATION'
  | 'MAINTENANCE';

export type NotificationSeverity =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL';

export type NotificationActionType =
  | 'OPEN_ENTITY'
  | 'OPEN_ROUTE'
  | 'OPEN_DRAWER'
  | 'OPEN_DIALOG'
  | 'DOWNLOAD_DOCUMENT'
  | 'RETRY'
  | 'APPROVE'
  | 'REVIEW';

export interface NotificationAction {
  id?: string;
  type: NotificationActionType;
  labelEn?: string;
  labelAr?: string;
  entityType?: string;
  entityId?: string;
  route?: string;
  drawerId?: string;
  payload?: Record<string, any>;
}

export interface NotificationContract {
  id: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  recipientId?: string;
  recipientRole?: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  type: string; // e.g. 'shipment.departure_delayed', 'quote.approved', 'document.uploaded'
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  localizationKey?: string;
  localizationParams?: Record<string, any>;
  entityType?: string;
  entityId?: string;
  action?: NotificationAction;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  expiresAt?: string | null;
  source?: 'SYSTEM' | 'USER_ACTION' | 'DOMAIN_EVENT' | 'INTEGRATION' | 'SCHEDULED_JOB' | 'SECURITY_EVENT';
}

export interface NotificationPreferencesContract {
  recipientId: string;
  channels: {
    IN_APP: boolean;
    EMAIL: boolean;
    SMS: boolean;
    PUSH: boolean;
    WEBHOOK: boolean;
  };
  categoryPreferences: Record<NotificationCategory, boolean>;
  severityThreshold: NotificationSeverity;
}

export interface NotificationFilterOptions {
  category?: NotificationCategory | 'ALL';
  severity?: NotificationSeverity | 'ALL';
  isRead?: boolean;
  searchQuery?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}

export interface NotificationQueryResult {
  notifications: NotificationContract[];
  totalCount: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}
