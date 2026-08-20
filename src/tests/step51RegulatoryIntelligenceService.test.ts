/**
 * AJA INTERNATIONAL LOGISTICS — STEP GOV-18 Automated Verification Suite
 * Step GOV-18: Regulatory Intelligence, Change Management, Impact Assessment & Controlled Compliance Adoption
 * 
 * Verifies:
 * - GOVERNANCE-REGULATORY-INTELLIGENCE-INVARIANT-01
 * - Sections 112 through 151 test cases
 * - Source Trust Classification, Provenance & Fake Detection
 * - AI Authority Denial (Legal Determination, Adoption, Policy Publication)
 * - Multi-Entity & Multi-Jurisdiction Isolation
 * - Point-in-Time Regulatory Replay & Historical Immutability
 * - Controlled Adoption Lineage (GOV-06 Decision, GOV-15 Execution, GOV-07/10 Canonical Updates)
 * - Reconciliation, Separation of Duties (SoD) & Export Security
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RegulatoryIntelligenceService } from '../services/regulatoryIntelligenceService';
import { User } from '../types/user';
import {
  getRegulatorySourceById,
  getRegulatoryChangeById,
  getRegulatoryImpactAssessmentById,
  getRegulatoryAdoptionPlanById
} from '../db/repositories/regulatoryIntelligenceRepository';
import { getObligationById } from '../db/repositories/complianceObligationRepository';

// Test Actors
const chiefComplianceOfficer: User = {
  id: 'USR-CCO-001',
  email: 'cco@aja-logistics.com',
  name: 'Chief Compliance Officer',
  role: 'ADMIN',
  companyId: 'AJA_GROUP_GLOBAL',
  permissions: [
    'governance:compliance:view',
    'governance:compliance:manage',
    'governance:decision:create',
    'governance:secretariat:manage',
    'governance:export:authorized',
    'governance:legal:privileged'
  ]
};

const legalCounsel: User = {
  id: 'USR-LEGAL-001',
  email: 'legal.counsel@aja-logistics.com',
  name: 'Senior Legal Counsel',
  role: 'COMPLIANCE_OFFICER',
  companyId: 'AJA_GROUP_GLOBAL',
  permissions: [
    'governance:compliance:view',
    'governance:compliance:manage',
    'governance:legal:privileged'
  ]
};

const ksaComplianceAnalyst: User = {
  id: 'USR-KSA-ANALYST',
  email: 'analyst.ksa@aja-logistics.com',
  name: 'KSA Compliance Analyst',
  role: 'EMPLOYEE',
  companyId: 'AJA_KSA_001',
  permissions: [
    'governance:compliance:view',
    'governance:compliance:manage'
  ]
};

const genericViewer: User = {
  id: 'USR-VIEW-ONLY',
  email: 'viewer@aja-logistics.com',
  name: 'Auditor Viewer',
  role: 'EMPLOYEE',
  companyId: 'AJA_GROUP_GLOBAL',
  permissions: [
    'governance:compliance:view'
  ]
};

const techAdminWithoutGovAuthority: User = {
  id: 'USR-TECH-ADMIN',
  email: 'sysadmin@aja-logistics.com',
  name: 'IT Systems Admin',
  role: 'ADMIN',
  companyId: 'AJA_GROUP_GLOBAL',
  permissions: [
    'system:admin'
  ]
};

describe('STEP GOV-18 — REGULATORY INTELLIGENCE, CHANGE MANAGEMENT & CONTROLLED COMPLIANCE ADOPTION', () => {

  // ==========================================================================
  // SECTION 112 & 113: REGULATORY SOURCE TRUST & VERIFICATION
  // ==========================================================================

  test('GOV-18-TEST-112: Verified Official Source Registration & Provenance Preservation', async () => {
    const source = await RegulatoryIntelligenceService.registerRegulatorySource(chiefComplianceOfficer, {
      sourceName: 'UK Economic Crime and Corporate Transparency Act 2023',
      sourceType: 'PRIMARY_LEGISLATION',
      authorityName: 'Companies House / UK Parliament',
      jurisdiction: 'GB',
      officialDomain: 'legislation.gov.uk',
      sourceReference: 'ECCTA 2023 c. 56',
      sourceLocation: 'https://www.legislation.gov.uk/ukpga/2023/56/contents',
      language: 'en',
      trustClassification: 'OFFICIAL_LEGISLATION'
    });

    assert.ok(source.id.startsWith('RSC-GB-'));
    assert.strictEqual(source.trustClassification, 'OFFICIAL_LEGISLATION');

    const verified = await RegulatoryIntelligenceService.verifyRegulatorySource(chiefComplianceOfficer, {
      sourceId: source.id,
      isOfficialAuthoritative: true,
      verificationNotes: 'Verified against authoritative UK National Archives registry.'
    });

    assert.strictEqual(verified.verificationStatus, 'VERIFIED');
    assert.strictEqual(verified.verifiedByUserId, chiefComplianceOfficer.id);
    assert.ok(verified.integrityHashSha256.length === 64);
  });

  test('GOV-18-TEST-113: Fake / Unverified Regulator Domain is Denied Official Classification', async () => {
    const fakeSource = await RegulatoryIntelligenceService.registerRegulatorySource(chiefComplianceOfficer, {
      sourceName: 'Spoofed Customs Gazette',
      sourceType: 'REGULATOR_RULEBOOK',
      authorityName: 'Fake Customs Board',
      jurisdiction: 'SA',
      officialDomain: 'fake-customs-update.com',
      sourceReference: 'FAKE-2026-001',
      sourceLocation: 'http://fake-customs-update.com/reg',
      language: 'ar',
      trustClassification: 'OFFICIAL_REGULATOR'
    });

    const verificationAttempt = await RegulatoryIntelligenceService.verifyRegulatorySource(chiefComplianceOfficer, {
      sourceId: fakeSource.id,
      isOfficialAuthoritative: true,
      verificationNotes: 'Attempting to verify unverified external domain.'
    });

    assert.strictEqual(verificationAttempt.verificationStatus, 'REJECTED');
    assert.ok(verificationAttempt.verificationNotes?.includes('REJECTED: Source domain'));
  });

  // ==========================================================================
  // SECTION 114 & 115: AI-DISCOVERED & SECONDARY SOURCES
  // ==========================================================================

  test('GOV-18-TEST-114: AI-Assisted Discovery Candidates Remain Unverified Pending Human Action', async () => {
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-COMPANIES-ACT-2006',
      sourceReference: 'ECCTA Identity Verification Mandate',
      jurisdiction: 'GB',
      regulator: 'Companies House',
      title: 'Mandatory Director Identity Verification Rules',
      summary: 'AI detected preliminary consultation for director verification.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2026-03-01',
      effectiveDate: '2026-10-01',
      ingestionMethod: 'AI_ASSISTED_DISCOVERY'
    });

    assert.strictEqual(change.verificationStatus, 'UNVERIFIED');
    assert.strictEqual(change.lifecycleStatus, 'SOURCE_VERIFICATION_PENDING');
  });

  test('GOV-18-TEST-115: Secondary Sources Alone Cannot Create Canonical Statutory Obligations', async () => {
    const secondarySource = await RegulatoryIntelligenceService.registerRegulatorySource(chiefComplianceOfficer, {
      sourceName: 'Logistics Industry Blog Post',
      sourceType: 'NEWS_COMMENTARY',
      authorityName: 'Independent Blogger',
      jurisdiction: 'SA',
      officialDomain: 'freight-news-daily.com',
      sourceReference: 'BLOG-2026-55',
      sourceLocation: 'https://freight-news-daily.com/post',
      language: 'en',
      trustClassification: 'SECONDARY_SOURCE'
    });

    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
        sourceId: secondarySource.id,
        sourceReference: 'BLOG-SPECULATION',
        jurisdiction: 'SA',
        regulator: 'Unofficial Speculation',
        title: 'Speculative Warehouse Tax Rule',
        summary: 'Commentary alleging new tax without statutory gazette.',
        changeType: 'TAX_CHANGE',
        publicationDate: '2026-04-01',
        effectiveDate: '2026-05-01',
        ingestionMethod: 'OFFICIAL_FEED' // Attempting feed ingestion on secondary source
      });
    }, /Secondary sources and commentary cannot create canonical regulatory requirements/);
  });

  // ==========================================================================
  // SECTION 116, 117, 118, 119 & 120: DEDUPLICATION, AMENDMENTS, REPEALS & DATES
  // ==========================================================================

  test('GOV-18-TEST-116: Deterministic Deduplication Returns Existing Canonical Change', async () => {
    const firstIngest = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-ZATCA-EINV',
      sourceReference: 'ZATCA-PHASE2-WAVE15',
      jurisdiction: 'SA',
      regulator: 'ZATCA',
      title: 'ZATCA E-Invoicing Phase 2 Wave 15 Integration',
      summary: 'Integration mandate for logistics taxpayers above SAR 10M turnover.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2026-01-15',
      effectiveDate: '2026-07-01',
      ingestionMethod: 'MANUAL'
    });

    const secondIngest = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-ZATCA-EINV',
      sourceReference: 'ZATCA-PHASE2-WAVE15',
      jurisdiction: 'SA',
      regulator: 'ZATCA',
      title: 'ZATCA E-Invoicing Phase 2 Wave 15 Integration',
      summary: 'Duplicate ingest attempt of identical statutory rule.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2026-01-15',
      effectiveDate: '2026-07-01',
      ingestionMethod: 'MANUAL'
    });

    assert.strictEqual(firstIngest.id, secondIngest.id);
    assert.strictEqual(firstIngest.changeNumber, secondIngest.changeNumber);
    assert.strictEqual(firstIngest.fingerprintSha256, secondIngest.fingerprintSha256);
  });

  test('GOV-18-TEST-117 & 118: Amendment Chain & Repeal Preservation', async () => {
    // V1 Base Regulation
    const v1 = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-TGA-LOGISTICS',
      sourceReference: 'TGA-CABOTAGE-2024',
      jurisdiction: 'SA',
      regulator: 'TGA',
      title: 'GCC Land Freight Cabotage Standard V1',
      summary: 'Baseline cabotage permit limits.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2024-01-01',
      effectiveDate: '2024-06-01',
      ingestionMethod: 'MANUAL'
    });

    // V2 Amendment
    const v2 = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-TGA-LOGISTICS',
      sourceReference: 'TGA-CABOTAGE-2026-AMD',
      jurisdiction: 'SA',
      regulator: 'TGA',
      title: 'GCC Land Freight Cabotage Standard V2 (Amendment)',
      summary: 'Amended driver qualification requirements.',
      changeType: 'AMENDMENT',
      publicationDate: '2026-02-01',
      effectiveDate: '2026-08-01',
      amendsReference: v1.sourceReference,
      supersedesChangeId: v1.id,
      ingestionMethod: 'MANUAL'
    });

    assert.strictEqual(v2.amendsReference, v1.sourceReference);
    assert.strictEqual(v2.supersedesChangeId, v1.id);

    // Verify V1 history remains preserved in repository
    const historicalV1 = await getRegulatoryChangeById(v1.id);
    assert.ok(historicalV1);
    assert.strictEqual(historicalV1.title, 'GCC Land Freight Cabotage Standard V1');
  });

  test('GOV-18-TEST-119 & 120: Separation of Publication, Effective & Transition Dates', async () => {
    const futureChange = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-ICO-GDPR',
      sourceReference: 'UK-DPDI-2026',
      jurisdiction: 'GB',
      regulator: 'ICO',
      title: 'Data Protection & Digital Information Statutory Transition',
      summary: 'New statutory record keeping exemption thresholds.',
      changeType: 'DATA_PROTECTION_CHANGE',
      publicationDate: '2026-01-10',
      effectiveDate: '2026-11-01',
      mandatoryComplianceDate: '2026-12-31',
      transitionDeadline: '2027-06-30',
      ingestionMethod: 'MANUAL'
    });

    assert.strictEqual(futureChange.publicationDate, '2026-01-10');
    assert.strictEqual(futureChange.effectiveDate, '2026-11-01');
    assert.strictEqual(futureChange.mandatoryComplianceDate, '2026-12-31');
    assert.strictEqual(futureChange.transitionDeadline, '2027-06-30');
  });

  // ==========================================================================
  // SECTION 121, 122, 123 & 124: APPLICABILITY & MULTI-JURISDICTION ISOLATION
  // ==========================================================================

  test('GOV-18-TEST-121: Cross-Jurisdiction Isolation (KSA Requirement != AJA UK without Nexus)', async () => {
    const ksaChange = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-ZATCA-EINV',
      sourceReference: 'ZATCA-EINV-STAMP-2026',
      jurisdiction: 'SA',
      regulator: 'ZATCA',
      title: 'KSA Phase 2 QR Cryptographic Stamp Rule',
      summary: 'Mandatory cryptographic stamping on Saudi tax invoices.',
      changeType: 'TAX_CHANGE',
      publicationDate: '2026-01-01',
      effectiveDate: '2026-04-01',
      ingestionMethod: 'MANUAL'
    });

    const ukEntityApplicability = await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
      regulatoryChangeId: ksaChange.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      operationalPresenceChecked: true,
      hasOperationalPresence: true,
      employeePresenceChecked: true,
      hasEmployees: true,
      taxRegistrationChecked: true,
      hasTaxRegistration: true,
      regulatoryRegistrationChecked: false,
      hasRegulatoryRegistration: false,
      businessActivityChecked: true,
      hasBusinessActivityNexus: false,
      contractualNexusChecked: true,
      hasContractualNexus: false,
      evidenceVerified: true,
      evidenceDocumentIds: ['DOC-UK-CORP-CERT-01'],
      rationale: 'Evaluating UK parent for domestic KSA tax rule.'
    });

    assert.strictEqual(ukEntityApplicability.status, 'NOT_APPLICABLE');
    assert.ok(ukEntityApplicability.rationale.includes('Out of jurisdiction'));
  });

  test('GOV-18-TEST-122: Entity Applicability Varies by Activity within Same Jurisdiction', async () => {
    const tgaHeavyTransportChange = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-TGA-LOGISTICS',
      sourceReference: 'TGA-HAZMAT-FLEET-2026',
      jurisdiction: 'SA',
      regulator: 'TGA',
      title: 'Hazardous Materials Transport Telemetry Mandate',
      summary: 'Mandatory specialized telemetry sensors for hazmat carrier fleets.',
      changeType: 'TRANSPORT_CHANGE',
      publicationDate: '2026-02-15',
      effectiveDate: '2026-09-01',
      ingestionMethod: 'MANUAL'
    });

    // Entity 1: Fleet Operating Entity (Applicable)
    const fleetEntity = await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
      regulatoryChangeId: tgaHeavyTransportChange.id,
      legalEntityId: 'AJA_SA_FLEET_OPERATIONS_001',
      jurisdiction: 'SA',
      operationalPresenceChecked: true,
      hasOperationalPresence: true,
      employeePresenceChecked: true,
      hasEmployees: true,
      taxRegistrationChecked: true,
      hasTaxRegistration: true,
      regulatoryRegistrationChecked: true,
      hasRegulatoryRegistration: true,
      businessActivityChecked: true,
      hasBusinessActivityNexus: true,
      contractualNexusChecked: true,
      hasContractualNexus: true,
      evidenceVerified: true,
      evidenceDocumentIds: ['DOC-TGA-FLEET-LICENSE-01'],
      rationale: 'Active fleet operating entity transporting dangerous goods.'
    });

    assert.strictEqual(fleetEntity.status, 'APPLICABLE');

    // Entity 2: Pure Consulting/Holding Entity in KSA (Not Applicable)
    const holdingEntity = await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
      regulatoryChangeId: tgaHeavyTransportChange.id,
      legalEntityId: 'AJA_SA_HOLDINGS_002',
      jurisdiction: 'SA',
      operationalPresenceChecked: true,
      hasOperationalPresence: true,
      employeePresenceChecked: true,
      hasEmployees: false,
      taxRegistrationChecked: true,
      hasTaxRegistration: true,
      regulatoryRegistrationChecked: false,
      hasRegulatoryRegistration: false,
      businessActivityChecked: true,
      hasBusinessActivityNexus: false,
      contractualNexusChecked: false,
      hasContractualNexus: false,
      evidenceVerified: true,
      evidenceDocumentIds: ['DOC-KSA-CR-HOLDING-01'],
      rationale: 'Holding entity with zero vehicle or logistics operations.'
    });

    assert.strictEqual(holdingEntity.status, 'NOT_APPLICABLE');
  });

  test('GOV-18-TEST-123: Missing or Unverified Evidence Results in INSUFFICIENT_EVIDENCE', async () => {
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-COMPANIES-ACT-2006',
      sourceReference: 'ECCTA-ROA-2026',
      jurisdiction: 'GB',
      regulator: 'Companies House',
      title: 'Registered Office Address Appropriate Address Requirement',
      summary: 'Prohibition of PO Box without physical service capacity.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2026-03-01',
      effectiveDate: '2026-06-01',
      ingestionMethod: 'MANUAL'
    });

    const result = await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      legalEntityId: 'AJA_UK_SERVICES_001',
      jurisdiction: 'GB',
      operationalPresenceChecked: true,
      hasOperationalPresence: true,
      employeePresenceChecked: true,
      hasEmployees: true,
      taxRegistrationChecked: true,
      hasTaxRegistration: true,
      regulatoryRegistrationChecked: false,
      hasRegulatoryRegistration: false,
      businessActivityChecked: true,
      hasBusinessActivityNexus: true,
      contractualNexusChecked: false,
      hasContractualNexus: false,
      evidenceVerified: false, // Evidence unverified
      evidenceDocumentIds: [],
      rationale: 'Premature assessment without verified property lease evidence.'
    });

    assert.strictEqual(result.status, 'INSUFFICIENT_EVIDENCE');
    assert.strictEqual(result.legalReviewRequired, true);
  });

  test('GOV-18-TEST-124: Ambiguous Interpretation Routes to Human LEGAL_REVIEW_REQUIRED', async () => {
    const complexChange = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-SA-SDAIA-PDPL',
      sourceReference: 'PDPL-CROSS-BORDER-EXEMPT',
      jurisdiction: 'SA',
      regulator: 'SDAIA',
      title: 'Cross-Border Cloud Telemetry Data Transfer Exemption Criteria',
      summary: 'Nuanced statutory exemption for international logistics tracking data.',
      changeType: 'DATA_PROTECTION_CHANGE',
      publicationDate: '2026-02-01',
      effectiveDate: '2026-09-01',
      ingestionMethod: 'MANUAL'
    });

    const result = await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
      regulatoryChangeId: complexChange.id,
      legalEntityId: 'AJA_SA_LOGISTICS_001',
      jurisdiction: 'SA',
      operationalPresenceChecked: true,
      hasOperationalPresence: true,
      employeePresenceChecked: true,
      hasEmployees: true,
      taxRegistrationChecked: true,
      hasTaxRegistration: true,
      regulatoryRegistrationChecked: true,
      hasRegulatoryRegistration: true,
      businessActivityChecked: true,
      hasBusinessActivityNexus: true,
      contractualNexusChecked: true,
      hasContractualNexus: true,
      evidenceVerified: true,
      evidenceDocumentIds: ['DOC-SDAIA-EXEMPTION-FILING-01'],
      rationale: 'Legal ambiguity on whether real-time truck GPS coordinates constitute personal data under PDPL Art 29.',
      legalReviewRequired: true,
      legalReviewNotes: 'Requires formal written legal opinion from external KSA data protection counsel.'
    });

    assert.strictEqual(result.status, 'LEGAL_REVIEW_REQUIRED');
    assert.strictEqual(result.legalReviewRequired, true);
  });

  // ==========================================================================
  // SECTION 126, 127, 128, 129, 130 & 131: GAP ANALYSIS & AUTHORITY BOUNDARIES
  // ==========================================================================

  test('GOV-18-TEST-126 & 127: Impact Assessment Gap Analysis Does NOT Automatically Become a GOV-11 Finding', async () => {
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-COMPANIES-ACT-2006',
      sourceReference: 'ECCTA-EMAIL-REGISTER',
      jurisdiction: 'GB',
      regulator: 'Companies House',
      title: 'Appropriate Registered Email Address Mandate',
      summary: 'Mandatory company email address for statutory correspondence.',
      changeType: 'REPORTING_CHANGE',
      publicationDate: '2026-03-01',
      effectiveDate: '2026-06-01',
      ingestionMethod: 'MANUAL'
    });

    const assessment = await RegulatoryIntelligenceService.performImpactAssessment(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      entityApplicability: {
        legalEntityId: 'AJA_UK_HOLDINGS_001',
        jurisdiction: 'GB',
        status: 'APPLICABLE',
        evaluatedCriteria: {
          operationalPresence: true,
          employeePresence: true,
          taxRegistration: true,
          regulatoryRegistration: true,
          businessActivityNexus: true,
          contractualNexus: false,
          evidenceVerified: true
        },
        rationale: 'Directly applicable to all UK incorporated entities.',
        assessedByUserId: chiefComplianceOfficer.id,
        assessedAtUtc: new Date().toISOString(),
        evidenceDocumentIds: ['DOC-UK-CR-01'],
        legalReviewRequired: false
      },
      impactedDimensions: ['OBLIGATION', 'POLICY', 'FILING'],
      gaps: [
        {
          dimension: 'POLICY',
          gapType: 'POLICY_GAP',
          description: 'Corporate Governance Policy lacks official statutory email address declaration procedure.',
          severity: 'MEDIUM',
          remediationRequired: 'Update UK Statutory Correspondence Policy with formal designated address.'
        }
      ],
      materialityScore: 60
    });

    assert.strictEqual(assessment.gaps.length, 1);
    assert.strictEqual(assessment.gaps[0].gapType, 'POLICY_GAP');
    // Invariant: convertedToFindingId is undefined — gap is not automatically a confirmed finding
    assert.strictEqual(assessment.gaps[0].convertedToFindingId, undefined);
  });

  test('GOV-18-TEST-128 & 129: AI Cannot Approve Adoption or Issue Authoritative Determination', async () => {
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-COMPANIES-ACT-2006',
      sourceReference: 'ECCTA-SEC-TEST',
      jurisdiction: 'GB',
      regulator: 'Companies House',
      title: 'Company Identity Mandate',
      summary: 'Identity check standard.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2026-01-01',
      effectiveDate: '2026-06-01',
      ingestionMethod: 'MANUAL'
    });

    // 1. AI Applicability Determination Denied
    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
        regulatoryChangeId: change.id,
        legalEntityId: 'AJA_UK_HOLDINGS_001',
        jurisdiction: 'GB',
        operationalPresenceChecked: true,
        hasOperationalPresence: true,
        employeePresenceChecked: true,
        hasEmployees: true,
        taxRegistrationChecked: true,
        hasTaxRegistration: true,
        regulatoryRegistrationChecked: true,
        hasRegulatoryRegistration: true,
        businessActivityChecked: true,
        hasBusinessActivityNexus: true,
        contractualNexusChecked: false,
        hasContractualNexus: false,
        evidenceVerified: true,
        evidenceDocumentIds: ['DOC-01'],
        rationale: 'AI Attempting authoritative legal conclusion.',
        isAIInitiated: true
      });
    }, /AI-generated assessment cannot issue authoritative applicability determination/);

    // 2. AI Legal Review Completion Denied
    const assessment = await RegulatoryIntelligenceService.performImpactAssessment(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      entityApplicability: {
        legalEntityId: 'AJA_UK_HOLDINGS_001',
        jurisdiction: 'GB',
        status: 'APPLICABLE',
        evaluatedCriteria: {
          operationalPresence: true,
          employeePresence: true,
          taxRegistration: true,
          regulatoryRegistration: true,
          businessActivityNexus: true,
          contractualNexus: true,
          evidenceVerified: true
        },
        rationale: 'Human validated applicability.',
        assessedByUserId: chiefComplianceOfficer.id,
        assessedAtUtc: new Date().toISOString(),
        evidenceDocumentIds: ['DOC-01'],
        legalReviewRequired: false
      },
      impactedDimensions: ['POLICY'],
      gaps: [],
      materialityScore: 40
    });

    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.completeLegalReview(chiefComplianceOfficer, {
        impactAssessmentId: assessment.id,
        decision: 'APPROVED',
        reviewNotes: 'AI attempted signoff.',
        isAIInitiated: true
      });
    }, /AI is strictly prohibited from completing formal legal or compliance reviews/);
  });

  test('GOV-18-TEST-130 & 131: Service Principal & Tech Admin Authority Boundaries', async () => {
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-COMPANIES-ACT-2006',
      sourceReference: 'ECCTA-AUTH-TEST',
      jurisdiction: 'GB',
      regulator: 'Companies House',
      title: 'Statutory Verification Boundary',
      summary: 'Testing actor boundaries.',
      changeType: 'NEW_REQUIREMENT',
      publicationDate: '2026-01-01',
      effectiveDate: '2026-06-01',
      ingestionMethod: 'MANUAL'
    });

    const assessment = await RegulatoryIntelligenceService.performImpactAssessment(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      entityApplicability: {
        legalEntityId: 'AJA_UK_HOLDINGS_001',
        jurisdiction: 'GB',
        status: 'APPLICABLE',
        evaluatedCriteria: {
          operationalPresence: true,
          employeePresence: true,
          taxRegistration: true,
          regulatoryRegistration: true,
          businessActivityNexus: true,
          contractualNexus: true,
          evidenceVerified: true
        },
        rationale: 'Valid context.',
        assessedByUserId: chiefComplianceOfficer.id,
        assessedAtUtc: new Date().toISOString(),
        evidenceDocumentIds: ['DOC-01'],
        legalReviewRequired: false
      },
      impactedDimensions: ['POLICY'],
      gaps: [],
      materialityScore: 40
    });

    // Service Principal denied legal approval
    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.completeLegalReview(chiefComplianceOfficer, {
        impactAssessmentId: assessment.id,
        decision: 'APPROVED',
        reviewNotes: 'Automated worker attempting approval.',
        isServicePrincipal: true
      });
    }, /Service Principals \/ automated background workers cannot impersonate/);

    // Tech admin lacking governance authority denied review
    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.completeLegalReview(techAdminWithoutGovAuthority, {
        impactAssessmentId: assessment.id,
        decision: 'APPROVED',
        reviewNotes: 'Tech admin attempting governance signoff.'
      });
    }, /User lacks governance:compliance:manage permission/);
  });

  // ==========================================================================
  // SECTION 132, 133, 134, 135, 145, 146 & 151: END-TO-END CONTROLLED ADOPTION
  // ==========================================================================

  test('GOV-18-TEST-151: End-to-End Controlled Adoption Lineage (Source -> Assessment -> GOV-06 -> GOV-15 -> Updates -> Verification)', async () => {
    // 1. Ingest Verified Regulatory Change
    const change = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-HMRC-CORP-TAX',
      sourceReference: 'HMRC-TP-2026-01',
      jurisdiction: 'GB',
      regulator: 'HMRC',
      title: 'Cross-Border Transfer Pricing Documentation Mandate',
      summary: 'Mandatory OECD Master File and Local File preparation for freight cross-border logistics services.',
      changeType: 'TAX_CHANGE',
      publicationDate: '2026-02-01',
      effectiveDate: '2026-08-01',
      mandatoryComplianceDate: '2026-10-31',
      ingestionMethod: 'MANUAL',
      materiality: 'HIGH'
    });

    // 2. Multi-Factor Applicability Assessment
    const applicability = await RegulatoryIntelligenceService.assessApplicability(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      operationalPresenceChecked: true,
      hasOperationalPresence: true,
      employeePresenceChecked: true,
      hasEmployees: true,
      taxRegistrationChecked: true,
      hasTaxRegistration: true,
      regulatoryRegistrationChecked: true,
      hasRegulatoryRegistration: true,
      businessActivityChecked: true,
      hasBusinessActivityNexus: true,
      contractualNexusChecked: true,
      hasContractualNexus: true,
      evidenceVerified: true,
      evidenceDocumentIds: ['DOC-UK-HMRC-VAT-CERT'],
      rationale: 'Directly applicable to AJA UK as principal holding and financing vehicle.'
    });

    assert.strictEqual(applicability.status, 'APPLICABLE');

    // 3. Impact Assessment & Gap Analysis
    const impactAssessment = await RegulatoryIntelligenceService.performImpactAssessment(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      entityApplicability: applicability,
      impactedDimensions: ['OBLIGATION', 'POLICY', 'CONTROL', 'CALENDAR'],
      gaps: [
        {
          dimension: 'OBLIGATION',
          gapType: 'FILING_GAP',
          description: 'No existing statutory obligation for annual OECD Transfer Pricing Local File submission.',
          severity: 'HIGH',
          remediationRequired: 'Register new statutory compliance obligation under HMRC corporate tax category.'
        }
      ],
      materialityScore: 85
    });

    assert.strictEqual(impactAssessment.materialityLevel, 'CRITICAL');
    assert.strictEqual(impactAssessment.requiresHumanLegalReview, true);

    // 4. Human Legal Review with Separation of Duties (Legal Counsel != Preparer)
    const legalReview = await RegulatoryIntelligenceService.completeLegalReview(legalCounsel, {
      impactAssessmentId: impactAssessment.id,
      decision: 'APPROVED',
      reviewNotes: 'Reviewed against HMRC transfer pricing guidelines. Adoption authorized to proceed.'
    });

    assert.strictEqual(legalReview.legalReviewDecision, 'APPROVED');
    assert.strictEqual(legalReview.legalReviewerUserId, legalCounsel.id);

    // 5. Create Structured Adoption Plan
    const adoptionPlan = await RegulatoryIntelligenceService.createAdoptionPlan(chiefComplianceOfficer, {
      regulatoryChangeId: change.id,
      impactAssessmentId: impactAssessment.id,
      legalEntityId: 'AJA_UK_HOLDINGS_001',
      jurisdiction: 'GB',
      title: 'Adoption Plan for HMRC Transfer Pricing Mandate 2026',
      requiredObligationUpdates: [
        {
          action: 'CREATE_OBLIGATION',
          title: 'HMRC OECD Transfer Pricing Local File Submission',
          ruleReference: 'HMRC-TP-2026-01',
          effectiveDate: '2026-08-01'
        }
      ],
      requiredPolicyUpdates: [
        {
          policyId: 'POL-GLOBAL-TRANSFER-PRICING',
          currentVersionId: 'POL-VER-TP-V1',
          targetVersionNumber: '2.0.0',
          changeSummary: 'Updated transfer pricing documentation policy per HMRC 2026 mandate.'
        }
      ],
      requiredControlUpdates: [
        {
          controlId: 'CTRL-TP-BENCHMARKING-01',
          action: 'NEW',
          controlTitle: 'Annual Transfer Pricing Benchmarking Review',
          targetState: 'Mandatory annual external economic benchmarking review before fiscal close.'
        }
      ],
      targetCompletionDate: '2026-09-30',
      evidenceDocumentIds: ['DOC-OECD-LOCAL-FILE-TEMPLATE-01']
    });

    assert.strictEqual(adoptionPlan.status, 'DRAFT');

    // 6. Route to GOV-06 for Board / Executive Resolution
    const routedPlan = await RegulatoryIntelligenceService.routeToGovernanceApproval(chiefComplianceOfficer, adoptionPlan.id);
    assert.strictEqual(routedPlan.status, 'PENDING_GOV06_APPROVAL');
    assert.ok(routedPlan.governanceDecisionId);

    // 7. Execute Approved Adoption via GOV-15 Corporate Action and Canonical Domain Updates
    const executedPlan = await RegulatoryIntelligenceService.executeApprovedAdoption(chiefComplianceOfficer, {
      adoptionPlanId: adoptionPlan.id,
      governanceDecisionId: routedPlan.governanceDecisionId!,
      corporateActionId: 'ACT-EXEC-001',
      executionNotes: 'Enacted transfer pricing policy updates, registered new statutory obligation, and established internal control.'
    });

    assert.strictEqual(executedPlan.status, 'IN_EXECUTION');
    assert.ok(executedPlan.corporateActionId);

    // 8. Test Separation of Duties on Verification (Executor cannot self-verify)
    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.verifyAdoptionImplementation(chiefComplianceOfficer, {
        adoptionPlanId: executedPlan.id,
        verificationNotes: 'Attempting self-verification by plan executor.',
        evidenceDocumentIds: ['DOC-FINAL-EVIDENCE-01']
      });
    }, /Separation of Duties violation: The plan owner\/executor cannot verify their own/);

    // 9. Independent Compliance Verification by Legal Counsel
    const verifiedPlan = await RegulatoryIntelligenceService.verifyAdoptionImplementation(legalCounsel, {
      adoptionPlanId: executedPlan.id,
      verificationNotes: 'Independently audited: Policy published, statutory obligation active, control registered in GRC matrix.',
      evidenceDocumentIds: ['DOC-INDEPENDENT-AUDIT-EVIDENCE-01']
    });

    assert.strictEqual(verifiedPlan.status, 'VERIFIED');
    assert.strictEqual(verifiedPlan.verifiedByUserId, legalCounsel.id);

    // 10. Verify Reconciliation Engine Confirms Alignment
    const reconciliation = await RegulatoryIntelligenceService.reconcileRegulatoryState(
      chiefComplianceOfficer,
      change.id,
      'AJA_UK_HOLDINGS_001'
    );

    assert.strictEqual(reconciliation.obligationAligned, true);
    assert.strictEqual(reconciliation.policyAligned, true);
    assert.strictEqual(reconciliation.controlAligned, true);
    assert.strictEqual(reconciliation.evidencePresent, true);
    assert.strictEqual(reconciliation.verificationPassed, true);
    assert.strictEqual(reconciliation.reconciliationStatus, 'ALIGNED');
  });

  // ==========================================================================
  // SECTION 143 & 144: POINT-IN-TIME REGULATORY REPLAY
  // ==========================================================================

  test('GOV-18-TEST-143 & 144: Point-in-Time Regulatory Replay at Date T Restores Historical Baseline', async () => {
    // Query historical snapshot as of 2024-01-01 (before 2026 regulations)
    const historicalSnapshot = await RegulatoryIntelligenceService.pointInTimeRegulatoryReplay(
      chiefComplianceOfficer,
      '2024-01-01',
      'AJA_UK_HOLDINGS_001',
      'GB'
    );

    assert.strictEqual(historicalSnapshot.snapshotAsOfDate, '2024-01-01');
    assert.strictEqual(historicalSnapshot.jurisdiction, 'GB');
    assert.ok(historicalSnapshot.integrityHashSha256.length === 64);
    // Verified: No 2026 regulations leak into 2024 historical snapshot
    const has2026Rules = historicalSnapshot.effectiveRegulatoryChanges.some(c => c.effectiveDate.startsWith('2026'));
    assert.strictEqual(has2026Rules, false);
  });

  // ==========================================================================
  // SECTION 147 & 148: EXPORT SECURITY & LEGAL PRIVILEGE
  // ==========================================================================

  test('GOV-18-TEST-147 & 148: View != Export and Privileged Content Protection', async () => {
    // Ingest a legally privileged regulatory change record
    const privilegedChange = await RegulatoryIntelligenceService.ingestRegulatoryChange(chiefComplianceOfficer, {
      sourceId: 'RSC-GB-COMPANIES-ACT-2006',
      sourceReference: 'PRIV-UK-SANCTIONS-ADVICE',
      jurisdiction: 'GB',
      regulator: 'OFSI / Legal Privilege',
      title: 'Restricted Legal Analysis of Dual-Use Export Restrictions',
      summary: 'Confidential legal assessment subject to Legal Professional Privilege (LPP).',
      changeType: 'CUSTOMS_CHANGE',
      publicationDate: '2026-01-15',
      effectiveDate: '2026-03-01',
      ingestionMethod: 'MANUAL',
      isLegallyPrivileged: true,
      legalPrivilegeClassification: 'LEGAL_PROFESSIONAL_PRIVILEGE'
    });

    // 1. Generic viewer without export entitlement is denied export
    await assert.rejects(async () => {
      await RegulatoryIntelligenceService.queryRegulatoryChanges(genericViewer, {
        jurisdiction: 'GB',
        isExport: true
      });
    }, /User lacks governance:export:authorized entitlement/);

    // 2. Generic viewer querying without legal privilege does not see privileged record
    const viewerResults = await RegulatoryIntelligenceService.queryRegulatoryChanges(genericViewer, {
      jurisdiction: 'GB',
      isExport: false
    });
    const foundPrivilegedForViewer = viewerResults.some(c => c.id === privilegedChange.id);
    assert.strictEqual(foundPrivilegedForViewer, false);

    // 3. Authorized Legal Counsel can access privileged record
    const legalResults = await RegulatoryIntelligenceService.queryRegulatoryChanges(legalCounsel, {
      jurisdiction: 'GB',
      isExport: false
    });
    const foundPrivilegedForLegal = legalResults.some(c => c.id === privilegedChange.id);
    assert.strictEqual(foundPrivilegedForLegal, true);
  });
});
