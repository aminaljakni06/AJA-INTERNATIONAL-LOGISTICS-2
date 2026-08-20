/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Item Component
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

import React from 'react';
import {
  Package,
  FileText,
  DollarSign,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  XCircle,
  Warehouse,
  Truck,
  ExternalLink,
  Check,
  Trash2,
} from 'lucide-react';
import { NotificationContract, NotificationCategory, NotificationSeverity } from '../../types/notificationFramework';

interface NotificationItemProps {
  notification: NotificationContract;
  isAr?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onActionClick?: (notification: NotificationContract) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isAr = false,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onActionClick,
}) => {
  const title = isAr ? notification.titleAr || notification.titleEn : notification.titleEn;
  const message = isAr ? notification.messageAr || notification.messageEn : notification.messageEn;

  const renderCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'SHIPMENT':
        return <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'QUOTE':
        return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'FINANCE':
      case 'PAYMENT':
      case 'INVOICE':
        return <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'WAREHOUSE':
        return <Warehouse className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'TRANSPORTATION':
        return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'COMPLIANCE':
      case 'WORKFLOW':
        return <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getSeverityBadgeClasses = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'ERROR':
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'INFO':
      default:
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return isAr ? 'الآن' : 'Just now';
      if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
      if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      if (diffDays < 7) return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;

      return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      role="article"
      tabIndex={0}
      className={`group relative p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
        notification.isRead
          ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 text-slate-900 dark:text-slate-100 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Category & Title */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
            {renderCategoryIcon(notification.category)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getSeverityBadgeClasses(
                  notification.severity
                )}`}
              >
                {notification.category}
              </span>
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500 ms-auto">
                {formatTimestamp(notification.createdAt)}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug break-words">
              {title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {notification.isRead ? (
            <button
              type="button"
              onClick={() => onMarkUnread?.(notification.id)}
              title={isAr ? 'تعليم كغير مقروء' : 'Mark as unread'}
              className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMarkRead?.(notification.id)}
              title={isAr ? 'تعليم كمقروء' : 'Mark as read'}
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              title={isAr ? 'حذف' : 'Delete'}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action CTA Button */}
      {notification.action && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (!notification.isRead) onMarkRead?.(notification.id);
              onActionClick?.(notification);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            <span>{isAr ? notification.action.labelAr || 'عرض التفاصيل' : notification.action.labelEn || 'View Details'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
