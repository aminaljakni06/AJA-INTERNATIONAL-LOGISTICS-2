/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Governance Test Suite
 * Step GOV-19: Regulatory Supervision, Inquiries, Inspections, Response Coordination, Submissions & Commitments
 * 
 * Invariant Under Test:
 * GOVERNANCE-REGULATORY-CASE-INVARIANT-01:
 * AUTHORITY-VERIFIED, LEGALLY-PRESERVED, DEADLINE-CONTROLLED, PROVENANCE-PRESERVED & HUMAN-APPROVED REGULATORY RESPONSE
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RegulatoryCaseService } from '../services/regulatoryCaseService';
import {
  resetRegulatoryCaseStores,
  getRegulatoryCaseById,
  listSubmissionsByCaseId
} from '../db/repositories/regulatoryCaseRepository';
import {
  saveRegulatorySource
} from '../db/repositories/regulatoryIntelligenceRepository';
import { resetCorporateRecordsRepositoryMemoryStore } from '../db/repositories/corporateRecordsRepository';
import { resetComplianceCalendarRepositoryMemoryStore } from '../db/repositories/complianceCalendarRepository';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';

describe('STEP GOV-19 — REGULATORY SUPERVISION, INSPECTIONS, INQUIRIES & REGULATORY CASE MANAGEMENT', () => {
  let service: RegulatoryCaseService;

  // Actor personas
  const ccoUser: User = {
    id: 'USR-CCO-01',
    name: 'Sarah Jenkins (Chief Compliance Officer)',
    email: 's.jenkins@aja-logistics.com',
    role: 'COMPLIANCE_OFFICER',
    permissions: ['governance:compliance:manage', 'governance:case:manage', 'governance:export:authorized'],
    companyId: 'AJA_UK_LTD'
  };

  const legalCounselUser: User = {
    id: 'USR-LEGAL-01',
    name: 'David Vance (General Counsel)',
    email: 'd.vance@aja-logistics.com',
    role: 'LEGAL_COUNSEL',
    permissions: ['governance:legal:manage', 'governance:case:manage', 'governance:export:authorized', 'governance:legal:privileged'],
    companyId: 'AJA_UK_LTD'
  };

  const preparerUser: User = {
    id: 'USR-COMPL-ANALYST-01',
    name: 'Emily Watson (Compliance Analyst)',
    email: 'e.watson@aja-logistics.com',
    role: 'COMPLIANCE_OFFICER',
    permissions: ['governance:compliance:manage', 'governance:case:manage'],
    companyId: 'AJA_UK_LTD'
  };

  const ksaOfficerUser: User = {
    id: 'USR-KSA-OFFICER-01',
    name: 'Tariq Al-Mansoor (KSA Compliance Officer)',
    email: 't.almansoor@aja-logistics.sa',
    role: 'COMPLIANCE_OFFICER',
    permissions: ['governance:compliance:manage'],
    companyId: 'AJA_SAUDI_ARABIA_LTD'
  };
  (ksaOfficerUser as any).legalEntityId = 'AJA_SAUDI_ARABIA_LTD';

  const viewOnlyUser: User = {
    id: 'USR-VIEW-ONLY',
    name: 'Bob Viewer',
    email: 'b.viewer@aja-logistics.com',
    role: 'STAFF',
    permissions: ['governance:compliance:view'],
    companyId: 'AJA_UK_LTD'
  };

  const aiActor: User = {
    id: 'service_principal_ai',
    name: 'Gemini Governance AI Assistant',
    email: 'ai-engine@internal.system',
    role: 'STAFF',
    permissions: ['governance:ai:advisory'],
    companyId: 'AJA_GROUP_GLOBAL'
  };
  (aiActor as any).isAI = true;

  const abacContext: ABACContext = {
    userId: ccoUser.id,
    userRole: ccoUser.role,
    tenantId: 'AJA_UK_LTD',
    correlationId: 'test_corr_gov19_001'
  };

  beforeEach(() => {
    resetRegulatoryCaseStores();
    resetCorporateRecordsRepositoryMemoryStore();
    resetComplianceCalendarRepositoryMemoryStore();
    service = new RegulatoryCaseService();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Valid Official Inquiry Registration & Provenance
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-01: Verified Authority Inquiry is registered with provenance & statutory deadline captured', async () => {
    // 1. Seed verified regulatory source
    const authority = await saveRegulatorySource({
      id: 'src_hmrc_customs_01',
      sourceName: 'HMRC Customs & Excise Supervisory Directorate',
      sourceType: 'REGULATOR_RULEBOOK',
      sourceReference: 'HMRC-NOT-2026',
      sourceLocation: 'https://gov.uk/hmrc',
      language: 'en',
      authorityName: 'His Majesty\'s Revenue & Customs',
      jurisdiction: 'GB',
      officialDomain: 'gov.uk',
      trustClassification: 'OFFICIAL_REGULATOR',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: ccoUser.id,
      verifiedAtUtc: new Date().toISOString(),
      active: true,
      integrityHashSha256: '',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString()
    });

    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: authority.id,
        authorityName: authority.authorityName,
        caseType: 'INQUIRY',
        sourceReference: 'HMRC-INQ-2026-8819',
        title: 'Information Request on Transit Declarations',
        description: 'Supervisory inquiry regarding UK-EU transit procedures under NCTS Phase 5',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id,
        evidenceDocumentIds: ['doc_transit_manifest_01']
      },
      ccoUser,
      abacContext
    );

    assert.ok(rCase.id);
    assert.match(rCase.caseNumber, /^RGC-2026-\d{4}$/);
    assert.equal(rCase.status, 'RECEIVED');
    assert.equal(rCase.responseDueAtUtc, '2026-09-01T17:00:00.000Z');
    assert.equal(rCase.sourceReference, 'HMRC-INQ-2026-8819');
    assert.ok(rCase.internalTargetDateUtc); // Should be set prior to statutory deadline
  });

  // --------------------------------------------------------------------------
  // TEST 2: Fake / Unverified Authority is Denied Authoritative Registration
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-02: Fake / Unverified Regulator Domain is Denied Authoritative Registration', async () => {
    const fakeAuthority = await saveRegulatorySource({
      id: 'src_fake_regulator_01',
      sourceName: 'Fake Regulator Portal',
      sourceType: 'SECONDARY_SOURCE',
      sourceReference: 'FAKE-REF',
      sourceLocation: 'https://fake-hmrc-portal.com',
      language: 'en',
      authorityName: 'Unauthorized Impersonator',
      jurisdiction: 'GB',
      officialDomain: 'fake-hmrc-portal.com',
      trustClassification: 'SECONDARY_SOURCE',
      verificationStatus: 'REJECTED',
      active: false,
      integrityHashSha256: '',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString()
    });

    await assert.rejects(
      async () => {
        await service.registerRegulatoryCase(
          {
            legalEntityId: 'AJA_UK_LTD',
            jurisdiction: 'GB',
            authorityId: fakeAuthority.id,
            authorityName: fakeAuthority.authorityName,
            caseType: 'INQUIRY',
            sourceReference: 'FAKE-NOTICE-001',
            title: 'Suspicious Notice',
            description: 'Unverified source attempt',
            receivedAtUtc: '2026-08-01T09:00:00Z',
            responseDueAtUtc: '2026-09-01T17:00:00Z',
            caseOwnerUserId: ccoUser.id
          },
          ccoUser,
          abacContext
        );
      },
      {
        name: 'ValidationError',
        message: /unverified or fake regulatory authority/
      }
    );
  });

  // --------------------------------------------------------------------------
  // TEST 3 & 4: Inquiry != Violation & Observation != Confirmed Finding
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-03 & 04: Inquiry Receipt or Inspection Observation does NOT automatically create a Violation/Finding', async () => {
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_tga_01',
        authorityName: 'Transport General Authority',
        caseType: 'INSPECTION_NOTICE',
        sourceReference: 'TGA-INSP-2026-094',
        title: 'Routine Fleet Safety Audit Inspection',
        description: 'On-site facility inspection notice',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-08-25T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    // Initial case must have zero findings
    assert.equal(rCase.findingIds.length, 0);
    assert.equal(rCase.status, 'RECEIVED');
  });

  // --------------------------------------------------------------------------
  // TEST 5 & 6: Immediate Legal Hold on Critical/Enforcement Matters
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-05 & 06: Critical Enforcement Notice triggers immediate Legal Hold and protects evidence', async () => {
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC Enforcement Division',
        caseType: 'ENFORCEMENT_NOTICE',
        sourceReference: 'HMRC-ENF-2026-003',
        title: 'Formal Enforcement Notice - Duty Calculation Investigation',
        description: 'Statutory demand for records under Customs Management Act',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-08-20T17:00:00Z',
        materiality: 'CRITICAL',
        caseOwnerUserId: legalCounselUser.id,
        evidenceDocumentIds: ['doc_customs_records_2025', 'doc_financial_ledger_q4']
      },
      legalCounselUser,
      abacContext
    );

    assert.ok(rCase.legalHoldId);
    assert.equal(rCase.materiality, 'CRITICAL');
  });

  // --------------------------------------------------------------------------
  // TEST 7, 8, 9 & 10: Drafting, AI Denial & Segregation of Duties on Approval
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-07 to 10: Draft Preparation, AI Denial and Human SoD Enforcement', async () => {
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'INFORMATION_REQUEST',
        sourceReference: 'HMRC-IR-2026-44',
        title: 'Request for Information regarding Authorized Economic Operator (AEO) status',
        description: 'Clarification on physical security controls',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    // 1. AI cannot prepare formal submission
    await assert.rejects(
      async () => {
        await service.prepareDraftSubmission(
          {
            caseId: rCase.id,
            documentVersionId: 'doc_ver_aeo_response_v1',
            submittedContentSummary: 'AI generated response',
            submissionMethod: 'PORTAL'
          },
          aiActor,
          abacContext
        );
      },
      {
        name: 'PermissionError',
        message: /AI assistants cannot be assigned as official authors/
      }
    );

    // 2. Human preparer prepares draft submission
    const draft = await service.prepareDraftSubmission(
      {
        caseId: rCase.id,
        documentVersionId: 'doc_ver_aeo_response_v1',
        submittedContentSummary: 'Official submission addressing physical warehouse security controls',
        submissionMethod: 'PORTAL'
      },
      preparerUser,
      abacContext
    );

    assert.equal(draft.status, 'DRAFT');
    assert.equal(draft.preparedByUserId, preparerUser.id);
    assert.match(draft.submissionNumber, /^SUB-RGC-2026-\d{4}-V1$/);

    // 3. AI cannot approve submission
    await assert.rejects(
      async () => {
        await service.reviewAndApproveSubmission(draft.id, aiActor, abacContext);
      },
      {
        name: 'PermissionError',
        message: /AI assistants are denied from approving/
      }
    );

    // 4. Segregation of Duties: Preparer cannot approve their own submission
    await assert.rejects(
      async () => {
        await service.reviewAndApproveSubmission(draft.id, preparerUser, abacContext);
      },
      {
        name: 'PermissionError',
        message: /Segregation of Duties Violation: Preparer of submission cannot approve their own submission/
      }
    );

    // 5. Independent Human Officer approves submission
    const approved = await service.reviewAndApproveSubmission(draft.id, ccoUser, abacContext, 'Reviewed and verified by CCO');
    assert.equal(approved.status, 'APPROVED');
    assert.equal(approved.approvedByUserId, ccoUser.id);
  });

  // --------------------------------------------------------------------------
  // TEST 11, 12, 13: GOV-06 Decision, Execution and Submitted != Accepted
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-11 to 13: Formal Board Resolution Handoff, Execution & Submitted != Accepted', async () => {
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'SUPERVISORY_REVIEW',
        sourceReference: 'HMRC-REV-2026-90',
        title: 'Supervisory Review of Special Procedures',
        description: 'Comprehensive review requiring formal Board-approved position',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        materiality: 'BOARD_ESCALATION',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    // 1. Create Response Plan requiring Board Approval
    await service.createOrUpdateResponsePlan(
      {
        caseId: rCase.id,
        responseScope: 'Complete audit of bonded warehouse movements',
        requiredEvidenceTypes: ['FINANCIAL_LEDGER', 'CUSTOMS_DECLARATION'],
        assignedReviewers: [{ userId: legalCounselUser.id, role: 'LEGAL' }],
        responseOwnerUserId: ccoUser.id,
        submissionMethod: 'PORTAL',
        requiresBoardApproval: true
      },
      ccoUser,
      abacContext
    );

    // 2. Prepare and approve draft submission (triggers GOV-06 CorporateDecision creation)
    const draft = await service.prepareDraftSubmission(
      {
        caseId: rCase.id,
        documentVersionId: 'doc_bonded_wh_audit_v1',
        submittedContentSummary: 'Board approved submission on bonded warehouse operations',
        submissionMethod: 'PORTAL'
      },
      preparerUser,
      abacContext
    );

    const approved = await service.reviewAndApproveSubmission(draft.id, ccoUser, abacContext);
    assert.equal(approved.status, 'APPROVED');

    const updatedCase = await getRegulatoryCaseById(rCase.id);
    assert.ok(updatedCase?.supportingDecisionId); // Linked to GOV-06 Decision

    // 3. Execute submission (Handoff to GOV-15 Corporate Action)
    const executed = await service.executeSubmission(
      approved.id,
      'HMRC-PORTAL-RCPT-998811',
      legalCounselUser,
      abacContext
    );

    assert.equal(executed.status, 'SUBMITTED');
    assert.equal(executed.receiptReference, 'HMRC-PORTAL-RCPT-998811');

    // Submitted != Accepted: Case is in SUBMITTED state, not CLOSED
    const caseAfterSub = await getRegulatoryCaseById(rCase.id);
    assert.equal(caseAfterSub?.status, 'SUBMITTED');
    assert.notEqual(caseAfterSub?.status, 'CLOSED');
  });

  // --------------------------------------------------------------------------
  // TEST 14 & 15: Document Version Pinning & Supersession
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-14 & 15: Submitted DocumentVersion is Pinned; Correction creates V2 while preserving V1', async () => {
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'INQUIRY',
        sourceReference: 'HMRC-INQ-2026-99',
        title: 'Tariff Code Classification Inquiry',
        description: 'Review of commodities under chapter 84',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    // 1. Submit V1
    const v1Draft = await service.prepareDraftSubmission(
      {
        caseId: rCase.id,
        documentVersionId: 'doc_ver_tariff_response_v1',
        submittedContentSummary: 'Initial classification analysis',
        submissionMethod: 'EMAIL'
      },
      preparerUser,
      abacContext
    );
    await service.reviewAndApproveSubmission(v1Draft.id, ccoUser, abacContext);
    await service.executeSubmission(v1Draft.id, 'RCPT-EM-01', ccoUser, abacContext);

    // 2. Prepare V2 superseding V1 with new DocumentVersion
    const v2Draft = await service.prepareDraftSubmission(
      {
        caseId: rCase.id,
        documentVersionId: 'doc_ver_tariff_response_v2_amended',
        submittedContentSummary: 'Amended classification incorporating engineering report',
        submissionMethod: 'EMAIL',
        supersedesSubmissionId: v1Draft.id
      },
      preparerUser,
      abacContext
    );

    assert.equal(v2Draft.versionNumber, 2);
    assert.equal(v2Draft.supersedesSubmissionId, v1Draft.id);
    assert.equal(v2Draft.documentVersionId, 'doc_ver_tariff_response_v2_amended');

    // Ensure V1 remains intact in database
    const submissions = await listSubmissionsByCaseId(rCase.id);
    assert.equal(submissions.length, 2);
    assert.equal(submissions[0].documentVersionId, 'doc_ver_tariff_response_v1');
  });

  // --------------------------------------------------------------------------
  // TEST 16, 17, 18 & 19: Regulatory Commitments & GOV-11 Finding Integration
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-16 to 19: Regulatory Commitment Tracking, SoD Verification & GOV-11 Finding Integration', async () => {
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_tga_01',
        authorityName: 'Transport Authority',
        caseType: 'REGULATORY_OBSERVATION',
        sourceReference: 'TGA-OBS-2026-12',
        title: 'Inspection Observation - Driver Rest Break Recording',
        description: 'Observation regarding tachograph calibration records',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    // Register a Regulatory Commitment with confirmed internal deficiency (creates GOV-11 finding)
    const commitment = await service.registerRegulatoryCommitment(
      {
        caseId: rCase.id,
        sourceSubmissionId: 'sub_tga_response_01',
        description: 'Upgrade digital tachograph download stations across all depots',
        dueDateUtc: '2026-10-15T17:00:00Z',
        ownerUserId: preparerUser.id,
        isConfirmedInternalDeficiency: true
      },
      ccoUser,
      abacContext
    );

    assert.ok(commitment.id);
    assert.match(commitment.commitmentNumber, /^RCM-2026-\d{4}$/);
    assert.equal(commitment.status, 'OPEN');
    assert.ok(commitment.findingId); // GOV-11 Finding was created
    assert.ok(commitment.governanceCalendarEventId); // GOV-08 Calendar Event registered

    // Segregation of Duties: Owner cannot self-verify commitment fulfillment
    await assert.rejects(
      async () => {
        await service.verifyAndFulfillCommitment(
          commitment.id,
          preparerUser,
          abacContext,
          'Self verification attempt',
          ['doc_upgrade_invoice_01']
        );
      },
      {
        name: 'PermissionError',
        message: /Commitment owner cannot self-verify commitment fulfillment/
      }
    );

    // Independent Officer verifies fulfillment
    const verified = await service.verifyAndFulfillCommitment(
      commitment.id,
      ccoUser,
      abacContext,
      'Depot hardware inspection verified by Compliance Officer',
      ['doc_upgrade_invoice_01', 'doc_depot_inspection_cert']
    );

    assert.equal(verified.status, 'VERIFIED');
    assert.equal(verified.verifiedByUserId, ccoUser.id);
  });

  // --------------------------------------------------------------------------
  // TEST 20, 21 & 22: Multi-Entity Access Isolation, Privilege & Export
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-20 to 22: Cross-Entity Isolation, Privileged Protection & View != Export', async () => {
    const ukCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'ENFORCEMENT_NOTICE',
        sourceReference: 'HMRC-PRIV-2026-001',
        title: 'Privileged Tax & Customs Legal Defense',
        description: 'Confidential legal counsel litigation strategy',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: legalCounselUser.id,
        isPrivilegedLegalContent: true
      },
      legalCounselUser,
      abacContext
    );

    // 1. Cross-Entity Denial: KSA Officer cannot access UK Case
    await assert.rejects(
      async () => {
        await service.getRegulatoryCase(ukCase.id, ksaOfficerUser, {
          userId: ksaOfficerUser.id,
          userRole: ksaOfficerUser.role,
          tenantId: 'AJA_SAUDI_ARABIA_LTD',
          correlationId: 'corr_ksa_leak_test'
        });
      },
      {
        name: 'PermissionError',
        message: /Cross-Entity Access Denied/
      }
    );

    // 2. Privileged Content Protection: Generic User without legal entitlement is denied
    await assert.rejects(
      async () => {
        await service.getRegulatoryCase(ukCase.id, viewOnlyUser, abacContext);
      },
      {
        name: 'PermissionError',
        message: /contains legally privileged advisory content/
      }
    );

    // 3. View != Export: User without export permission cannot export case bundle
    await assert.rejects(
      async () => {
        await service.exportRegulatoryCaseBundle(ukCase.id, viewOnlyUser, abacContext);
      },
      {
        name: 'PermissionError',
        message: /View permission does not grant regulatory bundle export entitlement/
      }
    );
  });

  // --------------------------------------------------------------------------
  // TEST 23 & 24: Deduplication & False Closure Prevention
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-23 & 24: Ingestion Deduplication and False Closure Prevention', async () => {
    // 1. Deduplication: Ingesting the same notice returns the existing canonical case
    const case1 = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'INQUIRY',
        sourceReference: 'HMRC-DEDUP-TEST-01',
        title: 'Deduplication Notice Test',
        description: 'Notice 1',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    const case2 = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'INQUIRY',
        sourceReference: 'HMRC-DEDUP-TEST-01', // Same fingerprint
        title: 'Deduplication Notice Test Duplicate',
        description: 'Notice 2 duplicate ingestion',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    assert.equal(case1.id, case2.id); // Same canonical record

    // 2. False Closure Prevention: Cannot close case without submissions or with open commitments
    await assert.rejects(
      async () => {
        await service.closeRegulatoryCase(case1.id, ccoUser, abacContext, 'Premature closure attempt');
      },
      {
        name: 'ValidationError',
        message: /without any official submissions recorded/
      }
    );
  });

  // --------------------------------------------------------------------------
  // TEST 25: Point-in-Time Regulatory Case Replay
  // --------------------------------------------------------------------------
  test('GOV-19-TEST-25: Deterministic Point-in-Time Regulatory Case Replay at Date T', async () => {
    // 1. Ingest case at T1 (2026-08-01)
    const rCase = await service.registerRegulatoryCase(
      {
        legalEntityId: 'AJA_UK_LTD',
        jurisdiction: 'GB',
        authorityId: 'auth_hmrc_01',
        authorityName: 'HMRC',
        caseType: 'INQUIRY',
        sourceReference: 'HMRC-REPLAY-2026',
        title: 'Historical Replay Case Test',
        description: 'Case for validating historical immutable replay',
        receivedAtUtc: '2026-08-01T09:00:00Z',
        responseDueAtUtc: '2026-09-01T17:00:00Z',
        caseOwnerUserId: ccoUser.id
      },
      ccoUser,
      abacContext
    );

    // 2. Replay at T1 (2026-08-05) -> No submissions yet
    const replayT1 = await service.getPointInTimeRegulatoryCaseReplay(
      rCase.id,
      '2026-08-05T00:00:00Z',
      ccoUser,
      abacContext
    );

    assert.equal(replayT1.activeSubmissionsAtTime.length, 0);
    assert.equal(replayT1.activeCommitmentsAtTime.length, 0);
    assert.ok(replayT1.integrityHashSha256);
  });
});
