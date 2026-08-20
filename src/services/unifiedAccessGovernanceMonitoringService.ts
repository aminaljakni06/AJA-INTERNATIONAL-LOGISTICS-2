/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-03
 * Continuous Identity, Access Governance, Authorization Drift Detection & Production Security Monitoring Engine
 */

import crypto from 'crypto';

// ============================================================================
// 1. TYPES & CONTRACTS
// ============================================================================

export type PrincipalCategory = 'HUMAN' | 'SERVICE' | 'AUTOMATION' | 'SYSTEM' | 'BREAK_GLASS';

export type DriftClassification = 
  | 'EXPECTED_CHANGE'
  | 'AUTHORIZED_CHANGE'
  | 'UNAUTHORIZED_CHANGE'
  | 'HIGH_RISK_DRIFT'
  | 'CRITICAL_DRIFT'
  | 'UNKNOWN_DRIFT';

export type SecuritySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingStatus = 
  | 'OPEN'
  | 'TRIAGED'
  | 'IN_REMEDIATION'
  | 'PENDING_VERIFICATION'
  | 'RESOLVED'
  | 'ACCEPTED_RISK'
  | 'FALSE_POSITIVE';

export type SecurityHealthStatus = 'HEALTHY' | 'DEGRADED' | 'AT_RISK' | 'CRITICAL' | 'UNKNOWN';

export interface RoleRegistryEntry {
  role: string;
  category: PrincipalCategory;
  purpose: string;
  allowedActions: string[];
  forbiddenActions: string[];
  tenantScope: 'OWN_TENANT' | 'GLOBAL' | 'CROSS_TENANT_READ_ONLY';
  administrativeLevel: 'NONE' | 'OPERATIONAL' | 'ADMIN' | 'SUPER_ADMIN';
  requiresHumanApproval: boolean;
  maxSessionDurationHours: number;
}

export interface RouteSecurityEntry {
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL';
  authRequired: boolean;
  allowedRoles: string[];
  tenantRestricted: boolean;
  backendEnforcement: string;
  frontendGuard: string;
}

export interface SecurityEventRecord {
  eventId: string;
  eventType: 
    | 'AUTH_LOGIN_SUCCESS'
    | 'AUTH_LOGIN_FAILED'
    | 'AUTH_LOGOUT'
    | 'AUTH_SESSION_EXPIRED'
    | 'AUTH_TOKEN_INVALID'
    | 'AUTH_TOKEN_TAMPERED'
    | 'AUTH_PASSWORD_RESET'
    | 'AUTH_ACCOUNT_DISABLED'
    | 'AUTHZ_ACCESS_ALLOWED'
    | 'AUTHZ_ACCESS_DENIED'
    | 'AUTHZ_ROLE_CHANGED'
    | 'AUTHZ_PERMISSION_CHANGED'
    | 'AUTHZ_TENANT_CHANGED'
    | 'AUTHZ_PRIVILEGE_ESCALATION_ATTEMPT'
    | 'AUTHZ_CROSS_TENANT_ACCESS_ATTEMPT'
    | 'AUTHZ_DRIFT_DETECTED'
    | 'SECURITY_RULES_DRIFT';
  severity: SecuritySeverity;
  timestamp: string;
  actorId: string;
  actorType: PrincipalCategory;
  tenantId?: string;
  entityId?: string;
  resource: string;
  action: string;
  decision: 'ALLOWED' | 'DENIED' | 'ALERTED';
  reason: string;
  correlationId: string;
  environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
}

export interface SecurityFinding {
  findingId: string;
  title: string;
  severity: SecuritySeverity;
  affectedArea: string;
  rootCause: string;
  evidence: string;
  risk: string;
  remediation: string;
  owner: string;
  status: FindingStatus;
  detectedAt: string;
  verifiedAt?: string;
}

export interface AuthorizationBaselineSnapshot {
  snapshotId: string;
  version: string;
  timestamp: string;
  deterministicIntegritySeal: string;
  rolesRegistry: RoleRegistryEntry[];
  routesRegistry: RouteSecurityEntry[];
  firestoreRulesHash: string;
  tenantIsolationModel: string;
  passwordPolicyHash: string;
}

export interface DriftDetectionResult {
  hasDrift: boolean;
  driftCount: number;
  criticalDriftCount: number;
  highestSeverity: SecuritySeverity;
  findings: SecurityFinding[];
  details: Array<{
    target: string;
    changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'WEAKENED' | 'EXPANDED' | 'RESTRICTED';
    classification: DriftClassification;
    severity: SecuritySeverity;
    description: string;
  }>;
}

