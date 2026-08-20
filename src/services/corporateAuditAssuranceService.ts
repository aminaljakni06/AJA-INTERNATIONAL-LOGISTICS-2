/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Audit & Assurance Planning Service
 * Step GOV-12: High-Level Orchestration, Internal Audit Lifecycle, Control Testing & 3LoD Assurance Engine
 */

import {
  AuditUniverseEntity,
  AuditUniverseCategory,
  AnnualAuditPlan,
  AuditPlanStatus,
  PlannedEngagementItem,
  AuditEngagement,
  AuditEngagementType,
  AuditEngagementStage,
  AuditOpinionType,
  AuditWorkProgram,
  AuditWorkpaper,
  ControlTestWorksheet,
  ControlTestType,
  ControlTestingMethod,
  ControlTestFrequency,
  ControlTestSampleItem,
  ManagementActionPlan,
  RootCauseMethodology,
  AuditCommitteePack,
  GovernanceRiskSeverity
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';
import {
  getAuditUniverseEntityById,
  listAuditUniverseByEntity,
  saveAuditUniverseEntity,
  generateNextAuditUniverseCode,
  deleteAuditUniverseEntityProhibited,
  getAnnualAuditPlanById,
  listAnnualAuditPlansByEntity,
  saveAnnualAuditPlan,
  approveAnnualAuditPlan,
  deleteAuditPlanProhibited,
  getAuditEngagementById,
  listAuditEngagementsByEntity,
  saveAuditEngagement,
  issueFinalAuditReport,
  deleteAuditEngagementProhibited,
  checkAuditorIndependence,
  registerAuditorOperationalHistory,
  getAuditWorkpaperById,
  listAuditWorkpapersByEngagement,
  saveAuditWorkpaper,
  deleteAuditWorkpaperProhibited,
  getControlTestWorksheetById,
  listControlTestWorksheetsByControl,
  executeControlTestWorksheet,
  calculateControlSampleSize,
  deleteControlTestWorksheetProhibited,
  getManagementActionPlanById,
  listManagementActionsByFinding,
  createManagementActionPlan,
  reviseManagementActionTargetDate,
  verifyAndCloseManagementAction,
  detectOverdueManagementActions,
  deleteManagementActionPlanProhibited,
  getAuditCommitteePackById,
  generateAuditCommitteePack,
  publishAndLockAuditCommitteePack,
  computeSha256
} from '../db/repositories/corporateAuditAssuranceRepository';

export class CorporateAuditAssuranceService {
  // ============================================================================
  // 1. AUDIT UNIVERSE & ENTITY PLANNING
  // ============================================================================

  public async registerAuditableEntity(
    params: {
      id?: string;
      legalEntityId: string;
      departmentId?: string;
      nameEn: string;
      nameAr?: string;
      entityCategory: AuditUniverseCategory;
      riskRating: GovernanceRiskSeverity;
      auditCycleMonths?: number;
      associatedRiskIds?: string[];
      associatedControlIds?: string[];
    },
    context: UserContext
  ): Promise<AuditUniverseEntity> {
    const id = params.id || `aue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entityCode = await generateNextAuditUniverseCode(params.legalEntityId, params.entityCategory);

    const universeEntity: AuditUniverseEntity = {
      id,
      entityCode,
      legalEntityId: params.legalEntityId,
      departmentId: params.departmentId,
      nameEn: params.nameEn,
      nameAr: params.nameAr,
      entityCategory: params.entityCategory,
      riskRating: params.riskRating,
      auditCycleMonths: params.auditCycleMonths || (
        params.riskRating === 'CRITICAL' ? 12 :
        params.riskRating === 'HIGH' ? 24 :
        params.riskRating === 'MEDIUM' ? 36 : 48
      ),
      nextAuditDueDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      inScope: true,
      associatedRiskIds: params.associatedRiskIds || [],
      associatedControlIds: params.associatedControlIds || [],
      status: 'ACTIVE',
      auditCorrelationId: `cor_aue_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await saveAuditUniverseEntity(universeEntity, context.userId);
  }

  public async getAuditableEntity(entityId: string): Promise<AuditUniverseEntity | null> {
    return await getAuditUniverseEntityById(entityId);
  }

  public async listAuditUniverse(legalEntityId: string, category?: AuditUniverseCategory): Promise<AuditUniverseEntity[]> {
    return await listAuditUniverseByEntity(legalEntityId, category);
  }

  // ============================================================================
  // 2. ANNUAL & MULTI-YEAR AUDIT PLANS
  // ============================================================================

  public async createAnnualAuditPlan(
    params: {
      id?: string;
      planNumber?: string;
      planYear: number;
      legalEntityId: string;
      titleEn: string;
      titleAr?: string;
      budgetedHoursTotal: number;
      plannedEngagements?: PlannedEngagementItem[];
    },
    context: UserContext
  ): Promise<AnnualAuditPlan> {
    const id = params.id || `pln_${params.planYear}_${Date.now()}`;
    const planNumber = params.planNumber || `PLN-${params.planYear}-${Date.now().toString().slice(-4)}`;

    const plan: AnnualAuditPlan = {
      id,
      planNumber,
      planYear: params.planYear,
      legalEntityId: params.legalEntityId,
      titleEn: params.titleEn,
      titleAr: params.titleAr,
      status: 'PROPOSED',
      budgetedHoursTotal: params.budgetedHoursTotal,
      allocatedHoursTotal: 0,
      plannedEngagements: params.plannedEngagements || [],
      engagementIds: [],
      amendmentHistory: [],
      auditCorrelationId: `cor_pln_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await saveAnnualAuditPlan(plan, context.userId);
  }

  public async approveAuditPlan(
    planId: string,
    approvalParams: {
      approvedByUserId: string;
      approvedByRole: string;
      auditCommitteeDecisionId?: string;
    },
    context: UserContext
  ): Promise<AnnualAuditPlan> {
    return await approveAnnualAuditPlan(planId, approvalParams, context);
  }

  // ============================================================================
  // 3. AUDIT ENGAGEMENT ORCHESTRATION & SOD INDEPENDENCE
  // ============================================================================

  public registerAuditorCoolingOff(userId: string, entityId: string, role: string, validUntil: string): void {
    registerAuditorOperationalHistory(userId, entityId, role, validUntil);
  }

  public checkIndependence(userId: string, entityId: string, plannedDate?: string) {
    return checkAuditorIndependence(userId, entityId, plannedDate);
  }

  public async startAuditEngagement(
    params: {
      id?: string;
      engagementNumber?: string;
      auditPlanId?: string;
      auditUniverseEntityId: string;
      legalEntityId: string;
      titleEn: string;
      titleAr?: string;
      engagementType: AuditEngagementType;
      leadAuditorUserId: string;
      leadAuditorRole: string;
      auditTeamUserIds?: string[];
      auditeeContactUserIds?: string[];
      scopeSummaryEn: string;
      testingObjectives: string[];
      plannedStartDate: string;
      plannedEndDate: string;
      budgetedHours?: number;
    },
    context: UserContext
  ): Promise<AuditEngagement> {
    const id = params.id || `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const engagementNumber = params.engagementNumber || `ENG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const engagement: AuditEngagement = {
      id,
      engagementNumber,
      auditPlanId: params.auditPlanId,
      auditUniverseEntityId: params.auditUniverseEntityId,
      legalEntityId: params.legalEntityId,
      titleEn: params.titleEn,
      titleAr: params.titleAr,
      engagementType: params.engagementType,
      stage: 'FIELDWORK',
      leadAuditorUserId: params.leadAuditorUserId,
      leadAuditorRole: params.leadAuditorRole,
      auditTeamUserIds: params.auditTeamUserIds || [],
      auditeeContactUserIds: params.auditeeContactUserIds || [],
      scopeSummaryEn: params.scopeSummaryEn,
      testingObjectives: params.testingObjectives,
      plannedStartDate: params.plannedStartDate,
      plannedEndDate: params.plannedEndDate,
      actualStartDate: new Date().toISOString(),
      budgetedHours: params.budgetedHours || 120,
      workProgramIds: [],
      workpaperIds: [],
      controlTestIds: [],
      findingIds: [],
      isReportLocked: false,
      auditCorrelationId: `cor_eng_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await saveAuditEngagement(engagement, context.userId);
  }

  public async recordAuditWorkpaper(
    workpaper: AuditWorkpaper,
    context: UserContext
  ): Promise<AuditWorkpaper> {
    return await saveAuditWorkpaper(workpaper, context.userId);
  }

  public async finalizeAuditReport(
    engagementId: string,
    params: {
      auditOpinion: AuditOpinionType;
      executiveSummaryEn: string;
      executiveSummaryAr?: string;
      auditDirectorSignoffUserId: string;
      finalReportDocumentId?: string;
    },
    context: UserContext
  ): Promise<AuditEngagement> {
    return await issueFinalAuditReport(engagementId, params, context.userId);
  }

  // ============================================================================
  // 4. CONTROL TESTING ENGINE
  // ============================================================================

  public calculateRequiredSampleSize(
    frequency: ControlTestFrequency,
    severity: GovernanceRiskSeverity = 'MEDIUM',
    population?: number
  ): number {
    return calculateControlSampleSize(frequency, severity, population);
  }

  public async testInternalControl(
    testParams: {
      id?: string;
      testNumber?: string;
      engagementId?: string;
      controlId: string;
      legalEntityId: string;
      testType: ControlTestType;
      testingMethod: ControlTestingMethod;
      frequency: ControlTestFrequency;
      populationSize: number;
      samples: ControlTestSampleItem[];
      testerUserId: string;
      testerRole: string;
      detailedAnalysis: string;
      evidenceIds?: string[];
    },
    context: UserContext
  ): Promise<ControlTestWorksheet> {
    const id = testParams.id || `ctw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return await executeControlTestWorksheet(
      {
        ...testParams,
        id
      },
      context.userId
    );
  }

  // ============================================================================
  // 5. MANAGEMENT ACTION PLANS & REMEDIATION
  // ============================================================================

  public async createActionPlan(
    params: {
      id?: string;
      mapNumber?: string;
      findingId: string;
      engagementId?: string;
      legalEntityId: string;
      actionTitle: string;
      actionDetails: string;
      managementResponse: string;
      rootCauseMethodology: RootCauseMethodology;
      rootCauseSummary: string;
      targetImplementationDate: string;
      actionOwnerUserId: string;
      actionOwnerRole: string;
    },
    context: UserContext
  ): Promise<ManagementActionPlan> {
    const id = params.id || `map_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return await createManagementActionPlan(
      {
        ...params,
        id
      },
      context.userId
    );
  }

  public async reviseTargetDate(
    mapId: string,
    params: {
      newTargetDate: string;
      revisionReason: string;
      revisedByUserId: string;
    },
    context: UserContext
  ): Promise<ManagementActionPlan> {
    return await reviseManagementActionTargetDate(mapId, params, context.userId);
  }

  public async verifyRemediation(
    mapId: string,
    verificationParams: {
      verifiedByUserId: string;
      verifiedByRole: string;
      testProcedure: string;
      isRemediationEffective: boolean;
      verificationNotes: string;
      evidenceIds: string[];
    },
    context: UserContext
  ): Promise<ManagementActionPlan> {
    return await verifyAndCloseManagementAction(mapId, verificationParams, context);
  }

  public async runOverdueEscalations(legalEntityId?: string): Promise<ManagementActionPlan[]> {
    return await detectOverdueManagementActions(legalEntityId);
  }

  // ============================================================================
  // 6. AUDIT COMMITTEE REPORTING & 3LOD SCORECARD
  // ============================================================================

  public async generateCommitteePack(
    params: {
      id?: string;
      packNumber?: string;
      reportingPeriod: string;
      legalEntityIds: string[];
      titleEn: string;
      titleAr?: string;
    },
    context: UserContext
  ): Promise<AuditCommitteePack> {
    const id = params.id || `acp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return await generateAuditCommitteePack(
      {
        ...params,
        id
      },
      context.userId
    );
  }

  public async publishCommitteePack(
    packId: string,
    signoffParams: {
      auditCommitteeChairSignoffUserId: string;
      finalPackDocumentId?: string;
    },
    context: UserContext
  ): Promise<AuditCommitteePack> {
    return await publishAndLockAuditCommitteePack(packId, signoffParams, context.userId);
  }

  // ============================================================================
  // 7. STATUTORY IMMUTABILITY & PROHIBITED HARD DELETE
  // ============================================================================

  public async deleteAuditEntity(id: string): Promise<never> {
    return await deleteAuditUniverseEntityProhibited(id);
  }

  public async deletePlan(id: string): Promise<never> {
    return await deleteAuditPlanProhibited(id);
  }

  public async deleteEngagement(id: string): Promise<never> {
    return await deleteAuditEngagementProhibited(id);
  }

  public async deleteWorkpaper(id: string): Promise<never> {
    return await deleteAuditWorkpaperProhibited(id);
  }

  public async deleteControlTest(id: string): Promise<never> {
    return await deleteControlTestWorksheetProhibited(id);
  }

  public async deleteActionPlan(id: string): Promise<never> {
    return await deleteManagementActionPlanProhibited(id);
  }
}

export const corporateAuditAssuranceService = new CorporateAuditAssuranceService();
