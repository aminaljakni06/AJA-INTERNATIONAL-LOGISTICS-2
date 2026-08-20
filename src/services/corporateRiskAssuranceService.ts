/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Governance Risk, Control Assurance & Findings Service
 * Step GOV-11: Canonical Service Layer
 * 
 * Assurance Principle:
 * RISK → CONTROL → CONTROL ASSESSMENT → EXCEPTION → FINDING → REMEDIATION → EVIDENCE → VERIFICATION → RESIDUAL RISK → CLOSURE → AUDIT
 */

import {
  GovernanceRisk,
  GovernanceRiskCategory,
  GovernanceRiskStatus,
  GovernanceRiskSeverity,
  RiskTreatmentStrategy,
  RiskAssessmentRecord,
  ControlAssessment,
  ControlAssessmentType,
  ControlAssessmentResult,
  GovernanceException,
  GovernanceExceptionType,
  GovernanceFinding,
  FindingSourceType,
  FindingRootCauseCategory,
  FindingLifecycleState,
  RemediationAction,
  InternalControl
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';
import {
  calculateRiskSeverity,
  getGovernanceRiskById,
  listGovernanceRisksByEntity,
  saveGovernanceRisk,
  acceptGovernanceRisk,
  isRiskAcceptanceActive,
  getControlAssessmentById,
  listControlAssessmentsByControl,
  performControlAssessment,
  getGovernanceExceptionById,
  listGovernanceExceptionsByEntity,
  saveGovernanceException,
  approveGovernanceException,
  revokeGovernanceException,
  isExceptionActive,
  getGovernanceFindingById,
  listGovernanceFindingsByEntity,
  saveGovernanceFinding,
  closeGovernanceFinding,
  reopenGovernanceFinding,
  getRemediationActionById,
  listRemediationsByFinding,
  saveRemediationAction,
  escalateOverdueRemediationActions,
  deleteGovernanceAssuranceRecordProhibited
} from '../db/repositories/corporateRiskAssuranceRepository';
import { getInternalControlById } from '../db/repositories/corporateAuthorityRepository';
import { getCorporateDecisionById } from '../db/repositories/corporateGovernanceRepository';
import { getEvidenceRecordById } from '../db/repositories/corporateRecordsRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { ValidationError } from '../db/validation';

export class CorporateRiskAssuranceService {
  // ==========================================================================
  // 1. RISK REGISTER MANAGEMENT
  // ==========================================================================

  public static async registerRisk(
    risk: GovernanceRisk,
    userContext: UserContext
  ): Promise<GovernanceRisk> {
    if (userContext.legalEntityId && userContext.legalEntityId !== risk.legalEntityId && userContext.role !== 'SUPER_ADMIN') {
      throw new ValidationError(`User entity scope ${userContext.legalEntityId} does not match risk entity ${risk.legalEntityId}`);
    }

    return saveGovernanceRisk(risk, userContext.userId);
  }

  public static async getRisk(id: string, userContext?: UserContext): Promise<GovernanceRisk | null> {
    const risk = await getGovernanceRiskById(id);
    if (!risk) return null;

    if (userContext && userContext.role !== 'SUPER_ADMIN' && userContext.legalEntityId && userContext.legalEntityId !== risk.legalEntityId) {
      return null;
    }

    return risk;
  }

  public static async listRisksByEntity(legalEntityId: string, userContext?: UserContext): Promise<GovernanceRisk[]> {
    return listGovernanceRisksByEntity(legalEntityId, userContext);
  }

  public static async acceptRisk(
    riskId: string,
    params: {
      acceptedByUserId: string;
      acceptedByRole: string;
      acceptanceReason: string;
      acceptedUntil?: string;
      supportingDecisionId?: string;
      acceptanceEvidenceId?: string;
    },
    userContext: UserContext
  ): Promise<GovernanceRisk> {
    return acceptGovernanceRisk(riskId, params, userContext);
  }

  // ==========================================================================
  // 2. CONTROL ASSURANCE & TESTING
  // ==========================================================================

  public static async assessControl(
    assessment: ControlAssessment,
    userContext: UserContext
  ): Promise<{
    assessment: ControlAssessment;
    propagatedFindings: GovernanceFinding[];
    updatedRisks: GovernanceRisk[];
  }> {
    return performControlAssessment(assessment, userContext);
  }

  public static async getControlAssessment(id: string): Promise<ControlAssessment | null> {
    return getControlAssessmentById(id);
  }

  public static async listAssessmentsByControl(controlId: string): Promise<ControlAssessment[]> {
    return listControlAssessmentsByControl(controlId);
  }

  // ==========================================================================
  // 3. GOVERNANCE & POLICY EXCEPTIONS
  // ==========================================================================

  public static async requestException(
    exception: GovernanceException,
    userContext: UserContext
  ): Promise<GovernanceException> {
    return saveGovernanceException(exception, userContext.userId);
  }

  public static async getException(id: string): Promise<GovernanceException | null> {
    return getGovernanceExceptionById(id);
  }

  public static async listExceptionsByEntity(legalEntityId: string): Promise<GovernanceException[]> {
    return listGovernanceExceptionsByEntity(legalEntityId);
  }

  public static async approveException(
    exceptionId: string,
    params: {
      approvedByUserId: string;
      approvedByRole: string;
      supportingDecisionId?: string;
    },
    userContext: UserContext
  ): Promise<GovernanceException> {
    return approveGovernanceException(exceptionId, params, userContext);
  }

  public static async revokeException(
    exceptionId: string,
    params: {
      revokedByUserId: string;
      revocationReason: string;
    },
    userContext: UserContext
  ): Promise<GovernanceException> {
    return revokeGovernanceException(exceptionId, params, userContext);
  }

  public static checkExceptionActive(exception: GovernanceException): boolean {
    return isExceptionActive(exception);
  }

  // ==========================================================================
  // 4. GOVERNANCE FINDINGS & REMEDIATION ACTIONS
  // ==========================================================================

  public static async logFinding(
    finding: GovernanceFinding,
    userContext: UserContext
  ): Promise<GovernanceFinding> {
    return saveGovernanceFinding(finding, userContext.userId);
  }

  public static async getFinding(id: string): Promise<GovernanceFinding | null> {
    return getGovernanceFindingById(id);
  }

  public static async listFindingsByEntity(
    legalEntityId: string,
    userContext?: UserContext
  ): Promise<GovernanceFinding[]> {
    return listGovernanceFindingsByEntity(legalEntityId, userContext);
  }

  public static async closeFinding(
    findingId: string,
    params: {
      verifiedByUserId: string;
      verificationNotes: string;
      evidenceIds?: string[];
    },
    userContext: UserContext
  ): Promise<GovernanceFinding> {
    return closeGovernanceFinding(findingId, params, userContext);
  }

  public static async reopenFinding(
    findingId: string,
    params: {
      reopenedByUserId: string;
      reopenReason: string;
    },
    userContext: UserContext
  ): Promise<GovernanceFinding> {
    return reopenGovernanceFinding(findingId, params, userContext);
  }

  public static async createOrUpdateRemediationAction(
    action: RemediationAction,
    userContext: UserContext
  ): Promise<RemediationAction> {
    return saveRemediationAction(action, userContext.userId);
  }

  public static async getRemediationAction(id: string): Promise<RemediationAction | null> {
    return getRemediationActionById(id);
  }

  public static async listRemediationsByFinding(findingId: string): Promise<RemediationAction[]> {
    return listRemediationsByFinding(findingId);
  }

  public static async runOverdueRemediationEscalation(actorUserId?: string): Promise<{
    scannedCount: number;
    escalatedCount: number;
    escalatedActions: RemediationAction[];
  }> {
    return escalateOverdueRemediationActions(actorUserId);
  }

  // ==========================================================================
  // 5. SECURITY INVARIANTS & HARD DELETE PROHIBITION
  // ==========================================================================

  public static async deleteAssuranceRecordProhibited(
    recordType: 'RISK' | 'CONTROL_ASSESSMENT' | 'EXCEPTION' | 'FINDING' | 'REMEDIATION',
    recordId: string,
    actorUserId: string
  ): Promise<never> {
    return deleteGovernanceAssuranceRecordProhibited(recordType, recordId, actorUserId);
  }
}
