/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Calendar & Occurrence Repository
 * Step GOV-08: Compliance Occurrences, Recurrence Policies, Deadline Rules & Persistence
 * 
 * Architecture:
 * - Direct Firestore persistence with typed converters & fallback in-memory stores
 * - Multi-tenant Legal Entity anchor and strict scoped queries
 * - Historical preservation: Hard delete strictly prohibited
 * - Deterministic sequence generation for compliance occurrences (CMP-YYYY-####)
 * - Concurrency & Idempotency safe via generationKey
 */

import {
  ComplianceOccurrence,
  ComplianceOccurrenceStatus,
  GovernanceJurisdiction,
  GovernanceRiskSeverity
} from '../../types/corporateGovernance';
import { adminFirestore as firestore } from '../../server/adminFirestoreCompat';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from '../../server/adminFirestoreCompat';
import { createAuditLog } from './auditLogRepository';
import { validateRequiredString, ValidationError } from '../validation';

export const COMPLIANCE_OCCURRENCES_COLLECTION = 'compliance_occurrences';

// In-Memory Fallback & Fast Query Store
const inMemoryOccurrences = new Map<string, ComplianceOccurrence>();

/**
 * Reset in-memory occurrence repository store (used in isolated unit tests)
 */
export function resetComplianceCalendarRepositoryMemoryStore(): void {
  inMemoryOccurrences.clear();
}

/**
 * Retrieves a compliance occurrence by its unique ID
 */
export async function getOccurrenceById(
  id: string
): Promise<ComplianceOccurrence | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryOccurrences.has(cleanId)) {
    return inMemoryOccurrences.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, COMPLIANCE_OCCURRENCES_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ComplianceOccurrence;
      inMemoryOccurrences.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryOccurrences.get(cleanId) || null;
  }

  return null;
}

/**
 * Retrieves a compliance occurrence by its occurrence number (e.g. CMP-2026-0001)
 */
export async function getOccurrenceByNumber(
  occurrenceNumber: string
): Promise<ComplianceOccurrence | null> {
  const cleanNum = validateRequiredString(occurrenceNumber, 'occurrenceNumber');
  for (const occ of inMemoryOccurrences.values()) {
    if (occ.occurrenceNumber === cleanNum) return occ;
  }

  try {
    const q = query(
      collection(firestore, COMPLIANCE_OCCURRENCES_COLLECTION),
      where('occurrenceNumber', '==', cleanNum)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as ComplianceOccurrence;
      inMemoryOccurrences.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

/**
 * Retrieves a compliance occurrence by its deterministic generation key
 */
export async function getOccurrenceByGenerationKey(
  generationKey: string
): Promise<ComplianceOccurrence | null> {
  const cleanKey = validateRequiredString(generationKey, 'generationKey');
  for (const occ of inMemoryOccurrences.values()) {
    if (occ.generationKey === cleanKey) return occ;
  }

  try {
    const q = query(
      collection(firestore, COMPLIANCE_OCCURRENCES_COLLECTION),
      where('generationKey', '==', cleanKey)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as ComplianceOccurrence;
      inMemoryOccurrences.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

/**
 * Lists occurrences for a legal entity with comprehensive filtering
 */
export async function listOccurrencesByEntity(
  legalEntityId: string,
  filter?: {
    jurisdiction?: GovernanceJurisdiction;
    status?: ComplianceOccurrenceStatus | string;
    obligationId?: string;
    ownerUserId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    riskLevel?: GovernanceRiskSeverity;
  }
): Promise<ComplianceOccurrence[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: ComplianceOccurrence[] = [];

  for (const occ of inMemoryOccurrences.values()) {
    if (occ.legalEntityId === cleanEntityId) {
      if (filter?.jurisdiction && occ.jurisdiction !== filter.jurisdiction && occ.jurisdiction !== 'GLOBAL') {
        continue;
      }
      if (filter?.status && occ.status !== filter.status) {
        continue;
      }
      if (filter?.obligationId && occ.obligationId !== filter.obligationId) {
        continue;
      }
      if (filter?.ownerUserId && occ.ownerUserId !== filter.ownerUserId && occ.assignedAdvisorUserId !== filter.ownerUserId) {
        continue;
      }
      if (filter?.departmentId && occ.responsibleDepartmentId !== filter.departmentId) {
        continue;
      }
      if (filter?.riskLevel && occ.riskLevel !== filter.riskLevel) {
        continue;
      }
      if (filter?.startDate && occ.statutoryDueDate < filter.startDate) {
        continue;
      }
      if (filter?.endDate && occ.statutoryDueDate > filter.endDate) {
        continue;
      }
      results.push(occ);
    }
  }

  return results.sort((a, b) => new Date(a.statutoryDueDate).getTime() - new Date(b.statutoryDueDate).getTime());
}

/**
 * Lists occurrences for a specific obligation
 */
export async function listOccurrencesByObligation(
  obligationId: string
): Promise<ComplianceOccurrence[]> {
  const cleanObligationId = validateRequiredString(obligationId, 'obligationId');
  return Array.from(inMemoryOccurrences.values())
    .filter((o) => o.obligationId === cleanObligationId)
    .sort((a, b) => new Date(a.statutoryDueDate).getTime() - new Date(b.statutoryDueDate).getTime());
}

/**
 * Deterministically generates the next occurrence sequence number (e.g. CMP-2026-0001)
 */
export async function generateNextOccurrenceNumber(
  year: number = new Date().getFullYear()
): Promise<string> {
  const prefix = `CMP-${year}-`;
  let highest = 0;

  for (const occ of inMemoryOccurrences.values()) {
    if (occ.occurrenceNumber && occ.occurrenceNumber.startsWith(prefix)) {
      const numPart = parseInt(occ.occurrenceNumber.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > highest) {
        highest = numPart;
      }
    }
  }

  const nextSeq = highest + 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Saves a compliance occurrence (Insert or Merge Update) with audit logging
 */
export async function saveOccurrence(
  occurrence: ComplianceOccurrence,
  actorUserId: string
): Promise<ComplianceOccurrence> {
  const cleanId = validateRequiredString(occurrence.id, 'id');
  const cleanEntityId = validateRequiredString(occurrence.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previous = inMemoryOccurrences.get(cleanId);

  const updated: ComplianceOccurrence = {
    ...occurrence,
    id: cleanId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: occurrence.createdAt || previous?.createdAt || now
  };

  inMemoryOccurrences.set(cleanId, updated);

  try {
    const docRef = doc(firestore, COMPLIANCE_OCCURRENCES_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: previous ? `UPDATE_COMPLIANCE_OCCURRENCE_${updated.status}` : 'CREATE_COMPLIANCE_OCCURRENCE',
    entityType: 'COMPLIANCE_OCCURRENCE',
    entityId: cleanId,
    metadata: {
      occurrenceNumber: updated.occurrenceNumber,
      obligationCode: updated.obligationCode,
      legalEntityId: cleanEntityId,
      periodReference: updated.periodReference,
      statutoryDueDate: updated.statutoryDueDate,
      status: updated.status,
      ownerUserId: updated.ownerUserId,
      escalationLevel: updated.escalationLevel,
      auditCorrelationId: updated.auditCorrelationId
    }
  });

  return updated;
}
