import {
  SystemSettingItem,
  FeatureFlag,
  UserPreferences,
  ModuleConfig,
  ConfigValidationIssue,
  EvaluationContext,
  ConfigScope,
  ModuleConfigStatus,
} from '../types/config';
import { ConfigEngine } from '../lib/config/ConfigEngine';
import { FeatureFlagEngine } from '../lib/config/FeatureFlagEngine';
import { AuditService } from './auditService';
import { EventBusService } from './eventBusService';
import { getAdminFirestore } from '../server/firebaseAdmin';

export class ConfigService {
  private static settingsCatalog: SystemSettingItem[] = [
    {
      id: 'cfg_101',
      key: 'AUTH_SESSION_TIMEOUT_MINUTES',
      category: 'AUTHENTICATION',
      name: 'Session Inactivity Timeout',
      description: 'Maximum allowable idle session time before automatic logout',
      scope: 'GLOBAL',
      valueType: 'NUMBER',
      value: 60,
      defaultValue: 60,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_102',
      key: 'SECURITY_MANDATE_MFA',
      category: 'SECURITY',
      name: 'Enforce Multi-Factor Authentication',
      description: 'Require TOTP or SMS OTP for all administrative and operational staff',
      scope: 'GLOBAL',
      valueType: 'BOOLEAN',
      value: true,
      defaultValue: true,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_103',
      key: 'LOCALIZATION_DEFAULT_LANGUAGE',
      category: 'LOCALIZATION',
      name: 'System Default Language',
      description: 'Primary UI presentation language across ERP portals',
      scope: 'GLOBAL',
      valueType: 'STRING',
      value: 'ar',
      defaultValue: 'ar',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_104',
      key: 'LOCALIZATION_DEFAULT_CURRENCY',
      category: 'LOCALIZATION',
      name: 'Base Reporting Currency',
      description: 'Default financial currency symbol and ISO code',
      scope: 'GLOBAL',
      valueType: 'STRING',
      value: 'SAR',
      defaultValue: 'SAR',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_105',
      key: 'NOTIFICATION_WHATSAPP_ENABLED',
      category: 'NOTIFICATIONS',
      name: 'WhatsApp Business API Dispatch',
      description: 'Send automated tracking updates via Meta WhatsApp Cloud API',
      scope: 'GLOBAL',
      valueType: 'BOOLEAN',
      value: true,
      defaultValue: true,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_106',
      key: 'PAYMENT_DEFAULT_GATEWAY',
      category: 'PAYMENTS',
      name: 'Primary Merchant Gateway',
      description: 'Active payment service provider for customer settlements',
      scope: 'GLOBAL',
      valueType: 'STRING',
      value: 'TAP_PAYMENTS',
      defaultValue: 'TAP_PAYMENTS',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_107',
      key: 'AI_PRIMARY_MODEL',
      category: 'AI_PROVIDERS',
      name: 'Google Gemini Model Endpoint',
      description: 'Model identifier for automated logistics intelligence',
      scope: 'GLOBAL',
      valueType: 'STRING',
      value: 'gemini-2.5-flash',
      defaultValue: 'gemini-2.5-flash',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
    {
      id: 'cfg_108',
      key: 'MAINTENANCE_MODE_ACTIVE',
      category: 'MAINTENANCE',
      name: 'System Maintenance Lockout',
      description: 'Restrict access to super-admins during infrastructure upgrades',
      scope: 'GLOBAL',
      valueType: 'BOOLEAN',
      value: false,
      defaultValue: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      version: 1,
    },
  ];

  private static featureFlagsCatalog: FeatureFlag[] = [
    {
      id: 'ff_101',
      key: 'FEATURE_AI_CUSTOMS_AUTOCLEAR',
      name: 'AI Automated Customs Pre-Clearance',
      description: 'Extract HS codes from commercial invoices via Gemini Flash Vision',
      enabled: true,
      scope: 'GLOBAL',
      percentageRollout: 100,
      environmentRollout: ['development', 'staging', 'production'],
      killSwitch: false,
      module: 'CUSTOMS',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      id: 'ff_102',
      key: 'FEATURE_ZATCA_PHASE2_LIVE',
      name: 'ZATCA Phase 2 E-Invoicing Realtime Sync',
      description: 'Direct Cryptographic B2B E-Invoice XML submission to Saudi Tax Authority',
      enabled: true,
      scope: 'GLOBAL',
      percentageRollout: 100,
      environmentRollout: ['development', 'staging', 'production'],
      killSwitch: false,
      module: 'FINANCE',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      id: 'ff_103',
      key: 'FEATURE_BIOMETRIC_AUTH',
      name: 'WebAuthn Passkey & Biometric Login',
      description: 'Enable FIDO2 TouchID/FaceID authentication for warehouse mobile apps',
      enabled: true,
      scope: 'GLOBAL',
      percentageRollout: 50,
      environmentRollout: ['development', 'staging', 'production'],
      killSwitch: false,
      module: 'SECURITY',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      id: 'ff_104',
      key: 'FEATURE_ECO_ROUTE_OPTIMIZER',
      name: 'Green Fleet Eco Routing',
      description: 'Calculate carbon footprint reduction & optimal fuel routes for GCC cross-border trucks',
      enabled: true,
      scope: 'GLOBAL',
      dependencies: ['FEATURE_AI_CUSTOMS_AUTOCLEAR'],
      percentageRollout: 100,
      environmentRollout: ['development', 'staging', 'production'],
      killSwitch: false,
      module: 'FLEET',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
  ];

  private static moduleConfigs: ModuleConfig[] = [
    {
      moduleKey: 'SHIPPING',
      moduleName: 'Global Shipping & Freight Management',
      status: 'PRODUCTION',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      moduleKey: 'CUSTOMS',
      moduleName: 'Customs Clearance & ZATCA Integration',
      status: 'PRODUCTION',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      moduleKey: 'FINANCE',
      moduleName: 'Finance, Invoicing & Settlement',
      status: 'PRODUCTION',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      moduleKey: 'FLEET',
      moduleName: 'Fleet & Vehicle Telematics',
      status: 'BETA',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      moduleKey: 'WORKFLOW',
      moduleName: 'Enterprise Workflow Engine',
      status: 'PRODUCTION',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
    {
      moduleKey: 'AI',
      moduleName: 'Gemini Logistics Intelligence Assistant',
      status: 'PRODUCTION',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
  ];

  private static userPreferencesMap: Map<string, UserPreferences> = new Map([
    [
      'usr_admin_01',
      {
        userId: 'usr_admin_01',
        language: 'ar',
        theme: 'dark',
        timezone: 'Asia/Riyadh',
        dashboardLayout: 'standard',
        sidebarState: 'expanded',
        notificationChannels: { email: true, sms: true, whatsapp: true, push: true },
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        currency: 'SAR',
        measurementUnits: 'metric',
        accessibility: { highContrast: false, fontScale: 'normal' },
      },
    ],
  ]);

  /**
   * Get hierarchy-resolved setting value
   */
  public static getSetting(key: string, context?: EvaluationContext): SystemSettingItem | null {
    return ConfigEngine.resolveSettingValue(key, this.settingsCatalog, context);
  }

  /**
   * Update or create a system setting
   */
  public static async updateSetting(
    key: string,
    value: any,
    scope: ConfigScope = 'GLOBAL',
    scopeId?: string,
    updatedBy: string = 'admin'
  ): Promise<SystemSettingItem> {
    const existingIndex = this.settingsCatalog.findIndex(
      (s) => s.key === key && s.scope === scope && s.scopeId === scopeId
    );

    let updatedRecord: SystemSettingItem;
    const previousState = existingIndex >= 0 ? { ...this.settingsCatalog[existingIndex] } : null;

    if (existingIndex >= 0) {
      updatedRecord = {
        ...this.settingsCatalog[existingIndex],
        value,
        version: this.settingsCatalog[existingIndex].version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy,
      };
      this.settingsCatalog[existingIndex] = updatedRecord;
    } else {
      updatedRecord = {
        id: `cfg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        key,
        category: 'SECURITY',
        name: key,
        description: `Custom setting ${key}`,
        scope,
        scopeId,
        valueType: typeof value === 'number' ? 'NUMBER' : typeof value === 'boolean' ? 'BOOLEAN' : 'STRING',
        value,
        defaultValue: value,
        updatedAt: new Date().toISOString(),
        updatedBy,
        version: 1,
      };
      this.settingsCatalog.unshift(updatedRecord);
    }

    // Record immutable audit entry
    AuditService.logAudit({
      actorId: updatedBy,
      action: 'CONFIG_CHANGE',
      severity: 'HIGH',
      module: 'CONFIGURATION',
      entityType: 'SystemSetting',
      entityId: key,
      description: `Updated configuration setting '${key}' (${scope}) to '${JSON.stringify(value)}'`,
      previousState,
      newState: updatedRecord,
    }).catch(() => {});

    // Publish event
    EventBusService.publish({
      name: 'ConfigurationUpdated',
      aggregateId: key,
      aggregateType: 'SystemSetting',
      module: 'CONFIGURATION',
      payload: { key, scope, scopeId, value },
    }).catch(() => {});

    // Persist to Firestore async
    this.persistToFirestore('system_settings', updatedRecord);

    return updatedRecord;
  }

  /**
   * Check if a feature flag is enabled for an evaluation context
   */
  public static isFeatureEnabled(flagKey: string, context?: EvaluationContext): boolean {
    const flag = this.featureFlagsCatalog.find((f) => f.key === flagKey);
    if (!flag) return false;

    const evaluation = FeatureFlagEngine.isFlagEnabled(flag, this.featureFlagsCatalog, context);
    return evaluation.enabled;
  }

  /**
   * Update feature flag definition or state
   */
  public static async updateFeatureFlag(
    flagKey: string,
    updates: Partial<FeatureFlag>,
    updatedBy: string = 'admin'
  ): Promise<FeatureFlag> {
    const flagIndex = this.featureFlagsCatalog.findIndex((f) => f.key === flagKey);

    if (flagIndex < 0) {
      throw new Error(`Feature flag '${flagKey}' not found.`);
    }

    const previousState = { ...this.featureFlagsCatalog[flagIndex] };
    const updatedFlag: FeatureFlag = {
      ...this.featureFlagsCatalog[flagIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    this.featureFlagsCatalog[flagIndex] = updatedFlag;

    AuditService.logAudit({
      actorId: updatedBy,
      action: 'CONFIG_CHANGE',
      severity: updatedFlag.killSwitch ? 'CRITICAL' : 'HIGH',
      module: 'FEATURE_FLAGS',
      entityType: 'FeatureFlag',
      entityId: flagKey,
      description: `Updated feature flag '${flagKey}' (enabled: ${updatedFlag.enabled}, killSwitch: ${updatedFlag.killSwitch})`,
      previousState,
      newState: updatedFlag,
    }).catch(() => {});

    EventBusService.publish({
      name: 'FeatureFlagToggled',
      aggregateId: flagKey,
      aggregateType: 'FeatureFlag',
      module: 'CONFIGURATION',
      payload: updatedFlag,
    }).catch(() => {});

    this.persistToFirestore('feature_flags', updatedFlag);

    return updatedFlag;
  }

  /**
   * Get user preferences
   */
  public static getUserPreferences(userId: string): UserPreferences {
    if (this.userPreferencesMap.has(userId)) {
      return this.userPreferencesMap.get(userId)!;
    }

    const defaultPrefs: UserPreferences = {
      userId,
      language: 'ar',
      theme: 'dark',
      timezone: 'Asia/Riyadh',
      dashboardLayout: 'standard',
      sidebarState: 'expanded',
      notificationChannels: { email: true, sms: true, whatsapp: true, push: true },
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'SAR',
      measurementUnits: 'metric',
      accessibility: { highContrast: false, fontScale: 'normal' },
    };

    this.userPreferencesMap.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  /**
   * Update user preferences
   */
  public static updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getUserPreferences(userId);
    const updated: UserPreferences = {
      ...current,
      ...prefs,
    };

    this.userPreferencesMap.set(userId, updated);
    this.persistToFirestore('user_preferences', updated);
    return updated;
  }

  /**
   * Module Config Management
   */
  public static getModuleConfigs(): ModuleConfig[] {
    return [...this.moduleConfigs];
  }

  public static updateModuleConfig(moduleKey: string, status: ModuleConfigStatus, updatedBy: string): ModuleConfig {
    const idx = this.moduleConfigs.findIndex((m) => m.moduleKey === moduleKey);
    if (idx < 0) {
      throw new Error(`Module '${moduleKey}' not found.`);
    }

    const prev = { ...this.moduleConfigs[idx] };
    const updated: ModuleConfig = {
      ...this.moduleConfigs[idx],
      status,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    this.moduleConfigs[idx] = updated;

    AuditService.logAudit({
      actorId: updatedBy,
      action: 'CONFIG_CHANGE',
      severity: 'HIGH',
      module: 'MODULE_MANAGEMENT',
      entityType: 'ModuleConfig',
      entityId: moduleKey,
      description: `Transitioned module '${moduleKey}' operational status to '${status}'`,
      previousState: prev,
      newState: updated,
    }).catch(() => {});

    return updated;
  }

  /**
   * Run System Validation Engine across settings and feature flags
   */
  public static validateConfigurations(): ConfigValidationIssue[] {
    const issues: ConfigValidationIssue[] = [];

    // 1. Settings Schema Validation
    for (const setting of this.settingsCatalog) {
      const issue = ConfigEngine.validateSettingValue(setting);
      if (issue) issues.push(issue);
    }

    // 2. Feature Flag Circular Dependency & Prerequisites
    const circularIssues = FeatureFlagEngine.detectCircularDependencies(this.featureFlagsCatalog);
    issues.push(...circularIssues);

    return issues;
  }

  public static getAllSettings(): SystemSettingItem[] {
    return [...this.settingsCatalog];
  }

  public static getAllFeatureFlags(): FeatureFlag[] {
    return [...this.featureFlagsCatalog];
  }

  private static async persistToFirestore(collectionName: string, data: any): Promise<void> {
    try {
      if (data.id || data.key || data.userId || data.moduleKey) {
        const docId = data.id || data.key || data.userId || data.moduleKey;
        await getAdminFirestore().collection(collectionName).doc(docId).set({
          ...data,
          persistedAt: new Date().toISOString(),
        });
      } else {
        await getAdminFirestore().collection(collectionName).add({
          ...data,
          persistedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Quiet catch for restricted rule execution or local sandbox
    }
  }
}