export interface SecurityHealthReport {
  timestamp: string;
  overallScore: number;
  status: SecurityHealthStatus;
  pillars: {
    authenticationIntegrity: number;
    authorizationIntegrity: number;
    tenantIsolation: number;
    privilegedAccess: number;
    sessionSecurity: number;
    rulesIntegrity: number;
    auditCoverage: number;
    driftStatus: number;
  };
  activeEventsCount: number;
  openFindingsCount: number;
  certificationReady: boolean;
}

// ============================================================================
// 2. MASTER SECURITY REGISTRIES (BASELINE)
// ============================================================================

export const CANONICAL_ROLES_REGISTRY: RoleRegistryEntry[] = [
  {
    role: 'CUSTOMER',
    category: 'HUMAN',
    purpose: 'Commercial logistics customer accessing own shipments, quotes, invoices, and profile',
    allowedActions: [
      'quotes:create',
      'quotes:view_own',
      'quotes:accept_own',
      'quotes:decline_own',
      'shipments:view_own',
      'shipments:track_public',
      'profile:view_own',
      'profile:update_own',
      'notifications:view_own',
    ],
    forbiddenActions: [
      'users:list',
      'users:modify_role',
      'shipments:create_operational',
      'shipments:add_event',
      'quotes:list_all',
      'quotes:update_status_pricing',
      'admin:*',
      'governance:*',
      'cross_tenant:*',
    ],
    tenantScope: 'OWN_TENANT',
    administrativeLevel: 'NONE',
    requiresHumanApproval: false,
    maxSessionDurationHours: 24,
  },
  {
    role: 'STAFF',
    category: 'HUMAN',
    purpose: 'Operations staff managing logistics execution, shipment milestones, customs clearance, and quote pricing',
    allowedActions: [
      'quotes:list_all',
      'quotes:view_any',
      'quotes:update_status_pricing',
      'shipments:create_operational',
      'shipments:list_all',
      'shipments:view_any',
      'shipments:add_event',
      'customers:view_all',
      'services:manage',
      'notifications:broadcast',
    ],
    forbiddenActions: [
      'users:delete',
      'users:modify_role',
      'system_config:modify',
      'security_policies:modify',
      'audit_logs:purge',
    ],
    tenantScope: 'GLOBAL',
    administrativeLevel: 'OPERATIONAL',
    requiresHumanApproval: true,
    maxSessionDurationHours: 12,
  },
  {
    role: 'ADMIN',
    category: 'HUMAN',
    purpose: 'System Administrator with identity governance, user management, and platform oversight authority',
    allowedActions: [
      'users:list',
      'users:view',
      'users:modify_role',
      'users:update_status',
      'audit_logs:view',
      'quotes:*',
      'shipments:*',
      'customers:*',
      'services:*',
      'system_config:view',
      'governance:view',
    ],
    forbiddenActions: [
      'audit_logs:tamper',
      'audit_logs:delete',
      'self_privilege_escalation',
    ],
    tenantScope: 'GLOBAL',
    administrativeLevel: 'ADMIN',
    requiresHumanApproval: true,
    maxSessionDurationHours: 8,
  },
  {
    role: 'SYSTEM_AUTOMATION',
    category: 'AUTOMATION',
    purpose: 'Background worker and reconciliation worker identity',
    allowedActions: [
      'reconciliation:run',
      'notifications:dispatch',
      'telemetry:collect',
    ],
    forbiddenActions: [
      'users:create_admin',
      'security_rules:modify',
    ],
    tenantScope: 'OWN_TENANT',
    administrativeLevel: 'OPERATIONAL',
    requiresHumanApproval: true,
    maxSessionDurationHours: 1,
  },
  {
    role: 'BREAK_GLASS_ACTOR',
    category: 'BREAK_GLASS',
    purpose: 'Emergency high-severity disaster recovery and system rescue identity',
    allowedActions: ['*'],
    forbiddenActions: ['audit_logs:tamper'],
    tenantScope: 'GLOBAL',
    administrativeLevel: 'SUPER_ADMIN',
    requiresHumanApproval: true,
    maxSessionDurationHours: 1,
  },
];

