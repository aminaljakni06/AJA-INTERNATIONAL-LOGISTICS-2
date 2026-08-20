/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Footer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Content Shell & Action System
 * Version: 1.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { DrawerFooterProps, DrawerAction } from '../../types/drawerFramework';

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  actions,
  primaryAction,
  secondaryAction,
  cancelAction,
  customContent,
  sticky = true,
  isAr = false,
  className = '',
  density = 'comfortable',
}) => {
  const getPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'px-4 py-3 gap-2';
      case 'spacious':
        return 'px-8 py-5 gap-4';
      case 'comfortable':
      default:
        return 'px-6 py-4 gap-3';
    }
  };

  // Compile final actions list
  const compiledActions: DrawerAction[] = [];
  if (actions && actions.length > 0) {
    compiledActions.push(...actions);
  } else {
    if (cancelAction) compiledActions.push(cancelAction);
    if (secondaryAction) compiledActions.push(secondaryAction);
    if (primaryAction) compiledActions.push(primaryAction);
  }

  if (compiledActions.length === 0 && !customContent) return null;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`border-t border-border-default bg-surface-secondary/50 flex items-center justify-between flex-wrap ${
        sticky ? 'sticky bottom-0 bg-surface-primary z-10' : ''
      } ${getPaddingClass()} ${className}`}
    >
      {customContent && <div className="flex-1 min-w-0 pr-2">{customContent}</div>}

      <div className="flex items-center justify-end gap-2.5 ml-auto flex-wrap w-full sm:w-auto">
        {compiledActions.map((act) => {
          const label = isAr ? act.labelAr || act.labelEn : act.labelEn;
          const isPrimary = act.variant === 'primary' || (!act.variant && act === primaryAction);
          const isDanger = act.variant === 'danger';

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => act.onClick(act.id)}
              disabled={act.disabled || act.loading}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px] focus:outline-hidden focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold ${
                isPrimary
                  ? 'bg-brand-navy text-white hover:bg-brand-navy/90 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold/90 shadow-xs'
                  : isDanger
                  ? 'bg-status-error text-white hover:bg-status-error/90 shadow-xs'
                  : 'bg-surface-secondary text-text-primary hover:bg-surface-soft border border-border-default'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {act.loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              {act.icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
