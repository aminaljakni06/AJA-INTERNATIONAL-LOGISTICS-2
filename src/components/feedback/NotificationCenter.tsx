/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Center Drawer / Panel
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  X,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationCategory, NotificationSeverity, NotificationContract } from '../../types/notificationFramework';
import { EnterpriseEmptyState } from '../common/EnterpriseEmptyStates';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
  onActionNavigate?: (action: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  isAr = false,
  onActionNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<NotificationSeverity | 'ALL'>('ALL');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    notifications,
    totalCount,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications({
    category: selectedCategory,
    severity: selectedSeverity,
    isRead: readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined,
    searchQuery,
    limit: 50,
  });

  if (!isOpen) return null;

  const categories: { key: NotificationCategory | 'ALL'; labelEn: string; labelAr: string }[] = [
    { key: 'ALL', labelEn: 'All', labelAr: 'الكل' },
    { key: 'SHIPMENT', labelEn: 'Shipments', labelAr: 'الشحنات' },
    { key: 'QUOTE', labelEn: 'Quotes', labelAr: 'عروض الأسعار' },
    { key: 'FINANCE', labelEn: 'Finance', labelAr: 'المالية' },
    { key: 'DOCUMENT', labelEn: 'Documents', labelAr: 'المستندات' },
    { key: 'SECURITY', labelEn: 'Security', labelAr: 'الأمان' },
    { key: 'SYSTEM', labelEn: 'System', labelAr: 'النظام' },
  ];

  const handleActionClick = (notif: NotificationContract) => {
    if (notif.action) {
      if (onActionNavigate) {
        onActionNavigate(notif.action);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'مركز التنبيهات' : 'Notification Center'}
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[100] overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-s border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {isAr ? 'مركز الإشعارات' : 'Notification Center'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? `لديك ${unreadCount} إشعار غير مقروء من أصل ${totalCount}`
                  : `${unreadCount} unread out of ${totalCount} notifications`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح الكل' : 'Clear all'}</span>
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 start-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'البحث في الإشعارات...' : 'Search notifications...'}
              className="w-full ps-9 pe-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Read Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
            {(['all', 'unread', 'read'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setReadFilter(mode)}
                className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  readFilter === mode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {mode === 'all'
                  ? isAr
                    ? 'الكل'
                    : 'All'
                  : mode === 'unread'
                  ? isAr
                    ? 'غير مقروء'
                    : 'Unread'
                  : isAr
                  ? 'مقروء'
                  : 'Read'}
              </button>
            ))}
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat.key
                    ? 'bg-amber-500 text-white dark:bg-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <EnterpriseEmptyState
              type="NO_DATA"
              isAr={isAr}
              titleEn="No Notifications Found"
              titleAr="لا توجد إشعارات مطابقة"
              descriptionEn="You have zero notifications matching your selected criteria."
              descriptionAr="لا توجد أي إشعارات مطابقة لمعايير التصفية المحددة."
            />
          ) : (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                isAr={isAr}
                onMarkRead={markAsRead}
                onMarkUnread={markAsUnread}
                onDelete={deleteNotification}
                onActionClick={handleActionClick}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-xs text-slate-400 shrink-0">
          <span>AJA Logistics Enterprise Notification Engine v1.0</span>
        </div>
      </div>
    </div>
  );
};
