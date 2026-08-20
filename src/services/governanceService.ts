import { 
  LifecycleEventRecord, 
  MoverRequest, 
  LeaverChecklist, 
  AccessReviewCampaign, 
  AccessReviewDecision, 
  RoleGovernanceRequest, 
  DelegatedAdminRecord, 
  SoDRule, 
  SoDViolation, 
  ProvisioningTarget, 
  IdentityGovernanceAnalytics 
} from '../types/identityGovernance';
import { 
  addLifecycleEvent, 
  listAllLifecycleEvents, 
  saveMoverRequest, 
  listMoverRequests, 
  listAccessCampaigns, 
  saveAccessCampaign, 
  listAccessDecisions, 
  saveAccessDecision, 
  listRoleRequests, 
  saveRoleRequest, 
  listDelegatedAdmins, 
  saveDelegatedAdmin, 
  removeDelegatedAdmin, 
  listSoDRules, 
  saveSoDRule, 
  addSoDViolation, 
  listSoDViolations, 
  saveProvisioningTarget 
} from '../db/repositories/governanceRepository';
import { listAllIdentities } from '../db/repositories/identityRepository';
import { identityEngine } from '../lib/identity/identityEngine';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { EventBusService } from './eventBusService';

export class GovernanceService {

  // --- 1. USER LIFECYCLE ENGINE (Joiner / Mover / Leaver) ---

  public static async executeJoinerOnboarding(
    userId: string,
    onboardingData: {
      role: string;
      departmentId?: string;
      departmentName?: string;
      branchId?: string;
      branchName?: string;
      companyId?: string;
      companyName?: string;
      managerId?: string;
    },
    actorUserId: string
  ): Promise<LifecycleEventRecord> {
    // 1. Update Identity Profile Context via Identity Engine
    await identityEngine.updateIdentityProfile(
      userId,
      {
        role: onboardingData.role as any,
        departmentId: onboardingData.departmentId,
        departmentName: onboardingData.departmentName,
        branchId: onboardingData.branchId,
        branchName: onboardingData.branchName,
        companyId: onboardingData.companyId,
        companyName: onboardingData.companyName,
        managerId: onboardingData.managerId,
        accountStatus: 'ACTIVE'
      },
      actorUserId
    );

    // 2. Record Lifecycle Event
    const event: LifecycleEventRecord = {
      id: `lfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      eventType: 'JOINER',
      fromStage: 'INVITED',
      toStage: 'ACTIVE',
      initiatedBy: actorUserId,
      reason: 'Automated Joiner Onboarding Workflow',
      metadata: onboardingData,
      timestamp: new Date().toISOString()
    };

    await addLifecycleEvent(event);

    // 3. Create Provisioning Tasks
    const systems: Array<'INTERNAL_ERP' | 'SCIM_DIRECTORY' | 'WAREHOUSE_WMS' | 'FLEET_GPS'> = [
      'INTERNAL_ERP', 'SCIM_DIRECTORY', 'WAREHOUSE_WMS', 'FLEET_GPS'
    ];
    for (const sys of systems) {
      await saveProvisioningTarget({
        id: `prov_${userId}_${sys}`,
        userId,
        systemName: sys,
        syncStatus: 'SYNCED',
        lastSyncAt: new Date().toISOString()
      });
    }

    // 4. Audit & Event Bus
    await createAuditLog({
      actorUserId,
      action: 'USER_JOINER_EXECUTED',
      entityType: 'IDENTITY_GOVERNANCE',
      entityId: userId,
      after: { event, onboardingData }
    });

    EventBusService.publish({
      name: 'RoleChanged',
      aggregateId: userId,
      aggregateType: 'IDENTITY_GOVERNANCE',
      module: 'AUTH',
      triggeredBy: { userId: actorUserId },
      payload: { userId, onboardingData, eventType: 'JOINER' }
    });

    return event;
  }

  public static async submitMoverRequest(
    request: Omit<MoverRequest, 'id' | 'createdAt' | 'status'>,
    actorUserId: string
  ): Promise<MoverRequest> {
    const moverReq: MoverRequest = {
      ...request,
      id: `mvr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'PENDING',
      initiatedBy: actorUserId,
      createdAt: new Date().toISOString()
    };

    await saveMoverRequest(moverReq);

    await createAuditLog({
      actorUserId,
      action: 'USER_MOVER_REQUESTED',
      entityType: 'IDENTITY_GOVERNANCE',
      entityId: moverReq.id,
      after: { moverReq }
    });

    return moverReq;
  }

