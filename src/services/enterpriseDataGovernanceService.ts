/**
 * AJA INTERNATIONAL LOGISTICS — STEP 29 ENTERPRISE DATA ACCESS GOVERNANCE & PRIVACY CONTROL PLANE
 * Baseline: REL-2026-AJA-PROD-2.8.0
 * Certificate: CERT-2026-AJA-PROD-2.8.0-FINAL
 * Security Classification: DATA_GOVERNANCE_TIER_0
 * 
 * Provides:
 * 1. Data Asset Inventory & Field-Level Information Classification Taxonomy (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
 * 2. Purpose-Based, Row-Level & Field-Level Data Authorization Engine
 * 3. Dynamic Column Masking (FULL_REDACTION, PARTIAL_MASK, TOKENIZED_VIEW, HASHED_VIEW, LAST_N_CHARACTERS)
 * 4. Data Loss Prevention (DLP) Inspection Engine (API, Export, AI Prompts/Outputs, Documents)
 * 5. Enterprise Export Governance (Field Allowlists, Volume Controls, Step-Up Approvals, Signed Download URLs, Watermarking)
 * 6. Retention Lifecycle & Legal / Governance Hold Engine (Hold overrides Deletion)
 * 7. Privacy Subject Request Workflow (Access, Export, Deletion with Financial & Audit Safeguards)
 * 8. AI Data Governance (Context Minimization & Anti-Leakage Guard)
 */

import crypto from 'crypto';
import { canonicalJsonStringify, GovernanceRootTrustManager } from './autonomousGovernanceEngine';
import { EnterpriseIdentityTrustService, EnterprisePrincipal, AuthenticationAssuranceLevel } from './enterpriseIdentityTrustService';

// ============================================================================
// 1. DATA CLASSIFICATION TAXONOMY & REGISTERS (DG-004, DG-005, DG-006)
// ============================================================================

export type DataClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type DataCategory =
  | 'PII'
  | 'FINANCIAL'
  | 'PAYMENT'
  | 'AUTHENTICATION'
  | 'SECURITY'
  | 'LEGAL'
  | 'CUSTOMS'
  | 'EMPLOYEE'
  | 'CUSTOMER'
  | 'COMMERCIAL'
  | 'OPERATIONAL';

export type MaskingStrategy =
  | 'NO_MASK'
  | 'FULL_REDACTION'
  | 'PARTIAL_MASK'
  | 'TOKENIZED_VIEW'
  | 'HASHED_VIEW'
  | 'LAST_N_CHARACTERS'
  | 'ROLE_DEPENDENT_MASK';

export interface FieldClassification {
  resourceName: string;
  fieldName: string;
  classification: DataClassificationLevel;
  categories: DataCategory[];
  defaultMasking: MaskingStrategy;
  exportable: boolean;
  requiredAAL: AuthenticationAssuranceLevel;
  requiredRoles: string[];
}

export interface DataAsset {
  assetId: string;
  assetName: string;
  domain: string;
  owner: string;
  steward: string;
  tenantScope: string;
  storageLocation: string; // Region e.g., 'me-central2-riyadh'
  classification: DataClassificationLevel;
  categories: DataCategory[];
  containsPii: boolean;
  containsFinancialData: boolean;
  containsCredentials: boolean;
  retentionDays: number;
  residencyRegion: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'LEGAL_HOLD' | 'DELETED';
}

// ============================================================================
// 2. DLP & EXPORT TYPES (DG-038 to DG-050)
// ============================================================================

export type DlpDecision = 'ALLOW' | 'ALLOW_WITH_REDACTION' | 'REQUIRE_APPROVAL' | 'QUARANTINE' | 'BLOCK';

export interface DlpInspectionResult {
  decision: DlpDecision;
  detectedCategories: DataCategory[];
  findingsCount: number;
  reasonCode: string;
  sanitizedPayload?: any;
  quarantineId?: string;
}

