/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data Export & Import System Component
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18)
 * Version: 1.0
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Mail,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  X,
  Settings,
  Check,
  Layers,
  Database,
  ShieldCheck,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Info,
  RefreshCw,
  LucideIcon,
  ShieldAlert
} from 'lucide-react';
import { BulkSelectionDescriptor } from '../../types/bulkFramework';
import { ExchangeFormat, DuplicateHandlingStrategy } from '../../types/dataTransferFramework';
import { useEnterpriseDataExchange } from '../../hooks/useEnterpriseDataExchange';

const SAFE_FIRESTORE_WRITE_BATCH_SIZE = 400;

export interface EnterpriseExportExchangeProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: string;
  selectionDescriptor?: BulkSelectionDescriptor | null;
  selectedCount?: number;
  filteredCount?: number;
  totalCount?: number;
  onExecuteExport?: (format: string, scope: string, config: any) => void;
  isAr?: boolean;
  className?: string;
}

export const EnterpriseExportExchangeSystem: React.FC<EnterpriseExportExchangeProps> = ({
  isOpen,
  onClose,
  resource = 'shipments',
  selectionDescriptor = null,
  selectedCount = 0,
  filteredCount = 0,
  totalCount = 0,
  isAr = false,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'history'>('export');
  const [selectedFormat, setSelectedFormat] = useState<ExchangeFormat>('csv');
  const [customFileName, setCustomFileName] = useState(`AJA_${resource}_report`);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Hook for server-authoritative export and import pipeline
  const {
    isExporting,
    exportError,
    executeExport,
    fetchAllowlistSchema,
    allowlistFields,
    // Import Pipeline State & Handlers
    importStage,
    uploadedFile,
    parsedData,
    columnMappings,
    setColumnMappings,
    validationResult,
    duplicateStrategy,
    setDuplicateStrategy,
    executionPolicy,
    setExecutionPolicy,
    previewResponse,
    executionPlan,
    isPlanning,
    isPlanConfirmed,
    isExecutingImport,
    importResult,
    importError,
    uploadAndParseFile,
    validateMappedRows,
    runDuplicateCheck,
    buildImportPlan,
    confirmImportPlan,
    executeImport,
    downloadErrorReport,
    resetImport,
  } = useEnterpriseDataExchange({
    resource,
    selectionDescriptor,
    isAr,
  });

  const [typedPhraseInput, setTypedPhraseInput] = useState('');

  // Load allowlist schema on open
  useEffect(() => {
    if (isOpen) {
      fetchAllowlistSchema();
    }
  }, [isOpen, fetchAllowlistSchema]);

  // Sync default selected fields
  useEffect(() => {
    if (allowlistFields.length > 0 && selectedFields.length === 0) {
      setSelectedFields(allowlistFields.filter((f) => f.isDefault).map((f) => f.key));
    }
  }, [allowlistFields, selectedFields.length]);

  if (!isOpen) return null;

  // Derive selection scope count
  const effectiveExportCount = selectionDescriptor
    ? selectionDescriptor.mode === 'EXPLICIT' || selectionDescriptor.mode === 'PAGE'
      ? selectionDescriptor.ids.length
      : Math.max(0, totalCount - (selectionDescriptor.excludedIds?.length || 0))
    : selectedCount > 0
    ? selectedCount
    : filteredCount > 0
    ? filteredCount
    : totalCount;

  // Toggle field selection for export allowlist
  const toggleFieldSelection = (key: string) => {
    if (selectedFields.includes(key)) {
      if (selectedFields.length > 1) {
        setSelectedFields(selectedFields.filter((k) => k !== key));
      }
    } else {
      setSelectedFields([...selectedFields, key]);
    }
  };

  // Handle Export Trigger
  const handleTriggerExport = async () => {
    // Construct or fallback selection descriptor if none was provided
    const descriptor: BulkSelectionDescriptor = selectionDescriptor || {
      mode: selectedCount > 0 ? 'EXPLICIT' : 'QUERY',
      ids: [],
      resource,
      query: { search: '', filters: {}, sort: null, pagination: { page: 1, pageSize: 25 } },
      excludedIds: [],
    };

    await executeExport(selectedFormat, selectedFields, customFileName);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 ${className}`}>
      <div className="w-full max-w-4xl bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 dark:bg-[#030712] border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-2xl text-[#00F0FF]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>{isAr ? 'نظام تبديل واستيراد البيانات المؤسسي' : 'Enterprise Data Exchange & Export System'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/20 text-[#00F0FF] rounded-md border border-cyan-500/30 font-bold">
                  STEP 05.18
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? `إدارة التصدير الآمن والاستيراد مع حماية الصيغ ومطابقة الحقول (${resource})`
                  : `Server-authoritative export engine & 8-stage import pipeline for ${resource}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Safe Operational Limit Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-mono text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Max: 10,000 records/op</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'export'
                ? 'border-[#00F0FF] text-[#00F0FF] bg-white dark:bg-[#0B172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير البيانات (Export)' : 'Export Data'}</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'import'
                ? 'border-[#00F0FF] text-[#00F0FF] bg-white dark:bg-[#0B172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isAr ? 'معالج الاستيراد (Import Wizard)' : 'Import Wizard'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-start">
          
          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              
              {/* Selection Scope Info Banner */}
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-200">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-[#00F0FF] shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block">
                      {isAr ? 'نطاق التحديد للتصدير:' : 'Export Selection Scope:'}
                    </span>
                    <span className="text-slate-300">
                      {selectionDescriptor?.mode === 'QUERY'
                        ? isAr
                          ? `كافة نتائج الاستعلام المفلترة (${effectiveExportCount} سجل)`
                          : `All query matching records (${effectiveExportCount} items) using server descriptor`
                        : isAr
                        ? `${effectiveExportCount} سجل محدد صراحةً`
                        : `${effectiveExportCount} explicitly selected records`}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[11px] font-bold px-2.5 py-1 bg-cyan-950/80 text-[#00F0FF] rounded-lg border border-cyan-500/30">
                  Mode: {selectionDescriptor?.mode || 'EXPLICIT'}
                </span>
              </div>

              {/* Format Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isAr ? 'اختر تنسيق الملف:' : 'Select Export File Format:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'csv',
                      label: 'CSV Delimited (.csv)',
                      desc: 'Raw UTF-8 with CSV Formula Protection',
                      icon: FileText,
                      color: 'text-sky-400 border-sky-500/30 bg-sky-500/5',
                    },
                    {
                      id: 'excel',
                      label: 'Excel Workbook (.xlsx)',
                      desc: 'Formatted spreadsheet with tabular layout',
                      icon: FileSpreadsheet,
                      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
                    },
                    {
                      id: 'json',
                      label: 'JSON Interchange (.json)',
                      desc: 'Developer API payload for system migration',
                      icon: FileCode,
                      color: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
                    },
                  ].map((fmt) => {
                    const IconComp = fmt.icon;
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id as ExchangeFormat)}
                        className={`p-4 border rounded-2xl transition-all cursor-pointer text-start flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? `${fmt.color} ring-2 ring-[#00F0FF]`
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <IconComp className="w-6 h-6" />
                          {isSelected && <Check className="w-4 h-4 text-[#00F0FF]" />}
                        </div>
                        <div>
                          <span className="text-xs font-extrabold block text-slate-900 dark:text-white">
                            {fmt.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {fmt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom File Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اسم الملف المخصص:' : 'Custom Export File Name:'}
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#00F0FF]"
                />
              </div>

              {/* Interactive Field Allow-List Selection */}
              {allowlistFields.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? 'قائمة الحقول المسموح بها (Field Allow-list):' : 'Export Field Allow-List Schema:'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFields(allowlistFields.map((f) => f.key))
                      }
                      className="text-[11px] font-bold text-[#00F0FF] hover:underline cursor-pointer"
                    >
                      {isAr ? 'تحديد الكل' : 'Select All Fields'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                    {allowlistFields.map((field) => {
                      const isChecked = selectedFields.includes(field.key);
                      return (
                        <button
                          key={field.key}
                          type="button"
                          onClick={() => toggleFieldSelection(field.key)}
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-[#00F0FF]'
                              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-400'
                          }`}
                        >
                          <span className="truncate">{isAr ? field.labelAr : field.labelEn}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {exportError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerExport}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer shadow-lg flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري التصدير...' : 'Exporting...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>
                        {isAr
                          ? `تصدير ${effectiveExportCount} سجل الآن`
                          : `Export ${effectiveExportCount} Records Now`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* IMPORT WIZARD TAB (8-STAGE PIPELINE) */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 text-xs font-extrabold">
                <span className="text-[#00F0FF] flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>
                    {isAr ? `مرحلة الاستيراد: ${importStage}` : `Import Pipeline Stage: ${importStage}`}
                  </span>
                </span>

                {importStage !== 'UPLOAD' && (
                  <button
                    onClick={resetImport}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إعادة تعيين المعالج' : 'Reset Wizard'}</span>
                  </button>
                )}
              </div>

              {/* STAGE 1: UPLOAD */}
              {importStage === 'UPLOAD' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#00F0FF] rounded-3xl p-8 text-center bg-slate-50 dark:bg-slate-900/30 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.json"
                      id="import-file-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAndParseFile(file);
                      }}
                    />
                    <label htmlFor="import-file-input" className="cursor-pointer space-y-3 block">
                      <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF]">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                          {isAr ? 'اسحب الملف هنا أو انقر للاستعراض' : 'Drag & drop file here or click to browse'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Supports CSV (.csv) or JSON (.json) up to 10MB (Max 10,000 records)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STAGE 2: PARSING */}
              {importStage === 'PARSING' && (
                <div className="p-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-300">
                    {isAr ? 'جاري تحليل وقراءة بيانات الملف...' : 'Parsing and reading file structure...'}
                  </p>
                </div>
              )}

              {/* STAGE 3: FIELD MAPPING */}
              {importStage === 'MAPPING' && parsedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {isAr ? 'مطابقة أعمدة الملف مع حقول النظام:' : 'Map File Headers to System Schema Fields:'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Total rows detected in file: {parsedData.totalRowCount}
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-white/10 rounded-2xl divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
                    {parsedData.headers.map((hdr) => (
                      <div key={hdr} className="p-3 flex items-center justify-between gap-4">
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {hdr}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                          value={columnMappings[hdr] || '__ignore__'}
                          onChange={(e) =>
                            setColumnMappings({ ...columnMappings, [hdr]: e.target.value })
                          }
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
                        >
                          <option value="__ignore__">-- {isAr ? 'تجاهل هذا العمود' : 'Ignore Column'} --</option>
                          {allowlistFields.map((f) => (
                            <option key={f.key} value={f.key}>
                              {isAr ? f.labelAr : f.labelEn} ({f.key})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => buildImportPlan()}
                      disabled={isPlanning}
                      className="px-5 py-2.5 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isPlanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isAr ? 'جاري إعداد خطة المعاينة والتنفيذ...' : 'Generating Execution Plan & Preview...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isAr ? 'إنشاء خطة التنفيذ والمعاينة' : 'Build Execution Plan & Preview'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 6 & 7: PREVIEW & CONFIRMATION WITH AUTHORITATIVE EXECUTION PLAN */}
              {(importStage === 'PREVIEW' || importStage === 'CONFIRMATION') && (executionPlan || previewResponse) && (
                <div className="space-y-4">
                  {executionPlan && (
                    <>
                      {/* Planned Actions Breakdown & Count Invariants */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">CREATE</span>
                          <span className="text-base font-mono font-extrabold text-emerald-400">{executionPlan.createCount}</span>
                        </div>
                        <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">UPDATE</span>
                          <span className="text-base font-mono font-extrabold text-[#00F0FF]">{executionPlan.updateCount}</span>
                        </div>
                        <div className="p-2.5 bg-slate-500/10 border border-slate-500/30 rounded-2xl text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">SKIP</span>
                          <span className="text-base font-mono font-extrabold text-slate-300">{executionPlan.skipCount}</span>
                        </div>
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">BLOCKED</span>
                          <span className="text-base font-mono font-extrabold text-rose-400">{executionPlan.blockedCount}</span>
                        </div>
                      </div>

                      {/* Policy & Strategy Configurator */}
                      <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">
                              {isAr ? 'سياسة التنفيذ Bulk Policy:' : 'Bulk Execution Policy:'}
                            </label>
                            <div className="flex gap-2">
                              {(['BEST_EFFORT', 'ATOMIC'] as const).map((pol) => (
                                <button
                                  key={pol}
                                  type="button"
                                  onClick={() => buildImportPlan(duplicateStrategy, pol)}
                                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-extrabold cursor-pointer transition-all ${
                                    executionPolicy === pol
                                      ? 'bg-[#00F0FF] text-slate-950 border-[#00F0FF]'
                                      : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {pol}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">
                              {isAr ? 'استراتيجية التكرار Strategy:' : 'Duplicate Strategy:'}
                            </label>
                            <select
                              value={duplicateStrategy}
                              onChange={(e) => buildImportPlan(e.target.value as DuplicateHandlingStrategy, executionPolicy)}
                              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-white"
                            >
                              <option value="SKIP">SKIP (تجاهل المكرر)</option>
                              <option value="OVERWRITE">OVERWRITE (استبدال)</option>
                              <option value="CREATE_COPY">CREATE_COPY (نسخة جديدة)</option>
                            </select>
                          </div>
                        </div>

                        {/* Batch Estimate */}
                        <div className="text-[11px] font-mono text-cyan-300 pt-1 border-t border-white/5 flex justify-between">
                          <span>Est. Operations: {executionPlan.estimatedWriteOperations}</span>
                          <span>Est. Batches: {executionPlan.estimatedBatchCount} (Max {SAFE_FIRESTORE_WRITE_BATCH_SIZE}/batch)</span>
                        </div>
                      </div>

                      {/* Execution Blockers Alert */}
                      {!executionPlan.canExecute && executionPlan.blockers.length > 0 && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                          <div className="flex items-center gap-2 text-rose-400 text-xs font-extrabold">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>{isAr ? 'عقبات تمنع التنفيذ Plan Blocked:' : 'Execution Blockers Detected:'}</span>
                          </div>
                          {executionPlan.blockers.map((b, idx) => (
                            <p key={idx} className="text-[11px] text-rose-300 pl-6">
                              • [{b.code}] {isAr ? b.messageAr : b.messageEn}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Bounded Sample Preview Rows Table */}
                      {previewResponse?.samplePreviewRows && previewResponse.samplePreviewRows.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            {isAr ? 'معاينة عينة الصفوف (حد أقصى 50 صف):' : 'Sample Rows Preview (Capped at 50):'}
                          </span>
                          <div className="border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                            <table className="w-full text-[11px] text-left border-collapse">
                              <thead className="bg-slate-900 text-slate-400 border-b border-white/10 sticky top-0">
                                <tr>
                                  <th className="p-2 w-12">#</th>
                                  <th className="p-2 w-24">Action</th>
                                  <th className="p-2 w-24">Status</th>
                                  <th className="p-2">Data Sample</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 bg-slate-950/40 font-mono">
                                {previewResponse.samplePreviewRows.map((row) => (
                                  <tr key={row.rowNumber} className="hover:bg-white/5">
                                    <td className="p-2 text-slate-400">{row.rowNumber}</td>
                                    <td className="p-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          row.plannedAction === 'CREATE'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : row.plannedAction === 'UPDATE'
                                            ? 'bg-cyan-500/20 text-[#00F0FF]'
                                            : row.plannedAction === 'SKIP'
                                            ? 'bg-slate-700 text-slate-300'
                                            : 'bg-rose-500/20 text-rose-400'
                                        }`}
                                      >
                                        {row.plannedAction}
                                      </span>
                                    </td>
                                    <td className="p-2 text-slate-300">{row.validationStatus}</td>
                                    <td className="p-2 truncate text-slate-400 max-w-xs">
                                      {JSON.stringify(row.mappedFieldsSample)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Typed Confirmation Phrase if updates exist */}
                      {previewResponse?.confirmationRequirements.requiresTypedConfirmation && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-2">
                          <label className="text-[11px] font-bold text-cyan-300 block">
                            {isAr
                              ? 'تأكيد كتابي إضافي مطلوب لاستبدال البيانات (اكتب "OVERWRITE"):'
                              : 'Typed Confirmation Required for Overwrite Operations (type "OVERWRITE"): '}
                          </label>
                          <input
                            type="text"
                            value={typedPhraseInput}
                            onChange={(e) => setTypedPhraseInput(e.target.value)}
                            placeholder="OVERWRITE"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs font-mono font-bold text-cyan-300 focus:outline-hidden"
                          />
                        </div>
                      )}

                      {/* Confirmation & Execution Control */}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Plan ID: {executionPlan.planId}
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => confirmImportPlan(typedPhraseInput)}
                            disabled={!executionPlan.canExecute || isPlanConfirmed}
                            className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                              isPlanConfirmed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                            } disabled:opacity-50`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              {isPlanConfirmed
                                ? isAr
                                  ? 'مؤكد'
                                  : 'Confirmed'
                                : isAr
                                ? 'تأكيد الخطة الجافة'
                                : 'Confirm Plan'}
                            </span>
                          </button>

                          {isPlanConfirmed && (
                            <button
                              type="button"
                              onClick={() => executeImport(typedPhraseInput)}
                              disabled={isExecutingImport}
                              className="px-6 py-2 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                            >
                              {isExecutingImport ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>{isAr ? 'جاري تنفيذ الاستيراد...' : 'Executing Import...'}</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{isAr ? 'بدء تنفيذ الاستيراد المؤكد' : 'Execute Confirmed Import'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STAGE 8.1: EXECUTING IN PROGRESS */}
              {importStage === 'EXECUTING' && (
                <div className="p-8 bg-slate-900 rounded-3xl border border-cyan-500/30 text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#00F0FF] mx-auto" />
                  <h3 className="text-base font-extrabold text-white">
                    {isAr ? 'جاري تنفيذ عمليات قاعدة البيانات...' : 'Executing Authoritative Database Mutations...'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {isAr
                      ? 'يتم الآن تطبيق السجلات والتغييرات على قاعدة البيانات مع فحص المكررات ومنع التضارب.'
                      : 'Applying mutations, resolving duplicates, and writing validated records to the database.'}
                  </p>
                </div>
              )}

              {/* STAGE 8.2: SUMMARY RESULT */}
              {importStage === 'SUMMARY' && importResult && (
                <div className="p-6 bg-slate-900 rounded-3xl border border-white/10 space-y-4 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                    importResult.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : importResult.status === 'PARTIAL'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {importResult.status === 'COMPLETED'
                      ? isAr ? 'تم اكتمال عملية استيراد البيانات بنجاح' : 'Data Import Successfully Completed'
                      : importResult.status === 'PARTIAL'
                      ? isAr ? 'تم اكتمال الاستيراد جزئياً مع وجود أخطاء' : 'Import Completed Partially With Errors'
                      : isAr ? 'فشلت عملية استيراد البيانات' : 'Data Import Execution Failed'}
                  </h3>

                  <div className="grid grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Total</span>
                      <span className="font-mono font-bold text-white text-base">{importResult.totalProcessed}</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <span className="text-emerald-400 block text-[10px]">Inserted</span>
                      <span className="font-mono font-bold text-emerald-400 text-base">{importResult.insertedCount}</span>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-xl">
                      <span className="text-[#00F0FF] block text-[10px]">Updated</span>
                      <span className="font-mono font-bold text-[#00F0FF] text-base">{importResult.updatedCount}</span>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-xl">
                      <span className="text-rose-400 block text-[10px]">Failed</span>
                      <span className="font-mono font-bold text-rose-400 text-base">{importResult.failedCount}</span>
                    </div>
                  </div>

                  {/* Errors / Partial Failure Alert & Download CSV Error Report */}
                  {importResult.failedCount > 0 && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-left">
                      <div className="text-xs text-rose-300">
                        <span className="font-bold block">
                          {isAr ? `${importResult.failedCount} صف فشل في الاستيراد` : `${importResult.failedCount} rows failed import execution`}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isAr ? 'يمكنك تحميل تقرير الأخطاء بالتفصيل لتصحيحه وإعادة رفعه.' : 'Download the CSV error report for row-level details.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadErrorReport(importResult.operationId || importResult.importId)}
                        className="px-3 py-1.5 bg-rose-500 text-white font-extrabold text-[11px] rounded-xl hover:bg-rose-600 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحميل تقرير الأخطاء CSV' : 'Download Error Report (CSV)'}</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetImport();
                        onClose();
                      }}
                      className="px-6 py-2 bg-[#00F0FF] text-slate-950 font-extrabold text-xs rounded-xl hover:bg-[#00D0EE] transition-all cursor-pointer"
                    >
                      {isAr ? 'إغلاق وإكمال' : 'Close & Proceed'}
                    </button>
                  </div>
                </div>
              )}

              {/* Import Error Notice */}
              {importError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
