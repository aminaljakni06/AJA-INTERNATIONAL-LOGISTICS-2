import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import { WorkflowService } from '../../services/workflowService';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/workflow/templates
 * List all available workflow templates
 */
router.get('/templates', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const templates = WorkflowService.listTemplates(category as any);
    res.json({ success: true, count: templates.length, templates });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list templates' });
  }
});

/**
 * GET /api/workflow/tasks
 * List pending workflow tasks for user or role
 */
router.get('/tasks', (req: Request, res: Response) => {
  try {
    const { userId, role, departmentId, branchId } = req.query;
    const tasks = WorkflowService.getPendingTasks({
      userId: userId as string,
      role: role as string,
      departmentId: departmentId as string,
      branchId: branchId as string,
    });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list tasks' });
  }
});

/**
 * GET /api/workflow/instances/:id
 * Get workflow instance details
 */
router.get('/instances/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instance = WorkflowService.getInstance(id);
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }
    res.json({ success: true, instance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch instance' });
  }
});

/**
 * POST /api/workflow/start
 * Initiate a new workflow instance
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const {
      templateCode,
      entityType,
      entityId,
      title,
      companyId,
      branchId,
      departmentId,
      initiatedByUserId,
      initiatedByUserName,
      priority,
      metadata,
    } = req.body;

    if (!templateCode || !entityType || !entityId || !title || !initiatedByUserId) {
      return res.status(400).json({
        error: 'Missing required fields: templateCode, entityType, entityId, title, initiatedByUserId',
      });
    }

    const result = await WorkflowService.startWorkflow({
      templateCode,
      entityType,
      entityId,
      title,
      companyId,
      branchId,
      departmentId,
      initiatedByUserId,
      initiatedByUserName,
      priority,
      metadata,
    });

    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to start workflow' });
  }
});

/**
 * POST /api/workflow/transition
 * Advance workflow state (Approve / Reject / Delegate)
 */
router.post('/transition', async (req: Request, res: Response) => {
  try {
    const { instanceId, action, userId, userName, userRole, comments, targetUserId, targetRole } = req.body;

    if (!instanceId || !action || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: instanceId, action, userId',
      });
    }

    const result = await WorkflowService.transitionWorkflow({
      instanceId,
      action,
      userId,
      userName,
      userRole,
      comments,
      targetUserId,
      targetRole,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to transition workflow' });
  }
});

/**
 * POST /api/workflow/sla/check
 * Trigger SLA evaluation
 */
router.post('/sla/check', (_req: Request, res: Response) => {
  try {
    const stats = WorkflowService.runSLACheck();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to run SLA check' });
  }
});

export default router;
