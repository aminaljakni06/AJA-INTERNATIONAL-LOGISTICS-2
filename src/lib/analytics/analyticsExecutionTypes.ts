/**
 * AJA INTERNATIONAL LOGISTICS — Server-Side Analytics Execution Types
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import {
  AnalyticsMetricId,
  AnalyticsMetricResult,
  AnalyticsGroupedResult,
  AnalyticsTimeSeriesPoint,
  AnalyticsExecutionMetadata,
} from '../../types/analyticsFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';

/**
 * Server-Authoritative Execution Context.
 * Security principles:
 * - Must be constructed from verified session / auth token on the server.
 * - Client cannot override tenantId, companyId, branchId, or permissions to widen scope.
 */
export interface ServerAnalyticsContext {
  userId: string;
  tenantId: string;
  companyId?: string;
  branchId?: string;
  permissions: string[];
  timezone: string; // Default 'Asia/Riyadh' or configured server/tenant timezone
  locale?: 'ar' | 'en';
}

/**
 * Options for single or batch metric execution.
 */
export interface AnalyticsExecutionOptions {
  queryState?: EnterpriseQueryState;
  dimension?: string;
  timeBucket?: 'DAY' | 'WEEK' | 'MONTH';
  comparisonPeriod?: 'PREVIOUS_PERIOD' | 'PREVIOUS_YEAR' | 'NONE';
}

/**
 * Typed response containing evaluated metrics and execution metadata.
 */
export interface AnalyticsExecutionResponse {
  metrics: AnalyticsMetricResult[];
  groupedResults?: AnalyticsGroupedResult[];
  timeSeriesResults?: Record<AnalyticsMetricId, AnalyticsTimeSeriesPoint[]>;
  metadata: AnalyticsExecutionMetadata;
}
