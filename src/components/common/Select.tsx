import React from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:border-transparent min-h-[44px]',
          error ? 'border-red-500 bg-red-50/50' : 'border-slate-300 text-slate-900',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
