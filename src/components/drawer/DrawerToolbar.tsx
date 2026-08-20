/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Toolbar Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Content Shell & Action System
 * Version: 1.0
 */

import React from 'react';
import { DrawerToolbarProps } from '../../types/drawerFramework';

export const DrawerToolbar: React.FC<DrawerToolbarProps> = ({
  children,
  className = '',
  isAr = false,
  density = 'comfortable',
}) => {
  const getPaddingClass = () => {
    switch (density) {
      case 'compact':
        return 'px-4 py-2';
      case 'spacious':
        return 'px-8 py-4';
      case 'comfortable':
      default:
        return 'px-6 py-3';
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`bg-surface-secondary/60 border-b border-border-default flex items-center justify-between gap-3 flex-wrap ${getPaddingClass()} ${className}`}
    >
      {children}
    </div>
  );
};
