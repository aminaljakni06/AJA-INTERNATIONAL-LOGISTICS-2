/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Test Suite
 * Step GOV-11: Governance Risk, Control Assurance, Exceptions, Findings & Remediation Management
 * File: src/tests/step44GovernanceRiskAssurance.test.ts
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskSeverity,
  resetRiskAssuranceRepositoryMemoryStore,
  saveGovernanceRisk,
  getGovernanceRiskById,
  listGovernanceRisksByEntity,
  acceptGovernanceRisk,
  isRiskAcceptanceActive,
  performControlAssessment,
  getControlAssessmentById,
  saveGovernanceException,
  getGovernanceExceptionById,
  approveGovernanceException,
  revokeGovernanceException,
  isExceptionActive,
  saveGovernanceFinding,
  getGovernanceFindingById,
  listGovernanceFindingsByEntity,
  closeGovernanceFinding,
  reopenGovernanceFinding,
  saveRemediationAction,
  getRemediationActionById,
  escalateOverdueRemediationActions,
  deleteGovernanceAssuranceRecordProhibited
} from '../db/repositories/corporateRiskAssuranceRepository';
import {
  saveInternalControl,
  resetCorporateAuthorityMemoryStore
} from '../db/repositories/corporateAuthorityRepository';
import {
  saveCorporateDecision,
  resetCorporateGovernanceMemoryStore
} from '../db/repositories/corporateGovernanceRepository';
import {
  saveEvidenceRecord,
  resetCorporateRecordsRepositoryMemoryStore
} from '../db/repositories/corporateRecordsRepository';
import {
  GovernanceRisk,
  ControlAssessment,
  GovernanceException,
  GovernanceFinding,
  RemediationAction,
  InternalControl,
  CorporateDecision,
  EvidenceRecord
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';

describe('STEP GOV-11: Enterprise Governance Risk, Control Assurance, Exceptions & Findings', () => {
  const ENTITY_KSA = 'entity_aja_sa';
  const ENTITY_UK = 'entity_aja_uk';

  const ceoContext: UserContext = {
    userId: 'usr_ceo_01',
    role: 'CEO',
    legalEntityId: ENTITY_KSA
  };

  const cfoContext: UserContext = {
    userId: 'usr_cfo_01',
    role: 'CFO',
    legalEntityId: ENTITY_KSA
  };

  const auditorContext: UserContext = {
    userId: 'usr_auditor_01',
    role: 'AUDITOR',
    legalEntityId: ENTITY_KSA
  };

  const techAdminContext: UserContext = {
    userId: 'usr_tech_admin',
    role: 'SYSTEM_ADMIN',
    legalEntityId: ENTITY_KSA
  };

  const opsManagerContext: UserContext = {
    userId: 'usr_ops_mgr',
    role: 'OPERATIONS_MANAGER',
    legalEntityId: ENTITY_KSA
  };

  beforeEach(() => {
    resetRiskAssuranceRepositoryMemoryStore();
    resetCorporateAuthorityMemoryStore();
    resetCorporateGovernanceMemoryStore();
    resetCorporateRecordsRepositoryMemoryStore();
  });

  // ==========================================================================
  // 1. RISK FORMULA & SEPARATION OF INHERENT VS RESIDUAL RISK
  // ==========================================================================
  describe('1. Enterprise Risk Matrix & Inherent vs Residual Separation', () => {
    it('calculates standard 5x5 enterprise risk matrix scores and categories correctly', () => {
      assert.deepEqual(calculateRiskSeverity(1, 2), { score: 2, severity: 'LOW' });
      assert.deepEqual(calculateRiskSeverity(2, 3), { score: 6, severity: 'MEDIUM' });
      assert.deepEqual(calculateRiskSeverity(3, 4), { score: 12, severity: 'HIGH' });
      assert.deepEqual(calculateRiskSeverity(4, 5), { score: 20, severity: 'CRITICAL' });
      assert.deepEqual(calculateRiskSeverity(5, 5), { score: 25, severity: 'CRITICAL' });
    });

    it('preserves inherent risk metrics when residual risk is updated or mitigated', async () => {
      const risk: GovernanceRisk = {
        id: 'rsk_customs_001',
        riskNumber: 'RSK-2026-0001',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        riskCategory: 'REGULATORY',
        title: 'Customs Declaration Delay Risk',
        description: 'Delays in customs clearance due to ZATCA / FASAH tariff classification changes',
        sourceType: 'COMPLIANCE_ASSESSMENT',
        ownerUserId: 'usr_ops_mgr',
        ownerRole: 'OPERATIONS_MANAGER',
        inherentLikelihood: 5,
        inherentImpact: 4, // 5 x 4 = 20 (CRITICAL)
        inherentScore: 20,
        inherentSeverity: 'CRITICAL',
        controlIds: ['ctl_zatca_01'],
        controlEffectivenessSummary: 'EFFECTIVE',
        residualLikelihood: 2,
        residualImpact: 2, // 2 x 2 = 4 (LOW)
        residualScore: 4,
        residualSeverity: 'LOW',
        riskTreatmentStrategy: 'MITIGATE',
        isRiskAccepted: false,
        riskStatus: 'IDENTIFIED',
        assessmentHistory: [],
        lastAssessedAt: new Date().toISOString(),
        classification: 'CONFIDENTIAL',
        auditCorrelationId: 'cor_rsk_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = await saveGovernanceRisk(risk, 'usr_ops_mgr');
      assert.equal(saved.inherentScore, 20);
      assert.equal(saved.inherentSeverity, 'CRITICAL');
      assert.equal(saved.residualScore, 4);
      assert.equal(saved.residualSeverity, 'LOW');
      assert.equal(saved.assessmentHistory.length, 1);

      // Update residual assessment with higher likelihood
      const updatedRisk: GovernanceRisk = {
        ...saved,
        residualLikelihood: 3,
        residualImpact: 3, // 3 x 3 = 9 (MEDIUM)
        residualAssessmentRationale: 'Regulatory inspection frequency increased by authority'
      };

      const updated = await saveGovernanceRisk(updatedRisk, 'usr_cfo_01');
      assert.equal(updated.inherentScore, 20); // Inherent remains 20 (CRITICAL)
      assert.equal(updated.inherentSeverity, 'CRITICAL');
      assert.equal(updated.residualScore, 9); // Residual shifted to 9 (MEDIUM)
      assert.equal(updated.residualSeverity, 'MEDIUM');
      assert.equal(updated.assessmentHistory.length, 2); // History preserved
      assert.equal(updated.assessmentHistory[0].score, 4);
      assert.equal(updated.assessmentHistory[1].score, 9);
    });
  });

  // ==========================================================================
  // 2. PRIVILEGED RISK ACCEPTANCE & AUTHORITY ENFORCEMENT
  // ==========================================================================
  describe('2. Privileged Risk Acceptance & Authority Controls', () => {
    it('denies technical administrators from accepting business risks', async () => {
      const risk: GovernanceRisk = {
        id: 'rsk_tax_001',
        riskNumber: 'RSK-2026-0002',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        riskCategory: 'FINANCIAL',
        title: 'VAT Filing Timing Difference',
        description: 'Risk of penalty from delayed input tax claim reconciliation',
        sourceType: 'INTERNAL_AUDIT',
        ownerUserId: 'usr_ops_mgr',
        inherentLikelihood: 4,
        inherentImpact: 4,
        inherentScore: 16,
        inherentSeverity: 'CRITICAL',
        controlIds: [],
        controlEffectivenessSummary: 'NO_CONTROLS',
        residualLikelihood: 4,
        residualImpact: 4,
        residualScore: 16,
        residualSeverity: 'CRITICAL',
        riskTreatmentStrategy: 'ACCEPT',
        isRiskAccepted: false,
        riskStatus: 'IDENTIFIED',
        assessmentHistory: [],
        lastAssessedAt: new Date().toISOString(),
        classification: 'CONFIDENTIAL',
        auditCorrelationId: 'cor_rsk_002',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceRisk(risk, 'usr_ops_mgr');

      await assert.rejects(
        async () => {
          await acceptGovernanceRisk(
            'rsk_tax_001',
            {
              acceptedByUserId: techAdminContext.userId,
              acceptedByRole: 'SYSTEM_ADMIN',
              acceptanceReason: 'Admin bypass acceptance'
            },
            techAdminContext
          );
        },
        /Technical administrators.*cannot grant corporate risk acceptance/
      );
    });

    it('denies high/critical risk acceptance without C-Suite authority and formal Board Decision', async () => {
      const risk: GovernanceRisk = {
        id: 'rsk_crit_001',
        riskNumber: 'RSK-2026-0003',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        riskCategory: 'COMPLIANCE',
        title: 'Licensing Renewal Gap',
        description: 'Operation during 14-day regulatory license transition period',
        sourceType: 'COMPLIANCE_ASSESSMENT',
        ownerUserId: 'usr_ops_mgr',
        inherentLikelihood: 5,
        inherentImpact: 4,
        inherentScore: 20,
        inherentSeverity: 'CRITICAL',
        controlIds: [],
        controlEffectivenessSummary: 'NO_CONTROLS',
        residualLikelihood: 4,
        residualImpact: 4,
        residualScore: 16,
        residualSeverity: 'CRITICAL',
        riskTreatmentStrategy: 'ACCEPT',
        isRiskAccepted: false,
        riskStatus: 'IDENTIFIED',
        assessmentHistory: [],
        lastAssessedAt: new Date().toISOString(),
        classification: 'RESTRICTED',
        auditCorrelationId: 'cor_rsk_003',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceRisk(risk, 'usr_ops_mgr');

      // Attempt 1: Operations manager cannot accept Critical risk
      await assert.rejects(
        async () => {
          await acceptGovernanceRisk(
            'rsk_crit_001',
            {
              acceptedByUserId: opsManagerContext.userId,
              acceptedByRole: 'OPERATIONS_MANAGER',
              acceptanceReason: 'Ops needs to continue'
            },
            opsManagerContext
          );
        },
        /High\/Critical risk acceptance requires executive authority/
      );

      // Attempt 2: CEO accepts but missing supporting Board Decision
      await assert.rejects(
        async () => {
          await acceptGovernanceRisk(
            'rsk_crit_001',
            {
              acceptedByUserId: ceoContext.userId,
              acceptedByRole: 'CEO',
              acceptanceReason: 'CEO interim approval'
            },
            ceoContext
          );
        },
        /requires formal Board\/Executive Resolution/
      );

      // Seed valid Board Resolution in GOV-06 Decision Register
      const boardDecision: CorporateDecision = {
        id: 'dec_board_risk_2026_01',
        decisionNumber: 'DEC-2026-0099',
        legalEntityId: ENTITY_KSA,
        decisionType: 'RISK_ACCEPTANCE',
        decisionScope: 'STATUTORY_RESTRUCTURING',
        titleEn: 'Board Acceptance of License Transition Risk',
        titleAr: 'موافقة مجلس الإدارة على قبول مخاطر الفترة الانتقالية للترخيص',
        summaryEn: 'Approved continuing operations during license renewal period with enhanced daily monitoring.',
        lifecycleStatus: 'APPROVED',
        decisionStatus: 'APPROVED',
        authorityLevelRequired: 'BOARD_OF_DIRECTORS',
        approvalThresholdPercentage: 100,
        unanimousRequired: false,
        quorumRequiredPercentage: 50,
        approvedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        isStatutoryFilingRequired: false,
        isExecutionControlled: true,
        auditCorrelationId: 'cor_dec_099',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveCorporateDecision(boardDecision, ceoContext.userId);

      // Attempt 3: CEO accepts with valid Board Decision -> SUCCESS
      const acceptedRisk = await acceptGovernanceRisk(
        'rsk_crit_001',
        {
          acceptedByUserId: ceoContext.userId,
          acceptedByRole: 'CEO',
          acceptanceReason: 'Board approved interim transition under Resolution DEC-2026-0099',
          supportingDecisionId: 'dec_board_risk_2026_01',
          acceptedUntil: new Date(Date.now() + 60 * 86400000).toISOString()
        },
        ceoContext
      );

      assert.equal(acceptedRisk.isRiskAccepted, true);
      assert.equal(acceptedRisk.acceptedByUserId, ceoContext.userId);
      assert.equal(acceptedRisk.riskStatus, 'ACCEPTED');
      assert.equal(isRiskAcceptanceActive(acceptedRisk), true);
    });

    it('evaluates expired risk acceptance as inactive at runtime', () => {
      const expiredRisk: GovernanceRisk = {
        id: 'rsk_exp_001',
        riskNumber: 'RSK-2026-0004',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        riskCategory: 'OPERATIONAL',
        title: 'Warehouse Overcapacity Risk',
        description: 'Temporary surge risk',
        sourceType: 'MANUAL',
        ownerUserId: 'usr_ops_mgr',
        inherentLikelihood: 3,
        inherentImpact: 3,
        inherentScore: 9,
        inherentSeverity: 'MEDIUM',
        controlIds: [],
        controlEffectivenessSummary: 'NO_CONTROLS',
        residualLikelihood: 3,
        residualImpact: 3,
        residualScore: 9,
        residualSeverity: 'MEDIUM',
        riskTreatmentStrategy: 'ACCEPT',
        isRiskAccepted: true,
        acceptedByUserId: 'usr_ceo_01',
        acceptedByRole: 'CEO',
        acceptedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        acceptedUntil: new Date(Date.now() - 2 * 86400000).toISOString(), // Expired 2 days ago
        riskStatus: 'ACCEPTED',
        assessmentHistory: [],
        lastAssessedAt: new Date().toISOString(),
        classification: 'INTERNAL',
        auditCorrelationId: 'cor_rsk_004',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      assert.equal(isRiskAcceptanceActive(expiredRisk), false);
    });
  });

  // ==========================================================================
  // 3. INTERNAL CONTROL ASSURANCE & FAILURE PROPAGATION
  // ==========================================================================
  describe('3. Control Assurance, SoD & Failure Propagation', () => {
    it('denies control owner from acting as the independent assurance assessor', async () => {
      const control: InternalControl = {
        id: 'ctl_fin_payroll_01',
        controlCode: 'CTL-FIN-002',
        title: 'Dual Authorization on Outgoing Payroll Disbursements',
        description: 'Requires Finance Manager and CFO signature on payroll batch files',
        legalEntityId: ENTITY_KSA,
        controlType: 'PREVENTIVE',
        frequency: 'MONTHLY',
        ownerUserId: 'usr_cfo_01',
        ownerRole: 'CFO',
        isAutomated: true,
        status: 'ACTIVE',
        operatingEffectiveness: 'EFFECTIVE',
        auditCorrelationId: 'cor_ctl_002',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveInternalControl(control, 'usr_cfo_01');

      const assessment: ControlAssessment = {
        id: 'asm_ctl_001',
        controlId: 'ctl_fin_payroll_01',
        controlCode: 'CTL-FIN-002',
        legalEntityId: ENTITY_KSA,
        assessmentPeriod: '2026-Q1',
        assessmentType: 'OPERATING_EFFECTIVENESS',
        assessorUserId: 'usr_cfo_01', // Control owner attempting independent audit
        assessorRole: 'CFO',
        isIndependentAssessor: true,
        testProcedure: 'Sampled 25 payroll transactions',
        designEffectiveness: 'EFFECTIVE',
        operatingEffectiveness: 'EFFECTIVE',
        overallResult: 'EFFECTIVE',
        evidenceIds: [],
        findingIds: [],
        propagatedToRiskIds: [],
        assessedAt: new Date().toISOString(),
        auditCorrelationId: 'cor_asm_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await assert.rejects(
        async () => {
          await performControlAssessment(assessment, cfoContext);
        },
        /Separation of Duties violation: Control owner.*cannot act as the independent assurance assessor/
      );
    });

    it('propagates control failure: updates control, creates audit finding, and recalculates residual risk upwards', async () => {
      // 1. Seed Control
      const control: InternalControl = {
        id: 'ctl_fleet_01',
        controlCode: 'CTL-OPS-010',
        title: 'Daily Vehicle Pre-Trip Safety Inspection',
        description: 'Mandatory driver inspection checklist prior to container dispatch',
        legalEntityId: ENTITY_KSA,
        controlType: 'PREVENTIVE',
        frequency: 'DAILY',
        ownerUserId: 'usr_ops_mgr',
        ownerRole: 'OPERATIONS_MANAGER',
        isAutomated: false,
        status: 'ACTIVE',
        operatingEffectiveness: 'EFFECTIVE',
        auditCorrelationId: 'cor_ctl_010',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveInternalControl(control, 'usr_ops_mgr');

      // 2. Seed Mapped Risk
      const risk: GovernanceRisk = {
        id: 'rsk_fleet_accident',
        riskNumber: 'RSK-2026-0010',
        legalEntityId: ENTITY_KSA,
        jurisdiction: 'SA',
        riskCategory: 'OPERATIONAL',
        title: 'Vehicle Road Breakdown Risk',
        description: 'Unscheduled breakdowns causing cargo delays and penalties',
        sourceType: 'INTERNAL_AUDIT',
        ownerUserId: 'usr_ops_mgr',
        inherentLikelihood: 4,
        inherentImpact: 3, // Inherent = 12 (HIGH)
        inherentScore: 12,
        inherentSeverity: 'HIGH',
        controlIds: ['ctl_fleet_01'],
        controlEffectivenessSummary: 'EFFECTIVE',
        residualLikelihood: 1,
        residualImpact: 3, // Residual = 3 (LOW)
        residualScore: 3,
        residualSeverity: 'LOW',
        riskTreatmentStrategy: 'MITIGATE',
        isRiskAccepted: false,
        riskStatus: 'TREATMENT_IN_PROGRESS',
        assessmentHistory: [],
        lastAssessedAt: new Date().toISOString(),
        classification: 'INTERNAL',
        auditCorrelationId: 'cor_rsk_010',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceRisk(risk, 'usr_ops_mgr');

      // 3. Auditor performs assessment -> Test fails (DEFICIENT)
      const assessment: ControlAssessment = {
        id: 'asm_ctl_fail_01',
        controlId: 'ctl_fleet_01',
        controlCode: 'CTL-OPS-010',
        legalEntityId: ENTITY_KSA,
        assessmentPeriod: '2026-Q1',
        assessmentType: 'OPERATING_EFFECTIVENESS',
        assessorUserId: auditorContext.userId,
        assessorRole: 'AUDITOR',
        isIndependentAssessor: true,
        testProcedure: 'Sampled 50 dispatch logs; found 18 missing inspection signatures',
        sampleSize: 50,
        sampleReference: 'LOG-DISPATCH-2026-JAN',
        designEffectiveness: 'EFFECTIVE',
        operatingEffectiveness: 'DEFICIENT',
        overallResult: 'INEFFECTIVE',
        findingsSummary: 'Drivers bypassed digital checklist during peak morning rush',
        evidenceIds: [],
        findingIds: [],
        propagatedToRiskIds: [],
        assessedAt: new Date().toISOString(),
        auditCorrelationId: 'cor_asm_fail_01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await performControlAssessment(assessment, auditorContext);

      // Verify overall assessment result
      assert.equal(result.assessment.overallResult, 'INEFFECTIVE');

      // Verify auto-generated finding
      assert.equal(result.propagatedFindings.length, 1);
      assert.equal(result.propagatedFindings[0].sourceType, 'CONTROL_ASSESSMENT');
      assert.equal(result.propagatedFindings[0].severity, 'HIGH');
      assert.equal(result.propagatedFindings[0].status, 'OPEN');
      assert.equal(result.propagatedFindings[0].controlId, 'ctl_fleet_01');

      // Verify residual risk score was recalculated upwards
      assert.equal(result.updatedRisks.length, 1);
      const updatedRisk = result.updatedRisks[0];
      assert.equal(updatedRisk.controlEffectivenessSummary, 'DEFICIENT');
      assert.equal(updatedRisk.residualLikelihood, 3); // 1 + 2 = 3
      assert.equal(updatedRisk.residualScore, 9); // 3 x 3 = 9 (MEDIUM)
      assert.equal(updatedRisk.residualSeverity, 'MEDIUM');
      assert.equal(updatedRisk.inherentScore, 12); // Inherent remains 12
    });
  });

  // ==========================================================================
  // 4. GOVERNANCE & POLICY EXCEPTIONS
  // ==========================================================================
  describe('4. Governance Exceptions, Compensating Controls & Expiry', () => {
    it('denies requester from approving their own policy exception (Anti-Self-Approval)', async () => {
      const exception: GovernanceException = {
        id: 'exc_dual_auth_01',
        exceptionNumber: 'EXC-2026-0001',
        exceptionType: 'POLICY_EXCEPTION',
        legalEntityId: ENTITY_KSA,
        sourceResourceType: 'POLICY',
        sourceResourceId: 'pol_procurement_01',
        requestedByUserId: 'usr_cfo_01',
        requestedByRole: 'CFO',
        reason: 'Urgent weekend port demurrage payment requiring single-signer execution',
        businessJustification: 'Avoid USD 15,000 demurrage penalty on blocked container shipment',
        riskSummary: 'Temporary bypass of dual-signature threshold',
        riskRating: 'MEDIUM',
        compensatingControls: [
          {
            description: 'Post-transaction audit review by Internal Auditor within 24 hours',
            isVerified: true,
            verifiedByUserId: 'usr_auditor_01'
          }
        ],
        effectiveFrom: new Date().toISOString(),
        effectiveUntil: new Date(Date.now() + 3 * 86400000).toISOString(),
        isPermanent: false,
        status: 'REQUESTED',
        evidenceIds: [],
        auditCorrelationId: 'cor_exc_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceException(exception, 'usr_cfo_01');

      // CFO requested exception, attempts to approve it herself
      await assert.rejects(
        async () => {
          await approveGovernanceException(
            'exc_dual_auth_01',
            {
              approvedByUserId: 'usr_cfo_01',
              approvedByRole: 'CFO'
            },
            cfoContext
          );
        },
        /Separation of Duties violation: Exception requester.*cannot approve their own governance exception/
      );
    });

    it('requires Board Decision and compensating controls for High/Critical exceptions', async () => {
      const exception: GovernanceException = {
        id: 'exc_fam_crit_01',
        exceptionNumber: 'EXC-2026-0002',
        exceptionType: 'AUTHORITY_EXCEPTION',
        legalEntityId: ENTITY_KSA,
        sourceResourceType: 'FINANCIAL_AUTHORITY_MATRIX',
        sourceResourceId: 'fam_capex_01',
        requestedByUserId: 'usr_ops_mgr',
        requestedByRole: 'OPERATIONS_MANAGER',
        reason: 'Emergency warehouse cold-chain compressor replacement exceeding local authority limit',
        businessJustification: 'Prevent SAR 2.5M pharmaceutical temperature excursion loss',
        riskSummary: 'Exceeding FAM Tier 2 limit without standard 14-day procurement tender',
        riskRating: 'HIGH',
        compensatingControls: [], // Missing compensating controls!
        effectiveFrom: new Date().toISOString(),
        effectiveUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        isPermanent: false,
        status: 'REQUESTED',
        evidenceIds: [],
        auditCorrelationId: 'cor_exc_002',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceException(exception, 'usr_ops_mgr');

      // Attempt 1: Approve without Board Resolution
      await assert.rejects(
        async () => {
          await approveGovernanceException(
            'exc_fam_crit_01',
            {
              approvedByUserId: 'usr_ceo_01',
              approvedByRole: 'CEO'
            },
            ceoContext
          );
        },
        /High\/Critical governance exception requires a supporting Board\/Executive Decision resolution/
      );

      // Seed valid Board Resolution
      const boardDecision: CorporateDecision = {
        id: 'dec_board_exc_02',
        decisionNumber: 'DEC-2026-0102',
        legalEntityId: ENTITY_KSA,
        decisionType: 'POLICY_EXCEPTION',
        decisionScope: 'OPERATIONAL_EMERGENCY',
        titleEn: 'Emergency Capex Compressor Authorization',
        titleAr: 'اعتماد شراء طارئ لضواغط التبريد للمستودع الدوائي',
        summaryEn: 'Approved emergency procurement exception up to SAR 450,000.',
        lifecycleStatus: 'APPROVED',
        decisionStatus: 'APPROVED',
        authorityLevelRequired: 'BOARD_OF_DIRECTORS',
        approvalThresholdPercentage: 100,
        unanimousRequired: false,
        quorumRequiredPercentage: 50,
        approvedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        isStatutoryFilingRequired: false,
        isExecutionControlled: true,
        auditCorrelationId: 'cor_dec_102',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveCorporateDecision(boardDecision, ceoContext.userId);

      // Attempt 2: Still fails because compensatingControls array is empty
      await assert.rejects(
        async () => {
          await approveGovernanceException(
            'exc_fam_crit_01',
            {
              approvedByUserId: 'usr_ceo_01',
              approvedByRole: 'CEO',
              supportingDecisionId: 'dec_board_exc_02'
            },
            ceoContext
          );
        },
        /Material governance exceptions.*require at least one documented compensating control/
      );

      // Update with verified compensating control
      const updatedException: GovernanceException = {
        ...exception,
        compensatingControls: [
          {
            description: 'Direct supplier quote verified against manufacturer standard price list with mandatory warranty',
            isVerified: true,
            verifiedByUserId: 'usr_cfo_01'
          }
        ]
      };
      await saveGovernanceException(updatedException, 'usr_ops_mgr');

      // Attempt 3: CEO approves with decision and compensating control -> SUCCESS
      const approved = await approveGovernanceException(
        'exc_fam_crit_01',
        {
          approvedByUserId: 'usr_ceo_01',
          approvedByRole: 'CEO',
          supportingDecisionId: 'dec_board_exc_02'
        },
        ceoContext
      );

      assert.equal(approved.status, 'ACTIVE');
      assert.equal(approved.approvedByUserId, 'usr_ceo_01');
      assert.equal(isExceptionActive(approved), true);

      // Revocation Test: Revoking reinstates baseline controls
      const revoked = await revokeGovernanceException(
        'exc_fam_crit_01',
        {
          revokedByUserId: 'usr_ceo_01',
          revocationReason: 'Emergency repairs completed and normal FAM limits reinstated'
        },
        ceoContext
      );
      assert.equal(revoked.status, 'REVOKED');
      assert.equal(isExceptionActive(revoked), false);
    });
  });

  // ==========================================================================
  // 5. GOVERNANCE FINDINGS, REMEDIATION ACTIONS & EVIDENCE-BASED CLOSURE
  // ==========================================================================
  describe('5. Finding Lifecycle, SoD, Duplicate Prevention & Evidence Closure', () => {
    it('prevents duplicate findings via deterministic fingerprinting', async () => {
      const finding1: GovernanceFinding = {
        id: 'fnd_dup_001',
        findingNumber: 'FND-2026-0011',
        fingerprint: 'FINGERPRINT_ENTITY_KSA_CUSTOMS_HS_CODE_DEFICIENCY',
        legalEntityId: ENTITY_KSA,
        sourceType: 'COMPLIANCE_REVIEW',
        title: 'HS Tariff Code Mismatch on Pharmaceutical Imports',
        description: 'Customs declaration used outdated tariff code on refrigerated medicine shipment',
        severity: 'HIGH',
        ownerUserId: 'usr_ops_mgr',
        status: 'OPEN',
        openedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        evidenceIds: [],
        reopenHistory: [],
        auditCorrelationId: 'cor_fnd_011',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved1 = await saveGovernanceFinding(finding1, 'usr_auditor_01');
      assert.equal(saved1.id, 'fnd_dup_001');

      // Attempt to save identical active finding with different ID
      const finding2: GovernanceFinding = {
        ...finding1,
        id: 'fnd_dup_002',
        findingNumber: 'FND-2026-0012'
      };

      const saved2 = await saveGovernanceFinding(finding2, 'usr_auditor_01');
      // Idempotency: Returns existing active finding rather than duplicating
      assert.equal(saved2.id, 'fnd_dup_001');

      const allFindings = await listGovernanceFindingsByEntity(ENTITY_KSA);
      assert.equal(allFindings.length, 1);
    });

    it('denies finding owner from self-verifying and closing their own finding (SoD)', async () => {
      const finding: GovernanceFinding = {
        id: 'fnd_sod_01',
        findingNumber: 'FND-2026-0020',
        fingerprint: 'FINGERPRINT_ENTITY_KSA_INVENTORY_CYCLE_COUNT_GAP',
        legalEntityId: ENTITY_KSA,
        sourceType: 'INTERNAL_AUDIT',
        title: 'Inventory Cycle Count Variance in Warehouse Zone B',
        description: 'Physical count deviated by 1.8% against ERP ledger',
        severity: 'MEDIUM',
        ownerUserId: 'usr_ops_mgr',
        status: 'REMEDIATION_IN_PROGRESS',
        openedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        evidenceIds: [],
        reopenHistory: [],
        auditCorrelationId: 'cor_fnd_020',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceFinding(finding, 'usr_auditor_01');

      // Finding owner (usr_ops_mgr) attempts to close the finding
      await assert.rejects(
        async () => {
          await closeGovernanceFinding(
            'fnd_sod_01',
            {
              verifiedByUserId: 'usr_ops_mgr',
              verificationNotes: 'Recount completed and variance resolved'
            },
            opsManagerContext
          );
        },
        /Separation of Duties violation: Finding owner.*cannot independently verify or close their own finding/
      );
    });

    it('requires verified evidence in GOV-09 Vault before closing High/Medium findings', async () => {
      const finding: GovernanceFinding = {
        id: 'fnd_evid_01',
        findingNumber: 'FND-2026-0030',
        fingerprint: 'FINGERPRINT_ENTITY_KSA_VAT_INVOICE_MISSING_QR',
        legalEntityId: ENTITY_KSA,
        sourceType: 'COMPLIANCE_REVIEW',
        title: 'ZATCA Phase 2 E-Invoice QR Code Encoding Gap',
        description: 'Invoices generated during downtime lacked Phase 2 cryptographic stamp',
        severity: 'HIGH',
        ownerUserId: 'usr_ops_mgr',
        status: 'PENDING_VERIFICATION',
        openedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        evidenceIds: [],
        reopenHistory: [],
        auditCorrelationId: 'cor_fnd_030',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceFinding(finding, 'usr_auditor_01');

      // Attempt 1: Close without evidence
      await assert.rejects(
        async () => {
          await closeGovernanceFinding(
            'fnd_evid_01',
            {
              verifiedByUserId: 'usr_auditor_01',
              verificationNotes: 'Checked invoices verbally'
            },
            auditorContext
          );
        },
        /requires verified remediation evidence in GOV-09 Evidence Vault/
      );

      // Seed valid evidence in GOV-09 Vault
      const evidenceRecord: EvidenceRecord = {
        id: 'evd_zatca_patch_01',
        evidenceNumber: 'EVD-2026-0099',
        legalEntityId: ENTITY_KSA,
        evidenceType: 'INSPECTION_CERTIFICATE',
        category: 'COMPLIANCE_CERTIFICATION',
        titleEn: 'ZATCA Clearance Portal Batch Verification Log',
        titleAr: 'سجل التحقق من اعتماد الفواتير الإلكترونية عبر بوابة زاتكا',
        documentId: 'doc_zatca_01',
        documentVersionId: 'ver_zatca_01',
        checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        integrityStatus: 'VERIFIED',
        verificationStatus: 'VERIFIED',
        auditCorrelationId: 'cor_evd_099',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveEvidenceRecord(evidenceRecord, 'usr_auditor_01');

      // Attempt 2: Close with verified evidence -> SUCCESS
      const closed = await closeGovernanceFinding(
        'fnd_evid_01',
        {
          verifiedByUserId: 'usr_auditor_01',
          verificationNotes: 'Validated all 140 invoices on ZATCA portal with verified cryptographic evidence EVD-2026-0099.',
          evidenceIds: ['evd_zatca_patch_01']
        },
        auditorContext
      );

      assert.equal(closed.status, 'CLOSED');
      assert.equal(closed.closedByUserId, 'usr_auditor_01');
      assert.equal(closed.verifiedByUserId, 'usr_auditor_01');
      assert.ok(closed.evidenceIds.includes('evd_zatca_patch_01'));

      // Test Reopening Finding: Preserves closure history
      const reopened = await reopenGovernanceFinding(
        'fnd_evid_01',
        {
          reopenedByUserId: 'usr_auditor_01',
          reopenReason: 'Re-audit identified 3 subsequent invoices generated without Phase 2 stamp'
        },
        auditorContext
      );

      assert.equal(reopened.status, 'REOPENED');
      assert.equal(reopened.closedAt, undefined);
      assert.equal(reopened.reopenHistory.length, 1);
      assert.equal(reopened.reopenHistory[0].previousClosureDetails.closedByUserId, 'usr_auditor_01');
      assert.ok(reopened.reopenHistory[0].reopenReason.includes('Re-audit identified'));
    });
  });

  // ==========================================================================
  // 6. REMEDIATION ACTIONS & OVERDUE ESCALATION (GOV-08 REUSE)
  // ==========================================================================
  describe('6. Remediation Actions, Overdue Tracking & Escalation', () => {
    it('detects overdue remediation actions and escalates tiers idempotently', async () => {
      // Seed overdue action
      const action: RemediationAction = {
        id: 'act_overdue_01',
        findingId: 'fnd_evid_01',
        actionNumber: 'ACT-2026-0001',
        legalEntityId: ENTITY_KSA,
        title: 'Upgrade EDI Gateway XML Transformer',
        actionDescription: 'Deploy hotfix v2.4 to support mandatory ZATCA cryptographic headers',
        ownerUserId: 'usr_ops_mgr',
        ownerRole: 'OPERATIONS_MANAGER',
        priority: 'CRITICAL',
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days overdue!
        status: 'IN_PROGRESS',
        completionEvidenceIds: [],
        escalationLevel: 0,
        auditCorrelationId: 'cor_act_001',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 86400000).toISOString()
      };
      await saveRemediationAction(action, 'usr_ops_mgr');

      // Run escalation scanner
      const scan1 = await escalateOverdueRemediationActions('SYSTEM_SCANNER');
      assert.equal(scan1.escalatedCount, 1);
      assert.equal(scan1.escalatedActions[0].status, 'OVERDUE');
      assert.equal(scan1.escalatedActions[0].escalationLevel, 1); // Escalated to Level 1 (Manager)

      // Run scanner immediately again (Idempotency check)
      const scan2 = await escalateOverdueRemediationActions('SYSTEM_SCANNER');
      assert.equal(scan2.escalatedCount, 0); // 0 additional escalations within 24h window
    });
  });

  // ==========================================================================
  // 7. HISTORICAL PRESERVATION & HARD DELETE PROHIBITION
  // ==========================================================================
  describe('7. Statutory Invariants & Prohibited Hard Delete', () => {
    it('strictly prohibits hard deletion of governance risks, assessments, exceptions, findings and remediation', async () => {
      await assert.rejects(
        async () => {
          await deleteGovernanceAssuranceRecordProhibited('RISK', 'rsk_customs_001', 'usr_tech_admin');
        },
        /Hard deletion of corporate governance RISK records.*is strictly prohibited/
      );

      await assert.rejects(
        async () => {
          await deleteGovernanceAssuranceRecordProhibited('FINDING', 'fnd_evid_01', 'usr_tech_admin');
        },
        /Hard deletion of corporate governance FINDING records.*is strictly prohibited/
      );

      await assert.rejects(
        async () => {
          await deleteGovernanceAssuranceRecordProhibited('EXCEPTION', 'exc_fam_crit_01', 'usr_tech_admin');
        },
        /Hard deletion of corporate governance EXCEPTION records.*is strictly prohibited/
      );
    });
  });
});
