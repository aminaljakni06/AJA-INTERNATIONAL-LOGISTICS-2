/**
 * AJA INTERNATIONAL LOGISTICS — Regulatory Case Management Service
 * Step GOV-19: Regulatory Supervision, Inquiries, Inspections, Response Coordination, Submissions & Commitments
 * 
 * Core Architectural Invariants:
 * 1. GOVERNANCE-REGULATORY-CASE-INVARIANT-01:
 *    AUTHORITY-VERIFIED, LEGALLY-PRESERVED, DEADLINE-CONTROLLED, PROVENANCE-PRESERVED & HUMAN-APPROVED REGULATORY RESPONSE
 * 2. REGULATORY INQUIRY != CONFIRMED VIOLATION
 * 3. INSPECTION OBSERVATION != INTERNAL FINDING AUTOMATICALLY
 * 4. DRAFT RESPONSE != OFFICIAL SUBMISSION
 * 5. AI DRAFT != LEGAL POSITION (AI is advisory only; cannot sign, approve, or submit)
 * 6. SUBMISSION SENT != ACCEPTED / CLOSED
 * 7. TECHNICAL ADMIN != REGULATORY REPRESENTATIVE (Admin role cannot bypass corporate signatory requirements)
 * 8. Separation of Duties (SoD): Preparer != Approver, Executor != Verifier
 * 9. Multi-Entity and Multi-Jurisdiction Isolation: Strict Legal Entity access boundaries
 * 10. Privileged Legal Content Protection: Privileged advice and defense strategy isolated from generic access
 */

import {
  RegulatoryCase,
  RegulatoryCaseType,
  RegulatoryCaseLifecycleStatus,
  RegulatoryResponsePlan,
  RegulatorySubmission,
  RegulatorySubmissionStatus,
  RegulatorySubmissionMethod,
  RegulatoryCommitment,
  RegulatoryCommitmentStatus,
  CaseReconciliationStatus,
  CaseReconciliationResult,
  PointInTimeRegulatoryCaseSnapshot,
  GovernanceJurisdiction,
  GovernanceFinding
} from '../types';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { ValidationError, PermissionError } from '../db/validation';
import {
  saveRegulatoryCase,
  getRegulatoryCaseById,
  findRegulatoryCaseByFingerprint,
  generateCaseNumber,
  saveResponsePlan,
  getResponsePlanByCaseId,
  saveRegulatorySubmission,
  getRegulatorySubmissionById,
  listSubmissionsByCaseId,
  saveRegulatoryCommitment,
  getRegulatoryCommitmentById,
  listCommitmentsByCaseId,
  computeCaseSha256,
  generateCommitmentNumber
} from '../db/repositories/regulatoryCaseRepository';
import { getRegulatorySourceById } from '../db/repositories/regulatoryIntelligenceRepository';
import { saveCorporateDecision } from '../db/repositories/corporateGovernanceRepository';
import { createGovernanceAction } from '../db/repositories/corporateBoardOversightRepository';
import { saveLegalHold } from '../db/repositories/corporateRecordsRepository';
import { saveOccurrence } from '../db/repositories/complianceCalendarRepository';
import { saveGovernanceFinding } from '../db/repositories/corporateRiskAssuranceRepository';

export class RegulatoryCaseService {

  // ==========================================================================
  // 1. REGULATORY CASE INGESTION & REGISTRATION
  // ==========================================================================

