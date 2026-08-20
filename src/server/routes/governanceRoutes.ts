import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { GovernanceService } from '../../services/governanceService';
import { listAllLifecycleEvents, listMoverRequests, listAccessCampaigns, listAccessDecisions, listRoleRequests, listDelegatedAdmins, listSoDRules, listSoDViolations, saveSoDRule } from '../../db/repositories/governanceRepository';

const router = Router();

// --- 1. USER LIFECYCLE ROUTES ---

// GET /api/governance/lifecycle/events
router.get('/lifecycle/events', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const events = await listAllLifecycleEvents();
    res.json(events);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch lifecycle events';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/lifecycle/joiner
router.post('/lifecycle/joiner', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const { targetUserId, onboardingData } = req.body;

    if (!targetUserId || !onboardingData || !onboardingData.role) {
      res.status(400).json({ error: 'targetUserId and onboardingData.role are required' });
      return;
    }

    const event = await GovernanceService.executeJoinerOnboarding(targetUserId, onboardingData, actorUserId);
    res.json(event);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to execute joiner onboarding';
    res.status(500).json({ error: msg });
  }
});

// GET /api/governance/lifecycle/mover
router.get('/lifecycle/mover', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await listMoverRequests();
    res.json(requests);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch mover requests';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/lifecycle/mover/request
router.post('/lifecycle/mover/request', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const moverReqData = req.body;
    const result = await GovernanceService.submitMoverRequest(moverReqData, actorUserId);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit mover request';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/lifecycle/mover/approve
router.post('/lifecycle/mover/approve', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const { moverId } = req.body;
    if (!moverId) {
      res.status(400).json({ error: 'moverId is required' });
      return;
    }
    const result = await GovernanceService.approveMoverRequest(moverId, actorUserId);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to approve mover request';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/lifecycle/leaver
router.post('/lifecycle/leaver', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const { targetUserId, reason } = req.body;
    if (!targetUserId) {
      res.status(400).json({ error: 'targetUserId is required' });
      return;
    }

    const checklist = await GovernanceService.executeLeaverOffboarding(targetUserId, reason || 'Offboarded', actorUserId);
    res.json(checklist);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to execute leaver offboarding';
    res.status(500).json({ error: msg });
  }
});

// --- 2. ACCESS CERTIFICATION ROUTES ---

// GET /api/governance/access-review/campaigns
router.get('/access-review/campaigns', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const campaigns = await listAccessCampaigns();
    res.json(campaigns);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch access campaigns';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/access-review/campaigns
router.post('/access-review/campaigns', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const { name, type, durationDays } = req.body;
    const campaign = await GovernanceService.createAccessCampaign(name, type, actorUserId, 'System Admin', durationDays || 30);
    res.json(campaign);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create access campaign';
    res.status(500).json({ error: msg });
  }
});

// GET /api/governance/access-review/decisions/:campaignId
router.get('/access-review/decisions/:campaignId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;
    const decisions = await listAccessDecisions(campaignId);
    res.json(decisions);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch access decisions';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/access-review/decision
router.post('/access-review/decision', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewerId = req.user!.userId;
    const { campaignId, userId, userName, role, permissionOrAccess, status, comments } = req.body;
    const decision = await GovernanceService.recordAccessDecision(
      campaignId, userId, userName, role, permissionOrAccess, status, reviewerId, comments
    );
    res.json(decision);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record decision';
    res.status(500).json({ error: msg });
  }
});

// --- 3. ROLE GOVERNANCE ROUTES ---

// GET /api/governance/role-governance/requests
router.get('/role-governance/requests', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await listRoleRequests();
    res.json(requests);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch role requests';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/role-governance/requests
router.post('/role-governance/requests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requesterId = req.user!.userId;
    const roleReqData = req.body;
    const roleReq = await GovernanceService.requestRoleChange(roleReqData, requesterId);
    res.json(roleReq);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit role request';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/role-governance/approve
router.post('/role-governance/approve', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approverId = req.user!.userId;
    const { requestId } = req.body;
    const roleReq = await GovernanceService.approveRoleRequest(requestId, approverId);
    res.json(roleReq);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to approve role request';
    res.status(500).json({ error: msg });
  }
});

// --- 4. DELEGATED ADMINISTRATION ROUTES ---

// GET /api/governance/delegated-admins
router.get('/delegated-admins', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const admins = await listDelegatedAdmins();
    res.json(admins);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch delegated admins';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/delegated-admins
router.post('/delegated-admins', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const { adminUserId, adminUserName, scopeType, scopeId, scopeName, durationDays } = req.body;
    const record = await GovernanceService.assignDelegatedAdmin(
      adminUserId, adminUserName, scopeType, scopeId, scopeName, actorUserId, durationDays
    );
    res.json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to assign delegated admin';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/governance/delegated-admins/:id
router.delete('/delegated-admins/:id', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user!.userId;
    const { id } = req.params;
    const success = await GovernanceService.revokeDelegatedAdmin(id, actorUserId);
    res.json({ success });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke delegated admin';
    res.status(500).json({ error: msg });
  }
});

// --- 5. SEPARATION OF DUTIES (SoD) ROUTES ---

// GET /api/governance/sod/rules
router.get('/sod/rules', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rules = await listSoDRules();
    res.json(rules);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch SoD rules';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/sod/rules
router.post('/sod/rules', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rule = req.body;
    if (!rule.id) rule.id = `sod_${Date.now()}`;
    if (!rule.createdAt) rule.createdAt = new Date().toISOString();
    const saved = await saveSoDRule(rule);
    res.json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save SoD rule';
    res.status(500).json({ error: msg });
  }
});

// GET /api/governance/sod/violations
router.get('/sod/violations', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const violations = await listSoDViolations();
    res.json(violations);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch SoD violations';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/sod/check
router.post('/sod/check', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userName = req.user!.email || 'User';
    const { attemptedRoleOrAction } = req.body;
    const result = await GovernanceService.evaluateSoDCheck(userId, userName, attemptedRoleOrAction);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to evaluate SoD check';
    res.status(500).json({ error: msg });
  }
});

// --- 6. GOVERNANCE ANALYTICS ROUTE ---

// GET /api/governance/analytics
router.get('/analytics', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await GovernanceService.getGovernanceAnalytics();
    res.json(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch governance analytics';
    res.status(500).json({ error: msg });
  }
});

export default router;
