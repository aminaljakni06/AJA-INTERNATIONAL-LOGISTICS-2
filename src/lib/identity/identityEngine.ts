import { 
  IdentityProfile, 
  PasswordPolicy, 
  LoginPolicy, 
  AccountStatus, 
  IdentityType, 
  UserSessionRecord, 
  RegisteredDeviceRecord, 
  MFAConfiguration, 
  MFAMethod,
  DeviceTrustStatus 
} from '../../types/identity';
import { 
  getIdentityByUserId, 
  createOrUpdateIdentityProfile, 
  listAllIdentities, 
  createSessionRecord, 
  getUserActiveSessions, 
  updateSessionStatus, 
  revokeAllSessionsExcept, 
  registerOrUpdateDevice, 
  getUserDevices, 
  updateDeviceTrustStatus, 
  getMFAConfig, 
  saveMFAConfig, 
  getPasswordPolicy, 
  updatePasswordPolicy, 
  getLoginPolicy 
} from '../../db/repositories/identityRepository';
import { getUserById, updateUser } from '../../db/repositories/userRepository';
import { listUsers } from '../../db/repositories/userRepository';
import { EventBusService } from '../../services/eventBusService';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { isAdminProRole, isPrivilegedAdministrator } from '../../server/middleware/adminProAuthMiddleware';

export class IdentityEngine {

  /**
   * Get or automatically bootstrap rich enterprise identity from existing user document
   */
  public async getIdentityProfile(userId: string): Promise<IdentityProfile | null> {
    let profile = await getIdentityByUserId(userId);
    if (!profile) {
      // Bootstrap from existing user repository if profile doc doesn't exist yet
      const baseUser = await getUserById(userId);
      if (!baseUser) return null;

      let identityType: IdentityType = 'CUSTOMER';
      if (['ADMIN', 'ERP_ADMIN', 'SYSTEM_ADMIN'].includes(baseUser.role as string)) {
        identityType = 'EMPLOYEE';
      } else if (['STAFF', 'DISPATCHER', 'FINANCE_OFFICER', 'DRIVER'].includes(baseUser.role as string)) {
        identityType = (baseUser.role as string) === 'DRIVER' ? 'DRIVER' : 'EMPLOYEE';
      }

      let accountStatus: AccountStatus = 'ACTIVE';
      if (baseUser.status === 'SUSPENDED') accountStatus = 'SUSPENDED';
      if (baseUser.status === 'INACTIVE') accountStatus = 'INACTIVE';

      profile = await createOrUpdateIdentityProfile(userId, {
        userId,
        username: baseUser.email.split('@')[0],
        primaryEmail: baseUser.email,
        primaryPhone: baseUser.phone || '',
        role: baseUser.role,
        identityType,
        accountStatus,
        securityLevel: ['ADMIN', 'SYSTEM_ADMIN'].includes(baseUser.role) ? 5 : 1,
      });
    }

    return profile;
  }

  /**
   * Update Identity Profile & Sync base user if needed
   */
  public async updateIdentityProfile(
    userId: string,
    updates: Partial<IdentityProfile>,
    actorUserId: string
  ): Promise<IdentityProfile> {
    const existing = await this.getIdentityProfile(userId);
    const beforeState = existing ? { ...existing } : null;

    const updated = await createOrUpdateIdentityProfile(userId, updates);

    // Sync base user if email, phone, or displayName changes
    if (updates.primaryEmail || updates.primaryPhone || updates.username) {
      await updateUser(userId, {
        ...(updates.primaryEmail && { email: updates.primaryEmail }),
        ...(updates.primaryPhone && { phone: updates.primaryPhone }),
      });
    }

    // Audit log
    await createAuditLog({
      actorUserId,
      action: 'IDENTITY_PROFILE_UPDATED',
      entityType: 'IDENTITY',
      entityId: userId,
      before: beforeState as any,
      after: updated as any,
    });

    // Publish event
    EventBusService.publish({
      name: 'RoleChanged',
      aggregateId: userId,
      aggregateType: 'USER',
      module: 'HR' as any,
      triggeredBy: { userId: actorUserId },
      payload: { action: 'IDENTITY_PROFILE_UPDATED', userId, updates },
    });

    return updated;
  }

