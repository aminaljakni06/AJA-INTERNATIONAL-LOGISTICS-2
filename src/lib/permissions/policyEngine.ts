import { User } from '../../types/user';
import { ABACContext, PolicyRule } from '../../types/permissions';
import { isEnterpriseAdmin, isAdmin, isStaffOrAdmin } from '../authUtils';
import { ABACEngine } from './abacEngine';

export class PolicyEngine {
  private static policies = new Map<string, PolicyRule>();

  public static registerPolicy(rule: PolicyRule): void {
    this.policies.set(rule.id, rule);
  }

  public static evaluatePolicy(policyId: string, user: User | null | undefined, context?: ABACContext): boolean {
    if (!user) return false;

    // Admin bypass
    if (isAdmin(user)) return true;

    const policy = this.policies.get(policyId);
    if (!policy) {
      console.warn(`Policy Engine: Policy "${policyId}" not found. Denying access by default.`);
      return false;
    }

    return policy.evaluate(user, context);
  }
}

// ==================== REGISTER ENTERPRISE POLICIES ====================

PolicyEngine.registerPolicy({
  id: 'CanViewShipment',
  name: 'Can View Shipment',
  description: 'Evaluates whether a user can view shipment details or tracking',
  evaluate: (user: User | null | undefined, context?: ABACContext) => {
    if (!user) return false;
    if (isStaffOrAdmin(user)) {
      return ABACEngine.evaluate(user, context);
    }
    // Customers can view shipments created by or assigned to them
    if (user.role === 'CUSTOMER') {
      if (!context) return true;
      return (
        context.createdById === user.id ||
        context.ownerId === user.id ||
        context.companyId === user.companyId
      );
    }
    return false;
  }
});

PolicyEngine.registerPolicy({
  id: 'CanEditShipment',
  name: 'Can Edit Shipment',
  description: 'Evaluates whether a user can update shipment status, route, or packages',
  evaluate: (user: User | null | undefined, context?: ABACContext) => {
    if (!user) return false;
    if (user.role === 'READ_ONLY' || user.role === 'CUSTOMER') return false;
    const allowedRoles = [
      'ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'COO',
      'OPERATIONS_MANAGER', 'BRANCH_MANAGER', 'DISPATCHER', 'STAFF', 'DRIVER', 'AGENT'
    ];
    if (allowedRoles.includes(user.role)) {
      return ABACEngine.evaluate(user, context);
    }
    return false;
  }
});

PolicyEngine.registerPolicy({
  id: 'CanApproveInvoice',
  name: 'Can Approve Invoice',
  description: 'Evaluates whether a user can approve invoices based on financial limits',
  evaluate: (user: User | null | undefined, context?: ABACContext) => {
    if (!user) return false;
    const allowedRoles = ['ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'FINANCE_MANAGER'];
    if (!allowedRoles.includes(user.role)) return false;

    if (context?.amount) {
      const userLimit = user.approvalLimit ?? 50000;
      if (userLimit < context.amount && user.role !== 'CFO' && user.role !== 'CEO') {
        return false;
      }
    }
    return ABACEngine.evaluate(user, context);
  }
});

PolicyEngine.registerPolicy({
  id: 'CanDeleteCustomer',
  name: 'Can Delete Customer',
  description: 'Evaluates whether a user can purge or remove customer accounts',
  evaluate: (user: User | null | undefined) => {
    if (!user) return false;
    return ['ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO'].includes(user.role);
  }
});

PolicyEngine.registerPolicy({
  id: 'CanAssignDriver',
  name: 'Can Assign Driver',
  description: 'Evaluates whether user can assign drivers to fleet dispatch orders',
  evaluate: (user: User | null | undefined, context?: ABACContext) => {
    if (!user) return false;
    const allowed = [
      'ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'COO', 'OPERATIONS_MANAGER',
      'FLEET_MANAGER', 'BRANCH_MANAGER', 'DISPATCHER'
    ];
    if (!allowed.includes(user.role)) return false;
    return ABACEngine.evaluate(user, context);
  }
});

PolicyEngine.registerPolicy({
  id: 'CanManageWarehouse',
  name: 'Can Manage Warehouse',
  description: 'Evaluates warehouse stock movement and bin transfer authority',
  evaluate: (user: User | null | undefined, context?: ABACContext) => {
    if (!user) return false;
    const allowed = [
      'ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'COO', 'WAREHOUSE_MANAGER',
      'OPERATIONS_MANAGER', 'BRANCH_MANAGER', 'STAFF'
    ];
    if (!allowed.includes(user.role)) return false;
    return ABACEngine.evaluate(user, context);
  }
});

PolicyEngine.registerPolicy({
  id: 'CanAccessFinance',
  name: 'Can Access Finance Module',
  description: 'Evaluates access to accounting ledgers and billing records',
  evaluate: (user: User | null | undefined, context?: ABACContext) => {
    if (!user) return false;
    const allowed = [
      'ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'FINANCE_MANAGER',
      'FINANCE_OFFICER', 'ACCOUNTANT' as any, 'AUDITOR'
    ];
    if (!allowed.includes(user.role)) return false;
    return ABACEngine.evaluate(user, context);
  }
});

PolicyEngine.registerPolicy({
  id: 'CanViewPayroll',
  name: 'Can View Payroll',
  description: 'Evaluates access to sensitive HR compensation and payroll records',
  evaluate: (user: User | null | undefined) => {
    if (!user) return false;
    return ['ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN', 'CEO', 'CFO', 'HR_MANAGER'].includes(user.role);
  }
});
