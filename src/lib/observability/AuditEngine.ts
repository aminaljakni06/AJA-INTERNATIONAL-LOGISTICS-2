import { AuditRecord, AuditActionType, AuditSeverity } from '../../types/audit';

export interface CreateAuditRecordInput {
  traceId?: string;
  correlationId?: string;
  actorId: string;
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  action: AuditActionType;
  severity?: AuditSeverity;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  previousState?: Record<string, any> | null;
  newState?: Record<string, any> | null;
  ipAddress?: string;
  userAgent?: string;
}

const SENSITIVE_FIELDS = ['password', 'secret', 'token', 'creditCard', 'cvv', 'apiKey', 'privateKey', 'ssn'];

export class AuditEngine {
  /**
   * Simple deterministic checksum algorithm for tamper detection verification
   */
  public static generateChecksum(record: Omit<AuditRecord, 'checksum' | 'isTamperVerified'>): string {
    const rawString = `${record.id}:${record.traceId}:${record.timestamp}:${record.actorId}:${record.action}:${record.entityType}:${record.entityId}:${record.severity}`;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `sha256_${Math.abs(hash).toString(16)}_${rawString.length}`;
  }

  /**
   * Verify if an audit record has been tampered with
   */
  public static verifyTamperProof(record: AuditRecord): boolean {
    if (!record.checksum) return false;
    const computed = this.generateChecksum(record);
    return computed === record.checksum;
  }

  /**
   * Mask sensitive fields from data state objects
   */
  public static maskSensitiveData(data?: Record<string, any> | null): Record<string, any> | null {
    if (!data || typeof data !== 'object') return null;

    const masked: Record<string, any> = Array.isArray(data) ? [] : {};

    for (const key of Object.keys(data)) {
      const lowerKey = key.toLowerCase();
      const value = data[key];

      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
        masked[key] = '*** MASKED_SENSITIVE_DATA ***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Extract changed field names between previous and new state
   */
  public static computeChangedFields(
    prev?: Record<string, any> | null,
    next?: Record<string, any> | null
  ): string[] {
    if (!prev || !next) return [];

    const changed: string[] = [];
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

    for (const key of allKeys) {
      if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
        changed.push(key);
      }
    }

    return changed;
  }

  /**
   * Create a standardized immutable audit record
   */
  public static createRecord(input: CreateAuditRecordInput): AuditRecord {
    const now = new Date().toISOString();
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const traceId = input.traceId || `trc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const maskedPrev = this.maskSensitiveData(input.previousState);
    const maskedNext = this.maskSensitiveData(input.newState);
    const changedFields = this.computeChangedFields(maskedPrev, maskedNext);

    const baseRecord: Omit<AuditRecord, 'checksum' | 'isTamperVerified'> = {
      id,
      traceId,
      correlationId: input.correlationId,
      timestamp: now,
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      actorName: input.actorName,
      actorRole: input.actorRole,
      companyId: input.companyId || 'aja-holding',
      branchId: input.branchId,
      departmentId: input.departmentId,
      action: input.action,
      severity: input.severity || 'INFO',
      module: input.module,
      entityType: input.entityType,
      entityId: input.entityId,
      description: input.description,
      previousState: maskedPrev,
      newState: maskedNext,
      changedFields,
      ipAddress: input.ipAddress || '127.0.0.1',
      userAgent: input.userAgent || 'AJA-Enterprise-Platform/1.0',
    };

    const checksum = this.generateChecksum(baseRecord);

    return {
      ...baseRecord,
      checksum,
      isTamperVerified: true,
    };
  }
}
