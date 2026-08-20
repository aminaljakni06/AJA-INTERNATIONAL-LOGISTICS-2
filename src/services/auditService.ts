import {
  AuditRecord,
  ActivityRecord,
  UserSessionRecord,
  EntityHistoryRecord,
  ErrorRecord,
  PerformanceMetricRecord,
  HealthStatusRecord,
  AuditFilterParams,
  AITelemetryHookData,
} from '../types/audit';
import { AuditEngine, CreateAuditRecordInput } from '../lib/observability/AuditEngine';
import { ActivityTracker, LogActivityInput, StartSessionInput } from '../lib/observability/ActivityTracker';
import { PerformanceTracker } from '../lib/observability/PerformanceTracker';
import { HealthMonitor } from '../lib/observability/HealthMonitor';
import { TelemetryHooks } from '../lib/observability/TelemetryHooks';
import { EventBusService } from './eventBusService';
import { getAdminFirestore } from '../server/firebaseAdmin';

export class AuditService {
  private static auditLogs: AuditRecord[] = [
    {
      id: 'aud_seed_101',
      traceId: 'trc_seed_001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      actorId: 'usr_admin_01',
      actorEmail: 'admin@aja-logistics.com',
      actorName: 'Tariq Al-Mansoor',
      actorRole: 'System Administrator',
      companyId: 'aja-holding',
      branchId: 'BR-RUH-01',
      action: 'WORKFLOW_CHANGE',
      severity: 'HIGH',
      module: 'WORKFLOW',
      entityType: 'WorkflowDefinition',
      entityId: 'wf_shipment_approval_v2',
      description: 'Modified SLA threshold for VIP Customs Clearance from 4h to 2h',
      previousState: { slaHours: 4, autoEscalate: false },
      newState: { slaHours: 2, autoEscalate: true },
      changedFields: ['slaHours', 'autoEscalate'],
      ipAddress: '185.192.12.44',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      checksum: 'sha256_seed_hash_001',
      isTamperVerified: true,
    },
    {
      id: 'aud_seed_102',
      traceId: 'trc_seed_002',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      actorId: 'usr_ops_02',
      actorEmail: 'fatima@aja-logistics.com',
      actorName: 'Fatima Al-Zahrani',
      actorRole: 'Logistics Operations Lead',
      companyId: 'aja-holding',
      branchId: 'BR-JED-02',
      action: 'APPROVE',
      severity: 'INFO',
      module: 'SHIPPING',
      entityType: 'Shipment',
      entityId: 'AJA-KSA-99882',
      description: 'Approved customs clearance release document for heavy machinery cargo',
      previousState: { status: 'PENDING_CLEARANCE' },
      newState: { status: 'CUSTOMS_CLEARED', clearedAt: new Date().toISOString() },
      changedFields: ['status', 'clearedAt'],
      ipAddress: '185.192.12.52',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      checksum: 'sha256_seed_hash_002',
      isTamperVerified: true,
    },
    {
      id: 'aud_seed_103',
      traceId: 'trc_seed_003',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      actorId: 'usr_fin_03',
      actorEmail: 'youssef@aja-logistics.com',
      actorName: 'Youssef Al-Harbi',
      actorRole: 'Finance Controller',
      companyId: 'aja-holding',
      branchId: 'BR-RUH-01',
      action: 'PAYMENT_EVENT',
      severity: 'INFO',
      module: 'FINANCE',
      entityType: 'Invoice',
      entityId: 'INV-2026-8841',
      description: 'Processed SAR 145,000.00 freight settlement via Tap Payments Gateway',
      previousState: { paymentStatus: 'UNPAID', balanceDue: 145000 },
      newState: { paymentStatus: 'PAID', balanceDue: 0, transactionId: 'tx_tap_991823' },
      changedFields: ['paymentStatus', 'balanceDue', 'transactionId'],
      ipAddress: '185.192.12.18',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      checksum: 'sha256_seed_hash_003',
      isTamperVerified: true,
    },
    {
      id: 'aud_seed_104',
      traceId: 'trc_seed_004',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      actorId: 'usr_sec_01',
      actorEmail: 'security-bot@aja-logistics.com',
      actorName: 'Security Automation Engine',
      actorRole: 'System Bot',
      companyId: 'aja-holding',
      action: 'PERMISSION_CHANGE',
      severity: 'CRITICAL',
      module: 'SECURITY',
      entityType: 'UserRole',
      entityId: 'role_customs_broker',
      description: 'Revoked administrative export privileges from unverified external vendor account',
      previousState: { canExportData: true },
      newState: { canExportData: false },
      changedFields: ['canExportData'],
      ipAddress: '127.0.0.1',
      checksum: 'sha256_seed_hash_004',
      isTamperVerified: true,
    },
  ];

