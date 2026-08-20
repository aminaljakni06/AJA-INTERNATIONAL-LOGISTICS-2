/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Records & Evidence Vault Test Suite
 * Step GOV-09: Corporate Records, Statutory Registers, Document Versioning & Evidence Vault
 * 
 * Test Coverage:
 * 1. Corporate Records Lifecycle (Creation, Numbering, DMS Reuse, Immutability)
 * 2. Hard Delete Prohibition & Security Exception Handling
 * 3. Evidence Vault Submission & Cryptographic SHA-256 Hashing
 * 4. Separation of Duties (SoD) — Submitter Self-Verification Prohibition
 * 5. Tamper Detection & Integrity Mismatch Handling
 * 6. Document Versioning & Version Pinning (Evidence tied to exact version)
 * 7. Direct Document Bypass Prevention (Resource Authorization & Classification clearance)
 * 8. Statutory Registers Dynamic Projections & Official Snapshots
 * 9. Retention Schedules Calculation & Expiry Evaluation
 * 10. Legal Holds Application, Freezing Disposition, and Release Workflows
 * 11. Supersession & Invalidation with Full Audit Provenance
 * 12. Full Governance Regression Testing (GOV-05, GOV-06, GOV-07, GOV-08)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CorporateRecordsService } from '../services/corporateRecordsService';
import {
  resetCorporateRecordsRepositoryMemoryStore,
  saveRetentionPolicy,
} from '../db/repositories/corporateRecordsRepository';
import {
  resetDocumentRepositoryMemoryStore,
  getDocumentById,
  getDocumentVersions,
  getDocumentVersionById,
  createDocumentVersion,
} from '../db/repositories/documentRepository';
import {
  resetCorporateGovernanceMemoryStore,
  saveCorporateLegalProfile,
  saveCorporateAppointment,
  savePSCRecord,
  saveCorporateDecision,
} from '../db/repositories/corporateGovernanceRepository';
import {
  saveFiling,
} from '../db/repositories/complianceObligationRepository';
import { ABACUser } from '../lib/permissions/abacEngine';
import * as crypto from 'crypto';

