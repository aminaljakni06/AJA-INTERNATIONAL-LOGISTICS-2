/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Bulk Actions Toolbar
 * Phase: Enterprise UI System
 * Module: Bulk Actions, Selection & Mass Operations (STEP 05.17)
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  X,
  Trash2,
  Archive,
  Download,
  Printer,
  UserCheck,
  Users,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  BulkActionDefinition,
  BulkSelectionState,
  BulkSelectionDescriptor,
  BulkOperationResult,
  BulkRecordError,
} from '../../types/bulkFramework';
import { getBulkActionsForResource } from '../../lib/bulk/bulkActionRegistry';
import {
  buildEnterpriseExportRequest,
  downloadEnterpriseExport,
  ExportClientError,
  getStoredAuthHeaders,
} from '../../lib/exchange/exportClient';

export interface EnterpriseBulkToolbarProps {
  resource: string;
  selectionState: BulkSelectionState;
  selectionDescriptor: BulkSelectionDescriptor | null;
  onClearSelection: () => void;
  onSelectAllMatching?: () => void;
  onOperationCompleted?: (result: BulkOperationResult) => void;
  customActions?: BulkActionDefinition[];
  isAr?: boolean;
  className?: string;
}

export const EnterpriseBulkToolbar: React.FC<EnterpriseBulkToolbarProps> = ({
  resource,
  selectionState,
  selectionDescriptor,
  onClearSelection,
  onSelectAllMatching,
  onOperationCompleted,
  customActions,
  isAr = false,
  className = '',
}) => {
  const [activeAction, setActiveAction] = useState<BulkActionDefinition | null>(null);
  const [inputPayload, setInputPayload] = useState<Record<string, any>>({});
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<BulkOperationResult | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const selectedCount = selectionState.selectedIds.size;
  const totalMatching = selectionState.totalMatchingCount;
  const excludedCount = selectionState.excludedIds.size;
  const mode = selectionState.mode;

  if (mode === 'NONE' || !selectionDescriptor) {
    return null;
  }

  // Retrieve available actions
  const availableActions = customActions || getBulkActionsForResource(resource);
  const primaryActions = availableActions.slice(0, 3);
  const overflowActions = availableActions.slice(3);

  // Icon mapping helper
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Trash2':
        return Trash2;
      case 'Archive':
        return Archive;
      case 'Download':
        return Download;
      case 'Printer':
        return Printer;
      case 'UserCheck':
        return UserCheck;
      case 'Users':
        return Users;
      case 'RefreshCw':
        return RefreshCw;
      case 'CheckCircle2':
        return CheckCircle2;
      case 'XCircle':
        return XCircle;
      default:
        return CheckCircle2;
    }
  };

  const getButtonStyles = (variant?: string, disabled = false) => {
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
        return 'bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-700';
    }
  };

  // Open action execution dialog
  const handleActionClick = (action: BulkActionDefinition) => {
    if (action.isRestricted) return;

    // Reset state
    setInputPayload({});
    setTypedConfirmation('');

    const targetAction = { ...action };
    if ((action.id.endsWith('.export') || action.id === 'export') && (!action.inputFields || action.inputFields.length === 0)) {
      targetAction.inputFields = [
        {
          name: 'format',
          labelEn: 'Export File Format',
          labelAr: 'صيغة ملف التصدير',
          type: 'select',
          required: true,
          defaultValue: 'csv',
          options: [
            { value: 'csv', labelEn: 'CSV File (.csv)', labelAr: 'ملف قيم مفصولة بفواصل (.csv)' },
            { value: 'xlsx', labelEn: 'Excel Workbook (.xlsx)', labelAr: 'جدول بيانات إكسل (.xlsx)' },
          ],
        },
      ];
    }

    setActiveAction(targetAction);

    // Initialize default values for input fields
    if (targetAction.inputFields && targetAction.inputFields.length > 0) {
      const defaults: Record<string, any> = {};
      targetAction.inputFields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaults[f.name] = f.defaultValue;
        } else if (f.options && f.options.length > 0) {
          defaults[f.name] = f.options[0].value;
        }
      });
      setInputPayload(defaults);
    }
  };

  // Execute server-authoritative bulk operation
  const handleConfirmExecute = async () => {
    if (!activeAction || !selectionDescriptor) return;

    // Check typed confirmation if required
    const reqPhrase = activeAction.confirmation?.requiredTypedPhrase;
    if (reqPhrase && typedConfirmation.trim().toUpperCase() !== reqPhrase.toUpperCase()) {
      return;
    }

    setIsExecuting(true);

    // Dedicated Export Action Execution Flow
    if (activeAction.id.endsWith('.export') || activeAction.id === 'export') {
      try {
        const format = (inputPayload.format as 'csv' | 'xlsx') || 'csv';
        const req = buildEnterpriseExportRequest({
          resource,
          format,
          selection: selectionDescriptor,
          locale: isAr ? 'ar' : 'en',
        });
        const dlResult = await downloadEnterpriseExport(req);

        const count = mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount;
        const result: BulkOperationResult = {
          operationId: `op_exp_${Date.now()}`,
          resource,
          actionId: activeAction.id,
          requestedCount: count,
          processedCount: count,
          succeededCount: count,
          failedCount: 0,
          skippedCount: 0,
          status: 'COMPLETED',
          executionTimeMs: 120,
        };
        setExecutionResult(result);
        setShowResultModal(true);
        if (onOperationCompleted) {
          onOperationCompleted(result);
        }
      } catch (err: any) {
        const count = mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount;
        const msg = isAr && err instanceof ExportClientError && err.messageAr ? err.messageAr : err.message || 'Export failed.';
        const fallbackResult: BulkOperationResult = {
          operationId: `op_err_${Date.now()}`,
          resource,
          actionId: activeAction.id,
          requestedCount: count,
          processedCount: count,
          succeededCount: 0,
          failedCount: count,
          skippedCount: 0,
          status: 'FAILED',
          recordErrors: [
            {
              code: 'EXPORT_ERROR',
              messageEn: msg,
              messageAr: msg,
            },
          ],
          executionTimeMs: 150,
        };
        setExecutionResult(fallbackResult);
        setShowResultModal(true);
      } finally {
        setIsExecuting(false);
        setActiveAction(null);
      }
      return;
    }

    try {
      const response = await fetch('/api/bulk-operations', {
        method: 'POST',
        headers: getStoredAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          operationId: `op_${Date.now()}`,
          resource,
          actionId: activeAction.id,
          selection: selectionDescriptor,
          payload: inputPayload,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const result: BulkOperationResult = resData.data;
        setExecutionResult(result);
        setShowResultModal(true);
        if (onOperationCompleted) {
          onOperationCompleted(result);
        }
      } else {
        throw new Error(resData.error?.message || 'Bulk operation failed.');
      }
    } catch (err: any) {
      const fallbackResult: BulkOperationResult = {
        operationId: `op_err_${Date.now()}`,
        resource,
        actionId: activeAction.id,
        requestedCount: mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount,
        processedCount: mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount,
        succeededCount: 0,
        failedCount: mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount,
        skippedCount: 0,
        status: 'FAILED',
        recordErrors: [
          {
            code: 'API_ERROR',
            messageEn: err.message || 'Operation failed on server.',
            messageAr: err.message || 'فشلت العملية على الخادم.',
          },
        ],
        executionTimeMs: 150,
      };
      setExecutionResult(fallbackResult);
      setShowResultModal(true);
    } finally {
      setIsExecuting(false);
      setActiveAction(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Sticky Top Toolbar Banner */}
      <div className="p-3 bg-slate-900/95 dark:bg-[#030712]/95 border border-[#00F0FF]/30 backdrop-blur-md rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white transition-all animate-in fade-in duration-200">
        
        {/* Left Side: Selection Information & Query Promotion */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Badge indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-mono font-extrabold text-[#00F0FF]">
            <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
            {mode === 'QUERY' ? (
              <span>
                {isAr
                  ? `كافة نتائج الاستعلام المفلترة (${Math.max(0, totalMatching - excludedCount)})`
                  : `All ${Math.max(0, totalMatching - excludedCount)} matching query records`}
              </span>
            ) : (
              <span>
                {isAr ? `${selectedCount} سجل محدد` : `${selectedCount} item(s) selected`}
              </span>
            )}
          </div>

          {/* Exclusion notice */}
          {mode === 'QUERY' && excludedCount > 0 && (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {isAr ? `(تم استثناء ${excludedCount})` : `(${excludedCount} excluded)`}
            </span>
          )}

          {/* Select All Matching Query Prompt */}
          {mode !== 'QUERY' && onSelectAllMatching && totalMatching > selectedCount && (
            <button
              onClick={onSelectAllMatching}
              className="text-xs font-bold text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer bg-cyan-500/5 hover:bg-cyan-500/15 px-2.5 py-1 rounded-xl border border-cyan-500/20 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>
                {isAr
                  ? `تحديد كافة النتائج المفلترة (${totalMatching})`
                  : `Select all ${totalMatching} matching records`}
              </span>
            </button>
          )}
        </div>

        {/* Right Side: Primary & Overflow Bulk Actions */}
        <div className="flex items-center gap-2">
          {primaryActions.map((action) => {
            const IconComponent = getIcon(action.icon);
            return (
              <div key={action.id} className="relative group">
                <button
                  onClick={() => handleActionClick(action)}
                  disabled={action.isRestricted || isExecuting}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${getButtonStyles(
                    action.variant,
                    action.isRestricted
                  )}`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{isAr ? action.labelAr : action.labelEn}</span>
                </button>

                {action.isRestricted && (
                  <div className="absolute start-0 bottom-full mb-1.5 hidden group-hover:block z-50 px-2.5 py-1 bg-rose-950 text-rose-200 border border-rose-500/30 text-[10px] rounded-lg shadow-lg whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>{isAr ? action.restrictionReasonAr || 'غير مصرح' : action.restrictionReasonEn || 'Restricted'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Overflow Menu */}
          {overflowActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title={isAr ? 'إجراءات إضافية' : 'More Actions'}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOverflowMenu && (
                <div
                  onMouseLeave={() => setShowOverflowMenu(false)}
                  className="absolute end-0 top-10 z-50 w-52 bg-[#030712] border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in duration-100"
                >
                  {overflowActions.map((action) => {
                    const IconComp = getIcon(action.icon);
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          setShowOverflowMenu(false);
                          handleActionClick(action);
                        }}
                        disabled={action.isRestricted || isExecuting}
                        className={`w-full px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                          action.variant === 'danger'
                            ? 'text-rose-400 hover:bg-rose-500/10'
                            : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{isAr ? action.labelAr : action.labelEn}</span>
                      </button>
                    );
                  })}
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

      {/* Action Input / Confirmation Modal */}
      {activeAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 text-start">
            
            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-2xl border shrink-0 ${
                  activeAction.variant === 'danger'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-[#00F0FF]'
                }`}
              >
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? activeAction.labelAr : activeAction.labelEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? `تطبيق العملية الجماعية على ${mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount} سجلات.`
                    : `Apply mass operation to ${mode === 'QUERY' ? Math.max(0, totalMatching - excludedCount) : selectedCount} records.`}
                </p>
              </div>
            </div>

            {/* Confirmation Message */}
            {activeAction.confirmation && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isAr
                      ? activeAction.confirmation.titleAr
                      : activeAction.confirmation.titleEn}
                  </span>
                </div>
                <p>
                  {isAr
                    ? activeAction.confirmation.messageAr
                    : activeAction.confirmation.messageEn}
                </p>
              </div>
            )}

            {/* Input Requirements Form Fields */}
            {activeAction.inputFields && activeAction.inputFields.length > 0 && (
              <div className="space-y-3 pt-2">
                {activeAction.inputFields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? field.labelAr : field.labelEn}{' '}
                      {field.required && <span className="text-rose-400">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={inputPayload[field.name] || ''}
                        onChange={(e) =>
                          setInputPayload({ ...inputPayload, [field.name]: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#00F0FF]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {isAr ? opt.labelAr : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={inputPayload[field.name] || ''}
                        onChange={(e) =>
                          setInputPayload({ ...inputPayload, [field.name]: e.target.value })
                        }
                        placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#00F0FF]"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={inputPayload[field.name] || ''}
                        onChange={(e) =>
                          setInputPayload({ ...inputPayload, [field.name]: e.target.value })
                        }
                        placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#00F0FF]"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Typed Phrase Confirmation Input */}
            {activeAction.confirmation?.requiredTypedPhrase && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <label className="text-xs font-bold text-rose-400">
                  {isAr
                    ? `يرجى كتابة "${activeAction.confirmation.requiredTypedPhrase}" للتأكيد:`
                    : `Please type "${activeAction.confirmation.requiredTypedPhrase}" to confirm:`}
                </label>
                <input
                  type="text"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder={activeAction.confirmation.requiredTypedPhrase}
                  className="w-full px-3 py-2 bg-rose-500/5 border border-rose-500/30 rounded-xl text-xs font-mono font-bold text-rose-400 focus:outline-hidden"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmExecute}
                disabled={
                  isExecuting ||
                  (activeAction.confirmation?.requiredTypedPhrase &&
                    typedConfirmation.trim().toUpperCase() !==
                      activeAction.confirmation.requiredTypedPhrase.toUpperCase())
                }
                className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 ${getButtonStyles(
                  activeAction.variant
                )}`}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? 'جاري التنفيذ...' : 'Executing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isAr ? activeAction.labelAr : activeAction.labelEn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Result Modal (Partial Failures / Success Summary) */}
      {showResultModal && executionResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 text-start">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${
                  executionResult.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : executionResult.status === 'PARTIAL'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {executionResult.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : executionResult.status === 'PARTIAL' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'نتيجة العملية الجماعية' : 'Bulk Operation Result'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? `الحالة: ${executionResult.status}`
                    : `Status: ${executionResult.status}`}
                </p>
              </div>
            </div>

            {/* Breakdown Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  {isAr ? 'نجاح' : 'Succeeded'}
                </span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  {executionResult.succeededCount}
                </span>
              </div>

              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  {isAr ? 'فشل' : 'Failed'}
                </span>
                <span className="text-lg font-mono font-extrabold text-rose-400">
                  {executionResult.failedCount}
                </span>
              </div>

              <div className="p-3 bg-slate-500/5 border border-slate-500/20 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  {isAr ? 'تجاهل' : 'Skipped'}
                </span>
                <span className="text-lg font-mono font-extrabold text-slate-400">
                  {executionResult.skippedCount}
                </span>
              </div>
            </div>

            {/* Error breakdown if any */}
            {executionResult.recordErrors && executionResult.recordErrors.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                <span className="text-xs font-bold text-rose-400 block">
                  {isAr ? 'تفاصيل الأخطاء:' : 'Error Breakdown:'}
                </span>
                {executionResult.recordErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] font-mono text-rose-300"
                  >
                    {isAr ? err.messageAr : err.messageEn}
                  </div>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                  setExecutionResult(null);
                  onClearSelection();
                }}
                className="px-4 py-2 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق ومتابعة' : 'Close & Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
