import React, { useState } from 'react';
import { 
  Bell, 
  Package, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  category: 'shipment' | 'invoice' | 'message' | 'alert';
  timeEn: string;
  timeAr: string;
  isUnread: boolean;
  tab?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    titleEn: 'Shipment Cleared at Jeddah Port',
    titleAr: 'تم فسح الشحنة بميناء جدة الإسلامي',
    messageEn: 'Waybill AJA-889102 has successfully passed customs inspection.',
    messageAr: 'بوليسة رقم AJA-889102 اجتازت التفتيش الجمركي بنجاح.',
    category: 'shipment',
    timeEn: '10 mins ago',
    timeAr: 'منذ 10 دقائق',
    isUnread: true,
    tab: 'tracking',
  },
  {
    id: '2',
    titleEn: 'New Tax Invoice Issued',
    titleAr: 'صدور فاتورة ضريبية جديدة',
    messageEn: 'Invoice #INV-2026-0421 is ready for download in your portal.',
    messageAr: 'الفاتورة #INV-2026-0421 جاهزة للتحميل في بوابة العملاء.',
    category: 'invoice',
    timeEn: '1 hour ago',
    timeAr: 'منذ ساعة',
    isUnread: true,
    tab: 'customer-dashboard',
  },
  {
    id: '3',
    titleEn: 'Carrier Schedule Alert',
    titleAr: 'تنبيه جدول الرحلات البحرية',
    messageEn: 'Maersk vessel arrival updated by +4 hours due to weather.',
    messageAr: 'تحديث وصول سفينة ميرسك بفارق +4 ساعات لسوء الأحوال الجوية.',
    category: 'alert',
    timeEn: '3 hours ago',
    timeAr: 'منذ 3 ساعات',
    isUnread: false,
    tab: 'tracking',
  },
];

export const NotificationsMenu: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = items.filter((i) => i.isUnread).length;

  const handleMarkAllRead = () => {
    setItems(items.map((i) => ({ ...i, isUnread: false })));
  };

  const handleSelectNotification = (item: NotificationItem) => {
    setItems(items.map((i) => (i.id === item.id ? { ...i, isUnread: false } : i)));
    if (item.tab && onNavigate) {
      onNavigate(item.tab);
    }
    setIsOpen(false);
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'shipment':
        return <Package className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />;
      case 'invoice':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-300 hover:text-[#00F0FF] bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
        title={isAr ? 'الإشعارات التنبيهية' : 'Notifications'}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border border-[#030712]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`absolute top-full ${
              isAr ? 'left-0' : 'right-0'
            } mt-3 w-80 sm:w-96 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 text-slate-900 dark:text-slate-100 overflow-hidden animate-fadeIn`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">
                  {isAr ? 'التنبيهات والإشعارات' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B5FFF]/10 text-[#0B5FFF] dark:bg-[#00F0FF]/10 dark:text-[#00F0FF]">
                    {unreadCount} {isAr ? 'جديد' : 'New'}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-[#0B5FFF] dark:text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.length > 0 ? (
                items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNotification(item)}
                    className={`w-full text-start p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3 cursor-pointer ${
                      item.isUnread ? 'bg-[#0B5FFF]/5 dark:bg-[#00F0FF]/5' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isAr ? item.titleAr : item.titleEn}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {isAr ? item.timeAr : item.timeEn}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {isAr ? item.messageAr : item.messageEn}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  {isAr ? 'لا توجد إشعارات حالية' : 'No notifications'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('customer-dashboard');
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-[#0B5FFF] dark:text-[#00F0FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'عرض مركز الإشعارات بالكامل' : 'View all notifications'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
