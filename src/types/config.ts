export type ConfigScope = 'GLOBAL' | 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'TEAM' | 'USER';

export type ConfigValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY' | 'SECRET';

export type SettingCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'LOCALIZATION'
  | 'BUSINESS_HOURS'
  | 'HOLIDAYS'
  | 'NOTIFICATIONS'
  | 'PAYMENTS'
  | 'AI_PROVIDERS'
  | 'STORAGE'
  | 'SECURITY'
  | 'WORKFLOW'
  | 'AUDIT'
  | 'SHIPPING'
  | 'CUSTOMS'
  | 'WAREHOUSE'
  | 'FLEET'
  | 'FINANCE'
  | 'HR'
  | 'CRM'
  | 'MAINTENANCE';

export interface SystemSettingItem {
  id: string;
  key: string;
  category: SettingCategory;
  name: string;
  description: string;
  scope: ConfigScope;
  scopeId?: string; // e.g. companyId, branchId, departmentId
  valueType: ConfigValueType;
  value: any;
  defaultValue: any;
  isEncrypted?: boolean;
  isReadOnly?: boolean;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface FeatureFlag {
  id: string;
  key: string; // e.g. 'FEATURE_AI_CUSTOMS_AUTOCLEAR', 'FEATURE_ZATCA_PHASE2_LIVE'
  name: string;
  description: string;
  enabled: boolean;
  scope: ConfigScope;
  scopeId?: string;
  percentageRollout?: number; // 0 to 100
  environmentRollout?: ('development' | 'staging' | 'production')[];
  scheduledActivation?: string; // ISO timestamp
  scheduledExpiration?: string; // ISO timestamp
  killSwitch: boolean;
  dependencies?: string[]; // Required active flag keys
  prerequisites?: string[]; // Required module settings
  module: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UserPreferences {
  userId: string;
  language: 'ar' | 'en';
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  dashboardLayout: 'standard' | 'compact' | 'analytics';
  sidebarState: 'expanded' | 'collapsed';
  notificationChannels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: 'SAR' | 'AED' | 'USD' | 'EUR';
  measurementUnits: 'metric' | 'imperial';
  accessibility: {
    highContrast: boolean;
    fontScale: 'normal' | 'large' | 'xlarge';
  };
}

export type ModuleConfigStatus =
  | 'PRODUCTION'
  | 'BETA'
  | 'EXPERIMENTAL'
  | 'MAINTENANCE'
  | 'READ_ONLY'
  | 'DISABLED';

export interface ModuleConfig {
  moduleKey: string; // e.g., 'SHIPPING', 'CUSTOMS', 'FINANCE', 'HR', 'CRM', 'AI', 'WORKFLOW'
  moduleName: string;
  status: ModuleConfigStatus;
  minRequiredRole?: string;
  maintenanceMessage?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ConfigValidationIssue {
  key: string;
  type: 'MISSING' | 'INVALID_TYPE' | 'CONFLICT' | 'CIRCULAR_DEPENDENCY' | 'PREREQUISITE_FAILED';
  severity: 'WARNING' | 'ERROR';
  message: string;
}

export interface EvaluationContext {
  userId?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  teamId?: string;
  userRole?: string;
  environment?: 'development' | 'staging' | 'production';
}
