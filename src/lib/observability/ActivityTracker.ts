import { ActivityRecord, UserSessionRecord, ActivityCategory } from '../../types/audit';

export interface LogActivityInput {
  category: ActivityCategory;
  module: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  companyId?: string;
  branchId?: string;
  title: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface StartSessionInput {
  userId: string;
  userName?: string;
  userEmail?: string;
  companyId?: string;
  branchId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityTracker {
  /**
   * Format activity log entry
   */
  public static createActivityRecord(input: LogActivityInput): ActivityRecord {
    return {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      category: input.category,
      module: input.module,
      userId: input.userId || 'system',
      userName: input.userName || 'System Engine',
      userRole: input.userRole,
      companyId: input.companyId || 'aja-holding',
      branchId: input.branchId,
      title: input.title,
      details: input.details,
      metadata: input.metadata,
    };
  }

  /**
   * Parse User Agent info into device, browser, and OS
   */
  public static parseUserAgent(ua?: string): { device: string; browser: string; os: string } {
    if (!ua) {
      return { device: 'Desktop', browser: 'Chrome / Modern Web', os: 'Linux / Cloud Workstation' };
    }

    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('like Mac')) os = 'iOS';

    let browser = 'Unknown Browser';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    const device = ua.includes('Mobi') ? 'Mobile Device' : 'Desktop Workstation';

    return { device, browser, os };
  }

  /**
   * Format new session record
   */
  public static createSessionRecord(input: StartSessionInput): UserSessionRecord {
    const { device, browser, os } = this.parseUserAgent(input.userAgent);

    return {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      companyId: input.companyId || 'aja-holding',
      branchId: input.branchId,
      loginTimestamp: new Date().toISOString(),
      ipAddress: input.ipAddress || '127.0.0.1',
      device,
      browser,
      os,
      country: 'KSA / UAE',
      timezone: 'Asia/Riyadh (UTC+3)',
      active: true,
    };
  }

  /**
   * Close session record
   */
  public static endSessionRecord(session: UserSessionRecord): UserSessionRecord {
    const logoutTime = new Date();
    const loginTime = new Date(session.loginTimestamp);
    const durationSeconds = Math.max(1, Math.floor((logoutTime.getTime() - loginTime.getTime()) / 1000));

    return {
      ...session,
      logoutTimestamp: logoutTime.toISOString(),
      durationSeconds,
      active: false,
    };
  }
}
