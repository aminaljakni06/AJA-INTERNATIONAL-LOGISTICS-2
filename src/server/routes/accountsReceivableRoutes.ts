import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { accountsReceivableRepository } from '../../db/repositories/accountsReceivableRepository';

const router = Router();

const getSnapshot = () => ({
  analytics: accountsReceivableRepository.getARAnalytics(),
  invoices: accountsReceivableRepository.getInvoices(),
  revenueSchedules: accountsReceivableRepository.getRevenueSchedules(),
  payments: accountsReceivableRepository.getPayments(),
  creditProfiles: accountsReceivableRepository.getCreditProfiles(),
  collectionCases: accountsReceivableRepository.getCollectionCases(),
  badDebtProvisions: accountsReceivableRepository.getBadDebtProvisions(),
  aiInsights: accountsReceivableRepository.getAIInsights(),
});

router.get('/snapshot', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ success: true, ...getSnapshot() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/statements', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = String(req.query.customerId || '');
    const periodStart = String(req.query.periodStart || '');
    const periodEnd = String(req.query.periodEnd || '');
    res.json({
      success: true,
      statement: accountsReceivableRepository.getCustomerStatement(customerId, periodStart, periodEnd),
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/invoices', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invoice = accountsReceivableRepository.addInvoice(req.body);
    res.json({ success: true, invoice, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/invoices/:invoiceId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invoice = accountsReceivableRepository.updateInvoiceStatus(
      req.params.invoiceId,
      req.body.status,
      req.body.noteEn,
      req.body.noteAr,
      req.body.changedBy
    );
    res.json({ success: true, invoice, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/revenue-schedules/:scheduleId/milestones/:milestoneId/recognize', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schedule = accountsReceivableRepository.recognizeMilestone(req.params.scheduleId, req.params.milestoneId);
    res.json({ success: true, schedule, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/credit-profiles/:customerId/hold', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = accountsReceivableRepository.toggleCreditHold(
      req.params.customerId,
      Boolean(req.body.hold),
      req.body.reasonEn,
      req.body.reasonAr
    );
    res.json({ success: true, profile, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/credit-profiles/:customerId/limit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = accountsReceivableRepository.updateCreditLimit(
      req.params.customerId,
      Number(req.body.newLimitSAR),
      req.body.approvedBy || 'CFO Approval Committee'
    );
    res.json({ success: true, profile, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/collection-cases/:caseNumber/notes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const collectionCase = accountsReceivableRepository.addCollectionNote(
      req.params.caseNumber,
      req.body.noteEn,
      req.body.noteAr,
      req.body.author || 'Collections Agent'
    );
    res.json({ success: true, collectionCase, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/collection-cases/:caseNumber/dunning', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const collectionCase = accountsReceivableRepository.updateDunningLevel(req.params.caseNumber, req.body.level);
    res.json({ success: true, collectionCase, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/collection-cases/:caseNumber/promise', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const collectionCase = accountsReceivableRepository.updatePromiseToPay(
      req.params.caseNumber,
      req.body.promiseDate,
      Number(req.body.promiseAmountSAR)
    );
    res.json({ success: true, collectionCase, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/bad-debt-provisions/:provisionId/approve-write-off', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const provision = accountsReceivableRepository.approveWriteOff(
      req.params.provisionId,
      req.body.approvedBy || 'Chief Financial Officer (CFO)'
    );
    res.json({ success: true, provision, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