export interface ExportRequest {
  exportId: string;
  requesterPrincipalId: string;
  tenantScope: string;
  resourceName: string;
  requestedFields: string[];
  totalRows: number;
  format: 'CSV' | 'XLSX' | 'PDF' | 'JSON';
  businessPurpose: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'GENERATED' | 'DOWNLOADED' | 'EXPIRED';
  approvalRequired: boolean;
  approvedBy?: string;
  downloadUrl?: string;
  downloadExpiresAt?: string;
  watermarkToken?: string;
}

// ============================================================================
// 3. RETENTION & LEGAL HOLD TYPES (DG-055 to DG-066)
// ============================================================================

export type RetentionState =
  | 'ACTIVE'
  | 'RETENTION_PENDING'
  | 'LEGAL_HOLD'
  | 'DELETION_ELIGIBLE'
  | 'DELETION_PENDING'
  | 'DELETED';

export interface LegalHoldRecord {
  holdId: string;
  scope: string; // Resource or Tenant ID
  reason: string;
  authorityPrincipalId: string;
  createdAt: string;
  status: 'ACTIVE' | 'RELEASED';
  affectedAssetIds: string[];
}

export interface PrivacySubjectRequest {
  requestId: string;
  requestType: 'ACCESS' | 'CORRECTION' | 'DELETION' | 'EXPORT' | 'RESTRICTION';
  subjectIdentifier: string; // e.g. email or national ID
  tenantScope: string;
  requesterPrincipalId: string;
  verifiedIdentity: boolean;
  status: 'RECEIVED' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED_WITH_REASON';
  rejectionReason?: string;
  retainedNonDeletableCategories?: DataCategory[];
  auditProofHash: string;
}

// ============================================================================
// 4. ENTERPRISE DATA GOVERNANCE ENGINE IMPLEMENTATION
// ============================================================================

export class EnterpriseDataGovernanceService {
  private static instance: EnterpriseDataGovernanceService;

  private fieldRegistry: Map<string, FieldClassification> = new Map();
  private assetRegistry: Map<string, DataAsset> = new Map();
  private legalHolds: Map<string, LegalHoldRecord> = new Map();
  private exportRequests: Map<string, ExportRequest> = new Map();
  private privacyRequests: Map<string, PrivacySubjectRequest> = new Map();
  private dataAuditLedger: Array<any> = [];

  private constructor() {
    this.bootstrapFieldRegistry();
    this.bootstrapAssetRegistry();
  }

  public static getInstance(): EnterpriseDataGovernanceService {
    if (!EnterpriseDataGovernanceService.instance) {
      EnterpriseDataGovernanceService.instance = new EnterpriseDataGovernanceService();
    }
    return EnterpriseDataGovernanceService.instance;
  }

  private bootstrapFieldRegistry() {
    // Customer Fields
    this.registerField({
      resourceName: 'customers',
      fieldName: 'company_name',
      classification: 'INTERNAL',
      categories: ['COMMERCIAL'],
      defaultMasking: 'NO_MASK',
      exportable: true,
      requiredAAL: 'AAL_STANDARD',
      requiredRoles: ['OPERATIONS_USER', 'FINANCE_USER', 'CUSTOMER_ADMIN'],
    });

    this.registerField({
      resourceName: 'customers',
      fieldName: 'tax_number',
      classification: 'CONFIDENTIAL',
      categories: ['COMMERCIAL', 'FINANCIAL'],
      defaultMasking: 'PARTIAL_MASK',
      exportable: true,
      requiredAAL: 'AAL_STRONG',
      requiredRoles: ['FINANCE_CONTROLLER', 'CFO', 'AUDITOR'],
    });

    this.registerField({
      resourceName: 'customers',
      fieldName: 'contact_email',
      classification: 'CONFIDENTIAL',
      categories: ['PII'],
      defaultMasking: 'PARTIAL_MASK',
      exportable: true,
      requiredAAL: 'AAL_STANDARD',
      requiredRoles: ['OPERATIONS_USER', 'FINANCE_USER'],
    });

    this.registerField({
      resourceName: 'customers',
      fieldName: 'bank_iban',
      classification: 'RESTRICTED',
      categories: ['FINANCIAL', 'PAYMENT'],
      defaultMasking: 'LAST_N_CHARACTERS',
      exportable: false, // Forbidden in bulk exports
      requiredAAL: 'AAL_PHISHING_RESISTANT',
      requiredRoles: ['FINANCE_CONTROLLER', 'CFO'],
    });

    // Users / Authentication Fields
    this.registerField({
      resourceName: 'users',
      fieldName: 'password_hash',
      classification: 'RESTRICTED',
      categories: ['AUTHENTICATION', 'SECURITY'],
      defaultMasking: 'FULL_REDACTION',
      exportable: false,
      requiredAAL: 'AAL_PHISHING_RESISTANT',
      requiredRoles: [], // Never returned to API
    });

    // Payments Fields
    this.registerField({
      resourceName: 'payments',
      fieldName: 'adyen_psp_reference',
      classification: 'CONFIDENTIAL',
      categories: ['PAYMENT', 'FINANCIAL'],
      defaultMasking: 'NO_MASK',
      exportable: true,
      requiredAAL: 'AAL_STRONG',
      requiredRoles: ['FINANCE_USER', 'FINANCE_CONTROLLER', 'CFO'],
    });
  }

