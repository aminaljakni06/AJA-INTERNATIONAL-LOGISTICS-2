/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Header Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Content Shell & Action System
 * Version: 1.0
 */

import React from 'react';
import { X } from 'lucide-react';
import { DrawerHeaderProps } from '../../types/drawerFramework';

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  icon,
  statusBadge,
  headerActions,
  onClose,
  showCloseButton = true,
  isAr = false,
  className = '',
  density = 'comfortable',
}) => {
  const displayTitle = isAr ? titleAr || titleEn : titleEn || titleAr;
  const displayDesc = isAr ? descriptionAr || descriptionEn : descriptionEn || descriptionAr;

  const getPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'px-4 py-3';
      case 'spacious':
        return 'px-8 py-6';
      case 'comfortable':
      default:
        return 'px-6 py-4';
    }
  };

  const getStatusBadgeStyle = (variant?: string) => {
    switch (variant) {
      case 'approved':
      case 'success':
      case 'active':
        return 'bg-status-success-subtle/30 text-status-success border-status-success/30';
      case 'pending':
      case 'warning':
      case 'draft':
        return 'bg-status-warning-subtle/30 text-status-warning border-status-warning/30';
      case 'rejected':
      case 'cancelled':
      case 'danger':
        return 'bg-status-error-subtle/30 text-status-error border-status-error/30';
      case 'info':
      default:
        return 'bg-brand-navy/10 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold border-border-default';
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`flex items-start justify-between border-b border-border-default bg-surface-primary/95 backdrop-blur-xs z-10 ${getPaddingClass()} ${className}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
        {icon && (
          <div className="p-2.5 rounded-xl bg-brand-navy/5 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {displayTitle && (
              <h3 className="text-lg font-bold text-text-primary leading-tight truncate">
                {displayTitle}
              </h3>
            )}
            {statusBadge && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusBadgeStyle(
                  statusBadge.variant
                )}`}
              >
                {isAr
                  ? statusBadge.labelAr || statusBadge.labelEn
                  : statusBadge.labelEn || statusBadge.labelAr}
              </span>
            )}
          </div>
          {displayDesc && (
            <p className="text-xs text-text-muted mt-1 leading-normal line-clamp-2">
              {displayDesc}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {headerActions}
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق اللوح' : 'Close drawer'}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
