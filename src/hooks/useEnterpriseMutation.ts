/**
 * AJA INTERNATIONAL LOGISTICS — Standardized Data Mutation Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import { MutationState, ServiceResult, RequestContext } from '../types/sharedServices';

export interface UseEnterpriseMutationOptions<TData = any, TVariables = any> {
  mutationFn: (variables: TVariables, context?: RequestContext) => Promise<ServiceResult<TData>>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: string, variables: TVariables) => void;
}

export function useEnterpriseMutation<TData = any, TVariables = any>({
  mutationFn,
  onSuccess,
  onError,
}: UseEnterpriseMutationOptions<TData, TVariables>) {
  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    status: 'idle',
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    errorAr: null,
  });

  const mutate = useCallback(
    async (variables: TVariables, context?: RequestContext): Promise<ServiceResult<TData>> => {
      setState({
        data: null,
        status: 'loading',
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
        errorAr: null,
      });

      try {
        const result = await mutationFn(variables, context);

        if (result.success && result.data !== undefined) {
          setState({
            data: result.data,
            status: 'success',
            isPending: false,
            isSuccess: true,
            isError: false,
            error: null,
            errorAr: null,
          });
          onSuccess?.(result.data, variables);
        } else {
          const errMsg = result.error || 'Mutation failed';
          setState({
            data: null,
            status: 'error',
            isPending: false,
            isSuccess: false,
            isError: true,
            error: errMsg,
            errorAr: result.errorAr || 'فشلت العملية',
          });
          onError?.(errMsg, variables);
        }

        return result;
      } catch (err: any) {
        const errMsg = err.message || 'Unexpected mutation exception';
        const failResult: ServiceResult<TData> = {
          success: false,
          error: errMsg,
          errorAr: 'حدث خطأ غير متوقع',
        };

        setState({
          data: null,
          status: 'error',
          isPending: false,
          isSuccess: false,
          isError: true,
          error: errMsg,
          errorAr: 'حدث خطأ غير متوقع',
        });
        onError?.(errMsg, variables);
        return failResult;
      }
    },
    [mutationFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      status: 'idle',
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      errorAr: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
