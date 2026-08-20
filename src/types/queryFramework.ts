/**
 * AJA INTERNATIONAL LOGISTICS — Query State Management Framework Types
 * Phase: Enterprise UI System
 * Module: Query State Management (STEP 05.15)
 * Version: 1.0
 */

export type SortDirection = 'asc' | 'desc';

export interface SortRule {
  field: string;
  direction: SortDirection;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startsWith'
  | 'in'
  | 'between'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export type FilterValue =
  | string
  | number
  | boolean
  | Array<string | number>
  | { min?: number; max?: number }
  | { start?: string; end?: string }
  | null
  | undefined;

export interface FilterCriterion {
  field: string;
  operator?: FilterOperator;
  value: FilterValue;
  labelEn?: string;
  labelAr?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface CursorParams {
  cursor?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore?: boolean;
}

export interface EnterpriseQueryState<TFilter extends Record<string, any> = Record<string, any>> {
  search: string;
  filters: TFilter;
  sort: SortRule | null;
  pagination: PaginationParams;
  cursor?: CursorParams;
}

export interface QueryDefaultsConfig<TFilter extends Record<string, any> = Record<string, any>> {
  defaultSearch?: string;
  defaultFilters?: TFilter;
  defaultSort?: SortRule | null;
  defaultPage?: number;
  defaultPageSize?: number;
  allowedPageSizes?: number[];
  allowedSortFields?: string[];
  allowedFilterKeys?: string[];
}

export interface ServerQueryValidationConfig {
  allowedSortFields?: string[];
  allowedFilterKeys?: string[];
  maxSearchLength?: number;
  minPageSize?: number;
  maxPageSize?: number;
  strictTypeChecking?: boolean;
}

export interface ServerQueryValidationResult<TFilter extends Record<string, any> = Record<string, any>> {
  isValid: boolean;
  sanitizedState: EnterpriseQueryState<TFilter>;
  validationErrors?: Array<{ field: string; messageEn: string; messageAr: string }>;
  tenantScopeEnforced?: boolean;
}

export interface QuerySerializerConfig {
  searchParamKey?: string;
  sortParamKey?: string;
  pageParamKey?: string;
  pageSizeParamKey?: string;
  cursorParamKey?: string;
  prefix?: string;
  arrayFormat?: 'comma' | 'repeat';
}

export type QueryTransitionType = 'none' | 'initial' | 'search' | 'filter' | 'sort' | 'page' | 'refetch';

export interface QueryExecutionState<TData = any> {
  data: TData[] | null;
  totalRecords: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isTransitioning: boolean;
  transitionType: QueryTransitionType;
  error: {
    messageEn: string;
    messageAr: string;
    code?: string;
    isRecoverable?: boolean;
  } | null;
  lastFetchedAt: string | null;
  queryKey: string;
}

export interface UseEnterpriseQueryStateOptions<TFilter extends Record<string, any> = Record<string, any>> {
  resourceName: string;
  defaults?: QueryDefaultsConfig<TFilter>;
  syncWithUrl?: boolean;
  historyMode?: 'push' | 'replace';
  debounceMs?: number;
  serializerConfig?: QuerySerializerConfig;
  validationConfig?: ServerQueryValidationConfig;
  onQueryChange?: (newState: EnterpriseQueryState<TFilter>) => void;
}

export interface SavedQueryView<TFilter extends Record<string, any> = Record<string, any>> {
  id: string;
  resourceName: string;
  nameEn: string;
  nameAr: string;
  queryState: EnterpriseQueryState<TFilter>;
  isDefault?: boolean;
  isShared?: boolean;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}
