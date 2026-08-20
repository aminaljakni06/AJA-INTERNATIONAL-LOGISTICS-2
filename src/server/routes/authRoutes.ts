import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { generateToken, requireAuth, requireRoles, AuthenticatedRequest, sanitizeUser } from '../auth';
import { getUserByEmail, createUser, getUserById, updateUser, listUsers } from '../../db/repositories/userRepository';
import { createCompany } from '../../db/repositories/companyRepository';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { upsertCustomerProfile, getCustomerByUserId } from '../../db/repositories/customerRepository';
import { UserRole } from '../../types/firestore';
import { getMFAConfig } from '../../db/repositories/identityRepository';
import { identityEngine } from '../../lib/identity/identityEngine';
import { AUTH_ASSURANCE, requiresPrivilegedMfa } from '../../lib/auth/privilegedAuthPolicy';
import { beginMfaChallenge, verifyMfaChallenge } from '../../lib/auth/privilegedMfaService';
import {
  getLocalUserByEmail,
  getLocalUserById,
  isLocalAuthFallbackEnabled,
  logLocalAuthAudit,
} from '../localAuthFallback';

const router = Router();

// Temporary store for password reset tokens: email -> { code: string, expiresAt: number }
const passwordResetStore = new Map<string, { code: string; expiresAt: number }>();

function getUserAgent(req: Request): string {
  const value = req.headers['user-agent'];
  return Array.isArray(value) ? value.join(' ') : value || '';
}

function buildLoginUser(user: NonNullable<Awaited<ReturnType<typeof getUserByEmailWithLocalFallback>>>) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.displayName,
    displayName: user.displayName,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getUserByEmailWithLocalFallback(email: string) {
  try {
    return await getUserByEmail(email);
  } catch (err) {
    if (!isLocalAuthFallbackEnabled()) {
      throw err;
    }

    console.warn('[Auth Warning] Firestore user lookup failed; using local auth fallback:', err instanceof Error ? err.message : err);
    return getLocalUserByEmail(email);
  }
}

async function getUserByIdWithLocalFallback(id: string) {
  try {
    return await getUserById(id);
  } catch (err) {
    if (!isLocalAuthFallbackEnabled()) {
      throw err;
    }

    console.warn('[Auth Warning] Firestore user profile lookup failed; using local auth fallback:', err instanceof Error ? err.message : err);
    return getLocalUserById(id);
  }
}

