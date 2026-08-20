/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise UI Permission Guards
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import React from 'react';
import { useEnterprisePermissions } from '../../context/PermissionContext';
import { UserRole } from '../../types/user';
import { PermissionEmptyState } from './EnterpriseEmptyStates';
import { Button, ButtonProps } from './Button';
import { Lock } from 'lucide-react';
import { evaluateRoleHierarchy } from '../../utils/permissionHelpers';

export interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  moduleNameEn?: string;
  moduleNameAr?: string;
  isAr?: boolean;
  children: React.ReactNode;
}

/**
 * Standard Permission Guard Component
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  context,
  fallback,
  showFallback = false,
  moduleNameEn,
  moduleNameAr,
  isAr = false,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useEnterprisePermissions();

  let isAuthorized = true;

  if (permission) {
    isAuthorized = hasPermission(permission, context);
  } else if (permissions.length > 0) {
    isAuthorized = requireAll
      ? hasAllPermissions(permissions, context)
      : hasAnyPermission(permissions, context);
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showFallback) {
    return (
      <PermissionEmptyState
        moduleNameEn={moduleNameEn}
        moduleNameAr={moduleNameAr}
        isAr={isAr}
      />
    );
  }

  return null;
};

/**
 * Role Guard Component
 */
export const RoleGuard: React.FC<{
  allowedRoles?: UserRole[];
  minRole?: UserRole;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ allowedRoles, minRole, fallback = null, children }) => {
  const { user, role } = useEnterprisePermissions();

  if (!user || !role) return <>{fallback}</>;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <>{fallback}</>;
    }
  }

  if (minRole) {
    if (!evaluateRoleHierarchy(role, minRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * Feature Flag Guard Component
 */
export const FeatureGuard: React.FC<{
  featureKey: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ featureKey, fallback = null, children }) => {
  const { isFeatureEnabled } = useEnterprisePermissions();

  if (isFeatureEnabled(featureKey)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Protected Button Component
 * Hides or disables button based on permission with tooltip lock indication
 */
export interface ProtectedButtonProps extends ButtonProps {
  permission?: string;
  featureKey?: string;
  requiredRole?: UserRole;
  mode?: 'hide' | 'disable';
  lockTooltipEn?: string;
  lockTooltipAr?: string;
  isAr?: boolean;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  permission,
  featureKey,
  requiredRole,
  mode = 'disable',
  lockTooltipEn = 'Action locked due to insufficient administrative permissions',
  lockTooltipAr = 'الإجراء مقفل بسبب عدم توفر الصلاحيات الكافية',
  isAr = false,
  children,
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const { hasPermission, isFeatureEnabled, role } = useEnterprisePermissions();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (featureKey && !isFeatureEnabled(featureKey)) {
    isAllowed = false;
  }

  if (requiredRole && role) {
    if (!evaluateRoleHierarchy(role, requiredRole)) {
      isAllowed = false;
    }
  }

  if (isAllowed) {
    return (
      <Button onClick={onClick} disabled={disabled} className={className} {...props}>
        {children}
      </Button>
    );
  }

  if (mode === 'hide') {
    return null;
  }

  // Disabled Mode with Lock Badge and Tooltip
  return (
    <div className="relative inline-block group cursor-not-allowed">
      <Button
        {...props}
        disabled={true}
        aria-disabled="true"
        title={isAr ? lockTooltipAr : lockTooltipEn}
        className={`opacity-50 grayscale pointer-events-none gap-2 ${className}`}
      >
        <Lock className="w-3.5 h-3.5 text-amber-400/80" />
        {children}
      </Button>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs shadow-xl text-center pointer-events-none">
        {isAr ? lockTooltipAr : lockTooltipEn}
      </div>
    </div>
  );
};

/**
 * Protected Form Field Slot
 * Renders read-only state or disabled input when user lacks edit permissions
 */
export const ProtectedFormSlot: React.FC<{
  editPermission: string;
  readOnlyComponent?: React.ReactNode;
  children: React.ReactNode;
}> = ({ editPermission, readOnlyComponent, children }) => {
  const { hasPermission } = useEnterprisePermissions();
  const canEditField = hasPermission(editPermission);

  if (canEditField) {
    return <>{children}</>;
  }

  if (readOnlyComponent) {
    return <>{readOnlyComponent}</>;
  }

  // Fallback: render disabled container
  return <div className="opacity-60 pointer-events-none select-none">{children}</div>;
};

/**
 * Protected Tab Item
 */
export const ProtectedTab: React.FC<{
  permission?: string;
  featureKey?: string;
  children: React.ReactNode;
}> = ({ permission, featureKey, children }) => {
  const { hasPermission, isFeatureEnabled } = useEnterprisePermissions();

  if (permission && !hasPermission(permission)) return null;
  if (featureKey && !isFeatureEnabled(featureKey)) return null;

  return <>{children}</>;
};

/**
 * Protected Card Component
 */
export const ProtectedCard: React.FC<{
  permission: string;
  titleEn?: string;
  titleAr?: string;
  isAr?: boolean;
  children: React.ReactNode;
}> = ({ permission, titleEn, titleAr, isAr = false, children }) => {
  const { hasPermission } = useEnterprisePermissions();

  if (!hasPermission(permission)) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-slate-500 text-sm">
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <span>{isAr ? titleAr || 'بطاقة مقفلة' : titleEn || 'Restricted Card Content'}</span>
        </span>
        <span className="text-xs font-mono uppercase bg-slate-800 px-2 py-0.5 rounded">
          {isAr ? 'الصلاحية مطلوبة' : 'Permission Required'}
        </span>
      </div>
    );
  }

  return <>{children}</>;
};
