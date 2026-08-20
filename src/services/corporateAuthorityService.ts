/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Authority, Policies, DoA & PoA Service
 * Step GOV-10: Enterprise Policies, Internal Controls, Delegation of Authority, Financial Authority Matrix & Power of Attorney
 * 
 * Core Architectural Mandates:
 * 1. Enterprise Corporate Policies & Versioning: Strict lifecycle, mandatory Board Resolution backing (GOV-06), DMS & Evidence Vault integration (GOV-09).
 * 2. Internal Controls Framework: Preventive, detective, and corrective controls with effectiveness tracking.
 * 3. Delegation of Authority (DoA): Strict temporal validity boundaries, auto-expiration, sub-delegation authorization checks, early revocation with full provenance.
 * 4. Financial Authority Matrix: Tiered approval thresholds (Manager -> CFO -> CEO -> Board), multi-currency normalization, dual-authorization enforcement.
 * 5. Anti-Circumvention & Anti-Self-Approval: Split-transaction detection within sliding time windows, self-approval blocking (SoD).
 * 6. Technical Admin Bypass Prevention: Technical administrators without statutory corporate authority are strictly DENIED executing financial approvals.
 * 7. Power of Attorney (PoA): Notarized legal instrument tracking, scope enforcement, monetary caps, and immediate invalidation on revocation.
 * 8. Prohibited Hard Deletion: All statutory governance records are permanent and immutable.
 */

import {
  CorporatePolicy,
  CorporatePolicyVersion,
  InternalControl,
  DelegationOfAuthority,
  FinancialApprovalMatrixRule,
  PowerOfAttorney,
  AuthorityEvaluationRequest,
  AuthorityEvaluationResult,
  SplitTransactionRiskResult,
  FinancialTransactionType,
  GovernancePolicyCategory
} from '../types/corporateGovernance';
import {
  getCorporatePolicyById,
  getCorporatePolicyByCode,
  getCorporatePolicies,
  saveCorporatePolicy,
  getCorporatePolicyVersionById,
  getCorporatePolicyVersions,
  saveCorporatePolicyVersion,
  getInternalControlById,
  getInternalControlByCode,
  getInternalControls,
  saveInternalControl,
  getDelegationById,
  getDelegations,
  getActiveDelegationsForUser,
  saveDelegation,
  getFinancialAuthorityRuleById,
  getFinancialAuthorityRules,
  saveFinancialAuthorityRule,
  getPowerOfAttorneyById,
  getPowerOfAttorneyByNumber,
  getPowersOfAttorney,
  savePowerOfAttorney,
  deleteCorporateAuthorityRecordProhibited
} from '../db/repositories/corporateAuthorityRepository';
import { getCorporateDecisionById } from '../db/repositories/corporateGovernanceRepository';
import { getDocumentById, getDocumentVersionById } from '../db/repositories/documentRepository';
import { saveEvidenceRecord, getEvidenceRecordById } from '../db/repositories/corporateRecordsRepository';
import { ABACEngine } from '../lib/permissions/abacEngine';
import { ValidationError, PermissionError } from '../db/validation';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { UserContext } from '../types/permissions';

// Currency exchange rates relative to SAR (Saudi Riyal base standard)
const FX_RATES_TO_SAR: Record<string, number> = {
  SAR: 1.0,
  USD: 3.75,
  EUR: 4.05,
  GBP: 4.80,
  AED: 1.02
};

export class CorporateAuthorityService {
  // ==========================================================================
  // 1. CORPORATE POLICIES & POLICY VERSIONS
  // ==========================================================================