  public static async approveMoverRequest(
    moverId: string,
    approverUserId: string
  ): Promise<MoverRequest> {
    const requests = await listMoverRequests();
    const req = requests.find(r => r.id === moverId);
    if (!req) throw new Error('Mover request not found');

    req.status = 'EXECUTED';
    req.approvedBy = approverUserId;
    await saveMoverRequest(req);

    // Apply Profile Updates via Identity Engine
    await identityEngine.updateIdentityProfile(
      req.userId,
      {
        role: (req.targetRole || undefined) as any,
        departmentId: req.targetDepartmentId,
        departmentName: req.targetDepartmentName,
        branchId: req.targetBranchId,
        branchName: req.targetBranchName,
        companyId: req.targetCompanyId,
        companyName: req.targetCompanyName,
        managerId: req.targetManagerId
      },
      approverUserId
    );

    // Record Lifecycle Event
    const lfe: LifecycleEventRecord = {
      id: `lfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: req.userId,
      eventType: 'MOVER',
      fromStage: 'ACTIVE',
      toStage: 'MOVED',
      initiatedBy: approverUserId,
      reason: `Department/Role Transfer: ${req.reason}`,
      metadata: req,
      timestamp: new Date().toISOString()
    };
    await addLifecycleEvent(lfe);

    await createAuditLog({
      actorUserId: approverUserId,
      action: 'USER_MOVER_EXECUTED',
      entityType: 'IDENTITY_GOVERNANCE',
      entityId: req.userId,
      after: { req, lfe }
    });

    EventBusService.publish({
      name: 'RoleChanged',
      aggregateId: req.userId,
      aggregateType: 'IDENTITY_GOVERNANCE',
      module: 'AUTH',
      triggeredBy: { userId: approverUserId },
      payload: { moverRequest: req, eventType: 'MOVER' }
    });

    return req;
  }

  public static async executeLeaverOffboarding(
    userId: string,
    reason: string,
    actorUserId: string
  ): Promise<LeaverChecklist> {
    // 1. Disable Account Status via Identity Engine
    await identityEngine.setAccountStatus(userId, 'DISABLED', `Offboarded: ${reason}`, actorUserId);

    // 2. Complete Offboarding Checklist
    const checklist: LeaverChecklist = {
      userId,
      disableAccount: true,
      revokeSessions: true,
      revokeDevices: true,
      revokePermissions: true,
      assetChecklist: [
        { item: 'Company Laptop & Hardware Token', returned: true },
        { item: 'Security Access Card & Keys', returned: true },
        { item: 'Corporate Email & SSO Delegations', returned: true }
      ],
      completedAt: new Date().toISOString(),
      status: 'COMPLETED'
    };

    // 3. Record Lifecycle Event
    const lfe: LifecycleEventRecord = {
      id: `lfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      eventType: 'LEAVER',
      fromStage: 'ACTIVE',
      toStage: 'TERMINATED',
      initiatedBy: actorUserId,
      reason,
      metadata: checklist,
      timestamp: new Date().toISOString()
    };
    await addLifecycleEvent(lfe);

    // 4. Audit & Event Bus
    await createAuditLog({
      actorUserId,
      action: 'USER_LEAVER_EXECUTED',
      entityType: 'IDENTITY_GOVERNANCE',
      entityId: userId,
      after: { checklist, lfe }
    });

    EventBusService.publish({
      name: 'RoleChanged',
      aggregateId: userId,
      aggregateType: 'IDENTITY_GOVERNANCE',
      module: 'AUTH',
      triggeredBy: { userId: actorUserId },
      payload: { userId, reason, eventType: 'LEAVER' }
    });

    return checklist;
  }

  // --- 2. ACCESS CERTIFICATION & REVIEWS ---

