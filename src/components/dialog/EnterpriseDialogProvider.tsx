/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Dialog Provider Component
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import React, { createContext, useContext, useEffect } from 'react';
import { DialogInstance, OpenDialogOptions } from '../../types/dialogOrchestrationFramework';
import { ConfirmationDialogOptions, DialogResult } from '../../types/dialogFramework';
import { DialogManagerService } from '../../services/dialog/dialogManager';
import { EnterpriseDialogHost } from './EnterpriseDialogHost';

export interface EnterpriseDialogContextValue {
  openDialog: <TProps = any>(options: OpenDialogOptions<TProps>) => string;
  openDialogPromise: <TData = any, TProps = any>(
    options: OpenDialogOptions<TProps>
  ) => Promise<DialogResult<TData>>;
  closeDialog: (dialogId: string, status?: DialogResult['status'], data?: any) => void;
  closeCurrent: (status?: DialogResult['status'], data?: any) => void;
  closeAll: () => void;
  showConfirmation: (options: ConfirmationDialogOptions) => Promise<boolean>;
  activeInstances: DialogInstance[];
  topDialog: DialogInstance | null;
}

const EnterpriseDialogContext = createContext<EnterpriseDialogContextValue | null>(null);

export interface EnterpriseDialogProviderProps {
  children: React.ReactNode;
}

export const EnterpriseDialogProvider: React.FC<EnterpriseDialogProviderProps> = ({
  children,
}) => {
  // Global Escape key listener for top-most dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const topDialog = DialogManagerService.getActiveDialog();
        if (topDialog && topDialog.config.closeOnEscape) {
          // Prevent accidental close if dirty form
          if (topDialog.state.isDirty) {
            DialogManagerService.showConfirmation({
              titleEn: 'Discard Unsaved Changes?',
              titleAr: 'تجاهل التغييرات غير المحفوظة؟',
              messageEn: 'You have unsaved edits in this dialog. Are you sure you want to exit?',
              messageAr: 'لديك تعديلات غير محفوظة. هل أنت تأكد من الخروج؟',
              type: 'warning',
              confirmLabelEn: 'Discard & Exit',
              confirmLabelAr: 'تجاهل والخروج',
              cancelLabelEn: 'Keep Editing',
              cancelLabelAr: 'متابعة التعديل',
              onConfirm: () => {
                DialogManagerService.closeDialog(topDialog.id, 'cancelled');
              },
            });
          } else {
            DialogManagerService.closeDialog(topDialog.id, 'cancelled');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: EnterpriseDialogContextValue = {
    openDialog: (options) => DialogManagerService.openDialog(options),
    openDialogPromise: (options) => DialogManagerService.openDialogPromise(options),
    closeDialog: (id, status, data) => DialogManagerService.closeDialog(id, status, data),
    closeCurrent: (status, data) => DialogManagerService.closeCurrent(status, data),
    closeAll: () => DialogManagerService.closeAll(),
    showConfirmation: (options) => DialogManagerService.showConfirmation(options),
    activeInstances: DialogManagerService.getStackInstances(),
    topDialog: DialogManagerService.getActiveDialog(),
  };

  return (
    <EnterpriseDialogContext.Provider value={value}>
      {children}
      <EnterpriseDialogHost />
    </EnterpriseDialogContext.Provider>
  );
};

export function useEnterpriseDialogContext() {
  const ctx = useContext(EnterpriseDialogContext);
  if (!ctx) {
    throw new Error('useEnterpriseDialogContext must be used within an EnterpriseDialogProvider');
  }
  return ctx;
}
