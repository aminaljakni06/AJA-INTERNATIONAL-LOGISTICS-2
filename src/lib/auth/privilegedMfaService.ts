import crypto from 'node:crypto';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { getMFAConfig } from '../../db/repositories/identityRepository';
import { HighRiskAction, getMfaChallengeTtlSeconds, getPrivilegedStepUpTtlMinutes } from './privilegedAuthPolicy';

type MfaChallengePurpose = 'LOGIN_MFA' | 'STEP_UP';

interface MfaChallenge {
  challengeId: string;
  userId: string;
  sessionId?: string;
  purpose: MfaChallengePurpose;
  action?: HighRiskAction;
  expiresAtMs: number;
  attempts: number;
  used: boolean;
  createdAt: string;
}

interface StepUpRecord {
  userId: string;
  sessionId: string;
  action: HighRiskAction;
  verifiedAt: string;
  expiresAt: string;
}

const challenges = new Map<string, MfaChallenge>();
const stepUps = new Map<string, StepUpRecord>();
const MAX_MFA_ATTEMPTS = 5;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function auditBestEffort(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  after?: Record<string, unknown>;
}): void {
  createAuditLog(input).catch((err) => {
    console.warn('[PrivilegedMfaService] audit write failed:', err instanceof Error ? err.message : err);
  });
}

function normalizeBase32Secret(secretKey: string): string {
  return secretKey.split('_')[0].replace(/[^A-Z2-7]/gi, '').toUpperCase();
}

function base32ToBuffer(secretKey: string): Buffer {
  const clean = normalizeBase32Secret(secretKey);
  let bits = '';
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateMfaSecret(bytes = 20): string {
  const random = crypto.randomBytes(bytes);
  let bits = '';
  for (const byte of random) bits += byte.toString(2).padStart(8, '0');

  let output = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    output += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }
  return output;
}

export function generateTotpForTesting(secretKey: string, nowMs = Date.now()): string {
  return generateTotp(secretKey, nowMs);
}

function generateTotp(secretKey: string, nowMs: number, stepSeconds = 30, digits = 6): string {
  const counter = Math.floor(nowMs / 1000 / stepSeconds);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', base32ToBuffer(secretKey)).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 10 ** digits).padStart(digits, '0');
}

function verifyTotp(secretKey: string, code: string, nowMs = Date.now(), window = 1): boolean {
  const cleanCode = String(code || '').trim();
  if (!/^\d{6}$/.test(cleanCode)) return false;

  for (let offset = -window; offset <= window; offset++) {
    const candidate = generateTotp(secretKey, nowMs + offset * 30_000);
    if (crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(cleanCode))) return true;
  }
  return false;
}

function stepUpKey(userId: string, sessionId: string, action: HighRiskAction): string {
  return `${userId}:${sessionId}:${action}`;
}

export async function beginMfaChallenge(input: {
  userId: string;
  purpose: MfaChallengePurpose;
  sessionId?: string;
  action?: HighRiskAction;
  ipAddress?: string;
}): Promise<{ challengeId: string; expiresAt: string; purpose: MfaChallengePurpose; action?: HighRiskAction }> {
  const now = Date.now();
  const challenge: MfaChallenge = {
    challengeId: `mfa_${crypto.randomUUID()}`,
    userId: input.userId,
    sessionId: input.sessionId,
    purpose: input.purpose,
    action: input.action,
    expiresAtMs: now + getMfaChallengeTtlSeconds() * 1000,
    attempts: 0,
    used: false,
    createdAt: new Date(now).toISOString(),
  };

  challenges.set(challenge.challengeId, challenge);
  auditBestEffort({
    actorUserId: input.userId,
    action: input.purpose === 'LOGIN_MFA' ? 'MFA_CHALLENGE_CREATED' : 'STEP_UP_CHALLENGE_CREATED',
    entityType: 'MFA_CHALLENGE',
    entityId: challenge.challengeId,
    after: {
      purpose: input.purpose,
      action: input.action,
      expiresAt: new Date(challenge.expiresAtMs).toISOString(),
      ipAddress: input.ipAddress,
    },
  });

  return {
    challengeId: challenge.challengeId,
    expiresAt: new Date(challenge.expiresAtMs).toISOString(),
    purpose: challenge.purpose,
    action: challenge.action,
  };
}

