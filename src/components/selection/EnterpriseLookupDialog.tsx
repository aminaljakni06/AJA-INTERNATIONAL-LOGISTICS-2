/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Lookup Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Selection, Lookup & Autocomplete System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  Grid,
  List,
  Star,
  Check,
  Building2,
  Package,
  Truck,
  Anchor,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  LookupType,
  LookupItem,
  EntityPreview,
  LookupConfiguration,
} from '../../types/selectionLookupFramework';
import { useEnterpriseLookup } from '../../hooks/useEnterpriseLookup';
import { EnterpriseLookupEngine } from '../../services/selection/lookupEngine';

export interface EnterpriseLookupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lookupType: LookupType;
  titleEn?: string;
  titleAr?: string;
  allowMultiple?: boolean;
  selectedIds?: string[];
  onSelectItems: (items: LookupItem[]) => void;
  isAr?: boolean;
}

export const EnterpriseLookupDialog: React.FC<EnterpriseLookupDialogProps> = ({
  isOpen,
  onClose,
  lookupType,
  titleEn = 'Enterprise Record Lookup',
  titleAr = 'البحث في سجلات المؤسسة',
  allowMultiple = false,
  selectedIds = [],
  onSelectItems,
  isAr = false,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedItemsState, setSelectedItemsState] = useState<string[]>(selectedIds);
  const [activePreviewItem, setActivePreviewItem] = useState<LookupItem | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const {
    items,
    totalCount,
    hasMore,
    loading,
    searchDurationMs,
    filter,
    updateSearchKeyword,
    updateCategory,
    updateStatus,
    toggleFavorite,
  } = useEnterpriseLookup({
    lookupType,
    debounceMs: 250,
  });

  if (!isOpen) return null;

  const handleToggleSelect = (item: LookupItem) => {
    if (allowMultiple) {
      let next: string[];
      if (selectedItemsState.includes(item.id)) {
        next = selectedItemsState.filter((id) => id !== item.id);
      } else {
        next = [...selectedItemsState, item.id];
      }
      setSelectedItemsState(next);
    } else {
      setSelectedItemsState([item.id]);
      onSelectItems([item]);
      onClose();
    }
  };

  const handleConfirmMultiSelect = () => {
    const selectedObjs = items.filter((it) => selectedItemsState.includes(it.id));
    onSelectItems(selectedObjs);
    onClose();
  };

  const previewModel: EntityPreview | null = activePreviewItem
    ? EnterpriseLookupEngine.getEntityPreview(activePreviewItem, lookupType)
    : null;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? titleAr : titleEn}
              </h2>
              <span className="text-xs text-slate-400">
                {isAr ? `إجمالي السجلات: ${totalCount}` : `Total matching records: ${totalCount}`} (
                {searchDurationMs}ms)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-600'
                    : 'text-slate-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-600'
                    : 'text-slate-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className={`w-4 h-4 absolute ${
                  isAr ? 'right-3.5' : 'left-3.5'
                } top-3 text-slate-400`}
              />
              <input
                type="text"
                value={filter.searchKeyword || ''}
                onChange={(e) => updateSearchKeyword(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث بالاسم، الكود، الفئة أو الوسوم...'
                    : 'Search by name, code, category, or tags...'
                }
                className={`w-full py-2.5 ${
                  isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
                } text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20`}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{isAr ? 'التصفية' : 'Filters'}</span>
            </button>
          </div>

          {/* Expanded Advanced Filters Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? 'الحالة:' : 'Status:'}
              </span>
              {['ALL', 'ACTIVE', 'IN_TRANSIT', 'PENDING'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateStatus(st === 'ALL' ? '' : st)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    (filter.status || 'ALL') === st || (st === 'ALL' && !filter.status)
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dialog Body (Split view: Item List + Preview Drawer) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Results Container */}
          <div className="flex-1 p-4 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                <Search className="w-8 h-8 stroke-1" />
                <span className="text-sm font-semibold">
                  {isAr ? 'لا توجد نتائج مطابقة' : 'No records match your criteria'}
                </span>
              </div>
            ) : viewMode === 'list' ? (
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const isChecked = selectedItemsState.includes(item.id);
                  const isHoveredPreview = activePreviewItem?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActivePreviewItem(item)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isHoveredPreview
                          ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {allowMultiple && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(item)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-slate-300"
                          />
                        )}

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {isAr ? item.nameAr : item.nameEn}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded shrink-0">
                              {item.code}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 truncate">
                            {isAr ? item.subtitleAr : item.subtitleEn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="p-1 hover:text-amber-500 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              item.isFavorite
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>

                        {!allowMultiple && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelect(item);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                          >
                            {isAr ? 'اختيار' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActivePreviewItem(item)}
                    className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col justify-between gap-3 hover:border-amber-500 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 rounded-md">
                        {item.code}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.isFavorite
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {isAr ? item.nameAr : item.nameEn}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-2">
                        {isAr ? item.subtitleAr : item.subtitleEn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSelect(item)}
                      className="w-full py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white rounded-lg transition-colors"
                    >
                      {isAr ? 'اختيار Record' : 'Pick Record'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Entity Preview Drawer Panel */}
          {previewModel && (
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isAr ? 'معاينة السجل' : 'Entity Preview'}
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {previewModel.badgeStatus}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? previewModel.primaryTitleAr : previewModel.primaryTitleEn}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {isAr ? previewModel.secondarySubtitleAr : previewModel.secondarySubtitleEn}
                </span>
              </div>

              {/* Metadata Key Value Details */}
              {previewModel.metadataMap && previewModel.metadataMap.length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {previewModel.metadataMap.map((meta, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{isAr ? meta.labelAr : meta.labelEn}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {meta.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar for Multi-Select Confirmation */}
        {allowMultiple && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isAr
                ? `العناصر المحددة: ${selectedItemsState.length}`
                : `Selected items: ${selectedItemsState.length}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmMultiSelect}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-colors"
              >
                {isAr ? 'تأكيد الاختيار' : 'Confirm Selection'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
