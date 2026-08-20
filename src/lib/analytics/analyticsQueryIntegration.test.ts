/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Query State & Analytics Integration Unit Tests
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Enterprise Query State, Saved Analytics Views & Dynamic Date/Filter Integration (STEP 05.19.05)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { normalizeQueryState } from '../query/enterpriseQueryEngine';
import { normalizeDataView } from '../dataView/enterpriseDataViewEngine';
import { DataViewService } from '../../services/dataViewService';
import {
  validateDateRange,
  serializeDateRangeToQueryFilters,
  extractDateRangeFromQueryState,
  sanitizeSelectedMetricIds,
  batchMetricIds,
  getAnalyticsQueryDefaults,
} from './analyticsQueryUtils';
import { translateAnalyticsFilters } from './analyticsFilterTranslator';
import { analyticsMetricRegistry } from './analyticsMetricRegistry';

test('1. Date Range Validation — Valid & Invalid Ranges', () => {
  const valid = validateDateRange('2026-01-01', '2026-01-31');
  assert.strictEqual(valid.isValid, true);

  const invalidOrder = validateDateRange('2026-02-01', '2026-01-01');
  assert.strictEqual(invalidOrder.isValid, false);
  assert.ok(invalidOrder.errorEn?.includes('Start date cannot be after end date'));

  const invalidFormat = validateDateRange('01/01/2026', '2026-01-31');
  assert.strictEqual(invalidFormat.isValid, false);

  const missingStart = validateDateRange('', '2026-01-31');
  assert.strictEqual(missingStart.isValid, false);
});

test('2. Date Range Serialization & Extraction', () => {
  const filters = serializeDateRangeToQueryFilters({ startDate: '2026-03-01', endDate: '2026-03-31' });
  assert.deepStrictEqual(filters, {
    dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' },
  });

  const queryState: EnterpriseQueryState = {
    search: '',
    filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
    sort: null,
    pagination: { page: 1, pageSize: 25 },
  };

  const extracted = extractDateRangeFromQueryState(queryState);
  assert.ok(extracted);
  assert.strictEqual(extracted.startDate, '2026-03-01');
  assert.strictEqual(extracted.endDate, '2026-03-31');
});

test('3. Permission-Aware Metric Sanitization', () => {
  const availableMetrics = [
    { id: 'shp_total_shipments', labelEn: 'Total Shipments', labelAr: 'إجمالي الشحنات' },
    { id: 'cust_total_customers', labelEn: 'Total Customers', labelAr: 'إجمالي العملاء' },
  ];

  const requested = ['shp_total_shipments', 'forbidden_financial_metric', 'cust_total_customers'];
  const sanitized = sanitizeSelectedMetricIds(requested, availableMetrics as any);

  assert.strictEqual(sanitized.length, 2);
  assert.ok(sanitized.includes('shp_total_shipments'));
  assert.ok(sanitized.includes('cust_total_customers'));
  assert.strictEqual(sanitized.includes('forbidden_financial_metric'), false);
});

test('4. Multi-Metric Batching (Max 20 per batch)', () => {
  const metricIds = Array.from({ length: 45 }, (_, i) => `metric_${i + 1}`);
  const batches = batchMetricIds(metricIds, 20);

  assert.strictEqual(batches.length, 3);
  assert.strictEqual(batches[0].length, 20);
  assert.strictEqual(batches[1].length, 20);
  assert.strictEqual(batches[2].length, 5);
  assert.strictEqual(batches[0][0], 'metric_1');
  assert.strictEqual(batches[2][4], 'metric_45');
});

