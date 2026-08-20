/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-05
 * Adaptive Zero-Trust Identity Defense, Continuous Access Evaluation & Autonomous Security Orchestration Engine
 */

import crypto from 'crypto';
import { 
  unifiedAccessGovernanceMonitoringService,
  CANONICAL_ROLES_REGISTRY,
  CANONICAL_ROUTES_REGISTRY,
  RoleRegistryEntry,
  RouteSecurityEntry,
  PrincipalCategory,
} from './unifiedAccessGovernanceMonitoringService';
import { 
  identityIncidentResponseService,
  SecurityIncident,
} from './identityIncidentResponseService';

// ============================================================================
// 1. CANONICAL ACCESS DECISION & RISK TYPES
// ============================================================================

export type AccessDecisionType =
  | 'ALLOW'
  | 'ALLOW_WITH_MONITORING'
  | 'STEP_UP_REQUIRED'
  | 'RESTRICT'
  | 'DENY'
  | 'CONTAIN';

export type IdentityRiskTier = 'TRUSTED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface SensitiveActionDefinition {
  actionId: string;
  name: string;
  requiredRole: string[];
  requiredPermission: string[];
  tenantScope: 'OWN_TENANT' | 'GLOBAL';
  baseRisk: number; // 0 to 100
  stepUpRequired: boolean;
  humanApprovalRequired: boolean;
  auditRequired: boolean;
}

export interface AccessEvaluationContext {
  principalId: string;
  principalRole: string;
  principalCategory: PrincipalCategory;
  tenantId?: string;
  entityId?: string;
  resource: string;
  action: string;
  targetTenantId?: string;
  targetEntityId?: string;
  sessionAgeSeconds?: number;
  tokenVersion?: number;
  jti?: string;
  sourceIp?: string;
  userAgent?: string;
  stepUpCompleted?: boolean;
  stepUpTimestamp?: number;
  breakGlassActivationId?: string;
  correlationId?: string;
}

export interface RiskSignalItem {
  signalCode: string;
  description: string;
  weight: number;
  adjustment: number;
}

export interface RiskScoreBreakdown {
  baseScore: number;
  signals: RiskSignalItem[];
  finalScore: number; // 0 to 100
  riskTier: IdentityRiskTier;
  reasonCodes: string[];
}

export interface AccessEvaluationDecision {
  decisionId: string;
  timestamp: string;
  principalId: string;
  tenantId?: string;
  entityId?: string;
  resource: string;
  action: string;
  decision: AccessDecisionType;
  allowed: boolean;
  reasonCodes: string[];
  riskScore: number;
  riskTier: IdentityRiskTier;
  riskBreakdown: RiskScoreBreakdown;
  policyVersion: string;
  policySeal: string;
  correlationId: string;
  publicMessage: string;
}

// ============================================================================
// 2. SENSITIVE ACTIONS CANONICAL REGISTRY
// ============================================================================

export const CANONICAL_SENSITIVE_ACTIONS: SensitiveActionDefinition[] = [
  {
    actionId: 'users:modify_role',
    name: 'Modify User Administrative Role',
    requiredRole: ['ADMIN'],
    requiredPermission: ['users:modify_role'],
    tenantScope: 'GLOBAL',
    baseRisk: 75,
    stepUpRequired: true,
    humanApprovalRequired: true,
    auditRequired: true,
  },
  {
    actionId: 'security:modify_rules',
    name: 'Modify Firestore Security Rules',
    requiredRole: ['ADMIN'],
    requiredPermission: ['security:modify_rules'],
    tenantScope: 'GLOBAL',
    baseRisk: 90,
    stepUpRequired: true,
    humanApprovalRequired: true,
    auditRequired: true,
  },
  {
    actionId: 'break_glass:activate',
    name: 'Activate Break-Glass Emergency Mode',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
    requiredPermission: ['break_glass:activate'],
    tenantScope: 'GLOBAL',
    baseRisk: 85,
    stepUpRequired: true,
    humanApprovalRequired: true,
    auditRequired: true,
  },
  {
    actionId: 'incidents:close_critical',
    name: 'Close Critical Security Incident',
    requiredRole: ['ADMIN'],
    requiredPermission: ['incidents:close_critical'],
    tenantScope: 'GLOBAL',
    baseRisk: 60,
    stepUpRequired: false,
    humanApprovalRequired: false,
    auditRequired: true,
  },
  {
    actionId: 'quotes:update_status_pricing',
    name: 'Update Operational Quote Status and Pricing',
    requiredRole: ['STAFF', 'ADMIN'],
    requiredPermission: ['quotes:update_status_pricing'],
    tenantScope: 'GLOBAL',
    baseRisk: 40,
    stepUpRequired: false,
    humanApprovalRequired: false,
    auditRequired: true,
  },
  {
    actionId: 'quotes:view_own',
    name: 'View Own Customer Quotes',
    requiredRole: ['CUSTOMER', 'STAFF', 'ADMIN'],
    requiredPermission: ['quotes:view_own'],
    tenantScope: 'OWN_TENANT',
    baseRisk: 10,
    stepUpRequired: false,
    humanApprovalRequired: false,
    auditRequired: false,
  },
];

