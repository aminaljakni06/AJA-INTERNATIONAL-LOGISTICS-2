import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  IdentityProfile, 
  UserSessionRecord, 
  RegisteredDeviceRecord, 
  MFAConfiguration, 
  PasswordPolicy, 
  DeviceTrustStatus,
  SSOProviderConfig,
  LinkedAccount,
  PasskeyCredential
} from '../types/identity';

interface IdentityContextType {
  profile: IdentityProfile | null;
  sessions: UserSessionRecord[];
  devices: RegisteredDeviceRecord[];
  mfaConfig: MFAConfiguration | null;
  passwordPolicy: PasswordPolicy | null;
  ssoProviders: SSOProviderConfig[];
  linkedAccounts: LinkedAccount[];
  passkeys: PasskeyCredential[];
  isLoading: boolean;
  refreshIdentity: () => Promise<void>;
  updateProfile: (data: Partial<IdentityProfile>) => Promise<{ success: boolean; error?: string }>;
  revokeSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  revokeOtherSessions: () => Promise<{ success: boolean; count?: number; error?: string }>;
  setDeviceTrust: (deviceId: string, trustStatus: DeviceTrustStatus) => Promise<{ success: boolean; error?: string }>;
  setupMFA: (method?: string) => Promise<{ success: boolean; mfa?: MFAConfiguration; error?: string }>;
  disableMFA: () => Promise<{ success: boolean; error?: string }>;
  validatePassword: (password: string) => Promise<{ valid: boolean; errors: string[] }>;
  fetchSSOProviders: () => Promise<void>;
  fetchLinkedAccounts: () => Promise<void>;
  fetchPasskeys: () => Promise<void>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  const [devices, setDevices] = useState<RegisteredDeviceRecord[]>([]);
  const [mfaConfig, setMfaConfig] = useState<MFAConfiguration | null>(null);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [ssoProviders, setSsoProviders] = useState<SSOProviderConfig[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSSOProviders = async () => {
    try {
      const res = await fetch('/api/sso/providers');
      if (res.ok) {
        const data = await res.json();
        setSsoProviders(data);
      }
    } catch (err) {
      console.error('[IdentityContext] Error fetching SSO providers:', err);
    }
  };

  const fetchLinkedAccounts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/sso/linked-accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLinkedAccounts(data);
      }
    } catch (err) {
      console.error('[IdentityContext] Error fetching linked accounts:', err);
    }
  };

  const fetchPasskeys = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/sso/passkeys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data);
      }
    } catch (err) {
      console.error('[IdentityContext] Error fetching passkeys:', err);
    }
  };

  const refreshIdentity = async () => {
    if (!token || !user) {
      setProfile(null);
      setSessions([]);
      setDevices([]);
      setMfaConfig(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch profile
      const profRes = await fetch('/api/identity/profile', { headers });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }

      // Fetch sessions
      const sessRes = await fetch('/api/identity/sessions', { headers });
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData);
      }

      // Fetch devices
      const devRes = await fetch('/api/identity/devices', { headers });
      if (devRes.ok) {
        const devData = await devRes.json();
        setDevices(devData);
      }

      // Fetch MFA
      const mfaRes = await fetch('/api/identity/mfa', { headers });
      if (mfaRes.ok) {
        const mfaData = await mfaRes.json();
        setMfaConfig(mfaData);
      }

      // Fetch Password Policy
      const polRes = await fetch('/api/identity/password-policy');
      if (polRes.ok) {
        const polData = await polRes.json();
        setPasswordPolicy(polData);
      }
    } catch (err) {
      console.error('[IdentityContext] Error refreshing identity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshIdentity();
  }, [token, user]);

  const updateProfile = async (data: Partial<IdentityProfile>) => {
    if (!token) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const res = await fetch('/api/identity/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const updated = await res.json();
      if (!res.ok) {
        return { success: false, error: updated.error || 'فشل تحديث البيانات' };
      }

      setProfile(updated);
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!token) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const res = await fetch('/api/identity/sessions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إلغاء الجلسة' };
      }
      await refreshIdentity();
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const revokeOtherSessions = async () => {
    if (!token) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const res = await fetch('/api/identity/sessions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ revokeOthers: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إلغاء الجلسات الأخرى' };
      }
      await refreshIdentity();
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const setDeviceTrust = async (deviceId: string, trustStatus: DeviceTrustStatus) => {
    if (!token) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const res = await fetch('/api/identity/devices/trust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, trustStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تحديث حالة الجهاز' };
      }
      await refreshIdentity();
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const setupMFA = async (method = 'TOTP') => {
    if (!token) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const res = await fetch('/api/identity/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إعداد MFA' };
      }
      setMfaConfig(data.mfa);
      if (profile) setProfile({ ...profile, mfaEnabled: true, mfaType: method as any });
      return { success: true, mfa: data.mfa };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const disableMFA = async () => {
    if (!token) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const res = await fetch('/api/identity/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تعطيل MFA' };
      }
      setMfaConfig(data.mfa);
      if (profile) setProfile({ ...profile, mfaEnabled: false, mfaType: undefined });
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const validatePassword = async (password: string) => {
    try {
      const res = await fetch('/api/identity/validate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { valid: false, errors: ['تعذر فحص كلمة المرور'] };
    }
  };

  return (
    <IdentityContext.Provider
      value={{
        profile,
        sessions,
        devices,
        mfaConfig,
        passwordPolicy,
        ssoProviders,
        linkedAccounts,
        passkeys,
        isLoading,
        refreshIdentity,
        updateProfile,
        revokeSession,
        revokeOtherSessions,
        setDeviceTrust,
        setupMFA,
        disableMFA,
        validatePassword,
        fetchSSOProviders,
        fetchLinkedAccounts,
        fetchPasskeys,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = (): IdentityContextType => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
};
