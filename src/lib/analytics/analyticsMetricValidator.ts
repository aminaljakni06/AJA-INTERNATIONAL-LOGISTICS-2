/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Metric Validator
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Core Analytics Types & KPI Registry (STEP 05.19.02)
 */

import {
  AnalyticsMetricDescriptor,
  AnalyticsResourceId,
  AnalyticsDomain,
  AnalyticsAggregationType,
  AnalyticsValueType,
  AnalyticsError,
} from '../../types/analyticsFramework';

const VALID_RESOURCES: ReadonlySet<AnalyticsResourceId> = new Set([
  'shipments',
  'customers',
  'quotes',
  'warehouse',
  'fleet',
  'finance',
  'control_tower',
]);

const VALID_DOMAINS: ReadonlySet<AnalyticsDomain> = new Set([
  'LOGISTICS',
  'CUSTOMERS',
  'SALES',
  'FINANCE',
  'OPERATIONS',
  'FLEET',
]);

const VALID_AGGREGATIONS: ReadonlySet<AnalyticsAggregationType> = new Set([
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'RATIO',
  'PERCENTAGE',
]);

const VALID_VALUE_TYPES: ReadonlySet<AnalyticsValueType> = new Set([
  'NUMBER',
  'CURRENCY',
  'PERCENTAGE',
  'DURATION',
  'COUNT',
]);

export interface MetricValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a single metric descriptor.
 */
export function validateMetricDescriptor(
  metric: AnalyticsMetricDescriptor,
  metricMap?: Map<string, AnalyticsMetricDescriptor>
): MetricValidationResult {
  const errors: string[] = [];

  if (!metric.id || typeof metric.id !== 'string' || metric.id.trim() === '') {
    errors.push('Metric ID must be a non-empty string');
  }

  if (!VALID_RESOURCES.has(metric.resource)) {
    errors.push(`Invalid resource identifier: "${metric.resource}"`);
  }

  if (!VALID_DOMAINS.has(metric.domain)) {
    errors.push(`Invalid domain: "${metric.domain}"`);
  }

  if (!VALID_AGGREGATIONS.has(metric.aggregationType)) {
    errors.push(`Invalid aggregation type: "${metric.aggregationType}"`);
  }

  if (!VALID_VALUE_TYPES.has(metric.valueType)) {
    errors.push(`Invalid value type: "${metric.valueType}"`);
  }

  // Label & Translation validation
  if (!metric.labelEn || metric.labelEn.trim() === '') {
    errors.push(`Metric "${metric.id}": labelEn is required`);
  }
  if (!metric.labelAr || metric.labelAr.trim() === '') {
    errors.push(`Metric "${metric.id}": labelAr is required`);
  }

  // Aggregation specific rules
  if (metric.aggregationType === 'RATIO' || metric.aggregationType === 'PERCENTAGE') {
    if (!metric.numeratorMetricId) {
      errors.push(`Metric "${metric.id}": RATIO/PERCENTAGE metric requires numeratorMetricId`);
    }
    if (!metric.denominatorMetricId) {
      errors.push(`Metric "${metric.id}": RATIO/PERCENTAGE metric requires denominatorMetricId`);
    }

    if (metric.numeratorMetricId === metric.id) {
      errors.push(`Metric "${metric.id}": self-referencing numerator is forbidden`);
    }
    if (metric.denominatorMetricId === metric.id) {
      errors.push(`Metric "${metric.id}": self-referencing denominator is forbidden`);
    }

    if (metricMap) {
      if (metric.numeratorMetricId && !metricMap.has(metric.numeratorMetricId)) {
        errors.push(`Metric "${metric.id}": numerator metric "${metric.numeratorMetricId}" not found in registry`);
      }
      if (metric.denominatorMetricId && !metricMap.has(metric.denominatorMetricId)) {
        errors.push(`Metric "${metric.id}": denominator metric "${metric.denominatorMetricId}" not found in registry`);
      }
    }
  } else if (
    metric.aggregationType === 'SUM' ||
    metric.aggregationType === 'AVG' ||
    metric.aggregationType === 'MIN' ||
    metric.aggregationType === 'MAX'
  ) {
    if (!metric.sourceField || metric.sourceField.trim() === '') {
      errors.push(`Metric "${metric.id}": ${metric.aggregationType} requires a valid sourceField`);
    }
  }

  // Currency semantics validation
  if (metric.valueType === 'CURRENCY') {
    if (!metric.format || !metric.format.currencyPolicy) {
      errors.push(`Metric "${metric.id}": CURRENCY valueType requires explicit format.currencyPolicy`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the entire metric registry collection, including duplicate checking,
 * reference resolution, and dependency cycle detection.
 */
export function validateMetricRegistry(metrics: readonly AnalyticsMetricDescriptor[]): void {
  const metricMap = new Map<string, AnalyticsMetricDescriptor>();
  const duplicates = new Set<string>();
  const allErrors: string[] = [];

  for (const m of metrics) {
    if (metricMap.has(m.id)) {
      duplicates.add(m.id);
    }
    metricMap.set(m.id, m);
  }

  if (duplicates.size > 0) {
    allErrors.push(`Duplicate metric IDs found: ${Array.from(duplicates).join(', ')}`);
  }

  for (const m of metrics) {
    const singleValidation = validateMetricDescriptor(m, metricMap);
    if (!singleValidation.valid) {
      allErrors.push(...singleValidation.errors);
    }
  }

  // Cycle detection for derived metrics
  for (const m of metrics) {
    if (m.aggregationType === 'RATIO' || m.aggregationType === 'PERCENTAGE') {
      const visited = new Set<string>();
      const path: string[] = [m.id];
      visited.add(m.id);

      const checkCycle = (currId: string): boolean => {
        const curr = metricMap.get(currId);
        if (!curr) return false;

        const deps: string[] = [];
        if (curr.numeratorMetricId) deps.push(curr.numeratorMetricId);
        if (curr.denominatorMetricId) deps.push(curr.denominatorMetricId);

        for (const dep of deps) {
          if (visited.has(dep)) {
            path.push(dep);
            allErrors.push(`Dependency cycle detected: ${path.join(' -> ')}`);
            return true;
          }
          visited.add(dep);
          path.push(dep);
          if (checkCycle(dep)) return true;
          path.pop();
          visited.delete(dep);
        }
        return false;
      };

      checkCycle(m.id);
    }
  }

  if (allErrors.length > 0) {
    throw new AnalyticsError(
      'ANALYTICS_INVALID_METRIC',
      `Analytics metric registry validation failed with ${allErrors.length} error(s):\n - ${allErrors.join('\n - ')}`,
      { errors: allErrors }
    );
  }
}
