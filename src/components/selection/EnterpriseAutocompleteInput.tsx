/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Autocomplete Input Component
 * Phase: Enterprise UI System
 * Module: Enterprise Selection, Lookup & Autocomplete System
 * Version: 1.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Star, Clock, Check, X, Building2, Package, Truck, Anchor } from 'lucide-react';
import { LookupType, LookupItem } from '../../types/selectionLookupFramework';
import { useEnterpriseLookup } from '../../hooks/useEnterpriseLookup';

export interface EnterpriseAutocompleteInputProps {
  fieldId: string;
  lookupType: LookupType;
  value?: LookupItem | null;
  onChange?: (item: LookupItem | null) => void;
  placeholderEn?: string;
  placeholderAr?: string;
  labelEn?: string;
  labelAr?: string;
  disabled?: boolean;
  isAr?: boolean;
  className?: string;
}

export const EnterpriseAutocompleteInput: React.FC<EnterpriseAutocompleteInputProps> = ({
  fieldId,
  lookupType,
  value,
  onChange,
  placeholderEn = 'Type to search...',
  placeholderAr = 'اكتب للبحث...',
  labelEn,
  labelAr,
  disabled = false,
  isAr = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<LookupItem | null>(value || null);

  const containerRef = useRef<HTMLDivElement>(null);

  const { items, loading, updateSearchKeyword, toggleFavorite } = useEnterpriseLookup({
    lookupType,
    debounceMs: 200,
  });

  useEffect(() => {
    if (value !== undefined) {
      setSelectedItem(value);
      if (value) {
        setQuery(isAr ? value.nameAr : value.nameEn);
      }
    }
  }, [value, isAr]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    updateSearchKeyword(text);
    setIsOpen(true);
    if (!text && selectedItem) {
      setSelectedItem(null);
      if (onChange) onChange(null);
    }
  };

  const handleSelectItem = (item: LookupItem) => {
    setSelectedItem(item);
    setQuery(isAr ? item.nameAr : item.nameEn);
    setIsOpen(false);
    if (onChange) onChange(item);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedItem(null);
    updateSearchKeyword('');
    if (onChange) onChange(null);
  };

  const getLookupIcon = () => {
    switch (lookupType) {
      case 'customer':
      case 'company':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'shipment':
      case 'container':
        return <Package className="w-4 h-4 text-sky-600" />;
      case 'carrier':
      case 'driver':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'port':
        return <Anchor className="w-4 h-4 text-indigo-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      dir={isAr ? 'rtl' : 'ltr'}
      className={`relative w-full flex flex-col gap-1.5 ${className}`}
    >
      {(labelEn || labelAr) && (
        <label htmlFor={fieldId} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          {getLookupIcon()}
          <span>{isAr ? labelAr : labelEn}</span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        <input
          id={fieldId}
          type="text"
          value={query}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={isAr ? placeholderAr : placeholderEn}
          className={`w-full py-2.5 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none transition-all ${
            isOpen ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
        />

        <div className={`absolute ${isAr ? 'left-3' : 'right-3'} flex items-center gap-1.5`}>
          {loading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 animate-in fade-in duration-100">
          {items.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              {loading ? (isAr ? 'جارٍ تحميل البيانات...' : 'Searching records...') : (isAr ? 'لم يتم العثور على نتائج' : 'No records found')}
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const name = isAr ? item.nameAr : item.nameEn;
              const subtitle = isAr ? item.subtitleAr : item.subtitleEn;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      {getLookupIcon()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 shrink-0">
                          {item.code}
                        </span>
                      </div>
                      {subtitle && <span className="text-[11px] text-slate-400 truncate">{subtitle}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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
                          item.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                    {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