  private static activityLogs: ActivityRecord[] = [
    {
      id: 'act_seed_201',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      category: 'USER',
      module: 'SHIPPING',
      userId: 'usr_ops_02',
      userName: 'Fatima Al-Zahrani',
      userRole: 'Logistics Operations Lead',
      companyId: 'aja-holding',
      branchId: 'BR-JED-02',
      title: 'Created Express Quote Request',
      details: 'Quote #QT-2026-9041 created for SABIC Chemical Logistics',
    },
    {
      id: 'act_seed_202',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      category: 'BACKGROUND_JOB',
      module: 'INTEGRATION',
      userId: 'system',
      userName: 'System Scheduler',
      companyId: 'aja-holding',
      title: 'ZATCA Phase 2 E-Invoicing Sync',
      details: 'Synchronized 142 B2B invoices with Saudi Tax & Customs Authority API',
    },
    {
      id: 'act_seed_203',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      category: 'WORKFLOW',
      module: 'CUSTOMS',
      userId: 'usr_admin_01',
      userName: 'Tariq Al-Mansoor',
      companyId: 'aja-holding',
      title: 'Automated Exception Routing',
      details: 'Routed delayed shipment AJA-KSA-77102 to priority customs desk',
    },
  ];

  private static activeSessions: UserSessionRecord[] = [
    {
      id: 'sess_live_101',
      userId: 'usr_admin_01',
      userName: 'Tariq Al-Mansoor',
      userEmail: 'admin@aja-logistics.com',
      companyId: 'aja-holding',
      branchId: 'BR-RUH-01',
      loginTimestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      ipAddress: '185.192.12.44',
      device: 'Desktop Workstation',
      browser: 'Chrome 122',
      os: 'macOS',
      country: 'Saudi Arabia',
      timezone: 'Asia/Riyadh (UTC+3)',
      active: true,
    },
    {
      id: 'sess_live_102',
      userId: 'usr_ops_02',
      userName: 'Fatima Al-Zahrani',
      userEmail: 'fatima@aja-logistics.com',
      companyId: 'aja-holding',
      branchId: 'BR-JED-02',
      loginTimestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      ipAddress: '185.192.12.52',
      device: 'Mobile Device',
      browser: 'Safari Mobile',
      os: 'iOS',
      country: 'Saudi Arabia',
      timezone: 'Asia/Riyadh (UTC+3)',
      active: true,
    },
  ];

  private static errorLogs: ErrorRecord[] = [
    {
      id: 'err_seed_301',
      traceId: 'trc_err_901',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      category: 'INTEGRATION',
      module: 'PAYMENTS',
      message: 'Tap Gateway Timeout: Payment authorization socket handshake reset',
      code: 'ERR_GATEWAY_TIMEOUT',
      userId: 'usr_fin_03',
      companyId: 'aja-holding',
      requestUrl: '/api/payments/process',
      requestMethod: 'POST',
      resolved: false,
    },
    {
      id: 'err_seed_302',
      traceId: 'trc_err_902',
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      category: 'VALIDATION',
      module: 'CUSTOMS',
      message: 'ZATCA Invoice Validation Failed: HS Code 8471.30 missing 8-digit suffix',
      code: 'ERR_ZATCA_HS_INVALID',
      userId: 'usr_ops_02',
      companyId: 'aja-holding',
      requestUrl: '/api/customs/declaration',
      requestMethod: 'PUT',
      resolved: true,
    },
  ];

  private static entityHistory: EntityHistoryRecord[] = [
    {
      id: 'hist_seed_401',
      entityType: 'Shipment',
      entityId: 'AJA-KSA-99882',
      version: 2,
      updatedByUserId: 'usr_ops_02',
      updatedByUserName: 'Fatima Al-Zahrani',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      changeSummary: 'Status transition: PENDING_CLEARANCE -> CUSTOMS_CLEARED',
      snapshot: {
        trackingNumber: 'AJA-KSA-99882',
        origin: 'Jeddah Islamic Port',
        destination: 'Riyadh Dry Port',
        status: 'CUSTOMS_CLEARED',
        weightKg: 14500,
        cargoType: 'Heavy Machinery',
      },
    },
  ];

  /**
   * Log an immutable audit record
   */
  public static async logAudit(input: CreateAuditRecordInput): Promise<AuditRecord> {
    const record = AuditEngine.createRecord(input);
    this.auditLogs.unshift(record);

    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }

    // Persist to Firestore async
    this.persistToFirestore('audit_logs', record);

    // Emit domain event
    EventBusService.publish({
      name: 'AuditEventRecorded',
      aggregateId: record.id,
      aggregateType: 'AuditLog',
      module: (record.module || 'SYSTEM') as any,
      priority: record.severity === 'CRITICAL' ? 'CRITICAL' : 'NORMAL',
      payload: record,
    }).catch(() => {});

