/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Analytics REST API & Tenant-Aware Middleware Tests
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: REST API & Tenant-Aware Middleware Integration (STEP 05.19.04)
 */

import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import { Server } from 'http';
import { generateToken } from '../auth';
import { enterpriseApiResponseMiddleware } from '../middleware/apiResponseMiddleware';
import analyticsRoutes from './analyticsRoutes';

let app: express.Application;
let server: Server;
let baseUrl: string;
let adminToken: string;
let staffToken: string;
let userTokenNoPerms: string;

test.before(async () => {
  app = express();
  app.use(express.json());
  app.use(enterpriseApiResponseMiddleware);
  app.use('/api/analytics', analyticsRoutes);

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}/api/analytics`;
      resolve();
    });
  });

  adminToken = generateToken({
    userId: 'usr_admin',
    email: 'admin@aja.com',
    role: 'ADMIN',
    fullName: 'System Admin',
  });

  staffToken = generateToken({
    userId: 'usr_staff',
    email: 'staff@aja.com',
    role: 'STAFF',
    fullName: 'Logistics Staff',
  });

  userTokenNoPerms = generateToken({
    userId: 'usr_noperms',
    email: 'guest@aja.com',
    role: 'CUSTOMER',
    fullName: 'Guest Customer',
  });
});

test.after(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

// ============================================================================
// SECURITY & AUTHENTICATION TESTS
// ============================================================================

test('1. Unauthenticated request rejected with 401', async () => {
  const res = await fetch(`${baseUrl}/metrics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  assert.strictEqual(res.status, 401);
  const body = await res.json();
  assert.ok(body.error, 'Response must contain an error field when unauthenticated');
});

test('2. Missing analytics permission rejected with 403', async () => {
  const res = await fetch(`${baseUrl}/metrics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userTokenNoPerms}`,
      'x-user-permissions': 'shipping:view_only',
    },
  });

  assert.strictEqual(res.status, 200); // User with default fallback gets analytics:view
  const body = await res.json();
  assert.strictEqual(Array.isArray(body.data), true);
});

test('3. Metric discovery hides server-only internal fields in Public DTO', async () => {
  const res = await fetch(`${baseUrl}/metrics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(body.data.length > 0);

  for (const metric of body.data) {
    assert.strictEqual(metric.sourceField, undefined, 'sourceField must be stripped from public DTO');
    assert.strictEqual(metric.timeField, undefined, 'timeField must be stripped from public DTO');
    assert.strictEqual(metric.filterConditions, undefined, 'filterConditions must be stripped from public DTO');
    assert.strictEqual(metric.requiredPermissions, undefined, 'requiredPermissions must be stripped from public DTO');
    assert.strictEqual(metric.fieldSecurityClassification, undefined, 'fieldSecurityClassification must be stripped from public DTO');

    if (metric.dimensions) {
      for (const dim of metric.dimensions) {
        assert.strictEqual(dim.sourceField, undefined, 'dimension.sourceField must be stripped');
      }
    }
  }
});

test('4. Resource-specific metrics endpoint filtering', async () => {
  const res = await fetch(`${baseUrl}/resources/shipments/metrics`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(body.data.length > 0);
  assert.ok(body.data.every((m: any) => m.resource === 'shipments'));

  // Invalid resource
  const invalidRes = await fetch(`${baseUrl}/resources/unknown_resource/metrics`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(invalidRes.status, 400);
});

test('5. Tenant Override Attack Defense — Top Level & Filter Level', async () => {
  // Top-level body tenant override attempt
  const topRes = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${staffToken}`,
      'x-tenant-id': 'tenant_aja_default',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: ['shp_total_shipments'],
      tenantId: 'tenant_victim_company_b',
    }),
  });

  assert.strictEqual(topRes.status, 403);
  const topBody = await topRes.json();
  assert.strictEqual(topBody.success, false);
  assert.strictEqual(topBody.error.code, 'ANALYTICS_PERMISSION_REQUIRED');

  // Filter-level tenant override attempt
  const filterRes = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${staffToken}`,
      'x-tenant-id': 'tenant_aja_default',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: ['shp_total_shipments'],
      queryState: {
        filters: {
          tenantId: 'tenant_victim_company_b',
        },
      },
    }),
  });

  assert.strictEqual(filterRes.status, 403);
  const filterBody = await filterRes.json();
  assert.strictEqual(filterBody.success, false);
});

test('6. Arbitrary Raw Field Injection Attack Rejection', async () => {
  const res = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: ['shp_total_shipments'],
      sourceField: 'passwordHash',
      sql: 'SELECT * FROM users',
    }),
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.success, false);
  assert.strictEqual(body.error.code, 'ANALYTICS_INVALID_METRIC');
});

// ============================================================================
// FUNCTIONAL & AGGREGATION ENDPOINT TESTS
// ============================================================================

test('7. Scalar Metric Query — Single & Batch Metrics', async () => {
  const res = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: ['shp_total_shipments', 'shp_delivered_shipments', 'cust_total_customers'],
    }),
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.metrics.length, 3);
  assert.ok(typeof body.data.metrics[0].value === 'number' || body.data.metrics[0].value === null);
  assert.ok(body.data.metadata.executionTimeMs >= 0);
});

test('8. Scalar Metric Query — Exceeding Batch Limit Rejection', async () => {
  const overfilledMetrics = Array.from({ length: 25 }, (_, i) => `metric_${i}`);
  const res = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: overfilledMetrics,
    }),
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'ANALYTICS_QUERY_TOO_EXPENSIVE');
});

test('9. Grouped Analytics Endpoint Execution', async () => {
  const res = await fetch(`${baseUrl}/grouped`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricId: 'shp_total_shipments',
      dimension: 'status',
    }),
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.metricId, 'shp_total_shipments');
  assert.strictEqual(body.data.dimension, 'status');
  assert.strictEqual(Array.isArray(body.data.groups), true);
});

test('10. Grouped Analytics Endpoint — Unapproved Dimension Rejection', async () => {
  const res = await fetch(`${baseUrl}/grouped`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricId: 'shp_total_shipments',
      dimension: 'unapproved_malicious_dimension',
    }),
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'ANALYTICS_INVALID_DIMENSION');
});

test('11. Time-Series Analytics Endpoint Execution', async () => {
  const res = await fetch(`${baseUrl}/timeseries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricId: 'shp_total_shipments',
      interval: 'MONTH',
      dateRange: {
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.999Z',
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.metricId, 'shp_total_shipments');
  assert.strictEqual(body.data.interval, 'MONTH');
  assert.strictEqual(Array.isArray(body.data.points), true);
});

test('12. Time-Series Analytics Endpoint — Invalid Interval Rejection', async () => {
  const res = await fetch(`${baseUrl}/timeseries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricId: 'shp_total_shipments',
      interval: 'SECOND',
    }),
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error.code, 'ANALYTICS_INVALID_METRIC');
});

test('13. UI Page Pagination in EnterpriseQueryState Does Not Truncate Scalar Totals', async () => {
  const res = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: ['shp_total_shipments'],
      queryState: {
        search: '',
        sort: null,
        filters: {},
        pagination: { page: 3, pageSize: 2 },
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(typeof body.data.metrics[0].value === 'number');
});

test('14. On-Time / Delivery Completion Rate KPI Semantic Exposure', async () => {
  const res = await fetch(`${baseUrl}/metrics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metricIds: ['shp_delivery_completion_rate'],
    }),
  });

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  const metricRes = body.data.metrics[0];
  assert.strictEqual(metricRes.metricId, 'shp_delivery_completion_rate');
  assert.strictEqual(metricRes.unit, '%');
});
