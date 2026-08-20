/**
 * AJA INTERNATIONAL LOGISTICS
 * STEP GOV-20 — REGULATORY OBLIGATION EXECUTION ASSURANCE, COMPLIANCE CERTIFICATION,
 * CONTROL ATTESTATION & EVIDENCE-BASED COMPLIANCE CLOSURE
 * Canonical Domain Types & Invariants
 */

import {
  GovernanceJurisdiction,
  GovernanceRiskSeverity,
  FindingLifecycleState,
  RegulatoryFilingStatus,
  ApplicabilityAssessmentStatus,
  SecurityClassification
} from './corporateGovernance';

export type ComplianceCertificationResult =
  | 'COMPLIANT'
  | 'COMPLIANT_WITH_EXCEPTIONS'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'PENDING_VERIFICATION'
  | 'NOT_APPLICABLE';

export type ComplianceCertificationLifecycleStatus =
  | 'DRAFT'
  | 'EVIDENCE_COLLECTION'
  | 'CONTROL_REVIEW'
  | 'PENDING_CERTIFICATION'
  | 'CERTIFIED'
  | 'PENDING_INDEPENDENT_VERIFICATION'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'REVALIDATION_REQUIRED';

export interface EvidenceItemVerificationSnapshot {
  evidenceRecordId: string;
  documentId: string;
  documentVersionId: string; // Pinned DocumentVersion
  checksumSha256: string; // Cryptographic hash
  legalEntityId: string;
  evidenceType: string;
  verificationStatus: string;
  integrityValid: boolean;
  isExpired: boolean;
  validUntil?: string;
  verifiedAt?: string;
  verifiedByUserId?: string;
}

export interface ControlAssessmentSnapshot {
  controlId: string;
  controlCode: string;
  operatingEffectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'UNTESTED';
  designEffectiveness: 'EFFECTIVE' | 'DEFICIENT' | 'UNTESTED';
  lastTestedAt?: string;
  isStale: boolean;
  controlWorksheetId?: string;
  attestationId?: string;
  attestedByUserId?: string;
}

export interface FilingSatisfactionSnapshot {
  filingId: string;
  filingNumber: string;
  status: RegulatoryFilingStatus;
  isAcceptedOrVerified: boolean;
  receiptDocumentId?: string;
  receiptChecksumSha256?: string;
  verifiedByUserId?: string;
}

export interface ExceptionUsageSnapshot {
  exceptionId: string;
  exceptionNumber: string;
  title: string;
  riskRating: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil: string;
  supportingDecisionId?: string;
  compensatingControlsVerified: boolean;
}

export interface FindingImpactSnapshot {
  findingId: string;
  findingNumber: string;
  severity: GovernanceRiskSeverity;
  status: FindingLifecycleState;
  isBlocking: boolean;
  remediationActionId?: string;
  remediationVerified: boolean;
}

export interface ControlAttestation {
  id: string; // Deterministic CAT-YYYY-####
  attestationNumber: string;
  controlId: string;
  controlCode: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  attestorUserId: string;
  attestorRole: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  statementVersion: string;
  operatingEffectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT';
  evidenceRecordIds: string[];
  exceptionsNoted: string[];
  attestedAt: string;
  policyVersionId: string;
  integrityHashSha256: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationReadinessEvaluation {
  obligationId: string;
  obligationCode: string;
  obligationVersionId: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  isApplicable: boolean;
  applicabilityStatus: ApplicabilityAssessmentStatus;
  filingsSatisfied: boolean;
  evidenceVerified: boolean;
  evidenceIntegrityValid: boolean;
  controlsEffective: boolean;
  controlsFresh: boolean;
  blockingFindingsCount: number;
  validExceptionsCount: number;
  readyForCertification: boolean;
  expectedResult: ComplianceCertificationResult;
  blockers: string[];
  warnings: string[];
  evaluatedAt: string;
  evaluatedByUserId: string;
}

export interface ComplianceCertification {
  id: string; // Deterministic CCF-YYYY-####
  certificationNumber: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  obligationId: string;
  obligationCode: string;
  obligationVersionId: string; // Pinned obligation version
  policyVersionId: string; // Pinned CorporatePolicyVersion
  ruleVersion: number; // Regulatory rulebook version pinned
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  status: ComplianceCertificationLifecycleStatus;
  certificationResult: ComplianceCertificationResult;
  certificationStatement: string;
  statementVersion: string; // Pinned statement text version
  
  readinessEvaluation?: CertificationReadinessEvaluation;
  evidenceSnapshots: EvidenceItemVerificationSnapshot[];
  controlSnapshots: ControlAssessmentSnapshot[];
  filingSnapshots: FilingSatisfactionSnapshot[];
  exceptionSnapshots: ExceptionUsageSnapshot[];
  findingSnapshots: FindingImpactSnapshot[];
  
  certifierUserId?: string;
  certifierRole?: string;
  certifiedAt?: string;
  
  independentVerifierUserId?: string;
  independentVerifierRole?: string;
  verifiedAt?: string;
  independentVerificationNotes?: string;
  
  closureNotes?: string;
  closedAt?: string;
  closedByUserId?: string;
  
  validFrom?: string;
  validUntil?: string;
  revalidationRequiredAt?: string;
  revalidationReason?: string;
  
  reopenedAt?: string;
  reopenedByUserId?: string;
  reopenReason?: string;
  reopenHistory: Array<{
    reopenedAt: string;
    reopenedByUserId: string;
    reason: string;
    previousResult: ComplianceCertificationResult;
  }>;
  
  supersededByCertificationId?: string;
  supersedesCertificationId?: string;
  version: number;
  
  isLegallyPrivileged?: boolean;
  classification: SecurityClassification;
  integrityHashSha256: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointInTimeCertificationReplay {
  certificationId: string;
  certificationNumber: string;
  asOfDate: string;
  obligationVersionAtTime: string;
  policyVersionAtTime: string;
  resultAtTime: ComplianceCertificationResult;
  statusAtTime: ComplianceCertificationLifecycleStatus;
  evidenceSnapshotsAtTime: EvidenceItemVerificationSnapshot[];
  controlSnapshotsAtTime: ControlAssessmentSnapshot[];
  filingSnapshotsAtTime: FilingSatisfactionSnapshot[];
  findingsAtTime: FindingImpactSnapshot[];
  exceptionsAtTime: ExceptionUsageSnapshot[];
  certifierUserIdAtTime?: string;
  independentVerifierUserIdAtTime?: string;
  integrityHashSha256: string;
  replayedAt: string;
}
