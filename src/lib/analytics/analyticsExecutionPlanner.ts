/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Execution Planner
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import {
  AnalyticsMetricDescriptor,
  AnalyticsError,
} from '../../types/analyticsFramework';
import { analyticsMetricRegistry } from './analyticsMetricRegistry';
import { ServerAnalyticsContext } from './analyticsExecutionTypes';

export interface ValidatedExecutionPlan {
  metric: AnalyticsMetricDescriptor;
  numeratorPlan?: ValidatedExecutionPlan;
  denominatorPlan?: ValidatedExecutionPlan;
  dimensionToGroup?: string;
}

/**
 * Validates authorization and constructs execution plan for a metric.
 */
export function planMetricExecution(
  metricId: string,
  context: ServerAnalyticsContext,
  requestedDimension?: string
): ValidatedExecutionPlan {
  // 1. Resolve descriptor from registry
  const metric = analyticsMetricRegistry.requireMetric(metricId);

  // 2. Validate metric status
  if (metric.status !== 'ACTIVE') {
    throw new AnalyticsError(
      'ANALYTICS_INVALID_METRIC',
      `Analytics metric "${metricId}" is currently ${metric.status} and cannot be executed`,
      { metricId, status: metric.status }
    );
  }

  // 3. Authorization check
  if (metric.requiredPermissions && metric.requiredPermissions.length > 0) {
    const userPerms = new Set(context.permissions || []);
    const hasWildcard = userPerms.has('*');
    const missingPerms = hasWildcard
      ? []
      : metric.requiredPermissions.filter((p) => !userPerms.has(p));

    if (missingPerms.length > 0) {
      throw new AnalyticsError(
        'ANALYTICS_PERMISSION_REQUIRED',
        `Access denied to metric "${metricId}". Missing permissions: ${missingPerms.join(', ')}`,
        { metricId, missingPermissions: missingPerms }
      );
    }
  }

  // 4. Dimension validation
  if (requestedDimension) {
    const validDimensions = metric.dimensions || [];
    const isApprovedDim = validDimensions.some((d) => d.id === requestedDimension || d.sourceField === requestedDimension);
    if (!isApprovedDim) {
      throw new AnalyticsError(
        'ANALYTICS_INVALID_DIMENSION',
        `Dimension "${requestedDimension}" is not approved for metric "${metricId}"`,
        { metricId, dimension: requestedDimension }
      );
    }
  }

  // 5. Handle derived metric dependencies
  if (metric.aggregationType === 'RATIO' || metric.aggregationType === 'PERCENTAGE') {
    if (!metric.numeratorMetricId || !metric.denominatorMetricId) {
      throw new AnalyticsError(
        'ANALYTICS_INVALID_METRIC',
        `Derived metric "${metricId}" must specify numeratorMetricId and denominatorMetricId`,
        { metricId }
      );
    }

    const numeratorPlan = planMetricExecution(metric.numeratorMetricId, context, requestedDimension);
    const denominatorPlan = planMetricExecution(metric.denominatorMetricId, context, requestedDimension);

    return {
      metric,
      numeratorPlan,
      denominatorPlan,
      dimensionToGroup: requestedDimension,
    };
  }

  return {
    metric,
    dimensionToGroup: requestedDimension,
  };
}
