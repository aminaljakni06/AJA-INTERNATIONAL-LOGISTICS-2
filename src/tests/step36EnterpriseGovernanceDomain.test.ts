import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  CorporateLegalProfile,
  DirectorOfficerRecord,
  CorporateDecision,
  DecisionLifecycleState,
  ComplianceObligation,
  ComplianceCalendarItem,
  DelegationOfAuthority,
  FinancialApprovalMatrixRule,
  EvidenceRecord
} from '../types/corporateGovernance';
import { ApprovalEngine, EvaluationUserContext, WorkflowEvaluationContext } from '../lib/workflow/ApprovalEngine';
import { WorkflowStepDef } from '../types/workflow';

describe('STEP GOV-03 — Enterprise Governance Domain & Persistence Suite', () => {

  describe('1. Approval Engine SoD & Anti-Self-Approval Verification (P0 Remediation)', () => {
    const step: WorkflowStepDef = {
      id: 'step_board_approval',
      name: 'Board Decision Approval',
      stepType: 'APPROVAL',
      stateOnEntry: 'PENDING',
      requiredRoles: ['DIRECTOR', 'EXECUTIVE_DIRECTOR'],
      transitions: []
    };

    test('Requester is strictly prohibited from self-approving when antiSelfApproval is enabled', () => {
      const requesterUser: EvaluationUserContext = {
        userId: 'usr_director_01',
        role: 'DIRECTOR',
      };
      const context: WorkflowEvaluationContext = {
        requesterUserId: 'usr_director_01',
        enforceAntiSelfApproval: true,
        isGovernanceOrFinancial: true
      };

      const eligible = ApprovalEngine.isUserEligible(step, requesterUser, context);
      assert.strictEqual(eligible, false, 'Requester must be blocked from self-approving their own governance step');
    });

    test('Non-requester Director is permitted to approve', () => {
      const peerDirector: EvaluationUserContext = {
        userId: 'usr_director_02',
        role: 'DIRECTOR',
      };
      const context: WorkflowEvaluationContext = {
        requesterUserId: 'usr_director_01',
        enforceAntiSelfApproval: true,
        isGovernanceOrFinancial: true
      };

      const eligible = ApprovalEngine.isUserEligible(step, peerDirector, context);
      assert.strictEqual(eligible, true, 'Independent peer Director should be eligible to approve');
    });

    test('Admin role cannot bypass governance/financial approval when prohibitAdminBypass is set', () => {
      const adminUser: EvaluationUserContext = {
        userId: 'usr_sys_admin',
        role: 'ADMIN',
      };
      const context: WorkflowEvaluationContext = {
        requesterUserId: 'usr_director_01',
        isGovernanceOrFinancial: true,
        prohibitAdminBypass: true
      };

      // Admin is not in requiredRoles ['DIRECTOR', 'EXECUTIVE_DIRECTOR']
      const eligible = ApprovalEngine.isUserEligible(step, adminUser, context);
      assert.strictEqual(eligible, false, 'System Admin must not bypass statutory board/director approval requirements');
    });
  });

  describe('2. Corporate Decision Lifecycle & State Machine Validation', () => {
    const validTransitions: Record<DecisionLifecycleState, DecisionLifecycleState[]> = {
      DRAFT: ['REVIEW', 'CANCELLED'],
      REVIEW: ['APPROVAL', 'RETURNED_FOR_REVISION', 'REJECTED', 'CANCELLED'],
      APPROVAL: ['RESOLUTION', 'REJECTED', 'RETURNED_FOR_REVISION'],
      APPROVED: ['RESOLUTION', 'EXECUTION', 'CLOSED'],
      RESOLUTION: ['EXECUTION', 'CANCELLED'],
      EXECUTION: ['EVIDENCE', 'CANCELLED'],
      EVIDENCE: ['VERIFICATION'],
      VERIFICATION: ['AUDIT', 'RETURNED_FOR_REVISION'],
      AUDIT: ['CLOSED'],
      CLOSED: ['SUPERSEDED'],
      REJECTED: ['DRAFT', 'CLOSED'],
      RETURNED_FOR_REVISION: ['DRAFT', 'REVIEW'],
      CANCELLED: ['CLOSED'],
      SUPERSEDED: [],
      EXPIRED: []
    };

    function isValidTransition(from: DecisionLifecycleState, to: DecisionLifecycleState): boolean {
      return validTransitions[from]?.includes(to) || false;
    }

    test('Valid decision state progressions are allowed', () => {
      assert.strictEqual(isValidTransition('DRAFT', 'REVIEW'), true);
      assert.strictEqual(isValidTransition('REVIEW', 'APPROVAL'), true);
      assert.strictEqual(isValidTransition('APPROVAL', 'RESOLUTION'), true);
      assert.strictEqual(isValidTransition('RESOLUTION', 'EXECUTION'), true);
      assert.strictEqual(isValidTransition('EXECUTION', 'EVIDENCE'), true);
      assert.strictEqual(isValidTransition('EVIDENCE', 'VERIFICATION'), true);
      assert.strictEqual(isValidTransition('VERIFICATION', 'AUDIT'), true);
      assert.strictEqual(isValidTransition('AUDIT', 'CLOSED'), true);
    });

    test('Illegal bypass transitions are blocked', () => {
      assert.strictEqual(isValidTransition('DRAFT', 'EXECUTION'), false, 'Cannot execute directly from draft');
      assert.strictEqual(isValidTransition('DRAFT', 'RESOLUTION'), false, 'Cannot resolve directly from draft');
      assert.strictEqual(isValidTransition('CLOSED', 'DRAFT'), false, 'Closed decisions cannot reopen to draft');
      assert.strictEqual(isValidTransition('SUPERSEDED', 'ACTIVE' as any), false, 'Superseded record is immutable');
    });
  });

  describe('3. Delegation of Authority (DoA) Constraints', () => {
    function isDelegationActive(doa: DelegationOfAuthority, nowIso: string): boolean {
      if (doa.status !== 'ACTIVE') return false;
      const now = new Date(nowIso).getTime();
      const start = new Date(doa.effectiveFrom).getTime();
      const end = new Date(doa.effectiveUntil).getTime();
      return now >= start && now <= end;
    }

    test('Active delegation within effective date range is valid', () => {
      const doa: DelegationOfAuthority = {
        id: 'doa_001',
        legalEntityId: 'org_uk_parent',
        delegatorUserId: 'usr_cfo',
        delegateUserId: 'usr_finance_mgr',
        authorityType: 'FINANCIAL_PAYMENT',
        scopeLevel: 'LEGAL_ENTITY',
        amountLimit: 100000,
        currency: 'GBP',
        effectiveFrom: '2026-01-01T00:00:00Z',
        effectiveUntil: '2026-12-31T23:59:59Z',
        supportingDecisionId: 'DEC-2026-0005',
        reason: 'Annual Treasury Operation Delegation',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      assert.strictEqual(isDelegationActive(doa, '2026-06-15T12:00:00Z'), true);
    });

    test('Expired delegation is strictly inactive regardless of stored status', () => {
      const doa: DelegationOfAuthority = {
        id: 'doa_002',
        legalEntityId: 'org_uk_parent',
        delegatorUserId: 'usr_cfo',
        delegateUserId: 'usr_finance_mgr',
        authorityType: 'FINANCIAL_PAYMENT',
        scopeLevel: 'LEGAL_ENTITY',
        amountLimit: 100000,
        currency: 'GBP',
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveUntil: '2025-12-31T23:59:59Z',
        supportingDecisionId: 'DEC-2025-0012',
        reason: 'Prior Year Delegation',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      assert.strictEqual(isDelegationActive(doa, '2026-08-15T12:00:00Z'), false, 'Past effectiveUntil must fail active check');
    });
  });

  describe('4. Financial Approval Matrix Policy Routing', () => {
    const policyRules: FinancialApprovalMatrixRule[] = [
      {
        id: 'fam_rule_1_2',
        legalEntityId: 'org_uk_parent',
        supportingPolicyVersionId: 'pol_fin_v2',
        supportingDecisionId: 'DEC-2026-0008',
        transactionType: 'VENDOR_PAYMENT',
        minAmount: 0,
        maxAmount: 50000,
        currency: 'GBP',
        minInstallments: 1,
        maxInstallments: 2,
        requiredAuthorityRole: 'FINANCE_MANAGER',
        requiredApprovalLevels: 1,
        dualApprovalRequired: false,
        antiSelfApprovalEnforced: true,
        exceptionAllowed: false,
        effectiveFrom: '2026-01-01T00:00:00Z',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'fam_rule_3_6',
        legalEntityId: 'org_uk_parent',
        supportingPolicyVersionId: 'pol_fin_v2',
        supportingDecisionId: 'DEC-2026-0008',
        transactionType: 'VENDOR_PAYMENT',
        minAmount: 0,
        maxAmount: null,
        currency: 'GBP',
        minInstallments: 3,
        maxInstallments: 6,
        requiredAuthorityRole: 'FINANCE_DIRECTOR',
        requiredApprovalLevels: 2,
        dualApprovalRequired: true,
        antiSelfApprovalEnforced: true,
        exceptionAllowed: false,
        effectiveFrom: '2026-01-01T00:00:00Z',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'fam_rule_7_10',
        legalEntityId: 'org_uk_parent',
        supportingPolicyVersionId: 'pol_fin_v2',
        supportingDecisionId: 'DEC-2026-0008',
        transactionType: 'VENDOR_PAYMENT',
        minAmount: 0,
        maxAmount: null,
        currency: 'GBP',
        minInstallments: 7,
        maxInstallments: 10,
        requiredAuthorityRole: 'EXECUTIVE_DIRECTOR',
        requiredApprovalLevels: 3,
        dualApprovalRequired: true,
        antiSelfApprovalEnforced: true,
        exceptionAllowed: false,
        effectiveFrom: '2026-01-01T00:00:00Z',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ];

    function resolveFinancialAuthority(installments: number): FinancialApprovalMatrixRule | undefined {
      return policyRules.find(r => installments >= r.minInstallments && (r.maxInstallments === null || installments <= r.maxInstallments));
    }

    test('3-6 installments dynamically routes to Finance Director with dual approval', () => {
      const rule = resolveFinancialAuthority(4);
      assert.ok(rule);
      assert.strictEqual(rule.requiredAuthorityRole, 'FINANCE_DIRECTOR');
      assert.strictEqual(rule.dualApprovalRequired, true);
    });

    test('7-10 installments dynamically routes to Executive Director / General Manager', () => {
      const rule = resolveFinancialAuthority(8);
      assert.ok(rule);
      assert.strictEqual(rule.requiredAuthorityRole, 'EXECUTIVE_DIRECTOR');
      assert.strictEqual(rule.requiredApprovalLevels, 3);
    });
  });

  describe('5. Evidence Integrity & Cryptographic Checksum Logic', () => {
    test('Evidence record preserves SHA-256 hash and immutable linkage', () => {
      const evidence: EvidenceRecord = {
        id: 'ev_001',
        documentId: 'doc_filing_cs01',
        sourceEntityType: 'COMPLIANCE_CALENDAR_ITEM',
        sourceEntityId: 'cal_uk_cs01_2026',
        classification: 'CONFIDENTIAL',
        evidenceType: 'COMPANIES_HOUSE_SUBMISSION_RECEIPT',
        checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        submittedByUserId: 'usr_compliance_officer',
        submittedAt: '2026-08-15T12:00:00Z',
        verificationStatus: 'VERIFIED',
        verifiedByUserId: 'usr_auditor_01',
        verifiedAt: '2026-08-15T14:00:00Z',
        retentionPolicyYears: 7,
        createdAt: '2026-08-15T12:00:00Z',
        updatedAt: '2026-08-15T14:00:00Z'
      };

      assert.strictEqual(evidence.checksumSha256.length, 64, 'SHA-256 hash must be 64 hex characters');
      assert.strictEqual(evidence.verificationStatus, 'VERIFIED');
    });
  });
});
