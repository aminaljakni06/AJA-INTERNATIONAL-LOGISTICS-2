/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Manager Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  DialogInstance,
  OpenDialogOptions,
  DialogType,
  DialogPriority,
} from '../types/dialogOrchestrationFramework';
import { DialogResult, ConfirmationDialogOptions } from '../types/dialogFramework';
import { DialogManagerService } from '../services/dialog/dialogManager';

export function useEnterpriseDialogManager() {
  const [activeInstances, setActiveInstances] = useState<DialogInstance[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogInstance | null>(null);

  useEffect(() => {
    const unsubscribe = DialogManagerService.subscribe((instances) => {
      setActiveInstances([...instances]);
      setActiveDialog(DialogManagerService.getActiveDialog());
    });
    return unsubscribe;
  }, []);

  const openDialog = useCallback(<TProps = any>(options: OpenDialogOptions<TProps>) => {
    return DialogManagerService.openDialog(options);
  }, []);

  const openDialogPromise = useCallback(
    <TData = any, TProps = any>(options: OpenDialogOptions<TProps>): Promise<DialogResult<TData>> => {
      return DialogManagerService.openDialogPromise<TData, TProps>(options);
    },
    []
  );

  const closeDialog = useCallback(
    (dialogId: string, status: DialogResult['status'] = 'cancelled', data?: any) => {
      DialogManagerService.closeDialog(dialogId, status, data);
    },
    []
  );

  const closeCurrent = useCallback(
    (status: DialogResult['status'] = 'cancelled', data?: any) => {
      DialogManagerService.closeCurrent(status, data);
    },
    []
  );

  const closeAll = useCallback(() => {
    DialogManagerService.closeAll();
  }, []);

  const replaceDialog = useCallback(
    <TProps = any>(oldDialogId: string, newOptions: OpenDialogOptions<TProps>) => {
      return DialogManagerService.replaceDialog(oldDialogId, newOptions);
    },
    []
  );

  const updateDialog = useCallback((dialogId: string, updates: Partial<OpenDialogOptions>) => {
    DialogManagerService.updateDialog(dialogId, updates);
  }, []);

  const showConfirmation = useCallback((options: ConfirmationDialogOptions): Promise<boolean> => {
    return DialogManagerService.showConfirmation(options);
  }, []);

  return {
    activeInstances,
    activeDialog,
    openDialog,
    openDialogPromise,
    closeDialog,
    closeCurrent,
    closeAll,
    replaceDialog,
    updateDialog,
    showConfirmation,
    stackDepth: activeInstances.length,
  };
}
