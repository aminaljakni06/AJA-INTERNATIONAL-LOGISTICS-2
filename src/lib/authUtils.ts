import { User, UserRole } from '../types/user';

export function isCustomer(user: User | null | undefined): boolean {
  return user?.role === 'CUSTOMER';
}

export function isStaff(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'STAFF' || user.role === 'EMPLOYEE' || isEnterpriseAdmin(user);
}

export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN' || user.role === 'ERP_ADMIN' || user.role === 'CEO';
}

export function isEnterpriseAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return [
    'ADMIN',
    'SYSTEM_ADMIN',
    'ERP_ADMIN',
    'CEO',
    'COO',
    'CFO',
    'OPERATIONS_MANAGER',
  ].includes(user.role);
}

export function isStaffOrAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role !== 'CUSTOMER' && user.role !== 'PARTNER' && user.role !== 'READ_ONLY';
}

export function hasRolePermission(user: User | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return allowedRoles.includes(user.role);
}

export function canAccessCustomerData(user: User | null | undefined, targetCustomerId: string): boolean {
  if (!user) return false;
  if (isStaffOrAdmin(user)) return true;
  return user.id === targetCustomerId;
}

export function getRoleBadgeColor(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
    case 'SYSTEM_ADMIN':
    case 'ERP_ADMIN':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300';
    case 'CEO':
    case 'COO':
    case 'CFO':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300';
    case 'FINANCE_MANAGER':
    case 'FINANCE_OFFICER':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'STAFF':
    case 'OPERATIONS_MANAGER':
    case 'DISPATCHER':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300';
    case 'CUSTOMER':
      return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}
