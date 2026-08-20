import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aja-admin-pro-'));
process.env.LOCAL_DB_FILE = path.join(tempDir, 'db.json');
process.env.DEFAULT_ADMIN_PASSWORD = 'AdminSeed#123456789';
process.env.DEFAULT_STAFF_PASSWORD = 'StaffSeed#123456789';
process.env.DEFAULT_CUSTOMER_PASSWORD = 'CustomerSeed#123456789';
process.env.NODE_ENV = 'test';

const { validateRole } = await import('../db/validation');
const { createUser } = await import('../db/repositories/userRepository');
const { createSessionRecord, getUserActiveSessions } = await import('../db/repositories/identityRepository');
const { identityEngine } = await import('../lib/identity/identityEngine');
const { requireRoles } = await import('../server/auth');

test('SYSTEM_ADMIN is a canonical reusable Admin Pro role', () => {
  assert.equal(validateRole('SYSTEM_ADMIN'), 'SYSTEM_ADMIN');
  assert.throws(() => validateRole('ADMIN_PRO_DUPLICATE'), /Invalid user role/);
});

test('requireRoles(ADMIN) accepts SYSTEM_ADMIN without trusting request body roles', async () => {
  const middleware = requireRoles('ADMIN');
  let nextCalled = false;
  const req = { user: { userId: 'usr_sys', email: 'sys@example.com', role: 'SYSTEM_ADMIN', fullName: 'System Admin' } };
  const res = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      return payload;
    },
  };

  middleware(req as any, res as any, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test('last privileged administrator protection blocks freezing the only SYSTEM_ADMIN', async () => {
  await createUser({
    id: 'usr_only_sysadmin',
    email: 'only.sysadmin@example.com',
    displayName: 'Only System Admin',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    passwordHash: 'not-a-real-hash',
    securityLevel: 5,
  });

  await assert.rejects(
    () => identityEngine.setAccountStatus('usr_only_sysadmin', 'FROZEN', 'security review', 'usr_only_sysadmin'),
    /Last privileged administrator protection/
  );
});

test('freezing a privileged administrator revokes active sessions when another Admin Pro remains active', async () => {
  await createUser({
    id: 'usr_primary_sysadmin',
    email: 'primary.sysadmin@example.com',
    displayName: 'Primary System Admin',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    passwordHash: 'not-a-real-hash',
    securityLevel: 5,
  });
  await createUser({
    id: 'usr_backup_sysadmin',
    email: 'backup.sysadmin@example.com',
    displayName: 'Backup System Admin',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    passwordHash: 'not-a-real-hash',
    securityLevel: 5,
  });

  await createSessionRecord({
    sessionId: 'sess_primary_1',
    userId: 'usr_primary_sysadmin',
    token: 'redacted-test-token',
    ipAddress: '127.0.0.1',
    userAgent: 'node-test',
    deviceName: 'node-test',
    browser: 'node',
    os: 'test',
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    status: 'ACTIVE',
    isRememberMe: false,
  });

  const updated = await identityEngine.setAccountStatus(
    'usr_primary_sysadmin',
    'FROZEN',
    'incident containment',
    'usr_backup_sysadmin'
  );

  const activeSessions = await getUserActiveSessions('usr_primary_sysadmin');
  assert.equal(updated.accountStatus, 'FROZEN');
  assert.equal(activeSessions.length, 0);
});
