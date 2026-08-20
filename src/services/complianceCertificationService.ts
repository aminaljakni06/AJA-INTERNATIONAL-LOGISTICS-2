/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Certification & Control Attestation Service
 * Step GOV-20: Regulatory Obligation Execution Assurance, Compliance Certification,
 * Control Attestation & Evidence-Based Compliance Closure
 *
 * Core Principles & Invariants:
 * - TASK COMPLETED != COMPLIANT
 * - FILING SUBMITTED != OBLIGATION SATISFIED
 * - EVIDENCE UPLOADED != EVIDENCE VERIFIED
 * - CONTROL EXISTS != CONTROL EFFECTIVE
 * - SELF-ATTESTATION != INDEPENDENT ASSURANCE
 * - AI SUMMARY != COMPLIANCE CERTIFICATION
 * - GOVERNANCE-COMPLIANCE-CERTIFICATION-INVARIANT-01:
 *   EVIDENCE-BASED, VERSION-PINNED, CONTROL-EFFECTIVENESS-AWARE,
 *   INDEPENDENTLY-VERIFIED, ENTITY-SCOPED & HISTORICALLY-REPLAYABLE
 */

import {
  ComplianceCertification,
  ControlAttestation,
  CertificationReadinessEvaluation,
  ComplianceCertificationResult,
  ComplianceCertificationLifecycleStatus,
  EvidenceItemVerificationSnapshot,
  ControlAssessmentSnapshot,
  FilingSatisfactionSnapshot,
  ExceptionUsageSnapshot,
  FindingImpactSnapshot,
  PointInTimeCertificationReplay
} from '../types/complianceCertification';
import {
  ComplianceObligation,
  GovernanceJurisdiction,
  GovernanceRiskSeverity,
  EvidenceRecord,
  InternalControl,
  CorporatePolicyVersion,
  RegulatoryFiling,
  GovernanceFinding,
  GovernanceException
} from '../types/corporateGovernance';
import { User } from '../types/user';
import {
  getComplianceCertificationById,
  getComplianceCertificationByNumber,
  listComplianceCertificationsByEntity,
  saveComplianceCertification,
  saveControlAttestation,
  getControlAttestationById,
  listControlAttestationsByControl,
  listControlAttestationsByEntity,
  reconstructCertificationAtPointInTime,
  generateCertificationNumber,
  generateAttestationNumber
} from '../db/repositories/complianceCertificationRepository';
import {
  getObligationById,
  getObligationByCodeAndEntity,
  listRegulatoryFilingsByObligation
} from '../db/repositories/complianceObligationRepository';
import {
  getEvidenceRecordById,
  listEvidenceRecordsByEntity
} from '../db/repositories/corporateRecordsRepository';
import {
  getInternalControlById,
  getInternalControls,
  getCorporatePolicyVersionById
} from '../db/repositories/corporateAuthorityRepository';
import {
  listGovernanceFindingsByEntity,
  getGovernanceExceptionById,
  listGovernanceExceptionsByEntity,
  isExceptionActive
} from '../db/repositories/corporateRiskAssuranceRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { ValidationError } from '../db/validation';

export interface EvaluateReadinessParams {
  obligationId: string;
  legalEntityId: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
}

export interface DraftCertificationParams {
  obligationId: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  policyVersionId: string;
  ruleVersion?: number;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  certificationStatement: string;
  statementVersion?: string;
  classification?: 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  isLegallyPrivileged?: boolean;
}

export interface CertifyComplianceParams {
  certificationId: string;
  certifierRole: string;
  statementVersion?: string;
  validDurationDays?: number;
}

export interface IndependentVerificationParams {
  certificationId: string;
  verifierRole: string;
  verificationNotes: string;
}

export interface ReopenCertificationParams {
  certificationId: string;
  reopenReason: string;
}

function isSuperOrAdminRole(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'SYSTEM_ADMIN' || role === 'PLATFORM_ADMIN' || role === 'ADMIN';
}

