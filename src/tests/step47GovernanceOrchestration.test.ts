/**
 * AJA INTERNATIONAL LOGISTICS — Governance Orchestration Test Suite
 * Step GOV-14: Governance Operating Calendar, Committee Workflow Orchestration, Decision Follow-Up, Notifications & Executive Action Management
 * 
 * Test Invariants:
 * 1. GOVERNANCE-POLICY-INVARIANT-01: Configurable, versioned, jurisdiction-aware cadences (no hardcoded constants)
 * 2. Operating Cycle Lifecycle Progression & Milestone Timing Rules (T-14, T-7, T-3, T+3, T+7)
 * 3. Pack Readiness Gate: Comprehensive validation of sections, metrics SHA-256 seal, risks, audit findings, attestations & policy provenance
 * 4. Published Pack Replacement Prohibition: Cannot overwrite an already published pack directly
 * 5. Decision Follow-Up & Resolution Execution Enforcement: Rejects orphan executions lacking accountable owners
 * 6. Executive Action Management: Requires Evidence Vault linkage and enforces strict Segregation of Duties (SoD - no self-verification)
 * 7. Multi-Tier SLA Escalation Matrix (Level 1, 2, 3 escalation with audit trails)
 * 8. Notification Router with Deterministic Deduplication & Idempotency
 * 9. Cross-Committee Dependency Handoff & Correlation Lineage (Audit -> Risk -> Board)
 * 10. Role-Tailored Executive Desk View Aggregation
 * 11. Segregation of Duties: Technical Admin & Service Principal blocked from final governance approvals
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAnnualGovernanceOperatingCycles,
  saveGovernanceOperatingCycle,
  saveCommitteeAgendaItem,
  lockCommitteeAgenda,
  checkMeetingReadiness,
  evaluatePackReadinessGate,
  approveAndPublishGovernancePack,
  enforceResolutionDecisionExecution,
  completeGovernanceActionWithEvidence,
  orchestrateAndVerifyGovernanceAction,
  runGovernanceActionEscalationSweep,
  dispatchGovernanceNotification,
  createCrossCommitteeDependency,
  resolveCrossCommitteeDependency,
  getExecutiveDeskView,
  resetGovernanceOrchestrationMemoryStore,
  saveGovernanceAction,
  saveCorporatePolicy,
  saveCorporatePolicyVersion,
  saveEffectiveGovernanceRuleSet,
  saveCorporateDecision,
  saveCorporateResolution,
  saveGovernanceReportingPack,
  saveEvidenceRecord,
  submitAndSignExecutiveAttestation,
  calculateAndRecordMetricSnapshot,
  saveGovernanceMetricDefinition,
  saveGovernanceRisk,
  saveGovernanceFinding,
  saveBoardMeeting,
  computeSha256
} from '../db/repositories';
import { UserContext } from '../types/permissions';
import {
  CorporatePolicy,
  CorporatePolicyVersion,
  CorporateDecision,
  CorporateResolution,
  GovernanceReportingPack,
  EvidenceRecord,
  GovernanceOperatingCycle,
  CommitteeAgendaItem,
  CrossCommitteeDependency,
  GovernanceRisk,
  BoardMeeting
} from '../types/corporateGovernance';

describe('STEP GOV-14: Governance Operating Calendar, Committee Workflow Orchestration & Action Management', () => {
  const ENTITY_KSA = 'entity_ksa_gov14';
  const ENTITY_UK = 'entity_uk_gov14';
  const POLICY_ID = 'pol_gov_calendar_01';
  const POLICY_VER_ID = 'ver_gov_calendar_v1';
  const DECISION_ID = 'dec_gov_calendar_01';
  const MEETING_ID = 'mtg_aud_q1_2026';

  const boardChairContext: UserContext = {
    userId: 'usr_chair_01',
    role: 'BOARD_CHAIR',
    roles: ['BOARD_CHAIR', 'BOARD_DIRECTOR'],
    legalEntityId: ENTITY_KSA
  };

  const groupCfoContext: UserContext = {
    userId: 'usr_cfo_01',
    role: 'CFO',
    roles: ['CFO', 'EXECUTIVE_DIRECTOR'],
    legalEntityId: ENTITY_KSA
  };

  const complianceDirectorContext: UserContext = {
    userId: 'usr_compliance_dir_01',
    role: 'GLOBAL_COMPLIANCE_DIRECTOR',
    roles: ['GLOBAL_COMPLIANCE_DIRECTOR'],
    legalEntityId: ENTITY_KSA
  };

  const opsManagerContext: UserContext = {
    userId: 'usr_ops_mgr_01',
    role: 'OPERATIONS_MANAGER',
    roles: ['OPERATIONS_MANAGER'],
    legalEntityId: ENTITY_KSA
  };

  const techAdminContext: UserContext = {
    userId: 'usr_tech_admin_01',
    role: 'TECHNICAL_ADMIN',
    roles: ['TECHNICAL_ADMIN'],
    legalEntityId: ENTITY_KSA
  };

  const servicePrincipalContext: UserContext = {
    userId: 'usr_service_bot_01',
    role: 'SERVICE_PRINCIPAL',
    roles: ['SERVICE_PRINCIPAL'],
    legalEntityId: ENTITY_KSA
  };

  before(async () => {
    resetGovernanceOrchestrationMemoryStore();

    // 1. Seed Supporting Board Decision (GOV-06)
    const decision: CorporateDecision = {
      id: DECISION_ID,
      decisionNumber: 'DEC-2026-CALENDAR-01',
      decisionType: 'BOARD_RESOLUTION',
      legalEntityId: ENTITY_KSA,
      titleEn: 'Approval of Annual Governance Operating Rhythm & Cadence Policy',
      decisionStatus: 'APPROVED',
      lifecycleStatus: 'APPROVED',
      effectiveDate: '2026-01-01T00:00:00Z',
      auditCorrelationId: 'cor_dec_seed_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporateDecision(decision, boardChairContext.userId);

    // 2. Seed Corporate Policy (GOV-10)
    const policy: CorporatePolicy = {
      id: POLICY_ID,
      policyCode: 'POL-GOV-CALENDAR-2026',
      title: 'Governance Operating Calendar & Committee Cadence Policy',
      category: 'GOVERNANCE',
      legalEntityScope: [ENTITY_KSA, ENTITY_UK],
      ownerUserId: boardChairContext.userId,
      ownerRole: 'BOARD_CHAIR',
      mandatoryReviewFrequencyMonths: 12,
      activeVersionNumber: 1,
      lifecycleStatus: 'APPROVED',
      classificationClearance: 'CONFIDENTIAL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporatePolicy(policy, boardChairContext.userId);

    // 3. Seed Corporate Policy Version (Invariant-01)
    const policyVer: CorporatePolicyVersion = {
      id: POLICY_VER_ID,
      policyId: POLICY_ID,
      versionNumber: 1,
      contentSummary: 'Governance Operating Calendar Cadences: Quarterly meetings, T-14 agenda lock, T-7 pack delivery, T-3 lockdown.',
      fullPolicyText: '# Governance Calendar Policy\nDefines milestone timing rules and pack readiness requirements.',
      supportingDecisionId: DECISION_ID,
      effectiveFrom: '2026-01-01T00:00:00Z',
      reviewDate: '2027-01-01T00:00:00Z',
      approvedByUserIds: [boardChairContext.userId],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporatePolicyVersion(policyVer, boardChairContext.userId);

    // 4. Seed Effective Governance Rule Set for Calendar Timelines (Invariant-01)
    await saveEffectiveGovernanceRuleSet({
      id: `rules_${ENTITY_KSA}_BOARD_OVERSIGHT_${POLICY_VER_ID}`,
      legalEntityId: ENTITY_KSA,
      jurisdictionContext: 'SA',
      ruleCategory: 'BOARD_OVERSIGHT',
      supportingPolicyVersionId: POLICY_VER_ID,
      supportingDecisionId: DECISION_ID,
      effectiveRules: {
        agendaCutoffDays: 14,
        packDistributionDays: 7,
        readinessLockdownDays: 3,
        minutesCirculationDays: 3,
        actionDispatchDays: 7,
        maxCycleDurationDays: 90
      },
      effectiveFrom: '2026-01-01T00:00:00Z',
      ruleSetHashSha256: computeSha256('rules-seed-ksa-01'),
      provenanceChain: [
        {
          sourceLayer: 'ENTITY_POLICY',
          policyId: POLICY_ID,
          policyVersionId: POLICY_VER_ID,
          appliedAt: '2026-01-01T00:00:00Z',
          summary: 'KSA Governance Operating Calendar Rule Set'
        }
      ],
      resolutionStatus: 'RESOLVED',
      evaluatedAt: '2026-01-01T00:00:00Z',
      evaluatedByUserId: boardChairContext.userId,
      auditCorrelationId: 'cor_rules_seed_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }, boardChairContext.userId);

    // 5. Seed Meeting (GOV-06)
    const meeting: BoardMeeting = {
      id: MEETING_ID,
      meetingNumber: 'MTG-2026-AUD-01',
      title: 'Q1 Audit Committee Meeting',
      meetingType: 'AUDIT_COMMITTEE',
      legalEntityId: ENTITY_KSA,
      scheduledAtUtc: '2026-03-31T09:00:00Z',
      eventLocalTime: '2026-03-31 12:00',
      timeZone: 'Asia/Riyadh',
      meetingModality: 'HYBRID',
      status: 'SCHEDULED',
      chairpersonUserId: boardChairContext.userId,
      secretaryUserId: complianceDirectorContext.userId,
      chairpersonName: 'Board Chairperson',
      secretaryName: 'Compliance Director',
      quorumRequired: 3,
      decisionIds: [],
      createdByUserId: boardChairContext.userId,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveBoardMeeting(meeting, boardChairContext.userId);
  });

  it('1. Generates Annual Governance Operating Cycles dynamically adhering to Invariant-01', async () => {
    const cycles = await generateAnnualGovernanceOperatingCycles({
      legalEntityId: ENTITY_KSA,
      jurisdictionContext: 'SA',
      year: 2026,
      policyVersionId: POLICY_VER_ID,
      committeeTypes: ['BOARD_OF_DIRECTORS', 'AUDIT_COMMITTEE', 'RISK_COMMITTEE']
    }, boardChairContext);

    assert.ok(cycles.length >= 3, 'Should generate cycles for requested committees');
    const firstCycle = cycles[0];
    assert.equal(firstCycle.year, 2026);
    assert.equal(firstCycle.legalEntityId, ENTITY_KSA);
    assert.equal(firstCycle.supportingPolicyVersionId, POLICY_VER_ID);
    assert.equal(firstCycle.status, 'PLANNED');
    assert.ok(firstCycle.milestones.length >= 6, 'Should generate standard governance milestones');

    // Verify milestone calculation rules (T-14, T-7, T-3, T+3, T+7)
    const mAgendaLock = firstCycle.milestones.find(m => m.milestoneCode === 'T_MINUS_14_AGENDA_CUTOFF');
    const mPackDist = firstCycle.milestones.find(m => m.milestoneCode === 'T_MINUS_7_PACK_DISTRIBUTION');
    const mLockdown = firstCycle.milestones.find(m => m.milestoneCode === 'T_MINUS_3_READINESS_LOCKDOWN');

    assert.ok(mAgendaLock, 'Milestone T_MINUS_14_AGENDA_CUTOFF should exist');
    assert.ok(mPackDist, 'Milestone T_MINUS_7_PACK_DISTRIBUTION should exist');
    assert.ok(mLockdown, 'Milestone T_MINUS_3_READINESS_LOCKDOWN should exist');
    assert.ok(mAgendaLock.targetDate < mPackDist.targetDate, 'Agenda lock must precede pack distribution');
    assert.ok(mPackDist.targetDate < mLockdown.targetDate, 'Pack distribution must precede lockdown');
  });

  it('2. Prohibits generating cycles with superseded/archived policy version', async () => {
    const supersededVer: CorporatePolicyVersion = {
      id: 'ver_old_v0',
      policyId: POLICY_ID,
      versionNumber: 0,
      contentSummary: 'Deprecated policy',
      fullPolicyText: 'Deprecated text',
      supportingDecisionId: DECISION_ID,
      effectiveFrom: '2024-01-01T00:00:00Z',
      effectiveUntil: '2025-12-31T23:59:59Z',
      supersededByVersionId: POLICY_VER_ID,
      reviewDate: '2025-12-31T00:00:00Z',
      approvedByUserIds: [boardChairContext.userId],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-12-31T23:59:59Z'
    };
    await saveCorporatePolicyVersion(supersededVer, boardChairContext.userId);

    await assert.rejects(async () => {
      await generateAnnualGovernanceOperatingCycles({
        legalEntityId: ENTITY_KSA,
        jurisdictionContext: 'SA',
        year: 2027,
        policyVersionId: 'ver_old_v0'
      }, boardChairContext);
    }, /Invariant-01 Violation.*superseded/i);
  });

  it('3. Advances Operating Cycle stages through complete committee lifecycle', async () => {
    const cycles = await generateAnnualGovernanceOperatingCycles({
      legalEntityId: ENTITY_KSA,
      jurisdictionContext: 'SA',
      year: 2026,
      policyVersionId: POLICY_VER_ID,
      committeeTypes: ['AUDIT_COMMITTEE']
    }, boardChairContext);

    const cycle = cycles[0];
    assert.equal(cycle.status, 'PLANNED');

    // Advance PLANNED -> PREPARATION
    const s1: GovernanceOperatingCycle = { ...cycle, status: 'PREPARATION' };
    const saved1 = await saveGovernanceOperatingCycle(s1, boardChairContext.userId);
    assert.equal(saved1.status, 'PREPARATION');

    // Advance PREPARATION -> IN_PROGRESS
    const s2: GovernanceOperatingCycle = { ...saved1, status: 'IN_PROGRESS' };
    const saved2 = await saveGovernanceOperatingCycle(s2, boardChairContext.userId);
    assert.equal(saved2.status, 'IN_PROGRESS');

    // Advance IN_PROGRESS -> COMPLETED
    const s3: GovernanceOperatingCycle = { ...saved2, status: 'COMPLETED' };
    const saved3 = await saveGovernanceOperatingCycle(s3, boardChairContext.userId);
    assert.equal(saved3.status, 'COMPLETED');
  });

  it('4. Manages Committee Agenda Items, Pre-read linkages & Finalization lock', async () => {
    // Seed Evidence Record in Vault (GOV-09)
    const evidence: EvidenceRecord = {
      id: 'evi_q1_fin_ctrl_01',
      legalEntityId: ENTITY_KSA,
      documentId: 'doc_fin_ctrl_01',
      evidenceType: 'FINANCIAL_CONTROLS_REPORT',
      checksumSha256: computeSha256('q1-fin-ctrl-data-content'),
      integrityStatus: 'VERIFIED',
      verificationStatus: 'VERIFIED',
      submittedByUserId: groupCfoContext.userId,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveEvidenceRecord(evidence, groupCfoContext.userId);

    const agendaItem: CommitteeAgendaItem = {
      id: 'agenda_item_01',
      meetingId: MEETING_ID,
      legalEntityId: ENTITY_KSA,
      itemNumber: 1,
      title: 'Q1 Financial Controls & Internal Audit Assurance Review',
      category: 'AUDIT_ASSURANCE',
      ownerUserId: groupCfoContext.userId,
      ownerRole: 'CFO',
      presenterUserId: groupCfoContext.userId,
      allocatedMinutes: 45,
      isDiscussionOnly: false,
      requiresDecision: true,
      preReadDocumentIds: ['evi_q1_fin_ctrl_01'],
      preReadDeadlineUtc: '2026-03-24T00:00:00Z',
      isPreReadDistributed: true,
      status: 'DRAFT',
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await saveCommitteeAgendaItem(agendaItem, groupCfoContext);
    assert.equal(saved.status, 'DRAFT');
    assert.ok(saved.preReadDocumentIds.includes('evi_q1_fin_ctrl_01'));

    // Lock Agenda Item via lockCommitteeAgenda
    const { items: lockedItems } = await lockCommitteeAgenda(MEETING_ID, boardChairContext);
    assert.ok(lockedItems.length > 0);
    assert.equal(lockedItems[0].isLocked, true);
    assert.equal(lockedItems[0].status, 'LOCKED');

    // Attempting to modify locked agenda item is rejected
    await assert.rejects(async () => {
      await saveCommitteeAgendaItem({ ...lockedItems[0], title: 'Modified after lock' }, groupCfoContext);
    }, /Governance Invariant Violation.*Agenda Item.*is LOCKED/i);
  });

  it('5. Pack Readiness Gate blocks publication if sections lack required attestations, risks or sealed metrics', async () => {
    const unreadyPack: GovernanceReportingPack = {
      id: 'pack_unready_01',
      packNumber: 'BP-2026-Q1-UNREADY',
      packType: 'BOARD',
      reportingPeriod: '2026-Q1',
      legalEntityIds: [ENTITY_KSA],
      titleEn: 'Unready Q1 2026 Board Oversight Pack',
      versionNumber: 1,
      status: 'DRAFT',
      sections: [
        {
          sectionCode: 'SEC-01-SUMMARY',
          title: 'Executive Summary',
          order: 1,
          executiveSummaryText: 'Too short', // <10 chars -> blocker
          metricsSnapshotIds: ['snap_non_existent'], // missing -> blocker
          criticalRiskIds: ['risk_non_existent'], // missing -> blocker
          keyFindingIds: ['finding_non_existent'], // missing -> blocker
          attestationIds: ['att_non_existent'], // missing -> blocker
          decisionsPendingIds: []
        }
      ],
      supportingDecisionId: DECISION_ID,
      isPackLocked: false,
      securityClassification: 'CONFIDENTIAL',
      auditCorrelationId: 'cor_pack_unready_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveGovernanceReportingPack(unreadyPack, boardChairContext.userId);

    const gateReport = await evaluatePackReadinessGate('pack_unready_01', boardChairContext);
    assert.equal(gateReport.isReady, false);
    assert.ok(gateReport.blockers.length >= 4, 'Should flag multiple blockers for unready pack');

    // Attempting publication should be strictly rejected
    await assert.rejects(async () => {
      await approveAndPublishGovernancePack('pack_unready_01', boardChairContext);
    }, /Pack Readiness Gate Failed/i);
  });

  it('6. Approves and Publishes Governance Pack with SHA-256 Integrity Seal and enforces Replacement Prohibition', async () => {
    // 1. Seed metric definition and sealed snapshot
    await saveGovernanceMetricDefinition({
      id: 'def_kri_solv_01',
      metricCode: 'KRI-FIN-SOLV',
      versionNumber: 1,
      metricType: 'KRI',
      nameEn: 'Solvency Coverage Ratio',
      descriptionEn: 'Liquid assets to short-term obligations',
      calculationFormula: 'liquid_assets / st_liabilities',
      unitOfMeasure: 'RATIO',
      aggregationMethod: 'LATEST_POINT_IN_TIME',
      sourceEntityType: 'FINANCE_TREASURY',
      reportingFrequency: 'MONTHLY',
      targetThreshold: 1.5,
      warningThreshold: 1.2,
      criticalThreshold: 1.0,
      supportingPolicyVersionId: POLICY_VER_ID,
      status: 'ACTIVE',
      effectiveFrom: '2026-01-01T00:00:00Z',
      auditCorrelationId: 'cor_metric_def_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }, groupCfoContext.userId);

    const snapshot = await calculateAndRecordMetricSnapshot({
      id: 'snap_kri_solv_q1_01',
      metricDefinitionId: 'def_kri_solv_01',
      reportingPeriod: '2026-Q1',
      legalEntityId: ENTITY_KSA,
      calculatedValue: 1.8,
      sourceRecordIds: ['evi_q1_fin_ctrl_01']
    }, groupCfoContext.userId);

    // 2. Seed Risk (GOV-11)
    const riskRecord: GovernanceRisk = {
      id: 'risk_gov14_01',
      riskNumber: 'RSK-2026-0001',
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      riskCategory: 'OPERATIONAL',
      title: 'Supply Chain Port Congestion Risk',
      description: 'Potential congestion at major logistics ports.',
      sourceType: 'COMPLIANCE_ASSESSMENT',
      ownerUserId: opsManagerContext.userId,
      inherentLikelihood: 4,
      inherentImpact: 4,
      inherentScore: 16,
      inherentSeverity: 'HIGH',
      controlIds: [],
      controlEffectivenessSummary: 'EFFECTIVE',
      residualLikelihood: 2,
      residualImpact: 3,
      residualScore: 6,
      residualSeverity: 'MEDIUM',
      riskTreatmentStrategy: 'MITIGATE',
      isRiskAccepted: false,
      riskStatus: 'IDENTIFIED',
      assessmentHistory: [],
      lastAssessedAt: new Date().toISOString(),
      classification: 'INTERNAL',
      auditCorrelationId: 'cor_risk_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveGovernanceRisk(riskRecord, opsManagerContext.userId);

    // 3. Seed Signed Executive Attestation (GOV-13)
    const att = await submitAndSignExecutiveAttestation({
      id: 'att_2026_q1_001',
      attestationNumber: 'ATT-2026-Q1-001',
      attestationType: 'FINANCIAL_CONTROLS_ATTESTATION',
      legalEntityId: ENTITY_KSA,
      reportingPeriod: '2026-Q1',
      statementVersionId: 'stmt_ver_fin_ctrl_v1',
      pinnedStatementTextEn: 'All material internal controls over financial reporting operated effectively during Q1 2026.',
      supportingEvidenceRecordIds: ['evi_q1_fin_ctrl_01'],
      policyVersionId: POLICY_VER_ID
    }, groupCfoContext);

    // 4. Create Fully Ready Pack
    const readyPack: GovernanceReportingPack = {
      id: 'pack_ready_q1_2026',
      packNumber: 'BP-2026-Q1-BOARD',
      packType: 'BOARD',
      reportingPeriod: '2026-Q1',
      legalEntityIds: [ENTITY_KSA],
      titleEn: 'Q1 2026 Board Oversight Pack',
      versionNumber: 1,
      status: 'REVIEW',
      sections: [
        {
          sectionCode: 'SEC-01-EXEC',
          title: 'Executive Financial & Operational Summary',
          order: 1,
          executiveSummaryText: 'Comprehensive Q1 review covering financial solvency, operational resilience, and internal controls.',
          metricsSnapshotIds: [snapshot.id],
          criticalRiskIds: ['risk_gov14_01'],
          keyFindingIds: [],
          attestationIds: [att.id],
          decisionsPendingIds: []
        }
      ],
      supportingDecisionId: DECISION_ID,
      isPackLocked: false,
      securityClassification: 'CONFIDENTIAL',
      auditCorrelationId: 'cor_pack_ready_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveGovernanceReportingPack(readyPack, boardChairContext.userId);

    // Evaluate Readiness Gate -> Expect Ready
    const gateReport = await evaluatePackReadinessGate('pack_ready_q1_2026', boardChairContext);
    assert.equal(gateReport.isReady, true);
    assert.equal(gateReport.blockers.length, 0);

    // Publish with Governed Integrity Seal
    const published = await approveAndPublishGovernancePack('pack_ready_q1_2026', boardChairContext);
    assert.equal(published.status, 'PUBLISHED');
    assert.equal(published.isPackLocked, true);
    assert.ok(published.checksumSha256, 'Published pack must have SHA-256 seal');
    assert.equal(published.boardChairSignoffUserId, boardChairContext.userId);

    // Published Pack Replacement Prohibition: Cannot overwrite published pack
    await assert.rejects(async () => {
      await approveAndPublishGovernancePack('pack_ready_q1_2026', boardChairContext);
    }, /already PUBLISHED and sealed/i);
  });

  it('7. Rejects Governance Sign-off by Technical Admin or Service Principal (SoD)', async () => {
    // Technical Admin blocked from pack publication
    await assert.rejects(async () => {
      await approveAndPublishGovernancePack('pack_ready_q1_2026', techAdminContext);
    }, /Segregation of Duties Violation.*Technical Administrator/i);

    // Service Principal / AI Agent blocked from pack publication
    await assert.rejects(async () => {
      await approveAndPublishGovernancePack('pack_ready_q1_2026', servicePrincipalContext);
    }, /Segregation of Duties Violation.*Automated Agent/i);
  });

  it('8. Decision Follow-Up: Enforces accountable owner on resolution execution', async () => {
    // Seed Decision requiring execution
    const decision: CorporateDecision = {
      id: 'dec_capex_01',
      decisionNumber: 'DEC-2026-CAPEX-01',
      titleEn: 'Approve $5M Cold Chain Expansion in Dammam',
      decisionType: 'CAPITAL_ALLOCATION',
      legalEntityId: ENTITY_KSA,
      lifecycleStatus: 'APPROVED',
      executionStatus: 'PENDING_DISPATCH',
      isExecutionControlled: true,
      executedByUserId: opsManagerContext.userId,
      approvedByUserIds: [boardChairContext.userId],
      effectiveDate: new Date().toISOString(),
      auditCorrelationId: 'cor_dec_capex_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveCorporateDecision(decision, boardChairContext.userId);

    const resolution: CorporateResolution = {
      id: 'res_capex_01',
      resolutionNumber: 'RES-2026-0042',
      decisionId: 'dec_capex_01',
      legalEntityId: ENTITY_KSA,
      title: 'Board Resolution on Cold Chain Capex Allocation',
      resolutionText: 'Resolved that management is authorized to disburse up to $5M for cold chain construction in Dammam.',
      resolutionType: 'BOARD_RESOLUTION',
      adoptionDateUtc: new Date().toISOString(),
      effectiveDate: new Date().toISOString(),
      votingOutcome: {
        votesFor: 5,
        votesAgainst: 0,
        votesAbstain: 0,
        totalEligibleVoters: 5,
        quorumMet: true,
        approvalPercentage: 100,
        thresholdAchieved: true
      },
      signatories: [
        {
          userId: boardChairContext.userId,
          name: 'Board Chairperson',
          title: 'Chairperson',
          signedAtUtc: new Date().toISOString()
        }
      ],
      status: 'ACTIVE',
      auditCorrelationId: 'cor_res_capex_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveCorporateResolution(resolution, boardChairContext.userId);

    // Enforce execution tracking
    const actions = await enforceResolutionDecisionExecution('res_capex_01', boardChairContext);
    assert.ok(actions.length > 0, 'Should create or retrieve governance action for resolution execution');
    assert.equal(actions[0].ownerUserId, opsManagerContext.userId);
    assert.equal(actions[0].status, 'OPEN');
  });

  it('9. Executive Action Management: Enforces Evidence Vault linkage and SoD on verification', async () => {
    const actionId = 'act_res_res_capex_01';

    // 1. Completion without evidence is rejected
    await assert.rejects(async () => {
      await completeGovernanceActionWithEvidence(actionId, {
        completionNotes: 'Completed capex disbursement',
        evidenceIds: []
      }, opsManagerContext);
    }, /Cannot complete Governance Action.*without supporting Evidence/i);

    // 2. Completion with valid evidence succeeds
    const completed = await completeGovernanceActionWithEvidence(actionId, {
      completionNotes: 'Capex disbursement executed and bank confirmation attached',
      evidenceIds: ['evi_q1_fin_ctrl_01']
    }, opsManagerContext);
    assert.equal(completed.status, 'COMPLETED');

    // 3. SoD Anti-Corruption: Action owner cannot self-verify their own action
    await assert.rejects(async () => {
      await orchestrateAndVerifyGovernanceAction(actionId, opsManagerContext);
    }, /Segregation of Duties Violation.*cannot self-verify/i);

    // 4. Independent Verification by Board Chair or Compliance Director succeeds
    const verified = await orchestrateAndVerifyGovernanceAction(actionId, boardChairContext);
    assert.equal(verified.status, 'VERIFIED_CLOSED');
    assert.equal(verified.verifiedByUserId, boardChairContext.userId);
  });

  it('10. Multi-Tier SLA Escalation Matrix escalates overdue governance actions', async () => {
    // Seed Overdue Action (45 days overdue -> Level 3 escalation)
    const overdueDate = new Date(Date.now() - 45 * 86400000).toISOString();
    await saveGovernanceAction({
      id: 'act_overdue_sample_01',
      actionNumber: 'ACT-2025-9999',
      sourceType: 'AUDIT_RECOMMENDATION',
      sourceReferenceId: 'audit_finding_01',
      legalEntityId: ENTITY_KSA,
      title: 'Remediate IT Access Control Weakness',
      details: 'Audit Committee high-priority remediation action',
      ownerUserId: opsManagerContext.userId,
      ownerRole: 'OPERATIONS_MANAGER',
      dueDate: overdueDate,
      priority: 'HIGH',
      status: 'OVERDUE',
      evidenceIds: [],
      escalationLevel: 0,
      auditCorrelationId: 'cor_act_overdue_01',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 86400000).toISOString()
    }, opsManagerContext.userId);

    const escalationResult = await runGovernanceActionEscalationSweep(ENTITY_KSA, boardChairContext);
    assert.ok(escalationResult.escalatedActions.length > 0, 'Should escalate overdue action');

    const escalated = escalationResult.escalatedActions.find(a => a.id === 'act_overdue_sample_01');
    assert.ok(escalated, 'Overdue action should be in escalated list');
    assert.ok(escalated.escalationLevel >= 2, 'Action overdue >14 days should be escalated to Level 3 or 2');
    assert.ok(escalationResult.notificationsDispatched.length > 0, 'Should dispatch escalation notification');
  });

  it('11. Notification Router strictly deduplicates redundant reminders', async () => {
    const notifParams = {
      eventType: 'PACK_READY_FOR_REVIEW' as const,
      legalEntityId: ENTITY_KSA,
      jurisdictionContext: 'SA' as const,
      recipientUserId: groupCfoContext.userId,
      recipientRole: 'CFO',
      title: 'Agenda Lockdown Approaching for Q1 Audit Committee',
      body: 'Please finalize all agenda items and attach pre-read documents.',
      targetEntityType: 'COMMITTEE_AGENDA_ITEM',
      targetEntityId: 'agenda_item_01',
      policyVersionId: POLICY_VER_ID
    };

    // First dispatch -> Fresh delivery
    const d1 = await dispatchGovernanceNotification(notifParams, boardChairContext);
    assert.equal(d1.isDeduplicated, false);
    assert.equal(d1.isDelivered, true);

    // Immediate duplicate dispatch on same date -> Deduplicated
    const d2 = await dispatchGovernanceNotification(notifParams, boardChairContext);
    assert.equal(d2.isDeduplicated, true);
    assert.equal(d2.id, d1.id);
  });

  it('12. Cross-Committee Dependency Handoff & Resolution Lineage', async () => {
    const dep: CrossCommitteeDependency = {
      id: 'dep_aud_to_risk_01',
      dependencyNumber: 'CCD-2026-0001',
      legalEntityId: ENTITY_KSA,
      sourceCommitteeType: 'AUDIT_COMMITTEE',
      sourceEntityType: 'AUDIT_FINDING',
      sourceEntityId: 'finding_it_01',
      targetCommitteeType: 'RISK_COMMITTEE',
      targetEntityType: 'EXECUTIVE_ACTION',
      title: 'Escalate Unmitigated IT Access Risk to Enterprise Risk Committee',
      description: 'Audit finding indicates systematic segregation of duties risk across logistics systems.',
      status: 'PENDING_HANDOFF',
      handoffDate: new Date().toISOString(),
      supportingPolicyVersionId: POLICY_VER_ID,
      auditCorrelationId: 'cor_dep_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await createCrossCommitteeDependency(dep, complianceDirectorContext);
    assert.equal(created.status, 'PENDING_HANDOFF');

    // Resolve dependency
    const resolved = await resolveCrossCommitteeDependency(
      'dep_aud_to_risk_01',
      'Incorporate IT Access finding into Enterprise Risk Register item RSK-SEC-004',
      'risk_gov14_01',
      complianceDirectorContext
    );
    assert.equal(resolved.status, 'RESOLVED');
    assert.equal(resolved.targetEntityId, 'risk_gov14_01');
    assert.ok(resolved.resolvedDate);
  });

  it('13. Aggregates Consolidated Executive Desk View for Board Chair & CFO', async () => {
    const chairDesk = await getExecutiveDeskView(boardChairContext.userId, ENTITY_KSA, boardChairContext);
    assert.equal(chairDesk.userId, boardChairContext.userId);
    assert.equal(chairDesk.legalEntityId, ENTITY_KSA);
    assert.ok(chairDesk.summaryCounts.overdueCount >= 1, 'Should reflect overdue actions in executive desk view');

    const cfoDesk = await getExecutiveDeskView(groupCfoContext.userId, ENTITY_KSA, groupCfoContext);
    assert.equal(cfoDesk.userId, groupCfoContext.userId);
    assert.ok(typeof cfoDesk.summaryCounts.totalPendingItems === 'number');
  });

  it('14. Cross-Entity Isolation: Prohibits unauthorized cross-entity operations', async () => {
    const ukManagerContext: UserContext = {
      userId: 'usr_uk_mgr_01',
      role: 'OPERATIONS_MANAGER',
      roles: ['OPERATIONS_MANAGER'],
      legalEntityId: ENTITY_UK
    };

    // UK operations manager cannot evaluate or access KSA pack
    await assert.rejects(async () => {
      await evaluatePackReadinessGate('pack_ready_q1_2026', ukManagerContext);
    }, /Access Denied.*legal entity 'entity_uk_gov14'/i);
  });
});
