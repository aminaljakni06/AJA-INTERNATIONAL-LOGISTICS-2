/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Global Drawer Provider Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import React, { createContext, useContext, useEffect } from 'react';
import { DrawerInstance, OpenDrawerOptions, DrawerResult } from '../../types/drawerFramework';
import { DrawerManagerService } from '../../services/drawer/drawerManager';
import { DialogManagerService } from '../../services/dialog/dialogManager';
import { EnterpriseDrawerHost } from './EnterpriseDrawerHost';

export interface EnterpriseDrawerContextValue {
  openDrawer: <TProps = any>(options: OpenDrawerOptions<TProps>) => string;
  openDrawerPromise: <TData = any, TProps = any>(
    options: OpenDrawerOptions<TProps>
  ) => Promise<DrawerResult<TData>>;
  closeDrawer: (drawerId: string, status?: DrawerResult['status'], data?: any) => void;
  closeCurrent: (status?: DrawerResult['status'], data?: any) => void;
  closeAll: () => void;
  activeInstances: DrawerInstance[];
  topDrawer: DrawerInstance | null;
}

const EnterpriseDrawerContext = createContext<EnterpriseDrawerContextValue | null>(null);

export interface EnterpriseDrawerProviderProps {
  children: React.ReactNode;
}

export const EnterpriseDrawerProvider: React.FC<EnterpriseDrawerProviderProps> = ({
  children,
}) => {
  // Global Escape key handling when top-most active UI element is a drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If an active dialog exists, let DialogManager handle it first
        const activeDialog = DialogManagerService.getActiveDialog();
        if (activeDialog) return;

        const topDrawer = DrawerManagerService.getActiveDrawer();
        if (topDrawer && topDrawer.config.closeOnEscape !== false) {
          if (topDrawer.state.isDirty) {
            DialogManagerService.showConfirmation({
              titleEn: 'Discard Unsaved Changes?',
              titleAr: 'تجاهل التغييرات غير المحفوظة؟',
              messageEn: 'You have unsaved edits in this drawer. Are you sure you want to exit?',
              messageAr: 'لديك تعديلات غير محفوظة في هذا اللوح. هل أنت تأكد من الخروج؟',
              type: 'warning',
              confirmLabelEn: 'Discard & Exit',
              confirmLabelAr: 'تجاهل والخروج',
              cancelLabelEn: 'Keep Editing',
              cancelLabelAr: 'متابعة التعديل',
              onConfirm: () => {
                DrawerManagerService.closeDrawer(topDrawer.id, 'cancelled');
              },
            });
          } else {
            DrawerManagerService.closeDrawer(topDrawer.id, 'cancelled');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: EnterpriseDrawerContextValue = {
    openDrawer: (options) => DrawerManagerService.openDrawer(options),
    openDrawerPromise: (options) => DrawerManagerService.openDrawerPromise(options),
    closeDrawer: (id, status, data) => DrawerManagerService.closeDrawer(id, status, data),
    closeCurrent: (status, data) => DrawerManagerService.closeCurrent(status, data),
    closeAll: () => DrawerManagerService.closeAll(),
    activeInstances: DrawerManagerService.getStackInstances(),
    topDrawer: DrawerManagerService.getActiveDrawer(),
  };

  return (
    <EnterpriseDrawerContext.Provider value={value}>
      {children}
      <EnterpriseDrawerHost />
    </EnterpriseDrawerContext.Provider>
  );
};

export function useEnterpriseDrawerContext() {
  const ctx = useContext(EnterpriseDrawerContext);
  if (!ctx) {
    throw new Error('useEnterpriseDrawerContext must be used within an EnterpriseDrawerProvider');
  }
  return ctx;
}
