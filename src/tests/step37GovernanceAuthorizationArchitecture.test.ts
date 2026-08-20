import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { User, UserRole } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import { PolicyEngine } from '../lib/permissions/policyEngine';
import { getPermissionById, PERMISSION_REGISTRY } from '../lib/permissions/permissionRegistry';

describe('STEP GOV-04 — Enterprise Governance Permission, Scope, Authorization & Privileged Access Suite', () => {

  // Test Principals Setup
  const systemAdminUser: User = {
    id: 'user_sys_admin',
    email: 'admin@aja.com',
    fullName: 'System Administrator',
    phone: '+44123456789',
    role: 'SYSTEM_ADMIN',
    companyId: 'company_aja_uk',
    legalEntityId: 'le_aja_uk_holdings',
    securityLevel: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const ceoDirectorUser: User = {
    id: 'user_ceo_director',
    email: 'ceo@aja.com',
    fullName: 'Aja CEO & Executive Director',
    phone: '+44123456780',
    role: 'CEO',
    companyId: 'company_aja_uk',
    legalEntityId: 'le_aja_uk_holdings',
    securityLevel: 5,
    approvalLimit: 1000000,
    statutoryAppointments: [
      {
        id: 'apt_ceo_uk',
        legalEntityId: 'le_aja_uk_holdings',
        status: 'ACTIVE',
        effectiveFrom: '2020-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z',
        roleTitle: 'Managing Director'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const financeDirectorUser: User = {
    id: 'user_cfo_director',
    email: 'cfo@aja.com',
    fullName: 'Aja Group CFO',
    phone: '+44123456781',
    role: 'CFO',
    companyId: 'company_aja_uk',
    legalEntityId: 'le_aja_uk_holdings',
    departmentId: 'dept_finance',
    securityLevel: 4,
    approvalLimit: 250000,
    statutoryAppointments: [
      {
        id: 'apt_cfo_uk',
        legalEntityId: 'le_aja_uk_holdings',
        status: 'ACTIVE',
        effectiveFrom: '2021-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z',
        roleTitle: 'Finance Director'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const financeManagerUser: User = {
    id: 'user_fin_mgr',
    email: 'finmgr@aja.com',
    fullName: 'Finance Manager UK',
    phone: '+44123456782',
    role: 'FINANCE_MANAGER',
    companyId: 'company_aja_uk',
    legalEntityId: 'le_aja_uk_holdings',
    departmentId: 'dept_finance',
    securityLevel: 3,
    approvalLimit: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const staffEmployeeUser: User = {
    id: 'user_staff_01',
    email: 'staff@aja.com',
    fullName: 'Operations Staff',
    phone: '+44123456783',
    role: 'STAFF',
    companyId: 'company_aja_uk',
    legalEntityId: 'le_aja_uk_holdings',
    departmentId: 'dept_ops',
    securityLevel: 2,
    approvalLimit: 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // ==================== 1. Registry & Namespace Collision Checks ====================
  describe('1. Governance Permission Registry & Namespace Collision Verification', () => {
    it('All required Governance permissions are registered under "governance:" namespace', () => {
      const govPerms = PERMISSION_REGISTRY.filter((p) => p.module === 'governance');
      assert.ok(govPerms.length >= 25, `Expected at least 25 governance permissions, found ${govPerms.length}`);

      const decisionApprove = getPermissionById('governance:decision:approve');
      assert.ok(decisionApprove, 'governance:decision:approve must be registered');
      assert.equal(decisionApprove?.action, 'approve');
      assert.equal(decisionApprove?.isSensitive, true);
      // Ensure SYSTEM_ADMIN is not in defaultRoles for statutory decision approval
      assert.ok(!decisionApprove?.defaultRoles.includes('SYSTEM_ADMIN'), 'SYSTEM_ADMIN must be excluded from default decision approvers');
    });

    it('Customs & Regulatory compliance stays in "compliance:" without collision', () => {
      const customsPerm = getPermissionById('compliance:customs:manage');
      assert.ok(customsPerm, 'compliance:customs:manage must exist');
      assert.equal(customsPerm?.module, 'compliance');
    });
  });

  // ==================== 2. Separation of Duties & Administrative Boundary ====================
  describe('2. System Admin Privileged Boundary & Separation of Duties (P0 Tests)', () => {
    it('admin_cannot_approve_by_role_alone: Technical ADMIN cannot approve Corporate Decision without statutory appointment/role', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        prohibitAdminBypass: true
      };

      const result = PermissionResolver.hasPermission(systemAdminUser, 'governance:decision:approve', context);
      assert.equal(result, false, 'Technical SYSTEM_ADMIN must be DENIED corporate decision approval by role alone');
    });

    it('self_approval_denied: Requester/Creator is strictly prohibited from approving their own decision', () => {
      const contextAsCreator: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        createdById: ceoDirectorUser.id, // CEO created the resolution
        isRequester: true
      };

      const result = PermissionResolver.hasPermission(ceoDirectorUser, 'governance:decision:approve', contextAsCreator);
      assert.equal(result, false, 'Self-approval must be DENIED even for CEO');
    });

    it('Independent Director is permitted to approve decision created by another officer', () => {
      const contextAsIndependent: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        createdById: 'user_other_officer',
        isRequester: false
      };

      const result = PermissionResolver.hasPermission(ceoDirectorUser, 'governance:decision:approve', contextAsIndependent);
      assert.equal(result, true, 'Independent CEO Director is PERMITTED to approve');
    });
  });

  // ==================== 3. Scope Isolation: Legal Entity & Department ====================
  describe('3. Scope Enforcement: Legal Entity & Organizational Boundaries', () => {
    it('wrong_legal_entity_denied: Finance Director of Legal Entity A cannot approve for Legal Entity B', () => {
      const crossEntityContext: ABACContext = {
        legalEntityId: 'le_aja_saudi_arabia_branch', // Different legal entity
        amount: 20000,
        isGovernanceOrFinancial: true
      };

      const result = PermissionResolver.hasPermission(financeDirectorUser, 'governance:decision:approve', crossEntityContext);
      assert.equal(result, false, 'Cross-entity access without explicit grant must be DENIED');
    });

    it('wrong_department_denied: Staff from Operations Department cannot access Finance isolated contexts', () => {
      const financeContext: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        departmentId: 'dept_finance'
      };

      const result = PermissionResolver.hasPermission(staffEmployeeUser, 'finance:invoice:view', financeContext);
      assert.equal(result, false, 'Non-finance staff in different department must be DENIED');
    });

    it('decision_specific_scope_isolated: Non-assigned staff cannot view isolated decision', () => {
      const isolatedContext: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        decisionSpecificId: 'dec_secret_merger',
        createdById: 'user_cfo_director',
        assignedToId: 'user_legal_counsel',
        classification: 'RESTRICTED'
      };

      const result = PermissionResolver.hasPermission(staffEmployeeUser, 'governance:decision:view', isolatedContext);
      assert.equal(result, false, 'Isolated restricted decision must be DENIED to unassigned staff');
    });
  });

  // ==================== 4. Precedence Model & Explicit Deny ====================
  describe('4. Precedence Model & Explicit Deny Verification', () => {
    it('explicit_deny_overrides_allow: Explicit deny in profile overrides Direct Allow and Role Allow', () => {
      const userWithExplicitDeny: User = {
        ...financeDirectorUser,
        customPermissions: ['governance:profile:update'], // Direct grant
        deniedPermissions: ['governance:profile:update']   // Explicit deny
      };

      const evalResult = PermissionResolver.evaluateDetailed(userWithExplicitDeny, 'governance:profile:update');
      assert.equal(evalResult.granted, false);
      assert.equal(evalResult.precedence, 'EXPLICIT_DENY');
    });

    it('Direct grant allows non-default role when not explicitly denied', () => {
      const userWithDirectGrant: User = {
        ...staffEmployeeUser,
        customPermissions: ['governance:record:create']
      };

      const evalResult = PermissionResolver.evaluateDetailed(userWithDirectGrant, 'governance:record:create', {
        legalEntityId: 'le_aja_uk_holdings'
      });
      assert.equal(evalResult.granted, true);
      assert.equal(evalResult.precedence, 'DIRECT_ALLOW');
    });
  });

  // ==================== 5. Delegation of Authority (DoA) Runtime ====================
  describe('5. Delegation of Authority Runtime Validation & Expired DoA Denial', () => {
    it('expired_delegation_denied: Stored ACTIVE status with past effectiveUntil is strictly DENIED', () => {
      const expiredDelegation = {
        id: 'del_expired_01',
        delegatorUserId: financeDirectorUser.id,
        delegateUserId: staffEmployeeUser.id,
        authorityType: 'FINANCIAL_EXPENDITURE',
        legalEntityId: 'le_aja_uk_holdings',
        status: 'ACTIVE', // Stored as ACTIVE in DB
        effectiveFrom: '2023-01-01T00:00:00Z',
        effectiveUntil: '2023-12-31T23:59:59Z', // Expired in the past!
        amountLimit: 25000
      };

      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        amount: 10000,
        delegations: [expiredDelegation]
      };

      const result = PermissionResolver.hasPermission(staffEmployeeUser, 'finance:payment:process', context);
      assert.equal(result, false, 'Expired delegation must be DENIED regardless of stored status');
    });

    it('Active valid delegation within limits is GRANTED', () => {
      const activeDelegation = {
        id: 'del_active_01',
        delegatorUserId: financeDirectorUser.id,
        delegateUserId: staffEmployeeUser.id,
        authorityType: 'FINANCIAL_EXPENDITURE',
        legalEntityId: 'le_aja_uk_holdings',
        status: 'ACTIVE',
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z',
        amountLimit: 50000
      };

      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        amount: 20000,
        delegations: [activeDelegation]
      };

      const evalResult = PermissionResolver.evaluateDetailed(staffEmployeeUser, 'finance:payment:process', context);
      assert.equal(evalResult.granted, true);
      assert.equal(evalResult.precedence, 'DELEGATED_ALLOW');
      assert.equal(evalResult.viaDelegationId, 'del_active_01');
    });

    it('Active delegation exceeding amount limit is DENIED', () => {
      const activeDelegation = {
        id: 'del_active_02',
        delegatorUserId: financeDirectorUser.id,
        delegateUserId: staffEmployeeUser.id,
        authorityType: 'FINANCIAL_EXPENDITURE',
        legalEntityId: 'le_aja_uk_holdings',
        status: 'ACTIVE',
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z',
        amountLimit: 10000 // Limit is 10k
      };

      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        amount: 25000, // Request is 25k
        delegations: [activeDelegation]
      };

      const result = PermissionResolver.hasPermission(staffEmployeeUser, 'finance:payment:process', context);
      assert.equal(result, false, 'Delegation exceeding delegated monetary limit must be DENIED');
    });
  });

  // ==================== 6. Statutory Appointments & Inactive Director Check ====================
  describe('6. Corporate Statutory Appointment Authority', () => {
    it('inactive_director_appointment_denied: Expired corporate appointment denies privileged statutory action', () => {
      const expiredDirectorUser: User = {
        ...ceoDirectorUser,
        id: 'user_former_director',
        role: 'STAFF', // Former director role revoked
        statutoryAppointments: [
          {
            id: 'apt_resigned',
            legalEntityId: 'le_aja_uk_holdings',
            status: 'RESIGNED',
            effectiveFrom: '2020-01-01T00:00:00Z',
            effectiveUntil: '2022-01-01T00:00:00Z'
          }
        ]
      };

      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        requireStatutoryAppointment: true
      };

      const result = PermissionResolver.hasPermission(expiredDirectorUser, 'governance:appointment:create', context);
      assert.equal(result, false, 'Inactive / resigned director must be DENIED statutory actions');
    });
  });

  // ==================== 7. Financial Installment Routing (Configurable) ====================
  describe('7. Financial Installment Matrix Policy Routing', () => {
    it('4 installments + Finance Manager -> insufficient authority (DENY)', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        installments: 4,
        amount: 30000
      };

      const result = PolicyEngine.evaluatePolicy('CanApproveInstallments', financeManagerUser, context);
      assert.equal(result, false, 'Finance Manager alone lacks authority for 4 installment contract');
    });

    it('4 installments + Finance Director / CFO + correct scope -> ELIGIBLE (ALLOW)', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        installments: 4,
        amount: 30000
      };

      const result = PolicyEngine.evaluatePolicy('CanApproveInstallments', financeDirectorUser, context);
      assert.equal(result, true, 'Finance Director (CFO) is ELIGIBLE for 4 installments');
    });

    it('8 installments + Finance Director -> insufficient authority (DENY)', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        installments: 8,
        amount: 150000
      };

      const result = PolicyEngine.evaluatePolicy('CanApproveInstallments', financeDirectorUser, context);
      assert.equal(result, false, '8 installments requires Executive Director / CEO tier, CFO alone DENIED');
    });

    it('8 installments + Executive Director / CEO + correct scope -> ELIGIBLE (ALLOW)', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        installments: 8,
        amount: 150000,
        isRequester: false
      };

      const result = PolicyEngine.evaluatePolicy('CanApproveInstallments', ceoDirectorUser, context);
      assert.equal(result, true, 'CEO Executive Director is ELIGIBLE for 8 installments');
    });

    it('Dynamic Config change modifies installment thresholds without code modification', () => {
      // Modify policy dynamically via context config fixture (e.g. relaxing CFO tier to 8 installments)
      const dynamicConfigContext: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        installments: 8,
        amount: 150000,
        minFinanceDirInstallments: 3,
        maxFinanceDirInstallments: 8, // Relaxed to 8
        executiveInstallmentThreshold: 9 // Executive threshold raised to 9
      };

      const resultWithConfig = PolicyEngine.evaluatePolicy('CanApproveInstallments', financeDirectorUser, dynamicConfigContext);
      assert.equal(resultWithConfig, true, 'Dynamic policy adjustment successfully modifies eligibility without code change');
    });
  });

  // ==================== 8. Evidence Security & Submitter SoD ====================
  describe('8. Evidence Cryptographic Security & Anti-Self-Verification', () => {
    it('Evidence Submitter is strictly prohibited from verifying own evidence (SoD)', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        createdById: financeDirectorUser.id // Submitter of evidence
      };

      const result = PolicyEngine.evaluatePolicy('CanVerifyEvidence', financeDirectorUser, context);
      assert.equal(result, false, 'Submitter cannot verify own cryptographic evidence');
    });

    it('Independent Auditor or Executive is permitted to verify valid evidence', () => {
      const context: ABACContext = {
        legalEntityId: 'le_aja_uk_holdings',
        createdById: 'user_someone_else'
      };

      const result = PolicyEngine.evaluatePolicy('CanVerifyEvidence', financeDirectorUser, context);
      assert.equal(result, true, 'Independent Finance Director can verify evidence');
    });
  });

  // ==================== 9. Search & Metadata Leakage Prevention ====================
  describe('9. Search Security & Zero Metadata Leakage', () => {
    it('search_metadata_leak_prevented: Records out of legal entity/scope are stripped completely', () => {
      const decisions = [
        {
          id: 'dec_uk_01',
          title: 'UK Expansion Resolution',
          legalEntityId: 'le_aja_uk_holdings'
        },
        {
          id: 'dec_sa_01',
          title: 'Saudi Branch Acquisition',
          legalEntityId: 'le_aja_saudi_arabia_branch'
        }
      ];

      // Finance Director of UK Legal Entity
      const filtered = PermissionResolver.filterRecordsByScope(decisions, financeDirectorUser, 'governance:decision:view');
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'dec_uk_01');
      assert.equal(filtered.find((d) => d.id === 'dec_sa_01'), undefined, 'Zero metadata leakage of Saudi decision to UK director');
    });
  });

  // ==================== 10. Field-Level Masking Security ====================
  describe('10. Field-Level Access Security & Sensitive Masking', () => {
    it('Sensitive tax and passport data is masked for non-executive users', () => {
      const rawOfficerProfile = {
        id: 'officer_01',
        fullName: 'Jane Doe',
        taxIdentifier: 'UK-TAX-998877',
        passportNumber: 'GB12345678',
        personalAddress: '10 Downing St, London',
        status: 'ACTIVE'
      };

      const masked = PermissionResolver.applyFieldLevelSecurity(rawOfficerProfile, staffEmployeeUser);
      assert.equal(masked.fullName, 'Jane Doe');
      assert.equal(masked.taxIdentifier, '*** MASKED BY GOVERNANCE POLICY ***');
      assert.equal(masked.passportNumber, '*** MASKED BY GOVERNANCE POLICY ***');
      assert.equal(masked.personalAddress, '*** MASKED BY GOVERNANCE POLICY ***');

      // Executive receives unmasked
      const unmasked = PermissionResolver.applyFieldLevelSecurity(rawOfficerProfile, ceoDirectorUser);
      assert.equal(unmasked.taxIdentifier, 'UK-TAX-998877');
    });
  });

  // ==================== 11. Service Principal & AI Authority Limits ====================
  describe('11. Service Principal & AI Authority Limits', () => {
    it('service_principal_cannot_approve: Automated background service principal cannot approve corporate decisions', () => {
      const complianceSchedulerService: User = {
        id: 'svc_compliance_scheduler',
        email: 'scheduler@service.internal',
        fullName: 'Compliance Scheduler Service Principal',
        phone: '0000',
        role: 'EMPLOYEE',
        customPermissions: ['governance:calendar:view', 'governance:calendar:escalate'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = PermissionResolver.hasPermission(complianceSchedulerService, 'governance:decision:approve');
      assert.equal(result, false, 'Service principal cannot approve corporate decisions');
    });

    it('AI platform copilot has view/draft permissions but zero final approval authority', () => {
      const copilotPermission = getPermissionById('governance:decision:approve');
      assert.ok(!copilotPermission?.defaultRoles.includes('EMPLOYEE'), 'AI / standard roles cannot approve');
    });
  });
});
