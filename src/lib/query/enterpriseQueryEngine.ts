/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Query State Engine
 * Phase: Enterprise UI System
 * Module: Query State Management (STEP 05.15)
 * Version: 1.0
 */

import {
  EnterpriseQueryState,
  QueryDefaultsConfig,
  QuerySerializerConfig,
  ServerQueryValidationConfig,
  ServerQueryValidationResult,
  SortRule,
  PaginationParams,
} from '../../types/queryFramework';

export const DEFAULT_QUERY_SERIALIZER_CONFIG: QuerySerializerConfig = {
  searchParamKey: 'search',
  sortParamKey: 'sort',
  pageParamKey: 'page',
  pageSizeParamKey: 'pageSize',
  cursorParamKey: 'cursor',
  prefix: '',
  arrayFormat: 'comma',
};

export const DEFAULT_QUERY_VALIDATION_CONFIG: ServerQueryValidationConfig = {
  maxSearchLength: 100,
  minPageSize: 5,
  maxPageSize: 250,
  strictTypeChecking: true,
};

/**
 * Normalizes query state by removing nulls, empty strings, and applying bounded defaults.
 */
export function normalizeQueryState<TFilter extends Record<string, any> = Record<string, any>>(
  rawState: Partial<EnterpriseQueryState<TFilter>>,
  defaults?: QueryDefaultsConfig<TFilter>
): EnterpriseQueryState<TFilter> {
  const defaultPageSize = defaults?.defaultPageSize || 25;
  const defaultPage = defaults?.defaultPage || 1;
  const allowedPageSizes = defaults?.allowedPageSizes || [10, 25, 50, 100, 250];

  const search = (rawState.search ?? defaults?.defaultSearch ?? '').trim();

  // Normalize Filters: strip undefined, null, empty strings, empty arrays
  const rawFilters = (rawState.filters ?? defaults?.defaultFilters ?? {}) as TFilter;
  const cleanedFilters: Record<string, any> = {};

  Object.entries(rawFilters).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') return;
    if (Array.isArray(val) && val.length === 0) return;
    if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return;

    // Check filter allow-list if provided
    if (defaults?.allowedFilterKeys && defaults.allowedFilterKeys.length > 0) {
      if (!defaults.allowedFilterKeys.includes(key)) return;
    }

    cleanedFilters[key] = val;
  });

  // Normalize Sort
  let sort: SortRule | null = rawState.sort !== undefined ? rawState.sort : defaults?.defaultSort || null;
  if (sort && defaults?.allowedSortFields && defaults.allowedSortFields.length > 0) {
    if (!defaults.allowedSortFields.includes(sort.field)) {
      sort = defaults.defaultSort || null;
    }
  }

  // Normalize Pagination
  let pageSize = rawState.pagination?.pageSize || defaultPageSize;
  if (!allowedPageSizes.includes(pageSize)) {
    pageSize = defaultPageSize;
  }

  let page = rawState.pagination?.page || defaultPage;
  if (page < 1 || isNaN(page)) {
    page = 1;
  }

  const pagination: PaginationParams = {
    page,
    pageSize,
    totalRecords: rawState.pagination?.totalRecords ?? 0,
    totalPages: Math.max(1, Math.ceil((rawState.pagination?.totalRecords ?? 0) / pageSize)),
  };

  return {
    search,
    filters: cleanedFilters as TFilter,
    sort,
    pagination,
    cursor: rawState.cursor,
  };
}

/**
 * Serializes Enterprise Query State into URLSearchParams
 */
export function serializeToURLSearchParams<TFilter extends Record<string, any> = Record<string, any>>(
  state: EnterpriseQueryState<TFilter>,
  config?: QuerySerializerConfig
): URLSearchParams {
  const cfg = { ...DEFAULT_QUERY_SERIALIZER_CONFIG, ...config };
  const params = new URLSearchParams();

  // Search
  if (state.search) {
    params.set(cfg.searchParamKey!, state.search);
  }

  // Sort: format "field:asc" or "field:desc"
  if (state.sort) {
    params.set(cfg.sortParamKey!, `${state.sort.field}:${state.sort.direction}`);
  }

  // Pagination (omit page if 1 and default)
  if (state.pagination.page > 1) {
    params.set(cfg.pageParamKey!, String(state.pagination.page));
  }
  if (state.pagination.pageSize !== 25) {
    params.set(cfg.pageSizeParamKey!, String(state.pagination.pageSize));
  }

  // Cursor
  if (state.cursor?.cursor) {
    params.set(cfg.cursorParamKey!, state.cursor.cursor);
  }

  // Filters
  Object.entries(state.filters).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') return;

    const paramName = cfg.prefix ? `${cfg.prefix}_${key}` : key;

    if (Array.isArray(val)) {
      if (cfg.arrayFormat === 'repeat') {
        val.forEach((item) => params.append(paramName, String(item)));
      } else {
        params.set(paramName, val.join(','));
      }
    } else if (typeof val === 'object') {
      if ('start' in val || 'end' in val) {
        if (val.start) params.set(`${paramName}_start`, String(val.start));
        if (val.end) params.set(`${paramName}_end`, String(val.end));
      } else if ('min' in val || 'max' in val) {
        if (val.min !== undefined) params.set(`${paramName}_min`, String(val.min));
        if (val.max !== undefined) params.set(`${paramName}_max`, String(val.max));
      } else {
        params.set(paramName, JSON.stringify(val));
      }
    } else {
      params.set(paramName, String(val));
    }
  });

  return params;
}

