import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      iconStart,
      iconEnd,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F4C75] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none rounded-[10px] active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#0F4C75] text-white hover:bg-[#0B3D5C] active:bg-[#082F49] focus:ring-[#0F4C75] border border-[#0F4C75] font-bold shadow-sm',
      accent:
        'bg-[#EA580C] text-white hover:bg-[#C2410C] active:bg-[#7C2D12] focus:ring-[#EA580C] border border-[#EA580C] font-bold shadow-sm',
      secondary:
        'bg-white border border-[#0F4C75] text-[#0F4C75] hover:bg-[#EAF5FD] hover:text-[#0B3D5C] focus:ring-[#0F4C75] font-bold shadow-2xs',
      outline:
        'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400 font-semibold',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300 font-semibold',
      danger:
        'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626] border border-[#DC2626] font-bold shadow-sm',
      success:
        'bg-[#16A34A] text-white hover:bg-[#15803D] focus:ring-[#16A34A] border border-[#16A34A] font-bold shadow-sm',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1.5 h-8 min-h-[32px]',
      sm: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2 h-9 min-h-[36px]',
      md: 'px-5 py-2.5 text-sm gap-2 h-11 min-h-[44px]',
      lg: 'px-6 py-3 text-base gap-2.5 h-12 min-h-[48px]',
      xl: 'px-8 py-3.5 text-lg gap-3 h-14 min-h-[56px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Processing...</span>
          </span>
        ) : (
          <>
            {iconStart && <span className="shrink-0">{iconStart}</span>}
            {children && <span>{children}</span>}
            {iconEnd && <span className="shrink-0">{iconEnd}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
