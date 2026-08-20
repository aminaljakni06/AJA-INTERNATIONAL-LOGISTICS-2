/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Central Data Gateway
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { ServiceResult, RequestContext } from '../../types/sharedServices';
import {
  EnterpriseQueryOptions,
  EnterpriseMutationOptions,
  StandardSearchQueryParams,
  StandardSearchQueryResult,
} from '../../types/dataFetchingFramework';
import { enterpriseApiClient } from './enterpriseApiClient';
import { cachePolicyEngine } from './cachePolicyEngine';
import { offlineQueueEngine } from './offlineQueueEngine';
import { enterpriseMetricsTracker } from './metricsTracker';

class EnterpriseDataGateway {
  /**
   * Unified Query Execution with Cache Policies
   */
  public async executeQuery<T = any>(
    options: EnterpriseQueryOptions<T>,
    context?: RequestContext
  ): Promise<ServiceResult<T>> {
    const policy = options.cachePolicy || 'cache-first';
    const queryKey = options.queryKey;

    // 1. Evaluate Cache Policy first
    const { data: cachedData, isStale, hit } = cachePolicyEngine.get<T>(queryKey, policy);

    if (hit && cachedData !== null && !isStale) {
      enterpriseMetricsTracker.recordRequest({
        requestId: `cache_${Date.now()}`,
        correlationId: context?.correlationId || `corr_${Date.now()}`,
        module: options.module || 'core',
        endpoint: options.endpoint,
        method: options.method || 'GET',
        startTime: performance.now(),
        durationMs: 0.1,
        retries: 0,
        cacheStatus: 'HIT',
        companyId: context?.companyId,
      });

      return {
        success: true,
        data: cachedData,
        executionTimeMs: 0.1,
        meta: { fromCache: true, policy },
      };
    }

    // 2. Network Fetch if Cache Miss or Network-First / Stale-While-Revalidate
    const networkPromise = enterpriseApiClient.request<T>(options.endpoint, {
      method: options.method || 'GET',
      body: options.body,
      retryCount: options.retryCount,
      retryDelayMs: options.retryDelayMs,
      module: options.module,
      context,
    });

    // If policy is stale-while-revalidate and stale cache exists, return cache immediately and revalidate in background
    if (policy === 'stale-while-revalidate' && cachedData !== null) {
      networkPromise.then((networkRes) => {
        if (networkRes.success && networkRes.data !== undefined) {
          cachePolicyEngine.set(queryKey, networkRes.data, {
            ttlMs: options.ttlMs,
            tags: options.tags,
            module: options.module,
            companyId: context?.companyId,
          });
        }
      });

      return {
        success: true,
        data: cachedData,
        meta: { fromCache: true, isStale: true, backgroundRevalidating: true },
      };
    }

    const result = await networkPromise;

    // 3. Store fresh result in Cache if successful
    if (result.success && result.data !== undefined && policy !== 'no-cache') {
      cachePolicyEngine.set(queryKey, result.data, {
        ttlMs: options.ttlMs,
        tags: options.tags,
        module: options.module,
        companyId: context?.companyId,
      });
    }

    // Fallback to stale cache if network failed and policy is network-first
    if (!result.success && policy === 'network-first' && cachedData !== null) {
      return {
        success: true,
        data: cachedData,
        meta: { fallbackToCache: true, networkError: result.error },
      };
    }

    return result;
  }

  /**
   * Unified Mutation Execution with Optimistic Updates & Offline Queuing
   */
  public async executeMutation<TData = any, TVariables = any>(
    options: EnterpriseMutationOptions<TData, TVariables>,
    variables: TVariables,
    context?: RequestContext
  ): Promise<ServiceResult<TData>> {
    const method = options.method || 'POST';

    // Offline check & queuing
    if (!offlineQueueEngine.isOnline && options.supportsOfflineQueue) {
      offlineQueueEngine.enqueue(
        options.mutationKey,
        options.endpoint,
        method,
        variables,
        options.module
      );

      return {
        success: true,
        data: options.optimisticData ? options.optimisticData(variables) : undefined,
        meta: { queuedOffline: true },
      };
    }

    // Execute Network Mutation
    const result = await enterpriseApiClient.request<TData>(options.endpoint, {
      method,
      body: variables,
      retryCount: options.retryCount,
      module: options.module,
      context,
    });

    // Invalidate tagged caches on success
    if (result.success) {
      if (options.invalidatesTags) {
        options.invalidatesTags.forEach((tag) => cachePolicyEngine.invalidateTag(tag));
      }
      if (options.module) {
        cachePolicyEngine.invalidateModule(options.module);
      }
    }

    return result;
  }

  /**
   * Specialized Global Search Request Execution
   */
  public async executeSearch<T = any>(
    params: StandardSearchQueryParams,
    context?: RequestContext
  ): Promise<ServiceResult<StandardSearchQueryResult<T>>> {
    return this.executeQuery<StandardSearchQueryResult<T>>(
      {
        queryKey: `search_${JSON.stringify(params)}`,
        endpoint: `/api/search?q=${encodeURIComponent(params.query)}&modules=${(params.modules || []).join(',')}`,
        cachePolicy: 'cache-first',
        ttlMs: 30000, // 30 sec cache for search
      },
      context
    );
  }

  /**
   * Specialized Integration Request Execution (Carrier APIs, Customs, Payments)
   */
  public async executeIntegrationRequest<T = any>(
    provider: string,
    action: string,
    payload: any,
    context?: RequestContext
  ): Promise<ServiceResult<T>> {
    return enterpriseApiClient.request<T>(`/api/integrations/${provider}/${action}`, {
      method: 'POST',
      body: payload,
      module: 'integrations',
      retryCount: 1,
      context,
    });
  }
}

export const enterpriseDataGateway = new EnterpriseDataGateway();
