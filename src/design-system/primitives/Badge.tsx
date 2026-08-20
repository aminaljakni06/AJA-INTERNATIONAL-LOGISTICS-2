import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?:
    | 'active'
    | 'pending'
    | 'completed'
    | 'accent'
    | 'metallic'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'blue'
    | 'amber'
    | 'emerald'
    | 'red'
    | 'slate'
    | 'indigo'
    | 'created'
    | 'in-transit'
    | 'at-customs'
    | 'out-for-delivery'
    | 'delivered'
    | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'active',
  size = 'md',
  dot = false,
  icon,
  className,
  ...props
}) => {
  const variants: Record<string, string> = {
    active: 'bg-[#EAF5FD] text-[#0F4C75] border border-[#B5D8F7] font-bold',
    pending: 'bg-slate-100 text-slate-800 border border-slate-200 font-bold',
    completed: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold',
    
    accent: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] font-bold',
    metallic: 'bg-slate-100 text-slate-800 border border-slate-200 font-bold',
    success: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-bold',
    danger: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] font-bold',
    info: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold',

    // Explicit Tracking Status Tokens
    created: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold',
    'in-transit': 'bg-[#EAF5FD] text-[#0F4C75] border border-[#B5D8F7] font-bold',
    'at-customs': 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-bold',
    'out-for-delivery': 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold',
    delivered: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold',
    error: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] font-bold',

    // Backward compatibility mapping
    blue: 'bg-[#EAF5FD] text-[#0F4C75] border border-[#B5D8F7] font-bold',
    amber: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-bold',
    emerald: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold',
    red: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] font-bold',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium',
    indigo: 'bg-[#EAF5FD] text-[#0F4C75] border border-[#B5D8F7] font-bold',
  };

  const dotColors: Record<string, string> = {
    active: 'bg-[#0F4C75]',
    pending: 'bg-slate-500',
    completed: 'bg-green-600',
    accent: 'bg-orange-600',
    metallic: 'bg-slate-500',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    info: 'bg-sky-600',
    created: 'bg-sky-600',
    'in-transit': 'bg-[#0F4C75]',
    'at-customs': 'bg-amber-600',
    'out-for-delivery': 'bg-sky-600',
    delivered: 'bg-green-600',
    error: 'bg-red-600',
    blue: 'bg-[#0F4C75]',
    amber: 'bg-amber-600',
    emerald: 'bg-green-600',
    red: 'bg-red-600',
    slate: 'bg-slate-500',
    indigo: 'bg-[#0F4C75]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1 min-h-[22px]',
    md: 'px-2.5 py-1 text-xs gap-1.5 min-h-[26px]',
    lg: 'px-3.5 py-1.5 text-sm gap-2 min-h-[30px]',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-medium tracking-tight whitespace-nowrap transition-colors select-none',
        variants[variant] || variants.active,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || 'bg-current'
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
