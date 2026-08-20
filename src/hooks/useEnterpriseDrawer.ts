/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { DrawerInstance, OpenDrawerOptions, DrawerResult } from '../types/drawerFramework';
import { DrawerManagerService } from '../services/drawer/drawerManager';

export function useEnterpriseDrawer() {
  const [activeInstances, setActiveInstances] = useState<DrawerInstance[]>([]);
  const [activeDrawer, setActiveDrawer] = useState<DrawerInstance | null>(null);

  useEffect(() => {
    const unsubscribe = DrawerManagerService.subscribe((instances) => {
      setActiveInstances([...instances]);
      setActiveDrawer(DrawerManagerService.getActiveDrawer());
    });
    return unsubscribe;
  }, []);

  const openDrawer = useCallback(<TProps = any>(options: OpenDrawerOptions<TProps>) => {
    return DrawerManagerService.openDrawer(options);
  }, []);

  const openDrawerPromise = useCallback(
    <TData = any, TProps = any>(options: OpenDrawerOptions<TProps>): Promise<DrawerResult<TData>> => {
      return DrawerManagerService.openDrawerPromise<TData, TProps>(options);
    },
    []
  );

  const closeDrawer = useCallback(
    (drawerId: string, status: DrawerResult['status'] = 'cancelled', data?: any) => {
      DrawerManagerService.closeDrawer(drawerId, status, data);
    },
    []
  );

  const closeCurrent = useCallback(
    (status: DrawerResult['status'] = 'cancelled', data?: any) => {
      DrawerManagerService.closeCurrent(status, data);
    },
    []
  );

  const closeAll = useCallback(() => {
    DrawerManagerService.closeAll();
  }, []);

  const replaceDrawer = useCallback(
    <TProps = any>(oldDrawerId: string, newOptions: OpenDrawerOptions<TProps>) => {
      return DrawerManagerService.replaceDrawer(oldDrawerId, newOptions);
    },
    []
  );

  const updateDrawer = useCallback((drawerId: string, updates: Partial<OpenDrawerOptions>) => {
    DrawerManagerService.updateDrawer(drawerId, updates);
  }, []);

  return {
    activeInstances,
    activeDrawer,
    openDrawer,
    openDrawerPromise,
    closeDrawer,
    closeCurrent,
    closeAll,
    replaceDrawer,
    updateDrawer,
    stackDepth: activeInstances.length,
  };
}
