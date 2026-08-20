/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Alert Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertItem } from '../types/feedbackFramework';
import { enterpriseAlertService } from '../services/feedback/alertService';

export function useEnterpriseAlert() {
  const [alerts, setAlerts] = useState<AlertItem[]>(enterpriseAlertService.activeAlerts);

  useEffect(() => {
    const unsubscribe = enterpriseAlertService.subscribe((updated) => {
      setAlerts(updated);
    });
    return () => unsubscribe();
  }, []);

  const showAlert = useCallback((item: Omit<AlertItem, 'id'>) => {
    return enterpriseAlertService.showAlert(item);
  }, []);

  const showMaintenanceBanner = useCallback(
    (titleEn: string, titleAr: string, detailsEn?: string, detailsAr?: string) => {
      return enterpriseAlertService.showMaintenanceBanner(titleEn, titleAr, detailsEn, detailsAr);
    },
    []
  );

  const showEmergencyBanner = useCallback(
    (titleEn: string, titleAr: string, detailsEn?: string, detailsAr?: string) => {
      return enterpriseAlertService.showEmergencyBanner(titleEn, titleAr, detailsEn, detailsAr);
    },
    []
  );

  const dismissAlert = useCallback((id: string) => {
    enterpriseAlertService.dismissAlert(id);
  }, []);

  return {
    alerts,
    showAlert,
    showMaintenanceBanner,
    showEmergencyBanner,
    dismissAlert,
  };
}
