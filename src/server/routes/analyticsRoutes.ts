/**
 * AJA INTERNATIONAL LOGISTICS — Express REST API Routes for Enterprise Analytics
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: REST API & Tenant-Aware Middleware Integration (STEP 05.19.04)
 * Version: 1.0
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { analyticsAggregationEngine } from '../../services/analytics/analyticsAggregationEngine';
import { analyticsMetricRegistry } from '../../lib/analytics/analyticsMetricRegistry';
import { mapMetricToPublicDTO } from '../../lib/analytics/analyticsDtoMapper';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';
import { AnalyticsError, AnalyticsResourceId } from '../../types/analyticsFramework';
import {
  validateMetricQueryPayload,
  validateGroupedQueryPayload,
  validateTimeSeriesPayload,
  validateTenantSecurityOverride,
} from '../validation/analyticsValidation';

const router = Router();

// Apply authentication middleware to all analytics endpoints
router.use(requireAuth);

/**
 * Builds server-authoritative analytics context from authenticated user session & headers.
 */
function buildServerAnalyticsContext(req: AuthenticatedRequest): ServerAnalyticsContext {
  const user = req.user!;
  const userId = user.userId;

  // Header-provided tenant details with fallback
  const tenantId = (req.headers['x-tenant-id'] as string) || (req.headers['x-company-id'] as string) || 'tenant_aja_default';
  const companyId = (req.headers['x-company-id'] as string) || tenantId;
  const branchId = (req.headers['x-branch-id'] as string) || undefined;

  let permissions: string[] = [];

  if (user.role === 'ADMIN') {
    permissions = ['*', 'analytics:view', 'shipping:shipment:view', 'customer:view', 'quote:view', 'finance:view'];
  } else if (user.role === 'STAFF') {
    permissions = ['analytics:view', 'shipping:shipment:view', 'customer:view', 'quote:view', 'finance:view'];
  } else {
    permissions = ['analytics:view'];
  }

  // Include '*' if admin to satisfy wildcard permission matches
  if (user.role === 'ADMIN' && !permissions.includes('*')) {
    permissions.push('*');
  }

  const timezone = (req.headers['x-timezone'] as string) || 'Asia/Riyadh';
  const locale = (req.headers['accept-language']?.includes('ar') ? 'ar' : 'en') as 'ar' | 'en';

  return {
    userId,
    tenantId,
    companyId,
    branchId,
    permissions,
    timezone,
    locale,
  };
}

/**
 * Maps AnalyticsError or generic errors into safe API response.
 */
function handleAnalyticsError(res: Response, err: any): Response {
  if (err instanceof AnalyticsError) {
    let statusCode = 400;
    switch (err.code) {
      case 'ANALYTICS_METRIC_NOT_FOUND':
        statusCode = 404;
        break;
      case 'ANALYTICS_PERMISSION_REQUIRED':
        statusCode = 403;
        break;
      case 'ANALYTICS_CURRENCY_MISMATCH':
        statusCode = 422;
        break;
      case 'ANALYTICS_QUERY_TOO_EXPENSIVE':
      case 'ANALYTICS_INVALID_METRIC':
      case 'ANALYTICS_INVALID_DIMENSION':
      case 'ANALYTICS_UNSUPPORTED_FILTER':
      case 'ANALYTICS_UNSUPPORTED_AGGREGATION':
        statusCode = 400;
        break;
      default:
        statusCode = 500;
    }

    if (res.apiError) {
      return res.apiError(err.code as any, err.message, undefined, statusCode, err.details);
    }
    return res.status(statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  const message = err?.message || 'An unexpected server error occurred during analytics execution.';
  if (res.apiError) {
    return res.apiError('INTERNAL_SERVER_ERROR' as any, message, undefined, 500);
  }
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message },
  });
}

/**
 * GET /api/analytics/metrics
 * Returns available metrics the authenticated user is authorized to discover.
 */
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildServerAnalyticsContext(req);
    const resourceFilter = req.query.resource as string | undefined;

    let allDescriptors = resourceFilter
      ? analyticsMetricRegistry.listMetricsByResource(resourceFilter as AnalyticsResourceId)
      : analyticsMetricRegistry.listMetrics();

    // Filter metrics by user authorization
    const userPerms = new Set(context.permissions);
    const hasWildcard = userPerms.has('*');

    const authorizedMetrics = allDescriptors.filter((metric) => {
      if (metric.status !== 'ACTIVE') return false;
      if (hasWildcard) return true;
      if (!metric.requiredPermissions || metric.requiredPermissions.length === 0) return true;
      return metric.requiredPermissions.every((p) => userPerms.has(p));
    });

    const publicDtos = authorizedMetrics.map(mapMetricToPublicDTO);

    if (res.apiSuccess) {
      return res.apiSuccess(publicDtos, 'Authorized analytics metrics retrieved successfully');
    }
    return res.json({ success: true, data: publicDtos });
  } catch (err: any) {
    return handleAnalyticsError(res, err);
  }
});

