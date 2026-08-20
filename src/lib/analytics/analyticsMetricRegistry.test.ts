/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Framework & Registry Unit Tests
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Core Analytics Types & KPI Registry (STEP 05.19.02)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import {
  analyticsMetricRegistry,
  AnalyticsMetricRegistry,
  CANONICAL_DOMAINS_INITIAL_METRICS,
} from './analyticsMetricRegistry';
import { validateMetricDescriptor, validateMetricRegistry } from './analyticsMetricValidator';
import {
  safeAnalyticsDivide,
  AnalyticsMetricDescriptor,
  AnalyticsError,
} from '../../types/analyticsFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';

test('1. Registry Initialization & Metric Resolution', () => {
  const metric = analyticsMetricRegistry.getMetric('shp_total_shipments');
  assert.ok(metric);
  assert.strictEqual(metric.id, 'shp_total_shipments');
  assert.strictEqual(metric.resource, 'shipments');
  assert.strictEqual(metric.domain, 'LOGISTICS');

  const required = analyticsMetricRegistry.requireMetric('cust_total_customers');
  assert.ok(required);
  assert.strictEqual(required.id, 'cust_total_customers');
});

test('2. Unknown Metrics Rejection', () => {
  const missing = analyticsMetricRegistry.getMetric('unknown_metric_id');
  assert.strictEqual(missing, undefined);

  assert.throws(
    () => {
      analyticsMetricRegistry.requireMetric('non_existent_metric');
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_METRIC_NOT_FOUND';
    }
  );
});

test('3. Resource & Domain Filtering', () => {
  const shipmentMetrics = analyticsMetricRegistry.listMetricsByResource('shipments');
  assert.ok(shipmentMetrics.length >= 5);
  assert.ok(shipmentMetrics.every((m) => m.resource === 'shipments'));

  const customerMetrics = analyticsMetricRegistry.listMetricsByResource('customers');
  assert.ok(customerMetrics.length >= 3);
  assert.ok(customerMetrics.every((m) => m.resource === 'customers'));

  const salesMetrics = analyticsMetricRegistry.listMetricsByDomain('SALES');
  assert.ok(salesMetrics.length >= 4);
  assert.ok(salesMetrics.every((m) => m.domain === 'SALES'));
});

test('4. Metric ID Uniqueness & Reference Resolution', () => {
  const allMetrics = analyticsMetricRegistry.listMetrics();
  const ids = allMetrics.map((m) => m.id);
  const uniqueIds = new Set(ids);
  assert.strictEqual(ids.length, uniqueIds.size);

  const conversionRate = analyticsMetricRegistry.requireMetric('quote_conversion_rate');
  assert.strictEqual(conversionRate.aggregationType, 'RATIO');
  assert.strictEqual(conversionRate.numeratorMetricId, 'quote_accepted_quotes');
  assert.strictEqual(conversionRate.denominatorMetricId, 'quote_total_quotes');

  // Verify referenced metrics exist
  assert.ok(analyticsMetricRegistry.getMetric(conversionRate.numeratorMetricId!));
  assert.ok(analyticsMetricRegistry.getMetric(conversionRate.denominatorMetricId!));
});

test('5. Self-Reference Validation Failure', () => {
  const selfRefMetric: AnalyticsMetricDescriptor = {
    id: 'invalid_self_ref',
    resource: 'shipments',
    domain: 'LOGISTICS',
    labelKey: 'test.self_ref',
    labelEn: 'Self Ref',
    labelAr: 'مرجع ذاتي',
    valueType: 'PERCENTAGE',
    aggregationType: 'RATIO',
    numeratorMetricId: 'invalid_self_ref',
    denominatorMetricId: 'shp_total_shipments',
    format: { valueType: 'PERCENTAGE' },
    drillDownCapable: false,
    exportable: false,
    status: 'ACTIVE',
  };

  const validation = validateMetricDescriptor(selfRefMetric);
  assert.strictEqual(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.includes('self-referencing')));
});

test('6. Dependency Cycle Detection', () => {
  const metricA: AnalyticsMetricDescriptor = {
    id: 'cycle_metric_a',
    resource: 'shipments',
    domain: 'LOGISTICS',
    labelKey: 'test.cycle_a',
    labelEn: 'Cycle A',
    labelAr: 'دائرة أ',
    valueType: 'PERCENTAGE',
    aggregationType: 'RATIO',
    numeratorMetricId: 'cycle_metric_b',
    denominatorMetricId: 'shp_total_shipments',
    format: { valueType: 'PERCENTAGE' },
    drillDownCapable: false,
    exportable: false,
    status: 'ACTIVE',
  };

  const metricB: AnalyticsMetricDescriptor = {
    id: 'cycle_metric_b',
    resource: 'shipments',
    domain: 'LOGISTICS',
    labelKey: 'test.cycle_b',
    labelEn: 'Cycle B',
    labelAr: 'دائرة ب',
    valueType: 'PERCENTAGE',
    aggregationType: 'RATIO',
    numeratorMetricId: 'cycle_metric_a',
    denominatorMetricId: 'shp_total_shipments',
    format: { valueType: 'PERCENTAGE' },
    drillDownCapable: false,
    exportable: false,
    status: 'ACTIVE',
  };

  assert.throws(
    () => {
      validateMetricRegistry([metricA, metricB, ...CANONICAL_DOMAINS_INITIAL_METRICS]);
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.message.includes('Dependency cycle detected');
    }
  );
});

test('7. Zero-Denominator Semantics', () => {
  assert.strictEqual(safeAnalyticsDivide(100, 0), null);
  assert.strictEqual(safeAnalyticsDivide(null, 50), null);
  assert.strictEqual(safeAnalyticsDivide(50, null), null);
  assert.strictEqual(safeAnalyticsDivide(0, 100), 0);
  assert.strictEqual(safeAnalyticsDivide(25, 100, 100), 25);
});

test('8. Currency Semantics Preservation', () => {
  const quoteValueMetric = analyticsMetricRegistry.requireMetric('quote_offered_value');
  assert.strictEqual(quoteValueMetric.valueType, 'CURRENCY');
  assert.strictEqual(quoteValueMetric.format.currencyPolicy, 'CURRENCY_GROUPED');
  assert.strictEqual(quoteValueMetric.format.defaultCurrency, 'SAR');
});

test('9. Permissions & Dimensions Metadata', () => {
  const permissions = analyticsMetricRegistry.resolvePermissions('shp_total_shipments');
  assert.ok(permissions.includes('analytics:view'));
  assert.ok(permissions.includes('shipping:shipment:view'));

  const dimensions = analyticsMetricRegistry.getMetricDimensions('shp_total_shipments');
  assert.ok(dimensions.length > 0);
  assert.ok(dimensions.some((d) => d.id === 'status'));
});

test('10. Registry Immutability', () => {
  assert.throws(() => {
    (analyticsMetricRegistry as any).newProperty = 'test';
  });

  const metric = analyticsMetricRegistry.getMetric('shp_total_shipments')!;
  assert.throws(() => {
    (metric as any).labelEn = 'Mutated';
  });
});

test('11. EnterpriseQueryState Compatibility', () => {
  const sampleQueryState: EnterpriseQueryState = {
    search: 'Riyadh',
    filters: { status: 'DELIVERED' },
    sort: { field: 'createdAt', direction: 'desc' },
    pagination: { page: 1, pageSize: 25 },
  };

  assert.ok(sampleQueryState.search === 'Riyadh');
  assert.ok(sampleQueryState.pagination.pageSize === 25);
});
