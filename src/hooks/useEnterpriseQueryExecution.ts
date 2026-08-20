/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Query Execution Hook
 * Phase: Enterprise UI System
 * Module: Query State Management (STEP 05.15)
 * Version: 1.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  EnterpriseQueryState,
  QueryExecutionState,
  QueryTransitionType,
} from '../types/queryFramework';
import { generateQueryKey } from '../lib/query/enterpriseQueryEngine';

export interface UseEnterpriseQueryExecutionOptions<TData = any, TFilter extends Record<string, any> = Record<string, any>> {
  resourceName: string;
  queryState: EnterpriseQueryState<TFilter>;
  fetcher: (
    queryState: EnterpriseQueryState<TFilter>,
    signal: AbortSignal
  ) => Promise<{ data: TData[]; totalRecords?: number; cursor?: any }>;
  enabled?: boolean;
  keepPreviousData?: boolean;
  onSuccess?: (data: TData[], totalRecords: number) => void;
  onError?: (error: any) => void;
}

export function useEnterpriseQueryExecution<TData = any, TFilter extends Record<string, any> = Record<string, any>>({
  resourceName,
  queryState,
  fetcher,
  enabled = true,
  keepPreviousData = true,
  onSuccess,
  onError,
}: UseEnterpriseQueryExecutionOptions<TData, TFilter>) {
  const [executionState, setExecutionState] = useState<QueryExecutionState<TData>>({
    data: null,
    totalRecords: 0,
    isInitialLoading: enabled,
    isFetching: enabled,
    isTransitioning: false,
    transitionType: 'initial',
    error: null,
    lastFetchedAt: null,
    queryKey: generateQueryKey(resourceName, queryState),
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);
  const previousQueryKeyRef = useRef<string>('');

  const currentQueryKey = generateQueryKey(resourceName, queryState);

  // Determine transition type based on what changed
  const getTransitionType = (prevKey: string, nextKey: string): QueryTransitionType => {
    if (!prevKey) return 'initial';
    if (prevKey.includes('q_') !== nextKey.includes('q_')) return 'search';
    if (prevKey.includes('p') !== nextKey.includes('p')) return 'page';
    return 'filter';
  };

  const executeFetch = useCallback(async () => {
    if (!enabled) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = ++requestIdRef.current;
    const transition = getTransitionType(previousQueryKeyRef.current, currentQueryKey);
    previousQueryKeyRef.current = currentQueryKey;

    setExecutionState((prev) => ({
      ...prev,
      isFetching: true,
      isTransitioning: transition !== 'initial',
      transitionType: transition,
      error: null,
      // Retain previous data if requested
      data: keepPreviousData ? prev.data : null,
    }));

    try {
      const response = await fetcher(queryState, controller.signal);

      // Stale request check: if a newer request was dispatched, discard this result
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const totalRecords = response.totalRecords ?? response.data?.length ?? 0;

      setExecutionState({
        data: response.data,
        totalRecords,
        isInitialLoading: false,
        isFetching: false,
        isTransitioning: false,
        transitionType: 'none',
        error: null,
        lastFetchedAt: new Date().toISOString(),
        queryKey: currentQueryKey,
      });

      if (onSuccess) {
        onSuccess(response.data, totalRecords);
      }
    } catch (err: any) {
      // Ignore AbortError caused by cancellation
      if (err.name === 'AbortError') return;

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const errorMessageEn = err.message || 'Failed to execute query request.';
      const errorMessageAr = err.messageAr || 'فشل تنفيذ طلب الاستعلام البيانات.';

      setExecutionState((prev) => ({
        ...prev,
        isInitialLoading: false,
        isFetching: false,
        isTransitioning: false,
        transitionType: 'none',
        error: {
          messageEn: errorMessageEn,
          messageAr: errorMessageAr,
          code: err.code || 'QUERY_EXECUTION_ERROR',
          isRecoverable: true,
        },
      }));

      if (onError) {
        onError(err);
      }
    }
  }, [enabled, fetcher, queryState, currentQueryKey, keepPreviousData, onSuccess, onError]);

  useEffect(() => {
    executeFetch();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentQueryKey, enabled]);

  return {
    ...executionState,
    refetch: executeFetch,
  };
}
