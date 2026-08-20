/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Analytics Query Hook
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Enterprise Query State, Saved Analytics Views & Dynamic Date/Filter Integration (STEP 05.19.05)
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AnalyticsMetricResult,
  AnalyticsGroupedResult,
  AnalyticsTimeSeriesPoint,
} from '../types/analyticsFramework';
import { EnterpriseQueryState } from '../types/queryFramework';
import { AnalyticsService } from '../services/analyticsService';
import { PublicAnalyticsMetricDTO } from '../lib/analytics/analyticsDtoMapper';
import {
  sanitizeSelectedMetricIds,
  batchMetricIds,
  DateRangeValue,
} from '../lib/analytics/analyticsQueryUtils';

export type AnalyticsQueryStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface TimeSeriesResponse {
  metricId: string;
  interval: 'DAY' | 'WEEK' | 'MONTH';
  dateRange: { startDate: string; endDate: string } | null;
  points: AnalyticsTimeSeriesPoint[];
  computedAt: string;
}

export interface UseAnalyticsQueryOptions {
  queryState?: EnterpriseQueryState;
  metricIds?: string[];
  resource?: string;
  dimension?: string;
  interval?: 'DAY' | 'WEEK' | 'MONTH';
  dateRange?: DateRangeValue;
  autoFetch?: boolean;
  debounceMs?: number;
}

export interface UseAnalyticsQueryResult {
  status: AnalyticsQueryStatus;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
  errorCode: string | null;
  metrics: Record<string, AnalyticsMetricResult>;
  grouped: AnalyticsGroupedResult | null;
  timeSeries: TimeSeriesResponse | null;
  availableMetrics: PublicAnalyticsMetricDTO[];
  permittedMetricIds: string[];
  refetch: () => Promise<void>;
  setMetricIds: (metricIds: string[]) => void;
  setResource: (resource: string | undefined) => void;
  setDimension: (dimension: string | undefined) => void;
  setInterval: (interval: 'DAY' | 'WEEK' | 'MONTH' | undefined) => void;
}

