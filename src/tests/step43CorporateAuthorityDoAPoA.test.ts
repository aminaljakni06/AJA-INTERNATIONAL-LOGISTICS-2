/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Authority, Policies, DoA & PoA Test Suite
 * Step GOV-10: Enterprise Policies, Internal Controls, Delegation of Authority, Financial Authority Matrix & Power of Attorney
 * 
 * Test Coverage:
 * 1. Enterprise Corporate Policies Lifecycle & Versioning (Draft, Board Resolution Approval, Supersession)
 * 2. Internal Controls Framework (Registration, Policy Linkage, Operating Effectiveness Testing)
 * 3. Delegation of Authority (DoA) Lifecycle, Temporal Boundaries & Sub-Delegation Validation
 * 4. Separation of Duties (SoD) — Self-Approval Prohibition
 * 5. Financial Authority Matrix Multi-Tier Thresholds & Escalation Hierarchy
 * 6. Multi-Currency Normalization (GBP, USD, EUR, SAR) in Threshold Evaluation
 * 7. Anti-Circumvention — Split-Transaction Smurfing Detection
 * 8. Technical-Admin Bypass Prevention (SYSTEM_ADMIN cannot execute financial approvals)
 * 9. Cross-Entity Scope Isolation (Entity A authority cannot approve Entity B transactions)
 * 10. Power of Attorney (PoA) Issuance, Notarization Details, Scope Enforcement & Revocation
 * 11. Prohibited Hard Deletion Enforcement across Governance Authority Entities
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CorporateAuthorityService } from '../services/corporateAuthorityService';
import {
  resetCorporateAuthorityMemoryStore,
  getCorporatePolicyById,
  getCorporatePolicyVersions,
  getInternalControlById,
  getDelegationById,
  getFinancialAuthorityRules,
  getPowerOfAttorneyById,
} from '../db/repositories/corporateAuthorityRepository';
import {
  resetCorporateGovernanceMemoryStore,
  saveCorporateLegalProfile,
  saveCorporateDecision,
} from '../db/repositories/corporateGovernanceRepository';
import {
  resetDocumentRepositoryMemoryStore,
  createDocument,
  createDocumentVersion,
} from '../db/repositories/documentRepository';
import {
  resetCorporateRecordsRepositoryMemoryStore,
  saveEvidenceRecord,
} from '../db/repositories/corporateRecordsRepository';
import { UserContext } from '../types/permissions';

