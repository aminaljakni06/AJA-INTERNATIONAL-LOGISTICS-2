import { DomainModule } from './events';

export type WorkflowCategory =
  | 'SHIPMENT_APPROVAL'
  | 'QUOTE_APPROVAL'
  | 'PURCHASE_APPROVAL'
  | 'EXPENSE_APPROVAL'
  | 'INVOICE_APPROVAL'
  | 'LEAVE_APPROVAL'
  | 'RECRUITMENT_APPROVAL'
  | 'CUSTOMER_ONBOARDING'
  | 'VENDOR_ONBOARDING'
  | 'VEHICLE_MAINTENANCE'
  | 'WAREHOUSE_OPERATIONS'
  | 'CUSTOMS_CLEARANCE'
  | 'INCIDENT_MANAGEMENT'
  | 'RISK_REVIEW'
  | 'DOCUMENT_APPROVAL'
  | 'CONTRACT_APPROVAL'
  | 'AI_REVIEW'
  | 'GENERAL_BUSINESS';

export type WorkflowState =
  | 'DRAFT'
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'WAITING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'ARCHIVED'
  | string;

export type ApprovalPolicyType =
  | 'SINGLE'
  | 'SEQUENTIAL'
  | 'PARALLEL'
  | 'CONDITIONAL'
  | 'MAJORITY'
  | 'MULTI_LEVEL'
  | 'DYNAMIC'
  | 'ROLE_BASED'
  | 'DEPARTMENT_BASED'
  | 'BRANCH_BASED'
  | 'COMPANY_BASED';

export type StepType =
  | 'START'
  | 'APPROVAL'
  | 'TASK'
  | 'AUTOMATION'
  | 'AI_DECISION'
  | 'NOTIFICATION'
  | 'END';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELEGATED'
  | 'REASSIGNED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type EscalationLevel = 'NONE' | 'LEVEL_1_WARNING' | 'LEVEL_2_MANAGER' | 'LEVEL_3_DIRECTOR';

export interface WorkflowSLARule {
  dueDurationMinutes: number;
  responseDurationMinutes: number;
  warningDurationMinutes?: number;
  escalationLevel: EscalationLevel;
  reminderIntervalMinutes?: number;
  workingHoursOnly?: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN';
  value: any;
}

export interface WorkflowTransitionDef {
  targetStepId: string;
  condition?: WorkflowCondition;
  actionName?: string; // e.g. 'APPROVE', 'REJECT', 'DELEGATE', 'NEXT'
}

export interface WorkflowStepDef {
  id: string;
  name: string;
  description?: string;
  stepType: StepType;
  stateOnEntry: WorkflowState;
  stateOnExit?: WorkflowState;
  approvalPolicy?: ApprovalPolicyType;
  requiredRoles?: string[];
  requiredDepartmentId?: string;
  requiredBranchId?: string;
  minApprovalsRequired?: number;
  assignedUsers?: string[];
  sla?: WorkflowSLARule;
  transitions: WorkflowTransitionDef[];
}

export interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  module: DomainModule;
  category: WorkflowCategory;
  version: string;
  active: boolean;
  initialStepId: string;
  steps: WorkflowStepDef[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTaskAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface WorkflowTaskComment {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  comment: string;
  createdAt: string;
}

export interface WorkflowTask {
  id: string;
  workflowInstanceId: string;
  templateCode: string;
  stepId: string;
  stepName: string;
  title: string;
  description?: string;
  entityType: string;
  entityId: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  assignedUserId?: string;
  assignedRole?: string;
  assignedDepartmentId?: string;
  assignedBranchId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  escalated?: boolean;
  escalationLevel?: EscalationLevel;
  delegatedFromUserId?: string;
  comments: WorkflowTaskComment[];
  attachments: WorkflowTaskAttachment[];
  completedAt?: string;
  completedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistoryRecord {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  fromState: WorkflowState;
  toState: WorkflowState;
  action: string;
  performedByUserId?: string;
  performedByUserName?: string;
  performedByUserRole?: string;
  comments?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WorkflowAISuggestion {
  suggestion: 'APPROVE' | 'REJECT' | 'ESCALATE' | 'REVIEW_DETAILS';
  confidenceScore: number; // 0.0 - 1.0
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  predictedResolutionMinutes: number;
  rationale: string;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  templateCode: string;
  category: WorkflowCategory;
  module: DomainModule;
  title: string;
  entityType: string; // e.g., 'SHIPMENT', 'QUOTE', 'EXPENSE', 'INVOICE'
  entityId: string;
  companyId: string;
  branchId?: string;
  departmentId?: string;
  currentState: WorkflowState;
  currentStepId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  initiatedByUserId: string;
  initiatedByUserName?: string;
  priority: TaskPriority;
  minApprovalsRequired: number;
  currentApprovals: string[]; // List of user IDs who approved
  rejections: string[];
  history: WorkflowHistoryRecord[];
  aiSuggestion?: WorkflowAISuggestion;
  dueDate?: string;
  slaDeadline?: string;
  isSLAViolated?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StartWorkflowInput {
  templateCode: string;
  entityType: string;
  entityId: string;
  title: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  initiatedByUserId: string;
  initiatedByUserName?: string;
  priority?: TaskPriority;
  metadata?: Record<string, any>;
}

export interface WorkflowTransitionInput {
  instanceId: string;
  action: 'APPROVE' | 'REJECT' | 'DELEGATE' | 'REASSIGN' | 'CANCEL' | 'SUBMIT' | 'NEXT';
  userId: string;
  userName?: string;
  userRole?: string;
  comments?: string;
  targetUserId?: string; // For DELEGATE or REASSIGN
  targetRole?: string;
  targetStepId?: string;
}
