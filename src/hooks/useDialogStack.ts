/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Stack Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog Manager & Global Dialog Orchestration
 * Version: 1.0
 */

import { useState, useEffect } from 'react';
import { DialogInstance } from '../types/dialogOrchestrationFramework';
import { DialogManagerService } from '../services/dialog/dialogManager';

export function useDialogStack() {
  const [instances, setInstances] = useState<DialogInstance[]>([]);

  useEffect(() => {
    return DialogManagerService.subscribe((updatedInstances) => {
      setInstances([...updatedInstances]);
    });
  }, []);

  const topDialog = instances.length > 0 ? instances[instances.length - 1] : null;
  const isNested = instances.length > 1;

  return {
    instances,
    topDialog,
    stackDepth: instances.length,
    isNested,
    activeId: topDialog?.id || null,
  };
}
