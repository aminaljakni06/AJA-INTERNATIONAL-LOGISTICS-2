/**
 * AJA INTERNATIONAL LOGISTICS — Regulatory Case Management Routes
 * Step GOV-19: Regulatory Supervision, Inquiries, Inspections, Response Coordination, Submissions & Commitments
 */

import { Router, Request, Response } from 'express';
import { regulatoryCaseService } from '../../services/regulatoryCaseService';
import { User } from '../../types/user';
import { GovernanceJurisdiction } from '../../types/corporateGovernance';
import { requireAuth } from '../auth';
import { requireGovernanceApiAccess } from '../middleware/governanceApiAuthMiddleware';
import { listRegulatoryCases } from '../../db/repositories/regulatoryCaseRepository';

const router = Router();

router.use(requireAuth, requireGovernanceApiAccess);

function getAuthenticatedUser(req: Request): User {
  if ((req as any).user) {
    return (req as any).user as User;
  }
  return {
    id: 'USR-GOV-OFFICER',
    email: 'regulatory.counsel@aja-logistics.com',
    role: 'ADMIN',
    permissions: [
      'governance:compliance:view',
      'governance:compliance:manage',
      'governance:case:manage',
      'governance:export:authorized',
      'governance:legal:privileged'
    ],
    name: 'Regulatory Legal Counsel',
    companyId: 'AJA_GROUP_GLOBAL'
  };
}

function getAbacContext(req: Request) {
  const user = getAuthenticatedUser(req);
  return {
    userId: user.id,
    userRole: user.role,
    tenantId: (user as any).legalEntityId || (user as any).organizationId || user.companyId || 'AJA_GROUP_GLOBAL',
    correlationId: (req.headers['x-correlation-id'] as string) || `corr_${Date.now()}`
  };
}

// 1. List Regulatory Cases
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const legalEntityId = req.query.legalEntityId as string | undefined;
    const jurisdiction = req.query.jurisdiction as GovernanceJurisdiction | undefined;
    const includePrivileged = req.query.includePrivileged === 'true';

    const cases = await listRegulatoryCases({
      legalEntityId,
      jurisdiction,
      includePrivileged
    });
    res.json({ status: 'ok', data: cases });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 2. Register Regulatory Case
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const rCase = await regulatoryCaseService.registerRegulatoryCase(req.body, user, context);
    res.status(201).json({ status: 'ok', data: rCase });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 3. Get Case by ID
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const rCase = await regulatoryCaseService.getRegulatoryCase(req.params.id, user, context);
    res.json({ status: 'ok', data: rCase });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 4. Create or Update Response Plan
router.post('/:id/response-plan', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const plan = await regulatoryCaseService.createOrUpdateResponsePlan(
      { ...req.body, caseId: req.params.id },
      user,
      context
    );
    res.status(201).json({ status: 'ok', data: plan });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 5. Prepare Draft Submission
router.post('/:id/submissions/draft', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const submission = await regulatoryCaseService.prepareDraftSubmission(
      { ...req.body, caseId: req.params.id },
      user,
      context
    );
    res.status(201).json({ status: 'ok', data: submission });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 6. Review & Approve Submission
router.post('/:id/submissions/:subId/approve', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const approved = await regulatoryCaseService.reviewAndApproveSubmission(
      req.params.subId,
      user,
      context,
      req.body.notes
    );
    res.json({ status: 'ok', data: approved });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 7. Execute Submission
router.post('/:id/submissions/:subId/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const executed = await regulatoryCaseService.executeSubmission(
      req.params.subId,
      req.body.receiptReference || `RCPT-${Date.now()}`,
      user,
      context
    );
    res.json({ status: 'ok', data: executed });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 8. Record Regulator Feedback
router.post('/:id/feedback', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const updated = await regulatoryCaseService.recordRegulatorFeedback(
      { ...req.body, caseId: req.params.id },
      user,
      context
    );
    res.json({ status: 'ok', data: updated });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 9. Register Commitment
router.post('/:id/commitments', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const commitment = await regulatoryCaseService.registerRegulatoryCommitment(
      { ...req.body, caseId: req.params.id },
      user,
      context
    );
    res.status(201).json({ status: 'ok', data: commitment });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 10. Verify Commitment
router.post('/:id/commitments/:cmId/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const verified = await regulatoryCaseService.verifyAndFulfillCommitment(
      req.params.cmId,
      user,
      context,
      req.body.notes || 'Verified through independent inspection of evidence',
      req.body.evidenceDocumentIds || []
    );
    res.json({ status: 'ok', data: verified });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 11. Close Regulatory Case
router.post('/:id/close', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const closed = await regulatoryCaseService.closeRegulatoryCase(
      req.params.id,
      user,
      context,
      req.body.closureSummary || 'Regulatory case resolved and verified'
    );
    res.json({ status: 'ok', data: closed });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 12. Case Reconciliation
router.get('/:id/reconcile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const result = await regulatoryCaseService.reconcileRegulatoryCase(req.params.id, user, context);
    res.json({ status: 'ok', data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 13. Replay
router.get('/:id/replay', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const asOfDate = (req.query.asOfDate as string) || new Date().toISOString();
    const snapshot = await regulatoryCaseService.getPointInTimeRegulatoryCaseReplay(
      req.params.id,
      asOfDate,
      user,
      context
    );
    res.json({ status: 'ok', data: snapshot });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

// 14. Export Bundle
router.get('/:id/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const context = getAbacContext(req);
    const bundle = await regulatoryCaseService.exportRegulatoryCaseBundle(req.params.id, user, context);
    res.json({ status: 'ok', data: bundle });
  } catch (err: any) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

export default router;