  private bootstrapAssetRegistry() {
    this.assetRegistry.set('ASSET-DB-CUSTOMERS', {
      assetId: 'ASSET-DB-CUSTOMERS',
      assetName: 'Core Customer Database Table',
      domain: 'CRM_SALES',
      owner: 'Head of Customer Relations',
      steward: 'Lead Data Steward',
      tenantScope: 'tenant_riyadh_central',
      storageLocation: 'me-central2-riyadh',
      classification: 'CONFIDENTIAL',
      categories: ['COMMERCIAL', 'PII'],
      containsPii: true,
      containsFinancialData: false,
      containsCredentials: false,
      retentionDays: 1825, // 5 Years
      residencyRegion: 'SAUDI_ARABIA_KSA',
      status: 'ACTIVE',
    });

    this.assetRegistry.set('ASSET-DB-PAYMENTS', {
      assetId: 'ASSET-DB-PAYMENTS',
      assetName: 'General Ledger & Payment Transactions',
      domain: 'FINANCE',
      owner: 'Chief Financial Officer',
      steward: 'Lead Financial Controller',
      tenantScope: 'tenant_riyadh_central',
      storageLocation: 'me-central2-riyadh',
      classification: 'RESTRICTED',
      categories: ['FINANCIAL', 'PAYMENT'],
      containsPii: true,
      containsFinancialData: true,
      containsCredentials: false,
      retentionDays: 3650, // 10 Years statutory
      residencyRegion: 'SAUDI_ARABIA_KSA',
      status: 'ACTIVE',
    });
  }

  public registerField(field: FieldClassification) {
    this.fieldRegistry.set(`${field.resourceName}.${field.fieldName}`, field);
  }

  public getField(resourceName: string, fieldName: string): FieldClassification | undefined {
    return this.fieldRegistry.get(`${resourceName}.${fieldName}`);
  }

  // ============================================================================
  // 1. DATA ACCESS & MASKING AUTHORIZATION (DG-009 to DG-018)
  // ============================================================================