/**
 * GET /api/analytics/resources/:resource/metrics
 * Returns available authorized metrics specifically for a resource.
 */
router.get('/resources/:resource/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resource } = req.params;
    const context = buildServerAnalyticsContext(req);

    const VALID_RESOURCES = new Set(['shipments', 'customers', 'quotes', 'warehouse', 'fleet', 'finance', 'control_tower']);
    if (!VALID_RESOURCES.has(resource)) {
      return handleAnalyticsError(
        res,
        new AnalyticsError('ANALYTICS_INVALID_METRIC', `Resource "${resource}" is not a recognized analytics resource.`)
      );
    }

    const descriptors = analyticsMetricRegistry.listMetricsByResource(resource as AnalyticsResourceId);
    const userPerms = new Set(context.permissions);
    const hasWildcard = userPerms.has('*');

    const authorizedMetrics = descriptors.filter((metric) => {
      if (metric.status !== 'ACTIVE') return false;
      if (hasWildcard) return true;
      if (!metric.requiredPermissions || metric.requiredPermissions.length === 0) return true;
      return metric.requiredPermissions.every((p) => userPerms.has(p));
    });

    const publicDtos = authorizedMetrics.map(mapMetricToPublicDTO);

    if (res.apiSuccess) {
      return res.apiSuccess(publicDtos, `Authorized metrics for resource "${resource}" retrieved successfully`);
    }
    return res.json({ success: true, data: publicDtos });
  } catch (err: any) {
    return handleAnalyticsError(res, err);
  }
});

/**
 * POST /api/analytics/metrics/query
 * Execute one or more scalar KPI metrics.
 */
router.post('/metrics/query', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildServerAnalyticsContext(req);

    // Tenant Override Defense Check
    validateTenantSecurityOverride(req.body, req.query, context);

    // Schema Validation
    const { metricIds, queryState } = validateMetricQueryPayload(req.body);

    // Execute through Central Aggregation Engine
    const executionResponse = await analyticsAggregationEngine.executeMetrics(
      metricIds,
      { queryState },
      context
    );

    if (res.apiSuccess) {
      return res.apiSuccess(executionResponse, 'Analytics metrics executed successfully');
    }
    return res.json({ success: true, data: executionResponse });
  } catch (err: any) {
    return handleAnalyticsError(res, err);
  }
});

/**
 * POST /api/analytics/grouped
 * Execute a metric grouped by an approved dimension.
 */
router.post('/grouped', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildServerAnalyticsContext(req);

    // Tenant Override Defense Check
    validateTenantSecurityOverride(req.body, req.query, context);

    // Schema Validation
    const { metricId, dimension, queryState } = validateGroupedQueryPayload(req.body);

    // Execute through Central Aggregation Engine
    const result = await analyticsAggregationEngine.executeGroupedMetric(
      metricId,
      dimension,
      queryState,
      context
    );

    if (res.apiSuccess) {
      return res.apiSuccess(result, 'Grouped analytics metric executed successfully');
    }
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return handleAnalyticsError(res, err);
  }
});

/**
 * POST /api/analytics/timeseries
 * Execute approved time-series analytics.
 */
router.post('/timeseries', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildServerAnalyticsContext(req);

    // Tenant Override Defense Check
    validateTenantSecurityOverride(req.body, req.query, context);

    // Schema Validation
    const { metricId, interval, dateRange, queryState: rawQueryState } = validateTimeSeriesPayload(req.body);

    // Merge dateRange into queryState filters if present
    const queryState = rawQueryState || {};
    if (dateRange) {
      queryState.filters = {
        ...(queryState.filters || {}),
        dateRange,
      };
    }

    // Execute through Central Aggregation Engine
    const points = await analyticsAggregationEngine.executeTimeSeries(
      metricId,
      interval,
      queryState,
      context
    );

    const payload = {
      metricId,
      interval,
      dateRange: dateRange || queryState?.filters?.dateRange || null,
      points,
      computedAt: new Date().toISOString(),
    };

    if (res.apiSuccess) {
      return res.apiSuccess(payload, 'Time-series analytics executed successfully');
    }
    return res.json({ success: true, data: payload });
  } catch (err: any) {
    return handleAnalyticsError(res, err);
  }
});

export default router;
