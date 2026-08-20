/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Authority, Policies, DoA & PoA Repository
 * Step GOV-10: Enterprise Policies, Internal Controls, Delegation of Authority, Financial Authority Matrix & Power of Attorney
 * 
 * Architecture & Governance Features:
 * - Dual-layer persistence: Firestore with typed fallback in-memory stores for ultra-fast and resilient lookups
 * - Statutory Scoping: Scoped queries by Legal Entity, Department, and Role
 * - Historical Preservation: Hard delete strictly prohibited by corporate governance invariants
 * - Comprehensive Audit Logging: Every mutation correlated with immutable audit events
 */

import {
  CorporatePolicy,
  CorporatePolicyVersion,
  InternalControl,
  DelegationOfAuthority,
  FinancialApprovalMatrixRule,
  PowerOfAttorney,
  FinancialTransactionType,
  GovernancePolicyCategory
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

// Firestore collection names
export const CORPORATE_POLICIES_COLLECTION = 'corporate_policies';
export const CORPORATE_POLICY_VERSIONS_COLLECTION = 'corporate_policy_versions';
export const INTERNAL_CONTROLS_COLLECTION = 'internal_controls';
export const DELEGATIONS_OF_AUTHORITY_COLLECTION = 'delegations_of_authority';
export const FINANCIAL_AUTHORITY_RULES_COLLECTION = 'financial_authority_rules';
export const POWERS_OF_ATTORNEY_COLLECTION = 'powers_of_attorney';

// In-Memory Fallback Stores
const inMemoryPolicies = new Map<string, CorporatePolicy>();
const inMemoryPolicyVersions = new Map<string, CorporatePolicyVersion>();
const inMemoryControls = new Map<string, InternalControl>();
const inMemoryDelegations = new Map<string, DelegationOfAuthority>();
const inMemoryAuthorityRules = new Map<string, FinancialApprovalMatrixRule>();
const inMemoryPoAs = new Map<string, PowerOfAttorney>();

function safePersistDoc(collectionName: string, id: string, data: any): void {
  try {
    const docRef = doc(firestore, collectionName, id);
    setDoc(docRef, data, { merge: true }).catch(() => {});
  } catch {
    // Retain in memory store
  }
}

/**
 * Reset memory stores (for automated test suite isolation)
 */
export function resetCorporateAuthorityMemoryStore(): void {
  inMemoryPolicies.clear();
  inMemoryPolicyVersions.clear();
  inMemoryControls.clear();
  inMemoryDelegations.clear();
  inMemoryAuthorityRules.clear();
  inMemoryPoAs.clear();
}

// ============================================================================
// 1. CORPORATE POLICIES & POLICY VERSIONS
// ============================================================================

export async function getCorporatePolicyById(policyId: string): Promise<CorporatePolicy | null> {
  const cleanId = validateRequiredString(policyId, 'policyId');
  if (inMemoryPolicies.has(cleanId)) {
    return inMemoryPolicies.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_POLICIES_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporatePolicy;
      inMemoryPolicies.set(cleanId, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return inMemoryPolicies.get(cleanId) || null;
}

export async function getCorporatePolicyByCode(policyCode: string): Promise<CorporatePolicy | null> {
  const cleanCode = validateRequiredString(policyCode, 'policyCode').toUpperCase();
  for (const policy of inMemoryPolicies.values()) {
    if (policy.policyCode.toUpperCase() === cleanCode) {
      return policy;
    }
  }

  try {
    const q = query(
      collection(firestore, CORPORATE_POLICIES_COLLECTION),
      where('policyCode', '==', cleanCode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as CorporatePolicy;
      inMemoryPolicies.set(data.id, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return null;
}

export async function getCorporatePolicies(filter?: {
  legalEntityId?: string;
  category?: GovernancePolicyCategory;
  lifecycleStatus?: string;
}): Promise<CorporatePolicy[]> {
  const results: CorporatePolicy[] = [];

  for (const policy of inMemoryPolicies.values()) {
    if (filter?.category && policy.category !== filter.category) {
      continue;
    }
    if (filter?.lifecycleStatus && policy.lifecycleStatus !== filter.lifecycleStatus) {
      continue;
    }
    if (filter?.legalEntityId) {
      const matchesScope = 
        policy.legalEntityScope.includes('ALL') || 
        policy.legalEntityScope.includes(filter.legalEntityId);
      if (!matchesScope) {
        continue;
      }
    }
    results.push(policy);
  }

  return results;
}

export async function saveCorporatePolicy(
  policy: CorporatePolicy,
  actorUserId: string
): Promise<CorporatePolicy> {
  const cleanId = validateRequiredString(policy.id, 'id');
  const cleanCode = validateRequiredString(policy.policyCode, 'policyCode').toUpperCase();
  const now = new Date().toISOString();

  const previous = inMemoryPolicies.get(cleanId);
  const updated: CorporatePolicy = {
    ...policy,
    id: cleanId,
    policyCode: cleanCode,
    updatedAt: now,
    createdAt: policy.createdAt || previous?.createdAt || now
  };

  inMemoryPolicies.set(cleanId, updated);
  safePersistDoc(CORPORATE_POLICIES_COLLECTION, cleanId, updated);

  await createAuditLog({
    actorUserId,
    action: previous ? `UPDATE_CORPORATE_POLICY_${updated.lifecycleStatus}` : 'CREATE_CORPORATE_POLICY',
    entityType: 'CORPORATE_POLICY',
    entityId: cleanId,
    metadata: {
      policyCode: updated.policyCode,
      category: updated.category,
      activeVersionNumber: updated.activeVersionNumber,
      lifecycleStatus: updated.lifecycleStatus,
      classificationClearance: updated.classificationClearance
    }
  });

  return updated;
}

export async function getCorporatePolicyVersionById(versionId: string): Promise<CorporatePolicyVersion | null> {
  const cleanId = validateRequiredString(versionId, 'versionId');
  if (inMemoryPolicyVersions.has(cleanId)) {
    return inMemoryPolicyVersions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, CORPORATE_POLICY_VERSIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CorporatePolicyVersion;
      inMemoryPolicyVersions.set(cleanId, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return inMemoryPolicyVersions.get(cleanId) || null;
}

export async function getCorporatePolicyVersions(policyId: string): Promise<CorporatePolicyVersion[]> {
  const cleanPolicyId = validateRequiredString(policyId, 'policyId');
  const results: CorporatePolicyVersion[] = [];

  for (const version of inMemoryPolicyVersions.values()) {
    if (version.policyId === cleanPolicyId) {
      results.push(version);
    }
  }

  return results.sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function saveCorporatePolicyVersion(
  version: CorporatePolicyVersion,
  actorUserId: string
): Promise<CorporatePolicyVersion> {
  const cleanId = validateRequiredString(version.id, 'id');
  const cleanPolicyId = validateRequiredString(version.policyId, 'policyId');
  const now = new Date().toISOString();

  const previous = inMemoryPolicyVersions.get(cleanId);
  const updated: CorporatePolicyVersion = {
    ...version,
    id: cleanId,
    policyId: cleanPolicyId,
    updatedAt: now,
    createdAt: version.createdAt || previous?.createdAt || now
  };

  inMemoryPolicyVersions.set(cleanId, updated);
  safePersistDoc(CORPORATE_POLICY_VERSIONS_COLLECTION, cleanId, updated);

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_CORPORATE_POLICY_VERSION' : 'CREATE_CORPORATE_POLICY_VERSION',
    entityType: 'CORPORATE_POLICY_VERSION',
    entityId: cleanId,
    metadata: {
      policyId: updated.policyId,
      versionNumber: updated.versionNumber,
      supportingDecisionId: updated.supportingDecisionId,
      effectiveFrom: updated.effectiveFrom,
      effectiveUntil: updated.effectiveUntil
    }
  });

  return updated;
}

// ============================================================================
// 2. INTERNAL CONTROLS
// ============================================================================

export async function getInternalControlById(controlId: string): Promise<InternalControl | null> {
  const cleanId = validateRequiredString(controlId, 'controlId');
  if (inMemoryControls.has(cleanId)) {
    return inMemoryControls.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, INTERNAL_CONTROLS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as InternalControl;
      inMemoryControls.set(cleanId, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return inMemoryControls.get(cleanId) || null;
}

export async function getInternalControlByCode(controlCode: string): Promise<InternalControl | null> {
  const cleanCode = validateRequiredString(controlCode, 'controlCode').toUpperCase();
  for (const control of inMemoryControls.values()) {
    if (control.controlCode.toUpperCase() === cleanCode) {
      return control;
    }
  }

  return null;
}

export async function getInternalControls(filter?: {
  legalEntityId?: string;
  policyId?: string;
  status?: string;
  controlType?: string;
}): Promise<InternalControl[]> {
  const results: InternalControl[] = [];

  for (const control of inMemoryControls.values()) {
    if (filter?.legalEntityId && control.legalEntityId !== filter.legalEntityId) {
      continue;
    }
    if (filter?.policyId && control.policyId !== filter.policyId) {
      continue;
    }
    if (filter?.status && control.status !== filter.status) {
      continue;
    }
    if (filter?.controlType && control.controlType !== filter.controlType) {
      continue;
    }
    results.push(control);
  }

  return results;
}

export async function saveInternalControl(
  control: InternalControl,
  actorUserId: string
): Promise<InternalControl> {
  const cleanId = validateRequiredString(control.id, 'id');
  const cleanEntityId = validateRequiredString(control.legalEntityId, 'legalEntityId');
  const cleanCode = validateRequiredString(control.controlCode, 'controlCode').toUpperCase();
  const now = new Date().toISOString();

  const previous = inMemoryControls.get(cleanId);
  const updated: InternalControl = {
    ...control,
    id: cleanId,
    controlCode: cleanCode,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: control.createdAt || previous?.createdAt || now
  };

  inMemoryControls.set(cleanId, updated);
  safePersistDoc(INTERNAL_CONTROLS_COLLECTION, cleanId, updated);

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_INTERNAL_CONTROL' : 'CREATE_INTERNAL_CONTROL',
    entityType: 'INTERNAL_CONTROL',
    entityId: cleanId,
    metadata: {
      controlCode: updated.controlCode,
      legalEntityId: cleanEntityId,
      controlType: updated.controlType,
      frequency: updated.frequency,
      operatingEffectiveness: updated.operatingEffectiveness,
      status: updated.status
    }
  });

  return updated;
}

// ============================================================================
// 3. DELEGATION OF AUTHORITY (DoA)
// ============================================================================

export async function getDelegationById(delegationId: string): Promise<DelegationOfAuthority | null> {
  const cleanId = validateRequiredString(delegationId, 'delegationId');
  if (inMemoryDelegations.has(cleanId)) {
    return inMemoryDelegations.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, DELEGATIONS_OF_AUTHORITY_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DelegationOfAuthority;
      inMemoryDelegations.set(cleanId, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return inMemoryDelegations.get(cleanId) || null;
}

export async function getDelegations(filter?: {
  legalEntityId?: string;
  delegateUserId?: string;
  delegatorUserId?: string;
  status?: string;
}): Promise<DelegationOfAuthority[]> {
  const results: DelegationOfAuthority[] = [];

  for (const delegation of inMemoryDelegations.values()) {
    if (filter?.legalEntityId && delegation.legalEntityId !== filter.legalEntityId) {
      continue;
    }
    if (filter?.delegateUserId && delegation.delegateUserId !== filter.delegateUserId) {
      continue;
    }
    if (filter?.delegatorUserId && delegation.delegatorUserId !== filter.delegatorUserId) {
      continue;
    }
    if (filter?.status && delegation.status !== filter.status) {
      continue;
    }
    results.push(delegation);
  }

  return results;
}

export async function getActiveDelegationsForUser(
  delegateUserId: string,
  legalEntityId?: string
): Promise<DelegationOfAuthority[]> {
  const cleanUserId = validateRequiredString(delegateUserId, 'delegateUserId');
  const now = new Date().toISOString();
  const results: DelegationOfAuthority[] = [];

  for (const delegation of inMemoryDelegations.values()) {
    if (delegation.delegateUserId !== cleanUserId) {
      continue;
    }
    if (delegation.status !== 'ACTIVE') {
      continue;
    }
    if (legalEntityId && delegation.legalEntityId !== legalEntityId) {
      continue;
    }
    // Check expiration boundary
    if (delegation.effectiveUntil && delegation.effectiveUntil < now) {
      // Auto-expired
      continue;
    }
    if (delegation.effectiveFrom && delegation.effectiveFrom > now) {
      // Not yet active
      continue;
    }
    results.push(delegation);
  }

  return results;
}

export async function saveDelegation(
  delegation: DelegationOfAuthority,
  actorUserId: string
): Promise<DelegationOfAuthority> {
  const cleanId = validateRequiredString(delegation.id, 'id');
  const cleanEntityId = validateRequiredString(delegation.legalEntityId, 'legalEntityId');
  const cleanDelegate = validateRequiredString(delegation.delegateUserId, 'delegateUserId');
  const cleanDelegator = validateRequiredString(delegation.delegatorUserId, 'delegatorUserId');
  const now = new Date().toISOString();

  const previous = inMemoryDelegations.get(cleanId);
  const updated: DelegationOfAuthority = {
    ...delegation,
    id: cleanId,
    legalEntityId: cleanEntityId,
    delegateUserId: cleanDelegate,
    delegatorUserId: cleanDelegator,
    updatedAt: now,
    createdAt: delegation.createdAt || previous?.createdAt || now
  };

  inMemoryDelegations.set(cleanId, updated);
  safePersistDoc(DELEGATIONS_OF_AUTHORITY_COLLECTION, cleanId, updated);

  await createAuditLog({
    actorUserId,
    action: previous ? `TRANSITION_DELEGATION_${updated.status}` : 'GRANT_DELEGATION_OF_AUTHORITY',
    entityType: 'DELEGATION_OF_AUTHORITY',
    entityId: cleanId,
    metadata: {
      delegationNumber: updated.delegationNumber,
      legalEntityId: cleanEntityId,
      delegatorUserId: cleanDelegator,
      delegateUserId: cleanDelegate,
      authorityType: updated.authorityType,
      amountLimit: updated.amountLimit,
      currency: updated.currency,
      status: updated.status,
      effectiveFrom: updated.effectiveFrom,
      effectiveUntil: updated.effectiveUntil,
      isSubDelegationAllowed: updated.isSubDelegationAllowed
    }
  });

  return updated;
}

// ============================================================================
// 4. FINANCIAL AUTHORITY MATRIX RULES
// ============================================================================

export async function getFinancialAuthorityRuleById(ruleId: string): Promise<FinancialApprovalMatrixRule | null> {
  const cleanId = validateRequiredString(ruleId, 'ruleId');
  if (inMemoryAuthorityRules.has(cleanId)) {
    return inMemoryAuthorityRules.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, FINANCIAL_AUTHORITY_RULES_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as FinancialApprovalMatrixRule;
      inMemoryAuthorityRules.set(cleanId, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return inMemoryAuthorityRules.get(cleanId) || null;
}

export async function getFinancialAuthorityRules(filter?: {
  legalEntityId?: string;
  departmentId?: string;
  transactionType?: FinancialTransactionType;
  status?: string;
}): Promise<FinancialApprovalMatrixRule[]> {
  const results: FinancialApprovalMatrixRule[] = [];

  for (const rule of inMemoryAuthorityRules.values()) {
    if (filter?.transactionType && rule.transactionType !== filter.transactionType) {
      continue;
    }
    if (filter?.status && rule.status !== filter.status) {
      continue;
    }
    if (filter?.legalEntityId) {
      const matchesEntity = rule.legalEntityId === 'GLOBAL' || rule.legalEntityId === filter.legalEntityId;
      if (!matchesEntity) {
        continue;
      }
    }
    if (filter?.departmentId && rule.departmentId && rule.departmentId !== 'ALL') {
      if (rule.departmentId !== filter.departmentId) {
        continue;
      }
    }
    results.push(rule);
  }

  return results.sort((a, b) => (a.tierLevel || 1) - (b.tierLevel || 1));
}

export async function saveFinancialAuthorityRule(
  rule: FinancialApprovalMatrixRule,
  actorUserId: string
): Promise<FinancialApprovalMatrixRule> {
  const cleanId = validateRequiredString(rule.id, 'id');
  const cleanEntityId = validateRequiredString(rule.legalEntityId, 'legalEntityId');
  const cleanCode = rule.ruleCode 
    ? validateRequiredString(rule.ruleCode, 'ruleCode').toUpperCase()
    : `FAM-${cleanId.toUpperCase()}`;
  const now = new Date().toISOString();

  const previous = inMemoryAuthorityRules.get(cleanId);
  const updated: FinancialApprovalMatrixRule = {
    ...rule,
    id: cleanId,
    ruleCode: cleanCode,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: rule.createdAt || previous?.createdAt || now
  };

  inMemoryAuthorityRules.set(cleanId, updated);
  safePersistDoc(FINANCIAL_AUTHORITY_RULES_COLLECTION, cleanId, updated);

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_FINANCIAL_AUTHORITY_RULE' : 'CREATE_FINANCIAL_AUTHORITY_RULE',
    entityType: 'FINANCIAL_AUTHORITY_RULE',
    entityId: cleanId,
    metadata: {
      ruleCode: updated.ruleCode,
      legalEntityId: cleanEntityId,
      transactionType: updated.transactionType,
      tierLevel: updated.tierLevel,
      minAmount: updated.minAmount,
      maxAmount: updated.maxAmount,
      currency: updated.currency,
      requiredAuthorityRole: updated.requiredAuthorityRole,
      dualApprovalRequired: updated.dualApprovalRequired,
      status: updated.status
    }
  });

  return updated;
}

// ============================================================================
// 5. POWER OF ATTORNEY (PoA)
// ============================================================================

export async function getPowerOfAttorneyById(poaId: string): Promise<PowerOfAttorney | null> {
  const cleanId = validateRequiredString(poaId, 'poaId');
  if (inMemoryPoAs.has(cleanId)) {
    return inMemoryPoAs.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, POWERS_OF_ATTORNEY_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PowerOfAttorney;
      inMemoryPoAs.set(cleanId, data);
      return data;
    }
  } catch {
    // Retain in memory
  }

  return inMemoryPoAs.get(cleanId) || null;
}

export async function getPowerOfAttorneyByNumber(poaNumber: string): Promise<PowerOfAttorney | null> {
  const cleanNumber = validateRequiredString(poaNumber, 'poaNumber').toUpperCase();
  for (const poa of inMemoryPoAs.values()) {
    if (poa.poaNumber.toUpperCase() === cleanNumber) {
      return poa;
    }
  }

  return null;
}

export async function getPowersOfAttorney(filter?: {
  legalEntityId?: string;
  granteeUserId?: string;
  status?: string;
  scopeCategory?: string;
}): Promise<PowerOfAttorney[]> {
  const results: PowerOfAttorney[] = [];

  for (const poa of inMemoryPoAs.values()) {
    if (filter?.legalEntityId && poa.legalEntityId !== filter.legalEntityId) {
      continue;
    }
    if (filter?.granteeUserId && poa.granteeUserId !== filter.granteeUserId) {
      continue;
    }
    if (filter?.status && poa.status !== filter.status) {
      continue;
    }
    if (filter?.scopeCategory && poa.scopeCategory !== filter.scopeCategory) {
      continue;
    }
    results.push(poa);
  }

  return results;
}

export async function savePowerOfAttorney(
  poa: PowerOfAttorney,
  actorUserId: string
): Promise<PowerOfAttorney> {
  const cleanId = validateRequiredString(poa.id, 'id');
  const cleanEntityId = validateRequiredString(poa.legalEntityId, 'legalEntityId');
  const cleanNumber = validateRequiredString(poa.poaNumber, 'poaNumber').toUpperCase();
  const now = new Date().toISOString();

  const previous = inMemoryPoAs.get(cleanId);
  const updated: PowerOfAttorney = {
    ...poa,
    id: cleanId,
    poaNumber: cleanNumber,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: poa.createdAt || previous?.createdAt || now
  };

  inMemoryPoAs.set(cleanId, updated);
  safePersistDoc(POWERS_OF_ATTORNEY_COLLECTION, cleanId, updated);

  await createAuditLog({
    actorUserId,
    action: previous ? `TRANSITION_POWER_OF_ATTORNEY_${updated.status}` : 'ISSUE_POWER_OF_ATTORNEY',
    entityType: 'POWER_OF_ATTORNEY',
    entityId: cleanId,
    metadata: {
      poaNumber: updated.poaNumber,
      legalEntityId: cleanEntityId,
      grantorType: updated.grantorType,
      granteeType: updated.granteeType,
      scopeCategory: updated.scopeCategory,
      validFrom: updated.validFrom,
      validUntil: updated.validUntil,
      status: updated.status,
      evidenceRecordId: updated.evidenceRecordId
    }
  });

  return updated;
}

// ============================================================================
// 6. STATUTORY PROHIBITED HARD-DELETE ENFORCEMENT
// ============================================================================

/**
 * Strict Security Invariant: Hard deletes on statutory policies, internal controls,
 * delegations of authority, financial matrices, and powers of attorney are strictly PROHIBITED.
 */
export async function deleteCorporateAuthorityRecordProhibited(
  recordType: 'POLICY' | 'POLICY_VERSION' | 'CONTROL' | 'DELEGATION' | 'AUTHORITY_RULE' | 'POWER_OF_ATTORNEY',
  recordId: string,
  actorUserId: string
): Promise<never> {
  await createAuditLog({
    actorUserId,
    action: 'UNAUTHORIZED_HARD_DELETE_ATTEMPT_BLOCKED',
    entityType: recordType,
    entityId: recordId,
    metadata: {
      violation: 'Corporate governance statutory rules prohibit hard deletion of governance authority records'
    }
  });

  throw new ValidationError(
    `Hard deletion of corporate governance ${recordType} records (${recordId}) is strictly prohibited. Transition record to REVOKED, EXPIRED, ARCHIVED, or SUPERSEDED.`
  );
}
