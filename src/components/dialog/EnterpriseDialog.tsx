/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Base Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog System Foundation
 * Version: 1.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Minimize2,
  Maximize2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { DialogProps, DialogSize } from '../../types/dialogFramework';

export const EnterpriseDialog: React.FC<DialogProps> = ({
  id = 'enterprise_dialog',
  isOpen,
  onClose,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  statusBadge,
  icon,
  actions = [],
  metadata,
  config = {},
  state = {},
  isAr = false,
  children,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const {
    size = 'md',
    variant = 'standard',
    closeOnEscape = true,
    closeOnBackdropClick = true,
    showCloseButton = true,
    showHelpButton = false,
    showMinimizeButton = false,
    showMaximizeButton = false,
    stickyHeader = true,
    stickyFooter = true,
    zIndex = 50,
  } = config;

  const {
    isMinimized = false,
    isMaximized = false,
    isFullscreen = false,
    isLoading = false,
    error = null,
  } = state;

  // Store active element for focus restoration upon close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus container for accessibility keyboard handling
      setTimeout(() => dialogRef.current?.focus(), 50);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Keyboard Escape Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Backdrop click handler
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnBackdropClick) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!isOpen) return null;

  // Size mapping styles
  const getSizeClasses = (s: DialogSize): string => {
    if (isFullscreen) return 'w-screen h-screen rounded-none max-w-none m-0';
    if (isMaximized) return 'w-[96vw] h-[92vh] max-w-none';

    switch (s) {
      case 'xs':
        return 'max-w-xs w-full';
      case 'sm':
        return 'max-w-md w-full';
      case 'md':
        return 'max-w-xl w-full';
      case 'lg':
        return 'max-w-3xl w-full';
      case 'xl':
        return 'max-w-5xl w-full';
      case 'fullWidth':
        return 'max-w-7xl w-full';
      case 'fullscreen':
        return 'w-screen h-screen rounded-none max-w-none';
      case 'auto':
        return 'w-auto max-w-full';
      case 'responsive':
      default:
        return 'w-full sm:max-w-2xl';
    }
  };

  const titleText = isAr ? titleAr || titleEn : titleEn || titleAr;
  const subtitleText = isAr ? subtitleAr || subtitleEn : subtitleEn || subtitleAr;

  const content = (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      style={{ zIndex }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={`${id}_title`}
      aria-describedby={subtitleText ? `${id}_desc` : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden outline-none transition-all duration-200 ${
          isMinimized ? 'h-16 overflow-hidden max-w-md self-end mb-4' : ''
        } ${getSizeClasses(size)} ${className}`}
      >
        {/* Sticky Top Header */}
        <div
          className={`${
            stickyHeader ? 'sticky top-0 z-10' : ''
          } px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-4 ${headerClassName}`}
        >
          {/* Header Info Left */}
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl shrink-0">
                {icon}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              {/* Breadcrumbs & Module Metadata */}
              {(metadata?.breadcrumbs || metadata?.moduleName) && (
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 font-mono truncate">
                  {metadata.moduleName && (
                    <span className="text-amber-600 dark:text-amber-400">
                      [{metadata.moduleName}]
                    </span>
                  )}
                  {metadata.breadcrumbs?.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      <span>/</span>
                      <span>{crumb}</span>
                    </React.Fragment>
                  ))}
                  {metadata.recordId && (
                    <span className="text-slate-500 font-normal">
                      #{metadata.recordId}
                    </span>
                  )}
                </div>
              )}

              {/* Title & Badge */}
              <div className="flex items-center gap-2">
                <h2
                  id={`${id}_title`}
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate"
                >
                  {titleText || 'System Dialog'}
                </h2>

                {statusBadge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      statusBadge.variant === 'danger'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        : statusBadge.variant === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        : statusBadge.variant === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isAr ? statusBadge.labelAr : statusBadge.labelEn}
                  </span>
                )}
              </div>

              {/* Subtitle */}
              {subtitleText && (
                <p
                  id={`${id}_desc`}
                  className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5"
                >
                  {subtitleText}
                </p>
              )}
            </div>
          </div>

          {/* Header Controls Right */}
          <div className="flex items-center gap-1 shrink-0">
            {metadata?.documentationUrl && (
              <a
                href={metadata.documentationUrl}
                target="_blank"
                rel="noreferrer"
                title={isAr ? 'التعليمات والتوثيق' : 'Documentation & Help'}
                className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label={isAr ? 'إغلاق النافذة' : 'Close modal'}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Body Content */}
        {!isMinimized && (
          <div
            className={`flex-1 p-6 overflow-y-auto max-h-[75vh] ${bodyClassName}`}
          >
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <span className="text-xs font-semibold">
                  {isAr ? 'جاري التحميل والمعالجة...' : 'Loading operational data...'}
                </span>
              </div>
            ) : (
              children
            )}
          </div>
        )}

        {/* Sticky Footer Actions */}
        {!isMinimized && (actions.length > 0 || onConfirm || onCancel) && (
          <div
            className={`${
              stickyFooter ? 'sticky bottom-0 z-10' : ''
            } px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 ${footerClassName}`}
          >
            {/* Helper text / Classification footer indicator */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              {metadata?.classification && (
                <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[9px]">
                  {metadata.classification}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 ml-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              )}

              {actions.map((act) => {
                const isPrimary = act.variant === 'primary' || !act.variant;
                const isDanger = act.variant === 'danger';
                const isGhost = act.variant === 'ghost';
                const isOutline = act.variant === 'outline';

                let btnClass = 'px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm ';

                if (isDanger) {
                  btnClass += 'bg-rose-600 hover:bg-rose-700 text-white';
                } else if (isPrimary) {
                  btnClass += 'bg-amber-600 hover:bg-amber-700 text-white';
                } else if (isOutline) {
                  btnClass += 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
                } else if (isGhost) {
                  btnClass += 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none';
                } else {
                  btnClass += 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300';
                }

                return (
                  <button
                    key={act.id}
                    type="button"
                    disabled={act.disabled || act.isLoading}
                    onClick={act.onClick}
                    className={`${btnClass} ${
                      act.disabled || act.isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {act.isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      act.icon
                    )}
                    <span>{isAr ? act.labelAr : act.labelEn}</span>
                  </button>
                );
              })}

              {onConfirm && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onConfirm}
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAr ? 'تأكيد وحفظ' : 'Confirm & Save'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
