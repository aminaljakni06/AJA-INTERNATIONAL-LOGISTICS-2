import { getAdminFirestore } from '../../server/firebaseAdmin';
import { db as localDb } from '../database';
import { 
  IdentityProfile, 
  UserSessionRecord, 
  RegisteredDeviceRecord, 
  PasswordPolicy, 
  LoginPolicy, 
  MFAConfiguration, 
  AccountStatus,
  IdentityType 
} from '../../types/identity';
import { UserRole } from '../../types/user';
import { User } from '../../types/user';

const IDENTITY_PROFILES_COLLECTION = 'identity_profiles';
const USER_SESSIONS_COLLECTION = 'user_sessions';
const REGISTERED_DEVICES_COLLECTION = 'registered_devices';
const MFA_CONFIGS_COLLECTION = 'mfa_configs';
const IDENTITY_POLICIES_COLLECTION = 'identity_policies';

// In-memory fallback stores for high performance & offline operation
const memoryProfiles = new Map<string, IdentityProfile>();
const memorySessions = new Map<string, UserSessionRecord>();
const memoryDevices = new Map<string, RegisteredDeviceRecord>();
const memoryMFA = new Map<string, MFAConfiguration>();

function useLocalIdentityStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function ensureLocalIdentityStore() {
  const data = localDb.getRaw();
  data.identity_profiles ||= [];
  data.user_sessions ||= [];
  data.registered_devices ||= [];
  data.mfa_configs ||= [];
  data.identity_policies ||= {};
  return data;
}

function getLocalProfile(userId: string): IdentityProfile | null {
  const data = ensureLocalIdentityStore();
  return data.identity_profiles!.find((item) => item.userId === userId) || null;
}

function upsertLocalProfile(profile: IdentityProfile): void {
  const data = ensureLocalIdentityStore();
  const index = data.identity_profiles!.findIndex((item) => item.userId === profile.userId);
  if (index === -1) {
    data.identity_profiles!.push(profile);
  } else {
    data.identity_profiles![index] = profile;
  }
  localDb.save();
}

function deriveIdentityType(role: UserRole): IdentityType {
  if (['ADMIN', 'ERP_ADMIN', 'SYSTEM_ADMIN', 'PLATFORM_ADMIN', 'STAFF'].includes(role)) return 'EMPLOYEE';
  if (role === 'DRIVER') return 'DRIVER';
  return 'CUSTOMER';
}

function buildProfileFromLocalUser(user: User): IdentityProfile {
  const now = new Date().toISOString();
  const role = user.role as UserRole;
  return {
    identityId: `id_${user.id}`,
    userId: user.id,
    username: user.email.split('@')[0],
    primaryEmail: user.email,
    primaryPhone: user.phone || '',
    preferredLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    employeeId: role === 'CUSTOMER' ? undefined : `EMP-${user.id.slice(0, 6)}`,
    customerId: role === 'CUSTOMER' ? user.id : undefined,
    companyId: user.companyId || undefined,
    companyName: user.companyName || undefined,
    branchId: user.branchId || undefined,
    departmentId: user.departmentId || undefined,
    identityType: deriveIdentityType(role),
    accountStatus: 'ACTIVE',
    role,
    employmentStatus: 'Active',
    securityLevel: user.securityLevel || (['ADMIN', 'SYSTEM_ADMIN', 'PLATFORM_ADMIN'].includes(role) ? 5 : 1),
    passwordUpdatedDate: now,
    mfaEnabled: false,
    riskScore: 0,
    emergencyContacts: [],
    preferences: { theme: 'light', language: 'ar', timezone: 'Asia/Riyadh' },
    notificationSettings: { email: true, sms: true, push: true },
    accessibilitySettings: { highContrast: false },
    metadata: {},
    createdAt: user.createdAt || now,
    updatedAt: user.updatedAt || now,
  };
}

function bootstrapLocalProfilesFromUsers(): IdentityProfile[] {
  const data = ensureLocalIdentityStore();
  for (const user of data.users) {
    if (!data.identity_profiles!.some((profile) => profile.userId === user.id)) {
      const profile = buildProfileFromLocalUser(user);
      data.identity_profiles!.push(profile);
      memoryProfiles.set(profile.userId, profile);
    }
  }
  localDb.save();
  return data.identity_profiles!;
}

const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  expiryDays: 90,
  preventReuseCount: 5,
  maxFailedAttempts: 5,
  lockDurationMinutes: 30,
  allowTemporaryPasswords: true,
};

const defaultLoginPolicy: LoginPolicy = {
  allowedDevices: [],
  allowedCountries: ['SA', 'AE', 'KW', 'BH', 'OM', 'QA', 'EG', 'JO'],
  allowedBranches: [],
  allowedHours: [],
  maxConcurrentSessions: 5,
  riskScoreThreshold: 75,
};

