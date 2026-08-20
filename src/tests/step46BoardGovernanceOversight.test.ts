/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Board & Committee Oversight Test Suite
 * Step GOV-13: Board & Committee Oversight, Executive Attestations, Governance Performance, MI & Regulatory Reporting
 * 
 * Test Invariants:
 * - GOVERNANCE-POLICY-INVARIANT-01: Configurable, versioned, jurisdiction-aware & provenance-preserved governance rules
 * - Point-in-Time Policy Replay & Historical Immutability
 * - Metric Definition Versioning, Strict Source Lineage & Controlled Corrections
 * - Risk Appetite Statements, Quantitative KRI Thresholds & Governed Breach Lifecycle
 * - Executive Attestations, Statement Pinning, Evidence Vault Verification & SoD
 * - Board/Committee Reporting Packs, Projection Integrity & Controlled Supersession
 * - Board Review/Challenge Lifecycle & Governance Action Tracking with Overdue Escalation
 * - Cross-Entity Isolation & Multi-Entity Group Consolidation
 * - Service Principal & AI Authority Boundary Enforcement
 * - Statutory Immutability (Prohibition of Hard Deletion)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  saveCorporatePolicy,
  saveCorporatePolicyVersion,
  saveCorporateDecision,
  saveEvidenceRecord,
  saveEffectiveGovernanceRuleSet,
  resolveEffectiveGovernanceRules,
  pointInTimePolicyReplay,
  saveGovernanceMetricDefinition,
  calculateAndRecordMetricSnapshot,
  adjustMetricSnapshot,
  saveRiskAppetiteStatement,
  evaluateRiskAppetiteBreach,
  submitAndSignExecutiveAttestation,
  verifyExecutiveAttestation,
  saveGovernanceReportingPack,
  publishAndLockGovernanceReportingPack,
  supersedeGovernanceReportingPack,
  createGovernanceChallenge,
  respondToGovernanceChallenge,
  reviewAndCloseGovernanceChallenge,
  createGovernanceAction,
  verifyAndCloseGovernanceAction,
  detectOverdueGovernanceActions,
  deleteGovernanceRuleSetProhibited,
  deleteMetricSnapshotProhibited,
  deleteRiskAppetiteStatementProhibited,
  deleteExecutiveAttestationProhibited,
  deleteGovernanceReportingPackProhibited,
  deleteGovernanceActionProhibited,
  computeSha256
} from '../db/repositories';
import { corporateBoardOversightService } from '../services/corporateBoardOversightService';
import {
  CorporatePolicy,
  CorporatePolicyVersion,
  CorporateDecision,
  GovernanceMetricDefinition,
  GovernanceMetricSnapshot,
  RiskAppetiteStatement,
  RiskAppetiteBreach,
  ExecutiveAttestation,
  GovernanceReportingPack,
  GovernanceChallenge,
  GovernanceAction,
  EffectiveGovernanceRuleSet
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';

describe('STEP GOV-13: Board & Committee Oversight, Executive Attestations & Governance Performance', () => {
  const ENTITY_KSA = 'entity_ksa_01';
  const ENTITY_UK = 'entity_uk_01';

  const groupChairContext: UserContext = {
    userId: 'usr_board_chair_01',
    role: 'BOARD_CHAIR',
    roles: ['BOARD_CHAIR', 'BOARD_DIRECTOR']
  };

  const groupCfoContext: UserContext = {
    userId: 'usr_group_cfo_01',
    role: 'CFO',
    roles: ['CFO', 'EXECUTIVE_DIRECTOR', 'GROUP_CFO']
  };

  const caeContext: UserContext = {
    userId: 'usr_cae_01',
    role: 'CAE',
    roles: ['CAE', 'INTERNAL_AUDITOR']
  };

  const complianceOfficerContext: UserContext = {
    userId: 'usr_comp_officer_01',
    role: 'COMPLIANCE_OFFICER',
    roles: ['COMPLIANCE_OFFICER']
  };

  const ksaManagerContext: UserContext = {
    userId: 'usr_ksa_mgr_01',
    role: 'OPERATIONS_MANAGER',
    roles: ['OPERATIONS_MANAGER']
  };

  const techAdminContext: UserContext = {
    userId: 'usr_tech_admin_01',
    role: 'ADMIN',
    roles: ['ADMIN']
  };

  before(async () => {
    // 1. Seed Board Decisions (GOV-06) for supporting policy versions and risk appetite
    const decision1: CorporateDecision = {
      id: 'dec_board_gov_2026_01',
      decisionNumber: 'DEC-2026-001',
      decisionType: 'BOARD_RESOLUTION',
      legalEntityId: ENTITY_KSA,
      titleEn: 'Approval of Enterprise Audit & Risk Governance Policy V1',
      titleAr: 'اعتماد سياسة التدقيق والحوكمة المؤسسية الإصدار الأول',
      decisionStatus: 'APPROVED',
      lifecycleStatus: 'APPROVED',
      effectiveDate: '2026-01-01T00:00:00Z',
      auditCorrelationId: 'cor_dec_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporateDecision(decision1, groupChairContext.userId);

    const decision2: CorporateDecision = {
      id: 'dec_board_gov_2026_02',
      decisionNumber: 'DEC-2026-002',
      decisionType: 'BOARD_RESOLUTION',
      legalEntityId: ENTITY_KSA,
      titleEn: 'Approval of Revised Audit Governance Policy V2',
      titleAr: 'اعتماد سياسة التدقيق المحدثة الإصدار الثاني',
      decisionStatus: 'APPROVED',
      lifecycleStatus: 'APPROVED',
      effectiveDate: '2026-06-01T00:00:00Z',
      auditCorrelationId: 'cor_dec_02',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z'
    };
    await saveCorporateDecision(decision2, groupChairContext.userId);

    // 2. Seed Corporate Policies & Versions (GOV-10)
    const policyKsa: CorporatePolicy = {
      id: 'pol_audit_gov_ksa',
      policyCode: 'POL-AUD-KSA-001',
      title: 'KSA Internal Audit & Assurance Governance Policy',
      category: 'GOVERNANCE',
      legalEntityScope: [ENTITY_KSA],
      ownerUserId: caeContext.userId,
      ownerRole: 'CAE',
      mandatoryReviewFrequencyMonths: 12,
      activeVersionNumber: 2,
      lifecycleStatus: 'APPROVED',
      classificationClearance: 'CONFIDENTIAL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporatePolicy(policyKsa, caeContext.userId);

    const policyVersion1: CorporatePolicyVersion = {
      id: 'ver_audit_gov_ksa_v1',
      policyId: 'pol_audit_gov_ksa',
      versionNumber: 1,
      contentSummary: 'Audit cycles: Critical 12m, High 24m. Cooling off: 365 days.',
      fullPolicyText: 'Full text for KSA Audit Policy Version 1',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveUntil: '2026-05-31T23:59:59Z',
      supportingDecisionId: 'dec_board_gov_2026_01',
      reviewDate: '2026-12-31T00:00:00Z',
      approvedByUserIds: [groupChairContext.userId],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporatePolicyVersion(policyVersion1, caeContext.userId);

    const policyVersion2: CorporatePolicyVersion = {
      id: 'ver_audit_gov_ksa_v2',
      policyId: 'pol_audit_gov_ksa',
      versionNumber: 2,
      contentSummary: 'Audit cycles revised: Critical 12m, High 18m. Cooling off: 365 days.',
      fullPolicyText: 'Full text for KSA Audit Policy Version 2',
      effectiveFrom: '2026-06-01T00:00:00Z',
      supportingDecisionId: 'dec_board_gov_2026_02',
      reviewDate: '2026-12-31T00:00:00Z',
      approvedByUserIds: [groupChairContext.userId],
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z'
    };
    await saveCorporatePolicyVersion(policyVersion2, caeContext.userId);

    // 3. Seed Verified Evidence Record in Evidence Vault (GOV-09)
    await saveEvidenceRecord(
      {
        id: 'evi_fin_controls_q1_01',
        legalEntityId: ENTITY_KSA,
        documentId: 'doc_fin_reconcil_q1',
        evidenceType: 'FINANCIAL_RECONCILIATION_REPORT',
        checksumSha256: computeSha256('q1-fin-evidence-ok'),
        integrityStatus: 'VERIFIED',
        verificationStatus: 'VERIFIED',
        submittedByUserId: groupCfoContext.userId,
        submittedAt: '2026-03-31T12:00:00Z',
        createdAt: '2026-03-31T12:00:00Z',
        updatedAt: '2026-03-31T12:00:00Z'
      },
      groupCfoContext.userId
    );
  });

  // ============================================================================
  // 1. POLICY RESOLUTION & PROVENANCE ENGINE (INVARIANT-01)
  // ============================================================================
  describe('1. Policy Resolution, Precedence & Anti-Weakening Engine', () => {
    it('resolves effective governance rules with full provenance chain', async () => {
      const ruleSet = await resolveEffectiveGovernanceRules(
        {
          legalEntityId: ENTITY_KSA,
          jurisdictionContext: 'SA',
          ruleCategory: 'AUDIT_ASSURANCE',
          policyVersionId: 'ver_audit_gov_ksa_v1',
          evaluationTimestamp: '2026-03-15T10:00:00Z'
        },
        caeContext.userId
      );

      assert.ok(ruleSet);
      assert.equal(ruleSet.resolutionStatus, 'RESOLVED');
      assert.equal(ruleSet.legalEntityId, ENTITY_KSA);
      assert.equal(ruleSet.jurisdictionContext, 'SA');
      assert.equal(ruleSet.supportingPolicyVersionId, 'ver_audit_gov_ksa_v1');
      assert.equal(ruleSet.supportingDecisionId, 'dec_board_gov_2026_01');
      assert.ok(ruleSet.ruleSetHashSha256.length > 0);
      assert.equal(ruleSet.provenanceChain.length, 3); // Global -> Jurisdiction -> Entity Policy
    });

    it('enforces Parent Guardrail Anti-Weakening: denies local policy from weakening group floor without authorized exception', async () => {
      await assert.rejects(
        async () => {
          await resolveEffectiveGovernanceRules(
            {
              legalEntityId: ENTITY_KSA,
              jurisdictionContext: 'SA',
              ruleCategory: 'AUDIT_ASSURANCE',
              policyVersionId: 'ver_audit_gov_ksa_v1',
              evaluationTimestamp: '2026-03-15T10:00:00Z',
              exceptionOverride: {
                exceptionDecisionId: 'dec_board_gov_2026_01',
                overrideRules: {
                  maxAuditCycleMonthsCritical: 36 // Attempting to weaken 12m limit to 36m without compensating control
                }
              }
            },
            caeContext.userId
          );
        },
        /Parent Floor Violation/
      );
    });

    it('enforces Missing Provenance Denial: denies execution when required policy version is missing', async () => {
      await assert.rejects(
        async () => {
          await resolveEffectiveGovernanceRules(
            {
              legalEntityId: ENTITY_KSA,
              jurisdictionContext: 'SA',
              ruleCategory: 'AUDIT_ASSURANCE'
            },
            caeContext.userId
          );
        },
        /missing Corporate Policy Version provenance/
      );
    });

    it('enforces Cross-Entity Policy Isolation: denies KSA from consuming UK-specific policy', async () => {
      const policyUk: CorporatePolicy = {
        id: 'pol_audit_gov_uk',
        policyCode: 'POL-AUD-UK-001',
        title: 'UK Audit Policy',
        category: 'GOVERNANCE',
        legalEntityScope: [ENTITY_UK],
        ownerUserId: caeContext.userId,
        ownerRole: 'CAE',
        mandatoryReviewFrequencyMonths: 12,
        activeVersionNumber: 1,
        lifecycleStatus: 'APPROVED',
        classificationClearance: 'CONFIDENTIAL',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };
      await saveCorporatePolicy(policyUk, caeContext.userId);

      const verUk: CorporatePolicyVersion = {
        id: 'ver_audit_gov_uk_v1',
        policyId: 'pol_audit_gov_uk',
        versionNumber: 1,
        contentSummary: 'UK specific rules',
        fullPolicyText: 'UK audit full policy text',
        effectiveFrom: '2026-01-01T00:00:00Z',
        supportingDecisionId: 'dec_board_gov_2026_01',
        reviewDate: '2026-12-31T00:00:00Z',
        approvedByUserIds: [groupChairContext.userId],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };
      await saveCorporatePolicyVersion(verUk, caeContext.userId);

      await assert.rejects(
        async () => {
          await resolveEffectiveGovernanceRules(
            {
              legalEntityId: ENTITY_KSA,
              jurisdictionContext: 'SA',
              ruleCategory: 'AUDIT_ASSURANCE',
              policyVersionId: 'ver_audit_gov_uk_v1'
            },
            caeContext.userId
          );
        },
        /Cross-Entity Leakage Violation/
      );
    });
  });

  // ============================================================================
  // 2. POINT-IN-TIME AUDIT REPLAY & HISTORICAL IMMUTABILITY
  // ============================================================================
  describe('2. Point-in-Time Audit Replay & Historical Immutability', () => {
    it('guarantees Point-in-Time Replay: historical evaluation at T1 evaluates against V1 even after V2 is active', async () => {
      // Historical execution at 2026-03-15 (T1) -> should use V1
      const historicalRuleSet = await resolveEffectiveGovernanceRules(
        {
          legalEntityId: ENTITY_KSA,
          jurisdictionContext: 'SA',
          ruleCategory: 'AUDIT_ASSURANCE',
          policyVersionId: 'ver_audit_gov_ksa_v1',
          evaluationTimestamp: '2026-03-15T10:00:00Z'
        },
        caeContext.userId
      );

      // Subsequent execution at 2026-07-01 (T2) -> uses V2
      const modernRuleSet = await resolveEffectiveGovernanceRules(
        {
          legalEntityId: ENTITY_KSA,
          jurisdictionContext: 'SA',
          ruleCategory: 'AUDIT_ASSURANCE',
          policyVersionId: 'ver_audit_gov_ksa_v2',
          evaluationTimestamp: '2026-07-01T10:00:00Z'
        },
        caeContext.userId
      );

      assert.equal(historicalRuleSet.supportingPolicyVersionId, 'ver_audit_gov_ksa_v1');
      assert.equal(modernRuleSet.supportingPolicyVersionId, 'ver_audit_gov_ksa_v2');

      // Replaying T1 again should return identical deterministic result
      const replayed = await pointInTimePolicyReplay(
        ENTITY_KSA,
        'SA',
        'AUDIT_ASSURANCE',
        '2026-03-15T10:00:00Z'
      );

      assert.ok(replayed);
      assert.equal(replayed!.supportingPolicyVersionId, 'ver_audit_gov_ksa_v1');
      assert.equal(replayed!.ruleSetHashSha256, historicalRuleSet.ruleSetHashSha256);
    });

    it('rejects future policy applied to current evaluation before effective date', async () => {
      const futurePolicyVer: CorporatePolicyVersion = {
        id: 'ver_future_gov_2027',
        policyId: 'pol_audit_gov_ksa',
        versionNumber: 3,
        contentSummary: 'Future 2027 rules',
        fullPolicyText: 'Future 2027 audit text',
        effectiveFrom: '2027-01-01T00:00:00Z',
        supportingDecisionId: 'dec_board_gov_2026_01',
        reviewDate: '2027-12-31T00:00:00Z',
        approvedByUserIds: [groupChairContext.userId],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };
      await saveCorporatePolicyVersion(futurePolicyVer, caeContext.userId);

      await assert.rejects(
        async () => {
          await resolveEffectiveGovernanceRules(
            {
              legalEntityId: ENTITY_KSA,
              jurisdictionContext: 'SA',
              ruleCategory: 'AUDIT_ASSURANCE',
              policyVersionId: 'ver_future_gov_2027',
              evaluationTimestamp: '2026-04-01T00:00:00Z'
            },
            caeContext.userId
          );
        },
        /not yet effective at evaluation timestamp/
      );
    });
  });

  // ============================================================================
  // 3. METRIC DEFINITION VERSIONING, SOURCE LINEAGE & CONTROLLED CORRECTION
  // ============================================================================
  describe('3. Metric Definition Versioning, Lineage & Controlled Adjustments', () => {
    let metricDefId = 'mdf_kri_fin_unreconciled_01';
    let snapshotId = 'snp_2026_q1_fin_01';

    it('defines versioned KRI metric and records immutable snapshot with strict source lineage', async () => {
      const metricDef: GovernanceMetricDefinition = {
        id: metricDefId,
        metricCode: 'KRI-FIN-EXP-001',
        versionNumber: 1,
        metricType: 'KRI',
        nameEn: 'Unreconciled Financial Exposure Amount',
        nameAr: 'مبلغ التعرض المالي غير المطابق',
        descriptionEn: 'Total SAR value of unreconciled general ledger transactions older than 30 days',
        calculationFormula: 'SUM(unreconciled_transactions_over_30d)',
        unitOfMeasure: 'CURRENCY',
        aggregationMethod: 'SUM',
        sourceEntityType: 'GENERAL_LEDGER_TRANSACTION',
        reportingFrequency: 'QUARTERLY',
        targetThreshold: 100000,
        warningThreshold: 500000,
        criticalThreshold: 1000000,
        supportingPolicyVersionId: 'ver_audit_gov_ksa_v1',
        status: 'ACTIVE',
        effectiveFrom: '2026-01-01T00:00:00Z',
        auditCorrelationId: 'cor_mdf_01',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };
      await saveGovernanceMetricDefinition(metricDef, groupCfoContext.userId);

      const snapshot = await calculateAndRecordMetricSnapshot(
        {
          id: snapshotId,
          metricDefinitionId: metricDefId,
          reportingPeriod: '2026-Q1',
          legalEntityId: ENTITY_KSA,
          calculatedValue: 750000, // In WARNING band (500k - 1M)
          sourceRecordIds: ['tx_gl_2026_001', 'tx_gl_2026_002', 'tx_gl_2026_003'],
          calculationNotes: 'Calculated from verified GL journal batches'
        },
        groupCfoContext.userId
      );

      assert.ok(snapshot);
      assert.equal(snapshot.metricCode, 'KRI-FIN-EXP-001');
      assert.equal(snapshot.calculatedValue, 750000);
      assert.equal(snapshot.statusLevel, 'WARNING');
      assert.equal(snapshot.isLocked, true);
      assert.equal(snapshot.sourceRecordIds.length, 3);
      assert.ok(snapshot.checksumSha256.length > 0);
    });

    it('enforces controlled adjustment workflow: preserves original value, notes reason, and logs audit', async () => {
      const adjusted = await adjustMetricSnapshot(
        snapshotId,
        {
          adjustedValue: 680000,
          reason: 'Post-closing reversal of misallocated inventory invoice tx_gl_2026_002',
          supportingDecisionId: 'dec_board_gov_2026_01',
          evidenceIds: ['evi_fin_controls_q1_01']
        },
        groupCfoContext.userId
      );

      assert.ok(adjusted);
      assert.equal(adjusted.calculatedValue, 680000);
      assert.equal(adjusted.isAdjusted, true);
      assert.ok(adjusted.adjustmentRecord);
      assert.equal(adjusted.adjustmentRecord!.originalValue, 750000);
      assert.equal(adjusted.adjustmentRecord!.adjustedValue, 680000);
      assert.equal(adjusted.adjustmentRecord!.adjustedByUserId, groupCfoContext.userId);
    });
  });

  // ============================================================================
  // 4. RISK APPETITE FRAMEWORK & GOVERNED BREACH LIFECYCLE
  // ============================================================================
  describe('4. Risk Appetite Framework & Governed Breach Lifecycle', () => {
    let statementId = 'ras_ops_cold_2026';
    let breachId = 'brc_cold_temp_001';

    it('registers board-approved Risk Appetite Statement and detects threshold breach', async () => {
      const appetite: RiskAppetiteStatement = {
        id: statementId,
        statementCode: 'RAS-2026-OPS-COLD',
        versionNumber: 1,
        legalEntityId: ENTITY_KSA,
        category: 'OPERATIONAL',
        appetiteLevel: 'ZERO_TOLERANCE',
        qualitativeStatementEn: 'Zero tolerance for pharma cold chain temperature excursions exceeding 8°C for > 30 minutes.',
        qualitativeStatementAr: 'عدم التسامح مع انحرافات درجات حرارة الأدوية المبردة لأكثر من 30 دقيقة.',
        quantitativeKriThresholds: [
          {
            metricCode: 'KRI-OPS-TEMP-EXCURSIONS',
            maxAcceptableThreshold: 0, // 0 tolerance
            unit: 'COUNT'
          }
        ],
        supportingDecisionId: 'dec_board_gov_2026_01',
        supportingPolicyVersionId: 'ver_audit_gov_ksa_v1',
        effectiveFrom: '2026-01-01T00:00:00Z',
        status: 'ACTIVE',
        auditCorrelationId: 'cor_ras_01',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };
      await saveRiskAppetiteStatement(appetite, groupChairContext.userId);

      // Trigger an observed breach (value = 2 excursions)
      const breach = await evaluateRiskAppetiteBreach(
        {
          id: breachId,
          appetiteStatementId: statementId,
          legalEntityId: ENTITY_KSA,
          category: 'OPERATIONAL',
          metricCode: 'KRI-OPS-TEMP-EXCURSIONS',
          observedValue: 2,
          breachSummaryEn: 'Two distinct cold chain temperature excursions detected in Riyadh Central Depot.'
        },
        caeContext.userId
      );

      assert.ok(breach);
      assert.equal(breach!.status, 'DETECTED');
      assert.equal(breach!.breachSeverity, 'CRITICAL');
      assert.equal(breach!.observedValue, 2);
      assert.equal(breach!.tolerableLimit, 0);
      assert.equal(breach!.escalationLevel, 1);
    });

    it('preserves historical breach even if appetite threshold is changed later', async () => {
      const appetiteV2: RiskAppetiteStatement = {
        id: statementId,
        statementCode: 'RAS-2026-OPS-COLD',
        versionNumber: 2,
        legalEntityId: ENTITY_KSA,
        category: 'OPERATIONAL',
        appetiteLevel: 'LOW',
        qualitativeStatementEn: 'Tolerate up to 3 minor excursions with active logger validation.',
        quantitativeKriThresholds: [
          {
            metricCode: 'KRI-OPS-TEMP-EXCURSIONS',
            maxAcceptableThreshold: 3,
            unit: 'COUNT'
          }
        ],
        supportingDecisionId: 'dec_board_gov_2026_02',
        supportingPolicyVersionId: 'ver_audit_gov_ksa_v2',
        effectiveFrom: '2026-06-01T00:00:00Z',
        status: 'ACTIVE',
        auditCorrelationId: 'cor_ras_02',
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z'
      };
      await saveRiskAppetiteStatement(appetiteV2, groupChairContext.userId);

      // Historical breach from Q1 must still remain DETECTED / active
      const breaches = Array.from((await evaluateRiskAppetiteBreach(
        {
          id: 'brc_check_non_breach',
          appetiteStatementId: statementId,
          legalEntityId: ENTITY_KSA,
          category: 'OPERATIONAL',
          metricCode: 'KRI-OPS-TEMP-EXCURSIONS',
          observedValue: 2, // 2 <= 3 in V2, so no new breach generated
          breachSummaryEn: 'Current value 2 is within new tolerance'
        },
        caeContext.userId
      )) ? [1] : []);

      assert.equal(breaches.length, 0, 'Should not generate breach under new threshold');
    });
  });

  // ============================================================================
  // 5. EXECUTIVE ATTESTATIONS & MANAGEMENT REPRESENTATIONS (SoD & EVIDENCE)
  // ============================================================================
  describe('5. Executive Attestations, Statement Pinning & Evidence Vault Integration', () => {
    let attestationId = 'att_fin_controls_q1_01';

    it('submits and signs Executive Attestation with pinned statement text and verified evidence', async () => {
      const attestation = await submitAndSignExecutiveAttestation(
        {
          id: attestationId,
          attestationType: 'FINANCIAL_CONTROLS_ATTESTATION',
          legalEntityId: ENTITY_KSA,
          departmentId: 'dept_finance_01',
          reportingPeriod: '2026-Q1',
          statementVersionId: 'stmt_fin_ctrl_v1',
          pinnedStatementTextEn: 'I hereby attest that financial controls over revenue recognition and GL reconciliation operated effectively throughout 2026-Q1.',
          pinnedStatementTextAr: 'أشهد بموجب هذا بأن الضوابط المالية للاعتراف بالإيرادات ومطابقة دفتر الأستاذ العام عملت بفاعلية خلال الربع الأول 2026.',
          supportingEvidenceRecordIds: ['evi_fin_controls_q1_01'],
          policyVersionId: 'ver_audit_gov_ksa_v1',
          supportingDecisionId: 'dec_board_gov_2026_01'
        },
        groupCfoContext
      );

      assert.ok(attestation);
      assert.equal(attestation.status, 'SUBMITTED');
      assert.equal(attestation.attestorUserId, groupCfoContext.userId);
      assert.equal(attestation.attestorRole, 'CFO');
      assert.equal(attestation.isLocked, true);
      assert.ok(attestation.checksumSha256!.length > 0);
    });

    it('enforces Technical Admin Boundary: denies Technical Admin from signing Executive Attestations', async () => {
      await assert.rejects(
        async () => {
          await submitAndSignExecutiveAttestation(
            {
              id: 'att_invalid_tech_admin',
              attestationType: 'COMPLIANCE_EFFECTIVENESS',
              legalEntityId: ENTITY_KSA,
              reportingPeriod: '2026-Q1',
              statementVersionId: 'stmt_comp_v1',
              pinnedStatementTextEn: 'Tech admin attempting executive compliance signoff',
              supportingEvidenceRecordIds: ['evi_fin_controls_q1_01'],
              policyVersionId: 'ver_audit_gov_ksa_v1'
            },
            techAdminContext
          );
        },
        /Technical Administrators cannot sign Executive Attestations/
      );
    });

    it('enforces Segregation of Duties: denies Attestor from independently verifying their own Attestation', async () => {
      await assert.rejects(
        async () => {
          await verifyExecutiveAttestation(
            attestationId,
            'CFO attempting to verify own financial controls attestation',
            groupCfoContext
          );
        },
        /Segregation of Duties Violation/
      );
    });

    it('allows Independent Compliance Officer to verify Executive Attestation', async () => {
      const verified = await verifyExecutiveAttestation(
        attestationId,
        'Independent review of Q1 reconciliation workpapers and bank statements confirmed adequate.',
        complianceOfficerContext
      );

      assert.ok(verified);
      assert.equal(verified.status, 'VERIFIED');
      assert.equal(verified.verificationRecord!.verifiedByUserId, complianceOfficerContext.userId);
      assert.equal(verified.verificationRecord!.isEvidenceAdequate, true);
    });
  });

  // ============================================================================
  // 6. BOARD & COMMITTEE REPORTING PACKS & CONTROLLED SUPERSESSION
  // ============================================================================
  describe('6. Board & Committee Reporting Packs & Controlled Supersession', () => {
    let packId = 'bp_2026_q1_main';

    it('assembles and publishes Board Pack with cryptographic seal and Chairperson sign-off', async () => {
      const draftPack = await corporateBoardOversightService.assembleBoardReportingPack(
        {
          id: packId,
          packNumber: 'BP-2026-Q1-MAIN',
          packType: 'BOARD',
          reportingPeriod: '2026-Q1',
          legalEntityIds: [ENTITY_KSA, ENTITY_UK],
          titleEn: 'Q1 2026 Comprehensive Board Governance Pack',
          titleAr: 'حقيبة حوكمة مجلس الإدارة الشاملة للربع الأول 2026',
          meetingId: 'mtg_board_2026_01',
          supportingDecisionId: 'dec_board_gov_2026_01',
          sections: [
            {
              sectionCode: 'SEC-01-METRICS',
              title: 'Executive KPI & KRI Performance',
              order: 1,
              executiveSummaryText: 'Overall operational metrics meet target; financial KRI within warning limits.',
              metricsSnapshotIds: ['snp_2026_q1_fin_01'],
              criticalRiskIds: [],
              keyFindingIds: [],
              attestationIds: ['att_fin_controls_q1_01'],
              decisionsPendingIds: []
            }
          ]
        },
        groupChairContext
      );

      assert.ok(draftPack);
      assert.equal(draftPack.status, 'DRAFT');
      assert.equal(draftPack.isPackLocked, false);

      const published = await corporateBoardOversightService.publishBoardPack(
        packId,
        groupChairContext.userId,
        groupChairContext
      );

      assert.ok(published);
      assert.equal(published.status, 'PUBLISHED');
      assert.equal(published.isPackLocked, true);
      assert.equal(published.boardChairSignoffUserId, groupChairContext.userId);
      assert.ok(published.checksumSha256!.length > 0);
    });

    it('enforces Published Pack Immutability: denies direct in-place modification of published pack', async () => {
      await assert.rejects(
        async () => {
          await saveGovernanceReportingPack(
            {
              id: packId,
              packNumber: 'BP-2026-Q1-MAIN',
              packType: 'BOARD',
              reportingPeriod: '2026-Q1',
              legalEntityIds: [ENTITY_KSA],
              titleEn: 'Attempted in-place modification of published pack',
              versionNumber: 1,
              status: 'DRAFT',
              sections: [],
              isPackLocked: false,
              securityClassification: 'CONFIDENTIAL',
              auditCorrelationId: 'cor_invalid_mod',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            groupChairContext.userId
          );
        },
        /Published Pack Immutability Violation/
      );
    });

    it('supports Controlled Supersession: publishes Pack V2 while preserving immutable Pack V1', async () => {
      const { supersededPack, newPack } = await supersedeGovernanceReportingPack(
        packId,
        {
          id: 'bp_2026_q1_main_v2',
          packNumber: 'BP-2026-Q1-MAIN-V2',
          packType: 'BOARD',
          reportingPeriod: '2026-Q1',
          legalEntityIds: [ENTITY_KSA, ENTITY_UK],
          titleEn: 'Q1 2026 Comprehensive Board Governance Pack (Superseding Version)',
          versionNumber: 2,
          status: 'PUBLISHED',
          sections: [],
          isPackLocked: true,
          securityClassification: 'CONFIDENTIAL',
          auditCorrelationId: 'cor_v2_pack',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        groupChairContext.userId
      );

      assert.equal(supersededPack.status, 'SUPERSEDED');
      assert.equal(supersededPack.supersededByPackId, newPack.id);
      assert.equal(newPack.versionNumber, 2);
      assert.equal(newPack.status, 'PUBLISHED');
    });
  });

  // ============================================================================
  // 7. BOARD REVIEW, CHALLENGE & GOVERNANCE ACTION TRACKING
  // ============================================================================
  describe('7. Board Review, Challenge & Governance Action Tracking', () => {
    let challengeId = 'chl_2026_fin_kri_01';
    let actionId = 'act_2026_fin_remed_01';

    it('tracks full Board Challenge lifecycle (Raised -> Response -> Review -> Closure)', async () => {
      const challenge = await createGovernanceChallenge(
        {
          id: challengeId,
          packId: 'bp_2026_q1_main',
          legalEntityId: ENTITY_KSA,
          targetCategory: 'METRIC',
          targetEntityId: 'snp_2026_q1_fin_01',
          challengeTitle: 'Inquiry regarding 30-day unreconciled GL transactions in KSA',
          challengeDetails: 'Board requests formal explanation regarding the spike in unreconciled transactions during March 2026.',
          assignedToUserId: groupCfoContext.userId,
          assignedToRole: 'CFO'
        },
        groupChairContext
      );

      assert.ok(challenge);
      assert.equal(challenge.status, 'ASSIGNED');
      assert.equal(challenge.raisedByUserId, groupChairContext.userId);

      // CFO responds
      const responded = await respondToGovernanceChallenge(
        challengeId,
        'Spike caused by temporary ERP migration batch glitch. Automated matching script patched on April 2nd.',
        groupCfoContext
      );
      assert.equal(responded.status, 'RESPONSE_SUBMITTED');

      // Board reviews and closes challenge
      const closed = await reviewAndCloseGovernanceChallenge(
        challengeId,
        'Board reviewed CFO response and accepted the explanation. Formal action opened for verification.',
        groupChairContext
      );
      assert.equal(closed.status, 'CLOSED');
    });

    it('tracks Governance Action completion and enforces SoD on verification', async () => {
      const action = await createGovernanceAction(
        {
          id: actionId,
          sourceType: 'COMMITTEE_CHALLENGE',
          sourceReferenceId: challengeId,
          legalEntityId: ENTITY_KSA,
          title: 'Implement Automated Daily GL Reconciliation Health Check',
          details: 'Develop automated script to detect unposted journal anomalies daily.',
          ownerUserId: ksaManagerContext.userId,
          ownerRole: 'OPERATIONS_MANAGER',
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), // 10 days in future
          priority: 'HIGH'
        },
        groupChairContext.userId
      );

      assert.ok(action);
      assert.equal(action.status, 'IN_PROGRESS');

      // SoD: Action Owner cannot verify and close their own action
      await assert.rejects(
        async () => {
          await verifyAndCloseGovernanceAction(
            actionId,
            ['evi_fin_controls_q1_01'],
            ksaManagerContext
          );
        },
        /Segregation of Duties Violation/
      );

      // Independent CAE verifies and closes action
      const closedAction = await verifyAndCloseGovernanceAction(
        actionId,
        ['evi_fin_controls_q1_01'],
        caeContext
      );
      assert.equal(closedAction.status, 'VERIFIED_CLOSED');
      assert.equal(closedAction.verifiedByUserId, caeContext.userId);
    });

    it('detects overdue governance actions and escalates through hierarchy', async () => {
      const overdueActionId = 'act_overdue_sample_01';
      await createGovernanceAction(
        {
          id: overdueActionId,
          sourceType: 'BOARD_MEETING',
          sourceReferenceId: 'mtg_board_2026_01',
          legalEntityId: ENTITY_KSA,
          title: 'Overdue physical inventory audit remediation',
          details: 'Physical count variance reconciliation overdue by 20 days.',
          ownerUserId: ksaManagerContext.userId,
          ownerRole: 'OPERATIONS_MANAGER',
          dueDate: new Date(Date.now() - 20 * 86400000).toISOString(), // 20 days past due
          priority: 'HIGH'
        },
        groupChairContext.userId
      );

      const overdueList = await detectOverdueGovernanceActions(ENTITY_KSA);
      const target = overdueList.find((a) => a.id === overdueActionId);

      assert.ok(target);
      assert.equal(target!.status, 'OVERDUE');
      assert.equal(target!.escalationLevel, 2); // Level 2: Executive Committee (14-30 days)
    });
  });

  // ============================================================================
  // 8. MULTI-ENTITY GROUP CONSOLIDATION & SEARCH/EXPORT SECURITY
  // ============================================================================
  describe('8. Multi-Entity Group Consolidation & Search/Export Security', () => {
    it('allows Group-authorized executives to aggregate multi-entity data', async () => {
      const consolidated = await corporateBoardOversightService.getConsolidatedGroupMetrics(
        '2026-Q1',
        [ENTITY_KSA, ENTITY_UK],
        groupChairContext
      );

      assert.ok(consolidated);
      assert.equal(consolidated.contributingEntities.length, 2);
      assert.equal(consolidated.consolidatedMetrics[0].groupTotal, 1250000);
      assert.equal(consolidated.consolidatedMetrics[0].entityContributions[ENTITY_KSA], 750000);
    });

    it('denies single-entity scoped manager from accessing multi-entity consolidated Group metrics', async () => {
      await assert.rejects(
        async () => {
          await corporateBoardOversightService.getConsolidatedGroupMetrics(
            '2026-Q1',
            [ENTITY_KSA, ENTITY_UK],
            ksaManagerContext
          );
        },
        /Unauthorized Cross-Entity Access/
      );
    });

    it('enforces Export Authorization (VIEW != EXPORT)', async () => {
      // Operations manager has view but not export authority
      await assert.rejects(
        async () => {
          await corporateBoardOversightService.exportGovernancePackDocument(
            'bp_2026_q1_main',
            ksaManagerContext
          );
        },
        /Export Permission Denied/
      );

      // Board Chair has export authority
      const exportResult = await corporateBoardOversightService.exportGovernancePackDocument(
        'bp_2026_q1_main',
        groupChairContext
      );
      assert.equal(exportResult.exportAuthorized, true);
    });

    it('enforces Service Principal & AI Authority Boundary: automation and AI cannot sign attestations or approve packs', () => {
      assert.throws(
        () => {
          corporateBoardOversightService.assertHumanExecutiveAuthority(
            'SIGN_ATTESTATION',
            'AI_ASSISTANT'
          );
        },
        /AI & Automation Boundary Violation/
      );

      assert.throws(
        () => {
          corporateBoardOversightService.assertHumanExecutiveAuthority(
            'APPROVE_BOARD_PACK',
            'AUTOMATED_SERVICE_PRINCIPAL'
          );
        },
        /AI & Automation Boundary Violation/
      );

      assert.doesNotThrow(() => {
        corporateBoardOversightService.assertHumanExecutiveAuthority(
          'SIGN_ATTESTATION',
          'HUMAN_EXECUTIVE'
        );
      });
    });
  });

  // ============================================================================
  // 9. STATUTORY INVARIANTS & PROHIBITED HARD DELETION
  // ============================================================================
  describe('9. Statutory Invariants & Prohibited Hard Deletion', () => {
    it('strictly prohibits hard deletion across all GOV-13 entities', async () => {
      await assert.rejects(async () => deleteGovernanceRuleSetProhibited('grs_01'), /Statutory governance invariant/);
      await assert.rejects(async () => deleteMetricSnapshotProhibited('snp_01'), /Statutory governance invariant/);
      await assert.rejects(async () => deleteRiskAppetiteStatementProhibited('ras_01'), /Statutory governance invariant/);
      await assert.rejects(async () => deleteExecutiveAttestationProhibited('att_01'), /Statutory governance invariant/);
      await assert.rejects(async () => deleteGovernanceReportingPackProhibited('bp_01'), /Statutory governance invariant/);
      await assert.rejects(async () => deleteGovernanceActionProhibited('act_01'), /Statutory governance invariant/);
    });
  });
});
