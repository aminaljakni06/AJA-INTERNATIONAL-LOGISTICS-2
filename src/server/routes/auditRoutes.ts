import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { listAuditLogs } from '../../db/repositories/auditLogRepository';
import { AuditService } from '../../services/auditService';

const router = Router();

// GET /api/audit-logs - Admin view system audit logs
router.get('/', requireAuth, requireRoles('ADMIN', 'OPERATIONS_MANAGER', 'AUDITOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { module, action, severity, userId, entityType, searchQuery, limit } = req.query;

    const filtered = AuditService.getAuditLogs({
      module: module as string,
      action: action as any,
      severity: severity as any,
      userId: userId as string,
      entityType: entityType as string,
      searchQuery: searchQuery as string,
      limit: limit ? parseInt(limit as string, 10) : 100,
    });

    if (filtered.length > 0) {
      return res.json(filtered);
    }

    // Fallback to repository
    const logs = await listAuditLogs(limit ? parseInt(limit as string, 10) : 100);
    return res.json(logs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching audit logs';
    return res.status(500).json({ error: msg });
  }
});

// GET /api/audit-logs/activity - View activity timeline logs
router.get('/activity', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = req.query.category as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = AuditService.getActivityLogs(category, limit);
    res.json(logs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching activity logs';
    res.status(500).json({ error: msg });
  }
});

// GET /api/audit-logs/sessions - View active user sessions
router.get('/sessions', requireAuth, requireRoles('ADMIN', 'OPERATIONS_MANAGER', 'AUDITOR'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = AuditService.getActiveSessions();
    res.json(sessions);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching active sessions';
    res.status(500).json({ error: msg });
  }
});

// GET /api/audit-logs/health - Get system health diagnostics
router.get('/health', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const health = await AuditService.getSystemHealth();
    res.json(health);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error checking system health';
    res.status(500).json({ error: msg });
  }
});

// GET /api/audit-logs/metrics - Get APM and AI performance metrics
router.get('/metrics', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const performance = AuditService.getPerformanceSummary();
    const aiTelemetry = AuditService.getAITelemetrySummary();
    res.json({ performance, aiTelemetry });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching metrics';
    res.status(500).json({ error: msg });
  }
});

// GET /api/audit-logs/errors - Get tracked exceptions
router.get('/errors', requireAuth, requireRoles('ADMIN', 'OPERATIONS_MANAGER'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const unresolvedOnly = req.query.unresolved === 'true';
    const errors = AuditService.getErrorLogs(unresolvedOnly);
    res.json(errors);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching error logs';
    res.status(500).json({ error: msg });
  }
});

// GET /api/audit-logs/entity-history/:entityType/:entityId - Get entity version changes
router.get('/entity-history/:entityType/:entityId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const history = AuditService.getEntityHistory(entityType, entityId);
    res.json(history);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching entity history';
    res.status(500).json({ error: msg });
  }
});

// POST /api/audit-logs/log - Record audit event
router.post('/log', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const record = await AuditService.logAudit({
      ...req.body,
      actorId: user?.userId || 'anonymous',
      actorEmail: user?.email,
      actorRole: user?.role,
    });
    res.status(201).json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error recording audit event';
    res.status(500).json({ error: msg });
  }
});

export default router;
