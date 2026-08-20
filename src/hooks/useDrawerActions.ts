/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Actions Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import { useCallback } from 'react';
import { OpenDrawerOptions, DrawerResult } from '../types/drawerFramework';
import { DrawerManagerService } from '../services/drawer/drawerManager';

export function useDrawerActions() {
  const open = useCallback(<TProps = any>(options: OpenDrawerOptions<TProps>): string => {
    return DrawerManagerService.openDrawer(options);
  }, []);

  const openPromise = useCallback(
    <TData = any, TProps = any>(
      options: OpenDrawerOptions<TProps>
    ): Promise<DrawerResult<TData>> => {
      return DrawerManagerService.openDrawerPromise<TData, TProps>(options);
    },
    []
  );

  const close = useCallback((id: string, status: DrawerResult['status'] = 'cancelled') => {
    DrawerManagerService.closeDrawer(id, status);
  }, []);

  const closeAll = useCallback(() => {
    DrawerManagerService.closeAll();
  }, []);

  return {
    open,
    openPromise,
    close,
    closeAll,
  };
}
