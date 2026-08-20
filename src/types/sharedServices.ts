/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Shared Hooks & Services Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error' | 'refetching';

export interface RequestContext {
  companyId?: string;
  branchId?: string;
  locale?: 'en' | 'ar';
  userId?: string;
  correlationId?: string;
  authToken?: string;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorAr?: string;
  code?: string;
  executionTimeMs?: number;
  meta?: Record<string, any>;
}

export interface QueryState<T = any> {
  data: T | null;
  status: LoadingStatus;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  errorAr: string | null;
  lastUpdated: number | null;
}

export interface MutationState<T = any> {
  data: T | null;
  status: LoadingStatus;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  errorAr: string | null;
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttlMs: number;
  tags?: string[];
}

export interface CacheOptions {
  ttlMs?: number; // Default 5 minutes (300,000 ms)
  tags?: string[];
  skipCache?: boolean;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface TableSortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableFilterItem {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
}

export interface TableState<T = any> {
  data: T[];
  pagination: PaginationState;
  sort: TableSortOption | null;
  filters: TableFilterItem[];
  searchQuery: string;
  selectedIds: string[];
}

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  category?: 'shipment' | 'finance' | 'system' | 'compliance';
  actionUrl?: string;
}

export interface SearchResultGroup<T = any> {
  categoryEn: string;
  categoryAr: string;
  items: T[];
  totalCount: number;
}

export interface AIServiceOptions {
  maxTokens?: number;
  temperature?: number;
  isAr?: boolean;
  systemPrompt?: string;
}

export interface AIServiceResult<T = any> {
  rawText: string;
  structuredData?: T;
  tokensUsed?: number;
  provider: string;
  model: string;
}

export interface FileObjectRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  url?: string;
  uploadedAt: string;
  checksum?: string;
}
