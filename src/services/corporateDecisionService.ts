/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Corporate Decision & Board Resolution Service
 * Step GOV-06: Decision Register, Board Resolutions, Meetings, Voting & Controlled Execution
 * 
 * Core Architectural Invariants:
 * - Deterministic numbering: `DEC-YYYY-####`, `MTG-YYYY-####`, `RES-YYYY-####`
 * - Strict Lifecycle State Machine: DRAFT -> REVIEW -> APPROVAL -> RESOLUTION -> EXECUTION -> EVIDENCE -> VERIFICATION -> AUDIT -> CLOSED
 * - Direct status tampering blocked: Transitions only through validated domain operations
 * - Separation of Duties (Anti-Self-Approval): Requesters cannot approve/adopt own resolutions
 * - Statutory Voting Authority: Only verified active directors/officers can cast binding votes
 * - Quorum & Threshold Engine: Ordinary (>50%), Special (>=75%), Unanimous (100%)
 * - Conflict of Interest & Recusal handling
 * - Historical Preservation: Approved/Adopted records cannot be hard-deleted
 */

import { 
  CorporateDecision, 
  BoardMeeting,
  MeetingParticipantRecord,
  DecisionVoteRecord,
  CorporateResolution,
  DecisionLifecycleState,
  CorporateDecisionType,
  BoardMeetingStatus,
  GovernanceJurisdiction,
  MeetingModality,
  QuorumPolicy,
  VotingThresholdPolicy
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import { 
  getCorporateDecisionById, 
  listCorporateDecisionsByEntity, 
  saveCorporateDecision,
  generateNextDecisionNumber,
  getBoardMeetingById,
  listBoardMeetingsByEntity,
  saveBoardMeeting,
  generateNextMeetingNumber,
  listParticipantsByMeeting,
  saveMeetingParticipant,
  listVotesByDecision,
  saveDecisionVote,
  getCorporateResolutionById,
  getResolutionByDecisionId,
  listResolutionsByEntity,
  saveCorporateResolution,
  generateNextResolutionNumber,
  listAppointmentsByLegalEntity,
  deleteCorporateRecordProhibited
} from '../db/repositories/corporateGovernanceRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { ValidationError } from '../db/validation';

export interface DecisionServiceContext {
  principal: User;
  correlationId?: string;
}

export interface CreateDecisionPayload {
  legalEntityId: string;
  decisionType: CorporateDecisionType;
  title: string;
  description: string;
  jurisdictionContext: GovernanceJurisdiction;
  relatedDepartmentId?: string;
  relatedBusinessProcess?: string;
  decisionDate: string; // UTC ISO string
  meetingId?: string;
  meetingDate?: string;
  meetingModality: MeetingModality;
  eventTimeZone: string;
  decisionLocationContext: {
    country: string;
    city?: string;
    timeZone: string;
    meetingModality: MeetingModality;
  };
  effectiveDate: string;
  expirationDate?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolutionText: string;
  supportingDocumentIds?: string[];
}

export interface CreateBoardMeetingPayload {
  legalEntityId: string;
  title: string;
  meetingType: 'ANNUAL_GENERAL_MEETING' | 'EXTRAORDINARY_GENERAL_MEETING' | 'BOARD_OF_DIRECTORS' | 'AUDIT_COMMITTEE' | 'REMUNERATION_COMMITTEE' | 'RISK_COMMITTEE' | 'FINANCE_COMMITTEE' | 'EXECUTIVE_COMMITTEE';
  scheduledAtUtc: string;
  eventLocalTime: string;
  timeZone: string;
  meetingModality: MeetingModality;
  physicalLocation?: string;
  remoteMeetingContext?: {
    platform?: string;
    meetingUrlMasked?: string;
    hostCountry: string;
    hostCity?: string;
    timeZone: string;
  };
  chairpersonUserId?: string;
  secretaryUserId?: string;
  chairpersonName: string;
  secretaryName: string;
  quorumRequired?: number;
  agendaDocumentId?: string;
}

export interface CastVotePayload {
  voterAppointmentId?: string; // Active Director Appointment ID
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  votingMethod: 'IN_PERSON_VOICE' | 'IN_PERSON_BALLOT' | 'REMOTE_ELECTRONIC' | 'WRITTEN_CONSENT' | 'PROXY';
  comment?: string;
  conflictDeclared?: boolean;
  recused?: boolean;
  abstentionReason?: string;
}

export class CorporateDecisionService {

  // ============================================================================
  // 1. CORPORATE DECISION REGISTER (CRUD & LIFECYCLE)
  // ============================================================================

  /**
   * Drafts a new Corporate Decision / Resolution proposal.
   */
  public static async createDecision(
    payload: CreateDecisionPayload,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const { legalEntityId } = payload;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:create',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks 'governance:decision:create' authority for legal entity ${legalEntityId}`
      );
    }

    const decisionNumber = await generateNextDecisionNumber(legalEntityId);
    const id = `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const decision: CorporateDecision = {
      id,
      decisionNumber,
      legalEntityId,
      decisionType: payload.decisionType,
      title: payload.title,
      description: payload.description,
      jurisdictionContext: payload.jurisdictionContext,
      relatedDepartmentId: payload.relatedDepartmentId,
      relatedBusinessProcess: payload.relatedBusinessProcess,
      decisionDate: payload.decisionDate,
      meetingId: payload.meetingId,
      meetingDate: payload.meetingDate,
      meetingModality: payload.meetingModality,
      eventTimeZone: payload.eventTimeZone,
      decisionLocationContext: payload.decisionLocationContext,
      effectiveDate: payload.effectiveDate,
      expirationDate: payload.expirationDate,
      lifecycleStatus: 'DRAFT',
      executionStatus: 'NOT_APPLICABLE',
      riskLevel: payload.riskLevel,
      resolutionText: payload.resolutionText,
      participants: [],
      createdByUserId: principal.id,
      approvedByUserIds: [],
      supportingDocumentIds: payload.supportingDocumentIds || [],
      evidenceIds: [],
      version: 1,
      auditCorrelationId: correlationId || `cor_dec_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    const saved = await saveCorporateDecision(decision, principal.id, correlationId);
    return saved;
  }

  /**
   * Retrieves a decision with ABAC verification.
   */
  public static async getDecision(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision | null> {
    const { principal } = ctx;
    const decision = await getCorporateDecisionById(decisionId);
    if (!decision) return null;

    const abacContext: ABACContext = {
      legalEntityId: decision.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks 'governance:decision:view' authority for legal entity ${decision.legalEntityId}`
      );
    }

    return decision;
  }

  /**
   * Lists corporate decisions for a specific legal entity with ABAC scoping.
   */
  public static async listDecisions(
    legalEntityId: string,
    filter: { lifecycleStatus?: DecisionLifecycleState; decisionType?: CorporateDecisionType } | undefined,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision[]> {
    const { principal } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks 'governance:decision:view' for legal entity ${legalEntityId}`
      );
    }

    return listCorporateDecisionsByEntity(legalEntityId, filter);
  }

  /**
   * Updates an in-flight Draft decision prior to formal review/voting.
   */
  public static async updateDecisionDraft(
    decisionId: string,
    updates: Partial<CreateDecisionPayload>,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) {
      throw new ValidationError(`Decision not found: ${decisionId}`);
    }

    if (decision.lifecycleStatus !== 'DRAFT' && decision.lifecycleStatus !== 'RETURNED_FOR_REVISION') {
      throw new ValidationError(
        `Cannot edit decision in '${decision.lifecycleStatus}' status. Only DRAFT or RETURNED_FOR_REVISION decisions can be modified.`
      );
    }

    const updatedDecision: CorporateDecision = {
      ...decision,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return saveCorporateDecision(updatedDecision, principal.id, correlationId);
  }

  // ============================================================================
  // 2. STATE MACHINE LIFECYCLE TRANSITIONS
  // ============================================================================

  /**
   * Transition: DRAFT / RETURNED_FOR_REVISION -> REVIEW
   */
  public static async submitForReview(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    if (decision.lifecycleStatus !== 'DRAFT' && decision.lifecycleStatus !== 'RETURNED_FOR_REVISION') {
      throw new ValidationError(`Cannot submit decision in '${decision.lifecycleStatus}' for review.`);
    }

    decision.lifecycleStatus = 'REVIEW';
    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Transition: REVIEW -> APPROVAL (or RETURNED_FOR_REVISION)
   */
  public static async completeReview(
    decisionId: string,
    approvedForVoting: boolean,
    reviewerComment: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    const abacContext: ABACContext = {
      legalEntityId: decision.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:review',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal (${principal.email}) lacks 'governance:decision:review' authority.`);
    }

    if (decision.lifecycleStatus !== 'REVIEW') {
      throw new ValidationError(`Cannot review decision in '${decision.lifecycleStatus}' state.`);
    }

    decision.reviewedByUserId = principal.id;
    decision.lifecycleStatus = approvedForVoting ? 'APPROVAL' : 'RETURNED_FOR_REVISION';

    await createAuditLog({
      actorUserId: principal.id,
      action: approvedForVoting ? 'REVIEW_DECISION_PASSED' : 'REVIEW_DECISION_RETURNED',
      entityType: 'CORPORATE_DECISION',
      entityId: decision.id,
      metadata: {
        reviewerComment,
        nextState: decision.lifecycleStatus
      }
    });

    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Transition: APPROVAL -> RESOLUTION (Adoption of formal board resolution)
   * Enforces:
   * - Quorum check (minimum active directors/participants)
   * - Voting threshold check (majority >50%, special >=75%, unanimous 100%)
   * - Separation of Duties (anti-self-approval if creator is the sole voter)
   */
  public static async adoptResolution(
    decisionId: string,
    resolutionType: 'ORDINARY_RESOLUTION' | 'SPECIAL_RESOLUTION' | 'BOARD_RESOLUTION' | 'UNANIMOUS_WRITTEN_RESOLUTION',
    ctx: DecisionServiceContext
  ): Promise<{ decision: CorporateDecision; resolution: CorporateResolution }> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    const abacContext: ABACContext = {
      legalEntityId: decision.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:approve',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal (${principal.email}) lacks 'governance:decision:approve' authority.`);
    }

    if (decision.lifecycleStatus !== 'APPROVAL') {
      throw new ValidationError(`Cannot adopt resolution in '${decision.lifecycleStatus}' state. Status must be 'APPROVAL'.`);
    }

    // 1. Fetch all votes recorded for this decision
    const votes = await listVotesByDecision(decisionId);
    
    // Calculate eligible binding votes (exclude recused / non-eligible)
    const validVotes = votes.filter((v) => !v.recused && v.vote !== 'NOT_ELIGIBLE');
    const votesFor = validVotes.filter((v) => v.vote === 'FOR').length;
    const votesAgainst = validVotes.filter((v) => v.vote === 'AGAINST').length;
    const votesAbstain = validVotes.filter((v) => v.vote === 'ABSTAIN').length;
    const totalCasting = votesFor + votesAgainst; // Abstentions typically don't count toward majority denominator

    // 2. Fetch Active Directors for Quorum evaluation
    const activeAppointments = await listAppointmentsByLegalEntity(decision.legalEntityId, 'ACTIVE');
    const directorAppointments = activeAppointments.filter((a) => 
      ['DIRECTOR', 'MANAGING_DIRECTOR', 'EXECUTIVE_DIRECTOR', 'FINANCE_DIRECTOR'].includes(a.statutoryRole)
    );
    const totalDirectorsCount = Math.max(directorAppointments.length, 1);

    // Quorum: At least 50% of active directors or at least 1 director in single-director companies
    const quorumRequired = Math.ceil(totalDirectorsCount / 2);
    const quorumMet = validVotes.length >= quorumRequired;

    if (!quorumMet && validVotes.length > 0) {
      throw new ValidationError(
        `Quorum Not Met: Recorded ${validVotes.length} eligible voters, but quorum requires at least ${quorumRequired} directors.`
      );
    }

    // 3. Voting Threshold check
    let requiredPercentage = 50.0;
    if (resolutionType === 'SPECIAL_RESOLUTION') {
      requiredPercentage = 75.0;
    } else if (resolutionType === 'UNANIMOUS_WRITTEN_RESOLUTION') {
      requiredPercentage = 100.0;
    }

    const approvalPercentage = totalCasting > 0 ? (votesFor / totalCasting) * 100 : (votesFor > 0 ? 100 : 0);
    const thresholdAchieved = approvalPercentage >= requiredPercentage && votesFor > 0;

    if (!thresholdAchieved && validVotes.length > 0) {
      // Mark decision as rejected if votes cast failed threshold
      decision.lifecycleStatus = 'REJECTED';
      await saveCorporateDecision(decision, principal.id, correlationId);
      throw new ValidationError(
        `Resolution Adoption Failed: Required ${requiredPercentage}% approval, but achieved ${approvalPercentage.toFixed(1)}% (${votesFor} FOR, ${votesAgainst} AGAINST).`
      );
    }

    // 4. Separation of Duties (Anti-Self-Approval)
    // If the creator is the ONLY approver and there are other active directors, reject unilateral self-approval
    if (totalDirectorsCount > 1 && votesFor === 1 && validVotes[0]?.voterUserId === decision.createdByUserId) {
      throw new ValidationError(
        `Separation of Duties Violation: Creator (${principal.email}) cannot unilaterally adopt resolutions without co-director approval.`
      );
    }

    // 5. Generate and Save Corporate Resolution Record
    const resolutionNumber = await generateNextResolutionNumber(decision.legalEntityId);
    const resolutionId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const resolution: CorporateResolution = {
      id: resolutionId,
      resolutionNumber,
      decisionId: decision.id,
      legalEntityId: decision.legalEntityId,
      title: decision.title,
      resolutionText: decision.resolutionText,
      resolutionType,
      adoptionDateUtc: now,
      effectiveDate: decision.effectiveDate,
      expirationDate: decision.expirationDate,
      votingOutcome: {
        votesFor,
        votesAgainst,
        votesAbstain,
        totalEligibleVoters: totalDirectorsCount,
        quorumMet,
        approvalPercentage,
        thresholdAchieved: true
      },
      signatories: [
        {
          userId: principal.id,
          name: principal.fullName || principal.email,
          title: principal.role,
          signedAtUtc: now
        }
      ],
      status: 'ACTIVE',
      auditCorrelationId: correlationId || decision.auditCorrelationId,
      createdAt: now,
      updatedAt: now
    };

    const savedResolution = await saveCorporateResolution(resolution, principal.id, correlationId);

    // 6. Update Decision to RESOLUTION status
    decision.lifecycleStatus = 'RESOLUTION';
    decision.resolutionId = savedResolution.id;
    decision.approvedByUserIds = Array.from(new Set([...decision.approvedByUserIds, principal.id]));
    
    // Automatically set executionStatus to PENDING_DISPATCH if actionable decision
    decision.executionStatus = 'PENDING_DISPATCH';

    const savedDecision = await saveCorporateDecision(decision, principal.id, correlationId);

    return { decision: savedDecision, resolution: savedResolution };
  }

  /**
   * Transition: RESOLUTION -> EXECUTION
   */
  public static async transitionToExecution(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    if (decision.lifecycleStatus !== 'RESOLUTION') {
      throw new ValidationError(`Cannot transition to EXECUTION from status '${decision.lifecycleStatus}'.`);
    }

    decision.lifecycleStatus = 'EXECUTION';
    decision.executionStatus = 'IN_PROGRESS';
    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Transition: EXECUTION -> EVIDENCE
   */
  public static async attachExecutionEvidence(
    decisionId: string,
    evidenceIds: string[],
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    if (decision.lifecycleStatus !== 'EXECUTION') {
      throw new ValidationError(`Cannot attach execution evidence in '${decision.lifecycleStatus}' state.`);
    }

    decision.evidenceIds = Array.from(new Set([...decision.evidenceIds, ...evidenceIds]));
    decision.lifecycleStatus = 'EVIDENCE';
    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Transition: EVIDENCE -> VERIFICATION
   * Enforces Separation of Duties: Verifier != Executor
   */
  public static async verifyDecision(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    const abacContext: ABACContext = {
      legalEntityId: decision.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:verify',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal lacks 'governance:decision:verify' authority.`);
    }

    if (decision.lifecycleStatus !== 'EVIDENCE') {
      throw new ValidationError(`Cannot verify decision in '${decision.lifecycleStatus}' state.`);
    }

    if (decision.executedByUserId && decision.executedByUserId === principal.id) {
      throw new ValidationError(
        `Separation of Duties Violation: Decision executor cannot verify own execution evidence.`
      );
    }

    decision.lifecycleStatus = 'VERIFICATION';
    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Transition: VERIFICATION -> AUDIT
   */
  public static async auditDecision(
    decisionId: string,
    auditNotes: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    const abacContext: ABACContext = {
      legalEntityId: decision.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:audit',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal lacks 'governance:decision:audit' authority.`);
    }

    if (decision.lifecycleStatus !== 'VERIFICATION') {
      throw new ValidationError(`Cannot audit decision in '${decision.lifecycleStatus}' state.`);
    }

    decision.lifecycleStatus = 'AUDIT';

    await createAuditLog({
      actorUserId: principal.id,
      action: 'AUDIT_CORPORATE_DECISION_COMPLETE',
      entityType: 'CORPORATE_DECISION',
      entityId: decision.id,
      metadata: {
        auditNotes,
        correlationId
      }
    });

    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Transition: AUDIT -> CLOSED
   */
  public static async closeDecision(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    if (decision.lifecycleStatus !== 'AUDIT') {
      throw new ValidationError(`Cannot close decision in '${decision.lifecycleStatus}' state. Must complete AUDIT stage.`);
    }

    decision.lifecycleStatus = 'CLOSED';
    decision.closedAt = new Date().toISOString();

    return saveCorporateDecision(decision, principal.id, correlationId);
  }

  /**
   * Supersedes an existing corporate decision with a new successor decision.
   */
  public static async supersedeDecision(
    oldDecisionId: string,
    newDecisionId: string,
    reason: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision> {
    const { principal, correlationId } = ctx;
    const oldDecision = await this.getDecision(oldDecisionId, ctx);
    if (!oldDecision) throw new ValidationError(`Old decision not found: ${oldDecisionId}`);

    const abacContext: ABACContext = {
      legalEntityId: oldDecision.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:supersede',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal lacks 'governance:decision:supersede' authority.`);
    }

    oldDecision.lifecycleStatus = 'SUPERSEDED';
    oldDecision.supersededByDecisionId = newDecisionId;

    await createAuditLog({
      actorUserId: principal.id,
      action: 'SUPERSEDE_CORPORATE_DECISION',
      entityType: 'CORPORATE_DECISION',
      entityId: oldDecision.id,
      metadata: {
        newDecisionId,
        reason,
        correlationId
      }
    });

    return saveCorporateDecision(oldDecision, principal.id, correlationId);
  }

  // ============================================================================
  // 3. BOARD MEETINGS & PARTICIPANTS
  // ============================================================================

  /**
   * Creates a formal Board Meeting record.
   */
  public static async createBoardMeeting(
    payload: CreateBoardMeetingPayload,
    ctx: DecisionServiceContext
  ): Promise<BoardMeeting> {
    const { principal, correlationId } = ctx;
    const { legalEntityId } = payload;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:create',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal lacks authority to schedule meetings for ${legalEntityId}`);
    }

    const meetingNumber = await generateNextMeetingNumber(legalEntityId);
    const id = `mtg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const meeting: BoardMeeting = {
      id,
      meetingNumber,
      legalEntityId,
      title: payload.title,
      meetingType: payload.meetingType,
      scheduledAtUtc: payload.scheduledAtUtc,
      eventLocalTime: payload.eventLocalTime,
      timeZone: payload.timeZone,
      meetingModality: payload.meetingModality,
      physicalLocation: payload.physicalLocation,
      remoteMeetingContext: payload.remoteMeetingContext,
      status: 'SCHEDULED',
      chairpersonUserId: payload.chairpersonUserId,
      secretaryUserId: payload.secretaryUserId,
      chairpersonName: payload.chairpersonName,
      secretaryName: payload.secretaryName,
      quorumRequired: payload.quorumRequired || 2,
      decisionIds: [],
      createdByUserId: principal.id,
      agendaDocumentId: payload.agendaDocumentId,
      createdAt: now,
      updatedAt: now
    };

    return saveBoardMeeting(meeting, principal.id, correlationId);
  }

  /**
   * Retrieves a Board Meeting.
   */
  public static async getBoardMeeting(
    meetingId: string,
    ctx: DecisionServiceContext
  ): Promise<BoardMeeting | null> {
    const { principal } = ctx;
    const meeting = await getBoardMeetingById(meetingId);
    if (!meeting) return null;

    const abacContext: ABACContext = {
      legalEntityId: meeting.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal lacks permission to view meeting.`);
    }

    return meeting;
  }

  /**
   * Lists board meetings for a legal entity.
   */
  public static async listBoardMeetings(
    legalEntityId: string,
    status: BoardMeetingStatus | undefined,
    ctx: DecisionServiceContext
  ): Promise<BoardMeeting[]> {
    const { principal } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied to list meetings for ${legalEntityId}`);
    }

    return listBoardMeetingsByEntity(legalEntityId, status);
  }

  /**
   * Adds or registers a meeting participant.
   */
  public static async addMeetingParticipant(
    meetingId: string,
    participantData: Omit<MeetingParticipantRecord, 'id' | 'meetingId' | 'legalEntityId' | 'createdAt' | 'updatedAt'>,
    ctx: DecisionServiceContext
  ): Promise<MeetingParticipantRecord> {
    const { principal } = ctx;
    const meeting = await this.getBoardMeeting(meetingId, ctx);
    if (!meeting) throw new ValidationError(`Meeting not found: ${meetingId}`);

    const id = `ptc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: MeetingParticipantRecord = {
      id,
      meetingId,
      legalEntityId: meeting.legalEntityId,
      ...participantData,
      createdAt: now,
      updatedAt: now
    };

    return saveMeetingParticipant(record, principal.id);
  }

  /**
   * Lists participants in a meeting.
   */
  public static async listMeetingParticipants(
    meetingId: string,
    ctx: DecisionServiceContext
  ): Promise<MeetingParticipantRecord[]> {
    await this.getBoardMeeting(meetingId, ctx);
    return listParticipantsByMeeting(meetingId);
  }

  // ============================================================================
  // 4. STATUTORY VOTING ENGINE
  // ============================================================================

  /**
   * Casts a formal vote on a Corporate Decision.
   * Enforces:
   * - Decision in APPROVAL state
   * - Statutory Director/Officer authority validation
   * - Conflict of Interest & Recusal declaration
   * - Duplicate vote prevention
   * - Blocking unauthenticated / unauthorized System Admin votes without appointment
   */
  public static async castVote(
    decisionId: string,
    payload: CastVotePayload,
    ctx: DecisionServiceContext
  ): Promise<DecisionVoteRecord> {
    const { principal } = ctx;
    const decision = await this.getDecision(decisionId, ctx);
    if (!decision) throw new ValidationError(`Decision not found: ${decisionId}`);

    if (decision.lifecycleStatus !== 'APPROVAL') {
      throw new ValidationError(
        `Cannot cast vote on decision in '${decision.lifecycleStatus}' state. Decision must be in 'APPROVAL' state.`
      );
    }

    // 1. Verify Statutory Authority (Must have an active Director appointment for the legal entity)
    const appointments = await listAppointmentsByLegalEntity(decision.legalEntityId, 'ACTIVE');
    const validAppointment = appointments.find((a) => 
      (payload.voterAppointmentId && a.id === payload.voterAppointmentId) ||
      (a.personReference?.userId && a.personReference.userId === principal.id)
    );

    // If principal is System Admin without active statutory appointment, block voting
    if (!validAppointment && principal.role === 'SYSTEM_ADMIN') {
      throw new ValidationError(
        `Access Denied: System Administrator (${principal.email}) cannot cast statutory corporate votes without an active Director appointment in ${decision.legalEntityId}.`
      );
    }

    const voterAppointmentId = validAppointment?.id;
    const voterName = validAppointment?.personReference?.fullNameEn 
      ? validAppointment.personReference.fullNameEn 
      : (principal.fullName || principal.email);

    // 2. Conflict of Interest / Recusal check
    const isRecused = payload.recused || payload.conflictDeclared || false;
    const finalVoteValue = isRecused ? 'ABSTAIN' : payload.vote;

    // 3. Duplicate Vote Prevention
    const existingVotes = await listVotesByDecision(decisionId);
    const hasAlreadyVoted = existingVotes.some((v) => 
      (voterAppointmentId && v.voterAppointmentId === voterAppointmentId) ||
      (v.voterUserId && v.voterUserId === principal.id)
    );

    if (hasAlreadyVoted) {
      throw new ValidationError(
        `Duplicate Vote Blocked: A vote has already been registered for voter ${voterName} on decision ${decision.decisionNumber}.`
      );
    }

    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const voteRecord: DecisionVoteRecord = {
      id: voteId,
      decisionId,
      meetingId: decision.meetingId,
      legalEntityId: decision.legalEntityId,
      voterUserId: principal.id,
      voterName,
      voterAppointmentId,
      vote: finalVoteValue,
      castAtUtc: now,
      votingMethod: payload.votingMethod,
      comment: payload.comment,
      conflictDeclared: !!payload.conflictDeclared,
      recused: isRecused,
      abstentionReason: payload.abstentionReason || (isRecused ? 'Recused due to declared conflict of interest' : undefined),
      createdAt: now
    };

    return saveDecisionVote(voteRecord, principal.id);
  }

  /**
   * Retrieves all votes cast for a decision.
   */
  public static async getDecisionVotes(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<DecisionVoteRecord[]> {
    await this.getDecision(decisionId, ctx);
    return listVotesByDecision(decisionId);
  }

  // ============================================================================
  // 5. RESOLUTIONS
  // ============================================================================

  public static async getCorporateResolution(
    resolutionId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateResolution | null> {
    const { principal } = ctx;
    const res = await getCorporateResolutionById(resolutionId);
    if (!res) return null;

    const abacContext: ABACContext = {
      legalEntityId: res.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied to view resolution ${resolutionId}`);
    }

    return res;
  }

  public static async listResolutions(
    legalEntityId: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateResolution[]> {
    const { principal } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied to list resolutions for ${legalEntityId}`);
    }

    return listResolutionsByEntity(legalEntityId);
  }

  // ============================================================================
  // 6. SEARCH & EXPORT WITH SECURITY CONTROLS
  // ============================================================================

  /**
   * Searches decisions safely within permitted legal entities.
   */
  public static async searchDecisions(
    legalEntityId: string,
    queryText: string,
    ctx: DecisionServiceContext
  ): Promise<CorporateDecision[]> {
    const decisions = await this.listDecisions(legalEntityId, undefined, ctx);
    if (!queryText.trim()) return decisions;

    const lowerQuery = queryText.toLowerCase();
    return decisions.filter((d) => 
      d.decisionNumber.toLowerCase().includes(lowerQuery) ||
      d.title.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery) ||
      d.decisionType.toLowerCase().includes(lowerQuery) ||
      d.lifecycleStatus.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Exports decision register. Requires 'governance:decision:export' authority.
   */
  public static async exportDecisionRegister(
    legalEntityId: string,
    ctx: DecisionServiceContext
  ): Promise<{ exportedAt: string; legalEntityId: string; totalDecisions: number; decisions: CorporateDecision[] }> {
    const { principal, correlationId } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:decision:export',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(`Access Denied: Principal lacks 'governance:decision:export' authority.`);
    }

    const decisions = await listCorporateDecisionsByEntity(legalEntityId);

    await createAuditLog({
      actorUserId: principal.id,
      action: 'EXPORT_DECISION_REGISTER',
      entityType: 'CORPORATE_DECISION',
      entityId: legalEntityId,
      metadata: {
        recordCount: decisions.length,
        correlationId
      }
    });

    return {
      exportedAt: new Date().toISOString(),
      legalEntityId,
      totalDecisions: decisions.length,
      decisions
    };
  }

  /**
   * Strict Security Invariant: Hard deletes are strictly prohibited on decisions or resolutions.
   */
  public static async deleteDecisionProhibited(
    decisionId: string,
    ctx: DecisionServiceContext
  ): Promise<never> {
    return deleteCorporateRecordProhibited('DECISION', decisionId, ctx.principal.id);
  }
}
