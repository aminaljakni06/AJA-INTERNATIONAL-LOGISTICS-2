import { 
  LifecycleEventRecord, 
  MoverRequest, 
  AccessReviewCampaign, 
  AccessReviewDecision, 
  RoleGovernanceRequest, 
  DelegatedAdminRecord, 
  SoDRule, 
  SoDViolation, 
  ProvisioningTarget 
} from '../../types/identityGovernance';

// In-memory persistent stores with initial seed data
let lifecycleEventsStore: LifecycleEventRecord[] = [
  {
    id: 'lfe_001',
    userId: 'usr_admin_01',
    eventType: 'JOINER',
    toStage: 'ACTIVE',
    initiatedBy: 'SYSTEM',
    reason: 'Initial Enterprise System Provisioning',
    timestamp: new Date().toISOString()
  }
];

let moverRequestsStore: MoverRequest[] = [];

let accessCampaignsStore: AccessReviewCampaign[] = [
  {
    id: 'campaign_q3_2026',
    name: 'Q3 Enterprise Access Review & Certification',
    type: 'QUARTERLY_AUDIT',
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 23 * 86400000).toISOString(),
    status: 'ACTIVE',
    reviewerId: 'usr_admin_01',
    reviewerName: 'Enterprise System Administrator',
    totalDecisions: 12,
    approvedDecisions: 8,
    revokedDecisions: 1,
    createdAt: new Date().toISOString()
  }
];

let accessDecisionsStore: AccessReviewDecision[] = [
  {
    id: 'dec_001',
    campaignId: 'campaign_q3_2026',
    userId: 'usr_admin_01',
    userName: 'Aja Admin',
    role: 'ADMIN',
    permissionOrAccess: 'FULL_ENTERPRISE_SUPERADMIN',
    status: 'APPROVED',
    reviewerId: 'usr_admin_01',
    decisionDate: new Date().toISOString(),
    comments: 'Verified active System Administrator'
  }
];

let roleGovernanceRequestsStore: RoleGovernanceRequest[] = [];

let delegatedAdminsStore: DelegatedAdminRecord[] = [
  {
    id: 'del_001',
    adminUserId: 'usr_branch_mgr',
    adminUserName: 'Riyadh Branch Manager',
    scopeType: 'BRANCH',
    scopeId: 'branch_riyadh_01',
    scopeName: 'Riyadh Main Logistics Hub',
    grantedBy: 'usr_admin_01',
    createdAt: new Date().toISOString()
  }
];

let sodRulesStore: SoDRule[] = [
  {
    id: 'sod_001',
    code: 'SOD-REQ-APP',
    name: 'Requester cannot be Approver',
    description: 'Prevents the user who created a shipment/quote request from approving it.',
    conflictingRoleA: 'CUSTOMER',
    conflictingRoleB: 'DISPATCHER',
    severity: 'HIGH',
    actionOnViolation: 'BLOCK',
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sod_002',
    code: 'SOD-INV-PAY',
    name: 'Invoice Creator cannot be Payment Approver',
    description: 'Financial segregation: Billing entry officer cannot approve outgoing payouts or Adyen transactions.',
    conflictingRoleA: 'ACCOUNTANT',
    conflictingRoleB: 'FINANCE_MANAGER',
    conflictingPermissionA: 'FINANCE_ENTRY',
    conflictingPermissionB: 'FINANCE_AUDIT',
    severity: 'CRITICAL',
    actionOnViolation: 'BLOCK',
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sod_003',
    code: 'SOD-HR-PAYROLL',
    name: 'HR Manager cannot be Payroll Approver',
    description: 'Segregation between employee profile management and salary distribution approvals.',
    conflictingRoleA: 'HR_MANAGER',
    conflictingRoleB: 'PAYROLL_APPROVER',
    severity: 'HIGH',
    actionOnViolation: 'WARN_AND_AUDIT',
    enabled: true,
    createdAt: new Date().toISOString()
  }
];

let sodViolationsStore: SoDViolation[] = [];

let provisioningTargetsStore: ProvisioningTarget[] = [];

// Repository Methods
export async function addLifecycleEvent(record: LifecycleEventRecord): Promise<LifecycleEventRecord> {
  lifecycleEventsStore.unshift(record);
  return record;
}

