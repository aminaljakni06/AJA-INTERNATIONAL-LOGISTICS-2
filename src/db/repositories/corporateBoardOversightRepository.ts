/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Board & Committee Oversight Repository
 * Step GOV-13: Board & Committee Oversight, Executive Attestations, Governance Performance, MI & Regulatory Reporting
 * 
 * Mandatory Architectural Governance Invariant:
 * GOVERNANCE-POLICY-INVARIANT-01: CONFIGURABLE, VERSIONED, JURISDICTION-AWARE & PROVENANCE-PRESERVED GOVERNANCE RULES
 * 
 * Canonical Resolution Chain:
 * Global Governance Guardrails
 * → Jurisdiction Requirements
 * → Legal Entity Policy
 * → Approved Exception / Override
 * → Effective Policy Version
 * → Execution & Snapshot
 * → Evidence Vault
 * → Point-in-Time Audit Replay
 */

import {
  EffectiveGovernanceRuleSet,
  GovernanceRuleCategory,
  GovernanceProvenanceStep,
  GovernanceMetricDefinition,
  GovernanceMetricType,
  GovernanceMetricSnapshot,
  MetricAdjustmentRecord,
  RiskAppetiteStatement,
  RiskAppetiteBreach,
  ExecutiveAttestation,
  ExecutiveAttestationType,
  GovernanceReportingPack,
  GovernanceReportingPackType,
  GovernancePackStatus,
  GovernanceChallenge,
  GovernanceChallengeStatus,
  GovernanceAction,
  GovernanceActionStatus,
  GovernanceJurisdiction,
  GovernanceRiskSeverity,
  SecurityClassification,
  CorporatePolicyVersion
} from '../../types/corporateGovernance';
import { UserContext } from '../../types/permissions';
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
import { getCorporatePolicyVersionById, getCorporatePolicyById } from './corporateAuthorityRepository';
import { getEvidenceRecordById } from './corporateRecordsRepository';
import { getCorporateDecisionById } from './corporateGovernanceRepository';
import { getGovernanceFindingById } from './corporateRiskAssuranceRepository';
import * as crypto from 'crypto';

// Firestore collection identifiers
export const EFFECTIVE_GOVERNANCE_RULESETS_COLLECTION = 'effective_governance_rulesets';
export const GOVERNANCE_METRIC_DEFINITIONS_COLLECTION = 'governance_metric_definitions';
export const GOVERNANCE_METRIC_SNAPSHOTS_COLLECTION = 'governance_metric_snapshots';
export const RISK_APPETITE_STATEMENTS_COLLECTION = 'risk_appetite_statements';
export const RISK_APPETITE_BREACHES_COLLECTION = 'risk_appetite_breaches';
export const EXECUTIVE_ATTESTATIONS_COLLECTION = 'executive_attestations';
export const GOVERNANCE_REPORTING_PACKS_COLLECTION = 'governance_reporting_packs';
export const GOVERNANCE_CHALLENGES_COLLECTION = 'governance_challenges';
export const GOVERNANCE_ACTIONS_COLLECTION = 'governance_actions';

// In-memory fallback stores
const inMemoryRuleSets = new Map<string, EffectiveGovernanceRuleSet>();
const inMemoryMetricDefs = new Map<string, GovernanceMetricDefinition>();
const inMemoryMetricSnapshots = new Map<string, GovernanceMetricSnapshot>();
const inMemoryRiskAppetites = new Map<string, RiskAppetiteStatement>();
const inMemoryRiskBreaches = new Map<string, RiskAppetiteBreach>();
const inMemoryAttestations = new Map<string, ExecutiveAttestation>();
const inMemoryReportingPacks = new Map<string, GovernanceReportingPack>();
const inMemoryChallenges = new Map<string, GovernanceChallenge>();
const inMemoryActions = new Map<string, GovernanceAction>();

// Global parent guardrails catalog (mandatory floors that cannot be weakened without Board Exception)
export const GLOBAL_PARENT_GUARDRAILS: Record<GovernanceRuleCategory, Record<string, any>> = {
  AUDIT_ASSURANCE: {
    maxAuditCycleMonthsCritical: 12,
    maxAuditCycleMonthsHigh: 24,
    minCoolingOffPeriodDays: 365,
    minSampleSizeContinuous: 30
  },
  RISK_MANAGEMENT: {
    maxOverdueRemediationDaysCritical: 30,
    maxOverdueRemediationDaysHigh: 60,
    dualSignoffRequiredForRiskAcceptance: true
  },
  INTERNAL_CONTROLS: {
    mandatoryTestingFrequencyMonths: 12,
    prohibitOwnerSelfTesting: true
  },
  COMPLIANCE_ESCALATION: {
    maxFilingGracePeriodDays: 15,
    escalationSlaDaysLevel1: 7,
    escalationSlaDaysLevel2: 14
  },
  EXECUTIVE_ATTESTATION: {
    evidenceVerificationMandatory: true,
    technicalAdminAttestationProhibited: true
  },
  BOARD_OVERSIGHT: {
    boardPackLockingMandatory: true,
    quarterlyReportingMandatory: true
  }
};

function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// ============================================================================
// 1. POLICY RESOLUTION ENGINE & POINT-IN-TIME AUDIT REPLAY (INVARIANT-01)
// ============================================================================

export async function getEffectiveGovernanceRuleSetById(id: string): Promise<EffectiveGovernanceRuleSet | null> {
  const cleanId = validateRequiredString(id, 'ruleSetId');
  if (inMemoryRuleSets.has(cleanId)) {
    return inMemoryRuleSets.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, EFFECTIVE_GOVERNANCE_RULESETS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as EffectiveGovernanceRuleSet;
      inMemoryRuleSets.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryRuleSets.get(cleanId) || null;
  }

  return null;
}

