/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Empty States System
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Empty, Zero & Placeholder States
 * Version: 1.0
 */

import React from 'react';
import {
  Inbox,
  SearchX,
  FilterX,
  ShieldAlert,
  WifiOff,
  Sparkles,
  Unplug,
  Archive,
  Plus,
  RefreshCw,
  HelpCircle,
  X,
  ArrowRight,
  Lock,
  PackageX,
  FileSpreadsheet,
  Users,
  Warehouse,
  BarChart2,
  Calendar,
  CheckSquare,
  Activity,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { EnterpriseEmptyStateProps, EmptyStateType } from '../../types/emptyStates';
import { Button } from './Button';

/**
 * Master Enterprise Empty State Component
 */
export const EnterpriseEmptyState: React.FC<EnterpriseEmptyStateProps> = ({
  type = 'NO_DATA',
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  icon: Icon = Inbox,
  illustration,
  primaryAction,
  secondaryAction,
  helpLink,
  onRetry,
  onDismiss,
  contextBadgeEn,
  contextBadgeAr,
  isAr = false,
  className = '',
  children,
}) => {
  return (
    <div
      role="status"
      aria-label={isAr ? titleAr : titleEn}
      dir={isAr ? 'rtl' : 'ltr'}
      className={`relative w-full p-8 md:p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6 shadow-xl overflow-hidden ${className}`}
    >
      {/* Dismiss Button if provided */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Context Badge */}
      {(contextBadgeEn || contextBadgeAr) && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 text-[11px] font-mono font-bold uppercase tracking-wider">
          {isAr ? contextBadgeAr : contextBadgeEn}
        </span>
      )}

      {/* Illustration or Icon Container */}
      {illustration ? (
        <div className="w-full max-w-xs flex justify-center">{illustration}</div>
      ) : (
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00F0FF]/20 to-indigo-500/20 blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[#00F0FF] shadow-2xl flex items-center justify-center">
            {React.createElement(Icon as React.ComponentType<{ className?: string }>, { className: "w-10 h-10 stroke-[1.5]" })}
          </div>
        </div>
      )}

      {/* Title & Description */}
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">
          {isAr ? titleAr : titleEn}
        </h3>
        {(descriptionEn || descriptionAr) && (
          <p className="text-sm text-slate-400 leading-relaxed">
            {isAr ? descriptionAr : descriptionEn}
          </p>
        )}
      </div>

      {/* Custom Embedded Children */}
      {children && <div className="w-full max-w-md pt-2">{children}</div>}

      {/* Actions Bar */}
      {(primaryAction || secondaryAction || onRetry || helpLink) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'primary'}
              size="md"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className="gap-2 shadow-lg"
            >
              {primaryAction.icon && React.createElement(primaryAction.icon as React.ComponentType<{ className?: string }>, { className: "w-4 h-4" })}
              <span>{isAr ? primaryAction.labelAr : primaryAction.labelEn}</span>
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'secondary'}
              size="md"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled || secondaryAction.loading}
              className="gap-2"
            >
              {secondaryAction.icon && React.createElement(secondaryAction.icon as React.ComponentType<{ className?: string }>, { className: "w-4 h-4" })}
              <span>{isAr ? secondaryAction.labelAr : secondaryAction.labelEn}</span>
            </Button>
          )}

          {onRetry && (
            <Button variant="ghost" size="md" onClick={onRetry} className="gap-2 text-slate-300">
              <RefreshCw className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry Request'}</span>
            </Button>
          )}

          {helpLink && (
            <a
              href={helpLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#00F0FF] hover:underline font-medium px-3 py-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isAr ? helpLink.labelAr : helpLink.labelEn}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

/* Specialized Zero State Component */
export const ZeroState: React.FC<{
  entityNameEn: string;
  entityNameAr: string;
  onCreate?: () => void;
  isAr?: boolean;
}> = ({ entityNameEn, entityNameAr, onCreate, isAr = false }) => (
  <EnterpriseEmptyState
    type="ZERO_STATE"
    contextBadgeEn="First Time Setup"
    contextBadgeAr="إعداد لأول مرة"
    icon={Plus}
    titleEn={`No ${entityNameEn} Created Yet`}
    titleAr={`لم يتم إنشاء أي ${entityNameAr} بعد`}
    descriptionEn={`Get started by adding your first ${entityNameEn.toLowerCase()} to activate live workflow tracking and analytics.`}
    descriptionAr={`ابدأ بإضافة أول ${entityNameAr} لديك لتفعيل التتبع المباشر والتحليلات.`}
    primaryAction={
      onCreate
        ? {
            labelEn: `Create New ${entityNameEn}`,
            labelAr: `إنشاء ${entityNameAr} جديد`,
            onClick: onCreate,
            variant: 'primary',
            icon: Plus,
          }
        : undefined
    }
    isAr={isAr}
  />
);

/* Specialized Search Empty State Component */
export const SearchEmptyState: React.FC<{
  searchQuery?: string;
  onClearSearch?: () => void;
  isAr?: boolean;
}> = ({ searchQuery, onClearSearch, isAr = false }) => (
  <EnterpriseEmptyState
    type="NO_SEARCH_MATCHES"
    contextBadgeEn="Search Query Unmatched"
    contextBadgeAr="لم يتم العثور على نتائج للبحث"
    icon={SearchX}
    titleEn={searchQuery ? `No results for "${searchQuery}"` : 'No Search Results Found'}
    titleAr={searchQuery ? `لا توجد نتائج بحث لـ "${searchQuery}"` : 'لم يتم العثور على نتائج بحث'}
    descriptionEn="We couldn't find any records matching your criteria. Try adjusting your spelling or key reference parameters."
    descriptionAr="لم نتمكن من العثور على أي سجلات تطابق المعايير الخاصة بك. يرجى التحقق من صياغة البحث أو مرجع الكلمات المفتاحية."
    primaryAction={
      onClearSearch
        ? {
            labelEn: 'Clear Search Query',
            labelAr: 'إلغاء نص البحث',
            onClick: onClearSearch,
            variant: 'secondary',
            icon: RefreshCw,
          }
        : undefined
    }
    isAr={isAr}
  />
);

/* Specialized Filter Empty State Component */
export const FilterEmptyState: React.FC<{
  onResetFilters?: () => void;
  isAr?: boolean;
}> = ({ onResetFilters, isAr = false }) => (
  <EnterpriseEmptyState
    type="NO_FILTERS_MATCH"
    contextBadgeEn="Active Filters Restrictive"
    contextBadgeAr="الفلاتر المطبقة تقيد النتائج"
    icon={FilterX}
    titleEn="No Records Match Current Filters"
    titleAr="لا توجد سجلات تطابق الفلاتر المطبقة"
    descriptionEn="Your current filter combination resulted in zero matching records. Clear or adjust filters to view data."
    descriptionAr="تسببت مجموعة الفلاتر المطبقة حالياً في عدم وجود سجلات مطابقة. يرجى مسح الفلاتر أو تعديلها لعرض البيانات."
    primaryAction={
      onResetFilters
        ? {
            labelEn: 'Reset All Filters',
            labelAr: 'إعادة ضبط كافة الفلاتر',
            onClick: onResetFilters,
            variant: 'secondary',
            icon: RefreshCw,
          }
        : undefined
    }
    isAr={isAr}
  />
);

/* Specialized Permission Restricted State Component */
export const PermissionEmptyState: React.FC<{
  moduleNameEn?: string;
  moduleNameAr?: string;
  onRequestAccess?: () => void;
  isAr?: boolean;
}> = ({ moduleNameEn = 'this resource', moduleNameAr = 'هذا المورد', onRequestAccess, isAr = false }) => (
  <EnterpriseEmptyState
    type="PERMISSION_RESTRICTED"
    contextBadgeEn="Access Control Restricted"
    contextBadgeAr="الوصول محظور"
    icon={Lock}
    titleEn="Access Restricted"
    titleAr="الوصول محظور أو غير مصرح به"
    descriptionEn={`Your active user profile lacks required administrative permissions to view ${moduleNameEn}.`}
    descriptionAr={`حسابك الحالي لا يمتلك الصلاحيات الإدارية المطلوبة لعرض ${moduleNameAr}.`}
    primaryAction={
      onRequestAccess
        ? {
            labelEn: 'Request Security Permission',
            labelAr: 'طلب الحصول على الصلاحية',
            onClick: onRequestAccess,
            variant: 'primary',
            icon: ShieldAlert,
          }
        : undefined
    }
    isAr={isAr}
  />
);

/* Specialized Offline State Component */
export const OfflineEmptyState: React.FC<{
  onRetryConnection?: () => void;
  isAr?: boolean;
}> = ({ onRetryConnection, isAr = false }) => (
  <EnterpriseEmptyState
    type="OFFLINE"
    contextBadgeEn="Network Disconnected"
    contextBadgeAr="انقطع الاتصال بالشبكة"
    icon={WifiOff}
    titleEn="No Active Network Connection"
    titleAr="لا يوجد اتصال نشط بالشبكة"
    descriptionEn="You are currently offline. Local cache is safe; live synchronized records will reload once connection is restored."
    descriptionAr="أنت حالياً غير متصل بالشبكة. البيانات المخزنة مؤقتاً آمنة وسيتم إعادة التزامن التلقائي فور عودة الاتصال."
    primaryAction={
      onRetryConnection
        ? {
            labelEn: 'Check & Reconnect',
            labelAr: 'إعادة الاتصال بالشبكة',
            onClick: onRetryConnection,
            variant: 'primary',
            icon: RefreshCw,
          }
        : undefined
    }
    isAr={isAr}
  />
);

/* Specialized AI Empty State Component */
export const AIEmptyState: React.FC<{
  onGenerateAI?: () => void;
  isAr?: boolean;
}> = ({ onGenerateAI, isAr = false }) => (
  <EnterpriseEmptyState
    type="NO_AI_HISTORY"
    contextBadgeEn="AJA AI Engine Standby"
    contextBadgeAr="محرك الذكاء الاصطناعي في وضع الاستعداد"
    icon={Sparkles}
    titleEn="No AI Logistics Insights Yet"
    titleAr="لا توجد تحليلات أو توصيات من الذكاء الاصطناعي بعد"
    descriptionEn="Run AI optimization pipelines to synthesize predictive route insights, cost reductions, and load balancing."
    descriptionAr="قم بتشغيل خوارزميات الذكاء الاصطناعي للحصول على توصيات تحسين المسارات وتخفيض التكاليف."
    primaryAction={
      onGenerateAI
        ? {
            labelEn: 'Generate AI Insights',
            labelAr: 'توليد توصيات الذكاء الاصطناعي',
            onClick: onGenerateAI,
            variant: 'primary',
            icon: Sparkles,
          }
        : undefined
    }
    isAr={isAr}
  />
);

/* Specialized Integration Empty State Component */
export const IntegrationEmptyState: React.FC<{
  providerNameEn?: string;
  providerNameAr?: string;
  onConnect?: () => void;
  isAr?: boolean;
}> = ({ providerNameEn = 'External Service', providerNameAr = 'الخدمة الخارجية', onConnect, isAr = false }) => (
  <EnterpriseEmptyState
    type="NO_INTEGRATIONS"
    contextBadgeEn="Integration Unconnected"
    contextBadgeAr="التكامل غير متصل"
    icon={Unplug}
    titleEn={`${providerNameEn} Integration Not Configured`}
    titleAr={`تكامل ${providerNameAr} غير مهيأ بعد`}
    descriptionEn="Connect external EDI, customs clearance gateways, or carrier tracking endpoints to automate data flows."
    descriptionAr="قم بربط أنظمة EDI وإجراءات التخليص الجمركي وتتبع الشحن لتأتمتة تدفق البيانات."
    primaryAction={
      onConnect
        ? {
            labelEn: `Connect ${providerNameEn}`,
            labelAr: `ربط ${providerNameAr}`,
            onClick: onConnect,
            variant: 'primary',
            icon: Unplug,
          }
        : undefined
    }
    isAr={isAr}
  />
);