export class ComplianceCertificationService {
  /**
   * Evaluates deterministic compliance certification readiness
   */
  public static async evaluateReadiness(
    params: EvaluateReadinessParams,
    actor: User
  ): Promise<CertificationReadinessEvaluation> {
    const { obligationId, legalEntityId, reportingPeriodStart, reportingPeriodEnd } = params;
    
    // 1. Entity boundary verification
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== legalEntityId) {
      throw new ValidationError(`Tenant Isolation Violation: Actor [${actor.id}] cannot evaluate readiness for entity [${legalEntityId}].`);
    }

    const obligation = await getObligationById(obligationId);
    if (!obligation) {
      throw new ValidationError(`Compliance Obligation [${obligationId}] not found.`);
    }
    if (obligation.legalEntityId !== legalEntityId) {
      throw new ValidationError(`Obligation [${obligationId}] does not belong to entity [${legalEntityId}].`);
    }

    const blockers: string[] = [];
    const warnings: string[] = [];

    // 2. Applicability Gate
    const isApplicable = obligation.applicabilityStatus === 'APPLICABLE';
    if (!isApplicable) {
      blockers.push(`Obligation is not marked APPLICABLE (Current Status: [${obligation.applicabilityStatus}]).`);
    }

    // 3. Filing Satisfaction Check (if filing is required)
    let filingsSatisfied = true;
    if (obligation.filingRequired) {
      const filings = await listRegulatoryFilingsByObligation(obligationId);
      if (filings.length === 0) {
        filingsSatisfied = false;
        blockers.push('No regulatory filings registered for this obligation.');
      } else {
        const latestFiling = filings[0];
        if (latestFiling.status === 'REJECTED') {
          filingsSatisfied = false;
          blockers.push(`Latest regulatory filing [${latestFiling.filingNumber}] was REJECTED by authority.`);
        } else if (latestFiling.status === 'SUBMITTED') {
          filingsSatisfied = false;
          warnings.push(`Filing [${latestFiling.filingNumber}] is SUBMITTED but not yet ACCEPTED or VERIFIED.`);
        } else if (latestFiling.status !== 'ACCEPTED' && latestFiling.status !== 'VERIFIED') {
          filingsSatisfied = false;
          blockers.push(`Filing [${latestFiling.filingNumber}] is in state [${latestFiling.status}], not ACCEPTED or VERIFIED.`);
        }
      }
    }

    // 4. Evidence Verification & Integrity Gate
    let evidenceVerified = true;
    let evidenceIntegrityValid = true;
    const allEvidence = await listEvidenceRecordsByEntity(legalEntityId);
    const relatedEvidence = allEvidence.filter(e => e.legalEntityId === legalEntityId);

    if (obligation.evidenceRequired) {
      if (relatedEvidence.length === 0) {
        evidenceVerified = false;
        blockers.push('Required evidence missing in Evidence Vault.');
      } else {
        for (const evi of relatedEvidence) {
          if (evi.verificationStatus !== 'VERIFIED') {
            evidenceVerified = false;
            warnings.push(`Evidence [${evi.evidenceNumber}] is not verified (status: ${evi.verificationStatus}).`);
          }
          if (evi.verificationStatus === 'INTEGRITY_FAILURE' || evi.integrityStatus === 'MISMATCH') {
            evidenceIntegrityValid = false;
            blockers.push(`Evidence [${evi.evidenceNumber}] failed cryptographic SHA-256 integrity verification.`);
          }
          if (evi.validUntil && new Date(evi.validUntil).getTime() < Date.now()) {
            evidenceVerified = false;
            blockers.push(`Evidence [${evi.evidenceNumber}] has expired on ${evi.validUntil}.`);
          }
        }
      }
    }

