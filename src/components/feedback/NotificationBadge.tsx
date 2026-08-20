/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Badge Component
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

import React from 'react';
import { Bell, Loader2 } from 'lucide-react';

interface NotificationBadgeProps {
  unreadCount: number;
  isLoading?: boolean;
  onClick?: () => void;
  isAr?: boolean;
  className?: string;
  badgeOnly?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  unreadCount,
  isLoading = false,
  onClick,
  isAr = false,
  className = '',
  badgeOnly = false,
}) => {
  const formattedCount = unreadCount > 99 ? '99+' : unreadCount.toString();
  const ariaLabel = isAr
    ? unreadCount > 0
      ? `مركز التنبيهات، لديك ${unreadCount} إشعار غير مقروء`
      : 'مركز التنبيهات، لا توجد إشعارات غير مقروءة'
    : unreadCount > 0
    ? `Notification center, ${unreadCount} unread notifications`
    : 'Notification center, no unread notifications';

  if (badgeOnly) {
    if (unreadCount <= 0) return null;
    return (
      <span
        className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-600 rounded-full shadow-xs ${className}`}
        aria-label={ariaLabel}
      >
        {formattedCount}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${className}`}
    >
      <Bell className="w-5 h-5 shrink-0" />
      {isLoading ? (
        <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
          <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
        </span>
      ) : unreadCount > 0 ? (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-200">
          {formattedCount}
        </span>
      ) : null}
    </button>
  );
};