    return record;
  }

  /**
   * Log an activity
   */
  public static logActivity(input: LogActivityInput): ActivityRecord {
    const record = ActivityTracker.createActivityRecord(input);
    this.activityLogs.unshift(record);

    if (this.activityLogs.length > 500) {
      this.activityLogs.pop();
    }

    this.persistToFirestore('activity_logs', record);
    return record;
  }

  /**
   * Start user session
   */
  public static startSession(input: StartSessionInput): UserSessionRecord {
    const record = ActivityTracker.createSessionRecord(input);
    this.activeSessions.unshift(record);
    this.persistToFirestore('user_sessions', record);
    return record;
  }

  /**
   * Log error
   */
  public static logError(input: {
    category: ErrorRecord['category'];
    module: string;
    message: string;
    stack?: string;
    code?: string;
    userId?: string;
    companyId?: string;
    requestUrl?: string;
    requestMethod?: string;
  }): ErrorRecord {
    const record: ErrorRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      traceId: `trc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      category: input.category,
      module: input.module,
      message: input.message,
      stack: input.stack,
      code: input.code,
      userId: input.userId,
      companyId: input.companyId || 'aja-holding',
      requestUrl: input.requestUrl,
      requestMethod: input.requestMethod,
      resolved: false,
    };

    this.errorLogs.unshift(record);
    if (this.errorLogs.length > 200) {
      this.errorLogs.pop();
    }

    this.persistToFirestore('error_logs', record);
    return record;
  }

  /**
   * Save entity version snapshot
   */
  public static recordEntityHistory(input: {
    entityType: string;
    entityId: string;
    updatedByUserId: string;
    updatedByUserName?: string;
    changeSummary: string;
    snapshot: Record<string, any>;
  }): EntityHistoryRecord {
    const existing = this.entityHistory.filter((h) => h.entityType === input.entityType && h.entityId === input.entityId);
    const version = existing.length + 1;

    const record: EntityHistoryRecord = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityType: input.entityType,
      entityId: input.entityId,
      version,
      updatedByUserId: input.updatedByUserId,
      updatedByUserName: input.updatedByUserName || 'System Operator',
      timestamp: new Date().toISOString(),
      changeSummary: input.changeSummary,
      snapshot: input.snapshot,
    };

    this.entityHistory.unshift(record);
    this.persistToFirestore('entity_history', record);
    return record;
  }

  /**
   * Query Audit Logs
   */
  public static getAuditLogs(params?: AuditFilterParams): AuditRecord[] {
    let filtered = [...this.auditLogs];

    if (!params) return filtered;

    if (params.module) {
      filtered = filtered.filter((a) => a.module.toLowerCase() === params.module?.toLowerCase());
    }
    if (params.action) {
      filtered = filtered.filter((a) => a.action === params.action);
    }
    if (params.severity) {
      filtered = filtered.filter((a) => a.severity === params.severity);
    }
    if (params.userId) {
      filtered = filtered.filter((a) => a.actorId === params.userId);
    }
    if (params.entityType) {
      filtered = filtered.filter((a) => a.entityType.toLowerCase() === params.entityType?.toLowerCase());
    }
    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.description.toLowerCase().includes(q) ||
          a.entityId.toLowerCase().includes(q) ||
          a.actorName?.toLowerCase().includes(q) ||
          a.actorEmail?.toLowerCase().includes(q) ||
          a.traceId.toLowerCase().includes(q)
      );
    }

    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  /**
   * Query Activity Logs
   */
  public static getActivityLogs(category?: string, limit: number = 50): ActivityRecord[] {
    if (!category) return this.activityLogs.slice(0, limit);
    return this.activityLogs.filter((a) => a.category.toLowerCase() === category.toLowerCase()).slice(0, limit);
  }

  /**
   * Query Errors
   */
  public static getErrorLogs(unresolvedOnly: boolean = false): ErrorRecord[] {
    if (unresolvedOnly) return this.errorLogs.filter((e) => !e.resolved);
    return [...this.errorLogs];
  }

  /**
   * Get Active Sessions
   */
  public static getActiveSessions(): UserSessionRecord[] {
    return [...this.activeSessions];
  }

  /**
   * Get Entity Version History
   */
  public static getEntityHistory(entityType: string, entityId: string): EntityHistoryRecord[] {
    return this.entityHistory
      .filter((h) => h.entityType.toLowerCase() === entityType.toLowerCase() && h.entityId === entityId)
      .sort((a, b) => b.version - a.version);
  }

  /**
   * System Health Diagnostic
   */
  public static async getSystemHealth(): Promise<HealthStatusRecord[]> {
    return HealthMonitor.runDiagnostics();
  }

  /**
   * Performance Metrics Summary
   */
  public static getPerformanceSummary() {
    return PerformanceTracker.getMetricsSummary();
  }

  /**
   * AI Telemetry Summary
   */
  public static getAITelemetrySummary() {
    return TelemetryHooks.getAITelemetrySummary();
  }

  /**
   * Firestore persistence helper
   */
  private static async persistToFirestore(collectionName: string, data: any): Promise<void> {
    try {
      await getAdminFirestore().collection(collectionName).add({
        ...data,
        persistedAt: new Date().toISOString(),
      });
    } catch (e) {
      // Quiet catch for local sandbox or restricted rule execution
    }
  }
}