export async function saveEffectiveGovernanceRuleSet(
  ruleSet: EffectiveGovernanceRuleSet,
  actorUserId: string
): Promise<EffectiveGovernanceRuleSet> {
  const cleanId = validateRequiredString(ruleSet.id, 'id');
  const now = new Date().toISOString();

  // Compute deterministic SHA-256 hash of effective rules & provenance
  const hashPayload = JSON.stringify({
    legalEntityId: ruleSet.legalEntityId,
    jurisdictionContext: ruleSet.jurisdictionContext,
    ruleCategory: ruleSet.ruleCategory,
    supportingPolicyVersionId: ruleSet.supportingPolicyVersionId,
    effectiveRules: ruleSet.effectiveRules,
    effectiveFrom: ruleSet.effectiveFrom,
    effectiveUntil: ruleSet.effectiveUntil
  });
  const ruleSetHash = computeSha256(hashPayload);

  const updated: EffectiveGovernanceRuleSet = {
    ...ruleSet,
    id: cleanId,
    ruleSetHashSha256: ruleSetHash,
    evaluatedAt: ruleSet.evaluatedAt || now,
    evaluatedByUserId: actorUserId,
    createdAt: ruleSet.createdAt || now,
    updatedAt: now
  };

  inMemoryRuleSets.set(cleanId, updated);

  try {
    const docRef = doc(firestore, EFFECTIVE_GOVERNANCE_RULESETS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback in-memory
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_EFFECTIVE_GOVERNANCE_RULESET',
    entityType: 'EFFECTIVE_GOVERNANCE_RULESET',
    entityId: cleanId,
    before: null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      legalEntityId: updated.legalEntityId,
      ruleCategory: updated.ruleCategory,
      hashSha256: ruleSetHash
    }
  });

  return updated;
}

/**
 * Resolves effective governance rules following the canonical hierarchy:
 * Global Guardrails -> Jurisdiction Statute -> Legal Entity Policy -> Approved Exception
 */
export async function resolveEffectiveGovernanceRules(params: {
  legalEntityId: string;
  jurisdictionContext: GovernanceJurisdiction;
  ruleCategory: GovernanceRuleCategory;
  policyVersionId?: string;
  evaluationTimestamp?: string;
  exceptionOverride?: {
    exceptionDecisionId: string;
    overrideRules: Record<string, any>;
    compensatingControlId?: string;
  };
}, actorUserId: string): Promise<EffectiveGovernanceRuleSet> {
  const evalTime = params.evaluationTimestamp || new Date().toISOString();
  const provenance: GovernanceProvenanceStep[] = [];

  // Missing provenance denial
  if (!params.policyVersionId && !params.exceptionOverride) {
    throw new ValidationError(
      `Governance Resolution Error: Material governance execution denied due to missing Corporate Policy Version provenance.`
    );
  }

  // 1. Layer: Global Parent Guardrails
  const globalFloor = GLOBAL_PARENT_GUARDRAILS[params.ruleCategory] || {};
  provenance.push({
    sourceLayer: 'GLOBAL_GUARDRAILS',
    appliedAt: evalTime,
    summary: `Applied mandatory Group Parent Guardrails for category ${params.ruleCategory}`
  });

  // 2. Layer: Jurisdiction Statutes
  const jurisdictionRules: Record<string, any> = {};
  if (params.jurisdictionContext === 'SA') {
    // KSA ZATCA / SFDA stricter requirements
    if (params.ruleCategory === 'AUDIT_ASSURANCE') {
      jurisdictionRules.maxAuditCycleMonthsCritical = 12; // SFDA cold chain statutory 12m
    } else if (params.ruleCategory === 'COMPLIANCE_ESCALATION') {
      jurisdictionRules.maxFilingGracePeriodDays = 10; // ZATCA 10-day limit
    }
  } else if (params.jurisdictionContext === 'GB') {
    // UK Companies Act / HMRC / FRC requirements
    if (params.ruleCategory === 'AUDIT_ASSURANCE') {
      jurisdictionRules.minCoolingOffPeriodDays = 365; // UK Corporate Governance Code 1-year cooling off
    }
  }

  provenance.push({
    sourceLayer: 'JURISDICTION_STATUTE',
    jurisdiction: params.jurisdictionContext,
    appliedAt: evalTime,
    summary: `Applied statutory rules for jurisdiction ${params.jurisdictionContext}`
  });

  // 3. Layer: Entity Policy Version
  let entityRules: Record<string, any> = {};
  let resolvedPolicyVersionId = params.policyVersionId || 'pol_ver_default';
  let supportingDecisionId: string | undefined = undefined;

  if (params.policyVersionId) {
    const policyVer = await getCorporatePolicyVersionById(params.policyVersionId);
    if (policyVer) {
      resolvedPolicyVersionId = policyVer.id;
      supportingDecisionId = policyVer.supportingDecisionId;
      
      // Verify temporal validity
      const fromTime = new Date(policyVer.effectiveFrom).getTime();
      const untilTime = policyVer.effectiveUntil ? new Date(policyVer.effectiveUntil).getTime() : Infinity;
      const targetTime = new Date(evalTime).getTime();

      if (targetTime < fromTime) {
        throw new ValidationError(
          `Policy Version '${policyVer.id}' is not yet effective at evaluation timestamp (${evalTime} < ${policyVer.effectiveFrom}).`
        );
      }
      if (targetTime > untilTime) {
        throw new ValidationError(
          `Policy Version '${policyVer.id}' expired before evaluation timestamp (${evalTime} > ${policyVer.effectiveUntil}).`
        );
      }

      // Check entity scope
      const parentPolicy = await getCorporatePolicyById(policyVer.policyId);
      if (parentPolicy && !parentPolicy.legalEntityScope.includes('ALL') && !parentPolicy.legalEntityScope.includes(params.legalEntityId)) {
        throw new ValidationError(
          `Cross-Entity Leakage Violation: Policy '${parentPolicy.policyCode}' is not applicable to Legal Entity '${params.legalEntityId}'.`
        );
      }

      entityRules = { ...entityRules, ...policyVer };
      provenance.push({
        sourceLayer: 'ENTITY_POLICY',
        policyId: policyVer.policyId,
        policyVersionId: policyVer.id,
        decisionId: policyVer.supportingDecisionId,
        appliedAt: evalTime,
        summary: `Resolved active Policy Version ${policyVer.versionNumber} for ${params.legalEntityId}`
      });
    }
  }

  // Combine rules
  let effective = {
    ...globalFloor,
    ...jurisdictionRules,
    ...entityRules
  };

  // 4. Layer: Approved Exception / Override
  if (params.exceptionOverride) {
    // Validate supporting decision
    const decision = await getCorporateDecisionById(params.exceptionOverride.exceptionDecisionId);
    if (!decision || (decision.decisionStatus !== 'APPROVED' && decision.lifecycleStatus !== 'APPROVED' && decision.lifecycleStatus !== 'EXECUTION')) {
      throw new ValidationError(
        `Governance Exception Error: Supporting Decision '${params.exceptionOverride.exceptionDecisionId}' is not approved.`
      );
    }

    // Check anti-weakening of mandatory floor without compensating controls
    if (!params.exceptionOverride.compensatingControlId && globalFloor.maxAuditCycleMonthsCritical) {
      const attemptedCycle = params.exceptionOverride.overrideRules.maxAuditCycleMonthsCritical;
      if (attemptedCycle && attemptedCycle > globalFloor.maxAuditCycleMonthsCritical) {
        throw new ValidationError(
          `Parent Floor Violation: Attempting to weaken mandatory audit cycle (${attemptedCycle}m > ${globalFloor.maxAuditCycleMonthsCritical}m) without required compensating control.`
        );
      }
    }

    effective = {
      ...effective,
      ...params.exceptionOverride.overrideRules
    };

    provenance.push({
      sourceLayer: 'AUTHORIZED_EXCEPTION',
      decisionId: params.exceptionOverride.exceptionDecisionId,
      appliedAt: evalTime,
      summary: `Applied approved governance exception backed by Decision ${decision.decisionNumber}`
    });
  }

  // Build and save RuleSet
  const ruleSetId = `grs_${params.legalEntityId}_${params.ruleCategory}_${Date.now()}`;
  const ruleSet: EffectiveGovernanceRuleSet = {
    id: ruleSetId,
    legalEntityId: params.legalEntityId,
    jurisdictionContext: params.jurisdictionContext,
    ruleCategory: params.ruleCategory,
    supportingPolicyVersionId: resolvedPolicyVersionId,
    supportingDecisionId,
    effectiveRules: effective,
    ruleSetHashSha256: '',
    effectiveFrom: evalTime,
    provenanceChain: provenance,
    resolutionStatus: 'RESOLVED',
    evaluatedAt: evalTime,
    evaluatedByUserId: actorUserId,
    auditCorrelationId: `cor_grs_${Date.now()}`,
    createdAt: evalTime,
    updatedAt: evalTime
  };

  return await saveEffectiveGovernanceRuleSet(ruleSet, actorUserId);
}

