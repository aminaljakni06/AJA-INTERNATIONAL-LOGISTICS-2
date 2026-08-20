/**
 * AJA INTERNATIONAL LOGISTICS — Control Tower Operational Analytics Unit & Integration Tests
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Control Tower Operational Analytics, Telemetry & Exception Intelligence (STEP 05.19.09)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import { AnalyticsAggregationEngine } from '../../../services/analytics/analyticsAggregationEngine';
import { ServerAnalyticsContext } from '../../../lib/analytics/analyticsExecutionTypes';
import { controlTowerAnalyticsRepository } from './controlTowerAnalyticsRepository';
import { analyticsMetricRegistry } from '../../../lib/analytics/analyticsMetricRegistry';

const mockContextControlTowerUser: ServerAnalyticsContext = {
  userId: 'user_ct_admin_01',
  tenantId: 'tenant_aja_default',
  companyId: 'comp_01',
  branchId: 'branch_riyadh',
  permissions: ['control_tower:view', 'analytics:view'],
  timezone: 'Asia/Riyadh',
};

const mockContextRestrictedUser: ServerAnalyticsContext = {
  userId: 'user_ct_restricted',
  tenantId: 'tenant_aja_default',
  permissions: ['some_other_permission'],
  timezone: 'Asia/Riyadh',
};

const engine = new AnalyticsAggregationEngine();

test('1. Control Tower Metrics Registry Extension', () => {
  const activeShipmentsMetric = analyticsMetricRegistry.getMetric('ct_active_shipments');
  assert.ok(activeShipmentsMetric);
  assert.strictEqual(activeShipmentsMetric.resource, 'control_tower');
  assert.strictEqual(activeShipmentsMetric.domain, 'OPERATIONS');

  const openExceptionsMetric = analyticsMetricRegistry.getMetric('ct_open_exceptions');
  assert.ok(openExceptionsMetric);

  const healthScoreMetric = analyticsMetricRegistry.getMetric('ct_logistics_health_score');
  assert.ok(healthScoreMetric);
});

test('2. Execute ct_active_shipments Scalar Metric', async () => {
  const result = await engine.executeMetric('ct_active_shipments', undefined, mockContextControlTowerUser);
  assert.ok(result);
  assert.strictEqual(result.metricId, 'ct_active_shipments');
  assert.strictEqual(result.valueType, 'COUNT');
  assert.strictEqual(typeof result.value, 'number');
  assert.ok(result.value! >= 0);
});

test('3. Execute ct_open_exceptions and ct_critical_exceptions Metrics', async () => {
  const openResult = await engine.executeMetric('ct_open_exceptions', undefined, mockContextControlTowerUser);
  assert.ok(openResult);
  assert.strictEqual(openResult.metricId, 'ct_open_exceptions');
  assert.strictEqual(typeof openResult.value, 'number');

  const criticalResult = await engine.executeMetric('ct_critical_exceptions', undefined, mockContextControlTowerUser);
  assert.ok(criticalResult);
  assert.strictEqual(criticalResult.metricId, 'ct_critical_exceptions');
  assert.strictEqual(typeof criticalResult.value, 'number');
});

test('4. Execute ct_resolution_rate and ct_logistics_health_score Metrics', async () => {
  const resRateResult = await engine.executeMetric('ct_resolution_rate', undefined, mockContextControlTowerUser);
  assert.ok(resRateResult);
  assert.strictEqual(resRateResult.metricId, 'ct_resolution_rate');
  assert.strictEqual(typeof resRateResult.value, 'number');

  const healthResult = await engine.executeMetric('ct_logistics_health_score', undefined, mockContextControlTowerUser);
  assert.ok(healthResult);
  assert.strictEqual(healthResult.metricId, 'ct_logistics_health_score');
  assert.strictEqual(typeof healthResult.value, 'number');
});

test('5. Execute Grouped Control Tower Query by Category', async () => {
  const groupedResult = await engine.executeGroupedMetric(
    'ct_open_exceptions',
    'category',
    undefined,
    mockContextControlTowerUser
  );
  assert.ok(groupedResult);
  assert.strictEqual(groupedResult.metricId, 'ct_open_exceptions');
  assert.strictEqual(groupedResult.dimension, 'category');
  assert.ok(Array.isArray(groupedResult.groups));
});

test('6. Execute Control Tower Time Series Query', async () => {
  const timeSeriesResult = await engine.executeTimeSeries(
    'ct_active_shipments',
    'DAY',
    undefined,
    mockContextControlTowerUser
  );
  assert.ok(Array.isArray(timeSeriesResult));
});

test('7. Permission Denial for Restricted User on Control Tower Metrics', async () => {
  await assert.rejects(
    async () => {
      await engine.executeMetric('ct_active_shipments', undefined, mockContextRestrictedUser);
    },
    (err: any) => {
      assert.strictEqual(err.code, 'ANALYTICS_PERMISSION_REQUIRED');
      return true;
    }
  );
});
