/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Filters Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import { DrawerFiltersProps } from '../../types/drawerInteractionFramework';

export const DrawerFilters: React.FC<DrawerFiltersProps> = ({
  groups,
  draftValues,
  onChangeField,
  onApplyFilters,
  onResetFilters,
  isAr = false,
  className = '',
  activeCount,
}) => {
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`flex flex-col space-y-6 ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-navy dark:text-brand-gold" />
          <h4 className="text-sm font-semibold text-text-primary">
            {isAr ? 'خيارات التصفية والتصفية' : 'Filter Options & Conditions'}
          </h4>
          {activeCount !== undefined && activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy">
              {activeCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-medium text-text-muted hover:text-status-error flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAr ? 'إعادة ضبط' : 'Reset All'}</span>
        </button>
      </div>

      {/* Filter Groups */}
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.id} className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {isAr ? group.titleAr || group.titleEn : group.titleEn}
            </h5>

            <div className="grid grid-cols-1 gap-3">
              {group.fields.map((field) => {
                const label = isAr ? field.labelAr || field.labelEn : field.labelEn;
                const value = draftValues[field.id] ?? '';

                return (
                  <div key={field.id} className="flex flex-col space-y-1.5">
                    <label className="text-xs font-medium text-text-primary">{label}</label>

                    {field.type === 'select' && (
                      <select
                        value={value}
                        disabled={field.disabled}
                        onChange={(e) => onChangeField(field.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-primary border border-border-default rounded-lg text-text-primary focus:outline-hidden focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold cursor-pointer"
                      >
                        <option value="">{isAr ? 'الكل' : 'All Options'}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {isAr ? opt.labelAr || opt.labelEn : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={value}
                        disabled={field.disabled}
                        placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                        onChange={(e) => onChangeField(field.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-primary border border-border-default rounded-lg text-text-primary focus:outline-hidden focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold"
                      />
                    )}

                    {field.type === 'boolean' && (
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          disabled={field.disabled}
                          onChange={(e) => onChangeField(field.id, e.target.checked)}
                          className="rounded-xs text-brand-navy focus:ring-brand-navy"
                        />
                        <span>{label}</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <div className="pt-4 border-t border-border-default flex items-center justify-end">
        <button
          type="button"
          onClick={onApplyFilters}
          className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-brand-navy text-white hover:bg-brand-navy/90 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold/90 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{isAr ? 'تطبيق التصفية' : 'Apply Filters'}</span>
        </button>
      </div>
    </div>
  );
};
