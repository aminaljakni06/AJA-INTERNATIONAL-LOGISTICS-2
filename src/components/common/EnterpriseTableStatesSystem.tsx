import React from 'react';
import {
  Inbox,
  SearchX,
  AlertOctagon,
  WifiOff,
  ShieldAlert,
  Wrench,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Plus,
  HelpCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  LifeBuoy
} from 'lucide-react';

export type TableStateType =
  | 'empty'
  | 'no-results'
  | 'loading'
  | 'error'
  | 'offline'
  | 'permission-restricted'
  | 'maintenance'
  | 'initial'
  | 'partial-data';

export interface TableStateAction {
  labelEn: string;
  labelAr: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ElementType;
}

export interface EnterpriseTableStatesProps {
  type: TableStateType;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  searchQuery?: string;
  primaryAction?: TableStateAction;
  secondaryAction?: TableStateAction;
  onRetry?: () => void;
  onClearSearch?: () => void;
  onResetFilters?: () => void;
  isAr?: boolean;
  skeletonRowCount?: number;
  skeletonColumnCount?: number;
  className?: string;
}

/* Skeleton Loading Table Component */
export const TableSkeletonState: React.FC<{
  rowCount?: number;
  columnCount?: number;
  isAr?: boolean;
}> = ({ rowCount = 5, columnCount = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between gap-4 py-2.5 px-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
        <div className="w-5 h-5 bg-slate-200 dark:bg-white/10 rounded" />
        {Array.from({ length: columnCount }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-white/10 rounded flex-1 max-w-[120px]" />
        ))}
        <div className="w-12 h-4 bg-slate-200 dark:bg-white/10 rounded" />
      </div>

      {/* Table Row Skeletons */}
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex items-center justify-between gap-4 py-3.5 px-3 bg-white dark:bg-[#0B172A] rounded-xl border border-slate-100 dark:border-white/5"
        >
          <div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded" />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
              <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
            </div>
          </div>
          {Array.from({ length: Math.max(1, columnCount - 2) }).map((_, cIdx) => (
            <div key={cIdx} className="h-3.5 bg-slate-200 dark:bg-white/10 rounded flex-1 max-w-[100px] hidden sm:block" />
          ))}
          <div className="w-16 h-6 bg-slate-200 dark:bg-white/10 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
};

/* Unified Table States Component */
export const EnterpriseTableStatesSystem: React.FC<EnterpriseTableStatesProps> = ({
  type,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  searchQuery,
  primaryAction,
  secondaryAction,
  onRetry,
  onClearSearch,
  onResetFilters,
  isAr = false,
  skeletonRowCount = 5,
  skeletonColumnCount = 5,
  className = '',
}) => {
  // If loading, render high fidelity Skeleton
  if (type === 'loading') {
    return <TableSkeletonState rowCount={skeletonRowCount} columnCount={skeletonColumnCount} isAr={isAr} />;
  }

  // Partial Data Warning Banner Component
  if (type === 'partial-data') {
    return (
      <div className={`p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-400 ${className}`}>
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {isAr
              ? titleAr || 'تنبيه: البيانات المعروضة جزئية جاري المزامنة في الخلفية...'
              : titleEn || 'Notice: Displaying partial cached records. Background sync in progress...'}
          </span>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isAr ? 'تحديث الفوري' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    );
  }

  // Render State Cards for Empty, No Results, Error, Offline, Permission, Maintenance, Initial
  const getStateDetails = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: SearchX,
          iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          defaultTitleEn: searchQuery ? `No records found matching "${searchQuery}"` : 'No matching records found',
          defaultTitleAr: searchQuery ? `لم نجد سجلات تطابق "${searchQuery}"` : 'لا توجد سجلات تطابق التصفية الحالية',
          defaultDescEn: 'Try adjusting your search keywords or resetting your active column filters.',
          defaultDescAr: 'جرب تعديل كلمات البحث أو إلغاء تفعيل بعض فلاتر الجدول الحالية.',
        };

      case 'error':
        return {
          icon: AlertOctagon,
          iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          defaultTitleEn: 'Failed to retrieve table dataset',
          defaultTitleAr: 'فشل استعلام بيانات الجدول',
          defaultDescEn: 'A network timeout or server processing error occurred. Please retry your request.',
          defaultDescAr: 'حدث انقطاع في الاتصال أو خطأ في المعالجة. يرجى المحاولة مرة أخرى.',
        };

      case 'offline':
        return {
          icon: WifiOff,
          iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          defaultTitleEn: 'You are currently offline',
          defaultTitleAr: 'أنت غير متصل بالشبكة الآن',
          defaultDescEn: 'Showing last available offline cache. Reconnect to fetch live database sync.',
          defaultDescAr: 'تمت الاستعانة بالذاكرة المؤقتة. يتطلب التحديث الحي إعادة الاتصال بشبكة الإنترنت.',
        };

      case 'permission-restricted':
        return {
          icon: ShieldAlert,
          iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          defaultTitleEn: 'Access Restricted by Security Policy',
          defaultTitleAr: 'الوصول محظور وفق سياسة الأمان',
          defaultDescEn: 'Your current enterprise role does not have authorization to view this module table.',
          defaultDescAr: 'دورك الوظيفي الحالي لا يملك تصريحاً لعرض سجلات هذا القسم.',
        };

      case 'maintenance':
        return {
          icon: Wrench,
          iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          defaultTitleEn: 'Module Under Scheduled Maintenance',
          defaultTitleAr: 'القسم قيد الصيانة المجدولة',
          defaultDescEn: 'Database indexes are currently optimizing. Estimated completion in 5 minutes.',
          defaultDescAr: 'جاري تحسين الفهارس وقواعد البيانات. المتوقع الاكتفاء خلال 5 دقائق.',
        };

      case 'initial':
        return {
          icon: Sparkles,
          iconColor: 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20',
          defaultTitleEn: 'Ready to query enterprise records',
          defaultTitleAr: 'جاهز لبدء استعلام السجلات',
          defaultDescEn: 'Enter search terms above or select filter conditions to populate the data grid.',
          defaultDescAr: 'أدخل كلمات البحث بالأعلى أو اختر شروط التصفية لعرض السجلات المطلوب معاينتها.',
        };

      case 'empty':
      default:
        return {
          icon: Inbox,
          iconColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
          defaultTitleEn: 'No records available in this module',
          defaultTitleAr: 'لا توجد سجلات مضافة حتى الآن',
          defaultDescEn: 'Get started by creating your first entry or importing existing records from CSV/Excel.',
          defaultDescAr: 'ابدأ بإضافة أول سجل جديد أو استيراد البيانات السابقة عبر الملفات الخارجية.',
        };
    }
  };

  const details = getStateDetails();
  const IconComponent = details.icon;

  return (
    <div className={`p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto select-none animate-in fade-in duration-200 ${className}`}>
      {/* Icon Frame */}
      <div className={`p-4 rounded-2xl border ${details.iconColor} shadow-md`}>
        <IconComponent className="w-8 h-8" />
      </div>

      {/* Titles */}
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          {isAr ? titleAr || details.defaultTitleAr : titleEn || details.defaultTitleEn}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {isAr ? descriptionAr || details.defaultDescAr : descriptionEn || details.defaultDescEn}
        </p>
      </div>

      {/* State Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {/* On Clear Search / Reset Filters for No Results State */}
        {type === 'no-results' && (
          <React.Fragment>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-3 py-1.5 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer shadow-xs"
              >
                {isAr ? 'مسح البحث' : 'Clear Search'}
              </button>
            )}
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
              >
                {isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
              </button>
            )}
          </React.Fragment>
        )}

        {/* Retry Button for Errors or Offline */}
        {(type === 'error' || type === 'offline' || type === 'maintenance') && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-1.5 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة المحاولة' : 'Retry Request'}</span>
          </button>
        )}

        {/* Custom Primary Action Button */}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className={`px-3.5 py-1.5 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              primaryAction.variant === 'danger'
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-[#00F0FF] text-slate-950 hover:bg-[#00D0EE]'
            }`}
          >
            {primaryAction.icon && React.createElement(primaryAction.icon as React.ComponentType<{ className?: string }>, { className: "w-3.5 h-3.5" })}
            <span>{isAr ? primaryAction.labelAr : primaryAction.labelEn}</span>
          </button>
        )}

        {/* Custom Secondary Action Button */}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            {secondaryAction.icon && React.createElement(secondaryAction.icon as React.ComponentType<{ className?: string }>, { className: "w-3.5 h-3.5" })}
            <span>{isAr ? secondaryAction.labelAr : secondaryAction.labelEn}</span>
          </button>
        )}
      </div>
    </div>
  );
};
