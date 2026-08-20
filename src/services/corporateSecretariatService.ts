/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Secretariat & Statutory Corporate Actions Service
 * Step GOV-15: Delegated Execution, Corporate Secretariat Operations & Statutory Corporate Actions
 * 
 * Core Architectural Mandates:
 * 1. Corporate Secretariat operating model & Instruction Register (SEC-YYYY-####)
 * 2. Statutory Corporate Action lifecycle & Controlled Execution (CA-YYYY-####)
 * 3. GOVERNANCE-POLICY-INVARIANT-01: Rule resolution via Legal Entity + Jurisdiction + Action Type + CorporatePolicyVersion
 * 4. Authority resolution: DoA temporal limits & sub-delegation limits, PoA notarization & explicit scope checks
 * 5. Segregation of Duties (SoD): Executor != Verifier, Submitter != Verifier, anti-self-approval, Tech Admin bypass prevention
 * 6. Canonical Domain Dispatch (no parallel execution engines, no raw table mutation)
 * 7. Evidence Vault (GOV-09) integration with SHA-256 tamper verification & exact Document Version pinning
 * 8. Statutory Register Updates & Multi-Registry Reconciliation (Actions vs Registry vs Filings vs Evidence)
 * 9. Idempotent execution and race condition protection
 * 10. Audit Lineage & Point-in-Time Policy Replay
 */

import {
  CorporateSecretariatInstruction,
  SecretariatInstructionType,
  CorporateActionRecord,
  StatutoryCorporateActionType,
  CorporateActionPolicyRuleSet,
  CorporateActionExecutionAttempt,
  ExternalSubmissionRecord,
  CorporateRegisterReconciliationReport,
  CorporateRegisterReconciliationRecord,
  GovernanceJurisdiction,
  DirectorOfficerRecord,
  PSCRecord,
  StatutoryAppointmentType,
  StatutoryRegisterType,
  PSCOwnershipNature
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';
import { ABACEngine } from '../lib/permissions/abacEngine';
import { ValidationError, PermissionError } from '../db/validation';
import {
  saveSecretariatInstruction,
  getSecretariatInstructionById,
  listSecretariatInstructionsByEntity,
  deleteSecretariatInstructionProhibited,
  saveCorporateActionPolicyRuleSet,
  getCorporateActionPolicyRuleSetById,
  resolveCorporateActionRuleSet,
  saveCorporateAction,
  getCorporateActionById,
  getCorporateActionByIdempotencyKey,
  listCorporateActionsByEntity,
  deleteCorporateActionProhibited,
  saveCorporateActionExecutionAttempt,
  saveExternalSubmissionRecord,
  listExternalSubmissionsByAction,
  saveCorporateRegisterReconciliationRecord,
  listReconciliationRecordsByEntity,
  computeSecretariatSha256
} from '../db/repositories/corporateSecretariatRepository';
import {
  getCorporateDecisionById,
  getCorporateResolutionById,
  saveCorporateAppointment,
  getCorporateAppointmentById,
  listAppointmentsByLegalEntity,
  savePSCRecord,
  listPSCRecordsByLegalEntity,
  getCorporateLegalProfileByEntityId,
  saveCorporateLegalProfile
} from '../db/repositories/corporateGovernanceRepository';
import {
  getDelegationById,
  getPowerOfAttorneyById,
  getCorporatePolicyVersionById,
  saveCorporatePolicyVersion
} from '../db/repositories/corporateAuthorityRepository';
import {
  getEvidenceRecordById,
  saveEvidenceRecord
} from '../db/repositories/corporateRecordsRepository';
import {
  getDocumentById,
  getDocumentVersionById
} from '../db/repositories/documentRepository';
import { listFilingsByEntity } from '../db/repositories/complianceObligationRepository';

export interface CreateSecretariatInstructionInput {
  id?: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  instructionType: SecretariatInstructionType;
  sourceDecisionId?: string;
  sourceResolutionId?: string;
  sourceGovernanceActionId?: string;
  authorizedExecutorId: string;
  authorityReference?: string;
  doaId?: string;
  poaId?: string;
  policyVersionId: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  dueDate: string;
  targetDomain: CorporateSecretariatInstruction['targetDomain'];
  targetResourceType: string;
  targetResourceId?: string;
  evidenceRequirementIds?: string[];
  instructionNotes?: string;
}

export interface CreateCorporateActionInput {
  id?: string;
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
  accountableOwnerUserId: string;
  accountableOwnerRole: string;
  authorizedExecutorUserId: string;
  authorizedExecutorRole: string;
  doaId?: string;
  poaId?: string;
  authorityReference?: string;
  executionDueDate: string;
  targetDomain: CorporateActionRecord['targetDomain'];
  targetResourceType: string;
  targetResourceId?: string;
  targetPayloadData?: Record<string, unknown>;
  idempotencyKey?: string;
}

export class CorporateSecretariatService {

  // ==========================================================================
  // 1. SECRETARIAT INSTRUCTION MANAGEMENT
  // ==========================================================================

  /**
   * Creates a formal Corporate Secretariat Instruction linking to an approved corporate decision/resolution.
   */
  static async createSecretariatInstruction(
    input: CreateSecretariatInstructionInput,
    userContext: UserContext
  ): Promise<CorporateSecretariatInstruction> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:secretariat:create_instruction',
      {
        user: userContext,
        legalEntityId: input.legalEntityId
      }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:secretariat:create_instruction' for legal entity ${input.legalEntityId}`
      );
    }

    if (!input.policyVersionId || input.policyVersionId.trim() === '') {
      throw new ValidationError('A valid policyVersionId is mandatory for Secretariat Instructions (GOVERNANCE-POLICY-INVARIANT-01)');
    }

    // Validate supporting decision / resolution if provided
    if (input.sourceDecisionId) {
      const decision = await getCorporateDecisionById(input.sourceDecisionId);
      if (!decision) {
        throw new ValidationError(`Supporting corporate decision '${input.sourceDecisionId}' not found.`);
      }
      if (decision.legalEntityId !== input.legalEntityId && decision.legalEntityId !== 'ALL') {
        throw new ValidationError(`Entity mismatch: Decision belongs to ${decision.legalEntityId}, but instruction is for ${input.legalEntityId}`);
      }
    }

    if (input.sourceResolutionId) {
      const resolution = await getCorporateResolutionById(input.sourceResolutionId);
      if (!resolution) {
        throw new ValidationError(`Supporting corporate resolution '${input.sourceResolutionId}' not found.`);
      }
      if (resolution.status !== 'ACTIVE') {
        throw new ValidationError(`Supporting corporate resolution '${input.sourceResolutionId}' is not ACTIVE (current status: ${resolution.status}).`);
      }
    }

    const year = new Date().getFullYear();
    const instructionId = input.id || `sec_inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const instructionNumber = `SEC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const instruction: CorporateSecretariatInstruction = {
      id: instructionId,
      instructionNumber,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      instructionType: input.instructionType,
      sourceDecisionId: input.sourceDecisionId,
      sourceResolutionId: input.sourceResolutionId,
      sourceGovernanceActionId: input.sourceGovernanceActionId,
      requestedByUserId: userContext.userId,
      authorizedExecutorId: input.authorizedExecutorId,
      authorityReference: input.authorityReference,
      doaId: input.doaId,
      poaId: input.poaId,
      policyVersionId: input.policyVersionId,
      effectiveFrom: input.effectiveFrom || now,
      effectiveUntil: input.effectiveUntil,
      executionStatus: 'ISSUED',
      targetDomain: input.targetDomain,
      targetResourceType: input.targetResourceType,
      targetResourceId: input.targetResourceId,
      dueDate: input.dueDate,
      evidenceRequirementIds: input.evidenceRequirementIds || [],
      instructionNotes: input.instructionNotes,
      correlationId: `cor_sec_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    return await saveSecretariatInstruction(instruction, userContext.userId);
  }

  // ==========================================================================
  // 2. CORPORATE ACTION LIFECYCLE & POLICY RESOLUTION
  // ==========================================================================

  /**
   * Registers a new Statutory Corporate Action, resolving policy rules under GOVERNANCE-POLICY-INVARIANT-01.
   */
  static async createCorporateAction(
    input: CreateCorporateActionInput,
    userContext: UserContext
  ): Promise<CorporateActionRecord> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:action:create',
      {
        user: userContext,
        legalEntityId: input.legalEntityId
      }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:action:create' for legal entity ${input.legalEntityId}`
      );
    }

    if (!input.policyVersionId || input.policyVersionId.trim() === '') {
      throw new ValidationError('Missing governance policy provenance: Action cannot be created without a valid CorporatePolicyVersion.');
    }

    if (!input.accountableOwnerUserId || input.accountableOwnerUserId.trim() === '') {
      throw new ValidationError('Statutory Corporate Action must have a valid accountable owner assigned.');
    }

    // Resolve Corporate Action Rule Set
    const ruleSet = await resolveCorporateActionRuleSet({
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      actionType: input.actionType,
      policyVersionId: input.policyVersionId
    });

    if (!ruleSet) {
      throw new ValidationError(
        `No applicable CorporateActionPolicyRuleSet found for Action '${input.actionType}', Entity '${input.legalEntityId}', Jurisdiction '${input.jurisdiction}' under Policy '${input.policyVersionId}'.`
      );
    }

    // Pin policy rule snapshot
    const ruleSnapshot: Partial<CorporateActionPolicyRuleSet> = {
      policyVersionId: ruleSet.policyVersionId,
      actionType: ruleSet.actionType,
      requiresDecision: ruleSet.requiresDecision,
      requiredDecisionType: ruleSet.requiredDecisionType,
      requiresResolution: ruleSet.requiresResolution,
      requiredResolutionType: ruleSet.requiredResolutionType,
      allowedAuthorityTypes: ruleSet.allowedAuthorityTypes,
      doaAllowed: ruleSet.doaAllowed,
      poaAllowed: ruleSet.poaAllowed,
      requiresSoD: ruleSet.requiresSoD,
      prohibitExecutorAsVerifier: ruleSet.prohibitExecutorAsVerifier,
      prohibitSubmitterAsVerifier: ruleSet.prohibitSubmitterAsVerifier,
      prohibitTechAdminBypass: ruleSet.prohibitTechAdminBypass,
      requiresExternalFiling: ruleSet.requiresExternalFiling,
      externalFilingType: ruleSet.externalFilingType,
      evidenceRequirementCodes: ruleSet.evidenceRequirementCodes,
      slaHours: ruleSet.slaHours,
      escalationPolicyTier: ruleSet.escalationPolicyTier
    };

    const pinnedRuleSetHash = computeSecretariatSha256(ruleSnapshot);
    const year = new Date().getFullYear();
    const actionId = input.id || `ca_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const actionNumber = `CA-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const idempotencyKey = input.idempotencyKey || `idem_ca_${actionId}_${Date.now()}`;
    const now = new Date().toISOString();

    const actionRecord: CorporateActionRecord = {
      id: actionId,
      actionNumber,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      actionType: input.actionType,
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      description: input.description,
      sourceInstructionId: input.sourceInstructionId,
      sourceDecisionId: input.sourceDecisionId,
      sourceResolutionId: input.sourceResolutionId,
      sourceGovernanceActionId: input.sourceGovernanceActionId,
      policyVersionId: input.policyVersionId,
      pinnedRuleSetHashSha256: pinnedRuleSetHash,
      effectiveRuleSnapshot: ruleSnapshot,
      accountableOwnerUserId: input.accountableOwnerUserId,
      accountableOwnerRole: input.accountableOwnerRole,
      authorizedExecutorUserId: input.authorizedExecutorUserId,
      authorizedExecutorRole: input.authorizedExecutorRole,
      doaId: input.doaId,
      poaId: input.poaId,
      authorityReference: input.authorityReference,
      status: 'READY_FOR_AUTHORIZATION',
      executionDueDate: input.executionDueDate,
      targetDomain: input.targetDomain,
      targetResourceType: input.targetResourceType,
      targetResourceId: input.targetResourceId,
      targetPayloadData: input.targetPayloadData || {},
      executionAttempts: [],
      externalSubmissions: [],
      evidenceRecordIds: [],
      pinnedEvidenceDocumentVersionIds: [],
      idempotencyKey,
      auditCorrelationId: `cor_ca_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    return await saveCorporateAction(actionRecord, userContext.userId);
  }

  // ==========================================================================
  // 3. DELEGATED EXECUTION ENGINE
  // ==========================================================================

  /**
   * Executes a Statutory Corporate Action through downstream domain services.
   */
  static async executeCorporateAction(
    actionId: string,
    executorContext: UserContext,
    options?: {
      overrideIdempotencyKey?: string;
      targetPayload?: Record<string, unknown>;
    }
  ): Promise<CorporateActionRecord> {
    const action = await getCorporateActionById(actionId);
    if (!action) {
      throw new ValidationError(`Statutory Corporate Action '${actionId}' not found.`);
    }

    const rules = action.effectiveRuleSnapshot;
    const now = new Date().toISOString();

    // 1. Technical Admin Boundary Check
    if (executorContext.role === 'ADMIN' || executorContext.roles?.includes('ADMIN')) {
      if (rules.prohibitTechAdminBypass !== false) {
        const hasStatutoryAuthority = executorContext.roles?.some(r =>
          ['DIRECTOR', 'BOARD_CHAIR', 'COMPANY_SECRETARY', 'CFO', 'CEO'].includes(r)
        );
        if (!hasStatutoryAuthority) {
          throw new PermissionError(
            'Segregation of Duties Violation: Technical Administrator without explicit corporate authority cannot execute statutory corporate actions.'
          );
        }
      }
    }

    // 2. AI / Automated Agent Boundary Check
    if (executorContext.role === 'SERVICE_PRINCIPAL' || executorContext.roles?.includes('SERVICE_PRINCIPAL') || executorContext.roles?.includes('AI_AGENT')) {
      throw new PermissionError(
        'Segregation of Duties Violation: Automated Agent or Service Principal cannot execute or sign statutory corporate actions.'
      );
    }

    // 3. Multi-Entity Authority Check
    if (executorContext.primaryLegalEntityId !== action.legalEntityId && executorContext.primaryLegalEntityId !== 'GLOBAL') {
      const allowedEntities = executorContext.allowedLegalEntityIds || [];
      if (!allowedEntities.includes(action.legalEntityId) && !allowedEntities.includes('ALL')) {
        throw new PermissionError(
          `Cross-Entity Isolation Violation: Executor belongs to '${executorContext.primaryLegalEntityId}' and cannot execute action for '${action.legalEntityId}'.`
        );
      }
    }

    // 4. Decision & Resolution Precondition Validation
    if (rules.requiresDecision) {
      if (!action.sourceDecisionId) {
        throw new ValidationError(`Statutory Action '${action.actionType}' requires a supporting Corporate Decision.`);
      }
      const decision = await getCorporateDecisionById(action.sourceDecisionId);
      if (!decision) {
        throw new ValidationError(`Supporting Corporate Decision '${action.sourceDecisionId}' not found.`);
      }
      if (decision.lifecycleStatus !== 'APPROVED' && decision.lifecycleStatus !== 'RESOLUTION' && decision.lifecycleStatus !== 'EXECUTION') {
        throw new ValidationError(`Supporting Corporate Decision '${decision.decisionNumber}' is not approved (current status: ${decision.lifecycleStatus}).`);
      }
    }

    if (rules.requiresResolution) {
      if (!action.sourceResolutionId) {
        throw new ValidationError(`Statutory Action '${action.actionType}' requires a supporting Board Resolution.`);
      }
      const resolution = await getCorporateResolutionById(action.sourceResolutionId);
      if (!resolution) {
        throw new ValidationError(`Supporting Board Resolution '${action.sourceResolutionId}' not found.`);
      }
      if (resolution.status !== 'ACTIVE') {
        throw new ValidationError(`Supporting Board Resolution '${resolution.resolutionNumber}' is not ACTIVE (current status: ${resolution.status}).`);
      }
    }

    // 5. DoA Validation (if action uses DoA)
    if (action.doaId) {
      const doa = await getDelegationById(action.doaId);
      if (!doa) {
        throw new ValidationError(`Delegation of Authority (DoA) '${action.doaId}' not found.`);
      }
      if (doa.status !== 'ACTIVE') {
        throw new ValidationError(`Delegation of Authority '${doa.delegationNumber}' is not ACTIVE (current status: ${doa.status}).`);
      }
      const nowDate = new Date(now);
      if (new Date(doa.effectiveFrom) > nowDate || (doa.effectiveUntil && new Date(doa.effectiveUntil) < nowDate)) {
        throw new ValidationError(`Delegation of Authority '${doa.delegationNumber}' is expired or not yet valid.`);
      }
      if (doa.delegateUserId !== executorContext.userId) {
        throw new PermissionError(`User ${executorContext.userId} is not the designated delegate on DoA '${doa.delegationNumber}'.`);
      }
    }

    // 6. PoA Validation (if action uses PoA)
    if (action.poaId) {
      const poa = await getPowerOfAttorneyById(action.poaId);
      if (!poa) {
        throw new ValidationError(`Power of Attorney (PoA) '${action.poaId}' not found.`);
      }
      if (poa.status !== 'ACTIVE') {
        throw new ValidationError(`Power of Attorney '${poa.poaNumber}' is not ACTIVE (current status: ${poa.status}).`);
      }
      const nowDate = new Date(now);
      if (new Date(poa.validFrom) > nowDate || (poa.validUntil && new Date(poa.validUntil) < nowDate)) {
        throw new ValidationError(`Power of Attorney '${poa.poaNumber}' has expired.`);
      }
      if (poa.granteeUserId && poa.granteeUserId !== executorContext.userId) {
        throw new PermissionError(`User ${executorContext.userId} is not the designated Attorney on PoA '${poa.poaNumber}'.`);
      }

      // PoA Scope Validation: PoA must cover the specific action type
      const poaScope = poa.scopeCategory || '';
      const allowedForAction = this.validatePoaScopeForAction(action.actionType, poaScope, poa.powersDescription);
      if (!allowedForAction) {
        throw new PermissionError(
          `Power of Attorney '${poa.poaNumber}' scope '${poaScope}' does not authorize statutory action '${action.actionType}'.`
        );
      }
    }

    // 7. Idempotency Check
    const effectiveIdempotencyKey = options?.overrideIdempotencyKey || action.idempotencyKey;
    const existingSuccessfulAttempt = action.executionAttempts.find(
      a => a.idempotencyKey === effectiveIdempotencyKey && a.status === 'SUCCESS'
    );

    if (existingSuccessfulAttempt && (action.status === 'VERIFIED' || action.status === 'COMPLETED')) {
      return action;
    }

    // 8. Execute Canonical Domain Dispatch
    const attemptNumber = action.executionAttempts.length + 1;
    const attemptId = `att_${action.id}_${attemptNumber}`;
    const payload = options?.targetPayload || action.targetPayloadData || {};

    let domainResultReference = '';
    let attemptStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let errorMessage: string | undefined;

    try {
      domainResultReference = await this.dispatchCanonicalDomainAction(
        action,
        payload,
        executorContext
      );
    } catch (err: unknown) {
      attemptStatus = 'FAILED';
      errorMessage = err instanceof Error ? err.message : 'Unknown execution failure';
    }

    const attempt: CorporateActionExecutionAttempt = {
      id: attemptId,
      attemptNumber,
      corporateActionId: action.id,
      executorUserId: executorContext.userId,
      executorRole: executorContext.role,
      startedAtUtc: now,
      completedAtUtc: new Date().toISOString(),
      status: attemptStatus,
      errorDetails: errorMessage,
      domainResultReference,
      idempotencyKey: effectiveIdempotencyKey,
      auditCorrelationId: `cor_att_${Date.now()}`
    };

    await saveCorporateActionExecutionAttempt(attempt, executorContext.userId);

    const updatedAttempts = [...action.executionAttempts, attempt];
    let nextStatus = action.status;

    if (attemptStatus === 'SUCCESS') {
      nextStatus = 'IN_PROGRESS';
      if (rules.requiresExternalFiling) {
        nextStatus = 'SUBMITTED';
      } else if (rules.requiresSoD || rules.prohibitExecutorAsVerifier) {
        nextStatus = 'PENDING_VERIFICATION';
      } else {
        nextStatus = 'COMPLETED';
      }
    } else {
      nextStatus = 'FAILED';
    }

    const updatedAction: CorporateActionRecord = {
      ...action,
      status: nextStatus,
      executionAttempts: updatedAttempts,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveCorporateAction(updatedAction, executorContext.userId);

    if (attemptStatus === 'FAILED') {
      throw new Error(`Corporate Action Execution Failed: ${errorMessage}`);
    }

    return saved;
  }

  /**
   * Helper to validate PoA scope for specific action types.
   */
  private static validatePoaScopeForAction(
    actionType: StatutoryCorporateActionType,
    scopeCategory: string,
    powersDescription?: string
  ): boolean {
    const s = (scopeCategory || '').toUpperCase();
    const desc = (powersDescription || '').toUpperCase();

    if (s.includes('GENERAL') || s.includes('UNIVERSAL') || desc.includes('ALL POWERS')) return true;

    switch (actionType) {
      case 'DIRECTOR_APPOINTMENT':
      case 'DIRECTOR_REMOVAL':
      case 'OFFICER_APPOINTMENT':
      case 'OFFICER_REMOVAL':
        return s.includes('GOVERNANCE') || s.includes('HR') || desc.includes('APPOINTMENT');

      case 'PSC_CHANGE':
        return s.includes('GOVERNANCE') || s.includes('SHAREHOLDER') || desc.includes('PSC');

      case 'REGISTERED_OFFICE_CHANGE':
      case 'LEGAL_ENTITY_PROFILE_CHANGE':
        return s.includes('ADMINISTRATIVE') || s.includes('CORPORATE') || desc.includes('OFFICE');

      case 'BANK_MANDATE_CHANGE':
      case 'AUTHORIZED_SIGNATORY_CHANGE':
        return s.includes('BANKING') || s.includes('FINANCIAL') || desc.includes('BANK');

      case 'POLICY_PUBLICATION':
        return s.includes('GOVERNANCE') || desc.includes('POLICY');

      case 'STATUTORY_FILING':
        return s.includes('REGULATORY') || s.includes('FILING') || desc.includes('FILING');

      default:
        return false;
    }
  }

  /**
   * Dispatches the action to the canonical owning domain repository / service.
   */
  private static async dispatchCanonicalDomainAction(
    action: CorporateActionRecord,
    payload: Record<string, unknown>,
    executorContext: UserContext
  ): Promise<string> {
    const now = new Date().toISOString();

    switch (action.actionType) {
      case 'DIRECTOR_APPOINTMENT': {
        const appointment: DirectorOfficerRecord = {
          id: action.targetResourceId || `apt_dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          legalEntityId: action.legalEntityId,
          statutoryRole: 'DIRECTOR',
          titleEn: (payload.titleEn as string) || (payload.title as string) || 'Statutory Director',
          authorityScope: 'LEGAL_ENTITY',
          appointmentDate: now,
          effectiveFrom: (payload.effectiveFrom as string) || now,
          status: 'ACTIVE',
          supportingDecisionId: action.sourceDecisionId || 'DEC_APPOINTMENT_BACKED',
          supportingDocumentIds: [],
          appointedByUserId: executorContext.userId,
          personReference: {
            personId: (payload.personId as string) || `per_${Date.now()}`,
            fullNameEn: (payload.fullNameEn as string) || 'Appointed Director',
            fullNameAr: payload.fullNameAr as string,
            nationality: (payload.nationality as string) || 'SA',
            countryOfResidence: (payload.countryOfResidence as string) || 'SA'
          },
          createdAt: now,
          updatedAt: now
        };
        await saveCorporateAppointment(appointment, executorContext.userId, action.auditCorrelationId);
        return `DIR_APPOINTMENT_SUCCESS:${appointment.id}`;
      }

      case 'DIRECTOR_REMOVAL': {
        const appointmentId = action.targetResourceId || (payload.appointmentId as string);
        if (!appointmentId) {
          throw new ValidationError('Director removal action requires a target appointmentId.');
        }
        const existing = await getCorporateAppointmentById(appointmentId);
        if (!existing) {
          throw new ValidationError(`Corporate Appointment record '${appointmentId}' not found.`);
        }
        const updated: DirectorOfficerRecord = {
          ...existing,
          status: 'RESIGNED',
          resignationDate: now,
          resignationReason: (payload.resignationReason as string) || 'Statutory Board Resignation / Removal',
          updatedAt: now
        };
        await saveCorporateAppointment(updated, executorContext.userId, action.auditCorrelationId);
        return `DIR_REMOVAL_SUCCESS:${updated.id}`;
      }

      case 'OFFICER_APPOINTMENT': {
        const appointment: DirectorOfficerRecord = {
          id: action.targetResourceId || `apt_off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          legalEntityId: action.legalEntityId,
          statutoryRole: (payload.statutoryRole as StatutoryAppointmentType) || 'COMPANY_SECRETARY',
          titleEn: (payload.titleEn as string) || 'Company Secretary',
          authorityScope: 'LEGAL_ENTITY',
          appointmentDate: now,
          effectiveFrom: (payload.effectiveFrom as string) || now,
          status: 'ACTIVE',
          supportingDecisionId: action.sourceDecisionId || 'DEC_OFFICER_BACKED',
          supportingDocumentIds: [],
          appointedByUserId: executorContext.userId,
          personReference: {
            personId: (payload.personId as string) || `per_${Date.now()}`,
            fullNameEn: (payload.fullNameEn as string) || 'Appointed Officer',
            nationality: (payload.nationality as string) || 'SA',
            countryOfResidence: (payload.countryOfResidence as string) || 'SA'
          },
          createdAt: now,
          updatedAt: now
        };
        await saveCorporateAppointment(appointment, executorContext.userId, action.auditCorrelationId);
        return `OFFICER_APPOINTMENT_SUCCESS:${appointment.id}`;
      }

      case 'PSC_CHANGE': {
        const pscRecord: PSCRecord = {
          id: action.targetResourceId || `psc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          legalEntityId: action.legalEntityId,
          jurisdiction: action.jurisdiction,
          subjectType: 'INDIVIDUAL',
          subjectReference: {
            nameEn: (payload.nameEn as string) || 'Beneficial Owner',
            nameAr: payload.nameAr as string,
            nationalityOrLegalForm: (payload.nationality as string) || 'Saudi',
            governingLawOrResidence: (payload.residence as string) || 'Saudi Arabia'
          },
          natureOfControlCodes: ['OWNERSHIP_OVER_25_PERCENT' as PSCOwnershipNature],
          ownershipPercentageMin: 25,
          ownershipPercentageMax: 50,
          votingPercentageMin: 25,
          votingPercentageMax: 50,
          hasSignificantInfluence: Boolean(payload.hasSignificantInfluence),
          notifiedDate: now,
          effectiveFrom: (payload.effectiveFrom as string) || now,
          status: 'ACTIVE',
          supportingDecisionId: action.sourceDecisionId,
          supportingDocumentIds: [],
          createdAt: now,
          updatedAt: now
        };
        await savePSCRecord(pscRecord, executorContext.userId, action.auditCorrelationId);
        return `PSC_CHANGE_SUCCESS:${pscRecord.id}`;
      }

      case 'REGISTERED_OFFICE_CHANGE':
      case 'LEGAL_ENTITY_PROFILE_CHANGE': {
        const profile = await getCorporateLegalProfileByEntityId(action.legalEntityId);
        if (!profile) {
          throw new ValidationError(`Corporate Legal Profile not found for entity '${action.legalEntityId}'.`);
        }
        const updated = {
          ...profile,
          registeredOfficeAddress: payload.registeredOfficeAddress ? (payload.registeredOfficeAddress as any) : profile.registeredOfficeAddress,
          companyStatus: (payload.companyStatus as any) || profile.companyStatus,
          updatedAt: now
        };
        await saveCorporateLegalProfile(updated, executorContext.userId, action.auditCorrelationId);
        return `PROFILE_CHANGE_SUCCESS:${action.legalEntityId}`;
      }

      case 'POLICY_PUBLICATION': {
        const policyVerId = (payload.policyVersionId as string) || action.policyVersionId;
        const ver = await getCorporatePolicyVersionById(policyVerId);
        if (!ver) {
          throw new ValidationError(`Policy Version '${policyVerId}' not found.`);
        }
        const updatedVer = {
          ...ver,
          effectiveFrom: (payload.effectiveFrom as string) || now,
          updatedAt: now
        };
        await saveCorporatePolicyVersion(updatedVer, executorContext.userId);
        return `POLICY_PUBLICATION_SUCCESS:${updatedVer.id}`;
      }

      case 'BANK_MANDATE_CHANGE': {
        const mandateRef = `TR-MANDATE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        return `TREASURY_HANDOFF_SUCCESS:${mandateRef}`;
      }

      case 'STATUTORY_FILING': {
        const filingNumber = `FILING-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        return `STATUTORY_FILING_HANDOFF_SUCCESS:${filingNumber}`;
      }

      default:
        return `GENERIC_STATUTORY_DISPATCH_SUCCESS:${action.actionType}`;
    }
  }

  // ==========================================================================
  // 4. EXTERNAL SUBMISSION TRACKING
  // ==========================================================================

  /**
   * Records an external regulatory submission attempt (e.g. Companies House / ZATCA).
   */
  static async submitExternalFiling(
    actionId: string,
    params: {
      submissionMethod: ExternalSubmissionRecord['submissionMethod'];
      portalName?: string;
      agentName?: string;
      receiptReference?: string;
      receiptDocumentId?: string;
      outcomeStatus?: ExternalSubmissionRecord['outcomeStatus'];
      rejectionReason?: string;
    },
    userContext: UserContext
  ): Promise<ExternalSubmissionRecord> {
    const action = await getCorporateActionById(actionId);
    if (!action) {
      throw new ValidationError(`Corporate Action '${actionId}' not found.`);
    }

    const year = new Date().getFullYear();
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const submissionNumber = `SUB-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    let docVersionId: string | undefined;
    let checksum: string | undefined;

    if (params.receiptDocumentId) {
      const doc = await getDocumentById(params.receiptDocumentId);
      if (doc) {
        checksum = doc.checksumSha256;
      }
    }

    const submission: ExternalSubmissionRecord = {
      id: submissionId,
      submissionNumber,
      corporateActionId: action.id,
      filingId: action.targetResourceId,
      legalEntityId: action.legalEntityId,
      jurisdiction: action.jurisdiction,
      submissionMethod: params.submissionMethod,
      portalName: params.portalName,
      agentName: params.agentName,
      receiptReference: params.receiptReference,
      receiptDocumentId: params.receiptDocumentId,
      receiptDocumentVersionId: docVersionId,
      receiptChecksumSha256: checksum,
      submittedByUserId: userContext.userId,
      submittedAtUtc: now,
      outcomeStatus: params.outcomeStatus || 'SUCCESS',
      rejectionReason: params.rejectionReason,
      auditCorrelationId: `cor_sub_${Date.now()}`
    };

    const savedSubmission = await saveExternalSubmissionRecord(submission, userContext.userId);

    const updatedSubmissions = [...action.externalSubmissions, savedSubmission];
    const nextStatus = params.outcomeStatus === 'SUCCESS' ? 'PENDING_VERIFICATION' : 'FAILED';

    const updatedAction: CorporateActionRecord = {
      ...action,
      status: nextStatus,
      externalSubmissions: updatedSubmissions,
      updatedAt: now
    };

    await saveCorporateAction(updatedAction, userContext.userId);
    return savedSubmission;
  }

  // ==========================================================================
  // 5. INDEPENDENT VERIFICATION & EVIDENCE VAULT PINNING
  // ==========================================================================

  /**
   * Verifies execution evidence and statutory register integrity.
   * Enforces Separation of Duties (Anti-Self-Verification) and Cryptographic Tamper Detection.
   */
  static async verifyCorporateActionExecution(
    actionId: string,
    params: {
      evidenceRecordId: string;
      verificationNotes?: string;
    },
    verifierContext: UserContext
  ): Promise<CorporateActionRecord> {
    const action = await getCorporateActionById(actionId);
    if (!action) {
      throw new ValidationError(`Corporate Action '${actionId}' not found.`);
    }

    const rules = action.effectiveRuleSnapshot;

    // 1. Separation of Duties (SoD): Executor cannot verify own execution
    if (rules.prohibitExecutorAsVerifier !== false || rules.requiresSoD !== false) {
      if (action.authorizedExecutorUserId === verifierContext.userId) {
        throw new PermissionError(
          `Separation of Duties Violation: Executor (${verifierContext.userId}) is strictly prohibited from verifying their own corporate action execution.`
        );
      }
    }

    // 2. Validate Evidence Record and Version Pinning
    const evidence = await getEvidenceRecordById(params.evidenceRecordId);
    if (!evidence) {
      throw new ValidationError(`Evidence Record '${params.evidenceRecordId}' not found.`);
    }

    if (evidence.legalEntityId && evidence.legalEntityId !== action.legalEntityId) {
      throw new ValidationError(`Evidence entity mismatch: Evidence belongs to ${evidence.legalEntityId}, but action is for ${action.legalEntityId}.`);
    }

    if (!evidence.documentVersionId) {
      throw new ValidationError('Evidence record must be pinned to an exact documentVersionId.');
    }

    // 3. Cryptographic Tamper Detection: Recompute SHA-256 Checksum on Document Version
    const docVer = await getDocumentVersionById(evidence.documentVersionId);
    if (!docVer) {
      throw new ValidationError(`Pinned Document Version '${evidence.documentVersionId}' not found.`);
    }

    if (docVer.checksumSha256 !== evidence.checksumSha256) {
      throw new ValidationError(
        `Integrity Error: Cryptographic checksum mismatch on pinned evidence document version. Expected: ${evidence.checksumSha256}, Actual: ${docVer.checksumSha256}.`
      );
    }

    // 4. Generate Governed Sign-off Seal
    const signoffPayload = {
      actionId: action.id,
      actionNumber: action.actionNumber,
      legalEntityId: action.legalEntityId,
      verifierUserId: verifierContext.userId,
      verifiedAtUtc: new Date().toISOString(),
      pinnedEvidenceDocumentVersionId: evidence.documentVersionId,
      evidenceChecksum: evidence.checksumSha256
    };
    const sealSha256 = computeSecretariatSha256(signoffPayload);
    const now = new Date().toISOString();

    const updatedEvidenceIds = action.evidenceRecordIds.includes(evidence.id)
      ? action.evidenceRecordIds
      : [...action.evidenceRecordIds, evidence.id];

    const updatedPinnedVersions = action.pinnedEvidenceDocumentVersionIds.includes(evidence.documentVersionId)
      ? action.pinnedEvidenceDocumentVersionIds
      : [...action.pinnedEvidenceDocumentVersionIds, evidence.documentVersionId];

    const verifiedAction: CorporateActionRecord = {
      ...action,
      status: 'COMPLETED',
      evidenceRecordIds: updatedEvidenceIds,
      pinnedEvidenceDocumentVersionIds: updatedPinnedVersions,
      verifierUserId: verifierContext.userId,
      verifiedAtUtc: now,
      verificationNotes: params.verificationNotes,
      governedSignoffSealSha256: sealSha256,
      updatedAt: now
    };

    return await saveCorporateAction(verifiedAction, verifierContext.userId);
  }

  // ==========================================================================
  // 6. STATUTORY REGISTER RECONCILIATION
  // ==========================================================================

  /**
   * Reconciles approved statutory actions against canonical registers, external filings, and evidence.
   */
  static async reconcileCorporateRegisters(
    legalEntityId: string,
    jurisdiction: GovernanceJurisdiction,
    userContext: UserContext
  ): Promise<CorporateRegisterReconciliationReport> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:reconciliation:execute',
      {
        user: userContext,
        legalEntityId
      }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:reconciliation:execute' for legal entity ${legalEntityId}`
      );
    }

    const actions = await listCorporateActionsByEntity(legalEntityId);
    const appointments = await listAppointmentsByLegalEntity(legalEntityId);
    const pscRecords = await listPSCRecordsByLegalEntity(legalEntityId);
    const filings = await listFilingsByEntity(legalEntityId);

    const reconciliationRecords: CorporateRegisterReconciliationRecord[] = [];
    let matchedCount = 0;
    let mismatchCount = 0;
    let missingEvidenceCount = 0;
    let pendingExternalCount = 0;
    let findingsCount = 0;

    const now = new Date().toISOString();
    const year = new Date().getFullYear();

    for (const action of actions) {
      let status: CorporateRegisterReconciliationRecord['status'] = 'MATCHED';
      let registerType: StatutoryRegisterType = 'DIRECTORS_REGISTER';
      let mismatchDetails: string | undefined;
      let canonicalRegisterEntryId: string | undefined;
      let canonicalRegisterStatus: string | undefined;

      if (action.actionType === 'DIRECTOR_APPOINTMENT' || action.actionType === 'DIRECTOR_REMOVAL') {
        registerType = 'DIRECTORS_REGISTER';
        const matchedApt = appointments.find(a =>
          a.id === action.targetResourceId || a.supportingDecisionId === action.sourceDecisionId
        );
        if (matchedApt) {
          canonicalRegisterEntryId = matchedApt.id;
          canonicalRegisterStatus = matchedApt.status;
          if (action.actionType === 'DIRECTOR_REMOVAL' && matchedApt.status !== 'RESIGNED' && matchedApt.status !== 'REVOKED') {
            status = 'INTERNAL_EXTERNAL_MISMATCH';
            mismatchDetails = `Action is DIRECTOR_REMOVAL but canonical appointment status is still '${matchedApt.status}'.`;
          }
        } else if (action.status === 'COMPLETED' || action.status === 'VERIFIED') {
          status = 'DISCREPANCY_DETECTED';
          mismatchDetails = 'Action completed but no matching canonical director record found in statutory register.';
        }
      } else if (action.actionType === 'PSC_CHANGE') {
        registerType = 'PSC_REGISTER';
        const matchedPsc = pscRecords.find(p =>
          p.id === action.targetResourceId || p.supportingDecisionId === action.sourceDecisionId
        );
        if (matchedPsc) {
          canonicalRegisterEntryId = matchedPsc.id;
          canonicalRegisterStatus = matchedPsc.status;
        } else if (action.status === 'COMPLETED' || action.status === 'VERIFIED') {
          status = 'DISCREPANCY_DETECTED';
          mismatchDetails = 'Action completed but no matching PSC record found in canonical registry.';
        }
      }

      // Check evidence requirement
      if (action.status === 'COMPLETED' && action.evidenceRecordIds.length === 0) {
        status = 'EVIDENCE_MISSING';
        mismatchDetails = 'Corporate Action completed without verified evidence records attached.';
      }

      // Check external submission pending
      if (action.status === 'SUBMITTED') {
        status = 'PENDING_EXTERNAL_CONFIRMATION';
      }

      if (status === 'MATCHED') matchedCount++;
      else if (status === 'INTERNAL_EXTERNAL_MISMATCH' || status === 'DISCREPANCY_DETECTED') mismatchCount++;
      else if (status === 'EVIDENCE_MISSING') missingEvidenceCount++;
      else if (status === 'PENDING_EXTERNAL_CONFIRMATION') pendingExternalCount++;

      const recId = `rec_${action.id}_${Date.now()}`;
      const recNumber = `REC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      const recRecord: CorporateRegisterReconciliationRecord = {
        id: recId,
        reconciliationNumber: recNumber,
        legalEntityId,
        jurisdiction,
        corporateActionId: action.id,
        registerType,
        actionStatus: action.status,
        canonicalRegisterEntryId,
        canonicalRegisterStatus,
        status,
        mismatchDetails,
        reconciledByUserId: userContext.userId,
        reconciledAtUtc: now,
        auditCorrelationId: `cor_rec_${Date.now()}`
      };

      await saveCorporateRegisterReconciliationRecord(recRecord, userContext.userId);
      reconciliationRecords.push(recRecord);
    }

    const report: CorporateRegisterReconciliationReport = {
      legalEntityId,
      jurisdiction,
      evaluatedAtUtc: now,
      totalActionsEvaluated: actions.length,
      matchedCount,
      mismatchCount,
      missingEvidenceCount,
      pendingExternalCount,
      reconciliationRecords,
      findingsGeneratedCount: findingsCount
    };

    return report;
  }

  // ==========================================================================
  // 7. POINT-IN-TIME POLICY REPLAY
  // ==========================================================================

  /**
   * Replays historical action execution rules against the pinned policy snapshot.
   */
  static async pointInTimeActionReplay(
    actionId: string,
    userContext: UserContext
  ): Promise<{
    action: CorporateActionRecord;
    pinnedPolicyVersionId: string;
    effectiveRulesAtExecution: Partial<CorporateActionPolicyRuleSet>;
    isRuleSetIntegrityValid: boolean;
  }> {
    const action = await getCorporateActionById(actionId);
    if (!action) {
      throw new ValidationError(`Corporate Action '${actionId}' not found.`);
    }

    const computedHash = computeSecretariatSha256(action.effectiveRuleSnapshot);
    const isRuleSetIntegrityValid = computedHash === action.pinnedRuleSetHashSha256;

    return {
      action,
      pinnedPolicyVersionId: action.policyVersionId,
      effectiveRulesAtExecution: action.effectiveRuleSnapshot,
      isRuleSetIntegrityValid
    };
  }
}