/**
 * Deserializes URLSearchParams into typed EnterpriseQueryState
 */
export function deserializeFromURLSearchParams<TFilter extends Record<string, any> = Record<string, any>>(
  params: URLSearchParams,
  defaults?: QueryDefaultsConfig<TFilter>,
  serializerConfig?: QuerySerializerConfig
): EnterpriseQueryState<TFilter> {
  const cfg = { ...DEFAULT_QUERY_SERIALIZER_CONFIG, ...serializerConfig };

  // Parse Search
  const search = params.get(cfg.searchParamKey!) || defaults?.defaultSearch || '';

  // Parse Sort
  let sort: SortRule | null = defaults?.defaultSort || null;
  const rawSort = params.get(cfg.sortParamKey!);
  if (rawSort) {
    const [field, dir] = rawSort.split(':');
    if (field && (dir === 'asc' || dir === 'desc')) {
      if (!defaults?.allowedSortFields || defaults.allowedSortFields.includes(field)) {
        sort = { field, direction: dir as 'asc' | 'desc' };
      }
    }
  }

  // Parse Pagination
  const rawPage = params.get(cfg.pageParamKey!);
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : defaults?.defaultPage || 1;

  const rawPageSize = params.get(cfg.pageSizeParamKey!);
  const pageSize = rawPageSize ? parseInt(rawPageSize, 10) || 25 : defaults?.defaultPageSize || 25;

  // Parse Cursor
  const cursorVal = params.get(cfg.cursorParamKey!);
  const cursor = cursorVal ? { cursor: cursorVal } : undefined;

  // Reserved param keys
  const reservedKeys = new Set([
    cfg.searchParamKey!,
    cfg.sortParamKey!,
    cfg.pageParamKey!,
    cfg.pageSizeParamKey!,
    cfg.cursorParamKey!,
  ]);

  // Parse Filters
  const filters: Record<string, any> = { ...(defaults?.defaultFilters || {}) };

  params.forEach((value, key) => {
    if (reservedKeys.has(key)) return;

    // Handle range parameters e.g. status_start, date_end, amount_min
    if (key.endsWith('_start') || key.endsWith('_end')) {
      const baseKey = key.replace(/_(start|end)$/, '');
      const subKey = key.endsWith('_start') ? 'start' : 'end';
      filters[baseKey] = { ...(filters[baseKey] || {}), [subKey]: value };
      return;
    }
    if (key.endsWith('_min') || key.endsWith('_max')) {
      const baseKey = key.replace(/_(min|max)$/, '');
      const subKey = key.endsWith('_min') ? 'min' : 'max';
      const numVal = parseFloat(value);
      filters[baseKey] = { ...(filters[baseKey] || {}), [subKey]: isNaN(numVal) ? value : numVal };
      return;
    }

    // Handle array or simple values
    if (value.includes(',')) {
      filters[key] = value.split(',');
    } else if (value === 'true') {
      filters[key] = true;
    } else if (value === 'false') {
      filters[key] = false;
    } else {
      filters[key] = value;
    }
  });

  return normalizeQueryState({ search, filters: filters as TFilter, sort, pagination: { page, pageSize }, cursor }, defaults);
}

/**
 * Generates deterministic string key for query identity/caching
 */