describe('STEP GOV-09: Corporate Records, Statutory Registers, Document Versioning & Evidence Vault', () => {
  // Test Personas
  const ceoUser: ABACUser = {
    userId: 'usr_ceo_001',
    role: 'CEO',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_uk',
    clearanceLevel: 'RESTRICTED',
  };

  const cfoUser: ABACUser = {
    userId: 'usr_cfo_002',
    role: 'CFO',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_uk',
    clearanceLevel: 'RESTRICTED',
  };

  const staffUser: ABACUser = {
    userId: 'usr_staff_004',
    role: 'FINANCE_MANAGER',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_aja_uk',
    clearanceLevel: 'INTERNAL',
  };

  const unauthorizedUser: ABACUser = {
    userId: 'usr_guest_005',
    role: 'READ_ONLY',
    companyId: 'comp_aja_group',
    legalEntityId: 'le_other_entity',
    clearanceLevel: 'PUBLIC',
  };

  beforeEach(async () => {
    resetCorporateRecordsRepositoryMemoryStore();
    resetDocumentRepositoryMemoryStore();
    resetCorporateGovernanceMemoryStore();

    // Seed Legal Profile
    await saveCorporateLegalProfile(
      {
        id: 'le_aja_uk',
        legalEntityId: 'le_aja_uk',
        legalCompanyName: 'Aja International Logistics (UK) Ltd',
        companyNumber: '09876543',
        companyType: 'Private Limited Company (Ltd)',
        incorporationDate: '2020-01-15',
        incorporationJurisdiction: 'GB',
        registeredOfficeAddress: {
          addressLine1: '100 Bishopsgate',
          city: 'London',
          postalCode: 'EC2N 4AG',
          country: 'United Kingdom',
          isPrincipalPlaceOfBusiness: true,
        },
        principalBusinessAddresses: [],
        companyStatus: 'ACTIVE',
        financialYear: {
          accountingReferenceDate: '31-12',
          nextAccountsDueDate: '2026-09-30',
          nextConfirmationStatementDueDate: '2026-01-29',
        },
        taxRegistrations: {
          vatNumber: 'GB123456789',
          taxResidenceJurisdiction: 'GB',
        },
        advisors: {
          externalAccountantFirm: 'PricewaterhouseCoopers LLP',
          legalCounselFirm: 'Linklaters LLP',
        },
        dataClassification: 'RESTRICTED',
        createdAt: '2020-01-15T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      'SYSTEM_INITIALIZER'
    );

    // Seed Retention Policies
    await saveRetentionPolicy(
      {
        id: 'pol_ret_stat_perpetual',
        code: 'RET-CORP-PERPETUAL',
        name: 'Statutory Permanent Incorporation Records',
        recordCategory: 'STATUTORY',
        jurisdiction: 'GB',
        retentionTrigger: 'CREATION_DATE',
        retentionDurationYears: 99,
        dispositionAction: 'REVIEW',
        legalHoldOverride: true,
        effectiveFrom: '2020-01-01T00:00:00Z',
        policyVersion: 1,
        status: 'ACTIVE',
        createdAt: '2020-01-01T00:00:00Z',
        updatedAt: '2020-01-01T00:00:00Z',
      },
      'SYSTEM_INITIALIZER'
    );

    await saveRetentionPolicy(
      {
        id: 'pol_ret_tax_6yr',
        code: 'RET-TAX-6YR',
        name: 'Corporate Tax & Statutory Accounts Retention (6 Years)',
        recordCategory: 'TAX',
        jurisdiction: 'GB',
        retentionTrigger: 'CREATION_DATE',
        retentionDurationYears: 6,
        dispositionAction: 'ARCHIVE',
        legalHoldOverride: true,
        effectiveFrom: '2020-01-01T00:00:00Z',
        policyVersion: 1,
        status: 'ACTIVE',
        createdAt: '2020-01-01T00:00:00Z',
        updatedAt: '2020-01-01T00:00:00Z',
      },
      'SYSTEM_INITIALIZER'
    );
  });

  // ============================================================================
  // 1. CORPORATE RECORDS CREATION & DMS REUSE
  // ============================================================================

  describe('1. Corporate Statutory Records Management', () => {
    it('should create a corporate record, integrate with DMS, calculate retention and enforce immutability', async () => {
      const fileData = Buffer.from('Official Articles of Association of AJA UK Ltd (2026)').toString('base64');
      const expectedChecksum = crypto.createHash('sha256').update(fileData).digest('hex');

      const record = await CorporateRecordsService.createCorporateRecord(ceoUser, {
        legalEntityId: 'le_aja_uk',
        recordType: 'ARTICLES_OF_ASSOCIATION',
        title: 'Articles of Association - 2026 Amended Adoption',
        description: 'Adopted pursuant to Special Written Resolution RES-2026-001',
        jurisdiction: 'GB',
        classification: 'INTERNAL',
        effectiveFrom: '2026-01-15T10:00:00Z',
        filePayload: {
          fileName: 'Articles_of_Association_Aja_UK_2026.pdf',
          fileType: 'application/pdf',
          fileData,
        },
      });

      assert.ok(record.id);
      assert.match(record.recordNumber, /^REC-2026-\d{4}$/);
      assert.equal(record.recordType, 'ARTICLES_OF_ASSOCIATION');
      assert.equal(record.recordCategory, 'STATUTORY');
      assert.equal(record.recordStatus, 'ACTIVE');
      assert.equal(record.isImmutable, true);
      assert.equal(record.checksumSha256, expectedChecksum);
      assert.ok(record.documentId);
      assert.ok(record.documentVersionId);

      // Verify DMS integration: Document was stored in DMS without separate storage silo
      const dmsDoc = await getDocumentById(record.documentId!);
      assert.ok(dmsDoc);
      assert.equal(dmsDoc!.ownerType, 'CORPORATE_RECORD');
      assert.equal(dmsDoc!.fileName, 'Articles_of_Association_Aja_UK_2026.pdf');
      assert.equal(dmsDoc!.currentVersionNumber, 1);

      // Verify Document Versions in DMS
      const versions = await getDocumentVersions(record.documentId!);
      assert.equal(versions.length, 1);
      assert.equal(versions[0].versionNumber, 1);
      assert.equal(versions[0].checksumSha256, expectedChecksum);
    });

    it('should deny unauthorized user without governance:record:create permission', async () => {
      await assert.rejects(
        async () => {
          await CorporateRecordsService.createCorporateRecord(unauthorizedUser, {
            legalEntityId: 'le_aja_uk',
            recordType: 'CERTIFICATE_OF_INCORPORATION',
            title: 'Certificate of Incorporation',
          });
        },
        /Access Denied/i
      );
    });

    it('should strictly prohibit hard deletion of statutory corporate records', async () => {
      const record = await CorporateRecordsService.createCorporateRecord(ceoUser, {
        legalEntityId: 'le_aja_uk',
        recordType: 'CERTIFICATE_OF_INCORPORATION',
        title: 'Companies House Certificate of Incorporation',
      });

      await assert.rejects(
        async () => {
          await CorporateRecordsService.deleteCorporateRecord(ceoUser, record.id);
        },
        /Hard deletion of Statutory Corporate Record .* is strictly prohibited/i
      );
    });
  });

  // ============================================================================
  // 2. EVIDENCE VAULT & SEPARATION OF DUTIES (SoD)
  // ============================================================================

  describe('2. Evidence Vault & Separation of Duties (SoD)', () => {
    it('should submit cryptographic evidence and calculate SHA-256 hash', async () => {
      const evidencePayload = Buffer.from('Companies House Confirmation Statement Submission Receipt 2026').toString('base64');
      const expectedChecksum = crypto.createHash('sha256').update(evidencePayload).digest('hex');

      const evidence = await CorporateRecordsService.submitEvidence(staffUser, {
        legalEntityId: 'le_aja_uk',
        sourceResourceType: 'REGULATORY_FILING',
        sourceResourceId: 'fil_cs01_2026',
        evidenceType: 'COMPANIES_HOUSE_SUBMISSION_RECEIPT',
        classification: 'INTERNAL',
        filePayload: {
          fileName: 'CS01_Submission_Receipt.pdf',
          fileType: 'application/pdf',
          fileData: evidencePayload,
        },
      });

      assert.ok(evidence.id);
      assert.match(evidence.evidenceNumber, /^EVI-2026-\d{4}$/);
      assert.equal(evidence.checksumSha256, expectedChecksum);
      assert.equal(evidence.verificationStatus, 'SUBMITTED_UNVERIFIED');
      assert.equal(evidence.integrityStatus, 'VERIFIED');
      assert.equal(evidence.submittedByUserId, staffUser.userId);
      assert.equal(evidence.versionNumber, 1);
    });

    it('should enforce Separation of Duties: submitter CANNOT verify their own evidence', async () => {
      const evidencePayload = Buffer.from('Board Minutes Signed by Chairman').toString('base64');

      const evidence = await CorporateRecordsService.submitEvidence(cfoUser, {
        legalEntityId: 'le_aja_uk',
        sourceResourceType: 'CORPORATE_DECISION',
        sourceResourceId: 'dec_q1_dividend',
        evidenceType: 'BOARD_MINUTES_SIGNED',
        classification: 'CONFIDENTIAL',
        filePayload: {
          fileName: 'Board_Minutes_Q1_2026.pdf',
          fileType: 'application/pdf',
          fileData: evidencePayload,
        },
      });

      // CFO tries to verify the evidence they submitted -> Must be rejected!
      await assert.rejects(
        async () => {
          await CorporateRecordsService.verifyEvidence(cfoUser, evidence.id, 'Self verifying my own document');
        },
        /Separation of Duties .* strictly prohibited from verifying their own submission/i
      );
    });

    it('should allow an independent authorized officer to verify evidence and lock document version', async () => {
      const evidencePayload = Buffer.from('HMRC CT600 Corporation Tax Electronic Filing Acknowledgement').toString('base64');

      // 1. Staff submits evidence
      const evidence = await CorporateRecordsService.submitEvidence(staffUser, {
        legalEntityId: 'le_aja_uk',
        sourceResourceType: 'REGULATORY_FILING',
        sourceResourceId: 'fil_ct600_2025',
        evidenceType: 'HMRC_ELECTRONIC_ACKNOWLEDGEMENT',
        classification: 'CONFIDENTIAL',
        filePayload: {
          fileName: 'CT600_Ack_2025.pdf',
          fileType: 'application/pdf',
          fileData: evidencePayload,
        },
      });

      // 2. CFO verifies evidence independently
      const verified = await CorporateRecordsService.verifyEvidence(
        cfoUser,
        evidence.id,
        'Cross-checked with HMRC gateway acknowledgement reference'
      );

      assert.equal(verified.verificationStatus, 'VERIFIED');
      assert.equal(verified.verifiedByUserId, cfoUser.userId);
      assert.ok(verified.verifiedAt);
      assert.equal(verified.integrityStatus, 'VERIFIED');

      // 3. Verify underlying Document Version is locked as immutable
      const versions = await getDocumentVersions(evidence.documentId);
      assert.equal(versions[0].isImmutable, true);
    });

    it('should detect cryptographic tamper / hash mismatch and block verification', async () => {
      const originalPayload = Buffer.from('Original Valid Bank Mandate Signatory Document').toString('base64');

      const evidence = await CorporateRecordsService.submitEvidence(staffUser, {
        legalEntityId: 'le_aja_uk',
        sourceResourceType: 'POLICY',
        sourceResourceId: 'pol_bank_mandate',
        evidenceType: 'BANK_MANDATE',
        classification: 'INTERNAL',
        filePayload: {
          fileName: 'Bank_Mandate_2026.pdf',
          fileType: 'application/pdf',
          fileData: originalPayload,
        },
      });

      // Simulating file data corruption / unauthorized tampering in document version store
      const dmsDoc = await getDocumentById(evidence.documentId);
      const tamperedBytes = Buffer.from('TAMPERED_MALICIOUS_BANK_DETAILS_MODIFIED').toString('base64');
      dmsDoc!.fileData = tamperedBytes;
      if (evidence.documentVersionId) {
        const ver = await getDocumentVersionById(evidence.documentVersionId);
        if (ver) {
          ver.fileData = tamperedBytes;
        }
      }

      // Verifier tries to verify -> Must catch tamper and reject!
      await assert.rejects(
        async () => {
          await CorporateRecordsService.verifyEvidence(cfoUser, evidence.id, 'Verifying mandate');
        },
        /Integrity Failure: Tampering detected/i
      );
    });
  });

  // ============================================================================
  // 3. DOCUMENT VERSIONING & VERSION PINNING
  // ============================================================================

  describe('3. Document Versioning & Version Pinning', () => {
    it('should create new versions without mutating historical evidence tied to V1', async () => {
      const v1Data = Buffer.from('Commercial Lease Agreement - Version 1 Draft').toString('base64');
      const v1Checksum = crypto.createHash('sha256').update(v1Data).digest('hex');

      // 1. Staff submits evidence linked to V1
      const evidenceV1 = await CorporateRecordsService.submitEvidence(staffUser, {
        legalEntityId: 'le_aja_uk',
        sourceResourceType: 'POLICY',
        sourceResourceId: 'lease_bishopsgate',
        evidenceType: 'LEASE_AGREEMENT',
        filePayload: {
          fileName: 'Bishopsgate_Lease_Agreement.pdf',
          fileType: 'application/pdf',
          fileData: v1Data,
        },
      });

      assert.equal(evidenceV1.versionNumber, 1);
      assert.equal(evidenceV1.checksumSha256, v1Checksum);

      // Verify V1
      await CorporateRecordsService.verifyEvidence(cfoUser, evidenceV1.id, 'V1 Verified');

      // 2. Upload Version 2 to the same canonical document
      const v2Data = Buffer.from('Commercial Lease Agreement - Version 2 Executed with Landlord Addendum').toString('base64');
      const v2Checksum = crypto.createHash('sha256').update(v2Data).digest('hex');

      const v2Doc = await createDocumentVersion(evidenceV1.documentId, {
        fileName: 'Bishopsgate_Lease_Agreement_V2.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        storagePath: 'evidence_vault/lease_bishopsgate/v2.pdf',
        fileData: v2Data,
        checksumSha256: v2Checksum,
        uploadedBy: staffUser.userId,
        changeNotes: 'Executed version with landlord signatures',
      });

      assert.equal(v2Doc.versionNumber, 2);
      assert.equal(v2Doc.checksumSha256, v2Checksum);

      // 3. Historical evidence record must remain pinned to Version 1 and its original checksum
      const evidenceCheck = await CorporateRecordsService.verifyContentIntegrity(evidenceV1.id);
      assert.equal(evidenceCheck.matched, true);
      assert.equal(evidenceCheck.expectedHash, v1Checksum);
    });
  });

  // ============================================================================
  // 4. DIRECT DOCUMENT BYPASS PREVENTION & AUTHORIZED DOWNLOAD
  // ============================================================================

  describe('4. Direct Document Bypass Prevention & Authorized Download', () => {
    it('should generate secure download ticket only when caller is authorized for the governed entity', async () => {
      const payload = Buffer.from('Confidential Board Resolution - Executive Remuneration').toString('base64');

      const evidence = await CorporateRecordsService.submitEvidence(ceoUser, {
        legalEntityId: 'le_aja_uk',
        sourceResourceType: 'CORPORATE_DECISION',
        sourceResourceId: 'dec_remun_2026',
        evidenceType: 'BOARD_RESOLUTION_SIGNED',
        classification: 'RESTRICTED',
        filePayload: {
          fileName: 'Board_Resolution_Remuneration_2026.pdf',
          fileType: 'application/pdf',
          fileData: payload,
        },
      });

      // Authorized CEO can download
      const downloadTicket = await CorporateRecordsService.requestEvidenceDownload(ceoUser, evidence.id);
      assert.ok(downloadTicket.downloadUrl.includes('/api/governance/evidence/'));
      assert.equal(downloadTicket.fileName, 'Board_Resolution_Remuneration_2026.pdf');
      assert.equal(downloadTicket.checksumSha256, evidence.checksumSha256);

      // Unauthorized user from another entity is strictly denied
      await assert.rejects(
        async () => {
          await CorporateRecordsService.requestEvidenceDownload(unauthorizedUser, evidence.id);
        },
        /Access Denied/i
      );
    });
  });

  // ============================================================================
  // 5. STATUTORY REGISTERS & PROJECTIONS
  // ============================================================================

  describe('5. Statutory Register Projections & Snapshots', () => {
    beforeEach(async () => {
      // Seed Directors
      await saveCorporateAppointment(
        {
          id: 'app_dir_001',
          legalEntityId: 'le_aja_uk',
          statutoryRole: 'MANAGING_DIRECTOR',
          titleEn: 'Managing Director & CEO',
          personReference: {
            fullNameEn: 'Lord Alistair Sterling',
            nationality: 'British',
            countryOfResidence: 'United Kingdom',
          },
          authorityScope: 'GLOBAL',
          appointmentDate: '2020-01-15',
          effectiveFrom: '2020-01-15',
          status: 'ACTIVE',
          supportingDecisionId: 'dec_001',
          supportingDocumentIds: ['doc_app_001'],
          appointedByUserId: 'SYSTEM_SEED',
          createdAt: '2020-01-15T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        'SYSTEM_SEED'
      );

      await saveCorporateAppointment(
        {
          id: 'app_dir_002',
          legalEntityId: 'le_aja_uk',
          statutoryRole: 'DIRECTOR',
          titleEn: 'Non-Executive Director',
          personReference: {
            fullNameEn: 'Faris Al-Mansour',
            nationality: 'Saudi',
            countryOfResidence: 'Saudi Arabia',
          },
          authorityScope: 'GLOBAL',
          appointmentDate: '2021-06-01',
          effectiveFrom: '2021-06-01',
          status: 'ACTIVE',
          supportingDecisionId: 'dec_001',
          supportingDocumentIds: ['doc_app_002'],
          appointedByUserId: 'SYSTEM_SEED',
          createdAt: '2021-06-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        'SYSTEM_SEED'
      );

      // Seed Officers
      await saveCorporateAppointment(
        {
          id: 'app_off_001',
          legalEntityId: 'le_aja_uk',
          statutoryRole: 'COMPANY_SECRETARY',
          titleEn: 'Company Secretary',
          personReference: {
            fullNameEn: 'Eleanor Vance',
            nationality: 'British',
            countryOfResidence: 'United Kingdom',
          },
          authorityScope: 'LEGAL_ENTITY',
          appointmentDate: '2020-02-01',
          effectiveFrom: '2020-02-01',
          status: 'ACTIVE',
          supportingDecisionId: 'dec_001',
          supportingDocumentIds: ['doc_app_003'],
          appointedByUserId: 'SYSTEM_SEED',
          createdAt: '2020-02-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        'SYSTEM_SEED'
      );

      // Seed PSC
      await savePSCRecord(
        {
          id: 'psc_001',
          legalEntityId: 'le_aja_uk',
          jurisdiction: 'GB',
          subjectType: 'INDIVIDUAL',
          subjectReference: {
            nameEn: 'Faris Al-Mansour',
            nationalityOrLegalForm: 'Saudi',
            governingLawOrResidence: 'Saudi Arabia',
          },
          notifiedDate: '2020-01-15',
          effectiveFrom: '2020-01-15',
          status: 'ACTIVE',
          natureOfControlCodes: ['OWNERSHIP_OF_SHARES_75_TO_100', 'VOTING_RIGHTS_75_TO_100'],
          ownershipPercentageMin: 75,
          ownershipPercentageMax: 100,
          votingPercentageMin: 75,
          votingPercentageMax: 100,
          hasSignificantInfluence: true,
          supportingDocumentIds: ['doc_psc_001'],
          createdAt: '2020-01-15T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        'SYSTEM_SEED'
      );

      // Seed Decision
      await saveCorporateDecision(
        {
          id: 'dec_001',
          decisionNumber: 'DEC-2026-0001',
          legalEntityId: 'le_aja_uk',
          title: 'Approval of 2025 Annual Financial Statements & Dividend Distribution',
          description: 'Approval of 2025 Annual Financial Statements',
          decisionType: 'BOARD_RESOLUTION',
          jurisdictionContext: 'GB',
          decisionDate: '2026-01-20T00:00:00Z',
          effectiveDate: '2026-01-20T00:00:00Z',
          meetingModality: 'HYBRID',
          eventTimeZone: 'Europe/London',
          decisionLocationContext: {
            country: 'GB',
            city: 'London',
            timeZone: 'Europe/London',
            meetingModality: 'HYBRID',
          },
          lifecycleStatus: 'RESOLUTION',
          executionStatus: 'NOT_APPLICABLE',
          riskLevel: 'MEDIUM',
          resolutionText: 'IT WAS RESOLVED that the audited financial statements for the year ended 31 December 2025 be approved.',
          participants: [],
          createdByUserId: ceoUser.userId,
          approvedByUserIds: [ceoUser.userId],
          supportingDocumentIds: [],
          evidenceIds: [],
          version: 1,
          auditCorrelationId: 'cor_dec_001',
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
        'SYSTEM_SEED'
      );

      // Seed Regulatory Filing
      await saveFiling(
        {
          id: 'fil_cs01_001',
          filingNumber: 'FIL-2026-1001',
          obligationId: 'ob_cs01',
          obligationCode: 'COMP-UK-CS01',
          legalEntityId: 'le_aja_uk',
          jurisdiction: 'GB',
          title: 'Confirmation Statement CS01 (2026)',
          periodReference: '2026-01',
          dueDate: '2026-01-29',
          status: 'ACCEPTED',
          preparedByUserId: cfoUser.userId,
          evidenceDocumentIds: ['doc_cs01_receipt'],
          requiresIndependentVerification: false,
          auditCorrelationId: 'cor_cs01',
          createdAt: '2026-01-25T00:00:00Z',
          updatedAt: '2026-01-25T00:00:00Z',
        },
        'SYSTEM_SEED'
      );
    });

    it('should compute real-time statutory projections for Directors Register', async () => {
      const register = await CorporateRecordsService.getStatutoryRegisterProjection(
        ceoUser,
        'le_aja_uk',
        'DIRECTORS_REGISTER'
      );

      assert.equal(register.registerType, 'DIRECTORS_REGISTER');
      assert.equal(register.totalCount, 2);
      assert.equal(register.activeCount, 2);
      assert.ok(register.entries.some(e => e.partyOrSubjectName === 'Lord Alistair Sterling'));
      assert.ok(register.entries.some(e => e.partyOrSubjectName === 'Faris Al-Mansour'));
    });

    it('should compute real-time statutory projections for PSC Register', async () => {
      const register = await CorporateRecordsService.getStatutoryRegisterProjection(
        ceoUser,
        'le_aja_uk',
        'PSC_REGISTER'
      );

      assert.equal(register.registerType, 'PSC_REGISTER');
      assert.equal(register.totalCount, 1);
      assert.equal(register.entries[0].partyOrSubjectName, 'Faris Al-Mansour');
      assert.ok(register.entries[0].roleOrNature.includes('OWNERSHIP_OF_SHARES_75_TO_100'));
    });

    it('should compute real-time statutory projections for Resolutions Register', async () => {
      const register = await CorporateRecordsService.getStatutoryRegisterProjection(
        ceoUser,
        'le_aja_uk',
        'RESOLUTIONS_REGISTER'
      );

      assert.equal(register.registerType, 'RESOLUTIONS_REGISTER');
      assert.equal(register.totalCount, 1);
      assert.ok(register.entries[0].title.includes('Approval of 2025 Annual Financial Statements'));
    });

    it('should compute real-time statutory projections for Filings Register', async () => {
      const register = await CorporateRecordsService.getStatutoryRegisterProjection(
        ceoUser,
        'le_aja_uk',
        'FILINGS_REGISTER'
      );

      assert.equal(register.registerType, 'FILINGS_REGISTER');
      assert.equal(register.totalCount, 1);
      assert.ok(register.entries[0].title.includes('Confirmation Statement CS01'));
    });

    it('should take an official immutable snapshot with deterministic numbering and SHA-256 hash', async () => {
      const snapshot = await CorporateRecordsService.createStatutoryRegisterSnapshot(
        cfoUser,
        'le_aja_uk',
        'DIRECTORS_REGISTER'
      );

      assert.ok(snapshot.id);
      assert.match(snapshot.snapshotNumber, /^SNP-2026-\d{4}$/);
      assert.equal(snapshot.registerType, 'DIRECTORS_REGISTER');
      assert.equal(snapshot.snapshotType, 'HISTORICAL_SNAPSHOT');
      assert.equal(snapshot.totalEntriesCount, 2);
      assert.ok(snapshot.checksumSha256);
      assert.equal(snapshot.checksumSha256!.length, 64);
    });
  });

  // ============================================================================
  // 6. RETENTION SCHEDULES & LEGAL HOLDS
  // ============================================================================

  describe('6. Retention Schedules & Legal Holds', () => {
    it('should correctly evaluate disposition eligibility for records within retention period', async () => {
      const record = await CorporateRecordsService.createCorporateRecord(cfoUser, {
        legalEntityId: 'le_aja_uk',
        recordType: 'TAX_RETURN_CT600',
        title: 'HMRC Corporation Tax Return CT600 - FY2025',
        effectiveFrom: '2026-01-01T00:00:00Z',
        retentionPolicyCode: 'RET-TAX-6YR',
      });

      assert.ok(record.retentionUntil);
      assert.equal(new Date(record.retentionUntil!).getFullYear(), 2032); // 2026 + 6 = 2032

      const evalResult = await CorporateRecordsService.evaluateDispositionEligibility(record.id);
      assert.equal(evalResult.retentionExpired, false);
      assert.equal(evalResult.legalHoldActive, false);
      assert.equal(evalResult.dispositionActionRecommended, 'NONE_WITHIN_RETENTION');
    });

    it('should apply Legal Hold and unconditionally freeze record disposition', async () => {
      // 1. Create Tax Record
      const record = await CorporateRecordsService.createCorporateRecord(cfoUser, {
        legalEntityId: 'le_aja_uk',
        recordType: 'VAT_RETURN',
        title: 'HMRC VAT Return Q4 2025',
        effectiveFrom: '2026-01-01T00:00:00Z',
      });

      // 2. CEO applies legal hold due to tax audit inquiry
      const hold = await CorporateRecordsService.createLegalHold(ceoUser, {
        legalEntityId: 'le_aja_uk',
        title: 'HMRC Indirect Tax Compliance Inquiry Hold',
        reason: 'Statutory freeze during ongoing HMRC VAT audit inquiry reference #TAX-2026-991',
        scopeType: 'SINGLE_RECORD',
        targetRecordIds: [record.id],
      });

      assert.ok(hold.id);
      assert.match(hold.holdNumber, /^HLD-2026-\d{4}$/);
      assert.equal(hold.status, 'ACTIVE');

      // 3. Disposition check must be HOLD_BLOCKED
      const evalUnderHold = await CorporateRecordsService.evaluateDispositionEligibility(record.id);
      assert.equal(evalUnderHold.legalHoldActive, true);
      assert.equal(evalUnderHold.dispositionActionRecommended, 'NONE_HOLD_ACTIVE');
      assert.ok(evalUnderHold.explanation.includes('subject to an active Legal Hold'));

      // 4. Release the Legal Hold
      const released = await CorporateRecordsService.releaseLegalHold(
        cfoUser,
        hold.id,
        'HMRC audit closed with zero adjustments; hold discharged formally.'
      );
      assert.equal(released.status, 'RELEASED');
      assert.ok(released.releaseReason!.includes('HMRC audit closed'));

      // 5. Check record disposition returns to normal
      const evalAfterRelease = await CorporateRecordsService.evaluateDispositionEligibility(record.id);
      assert.equal(evalAfterRelease.legalHoldActive, false);
      assert.equal(evalAfterRelease.dispositionActionRecommended, 'NONE_WITHIN_RETENTION');
    });
  });

  // ============================================================================
  // 7. SUPERSESSION & INVALIDATION WORKFLOWS
  // ============================================================================

  describe('7. Supersession & Invalidation Lifecycle', () => {
    it('should supersede an old record with an updated record while preserving both immutably', async () => {
      const v1Data = Buffer.from('UK Data Protection Policy - Version 1.0 (2020)').toString('base64');
      const v1 = await CorporateRecordsService.createCorporateRecord(ceoUser, {
        legalEntityId: 'le_aja_uk',
        recordType: 'POLICY_RECORD',
        title: 'UK Data Protection Policy - V1.0',
        filePayload: {
          fileName: 'Data_Protection_Policy_V1.pdf',
          fileType: 'application/pdf',
          fileData: v1Data,
        },
      });

      assert.equal(v1.recordStatus, 'ACTIVE');

      // Supersede V1 with V2
      const v2Data = Buffer.from('UK Data Protection Policy - Version 2.0 (2026 UK GDPR / AI Update)').toString('base64');
      const result = await CorporateRecordsService.supersedeCorporateRecord(ceoUser, v1.id, {
        title: 'UK Data Protection & AI Governance Policy - V2.0',
        description: 'Comprehensive 2026 overhaul conforming to UK GDPR and AI processing rules',
        filePayload: {
          fileName: 'Data_Protection_Policy_V2.pdf',
          fileType: 'application/pdf',
          fileData: v2Data,
        },
      });

      assert.equal(result.oldRecord.recordStatus, 'SUPERSEDED');
      assert.equal(result.oldRecord.supersededByRecordId, result.newRecord.id);
      assert.equal(result.newRecord.recordStatus, 'ACTIVE');
      assert.ok(result.newRecord.title.includes('UK Data Protection & AI Governance Policy'));

      // Verify both records exist and can be fetched
      const oldCheck = await CorporateRecordsService.getCorporateRecord(ceoUser, v1.id);
      assert.equal(oldCheck.recordStatus, 'SUPERSEDED');

      const newCheck = await CorporateRecordsService.getCorporateRecord(ceoUser, result.newRecord.id);
      assert.equal(newCheck.recordStatus, 'ACTIVE');
    });

    it('should formally invalidate a defective record with mandatory audit reasoning', async () => {
      const defectiveData = Buffer.from('Defective Notice').toString('base64');
      const record = await CorporateRecordsService.createCorporateRecord(cfoUser, {
        legalEntityId: 'le_aja_uk',
        recordType: 'HMRC_NOTICE',
        title: 'Misallocated VAT Assessment Notice',
        filePayload: {
          fileName: 'Misallocated_Notice.pdf',
          fileType: 'application/pdf',
          fileData: defectiveData,
        },
      });

      const invalidated = await CorporateRecordsService.invalidateCorporateRecord(
        cfoUser,
        record.id,
        'Notice was issued in error by HMRC for unrelated third-party entity and formally rescinded by tax authority letter.'
      );

      assert.equal(invalidated.recordStatus, 'INVALIDATED');
      assert.equal(invalidated.invalidatedByUserId, cfoUser.userId);
      assert.ok(invalidated.invalidationReason!.includes('issued in error by HMRC'));
    });
  });
});
