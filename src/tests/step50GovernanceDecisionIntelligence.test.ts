/**
 * AJA INTERNATIONAL LOGISTICS — Governance Analytics, Scenario Simulation & Decision Intelligence Test Suite
 * Step GOV-17: Advisory, Explainable, Reproducible & Non-Authoritative Governance Intelligence Engine
 * 
 * Test Invariants:
 * 1. Sequential Numbering & Schema Invariants (GAS-YYYY-####, SCN-YYYY-####, SIM-YYYY-####, GDI-YYYY-####, BAB-YYYY-####)
 * 2. Deterministic Analytics Snapshot & Cryptographic SHA-256 Seal
 * 3. Mathematical Reproducibility (Replay of identical inputs yields identical hash)
 * 4. Explicit Scenario Assumptions & Versioning / Supersession
 * 5. Isolated What-If Simulation: Zero mutations to canonical governance records
 * 6. Simulation Scenarios: Policy change, Risk appetite change, DoA/FAM threshold change, Control failure
 * 7. Simulation Bottleneck Detection (Single-approver dependency, committee backlog, etc.)
 * 8. Finalization & Sealing of Simulation Runs (Immutable evidence)
 * 9. Decision Intelligence Taxonomy Separation (Facts vs Assumptions vs AI Commentary vs Evidence Gaps)
 * 10. Board Advisory Brief Generation & Non-Authoritative Disclaimer
 * 11. Security Gate: Direct Execution Bypass Denial
 * 12. Security Gate: AI / Service Principal Authority Denial (No automatic decision approval or action execution)
 * 13. Multi-Entity Isolation (Strict cross-entity boundary enforcement)
 * 14. Export Entitlement Security Gate (VIEW != EXPORT)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  GovernanceDecisionIntelligenceService
} from '../services/governanceDecisionIntelligenceService';
import {
  resetGovernanceAnalyticsMemoryStore,
  getGovernanceAnalyticsSnapshotById,
  listGovernanceAnalyticsSnapshotsByEntity,
  getGovernanceScenarioDefinitionById,
  getGovernanceSimulationRunById,
  getGovernanceDecisionIntelligenceById,
  getBoardAdvisoryBriefById
} from '../db/repositories/governanceAnalyticsRepository';
import {
  saveCorporatePolicy,
  saveCorporatePolicyVersion,
  saveDelegation,
  saveInternalControl,
  getCorporatePolicyVersionById
} from '../db/repositories/corporateAuthorityRepository';
import {
  saveCorporateLegalProfile,
  saveCorporateAppointment,
  saveCorporateDecision,
  resetCorporateGovernanceMemoryStore
} from '../db/repositories/corporateGovernanceRepository';
import {
  saveCorporateAction,
  resetCorporateSecretariatMemoryStore
} from '../db/repositories/corporateSecretariatRepository';
import {
  saveEvidenceRecord
} from '../db/repositories/corporateRecordsRepository';
import {
  saveGovernanceFinding
} from '../db/repositories/corporateRiskAssuranceRepository';
import {
  saveGovernanceSignal,
  saveGovernanceHealthScorecard,
  resetControlTowerMemoryStore
} from '../db/repositories/governanceControlTowerRepository';
import {
  CorporatePolicy,
  CorporatePolicyVersion,
  DelegationOfAuthority,
  DirectorOfficerRecord,
  InternalControl,
  CorporateActionRecord,
  EvidenceRecord,
  GovernanceSignal,
  GovernanceHealthScorecard,
  ScenarioAssumption
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';

describe('STEP GOV-17: Governance Analytics, Scenario Simulation & Decision Intelligence', () => {
  const ENTITY_KSA = 'le_aja_saudi_01';
  const ENTITY_UAE = 'le_aja_uae_01';
  const POLICY_ID = 'pol_gov_assurance_01';
  const POLICY_VER_ID = 'pol_ver_gov_assurance_2026_v1';

  // Contexts
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

  const superAdminContext: UserContext = {
    userId: 'usr_super_admin_01',
    role: 'SUPER_ADMIN',
    legalEntityId: ENTITY_KSA
  };

  const aiAgentContext: UserContext = {
    userId: 'ai_governance_copilot',
    role: 'SERVICE_PRINCIPAL',
    legalEntityId: ENTITY_KSA
  };

  const uaeOfficerContext: UserContext = {
    userId: 'usr_uae_officer_01',
    role: 'COMPANY_ADMIN',
    legalEntityId: ENTITY_UAE
  };

  const readOnlyUserContext: UserContext = {
    userId: 'usr_viewer_01',
    role: 'GUEST',
    legalEntityId: ENTITY_KSA
  };

  before(async () => {
    resetGovernanceAnalyticsMemoryStore();
    resetControlTowerMemoryStore();
    resetCorporateGovernanceMemoryStore();
    resetCorporateSecretariatMemoryStore();

    const now = new Date().toISOString();

    // 1. Seed Legal Profiles
    await saveCorporateLegalProfile({
      id: ENTITY_KSA,
      legalEntityId: ENTITY_KSA,
      legalCompanyName: 'AJA International Logistics KSA LLC',
      tradingName: 'شركة أجا الدولية للخدمات اللوجستية ش.م.م',
      companyNumber: 'CR-1010-998877',
      companyType: 'Limited Liability Company',
      incorporationDate: '2020-01-15',
      incorporationJurisdiction: 'SA',
      registeredOfficeAddress: {
        addressLine1: 'King Fahd Road',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postalCode: '12345',
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

    // 2. Seed Corporate Policy & Policy Version (GOVERNANCE-POLICY-INVARIANT-01)
    const policy: CorporatePolicy = {
      id: POLICY_ID,
      policyCode: 'POL-GOV-ASSUR-01',
      title: 'Enterprise Governance, Authority & Assurance Framework',
      legalEntityScope: [ENTITY_KSA],
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
      contentSummary: 'Mandatory Governance Assurance, Delegation Limits and Health Thresholds',
      effectiveFrom: '2026-01-01',
      reviewDate: '2027-01-01',
      supportingDecisionId: 'dec_seed_01',
      approvedByUserIds: ['usr_board_chair_01'],
      createdAt: now,
      updatedAt: now
    };
    await saveCorporatePolicyVersion(policyVersion, 'seed');

    // 3. Seed Canonical Appointments, Controls, Delegations & Evidence
    const director: DirectorOfficerRecord = {
      id: 'app_dir_01',
      legalEntityId: ENTITY_KSA,
      statutoryRole: 'DIRECTOR',
      titleEn: 'Managing Director',
      authorityScope: 'LEGAL_ENTITY',
      personReference: {
        personId: 'per_dir_01',
        fullNameEn: 'Eng. Khalid Al-Mansoor',
        nationality: 'SA',
        countryOfResidence: 'SA'
      },
      appointmentDate: '2020-02-01',
      effectiveFrom: '2020-02-01',
      status: 'ACTIVE',
      supportingDecisionId: 'dec_seed_01',
      supportingDocumentIds: ['doc_dir_app_01'],
      appointedByUserId: 'usr_chair_01',
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateAppointment(director, 'seed');

    const control: InternalControl = {
      id: 'ctrl_reconciliation_01',
      controlCode: 'CTL-FIN-001',
      legalEntityId: ENTITY_KSA,
      title: 'Daily Automated Bank & Ledger Reconciliation',
      description: 'Automated bank feed reconciliation against general ledger',
      controlType: 'PREVENTIVE',
      frequency: 'CONTINUOUS',
      isAutomated: true,
      ownerRole: 'FINANCE_MANAGER',
      operatingEffectiveness: 'EFFECTIVE',
      ownerUserId: 'usr_fin_lead_01',
      auditCorrelationId: 'cor_ctrl_01',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
    await saveInternalControl(control, 'seed');

    const delegation: DelegationOfAuthority = {
      id: 'doa_procurement_tier1',
      delegationNumber: 'DOA-2026-0001',
      legalEntityId: ENTITY_KSA,
      delegatorUserId: 'usr_md_01',
      delegateUserId: 'usr_proc_mgr_01',
      authorityType: 'FINANCIAL_APPROVAL',
      scopeLevel: 'LEGAL_ENTITY',
      amountLimit: 500000,
      currency: 'SAR',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveUntil: '2026-12-31T23:59:59.000Z',
      supportingDecisionId: 'dec_seed_01',
      reason: 'Procurement delegation tier 1',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
    await saveDelegation(delegation, 'seed');

    const evidence: EvidenceRecord = {
      id: 'evd_cr_notarized_01',
      documentId: 'doc_cr_01',
      checksumSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      evidenceNumber: 'EVI-2026-0001',
      evidenceType: 'STATUTORY_FILING_RECEIPT',
      classification: 'INTERNAL',
      verificationStatus: 'VERIFIED',
      integrityStatus: 'VERIFIED',
      legalEntityId: ENTITY_KSA,
      submittedByUserId: 'usr_cco_01',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };
    await saveEvidenceRecord(evidence, 'seed');

    // 4. Seed Governance Health Scorecard (GOV-16)
    const scorecard: GovernanceHealthScorecard = {
      id: 'GHC-2026-0001',
      scorecardNumber: 'GHC-2026-0001',
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      reportingPeriod: '2026-Q1',
      pinnedPolicyVersionId: POLICY_VER_ID,
      overallScore: 94,
      overallStatus: 'HEALTHY',
      dimensionScores: [],
      calculationEvidenceHashSha256: 'f0e1d2c3b4a5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f',
      activeSignalsCount: 0,
      criticalSignalsCount: 0,
      amberSignalsCount: 0,
      openFindingsCount: 0,
      overdueActionsCount: 0,
      evaluatedAtUtc: now,
      evaluatedByUserId: chiefComplianceOfficerContext.userId,
      auditCorrelationId: 'cor_seed_ghc_01',
      createdAt: now,
      updatedAt: now
    };
    await saveGovernanceHealthScorecard(scorecard, chiefComplianceOfficerContext.userId, 'cor_seed_ghc_01');
  });

  // ==========================================================================
  // TEST 1: Deterministic Analytics Snapshot Generation & Integrity Seal
  // ==========================================================================
  it('TEST 1: Evaluates deterministic Governance Analytics Snapshot with sequence GAS-YYYY-#### and SHA-256 seal', async () => {
    const snapshot = await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    assert.ok(snapshot.id.startsWith('GAS-2026-'), `Expected GAS-2026- prefix, got ${snapshot.id}`);
    assert.equal(snapshot.legalEntityId, ENTITY_KSA);
    assert.equal(snapshot.jurisdiction, 'SA');
    assert.equal(snapshot.reportingPeriod, '2026-Q1');
    assert.ok(snapshot.policyVersionIds.includes(POLICY_VER_ID));
    assert.ok(snapshot.governanceHealthScore >= 90);
    assert.equal(snapshot.keyMetrics.controlEffectivenessRate, 100);
    assert.equal(snapshot.keyMetrics.evidenceIntegrityRate, 100);
    assert.ok(snapshot.integrityHashSha256.length === 64, 'SHA-256 seal must be 64 hex characters');

    // Persistence Check
    const stored = await getGovernanceAnalyticsSnapshotById(snapshot.id);
    assert.ok(stored);
    assert.equal(stored.integrityHashSha256, snapshot.integrityHashSha256);
  });

  // ==========================================================================
  // TEST 2: Mathematical Reproducibility / Deterministic Replay
  // ==========================================================================
  it('TEST 2: Proves 100% mathematical reproducibility of Analytics Snapshot replay', async () => {
    const snapshot = await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    const reproduction = GovernanceDecisionIntelligenceService.reproduceAnalyticsSnapshot(snapshot);
    assert.equal(reproduction.isIdentical, true, 'Recomputed hash must match original snapshot seal exactly');
    assert.equal(reproduction.recomputedHash, snapshot.integrityHashSha256);
  });

  // ==========================================================================
  // TEST 3: Scenario Definition Creation & Explicit Assumptions
  // ==========================================================================
  it('TEST 3: Creates Scenario Definition (SCN-YYYY-####) with explicit assumptions and validates missing assumptions', async () => {
    const assumptions: ScenarioAssumption[] = [
      {
        id: 'asm_01',
        key: 'audit_cycle_months',
        assumptionType: 'AUDIT_FREQUENCY',
        currentValue: 24,
        hypotheticalValue: 18,
        unit: 'months',
        justification: 'Shorten internal audit frequency from 24 to 18 months to enhance assurance cadence.'
      }
    ];

    const scenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-AUDIT-CADENCE-18M',
        title: 'Accelerated 18-Month Internal Audit Cycle',
        description: 'Simulating the operational and resource impact of shortening audit cycle.',
        scenarioType: 'AUDIT_CYCLE_CHANGE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions
      },
      chiefComplianceOfficerContext
    );

    assert.ok(scenario.id.startsWith('SCN-2026-'), `Expected SCN-2026- prefix, got ${scenario.id}`);
    assert.equal(scenario.version, 1);
    assert.equal(scenario.status, 'ACTIVE');
    assert.equal(scenario.assumptions.length, 1);

    // Negative: Reject scenario with empty assumptions
    await assert.rejects(
      async () => {
        await GovernanceDecisionIntelligenceService.createScenarioDefinition(
          {
            scenarioCode: 'SCN-INVALID',
            title: 'Invalid Scenario',
            description: 'No assumptions',
            scenarioType: 'CUSTOM',
            legalEntityId: ENTITY_KSA,
            jurisdiction: 'SA',
            basePolicyVersionId: POLICY_VER_ID,
            assumptions: []
          },
          chiefComplianceOfficerContext
        );
      },
      /At least one explicit ScenarioAssumption is required/
    );
  });

  // ==========================================================================
  // TEST 4: Scenario Versioning & Supersession
  // ==========================================================================
  it('TEST 4: Handles controlled Scenario Versioning: supersedes v1 and activates v2', async () => {
    const initialAssumptions: ScenarioAssumption[] = [
      {
        id: 'asm_v1',
        key: 'audit_cycle_months',
        assumptionType: 'AUDIT_FREQUENCY',
        currentValue: 24,
        hypotheticalValue: 18,
        justification: '18 month cadence'
      }
    ];

    const v1 = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-CADENCE-VERSIONS',
        title: 'Cadence Versioning Test',
        description: 'Version 1',
        scenarioType: 'AUDIT_CYCLE_CHANGE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions: initialAssumptions
      },
      chiefComplianceOfficerContext
    );

    const updatedAssumptions: ScenarioAssumption[] = [
      {
        id: 'asm_v2',
        key: 'audit_cycle_months',
        assumptionType: 'AUDIT_FREQUENCY',
        currentValue: 24,
        hypotheticalValue: 12,
        justification: 'Accelerating further to 12 month annual cadence'
      }
    ];

    const v2 = await GovernanceDecisionIntelligenceService.createNewScenarioVersion(
      v1.id,
      updatedAssumptions,
      'Accelerated to 12-month cadence',
      chiefComplianceOfficerContext
    );

    assert.equal(v2.version, 2);
    assert.equal(v2.status, 'ACTIVE');

    // Verify v1 is now SUPERSEDED
    const reloadedV1 = await getGovernanceScenarioDefinitionById(v1.id);
    assert.ok(reloadedV1);
    assert.equal(reloadedV1.status, 'SUPERSEDED');
    assert.equal(reloadedV1.supersededByScenarioId, v2.id);
  });

  // ==========================================================================
  // TEST 5: Isolated Simulation Run & Non-Mutation of Canonical Records
  // ==========================================================================
  it('TEST 5: Executes What-If Simulation Run (SIM-YYYY-####) without mutating canonical records', async () => {
    const snapshot = await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    const scenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-SIM-TEST-01',
        title: 'Policy Change Simulation',
        description: 'Simulating audit cycle compression',
        scenarioType: 'AUDIT_CYCLE_CHANGE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions: [
          {
            id: 'asm_sim_01',
            key: 'audit_cycle_months',
            assumptionType: 'AUDIT_FREQUENCY',
            currentValue: 24,
            hypotheticalValue: 18,
            justification: 'Simulate 18m cycle'
          }
        ]
      },
      chiefComplianceOfficerContext
    );

    const simRun = await GovernanceDecisionIntelligenceService.runSimulation(
      scenario.id,
      snapshot.id,
      chiefComplianceOfficerContext
    );

    assert.ok(simRun.id.startsWith('SIM-2026-'), `Expected SIM-2026- prefix, got ${simRun.id}`);
    assert.equal(simRun.scenarioDefinitionId, scenario.id);
    assert.equal(simRun.sourceSnapshotId, snapshot.id);
    assert.ok(simRun.impactAssessment.potentialWorkloadDeltaHours > 0);
    assert.ok(simRun.bottlenecksDetected.length > 0);
    assert.equal(simRun.bottlenecksDetected[0].bottleneckType, 'COMMITTEE_BACKLOG');

    // Verify Canonical Policy Version was NOT mutated
    const canonicalPolicyVer = await getCorporatePolicyVersionById(POLICY_VER_ID);
    assert.ok(canonicalPolicyVer);
    assert.equal(canonicalPolicyVer.versionNumber, 1);
    assert.equal(canonicalPolicyVer.contentSummary, 'Mandatory Governance Assurance, Delegation Limits and Health Thresholds');
  });

  // ==========================================================================
  // TEST 6: Multi-Domain Scenarios & Bottleneck Detection
  // ==========================================================================
  it('TEST 6: Simulates Risk Appetite, DoA/FAM threshold, and Control Failure scenarios with bottleneck detection', async () => {
    const snapshot = await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    // 1. Risk Appetite Scenario
    const riskScenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-RISK-TOLERANCE',
        title: 'Tightened Risk Appetite Simulation',
        description: 'Simulate lower risk thresholds',
        scenarioType: 'RISK_APPETITE_CHANGE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions: [
          {
            id: 'asm_risk_01',
            key: 'risk_tolerance_threshold',
            assumptionType: 'THRESHOLD',
            currentValue: 'MEDIUM',
            hypotheticalValue: 'LOW',
            justification: 'Stricter risk appetite'
          }
        ]
      },
      chiefComplianceOfficerContext
    );

    const riskSim = await GovernanceDecisionIntelligenceService.runSimulation(
      riskScenario.id,
      snapshot.id,
      chiefComplianceOfficerContext
    );

    assert.equal(riskSim.impactAssessment.riskAppetiteBreachesProjected, 3);
    assert.ok(riskSim.bottlenecksDetected.some(b => b.bottleneckType === 'OVERDUE_ACTION_CONCENTRATION'));

    // 2. DoA / FAM Threshold Scenario (Single-Approver Bottleneck)
    const doaScenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-FAM-THRESHOLD-LOWER',
        title: 'Lower Financial Approval Threshold',
        description: 'Simulate lowering MD threshold from 500k to 100k',
        scenarioType: 'FAM_THRESHOLD_CHANGE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions: [
          {
            id: 'asm_fam_01',
            key: 'md_approval_threshold',
            assumptionType: 'THRESHOLD',
            currentValue: 500000,
            hypotheticalValue: 100000,
            justification: 'Simulate tighter financial controls'
          }
        ]
      },
      chiefComplianceOfficerContext
    );

    const doaSim = await GovernanceDecisionIntelligenceService.runSimulation(
      doaScenario.id,
      snapshot.id,
      chiefComplianceOfficerContext
    );

    assert.ok(doaSim.bottlenecksDetected.some(b => b.bottleneckType === 'SINGLE_APPROVER_DEPENDENCY'));
    assert.ok(doaSim.bottlenecksDetected.some(b => b.bottleneckType === 'EXCESSIVE_EXECUTIVE_APPROVALS'));

    // 3. Control Failure Scenario
    const controlScenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-CTRL-FAIL-RECON',
        title: 'Simulated Reconciliation Control Failure',
        description: 'Simulate failure of automated bank reconciliation',
        scenarioType: 'CONTROL_FAILURE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions: [
          {
            id: 'asm_ctrl_01',
            key: 'bank_recon_control_status',
            assumptionType: 'CONTROL_EFFECTIVENESS',
            currentValue: 'EFFECTIVE',
            hypotheticalValue: 'DEFICIENT',
            justification: 'Simulate system downtime'
          }
        ]
      },
      chiefComplianceOfficerContext
    );

    const ctrlSim = await GovernanceDecisionIntelligenceService.runSimulation(
      controlScenario.id,
      snapshot.id,
      chiefComplianceOfficerContext
    );

    assert.equal(ctrlSim.impactAssessment.controlDeficienciesProjected, 2);
    assert.ok(ctrlSim.healthDelta < 0, 'Projected health score must drop on control failure');
  });

  // ==========================================================================
  // TEST 7: Simulation Run Finalization & Cryptographic Sealing
  // ==========================================================================
  it('TEST 7: Finalizes simulation run and locks against in-place modifications', async () => {
    const snapshot = await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
      ENTITY_KSA,
      'SA',
      '2026-Q1',
      POLICY_VER_ID,
      chiefComplianceOfficerContext
    );

    const scenario = await GovernanceDecisionIntelligenceService.createScenarioDefinition(
      {
        scenarioCode: 'SCN-SEAL-TEST',
        title: 'Finalize Test',
        description: 'Test sealing',
        scenarioType: 'AUDIT_CYCLE_CHANGE',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        basePolicyVersionId: POLICY_VER_ID,
        assumptions: [
          {
            id: 'asm_01',
            key: 'cycle',
            assumptionType: 'AUDIT_FREQUENCY',
            currentValue: 24,
            hypotheticalValue: 18,
            justification: '18m'
          }
        ]
      },
      chiefComplianceOfficerContext
    );

    const sim = await GovernanceDecisionIntelligenceService.runSimulation(
      scenario.id,
      snapshot.id,
      chiefComplianceOfficerContext
    );

    assert.equal(sim.isFinalized, false);

    const finalized = await GovernanceDecisionIntelligenceService.finalizeSimulationRun(
      sim.id,
      chiefComplianceOfficerContext
    );

    assert.equal(finalized.isFinalized, true);
    assert.equal(finalized.status, 'FINALIZED');
    assert.ok(finalized.finalizedAtUtc);

    // Negative: Cannot finalize twice
    await assert.rejects(
      async () => {
        await GovernanceDecisionIntelligenceService.finalizeSimulationRun(
          sim.id,
          chiefComplianceOfficerContext
        );
      },
      /already finalized/
    );
  });

  // ==========================================================================
  // TEST 8: Decision Intelligence Taxonomy Separation (Facts vs AI vs Recommendations)
  // ==========================================================================
  it('TEST 8: Generates Decision Intelligence (GDI-YYYY-####) with strict taxonomy separation and advisory-only flag', async () => {
    const gdi = await GovernanceDecisionIntelligenceService.generateDecisionIntelligence(
      {
        matterNumber: 'MAT-2026-0042',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        decisionType: 'BOARD_RESOLUTION',
        title: 'Approval of Cross-Border Freight Facility Agreement',
        context: 'Proposed financing agreement with Saudi Exim Bank for SAR 25M.',
        supportingPolicyVersionId: POLICY_VER_ID,
        aiProvenance: {
          modelIdentifier: 'gemini-3.7-flash',
          promptTemplateVersion: 'tpl-gdi-v1.0'
        }
      },
      chiefComplianceOfficerContext
    );

    assert.ok(gdi.id.startsWith('GDI-2026-'), `Expected GDI-2026- prefix, got ${gdi.id}`);
    assert.equal(gdi.matterNumber, 'MAT-2026-0042');
    assert.ok(gdi.taxonomyBreakdown.length >= 3);

    // Verify Facts vs AI Separation
    const factItems = gdi.taxonomyBreakdown.filter(t => t.statementType === 'VERIFIED_FACT');
    const aiItems = gdi.taxonomyBreakdown.filter(t => t.statementType === 'AI_GENERATED_ANALYSIS');
    assert.ok(factItems.length > 0, 'Must have verified facts');
    assert.ok(aiItems.length > 0, 'Must have AI generated analysis');
    assert.ok(aiItems[0].confidenceDisclaimer, 'AI analysis must carry confidence disclaimer');

    // Verify Advisory Recommendations are NON-AUTHORITATIVE
    assert.ok(gdi.advisoryRecommendations.length > 0);
    for (const rec of gdi.advisoryRecommendations) {
      assert.equal(rec.isAuthoritative, false, 'Advisory recommendations MUST strictly be non-authoritative');
    }
  });

  // ==========================================================================
  // TEST 9: Board Advisory Brief Generation & Disclaimer
  // ==========================================================================
  it('TEST 9: Generates Board Advisory Brief (BAB-YYYY-####) with explicit non-authoritative disclaimer', async () => {
    const brief = await GovernanceDecisionIntelligenceService.generateBoardAdvisoryBrief(
      {
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        reportingPeriod: '2026-Q1',
        meetingId: 'BM-2026-01'
      },
      chiefComplianceOfficerContext
    );

    assert.ok(brief.id.startsWith('BAB-2026-'), `Expected BAB-2026- prefix, got ${brief.id}`);
    assert.ok(brief.nonAuthoritativeDisclaimer.includes('ADVISORY NOTICE'));
    assert.ok(brief.nonAuthoritativeDisclaimer.includes('does not constitute a Board Decision'));
    assert.ok(brief.integrityHashSha256.length === 64);
  });

  // ==========================================================================
  // TEST 10: Security Gate — Direct Execution Bypass Denial
  // ==========================================================================
  it('TEST 10: Enforces Direct Execution Bypass Denial (Advisory recommendations cannot execute actions directly)', async () => {
    assert.throws(
      () => {
        GovernanceDecisionIntelligenceService.denyExecutionBypass('REC-2026-01', chiefComplianceOfficerContext);
      },
      /SECURITY INVARIANT VIOLATION: Advisory Recommendation/
    );
  });

  // ==========================================================================
  // TEST 11: Security Gate — AI / Service Principal Authority Denial
  // ==========================================================================
  it('TEST 11: Rejects AI / Service Principal attempts to approve decisions or execute actions', async () => {
    // 1. AI cannot approve decision
    assert.throws(
      () => {
        GovernanceDecisionIntelligenceService.denyAiAuthority('APPROVE_DECISION', aiAgentContext);
      },
      /GOVERNANCE-INTELLIGENCE-INVARIANT-01 VIOLATION: Automated Principal \/ AI Agent/
    );

    // 2. AI cannot accept risk
    assert.throws(
      () => {
        GovernanceDecisionIntelligenceService.denyAiAuthority('ACCEPT_RISK', aiAgentContext);
      },
      /strictly forbidden from executing 'ACCEPT_RISK'/
    );

    // 3. AI cannot execute corporate action
    assert.throws(
      () => {
        GovernanceDecisionIntelligenceService.denyAiAuthority('EXECUTE_ACTION', aiAgentContext);
      },
      /strictly forbidden from executing 'EXECUTE_ACTION'/
    );

    // 4. Human CCO is permitted
    assert.doesNotThrow(() => {
      GovernanceDecisionIntelligenceService.denyAiAuthority('APPROVE_DECISION', chiefComplianceOfficerContext);
    });
  });

  // ==========================================================================
  // TEST 12: Multi-Entity Isolation Enforcement
  // ==========================================================================
  it('TEST 12: Enforces Multi-Entity Isolation (UAE Officer cannot access or simulate KSA entity)', async () => {
    // 1. Attempt to generate snapshot for KSA from UAE user context -> Throws PermissionError
    await assert.rejects(
      async () => {
        await GovernanceDecisionIntelligenceService.generateAnalyticsSnapshot(
          ENTITY_KSA,
          'SA',
          '2026-Q1',
          POLICY_VER_ID,
          uaeOfficerContext
        );
      },
      /Multi-Entity Isolation Error/
    );

    // 2. Attempt to create scenario for KSA from UAE user context -> Throws PermissionError
    await assert.rejects(
      async () => {
        await GovernanceDecisionIntelligenceService.createScenarioDefinition(
          {
            scenarioCode: 'SCN-CROSS-ENTITY',
            title: 'Cross entity test',
            description: 'illegal',
            scenarioType: 'CUSTOM',
            legalEntityId: ENTITY_KSA,
            jurisdiction: 'SA',
            basePolicyVersionId: POLICY_VER_ID,
            assumptions: [
              {
                id: 'a1',
                key: 'k1',
                assumptionType: 'CUSTOM',
                currentValue: 1,
                hypotheticalValue: 2,
                justification: 'test'
              }
            ]
          },
          uaeOfficerContext
        );
      },
      /Multi-Entity Isolation Error/
    );
  });

  // ==========================================================================
  // TEST 13: Export Security Gate (VIEW != EXPORT)
  // ==========================================================================
  it('TEST 13: Enforces Export Entitlement (Read-only viewers cannot export raw analytics)', () => {
    // 1. Read-only viewer denied export
    assert.throws(
      () => {
        GovernanceDecisionIntelligenceService.exportAnalyticsData(ENTITY_KSA, readOnlyUserContext);
      },
      /Export Entitlement Denied: User role 'GUEST' has VIEW privileges but lacks explicit EXPORT/
    );

    // 2. CCO permitted export
    const exportResult = GovernanceDecisionIntelligenceService.exportAnalyticsData(ENTITY_KSA, chiefComplianceOfficerContext);
    assert.equal(exportResult.exportAuthorized, true);
    assert.ok(exportResult.exportHash);
  });

  // ==========================================================================
  // TEST 14: Executive Desk Insights Integration
  // ==========================================================================
  it('TEST 14: Generates consolidated Executive Desk Insights with active scenarios and top bottlenecks', async () => {
    const insights = await GovernanceDecisionIntelligenceService.getExecutiveDeskInsights(
      ENTITY_KSA,
      'SA',
      chiefComplianceOfficerContext
    );

    assert.equal(insights.legalEntityId, ENTITY_KSA);
    assert.equal(insights.jurisdiction, 'SA');
    assert.ok(insights.activeScenariosCount >= 1);
    assert.ok(insights.recentSimulationsCount >= 1);
    assert.ok(Array.isArray(insights.highPriorityRecommendations));
    assert.ok(Array.isArray(insights.topBottlenecks));
  });
});