  /**
   * Create a new corporate policy container
   */
  static async createPolicy(
    input: {
      id?: string;
      policyCode?: string;
      title: string;
      category: GovernancePolicyCategory;
      legalEntityScope: string[];
      departmentScope?: string[];
      ownerUserId: string;
      ownerRole: string;
      mandatoryReviewFrequencyMonths?: number;
      classificationClearance?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    },
    userContext: UserContext
  ): Promise<CorporatePolicy> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:policy:create',
      {
        user: userContext,
        legalEntityId: input.legalEntityScope[0] === 'ALL' ? undefined : input.legalEntityScope[0]
      }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:policy:create' to create corporate policies`
      );
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError('Policy title is required');
    }

    const year = new Date().getFullYear();
    const policyCode = input.policyCode?.trim().toUpperCase() || 
      `POL-${input.category.substring(0, 3)}-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await getCorporatePolicyByCode(policyCode);
    if (existing) {
      throw new ValidationError(`Policy with code ${policyCode} already exists`);
    }

    const policyId = input.id || `pol_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const policy: CorporatePolicy = {
      id: policyId,
      policyCode,
      title: input.title.trim(),
      category: input.category,
      legalEntityScope: input.legalEntityScope && input.legalEntityScope.length > 0 ? input.legalEntityScope : ['ALL'],
      departmentScope: input.departmentScope,
      ownerUserId: input.ownerUserId || userContext.userId,
      ownerRole: input.ownerRole || userContext.role,
      mandatoryReviewFrequencyMonths: input.mandatoryReviewFrequencyMonths || 12,
      activeVersionNumber: 0,
      lifecycleStatus: 'DRAFT',
      classificationClearance: input.classificationClearance || 'INTERNAL',
      createdAt: now,
      updatedAt: now
    };

    return await saveCorporatePolicy(policy, userContext.userId);
  }

  /**
   * Draft a new version for an existing policy
   */
  static async draftPolicyVersion(
    input: {
      id?: string;
      policyId: string;
      documentId?: string;
      documentVersionId?: string;
      contentSummary: string;
      fullPolicyText?: string;
      supportingDecisionId: string; // Mandatory Board Resolution (GOV-06)
      effectiveFrom?: string;
      effectiveUntil?: string;
      reviewDate?: string;
    },
    userContext: UserContext
  ): Promise<CorporatePolicyVersion> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:policy:create',
      { user: userContext }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:policy:create' to draft policy versions`
      );
    }

    const policy = await getCorporatePolicyById(input.policyId);
    if (!policy) {
      throw new ValidationError(`Corporate Policy ${input.policyId} does not exist`);
    }

    if (policy.lifecycleStatus === 'REVOKED' || policy.lifecycleStatus === 'ARCHIVED') {
      throw new ValidationError(`Cannot draft new version for ${policy.lifecycleStatus} policy`);
    }

    if (!input.contentSummary || input.contentSummary.trim().length === 0) {
      throw new ValidationError('Policy version content summary is required');
    }

    if (!input.supportingDecisionId) {
      throw new ValidationError('Supporting Board/Executive Decision ID is mandatory for policy versions');
    }

    // Verify Board Decision from GOV-06
    const decision = await getCorporateDecisionById(input.supportingDecisionId);
    if (!decision) {
      throw new ValidationError(
        `Supporting Corporate Decision ${input.supportingDecisionId} does not exist in Governance Repository`
      );
    }

    // Verify DMS Document and Version if provided (GOV-09 integration)
    if (input.documentId) {
      const doc = await getDocumentById(input.documentId);
      if (!doc) {
        throw new ValidationError(`Linked DMS Document ${input.documentId} does not exist`);
      }
      if (input.documentVersionId) {
        const docVer = await getDocumentVersionById(input.documentVersionId);
        if (!docVer || docVer.documentId !== input.documentId) {
          throw new ValidationError(
            `Linked DMS Document Version ${input.documentVersionId} does not match document ${input.documentId}`
          );
        }
      }
    }

    const existingVersions = await getCorporatePolicyVersions(policy.id);
    const nextVersionNumber = existingVersions.length > 0
      ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1
      : 1;

    const versionId = input.id || `pol_ver_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const reviewDate = input.reviewDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const version: CorporatePolicyVersion = {
      id: versionId,
      policyId: policy.id,
      versionNumber: nextVersionNumber,
      documentId: input.documentId,
      documentVersionId: input.documentVersionId,
      contentSummary: input.contentSummary.trim(),
      fullPolicyText: input.fullPolicyText,
      supportingDecisionId: input.supportingDecisionId,
      effectiveFrom: input.effectiveFrom || now,
      effectiveUntil: input.effectiveUntil,
      reviewDate,
      approvedByUserIds: [],
      evidenceRecordIds: [],
      createdAt: now,
      updatedAt: now
    };

    return await saveCorporatePolicyVersion(version, userContext.userId);
  }

  /**
   * Approve & Publish a Policy Version (Requires Executive/Board Authority)
   */
  static async approveAndPublishPolicyVersion(
    input: {
      versionId: string;
      auditCorrelationId?: string;
    },
    userContext: UserContext
  ): Promise<{ policy: CorporatePolicy; version: CorporatePolicyVersion }> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:policy:approve',
      { user: userContext }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:policy:approve' to approve and publish policies`
      );
    }

    const version = await getCorporatePolicyVersionById(input.versionId);
    if (!version) {
      throw new ValidationError(`Policy Version ${input.versionId} does not exist`);
    }

    const policy = await getCorporatePolicyById(version.policyId);
    if (!policy) {
      throw new ValidationError(`Policy ${version.policyId} does not exist`);
    }

    // Verify Supporting Board Resolution is passed/approved
    const decision = await getCorporateDecisionById(version.supportingDecisionId);
    if (!decision) {
      throw new ValidationError(
        `Mandatory Board Decision ${version.supportingDecisionId} backing this policy does not exist`
      );
    }

    const validDecisionStates = ['RESOLUTION', 'APPROVED', 'RATIFIED'];
    if (!validDecisionStates.includes(decision.lifecycleStatus)) {
      throw new ValidationError(
        `Cannot publish policy version: Supporting Board Decision ${decision.id} is in status '${decision.lifecycleStatus}', must be one of: ${validDecisionStates.join(', ')}`
      );
    }

    const now = new Date().toISOString();

    // Mark previous versions as superseded
    const allVersions = await getCorporatePolicyVersions(policy.id);
    for (const otherVer of allVersions) {
      if (otherVer.id !== version.id && otherVer.versionNumber < version.versionNumber && !otherVer.supersededByVersionId) {
        const updatedOther: CorporatePolicyVersion = {
          ...otherVer,
          supersededByVersionId: version.id,
          updatedAt: now
        };
        await saveCorporatePolicyVersion(updatedOther, userContext.userId);
      }
    }

    // Update active version
    const updatedVersion: CorporatePolicyVersion = {
      ...version,
      approvedByUserIds: Array.from(new Set([...version.approvedByUserIds, userContext.userId])),
      updatedAt: now
    };
    await saveCorporatePolicyVersion(updatedVersion, userContext.userId);

    // Update policy active version and state
    const updatedPolicy: CorporatePolicy = {
      ...policy,
      activeVersionNumber: version.versionNumber,
      activeVersionId: version.id,
      lifecycleStatus: 'APPROVED',
      updatedAt: now
    };
    const savedPolicy = await saveCorporatePolicy(updatedPolicy, userContext.userId);

    return { policy: savedPolicy, version: updatedVersion };
  }

  // ==========================================================================
  // 2. INTERNAL CONTROLS FRAMEWORK
  // ==========================================================================

  /**
   * Register a new internal control mapped to a policy
   */
  static async registerInternalControl(
    input: {
      id?: string;
      controlCode?: string;
      title: string;
      description: string;
      policyId?: string;
      policyVersionId?: string;
      legalEntityId: string;
      controlType: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
      frequency: 'CONTINUOUS' | 'TRANSACTIONAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
      ownerUserId: string;
      ownerRole: string;
      isAutomated?: boolean;
      evidenceRequirement?: string;
    },
    userContext: UserContext
  ): Promise<InternalControl> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:control:create',
      { user: userContext, legalEntityId: input.legalEntityId }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:control:create'`
      );
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError('Internal control title is required');
    }

    if (input.policyId) {
      const policy = await getCorporatePolicyById(input.policyId);
      if (!policy) {
        throw new ValidationError(`Linked Corporate Policy ${input.policyId} does not exist`);
      }
    }

    const controlCode = input.controlCode?.trim().toUpperCase() ||
      `CTL-${input.controlType.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await getInternalControlByCode(controlCode);
    if (existing) {
      throw new ValidationError(`Control with code ${controlCode} already exists`);
    }

    const controlId = input.id || `ctl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const control: InternalControl = {
      id: controlId,
      controlCode,
      title: input.title.trim(),
      description: input.description || '',
      policyId: input.policyId,
      policyVersionId: input.policyVersionId,
      legalEntityId: input.legalEntityId,
      controlType: input.controlType,
      frequency: input.frequency,
      ownerUserId: input.ownerUserId || userContext.userId,
      ownerRole: input.ownerRole || userContext.role,
      isAutomated: input.isAutomated || false,
      status: 'ACTIVE',
      operatingEffectiveness: 'UNTESTED',
      evidenceRequirement: input.evidenceRequirement,
      auditCorrelationId: `cor_ctl_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    return await saveInternalControl(control, userContext.userId);
  }

  /**
   * Test and record operating effectiveness of an internal control
   */
  static async testInternalControl(
    input: {
      controlId: string;
      operatingEffectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT';
      testingNotes: string;
      evidenceRecordId?: string;
      nextTestDueDate?: string;
    },
    userContext: UserContext
  ): Promise<InternalControl> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:control:test',
      { user: userContext }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:control:test'`
      );
    }

    const control = await getInternalControlById(input.controlId);
    if (!control) {
      throw new ValidationError(`Internal Control ${input.controlId} does not exist`);
    }

    if (input.evidenceRecordId) {
      const evidence = await getEvidenceRecordById(input.evidenceRecordId);
      if (!evidence) {
        throw new ValidationError(`Evidence Record ${input.evidenceRecordId} does not exist`);
      }
    }

    const now = new Date().toISOString();
    const updated: InternalControl = {
      ...control,
      operatingEffectiveness: input.operatingEffectiveness,
      lastTestedAt: now,
      lastTestedByUserId: userContext.userId,
      nextTestDueDate: input.nextTestDueDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now
    };

    return await saveInternalControl(updated, userContext.userId);
  }

  // ==========================================================================
  // 3. DELEGATION OF AUTHORITY (DoA)
  // ==========================================================================

  /**
   * Grant a formal Delegation of Authority
   */
  static async grantDelegation(
    input: {
      id?: string;
      delegationNumber?: string;
      legalEntityId: string;
      delegatorUserId: string;
      delegatorRole: string;
      delegateUserId: string;
      delegateRole: string;
      authorityType: 'FINANCIAL_APPROVAL' | 'LEGAL_SIGNATURE' | 'CUSTOMS_CLEARANCE' | 'HR_PERSONNEL' | 'OPERATIONAL_DISPATCH';
      scopeLevel: 'LEGAL_ENTITY' | 'BRANCH' | 'DEPARTMENT' | 'TRANSACTION';
      scopeDepartmentId?: string;
      allowedTransactionTypes?: FinancialTransactionType[];
      amountLimit?: number;
      currency?: string;
      maxInstallmentsAllowed?: number;
      isSubDelegationAllowed?: boolean;
      parentDelegationId?: string;
      effectiveFrom?: string;
      effectiveUntil: string; // Mandatory auto-expiring ISO date
      supportingDecisionId?: string;
      supportingPoAId?: string;
      reason: string;
    },
    userContext: UserContext
  ): Promise<DelegationOfAuthority> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:delegation:create',
      { user: userContext, legalEntityId: input.legalEntityId }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:delegation:create'`
      );
    }

    // Invariant: Technical admin cannot delegate financial/statutory powers
    if (['SYSTEM_ADMIN', 'IT_ADMIN'].includes(userContext.role) && !['CEO', 'CFO', 'EXECUTIVE_DIRECTOR'].includes(input.delegatorRole)) {
      throw new PermissionError(
        'Technical Administrator without statutory corporate authority is strictly prohibited from granting corporate delegations'
      );
    }

    if (!input.effectiveUntil) {
      throw new ValidationError('Delegation must include a mandatory expiration date (effectiveUntil)');
    }

    const effectiveFrom = input.effectiveFrom || new Date().toISOString();
    if (new Date(effectiveFrom) >= new Date(input.effectiveUntil)) {
      throw new ValidationError('Delegation effectiveUntil date must be strictly after effectiveFrom date');
    }

    // Check self-delegation
    if (input.delegatorUserId === input.delegateUserId) {
      throw new ValidationError('Delegator cannot self-delegate powers to themselves');
    }

    // Sub-delegation checks
    if (input.parentDelegationId) {
      const parent = await getDelegationById(input.parentDelegationId);
      if (!parent) {
        throw new ValidationError(`Parent Delegation ${input.parentDelegationId} does not exist`);
      }
      if (parent.status !== 'ACTIVE') {
        throw new ValidationError(`Parent Delegation is ${parent.status}, cannot sub-delegate`);
      }
      if (!parent.isSubDelegationAllowed) {
        throw new PermissionError('Sub-delegation is strictly prohibited under the parent delegation terms');
      }
      // Sub-delegation limit cannot exceed parent limit
      if (input.amountLimit && parent.amountLimit && input.amountLimit > parent.amountLimit) {
        throw new ValidationError(
          `Sub-delegation amount limit (${input.amountLimit}) cannot exceed parent delegation limit (${parent.amountLimit})`
        );
      }
    }

    const year = new Date().getFullYear();
    const delegationNumber = input.delegationNumber?.trim().toUpperCase() ||
      `DOA-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const delegationId = input.id || `doa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const delegation: DelegationOfAuthority = {
      id: delegationId,
      delegationNumber,
      legalEntityId: input.legalEntityId,
      delegatorUserId: input.delegatorUserId,
      delegatorRole: input.delegatorRole,
      delegateUserId: input.delegateUserId,
      delegateRole: input.delegateRole,
      authorityType: input.authorityType,
      scopeLevel: input.scopeLevel,
      scopeDepartmentId: input.scopeDepartmentId,
      allowedTransactionTypes: input.allowedTransactionTypes || ['EXPENDITURE', 'VENDOR_PAYMENT'],
      amountLimit: input.amountLimit,
      currency: input.currency || 'SAR',
      maxInstallmentsAllowed: input.maxInstallmentsAllowed,
      isSubDelegationAllowed: input.isSubDelegationAllowed || false,
      parentDelegationId: input.parentDelegationId,
      effectiveFrom,
      effectiveUntil: input.effectiveUntil,
      supportingDecisionId: input.supportingDecisionId,
      supportingPoAId: input.supportingPoAId,
      reason: input.reason || 'Standard operational delegation of statutory authority',
      status: 'ACTIVE',
      auditCorrelationId: `cor_doa_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    return await saveDelegation(delegation, userContext.userId);
  }

  /**
   * Revoke an active Delegation of Authority
   */
  static async revokeDelegation(
    input: {
      delegationId: string;
      revocationReason: string;
    },
    userContext: UserContext
  ): Promise<DelegationOfAuthority> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:delegation:delete',
      { user: userContext }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:delegation:delete' to revoke delegations`
      );
    }

    if (!input.revocationReason || input.revocationReason.trim().length === 0) {
      throw new ValidationError('Mandatory revocation reason must be provided');
    }

    const delegation = await getDelegationById(input.delegationId);
    if (!delegation) {
      throw new ValidationError(`Delegation of Authority ${input.delegationId} does not exist`);
    }

    if (delegation.status === 'REVOKED') {
      throw new ValidationError(`Delegation ${delegation.delegationNumber} is already revoked`);
    }

    const now = new Date().toISOString();
    const updated: DelegationOfAuthority = {
      ...delegation,
      status: 'REVOKED',
      revokedAt: now,
      revokedByUserId: userContext.userId,
      revocationReason: input.revocationReason.trim(),
      updatedAt: now
    };

    return await saveDelegation(updated, userContext.userId);
  }

  // ==========================================================================
  // 4. FINANCIAL AUTHORITY MATRIX & TRANSACTION EVALUATION ENGINE
  // ==========================================================================

  /**
   * Configure or update a Financial Approval Matrix Rule
   */
  static async configureAuthorityRule(
    input: {
      id?: string;
      ruleCode?: string;
      legalEntityId: string;
      departmentId?: string;
      supportingPolicyVersionId?: string;
      supportingDecisionId?: string;
      transactionType: FinancialTransactionType;
      minAmount: number;
      maxAmount: number | null;
      currency?: 'SAR' | 'USD' | 'EUR' | 'GBP';
      tierLevel: number;
      requiredAuthorityRole: string;
      requiredApprovalLevels?: number;
      dualApprovalRequired?: boolean;
      secondaryApprovalRole?: string;
      antiSelfApprovalEnforced?: boolean;
      requiresBoardResolution?: boolean;
      splitDetectionWindowHours?: number;
    },
    userContext: UserContext
  ): Promise<FinancialApprovalMatrixRule> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:authority_matrix:create',
      {
        user: userContext,
        legalEntityId: input.legalEntityId === 'GLOBAL' ? undefined : input.legalEntityId
      }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:authority_matrix:create'`
      );
    }

    const ruleCode = input.ruleCode?.trim().toUpperCase() ||
      `FAM-${input.transactionType.substring(0, 3)}-L${input.tierLevel}-${Math.floor(1000 + Math.random() * 9000)}`;

    const ruleId = input.id || `fam_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const rule: FinancialApprovalMatrixRule = {
      id: ruleId,
      ruleCode,
      legalEntityId: input.legalEntityId,
      departmentId: input.departmentId || 'ALL',
      supportingPolicyVersionId: input.supportingPolicyVersionId,
      supportingDecisionId: input.supportingDecisionId,
      transactionType: input.transactionType,
      minAmount: input.minAmount,
      maxAmount: input.maxAmount,
      currency: input.currency || 'SAR',
      tierLevel: input.tierLevel,
      requiredAuthorityRole: input.requiredAuthorityRole,
      requiredApprovalLevels: input.requiredApprovalLevels || 1,
      dualApprovalRequired: input.dualApprovalRequired || false,
      secondaryApprovalRole: input.secondaryApprovalRole,
      antiSelfApprovalEnforced: input.antiSelfApprovalEnforced ?? true,
      requiresBoardResolution: input.requiresBoardResolution || false,
      splitDetectionWindowHours: input.splitDetectionWindowHours || 24,
      effectiveFrom: now,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };

    return await saveFinancialAuthorityRule(rule, userContext.userId);
  }

  /**
   * Currency Normalization Utility
   */
  static normalizeCurrency(amount: number, fromCurrency: string, toCurrency: string = 'SAR'): number {
    const fromRate = FX_RATES_TO_SAR[fromCurrency.toUpperCase()] || 1.0;
    const toRate = FX_RATES_TO_SAR[toCurrency.toUpperCase()] || 1.0;
    const inSAR = amount * fromRate;
    return inSAR / toRate;
  }

  /**
   * Split-Transaction Circumvention Detector
   * Analyzes recent transactions from the same requester to detect smurfing/splitting around thresholds.
   */
  static detectSplitTransactionCircumvention(
    recentTransactions: Array<{ amount: number; currency: string; timestamp: string }>,
    currentAmount: number,
    currentCurrency: string,
    tierThresholdSAR: number,
    windowHours: number = 24
  ): SplitTransactionRiskResult {
    const now = Date.now();
    const windowMs = windowHours * 60 * 60 * 1000;

    let cumulativeSAR = CorporateAuthorityService.normalizeCurrency(currentAmount, currentCurrency, 'SAR');
    let matchingCount = 1;

    for (const tx of recentTransactions) {
      const txTime = new Date(tx.timestamp).getTime();
      if (now - txTime <= windowMs) {
        cumulativeSAR += CorporateAuthorityService.normalizeCurrency(tx.amount, tx.currency, 'SAR');
        matchingCount++;
      }
    }

    if (cumulativeSAR > tierThresholdSAR && matchingCount > 1) {
      return {
        isSplitDetected: true,
        detectedTransactionsCount: matchingCount,
        cumulativeAmount: cumulativeSAR,
        thresholdAmount: tierThresholdSAR,
        windowHours,
        riskSeverity: cumulativeSAR > tierThresholdSAR * 1.5 ? 'CRITICAL' : 'HIGH',
        reason: `Split-transaction pattern detected: ${matchingCount} cumulative transactions totaling ${cumulativeSAR.toFixed(2)} SAR exceed single-approver threshold (${tierThresholdSAR} SAR) within ${windowHours}h window.`
      };
    }

    return {
      isSplitDetected: false,
      detectedTransactionsCount: matchingCount,
      cumulativeAmount: cumulativeSAR,
      thresholdAmount: tierThresholdSAR,
      windowHours,
      riskSeverity: 'NONE'
    };
  }

  /**
   * Multi-Dimensional Authority Evaluation Engine
   * Evaluates if a given approver has statutory authority to approve a transaction.
   */
  static async evaluateAuthority(
    request: AuthorityEvaluationRequest,
    recentHistory: Array<{ amount: number; currency: string; timestamp: string }> = []
  ): Promise<AuthorityEvaluationResult> {
    const correlationId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = request.timestamp || new Date().toISOString();

    // 1. Technical Admin Bypass Check
    const technicalRoles = ['SYSTEM_ADMIN', 'IT_ADMIN', 'DATABASE_ADMIN'];
    if (technicalRoles.includes(request.approverRole)) {
      return {
        isAuthorized: false,
        denialCode: 'TECHNICAL_ADMIN_BYPASS_BLOCKED',
        reason: `Technical role '${request.approverRole}' cannot approve financial transactions without explicit statutory executive appointment or Delegation of Authority`,
        normalizedAmount: request.amount,
        baseCurrency: request.currency,
        requiredTier: 1,
        requiredRoles: ['FINANCE_MANAGER', 'CFO', 'CEO'],
        dualApprovalRequired: false,
        escalationRequired: true,
        escalationTarget: 'CFO',
        auditCorrelationId: correlationId
      };
    }

    // 2. Anti-Self-Approval Enforcement (Separation of Duties)
    if (request.approverUserId === request.requesterUserId) {
      return {
        isAuthorized: false,
        denialCode: 'SELF_APPROVAL_PROHIBITED',
        reason: 'Separation of Duties (SoD) violation: Requester cannot approve their own financial or operational transaction',
        normalizedAmount: request.amount,
        baseCurrency: request.currency,
        requiredTier: 1,
        requiredRoles: ['INDEPENDENT_APPROVER'],
        dualApprovalRequired: false,
        escalationRequired: true,
        escalationTarget: 'CFO',
        auditCorrelationId: correlationId
      };
    }

    // 3. Legal-Entity Isolation Enforcement
    if (request.approverLegalEntityId && request.approverLegalEntityId !== request.legalEntityId && !request.supportingPoAId) {
      return {
        isAuthorized: false,
        denialCode: 'WRONG_LEGAL_ENTITY',
        reason: `Approver legal entity ${request.approverLegalEntityId} cannot approve transactions for legal entity ${request.legalEntityId} without an explicit Power of Attorney`,
        normalizedAmount: request.amount,
        baseCurrency: request.currency,
        requiredTier: 1,
        requiredRoles: ['AUTHORIZED_ENTITY_APPROVER'],
        dualApprovalRequired: false,
        escalationRequired: true,
        escalationTarget: 'CFO',
        auditCorrelationId: correlationId
      };
    }

    // 4. Currency Normalization to SAR
    const normalizedAmountSAR = CorporateAuthorityService.normalizeCurrency(
      request.amount,
      request.currency,
      'SAR'
    );

    // 5. Check Power of Attorney (if acting under PoA)
    let matchedPoA: PowerOfAttorney | undefined;
    if (request.supportingPoAId) {
      const poa = await getPowerOfAttorneyById(request.supportingPoAId);
      if (!poa) {
        return {
          isAuthorized: false,
          denialCode: 'POA_REVOKED_OR_EXPIRED',
          reason: `Referenced Power of Attorney ${request.supportingPoAId} does not exist`,
          normalizedAmount: normalizedAmountSAR,
          baseCurrency: 'SAR',
          requiredTier: 1,
          requiredRoles: [],
          dualApprovalRequired: false,
          escalationRequired: false,
          auditCorrelationId: correlationId
        };
      }

      if (poa.status !== 'ACTIVE' || poa.validUntil < now || poa.validFrom > now) {
        return {
          isAuthorized: false,
          denialCode: 'POA_REVOKED_OR_EXPIRED',
          reason: `Power of Attorney ${poa.poaNumber} is ${poa.status} or outside validity period (${poa.validFrom} to ${poa.validUntil})`,
          matchedPoA: poa,
          normalizedAmount: normalizedAmountSAR,
          baseCurrency: 'SAR',
          requiredTier: 1,
          requiredRoles: [],
          dualApprovalRequired: false,
          escalationRequired: false,
          auditCorrelationId: correlationId
        };
      }

      if (poa.legalEntityId !== request.legalEntityId) {
        return {
          isAuthorized: false,
          denialCode: 'WRONG_LEGAL_ENTITY',
          reason: `Power of Attorney ${poa.poaNumber} belongs to legal entity ${poa.legalEntityId}, not ${request.legalEntityId}`,
          matchedPoA: poa,
          normalizedAmount: normalizedAmountSAR,
          baseCurrency: 'SAR',
          requiredTier: 1,
          requiredRoles: [],
          dualApprovalRequired: false,
          escalationRequired: false,
          auditCorrelationId: correlationId
        };
      }

      if (poa.monetaryLimitAmount) {
        const poaLimitSAR = CorporateAuthorityService.normalizeCurrency(
          poa.monetaryLimitAmount,
          poa.monetaryLimitCurrency || 'SAR',
          'SAR'
        );
        if (normalizedAmountSAR > poaLimitSAR) {
          return {
            isAuthorized: false,
            denialCode: 'THRESHOLD_EXCEEDED',
            reason: `Transaction amount (${normalizedAmountSAR} SAR) exceeds PoA monetary cap (${poaLimitSAR} SAR)`,
            matchedPoA: poa,
            normalizedAmount: normalizedAmountSAR,
            baseCurrency: 'SAR',
            requiredTier: 3,
            requiredRoles: ['CEO', 'BOARD_OF_DIRECTORS'],
            dualApprovalRequired: false,
            escalationRequired: true,
            escalationTarget: 'BOARD_OF_DIRECTORS',
            auditCorrelationId: correlationId
          };
        }
      }

      matchedPoA = poa;
    }

    // 5. Check Active Delegation of Authority
    const userDelegations = await getActiveDelegationsForUser(request.approverUserId, request.legalEntityId);
    let matchedDelegation: DelegationOfAuthority | undefined;

    for (const del of userDelegations) {
      if (del.allowedTransactionTypes.includes(request.transactionType)) {
        if (!del.scopeDepartmentId || del.scopeDepartmentId === request.departmentId) {
          matchedDelegation = del;
          break;
        }
      }
    }

    // 6. Look up Financial Authority Matrix Rules
    const rules = await getFinancialAuthorityRules({
      legalEntityId: request.legalEntityId,
      departmentId: request.departmentId,
      transactionType: request.transactionType,
      status: 'ACTIVE'
    });

    // Find the rule tier matching this transaction amount
    let matchedRule: FinancialApprovalMatrixRule | undefined;
    for (const rule of rules) {
      const minSAR = CorporateAuthorityService.normalizeCurrency(rule.minAmount, rule.currency, 'SAR');
      const maxSAR = rule.maxAmount !== null 
        ? CorporateAuthorityService.normalizeCurrency(rule.maxAmount, rule.currency, 'SAR')
        : Infinity;

      if (normalizedAmountSAR >= minSAR && normalizedAmountSAR <= maxSAR) {
        matchedRule = rule;
        break;
      }
    }

    // If no explicit rule found, default to standard statutory governance tiers
    let requiredRole = matchedRule ? matchedRule.requiredAuthorityRole : 'CEO';
    let requiredTier = matchedRule ? matchedRule.tierLevel : 3;
    let dualApprovalRequired = matchedRule ? matchedRule.dualApprovalRequired : false;
    let requiresBoardResolution = matchedRule ? matchedRule.requiresBoardResolution : false;

    if (!matchedRule) {
      if (normalizedAmountSAR <= 50000) {
        requiredTier = 1;
        requiredRole = 'FINANCE_MANAGER';
        dualApprovalRequired = false;
      } else if (normalizedAmountSAR <= 500000) {
        requiredTier = 2;
        requiredRole = 'CFO';
        dualApprovalRequired = true;
      } else if (normalizedAmountSAR <= 2000000) {
        requiredTier = 3;
        requiredRole = 'CEO';
        dualApprovalRequired = true;
      } else {
        requiredTier = 4;
        requiredRole = 'BOARD_DIRECTOR';
        requiresBoardResolution = true;
      }
    }

    // 7. Split-Transaction Detection
    if (recentHistory && recentHistory.length > 0) {
      const tierThreshold = matchedRule?.maxAmount 
        ? CorporateAuthorityService.normalizeCurrency(matchedRule.maxAmount, matchedRule.currency, 'SAR')
        : (requiredTier === 1 ? 50000 : requiredTier === 2 ? 500000 : 2000000);
      
      const windowHours = matchedRule?.splitDetectionWindowHours || 24;
      const splitCheck = CorporateAuthorityService.detectSplitTransactionCircumvention(
        recentHistory,
        request.amount,
        request.currency,
        tierThreshold,
        windowHours
      );

      if (splitCheck.isSplitDetected) {
        return {
          isAuthorized: false,
          denialCode: 'SPLIT_TRANSACTION_FLAGGED',
          reason: splitCheck.reason || 'Circumvention Risk: Transaction splitting detected across time window',
          evaluatedRule: matchedRule,
          matchedDelegation,
          matchedPoA,
          normalizedAmount: normalizedAmountSAR,
          baseCurrency: 'SAR',
          requiredTier: requiredTier + 1,
          requiredRoles: [requiredRole, 'CFO', 'CEO'],
          dualApprovalRequired: true,
          escalationRequired: true,
          escalationTarget: 'CFO',
          auditCorrelationId: correlationId
        };
      }
    }

    // 8. Board Resolution Requirement Check
    if (requiresBoardResolution) {
      return {
        isAuthorized: false,
        denialCode: 'BOARD_RESOLUTION_REQUIRED',
        reason: `Transaction amount (${normalizedAmountSAR} SAR) requires formal Board Resolution under Corporate Governance Policy`,
        evaluatedRule: matchedRule,
        matchedDelegation,
        matchedPoA,
        normalizedAmount: normalizedAmountSAR,
        baseCurrency: 'SAR',
        requiredTier: 4,
        requiredRoles: ['BOARD_OF_DIRECTORS'],
        dualApprovalRequired: true,
        escalationRequired: true,
        escalationTarget: 'BOARD_OF_DIRECTORS',
        auditCorrelationId: correlationId
      };
    }

    // 9. Check Role & Delegation Limit Matching
    let isRoleAuthorized = false;
    const approverRole = request.approverRole;

    // Role Hierarchy
    const roleTiers: Record<string, number> = {
      TEAM_LEAD: 0,
      FINANCE_MANAGER: 1,
      FINANCE_DIRECTOR: 2,
      CFO: 2,
      MANAGING_DIRECTOR: 3,
      CEO: 3,
      BOARD_DIRECTOR: 4
    };

    const approverTier = roleTiers[approverRole] || 0;

    if (approverTier >= requiredTier) {
      isRoleAuthorized = true;
    } else if (matchedDelegation) {
      // Check if delegation covers the amount
      const delLimitSAR = matchedDelegation.amountLimit !== undefined
        ? CorporateAuthorityService.normalizeCurrency(matchedDelegation.amountLimit, matchedDelegation.currency || 'SAR', 'SAR')
        : 0;

      if (normalizedAmountSAR <= delLimitSAR) {
        isRoleAuthorized = true;
      }
    } else if (matchedPoA) {
      // Check if PoA covers the amount
      const poaLimitSAR = matchedPoA.monetaryLimitAmount !== undefined
        ? CorporateAuthorityService.normalizeCurrency(matchedPoA.monetaryLimitAmount, matchedPoA.monetaryLimitCurrency || 'SAR', 'SAR')
        : Infinity;

      if (normalizedAmountSAR <= poaLimitSAR) {
        isRoleAuthorized = true;
      }
    }

    if (!isRoleAuthorized) {
      const escalationTarget: 'CFO' | 'CEO' | 'BOARD_OF_DIRECTORS' = 
        requiredTier === 2 ? 'CFO' : requiredTier === 3 ? 'CEO' : 'BOARD_OF_DIRECTORS';

      return {
        isAuthorized: false,
        denialCode: 'THRESHOLD_EXCEEDED',
        reason: `Transaction amount (${normalizedAmountSAR} SAR) exceeds role authority limit for '${approverRole}'. Escalation to ${escalationTarget} required.`,
        evaluatedRule: matchedRule,
        matchedDelegation,
        matchedPoA,
        normalizedAmount: normalizedAmountSAR,
        baseCurrency: 'SAR',
        requiredTier,
        requiredRoles: [requiredRole],
        dualApprovalRequired,
        escalationRequired: true,
        escalationTarget,
        auditCorrelationId: correlationId
      };
    }

    return {
      isAuthorized: true,
      reason: 'Transaction is fully authorized under Corporate Authority Matrix and Delegation of Authority rules',
      evaluatedRule: matchedRule,
      matchedDelegation,
      matchedPoA,
      normalizedAmount: normalizedAmountSAR,
      baseCurrency: 'SAR',
      requiredTier,
      requiredRoles: [requiredRole],
      dualApprovalRequired,
      escalationRequired: false,
      auditCorrelationId: correlationId
    };
  }

  // ==========================================================================
  // 5. POWER OF ATTORNEY (PoA)
  // ==========================================================================

  /**
   * Register a new Power of Attorney (PoA)
   */
  static async issuePowerOfAttorney(
    input: {
      id?: string;
      poaNumber?: string;
      legalEntityId: string;
      grantorType: 'BOARD_RESOLUTION' | 'MANAGING_DIRECTOR' | 'CHAIRMAN' | 'LEGAL_ENTITY';
      grantorEntityOrUserId: string;
      grantorSupportingDecisionId?: string;
      granteeType: 'INTERNAL_OFFICER' | 'EXTERNAL_LEGAL_COUNSEL' | 'CUSTOMS_BROKER' | 'COMMERCIAL_AGENT';
      granteeUserId?: string;
      granteeExternalDetails?: {
        fullNameEn: string;
        fullNameAr: string;
        nationalIdOrPassport: string;
        firmOrLawOfficeName?: string;
        professionalLicenseNumber?: string;
      };
      scopeCategory: 'GENERAL_COMMERCIAL' | 'BANKING_OPERATIONS' | 'CUSTOMS_CLEARANCE' | 'LITIGATION_LEGAL' | 'TAX_REPRESENTATION' | 'REAL_ESTATE_LEASING' | 'SPECIFIC_TRANSACTION';
      powersDescription: string;
      limitations?: string;
      monetaryLimitAmount?: number;
      monetaryLimitCurrency?: string;
      isSubDelegationAllowed?: boolean;
      notarizationDetails?: {
        notaryPublicName: string;
        notarizationDate: string;
        notarizationNumber: string;
        apostilleReference?: string;
        statutoryFilingReference?: string;
      };
      documentId?: string;
      evidenceRecordId?: string;
      validFrom?: string;
      validUntil: string;
    },
    userContext: UserContext
  ): Promise<PowerOfAttorney> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:poa:create',
      { user: userContext, legalEntityId: input.legalEntityId }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:poa:create'`
      );
    }

    if (!input.powersDescription || input.powersDescription.trim().length === 0) {
      throw new ValidationError('Power of Attorney description of powers is required');
    }

    if (!input.validUntil) {
      throw new ValidationError('Power of Attorney requires a validUntil expiration date');
    }

    const validFrom = input.validFrom || new Date().toISOString();
    if (new Date(validFrom) >= new Date(input.validUntil)) {
      throw new ValidationError('PoA validUntil date must be strictly after validFrom date');
    }

    // Verify Board Decision if grantor is BOARD_RESOLUTION
    if (input.grantorType === 'BOARD_RESOLUTION') {
      if (!input.grantorSupportingDecisionId) {
        throw new ValidationError('Grantor type BOARD_RESOLUTION requires a supporting Board Decision ID');
      }
      const decision = await getCorporateDecisionById(input.grantorSupportingDecisionId);
      if (!decision) {
        throw new ValidationError(`Supporting Board Decision ${input.grantorSupportingDecisionId} does not exist`);
      }
    }

    // Verify Evidence Record from GOV-09 Vault if provided
    if (input.evidenceRecordId) {
      const evidence = await getEvidenceRecordById(input.evidenceRecordId);
      if (!evidence) {
        throw new ValidationError(`Linked Vault Evidence Record ${input.evidenceRecordId} does not exist`);
      }
    }

    const year = new Date().getFullYear();
    const poaNumber = input.poaNumber?.trim().toUpperCase() ||
      `POA-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await getPowerOfAttorneyByNumber(poaNumber);
    if (existing) {
      throw new ValidationError(`Power of Attorney with number ${poaNumber} already exists`);
    }

    const poaId = input.id || `poa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const poa: PowerOfAttorney = {
      id: poaId,
      poaNumber,
      legalEntityId: input.legalEntityId,
      grantorType: input.grantorType,
      grantorEntityOrUserId: input.grantorEntityOrUserId,
      grantorSupportingDecisionId: input.grantorSupportingDecisionId,
      granteeType: input.granteeType,
      granteeUserId: input.granteeUserId,
      granteeExternalDetails: input.granteeExternalDetails,
      scopeCategory: input.scopeCategory,
      powersDescription: input.powersDescription.trim(),
      limitations: input.limitations || 'None specified',
      monetaryLimitAmount: input.monetaryLimitAmount,
      monetaryLimitCurrency: input.monetaryLimitCurrency || 'SAR',
      isSubDelegationAllowed: input.isSubDelegationAllowed || false,
      notarizationDetails: input.notarizationDetails,
      documentId: input.documentId,
      evidenceRecordId: input.evidenceRecordId,
      validFrom,
      validUntil: input.validUntil,
      status: 'ACTIVE',
      auditCorrelationId: `cor_poa_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    return await savePowerOfAttorney(poa, userContext.userId);
  }

  /**
   * Revoke a Power of Attorney
   */
  static async revokePowerOfAttorney(
    input: {
      poaId: string;
      revocationReason: string;
    },
    userContext: UserContext
  ): Promise<PowerOfAttorney> {
    const isAuth = await ABACEngine.evaluateAccess(
      'governance:poa:revoke',
      { user: userContext }
    );

    if (!isAuth) {
      throw new PermissionError(
        `User ${userContext.userId} lacks required permission 'governance:poa:revoke'`
      );
    }

    if (!input.revocationReason || input.revocationReason.trim().length === 0) {
      throw new ValidationError('Mandatory revocation reason is required');
    }

    const poa = await getPowerOfAttorneyById(input.poaId);
    if (!poa) {
      throw new ValidationError(`Power of Attorney ${input.poaId} does not exist`);
    }

    if (poa.status === 'REVOKED') {
      throw new ValidationError(`Power of Attorney ${poa.poaNumber} is already revoked`);
    }

    const now = new Date().toISOString();
    const updated: PowerOfAttorney = {
      ...poa,
      status: 'REVOKED',
      revokedAt: now,
      revokedByUserId: userContext.userId,
      revocationReason: input.revocationReason.trim(),
      updatedAt: now
    };

    return await savePowerOfAttorney(updated, userContext.userId);
  }

  // ==========================================================================
  // 6. PROHIBITED HARD-DELETE ENFORCEMENT
  // ==========================================================================

  static async deleteRecordProhibited(
    recordType: 'POLICY' | 'POLICY_VERSION' | 'CONTROL' | 'DELEGATION' | 'AUTHORITY_RULE' | 'POWER_OF_ATTORNEY',
    recordId: string,
    userContext: UserContext
  ): Promise<never> {
    return await deleteCorporateAuthorityRecordProhibited(recordType, recordId, userContext.userId);
  }
}