export async function verifyMfaChallenge(input: {
  challengeId: string;
  userId: string;
  code: string;
  sessionId?: string;
}): Promise<{ ok: true; purpose: MfaChallengePurpose; action?: HighRiskAction; verifiedAt: string; stepUpExpiresAt?: string } | { ok: false; errorCode: string; message: string }> {
  const challenge = challenges.get(input.challengeId);
  const now = Date.now();

  if (!challenge || challenge.used) {
    return { ok: false, errorCode: 'MFA_CHALLENGE_INVALID', message: 'MFA challenge is invalid or already used.' };
  }
  if (challenge.userId !== input.userId || (challenge.sessionId && challenge.sessionId !== input.sessionId)) {
    auditBestEffort({
      actorUserId: input.userId,
      action: 'MFA_CHALLENGE_BINDING_REJECTED',
      entityType: 'MFA_CHALLENGE',
      entityId: challenge.challengeId,
      after: { purpose: challenge.purpose, action: challenge.action },
    });
    return { ok: false, errorCode: 'MFA_CHALLENGE_BINDING_FAILED', message: 'MFA challenge does not belong to this authenticated context.' };
  }
  if (now > challenge.expiresAtMs) {
    challenges.delete(input.challengeId);
    return { ok: false, errorCode: 'MFA_CHALLENGE_EXPIRED', message: 'MFA challenge has expired.' };
  }
  if (challenge.attempts >= MAX_MFA_ATTEMPTS) {
    return { ok: false, errorCode: 'MFA_RATE_LIMITED', message: 'Too many MFA attempts for this challenge.' };
  }

  challenge.attempts += 1;
  const config = await getMFAConfig(input.userId);
  if (!config.mfaEnabled || config.method !== 'TOTP' || !config.secretKey) {
    return { ok: false, errorCode: 'MFA_ENROLLMENT_REQUIRED', message: 'TOTP MFA enrollment is required.' };
  }

  if (!verifyTotp(config.secretKey, input.code, now)) {
    auditBestEffort({
      actorUserId: input.userId,
      action: challenge.purpose === 'LOGIN_MFA' ? 'MFA_CHALLENGE_FAILED' : 'STEP_UP_CHALLENGE_FAILED',
      entityType: 'MFA_CHALLENGE',
      entityId: challenge.challengeId,
      after: { purpose: challenge.purpose, action: challenge.action, attempts: challenge.attempts },
    });
    return { ok: false, errorCode: 'MFA_CODE_INVALID', message: 'MFA code is invalid.' };
  }

  challenge.used = true;
  challenges.set(challenge.challengeId, challenge);
  const verifiedAt = new Date(now).toISOString();
  let stepUpExpiresAt: string | undefined;

  if (challenge.purpose === 'STEP_UP' && challenge.sessionId && challenge.action) {
    stepUpExpiresAt = new Date(now + getPrivilegedStepUpTtlMinutes() * 60_000).toISOString();
    stepUps.set(stepUpKey(challenge.userId, challenge.sessionId, challenge.action), {
      userId: challenge.userId,
      sessionId: challenge.sessionId,
      action: challenge.action,
      verifiedAt,
      expiresAt: stepUpExpiresAt,
    });
  }

  auditBestEffort({
    actorUserId: input.userId,
    action: challenge.purpose === 'LOGIN_MFA' ? 'MFA_CHALLENGE_VERIFIED' : 'STEP_UP_CHALLENGE_VERIFIED',
    entityType: 'MFA_CHALLENGE',
    entityId: challenge.challengeId,
    after: { purpose: challenge.purpose, action: challenge.action, stepUpExpiresAt },
  });

  return { ok: true, purpose: challenge.purpose, action: challenge.action, verifiedAt, stepUpExpiresAt };
}

export function hasRecentStepUp(userId: string, sessionId: string | undefined, action: HighRiskAction): boolean {
  if (!sessionId) return false;
  const record = stepUps.get(stepUpKey(userId, sessionId, action));
  if (!record) return false;
  if (Date.now() > new Date(record.expiresAt).getTime()) {
    stepUps.delete(stepUpKey(userId, sessionId, action));
    return false;
  }
  return true;
}

export function clearMfaStateForTesting(): void {
  challenges.clear();
  stepUps.clear();
}