async function createAuthAuditLogBestEffort(
  user: NonNullable<Awaited<ReturnType<typeof getUserByEmailWithLocalFallback>>>,
  action: string,
  after?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await createAuditLog({
      actorUserId: user.id,
      action,
      entityType: 'USER',
      entityId: user.id,
      after,
    });
  } catch (err) {
    if (!isLocalAuthFallbackEnabled()) {
      throw err;
    }

    console.warn('[Auth Warning] Firestore audit write failed; using local audit fallback:', err instanceof Error ? err.message : err);
    logLocalAuthAudit(user, action, after, ipAddress);
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, mfaTransactionId, challengeId, mfaCode, code } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
      return;
    }

    const user = await getUserByEmailWithLocalFallback(String(email).trim());

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      res.status(403).json({ error: 'هذا الحساب معطل أو موقوف مؤقتاً، يرجى التواصل مع إدارة شركة أجا للخدمات اللوجستية' });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const loginPolicy = await identityEngine.evaluateLoginPolicy(user.id, {
      ip: req.ip || '127.0.0.1',
      userAgent: getUserAgent(req),
    });
    if (!loginPolicy.allowed) {
      await createAuthAuditLogBestEffort(user, 'LOGIN_POLICY_VIOLATED', { reason: loginPolicy.reason, role: user.role }, req.ip);
      res.status(403).json({ error: loginPolicy.reason || 'تسجيل الدخول غير مسموح حسب سياسة الأمان' });
      return;
    }

    const privilegedLogin = requiresPrivilegedMfa(user.role);
    if (privilegedLogin) {
      const mfaConfig = await getMFAConfig(user.id);
      const transactionId = String(mfaTransactionId || challengeId || '').trim();
      const submittedCode = String(mfaCode || code || '').trim();

      if (!mfaConfig.mfaEnabled || mfaConfig.method !== 'TOTP' || !mfaConfig.secretKey) {
        const sessionId = `sess_${crypto.randomUUID()}`;
        const token = generateToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.displayName,
          sessionId,
          authenticationLevel: AUTH_ASSURANCE.PASSWORD_ONLY,
          mfaVerified: false,
          mfaEnrollmentRequired: true,
        });
        await identityEngine.registerSessionAndDevice(user.id, token, {
          ip: req.ip || '127.0.0.1',
          userAgent: getUserAgent(req),
          sessionId,
          authenticationLevel: AUTH_ASSURANCE.PASSWORD_ONLY,
          mfaVerified: false,
        });
        await createAuthAuditLogBestEffort(user, 'MFA_ENROLLMENT_REQUIRED', { role: user.role, ip: req.ip }, req.ip);
        res.status(403).json({
          token,
          user: buildLoginUser(user),
          errorCode: 'MFA_ENROLLMENT_REQUIRED',
          mfaEnrollmentRequired: true,
          authenticationLevel: AUTH_ASSURANCE.PASSWORD_ONLY,
          message: 'Privileged MFA enrollment is required before Admin Pro access is granted.',
        });
        return;
      }

      if (!transactionId || !submittedCode) {
        const challenge = await beginMfaChallenge({
          userId: user.id,
          purpose: 'LOGIN_MFA',
          ipAddress: req.ip,
        });
        res.json({
          mfaRequired: true,
          mfaTransactionId: challenge.challengeId,
          expiresAt: challenge.expiresAt,
          method: mfaConfig.method,
          message: 'Privileged MFA verification is required.',
        });
        return;
      }

      const verified = await verifyMfaChallenge({
        challengeId: transactionId,
        userId: user.id,
        code: submittedCode,
      });
      if (verified.ok !== true) {
        res.status(401).json({ error: verified.message, errorCode: verified.errorCode, mfaRequired: true });
        return;
      }

      const sessionId = `sess_${crypto.randomUUID()}`;
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.displayName,
        sessionId,
        authenticationLevel: AUTH_ASSURANCE.MFA_VERIFIED,
        mfaVerified: true,
        mfaMethod: mfaConfig.method,
        mfaVerifiedAt: verified.verifiedAt,
      });
      await identityEngine.registerSessionAndDevice(user.id, token, {
        ip: req.ip || '127.0.0.1',
        userAgent: getUserAgent(req),
        sessionId,
        authenticationLevel: AUTH_ASSURANCE.MFA_VERIFIED,
        mfaVerified: true,
        mfaMethod: mfaConfig.method,
        mfaVerifiedAt: verified.verifiedAt,
      });
      await createAuthAuditLogBestEffort(user, 'PRIVILEGED_USER_LOGIN_MFA_VERIFIED', { email: user.email, role: user.role, ip: req.ip }, req.ip);

      res.json({
        token,
        user: buildLoginUser(user),
        authenticationLevel: AUTH_ASSURANCE.MFA_VERIFIED,
        mfaVerified: true,
        mfaVerifiedAt: verified.verifiedAt,
      });
      return;
    }

    const sessionId = `sess_${crypto.randomUUID()}`;
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.displayName,
      sessionId,
      authenticationLevel: AUTH_ASSURANCE.PASSWORD_ONLY,
      mfaVerified: false,
    });
    await identityEngine.registerSessionAndDevice(user.id, token, {
      ip: req.ip || '127.0.0.1',
      userAgent: getUserAgent(req),
      sessionId,
      authenticationLevel: AUTH_ASSURANCE.PASSWORD_ONLY,
      mfaVerified: false,
    });

    await createAuthAuditLogBestEffort(user, 'USER_LOGIN', { email: user.email, role: user.role, ip: req.ip }, req.ip);

    res.json({
      token,
      user: buildLoginUser(user),
      authenticationLevel: AUTH_ASSURANCE.PASSWORD_ONLY,
      mfaVerified: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: msg });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, companyName } = req.body;

    if (!email || !password || !fullName || !phone) {
      res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة (الاسم الكامل، البريد، كلمة المرور، الهاتف)' });
      return;
    }

    const existingUser = await getUserByEmail(String(email).trim());
    if (existingUser) {
      res.status(400).json({ error: 'البريد الإلكتروني مُسجل مسبقاً في النظام' });
      return;
    }

    const userId = `usr_cust_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    let companyId: string | undefined = undefined;
    if (companyName) {
      companyId = `cmp_${Date.now()}`;
      await createCompany({
        id: companyId,
        name: String(companyName).trim(),
        phone: String(phone).trim(),
      });
    }

    const newUser = await createUser({
      id: userId,
      email: String(email).trim().toLowerCase(),
      displayName: String(fullName).trim(),
      phone: String(phone).trim(),
      role: 'CUSTOMER',
      status: 'ACTIVE',
      passwordHash,
    });

    await upsertCustomerProfile({
      userId: newUser.id,
      fullName: newUser.displayName,
      companyName: companyName ? String(companyName).trim() : undefined,
      phone: newUser.phone || '',
      email: newUser.email,
    });

    await createAuditLog({
      actorUserId: newUser.id,
      action: 'CUSTOMER_REGISTER',
      entityType: 'USER',
      entityId: newUser.id,
      after: { fullName: newUser.displayName, companyName },
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.displayName,
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.displayName,
        phone: newUser.phone,
        role: newUser.role,
        companyId,
        companyName: companyName ? String(companyName).trim() : null,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ error: msg });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      const user = await getUserByIdWithLocalFallback(req.user.userId);
      if (user) {
        await createAuthAuditLogBestEffort(user, 'USER_LOGOUT', undefined, req.ip);
      }
    }
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Logout error';
    res.status(500).json({ error: msg });
  }
});

// POST /api/auth/forgot-password - Step 1: Generate reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'البريد الإلكتروني مطلوب لإعادة تعيين كلمة المرور' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);

    if (!user) {
      // Return neutral message for security
      res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً، فقد تم إرسال رمز استعادة كلمة المرور.' });
      return;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    passwordResetStore.set(cleanEmail, { code: resetCode, expiresAt });

    await createAuditLog({
      actorUserId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'USER',
      entityId: user.id,
    });

    res.json({
      message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Forgot password error';
    res.status(500).json({ error: msg });
  }
});

// POST /api/auth/reset-password - Step 2: Verify code and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'البريد الإلكتروني، الرمز، وكلمة المرور الجديدة جميعها مطلوبة' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const record = passwordResetStore.get(cleanEmail);

    if (!record || record.code !== String(code).trim() || Date.now() > record.expiresAt) {
      res.status(400).json({ error: 'رمز إستعادة كلمة المرور غير صحيح أو انتهت صلاحيته' });
      return;
    }

    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await updateUser(user.id, { passwordHash: newHash });
    passwordResetStore.delete(cleanEmail);

    await createAuditLog({
      actorUserId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'USER',
      entityId: user.id,
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Reset password error';
    res.status(500).json({ error: msg });
  }
});

// POST /api/auth/change-password - Authenticated password change
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user!;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
      return;
    }

    const userDoc = await getUserById(user.userId);
    if (!userDoc || !userDoc.passwordHash) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const isValid = bcrypt.compareSync(currentPassword, userDoc.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await updateUser(user.userId, { passwordHash: newHash });

    await createAuditLog({
      actorUserId: user.userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: user.userId,
    });

    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Change password error';
    res.status(500).json({ error: msg });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const user = await getUserByIdWithLocalFallback(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    res.json(sanitizeUser(user));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching profile';
    res.status(500).json({ error: msg });
  }
});

// GET /api/auth/profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const customerProfile = await getCustomerByUserId(user.userId);

    res.json({
      user: sanitizeUser(userDoc),
      customerProfile: customerProfile || null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching profile details';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { fullName, phone, email, companyName, address, city, country } = req.body;

    // Ensure protected fields cannot be injected
    const currentUserDoc = await getUserById(user.userId);
    if (!currentUserDoc) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    let newEmail = currentUserDoc.email;
    if (email && String(email).trim().toLowerCase() !== currentUserDoc.email.toLowerCase()) {
      const cleanEmail = String(email).trim().toLowerCase();
      const existingUser = await getUserByEmail(cleanEmail);
      if (existingUser && existingUser.id !== user.userId) {
        res.status(400).json({ error: 'البريد الإلكتروني مُسجل مسبقاً لمستخدم آخر' });
        return;
      }
      newEmail = cleanEmail;
    }

    const newDisplayName = fullName ? String(fullName).trim() : currentUserDoc.displayName;
    const newPhone = phone ? String(phone).trim() : currentUserDoc.phone;

    // Strict update: only edit permitted profile fields, ignoring role/status/id
    const updatedUser = await updateUser(user.userId, {
      displayName: newDisplayName,
      phone: newPhone,
      email: newEmail,
    });

    const updatedCustomerProfile = await upsertCustomerProfile({
      userId: user.userId,
      fullName: updatedUser.displayName,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      companyName: companyName !== undefined ? String(companyName).trim() : undefined,
      address: address !== undefined ? String(address).trim() : undefined,
      city: city !== undefined ? String(city).trim() : undefined,
      country: country !== undefined ? String(country).trim() : undefined,
    });

    await createAuditLog({
      actorUserId: user.userId,
      action: 'UPDATE_PROFILE',
      entityType: 'USER',
      entityId: user.userId,
      before: { displayName: currentUserDoc.displayName, email: currentUserDoc.email, phone: currentUserDoc.phone },
      after: { displayName: updatedUser.displayName, email: updatedUser.email, phone: updatedUser.phone, companyName, address },
    });

    // Generate fresh JWT token with updated info
    const newToken = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      fullName: updatedUser.displayName,
    });

    res.json({
      user: sanitizeUser(updatedUser),
      customerProfile: updatedCustomerProfile,
      token: newToken,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating profile';
    res.status(500).json({ error: msg });
  }
});

// POST /api/auth/request-deletion - Customer account deletion request
router.post('/request-deletion', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { reason } = req.body;

    await createAuditLog({
      actorUserId: user.userId,
      action: 'ACCOUNT_DELETION_REQUESTED',
      entityType: 'USER',
      entityId: user.userId,
      after: { reason: reason ? String(reason).trim() : 'لا يوجد سبب محدد' },
    });

    res.json({ message: 'تم إرسال طلب حذف الحساب بنجاح. سيقوم فريق العمل بمراجعته والتواصل معك.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error processing deletion request';
    res.status(500).json({ error: msg });
  }
});

// GET /api/auth/users - List system users (ADMIN only)
router.get('/users', requireAuth, requireRoles('ADMIN'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await listUsers();
    const safeUsers = users.map(u => sanitizeUser(u));
    res.json(safeUsers);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error listing users';
    res.status(500).json({ error: msg });
  }
});

// PATCH /api/auth/users/:id/role - Update user role (ADMIN only)
router.patch('/users/:id/role', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminUser = req.user!;

    if (!role || !['CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'الدور الصالح يجب أن يكون CUSTOMER أو STAFF أو ADMIN' });
      return;
    }

    const targetUser = await getUserById(id);
    if (!targetUser) {
      res.status(404).json({ error: 'المستخدم المستهدف غير موجود' });
      return;
    }

    const updatedUser = await updateUser(id, { role: role as UserRole });

    await createAuditLog({
      actorUserId: adminUser.userId,
      action: 'UPDATE_USER_ROLE',
      entityType: 'USER',
      entityId: id,
      before: { role: targetUser.role },
      after: { role: updatedUser.role },
    });

    res.json(sanitizeUser(updatedUser));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating user role';
    res.status(500).json({ error: msg });
  }
});

export default router;
