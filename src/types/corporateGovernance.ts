/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Corporate Governance & Compliance Layer
 * Architecture: UK-Governed + Globally Accessible + Remotely Manageable + Multi-Jurisdiction Ready
 * Canonical Domain Model & Persistence Contracts
 */

import { SecurityClassification } from './fileManagementFramework';
export type { SecurityClassification };

// ============================================================================
// 1. COMMON GOVERNANCE ENUMS & VALUE OBJECTS
// ============================================================================

export type GovernanceJurisdiction = 
  | 'GB' // United Kingdom (Primary Incorporation Nexus)
  | 'SA' // Kingdom of Saudi Arabia (Primary Regional Operations Hub)
  | 'AE' // United Arab Emirates
  | 'US' // United States
  | 'GLOBAL'; // Multi-jurisdiction / International

export type MeetingModality = 'PHYSICAL' | 'HYBRID' | 'FULLY_REMOTE';

export type GovernanceRecordStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'RESIGNED'
  | 'EXPIRED'
  | 'SUPERSEDED'
  | 'ARCHIVED';

export type StatutoryAppointmentType =
  | 'DIRECTOR'
  | 'MANAGING_DIRECTOR'
  | 'EXECUTIVE_DIRECTOR'
  | 'FINANCE_DIRECTOR'
  | 'COMPANY_SECRETARY'
  | 'CHIEF_COMPLIANCE_OFFICER'
  | 'AUTHORIZED_LEGAL_SIGNATORY'
  | 'AUTHORIZED_BANK_SIGNATORY'
  | 'DATA_PROTECTION_OFFICER';

export type PSCOwnershipNature =
  | 'OWNERSHIP_OF_SHARES_25_TO_50'
  | 'OWNERSHIP_OF_SHARES_50_TO_75'
  | 'OWNERSHIP_OF_SHARES_75_TO_100'
  | 'VOTING_RIGHTS_25_TO_50'
  | 'VOTING_RIGHTS_50_TO_75'
  | 'VOTING_RIGHTS_75_TO_100'
  | 'RIGHT_TO_APPOINT_REMOVE_DIRECTORS'
  | 'SIGNIFICANT_INFLUENCE_OR_CONTROL'
  | 'TRUST_OR_FIRM_SIGNIFICANT_INFLUENCE';

export type CorporateDecisionType =
  | 'BOARD_RESOLUTION'
  | 'DIRECTOR_DECISION'
  | 'WRITTEN_RESOLUTION'
  | 'FINANCIAL_POLICY_APPROVAL'
  | 'BANK_ACCOUNT_OPENING'
  | 'BANK_ACCOUNT_CLOSURE'
  | 'SIGNATORY_APPOINTMENT'
  | 'OFFICER_APPOINTMENT'
  | 'OFFICER_RESIGNATION'
  | 'DELEGATION_OF_AUTHORITY'
  | 'MAJOR_CONTRACT_APPROVAL'
  | 'COMPLIANCE_POLICY_APPROVAL'
  | 'STATUTORY_FILING_APPROVAL'
  | 'CAPITAL_ALLOCATION'
  | 'RISK_ACCEPTANCE'
  | 'RISK_ACCEPTANCE_DECISION'
  | 'POLICY_EXCEPTION'
  | 'POLICY_EXCEPTION_APPROVAL';

export type DecisionLifecycleState =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVAL'
  | 'APPROVED'
  | 'RESOLUTION'
  | 'EXECUTION'
  | 'EVIDENCE'
  | 'VERIFICATION'
  | 'AUDIT'
  | 'CLOSED'
  | 'REJECTED'
  | 'RETURNED_FOR_REVISION'
  | 'CANCELLED'
  | 'SUPERSEDED'
  | 'EXPIRED';

export type DecisionExecutionStatus =
  | 'NOT_APPLICABLE'
  | 'PENDING_DISPATCH'
  | 'IN_PROGRESS'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'FAILED'
  | 'ROLLED_BACK';

export type TargetExecutionDomain =
  | 'FINANCE_TREASURY'
  | 'ORGANIZATION_MASTER'
  | 'IDENTITY_IAM'
  | 'COMPLIANCE_OBLIGATION'
  | 'CONTRACT_MANAGEMENT'
  | 'DOCUMENT_VAULT';

export type ComplianceObligationCategory =
  | 'CORPORATE_STATUTORY'
  | 'TAX_AND_REVENUE'
  | 'FINANCIAL_REPORTING'
  | 'CUSTOMS_AND_MARITIME'
  | 'DATA_PROTECTION_GDPR'
  | 'LABOR_AND_EMPLOYMENT'
  | 'ENVIRONMENTAL_STANDARDS'
  | 'INSURANCE_AND_LICENSING'
  | 'INTERNAL_CONTROLS';

export type ObligationFrequency =
  | 'ANNUAL'
  | 'SEMI_ANNUAL'
  | 'QUARTERLY'
  | 'MONTHLY'
  | 'EVENT_DRIVEN'
  | 'CONTINUOUS'
  | 'ONE_TIME';

export type ApplicabilityAssessmentStatus =
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'PENDING_ASSESSMENT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'INSUFFICIENT_DATA_TO_VERIFY'
  | 'UNDER_REVIEW'
  | 'WAIVED';

export type RegulatoryFilingStatus =
  | 'DRAFT'
  | 'PREPARED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'AMENDED'
  | 'SUPERSEDED'
  | 'CANCELLED';

export type ComplianceOccurrenceStatus =
  | 'UPCOMING'
  | 'DUE_SOON'
  | 'IN_PROGRESS'
  | 'PENDING_EVIDENCE'
  | 'PENDING_REVIEW'
  | 'PENDING_APPROVAL'
  | 'READY_FOR_FILING'
  | 'FILED'
  | 'PENDING_VERIFICATION'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'FAILED'
  | 'AT_RISK'
  | 'WAIVED'
  | 'NOT_APPLICABLE';

export type PolicyLifecycleState =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'EFFECTIVE'
  | 'UNDER_REVIEW'
  | 'SUPERSEDED'
  | 'RETIRED'
  | 'REVOKED'
  | 'ARCHIVED';

export type AuthorityDelegationType =
  | 'FINANCIAL_PAYMENT'
  | 'FINANCIAL_APPROVAL'
  | 'LEGAL_SIGNATURE'
  | 'LEGAL_CONTRACT_SIGNING'
  | 'HR_APPOINTMENT'
  | 'HR_PERSONNEL'
  | 'COMPLIANCE_FILING'
  | 'CUSTOMS_CLEARANCE'
  | 'OPERATIONAL_DISPATCH'
  | 'OPERATIONAL_OVERRIDE';

export type AuthorityScopeLevel =
  | 'GLOBAL'
  | 'LEGAL_ENTITY'
  | 'BRANCH'
  | 'DEPARTMENT'
  | 'TRANSACTION'
  | 'TRANSACTION_SPECIFIC';

export type EvidenceVerificationStatus =
  | 'MISSING'
  | 'SUBMITTED_UNVERIFIED'
  | 'SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'INVALIDATED'
  | 'EXPIRED'
  | 'INTEGRITY_FAILURE'
  | 'INSUFFICIENT';

export type GovernanceRiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingLifecycleState =
  | 'OPEN'
  | 'ASSIGNED'
  | 'REMEDIATION_IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'CLOSED'
  | 'RISK_ACCEPTED'
  | 'DEFERRED'
  | 'REOPENED';

// ============================================================================
// 2. CORPORATE LEGAL PROFILE EXTENSION
// ============================================================================

export interface CorporateLegalProfile {
  id: string; // 1:1 with legalEntityId from Organization Master
  legalEntityId: string;
  legalCompanyName: string;
  tradingName?: string;
  companyNumber: string; // e.g. UK Companies House Registration Number
  companyType: string; // e.g. 'Private Limited by Shares (Ltd)'
  incorporationDate: string; // ISO 8601
  incorporationJurisdiction: GovernanceJurisdiction;
  registeredOfficeAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    isPrincipalPlaceOfBusiness: boolean;
  };
  principalBusinessAddresses: {
    country: string;
    city: string;
    address: string;
    type: 'HEADQUARTERS' | 'REGIONAL_HUB' | 'OPERATIONAL_BRANCH';
  }[];
  companyStatus: 'ACTIVE' | 'DORMANT' | 'DISSOLVED' | 'UNDER_LIQUIDATION';
  financialYear: {
    accountingReferenceDate: string; // e.g. '31-12' (Day-Month)
    lastAccountsMadeUpTo?: string;
    nextAccountsDueDate: string;
    lastConfirmationStatementDate?: string;
    nextConfirmationStatementDueDate: string;
  };
  taxRegistrations: {
    corporationTaxUtr?: string; // HMRC Unique Taxpayer Reference (Masked)
    vatNumber?: string; // e.g. 'GB123456789' or 'SA300...'
    vatRegisteredDate?: string;
    zatcaRegistrationStatus?: string;
    taxResidenceJurisdiction: GovernanceJurisdiction;
  };
  advisors: {
    externalAccountantFirm?: string;
    externalAuditorFirm?: string;
    legalCounselFirm?: string;
  };
  dataClassification: SecurityClassification;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 3. DIRECTORS, OFFICERS & PSC REGISTRY
// ============================================================================

