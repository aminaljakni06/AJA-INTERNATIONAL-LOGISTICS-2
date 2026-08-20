/**
 * AJA INTERNATIONAL LOGISTICS — Regulatory Intelligence Repository
 * Step GOV-18: Regulatory Source Registry, Change Register, Impact Assessment & Adoption Plan Storage
 */

import {
  RegulatorySource,
  RegulatoryChange,
  RegulatoryImpactAssessment,
  RegulatoryAdoptionPlan,
  GovernanceJurisdiction,
  RegulatoryChangeLifecycleStatus,
  RegulatoryChangeMateriality
} from '../../types/corporateGovernance';
import crypto from 'crypto';

// In-Memory canonical stores with deterministic keying
const regulatorySourcesStore = new Map<string, RegulatorySource>();
const regulatoryChangesStore = new Map<string, RegulatoryChange>();
const impactAssessmentsStore = new Map<string, RegulatoryImpactAssessment>();
const adoptionPlansStore = new Map<string, RegulatoryAdoptionPlan>();

// Sequence counters for deterministic human-readable IDs
let regulatoryChangeSequence = 1;
let impactAssessmentSequence = 1;
let adoptionPlanSequence = 1;

export function computeRegulatorySha256(data: any): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ============================================================================
// REGULATORY SOURCE OPERATIONS
// ============================================================================

