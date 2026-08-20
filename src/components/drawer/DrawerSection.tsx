/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Sticky Section Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React from 'react';
import { DrawerSectionProps } from '../../types/drawerInteractionFramework';

export const DrawerSection: React.FC<DrawerSectionProps> = ({
  id,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  stickyHeader = false,
  actions,
  children,
  isAr = false,
  className = '',
  density = 'comfortable',
}) => {
  const displayTitle = isAr ? titleAr || titleEn : titleEn || titleAr;
  const displayDesc = isAr ? descriptionAr || descriptionEn : descriptionEn || descriptionAr;

  const getPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'py-2 px-3';
      case 'spacious':
        return 'py-4 px-6';
      case 'comfortable':
      default:
        return 'py-3 px-4';
    }
  };

  return (
    <section id={id} dir={isAr ? 'rtl' : 'ltr'} className={`space-y-3 ${className}`}>
      {displayTitle && (
        <div
          className={`flex items-center justify-between gap-3 border-b border-border-default bg-surface-primary/90 backdrop-blur-xs ${
            stickyHeader ? 'sticky top-0 z-10' : ''
          } ${getPaddingClass()}`}
        >
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {displayTitle}
            </h4>
            {displayDesc && <p className="text-xs text-text-muted mt-0.5">{displayDesc}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      <div className="space-y-3">{children}</div>
    </section>
  );
};
