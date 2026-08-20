/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Obligations & Filings Repository
 * Step GOV-07: Canonical Requirement Catalog, Obligations, Applicability, Filings & Monitoring Repository
 * 
 * Persistence & Scoping Architecture:
 * - Direct Firestore persistence with typed converters and fallback in-memory stores
 * - Multi-jurisdiction support (UK / GB, KSA / SA, UAE / AE, GLOBAL)
 * - 1:1 Legal Entity anchor and strict scoped queries
 * - Historical preservation: Hard delete strictly prohibited
 * - Deterministic sequence generation for regulatory filings
 */

import {
  ComplianceRequirementDefinition,
  ComplianceObligation,
  ApplicabilityAssessment,
  ComplianceWaiverRecord,
  RegulatoryFiling,
  FilingAttemptRecord,
  ComplianceMonitoringSignal,
  GovernanceJurisdiction,
  GovernanceRiskSeverity
} from '../../types/corporateGovernance';
import { adminFirestore as firestore } from '../../server/adminFirestoreCompat';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from '../../server/adminFirestoreCompat';
import { createAuditLog } from './auditLogRepository';
import { validateRequiredString, ValidationError } from '../validation';

// Firestore collection identifiers
export const COMPLIANCE_REQUIREMENTS_COLLECTION = 'compliance_requirement_definitions';
export const COMPLIANCE_OBLIGATIONS_COLLECTION = 'compliance_obligations';
export const APPLICABILITY_ASSESSMENTS_COLLECTION = 'compliance_applicability_assessments';
export const COMPLIANCE_WAIVERS_COLLECTION = 'compliance_waivers';
export const REGULATORY_FILINGS_COLLECTION = 'regulatory_filings';
export const FILING_ATTEMPTS_COLLECTION = 'filing_attempt_records';
export const COMPLIANCE_SIGNALS_COLLECTION = 'compliance_monitoring_signals';

// In-Memory Fallback Stores for resilient and ultra-fast scoped lookups
const inMemoryRequirements = new Map<string, ComplianceRequirementDefinition>();
const inMemoryObligations = new Map<string, ComplianceObligation>();
const inMemoryAssessments = new Map<string, ApplicabilityAssessment>();
const inMemoryWaivers = new Map<string, ComplianceWaiverRecord>();
const inMemoryFilings = new Map<string, RegulatoryFiling>();
const inMemoryFilingAttempts = new Map<string, FilingAttemptRecord>();
const inMemorySignals = new Map<string, ComplianceMonitoringSignal>();

/**
 * Reset in-memory repository caches (useful for isolated unit tests)
 */
export function resetComplianceRepositoryMemoryStore(): void {
  inMemoryRequirements.clear();
  inMemoryObligations.clear();
  inMemoryAssessments.clear();
  inMemoryWaivers.clear();
  inMemoryFilings.clear();
  inMemoryFilingAttempts.clear();
  inMemorySignals.clear();
  seedStandardRequirementDefinitions();
}

// ============================================================================
// 1. CANONICAL REQUIREMENT DEFINITIONS (CATALOG)
// ============================================================================

