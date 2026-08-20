import React from 'react';
import { clsx } from 'clsx';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string; // Accessible aria-label
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyber';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  badgeCount?: number | string;
  badgeDot?: boolean;
  className?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = 'secondary',
      size = 'md',
      badgeCount,
      badgeDot = false,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-95 cursor-pointer';

    const variants = {
      primary:
        'bg-[#082F49] text-white hover:bg-[#0F4C75] shadow-md',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-[#082F49] border border-slate-200',
      outline:
        'bg-transparent border border-[#0F4C75] text-[#0F4C75] hover:bg-[#0F4C75]/10',
      ghost:
        'bg-transparent text-slate-600 hover:text-[#082F49] hover:bg-slate-100',
      cyber:
        'bg-white text-[#082F49] border border-[#0F4C75] shadow-sm',
    };

    const sizes = {
      xs: 'w-7 h-7 min-w-[28px] min-h-[28px]',
      sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',
      md: 'w-10 h-10 min-w-[40px] min-h-[40px]',
      lg: 'w-12 h-12 min-w-[48px] min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        disabled={disabled}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="shrink-0">{icon}</span>

        {/* Badge Dot or Badge Count */}
        {badgeDot && !badgeCount && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EA580C]" />
          </span>
        )}

        {badgeCount !== undefined && badgeCount !== null && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-[#EA580C] text-white font-black text-[10px] leading-none shadow-sm">
            {badgeCount}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