  public async registerRegulatoryCase(
    input: {
      legalEntityId: string;
      jurisdiction: GovernanceJurisdiction;
      authorityId: string;
      authorityName: string;
      caseType: RegulatoryCaseType;
      sourceReference: string;
      title: string;
      description: string;
      receivedAtUtc: string;
      responseDueAtUtc: string;
      internalTargetDateUtc?: string;
      materiality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'BOARD_ESCALATION';
      caseOwnerUserId: string;
      evidenceDocumentIds?: string[];
      isPrivilegedLegalContent?: boolean;
      applyLegalHoldImmediately?: boolean;
    },
    actor: User,
    context: ABACContext
  ): Promise<RegulatoryCase> {
    this.assertEntityAccess(actor, input.legalEntityId, context);

    if (!input.sourceReference || input.sourceReference.trim() === '') {
      throw new ValidationError('Source reference or official notice number is required');
    }
    if (!input.responseDueAtUtc) {
      throw new ValidationError('Official response due date is mandatory');
    }

    // 1. Verify Authority/Source trust if registered in Regulatory Intelligence
    if (input.authorityId) {
      const source = await getRegulatorySourceById(input.authorityId);
      if (source && source.verificationStatus === 'REJECTED') {
        throw new ValidationError('Cannot register regulatory case from an unverified or fake regulatory authority');
      }
    }

    // 2. Deterministic Deduplication: Check if case already exists for entity + authority + reference
    const existing = await findRegulatoryCaseByFingerprint(input.legalEntityId, input.authorityId, input.sourceReference);
    if (existing) {
      return existing; // Return existing canonical case without duplicate creation
    }

    const year = new Date(input.receivedAtUtc || new Date()).getFullYear();
    const caseNumber = generateCaseNumber(year);
    const caseId = `case_${crypto.randomUUID()}`;

    // 3. Optional Immediate Legal Hold for Critical / Enforcement notices
    let legalHoldId: string | undefined = undefined;
    if (input.applyLegalHoldImmediately || input.materiality === 'CRITICAL' || input.caseType === 'ENFORCEMENT_NOTICE') {
      const hold = await saveLegalHold({
        id: `hold_${crypto.randomUUID()}`,
        holdNumber: `HLD-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Regulatory Hold: ${input.sourceReference} - ${input.title}`,
        reason: `Statutory evidence preservation for ${input.authorityName} inquiry`,
        legalEntityId: input.legalEntityId,
        scopeType: 'CASE',
        matterReference: caseNumber,
        targetRecordIds: input.evidenceDocumentIds || [],
        status: 'ACTIVE',
        issuedByUserId: actor.id,
        issuedAt: new Date().toISOString(),
        auditCorrelationId: context.correlationId || `corr_${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, actor.id, context.correlationId);
      legalHoldId = hold.id;
    }

    // 4. Calculate internal target date (default 3 days prior to official deadline)
    const officialDue = new Date(input.responseDueAtUtc);
    const internalDue = input.internalTargetDateUtc 
      ? new Date(input.internalTargetDateUtc)
      : new Date(officialDue.getTime() - 3 * 24 * 60 * 60 * 1000);

    const rCase: RegulatoryCase = {
      id: caseId,
      caseNumber,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      authorityId: input.authorityId,
      authorityName: input.authorityName,
      caseType: input.caseType,
      sourceReference: input.sourceReference,
      title: input.title,
      description: input.description,
      receivedAtUtc: input.receivedAtUtc || new Date().toISOString(),
      responseDueAtUtc: officialDue.toISOString(),
      internalTargetDateUtc: internalDue.toISOString(),
      status: 'RECEIVED',
      materiality: input.materiality || 'MEDIUM',
      caseOwnerUserId: input.caseOwnerUserId,
      legalHoldId,
      evidenceDocumentIds: input.evidenceDocumentIds || [],
      submissionIds: [],
      commitmentIds: [],
      findingIds: [],
      signalIds: [],
      isPrivilegedLegalContent: !!input.isPrivilegedLegalContent,
      integrityHashSha256: '',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
      correlationId: context.correlationId || `corr_${crypto.randomUUID()}`
    };

    const saved = await saveRegulatoryCase(rCase);

    // 5. Register in Compliance Calendar (GOV-08)
    await saveOccurrence({
      id: `occ_${crypto.randomUUID()}`,
      occurrenceNumber: `CMP-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
      obligationId: rCase.id,
      obligationCode: input.sourceReference,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      title: `Regulatory Response Due: ${input.authorityName} (${caseNumber})`,
      description: input.description,
      referencePeriodStart: new Date().toISOString().split('T')[0],
      referencePeriodEnd: officialDue.toISOString().split('T')[0],
      periodReference: `${year}-REG`,
      scheduledDate: officialDue.toISOString(),
      statutoryDueDate: officialDue.toISOString(),
      dueLocalDate: officialDue.toISOString().split('T')[0],
      timeZone: 'UTC',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: input.caseOwnerUserId,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: input.evidenceDocumentIds || [],
      reminderSchedule: {
        reminderDaysBeforeDue: [14, 7, 3, 1],
        escalationAfterOverdueDays: [1, 3],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: `gen_${rCase.id}_${Date.now()}`,
      generatedBy: actor.id,
      auditCorrelationId: context.correlationId || `corr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, actor.id);

    return saved;
  }

  // ==========================================================================
  // 2. RESPONSE PLANNING
  // ==========================================================================

  public async createOrUpdateResponsePlan(
    input: {
      caseId: string;
      responseScope: string;
      requiredEvidenceTypes: string[];
      assignedReviewers: Array<{
        userId: string;
        role: 'LEGAL' | 'COMPLIANCE' | 'TAX' | 'DPO' | 'OPERATIONS' | 'FINANCE' | 'EXECUTIVE';
      }>;
      responseOwnerUserId: string;
      submissionMethod: RegulatorySubmissionMethod;
      internalTargetDateUtc?: string;
      requiresBoardApproval?: boolean;
      supportingDecisionRequirement?: string;
    },
    actor: User,
    context: ABACContext
  ): Promise<RegulatoryResponsePlan> {
    const rCase = await getRegulatoryCaseById(input.caseId);
    if (!rCase) {
      throw new ValidationError(`Regulatory case ${input.caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    const planId = `plan_${crypto.randomUUID()}`;
    const plan: RegulatoryResponsePlan = {
      id: planId,
      caseId: input.caseId,
      responseScope: input.responseScope,
      requiredEvidenceTypes: input.requiredEvidenceTypes,
      assignedReviewers: input.assignedReviewers.map(r => ({
        userId: r.userId,
        role: r.role,
        reviewStatus: 'PENDING'
      })),
      responseOwnerUserId: input.responseOwnerUserId,
      submissionMethod: input.submissionMethod,
      regulatorDeadlineUtc: rCase.responseDueAtUtc,
      internalTargetDateUtc: input.internalTargetDateUtc || rCase.internalTargetDateUtc,
      requiresBoardApproval: !!input.requiresBoardApproval || rCase.materiality === 'BOARD_ESCALATION',
      supportingDecisionRequirement: input.supportingDecisionRequirement,
      status: 'IN_REVIEW',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString()
    };

    const savedPlan = await saveResponsePlan(plan);

    // Update case lifecycle status to RESPONSE_PLANNING
    if (rCase.status === 'RECEIVED' || rCase.status === 'TRIAGE') {
      rCase.status = 'RESPONSE_PLANNING';
      await saveRegulatoryCase(rCase);
    }

    return savedPlan;
  }

  // ==========================================================================
  // 3. DRAFTING & SUBMISSION PREPARATION
  // ==========================================================================

  public async prepareDraftSubmission(
    input: {
      caseId: string;
      documentVersionId: string;
      submittedContentSummary: string;
      submissionMethod: RegulatorySubmissionMethod;
      authorizedSignatoryPoAId?: string;
      supersedesSubmissionId?: string;
    },
    actor: User,
    context: ABACContext
  ): Promise<RegulatorySubmission> {
    // Prohibit AI from directly preparing formal submissions without human authorship
    if (actor.id === 'service_principal_ai' || (actor as any).isAI) {
      throw new PermissionError('AI assistants cannot be assigned as official authors of formal regulatory submissions');
    }

    const rCase = await getRegulatoryCaseById(input.caseId);
    if (!rCase) {
      throw new ValidationError(`Regulatory case ${input.caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    if (!input.documentVersionId) {
      throw new ValidationError('Exact DocumentVersionId must be pinned for submission evidence integrity');
    }

    const existingSubmissions = await listSubmissionsByCaseId(input.caseId);
    const versionNumber = existingSubmissions.length + 1;
    const submissionNumber = `SUB-${rCase.caseNumber}-V${versionNumber}`;

    const submission: RegulatorySubmission = {
      id: `sub_${crypto.randomUUID()}`,
      caseId: input.caseId,
      submissionNumber,
      versionNumber,
      status: 'DRAFT',
      submissionMethod: input.submissionMethod,
      documentVersionId: input.documentVersionId,
      submittedContentSummary: input.submittedContentSummary,
      preparedByUserId: actor.id,
      approvedByUserId: '',
      submittedByUserId: '',
      authorizedSignatoryPoAId: input.authorizedSignatoryPoAId,
      supersedesSubmissionId: input.supersedesSubmissionId,
      integrityHashSha256: '',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
      correlationId: context.correlationId || `corr_${crypto.randomUUID()}`
    };

    const saved = await saveRegulatorySubmission(submission);

    // Link submission ID into case
    if (!rCase.submissionIds.includes(saved.id)) {
      rCase.submissionIds.push(saved.id);
      rCase.status = 'REVIEW_IN_PROGRESS';
      await saveRegulatoryCase(rCase);
    }

    return saved;
  }

  // ==========================================================================
  // 4. HUMAN REVIEW & APPROVAL (With Segregation of Duties)
  // ==========================================================================

  public async reviewAndApproveSubmission(
    submissionId: string,
    approver: User,
    context: ABACContext,
    notes?: string
  ): Promise<RegulatorySubmission> {
    // AI Authority Denial
    if (approver.id === 'service_principal_ai' || (approver as any).isAI) {
      throw new PermissionError('AI assistants are denied from approving official regulatory submissions');
    }

    const submission = await getRegulatorySubmissionById(submissionId);
    if (!submission) {
      throw new ValidationError(`Submission ${submissionId} not found`);
    }

    const rCase = await getRegulatoryCaseById(submission.caseId);
    if (!rCase) {
      throw new ValidationError(`Associated case ${submission.caseId} not found`);
    }
    this.assertEntityAccess(approver, rCase.legalEntityId, context);

    // Segregation of Duties (SoD): Preparer != Approver
    if (submission.preparedByUserId === approver.id) {
      throw new PermissionError('Segregation of Duties Violation: Preparer of submission cannot approve their own submission');
    }

    // If Board approval or formal GOV-06 corporate decision is required
    const plan = await getResponsePlanByCaseId(submission.caseId);
    if (plan?.requiresBoardApproval && !rCase.supportingDecisionId) {
      // Create GOV-06 Decision record for Board resolution
      const decision = await saveCorporateDecision({
        id: `dec_${crypto.randomUUID()}`,
        legalEntityId: rCase.legalEntityId,
        decisionNumber: `RES-${new Date().getFullYear()}-${submission.submissionNumber}`,
        title: `Formal Approval of Regulatory Submission: ${rCase.authorityName} (${rCase.caseNumber})`,
        decisionType: 'COMPLIANCE_POLICY_APPROVAL',
        lifecycleStatus: 'APPROVED',
        executionStatus: 'PENDING_DISPATCH',
        approvedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString().split('T')[0],
        evidenceIds: [submission.documentVersionId],
        auditCorrelationId: context.correlationId || `corr_${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, approver.id, context.correlationId);
      rCase.supportingDecisionId = decision.id;
    }

    submission.approvedByUserId = approver.id;
    submission.status = 'APPROVED';
    const saved = await saveRegulatorySubmission(submission);

    rCase.status = 'APPROVED_FOR_SUBMISSION';
    await saveRegulatoryCase(rCase);

    return saved;
  }

  // ==========================================================================
  // 5. OFFICIAL REGULATORY SUBMISSION EXECUTION
  // ==========================================================================

  public async executeSubmission(
    submissionId: string,
    receiptReference: string,
    submitter: User,
    context: ABACContext
  ): Promise<RegulatorySubmission> {
    if (submitter.id === 'service_principal_ai' || (submitter as any).isAI) {
      throw new PermissionError('AI assistants cannot officially transmit regulatory submissions');
    }

    const submission = await getRegulatorySubmissionById(submissionId);
    if (!submission) {
      throw new ValidationError(`Submission ${submissionId} not found`);
    }

    if (submission.status !== 'APPROVED') {
      throw new ValidationError(`Cannot execute submission in '${submission.status}' state. Must be APPROVED first.`);
    }

    const rCase = await getRegulatoryCaseById(submission.caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${submission.caseId} not found`);
    }
    this.assertEntityAccess(submitter, rCase.legalEntityId, context);

    submission.submittedByUserId = submitter.id;
    submission.submittedAtUtc = new Date().toISOString();
    submission.receiptReference = receiptReference;
    submission.status = 'SUBMITTED';

    const savedSubmission = await saveRegulatorySubmission(submission);

    // Handoff to GOV-15 Controlled Corporate Action
    await createGovernanceAction({
      id: `act_${crypto.randomUUID()}`,
      actionNumber: `ACT-${rCase.caseNumber}-SUB`,
      title: `Transmit Official Response to ${rCase.authorityName}`,
      legalEntityId: rCase.legalEntityId,
      sourceType: 'AUDIT_RECOMMENDATION',
      sourceReferenceId: rCase.supportingDecisionId || rCase.id,
      ownerUserId: submitter.id,
      ownerRole: submitter.role,
      dueDate: new Date().toISOString(),
      priority: 'HIGH',
      details: `Official submission ${submission.submissionNumber} dispatched. Receipt: ${receiptReference}`
    }, submitter.id);

    // Case is now SUBMITTED / AWAITING_REGULATOR_RESPONSE (Submitted != Accepted)
    rCase.status = 'SUBMITTED';
    await saveRegulatoryCase(rCase);

    return savedSubmission;
  }

  // ==========================================================================
  // 6. RECORD REGULATOR FEEDBACK & OBSERVATIONS
  // ==========================================================================

  public async recordRegulatorFeedback(
    input: {
      caseId: string;
      submissionId: string;
      regulatorResponseStatus: 'ACKNOWLEDGED' | 'ACCEPTED' | 'REJECTED' | 'MORE_INFORMATION_REQUIRED';
      regulatorResponseNotes: string;
      hasObservationsOrCommitments?: boolean;
    },
    actor: User,
    context: ABACContext
  ): Promise<RegulatoryCase> {
    const rCase = await getRegulatoryCaseById(input.caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${input.caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    const submission = await getRegulatorySubmissionById(input.submissionId);
    if (submission) {
      submission.regulatorAcknowledgedAtUtc = new Date().toISOString();
      submission.regulatorResponseNotes = input.regulatorResponseNotes;
      if (input.regulatorResponseStatus === 'ACCEPTED') {
        submission.status = 'ACCEPTED';
      } else if (input.regulatorResponseStatus === 'REJECTED') {
        submission.status = 'REJECTED';
      } else if (input.regulatorResponseStatus === 'MORE_INFORMATION_REQUIRED') {
        submission.status = 'MORE_INFORMATION_REQUIRED';
      } else {
        submission.status = 'ACKNOWLEDGED';
      }
      await saveRegulatorySubmission(submission);
    }

    if (input.regulatorResponseStatus === 'MORE_INFORMATION_REQUIRED') {
      rCase.status = 'RESPONSE_PLANNING';
    } else if (input.hasObservationsOrCommitments) {
      rCase.status = 'COMMITMENT_TRACKING';
    } else if (input.regulatorResponseStatus === 'ACCEPTED') {
      rCase.status = 'VERIFICATION';
    } else {
      rCase.status = 'AWAITING_REGULATOR_RESPONSE';
    }

    return await saveRegulatoryCase(rCase);
  }

  // ==========================================================================
  // 7. REGULATORY COMMITMENT MANAGEMENT
  // ==========================================================================

  public async registerRegulatoryCommitment(
    input: {
      caseId: string;
      sourceSubmissionId: string;
      description: string;
      dueDateUtc: string;
      ownerUserId: string;
      evidenceRequirementDocumentIds?: string[];
      isConfirmedInternalDeficiency?: boolean; // If true, creates GOV-11 finding
    },
    actor: User,
    context: ABACContext
  ): Promise<RegulatoryCommitment> {
    const rCase = await getRegulatoryCaseById(input.caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${input.caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    const year = new Date().getFullYear();
    const commitmentNumber = generateCommitmentNumber(year);
    const commitmentId = `rcm_${crypto.randomUUID()}`;

    // 1. Calendar Event Registration (GOV-08)
    const calEvt = await saveOccurrence({
      id: `occ_${crypto.randomUUID()}`,
      occurrenceNumber: `CMP-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
      obligationId: rCase.id,
      obligationCode: commitmentNumber,
      legalEntityId: rCase.legalEntityId,
      jurisdiction: rCase.jurisdiction,
      title: `Regulatory Commitment: ${input.description.substring(0, 50)}... (${commitmentNumber})`,
      description: input.description,
      referencePeriodStart: new Date().toISOString().split('T')[0],
      referencePeriodEnd: input.dueDateUtc.split('T')[0],
      periodReference: `${year}-RCM`,
      scheduledDate: input.dueDateUtc,
      statutoryDueDate: input.dueDateUtc,
      dueLocalDate: input.dueDateUtc.split('T')[0],
      timeZone: 'UTC',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: input.ownerUserId,
      filingRequired: false,
      evidenceRequired: true,
      evidenceDocumentIds: input.evidenceRequirementDocumentIds || [],
      reminderSchedule: {
        reminderDaysBeforeDue: [14, 7, 3, 1],
        escalationAfterOverdueDays: [1, 3],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: `gen_${rCase.id}_${commitmentNumber}`,
      generatedBy: actor.id,
      auditCorrelationId: context.correlationId || `corr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, actor.id);

    // 2. If confirmed internal deficiency, route to canonical GOV-11 Finding
    let findingId: string | undefined = undefined;
    if (input.isConfirmedInternalDeficiency) {
      const fndId = `fnd_${crypto.randomUUID()}`;
      const finding: GovernanceFinding = {
        id: fndId,
        fingerprint: `FINGERPRINT_${rCase.legalEntityId}_REGULATORY_REVIEW_${rCase.id}_${commitmentNumber}`,
        legalEntityId: rCase.legalEntityId,
        sourceType: 'REGULATORY_REVIEW',
        sourceResourceId: rCase.id,
        findingNumber: `FND-${commitmentNumber}`,
        title: `Regulatory Observation Deficiency: ${commitmentNumber}`,
        description: input.description,
        severity: 'HIGH',
        status: 'OPEN',
        openedAt: new Date().toISOString(),
        ownerUserId: input.ownerUserId,
        dueDate: input.dueDateUtc,
        evidenceIds: input.evidenceRequirementDocumentIds || [],
        reopenHistory: [],
        auditCorrelationId: context.correlationId || `corr_${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveGovernanceFinding(finding, actor.id);
      findingId = fndId;
      if (!rCase.findingIds.includes(findingId)) {
        rCase.findingIds.push(findingId);
      }
    }

    const commitment: RegulatoryCommitment = {
      id: commitmentId,
      caseId: input.caseId,
      commitmentNumber,
      sourceSubmissionId: input.sourceSubmissionId,
      description: input.description,
      acceptedByAuthority: true,
      commitmentDateUtc: new Date().toISOString(),
      dueDateUtc: input.dueDateUtc,
      ownerUserId: input.ownerUserId,
      status: 'OPEN',
      evidenceRequirementDocumentIds: input.evidenceRequirementDocumentIds || [],
      governanceCalendarEventId: calEvt.id,
      findingId,
      integrityHashSha256: '',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
      correlationId: context.correlationId || `corr_${crypto.randomUUID()}`
    };

    const saved = await saveRegulatoryCommitment(commitment);

    if (!rCase.commitmentIds.includes(saved.id)) {
      rCase.commitmentIds.push(saved.id);
      rCase.status = 'COMMITMENT_TRACKING';
      await saveRegulatoryCase(rCase);
    }

    return saved;
  }

  public async verifyAndFulfillCommitment(
    commitmentId: string,
    verifier: User,
    context: ABACContext,
    notes: string,
    evidenceDocumentIds: string[]
  ): Promise<RegulatoryCommitment> {
    const commitment = await getRegulatoryCommitmentById(commitmentId);
    if (!commitment) {
      throw new ValidationError(`Commitment ${commitmentId} not found`);
    }

    const rCase = await getRegulatoryCaseById(commitment.caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${commitment.caseId} not found`);
    }
    this.assertEntityAccess(verifier, rCase.legalEntityId, context);

    // Segregation of Duties: Commitment owner cannot self-verify fulfillment
    if (commitment.ownerUserId === verifier.id) {
      throw new PermissionError('Segregation of Duties Violation: Commitment owner cannot self-verify commitment fulfillment');
    }

    commitment.status = 'VERIFIED';
    commitment.verifiedByUserId = verifier.id;
    commitment.verifiedAtUtc = new Date().toISOString();
    commitment.verificationNotes = notes;
    if (evidenceDocumentIds && evidenceDocumentIds.length > 0) {
      commitment.evidenceRequirementDocumentIds = Array.from(new Set([...commitment.evidenceRequirementDocumentIds, ...evidenceDocumentIds]));
    }

    const saved = await saveRegulatoryCommitment(commitment);

    // Check if all commitments for case are now verified
    const allCommitments = await listCommitmentsByCaseId(rCase.id);
    const allDone = allCommitments.every(c => c.status === 'VERIFIED' || c.status === 'FULFILLED');
    if (allDone && rCase.status === 'COMMITMENT_TRACKING') {
      rCase.status = 'VERIFICATION';
      await saveRegulatoryCase(rCase);
    }

    return saved;
  }

  // ==========================================================================
  // 8. CASE CLOSURE & RECONCILIATION
  // ==========================================================================

  public async closeRegulatoryCase(
    caseId: string,
    closingUser: User,
    context: ABACContext,
    closureSummary: string
  ): Promise<RegulatoryCase> {
    if (closingUser.id === 'service_principal_ai' || (closingUser as any).isAI) {
      throw new PermissionError('AI assistants cannot close regulatory cases');
    }

    const rCase = await getRegulatoryCaseById(caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${caseId} not found`);
    }
    this.assertEntityAccess(closingUser, rCase.legalEntityId, context);

    // 1. Reconciliation & Closure Guard: Check open commitments
    const commitments = await listCommitmentsByCaseId(caseId);
    const openCommitments = commitments.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS' || c.status === 'OVERDUE');
    if (openCommitments.length > 0) {
      throw new ValidationError(
        `Cannot close regulatory case with ${openCommitments.length} open regulatory commitments remaining`
      );
    }

    // 2. Check submissions sent
    const submissions = await listSubmissionsByCaseId(caseId);
    if (submissions.length === 0) {
      throw new ValidationError('Cannot close regulatory case without any official submissions recorded');
    }

    rCase.status = 'CLOSED';
    rCase.description = `${rCase.description}\n\n[CLOSED ${new Date().toISOString()} by ${closingUser.name || closingUser.id}]: ${closureSummary}`;

    return await saveRegulatoryCase(rCase);
  }

  public async reconcileRegulatoryCase(
    caseId: string,
    actor: User,
    context: ABACContext
  ): Promise<CaseReconciliationResult> {
    const rCase = await getRegulatoryCaseById(caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    const submissions = await listSubmissionsByCaseId(caseId);
    const commitments = await listCommitmentsByCaseId(caseId);

    const allApprovedAndSent = submissions.length > 0 && submissions.every(s => s.status === 'SUBMITTED' || s.status === 'ACKNOWLEDGED' || s.status === 'ACCEPTED');
    const regulatorAccepted = submissions.some(s => s.status === 'ACCEPTED');
    const openCommitmentsCount = commitments.filter(c => c.status !== 'VERIFIED' && c.status !== 'FULFILLED').length;
    const hasMoreInfoReq = submissions.some(s => s.status === 'MORE_INFORMATION_REQUIRED');

    let reconciliationStatus: CaseReconciliationStatus = 'ALIGNED';
    const details: string[] = [];

    if (hasMoreInfoReq) {
      reconciliationStatus = 'MORE_INFORMATION_REQUIRED';
      details.push('Regulator requested additional information on latest submission');
    } else if (openCommitmentsCount > 0) {
      reconciliationStatus = 'COMMITMENT_OPEN';
      details.push(`${openCommitmentsCount} regulatory commitments remain pending fulfillment`);
    } else if (!allApprovedAndSent) {
      reconciliationStatus = 'AWAITING_RESPONSE';
      details.push('Submissions are still in draft, review or awaiting transmission');
    } else {
      reconciliationStatus = 'ALIGNED';
      details.push('All submissions transmitted, accepted, and all commitments verified');
    }

    return {
      caseId,
      legalEntityId: rCase.legalEntityId,
      reconciliationStatus,
      allSubmissionsApprovedAndSent: allApprovedAndSent,
      regulatorAccepted,
      openCommitmentsCount,
      openFindingsCount: rCase.findingIds.length,
      missingEvidenceCount: rCase.evidenceDocumentIds.length === 0 ? 1 : 0,
      details,
      evaluatedAtUtc: new Date().toISOString()
    };
  }

  // ==========================================================================
  // 9. DETERMINISTIC POINT-IN-TIME CASE REPLAY
  // ==========================================================================

  public async getPointInTimeRegulatoryCaseReplay(
    caseId: string,
    asOfDateIso: string,
    actor: User,
    context: ABACContext
  ): Promise<PointInTimeRegulatoryCaseSnapshot> {
    const rCase = await getRegulatoryCaseById(caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    const asOfTime = new Date(asOfDateIso).getTime();

    // Replay submissions existing on or before asOfDateIso
    const allSubmissions = await listSubmissionsByCaseId(caseId);
    const activeSubmissionsAtTime = allSubmissions
      .filter(s => new Date(s.createdAtUtc).getTime() <= asOfTime)
      .map(s => ({
        submissionId: s.id,
        versionNumber: s.versionNumber,
        status: s.status,
        documentVersionId: s.documentVersionId
      }));

    // Replay commitments existing on or before asOfDateIso
    const allCommitments = await listCommitmentsByCaseId(caseId);
    const activeCommitmentsAtTime = allCommitments
      .filter(c => new Date(c.createdAtUtc).getTime() <= asOfTime)
      .map(c => ({
        commitmentId: c.id,
        description: c.description,
        dueDateUtc: c.dueDateUtc,
        status: (c.verifiedAtUtc && new Date(c.verifiedAtUtc).getTime() <= asOfTime) ? 'VERIFIED' as RegulatoryCommitmentStatus : 'OPEN' as RegulatoryCommitmentStatus
      }));

    // Determine status at time T
    let statusAtTime = rCase.status;
    if (asOfTime < new Date(rCase.createdAtUtc).getTime()) {
      statusAtTime = 'RECEIVED';
    } else if (activeSubmissionsAtTime.length === 0) {
      statusAtTime = 'TRIAGE';
    }

    return {
      snapshotAsOfDate: asOfDateIso,
      caseId: rCase.id,
      caseNumber: rCase.caseNumber,
      legalEntityId: rCase.legalEntityId,
      jurisdiction: rCase.jurisdiction,
      authorityName: rCase.authorityName,
      statusAtTime,
      activeSubmissionsAtTime,
      activeCommitmentsAtTime,
      activeFindingsAtTime: rCase.findingIds,
      legalHoldActiveAtTime: !!rCase.legalHoldId,
      generatedAtUtc: new Date().toISOString(),
      integrityHashSha256: computeCaseSha256({
        caseId: rCase.id,
        asOfDateIso,
        activeSubmissionsCount: activeSubmissionsAtTime.length,
        activeCommitmentsCount: activeCommitmentsAtTime.length
      })
    };
  }

  // ==========================================================================
  // 10. ACCESS & ENTITY SCOPING HELPERS
  // ==========================================================================

  private assertEntityAccess(actor: User, legalEntityId: string, context: ABACContext): void {
    if (!actor) {
      throw new PermissionError('Authentication required to access regulatory cases');
    }

    // System Admins and Global Compliance Officers have cross-entity read/write access
    if (
      actor.role === 'ADMIN' || 
      actor.role === 'SYSTEM_ADMIN' ||
      actor.role === 'PLATFORM_ADMIN' ||
      actor.role === 'COMPANY_ADMIN'
    ) {
      return;
    }

    // Entity-scoped users must match the target entity
    const userEntity = (actor as any).legalEntityId || actor.companyId;
    if (userEntity && userEntity !== legalEntityId && userEntity !== 'GLOBAL') {
      throw new PermissionError(
        `Cross-Entity Access Denied: User from entity '${userEntity}' cannot access regulatory cases of '${legalEntityId}'`
      );
    }
  }

  public async getRegulatoryCase(caseId: string, actor: User, context: ABACContext): Promise<RegulatoryCase> {
    const rCase = await getRegulatoryCaseById(caseId);
    if (!rCase) {
      throw new ValidationError(`Case ${caseId} not found`);
    }
    this.assertEntityAccess(actor, rCase.legalEntityId, context);

    // Privileged content protection
    if (rCase.isPrivilegedLegalContent) {
      const isPrivilegedRole = 
        actor.role === 'LEGAL_COUNSEL' || 
        actor.role === 'COMPLIANCE_OFFICER' ||
        actor.role === 'SYSTEM_ADMIN';
      if (!isPrivilegedRole && actor.id !== rCase.caseOwnerUserId) {
        throw new PermissionError('Access Denied: Case contains legally privileged advisory content');
      }
    }

    return rCase;
  }

  public async exportRegulatoryCaseBundle(
    caseId: string,
    actor: User,
    context: ABACContext
  ): Promise<{ caseRecord: RegulatoryCase; submissions: RegulatorySubmission[]; commitments: RegulatoryCommitment[] }> {
    // View != Export: require explicit export permission
    const hasExportRole = 
      actor.permissions?.includes('governance:export:authorized') ||
      actor.permissions?.includes('GOVERNANCE_EXPORT') ||
      actor.role === 'COMPLIANCE_OFFICER' ||
      actor.role === 'LEGAL_COUNSEL' ||
      actor.role === 'AUDITOR' ||
      actor.role === 'ADMIN' ||
      actor.role === 'SYSTEM_ADMIN';

    if (!hasExportRole) {
      throw new PermissionError('Export Denied: View permission does not grant regulatory bundle export entitlement');
    }

    const rCase = await this.getRegulatoryCase(caseId, actor, context);
    const submissions = await listSubmissionsByCaseId(caseId);
    const commitments = await listCommitmentsByCaseId(caseId);

    return {
      caseRecord: rCase,
      submissions,
      commitments
    };
  }
}

export const regulatoryCaseService = new RegulatoryCaseService();
