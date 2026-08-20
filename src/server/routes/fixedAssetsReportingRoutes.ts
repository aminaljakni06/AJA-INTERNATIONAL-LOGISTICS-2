import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { fixedAssetsReportingRepository } from '../../db/repositories/fixedAssetsReportingRepository';

const router = Router();

const getSnapshot = () => ({
  metrics: fixedAssetsReportingRepository.getSummaryMetrics(),
  assets: fixedAssetsReportingRepository.getAssets(),
  depreciationSchedule: fixedAssetsReportingRepository.getDepreciationSchedule(),
  leaseContracts: fixedAssetsReportingRepository.getLeaseContracts(),
  zatcaInvoices: fixedAssetsReportingRepository.getZatcaInvoices(),
  financialStatements: fixedAssetsReportingRepository.getFinancialStatements(),
  consolidatedEntities: fixedAssetsReportingRepository.getConsolidatedEntities(),
  aiInsights: fixedAssetsReportingRepository.getAIFinanceAssetInsights(),
});

router.get('/snapshot', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ success: true, ...getSnapshot() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/assets', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    fixedAssetsReportingRepository.addAsset(req.body);
    res.json({ success: true, asset: req.body, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/assets/:assetId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    fixedAssetsReportingRepository.updateAssetStatus(req.params.assetId, req.body.status);
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
