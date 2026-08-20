/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Mutation Hook (Gateway Integrated)
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import { MutationState, RequestContext } from '../types/sharedServices';
import { EnterpriseMutationOptions } from '../types/dataFetchingFramework';
import { enterpriseDataGateway } from '../services/dataFetching/enterpriseDataGateway';

export function useEnterpriseMutationGateway<TData = any, TVariables = any>(
  options: EnterpriseMutationOptions<TData, TVariables>
) {
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
    async (variables: TVariables, context?: RequestContext) => {
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
        const result = await enterpriseDataGateway.executeMutation<TData, TVariables>(
          options,
          variables,
          context
        );

        if (result.success) {
          setState({
            data: result.data || null,
            status: 'success',
            isPending: false,
            isSuccess: true,
            isError: false,
            error: null,
            errorAr: null,
          });
          options.onSuccess?.(result.data as TData, variables);
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
          options.onError?.(errMsg, variables);
        }

        return result;
      } catch (err: any) {
        const errMsg = err.message || 'Unexpected mutation failure';
        setState({
          data: null,
          status: 'error',
          isPending: false,
          isSuccess: false,
          isError: true,
          error: errMsg,
          errorAr: 'حدث خطأ غير متوقع',
        });
        options.onError?.(errMsg, variables);
        return { success: false, error: errMsg };
      }
    },
    [options]
  );

  return {
    ...state,
    mutate,
  };
}
