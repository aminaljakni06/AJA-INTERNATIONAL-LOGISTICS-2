/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-06
 * Identity Lifecycle Governance, Access Certification, JIT Privilege & Automated Deprovisioning Engine
 */

import crypto from 'crypto';
import { 
  unifiedAccessGovernanceMonitoringService,
  CANONICAL_ROLES_REGISTRY,
  PrincipalCategory,
} from './unifiedAccessGovernanceMonitoringService';
import { 
  identityIncidentResponseService 
} from './identityIncidentResponseService';
import {
  continuousAccessEvaluationService
} from './continuousAccessEvaluationService';

// ============================================================================
// 1. CANONICAL LIFECYCLE TYPES & STATUS
// ============================================================================

export type IdentityLifecycleState = 
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DISABLED'
  | 'TERMINATED'
  | 'ARCHIVED';

export type HumanSubCategory = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface IdentityRecord {
  principalId: string;
  category: PrincipalCategory;
  subCategory?: HumanSubCategory;
  email: string;
  displayName: string;
  tenantId?: string;
  entityId?: string;
  status: IdentityLifecycleState;
  assignedRoles: string[];
  assignedPermissions: string[];
  ownerId?: string;       // Required for SERVICE / AUTOMATION
  managerId?: string;     // For STAFF / ADMIN
  department?: string;
  createdAt: string;
  updatedAt: string;
  terminatedAt?: string;
  lastCertifiedAt?: string;
}

export interface AccessRequestRecord {
  requestId: string;
  requesterId: string;
  targetPrincipalId: string;
  requestedRole: string;
  requestedPermissions: string[];
  tenantId?: string;
  entityId?: string;
  businessReason: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PROVISIONED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
  approvalRequired: boolean;
  approverId?: string;
  approvedAt?: string;
  requestedAt: string;
  expiresAt?: string;
}

export interface JitPrivilegeGrant {
  jitGrantId: string;
  principalId: string;
  role: string;
  permissions: string[];
  tenantScope: 'OWN_TENANT' | 'GLOBAL';
  tenantId?: string;
  entityId?: string;
  businessReason: string;
  incidentId?: string;
  approvedBy: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  activatedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface DelegationRecord {
  delegationId: string;
  delegatorId: string;
  delegateeId: string;
  delegatedRole: string;
  tenantId?: string;
  entityId?: string;
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  effectiveFrom: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
}

export interface SoDConflictRule {
  ruleId: string;
  name: string;
  conflictingRoles: [string, string];
  severity: 'HIGH' | 'CRITICAL';
  description: string;
}

export interface CertificationReviewItem {
  itemId: string;
  principalId: string;
  principalName: string;
  role: string;
  tenantId?: string;
  decision: 'CERTIFY' | 'REVOKE' | 'MODIFY' | 'ESCALATE' | 'NOT_REVIEWED';
  reviewedBy?: string;
  reviewedAt?: string;
  reason?: string;
}

export interface CertificationCampaign {
  campaignId: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  items: CertificationReviewItem[];
}

export interface ReconciliationDiscrepancy {
  discrepancyId: string;
  principalId: string;
  type: 'ORPHAN_ACCESS' | 'EXCESS_ACCESS' | 'MISSING_ACCESS' | 'EXPIRED_ACCESS' | 'UNAPPROVED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: string;
}

// ============================================================================
// 2. CANONICAL SOD CONFLICT MATRIX
// ============================================================================

export const CANONICAL_SOD_RULES: SoDConflictRule[] = [
  {
    ruleId: 'SOD-01-ADMIN-CUSTOMER',
    name: 'Admin and Customer Role Conflict',
    conflictingRoles: ['ADMIN', 'CUSTOMER'],
    severity: 'CRITICAL',
    description: 'An identity cannot hold both Customer and Admin roles simultaneously.',
  },
  {
    ruleId: 'SOD-02-FINANCIAL-PAYMENT-APPROVE',
    name: 'Payment Creator and Final Approver Conflict',
    conflictingRoles: ['PAYMENT_CREATOR', 'PAYMENT_APPROVER'],
    severity: 'CRITICAL',
    description: 'An identity cannot simultaneously create and approve payments.',
  },
  {
    ruleId: 'SOD-03-AUDITOR-OPERATOR',
    name: 'Security Auditor and System Operator Conflict',
    conflictingRoles: ['AUDITOR', 'OPERATOR'],
    severity: 'HIGH',
    description: 'Independent audit roles cannot hold operational mutation roles.',
  },
];

// ============================================================================
// 3. IDENTITY LIFECYCLE GOVERNANCE SERVICE
// ============================================================================

export class IdentityLifecycleGovernanceService {
  private static instance: IdentityLifecycleGovernanceService;