// ============================================================================
// 3. CONTINUOUS ACCESS EVALUATION SERVICE
// ============================================================================

export class ContinuousAccessEvaluationService {
  private static instance: ContinuousAccessEvaluationService;

  private policyVersion: string = '2026.5.0-ADAPTIVE-ZERO-TRUST';
  private policySeal: string;
  private accessDecisionsLog: AccessEvaluationDecision[] = [];
  private stepUpChallenges: Map<string, { principalId: string; challengeCode: string; expiresAt: number; completed: boolean }> = new Map();
  private userLiveRoles: Map<string, string> = new Map();
  private tenantRiskProfiles: Map<string, number> = new Map();

  private constructor() {
    this.policySeal = this.calculatePolicyIntegritySeal();
  }

  public static getInstance(): ContinuousAccessEvaluationService {
    if (!ContinuousAccessEvaluationService.instance) {
      ContinuousAccessEvaluationService.instance = new ContinuousAccessEvaluationService();
    }
    return ContinuousAccessEvaluationService.instance;
  }

  // ==========================================================================
  // POLICY INTEGRITY SEAL
  // ==========================================================================

  public calculatePolicyIntegritySeal(): string {
    const rawRoles = JSON.stringify(CANONICAL_ROLES_REGISTRY);
    const rawRoutes = JSON.stringify(CANONICAL_ROUTES_REGISTRY);
    const rawActions = JSON.stringify(CANONICAL_SENSITIVE_ACTIONS);
    const hashInput = `${this.policyVersion}|${rawRoles}|${rawRoutes}|${rawActions}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  public getPolicySeal(): string {
    return this.policySeal;
  }

  // ==========================================================================
  // CONTINUOUS ACCESS EVALUATION ENGINE
  // ==========================================================================

  public evaluateAccess(context: AccessEvaluationContext): AccessEvaluationDecision {
    const decisionId = `DEC-${Date.now()}-${crypto.randomUUID().substring(0, 6)}`;
    const timestamp = new Date().toISOString();
    const correlationId = context.correlationId || `CORR-${crypto.randomUUID().substring(0, 6)}`;

    const reasonCodes: string[] = [];
    let decision: AccessDecisionType = 'ALLOW';
    let allowed = true;
    let publicMessage = 'Access granted';

    // ------------------------------------------------------------------------
    // GATE 1: PRIMARY HARD INVARIANTS (Never bypassed by risk score)
    // ------------------------------------------------------------------------

    // 1.1 Token and Session Revocation Invariant
    const isTokenValid = identityIncidentResponseService.isTokenValid(
      context.principalId,
      context.jti,
      context.tokenVersion
    );
    if (!isTokenValid) {
      decision = 'CONTAIN';
      allowed = false;
      reasonCodes.push('ACTIVE_CONTAINMENT_OR_REVOKED_SESSION');
      const incidents = identityIncidentResponseService.getAllIncidents();
      const activeIncident = incidents.find(
        (i) => i.actorId === context.principalId && i.status !== 'CLOSED' && i.status !== 'RESOLVED'
      );
      if (activeIncident) {
        reasonCodes.push(`ACTIVE_INCIDENT_${activeIncident.incidentType}`);
      }
      publicMessage = 'Session invalidated or identity contained. Please re-authenticate.';
      return this.recordDecision(decisionId, timestamp, context, decision, allowed, reasonCodes, 100, 'CRITICAL', correlationId, publicMessage);
    }

    // 1.2 Live Role Synchronization (Detect if role was revoked mid-session)
    const liveRole = this.userLiveRoles.get(context.principalId) || context.principalRole;
    if (liveRole !== context.principalRole) {
      // If caller claims a role higher than their live role -> IMMEDIATE DENY
      if (context.principalRole === 'ADMIN' && liveRole !== 'ADMIN') {
        decision = 'DENY';
        allowed = false;
        reasonCodes.push('STALE_PRIVILEGE_SESSION_REVOKED');
        publicMessage = 'Access denied: role permissions have changed.';
        return this.recordDecision(decisionId, timestamp, context, decision, allowed, reasonCodes, 95, 'CRITICAL', correlationId, publicMessage);
      }
    }

    // 1.3 Tenant Isolation Invariant
    if (liveRole === 'CUSTOMER') {
      if (context.targetTenantId && context.tenantId && context.targetTenantId !== context.tenantId) {
        decision = 'DENY';
        allowed = false;
        reasonCodes.push('CROSS_TENANT_BARRIER_VIOLATION');
        publicMessage = 'Access denied: Resource belongs to a different organization.';
        
        // Auto-ingest security event
        unifiedAccessGovernanceMonitoringService.recordSecurityEvent({
          eventType: 'AUTHZ_CROSS_TENANT_ACCESS_ATTEMPT',
          severity: 'HIGH',
          actorId: context.principalId,
          actorType: context.principalCategory,
          tenantId: context.tenantId,
          resource: context.resource,
          action: context.action,
          decision: 'DENIED',
          reason: 'Cross-tenant barrier violation',
          environment: 'PRODUCTION',
        });

        return this.recordDecision(decisionId, timestamp, context, decision, allowed, reasonCodes, 90, 'HIGH', correlationId, publicMessage);
      }
    }

    // 1.4 Break-Glass Continuous Validity (If acting under Break-Glass)
    let isBreakGlassValid = false;
    if (context.breakGlassActivationId) {
      isBreakGlassValid = identityIncidentResponseService.isBreakGlassActive(context.breakGlassActivationId);
      if (!isBreakGlassValid) {
        decision = 'DENY';
        allowed = false;
        reasonCodes.push('EXPIRED_BREAK_GLASS_SESSION');
        publicMessage = 'Access denied: Emergency break-glass session has expired.';
        return this.recordDecision(decisionId, timestamp, context, decision, allowed, reasonCodes, 85, 'HIGH', correlationId, publicMessage);
      }
    }

    // 1.5 Sensitive Action Role & Permission Checks
    const sensitiveAction = CANONICAL_SENSITIVE_ACTIONS.find((a) => a.actionId === context.action);
    if (sensitiveAction) {
      if (!sensitiveAction.requiredRole.includes(liveRole)) {
        decision = 'DENY';
        allowed = false;
        reasonCodes.push('INSUFFICIENT_ROLE_FOR_SENSITIVE_ACTION');
        publicMessage = 'Access denied: You do not possess the required role for this action.';
        return this.recordDecision(decisionId, timestamp, context, decision, allowed, reasonCodes, 75, 'HIGH', correlationId, publicMessage);
      }
    }

    // ------------------------------------------------------------------------
    // GATE 2: DYNAMIC IDENTITY & CONTEXTUAL RISK EVALUATION
    // ------------------------------------------------------------------------

    const riskBreakdown = this.calculateRiskScore(context, sensitiveAction);

    // ------------------------------------------------------------------------
    // GATE 3: ADAPTIVE ZERO-TRUST ENFORCEMENT DECISION
    // ------------------------------------------------------------------------

    const stepUpSatisfied = context.stepUpCompleted === true || isBreakGlassValid;

    if (sensitiveAction && sensitiveAction.stepUpRequired && !stepUpSatisfied) {
      decision = 'STEP_UP_REQUIRED';
      allowed = false;
      reasonCodes.push('STEP_UP_AUTHENTICATION_REQUIRED', ...riskBreakdown.reasonCodes);
      publicMessage = 'Additional security verification is required to proceed.';
    } else if (riskBreakdown.riskTier === 'CRITICAL' && !isBreakGlassValid) {
      decision = 'CONTAIN';
      allowed = false;
      reasonCodes.push(...riskBreakdown.reasonCodes);
      publicMessage = 'Access denied and identity contained due to critical security risk.';
    } else if (riskBreakdown.riskTier === 'HIGH' || riskBreakdown.riskTier === 'CRITICAL') {
      if (stepUpSatisfied) {
        decision = 'ALLOW_WITH_MONITORING';
        allowed = true;
        reasonCodes.push('STEP_UP_VERIFIED_ALLOW', ...riskBreakdown.reasonCodes);
        publicMessage = 'Access granted with verified step-up credentials and security monitoring.';
      } else {
        decision = 'RESTRICT';
        allowed = false;
        reasonCodes.push(...riskBreakdown.reasonCodes);
        publicMessage = 'Access restricted due to elevated risk profile.';
      }
    } else if (riskBreakdown.riskTier === 'MEDIUM') {
      decision = 'ALLOW_WITH_MONITORING';
      allowed = true;
      reasonCodes.push('MODERATE_RISK_MONITORED', ...riskBreakdown.reasonCodes);
      publicMessage = 'Access granted with enhanced telemetry monitoring.';
    } else {
      decision = 'ALLOW';
      allowed = true;
      reasonCodes.push('LOW_RISK_VERIFIED');
      publicMessage = 'Access granted.';
    }

    return this.recordDecision(
      decisionId,
      timestamp,
      context,
      decision,
      allowed,
      reasonCodes,
      riskBreakdown.finalScore,
      riskBreakdown.riskTier,
      correlationId,
      publicMessage,
      riskBreakdown
    );
  }

  // ==========================================================================
  // DYNAMIC RISK SCORING ENGINE
  // ==========================================================================

  public calculateRiskScore(
    context: AccessEvaluationContext,
    sensitiveAction?: SensitiveActionDefinition
  ): RiskScoreBreakdown {
    let baseScore = sensitiveAction ? sensitiveAction.baseRisk : 10;
    const signals: RiskSignalItem[] = [];
    const reasonCodes: string[] = [];

    // Signal 1: Active Security Incident on Principal
    const incidents = identityIncidentResponseService.getAllIncidents();
    const activeIncident = incidents.find(
      (i) => i.actorId === context.principalId && i.status !== 'CLOSED' && i.status !== 'RESOLVED'
    );
    if (activeIncident) {
      const adjustment = activeIncident.severity === 'CRITICAL' ? 50 : activeIncident.severity === 'HIGH' ? 30 : 15;
      signals.push({
        signalCode: 'ACTIVE_SECURITY_INCIDENT',
        description: `Active incident ${activeIncident.incidentId} (${activeIncident.incidentType})`,
        weight: 0.3,
        adjustment,
      });
      baseScore += adjustment;
      reasonCodes.push(`ACTIVE_INCIDENT_${activeIncident.incidentType}`);
    }

    // Signal 2: Tenant Risk Profile
    if (context.tenantId) {
      const tenantRisk = this.tenantRiskProfiles.get(context.tenantId) || 0;
      if (tenantRisk > 50) {
        const adjustment = Math.round(tenantRisk * 0.5);
        signals.push({
          signalCode: 'ELEVATED_TENANT_RISK',
          description: `Tenant ${context.tenantId} has elevated risk profile (${tenantRisk})`,
          weight: 0.2,
          adjustment,
        });
        baseScore += adjustment;
        reasonCodes.push('ELEVATED_TENANT_RISK');
      }
    }

    // Signal 3: Session Age (> 8 hours without step-up)
    if (context.sessionAgeSeconds && context.sessionAgeSeconds > 8 * 3600) {
      signals.push({
        signalCode: 'SESSION_STALE',
        description: 'Session older than 8 hours',
        weight: 0.1,
        adjustment: 15,
      });
      baseScore += 15;
      reasonCodes.push('SESSION_AGE_EXCEEDED');
    }

    // Signal 4: Break-Glass Active Mode
    if (context.breakGlassActivationId) {
      signals.push({
        signalCode: 'BREAK_GLASS_ELEVATION',
        description: 'Operation executed under emergency break-glass elevation',
        weight: 0.2,
        adjustment: 25,
      });
      baseScore += 25;
      reasonCodes.push('BREAK_GLASS_OPERATION');
    }

    const finalScore = Math.min(100, Math.max(0, baseScore));

    let riskTier: IdentityRiskTier = 'TRUSTED';
    if (finalScore >= 80) {
      riskTier = 'CRITICAL';
    } else if (finalScore >= 60) {
      riskTier = 'HIGH';
    } else if (finalScore >= 35) {
      riskTier = 'MEDIUM';
    } else if (finalScore >= 15) {
      riskTier = 'LOW';
    }

    return {
      baseScore,
      signals,
      finalScore,
      riskTier,
      reasonCodes,
    };
  }

  // ==========================================================================
  // STEP-UP AUTHENTICATION CHALLENGE WORKFLOW
  // ==========================================================================

  public createStepUpChallenge(principalId: string): { challengeCode: string; expiresAt: number } {
    const challengeCode = `CHAL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    this.stepUpChallenges.set(principalId, {
      principalId,
      challengeCode,
      expiresAt,
      completed: false,
    });
    return { challengeCode, expiresAt };
  }

