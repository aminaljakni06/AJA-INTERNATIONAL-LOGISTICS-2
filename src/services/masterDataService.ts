import { 
  MasterDataRecord, 
  MasterDataVersionRecord, 
  MasterRelationship, 
  DuplicatePair, 
  DataQualityIssue, 
  MDMAnalytics, 
  MasterDataDomain, 
  MasterRecordStatus 
} from '../types/mdm';
import { 
  listMasterRecords, 
  getMasterRecordById, 
  saveMasterRecord, 
  softDeleteMasterRecord, 
  listVersionHistory, 
  listRelationships, 
  saveRelationship, 
  removeRelationship, 
  listDuplicates, 
  saveDuplicatePair 
} from '../db/repositories/masterDataRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { EventBusService } from './eventBusService';

export class MasterDataService {

  // --- 1. DATA QUALITY & COMPLETENESS ENGINE ---

  public static calculateQualityScore(record: Partial<MasterDataRecord>): number {
    let score = 0;
    if (record.code && record.code.length >= 2) score += 20;
    if (record.nameAr && record.nameAr.trim().length >= 2) score += 20;
    if (record.nameEn && record.nameEn.trim().length >= 2) score += 20;
    if (record.description && record.description.trim().length >= 5) score += 10;
    if (record.owner && record.owner.trim().length > 0) score += 10;
    if (record.steward && record.steward.trim().length > 0) score += 10;
    if (record.metadata && Object.keys(record.metadata).length > 0) score += 10;
    return Math.min(100, score);
  }

  public static async runDataQualityAudit(): Promise<DataQualityIssue[]> {
    const allRecords = await listMasterRecords();
    const issues: DataQualityIssue[] = [];
    const codeMap = new Map<string, string>();

    for (const record of allRecords) {
      // Check Uniqueness
      const key = `${record.domain}:${record.code.toUpperCase()}`;
      if (codeMap.has(key)) {
        issues.push({
          recordId: record.id,
          recordCode: record.code,
          recordName: record.nameEn,
          domain: record.domain,
          ruleType: 'UNIQUENESS',
          severity: 'CRITICAL',
          field: 'code',
          message: `Duplicate code detected in domain ${record.domain}: Code '${record.code}' already used by record ${codeMap.get(key)}.`
        });
      } else {
        codeMap.set(key, record.id);
      }

      // Check Completeness
      if (!record.nameAr || record.nameAr.trim() === '') {
        issues.push({
          recordId: record.id,
          recordCode: record.code,
          recordName: record.nameEn,
          domain: record.domain,
          ruleType: 'COMPLETENESS',
          severity: 'HIGH',
          field: 'nameAr',
          message: 'Missing Arabic Name in Master Record.'
        });
      }

      if (!record.steward) {
        issues.push({
          recordId: record.id,
          recordCode: record.code,
          recordName: record.nameEn,
          domain: record.domain,
          ruleType: 'COMPLETENESS',
          severity: 'MEDIUM',
          field: 'steward',
          message: 'No Data Steward assigned to Master Record.'
        });
      }

      // Check Expiration Date
      if (record.expirationDate) {
        const expTime = new Date(record.expirationDate).getTime();
        if (expTime < Date.now()) {
          issues.push({
            recordId: record.id,
            recordCode: record.code,
            recordName: record.nameEn,
            domain: record.domain,
            ruleType: 'CONSISTENCY',
            severity: 'HIGH',
            field: 'expirationDate',
            message: 'Master record has reached its expiration date.'
          });
        }
      }
    }

    return issues;
  }

  // --- 2. DUPLICATE DETECTION ENGINE ---

