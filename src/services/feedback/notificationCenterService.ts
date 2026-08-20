/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Center Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

export interface NotificationCenterItem {
  id: string;
  category: 'system' | 'security' | 'audit' | 'compliance' | 'shipments' | 'billing' | 'ai';
  priority: 'low' | 'medium' | 'high' | 'critical';
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  isRead: boolean;
  isPinned: boolean;
  createdAt: string;
  actionUrl?: string;
}

type NotificationCenterSubscriber = (items: NotificationCenterItem[]) => void;

class EnterpriseNotificationCenterService {
  private notifications: NotificationCenterItem[] = [];
  private subscribers: Set<NotificationCenterSubscriber> = new Set();
  private storageKey: string = 'aja_notification_center';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.notifications = JSON.parse(saved);
        }
      }
    } catch (err) {
      this.notifications = [];
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
      }
    } catch (err) {
      // Safe fallback
    }
  }

  public subscribe(subscriber: NotificationCenterSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber([...this.notifications]);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn([...this.notifications]));
    this.saveToStorage();
  }

  public addNotification(item: Omit<NotificationCenterItem, 'id' | 'createdAt' | 'isRead' | 'isPinned'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: NotificationCenterItem = {
      ...item,
      id,
      isRead: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotif);
    this.notify();
    return id;
  }

  public markAsRead(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.notify();
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach((n) => (n.isRead = true));
    this.notify();
  }

  public togglePin(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.isPinned = !item.isPinned;
      this.notify();
    }
  }

  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.notifications = [];
    this.notify();
  }

  public get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public get allNotifications(): NotificationCenterItem[] {
    return [...this.notifications];
  }
}

export const enterpriseNotificationCenterService = new EnterpriseNotificationCenterService();
