/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Standardized API Client
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { ServiceResult, RequestContext } from '../../types/sharedServices';
import { HttpMethod, RequestMetadata } from '../../types/dataFetchingFramework';
import { enterpriseMetricsTracker } from './metricsTracker';

export interface ApiClientRequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  module?: string;
  context?: RequestContext;
}

class EnterpriseApiClient {
  private inFlightRequests: Map<string, Promise<ServiceResult<any>>> = new Map();

  /**
   * Helper to generate UUIDs / Correlation IDs safely
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Constructs standardized security & tenant context headers
   */
  private buildHeaders(
    optionsHeaders?: Record<string, string>,
    context?: RequestContext,
    requestId?: string,
    correlationId?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId || this.generateId('req'),
      'X-Correlation-ID': correlationId || context?.correlationId || this.generateId('corr'),
    };

    if (context?.companyId) headers['X-Company-ID'] = context.companyId;
    if (context?.branchId) headers['X-Branch-ID'] = context.branchId;
    if (context?.locale) headers['Accept-Language'] = context.locale;
    if (context?.userId) headers['X-User-ID'] = context.userId;
    if (context?.authToken) headers['Authorization'] = `Bearer ${context.authToken}`;

    return { ...headers, ...(optionsHeaders || {}) };
  }

  /**
   * Sleep helper for exponential backoff retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Main HTTP request execution with retries, deduplication & metric logging
   */
  public async request<T = any>(
    endpoint: string,
    options: ApiClientRequestOptions = {}
  ): Promise<ServiceResult<T>> {
    const method = options.method || 'GET';
    const maxRetries = options.retryCount ?? (method === 'GET' ? 2 : 0);
    const retryDelay = options.retryDelayMs ?? 300;
    const bodyStr = options.body ? JSON.stringify(options.body) : '';
    const dedupeKey = `${method}:${endpoint}:${bodyStr}`;

    // 1. In-flight request deduplication for concurrent GET calls
    if (method === 'GET' && this.inFlightRequests.has(dedupeKey)) {
      const existing = await this.inFlightRequests.get(dedupeKey)!;
      return {
        ...existing,
        meta: { ...existing.meta, deduplicated: true },
      };
    }

    const requestId = this.generateId('req');
    const correlationId = options.context?.correlationId || this.generateId('corr');

    // 2. Execute with Retry Policy
    const executePromise = (async (): Promise<ServiceResult<T>> => {
      let attempts = 0;
      const startTime = performance.now();

      while (attempts <= maxRetries) {
        attempts++;
        try {
          const headers = this.buildHeaders(
            options.headers,
            options.context,
            requestId,
            correlationId
          );

          const controller = new AbortController();
          const timeoutId = options.timeoutMs
            ? setTimeout(() => controller.abort(), options.timeoutMs)
            : null;

          const response = await fetch(endpoint, {
            method,
            headers,
            body: options.body ? bodyStr : undefined,
            signal: controller.signal,
          });

          if (timeoutId) clearTimeout(timeoutId);

          const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

          if (response.ok) {
            const json = await response.json().catch(() => ({}));
            const data = (json.data !== undefined ? json.data : json) as T;

            const metadata: RequestMetadata = {
              requestId,
              correlationId,
              module: options.module || 'core',
              endpoint,
              method,
              startTime,
              durationMs,
              retries: attempts - 1,
              cacheStatus: 'MISS',
              responseSizeByte: JSON.stringify(data).length,
              companyId: options.context?.companyId,
              branchId: options.context?.branchId,
              userId: options.context?.userId,
            };

            enterpriseMetricsTracker.recordRequest(metadata);

            return {
              success: true,
              data,
              executionTimeMs: durationMs,
              meta: { requestId, correlationId },
            };
          }

          // If HTTP error status and retries remaining, sleep and retry
          if (response.status >= 500 && attempts <= maxRetries) {
            await this.sleep(retryDelay * Math.pow(2, attempts - 1));
            continue;
          }

          // Non-retryable error
          const errorJson = await response.json().catch(() => null);
          enterpriseMetricsTracker.recordFailure();

          return {
            success: false,
            error: errorJson?.error || `HTTP ${response.status}: ${response.statusText}`,
            errorAr: errorJson?.errorAr || `خطأ في الخادم (${response.status})`,
            code: errorJson?.code || `HTTP_${response.status}`,
            executionTimeMs: durationMs,
          };
        } catch (err: any) {
          if (attempts <= maxRetries) {
            await this.sleep(retryDelay * Math.pow(2, attempts - 1));
            continue;
          }

          enterpriseMetricsTracker.recordFailure();
          const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

          return {
            success: false,
            error: err.name === 'AbortError' ? 'Request timeout' : err.message || 'Network error',
            errorAr: err.name === 'AbortError' ? 'انتهت مهلة الطلب' : 'فشل في الاتصال بالشبكة',
            code: err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
            executionTimeMs: durationMs,
          };
        }
      }

      return {
        success: false,
        error: 'Max retries exceeded',
        errorAr: 'تجاوز الحد الأقصى للمحاولات',
        code: 'MAX_RETRIES_EXCEEDED',
      };
    })();

    if (method === 'GET') {
      this.inFlightRequests.set(dedupeKey, executePromise);
    }

    try {
      return await executePromise;
    } finally {
      this.inFlightRequests.delete(dedupeKey);
    }
  }
}

export const enterpriseApiClient = new EnterpriseApiClient();