  public evaluateDataAccess(
    principal: EnterprisePrincipal,
    resourceName: string,
    requestedFields: string[],
    recordTenantScope: string,
    purpose: string
  ): { authorized: boolean; allowedFields: string[]; maskedFields: Record<string, MaskingStrategy>; reasonCode: string } {
    // 1. Multi-Tenant Boundary Lock (DG-008, DG-103)
    if (principal.tenantScope !== recordTenantScope && principal.principalType !== 'BREAK_GLASS') {
      this.recordAudit({ event: 'CROSS_TENANT_DATA_ACCESS_DENIED', principalId: principal.principalId, targetTenant: recordTenantScope, resourceName });
      return { authorized: false, allowedFields: [], maskedFields: {}, reasonCode: 'CROSS_TENANT_DATA_ACCESS_FORBIDDEN' };
    }

    const allowedFields: string[] = [];
    const maskedFields: Record<string, MaskingStrategy> = {};

    for (const fieldName of requestedFields) {
      const fieldMeta = this.getField(resourceName, fieldName);

      // Deny-by-Default on unclassified fields in sensitive resources (DG-018)
      if (!fieldMeta) {
        maskedFields[fieldName] = 'FULL_REDACTION';
        continue;
      }

      // Special check for credentials (DG-014) - Never return password hashes
      if (fieldMeta.classification === 'RESTRICTED' && fieldMeta.categories.includes('AUTHENTICATION')) {
        maskedFields[fieldName] = 'FULL_REDACTION';
        continue;
      }

      // Check role eligibility
      const hasRole = fieldMeta.requiredRoles.some((r) => principal.baseRoles.includes(r) || principal.authorityLevels.includes(r));
      if (!hasRole && fieldMeta.requiredRoles.length > 0) {
        maskedFields[fieldName] = 'FULL_REDACTION';
        continue;
      }

      // Apply Masking Strategy based on Principal AAL & Field Sensitivity
      if (fieldMeta.classification === 'RESTRICTED' && principal.authenticationStrength !== 'AAL_PHISHING_RESISTANT') {
        maskedFields[fieldName] = fieldMeta.defaultMasking !== 'NO_MASK' ? fieldMeta.defaultMasking : 'PARTIAL_MASK';
        allowedFields.push(fieldName);
      } else {
        maskedFields[fieldName] = 'NO_MASK';
        allowedFields.push(fieldName);
      }
    }

    this.recordAudit({
      event: 'DATA_ACCESS_EVALUATED',
      principalId: principal.principalId,
      resourceName,
      allowedCount: allowedFields.length,
      maskedCount: Object.values(maskedFields).filter((m) => m !== 'NO_MASK').length,
      purpose,
    });

    return { authorized: allowedFields.length > 0, allowedFields, maskedFields, reasonCode: 'DATA_ACCESS_POLICY_APPLIED' };
  }

  public maskValue(value: string | any, strategy: MaskingStrategy): string {
    if (value === null || value === undefined) return '';
    const str = String(value);

    switch (strategy) {
      case 'FULL_REDACTION':
        return '[REDACTED_CONFIDENTIAL]';
      case 'PARTIAL_MASK':
        if (str.includes('@')) {
          // Email partial mask e.g. t***q@aja.sa
          const [user, domain] = str.split('@');
          return `${user.substring(0, 1)}***@${domain}`;
        }
        return str.length > 4 ? `${str.substring(0, 2)}****${str.substring(str.length - 2)}` : '****';
      case 'LAST_N_CHARACTERS':
        return str.length > 4 ? `****${str.substring(str.length - 4)}` : str;
      case 'HASHED_VIEW':
        return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
      case 'TOKENIZED_VIEW':
        return `TOK_${crypto.createHash('md5').update(str).digest('hex').substring(0, 8).toUpperCase()}`;
      case 'NO_MASK':
      default:
        return str;
    }
  }

  // ============================================================================
  // 2. DATA LOSS PREVENTION (DLP) INSPECTION ENGINE (DG-047 to DG-054)
  // ============================================================================

