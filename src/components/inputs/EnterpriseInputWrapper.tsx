/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Input Wrapper Component
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { BaseInputProps } from '../../types/inputComponentsFramework';

interface EnterpriseInputWrapperProps extends BaseInputProps {
  children: React.ReactNode;
  currentLength?: number;
}

export const EnterpriseInputWrapper: React.FC<EnterpriseInputWrapperProps> = ({
  fieldId,
  labelEn,
  labelAr,
  descriptionEn,
  descriptionAr,
  tooltipEn,
  tooltipAr,
  helpTextEn,
  helpTextAr,
  required,
  optional,
  canView = true,
  isHidden = false,
  isDisabled = false,
  isReadOnly = false,
  disabled = false,
  readOnly = false,
  loading = false,
  isValid,
  hasWarning,
  errorEn,
  errorAr,
  warningEn,
  warningAr,
  severity = 'ERROR',
  isAr = false,
  className = '',
  maxLength,
  showCharacterCount = false,
  currentLength,
  automationId,
  children,
}) => {
  // Permission Guard
  if (!canView || isHidden) {
    return null;
  }

  const effectiveDisabled = disabled || isDisabled;
  const effectiveReadOnly = readOnly || isReadOnly;
  const label = isAr ? labelAr : labelEn;
  const description = isAr ? descriptionAr : descriptionEn;
  const tooltip = isAr ? tooltipAr : tooltipEn;
  const helpText = isAr ? helpTextAr : helpTextEn;
  const errorMsg = isAr ? errorAr : errorEn;
  const warningMsg = isAr ? warningAr : warningEn;

  const hasError = Boolean(errorMsg || isValid === false);
  const hasWarn = Boolean(warningMsg || hasWarning);

  return (
    <div
      data-automation-id={automationId || `input-wrapper-${fieldId}`}
      dir={isAr ? 'rtl' : 'ltr'}
      className={`flex flex-col gap-1.5 w-full ${className}`}
    >
      {/* Label Header */}
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={fieldId}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
            {optional && !required && (
              <span className="text-[10px] text-slate-400 font-normal">
                ({isAr ? 'اختياري' : 'Optional'})
              </span>
            )}
            {effectiveReadOnly && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 font-normal bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                <Lock className="w-3 h-3 text-slate-400" />
                {isAr ? 'القراءة فقط' : 'Read-Only'}
              </span>
            )}
            {tooltip && (
              <span className="group relative cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-50 pointer-events-none">
                  {tooltip}
                </span>
              </span>
            )}
          </label>

          {/* Character Counter */}
          {showCharacterCount && maxLength && currentLength !== undefined && (
            <span
              className={`text-[10px] ${
                currentLength > maxLength ? 'text-rose-500 font-bold' : 'text-slate-400'
              }`}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}

      {/* Input Child Component */}
      <div className="relative w-full">{children}</div>

      {/* Description / Help Text */}
      {description && !hasError && !hasWarn && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {description}
        </p>
      )}

      {/* Validation Message Box */}
      {hasError && (
        <div className="flex items-start gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMsg || (isAr ? 'حقل غير صالحة' : 'Invalid input value')}</span>
        </div>
      )}

      {!hasError && hasWarn && (
        <div className="flex items-start gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium animate-in fade-in duration-150">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{warningMsg || (isAr ? 'تحذير في البيانات' : 'Validation warning')}</span>
        </div>
      )}

      {!hasError && !hasWarn && helpText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{helpText}</p>
      )}
    </div>
  );
};