export interface DirectorOfficerRecord {
  id: string;
  legalEntityId: string;
  personReference: {
    personId?: string;
    userId?: string; // Optional link to IT User Account
    employeeId?: string; // Optional link to HR Employee Record
    fullNameEn: string;
    fullNameAr?: string;
    nationality: string;
    countryOfResidence: string;
    dateOfBirthMonthYear?: string; // Data minimization: MM/YYYY only
    occupation?: string;
  };
  statutoryRole: StatutoryAppointmentType;
  titleEn: string;
  titleAr?: string;
  authorityScope: AuthorityScopeLevel;
  appointmentDate: string; // Date resolved by Board
  effectiveFrom: string;
  effectiveUntil?: string;
  status: GovernanceRecordStatus;
  supportingDecisionId: string; // Mandatory link to Board Resolution
  supportingDocumentIds: string[]; // e.g. Consent to Act, AP01 filing
  appointedByUserId: string;
  resignationDate?: string;
  resignationReason?: string;
  supersededByAppointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PSCRecord {
  id: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  subjectType: 'INDIVIDUAL' | 'LEGAL_ENTITY' | 'OTHER_REGISTRABLE_PERSON';
  subjectReference: {
    nameEn: string;
    nameAr?: string;
    nationalityOrLegalForm: string;
    governingLawOrResidence: string;
    registrationNumber?: string;
    personId?: string;
    userId?: string;
  };
  natureOfControlCodes: PSCOwnershipNature[];
  ownershipPercentageMin: number; // e.g. 25
  ownershipPercentageMax: number; // e.g. 50
  votingPercentageMin: number;
  votingPercentageMax: number;
  hasSignificantInfluence: boolean;
  notifiedDate: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: GovernanceRecordStatus;
  filingReference?: string; // Companies House PSC01/PSC02 reference
  supportingDecisionId?: string;
  supportingDocumentIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 4. CORPORATE DECISION REGISTER, MEETINGS, VOTING & RESOLUTIONS
// ============================================================================

export type BoardMeetingType =
  | 'ANNUAL_GENERAL_MEETING'
  | 'EXTRAORDINARY_GENERAL_MEETING'
  | 'BOARD_OF_DIRECTORS'
  | 'AUDIT_COMMITTEE'
  | 'REMUNERATION_COMMITTEE'
  | 'RISK_COMMITTEE'
  | 'FINANCE_COMMITTEE'
  | 'EXECUTIVE_COMMITTEE';

export type BoardMeetingStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'ADJOURNED'
  | 'CONCLUDED'
  | 'CANCELLED';

export type MeetingParticipantRole =
  | 'CHAIR'
  | 'DIRECTOR'
  | 'SECRETARY'
  | 'EXECUTIVE_OFFICER'
  | 'ATTENDEE'
  | 'OBSERVER'
  | 'LEGAL_ADVISOR'
  | 'AUDITOR'
  | 'INVITED_GUEST';

export type AttendanceStatus =
  | 'ATTENDED'
  | 'ATTENDED_REMOTELY'
  | 'APOLOGIES_GIVEN'
  | 'ABSENT';

export type VoteValue = 'FOR' | 'AGAINST' | 'ABSTAIN' | 'NOT_ELIGIBLE';

export type VotingMethod =
  | 'IN_PERSON_VOICE'
  | 'IN_PERSON_BALLOT'
  | 'REMOTE_ELECTRONIC'
  | 'WRITTEN_CONSENT'
  | 'PROXY';

export type ResolutionType =
  | 'ORDINARY_RESOLUTION'
  | 'SPECIAL_RESOLUTION'
  | 'BOARD_RESOLUTION'
  | 'UNANIMOUS_WRITTEN_RESOLUTION';

export interface DecisionLocationContext {
  country: string;
  city?: string;
  timeZone: string;
  meetingModality: MeetingModality;
}

export interface RemoteMeetingContext {
  platform?: string;
  meetingUrlMasked?: string;
  hostCountry: string;
  hostCity?: string;
  timeZone: string;
}

export interface BoardMeeting {
  id: string;
  meetingNumber: string; // Deterministic sequence e.g. 'MTG-2026-0001'
  legalEntityId: string;
  title: string;
  meetingType: BoardMeetingType;
  scheduledAtUtc: string;
  eventLocalTime: string;
  timeZone: string;
  meetingModality: MeetingModality;
  physicalLocation?: string;
  remoteMeetingContext?: RemoteMeetingContext;
  status: BoardMeetingStatus;
  chairpersonUserId?: string;
  secretaryUserId?: string;
  chairpersonName: string;
  secretaryName: string;
  agendaDocumentId?: string;
  minutesDocumentId?: string;
  quorumRequired: number; // Minimum number of eligible attendees
  quorumAchieved?: boolean;
  quorumParticipantCount?: number;
  decisionIds: string[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipantRecord {
  id: string;
  meetingId: string;
  legalEntityId: string;
  participantUserId?: string;
  participantPersonId?: string;
  fullNameEn: string;
  fullNameAr?: string;
  statutoryAppointmentId?: string; // Reference to DirectorOfficerRecord
  roleInMeeting: MeetingParticipantRole;
  attendanceStatus: AttendanceStatus;
  joiningMethod?: 'PHYSICAL' | 'VIDEO_CONFERENCE' | 'AUDIO_CONFERENCE' | 'PROXY';
  country?: string;
  city?: string;
  timeZone?: string;
  votingEligibility: boolean;
  hasConflictOfInterest?: boolean;
  conflictDeclaredReason?: string;
  recusedFromVoting?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionVoteRecord {
  id: string;
  decisionId: string;
  meetingId?: string;
  legalEntityId: string;
  voterUserId?: string;
  voterName: string;
  voterAppointmentId?: string; // Must map to an active Director appointment
  vote: VoteValue;
  castAtUtc: string;
  votingMethod: VotingMethod;
  comment?: string;
  conflictDeclared: boolean;
  recused: boolean;
  abstentionReason?: string;
  isCorrectedVote?: boolean;
  previousVoteId?: string;
  createdAt: string;
}

export interface CorporateResolution {
  id: string;
  resolutionNumber: string; // Deterministic sequence e.g. 'RES-2026-0001'
  decisionId: string;
  legalEntityId: string;
  title: string;
  resolutionText: string;
  resolutionType: ResolutionType;
  adoptionDateUtc: string;
  effectiveDate: string;
  expirationDate?: string;
  votingOutcome: {
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    totalEligibleVoters: number;
    quorumMet: boolean;
    approvalPercentage: number;
    thresholdAchieved: boolean;
  };
  signatories: Array<{
    userId?: string;
    appointmentId?: string;
    name: string;
    title: string;
    signedAtUtc: string;
    signatureEvidenceDocumentId?: string;
  }>;
  resolutionDocumentId?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
  supersededByResolutionId?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionParticipant {
  id: string;
  participantUserId?: string;
  participantName: string;
  statutoryRole: string;
  attendanceStatus: 'ATTENDED' | 'ATTENDED_REMOTELY' | 'APOLOGIES_GIVEN' | 'ABSENT';
  votingOutcome: 'FOR' | 'AGAINST' | 'ABSTAINED' | 'NON_VOTING';
  locationContext: DecisionLocationContext;
}

export interface DecisionExecutionRecord {
  id: string;
  decisionId: string;
  resolutionId?: string;
  legalEntityId: string;
  targetDomain: TargetExecutionDomain;
  executionType: string; // e.g., 'OFFICER_APPOINTMENT', 'BANK_ACCOUNT_OPENING', 'FINANCIAL_POLICY_APPROVAL', 'DELEGATION_OF_AUTHORITY'
  targetResourceId?: string;
  idempotencyKey: string;
  executionStatus: DecisionExecutionStatus;
  requestedAt: string;
  executedAt?: string;
  executedByUserId?: string;
  resultReference?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  verifiedAt?: string;
  verifiedByUserId?: string;
  evidenceDocumentId?: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateDecision {
  id: string;
  decisionNumber: string; // Deterministic code e.g. 'DEC-2026-0001'
  legalEntityId: string;
  decisionType: CorporateDecisionType;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  description?: string;
  summaryEn?: string;
  summaryAr?: string;
  decisionScope?: string;
  decisionStatus?: string;
  authorityLevelRequired?: string;
  approvalThresholdPercentage?: number;
  unanimousRequired?: boolean;
  quorumRequiredPercentage?: number;
  approvedAt?: string;
  isStatutoryFilingRequired?: boolean;
  isExecutionControlled?: boolean;
  jurisdictionContext?: GovernanceJurisdiction;
  relatedDepartmentId?: string;
  relatedBusinessProcess?: string;
  
  // Meeting & Timestamps
  decisionDate?: string; // Canonical UTC ISO String
  meetingId?: string;
  meetingDate?: string;
  meetingModality?: MeetingModality;
  eventTimeZone?: string; // e.g. 'Europe/London' or 'Asia/Riyadh'
  decisionLocationContext?: DecisionLocationContext;
  
  effectiveDate: string;
  expirationDate?: string;
  
  // State Machine
  lifecycleStatus?: DecisionLifecycleState;
  executionStatus?: DecisionExecutionStatus;
  riskLevel?: GovernanceRiskSeverity;
  
  // Resolution Text & Voting
  resolutionText?: string;
  participants?: DecisionParticipant[];
  
  // Resolution Linkage
  resolutionId?: string;
  
  // Workflow & SoD Links
  workflowInstanceId?: string; // Reference to central WorkflowInstance
  createdByUserId?: string;
  reviewedByUserId?: string;
  approvedByUserIds?: string[];
  executedByUserId?: string;
  closedAt?: string;
  
  // Evidentiary Links
  supportingDocumentIds?: string[];
  evidenceIds?: string[];
  
  // Versioning & Audit
  version?: number;
  previousVersionId?: string;
  supersededByDecisionId?: string;
  auditCorrelationId: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface QuorumPolicy {
  legalEntityId: string;
  minEligibleParticipants: number;
  minPercentageRequired: number; // e.g. 50
  chairpersonRequired: boolean;
  independentDirectorRequired?: boolean;
}

export interface VotingThresholdPolicy {
  decisionType: CorporateDecisionType;
  requiredPercentage: number; // e.g. 50.1 for simple majority, 75 for special, 100 for unanimous
  unanimousRequired: boolean;
}

// ============================================================================
// 5. COMPLIANCE REQUIREMENTS, OBLIGATIONS, APPLICABILITY & FILINGS
// ============================================================================

export interface ComplianceRequirementDefinition {
  id: string;
  code: string; // e.g. 'REQ-UK-CS01', 'REQ-UK-CT600', 'REQ-UK-VAT100', 'REQ-SA-ZATCA-EINV'
  titleEn: string;
  titleAr?: string;
  description: string;
  jurisdiction: GovernanceJurisdiction;
  regulatoryAuthority: string; // e.g. 'Companies House', 'HMRC', 'ZATCA', 'ICO'
  category: ComplianceObligationCategory;
  sourceCitation: string; // e.g. 'Companies Act 2006 s.853A'
  applicableEntityTypes?: string[]; // e.g. ['PRIVATE_LIMITED', 'BRANCH_OFFICE']
  defaultFrequency: ObligationFrequency;
  
  dueDateRule: {
    ruleType: 'FIXED_ANNUAL_DAY' | 'RELATIVE_TO_FYE_MONTHS' | 'RELATIVE_TO_EVENT_DAYS' | 'CONTINUOUS';
    fixedMonthDay?: string; // e.g. '12-31'
    offsetDaysOrMonths?: number; // e.g. +9 (Months after FYE) or +14 (Days after event)
  };
  
  filingRequired: boolean;
  filingPortal?: string;
  evidenceRequired: boolean;
  defaultRiskLevel: GovernanceRiskSeverity;
  
  // Specific applicability conditions
  applicabilityCriteria: {
    requiresOperationalPresence?: boolean;
    requiresEmployees?: boolean;
    requiresTaxVatRegistration?: boolean;
    requiresCustomsRegistration?: boolean;
    requiresRegulatedActivity?: boolean;
  };
  
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceObligation {
  id: string;
  code: string; // e.g. 'OBL-UK-CS01', 'OBL-UK-CT600', 'OBL-SA-ZATCA-EINV'
  requirementDefinitionId?: string; // Reference to canonical requirement definition
  legalEntityId: string;
  titleEn: string;
  titleAr?: string;
  description: string;
  jurisdiction: GovernanceJurisdiction;
  regulatoryAuthority: string; // e.g. 'Companies House', 'HMRC', 'ZATCA', 'ICO'
  category: ComplianceObligationCategory;
  sourceCitation: string; // e.g. 'Companies Act 2006 s.853A'
  frequency: ObligationFrequency;
  
  dueDateRule: DueDateRuleConfig;
  
  filingRequired: boolean;
  filingPortal?: string; // e.g. 'WebFiling / Find and update company information'
  evidenceRequired: boolean;
  riskLevel: GovernanceRiskSeverity;
  
  ownerUserId: string;
  responsibleDepartmentId?: string;
  reviewerUserId?: string;
  verifierUserId?: string;
  
  // Current applicability summary
  applicabilityStatus: ApplicabilityAssessmentStatus;
  lastAssessmentId?: string;
  isWaived?: boolean;
  activeWaiverId?: string;
  
  effectiveFrom: string;
  effectiveUntil?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUPERSEDED';
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicabilityAssessmentCriteria {
  operationalPresenceChecked: boolean;
  hasOperationalPresence: boolean;
  employeePresenceChecked: boolean;
  hasEmployees: boolean;
  employeeCount?: number;
  taxRegistrationChecked: boolean;
  hasTaxRegistration: boolean;
  regulatoryRegistrationChecked: boolean;
  hasRegulatoryRegistration: boolean;
  businessActivityChecked: boolean;
  relevantActivitySummary?: string;
  evidenceVerified: boolean;
  evidenceDocumentIds: string[];
}

export interface ApplicabilityAssessment {
  id: string;
  obligationId: string;
  requirementDefinitionId?: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  criteria: ApplicabilityAssessmentCriteria;
  assessmentStatus: ApplicabilityAssessmentStatus;
  rationale: string;
  evidenceDocumentId?: string;
  evidenceDocumentIds?: string[];
  assessedByUserId: string;
  reviewedByUserId?: string;
  assessedAt: string;
  reviewDueDate?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceWaiverRecord {
  id: string;
  obligationId: string;
  legalEntityId: string;
  waiverReason: string;
  supportingDecisionId: string; // Mandatory board resolution / corporate decision
  authorizedByUserId: string;
  effectiveFrom: string;
  effectiveUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  revokedAt?: string;
  revokedByUserId?: string;
  revocationReason?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegulatoryFiling {
  id: string;
  filingNumber: string; // Deterministic sequence e.g. 'FIL-2026-0001'
  obligationId: string;
  obligationCode: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  title: string;
  periodReference: string; // e.g. 'FY2025-2026' or '2026-Q1'
  dueDate: string; // Canonical UTC deadline
  status: RegulatoryFilingStatus;
  preparedByUserId: string;
  approvedByUserId?: string;
  submittedByUserId?: string;
  submittedAtUtc?: string;
  authorityFilingReference?: string;
  authoritySubmissionReceiptDocumentId?: string;
  verifiedByUserId?: string;
  verifiedAtUtc?: string;
  verificationNotes?: string;
  supportingDecisionId?: string; // Reference to Board approval if statutory requirement
  evidenceDocumentIds: string[];
  requiresIndependentVerification: boolean;
  notes?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilingAttemptRecord {
  id: string;
  filingId: string;
  legalEntityId: string;
  attemptNumber: number;
  submittedAtUtc: string;
  submittedByUserId: string;
  submissionMethod: 'ELECTRONIC_API' | 'PORTAL_MANUAL_UPLOAD' | 'PHYSICAL_PAPER' | 'AUTHORIZED_AGENT';
  portalName?: string;
  receiptReference?: string;
  receiptDocumentId?: string;
  outcomeStatus: 'SUCCESS' | 'REJECTED_BY_AUTHORITY' | 'PENDING_ACKNOWLEDGMENT' | 'NETWORK_ERROR';
  rejectionReason?: string;
  correlationId: string;
  createdAt: string;
}

export interface ComplianceMonitoringSignal {
  id: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  signalType: 
    | 'MISSING_APPLICABILITY_EVIDENCE'
    | 'UNASSESSED_OBLIGATION'
    | 'PENDING_FILING_APPROVAL'
    | 'OVERDUE_UNVERIFIED_FILING'
    | 'UPCOMING_STATUTORY_DEADLINE'
    | 'OVERDUE_STATUTORY_DEADLINE'
    | 'UNAUTHORIZED_COMPLIANCE_ATTEMPT'
    | 'EXPIRING_WAIVER';
  severity: GovernanceRiskSeverity;
  targetResourceId: string;
  targetResourceType: 'COMPLIANCE_OBLIGATION' | 'APPLICABILITY_ASSESSMENT' | 'REGULATORY_FILING' | 'COMPLIANCE_WAIVER' | 'COMPLIANCE_OCCURRENCE';
  message: string;
  detectedAt: string;
  resolvedAt?: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  metadata?: Record<string, unknown>;
}

// ============================================================================
// 6. CORPORATE COMPLIANCE CALENDAR & DEADLINE ENGINE
// ============================================================================

export type BusinessDayConvention = 'NONE' | 'NEXT_BUSINESS_DAY' | 'PREVIOUS_BUSINESS_DAY';

export interface DueDateRuleConfig {
  ruleType: 'FIXED_ANNUAL_DAY' | 'RELATIVE_TO_FYE_MONTHS' | 'RELATIVE_TO_EVENT_DAYS' | 'CONTINUOUS' | 'CUSTOM_OFFSET';
  fixedMonthDay?: string; // e.g. '12-31'
  offsetDaysOrMonths?: number; // e.g. +9 (Months) or +14 (Days)
  businessDayConvention?: BusinessDayConvention;
  jurisdictionTimeZone?: string; // e.g. 'Europe/London', 'Asia/Riyadh'
}

export interface RecurrencePolicyConfig {
  frequency: ObligationFrequency;
  interval?: number; // e.g. 1
  generationHorizonDays?: number; // default 365
  ruleVersion?: number;
}

export interface ReminderDispatchRecord {
  id: string;
  triggerOffsetDays: number;
  recipientUserId: string;
  recipientRole: string;
  dispatchedAtUtc: string;
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'SYSTEM_ALERT';
  deliveryReference: string;
  status: 'DELIVERED' | 'FAILED' | 'SKIPPED';
}

export interface EscalationRecord {
  id: string;
  occurrenceId: string;
  level: number;
  escalatedAtUtc: string;
  targetRole: string;
  targetUserIds: string[];
  reason: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedByUserId?: string;
  acknowledgedAtUtc?: string;
  acknowledgementNotes?: string;
}

export interface ComplianceReminderSchedule {
  reminderDaysBeforeDue: number[]; // e.g. [60, 30, 14, 7, 1, 0]
  escalationAfterOverdueDays: number[]; // e.g. [1, 7, 14, 30]
  notifyOwner: boolean;
  notifyManager: boolean;
  notifyComplianceOfficer: boolean;
  notifyExecutive: boolean;
  notifyAssignedAdvisor?: boolean;
}

export interface ComplianceOccurrence {
  id: string;
  occurrenceNumber: string; // e.g. 'CMP-2026-0001'
  obligationId: string;
  obligationCode: string;
  requirementDefinitionId?: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  title: string;
  description?: string;
  
  referencePeriodStart: string; // ISO date YYYY-MM-DD
  referencePeriodEnd: string; // ISO date YYYY-MM-DD
  periodReference: string; // e.g. 'FY2025-2026' or '2026-Q3'
  
  scheduledDate: string; // ISO date string
  statutoryDueDate: string; // Canonical UTC deadline timestamp (e.g. '2026-09-30T23:59:59.000Z')
  dueLocalDate: string; // Date-only string (e.g. '2026-09-30')
  timeZone: string; // e.g. 'Europe/London', 'Asia/Riyadh'
  
  internalTargetDate?: string; // Optional earlier operational target
  extendedDueDate?: string; // Approved regulatory extension
  extensionReason?: string;
  extensionAuthorityReference?: string;
  extensionApprovedByUserId?: string;
  
  status: ComplianceOccurrenceStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  riskLevel: GovernanceRiskSeverity;
  
  ownerUserId: string;
  responsibleDepartmentId?: string;
  assignedAdvisorUserId?: string; // For scoped external advisor access
  reviewerUserId?: string;
  verifierUserId?: string;
  
  filingRequired: boolean;
  filingId?: string;
  filingNumber?: string;
  filingSubmittedAt?: string;
  
  evidenceRequired: boolean;
  evidenceDocumentIds: string[];
  
  waiverId?: string;
  suppressedByWaiver?: boolean;
  
  reminderSchedule: ComplianceReminderSchedule;
  lastReminderSentAt?: string;
  remindersDispatched: ReminderDispatchRecord[];
  
  escalationLevel: number; // 0 = None, 1 = Manager, 2 = Compliance, 3 = Executive, 4 = Board
  escalationStatus?: 'NONE' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
  escalatedAt?: string;
  escalationHistory: EscalationRecord[];
  
  completionDate?: string;
  verificationDate?: string;
  verifiedByUserId?: string;
  verificationNotes?: string;
  
  ruleVersion: number;
  generationKey: string; // Deterministic dedup key e.g. 'gen_le-holding-101_OBL-UK-CS01-2026_FY2025-2026_v1'
  generatedBy: string;
  auditCorrelationId: string;
  
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type ComplianceCalendarItem = ComplianceOccurrence;

// ============================================================================
// 7. CORPORATE RECORDS, STATUTORY REGISTERS & EVIDENCE VAULT (STEP GOV-09)
// ============================================================================

export type CorporateRecordType =
  | 'INCORPORATION_RECORD'
  | 'ARTICLES_OF_ASSOCIATION'
  | 'MEMORANDUM_OF_ASSOCIATION'
  | 'DIRECTOR_APPOINTMENT_RECORD'
  | 'OFFICER_APPOINTMENT_RECORD'
  | 'PSC_RECORD'
  | 'BOARD_MEETING_RECORD'
  | 'BOARD_RESOLUTION_RECORD'
  | 'WRITTEN_RESOLUTION_RECORD'
  | 'COMPLIANCE_FILING_RECORD'
  | 'REGULATORY_RECEIPT'
  | 'STATUTORY_RETURN'
  | 'LICENSE_RECORD'
  | 'INSURANCE_RECORD'
  | 'TAX_RECORD'
  | 'POLICY_RECORD'
  | 'DELEGATION_RECORD'
  | 'POWER_OF_ATTORNEY_RECORD'
  | 'AUDIT_REPORT_RECORD'
  | 'BANK_MANDATE'
  | 'CERTIFICATE_OF_INCORPORATION'
  | 'BOARD_MINUTES'
  | 'HMRC_NOTICE'
  | 'TAX_RETURN_CT600'
  | 'VAT_RETURN'
  | 'INSURANCE_POLICY'
  | 'AUDIT_REPORT';

export type CorporateRecordCategory =
  | 'STATUTORY'
  | 'REGULATORY_FILING'
  | 'BOARD_RESOLUTION'
  | 'MEETING_MINUTES'
  | 'APPOINTMENT'
  | 'PSC'
  | 'POLICY'
  | 'TAX'
  | 'CUSTOMS'
  | 'CONTRACT'
  | 'OTHER';

export type RetentionTrigger =
  | 'CREATION_DATE'
  | 'CLOSURE_DATE'
  | 'EXPIRATION_DATE'
  | 'TERMINATION_DATE'
  | 'SUPERSESSION_DATE'
  | 'FILING_ACCEPTANCE_DATE';

export type RetentionDispositionAction = 'REVIEW' | 'ARCHIVE' | 'RESTRICT' | 'DISPOSE';

export interface DocumentVersionDoc {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  fileData?: string;
  checksumSha256: string;
  uploadedBy: string;
  uploadedByRole?: string;
  changeNotes?: string;
  isImmutable: boolean;
  supersedesVersionId?: string;
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  evidenceNumber?: string; // Deterministic sequence e.g. EVI-2026-0001
  legalEntityId?: string;
  category?: string;
  titleEn?: string;
  titleAr?: string;
  documentId: string; // Reference to canonical Document in documentRepository
  documentVersionId?: string; // Pinned exact version ID
  versionNumber?: number; // Pinned version number
  sourceEntityType?: 'CORPORATE_DECISION' | 'COMPLIANCE_CALENDAR_ITEM' | 'POLICY' | 'OFFICER_APPOINTMENT' | 'FINDING' | 'REGULATORY_FILING' | 'PSC_RECORD' | 'CORPORATE_LEGAL_PROFILE';
  sourceResourceType?: string;
  sourceEntityId?: string;
  sourceResourceId?: string;
  classification?: SecurityClassification;
  evidenceType: string; // e.g. 'COMPANIES_HOUSE_SUBMISSION_RECEIPT', 'BOARD_MINUTES_SIGNED', 'BANK_MANDATE'
  checksumSha256: string; // Cryptographic deterministic hash (SHA-256)
  integrityStatus?: 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE' | 'PENDING';
  submittedByUserId?: string;
  submittedAt?: string;
  verificationStatus: EvidenceVerificationStatus;
  verifiedByUserId?: string;
  verifiedAt?: string;
  verificationMethod?: 'MANUAL_OFFICER_REVIEW' | 'CRYPTOGRAPHIC_HASH_MATCH' | 'PORTAL_API_ACKNOWLEDGEMENT';
  verificationNotes?: string;
  validFrom?: string;
  validUntil?: string;
  invalidationReason?: string;
  invalidatedByUserId?: string;
  invalidatedAt?: string;
  replacementEvidenceId?: string;
  retentionPolicyId?: string;
  retentionPolicyYears?: number;
  supersededByEvidenceId?: string;
  auditCorrelationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateRecord {
  id: string;
  recordNumber: string; // Deterministic code e.g. 'REC-2026-0001'
  legalEntityId: string;
  recordType: CorporateRecordType;
  recordCategory: CorporateRecordCategory;
  title: string;
  description?: string;
  jurisdiction: GovernanceJurisdiction;
  sourceResourceType: 'CORPORATE_LEGAL_PROFILE' | 'DIRECTOR_OFFICER_APPOINTMENT' | 'PSC_RECORD' | 'CORPORATE_DECISION' | 'CORPORATE_RESOLUTION' | 'BOARD_MEETING' | 'REGULATORY_FILING' | 'COMPLIANCE_OCCURRENCE' | 'CORPORATE_POLICY' | 'MANUAL_DEPOSIT';
  sourceResourceId?: string;
  classification: SecurityClassification;
  recordStatus: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED' | 'INVALIDATED' | 'UNDER_REVIEW';
  effectiveFrom: string;
  effectiveUntil?: string;
  documentId?: string;
  documentVersionId?: string;
  documentIds: string[];
  evidenceRecordIds: string[];
  checksumSha256?: string;
  
  // Retention & Disposition
  retentionPolicyId?: string;
  retentionPolicyVersion?: number;
  retentionTrigger?: RetentionTrigger;
  retentionStartDate?: string;
  retentionUntil?: string;
  dispositionAction?: RetentionDispositionAction;
  
  // Legal Hold
  legalHoldStatus: 'NONE' | 'ACTIVE';
  legalHoldIds?: string[];
  
  // Immutability & Lifecycle
  isImmutable: boolean;
  supersededByRecordId?: string;
  supersededAt?: string;
  invalidatedAt?: string;
  invalidatedByUserId?: string;
  invalidationReason?: string;
  
  createdByUserId: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateRecordMetadata {
  id: string;
  legalEntityId: string;
  recordType: CorporateRecordType;
  title: string;
  documentId: string;
  checksumSha256: string;
  versionNumber: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  supportingDecisionId?: string;
  classification: SecurityClassification;
  retentionPolicy: string;
  isImmutable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatutoryRegisterType =
  | 'DIRECTORS_REGISTER'
  | 'OFFICERS_REGISTER'
  | 'PSC_REGISTER'
  | 'RESOLUTIONS_REGISTER'
  | 'MEETINGS_REGISTER'
  | 'FILINGS_REGISTER'
  | 'RECORDS_REGISTER';

export interface StatutoryRegisterEntry {
  id: string;
  registerType: StatutoryRegisterType;
  legalEntityId: string;
  sourceResourceType: string;
  sourceResourceId: string;
  entryNumber: string;
  title: string;
  partyOrSubjectName: string;
  roleOrNature?: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: string;
  evidenceDocumentIds: string[];
  evidenceRecordIds: string[];
  classification: SecurityClassification;
  isCurrent: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StatutoryRegisterSnapshot {
  id: string;
  snapshotNumber: string; // e.g. SNP-2026-0001
  registerType: StatutoryRegisterType;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  snapshotDate: string;
  snapshotType: 'HISTORICAL_SNAPSHOT';
  totalEntriesCount: number;
  activeEntriesCount: number;
  entries: StatutoryRegisterEntry[];
  generatedByUserId: string;
  documentId?: string;
  checksumSha256?: string;
  auditCorrelationId: string;
  createdAt: string;
}

export interface RetentionPolicy {
  id: string;
  code: string;
  name: string;
  recordCategory: string;
  jurisdiction: GovernanceJurisdiction;
  retentionTrigger: RetentionTrigger;
  retentionDurationYears: number;
  dispositionAction: RetentionDispositionAction;
  legalHoldOverride: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
  policyVersion: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface LegalHold {
  id: string;
  holdNumber: string; // e.g. HLD-2026-0001
  title: string;
  reason: string;
  legalEntityId: string;
  scopeType: 'SINGLE_RECORD' | 'RESOURCE' | 'CASE' | 'DECISION' | 'LEGAL_ENTITY' | 'RECORD_CATEGORY';
  targetResourceIds?: string[];
  targetRecordIds?: string[];
  supportingDecisionId?: string;
  matterReference?: string;
  status: 'ACTIVE' | 'RELEASED';
  issuedByUserId: string;
  issuedAt: string;
  releasedByUserId?: string;
  releasedAt?: string;
  releaseReason?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrityVerificationResult {
  status: 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE' | 'PENDING';
  expectedHash: string;
  calculatedHash?: string;
  checkedAt: string;
  matched: boolean;
  message?: string;
}

// ============================================================================
// 8. POLICIES, INTERNAL CONTROLS, DELEGATION OF AUTHORITY & POWER OF ATTORNEY (STEP GOV-10)
// ============================================================================

export type GovernancePolicyCategory = 'GOVERNANCE' | 'FINANCIAL' | 'SECURITY' | 'COMPLIANCE' | 'HR_OPERATIONAL' | 'LOGISTICS_COMMERCIAL';

export interface CorporatePolicy {
  id: string;
  policyCode: string; // e.g. 'POL-FIN-001', 'POL-GOV-002'
  title: string;
  category: GovernancePolicyCategory;
  legalEntityScope: string[]; // ['ALL'] or specific entity IDs
  departmentScope?: string[];
  ownerUserId: string;
  ownerRole: string;
  mandatoryReviewFrequencyMonths: number;
  activeVersionNumber: number;
  activeVersionId?: string;
  lifecycleStatus: PolicyLifecycleState;
  classificationClearance: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  createdAt: string;
  updatedAt: string;
}

export interface CorporatePolicyVersion {
  id: string;
  policyId: string;
  versionNumber: number;
  documentId?: string; // Links to DMS Document
  documentVersionId?: string; // Pinned DMS Document Version
  contentSummary: string;
  fullPolicyText?: string;
  supportingDecisionId: string; // Mandatory Board Approval Decision (GOV-06)
  effectiveFrom: string;
  effectiveUntil?: string;
  reviewDate: string;
  approvedByUserIds: string[];
  supersededByVersionId?: string;
  evidenceRecordIds?: string[]; // Links to GOV-09 Evidence Vault
  createdAt: string;
  updatedAt: string;
}

export type InternalControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
export type ControlFrequency = 'CONTINUOUS' | 'TRANSACTIONAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type ControlEffectiveness = 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'UNTESTED';

export interface InternalControl {
  id: string;
  controlCode: string; // e.g. 'CTL-FIN-001'
  title: string;
  description: string;
  policyId?: string;
  policyVersionId?: string;
  legalEntityId: string;
  controlType: InternalControlType;
  frequency: ControlFrequency;
  ownerUserId: string;
  ownerRole: string;
  isAutomated: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  operatingEffectiveness: ControlEffectiveness;
  lastTestedAt?: string;
  lastTestedByUserId?: string;
  nextTestDueDate?: string;
  evidenceRequirement?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export type FinancialTransactionType = 
  | 'EXPENDITURE'
  | 'PROCUREMENT_ORDER'
  | 'CUSTOMER_CREDIT_LIMIT'
  | 'COMMERCIAL_DISCOUNT'
  | 'DEBT_WRITE_OFF'
  | 'LEGAL_SETTLEMENT'
  | 'CONTRACT_SIGNING'
  | 'BANK_PAYMENT'
  | 'PAYROLL_DISBURSEMENT'
  | 'CAPEX_INVESTMENT'
  | 'VENDOR_PAYMENT'
  | 'CUSTOMER_REFUND';

export interface DelegationOfAuthority {
  id: string;
  delegationNumber?: string; // e.g. DOA-2026-0001
  legalEntityId: string;
  delegatorUserId: string;
  delegatorRole?: string;
  delegateUserId: string;
  delegateRole?: string;
  authorityType: AuthorityDelegationType;
  scopeLevel: AuthorityScopeLevel;
  scopeEntityId?: string;
  scopeDepartmentId?: string;
  allowedTransactionTypes?: FinancialTransactionType[];
  
  // Financial Limits
  amountLimit?: number;
  currency?: string; // Default base currency e.g. 'SAR', 'GBP', 'USD', 'EUR'
  maxInstallmentsAllowed?: number;
  isSubDelegationAllowed?: boolean;
  parentDelegationId?: string;
  
  effectiveFrom: string;
  effectiveUntil: string; // Auto-expiring mandatory ISO timestamp
  supportingDecisionId?: string; // Formal Board/Executive Decision backing delegation
  supportingPoAId?: string; // Linked Power of Attorney if formal legal instrument
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
  
  revokedAt?: string;
  revokedByUserId?: string;
  revocationReason?: string;
  
  auditCorrelationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialApprovalMatrixRule {
  id: string;
  ruleCode?: string; // e.g. 'FAM-EX-L1'
  legalEntityId: string; // Specific Legal Entity or 'GLOBAL'
  departmentId?: string; // Specific department or 'ALL'
  supportingPolicyVersionId?: string;
  supportingDecisionId?: string;
  transactionType: FinancialTransactionType | 'VENDOR_PAYMENT' | 'CUSTOMER_REFUND' | 'CAPITAL_EXPENDITURE' | 'OPERATING_EXPENSE' | 'FREIGHT_PAYOUT' | string;
  paymentCategory?: string;
  
  // Monetary & Tier Criteria
  minAmount: number;
  maxAmount: number | null; // null = Unlimited upper bound
  currency: 'SAR' | 'USD' | 'EUR' | 'GBP';
  minInstallments?: number;
  maxInstallments?: number | null;
  
  // Required Approving Authority
  tierLevel?: number; // 1 (Manager), 2 (Director/CFO), 3 (CEO/MD), 4 (Board of Directors)
  requiredAuthorityRole: string; // e.g. 'FINANCE_MANAGER', 'CFO', 'CEO', 'BOARD_DIRECTOR'
  requiredApprovalLevels?: number; // 1, 2, or 3
  dualApprovalRequired?: boolean;
  secondaryApprovalRole?: string;
  antiSelfApprovalEnforced?: boolean;
  requiresBoardResolution?: boolean;
  exceptionAllowed?: boolean;
  
  // Anti-Split Circumvention Detection Settings
  splitDetectionWindowHours?: number; // e.g. 24 hours
  
  effectiveFrom?: string;
  effectiveUntil?: string;
  status?: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

export type PoAGrantorType = 'BOARD_RESOLUTION' | 'MANAGING_DIRECTOR' | 'CHAIRMAN' | 'LEGAL_ENTITY';
export type PoAGranteeType = 'INTERNAL_OFFICER' | 'EXTERNAL_LEGAL_COUNSEL' | 'CUSTOMS_BROKER' | 'COMMERCIAL_AGENT';
export type PoAScopeCategory = 
  | 'GENERAL_COMMERCIAL'
  | 'BANKING_OPERATIONS'
  | 'CUSTOMS_CLEARANCE'
  | 'LITIGATION_LEGAL'
  | 'TAX_REPRESENTATION'
  | 'REAL_ESTATE_LEASING'
  | 'SPECIFIC_TRANSACTION';

export interface PowerOfAttorney {
  id: string;
  poaNumber: string; // e.g. 'POA-2026-0001'
  legalEntityId: string;
  grantorType: PoAGrantorType;
  grantorEntityOrUserId: string;
  grantorSupportingDecisionId?: string; // Supporting Board / Shareholder Resolution
  
  granteeType: PoAGranteeType;
  granteeUserId?: string; // If internal employee
  granteeExternalDetails?: {
    fullNameEn: string;
    fullNameAr: string;
    nationalIdOrPassport: string;
    firmOrLawOfficeName?: string;
    professionalLicenseNumber?: string;
  };
  
  scopeCategory: PoAScopeCategory;
  powersDescription: string;
  limitations: string;
  monetaryLimitAmount?: number;
  monetaryLimitCurrency?: string;
  isSubDelegationAllowed: boolean;
  
  notarizationDetails?: {
    notaryPublicName: string;
    notarizationDate: string;
    notarizationNumber: string;
    apostilleReference?: string;
    statutoryFilingReference?: string;
  };
  
  documentId?: string; // Scanned deed in DMS
  evidenceRecordId?: string; // Immutable Vault Evidence Record
  
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
  
  revokedAt?: string;
  revokedByUserId?: string;
  revocationReason?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorityEvaluationRequest {
  legalEntityId: string;
  departmentId?: string;
  requesterUserId: string;
  requesterRole: string;
  approverUserId: string;
  approverRole: string;
  approverLegalEntityId?: string;
  transactionType: FinancialTransactionType;
  amount: number;
  currency: string;
  transactionReference: string;
  timestamp?: string;
  supportingPoAId?: string;
}

export interface AuthorityEvaluationResult {
  isAuthorized: boolean;
  denialCode?: 
    | 'THRESHOLD_EXCEEDED' 
    | 'SELF_APPROVAL_PROHIBITED' 
    | 'DELEGATION_EXPIRED' 
    | 'DELEGATION_REVOKED' 
    | 'WRONG_LEGAL_ENTITY' 
    | 'UNAUTHORIZED_ROLE' 
    | 'SPLIT_TRANSACTION_FLAGGED' 
    | 'DUAL_APPROVAL_REQUIRED' 
    | 'BOARD_RESOLUTION_REQUIRED' 
    | 'POA_REVOKED_OR_EXPIRED' 
    | 'UNAUTHORIZED_SUB_DELEGATION'
    | 'TECHNICAL_ADMIN_BYPASS_BLOCKED';
  reason: string;
  evaluatedRule?: FinancialApprovalMatrixRule;
  matchedDelegation?: DelegationOfAuthority;
  matchedPoA?: PowerOfAttorney;
  normalizedAmount: number;
  baseCurrency: string;
  requiredTier: number;
  requiredRoles: string[];
  dualApprovalRequired: boolean;
  escalationRequired: boolean;
  escalationTarget?: 'CFO' | 'CEO' | 'BOARD_OF_DIRECTORS';
  auditCorrelationId: string;
}

export interface SplitTransactionRiskResult {
  isSplitDetected: boolean;
  detectedTransactionsCount: number;
  cumulativeAmount: number;
  thresholdAmount: number;
  windowHours: number;
  riskSeverity: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL';
  reason?: string;
}

// ============================================================================
// 9. ENTERPRISE GOVERNANCE RISK, CONTROL ASSURANCE, EXCEPTIONS & FINDINGS
// ============================================================================

export type GovernanceRiskCategory =
  | 'GOVERNANCE'
  | 'COMPLIANCE'
  | 'LEGAL'
  | 'FINANCIAL'
  | 'OPERATIONAL'
  | 'TECHNOLOGY'
  | 'SECURITY'
  | 'DATA_PRIVACY'
  | 'THIRD_PARTY'
  | 'STRATEGIC'
  | 'REGULATORY';

export type RiskTreatmentStrategy =
  | 'MITIGATE'
  | 'AVOID'
  | 'TRANSFER'
  | 'ACCEPT'
  | 'MONITOR';

export type GovernanceRiskStatus =
  | 'IDENTIFIED'
  | 'ASSESSED'
  | 'TREATMENT_IN_PROGRESS'
  | 'MONITORING'
  | 'ACCEPTED'
  | 'MITIGATED'
  | 'CLOSED'
  | 'REOPENED';

export type RiskAssessmentType =
  | 'INHERENT'
  | 'RESIDUAL'
  | 'PERIODIC_REVIEW'
  | 'CONTROL_FAILURE_TRIGGERED'
  | 'REMEDIATION_TRIGGERED';

export interface RiskAssessmentRecord {
  id: string;
  riskId: string;
  assessmentDate: string;
  assessorUserId: string;
  assessorRole: string;
  assessmentType: RiskAssessmentType;
  likelihood: number; // 1 to 5
  impact: number; // 1 to 5
  score: number; // 1 to 25
  severity: GovernanceRiskSeverity;
  rationale: string;
  associatedControlIds?: string[];
  associatedFindingIds?: string[];
  auditCorrelationId: string;
}

export interface GovernanceRisk {
  id: string;
  riskNumber: string; // e.g. 'RSK-2026-0001'
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  riskCategory: GovernanceRiskCategory;
  title: string;
  description: string;
  
  sourceType: 
    | 'INTERNAL_AUDIT'
    | 'COMPLIANCE_ASSESSMENT'
    | 'REGULATORY_CHANGE'
    | 'INCIDENT'
    | 'STRATEGIC_REVIEW'
    | 'CONTROL_FAILURE'
    | 'MANUAL';
  sourceResourceId?: string;
  
  ownerUserId: string;
  ownerRole?: string;
  responsibleDepartmentId?: string;
  
  // 1. Inherent Risk (Prior to internal controls)
  inherentLikelihood: number; // 1 to 5
  inherentImpact: number; // 1 to 5
  inherentScore: number; // 1 to 25
  inherentSeverity: GovernanceRiskSeverity;
  inherentAssessmentRationale?: string;
  
  // 2. Control Mapping
  controlIds: string[]; // Linked to InternalControl (GOV-10)
  controlEffectivenessSummary: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'UNTESTED' | 'NO_CONTROLS';
  
  // 3. Residual Risk (After mitigating controls & treatment)
  residualLikelihood: number; // 1 to 5
  residualImpact: number; // 1 to 5
  residualScore: number; // 1 to 25
  residualSeverity: GovernanceRiskSeverity;
  residualAssessmentRationale?: string;
  
  // 4. Treatment & Mitigation Plan
  riskTreatmentStrategy: RiskTreatmentStrategy;
  mitigationPlanDescription?: string;
  targetMitigationDate?: string;
  
  // 5. Privileged Risk Acceptance (Must satisfy Authority Matrix / Board Decision)
  isRiskAccepted: boolean;
  acceptedByUserId?: string;
  acceptedByRole?: string;
  acceptedAt?: string;
  acceptedUntil?: string; // Time-bound acceptance expiry
  acceptanceReason?: string;
  supportingDecisionId?: string; // Supporting Board / Exec Resolution (GOV-06)
  acceptanceEvidenceId?: string; // Linked EvidenceRecord (GOV-09)
  
  // 6. Lifecycle, Reviews & Historical Log
  riskStatus: GovernanceRiskStatus;
  assessmentHistory: RiskAssessmentRecord[]; // Immutable historical trajectory
  lastAssessedAt: string;
  nextReviewDate?: string;
  
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// Backward-compatibility alias
export type ComplianceRisk = GovernanceRisk;

// ----------------------------------------------------------------------------
// Control Assurance & Assessment (GOV-11)
// ----------------------------------------------------------------------------

export type ControlAssessmentType =
  | 'OPERATING_EFFECTIVENESS'
  | 'DESIGN_EFFECTIVENESS'
  | 'COMPREHENSIVE'
  | 'SURPRISE_AUDIT';

export type ControlAssessmentResult =
  | 'EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'INEFFECTIVE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_TESTED';

export interface ControlAssessment {
  id: string;
  controlId: string; // Linked to InternalControl (GOV-10)
  controlCode: string; // e.g. 'CTL-FIN-001'
  legalEntityId: string;
  assessmentPeriod: string; // e.g. '2026-Q1'
  assessmentType: ControlAssessmentType;
  
  assessorUserId: string;
  assessorRole: string;
  isIndependentAssessor: boolean; // SoD: Control Owner != Assessor
  
  testProcedure: string;
  sampleSize?: number;
  sampleReference?: string;
  
  designEffectiveness: 'EFFECTIVE' | 'DEFICIENT' | 'NOT_APPLICABLE';
  operatingEffectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT';
  overallResult: ControlAssessmentResult;
  findingsSummary?: string;
  
  evidenceIds: string[]; // Linked to EvidenceRecord (GOV-09)
  findingIds: string[]; // Generated findings if control is deficient
  propagatedToRiskIds: string[]; // Risks whose residual risk was adjusted
  
  assessedAt: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Governance & Policy Exceptions (GOV-11)
// ----------------------------------------------------------------------------

export type GovernanceExceptionType =
  | 'POLICY_EXCEPTION'
  | 'CONTROL_EXCEPTION'
  | 'COMPLIANCE_EXCEPTION'
  | 'AUTHORITY_EXCEPTION'
  | 'SECURITY_EXCEPTION'
  | 'PROCESS_EXCEPTION';

export type GovernanceExceptionStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'RISK_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'CLOSED';

export interface CompensatingControlRecord {
  controlId?: string;
  description: string;
  verifiedByUserId?: string;
  isVerified: boolean;
  verificationEvidenceId?: string;
}

export interface GovernanceException {
  id: string;
  exceptionNumber: string; // e.g. 'EXC-2026-0001'
  exceptionType: GovernanceExceptionType;
  legalEntityId: string;
  departmentId?: string;
  
  sourceResourceType: 
    | 'POLICY'
    | 'POLICY_VERSION'
    | 'INTERNAL_CONTROL'
    | 'COMPLIANCE_OBLIGATION'
    | 'DELEGATION_OF_AUTHORITY'
    | 'FINANCIAL_AUTHORITY_MATRIX';
  sourceResourceId: string;
  sourceResourceTitle?: string;
  
  requestedByUserId: string;
  requestedByRole: string;
  reason: string;
  businessJustification: string;
  riskSummary: string;
  riskRating: GovernanceRiskSeverity;
  
  compensatingControls: CompensatingControlRecord[];
  
  // Time-Bound Constraints (Statutory mandatory)
  effectiveFrom: string;
  effectiveUntil: string;
  isPermanent: boolean; // strictly controlled; requires Board Resolution
  
  status: GovernanceExceptionStatus;
  
  // Approval Authority & Separation of Duties
  approvedByUserId?: string;
  approvedByRole?: string;
  approvedAt?: string;
  supportingDecisionId?: string; // Required for High/Critical risk exceptions
  evidenceIds: string[]; // GOV-09 Evidence Vault
  
  revokedAt?: string;
  revokedByUserId?: string;
  revocationReason?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Governance Findings & Remediation (GOV-11)
// ----------------------------------------------------------------------------

export type FindingSourceType =
  | 'CONTROL_ASSESSMENT'
  | 'COMPLIANCE_REVIEW'
  | 'INTERNAL_AUDIT'
  | 'EXTERNAL_AUDIT'
  | 'REGULATORY_REVIEW'
  | 'RISK_ASSESSMENT'
  | 'POLICY_EXCEPTION'
  | 'SECURITY_REVIEW'
  | 'MANUAL_REVIEW';

export type FindingRootCauseCategory =
  | 'PROCESS_DEFICIENCY'
  | 'TRAINING_GAP'
  | 'SYSTEM_FAILURE'
  | 'MANAGEMENT_OVERRIDE'
  | 'HUMAN_ERROR'
  | 'VENDOR_FAILURE'
  | 'EXTERNAL_REGULATORY_CHANGE';

export interface FindingReopenRecord {
  reopenedAt: string;
  reopenedByUserId: string;
  reopenReason: string;
  previousClosureDetails: {
    closedAt: string;
    closedByUserId: string;
    verifiedByUserId?: string;
  };
}

export interface GovernanceFinding {
  id: string;
  findingNumber: string; // e.g. 'FND-2026-0001'
  fingerprint: string; // Deterministic hash: legalEntityId + sourceType + sourceResourceId + title
  legalEntityId: string;
  departmentId?: string;
  
  sourceType: FindingSourceType;
  sourceResourceId?: string;
  
  title: string;
  description: string;
  severity: GovernanceRiskSeverity;
  
  riskId?: string; // Linked GovernanceRisk
  controlId?: string; // Linked InternalControl
  obligationId?: string; // Linked ComplianceObligation
  
  ownerUserId: string;
  ownerRole?: string;
  responsibleDepartmentId?: string;
  
  rootCauseCategory?: FindingRootCauseCategory;
  rootCauseNarrative?: string;
  
  status: FindingLifecycleState;
  openedAt: string;
  dueDate: string;
  
  evidenceIds: string[]; // Required closure evidence
  
  closedAt?: string;
  closedByUserId?: string;
  verifiedByUserId?: string;
  verificationNotes?: string;
  
  reopenHistory: FindingReopenRecord[];
  
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledByUserId?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemediationAction {
  id: string;
  findingId: string;
  actionNumber: string; // e.g. 'ACT-2026-0001'
  legalEntityId: string;
  
  title: string;
  actionDescription: string;
  ownerUserId: string;
  ownerRole?: string;
  
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  
  status: 
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'PENDING_EVIDENCE'
    | 'PENDING_VERIFICATION'
    | 'VERIFIED'
    | 'COMPLETED'
    | 'CLOSED'
    | 'OVERDUE'
    | 'DEFERRED'
    | 'CANCELLED'
    | 'REOPENED';
    
  completionEvidenceIds: string[]; // Linked to EvidenceRecord (GOV-09)
  completedAt?: string;
  completedByUserId?: string;
  
  verifiedAt?: string;
  verifiedByUserId?: string;
  verificationNotes?: string;
  
  escalationLevel: number; // 0: None, 1: Manager, 2: Director/CFO, 3: CEO/Board
  lastEscalatedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// STEP GOV-12: INTERNAL AUDIT, ASSURANCE PLANNING & CONTROL TESTING
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Audit Universe & Auditable Entities (GOV-12)
// ----------------------------------------------------------------------------

export type AuditUniverseCategory =
  | 'BUSINESS_UNIT'
  | 'LEGAL_ENTITY'
  | 'FINANCIAL_PROCESS'
  | 'OPERATIONAL_PROCESS'
  | 'IT_SYSTEM'
  | 'SHARED_SERVICE'
  | 'REGULATORY_DOMAIN'
  | 'STRATEGIC_INITIATIVE';

export interface AuditUniverseEntity {
  id: string;
  entityCode: string; // e.g. 'AUE-KSA-LOGISTICS-01'
  legalEntityId: string;
  departmentId?: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  entityCategory: AuditUniverseCategory;
  riskRating: GovernanceRiskSeverity; // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  auditCycleMonths: number; // e.g. 12, 24, 36 months
  lastAuditedDate?: string;
  nextAuditDueDate: string;
  inScope: boolean;
  auditableUnitLeadRole?: string;
  associatedRiskIds: string[]; // Linked to GovernanceRisk (GOV-11)
  associatedControlIds: string[]; // Linked to InternalControl (GOV-10)
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 2. Annual & Multi-Year Audit Plans (GOV-12)
// ----------------------------------------------------------------------------

export type AuditPlanStatus =
  | 'DRAFT'
  | 'PROPOSED'
  | 'AUDIT_COMMITTEE_REVIEW'
  | 'AUDIT_COMMITTEE_APPROVED'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'AMENDED'
  | 'CANCELLED';

export interface PlannedEngagementItem {
  auditUniverseEntityId: string;
  titleEn: string;
  titleAr?: string;
  plannedQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  budgetedHours: number;
  assignedLeadAuditorUserId?: string;
  riskRating: GovernanceRiskSeverity;
}

export interface AnnualAuditPlan {
  id: string;
  planNumber: string; // e.g. 'PLN-2026-0001'
  planYear: number;
  legalEntityId: string; // Or group level
  titleEn: string;
  titleAr?: string;
  executiveSummaryEn?: string;
  executiveSummaryAr?: string;
  status: AuditPlanStatus;
  
  auditCommitteeDecisionId?: string; // Formal Resolution from GOV-06
  approvedByUserId?: string;
  approvedByRole?: string; // 'AUDIT_COMMITTEE_CHAIR' | 'CAE'
  approvedAt?: string;
  
  charterDocumentId?: string; // Reference to Audit Charter Document
  budgetedHoursTotal: number;
  allocatedHoursTotal: number;
  
  plannedEngagements: PlannedEngagementItem[];
  engagementIds: string[]; // Instantiated AuditEngagements
  
  amendmentHistory: {
    amendedAt: string;
    amendedByUserId: string;
    reason: string;
    decisionId?: string;
  }[];
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 3. Audit Engagements & Execution Lifecycle (GOV-12)
// ----------------------------------------------------------------------------

export type AuditEngagementType =
  | 'RISK_BASED'
  | 'STATUTORY_COMPLIANCE'
  | 'FINANCIAL_CONTROLS'
  | 'IT_GENERAL_CONTROLS'
  | 'OPERATIONAL_EFFICIENCY'
  | 'FRAUD_INVESTIGATION'
  | 'SPECIAL_INVESTIGATION'
  | 'FOLLOW_UP';

export type AuditEngagementStage =
  | 'PLANNING'
  | 'SCOPING'
  | 'FIELDWORK'
  | 'DRAFT_REPORT'
  | 'MANAGEMENT_RESPONSE'
  | 'FINAL_REPORT_ISSUED'
  | 'EXECUTIVE_PACK_PUBLISHED'
  | 'COMPLETED'
  | 'CANCELLED';

export type AuditOpinionType =
  | 'UNQUALIFIED_SATISFACTORY'
  | 'QUALIFIED_NEEDS_IMPROVEMENT'
  | 'UNSATISFACTORY_ADVERSE'
  | 'DISCLAIMER_INCONCLUSIVE';

export interface AuditEngagement {
  id: string;
  engagementNumber: string; // e.g. 'ENG-2026-0001'
  auditPlanId?: string;
  auditUniverseEntityId: string;
  legalEntityId: string;
  departmentId?: string;
  
  titleEn: string;
  titleAr?: string;
  engagementType: AuditEngagementType;
  stage: AuditEngagementStage;
  
  leadAuditorUserId: string;
  leadAuditorRole: string;
  auditTeamUserIds: string[];
  auditeeContactUserIds: string[];
  
  auditDirectorSignoffUserId?: string;
  auditDirectorSignoffAt?: string;
  
  scopeSummaryEn: string;
  scopeSummaryAr?: string;
  testingObjectives: string[];
  
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  budgetedHours?: number;
  actualHoursSpent?: number;
  
  workProgramIds: string[];
  workpaperIds: string[];
  controlTestIds: string[];
  findingIds: string[]; // Links to GovernanceFinding (GOV-11)
  
  auditOpinion?: AuditOpinionType;
  executiveSummaryEn?: string;
  executiveSummaryAr?: string;
  
  finalReportDocumentId?: string; // Document in Evidence / Document vault
  finalReportChecksumSha256?: string; // Cryptographic lock
  isReportLocked: boolean;
  lockedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 4. Audit Work Program & Workpapers (GOV-12)
// ----------------------------------------------------------------------------

export interface WorkProgramStep {
  stepNumber: number;
  procedureTitle: string;
  procedureDescription: string;
  controlId?: string;
  assignedAuditorUserId?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'WAIVED';
  workpaperId?: string;
  completedAt?: string;
}

export interface AuditWorkProgram {
  id: string;
  programNumber: string; // e.g. 'PRG-2026-0001'
  engagementId: string;
  legalEntityId: string;
  titleEn: string;
  titleAr?: string;
  objective: string;
  steps: WorkProgramStep[];
  status: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  approvedByUserId?: string;
  approvedAt?: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditWorkpaper {
  id: string;
  workpaperNumber: string; // e.g. 'WP-2026-0001'
  engagementId: string;
  workProgramId?: string;
  legalEntityId: string;
  titleEn: string;
  titleAr?: string;
  objective: string;
  testingNotes: string;
  samplingMethodology?: string;
  populationCount?: number;
  sampleCount?: number;
  exceptionsNotedCount: number;
  conclusion: string;
  
  evidenceIds: string[]; // Linked to EvidenceRecord (GOV-09)
  attachedDocumentIds?: string[];
  
  preparedByUserId: string;
  preparedAt: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  isSignoffComplete: boolean;
  
  checksumSha256: string;
  isLocked: boolean;
  lockedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 5. Control Testing & Effectiveness Worksheets (GOV-12)
// ----------------------------------------------------------------------------

export type ControlTestType =
  | 'DESIGN_EFFECTIVENESS'
  | 'OPERATING_EFFECTIVENESS'
  | 'DUAL_PURPOSE';

export type ControlTestingMethod =
  | 'INSPECTION'
  | 'OBSERVATION'
  | 'INQUIRY'
  | 'REPERFORMANCE'
  | 'ANALYTICAL_REVIEW'
  | 'AUTOMATED_BENCHMARKING';

export type ControlTestFrequency =
  | 'CONTINUOUS'
  | 'MULTIPLE_PER_DAY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUAL';

export type ControlTestResultOutcome =
  | 'EFFECTIVE'
  | 'DEFICIENT'
  | 'SIGNIFICANT_DEFICIENCY'
  | 'MATERIAL_WEAKNESS'
  | 'INCONCLUSIVE';

export interface ControlTestSampleItem {
  sampleId: string;
  itemIdentifier: string; // Transaction / Doc / Batch ID
  transactionDate?: string;
  testedAttributeValues: Record<string, boolean | string | number>;
  isCompliant: boolean;
  deviationNotes?: string;
  evidenceId?: string;
}

export interface ControlTestWorksheet {
  id: string;
  testNumber: string; // e.g. 'CTW-2026-0001'
  engagementId?: string;
  controlId: string; // Linked to InternalControl (GOV-10)
  controlCode: string;
  legalEntityId: string;
  
  testType: ControlTestType;
  testingMethod: ControlTestingMethod;
  frequency: ControlTestFrequency;
  
  populationSize: number;
  sampleSize: number;
  samples: ControlTestSampleItem[];
  exceptionsIdentifiedCount: number;
  
  testOutcome: ControlTestResultOutcome;
  detailedAnalysis: string;
  
  testerUserId: string;
  testerRole: string;
  testedAt: string;
  
  reviewerUserId?: string;
  reviewedAt?: string;
  isReviewCompleted: boolean;
  
  generatedFindingId?: string; // Auto-generated finding in GOV-11 upon DEFICIENT/MATERIAL_WEAKNESS
  evidenceIds: string[]; // Linked to EvidenceRecord (GOV-09)
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 6. Management Action Plans (MAP) & Remediation Verification (GOV-12)
// ----------------------------------------------------------------------------

export type RootCauseMethodology =
  | 'FIVE_WHYS'
  | 'FISHBONE'
  | 'BARRIER_ANALYSIS'
  | 'DIRECT_OBSERVATION';

export type ManagementActionStatus =
  | 'PROPOSED'
  | 'AUDITOR_ACCEPTED'
  | 'IN_IMPLEMENTATION'
  | 'SUBMITTED_FOR_VERIFICATION'
  | 'RE_TESTING'
  | 'VERIFIED_CLOSED'
  | 'OVERDUE'
  | 'TARGET_REVISED'
  | 'UNRESOLVED_ESCALATED';

export interface ManagementActionPlan {
  id: string;
  mapNumber: string; // e.g. 'MAP-2026-0001'
  findingId: string; // Linked to GovernanceFinding (GOV-11)
  engagementId?: string;
  legalEntityId: string;
  departmentId?: string;
  
  actionTitle: string;
  actionDetails: string;
  managementResponse: string;
  
  rootCauseMethodology: RootCauseMethodology;
  rootCauseSummary: string;
  
  targetImplementationDate: string;
  actionOwnerUserId: string;
  actionOwnerRole: string;
  
  status: ManagementActionStatus;
  
  dateRevisionHistory: {
    revisedAt: string;
    revisedByUserId: string;
    previousTargetDate: string;
    newTargetDate: string;
    revisionReason: string;
    approvedByUserId?: string;
  }[];
  
  completionEvidenceIds: string[]; // GOV-09 Evidence Vault
  completedAt?: string;
  completedByUserId?: string;
  
  reTestingRecord?: {
    reTestedByUserId: string;
    reTestedAt: string;
    testProcedure: string;
    isRemediationEffective: boolean;
    evidenceIds: string[];
    notes: string;
  };
  
  verifiedClosedAt?: string;
  verifiedClosedByUserId?: string;
  verificationNotes?: string;
  
  escalationLevel: number; // 0: Normal, 1: Dept Head, 2: CAE/CFO, 3: Audit Committee
  lastEscalatedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 7. Audit Committee Reporting & 3LoD Assurance Summary (GOV-12)
// ----------------------------------------------------------------------------

export interface AuditCommitteePack {
  id: string;
  packNumber: string; // e.g. 'ACP-2026-Q1'
  reportingPeriod: string; // e.g. '2026-Q1'
  legalEntityIds: string[];
  titleEn: string;
  titleAr?: string;
  
  totalAuditsPlanned: number;
  totalAuditsCompleted: number;
  totalAuditsInProgress: number;
  
  findingsSummary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    openCount: number;
    closedCount: number;
  };
  
  overdueActionsCount: number;
  repeatFindingsCount: number;
  
  assuranceScorecard: {
    legalEntityId: string;
    firstLineScorePercentage: number;
    secondLineScorePercentage: number;
    thirdLineAuditOpinion: AuditOpinionType;
    compositeAssuranceLevel: 'STRONG' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'SIGNIFICANT_EXPOSURE';
  }[];
  
  publishedAt: string;
  publishedByUserId: string;
  
  auditCommitteeChairSignoffUserId?: string;
  auditCommitteeChairSignoffAt?: string;
  
  finalPackDocumentId?: string; // Evidence Document Vault
  finalPackChecksumSha256?: string;
  isPackLocked: boolean;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 11. STEP GOV-13 — BOARD & COMMITTEE OVERSIGHT, EXECUTIVE ATTESTATIONS,
//     GOVERNANCE PERFORMANCE, MANAGEMENT INFORMATION & REGULATORY REPORTING
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Configurable Governance Policy Resolution & Provenance (INVARIANT-01)
// ----------------------------------------------------------------------------

export type GovernanceRuleCategory =
  | 'AUDIT_ASSURANCE'
  | 'RISK_MANAGEMENT'
  | 'INTERNAL_CONTROLS'
  | 'COMPLIANCE_ESCALATION'
  | 'EXECUTIVE_ATTESTATION'
  | 'BOARD_OVERSIGHT';

export type PolicyEvaluationBehavior = 'PROSPECTIVE' | 'CONTROLLED_RECALCULATION';

export interface GovernanceRuleItem {
  key: string;
  value: any;
  dataType: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'JSON' | 'ARRAY';
  descriptionEn: string;
  isParentMandatoryFloor?: boolean; // Cannot be weakened by local entity
  isJurisdictionMandatory?: boolean; // Imposed by local statute
}

export interface GovernanceProvenanceStep {
  sourceLayer: 'GLOBAL_GUARDRAILS' | 'JURISDICTION_STATUTE' | 'ENTITY_POLICY' | 'AUTHORIZED_EXCEPTION';
  policyId?: string;
  policyVersionId?: string;
  decisionId?: string;
  jurisdiction?: GovernanceJurisdiction;
  appliedAt: string;
  summary: string;
}

export interface EffectiveGovernanceRuleSet {
  id: string;
  legalEntityId: string;
  jurisdictionContext: GovernanceJurisdiction;
  ruleCategory: GovernanceRuleCategory;
  supportingPolicyVersionId: string;
  supportingDecisionId?: string;
  
  effectiveRules: Record<string, any>;
  ruleSetHashSha256: string;
  
  effectiveFrom: string;
  effectiveUntil?: string;
  
  provenanceChain: GovernanceProvenanceStep[];
  resolutionStatus: 'RESOLVED' | 'CONFLICT_DETECTED' | 'INSUFFICIENT_PROVENANCE' | 'PARENT_FLOOR_VIOLATION';
  conflictReason?: string;
  
  evaluatedAt: string;
  evaluatedByUserId: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 2. Governance Metric Definitions, Snapshots & Lineage (GOV-13)
// ----------------------------------------------------------------------------

export type GovernanceMetricType =
  | 'KPI'
  | 'KRI'
  | 'CONTROL_METRIC'
  | 'COMPLIANCE_METRIC'
  | 'AUDIT_METRIC'
  | 'BOARD_METRIC';

export type MetricStatusLevel = 'NORMAL' | 'WARNING' | 'BREACH';

export interface GovernanceMetricDefinition {
  id: string;
  metricCode: string; // e.g. 'KRI-FIN-001', 'KPI-OPS-TEMP'
  versionNumber: number;
  metricType: GovernanceMetricType;
  
  nameEn: string;
  nameAr?: string;
  descriptionEn: string;
  
  calculationFormula: string;
  unitOfMeasure: 'PERCENTAGE' | 'COUNT' | 'CURRENCY' | 'DAYS' | 'SCORE_1_TO_5' | 'RATIO';
  aggregationMethod: 'SUM' | 'AVERAGE' | 'MAX' | 'MIN' | 'LATEST_POINT_IN_TIME';
  sourceEntityType: string;
  
  reportingFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  targetThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  
  supportingPolicyVersionId: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT' | 'DEPRECATED';
  
  effectiveFrom: string;
  effectiveUntil?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricAdjustmentRecord {
  adjustedAt: string;
  adjustedByUserId: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
  supportingDecisionId?: string;
  evidenceIds: string[];
}

export interface GovernanceMetricSnapshot {
  id: string;
  snapshotCode: string; // e.g. 'SNP-2026-Q1-001'
  metricDefinitionId: string;
  metricDefinitionVersion: number;
  metricCode: string;
  
  reportingPeriod: string; // e.g. '2026-Q1', '2026-03'
  legalEntityId: string;
  
  calculatedValue: number;
  targetValue: number;
  warningValue: number;
  criticalValue: number;
  statusLevel: MetricStatusLevel;
  
  sourceRecordIds: string[]; // Strict lineage tracking
  calculationNotes?: string;
  
  calculatedAt: string;
  calculatedByUserId: string;
  
  checksumSha256: string;
  isLocked: boolean;
  
  isAdjusted: boolean;
  adjustmentRecord?: MetricAdjustmentRecord;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 3. Risk Appetite Framework & Breach Management (GOV-13)
// ----------------------------------------------------------------------------

export type RiskAppetiteLevel = 'ZERO_TOLERANCE' | 'LOW' | 'MODERATE' | 'HIGH' | 'FLEXIBLE';
export type RiskBreachStatus = 'DETECTED' | 'ACKNOWLEDGED' | 'ACTION_REQUIRED' | 'ESCALATED' | 'RESOLVED';

export interface QuantitativeKriThreshold {
  metricCode: string;
  maxAcceptableThreshold: number;
  unit: string;
}

export interface RiskAppetiteStatement {
  id: string;
  statementCode: string; // e.g. 'RAS-2026-OPS'
  versionNumber: number;
  legalEntityId: string; // 'GLOBAL' or specific entity ID
  category: GovernanceRiskCategory;
  appetiteLevel: RiskAppetiteLevel;
  
  qualitativeStatementEn: string;
  qualitativeStatementAr?: string;
  quantitativeKriThresholds: QuantitativeKriThreshold[];
  
  supportingDecisionId: string; // Mandatory Board Decision
  supportingPolicyVersionId: string;
  
  effectiveFrom: string;
  effectiveUntil?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAppetiteBreach {
  id: string;
  breachNumber: string; // e.g. 'BRC-2026-0001'
  appetiteStatementId: string;
  metricSnapshotId?: string;
  legalEntityId: string;
  category: GovernanceRiskCategory;
  breachSeverity: GovernanceRiskSeverity;
  
  observedValue: number;
  tolerableLimit: number;
  breachSummaryEn: string;
  
  status: RiskBreachStatus;
  detectedAt: string;
  
  acknowledgedAt?: string;
  acknowledgedByUserId?: string;
  
  resolutionActionPlanId?: string; // Linked GovernanceAction
  escalationLevel: number;
  lastEscalatedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 4. Executive Attestations & Management Representations (GOV-13)
// ----------------------------------------------------------------------------

export type ExecutiveAttestationType =
  | 'FINANCIAL_CONTROLS_ATTESTATION'
  | 'COMPLIANCE_EFFECTIVENESS'
  | 'RISK_MANAGEMENT_ATTESTATION'
  | 'INTERNAL_CONTROLS_ADEQUACY'
  | 'DATA_INTEGRITY_REPRESENTATION'
  | 'REGULATORY_SUBMISSION_REPRESENTATION';

export type AttestationStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'INVALIDATED';

export interface AttestationDisclosedException {
  exceptionTitle: string;
  severity: GovernanceRiskSeverity;
  details: string;
  compensatingControlId?: string;
}

export interface ExecutiveAttestation {
  id: string;
  attestationNumber: string; // e.g. 'ATT-2026-Q1-001'
  attestationType: ExecutiveAttestationType;
  legalEntityId: string;
  departmentId?: string;
  reportingPeriod: string;
  
  statementVersionId: string;
  pinnedStatementTextEn: string;
  pinnedStatementTextAr?: string;
  
  attestorUserId: string;
  attestorRole: string;
  attestorAuthorityId?: string; // From GOV-10 Authority Engine
  
  supportingEvidenceRecordIds: string[]; // From GOV-09 Evidence Vault
  disclosedExceptions: AttestationDisclosedException[];
  
  policyVersionId: string;
  supportingDecisionId?: string;
  
  signedAt?: string;
  status: AttestationStatus;
  
  verificationRecord?: {
    verifiedByUserId: string;
    verifiedAt: string;
    isEvidenceAdequate: boolean;
    notes: string;
  };
  
  checksumSha256?: string;
  isLocked: boolean;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 5. Board & Committee Reporting Packs (GOV-13)
// ----------------------------------------------------------------------------

export type GovernanceReportingPackType =
  | 'BOARD'
  | 'AUDIT_COMMITTEE'
  | 'RISK_COMMITTEE'
  | 'REMUNERATION_COMMITTEE'
  | 'EXECUTIVE_COMMITTEE'
  | 'COMPLIANCE_COMMITTEE';

export type GovernancePackStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED_FOR_PUBLICATION'
  | 'PUBLISHED'
  | 'SUPERSEDED';

export interface GovernancePackSection {
  sectionCode: string;
  title: string;
  order: number;
  executiveSummaryText: string;
  metricsSnapshotIds: string[];
  criticalRiskIds: string[];
  keyFindingIds: string[];
  attestationIds: string[];
  decisionsPendingIds: string[];
}

export interface GovernanceReportingPack {
  id: string;
  packNumber: string; // e.g. 'BP-2026-Q1-001'
  packType: GovernanceReportingPackType;
  reportingPeriod: string;
  legalEntityIds: string[];
  
  titleEn: string;
  titleAr?: string;
  versionNumber: number;
  status: GovernancePackStatus;
  
  meetingId?: string; // Linked to BoardMeeting (GOV-06)
  supportingDecisionId?: string;
  
  sections: GovernancePackSection[];
  
  publishedAt?: string;
  publishedByUserId?: string;
  
  boardChairSignoffUserId?: string;
  boardChairSignoffAt?: string;
  
  supersededByPackId?: string;
  checksumSha256?: string;
  isPackLocked: boolean;
  securityClassification: SecurityClassification;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 6. Board Review, Challenge & Governance Action Tracking (GOV-13)
// ----------------------------------------------------------------------------

export type GovernanceChallengeStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'RESPONSE_SUBMITTED'
  | 'REVIEWED'
  | 'CLOSED';

export interface GovernanceChallenge {
  id: string;
  challengeNumber: string; // e.g. 'CHL-2026-0001'
  packId: string;
  legalEntityId: string;
  
  raisedByUserId: string;
  raisedByRole: string; // e.g. 'BOARD_DIRECTOR', 'AUDIT_COMMITTEE_MEMBER'
  
  targetCategory: 'METRIC' | 'RISK' | 'FINDING' | 'ATTESTATION' | 'DECISION' | 'GENERAL';
  targetEntityId?: string;
  
  challengeTitle: string;
  challengeDetails: string;
  
  assignedToUserId: string;
  assignedToRole: string;
  
  status: GovernanceChallengeStatus;
  
  managementResponse?: string;
  responseSubmittedAt?: string;
  responseSubmittedByUserId?: string;
  
  reviewNotes?: string;
  reviewedByUserId?: string;
  closedAt?: string;
  
  reopenHistory: {
    reopenedAt: string;
    reopenedByUserId: string;
    reason: string;
  }[];
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export type GovernanceActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED_CLOSED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface GovernanceAction {
  id: string;
  actionNumber: string; // e.g. 'ACT-2026-0001'
  sourceType: 'BOARD_MEETING' | 'COMMITTEE_CHALLENGE' | 'RISK_BREACH' | 'ATTESTATION_DISCLOSURE' | 'AUDIT_RECOMMENDATION';
  sourceReferenceId: string;
  legalEntityId: string;
  
  title: string;
  details: string;
  
  ownerUserId: string;
  ownerRole: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  status: GovernanceActionStatus;
  
  completionNotes?: string;
  completedAt?: string;
  evidenceIds: string[]; // GOV-09 Evidence Vault
  
  verifiedByUserId?: string;
  verifiedAt?: string;
  
  escalationLevel: number;
  lastEscalatedAt?: string;
  
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 7. GOVERNANCE OPERATING CALENDAR & COMMITTEE ORCHESTRATION (GOV-14)
// ============================================================================

export type GovernanceCalendarCycleType =
  | 'BOARD_MEETING_CYCLE'
  | 'COMMITTEE_MEETING_CYCLE'
  | 'GOVERNANCE_MILESTONE'
  | 'ANNUAL_REPORTING_CYCLE'
  | 'EXECUTIVE_ATTESTATION_CYCLE'
  | 'RISK_COMPLIANCE_AUDIT_REPORTING_CYCLE'
  | 'POLICY_REVIEW_CYCLE';

export type GovernanceCommitteeType =
  | 'BOARD_OF_DIRECTORS'
  | 'AUDIT_COMMITTEE'
  | 'RISK_COMMITTEE'
  | 'REMUNERATION_COMMITTEE'
  | 'EXECUTIVE_COMMITTEE'
  | 'COMPLIANCE_COMMITTEE'
  | 'NOMINATION_GOVERNANCE_COMMITTEE';

export type GovernanceCycleFrequency =
  | 'ANNUAL'
  | 'SEMI_ANNUAL'
  | 'QUARTERLY'
  | 'MONTHLY'
  | 'BI_MONTHLY'
  | 'EXTRAORDINARY';

export type GovernanceCycleStatus =
  | 'PLANNED'
  | 'PREPARATION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface GovernanceMilestone {
  id: string;
  milestoneCode: string; // e.g. 'T_MINUS_14_AGENDA_CUTOFF', 'T_MINUS_7_PACK_DISTRIBUTION', 'T_MINUS_3_READINESS_LOCKDOWN', 'MEETING_DAY', 'T_PLUS_3_MINUTES_CIRCULATION', 'T_PLUS_7_ACTION_DISPATCH'
  title: string;
  targetDate: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAIVED';
  responsibleRole: string;
  responsibleUserId?: string;
  evidenceIds?: string[];
}

export interface GovernanceOperatingCycle {
  id: string;
  cycleNumber: string; // e.g. 'GOC-2026-Q1-BOD'
  legalEntityId: string;
  jurisdictionContext: GovernanceJurisdiction;
  committeeType: GovernanceCommitteeType;
  cycleType: GovernanceCalendarCycleType;
  year: number;
  quarter?: 1 | 2 | 3 | 4;
  month?: number;
  frequency: GovernanceCycleFrequency;
  
  titleEn: string;
  titleAr?: string;
  
  targetStartDate: string;
  targetEndDate: string;
  status: GovernanceCycleStatus;
  
  supportingPolicyVersionId: string;
  supportingDecisionId?: string;
  effectiveRuleSnapshot: Record<string, any>;
  ruleSetHashSha256: string;
  
  milestones: GovernanceMilestone[];
  meetingIds: string[];
  packIds: string[];
  attestationIds: string[];
  actionIds: string[];
  dependencyCycleIds?: string[];
  
  generatedAt: string;
  generatedByUserId: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export type CommitteeAgendaItemCategory =
  | 'GOVERNANCE_STATUTORY'
  | 'FINANCIAL_REVIEW'
  | 'RISK_APPETITE_KRI'
  | 'AUDIT_ASSURANCE'
  | 'COMPLIANCE_FILING'
  | 'STRATEGY_OPERATIONS'
  | 'DECISION_APPROVAL'
  | 'EXECUTIVE_ATTESTATION'
  | 'AOB';

export type CommitteeAgendaItemStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'LOCKED'
  | 'PRESENTED'
  | 'DEFERRED'
  | 'WITHDRAWN';

export interface CommitteeAgendaItem {
  id: string;
  meetingId: string;
  legalEntityId: string;
  itemNumber: number;
  title: string;
  titleAr?: string;
  category: CommitteeAgendaItemCategory;
  
  ownerUserId: string;
  ownerRole: string;
  presenterUserId?: string;
  allocatedMinutes: number;
  
  isDiscussionOnly: boolean;
  requiresDecision: boolean;
  linkedDecisionId?: string;
  
  preReadDocumentIds: string[];
  preReadDeadlineUtc: string;
  isPreReadDistributed: boolean;
  
  status: CommitteeAgendaItemStatus;
  isLocked: boolean;
  lockedByUserId?: string;
  lockedAtUtc?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MeetingWorkflowState =
  | 'DRAFT_SCHEDULED'
  | 'AGENDA_BUILDING'
  | 'AGENDA_LOCKED'
  | 'PACK_COMPILATION'
  | 'PACK_READY'
  | 'IN_SESSION'
  | 'ADJOURNED'
  | 'MINUTES_REVIEW'
  | 'MINUTES_APPROVED'
  | 'ACTIONS_DISPATCHED'
  | 'CONCLUDED'
  | 'CANCELLED';

export interface PackSectionReadinessCheck {
  sectionCode: string;
  title: string;
  isComplete: boolean;
  metricsValid: boolean;
  risksValid: boolean;
  findingsValid: boolean;
  attestationsValid: boolean;
  decisionsValid: boolean;
  evidenceValid: boolean;
  blockerReasons: string[];
}

export interface PackReadinessGateReport {
  packId: string;
  legalEntityId: string;
  packType: GovernanceReportingPackType;
  evaluatedAt: string;
  isReady: boolean;
  readinessScore: number; // 0 to 100
  sectionCheckResults: PackSectionReadinessCheck[];
  policyProvenanceValid: boolean;
  blockers: string[];
  warnings: string[];
  recommendedActions: string[];
}

export type CrossCommitteeSourceEntityType =
  | 'COMMITTEE_RECOMMENDATION'
  | 'RISK_APPETITE_BREACH'
  | 'AUDIT_FINDING'
  | 'POLICY_CHANGE_REQUEST';

export type CrossCommitteeTargetEntityType =
  | 'BOARD_DECISION'
  | 'COMMITTEE_REVIEW'
  | 'EXECUTIVE_ACTION';

export type CrossCommitteeDependencyStatus =
  | 'PENDING_HANDOFF'
  | 'HANDED_OFF'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

export interface CrossCommitteeDependency {
  id: string;
  dependencyNumber: string; // e.g. 'CCD-2026-0001'
  sourceCommitteeType: GovernanceCommitteeType;
  sourceEntityId: string;
  sourceEntityType: CrossCommitteeSourceEntityType;
  
  targetCommitteeType: GovernanceCommitteeType;
  targetEntityId?: string;
  targetEntityType: CrossCommitteeTargetEntityType;
  
  legalEntityId: string;
  title: string;
  description: string;
  
  status: CrossCommitteeDependencyStatus;
  handoffDate: string;
  resolvedDate?: string;
  resolutionSummary?: string;
  
  supportingPolicyVersionId: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export type GovernanceNotificationEventType =
  | 'MEETING_SCHEDULED'
  | 'AGENDA_LOCKED'
  | 'PRE_READ_AVAILABLE'
  | 'PACK_READY_FOR_REVIEW'
  | 'PACK_PUBLISHED'
  | 'ATTESTATION_DUE'
  | 'ACTION_ASSIGNED'
  | 'ACTION_DUE_SOON'
  | 'ACTION_OVERDUE'
  | 'ACTION_ESCALATED'
  | 'CHALLENGE_RAISED'
  | 'CHALLENGE_RESPONSE_SUBMITTED'
  | 'CROSS_COMMITTEE_HANDOFF';

export interface GovernanceNotificationDispatch {
  id: string;
  deduplicationKey: string;
  eventType: GovernanceNotificationEventType;
  legalEntityId: string;
  jurisdictionContext: GovernanceJurisdiction;
  
  recipientUserId: string;
  recipientRole: string;
  title: string;
  body: string;
  
  targetEntityType: string;
  targetEntityId: string;
  
  supportingPolicyVersionId: string;
  urgency: 'INFO' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  channel: 'IN_APP' | 'EMAIL' | 'PUSH' | 'MULTI_CHANNEL';
  
  dispatchedAt: string;
  isDelivered: boolean;
  deliveredAt?: string;
  isDeduplicated: boolean;
  auditCorrelationId: string;
}

export interface ExecutiveDeskView {
  userId: string;
  userRole: string;
  legalEntityId: string;
  calculatedAt: string;
  
  pendingAttestations: ExecutiveAttestation[];
  pendingPackSignoffs: GovernanceReportingPack[];
  pendingAgendaLocks: BoardMeeting[];
  pendingDecisionSignatures: CorporateDecision[];
  pendingActionExecutions: GovernanceAction[];
  pendingActionVerifications: GovernanceAction[];
  overdueActions: GovernanceAction[];
  escalatedActions: GovernanceAction[];
  openChallengesAssigned: GovernanceChallenge[];
  crossCommitteeDependenciesPending: CrossCommitteeDependency[];
  unreadyReportingPacks: {
    pack: GovernanceReportingPack;
    readinessReport: PackReadinessGateReport;
  }[];
  
  summaryCounts: {
    totalPendingItems: number;
    criticalItems: number;
    overdueCount: number;
    attestationCount: number;
    actionCount: number;
    packCount: number;
  };
}

// ============================================================================
// 8. CORPORATE SECRETARIAT & STATUTORY CORPORATE ACTIONS (GOV-15)
// ============================================================================

export type SecretariatInstructionType =
  | 'DIRECTOR_APPOINTMENT_INSTRUCTION'
  | 'DIRECTOR_REMOVAL_INSTRUCTION'
  | 'OFFICER_APPOINTMENT_INSTRUCTION'
  | 'OFFICER_REMOVAL_INSTRUCTION'
  | 'PSC_UPDATE_INSTRUCTION'
  | 'REGISTERED_OFFICE_UPDATE_INSTRUCTION'
  | 'LEGAL_ENTITY_PROFILE_INSTRUCTION'
  | 'AUTHORIZED_SIGNATORY_INSTRUCTION'
  | 'BANK_MANDATE_HANDOFF_INSTRUCTION'
  | 'POLICY_PUBLICATION_INSTRUCTION'
  | 'STATUTORY_FILING_INSTRUCTION'
  | 'POWER_OF_ATTORNEY_INSTRUCTION'
  | 'DELEGATION_OF_AUTHORITY_INSTRUCTION'
  | 'CORPORATE_REGISTER_UPDATE_INSTRUCTION';

export type SecretariatInstructionStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED'
  | 'SUPERSEDED';

export interface CorporateSecretariatInstruction {
  id: string;
  instructionNumber: string; // e.g. 'SEC-2026-0001'
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  instructionType: SecretariatInstructionType;
  
  sourceDecisionId?: string;
  sourceResolutionId?: string;
  sourceGovernanceActionId?: string;
  
  requestedByUserId: string;
  authorizedExecutorId: string;
  authorityReference?: string;
  doaId?: string;
  poaId?: string;
  policyVersionId: string;
  
  effectiveFrom: string;
  effectiveUntil?: string;
  
  executionStatus: SecretariatInstructionStatus;
  targetDomain: TargetExecutionDomain;
  targetResourceType: string;
  targetResourceId?: string;
  
  dueDate: string;
  evidenceRequirementIds?: string[];
  instructionNotes?: string;
  
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export type StatutoryCorporateActionType =
  | 'DIRECTOR_APPOINTMENT'
  | 'DIRECTOR_REMOVAL'
  | 'OFFICER_APPOINTMENT'
  | 'OFFICER_REMOVAL'
  | 'PSC_CHANGE'
  | 'REGISTERED_OFFICE_CHANGE'
  | 'LEGAL_ENTITY_PROFILE_CHANGE'
  | 'AUTHORIZED_SIGNATORY_CHANGE'
  | 'BANK_MANDATE_CHANGE'
  | 'POLICY_PUBLICATION'
  | 'STATUTORY_FILING'
  | 'CORPORATE_REGISTER_UPDATE'
  | 'POWER_OF_ATTORNEY_ISSUANCE'
  | 'POWER_OF_ATTORNEY_REVOCATION'
  | 'DELEGATION_ACTIVATION'
  | 'DELEGATION_REVOCATION';

export type CorporateActionExecutionStatus =
  | 'DRAFT'
  | 'READY_FOR_AUTHORIZATION'
  | 'AUTHORIZED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PENDING_EVIDENCE'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'RETRY_PENDING'
  | 'CANCELLED'
  | 'SUPERSEDED';

export interface CorporateActionPolicyRuleSet {
  id: string;
  policyVersionId: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  actionType: StatutoryCorporateActionType;
  
  requiresDecision: boolean;
  requiredDecisionType?: string;
  requiresResolution: boolean;
  requiredResolutionType?: ResolutionType;
  
  allowedAuthorityTypes: ('STATUTORY_DIRECTOR' | 'STATUTORY_OFFICER' | 'DELEGATED_DOA' | 'NOTARIZED_POA')[];
  doaAllowed: boolean;
  poaAllowed: boolean;
  
  requiresSoD: boolean;
  prohibitExecutorAsVerifier: boolean;
  prohibitSubmitterAsVerifier: boolean;
  prohibitTechAdminBypass: boolean;
  
  requiresExternalFiling: boolean;
  externalFilingType?: string;
  
  evidenceRequirementCodes: string[];
  slaHours: number;
  escalationPolicyTier: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface ExternalSubmissionRecord {
  id: string;
  submissionNumber: string; // e.g. 'SUB-2026-0001'
  corporateActionId: string;
  filingId?: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  
  submissionMethod: 'MANUAL_PORTAL' | 'ELECTRONIC_API' | 'EMAIL' | 'AUTHORIZED_AGENT';
  portalName?: string;
  agentName?: string;
  
  receiptReference?: string;
  receiptDocumentId?: string;
  receiptDocumentVersionId?: string;
  receiptChecksumSha256?: string;
  
  submittedByUserId: string;
  submittedAtUtc: string;
  outcomeStatus: 'SUCCESS' | 'REJECTED' | 'PENDING_ACKNOWLEDGMENT' | 'NETWORK_ERROR';
  rejectionReason?: string;
  
  auditCorrelationId: string;
}

export interface CorporateActionExecutionAttempt {
  id: string;
  attemptNumber: number;
  corporateActionId: string;
  executorUserId: string;
  executorRole: string;
  startedAtUtc: string;
  completedAtUtc?: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRY_PENDING';
  errorDetails?: string;
  domainResultReference?: string;
  idempotencyKey: string;
  auditCorrelationId: string;
}

export interface CorporateActionRecord {
  id: string;
  actionNumber: string; // e.g. 'CA-2026-0001'
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  actionType: StatutoryCorporateActionType;
  
  titleEn: string;
  titleAr?: string;
  description: string;
  
  sourceInstructionId?: string;
  sourceDecisionId?: string;
  sourceResolutionId?: string;
  sourceGovernanceActionId?: string;
  
  policyVersionId: string;
  pinnedRuleSetHashSha256: string;
  effectiveRuleSnapshot: Partial<CorporateActionPolicyRuleSet>;
  
  accountableOwnerUserId: string;
  accountableOwnerRole: string;
  authorizedExecutorUserId: string;
  authorizedExecutorRole: string;
  
  doaId?: string;
  poaId?: string;
  authorityReference?: string;
  
  status: CorporateActionExecutionStatus;
  executionDueDate: string;
  
  targetDomain: TargetExecutionDomain;
  targetResourceType: string;
  targetResourceId?: string;
  targetPayloadData?: Record<string, unknown>;
  
  executionAttempts: CorporateActionExecutionAttempt[];
  externalSubmissions: ExternalSubmissionRecord[];
  
  evidenceRecordIds: string[];
  pinnedEvidenceDocumentVersionIds: string[];
  
  verifierUserId?: string;
  verifiedAtUtc?: string;
  verificationNotes?: string;
  governedSignoffSealSha256?: string;
  
  idempotencyKey: string;
  auditCorrelationId: string;
  
  createdAt: string;
  updatedAt: string;
}

export type RegisterReconciliationStatus =
  | 'MATCHED'
  | 'PENDING_EXTERNAL_CONFIRMATION'
  | 'INTERNAL_EXTERNAL_MISMATCH'
  | 'EVIDENCE_MISSING'
  | 'DISCREPANCY_DETECTED'
  | 'RESOLVED';

export interface CorporateRegisterReconciliationRecord {
  id: string;
  reconciliationNumber: string; // e.g. 'REC-2026-0001'
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  corporateActionId: string;
  registerType: StatutoryRegisterType;
  
  actionStatus: CorporateActionExecutionStatus;
  canonicalRegisterEntryId?: string;
  canonicalRegisterStatus?: string;
  externalFilingStatus?: string;
  evidenceVerificationStatus?: string;
  
  status: RegisterReconciliationStatus;
  mismatchDetails?: string;
  governanceFindingId?: string;
  
  reconciledByUserId: string;
  reconciledAtUtc: string;
  auditCorrelationId: string;
}

export interface CorporateRegisterReconciliationReport {
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  evaluatedAtUtc: string;
  totalActionsEvaluated: number;
  matchedCount: number;
  mismatchCount: number;
  missingEvidenceCount: number;
  pendingExternalCount: number;
  reconciliationRecords: CorporateRegisterReconciliationRecord[];
  findingsGeneratedCount: number;
}

// ============================================================================
// 16. CONTINUOUS GOVERNANCE MONITORING, CONTROL TOWER & EARLY-WARNING ENGINE (GOV-16)
// ============================================================================

export type GovernanceSignalCategory =
  | 'AUTHORITY_EXPIRY_OR_BREACH'
  | 'SOD_ANOMALY_OR_BYPASS'
  | 'DECISION_OR_ACTION_OVERDUE'
  | 'STATUTORY_RECONCILIATION_MISMATCH'
  | 'EVIDENCE_INTEGRITY_TAMPER'
  | 'INTERNAL_CONTROL_DEFICIENCY'
  | 'COMPLIANCE_POLICY_VIOLATION'
  | 'AUDIT_FINDING_ESCALATION'
  | 'COMMITTEE_GOVERNANCE_PACK_GAP'
  | 'RISK_APPETITE_BREACH'
  | 'CROSS_ENTITY_CONCENTRATION';

export type GovernanceSignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type GovernanceSignalStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'UNDER_INVESTIGATION'
  | 'CONFIRMED_ISSUE'
  | 'HANDED_OFF_TO_FINDING'
  | 'FALSE_POSITIVE'
  | 'RESOLVED'
  | 'SUPPRESSED';

export type GovernanceSignalSourceDomain =
  | 'LEGAL_ENTITY_REGISTRY'
  | 'DELEGATION_OF_AUTHORITY'
  | 'CORPORATE_DECISION'
  | 'SECRETARIAT_ACTION'
  | 'STATUTORY_RECONCILIATION'
  | 'EVIDENCE_VAULT'
  | 'INTERNAL_CONTROLS'
  | 'COMPLIANCE_MONITORING'
  | 'AUDIT_AND_FINDINGS'
  | 'COMMITTEE_ORCHESTRATION'
  | 'RISK_MANAGEMENT';

export interface GovernanceSignal {
  id: string;
  signalNumber: string; // e.g. 'SIG-2026-0001'
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  category: GovernanceSignalCategory;
  severity: GovernanceSignalSeverity;
  status: GovernanceSignalStatus;
  
  titleEn: string;
  description: string;
  
  sourceDomain: GovernanceSignalSourceDomain;
  sourceRecordId?: string;
  sourceRecordType?: string;
  
  policyVersionId: string;
  ruleCode: string;
  anomalyMetadata: Record<string, unknown>;
  materialityScore: number; // 1 to 100
  
  deduplicationKey: string; // SHA-256 hash or deterministic key
  correlatedSignalIds: string[];
  
  triageNotes?: string;
  triagedByUserId?: string;
  triagedAtUtc?: string;
  
  investigationDetails?: string;
  investigatedByUserId?: string;
  investigatedAtUtc?: string;
  
  confirmedFindingId?: string; // Links to GOV-11 Finding when handed off
  suppressionReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type GovernanceHealthDimension =
  | 'AUTHORITY_GOVERNANCE'
  | 'DECISION_AND_SECRETARIAT'
  | 'STATUTORY_RECONCILIATION'
  | 'INTERNAL_CONTROLS'
  | 'AUDIT_AND_COMPLIANCE'
  | 'EVIDENCE_INTEGRITY'
  | 'COMMITTEE_PACK_READINESS';

export type GovernanceHealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface GovernanceHealthIndicatorDefinition {
  id: string;
  code: string; // e.g. 'IND-AUTH-01'
  dimension: GovernanceHealthDimension;
  name: string;
  description: string;
  weight: number; // Percentage, sum per dimension = 100
  thresholdGreen: number; // e.g. >= 90
  thresholdAmber: number; // e.g. >= 70
  thresholdRed: number; // < 70
  evaluationRule: string;
  policyVersionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceHealthIndicatorScore {
  indicatorCode: string;
  dimension: GovernanceHealthDimension;
  score: number; // 0 to 100
  status: GovernanceHealthStatus;
  weight: number;
  evaluationDetail: string;
  sampleCount: number;
  defectCount: number;
}

export interface GovernanceHealthDimensionScore {
  dimension: GovernanceHealthDimension;
  score: number; // 0 to 100
  status: GovernanceHealthStatus;
  weight: number; // Weight towards overall scorecard
  indicatorScores: GovernanceHealthIndicatorScore[];
}

export interface GovernanceHealthScorecard {
  id: string;
  scorecardNumber: string; // e.g. 'GHC-2026-0001'
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  reportingPeriod: string; // e.g. '2026-Q1' or '2026-08'
  
  overallScore: number; // 0 to 100
  overallStatus: GovernanceHealthStatus;
  
  dimensionScores: GovernanceHealthDimensionScore[];
  
  pinnedPolicyVersionId: string;
  calculationEvidenceHashSha256: string;
  
  activeSignalsCount: number;
  criticalSignalsCount: number;
  amberSignalsCount: number;
  openFindingsCount: number;
  overdueActionsCount: number;
  
  evaluatedByUserId: string;
  evaluatedAtUtc: string;
  auditCorrelationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceControlTowerSummary {
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  reportingPeriod: string;
  latestScorecard: GovernanceHealthScorecard;
  activeSignals: GovernanceSignal[];
  earlyWarningAlerts: Array<{
    alertId: string;
    category: GovernanceSignalCategory;
    severity: GovernanceSignalSeverity;
    message: string;
    impactSummary: string;
    recommendedAction: string;
    slaRemainingHours?: number;
  }>;
  controlTowerMetrics: {
    totalSignalsEvaluated: number;
    activeAnomaliesCount: number;
    pendingInvestigationsCount: number;
    confirmedFindingsCount: number;
    reconciliationDiscrepanciesCount: number;
    evidenceIntegrityRate: number; // Percentage
    controlEffectivenessRate: number; // Percentage
    overdueStatutoryActionsCount: number;
  };
  trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  executiveSummaryText: string;
  generatedAtUtc: string;
}

export interface SignalTriageInput {
  status: 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'FALSE_POSITIVE' | 'SUPPRESSED';
  triageNotes: string;
  suppressionReason?: string;
}

export interface SignalInvestigationInput {
  investigationDetails: string;
  confirmedIssue: boolean;
  resolutionNotes?: string;
}

export interface SignalFindingHandoffInput {
  findingTitle: string;
  findingDescription: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetDepartment?: string;
  remediationOwnerUserId: string;
  dueDate: string;
}

// ============================================================================
// STEP GOV-17: GOVERNANCE ANALYTICS, SCENARIO SIMULATION & DECISION INTELLIGENCE
// ============================================================================

export type GovernanceTrendClassification = 'IMPROVING' | 'STABLE' | 'DETERIORATING';

export interface GovernanceAnalyticsSnapshot {
  id: string; // e.g. 'GAS-2026-0001'
  snapshotNumber: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  reportingPeriod: string;
  
  sourceSnapshotIds: {
    healthScorecardId?: string;
    signalsCount: number;
    appointmentsCount: number;
    decisionsCount: number;
    policiesCount: number;
    controlsCount: number;
    findingsCount: number;
    actionsCount: number;
    evidenceCount: number;
  };
  
  metricDefinitionVersionIds: Record<string, string>;
  policyVersionIds: string[];
  calculationVersion: string;
  
  governanceHealthScore: number;
  trendClassification: GovernanceTrendClassification;
  dimensionScores: Record<GovernanceHealthDimension, number>;
  
  keyMetrics: {
    activeAnomaliesCount: number;
    openFindingsCount: number;
    overdueActionsCount: number;
    evidenceIntegrityRate: number; // 0 to 100
    controlEffectivenessRate: number; // 0 to 100
    activeDelegationsCount: number;
    delegationsNearingExpiryCount: number;
  };
  
  dataQuality: {
    completenessScore: number; // 0 to 100
    staleSourcesCount: number;
    unverifiedEvidenceCount: number;
    integrityPassed: boolean;
  };
  
  integrityHashSha256: string;
  generatedAtUtc: string;
  generatedByUserId: string;
  correlationId: string;
}

export type ScenarioType =
  | 'POLICY_CHANGE'
  | 'RISK_APPETITE_CHANGE'
  | 'AUTHORITY_CHANGE'
  | 'FAM_THRESHOLD_CHANGE'
  | 'DoA_CHANGE'
  | 'CONTROL_FAILURE'
  | 'COMPLIANCE_CHANGE'
  | 'AUDIT_CYCLE_CHANGE'
  | 'BOARD_CAPACITY_CHANGE'
  | 'REMEDIATION_DELAY'
  | 'JURISDICTION_CHANGE'
  | 'CORPORATE_ACTION_IMPACT'
  | 'CUSTOM';

export type ScenarioAssumptionType =
  | 'THRESHOLD'
  | 'EFFECTIVE_DATE'
  | 'POLICY_VERSION'
  | 'RISK_SCORE'
  | 'TRANSACTION_VOLUME'
  | 'APPROVAL_VOLUME'
  | 'AUDIT_FREQUENCY'
  | 'CONTROL_EFFECTIVENESS'
  | 'STAFF_CAPACITY'
  | 'FILING_FREQUENCY'
  | 'CUSTOM';

export interface ScenarioAssumption {
  id: string;
  key: string;
  assumptionType: ScenarioAssumptionType;
  currentValue: string | number | boolean;
  hypotheticalValue: string | number | boolean;
  unit?: string;
  justification: string;
}

export type ScenarioStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

export interface GovernanceScenarioDefinition {
  id: string; // e.g. 'SCN-2026-0001'
  scenarioCode: string; // e.g. 'SCN-AUDIT-CYCLE-18M'
  version: number;
  title: string;
  description: string;
  scenarioType: ScenarioType;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  basePolicyVersionId: string;
  
  assumptions: ScenarioAssumption[];
  
  status: ScenarioStatus;
  supersededByScenarioId?: string;
  
  createdByUserId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type SimulationRunStatus = 'COMPLETED' | 'FINALIZED' | 'SUPERSEDED';

export type BottleneckType =
  | 'SINGLE_APPROVER_DEPENDENCY'
  | 'EXCESSIVE_EXECUTIVE_APPROVALS'
  | 'COMMITTEE_BACKLOG'
  | 'OVERDUE_ACTION_CONCENTRATION'
  | 'DELEGATION_EXPIRY_CONCENTRATION';

export interface SimulationBottleneck {
  bottleneckType: BottleneckType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  affectedEntityOrRole: string;
  mitigationSuggestion: string;
}

export interface GovernanceSimulationRun {
  id: string; // e.g. 'SIM-2026-0001'
  simulationNumber: string;
  scenarioDefinitionId: string;
  scenarioVersion: number;
  scenarioType: ScenarioType;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  
  sourceSnapshotId: string;
  pinnedPolicyVersionId: string;
  calculationMethodVersion: string;
  
  assumptionsSnapshot: ScenarioAssumption[];
  
  baselineHealthScore: number;
  projectedHealthScore: number;
  healthDelta: number;
  
  impactAssessment: {
    riskAppetiteBreachesProjected: number;
    affectedRisksCount: number;
    potentialWorkloadDeltaHours: number;
    approvalBottlenecksCount: number;
    complianceObligationDeltasCount: number;
    controlDeficienciesProjected: number;
    committeeWorkloadDelta: string;
    executiveSummary: string;
  };
  
  dimensionDeltas: Record<GovernanceHealthDimension, number>;
  
  bottlenecksDetected: SimulationBottleneck[];
  
  status: SimulationRunStatus;
  isFinalized: boolean;
  finalizedAtUtc?: string;
  finalizedByUserId?: string;
  
  integrityHashSha256: string;
  requestedByUserId: string;
  requestedAtUtc: string;
  correlationId: string;
}

export type DecisionIntelligenceTaxonomyType =
  | 'VERIFIED_FACT'
  | 'DETERMINISTIC_ANALYSIS'
  | 'SCENARIO_ASSUMPTION'
  | 'AI_GENERATED_ANALYSIS'
  | 'RECOMMENDATION'
  | 'UNKNOWN_OR_INSUFFICIENT_EVIDENCE'
  | 'CONFLICTING_EVIDENCE';

export interface DecisionIntelligenceTaxonomyItem {
  statementType: DecisionIntelligenceTaxonomyType;
  content: string;
  sourceRecordType?: string;
  sourceRecordId?: string;
  confidenceDisclaimer?: string;
}

export type AdvisoryRecommendationType =
  | 'MONITOR'
  | 'INVESTIGATE'
  | 'ESCALATE'
  | 'REVIEW_POLICY'
  | 'REVIEW_CONTROL'
  | 'REVIEW_AUTHORITY'
  | 'CONSIDER_DECISION';

export interface AdvisoryRecommendation {
  id: string;
  recommendationType: AdvisoryRecommendationType;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetDomain: string;
  isAuthoritative: false; // Mandatory Invariant
}

export interface DecisionTradeOffOption {
  optionName: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedCostImpact?: string;
  strategicAlignmentScore: number; // 1 to 10
}

export interface AIModelProvenance {
  modelIdentifier: string; // e.g. 'gemini-3.7-flash'
  modelVersion?: string;
  promptTemplateVersion: string;
  generatedAtUtc: string;
  isAdvisoryOnly: true;
  humanReviewRequired: true;
}

export type DecisionIntelligenceStatus =
  | 'DRAFT'
  | 'REVIEWED'
  | 'ACCEPTED_FOR_CONSIDERATION'
  | 'DISMISSED'
  | 'SUPERSEDED';

export interface GovernanceDecisionIntelligence {
  id: string; // e.g. 'GDI-2026-0001'
  intelligenceNumber: string;
  matterNumber: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  decisionType: CorporateDecisionType;
  title: string;
  context: string;
  
  taxonomyBreakdown: DecisionIntelligenceTaxonomyItem[];
  
  supportingPolicyVersionId: string;
  simulationRunIds: string[];
  relevantRiskIds: string[];
  relevantControlIds: string[];
  
  evidenceGaps: string[];
  conflictingEvidence: string[];
  suggestedBoardQuestions: string[];
  
  advisoryRecommendations: AdvisoryRecommendation[];
  tradeOffAnalysis: DecisionTradeOffOption[];
  
  aiModelProvenance?: AIModelProvenance;
  
  status: DecisionIntelligenceStatus;
  reviewedByUserId?: string;
  reviewedAtUtc?: string;
  reviewNotes?: string;
  
  integrityHashSha256: string;
  createdAtUtc: string;
  createdByUserId: string;
  correlationId: string;
}

export interface BoardAdvisoryBrief {
  id: string; // e.g. 'BAB-2026-0001'
  briefNumber: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  meetingId?: string;
  reportingPeriod: string;
  
  executiveSummary: string;
  decisionRequiredSummary: string;
  currentGovernancePosition: string;
  keyRisksAndAppetiteImpact: string;
  assuranceAndAuditPosition: string;
  scenarioComparisonSummary: string;
  
  evidenceGapsIdentified: string[];
  managementPosition: string;
  questionsForBoardOversight: string[];
  
  tradeOffSummary: string;
  advisoryRecommendationSummary: string;
  
  nonAuthoritativeDisclaimer: string;
  publishedToBoardPackId?: string; // Links to GOV-13 Board Pack
  
  integrityHashSha256: string;
  preparedByUserId: string;
  preparedAtUtc: string;
  correlationId: string;
}

export interface ExecutiveDeskInsights {
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  latestAnalyticsSnapshot?: GovernanceAnalyticsSnapshot;
  activeScenariosCount: number;
  recentSimulationsCount: number;
  pendingDecisionIntelligenceCount: number;
  unresolvedEvidenceGapsCount: number;
  highPriorityRecommendations: AdvisoryRecommendation[];
  topBottlenecks: SimulationBottleneck[];
  generatedAtUtc: string;
}

// ============================================================================
// 19. STEP GOV-18: REGULATORY INTELLIGENCE & CHANGE MANAGEMENT DOMAIN
// ============================================================================

export type RegulatorySourceTrustClassification =
  | 'OFFICIAL_LEGISLATION'
  | 'OFFICIAL_REGULATOR'
  | 'OFFICIAL_GOVERNMENT_GUIDANCE'
  | 'OFFICIAL_COURT_OR_TRIBUNAL'
  | 'PROFESSIONAL_ADVISORY'
  | 'PRIMARY_PROFESSIONAL_STANDARD'
  | 'SECONDARY_SOURCE'
  | 'NEWS_OR_COMMENTARY'
  | 'AI_DISCOVERED_UNVERIFIED'
  | 'UNKNOWN';

export type RegulatorySourceVerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface RegulatorySource {
  id: string; // e.g. 'RSC-GB-COMPANIES-ACT-2006'
  sourceName: string;
  sourceType: string; // e.g. 'PRIMARY_LEGISLATION', 'REGULATOR_RULEBOOK'
  authorityName: string; // e.g. 'Companies House', 'ZATCA', 'TGA', 'HMRC', 'Information Commissioner Office'
  jurisdiction: GovernanceJurisdiction;
  officialDomain: string; // e.g. 'legislation.gov.uk', 'zatca.gov.sa', 'tga.gov.sa'
  sourceReference: string;
  sourceLocation: string; // URL or statutory registry reference
  language: string; // 'en', 'ar'
  trustClassification: RegulatorySourceTrustClassification;
  verificationStatus: RegulatorySourceVerificationStatus;
  verifiedByUserId?: string;
  verifiedAtUtc?: string;
  verificationNotes?: string;
  active: boolean;
  metadata?: Record<string, any>;
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type RegulatoryChangeType =
  | 'NEW_REQUIREMENT'
  | 'AMENDMENT'
  | 'REPEAL'
  | 'REPLACEMENT'
  | 'GUIDANCE_CHANGE'
  | 'DEADLINE_CHANGE'
  | 'REPORTING_CHANGE'
  | 'THRESHOLD_CHANGE'
  | 'ENFORCEMENT_CHANGE'
  | 'INTERPRETATION_CHANGE'
  | 'LICENSING_CHANGE'
  | 'TAX_CHANGE'
  | 'DATA_PROTECTION_CHANGE'
  | 'EMPLOYMENT_CHANGE'
  | 'TRANSPORT_CHANGE'
  | 'CUSTOMS_CHANGE';

export type RegulatoryChangeMateriality =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type RegulatoryChangeLifecycleStatus =
  | 'DETECTED'
  | 'SOURCE_VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'APPLICABILITY_ASSESSMENT'
  | 'IMPACT_ASSESSMENT'
  | 'REVIEW_REQUIRED'
  | 'ADOPTION_PROPOSED'
  | 'PENDING_GOVERNANCE_APPROVAL'
  | 'APPROVED_FOR_ADOPTION'
  | 'IMPLEMENTATION_IN_PROGRESS'
  | 'IMPLEMENTED'
  | 'CLOSED'
  | 'REJECTED_AS_INVALID'
  | 'NOT_APPLICABLE'
  | 'SUPERSEDED'
  | 'REPEALED'
  | 'ON_HOLD'
  | 'INSUFFICIENT_EVIDENCE';

export type RegulatoryChangeIngestionMethod =
  | 'MANUAL'
  | 'OFFICIAL_API'
  | 'OFFICIAL_FEED'
  | 'AUTHORIZED_PROVIDER'
  | 'DOCUMENT_IMPORT'
  | 'HUMAN_RESEARCH'
  | 'AI_ASSISTED_DISCOVERY';

export interface RegulatoryChange {
  id: string; // e.g. 'RCH-2026-0001'
  changeNumber: string;
  sourceId: string;
  sourceReference: string;
  jurisdiction: GovernanceJurisdiction;
  regulator: string;
  title: string;
  summary: string;
  originalText?: string;
  originalLanguage?: string;
  translatedText?: string;
  translationMethod?: 'OFFICIAL' | 'CERTIFIED_HUMAN' | 'AI_ASSISTED' | 'NONE';
  translationReviewedByUserId?: string;
  changeType: RegulatoryChangeType;
  publicationDate: string; // YYYY-MM-DD
  effectiveDate: string; // YYYY-MM-DD
  mandatoryComplianceDate?: string;
  transitionDeadline?: string;
  detectedAtUtc: string;
  detectedByUserId: string;
  ingestionMethod: RegulatoryChangeIngestionMethod;
  verificationStatus: RegulatorySourceVerificationStatus;
  verifiedByUserId?: string;
  verifiedAtUtc?: string;
  materiality: RegulatoryChangeMateriality;
  lifecycleStatus: RegulatoryChangeLifecycleStatus;
  fingerprintSha256: string;
  supersedesChangeId?: string;
  amendsReference?: string;
  repealsReference?: string;
  sourceDocumentVersionId?: string;
  sourceIntegrityReference?: string;
  correlationId: string;
  isLegallyPrivileged?: boolean;
  legalPrivilegeClassification?: string;
  conflictingAuthoritativeSourceIds?: string[];
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type RegulatoryApplicabilityResult =
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'POTENTIALLY_APPLICABLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'LEGAL_REVIEW_REQUIRED';

export interface RegulatoryEntityApplicability {
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  status: RegulatoryApplicabilityResult;
  evaluatedCriteria: {
    operationalPresence: boolean;
    employeePresence: boolean;
    taxRegistration: boolean;
    regulatoryRegistration: boolean;
    businessActivityNexus: boolean;
    contractualNexus: boolean;
    evidenceVerified: boolean;
  };
  rationale: string;
  assessedByUserId: string;
  assessedAtUtc: string;
  evidenceDocumentIds: string[];
  legalReviewRequired: boolean;
  legalReviewNotes?: string;
}

export type RegulatoryImpactDimension =
  | 'OBLIGATION'
  | 'POLICY'
  | 'CONTROL'
  | 'FILING'
  | 'CALENDAR'
  | 'RISK'
  | 'AUTHORITY'
  | 'PROCESS'
  | 'EVIDENCE'
  | 'TRAINING'
  | 'CONTRACT'
  | 'DATA_PRIVACY'
  | 'FINANCE_TAX'
  | 'OPERATIONS';

export type RegulatoryGapType =
  | 'NO_GAP'
  | 'POLICY_GAP'
  | 'CONTROL_GAP'
  | 'PROCESS_GAP'
  | 'FILING_GAP'
  | 'EVIDENCE_GAP'
  | 'TRAINING_GAP'
  | 'SYSTEM_GAP'
  | 'AUTHORITY_GAP'
  | 'DATA_GAP'
  | 'LEGAL_REVIEW_GAP';

export interface RegulatoryGapItem {
  gapId: string;
  dimension: RegulatoryImpactDimension;
  gapType: RegulatoryGapType;
  description: string;
  affectedTargetId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  remediationRequired: string;
  convertedToFindingId?: string;
}

export interface RegulatoryImpactAssessment {
  id: string; // e.g. 'RIA-2026-0001'
  assessmentNumber: string;
  regulatoryChangeId: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  entityApplicability: RegulatoryEntityApplicability;
  impactedDimensions: RegulatoryImpactDimension[];
  gaps: RegulatoryGapItem[];
  materialityScore: number; // 1-100
  materialityLevel: RegulatoryChangeMateriality;
  preparerUserId: string;
  preparedAtUtc: string;
  requiresHumanLegalReview: boolean;
  legalReviewerUserId?: string;
  legalReviewDecision?: 'APPROVED' | 'REJECTED' | 'FURTHER_INQUIRY';
  legalReviewCompletedAtUtc?: string;
  legalReviewNotes?: string;
  complianceReviewerUserId?: string;
  complianceReviewCompletedAtUtc?: string;
  complianceReviewNotes?: string;
  aiAdvisoryInsights?: {
    suggestedGaps: string[];
    questionsForReviewer: string[];
    potentialImpactSummary: string;
    isAdvisoryOnly: true;
  };
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  correlationId: string;
}

export interface RegulatoryAdoptionPlan {
  id: string; // e.g. 'RAP-2026-0001'
  planNumber: string;
  regulatoryChangeId: string;
  impactAssessmentId: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  title: string;
  status: 'DRAFT' | 'REVIEW' | 'PENDING_GOV06_APPROVAL' | 'APPROVED' | 'IN_EXECUTION' | 'COMPLETED' | 'VERIFIED' | 'REJECTED';
  requiredPolicyUpdates: Array<{
    policyId: string;
    currentVersionId: string;
    targetVersionNumber: string;
    changeSummary: string;
    draftPolicyVersionId?: string;
  }>;
  requiredControlUpdates: Array<{
    controlId: string;
    action: 'NEW' | 'UPDATE' | 'DEACTIVATE';
    controlTitle: string;
    targetState: string;
  }>;
  requiredObligationUpdates: Array<{
    action: 'CREATE_OBLIGATION' | 'AMEND_OBLIGATION' | 'RETIRE_OBLIGATION';
    targetObligationId?: string;
    title: string;
    ruleReference: string;
    effectiveDate: string;
  }>;
  requiredFilingUpdates: Array<{
    filingType: string;
    frequency: string;
    firstStatutoryDueDate: string;
  }>;
  requiredCalendarDeadlines: Array<{
    title: string;
    dueDate: string;
    deadlineType: 'IMPLEMENTATION' | 'TRANSITION' | 'FILING' | 'ASSESSMENT_REVIEW';
    governanceCalendarEventId?: string;
  }>;
  governanceDecisionId?: string; // GOV-06 CorporateDecision
  corporateActionId?: string; // GOV-15 CorporateAction
  planOwnerUserId: string;
  targetCompletionDate: string;
  completedAtUtc?: string;
  verifiedByUserId?: string;
  verifiedAtUtc?: string;
  verificationNotes?: string;
  evidenceDocumentIds: string[];
  integrityHashSha256: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  correlationId: string;
}

export type RegulatoryReconciliationStatus =
  | 'ALIGNED'
  | 'PARTIALLY_ALIGNED'
  | 'IMPLEMENTATION_PENDING'
  | 'EVIDENCE_MISSING'
  | 'CONTROL_GAP'
  | 'POLICY_GAP'
  | 'OBLIGATION_GAP'
  | 'DEADLINE_GAP'
  | 'REQUIRES_REVIEW';

export interface RegulatoryReconciliationResult {
  regulatoryChangeId: string;
  legalEntityId: string;
  reconciliationStatus: RegulatoryReconciliationStatus;
  obligationAligned: boolean;
  policyAligned: boolean;
  controlAligned: boolean;
  calendarAligned: boolean;
  evidencePresent: boolean;
  verificationPassed: boolean;
  details: string[];
  evaluatedAtUtc: string;
}

export interface PointInTimeRegulatorySnapshot {
  snapshotAsOfDate: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  knownSourcesCount: number;
  activeRegulatoryChangesCount: number;
  effectiveRegulatoryChanges: Array<{
    changeId: string;
    changeNumber: string;
    title: string;
    changeType: RegulatoryChangeType;
    effectiveDate: string;
    applicabilityStatus: RegulatoryApplicabilityResult;
    statusAtTime: RegulatoryChangeLifecycleStatus;
  }>;
  activeObligationsAtTime: string[];
  activePolicyVersionsAtTime: string[];
  generatedAtUtc: string;
  integrityHashSha256: string;
}



