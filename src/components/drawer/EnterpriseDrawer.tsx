/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Content Shell & Action System
 * Version: 1.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { DrawerProps, DrawerPosition, DrawerSize } from '../../types/drawerFramework';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';

export const EnterpriseDrawer: React.FC<DrawerProps> = ({
  id,
  isOpen,
  onClose,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  position = 'right',
  size = 'md',
  density = 'comfortable',
  icon,
  actions = [],
  metadata,
  config = { id },
  state = { isOpen: true },
  isAr = false,
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [customWidthPx, setCustomWidthPx] = useState<number | null>(null);

  // Body scroll lock effect
  useEffect(() => {
    const isModal = config.modal !== false;
    if (isOpen && isModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, config.modal]);

  // Focus trap & restoration effect
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      if (drawerRef.current) {
        drawerRef.current.focus();
      }
      return () => {
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Position and Size class resolvers
  const getPositionClasses = (pos: DrawerPosition) => {
    switch (pos) {
      case 'left':
        return 'left-0 top-0 bottom-0 h-full border-r border-border-default';
      case 'top':
        return 'top-0 left-0 right-0 w-full border-b border-border-default';
      case 'bottom':
        return 'bottom-0 left-0 right-0 w-full rounded-t-2xl border-t border-border-default max-h-[90vh]';
      case 'right':
      default:
        return 'right-0 top-0 bottom-0 h-full border-l border-border-default';
    }
  };

  const getSizeClasses = (pos: DrawerPosition, sz: DrawerSize) => {
    if (pos === 'top' || pos === 'bottom') {
      switch (sz) {
        case 'sm':
          return 'h-64';
        case 'md':
          return 'h-96';
        case 'lg':
          return 'h-[32rem]';
        case 'xl':
          return 'h-[80vh]';
        case 'fullWidth':
          return 'h-screen';
        default:
          return 'h-96';
      }
    }

    switch (sz) {
      case 'sm':
        return 'w-full sm:w-80 md:max-w-xs';
      case 'md':
        return 'w-full sm:w-96 md:max-w-md';
      case 'lg':
        return 'w-full sm:w-[32rem] md:max-w-xl';
      case 'xl':
        return 'w-full sm:w-[48rem] md:max-w-3xl';
      case 'fullWidth':
        return 'w-screen max-w-none';
      default:
        return 'w-full sm:w-96 md:max-w-md';
    }
  };

  // Click outside detection
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      config.closeOnOutsideClick !== false &&
      config.modal !== false &&
      drawerRef.current &&
      !drawerRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  // Keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && config.closeOnEscape !== false && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, config.closeOnEscape, onClose]);

  if (!isOpen) return null;

  const isModal = config.modal !== false;
  const hasShorthandHeader = Boolean(titleEn || titleAr || descriptionEn || descriptionAr || icon);
  const hasShorthandFooter = Boolean(actions && actions.length > 0);

  return (
    <div
      data-drawer-id={id}
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ zIndex: config.zIndex || 900 }}
      className={`fixed inset-0 ${
        isModal ? 'bg-surface-dark/60 backdrop-blur-xs' : 'pointer-events-none'
      } transition-opacity duration-300 ease-in-out`}
      onClick={handleBackdropClick}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={isModal}
        tabIndex={-1}
        aria-label={isAr ? titleAr || titleEn || 'لوح تفاعلي' : titleEn || titleAr || 'Interactive Drawer'}
        style={customWidthPx && (position === 'left' || position === 'right') ? { width: `${customWidthPx}px` } : undefined}
        className={`pointer-events-auto absolute bg-surface-primary text-text-primary shadow-2xl flex flex-col transition-all transform duration-300 ease-out overflow-hidden outline-hidden ${getPositionClasses(
          position
        )} ${getSizeClasses(position, size)}`}
      >
        {/* Mobile Bottom Sheet Grab Handle */}
        {position === 'bottom' && (
          <div className="w-full flex items-center justify-center pt-2 pb-1 bg-surface-primary shrink-0">
            <div className="w-12 h-1.5 bg-text-muted/30 rounded-full cursor-grab" />
          </div>
        )}

        {/* Render Shorthand Header if provided */}
        {hasShorthandHeader && (
          <DrawerHeader
            titleEn={titleEn}
            titleAr={titleAr}
            descriptionEn={descriptionEn}
            descriptionAr={descriptionAr}
            icon={icon}
            onClose={onClose}
            showCloseButton={config.showCloseButton !== false}
            isAr={isAr}
            density={density}
          />
        )}

        {/* If custom children are provided without shorthand, render children directly, else wrap children in DrawerBody */}
        {hasShorthandHeader || hasShorthandFooter ? (
          <DrawerBody
            isLoading={state.isLoading}
            error={state.error}
            density={density}
            isAr={isAr}
          >
            {children}
          </DrawerBody>
        ) : (
          children
        )}

        {/* Render Shorthand Footer if provided */}
        {hasShorthandFooter && (
          <DrawerFooter
            actions={actions}
            sticky={config.stickyFooter !== false}
            isAr={isAr}
            density={density}
          />
        )}
      </div>
    </div>
  );
};
