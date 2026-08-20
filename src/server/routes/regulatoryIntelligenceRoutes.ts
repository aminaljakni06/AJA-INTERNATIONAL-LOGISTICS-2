/**
 * AJA INTERNATIONAL LOGISTICS — Regulatory Intelligence Routes
 * Step GOV-18: Regulatory Source Registry, Change Intelligence, Impact Assessment & Adoption API Endpoints
 */

import { Router, Request, Response } from 'express';
import { RegulatoryIntelligenceService } from '../../services/regulatoryIntelligenceService';
import { User } from '../../types/user';
import { GovernanceJurisdiction } from '../../types/corporateGovernance';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { requireGovernanceApiAccess } from '../middleware/governanceApiAuthMiddleware';

const router = Router();

router.use(requireAuth, requireGovernanceApiAccess);

// Helper to extract or fallback user
function getAuthenticatedUser(req: Request): User {
  if ((req as any).user) {
    return (req as any).user as User;
  }
  // Default system fallback for administrative/system calls
  return {
    id: 'USR-GOV-ADMIN',
    email: 'compliance.officer@aja-logistics.com',
    role: 'ADMIN',
    permissions: [
      'governance:compliance:view',
      'governance:compliance:manage',
      'governance:decision:create',
      'governance:secretariat:manage',
      'governance:export:authorized',
      'governance:legal:privileged'
    ],
    name: 'Chief Compliance Officer',
    companyId: 'AJA_GROUP_GLOBAL'
  };
}

// 1. List Regulatory Sources
router.get('/sources', requireAuth, async (req: Request, res: Response) => {
  try {
    const jurisdiction = req.query.jurisdiction as GovernanceJurisdiction | undefined;
    const sources = await RegulatoryIntelligenceService.queryRegulatoryChanges(getAuthenticatedUser(req), {
      jurisdiction
    });
    res.json({ status: 'ok', data: sources });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 2. Register Regulatory Source
router.post('/sources', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const source = await RegulatoryIntelligenceService.registerRegulatorySource(user, req.body);
    res.status(201).json({ status: 'ok', data: source });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 3. Verify Regulatory Source
router.post('/sources/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const source = await RegulatoryIntelligenceService.verifyRegulatorySource(user, req.body);
    res.json({ status: 'ok', data: source });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 4. Query Regulatory Changes
router.get('/changes', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const jurisdiction = req.query.jurisdiction as GovernanceJurisdiction | undefined;
    const legalEntityId = req.query.legalEntityId as string | undefined;
    const isExport = req.query.export === 'true';

    const changes = await RegulatoryIntelligenceService.queryRegulatoryChanges(user, {
      jurisdiction,
      legalEntityId,
      isExport
    });
    res.json({ status: 'ok', data: changes });
  } catch (err: any) {
    res.status(err.status || 403).json({ error: err.message });
  }
});

// 5. Ingest Regulatory Change
router.post('/changes', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(user, req.body);
    res.status(201).json({ status: 'ok', data: change });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 6. Assess Applicability
router.post('/applicability', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const result = await RegulatoryIntelligenceService.assessApplicability(user, req.body);
    res.json({ status: 'ok', data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 7. Perform Impact Assessment
router.post('/impact-assessment', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const assessment = await RegulatoryIntelligenceService.performImpactAssessment(user, req.body);
    res.status(201).json({ status: 'ok', data: assessment });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 8. Complete Legal Review
router.post('/impact-assessment/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const assessment = await RegulatoryIntelligenceService.completeLegalReview(user, req.body);
    res.json({ status: 'ok', data: assessment });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 9. Create Adoption Plan
router.post('/adoption-plans', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const plan = await RegulatoryIntelligenceService.createAdoptionPlan(user, req.body);
    res.status(201).json({ status: 'ok', data: plan });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 10. Route Adoption to GOV-06
router.post('/adoption-plans/route-approval', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const plan = await RegulatoryIntelligenceService.routeToGovernanceApproval(user, req.body.adoptionPlanId);
    res.json({ status: 'ok', data: plan });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 11. Execute Approved Adoption
router.post('/adoption-plans/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const plan = await RegulatoryIntelligenceService.executeApprovedAdoption(user, req.body);
    res.json({ status: 'ok', data: plan });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 12. Verify Adoption Implementation
router.post('/adoption-plans/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const plan = await RegulatoryIntelligenceService.verifyAdoptionImplementation(user, req.body);
    res.json({ status: 'ok', data: plan });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 13. Reconcile Regulatory State
router.get('/reconcile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const changeId = req.query.changeId as string;
    const legalEntityId = req.query.legalEntityId as string;
    const result = await RegulatoryIntelligenceService.reconcileRegulatoryState(user, changeId, legalEntityId);
    res.json({ status: 'ok', data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 14. Point-in-Time Regulatory Replay
router.get('/replay', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const asOfDate = req.query.asOfDate as string;
    const legalEntityId = req.query.legalEntityId as string;
    const jurisdiction = req.query.jurisdiction as GovernanceJurisdiction;
    const snapshot = await RegulatoryIntelligenceService.pointInTimeRegulatoryReplay(user, asOfDate, legalEntityId, jurisdiction);
    res.json({ status: 'ok', data: snapshot });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

export default router;