export function useAnalyticsQuery(options: UseAnalyticsQueryOptions = {}): UseAnalyticsQueryResult {
  const {
    queryState,
    metricIds: initialMetricIds = [],
    resource: initialResource,
    dimension: initialDimension,
    interval: initialInterval,
    dateRange: initialDateRange,
    autoFetch = true,
    debounceMs = 300,
  } = options;

  const [metricIds, setMetricIdsState] = useState<string[]>(initialMetricIds);
  const [resource, setResourceState] = useState<string | undefined>(initialResource);
  const [dimension, setDimensionState] = useState<string | undefined>(initialDimension);
  const [interval, setIntervalState] = useState<'DAY' | 'WEEK' | 'MONTH' | undefined>(initialInterval);

  const [status, setStatus] = useState<AnalyticsQueryStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<Record<string, AnalyticsMetricResult>>({});
  const [grouped, setGrouped] = useState<AnalyticsGroupedResult | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesResponse | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<PublicAnalyticsMetricDTO[]>([]);

  // Request sequence tracking to guard against stale inflight responses
  const requestIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal states if options change externally
  useEffect(() => {
    if (JSON.stringify(initialMetricIds) !== JSON.stringify(metricIds)) {
      setMetricIdsState(initialMetricIds);
    }
  }, [JSON.stringify(initialMetricIds)]);

  useEffect(() => {
    if (initialResource !== resource) {
      setResourceState(initialResource);
    }
  }, [initialResource]);

  useEffect(() => {
    if (initialDimension !== dimension) {
      setDimensionState(initialDimension);
    }
  }, [initialDimension]);

  useEffect(() => {
    if (initialInterval !== interval) {
      setIntervalState(initialInterval);
    }
  }, [initialInterval]);

  // Metric discovery for resource/user
  useEffect(() => {
    let isCancelled = false;

    const fetchCatalog = async () => {
      try {
        const catalog = await AnalyticsService.getAvailableMetrics(resource);
        if (!isCancelled) {
          setAvailableMetrics(catalog);
        }
      } catch (err) {
        console.warn('[useAnalyticsQuery] Failed to discover metrics catalog:', err);
      }
    };

    fetchCatalog();

    return () => {
      isCancelled = true;
    };
  }, [resource]);

  // Primary Execution Logic
  const executeQuery = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;

    if (!metricIds || metricIds.length === 0) {
      setStatus('idle');
      setMetrics({});
      setGrouped(null);
      setTimeSeries(null);
      setError(null);
      setErrorCode(null);
      return;
    }

    setStatus('loading');
    setError(null);
    setErrorCode(null);

    try {
      // Permission-aware metric sanitization
      const safeMetricIds = sanitizeSelectedMetricIds(metricIds, availableMetrics);

      if (safeMetricIds.length === 0 && availableMetrics.length > 0) {
        if (requestIdRef.current === currentRequestId) {
          setStatus('empty');
          setMetrics({});
          setGrouped(null);
          setTimeSeries(null);
        }
        return;
      }

      const activeIds = safeMetricIds.length > 0 ? safeMetricIds : metricIds;

      // 1. Scalar Multi-Metric Batch Query (Limit 20 per request)
      const batches = batchMetricIds(activeIds, 20);
      const batchPromises = batches.map((batch) =>
        AnalyticsService.queryMetrics({
          metricIds: batch,
          queryState,
        })
      );

      const batchResponses = await Promise.all(batchPromises);

      // Check for stale response
      if (requestIdRef.current !== currentRequestId) return;

      const mergedMetrics: Record<string, AnalyticsMetricResult> = {};
      batchResponses.forEach((res) => {
        if (res?.metrics) {
          Object.assign(mergedMetrics, res.metrics);
        }
      });

      // 2. Grouped Query (if dimension specified)
      let groupedRes: AnalyticsGroupedResult | null = null;
      if (dimension && activeIds[0]) {
        try {
          groupedRes = await AnalyticsService.queryGroupedAnalytics({
            metricId: activeIds[0],
            dimension,
            queryState,
          });
        } catch (gErr) {
          console.warn('[useAnalyticsQuery] Grouped query failed:', gErr);
        }
      }

      // Check for stale response
      if (requestIdRef.current !== currentRequestId) return;

      // 3. Time-Series Query (if interval specified)
      let timeSeriesRes: TimeSeriesResponse | null = null;
      if (interval && activeIds[0]) {
        try {
          const effectiveDateRange = initialDateRange || (queryState?.filters as any)?.dateRange;
          timeSeriesRes = await AnalyticsService.queryTimeSeriesAnalytics({
            metricId: activeIds[0],
            interval,
            dateRange: effectiveDateRange,
            queryState,
          });
        } catch (tsErr) {
          console.warn('[useAnalyticsQuery] Time-series query failed:', tsErr);
        }
      }

      // Final check for stale response
      if (requestIdRef.current !== currentRequestId) return;

      setMetrics(mergedMetrics);
      setGrouped(groupedRes);
      setTimeSeries(timeSeriesRes);

      // Evaluate empty status
      const hasMetricValues = Object.values(mergedMetrics).some(
        (m) => m && m.value !== null && m.value !== 0
      );
      const hasGroupedItems = Boolean(groupedRes?.groups && groupedRes.groups.length > 0);
      const hasTimeSeriesPoints = Boolean(timeSeriesRes?.points && timeSeriesRes.points.length > 0);

      const isEmptyResult = !hasMetricValues && !hasGroupedItems && !hasTimeSeriesPoints;
      setStatus(isEmptyResult ? 'empty' : 'success');
    } catch (err: any) {
      if (requestIdRef.current !== currentRequestId) return;

      setStatus('error');
      setError(err instanceof Error ? err : new Error(String(err)));
      setErrorCode(err?.code || 'ANALYTICS_QUERY_FAILED');
    }
  }, [metricIds, availableMetrics, queryState, dimension, interval, initialDateRange]);

  // Debounced Auto-Fetch Trigger
  useEffect(() => {
    if (!autoFetch) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeQuery();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [autoFetch, debounceMs, executeQuery]);

  const setMetricIds = useCallback((ids: string[]) => {
    setMetricIdsState(ids);
  }, []);

  const setResource = useCallback((res: string | undefined) => {
    setResourceState(res);
  }, []);

  const setDimension = useCallback((dim: string | undefined) => {
    setDimensionState(dim);
  }, []);

  const setInterval = useCallback((inv: 'DAY' | 'WEEK' | 'MONTH' | undefined) => {
    setIntervalState(inv);
  }, []);

  return {
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isEmpty: status === 'empty',
    error,
    errorCode,
    metrics,
    grouped,
    timeSeries,
    availableMetrics,
    permittedMetricIds: availableMetrics.map((m) => m.id),
    refetch: executeQuery,
    setMetricIds,
    setResource,
    setDimension,
    setInterval,
  };
}
