/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Secretariat & Statutory Execution Test Suite
 * Step GOV-15: Delegated Execution, Corporate Secretariat Operations & Statutory Corporate Actions
 * 
 * Test Invariants:
 * 1. Corporate Secretariat Instruction sequence (SEC-YYYY-####) and decision/resolution linkage
 * 2. Statutory Corporate Action lifecycle & GOVERNANCE-POLICY-INVARIANT-01 rule set resolution
 * 3. Authority Validation: DoA temporal validity, PoA notarization & explicit scope matching
 * 4. Boundary Protection: Technical Admin & AI/Automated Agent execution restrictions
 * 5. Multi-Entity Isolation: Cross-entity execution rejection
 * 6. Canonical Domain Dispatch: Director appointment, removal, PSC change, profile change, policy publication
 * 7. Idempotent Execution: Safe retry and duplicate execution prevention
 * 8. External Regulatory Submission Tracking (SUB-YYYY-####) & receipt pinning
 * 9. Segregation of Duties (SoD): Executor prohibited from self-verifying execution evidence
 * 10. Cryptographic Evidence Vault Integrity: SHA-256 checksum verification & tamper detection
 * 11. Multi-Registry Statutory Reconciliation & Discrepancy Tracking (REC-YYYY-####)
 * 12. Point-in-Time Policy Replay & Immutable Audit Trail
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  CorporateSecretariatService,
  CreateSecretariatInstructionInput,
  CreateCorporateActionInput
} from '../services/corporateSecretariatService';
import {
  saveCorporateActionPolicyRuleSet,
  saveSecretariatInstruction,
  getSecretariatInstructionById,
  deleteSecretariatInstructionProhibited,
  saveCorporateAction,
  getCorporateActionById,
  deleteCorporateActionProhibited,
  computeSecretariatSha256
} from '../db/repositories/corporateSecretariatRepository';
import {
  saveCorporateDecision,
  saveCorporateResolution,
  saveCorporateAppointment,
  getCorporateAppointmentById,
  listAppointmentsByLegalEntity,
  savePSCRecord,
  listPSCRecordsByLegalEntity,
  saveCorporateLegalProfile,
  getCorporateLegalProfileByEntityId
} from '../db/repositories/corporateGovernanceRepository';
import {
  saveDelegation,
  savePowerOfAttorney,
  saveCorporatePolicy,
  saveCorporatePolicyVersion,
  getCorporatePolicyVersionById
} from '../db/repositories/corporateAuthorityRepository';
import {
  saveEvidenceRecord
} from '../db/repositories/corporateRecordsRepository';
import {
  createDocument,
  createDocumentVersion,
  calculateSha256Checksum
} from '../db/repositories/documentRepository';
import { UserContext } from '../types/permissions';
import {
  CorporateActionPolicyRuleSet,
  CorporateDecision,
  CorporateResolution,
  DelegationOfAuthority,
  PowerOfAttorney,
  CorporateLegalProfile
} from '../types/corporateGovernance';

describe('STEP GOV-15: Corporate Secretariat & Statutory Corporate Actions', () => {
  const ENTITY_KSA = 'entity_ksa_gov15';
  const ENTITY_UK = 'entity_uk_gov15';
  const POLICY_ID = 'pol_sec_01';
  const POLICY_VER_ID = 'ver_sec_01_v1';
  const DECISION_ID = 'dec_sec_appoint_dir_01';
  const RESOLUTION_ID = 'res_sec_appoint_dir_01';

  const companySecretaryContext: UserContext = {
    userId: 'usr_sec_01',
    role: 'COMPANY_ADMIN',
    roles: ['COMPANY_SECRETARY', 'COMPANY_ADMIN'],
    primaryLegalEntityId: ENTITY_KSA,
    allowedLegalEntityIds: [ENTITY_KSA]
  };

  const directorExecutorContext: UserContext = {
    userId: 'usr_dir_exec_01',
    role: 'CEO',
    roles: ['DIRECTOR', 'CEO'],
    primaryLegalEntityId: ENTITY_KSA,
    allowedLegalEntityIds: [ENTITY_KSA]
  };

  const auditorVerifierContext: UserContext = {
    userId: 'usr_auditor_01',
    role: 'AUDITOR',
    roles: ['AUDITOR'],
    primaryLegalEntityId: ENTITY_KSA,
    allowedLegalEntityIds: [ENTITY_KSA]
  };

  const techAdminContext: UserContext = {
    userId: 'usr_tech_admin_01',
    role: 'ADMIN',
    roles: ['ADMIN'],
    primaryLegalEntityId: ENTITY_KSA,
    allowedLegalEntityIds: [ENTITY_KSA]
  };

  const aiAgentContext: UserContext = {
    userId: 'usr_ai_agent_01',
    role: 'SERVICE_PRINCIPAL',
    roles: ['AI_AGENT', 'SERVICE_PRINCIPAL'],
    primaryLegalEntityId: ENTITY_KSA,
    allowedLegalEntityIds: [ENTITY_KSA]
  };

  const ukUserContext: UserContext = {
    userId: 'usr_uk_exec_01',
    role: 'COMPANY_ADMIN',
    roles: ['COMPANY_ADMIN'],
    primaryLegalEntityId: ENTITY_UK,
    allowedLegalEntityIds: [ENTITY_UK]
  };

  before(async () => {
    const now = new Date().toISOString();

    // 1. Seed Corporate Legal Profile
    const profile: CorporateLegalProfile = {
      id: ENTITY_KSA,
      legalEntityId: ENTITY_KSA,
      legalCompanyName: 'AJA International Logistics KSA Ltd',
      companyNumber: 'CR-1010998877',
      companyType: 'LLC',
      incorporationDate: '2020-01-01',
      incorporationJurisdiction: 'SA',
      registeredOfficeAddress: {
        addressLine1: 'King Fahd Road',
        city: 'Riyadh',
        postalCode: '12211',
        country: 'SA',
        isPrincipalPlaceOfBusiness: true
      },
      principalBusinessAddresses: [],
      companyStatus: 'ACTIVE',
      financialYear: {
        accountingReferenceDate: '12-31',
        nextAccountsDueDate: '2026-06-30',
        nextConfirmationStatementDueDate: '2026-12-31'
      },
      taxRegistrations: {
        vatNumber: '300123456700003',
        taxResidenceJurisdiction: 'SA'
      },
      advisors: {},
      dataClassification: 'RESTRICTED',
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateLegalProfile(profile, 'seed', 'cor_seed');

    // 2. Seed Corporate Policy & Policy Version
    await saveCorporatePolicy({
      id: POLICY_ID,
      policyCode: 'POL-CORP-SEC-001',
      title: 'Corporate Secretariat Statutory Execution Policy',
      category: 'GOVERNANCE',
      ownerUserId: 'usr_sec_01',
      ownerRole: 'COMPANY_SECRETARY',
      legalEntityScope: [ENTITY_KSA],
      activeVersionNumber: 1,
      mandatoryReviewFrequencyMonths: 12,
      lifecycleStatus: 'APPROVED',
      classificationClearance: 'CONFIDENTIAL',
      createdAt: now,
      updatedAt: now
    }, 'seed');

    await saveCorporatePolicyVersion({
      id: POLICY_VER_ID,
      policyId: POLICY_ID,
      versionNumber: 1,
      contentSummary: 'Governs statutory execution of Board and Executive decisions.',
      supportingDecisionId: DECISION_ID,
      effectiveFrom: '2026-01-01T00:00:00Z',
      reviewDate: '2027-01-01T00:00:00Z',
      approvedByUserIds: ['usr_sec_01'],
      createdAt: now,
      updatedAt: now
    }, 'seed');

    // 3. Seed Corporate Decision & Resolution
    const decision: CorporateDecision = {
      id: DECISION_ID,
      decisionNumber: 'DEC-2026-0099',
      legalEntityId: ENTITY_KSA,
      decisionType: 'OFFICER_APPOINTMENT',
      titleEn: 'Appointment of Statutory Board Director',
      effectiveDate: now,
      lifecycleStatus: 'APPROVED',
      auditCorrelationId: 'cor_seed',
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateDecision(decision, 'seed');

    const resolution: CorporateResolution = {
      id: RESOLUTION_ID,
      resolutionNumber: 'RES-2026-0099',
      decisionId: DECISION_ID,
      legalEntityId: ENTITY_KSA,
      title: 'Resolution to Appoint Director',
      resolutionText: 'Be it resolved that Dr. Tariq Al-Mansoor is appointed as Statutory Director.',
      resolutionType: 'BOARD_RESOLUTION',
      adoptionDateUtc: now,
      effectiveDate: now,
      votingOutcome: {
        votesFor: 5,
        votesAgainst: 0,
        votesAbstain: 0,
        totalEligibleVoters: 5,
        quorumMet: true,
        approvalPercentage: 100,
        thresholdAchieved: true
      },
      signatories: [],
      status: 'ACTIVE',
      auditCorrelationId: 'cor_seed',
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateResolution(resolution, 'seed');

    // 4. Seed Policy Rule Sets for Actions
    const dirAppointRuleSet: CorporateActionPolicyRuleSet = {
      id: 'rule_dir_appoint_ksa',
      policyVersionId: POLICY_VER_ID,
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      requiresDecision: true,
      requiresResolution: true,
      allowedAuthorityTypes: ['STATUTORY_DIRECTOR', 'STATUTORY_OFFICER'],
      doaAllowed: true,
      poaAllowed: true,
      requiresSoD: true,
      prohibitExecutorAsVerifier: true,
      prohibitSubmitterAsVerifier: true,
      prohibitTechAdminBypass: true,
      requiresExternalFiling: false,
      evidenceRequirementCodes: ['CONSENT_TO_ACT', 'BOARD_MINUTES_SIGNED'],
      slaHours: 48,
      escalationPolicyTier: 2,
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateActionPolicyRuleSet(dirAppointRuleSet, 'seed');

    const pscChangeRuleSet: CorporateActionPolicyRuleSet = {
      id: 'rule_psc_change_ksa',
      policyVersionId: POLICY_VER_ID,
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'PSC_CHANGE',
      requiresDecision: true,
      requiresResolution: false,
      allowedAuthorityTypes: ['STATUTORY_DIRECTOR'],
      doaAllowed: false,
      poaAllowed: true,
      requiresSoD: true,
      prohibitExecutorAsVerifier: true,
      prohibitSubmitterAsVerifier: true,
      prohibitTechAdminBypass: true,
      requiresExternalFiling: true,
      evidenceRequirementCodes: ['PSC_NOTIFICATION_RECEIPT'],
      slaHours: 72,
      escalationPolicyTier: 1,
      createdAt: now,
      updatedAt: now
    };
    await saveCorporateActionPolicyRuleSet(pscChangeRuleSet, 'seed');
  });

  it('1. Issue Corporate Secretariat Instruction from Approved Decision (SEC-YYYY-####)', async () => {
    const input: CreateSecretariatInstructionInput = {
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      instructionType: 'OFFICER_APPOINTMENT_INSTRUCTION',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      authorizedExecutorId: directorExecutorContext.userId,
      policyVersionId: POLICY_VER_ID,
      effectiveFrom: new Date().toISOString(),
      dueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT',
      instructionNotes: 'Statutory appointment execution as per Board Decision 0099'
    };

    const instruction = await CorporateSecretariatService.createSecretariatInstruction(input, companySecretaryContext);

    assert.ok(instruction.id);
    assert.match(instruction.instructionNumber, /^SEC-\d{4}-\d{4}$/);
    assert.strictEqual(instruction.executionStatus, 'ISSUED');
    assert.strictEqual(instruction.sourceDecisionId, DECISION_ID);
    assert.strictEqual(instruction.legalEntityId, ENTITY_KSA);
  });

  it('2. Register Statutory Corporate Action with GOVERNANCE-POLICY-INVARIANT-01 Provenance (CA-YYYY-####)', async () => {
    const input: CreateCorporateActionInput = {
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'Execute Board Director Appointment',
      description: 'Formalize statutory registration of Dr. Tariq Al-Mansoor',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: directorExecutorContext.userId,
      authorizedExecutorRole: 'DIRECTOR',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT',
      targetPayloadData: {
        personId: 'per_tariq_01',
        fullNameEn: 'Dr. Tariq Al-Mansoor',
        nationality: 'SA',
        countryOfResidence: 'SA',
        titleEn: 'Statutory Board Member'
      }
    };

    const action = await CorporateSecretariatService.createCorporateAction(input, companySecretaryContext);

    assert.ok(action.id);
    assert.match(action.actionNumber, /^CA-\d{4}-\d{4}$/);
    assert.strictEqual(action.status, 'READY_FOR_AUTHORIZATION');
    assert.ok(action.pinnedRuleSetHashSha256);
    assert.strictEqual(action.effectiveRuleSnapshot.requiresDecision, true);
    assert.strictEqual(action.effectiveRuleSnapshot.requiresResolution, true);
  });

  it('3. Prevent Technical Administrator Bypass on Statutory Action Execution', async () => {
    const input: CreateCorporateActionInput = {
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'Admin Bypass Attempt Action',
      description: 'Attempting execution with IT Admin',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: techAdminContext.userId,
      authorizedExecutorRole: 'ADMIN',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT'
    };

    const action = await CorporateSecretariatService.createCorporateAction(input, companySecretaryContext);

    await assert.rejects(
      async () => {
        await CorporateSecretariatService.executeCorporateAction(action.id, techAdminContext);
      },
      /Segregation of Duties Violation: Technical Administrator without explicit corporate authority cannot execute statutory corporate actions/
    );
  });

  it('4. Prevent AI / Automated Service Principal from Signing Statutory Actions', async () => {
    const input: CreateCorporateActionInput = {
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'AI Signing Attempt Action',
      description: 'Attempting execution with AI Agent',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: aiAgentContext.userId,
      authorizedExecutorRole: 'SERVICE_PRINCIPAL',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT'
    };

    const action = await CorporateSecretariatService.createCorporateAction(input, companySecretaryContext);

    await assert.rejects(
      async () => {
        await CorporateSecretariatService.executeCorporateAction(action.id, aiAgentContext);
      },
      /Segregation of Duties Violation: Automated Agent or Service Principal cannot execute or sign statutory corporate actions/
    );
  });

  it('5. Enforce Multi-Entity Isolation on Corporate Action Execution', async () => {
    const input: CreateCorporateActionInput = {
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'Cross Entity Action',
      description: 'UK User attempting KSA action',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: ukUserContext.userId,
      authorizedExecutorRole: 'COMPANY_ADMIN',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT'
    };

    const action = await CorporateSecretariatService.createCorporateAction(input, companySecretaryContext);

    await assert.rejects(
      async () => {
        await CorporateSecretariatService.executeCorporateAction(action.id, ukUserContext);
      },
      /Cross-Entity Isolation Violation/
    );
  });

  it('6. Execute Statutory Action via DoA with Temporal & Delegate Validation', async () => {
    const now = new Date();
    const effectiveFrom = new Date(now.getTime() - 86400000).toISOString();
    const effectiveUntil = new Date(now.getTime() + 864000000).toISOString();

    const doa: DelegationOfAuthority = {
      id: 'doa_sec_valid_01',
      delegationNumber: 'DOA-2026-0888',
      legalEntityId: ENTITY_KSA,
      delegatorUserId: 'usr_chair_01',
      delegateUserId: directorExecutorContext.userId,
      authorityType: 'HR_APPOINTMENT',
      scopeLevel: 'LEGAL_ENTITY',
      effectiveFrom,
      effectiveUntil,
      reason: 'Delegated execution of governance appointments',
      status: 'ACTIVE',
      createdAt: effectiveFrom,
      updatedAt: effectiveFrom
    };
    await saveDelegation(doa, 'seed');

    const input: CreateCorporateActionInput = {
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'Execute Director Appointment with DoA',
      description: 'Delegated Director Appointment',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: directorExecutorContext.userId,
      authorizedExecutorRole: 'DIRECTOR',
      doaId: doa.id,
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT',
      targetPayloadData: {
        personId: 'per_tariq_02',
        fullNameEn: 'Dr. Tariq Al-Mansoor',
        nationality: 'SA',
        countryOfResidence: 'SA',
        titleEn: 'Independent Director'
      }
    };

    const action = await CorporateSecretariatService.createCorporateAction(input, companySecretaryContext);
    const executed = await CorporateSecretariatService.executeCorporateAction(action.id, directorExecutorContext);

    assert.strictEqual(executed.status, 'PENDING_VERIFICATION');
    assert.strictEqual(executed.executionAttempts.length, 1);
    assert.strictEqual(executed.executionAttempts[0].status, 'SUCCESS');

    // Verify Canonical Domain Dispatch occurred
    const appointments = await listAppointmentsByLegalEntity(ENTITY_KSA);
    const createdApt = appointments.find(a => a.personReference.fullNameEn === 'Dr. Tariq Al-Mansoor');
    assert.ok(createdApt);
    assert.strictEqual(createdApt.statutoryRole, 'DIRECTOR');
    assert.strictEqual(createdApt.status, 'ACTIVE');
  });

  it('7. Enforce Separation of Duties (SoD): Executor Prohibited from Self-Verification', async () => {
    const actions = await CorporateSecretariatService.createCorporateAction({
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'SoD Test Action',
      description: 'Action for SoD testing',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: directorExecutorContext.userId,
      authorizedExecutorRole: 'DIRECTOR',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT'
    }, companySecretaryContext);

    await CorporateSecretariatService.executeCorporateAction(actions.id, directorExecutorContext);

    // Create evidence document & version
    const docData = Buffer.from('Official Board Signed Appointment Consent').toString('base64');
    const checksum = calculateSha256Checksum('Official Board Signed Appointment Consent');

    const createdDoc = await createDocument({
      id: 'doc_consent_01',
      ownerType: 'GOVERNANCE',
      ownerId: ENTITY_KSA,
      fileName: 'consent_to_act.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      storagePath: '/docs/consent_01.pdf',
      fileData: docData,
      checksumSha256: checksum,
      uploadedBy: directorExecutorContext.userId
    });

    const docVer = await createDocumentVersion('doc_consent_01', {
      fileName: 'consent_to_act.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      storagePath: '/docs/consent_01.pdf',
      fileData: docData,
      checksumSha256: checksum,
      uploadedBy: directorExecutorContext.userId
    });

    const evidence = await saveEvidenceRecord({
      id: 'evi_consent_01',
      legalEntityId: ENTITY_KSA,
      documentId: 'doc_consent_01',
      documentVersionId: docVer.id,
      evidenceType: 'CONSENT_TO_ACT',
      checksumSha256: checksum,
      verificationStatus: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, directorExecutorContext.userId);

    // Executor attempting self-verification must be REJECTED
    await assert.rejects(
      async () => {
        await CorporateSecretariatService.verifyCorporateActionExecution(
          actions.id,
          { evidenceRecordId: evidence.id },
          directorExecutorContext // Same as executor
        );
      },
      /Separation of Duties Violation: Executor \(usr_dir_exec_01\) is strictly prohibited from verifying their own corporate action execution/
    );

    // Independent Auditor verification must SUCCEED
    const verified = await CorporateSecretariatService.verifyCorporateActionExecution(
      actions.id,
      { evidenceRecordId: evidence.id, verificationNotes: 'Auditor verified Board Consent and Document SHA-256' },
      auditorVerifierContext // Independent verifier
    );

    assert.strictEqual(verified.status, 'COMPLETED');
    assert.strictEqual(verified.verifierUserId, auditorVerifierContext.userId);
    assert.ok(verified.governedSignoffSealSha256);
    assert.deepStrictEqual(verified.pinnedEvidenceDocumentVersionIds, [docVer.id]);
  });

  it('8. Tampered Evidence Checksum Mismatch Detection in Verification', async () => {
    const action = await CorporateSecretariatService.createCorporateAction({
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'Tamper Evidence Test Action',
      description: 'Tamper test',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: directorExecutorContext.userId,
      authorizedExecutorRole: 'DIRECTOR',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT'
    }, companySecretaryContext);

    await CorporateSecretariatService.executeCorporateAction(action.id, directorExecutorContext);

    // Save evidence with mismatched checksum
    const realChecksum = calculateSha256Checksum('Real Document Content');
    const fakeChecksum = calculateSha256Checksum('Fake Tampered Content');

    await createDocument({
      id: 'doc_tampered_01',
      ownerType: 'GOVERNANCE',
      ownerId: ENTITY_KSA,
      fileName: 'tampered.pdf',
      fileType: 'application/pdf',
      fileSize: 500,
      storagePath: '/docs/tampered.pdf',
      checksumSha256: realChecksum,
      uploadedBy: directorExecutorContext.userId
    });

    const tamperedDocVer = await createDocumentVersion('doc_tampered_01', {
      fileName: 'tampered.pdf',
      fileType: 'application/pdf',
      fileSize: 500,
      storagePath: '/docs/tampered.pdf',
      checksumSha256: realChecksum, // Document on disk has realChecksum
      uploadedBy: directorExecutorContext.userId
    });

    const evidence = await saveEvidenceRecord({
      id: 'evi_tampered_01',
      legalEntityId: ENTITY_KSA,
      documentId: 'doc_tampered_01',
      documentVersionId: tamperedDocVer.id,
      evidenceType: 'CONSENT_TO_ACT',
      checksumSha256: fakeChecksum, // Evidence record claims fakeChecksum
      verificationStatus: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, directorExecutorContext.userId);

    await assert.rejects(
      async () => {
        await CorporateSecretariatService.verifyCorporateActionExecution(
          action.id,
          { evidenceRecordId: evidence.id },
          auditorVerifierContext
        );
      },
      /Integrity Error: Cryptographic checksum mismatch on pinned evidence document version/
    );
  });

  it('9. Statutory Register Reconciliation Report & Discrepancy Tracking', async () => {
    const report = await CorporateSecretariatService.reconcileCorporateRegisters(
      ENTITY_KSA,
      'SA',
      auditorVerifierContext
    );

    assert.ok(report);
    assert.strictEqual(report.legalEntityId, ENTITY_KSA);
    assert.ok(report.totalActionsEvaluated > 0);
    assert.ok(report.reconciliationRecords.length > 0);

    const firstRec = report.reconciliationRecords[0];
    assert.match(firstRec.reconciliationNumber, /^REC-\d{4}-\d{4}$/);
    assert.ok(['MATCHED', 'INTERNAL_EXTERNAL_MISMATCH', 'DISCREPANCY_DETECTED', 'EVIDENCE_MISSING', 'PENDING_EXTERNAL_CONFIRMATION'].includes(firstRec.status));
  });

  it('10. Point-in-Time Action Replay and Pinned Rule Set Verification', async () => {
    const action = await CorporateSecretariatService.createCorporateAction({
      legalEntityId: ENTITY_KSA,
      jurisdiction: 'SA',
      actionType: 'DIRECTOR_APPOINTMENT',
      titleEn: 'Replay Test Action',
      description: 'Replay validation',
      sourceDecisionId: DECISION_ID,
      sourceResolutionId: RESOLUTION_ID,
      policyVersionId: POLICY_VER_ID,
      accountableOwnerUserId: directorExecutorContext.userId,
      accountableOwnerRole: 'DIRECTOR',
      authorizedExecutorUserId: directorExecutorContext.userId,
      authorizedExecutorRole: 'DIRECTOR',
      executionDueDate: '2026-12-31T23:59:59.000Z',
      targetDomain: 'ORGANIZATION_MASTER',
      targetResourceType: 'DIRECTOR_OFFICER_APPOINTMENT'
    }, companySecretaryContext);

    const replay = await CorporateSecretariatService.pointInTimeActionReplay(action.id, auditorVerifierContext);

    assert.strictEqual(replay.pinnedPolicyVersionId, POLICY_VER_ID);
    assert.strictEqual(replay.isRuleSetIntegrityValid, true);
    assert.strictEqual(replay.effectiveRulesAtExecution.requiresDecision, true);
  });

  it('11. Enforce Statutory Immutability (Prohibit Hard Deletions)', async () => {
    await assert.rejects(
      async () => {
        await deleteSecretariatInstructionProhibited('sec_test_01', 'usr_admin');
      },
      /Statutory Immutability Violation/
    );

    await assert.rejects(
      async () => {
        await deleteCorporateActionProhibited('ca_test_01', 'usr_admin');
      },
      /Statutory Immutability Violation/
    );
  });

  after(() => {
    // Clean exit
    setTimeout(() => process.exit(0), 100);
  });
});