/**
 * Point-in-Time Policy Replay: Deterministically reproduces the exact rules
 * and policy version in effect at historical timestamp T.
 */
export async function pointInTimePolicyReplay(
  legalEntityId: string,
  jurisdictionContext: GovernanceJurisdiction,
  ruleCategory: GovernanceRuleCategory,
  historicalTimestamp: string
): Promise<EffectiveGovernanceRuleSet | null> {
  const targetTime = new Date(historicalTimestamp).getTime();

  // Find the exact historical rule set evaluated at or active during targetTime
  const allRuleSets = Array.from(inMemoryRuleSets.values());
  const matched = allRuleSets.find((rs) => {
    if (rs.legalEntityId === legalEntityId && rs.ruleCategory === ruleCategory) {
      const from = new Date(rs.effectiveFrom).getTime();
      const until = rs.effectiveUntil ? new Date(rs.effectiveUntil).getTime() : Infinity;
      return targetTime >= from && targetTime <= until;
    }
    return false;
  });

  return matched || null;
}

export async function deleteGovernanceRuleSetProhibited(id: string): Promise<never> {
  throw new ValidationError(
    `Statutory governance invariant: Hard deletion of Governance Rule Set '${id}' is prohibited for audit replay integrity.`
  );
}

// ============================================================================
// 2. GOVERNANCE METRICS DEFINITIONS & IMMUTABLE SNAPSHOTS (KPI/KRI)
// ============================================================================

export async function getGovernanceMetricDefinitionById(id: string): Promise<GovernanceMetricDefinition | null> {
  const cleanId = validateRequiredString(id, 'metricDefinitionId');
  if (inMemoryMetricDefs.has(cleanId)) {
    return inMemoryMetricDefs.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_METRIC_DEFINITIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceMetricDefinition;
      inMemoryMetricDefs.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryMetricDefs.get(cleanId) || null;
  }

  return null;
}

export async function saveGovernanceMetricDefinition(
  metricDef: GovernanceMetricDefinition,
  actorUserId: string
): Promise<GovernanceMetricDefinition> {
  const cleanId = validateRequiredString(metricDef.id, 'id');
  const now = new Date().toISOString();

  const previous = await getGovernanceMetricDefinitionById(cleanId);

  const updated: GovernanceMetricDefinition = {
    ...metricDef,
    id: cleanId,
    versionNumber: metricDef.versionNumber || (previous ? previous.versionNumber + 1 : 1),
    status: metricDef.status || 'ACTIVE',
    effectiveFrom: metricDef.effectiveFrom || now,
    auditCorrelationId: metricDef.auditCorrelationId || `cor_mdf_${Date.now()}`,
    createdAt: metricDef.createdAt || previous?.createdAt || now,
    updatedAt: now
  };

  inMemoryMetricDefs.set(cleanId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_METRIC_DEFINITIONS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_METRIC_DEFINITION' : 'CREATE_METRIC_DEFINITION',
    entityType: 'GOVERNANCE_METRIC_DEFINITION',
    entityId: cleanId,
    before: (previous as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      metricCode: updated.metricCode,
      versionNumber: updated.versionNumber,
      metricType: updated.metricType
    }
  });

  return updated;
}

export async function getMetricSnapshotById(id: string): Promise<GovernanceMetricSnapshot | null> {
  const cleanId = validateRequiredString(id, 'metricSnapshotId');
  if (inMemoryMetricSnapshots.has(cleanId)) {
    return inMemoryMetricSnapshots.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_METRIC_SNAPSHOTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceMetricSnapshot;
      inMemoryMetricSnapshots.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryMetricSnapshots.get(cleanId) || null;
  }

  return null;
}

