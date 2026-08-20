/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Select & Option Components
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { SelectInputProps, SelectOption } from '../../types/inputComponentsFramework';
import { EnterpriseInputWrapper } from './EnterpriseInputWrapper';

export const EnterpriseSelectInput: React.FC<SelectInputProps> = (props) => {
  const {
    fieldId,
    options = [],
    value,
    defaultValue,
    onChange,
    multiple = false,
    searchable = true,
    mode = 'select',
    placeholderEn = 'Select an option...',
    placeholderAr = 'اختر خياراً...',
    placeholderSearchEn = 'Search options...',
    placeholderSearchAr = 'ابحث في الخيارات...',
    size = 'md',
    variant = 'outlined',
    disabled = false,
    readOnly = false,
    isAr = false,
    isDisabled,
    isReadOnly,
    maxTags = 5,
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (Array.isArray(value)) return value.map(String);
    if (value !== undefined && value !== null) return [String(value)];
    if (Array.isArray(defaultValue)) return defaultValue.map(String);
    if (defaultValue !== undefined && defaultValue !== null) return [String(defaultValue)];
    return [];
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveDisabled = disabled || isDisabled;
  const effectiveReadOnly = readOnly || isReadOnly;
  const placeholder = isAr ? placeholderAr : placeholderEn;
  const placeholderSearch = isAr ? placeholderSearchAr : placeholderSearchEn;

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        setSelectedValues(value.map(String));
      } else if (value !== null) {
        setSelectedValues([String(value)]);
      } else {
        setSelectedValues([]);
      }
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (optValue: string | number) => {
    const strVal = String(optValue);
    if (multiple || mode === 'tags') {
      let next: string[];
      if (selectedValues.includes(strVal)) {
        next = selectedValues.filter((v) => v !== strVal);
      } else {
        if (maxTags && selectedValues.length >= maxTags) return;
        next = [...selectedValues, strVal];
      }
      setSelectedValues(next);
      if (onChange) onChange(next);
    } else {
      setSelectedValues([strVal]);
      if (onChange) onChange(strVal);
      setIsOpen(false);
    }
  };

  const handleToggleSwitch = () => {
    if (effectiveDisabled || effectiveReadOnly) return;
    const isChecked = selectedValues.includes('true') || selectedValues.includes('1');
    const nextVal = isChecked ? 'false' : 'true';
    setSelectedValues(nextVal === 'true' ? ['true'] : []);
    if (onChange) onChange(nextVal === 'true');
  };

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const lEn = opt.labelEn.toLowerCase();
    const lAr = opt.labelAr.toLowerCase();
    return lEn.includes(q) || lAr.includes(q);
  });

  // Group options if group properties exist
  const groupedOptions = filteredOptions.reduce((acc, opt) => {
    const group = isAr ? opt.groupAr || opt.groupEn || '' : opt.groupEn || '';
    if (!acc[group]) acc[group] = [];
    acc[group].push(opt);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  // Size helper
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs rounded-lg';
      case 'lg':
        return 'px-4 py-3 text-base rounded-xl';
      case 'md':
      default:
        return 'px-3.5 py-2.5 text-sm rounded-xl';
    }
  };

  // Switch Mode Render
  if (mode === 'switch') {
    const isChecked = selectedValues.includes('true') || selectedValues.includes('1') || selectedValues.includes('yes');
    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            disabled={effectiveDisabled || effectiveReadOnly}
            onClick={handleToggleSwitch}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              isChecked ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
            } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isChecked ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // Segmented Control Mode Render
  if (mode === 'segmented') {
    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl gap-1 w-full overflow-x-auto">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(String(opt.value));
            const label = isAr ? opt.labelAr : opt.labelEn;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={effectiveDisabled || opt.disabled}
                onClick={() => handleSelectOption(opt.value)}
                className={`flex-1 min-w-[80px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {opt.icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // Radio / Checkbox Group Mode Render
  if (mode === 'radio' || mode === 'checkbox') {
    return (
      <EnterpriseInputWrapper {...props}>
        <div className="flex flex-col gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(String(opt.value));
            const label = isAr ? opt.labelAr : opt.labelEn;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 text-sm cursor-pointer select-none ${
                  effectiveDisabled || opt.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type={mode === 'radio' ? 'radio' : 'checkbox'}
                  name={fieldId}
                  checked={isSelected}
                  disabled={effectiveDisabled || opt.disabled}
                  onChange={() => handleSelectOption(opt.value)}
                  className={`w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-slate-300 ${
                    mode === 'radio' ? 'rounded-full' : 'rounded'
                  }`}
                />
                {opt.icon}
                <span className="text-slate-800 dark:text-slate-200">{label}</span>
                {opt.badgeEn && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                    {isAr ? opt.badgeAr || opt.badgeEn : opt.badgeEn}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </EnterpriseInputWrapper>
    );
  }

  // Default Select / Combobox / Tags Dropdown Render
  const selectedOptionObjs = options.filter((opt) => selectedValues.includes(String(opt.value)));

  return (
    <EnterpriseInputWrapper {...props}>
      <div ref={dropdownRef} className="relative w-full">
        {/* Input Trigger Button */}
        <button
          type="button"
          disabled={effectiveDisabled}
          onClick={() => !effectiveReadOnly && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none transition-all ${getSizeClasses()} ${
            isOpen ? 'ring-2 ring-amber-500/20 border-amber-500' : ''
          } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
        >
          <div className="flex flex-wrap items-center gap-1 overflow-hidden">
            {selectedOptionObjs.length > 0 ? (
              multiple || mode === 'tags' ? (
                selectedOptionObjs.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 rounded-md border border-amber-200 dark:border-amber-800"
                  >
                    {isAr ? opt.labelAr : opt.labelEn}
                    {!effectiveReadOnly && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOption(opt.value);
                        }}
                        className="hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="flex items-center gap-2 truncate text-sm">
                  {selectedOptionObjs[0].icon}
                  {isAr ? selectedOptionObjs[0].labelAr : selectedOptionObjs[0].labelEn}
                </span>
              )
            ) : (
              <span className="text-slate-400 text-sm truncate">{placeholder}</span>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Floating Options Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full mt-1.5 left-0 right-0 z-50 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Box */}
            {searchable && (
              <div className="relative mb-1">
                <Search className={`w-3.5 h-3.5 absolute ${isAr ? 'right-2.5' : 'left-2.5'} top-2.5 text-slate-400`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholderSearch}
                  className={`w-full py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 ${
                    isAr ? 'pr-8 pl-2' : 'pl-8 pr-2'
                  }`}
                />
              </div>
            )}

            {/* Render Grouped / Filtered Options */}
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                {isAr ? 'لا توجد خيارات مطابقة' : 'No options found'}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                <div key={groupName || 'ungrouped'} className="flex flex-col">
                  {groupName && (
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {groupName}
                    </div>
                  )}
                  {groupOpts.map((opt) => {
                    const isSelected = selectedValues.includes(String(opt.value));
                    const label = isAr ? opt.labelAr : opt.labelEn;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => handleSelectOption(opt.value)}
                        className={`w-full px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </EnterpriseInputWrapper>
  );
};
