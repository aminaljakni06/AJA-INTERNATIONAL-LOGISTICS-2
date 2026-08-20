import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { Customer360Service } from '../../services/customer360Service';

const router = Router();

// GET /api/crm/customer-360/kpis - Get high level customer metrics
router.get('/kpis', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await Customer360Service.getKpiSummary();
    res.json(kpis);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error loading KPI summary';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360 - List profiles with filters
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const segment = req.query.segment ? String(req.query.segment) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const risk = req.query.risk ? String(req.query.risk) : undefined;

    const customers = await Customer360Service.listCustomers({ search, segment, status, risk });
    res.json(customers);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching customers';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360/:id - Single Profile
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await Customer360Service.getCustomer360(id);
    if (!profile) {
      res.status(404).json({ error: 'Customer profile not found' });
      return;
    }
    res.json(profile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching customer profile';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/customer-360 - Upsert Profile
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = req.body;
    if (!profile || !profile.companyName) {
      res.status(400).json({ error: 'Company name is required' });
      return;
    }
    const saved = await Customer360Service.saveCustomer360(profile);
    res.status(201).json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving customer profile';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360/:id/timeline - Timeline events
router.get('/:id/timeline', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const type = req.query.type ? String(req.query.type) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const timeline = await Customer360Service.getCustomerTimeline(id, { type, search });
    res.json(timeline);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching timeline';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/customer-360/:id/timeline - Record timeline event
router.post('/:id/timeline', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const event = req.body;
    const user = req.user!;

    const entry = await Customer360Service.recordTimelineEvent({
      ...event,
      customerId: id,
      actorId: user.userId,
      actorName: user.fullName || user.email,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(entry);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error recording timeline event';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360/:id/communications - Communications center
router.get('/:id/communications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const comms = await Customer360Service.getCommunications(id);
    res.json(comms);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching communications';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/customer-360/:id/communications - Add communication
router.post('/:id/communications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const commData = req.body;
    const user = req.user!;

    const comm = await Customer360Service.addCommunication({
      ...commData,
      customerId: id,
      agentId: user.userId,
      agentName: user.fullName || user.email,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(comm);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error adding communication';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360/:id/activities - Activities & tasks
router.get('/:id/activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const activities = await Customer360Service.getActivities(id);
    res.json(activities);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching activities';
    res.status(500).json({ error: msg });
  }
});

// POST /api/crm/customer-360/:id/activities - Add activity
router.post('/:id/activities', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actData = req.body;

    const activity = await Customer360Service.addActivity({
      ...actData,
      customerId: id,
    });

    res.status(201).json(activity);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error adding activity';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360/:id/documents - Document center
router.get('/:id/documents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docs = await Customer360Service.getDocuments(id);
    res.json(docs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching documents';
    res.status(500).json({ error: msg });
  }
});

// GET /api/crm/customer-360/:id/ai-insights - AI Insights
router.get('/:id/ai-insights', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await Customer360Service.getCustomer360(id);
    if (!profile) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    const insights = await Customer360Service.generateAIInsights(profile);
    res.json(insights);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error generating AI insights';
    res.status(500).json({ error: msg });
  }
});

export default router;