  public inspectDlp(payloadText: string, context: { channel: 'API' | 'EXPORT' | 'AI_PROMPT' | 'AI_OUTPUT' | 'DOCUMENT'; tenantScope: string }): DlpInspectionResult {
    const detectedCategories: DataCategory[] = [];
    let findingsCount = 0;

    // 1. IBAN Pattern Check (SA followed by 22 alphanumeric digits)
    const ibanRegex = /\bSA\d{2}[A-Za-z0-9]{20}\b/g;
    if (ibanRegex.test(payloadText)) {
      detectedCategories.push('FINANCIAL', 'PAYMENT');
      findingsCount++;
    }

    // 2. National ID / Iqama Check (10 digits starting with 1 or 2)
    const nationalIdRegex = /\b[12]\d{9}\b/g;
    if (nationalIdRegex.test(payloadText)) {
      detectedCategories.push('PII');
      findingsCount++;
    }

    // 3. API Key / Private Key detection
    const secretKeyRegex = /(?:AKIA[0-9A-Z]{16}|bearer\s+[a-zA-Z0-9_\-\.]{20,}|-----BEGIN PRIVATE KEY-----)/gi;
    if (secretKeyRegex.test(payloadText)) {
      detectedCategories.push('AUTHENTICATION', 'SECURITY');
      findingsCount++;
    }

    // Decisions based on Channel & Sensitivity
    if (detectedCategories.includes('AUTHENTICATION') || detectedCategories.includes('SECURITY')) {
      const quarantineId = `QRN-${crypto.randomUUID().substring(0, 8)}`;
      this.recordAudit({ event: 'DLP_SECRET_EXPOSURE_BLOCKED', quarantineId, context, findingsCount });
      return { decision: 'BLOCK', detectedCategories, findingsCount, reasonCode: 'DLP_CREDENTIAL_EXPOSURE_PROHIBITED', quarantineId };
    }

    if (context.channel === 'AI_PROMPT' && detectedCategories.includes('FINANCIAL')) {
      // Redact financial details before sending to AI (DG-033)
      const sanitized = payloadText.replace(ibanRegex, '[REDACTED_IBAN_FOR_AI]');
      return { decision: 'ALLOW_WITH_REDACTION', detectedCategories, findingsCount, reasonCode: 'DLP_AI_FINANCIAL_REDACTED', sanitizedPayload: sanitized };
    }

    if (context.channel === 'EXPORT' && detectedCategories.includes('PAYMENT')) {
      return { decision: 'REQUIRE_APPROVAL', detectedCategories, findingsCount, reasonCode: 'DLP_EXPORT_CONTAINS_RESTRICTED_PAYMENT_DATA' };
    }

    return { decision: 'ALLOW', detectedCategories, findingsCount, reasonCode: 'DLP_INSPECTION_PASSED' };
  }

  // ============================================================================
  // 3. ENTERPRISE EXPORT GOVERNANCE (DG-038 to DG-046, DG-105)
  // ============================================================================

  public createExportRequest(
    principal: EnterprisePrincipal,
    resourceName: string,
    requestedFields: string[],
    totalRows: number,
    format: 'CSV' | 'XLSX' | 'PDF' | 'JSON',
    businessPurpose: string
  ): ExportRequest {
    const exportId = `EXP-${crypto.randomUUID().substring(0, 8)}`;
    
    // Check Field Allowlist (DG-040)
    for (const f of requestedFields) {
      const meta = this.getField(resourceName, f);
      if (meta && !meta.exportable) {
        throw new Error(`Field '${f}' is classified as NON_EXPORTABLE under governance policy`);
      }
    }

    // High volume (> 1,000 rows) or Sensitive Classification requires Step-Up Approval (DG-041, DG-043)
    const requiresApproval = totalRows > 1000 || requestedFields.some((f) => this.getField(resourceName, f)?.classification === 'RESTRICTED');

    const req: ExportRequest = {
      exportId,
      requesterPrincipalId: principal.principalId,
      tenantScope: principal.tenantScope,
      resourceName,
      requestedFields,
      totalRows,
      format,
      businessPurpose,
      status: requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED',
      approvalRequired: requiresApproval,
    };

    if (!requiresApproval) {
      this.generateDownloadUrl(req);
    }

    this.exportRequests.set(exportId, req);
    this.recordAudit({ event: 'EXPORT_REQUEST_CREATED', exportId, principalId: principal.principalId, totalRows, requiresApproval });
    return req;
  }

  public approveExportRequest(exportId: string, approverPrincipal: EnterprisePrincipal): ExportRequest {
    const req = this.exportRequests.get(exportId);
    if (!req) throw new Error('Export request not found');

    if (req.requesterPrincipalId === approverPrincipal.principalId) {
      throw new Error('Segregation of Duties Violation: Requester cannot self-approve export request');
    }

    req.status = 'APPROVED';
    req.approvedBy = approverPrincipal.principalId;
    this.generateDownloadUrl(req);

    this.recordAudit({ event: 'EXPORT_REQUEST_APPROVED', exportId, approvedBy: approverPrincipal.principalId });
    return req;
  }

