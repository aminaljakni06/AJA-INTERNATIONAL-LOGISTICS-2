/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Service Engine
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

import {
  NotificationContract,
  NotificationCategory,
  NotificationSeverity,
  NotificationFilterOptions,
  NotificationQueryResult,
  NotificationPreferencesContract,
} from '../types/notificationFramework';
import { NotificationItem } from '../types/sharedServices';

type NotificationListener = (items: NotificationContract[]) => void;

class EnterpriseNotificationService {
  private notifications: NotificationContract[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private storageKey = 'aja_enterprise_notifications';

  constructor() {
    this.loadFromStorage();
    if (this.notifications.length === 0) {
      this.seedInitialNotifications();
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.notifications = JSON.parse(saved);
        }
      }
    } catch {
      this.notifications = [];
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
      }
    } catch {
      // Safe fallback
    }
  }

  private seedInitialNotifications(): void {
    const now = new Date();
    this.notifications = [
      {
        id: 'notif_init_1',
        category: 'SHIPMENT',
        severity: 'INFO',
        type: 'shipment.arrived',
        titleEn: 'Shipment #SHP-2026-8901 Arrived at Port',
        titleAr: 'وصلت الشحنة رقم #SHP-2026-8901 إلى الميناء',
        messageEn: 'Vessel MSC LORETTO has docked at Jeddah Islamic Port.',
        messageAr: 'رست السفينة MSC LORETTO في ميناء جدة الإسلامي.',
        entityType: 'SHIPMENT',
        entityId: 'SHP-2026-8901',
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
        action: {
          type: 'OPEN_ENTITY',
          entityType: 'SHIPMENT',
          entityId: 'SHP-2026-8901',
          labelEn: 'View Shipment',
          labelAr: 'عرض الشحنة',
        },
        source: 'DOMAIN_EVENT',
      },
      {
        id: 'notif_init_2',
        category: 'QUOTE',
        severity: 'SUCCESS',
        titleEn: 'Freight Quote #QT-9921 Approved',
        titleAr: 'تم قبول عرض سعر الشحن #QT-9921',
        messageEn: 'Customer SABIC accepted the air freight proposal.',
        messageAr: 'وافق العميل سابك على عرض الشحن الجوي.',
        type: 'quote.approved',
        entityType: 'QUOTE',
        entityId: 'QT-9921',
        isRead: false,
        createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
        action: {
          type: 'OPEN_ENTITY',
          entityType: 'QUOTE',
          entityId: 'QT-9921',
          labelEn: 'Review Quote',
          labelAr: 'مراجعة العرض',
        },
        source: 'USER_ACTION',
      },
      {
        id: 'notif_init_3',
        category: 'COMPLIANCE',
        severity: 'WARNING',
        type: 'document.expired',
        titleEn: 'Customs Declaration Document Expiring',
        titleAr: 'وثيقة البيان الجمركي تقترب من انتهاء الصلاحية',
        messageEn: 'Declaration #DEC-4402 requires re-validation within 48 hours.',
        messageAr: 'البيان رقم #DEC-4402 يتطلب إعادة تحسين الصلاحية خلال 48 ساعة.',
        entityType: 'DOCUMENT',
        entityId: 'DEC-4402',
        isRead: true,
        createdAt: new Date(now.getTime() - 120 * 60000).toISOString(),
        action: {
          type: 'DOWNLOAD_DOCUMENT',
          entityType: 'DOCUMENT',
          entityId: 'DEC-4402',
          labelEn: 'Inspect Doc',
          labelAr: 'معاينة الوثيقة',
        },
        source: 'SCHEDULED_JOB',
      },
    ];
    this.saveToStorage();
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.notifications]));
    this.saveToStorage();
  }

  public dispatch(
    item: Omit<NotificationContract, 'id' | 'createdAt' | 'isRead'> & { id?: string; createdAt?: string }
  ): NotificationContract {
    const newItem: NotificationContract = {
      ...item,
      id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: item.category || 'SYSTEM',
      severity: item.severity || 'INFO',
      type: item.type || 'system.general',
      titleEn: item.titleEn,
      titleAr: item.titleAr,
      messageEn: item.messageEn,
      messageAr: item.messageAr,
      isRead: false,
      createdAt: item.createdAt || new Date().toISOString(),
      source: item.source || 'SYSTEM',
    };

    this.notifications = [newItem, ...this.notifications];
    this.notify();
    return newItem;
  }

  public markAsRead(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item && !item.isRead) {
      item.isRead = true;
      item.readAt = new Date().toISOString();
      this.notify();
    }
  }

  public markAsUnread(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item && item.isRead) {
      item.isRead = false;
      item.readAt = null;
      this.notify();
    }
  }

  public markAllAsRead(): void {
    const now = new Date().toISOString();
    this.notifications = this.notifications.map((n) => ({
      ...n,
      isRead: true,
      readAt: n.readAt || now,
    }));
    this.notify();
  }

  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.notifications = [];
    this.notify();
  }

  public query(options: NotificationFilterOptions = {}): NotificationQueryResult {
    let filtered = [...this.notifications];

    if (options.category && options.category !== 'ALL') {
      filtered = filtered.filter((n) => n.category === options.category);
    }

    if (options.severity && options.severity !== 'ALL') {
      filtered = filtered.filter((n) => n.severity === options.severity);
    }

    if (options.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === options.isRead);
    }

    if (options.entityType) {
      filtered = filtered.filter((n) => n.entityType === options.entityType);
    }

    if (options.entityId) {
      filtered = filtered.filter((n) => n.entityId === options.entityId);
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.titleEn.toLowerCase().includes(q) ||
          n.titleAr.toLowerCase().includes(q) ||
          n.messageEn.toLowerCase().includes(q) ||
          n.messageAr.toLowerCase().includes(q)
      );
    }

    const unreadCount = this.notifications.filter((n) => !n.isRead).length;
    const totalCount = filtered.length;
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      notifications: paginated,
      totalCount,
      unreadCount,
      page,
      totalPages,
    };
  }

  public get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public get all(): NotificationContract[] {
    return [...this.notifications];
  }

  public get legacyItems(): NotificationItem[] {
    return this.notifications.map((n) => ({
      id: n.id,
      titleEn: n.titleEn,
      titleAr: n.titleAr,
      messageEn: n.messageEn,
      messageAr: n.messageAr,
      type: (n.severity.toLowerCase() as any) === 'critical' ? 'error' : (n.severity.toLowerCase() as any),
      timestamp: n.createdAt,
      read: n.isRead,
      category: n.category.toLowerCase() as any,
    }));
  }
}

