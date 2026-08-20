import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, requireAuth, requireRoles } from '../auth';
import { OrganizationService } from '../../services/organizationService';
import { OrganizationMasterService } from '../../services/organizationMasterService';

const router = Router();

router.use(requireAuth);

// ==========================================
// ENTERPRISE ORGANIZATION MASTER ENDPOINTS
// ==========================================

/**
 * GET /api/organization/master/nodes
 */
router.get('/master/nodes', async (req: Request, res: Response) => {
  try {
    const { type, status, search, country } = req.query;
    const nodes = await OrganizationMasterService.getAllNodes({
      type: type as string,
      status: status as string,
      search: search as string,
      country: country as string,
    });
    res.json(nodes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch master nodes' });
  }
});

/**
 * GET /api/organization/master/hierarchy
 */
router.get('/master/hierarchy', async (req: Request, res: Response) => {
  try {
    const rootId = req.query.rootId as string;
    const tree = await OrganizationMasterService.getHierarchyTree(rootId);
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch hierarchy tree' });
  }
});

/**
 * GET /api/organization/master/analytics
 */
router.get('/master/analytics', async (_req: Request, res: Response) => {
  try {
    const analytics = await OrganizationMasterService.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch organization analytics' });
  }
});

/**
 * GET /api/organization/master/relationships
 */
router.get('/master/relationships', async (_req: Request, res: Response) => {
  try {
    const rels = await OrganizationMasterService.getRelationships();
    res.json(rels);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch relationships' });
  }
});

/**
 * POST /api/organization/master/relationships
 */
router.post('/master/relationships', requireRoles('STAFF', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const rel = await OrganizationMasterService.createRelationship(req.body);
    res.status(201).json(rel);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create relationship' });
  }
});

/**
 * GET /api/organization/master/nodes/:id
 */
router.get('/master/nodes/:id', async (req: Request, res: Response) => {
  try {
    const node = await OrganizationMasterService.getNodeById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: 'Organization node not found' });
    }
    res.json(node);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch organization node' });
  }
});

/**
 * POST /api/organization/master/nodes
 */
router.post('/master/nodes', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newNode = await OrganizationMasterService.createNode(req.body, req.user!.userId);
    res.status(201).json(newNode);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create organization node' });
  }
});

/**
 * PUT /api/organization/master/nodes/:id
 */
router.put('/master/nodes/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await OrganizationMasterService.updateNode(
      req.params.id,
      req.body,
      req.user!.userId
    );
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update organization node' });
  }
});

/**
 * POST /api/organization/master/nodes/:id/move
 */
router.post('/master/nodes/:id/move', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newParentId } = req.body;
    const moved = await OrganizationMasterService.moveNodeInHierarchy(
      req.params.id,
      newParentId,
      req.user!.userId
    );
    res.json(moved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to move organization node' });
  }
});

/**
 * DELETE /api/organization/master/nodes/:id
 */
router.delete('/master/nodes/:id', requireRoles('STAFF', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await OrganizationMasterService.deleteNode(
      req.params.id,
      req.user!.userId
    );
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete organization node' });
  }
});

/**
 * GET /api/organization/master/nodes/:id/versions
 */
router.get('/master/nodes/:id/versions', async (req: Request, res: Response) => {
  try {
    const versions = await OrganizationMasterService.getNodeVersions(req.params.id);
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch node version history' });
  }
});

// ==========================================
// LEGACY & BASIC ORGANIZATION ENDPOINTS
// ==========================================

/**
 * GET /api/organization/company
 */
router.get('/company', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'aja-holding';
    const company = await OrganizationService.getCompany(companyId);
    res.json(company);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch company' });
  }
});

/**
 * GET /api/organization/branches
 */
router.get('/branches', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'aja-holding';
    const branches = await OrganizationService.getBranches(companyId);
    res.json(branches);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch branches' });
  }
});

/**
 * GET /api/organization/departments
 */
router.get('/departments', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'aja-holding';
    const branchId = req.query.branchId as string;
    const depts = await OrganizationService.getDepartments(companyId, branchId);
    res.json(depts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch departments' });
  }
});

/**
 * GET /api/organization/teams
 */
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const departmentId = req.query.departmentId as string;
    const teams = await OrganizationService.getTeams(departmentId);
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch teams' });
  }
});

/**
 * GET /api/organization/cost-centers
 */
router.get('/cost-centers', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'aja-holding';
    const costCenters = await OrganizationService.getCostCenters(companyId);
    res.json(costCenters);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cost centers' });
  }
});

/**
 * GET /api/organization/hierarchy
 */
router.get('/hierarchy', async (_req: Request, res: Response) => {
  try {
    const tree = await OrganizationService.getReportingHierarchy();
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reporting hierarchy' });
  }
});

/**
 * GET /api/organization/settings
 */
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'aja-holding';
    const settings = await OrganizationService.getSettings(companyId);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch organization settings' });
  }
});

export default router;
