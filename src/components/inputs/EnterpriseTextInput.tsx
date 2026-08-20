/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Text Input Component
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import React, { useState, ChangeEvent } from 'react';
import {
  Eye,
  EyeOff,
  X,
  Copy,
  Check,
  Search,
  Mail,
  Lock,
  Phone,
  Globe,
  DollarSign,
  Percent,
  User,
  Loader2,
} from 'lucide-react';
import { TextInputProps } from '../../types/inputComponentsFramework';
import { EnterpriseInputWrapper } from './EnterpriseInputWrapper';

export const EnterpriseTextInput: React.FC<TextInputProps> = (props) => {
  const {
    fieldId,
    type = 'text',
    value = '',
    defaultValue = '',
    onChange,
    onBlur,
    onFocus,
    placeholderEn,
    placeholderAr,
    size = 'md',
    variant = 'outlined',
    disabled = false,
    readOnly = false,
    loading = false,
    isAr = false,
    prefix,
    suffix,
    icon,
    clearable = true,
    copyable = false,
    maxLength,
    showCharacterCount = false,
    currencyCode = 'SAR',
    multiline = false,
    rows = 4,
    autoFocus = false,
    tabIndex,
    inputClassName = '',
    errorEn,
    errorAr,
    isValid,
    hasWarning,
    isDisabled,
    isReadOnly,
  } = props;

  const [inputValue, setInputValue] = useState<string>(
    value !== undefined && value !== null ? String(value) : String(defaultValue)
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const effectiveValue = value !== undefined && value !== null ? String(value) : inputValue;
  const effectiveDisabled = disabled || isDisabled || loading;
  const effectiveReadOnly = readOnly || isReadOnly;
  const placeholder = isAr ? placeholderAr : placeholderEn;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val);
  };

  const handleClear = () => {
    setInputValue('');
    if (onChange) onChange('');
  };

  const handleCopy = () => {
    if (!effectiveValue) return;
    navigator.clipboard.writeText(effectiveValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine standard input icon based on type if custom icon not provided
  const getDefaultTypeIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'search':
        return <Search className="w-4 h-4 text-slate-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-slate-400" />;
      case 'password':
        return <Lock className="w-4 h-4 text-slate-400" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-slate-400" />;
      case 'url':
        return <Globe className="w-4 h-4 text-slate-400" />;
      case 'currency':
        return <span className="text-xs font-bold text-slate-400">{currencyCode}</span>;
      case 'percent':
        return <Percent className="w-4 h-4 text-slate-400" />;
      case 'username':
        return <User className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  // Size styling classes
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

  // Variant & State border/background styling
  const getVariantClasses = () => {
    const hasError = Boolean(errorEn || errorAr || isValid === false);
    const hasWarn = Boolean(hasWarning);

    if (hasError) {
      return 'border-rose-500 text-rose-900 dark:text-rose-100 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500';
    }
    if (hasWarn) {
      return 'border-amber-500 text-amber-900 dark:text-amber-100 bg-amber-50/20 dark:bg-amber-950/20 focus:ring-2 focus:ring-amber-500';
    }

    switch (variant) {
      case 'filled':
        return 'bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';
      case 'underlined':
        return 'border-b-2 border-t-0 border-x-0 border-slate-300 dark:border-slate-700 rounded-none bg-transparent focus:border-amber-500 focus:ring-0';
      case 'ghost':
        return 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300';
      case 'outlined':
      default:
        return 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';
    }
  };

  if (type === 'hidden') {
    return <input type="hidden" id={fieldId} value={effectiveValue} />;
  }

  const computedType = type === 'password' ? (showPassword ? 'text' : 'password') : type === 'currency' || type === 'percent' ? 'number' : type;

  return (
    <EnterpriseInputWrapper
      {...props}
      currentLength={effectiveValue.length}
      maxLength={maxLength}
      showCharacterCount={showCharacterCount}
    >
      <div className="relative flex items-center w-full">
        {/* Left Prefix / Icon */}
        {(prefix || getDefaultTypeIcon()) && (
          <div
            className={`absolute ${
              isAr ? 'right-3' : 'left-3'
            } flex items-center gap-1 pointer-events-none select-none`}
          >
            {prefix}
            {getDefaultTypeIcon()}
          </div>
        )}

        {/* Input Element */}
        {multiline ? (
          <textarea
            id={fieldId}
            value={effectiveValue}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            rows={rows}
            maxLength={maxLength}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            aria-invalid={Boolean(errorEn || errorAr || isValid === false)}
            aria-disabled={effectiveDisabled}
            aria-readonly={effectiveReadOnly}
            className={`w-full outline-none transition-all duration-150 resize-y ${getSizeClasses()} ${getVariantClasses()} ${
              prefix || getDefaultTypeIcon() ? (isAr ? 'pr-9' : 'pl-9') : ''
            } ${
              clearable || copyable || type === 'password' || suffix ? (isAr ? 'pl-9' : 'pr-9') : ''
            } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''} ${inputClassName}`}
          />
        ) : (
          <input
            id={fieldId}
            type={computedType}
            value={effectiveValue}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            maxLength={maxLength}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            aria-invalid={Boolean(errorEn || errorAr || isValid === false)}
            aria-disabled={effectiveDisabled}
            aria-readonly={effectiveReadOnly}
            className={`w-full outline-none transition-all duration-150 ${getSizeClasses()} ${getVariantClasses()} ${
              prefix || getDefaultTypeIcon() ? (isAr ? 'pr-9' : 'pl-9') : ''
            } ${
              clearable || copyable || type === 'password' || suffix || loading ? (isAr ? 'pl-10' : 'pr-10') : ''
            } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''} ${inputClassName}`}
          />
        )}

        {/* Right Suffix & Action Buttons */}
        <div
          className={`absolute ${
            isAr ? 'left-3' : 'right-3'
          } flex items-center gap-1.5 select-none`}
        >
          {loading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />}

          {/* Copy Action */}
          {copyable && effectiveValue && !loading && (
            <button
              type="button"
              onClick={handleCopy}
              tabIndex={-1}
              title={isAr ? 'نسخ القيمة' : 'Copy value'}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {/* Clear Action */}
          {clearable && effectiveValue && !effectiveDisabled && !effectiveReadOnly && !loading && (
            <button
              type="button"
              onClick={handleClear}
              tabIndex={-1}
              title={isAr ? 'مسح' : 'Clear'}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Password Reveal Toggle */}
          {type === 'password' && !effectiveDisabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {suffix}
        </div>
      </div>
    </EnterpriseInputWrapper>
  );
};
