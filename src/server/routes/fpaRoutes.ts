import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { fpaRepository } from '../../db/repositories/fpaRepository';

const router = Router();

const getSnapshot = () => ({
  metrics: fpaRepository.getFPASummaryMetrics(),
  budgetVersions: fpaRepository.getBudgetVersions(),
  departmentBudgets: fpaRepository.getDepartmentBudgets(),
  capexProjects: fpaRepository.getCapexProjects(),
  forecastPeriods: fpaRepository.getForecastPeriods(),
  scenarioModels: fpaRepository.getScenarioModels(),
  varianceItems: fpaRepository.getVarianceItems(),
  costAllocationRules: fpaRepository.getCostAllocationRules(),
  profitabilitySegments: fpaRepository.getProfitabilitySegments(),
  executiveKPIs: fpaRepository.getExecutiveKPIs(),
  aiInsights: fpaRepository.getAIFPAInsights(),
});

router.get('/snapshot', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ success: true, ...getSnapshot() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/budgets/:budgetId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    fpaRepository.updateBudgetStatus(req.params.budgetId, req.body.status, req.body.approverName);
    res.json({ success: true, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/capex-projects', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    fpaRepository.addCapexProject(req.body);
    res.json({ success: true, project: req.body, snapshot: getSnapshot() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
