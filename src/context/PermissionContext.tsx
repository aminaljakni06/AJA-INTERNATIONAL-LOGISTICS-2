/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Permission Context Provider
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UserRole, User } from '../types/user';
import { PermissionContextType, PermissionResourceType, FeatureFlagStatus } from '../types/permissionFramework';
import {
  hasPermission as evalHasPermission,
  hasAnyPermission as evalHasAnyPermission,
  hasAllPermissions as evalHasAllPermissions,
  canView as evalCanView,
  canCreate as evalCanCreate,
  canEdit as evalCanEdit,
  canDelete as evalCanDelete,
  canApprove as evalCanApprove,
  canExport as evalCanExport,
  canManage as evalCanManage,
} from '../utils/permissionHelpers';
import { isFeatureEnabled as evalIsFeatureEnabled, ENTERPRISE_FEATURE_FLAGS } from '../utils/featureFlags';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [roleOverride, setRoleOverrideState] = useState<UserRole | null>(null);

  // Active Effective User
  const activeUser = useMemo<User | null>(() => {
    if (!authUser) return null;
    if (roleOverride) {
      return {
        ...authUser,
        role: roleOverride,
      };
    }
    return authUser;
  }, [authUser, roleOverride]);

  const role = activeUser?.role || null;
  const tenantId = activeUser?.companyId || null;
  const companyId = activeUser?.companyId || null;
  const branchId = activeUser?.branchId || null;
  const departmentId = activeUser?.departmentId || null;

  // Active Set of granted custom permissions
  const grantedPermissions = useMemo<Set<string>>(() => {
    return new Set(activeUser?.customPermissions || []);
  }, [activeUser]);

  const deniedPermissions = useMemo<Set<string>>(() => {
    return new Set();
  }, []);

  const featureFlags = useMemo<Record<string, FeatureFlagStatus>>(() => {
    const flags: Record<string, FeatureFlagStatus> = {};
    Object.keys(ENTERPRISE_FEATURE_FLAGS).forEach((k) => {
      flags[k] = ENTERPRISE_FEATURE_FLAGS[k].status;
    });
    return flags;
  }, []);

  const setRoleOverride = useCallback((newRole: UserRole | null) => {
    setRoleOverrideState(newRole);
  }, []);

  const resetRoleOverride = useCallback(() => {
    setRoleOverrideState(null);
  }, []);

  const hasPermission = useCallback(
    (permissionId: string, context?: Record<string, any>) => {
      return evalHasPermission(activeUser, permissionId, context);
    },
    [activeUser]
  );

  const hasAnyPermission = useCallback(
    (permissionIds: string[], context?: Record<string, any>) => {
      return evalHasAnyPermission(activeUser, permissionIds, context);
    },
    [activeUser]
  );

  const hasAllPermissions = useCallback(
    (permissionIds: string[], context?: Record<string, any>) => {
      return evalHasAllPermissions(activeUser, permissionIds, context);
    },
    [activeUser]
  );

  const canView = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanView(activeUser, resource, context);
    },
    [activeUser]
  );

  const canCreate = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanCreate(activeUser, resource, context);
    },
    [activeUser]
  );

  const canEdit = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanEdit(activeUser, resource, context);
    },
    [activeUser]
  );

  const canDelete = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanDelete(activeUser, resource, context);
    },
    [activeUser]
  );

  const canApprove = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanApprove(activeUser, resource, context);
    },
    [activeUser]
  );

  const canExport = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanExport(activeUser, resource, context);
    },
    [activeUser]
  );

  const canManage = useCallback(
    (resource: PermissionResourceType | string, context?: Record<string, any>) => {
      return evalCanManage(activeUser, resource, context);
    },
    [activeUser]
  );

  const isFeatureEnabled = useCallback(
    (featureKey: string) => {
      return evalIsFeatureEnabled(featureKey, activeUser, { tenantId: companyId || undefined });
    },
    [activeUser, companyId]
  );

  const value: PermissionContextType = useMemo(
    () => ({
      user: activeUser,
      role,
      tenantId,
      companyId,
      branchId,
      departmentId,
      grantedPermissions,
      deniedPermissions,
      featureFlags,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canView,
      canCreate,
      canEdit,
      canDelete,
      canApprove,
      canExport,
      canManage,
      isFeatureEnabled,
      setRoleOverride,
      resetRoleOverride,
    }),
    [
      activeUser,
      role,
      tenantId,
      companyId,
      branchId,
      departmentId,
      grantedPermissions,
      deniedPermissions,
      featureFlags,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canView,
      canCreate,
      canEdit,
      canDelete,
      canApprove,
      canExport,
      canManage,
      isFeatureEnabled,
      setRoleOverride,
      resetRoleOverride,
    ]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const useEnterprisePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    // Return a safe fallback if context is rendered outside provider
    return {
      user: null,
      role: null,
      tenantId: null,
      companyId: null,
      branchId: null,
      departmentId: null,
      grantedPermissions: new Set(),
      deniedPermissions: new Set(),
      featureFlags: {},
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      canView: () => true,
      canCreate: () => true,
      canEdit: () => true,
      canDelete: () => true,
      canApprove: () => true,
      canExport: () => true,
      canManage: () => true,
      isFeatureEnabled: () => true,
      setRoleOverride: () => {},
      resetRoleOverride: () => {},
    };
  }
  return context;
};
