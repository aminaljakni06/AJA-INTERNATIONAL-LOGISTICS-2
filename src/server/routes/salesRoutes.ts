import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { SalesService } from '../../services/salesService';

const router = Router();

// GET /api/crm/sales/kpis
router.get('/kpis', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await SalesService.getKpiSummary();
    res.json(kpis);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching sales KPIs';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/leads
router.get('/leads', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const source = req.query.source ? String(req.query.source) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const priority = req.query.priority ? String(req.query.priority) : undefined;

    const leads = await SalesService.listLeads({ search, source, status, priority });
    res.json(leads);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching leads';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/leads/:id
router.get('/leads/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await SalesService.getLeadById(id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    res.json(lead);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching lead details';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/leads - Upsert Lead
router.post('/leads', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leadData = req.body;
    if (!leadData || !leadData.companyName) {
      res.status(400).json({ error: 'Company name is required for lead' });
      return;
    }
    const saved = await SalesService.saveLead(leadData);
    res.status(201).json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving lead';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/leads/:id/convert - Convert Lead to Opportunity & Customer 360
router.post('/leads/:id/convert', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { opportunityName, expectedRevenue, expectedCloseDate, createCustomer360Profile } = req.body;

    const result = await SalesService.convertLeadToOpportunity(id, {
      opportunityName: opportunityName || 'فرصة بيعية جديدة',
      expectedRevenue: Number(expectedRevenue) || 250000,
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      ownerName: user.fullName || user.email,
      createCustomer360Profile: Boolean(createCustomer360Profile ?? true),
    });

    res.status(200).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error converting lead';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/opportunities
router.get('/opportunities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const stage = req.query.stage ? String(req.query.stage) : undefined;
    const risk = req.query.risk ? String(req.query.risk) : undefined;
    const forecastCategory = req.query.forecastCategory ? String(req.query.forecastCategory) : undefined;

    const opps = await SalesService.listOpportunities({ search, stage, risk, forecastCategory });
    res.json(opps);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching opportunities';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/opportunities/:id
router.get('/opportunities/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const opp = await SalesService.getOpportunityById(id);
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    res.json(opp);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching opportunity details';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/opportunities - Upsert Opportunity
router.post('/opportunities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const oppData = req.body;
    if (!oppData || !oppData.name) {
      res.status(400).json({ error: 'Opportunity name is required' });
      return;
    }
    const saved = await SalesService.saveOpportunity(oppData);
    res.status(201).json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving opportunity';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/opportunities/:id/stage-change
router.post('/opportunities/:id/stage-change', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { stage, wonReason, lostReason, competitorLostTo } = req.body;

    if (!stage) {
      res.status(400).json({ error: 'New stage is required' });
      return;
    }

    const updated = await SalesService.updateOpportunityStage(id, stage, user.fullName || user.email, {
      wonReason,
      lostReason,
      competitorLostTo,
    });

    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating opportunity stage';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/activities
router.get('/activities', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const activities = await SalesService.listActivities();
    res.json(activities);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching sales activities';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/activities
router.post('/activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actData = req.body;
    const created = await SalesService.createActivity(actData);
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating sales activity';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/proposals
router.get('/proposals', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const proposals = await SalesService.listProposals();
    res.json(proposals);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching proposals';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/proposals
router.post('/proposals', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const propData = req.body;
    const saved = await SalesService.saveProposal(propData);
    res.status(201).json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving proposal';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/competitors
router.get('/competitors', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const competitors = await SalesService.listCompetitors();
    res.json(competitors);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching competitors';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/win-loss
router.get('/win-loss', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await SalesService.listWinLoss();
    res.json(records);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching win/loss records';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/territories
router.get('/territories', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const territories = await SalesService.listTerritories();
    res.json(territories);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching territories';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/targets
router.get('/targets', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const targets = await SalesService.listTargets();
    res.json(targets);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching sales targets';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/sales/commission-rules
router.get('/commission-rules', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rules = await SalesService.listCommissionRules();
    res.json(rules);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching commission rules';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/sales/ai-insights - Gemini AI copilot analysis
router.post('/ai-insights', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contextData = req.body;
    const insights = await SalesService.generateAISalesInsights(contextData);
    res.json(insights);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error generating AI sales insights';
    res.status(500).json({ error: msg });
  }
});

export default router;