test('5. EnterpriseQueryState Integration & Normalization', () => {
  const rawState = {
    search: '  Riyadh Freight  ',
    filters: {
      status: 'DELIVERED',
      serviceType: 'EXPRESS',
      dateRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
      emptyVal: '',
    },
    pagination: { page: 2, pageSize: 50 },
  };

  const normalized = normalizeQueryState(rawState, getAnalyticsQueryDefaults());

  assert.strictEqual(normalized.search, 'Riyadh Freight');
  assert.strictEqual(normalized.filters.status, 'DELIVERED');
  assert.strictEqual(normalized.filters.serviceType, 'EXPRESS');
  assert.ok(normalized.filters.dateRange);
  assert.strictEqual((normalized.filters.emptyVal as any), undefined);
  assert.strictEqual(normalized.pagination.page, 2);
  assert.strictEqual(normalized.pagination.pageSize, 50);
});

test('6. Saved Analytics View Persistence & Metadata Normalization', () => {
  const rawView = {
    resource: 'analytics',
    nameEn: 'Quarterly Executive Dashboard',
    nameAr: 'لوحة القيادة التنفيذية الربع سنوية',
    query: {
      search: 'Executive',
      filters: { status: 'ACTIVE', dateRange: { startDate: '2026-01-01', endDate: '2026-03-31' } },
      pageSize: 25,
      analytics: {
        selectedMetricIds: ['shp_total_shipments', 'cust_total_customers'],
        dimension: 'status',
        interval: 'MONTH' as const,
        resource: 'shipments',
      },
    },
  };

  const normalized = normalizeDataView(rawView);

  assert.ok(normalized);
  assert.strictEqual(normalized.resource, 'analytics');
  assert.strictEqual(normalized.query.search, 'Executive');
  assert.strictEqual(normalized.query.filters.status, 'ACTIVE');
  assert.ok(normalized.query.filters.dateRange);
  assert.ok(normalized.query.analytics);
  assert.strictEqual(normalized.query.analytics.dimension, 'status');
  assert.strictEqual(normalized.query.analytics.interval, 'MONTH');
  assert.deepStrictEqual(normalized.query.analytics.selectedMetricIds, [
    'shp_total_shipments',
    'cust_total_customers',
  ]);
});

test('7. DataViewService Integration — Saved Analytics View Creation & Listing', async () => {
  const viewPayload = {
    resource: 'analytics',
    nameEn: 'Logistics Performance View',
    nameAr: 'عرض الأداء اللوجستي',
    query: {
      search: '',
      filters: { dateRange: { startDate: '2026-01-01', endDate: '2026-06-30' } },
      pageSize: 25,
      analytics: {
        selectedMetricIds: ['shp_total_shipments'],
        resource: 'shipments',
      },
    },
  };

  const createdView = await DataViewService.createView(viewPayload, 'usr_test_exec', 'Executive User');
  assert.ok(createdView);
  assert.ok(createdView.id);
  assert.strictEqual(createdView.resource, 'analytics');
  assert.strictEqual(createdView.query.analytics?.selectedMetricIds?.[0], 'shp_total_shipments');

  const listedViews = await DataViewService.listViews('analytics', 'usr_test_exec');
  assert.ok(listedViews.length >= 1);
  const found = listedViews.find((v) => v.id === createdView.id);
  assert.ok(found);
  assert.strictEqual(found.nameEn, 'Logistics Performance View');
});

test('8. Filter Translation — Date Range & TimeField Mapping', () => {
  const metric = analyticsMetricRegistry.requireMetric('shp_total_shipments');
  const queryState: EnterpriseQueryState = {
    search: 'Express',
    filters: {
      status: 'DELIVERED',
      dateRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
    },
    sort: null,
    pagination: { page: 1, pageSize: 25 },
  };

  const translated = translateAnalyticsFilters(metric, queryState, 'tnt_test');

  assert.strictEqual(translated.tenantId, 'tnt_test');
  assert.strictEqual(translated.equalityFilters.status, 'DELIVERED');
  assert.strictEqual(translated.searchQuery, 'Express');
  assert.ok(translated.dateRangeFilter);
  assert.strictEqual(translated.dateRangeFilter.field, metric.timeField || 'createdAt');
  assert.strictEqual(translated.dateRangeFilter.startDate, '2026-01-01');
  assert.strictEqual(translated.dateRangeFilter.endDate, '2026-01-31');
});
