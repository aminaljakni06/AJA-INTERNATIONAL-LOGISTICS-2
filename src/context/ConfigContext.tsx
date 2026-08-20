import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { useAuth } from './AuthContext';

interface ConfigContextType {
  systemSettings: SystemSettingItem[];
  featureFlags: FeatureFlag[];
  moduleConfigs: ModuleConfig[];
  userPreferences: UserPreferences;
  validationIssues: ConfigValidationIssue[];
  getSetting: (key: string, context?: EvaluationContext) => SystemSettingItem | null;
  updateSetting: (key: string, value: any, scope?: ConfigScope, scopeId?: string) => Promise<SystemSettingItem>;
  isFeatureEnabled: (flagKey: string, context?: EvaluationContext) => boolean;
  updateFeatureFlag: (flagKey: string, updates: Partial<FeatureFlag>) => Promise<FeatureFlag>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => UserPreferences;
  updateModuleConfig: (moduleKey: string, status: ModuleConfigStatus) => ModuleConfig;
  refreshConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  userId: 'anonymous',
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

async function fetchConfigResource<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || payload?.messageEn || 'Failed to fetch configuration data');
  }

  return (payload?.data ?? payload) as T;
}

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [systemSettings, setSystemSettings] = useState<SystemSettingItem[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [moduleConfigs, setModuleConfigs] = useState<ModuleConfig[]>([]);
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [validationIssues, setValidationIssues] = useState<ConfigValidationIssue[]>([]);

  const refreshConfig = useCallback(() => {
    if (!token) {
      setSystemSettings([]);
      setFeatureFlags([]);
      setModuleConfigs([]);
      setUserPreferencesState(DEFAULT_USER_PREFERENCES);
      setValidationIssues([]);
      return;
    }

    void Promise.all([
      fetchConfigResource<SystemSettingItem[]>('/api/config/settings', token),
      fetchConfigResource<FeatureFlag[]>('/api/config/feature-flags', token),
      fetchConfigResource<ModuleConfig[]>('/api/config/modules', token),
      fetchConfigResource<UserPreferences>('/api/config/user-preferences', token),
      fetchConfigResource<{ issues: ConfigValidationIssue[] }>('/api/config/validate', token).catch(() => ({ issues: [] })),
    ])
      .then(([settings, flags, modules, prefs, validation]) => {
        setSystemSettings(settings);
        setFeatureFlags(flags);
        setModuleConfigs(modules);
        setUserPreferencesState(prefs);
        setValidationIssues(validation.issues);
      })
      .catch((err) => {
        console.error('[ConfigProvider] Failed to refresh configuration:', err);
      });
  }, [token]);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const getSetting = useCallback((key: string, context?: EvaluationContext): SystemSettingItem | null => {
    const scoped = systemSettings.find((setting) => {
      if (setting.key !== key) return false;
      if (context?.companyId && setting.scope === 'COMPANY') return setting.scopeId === context.companyId;
      if (context?.branchId && setting.scope === 'BRANCH') return setting.scopeId === context.branchId;
      if (context?.departmentId && setting.scope === 'DEPARTMENT') return setting.scopeId === context.departmentId;
      if (context?.userId && setting.scope === 'USER') return setting.scopeId === context.userId;
      return false;
    });

    return scoped || systemSettings.find((setting) => setting.key === key && setting.scope === 'GLOBAL') || null;
  }, [systemSettings]);

  const updateSetting = useCallback(
    async (key: string, value: any, scope: ConfigScope = 'GLOBAL', scopeId?: string): Promise<SystemSettingItem> => {
      if (!token) throw new Error('Authentication token is required to update settings.');
      const res = await fetchConfigResource<SystemSettingItem>('/api/config/settings', token, {
        method: 'POST',
        body: JSON.stringify({ key, value, scope, scopeId }),
      });
      refreshConfig();
      return res;
    },
    [refreshConfig, token]
  );

  const isFeatureEnabled = useCallback((flagKey: string, context?: EvaluationContext): boolean => {
    const flag = featureFlags.find((item) => item.key === flagKey);
    if (!flag || flag.killSwitch || !flag.enabled) return false;
    if (context?.environment && flag.environmentRollout?.length) {
      return flag.environmentRollout.includes(context.environment);
    }
    return true;
  }, [featureFlags]);

  const updateFeatureFlag = useCallback(
    async (flagKey: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> => {
      if (!token) throw new Error('Authentication token is required to update feature flags.');
      const res = await fetchConfigResource<FeatureFlag>(`/api/config/feature-flags/${flagKey}/toggle`, token, {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      refreshConfig();
      return res;
    },
    [refreshConfig, token]
  );

  const updateUserPreferences = useCallback(
    (prefs: Partial<UserPreferences>): UserPreferences => {
      const nextPrefs = { ...userPreferences, ...prefs };
      setUserPreferencesState(nextPrefs);
      if (token) {
        void fetchConfigResource<UserPreferences>('/api/config/user-preferences', token, {
          method: 'PUT',
          body: JSON.stringify(prefs),
        }).then(setUserPreferencesState).catch((err) => {
          console.error('[ConfigProvider] Failed to update user preferences:', err);
        });
      }
      return nextPrefs;
    },
    [token, userPreferences]
  );

  const updateModuleConfig = useCallback(
    (moduleKey: string, status: ModuleConfigStatus): ModuleConfig => {
      const current = moduleConfigs.find((item) => item.moduleKey === moduleKey);
      if (!current) throw new Error(`Module '${moduleKey}' not found.`);
      const nextModule = { ...current, status, updatedAt: new Date().toISOString() };
      setModuleConfigs((items) => items.map((item) => (item.moduleKey === moduleKey ? nextModule : item)));
      if (token) {
        void fetchConfigResource<ModuleConfig>(`/api/config/modules/${moduleKey}`, token, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        }).then((updated) => {
          setModuleConfigs((items) => items.map((item) => (item.moduleKey === moduleKey ? updated : item)));
        }).catch((err) => {
          console.error('[ConfigProvider] Failed to update module config:', err);
        });
      }
      return nextModule;
    },
    [moduleConfigs, token]
  );

  return (
    <ConfigContext.Provider
      value={{
        systemSettings,
        featureFlags,
        moduleConfigs,
        userPreferences,
        validationIssues,
        getSetting,
        updateSetting,
        isFeatureEnabled,
        updateFeatureFlag,
        updateUserPreferences,
        updateModuleConfig,
        refreshConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
}