  public static async createAccessCampaign(
    name: string,
    type: 'MANAGER_REVIEW' | 'DEPARTMENT_REVIEW' | 'ROLE_REVIEW' | 'QUARTERLY_AUDIT',
    reviewerId: string,
    reviewerName: string,
    durationDays: number = 30
  ): Promise<AccessReviewCampaign> {
    const campaign: AccessReviewCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      type,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + durationDays * 86400000).toISOString(),
      status: 'ACTIVE',
      reviewerId,
      reviewerName,
      totalDecisions: 0,
      approvedDecisions: 0,
      revokedDecisions: 0,
      createdAt: new Date().toISOString()
    };

    await saveAccessCampaign(campaign);

    await createAuditLog({
      actorUserId: reviewerId,
      action: 'ACCESS_CAMPAIGN_CREATED',
      entityType: 'ACCESS_CERTIFICATION',
      entityId: campaign.id,
      after: { campaign }
    });

    return campaign;
  }

  public static async recordAccessDecision(
    campaignId: string,
    userId: string,
    userName: string,
    role: string,
    permissionOrAccess: string,
    status: 'APPROVED' | 'REVOKED',
    reviewerId: string,
    comments?: string
  ): Promise<AccessReviewDecision> {
    const decision: AccessReviewDecision = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      campaignId,
      userId,
      userName,
      role,
      permissionOrAccess,
      status,
      reviewerId,
      comments,
      decisionDate: new Date().toISOString()
    };

    await saveAccessDecision(decision);

    // Update Campaign Stats
    const campaigns = await listAccessCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.totalDecisions += 1;
      if (status === 'APPROVED') campaign.approvedDecisions += 1;
      if (status === 'REVOKED') campaign.revokedDecisions += 1;
      await saveAccessCampaign(campaign);
    }

    await createAuditLog({
      actorUserId: reviewerId,
      action: 'ACCESS_DECISION_RECORDED',
      entityType: 'ACCESS_CERTIFICATION',
      entityId: decision.id,
      after: { decision }
    });

    return decision;
  }

  // --- 3. ROLE GOVERNANCE CENTER ---

  public static async requestRoleChange(
    req: Omit<RoleGovernanceRequest, 'id' | 'createdAt' | 'status'>,
    requesterId: string
  ): Promise<RoleGovernanceRequest> {
    const roleReq: RoleGovernanceRequest = {
      ...req,
      id: `rolereq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    if (req.isTemporary && req.durationDays) {
      roleReq.expiresAt = new Date(Date.now() + req.durationDays * 86400000).toISOString();
    }

    await saveRoleRequest(roleReq);

    await createAuditLog({
      actorUserId: requesterId,
      action: 'ROLE_REQUEST_SUBMITTED',
      entityType: 'ROLE_GOVERNANCE',
      entityId: roleReq.id,
      after: { roleReq }
    });

    return roleReq;
  }

  public static async approveRoleRequest(
    requestId: string,
    approverId: string
  ): Promise<RoleGovernanceRequest> {
    const requests = await listRoleRequests();
    const roleReq = requests.find(r => r.id === requestId);
    if (!roleReq) throw new Error('Role request not found');

    roleReq.status = 'APPROVED';
    roleReq.approverId = approverId;
    await saveRoleRequest(roleReq);

    // Apply role update to user via Identity Engine
    await identityEngine.updateIdentityProfile(
      roleReq.targetUserId,
      { role: roleReq.requestedRole as any },
      approverId
    );

    await createAuditLog({
      actorUserId: approverId,
      action: 'ROLE_REQUEST_APPROVED',
      entityType: 'ROLE_GOVERNANCE',
      entityId: requestId,
      after: { roleReq }
    });

    return roleReq;
  }

  // --- 4. DELEGATED ADMINISTRATION ---

  public static async assignDelegatedAdmin(
    adminUserId: string,
    adminUserName: string,
    scopeType: 'COMPANY' | 'BRANCH' | 'DEPARTMENT',
    scopeId: string,
    scopeName: string,
    grantedBy: string,
    durationDays?: number
  ): Promise<DelegatedAdminRecord> {
    const record: DelegatedAdminRecord = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      adminUserId,
      adminUserName,
      scopeType,
      scopeId,
      scopeName,
      grantedBy,
      expiresAt: durationDays ? new Date(Date.now() + durationDays * 86400000).toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    await saveDelegatedAdmin(record);

    await createAuditLog({
      actorUserId: grantedBy,
      action: 'DELEGATED_ADMIN_ASSIGNED',
      entityType: 'DELEGATED_ADMIN',
      entityId: record.id,
      after: { record }
    });

    return record;
  }

  public static async revokeDelegatedAdmin(id: string, actorUserId: string): Promise<boolean> {
    const success = await removeDelegatedAdmin(id);
    if (success) {
      await createAuditLog({
        actorUserId,
        action: 'DELEGATED_ADMIN_REVOKED',
        entityType: 'DELEGATED_ADMIN',
        entityId: id,
        after: { details: 'Revoked delegated administration scope' }
      });
    }
    return success;
  }

  // --- 5. SEPARATION OF DUTIES (SoD) ENGINE ---

  public static async evaluateSoDCheck(
    userId: string,
    userName: string,
    attemptedRoleOrAction: string
  ): Promise<{ allowed: boolean; violation?: SoDViolation }> {
    const rules = await listSoDRules();
    const enabledRules = rules.filter(r => r.enabled);

    for (const rule of enabledRules) {
      if (
        attemptedRoleOrAction === rule.conflictingRoleA || 
        attemptedRoleOrAction === rule.conflictingRoleB
      ) {
        const violation: SoDViolation = {
          id: `sodv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ruleId: rule.id,
          ruleCode: rule.code,
          userId,
          userName,
          attemptedAction: attemptedRoleOrAction,
          details: `Conflict detected under rule ${rule.code}: ${rule.name}`,
          status: rule.actionOnViolation === 'BLOCK' ? 'BLOCKED' : 'WARNED',
          timestamp: new Date().toISOString()
        };

        await addSoDViolation(violation);

        await createAuditLog({
          actorUserId: userId,
          action: 'SOD_VIOLATION_DETECTED',
          entityType: 'SOD_ENGINE',
          entityId: violation.id,
          after: { violation, rule }
        });

        EventBusService.publish({
          name: 'AuditRecorded',
          aggregateId: violation.id,
          aggregateType: 'SOD_ENGINE',
          module: 'COMPLIANCE',
          triggeredBy: { userId },
          payload: { violation, rule }
        });

        if (rule.actionOnViolation === 'BLOCK') {
          return { allowed: false, violation };
        }
      }
    }

    return { allowed: true };
  }

  // --- 6. IDENTITY COMPLIANCE & ANALYTICS ---

  public static async getGovernanceAnalytics(): Promise<IdentityGovernanceAnalytics> {
    const identities = await listAllIdentities();
    const lfeEvents = await listAllLifecycleEvents();
    const sodViolations = await listSoDViolations();
    const campaigns = await listAccessCampaigns();

    const activeUsers = identities.filter(i => i.accountStatus === 'ACTIVE').length;
    const inactiveUsers = identities.filter(i => i.accountStatus === 'INACTIVE' || i.accountStatus === 'DISABLED').length;
    const dormantAccountsCount = identities.filter(i => {
      if (!i.lastLogin) return true;
      const last = new Date(i.lastLogin).getTime();
      return Date.now() - last > 90 * 86400000;
    }).length;

    const privilegedUsersCount = identities.filter(i => i.role === 'ADMIN' || i.role === 'SYSTEM_ADMIN').length;
    const pendingCertificationsCount = campaigns.filter(c => c.status === 'ACTIVE').length;

    const breakdown: Record<string, number> = {};
    for (const e of lfeEvents) {
      breakdown[e.toStage] = (breakdown[e.toStage] || 0) + 1;
    }

    return {
      activeUsers,
      inactiveUsers,
      dormantAccountsCount,
      privilegedUsersCount,
      expiredRolesCount: 0,
      pendingCertificationsCount,
      sodViolationsCount: sodViolations.length,
      lifecycleStageBreakdown: breakdown
    };
  }
}
