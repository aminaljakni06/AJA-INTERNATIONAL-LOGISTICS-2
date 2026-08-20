import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { ConfigService } from '../../services/configService';

const router = Router();

// GET /api/config/settings - List settings
router.get('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, scope, scopeId } = req.query;
    let settings = ConfigService.getAllSettings();

    if (category) {
      settings = settings.filter((s) => s.category === category);
    }
    if (scope) {
      settings = settings.filter((s) => s.scope === scope);
    }
    if (scopeId) {
      settings = settings.filter((s) => s.scopeId === scopeId);
    }

    res.json(settings);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching settings';
    res.status(500).json({ error: msg });
  }
});

// GET /api/config/settings/:key - Resolve single setting
router.get('/settings/:key', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { companyId, branchId, departmentId } = req.query;

    const setting = ConfigService.getSetting(key, {
      companyId: companyId as string,
      branchId: branchId as string,
      departmentId: departmentId as string,
      userId: req.user?.userId,
    });

    if (!setting) {
      return res.status(404).json({ error: `Setting '${key}' not found.` });
    }

    res.json(setting);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error getting setting';
    res.status(500).json({ error: msg });
  }
});

// POST /api/config/settings - Update or create setting
router.post('/settings', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key, value, scope, scopeId } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required.' });
    }

    const updatedBy = req.user?.userId || 'admin';
    const setting = await ConfigService.updateSetting(key, value, scope, scopeId, updatedBy);
    res.status(200).json(setting);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating setting';
    res.status(500).json({ error: msg });
  }
});

// GET /api/config/feature-flags - List feature flags
router.get('/feature-flags', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const flags = ConfigService.getAllFeatureFlags();
    res.json(flags);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching feature flags';
    res.status(500).json({ error: msg });
  }
});

// POST /api/config/feature-flags/:key/toggle - Toggle feature flag or update properties
router.post('/feature-flags/:key/toggle', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const updates = req.body;
    const updatedBy = req.user?.userId || 'admin';

    const updated = await ConfigService.updateFeatureFlag(key, updates, updatedBy);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error toggling feature flag';
    res.status(500).json({ error: msg });
  }
});

// GET /api/config/user-preferences - Get current user preferences
router.get('/user-preferences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_admin_01';
    const prefs = ConfigService.getUserPreferences(userId);
    res.json(prefs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error getting user preferences';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/config/user-preferences - Update user preferences
router.put('/user-preferences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_admin_01';
    const prefs = ConfigService.updateUserPreferences(userId, req.body);
    res.json(prefs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating user preferences';
    res.status(500).json({ error: msg });
  }
});

// GET /api/config/modules - List module configs
router.get('/modules', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const modules = ConfigService.getModuleConfigs();
    res.json(modules);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching module configs';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/config/modules/:key - Update module status
router.put('/modules/:key', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { status } = req.body;
    const updatedBy = req.user?.userId || 'admin';

    const updated = ConfigService.updateModuleConfig(key, status, updatedBy);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating module status';
    res.status(500).json({ error: msg });
  }
});

// GET /api/config/validate - Run validation engine
router.get('/validate', requireAuth, requireRoles('ADMIN'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const issues = ConfigService.validateConfigurations();
    res.json({ issues, count: issues.length, status: issues.length === 0 ? 'VALID' : 'ISSUES_DETECTED' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error running validation';
    res.status(500).json({ error: msg });
  }
});

export default router;
