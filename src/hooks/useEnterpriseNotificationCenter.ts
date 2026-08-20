/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Center Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  enterpriseNotificationCenterService,
  NotificationCenterItem,
} from '../services/feedback/notificationCenterService';

export function useEnterpriseNotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>(
    enterpriseNotificationCenterService.allNotifications
  );

  useEffect(() => {
    const unsubscribe = enterpriseNotificationCenterService.subscribe((updated) => {
      setNotifications(updated);
    });
    return () => unsubscribe();
  }, []);

  const addNotification = useCallback(
    (item: Omit<NotificationCenterItem, 'id' | 'createdAt' | 'isRead' | 'isPinned'>) => {
      return enterpriseNotificationCenterService.addNotification(item);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    enterpriseNotificationCenterService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    enterpriseNotificationCenterService.markAllAsRead();
  }, []);

  const togglePin = useCallback((id: string) => {
    enterpriseNotificationCenterService.togglePin(id);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    enterpriseNotificationCenterService.deleteNotification(id);
  }, []);

  const clearAll = useCallback(() => {
    enterpriseNotificationCenterService.clearAll();
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    togglePin,
    deleteNotification,
    clearAll,
  };
}