export async function saveRegulatorySource(source: RegulatorySource): Promise<RegulatorySource> {
  const cloned: RegulatorySource = JSON.parse(JSON.stringify(source));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeRegulatorySha256({
    id: cloned.id,
    sourceName: cloned.sourceName,
    authorityName: cloned.authorityName,
    jurisdiction: cloned.jurisdiction,
    officialDomain: cloned.officialDomain,
    trustClassification: cloned.trustClassification,
    verificationStatus: cloned.verificationStatus
  });
  regulatorySourcesStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatorySourceById(id: string): Promise<RegulatorySource | null> {
  const item = regulatorySourcesStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function listRegulatorySources(jurisdiction?: GovernanceJurisdiction): Promise<RegulatorySource[]> {
  const all = Array.from(regulatorySourcesStore.values()).map(s => JSON.parse(JSON.stringify(s)));
  if (!jurisdiction || jurisdiction === 'GLOBAL') return all;
  return all.filter(s => s.jurisdiction === jurisdiction || s.jurisdiction === 'GLOBAL');
}

export async function findRegulatorySourceByDomainOrRef(domain: string, ref: string): Promise<RegulatorySource | null> {
  for (const s of regulatorySourcesStore.values()) {
    if (s.officialDomain.toLowerCase() === domain.toLowerCase() && s.sourceReference.toLowerCase() === ref.toLowerCase()) {
      return JSON.parse(JSON.stringify(s));
    }
  }
  return null;
}

// ============================================================================
// REGULATORY CHANGE OPERATIONS
// ============================================================================

export async function generateRegulatoryChangeNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = String(regulatoryChangeSequence++).padStart(4, '0');
  return `RCH-${year}-${seq}`;
}

export async function saveRegulatoryChange(change: RegulatoryChange): Promise<RegulatoryChange> {
  const cloned: RegulatoryChange = JSON.parse(JSON.stringify(change));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeRegulatorySha256({
    id: cloned.id,
    changeNumber: cloned.changeNumber,
    sourceId: cloned.sourceId,
    jurisdiction: cloned.jurisdiction,
    regulator: cloned.regulator,
    title: cloned.title,
    changeType: cloned.changeType,
    publicationDate: cloned.publicationDate,
    effectiveDate: cloned.effectiveDate,
    lifecycleStatus: cloned.lifecycleStatus,
    fingerprintSha256: cloned.fingerprintSha256
  });
  regulatoryChangesStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatoryChangeById(id: string): Promise<RegulatoryChange | null> {
  const item = regulatoryChangesStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function getRegulatoryChangeByNumber(changeNumber: string): Promise<RegulatoryChange | null> {
  for (const c of regulatoryChangesStore.values()) {
    if (c.changeNumber === changeNumber) {
      return JSON.parse(JSON.stringify(c));
    }
  }
  return null;
}

export async function findRegulatoryChangeByFingerprint(fingerprintSha256: string): Promise<RegulatoryChange | null> {
  for (const c of regulatoryChangesStore.values()) {
    if (c.fingerprintSha256 === fingerprintSha256) {
      return JSON.parse(JSON.stringify(c));
    }
  }
  return null;
}

export async function listRegulatoryChanges(filters?: {
  jurisdiction?: GovernanceJurisdiction;
  lifecycleStatus?: RegulatoryChangeLifecycleStatus;
  materiality?: RegulatoryChangeMateriality;
}): Promise<RegulatoryChange[]> {
  let all = Array.from(regulatoryChangesStore.values()).map(c => JSON.parse(JSON.stringify(c)));
  if (filters?.jurisdiction && filters.jurisdiction !== 'GLOBAL') {
    all = all.filter(c => c.jurisdiction === filters.jurisdiction || c.jurisdiction === 'GLOBAL');
  }
  if (filters?.lifecycleStatus) {
    all = all.filter(c => c.lifecycleStatus === filters.lifecycleStatus);
  }
  if (filters?.materiality) {
    all = all.filter(c => c.materiality === filters.materiality);
  }
  return all;
}

// ============================================================================
// IMPACT ASSESSMENT OPERATIONS
// ============================================================================

export async function generateImpactAssessmentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = String(impactAssessmentSequence++).padStart(4, '0');
  return `RIA-${year}-${seq}`;
}

export async function saveRegulatoryImpactAssessment(assessment: RegulatoryImpactAssessment): Promise<RegulatoryImpactAssessment> {
  const cloned: RegulatoryImpactAssessment = JSON.parse(JSON.stringify(assessment));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeRegulatorySha256({
    id: cloned.id,
    assessmentNumber: cloned.assessmentNumber,
    regulatoryChangeId: cloned.regulatoryChangeId,
    legalEntityId: cloned.legalEntityId,
    jurisdiction: cloned.jurisdiction,
    materialityScore: cloned.materialityScore,
    gapsCount: cloned.gaps.length,
    preparedAtUtc: cloned.preparedAtUtc
  });
  impactAssessmentsStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatoryImpactAssessmentById(id: string): Promise<RegulatoryImpactAssessment | null> {
  const item = impactAssessmentsStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function listImpactAssessmentsByChangeId(regulatoryChangeId: string): Promise<RegulatoryImpactAssessment[]> {
  return Array.from(impactAssessmentsStore.values())
    .filter(a => a.regulatoryChangeId === regulatoryChangeId)
    .map(a => JSON.parse(JSON.stringify(a)));
}

export async function listImpactAssessmentsByEntity(legalEntityId: string): Promise<RegulatoryImpactAssessment[]> {
  return Array.from(impactAssessmentsStore.values())
    .filter(a => a.legalEntityId === legalEntityId)
    .map(a => JSON.parse(JSON.stringify(a)));
}

// ============================================================================
// ADOPTION PLAN OPERATIONS
// ============================================================================

export async function generateAdoptionPlanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = String(adoptionPlanSequence++).padStart(4, '0');
  return `RAP-${year}-${seq}`;
}

export async function saveRegulatoryAdoptionPlan(plan: RegulatoryAdoptionPlan): Promise<RegulatoryAdoptionPlan> {
  const cloned: RegulatoryAdoptionPlan = JSON.parse(JSON.stringify(plan));
  cloned.updatedAtUtc = new Date().toISOString();
  cloned.integrityHashSha256 = computeRegulatorySha256({
    id: cloned.id,
    planNumber: cloned.planNumber,
    regulatoryChangeId: cloned.regulatoryChangeId,
    impactAssessmentId: cloned.impactAssessmentId,
    legalEntityId: cloned.legalEntityId,
    status: cloned.status,
    targetCompletionDate: cloned.targetCompletionDate
  });
  adoptionPlansStore.set(cloned.id, cloned);
  return cloned;
}

export async function getRegulatoryAdoptionPlanById(id: string): Promise<RegulatoryAdoptionPlan | null> {
  const item = adoptionPlansStore.get(id);
  if (!item) return null;
  return JSON.parse(JSON.stringify(item));
}

export async function listAdoptionPlansByEntity(legalEntityId: string): Promise<RegulatoryAdoptionPlan[]> {
  return Array.from(adoptionPlansStore.values())
    .filter(p => p.legalEntityId === legalEntityId)
    .map(p => JSON.parse(JSON.stringify(p)));
}

// ============================================================================
// SEED CANONICAL REGULATORY SOURCES
// ============================================================================

export function seedCanonicalRegulatorySources(): void {
  const now = new Date().toISOString();
  
  const sources: RegulatorySource[] = [
    {
      id: 'RSC-GB-COMPANIES-ACT-2006',
      sourceName: 'UK Companies Act 2006 & Economic Crime and Corporate Transparency Act 2023',
      sourceType: 'PRIMARY_LEGISLATION',
      authorityName: 'Companies House / UK Parliament',
      jurisdiction: 'GB',
      officialDomain: 'legislation.gov.uk',
      sourceReference: 'c. 46 (2006) / c. 56 (2023)',
      sourceLocation: 'https://www.legislation.gov.uk/ukpga/2006/46/contents',
      language: 'en',
      trustClassification: 'OFFICIAL_LEGISLATION',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: 'SYSTEM_BOOTSTRAP',
      verifiedAtUtc: now,
      verificationNotes: 'Verified against UK National Archives Official Legislation Portal.',
      active: true,
      integrityHashSha256: computeRegulatorySha256('RSC-GB-COMPANIES-ACT-2006'),
      createdAtUtc: now,
      updatedAtUtc: now
    },
    {
      id: 'RSC-GB-HMRC-CORP-TAX',
      sourceName: 'HMRC Corporate Tax, Transfer Pricing & VAT Statutory Regulations',
      sourceType: 'REGULATOR_RULEBOOK',
      authorityName: 'HM Revenue & Customs (HMRC)',
      jurisdiction: 'GB',
      officialDomain: 'gov.uk',
      sourceReference: 'CTA 2010 / VATA 1994',
      sourceLocation: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
      language: 'en',
      trustClassification: 'OFFICIAL_REGULATOR',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: 'SYSTEM_BOOTSTRAP',
      verifiedAtUtc: now,
      verificationNotes: 'Verified against UK Government Digital Service HMRC authoritative portal.',
      active: true,
      integrityHashSha256: computeRegulatorySha256('RSC-GB-HMRC-CORP-TAX'),
      createdAtUtc: now,
      updatedAtUtc: now
    },
    {
      id: 'RSC-GB-ICO-GDPR',
      sourceName: 'UK General Data Protection Regulation & Data Protection Act 2018',
      sourceType: 'PRIMARY_LEGISLATION',
      authorityName: 'Information Commissioner’s Office (ICO)',
      jurisdiction: 'GB',
      officialDomain: 'ico.org.uk',
      sourceReference: 'DPA 2018 / UK GDPR Keeling Schedule',
      sourceLocation: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/',
      language: 'en',
      trustClassification: 'OFFICIAL_REGULATOR',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: 'SYSTEM_BOOTSTRAP',
      verifiedAtUtc: now,
      verificationNotes: 'Verified against ICO regulatory statutory guidance repository.',
      active: true,
      integrityHashSha256: computeRegulatorySha256('RSC-GB-ICO-GDPR'),
      createdAtUtc: now,
      updatedAtUtc: now
    },
    {
      id: 'RSC-SA-ZATCA-EINV',
      sourceName: 'ZATCA E-Invoicing (FATOORAH Phase 2) & VAT Implementing Regulations',
      sourceType: 'REGULATOR_RULEBOOK',
      authorityName: 'Zakat, Tax and Customs Authority (ZATCA)',
      jurisdiction: 'SA',
      officialDomain: 'zatca.gov.sa',
      sourceReference: 'ZATCA-EINV-RES-2021-01',
      sourceLocation: 'https://zatca.gov.sa/ar/E-Invoicing/Pages/default.aspx',
      language: 'ar',
      trustClassification: 'OFFICIAL_REGULATOR',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: 'SYSTEM_BOOTSTRAP',
      verifiedAtUtc: now,
      verificationNotes: 'Verified against Kingdom of Saudi Arabia ZATCA official portal.',
      active: true,
      integrityHashSha256: computeRegulatorySha256('RSC-SA-ZATCA-EINV'),
      createdAtUtc: now,
      updatedAtUtc: now
    },
    {
      id: 'RSC-SA-TGA-LOGISTICS',
      sourceName: 'Transport General Authority (TGA) Logistics & Freight Licensing Regulations',
      sourceType: 'REGULATOR_RULEBOOK',
      authorityName: 'Transport General Authority (TGA)',
      jurisdiction: 'SA',
      officialDomain: 'tga.gov.sa',
      sourceReference: 'TGA-REG-2023-FRT',
      sourceLocation: 'https://tga.gov.sa/regulations',
      language: 'ar',
      trustClassification: 'OFFICIAL_REGULATOR',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: 'SYSTEM_BOOTSTRAP',
      verifiedAtUtc: now,
      verificationNotes: 'Verified against Saudi Transport General Authority statutory repository.',
      active: true,
      integrityHashSha256: computeRegulatorySha256('RSC-SA-TGA-LOGISTICS'),
      createdAtUtc: now,
      updatedAtUtc: now
    },
    {
      id: 'RSC-SA-SDAIA-PDPL',
      sourceName: 'Saudi Personal Data Protection Law (PDPL) & Executive Regulations',
      sourceType: 'PRIMARY_LEGISLATION',
      authorityName: 'Saudi Data and AI Authority (SDAIA)',
      jurisdiction: 'SA',
      officialDomain: 'sdaia.gov.sa',
      sourceReference: 'Royal Decree M/19 (1443H) amended by M/148 (1444H)',
      sourceLocation: 'https://sdaia.gov.sa/en/SDAIA/about/Pages/PDPL.aspx',
      language: 'ar',
      trustClassification: 'OFFICIAL_LEGISLATION',
      verificationStatus: 'VERIFIED',
      verifiedByUserId: 'SYSTEM_BOOTSTRAP',
      verifiedAtUtc: now,
      verificationNotes: 'Verified against official Umm Al-Qura Gazette and SDAIA publication.',
      active: true,
      integrityHashSha256: computeRegulatorySha256('RSC-SA-SDAIA-PDPL'),
      createdAtUtc: now,
      updatedAtUtc: now
    }
  ];

  for (const s of sources) {
    regulatorySourcesStore.set(s.id, s);
  }
}

// Auto-seed bootstrap sources on module load
seedCanonicalRegulatorySources();
