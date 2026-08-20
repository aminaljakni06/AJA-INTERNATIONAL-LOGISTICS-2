/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Query Integration Utilities
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Enterprise Query State, Saved Analytics Views & Dynamic Date/Filter Integration (STEP 05.19.05)
 * Version: 1.0
 */

import { EnterpriseQueryState, QueryDefaultsConfig } from '../../types/queryFramework';
import { PublicAnalyticsMetricDTO } from './analyticsDtoMapper';

export interface DateRangeValue {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface DateRangeValidationResult {
  isValid: boolean;
  errorEn?: string;
  errorAr?: string;
}

/**
 * Validates date range boundary correctness (YYYY-MM-DD format & startDate <= endDate).
 */
export function validateDateRange(startDate?: string, endDate?: string): DateRangeValidationResult {
  if (!startDate && !endDate) {
    return { isValid: true };
  }

  if (!startDate || !endDate) {
    return {
      isValid: false,
      errorEn: 'Both start date and end date must be specified.',
      errorAr: 'يجب تحديد كل من تاريخ البدء وتاريخ الانتهاء.',
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return {
      isValid: false,
      errorEn: 'Date must be in YYYY-MM-DD format.',
      errorAr: 'يجب أن يكون التاريخ بصيغة YYYY-MM-DD.',
    };
  }

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();

  if (isNaN(startMs) || isNaN(endMs)) {
    return {
      isValid: false,
      errorEn: 'Invalid date values provided.',
      errorAr: 'قيم تاريخ غير صالحة.',
    };
  }

  if (startMs > endMs) {
    return {
      isValid: false,
      errorEn: 'Start date cannot be after end date.',
      errorAr: 'لا يمكن أن يكون تاريخ البدء بعد تاريخ الانتهاء.',
    };
  }

  return { isValid: true };
}

/**
 * Serializes DateRangeValue into EnterpriseQueryState filters object.
 */
export function serializeDateRangeToQueryFilters(
  range: DateRangeValue | null | undefined
): Record<string, any> {
  if (!range || (!range.startDate && !range.endDate)) {
    return {};
  }

  const validation = validateDateRange(range.startDate, range.endDate);
  if (!validation.isValid) {
    throw new Error(validation.errorEn || 'Invalid date range.');
  }

  return {
    dateRange: {
      startDate: range.startDate,
      endDate: range.endDate,
    },
  };
}

/**
 * Extracts normalized DateRangeValue from EnterpriseQueryState filters or dateRange object.
 */
export function extractDateRangeFromQueryState(
  queryState?: EnterpriseQueryState | null
): DateRangeValue | null {
  if (!queryState) return null;

  const filters = queryState.filters as Record<string, any> | undefined;
  if (!filters) return null;

  const rawRange = filters.dateRange || (queryState as any).dateRange;
  if (!rawRange) return null;

  const startDate = rawRange.startDate || rawRange.start || '';
  const endDate = rawRange.endDate || rawRange.end || '';

  if (!startDate || !endDate) return null;

  const validation = validateDateRange(startDate, endDate);
  if (!validation.isValid) return null;

  return { startDate, endDate };
}

/**
 * Filters requested metric IDs against authorized metric discovery catalog.
 * Guarantees permission-aware restoration for saved views and user selections.
 */
export function sanitizeSelectedMetricIds(
  requestedMetricIds: string[],
  availableMetrics: Array<{ id: string } | PublicAnalyticsMetricDTO>
): string[] {
  if (!requestedMetricIds || requestedMetricIds.length === 0) {
    return [];
  }

  if (!availableMetrics || availableMetrics.length === 0) {
    // If discovery hasn't completed or catalog is empty, return requested metrics as fallback
    return Array.from(new Set(requestedMetricIds));
  }

  const allowedSet = new Set(availableMetrics.map((m) => m.id));
  return Array.from(new Set(requestedMetricIds.filter((id) => allowedSet.has(id))));
}

/**
 * Splits metric IDs into chunks of maximum batchSize (server limit is 20).
 */
export function batchMetricIds(metricIds: string[], batchSize: number = 20): string[][] {
  if (!metricIds || metricIds.length === 0) return [];
  const uniqueIds = Array.from(new Set(metricIds));
  const batches: string[][] = [];

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    batches.push(uniqueIds.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Default Query State configuration for Analytics resource domains.
 */
export function getAnalyticsQueryDefaults(
  allowedFilterKeys: string[] = ['status', 'serviceType', 'origin', 'destination', 'customerSegment', 'currency', 'dateRange']
): QueryDefaultsConfig {
  return {
    defaultSearch: '',
    defaultFilters: {},
    defaultSort: { field: 'createdAt', direction: 'desc' },
    defaultPage: 1,
    defaultPageSize: 25,
    allowedPageSizes: [10, 25, 50, 100],
    allowedFilterKeys,
  };
}
