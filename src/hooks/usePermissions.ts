import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ABACContext, ERPModule } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import { isEnterpriseAdmin, isAdmin } from '../lib/authUtils';

export function usePermissions() {
  const { user } = useAuth();

  const checkPermission = useCallback(
    (permissionId: string, context?: ABACContext): boolean => {
      return PermissionResolver.hasPermission(user, permissionId, context);
    },
    [user]
  );

  const checkPolicy = useCallback(
    (policyId: string, context?: ABACContext): boolean => {
      return PermissionResolver.evaluatePolicy(policyId, user, context);
    },
    [user]
  );

  const checkModuleAccess = useCallback(
    (moduleName: ERPModule): boolean => {
      return PermissionResolver.canAccessModule(user, moduleName);
    },
    [user]
  );

  const userIsAdmin = useMemo(() => isAdmin(user), [user]);
  const userIsEnterpriseAdmin = useMemo(() => isEnterpriseAdmin(user), [user]);

  return {
    user,
    role: user?.role,
    isAdmin: userIsAdmin,
    isEnterpriseAdmin: userIsEnterpriseAdmin,
    hasPermission: checkPermission,
    evaluatePolicy: checkPolicy,
    canAccessModule: checkModuleAccess,
  };
}
