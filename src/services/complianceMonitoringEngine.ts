/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Monitoring Engine
 * Step GOV-07: Compliance Gap Telemetry, Risk Signal Emission & Monitoring Engine
 * 
 * Functions:
 * - Scans entity obligations, applicability states, and filing pipelines
 * - Detects missing evidence, unassessed obligations, unverified filings, and expiring waivers
 * - Emits typed ComplianceMonitoringSignal telemetry records
 * - Scoped strictly to Legal Entity with ABAC & Explicit Deny enforcement
 */

import {
  ComplianceMonitoringSignal,
  ComplianceObligation,
  RegulatoryFiling,
  ComplianceWaiverRecord,
  GovernanceJurisdiction
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import {
  listObligationsByEntity,
  listFilingsByEntity,
  listWaiversByEntity,
  listSignalsByEntity,
  saveSignal,
  getSignalById
} from '../db/repositories/complianceObligationRepository';
import { listOccurrencesByEntity } from '../db/repositories/complianceCalendarRepository';

export class ComplianceMonitoringEngine {
  /**
   * Builds an ABAC Context for compliance monitoring
   */
  private static buildContext(
    legalEntityId: string,
    extra?: Partial<ABACContext>
  ): ABACContext {
    return {
      legalEntityId,
      companyId: legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true,
      ...extra
    };
  }

  /**
   * Scans and generates fresh compliance monitoring signals for a legal entity
   */
  public static async scanAndGenerateSignals(
    user: User,
    legalEntityId: string
  ): Promise<ComplianceMonitoringSignal[]> {
    const context = this.buildContext(legalEntityId);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:monitoring:view', context);

    if (!evalResult.granted) {
      throw new Error(`Unauthorized: User cannot view compliance monitoring signals. ${evalResult.reason}`);
    }

    const generatedSignals: ComplianceMonitoringSignal[] = [];
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Scan Obligations for unassessed or insufficient evidence
    const obligations = await listObligationsByEntity(legalEntityId);
    for (const obl of obligations) {
      if (obl.status !== 'ACTIVE') continue;

      if (obl.applicabilityStatus === 'PENDING_ASSESSMENT') {
        const signal: ComplianceMonitoringSignal = {
          id: `sig_unassessed_${obl.id}`,
          legalEntityId,
          jurisdiction: obl.jurisdiction,
          signalType: 'UNASSESSED_OBLIGATION',
          severity: 'HIGH',
          targetResourceId: obl.id,
          targetResourceType: 'COMPLIANCE_OBLIGATION',
          message: `Obligation [${obl.code}] requires formal applicability assessment.`,
          detectedAt: nowIso,
          status: 'ACTIVE'
        };
        const saved = await saveSignal(signal, user.id);
        generatedSignals.push(saved);
      } else if (obl.applicabilityStatus === 'INSUFFICIENT_EVIDENCE') {
        const signal: ComplianceMonitoringSignal = {
          id: `sig_missing_ev_${obl.id}`,
          legalEntityId,
          jurisdiction: obl.jurisdiction,
          signalType: 'MISSING_APPLICABILITY_EVIDENCE',
          severity: 'HIGH',
          targetResourceId: obl.id,
          targetResourceType: 'COMPLIANCE_OBLIGATION',
          message: `Obligation [${obl.code}] has insufficient documentary evidence to confirm statutory status.`,
          detectedAt: nowIso,
          status: 'ACTIVE'
        };
        const saved = await saveSignal(signal, user.id);
        generatedSignals.push(saved);
      }
    }

    // 2. Scan Filings for unverified submissions
    const filings = await listFilingsByEntity(legalEntityId);
    for (const fil of filings) {
      if (fil.status === 'PENDING_VERIFICATION' || (fil.status === 'SUBMITTED' && fil.requiresIndependentVerification)) {
        const signal: ComplianceMonitoringSignal = {
          id: `sig_unverified_fil_${fil.id}`,
          legalEntityId,
          jurisdiction: fil.jurisdiction,
          signalType: 'OVERDUE_UNVERIFIED_FILING',
          severity: 'MEDIUM',
          targetResourceId: fil.id,
          targetResourceType: 'REGULATORY_FILING',
          message: `Filing [${fil.filingNumber}] (${fil.obligationCode}) is submitted and awaits independent compliance verification.`,
          detectedAt: nowIso,
          status: 'ACTIVE'
        };
        const saved = await saveSignal(signal, user.id);
        generatedSignals.push(saved);
      }
    }

    // 3. Scan Waivers for upcoming expiration (e.g. within 30 days)
    const waivers = await listWaiversByEntity(legalEntityId);
    for (const waiv of waivers) {
      if (waiv.status === 'ACTIVE') {
        const expiryDate = new Date(waiv.effectiveUntil);
        const diffDays = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays >= 0 && diffDays <= 30) {
          const signal: ComplianceMonitoringSignal = {
            id: `sig_exp_waiver_${waiv.id}`,
            legalEntityId,
            jurisdiction: 'GB',
            signalType: 'EXPIRING_WAIVER',
            severity: 'MEDIUM',
            targetResourceId: waiv.id,
            targetResourceType: 'COMPLIANCE_WAIVER',
            message: `Compliance waiver for obligation [${waiv.obligationId}] will expire in ${Math.ceil(diffDays)} days.`,
            detectedAt: nowIso,
            status: 'ACTIVE'
          };
          const saved = await saveSignal(signal, user.id);
          generatedSignals.push(saved);
        }
      }
    }

    // 4. Scan Compliance Occurrences for overdue statutory deadlines
    const occurrences = await listOccurrencesByEntity(legalEntityId);
    for (const occ of occurrences) {
      if (occ.status === 'COMPLETED' || occ.status === 'WAIVED' || occ.status === 'NOT_APPLICABLE') {
        continue;
      }
      const deadline = new Date(occ.extendedDueDate || occ.statutoryDueDate);
      if (now.getTime() > deadline.getTime()) {
        const signal: ComplianceMonitoringSignal = {
          id: `sig_overdue_occ_${occ.id}`,
          legalEntityId,
          jurisdiction: occ.jurisdiction,
          signalType: 'OVERDUE_STATUTORY_DEADLINE',
          severity: occ.riskLevel,
          targetResourceId: occ.id,
          targetResourceType: 'COMPLIANCE_OCCURRENCE',
          message: `Compliance Occurrence [${occ.occurrenceNumber}] (${occ.obligationCode}) is overdue. Statutory deadline was ${occ.dueLocalDate}.`,
          detectedAt: nowIso,
          status: 'ACTIVE'
        };
        const saved = await saveSignal(signal, user.id);
        generatedSignals.push(saved);
      }
    }

    return generatedSignals;
  }

  /**
   * Lists compliance signals for an entity
   */
  public static async listSignals(
    user: User,
    legalEntityId: string,
    status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  ): Promise<ComplianceMonitoringSignal[]> {
    const context = this.buildContext(legalEntityId);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:monitoring:view', context);

    if (!evalResult.granted) {
      return [];
    }

    return listSignalsByEntity(legalEntityId, status);
  }

  /**
   * Resolves or acknowledges a compliance monitoring signal
   */
  public static async resolveSignal(
    user: User,
    signalId: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED'
  ): Promise<ComplianceMonitoringSignal> {
    const signal = await getSignalById(signalId);
    if (!signal) {
      throw new Error(`Compliance Signal not found: [${signalId}]`);
    }

    const context = this.buildContext(signal.legalEntityId);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:monitoring:resolve', context);

    if (!evalResult.granted) {
      throw new Error(`Unauthorized: Access denied resolving monitoring signal. ${evalResult.reason}`);
    }

    const updated: ComplianceMonitoringSignal = {
      ...signal,
      status,
      resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : signal.resolvedAt
    };

    return saveSignal(updated, user.id);
  }
}
