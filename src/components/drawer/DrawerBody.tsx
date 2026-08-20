/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Body Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Content Shell & Action System
 * Version: 1.0
 */

import React from 'react';
import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { DrawerBodyProps } from '../../types/drawerFramework';

export const DrawerBody: React.FC<DrawerBodyProps> = ({
  isLoading = false,
  loadingMessageEn,
  loadingMessageAr,
  error = null,
  errorMessageEn,
  errorMessageAr,
  onRetry,
  isEmpty = false,
  emptyTitleEn,
  emptyTitleAr,
  emptyDescEn,
  emptyDescAr,
  emptyIcon,
  emptyAction,
  children,
  className = '',
  density = 'comfortable',
  isAr = false,
}) => {
  const getPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'p-4 space-y-3';
      case 'spacious':
        return 'p-8 space-y-6';
      case 'comfortable':
      default:
        return 'p-6 space-y-4';
    }
  };

  const displayLoading = isAr
    ? loadingMessageAr || 'جاري تحميل المحتوى...'
    : loadingMessageEn || 'Loading drawer content...';

  const displayError = isAr
    ? errorMessageAr || error || 'حدث خطأ أثناء تحميل البيانات'
    : errorMessageEn || error || 'An error occurred while loading drawer content.';

  const displayEmptyTitle = isAr
    ? emptyTitleAr || 'لا توجد سجلات متاحة'
    : emptyTitleEn || 'No Data Available';

  const displayEmptyDesc = isAr
    ? emptyDescAr || 'لم يتم العثور على أي معلومات في هذا اللوح'
    : emptyDescEn || 'There are no items or records to display at this time.';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`flex-1 overflow-y-auto min-h-0 ${getPaddingClass()} ${className}`}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-navy dark:text-brand-gold" />
          <p className="text-sm font-medium">{displayLoading}</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-status-error-subtle/20 border border-status-error/30 text-status-error flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <p className="font-semibold">{isAr ? 'خطأ في التقييم' : 'Error Occurred'}</p>
            <p className="mt-1 leading-relaxed">{displayError}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 rounded-lg bg-status-error/10 hover:bg-status-error/20 font-medium transition-colors flex items-center gap-1.5 cursor-pointer text-status-error"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
              </button>
            )}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="p-4 rounded-2xl bg-surface-secondary text-text-muted">
            {emptyIcon || <Inbox className="w-10 h-10 stroke-[1.5]" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{displayEmptyTitle}</h4>
            <p className="text-xs text-text-muted mt-1 max-w-xs">{displayEmptyDesc}</p>
          </div>
          {emptyAction && (
            <button
              type="button"
              onClick={emptyAction.onClick}
              className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-navy text-white hover:bg-brand-navy/90 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold/90 transition-colors cursor-pointer"
            >
              {isAr ? emptyAction.labelAr || emptyAction.labelEn : emptyAction.labelEn}
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
