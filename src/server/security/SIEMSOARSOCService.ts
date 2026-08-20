import {
  SIEMSecurityEvent,
  SOARPlaybook,
  SOCExecutiveDashboard,
} from './types';

export class SIEMSOARSOCService {
  private static readonly SIEM_EVENTS: SIEMSecurityEvent[] = [
    {
      eventId: 'SIEM-2026-9041',
      timestamp: new Date(Date.now() - 1000 * 40).toISOString(),
      severity: 'HIGH',
      category: 'ANOMALOUS_GEO',
      sourceIp: '185.220.101.5',
      sourceLocation: 'Sofia, Bulgaria (Tor Exit Node)',
      affectedTarget: 'API Gateway - /api/v1/finance/payout',
      mitreTechniqueId: 'T1078.004 (Valid Accounts: Cloud Accounts)',
      status: 'CONTAINED',
    },
    {
      eventId: 'SIEM-2026-9038',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      severity: 'MEDIUM',
      category: 'BRUTE_FORCE',
      sourceIp: '92.118.160.12',
      sourceLocation: 'Eastern Europe Subnet',
      affectedTarget: 'Partner Portal SSO Endpoint (/oauth/token)',
      mitreTechniqueId: 'T1110.001 (Password Guessing)',
      status: 'CLOSED',
    },
    {
      eventId: 'SIEM-2026-9022',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      severity: 'CRITICAL',
      category: 'PRIVILEGE_ESCALATION',
      sourceIp: '10.240.4.15',
      sourceLocation: 'Internal Dev K8s Cluster',
      affectedTarget: 'Secret Vault Master Encryption Key Read Attempt',
      mitreTechniqueId: 'T1068 (Exploitation for Privilege Escalation)',
      status: 'INVESTIGATING',
    },
  ];

  private static readonly SOAR_PLAYBOOKS: SOARPlaybook[] = [
    {
      playbookId: 'SOAR-PB-01-SUSPICIOUS-GEO',
      nameAr: 'الربط التلقائي وإلغاء الجلسات عند اكتشاف دخول مشبوه خارجي',
      nameEn: 'Anomalous Geo Access Automatic Revocation Playbook',
      triggerEvent: 'SIEM_GEO_ANOMALY_DETECTED',
      automatedActions: [
        'Revoke OAuth Refresh Token immediately',
        'Add Source IP to Cloud WAF Blocklist for 24 hours',
        'Notify Security On-Call via PagerDuty & Slack',
        'Enforce mandatory Passkey re-authentication on next login',
      ],
      executionCountToday: 3,
      lastTriggeredAt: new Date(Date.now() - 1000 * 40).toISOString(),
    },
    {
      playbookId: 'SOAR-PB-02-API-ABUSE-THROTTLE',
      nameAr: 'خنق طلبات الواجهات البرمجية وتدوير المفاتيح عند السلوك غير الطبيعي',
      nameEn: 'API Abuse Mitigation & Rate Limit Lockout Playbook',
      triggerEvent: 'API_RATE_LIMIT_VIOLATION_SPIKE',
      automatedActions: [
        'Set Circuit Breaker to OPEN state for client ID',
        'Generate temporary token freeze in Redis Cache',
        'Log Immutable Forensic Audit Record to Cloud Storage',
      ],
      executionCountToday: 14,
      lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
  ];

  private static readonly SOC_DASHBOARD: SOCExecutiveDashboard = {
    identityHealthScore: 98,
    zeroTrustCompliancePct: 99.4,
    mfaAdoptionPct: 100.0,
    activeThreatCount: 1,
    criticalAlertsToday: 1,
    avgIncidentResolutionMinutes: 4.2,
    nistCompliancePct: 98.8,
    iso27001CompliancePct: 100.0,
    pciDssCompliancePct: 99.2,
  };

  public static getSIEMEvents(): SIEMSecurityEvent[] {
    return this.SIEM_EVENTS;
  }

  public static getSOARPlaybooks(): SOARPlaybook[] {
    return this.SOAR_PLAYBOOKS;
  }

  public static getSOCDashboard(): SOCExecutiveDashboard {
    return this.SOC_DASHBOARD;
  }

  public static triggerSOARPlaybook(playbookId: string) {
    const pb = this.SOAR_PLAYBOOKS.find((p) => p.playbookId === playbookId) || this.SOAR_PLAYBOOKS[0];
    pb.executionCountToday += 1;
    pb.lastTriggeredAt = new Date().toISOString();

    return {
      success: true,
      executionId: `SOAR-EXEC-${Date.now()}`,
      playbookId: pb.playbookId,
      nameAr: pb.nameAr,
      executedActions: pb.automatedActions,
      completedAt: new Date().toISOString(),
      status: 'SUCCESS',
    };
  }
}
