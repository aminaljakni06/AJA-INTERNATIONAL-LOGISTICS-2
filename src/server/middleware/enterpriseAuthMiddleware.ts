/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Express Auth & Permission Middleware
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth';
import { UserRole } from '../../types/user';
import { evaluatePermission } from '../../utils/permissionHelpers';
import { evaluateFeatureFlag } from '../../utils/featureFlags';

/**
 * Server-Side Permission Guard Middleware
 */
export function requirePermission(permissionId: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to access this resource.',
        errorAr: 'المصادقة مطلوبة للوصول إلى هذا المورد.',
        code: 'UNAUTHENTICATED',
      });
      return;
    }

    const evalResult = evaluatePermission(
      {
        id: req.user.userId,
        email: req.user.email,
        fullName: req.user.fullName,
        phone: '',
        role: req.user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      permissionId,
      {
        companyId: req.headers['x-company-id'] as string,
        branchId: req.headers['x-branch-id'] as string,
      }
    );

    if (!evalResult.granted) {
      res.status(403).json({
        success: false,
        error: evalResult.reasonEn || `Access forbidden. Requires permission "${permissionId}".`,
        errorAr: evalResult.reasonAr || `الوصول محظور. تتطلب الصلاحية "${permissionId}".`,
        code: evalResult.code || 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}

/**
 * Server-Side Role Protection Middleware
 */
export function requireEnterpriseRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
        errorAr: 'المصادقة مطلوبة.',
      });
      return;
    }

    const userRole = req.user.role;
    const isAllowed =
      allowedRoles.includes(userRole) ||
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'PLATFORM_ADMIN' ||
      userRole === 'ERP_ADMIN';

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        error: `Insufficient executive authorization. Required role in [${allowedRoles.join(', ')}].`,
        errorAr: 'الدور الوظيفي لا يمتلك الصلاحية الكافية.',
        code: 'ROLE_FORBIDDEN',
      });
      return;
    }

    next();
  };
}

/**
 * Feature Flag Server Guard
 */
export function requireFeatureFlag(featureKey: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const evalResult = evaluateFeatureFlag(
      featureKey,
      req.user
        ? {
            id: req.user.userId,
            email: req.user.email,
            fullName: req.user.fullName,
            phone: '',
            role: req.user.role,
            createdAt: '',
            updatedAt: '',
          }
        : null,
      {
        tenantId: req.headers['x-company-id'] as string,
      }
    );

    if (!evalResult.enabled) {
      res.status(403).json({
        success: false,
        error: evalResult.reasonEn || `Feature "${featureKey}" is disabled.`,
        errorAr: evalResult.reasonAr || `الميزة "${featureKey}" معطلة.`,
        code: 'FEATURE_DISABLED',
      });
      return;
    }

    next();
  };
}

/**
 * Tenant Isolation Guard Middleware
 */
export function tenantIsolationGuard() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Attach tenant header context
    const reqCompanyId = req.headers['x-company-id'] as string;
    if (reqCompanyId) {
      (req as any).tenantId = reqCompanyId;
    }

    next();
  };
}
