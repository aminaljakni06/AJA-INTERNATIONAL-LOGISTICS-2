/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Search Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { DrawerSearchProps } from '../../types/drawerInteractionFramework';

export const DrawerSearch: React.FC<DrawerSearchProps> = ({
  value = '',
  onChange,
  onSearch,
  placeholderEn = 'Search items, documents, records...',
  placeholderAr = 'البحث في العناصر، المستندات، السجلات...',
  isLoading = false,
  debounceMs = 300,
  autoFocus = false,
  isAr = false,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0 || !onSearch) return;

    const timer = setTimeout(() => {
      onSearch(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInternalValue(newVal);
    if (onChange) onChange(newVal);
    if (debounceMs === 0 && onSearch) onSearch(newVal);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
  };

  const placeholder = isAr ? placeholderAr : placeholderEn;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 ltr:left-3 rtl:right-3 rtl:left-auto flex items-center pointer-events-none text-text-muted">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-brand-navy dark:text-brand-gold" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>

      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 rtl:pl-9 rtl:pr-9 py-2 text-xs sm:text-sm bg-surface-primary border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold focus:border-transparent transition-all"
      />

      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={isAr ? 'مسح البحث' : 'Clear search'}
          className="absolute inset-y-0 right-0 ltr:right-2.5 rtl:left-2.5 rtl:right-auto flex items-center p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
