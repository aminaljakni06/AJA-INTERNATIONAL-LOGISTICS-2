import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../types/user';
import { ComplianceObligationService } from '../services/complianceObligationService';
import { ComplianceApplicabilityEngine } from '../services/complianceApplicabilityEngine';
import { RegulatoryFilingEngine } from '../services/regulatoryFilingEngine';
import { ComplianceMonitoringEngine } from '../services/complianceMonitoringEngine';
import { resetComplianceRepositoryMemoryStore } from '../db/repositories/complianceObligationRepository';
import { saveCorporateDecision } from '../db/repositories/corporateGovernanceRepository';
import { CorporateDecision } from '../types/corporateGovernance';

describe('STEP GOV-07 — Enterprise Compliance Obligations, Applicability, Regulatory Filings & Monitoring Engine Suite', () => {

  // Test Principals Setup
  const ceoPrincipal: User = {
    id: 'user_ceo_01',
    email: 'ceo@aja.com',
    fullName: 'Aja Chief Executive Officer',
    phone: '+44123456780',
    role: 'CEO',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    securityLevel: 5,
    approvalLimit: 1000000,
    statutoryAppointments: [
      {
        id: 'apt_ceo_101',
        legalEntityId: 'le-holding-101',
        status: 'ACTIVE',
        effectiveFrom: '2020-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const complianceOfficerPrincipal: User = {
    id: 'user_compliance_officer_01',
    email: 'compliance@aja.com',
    fullName: 'Chief Compliance Officer',
    phone: '+44123456789',
    role: 'COMPANY_ADMIN',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    departmentId: 'dept_legal_compliance',
    securityLevel: 4,
    statutoryAppointments: [
      {
        id: 'apt_cco_101',
        legalEntityId: 'le-holding-101',
        status: 'ACTIVE',
        effectiveFrom: '2020-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const auditorPrincipal: User = {
    id: 'user_auditor_01',
    email: 'auditor@external-firm.com',
    fullName: 'Statutory External Auditor',
    phone: '+44123456799',
    role: 'AUDITOR',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    securityLevel: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const financeManagerPrincipal: User = {
    id: 'user_fin_mgr_01',
    email: 'finance.mgr@aja.com',
    fullName: 'UK Finance Manager',
    phone: '+44123456783',
    role: 'FINANCE_MANAGER',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    departmentId: 'dept_finance',
    securityLevel: 3,
    approvalLimit: 100000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const technicalAdminPrincipal: User = {
    id: 'user_tech_admin_01',
    email: 'sysadmin@aja.com',
    fullName: 'Platform Infrastructure Sysadmin',
    phone: '+44123456790',
    role: 'SYSTEM_ADMIN',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    securityLevel: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const entityBUserPrincipal: User = {
    id: 'user_entity_b_01',
    email: 'manager.ksa@aja.com',
    fullName: 'KSA Regional Hub Manager',
    phone: '+966500000001',
    role: 'OPERATIONS_MANAGER',
    companyId: 'company_aja_ksa',
    legalEntityId: 'le-sa-ops-202', // Different Legal Entity
    securityLevel: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const unassignedExternalAdvisorPrincipal: User = {
    id: 'user_external_advisor_99',
    email: 'advisor@consulting.com',
    fullName: 'Unassigned External Advisor',
    phone: '+447000000000',
    role: 'CUSTOMER', // Non-governance role
    companyId: 'company_other',
    legalEntityId: 'le-external-999',
    securityLevel: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    resetComplianceRepositoryMemoryStore();
  });

  // ==========================================================================
  // 1. CANONICAL REQUIREMENT DISCOVERY & SCOPED OBLIGATION REGISTRATION
  // ==========================================================================

  it('should discover canonical statutory requirement definitions in the catalog', async () => {
    const catalog = await ComplianceObligationService.listRequirementCatalog(ceoPrincipal);
    assert.ok(catalog.length >= 7, 'Catalog should contain canonical seeds');

    const cs01 = catalog.find((c) => c.code === 'REQ-UK-CS01');
    assert.ok(cs01, 'Companies House CS01 seed must be present');
    assert.equal(cs01.regulatoryAuthority, 'Companies House');
    assert.equal(cs01.jurisdiction, 'GB');

    const zatca = catalog.find((c) => c.code === 'REQ-SA-ZATCA-EINV');
    assert.ok(zatca, 'ZATCA E-Invoicing seed must be present');
    assert.equal(zatca.jurisdiction, 'SA');
  });

  it('should successfully register a scoped Compliance Obligation for a legal entity', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      requirementDefinitionCodeOrId: 'REQ-UK-CS01',
      code: 'OBL-UK-CS01-2026',
      legalEntityId: 'le-holding-101',
      titleEn: 'Companies House Annual Confirmation Statement (CS01)',
      description: 'Annual confirmation statement filing for UK Holding entity.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'Companies Act 2006 s.853A',
      frequency: 'ANNUAL',
      dueDateRule: {
        ruleType: 'RELATIVE_TO_EVENT_DAYS',
        offsetDaysOrMonths: 14
      },
      filingRequired: true,
      filingPortal: 'Companies House WebFiling',
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      responsibleDepartmentId: 'dept_legal_compliance',
      reviewerUserId: ceoPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    assert.ok(obligation.id, 'Obligation should have a valid ID');
    assert.equal(obligation.code, 'OBL-UK-CS01-2026');
    assert.equal(obligation.applicabilityStatus, 'PENDING_ASSESSMENT');
    assert.equal(obligation.legalEntityId, 'le-holding-101');
  });

  // ==========================================================================
  // 2. CRUCIAL MANDATORY NEGATIVE TESTS
  // ==========================================================================

  it('NEGATIVE: uk_incorporation_does_not_auto_apply_all_requirements', async () => {
    // Register UK Employers' Liability Insurance requirement (requires UK employees & operations)
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      requirementDefinitionCodeOrId: 'REQ-UK-ELCI',
      code: 'OBL-UK-ELCI-2026',
      legalEntityId: 'le-holding-101', // UK entity
      titleEn: 'UK Employers Liability Compulsory Insurance',
      description: 'Insurance required if holding entity employs physical UK staff.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HSE',
      category: 'INSURANCE_AND_LICENSING',
      sourceCitation: 'Employers Liability Act 1969',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: false,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Invariant: Just because entity is UK incorporated does NOT make ELCI automatically APPLICABLE.
    assert.equal(obligation.applicabilityStatus, 'PENDING_ASSESSMENT');

    // Run assessment where holding entity has NO UK employees (e.g. pure holding company)
    const { assessment, updatedObligation } = await ComplianceApplicabilityEngine.assessApplicability(
      complianceOfficerPrincipal,
      {
        obligationId: obligation.id,
        operationalPresenceChecked: true,
        hasOperationalPresence: true,
        employeePresenceChecked: true,
        hasEmployees: false, // NO employees
        employeeCount: 0,
        taxRegistrationChecked: true,
        hasTaxRegistration: true,
        regulatoryRegistrationChecked: true,
        hasRegulatoryRegistration: false,
        businessActivityChecked: true,
        relevantActivitySummary: 'Pure holding entity without direct employees; operations contracted to subsidiaries.',
        evidenceVerified: true,
        evidenceDocumentIds: ['doc_holding_structure_2026'],
        rationale: 'Legal Entity is an asset holding company with 0 direct employees. ELCI statutory threshold not triggered.'
      }
    );

    assert.equal(
      assessment.assessmentStatus,
      'NOT_APPLICABLE',
      'UK incorporation alone must NOT auto-apply employee obligations without verified employees'
    );
    assert.equal(updatedObligation.applicabilityStatus, 'NOT_APPLICABLE');
  });

  it('NEGATIVE: insufficient_evidence_prevents_final_applicability', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-CT600-2026',
      legalEntityId: 'le-holding-101',
      titleEn: 'HMRC Corporation Tax Return',
      description: 'Corporation tax declaration for UK entity.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HMRC',
      category: 'TAX_AND_REVENUE',
      sourceCitation: 'CTA 2010',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'RELATIVE_TO_FYE_MONTHS', offsetDaysOrMonths: 12 },
      filingRequired: true,
      evidenceRequired: true, // Evidence MANDATORY
      riskLevel: 'CRITICAL',
      ownerUserId: financeManagerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Assess with MISSING / UNVERIFIED evidence
    const { assessment, updatedObligation } = await ComplianceApplicabilityEngine.assessApplicability(
      complianceOfficerPrincipal,
      {
        obligationId: obligation.id,
        operationalPresenceChecked: true,
        hasOperationalPresence: true,
        employeePresenceChecked: true,
        hasEmployees: true,
        taxRegistrationChecked: true,
        hasTaxRegistration: true,
        regulatoryRegistrationChecked: true,
        hasRegulatoryRegistration: true,
        businessActivityChecked: true,
        evidenceVerified: false, // Evidence NOT verified / missing
        evidenceDocumentIds: [],
        rationale: 'Entity is operational but HMRC statutory letter and UTR verification document is pending.'
      }
    );

    assert.equal(
      assessment.assessmentStatus,
      'INSUFFICIENT_EVIDENCE',
      'Missing or unverified evidence must resolve to INSUFFICIENT_EVIDENCE'
    );
    assert.equal(updatedObligation.applicabilityStatus, 'INSUFFICIENT_EVIDENCE');
  });

  it('NEGATIVE: wrong_legal_entity_access_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-RESTRICTED',
      legalEntityId: 'le-holding-101', // Entity 101
      titleEn: 'Restricted UK Obligation',
      description: 'Confidential UK filing.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Attempt to access from user of Entity 202 (KSA entity)
    await assert.rejects(
      async () => {
        await ComplianceObligationService.getObligation(entityBUserPrincipal, obligation.id);
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|Access denied/);
        return true;
      }
    );
  });

  it('NEGATIVE: wrong_jurisdiction_scope_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-CONFIDENTIAL',
      legalEntityId: 'le-holding-101',
      titleEn: 'Confidential Obligation',
      description: 'Confidential.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HMRC',
      category: 'TAX_AND_REVENUE',
      sourceCitation: 'TMA 1970',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // User with different legalEntityId attempting assessment
    await assert.rejects(
      async () => {
        await ComplianceApplicabilityEngine.assessApplicability(entityBUserPrincipal, {
          obligationId: obligation.id,
          operationalPresenceChecked: true,
          hasOperationalPresence: true,
          employeePresenceChecked: true,
          hasEmployees: true,
          taxRegistrationChecked: true,
          hasTaxRegistration: true,
          regulatoryRegistrationChecked: true,
          hasRegulatoryRegistration: true,
          businessActivityChecked: true,
          evidenceVerified: true,
          evidenceDocumentIds: ['doc_1'],
          rationale: 'Unauthorized cross-entity assessment attempt.'
        });
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|Access denied/);
        return true;
      }
    );
  });

  it('NEGATIVE: unassigned_external_advisor_access_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-ADVISOR-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'Confidential Statutory Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Attempting direct obligation access must reject with Unauthorized
    await assert.rejects(
      async () => {
        await ComplianceObligationService.getObligation(
          unassignedExternalAdvisorPrincipal,
          obligation.id
        );
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|Access denied/i);
        return true;
      }
    );

    // List should return empty array to prevent metadata discovery
    const visible = await ComplianceObligationService.listObligationsForEntity(
      unassignedExternalAdvisorPrincipal,
      'le-holding-101'
    );
    assert.equal(visible.length, 0, 'External unauthorized principal must see 0 records');
  });

  it('NEGATIVE: not_applicable_without_assessment_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-NO-RATIONALE',
      legalEntityId: 'le-holding-101',
      titleEn: 'Obligation with empty rationale',
      description: 'Testing short rationale check.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'ICO',
      category: 'DATA_PROTECTION_GDPR',
      sourceCitation: 'DPA 2018',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'MEDIUM',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Attempt assessment with empty/too short rationale
    await assert.rejects(
      async () => {
        await ComplianceApplicabilityEngine.assessApplicability(complianceOfficerPrincipal, {
          obligationId: obligation.id,
          operationalPresenceChecked: true,
          hasOperationalPresence: false,
          employeePresenceChecked: true,
          hasEmployees: false,
          taxRegistrationChecked: true,
          hasTaxRegistration: false,
          regulatoryRegistrationChecked: true,
          hasRegulatoryRegistration: false,
          businessActivityChecked: true,
          evidenceVerified: true,
          evidenceDocumentIds: ['doc_1'],
          rationale: 'None' // Too short (< 10 chars)
        });
      },
      (err: Error) => {
        assert.match(err.message, /rationale/i);
        return true;
      }
    );
  });

  it('NEGATIVE: waiver_without_authority_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-WAIVER-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'Test Waiver Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Finance Manager (lacks 'governance:obligation:waive') attempts to grant waiver
    await assert.rejects(
      async () => {
        await ComplianceApplicabilityEngine.grantWaiver(financeManagerPrincipal, {
          obligationId: obligation.id,
          waiverReason: 'Statutory exemption granted by regulatory authority under section 400.',
          supportingDecisionId: 'dec_dummy_101',
          effectiveFrom: '2026-01-01T00:00:00Z',
          effectiveUntil: '2027-01-01T00:00:00Z'
        });
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|Access denied/);
        return true;
      }
    );
  });

  it('NEGATIVE: waiver_without_reason_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-WAIVER-REASON-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'Test Waiver Reason Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // CEO attempts waiver with blank reason
    await assert.rejects(
      async () => {
        await ComplianceApplicabilityEngine.grantWaiver(ceoPrincipal, {
          obligationId: obligation.id,
          waiverReason: '', // Blank reason
          supportingDecisionId: 'dec_dummy_101',
          effectiveFrom: '2026-01-01T00:00:00Z',
          effectiveUntil: '2027-01-01T00:00:00Z'
        });
      },
      (err: Error) => {
        assert.match(err.message, /justification|reason/i);
        return true;
      }
    );
  });

  it('NEGATIVE: invalid_filing_transition_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-FILING-TRANSITION',
      legalEntityId: 'le-holding-101',
      titleEn: 'Filing Transition Test Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    const filing = await RegulatoryFilingEngine.createFiling(complianceOfficerPrincipal, {
      obligationId: obligation.id,
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'CS01 2026 Statutory Filing',
      periodReference: 'FY2025-2026',
      dueDate: '2026-09-30T00:00:00Z'
    });

    assert.equal(filing.status, 'DRAFT');

    // Attempt direct transition from DRAFT to VERIFIED (skipping PREPARED, SUBMITTED)
    await assert.rejects(
      async () => {
        await RegulatoryFilingEngine.transitionFilingState(
          complianceOfficerPrincipal,
          filing.id,
          'VERIFIED'
        );
      },
      (err: Error) => {
        assert.match(err.message, /Invalid Filing Transition/);
        return true;
      }
    );
  });

  it('NEGATIVE: verification_without_required_evidence_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-FILING-EVIDENCE-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'Filing Evidence Test Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    const filing = await RegulatoryFilingEngine.createFiling(financeManagerPrincipal, {
      obligationId: obligation.id,
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'CS01 2026 Filing Package',
      periodReference: 'FY2025-2026',
      dueDate: '2026-09-30T00:00:00Z'
    });

    // Transition to SUBMITTED
    await RegulatoryFilingEngine.transitionFilingState(financeManagerPrincipal, filing.id, 'PREPARED');
    await RegulatoryFilingEngine.submitFiling(financeManagerPrincipal, {
      filingId: filing.id,
      submissionMethod: 'PORTAL_MANUAL_UPLOAD',
      portalName: 'Companies House WebFiling',
      outcomeStatus: 'SUCCESS'
    });

    // Auditor attempts verification with EMPTY evidenceDocumentId
    await assert.rejects(
      async () => {
        await RegulatoryFilingEngine.verifyFiling(auditorPrincipal, {
          filingId: filing.id,
          evidenceDocumentId: '' // Missing evidence
        });
      },
      (err: Error) => {
        assert.match(err.message, /evidence document|Verification Denied/i);
        return true;
      }
    );
  });

  it('NEGATIVE: submitter_cannot_self_verify_when_sod_enabled', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-SOD-FILING-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'SoD Filing Test Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Submitter prepares and submits filing
    const filing = await RegulatoryFilingEngine.createFiling(complianceOfficerPrincipal, {
      obligationId: obligation.id,
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'CS01 Statutory Submission Package',
      periodReference: 'FY2025-2026',
      dueDate: '2026-09-30T00:00:00Z',
      requiresIndependentVerification: true
    });

    await RegulatoryFilingEngine.transitionFilingState(complianceOfficerPrincipal, filing.id, 'PREPARED');
    await RegulatoryFilingEngine.submitFiling(complianceOfficerPrincipal, {
      filingId: filing.id,
      submissionMethod: 'ELECTRONIC_API',
      receiptReference: 'CH-REC-998877',
      receiptDocumentId: 'doc_submission_ch_receipt_998877',
      outcomeStatus: 'SUCCESS'
    });

    // Submitter attempts to self-verify their own filing -> MUST BE BLOCKED BY SoD
    await assert.rejects(
      async () => {
        await RegulatoryFilingEngine.verifyFiling(complianceOfficerPrincipal, {
          filingId: filing.id,
          evidenceDocumentId: 'doc_submission_ch_receipt_998877',
          verificationNotes: 'Self-verifying my own submitted filing.'
        });
      },
      (err: Error) => {
        assert.match(err.message, /Separation of Duties|SoD|prohibited/i);
        return true;
      }
    );

    // Independent Auditor CAN verify it successfully
    const verified = await RegulatoryFilingEngine.verifyFiling(auditorPrincipal, {
      filingId: filing.id,
      evidenceDocumentId: 'doc_submission_ch_receipt_998877',
      verificationNotes: 'Independently verified against Companies House XML gateway response.'
    });

    assert.equal(verified.status, 'VERIFIED');
    assert.equal(verified.verifiedByUserId, auditorPrincipal.id);
  });

  it('NEGATIVE: restricted_filing_document_direct_access_denied', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-DOC-RESTRICTED',
      legalEntityId: 'le-holding-101',
      titleEn: 'Restricted Doc Obligation',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HMRC',
      category: 'TAX_AND_REVENUE',
      sourceCitation: 'CTA 2010',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    const filing = await RegulatoryFilingEngine.createFiling(complianceOfficerPrincipal, {
      obligationId: obligation.id,
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'CT600 Confidential Document Package',
      periodReference: 'FY2025-2026',
      dueDate: '2026-12-31T00:00:00Z'
    });

    await RegulatoryFilingEngine.transitionFilingState(complianceOfficerPrincipal, filing.id, 'PREPARED');
    await RegulatoryFilingEngine.submitFiling(complianceOfficerPrincipal, {
      filingId: filing.id,
      submissionMethod: 'ELECTRONIC_API',
      receiptReference: 'HMRC-9988',
      receiptDocumentId: 'doc_hmrc_confidential_return_9988',
      outcomeStatus: 'SUCCESS'
    });

    // Entity B user attempts direct document access
    await assert.rejects(
      async () => {
        await RegulatoryFilingEngine.getFilingDocumentAccess(
          entityBUserPrincipal,
          filing.id,
          'doc_hmrc_confidential_return_9988'
        );
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|Access Denied/i);
        return true;
      }
    );
  });

  it('NEGATIVE: compliance_search_metadata_leak_prevented', async () => {
    // Register obligation under Entity 101
    await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-SECRET-SEARCH-TARGET',
      legalEntityId: 'le-holding-101',
      titleEn: 'Highly Confidential UK Acquisition Compliance',
      description: 'Secret project filing.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'FCA',
      category: 'INTERNAL_CONTROLS',
      sourceCitation: 'FSMA 2000',
      frequency: 'EVENT_DRIVEN',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'CRITICAL',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Unassigned external user performs search for 'Secret'
    const results = await ComplianceObligationService.listObligationsForEntity(
      unassignedExternalAdvisorPrincipal,
      'le-holding-101',
      { searchQuery: 'Secret' }
    );

    assert.equal(results.length, 0, 'Unauthorized search MUST return 0 results and never leak metadata');
  });

  it('NEGATIVE: unauthorized_compliance_export_denied', async () => {
    // Finance Manager (lacks 'governance:obligation:export') attempts export
    await assert.rejects(
      async () => {
        await ComplianceObligationService.exportObligationMatrix(
          financeManagerPrincipal,
          'le-holding-101'
        );
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|export/i);
        return true;
      }
    );

    // Auditor CAN export
    const exportResult = await ComplianceObligationService.exportObligationMatrix(
      auditorPrincipal,
      'le-holding-101',
      'JSON'
    );
    assert.ok(exportResult.data, 'Auditor export should produce valid data');
    assert.equal(exportResult.mimeType, 'application/json');
  });

  it('NEGATIVE: technical_admin_cannot_bypass_compliance_authority', async () => {
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-ADMIN-BYPASS-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'Statutory Verification Bypass Protection',
      description: 'Test.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'CONTINUOUS' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    const filing = await RegulatoryFilingEngine.createFiling(complianceOfficerPrincipal, {
      obligationId: obligation.id,
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Statutory Filing for Admin Bypass Test',
      periodReference: 'FY2025-2026',
      dueDate: '2026-09-30T00:00:00Z'
    });

    await RegulatoryFilingEngine.transitionFilingState(complianceOfficerPrincipal, filing.id, 'PREPARED');
    await RegulatoryFilingEngine.submitFiling(complianceOfficerPrincipal, {
      filingId: filing.id,
      submissionMethod: 'ELECTRONIC_API',
      receiptReference: 'CH-999111',
      receiptDocumentId: 'doc_receipt_999111',
      outcomeStatus: 'SUCCESS'
    });

    // Technical Admin (SYSTEM_ADMIN) attempts statutory verification without statutory authority
    await assert.rejects(
      async () => {
        await RegulatoryFilingEngine.verifyFiling(technicalAdminPrincipal, {
          filingId: filing.id,
          evidenceDocumentId: 'doc_receipt_999111'
        });
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized|verify/i);
        return true;
      }
    );
  });

  // ==========================================================================
  // 3. POSITIVE COMPLIANCE & MONITORING WORKFLOW VERIFICATION
  // ==========================================================================

  it('POSITIVE: should execute complete positive statutory waiver backed by Board Resolution', async () => {
    // 1. Create and approve supporting Board Resolution
    const boardDecision: CorporateDecision = {
      id: 'dec_waiver_approval_2026',
      decisionNumber: 'DEC-2026-0099',
      legalEntityId: 'le-holding-101',
      title: 'Board Resolution for Dormant Subsidiary Exemption',
      description: 'Formal board resolution approving statutory filing waiver for dormant entity.',
      decisionType: 'COMPLIANCE_POLICY_APPROVAL',
      jurisdictionContext: 'GB',
      decisionDate: new Date().toISOString(),
      meetingModality: 'PHYSICAL',
      eventTimeZone: 'Europe/London',
      decisionLocationContext: {
        country: 'United Kingdom',
        city: 'London',
        timeZone: 'Europe/London',
        meetingModality: 'PHYSICAL'
      },
      effectiveDate: '2026-01-01T00:00:00Z',
      lifecycleStatus: 'RESOLUTION',
      executionStatus: 'NOT_APPLICABLE',
      riskLevel: 'HIGH',
      resolutionText: 'RESOLVED that statutory waiver under Companies Act 2006 s.448 is approved.',
      participants: [],
      createdByUserId: ceoPrincipal.id,
      approvedByUserIds: [ceoPrincipal.id],
      supportingDocumentIds: [],
      evidenceIds: [],
      version: 1,
      auditCorrelationId: 'corr_test_waiver',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveCorporateDecision(boardDecision, ceoPrincipal.id);

    // 2. Register obligation
    const obligation = await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-DORMANT-ACCOUNTS-2026',
      legalEntityId: 'le-holding-101',
      titleEn: 'UK Dormant Company Accounts (AA02)',
      description: 'Accounts filing for dormant entities.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'CORPORATE_STATUTORY',
      sourceCitation: 'CA 2006 s.448',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'RELATIVE_TO_FYE_MONTHS', offsetDaysOrMonths: 9 },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'MEDIUM',
      ownerUserId: complianceOfficerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // 3. Grant Waiver with Board Decision reference
    const { waiver, updatedObligation } = await ComplianceApplicabilityEngine.grantWaiver(ceoPrincipal, {
      obligationId: obligation.id,
      waiverReason: 'Statutory exemption for dormant subsidiary accounts granted under Companies Act 2006 s.448.',
      supportingDecisionId: boardDecision.id,
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveUntil: '2026-12-31T23:59:59Z'
    });

    assert.equal(waiver.status, 'ACTIVE');
    assert.equal(updatedObligation.applicabilityStatus, 'WAIVED');
    assert.equal(updatedObligation.isWaived, true);
    assert.equal(updatedObligation.activeWaiverId, waiver.id);
  });

  it('POSITIVE: should scan compliance telemetry and emit typed monitoring signals', async () => {
    // Register an unassessed obligation
    await ComplianceObligationService.registerObligation(complianceOfficerPrincipal, {
      code: 'OBL-UK-TELEMETRY-TEST',
      legalEntityId: 'le-holding-101',
      titleEn: 'Telemetry Test Obligation',
      description: 'Testing telemetry signal generation.',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HMRC',
      category: 'TAX_AND_REVENUE',
      sourceCitation: 'VATA 1994',
      frequency: 'QUARTERLY',
      dueDateRule: { ruleType: 'RELATIVE_TO_EVENT_DAYS', offsetDaysOrMonths: 37 },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: financeManagerPrincipal.id,
      effectiveFrom: '2026-01-01T00:00:00Z'
    });

    // Scan monitoring telemetry
    const signals = await ComplianceMonitoringEngine.scanAndGenerateSignals(
      complianceOfficerPrincipal,
      'le-holding-101'
    );

    assert.ok(signals.length > 0, 'Monitoring engine should detect signals');
    const unassessedSignal = signals.find((s) => s.signalType === 'UNASSESSED_OBLIGATION');
    assert.ok(unassessedSignal, 'UNASSESSED_OBLIGATION signal must be emitted');
    assert.equal(unassessedSignal.severity, 'HIGH');

    // Resolve signal
    const resolved = await ComplianceMonitoringEngine.resolveSignal(
      complianceOfficerPrincipal,
      unassessedSignal.id,
      'RESOLVED'
    );
    assert.equal(resolved.status, 'RESOLVED');
    assert.ok(resolved.resolvedAt, 'Resolved signal should have timestamp');
  });
});
