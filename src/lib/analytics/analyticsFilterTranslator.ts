/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Filter Translator
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import { AnalyticsMetricDescriptor, AnalyticsError } from '../../types/analyticsFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';

export interface TranslatedQueryFilters {
  tenantId: string;
  companyId?: string;
  branchId?: string;
  equalityFilters: Record<string, string | number | boolean>;
  inFilters: Record<string, (string | number)[]>;
  dateRangeFilter?: {
    field: string;
    startDate?: string;
    endDate?: string;
  };
  searchQuery?: string;
}

/**
 * Translates and strictly validates EnterpriseQueryState filters for a given metric.
 */
export function translateAnalyticsFilters(
  metric: AnalyticsMetricDescriptor,
  queryState: EnterpriseQueryState | undefined,
  contextTenantId: string,
  contextCompanyId?: string,
  contextBranchId?: string
): TranslatedQueryFilters {
  const result: TranslatedQueryFilters = {
    tenantId: contextTenantId,
    companyId: contextCompanyId,
    branchId: contextBranchId,
    equalityFilters: {},
    inFilters: {},
  };

  // 1. Apply static metric filter conditions (e.g. status: 'DELIVERED')
  if (metric.filterConditions) {
    for (const [field, val] of Object.entries(metric.filterConditions)) {
      if (Array.isArray(val)) {
        result.inFilters[field] = val;
      } else {
        result.equalityFilters[field] = val;
      }
    }
  }

  if (!queryState) {
    return result;
  }

  // 2. Validate and map user-supplied filters from queryState.filters
  if (queryState.filters && typeof queryState.filters === 'object') {
    const allowedDimensionFields = new Set<string>();
    if (metric.dimensions) {
      for (const dim of metric.dimensions) {
        allowedDimensionFields.add(dim.sourceField);
        allowedDimensionFields.add(dim.id);
      }
    }

    // Common allowed standard entity fields
    const standardFields = new Set(['id', 'customerId', 'status', 'currentStatus', 'shipmentType', 'serviceType', 'origin', 'destination', 'customerSegment', 'currency', 'dateRange', 'startDate', 'endDate']);

    for (const [rawKey, rawValue] of Object.entries(queryState.filters)) {
      if (rawValue === undefined || rawValue === null || rawValue === '') {
        continue;
      }

      if (rawKey === 'dateRange') {
        continue;
      }

      // Check field security/allowlist
      if (!allowedDimensionFields.has(rawKey) && !standardFields.has(rawKey)) {
        throw new AnalyticsError(
          'ANALYTICS_UNSUPPORTED_FILTER',
          `Filter field "${rawKey}" is not an authorized dimension or field for metric "${metric.id}"`,
          { metricId: metric.id, field: rawKey }
        );
      }

      if (Array.isArray(rawValue)) {
        if (rawValue.length > 0) {
          result.inFilters[rawKey] = rawValue;
        }
      } else {
        result.equalityFilters[rawKey] = rawValue as string | number | boolean;
      }
    }
  }

  // 3. Map Date Range to Metric's defined timeField
  const dateRange = (queryState.filters as any)?.dateRange || (queryState as any)?.dateRange;
  if (dateRange) {
    const timeField = metric.timeField || 'createdAt';
    result.dateRangeFilter = {
      field: timeField,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }

  // 4. Map Search Query
  if (queryState.search && queryState.search.trim().length > 0) {
    result.searchQuery = queryState.search.trim();
  }

  return result;
}
