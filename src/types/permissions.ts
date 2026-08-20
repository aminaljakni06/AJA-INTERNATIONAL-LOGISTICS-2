import { UserRole, User } from './user';

export interface UserContext {
  userId: string;
  email?: string;
  fullName?: string;
  role: UserRole | string;
  roles?: Array<UserRole | string>;
  legalEntityId?: string | null;
  primaryLegalEntityId?: string | null;
  allowedLegalEntityIds?: string[];
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  country?: string | null;
  securityLevel?: number;
  approvalLimit?: number;
  isServicePrincipal?: boolean;
  isAiAgent?: boolean;
  attributes?: Record<string, any>;
}

export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'export'
  | 'import'
  | 'print'
  | 'manage';

export type ERPModule =
  | 'crm'
  | 'shipping'
  | 'warehouse'
  | 'fleet'
  | 'finance'
  | 'hr'
  | 'sales'
  | 'customer_service'
  | 'procurement'
  | 'compliance'
  | 'reports'
  | 'ai_platform'
  | 'settings'
  | 'system';

export interface PermissionDefinition {
  id: string; // e.g., 'shipping:shipment:view'
  module: ERPModule;
  resource: string; // e.g., 'shipment', 'invoice', 'customer'
  action: PermissionAction;
  name: string;
  nameAr: string;
  description: string;
  defaultRoles: UserRole[];
  requireABAC?: boolean;
}

export interface ABACContext {
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  country?: string | null;
  createdById?: string | null;
  assignedToId?: string | null;
  ownerId?: string | null;
  amount?: number;
  status?: string;
  securityLevel?: number;
  [key: string]: any;
}

export type PolicyFunction = (user: User | null | undefined, context?: ABACContext) => boolean;

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  evaluate: PolicyFunction;
}
