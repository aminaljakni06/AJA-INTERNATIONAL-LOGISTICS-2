/**
 * AJA INTERNATIONAL LOGISTICS — Parameterized Reporting & Scheduled Reports Express Router
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 * Version: 1.0
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth, requireRoles } from '../auth';
import { reportRepository } from '../../db/repositories/reportRepository';
import { reportExecutionService } from '../../services/reports/reportExecutionService';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';
import { AnalyticsError } from '../../types/analyticsFramework';

export const reportRouter = Router();

reportRouter.use(requireAuth);

function buildContextFromRequest(req: AuthenticatedRequest): ServerAnalyticsContext {
  const user = req.user!;
  const permissions =
    user.role === 'ADMIN' || user.role === 'STAFF'
      ? ['analytics:view', 'reports:view', 'control_tower:view', 'customer:view', 'finance:view']
      : ['reports:view', 'customer:view'];

  return {
    userId: user.userId,
    tenantId: 'tenant_aja_default',
    companyId: 'comp_01',
    branchId: 'branch_riyadh',
    permissions,
    timezone: (req.headers['x-user-timezone'] as string) || 'Asia/Riyadh',
  };
}

/**
 * GET /api/reports/definitions
 * List report definitions.
 */
reportRouter.get('/definitions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildContextFromRequest(req);
    const reports = await reportRepository.getReportDefinitions(context.tenantId);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});

/**
 * GET /api/reports/definitions/:id
 * Get single report definition.
 */
reportRouter.get('/definitions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await reportRepository.getReportDefinitionById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report definition not found' } });
    }
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});

/**
 * POST /api/reports/definitions
 * Create report definition.
 */
reportRouter.post('/definitions', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildContextFromRequest(req);
    const payload = req.body;
    if (!payload.nameEn || !payload.resource || !payload.metricIds || payload.metricIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Missing required report fields (nameEn, resource, metricIds).' },
      });
    }

    const created = await reportRepository.createReportDefinition(
      payload,
      context.userId,
      context.tenantId,
      context.companyId,
      context.branchId
    );

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});

/**
 * POST /api/reports/execute
 * Execute report.
 */
reportRouter.post('/execute', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildContextFromRequest(req);
    const { reportDefinitionId, reportDefinition, parameterValues } = req.body;

    const result = await reportExecutionService.executeReport({
      reportDefinitionId,
      reportDefinition,
      parameterValues,
      context,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err instanceof AnalyticsError) {
      const statusCode = err.code === 'ANALYTICS_PERMISSION_REQUIRED' ? 403 : 400;
      return res.status(statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    res.status(500).json({ success: false, error: { code: 'REPORT_EXECUTION_FAILED', message: err.message } });
  }
});

/**
 * GET /api/reports/schedules
 * List scheduled reports.
 */
reportRouter.get('/schedules', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildContextFromRequest(req);
    const schedules = await reportRepository.getScheduledReports(context.tenantId);
    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});

/**
 * POST /api/reports/schedules
 * Create scheduled report definition.
 */
reportRouter.post('/schedules', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const context = buildContextFromRequest(req);
    const payload = req.body;
    if (!payload.reportDefinitionId || !payload.nameEn || !payload.frequency) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Missing required schedule fields (reportDefinitionId, nameEn, frequency).' },
      });
    }

    const created = await reportRepository.createScheduledReport(
      payload,
      context.userId,
      context.tenantId,
      context.companyId
    );

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});

/**
 * PATCH /api/reports/schedules/:id
 * Toggle active state for scheduled report.
 */
reportRouter.patch('/schedules/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PAYLOAD', message: 'Active field must be boolean' } });
    }
    const updated = await reportRepository.updateScheduledReportActive(req.params.id, active);
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }
    res.json({ success: true, message: 'Schedule status updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});
