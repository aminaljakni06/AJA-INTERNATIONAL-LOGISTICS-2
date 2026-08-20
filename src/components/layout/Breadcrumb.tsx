import React from 'react';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  tab?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate, className = '' }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const Separator = isAr ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-medium ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-slate-500 dark:text-slate-400">
        {/* Home Item */}
        <li className="flex items-center">
          <button
            onClick={() => onNavigate?.('home')}
            className="hover:text-[#0B5FFF] dark:hover:text-[#00F0FF] transition-colors flex items-center gap-1 cursor-pointer py-1"
            title={isAr ? 'الرئيسية' : 'Home'}
          >
            <Home className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="sr-only">{isAr ? 'الرئيسية' : 'Home'}</span>
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <Separator className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-900 dark:text-white py-1" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.tab && onNavigate) onNavigate(item.tab);
                  }}
                  className="hover:text-[#0B5FFF] dark:hover:text-[#00F0FF] transition-colors cursor-pointer py-1"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