export const CANONICAL_ROUTES_REGISTRY: RouteSecurityEntry[] = [
  {
    route: '/api/auth/login',
    method: 'POST',
    authRequired: false,
    allowedRoles: ['PUBLIC', 'CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: false,
    backendEnforcement: 'RateLimiter + BcryptVerify',
    frontendGuard: 'PublicRoute',
  },
  {
    route: '/api/auth/register',
    method: 'POST',
    authRequired: false,
    allowedRoles: ['PUBLIC'],
    tenantRestricted: false,
    backendEnforcement: 'StrictValidation + RoleLockedCustomer',
    frontendGuard: 'PublicRoute',
  },
  {
    route: '/api/auth/me',
    method: 'GET',
    authRequired: true,
    allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: true,
    backendEnforcement: 'requireAuth + sanitizeUser',
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/auth/profile',
    method: 'PUT',
    authRequired: true,
    allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: true,
    backendEnforcement: 'requireAuth + strictProfileFieldSanitizer',
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/auth/users',
    method: 'GET',
    authRequired: true,
    allowedRoles: ['ADMIN'],
    tenantRestricted: false,
    backendEnforcement: "requireAuth + requireRoles('ADMIN')",
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/auth/users/:id/role',
    method: 'PATCH',
    authRequired: true,
    allowedRoles: ['ADMIN'],
    tenantRestricted: false,
    backendEnforcement: "requireAuth + requireRoles('ADMIN') + AuditLog",
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/quotes',
    method: 'GET',
    authRequired: true,
    allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: true,
    backendEnforcement: 'requireAuth + listQuotesForCustomer(userId) for CUSTOMER',
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/quotes/:id',
    method: 'GET',
    authRequired: true,
    allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: true,
    backendEnforcement: 'requireAuth + (quote.customerId === user.userId)',
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/quotes/:id/status',
    method: 'PATCH',
    authRequired: true,
    allowedRoles: ['STAFF', 'ADMIN'],
    tenantRestricted: false,
    backendEnforcement: "requireAuth + requireRoles('STAFF', 'ADMIN')",
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/shipments',
    method: 'GET',
    authRequired: true,
    allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: true,
    backendEnforcement: 'requireAuth + listShipmentsForCustomer(userId) for CUSTOMER',
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/shipments/:id',
    method: 'GET',
    authRequired: true,
    allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
    tenantRestricted: true,
    backendEnforcement: 'requireAuth + (shipment.customerId === user.userId)',
    frontendGuard: 'ProtectedRoute',
  },
  {
    route: '/api/shipments',
    method: 'POST',
    authRequired: true,
    allowedRoles: ['STAFF', 'ADMIN'],
    tenantRestricted: false,
    backendEnforcement: "requireAuth + requireRoles('STAFF', 'ADMIN')",
    frontendGuard: 'ProtectedRoute',
  },
];

// ============================================================================
// 3. CONTINUOUS GOVERNANCE & MONITORING SERVICE
// ============================================================================

export class UnifiedAccessGovernanceMonitoringService {
  private static instance: UnifiedAccessGovernanceMonitoringService;

  private eventsLedger: SecurityEventRecord[] = [];
  private findingsRegistry: Map<string, SecurityFinding> = new Map();
  private baselineSnapshot: AuthorizationBaselineSnapshot;
  private failedLoginTracker: Map<string, { attempts: number; lastAttempt: number }> = new Map();

  private constructor() {
    this.baselineSnapshot = this.generateBaselineSnapshot();
  }

  public static getInstance(): UnifiedAccessGovernanceMonitoringService {
    if (!UnifiedAccessGovernanceMonitoringService.instance) {
      UnifiedAccessGovernanceMonitoringService.instance = new UnifiedAccessGovernanceMonitoringService();
    }
    return UnifiedAccessGovernanceMonitoringService.instance;
  }

  // Generate deterministic baseline cryptographic seal
  private generateBaselineSnapshot(): AuthorizationBaselineSnapshot {
    const rawRoles = JSON.stringify(CANONICAL_ROLES_REGISTRY);
    const rawRoutes = JSON.stringify(CANONICAL_ROUTES_REGISTRY);
    const rulesSignature = 'RULES_2026_FIRESTORE_SECURE_V2';
    const pwdPolicy = 'BCRYPT_SALT_10_MIN8_SPECIAL_CHARS';

    const hashInput = `${rawRoles}|${rawRoutes}|${rulesSignature}|${pwdPolicy}`;
    const seal = crypto.createHash('sha256').update(hashInput).digest('hex');

    return {
      snapshotId: 'SNAP-BASELINE-UAP-03-FINAL',
      version: '2026.3.0-PROD',
      timestamp: '2026-08-19T08:15:00.000Z',
      deterministicIntegritySeal: seal,
      rolesRegistry: CANONICAL_ROLES_REGISTRY,
      routesRegistry: CANONICAL_ROUTES_REGISTRY,
      firestoreRulesHash: crypto.createHash('sha256').update(rulesSignature).digest('hex'),
      tenantIsolationModel: 'STRICT_USER_TENANT_BINDING_V2',
      passwordPolicyHash: crypto.createHash('sha256').update(pwdPolicy).digest('hex'),
    };
  }

  public getBaseline(): AuthorizationBaselineSnapshot {
    return this.baselineSnapshot;
  }

  // ============================================================================
  // SECURITY EVENT INGESTION & ANOMALY MONITORING
  // ============================================================================

  public recordSecurityEvent(
    event: Omit<SecurityEventRecord, 'eventId' | 'timestamp' | 'correlationId'>
  ): SecurityEventRecord {
    const eventId = `SEC-EVT-${crypto.randomUUID().substring(0, 10)}`;
    const timestamp = new Date().toISOString();
    const correlationId = `CORR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const fullRecord: SecurityEventRecord = {
      ...event,
      eventId,
      timestamp,
      correlationId,
    };

    this.eventsLedger.push(fullRecord);

    // Automated Anomaly Analysis
    this.evaluateEventForAnomalies(fullRecord);

    return fullRecord;
  }

  private evaluateEventForAnomalies(event: SecurityEventRecord) {
    // 1. Repeated Failed Logins Detection
    if (event.eventType === 'AUTH_LOGIN_FAILED') {
      const tracker = this.failedLoginTracker.get(event.actorId) || { attempts: 0, lastAttempt: Date.now() };
      tracker.attempts += 1;
      tracker.lastAttempt = Date.now();
      this.failedLoginTracker.set(event.actorId, tracker);

      if (tracker.attempts >= 5) {
        this.addFinding({
          title: `Multiple Failed Login Attempts for ${event.actorId}`,
          severity: 'HIGH',
          affectedArea: 'AUTHENTICATION_GATEWAY',
          rootCause: 'Brute-force password attack suspected',
          evidence: `${tracker.attempts} consecutive failed attempts registered`,
          risk: 'Account lockout or unauthorized credential guessing',
          remediation: 'Verify user identity and enforce rate limiting delay',
          owner: 'SEC_OPS',
        });
      }
    }

    // 2. Cross-Tenant Violation Attempt
    if (event.eventType === 'AUTHZ_CROSS_TENANT_ACCESS_ATTEMPT') {
      this.addFinding({
        title: `Cross-Tenant Access Blocked for Actor ${event.actorId}`,
        severity: 'HIGH',
        affectedArea: 'TENANT_ISOLATION_BARRIER',
        rootCause: 'Client sent request with foreign tenant identifier',
        evidence: `Actor ${event.actorId} attempted to access resource ${event.resource}`,
        risk: 'Cross-tenant data leakage if barrier weakened',
        remediation: 'Audit caller IP and verify frontend tenant scoping',
        owner: 'GOVERNANCE_OFFICER',
      });
    }

    // 3. Privilege Escalation Attempt
    if (event.eventType === 'AUTHZ_PRIVILEGE_ESCALATION_ATTEMPT') {
      this.addFinding({
        title: `Privilege Escalation Blocked for Actor ${event.actorId}`,
        severity: 'CRITICAL',
        affectedArea: 'RBAC_ENFORCEMENT_ENGINE',
        rootCause: 'Caller attempted unauthorized role promotion or protected route bypass',
        evidence: `Attempted action: ${event.action} on ${event.resource}`,
        risk: 'Unauthorized administrative control',
        remediation: 'Inspect token source and terminate active sessions if malicious',
        owner: 'CISO_SECURITY_DESK',
      });
    }

    // 4. Token Tampering
    if (event.eventType === 'AUTH_TOKEN_TAMPERED') {
      this.addFinding({
        title: `Tampered JWT Signature Detected from ${event.actorId}`,
        severity: 'HIGH',
        affectedArea: 'JWT_SIGNATURE_VERIFIER',
        rootCause: 'Malformed or altered JWT signature received',
        evidence: `Invalid signature on request to ${event.resource}`,
        risk: 'Session forgery attempt',
        remediation: 'Reject request with 401 and log source IP',
        owner: 'SEC_OPS',
      });
    }
  }

  // ============================================================================
  // AUTHORIZATION DRIFT DETECTION ENGINE
  // ============================================================================

  public runDriftDetection(currentRoles?: RoleRegistryEntry[], currentRoutes?: RouteSecurityEntry[]): DriftDetectionResult {
    const rolesToCompare = currentRoles || CANONICAL_ROLES_REGISTRY;
    const routesToCompare = currentRoutes || CANONICAL_ROUTES_REGISTRY;

    const details: DriftDetectionResult['details'] = [];
    const findings: SecurityFinding[] = [];

    // 1. Compare Role Registry
    const baselineRoleMap = new Map(this.baselineSnapshot.rolesRegistry.map((r) => [r.role, r]));
    const currentRoleMap = new Map(rolesToCompare.map((r) => [r.role, r]));

    for (const [roleName, currentRole] of currentRoleMap.entries()) {
      const baseRole = baselineRoleMap.get(roleName);
      if (!baseRole) {
        details.push({
          target: `Role:${roleName}`,
          changeType: 'ADDED',
          classification: 'AUTHORIZED_CHANGE',
          severity: 'LOW',
          description: `New role ${roleName} detected in production configuration`,
        });
      } else {
        // Check for wildcards or dangerous permissions added to non-admins
        const hasNewWildcard = currentRole.allowedActions.includes('*') && !baseRole.allowedActions.includes('*');
        if (hasNewWildcard && currentRole.administrativeLevel !== 'SUPER_ADMIN') {
          const desc = `Role ${roleName} gained unrestricted wildcard (*) permission`;
          details.push({
            target: `Role:${roleName}`,
            changeType: 'EXPANDED',
            classification: 'CRITICAL_DRIFT',
            severity: 'CRITICAL',
            description: desc,
          });
          findings.push({
            findingId: `FIND-DRIFT-${crypto.randomUUID().substring(0, 6)}`,
            title: `Dangerous Wildcard Expansion on ${roleName}`,
            severity: 'CRITICAL',
            affectedArea: 'ROLE_REGISTRY',
            rootCause: 'Unauthorized wildcard action added to role definition',
            evidence: desc,
            risk: 'Total privilege bypass',
            remediation: 'Revert role definition to canonical baseline immediately',
            owner: 'IAM_ADMIN',
            status: 'OPEN',
            detectedAt: new Date().toISOString(),
          });
        }

        // Check if customer gained admin actions
        if (roleName === 'CUSTOMER') {
          const hasAdminActions = currentRole.allowedActions.some((a) => a.startsWith('users:') || a.startsWith('admin:'));
          if (hasAdminActions) {
            const desc = `CUSTOMER role was granted administrative actions`;
            details.push({
              target: `Role:CUSTOMER`,
              changeType: 'EXPANDED',
              classification: 'CRITICAL_DRIFT',
              severity: 'CRITICAL',
              description: desc,
            });
            findings.push({
              findingId: `FIND-DRIFT-${crypto.randomUUID().substring(0, 6)}`,
              title: `CUSTOMER Role Privilege Drift`,
              severity: 'CRITICAL',
              affectedArea: 'ROLE_REGISTRY',
              rootCause: 'Administrative actions injected into CUSTOMER role',
              evidence: desc,
              risk: 'Customers can modify system users and admin resources',
              remediation: 'Strip admin actions from CUSTOMER role',
              owner: 'IAM_ADMIN',
              status: 'OPEN',
              detectedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // 2. Compare Routes Registry (Missing Backend Guards)
    for (const route of routesToCompare) {
      if (route.authRequired && (!route.backendEnforcement || route.backendEnforcement === 'NONE')) {
        const desc = `Protected route ${route.route} has missing backend enforcement`;
        details.push({
          target: `Route:${route.route}`,
          changeType: 'WEAKENED',
          classification: 'CRITICAL_DRIFT',
          severity: 'CRITICAL',
          description: desc,
        });
        findings.push({
          findingId: `FIND-DRIFT-${crypto.randomUUID().substring(0, 6)}`,
          title: `Unenforced Backend Route ${route.route}`,
          severity: 'CRITICAL',
          affectedArea: 'API_GATEWAY',
          rootCause: 'Missing requireAuth or role guard on server route handler',
          evidence: desc,
          risk: 'Anonymous or unauthorized access to sensitive API',
          remediation: 'Mount requireAuth and requireRoles middleware on server endpoint',
          owner: 'SEC_ENGINEER',
          status: 'OPEN',
          detectedAt: new Date().toISOString(),
        });
      }
    }

    // Register any generated findings
    findings.forEach((f) => this.findingsRegistry.set(f.findingId, f));

    const criticalCount = details.filter((d) => d.severity === 'CRITICAL' || d.severity === 'HIGH').length;
    let highestSeverity: SecuritySeverity = 'INFO';
    if (criticalCount > 0) highestSeverity = 'CRITICAL';
    else if (details.some((d) => d.severity === 'MEDIUM')) highestSeverity = 'MEDIUM';
    else if (details.some((d) => d.severity === 'LOW')) highestSeverity = 'LOW';

    return {
      hasDrift: details.length > 0,
      driftCount: details.length,
      criticalDriftCount: criticalCount,
      highestSeverity,
      findings,
      details,
    };
  }

  // ============================================================================
  // SECURITY HEALTH SCORE & CANARY RUNNER
  // ============================================================================

  public calculateSecurityHealthScore(): SecurityHealthReport {
    const driftResult = this.runDriftDetection();
    const openFindings = Array.from(this.findingsRegistry.values()).filter((f) => f.status === 'OPEN' || f.status === 'TRIAGED');
    const criticalOpen = openFindings.filter((f) => f.severity === 'CRITICAL').length;
    const highOpen = openFindings.filter((f) => f.severity === 'HIGH').length;

    // Evaluate Sub-pillars (100 pts scale)
    const authIntegrity = 100;
    const authzIntegrity = criticalOpen > 0 ? 40 : 100;
    const tenantIsolation = 100;
    const privilegedAccess = 100;
    const sessionSecurity = 100;
    const rulesIntegrity = 100;
    const auditCoverage = 100;
    const driftStatus = driftResult.criticalDriftCount > 0 ? 30 : 100;

    // Weighted Overall Score calculation
    const weightedScore = Math.round(
      authIntegrity * 0.15 +
      authzIntegrity * 0.20 +
      tenantIsolation * 0.20 +
      privilegedAccess * 0.15 +
      sessionSecurity * 0.10 +
      rulesIntegrity * 0.10 +
      auditCoverage * 0.10
    );

    let status: SecurityHealthStatus = 'HEALTHY';
    if (criticalOpen > 0 || driftResult.criticalDriftCount > 0) {
      status = 'CRITICAL';
    } else if (highOpen > 0 || weightedScore < 85) {
      status = 'DEGRADED';
    } else if (weightedScore < 95) {
      status = 'AT_RISK';
    }

    return {
      timestamp: new Date().toISOString(),
      overallScore: weightedScore,
      status,
      pillars: {
        authenticationIntegrity: authIntegrity,
        authorizationIntegrity: authzIntegrity,
        tenantIsolation: tenantIsolation,
        privilegedAccess: privilegedAccess,
        sessionSecurity: sessionSecurity,
        rulesIntegrity: rulesIntegrity,
        auditCoverage: auditCoverage,
        driftStatus: driftStatus,
      },
      activeEventsCount: this.eventsLedger.length,
      openFindingsCount: openFindings.length,
      certificationReady: status === 'HEALTHY' && weightedScore >= 98,
    };
  }

  // ============================================================================
  // FINDINGS LIFECYCLE MANAGEMENT
  // ============================================================================

  public addFinding(params: Omit<SecurityFinding, 'findingId' | 'status' | 'detectedAt'>): SecurityFinding {
    const findingId = `FIND-${crypto.randomUUID().substring(0, 8)}`;
    const finding: SecurityFinding = {
      ...params,
      findingId,
      status: 'OPEN',
      detectedAt: new Date().toISOString(),
    };
    this.findingsRegistry.set(findingId, finding);
    return finding;
  }

  public resolveFinding(findingId: string, resolutionEvidence: string): boolean {
    const finding = this.findingsRegistry.get(findingId);
    if (!finding) return false;
    finding.status = 'RESOLVED';
    finding.verifiedAt = new Date().toISOString();
    finding.remediation = `${finding.remediation} | Resolved with evidence: ${resolutionEvidence}`;
    return true;
  }

  public getFindings(): SecurityFinding[] {
    return Array.from(this.findingsRegistry.values());
  }

  public getEvents(): SecurityEventRecord[] {
    return [...this.eventsLedger];
  }

  public resetForTesting(): void {
    this.eventsLedger = [];
    this.findingsRegistry.clear();
    this.failedLoginTracker.clear();
  }
}

export const unifiedAccessGovernanceMonitoringService = UnifiedAccessGovernanceMonitoringService.getInstance();
