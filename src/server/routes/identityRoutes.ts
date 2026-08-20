import { Router, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { IdentityService } from '../../services/identityService';
import { requireAdminPro } from '../middleware/adminProAuthMiddleware';

const router = Router();

// GET /api/identity/profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profile = await IdentityService.getProfile(userId);
    if (!profile) {
      res.status(404).json({ error: 'الملف الشخصي للهوية غير موجود' });
      return;
    }
    res.json(profile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch identity profile';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/identity/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updates = req.body;

    // Remove protected parameters from user-driven updates
    delete updates.userId;
    delete updates.role;
    delete updates.accountStatus;
    delete updates.securityLevel;

    const updated = await IdentityService.updateProfile(userId, updates, userId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update identity profile';
    res.status(500).json({ error: msg });
  }
});

// GET /api/identity/sessions
router.get('/sessions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const sessions = await IdentityService.getSessions(userId);
    res.json(sessions);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch sessions';
    res.status(500).json({ error: msg });
  }
});

// POST /api/identity/sessions/revoke
router.post('/sessions/revoke', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { sessionId, revokeOthers, activeSessionId } = req.body;

    if (revokeOthers) {
      const revokedCount = await IdentityService.revokeOtherSessions(userId, activeSessionId || '', userId);
      res.json({ message: `تم إلغاء ${revokedCount} جلسة نشطة أخرى بنجاح` });
      return;
    }

    if (!sessionId) {
      res.status(400).json({ error: 'معرف الجلسة مطلوب' });
      return;
    }

    await IdentityService.revokeSession(sessionId, userId);
    res.json({ message: 'تم إلغاء الجلسة بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke session';
    res.status(500).json({ error: msg });
  }
});

// GET /api/identity/devices
router.get('/devices', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const devices = await IdentityService.getDevices(userId);
    res.json(devices);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch devices';
    res.status(500).json({ error: msg });
  }
});

// POST /api/identity/devices/trust
router.post('/devices/trust', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { deviceId, trustStatus } = req.body;

    if (!deviceId || !trustStatus) {
      res.status(400).json({ error: 'معرف الجهاز وحالة الثقة مطلوبان' });
      return;
    }

    await IdentityService.setDeviceTrust(deviceId, trustStatus, userId);
    res.json({ message: 'تم تحديث حالة ثقة الجهاز بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update device trust';
    res.status(500).json({ error: msg });
  }
});

// GET /api/identity/password-policy
router.get('/password-policy', async (_req, res) => {
  try {
    const policy = await IdentityService.getPasswordPolicy();
    res.json(policy);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch password policy';
    res.status(500).json({ error: msg });
  }
});

// POST /api/identity/validate-password
router.post('/validate-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: 'كلمة المرور مطلوبة' });
      return;
    }
    const result = await IdentityService.validatePassword(password);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to validate password';
    res.status(500).json({ error: msg });
  }
});

// GET /api/identity/mfa
router.get('/mfa', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const mfa = await IdentityService.getMFA(userId);
    res.json(mfa);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch MFA status';
    res.status(500).json({ error: msg });
  }
});

// POST /api/identity/mfa/setup
router.post('/mfa/setup', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { method } = req.body;
    const mfa = await IdentityService.setupMFA(userId, method || 'TOTP');
    res.json({
      message: 'تم تفعيل التحقق الثنائي (MFA) بنجاح',
      mfa,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to setup MFA';
    res.status(500).json({ error: msg });
  }
});

// POST /api/identity/mfa/disable
router.post('/mfa/disable', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const mfa = await IdentityService.disableMFA(userId);
    res.json({
      message: 'تم تعطيل التحقق الثنائي (MFA)',
      mfa,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to disable MFA';
    res.status(500).json({ error: msg });
  }
});

// --- ADMIN ROUTES ---

// GET /api/identity/admin/users
router.get('/admin/users', requireAdminPro, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profiles = await IdentityService.listProfiles();
    const search = String(req.query.search || '').trim().toLowerCase();
    const status = String(req.query.status || 'ALL').trim();
    const role = String(req.query.role || 'ALL').trim();
    const sortBy = String(req.query.sortBy || 'updatedAt');
    const sortDir = String(req.query.sortDir || 'desc') === 'asc' ? 'asc' : 'desc';
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize || 50), 1), 100);

    const filtered = profiles.filter((profile) => {
      const matchesSearch =
        !search ||
        profile.userId.toLowerCase().includes(search) ||
        profile.identityId.toLowerCase().includes(search) ||
        profile.username.toLowerCase().includes(search) ||
        profile.primaryEmail.toLowerCase().includes(search) ||
        (profile.primaryPhone || '').toLowerCase().includes(search) ||
        (profile.departmentName || '').toLowerCase().includes(search) ||
        (profile.companyName || '').toLowerCase().includes(search);

      const matchesStatus = status === 'ALL' || profile.accountStatus === status;
      const matchesRole = role === 'ALL' || profile.role === role;
      return matchesSearch && matchesStatus && matchesRole;
    });

    const sorted = [...filtered].sort((a, b) => {
      const left = String((a as unknown as Record<string, unknown>)[sortBy] || '');
      const right = String((b as unknown as Record<string, unknown>)[sortBy] || '');
      return sortDir === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    });

    const start = (page - 1) * pageSize;
    res.json({
      data: sorted.slice(start, start + pageSize),
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list identity profiles';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/identity/admin/status
router.patch('/admin/status', requireAdminPro, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUserId = req.user!.userId;
    const { targetUserId, newStatus, reason } = req.body;

    if (!targetUserId || !newStatus || !String(reason || '').trim()) {
      res.status(400).json({ error: 'معرف المستخدم والحالة الجديدة والسبب الإلزامي مطلوبة' });
      return;
    }

    const updated = await IdentityService.setStatus(targetUserId, newStatus, String(reason).trim(), adminUserId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update account status';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/identity/admin/password-policy
router.put('/admin/password-policy', requireAdminPro, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const policy = req.body;
    const updated = await IdentityService.updatePasswordPolicy(policy);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update password policy';
    res.status(500).json({ error: msg });
  }
});

export default router;
