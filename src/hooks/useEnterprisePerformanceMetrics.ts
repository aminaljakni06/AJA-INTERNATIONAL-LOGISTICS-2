/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Performance Metrics Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { PerformanceMetrics, RequestMetadata } from '../types/dataFetchingFramework';
import { enterpriseMetricsTracker } from '../services/dataFetching/metricsTracker';

export function useEnterprisePerformanceMetrics(pollingIntervalMs: number = 3000) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(enterpriseMetricsTracker.getMetrics());
  const [logs, setLogs] = useState<RequestMetadata[]>(enterpriseMetricsTracker.getRecentLogs());

  const refreshMetrics = useCallback(() => {
    setMetrics(enterpriseMetricsTracker.getMetrics());
    setLogs(enterpriseMetricsTracker.getRecentLogs());
  }, []);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [pollingIntervalMs, refreshMetrics]);

  return {
    metrics,
    logs,
    refreshMetrics,
  };
}