export const CANONICAL_REQUIREMENT_SEEDS: ComplianceRequirementDefinition[] = [
  // --- UK STATUTORY & TAX NEXUS ---
  {
    id: 'req_uk_cs01_confirmation_statement',
    code: 'REQ-UK-CS01',
    titleEn: 'Companies House Annual Confirmation Statement (CS01)',
    titleAr: 'بيان التأكيد السنوي لسجل الشركات البريطاني',
    description: 'Statutory obligation under Companies Act 2006 s.853A to verify PSC, registered office, officers, and share capital every 12 months.',
    jurisdiction: 'GB',
    regulatoryAuthority: 'Companies House',
    category: 'CORPORATE_STATUTORY',
    sourceCitation: 'Companies Act 2006, Section 853A; Small Business, Enterprise and Employment Act 2015',
    applicableEntityTypes: ['PRIVATE_LIMITED', 'PUBLIC_LIMITED'],
    defaultFrequency: 'ANNUAL',
    dueDateRule: {
      ruleType: 'RELATIVE_TO_EVENT_DAYS',
      offsetDaysOrMonths: 14 // Due 14 days after review period end
    },
    filingRequired: true,
    filingPortal: 'Companies House WebFiling / Find and update company information',
    evidenceRequired: true,
    defaultRiskLevel: 'HIGH',
    applicabilityCriteria: {
      requiresOperationalPresence: false,
      requiresEmployees: false,
      requiresTaxVatRegistration: false
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'req_uk_ct600_corp_tax',
    code: 'REQ-UK-CT600',
    titleEn: 'HMRC Corporation Tax Return & Computations (CT600)',
    titleAr: 'إقرار ضريبة الشركات السنوي - هيئة الإيرادات والجمارك البريطانية',
    description: 'Mandatory company tax return, iXBRL statutory accounts and computations under Corporation Tax Act 2010.',
    jurisdiction: 'GB',
    regulatoryAuthority: 'HM Revenue & Customs (HMRC)',
    category: 'TAX_AND_REVENUE',
    sourceCitation: 'Corporation Tax Act 2010 / Taxes Management Act 1970 Schedule 18',
    applicableEntityTypes: ['PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'PERMANENT_ESTABLISHMENT'],
    defaultFrequency: 'ANNUAL',
    dueDateRule: {
      ruleType: 'RELATIVE_TO_FYE_MONTHS',
      offsetDaysOrMonths: 12 // Due 12 months after accounting period end (Payment due 9m 1d)
    },
    filingRequired: true,
    filingPortal: 'HMRC Online Services for Corporation Tax',
    evidenceRequired: true,
    defaultRiskLevel: 'CRITICAL',
    applicabilityCriteria: {
      requiresTaxVatRegistration: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'req_uk_vat100_quarterly',
    code: 'REQ-UK-VAT100',
    titleEn: 'UK HMRC Making Tax Digital (MTD) VAT Return (VAT100)',
    titleAr: 'إقرار ضريبة القيمة المضافة الرقمي - بريطانيا',
    description: 'Quarterly electronic VAT return under Value Added Tax Act 1994 for businesses exceeding VAT threshold or voluntarily registered.',
    jurisdiction: 'GB',
    regulatoryAuthority: 'HM Revenue & Customs (HMRC)',
    category: 'TAX_AND_REVENUE',
    sourceCitation: 'Value Added Tax Act 1994 / VAT Regulations 1995 (SI 1995/2518)',
    applicableEntityTypes: ['PRIVATE_LIMITED', 'BRANCH_OFFICE'],
    defaultFrequency: 'QUARTERLY',
    dueDateRule: {
      ruleType: 'RELATIVE_TO_EVENT_DAYS',
      offsetDaysOrMonths: 37 // 1 calendar month + 7 days after period end
    },
    filingRequired: true,
    filingPortal: 'HMRC Making Tax Digital API',
    evidenceRequired: true,
    defaultRiskLevel: 'HIGH',
    applicabilityCriteria: {
      requiresTaxVatRegistration: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'req_uk_ico_data_protection',
    code: 'REQ-UK-ICO-DPA',
    titleEn: 'UK Information Commissioner (ICO) Data Protection Fee',
    titleAr: 'رسوم وتسجيل حماية البيانات - هيئة مفوض المعلومات البريطانية',
    description: 'Annual fee and registration under Data Protection (Charges and Information) Regulations 2018 for processing personal data.',
    jurisdiction: 'GB',
    regulatoryAuthority: 'Information Commissioner’s Office (ICO)',
    category: 'DATA_PROTECTION_GDPR',
    sourceCitation: 'Data Protection Act 2018 / UK GDPR / Data Protection Regulations 2018',
    applicableEntityTypes: ['PRIVATE_LIMITED', 'BRANCH_OFFICE'],
    defaultFrequency: 'ANNUAL',
    dueDateRule: {
      ruleType: 'FIXED_ANNUAL_DAY',
      fixedMonthDay: '12-31'
    },
    filingRequired: true,
    filingPortal: 'ICO Electronic Payment & Registration Portal',
    evidenceRequired: true,
    defaultRiskLevel: 'MEDIUM',
    applicabilityCriteria: {
      requiresRegulatedActivity: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'req_uk_elci_insurance',
    code: 'REQ-UK-ELCI',
    titleEn: 'UK Employers’ Liability Compulsory Insurance (ELCI)',
    titleAr: 'تأمين مسؤولية أصحاب العمل الإلزامي - بريطانيا',
    description: 'Mandatory statutory insurance policy covering minimum £5 million for UK-based employees.',
    jurisdiction: 'GB',
    regulatoryAuthority: 'Health and Safety Executive (HSE) / UK Statutory',
    category: 'INSURANCE_AND_LICENSING',
    sourceCitation: 'Employers’ Liability (Compulsory Insurance) Act 1969',
    applicableEntityTypes: ['PRIVATE_LIMITED', 'BRANCH_OFFICE'],
    defaultFrequency: 'ANNUAL',
    dueDateRule: {
      ruleType: 'CONTINUOUS'
    },
    filingRequired: false,
    evidenceRequired: true,
    defaultRiskLevel: 'HIGH',
    applicabilityCriteria: {
      requiresEmployees: true,
      requiresOperationalPresence: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // --- KSA STATUTORY, TAX & LOGISTICS NEXUS ---
  {
    id: 'req_sa_zatca_einvoicing',
    code: 'REQ-SA-ZATCA-EINV',
    titleEn: 'KSA ZATCA Fatoora Phase 2 Electronic Invoicing Integration',
    titleAr: 'الربط والتكامل مع منصة فاتورة المرحلة الثانية - هيئة الزكاة والضريبة والجمارك',
    description: 'Mandatory cryptographic clearance and reporting of B2B and B2C tax invoices under ZATCA E-Invoicing Regulations.',
    jurisdiction: 'SA',
    regulatoryAuthority: 'Zakat, Tax and Customs Authority (ZATCA)',
    category: 'TAX_AND_REVENUE',
    sourceCitation: 'KSA E-Invoicing Resolution (No. 01-04-20) / VAT Implementing Regulations',
    applicableEntityTypes: ['LIMITED_LIABILITY_COMPANY', 'BRANCH_OF_FOREIGN_COMPANY'],
    defaultFrequency: 'CONTINUOUS',
    dueDateRule: {
      ruleType: 'CONTINUOUS'
    },
    filingRequired: true,
    filingPortal: 'ZATCA Fatoora Portal / API Gateway',
    evidenceRequired: true,
    defaultRiskLevel: 'CRITICAL',
    applicabilityCriteria: {
      requiresOperationalPresence: true,
      requiresTaxVatRegistration: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'req_sa_zakat_tax_return',
    code: 'REQ-SA-ZAKAT-CIT',
    titleEn: 'KSA ZATCA Annual Zakat / Corporate Income Tax Declaration',
    titleAr: 'الإقرار السنوي للزكاة وضريبة الدخل - المملكة العربية السعودية',
    description: 'Mandatory annual declaration and audited financial submission within 120 days of fiscal year end.',
    jurisdiction: 'SA',
    regulatoryAuthority: 'Zakat, Tax and Customs Authority (ZATCA)',
    category: 'TAX_AND_REVENUE',
    sourceCitation: 'KSA Income Tax Law (Royal Decree M/1) & Zakat Implementing Regulations',
    applicableEntityTypes: ['LIMITED_LIABILITY_COMPANY', 'BRANCH_OF_FOREIGN_COMPANY'],
    defaultFrequency: 'ANNUAL',
    dueDateRule: {
      ruleType: 'RELATIVE_TO_FYE_MONTHS',
      offsetDaysOrMonths: 4 // 120 days after fiscal year end
    },
    filingRequired: true,
    filingPortal: 'ZATCA ERAD Portal',
    evidenceRequired: true,
    defaultRiskLevel: 'CRITICAL',
    applicabilityCriteria: {
      requiresOperationalPresence: true,
      requiresTaxVatRegistration: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'req_sa_customs_freight_license',
    code: 'REQ-SA-TGA-CUSTOMS',
    titleEn: 'KSA Transport General Authority (TGA) & Customs Logistics License',
    titleAr: 'ترخيص نشاط وسيط الشحن والخدمات اللوجستية - الهيئة العامة للنقل والجمارك',
    description: 'Mandatory operational carrier and forwarding licensing for freight handling in Saudi Arabia.',
    jurisdiction: 'SA',
    regulatoryAuthority: 'Transport General Authority (TGA) / ZATCA Customs',
    category: 'CUSTOMS_AND_MARITIME',
    sourceCitation: 'KSA Land Transport Law / TGA Regulations for Freight Forwarding',
    applicableEntityTypes: ['LIMITED_LIABILITY_COMPANY', 'BRANCH_OF_FOREIGN_COMPANY'],
    defaultFrequency: 'ANNUAL',
    dueDateRule: {
      ruleType: 'FIXED_ANNUAL_DAY',
      fixedMonthDay: '12-31'
    },
    filingRequired: true,
    filingPortal: 'TGA Naql Portal / Fasah Platform',
    evidenceRequired: true,
    defaultRiskLevel: 'HIGH',
    applicabilityCriteria: {
      requiresOperationalPresence: true,
      requiresCustomsRegistration: true,
      requiresRegulatedActivity: true
    },
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export function seedStandardRequirementDefinitions(): void {
  for (const seed of CANONICAL_REQUIREMENT_SEEDS) {
    if (!inMemoryRequirements.has(seed.id)) {
      inMemoryRequirements.set(seed.id, seed);
    }
  }
}

// Initial auto-seed
seedStandardRequirementDefinitions();

export async function getRequirementDefinitionById(
  id: string
): Promise<ComplianceRequirementDefinition | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryRequirements.has(cleanId)) {
    return inMemoryRequirements.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, COMPLIANCE_REQUIREMENTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ComplianceRequirementDefinition;
      inMemoryRequirements.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryRequirements.get(cleanId) || null;
  }

  return null;
}

export async function getRequirementDefinitionByCode(
  code: string
): Promise<ComplianceRequirementDefinition | null> {
  const cleanCode = validateRequiredString(code, 'code');
  for (const req of inMemoryRequirements.values()) {
    if (req.code === cleanCode) return req;
  }

  try {
    const q = query(
      collection(firestore, COMPLIANCE_REQUIREMENTS_COLLECTION),
      where('code', '==', cleanCode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as ComplianceRequirementDefinition;
      inMemoryRequirements.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function listRequirementDefinitions(
  jurisdiction?: GovernanceJurisdiction
): Promise<ComplianceRequirementDefinition[]> {
  const list = Array.from(inMemoryRequirements.values());
  if (jurisdiction && jurisdiction !== 'GLOBAL') {
    return list.filter((r) => r.jurisdiction === jurisdiction || r.jurisdiction === 'GLOBAL');
  }
  return list;
}

export async function saveRequirementDefinition(
  req: ComplianceRequirementDefinition,
  actorUserId: string
): Promise<ComplianceRequirementDefinition> {
  const cleanId = validateRequiredString(req.id, 'id');
  const now = new Date().toISOString();

  const updated: ComplianceRequirementDefinition = {
    ...req,
    id: cleanId,
    updatedAt: now,
    createdAt: req.createdAt || now
  };

  inMemoryRequirements.set(cleanId, updated);

  try {
    const docRef = doc(firestore, COMPLIANCE_REQUIREMENTS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: 'SAVE_COMPLIANCE_REQUIREMENT_DEFINITION',
    entityType: 'COMPLIANCE_REQUIREMENT',
    entityId: cleanId,
    metadata: {
      code: updated.code,
      jurisdiction: updated.jurisdiction,
      authority: updated.regulatoryAuthority
    }
  });

  return updated;
}

// ============================================================================
// 2. COMPLIANCE OBLIGATIONS (SCOPED TO LEGAL ENTITY)
// ============================================================================

export async function getObligationById(id: string): Promise<ComplianceObligation | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryObligations.has(cleanId)) {
    return inMemoryObligations.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, COMPLIANCE_OBLIGATIONS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ComplianceObligation;
      inMemoryObligations.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryObligations.get(cleanId) || null;
  }

  return null;
}

export async function getObligationByCodeAndEntity(
  code: string,
  legalEntityId: string
): Promise<ComplianceObligation | null> {
  const cleanCode = validateRequiredString(code, 'code');
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');

  for (const obl of inMemoryObligations.values()) {
    if (obl.code === cleanCode && obl.legalEntityId === cleanEntityId) {
      return obl;
    }
  }

  try {
    const q = query(
      collection(firestore, COMPLIANCE_OBLIGATIONS_COLLECTION),
      where('code', '==', cleanCode),
      where('legalEntityId', '==', cleanEntityId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data() as ComplianceObligation;
      inMemoryObligations.set(data.id, data);
      return data;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function listObligationsByEntity(
  legalEntityId: string,
  filter?: {
    jurisdiction?: GovernanceJurisdiction;
    status?: string;
    category?: string;
  }
): Promise<ComplianceObligation[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: ComplianceObligation[] = [];

  for (const obl of inMemoryObligations.values()) {
    if (obl.legalEntityId === cleanEntityId) {
      if (filter?.jurisdiction && obl.jurisdiction !== filter.jurisdiction && obl.jurisdiction !== 'GLOBAL') {
        continue;
      }
      if (filter?.status && obl.status !== filter.status) {
        continue;
      }
      if (filter?.category && obl.category !== filter.category) {
        continue;
      }
      results.push(obl);
    }
  }

  return results;
}

export async function saveObligation(
  obligation: ComplianceObligation,
  actorUserId: string
): Promise<ComplianceObligation> {
  const cleanId = validateRequiredString(obligation.id, 'id');
  const cleanEntityId = validateRequiredString(obligation.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previous = inMemoryObligations.get(cleanId);

  const updated: ComplianceObligation = {
    ...obligation,
    id: cleanId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: obligation.createdAt || previous?.createdAt || now
  };

  inMemoryObligations.set(cleanId, updated);

  try {
    const docRef = doc(firestore, COMPLIANCE_OBLIGATIONS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: previous ? 'UPDATE_COMPLIANCE_OBLIGATION' : 'CREATE_COMPLIANCE_OBLIGATION',
    entityType: 'COMPLIANCE_OBLIGATION',
    entityId: cleanId,
    metadata: {
      legalEntityId: cleanEntityId,
      code: updated.code,
      jurisdiction: updated.jurisdiction,
      applicabilityStatus: updated.applicabilityStatus,
      status: updated.status,
      auditCorrelationId: updated.auditCorrelationId
    }
  });

  return updated;
}

// ============================================================================
// 3. APPLICABILITY ASSESSMENTS
// ============================================================================

export async function getAssessmentById(id: string): Promise<ApplicabilityAssessment | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryAssessments.has(cleanId)) {
    return inMemoryAssessments.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, APPLICABILITY_ASSESSMENTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ApplicabilityAssessment;
      inMemoryAssessments.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryAssessments.get(cleanId) || null;
  }

  return null;
}

export async function listAssessmentsByObligation(
  obligationId: string
): Promise<ApplicabilityAssessment[]> {
  const cleanObligationId = validateRequiredString(obligationId, 'obligationId');
  return Array.from(inMemoryAssessments.values()).filter(
    (a) => a.obligationId === cleanObligationId
  );
}

export async function listAssessmentsByEntity(
  legalEntityId: string
): Promise<ApplicabilityAssessment[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  return Array.from(inMemoryAssessments.values()).filter(
    (a) => a.legalEntityId === cleanEntityId
  );
}

export async function saveAssessment(
  assessment: ApplicabilityAssessment,
  actorUserId: string
): Promise<ApplicabilityAssessment> {
  const cleanId = validateRequiredString(assessment.id, 'id');
  const cleanObligationId = validateRequiredString(assessment.obligationId, 'obligationId');
  const cleanEntityId = validateRequiredString(assessment.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previous = inMemoryAssessments.get(cleanId);

  const updated: ApplicabilityAssessment = {
    ...assessment,
    id: cleanId,
    obligationId: cleanObligationId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: assessment.createdAt || previous?.createdAt || now
  };

  inMemoryAssessments.set(cleanId, updated);

  try {
    const docRef = doc(firestore, APPLICABILITY_ASSESSMENTS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: 'RECORD_APPLICABILITY_ASSESSMENT',
    entityType: 'APPLICABILITY_ASSESSMENT',
    entityId: cleanId,
    metadata: {
      obligationId: cleanObligationId,
      legalEntityId: cleanEntityId,
      assessmentStatus: updated.assessmentStatus,
      rationale: updated.rationale,
      evidenceVerified: updated.criteria?.evidenceVerified,
      auditCorrelationId: updated.auditCorrelationId
    }
  });

  return updated;
}

// ============================================================================
// 4. COMPLIANCE WAIVERS
// ============================================================================

export async function getWaiverById(id: string): Promise<ComplianceWaiverRecord | null> {
  const cleanId = validateRequiredString(id, 'id');
  return inMemoryWaivers.get(cleanId) || null;
}

export async function getActiveWaiverForObligation(
  obligationId: string
): Promise<ComplianceWaiverRecord | null> {
  const cleanObligationId = validateRequiredString(obligationId, 'obligationId');
  const now = new Date().toISOString();

  for (const waiver of inMemoryWaivers.values()) {
    if (
      waiver.obligationId === cleanObligationId &&
      waiver.status === 'ACTIVE' &&
      waiver.effectiveFrom <= now &&
      waiver.effectiveUntil >= now
    ) {
      return waiver;
    }
  }

  return null;
}

export async function listWaiversByEntity(
  legalEntityId: string
): Promise<ComplianceWaiverRecord[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  return Array.from(inMemoryWaivers.values()).filter((w) => w.legalEntityId === cleanEntityId);
}

export async function saveWaiver(
  waiver: ComplianceWaiverRecord,
  actorUserId: string
): Promise<ComplianceWaiverRecord> {
  const cleanId = validateRequiredString(waiver.id, 'id');
  const cleanObligationId = validateRequiredString(waiver.obligationId, 'obligationId');
  const cleanEntityId = validateRequiredString(waiver.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previous = inMemoryWaivers.get(cleanId);

  const updated: ComplianceWaiverRecord = {
    ...waiver,
    id: cleanId,
    obligationId: cleanObligationId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: waiver.createdAt || previous?.createdAt || now
  };

  inMemoryWaivers.set(cleanId, updated);

  try {
    const docRef = doc(firestore, COMPLIANCE_WAIVERS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: updated.status === 'REVOKED' ? 'REVOKE_COMPLIANCE_WAIVER' : 'GRANT_COMPLIANCE_WAIVER',
    entityType: 'COMPLIANCE_WAIVER',
    entityId: cleanId,
    metadata: {
      obligationId: cleanObligationId,
      legalEntityId: cleanEntityId,
      supportingDecisionId: updated.supportingDecisionId,
      effectiveUntil: updated.effectiveUntil,
      status: updated.status
    }
  });

  return updated;
}

// ============================================================================
// 5. REGULATORY FILINGS & FILING ATTEMPTS
// ============================================================================

export async function getFilingById(id: string): Promise<RegulatoryFiling | null> {
  const cleanId = validateRequiredString(id, 'id');
  if (inMemoryFilings.has(cleanId)) {
    return inMemoryFilings.get(cleanId)!;
  }

  try {
    const docRef = doc(firestore, REGULATORY_FILINGS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as RegulatoryFiling;
      inMemoryFilings.set(cleanId, data);
      return data;
    }
  } catch {
    return inMemoryFilings.get(cleanId) || null;
  }

  return null;
}

export async function getFilingByNumber(filingNumber: string): Promise<RegulatoryFiling | null> {
  const cleanNumber = validateRequiredString(filingNumber, 'filingNumber');
  for (const filing of inMemoryFilings.values()) {
    if (filing.filingNumber === cleanNumber) return filing;
  }
  return null;
}

export async function listFilingsByEntity(
  legalEntityId: string,
  filter?: {
    jurisdiction?: GovernanceJurisdiction;
    status?: string;
    obligationId?: string;
  }
): Promise<RegulatoryFiling[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  const results: RegulatoryFiling[] = [];

  for (const filing of inMemoryFilings.values()) {
    if (filing.legalEntityId === cleanEntityId) {
      if (filter?.jurisdiction && filing.jurisdiction !== filter.jurisdiction && filing.jurisdiction !== 'GLOBAL') {
        continue;
      }
      if (filter?.status && filing.status !== filter.status) {
        continue;
      }
      if (filter?.obligationId && filing.obligationId !== filter.obligationId) {
        continue;
      }
      results.push(filing);
    }
  }

  return results;
}

export async function listRegulatoryFilingsByObligation(obligationId: string): Promise<RegulatoryFiling[]> {
  const cleanObligationId = validateRequiredString(obligationId, 'obligationId');
  const results: RegulatoryFiling[] = [];
  for (const filing of inMemoryFilings.values()) {
    if (filing.obligationId === cleanObligationId) {
      results.push(filing);
    }
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const saveRegulatoryFiling = saveFiling;

export async function saveFiling(
  filing: RegulatoryFiling,
  actorUserId: string
): Promise<RegulatoryFiling> {
  const cleanId = validateRequiredString(filing.id, 'id');
  const cleanEntityId = validateRequiredString(filing.legalEntityId, 'legalEntityId');
  const now = new Date().toISOString();

  const previous = inMemoryFilings.get(cleanId);

  const updated: RegulatoryFiling = {
    ...filing,
    id: cleanId,
    legalEntityId: cleanEntityId,
    updatedAt: now,
    createdAt: filing.createdAt || previous?.createdAt || now
  };

  inMemoryFilings.set(cleanId, updated);

  try {
    const docRef = doc(firestore, REGULATORY_FILINGS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: previous ? `TRANSITION_FILING_${updated.status}` : 'CREATE_REGULATORY_FILING',
    entityType: 'REGULATORY_FILING',
    entityId: cleanId,
    metadata: {
      filingNumber: updated.filingNumber,
      obligationCode: updated.obligationCode,
      legalEntityId: cleanEntityId,
      status: updated.status,
      authorityReference: updated.authorityFilingReference,
      verifiedByUserId: updated.verifiedByUserId,
      auditCorrelationId: updated.auditCorrelationId
    }
  });

  return updated;
}

export async function recordFilingAttempt(
  attempt: FilingAttemptRecord,
  actorUserId: string
): Promise<FilingAttemptRecord> {
  const cleanId = validateRequiredString(attempt.id, 'id');
  const cleanFilingId = validateRequiredString(attempt.filingId, 'filingId');
  const now = new Date().toISOString();

  const updated: FilingAttemptRecord = {
    ...attempt,
    id: cleanId,
    filingId: cleanFilingId,
    createdAt: attempt.createdAt || now
  };

  inMemoryFilingAttempts.set(cleanId, updated);

  try {
    const docRef = doc(firestore, FILING_ATTEMPTS_COLLECTION, cleanId);
    await setDoc(docRef, updated, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: `RECORD_FILING_ATTEMPT_${updated.outcomeStatus}`,
    entityType: 'FILING_ATTEMPT',
    entityId: cleanId,
    metadata: {
      filingId: cleanFilingId,
      attemptNumber: updated.attemptNumber,
      submissionMethod: updated.submissionMethod,
      outcomeStatus: updated.outcomeStatus,
      receiptReference: updated.receiptReference,
      correlationId: updated.correlationId
    }
  });

  return updated;
}

export async function listFilingAttempts(filingId: string): Promise<FilingAttemptRecord[]> {
  const cleanFilingId = validateRequiredString(filingId, 'filingId');
  return Array.from(inMemoryFilingAttempts.values())
    .filter((a) => a.filingId === cleanFilingId)
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
}

// ============================================================================
// 6. COMPLIANCE MONITORING SIGNALS
// ============================================================================

export async function getSignalById(id: string): Promise<ComplianceMonitoringSignal | null> {
  const cleanId = validateRequiredString(id, 'id');
  return inMemorySignals.get(cleanId) || null;
}

export async function listSignalsByEntity(
  legalEntityId: string,
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
): Promise<ComplianceMonitoringSignal[]> {
  const cleanEntityId = validateRequiredString(legalEntityId, 'legalEntityId');
  return Array.from(inMemorySignals.values()).filter((s) => {
    if (s.legalEntityId !== cleanEntityId) return false;
    if (status && s.status !== status) return false;
    return true;
  });
}

export async function saveSignal(
  signal: ComplianceMonitoringSignal,
  actorUserId: string
): Promise<ComplianceMonitoringSignal> {
  const cleanId = validateRequiredString(signal.id, 'id');
  inMemorySignals.set(cleanId, signal);

  try {
    const docRef = doc(firestore, COMPLIANCE_SIGNALS_COLLECTION, cleanId);
    await setDoc(docRef, signal, { merge: true });
  } catch {
    // Retain in memory
  }

  await createAuditLog({
    actorUserId,
    action: `COMPLIANCE_MONITORING_SIGNAL_${signal.signalType}`,
    entityType: 'COMPLIANCE_SIGNAL',
    entityId: cleanId,
    metadata: {
      legalEntityId: signal.legalEntityId,
      signalType: signal.signalType,
      severity: signal.severity,
      targetResourceId: signal.targetResourceId,
      status: signal.status
    }
  });

  return signal;
}
