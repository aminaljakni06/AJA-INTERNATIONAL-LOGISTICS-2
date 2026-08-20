/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Analytics Request Validation & Tenant Security Defense
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: REST API & Tenant-Aware Middleware Integration (STEP 05.19.04)
 */

import { AnalyticsError } from '../../types/analyticsFramework';
import { analyticsMetricRegistry } from '../../lib/analytics/analyticsMetricRegistry';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';

/**
 * Strictly forbidden payload keys to prevent arbitrary field/SQL/expression injection attacks.
 */
const FORBIDDEN_RAW_KEYS = new Set([
  'sourceField',
  'rawField',
  'collection',
  'aggregation',
  'sql',
  'expression',
  'formula',
  'script',
  'eval',
  'firestorePath',
]);

/**
 * Validates that request payloads do not contain forbidden raw fields or aggregation definitions.
 */
export function validateNoRawFields(payload: any): void {
  if (!payload || typeof payload !== 'object') return;

  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_RAW_KEYS.has(key)) {
      throw new AnalyticsError(
        'ANALYTICS_INVALID_METRIC',
        `Arbitrary raw field parameter "${key}" is strictly forbidden. All metric definitions must be registered server-side.`
      );
    }
  }
}

/**
 * Enforces Tenant Override Defense.
 * Validates that client body/query params cannot override server-authoritative tenant context.
 */
export function validateTenantSecurityOverride(
  reqBody: any,
  reqQuery: any,
  serverContext: ServerAnalyticsContext
): void {
  const clientTenantId = reqBody?.tenantId || reqQuery?.tenantId;
  const clientCompanyId = reqBody?.companyId || reqQuery?.companyId;

  // Check top-level client tenant overrides
  if (clientTenantId && clientTenantId !== serverContext.tenantId) {
    throw new AnalyticsError(
      'ANALYTICS_PERMISSION_REQUIRED',
      `Tenant override attempt detected. Authenticated tenant "${serverContext.tenantId}" cannot access tenant "${clientTenantId}".`,
      { authenticatedTenant: serverContext.tenantId, requestedTenant: clientTenantId }
    );
  }

  if (clientCompanyId && serverContext.companyId && clientCompanyId !== serverContext.companyId) {
    throw new AnalyticsError(
      'ANALYTICS_PERMISSION_REQUIRED',
      `Company scope override attempt detected. Authenticated company "${serverContext.companyId}" cannot access company "${clientCompanyId}".`,
      { authenticatedCompany: serverContext.companyId, requestedCompany: clientCompanyId }
    );
  }

  // Check filter-embedded tenant overrides
  const filterTenantId = reqBody?.queryState?.filters?.tenantId || reqBody?.filters?.tenantId;
  if (filterTenantId && filterTenantId !== serverContext.tenantId) {
    throw new AnalyticsError(
      'ANALYTICS_PERMISSION_REQUIRED',
      `Tenant override in filters detected. Authenticated tenant "${serverContext.tenantId}" cannot access tenant "${filterTenantId}".`
    );
  }
}

/**
 * Validates scalar metric query requests.
 */
export function validateMetricQueryPayload(body: any): {
  metricIds: string[];
  queryState?: any;
} {
  validateNoRawFields(body);

  const { metricIds, queryState } = body || {};

  if (!metricIds || !Array.isArray(metricIds) || metricIds.length === 0) {
    throw new AnalyticsError(
      'ANALYTICS_INVALID_METRIC',
      'Parameter "metricIds" must be a non-empty array of metric identifiers.'
    );
  }

  if (metricIds.length > 20) {
    throw new AnalyticsError(
      'ANALYTICS_QUERY_TOO_EXPENSIVE',
      `Batch query exceeds maximum allowed limit of 20 metrics per request (received ${metricIds.length}).`
    );
  }

  for (const id of metricIds) {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new AnalyticsError('ANALYTICS_INVALID_METRIC', 'Metric IDs must be valid non-empty strings.');
    }
    // Verify registry presence
    analyticsMetricRegistry.requireMetric(id);
  }

  return { metricIds, queryState };
}

/**
 * Validates grouped metric analytics requests.
 */
export function validateGroupedQueryPayload(body: any): {
  metricId: string;
  dimension: string;
  queryState?: any;
} {
  validateNoRawFields(body);

  const { metricId, dimension, queryState } = body || {};

  if (!metricId || typeof metricId !== 'string') {
    throw new AnalyticsError('ANALYTICS_INVALID_METRIC', 'Parameter "metricId" is required for grouped analytics.');
  }

  if (!dimension || typeof dimension !== 'string') {
    throw new AnalyticsError('ANALYTICS_INVALID_DIMENSION', 'Parameter "dimension" is required for grouped analytics.');
  }

  // Verify metric and approved dimension
  const metric = analyticsMetricRegistry.requireMetric(metricId);
  const validDimensions = metric.dimensions || [];
  const isApproved = validDimensions.some((d) => d.id === dimension || d.sourceField === dimension);

  if (!isApproved) {
    throw new AnalyticsError(
      'ANALYTICS_INVALID_DIMENSION',
      `Dimension "${dimension}" is not approved for metric "${metricId}".`,
      { metricId, dimension }
    );
  }

  return { metricId, dimension, queryState };
}

/**
 * Validates time-series analytics requests.
 */
export function validateTimeSeriesPayload(body: any): {
  metricId: string;
  interval: 'DAY' | 'WEEK' | 'MONTH';
  dateRange?: { startDate: string; endDate: string };
  queryState?: any;
} {
  validateNoRawFields(body);

  const { metricId, interval, timeBucket, dateRange, queryState } = body || {};

  if (!metricId || typeof metricId !== 'string') {
    throw new AnalyticsError('ANALYTICS_INVALID_METRIC', 'Parameter "metricId" is required for time-series analytics.');
  }

  analyticsMetricRegistry.requireMetric(metricId);

  const activeInterval = interval || timeBucket;
  const ALLOWED_INTERVALS = new Set(['DAY', 'WEEK', 'MONTH']);

  if (!activeInterval || !ALLOWED_INTERVALS.has(activeInterval)) {
    throw new AnalyticsError(
      'ANALYTICS_INVALID_METRIC',
      `Interval "${activeInterval}" is invalid. Allowed time-series intervals are: DAY, WEEK, MONTH.`
    );
  }

  if (dateRange) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new AnalyticsError(
        'ANALYTICS_INVALID_METRIC',
        'Parameter "dateRange" must contain both "startDate" and "endDate".'
      );
    }
    const start = new Date(dateRange.startDate).getTime();
    const end = new Date(dateRange.endDate).getTime();

    if (isNaN(start) || isNaN(end)) {
      throw new AnalyticsError('ANALYTICS_INVALID_METRIC', 'Invalid date format in "dateRange".');
    }

    if (start > end) {
      throw new AnalyticsError('ANALYTICS_INVALID_METRIC', '"startDate" cannot be after "endDate".');
    }
  }

  return {
    metricId,
    interval: activeInterval as 'DAY' | 'WEEK' | 'MONTH',
    dateRange,
    queryState,
  };
}
