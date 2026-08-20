/**
 * AJA INTERNATIONAL LOGISTICS — Standardized Data Query Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryState, ServiceResult, RequestContext, CacheOptions } from '../types/sharedServices';

export interface UseEnterpriseDataQueryOptions<T = any> {
  queryKey: string;
  queryFn: (context?: RequestContext) => Promise<ServiceResult<T>>;
  context?: RequestContext;
  cacheOptions?: CacheOptions;
  enabled?: boolean;
  refetchIntervalMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useEnterpriseDataQuery<T = any>({
  queryKey,
  queryFn,
  context,
  enabled = true,
  refetchIntervalMs,
  onSuccess,
  onError,
}: UseEnterpriseDataQueryOptions<T>) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    status: 'idle',
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
    errorAr: null,
    lastUpdated: null,
  });

  const isMountedRef = useRef<boolean>(true);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (isRefetch: boolean = false) => {
      if (!enabled) return;

      setState((prev) => ({
        ...prev,
        status: isRefetch ? 'refetching' : 'loading',
        isLoading: !isRefetch,
        isFetching: true,
      }));

      try {
        const result = await queryFnRef.current(context);

        if (!isMountedRef.current) return;

        if (result.success && result.data !== undefined) {
          setState({
            data: result.data,
            status: 'success',
            isLoading: false,
            isFetching: false,
            isSuccess: true,
            isError: false,
            error: null,
            errorAr: null,
            lastUpdated: Date.now(),
          });
          onSuccess?.(result.data);
        } else {
          const errMsg = result.error || 'Failed to fetch data';
          setState((prev) => ({
            ...prev,
            status: 'error',
            isLoading: false,
            isFetching: false,
            isSuccess: false,
            isError: true,
            error: errMsg,
            errorAr: result.errorAr || 'فشل في استرجاع البيانات',
          }));
          onError?.(errMsg);
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;

        const errMsg = err.message || 'Unexpected query exception';
        setState((prev) => ({
          ...prev,
          status: 'error',
          isLoading: false,
          isFetching: false,
          isSuccess: false,
          isError: true,
          error: errMsg,
          errorAr: 'حدث خطأ غير متوقع',
        }));
        onError?.(errMsg);
      }
    },
    [queryKey, enabled, context, onSuccess, onError]
  );

  // Initial Fetch on mount or dependency update
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Polling interval support
  useEffect(() => {
    if (!refetchIntervalMs || !enabled) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refetchIntervalMs);

    return () => clearInterval(interval);
  }, [refetchIntervalMs, enabled, fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  /**
   * Optimistic data update helper
   */
  const setOptimisticData = useCallback((updater: (current: T | null) => T) => {
    setState((prev) => ({
      ...prev,
      data: updater(prev.data),
    }));
  }, []);

  return {
    ...state,
    refetch,
    setOptimisticData,
  };
}
