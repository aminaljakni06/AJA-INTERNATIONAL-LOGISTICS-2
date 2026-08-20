/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Permission Framework Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import { UserRole, User } from './user';
import { ERPModule } from './permissions';

export type ExtendedPermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'transfer'
  | 'archive'
  | 'restore'
  | 'import'
  | 'export'
  | 'upload'
  | 'download'
  | 'print'
  | 'share'
  | 'execute'
  | 'synchronize'
  | 'audit'
  | 'manage';

export type PermissionResourceType =
  | 'dashboard'
  | 'shipments'
  | 'quotes'
  | 'customers'
  | 'leads'
  | 'crm'
  | 'warehouse'
  | 'inventory'
  | 'fleet'
  | 'transportation'
  | 'finance'
  | 'treasury'
  | 'invoices'
  | 'payments'
  | 'documents'
  | 'users'
  | 'roles'
  | 'settings'
  | 'reports'
  | 'analytics'
  | 'audit_logs'
  | 'notifications'
  | 'ai_services'
  | 'integrations'
  | 'erp_modules';

export type FeatureFlagStatus =
  | 'ENABLED'
  | 'DISABLED'
  | 'BETA'
  | 'INTERNAL'
  | 'EXPERIMENTAL'
  | 'LICENSED'
  | 'REGION_RESTRICTED'
  | 'TENANT_RESTRICTED';

export interface PermissionFeatureFlag {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  status: FeatureFlagStatus;
  allowedRoles?: UserRole[];
  allowedTenants?: string[];
  allowedRegions?: string[];
  minSecurityLevel?: number;
}

export interface PermissionHierarchyNode {
  platformId?: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  role: UserRole;
  module: ERPModule;
  resource: PermissionResourceType | string;
  action: ExtendedPermissionAction;
}

export interface EnterpriseRoleDefinition {
  role: UserRole;
  displayNameEn: string;
  displayNameAr: string;
  level: number; // Hierarchy depth (e.g. 100 for SYSTEM_ADMIN, 10 for GUEST)
  inheritsFrom?: UserRole[];
  defaultPermissions: string[]; // e.g. ['shipping:shipment:view', 'shipping:shipment:create']
}

export interface PermissionResult {
  granted: boolean;
  reasonEn?: string;
  reasonAr?: string;
  code?: 'GRANTED' | 'MISSING_ROLE' | 'MISSING_PERMISSION' | 'TENANT_MISMATCH' | 'FEATURE_DISABLED' | 'SECURITY_LEVEL_INSUFFICIENT';
  auditMeta?: Record<string, any>;
}

export interface PermissionContextType {
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  companyId: string | null;
  branchId: string | null;
  departmentId: string | null;
  grantedPermissions: Set<string>;
  deniedPermissions: Set<string>;
  featureFlags: Record<string, FeatureFlagStatus>;
  
  // Helpers
  hasPermission: (permissionId: string, context?: Record<string, any>) => boolean;
  hasAnyPermission: (permissionIds: string[], context?: Record<string, any>) => boolean;
  hasAllPermissions: (permissionIds: string[], context?: Record<string, any>) => boolean;
  canView: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  canCreate: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  canEdit: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  canDelete: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  canApprove: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  canExport: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  canManage: (resource: PermissionResourceType | string, context?: Record<string, any>) => boolean;
  isFeatureEnabled: (featureKey: string) => boolean;
  
  // Overrides for testing / admin impersonation
  setRoleOverride: (role: UserRole | null) => void;
  resetRoleOverride: () => void;
}

export interface PermissionAuditEntry {
  timestamp: string;
  userId?: string;
  userEmail?: string;
  role?: UserRole;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  permissionId?: string;
  resource?: string;
  action?: string;
  result: 'GRANTED' | 'DENIED';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}
