/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Toast Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { ToastItem } from '../types/feedbackFramework';
import { enterpriseToastService } from '../services/feedback/toastService';

export function useEnterpriseToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(enterpriseToastService.activeToasts);

  useEffect(() => {
    const unsubscribe = enterpriseToastService.subscribe((updated) => {
      setToasts(updated);
    });
    return () => unsubscribe();
  }, []);

  const showToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    return enterpriseToastService.show(item);
  }, []);

  const toastSuccess = useCallback(
    (titleEn: string, titleAr: string, messageEn?: string, messageAr?: string) => {
      return enterpriseToastService.success(titleEn, titleAr, messageEn, messageAr);
    },
    []
  );

  const toastError = useCallback(
    (titleEn: string, titleAr: string, messageEn?: string, messageAr?: string) => {
      return enterpriseToastService.error(titleEn, titleAr, messageEn, messageAr);
    },
    []
  );

  const toastWarning = useCallback(
    (titleEn: string, titleAr: string, messageEn?: string, messageAr?: string) => {
      return enterpriseToastService.warning(titleEn, titleAr, messageEn, messageAr);
    },
    []
  );

  const toastInfo = useCallback(
    (titleEn: string, titleAr: string, messageEn?: string, messageAr?: string) => {
      return enterpriseToastService.info(titleEn, titleAr, messageEn, messageAr);
    },
    []
  );

  const toastLoading = useCallback(
    (titleEn: string, titleAr: string, messageEn?: string, messageAr?: string) => {
      return enterpriseToastService.loading(titleEn, titleAr, messageEn, messageAr);
    },
    []
  );

  const toastProgress = useCallback(
    (titleEn: string, titleAr: string, percent: number, messageEn?: string, messageAr?: string) => {
      return enterpriseToastService.progress(titleEn, titleAr, percent, messageEn, messageAr);
    },
    []
  );

  const toastUndo = useCallback(
    (titleEn: string, titleAr: string, onUndo: () => void | Promise<void>, durationMs?: number) => {
      return enterpriseToastService.undo(titleEn, titleAr, onUndo, durationMs);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    enterpriseToastService.dismiss(id);
  }, []);

  const updateProgress = useCallback((id: string, percent: number) => {
    enterpriseToastService.updateProgress(id, percent);
  }, []);

  const clearAllToasts = useCallback(() => {
    enterpriseToastService.clearAll();
  }, []);

  return {
    toasts,
    showToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
    toastLoading,
    toastProgress,
    toastUndo,
    dismissToast,
    updateProgress,
    clearAllToasts,
  };
}
