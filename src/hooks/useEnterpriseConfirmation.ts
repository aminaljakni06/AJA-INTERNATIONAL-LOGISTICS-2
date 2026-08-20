/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Confirmation Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { ConfirmationConfig } from '../types/feedbackFramework';
import { enterpriseConfirmationService } from '../services/feedback/confirmationService';

export function useEnterpriseConfirmation() {
  const [config, setConfig] = useState<ConfirmationConfig | null>(
    enterpriseConfirmationService.currentConfig
  );

  useEffect(() => {
    const unsubscribe = enterpriseConfirmationService.subscribe((active) => {
      setConfig(active);
    });
    return () => unsubscribe();
  }, []);

  const confirmAction = useCallback((params: Omit<ConfirmationConfig, 'id'>) => {
    return enterpriseConfirmationService.confirm(params);
  }, []);

  const closeConfirmation = useCallback(() => {
    enterpriseConfirmationService.close();
  }, []);

  return {
    confirmationConfig: config,
    confirmAction,
    closeConfirmation,
  };
}