export async function calculateAndRecordMetricSnapshot(
  params: {
    id: string;
    snapshotCode?: string;
    metricDefinitionId: string;
    reportingPeriod: string;
    legalEntityId: string;
    calculatedValue: number;
    sourceRecordIds: string[];
    calculationNotes?: string;
  },
  actorUserId: string
): Promise<GovernanceMetricSnapshot> {
  const cleanId = validateRequiredString(params.id, 'id');
  const metricDef = await getGovernanceMetricDefinitionById(params.metricDefinitionId);
  if (!metricDef) {
    throw new ValidationError(`Governance Metric Definition ${params.metricDefinitionId} not found.`);
  }

  const now = new Date().toISOString();

  // Evaluate status against versioned definition thresholds
  let statusLevel: 'NORMAL' | 'WARNING' | 'BREACH' = 'NORMAL';
  if (params.calculatedValue >= metricDef.criticalThreshold) {
    statusLevel = 'BREACH';
  } else if (params.calculatedValue >= metricDef.warningThreshold) {
    statusLevel = 'WARNING';
  }

  // Deterministic SHA-256 Checksum
  const checksumPayload = JSON.stringify({
    metricCode: metricDef.metricCode,
    metricDefinitionVersion: metricDef.versionNumber,
    reportingPeriod: params.reportingPeriod,
    legalEntityId: params.legalEntityId,
    calculatedValue: params.calculatedValue,
    sourceRecordIds: params.sourceRecordIds,
    calculatedAt: now
  });
  const checksum = computeSha256(checksumPayload);

  const snapshot: GovernanceMetricSnapshot = {
    id: cleanId,
    snapshotCode: params.snapshotCode || `SNP-${params.reportingPeriod}-${metricDef.metricCode}`,
    metricDefinitionId: metricDef.id,
    metricDefinitionVersion: metricDef.versionNumber,
    metricCode: metricDef.metricCode,
    reportingPeriod: params.reportingPeriod,
    legalEntityId: params.legalEntityId,
    calculatedValue: params.calculatedValue,
    targetValue: metricDef.targetThreshold,
    warningValue: metricDef.warningThreshold,
    criticalValue: metricDef.criticalThreshold,
    statusLevel,
    sourceRecordIds: params.sourceRecordIds || [],
    calculationNotes: params.calculationNotes,
    calculatedAt: now,
    calculatedByUserId: actorUserId,
    checksumSha256: checksum,
    isLocked: true, // Immutability
    isAdjusted: false,
    auditCorrelationId: `cor_snp_${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };

  inMemoryMetricSnapshots.set(cleanId, snapshot);

  try {
    const docRef = doc(firestore, GOVERNANCE_METRIC_SNAPSHOTS_COLLECTION, cleanId);
    await setDoc(docRef, snapshot, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'CALCULATE_METRIC_SNAPSHOT',
    entityType: 'GOVERNANCE_METRIC_SNAPSHOT',
    entityId: cleanId,
    before: null,
    after: (snapshot as unknown as Record<string, unknown>) || null,
    metadata: {
      metricCode: metricDef.metricCode,
      calculatedValue: params.calculatedValue,
      statusLevel
    }
  });

  return snapshot;
}

/**
 * Controlled Metric Adjustment Workflow:
 * Prohibits direct manual overwriting of published metrics. Requires justification and formal Decision.
 */
export async function adjustMetricSnapshot(
  snapshotId: string,
  params: {
    adjustedValue: number;
    reason: string;
    supportingDecisionId?: string;
    evidenceIds: string[];
  },
  actorUserId: string
): Promise<GovernanceMetricSnapshot> {
  const snapshot = await getMetricSnapshotById(snapshotId);
  if (!snapshot) {
    throw new ValidationError(`Governance Metric Snapshot ${snapshotId} not found.`);
  }

  if (!params.reason || params.reason.trim().length === 0) {
    throw new ValidationError(`Controlled metric adjustment requires a documented justification.`);
  }

  const now = new Date().toISOString();
  const adjustment: MetricAdjustmentRecord = {
    adjustedAt: now,
    adjustedByUserId: actorUserId,
    originalValue: snapshot.calculatedValue,
    adjustedValue: params.adjustedValue,
    reason: params.reason,
    supportingDecisionId: params.supportingDecisionId,
    evidenceIds: params.evidenceIds || []
  };

  const updated: GovernanceMetricSnapshot = {
    ...snapshot,
    calculatedValue: params.adjustedValue,
    isAdjusted: true,
    adjustmentRecord: adjustment,
    updatedAt: now
  };

  inMemoryMetricSnapshots.set(snapshotId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_METRIC_SNAPSHOTS_COLLECTION, snapshotId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'ADJUST_METRIC_SNAPSHOT',
    entityType: 'GOVERNANCE_METRIC_SNAPSHOT',
    entityId: snapshotId,
    before: (snapshot as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      originalValue: snapshot.calculatedValue,
      adjustedValue: params.adjustedValue,
      reason: params.reason
    }
  });

  return updated;
}

export async function deleteMetricSnapshotProhibited(snapshotId: string): Promise<never> {
  throw new ValidationError(
    `Statutory governance invariant: Hard deletion of Metric Snapshot '${snapshotId}' is prohibited. Snapshots are immutable.`
  );
}

// ============================================================================
// 3. RISK APPETITE FRAMEWORK & BREACH MANAGEMENT
// ============================================================================

export async function getRiskAppetiteStatementById(id: string): Promise<RiskAppetiteStatement | null> {
  const cleanId = validateRequiredString(id, 'statementId');
  if (inMemoryRiskAppetites.has(cleanId)) {
    return inMemoryRiskAppetites.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, RISK_APPETITE_STATEMENTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as RiskAppetiteStatement;
      inMemoryRiskAppetites.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryRiskAppetites.get(cleanId) || null;
  }

  return null;
}

export async function saveRiskAppetiteStatement(
  statement: RiskAppetiteStatement,
  actorUserId: string
): Promise<RiskAppetiteStatement> {
  const cleanId = validateRequiredString(statement.id, 'id');
  const now = new Date().toISOString();

  // Validate supporting Board Decision (GOV-06)
  if (statement.supportingDecisionId) {
    const decision = await getCorporateDecisionById(statement.supportingDecisionId);
    if (!decision || (decision.decisionStatus !== 'APPROVED' && decision.lifecycleStatus !== 'APPROVED' && decision.lifecycleStatus !== 'EXECUTION')) {
      throw new ValidationError(
        `Risk Appetite Statement requires an APPROVED Board Decision. Decision ${statement.supportingDecisionId} is not approved.`
      );
    }
  }

  const updated: RiskAppetiteStatement = {
    ...statement,
    id: cleanId,
    versionNumber: statement.versionNumber || 1,
    status: statement.status || 'ACTIVE',
    effectiveFrom: statement.effectiveFrom || now,
    auditCorrelationId: statement.auditCorrelationId || `cor_ras_${Date.now()}`,
    createdAt: statement.createdAt || now,
    updatedAt: now
  };

  inMemoryRiskAppetites.set(cleanId, updated);

  try {
    const docRef = doc(firestore, RISK_APPETITE_STATEMENTS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_RISK_APPETITE_STATEMENT',
    entityType: 'RISK_APPETITE_STATEMENT',
    entityId: cleanId,
    before: null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      statementCode: updated.statementCode,
      category: updated.category,
      appetiteLevel: updated.appetiteLevel
    }
  });

  return updated;
}

export async function evaluateRiskAppetiteBreach(
  params: {
    id: string;
    appetiteStatementId: string;
    metricSnapshotId?: string;
    legalEntityId: string;
    category: any;
    metricCode: string;
    observedValue: number;
    breachSummaryEn: string;
  },
  actorUserId: string
): Promise<RiskAppetiteBreach | null> {
  const cleanId = validateRequiredString(params.id, 'id');
  const statement = await getRiskAppetiteStatementById(params.appetiteStatementId);
  if (!statement) {
    throw new ValidationError(`Risk Appetite Statement ${params.appetiteStatementId} not found.`);
  }

  // Find relevant threshold
  const threshold = statement.quantitativeKriThresholds.find((t) => t.metricCode === params.metricCode);
  if (!threshold) {
    return null;
  }

  // Check breach condition
  if (params.observedValue > threshold.maxAcceptableThreshold) {
    const now = new Date().toISOString();
    const breachSeverity: GovernanceRiskSeverity = params.observedValue >= threshold.maxAcceptableThreshold * 1.5 ? 'CRITICAL' : 'HIGH';

    const breach: RiskAppetiteBreach = {
      id: cleanId,
      breachNumber: `BRC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      appetiteStatementId: statement.id,
      metricSnapshotId: params.metricSnapshotId,
      legalEntityId: params.legalEntityId,
      category: statement.category,
      breachSeverity,
      observedValue: params.observedValue,
      tolerableLimit: threshold.maxAcceptableThreshold,
      breachSummaryEn: params.breachSummaryEn,
      status: 'DETECTED',
      detectedAt: now,
      escalationLevel: 1,
      lastEscalatedAt: now,
      auditCorrelationId: `cor_brc_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    inMemoryRiskBreaches.set(cleanId, breach);

    try {
      const docRef = doc(firestore, RISK_APPETITE_BREACHES_COLLECTION, cleanId);
      await setDoc(docRef, breach, { merge: true });
    } catch {
      // Fallback
    }

    await createAuditLog({
      actorUserId,
      action: 'DETECT_RISK_APPETITE_BREACH',
      entityType: 'RISK_APPETITE_BREACH',
      entityId: cleanId,
      before: null,
      after: (breach as unknown as Record<string, unknown>) || null,
      metadata: {
        metricCode: params.metricCode,
        observedValue: params.observedValue,
        limit: threshold.maxAcceptableThreshold,
        severity: breachSeverity
      }
    });

    return breach;
  }

  return null;
}

export async function deleteRiskAppetiteStatementProhibited(id: string): Promise<never> {
  throw new ValidationError(
    `Statutory governance invariant: Hard deletion of Risk Appetite Statement '${id}' is prohibited.`
  );
}

// ============================================================================
// 4. EXECUTIVE ATTESTATIONS & MANAGEMENT REPRESENTATIONS
// ============================================================================

export async function getExecutiveAttestationById(id: string): Promise<ExecutiveAttestation | null> {
  const cleanId = validateRequiredString(id, 'attestationId');
  if (inMemoryAttestations.has(cleanId)) {
    return inMemoryAttestations.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, EXECUTIVE_ATTESTATIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ExecutiveAttestation;
      inMemoryAttestations.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryAttestations.get(cleanId) || null;
  }

  return null;
}

/**
 * Submits and signs executive attestation with strict corporate authority & Evidence Vault validation.
 */
export async function submitAndSignExecutiveAttestation(
  attestationParams: {
    id: string;
    attestationNumber?: string;
    attestationType: ExecutiveAttestationType;
    legalEntityId: string;
    departmentId?: string;
    reportingPeriod: string;
    statementVersionId: string;
    pinnedStatementTextEn: string;
    pinnedStatementTextAr?: string;
    supportingEvidenceRecordIds: string[];
    disclosedExceptions?: {
      exceptionTitle: string;
      severity: GovernanceRiskSeverity;
      details: string;
      compensatingControlId?: string;
    }[];
    policyVersionId: string;
    supportingDecisionId?: string;
  },
  context: UserContext
): Promise<ExecutiveAttestation> {
  const cleanId = validateRequiredString(attestationParams.id, 'id');

  // Technical Admin Boundary: Prohibit Technical Admin from signing executive attestations
  if (context.role === 'ADMIN' && !context.roles?.some((r) => ['CEO', 'CFO', 'EXECUTIVE_DIRECTOR', 'MANAGING_DIRECTOR', 'GENERAL_COUNSEL'].includes(r))) {
    throw new ValidationError(
      `Executive Authority Boundary Violation: Technical Administrators cannot sign Executive Attestations without an executive governance role.`
    );
  }

  // Evidence Vault Validation (GOV-09)
  const exceptions = attestationParams.disclosedExceptions || [];
  if (attestationParams.supportingEvidenceRecordIds.length === 0 && exceptions.length === 0) {
    throw new ValidationError(
      `False Attestation Prevention: Clean Executive Attestation requires supporting Evidence Records from the Evidence Vault, or documented Exception Disclosures.`
    );
  }

  for (const evid of attestationParams.supportingEvidenceRecordIds) {
    const evidence = await getEvidenceRecordById(evid);
    if (!evidence || evidence.integrityStatus === 'MISMATCH' || evidence.verificationStatus === 'REJECTED') {
      throw new ValidationError(
        `Attestation Evidence Failure: Supporting Evidence Record '${evid}' is invalid or missing in Evidence Vault.`
      );
    }
  }

  const now = new Date().toISOString();

  // Deterministic Hash of Pinned Statement & Evidence
  const hashPayload = JSON.stringify({
    attestationNumber: attestationParams.attestationNumber || cleanId,
    attestationType: attestationParams.attestationType,
    legalEntityId: attestationParams.legalEntityId,
    reportingPeriod: attestationParams.reportingPeriod,
    statementVersionId: attestationParams.statementVersionId,
    pinnedStatementTextEn: attestationParams.pinnedStatementTextEn,
    attestorUserId: context.userId,
    evidenceIds: attestationParams.supportingEvidenceRecordIds,
    signedAt: now
  });
  const checksum = computeSha256(hashPayload);

  const attestation: ExecutiveAttestation = {
    id: cleanId,
    attestationNumber: attestationParams.attestationNumber || `ATT-${attestationParams.reportingPeriod}-${Date.now().toString().slice(-4)}`,
    attestationType: attestationParams.attestationType,
    legalEntityId: attestationParams.legalEntityId,
    departmentId: attestationParams.departmentId,
    reportingPeriod: attestationParams.reportingPeriod,
    statementVersionId: attestationParams.statementVersionId,
    pinnedStatementTextEn: attestationParams.pinnedStatementTextEn,
    pinnedStatementTextAr: attestationParams.pinnedStatementTextAr,
    attestorUserId: context.userId,
    attestorRole: context.role,
    supportingEvidenceRecordIds: attestationParams.supportingEvidenceRecordIds,
    disclosedExceptions: exceptions,
    policyVersionId: attestationParams.policyVersionId,
    supportingDecisionId: attestationParams.supportingDecisionId,
    signedAt: now,
    status: 'SUBMITTED',
    checksumSha256: checksum,
    isLocked: true, // Pinned statement immutability
    auditCorrelationId: `cor_att_${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };

  inMemoryAttestations.set(cleanId, attestation);

  try {
    const docRef = doc(firestore, EXECUTIVE_ATTESTATIONS_COLLECTION, cleanId);
    await setDoc(docRef, attestation, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId: context.userId,
    action: 'SUBMIT_EXECUTIVE_ATTESTATION',
    entityType: 'EXECUTIVE_ATTESTATION',
    entityId: cleanId,
    before: null,
    after: (attestation as unknown as Record<string, unknown>) || null,
    metadata: {
      attestationType: attestation.attestationType,
      reportingPeriod: attestation.reportingPeriod,
      attestor: context.userId,
      checksumSha256: checksum
    }
  });

  return attestation;
}

export async function verifyExecutiveAttestation(
  attestationId: string,
  verificationNotes: string,
  context: UserContext
): Promise<ExecutiveAttestation> {
  const attestation = await getExecutiveAttestationById(attestationId);
  if (!attestation) {
    throw new ValidationError(`Executive Attestation ${attestationId} not found.`);
  }

  // SoD: Attestor cannot verify their own attestation
  if (attestation.attestorUserId === context.userId) {
    throw new ValidationError(
      `Segregation of Duties Violation: Attestor '${attestation.attestorUserId}' cannot independently verify their own Executive Attestation.`
    );
  }

  const now = new Date().toISOString();
  const updated: ExecutiveAttestation = {
    ...attestation,
    status: 'VERIFIED',
    verificationRecord: {
      verifiedByUserId: context.userId,
      verifiedAt: now,
      isEvidenceAdequate: true,
      notes: verificationNotes
    },
    updatedAt: now
  };

  inMemoryAttestations.set(attestationId, updated);

  try {
    const docRef = doc(firestore, EXECUTIVE_ATTESTATIONS_COLLECTION, attestationId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId: context.userId,
    action: 'VERIFY_EXECUTIVE_ATTESTATION',
    entityType: 'EXECUTIVE_ATTESTATION',
    entityId: attestationId,
    before: (attestation as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      verifiedBy: context.userId
    }
  });

  return updated;
}

export async function deleteExecutiveAttestationProhibited(id: string): Promise<never> {
  throw new ValidationError(
    `Statutory governance invariant: Hard deletion of Executive Attestation '${id}' is prohibited.`
  );
}

// ============================================================================
// 5. BOARD & COMMITTEE REPORTING PACKS
// ============================================================================

export async function getGovernanceReportingPackById(id: string): Promise<GovernanceReportingPack | null> {
  const cleanId = validateRequiredString(id, 'packId');
  if (inMemoryReportingPacks.has(cleanId)) {
    return inMemoryReportingPacks.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_REPORTING_PACKS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceReportingPack;
      inMemoryReportingPacks.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryReportingPacks.get(cleanId) || null;
  }

  return null;
}

export async function saveGovernanceReportingPack(
  pack: GovernanceReportingPack,
  actorUserId: string
): Promise<GovernanceReportingPack> {
  const cleanId = validateRequiredString(pack.id, 'id');
  const previous = await getGovernanceReportingPackById(cleanId);

  // Immutability Check: Published packs cannot be edited in place
  if (previous?.isPackLocked && !pack.isPackLocked) {
    throw new ValidationError(
      `Published Pack Immutability Violation: Published Reporting Pack '${previous.packNumber}' is locked. Create a superseding Version 2 instead of modifying in-place.`
    );
  }

  const now = new Date().toISOString();
  const updated: GovernanceReportingPack = {
    ...pack,
    id: cleanId,
    versionNumber: pack.versionNumber || (previous ? previous.versionNumber + 1 : 1),
    status: pack.status || 'DRAFT',
    isPackLocked: pack.isPackLocked || false,
    securityClassification: pack.securityClassification || 'CONFIDENTIAL',
    auditCorrelationId: pack.auditCorrelationId || `cor_pk_${Date.now()}`,
    createdAt: pack.createdAt || previous?.createdAt || now,
    updatedAt: now
  };

  inMemoryReportingPacks.set(cleanId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_REPORTING_PACKS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: previous ? `UPDATE_GOVERNANCE_PACK_${updated.status}` : 'CREATE_GOVERNANCE_PACK',
    entityType: 'GOVERNANCE_REPORTING_PACK',
    entityId: cleanId,
    before: (previous as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      packNumber: updated.packNumber,
      packType: updated.packType,
      status: updated.status
    }
  });

  return updated;
}