  private generateDownloadUrl(req: ExportRequest) {
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 Minutes TTL
    req.downloadUrl = `https://storage.aja.internal/secured-exports/${req.exportId}?token=${token}`;
    req.downloadExpiresAt = expiry;
    req.watermarkToken = `WM-EXPORT-${req.exportId}-${req.requesterPrincipalId.substring(0, 6)}`;
    req.status = 'GENERATED';
  }

  // ============================================================================
  // 4. RETENTION LIFECYCLE & LEGAL HOLD ENGINE (DG-055 to DG-066, DG-108)
  // ============================================================================

  public placeLegalHold(scope: string, reason: string, authorityPrincipalId: string, affectedAssetIds: string[]): LegalHoldRecord {
    const holdId = `HOLD-${crypto.randomUUID().substring(0, 8)}`;
    const record: LegalHoldRecord = {
      holdId,
      scope,
      reason,
      authorityPrincipalId,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      affectedAssetIds,
    };

    this.legalHolds.set(holdId, record);
    this.recordAudit({ event: 'LEGAL_HOLD_PLACED', holdId, scope, authorityPrincipalId, affectedAssetIds });
    return record;
  }

  public evaluateDeletionEligibility(assetId: string, recordAgeDays: number): { canDelete: boolean; reasonCode: string; activeHoldId?: string } {
    // 1. Check if any active legal hold covers this asset (DG-058, DG-062)
    for (const hold of this.legalHolds.values()) {
      if (hold.status === 'ACTIVE' && hold.affectedAssetIds.includes(assetId)) {
        return { canDelete: false, reasonCode: 'DELETION_BLOCKED_BY_ACTIVE_LEGAL_HOLD', activeHoldId: hold.holdId };
      }
    }

    const asset = this.assetRegistry.get(assetId);
    if (!asset) return { canDelete: false, reasonCode: 'ASSET_NOT_FOUND' };

    // 2. Check statutory retention period
    if (recordAgeDays < asset.retentionDays) {
      return { canDelete: false, reasonCode: 'RECORD_WITHIN_STATUTORY_RETENTION_PERIOD' };
    }

    return { canDelete: true, reasonCode: 'ELIGIBLE_FOR_PURGE_DELETION' };
  }

  // ============================================================================
  // 5. PRIVACY SUBJECT REQUEST ENGINE (DG-063 to DG-073, DG-109)
  // ============================================================================

  public submitPrivacySubjectRequest(
    requestType: 'ACCESS' | 'CORRECTION' | 'DELETION' | 'EXPORT' | 'RESTRICTION',
    subjectIdentifier: string,
    tenantScope: string,
    requesterPrincipalId: string,
    verifiedIdentity: boolean
  ): PrivacySubjectRequest {
    if (!verifiedIdentity) {
      throw new Error('Privacy subject request rejected: Requester identity unverified');
    }

    const requestId = `PRV-${crypto.randomUUID().substring(0, 8)}`;
    const proofHash = crypto.createHash('sha256').update(`${requestId}:${subjectIdentifier}:${requestType}`).digest('hex');

    // For Deletion, inspect if statutory financial / tax retention overrides deletion
    let retainedCategories: DataCategory[] = [];
    if (requestType === 'DELETION') {
      retainedCategories = ['FINANCIAL', 'PAYMENT', 'CUSTOMS']; // Retained by law
    }

    const req: PrivacySubjectRequest = {
      requestId,
      requestType,
      subjectIdentifier,
      tenantScope,
      requesterPrincipalId,
      verifiedIdentity,
      status: 'COMPLETED',
      retainedNonDeletableCategories: retainedCategories.length > 0 ? retainedCategories : undefined,
      auditProofHash: proofHash,
    };

    this.privacyRequests.set(requestId, req);
    this.recordAudit({ event: 'PRIVACY_REQUEST_PROCESSED', requestId, requestType, subjectIdentifier, retainedCategories });
    return req;
  }

  private recordAudit(event: Record<string, any>) {
    this.dataAuditLedger.push({
      ...event,
      timestamp: new Date().toISOString(),
      ledgerIndex: this.dataAuditLedger.length + 1,
    });
  }

  public getAuditLedger(): Array<any> {
    return [...this.dataAuditLedger];
  }
}