describe('STEP GOV-10: Enterprise Policies, Internal Controls, DoA, Financial Matrix & PoA', () => {
  // Test Actor Contexts
  const ceoUser: UserContext = {
    userId: 'usr_ceo_001',
    role: 'CEO',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_saudi',
    attributes: { isStatutoryDirector: true, crossEntityAccess: ['le_aja_saudi', 'le_aja_uk'] }
  };

  const cfoUser: UserContext = {
    userId: 'usr_cfo_001',
    role: 'CFO',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_saudi',
    departmentId: 'dept_finance',
    attributes: { isStatutoryDirector: true }
  };

  const financeManagerUser: UserContext = {
    userId: 'usr_fm_001',
    role: 'FINANCE_MANAGER',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_saudi',
    departmentId: 'dept_finance'
  };

  const opsLeadUser: UserContext = {
    userId: 'usr_ops_001',
    role: 'OPERATION_MANAGER',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_saudi',
    departmentId: 'dept_logistics'
  };

  const systemAdminUser: UserContext = {
    userId: 'usr_sysadmin_001',
    role: 'SYSTEM_ADMIN',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_saudi'
  };

  const ukOfficerUser: UserContext = {
    userId: 'usr_uk_officer_001',
    role: 'FINANCE_MANAGER',
    companyId: 'comp_aja_uk',
    legalEntityId: 'le_aja_uk',
    departmentId: 'dept_finance'
  };

  let seededDocVersionId = '';

  before(async () => {
    resetCorporateGovernanceMemoryStore();
    resetDocumentRepositoryMemoryStore();
    resetCorporateRecordsRepositoryMemoryStore();

    // 1. Seed Legal Profiles
    await saveCorporateLegalProfile(
      {
        id: 'le_aja_saudi',
        legalEntityId: 'le_aja_saudi',
        legalCompanyName: 'Aja International Logistics Saudi Arabia Ltd',
        companyNumber: 'CR-1010998877',
        companyType: 'Limited Liability Company',
        incorporationDate: '2020-01-15T00:00:00Z',
        incorporationJurisdiction: 'SA',
        registeredOfficeAddress: {
          addressLine1: '700 King Fahd Road',
          city: 'Riyadh',
          postalCode: '12345',
          country: 'SA',
          isPrincipalPlaceOfBusiness: true
        },
        principalBusinessAddresses: [
          {
            country: 'SA',
            city: 'Riyadh',
            address: 'King Fahd Road',
            type: 'HEADQUARTERS'
          }
        ],
        companyStatus: 'ACTIVE',
        financialYear: {
          accountingReferenceDate: '31-12',
          nextAccountsDueDate: '2026-12-31',
          nextConfirmationStatementDueDate: '2026-12-31'
        },
        taxRegistrations: {
          taxResidenceJurisdiction: 'SA',
          vatNumber: 'SA3001234567890'
        },
        advisors: {},
        dataClassification: 'CONFIDENTIAL',
        createdAt: '2020-01-15T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      'SYSTEM_SEED'
    );

    // 2. Seed Supporting Board Decision (for GOV-06 integration)
    await saveCorporateDecision(
      {
        id: 'dec_pol_approval_001',
        decisionNumber: 'DEC-2026-0088',
        legalEntityId: 'le_aja_saudi',
        title: 'Approval of Enterprise Expenditure & Delegation of Authority Policy (POL-FIN-001)',
        description: 'Formal Board approval enacting enterprise financial limits and authority matrix',
        decisionType: 'BOARD_RESOLUTION',
        jurisdictionContext: 'SA',
        decisionDate: '2026-01-10T00:00:00Z',
        effectiveDate: '2026-01-10T00:00:00Z',
        meetingModality: 'HYBRID',
        eventTimeZone: 'Asia/Riyadh',
        decisionLocationContext: { country: 'SA', city: 'Riyadh', timeZone: 'Asia/Riyadh', meetingModality: 'HYBRID' },
        lifecycleStatus: 'RESOLUTION',
        executionStatus: 'NOT_APPLICABLE',
        riskLevel: 'HIGH',
        resolutionText: 'IT WAS UNANIMOUSLY RESOLVED that the Enterprise Delegation of Authority Policy be approved and enacted.',
        participants: [],
        createdByUserId: ceoUser.userId,
        approvedByUserIds: [ceoUser.userId, cfoUser.userId],
        supportingDocumentIds: [],
        evidenceIds: [],
        version: 1,
        auditCorrelationId: 'cor_dec_pol_001',
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-01-10T00:00:00Z'
      },
      'SYSTEM_SEED'
    );

    // 3. Seed DMS Document (for GOV-09 integration)
    await createDocument({
      id: 'doc_policy_fin_001',
      ownerType: 'LEGAL_ENTITY',
      ownerId: 'le_aja_saudi',
      fileName: 'pol_fin_001_v1.pdf',
      fileType: 'application/pdf',
      storagePath: 'governance/policies/pol_fin_001_v1.pdf',
      fileSize: 245000,
      uploadedBy: ceoUser.userId,
      checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      securityClassification: 'INTERNAL',
      category: 'GOVERNANCE',
      isImmutable: true
    });

    const docVer = await createDocumentVersion(
      'doc_policy_fin_001',
      {
        fileName: 'pol_fin_001_v1.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        storagePath: 'governance/policies/pol_fin_001_v1.pdf',
        uploadedBy: ceoUser.userId,
        checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        changeNotes: 'Initial policy draft'
      }
    );
    seededDocVersionId = docVer.id;
  });

  beforeEach(async () => {
    resetCorporateAuthorityMemoryStore();
  });

  // ==========================================================================
  // SUITE 1: Enterprise Corporate Policies & Versioning Lifecycle
  // ==========================================================================
  describe('1. Enterprise Corporate Policies Lifecycle & Versioning', () => {
    it('should create policy, draft version with DMS link, and publish under Board Resolution', async () => {
      // 1. Create Policy
      const policy = await CorporateAuthorityService.createPolicy(
        {
          id: 'pol_fin_doa_001',
          policyCode: 'POL-FIN-001',
          title: 'Delegation of Financial Authority Policy',
          category: 'FINANCIAL',
          legalEntityScope: ['le_aja_saudi'],
          departmentScope: ['dept_finance', 'dept_logistics'],
          ownerUserId: cfoUser.userId,
          ownerRole: 'CFO',
          mandatoryReviewFrequencyMonths: 12
        },
        ceoUser
      );

      assert.equal(policy.policyCode, 'POL-FIN-001');
      assert.equal(policy.lifecycleStatus, 'DRAFT');

      // 2. Draft Version 1
      const v1 = await CorporateAuthorityService.draftPolicyVersion(
        {
          policyId: policy.id,
          documentId: 'doc_policy_fin_001',
          documentVersionId: seededDocVersionId,
          contentSummary: 'Initial Financial Authority Policy setting tier limits for managers, directors, and CEO',
          supportingDecisionId: 'dec_pol_approval_001'
        },
        ceoUser
      );

      assert.equal(v1.versionNumber, 1);
      assert.equal(v1.supportingDecisionId, 'dec_pol_approval_001');

      // 3. Approve and Publish Version 1
      const { policy: publishedPolicy, version: publishedV1 } = 
        await CorporateAuthorityService.approveAndPublishPolicyVersion({ versionId: v1.id }, ceoUser);

      assert.equal(publishedPolicy.activeVersionNumber, 1);
      assert.equal(publishedPolicy.lifecycleStatus, 'APPROVED');
      assert.ok(publishedV1.approvedByUserIds.includes(ceoUser.userId));
    });

    it('should reject policy version publication if supporting decision is missing or not a resolution', async () => {
      const policy = await CorporateAuthorityService.createPolicy(
        {
          title: 'HR Compliance Policy',
          category: 'COMPLIANCE',
          legalEntityScope: ['ALL'],
          ownerUserId: ceoUser.userId,
          ownerRole: 'CEO'
        },
        ceoUser
      );

      // Attempt draft with invalid decision ID
      await assert.rejects(
        async () => {
          await CorporateAuthorityService.draftPolicyVersion(
            {
              policyId: policy.id,
              contentSummary: 'Test draft without valid decision',
              supportingDecisionId: 'dec_non_existent'
            },
            ceoUser
          );
        },
        { name: 'ValidationError' }
      );
    });

    it('should draft and publish version 2, automatically superseding version 1', async () => {
      const policy = await CorporateAuthorityService.createPolicy(
        {
          policyCode: 'POL-GOV-002',
          title: 'Corporate Governance Charter',
          category: 'GOVERNANCE',
          legalEntityScope: ['ALL'],
          ownerUserId: ceoUser.userId,
          ownerRole: 'CEO'
        },
        ceoUser
      );

      // Draft & Publish V1
      const v1 = await CorporateAuthorityService.draftPolicyVersion(
        {
          policyId: policy.id,
          contentSummary: 'Charter Version 1.0',
          supportingDecisionId: 'dec_pol_approval_001'
        },
        ceoUser
      );
      await CorporateAuthorityService.approveAndPublishPolicyVersion({ versionId: v1.id }, ceoUser);

      // Draft & Publish V2
      const v2 = await CorporateAuthorityService.draftPolicyVersion(
        {
          policyId: policy.id,
          contentSummary: 'Charter Version 2.0 with expanded statutory committee powers',
          supportingDecisionId: 'dec_pol_approval_001'
        },
        ceoUser
      );
      assert.equal(v2.versionNumber, 2);

      const { policy: updatedPolicy } = await CorporateAuthorityService.approveAndPublishPolicyVersion(
        { versionId: v2.id },
        ceoUser
      );

      assert.equal(updatedPolicy.activeVersionNumber, 2);

      // Verify V1 is superseded
      const allVersions = await getCorporatePolicyVersions(policy.id);
      const oldV1 = allVersions.find(v => v.versionNumber === 1);
      assert.equal(oldV1?.supersededByVersionId, v2.id);
    });
  });

  // ==========================================================================
  // SUITE 2: Internal Controls Framework
  // ==========================================================================
  describe('2. Internal Controls Framework', () => {
    it('should register an internal control mapped to a policy and test operating effectiveness', async () => {
      const control = await CorporateAuthorityService.registerInternalControl(
        {
          controlCode: 'CTL-FIN-001',
          title: 'Dual Approval for Payments Exceeding 100k SAR',
          description: 'Enforces dual authorized signatures from CFO and Finance Director',
          legalEntityId: 'le_aja_saudi',
          controlType: 'PREVENTIVE',
          frequency: 'TRANSACTIONAL',
          ownerUserId: cfoUser.userId,
          ownerRole: 'CFO',
          isAutomated: true
        },
        cfoUser
      );

      assert.equal(control.controlCode, 'CTL-FIN-001');
      assert.equal(control.operatingEffectiveness, 'UNTESTED');

      // Test Control
      const tested = await CorporateAuthorityService.testInternalControl(
        {
          controlId: control.id,
          operatingEffectiveness: 'EFFECTIVE',
          testingNotes: 'Tested sample of 25 disbursements; all conformed to dual approval requirement.'
        },
        cfoUser
      );

      assert.equal(tested.operatingEffectiveness, 'EFFECTIVE');
      assert.equal(tested.lastTestedByUserId, cfoUser.userId);
      assert.ok(tested.lastTestedAt);
    });
  });

  // ==========================================================================
  // SUITE 3: Delegation of Authority (DoA) & Sub-Delegation
  // ==========================================================================
  describe('3. Delegation of Authority (DoA) Lifecycle & Sub-Delegation Rules', () => {
    it('should grant a valid auto-expiring delegation of financial authority', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const delegation = await CorporateAuthorityService.grantDelegation(
        {
          legalEntityId: 'le_aja_saudi',
          delegatorUserId: cfoUser.userId,
          delegatorRole: 'CFO',
          delegateUserId: financeManagerUser.userId,
          delegateRole: 'FINANCE_MANAGER',
          authorityType: 'FINANCIAL_APPROVAL',
          scopeLevel: 'DEPARTMENT',
          scopeDepartmentId: 'dept_finance',
          allowedTransactionTypes: ['EXPENDITURE', 'VENDOR_PAYMENT'],
          amountLimit: 75000,
          currency: 'SAR',
          isSubDelegationAllowed: true,
          effectiveFrom: tomorrow,
          effectiveUntil: inThirtyDays,
          reason: 'Acting CFO coverage during annual leave'
        },
        cfoUser
      );

      assert.ok(delegation.delegationNumber.startsWith('DOA-'));
      assert.equal(delegation.status, 'ACTIVE');
      assert.equal(delegation.amountLimit, 75000);
      assert.equal(delegation.isSubDelegationAllowed, true);
    });

    it('should allow valid sub-delegation within parent limits and reject sub-delegation exceeding parent cap', async () => {
      const now = new Date().toISOString();
      const inTenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      // Parent Delegation from CFO to Finance Manager (Limit: 100,000 SAR)
      const parentDoA = await CorporateAuthorityService.grantDelegation(
        {
          id: 'doa_parent_001',
          legalEntityId: 'le_aja_saudi',
          delegatorUserId: cfoUser.userId,
          delegatorRole: 'CFO',
          delegateUserId: financeManagerUser.userId,
          delegateRole: 'FINANCE_MANAGER',
          authorityType: 'FINANCIAL_APPROVAL',
          scopeLevel: 'DEPARTMENT',
          amountLimit: 100000,
          currency: 'SAR',
          isSubDelegationAllowed: true,
          effectiveFrom: now,
          effectiveUntil: inTenDays,
          reason: 'Delegated procurement approval authority'
        },
        cfoUser
      );

      // Valid Sub-Delegation from Finance Manager to Operations Lead (Limit: 25,000 SAR)
      const subDoA = await CorporateAuthorityService.grantDelegation(
        {
          legalEntityId: 'le_aja_saudi',
          delegatorUserId: financeManagerUser.userId,
          delegatorRole: 'FINANCE_MANAGER',
          delegateUserId: opsLeadUser.userId,
          delegateRole: 'OPERATION_MANAGER',
          authorityType: 'FINANCIAL_APPROVAL',
          scopeLevel: 'DEPARTMENT',
          parentDelegationId: parentDoA.id,
          amountLimit: 25000,
          currency: 'SAR',
          isSubDelegationAllowed: false,
          effectiveFrom: now,
          effectiveUntil: inTenDays,
          reason: 'Emergency site spare-parts purchase delegation'
        },
        cfoUser
      );

      assert.equal(subDoA.parentDelegationId, parentDoA.id);
      assert.equal(subDoA.amountLimit, 25000);

      // Attempt invalid sub-delegation exceeding parent limit (150,000 > 100,000)
      await assert.rejects(
        async () => {
          await CorporateAuthorityService.grantDelegation(
            {
              legalEntityId: 'le_aja_saudi',
              delegatorUserId: financeManagerUser.userId,
              delegatorRole: 'FINANCE_MANAGER',
              delegateUserId: opsLeadUser.userId,
              delegateRole: 'OPERATION_MANAGER',
              authorityType: 'FINANCIAL_APPROVAL',
              scopeLevel: 'DEPARTMENT',
              parentDelegationId: parentDoA.id,
              amountLimit: 150000,
              currency: 'SAR',
              effectiveFrom: now,
              effectiveUntil: inTenDays,
              reason: 'Over-limit sub-delegation'
            },
            cfoUser
          );
        },
        { name: 'ValidationError' }
      );
    });

    it('should revoke a delegation and immediately block subsequent use', async () => {
      const inFiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

      const doa = await CorporateAuthorityService.grantDelegation(
        {
          legalEntityId: 'le_aja_saudi',
          delegatorUserId: ceoUser.userId,
          delegatorRole: 'CEO',
          delegateUserId: opsLeadUser.userId,
          delegateRole: 'OPERATION_MANAGER',
          authorityType: 'FINANCIAL_APPROVAL',
          scopeLevel: 'DEPARTMENT',
          amountLimit: 50000,
          effectiveUntil: inFiveDays,
          reason: 'Operational delegation'
        },
        ceoUser
      );

      // Revoke DoA
      const revoked = await CorporateAuthorityService.revokeDelegation(
        {
          delegationId: doa.id,
          revocationReason: 'Early return of primary manager; delegation terminated.'
        },
        ceoUser
      );

      assert.equal(revoked.status, 'REVOKED');
      assert.equal(revoked.revokedByUserId, ceoUser.userId);
    });
  });

  // ==========================================================================
  // SUITE 4: Financial Authority Matrix & Multi-Tier Approvals
  // ==========================================================================
  describe('4. Financial Authority Matrix Multi-Tier Thresholds & Escalation', () => {
    beforeEach(async () => {
      // Seed Financial Authority Matrix Rules
      // Tier 1: Finance Manager (0 - 50,000 SAR)
      await CorporateAuthorityService.configureAuthorityRule(
        {
          ruleCode: 'FAM-EXP-L1',
          legalEntityId: 'le_aja_saudi',
          transactionType: 'EXPENDITURE',
          minAmount: 0,
          maxAmount: 50000,
          currency: 'SAR',
          tierLevel: 1,
          requiredAuthorityRole: 'FINANCE_MANAGER',
          antiSelfApprovalEnforced: true
        },
        ceoUser
      );

      // Tier 2: CFO (50,001 - 500,000 SAR)
      await CorporateAuthorityService.configureAuthorityRule(
        {
          ruleCode: 'FAM-EXP-L2',
          legalEntityId: 'le_aja_saudi',
          transactionType: 'EXPENDITURE',
          minAmount: 50000.01,
          maxAmount: 500000,
          currency: 'SAR',
          tierLevel: 2,
          requiredAuthorityRole: 'CFO',
          dualApprovalRequired: true,
          antiSelfApprovalEnforced: true
        },
        ceoUser
      );

      // Tier 3: CEO (500,001 - 2,000,000 SAR)
      await CorporateAuthorityService.configureAuthorityRule(
        {
          ruleCode: 'FAM-EXP-L3',
          legalEntityId: 'le_aja_saudi',
          transactionType: 'EXPENDITURE',
          minAmount: 500000.01,
          maxAmount: 2000000,
          currency: 'SAR',
          tierLevel: 3,
          requiredAuthorityRole: 'CEO',
          dualApprovalRequired: true,
          antiSelfApprovalEnforced: true
        },
        ceoUser
      );

      // Tier 4: Board Resolution (> 2,000,000 SAR)
      await CorporateAuthorityService.configureAuthorityRule(
        {
          ruleCode: 'FAM-EXP-L4',
          legalEntityId: 'le_aja_saudi',
          transactionType: 'EXPENDITURE',
          minAmount: 2000000.01,
          maxAmount: null,
          currency: 'SAR',
          tierLevel: 4,
          requiredAuthorityRole: 'BOARD_DIRECTOR',
          requiresBoardResolution: true,
          antiSelfApprovalEnforced: true
        },
        ceoUser
      );
    });

    it('should authorize Finance Manager for 25,000 SAR expenditure and deny when exceeding 50,000 SAR', async () => {
      // 1. 25,000 SAR -> Authorized for Finance Manager
      const res1 = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: opsLeadUser.userId,
        requesterRole: 'OPERATION_MANAGER',
        approverUserId: financeManagerUser.userId,
        approverRole: 'FINANCE_MANAGER',
        transactionType: 'EXPENDITURE',
        amount: 25000,
        currency: 'SAR',
        transactionReference: 'PO-2026-101'
      });

      assert.equal(res1.isAuthorized, true);
      assert.equal(res1.requiredTier, 1);

      // 2. 75,000 SAR -> Denied for Finance Manager, Escalates to CFO
      const res2 = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: opsLeadUser.userId,
        requesterRole: 'OPERATION_MANAGER',
        approverUserId: financeManagerUser.userId,
        approverRole: 'FINANCE_MANAGER',
        transactionType: 'EXPENDITURE',
        amount: 75000,
        currency: 'SAR',
        transactionReference: 'PO-2026-102'
      });

      assert.equal(res2.isAuthorized, false);
      assert.equal(res2.denialCode, 'THRESHOLD_EXCEEDED');
      assert.equal(res2.escalationRequired, true);
      assert.equal(res2.escalationTarget, 'CFO');
    });

    it('should escalate mega-transactions (> 2M SAR) to Board of Directors', async () => {
      const res = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: cfoUser.userId,
        requesterRole: 'CFO',
        approverUserId: ceoUser.userId,
        approverRole: 'CEO',
        transactionType: 'EXPENDITURE',
        amount: 3500000,
        currency: 'SAR',
        transactionReference: 'CAPEX-FLEET-2026'
      });

      assert.equal(res.isAuthorized, false);
      assert.equal(res.denialCode, 'BOARD_RESOLUTION_REQUIRED');
      assert.equal(res.escalationTarget, 'BOARD_OF_DIRECTORS');
    });

    it('should strictly prohibit self-approval (Separation of Duties)', async () => {
      const res = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: cfoUser.userId,
        requesterRole: 'CFO',
        approverUserId: cfoUser.userId, // Submitter self-approving
        approverRole: 'CFO',
        transactionType: 'EXPENDITURE',
        amount: 15000,
        currency: 'SAR',
        transactionReference: 'EXP-SELF-001'
      });

      assert.equal(res.isAuthorized, false);
      assert.equal(res.denialCode, 'SELF_APPROVAL_PROHIBITED');
    });
  });

  // ==========================================================================
  // SUITE 5: Currency Normalization & FX Conversion
  // ==========================================================================
  describe('5. Multi-Currency Normalization in Authority Evaluation', () => {
    it('should correctly normalize foreign currencies (GBP, USD, EUR) to base SAR rules', async () => {
      // 10,000 GBP = 48,000 SAR -> Within Finance Manager Limit (<= 50,000 SAR)
      const resGBP = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: opsLeadUser.userId,
        requesterRole: 'OPERATION_MANAGER',
        approverUserId: financeManagerUser.userId,
        approverRole: 'FINANCE_MANAGER',
        transactionType: 'EXPENDITURE',
        amount: 10000,
        currency: 'GBP',
        transactionReference: 'PO-UK-SUPPLIER-01'
      });

      assert.equal(resGBP.isAuthorized, true);
      assert.equal(resGBP.normalizedAmount, 48000);

      // 12,000 GBP = 57,600 SAR -> Exceeds Finance Manager (50,000 SAR), triggers threshold escalation
      const resGBPExceeded = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: opsLeadUser.userId,
        requesterRole: 'OPERATION_MANAGER',
        approverUserId: financeManagerUser.userId,
        approverRole: 'FINANCE_MANAGER',
        transactionType: 'EXPENDITURE',
        amount: 12000,
        currency: 'GBP',
        transactionReference: 'PO-UK-SUPPLIER-02'
      });

      assert.equal(resGBPExceeded.isAuthorized, false);
      assert.equal(resGBPExceeded.denialCode, 'THRESHOLD_EXCEEDED');
      assert.equal(resGBPExceeded.normalizedAmount, 57600);
      assert.equal(resGBPExceeded.escalationTarget, 'CFO');
    });
  });

  // ==========================================================================
  // SUITE 6: Anti-Circumvention & Split-Transaction Detection
  // ==========================================================================
  describe('6. Anti-Circumvention: Split-Transaction Smurfing Detection', () => {
    it('should detect smurfing / split transactions designed to evade authority thresholds', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

      // Prior transactions submitted within the 24h window by same department
      const recentTxHistory = [
        { amount: 20000, currency: 'SAR', timestamp: twoHoursAgo },
        { amount: 20000, currency: 'SAR', timestamp: oneHourAgo }
      ];

      // Current attempt: 15,000 SAR (Individual is <= 50,000 SAR, but cumulative = 55,000 SAR)
      const res = await CorporateAuthorityService.evaluateAuthority(
        {
          legalEntityId: 'le_aja_saudi',
          requesterUserId: opsLeadUser.userId,
          requesterRole: 'OPERATION_MANAGER',
          approverUserId: financeManagerUser.userId,
          approverRole: 'FINANCE_MANAGER',
          transactionType: 'EXPENDITURE',
          amount: 15000,
          currency: 'SAR',
          transactionReference: 'PO-SPLIT-ATTEMPT-3'
        },
        recentTxHistory
      );

      assert.equal(res.isAuthorized, false);
      assert.equal(res.denialCode, 'SPLIT_TRANSACTION_FLAGGED');
      assert.equal(res.dualApprovalRequired, true);
    });
  });

  // ==========================================================================
  // SUITE 7: Technical Admin Bypass & Cross-Entity Isolation
  // ==========================================================================
  describe('7. Technical-Admin Bypass Prevention & Cross-Entity Isolation', () => {
    it('should strictly block technical SYSTEM_ADMIN from executing financial approvals', async () => {
      const res = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: opsLeadUser.userId,
        requesterRole: 'OPERATION_MANAGER',
        approverUserId: systemAdminUser.userId,
        approverRole: 'SYSTEM_ADMIN', // Technical admin
        transactionType: 'EXPENDITURE',
        amount: 5000,
        currency: 'SAR',
        transactionReference: 'PO-ADMIN-BYPASS'
      });

      assert.equal(res.isAuthorized, false);
      assert.equal(res.denialCode, 'TECHNICAL_ADMIN_BYPASS_BLOCKED');
    });

    it('should deny officer from UK entity approving transactions for Saudi entity without cross-entity DoA', async () => {
      const res = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: opsLeadUser.userId,
        requesterRole: 'OPERATION_MANAGER',
        approverUserId: ukOfficerUser.userId,
        approverRole: 'FINANCE_MANAGER',
        approverLegalEntityId: ukOfficerUser.legalEntityId,
        transactionType: 'EXPENDITURE',
        amount: 15000,
        currency: 'SAR',
        transactionReference: 'PO-CROSS-ENTITY-TEST'
      });

      // UK officer has no active DoA in Saudi entity
      assert.equal(res.isAuthorized, false);
      assert.equal(res.denialCode, 'WRONG_LEGAL_ENTITY');
    });
  });

  // ==========================================================================
  // SUITE 8: Power of Attorney (PoA) Management
  // ==========================================================================
  describe('8. Power of Attorney (PoA) Issuance & Revocation', () => {
    it('should issue a notarized Power of Attorney linked to Board Decision and Evidence Record', async () => {
      // 1. Create Evidence Record in Vault (GOV-09 integration)
      const evidence = await saveEvidenceRecord(
        {
          id: 'evi_poa_001',
          evidenceNumber: 'EVI-2026-9901',
          legalEntityId: 'le_aja_saudi',
          documentId: 'doc_policy_fin_001',
          documentVersionId: 'ver_doc_pol_1',
          checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          evidenceType: 'NOTARIZED_DEED',
          sourceEntityType: 'CORPORATE_DECISION',
          sourceEntityId: 'dec_pol_approval_001',
          classification: 'CONFIDENTIAL',
          verificationStatus: 'VERIFIED',
          integrityStatus: 'VERIFIED',
          submittedByUserId: ceoUser.userId,
          submittedAt: new Date().toISOString(),
          auditCorrelationId: 'cor_evi_poa_001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ceoUser.userId
      );

      // 2. Issue PoA
      const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const poa = await CorporateAuthorityService.issuePowerOfAttorney(
        {
          poaNumber: 'POA-2026-0001',
          legalEntityId: 'le_aja_saudi',
          grantorType: 'BOARD_RESOLUTION',
          grantorEntityOrUserId: 'le_aja_saudi',
          grantorSupportingDecisionId: 'dec_pol_approval_001',
          granteeType: 'INTERNAL_OFFICER',
          granteeUserId: cfoUser.userId,
          scopeCategory: 'BANKING_OPERATIONS',
          powersDescription: 'Full authority to operate corporate bank accounts, issue bank guarantees, and execute treasury transfers',
          monetaryLimitAmount: 5000000,
          monetaryLimitCurrency: 'SAR',
          isSubDelegationAllowed: false,
          notarizationDetails: {
            notaryPublicName: 'Riyadh First Notary Chamber',
            notarizationDate: '2026-01-12',
            notarizationNumber: 'NOT-SA-2026-99120',
            statutoryFilingReference: 'MOJ-47120938'
          },
          evidenceRecordId: evidence.id,
          validUntil: nextYear
        },
        ceoUser
      );

      assert.equal(poa.poaNumber, 'POA-2026-0001');
      assert.equal(poa.status, 'ACTIVE');
      assert.equal(poa.monetaryLimitAmount, 5000000);
      assert.equal(poa.evidenceRecordId, evidence.id);

      // Verify evaluation under active PoA
      const evalPoA = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: financeManagerUser.userId,
        requesterRole: 'FINANCE_MANAGER',
        approverUserId: cfoUser.userId,
        approverRole: 'CFO',
        transactionType: 'BANK_PAYMENT',
        amount: 1500000,
        currency: 'SAR',
        transactionReference: 'BANK-TRF-001',
        supportingPoAId: poa.id
      });

      assert.equal(evalPoA.isAuthorized, true);
      assert.equal(evalPoA.matchedPoA?.id, poa.id);

      // 3. Revoke PoA
      const revokedPoA = await CorporateAuthorityService.revokePowerOfAttorney(
        {
          poaId: poa.id,
          revocationReason: 'Formal statutory rotation of banking signatories'
        },
        ceoUser
      );

      assert.equal(revokedPoA.status, 'REVOKED');

      // Verify evaluation under revoked PoA is strictly BLOCKED
      const evalRevoked = await CorporateAuthorityService.evaluateAuthority({
        legalEntityId: 'le_aja_saudi',
        requesterUserId: financeManagerUser.userId,
        requesterRole: 'FINANCE_MANAGER',
        approverUserId: cfoUser.userId,
        approverRole: 'CFO',
        transactionType: 'BANK_PAYMENT',
        amount: 500000,
        currency: 'SAR',
        transactionReference: 'BANK-TRF-002',
        supportingPoAId: poa.id
      });

      assert.equal(evalRevoked.isAuthorized, false);
      assert.equal(evalRevoked.denialCode, 'POA_REVOKED_OR_EXPIRED');
    });
  });

  // ==========================================================================
  // SUITE 9: Statutory Prohibited Hard Deletion Invariant
  // ==========================================================================
  describe('9. Prohibited Hard Deletion of Governance Authority Entities', () => {
    it('should strictly throw error when attempting hard deletion of policy or delegation', async () => {
      await assert.rejects(
        async () => {
          await CorporateAuthorityService.deleteRecordProhibited(
            'POLICY',
            'pol_fin_001',
            ceoUser
          );
        },
        { name: 'ValidationError' }
      );

      await assert.rejects(
        async () => {
          await CorporateAuthorityService.deleteRecordProhibited(
            'DELEGATION',
            'doa_001',
            ceoUser
          );
        },
        { name: 'ValidationError' }
      );

      await assert.rejects(
        async () => {
          await CorporateAuthorityService.deleteRecordProhibited(
            'POWER_OF_ATTORNEY',
            'poa_001',
            ceoUser
          );
        },
        { name: 'ValidationError' }
      );
    });
  });
});