// --- IDENTITY PROFILE REPOSITORY ---

export async function getIdentityByUserId(userId: string): Promise<IdentityProfile | null> {
  if (!userId) return null;

  if (useLocalIdentityStore()) {
    const localProfile = getLocalProfile(userId);
    if (localProfile) {
      memoryProfiles.set(userId, localProfile);
      return localProfile;
    }
    return memoryProfiles.get(userId) || null;
  }

  try {
    const snap = await getAdminFirestore().collection(IDENTITY_PROFILES_COLLECTION).doc(userId).get();
    if (snap.exists) {
      const data = snap.data() as IdentityProfile;
      memoryProfiles.set(userId, data);
      return data;
    }
  } catch (err) {
    console.warn('[IdentityRepository] Firestore fetch failed, using memory store:', err);
  }

  return memoryProfiles.get(userId) || null;
}

export async function createOrUpdateIdentityProfile(
  userId: string,
  profileData: Partial<IdentityProfile>
): Promise<IdentityProfile> {
  const existing = await getIdentityByUserId(userId);
  const now = new Date().toISOString();

  const identityId = profileData.identityId || existing?.identityId || `id_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const updated: IdentityProfile = {
    identityId,
    userId,
    username: profileData.username || existing?.username || profileData.primaryEmail || existing?.primaryEmail || `user_${userId}`,
    primaryEmail: profileData.primaryEmail || existing?.primaryEmail || '',
    secondaryEmail: profileData.secondaryEmail !== undefined ? profileData.secondaryEmail : existing?.secondaryEmail,
    primaryPhone: profileData.primaryPhone || existing?.primaryPhone || '',
    profilePhoto: profileData.profilePhoto !== undefined ? profileData.profilePhoto : existing?.profilePhoto,
    preferredLanguage: profileData.preferredLanguage || existing?.preferredLanguage || 'ar',
    timezone: profileData.timezone || existing?.timezone || 'Asia/Riyadh',
    
    employeeId: profileData.employeeId !== undefined ? profileData.employeeId : existing?.employeeId || `EMP-${userId.substr(0, 6)}`,
    customerId: profileData.customerId !== undefined ? profileData.customerId : existing?.customerId,
    partnerId: profileData.partnerId !== undefined ? profileData.partnerId : existing?.partnerId,
    agentId: profileData.agentId !== undefined ? profileData.agentId : existing?.agentId,
    
    companyId: profileData.companyId !== undefined ? profileData.companyId : existing?.companyId,
    companyName: profileData.companyName !== undefined ? profileData.companyName : existing?.companyName,
    branchId: profileData.branchId !== undefined ? profileData.branchId : existing?.branchId,
    branchName: profileData.branchName !== undefined ? profileData.branchName : existing?.branchName,
    departmentId: profileData.departmentId !== undefined ? profileData.departmentId : existing?.departmentId,
    departmentName: profileData.departmentName !== undefined ? profileData.departmentName : existing?.departmentName,
    managerId: profileData.managerId !== undefined ? profileData.managerId : existing?.managerId,
    managerName: profileData.managerName !== undefined ? profileData.managerName : existing?.managerName,
    
    identityType: (profileData.identityType || existing?.identityType || 'CUSTOMER') as IdentityType,
    accountStatus: (profileData.accountStatus || existing?.accountStatus || 'ACTIVE') as AccountStatus,
    role: (profileData.role || existing?.role || 'CUSTOMER') as UserRole,
    employmentStatus: profileData.employmentStatus !== undefined ? profileData.employmentStatus : existing?.employmentStatus || 'Active',
    securityLevel: profileData.securityLevel !== undefined ? profileData.securityLevel : existing?.securityLevel || 1,
    
    lastLogin: profileData.lastLogin || existing?.lastLogin,
    passwordUpdatedDate: profileData.passwordUpdatedDate || existing?.passwordUpdatedDate || now,
    mfaEnabled: profileData.mfaEnabled !== undefined ? profileData.mfaEnabled : existing?.mfaEnabled || false,
    mfaType: profileData.mfaType !== undefined ? profileData.mfaType : existing?.mfaType,
    riskScore: profileData.riskScore !== undefined ? profileData.riskScore : existing?.riskScore || 0,
    
    emergencyContacts: profileData.emergencyContacts || existing?.emergencyContacts || [],
    preferences: profileData.preferences || existing?.preferences || { theme: 'light', language: 'ar', timezone: 'Asia/Riyadh' },
    notificationSettings: profileData.notificationSettings || existing?.notificationSettings || { email: true, sms: true, push: true },
    accessibilitySettings: profileData.accessibilitySettings || existing?.accessibilitySettings || { highContrast: false },
    metadata: profileData.metadata || existing?.metadata || {},
    
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  memoryProfiles.set(userId, updated);

  if (useLocalIdentityStore()) {
    upsertLocalProfile(updated);
    return updated;
  }

  try {
    await getAdminFirestore().collection(IDENTITY_PROFILES_COLLECTION).doc(userId).set(updated, { merge: true });
  } catch (err) {
    console.warn('[IdentityRepository] Firestore setDoc failed:', err);
  }

  return updated;
}

export async function listAllIdentities(): Promise<IdentityProfile[]> {
  if (useLocalIdentityStore()) {
    const list = bootstrapLocalProfilesFromUsers();
    list.forEach((item) => memoryProfiles.set(item.userId, item));
    return list;
  }

  try {
    const snap = await getAdminFirestore().collection(IDENTITY_PROFILES_COLLECTION).get();
    if (!snap.empty) {
      const list = snap.docs.map(d => d.data() as IdentityProfile);
      list.forEach(item => memoryProfiles.set(item.userId, item));
      return list;
    }
  } catch (err) {
    console.warn('[IdentityRepository] Firestore list failed:', err);
  }

  return Array.from(memoryProfiles.values());
}

// --- USER SESSIONS REPOSITORY ---

export async function createSessionRecord(session: UserSessionRecord): Promise<UserSessionRecord> {
  memorySessions.set(session.sessionId, session);

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    const index = data.user_sessions!.findIndex((item) => item.sessionId === session.sessionId);
    if (index === -1) data.user_sessions!.push(session);
    else data.user_sessions![index] = session;
    localDb.save();
    return session;
  }

  try {
    await getAdminFirestore().collection(USER_SESSIONS_COLLECTION).doc(session.sessionId).set(session);
  } catch (err) {
    console.warn('[IdentityRepository] Session save failed:', err);
  }

  return session;
}

export async function getUserActiveSessions(userId: string): Promise<UserSessionRecord[]> {
  const sessions: UserSessionRecord[] = [];

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    return data.user_sessions!.filter((s) => s.userId === userId && s.status === 'ACTIVE');
  }

  try {
    const snap = await getAdminFirestore()
      .collection(USER_SESSIONS_COLLECTION)
      .where('userId', '==', userId)
      .where('status', '==', 'ACTIVE')
      .get();
    if (!snap.empty) {
      snap.docs.forEach(d => {
        const item = d.data() as UserSessionRecord;
        memorySessions.set(item.sessionId, item);
        sessions.push(item);
      });
      return sessions;
    }
  } catch (err) {
    console.warn('[IdentityRepository] Firestore sessions fetch failed:', err);
  }

  return Array.from(memorySessions.values()).filter(
    s => s.userId === userId && s.status === 'ACTIVE'
  );
}

export async function updateSessionStatus(sessionId: string, status: 'EXPIRED' | 'REVOKED'): Promise<void> {
  const existing = memorySessions.get(sessionId);
  if (existing) {
    existing.status = status;
    memorySessions.set(sessionId, existing);
  }

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    const index = data.user_sessions!.findIndex((item) => item.sessionId === sessionId);
    if (index !== -1) {
      data.user_sessions![index] = { ...data.user_sessions![index], status };
      localDb.save();
    }
    return;
  }

  try {
    await getAdminFirestore().collection(USER_SESSIONS_COLLECTION).doc(sessionId).update({ status });
  } catch (err) {
    console.warn('[IdentityRepository] Update session failed:', err);
  }
}

export async function revokeAllSessionsExcept(userId: string, activeSessionId: string): Promise<number> {
  const sessions = await getUserActiveSessions(userId);
  let count = 0;

  for (const session of sessions) {
    if (session.sessionId !== activeSessionId) {
      await updateSessionStatus(session.sessionId, 'REVOKED');
      count++;
    }
  }

  return count;
}

// --- REGISTERED DEVICES REPOSITORY ---

export async function registerOrUpdateDevice(device: RegisteredDeviceRecord): Promise<RegisteredDeviceRecord> {
  memoryDevices.set(device.deviceId, device);

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    const index = data.registered_devices!.findIndex((item) => item.deviceId === device.deviceId);
    if (index === -1) data.registered_devices!.push(device);
    else data.registered_devices![index] = device;
    localDb.save();
    return device;
  }

  try {
    await getAdminFirestore().collection(REGISTERED_DEVICES_COLLECTION).doc(device.deviceId).set(device, { merge: true });
  } catch (err) {
    console.warn('[IdentityRepository] Device save failed:', err);
  }

  return device;
}

export async function getUserDevices(userId: string): Promise<RegisteredDeviceRecord[]> {
  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    return data.registered_devices!.filter((device) => device.userId === userId);
  }

  try {
    const snap = await getAdminFirestore()
      .collection(REGISTERED_DEVICES_COLLECTION)
      .where('userId', '==', userId)
      .get();
    if (!snap.empty) {
      const list = snap.docs.map(d => d.data() as RegisteredDeviceRecord);
      list.forEach(d => memoryDevices.set(d.deviceId, d));
      return list;
    }
  } catch (err) {
    console.warn('[IdentityRepository] Devices fetch failed:', err);
  }

  return Array.from(memoryDevices.values()).filter(d => d.userId === userId);
}

export async function updateDeviceTrustStatus(
  deviceId: string,
  trustStatus: 'TRUSTED' | 'UNTRUSTED' | 'REVOKED'
): Promise<void> {
  const existing = memoryDevices.get(deviceId);
  const now = new Date().toISOString();
  if (existing) {
    existing.trustStatus = trustStatus;
    existing.updatedAt = now;
    memoryDevices.set(deviceId, existing);
  }

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    const index = data.registered_devices!.findIndex((item) => item.deviceId === deviceId);
    if (index !== -1) {
      data.registered_devices![index] = { ...data.registered_devices![index], trustStatus, updatedAt: now };
      localDb.save();
    }
    return;
  }

  try {
    await getAdminFirestore().collection(REGISTERED_DEVICES_COLLECTION).doc(deviceId).update({ trustStatus, updatedAt: now });
  } catch (err) {
    console.warn('[IdentityRepository] Update device status failed:', err);
  }
}

// --- MFA CONFIGURATION REPOSITORY ---

export async function getMFAConfig(userId: string): Promise<MFAConfiguration> {
  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    const localConfig = data.mfa_configs!.find((item) => item.userId === userId);
    if (localConfig) {
      memoryMFA.set(userId, localConfig);
      return localConfig;
    }
  }

  try {
    const snap = await getAdminFirestore().collection(MFA_CONFIGS_COLLECTION).doc(userId).get();
    if (snap.exists) {
      const data = snap.data() as MFAConfiguration;
      memoryMFA.set(userId, data);
      return data;
    }
  } catch (err) {
    console.warn('[IdentityRepository] MFA config fetch failed:', err);
  }

  const existing = memoryMFA.get(userId);
  if (existing) return existing;

  const initial: MFAConfiguration = {
    userId,
    mfaEnabled: false,
    method: 'TOTP',
    backupCodes: [],
    phoneVerified: false,
    emailVerified: true,
    updatedAt: new Date().toISOString(),
  };

  memoryMFA.set(userId, initial);
  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    data.mfa_configs!.push(initial);
    localDb.save();
  }
  return initial;
}

export async function saveMFAConfig(config: MFAConfiguration): Promise<MFAConfiguration> {
  memoryMFA.set(config.userId, config);

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    const index = data.mfa_configs!.findIndex((item) => item.userId === config.userId);
    if (index === -1) data.mfa_configs!.push(config);
    else data.mfa_configs![index] = config;
    localDb.save();
    return config;
  }

  try {
    await getAdminFirestore().collection(MFA_CONFIGS_COLLECTION).doc(config.userId).set(config, { merge: true });
  } catch (err) {
    console.warn('[IdentityRepository] Save MFA config failed:', err);
  }

  return config;
}

// --- POLICIES REPOSITORY ---

export async function getPasswordPolicy(): Promise<PasswordPolicy> {
  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    return data.identity_policies!.password_policy || defaultPasswordPolicy;
  }

  try {
    const snap = await getAdminFirestore().collection(IDENTITY_POLICIES_COLLECTION).doc('password_policy').get();
    if (snap.exists) {
      return snap.data() as PasswordPolicy;
    }
  } catch (err) {
    console.warn('[IdentityRepository] Password policy fetch failed:', err);
  }

  return defaultPasswordPolicy;
}

export async function updatePasswordPolicy(policy: Partial<PasswordPolicy>): Promise<PasswordPolicy> {
  const current = await getPasswordPolicy();
  const updated = { ...current, ...policy };

  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    data.identity_policies!.password_policy = updated;
    localDb.save();
    return updated;
  }

  try {
    await getAdminFirestore().collection(IDENTITY_POLICIES_COLLECTION).doc('password_policy').set(updated, { merge: true });
  } catch (err) {
    console.warn('[IdentityRepository] Password policy save failed:', err);
  }

  return updated;
}

export async function getLoginPolicy(): Promise<LoginPolicy> {
  if (useLocalIdentityStore()) {
    const data = ensureLocalIdentityStore();
    return data.identity_policies!.login_policy || defaultLoginPolicy;
  }

  try {
    const snap = await getAdminFirestore().collection(IDENTITY_POLICIES_COLLECTION).doc('login_policy').get();
    if (snap.exists) {
      return snap.data() as LoginPolicy;
    }
  } catch (err) {
    console.warn('[IdentityRepository] Login policy fetch failed:', err);
  }

  return defaultLoginPolicy;
}
