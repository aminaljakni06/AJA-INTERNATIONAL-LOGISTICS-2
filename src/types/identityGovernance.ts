export type LifecycleStage =
  | 'INVITED'
  | 'REGISTERED'
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'PROMOTED'
  | 'MOVED'
  | 'TEMPORARY_ASSIGNMENT'
  | 'ON_LEAVE'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'RETIRED'
  | 'ARCHIVED'
  | 'DELETED';

export type LifecycleEventType = 'JOINER' | 'MOVER' | 'LEAVER' | 'STAGE_CHANGE';

export interface LifecycleEventRecord {
  id: string;
  userId: string;
  eventType: LifecycleEventType;
  fromStage?: LifecycleStage;
  toStage: LifecycleStage;
  initiatedBy: string;
  reason: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface MoverRequest {
  id: string;
  userId: string;
  targetRole?: string;
  targetDepartmentId?: string;
  targetDepartmentName?: string;
  targetBranchId?: string;
  targetBranchName?: string;
  targetCompanyId?: string;
  targetCompanyName?: string;
  targetManagerId?: string;
  targetManagerName?: string;
  effectiveDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  initiatedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface LeaverChecklist {
  userId: string;
  disableAccount: boolean;
  revokeSessions: boolean;
  revokeDevices: boolean;
  revokePermissions: boolean;
  assetChecklist: Array<{ item: string; returned: boolean }>;
  completedAt?: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface AccessReviewCampaign {
  id: string;
  name: string;
  type: 'MANAGER_REVIEW' | 'DEPARTMENT_REVIEW' | 'ROLE_REVIEW' | 'QUARTERLY_AUDIT';
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  reviewerId: string;
  reviewerName: string;
  totalDecisions: number;
  approvedDecisions: number;
  revokedDecisions: number;
  createdAt: string;
}

export interface AccessReviewDecision {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  role: string;
  permissionOrAccess: string;
  status: 'PENDING' | 'APPROVED' | 'REVOKED';
  reviewerId: string;
  comments?: string;
  decisionDate?: string;
}

export interface RoleGovernanceRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetUserId: string;
  targetUserName: string;
  requestedRole: string;
  reason: string;
  isTemporary: boolean;
  isEmergency: boolean;
  durationDays?: number;
  expiresAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  approverId?: string;
  createdAt: string;
}

export interface DelegatedAdminRecord {
  id: string;
  adminUserId: string;
  adminUserName: string;
  scopeType: 'COMPANY' | 'BRANCH' | 'DEPARTMENT';
  scopeId: string;
  scopeName: string;
  grantedBy: string;
  expiresAt?: string;
  createdAt: string;
}

export interface SoDRule {
  id: string;
  code: string;
  name: string;
  description: string;
  conflictingRoleA: string;
  conflictingRoleB: string;
  conflictingPermissionA?: string;
  conflictingPermissionB?: string;
  severity: 'HIGH' | 'CRITICAL';
  actionOnViolation: 'BLOCK' | 'WARN_AND_AUDIT';
  enabled: boolean;
  createdAt: string;
}

export interface SoDViolation {
  id: string;
  ruleId: string;
  ruleCode: string;
  userId: string;
  userName: string;
  attemptedAction: string;
  details: string;
  status: 'BLOCKED' | 'WARNED' | 'OVERRIDDEN';
  overriddenBy?: string;
  overrideReason?: string;
  timestamp: string;
}

export interface ProvisioningTarget {
  id: string;
  userId: string;
  systemName: 'INTERNAL_ERP' | 'SCIM_DIRECTORY' | 'WAREHOUSE_WMS' | 'FLEET_GPS';
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  lastSyncAt: string;
  error?: string;
}

export interface IdentityGovernanceAnalytics {
  activeUsers: number;
  inactiveUsers: number;
  dormantAccountsCount: number;
  privilegedUsersCount: number;
  expiredRolesCount: number;
  pendingCertificationsCount: number;
  sodViolationsCount: number;
  lifecycleStageBreakdown: Record<string, number>;
}
