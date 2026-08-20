import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aja-admin-pro-mfa-'));
process.env.LOCAL_DB_FILE = path.join(tempDir, 'db.json');
process.env.DEFAULT_ADMIN_PASSWORD = 'AdminSeed#123456789';
process.env.DEFAULT_STAFF_PASSWORD = 'StaffSeed#123456789';
process.env.DEFAULT_CUSTOMER_PASSWORD = 'CustomerSeed#123456789';
process.env.JWT_SECRET = 'test-only-aja-logistics-jwt-secret-for-admin-pro-mfa';
process.env.NODE_ENV = 'test';
process.env.MFA_CHALLENGE_TTL_SECONDS = '300';
process.env.PRIVILEGED_STEP_UP_TTL_MINUTES = '10';

const express = (await import('express')).default;
const authRoutes = (await import('../server/routes/authRoutes')).default;
const identityRoutes = (await import('../server/routes/identityRoutes')).default;
const { createUser } = await import('../db/repositories/userRepository');
const { saveMFAConfig } = await import('../db/repositories/identityRepository');
const {
  clearMfaStateForTesting,
  generateMfaSecret,
  generateTotpForTesting,
} = await import('../lib/auth/privilegedMfaService');

const password = 'AdminMfa#123456789';
const primarySecret = generateMfaSecret();
let server: http.Server;
let baseUrl = '';

before(async () => {
  clearMfaStateForTesting();

  await createUser({
    id: 'usr_mfa_primary_sysadmin',
    email: 'mfa.primary@example.com',
    displayName: 'MFA Primary Admin',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    passwordHash: bcrypt.hashSync(password, 10),
    securityLevel: 5,
  });
  await createUser({
    id: 'usr_mfa_backup_sysadmin',
    email: 'mfa.backup@example.com',
    displayName: 'MFA Backup Admin',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    passwordHash: bcrypt.hashSync('BackupAdmin#123456789', 10),
    securityLevel: 5,
  });
  await saveMFAConfig({
    userId: 'usr_mfa_primary_sysadmin',
    mfaEnabled: true,
    method: 'TOTP',
    secretKey: primarySecret,
    backupCodes: [],
    phoneVerified: false,
    emailVerified: true,
    updatedAt: new Date().toISOString(),
  });

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/identity', identityRoutes);

  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  clearMfaStateForTesting();
  await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

test('privileged login with password only creates an MFA challenge and no token', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'mfa.primary@example.com', password }),
  });

  const body = await res.json() as Record<string, unknown>;
  assert.equal(res.status, 200);
  assert.equal(body.mfaRequired, true);
  assert.equal(typeof body.mfaTransactionId, 'string');
  assert.equal(body.token, undefined);
});

test('privileged login issues AAL2 token after TOTP and rejects challenge replay', async () => {
  const challengeRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'mfa.primary@example.com', password }),
  });
  const challenge = await challengeRes.json() as { mfaTransactionId: string };

  const verifyRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'mfa.primary@example.com',
      password,
      mfaTransactionId: challenge.mfaTransactionId,
      mfaCode: generateTotpForTesting(primarySecret),
    }),
  });
  const verified = await verifyRes.json() as Record<string, unknown>;
  assert.equal(verifyRes.status, 200);
  assert.equal(verified.authenticationLevel, 'AAL2');
  assert.equal(verified.mfaVerified, true);
  assert.equal(typeof verified.token, 'string');

  const replayRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'mfa.primary@example.com',
      password,
      mfaTransactionId: challenge.mfaTransactionId,
      mfaCode: generateTotpForTesting(primarySecret),
    }),
  });
  const replay = await replayRes.json() as Record<string, unknown>;
  assert.equal(replayRes.status, 401);
  assert.equal(replay.errorCode, 'MFA_CHALLENGE_INVALID');
});

test('high-risk privileged account freeze requires fresh step-up verification', async () => {
  const challengeRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'mfa.primary@example.com', password }),
  });
  const challenge = await challengeRes.json() as { mfaTransactionId: string };
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'mfa.primary@example.com',
      password,
      mfaTransactionId: challenge.mfaTransactionId,
      mfaCode: generateTotpForTesting(primarySecret),
    }),
  });
  const login = await loginRes.json() as { token: string };

  const blockedRes = await fetch(`${baseUrl}/api/identity/admin/status`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${login.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      targetUserId: 'usr_mfa_backup_sysadmin',
      newStatus: 'FROZEN',
      reason: 'security containment test',
    }),
  });
  const blocked = await blockedRes.json() as Record<string, unknown>;
  assert.equal(blockedRes.status, 403);
  assert.equal(blocked.errorCode, 'STEP_UP_REQUIRED');

  const stepUpRes = await fetch(`${baseUrl}/api/identity/mfa/challenge`, {
    method: 'POST',
    headers: { authorization: `Bearer ${login.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ purpose: 'STEP_UP', highRiskAction: 'FREEZE_PRIVILEGED_ACCOUNT' }),
  });
  const stepUp = await stepUpRes.json() as { mfaTransactionId: string };
  assert.equal(stepUpRes.status, 200);

  const verifyStepUpRes = await fetch(`${baseUrl}/api/identity/mfa/verify`, {
    method: 'POST',
    headers: { authorization: `Bearer ${login.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      mfaTransactionId: stepUp.mfaTransactionId,
      mfaCode: generateTotpForTesting(primarySecret),
    }),
  });
  const verifyStepUp = await verifyStepUpRes.json() as Record<string, unknown>;
  assert.equal(verifyStepUpRes.status, 200);
  assert.equal(verifyStepUp.verified, true);
  assert.equal(verifyStepUp.highRiskAction, 'FREEZE_PRIVILEGED_ACCOUNT');

  const allowedRes = await fetch(`${baseUrl}/api/identity/admin/status`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${login.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      targetUserId: 'usr_mfa_backup_sysadmin',
      newStatus: 'FROZEN',
      reason: 'security containment test',
    }),
  });
  const allowed = await allowedRes.json() as Record<string, unknown>;
  assert.equal(allowedRes.status, 200);
  assert.equal(allowed.accountStatus, 'FROZEN');
});
