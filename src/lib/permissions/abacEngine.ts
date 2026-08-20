import { User } from '../../types/user';
import { ABACContext } from '../../types/permissions';
import { isEnterpriseAdmin } from '../authUtils';

export type ABACUser = Partial<User> & {
  userId?: string;
  role: User['role'] | string;
  legalEntityId?: string | null;
  clearanceLevel?: number;
  permissions?: string[];
  roles?: string[];
};
export type { ABACContext };

export class ABACEngine {
  private static hasExplicitPermission(user: ABACUser, permissionId: string): boolean {
    const grants = Array.isArray(user.permissions) ? user.permissions : [];
    return grants.includes('*') || grants.includes(permissionId);
  }

  /**
   * Evaluates Attribute-Based Access Control rules for a user in a given contextual scope.
   */
  public static evaluate(user: User | null | undefined, context?: ABACContext): boolean {
    if (!user) return false;

    const technicalAdminRoles = ['SYSTEM_ADMIN', 'ERP_ADMIN', 'IT_ADMIN', 'DATABASE_ADMIN'];
    if (context?.prohibitAdminBypass && context?.isGovernanceOrFinancial && technicalAdminRoles.includes(user.role)) {
      return false;
    }

    // Super Administrators & C-Suite bypass strict contextual ABAC restrictions unless explicitly prohibited above.
    if (isEnterpriseAdmin(user)) {
      return true;
    }

    if (!context) {
      return true; // No contextual restrictions provided
    }

    // 1. Company Isolation Check
    if (context.companyId && user.companyId) {
      if (user.companyId !== context.companyId && user.companyId !== 'AJA_GROUP_GLOBAL') {
        return false;
      }
    }

    // 2. Branch Isolation Check (if applicable)
    if (context.branchId && user.branchId) {
      // Branch Managers or higher roles can access their own branch or all if unassigned
      if (user.role !== 'BRANCH_MANAGER' && user.branchId !== context.branchId) {
        // Unless user is owner/assigned employee
        const isOwnerOrAssigned =
          context.createdById === user.id ||
          context.ownerId === user.id ||
          context.assignedToId === user.id;

        if (!isOwnerOrAssigned) {
          return false;
        }
      }
    }

    // 2b. Legal Entity Isolation Check
    if (context.legalEntityId && user.legalEntityId && user.legalEntityId !== context.legalEntityId) {
      return false;
    }

    // 3. Financial Approval Limit Check
    if (typeof context.amount === 'number' && context.amount > 0) {
      const userLimit = user.approvalLimit ?? 0;
      if (userLimit < context.amount && user.role !== 'CFO' && user.role !== 'CEO') {
        return false;
      }
    }

    // 4. Security Clearance Level Check
    if (typeof context.securityLevel === 'number') {
      const userLevel = user.securityLevel ?? 1;
      if (userLevel < context.securityLevel) {
        return false;
      }
    }

    // 5. Customer Record Ownership Check
    if (user.role === 'CUSTOMER') {
      const isOwner =
        context.createdById === user.id ||
        context.ownerId === user.id ||
        context.assignedToId === user.id ||
        context.companyId === user.companyId;

      return isOwner;
    }

    return true;
  }

  public static async evaluateAccess(
    permissionId: string,
    context?: ABACContext & { user?: any }
  ): Promise<boolean> {
    const user = context?.user as ABACUser | undefined;
    if (!user) return false;

    const privilegedGovernanceRoles = new Set([
      'CEO',
      'CFO',
      'COO',
      'LEGAL_COUNSEL',
      'COMPLIANCE_OFFICER',
      'AUDITOR',
      'FINANCE_MANAGER',
      'FINANCE_DIRECTOR',
      'BOARD_DIRECTOR'
    ]);

    if (permissionId.startsWith('governance:') && !privilegedGovernanceRoles.has(user.role) && !this.hasExplicitPermission(user, permissionId)) {
      return false;
    }

    return this.evaluate(context?.user, context);
  }
}
