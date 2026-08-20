import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'ghost' | 'cyber';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

const variantClasses = {
  glass: 'bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-sm hover:border-[#0F4C75] dark:hover:border-[#00F0FF]/50 transition-all duration-200',
  solid: 'bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-sm hover:border-[#0F4C75] dark:hover:border-[#00F0FF]/50 transition-all duration-200',
  ghost: 'bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 hover:border-[#0F4C75] dark:hover:border-[#00F0FF]/50 transition-all duration-200',
  cyber: 'bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-sm hover:border-[#0F4C75] dark:hover:border-[#00F0FF]/50 hover:shadow-md transition-all duration-200',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  hoverable = false,
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  className,
  headerClassName,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-[16px] transition-all duration-300 relative overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        hoverable && 'hover:border-[#0F4C75] hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {(title || subtitle || headerAction || icon) && (
        <div
          className={clsx(
            'flex items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-200 dark:border-white/10',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 rounded-[10px] bg-slate-100 dark:bg-white/5 text-[#0F4C75] dark:text-[#00F0FF] border border-slate-200 dark:border-white/10 shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