export const enterpriseNotificationService = new EnterpriseNotificationService();
export const notificationService = enterpriseNotificationService;

export class NotificationService {
  static async notifyQuoteReceived(quoteData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'QUOTE',
      severity: 'INFO',
      type: 'quote.received',
      titleEn: `New Quote Request #${quoteData.requestNumber || quoteData.id}`,
      titleAr: `طلب سعر جديد رقم #${quoteData.requestNumber || quoteData.id}`,
      messageEn: `Received quote request from ${quoteData.customerName || 'Customer'}`,
      messageAr: `تم استلام طلب سعر جديد من ${quoteData.customerName || 'العميل'}`,
      entityType: 'QUOTE',
      entityId: quoteData.id || quoteData.requestNumber,
      source: 'DOMAIN_EVENT',
    });
  }

  static async notifyQuoteResponseCreated(quoteData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'QUOTE',
      severity: 'SUCCESS',
      type: 'quote.response_created',
      titleEn: `Quote Response Created #${quoteData.quoteNumber || quoteData.id}`,
      titleAr: `تم إنشاء الرد على عرض السعر رقم #${quoteData.quoteNumber || quoteData.id}`,
      messageEn: `Response sent for quote #${quoteData.quoteNumber || quoteData.id}`,
      messageAr: `تم إرسال الرد لعرض السعر رقم #${quoteData.quoteNumber || quoteData.id}`,
      entityType: 'QUOTE',
      entityId: quoteData.id || quoteData.quoteNumber,
      source: 'USER_ACTION',
    });
  }

  static async notifyQuoteStatusChanged(quoteData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'QUOTE',
      severity: 'INFO',
      type: 'quote.status_changed',
      titleEn: `Quote Status Updated #${quoteData.quoteNumber || quoteData.id}`,
      titleAr: `تحديث حالة عرض السعر رقم #${quoteData.quoteNumber || quoteData.id}`,
      messageEn: `Quote status changed to ${quoteData.newStatus || quoteData.status || 'Updated'}`,
      messageAr: `تم تغيير حالة عرض السعر إلى ${quoteData.newStatus || quoteData.status || 'مُحدث'}`,
      entityType: 'QUOTE',
      entityId: quoteData.id || quoteData.quoteNumber,
      source: 'DOMAIN_EVENT',
    });
  }

  static async notifyShipmentCreated(shipmentData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'SHIPMENT',
      severity: 'SUCCESS',
      type: 'shipment.created',
      titleEn: `Shipment Created #${shipmentData.trackingNumber || shipmentData.id}`,
      titleAr: `تم إنشاء الشحنة رقم #${shipmentData.trackingNumber || shipmentData.id}`,
      messageEn: `New shipment created for customer ${shipmentData.customerName || ''}`,
      messageAr: `تم إنشاء شحنة جديدة للعميل ${shipmentData.customerName || ''}`,
      entityType: 'SHIPMENT',
      entityId: shipmentData.id || shipmentData.trackingNumber,
      source: 'DOMAIN_EVENT',
    });
  }

  static async notifyShipmentStatusChanged(shipmentData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'SHIPMENT',
      severity: 'INFO',
      type: 'shipment.status_changed',
      titleEn: `Shipment Status Updated #${shipmentData.trackingNumber || shipmentData.id}`,
      titleAr: `تحديث حالة الشحنة رقم #${shipmentData.trackingNumber || shipmentData.id}`,
      messageEn: `Status updated to ${shipmentData.newStatus || shipmentData.status || 'Updated'}`,
      messageAr: `تم تحديث الحالة إلى ${shipmentData.newStatus || shipmentData.status || 'مُحدث'}`,
      entityType: 'SHIPMENT',
      entityId: shipmentData.id || shipmentData.trackingNumber,
      source: 'DOMAIN_EVENT',
    });
  }

  static async notifyStatusChanged(statusData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'WORKFLOW',
      severity: 'INFO',
      type: 'workflow.status_changed',
      titleEn: `Status Updated`,
      titleAr: `تحديث الحالة`,
      messageEn: `Status updated to ${statusData.newStatus || 'Updated'}`,
      messageAr: `تم تحديث الحالة إلى ${statusData.newStatus || 'مُحدث'}`,
      entityType: statusData.entityType,
      entityId: statusData.entityId,
      source: 'DOMAIN_EVENT',
    });
  }

  static async notifySupportReply(supportData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'CUSTOMER',
      severity: 'INFO',
      type: 'support.reply',
      titleEn: `New Support Reply #${supportData.ticketNumber || supportData.ticketId || supportData.id || 'TKT'}`,
      titleAr: `رد جديد على التذكرة رقم #${supportData.ticketNumber || supportData.ticketId || supportData.id || 'TKT'}`,
      messageEn: supportData.replyEn || supportData.message || 'Support team posted a reply to your inquiry.',
      messageAr: supportData.replyAr || supportData.message || 'قام فريق الدعم الفني بالرد على استفسارك.',
      entityType: 'TICKET',
      entityId: supportData.ticketId || supportData.id,
      source: 'USER_ACTION',
    });
  }

  static async checkAndNotifyApproachingArrivals(input?: any[] | string): Promise<void> {
    if (Array.isArray(input)) {
      input.forEach((shp) => {
        if (shp.eta) {
          enterpriseNotificationService.dispatch({
            category: 'SHIPMENT',
            severity: 'WARNING',
            type: 'arrival.approaching',
            titleEn: `Shipment #${shp.trackingNumber || shp.id} Approaching Destination`,
            titleAr: `الشحنة رقم #${shp.trackingNumber || shp.id} تقترب من الوجهة`,
            messageEn: `Estimated arrival on ${shp.eta}. Customs preparation recommended.`,
            messageAr: `موعد الوصول المتوقع ${shp.eta}. يوصى بتحضير التخليص الجمركي.`,
            entityType: 'SHIPMENT',
            entityId: shp.id || shp.trackingNumber,
            source: 'SCHEDULED_JOB',
          });
        }
      });
    }
  }

  static async notifyDocumentUploaded(docData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'DOCUMENT',
      severity: 'SUCCESS',
      type: 'document.uploaded',
      titleEn: `New Document Uploaded: ${docData.name || docData.fileName || 'Doc'}`,
      titleAr: `تم رفع مستند جديد: ${docData.name || docData.fileName || 'مستند'}`,
      messageEn: `Document ${docData.name || 'file'} uploaded for ${docData.entityType || 'entity'} #${docData.entityId || ''}`,
      messageAr: `تم رفع المستند ${docData.name || ''} لـ ${docData.entityType || 'الكيان'} #${docData.entityId || ''}`,
      entityType: 'DOCUMENT',
      entityId: docData.id,
      source: 'USER_ACTION',
    });
  }

  static async notifyAdyenPayment(paymentData: any): Promise<void> {
    enterpriseNotificationService.dispatch({
      category: 'PAYMENT',
      severity: 'SUCCESS',
      type: 'payment.received',
      titleEn: `Payment Processed`,
      titleAr: `تمت عملية الدفع`,
      messageEn: `Payment of ${paymentData.amount || ''} ${paymentData.currency || ''} processed successfully.`,
      messageAr: `تمت عملية دفع المبلغ بنجاح.`,
      entityType: 'PAYMENT',
      entityId: paymentData.paymentId || paymentData.id,
      source: 'INTEGRATION',
    });
  }
}
