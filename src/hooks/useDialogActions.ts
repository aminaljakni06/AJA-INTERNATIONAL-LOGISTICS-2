/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Actions Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import { useCallback } from 'react';
import { ConfirmationDialogOptions, DialogResult } from '../types/dialogFramework';
import { OpenDialogOptions } from '../types/dialogOrchestrationFramework';
import { DialogManagerService } from '../services/dialog/dialogManager';

export function useDialogActions() {
  const confirm = useCallback((options: ConfirmationDialogOptions): Promise<boolean> => {
    return DialogManagerService.showConfirmation(options);
  }, []);

  const open = useCallback(<TProps = any>(options: OpenDialogOptions<TProps>): string => {
    return DialogManagerService.openDialog(options);
  }, []);

  const openPromise = useCallback(
    <TData = any, TProps = any>(
      options: OpenDialogOptions<TProps>
    ): Promise<DialogResult<TData>> => {
      return DialogManagerService.openDialogPromise<TData, TProps>(options);
    },
    []
  );

  const close = useCallback((id: string, status: DialogResult['status'] = 'cancelled') => {
    DialogManagerService.closeDialog(id, status);
  }, []);

  const closeAll = useCallback(() => {
    DialogManagerService.closeAll();
  }, []);

  return {
    confirm,
    open,
    openPromise,
    close,
    closeAll,
  };
}
