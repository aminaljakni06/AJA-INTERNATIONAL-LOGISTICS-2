import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent min-h-[44px]',
          error ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30' : 'border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