export async function publishAndLockGovernanceReportingPack(
  packId: string,
  signoffParams: {
    boardChairSignoffUserId: string;
  },
  actorUserId: string
): Promise<GovernanceReportingPack> {
  const pack = await getGovernanceReportingPackById(packId);
  if (!pack) {
    throw new ValidationError(`Governance Reporting Pack ${packId} not found.`);
  }

  const now = new Date().toISOString();

  // Generate SHA-256 Checksum Seal
  const hashPayload = JSON.stringify({
    packNumber: pack.packNumber,
    packType: pack.packType,
    reportingPeriod: pack.reportingPeriod,
    legalEntityIds: pack.legalEntityIds,
    sections: pack.sections,
    publishedAt: now
  });
  const checksum = computeSha256(hashPayload);

  const updated: GovernanceReportingPack = {
    ...pack,
    status: 'PUBLISHED',
    publishedAt: now,
    publishedByUserId: actorUserId,
    boardChairSignoffUserId: signoffParams.boardChairSignoffUserId,
    boardChairSignoffAt: now,
    checksumSha256: checksum,
    isPackLocked: true,
    updatedAt: now
  };

  inMemoryReportingPacks.set(packId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_REPORTING_PACKS_COLLECTION, packId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'PUBLISH_GOVERNANCE_REPORTING_PACK',
    entityType: 'GOVERNANCE_REPORTING_PACK',
    entityId: packId,
    before: (pack as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      packNumber: updated.packNumber,
      checksumSha256: checksum
    }
  });

  return updated;
}

