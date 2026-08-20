import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { useLanguage } from '../../i18n/LanguageContext';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate?: (tab: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  onNavigate,
  actions,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className={`mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="space-y-1.5 max-w-3xl">
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0B5FFF]/10 text-[#0B5FFF] dark:bg-[#00F0FF]/10 dark:text-[#00F0FF] border border-[#0B5FFF]/20 dark:border-[#00F0FF]/30 mb-2">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls */}
        {actions && <div className="flex items-center gap-3 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};
