/**
 * AJA INTERNATIONAL LOGISTICS
 * STEP GOV-20 — REGULATORY OBLIGATION EXECUTION ASSURANCE, COMPLIANCE CERTIFICATION,
 * CONTROL ATTESTATION & EVIDENCE-BASED COMPLIANCE CLOSURE
 * Comprehensive Verification & Invariant Test Suite
 */

import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import { ComplianceCertificationService } from '../services/complianceCertificationService';
import {
  resetComplianceCertificationRepositoryMemoryStore,
  getComplianceCertificationById,
  listComplianceCertificationsByEntity
} from '../db/repositories/complianceCertificationRepository';
import {
  resetComplianceRepositoryMemoryStore,
  saveObligation,
  saveRegulatoryFiling
} from '../db/repositories/complianceObligationRepository';
import {
  resetCorporateRecordsRepositoryMemoryStore,
  saveEvidenceRecord
} from '../db/repositories/corporateRecordsRepository';
import {
  resetCorporateAuthorityMemoryStore,
  saveInternalControl,
  saveCorporatePolicy,
  saveCorporatePolicyVersion
} from '../db/repositories/corporateAuthorityRepository';
import {
  resetCorporateGovernanceMemoryStore,
  saveCorporateDecision
} from '../db/repositories/corporateGovernanceRepository';
import {
  resetRiskAssuranceRepositoryMemoryStore,
  saveGovernanceFinding,
  saveGovernanceException
} from '../db/repositories/corporateRiskAssuranceRepository';
import { User } from '../types/user';
import {
  ComplianceObligation,
  RegulatoryFiling,
  EvidenceRecord,
  InternalControl,
  CorporatePolicy,
  CorporatePolicyVersion,
  CorporateDecision,
  GovernanceFinding,
  GovernanceException
} from '../types/corporateGovernance';
import * as crypto from 'crypto';

// Setup Test Principals
const ukComplianceOfficer: User = {
  id: 'usr_uk_compliance_01',
  name: 'UK Compliance Director',
  email: 'compliance.uk@ajalogistics.co.uk',
  role: 'COMPLIANCE_OFFICER',
  permissions: ['governance:compliance:certify', 'governance:obligation:view'],
  legalEntityId: 'LE-UK-001',
  country: 'GB'
};

const ukIndependentAuditor: User = {
  id: 'usr_uk_independent_auditor_01',
  name: 'UK Independent Assurance Lead',
  email: 'internal.audit@ajalogistics.co.uk',
  role: 'AUDITOR',
  permissions: ['governance:assurance:verify', 'governance:certification:export'],
  legalEntityId: 'LE-UK-001',
  country: 'GB'
};

const obligationOwnerUser: User = {
  id: 'usr_ops_lead_01',
  name: 'UK Operations Lead',
  email: 'ops.lead@ajalogistics.co.uk',
  role: 'OPERATIONS_MANAGER',
  permissions: ['governance:obligation:manage'],
  legalEntityId: 'LE-UK-001',
  country: 'GB'
};

const techAdminUser: User = {
  id: 'usr_tech_admin_01',
  name: 'IT Systems Admin',
  email: 'admin.infra@ajalogistics.com',
  role: 'ADMIN',
  permissions: ['system:manage'],
  legalEntityId: 'LE-UK-001',
  country: 'GB'
};

const aiAgentUser: User = {
  id: 'ai_autonomous_agent_01',
  name: 'Governance Intelligence Agent',
  email: 'ai.agent@ajalogistics.internal',
  role: 'GUEST',
  permissions: ['ai:readiness:prepare'],
  legalEntityId: 'LE-UK-001',
  country: 'GB'
};
(aiAgentUser as any).isAIAgent = true;

const servicePrincipalUser: User = {
  id: 'sp_cron_scheduler_01',
  name: 'Background Automation Principal',
  email: 'cron.worker@ajalogistics.internal',
  role: 'GUEST',
  permissions: ['cron:execute'],
  legalEntityId: 'LE-UK-001',
  country: 'GB'
};
(servicePrincipalUser as any).role = 'SERVICE_PRINCIPAL';

const ksaComplianceOfficer: User = {
  id: 'usr_ksa_compliance_01',
  name: 'KSA Regional Compliance Lead',
  email: 'compliance.ksa@ajalogistics.sa',
  role: 'COMPLIANCE_OFFICER',
  permissions: ['governance:compliance:certify'],
  legalEntityId: 'LE-KSA-001',
  country: 'SA'
};

