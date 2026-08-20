import { Request, Response, NextFunction } from 'express';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import { ABACContext, ERPModule } from '../types/permissions';
import { User } from '../types/user';

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Express Middleware enforcing single permission requirement
 */
export function requirePermission(permissionId: string, getContext?: (req: Request) => ABACContext) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Session missing or invalid' });
    }

    const context = getContext ? getContext(req) : {
      companyId: req.body?.companyId || req.query?.companyId || user.companyId,
      branchId: req.body?.branchId || req.query?.branchId || user.branchId,
      amount: req.body?.amount ? Number(req.body.amount) : undefined,
    };

    const hasAccess = PermissionResolver.hasPermission(user, permissionId, context);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        requiredPermission: permissionId,
      });
    }

    next();
  };
}

/**
 * Express Middleware enforcing named Policy Rule
 */
export function requirePolicy(policyId: string, getContext?: (req: Request) => ABACContext) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Session missing or invalid' });
    }

    const context = getContext ? getContext(req) : {
      companyId: req.body?.companyId || req.query?.companyId || user.companyId,
      branchId: req.body?.branchId || req.query?.branchId || user.branchId,
      amount: req.body?.amount ? Number(req.body.amount) : undefined,
    };

    const allowed = PermissionResolver.evaluatePolicy(policyId, user, context);
    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden: Security policy violation',
        policy: policyId,
      });
    }

    next();
  };
}

/**
 * Express Middleware enforcing access to an entire ERP Module
 */
export function requireModuleAccess(moduleName: ERPModule) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Session missing or invalid' });
    }

    const allowed = PermissionResolver.canAccessModule(user, moduleName);
    if (!allowed) {
      return res.status(403).json({
        error: `Forbidden: No access to ${moduleName} module`,
      });
    }

    next();
  };
}
