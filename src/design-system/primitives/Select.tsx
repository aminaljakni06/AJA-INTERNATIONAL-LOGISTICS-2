import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full space-y-1.5 text-left rtl:text-right">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-text-primary">
            {label}
            {props.required && <span className="text-status-error font-black ml-1 rtl:mr-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full bg-surface-primary text-text-primary border ${
              error
                ? 'border-status-error focus:ring-status-error/20 focus:border-status-error'
                : 'border-border-default focus:border-border-focus focus:ring-border-focus/20'
            } rounded-xl px-3.5 py-2.5 text-sm appearance-none transition-all outline-none focus:ring-4 pr-10 rtl:pl-10 rtl:pr-3.5 ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-primary text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 rtl:left-3 rtl:right-auto text-text-muted pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-xs font-medium text-status-error flex items-center gap-1 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
