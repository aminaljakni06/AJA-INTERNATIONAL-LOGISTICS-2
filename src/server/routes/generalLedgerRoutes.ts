import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { generalLedgerRepository } from '../../db/repositories/generalLedgerRepository';

const router = Router();

const getSnapshot = () => ({
  summary: generalLedgerRepository.getExecutiveSummary(),
  accounts: generalLedgerRepository.getAccounts(),
  journals: generalLedgerRepository.getJournals(),
  dimensions: generalLedgerRepository.getDimensionValues(),
  fiscalYear: generalLedgerRepository.getFiscalYear2026(),
  currencies: generalLedgerRepository.getCurrencies(),
  intercompanyAccounts: generalLedgerRepository.getIntercompanyAccounts(),
  trialBalanceRows: generalLedgerRepository.getTrialBalance(),
});

router.get('/snapshot', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ success: true, ...getSnapshot() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/accounts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const account = generalLedgerRepository.addAccount(req.body);
    res.json({ success: true, account, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/accounts/:accountCode/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = generalLedgerRepository.updateAccountStatus(req.params.accountCode, req.body.status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/journals', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const journal = generalLedgerRepository.createJournalEntry(req.body);
    res.json({ success: true, journal, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/journals/:journalId/post', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postedBy = req.body.postedBy || 'Chief Financial Controller';
    const journal = generalLedgerRepository.postJournalEntry(req.params.journalId, postedBy);
    res.json({ success: true, journal, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/dimensions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dimension = generalLedgerRepository.addDimensionValue(req.body);
    res.json({ success: true, dimension, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/periods/:periodId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = generalLedgerRepository.updatePeriodStatus(req.params.periodId, req.body.status, req.body.userName || 'Finance Director');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Fiscal period not found' });
    }
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/currencies/:currencyCode/rate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = generalLedgerRepository.updateCurrencyRate(req.params.currencyCode, Number(req.body.rateToBaseSAR));
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Currency not found' });
    }
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/intercompany/:intercompanyAccountId/eliminate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    generalLedgerRepository.eliminateIntercompanyAccount(req.params.intercompanyAccountId);
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
