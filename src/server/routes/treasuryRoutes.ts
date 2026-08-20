import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { treasuryRepository } from '../../db/repositories/treasuryRepository';

const router = Router();

const getSnapshot = () => ({
  metrics: treasuryRepository.getTreasurySummaryMetrics(),
  bankAccounts: treasuryRepository.getBankAccounts(),
  cashMovements: treasuryRepository.getCashMovements(),
  treasuryDeals: treasuryRepository.getTreasuryDeals(),
  paymentBatches: treasuryRepository.getPaymentBatches(),
  bankStatements: treasuryRepository.getBankStatements(),
  liquidityForecasts: treasuryRepository.getLiquidityForecasts(),
  fxRates: treasuryRepository.getFXRates(),
  fxExposures: treasuryRepository.getFXExposures(),
  financialSettlements: treasuryRepository.getFinancialSettlements(),
  aiInsights: treasuryRepository.getAITreasuryInsights(),
});

router.get('/snapshot', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ success: true, ...getSnapshot() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/payment-batches/:batchId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    treasuryRepository.updatePaymentBatchStatus(req.params.batchId, req.body.status, req.body.approverName);
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/bank-statements/:statementId/lines/:lineId/match', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    treasuryRepository.matchStatementLine(req.params.statementId, req.params.lineId, req.body.status, req.body.glRef);
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
