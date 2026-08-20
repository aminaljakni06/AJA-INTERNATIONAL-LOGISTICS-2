/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Breadcrumbs Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DrawerBreadcrumbsProps } from '../../types/drawerInteractionFramework';

export const DrawerBreadcrumbs: React.FC<DrawerBreadcrumbsProps> = ({
  items,
  isAr = false,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <nav
      dir={isAr ? 'rtl' : 'ltr'}
      aria-label="Drawer Breadcrumb Navigation"
      className={`flex items-center gap-1.5 text-xs text-text-muted overflow-x-auto py-1 ${className}`}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const label = isAr ? item.labelAr || item.labelEn : item.labelEn;

        return (
          <React.Fragment key={item.id}>
            {idx > 0 && <ChevronIcon className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />}
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-brand-navy dark:hover:text-brand-gold font-medium transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-[180px]"
              >
                {label}
              </button>
            ) : (
              <span
                className={`truncate max-w-[120px] sm:max-w-[180px] ${
                  isLast ? 'font-semibold text-text-primary' : 'font-normal'
                }`}
              >
                {label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
