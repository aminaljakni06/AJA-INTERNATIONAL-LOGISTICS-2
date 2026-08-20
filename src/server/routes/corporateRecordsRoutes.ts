/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Corporate Records & Evidence Vault Routes
 * Step GOV-09: Corporate Records, Statutory Registers, Document Versioning & Evidence Vault
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { requireGovernanceApiAccess } from '../middleware/governanceApiAuthMiddleware';
import { CorporateRecordsService } from '../../services/corporateRecordsService';
import { CorporateRecordType, StatutoryRegisterType } from '../../types/corporateGovernance';
import { ABACUser } from '../../lib/permissions/abacEngine';

const router = Router();

router.use(requireAuth, requireGovernanceApiAccess);

function getABACUser(req: AuthenticatedRequest): ABACUser {
  const user = req.user as any;
  return {
    userId: user.userId || user.uid || 'usr_anonymous',
    role: user.role || 'GUEST',
    companyId: user.companyId || user.organizationId,
    legalEntityId: user.legalEntityId || user.companyId,
    clearanceLevel: user.clearanceLevel || (['CEO', 'CFO'].includes(user.role) ? 'RESTRICTED' : user.role === 'AUDITOR' ? 'CONFIDENTIAL' : 'INTERNAL'),
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    customPermissions: Array.isArray(user.customPermissions) ? user.customPermissions : [],
  };
}

// ============================================================================
// 1. CORPORATE STATUTORY RECORDS ROUTES
// ============================================================================

// POST /api/corporate-records
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const payload = req.body;

    const record = await CorporateRecordsService.createCorporateRecord(actor, {
      ...payload,
      legalEntityId: payload.legalEntityId || actor.legalEntityId,
      auditCorrelationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`,
    });

    res.status(201).json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create corporate record';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// GET /api/corporate-records/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;

    const record = await CorporateRecordsService.getCorporateRecord(actor, id);
    res.json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch corporate record';
    const status = msg.includes('Access Denied') ? 403 : msg.includes('not found') ? 404 : 500;
    res.status(status).json({ error: msg });
  }
});

// GET /api/corporate-records
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const legalEntityId = (req.query.legalEntityId as string) || actor.legalEntityId;

    if (!legalEntityId) {
      res.status(400).json({ error: 'Query parameter legalEntityId is required' });
      return;
    }

    const filter = {
      recordType: req.query.recordType as CorporateRecordType | undefined,
      recordStatus: req.query.recordStatus as string | undefined,
    };

    const records = await CorporateRecordsService.listCorporateRecords(actor, legalEntityId, filter);
    res.json(records);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list corporate records';
    const status = msg.includes('Access Denied') ? 403 : 500;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-records/:id/supersede
router.post('/:id/supersede', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;
    const newRecordData = req.body;

    const result = await CorporateRecordsService.supersedeCorporateRecord(actor, id, newRecordData);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to supersede corporate record';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-records/:id/invalidate
router.post('/:id/invalidate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;
    const { reason, replacementRecordId } = req.body;

    const result = await CorporateRecordsService.invalidateCorporateRecord(actor, id, reason, replacementRecordId);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to invalidate corporate record';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// DELETE /api/corporate-records/:id (Prohibited Hard Delete)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;

    await CorporateRecordsService.deleteCorporateRecord(actor, id);
    res.status(204).send();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Hard delete prohibited';
    res.status(405).json({ error: msg });
  }
});

// GET /api/corporate-records/:id/disposition-check
router.get('/:id/disposition-check', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await CorporateRecordsService.evaluateDispositionEligibility(id);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to evaluate disposition';
    res.status(400).json({ error: msg });
  }
});

// ============================================================================
// 2. EVIDENCE VAULT ROUTES
// ============================================================================

// POST /api/corporate-records/evidence
router.post('/evidence/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const payload = req.body;

    const evidence = await CorporateRecordsService.submitEvidence(actor, {
      ...payload,
      auditCorrelationId: (req.headers['x-correlation-id'] as string) || `cor_${Date.now()}`,
    });

    res.status(201).json(evidence);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit evidence';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-records/evidence/:id/verify
router.post('/evidence/:id/verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;
    const { notes, verificationMethod } = req.body;

    const verified = await CorporateRecordsService.verifyEvidence(actor, id, notes, verificationMethod);
    res.json(verified);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to verify evidence';
    const status = msg.includes('Access Denied') || msg.includes('Separation of Duties') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-records/evidence/:id/invalidate
router.post('/evidence/:id/invalidate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;
    const { reason, replacementEvidenceId } = req.body;

    const invalidated = await CorporateRecordsService.invalidateEvidence(actor, id, reason, replacementEvidenceId);
    res.json(invalidated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to invalidate evidence';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// GET /api/corporate-records/evidence/:id/download
router.get('/evidence/:id/download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;

    const downloadInfo = await CorporateRecordsService.requestEvidenceDownload(actor, id);
    res.json(downloadInfo);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to obtain download ticket';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 3. STATUTORY REGISTERS & PROJECTIONS ROUTES
// ============================================================================

// GET /api/corporate-records/registers/:entityId/:registerType
router.get('/registers/:entityId/:registerType', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { entityId, registerType } = req.params;

    const projection = await CorporateRecordsService.getStatutoryRegisterProjection(
      actor,
      entityId,
      registerType.toUpperCase() as StatutoryRegisterType
    );

    res.json(projection);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load statutory register';
    const status = msg.includes('Access Denied') ? 403 : 500;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-records/registers/:entityId/:registerType/snapshot
router.post('/registers/:entityId/:registerType/snapshot', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { entityId, registerType } = req.params;

    const snapshot = await CorporateRecordsService.createStatutoryRegisterSnapshot(
      actor,
      entityId,
      registerType.toUpperCase() as StatutoryRegisterType
    );

    res.status(201).json(snapshot);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create statutory register snapshot';
    const status = msg.includes('Access Denied') ? 403 : 500;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 4. LEGAL HOLDS ROUTES
// ============================================================================

// POST /api/corporate-records/legal-holds
router.post('/legal-holds', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const payload = req.body;

    const hold = await CorporateRecordsService.createLegalHold(actor, {
      ...payload,
      legalEntityId: payload.legalEntityId || actor.legalEntityId,
    });

    res.status(201).json(hold);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create legal hold';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/corporate-records/legal-holds/:id/release
router.post('/legal-holds/:id/release', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = getABACUser(req);
    const { id } = req.params;
    const { releaseReason } = req.body;

    const released = await CorporateRecordsService.releaseLegalHold(actor, id, releaseReason);
    res.json(released);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to release legal hold';
    const status = msg.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

export default router;
