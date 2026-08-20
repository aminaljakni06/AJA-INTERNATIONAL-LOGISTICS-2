import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconStart, iconEnd, className, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-slate-900">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconStart && (
            <div className="absolute left-3.5 text-slate-500 pointer-events-none shrink-0">
              {iconStart}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={clsx(
              'w-full bg-white text-slate-900 border border-slate-200 rounded-[10px] px-3.5 py-2.5 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-[#0F4C75] focus:ring-2 focus:ring-[#0F4C75]/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              iconStart && 'pl-10',
              iconEnd && 'pr-10',
              error && 'border-red-600 focus:border-red-600 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {iconEnd && (
            <div className="absolute right-3.5 text-slate-500 pointer-events-none shrink-0">
              {iconEnd}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
