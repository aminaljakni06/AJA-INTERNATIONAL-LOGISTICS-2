export type IdentityType = 'EMPLOYEE' | 'PARTNER' | 'DRIVER' | 'SERVICE_ACCOUNT' | 'AI_AGENT' | 'IOT_DEVICE';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_APPROVAL';

export type MFAStatus = 'PASSKEY_FIDO2' | 'AUTHENTICATOR_APP' | 'SMS_OTP' | 'DISABLED';

export interface EnterpriseIdentity {
  id: string;
  username: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  type: IdentityType;
  status: AccountStatus;
  roles: string[];
  mfaMethod: MFAStatus;
  riskScore: number; // 0 to 100
  lastLoginAt: string;
  associatedDevicesCount: number;
  ipAddressLocation: string;
}

export interface PrivilegedAccessRequest {
  requestId: string;
  targetIdentityId: string;
  requesterName: string;
  requestedRole: string; // e.g. ZATCA_PROD_DEPLOYER, DB_ROOT_ADMIN
  justificationReason: string;
  timeWindowMinutes: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED';
  approvedBy?: string;
  requestedAt: string;
  expiresAt: string;
}

export interface ZeroTrustPolicy {
  policyId: string;
  policyNameAr: string;
  policyNameEn: string;
  resourceTarget: string;
  enforcementMode: 'STRICT_BLOCK' | 'STEP_UP_MFA' | 'ALLOW_AUDIT';
  deviceComplianceRequired: boolean;
  mTLSEnforced: boolean;
  locationRestriction: string;
  activeStatus: boolean;
}

export interface SecretVaultItem {
  secretId: string;
  secretName: string;
  category: 'API_KEY' | 'MTLS_CERTIFICATE' | 'DB_CREDENTIAL' | 'JWT_SIGNING_KEY';
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX';
  lastRotatedAt: string;
  nextRotationDueAt: string;
  autoRotateEnabled: boolean;
  version: string;
}

export interface SIEMSecurityEvent {
  eventId: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'UNAUTHORIZED_ACCESS' | 'BRUTE_FORCE' | 'API_ABUSE' | 'PRIVILEGE_ESCALATION' | 'ANOMALOUS_GEO';
  sourceIp: string;
  sourceLocation: string;
  affectedTarget: string;
  mitreTechniqueId?: string; // e.g. T1078 (Valid Accounts)
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
}

export interface SOARPlaybook {
  playbookId: string;
  nameAr: string;
  nameEn: string;
  triggerEvent: string;
  automatedActions: string[];
  executionCountToday: number;
  lastTriggeredAt: string;
}

export interface SOCExecutiveDashboard {
  identityHealthScore: number; // 0 - 100
  zeroTrustCompliancePct: number;
  mfaAdoptionPct: number;
  activeThreatCount: number;
  criticalAlertsToday: number;
  avgIncidentResolutionMinutes: number;
  nistCompliancePct: number;
  iso27001CompliancePct: number;
  pciDssCompliancePct: number;
}
