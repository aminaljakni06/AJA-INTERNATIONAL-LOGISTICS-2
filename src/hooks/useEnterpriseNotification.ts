/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Listener & Dispatcher Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types/sharedServices';
import { enterpriseNotificationService } from '../services/notificationService';
import { NotificationContract } from '../types/notificationFramework';

export function useEnterpriseNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    enterpriseNotificationService.legacyItems
  );
  const [fullNotifications, setFullNotifications] = useState<NotificationContract[]>(
    enterpriseNotificationService.all
  );

  useEffect(() => {
    const unsubscribe = enterpriseNotificationService.subscribe((updatedItems) => {
      setFullNotifications(updatedItems);
      setNotifications(
        updatedItems.map((n) => ({
          id: n.id,
          titleEn: n.titleEn,
          titleAr: n.titleAr,
          messageEn: n.messageEn,
          messageAr: n.messageAr,
          type: n.severity === 'CRITICAL' ? 'error' : (n.severity.toLowerCase() as any),
          timestamp: n.createdAt,
          read: n.isRead,
          category: n.category.toLowerCase() as any,
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  const dispatchNotification = useCallback(
    (item: Partial<NotificationContract> & { titleEn: string; messageEn: string }) => {
      return enterpriseNotificationService.dispatch({
        category: item.category || 'SYSTEM',
        severity: item.severity || 'INFO',
        type: item.type || 'system.general',
        titleEn: item.titleEn,
        titleAr: item.titleAr || item.titleEn,
        messageEn: item.messageEn,
        messageAr: item.messageAr || item.messageEn,
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        metadata: item.metadata,
        source: item.source || 'USER_ACTION',
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    enterpriseNotificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    enterpriseNotificationService.markAllAsRead();
  }, []);

  const clearAll = useCallback(() => {
    enterpriseNotificationService.clearAll();
  }, []);

  return {
    notifications,
    fullNotifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    dispatchNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
