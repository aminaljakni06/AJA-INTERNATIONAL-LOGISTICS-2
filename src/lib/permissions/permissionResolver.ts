import { User } from '../../types/user';
import { ABACContext, ERPModule } from '../../types/permissions';
import { getPermissionById, PERMISSION_REGISTRY } from './permissionRegistry';
import { ABACEngine } from './abacEngine';
import { PolicyEngine } from './policyEngine';
import { isAdmin, isEnterpriseAdmin } from '../authUtils';

class PermissionCache {
  private cache = new Map<string, { result: boolean; timestamp: number }>();
  private TTL_MS = 15000; // Cache evaluation results for 15s for high efficiency

  public get(key: string): boolean | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.result;
  }

  public set(key: string, result: boolean): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export class PermissionResolver {
  private static cache = new PermissionCache();

  public static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Evaluates if a user has access to a permission ID (e.g., 'shipping:shipment:update')
   */
  public static hasPermission(
    user: User | null | undefined,
    permissionId: string,
    context?: ABACContext
  ): boolean {
    if (!user) return false;

    const explicitGrants = [
      ...(Array.isArray(user.customPermissions) ? user.customPermissions : []),
      ...(Array.isArray((user as any).permissions) ? (user as any).permissions : [])
    ];
    const hasExplicitGrant = explicitGrants.includes('*') || explicitGrants.includes(permissionId);
    const technicalAdminRoles = ['SYSTEM_ADMIN', 'ERP_ADMIN', 'IT_ADMIN', 'DATABASE_ADMIN'];
    if (context?.prohibitAdminBypass && context?.isGovernanceOrFinancial && technicalAdminRoles.includes(user.role)) {
      return false;
    }

    if (permissionId.startsWith('governance:') && ['ADMIN', 'SYSTEM_ADMIN', 'ERP_ADMIN'].includes(user.role) && !hasExplicitGrant) {
      return false;
    }

    // Admin override
    if (isAdmin(user)) return true;

    // Check Cache
    const cacheKey = `${user.id}:${permissionId}:${JSON.stringify(context || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    let granted = false;

    // 1. Check Explicit Custom Permissions in user profile
    if (explicitGrants.length > 0) {
      if (hasExplicitGrant) {
        granted = true;
      }
    }

    // 2. Check RBAC Role Assignment in Registry
    if (!granted) {
      const def = getPermissionById(permissionId);
      if (def) {
        if (def.defaultRoles.includes(user.role)) {
          granted = true;
        }
      }
    }

    // 3. Evaluate ABAC Context if permission is granted so far
    if (granted && context) {
      granted = ABACEngine.evaluate(user, context);
    }

    this.cache.set(cacheKey, granted);
    return granted;
  }

  public static evaluateDetailed(
    user: User | null | undefined,
    permissionId: string,
    context?: ABACContext
  ): { granted: boolean; reason?: string; permissionId: string } {
    const granted = this.hasPermission(user, permissionId, context);
    return {
      granted,
      permissionId,
      reason: granted ? 'Permission granted' : `Permission '${permissionId}' denied`,
    };
  }

  /**
   * Checks if user has permission to view/access an entire ERP Module
   */
  public static canAccessModule(user: User | null | undefined, moduleName: ERPModule): boolean {
    if (!user) return false;
    if (isEnterpriseAdmin(user)) return true;

    // Find any permission in that module assigned to user's role
    const modulePerms = PERMISSION_REGISTRY.filter((p) => p.module === moduleName);
    return modulePerms.some((p) => p.defaultRoles.includes(user.role));
  }

  /**
   * Helper to evaluate named Policy Rules
   */
  public static evaluatePolicy(
    policyId: string,
    user: User | null | undefined,
    context?: ABACContext
  ): boolean {
    return PolicyEngine.evaluatePolicy(policyId, user, context);
  }
}
