import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Copy,
  RefreshCw,
  Columns,
  Maximize2,
  Minimize2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  Square,
  ArrowUpDown,
  Plus,
  Bookmark,
  Share2,
  Calendar,
  Tag,
  Layers,
  LayoutGrid,
  TableProperties,
  LucideIcon
} from 'lucide-react';

import { EnterpriseSearchExperience } from './EnterpriseSearchExperience';
import { EnterpriseTableRow } from './EnterpriseTableRow';
import { EnterpriseBulkActionsSystem, BulkActionItem } from './EnterpriseBulkActionsSystem';
import { EnterpriseBulkToolbar } from './EnterpriseBulkToolbar';
import { EnterprisePaginationSystem } from './EnterprisePaginationSystem';
import { EnterpriseTableStatesSystem } from './EnterpriseTableStatesSystem';
import { EnterpriseExportExchangeSystem } from './EnterpriseExportExchangeSystem';
import { BulkSelectionDescriptor } from '../../types/bulkFramework';
import {
  buildEnterpriseExportRequest,
  downloadEnterpriseExport,
  ExportClientError,
} from '../../lib/exchange/exportClient';

export type TableDensity = 'comfortable' | 'default' | 'compact';

export interface EnterpriseTableExportConfig {
  resource?: string;
  enabled?: boolean;
  supportedFormats?: ('csv' | 'xlsx')[];
  defaultFieldMode?: 'DEFAULT_FIELDS' | 'VISIBLE_COLUMNS';
  onExportSuccess?: (info: { format: string; fileName: string; fileSize: number }) => void;
  onExportError?: (error: any) => void;
}

export interface ColumnDef<T> {
  key: string;
  headerEn: string;
  headerAr: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  hideable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  priority?: 1 | 2 | 3 | 4;
}

export interface FilterOption {
  key: string;
  labelEn: string;
  labelAr: string;
  options: { value: string; labelEn: string; labelAr: string }[];
}

export interface SavedView {
  id: string;
  nameEn: string;
  nameAr: string;
  filters?: Record<string, string>;
  density?: TableDensity;
}

export interface BulkAction<T> {
  id: string;
  labelEn: string;
  labelAr: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'danger' | 'secondary';
  onClick: (selectedItems: T[]) => void;
}

export interface EnterpriseDataTableProps<T> {
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchableKeys?: (keyof T)[];
  filterOptions?: FilterOption[];
  savedViews?: SavedView[];
  bulkActions?: BulkAction<T>[];
  rowActions?: (item: T) => {
    labelEn: string;
    labelAr: string;
    icon: LucideIcon;
    variant?: 'default' | 'danger';
    onClick: () => void;
  }[];
  expandableRowRender?: (item: T) => React.ReactNode;
  onCreateNew?: () => void;
  createButtonLabelEn?: string;
  createButtonLabelAr?: string;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
  isAr?: boolean;
  initialDensity?: TableDensity;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  resourceName?: string;
  exportConfig?: EnterpriseTableExportConfig;
}

