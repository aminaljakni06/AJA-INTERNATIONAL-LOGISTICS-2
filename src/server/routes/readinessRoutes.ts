import { Router, Response } from 'express';
import { EnterpriseReadinessService } from '../readiness/EnterpriseReadinessService';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// Overview & High-Level Readiness Summary
router.get('/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const categories = EnterpriseReadinessService.getReadinessCategories();
  const certs = EnterpriseReadinessService.getCertifications();
  const gates = EnterpriseReadinessService.getGoLiveGates();
  const hypercare = EnterpriseReadinessService.getHypercareMetrics();
  const innovation = EnterpriseReadinessService.getInnovationItems();

  const totalReadinessScorePct = Math.round(
    categories.reduce((acc, c) => acc + c.readinessPct, 0) / categories.length
  );

  res.json({
    totalReadinessScorePct,
    categoriesCount: categories.length,
    certificationsCount: certs.length,
    goLiveGatesApprovedCount: gates.filter((g) => g.status === 'APPROVED_SIGNED').length,
    goLiveGatesTotal: gates.length,
    hypercareStage: hypercare.stage,
    criticalP1IncidentsCount: hypercare.criticalP1IncidentsCount,
    innovationItemsCount: innovation.length,
    productionDeploymentState: 'CERTIFIED_LIVE_READY',
  });
});

// Detailed Readiness Categories
router.get('/categories', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ categories: EnterpriseReadinessService.getReadinessCategories() });
});

// Certifications & Compliance
router.get('/certifications', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ certifications: EnterpriseReadinessService.getCertifications() });
});

// Go-Live Sign-Off Gates
router.get('/golive-gates', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ gates: EnterpriseReadinessService.getGoLiveGates() });
});

// Hypercare Operations
router.get('/hypercare', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(EnterpriseReadinessService.getHypercareMetrics());
});

// Innovation PMO Items
router.get('/innovation', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ innovation: EnterpriseReadinessService.getInnovationItems() });
});

// Execute Go-Live Certification Audit Action
router.post('/audit-certify', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const result = EnterpriseReadinessService.executeGoLiveCertificationAudit();
  res.json(result);
});

// Run Chaos Engineering Test Action
router.post('/chaos-test', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const result = EnterpriseReadinessService.runChaosEngineeringTest();
  res.json(result);
});

export default router;
