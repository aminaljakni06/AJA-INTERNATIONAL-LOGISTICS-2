import { db } from '../db/database';
import { User } from '../types/user';
import { UserDoc, UserRole } from '../types/firestore';

function isLocalFallbackEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_AUTH_FALLBACK !== 'true';
}

function toFirestoreRole(role: User['role']): UserRole {
  return role as UserRole;
}

function toUserDoc(user: User): UserDoc {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    displayName: user.fullName,
    role: toFirestoreRole(user.role),
    roles: user.roles,
    permissions: user.permissions,
    customPermissions: user.customPermissions,
    companyId: user.companyId,
    companyName: user.companyName,
    branchId: user.branchId,
    departmentId: user.departmentId,
    securityLevel: user.securityLevel,
    status: (user as User & { status?: UserDoc['status'] }).status || 'ACTIVE',
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function getLocalUserByEmail(email: string): UserDoc | null {
  if (!isLocalFallbackEnabled()) {
    return null;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.getRaw().users.find((item) => item.email.toLowerCase() === cleanEmail);
  return user ? toUserDoc(user) : null;
}

export function getLocalUserById(id: string): UserDoc | null {
  if (!isLocalFallbackEnabled()) {
    return null;
  }

  const user = db.getRaw().users.find((item) => item.id === id);
  return user ? toUserDoc(user) : null;
}

export function logLocalAuthAudit(
  user: UserDoc,
  action: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): void {
  if (!isLocalFallbackEnabled()) {
    return;
  }

  db.logAudit(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    action,
    'USER',
    user.id,
    details,
    ipAddress
  );
}

export function isLocalAuthFallbackEnabled(): boolean {
  return isLocalFallbackEnabled();
}
