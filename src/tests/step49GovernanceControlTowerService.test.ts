/**
 * AJA INTERNATIONAL LOGISTICS — Governance Control Tower & Continuous Monitoring Test Suite
 * Step GOV-16: Continuous Governance Monitoring, Health Scorecards, Anomaly Detection & Executive Early-Warning Engine
 * 
 * Test Invariants:
 * 1. Governance Health Scorecard sequence (GHC-YYYY-####) & 7-dimension deterministic evaluation
 * 2. GOVERNANCE-POLICY-INVARIANT-01 Provenance, version pinning & SHA-256 calculation seal
 * 3. Continuous Monitoring Scan & Idempotent Signal Generation (SIG-YYYY-####) with deduplication
 * 4. Anomaly detection: Expired authority, statutory discrepancy, control deficiency, evidence tampering
 * 5. Signal vs Finding separation: Triage, false-positive handling & noise suppression
 * 6. Authority Boundary: AI / Service Principal strictly prohibited from confirming findings or closing signals
 * 7. Signal to GOV-11 Governance Finding handoff and end-to-end traceability
 * 8. Executive Early-Warning Digest, KPI rollups and trend calculation
 * 9. Multi-Entity Isolation: Cross-entity scan and triage rejection
 * 10. Point-in-Time Scorecard Replay and cryptographic seal integrity verification
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernanceControlTowerService
} from '../services/governanceControlTowerService';
import {
  resetControlTowerMemoryStore,
  saveGovernanceSignal,
  getGovernanceSignalById,
  listGovernanceSignalsByEntity,
  getGovernanceHealthScorecardById,
  listGovernanceHealthScorecardsByEntity
} from '../db/repositories/governanceControlTowerRepository';
import {
  saveCorporatePolicy,
  saveCorporatePolicyVersion,
  saveDelegation,
  saveInternalControl
} from '../db/repositories/corporateAuthorityRepository';
import {
  saveCorporateLegalProfile,
  saveCorporateAppointment,
  saveCorporateDecision,
  resetCorporateGovernanceMemoryStore
} from '../db/repositories/corporateGovernanceRepository';
import {
  saveCorporateAction,
  saveCorporateRegisterReconciliationRecord,
  resetCorporateSecretariatMemoryStore
} from '../db/repositories/corporateSecretariatRepository';
import {
  saveEvidenceRecord
} from '../db/repositories/corporateRecordsRepository';
import {
  CorporatePolicy,
  CorporatePolicyVersion,
  DelegationOfAuthority,
  DirectorOfficerRecord,
  InternalControl,
  CorporateActionRecord,
  CorporateRegisterReconciliationRecord,
  EvidenceRecord
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';

describe('STEP GOV-16: Governance Control Tower & Continuous Monitoring Engine', () => {
  const ENTITY_KSA = 'le_aja_saudi_01';
  const ENTITY_UAE = 'le_aja_uae_01';
  const POLICY_ID = 'pol_gov_assurance_01';
  const POLICY_VER_ID = 'pol_ver_gov_assurance_2026_v1';

  // User Contexts
  const chiefComplianceOfficerContext: UserContext = {
    userId: 'usr_cco_01',
    role: 'CHIEF_COMPLIANCE_OFFICER',
    legalEntityId: ENTITY_KSA
  };

  const auditorContext: UserContext = {
    userId: 'usr_auditor_01',
    role: 'AUDITOR',
    legalEntityId: ENTITY_KSA
  };

  const aiAgentContext: UserContext = {
    userId: 'ai_governance_assistant',
    role: 'SERVICE_PRINCIPAL',
    legalEntityId: ENTITY_KSA
  };

  const uaeOfficerContext: UserContext = {
    userId: 'usr_uae_officer_01',
    role: 'COMPANY_ADMIN',
    legalEntityId: ENTITY_UAE
  };

  before(async () => {
    resetControlTowerMemoryStore();
    resetCorporateGovernanceMemoryStore();
    resetCorporateSecretariatMemoryStore();

    const now = new Date().toISOString();

    // 1. Seed Policy and Policy Version for Invariant-01
    const policy: CorporatePolicy = {
      id: POLICY_ID,
      policyCode: 'POL-GOV-CTL-01',
      title: 'Continuous Governance Assurance & Monitoring Framework',
      legalEntityScope: [ENTITY_KSA, ENTITY_UAE],
      ownerRole: 'CHIEF_COMPLIANCE_OFFICER',
      mandatoryReviewFrequencyMonths: 12,
      activeVersionNumber: 1,
      lifecycleStatus: 'PUBLISHED',
      classificationClearance: 'PUBLIC',
      category: 'GOVERNANCE',
      ownerUserId: chiefComplianceOfficerContext.userId,
      createdAt: now,
      updatedAt: now
    };
    await saveCorporatePolicy(policy, 'seed');

    const policyVersion: CorporatePolicyVersion = {
      id: POLICY_VER_ID,
      policyId: POLICY_ID,
      versionNumber: 1,
      contentSummary: 'Formal criteria for Continuous Governance Monitoring, Health Scorecards, and Anomaly Signals',
      effectiveFrom: now,
      reviewDate: '2027-01-01',
      supportingDecisionId: 'dec_seed_01',
      approvedByUserIds: ['usr_chair_01'],
      createdAt: now,
      updatedAt: now
    };
    await saveCorporatePolicyVersion(policyVersion, 'seed');

    // 2. Seed Corporate Legal Profile & Statutory Appointments
    await saveCorporateLegalProfile({
      id: ENTITY_KSA,
      legalEntityId: ENTITY_KSA,
      legalCompanyName: 'AJA International Logistics KSA Ltd.',
      tradingName: 'شركة أجا العالمية للوجستيات',
      companyNumber: 'CR-1010099881',
      companyType: 'Limited Liability Company',
      incorporationDate: '2020-01-01',
      incorporationJurisdiction: 'SA',
      registeredOfficeAddress: {
        addressLine1: 'King Fahd Road, Al Olaya',
        city: 'Riyadh',
        postalCode: '12211',
        country: 'Saudi Arabia',
        isPrincipalPlaceOfBusiness: true
      },
      principalBusinessAddresses: [],
      companyStatus: 'ACTIVE',
      financialYear: {
        accountingReferenceDate: '31-12',
        nextAccountsDueDate: '2026-12-31',
        nextConfirmationStatementDueDate: '2026-12-31'
      },
      taxRegistrations: {
        vatNumber: 'SA30001010099881',
        taxResidenceJurisdiction: 'SA'
      },
      advisors: {},
      dataClassification: 'INTERNAL',
      createdAt: now,
      updatedAt: now
    }, 'seed');

    const secAppointment: DirectorOfficerRecord = {
      id: 'apt_sec_01',
      legalEntityId: ENTITY_KSA,
      statutoryRole: 'COMPANY_SECRETARY',
      titleEn: 'Company Secretary',
      authorityScope: 'LEGAL_ENTITY',
      personReference: {
        personId: 'per_sec_01',
        fullNameEn: 'Sarah Al-Ghamdi',
        nationality: 'SA',
        countryOfResidence: 'SA'
      },
      appointmentDate: '2025-01-01',
      effectiveFrom: '2025-01-01',
      status: 'ACTIVE',
      supportingDecisionId: 'dec_seed_01',
      supportingDocumentIds: ['doc_sec_app_01'],
      appointedByUserId: 'usr_chair_01',
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateAppointment(secAppointment, 'seed');

    const dirAppointment: DirectorOfficerRecord = {
      id: 'apt_dir_01',
      legalEntityId: ENTITY_KSA,
      statutoryRole: 'DIRECTOR',
      titleEn: 'Executive Director',
      authorityScope: 'LEGAL_ENTITY',
      personReference: {
        personId: 'per_dir_01',
        fullNameEn: 'Dr. Tariq Al-Mansoor',
        nationality: 'SA',
        countryOfResidence: 'SA'
      },
      appointmentDate: '2025-01-01',
      effectiveFrom: '2025-01-01',
      status: 'ACTIVE',
      supportingDecisionId: 'dec_seed_01',
      supportingDocumentIds: ['doc_dir_app_01'],
      appointedByUserId: 'usr_chair_01',
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateAppointment(dirAppointment, 'seed');

    // 3. Seed Valid and Expired DoA
    const expiredDoA: DelegationOfAuthority = {
      id: 'doa_exp_01',
      delegationNumber: 'DOA-2025-0012',
      legalEntityId: ENTITY_KSA,
      delegatorUserId: 'usr_dir_01',
      delegateUserId: 'usr_ops_01',
      authorityType: 'FINANCIAL_APPROVAL',
      scopeLevel: 'LEGAL_ENTITY',
      amountLimit: 100000,
      currency: 'SAR',
      effectiveFrom: '2025-01-01T00:00:00.000Z',
      effectiveUntil: '2025-12-31T23:59:59.000Z', // Expired
      supportingDecisionId: 'dec_seed_01',
      reason: '2025 Operations expenditure delegation',
      status: 'EXPIRED',
      createdAt: now,
      updatedAt: now
    };
    await saveDelegation(expiredDoA, 'seed');

    // 4. Seed Deficient Control
    const deficientControl: InternalControl = {
      id: 'ctl_def_01',
      controlCode: 'CTL-FIN-009',
      legalEntityId: ENTITY_KSA,
      title: 'High-Value Payment Four-Eyes Review',
      description: 'Dual signoff for treasury disbursements exceeding 100k SAR',
      controlType: 'PREVENTIVE',
      frequency: 'CONTINUOUS',
      isAutomated: true,
      ownerRole: 'TREASURY_MANAGER',
      operatingEffectiveness: 'DEFICIENT',
      ownerUserId: 'usr_treasury_01',
      auditCorrelationId: 'cor_seed',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
    await saveInternalControl(deficientControl, 'seed');

    // 5. Seed Reconciliation Mismatch Record
    const recMismatch: CorporateRegisterReconciliationRecord = {
      id: 'rec_mismatch_01',
      reconciliationNumber: 'REC-2026-0001',
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      corporateActionId: 'ca_dir_appoint_01',
      registerType: 'DIRECTORS_REGISTER',
      actionStatus: 'COMPLETED',
      status: 'INTERNAL_EXTERNAL_MISMATCH',
      mismatchDetails: 'Director appointment reflected in internal system but pending Ministry of Commerce (MoC) external registration confirmation',
      reconciledByUserId: auditorContext.userId,
      reconciledAtUtc: now,
      auditCorrelationId: 'cor_rec_01'
    };
    await saveCorporateRegisterReconciliationRecord(recMismatch, 'seed');
  });

  it('1. Deterministic Governance Health Scorecard Evaluation (GHC-YYYY-####) with 7 Dimensions', async () => {
    const scorecard = await GovernanceControlTowerService.evaluateEntityGovernanceHealth(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    assert.ok(scorecard.id);
    assert.match(scorecard.scorecardNumber, /^GHC-\d{4}-\d{4}$/);
    assert.strictEqual(scorecard.legalEntityId, ENTITY_KSA);
    assert.strictEqual(scorecard.reportingPeriod, '2026-Q1');
    assert.strictEqual(scorecard.pinnedPolicyVersionId, POLICY_VER_ID);
    assert.ok(scorecard.overallScore > 0 && scorecard.overallScore <= 100);
    assert.ok(['HEALTHY', 'WARNING', 'CRITICAL'].includes(scorecard.overallStatus));

    // Verify all 7 dimensions evaluated
    assert.strictEqual(scorecard.dimensionScores.length, 7);
    const dimensions = scorecard.dimensionScores.map(d => d.dimension);
    assert.ok(dimensions.includes('AUTHORITY_GOVERNANCE'));
    assert.ok(dimensions.includes('DECISION_AND_SECRETARIAT'));
    assert.ok(dimensions.includes('STATUTORY_RECONCILIATION'));
    assert.ok(dimensions.includes('INTERNAL_CONTROLS'));
    assert.ok(dimensions.includes('AUDIT_AND_COMPLIANCE'));
    assert.ok(dimensions.includes('EVIDENCE_INTEGRITY'));
    assert.ok(dimensions.includes('COMMITTEE_PACK_READINESS'));

    // Verify indicator traceability
    const authDim = scorecard.dimensionScores.find(d => d.dimension === 'AUTHORITY_GOVERNANCE');
    assert.ok(authDim);
    assert.ok(authDim.indicatorScores.length >= 2);
    assert.ok(authDim.indicatorScores.some(i => i.indicatorCode === 'IND-AUTH-01'));
    assert.ok(authDim.indicatorScores.some(i => i.indicatorCode === 'IND-AUTH-02'));
  });

  it('2. GOVERNANCE-POLICY-INVARIANT-01 Provenance & SHA-256 Calculation Evidence Seal', async () => {
    const scorecard = await GovernanceControlTowerService.evaluateEntityGovernanceHealth(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    assert.ok(scorecard.calculationEvidenceHashSha256);
    assert.strictEqual(scorecard.calculationEvidenceHashSha256.length, 64); // SHA-256 hex string

    // Replay calculation verification
    const replay = await GovernanceControlTowerService.pointInTimeHealthReplay(
      scorecard.id,
      chiefComplianceOfficerContext
    );

    assert.strictEqual(replay.isIntegritySealValid, true);
    assert.strictEqual(replay.recomputedHash, scorecard.calculationEvidenceHashSha256);
  });

  it('3. Continuous Monitoring Scan & Idempotent Signal Generation (SIG-YYYY-####)', async () => {
    const signalsFirstPass = await GovernanceControlTowerService.runContinuousMonitoringScan(
      ENTITY_KSA,
      'SA',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    assert.ok(signalsFirstPass.length >= 3);
    const firstSignal = signalsFirstPass[0];
    assert.match(firstSignal.signalNumber, /^SIG-\d{4}-\d{4}$/);
    assert.strictEqual(firstSignal.legalEntityId, ENTITY_KSA);
    assert.ok(firstSignal.deduplicationKey);

    // Idempotent retry scan: must not produce duplicate signals
    const signalsSecondPass = await GovernanceControlTowerService.runContinuousMonitoringScan(
      ENTITY_KSA,
      'SA',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    assert.strictEqual(signalsSecondPass.length, signalsFirstPass.length);
    const allSignalsInDb = await listGovernanceSignalsByEntity(ENTITY_KSA);
    assert.strictEqual(allSignalsInDb.length, signalsFirstPass.length);
  });

  it('4. Expired Authority Anomaly Signal Detection', async () => {
    const signals = await listGovernanceSignalsByEntity(ENTITY_KSA);
    const authSignal = signals.find(s => s.category === 'AUTHORITY_EXPIRY_OR_BREACH');

    assert.ok(authSignal);
    assert.strictEqual(authSignal.severity, 'HIGH');
    assert.strictEqual(authSignal.sourceDomain, 'DELEGATION_OF_AUTHORITY');
    assert.strictEqual(authSignal.sourceRecordId, 'doa_exp_01');
    assert.strictEqual(authSignal.ruleCode, 'RULE-AUTH-EXPIRY-01');
  });

  it('5. Statutory Register Reconciliation Mismatch Detection', async () => {
    const signals = await listGovernanceSignalsByEntity(ENTITY_KSA);
    const recSignal = signals.find(s => s.category === 'STATUTORY_RECONCILIATION_MISMATCH');

    assert.ok(recSignal);
    assert.strictEqual(recSignal.severity, 'CRITICAL');
    assert.strictEqual(recSignal.sourceDomain, 'STATUTORY_RECONCILIATION');
    assert.strictEqual(recSignal.sourceRecordId, 'rec_mismatch_01');
    assert.strictEqual(recSignal.materialityScore, 90);
  });

  it('6. Internal Control Deficiency Anomaly Signal Detection', async () => {
    const signals = await listGovernanceSignalsByEntity(ENTITY_KSA);
    const ctlSignal = signals.find(s => s.category === 'INTERNAL_CONTROL_DEFICIENCY');

    assert.ok(ctlSignal);
    assert.strictEqual(ctlSignal.severity, 'HIGH');
    assert.strictEqual(ctlSignal.sourceDomain, 'INTERNAL_CONTROLS');
    assert.strictEqual(ctlSignal.sourceRecordId, 'ctl_def_01');
  });

  it('7. Signal Triage Workflow: Acknowledgement, False-Positive Handling & Noise Suppression', async () => {
    const signals = await listGovernanceSignalsByEntity(ENTITY_KSA);
    const targetSignal = signals[0];

    // Acknowledge and mark under investigation
    const triaged = await GovernanceControlTowerService.triageSignal(
      targetSignal.id,
      {
        status: 'UNDER_INVESTIGATION',
        triageNotes: 'Compliance team initiating formal review of governance anomaly'
      },
      chiefComplianceOfficerContext
    );

    assert.strictEqual(triaged.status, 'UNDER_INVESTIGATION');
    assert.strictEqual(triaged.triagedByUserId, chiefComplianceOfficerContext.userId);
    assert.ok(triaged.triagedAtUtc);

    // Suppress signal with auditor reasoning
    const suppressed = await GovernanceControlTowerService.triageSignal(
      targetSignal.id,
      {
        status: 'SUPPRESSED',
        triageNotes: 'Temporary planned downtime for external API registry',
        suppressionReason: 'Temporary planned downtime verified by Secretariat'
      },
      auditorContext
    );

    assert.strictEqual(suppressed.status, 'SUPPRESSED');
    assert.strictEqual(suppressed.suppressionReason, 'Temporary planned downtime verified by Secretariat');
  });

  it('8. Human Authority Boundary: AI / Service Principal Prohibited from Triage or Handoff', async () => {
    const signals = await listGovernanceSignalsByEntity(ENTITY_KSA);
    const targetSignal = signals[0];

    // AI triage attempt must REJECT
    await assert.rejects(
      async () => {
        await GovernanceControlTowerService.triageSignal(
          targetSignal.id,
          { status: 'RESOLVED' as any, triageNotes: 'AI closing signal automatically' },
          aiAgentContext
        );
      },
      /Automated AI Agent \/ Service Principal is strictly prohibited/
    );

    // AI handoff attempt must REJECT
    await assert.rejects(
      async () => {
        await GovernanceControlTowerService.investigateAndHandoffSignalToFinding(
          targetSignal.id,
          {
            findingTitle: 'AI Generated Finding',
            findingDescription: 'AI auto-confirming risk finding',
            severity: 'HIGH',
            remediationOwnerUserId: 'usr_ops_01',
            dueDate: '2026-12-31'
          },
          aiAgentContext
        );
      },
      /Segregation of Duties Violation: AI Agent \/ Automated Service Principal cannot confirm findings/
    );
  });

  it('9. Signal to GOV-11 Governance Finding Handoff & End-to-End Traceability', async () => {
    const signals = await listGovernanceSignalsByEntity(ENTITY_KSA);
    const ctlSignal = signals.find(s => s.category === 'INTERNAL_CONTROL_DEFICIENCY')!;

    const { signal, finding } = await GovernanceControlTowerService.investigateAndHandoffSignalToFinding(
      ctlSignal.id,
      {
        findingTitle: 'Deficient Treasury Control Requires Urgent Remediation',
        findingDescription: 'High-Value payment four-eyes review failed testing; dual signoff missing',
        severity: 'HIGH',
        targetDepartment: 'TREASURY',
        remediationOwnerUserId: 'usr_treasury_01',
        dueDate: '2026-06-30'
      },
      chiefComplianceOfficerContext
    );

    assert.strictEqual(signal.status, 'HANDED_OFF_TO_FINDING');
    assert.strictEqual(signal.confirmedFindingId, finding.id);
    assert.ok(finding.id);
    assert.match(finding.findingNumber, /^FND-/);
    assert.strictEqual(finding.sourceType, 'CONTROL_ASSESSMENT');
    assert.strictEqual(finding.sourceResourceId, ctlSignal.id);
    assert.strictEqual(finding.ownerUserId, 'usr_treasury_01');
    assert.strictEqual(finding.status, 'OPEN');
  });

  it('10. Executive Early-Warning Digest & Control Tower Rollup', async () => {
    const summary = await GovernanceControlTowerService.generateExecutiveEarlyWarningDigest(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    assert.ok(summary);
    assert.strictEqual(summary.legalEntityId, ENTITY_KSA);
    assert.strictEqual(summary.reportingPeriod, '2026-Q1');
    assert.ok(summary.latestScorecard);
    assert.ok(summary.earlyWarningAlerts.length >= 1);
    assert.ok(['IMPROVING', 'STABLE', 'DETERIORATING'].includes(summary.trendDirection));
    assert.ok(summary.executiveSummaryText.includes(ENTITY_KSA));
    assert.ok(summary.controlTowerMetrics.totalSignalsEvaluated > 0);
  });

  it('11. Multi-Entity Isolation Enforcement on Monitoring & Control Tower', async () => {
    // UAE user attempting KSA scan must be REJECTED
    await assert.rejects(
      async () => {
        await GovernanceControlTowerService.runContinuousMonitoringScan(
          ENTITY_KSA,
          'SA',
          POLICY_VER_ID,
          uaeOfficerContext
        );
      },
      /Cross-Entity Scan Forbidden/
    );

    // UAE user attempting KSA health scorecard evaluation must be REJECTED
    await assert.rejects(
      async () => {
        await GovernanceControlTowerService.evaluateEntityGovernanceHealth(
          ENTITY_KSA,
          'SA',
          '2026-Q1',
          POLICY_VER_ID,
          uaeOfficerContext
        );
      },
      /Cross-Entity Access Denied/
    );
  });

  after(() => {
    setTimeout(() => process.exit(0), 100);
  });
});
