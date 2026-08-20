/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Base API Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { ServiceResult, RequestContext, CacheOptions } from '../types/sharedServices';
import { enterpriseCache } from './enterpriseCache';

class BaseEnterpriseService {
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  /**
   * Generates standard request headers including company, branch, language & auth trace.
   */
  protected getHeaders(context?: RequestContext): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (context?.companyId) headers['X-Company-ID'] = context.companyId;
    if (context?.branchId) headers['X-Branch-ID'] = context.branchId;
    if (context?.locale) headers['Accept-Language'] = context.locale;
    if (context?.correlationId) headers['X-Correlation-ID'] = context.correlationId;
    if (context?.authToken) headers['Authorization'] = `Bearer ${context.authToken}`;

    return headers;
  }

  /**
   * Request wrapper with caching, request deduplication, and error handling.
   */
  public async fetchWithContext<T = any>(
    url: string,
    options?: RequestInit,
    context?: RequestContext,
    cacheOptions?: CacheOptions
  ): Promise<ServiceResult<T>> {
    const startTime = performance.now();
    const method = options?.method?.toUpperCase() || 'GET';
    const cacheKey = `${method}:${url}:${JSON.stringify(options?.body || '')}`;

    // 1. Check cache for GET requests if caching not skipped
    if (method === 'GET' && !cacheOptions?.skipCache) {
      const cachedData = enterpriseCache.get<T>(cacheKey);
      if (cachedData !== null) {
        return {
          success: true,
          data: cachedData,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
          meta: { fromCache: true },
        };
      }
    }

    // 2. In-flight request deduplication for duplicate GETs
    if (method === 'GET' && this.inFlightRequests.has(cacheKey)) {
      try {
        const deduplicatedResult = await this.inFlightRequests.get(cacheKey);
        return {
          ...deduplicatedResult,
          meta: { ...deduplicatedResult.meta, deduplicated: true },
        };
      } catch (err: any) {
        // Fall through to standard call if deduplication fails
      }
    }

    // 3. Execute HTTP Request
    const requestPromise = (async (): Promise<ServiceResult<T>> => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getHeaders(context),
            ...(options?.headers || {}),
          },
        });

        const endTime = performance.now();
        const duration = Math.round((endTime - startTime) * 100) / 100;

        if (!response.ok) {
          const errorJson = await response.json().catch(() => null);
          return {
            success: false,
            error: errorJson?.error || `HTTP ${response.status}: ${response.statusText}`,
            errorAr: errorJson?.errorAr || `خطأ في الاتصال بالخادم (${response.status})`,
            code: errorJson?.code || `HTTP_${response.status}`,
            executionTimeMs: duration,
          };
        }

        const json = await response.json();
        const data = (json.data !== undefined ? json.data : json) as T;

        // Store in cache if GET and caching enabled
        if (method === 'GET' && !cacheOptions?.skipCache) {
          enterpriseCache.set(cacheKey, data, cacheOptions);
        }

        return {
          success: true,
          data,
          executionTimeMs: duration,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Network request failed',
          errorAr: 'فشل في الاتصال بالشبكة',
          code: 'NETWORK_ERROR',
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        };
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    if (method === 'GET') {
      this.inFlightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }
}

export const baseEnterpriseService = new BaseEnterpriseService();