export function EnterpriseDataTable<T extends Record<string, any>>({
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  columns,
  data,
  keyExtractor,
  searchableKeys = [],
  filterOptions = [],
  savedViews = [],
  bulkActions = [],
  rowActions,
  expandableRowRender,
  onCreateNew,
  createButtonLabelEn = 'Create Record',
  createButtonLabelAr = 'إضافة سجل جديد',
  onRefresh,
  loading = false,
  error = null,
  isAr = false,
  initialDensity = 'default',
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  resourceName = 'shipments',
  exportConfig,
}: EnterpriseDataTableProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState<TableDensity>(initialDensity);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key))
  );
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [showSavedViewsPanel, setShowSavedViewsPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');
  const [selectedSavedView, setSelectedSavedView] = useState<string | null>(null);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Export Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Shortcut key CTRL+K focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('table-global-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global Search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchableKeys.length > 0) {
          return searchableKeys.some((k) => String(item[k] || '').toLowerCase().includes(query));
        }
        return Object.values(item).some((val) => String(val || '').toLowerCase().includes(query));
      });
    }

    // Advanced Filters
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val && val !== 'ALL') {
        result = result.filter((item) => String(item[key]) === val);
      }
    });

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, activeFilters, sortColumn, sortDirection, searchableKeys]);

  // Paginated Data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Selection Handlers
  const isAllSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedKeys.has(keyExtractor(item)));
  const toggleSelectAll = () => {
    const next = new Set(selectedKeys);
    if (isAllSelected) {
      paginatedData.forEach((item) => next.delete(keyExtractor(item)));
    } else {
      paginatedData.forEach((item) => next.add(keyExtractor(item)));
    }
    setSelectedKeys(next);
  };

  const toggleSelectRow = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const toggleExpandRow = (key: string) => {
    const next = new Set(expandedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedKeys(next);
  };

  // Sort Handler
  const handleSort = (key: string) => {
    if (sortColumn === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else setSortColumn(null);
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Export State & Handlers
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const supportedExportFormats = exportConfig?.supportedFormats || ['csv'];
  const supportsCSVExport = supportedExportFormats.includes('csv');
  const supportsXLSXExport = supportedExportFormats.includes('xlsx');

  const handleExecuteExport = async (
    format: 'csv' | 'xlsx',
    scope: 'PAGE' | 'EXPLICIT' | 'QUERY',
    fieldMode: 'DEFAULT_FIELDS' | 'VISIBLE_COLUMNS' = exportConfig?.defaultFieldMode || 'VISIBLE_COLUMNS'
  ) => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
      let selection: BulkSelectionDescriptor;
      const effectiveResource = exportConfig?.resource || resourceName || 'shipments';

      if (scope === 'PAGE') {
        selection = {
          mode: 'PAGE',
          ids: paginatedData.map(keyExtractor),
          page: currentPage,
        };
      } else if (scope === 'EXPLICIT' || (selectedKeys.size > 0 && scope !== 'QUERY')) {
        selection = {
          mode: 'EXPLICIT',
          ids: Array.from(selectedKeys),
        };
      } else {
        selection = {
          mode: 'QUERY',
          resource: effectiveResource,
          query: {
            search: searchTerm,
            filters: activeFilters,
            sort: sortColumn ? { field: sortColumn, direction: sortDirection } : null,
            pagination: { page: currentPage, pageSize },
          },
          excludedIds: [],
        };
      }

      const req = buildEnterpriseExportRequest({
        resource: effectiveResource,
        format,
        selection,
        visibleFieldKeys: fieldMode === 'VISIBLE_COLUMNS' ? Array.from(visibleColumns) : undefined,
        fieldMode,
        locale: isAr ? 'ar' : 'en',
      });

      const result = await downloadEnterpriseExport(req);

      showToast(
        isAr
          ? `تم تصدير البيانات بنجاح (${result.fileName})`
          : `Exported successfully (${result.fileName})`
      );

      if (exportConfig?.onExportSuccess) {
        exportConfig.onExportSuccess(result);
      }
    } catch (err: any) {
      const msg = isAr && err instanceof ExportClientError && err.messageAr ? err.messageAr : err.message || 'Export failed.';
      setExportError(msg);
      showToast(isAr ? `خطأ في التصدير: ${msg}` : `Export Error: ${msg}`);
      if (exportConfig?.onExportError) {
        exportConfig.onExportError(err);
      }
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleCopyToClipboard = () => {
    const activeCols = columns.filter((c) => visibleColumns.has(c.key));
    const headers = activeCols.map((c) => (isAr ? c.headerAr : c.headerEn)).join('\t');
    const rows = filteredData.map((item) =>
      activeCols.map((c) => String(item[c.key] ?? '')).join('\t')
    );
    const text = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(text);
    showToast(isAr ? 'تم نسخ البيانات إلى الحافظة' : 'Copied table data to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  // Padding based on density
  const getRowPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'py-1.5 px-3 text-xs';
      case 'comfortable':
        return 'py-4 px-4 text-sm';
      case 'default':
      default:
        return 'py-2.5 px-3.5 text-xs';
    }
  };

  const getHeaderPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'py-2 px-3 text-[10px]';
      case 'comfortable':
        return 'py-3.5 px-4 text-xs';
      case 'default':
      default:
        return 'py-2.5 px-3.5 text-[11px]';
    }
  };

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedKeys.has(keyExtractor(item)));
  }, [data, selectedKeys, keyExtractor]);

  return (
    <div className="w-full bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden text-slate-800 dark:text-slate-100 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-50 px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg animate-bounce flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Table Header / Title Bar */}
      {(titleEn || titleAr) && (
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isAr ? titleAr : titleEn}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F0FF] border border-cyan-500/20 font-mono">
                {totalItems} {isAr ? 'سجل' : 'records'}
              </span>
            </h2>
            {(subtitleEn || subtitleAr) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr ? subtitleAr : subtitleEn}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="px-3 py-1.5 bg-[#00F0FF] hover:bg-[#00D0EE] text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? createButtonLabelAr : createButtonLabelEn}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toolbar Area */}
      <div className="p-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#0B172A]">
        {/* Left Toolbar Controls: Global Search & Shortcuts */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="flex-1 max-w-md">
            <EnterpriseSearchExperience
              isAr={isAr}
              onSearchChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholderEn="Search records... (Ctrl + K)"
              placeholderAr="بحث في السجلات... (Ctrl + K)"
            />
          </div>

          {/* Filter Toggle */}
          {filterOptions.length > 0 && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                Object.keys(activeFilters).some((k) => activeFilters[k] !== 'ALL') || showFilterPanel
                  ? 'bg-cyan-500/10 text-[#00F0FF] border-cyan-500/30'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصفية متقدمة' : 'Filters'}</span>
              {Object.keys(activeFilters).filter((k) => activeFilters[k] !== 'ALL').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00F0FF] text-slate-950 text-[10px] flex items-center justify-center font-extrabold">
                  {Object.keys(activeFilters).filter((k) => activeFilters[k] !== 'ALL').length}
                </span>
              )}
            </button>
          )}

          {/* Saved Views Toggle */}
          {savedViews.length > 0 && (
            <button
              onClick={() => setShowSavedViewsPanel(!showSavedViewsPanel)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'العروض المحفوظة' : 'Views'}</span>
            </button>
          )}
        </div>

        {/* Right Toolbar Controls: Columns, Density, Export, Refresh */}
        <div className="flex items-center gap-1.5">
          {/* Columns Visibility */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPanel(!showColumnPanel)}
              className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title={isAr ? 'إدارة الأعمدة' : 'Column Visibility'}
            >
              <Columns className="w-4 h-4" />
            </button>
            {showColumnPanel && (
              <div className="absolute end-0 top-9 z-30 w-52 p-3 bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl space-y-2">
                <p className="text-xs font-extrabold border-b border-slate-100 dark:border-white/10 pb-1.5">
                  {isAr ? 'تخصيص الأعمدة' : 'Manage Columns'}
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {columns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer hover:text-[#00F0FF]"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.key)}
                        onChange={() => {
                          const next = new Set(visibleColumns);
                          if (next.has(col.key)) {
                            if (next.size > 1) next.delete(col.key);
                          } else {
                            next.add(col.key);
                          }
                          setVisibleColumns(next);
                        }}
                        className="rounded accent-[#00F0FF]"
                      />
                      <span>{isAr ? col.headerAr : col.headerEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Layout View Selector (Table vs Mobile Cards) */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                viewLayout === 'table' ? 'bg-[#00F0FF] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'عرض الجدول' : 'Table View'}
            >
              <TableProperties className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                viewLayout === 'cards' ? 'bg-[#00F0FF] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'عرض البطاقات المتجاوبة' : 'Responsive Card View'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Density Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setDensity('compact')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                density === 'compact' ? 'bg-[#00F0FF] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'مكثف' : 'Compact'}
            >
              C
            </button>
            <button
              onClick={() => setDensity('default')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                density === 'default' ? 'bg-[#00F0FF] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'افتراضي' : 'Default'}
            >
              D
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                density === 'comfortable' ? 'bg-[#00F0FF] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'مريح' : 'Comfortable'}
            >
              M
            </button>
          </div>

          {/* Export Menu Popover & Quick Export Controls */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className={`p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isExporting ? 'opacity-50 cursor-not-allowed' : 'text-[#00F0FF]'
              }`}
              title={isAr ? 'تصدير البيانات' : 'Export Data Options'}
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#00F0FF]" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {showExportMenu && (
              <div className="absolute end-0 top-9 z-40 w-64 p-3 bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/10 text-xs font-extrabold text-slate-900 dark:text-white">
                  <span>{isAr ? 'خيارات تصدير البيانات' : 'Export Data Options'}</span>
                  <button
                    onClick={() => setShowExportMenu(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {/* Current Page */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isAr ? `الصفحة الحالية (${paginatedData.length})` : `Current Page (${paginatedData.length})`}
                    </span>
                    <div className={`grid gap-1.5 ${supportsCSVExport && supportsXLSXExport ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {supportsCSVExport && (
                        <button
                          onClick={() => handleExecuteExport('csv', 'PAGE')}
                          disabled={isExporting}
                          className="px-2 py-1 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 hover:border-cyan-500 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#00F0FF] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>CSV</span>
                        </button>
                      )}
                      {supportsXLSXExport && (
                        <button
                          onClick={() => handleExecuteExport('xlsx', 'PAGE')}
                          disabled={isExporting}
                          className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-[11px] font-extrabold text-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>XLSX</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selected Records */}
                  {selectedKeys.size > 0 && (
                    <div className="p-2 bg-cyan-500/5 rounded-xl space-y-1 border border-cyan-500/20">
                      <span className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider block">
                        {isAr ? `السجلات المحددة (${selectedKeys.size})` : `Selected Records (${selectedKeys.size})`}
                      </span>
                      <div className={`grid gap-1.5 ${supportsCSVExport && supportsXLSXExport ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {supportsCSVExport && (
                          <button
                            onClick={() => handleExecuteExport('csv', 'EXPLICIT')}
                            disabled={isExporting}
                            className="px-2 py-1 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 hover:border-cyan-500 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#00F0FF] transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>CSV</span>
                          </button>
                        )}
                        {supportsXLSXExport && (
                          <button
                            onClick={() => handleExecuteExport('xlsx', 'EXPLICIT')}
                            disabled={isExporting}
                            className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-[11px] font-extrabold text-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>XLSX</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* All Matching Query Records */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isAr ? `كافة النتائج المفلترة (${filteredData.length})` : `All Matching (${filteredData.length})`}
                    </span>
                    <div className={`grid gap-1.5 ${supportsCSVExport && supportsXLSXExport ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {supportsCSVExport && (
                        <button
                          onClick={() => handleExecuteExport('csv', 'QUERY')}
                          disabled={isExporting}
                          className="px-2 py-1 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 hover:border-cyan-500 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#00F0FF] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>CSV</span>
                        </button>
                      )}
                      {supportsXLSXExport && (
                        <button
                          onClick={() => handleExecuteExport('xlsx', 'QUERY')}
                          disabled={isExporting}
                          className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-[11px] font-extrabold text-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>XLSX</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Advanced Customization Button */}
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setShowExportModal(true);
                    }}
                    className="w-full pt-1.5 text-[11px] font-bold text-[#00F0FF] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{isAr ? 'إعدادات وقوالب التصدير المتقدمة...' : 'Advanced Export System...'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyToClipboard}
            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title={isAr ? 'نسخ للذاكرة' : 'Copy Data'}
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title={isAr ? 'طباعة' : 'Print Table'}
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title={isAr ? 'تحديث البيانات' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00F0FF]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilterPanel && filterOptions.length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
          {filterOptions.map((opt) => (
            <div key={opt.key} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {isAr ? opt.labelAr : opt.labelEn}
              </label>
              <select
                value={activeFilters[opt.key] || 'ALL'}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    [opt.key]: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="ALL">{isAr ? 'الكل' : 'All'}</option>
                {opt.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {isAr ? o.labelAr : o.labelEn}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-1">
            <button
              onClick={() => setActiveFilters({})}
              className="px-3 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        </div>
      )}

      {/* Saved Views Panel */}
      {showSavedViewsPanel && savedViews.length > 0 && (
        <div className="p-3 bg-amber-500/5 border-b border-amber-500/20 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-amber-400 me-2 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isAr ? 'نماذج العرض المسجلة:' : 'Saved Views:'}</span>
          </span>
          {savedViews.map((sv) => (
            <button
              key={sv.id}
              onClick={() => {
                setSelectedSavedView(sv.id);
                if (sv.filters) setActiveFilters(sv.filters);
                if (sv.density) setDensity(sv.density);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSavedView === sv.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-500'
              }`}
            >
              {isAr ? sv.nameAr : sv.nameEn}
            </button>
          ))}
        </div>
      )}

      {/* Bulk Actions System */}
      {selectedKeys.size > 0 && (
        <div className="p-2 border-b border-slate-200 dark:border-white/10">
          <EnterpriseBulkToolbar
            resource={resourceName || 'shipments'}
            selectionState={{
              mode: selectedKeys.size === filteredData.length && filteredData.length > 0 ? 'PAGE' : 'EXPLICIT',
              selectedIds: selectedKeys,
              excludedIds: new Set(),
              resource: resourceName || 'shipments',
              querySnapshot: null,
              pageIds: filteredData.map((d) => keyExtractor(d)),
              totalMatchingCount: data.length,
              visibleCount: filteredData.length,
              version: 1,
            }}
            selectionDescriptor={{
              mode: 'EXPLICIT',
              ids: Array.from(selectedKeys),
            }}
            onClearSelection={() => setSelectedKeys(new Set())}
            onSelectAllMatching={() => setSelectedKeys(new Set(filteredData.map((d) => keyExtractor(d))))}
            isAr={isAr}
            customActions={
              bulkActions && bulkActions.length > 0
                ? bulkActions.map((ba) => ({
                    id: ba.id,
                    resource: resourceName || 'shipments',
                    labelEn: ba.labelEn,
                    labelAr: ba.labelAr,
                    icon: 'RefreshCw',
                    variant: ba.variant as any,
                    handler: async () => {
                      ba.onClick(selectedItems);
                      return {
                        operationId: `op_${Date.now()}`,
                        resource: resourceName || 'shipments',
                        actionId: ba.id,
                        requestedCount: selectedKeys.size,
                        processedCount: selectedKeys.size,
                        succeededCount: selectedKeys.size,
                        failedCount: 0,
                        skippedCount: 0,
                        status: 'COMPLETED',
                        executionTimeMs: 100,
                      };
                    },
                  }))
                : undefined
            }
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 flex flex-col items-center justify-center text-center gap-2">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-extrabold">{isAr ? 'حدث خطأ في تحميل البيانات' : 'Failed to load table data'}</p>
          <p className="text-xs text-rose-300 max-w-md">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Table / Responsive Cards Container */}
      {viewLayout === 'cards' ? (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[240px]">
          {loading ? (
            <div className="col-span-full">
              <EnterpriseTableStatesSystem type="loading" isAr={isAr} skeletonRowCount={3} />
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <EnterpriseTableStatesSystem
                type={searchTerm || Object.keys(activeFilters).length > 0 ? 'no-results' : 'empty'}
                searchQuery={searchTerm}
                isAr={isAr}
                onClearSearch={searchTerm ? () => setSearchTerm('') : undefined}
                onResetFilters={
                  Object.keys(activeFilters).length > 0 ? () => setActiveFilters({}) : undefined
                }
              />
            </div>
          ) : (
            paginatedData.map((item) => {
              const rowKey = keyExtractor(item);
              const isSelected = selectedKeys.has(rowKey);
              const isExpanded = expandedKeys.has(rowKey);
              const activeCols = columns.filter((c) => visibleColumns.has(c.key));
              const primaryCol = activeCols[0];
              const secondaryCols = activeCols.slice(1);

              return (
                <div
                  key={rowKey}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-[#00F0FF]/50 ring-1 ring-[#00F0FF]/30'
                      : 'bg-white dark:bg-[#080E1A] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(rowKey)}
                        className="p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-slate-400 hover:text-[#00F0FF] cursor-pointer"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-[#00F0FF]" /> : <Square className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                          {primaryCol ? (primaryCol.accessor ? primaryCol.accessor(item) : String(item[primaryCol.key] ?? '-')) : rowKey}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {rowKey}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {secondaryCols.slice(0, 4).map((col) => (
                      <div key={col.key} className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold block truncate">
                          {isAr ? col.headerAr : col.headerEn}
                        </span>
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {col.accessor ? col.accessor(item) : String(item[col.key] ?? '-')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Details Accordion */}
                  {secondaryCols.length > 4 && (
                    <React.Fragment>
                      <button
                        type="button"
                        onClick={() => toggleExpandRow(rowKey)}
                        className="w-full py-1.5 text-[11px] font-bold text-[#00F0FF] hover:bg-[#00F0FF]/5 rounded-lg flex items-center justify-center gap-1 transition-colors min-h-[44px] sm:min-h-0 cursor-pointer"
                      >
                        <span>{isExpanded ? (isAr ? 'إخفاء التفاصيل' : 'Hide Details') : (isAr ? 'عرض التفاصيل المتبقية' : 'Show More Details')}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl grid grid-cols-2 gap-2 text-xs border border-slate-100 dark:border-white/5 animate-in fade-in duration-150">
                          {secondaryCols.slice(4).map((col) => (
                            <div key={col.key} className="space-y-0.5">
                              <span className="text-[10px] text-slate-400 font-semibold block truncate">
                                {isAr ? col.headerAr : col.headerEn}
                              </span>
                              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {col.accessor ? col.accessor(item) : String(item[col.key] ?? '-')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  )}

                  {/* Card Actions Footer */}
                  {rowActions && (
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-1.5">
                      {rowActions(item).map((act, idx) => {
                        const Icon = act.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={act.onClick}
                            className="px-3 py-2 min-h-[44px] sm:min-h-0 bg-slate-100 dark:bg-white/10 hover:bg-[#00F0FF] hover:text-slate-950 font-bold text-xs text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{isAr ? act.labelAr : act.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="overflow-x-auto min-h-[240px]">
          <table className="w-full text-start border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#030712] border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider select-none">
            <tr>
              {/* Checkbox Column */}
              <th className={`w-10 ${getHeaderPaddingClass()} text-center`}>
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors cursor-pointer"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              {/* Expand Column if supported */}
              {expandableRowRender && <th className={`w-10 ${getHeaderPaddingClass()}`}></th>}

              {/* Data Columns */}
              {columns
                .filter((c) => visibleColumns.has(c.key))
                .map((col) => {
                  const getPriorityClass = (p?: 1 | 2 | 3 | 4) => {
                    if (p === 2) return 'hidden sm:table-cell';
                    if (p === 3) return 'hidden md:table-cell';
                    if (p === 4) return 'hidden lg:table-cell';
                    return 'table-cell';
                  };

                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`${getHeaderPaddingClass()} text-${col.align || 'start'} ${getPriorityClass(col.priority)}`}
                    >
                      {col.sortable ? (
                        <button
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1.5 hover:text-[#00F0FF] transition-colors cursor-pointer"
                        >
                          <span>{isAr ? col.headerAr : col.headerEn}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      ) : (
                        <span>{isAr ? col.headerAr : col.headerEn}</span>
                      )}
                    </th>
                  );
                })}

              {/* Actions Column */}
              {rowActions && <th className={`${getHeaderPaddingClass()} text-end`}>{isAr ? 'إجراءات' : 'Actions'}</th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium text-slate-800 dark:text-slate-200">
            {loading ? (
              // Loading Skeleton Rows
              <tr>
                <td
                  colSpan={
                    columns.filter((c) => visibleColumns.has(c.key)).length +
                    1 +
                    (expandableRowRender ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="p-0"
                >
                  <EnterpriseTableStatesSystem
                    type="loading"
                    isAr={isAr}
                    skeletonRowCount={pageSize > 5 ? 5 : pageSize}
                    skeletonColumnCount={columns.filter((c) => visibleColumns.has(c.key)).length}
                  />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              // Empty or No Results State
              <tr>
                <td
                  colSpan={
                    columns.filter((c) => visibleColumns.has(c.key)).length +
                    1 +
                    (expandableRowRender ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="py-12 text-center"
                >
                  <EnterpriseTableStatesSystem
                    type={searchTerm || Object.keys(activeFilters).length > 0 ? 'no-results' : 'empty'}
                    searchQuery={searchTerm}
                    isAr={isAr}
                    onClearSearch={searchTerm ? () => setSearchTerm('') : undefined}
                    onResetFilters={
                      Object.keys(activeFilters).length > 0
                        ? () => setActiveFilters({})
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              // Active Data Rows
              paginatedData.map((item) => {
                const rowKey = keyExtractor(item);
                const isSelected = selectedKeys.has(rowKey);
                const isExpanded = expandedKeys.has(rowKey);

                const activeColumns = columns.filter((c) => visibleColumns.has(c.key));

                const formattedInlineActions = rowActions
                  ? rowActions(item).slice(0, 2).map((act, idx) => ({
                      id: `act-${idx}`,
                      labelEn: act.labelEn,
                      labelAr: act.labelAr,
                      icon: act.icon,
                      variant: act.variant === 'danger' ? ('danger' as const) : ('default' as const),
                      onClick: act.onClick,
                    }))
                  : [];

                const formattedOverflowActions = rowActions && rowActions(item).length > 2
                  ? rowActions(item).slice(2).map((act, idx) => ({
                      id: `ov-act-${idx}`,
                      labelEn: act.labelEn,
                      labelAr: act.labelAr,
                      icon: act.icon,
                      variant: act.variant === 'danger' ? ('danger' as const) : ('default' as const),
                      onClick: act.onClick,
                    }))
                  : [];

                return (
                  <EnterpriseTableRow
                    key={rowKey}
                    item={item}
                    rowId={rowKey}
                    columns={activeColumns.map((col) => ({
                      key: col.key,
                      align: col.align,
                      width: col.width,
                      priority: col.priority,
                      accessor: col.accessor
                        ? (it) => col.accessor!(it)
                        : (it) => String(it[col.key] ?? '-'),
                    }))}
                    isSelected={isSelected}
                    onToggleSelect={toggleSelectRow}
                    isExpanded={isExpanded}
                    onToggleExpand={expandableRowRender ? toggleExpandRow : undefined}
                    expandableContent={expandableRowRender ? expandableRowRender(item) : undefined}
                    density={density}
                    isAr={isAr}
                    inlineActions={formattedInlineActions}
                    overflowActions={formattedOverflowActions}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Enterprise Pagination & Footer */}
      <EnterprisePaginationSystem
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={pageSizeOptions}
        isAr={isAr}
        isLoading={loading}
      />

      {/* Enterprise Export & Data Exchange Modal */}
      <EnterpriseExportExchangeSystem
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resource={exportConfig?.resource || resourceName || 'shipments'}
        selectionDescriptor={
          selectedKeys.size > 0
            ? {
                mode: 'EXPLICIT',
                ids: Array.from(selectedKeys),
              }
            : {
                mode: 'QUERY',
                resource: exportConfig?.resource || resourceName || 'shipments',
                query: {
                  search: searchTerm,
                  filters: activeFilters,
                  sort: sortColumn ? { field: sortColumn, direction: sortDirection } : null,
                  pagination: { page: currentPage, pageSize },
                },
                excludedIds: [],
              }
        }
        selectedCount={selectedKeys.size}
        filteredCount={filteredData.length}
        totalCount={data.length}
        isAr={isAr}
        onExecuteExport={(format, scope, config) => {
          showToast(
            isAr
              ? `تم إنشاء ملف التصدير بنجاح (${format.toUpperCase()})`
              : `Export file generated successfully (${format.toUpperCase()})`
          );
        }}
      />
    </div>
  );
}
