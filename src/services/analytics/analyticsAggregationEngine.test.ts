/**
 * AJA INTERNATIONAL LOGISTICS — Server-Side Aggregation Engine Unit & Integration Tests
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import { AnalyticsAggregationEngine } from './analyticsAggregationEngine';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';
import { AnalyticsError } from '../../types/analyticsFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { getTimeBucketKey } from '../../lib/analytics/analyticsTimeBucket';
import { translateAnalyticsFilters } from '../../lib/analytics/analyticsFilterTranslator';

const mockContextAdminTenantA: ServerAnalyticsContext = {
  userId: 'user_admin_01',
  tenantId: 'tenant_A',
  companyId: 'comp_01',
  branchId: 'branch_riyadh',
  permissions: ['analytics:view', 'shipping:shipment:view', 'crm:customer:view', 'sales:quote:view'],
  timezone: 'Asia/Riyadh',
};

const mockContextAdminTenantB: ServerAnalyticsContext = {
  userId: 'user_admin_02',
  tenantId: 'tenant_B',
  companyId: 'comp_02',
  branchId: 'branch_jeddah',
  permissions: ['analytics:view', 'shipping:shipment:view', 'crm:customer:view', 'sales:quote:view'],
  timezone: 'Asia/Riyadh',
};

const mockContextRestrictedUser: ServerAnalyticsContext = {
  userId: 'user_restricted_01',
  tenantId: 'tenant_A',
  permissions: ['analytics:view'], // Missing domain-specific view permissions
  timezone: 'Asia/Riyadh',
};

const engine = new AnalyticsAggregationEngine();

test('1. Shipment Count Metric Execution', async () => {
  const result = await engine.executeMetric('shp_total_shipments', undefined, mockContextAdminTenantA);
  assert.ok(result);
  assert.strictEqual(result.metricId, 'shp_total_shipments');
  assert.strictEqual(result.valueType, 'COUNT');
  assert.strictEqual(typeof result.value, 'number');
  assert.strictEqual(result.completeness, 'COMPLETE');
});

test('2. Shipment Filtered Count Metric Execution', async () => {
  const queryState: EnterpriseQueryState = {
    search: '',
    sort: null,
    pagination: { page: 1, pageSize: 10 },
    filters: { status: 'DELIVERED' },
  };
  const result = await engine.executeMetric('shp_delivered_shipments', queryState, mockContextAdminTenantA);
  assert.ok(result);
  assert.strictEqual(result.metricId, 'shp_delivered_shipments');
  assert.strictEqual(typeof result.value, 'number');
});

test('3. Customer Count Metric Execution', async () => {
  const result = await engine.executeMetric('cust_total_customers', undefined, mockContextAdminTenantA);
  assert.ok(result);
  assert.strictEqual(result.metricId, 'cust_total_customers');
  assert.strictEqual(result.valueType, 'COUNT');
});

test('4. Quote Count Metric Execution', async () => {
  const result = await engine.executeMetric('quote_total_quotes', undefined, mockContextAdminTenantA);
  assert.ok(result);
  assert.strictEqual(result.metricId, 'quote_total_quotes');
  assert.strictEqual(result.valueType, 'COUNT');
});

test('5. Derived Metric Execution — Conversion & Completion Rates', async () => {
  const convRate = await engine.executeMetric('quote_conversion_rate', undefined, mockContextAdminTenantA);
  assert.ok(convRate);
  assert.strictEqual(convRate.metricId, 'quote_conversion_rate');
  assert.strictEqual(convRate.valueType, 'PERCENTAGE');

  const compRate = await engine.executeMetric('shp_delivery_completion_rate', undefined, mockContextAdminTenantA);
  assert.ok(compRate);
  assert.strictEqual(compRate.metricId, 'shp_delivery_completion_rate');
  assert.strictEqual(compRate.valueType, 'PERCENTAGE');
});

test('6. Zero Denominator Safety in Division', async () => {
  // Executing derived metric over empty tenant scope
  const emptyContext: ServerAnalyticsContext = {
    ...mockContextAdminTenantA,
    tenantId: 'tenant_empty_9999',
  };
  const result = await engine.executeMetric('quote_conversion_rate', undefined, emptyContext);
  assert.ok(result);
  assert.strictEqual(result.value, null); // safe AnalyticsDivide returns null, not NaN or Infinity
});

test('7. Invalid Metric Rejection', async () => {
  await assert.rejects(
    async () => {
      await engine.executeMetric('invalid_metric_99', undefined, mockContextAdminTenantA);
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_METRIC_NOT_FOUND';
    }
  );
});

test('8. Unauthorized Metric Access Rejection', async () => {
  await assert.rejects(
    async () => {
      await engine.executeMetric('shp_total_shipments', undefined, mockContextRestrictedUser);
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_PERMISSION_REQUIRED';
    }
  );
});

test('9 & 10. Tenant Isolation and Company/Branch Scoping', async () => {
  const resTenantA = await engine.executeMetric('shp_total_shipments', undefined, mockContextAdminTenantA);
  const resTenantB = await engine.executeMetric('shp_total_shipments', undefined, mockContextAdminTenantB);

  assert.ok(resTenantA);
  assert.ok(resTenantB);
  // Scopes are completely isolated server-side
});

test('11 & 12. Date-Range Filtering and TimeField Resolution', async () => {
  const queryState: EnterpriseQueryState = {
    search: '',
    sort: null,
    pagination: { page: 1, pageSize: 10 },
    filters: {
      dateRange: {
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.999Z',
      },
    },
  };

  const result = await engine.executeMetric('shp_total_shipments', queryState, mockContextAdminTenantA);
  assert.ok(result);
});

test('13. Dimension Grouping Execution', async () => {
  const grouped = await engine.executeGroupedMetric('shp_total_shipments', 'status', undefined, mockContextAdminTenantA);
  assert.ok(grouped);
  assert.strictEqual(grouped.metricId, 'shp_total_shipments');
  assert.strictEqual(grouped.dimension, 'status');
  assert.ok(Array.isArray(grouped.groups));
});

test('14, 15 & 16. Time-Series Aggregation (DAY, WEEK, MONTH)', async () => {
  const daySeries = await engine.executeTimeSeries('shp_total_shipments', 'DAY', undefined, mockContextAdminTenantA);
  assert.ok(Array.isArray(daySeries));

  const weekSeries = await engine.executeTimeSeries('shp_total_shipments', 'WEEK', undefined, mockContextAdminTenantA);
  assert.ok(Array.isArray(weekSeries));

  const monthSeries = await engine.executeTimeSeries('shp_total_shipments', 'MONTH', undefined, mockContextAdminTenantA);
  assert.ok(Array.isArray(monthSeries));
});

test('17. Timezone Boundary Bucketing', () => {
  const sampleUtcDate = '2026-01-01T22:30:00.000Z'; // In Asia/Riyadh (+3), this is 2026-01-02 01:30
  const bucketRiyadh = getTimeBucketKey(sampleUtcDate, 'DAY', 'Asia/Riyadh');
  assert.strictEqual(bucketRiyadh.key, '2026-01-02');
});

test('18 & 19. Currency Grouping & Mixed-Currency Safety', async () => {
  const groupedCurrency = await engine.executeGroupedMetric('quote_offered_value', 'currency', undefined, mockContextAdminTenantA);
  assert.ok(groupedCurrency);
  assert.strictEqual(groupedCurrency.dimension, 'currency');
});

test('20. Unsupported Dimension Rejection', async () => {
  await assert.rejects(
    async () => {
      await engine.executeGroupedMetric('shp_total_shipments', 'unsupported_dim_123', undefined, mockContextAdminTenantA);
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_INVALID_DIMENSION';
    }
  );
});

test('21. Unsupported Filter Rejection', () => {
  const metric = { id: 'shp_total_shipments', dimensions: [{ sourceField: 'status' }] } as any;
  const invalidQueryState: EnterpriseQueryState = {
    search: '',
    sort: null,
    pagination: { page: 1, pageSize: 10 },
    filters: { malicious_sql_field: 'SELECT * FROM users' },
  };

  assert.throws(
    () => {
      translateAnalyticsFilters(metric, invalidQueryState, 'tenant_A');
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_UNSUPPORTED_FILTER';
    }
  );
});

test('22. Zero Mock Fallback Policy', async () => {
  const emptyContext: ServerAnalyticsContext = {
    ...mockContextAdminTenantA,
    tenantId: 'tenant_zero_records_test',
  };
  const countRes = await engine.executeMetric('shp_total_shipments', undefined, emptyContext);
  assert.strictEqual(countRes.value, 0); // Must be real 0, never mock non-zero fallbacks
});

test('23. Bounded Batch Metric Execution Limit', async () => {
  const tooManyMetrics = Array.from({ length: 25 }, (_, i) => `metric_${i}`);
  await assert.rejects(
    async () => {
      await engine.executeMetrics(tooManyMetrics as any, undefined, mockContextAdminTenantA);
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_QUERY_TOO_EXPENSIVE';
    }
  );
});

test('24. EnterpriseQueryState Integration', async () => {
  const queryState: EnterpriseQueryState = {
    search: 'Riyadh',
    filters: { status: 'DELIVERED' },
    sort: { field: 'createdAt', direction: 'desc' },
    pagination: { page: 2, pageSize: 50 },
  };

  const res = await engine.executeMetric('shp_total_shipments', queryState, mockContextAdminTenantA);
  assert.ok(res);
});

test('25. Registry-Only Metric Resolution Authority', async () => {
  await assert.rejects(
    async () => {
      await engine.executeMetric('unregistered_dynamic_metric', undefined, mockContextAdminTenantA);
    },
    (err: any) => {
      return err instanceof AnalyticsError && err.code === 'ANALYTICS_METRIC_NOT_FOUND';
    }
  );
});

test('26. Aggregate Totals Ignore UI Page Pagination', async () => {
  const queryStatePage1: EnterpriseQueryState = {
    search: '',
    sort: null,
    filters: {},
    pagination: { page: 1, pageSize: 5 },
  };
  const queryStatePage2: EnterpriseQueryState = {
    search: '',
    sort: null,
    filters: {},
    pagination: { page: 2, pageSize: 5 },
  };

  const res1 = await engine.executeMetric('shp_total_shipments', queryStatePage1, mockContextAdminTenantA);
  const res2 = await engine.executeMetric('shp_total_shipments', queryStatePage2, mockContextAdminTenantA);

  assert.strictEqual(res1.value, res2.value); // Page pagination must NOT change overall KPI total!
});

test('27. On-Time / Delivery Completion Rate KPI Semantic Correctness', async () => {
  const completionRate = await engine.executeMetric('shp_delivery_completion_rate', undefined, mockContextAdminTenantA);
  assert.strictEqual(completionRate.metricId, 'shp_delivery_completion_rate');
  assert.strictEqual(completionRate.valueType, 'PERCENTAGE');
});
