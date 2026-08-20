import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user';
import { UserDoc } from '../types/firestore';
import { AuthenticationAssuranceLevel, MFAMethod } from '../types/identity';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production');
  }

  return 'dev-only-aja-logistics-jwt-secret-change-before-production';
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  sessionId?: string;
  authenticationLevel?: AuthenticationAssuranceLevel;
  mfaVerified?: boolean;
  mfaMethod?: MFAMethod;
  mfaVerifiedAt?: string;
  mfaEnrollmentRequired?: boolean;
  stepUpVerifiedAt?: string;
  stepUpExpiresAt?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'لم يتم توفير رمز المصادقة (Unauthorized)' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'رمز المصادقة غير صالِح أو منتهي الصلاحية' });
    return;
  }

  req.user = decoded;
  next();
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'مصادقة هُوية المستخدم مطلوبة' });
      return;
    }

    const adminCompatibleRoles: UserRole[] = ['ADMIN', 'SYSTEM_ADMIN', 'PLATFORM_ADMIN', 'ERP_ADMIN'];
    const staffCompatibleRoles: UserRole[] = [
      'STAFF',
      'ADMIN',
      'SYSTEM_ADMIN',
      'PLATFORM_ADMIN',
      'ERP_ADMIN',
      'OPERATIONS_MANAGER',
      'BRANCH_MANAGER',
      'EMPLOYEE',
    ];

    const roleAllowed =
      allowedRoles.includes(req.user.role) ||
      (allowedRoles.includes('ADMIN') && adminCompatibleRoles.includes(req.user.role)) ||
      (allowedRoles.includes('STAFF') && staffCompatibleRoles.includes(req.user.role));

    if (!roleAllowed) {
      res.status(403).json({ error: 'ليس لديك صلاحية للوصول إلى هذا الإجراء (Forbidden)' });
      return;
    }

    next();
  };
}

/**
 * Remove sensitive parameters before returning User object to client
 */
export function sanitizeUser(user: UserDoc): Omit<UserDoc, 'passwordHash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Enforces customer data isolation: CUSTOMER can only access their own data.
 * Returns true if allowed, false if forbidden.
 */
export function isAccessAllowedForCustomer(reqUser: AuthPayload, targetCustomerId: string): boolean {
  if (reqUser.role === 'STAFF' || reqUser.role === 'ADMIN') {
    return true;
  }
  return reqUser.userId === targetCustomerId;
}
