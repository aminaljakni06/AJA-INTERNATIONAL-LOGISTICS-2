/**
 * AJA INTERNATIONAL LOGISTICS
 * STEP GOV-19 — REGULATORY SUPERVISION, INSPECTIONS, INQUIRIES, ENFORCEMENT RESPONSE & REGULATORY CASE MANAGEMENT
 * Canonical Domain Types & Invariants
 */

import { GovernanceJurisdiction } from './corporateGovernance';

export type RegulatoryCaseType =
  | 'INQUIRY'
  | 'INFORMATION_REQUEST'
  | 'INSPECTION_NOTICE'
  | 'SUPERVISORY_REVIEW'
  | 'ENFORCEMENT_NOTICE'
  | 'REGULATORY_OBSERVATION'
  | 'LICENSING_QUERY'
  | 'AUDIT_REQUEST'
  | 'DATA_REQUEST'
  | 'CORRESPONDENCE'
  | 'OTHER';

export type RegulatoryCaseLifecycleStatus =
  | 'RECEIVED'
  | 'TRIAGE'
  | 'EVIDENCE_PRESERVATION'
  | 'RESPONSE_PLANNING'
  | 'REVIEW_IN_PROGRESS'
  | 'PENDING_APPROVAL'
  | 'APPROVED_FOR_SUBMISSION'
  | 'SUBMITTED'
  | 'AWAITING_REGULATOR_RESPONSE'
  | 'COMMITMENT_TRACKING'
  | 'VERIFICATION'
  | 'CLOSED'
  | 'REJECTED_INVALID'
  | 'ON_HOLD'
  | 'WITHDRAWN'
  | 'SUPERSEDED'
  | 'ESCALATED'
  | 'ENFORCEMENT_ACTIVE';

export type RegulatorySubmissionStatus =
  | 'DRAFT'
  | 'READY'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'MORE_INFORMATION_REQUIRED'
  | 'CLOSED';

export type RegulatorySubmissionMethod =
  | 'PORTAL'
  | 'EMAIL'
  | 'API'
  | 'AUTHORIZED_AGENT'
  | 'PHYSICAL'
  | 'OTHER';

export type RegulatoryCommitmentStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'FULFILLED'
  | 'OVERDUE'
  | 'WITHDRAWN'
  | 'SUPERSEDED';

export type CaseReconciliationStatus =
  | 'ALIGNED'
  | 'AWAITING_RESPONSE'
  | 'MORE_INFORMATION_REQUIRED'
  | 'COMMITMENT_OPEN'
  | 'REMEDIATION_OPEN'
  | 'EVIDENCE_MISSING'
  | 'REGULATOR_INTERNAL_MISMATCH'
  | 'REQUIRES_REVIEW';

export interface RegulatoryCase {
  id: string;
  caseNumber: string; // RGC-YYYY-####
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  authorityId: string; // Ref to RegulatorySource / Authority
  authorityName: string;
  caseType: RegulatoryCaseType;
  sourceReference: string;
  title: string;
  description: string;
  receivedAtUtc: string;
  responseDueAtUtc: string; // Official regulator deadline
  internalTargetDateUtc: string; // Internal operational deadline
  status: RegulatoryCaseLifecycleStatus;
  materiality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'BOARD_ESCALATION';
  caseOwnerUserId: string;
  legalReviewerUserId?: string;
  complianceReviewerUserId?: string;
  supportingDecisionId?: string; // GOV-06 CorporateDecision
  corporateActionId?: string; // GOV-15 CorporateAction
  legalHoldId?: string; // GOV-09 LegalHold
  evidenceDocumentIds: string[];
  submissionIds: string[];
  commitmentIds: string[];
  findingIds: string[]; // GOV-11 Findings
  signalIds: string[]; // GOV-16 Signals
  isPrivilegedLegalContent: boolean;
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  correlationId: string;
}

export interface RegulatoryResponsePlan {
  id: string;
  caseId: string;
  responseScope: string;
  requiredEvidenceTypes: string[];
  assignedReviewers: Array<{
    userId: string;
    role: 'LEGAL' | 'COMPLIANCE' | 'TAX' | 'DPO' | 'OPERATIONS' | 'FINANCE' | 'EXECUTIVE';
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMMENTS_SUBMITTED';
    comments?: string;
    reviewedAtUtc?: string;
  }>;
  responseOwnerUserId: string;
  submissionMethod: RegulatorySubmissionMethod;
  regulatorDeadlineUtc: string;
  internalTargetDateUtc: string;
  requiresBoardApproval: boolean;
  supportingDecisionRequirement?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface RegulatorySubmission {
  id: string;
  caseId: string;
  submissionNumber: string; // SUB-RGC-YYYY-####-V#
  versionNumber: number;
  status: RegulatorySubmissionStatus;
  submissionMethod: RegulatorySubmissionMethod;
  documentVersionId: string; // GOV-09 DocumentVersion
  submittedContentSummary: string;
  preparedByUserId: string;
  approvedByUserId: string; // SoD: preparedBy != approvedBy
  submittedByUserId: string;
  authorizedSignatoryPoAId?: string; // GOV-10 PoA
  submittedAtUtc?: string;
  receiptReference?: string;
  regulatorAcknowledgedAtUtc?: string;
  regulatorResponseNotes?: string;
  supersedesSubmissionId?: string;
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  correlationId: string;
}

export interface RegulatoryCommitment {
  id: string;
  caseId: string;
  commitmentNumber: string; // RCM-YYYY-####
  sourceSubmissionId: string;
  description: string;
  acceptedByAuthority: boolean;
  commitmentDateUtc: string;
  dueDateUtc: string;
  ownerUserId: string;
  status: RegulatoryCommitmentStatus;
  evidenceRequirementDocumentIds: string[];
  governanceCalendarEventId?: string; // GOV-08
  findingId?: string; // GOV-11 if validated deficiency
  remediationActionId?: string; // GOV-11
  verifiedByUserId?: string;
  verifiedAtUtc?: string;
  verificationNotes?: string;
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  correlationId: string;
}

export interface CaseReconciliationResult {
  caseId: string;
  legalEntityId: string;
  reconciliationStatus: CaseReconciliationStatus;
  allSubmissionsApprovedAndSent: boolean;
  regulatorAccepted: boolean;
  openCommitmentsCount: number;
  openFindingsCount: number;
  missingEvidenceCount: number;
  details: string[];
  evaluatedAtUtc: string;
}

export interface PointInTimeRegulatoryCaseSnapshot {
  snapshotAsOfDate: string;
  caseId: string;
  caseNumber: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  authorityName: string;
  statusAtTime: RegulatoryCaseLifecycleStatus;
  activeSubmissionsAtTime: Array<{
    submissionId: string;
    versionNumber: number;
    status: RegulatorySubmissionStatus;
    documentVersionId: string;
  }>;
  activeCommitmentsAtTime: Array<{
    commitmentId: string;
    description: string;
    dueDateUtc: string;
    status: RegulatoryCommitmentStatus;
  }>;
  activeFindingsAtTime: string[];
  legalHoldActiveAtTime: boolean;
  generatedAtUtc: string;
  integrityHashSha256: string;
}
