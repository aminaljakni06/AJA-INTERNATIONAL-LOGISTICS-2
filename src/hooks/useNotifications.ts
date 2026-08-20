/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notifications Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  NotificationContract,
  NotificationFilterOptions,
  NotificationQueryResult,
} from '../types/notificationFramework';
import { enterpriseNotificationService } from '../services/notificationService';

export function useNotifications(initialOptions: NotificationFilterOptions = {}) {
  const [filterOptions, setFilterOptions] = useState<NotificationFilterOptions>(initialOptions);
  const [notifications, setNotifications] = useState<NotificationContract[]>(
    enterpriseNotificationService.all
  );

  useEffect(() => {
    const unsubscribe = enterpriseNotificationService.subscribe((items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, []);

  const queryResult: NotificationQueryResult = useMemo(() => {
    return enterpriseNotificationService.query(filterOptions);
  }, [notifications, filterOptions]);

  const markAsRead = useCallback((id: string) => {
    enterpriseNotificationService.markAsRead(id);
  }, []);

  const markAsUnread = useCallback((id: string) => {
    enterpriseNotificationService.markAsUnread(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    enterpriseNotificationService.markAllAsRead();
  }, []);

  const deleteNotification = useCallback((id: string) => {
    enterpriseNotificationService.deleteNotification(id);
  }, []);

  const clearAll = useCallback(() => {
    enterpriseNotificationService.clearAll();
  }, []);

  const dispatchNotification = useCallback(
    (item: Omit<NotificationContract, 'id' | 'createdAt' | 'isRead'>) => {
      return enterpriseNotificationService.dispatch(item);
    },
    []
  );

  return {
    notifications: queryResult.notifications,
    allNotifications: notifications,
    totalCount: queryResult.totalCount,
    unreadCount: queryResult.unreadCount,
    page: queryResult.page,
    totalPages: queryResult.totalPages,
    filterOptions,
    setFilterOptions,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
    dispatchNotification,
  };
}