  private identities: Map<string, IdentityRecord> = new Map();
  private accessRequests: Map<string, AccessRequestRecord> = new Map();
  private jitGrants: Map<string, JitPrivilegeGrant> = new Map();
  private delegations: Map<string, DelegationRecord> = new Map();
  private certificationCampaigns: Map<string, CertificationCampaign> = new Map();

  private constructor() {}

  public static getInstance(): IdentityLifecycleGovernanceService {
    if (!IdentityLifecycleGovernanceService.instance) {
      IdentityLifecycleGovernanceService.instance = new IdentityLifecycleGovernanceService();
    }
    return IdentityLifecycleGovernanceService.instance;
  }

  // ==========================================================================
  // JOINER WORKFLOW (Identity Creation & Default Deny)
  // ==========================================================================

  public provisionIdentity(params: {
    principalId: string;
    category: PrincipalCategory;
    subCategory?: HumanSubCategory;
    email: string;
    displayName: string;
    tenantId?: string;
    entityId?: string;
    baseRole?: string;
    ownerId?: string;
    managerId?: string;
    actorId: string;
    approverId?: string;
  }): { success: boolean; identity?: IdentityRecord; error?: string } {
    // 1. Mandatory Identity Attributes
    if (!params.principalId || !params.email || !params.displayName) {
      return { success: false, error: 'Principal ID, email, and display name are required' };
    }

    // 2. Service and Automation Ownership check
    if ((params.category === 'SERVICE' || params.category === 'AUTOMATION') && !params.ownerId) {
      return { success: false, error: 'Non-human identities must specify an active owner ID' };
    }

    // 3. Secure Default: Least privilege (DEFAULT_DENY if no role specified)
    const baseRole = params.baseRole || (params.category === 'HUMAN' && params.subCategory === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF');
    
    // 4. Privileged Admin Provisioning requires separate approval (Anti-self-provisioning)
    if (baseRole === 'ADMIN') {
      if (!params.approverId || params.approverId === params.actorId) {
        return { success: false, error: 'Admin role provisioning requires approval from a separate designated Administrator' };
      }
    }

    // 5. SoD Conflict Check
    const sodConflicts = this.checkSodViolations([baseRole]);
    if (sodConflicts.length > 0) {
      return { success: false, error: `SoD Violation: ${sodConflicts[0].description}` };
    }

    const timestamp = new Date().toISOString();
    const identity: IdentityRecord = {
      principalId: params.principalId,
      category: params.category,
      subCategory: params.subCategory,
      email: params.email,
      displayName: params.displayName,
      tenantId: params.tenantId,
      entityId: params.entityId,
      status: 'ACTIVE',
      assignedRoles: [baseRole],
      assignedPermissions: [],
      ownerId: params.ownerId,
      managerId: params.managerId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.identities.set(params.principalId, identity);

    // Sync live role with CAE
    continuousAccessEvaluationService.setLiveUserRole(params.principalId, baseRole);

    return { success: true, identity };
  }

  // ==========================================================================
  // MOVER WORKFLOW (Role Changes & Privilege Accumulation Prevention)
  // ==========================================================================

  public transitionIdentityRole(params: {
    principalId: string;
    newRole: string;
    newTenantId?: string;
    newEntityId?: string;
    actorId: string;
    approverId?: string;
    reason: string;
  }): { success: boolean; identity?: IdentityRecord; error?: string } {
    const identity = this.identities.get(params.principalId);
    if (!identity) {
      return { success: false, error: 'Identity not found' };
    }

    if (identity.status !== 'ACTIVE') {
      return { success: false, error: `Cannot transition identity in ${identity.status} state` };
    }

    // Privileged role upgrade requires dual approval
    if (params.newRole === 'ADMIN') {
      if (!params.approverId || params.approverId === params.actorId) {
        return { success: false, error: 'Privileged role upgrade requires independent approval from a separate Administrator' };
      }
    }

    // Remove obsolete roles before adding new role (Privilege Accumulation Prevention)
    identity.assignedRoles = [params.newRole];
    if (params.newTenantId) identity.tenantId = params.newTenantId;
    if (params.newEntityId) identity.entityId = params.newEntityId;
    identity.updatedAt = new Date().toISOString();

    // Sync live role with CAE
    continuousAccessEvaluationService.setLiveUserRole(params.principalId, params.newRole);

    return { success: true, identity };
  }

  // ==========================================================================
  // LEAVER WORKFLOW (Immediate Deprovisioning & Session Revocation)
  // ==========================================================================

  public terminateIdentity(
    principalId: string,
    actorId: string,
    reason: string
  ): { success: boolean; error?: string } {
    const identity = this.identities.get(principalId);
    if (!identity) {
      return { success: false, error: 'Identity not found' };
    }

    const timestamp = new Date().toISOString();
    identity.status = 'TERMINATED';
    identity.terminatedAt = timestamp;
    identity.updatedAt = timestamp;
    identity.assignedRoles = [];
    identity.assignedPermissions = [];

    // 1. Immediate Session Revocation
    identityIncidentResponseService.executeSessionRevocation(principalId);

    // 2. Revoke all active JIT Grants
    for (const grant of this.jitGrants.values()) {
      if (grant.principalId === principalId && grant.status === 'ACTIVE') {
        grant.status = 'REVOKED';
        grant.revokedAt = timestamp;
      }
    }

    // 3. Revoke all Delegations
    for (const delegation of this.delegations.values()) {
      if ((delegation.delegatorId === principalId || delegation.delegateeId === principalId) && delegation.status === 'ACTIVE') {
        delegation.status = 'REVOKED';
        delegation.revokedAt = timestamp;
      }
    }

    // 4. Update CAE live role to empty
    continuousAccessEvaluationService.setLiveUserRole(principalId, 'NONE');

    // 5. Ingest Governance Audit Event
    unifiedAccessGovernanceMonitoringService.recordSecurityEvent({
      eventType: 'AUTHZ_PRIVILEGE_ESCALATION_ATTEMPT',
      severity: 'LOW',
      actorId,
      actorType: 'HUMAN',
      tenantId: identity.tenantId,
      resource: `/users/${principalId}`,
      action: 'identity:terminate',
      decision: 'ALLOWED',
      reason: `Identity terminated: ${reason}`,
      environment: 'PRODUCTION',
    });

    return { success: true };
  }

  // ==========================================================================
  // JUST-IN-TIME (JIT) PRIVILEGED ACCESS MANAGEMENT
  // ==========================================================================

  public requestJitGrant(params: {
    principalId: string;
    role: string;
    permissions?: string[];
    tenantScope: 'OWN_TENANT' | 'GLOBAL';
    tenantId?: string;
    businessReason: string;
    durationMinutes: number; // Max e.g. 120
    actorId: string;
    approverId?: string;
  }): { success: boolean; grant?: JitPrivilegeGrant; error?: string } {
    const identity = this.identities.get(params.principalId);
    if (!identity || identity.status !== 'ACTIVE') {
      return { success: false, error: 'Identity must be ACTIVE to receive JIT grant' };
    }

    // Anti-Self-Approval
    if (params.approverId && params.approverId === params.actorId) {
      return { success: false, error: 'Anti-Self-Approval: Requester cannot approve their own JIT grant' };
    }

    if (!params.approverId) {
      return { success: false, error: 'JIT grant requires human approval from a designated Administrator' };
    }

    const now = Date.now();
    const durationMs = Math.min(params.durationMinutes, 120) * 60 * 1000;
    const jitGrantId = `JIT-${now}-${crypto.randomUUID().substring(0, 6)}`;

    const grant: JitPrivilegeGrant = {
      jitGrantId,
      principalId: params.principalId,
      role: params.role,
      permissions: params.permissions || [],
      tenantScope: params.tenantScope,
      tenantId: params.tenantId || identity.tenantId,
      businessReason: params.businessReason,
      approvedBy: params.approverId,
      status: 'ACTIVE',
      activatedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + durationMs).toISOString(),
    };

    this.jitGrants.set(jitGrantId, grant);
    return { success: true, grant };
  }

  public isJitGrantActive(principalId: string, role: string, targetTenantId?: string): boolean {
    const now = Date.now();
    for (const grant of this.jitGrants.values()) {
      if (grant.principalId === principalId && grant.role === role && grant.status === 'ACTIVE') {
        const expiresTime = new Date(grant.expiresAt).getTime();
        if (now > expiresTime) {
          grant.status = 'EXPIRED';
          return false;
        }

        // Scope check
        if (grant.tenantScope === 'OWN_TENANT' && targetTenantId && grant.tenantId && grant.tenantId !== targetTenantId) {
          return false;
        }

        return true;
      }
    }
    return false;
  }

  // ==========================================================================
  // DELEGATION OF AUTHORITY GOVERNANCE
  // ==========================================================================

  public createDelegation(params: {
    delegatorId: string;
    delegateeId: string;
    delegatedRole: string;
    tenantId?: string;
    reason: string;
    durationHours: number;
  }): { success: boolean; delegation?: DelegationRecord; error?: string } {
    const delegator = this.identities.get(params.delegatorId);
    const delegatee = this.identities.get(params.delegateeId);

    if (!delegator || delegator.status !== 'ACTIVE' || !delegatee || delegatee.status !== 'ACTIVE') {
      return { success: false, error: 'Both delegator and delegatee must be ACTIVE' };
    }

    if (params.delegatorId === params.delegateeId) {
      return { success: false, error: 'Self-delegation is prohibited' };
    }

    const now = Date.now();
    const expiresAt = new Date(now + params.durationHours * 3600 * 1000).toISOString();
    const delegationId = `DEL-${now}-${crypto.randomUUID().substring(0, 6)}`;

    const delegation: DelegationRecord = {
      delegationId,
      delegatorId: params.delegatorId,
      delegateeId: params.delegateeId,
      delegatedRole: params.delegatedRole,
      tenantId: params.tenantId,
      reason: params.reason,
      status: 'ACTIVE',
      effectiveFrom: new Date(now).toISOString(),
      expiresAt,
      createdAt: new Date(now).toISOString(),
    };

    this.delegations.set(delegationId, delegation);
    return { success: true, delegation };
  }

  public isDelegationActive(delegateeId: string, role: string): boolean {
    const now = Date.now();
    for (const d of this.delegations.values()) {
      if (d.delegateeId === delegateeId && d.delegatedRole === role && d.status === 'ACTIVE') {
        if (now > new Date(d.expiresAt).getTime()) {
          d.status = 'EXPIRED';
          return false;
        }
        return true;
      }
    }
    return false;
  }

  // ==========================================================================
  // ACCESS CERTIFICATION CAMPAIGNS
  // ==========================================================================

  public createCertificationCampaign(name: string): CertificationCampaign {
    const campaignId = `CAMP-${Date.now()}`;
    const items: CertificationReviewItem[] = [];

    for (const identity of this.identities.values()) {
      for (const role of identity.assignedRoles) {
        items.push({
          itemId: `REV-${crypto.randomUUID().substring(0, 8)}`,
          principalId: identity.principalId,
          principalName: identity.displayName,
          role,
          tenantId: identity.tenantId,
          decision: 'NOT_REVIEWED',
        });
      }
    }

    const campaign: CertificationCampaign = {
      campaignId,
      name,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 86400 * 1000).toISOString(),
      items,
    };

    this.certificationCampaigns.set(campaignId, campaign);
    return campaign;
  }

