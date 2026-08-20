import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export interface EnterprisePaginationSystemProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isAr?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessageEn?: string;
  errorMessageAr?: string;
  isSticky?: boolean;
  isCompact?: boolean;
  lastUpdatedTextEn?: string;
  lastUpdatedTextAr?: string;
  className?: string;
}

export const EnterprisePaginationSystem: React.FC<EnterprisePaginationSystemProps> = ({
  currentPage = 1,
  pageSize = 25,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100, 250],
  isAr = false,
  isLoading = false,
  hasError = false,
  errorMessageEn = 'Failed to load pagination metadata',
  errorMessageAr = 'فشل تحميل بيانات التنقل بين الصفحات',
  isSticky = false,
  isCompact = false,
  lastUpdatedTextEn = 'Updated just now',
  lastUpdatedTextAr = 'تم التحديث للتو',
  className = '',
}) => {
  const [jumpToPageInput, setJumpToPageInput] = useState<string>('');
  const [showJumpInput, setShowJumpInput] = useState<boolean>(false);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(validCurrentPage * pageSize, totalItems);

  // Helper to generate smart pagination numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = isCompact ? 3 : 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, validCurrentPage - 1);
      let end = Math.min(totalPages - 1, validCurrentPage + 1);

      if (validCurrentPage <= 3) {
        end = 4;
      } else if (validCurrentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Jump to specific page submit
  const handleJumpToPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setShowJumpInput(false);
      setJumpToPageInput('');
    }
  };

  if (isLoading) {
    return (
      <div className={`p-3 bg-white dark:bg-[#0B172A] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48" />
        <div className="flex items-center gap-2">
          <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-24" />
          <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-32" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`p-3 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-between gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{isAr ? errorMessageAr : errorMessageEn}</span>
        </div>
        <button
          onClick={() => onPageChange(currentPage)}
          className="px-2.5 py-1 bg-rose-500/20 rounded-lg hover:bg-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-3 bg-white dark:bg-[#0B172A] border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs select-none transition-all ${
        isSticky ? 'sticky bottom-0 z-30 shadow-lg' : ''
      } ${className}`}
    >
      {/* Left Side: Record Summary & Last Updated Metadata */}
      <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
        <span>
          {isAr
            ? `عرض ${startRecord.toLocaleString('ar-SA')} - ${endRecord.toLocaleString('ar-SA')} من أصل ${totalItems.toLocaleString('ar-SA')} سجل`
            : `Showing ${startRecord.toLocaleString()}–${endRecord.toLocaleString()} of ${totalItems.toLocaleString()} records`}
        </span>

        <span className="hidden sm:inline text-slate-300 dark:text-white/10">•</span>

        {/* Current Page Badge */}
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
          {isAr ? `صفحة ${validCurrentPage} من ${totalPages}` : `Page ${validCurrentPage} of ${totalPages}`}
        </span>

        {lastUpdatedTextEn && (
          <span className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-[#00F0FF]" />
            <span>{isAr ? lastUpdatedTextAr : lastUpdatedTextEn}</span>
          </span>
        )}
      </div>

      {/* Right Side: Navigation & Page Size Selector Controls */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
        {/* Page Size Selector Dropdown */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 me-2">
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              {isAr ? 'السجلات لكل صفحة:' : 'Rows per page:'}
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-white dark:bg-[#0B172A] text-slate-900 dark:text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Jump Input Popover Trigger */}
        <div className="relative">
          {showJumpInput ? (
            <form onSubmit={handleJumpToPageSubmit} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpToPageInput}
                onChange={(e) => setJumpToPageInput(e.target.value)}
                placeholder={`1-${totalPages}`}
                autoFocus
                className="w-16 px-2 py-1 bg-slate-100 dark:bg-white/5 border border-[#00F0FF] rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-[#00F0FF] text-slate-950 font-bold text-xs rounded-lg hover:bg-[#00D0EE] transition-colors cursor-pointer"
              >
                {isAr ? 'انتقال' : 'Go'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowJumpInput(true)}
              className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-[#00F0FF] hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer hidden sm:inline"
              title={isAr ? 'الانتقال السريع لصفحة محدودة' : 'Jump to page'}
            >
              {isAr ? 'انتقال برقم الصفحات' : 'Jump to page'}
            </button>
          )}
        </div>

        {/* Navigation Buttons Controls */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={validCurrentPage === 1}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 disabled:opacity-40 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title={isAr ? 'الصفحة الأولى' : 'First Page'}
          >
            {isAr ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 disabled:opacity-40 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title={isAr ? 'الصفحة السابقة' : 'Previous Page'}
          >
            {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Smart Page Numbers */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-mono">
                    ...
                  </span>
                );
              }

              const pageNum = p as number;
              const isActive = pageNum === validCurrentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-[#00F0FF] text-slate-950 font-extrabold shadow-xs'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(validCurrentPage + 1)}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 disabled:opacity-40 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title={isAr ? 'الصفحة التالية' : 'Next Page'}
          >
            {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 disabled:opacity-40 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title={isAr ? 'الصفحة الأخيرة' : 'Last Page'}
          >
            {isAr ? <ChevronsLeft className="w-3.5 h-3.5" /> : <ChevronsRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
