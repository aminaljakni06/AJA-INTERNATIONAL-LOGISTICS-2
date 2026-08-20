import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, updateUser } from '../src/db/repositories/userRepository';
import { createOrUpdateIdentityProfile, saveMFAConfig } from '../src/db/repositories/identityRepository';
import { createAuditLog } from '../src/db/repositories/auditLogRepository';

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const username = process.env.BOOTSTRAP_ADMIN_USERNAME?.trim() || 'admin.pro';

if (!email || !password) {
  console.error('BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required.');
  process.exit(1);
}

if (password.length < 16) {
  console.error('BOOTSTRAP_ADMIN_PASSWORD must be at least 16 characters.');
  process.exit(1);
}

const existing = await getUserByEmail(email);
const now = new Date().toISOString();
const passwordHash = bcrypt.hashSync(password, 12);
const userId = existing?.id || `usr_admin_pro_${Date.now()}`;

if (!existing) {
  await createUser({
    id: userId,
    email,
    displayName: username,
    role: 'SYSTEM_ADMIN',
    roles: ['SYSTEM_ADMIN'],
    customPermissions: [
      'users.read.all',
      'users.create',
      'users.update',
      'users.suspend',
      'users.freeze',
      'users.reactivate',
      'users.sessions.revoke',
      'roles.read',
      'roles.assign',
      'roles.remove',
      'permissions.read',
      'audit.read',
      'activity.read',
      'security.events.read',
      'reports.users.read',
      'reports.users.export',
    ],
    status: 'ACTIVE',
    passwordHash,
    securityLevel: 5,
    forcePasswordChange: true,
    metadata: {
      adminPro: true,
      provisionedBy: 'bootstrap:admin-pro',
      provisionedAt: now,
      mfaRequired: true,
    },
  });
} else {
  await updateUser(existing.id, {
    role: 'SYSTEM_ADMIN',
    roles: Array.from(new Set([...(existing.roles || []), 'SYSTEM_ADMIN'])),
    status: 'ACTIVE',
    securityLevel: Math.max(existing.securityLevel || 0, 5),
    forcePasswordChange: true,
    metadata: {
      ...(existing.metadata || {}),
      adminPro: true,
      provisionedBy: 'bootstrap:admin-pro',
      provisionedAt: now,
      mfaRequired: true,
    },
  });
}

await createOrUpdateIdentityProfile(userId, {
  username,
  primaryEmail: email,
  identityType: 'EMPLOYEE',
  accountStatus: 'ACTIVE',
  role: 'SYSTEM_ADMIN',
  securityLevel: 5,
  mfaEnabled: true,
  mfaType: 'TOTP',
  metadata: {
    adminPro: true,
    mfaRequired: true,
    forcePasswordChange: true,
  },
});

await saveMFAConfig({
  userId,
  mfaEnabled: true,
  method: 'TOTP',
  backupCodes: [],
  phoneVerified: false,
  emailVerified: true,
  updatedAt: now,
});

await createAuditLog({
  actorUserId: userId,
  action: existing ? 'ADMIN_PRO_BOOTSTRAP_REFRESHED' : 'ADMIN_PRO_BOOTSTRAPPED',
  entityType: 'USER',
  entityId: userId,
  after: {
    email,
    role: 'SYSTEM_ADMIN',
    mfaRequired: true,
    forcePasswordChange: true,
  },
});

console.log(`Admin Pro bootstrap ${existing ? 'refreshed' : 'created'} for ${email}. Password was not printed.`);
