import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { ABACContext, ERPModule } from '../../types/permissions';
import { UserRole } from '../../types/user';

interface CanAccessProps {
  permission?: string;
  policy?: string;
  module?: ERPModule;
  roles?: UserRole[];
  context?: ABACContext;
  children: React.ReactNode | ((granted: boolean) => React.ReactNode);
  fallback?: React.ReactNode;
}

export const CanAccess: React.FC<CanAccessProps> = ({
  permission,
  policy,
  module,
  roles,
  context,
  children,
  fallback = null,
}) => {
  const { hasPermission, evaluatePolicy, canAccessModule, role } = usePermissions();

  let granted = true;

  if (permission) {
    granted = granted && hasPermission(permission, context);
  }

  if (policy) {
    granted = granted && evaluatePolicy(policy, context);
  }

  if (module) {
    granted = granted && canAccessModule(module);
  }

  if (roles && roles.length > 0 && role) {
    granted = granted && roles.includes(role);
  }

  if (typeof children === 'function') {
    return <>{children(granted)}</>;
  }

  if (!granted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
