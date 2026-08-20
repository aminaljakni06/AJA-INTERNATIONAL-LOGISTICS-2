import { 
  IdentityProfile, 
  PasswordPolicy, 
  LoginPolicy, 
  UserSessionRecord, 
  RegisteredDeviceRecord, 
  MFAConfiguration, 
  AccountStatus, 
  MFAMethod, 
  DeviceTrustStatus 
} from '../types/identity';
import { identityEngine } from '../lib/identity/identityEngine';
import { 
  listAllIdentities, 
  getUserActiveSessions, 
  getUserDevices, 
  getMFAConfig, 
  getPasswordPolicy, 
  updatePasswordPolicy, 
  getLoginPolicy 
} from '../db/repositories/identityRepository';

export class IdentityService {

  public static async getProfile(userId: string): Promise<IdentityProfile | null> {
    return identityEngine.getIdentityProfile(userId);
  }

  public static async updateProfile(
    userId: string, 
    data: Partial<IdentityProfile>, 
    actorUserId?: string
  ): Promise<IdentityProfile> {
    return identityEngine.updateIdentityProfile(userId, data, actorUserId || userId);
  }

  public static async listProfiles(): Promise<IdentityProfile[]> {
    return listAllIdentities();
  }

  public static async setStatus(
    userId: string, 
    newStatus: AccountStatus, 
    reason: string, 
    actorUserId: string
  ): Promise<IdentityProfile> {
    return identityEngine.setAccountStatus(userId, newStatus, reason, actorUserId);
  }

  public static async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    return identityEngine.validatePasswordPolicy(password);
  }

  public static async getSessions(userId: string): Promise<UserSessionRecord[]> {
    return getUserActiveSessions(userId);
  }

  public static async revokeSession(sessionId: string, actorUserId: string): Promise<void> {
    return identityEngine.revokeSession(sessionId, actorUserId);
  }

  public static async revokeOtherSessions(userId: string, activeSessionId: string, actorUserId: string): Promise<number> {
    return identityEngine.revokeAllOtherUserSessions(userId, activeSessionId, actorUserId);
  }

  public static async updateSessionAssurance(
    sessionId: string,
    assurance: Partial<Pick<UserSessionRecord, 'authenticationLevel' | 'mfaVerified' | 'mfaMethod' | 'mfaVerifiedAt' | 'stepUpVerifiedAt' | 'stepUpExpiresAt'>>
  ): Promise<void> {
    return identityEngine.updateSessionAssurance(sessionId, assurance);
  }

  public static async getDevices(userId: string): Promise<RegisteredDeviceRecord[]> {
    return getUserDevices(userId);
  }

  public static async setDeviceTrust(deviceId: string, trustStatus: DeviceTrustStatus, actorUserId: string): Promise<void> {
    return identityEngine.updateDeviceTrust(deviceId, trustStatus, actorUserId);
  }

  public static async getMFA(userId: string): Promise<MFAConfiguration> {
    return getMFAConfig(userId);
  }

  public static async setupMFA(userId: string, method: MFAMethod = 'TOTP'): Promise<MFAConfiguration> {
    return identityEngine.setupMFASecret(userId, method);
  }

  public static async disableMFA(userId: string): Promise<MFAConfiguration> {
    return identityEngine.disableMFA(userId);
  }

  public static async getPasswordPolicy(): Promise<PasswordPolicy> {
    return getPasswordPolicy();
  }

  public static async updatePasswordPolicy(policy: Partial<PasswordPolicy>): Promise<PasswordPolicy> {
    return updatePasswordPolicy(policy);
  }

  public static async getLoginPolicy(): Promise<LoginPolicy> {
    return getLoginPolicy();
  }
}