    // 5. Internal Control Operating & Design Effectiveness
    let controlsEffective = true;
    let controlsFresh = true;
    const controls = await getInternalControls({ legalEntityId });
    const entityControls = controls.filter(c => c.status === 'ACTIVE');

    for (const ctrl of entityControls) {
      if (ctrl.operatingEffectiveness === 'DEFICIENT' || ctrl.operatingEffectiveness === 'UNTESTED') {
        controlsEffective = false;
        blockers.push(`Internal Control [${ctrl.controlCode}] operating effectiveness is [${ctrl.operatingEffectiveness}].`);
      }
      if (ctrl.lastTestedAt) {
        const testAgeDays = (Date.now() - new Date(ctrl.lastTestedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (testAgeDays > 180) { // 180 days freshness window
          controlsFresh = false;
          warnings.push(`Control [${ctrl.controlCode}] test is stale (${Math.round(testAgeDays)} days old).`);
        }
      }
    }

    // 6. Open Blocking Findings & Remediation Verification
    const allFindings = await listGovernanceFindingsByEntity(legalEntityId);
    const linkedFindings = allFindings.filter(f => f.obligationId === obligationId || f.status !== 'CLOSED');
    let blockingFindingsCount = 0;

    for (const fnd of linkedFindings) {
      if (fnd.status === 'OPEN' || fnd.status === 'REOPENED' || fnd.status === 'REMEDIATION_IN_PROGRESS') {
        if (fnd.severity === 'HIGH' || fnd.severity === 'CRITICAL') {
          blockingFindingsCount += 1;
          blockers.push(`Open ${fnd.severity} finding [${fnd.findingNumber}]: ${fnd.title}`);
        }
      }
    }

    // 7. Active Governance Exceptions
    const allExceptions = await listGovernanceExceptionsByEntity(legalEntityId);
    const activeExceptions = allExceptions.filter(e => isExceptionActive(e));
    const validExceptionsCount = activeExceptions.length;

    // 8. Determine Expected Result
    let expectedResult: ComplianceCertificationResult = 'COMPLIANT';
    let readyForCertification = false;

    if (!isApplicable) {
      expectedResult = 'NOT_APPLICABLE';
    } else if (!evidenceIntegrityValid) {
      expectedResult = 'NON_COMPLIANT';
    } else if (!evidenceVerified || !filingsSatisfied) {
      expectedResult = 'INSUFFICIENT_EVIDENCE';
    } else if (blockingFindingsCount > 0 || !controlsEffective) {
      if (validExceptionsCount > 0) {
        expectedResult = 'COMPLIANT_WITH_EXCEPTIONS';
        readyForCertification = true;
      } else {
        expectedResult = 'NON_COMPLIANT';
      }
    } else {
      expectedResult = 'COMPLIANT';
      readyForCertification = blockers.length === 0;
    }

    return {
      obligationId,
      obligationCode: obligation.code,
      obligationVersionId: obligation.id,
      legalEntityId,
      jurisdiction: obligation.jurisdiction,
      isApplicable,
      applicabilityStatus: obligation.applicabilityStatus,
      filingsSatisfied,
      evidenceVerified,
      evidenceIntegrityValid,
      controlsEffective,
      controlsFresh,
      blockingFindingsCount,
      validExceptionsCount,
      readyForCertification,
      expectedResult,
      blockers,
      warnings,
      evaluatedAt: new Date().toISOString(),
      evaluatedByUserId: actor.id
    };
  }

  /**
   * Initializes a Draft Compliance Certification package with pinned snapshots
   */
  public static async createDraftCertification(
    params: DraftCertificationParams,
    actor: User
  ): Promise<ComplianceCertification> {
    const { obligationId, legalEntityId, jurisdiction, policyVersionId, reportingPeriodStart, reportingPeriodEnd } = params;

    // Tenant Isolation
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== legalEntityId) {
      throw new ValidationError(`Tenant Isolation Violation: Principal [${actor.id}] cannot create certification for entity [${legalEntityId}].`);
    }

    const obligation = await getObligationById(obligationId);
    if (!obligation) {
      throw new ValidationError(`Compliance Obligation [${obligationId}] not found.`);
    }

    const policyVersion = await getCorporatePolicyVersionById(policyVersionId);
    if (!policyVersion) {
      throw new ValidationError(`Corporate Policy Version [${policyVersionId}] not found.`);
    }

    const readiness = await this.evaluateReadiness({
      obligationId,
      legalEntityId,
      reportingPeriodStart,
      reportingPeriodEnd
    }, actor);

    // Build pinned snapshots
    const allEvidence = await listEvidenceRecordsByEntity(legalEntityId);
    const evidenceSnapshots: EvidenceItemVerificationSnapshot[] = allEvidence.map(e => ({
      evidenceRecordId: e.id,
      documentId: e.documentId,
      documentVersionId: e.documentVersionId || 'v1.0',
      checksumSha256: e.checksumSha256,
      legalEntityId: e.legalEntityId || legalEntityId,
      evidenceType: e.evidenceType,
      verificationStatus: e.verificationStatus,
      integrityValid: e.verificationStatus !== 'INTEGRITY_FAILURE' && e.integrityStatus !== 'MISMATCH',
      isExpired: e.validUntil ? new Date(e.validUntil).getTime() < Date.now() : false,
      validUntil: e.validUntil,
      verifiedAt: e.verifiedAt,
      verifiedByUserId: e.verifiedByUserId
    }));

    const controls = await getInternalControls({ legalEntityId });
    const controlSnapshots: ControlAssessmentSnapshot[] = controls.map(c => ({
      controlId: c.id,
      controlCode: c.controlCode,
      operatingEffectiveness: c.operatingEffectiveness,
      designEffectiveness: 'EFFECTIVE',
      lastTestedAt: c.lastTestedAt,
      isStale: c.lastTestedAt ? (Date.now() - new Date(c.lastTestedAt).getTime()) / (1000 * 60 * 60 * 24) > 180 : true
    }));

    const filings = await listRegulatoryFilingsByObligation(obligationId);
    const filingSnapshots: FilingSatisfactionSnapshot[] = filings.map(f => ({
      filingId: f.id,
      filingNumber: f.filingNumber,
      status: f.status,
      isAcceptedOrVerified: f.status === 'ACCEPTED' || f.status === 'VERIFIED',
      receiptDocumentId: f.authoritySubmissionReceiptDocumentId,
      verifiedByUserId: f.verifiedByUserId
    }));

    const findings = await listGovernanceFindingsByEntity(legalEntityId);
    const findingSnapshots: FindingImpactSnapshot[] = findings.map(f => ({
      findingId: f.id,
      findingNumber: f.findingNumber,
      severity: f.severity,
      status: f.status,
      isBlocking: f.status !== 'CLOSED' && (f.severity === 'HIGH' || f.severity === 'CRITICAL'),
      remediationVerified: f.status === 'CLOSED'
    }));

    const exceptions = await listGovernanceExceptionsByEntity(legalEntityId);
    const exceptionSnapshots: ExceptionUsageSnapshot[] = exceptions.map(ex => ({
      exceptionId: ex.id,
      exceptionNumber: ex.exceptionNumber,
      title: (ex as any).title || ex.reason || ex.riskSummary,
      riskRating: ex.riskRating,
      isActive: isExceptionActive(ex),
      effectiveFrom: ex.effectiveFrom,
      effectiveUntil: ex.effectiveUntil,
      supportingDecisionId: ex.supportingDecisionId,
      compensatingControlsVerified: ex.compensatingControls ? ex.compensatingControls.length > 0 : false
    }));

    const certId = `ccf_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const certNumber = generateCertificationNumber();

    const cert: ComplianceCertification = {
      id: certId,
      certificationNumber: certNumber,
      legalEntityId,
      jurisdiction,
      obligationId,
      obligationCode: obligation.code,
      obligationVersionId: obligation.id,
      policyVersionId: policyVersion.id,
      ruleVersion: params.ruleVersion || 1,
      reportingPeriodStart,
      reportingPeriodEnd,
      status: 'DRAFT',
      certificationResult: readiness.expectedResult,
      certificationStatement: params.certificationStatement,
      statementVersion: params.statementVersion || 'v1.0',
      readinessEvaluation: readiness,
      evidenceSnapshots,
      controlSnapshots,
      filingSnapshots,
      exceptionSnapshots,
      findingSnapshots,
      reopenHistory: [],
      version: 1,
      isLegallyPrivileged: params.isLegallyPrivileged || false,
      classification: params.classification || 'CONFIDENTIAL',
      integrityHashSha256: '',
      correlationId: `cor_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return saveComplianceCertification(cert, actor.id);
  }

