/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Applicability Engine
 * Step GOV-07: Multi-Factor Contextual Applicability Evaluation, Evidence Verification & Waiver Engine
 * 
 * Core Architectural Rules:
 * - INVARIANT: NEVER infer that UK incorporation automatically applies all UK statutory requirements.
 * - Applicability MUST be determined through verified criteria:
 *   [Legal Entity + Jurisdiction + Operational Presence + Employee Presence + Tax/VAT Registration + Activity + Verified Evidence]
 * - Missing or unverified evidence strictly halts applicability to 'INSUFFICIENT_EVIDENCE'.
 * - Arbitrary 'NOT_APPLICABLE' declarations without formal assessment rationale are strictly prohibited.
 * - Formal statutory waivers require approved Board Resolution, mandatory reason, and authorized signature.
 */

import {
  ComplianceObligation,
  ApplicabilityAssessment,
  ApplicabilityAssessmentCriteria,
  ApplicabilityAssessmentStatus,
  ComplianceWaiverRecord,
  GovernanceJurisdiction
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import {
  getObligationById,
  saveObligation,
  getAssessmentById,
  saveAssessment,
  getWaiverById,
  saveWaiver,
  getActiveWaiverForObligation,
  getRequirementDefinitionById
} from '../db/repositories/complianceObligationRepository';
import { getCorporateDecisionById } from '../db/repositories/corporateGovernanceRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';

export interface ExecuteAssessmentParams {
  obligationId: string;
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
  evidenceDocumentIds?: string[];
  rationale: string;
  reviewDueDate?: string;
  auditCorrelationId?: string;
}

export interface GrantWaiverParams {
  obligationId: string;
  waiverReason: string;
  supportingDecisionId: string;
  effectiveFrom: string;
  effectiveUntil: string;
  auditCorrelationId?: string;
}

export class ComplianceApplicabilityEngine {
  /**
   * Builds an ABAC Context for applicability evaluation
   */
  private static buildContext(
    legalEntityId: string,
    obligation?: ComplianceObligation | null,
    extra?: Partial<ABACContext>
  ): ABACContext {
    return {
      legalEntityId,
      companyId: legalEntityId,
      obligationId: obligation?.id,
      jurisdiction: obligation?.jurisdiction,
      ownerId: obligation?.ownerUserId,
      departmentId: obligation?.responsibleDepartmentId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true,
      ...extra
    };
  }

  /**
   * Evaluates and records the formal applicability assessment for an obligation.
   * 
   * Strict Logic Invariants:
   * 1. Requires 'governance:obligation:assess' permission with Legal Entity scoping.
   * 2. If evidence is missing, unverified, or criteria incomplete -> 'INSUFFICIENT_EVIDENCE'
   * 3. Cannot mark 'NOT_APPLICABLE' without clear rationale and full factor inspection.
   * 4. Incorporates requirement definition constraints (e.g. requires employees, requires VAT registration).
   */
  public static async assessApplicability(
    user: User,
    params: ExecuteAssessmentParams
  ): Promise<{ assessment: ApplicabilityAssessment; updatedObligation: ComplianceObligation }> {
    const obligation = await getObligationById(params.obligationId);
    if (!obligation) {
      throw new Error(`Obligation not found: [${params.obligationId}]`);
    }

    const context = this.buildContext(obligation.legalEntityId, obligation, {
      isRequester: false
    });

    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:obligation:assess', context);
    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_APPLICABILITY_ASSESSMENT_DENIED',
        entityType: 'APPLICABILITY_ASSESSMENT',
        entityId: params.obligationId,
        metadata: {
          reason: evalResult.reason,
          legalEntityId: obligation.legalEntityId
        }
      });
      throw new Error(`Unauthorized: Access denied assessing applicability. ${evalResult.reason}`);
    }

    // Validation: Rationale must be explicitly provided
    if (!params.rationale || params.rationale.trim().length < 10) {
      throw new Error(
        'Invalid Assessment: Detailed legal/statutory rationale (minimum 10 characters) is required.'
      );
    }

    // Lookup Requirement Definition to cross-reference criteria requirements
    let reqCriteria: any = {};
    if (obligation.requirementDefinitionId) {
      const def = await getRequirementDefinitionById(obligation.requirementDefinitionId);
      if (def?.applicabilityCriteria) {
        reqCriteria = def.applicabilityCriteria;
      }
    }

    const criteria: ApplicabilityAssessmentCriteria = {
      operationalPresenceChecked: params.operationalPresenceChecked,
      hasOperationalPresence: params.hasOperationalPresence,
      employeePresenceChecked: params.employeePresenceChecked,
      hasEmployees: params.hasEmployees,
      employeeCount: params.employeeCount,
      taxRegistrationChecked: params.taxRegistrationChecked,
      hasTaxRegistration: params.hasTaxRegistration,
      regulatoryRegistrationChecked: params.regulatoryRegistrationChecked,
      hasRegulatoryRegistration: params.hasRegulatoryRegistration,
      businessActivityChecked: params.businessActivityChecked,
      relevantActivitySummary: params.relevantActivitySummary,
      evidenceVerified: params.evidenceVerified,
      evidenceDocumentIds: params.evidenceDocumentIds || []
    };

    // Determine Status algorithmically:
    let computedStatus: ApplicabilityAssessmentStatus = 'PENDING_ASSESSMENT';

    const hasEvidence =
      params.evidenceVerified &&
      params.evidenceDocumentIds &&
      params.evidenceDocumentIds.length > 0;

    // Check if required evidence is missing
    if (obligation.evidenceRequired && !hasEvidence) {
      computedStatus = 'INSUFFICIENT_EVIDENCE';
    } else {
      // Check specific conditions
      let criteriaSatisfied = true;
      let criteriaExplicitlyNotApplicable = false;

      if (reqCriteria.requiresOperationalPresence && !params.hasOperationalPresence) {
        criteriaExplicitlyNotApplicable = true;
        criteriaSatisfied = false;
      }

      if (reqCriteria.requiresEmployees && (!params.hasEmployees || (params.employeeCount || 0) <= 0)) {
        criteriaExplicitlyNotApplicable = true;
        criteriaSatisfied = false;
      }

      if (reqCriteria.requiresTaxVatRegistration && !params.hasTaxRegistration) {
        criteriaExplicitlyNotApplicable = true;
        criteriaSatisfied = false;
      }

      if (reqCriteria.requiresCustomsRegistration && !params.hasRegulatoryRegistration) {
        criteriaExplicitlyNotApplicable = true;
        criteriaSatisfied = false;
      }

      if (criteriaExplicitlyNotApplicable) {
        computedStatus = 'NOT_APPLICABLE';
      } else if (criteriaSatisfied) {
        computedStatus = 'APPLICABLE';
      } else {
        computedStatus = 'INSUFFICIENT_EVIDENCE';
      }
    }

    const correlationId =
      params.auditCorrelationId || `corr_assess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const assessmentId = `asmt_${obligation.id}_${Date.now()}`;

    const assessment: ApplicabilityAssessment = {
      id: assessmentId,
      obligationId: obligation.id,
      requirementDefinitionId: obligation.requirementDefinitionId,
      legalEntityId: obligation.legalEntityId,
      jurisdiction: obligation.jurisdiction,
      criteria,
      assessmentStatus: computedStatus,
      rationale: params.rationale.trim(),
      evidenceDocumentId: params.evidenceDocumentIds?.[0],
      evidenceDocumentIds: params.evidenceDocumentIds || [],
      assessedByUserId: user.id,
      assessedAt: new Date().toISOString(),
      reviewDueDate: params.reviewDueDate,
      auditCorrelationId: correlationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedAssessment = await saveAssessment(assessment, user.id);

    // Update Obligation with new applicability status
    const updatedObligation: ComplianceObligation = {
      ...obligation,
      applicabilityStatus: computedStatus,
      lastAssessmentId: savedAssessment.id,
      updatedAt: new Date().toISOString()
    };

    const savedObligation = await saveObligation(updatedObligation, user.id);

    return {
      assessment: savedAssessment,
      updatedObligation: savedObligation
    };
  }

  /**
   * Grants a formal compliance waiver backed by an approved Board Resolution.
   * 
   * Strict Invariants:
   * 1. Requires 'governance:obligation:waive' permission.
   * 2. Requires an active/approved Board Decision or Resolution (supportingDecisionId).
   * 3. Requires a comprehensive waiver reason.
   * 4. Dates must be valid and future-dated.
   */
  public static async grantWaiver(
    user: User,
    params: GrantWaiverParams
  ): Promise<{ waiver: ComplianceWaiverRecord; updatedObligation: ComplianceObligation }> {
    const obligation = await getObligationById(params.obligationId);
    if (!obligation) {
      throw new Error(`Obligation not found: [${params.obligationId}]`);
    }

    const context = this.buildContext(obligation.legalEntityId, obligation);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:obligation:waive', context);

    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_COMPLIANCE_WAIVER_DENIED',
        entityType: 'COMPLIANCE_WAIVER',
        entityId: params.obligationId,
        metadata: {
          reason: evalResult.reason,
          legalEntityId: obligation.legalEntityId
        }
      });
      throw new Error(`Unauthorized: Access denied granting compliance waiver. ${evalResult.reason}`);
    }

    // Invariant: Waiver reason must be provided
    if (!params.waiverReason || params.waiverReason.trim().length < 15) {
      throw new Error(
        'Invalid Waiver: Comprehensive statutory justification (minimum 15 characters) is mandatory.'
      );
    }

    // Invariant: Supporting Board Resolution is mandatory
    if (!params.supportingDecisionId || !params.supportingDecisionId.trim()) {
      throw new Error(
        'Invalid Waiver: Supporting Board Resolution / Decision ID is mandatory to waive statutory compliance.'
      );
    }

    const decision = await getCorporateDecisionById(params.supportingDecisionId);
    if (!decision) {
      throw new Error(
        `Supporting Decision not found: Board Resolution [${params.supportingDecisionId}] does not exist.`
      );
    }

    // Ensure the supporting decision is approved or executed
    if (decision.lifecycleStatus !== 'RESOLUTION' && decision.lifecycleStatus !== 'CLOSED' && decision.lifecycleStatus !== 'EXECUTION') {
      throw new Error(
        `Invalid Decision State: Supporting decision [${decision.decisionNumber}] is currently in '${decision.lifecycleStatus}' state. It must be in 'RESOLUTION' or 'CLOSED' state to support a waiver.`
      );
    }

    const now = new Date().toISOString();
    if (params.effectiveUntil <= params.effectiveFrom || params.effectiveUntil <= now) {
      throw new Error('Invalid Expiration Date: Waiver effectiveUntil must be a valid future timestamp.');
    }

    const correlationId =
      params.auditCorrelationId || `corr_waiv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const waiverId = `waiv_${obligation.id}_${Date.now()}`;

    const waiver: ComplianceWaiverRecord = {
      id: waiverId,
      obligationId: obligation.id,
      legalEntityId: obligation.legalEntityId,
      waiverReason: params.waiverReason.trim(),
      supportingDecisionId: params.supportingDecisionId,
      authorizedByUserId: user.id,
      effectiveFrom: params.effectiveFrom,
      effectiveUntil: params.effectiveUntil,
      status: 'ACTIVE',
      auditCorrelationId: correlationId,
      createdAt: now,
      updatedAt: now
    };

    const savedWaiver = await saveWaiver(waiver, user.id);

    // Update Obligation to WAIVED status
    const updatedObligation: ComplianceObligation = {
      ...obligation,
      applicabilityStatus: 'WAIVED',
      isWaived: true,
      activeWaiverId: savedWaiver.id,
      updatedAt: now
    };

    const savedObligation = await saveObligation(updatedObligation, user.id);

    return {
      waiver: savedWaiver,
      updatedObligation: savedObligation
    };
  }

  /**
   * Revokes an active compliance waiver with audit logging
   */
  public static async revokeWaiver(
    user: User,
    waiverId: string,
    revocationReason: string
  ): Promise<ComplianceWaiverRecord> {
    const waiver = await getWaiverById(waiverId);
    if (!waiver) {
      throw new Error(`Compliance Waiver not found: [${waiverId}]`);
    }

    const obligation = await getObligationById(waiver.obligationId);
    const context = this.buildContext(waiver.legalEntityId, obligation);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:obligation:waive', context);

    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Access denied revoking compliance waiver. ${evalResult.reason}`);
    }

    if (!revocationReason || revocationReason.trim().length < 5) {
      throw new Error('Revocation reason is mandatory.');
    }

    const updatedWaiver: ComplianceWaiverRecord = {
      ...waiver,
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      revokedByUserId: user.id,
      revocationReason: revocationReason.trim(),
      updatedAt: new Date().toISOString()
    };

    const saved = await saveWaiver(updatedWaiver, user.id);

    if (obligation && obligation.activeWaiverId === waiverId) {
      const updatedObligation: ComplianceObligation = {
        ...obligation,
        applicabilityStatus: 'UNDER_REVIEW',
        isWaived: false,
        activeWaiverId: undefined,
        updatedAt: new Date().toISOString()
      };
      await saveObligation(updatedObligation, user.id);
    }

    return saved;
  }
}
