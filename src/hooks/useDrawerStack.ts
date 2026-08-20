/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Stack Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer / Side Panel Foundation
 * Version: 1.0
 */

import { useState, useEffect } from 'react';
import { DrawerInstance } from '../types/drawerFramework';
import { DrawerManagerService } from '../services/drawer/drawerManager';

export function useDrawerStack() {
  const [instances, setInstances] = useState<DrawerInstance[]>([]);

  useEffect(() => {
    return DrawerManagerService.subscribe((updatedInstances) => {
      setInstances([...updatedInstances]);
    });
  }, []);

  const topDrawer = instances.length > 0 ? instances[instances.length - 1] : null;
  const isNested = instances.length > 1;

  return {
    instances,
    topDrawer,
    stackDepth: instances.length,
    isNested,
    activeId: topDrawer?.id || null,
  };
}
