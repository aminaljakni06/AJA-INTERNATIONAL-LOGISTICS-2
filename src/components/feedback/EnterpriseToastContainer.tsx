/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Toast Container Component
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Loader2,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEnterpriseToast } from '../../hooks/useEnterpriseToast';
import { ToastItem } from '../../types/feedbackFramework';

interface EnterpriseToastContainerProps {
  isAr?: boolean;
}

export const EnterpriseToastContainer: React.FC<EnterpriseToastContainerProps> = ({ isAr = false }) => {
  const { toasts, dismissToast } = useEnterpriseToast();

  if (!toasts || toasts.length === 0) return null;

  const renderIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />;
      case 'progress':
        return <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />;
      case 'undo':
        return <RotateCcw className="w-5 h-5 text-indigo-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div
      role="region"
      aria-label={isAr ? 'الإشعارات المنبثقة' : 'Toast Notifications'}
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => {
        const title = isAr ? toast.titleAr : toast.titleEn;
        const message = isAr ? toast.messageAr : toast.messageEn;

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className="pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {renderIcon(toast.type)}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {title}
                  </h4>
                  {message && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {message}
                    </p>
                  )}
                </div>
              </div>

              {toast.dismissible && (
                <button
                  onClick={() => dismissToast(toast.id)}
                  aria-label={isAr ? 'إغلاق' : 'Dismiss'}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress Bar for progress toasts */}
            {toast.type === 'progress' && toast.progressPercent !== undefined && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-600 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, toast.progressPercent))}%` }}
                />
              </div>
            )}

            {/* Action buttons */}
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {toast.actions.map((act) => (
                  <button
                    key={act.id}
                    onClick={async () => {
                      await act.onClick();
                      dismissToast(toast.id);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      act.variant === 'danger'
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500'
                    }`}
                  >
                    {isAr ? act.labelAr : act.labelEn}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