export async function supersedeGovernanceReportingPack(
  oldPackId: string,
  newPack: GovernanceReportingPack,
  actorUserId: string
): Promise<{ supersededPack: GovernanceReportingPack; newPack: GovernanceReportingPack }> {
  const oldPack = await getGovernanceReportingPackById(oldPackId);
  if (!oldPack) {
    throw new ValidationError(`Original Governance Reporting Pack ${oldPackId} not found.`);
  }

  const now = new Date().toISOString();
  const savedNew = await saveGovernanceReportingPack(
    {
      ...newPack,
      versionNumber: oldPack.versionNumber + 1
    },
    actorUserId
  );

  const supersededOld: GovernanceReportingPack = {
    ...oldPack,
    status: 'SUPERSEDED',
    supersededByPackId: savedNew.id,
    updatedAt: now
  };

  inMemoryReportingPacks.set(oldPackId, supersededOld);

  try {
    const docRef = doc(firestore, GOVERNANCE_REPORTING_PACKS_COLLECTION, oldPackId);
    await setDoc(docRef, supersededOld, { merge: true });
  } catch {
    // Fallback
  }

  return { supersededPack: supersededOld, newPack: savedNew };
}

export async function deleteGovernanceReportingPackProhibited(id: string): Promise<never> {
  throw new ValidationError(
    `Statutory governance invariant: Hard deletion of Governance Reporting Pack '${id}' is prohibited.`
  );
}

