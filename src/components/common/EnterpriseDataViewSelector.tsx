/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data View Selector
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bookmark,
  ChevronDown,
  Star,
  Plus,
  Save,
  Trash2,
  Sliders,
  RotateCcw,
  Check,
  Globe,
  User,
  ShieldAlert,
} from 'lucide-react';
import { EnterpriseDataView, DataViewResourceAdapter } from '../../types/dataViewFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { TableDensity } from '../../types/tableFramework';
import { EnterprisePersonalizationDrawer } from './EnterprisePersonalizationDrawer';

export interface EnterpriseDataViewSelectorProps {
  adapter: DataViewResourceAdapter;
  views: EnterpriseDataView[];
  systemViews: EnterpriseDataView[];
  userViews: EnterpriseDataView[];
  sharedViews: EnterpriseDataView[];
  activeView: EnterpriseDataView;
  currentQuery: EnterpriseQueryState;
  visibleColumns: string[];
  columnOrder: string[];
  density: TableDensity;
  isModified: boolean;
  isAr?: boolean;
  onActivateView: (viewId: string) => void;
  onSaveCurrentView: (customNameEn?: string, customNameAr?: string, isDefault?: boolean) => Promise<any>;
  onSaveViewAs: (nameEn: string, nameAr: string, isDefault?: boolean) => Promise<any>;
  onDeleteView: (viewId: string) => Promise<any>;
  onSetDefaultView: (viewId: string) => Promise<any>;
  onResetActiveView: () => void;
  onVisibleColumnsChange: (cols: string[]) => void;
  onColumnOrderChange: (order: string[]) => void;
  onDensityChange: (density: TableDensity) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const EnterpriseDataViewSelector: React.FC<EnterpriseDataViewSelectorProps> = ({
  adapter,
  views: _views,
  systemViews,
  userViews,
  sharedViews,
  activeView,
  currentQuery,
  visibleColumns,
  columnOrder,
  density,
  isModified,
  isAr = false,
  onActivateView,
  onSaveCurrentView,
  onSaveViewAs,
  onDeleteView,
  onSetDefaultView,
  onResetActiveView,
  onVisibleColumnsChange,
  onColumnOrderChange,
  onDensityChange,
  onPageSizeChange,
}) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);

  // Modal Form State
  const [newViewNameEn, setNewViewNameEn] = useState('');
  const [newViewNameAr, setNewViewNameAr] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenSaveAs = () => {
    setNewViewNameEn(`${activeView.nameEn} (Custom)`);
    setNewViewNameAr(`${activeView.nameAr} (مخصص)`);
    setMakeDefault(false);
    setIsSaveAsModalOpen(true);
    setIsOpenMenu(false);
  };

  const handleSaveAsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewNameEn.trim() && !newViewNameAr.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveViewAs(newViewNameEn, newViewNameAr, makeDefault);
      setIsSaveAsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2" ref={menuRef}>
      {/* Active View Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpenMenu(!isOpenMenu)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isModified
            ? 'border-amber-500/50 bg-amber-500/10 text-amber-200 hover:border-amber-500'
            : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80'
        }`}
      >
        <Bookmark className="w-4 h-4 text-[#00F0FF]" />
        <span className="font-semibold text-white">
          {isAr ? activeView.nameAr : activeView.nameEn}
        </span>

        {/* View Type Badges */}
        {activeView.isSystem ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {isAr ? 'نظام' : 'System'}
          </span>
        ) : activeView.visibility === 'SHARED' ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isAr ? 'مشترك' : 'Shared'}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {isAr ? 'خاص' : 'User'}
          </span>
        )}

        {/* Default Star Indicator */}
        {activeView.isDefault && (
          <span title={isAr ? 'عرض افتراضي' : 'Default View'}>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
        )}

        {/* Modified Unsaved Indicator */}
        {isModified && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {isAr ? 'معدل' : 'Modified'}
          </span>
        )}

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {/* Quick Action: Save Button (if modified) */}
      {isModified && (
        <button
          type="button"
          onClick={() => onSaveCurrentView()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#00F0FF]/40 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 text-xs font-semibold transition-colors"
          title={isAr ? 'حفظ التغييرات في العرض الحالي' : 'Save current filter/column changes'}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isAr ? 'حفظ' : 'Save'}</span>
        </button>
      )}

      {/* Quick Action: Personalize Button */}
      <button
        type="button"
        onClick={() => setIsPersonalizeOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-colors"
        title={isAr ? 'تخصيص ترتيب وأعمدة الجدول' : 'Personalize table columns & layout'}
      >
        <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
        <span className="hidden sm:inline">{isAr ? 'الأعمدة والكثافة' : 'Customize'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpenMenu && (
        <div
          className={`absolute top-full ${
            isAr ? 'right-0' : 'left-0'
          } mt-1 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-40 py-2 text-slate-200 overflow-hidden text-xs`}
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{isAr ? 'عروض البيانات المتاحة' : 'Saved Data Views'}</span>
            <span className="text-[#00F0FF]">{adapter.resource}</span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
            {/* System Views */}
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" />
                {isAr ? 'عروض النظام' : 'System Views'}
              </div>
              {systemViews.map((sv) => (
                <button
                  key={sv.id}
                  type="button"
                  onClick={() => {
                    onActivateView(sv.id);
                    setIsOpenMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                    activeView.id === sv.id ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-semibold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {activeView.id === sv.id ? <Check className="w-3.5 h-3.5 text-[#00F0FF]" /> : <div className="w-3.5" />}
                    <span className="truncate">{isAr ? sv.nameAr : sv.nameEn}</span>
                  </div>
                  {sv.isDefault && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                </button>
              ))}
            </div>

            {/* Custom User Views */}
            {userViews.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-400" />
                  {isAr ? 'عروضي المحفوظة' : 'My Saved Views'}
                </div>
                {userViews.map((uv) => (
                  <div
                    key={uv.id}
                    className={`group px-3 py-1.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      activeView.id === uv.id ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onActivateView(uv.id);
                        setIsOpenMenu(false);
                      }}
                      className="flex-1 text-left flex items-center gap-2 truncate"
                    >
                      {activeView.id === uv.id ? <Check className="w-3.5 h-3.5 text-[#00F0FF]" /> : <div className="w-3.5" />}
                      <span className="truncate">{isAr ? uv.nameAr : uv.nameEn}</span>
                    </button>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onSetDefaultView(uv.id)}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                        title={isAr ? 'تعيين كافتراضي' : 'Set as Default'}
                      >
                        <Star className={`w-3.5 h-3.5 ${uv.isDefault ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteView(uv.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title={isAr ? 'حذف العرض' : 'Delete View'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shared Views */}
            {sharedViews.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  {isAr ? 'العروض المشتركة' : 'Shared Views'}
                </div>
                {sharedViews.map((shv) => (
                  <button
                    key={shv.id}
                    type="button"
                    onClick={() => {
                      onActivateView(shv.id);
                      setIsOpenMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      activeView.id === shv.id ? 'bg-[#00F0FF]/10 text-[#00F0FF] font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {activeView.id === shv.id ? <Check className="w-3.5 h-3.5 text-[#00F0FF]" /> : <div className="w-3.5" />}
                      <span className="truncate">{isAr ? shv.nameAr : shv.nameEn}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Actions */}
          <div className="p-2 border-t border-slate-800 space-y-1 bg-slate-900/90">
            <button
              type="button"
              onClick={handleOpenSaveAs}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#00F0FF] hover:bg-[#00F0FF]/10 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'حفظ العرض الحالي باسم جديد...' : 'Save Current State As...'}</span>
            </button>

            {isModified && (
              <button
                type="button"
                onClick={() => {
                  onResetActiveView();
                  setIsOpenMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إلغاء التعديلات غير المحفوظة' : 'Discard Unsaved Changes'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Personalization Drawer */}
      <EnterprisePersonalizationDrawer
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        adapter={adapter}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        density={density}
        pageSize={currentQuery.pagination.pageSize}
        isAr={isAr}
        onVisibleColumnsChange={onVisibleColumnsChange}
        onColumnOrderChange={onColumnOrderChange}
        onDensityChange={onDensityChange}
        onPageSizeChange={onPageSizeChange}
        onReset={onResetActiveView}
      />

      {/* Save As Modal Dialog */}
      {isSaveAsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {isAr ? 'حفظ عرض البيانات' : 'Save Custom Data View'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'حفظ الفلاتر والترتيب والأعمدة الحالية كعرض خاص' : 'Save current filters, sorting and columns for quick reuse'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isAr ? 'اسم العرض (بالإنجليزي)' : 'View Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={newViewNameEn}
                  onChange={(e) => setNewViewNameEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                  placeholder="e.g. High Priority Air Freight"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isAr ? 'اسم العرض (بالعربي)' : 'View Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={newViewNameAr}
                  onChange={(e) => setNewViewNameAr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                  placeholder="مثال: الشحنات الجوية عالية الأهمية"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-[#00F0FF] focus:ring-0"
                />
                <label htmlFor="makeDefault" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'تعيين كعرض افتراضي لحسابي' : 'Set as my personal default view for this table'}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSaveAsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium bg-[#00F0FF] text-slate-950 hover:bg-[#00F0FF]/90 font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ العرض' : 'Save View'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
