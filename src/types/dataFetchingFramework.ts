/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data Fetching & Cache Framework Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

export type CachePolicy =
  | 'no-cache'
  | 'cache-first'
  | 'network-first'
  | 'network-only'
  | 'cache-only'
  | 'stale-while-revalidate';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestMetadata {
  requestId: string;
  correlationId: string;
  module: string;
  endpoint: string;
  method: HttpMethod;
  startTime: number;
  durationMs?: number;
  retries: number;
  cacheStatus: 'HIT' | 'MISS' | 'STALE' | 'BYPASS';
  responseSizeByte?: number;
  companyId?: string;
  branchId?: string;
  userId?: string;
}

export interface EnterpriseQueryOptions<T = any> {
  queryKey: string;
  endpoint: string;
  method?: HttpMethod;
  body?: any;
  cachePolicy?: CachePolicy;
  ttlMs?: number; // Default 300,000ms (5 mins)
  tags?: string[];
  module?: string;
  retryCount?: number;
  retryDelayMs?: number;
  refetchIntervalMs?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export interface EnterpriseMutationOptions<TData = any, TVariables = any> {
  mutationKey: string;
  endpoint: string;
  method?: HttpMethod; // POST, PUT, PATCH, DELETE
  module?: string;
  optimisticData?: (variables: TVariables) => TData;
  invalidatesTags?: string[];
  supportsOfflineQueue?: boolean;
  retryCount?: number;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: string, variables: TVariables) => void;
}

export interface AdvancedCacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttlMs: number;
  tags: string[];
  module?: string;
  companyId?: string;
  isStale?: boolean;
}

export interface OfflineMutationQueueItem<TVariables = any> {
  id: string;
  mutationKey: string;
  endpoint: string;
  method: HttpMethod;
  variables: TVariables;
  queuedAt: number;
  attempts: number;
  module?: string;
}

export interface PerformanceMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  totalRetries: number;
  failedRequests: number;
  averageLatencyMs: number;
  slowRequestsCount: number; // >1000ms
}

export interface StandardPaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface StandardPaginationResult<T = any> {
  items: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface StandardSearchQueryParams {
  query: string;
  modules?: string[];
  filters?: Record<string, any>;
  limit?: number;
}

export interface StandardSearchQueryResult<T = any> {
  results: T[];
  totalMatches: number;
  query: string;
  executionTimeMs: number;
}
