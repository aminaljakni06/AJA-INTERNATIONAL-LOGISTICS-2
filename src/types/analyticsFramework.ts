/**
 * AJA INTERNATIONAL LOGISTICS — Canonical Analytics Domain Framework
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Core Analytics Types, KPI Registry & Metrics Definition Framework (STEP 05.19.02)
 * Version: 1.0
 */

import { EnterpriseQueryState } from './queryFramework';

/**
 * Unique identifier for analytics metrics across the platform.
 */
export type AnalyticsMetricId = string;

/**
 * Standard resource identities across Query, Saved Views, Export, and Analytics.
 */
export type AnalyticsResourceId =
  | 'shipments'
  | 'customers'
  | 'quotes'
  | 'warehouse'
  | 'fleet'
  | 'finance'
  | 'control_tower';

/**
 * Functional domains for reporting and analytics categorization.
 */
export type AnalyticsDomain =
  | 'LOGISTICS'
  | 'CUSTOMERS'
  | 'SALES'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'FLEET';

/**
 * Controlled aggregation operations supported by the analytics engine.
 * Dynamic code execution (eval/Function) is strictly forbidden.
 */
export type AnalyticsAggregationType =
  | 'COUNT'
  | 'SUM'
  | 'AVG'
  | 'MIN'
  | 'MAX'
  | 'RATIO'
  | 'PERCENTAGE';

/**
 * Physical or semantic value type of the computed metric.
 */
export type AnalyticsValueType =
  | 'NUMBER'
  | 'CURRENCY'
  | 'PERCENTAGE'
  | 'DURATION'
  | 'COUNT';

/**
 * Currency handling semantics to prevent silent summing across mismatched currencies.
 */
export type AnalyticsCurrencyPolicy =
  | 'NONE'                       // Non-monetary metric
  | 'SINGLE_CURRENCY'            // Metric operates in a single defined currency
  | 'CURRENCY_GROUPED'           // Metric must be grouped by currency before aggregation
  | 'BASE_CURRENCY_NORMALIZED';  // Values converted using an explicitly verified FX rate source

/**
 * Formatting parameters for metric visualization and output rendering.
 */
export interface AnalyticsFormatDescriptor {
  valueType: AnalyticsValueType;
  unit?: string;
  unitAr?: string;
  currencyPolicy?: AnalyticsCurrencyPolicy;
  defaultCurrency?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Descriptor for dimensions that can be used for metric grouping or slicing.
 */
export interface AnalyticsDimensionDescriptor {
  id: string;
  labelEn: string;
  labelAr: string;
  sourceField: string;
  allowedValues?: string[];
  type?: 'STRING' | 'DATE' | 'ENUM' | 'BOOLEAN';
}

/**
 * Field security classification matching enterprise data governance standards.
 */
export type AnalyticsFieldSecurityLevel =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'RESTRICTED'
  | 'CONFIDENTIAL';

/**
 * Status of metric definition within the registry lifecycle.
 */
export type AnalyticsMetricStatus = 'ACTIVE' | 'DEPRECATED' | 'EXPERIMENTAL';

/**
 * Declarative metric contract descriptor.
 * Completely decoupled from UI rendering engines and chart libraries.
 */
export interface AnalyticsMetricDescriptor {
  id: AnalyticsMetricId;
  resource: AnalyticsResourceId;
  domain: AnalyticsDomain;
  labelKey: string;
  labelEn: string;
  labelAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  valueType: AnalyticsValueType;
  aggregationType: AnalyticsAggregationType;
  sourceField?: string;
  numeratorMetricId?: AnalyticsMetricId;
  denominatorMetricId?: AnalyticsMetricId;
  multiplier?: number;
  format: AnalyticsFormatDescriptor;
  timeField?: string;
  dimensions?: AnalyticsDimensionDescriptor[];
  filterConditions?: Record<string, any>;
  requiredPermissions?: string[];
  fieldSecurityClassification?: AnalyticsFieldSecurityLevel;
  drillDownCapable: boolean;
  exportable: boolean;
  status: AnalyticsMetricStatus;
}

/**
 * Result structure for a single evaluated metric.
 */
export interface AnalyticsMetricResult {
  metricId: AnalyticsMetricId;
  value: number | null;
  formattedValue?: string;
  valueType: AnalyticsValueType;
  currency?: string | null;
  unit?: string | null;
  comparisonValue?: number | null;
  changePercentage?: number | null;
  trend?: 'UP' | 'DOWN' | 'STABLE' | 'NEUTRAL';
  computedAt: string;
  completeness: 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';
  errorReason?: string;
}

/**
 * Result structure for grouped metric values across a given dimension.
 */
export interface AnalyticsGroupedItem {
  key: string;
  labelEn: string;
  labelAr: string;
  value: number | null;
  count?: number;
  currency?: string;
}

export interface AnalyticsGroupedResult {
  metricId: AnalyticsMetricId;
  dimension: string;
  groups: AnalyticsGroupedItem[];
  computedAt: string;
}

/**
 * Single point in a time-series result set.
 */
export interface AnalyticsTimeSeriesPoint {
  timestamp: string;
  label: string;
  value: number | null;
  comparisonValue?: number | null;
}

/**
 * Metadata captured during analytics computation.
 */
export interface AnalyticsExecutionMetadata {
  executionTimeMs: number;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  timezone: string;
  cached: boolean;
}

/**
 * Unified Analytics Query Request, composing EnterpriseQueryState.
 * Prevents duplicating query filtering/search/sorting infrastructure.
 */
export interface AnalyticsQueryRequest {
  metricIds: AnalyticsMetricId[];
  queryState?: EnterpriseQueryState;
  dimensions?: string[];
  comparisonPeriod?: 'PREVIOUS_PERIOD' | 'PREVIOUS_YEAR' | 'NONE';
  timeBucket?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

/**
 * Error Codes for Analytics Framework.
 */
export type AnalyticsErrorCode =
  | 'ANALYTICS_METRIC_NOT_FOUND'
  | 'ANALYTICS_INVALID_METRIC'
  | 'ANALYTICS_UNSUPPORTED_AGGREGATION'
  | 'ANALYTICS_INVALID_DIMENSION'
  | 'ANALYTICS_PERMISSION_REQUIRED'
  | 'ANALYTICS_CURRENCY_MISMATCH'
  | 'ANALYTICS_INVALID_FX_RATE'
  | 'ANALYTICS_DEPENDENCY_CYCLE'
  | 'ANALYTICS_ZERO_DENOMINATOR'
  | 'ANALYTICS_QUERY_TOO_EXPENSIVE'
  | 'ANALYTICS_UNSUPPORTED_FILTER'
  | 'ANALYTICS_DATA_INCOMPLETE'
  | 'ANALYTICS_REPOSITORY_ERROR';

export class AnalyticsError extends Error {
  readonly code: AnalyticsErrorCode;
  readonly details?: Record<string, any>;

  constructor(code: AnalyticsErrorCode, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'AnalyticsError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Zero-denominator safe division utility.
 * Always returns null instead of NaN or Infinity.
 */
export function safeAnalyticsDivide(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  multiplier = 1
): number | null {
  if (
    numerator === null ||
    numerator === undefined ||
    denominator === null ||
    denominator === undefined ||
    isNaN(numerator) ||
    isNaN(denominator) ||
    denominator === 0
  ) {
    return null;
  }

  const result = (numerator / denominator) * multiplier;
  if (!isFinite(result) || isNaN(result)) {
    return null;
  }

  return result;
}
