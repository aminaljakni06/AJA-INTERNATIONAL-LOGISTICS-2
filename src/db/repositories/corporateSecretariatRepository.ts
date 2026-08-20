/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Secretariat & Statutory Execution Repository
 * Step GOV-15: Delegated Execution, Corporate Secretariat Operations & Statutory Corporate Actions
 * 
 * Core Invariants:
 * - Deterministic numbering (SEC-YYYY-####, CA-YYYY-####, REC-YYYY-####, SUB-YYYY-####)
 * - Prohibited hard-deletion of statutory action records and secretariat instructions
 * - Strict multi-entity isolation and audit logging
 * - SHA-256 integrity computation and document version pinning
 */

import {
  CorporateSecretariatInstruction,
  CorporateActionRecord,
  CorporateActionPolicyRuleSet,
  CorporateActionExecutionAttempt,
  ExternalSubmissionRecord,
  CorporateRegisterReconciliationRecord,
  StatutoryCorporateActionType,
  GovernanceJurisdiction
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
import { validateRequiredString } from '../validation';
import * as crypto from 'crypto';

// Firestore Collection Names
export const SECRETARIAT_INSTRUCTIONS_COLLECTION = 'corporate_secretariat_instructions';
export const CORPORATE_ACTIONS_COLLECTION = 'corporate_actions';
export const CORPORATE_ACTION_RULESETS_COLLECTION = 'corporate_action_rulesets';
export const CORPORATE_ACTION_ATTEMPTS_COLLECTION = 'corporate_action_attempts';
export const EXTERNAL_SUBMISSIONS_COLLECTION = 'external_submissions';
export const REGISTER_RECONCILIATIONS_COLLECTION = 'register_reconciliations';

// In-Memory Storage for Reliable Fast In-Memory Fallback & Tests
const inMemoryInstructions = new Map<string, CorporateSecretariatInstruction>();
const inMemoryCorporateActions = new Map<string, CorporateActionRecord>();
const inMemoryRuleSets = new Map<string, CorporateActionPolicyRuleSet>();
const inMemoryAttempts = new Map<string, CorporateActionExecutionAttempt>();
const inMemorySubmissions = new Map<string, ExternalSubmissionRecord>();
const inMemoryReconciliations = new Map<string, CorporateRegisterReconciliationRecord>();

export function resetCorporateSecretariatMemoryStore(): void {
  inMemoryInstructions.clear();
  inMemoryCorporateActions.clear();
  inMemoryRuleSets.clear();
  inMemoryAttempts.clear();
  inMemorySubmissions.clear();
  inMemoryReconciliations.clear();
}

export function computeSecretariatSha256(data: string | object): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// ============================================================================
// 1. SECRETARIAT INSTRUCTIONS
// ============================================================================

export async function saveSecretariatInstruction(
  instruction: CorporateSecretariatInstruction,
  actorUserId: string
): Promise<CorporateSecretariatInstruction> {
  const cleanId = validateRequiredString(instruction.id, 'instruction.id');
  const now = new Date().toISOString();
  const record: CorporateSecretariatInstruction = {
    ...instruction,
    updatedAt: now
  };

  inMemoryInstructions.set(cleanId, record);

  try {
    const docRef = doc(firestore, SECRETARIAT_INSTRUCTIONS_COLLECTION, cleanId);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Firestore unavailable or offline fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_SECRETARIAT_INSTRUCTION',
    entityType: 'SECRETARIAT_INSTRUCTION',
    entityId: cleanId,
    before: null,
    after: record as unknown as Record<string, unknown>,
    metadata: {
      instructionNumber: record.instructionNumber,
      instructionType: record.instructionType,
      legalEntityId: record.legalEntityId,
      executionStatus: record.executionStatus,
      policyVersionId: record.policyVersionId,
      correlationId: record.correlationId
    }
  });

  return record;
}

export async function getSecretariatInstructionById(
  instructionId: string
): Promise<CorporateSecretariatInstruction | null> {
  const cleanId = validateRequiredString(instructionId, 'instructionId');
  if (inMemoryInstructions.has(cleanId)) {
    return inMemoryInstructions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, SECRETARIAT_INSTRUCTIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporateSecretariatInstruction;
      inMemoryInstructions.set(cleanId, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function listSecretariatInstructionsByEntity(
  legalEntityId: string,
  filter?: {
    status?: CorporateSecretariatInstruction['executionStatus'];
    instructionType?: CorporateSecretariatInstruction['instructionType'];
  }
): Promise<CorporateSecretariatInstruction[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: CorporateSecretariatInstruction[] = [];

  Array.from(inMemoryInstructions.values()).forEach(item => {
    if (item.legalEntityId === cleanEntityId) {
      if (!filter?.status || item.executionStatus === filter.status) {
        if (!filter?.instructionType || item.instructionType === filter.instructionType) {
          results.push(item);
        }
      }
    }
  });

  if (results.length > 0 || process.env.NODE_ENV === 'test') {
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  try {
    const collRef = collection(firestore, SECRETARIAT_INSTRUCTIONS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as CorporateSecretariatInstruction;
      if (!results.some(r => r.id === item.id)) {
        if (!filter?.status || item.executionStatus === filter.status) {
          if (!filter?.instructionType || item.instructionType === filter.instructionType) {
            results.push(item);
          }
        }
        inMemoryInstructions.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteSecretariatInstructionProhibited(
  instructionId: string,
  actorUserId: string
): Promise<never> {
  await createAuditLog({
    actorUserId,
    action: 'DELETE_SECRETARIAT_INSTRUCTION_BLOCKED',
    entityType: 'SECRETARIAT_INSTRUCTION',
    entityId: instructionId,
    before: null,
    after: null,
    metadata: {
      reason: 'STATUTORY_IMMUTABILITY_RULE: Corporate Secretariat instructions are permanent statutory records and cannot be deleted.',
      severity: 'CRITICAL'
    }
  });

  throw new Error(`Statutory Immutability Violation: Secretariat instruction '${instructionId}' cannot be deleted.`);
}

// ============================================================================
// 2. CORPORATE ACTION POLICY RULE SETS
// ============================================================================

export async function saveCorporateActionPolicyRuleSet(
  ruleSet: CorporateActionPolicyRuleSet,
  actorUserId: string
): Promise<CorporateActionPolicyRuleSet> {
  const cleanId = validateRequiredString(ruleSet.id, 'ruleSet.id');
  const now = new Date().toISOString();
  const record: CorporateActionPolicyRuleSet = {
    ...ruleSet,
    updatedAt: now
  };

  inMemoryRuleSets.set(cleanId, record);

  try {
    const docRef = doc(firestore, CORPORATE_ACTION_RULESETS_COLLECTION, cleanId);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_CORPORATE_ACTION_RULESET',
    entityType: 'CORPORATE_ACTION_RULESET',
    entityId: cleanId,
    before: null,
    after: record as unknown as Record<string, unknown>,
    metadata: {
      policyVersionId: record.policyVersionId,
      legalEntityId: record.legalEntityId,
      jurisdiction: record.jurisdiction,
      actionType: record.actionType
    }
  });

  return record;
}

export async function getCorporateActionPolicyRuleSetById(
  ruleSetId: string
): Promise<CorporateActionPolicyRuleSet | null> {
  const cleanId = validateRequiredString(ruleSetId, 'ruleSetId');
  if (inMemoryRuleSets.has(cleanId)) {
    return inMemoryRuleSets.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_ACTION_RULESETS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporateActionPolicyRuleSet;
      inMemoryRuleSets.set(cleanId, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function resolveCorporateActionRuleSet(params: {
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  actionType: StatutoryCorporateActionType;
  policyVersionId?: string;
}): Promise<CorporateActionPolicyRuleSet | null> {
  const { legalEntityId, jurisdiction, actionType, policyVersionId } = params;

  // 1. Check in-memory rule sets
  const allRuleSets = Array.from(inMemoryRuleSets.values());
  const matched = allRuleSets.find(r => {
    const matchEntity = r.legalEntityId === legalEntityId || r.legalEntityId === 'ALL';
    const matchJurisdiction = r.jurisdiction === jurisdiction || (r.jurisdiction as string) === 'ALL';
    const matchType = r.actionType === actionType;
    const matchPolicy = policyVersionId ? r.policyVersionId === policyVersionId : true;
    return matchEntity && matchJurisdiction && matchType && matchPolicy;
  });

  if (matched) return matched;

  // 2. Query Firestore
  try {
    const collRef = collection(firestore, CORPORATE_ACTION_RULESETS_COLLECTION);
    const q = query(
      collRef,
      where('actionType', '==', actionType)
    );
    const snap = await getDocs(q);
    let bestMatch: CorporateActionPolicyRuleSet | null = null;
    snap.forEach(d => {
      const item = d.data() as CorporateActionPolicyRuleSet;
      inMemoryRuleSets.set(item.id, item);
      const matchEntity = item.legalEntityId === legalEntityId || item.legalEntityId === 'ALL';
      const matchJurisdiction = item.jurisdiction === jurisdiction || (item.jurisdiction as string) === 'ALL';
      const matchPolicy = policyVersionId ? item.policyVersionId === policyVersionId : true;
      if (matchEntity && matchJurisdiction && matchPolicy) {
        bestMatch = item;
      }
    });
    if (bestMatch) return bestMatch;
  } catch {
    // Fallback
  }

  return null;
}

// ============================================================================
// 3. CORPORATE ACTIONS
// ============================================================================

export async function saveCorporateAction(
  action: CorporateActionRecord,
  actorUserId: string
): Promise<CorporateActionRecord> {
  const cleanId = validateRequiredString(action.id, 'action.id');
  const now = new Date().toISOString();
  const record: CorporateActionRecord = {
    ...action,
    updatedAt: now
  };

  inMemoryCorporateActions.set(cleanId, record);

  try {
    const docRef = doc(firestore, CORPORATE_ACTIONS_COLLECTION, cleanId);
    await setDoc(docRef, record, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_CORPORATE_ACTION',
    entityType: 'CORPORATE_ACTION',
    entityId: cleanId,
    before: null,
    after: record as unknown as Record<string, unknown>,
    metadata: {
      actionNumber: record.actionNumber,
      actionType: record.actionType,
      legalEntityId: record.legalEntityId,
      status: record.status,
      policyVersionId: record.policyVersionId,
      accountableOwnerUserId: record.accountableOwnerUserId,
      authorizedExecutorUserId: record.authorizedExecutorUserId,
      idempotencyKey: record.idempotencyKey,
      correlationId: record.auditCorrelationId
    }
  });

  return record;
}

export async function getCorporateActionById(
  actionId: string
): Promise<CorporateActionRecord | null> {
  const cleanId = validateRequiredString(actionId, 'actionId');
  if (inMemoryCorporateActions.has(cleanId)) {
    return inMemoryCorporateActions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_ACTIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporateActionRecord;
      inMemoryCorporateActions.set(cleanId, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function getCorporateActionByIdempotencyKey(
  idempotencyKey: string
): Promise<CorporateActionRecord | null> {
  const cleanKey = validateRequiredString(idempotencyKey, 'idempotencyKey');

  for (const item of inMemoryCorporateActions.values()) {
    if (item.idempotencyKey === cleanKey) {
      return item;
    }
  }

  try {
    const collRef = collection(firestore, CORPORATE_ACTIONS_COLLECTION);
    const q = query(collRef, where('idempotencyKey', '==', cleanKey));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as CorporateActionRecord;
      inMemoryCorporateActions.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function listCorporateActionsByEntity(
  legalEntityId: string,
  filter?: {
    status?: CorporateActionRecord['status'];
    actionType?: CorporateActionRecord['actionType'];
  }
): Promise<CorporateActionRecord[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: CorporateActionRecord[] = [];

  Array.from(inMemoryCorporateActions.values()).forEach(item => {
    if (item.legalEntityId === cleanEntityId) {
      if (!filter?.status || item.status === filter.status) {
        if (!filter?.actionType || item.actionType === filter.actionType) {
          results.push(item);
        }
      }
    }
  });

  if (results.length > 0 || process.env.NODE_ENV === 'test') {
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  try {
    const collRef = collection(firestore, CORPORATE_ACTIONS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as CorporateActionRecord;
      if (!results.some(r => r.id === item.id)) {
        if (!filter?.status || item.status === filter.status) {
          if (!filter?.actionType || item.actionType === filter.actionType) {
            results.push(item);
          }
        }
        inMemoryCorporateActions.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteCorporateActionProhibited(
  actionId: string,
  actorUserId: string
): Promise<never> {
  await createAuditLog({
    actorUserId,
    action: 'DELETE_CORPORATE_ACTION_BLOCKED',
    entityType: 'CORPORATE_ACTION',
    entityId: actionId,
    before: null,
    after: null,
    metadata: {
      reason: 'STATUTORY_IMMUTABILITY_RULE: Statutory Corporate Actions are immutable and cannot be hard deleted.',
      severity: 'CRITICAL'
    }
  });

  throw new Error(`Statutory Immutability Violation: Corporate Action '${actionId}' cannot be deleted.`);
}

// ============================================================================
// 4. EXECUTION ATTEMPTS & EXTERNAL SUBMISSIONS
// ============================================================================

export async function saveCorporateActionExecutionAttempt(
  attempt: CorporateActionExecutionAttempt,
  actorUserId: string
): Promise<CorporateActionExecutionAttempt> {
  const cleanId = validateRequiredString(attempt.id, 'attempt.id');
  inMemoryAttempts.set(cleanId, attempt);

  try {
    const docRef = doc(firestore, CORPORATE_ACTION_ATTEMPTS_COLLECTION, cleanId);
    await setDoc(docRef, attempt, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_CORPORATE_ACTION_EXECUTION_ATTEMPT',
    entityType: 'CORPORATE_ACTION_ATTEMPT',
    entityId: cleanId,
    before: null,
    after: attempt as unknown as Record<string, unknown>,
    metadata: {
      attemptNumber: attempt.attemptNumber,
      corporateActionId: attempt.corporateActionId,
      status: attempt.status,
      idempotencyKey: attempt.idempotencyKey
    }
  });

  return attempt;
}

export async function listExecutionAttemptsByAction(
  corporateActionId: string
): Promise<CorporateActionExecutionAttempt[]> {
  const cleanActionId = validateRequiredString(corporateActionId, 'corporateActionId');
  const results: CorporateActionExecutionAttempt[] = [];

  Array.from(inMemoryAttempts.values()).forEach(item => {
    if (item.corporateActionId === cleanActionId) {
      results.push(item);
    }
  });

  try {
    const collRef = collection(firestore, CORPORATE_ACTION_ATTEMPTS_COLLECTION);
    const q = query(collRef, where('corporateActionId', '==', cleanActionId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as CorporateActionExecutionAttempt;
      if (!results.some(r => r.id === item.id)) {
        results.push(item);
        inMemoryAttempts.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => a.attemptNumber - b.attemptNumber);
}

export async function saveExternalSubmissionRecord(
  submission: ExternalSubmissionRecord,
  actorUserId: string
): Promise<ExternalSubmissionRecord> {
  const cleanId = validateRequiredString(submission.id, 'submission.id');
  inMemorySubmissions.set(cleanId, submission);

  try {
    const docRef = doc(firestore, EXTERNAL_SUBMISSIONS_COLLECTION, cleanId);
    await setDoc(docRef, submission, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_EXTERNAL_SUBMISSION_RECORD',
    entityType: 'EXTERNAL_SUBMISSION',
    entityId: cleanId,
    before: null,
    after: submission as unknown as Record<string, unknown>,
    metadata: {
      submissionNumber: submission.submissionNumber,
      corporateActionId: submission.corporateActionId,
      outcomeStatus: submission.outcomeStatus,
      receiptReference: submission.receiptReference
    }
  });

  return submission;
}

export async function listExternalSubmissionsByAction(
  corporateActionId: string
): Promise<ExternalSubmissionRecord[]> {
  const cleanActionId = validateRequiredString(corporateActionId, 'corporateActionId');
  const results: ExternalSubmissionRecord[] = [];

  Array.from(inMemorySubmissions.values()).forEach(item => {
    if (item.corporateActionId === cleanActionId) {
      results.push(item);
    }
  });

  try {
    const collRef = collection(firestore, EXTERNAL_SUBMISSIONS_COLLECTION);
    const q = query(collRef, where('corporateActionId', '==', cleanActionId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as ExternalSubmissionRecord;
      if (!results.some(r => r.id === item.id)) {
        results.push(item);
        inMemorySubmissions.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => new Date(b.submittedAtUtc).getTime() - new Date(a.submittedAtUtc).getTime());
}

// ============================================================================
// 5. REGISTER RECONCILIATIONS
// ============================================================================

export async function saveCorporateRegisterReconciliationRecord(
  rec: CorporateRegisterReconciliationRecord,
  actorUserId: string
): Promise<CorporateRegisterReconciliationRecord> {
  const cleanId = validateRequiredString(rec.id, 'rec.id');
  inMemoryReconciliations.set(cleanId, rec);

  try {
    const docRef = doc(firestore, REGISTER_RECONCILIATIONS_COLLECTION, cleanId);
    await setDoc(docRef, rec, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_REGISTER_RECONCILIATION_RECORD',
    entityType: 'REGISTER_RECONCILIATION',
    entityId: cleanId,
    before: null,
    after: rec as unknown as Record<string, unknown>,
    metadata: {
      reconciliationNumber: rec.reconciliationNumber,
      corporateActionId: rec.corporateActionId,
      registerType: rec.registerType,
      status: rec.status,
      governanceFindingId: rec.governanceFindingId
    }
  });

  return rec;
}

export async function listReconciliationRecordsByEntity(
  legalEntityId: string
): Promise<CorporateRegisterReconciliationRecord[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: CorporateRegisterReconciliationRecord[] = [];

  Array.from(inMemoryReconciliations.values()).forEach(item => {
    if (item.legalEntityId === cleanEntityId) {
      results.push(item);
    }
  });

  if (results.length > 0 || process.env.NODE_ENV === 'test') {
    return results.sort((a, b) => new Date(b.reconciledAtUtc).getTime() - new Date(a.reconciledAtUtc).getTime());
  }

  try {
    const collRef = collection(firestore, REGISTER_RECONCILIATIONS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as CorporateRegisterReconciliationRecord;
      if (!results.some(r => r.id === item.id)) {
        results.push(item);
        inMemoryReconciliations.set(item.id, item);
      }
    });
  } catch {
    // Fallback
  }

  return results.sort((a, b) => new Date(b.reconciledAtUtc).getTime() - new Date(a.reconciledAtUtc).getTime());
}
