/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Loading Context & Provider
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Loading Experience
 * Version: 1.0
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  EnterpriseLoadingContextValue,
  LoadingRequestTracker,
  LoadingType,
  AsyncOperationStatus,
  LoadingMetrics,
} from '../types/loading';
import { requestTrackerService } from '../utils/loadingTracker';

const EnterpriseLoadingContext = createContext<EnterpriseLoadingContextValue | undefined>(undefined);

export const EnterpriseLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState<Record<string, LoadingRequestTracker>>({});

  const isGlobalLoading = useMemo(() => {
    return Object.values(activeRequests).some((req) => req.type === 'PAGE' || req.type === 'ROUTE');
  }, [activeRequests]);

  const isModuleLoading = useCallback(
    (moduleName: string) => {
      return Object.values(activeRequests).some(
        (req) => req.module.toLowerCase() === moduleName.toLowerCase()
      );
    },
    [activeRequests]
  );

  const isKeyLoading = useCallback(
    (key: string) => {
      return Boolean(activeRequests[key]);
    },
    [activeRequests]
  );

  const startLoading = useCallback(
    (
      key: string,
      moduleName: string,
      type: LoadingType = 'COMPONENT',
      messageEn?: string,
      messageAr?: string
    ): string => {
      const requestId = `req_load_${Math.random().toString(36).substring(2, 10)}`;
      const tracker: LoadingRequestTracker = {
        requestId,
        key,
        module: moduleName,
        type,
        startedTime: Date.now(),
        retryCount: 0,
        status: 'LOADING',
        progressPercent: 0,
        messageEn: messageEn || 'Loading data...',
        messageAr: messageAr || 'جاري تحميل البيانات...',
      };

      setActiveRequests((prev) => ({
        ...prev,
        [key]: tracker,
      }));

      return requestId;
    },
    []
  );

  const updateProgress = useCallback(
    (key: string, percent: number, messageEn?: string, messageAr?: string) => {
      setActiveRequests((prev) => {
        const existing = prev[key];
        if (!existing) return prev;
        return {
          ...prev,
          [key]: {
            ...existing,
            progressPercent: Math.min(100, Math.max(0, percent)),
            messageEn: messageEn || existing.messageEn,
            messageAr: messageAr || existing.messageAr,
          },
        };
      });
    },
    []
  );

  const stopLoading = useCallback((key: string, status: AsyncOperationStatus = 'COMPLETED') => {
    setActiveRequests((prev) => {
      const existing = prev[key];
      if (!existing) return prev;

      const finishedTracker: LoadingRequestTracker = {
        ...existing,
        finishedTime: Date.now(),
        status,
      };

      // Record to performance telemetry
      requestTrackerService.recordRequestCompletion(finishedTracker);

      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setActiveRequests({});
  }, []);

  const metrics: LoadingMetrics = useMemo(() => {
    const baseMetrics = requestTrackerService.getMetrics();
    return {
      ...baseMetrics,
      activeRequestsCount: Object.keys(activeRequests).length,
    };
  }, [activeRequests]);

  const value = useMemo(
    () => ({
      activeRequests,
      isGlobalLoading,
      isModuleLoading,
      isKeyLoading,
      startLoading,
      updateProgress,
      stopLoading,
      clearAllLoading,
      metrics,
    }),
    [
      activeRequests,
      isGlobalLoading,
      isModuleLoading,
      isKeyLoading,
      startLoading,
      updateProgress,
      stopLoading,
      clearAllLoading,
      metrics,
    ]
  );

  return (
    <EnterpriseLoadingContext.Provider value={value}>
      {children}
    </EnterpriseLoadingContext.Provider>
  );
};

export function useEnterpriseLoading(): EnterpriseLoadingContextValue {
  const context = useContext(EnterpriseLoadingContext);
  if (!context) {
    throw new Error('useEnterpriseLoading must be used within an EnterpriseLoadingProvider');
  }
  return context;
}
