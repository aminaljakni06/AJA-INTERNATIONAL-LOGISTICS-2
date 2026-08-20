/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Protected Route
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEnterprisePermissions } from '../../context/PermissionContext';
import { UserRole } from '../../types/user';
import { ERPModule } from '../../types/permissions';
import { PermissionEmptyState, OfflineEmptyState } from '../common/EnterpriseEmptyStates';
import { EnterpriseSpinner } from '../common/EnterpriseSpinners';

export interface EnterpriseProtectedRouteProps {
  publicRoute?: boolean;
  authenticatedOnly?: boolean;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermission?: string;
  requiredModule?: ERPModule;
  requiredFeatureFlag?: string;
  requiredCompanyId?: string;
  fallbackRedirectUrl?: string;
  isAr?: boolean;
  children: React.ReactNode;
}

export const EnterpriseProtectedRoute: React.FC<EnterpriseProtectedRouteProps> = ({
  publicRoute = false,
  authenticatedOnly = true,
  requiredRole,
  requiredRoles,
  requiredPermission,
  requiredModule,
  requiredFeatureFlag,
  requiredCompanyId,
  isAr = false,
  children,
}) => {
  const { user, isLoading } = useAuth();
  const {
    role,
    companyId,
    hasPermission,
    isFeatureEnabled,
  } = useEnterprisePermissions();

  // Public routes pass immediately
  if (publicRoute) {
    return <>{children}</>;
  }

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center p-12">
        <EnterpriseSpinner size="lg" variant="cyan" label={isAr ? 'جاري التحقق من الصلاحيات...' : 'Verifying Route Access...'} />
      </div>
    );
  }

  // Unauthenticated check
  if (authenticatedOnly && !user) {
    return (
      <PermissionEmptyState
        moduleNameEn="Authentication Required"
        moduleNameAr="تسجيل الدخول مطلوب"
        isAr={isAr}
      />
    );
  }

  // Tenant / Company check
  if (requiredCompanyId && companyId && companyId !== requiredCompanyId) {
    return (
      <PermissionEmptyState
        moduleNameEn="Organization Boundary Restricted"
        moduleNameAr="النطاق المخصص لهذه المنظمة محظور"
        isAr={isAr}
      />
    );
  }

  // Feature Flag check
  if (requiredFeatureFlag && !isFeatureEnabled(requiredFeatureFlag)) {
    return (
      <PermissionEmptyState
        moduleNameEn={`Feature Flag "${requiredFeatureFlag}" Disabled`}
        moduleNameAr={`الميزة "${requiredFeatureFlag}" معطلة`}
        isAr={isAr}
      />
    );
  }

  // Role requirement check
  if (requiredRole && role) {
    if (role !== requiredRole && role !== 'SYSTEM_ADMIN' && role !== 'ERP_ADMIN') {
      return (
        <PermissionEmptyState
          moduleNameEn={`Role "${requiredRole}" Required`}
          moduleNameAr={`الدور "${requiredRole}" مطلوب`}
          isAr={isAr}
        />
      );
    }
  }

  if (requiredRoles && requiredRoles.length > 0 && role) {
    const hasAllowedRole =
      requiredRoles.includes(role) || role === 'SYSTEM_ADMIN' || role === 'ERP_ADMIN';
    if (!hasAllowedRole) {
      return (
        <PermissionEmptyState
          moduleNameEn="Insufficient Executive Role"
          moduleNameAr="الدور التنفيذي غير كافٍ للوصول"
          isAr={isAr}
        />
      );
    }
  }

  // Specific Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <PermissionEmptyState
        moduleNameEn={`Permission "${requiredPermission}" Required`}
        moduleNameAr={`الصلاحية "${requiredPermission}" مطلوبة`}
        isAr={isAr}
      />
    );
  }

  // Module Level Permission check
  if (requiredModule && !hasPermission(`${requiredModule}:dashboard:view`)) {
    return (
      <PermissionEmptyState
        moduleNameEn={`ERP Module "${requiredModule}" Restricted`}
        moduleNameAr={`وحدة النظام "${requiredModule}" محظورة`}
        isAr={isAr}
      />
    );
  }

  return <>{children}</>;
};
