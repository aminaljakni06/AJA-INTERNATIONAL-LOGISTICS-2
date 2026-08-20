import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { BusinessPartnerService } from '../../services/businessPartnerService';

const router = Router();

// GET /api/business-partners - Query partners with search & filters
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const role = req.query.role as any;
    const status = req.query.status as any;
    const classification = req.query.classification as any;

    const partners = await BusinessPartnerService.getPartners({ search, role, status, classification });
    res.json(partners);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch business partners';
    res.status(500).json({ error: msg });
  }
});

// GET /api/business-partners/analytics - Get BP portfolio analytics
router.get('/analytics', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = await BusinessPartnerService.getAnalytics();
    res.json(analytics);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch analytics';
    res.status(500).json({ error: msg });
  }
});

// GET /api/business-partners/relationships - Get BP relationships
router.get('/relationships', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bpId = req.query.bpId as string | undefined;
    const rels = await BusinessPartnerService.getRelationships(bpId);
    res.json(rels);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch relationships';
    res.status(500).json({ error: msg });
  }
});

// POST /api/business-partners/relationships - Create BP relationship
router.post('/relationships', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const rel = await BusinessPartnerService.createRelationship(req.body, userId);
    res.status(201).json(rel);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create relationship';
    res.status(500).json({ error: msg });
  }
});

// GET /api/business-partners/duplicates - List open duplicates
router.get('/duplicates', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const dups = await BusinessPartnerService.getDuplicates();
    res.json(dups);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch duplicates';
    res.status(500).json({ error: msg });
  }
});

// POST /api/business-partners/duplicates/:id/resolve - Resolve duplicate
router.post('/duplicates/:id/resolve', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const { action, targetBpId } = req.body;
    const ok = await BusinessPartnerService.resolveDuplicate(req.params.id, action, targetBpId, userId);
    res.json({ success: ok });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to resolve duplicate';
    res.status(500).json({ error: msg });
  }
});

// GET /api/business-partners/:id - Single partner
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const partner = await BusinessPartnerService.getPartnerById(req.params.id);
    if (!partner) {
      res.status(404).json({ error: 'Business partner not found' });
      return;
    }
    res.json(partner);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch partner';
    res.status(500).json({ error: msg });
  }
});

// POST /api/business-partners - Create new partner
router.post('/', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const newPartner = await BusinessPartnerService.createPartner(req.body, userId);
    res.status(201).json(newPartner);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create partner';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/business-partners/:id - Update partner
router.put('/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const updated = await BusinessPartnerService.updatePartner(req.params.id, req.body, userId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update partner';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/business-partners/:id - Delete partner
router.delete('/:id', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'admin';
    const ok = await BusinessPartnerService.deletePartner(req.params.id, userId);
    if (!ok) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }
    res.json({ message: 'Business partner deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete partner';
    res.status(500).json({ error: msg });
  }
});

export default router;
