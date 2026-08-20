/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog System Foundation
 * Version: 1.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  DialogState,
  ConfirmationDialogOptions,
  ShowDialogOptions,
  DialogResult,
} from '../types/dialogFramework';
import { DialogManagerService } from '../services/dialog/dialogManager';

export interface UseEnterpriseDialogOptions {
  id?: string;
  defaultOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
  preventCloseIfDirty?: boolean;
  isAr?: boolean;
}

export function useEnterpriseDialog(options: UseEnterpriseDialogOptions = {}) {
  const {
    id,
    defaultOpen = false,
    onClose,
    onConfirm,
    preventCloseIfDirty = true,
    isAr = false,
  } = options;

  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: defaultOpen,
    isMinimized: false,
    isMaximized: false,
    isFullscreen: false,
    isLoading: false,
    isDirty: false,
    activeStep: 1,
    totalSteps: 1,
    error: null,
    successMessage: null,
  });

  const openDialog = useCallback(() => {
    setIsOpen(true);
    setDialogState((prev) => ({ ...prev, isOpen: true, error: null }));
  }, []);

  const closeDialog = useCallback(
    async (force: boolean = false) => {
      if (preventCloseIfDirty && dialogState.isDirty && !force) {
        const confirmed = await DialogManagerService.showConfirmation({
          titleEn: 'Unsaved Changes',
          titleAr: 'تغييرات غير محفوظة',
          messageEn: 'You have unsaved changes in this form. Are you sure you want to close and discard changes?',
          messageAr: 'لديك تغييرات غير محفوظة في هذا النموذج. هل أنت تأكد من الإغلاق وتجاهل التغييرات؟',
          type: 'warning',
          confirmLabelEn: 'Discard & Close',
          confirmLabelAr: 'تجاهل والإغلاق',
          cancelLabelEn: 'Keep Editing',
          cancelLabelAr: 'متابعة التعديل',
          isAr,
          onConfirm: () => {},
        });

        if (!confirmed) return;
      }

      setIsOpen(false);
      setDialogState((prev) => ({
        ...prev,
        isOpen: false,
        isDirty: false,
        isMinimized: false,
        isMaximized: false,
      }));

      if (onClose) onClose();
    },
    [preventCloseIfDirty, dialogState.isDirty, isAr, onClose]
  );

  const toggleMinimize = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  const toggleMaximize = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      isMaximized: !prev.isMaximized,
      isFullscreen: !prev.isMaximized ? false : prev.isFullscreen,
    }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      isFullscreen: !prev.isFullscreen,
      isMaximized: !prev.isFullscreen ? false : prev.isMaximized,
    }));
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    setDialogState((prev) => ({ ...prev, isDirty: dirty }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setDialogState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setDialogState((prev) => ({ ...prev, error }));
  }, []);

  const setStep = useCallback((step: number, total?: number) => {
    setDialogState((prev) => ({
      ...prev,
      activeStep: step,
      totalSteps: total || prev.totalSteps,
    }));
  }, []);

  // Show Programmatic Confirmation Dialog
  const confirm = useCallback(
    (config: ConfirmationDialogOptions) => {
      return DialogManagerService.showConfirmation({
        ...config,
        isAr: config.isAr ?? isAr,
      });
    },
    [isAr]
  );

  return {
    isOpen,
    dialogState,
    openDialog,
    closeDialog,
    toggleMinimize,
    toggleMaximize,
    toggleFullscreen,
    setDirty,
    setLoading,
    setError,
    setStep,
    confirm,
  };
}