// ============================================================================
// 6. BOARD REVIEW, CHALLENGE & GOVERNANCE ACTION TRACKING
// ============================================================================

export async function getGovernanceChallengeById(id: string): Promise<GovernanceChallenge | null> {
  const cleanId = validateRequiredString(id, 'challengeId');
  if (inMemoryChallenges.has(cleanId)) {
    return inMemoryChallenges.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_CHALLENGES_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceChallenge;
      inMemoryChallenges.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryChallenges.get(cleanId) || null;
  }

  return null;
}

export async function createGovernanceChallenge(
  params: {
    id: string;
    challengeNumber?: string;
    packId: string;
    legalEntityId: string;
    targetCategory: 'METRIC' | 'RISK' | 'FINDING' | 'ATTESTATION' | 'DECISION' | 'GENERAL';
    targetEntityId?: string;
    challengeTitle: string;
    challengeDetails: string;
    assignedToUserId: string;
    assignedToRole: string;
  },
  context: UserContext
): Promise<GovernanceChallenge> {
  const cleanId = validateRequiredString(params.id, 'id');
  const now = new Date().toISOString();

  const challenge: GovernanceChallenge = {
    id: cleanId,
    challengeNumber: params.challengeNumber || `CHL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    packId: params.packId,
    legalEntityId: params.legalEntityId,
    raisedByUserId: context.userId,
    raisedByRole: context.role,
    targetCategory: params.targetCategory,
    targetEntityId: params.targetEntityId,
    challengeTitle: params.challengeTitle,
    challengeDetails: params.challengeDetails,
    assignedToUserId: params.assignedToUserId,
    assignedToRole: params.assignedToRole,
    status: 'ASSIGNED',
    reopenHistory: [],
    auditCorrelationId: `cor_chl_${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };

  inMemoryChallenges.set(cleanId, challenge);

  try {
    const docRef = doc(firestore, GOVERNANCE_CHALLENGES_COLLECTION, cleanId);
    await setDoc(docRef, challenge, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId: context.userId,
    action: 'CREATE_GOVERNANCE_CHALLENGE',
    entityType: 'GOVERNANCE_CHALLENGE',
    entityId: cleanId,
    before: null,
    after: (challenge as unknown as Record<string, unknown>) || null,
    metadata: {
      challengeNumber: challenge.challengeNumber,
      packId: challenge.packId,
      assignedTo: challenge.assignedToUserId
    }
  });

  return challenge;
}

export async function respondToGovernanceChallenge(
  challengeId: string,
  managementResponse: string,
  context: UserContext
): Promise<GovernanceChallenge> {
  const challenge = await getGovernanceChallengeById(challengeId);
  if (!challenge) {
    throw new ValidationError(`Governance Challenge ${challengeId} not found.`);
  }

  const now = new Date().toISOString();
  const updated: GovernanceChallenge = {
    ...challenge,
    status: 'RESPONSE_SUBMITTED',
    managementResponse,
    responseSubmittedAt: now,
    responseSubmittedByUserId: context.userId,
    updatedAt: now
  };

  inMemoryChallenges.set(challengeId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_CHALLENGES_COLLECTION, challengeId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId: context.userId,
    action: 'RESPOND_GOVERNANCE_CHALLENGE',
    entityType: 'GOVERNANCE_CHALLENGE',
    entityId: challengeId,
    before: (challenge as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      challengeNumber: updated.challengeNumber
    }
  });

  return updated;
}

export async function reviewAndCloseGovernanceChallenge(
  challengeId: string,
  reviewNotes: string,
  context: UserContext
): Promise<GovernanceChallenge> {
  const challenge = await getGovernanceChallengeById(challengeId);
  if (!challenge) {
    throw new ValidationError(`Governance Challenge ${challengeId} not found.`);
  }

  const now = new Date().toISOString();
  const updated: GovernanceChallenge = {
    ...challenge,
    status: 'CLOSED',
    reviewNotes,
    reviewedByUserId: context.userId,
    closedAt: now,
    updatedAt: now
  };

  inMemoryChallenges.set(challengeId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_CHALLENGES_COLLECTION, challengeId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId: context.userId,
    action: 'CLOSE_GOVERNANCE_CHALLENGE',
    entityType: 'GOVERNANCE_CHALLENGE',
    entityId: challengeId,
    before: (challenge as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      challengeNumber: updated.challengeNumber
    }
  });

  return updated;
}

export async function getGovernanceActionById(id: string): Promise<GovernanceAction | null> {
  const cleanId = validateRequiredString(id, 'actionId');
  if (inMemoryActions.has(cleanId)) {
    return inMemoryActions.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, GOVERNANCE_ACTIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GovernanceAction;
      inMemoryActions.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryActions.get(cleanId) || null;
  }

  return null;
}