  public completeStepUpChallenge(principalId: string, providedCode: string): boolean {
    const challenge = this.stepUpChallenges.get(principalId);
    if (!challenge) return false;
    if (Date.now() > challenge.expiresAt) return false;
    if (challenge.challengeCode !== providedCode) return false;

    challenge.completed = true;
    return true;
  }

  // ==========================================================================
  // LIVE ROLE & TENANT MUTATION HOOKS (REAL-TIME REVOCATION)
  // ==========================================================================

  public setLiveUserRole(userId: string, role: string): void {
    this.userLiveRoles.set(userId, role);
  }

  public setTenantRiskScore(tenantId: string, score: number): void {
    this.tenantRiskProfiles.set(tenantId, score);
  }

  // ==========================================================================
  // DECISION LOGGING & AUDIT
  // ==========================================================================

  private recordDecision(
    decisionId: string,
    timestamp: string,
    context: AccessEvaluationContext,
    decision: AccessDecisionType,
    allowed: boolean,
    reasonCodes: string[],
    riskScore: number,
    riskTier: IdentityRiskTier,
    correlationId: string,
    publicMessage: string,
    riskBreakdown?: RiskScoreBreakdown
  ): AccessEvaluationDecision {
    const breakdown: RiskScoreBreakdown = riskBreakdown || {
      baseScore: riskScore,
      signals: [],
      finalScore: riskScore,
      riskTier,
      reasonCodes,
    };

    const record: AccessEvaluationDecision = {
      decisionId,
      timestamp,
      principalId: context.principalId,
      tenantId: context.tenantId,
      entityId: context.entityId,
      resource: context.resource,
      action: context.action,
      decision,
      allowed,
      reasonCodes,
      riskScore,
      riskTier,
      riskBreakdown: breakdown,
      policyVersion: this.policyVersion,
      policySeal: this.policySeal,
      correlationId,
      publicMessage,
    };

    this.accessDecisionsLog.push(record);
    return record;
  }

  public getDecisionLogs(): AccessEvaluationDecision[] {
    return [...this.accessDecisionsLog];
  }

  public resetForTesting(): void {
    this.accessDecisionsLog = [];
    this.stepUpChallenges.clear();
    this.userLiveRoles.clear();
    this.tenantRiskProfiles.clear();
  }
}

export const continuousAccessEvaluationService = ContinuousAccessEvaluationService.getInstance();
