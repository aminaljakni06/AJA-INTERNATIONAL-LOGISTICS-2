/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Corporate Governance Server Routes
 * Step GOV-05: Corporate Governance Core, Legal Profile, Directors, Officers & PSC Implementation
 * 
 * Endpoints:
 * - GET  /api/corporate-governance/profiles/:entityId
 * - PUT  /api/corporate-governance/profiles/:entityId
 * - GET  /api/corporate-governance/appointments
 * - POST /api/corporate-governance/appointments
 * - POST /api/corporate-governance/appointments/:id/transition
 * - GET  /api/corporate-governance/psc
 * - POST /api/corporate-governance/psc
 * - DELETE /api/corporate-governance/:type/:id (Prohibited Hard Delete check)
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { requireGovernanceApiAccess } from '../middleware/governanceApiAuthMiddleware';
import { CorporateGovernanceService } from '../../services/corporateGovernanceService';
import { GovernanceDecisionIntelligenceService } from '../../services/governanceDecisionIntelligenceService';
import { GovernanceRecordStatus } from '../../types/corporateGovernance';
import {
  listGovernanceAnalyticsSnapshotsByEntity,
  listGovernanceScenarioDefinitionsByEntity,
  listGovernanceSimulationRunsByEntity,
  listGovernanceDecisionIntelligenceByEntity,
  listBoardAdvisoryBriefsByEntity
} from '../../db/repositories/governanceAnalyticsRepository';

const router = Router();

router.use(requireAuth, requireGovernanceApiAccess);

// ============================================================================
// 1. CORPORATE LEGAL PROFILE ROUTES
// ============================================================================

// GET /api/corporate-governance/profiles/:entityId
router.get('/profiles/:entityId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { entityId } = req.params;

    const profile = await CorporateGovernanceService.getLegalProfile(entityId, {
      principal: user,
      correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
    });

    if (!profile) {
      res.status(404).json({ error: `Corporate legal profile for entity ${entityId} not found` });
      return;
    }

    res.json(profile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve corporate legal profile';
    const status = msg.includes('Access Denied') ? 403 : 500;
    res.status(status).json({ error: msg });
  }
});