export function generateQueryKey<TFilter extends Record<string, any> = Record<string, any>>(
  resourceName: string,
  state: EnterpriseQueryState<TFilter>
): string {
  const norm = normalizeQueryState(state);
  const filterPart = Object.entries(norm.filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join('&');

  const sortPart = norm.sort ? `${norm.sort.field}_${norm.sort.direction}` : 'nosort';
  const pagePart = `p${norm.pagination.page}_s${norm.pagination.pageSize}`;
  const searchPart = norm.search ? `q_${encodeURIComponent(norm.search)}` : 'noq';
  const cursorPart = norm.cursor?.cursor ? `cur_${norm.cursor.cursor}` : 'nocur';

  return `${resourceName}:${searchPart}:${filterPart}:${sortPart}:${pagePart}:${cursorPart}`;
}

/**
 * Deep compares two query states to prevent unnecessary rerenders
 */
export function isQueryStateEqual<TFilter extends Record<string, any> = Record<string, any>>(
  a: EnterpriseQueryState<TFilter>,
  b: EnterpriseQueryState<TFilter>
): boolean {
  if (a.search !== b.search) return false;
  if (a.pagination.page !== b.pagination.page) return false;
  if (a.pagination.pageSize !== b.pagination.pageSize) return false;

  if (a.sort?.field !== b.sort?.field || a.sort?.direction !== b.sort?.direction) return false;
  if (a.cursor?.cursor !== b.cursor?.cursor) return false;

  return JSON.stringify(a.filters) === JSON.stringify(b.filters);
}

/**
 * Server-side Query Validator & Security Bounds Checker
 */
export function validateServerQuery<TFilter extends Record<string, any> = Record<string, any>>(
  rawState: Partial<EnterpriseQueryState<TFilter>>,
  config?: ServerQueryValidationConfig,
  authoritativeTenantScope?: { companyId?: string; branchId?: string }
): ServerQueryValidationResult<TFilter> {
  const cfg = { ...DEFAULT_QUERY_VALIDATION_CONFIG, ...config };
  const errors: Array<{ field: string; messageEn: string; messageAr: string }> = [];

  // 1. Search Length Check
  let search = (rawState.search || '').trim();
  if (cfg.maxSearchLength && search.length > cfg.maxSearchLength) {
    search = search.substring(0, cfg.maxSearchLength);
    errors.push({
      field: 'search',
      messageEn: `Search term exceeded maximum length of ${cfg.maxSearchLength} characters and was truncated.`,
      messageAr: `تم اقتطاع نص البحث لتجاوزه الحد الأقصى (${cfg.maxSearchLength} حرفًا).`,
    });
  }

  // 2. Sort Field Allow-List Check
  let sort = rawState.sort || null;
  if (sort && cfg.allowedSortFields && cfg.allowedSortFields.length > 0) {
    if (!cfg.allowedSortFields.includes(sort.field)) {
      errors.push({
        field: 'sort',
        messageEn: `Sort field '${sort.field}' is not permitted on this resource.`,
        messageAr: `حقل الترتيب '${sort.field}' غير مسموح به لهذا المورد.`,
      });
      sort = null;
    }
  }

  // 3. Filter Keys Allow-List Check
  const sanitizedFilters: Record<string, any> = { ...(rawState.filters || {}) };
  if (cfg.allowedFilterKeys && cfg.allowedFilterKeys.length > 0) {
    Object.keys(sanitizedFilters).forEach((key) => {
      if (!cfg.allowedFilterKeys!.includes(key)) {
        delete sanitizedFilters[key];
        errors.push({
          field: `filter.${key}`,
          messageEn: `Filter criterion '${key}' is not permitted.`,
          messageAr: `معيار التصفية '${key}' غير مسموح به.`,
        });
      }
    });
  }

  // 4. Page Size Boundaries Check
  let pageSize = rawState.pagination?.pageSize || 25;
  if (cfg.minPageSize && pageSize < cfg.minPageSize) pageSize = cfg.minPageSize;
  if (cfg.maxPageSize && pageSize > cfg.maxPageSize) pageSize = cfg.maxPageSize;

  let page = rawState.pagination?.page || 1;
  if (page < 1) page = 1;

  // 5. Enforce Authoritative Tenant Scope (Client cannot bypass tenant)
  let tenantScopeEnforced = false;
  if (authoritativeTenantScope?.companyId) {
    sanitizedFilters['companyId'] = authoritativeTenantScope.companyId;
    tenantScopeEnforced = true;
  }
  if (authoritativeTenantScope?.branchId) {
    sanitizedFilters['branchId'] = authoritativeTenantScope.branchId;
    tenantScopeEnforced = true;
  }

  const sanitizedState: EnterpriseQueryState<TFilter> = {
    search,
    filters: sanitizedFilters as TFilter,
    sort,
    pagination: {
      page,
      pageSize,
      totalRecords: rawState.pagination?.totalRecords || 0,
      totalPages: Math.max(1, Math.ceil((rawState.pagination?.totalRecords || 0) / pageSize)),
    },
    cursor: rawState.cursor,
  };

  return {
    isValid: errors.length === 0,
    sanitizedState,
    validationErrors: errors.length > 0 ? errors : undefined,
    tenantScopeEnforced,
  };
}