  /**
   * Records a formal Control Owner Attestation
   */
  public static async recordControlAttestation(
    params: {
      controlId: string;
      legalEntityId: string;
      jurisdiction: GovernanceJurisdiction;
      attestorRole: string;
      reportingPeriodStart: string;
      reportingPeriodEnd: string;
      statementVersion?: string;
      operatingEffectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT';
      evidenceRecordIds: string[];
      exceptionsNoted?: string[];
      policyVersionId: string;
    },
    actor: User
  ): Promise<ControlAttestation> {
    // 1. AI & Service Principal Boundary
    if ((actor.role as string) === 'AI_AGENT' || (actor as any).isAIAgent) {
      throw new ValidationError('AI Boundary: AI Agent cannot execute formal control attestation.');
    }
    if ((actor.role as string) === 'SERVICE_PRINCIPAL') {
      throw new ValidationError('Service Principal Boundary: Automated service principals cannot execute formal control attestation.');
    }

    // 2. Tenant Isolation
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== params.legalEntityId) {
      throw new ValidationError(`Tenant Isolation Violation: Actor [${actor.id}] cannot attest controls for entity [${params.legalEntityId}].`);
    }

    const control = await getInternalControlById(params.controlId);
    if (!control) {
      throw new ValidationError(`Internal Control [${params.controlId}] not found.`);
    }

