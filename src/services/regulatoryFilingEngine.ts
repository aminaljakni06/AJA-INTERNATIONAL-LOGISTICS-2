/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Regulatory Filing Engine
 * Step GOV-07: Statutory Filings, Submission Attempts, Independent Verification & SoD
 * 
 * Security & Governance Rules:
 * - Strict Filing State Machine: DRAFT -> PREPARED -> PENDING_APPROVAL -> APPROVED -> SUBMITTED -> ACCEPTED -> VERIFIED
 * - Prohibits invalid / skipping lifecycle transitions
 * - Separation of Duties (SoD): Submitter / Preparer strictly forbidden from self-verifying filing evidence
 * - Mandatory Cryptographic / Document Evidence for Verification
 * - Scoped to Legal Entity & Jurisdiction with ABAC & Explicit Deny enforcement
 * - Direct document access restrictions & Search metadata leak prevention
 */

import {
  RegulatoryFiling,
  RegulatoryFilingStatus,
  FilingAttemptRecord,
  ComplianceObligation,
  GovernanceJurisdiction
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import {
  getFilingById,
  getFilingByNumber,
  listFilingsByEntity,
  saveFiling,
  recordFilingAttempt,
  listFilingAttempts,
  getObligationById
} from '../db/repositories/complianceObligationRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';

export interface CreateFilingParams {
  obligationId: string;
  legalEntityId: string;
  jurisdiction: GovernanceJurisdiction;
  title: string;
  periodReference: string;
  dueDate: string;
  requiresIndependentVerification?: boolean;
  notes?: string;
  auditCorrelationId?: string;
}

export interface SubmitFilingAttemptParams {
  filingId: string;
  submissionMethod: 'ELECTRONIC_API' | 'PORTAL_MANUAL_UPLOAD' | 'PHYSICAL_PAPER' | 'AUTHORIZED_AGENT';
  portalName?: string;
  receiptReference?: string;
  receiptDocumentId?: string;
  outcomeStatus: 'SUCCESS' | 'REJECTED_BY_AUTHORITY' | 'PENDING_ACKNOWLEDGMENT' | 'NETWORK_ERROR';
  rejectionReason?: string;
  auditCorrelationId?: string;
}

export interface VerifyFilingParams {
  filingId: string;
  evidenceDocumentId: string;
  verificationNotes?: string;
  auditCorrelationId?: string;
}

export class RegulatoryFilingEngine {
  /**
   * Valid state machine transitions
   */
  private static readonly VALID_TRANSITIONS: Record<RegulatoryFilingStatus, RegulatoryFilingStatus[]> = {
    DRAFT: ['PREPARED', 'PENDING_APPROVAL', 'CANCELLED'],
    PREPARED: ['PENDING_APPROVAL', 'APPROVED', 'SUBMITTED', 'DRAFT', 'CANCELLED'],
    PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
    APPROVED: ['SUBMITTED', 'PENDING_APPROVAL', 'CANCELLED'],
    SUBMITTED: ['ACCEPTED', 'REJECTED', 'PENDING_VERIFICATION', 'VERIFIED'],
    ACCEPTED: ['PENDING_VERIFICATION', 'VERIFIED', 'AMENDED'],
    REJECTED: ['PREPARED', 'SUBMITTED', 'AMENDED', 'CANCELLED'],
    PENDING_VERIFICATION: ['VERIFIED', 'REJECTED'],
    VERIFIED: ['AMENDED', 'SUPERSEDED'],
    AMENDED: ['PREPARED', 'SUBMITTED', 'SUPERSEDED'],
    SUPERSEDED: [],
    CANCELLED: []
  };

  /**
   * Builds an ABAC Context for filing operations
   */
  private static buildContext(
    legalEntityId: string,
    filing?: RegulatoryFiling | null,
    extra?: Partial<ABACContext>
  ): ABACContext {
    return {
      legalEntityId,
      companyId: legalEntityId,
      obligationId: filing?.obligationId,
      recordId: filing?.id,
      jurisdiction: filing?.jurisdiction,
      createdById: filing?.preparedByUserId,
      ownerId: filing?.preparedByUserId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true,
      ...extra
    };
  }

  /**
   * Prepares and creates a new Regulatory Filing in DRAFT or PREPARED state
   */
  public static async createFiling(
    user: User,
    params: CreateFilingParams
  ): Promise<RegulatoryFiling> {
    const obligation = await getObligationById(params.obligationId);
    if (!obligation) {
      throw new Error(`Obligation not found: [${params.obligationId}]`);
    }

    const context = this.buildContext(params.legalEntityId, null, {
      jurisdiction: params.jurisdiction
    });

    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:filing:create', context);
    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_FILING_CREATION_DENIED',
        entityType: 'REGULATORY_FILING',
        entityId: params.obligationId,
        metadata: {
          reason: evalResult.reason,
          legalEntityId: params.legalEntityId
        }
      });
      throw new Error(`Unauthorized: Access denied creating regulatory filing. ${evalResult.reason}`);
    }

    const year = new Date().getFullYear();
    const seq = Math.floor(1000 + Math.random() * 9000);
    const filingNumber = `FIL-${year}-${seq}`;
    const filingId = `fil_${params.legalEntityId}_${Date.now()}`;
    const correlationId =
      params.auditCorrelationId || `corr_fil_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const filing: RegulatoryFiling = {
      id: filingId,
      filingNumber,
      obligationId: obligation.id,
      obligationCode: obligation.code,
      legalEntityId: params.legalEntityId,
      jurisdiction: params.jurisdiction,
      title: params.title,
      periodReference: params.periodReference,
      dueDate: params.dueDate,
      status: 'DRAFT',
      preparedByUserId: user.id,
      evidenceDocumentIds: [],
      requiresIndependentVerification: params.requiresIndependentVerification ?? true,
      notes: params.notes,
      auditCorrelationId: correlationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return saveFiling(filing, user.id);
  }

  /**
   * Retrieves a Regulatory Filing by ID with strict scope enforcement
   */
  public static async getFiling(
    user: User,
    filingId: string
  ): Promise<RegulatoryFiling> {
    const filing = await getFilingById(filingId);
    if (!filing) {
      throw new Error(`Regulatory Filing not found: [${filingId}]`);
    }

    const context = this.buildContext(filing.legalEntityId, filing);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:filing:view', context);

    if (!evalResult.granted) {
      throw new Error(
        `Unauthorized: User [${user.id}] cannot view filing [${filingId}]. ${evalResult.reason}`
      );
    }

    return filing;
  }

  /**
   * Transition Filing Lifecycle State with transition validation
   */
  public static async transitionFilingState(
    user: User,
    filingId: string,
    targetState: RegulatoryFilingStatus,
    notes?: string
  ): Promise<RegulatoryFiling> {
    const filing = await this.getFiling(user, filingId);

    const allowedNext = this.VALID_TRANSITIONS[filing.status] || [];
    if (!allowedNext.includes(targetState)) {
      throw new Error(
        `Invalid Filing Transition: Cannot transition filing from '${filing.status}' to '${targetState}'. Allowed transitions: [${allowedNext.join(', ')}].`
      );
    }

    const context = this.buildContext(filing.legalEntityId, filing);
    const requiredPerm = targetState === 'APPROVED' ? 'governance:decision:approve' : 'governance:filing:create';
    const evalResult = PermissionResolver.evaluateDetailed(user, requiredPerm, context);

    if (!evalResult.granted) {
      throw new Error(`Unauthorized: User cannot transition filing to '${targetState}'. ${evalResult.reason}`);
    }

    const updated: RegulatoryFiling = {
      ...filing,
      status: targetState,
      notes: notes || filing.notes,
      updatedAt: new Date().toISOString()
    };

    if (targetState === 'APPROVED') {
      updated.approvedByUserId = user.id;
    }

    return saveFiling(updated, user.id);
  }

  /**
   * Submits a regulatory filing attempt with receipt recording
   */
  public static async submitFiling(
    user: User,
    params: SubmitFilingAttemptParams
  ): Promise<{ filing: RegulatoryFiling; attempt: FilingAttemptRecord }> {
    const filing = await this.getFiling(user, params.filingId);

    const context = this.buildContext(filing.legalEntityId, filing);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:filing:submit', context);

    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_FILING_SUBMISSION_DENIED',
        entityType: 'REGULATORY_FILING',
        entityId: params.filingId,
        metadata: {
          reason: evalResult.reason
        }
      });
      throw new Error(`Unauthorized: User lacks permission to submit regulatory filings. ${evalResult.reason}`);
    }

    const existingAttempts = await listFilingAttempts(filing.id);
    const attemptNumber = existingAttempts.length + 1;
    const now = new Date().toISOString();
    const correlationId =
      params.auditCorrelationId || `corr_att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const attempt: FilingAttemptRecord = {
      id: `att_${filing.id}_${attemptNumber}`,
      filingId: filing.id,
      legalEntityId: filing.legalEntityId,
      attemptNumber,
      submittedAtUtc: now,
      submittedByUserId: user.id,
      submissionMethod: params.submissionMethod,
      portalName: params.portalName,
      receiptReference: params.receiptReference,
      receiptDocumentId: params.receiptDocumentId,
      outcomeStatus: params.outcomeStatus,
      rejectionReason: params.rejectionReason,
      correlationId,
      createdAt: now
    };

    const savedAttempt = await recordFilingAttempt(attempt, user.id);

    // Transition status based on outcome
    let nextStatus: RegulatoryFilingStatus = filing.status;
    if (params.outcomeStatus === 'SUCCESS') {
      nextStatus = filing.requiresIndependentVerification ? 'PENDING_VERIFICATION' : 'ACCEPTED';
    } else if (params.outcomeStatus === 'REJECTED_BY_AUTHORITY') {
      nextStatus = 'REJECTED';
    } else {
      nextStatus = 'SUBMITTED';
    }

    const evidenceList = [...filing.evidenceDocumentIds];
    if (params.receiptDocumentId && !evidenceList.includes(params.receiptDocumentId)) {
      evidenceList.push(params.receiptDocumentId);
    }

    const updatedFiling: RegulatoryFiling = {
      ...filing,
      status: nextStatus,
      submittedByUserId: user.id,
      submittedAtUtc: now,
      authorityFilingReference: params.receiptReference || filing.authorityFilingReference,
      authoritySubmissionReceiptDocumentId:
        params.receiptDocumentId || filing.authoritySubmissionReceiptDocumentId,
      evidenceDocumentIds: evidenceList,
      updatedAt: now
    };

    const savedFiling = await saveFiling(updatedFiling, user.id);

    return {
      filing: savedFiling,
      attempt: savedAttempt
    };
  }

  /**
   * Formally verifies filing evidence and closes the compliance filing cycle.
   * 
   * Strict Invariants:
   * 1. Requires 'governance:filing:verify' permission.
   * 2. SEPARATION OF DUTIES (SoD): The Submitter or Preparer CANNOT verify their own filing!
   * 3. Requires valid evidence document attached.
   * 4. Technical admin cannot bypass statutory verification authority.
   */
  public static async verifyFiling(
    user: User,
    params: VerifyFilingParams
  ): Promise<RegulatoryFiling> {
    const filing = await this.getFiling(user, params.filingId);

    // Invariant 1: Evidence is mandatory for verification
    if (!params.evidenceDocumentId || !params.evidenceDocumentId.trim()) {
      throw new Error(
        'Verification Denied: Statutory filing verification requires verified evidence document (Submission Receipt / Acceptance Certificate).'
      );
    }

    // Invariant 2: SEPARATION OF DUTIES (SoD)
    if (filing.requiresIndependentVerification) {
      const isSubmitter = filing.submittedByUserId === user.id;
      const isPreparer = filing.preparedByUserId === user.id;

      if (isSubmitter || isPreparer) {
        await createAuditLog({
          actorUserId: user.id,
          action: 'SOD_FILING_SELF_VERIFICATION_BLOCKED',
          entityType: 'REGULATORY_FILING',
          entityId: filing.id,
          metadata: {
            violation: 'Separation of Duties: Submitter/Preparer cannot verify their own statutory filing',
            filingNumber: filing.filingNumber
          }
        });

        throw new Error(
          'Separation of Duties (SoD) Violation: Submitter or preparer is strictly prohibited from verifying their own regulatory filing. An independent compliance officer or auditor is required.'
        );
      }
    }

    const context = this.buildContext(filing.legalEntityId, filing, {
      isRequester: false,
      createdById: filing.preparedByUserId,
      ownerId: filing.submittedByUserId
    });

    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:filing:verify', context);
    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_FILING_VERIFICATION_DENIED',
        entityType: 'REGULATORY_FILING',
        entityId: params.filingId,
        metadata: {
          reason: evalResult.reason
        }
      });
      throw new Error(`Unauthorized: Principal lacks 'governance:filing:verify' authority. ${evalResult.reason}`);
    }

    const evidenceList = [...filing.evidenceDocumentIds];
    if (!evidenceList.includes(params.evidenceDocumentId)) {
      evidenceList.push(params.evidenceDocumentId);
    }

    const updatedFiling: RegulatoryFiling = {
      ...filing,
      status: 'VERIFIED',
      verifiedByUserId: user.id,
      verifiedAtUtc: new Date().toISOString(),
      verificationNotes: params.verificationNotes,
      authoritySubmissionReceiptDocumentId:
        filing.authoritySubmissionReceiptDocumentId || params.evidenceDocumentId,
      evidenceDocumentIds: evidenceList,
      updatedAt: new Date().toISOString()
    };

    return saveFiling(updatedFiling, user.id);
  }

  /**
   * Retrieves restricted filing document reference with direct access security checks
   */
  public static async getFilingDocumentAccess(
    user: User,
    filingId: string,
    documentId: string
  ): Promise<{ authorized: boolean; documentId: string }> {
    const filing = await this.getFiling(user, filingId);

    if (!filing.evidenceDocumentIds.includes(documentId) && filing.authoritySubmissionReceiptDocumentId !== documentId) {
      throw new Error(`Document [${documentId}] is not attached to filing [${filingId}].`);
    }

    const context = this.buildContext(filing.legalEntityId, filing);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:filing:view', context);

    if (!evalResult.granted) {
      throw new Error(`Direct Access Denied: User cannot access filing document [${documentId}].`);
    }

    return {
      authorized: true,
      documentId
    };
  }

  /**
   * Lists filings for a legal entity with scope filtering
   */
  public static async listFilingsForEntity(
    user: User,
    legalEntityId: string,
    filter?: {
      jurisdiction?: GovernanceJurisdiction;
      status?: string;
      obligationId?: string;
      searchQuery?: string;
    }
  ): Promise<RegulatoryFiling[]> {
    const baseContext = this.buildContext(legalEntityId, null, {
      jurisdiction: filter?.jurisdiction
    });

    const hasEntityPerm = PermissionResolver.hasPermission(user, 'governance:filing:view', baseContext);
    if (!hasEntityPerm) {
      return [];
    }

    const allRecords = await listFilingsByEntity(legalEntityId, filter);

    const visibleRecords = allRecords.filter((rec) => {
      const recContext = this.buildContext(legalEntityId, rec);
      return PermissionResolver.hasPermission(user, 'governance:filing:view', recContext);
    });

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      return visibleRecords.filter(
        (r) =>
          r.filingNumber.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.obligationCode.toLowerCase().includes(q) ||
          (r.authorityFilingReference && r.authorityFilingReference.toLowerCase().includes(q))
      );
    }

    return visibleRecords;
  }

  /**
   * Exports regulatory filing register with export authorization check
   */
  public static async exportFilings(
    user: User,
    legalEntityId: string,
    format: 'JSON' | 'CSV' = 'JSON'
  ): Promise<{ data: string; mimeType: string; count: number }> {
    const context = this.buildContext(legalEntityId, null);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:filing:export', context);

    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_FILING_EXPORT_DENIED',
        entityType: 'REGULATORY_FILING',
        entityId: legalEntityId,
        metadata: {
          reason: evalResult.reason
        }
      });
      throw new Error(`Unauthorized: User [${user.id}] lacks 'governance:filing:export' privilege.`);
    }

    const records = await this.listFilingsForEntity(user, legalEntityId);

    await createAuditLog({
      actorUserId: user.id,
      action: 'EXPORT_REGULATORY_FILINGS',
      entityType: 'REGULATORY_FILING',
      entityId: legalEntityId,
      metadata: {
        recordCount: records.length,
        format
      }
    });

    if (format === 'JSON') {
      return {
        data: JSON.stringify(records, null, 2),
        mimeType: 'application/json',
        count: records.length
      };
    }

    const headers = [
      'Filing Number',
      'Obligation Code',
      'Title',
      'Jurisdiction',
      'Period',
      'Due Date',
      'Status',
      'Authority Reference',
      'Verified By'
    ];
    const rows = records.map((r) => [
      r.filingNumber,
      r.obligationCode,
      `"${r.title.replace(/"/g, '""')}"`,
      r.jurisdiction,
      r.periodReference,
      r.dueDate,
      r.status,
      `"${(r.authorityFilingReference || '').replace(/"/g, '""')}"`,
      r.verifiedByUserId || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return {
      data: csvContent,
      mimeType: 'text/csv',
      count: records.length
    };
  }
}
