/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Notification Preferences Modal
 * Phase: Enterprise UI System
 * Module: Enterprise Notifications
 * Version: 1.0
 */

import React, { useState } from 'react';
import { Sliders, Check, X, Bell, Mail, MessageSquare, Smartphone, Globe, Shield } from 'lucide-react';
import { NotificationPreferencesContract, NotificationCategory, NotificationSeverity } from '../../types/notificationFramework';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
  initialPreferences?: Partial<NotificationPreferencesContract>;
  onSave?: (prefs: NotificationPreferencesContract) => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  isAr = false,
  initialPreferences,
  onSave,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferencesContract>({
    recipientId: initialPreferences?.recipientId || 'current_user',
    channels: {
      IN_APP: initialPreferences?.channels?.IN_APP ?? true,
      EMAIL: initialPreferences?.channels?.EMAIL ?? true,
      SMS: initialPreferences?.channels?.SMS ?? false,
      PUSH: initialPreferences?.channels?.PUSH ?? true,
      WEBHOOK: initialPreferences?.channels?.WEBHOOK ?? false,
    },
    categoryPreferences: {
      SYSTEM: true,
      SECURITY: true,
      WORKFLOW: true,
      SHIPMENT: true,
      QUOTE: true,
      CUSTOMER: true,
      FINANCE: true,
      PAYMENT: true,
      INVOICE: true,
      WAREHOUSE: true,
      TRANSPORTATION: true,
      DOCUMENT: true,
      COMPLIANCE: true,
      INTEGRATION: false,
      MAINTENANCE: true,
      ...initialPreferences?.categoryPreferences,
    },
    severityThreshold: initialPreferences?.severityThreshold || 'INFO',
  });

  if (!isOpen) return null;

  const toggleChannel = (channel: keyof typeof prefs.channels) => {
    setPrefs((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const toggleCategory = (cat: NotificationCategory) => {
    setPrefs((prev) => ({
      ...prev,
      categoryPreferences: {
        ...prev.categoryPreferences,
        [cat]: !prev.categoryPreferences[cat],
      },
    }));
  };

  const handleSave = () => {
    onSave?.(prefs);
    onClose();
  };

  const categoriesList: { key: NotificationCategory; labelEn: string; labelAr: string }[] = [
    { key: 'SHIPMENT', labelEn: 'Shipments & Tracking', labelAr: 'الشحنات والتعقب' },
    { key: 'QUOTE', labelEn: 'Quotes & Pricing', labelAr: 'عروض الأسعار والتسعير' },
    { key: 'FINANCE', labelEn: 'Financial Statements', labelAr: 'التقارير المالية' },
    { key: 'PAYMENT', labelEn: 'Payment Receipts', labelAr: 'إيصالات الدفع' },
    { key: 'DOCUMENT', labelEn: 'Documents & Customs', labelAr: 'المستندات والتخليص الجمركي' },
    { key: 'SECURITY', labelEn: 'Security & Login Alerts', labelAr: 'الأمان وتنبيهات الدخول' },
    { key: 'WORKFLOW', labelEn: 'Approvals & Workflows', labelAr: 'الموافقات ومسارات العمل' },
    { key: 'WAREHOUSE', labelEn: 'Warehouse & Inventory', labelAr: 'المستودعات والمخزون' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isAr ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'تخصيص قنوات وفئات استلام التنبيهات' : 'Configure delivery channels and category alerts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Channels Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              {isAr ? 'قنوات الاستلام' : 'Delivery Channels'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleChannel('IN_APP')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-start transition-all ${
                  prefs.channels.IN_APP
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block">{isAr ? 'داخل التطبيق' : 'In-App'}</span>
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'مُفعل' : 'Active'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('EMAIL')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-start transition-all ${
                  prefs.channels.EMAIL
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0 text-sky-500" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block">{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'ملخصات فورية' : 'Instant digests'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('SMS')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-start transition-all ${
                  prefs.channels.SMS
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block">{isAr ? 'رسائل SMS' : 'SMS'}</span>
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'للتنبيهات العاجلة' : 'Urgent only'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('PUSH')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-start transition-all ${
                  prefs.channels.PUSH
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0 text-purple-500" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block">{isAr ? 'إشعارات الجوال Push' : 'Mobile Push'}</span>
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'تطبيق الهاتف' : 'Mobile app'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              {isAr ? 'فئات التنبيهات' : 'Category Subscriptions'}
            </h4>
            <div className="space-y-2">
              {categoriesList.map((cat) => {
                const active = prefs.categoryPreferences[cat.key];
                return (
                  <label
                    key={cat.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? cat.labelAr : cat.labelEn}
                    </span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleCategory(cat.key)}
                      className="w-4 h-4 rounded-xs text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'حفظ التفضيلات' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
