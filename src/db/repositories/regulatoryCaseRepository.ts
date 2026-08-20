/**
 * AJA INTERNATIONAL LOGISTICS — Regulatory Case Repository
 * Step GOV-19: Regulatory Supervision, Inquiries, Inspections, Response Coordination, Submissions & Commitments
 */

import {
  RegulatoryCase,
  RegulatoryResponsePlan,
  RegulatorySubmission,
  RegulatoryCommitment,
  RegulatoryCaseLifecycleStatus,
  GovernanceJurisdiction
} from '../../types';
import crypto from 'crypto';

// In-Memory canonical stores with deterministic keying
const regulatoryCasesStore = new Map<string, RegulatoryCase>();
const responsePlansStore = new Map<string, RegulatoryResponsePlan>();
const submissionsStore = new Map<string, RegulatorySubmission>();
const commitmentsStore = new Map<string, RegulatoryCommitment>();

// Sequence counters
let caseSequence = 1;
let commitmentSequence = 1;

export function computeCaseSha256(data: any): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function generateCaseNumber(year: number = new Date().getFullYear()): string {
  const seq = String(caseSequence++).padStart(4, '0');
  return `RGC-${year}-${seq}`;
}

export function generateCommitmentNumber(year: number = new Date().getFullYear()): string {
  const seq = String(commitmentSequence++).padStart(4, '0');
  return `RCM-${year}-${seq}`;
}

// ============================================================================
// 1. REGULATORY CASE OPERATIONS
// ============================================================================

export async function saveRegulatoryCase(rCase: RegulatoryCase): Promise<RegulatoryCase> {
  const cloned: RegulatoryCase = JSON.parse(JSON.stringify(rCase));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeCaseSha256({
    id: cloned.id,
    caseNumber: cloned.caseNumber,
    legalEntityId: cloned.legalEntityId,
    jurisdiction: cloned.jurisdiction,
    authorityId: cloned.authorityId,
    caseType: cloned.caseType,
    sourceReference: cloned.sourceReference,
    status: cloned.status,
    responseDueAtUtc: cloned.responseDueAtUtc,
    submissionIds: cloned.submissionIds,
    commitmentIds: cloned.commitmentIds
  });
  regulatoryCasesStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatoryCaseById(id: string): Promise<RegulatoryCase | null> {
  const item = regulatoryCasesStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function findRegulatoryCaseByFingerprint(
  legalEntityId: string,
  authorityId: string,
  sourceReference: string
): Promise<RegulatoryCase | null> {
  for (const item of regulatoryCasesStore.values()) {
    if (
      item.legalEntityId === legalEntityId &&
      item.authorityId === authorityId &&
      item.sourceReference.trim().toLowerCase() === sourceReference.trim().toLowerCase()
    ) {
      return JSON.parse(JSON.stringify(item));
    }
  }
  return null;
}

export async function listRegulatoryCases(filters?: {
  legalEntityId?: string;
  jurisdiction?: GovernanceJurisdiction;
  status?: RegulatoryCaseLifecycleStatus;
  includePrivileged?: boolean;
}): Promise<RegulatoryCase[]> {
  let list = Array.from(regulatoryCasesStore.values()).map(c => JSON.parse(JSON.stringify(c)) as RegulatoryCase);

  if (filters?.legalEntityId) {
    list = list.filter(c => c.legalEntityId === filters.legalEntityId);
  }
  if (filters?.jurisdiction) {
    list = list.filter(c => c.jurisdiction === filters.jurisdiction);
  }
  if (filters?.status) {
    list = list.filter(c => c.status === filters.status);
  }
  if (!filters?.includePrivileged) {
    list = list.filter(c => !c.isPrivilegedLegalContent);
  }

  return list;
}

// ============================================================================
// 2. RESPONSE PLAN OPERATIONS
// ============================================================================

export async function saveResponsePlan(plan: RegulatoryResponsePlan): Promise<RegulatoryResponsePlan> {
  const cloned: RegulatoryResponsePlan = JSON.parse(JSON.stringify(plan));
  cloned.updatedAtUtc = new Date().toISOString();
  responsePlansStore.set(cloned.id, cloned);
  return cloned;
}

export async function getResponsePlanByCaseId(caseId: string): Promise<RegulatoryResponsePlan | null> {
  for (const plan of responsePlansStore.values()) {
    if (plan.caseId === caseId) {
      return JSON.parse(JSON.stringify(plan));
    }
  }
  return null;
}

// ============================================================================
// 3. REGULATORY SUBMISSION OPERATIONS
// ============================================================================

export async function saveRegulatorySubmission(submission: RegulatorySubmission): Promise<RegulatorySubmission> {
  const cloned: RegulatorySubmission = JSON.parse(JSON.stringify(submission));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeCaseSha256({
    id: cloned.id,
    caseId: cloned.caseId,
    submissionNumber: cloned.submissionNumber,
    versionNumber: cloned.versionNumber,
    status: cloned.status,
    documentVersionId: cloned.documentVersionId,
    preparedByUserId: cloned.preparedByUserId,
    approvedByUserId: cloned.approvedByUserId,
    submittedByUserId: cloned.submittedByUserId
  });
  submissionsStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatorySubmissionById(id: string): Promise<RegulatorySubmission | null> {
  const item = submissionsStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function listSubmissionsByCaseId(caseId: string): Promise<RegulatorySubmission[]> {
  return Array.from(submissionsStore.values())
    .filter(s => s.caseId === caseId)
    .map(s => JSON.parse(JSON.stringify(s)));
}

// ============================================================================
// 4. REGULATORY COMMITMENT OPERATIONS
// ============================================================================

export async function saveRegulatoryCommitment(commitment: RegulatoryCommitment): Promise<RegulatoryCommitment> {
  const cloned: RegulatoryCommitment = JSON.parse(JSON.stringify(commitment));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeCaseSha256({
    id: cloned.id,
    caseId: cloned.caseId,
    commitmentNumber: cloned.commitmentNumber,
    description: cloned.description,
    dueDateUtc: cloned.dueDateUtc,
    ownerUserId: cloned.ownerUserId,
    status: cloned.status
  });
  commitmentsStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatoryCommitmentById(id: string): Promise<RegulatoryCommitment | null> {
  const item = commitmentsStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function listCommitmentsByCaseId(caseId: string): Promise<RegulatoryCommitment[]> {
  return Array.from(commitmentsStore.values())
    .filter(c => c.caseId === caseId)
    .map(c => JSON.parse(JSON.stringify(c)));
}

export async function listAllCommitments(legalEntityId?: string): Promise<RegulatoryCommitment[]> {
  const all = Array.from(commitmentsStore.values()).map(c => JSON.parse(JSON.stringify(c)) as RegulatoryCommitment);
  if (!legalEntityId) return all;

  // Filter by case's legalEntityId
  const matchingCaseIds = new Set(
    Array.from(regulatoryCasesStore.values())
      .filter(c => c.legalEntityId === legalEntityId)
      .map(c => c.id)
  );

  return all.filter(c => matchingCaseIds.has(c.caseId));
}

// Reset store helper for test isolation
export function resetRegulatoryCaseStores(): void {
  regulatoryCasesStore.clear();
  responsePlansStore.clear();
  submissionsStore.clear();
  commitmentsStore.clear();
  caseSequence = 1;
  commitmentSequence = 1;
}
