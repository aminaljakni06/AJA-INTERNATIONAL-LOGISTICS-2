/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Permission Helper Library
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import { UserRole, User } from '../types/user';
import { PermissionResourceType, PermissionResult } from '../types/permissionFramework';
import { ABACContext } from '../types/permissions';

/**
 * Role Hierarchy Numerical Weighting
 */
export const ROLE_HIERARCHY_LEVELS: Record<UserRole, number> = {
  SYSTEM_ADMIN: 100,
  PLATFORM_ADMIN: 95,
  ERP_ADMIN: 90,
  CEO: 85,
  COO: 85,
  CFO: 85,
  ADMIN: 80,
  COMPANY_ADMIN: 80,
  BRANCH_MANAGER: 70,
  HR_MANAGER: 65,
  FINANCE_MANAGER: 65,
  SALES_MANAGER: 65,
  CUSTOMER_SERVICE_MANAGER: 65,
  WAREHOUSE_MANAGER: 65,
  CUSTOMS_MANAGER: 65,
  FLEET_MANAGER: 65,
  OPERATIONS_MANAGER: 65,
  TEAM_LEADER: 50,
  DISPATCHER: 45,
  FINANCE_OFFICER: 45,
  COMPLIANCE_OFFICER: 45,
  LEGAL_COUNSEL: 45,
  EMPLOYEE: 40,
  STAFF: 40,
  DRIVER: 35,
  CUSTOMS_OFFICER: 35,
  ACCOUNTANT: 35,
  AUDITOR: 35,
  AGENT: 30,
  PARTNER: 30,
  CUSTOMER: 20,
  GUEST: 10,
  READ_ONLY: 5,
};

/**
 * Default System Admin Wildcard check
 */
export const isSuperUser = (user?: User | null): boolean => {
  if (!user) return false;
  return user.role === 'SYSTEM_ADMIN' || user.role === 'PLATFORM_ADMIN' || user.role === 'ERP_ADMIN';
};

/**
 * Verify Tenant Boundary
 */
export const validateTenantBoundary = (
  user?: User | null,
  context?: ABACContext
): boolean => {
  if (!user) return false;
  if (isSuperUser(user)) return true;

  // If user has companyId, match with target context companyId
  if (user.companyId && context?.companyId) {
    if (user.companyId !== context.companyId) return false;
  }

  // Branch boundary
  if (user.branchId && context?.branchId) {
    if (user.branchId !== context.branchId) return false;
  }

  return true;
};

/**
 * Core Permission Evaluator
 */
export const evaluatePermission = (
  user: User | null | undefined,
  permissionId: string,
  context?: ABACContext
): PermissionResult => {
  if (!user) {
    return {
      granted: false,
      code: 'MISSING_ROLE',
      reasonEn: 'User is unauthenticated.',
      reasonAr: 'المستخدم غير موثق.',
    };
  }

  // Superuser bypass
  if (isSuperUser(user)) {
    return { granted: true, code: 'GRANTED' };
  }

  // Tenant / Company Scope Match
  if (!validateTenantBoundary(user, context)) {
    return {
      granted: false,
      code: 'TENANT_MISMATCH',
      reasonEn: 'Action restricted to user scope company/branch boundary.',
      reasonAr: 'الإجراء مقتصر على نطاق الشركة أو الفرع الخاص بالمستخدم.',
    };
  }

  // Custom User Explicit Permissions
  if (user.customPermissions && user.customPermissions.includes(permissionId)) {
    return { granted: true, code: 'GRANTED' };
  }

  // Wildcard module permission check e.g. "shipping:*"
  const [module, resource, action] = permissionId.split(':');
  if (user.customPermissions) {
    if (user.customPermissions.includes(`${module}:*`)) return { granted: true, code: 'GRANTED' };
    if (user.customPermissions.includes(`${module}:${resource}:*`)) return { granted: true, code: 'GRANTED' };
  }

  // Role Level Fallback
  const userLevel = ROLE_HIERARCHY_LEVELS[user.role] || 0;

  // Read-only user restriction
  if (user.role === 'READ_ONLY' && action !== 'view' && action !== 'export' && action !== 'print') {
    return {
      granted: false,
      code: 'MISSING_PERMISSION',
      reasonEn: 'Read-only profile cannot execute mutation actions.',
      reasonAr: 'حساب القراءة فقط لا يمكنه إجراء تعديلات.',
    };
  }

  // Standard Role Check by Module
  if (userLevel >= 40) {
    // Default staff access allowed unless explicitly restricted
    return { granted: true, code: 'GRANTED' };
  }

  // Customer restricted scope
  if (user.role === 'CUSTOMER') {
    if (module === 'crm' || module === 'shipping' || module === 'quotes') {
      if (action === 'view' || action === 'create') {
        return { granted: true, code: 'GRANTED' };
      }
    }
    return {
      granted: false,
      code: 'MISSING_PERMISSION',
      reasonEn: 'Customer account access is restricted to customer portal features.',
      reasonAr: 'حساب العميل مقتصر على خدمات بوابة العملاء فقط.',
    };
  }

  return {
    granted: false,
    code: 'MISSING_PERMISSION',
    reasonEn: `Role ${user.role} lacks required authorization "${permissionId}".`,
    reasonAr: `الدور ${user.role} يفتقر إلى التخليص المطلوب "${permissionId}".`,
  };
};

/**
 * Public Helper Library Functions
 */
export const hasPermission = (
  user: User | null | undefined,
  permissionId: string,
  context?: ABACContext
): boolean => {
  return evaluatePermission(user, permissionId, context).granted;
};

export const hasAnyPermission = (
  user: User | null | undefined,
  permissionIds: string[],
  context?: ABACContext
): boolean => {
  if (!permissionIds || permissionIds.length === 0) return true;
  return permissionIds.some((id) => hasPermission(user, id, context));
};

export const hasAllPermissions = (
  user: User | null | undefined,
  permissionIds: string[],
  context?: ABACContext
): boolean => {
  if (!permissionIds || permissionIds.length === 0) return true;
  return permissionIds.every((id) => hasPermission(user, id, context));
};

export const canView = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:view`, context);
};

export const canCreate = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:create`, context);
};

export const canEdit = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:edit`, context);
};

export const canDelete = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:delete`, context);
};

export const canApprove = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:approve`, context);
};

export const canExport = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:export`, context);
};

export const canManage = (
  user: User | null | undefined,
  resource: PermissionResourceType | string,
  context?: ABACContext
): boolean => {
  return hasPermission(user, `general:${resource}:manage`, context);
};

export const evaluateRoleHierarchy = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  const userLevel = ROLE_HIERARCHY_LEVELS[userRole] || 0;
  const reqLevel = ROLE_HIERARCHY_LEVELS[requiredRole] || 0;
  return userLevel >= reqLevel;
};

export const getPermissionDeniedMessage = (
  permissionId: string,
  isAr: boolean = false
): { title: string; description: string } => {
  const parts = permissionId.split(':');
  const resource = parts[1] || 'resource';
  const action = parts[2] || 'access';

  if (isAr) {
    return {
      title: 'الصلاحية غير متاحة',
      description: `حسابك الحالي لا يمتلك الصلاحية الكافية لإجراء (${action}) على (${resource}). يرجى التواصل مع مسؤول النظام.`,
    };
  }

  return {
    title: 'Access Restricted',
    description: `Your active user account lacks the required authorization to ${action} ${resource}. Please contact your system administrator.`,
  };
};