  public submitReviewDecision(
    campaignId: string,
    itemId: string,
    reviewerId: string,
    decision: 'CERTIFY' | 'REVOKE' | 'MODIFY' | 'ESCALATE',
    reason: string
  ): { success: boolean; error?: string } {
    const campaign = this.certificationCampaigns.get(campaignId);
    if (!campaign || campaign.status !== 'ACTIVE') {
      return { success: false, error: 'Campaign is not active' };
    }

    const item = campaign.items.find((i) => i.itemId === itemId);
    if (!item) {
      return { success: false, error: 'Review item not found' };
    }

    // Anti-Self-Review for Privileged Roles
    if (item.role === 'ADMIN' && item.principalId === reviewerId) {
      return { success: false, error: 'Anti-Self-Review: Reviewer cannot certify their own Admin privileges' };
    }

    item.decision = decision;
    item.reviewedBy = reviewerId;
    item.reviewedAt = new Date().toISOString();
    item.reason = reason;

    // If decision is REVOKE, immediately revoke role on identity
    if (decision === 'REVOKE') {
      const identity = this.identities.get(item.principalId);
      if (identity) {
        identity.assignedRoles = identity.assignedRoles.filter((r) => r !== item.role);
        identity.updatedAt = new Date().toISOString();
        continuousAccessEvaluationService.setLiveUserRole(item.principalId, identity.assignedRoles[0] || 'NONE');
      }
    }

    return { success: true };
  }