    const attestationId = `cat_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const attestationNumber = generateAttestationNumber();

    const attestation: ControlAttestation = {
      id: attestationId,
      attestationNumber,
      controlId: params.controlId,
      controlCode: control.controlCode,
      legalEntityId: params.legalEntityId,
      jurisdiction: params.jurisdiction,
      attestorUserId: actor.id,
      attestorRole: params.attestorRole,
      reportingPeriodStart: params.reportingPeriodStart,
      reportingPeriodEnd: params.reportingPeriodEnd,
      statementVersion: params.statementVersion || 'v1.0',
      operatingEffectiveness: params.operatingEffectiveness,
      evidenceRecordIds: params.evidenceRecordIds,
      exceptionsNoted: params.exceptionsNoted || [],
      attestedAt: new Date().toISOString(),
      policyVersionId: params.policyVersionId,
      integrityHashSha256: '',
      correlationId: `cor_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return saveControlAttestation(attestation, actor.id);
  }

  /**
   * Certifies compliance for a draft certification package
   */
  public static async certifyCompliance(
    params: CertifyComplianceParams,
    actor: User
  ): Promise<ComplianceCertification> {
    // 1. AI & Service Principal Boundaries
    if ((actor.role as string) === 'AI_AGENT' || (actor as any).isAIAgent) {
      throw new ValidationError('AI Boundary: AI Agent cannot certify compliance.');
    }
    if ((actor.role as string) === 'SERVICE_PRINCIPAL') {
      throw new ValidationError('Service Principal Boundary: Automated service principal cannot certify compliance.');
    }

    // 2. Technical Admin Bypass Denial
    const actorRole = actor.role as string;
    if (actorRole === 'TECH_ADMIN' || actorRole === 'ADMIN' || actorRole === 'SYSTEM_ADMIN') {
      const userRoles = (actor as any).roles || [actorRole];
      if (!actor.permissions?.includes('governance:compliance:certify') && !userRoles.includes('CHIEF_COMPLIANCE_OFFICER') && !userRoles.includes('COMPLIANCE_OFFICER')) {
        throw new ValidationError('Technical Admin Boundary: Technical admin role alone grants no compliance certification authority.');
      }
    }

    const cert = await getComplianceCertificationById(params.certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${params.certificationId}] not found.`);
    }

    // 3. Tenant Boundary
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== cert.legalEntityId) {
      throw new ValidationError(`Tenant Isolation: Principal [${actor.id}] cannot certify for entity [${cert.legalEntityId}].`);
    }

    // 4. Segregation of Duties (SoD): Obligation Owner != Certifier
    const obligation = await getObligationById(cert.obligationId);
    if (obligation && obligation.ownerUserId === actor.id) {
      throw new ValidationError(`Segregation of Duties Violation: Obligation owner [${actor.id}] cannot act as final compliance certifier.`);
    }

    // 5. Readiness & Integrity Gate
    const readiness = await this.evaluateReadiness({
      obligationId: cert.obligationId,
      legalEntityId: cert.legalEntityId,
      reportingPeriodStart: cert.reportingPeriodStart,
      reportingPeriodEnd: cert.reportingPeriodEnd
    }, actor);

    // If there are unmitigated blockers and expectedResult is NON_COMPLIANT / INSUFFICIENT_EVIDENCE
    if (readiness.expectedResult === 'NON_COMPLIANT' || readiness.expectedResult === 'INSUFFICIENT_EVIDENCE') {
      throw new ValidationError(`Certification Denied: Readiness evaluation resulted in [${readiness.expectedResult}]. Blockers: ${readiness.blockers.join('; ')}`);
    }

    const now = new Date();
    const validDurationDays = params.validDurationDays || 365;
    const validUntil = new Date(now.getTime() + validDurationDays * 24 * 60 * 60 * 1000).toISOString();

    const updated: ComplianceCertification = {
      ...cert,
      status: 'PENDING_INDEPENDENT_VERIFICATION',
      certificationResult: readiness.expectedResult,
      certifierUserId: actor.id,
      certifierRole: params.certifierRole,
      certifiedAt: now.toISOString(),
      validFrom: now.toISOString(),
      validUntil,
      revalidationRequiredAt: validUntil,
      readinessEvaluation: readiness,
      statementVersion: params.statementVersion || cert.statementVersion
    };

    return saveComplianceCertification(updated, actor.id);
  }

  /**
   * Performs Independent Verification of a certified package
   */
  public static async independentlyVerifyCertification(
    params: IndependentVerificationParams,
    actor: User
  ): Promise<ComplianceCertification> {
    // 1. AI & Automation Boundaries
    if ((actor.role as string) === 'AI_AGENT' || (actor as any).isAIAgent) {
      throw new ValidationError('AI Boundary: AI Agent cannot perform independent compliance verification.');
    }
    if ((actor.role as string) === 'SERVICE_PRINCIPAL') {
      throw new ValidationError('Service Principal Boundary: Automated service principal cannot perform independent verification.');
    }

    const cert = await getComplianceCertificationById(params.certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${params.certificationId}] not found.`);
    }

    // 2. SoD: Certifier != Independent Verifier
    if (cert.certifierUserId === actor.id) {
      throw new ValidationError(`Segregation of Duties Violation: Primary certifier [${actor.id}] cannot independently verify their own certification.`);
    }

    // 3. Tenant Boundary
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== cert.legalEntityId) {
      throw new ValidationError(`Tenant Isolation: Actor [${actor.id}] cannot verify certification for entity [${cert.legalEntityId}].`);
    }

    const now = new Date().toISOString();
    const updated: ComplianceCertification = {
      ...cert,
      status: 'VERIFIED',
      independentVerifierUserId: actor.id,
      independentVerifierRole: params.verifierRole,
      verifiedAt: now,
      independentVerificationNotes: params.verificationNotes
    };

    return saveComplianceCertification(updated, actor.id);
  }

  /**
   * Closes a verified compliance certification
   */
  public static async closeCertification(
    certificationId: string,
    closureNotes: string,
    actor: User
  ): Promise<ComplianceCertification> {
    const cert = await getComplianceCertificationById(certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${certificationId}] not found.`);
    }

    if (cert.status !== 'VERIFIED') {
      throw new ValidationError(`Cannot close certification [${certificationId}] from status [${cert.status}]. Must be VERIFIED first.`);
    }

    const now = new Date().toISOString();
    const updated: ComplianceCertification = {
      ...cert,
      status: 'CLOSED',
      closureNotes,
      closedAt: now,
      closedByUserId: actor.id
    };

    return saveComplianceCertification(updated, actor.id);
  }

  /**
   * Flags certification as requiring revalidation (e.g. following regulatory change or evidence expiration)
   */
  public static async triggerRevalidation(
    certificationId: string,
    revalidationReason: string,
    actor: User
  ): Promise<ComplianceCertification> {
    const cert = await getComplianceCertificationById(certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${certificationId}] not found.`);
    }

    const now = new Date().toISOString();
    const updated: ComplianceCertification = {
      ...cert,
      status: 'REVALIDATION_REQUIRED',
      revalidationReason,
      revalidationRequiredAt: now
    };

    return saveComplianceCertification(updated, actor.id);
  }

  /**
   * Handles Regulatory Change trigger from GOV-18
   */
  public static async handleRegulatoryChangeTrigger(
    regulatoryChangeId: string,
    affectedObligationId: string,
    legalEntityId: string,
    actor: User
  ): Promise<ComplianceCertification[]> {
    const certs = await listComplianceCertificationsByEntity(legalEntityId, { obligationId: affectedObligationId });
    const activeCerts = certs.filter(c => c.status !== 'SUPERSEDED' && c.status !== 'REJECTED');
    
    const results: ComplianceCertification[] = [];
    for (const cert of activeCerts) {
      const updated = await this.triggerRevalidation(
        cert.id,
        `Material Regulatory Change [${regulatoryChangeId}] adopted under GOV-18 requires compliance revalidation.`,
        actor
      );
      results.push(updated);
    }

    return results;
  }

  /**
   * Handles Regulatory Case deficiency trigger from GOV-19
   */
  public static async handleRegulatoryCaseDeficiencyTrigger(
    regulatoryCaseId: string,
    affectedObligationId: string,
    legalEntityId: string,
    actor: User
  ): Promise<ComplianceCertification[]> {
    const certs = await listComplianceCertificationsByEntity(legalEntityId, { obligationId: affectedObligationId });
    const activeCerts = certs.filter(c => c.status !== 'SUPERSEDED' && c.status !== 'REJECTED');

    const results: ComplianceCertification[] = [];
    for (const cert of activeCerts) {
      const updated = await this.reopenCertification({
        certificationId: cert.id,
        reopenReason: `Regulatory Case [${regulatoryCaseId}] confirmed deficiency / observation requiring certification reopening.`
      }, actor);
      results.push(updated);
    }

    return results;
  }

  /**
   * Reopens a previously certified or closed record when a deficiency is discovered
   */
  public static async reopenCertification(
    params: ReopenCertificationParams,
    actor: User
  ): Promise<ComplianceCertification> {
    const cert = await getComplianceCertificationById(params.certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${params.certificationId}] not found.`);
    }

    const now = new Date().toISOString();
    const reopenHistory = cert.reopenHistory || [];
    reopenHistory.push({
      reopenedAt: now,
      reopenedByUserId: actor.id,
      reason: params.reopenReason,
      previousResult: cert.certificationResult
    });

    const updated: ComplianceCertification = {
      ...cert,
      status: 'REOPENED',
      certificationResult: 'NON_COMPLIANT',
      reopenedAt: now,
      reopenedByUserId: actor.id,
      reopenReason: params.reopenReason,
      reopenHistory
    };

    return saveComplianceCertification(updated, actor.id);
  }

  /**
   * Creates a V2 certification superseding V1 while preserving full audit history
   */
  public static async supersedeCertification(
    previousCertificationId: string,
    newParams: DraftCertificationParams,
    actor: User
  ): Promise<ComplianceCertification> {
    const previous = await getComplianceCertificationById(previousCertificationId);
    if (!previous) {
      throw new ValidationError(`Previous Compliance Certification [${previousCertificationId}] not found.`);
    }

    const newDraft = await this.createDraftCertification(newParams, actor);

    // Link supersession
    const updatedNew: ComplianceCertification = {
      ...newDraft,
      version: previous.version + 1,
      supersedesCertificationId: previous.id
    };
    await saveComplianceCertification(updatedNew, actor.id);

    const updatedPrevious: ComplianceCertification = {
      ...previous,
      status: 'SUPERSEDED',
      supersededByCertificationId: updatedNew.id
    };
    await saveComplianceCertification(updatedPrevious, actor.id);

    return updatedNew;
  }

  /**
   * Replays historical compliance certification at point-in-time T
   */
  public static async replayCertificationAtPointInTime(
    certificationId: string,
    targetTimestampUtc: string,
    actor: User
  ): Promise<PointInTimeCertificationReplay> {
    const cert = await getComplianceCertificationById(certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${certificationId}] not found.`);
    }

    // Tenant Isolation
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== cert.legalEntityId) {
      throw new ValidationError(`Tenant Isolation: Actor [${actor.id}] cannot replay certification for entity [${cert.legalEntityId}].`);
    }

    return reconstructCertificationAtPointInTime(certificationId, targetTimestampUtc);
  }

  /**
   * Exports certification package with strict authorization
   */
  public static async exportCertificationPackage(
    certificationId: string,
    actor: User
  ): Promise<{ certification: ComplianceCertification; exportedAt: string; exporterId: string }> {
    const cert = await getComplianceCertificationById(certificationId);
    if (!cert) {
      throw new ValidationError(`Compliance Certification [${certificationId}] not found.`);
    }

    // Tenant Isolation
    if (!isSuperOrAdminRole(actor.role as string) && actor.legalEntityId && actor.legalEntityId !== cert.legalEntityId) {
      throw new ValidationError(`Tenant Isolation: Actor [${actor.id}] cannot export certification for entity [${cert.legalEntityId}].`);
    }

    // View != Export check
    const userRoles = (actor as any).roles || [actor.role];
    const hasExportPermission = actor.permissions?.includes('governance:certification:export') || isSuperOrAdminRole(actor.role as string) || userRoles.includes('CHIEF_COMPLIANCE_OFFICER');
    if (!hasExportPermission) {
      throw new ValidationError(`Unauthorized: Actor [${actor.id}] has view permissions but lacks 'governance:certification:export' authority.`);
    }

    await createAuditLog({
      actorUserId: actor.id,
      action: 'EXPORT_COMPLIANCE_CERTIFICATION_PACKAGE',
      entityType: 'COMPLIANCE_CERTIFICATION',
      entityId: cert.id,
      metadata: {
        certificationNumber: cert.certificationNumber,
        legalEntityId: cert.legalEntityId,
        classification: cert.classification,
        isLegallyPrivileged: cert.isLegallyPrivileged
      }
    });

    return {
      certification: cert,
      exportedAt: new Date().toISOString(),
      exporterId: actor.id
    };
  }
}