describe('STEP GOV-20 — REGULATORY OBLIGATION EXECUTION ASSURANCE & COMPLIANCE CERTIFICATION', () => {
  beforeEach(() => {
    resetComplianceCertificationRepositoryMemoryStore();
    resetComplianceRepositoryMemoryStore();
    resetCorporateRecordsRepositoryMemoryStore();
    resetCorporateAuthorityMemoryStore();
    resetCorporateGovernanceMemoryStore();
    resetRiskAssuranceRepositoryMemoryStore();
  });

  async function seedBaselineGovernanceEntities() {
    // Seed Corporate Policy & Version
    const policy: CorporatePolicy = {
      id: 'pol_statutory_compliance',
      policyCode: 'POL-COMP-001',
      title: 'Statutory Regulatory Compliance & Certification Policy',
      category: 'COMPLIANCE',
      legalEntityScope: ['LE-UK-001'],
      departmentScope: ['ALL'],
      ownerUserId: ukComplianceOfficer.id,
      ownerRole: 'COMPLIANCE_OFFICER',
      mandatoryReviewFrequencyMonths: 12,
      activeVersionNumber: 1,
      lifecycleStatus: 'EFFECTIVE',
      classificationClearance: 'CONFIDENTIAL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporatePolicy(policy, ukComplianceOfficer.id);

    const policyVersion: CorporatePolicyVersion = {
      id: 'pol_ver_comp_001_v1',
      policyId: policy.id,
      versionNumber: 1,
      contentSummary: 'Mandatory annual confirmation statement and customs verification policy.',
      supportingDecisionId: 'dec_board_01',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveUntil: '2027-01-01T00:00:00Z',
      reviewDate: '2027-01-01T00:00:00Z',
      approvedByUserIds: [ukComplianceOfficer.id],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveCorporatePolicyVersion(policyVersion, ukComplianceOfficer.id);

    // Seed Compliance Obligation (UK Companies House Annual CS01 Confirmation Statement)
    const obligation: ComplianceObligation = {
      id: 'obl_uk_cs01_2026',
      code: 'OBL-UK-CS01-2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      titleEn: 'Companies House Annual Confirmation Statement (CS01)',
      description: 'Statutory obligation to deliver annual CS01 confirmation statement with PSC register.',
      category: 'CORPORATE_STATUTORY',
      regulatoryAuthority: 'Companies House (UK)',
      applicabilityStatus: 'APPLICABLE',
      filingRequired: true,
      evidenceRequired: true,
      frequency: 'ANNUAL',
      sourceCitation: 'Companies Act 2006 s.853A',
      dueDateRule: { ruleType: 'FIXED_ANNUAL_DAY', fixedMonthDay: '12-31' },
      riskLevel: 'HIGH',
      ownerUserId: obligationOwnerUser.id, // Obligation Owner (Ops Lead)
      reviewerUserId: ukComplianceOfficer.id,
      status: 'ACTIVE',
      effectiveFrom: '2026-01-01T00:00:00Z',
      auditCorrelationId: 'cor_obl_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveObligation(obligation, ukComplianceOfficer.id);

    // Seed Regulatory Filing (ACCEPTED by authority with receipt)
    const filing: RegulatoryFiling = {
      id: 'fil_uk_cs01_2026_01',
      filingNumber: 'FIL-2026-0001',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      obligationId: obligation.id,
      obligationCode: obligation.code,
      title: 'Companies House Annual Confirmation Statement CS01',
      periodReference: 'FY2026',
      dueDate: '2026-12-31T23:59:59Z',
      status: 'ACCEPTED',
      preparedByUserId: obligationOwnerUser.id,
      submittedByUserId: obligationOwnerUser.id,
      submittedAtUtc: '2026-02-01T14:30:00Z',
      authorityFilingReference: 'CH-CS01-REF-99281',
      authoritySubmissionReceiptDocumentId: 'doc_ch_receipt_99281',
      verifiedByUserId: ukComplianceOfficer.id,
      verifiedAtUtc: '2026-02-01T15:00:00Z',
      evidenceDocumentIds: ['doc_ch_receipt_99281'],
      requiresIndependentVerification: true,
      auditCorrelationId: 'cor_fil_01',
      createdAt: '2026-02-01T14:00:00Z',
      updatedAt: '2026-02-01T15:00:00Z'
    };
    await saveRegulatoryFiling(filing, ukComplianceOfficer.id);

    // Seed Evidence Record (Verified in Evidence Vault with SHA-256)
    const evidenceChecksum = crypto.createHash('sha256').update('Companies House CS01 Electronic Receipt').digest('hex');
    const evidence: EvidenceRecord = {
      id: 'evi_cs01_receipt_2026',
      evidenceNumber: 'EVI-2026-0001',
      legalEntityId: 'LE-UK-001',
      documentId: 'doc_ch_receipt_99281',
      documentVersionId: 'v1.0',
      evidenceType: 'STATUTORY_FILING_RECEIPT',
      checksumSha256: evidenceChecksum,
      verificationStatus: 'VERIFIED',
      integrityStatus: 'VERIFIED',
      classification: 'CONFIDENTIAL',
      submittedByUserId: obligationOwnerUser.id,
      submittedAt: '2026-02-01T14:30:00Z',
      verifiedByUserId: ukComplianceOfficer.id,
      verifiedAt: '2026-02-01T15:00:00Z',
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2027-01-01T00:00:00Z',
      auditCorrelationId: 'cor_evi_01',
      createdAt: '2026-02-01T14:30:00Z',
      updatedAt: '2026-02-01T15:00:00Z'
    };
    await saveEvidenceRecord(evidence, ukComplianceOfficer.id);

    // Seed Internal Control (Operating Effectively, Tested Freshly)
    const control: InternalControl = {
      id: 'ctl_annual_cs01_review',
      controlCode: 'CTL-COMP-001',
      title: 'Annual Statutory CS01 Pre-Submission Officer Review',
      description: 'Four-eyes verification of share capital, officers, and PSC registers before submission.',
      legalEntityId: 'LE-UK-001',
      controlType: 'PREVENTIVE',
      ownerUserId: obligationOwnerUser.id,
      ownerRole: 'OPERATIONS_MANAGER',
      isAutomated: false,
      status: 'ACTIVE',
      operatingEffectiveness: 'EFFECTIVE',
      frequency: 'ANNUAL',
      lastTestedAt: new Date().toISOString(), // Fresh within 180-day window
      lastTestedByUserId: ukIndependentAuditor.id,
      auditCorrelationId: 'cor_ctl_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveInternalControl(control, ukComplianceOfficer.id);

    return { policy, policyVersion, obligation, filing, evidence, control };
  }

  test('GOV-20-TEST-01: Valid Clean Compliance Certification Path (Applicable + Accepted Filing + Verified Evidence + Effective Control -> VERIFIED COMPLIANT)', async () => {
    await seedBaselineGovernanceEntities();

    // 1. Evaluate Readiness
    const readiness = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readiness.isApplicable, true);
    assert.equal(readiness.filingsSatisfied, true);
    assert.equal(readiness.evidenceVerified, true);
    assert.equal(readiness.evidenceIntegrityValid, true);
    assert.equal(readiness.controlsEffective, true);
    assert.equal(readiness.controlsFresh, true);
    assert.equal(readiness.readyForCertification, true);
    assert.equal(readiness.expectedResult, 'COMPLIANT');
    assert.equal(readiness.blockers.length, 0);

    // 2. Draft Certification
    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      ruleVersion: 1,
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'I hereby certify that AJA UK Logistics Ltd has fulfilled the statutory CS01 obligation.'
    }, ukComplianceOfficer);

    assert.equal(draft.status, 'DRAFT');
    assert.equal(draft.certificationResult, 'COMPLIANT');
    assert.equal(draft.version, 1);
    assert.ok(draft.certificationNumber.startsWith('CCF-'));

    // 3. Record Control Owner Attestation (Ops Lead attests control)
    const attestation = await ComplianceCertificationService.recordControlAttestation({
      controlId: 'ctl_annual_cs01_review',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      attestorRole: 'OPERATIONS_MANAGER',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      operatingEffectiveness: 'EFFECTIVE',
      evidenceRecordIds: ['evi_cs01_receipt_2026'],
      policyVersionId: 'pol_ver_comp_001_v1'
    }, obligationOwnerUser);

    assert.equal(attestation.operatingEffectiveness, 'EFFECTIVE');
    assert.ok(attestation.integrityHashSha256.length > 0);

    // 4. Primary Certification (Compliance Director certifies)
    const certified = await ComplianceCertificationService.certifyCompliance({
      certificationId: draft.id,
      certifierRole: 'COMPLIANCE_OFFICER',
      validDurationDays: 365
    }, ukComplianceOfficer);

    assert.equal(certified.status, 'PENDING_INDEPENDENT_VERIFICATION');
    assert.equal(certified.certifierUserId, ukComplianceOfficer.id);
    assert.ok(certified.certifiedAt);

    // 5. Independent Verification (Independent Auditor verifies)
    const verified = await ComplianceCertificationService.independentlyVerifyCertification({
      certificationId: certified.id,
      verifierRole: 'INTERNAL_AUDITOR',
      verificationNotes: 'Independently audited filing receipts and PSC registers against statutory registry.'
    }, ukIndependentAuditor);

    assert.equal(verified.status, 'VERIFIED');
    assert.equal(verified.independentVerifierUserId, ukIndependentAuditor.id);
    assert.ok(verified.verifiedAt);
    assert.ok(verified.integrityHashSha256.length > 0);

    // 6. Evidence-Based Compliance Closure
    const closed = await ComplianceCertificationService.closeCertification(
      verified.id,
      '2026 statutory assurance complete and archived in evidence vault.',
      ukComplianceOfficer
    );

    assert.equal(closed.status, 'CLOSED');
    assert.equal(closed.closedByUserId, ukComplianceOfficer.id);
    assert.ok(closed.closedAt);
  });

  test('GOV-20-TEST-02: Task / Filing Submitted Alone != Obligation Satisfied (Pending Filing Blocks Clean Certification)', async () => {
    await seedBaselineGovernanceEntities();

    // Replace filing with SUBMITTED (not yet ACCEPTED or VERIFIED)
    const submittedFiling: RegulatoryFiling = {
      id: 'fil_uk_cs01_2026_01',
      filingNumber: 'FIL-2026-0001',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      obligationId: 'obl_uk_cs01_2026',
      obligationCode: 'OBL-UK-CS01-2026',
      title: 'Companies House Annual Confirmation Statement CS01',
      periodReference: 'FY2026',
      dueDate: '2026-12-31T23:59:59Z',
      status: 'SUBMITTED', // In-flight, not accepted
      preparedByUserId: obligationOwnerUser.id,
      submittedByUserId: obligationOwnerUser.id,
      submittedAtUtc: '2026-02-01T14:30:00Z',
      evidenceDocumentIds: [],
      requiresIndependentVerification: true,
      auditCorrelationId: 'cor_fil_submitted',
      createdAt: '2026-02-01T14:00:00Z',
      updatedAt: '2026-02-01T14:30:00Z'
    };
    await saveRegulatoryFiling(submittedFiling, ukComplianceOfficer.id);

    const readiness = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readiness.filingsSatisfied, false);
    assert.equal(readiness.expectedResult, 'INSUFFICIENT_EVIDENCE');
    assert.ok(readiness.warnings.some(w => w.includes('SUBMITTED but not yet ACCEPTED')));

    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'Draft statement'
    }, ukComplianceOfficer);

    // Attempting to certify while INSUFFICIENT_EVIDENCE must be denied
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.certifyCompliance({
          certificationId: draft.id,
          certifierRole: 'COMPLIANCE_OFFICER'
        }, ukComplianceOfficer);
      },
      (err: Error) => err.message.includes('Certification Denied')
    );
  });

  test('GOV-20-TEST-03: Rejected Filing Strictly Blocks Clean Certification', async () => {
    await seedBaselineGovernanceEntities();

    // Replace filing with REJECTED
    const rejectedFiling: RegulatoryFiling = {
      id: 'fil_uk_cs01_2026_01',
      filingNumber: 'FIL-2026-0001',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      obligationId: 'obl_uk_cs01_2026',
      obligationCode: 'OBL-UK-CS01-2026',
      title: 'Companies House Annual Confirmation Statement CS01',
      periodReference: 'FY2026',
      dueDate: '2026-12-31T23:59:59Z',
      status: 'REJECTED',
      preparedByUserId: obligationOwnerUser.id,
      submittedByUserId: obligationOwnerUser.id,
      submittedAtUtc: '2026-02-01T14:30:00Z',
      notes: 'PSC statement format deprecated.',
      evidenceDocumentIds: [],
      requiresIndependentVerification: true,
      auditCorrelationId: 'cor_fil_rejected',
      createdAt: '2026-02-01T14:00:00Z',
      updatedAt: '2026-02-01T14:30:00Z'
    };
    await saveRegulatoryFiling(rejectedFiling, ukComplianceOfficer.id);

    const readiness = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readiness.filingsSatisfied, false);
    assert.equal(readiness.expectedResult, 'INSUFFICIENT_EVIDENCE');
    assert.ok(readiness.blockers.some(b => b.includes('REJECTED')));
  });

  test('GOV-20-TEST-04: Tampered Evidence / Hash Mismatch Blocks Certification and Flags Non-Compliance', async () => {
    await seedBaselineGovernanceEntities();

    // Corrupt evidence record with integrity failure
    const corruptEvidence: EvidenceRecord = {
      id: 'evi_cs01_receipt_2026',
      evidenceNumber: 'EVI-2026-0001',
      legalEntityId: 'LE-UK-001',
      documentId: 'doc_cs01_receipt',
      documentVersionId: 'v1.0',
      evidenceType: 'STATUTORY_FILING_RECEIPT',
      checksumSha256: 'CORRUPTED_HASH_VALUE_DOES_NOT_MATCH',
      verificationStatus: 'INTEGRITY_FAILURE',
      integrityStatus: 'MISMATCH',
      classification: 'CONFIDENTIAL',
      submittedByUserId: obligationOwnerUser.id,
      submittedAt: '2026-02-01T00:00:00Z',
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2027-01-01T00:00:00Z',
      auditCorrelationId: 'cor_evi_tampered',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z'
    };
    await saveEvidenceRecord(corruptEvidence, ukComplianceOfficer.id);

    const readiness = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readiness.evidenceIntegrityValid, false);
    assert.equal(readiness.expectedResult, 'NON_COMPLIANT');
    assert.ok(readiness.blockers.some(b => b.includes('cryptographic SHA-256')));
  });

  test('GOV-20-TEST-05: Expired Evidence Blocks Current Certification', async () => {
    await seedBaselineGovernanceEntities();

    // Evidence expired in past
    const expiredEvidence: EvidenceRecord = {
      id: 'evi_cs01_receipt_2026',
      evidenceNumber: 'EVI-2026-0001',
      legalEntityId: 'LE-UK-001',
      documentId: 'doc_cs01_receipt',
      documentVersionId: 'v1.0',
      evidenceType: 'STATUTORY_FILING_RECEIPT',
      checksumSha256: 'a'.repeat(64),
      verificationStatus: 'VERIFIED',
      integrityStatus: 'VERIFIED',
      classification: 'CONFIDENTIAL',
      submittedByUserId: obligationOwnerUser.id,
      submittedAt: '2024-01-01T00:00:00Z',
      verifiedByUserId: ukComplianceOfficer.id,
      verifiedAt: '2024-01-01T00:00:00Z',
      validFrom: '2024-01-01T00:00:00Z',
      validUntil: '2025-01-01T00:00:00Z', // Expired!
      auditCorrelationId: 'cor_evi_expired',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
    await saveEvidenceRecord(expiredEvidence, ukComplianceOfficer.id);

    const readiness = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readiness.evidenceVerified, false);
    assert.ok(readiness.blockers.some(b => b.includes('expired')));
  });

  test('GOV-20-TEST-06: Ineffective or Stale Internal Controls Block Clean Certification', async () => {
    await seedBaselineGovernanceEntities();

    // Set control to DEFICIENT
    const deficientControl: InternalControl = {
      id: 'ctl_annual_cs01_review',
      controlCode: 'CTL-COMP-001',
      title: 'Annual Statutory CS01 Pre-Submission Officer Review',
      description: 'Four-eyes verification',
      legalEntityId: 'LE-UK-001',
      controlType: 'PREVENTIVE',
      ownerUserId: obligationOwnerUser.id,
      ownerRole: 'OPERATIONS_MANAGER',
      isAutomated: false,
      frequency: 'ANNUAL',
      status: 'ACTIVE',
      operatingEffectiveness: 'DEFICIENT',
      lastTestedAt: new Date().toISOString(),
      auditCorrelationId: 'cor_ctl_deficient',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveInternalControl(deficientControl, ukComplianceOfficer.id);

    const readiness = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readiness.controlsEffective, false);
    assert.equal(readiness.expectedResult, 'NON_COMPLIANT');
    assert.ok(readiness.blockers.some(b => b.includes('DEFICIENT')));
  });

  test('GOV-20-TEST-07: Control Attestation Alone Does NOT Equal Independent Certification', async () => {
    await seedBaselineGovernanceEntities();

    // 1. Ops Lead attests control
    const attestation = await ComplianceCertificationService.recordControlAttestation({
      controlId: 'ctl_annual_cs01_review',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      attestorRole: 'OPERATIONS_MANAGER',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      operatingEffectiveness: 'EFFECTIVE',
      evidenceRecordIds: ['evi_cs01_receipt_2026'],
      policyVersionId: 'pol_ver_comp_001_v1'
    }, obligationOwnerUser);

    assert.equal(attestation.operatingEffectiveness, 'EFFECTIVE');

    // 2. Query compliance certifications -> Must still be 0 (Attestation != Certification)
    const certs = await listComplianceCertificationsByEntity('LE-UK-001');
    assert.equal(certs.length, 0);
  });

  test('GOV-20-TEST-08: Segregation of Duties (SoD) — Self-Certification and Self-Verification are Strictly Denied', async () => {
    await seedBaselineGovernanceEntities();

    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'Draft statement'
    }, ukComplianceOfficer);

    // 1. Obligation owner attempts to certify -> DENY
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.certifyCompliance({
          certificationId: draft.id,
          certifierRole: 'COMPLIANCE_OFFICER'
        }, obligationOwnerUser);
      },
      (err: Error) => err.message.includes('Segregation of Duties')
    );

    // 2. Primary certifier certifies
    const certified = await ComplianceCertificationService.certifyCompliance({
      certificationId: draft.id,
      certifierRole: 'COMPLIANCE_OFFICER'
    }, ukComplianceOfficer);

    // 3. Primary certifier attempts to independently verify their own certification -> DENY
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.independentlyVerifyCertification({
          certificationId: certified.id,
          verifierRole: 'INTERNAL_AUDITOR',
          verificationNotes: 'Self-audit attempt'
        }, ukComplianceOfficer); // Same user!
      },
      (err: Error) => err.message.includes('Segregation of Duties')
    );
  });

  test('GOV-20-TEST-09: AI and Service Principal Authority Denial (AI & Automation Cannot Certify or Verify)', async () => {
    await seedBaselineGovernanceEntities();

    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'Draft statement'
    }, ukComplianceOfficer);

    // 1. AI Agent attempts to certify -> DENY
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.certifyCompliance({
          certificationId: draft.id,
          certifierRole: 'AI_AGENT'
        }, aiAgentUser);
      },
      (err: Error) => err.message.includes('AI Boundary')
    );

    // 2. Service Principal attempts to attest control -> DENY
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.recordControlAttestation({
          controlId: 'ctl_annual_cs01_review',
          legalEntityId: 'LE-UK-001',
          jurisdiction: 'GB',
          attestorRole: 'SERVICE_PRINCIPAL',
          reportingPeriodStart: '2026-01-01T00:00:00Z',
          reportingPeriodEnd: '2026-12-31T23:59:59Z',
          operatingEffectiveness: 'EFFECTIVE',
          evidenceRecordIds: ['evi_cs01_receipt_2026'],
          policyVersionId: 'pol_ver_comp_001_v1'
        }, servicePrincipalUser);
      },
      (err: Error) => err.message.includes('Service Principal Boundary')
    );
  });

  test('GOV-20-TEST-10: Technical Admin Role Alone Grants No Compliance Certification Authority', async () => {
    await seedBaselineGovernanceEntities();

    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'Draft statement'
    }, ukComplianceOfficer);

    // Tech admin attempting certification without compliance role
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.certifyCompliance({
          certificationId: draft.id,
          certifierRole: 'TECH_ADMIN'
        }, techAdminUser);
      },
      (err: Error) => err.message.includes('Technical Admin Boundary')
    );
  });

  test('GOV-20-TEST-11: Open Material Findings Block Clean Certification; Valid Governed Exception Allows COMPLIANT_WITH_EXCEPTIONS', async () => {
    await seedBaselineGovernanceEntities();

    // 1. Register Open Critical Finding
    const finding: GovernanceFinding = {
      id: 'fnd_psc_missing_entry',
      findingNumber: 'FND-2026-0001',
      fingerprint: 'fp_fnd_psc_missing',
      legalEntityId: 'LE-UK-001',
      sourceType: 'COMPLIANCE_REVIEW',
      obligationId: 'obl_uk_cs01_2026',
      title: 'PSC Register Entry Missing for UK Holding Entity',
      description: 'Statutory PSC details not completely registered before filing submission.',
      severity: 'CRITICAL',
      status: 'OPEN',
      ownerUserId: obligationOwnerUser.id,
      openedAt: '2026-02-01T00:00:00Z',
      dueDate: '2026-06-30T00:00:00Z',
      evidenceIds: [],
      reopenHistory: [],
      auditCorrelationId: 'cor_fnd_01',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z'
    };
    await saveGovernanceFinding(finding, ukIndependentAuditor.id);

    // Readiness without exception -> NON_COMPLIANT
    const readinessWithoutEx = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readinessWithoutEx.blockingFindingsCount, 1);
    assert.equal(readinessWithoutEx.expectedResult, 'NON_COMPLIANT');

    // 2. Register Active Approved Exception with Decision
    const decision: CorporateDecision = {
      id: 'dec_board_exception_01',
      decisionNumber: 'DEC-2026-001',
      legalEntityId: 'LE-UK-001',
      title: 'Board Approved Temporary PSC Review Exception',
      decisionType: 'BOARD_RESOLUTION',
      decisionStatus: 'APPROVED',
      approvedAt: '2026-01-15T00:00:00Z',
      effectiveDate: '2026-01-15T00:00:00Z',
      auditCorrelationId: 'cor_dec_01',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z'
    };
    await saveCorporateDecision(decision, ukComplianceOfficer.id);

    const exception: GovernanceException = {
      id: 'exc_psc_temporary_waiver',
      exceptionNumber: 'EXC-2026-0001',
      exceptionType: 'POLICY_EXCEPTION',
      legalEntityId: 'LE-UK-001',
      sourceResourceType: 'COMPLIANCE_OBLIGATION',
      sourceResourceId: 'obl_uk_cs01_2026',
      requestedByUserId: obligationOwnerUser.id,
      requestedByRole: 'OPERATIONS_MANAGER',
      reason: 'Temporary PSC Clarification Window under Board Resolution DEC-2026-001',
      businessJustification: 'Formal exception granted while legal counsel finalizes trust deed review',
      riskSummary: 'PSC clarification in progress',
      riskRating: 'HIGH',
      status: 'APPROVED',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      supportingDecisionId: 'dec_board_exception_01',
      evidenceIds: ['evi_cs01_receipt_2026'],
      compensatingControls: [{
        controlId: 'ctl_annual_cs01_review',
        description: 'Manual review by compliance officer',
        isVerified: true
      }],
      isPermanent: false,
      auditCorrelationId: 'cor_exc_01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    await saveGovernanceException(exception, ukComplianceOfficer.id);

    const readinessWithEx = await ComplianceCertificationService.evaluateReadiness({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z'
    }, ukComplianceOfficer);

    assert.equal(readinessWithEx.validExceptionsCount, 1);
    assert.equal(readinessWithEx.expectedResult, 'COMPLIANT_WITH_EXCEPTIONS');
    assert.equal(readinessWithEx.readyForCertification, true);
  });

  test('GOV-20-TEST-12: Continuous Revalidation Triggers — GOV-18 Regulatory Change & GOV-19 Deficiency Reopen Certification', async () => {
    await seedBaselineGovernanceEntities();

    // 1. Establish initial certified compliance record
    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'Clean CS01 compliance.'
    }, ukComplianceOfficer);

    await ComplianceCertificationService.certifyCompliance({
      certificationId: draft.id,
      certifierRole: 'COMPLIANCE_OFFICER'
    }, ukComplianceOfficer);

    await ComplianceCertificationService.independentlyVerifyCertification({
      certificationId: draft.id,
      verifierRole: 'INTERNAL_AUDITOR',
      verificationNotes: 'Verified'
    }, ukIndependentAuditor);

    // 2. Trigger GOV-18 Material Regulatory Change Revalidation
    const revalidatedList = await ComplianceCertificationService.handleRegulatoryChangeTrigger(
      'RCH-2026-0042',
      'obl_uk_cs01_2026',
      'LE-UK-001',
      ukComplianceOfficer
    );

    assert.equal(revalidatedList.length, 1);
    assert.equal(revalidatedList[0].status, 'REVALIDATION_REQUIRED');
    assert.ok(revalidatedList[0].revalidationReason?.includes('RCH-2026-0042'));

    // 3. Trigger GOV-19 Regulatory Case Deficiency Reopen
    const reopenedList = await ComplianceCertificationService.handleRegulatoryCaseDeficiencyTrigger(
      'CAS-2026-0005',
      'obl_uk_cs01_2026',
      'LE-UK-001',
      ukComplianceOfficer
    );

    assert.equal(reopenedList.length, 1);
    assert.equal(reopenedList[0].status, 'REOPENED');
    assert.equal(reopenedList[0].certificationResult, 'NON_COMPLIANT');
    assert.equal(reopenedList[0].reopenHistory.length, 1);
  });

  test('GOV-20-TEST-13: Version Pinning & Deterministic Point-in-Time Historical Replay at Date T', async () => {
    await seedBaselineGovernanceEntities();

    // 1. Create and close V1 Certification
    const draftV1 = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      ruleVersion: 1,
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'V1 Statement'
    }, ukComplianceOfficer);

    await ComplianceCertificationService.certifyCompliance({
      certificationId: draftV1.id,
      certifierRole: 'COMPLIANCE_OFFICER'
    }, ukComplianceOfficer);

    await ComplianceCertificationService.independentlyVerifyCertification({
      certificationId: draftV1.id,
      verifierRole: 'INTERNAL_AUDITOR',
      verificationNotes: 'V1 Verified'
    }, ukIndependentAuditor);

    await ComplianceCertificationService.closeCertification(draftV1.id, 'V1 Closed', ukComplianceOfficer);

    // 2. Supersede V1 with V2
    const draftV2 = await ComplianceCertificationService.supersedeCertification(
      draftV1.id,
      {
        obligationId: 'obl_uk_cs01_2026',
        legalEntityId: 'LE-UK-001',
        jurisdiction: 'GB',
        policyVersionId: 'pol_ver_comp_001_v1',
        ruleVersion: 2,
        reportingPeriodStart: '2026-01-01T00:00:00Z',
        reportingPeriodEnd: '2026-12-31T23:59:59Z',
        certificationStatement: 'V2 Superseded Statement'
      },
      ukComplianceOfficer
    );

    assert.equal(draftV2.version, 2);
    assert.equal(draftV2.supersedesCertificationId, draftV1.id);

    // Check V1 status is SUPERSEDED
    const v1Updated = await getComplianceCertificationById(draftV1.id);
    assert.equal(v1Updated?.status, 'SUPERSEDED');
    assert.equal(v1Updated?.supersededByCertificationId, draftV2.id);

    // 3. Replay V1 at Point in Time
    const replay = await ComplianceCertificationService.replayCertificationAtPointInTime(
      draftV1.id,
      new Date().toISOString(),
      ukComplianceOfficer
    );

    assert.equal(replay.certificationId, draftV1.id);
    assert.ok(replay.evidenceSnapshotsAtTime.length >= 1);
    assert.ok(replay.controlSnapshotsAtTime.length >= 1);
    assert.ok(replay.filingSnapshotsAtTime.length >= 1);
  });

  test('GOV-20-TEST-14: Tenant Isolation & Export Authorization Security (View != Export)', async () => {
    await seedBaselineGovernanceEntities();

    const draft = await ComplianceCertificationService.createDraftCertification({
      obligationId: 'obl_uk_cs01_2026',
      legalEntityId: 'LE-UK-001',
      jurisdiction: 'GB',
      policyVersionId: 'pol_ver_comp_001_v1',
      reportingPeriodStart: '2026-01-01T00:00:00Z',
      reportingPeriodEnd: '2026-12-31T23:59:59Z',
      certificationStatement: 'Export security test'
    }, ukComplianceOfficer);

    // 1. Cross-entity access: KSA user attempts to access UK certification -> DENY
    await assert.rejects(
      async () => {
        await ComplianceCertificationService.exportCertificationPackage(draft.id, ksaComplianceOfficer);
      },
      (err: Error) => err.message.includes('Tenant Isolation')
    );

    // 2. View-only user without export permission attempts export -> DENY
    const viewOnlyUser: User = {
      id: 'usr_view_only_01',
      name: 'Observer',
      email: 'viewer@ajalogistics.co.uk',
      role: 'READ_ONLY',
      permissions: ['governance:certification:view'], // View only, no export
      legalEntityId: 'LE-UK-001',
      country: 'GB'
    };

    await assert.rejects(
      async () => {
        await ComplianceCertificationService.exportCertificationPackage(draft.id, viewOnlyUser);
      },
      (err: Error) => err.message.includes('governance:certification:export')
    );

    // 3. Authorized auditor with export permission -> ALLOW
    const exportResult = await ComplianceCertificationService.exportCertificationPackage(draft.id, ukIndependentAuditor);
    assert.equal(exportResult.certification.id, draft.id);
    assert.equal(exportResult.exporterId, ukIndependentAuditor.id);
  });
});