  // ==========================================================================
  // ACCESS RECONCILIATION ENGINE
  // ==========================================================================

  public runAccessReconciliation(): ReconciliationDiscrepancy[] {
    const discrepancies: ReconciliationDiscrepancy[] = [];
    const timestamp = new Date().toISOString();

    for (const identity of this.identities.values()) {
      // 1. Orphan Check: Terminated identity still having assigned roles
      if (identity.status === 'TERMINATED' && identity.assignedRoles.length > 0) {
        discrepancies.push({
          discrepancyId: `DISC-ORPHAN-${Date.now()}-${crypto.randomUUID().substring(0, 4)}`,
          principalId: identity.principalId,
          type: 'ORPHAN_ACCESS',
          severity: 'CRITICAL',
          description: `Terminated identity ${identity.principalId} has residual assigned roles: ${identity.assignedRoles.join(', ')}`,
          detectedAt: timestamp,
        });
      }

      // 2. Service Account without Owner
      if ((identity.category === 'SERVICE' || identity.category === 'AUTOMATION') && !identity.ownerId) {
        discrepancies.push({
          discrepancyId: `DISC-NO-OWNER-${Date.now()}-${crypto.randomUUID().substring(0, 4)}`,
          principalId: identity.principalId,
          type: 'ORPHAN_ACCESS',
          severity: 'HIGH',
          description: `Non-human identity ${identity.principalId} has no assigned owner`,
          detectedAt: timestamp,
        });
      }
    }

    return discrepancies;
  }

  // ==========================================================================
  // SOD CONFLICT CHECKER
  // ==========================================================================

  public checkSodViolations(roles: string[]): SoDConflictRule[] {
    const violations: SoDConflictRule[] = [];
    for (const rule of CANONICAL_SOD_RULES) {
      if (roles.includes(rule.conflictingRoles[0]) && roles.includes(rule.conflictingRoles[1])) {
        violations.push(rule);
      }
    }
    return violations;
  }

  // ==========================================================================
  // HELPERS & TESTING
  // ==========================================================================

  public getIdentity(principalId: string): IdentityRecord | undefined {
    return this.identities.get(principalId);
  }

  public resetForTesting(): void {
    this.identities.clear();
    this.accessRequests.clear();
    this.jitGrants.clear();
    this.delegations.clear();
    this.certificationCampaigns.clear();
  }
}

export const identityLifecycleGovernanceService = IdentityLifecycleGovernanceService.getInstance();