export async function getLifecycleEventsForUser(userId: string): Promise<LifecycleEventRecord[]> {
  return lifecycleEventsStore.filter(e => e.userId === userId);
}

export async function listAllLifecycleEvents(): Promise<LifecycleEventRecord[]> {
  return [...lifecycleEventsStore];
}

export async function saveMoverRequest(req: MoverRequest): Promise<MoverRequest> {
  const existing = moverRequestsStore.findIndex(m => m.id === req.id);
  if (existing >= 0) {
    moverRequestsStore[existing] = req;
  } else {
    moverRequestsStore.unshift(req);
  }
  return req;
}

export async function listMoverRequests(): Promise<MoverRequest[]> {
  return [...moverRequestsStore];
}

export async function listAccessCampaigns(): Promise<AccessReviewCampaign[]> {
  return [...accessCampaignsStore];
}

export async function saveAccessCampaign(campaign: AccessReviewCampaign): Promise<AccessReviewCampaign> {
  const existing = accessCampaignsStore.findIndex(c => c.id === campaign.id);
  if (existing >= 0) {
    accessCampaignsStore[existing] = campaign;
  } else {
    accessCampaignsStore.unshift(campaign);
  }
  return campaign;
}

export async function listAccessDecisions(campaignId: string): Promise<AccessReviewDecision[]> {
  return accessDecisionsStore.filter(d => d.campaignId === campaignId);
}

export async function saveAccessDecision(decision: AccessReviewDecision): Promise<AccessReviewDecision> {
  const existing = accessDecisionsStore.findIndex(d => d.id === decision.id);
  if (existing >= 0) {
    accessDecisionsStore[existing] = decision;
  } else {
    accessDecisionsStore.unshift(decision);
  }
  return decision;
}

export async function listRoleRequests(): Promise<RoleGovernanceRequest[]> {
  return [...roleGovernanceRequestsStore];
}

export async function saveRoleRequest(req: RoleGovernanceRequest): Promise<RoleGovernanceRequest> {
  const existing = roleGovernanceRequestsStore.findIndex(r => r.id === req.id);
  if (existing >= 0) {
    roleGovernanceRequestsStore[existing] = req;
  } else {
    roleGovernanceRequestsStore.unshift(req);
  }
  return req;
}

export async function listDelegatedAdmins(): Promise<DelegatedAdminRecord[]> {
  return [...delegatedAdminsStore];
}

export async function saveDelegatedAdmin(admin: DelegatedAdminRecord): Promise<DelegatedAdminRecord> {
  const existing = delegatedAdminsStore.findIndex(a => a.id === admin.id);
  if (existing >= 0) {
    delegatedAdminsStore[existing] = admin;
  } else {
    delegatedAdminsStore.unshift(admin);
  }
  return admin;
}

export async function removeDelegatedAdmin(id: string): Promise<boolean> {
  const initialLen = delegatedAdminsStore.length;
  delegatedAdminsStore = delegatedAdminsStore.filter(a => a.id !== id);
  return delegatedAdminsStore.length < initialLen;
}

export async function listSoDRules(): Promise<SoDRule[]> {
  return [...sodRulesStore];
}

export async function saveSoDRule(rule: SoDRule): Promise<SoDRule> {
  const existing = sodRulesStore.findIndex(r => r.id === rule.id);
  if (existing >= 0) {
    sodRulesStore[existing] = rule;
  } else {
    sodRulesStore.unshift(rule);
  }
  return rule;
}

export async function addSoDViolation(violation: SoDViolation): Promise<SoDViolation> {
  sodViolationsStore.unshift(violation);
  return violation;
}

export async function listSoDViolations(): Promise<SoDViolation[]> {
  return [...sodViolationsStore];
}

export async function listProvisioningTargets(): Promise<ProvisioningTarget[]> {
  return [...provisioningTargetsStore];
}

export async function saveProvisioningTarget(target: ProvisioningTarget): Promise<ProvisioningTarget> {
  const existing = provisioningTargetsStore.findIndex(p => p.id === target.id);
  if (existing >= 0) {
    provisioningTargetsStore[existing] = target;
  } else {
    provisioningTargetsStore.unshift(target);
  }
  return target;
}
