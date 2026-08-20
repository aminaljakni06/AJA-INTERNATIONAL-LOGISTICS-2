/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Feature Flag Registry & Evaluator
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Permission & Authorization Framework
 * Version: 1.0
 */

import { PermissionFeatureFlag, FeatureFlagStatus } from '../types/permissionFramework';
import { User } from '../types/user';

export const ENTERPRISE_FEATURE_FLAGS: Record<string, PermissionFeatureFlag> = {
  ai_analytics: {
    key: 'ai_analytics',
    name: 'AJA AI Logistics Intelligence Engine',
    nameAr: 'محرك الذكاء الاصطناعي لوجستيات',
    description: 'Predictive route optimization, automated rate calculation, and anomaly detection.',
    status: 'ENABLED',
  },
  automated_customs: {
    key: 'automated_customs',
    name: 'Automated Customs & Fast-Track Declaration',
    nameAr: 'التخليص الجمركي الآلي والتصريح السريع',
    description: 'Direct integration with GCC border gateways and customs clearance APIs.',
    status: 'ENABLED',
  },
  multi_branch_ledger: {
    key: 'multi_branch_ledger',
    name: 'Multi-Branch & Cross-Border General Ledger',
    nameAr: 'دفتر أستاذ متعدد الفروع والحدود',
    description: 'Automated inter-company reconciliation, multi-currency financial ledger.',
    status: 'ENABLED',
  },
  iot_fleet_tracking: {
    key: 'iot_fleet_tracking',
    name: 'Real-Time IoT Fleet Telemetry',
    nameAr: 'تتبع الأسطول المباشر عبر 사물인터넷 IoT',
    description: 'Live GPS location, temperature sensing for cold-chain, and driver safety scores.',
    status: 'ENABLED',
  },
  cross_border_edi: {
    key: 'cross_border_edi',
    name: 'Cross-Border Electronic Data Interchange (EDI)',
    nameAr: 'تبادل البيانات الإلكتروني عبر الحدود',
    description: 'B2B document exchange for sea & air carriers.',
    status: 'ENABLED',
  },
  blockchain_audit: {
    key: 'blockchain_audit',
    name: 'Immutable Logistics Audit Ledger',
    nameAr: 'سجل تدقيق اللوجستيات غير القابل للتعديل',
    description: 'Tamper-proof hash anchoring for bills of lading and high-value customs declarations.',
    status: 'BETA',
    allowedRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN', 'AUDITOR', 'CEO', 'CFO'],
  },
  experimental_ai_copilot: {
    key: 'experimental_ai_copilot',
    name: 'AI Logistics Voice & Chat Co-Pilot',
    nameAr: 'مساعد الذكاء الاصطناعي الصوتي والمحادثة',
    description: 'Autonomous agent dispatch and natural language querying.',
    status: 'EXPERIMENTAL',
    allowedRoles: ['SYSTEM_ADMIN', 'ERP_ADMIN'],
  },
};

/**
 * Runtime Feature Flag Evaluator
 */
export const evaluateFeatureFlag = (
  featureKey: string,
  user?: User | null,
  context?: { tenantId?: string; region?: string }
): { enabled: boolean; status: FeatureFlagStatus; reasonEn?: string; reasonAr?: string } => {
  const flag = ENTERPRISE_FEATURE_FLAGS[featureKey];

  if (!flag) {
    // Unknown feature default
    return { enabled: true, status: 'ENABLED' };
  }

  if (flag.status === 'DISABLED') {
    return {
      enabled: false,
      status: 'DISABLED',
      reasonEn: `Feature "${flag.name}" is currently disabled globally.`,
      reasonAr: `الميزة "${flag.nameAr}" معطلة حالياً بشكل عام.`,
    };
  }

  // Security level check
  if (flag.minSecurityLevel && user) {
    const userSecLevel = user.securityLevel || 0;
    if (userSecLevel < flag.minSecurityLevel) {
      return {
        enabled: false,
        status: flag.status,
        reasonEn: `Requires security clearing level ${flag.minSecurityLevel}.`,
        reasonAr: `تتطلب الميزة مستوى أمان ${flag.minSecurityLevel}.`,
      };
    }
  }

  // Role check
  if (flag.allowedRoles && flag.allowedRoles.length > 0) {
    if (!user || !flag.allowedRoles.includes(user.role)) {
      return {
        enabled: false,
        status: flag.status,
        reasonEn: `Feature restricted to designated administrative roles.`,
        reasonAr: `الميزة مقتصرة على الأدوار الإدارية المحددة.`,
      };
    }
  }

  // Tenant restriction check
  if (flag.allowedTenants && flag.allowedTenants.length > 0) {
    const activeTenant = context?.tenantId || user?.companyId;
    if (!activeTenant || !flag.allowedTenants.includes(activeTenant)) {
      return {
        enabled: false,
        status: 'TENANT_RESTRICTED',
        reasonEn: `Feature is not licensed for current tenant organization.`,
        reasonAr: `الميزة غير مرخصة للمؤسسة الحالية.`,
      };
    }
  }

  return { enabled: true, status: flag.status };
};

/**
 * Helper to check if feature is enabled
 */
export const isFeatureEnabled = (
  featureKey: string,
  user?: User | null,
  context?: { tenantId?: string; region?: string }
): boolean => {
  return evaluateFeatureFlag(featureKey, user, context).enabled;
};
