import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { MasterDataService } from '../../services/masterDataService';
import { 
  listMasterRecords, 
  getMasterRecordById, 
  listVersionHistory, 
  listRelationships, 
  saveRelationship, 
  removeRelationship, 
  listDuplicates 
} from '../../db/repositories/masterDataRepository';
import { MasterDataDomain } from '../../types/mdm';

const router = Router();

// GET /api/mdm/analytics - Dashboard metrics
router.get('/analytics', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = await MasterDataService.getAnalytics();
    res.json(analytics);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch MDM analytics';
    res.status(500).json({ error: msg });
  }
});

// GET /api/mdm/records - Query master records with filtering
router.get('/records', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domain = req.query.domain as MasterDataDomain | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const records = await listMasterRecords({ domain, status, search });
    res.json(records);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list master records';
    res.status(500).json({ error: msg });
  }
});

// GET /api/mdm/records/:id - Get single record
router.get('/records/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const record = await getMasterRecordById(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'Master record not found' });
      return;
    }
    const history = await listVersionHistory(req.params.id);
    const relationships = await listRelationships(req.params.id);

    res.json({ record, history, relationships });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch master record';
    res.status(500).json({ error: msg });
  }
});

// POST /api/mdm/records - Create master record
router.post('/records', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user?.userId || 'usr_system';
    const input = req.body;

    if (!input.domain || !input.code || !input.nameAr || !input.nameEn) {
      res.status(400).json({ error: 'domain, code, nameAr, and nameEn are required fields.' });
      return;
    }

    const record = await MasterDataService.createMasterRecord(input, actorUserId);
    res.status(201).json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create master record';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/mdm/records/:id - Update master record (creates version)
router.put('/records/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user?.userId || 'usr_system';
    const updates = req.body;

    const record = await MasterDataService.updateMasterRecord(req.params.id, updates, actorUserId);
    res.json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update master record';
    res.status(500).json({ error: msg });
  }
});

// POST /api/mdm/records/:id/approve - Approve or Reject draft/pending record
router.post('/records/:id/approve', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user?.userId || 'usr_system';
    const { approved } = req.body;

    const record = await MasterDataService.approveMasterRecord(req.params.id, Boolean(approved), actorUserId);
    res.json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to approve master record';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/mdm/records/:id - Archive master record (soft delete)
router.delete('/records/:id', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user?.userId || 'usr_system';
    const success = await MasterDataService.archiveMasterRecord(req.params.id, actorUserId);
    if (!success) {
      res.status(404).json({ error: 'Master record not found or already archived' });
      return;
    }
    res.json({ message: 'Master record archived successfully', id: req.params.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to archive master record';
    res.status(500).json({ error: msg });
  }
});

// GET /api/mdm/duplicates - List open duplicates
router.get('/duplicates', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const duplicates = await listDuplicates();
    res.json(duplicates);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch duplicates';
    res.status(500).json({ error: msg });
  }
});

// POST /api/mdm/merge - Merge two duplicate records
router.post('/merge', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user?.userId || 'usr_system';
    const { primaryId, secondaryId, fieldResolutions } = req.body;

    if (!primaryId || !secondaryId) {
      res.status(400).json({ error: 'primaryId and secondaryId are required for merge operation.' });
      return;
    }

    const merged = await MasterDataService.mergeRecords(primaryId, secondaryId, fieldResolutions || {}, actorUserId);
    res.json(merged);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to merge master records';
    res.status(500).json({ error: msg });
  }
});

// GET /api/mdm/quality-audit - Run full system quality audit
router.get('/quality-audit', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const issues = await MasterDataService.runDataQualityAudit();
    res.json(issues);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to run quality audit';
    res.status(500).json({ error: msg });
  }
});

// GET /api/mdm/relationships - List relationships
router.get('/relationships', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entityId = req.query.entityId as string | undefined;
    const rels = await listRelationships(entityId);
    res.json(rels);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list relationships';
    res.status(500).json({ error: msg });
  }
});

// POST /api/mdm/relationships - Create relationship
router.post('/relationships', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actorUserId = req.user?.userId || 'usr_system';
    const relData = req.body;

    const rel = {
      ...relData,
      id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      createdBy: actorUserId
    };

    const saved = await saveRelationship(rel);
    res.status(201).json(saved);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save relationship';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/mdm/relationships/:id - Delete relationship
router.delete('/relationships/:id', requireAuth, requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await removeRelationship(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Relationship not found' });
      return;
    }
    res.json({ message: 'Relationship deleted successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete relationship';
    res.status(500).json({ error: msg });
  }
});

export default router;
