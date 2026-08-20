export interface ReadinessAssessmentCategory {
  categoryId: string;
  categoryNameAr: string;
  categoryNameEn: string;
  readinessPct: number; // e.g. 100%
  status: 'PASSED_READY' | 'CONDITIONAL_PASS' | 'NOT_READY';
  validatedBy: string;
  lastAssessedDate: string;
  keyValidations: string[];
}

export interface ComplianceCertification {
  certId: string;
  standardName: string; // ISO 27001, ISO 22301, PCI DSS, SOC 2 Type II, ZATCA Phase 2
  categoryAr: string;
  auditStatus: 'CERTIFIED_ACTIVE' | 'AUDIT_IN_PROGRESS' | 'RE_CERTIFICATION_DUE';
  issuedDate: string;
  validUntil: string;
  auditorOrg: string;
  complianceScorePct: number;
}

export interface GoLiveGateChecklist {
  gateId: string;
  titleAr: string;
  titleEn: string;
  ownerRole: string; // CEO, CISO, CTO, COO, Head of Compliance
  status: 'APPROVED_SIGNED' | 'PENDING_REVIEW' | 'BLOCKED';
  signedBy: string;
  signedAt: string;
}

export interface HypercareMetrics {
  stage: 'HYPERCARE_ACTIVE_PHASE_1' | 'STEADY_STATE_OPERATIONS';
  daysPostLaunch: number;
  criticalP1IncidentsCount: number; // 0
  mttdMinutes: number; // Mean Time to Detect (1.2 min)
  mttrMinutes: number; // Mean Time to Recover (4.5 min)
  slaCompliancePct: number; // 99.98%
  customerSatisfactionPostLaunch: number; // 4.96 / 5.0
}

export interface InnovationPMOItem {
  itemId: string;
  titleAr: string;
  stage: 'PROOF_OF_CONCEPT' | 'PILOT_TESTING' | 'PRODUCTION_ROLLOUT';
  businessUnit: string;
  roiEstimatePercentage: number;
  aiEnhancementType: string;
}
