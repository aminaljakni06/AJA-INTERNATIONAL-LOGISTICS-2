import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  X,
  Trash2,
  Archive,
  RotateCcw,
  Download,
  Printer,
  UserCheck,
  Users,
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  ArrowRightLeft,
  ShieldAlert,
  RefreshCw,
  MoreVertical,
  Check,
  Loader2,
  LucideIcon
} from 'lucide-react';

export type BulkActionVariant = 'primary' | 'danger' | 'warning' | 'secondary' | 'success';

export interface BulkActionItem {
  id: string;
  labelEn: string;
  labelAr: string;
  icon?: LucideIcon;
  variant?: BulkActionVariant;
  requiresConfirmation?: boolean;
  confirmationTitleEn?: string;
  confirmationTitleAr?: string;
  confirmationMessageEn?: string;
  confirmationMessageAr?: string;
  isRestricted?: boolean;
  restrictionReasonEn?: string;
  restrictionReasonAr?: string;
  onClick: (selectedKeys: string[], selectedItems?: any[]) => void;
}

export interface EnterpriseBulkActionsSystemProps<T = any> {
  selectedKeys: Set<string>;
  selectedItems?: T[];
  totalRecordsCount?: number;
  filteredRecordsCount?: number;
  actions?: BulkActionItem[];
  onClearSelection: () => void;
  onSelectAllFiltered?: () => void;
  isAllFilteredSelected?: boolean;
  isAr?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const EnterpriseBulkActionsSystem = <T extends Record<string, any>>({
  selectedKeys,
  selectedItems = [],
  totalRecordsCount = 0,
  filteredRecordsCount = 0,
  actions = [],
  onClearSelection,
  onSelectAllFiltered,
  isAllFilteredSelected = false,
  isAr = false,
  isLoading = false,
  className = '',
}: EnterpriseBulkActionsSystemProps<T>) => {
  const [activeConfirmationAction, setActiveConfirmationAction] = useState<BulkActionItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState<{
    status: 'idle' | 'processing' | 'success' | 'error';
    processedCount: number;
    failedCount: number;
    messageEn?: string;
    messageAr?: string;
  }>({
    status: 'idle',
    processedCount: 0,
    failedCount: 0,
  });
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const selectedCount = selectedKeys.size;

  if (selectedCount === 0) {
    return null;
  }

  // Action button style helper
  const getButtonStyles = (variant?: BulkActionVariant, disabled = false) => {
    if (disabled) {
      return 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 opacity-50 cursor-not-allowed';
    }

    switch (variant) {
      case 'danger':
        return 'bg-rose-500 text-white hover:bg-rose-600 border-rose-600 shadow-xs';
      case 'warning':
        return 'bg-amber-500 text-slate-950 hover:bg-amber-400 border-amber-600 font-bold shadow-xs';
      case 'success':
        return 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600 shadow-xs';
      case 'primary':
        return 'bg-[#00F0FF] text-slate-950 hover:bg-[#00D0EE] font-extrabold border-cyan-400 shadow-xs';
      case 'secondary':
      default:
        return 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/20 border-slate-200 dark:border-white/10';
    }
  };

  // Default Standard Actions if none provided
  const defaultActions: BulkActionItem[] = [
    {
      id: 'bulk-export',
      labelEn: 'Export Selected',
      labelAr: 'تصدير المحدد',
      icon: Download,
      variant: 'secondary',
      onClick: (keys) => console.log('Bulk Export', keys),
    },
    {
      id: 'bulk-print',
      labelEn: 'Print Labels',
      labelAr: 'طباعة الملصقات',
      icon: Printer,
      variant: 'secondary',
      onClick: (keys) => console.log('Bulk Print', keys),
    },
    {
      id: 'bulk-status',
      labelEn: 'Update Status',
      labelAr: 'تحديث الحالة',
      icon: RefreshCw,
      variant: 'secondary',
      onClick: (keys) => console.log('Bulk Status Update', keys),
    },
    {
      id: 'bulk-archive',
      labelEn: 'Archive Records',
      labelAr: 'أرشفة السجلات',
      icon: Archive,
      variant: 'warning',
      requiresConfirmation: true,
      confirmationTitleEn: 'Confirm Bulk Archive',
      confirmationTitleAr: 'تأكيد الأرشفة الجماعية',
      confirmationMessageEn: `Are you sure you want to archive ${selectedCount} selected record(s)? They can be restored later from archived items.`,
      confirmationMessageAr: `هل أنت تأكد من رغبتك في أرشفة ${selectedCount} من السجلات المحددة؟ يمكنك استعادتها لاحقاً من قسم الأرشيف.`,
      onClick: (keys) => console.log('Bulk Archive', keys),
    },
    {
      id: 'bulk-delete',
      labelEn: 'Delete Selected',
      labelAr: 'حذف المحدد',
      icon: Trash2,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationTitleEn: 'Confirm Bulk Deletion',
      confirmationTitleAr: 'تأكيد الحذف الجماعي النهائي',
      confirmationMessageEn: `WARNING: You are about to permanently delete ${selectedCount} selected record(s). This action cannot be undone.`,
      confirmationMessageAr: `تحذير: أنت على وشك حذف ${selectedCount} من السجلات المحددة نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
      onClick: (keys) => console.log('Bulk Delete', keys),
    },
  ];

  const activeActions = actions.length > 0 ? actions : defaultActions;
  const primaryVisibleActions = activeActions.slice(0, 3);
  const overflowActions = activeActions.slice(3);

  // Handle action click
  const handleActionClick = (act: BulkActionItem) => {
    if (act.isRestricted) return;

    if (act.requiresConfirmation) {
      setActiveConfirmationAction(act);
    } else {
      executeAction(act);
    }
  };

  // Execute actual bulk operation
  const executeAction = (act: BulkActionItem) => {
    setIsProcessing(true);
    setProgressState({
      status: 'processing',
      processedCount: 0,
      failedCount: 0,
      messageEn: `Executing ${act.labelEn}...`,
      messageAr: `جاري تنفيذ ${act.labelAr}...`,
    });

    // Simulate progress complete
    setTimeout(() => {
      act.onClick(Array.from(selectedKeys), selectedItems);
      setIsProcessing(false);
      setActiveConfirmationAction(null);
      setProgressState({
        status: 'success',
        processedCount: selectedCount,
        failedCount: 0,
        messageEn: `Successfully processed ${selectedCount} record(s).`,
        messageAr: `تمت معالجة ${selectedCount} من السجلات بنجاح.`,
      });

      // Clear selection after short notification
      setTimeout(() => {
        setProgressState({ status: 'idle', processedCount: 0, failedCount: 0 });
      }, 3000);
    }, 600);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Sticky Bulk Action Banner */}
      <div className="p-3 bg-slate-900/95 dark:bg-[#030712]/95 border border-[#00F0FF]/30 backdrop-blur-md rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 text-white transition-all animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Left Side: Selection Indicator & Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-mono font-extrabold text-[#00F0FF]">
            <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
            <span>
              {isAr ? `${selectedCount} سجل محدد` : `${selectedCount} item(s) selected`}
            </span>
          </div>

          {onSelectAllFiltered && filteredRecordsCount > selectedCount && (
            <button
              onClick={onSelectAllFiltered}
              className="text-xs font-bold text-slate-300 hover:text-[#00F0FF] underline transition-colors cursor-pointer"
            >
              {isAr
                ? `تحديد كافة النتائج المفلترة (${filteredRecordsCount})`
                : `Select all ${filteredRecordsCount} filtered records`}
            </button>
          )}
        </div>

        {/* Right Side: Available Bulk Actions */}
        <div className="flex items-center gap-2">
          {/* Primary Action Buttons */}
          {primaryVisibleActions.map((act) => {
            const Icon = act.icon || CheckCircle2;
            return (
              <div key={act.id} className="relative group">
                <button
                  onClick={() => handleActionClick(act)}
                  disabled={act.isRestricted || isProcessing}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${getButtonStyles(
                    act.variant,
                    act.isRestricted
                  )}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isAr ? act.labelAr : act.labelEn}</span>
                </button>

                {/* Restricted Permission Tooltip */}
                {act.isRestricted && (
                  <div className="absolute start-0 bottom-full mb-1 hidden group-hover:block z-50 px-2.5 py-1 bg-rose-950 text-rose-200 border border-rose-500/30 text-[10px] rounded-lg shadow-lg whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>{isAr ? act.restrictionReasonAr || 'غير مصرح بالعملية' : act.restrictionReasonEn || 'Permission Restricted'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Secondary Overflow Actions */}
          {overflowActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title={isAr ? 'المزيد من الإجراءات' : 'More Actions'}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOverflowMenu && (
                <div
                  onMouseLeave={() => setShowOverflowMenu(false)}
                  className="absolute end-0 top-10 z-50 w-48 bg-[#030712] border border-white/10 rounded-xl shadow-2xl p-1 divide-y divide-white/5 animate-in fade-in duration-100"
                >
                  <div className="py-1">
                    {overflowActions.map((act) => {
                      const Icon = act.icon;
                      return (
                        <button
                          key={act.id}
                          onClick={() => {
                            setShowOverflowMenu(false);
                            handleActionClick(act);
                          }}
                          disabled={act.isRestricted || isProcessing}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                            act.variant === 'danger'
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          <span>{isAr ? act.labelAr : act.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear Selection Button */}
          <button
            onClick={onClearSelection}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ms-1"
            title={isAr ? 'إلغاء التحديد' : 'Deselect All'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Execution / Progress Result Banner */}
      {progressState.status !== 'idle' && (
        <div
          className={`mt-2 p-3 rounded-2xl border flex items-center justify-between text-xs font-bold animate-in fade-in duration-150 ${
            progressState.status === 'processing'
              ? 'bg-cyan-500/10 border-cyan-500/30 text-[#00F0FF]'
              : progressState.status === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {progressState.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" />}
            {progressState.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {progressState.status === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
            <span>{isAr ? progressState.messageAr : progressState.messageEn}</span>
          </div>

          <span className="font-mono text-[11px]">
            {progressState.processedCount} / {selectedCount}
          </span>
        </div>
      )}

      {/* Confirmation Modal Dialog */}
      {activeConfirmationAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 text-start">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-2xl border shrink-0 ${
                  activeConfirmationAction.variant === 'danger'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr
                    ? activeConfirmationAction.confirmationTitleAr || 'تأكيد العملية الجماعية'
                    : activeConfirmationAction.confirmationTitleEn || 'Confirm Bulk Action'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? activeConfirmationAction.confirmationMessageAr ||
                      `هل أنت متاكد من تطبيق هذا الإجراء على ${selectedCount} سجلات؟`
                    : activeConfirmationAction.confirmationMessageEn ||
                      `Are you sure you want to apply this operation to ${selectedCount} records?`}
                </p>
              </div>
            </div>

            {/* Selected Count Tag Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{isAr ? 'السجلات المتأثرة:' : 'Affected Records:'}</span>
              <span className="font-mono font-bold text-[#00F0FF] px-2 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/20">
                {selectedCount} {isAr ? 'سجل' : 'records'}
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setActiveConfirmationAction(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => executeAction(activeConfirmationAction)}
                disabled={isProcessing}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 ${getButtonStyles(
                  activeConfirmationAction.variant
                )}`}
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isAr
                    ? activeConfirmationAction.labelAr
                    : activeConfirmationAction.labelEn}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