  /**
   * Change Account Lifecycle Status
   */
  public async setAccountStatus(
    userId: string,
    newStatus: AccountStatus,
    reason: string,
    actorUserId: string
  ): Promise<IdentityProfile> {
    const cleanReason = String(reason || '').trim();
    if (!cleanReason) {
      throw new Error('A mandatory reason is required for account lifecycle changes.');
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const privilegedDeactivation = isAdminProRole(targetUser.role) && ['SUSPENDED', 'FROZEN', 'LOCKED', 'DISABLED', 'INACTIVE', 'DELETED'].includes(newStatus);
    if (privilegedDeactivation) {
      await this.assertNotLastPrivilegedAdministrator(userId);
    }

    const current = await this.getIdentityProfile(userId);
    const updated = await createOrUpdateIdentityProfile(userId, { accountStatus: newStatus });

    // Sync user status to legacy status field
    let legacyStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' = 'ACTIVE';
    if (['SUSPENDED', 'FROZEN', 'LOCKED', 'EXPIRED', 'DISABLED'].includes(newStatus)) {
      legacyStatus = 'SUSPENDED';
    } else if (['INACTIVE', 'ARCHIVED', 'DELETED'].includes(newStatus)) {
      legacyStatus = 'INACTIVE';
    }

    await updateUser(userId, { status: legacyStatus });

    let revokedSessions = 0;
    if (['SUSPENDED', 'FROZEN', 'LOCKED', 'DISABLED', 'DELETED'].includes(newStatus)) {
      revokedSessions = await revokeAllSessionsExcept(userId, '');
    }

    await createAuditLog({
      actorUserId,
      action: this.getStatusAuditAction(newStatus),
      entityType: 'IDENTITY',
      entityId: userId,
      before: { status: current?.accountStatus, legacyStatus: targetUser.status },
      after: {
        status: newStatus,
        legacyStatus,
        reason: cleanReason,
        revokedSessions,
        targetUserId: userId,
      },
    });

    return updated;
  }

  private async assertNotLastPrivilegedAdministrator(targetUserId: string): Promise<void> {
    const users = await listUsers();
    const activePrivileged = users.filter((user) => isPrivilegedAdministrator(user));
    const remaining = activePrivileged.filter((user) => user.id !== targetUserId);

    if (activePrivileged.length <= 1 || remaining.length === 0) {
      throw new Error('Last privileged administrator protection blocked this action.');
    }
  }

  private getStatusAuditAction(status: AccountStatus): string {
    const map: Partial<Record<AccountStatus, string>> = {
      ACTIVE: 'ACCOUNT_REACTIVATED',
      SUSPENDED: 'ACCOUNT_SUSPENDED',
      FROZEN: 'ACCOUNT_FROZEN',
      LOCKED: 'ACCOUNT_LOCKED',
      DISABLED: 'ACCOUNT_DISABLED',
      INACTIVE: 'ACCOUNT_INACTIVATED',
      DELETED: 'ACCOUNT_DELETION_MARKED',
    };

    return map[status] || 'IDENTITY_STATUS_CHANGED';
  }

  /**
   * Validate password against configured Password Policy
   */
  public async validatePasswordPolicy(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const policy = await getPasswordPolicy();
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`كلمة المرور يجب أن لا تقل عن ${policy.minLength} أحرف`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل (A-Z)');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل (a-z)');
    }
    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل (0-9)');
    }
    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%...)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Evaluate Login Policy before granting session
   */
  public async evaluateLoginPolicy(
    userId: string,
    reqContext: { ip: string; userAgent: string; country?: string }
  ): Promise<{ allowed: boolean; reason?: string }> {
    const profile = await this.getIdentityProfile(userId);

    if (profile && ['SUSPENDED', 'FROZEN', 'LOCKED', 'DISABLED', 'DELETED'].includes(profile.accountStatus)) {
      return { allowed: false, reason: `الحساب غير متاح حالياً (${profile.accountStatus})` };
    }

    const policy = await getLoginPolicy();
    if (policy.allowedCountries && policy.allowedCountries.length > 0 && reqContext.country) {
      if (!policy.allowedCountries.includes(reqContext.country.toUpperCase())) {
        return { allowed: false, reason: `تسجيل الدخول من الدولة (${reqContext.country}) غير مسموح حسب سياسة الأمان` };
      }
    }

    const activeSessions = await getUserActiveSessions(userId);
    if (activeSessions.length >= policy.maxConcurrentSessions) {
      return { allowed: false, reason: `تجاوزت الحد الأقصى للجلسات المتزامنة المسموح بها (${policy.maxConcurrentSessions})` };
    }

    return { allowed: true };
  }

  /**
   * Create Session and Track Hardware/Browser Device
   */
  public async registerSessionAndDevice(
    userId: string,
    token: string,
    clientInfo: { ip: string; userAgent: string; deviceName?: string; isRememberMe?: boolean }
  ): Promise<{ session: UserSessionRecord; device: RegisteredDeviceRecord }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (clientInfo.isRememberMe ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString();
    const nowStr = now.toISOString();

    // Parse simple user agent info
    const ua = clientInfo.userAgent || '';
    let browser = 'Unknown Browser';
    if (ua.includes('Chrome')) browser = 'Google Chrome';
    else if (ua.includes('Safari')) browser = 'Apple Safari';
    else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('Edg')) browser = 'Microsoft Edge';

    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    const deviceName = clientInfo.deviceName || `${browser} on ${os}`;
    const deviceId = `dev_${Buffer.from(`${userId}_${os}_${browser}`).toString('hex').substring(0, 16)}`;

    // Register/update device
    const device: RegisteredDeviceRecord = {
      deviceId,
      userId,
      deviceName,
      browser,
      os,
      ipAddress: clientInfo.ip || '127.0.0.1',
      location: 'المملكة العربية السعودية',
      lastActive: nowStr,
      trustStatus: 'TRUSTED',
      serialFingerprint: `${os}-${browser}-${clientInfo.ip}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    await registerOrUpdateDevice(device);

    // Create session record
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const session: UserSessionRecord = {
      sessionId,
      userId,
      token,
      ipAddress: clientInfo.ip || '127.0.0.1',
      userAgent: clientInfo.userAgent || '',
      deviceName,
      browser,
      os,
      createdAt: nowStr,
      lastActivityAt: nowStr,
      expiresAt,
      status: 'ACTIVE',
      isRememberMe: !!clientInfo.isRememberMe,
    };
    await createSessionRecord(session);

    // Update last login in profile
    await createOrUpdateIdentityProfile(userId, { lastLogin: nowStr });

    return { session, device };
  }

  /**
   * Revoke Session
   */
  public async revokeSession(sessionId: string, actorUserId: string): Promise<void> {
    await updateSessionStatus(sessionId, 'REVOKED');
    await createAuditLog({
      actorUserId,
      action: 'SESSION_REVOKED',
      entityType: 'SESSION',
      entityId: sessionId,
    });
  }

  /**
   * Revoke All Other Sessions
   */
  public async revokeAllOtherUserSessions(userId: string, currentSessionId: string, actorUserId: string): Promise<number> {
    const revokedCount = await revokeAllSessionsExcept(userId, currentSessionId);
    await createAuditLog({
      actorUserId,
      action: 'ALL_OTHER_SESSIONS_REVOKED',
      entityType: 'USER',
      entityId: userId,
      after: { revokedCount },
    });
    return revokedCount;
  }

  /**
   * Toggle Device Trust Status
   */
  public async updateDeviceTrust(deviceId: string, status: DeviceTrustStatus, actorUserId: string): Promise<void> {
    await updateDeviceTrustStatus(deviceId, status);
    await createAuditLog({
      actorUserId,
      action: 'DEVICE_TRUST_UPDATED',
      entityType: 'DEVICE',
      entityId: deviceId,
      after: { trustStatus: status },
    });
  }

  /**
   * Generate MFA Backup Codes & Secret
   */
  public async setupMFASecret(userId: string, method: MFAMethod = 'TOTP'): Promise<MFAConfiguration> {
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.floor(10000000 + Math.random() * 90000000).toString()
    );
    const secretKey = `JBSWY3DPEHPK3PXP_${Date.now().toString(36).toUpperCase()}`;

    const config: MFAConfiguration = {
      userId,
      mfaEnabled: true,
      method,
      backupCodes,
      secretKey,
      phoneVerified: true,
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    };

    await saveMFAConfig(config);
    await createOrUpdateIdentityProfile(userId, { mfaEnabled: true, mfaType: method });

    await createAuditLog({
      actorUserId: userId,
      action: 'MFA_ENABLED',
      entityType: 'USER',
      entityId: userId,
      after: { method },
    });

    return config;
  }

  /**
   * Disable MFA
   */
  public async disableMFA(userId: string): Promise<MFAConfiguration> {
    const config: MFAConfiguration = {
      userId,
      mfaEnabled: false,
      method: 'TOTP',
      backupCodes: [],
      phoneVerified: true,
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    };

    await saveMFAConfig(config);
    await createOrUpdateIdentityProfile(userId, { mfaEnabled: false, mfaType: undefined });

    await createAuditLog({
      actorUserId: userId,
      action: 'MFA_DISABLED',
      entityType: 'USER',
      entityId: userId,
    });

    return config;
  }
}

export const identityEngine = new IdentityEngine();
