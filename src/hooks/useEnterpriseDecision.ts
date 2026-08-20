/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Decision & Confirmation Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import {
  DecisionRequest,
  DecisionResult,
  ProtectedActionConfig,
  DialogSeverity,
} from '../types/decisionFramework';
import { DecisionService } from '../services/dialog/decisionService';
import { DialogManagerService } from '../services/dialog/dialogManager';

export function useEnterpriseDecision() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /**
   * Triggers a comprehensive decision request
   */
  const requestDecision = useCallback(async (options: DecisionRequest): Promise<DecisionResult> => {
    setIsProcessing(true);
    try {
      const result = await DecisionService.requestDecision(options);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Helper for quick confirmation dialogs
   */
  const confirmAction = useCallback(
    async (
      titleEn: string,
      titleAr: string,
      messageEn: string,
      messageAr: string,
      onConfirm: () => void | Promise<void>,
      type: 'confirm' | 'danger' | 'warning' | 'info' | 'success' = 'confirm',
      requireExplicitWord?: string
    ): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const confirmed = await DialogManagerService.showConfirmation({
          titleEn,
          titleAr,
          messageEn,
          messageAr,
          type,
          requireExplicitWord,
          onConfirm,
        });
        return confirmed;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  /**
   * Helper for high-risk protected action execution
   */
  const executeProtectedAction = useCallback(
    async (
      config: ProtectedActionConfig,
      moduleName: string,
      recordId: string,
      actionFn: () => Promise<void>
    ): Promise<boolean> => {
      setIsProcessing(true);
      try {
        return await DecisionService.executeProtectedAction(
          config,
          moduleName,
          recordId,
          actionFn
        );
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    isProcessing,
    requestDecision,
    confirmAction,
    executeProtectedAction,
  };
}
