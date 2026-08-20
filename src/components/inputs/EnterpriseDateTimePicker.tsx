/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Date & Time Components
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import React, { useState, ChangeEvent } from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';
import { DateInputProps } from '../../types/inputComponentsFramework';
import { EnterpriseInputWrapper } from './EnterpriseInputWrapper';

export const EnterpriseDateTimePicker: React.FC<DateInputProps> = (props) => {
  const {
    fieldId,
    mode = 'date',
    value = '',
    defaultValue = '',
    onChange,
    minDate,
    maxDate,
    placeholderEn,
    placeholderAr,
    size = 'md',
    variant = 'outlined',
    disabled = false,
    readOnly = false,
    isAr = false,
    presetRanges,
    isDisabled,
    isReadOnly,
  } = props;

  const [dateValue, setDateValue] = useState<string>(
    value !== undefined && value !== null ? String(value) : String(defaultValue)
  );

  const effectiveValue = value !== undefined && value !== null ? String(value) : dateValue;
  const effectiveDisabled = disabled || isDisabled;
  const effectiveReadOnly = readOnly || isReadOnly;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setDateValue(val);
    if (onChange) onChange(val);
  };

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

  // Timezone selector mode
  if (mode === 'timezone') {
    const timezones = [
      { code: 'Asia/Riyadh', labelEn: '(GMT+3) Riyadh, Saudi Arabia', labelAr: '(GMT+3) الرياض، المملكة العربية السعودية' },
      { code: 'Asia/Dubai', labelEn: '(GMT+4) Dubai, UAE', labelAr: '(GMT+4) دبي، الإمارات العربية المتحدة' },
      { code: 'Europe/London', labelEn: '(GMT+0) London, UK', labelAr: '(GMT+0) لندن، المملكة المتحدة' },
      { code: 'America/New_York', labelEn: '(GMT-5) New York, USA', labelAr: '(GMT-5) نيويورك، الولايات المتحدة' },
      { code: 'Asia/Singapore', labelEn: '(GMT+8) Singapore', labelAr: '(GMT+8) سنغافورة' },
    ];

    return (
      <EnterpriseInputWrapper {...props}>
        <div className="relative w-full flex items-center">
          <Globe className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} text-slate-400 pointer-events-none`} />
          <select
            id={fieldId}
            value={effectiveValue}
            onChange={handleChange}
            disabled={effectiveDisabled}
            className={`w-full outline-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${getSizeClasses()} ${
              isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
            } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
          >
            <option value="">{isAr ? 'اختر المنطقة الزمنية' : 'Select Timezone'}</option>
            {timezones.map((tz) => (
              <option key={tz.code} value={tz.code}>
                {isAr ? tz.labelAr : tz.labelEn}
              </option>
            ))}
          </select>
        </div>
      </EnterpriseInputWrapper>
    );
  }

  const inputType =
    mode === 'time'
      ? 'time'
      : mode === 'datetime'
      ? 'datetime-local'
      : mode === 'month'
      ? 'month'
      : mode === 'year'
      ? 'number'
      : 'date';

  return (
    <EnterpriseInputWrapper {...props}>
      <div className="flex flex-col gap-2 w-full">
        {/* Preset Range Shortcuts */}
        {presetRanges && presetRanges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {presetRanges.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                disabled={effectiveDisabled}
                onClick={() => {
                  if (onChange) onChange(preset.range[0]);
                }}
                className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
              >
                {isAr ? preset.labelAr : preset.labelEn}
              </button>
            ))}
          </div>
        )}

        {/* Date / Time Input Element */}
        <div className="relative w-full flex items-center">
          {mode === 'time' ? (
            <Clock className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} text-slate-400 pointer-events-none`} />
          ) : (
            <Calendar className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} text-slate-400 pointer-events-none`} />
          )}

          <input
            id={fieldId}
            type={inputType}
            value={effectiveValue}
            onChange={handleChange}
            min={minDate}
            max={maxDate}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            placeholder={isAr ? placeholderAr : placeholderEn}
            className={`w-full outline-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${getSizeClasses()} ${
              isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
            } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
          />
        </div>
      </div>
    </EnterpriseInputWrapper>
  );
};