// PUT /api/corporate-governance/profiles/:entityId
router.put('/profiles/:entityId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { entityId } = req.params;
    const payload = req.body;

    const updated = await CorporateGovernanceService.updateLegalProfile(
      { ...payload, legalEntityId: entityId },
      {
        principal: user,
        correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
      }
    );

    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update corporate legal profile';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 2. DIRECTORS & OFFICERS CORPORATE APPOINTMENT ROUTES
// ============================================================================

// GET /api/corporate-governance/appointments
router.get('/appointments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    const status = req.query.status as GovernanceRecordStatus | undefined;

    if (!legalEntityId) {
      res.status(400).json({ error: 'Query parameter legalEntityId is required' });
      return;
    }

    const appointments = await CorporateGovernanceService.listAppointments(legalEntityId, status, {
      principal: user,
      correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
    });

    res.json(appointments);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve corporate appointments';
    const status = msg.includes('Access Denied') ? 403 : 500;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-governance/appointments
router.post('/appointments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const payload = req.body;

    const created = await CorporateGovernanceService.createAppointment(payload, {
      principal: user,
      correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
    });

    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create corporate appointment';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-governance/appointments/:id/transition
router.post('/appointments/:id/transition', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { newStatus, reason, supportingDecisionId } = req.body;

    if (!newStatus) {
      res.status(400).json({ error: 'newStatus is required in request body' });
      return;
    }

    const transitioned = await CorporateGovernanceService.transitionAppointmentStatus(
      id,
      newStatus,
      reason || 'Routine Governance Lifecycle Transition',
      {
        principal: user,
        correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
      },
      supportingDecisionId
    );

    res.json(transitioned);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to transition appointment status';
    const status = msg.includes('Access Denied') || msg.includes('Separation of Duties') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 3. PSC / BENEFICIAL CONTROL REGISTRY ROUTES
// ============================================================================

// GET /api/corporate-governance/psc
router.get('/psc', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    const status = req.query.status as GovernanceRecordStatus | undefined;

    if (!legalEntityId) {
      res.status(400).json({ error: 'Query parameter legalEntityId is required' });
      return;
    }

    const pscRecords = await CorporateGovernanceService.listPSCRecords(legalEntityId, status, {
      principal: user,
      correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
    });

    res.json(pscRecords);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve PSC records';
    const status = msg.includes('Access Denied') ? 403 : 500;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-governance/psc
router.post('/psc', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const payload = req.body;

    const saved = await CorporateGovernanceService.savePSCRecord(payload, {
      principal: user,
      correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
    });

    res.status(201).json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save PSC record';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 4. PROHIBITED HARD-DELETE ENFORCEMENT ROUTE
// ============================================================================

// DELETE /api/corporate-governance/:type/:id
router.delete('/:type/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { type, id } = req.params;

    const recordType = (type.toUpperCase() === 'PSC' ? 'PSC' : type.toUpperCase() === 'APPOINTMENT' ? 'APPOINTMENT' : 'PROFILE') as 'PROFILE' | 'APPOINTMENT' | 'PSC';

    await CorporateGovernanceService.deleteRecord(recordType, id, {
      principal: user,
      correlationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`
    });

    res.status(204).send();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Prohibited operation';
    res.status(405).json({ error: msg });
  }
});

// ============================================================================
// 5. STEP GOV-17: GOVERNANCE ANALYTICS & DECISION INTELLIGENCE ROUTES
// ============================================================================

// POST /api/corporate-governance/analytics/snapshots
router.get('/analytics/snapshots', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    if (!legalEntityId) {
      res.status(400).json({ error: 'legalEntityId query param is required' });
      return;
    }
    const snapshots = await listGovernanceAnalyticsSnapshotsByEntity(legalEntityId);
    res.json(snapshots);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve analytics snapshots';
    res.status(500).json({ error: msg });
  }
});

router.post('/analytics/snapshots', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { legalEntityId, jurisdiction, reportingPeriod, policyVersionId, historicalAsOfDate } = req.body;
    const snapshot = await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
      legalEntityId || user.legalEntityId,
      jurisdiction || 'SA',
      reportingPeriod || '2026-Q1',
      policyVersionId,
      user,
      { historicalAsOfDate }
    );
    res.status(201).json(snapshot);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate analytics snapshot';
    const status = msg.includes('Access Denied') || msg.includes('Isolation') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// GET & POST /api/corporate-governance/scenarios
router.get('/scenarios', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    if (!legalEntityId) {
      res.status(400).json({ error: 'legalEntityId query param is required' });
      return;
    }
    const scenarios = await listGovernanceScenarioDefinitionsByEntity(legalEntityId);
    res.json(scenarios);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve scenarios';
    res.status(500).json({ error: msg });
  }
});

router.post('/scenarios', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const scenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(req.body, user);
    res.status(201).json(scenario);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create scenario';
    const status = msg.includes('Access Denied') || msg.includes('Isolation') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-governance/scenarios/:id/supersede
router.post('/scenarios/:id/supersede', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { updatedAssumptions, reason } = req.body;
    const newVer = await GovernanceDecisionIntelligenceService.createNewScenarioVersion(id, updatedAssumptions, reason || 'Updated assumptions', user);
    res.status(201).json(newVer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to supersede scenario';
    res.status(400).json({ error: msg });
  }
});

// GET & POST /api/corporate-governance/simulations
router.get('/simulations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    if (!legalEntityId) {
      res.status(400).json({ error: 'legalEntityId query param is required' });
      return;
    }
    const simulations = await listGovernanceSimulationRunsByEntity(legalEntityId);
    res.json(simulations);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve simulations';
    res.status(500).json({ error: msg });
  }
});

router.post('/simulations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { scenarioDefinitionId, sourceSnapshotId, calculationMethodVersion } = req.body;
    const simulation = await GovernanceDecisionIntelligenceService.runSimulation(
      scenarioDefinitionId,
      sourceSnapshotId,
      user,
      { calculationMethodVersion }
    );
    res.status(201).json(simulation);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to execute simulation';
    res.status(400).json({ error: msg });
  }
});

// POST /api/corporate-governance/simulations/:id/finalize
router.post('/simulations/:id/finalize', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const finalized = await GovernanceDecisionIntelligenceService.finalizeSimulationRun(id, user);
    res.json(finalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to finalize simulation';
    res.status(400).json({ error: msg });
  }
});

// GET & POST /api/corporate-governance/decision-intelligence
router.get('/decision-intelligence', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    if (!legalEntityId) {
      res.status(400).json({ error: 'legalEntityId query param is required' });
      return;
    }
    const list = await listGovernanceDecisionIntelligenceByEntity(legalEntityId);
    res.json(list);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve decision intelligence';
    res.status(500).json({ error: msg });
  }
});

router.post('/decision-intelligence', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const record = await GovernanceDecisionIntelligenceService.generateDecisionIntelligence(req.body, user);
    res.status(201).json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate decision intelligence';
    res.status(400).json({ error: msg });
  }
});

// POST /api/corporate-governance/board-advisory-briefs
router.get('/board-advisory-briefs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    if (!legalEntityId) {
      res.status(400).json({ error: 'legalEntityId query param is required' });
      return;
    }
    const briefs = await listBoardAdvisoryBriefsByEntity(legalEntityId);
    res.json(briefs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve board advisory briefs';
    res.status(500).json({ error: msg });
  }
});

router.post('/board-advisory-briefs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const brief = await GovernanceDecisionIntelligenceService.generateBoardAdvisoryBrief(req.body, user);
    res.status(201).json(brief);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate board advisory brief';
    res.status(400).json({ error: msg });
  }
});

// GET /api/corporate-governance/executive-insights
router.get('/executive-insights', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const legalEntityId = (req.query.legalEntityId as string) || user.legalEntityId || user.companyId;
    const jurisdiction = (req.query.jurisdiction as any) || 'SA';
    const insights = await GovernanceDecisionIntelligenceService.getExecutiveDeskInsights(legalEntityId, jurisdiction, user);
    res.json(insights);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve executive insights';
    res.status(500).json({ error: msg });
  }
});

// POST /api/corporate-governance/analytics/export
router.post('/analytics/export', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { legalEntityId } = req.body;
    const exportResult = GovernanceDecisionIntelligenceService.exportAnalyticsData(legalEntityId || user.legalEntityId, user);
    res.json(exportResult);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to export analytics data';
    const status = msg.includes('Denied') || msg.includes('Isolation') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

export default router;