  public static async detectDuplicatesForRecord(target: MasterDataRecord): Promise<DuplicatePair[]> {
    const allRecords = await listMasterRecords({ domain: target.domain });
    const detected: DuplicatePair[] = [];

    for (const other of allRecords) {
      if (other.id === target.id) continue;

      let similarity = 0;
      let reasons: string[] = [];

      // Check Code Match
      if (other.code.toLowerCase() === target.code.toLowerCase()) {
        similarity += 60;
        reasons.push('Identical Business Code');
      }

      // Check Name Match
      if (other.nameEn.toLowerCase() === target.nameEn.toLowerCase()) {
        similarity += 40;
        reasons.push('Identical English Name');
      }

      if (other.nameAr === target.nameAr) {
        similarity += 40;
        reasons.push('Identical Arabic Name');
      }

      if (similarity >= 50) {
        const pair: DuplicatePair = {
          id: `dup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          domain: target.domain,
          recordAId: target.id,
          recordBId: other.id,
          recordAName: `${target.code} - ${target.nameEn}`,
          recordBName: `${other.code} - ${other.nameEn}`,
          similarityScore: Math.min(100, similarity),
          matchReason: reasons.join(' & '),
          status: 'OPEN',
          detectedAt: new Date().toISOString()
        };

        await saveDuplicatePair(pair);
        detected.push(pair);
      }
    }

    return detected;
  }

  // --- 3. MASTER DATA LIFECYCLE & CRUD ---

  public static async createMasterRecord(
    input: Omit<MasterDataRecord, 'id' | 'version' | 'qualityScore' | 'createdAt' | 'updatedAt' | 'isDeleted'>,
    actorUserId: string
  ): Promise<MasterDataRecord> {
    const id = `mdm_${input.domain.toLowerCase().slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const qualityScore = this.calculateQualityScore(input);

    const record: MasterDataRecord = {
      ...input,
      id,
      version: 1,
      qualityScore,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveMasterRecord(record);

    // Auto Scan for Duplicates
    await this.detectDuplicatesForRecord(record);

    // Audit Logging & Event Bus
    await createAuditLog({
      actorUserId,
      action: 'MASTER_DATA_CREATED',
      entityType: 'MASTER_DATA_MANAGEMENT',
      entityId: record.id,
      after: { record }
    });

    EventBusService.publish({
      name: 'SystemAlert',
      aggregateId: record.id,
      aggregateType: 'MASTER_DATA',
      module: 'MDM',
      triggeredBy: { userId: actorUserId },
      payload: { record, action: 'CREATED' }
    });

    return record;
  }

  public static async updateMasterRecord(
    id: string,
    updates: Partial<MasterDataRecord>,
    actorUserId: string
  ): Promise<MasterDataRecord> {
    const existing = await getMasterRecordById(id);
    if (!existing) throw new Error(`Master record with ID ${id} not found.`);

    const newVersion = existing.version + 1;
    const updatedRecord: MasterDataRecord = {
      ...existing,
      ...updates,
      version: newVersion,
      updatedBy: actorUserId,
      updatedAt: new Date().toISOString()
    };

    updatedRecord.qualityScore = this.calculateQualityScore(updatedRecord);

    await saveMasterRecord(updatedRecord);

    await createAuditLog({
      actorUserId,
      action: 'MASTER_DATA_UPDATED',
      entityType: 'MASTER_DATA_MANAGEMENT',
      entityId: id,
      before: { existing },
      after: { updatedRecord }
    });

    EventBusService.publish({
      name: 'SystemAlert',
      aggregateId: id,
      aggregateType: 'MASTER_DATA',
      module: 'MDM',
      triggeredBy: { userId: actorUserId },
      payload: { id, version: newVersion, action: 'UPDATED' }
    });

    return updatedRecord;
  }

  public static async approveMasterRecord(
    id: string,
    approved: boolean,
    actorUserId: string
  ): Promise<MasterDataRecord> {
    const record = await getMasterRecordById(id);
    if (!record) throw new Error(`Master record with ID ${id} not found.`);

    record.approvalStatus = approved ? 'APPROVED' : 'REJECTED';
    if (approved) record.status = 'ACTIVE';
    record.updatedBy = actorUserId;
    record.updatedAt = new Date().toISOString();

    await saveMasterRecord(record);

    await createAuditLog({
      actorUserId,
      action: approved ? 'MASTER_DATA_APPROVED' : 'MASTER_DATA_REJECTED',
      entityType: 'MASTER_DATA_MANAGEMENT',
      entityId: id,
      after: { record }
    });

    return record;
  }

  public static async archiveMasterRecord(id: string, actorUserId: string): Promise<boolean> {
    const success = await softDeleteMasterRecord(id, actorUserId);
    if (success) {
      await createAuditLog({
        actorUserId,
        action: 'MASTER_DATA_ARCHIVED',
        entityType: 'MASTER_DATA_MANAGEMENT',
        entityId: id,
        after: { archived: true }
      });
    }
    return success;
  }

  // --- 4. MERGE ENGINE ---

  public static async mergeRecords(
    primaryId: string,
    secondaryId: string,
    fieldResolutions: Partial<MasterDataRecord>,
    actorUserId: string
  ): Promise<MasterDataRecord> {
    const primary = await getMasterRecordById(primaryId);
    const secondary = await getMasterRecordById(secondaryId);

    if (!primary || !secondary) throw new Error('Primary or Secondary record not found for merge operation.');

    // Update Primary with field resolutions
    const mergedRecord: MasterDataRecord = {
      ...primary,
      ...fieldResolutions,
      version: primary.version + 1,
      updatedBy: actorUserId,
      updatedAt: new Date().toISOString()
    };

    mergedRecord.qualityScore = this.calculateQualityScore(mergedRecord);
    await saveMasterRecord(mergedRecord);

    // Archive Secondary Record
    await softDeleteMasterRecord(secondaryId, actorUserId);

    // Rebind Relationships
    const secondaryRels = await listRelationships(secondaryId);
    for (const rel of secondaryRels) {
      if (rel.sourceEntityId === secondaryId) {
        rel.sourceEntityId = primaryId;
      }
      if (rel.targetEntityId === secondaryId) {
        rel.targetEntityId = primaryId;
      }
      await saveRelationship(rel);
    }

    // Resolve open duplicate pair if exists
    const duplicates = await listDuplicates();
    const pair = duplicates.find(p => 
      (p.recordAId === primaryId && p.recordBId === secondaryId) ||
      (p.recordAId === secondaryId && p.recordBId === primaryId)
    );

    if (pair) {
      pair.status = 'MERGED';
      pair.resolvedAt = new Date().toISOString();
      pair.resolvedBy = actorUserId;
      await saveDuplicatePair(pair);
    }

    await createAuditLog({
      actorUserId,
      action: 'MASTER_DATA_MERGED',
      entityType: 'MASTER_DATA_MANAGEMENT',
      entityId: primaryId,
      after: { mergedRecord, secondaryArchivedId: secondaryId }
    });

    return mergedRecord;
  }

  // --- 5. ANALYTICS ---

  public static async getAnalytics(): Promise<MDMAnalytics> {
    const records = await listMasterRecords();
    const duplicates = await listDuplicates();

    const domainBreakdown: Record<MasterDataDomain, number> = {} as any;
    const statusBreakdown: Record<MasterRecordStatus, number> = {
      DRAFT: 0,
      ACTIVE: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
      ARCHIVED: 0
    };

    let totalScore = 0;
    let pendingApprovalsCount = 0;

    for (const r of records) {
      domainBreakdown[r.domain] = (domainBreakdown[r.domain] || 0) + 1;
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
      totalScore += r.qualityScore;
      if (r.approvalStatus === 'PENDING') pendingApprovalsCount++;
    }

    const openDuplicatesCount = duplicates.filter(d => d.status === 'OPEN').length;
    const activeDomainsCount = Object.keys(domainBreakdown).length;
    const averageQualityScore = records.length > 0 ? Math.round(totalScore / records.length) : 100;

    return {
      totalRecords: records.length,
      activeDomainsCount,
      averageQualityScore,
      openDuplicatesCount,
      pendingApprovalsCount,
      domainBreakdown,
      statusBreakdown
    };
  }
}