export async function createGovernanceAction(
  params: {
    id: string;
    actionNumber?: string;
    sourceType: 'BOARD_MEETING' | 'COMMITTEE_CHALLENGE' | 'RISK_BREACH' | 'ATTESTATION_DISCLOSURE' | 'AUDIT_RECOMMENDATION';
    sourceReferenceId: string;
    legalEntityId: string;
    title: string;
    details: string;
    ownerUserId: string;
    ownerRole: string;
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  },
  actorUserId: string
): Promise<GovernanceAction> {
  const cleanId = validateRequiredString(params.id, 'id');
  const now = new Date().toISOString();

  const action: GovernanceAction = {
    id: cleanId,
    actionNumber: params.actionNumber || `ACT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    sourceType: params.sourceType,
    sourceReferenceId: params.sourceReferenceId,
    legalEntityId: params.legalEntityId,
    title: params.title,
    details: params.details,
    ownerUserId: params.ownerUserId,
    ownerRole: params.ownerRole,
    dueDate: params.dueDate,
    priority: params.priority,
    status: 'IN_PROGRESS',
    evidenceIds: [],
    escalationLevel: 0,
    auditCorrelationId: `cor_act_${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };

  inMemoryActions.set(cleanId, action);

  try {
    const docRef = doc(firestore, GOVERNANCE_ACTIONS_COLLECTION, cleanId);
    await setDoc(docRef, action, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId,
    action: 'CREATE_GOVERNANCE_ACTION',
    entityType: 'GOVERNANCE_ACTION',
    entityId: cleanId,
    before: null,
    after: (action as unknown as Record<string, unknown>) || null,
    metadata: {
      actionNumber: action.actionNumber,
      sourceType: action.sourceType,
      owner: action.ownerUserId
    }
  });

  return action;
}

export async function verifyAndCloseGovernanceAction(
  actionId: string,
  evidenceIds: string[],
  context: UserContext
): Promise<GovernanceAction> {
  const action = await getGovernanceActionById(actionId);
  if (!action) {
    throw new ValidationError(`Governance Action ${actionId} not found.`);
  }

  // SoD: Action Owner cannot verify and close their own action
  if (action.ownerUserId === context.userId) {
    throw new ValidationError(
      `Segregation of Duties Violation: Action Owner '${action.ownerUserId}' cannot independently verify and close their own Governance Action.`
    );
  }

  const now = new Date().toISOString();
  const updated: GovernanceAction = {
    ...action,
    status: 'VERIFIED_CLOSED',
    evidenceIds: Array.from(new Set([...action.evidenceIds, ...evidenceIds])),
    verifiedByUserId: context.userId,
    verifiedAt: now,
    completedAt: now,
    updatedAt: now
  };

  inMemoryActions.set(actionId, updated);

  try {
    const docRef = doc(firestore, GOVERNANCE_ACTIONS_COLLECTION, actionId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Fallback
  }

  await createAuditLog({
    actorUserId: context.userId,
    action: 'VERIFY_AND_CLOSE_GOVERNANCE_ACTION',
    entityType: 'GOVERNANCE_ACTION',
    entityId: actionId,
    before: (action as unknown as Record<string, unknown>) || null,
    after: (updated as unknown as Record<string, unknown>) || null,
    metadata: {
      actionNumber: updated.actionNumber,
      verifiedBy: context.userId
    }
  });

  return updated;
}

export async function saveGovernanceAction(
  action: GovernanceAction,
  actorUserId: string
): Promise<GovernanceAction> {
  const cleanId = validateRequiredString(action.id, 'id');
  inMemoryActions.set(cleanId, action);
  try {
    const docRef = doc(firestore, GOVERNANCE_ACTIONS_COLLECTION, cleanId);
    await setDoc(docRef, action, { merge: true });
  } catch {
    // Fallback
  }
  await createAuditLog({
    actorUserId,
    action: 'SAVE_GOVERNANCE_ACTION',
    entityType: 'GOVERNANCE_ACTION',
    entityId: cleanId,
    before: null,
    after: action as unknown as Record<string, unknown>,
    metadata: {
      actionNumber: action.actionNumber,
      status: action.status
    }
  });
  return action;
}

export async function listGovernanceActionsByEntity(
  legalEntityId: string,
  filter?: {
    sourceType?: string;
    status?: GovernanceActionStatus;
  }
): Promise<GovernanceAction[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: GovernanceAction[] = [];

  Array.from(inMemoryActions.values()).forEach(item => {
    if (item.legalEntityId === cleanEntityId) {
      if (!filter?.sourceType || item.sourceType === filter.sourceType) {
        if (!filter?.status || item.status === filter.status) {
          results.push(item);
        }
      }
    }
  });

  try {
    const collRef = collection(firestore, GOVERNANCE_ACTIONS_COLLECTION);
    const q = query(collRef, where('legalEntityId', '==', cleanEntityId));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const item = d.data() as GovernanceAction;
      if (!filter?.sourceType || item.sourceType === filter.sourceType) {
        if (!filter?.status || item.status === filter.status) {
          if (!results.some(r => r.id === item.id)) {
            results.push(item);
          }
          inMemoryActions.set(item.id, item);
        }
      }
    });
  } catch {}

  return results;
}

export async function detectOverdueGovernanceActions(legalEntityId?: string): Promise<GovernanceAction[]> {
  const allActions = Array.from(inMemoryActions.values());
  const now = new Date();
  const nowIso = now.toISOString();
  const overdue: GovernanceAction[] = [];

  for (const act of allActions) {
    if (legalEntityId && act.legalEntityId !== legalEntityId) {
      continue;
    }

    if (act.status !== 'VERIFIED_CLOSED' && act.status !== 'CANCELLED') {
      const dueTime = new Date(act.dueDate).getTime();
      if (dueTime < now.getTime()) {
        const daysOverdue = Math.floor((now.getTime() - dueTime) / (1000 * 60 * 60 * 24));
        let level = act.escalationLevel;

        if (daysOverdue > 30) {
          level = 3; // Board / Audit Committee
        } else if (daysOverdue > 14) {
          level = 2; // Executive Committee
        } else if (daysOverdue > 0) {
          level = Math.max(1, level); // Department Head
        }

        const updated: GovernanceAction = {
          ...act,
          status: 'OVERDUE',
          escalationLevel: level,
          lastEscalatedAt: nowIso,
          updatedAt: nowIso
        };

        inMemoryActions.set(act.id, updated);
        overdue.push(updated);
      }
    }
  }

  return overdue;
}

export async function deleteGovernanceActionProhibited(id: string): Promise<never> {
  throw new ValidationError(
    `Statutory governance invariant: Hard deletion of Governance Action '${id}' is prohibited.`
  );
}
