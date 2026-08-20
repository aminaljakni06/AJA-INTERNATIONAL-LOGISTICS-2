import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireAuth } from '../auth';
import { getUserById } from '../../db/repositories/userRepository';
import { UserDoc } from '../../types/firestore';
import { UserRole } from '../../types/user';

const ADMIN_PRO_ROLES = new Set<UserRole>(['SYSTEM_ADMIN', 'PLATFORM_ADMIN']);

export function isAdminProRole(role: string | undefined): boolean {
  return !!role && ADMIN_PRO_ROLES.has(role as UserRole);
}

export function isPrivilegedAdministrator(user: Pick<UserDoc, 'role' | 'status'> | null | undefined): boolean {
  return !!user && user.status === 'ACTIVE' && isAdminProRole(user.role);
}

export function requireAdminPro(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, async () => {
    try {
      const principalId = req.user?.userId;
      if (!principalId) {
        res.status(401).json({ error: 'مصادقة هُوية المستخدم مطلوبة' });
        return;
      }

      const principal = await getUserById(principalId);
      if (!principal || !isAdminProRole(principal.role) || principal.status !== 'ACTIVE') {
        res.status(403).json({ error: 'ADMIN_PRO / SYSTEM_ADMIN privileges are required for this action.' });
        return;
      }

      req.user = {
        ...req.user!,
        role: principal.role,
        email: principal.email,
        fullName: principal.displayName,
      };
      next();
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Admin Pro authorization failed' });
    }
  });
}
