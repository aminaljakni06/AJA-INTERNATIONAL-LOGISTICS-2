/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Calendar & Deadline Engine
 * Step GOV-08: Corporate Compliance Calendar, Recurrence, Deadlines, Reminders & Escalations
 * 
 * Core Architectural Mandates:
 * - Deterministic Due-Date Engine with Timezone & Business-Day Adjustments
 * - Idempotent Recurrence Generation with Deduplication Keys (generationKey)
 * - Applicability Gating: Only APPLICABLE (or formally WAIVED) obligations generate binding occurrences
 * - Runtime Dynamic Overdue Evaluation
 * - Separation of Duties (SoD): Submitter/Preparer/Owner strictly forbidden from self-verifying evidence
 * - Non-destructive Historical Preservation: Hard delete is strictly prohibited
 * - Automated Bilingual Reminder Scheduling & Multi-Tier Escalation Engine
 * - Strict ABAC & Legal Entity Scoping with Search Metadata Leak Prevention
 */

import {
  ComplianceOccurrence,
  ComplianceOccurrenceStatus,
  ComplianceObligation,
  DueDateRuleConfig,
  BusinessDayConvention,
  ReminderDispatchRecord,
  EscalationRecord,
  GovernanceJurisdiction,
  GovernanceRiskSeverity
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import {
  getOccurrenceById,
  getOccurrenceByNumber,
  getOccurrenceByGenerationKey,
  listOccurrencesByEntity,
  listOccurrencesByObligation,
  saveOccurrence,
  generateNextOccurrenceNumber
} from '../db/repositories/complianceCalendarRepository';
import {
  getObligationById,
  listObligationsByEntity,
  getActiveWaiverForObligation
} from '../db/repositories/complianceObligationRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { notificationService } from './notificationService';
import { ValidationError } from '../db/validation';

export interface DueDateCalculationResult {
  statutoryDueDate: string; // Canonical UTC ISO (e.g. 2026-09-30T23:59:59.000Z)
  dueLocalDate: string; // Date string YYYY-MM-DD (e.g. 2026-09-30)
  timeZone: string;
}

export interface ReassignOwnerParams {
  occurrenceId: string;
  newOwnerUserId: string;
  reason: string;
  responsibleDepartmentId?: string;
  assignedAdvisorUserId?: string;
  auditCorrelationId?: string;
}

export interface StatutoryExtensionParams {
  occurrenceId: string;
  extendedDueDate: string;
  authorityReference: string;
  reason: string;
  evidenceDocumentId?: string;
  auditCorrelationId?: string;
}

export interface CompleteOccurrenceParams {
  occurrenceId: string;
  filingReference?: string;
  evidenceDocumentId?: string;
  notes?: string;
  auditCorrelationId?: string;
}

export interface VerifyOccurrenceParams {
  occurrenceId: string;
  evidenceDocumentId: string;
  verificationNotes: string;
  auditCorrelationId?: string;
}

export class ComplianceCalendarService {
  /**
   * Helper to map jurisdiction to canonical default time zone
   */
  public static getDefaultTimeZoneForJurisdiction(jurisdiction: GovernanceJurisdiction): string {
    switch (jurisdiction) {
      case 'GB':
        return 'Europe/London';
      case 'SA':
        return 'Asia/Riyadh';
      case 'AE':
        return 'Asia/Dubai';
      case 'US':
        return 'America/New_York';
      case 'GLOBAL':
      default:
        return 'UTC';
    }
  }

  /**
   * Builds an ABAC Context for compliance calendar operations
   */
  private static buildContext(
    legalEntityId: string,
    occurrence?: ComplianceOccurrence | null,
    extra?: Partial<ABACContext>
  ): ABACContext {
    return {
      legalEntityId,
      companyId: legalEntityId,
      occurrenceSpecificId: occurrence?.id,
      recordId: occurrence?.id,
      jurisdiction: occurrence?.jurisdiction,
      ownerId: occurrence?.ownerUserId,
      departmentId: occurrence?.responsibleDepartmentId,
      assignedToId: occurrence?.ownerUserId,
      assignedAdvisorId: occurrence?.assignedAdvisorUserId,
      assignedAdvisorUserId: occurrence?.assignedAdvisorUserId,
      reviewerId: occurrence?.reviewerUserId,
      verifierId: occurrence?.verifierUserId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true,
      ...extra
    };
  }

  // ============================================================================
  // 1. DETERMINISTIC DUE-DATE CALCULATION ENGINE
  // ============================================================================

  /**
   * Calculates canonical Statutory Due Date and Local Date for a given obligation and reference period
   */
  public static calculateStatutoryDueDate(
    obligation: Pick<ComplianceObligation, 'jurisdiction' | 'dueDateRule'>,
    referencePeriodEndIso: string,
    overrideRule?: DueDateRuleConfig
  ): DueDateCalculationResult {
    const rule = overrideRule || obligation.dueDateRule;
    const timeZone = rule.jurisdictionTimeZone || this.getDefaultTimeZoneForJurisdiction(obligation.jurisdiction);
    const convention = rule.businessDayConvention || 'NONE';

    const periodEndDate = new Date(referencePeriodEndIso);
    if (isNaN(periodEndDate.getTime())) {
      throw new ValidationError(`Invalid referencePeriodEnd date: ${referencePeriodEndIso}`);
    }

    const year = periodEndDate.getUTCFullYear();
    const month = periodEndDate.getUTCMonth(); // 0-indexed
    const day = periodEndDate.getUTCDate();

    let targetDate: Date;

    switch (rule.ruleType) {
      case 'RELATIVE_TO_FYE_MONTHS': {
        const offsetMonths = rule.offsetDaysOrMonths !== undefined ? rule.offsetDaysOrMonths : 9;
        // Target month calculation: e.g. FYE Dec 31 + 9 months = Sept 30
        const targetMonth = month + offsetMonths;
        // Last day of the target month
        targetDate = new Date(Date.UTC(year, targetMonth + 1, 0));
        break;
      }

      case 'RELATIVE_TO_EVENT_DAYS': {
        const offsetDays = rule.offsetDaysOrMonths !== undefined ? rule.offsetDaysOrMonths : 14;
        targetDate = new Date(Date.UTC(year, month, day + offsetDays));
        break;
      }

      case 'FIXED_ANNUAL_DAY': {
        const fixed = rule.fixedMonthDay || '12-31';
        const parts = fixed.split('-');
        const fMonth = parseInt(parts[0], 10) - 1;
        const fDay = parseInt(parts[1], 10);
        targetDate = new Date(Date.UTC(year, fMonth, fDay));
        break;
      }

      case 'CONTINUOUS': {
        targetDate = new Date(periodEndDate.getTime());
        break;
      }

      case 'CUSTOM_OFFSET':
      default: {
        const offset = rule.offsetDaysOrMonths || 0;
        targetDate = new Date(Date.UTC(year, month, day + offset));
        break;
      }
    }

    // Apply Business Day Adjustments if requested
    targetDate = this.applyBusinessDayConvention(targetDate, convention);

    const dueYear = targetDate.getUTCFullYear();
    const dueMonthStr = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
    const dueDayStr = String(targetDate.getUTCDate()).padStart(2, '0');
    const dueLocalDate = `${dueYear}-${dueMonthStr}-${dueDayStr}`;

    // Canonical UTC timestamp representing end of day in UTC
    const statutoryDueDate = new Date(Date.UTC(dueYear, targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 0)).toISOString();

    return {
      statutoryDueDate,
      dueLocalDate,
      timeZone
    };
  }

  /**
   * Adjusts date according to business day convention (Saturday/Sunday adjustments)
   */
  private static applyBusinessDayConvention(
    date: Date,
    convention: BusinessDayConvention
  ): Date {
    if (convention === 'NONE') return date;

    const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

    if (convention === 'NEXT_BUSINESS_DAY') {
      if (dayOfWeek === 6) {
        // Saturday -> advance 2 days to Monday
        return new Date(date.getTime() + 2 * 86400000);
      } else if (dayOfWeek === 0) {
        // Sunday -> advance 1 day to Monday
        return new Date(date.getTime() + 1 * 86400000);
      }
    } else if (convention === 'PREVIOUS_BUSINESS_DAY') {
      if (dayOfWeek === 6) {
        // Saturday -> move back 1 day to Friday
        return new Date(date.getTime() - 1 * 86400000);
      } else if (dayOfWeek === 0) {
        // Sunday -> move back 2 days to Friday
        return new Date(date.getTime() - 2 * 86400000);
      }
    }

    return date;
  }

  // ============================================================================
  // 2. RECURRENCE GENERATION & OCCURRENCE ENGINE
  // ============================================================================

  /**
   * Generates compliance occurrences for an obligation across a planning horizon (Idempotent & Deduplicated)
   */
  public static async generateOccurrencesForObligation(
    user: User,
    obligationId: string,
    horizonDays: number = 365
  ): Promise<ComplianceOccurrence[]> {
    const obligation = await getObligationById(obligationId);
    if (!obligation) {
      throw new ValidationError(`Obligation [${obligationId}] not found.`);
    }

    const context = this.buildContext(obligation.legalEntityId, null, { obligationId });
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:generate', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot generate occurrences. ${evalResult.reason}`);
    }

    // Gate 1: Check obligation status
    if (obligation.status !== 'ACTIVE') {
      return [];
    }

    // Gate 2: Applicability Gate
    // If NOT_APPLICABLE, INSUFFICIENT_EVIDENCE, or PENDING_ASSESSMENT, do NOT generate binding active occurrences
    if (
      obligation.applicabilityStatus === 'NOT_APPLICABLE' ||
      obligation.applicabilityStatus === 'INSUFFICIENT_EVIDENCE' ||
      obligation.applicabilityStatus === 'INSUFFICIENT_DATA_TO_VERIFY' ||
      obligation.applicabilityStatus === 'PENDING_ASSESSMENT' ||
      obligation.applicabilityStatus === 'UNDER_REVIEW'
    ) {
      return [];
    }

    // Check if obligation is waived
    const activeWaiver = await getActiveWaiverForObligation(obligation.id);
    const isWaived = obligation.applicabilityStatus === 'WAIVED' && !!activeWaiver;

    // Gate 3: Build list of periods within the planning horizon
    const periods = this.buildPeriodsForFrequency(obligation, horizonDays);
    const generated: ComplianceOccurrence[] = [];
    const ruleVersion = 1;

    for (const period of periods) {
      // Effective period check
      if (obligation.effectiveUntil && period.start > obligation.effectiveUntil) {
        continue;
      }
      if (obligation.effectiveFrom && period.end < obligation.effectiveFrom) {
        continue;
      }

      // Check waiver coverage
      let periodWaived = isWaived;
      let waiverId = activeWaiver?.id;
      if (activeWaiver) {
        if (period.start > activeWaiver.effectiveUntil || period.end < activeWaiver.effectiveFrom) {
          periodWaived = false;
          waiverId = undefined;
        }
      }

      // Generation key for deterministic deduplication
      const generationKey = `gen_${obligation.legalEntityId}_${obligation.code}_${period.reference}_v${ruleVersion}`;

      // Check if already generated
      const existing = await getOccurrenceByGenerationKey(generationKey);
      if (existing) {
        generated.push(existing);
        continue;
      }

      const dueResult = this.calculateStatutoryDueDate(obligation, period.end);
      const occurrenceNumber = await generateNextOccurrenceNumber();
      const occurrenceId = `occ_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date().toISOString();

      const initialStatus: ComplianceOccurrenceStatus = periodWaived ? 'WAIVED' : 'UPCOMING';

      const occurrence: ComplianceOccurrence = {
        id: occurrenceId,
        occurrenceNumber,
        obligationId: obligation.id,
        obligationCode: obligation.code,
        requirementDefinitionId: obligation.requirementDefinitionId,
        legalEntityId: obligation.legalEntityId,
        jurisdiction: obligation.jurisdiction,
        title: obligation.titleEn,
        description: obligation.description,
        referencePeriodStart: period.start,
        referencePeriodEnd: period.end,
        periodReference: period.reference,
        scheduledDate: now,
        statutoryDueDate: dueResult.statutoryDueDate,
        dueLocalDate: dueResult.dueLocalDate,
        timeZone: dueResult.timeZone,
        status: initialStatus,
        priority: obligation.riskLevel === 'CRITICAL' ? 'CRITICAL' : obligation.riskLevel === 'HIGH' ? 'HIGH' : 'NORMAL',
        riskLevel: obligation.riskLevel,
        ownerUserId: obligation.ownerUserId,
        responsibleDepartmentId: obligation.responsibleDepartmentId,
        reviewerUserId: obligation.reviewerUserId,
        verifierUserId: obligation.verifierUserId,
        filingRequired: obligation.filingRequired,
        evidenceRequired: obligation.evidenceRequired,
        evidenceDocumentIds: [],
        waiverId: waiverId,
        suppressedByWaiver: periodWaived,
        reminderSchedule: {
          reminderDaysBeforeDue: [60, 30, 14, 7, 1, 0],
          escalationAfterOverdueDays: [1, 7, 14, 30],
          notifyOwner: true,
          notifyManager: true,
          notifyComplianceOfficer: true,
          notifyExecutive: true
        },
        remindersDispatched: [],
        escalationLevel: 0,
        escalationStatus: 'NONE',
        escalationHistory: [],
        ruleVersion,
        generationKey,
        generatedBy: user.id,
        auditCorrelationId: `gen_occ_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };

      const saved = await saveOccurrence(occurrence, user.id);
      generated.push(saved);
    }

    return generated;
  }

  /**
   * Generates upcoming occurrences for all active, applicable obligations of a legal entity
   */
  public static async generateUpcomingOccurrencesForEntity(
    user: User,
    legalEntityId: string,
    horizonDays: number = 365
  ): Promise<ComplianceOccurrence[]> {
    const obligations = await listObligationsByEntity(legalEntityId);
    const results: ComplianceOccurrence[] = [];

    for (const obl of obligations) {
      if (obl.status === 'ACTIVE') {
        const occs = await this.generateOccurrencesForObligation(user, obl.id, horizonDays);
        results.push(...occs);
      }
    }

    return results;
  }

  /**
   * Builds reference periods for an obligation based on frequency and horizon
   */
  private static buildPeriodsForFrequency(
    obligation: ComplianceObligation,
    horizonDays: number
  ): Array<{ start: string; end: string; reference: string }> {
    const currentYear = new Date().getFullYear();
    const periods: Array<{ start: string; end: string; reference: string }> = [];

    switch (obligation.frequency) {
      case 'ANNUAL': {
        // e.g. FY current and FY next
        const numYears = Math.max(1, Math.ceil(horizonDays / 365));
        for (let i = 0; i <= numYears; i++) {
          const yr = currentYear + i;
          periods.push({
            start: `${yr}-01-01`,
            end: `${yr}-12-31`,
            reference: `FY${yr}`
          });
        }
        break;
      }

      case 'SEMI_ANNUAL': {
        const numYears = Math.max(1, Math.ceil(horizonDays / 365));
        for (let i = 0; i <= numYears; i++) {
          const yr = currentYear + i;
          periods.push({
            start: `${yr}-01-01`,
            end: `${yr}-06-30`,
            reference: `${yr}-H1`
          });
          periods.push({
            start: `${yr}-07-01`,
            end: `${yr}-12-31`,
            reference: `${yr}-H2`
          });
        }
        break;
      }

      case 'QUARTERLY': {
        const numYears = Math.max(1, Math.ceil(horizonDays / 365));
        for (let i = 0; i <= numYears; i++) {
          const yr = currentYear + i;
          periods.push({ start: `${yr}-01-01`, end: `${yr}-03-31`, reference: `${yr}-Q1` });
          periods.push({ start: `${yr}-04-01`, end: `${yr}-06-30`, reference: `${yr}-Q2` });
          periods.push({ start: `${yr}-07-01`, end: `${yr}-09-30`, reference: `${yr}-Q3` });
          periods.push({ start: `${yr}-10-01`, end: `${yr}-12-31`, reference: `${yr}-Q4` });
        }
        break;
      }

      case 'MONTHLY': {
        for (let m = 1; m <= 12; m++) {
          const mStr = String(m).padStart(2, '0');
          const lastDay = new Date(Date.UTC(currentYear, m, 0)).getUTCDate();
          periods.push({
            start: `${currentYear}-${mStr}-01`,
            end: `${currentYear}-${mStr}-${String(lastDay).padStart(2, '0')}`,
            reference: `${currentYear}-M${mStr}`
          });
        }
        break;
      }

      case 'ONE_TIME':
      case 'CONTINUOUS':
      case 'EVENT_DRIVEN':
      default: {
        periods.push({
          start: obligation.effectiveFrom || `${currentYear}-01-01`,
          end: obligation.effectiveUntil || `${currentYear}-12-31`,
          reference: obligation.frequency === 'ONE_TIME' ? `ONE_TIME_${obligation.code}` : `CY${currentYear}`
        });
        break;
      }
    }

    return periods;
  }

  // ============================================================================
  // 3. RUNTIME STATUS EVALUATION & CALENDAR QUERIES
  // ============================================================================

  /**
   * Computes dynamic runtime status (e.g. OVERDUE, DUE_SOON) for an occurrence
   */
  public static evaluateRuntimeStatus(
    occ: ComplianceOccurrence,
    asOfDate: Date = new Date()
  ): ComplianceOccurrenceStatus {
    if (
      occ.status === 'COMPLETED' ||
      occ.status === 'WAIVED' ||
      occ.status === 'NOT_APPLICABLE' ||
      occ.status === 'FILED'
    ) {
      return occ.status;
    }

    const effectiveDeadline = new Date(occ.extendedDueDate || occ.statutoryDueDate);
    const diffMs = effectiveDeadline.getTime() - asOfDate.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);

    if (diffMs < 0) {
      return 'OVERDUE';
    }

    if (diffDays <= 7) {
      return 'DUE_SOON';
    }

    return occ.status;
  }

  /**
   * Retrieves a single occurrence by ID with strict ABAC evaluation
   */
  public static async getOccurrence(
    user: User,
    occurrenceId: string
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(occurrenceId);
    if (!occ) {
      throw new ValidationError(`Compliance occurrence [${occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:view', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Access denied viewing compliance occurrence. ${evalResult.reason}`);
    }

    // Attach runtime evaluated status
    return {
      ...occ,
      status: this.evaluateRuntimeStatus(occ)
    };
  }

  /**
   * Lists occurrences for an entity with ABAC scoping and runtime status calculation
   */
  public static async listOccurrences(
    user: User,
    legalEntityId: string,
    filter?: {
      jurisdiction?: GovernanceJurisdiction;
      status?: ComplianceOccurrenceStatus | string;
      obligationId?: string;
      ownerUserId?: string;
      departmentId?: string;
      startDate?: string;
      endDate?: string;
      riskLevel?: GovernanceRiskSeverity;
    }
  ): Promise<ComplianceOccurrence[]> {
    const context = this.buildContext(legalEntityId, null);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:view', context);
    if (!evalResult.granted) {
      return [];
    }

    const items = await listOccurrencesByEntity(legalEntityId, filter);

    // Apply runtime overdue evaluations
    return items.map((occ) => ({
      ...occ,
      status: this.evaluateRuntimeStatus(occ)
    }));
  }

  // ============================================================================
  // 4. OWNER ASSIGNMENT & DELEGATION ENGINE
  // ============================================================================

  /**
   * Reassigns owner / responsible department / advisor for an occurrence
   */
  public static async reassignOwner(
    user: User,
    params: ReassignOwnerParams
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(params.occurrenceId);
    if (!occ) {
      throw new ValidationError(`Occurrence [${params.occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:assign', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot reassign occurrence owner. ${evalResult.reason}`);
    }

    const previousOwner = occ.ownerUserId;
    const updated: ComplianceOccurrence = {
      ...occ,
      ownerUserId: params.newOwnerUserId,
      responsibleDepartmentId: params.responsibleDepartmentId || occ.responsibleDepartmentId,
      assignedAdvisorUserId: params.assignedAdvisorUserId || occ.assignedAdvisorUserId,
      auditCorrelationId: params.auditCorrelationId || `reassign_${Date.now()}`
    };

    const saved = await saveOccurrence(updated, user.id);

    await createAuditLog({
      actorUserId: user.id,
      action: 'REASSIGN_COMPLIANCE_OWNER',
      entityType: 'COMPLIANCE_OCCURRENCE',
      entityId: occ.id,
      before: { ownerUserId: previousOwner },
      after: { ownerUserId: params.newOwnerUserId, reason: params.reason },
      metadata: {
        legalEntityId: occ.legalEntityId,
        occurrenceNumber: occ.occurrenceNumber,
        assignedAdvisorUserId: params.assignedAdvisorUserId
      }
    });

    return saved;
  }

  // ============================================================================
  // 5. DEADLINE RESCHEDULING & STATUTORY EXTENSIONS
  // ============================================================================

  /**
   * Reschedules the internal operational target date without modifying statutoryDueDate
   */
  public static async rescheduleOperationalTarget(
    user: User,
    occurrenceId: string,
    newInternalTargetDate: string,
    reason: string
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(occurrenceId);
    if (!occ) {
      throw new ValidationError(`Occurrence [${occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:reschedule', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot reschedule target date. ${evalResult.reason}`);
    }

    const updated: ComplianceOccurrence = {
      ...occ,
      internalTargetDate: newInternalTargetDate
    };

    const saved = await saveOccurrence(updated, user.id);

    await createAuditLog({
      actorUserId: user.id,
      action: 'RESCHEDULE_INTERNAL_TARGET_DATE',
      entityType: 'COMPLIANCE_OCCURRENCE',
      entityId: occ.id,
      metadata: {
        legalEntityId: occ.legalEntityId,
        newInternalTargetDate,
        statutoryDueDatePreserved: occ.statutoryDueDate,
        reason
      }
    });

    return saved;
  }

  /**
   * Records an approved statutory regulatory extension (Leaves statutoryDueDate intact, sets extendedDueDate)
   */
  public static async recordStatutoryExtension(
    user: User,
    params: StatutoryExtensionParams
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(params.occurrenceId);
    if (!occ) {
      throw new ValidationError(`Occurrence [${params.occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:reschedule', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot record statutory extension. ${evalResult.reason}`);
    }

    if (!params.authorityReference || !params.reason) {
      throw new ValidationError('Statutory extension requires official authorityReference and detailed rationale.');
    }

    const evidenceDocs = [...occ.evidenceDocumentIds];
    if (params.evidenceDocumentId && !evidenceDocs.includes(params.evidenceDocumentId)) {
      evidenceDocs.push(params.evidenceDocumentId);
    }

    const updated: ComplianceOccurrence = {
      ...occ,
      extendedDueDate: params.extendedDueDate,
      extensionReason: params.reason,
      extensionAuthorityReference: params.authorityReference,
      extensionApprovedByUserId: user.id,
      evidenceDocumentIds: evidenceDocs,
      auditCorrelationId: params.auditCorrelationId || `ext_${Date.now()}`
    };

    const saved = await saveOccurrence(updated, user.id);

    await createAuditLog({
      actorUserId: user.id,
      action: 'RECORD_STATUTORY_DEADLINE_EXTENSION',
      entityType: 'COMPLIANCE_OCCURRENCE',
      entityId: occ.id,
      metadata: {
        legalEntityId: occ.legalEntityId,
        originalStatutoryDueDate: occ.statutoryDueDate,
        extendedDueDate: params.extendedDueDate,
        authorityReference: params.authorityReference,
        reason: params.reason
      }
    });

    return saved;
  }

  // ============================================================================
  // 6. COMPLETION & SOD VERIFICATION ENGINE
  // ============================================================================

  /**
   * Submits evidence/filing and marks occurrence ready or completed
   */
  public static async completeOccurrence(
    user: User,
    params: CompleteOccurrenceParams
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(params.occurrenceId);
    if (!occ) {
      throw new ValidationError(`Occurrence [${params.occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:complete', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot complete calendar item. ${evalResult.reason}`);
    }

    if (occ.evidenceRequired && !params.evidenceDocumentId && occ.evidenceDocumentIds.length === 0) {
      throw new ValidationError(`Evidence is required to complete obligation [${occ.obligationCode}]. Attach evidence document.`);
    }

    const evidenceDocs = [...occ.evidenceDocumentIds];
    if (params.evidenceDocumentId && !evidenceDocs.includes(params.evidenceDocumentId)) {
      evidenceDocs.push(params.evidenceDocumentId);
    }

    const now = new Date().toISOString();
    const newStatus: ComplianceOccurrenceStatus = occ.filingRequired ? 'FILED' : 'COMPLETED';

    const updated: ComplianceOccurrence = {
      ...occ,
      status: newStatus,
      filingNumber: params.filingReference || occ.filingNumber,
      filingSubmittedAt: occ.filingRequired ? now : occ.filingSubmittedAt,
      evidenceDocumentIds: evidenceDocs,
      completionDate: now,
      auditCorrelationId: params.auditCorrelationId || `comp_${Date.now()}`
    };

    return saveOccurrence(updated, user.id);
  }

  /**
   * Verifies filing evidence with strict Separation of Duties (SoD) enforcement
   */
  public static async verifyOccurrenceFiling(
    user: User,
    params: VerifyOccurrenceParams
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(params.occurrenceId);
    if (!occ) {
      throw new ValidationError(`Occurrence [${params.occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:verify', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot verify compliance filing. ${evalResult.reason}`);
    }

    // Separation of Duties (SoD) Invariant: Submitter / Owner is strictly prohibited from self-verifying evidence
    if (occ.ownerUserId === user.id) {
      throw new ValidationError(
        `Separation of Duties (SoD) Violation: Occurrence owner/submitter [${user.id}] is strictly prohibited from self-verifying compliance filing evidence.`
      );
    }

    const evidenceDocs = [...occ.evidenceDocumentIds];
    if (params.evidenceDocumentId && !evidenceDocs.includes(params.evidenceDocumentId)) {
      evidenceDocs.push(params.evidenceDocumentId);
    }

    const now = new Date().toISOString();
    const updated: ComplianceOccurrence = {
      ...occ,
      status: 'COMPLETED',
      verifiedByUserId: user.id,
      verificationDate: now,
      verificationNotes: params.verificationNotes,
      evidenceDocumentIds: evidenceDocs,
      auditCorrelationId: params.auditCorrelationId || `ver_${Date.now()}`
    };

    const saved = await saveOccurrence(updated, user.id);

    await createAuditLog({
      actorUserId: user.id,
      action: 'VERIFY_COMPLIANCE_FILING_EVIDENCE',
      entityType: 'COMPLIANCE_OCCURRENCE',
      entityId: occ.id,
      metadata: {
        legalEntityId: occ.legalEntityId,
        verifiedByUserId: user.id,
        ownerUserId: occ.ownerUserId,
        verificationNotes: params.verificationNotes
      }
    });

    return saved;
  }

  // ============================================================================
  // 7. REMINDER DISPATCH ENGINE
  // ============================================================================

  /**
   * Evaluates and dispatches upcoming deadline reminders idempotently
   */
  public static async dispatchDueReminders(
    user: User,
    legalEntityId: string,
    asOfDate: Date = new Date()
  ): Promise<ReminderDispatchRecord[]> {
    const context = this.buildContext(legalEntityId);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:reminder:manage', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot dispatch reminders. ${evalResult.reason}`);
    }

    const occurrences = await listOccurrencesByEntity(legalEntityId);
    const dispatched: ReminderDispatchRecord[] = [];
    const asOfMs = asOfDate.getTime();

    for (const occ of occurrences) {
      if (occ.status === 'COMPLETED' || occ.status === 'WAIVED' || occ.status === 'NOT_APPLICABLE') {
        continue;
      }

      const effectiveDueDate = new Date(occ.extendedDueDate || occ.statutoryDueDate);
      const schedule = occ.reminderSchedule;
      const history = [...occ.remindersDispatched];
      let recordUpdated = false;

      for (const offsetDays of schedule.reminderDaysBeforeDue) {
        const triggerTime = effectiveDueDate.getTime() - offsetDays * 86400000;
        if (asOfMs >= triggerTime) {
          // Check idempotency: Have we dispatched for this offset?
          const alreadySent = history.some((r) => r.triggerOffsetDays === offsetDays);
          if (!alreadySent) {
            const dispatchId = `rem_${occ.id}_${offsetDays}_${Date.now()}`;
            const severity = offsetDays <= 1 ? 'ERROR' : offsetDays <= 7 ? 'WARNING' : 'INFO';

            // Dispatch via central notification service
            notificationService.dispatch({
              category: 'COMPLIANCE',
              severity,
              type: 'compliance.deadline.reminder',
              titleEn: `Compliance Reminder: ${occ.title} due in ${offsetDays} days`,
              titleAr: `تذكير التزام قانوني: موعد استحقاق ${occ.title} خلال ${offsetDays} يوم`,
              messageEn: `Obligation [${occ.obligationCode}] for ${occ.periodReference} is due on ${occ.dueLocalDate}.`,
              messageAr: `الالتزام القانوني [${occ.obligationCode}] للفترة ${occ.periodReference} يستحق بتاريخ ${occ.dueLocalDate}.`,
              entityType: 'COMPLIANCE',
              entityId: occ.id,
              source: 'SCHEDULED_JOB'
            });

            const record: ReminderDispatchRecord = {
              id: dispatchId,
              triggerOffsetDays: offsetDays,
              recipientUserId: occ.ownerUserId,
              recipientRole: 'COMPLIANCE_OWNER',
              dispatchedAtUtc: asOfDate.toISOString(),
              channel: 'IN_APP',
              deliveryReference: `notif_${dispatchId}`,
              status: 'DELIVERED'
            };

            history.push(record);
            dispatched.push(record);
            recordUpdated = true;
          }
        }
      }

      if (recordUpdated) {
        const updated: ComplianceOccurrence = {
          ...occ,
          remindersDispatched: history,
          lastReminderSentAt: asOfDate.toISOString()
        };
        await saveOccurrence(updated, user.id);
      }
    }

    return dispatched;
  }

  // ============================================================================
  // 8. MULTI-TIER ESCALATION ENGINE
  // ============================================================================

  /**
   * Evaluates overdue occurrences and triggers hierarchical escalations
   */
  public static async evaluateAndTriggerEscalations(
    user: User,
    legalEntityId: string,
    asOfDate: Date = new Date()
  ): Promise<EscalationRecord[]> {
    const context = this.buildContext(legalEntityId);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:escalation:manage', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot evaluate escalations. ${evalResult.reason}`);
    }

    const occurrences = await listOccurrencesByEntity(legalEntityId);
    const triggered: EscalationRecord[] = [];
    const asOfMs = asOfDate.getTime();

    for (const occ of occurrences) {
      if (occ.status === 'COMPLETED' || occ.status === 'WAIVED' || occ.status === 'NOT_APPLICABLE') {
        continue;
      }

      const effectiveDueDate = new Date(occ.extendedDueDate || occ.statutoryDueDate);
      const diffMs = asOfMs - effectiveDueDate.getTime();

      if (diffMs > 0) {
        const daysOverdue = Math.floor(diffMs / 86400000);
        let targetLevel = 0;
        let targetRole = 'NONE';

        if (daysOverdue >= 30 && occ.riskLevel === 'CRITICAL') {
          targetLevel = 4; // Board Level
          targetRole = 'BOARD_COMMITTEE';
        } else if (daysOverdue >= 14 || (daysOverdue >= 7 && occ.riskLevel === 'CRITICAL')) {
          targetLevel = 3; // Executive (CFO/CEO)
          targetRole = 'EXECUTIVE_LEADERSHIP';
        } else if (daysOverdue >= 7) {
          targetLevel = 2; // Compliance Officer
          targetRole = 'COMPLIANCE_OFFICER';
        } else if (daysOverdue >= 1) {
          targetLevel = 1; // Department Manager
          targetRole = 'DEPARTMENT_MANAGER';
        }

        if (targetLevel > occ.escalationLevel) {
          const escId = `esc_${occ.id}_L${targetLevel}_${Date.now()}`;
          const reason = `Statutory deadline overdue by ${daysOverdue} days for [${occ.obligationCode}] (${occ.riskLevel} risk).`;

          notificationService.dispatch({
            category: 'COMPLIANCE',
            severity: 'ERROR',
            type: 'compliance.escalation.triggered',
            titleEn: `CRITICAL ESCALATION Level ${targetLevel}: ${occ.title} Overdue`,
            titleAr: `تصعيد عالي الأهمية (المستوى ${targetLevel}): تأخر تقديم ${occ.title}`,
            messageEn: `Obligation [${occ.obligationCode}] is overdue by ${daysOverdue} days. Escalated to ${targetRole}.`,
            messageAr: `الالتزام القانوني [${occ.obligationCode}] متأخر بمقدار ${daysOverdue} يوم. تم التصعيد إلى ${targetRole}.`,
            entityType: 'COMPLIANCE',
            entityId: occ.id,
            source: 'SYSTEM'
          });

          const record: EscalationRecord = {
            id: escId,
            occurrenceId: occ.id,
            level: targetLevel,
            escalatedAtUtc: asOfDate.toISOString(),
            targetRole,
            targetUserIds: [],
            reason,
            status: 'ACTIVE'
          };

          const updatedHistory = [...occ.escalationHistory, record];
          const updated: ComplianceOccurrence = {
            ...occ,
            escalationLevel: targetLevel,
            escalationStatus: 'TRIGGERED',
            escalatedAt: asOfDate.toISOString(),
            escalationHistory: updatedHistory
          };

          await saveOccurrence(updated, user.id);
          triggered.push(record);
        }
      }
    }

    return triggered;
  }

  /**
   * Acknowledges an active escalation without closing the statutory obligation
   */
  public static async acknowledgeEscalation(
    user: User,
    occurrenceId: string,
    notes: string
  ): Promise<ComplianceOccurrence> {
    const occ = await getOccurrenceById(occurrenceId);
    if (!occ) {
      throw new ValidationError(`Occurrence [${occurrenceId}] not found.`);
    }

    const context = this.buildContext(occ.legalEntityId, occ);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:escalation:manage', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot acknowledge escalation. ${evalResult.reason}`);
    }

    const now = new Date().toISOString();
    const updatedHistory = occ.escalationHistory.map((h) => {
      if (h.status === 'ACTIVE') {
        return {
          ...h,
          status: 'ACKNOWLEDGED' as const,
          acknowledgedByUserId: user.id,
          acknowledgedAtUtc: now,
          acknowledgementNotes: notes
        };
      }
      return h;
    });

    const updated: ComplianceOccurrence = {
      ...occ,
      escalationStatus: 'ACKNOWLEDGED',
      escalationHistory: updatedHistory
    };

    const saved = await saveOccurrence(updated, user.id);

    await createAuditLog({
      actorUserId: user.id,
      action: 'ACKNOWLEDGE_COMPLIANCE_ESCALATION',
      entityType: 'COMPLIANCE_OCCURRENCE',
      entityId: occ.id,
      metadata: {
        legalEntityId: occ.legalEntityId,
        escalationLevel: occ.escalationLevel,
        acknowledgedByUserId: user.id,
        notes
      }
    });

    return saved;
  }

  // ============================================================================
  // 9. EXPORT & SEARCH INTEGRATION
  // ============================================================================

  /**
   * Exports the compliance calendar matrix with sensitive audit logging
   */
  public static async exportCalendarMatrix(
    user: User,
    legalEntityId: string
  ): Promise<ComplianceOccurrence[]> {
    const context = this.buildContext(legalEntityId);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:calendar:export', context);
    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Cannot export calendar matrix. ${evalResult.reason}`);
    }

    const items = await this.listOccurrences(user, legalEntityId);

    await createAuditLog({
      actorUserId: user.id,
      action: 'EXPORT_COMPLIANCE_CALENDAR_MATRIX',
      entityType: 'COMPLIANCE_CALENDAR',
      entityId: legalEntityId,
      metadata: {
        legalEntityId,
        recordCount: items.length,
        exportedByUserId: user.id
      }
    });

    return items;
  }
}
