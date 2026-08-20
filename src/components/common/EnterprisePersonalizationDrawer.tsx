/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Personalization Drawer
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import React from 'react';
import { Columns, Eye, EyeOff, ArrowUp, ArrowDown, LayoutList, RefreshCw, X } from 'lucide-react';
import { DataViewResourceAdapter } from '../../types/dataViewFramework';
import { TableDensity } from '../../types/tableFramework';

export interface EnterprisePersonalizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  adapter: DataViewResourceAdapter;
  visibleColumns: string[];
  columnOrder: string[];
  density: TableDensity;
  pageSize: number;
  isAr?: boolean;
  onVisibleColumnsChange: (cols: string[]) => void;
  onColumnOrderChange: (order: string[]) => void;
  onDensityChange: (density: TableDensity) => void;
  onPageSizeChange: (pageSize: number) => void;
  onReset: () => void;
}

export const EnterprisePersonalizationDrawer: React.FC<EnterprisePersonalizationDrawerProps> = ({
  isOpen,
  onClose,
  adapter,
  visibleColumns,
  columnOrder,
  density,
  pageSize,
  isAr = false,
  onVisibleColumnsChange,
  onColumnOrderChange,
  onDensityChange,
  onPageSizeChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const requiredSet = new Set(adapter.requiredColumns);

  // Toggle single column visibility
  const toggleColumn = (colId: string) => {
    if (requiredSet.has(colId)) return; // Locked

    if (visibleColumns.includes(colId)) {
      if (visibleColumns.length <= 1) return; // Must keep at least one column
      onVisibleColumnsChange(visibleColumns.filter((id) => id !== colId));
    } else {
      onVisibleColumnsChange([...visibleColumns, colId]);
    }
  };

  // Move column order up or down
  const moveColumn = (colId: string, direction: 'up' | 'down') => {
    const idx = columnOrder.indexOf(colId);
    if (idx === -1) return;

    const newOrder = [...columnOrder];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[idx];
    newOrder[idx] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    onColumnOrderChange(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className={`fixed inset-y-0 ${isAr ? 'left-0' : 'right-0'} max-w-full flex pl-10`}>
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
                <Columns className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {isAr ? 'تخصيص عرض الجدول' : 'Personalize Table View'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? adapter.labelAr : adapter.labelEn}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Density Controls */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-[#00F0FF]" />
                {isAr ? 'كثافة أسطر الجدول' : 'Table Row Density'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'comfortable', 'spacious'] as TableDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDensityChange(d)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      density === d
                        ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {d === 'compact' && (isAr ? 'مكثف' : 'Compact')}
                    {d === 'comfortable' && (isAr ? 'افتراضي' : 'Comfortable')}
                    {d === 'spacious' && (isAr ? 'مريح' : 'Spacious')}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isAr ? 'عدد السجلات بالصفحة' : 'Page Size (Records per Page)'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onPageSizeChange(size)}
                    className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      pageSize === size
                        ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Visibility & Ordering */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAr ? 'إظهار وترتيب الأعمدة' : 'Columns & Display Order'}
                </label>
                <span className="text-xs text-[#00F0FF]">
                  {visibleColumns.length} / {adapter.availableColumns.length} {isAr ? 'نشط' : 'active'}
                </span>
              </div>

              <div className="space-y-1.5 divide-y divide-slate-800/60 border border-slate-800 rounded-xl bg-slate-900/60 p-2">
                {columnOrder.map((colId, index) => {
                  const colDef = adapter.availableColumns.find((c) => c.id === colId);
                  if (!colDef) return null;

                  const isVisible = visibleColumns.includes(colId);
                  const isRequired = requiredSet.has(colId);

                  return (
                    <div
                      key={colId}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isVisible ? 'bg-slate-800/30 text-white' : 'text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleColumn(colId)}
                          disabled={isRequired}
                          className={`p-1 rounded transition-colors ${
                            isRequired
                              ? 'text-slate-600 cursor-not-allowed'
                              : isVisible
                              ? 'text-[#00F0FF] hover:bg-slate-700'
                              : 'text-slate-600 hover:text-slate-300'
                          }`}
                          title={isRequired ? (isAr ? 'عمود إجباري' : 'Required Column') : ''}
                        >
                          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <span className="text-xs font-medium">
                          {isAr ? colDef.labelAr : colDef.labelEn}
                        </span>
                        {isRequired && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {isAr ? 'إجباري' : 'Required'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveColumn(colId, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveColumn(colId, 'down')}
                          disabled={index === columnOrder.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isAr ? 'إعادة التعيين' : 'Reset Defaults'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-[#00F0FF] text-slate-950 hover:bg-[#00F0FF]/90 rounded-lg transition-colors font-semibold"
            >
              {isAr ? 'تطبيق وإغلاق' : 'Apply & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
