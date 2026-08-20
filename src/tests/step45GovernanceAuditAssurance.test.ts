/**
 * AJA INTERNATIONAL LOGISTICS — STEP GOV-12 VERIFICATION TEST SUITE
 * Step GOV-12: Governance Audit, Assurance Planning, Internal Audit, Control Testing & Management Action Tracking
 * 
 * Invariants Tested:
 * 1. Audit Universe & Risk-Based Scheduling (12m/24m/36m/48m cycles)
 * 2. Annual Audit Plan & Audit Committee Formal Resolution Approval (GOV-06)
 * 3. Audit Engagement Lifecycle & IIA 12-Month Auditor Cooling-Off Rule (SoD)
 * 4. Control Testing, AICPA Sample Sizing & Automated Finding Generation (GOV-11)
 * 5. Management Action Plans (MAP), 5-Whys Root Cause & Independent Re-Testing
 * 6. Overdue Remediation Multi-Tier Escalations
 * 7. Audit Committee Pack Assembly & 3LoD Composite Assurance Scorecards
 * 8. Statutory Immutability: Prohibited Hard Delete on all Audit & Assurance Records
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  AuditUniverseEntity,
  AnnualAuditPlan,
  AuditEngagement,
  AuditWorkpaper,
  ControlTestWorksheet,
  ControlTestSampleItem,
  ManagementActionPlan,
  AuditCommitteePack,
  InternalControl,
  GovernanceFinding,
  CorporateDecision
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';
import {
  calculateControlSampleSize,
  checkAuditorIndependence,
  registerAuditorOperationalHistory,
  saveAuditUniverseEntity,
  getAuditUniverseEntityById,
  listAuditUniverseByEntity,
  deleteAuditUniverseEntityProhibited,
  saveAnnualAuditPlan,
  getAnnualAuditPlanById,
  approveAnnualAuditPlan,
  deleteAuditPlanProhibited,
  saveAuditEngagement,
  getAuditEngagementById,
  issueFinalAuditReport,
  deleteAuditEngagementProhibited,
  saveAuditWorkpaper,
  getAuditWorkpaperById,
  deleteAuditWorkpaperProhibited,
  executeControlTestWorksheet,
  getControlTestWorksheetById,
  deleteControlTestWorksheetProhibited,
  createManagementActionPlan,
  getManagementActionPlanById,
  reviseManagementActionTargetDate,
  verifyAndCloseManagementAction,
  detectOverdueManagementActions,
  deleteManagementActionPlanProhibited,
  generateAuditCommitteePack,
  publishAndLockAuditCommitteePack,
  computeSha256
} from '../db/repositories/corporateAuditAssuranceRepository';
import {
  saveInternalControl,
  getInternalControlById
} from '../db/repositories/corporateAuthorityRepository';
import {
  saveGovernanceFinding,
  getGovernanceFindingById
} from '../db/repositories/corporateRiskAssuranceRepository';
import {
  saveEvidenceRecord
} from '../db/repositories/corporateRecordsRepository';
import {
  saveCorporateDecision
} from '../db/repositories/corporateGovernanceRepository';

describe('STEP GOV-12: Governance Audit, Assurance Planning, Internal Audit & Control Testing', () => {
  const ENTITY_KSA = 'ent_aja_ksa_01';
  const ENTITY_UK = 'ent_aja_uk_01';

  const caeContext: UserContext = {
    userId: 'usr_cae_01',
    role: 'CAE',
    roles: ['CAE', 'INTERNAL_AUDITOR', 'GOVERNANCE_OFFICER']
  };

  const auditChairContext: UserContext = {
    userId: 'usr_chair_01',
    role: 'AUDIT_COMMITTEE_CHAIR',
    roles: ['AUDIT_COMMITTEE_CHAIR', 'BOARD_DIRECTOR']
  };

  const leadAuditorContext: UserContext = {
    userId: 'usr_auditor_01',
    role: 'INTERNAL_AUDITOR',
    roles: ['INTERNAL_AUDITOR']
  };

  const opsManagerContext: UserContext = {
    userId: 'usr_ops_mgr_01',
    role: 'OPERATIONS_MANAGER',
    roles: ['OPERATIONS_MANAGER', 'DEPARTMENT_HEAD']
  };

  before(async () => {
    // Seed verified evidence records in GOV-09 Vault for closure testing
    await saveEvidenceRecord(
      {
        id: 'evi_vault_retest_01',
        legalEntityId: ENTITY_KSA,
        documentId: 'doc_retest_signed_01',
        evidenceType: 'INDEPENDENT_AUDIT_RETEST_EVIDENCE',
        checksumSha256: computeSha256('evidence-content-retest-ok'),
        integrityStatus: 'VERIFIED',
        verificationStatus: 'VERIFIED',
        submittedByUserId: caeContext.userId,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      caeContext.userId
    );

    // Seed internal controls in GOV-10 Authority Repository
    const control1: InternalControl = {
      id: 'ctl_fin_rev_001',
      controlCode: 'CTL-FIN-REV-001',
      title: 'Revenue Recognition Daily Three-Way Matching',
      description: 'المطابقة الثلاثية اليومية للاعتراف بالإيرادات',
      legalEntityId: ENTITY_KSA,
      controlType: 'PREVENTIVE',
      frequency: 'DAILY',
      ownerUserId: 'usr_fin_mgr_01',
      ownerRole: 'FINANCE_MANAGER',
      isAutomated: true,
      status: 'ACTIVE',
      operatingEffectiveness: 'EFFECTIVE',
      auditCorrelationId: 'cor_ctl_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveInternalControl(control1, caeContext.userId);

    const control2: InternalControl = {
      id: 'ctl_cold_temp_002',
      controlCode: 'CTL-OPS-COLD-002',
      title: 'Pharma Cold-Chain Continuous Temperature Logging',
      description: 'تسجيل درجات حرارة سلسلة التبريد الدوائي المستمر',
      legalEntityId: ENTITY_KSA,
      controlType: 'DETECTIVE',
      frequency: 'CONTINUOUS',
      ownerUserId: opsManagerContext.userId,
      ownerRole: 'OPERATIONS_MANAGER',
      isAutomated: false,
      status: 'ACTIVE',
      operatingEffectiveness: 'EFFECTIVE',
      auditCorrelationId: 'cor_ctl_002',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveInternalControl(control2, caeContext.userId);
  });

  // ============================================================================
  // 1. AUDIT UNIVERSE & RISK-BASED SCHEDULING
  // ============================================================================
  describe('1. Audit Universe & Risk-Based Multi-Year Scheduling', () => {
    it('registers auditable entities and assigns dynamic audit cycles based on risk rating', async () => {
      const critEntity: AuditUniverseEntity = {
        id: 'aue_pharma_cold_01',
        entityCode: 'AUE-OPS-0001',
        legalEntityId: ENTITY_KSA,
        departmentId: 'dept_warehouse_01',
        nameEn: 'Riyadh Pharma Cold Hub Operations',
        nameAr: 'عمليات مركز التوزيع الدوائي المبرد بالرياض',
        entityCategory: 'OPERATIONAL_PROCESS',
        riskRating: 'CRITICAL',
        auditCycleMonths: 12,
        nextAuditDueDate: '',
        inScope: true,
        associatedRiskIds: ['rsk_pharma_temp_01'],
        associatedControlIds: ['ctl_cold_temp_002'],
        status: 'ACTIVE',
        auditCorrelationId: 'cor_aue_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedCrit = await saveAuditUniverseEntity(critEntity, caeContext.userId);
      assert.equal(savedCrit.auditCycleMonths, 12);
      assert.ok(savedCrit.nextAuditDueDate);

      const medEntity: AuditUniverseEntity = {
        id: 'aue_uk_fleet_02',
        entityCode: 'AUE-FLT-0002',
        legalEntityId: ENTITY_UK,
        departmentId: 'dept_transport_02',
        nameEn: 'London Courier Delivery Fleet',
        nameAr: 'أسطول التوصيل السريع بلندن',
        entityCategory: 'OPERATIONAL_PROCESS',
        riskRating: 'MEDIUM',
        auditCycleMonths: 36,
        nextAuditDueDate: '',
        inScope: true,
        associatedRiskIds: [],
        associatedControlIds: [],
        status: 'ACTIVE',
        auditCorrelationId: 'cor_aue_002',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedMed = await saveAuditUniverseEntity(medEntity, caeContext.userId);
      assert.equal(savedMed.auditCycleMonths, 36);

      const ksaList = await listAuditUniverseByEntity(ENTITY_KSA);
      assert.ok(ksaList.some((e) => e.id === 'aue_pharma_cold_01'));
    });
  });

  // ============================================================================
  // 2. ANNUAL AUDIT PLAN & AUDIT COMMITTEE APPROVAL
  // ============================================================================
  describe('2. Annual Audit Plan & Audit Committee Formal Approval', () => {
    it('creates annual audit plan with planned engagements and validates committee authority', async () => {
      const plan: AnnualAuditPlan = {
        id: 'pln_2026_ksa_01',
        planNumber: 'PLN-2026-0001',
        planYear: 2026,
        legalEntityId: ENTITY_KSA,
        titleEn: 'FY2026 KSA Comprehensive Internal Audit Plan',
        titleAr: 'خطة التدقيق الداخلي الشاملة للمملكة لعام 2026',
        status: 'PROPOSED',
        budgetedHoursTotal: 1200,
        allocatedHoursTotal: 0,
        plannedEngagements: [
          {
            auditUniverseEntityId: 'aue_pharma_cold_01',
            titleEn: 'Pharma Cold-Chain & GDP Statutory Audit',
            plannedQuarter: 'Q1',
            budgetedHours: 250,
            riskRating: 'CRITICAL'
          },
          {
            auditUniverseEntityId: 'aue_fin_rev_01',
            titleEn: 'ZATCA E-Invoicing & Revenue Assurance Audit',
            plannedQuarter: 'Q2',
            budgetedHours: 200,
            riskRating: 'HIGH'
          }
        ],
        engagementIds: [],
        amendmentHistory: [],
        auditCorrelationId: 'cor_pln_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedPlan = await saveAnnualAuditPlan(plan, caeContext.userId);
      assert.equal(savedPlan.allocatedHoursTotal, 450);
      assert.equal(savedPlan.status, 'PROPOSED');

      // Attempt 1: Unauthorized operations manager attempts approval -> REJECTED
      await assert.rejects(
        async () => {
          await approveAnnualAuditPlan(
            'pln_2026_ksa_01',
            {
              approvedByUserId: opsManagerContext.userId,
              approvedByRole: 'OPERATIONS_MANAGER'
            },
            opsManagerContext
          );
        },
        /Annual Audit Plan approval requires Audit Committee Chair or CAE authority/
      );

      // Seed valid Audit Committee Decision (GOV-06)
      const auditDecision: CorporateDecision = {
        id: 'dec_ac_plan_2026_01',
        decisionNumber: 'DEC-2026-0201',
        legalEntityId: ENTITY_KSA,
        decisionType: 'AUDIT_CHARTER_APPROVAL' as any,
        decisionStatus: 'APPROVED',
        titleEn: 'Audit Committee Approval of FY2026 Internal Audit Plan',
        approvedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        auditCorrelationId: 'cor_dec_201',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveCorporateDecision(auditDecision, auditChairContext.userId);

      // Attempt 2: Audit Committee Chair approves with Decision -> SUCCESS
      const approvedPlan = await approveAnnualAuditPlan(
        'pln_2026_ksa_01',
        {
          approvedByUserId: auditChairContext.userId,
          approvedByRole: 'AUDIT_COMMITTEE_CHAIR',
          auditCommitteeDecisionId: 'dec_ac_plan_2026_01'
        },
        auditChairContext
      );

      assert.equal(approvedPlan.status, 'AUDIT_COMMITTEE_APPROVED');
      assert.equal(approvedPlan.approvedByUserId, auditChairContext.userId);
      assert.ok(approvedPlan.approvedAt);
    });
  });

  // ============================================================================
  // 3. AUDIT ENGAGEMENT LIFECYCLE & 12-MONTH COOLING-OFF RULE (SoD)
  // ============================================================================
  describe('3. Audit Engagement Lifecycle & IIA 12-Month Auditor Cooling-Off Rule (SoD)', () => {
    it('enforces 12-month cooling-off period preventing former operational managers from auditing their past units', async () => {
      // Register that usr_auditor_past held operational role in 'aue_pharma_cold_01' until 6 months from now
      const sixMonthsFuture = new Date(Date.now() + 180 * 86400000).toISOString();
      registerAuditorOperationalHistory('usr_auditor_past_02', 'aue_pharma_cold_01', 'OPERATIONS_SUPERVISOR', sixMonthsFuture);

      const pastManagerContext: UserContext = {
        userId: 'usr_auditor_past_02',
        role: 'INTERNAL_AUDITOR',
        roles: ['INTERNAL_AUDITOR']
      };

      const engagementInvalid: AuditEngagement = {
        id: 'eng_pharma_2026_01',
        engagementNumber: 'ENG-2026-0001',
        auditPlanId: 'pln_2026_ksa_01',
        auditUniverseEntityId: 'aue_pharma_cold_01',
        legalEntityId: ENTITY_KSA,
        titleEn: 'Q1 Cold Chain Assurance Engagement',
        engagementType: 'STATUTORY_COMPLIANCE',
        stage: 'PLANNING',
        leadAuditorUserId: 'usr_auditor_past_02',
        leadAuditorRole: 'LEAD_INTERNAL_AUDITOR',
        auditTeamUserIds: ['usr_auditor_past_02'],
        auditeeContactUserIds: ['usr_ops_mgr_01'],
        scopeSummaryEn: 'Audit of cold storage temperature monitoring and GDP logs.',
        testingObjectives: ['Verify continuous sensor logging', 'Sample temperature logs'],
        plannedStartDate: new Date().toISOString(),
        plannedEndDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        workProgramIds: [],
        workpaperIds: [],
        controlTestIds: [],
        findingIds: [],
        isReportLocked: false,
        auditCorrelationId: 'cor_eng_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Attempt with conflicted auditor -> REJECTED by cooling-off invariant
      await assert.rejects(
        async () => {
          await saveAuditEngagement(engagementInvalid, caeContext.userId);
        },
        /Segregation of Duties \/ Independence Violation.*12-month mandatory cooling-off period/
      );

      // Attempt with fully independent lead auditor -> SUCCESS
      const engagementValid: AuditEngagement = {
        ...engagementInvalid,
        id: 'eng_pharma_2026_valid',
        engagementNumber: 'ENG-2026-0002',
        leadAuditorUserId: leadAuditorContext.userId,
        auditTeamUserIds: [leadAuditorContext.userId]
      };

      const savedEng = await saveAuditEngagement(engagementValid, caeContext.userId);
      assert.equal(savedEng.stage, 'PLANNING');
      assert.equal(savedEng.leadAuditorUserId, leadAuditorContext.userId);

      // Save Workpaper with Cryptographic Hash
      const workpaper: AuditWorkpaper = {
        id: 'wp_temp_sensors_01',
        workpaperNumber: 'WP-2026-0001',
        engagementId: 'eng_pharma_2026_valid',
        legalEntityId: ENTITY_KSA,
        titleEn: 'Temperature Sensor Calibration & Daily Telemetry Verification',
        objective: 'Evaluate accuracy and calibration logs of IoT warehouse sensors.',
        testingNotes: 'Tested 25 daily samples against calibration certificates.',
        sampleCount: 25,
        exceptionsNotedCount: 0,
        conclusion: 'All sensors calibrated according to SFDA cold-chain standards.',
        evidenceIds: ['evi_vault_retest_01'],
        preparedByUserId: leadAuditorContext.userId,
        preparedAt: new Date().toISOString(),
        isSignoffComplete: true,
        checksumSha256: '',
        isLocked: true,
        auditCorrelationId: 'cor_wp_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedWp = await saveAuditWorkpaper(workpaper, leadAuditorContext.userId);
      assert.ok(savedWp.checksumSha256);
      assert.equal(savedWp.isLocked, true);

      // Advance engagement to DRAFT_REPORT stage
      const draftEng: AuditEngagement = {
        ...savedEng,
        stage: 'DRAFT_REPORT',
        workpaperIds: [savedWp.id]
      };
      await saveAuditEngagement(draftEng, caeContext.userId);

      // Issue Final Audit Report & Cryptographically Lock
      const finalReport = await issueFinalAuditReport(
        'eng_pharma_2026_valid',
        {
          auditOpinion: 'UNQUALIFIED_SATISFACTORY',
          executiveSummaryEn: 'Cold chain temperature controls are robust, well-monitored, and fully compliant with SFDA regulations.',
          auditDirectorSignoffUserId: caeContext.userId
        },
        caeContext.userId
      );

      assert.equal(finalReport.stage, 'FINAL_REPORT_ISSUED');
      assert.equal(finalReport.isReportLocked, true);
      assert.ok(finalReport.finalReportChecksumSha256);
      assert.ok(finalReport.auditDirectorSignoffAt);

      // Attempt to tamper with locked engagement -> REJECTED
      await assert.rejects(
        async () => {
          await saveAuditEngagement(
            {
              ...finalReport,
              isReportLocked: false,
              stage: 'PLANNING'
            },
            leadAuditorContext.userId
          );
        },
        /has been cryptographically locked\. Modification prohibited/
      );
    });
  });

  // ============================================================================
  // 4. CONTROL TESTING, STATISTICAL SAMPLE SIZING & DEFICIENCY PROPAGATION
  // ============================================================================
  describe('4. Control Testing, AICPA Sample Sizing & Automated Finding Generation', () => {
    it('calculates standard statistical sample sizes according to test frequency and risk', () => {
      assert.equal(calculateControlSampleSize('CONTINUOUS', 'MEDIUM'), 40);
      assert.equal(calculateControlSampleSize('DAILY', 'MEDIUM'), 25);
      assert.equal(calculateControlSampleSize('WEEKLY', 'MEDIUM'), 10);
      assert.equal(calculateControlSampleSize('MONTHLY', 'MEDIUM'), 4);
      assert.equal(calculateControlSampleSize('QUARTERLY', 'MEDIUM'), 2);
      assert.equal(calculateControlSampleSize('ANNUAL', 'MEDIUM'), 1);

      // Critical severity uplift
      assert.equal(calculateControlSampleSize('DAILY', 'CRITICAL'), 38);
    });

    it('denies control owner from testing their own control (SoD)', async () => {
      // Control ctl_fin_rev_001 is owned by usr_fin_mgr_01
      await assert.rejects(
        async () => {
          await executeControlTestWorksheet(
            {
              id: 'ctw_test_sod_01',
              controlId: 'ctl_fin_rev_001',
              legalEntityId: ENTITY_KSA,
              testType: 'OPERATING_EFFECTIVENESS',
              testingMethod: 'REPERFORMANCE',
              frequency: 'DAILY',
              populationSize: 365,
              samples: [
                {
                  sampleId: 'smp_1',
                  itemIdentifier: 'INV-2026-001',
                  testedAttributeValues: { matchesPO: true },
                  isCompliant: true
                }
              ],
              testerUserId: 'usr_fin_mgr_01', // Control Owner
              testerRole: 'FINANCE_MANAGER',
              detailedAnalysis: 'Self-testing review'
            },
            'usr_fin_mgr_01'
          );
        },
        /Segregation of Duties violation.*Control owner.*cannot independently test their own control/
      );
    });

    it('evaluates control deviations, marks MATERIAL_WEAKNESS, and automatically generates a Governance Finding (GOV-11)', async () => {
      const failingSamples: ControlTestSampleItem[] = [
        { sampleId: 'smp_1', itemIdentifier: 'LOG-001', testedAttributeValues: { tempValid: true }, isCompliant: true },
        { sampleId: 'smp_2', itemIdentifier: 'LOG-002', testedAttributeValues: { tempValid: false }, isCompliant: false, deviationNotes: 'Temp excursion to +14C undetected for 4 hours' },
        { sampleId: 'smp_3', itemIdentifier: 'LOG-003', testedAttributeValues: { tempValid: false }, isCompliant: false, deviationNotes: 'Sensor failed to trigger alert SMS' },
        { sampleId: 'smp_4', itemIdentifier: 'LOG-004', testedAttributeValues: { tempValid: false }, isCompliant: false, deviationNotes: 'Manual override logged without supervisor approval' }
      ];

      const testResult = await executeControlTestWorksheet(
        {
          id: 'ctw_cold_fail_01',
          testNumber: 'CTW-2026-0099',
          controlId: 'ctl_cold_temp_002',
          legalEntityId: ENTITY_KSA,
          testType: 'OPERATING_EFFECTIVENESS',
          testingMethod: 'REPERFORMANCE',
          frequency: 'CONTINUOUS',
          populationSize: 10000,
          samples: failingSamples,
          testerUserId: leadAuditorContext.userId,
          testerRole: 'INTERNAL_AUDITOR',
          detailedAnalysis: '3 out of 4 tested telemetry streams exhibited unmonitored excursions and notification failures.',
          evidenceIds: ['evi_vault_retest_01']
        },
        leadAuditorContext.userId
      );

      assert.equal(testResult.testOutcome, 'MATERIAL_WEAKNESS');
      assert.equal(testResult.exceptionsIdentifiedCount, 3);
      assert.ok(testResult.generatedFindingId, 'Should have generated an automated GovernanceFinding');

      // Verify the generated finding exists in GOV-11 repository
      const finding = await getGovernanceFindingById(testResult.generatedFindingId!);
      assert.ok(finding);
      assert.equal(finding!.severity, 'CRITICAL');
      assert.equal(finding!.controlId, 'ctl_cold_temp_002');
      assert.equal(finding!.status, 'OPEN');

      // Verify control effectiveness was downgraded
      const updatedControl = await getInternalControlById('ctl_cold_temp_002');
      assert.equal(updatedControl!.operatingEffectiveness, 'DEFICIENT');
    });
  });

  // ============================================================================
  // 5. MANAGEMENT ACTION PLANS (MAP), 5-WHYS ROOT CAUSE & RE-TESTING
  // ============================================================================
  describe('5. Management Action Plans (MAP), 5-Whys Root Cause & Remediation Re-Testing', () => {
    let actionPlanId = 'map_cold_remed_01';
    let findingId = 'fnd_audit_temp_01';

    before(async () => {
      // Seed finding
      const finding: GovernanceFinding = {
        id: findingId,
        findingNumber: 'FND-2026-0101',
        fingerprint: computeSha256(`${ENTITY_KSA}:INTERNAL_AUDIT:fnd_0101`),
        legalEntityId: ENTITY_KSA,
        departmentId: 'dept_warehouse_01',
        sourceType: 'INTERNAL_AUDIT',
        title: 'Cold Storage Backup Power Sensor Telemetry Glitch',
        description: 'Sensor firmware deadlock during power switchover.',
        severity: 'HIGH',
        ownerUserId: opsManagerContext.userId,
        status: 'OPEN',
        openedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        evidenceIds: [],
        reopenHistory: [],
        auditCorrelationId: 'cor_fnd_101',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceFinding(finding, caeContext.userId);
    });

    it('requires structured 5-Whys root cause analysis when creating a Management Action Plan', async () => {
      // Attempt 1: Empty root cause narrative -> REJECTED
      await assert.rejects(
        async () => {
          await createManagementActionPlan(
            {
              id: 'map_invalid_rca',
              findingId,
              legalEntityId: ENTITY_KSA,
              actionTitle: 'Fix sensors',
              actionDetails: 'Update code',
              managementResponse: 'Agreed',
              rootCauseMethodology: 'FIVE_WHYS',
              rootCauseSummary: '   ', // Empty
              targetImplementationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
              actionOwnerUserId: opsManagerContext.userId,
              actionOwnerRole: 'OPERATIONS_MANAGER'
            },
            opsManagerContext.userId
          );
        },
        /Management Action Plan requires structured Root Cause Analysis narrative/
      );

      // Attempt 2: Structured 5-Whys -> SUCCESS
      const map = await createManagementActionPlan(
        {
          id: actionPlanId,
          mapNumber: 'MAP-2026-0001',
          findingId,
          legalEntityId: ENTITY_KSA,
          actionTitle: 'Firmware Patch & Dual-Channel IoT Gateway Redundancy',
          actionDetails: 'Deploy firmware v4.2 and install secondary LTE failover modem.',
          managementResponse: 'Engineering agrees with audit recommendations and has procured dual-channel gateways.',
          rootCauseMethodology: 'FIVE_WHYS',
          rootCauseSummary: '1. Why did telemetry fail? Firmware deadlock. 2. Why did deadlock occur? Thread contention on power switch. 3. Why? Single buffer design. 4. Why? Legacy codebase. 5. Root Cause: Lack of automated failover watchdog.',
          targetImplementationDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          actionOwnerUserId: opsManagerContext.userId,
          actionOwnerRole: 'OPERATIONS_MANAGER'
        },
        opsManagerContext.userId
      );

      assert.equal(map.status, 'IN_IMPLEMENTATION');
      assert.equal(map.rootCauseMethodology, 'FIVE_WHYS');

      // Revise Target Date with documented justification
      const revisedMap = await reviseManagementActionTargetDate(
        actionPlanId,
        {
          newTargetDate: new Date(Date.now() + 25 * 86400000).toISOString(),
          revisionReason: 'Vendor lead time for LTE gateways extended by 10 business days.',
          revisedByUserId: opsManagerContext.userId
        },
        caeContext.userId
      );

      assert.equal(revisedMap.status, 'TARGET_REVISED');
      assert.equal(revisedMap.dateRevisionHistory.length, 1);
    });

    it('denies Action Owner from self-verifying and closing their own Management Action Plan (SoD)', async () => {
      await assert.rejects(
        async () => {
          await verifyAndCloseManagementAction(
            actionPlanId,
            {
              verifiedByUserId: opsManagerContext.userId, // Action Owner
              verifiedByRole: 'OPERATIONS_MANAGER',
              testProcedure: 'Self-certification',
              isRemediationEffective: true,
              verificationNotes: 'Looks good to me',
              evidenceIds: ['evi_vault_retest_01']
            },
            opsManagerContext
          );
        },
        /Segregation of Duties violation.*Action owner.*cannot independently re-test and close/
      );
    });

    it('allows Independent Auditor to re-test, verify against Vault Evidence, and formally close the action plan', async () => {
      const closedMap = await verifyAndCloseManagementAction(
        actionPlanId,
        {
          verifiedByUserId: caeContext.userId,
          verifiedByRole: 'CAE',
          testProcedure: 'Re-tested simulated power outage on 5 dual-channel gateways; all alerts delivered within 4 seconds.',
          isRemediationEffective: true,
          verificationNotes: 'Remediation is effective; secondary failover operational.',
          evidenceIds: ['evi_vault_retest_01']
        },
        caeContext
      );

      assert.equal(closedMap.status, 'VERIFIED_CLOSED');
      assert.equal(closedMap.verifiedClosedByUserId, caeContext.userId);
      assert.ok(closedMap.reTestingRecord?.isRemediationEffective);
      assert.ok(closedMap.verifiedClosedAt);
    });
  });

  // ============================================================================
  // 6. OVERDUE ACTION ESCALATION ENGINE
  // ============================================================================
  describe('6. Overdue Remediation Tracking & Escalation Hierarchy', () => {
    it('detects past-due action plans and escalates through the governance hierarchy', async () => {
      // Create overdue action plan (target date was 45 days ago)
      const pastDate = new Date(Date.now() - 45 * 86400000).toISOString();
      const overdueMap: ManagementActionPlan = {
        id: 'map_overdue_sample_01',
        mapNumber: 'MAP-2026-0099',
        findingId: 'fnd_sample_01',
        legalEntityId: ENTITY_KSA,
        actionTitle: 'Overdue Customs Filing Reconciliation',
        actionDetails: 'Overdue action plan item',
        managementResponse: 'Delayed',
        rootCauseMethodology: 'DIRECT_OBSERVATION',
        rootCauseSummary: 'Staff turnover',
        targetImplementationDate: pastDate,
        actionOwnerUserId: opsManagerContext.userId,
        actionOwnerRole: 'OPERATIONS_MANAGER',
        status: 'IN_IMPLEMENTATION',
        dateRevisionHistory: [],
        completionEvidenceIds: [],
        escalationLevel: 0,
        auditCorrelationId: 'cor_map_overdue',
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 86400000).toISOString()
      };

      // Seed directly into in-memory store
      await createManagementActionPlan(
        {
          id: overdueMap.id,
          mapNumber: overdueMap.mapNumber,
          findingId: 'fnd_audit_temp_01',
          legalEntityId: ENTITY_KSA,
          actionTitle: overdueMap.actionTitle,
          actionDetails: overdueMap.actionDetails,
          managementResponse: overdueMap.managementResponse,
          rootCauseMethodology: overdueMap.rootCauseMethodology,
          rootCauseSummary: overdueMap.rootCauseSummary,
          targetImplementationDate: pastDate,
          actionOwnerUserId: opsManagerContext.userId,
          actionOwnerRole: 'OPERATIONS_MANAGER'
        },
        opsManagerContext.userId
      );

      const overdueList = await detectOverdueManagementActions(ENTITY_KSA);
      const found = overdueList.find((a) => a.id === 'map_overdue_sample_01');
      assert.ok(found);
      assert.equal(found!.status, 'OVERDUE');
      assert.ok(found!.escalationLevel >= 2, 'Should be escalated to Level 2 (CAE/CFO) since it is > 30 days overdue');
    });
  });

  // ============================================================================
  // 7. AUDIT COMMITTEE PACK & 3LoD COMPOSITE ASSURANCE SCORECARD
  // ============================================================================
  describe('7. Audit Committee Pack Assembly & 3LoD Composite Assurance Scorecards', () => {
    it('assembles quarterly Audit Committee Pack, calculates 3LoD scorecard, and seals with cryptographic lock', async () => {
      const pack = await generateAuditCommitteePack(
        {
          id: 'acp_2026_q1',
          packNumber: 'ACP-2026-Q1',
          reportingPeriod: '2026-Q1',
          legalEntityIds: [ENTITY_KSA, ENTITY_UK],
          titleEn: 'Audit Committee Executive Assurance Pack Q1-2026',
          titleAr: 'حقيبة تقارير لجنة التدقيق التنفيذية للربع الأول 2026'
        },
        caeContext.userId
      );

      assert.equal(pack.reportingPeriod, '2026-Q1');
      assert.equal(pack.legalEntityIds.length, 2);
      assert.equal(pack.assuranceScorecard.length, 2);
      assert.equal(pack.isPackLocked, false);

      // Audit Committee Chair signs off and locks pack
      const lockedPack = await publishAndLockAuditCommitteePack(
        'acp_2026_q1',
        {
          auditCommitteeChairSignoffUserId: auditChairContext.userId
        },
        auditChairContext.userId
      );

      assert.equal(lockedPack.isPackLocked, true);
      assert.equal(lockedPack.auditCommitteeChairSignoffUserId, auditChairContext.userId);
      assert.ok(lockedPack.finalPackChecksumSha256);
      assert.ok(lockedPack.auditCommitteeChairSignoffAt);
    });
  });

  // ============================================================================
  // 8. STATUTORY IMMUTABILITY & PROHIBITED HARD DELETE
  // ============================================================================
  describe('8. Statutory Invariants & Prohibited Hard Delete', () => {
    it('strictly prohibits hard deletion across all audit universe, plans, engagements, workpapers, worksheets and action plans', async () => {
      await assert.rejects(async () => {
        await deleteAuditUniverseEntityProhibited('aue_pharma_cold_01');
      }, /Statutory governance invariant: Hard deletion of Audit Universe Entity.*is prohibited/);

      await assert.rejects(async () => {
        await deleteAuditPlanProhibited('pln_2026_ksa_01');
      }, /Statutory governance invariant: Hard deletion of Annual Audit Plan.*is prohibited/);

      await assert.rejects(async () => {
        await deleteAuditEngagementProhibited('eng_pharma_2026_valid');
      }, /Statutory governance invariant: Hard deletion of Audit Engagement.*is prohibited/);

      await assert.rejects(async () => {
        await deleteAuditWorkpaperProhibited('wp_temp_sensors_01');
      }, /Statutory governance invariant: Hard deletion of Audit Workpaper.*is prohibited/);

      await assert.rejects(async () => {
        await deleteControlTestWorksheetProhibited('ctw_cold_fail_01');
      }, /Statutory governance invariant: Hard deletion of Control Test Worksheet.*is prohibited/);

      await assert.rejects(async () => {
        await deleteManagementActionPlanProhibited('map_cold_remed_01');
      }, /Statutory governance invariant: Hard deletion of Management Action Plan.*is prohibited/);
    });
  });
});
