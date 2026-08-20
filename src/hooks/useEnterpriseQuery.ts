/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Query Hook (Gateway Integrated)
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryState, RequestContext } from '../types/sharedServices';
import { EnterpriseQueryOptions } from '../types/dataFetchingFramework';
import { enterpriseDataGateway } from '../services/dataFetching/enterpriseDataGateway';

export function useEnterpriseQuery<T = any>(
  options: EnterpriseQueryOptions<T>,
  context?: RequestContext
) {
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
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeFetch = useCallback(
    async (isRefetch: boolean = false) => {
      if (optionsRef.current.enabled === false) return;

      setState((prev) => ({
        ...prev,
        status: isRefetch ? 'refetching' : 'loading',
        isLoading: !isRefetch,
        isFetching: true,
      }));

      try {
        const result = await enterpriseDataGateway.executeQuery<T>(optionsRef.current, context);

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
          optionsRef.current.onSuccess?.(result.data);
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
          optionsRef.current.onError?.(errMsg);
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        const errMsg = err.message || 'Unexpected error occurred';
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
        optionsRef.current.onError?.(errMsg);
      }
    },
    [context]
  );

  useEffect(() => {
    executeFetch(false);
  }, [options.queryKey, options.endpoint, executeFetch]);

  useEffect(() => {
    if (!options.refetchIntervalMs || options.enabled === false) return;

    const interval = setInterval(() => {
      executeFetch(true);
    }, options.refetchIntervalMs);

    return () => clearInterval(interval);
  }, [options.refetchIntervalMs, options.enabled, executeFetch]);

  const refetch = useCallback(() => {
    return executeFetch(true);
  }, [executeFetch]);

  return {
    ...state,
    refetch,
  };
}
