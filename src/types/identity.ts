import { UserRole } from './user';

export type IdentityType =
  | 'EMPLOYEE'
  | 'CUSTOMER'
  | 'PARTNER'
  | 'VENDOR'
  | 'SUPPLIER'
  | 'DRIVER'
  | 'CONTRACTOR'
  | 'AUDITOR'
  | 'EXTERNAL_USER'
  | 'SYSTEM_ACCOUNT'
  | 'SERVICE_ACCOUNT';

export type AccountStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'FROZEN'
  | 'LOCKED'
  | 'EXPIRED'
  | 'DISABLED'
  | 'ARCHIVED'
  | 'DELETED';

export type MFAMethod = 'TOTP' | 'SMS' | 'EMAIL' | 'SECURITY_KEY';

export type DeviceTrustStatus = 'TRUSTED' | 'UNTRUSTED' | 'REVOKED';

export type SessionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: 'ar' | 'en';
  timezone?: string;
  compactView?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface IdentityProfile {
  identityId: string;
  userId: string;
  employeeId?: string;
  customerId?: string;
  partnerId?: string;
  agentId?: string;
  username: string;
  primaryEmail: string;
  secondaryEmail?: string;
  primaryPhone: string;
  profilePhoto?: string;
  preferredLanguage: 'ar' | 'en';
  timezone: string;
  
  // Enterprise Organizational Context
  companyId?: string;
  companyName?: string;
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  
  // Status & Role
  identityType: IdentityType;
  accountStatus: AccountStatus;
  role: UserRole;
  employmentStatus?: string;
  securityLevel: number;
  
  // Auditing & Security Tracking
  lastLogin?: string;
  passwordUpdatedDate?: string;
  mfaEnabled: boolean;
  mfaType?: MFAMethod;
  riskScore?: number;
  
  // Extended Profile Data
  emergencyContacts?: EmergencyContact[];
  preferences?: UserPreferences;
  notificationSettings?: Record<string, boolean>;
  accessibilitySettings?: Record<string, boolean>;
  metadata?: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  expiryDays: number;
  preventReuseCount: number;
  maxFailedAttempts: number;
  lockDurationMinutes: number;
  allowTemporaryPasswords: boolean;
}

export interface LoginPolicy {
  allowedDevices: string[];
  allowedCountries: string[];
  allowedBranches: string[];
  allowedHours: Array<{ start: string; end: string }>;
  maxConcurrentSessions: number;
  riskScoreThreshold: number;
}

export interface UserSessionRecord {
  sessionId: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  deviceName: string;
  browser: string;
  os: string;
  location?: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  status: SessionStatus;
  isRememberMe: boolean;
}

export interface RegisteredDeviceRecord {
  deviceId: string;
  userId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  trustStatus: DeviceTrustStatus;
  serialFingerprint: string;
  createdAt: string;
  updatedAt: string;
}

export interface MFAConfiguration {
  userId: string;
  mfaEnabled: boolean;
  method: MFAMethod;
  backupCodes: string[];
  secretKey?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  updatedAt: string;
}

export interface IdentityAuditEvent {
  eventId: string;
  userId: string;
  actorUserId: string;
  eventType: 
    | 'IDENTITY_CREATED'
    | 'IDENTITY_UPDATED'
    | 'STATUS_CHANGED'
    | 'PASSWORD_CHANGED'
    | 'PASSWORD_RESET'
    | 'MFA_ENABLED'
    | 'MFA_DISABLED'
    | 'SESSION_CREATED'
    | 'SESSION_REVOKED'
    | 'DEVICE_REGISTERED'
    | 'DEVICE_TRUSTED'
    | 'DEVICE_REVOKED'
    | 'LOGIN_POLICY_VIOLATED';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// --- ENTERPRISE AUTHENTICATION & SSO TYPES ---

export type SSOProviderType = 
  | 'INTERNAL'
  | 'GOOGLE'
  | 'MICROSOFT'
  | 'APPLE'
  | 'GITHUB'
  | 'LINKEDIN'
  | 'SAML_CUSTOM'
  | 'OIDC_CUSTOM';

export interface SSOProviderConfig {
  providerId: string;
  type: SSOProviderType;
  name: string;
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  issuerUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  redirectUri?: string;
  scopes?: string[];
  samlMetadataUrl?: string;
  samlEntityId?: string;
  samlCertificate?: string;
  icon?: string;
  displayOrder: number;
  updatedAt: string;
}

export interface LinkedAccount {
  id: string;
  userId: string;
  provider: SSOProviderType;
  providerUserId: string;
  providerEmail: string;
  providerDisplayName?: string;
  providerPhoto?: string;
  linkedAt: string;
  lastLoginAt?: string;
  metadata?: Record<string, any>;
}

export interface PasskeyCredential {
  credentialId: string;
  userId: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  authenticatorAttachment?: 'platform' | 'cross-platform';
  friendlyName: string;
  createdAt: string;
  lastUsedAt?: string;
  aaguid?: string;
}

export interface AdaptiveAuthRiskAssessment {
  assessmentId: string;
  userId: string;
  riskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  requiresMFA: boolean;
  blocked: boolean;
  locationDetails?: {
    ip: string;
    country: string;
    city: string;
    isImpossibleTravel?: boolean;
    isUnknownDevice?: boolean;
  };
  evaluatedAt: string;
}

export interface OAuth20PKCERequest {
  clientId: string;
  redirectUri: string;
  responseType: 'code';
  scope: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
}

export interface OIDCDiscoveryConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  scopes_supported: string[];
  response_types_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
}

export interface SAMLMetadataConfig {
  entityId: string;
  ssoServiceUrl: string;
  sloServiceUrl?: string;
  x509Certificate: string;
  nameIdFormat: string;
}
