import { AccountStatus, AuthenticationAssuranceLevel } from '../../types/identity';
import { UserRole } from '../../types/user';

export const PRIVILEGED_ADMIN_ROLES = new Set<UserRole>(['SYSTEM_ADMIN', 'PLATFORM_ADMIN']);
export const EXECUTIVE_ROLES = new Set<UserRole>(['CEO', 'COO', 'CFO']);

export const AUTH_ASSURANCE = {
  PASSWORD_ONLY: 'AAL1',
  MFA_VERIFIED: 'AAL2',
  HARDWARE_BACKED: 'AAL3',
} as const satisfies Record<string, AuthenticationAssuranceLevel>;

export type HighRiskAction =
  | 'FREEZE_PRIVILEGED_ACCOUNT'
  | 'FREEZE_EXECUTIVE_ACCOUNT'
  | 'DISABLE_PRIVILEGED_ACCOUNT'
  | 'CHANGE_AUTHENTICATION_POLICY'
  | 'DISABLE_MFA'
  | 'RESET_MFA'
  | 'START_IMPERSONATION'
  | 'EXPORT_SENSITIVE_ADMIN_REPORT';

const DESTRUCTIVE_STATUSES = new Set<AccountStatus>(['SUSPENDED', 'FROZEN', 'LOCKED', 'DISABLED', 'INACTIVE', 'DELETED']);

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function getMfaChallengeTtlSeconds(): number {
  return readPositiveIntegerEnv('MFA_CHALLENGE_TTL_SECONDS', 300);
}

export function getPrivilegedStepUpTtlMinutes(): number {
  return readPositiveIntegerEnv('PRIVILEGED_STEP_UP_TTL_MINUTES', 10);
}

export function isPrivilegedAdminRole(role: string | undefined): boolean {
  return !!role && PRIVILEGED_ADMIN_ROLES.has(role as UserRole);
}

export function isExecutiveRole(role: string | undefined): boolean {
  return !!role && EXECUTIVE_ROLES.has(role as UserRole);
}

export function requiresPrivilegedMfa(role: string | undefined): boolean {
  return isPrivilegedAdminRole(role);
}

export function hasPrivilegedMfaAssurance(input: {
  authenticationLevel?: AuthenticationAssuranceLevel;
  mfaVerified?: boolean;
  stepUpExpiresAt?: string;
}): boolean {
  return input.mfaVerified === true && (input.authenticationLevel === 'AAL2' || input.authenticationLevel === 'AAL3');
}

export function classifyAccountStatusHighRiskAction(
  targetRole: string | undefined,
  newStatus: AccountStatus
): HighRiskAction | null {
  if (!DESTRUCTIVE_STATUSES.has(newStatus)) return null;
  if (isPrivilegedAdminRole(targetRole)) {
    return newStatus === 'DISABLED' || newStatus === 'DELETED' || newStatus === 'INACTIVE'
      ? 'DISABLE_PRIVILEGED_ACCOUNT'
      : 'FREEZE_PRIVILEGED_ACCOUNT';
  }
  if (isExecutiveRole(targetRole)) return 'FREEZE_EXECUTIVE_ACCOUNT';
  return null;
}
