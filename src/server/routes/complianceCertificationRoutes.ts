/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Certification API Routes
 * Step GOV-20: Regulatory Obligation Execution Assurance, Compliance Certification,
 * Control Attestation & Evidence-Based Compliance Closure
 */

import { Router, Response } from 'express';
import { ComplianceCertificationService } from '../../services/complianceCertificationService';
import { getComplianceCertificationById, listComplianceCertificationsByEntity } from '../../db/repositories/complianceCertificationRepository';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { requireGovernanceApiAccess } from '../middleware/governanceApiAuthMiddleware';
import { User } from '../../types/user';

const router = Router();

router.use(requireAuth, requireGovernanceApiAccess);

function isSuperOrAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'SYSTEM_ADMIN' || role === 'PLATFORM_ADMIN' || role === 'ADMIN';
}

// Evaluate deterministic readiness
router.post('/evaluate-readiness', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const result = await ComplianceCertificationService.evaluateReadiness(req.body, actor);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Draft new Compliance Certification package
router.post('/draft', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const result = await ComplianceCertificationService.createDraftCertification(req.body, actor);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Record Control Owner Attestation
router.post('/attest-control', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const result = await ComplianceCertificationService.recordControlAttestation(req.body, actor);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Certify Compliance (primary certification)
router.post('/certify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const result = await ComplianceCertificationService.certifyCompliance(req.body, actor);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Independently Verify Certification
router.post('/independently-verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const result = await ComplianceCertificationService.independentlyVerifyCertification(req.body, actor);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Close Certification
router.post('/close', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const { certificationId, closureNotes } = req.body;
    const result = await ComplianceCertificationService.closeCertification(certificationId, closureNotes, actor);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Reopen Certification upon deficiency
router.post('/reopen', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const result = await ComplianceCertificationService.reopenCertification(req.body, actor);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Supersede Certification
router.post('/supersede', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.user as unknown as User;
    const { previousCertificationId, newParams } = req.body;
    const result = await ComplianceCertificationService.supersedeCertification(previousCertificationId, newParams, actor);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// List by Entity
router.get('/entity/:legalEntityId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { legalEntityId } = req.params;
    const actor = req.user as unknown as User;
    if (!isSuperOrAdmin(actor.role) && actor.legalEntityId && actor.legalEntityId !== legalEntityId) {
      return res.status(403).json({ success: false, error: 'Unauthorized entity access.' });
    }
    const result = await listComplianceCertificationsByEntity(legalEntityId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get by ID
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user as unknown as User;
    const cert = await getComplianceCertificationById(id);
    if (!cert) {
      return res.status(404).json({ success: false, error: 'Compliance Certification not found.' });
    }
    if (!isSuperOrAdmin(actor.role) && actor.legalEntityId && actor.legalEntityId !== cert.legalEntityId) {
      return res.status(403).json({ success: false, error: 'Unauthorized entity access.' });
    }
    res.json({ success: true, data: cert });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Replay historical certification
router.post('/:id/replay', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { asOfDate } = req.body;
    const actor = req.user as unknown as User;
    const replay = await ComplianceCertificationService.replayCertificationAtPointInTime(id, asOfDate, actor);
    res.json({ success: true, data: replay });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Export certification package
router.post('/:id/export', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actor = req.user as unknown as User;
    const pkg = await ComplianceCertificationService.exportCertificationPackage(id, actor);
    res.json({ success: true, data: pkg });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

export default router;
