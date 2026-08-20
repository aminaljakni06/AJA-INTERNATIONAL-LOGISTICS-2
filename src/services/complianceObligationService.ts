/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Compliance Obligation Service
 * Step GOV-07: Canonical Requirement Registry, Obligation Ownership & Scoped Catalog Engine
 * 
 * Security & Governance Rules:
 * - Strict ABAC & Legal Entity scoping: Multi-tenant tenant isolation
 * - Precedence: EXPLICIT_DENY > DIRECT_ALLOW > ROLE_ALLOW > DELEGATED_ALLOW
 * - Technical Admin cannot bypass statutory governance rules without explicit authority
 * - Prohibits metadata leakage through scope-based search filtering
 * - Export operations strictly audited and governed by 'governance:obligation:export'
 */

import {
  ComplianceRequirementDefinition,
  ComplianceObligation,
  GovernanceJurisdiction,
  ComplianceObligationCategory
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import {
  getRequirementDefinitionById,
  getRequirementDefinitionByCode,
  listRequirementDefinitions,
  saveRequirementDefinition,
  getObligationById,
  getObligationByCodeAndEntity,
  listObligationsByEntity,
  saveObligation,
  CANONICAL_REQUIREMENT_SEEDS
} from '../db/repositories/complianceObligationRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';

export interface RegisterObligationParams {
  requirementDefinitionCodeOrId?: string;
  code: string;
  legalEntityId: string;
  titleEn: string;
  titleAr?: string;
  description: string;
  jurisdiction: GovernanceJurisdiction;
  regulatoryAuthority: string;
  category: ComplianceObligationCategory;
  sourceCitation: string;
  frequency: ComplianceObligation['frequency'];
  dueDateRule: ComplianceObligation['dueDateRule'];
  filingRequired: boolean;
  filingPortal?: string;
  evidenceRequired: boolean;
  riskLevel: ComplianceObligation['riskLevel'];
  ownerUserId: string;
  responsibleDepartmentId?: string;
  reviewerUserId?: string;
  verifierUserId?: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  auditCorrelationId?: string;
}

export class ComplianceObligationService {
  /**
   * Builds an ABAC Context for compliance obligation evaluation
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
   * Lists available canonical compliance requirement templates (global or by jurisdiction)
   */
  public static async listRequirementCatalog(
    user: User,
    jurisdiction?: GovernanceJurisdiction
  ): Promise<ComplianceRequirementDefinition[]> {
    const hasPerm = PermissionResolver.hasPermission(user, 'governance:obligation:view');
    if (!hasPerm) {
      throw new Error(`Unauthorized: Principal [${user.id}] lacks 'governance:obligation:view' permission.`);
    }

    return listRequirementDefinitions(jurisdiction);
  }

  /**
   * Registers a new Compliance Obligation for a specific Legal Entity
   */
  public static async registerObligation(
    user: User,
    params: RegisterObligationParams
  ): Promise<ComplianceObligation> {
    const context = this.buildContext(params.legalEntityId, null, {
      jurisdiction: params.jurisdiction,
      departmentId: params.responsibleDepartmentId
    });

    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:obligation:create', context);
    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_OBLIGATION_CREATION_DENIED',
        entityType: 'COMPLIANCE_OBLIGATION',
        entityId: params.code,
        metadata: {
          reason: evalResult.reason,
          legalEntityId: params.legalEntityId,
          jurisdiction: params.jurisdiction
        }
      });
      throw new Error(`Unauthorized: Access denied registering compliance obligation. ${evalResult.reason}`);
    }

    // Check for existing duplicate obligation for this entity
    const existing = await getObligationByCodeAndEntity(params.code, params.legalEntityId);
    if (existing && existing.status === 'ACTIVE') {
      throw new Error(
        `Duplicate Obligation: Obligation with code [${params.code}] is already active for legal entity [${params.legalEntityId}].`
      );
    }

    // Lookup parent requirement template if provided
    let reqDefId: string | undefined;
    if (params.requirementDefinitionCodeOrId) {
      const def =
        (await getRequirementDefinitionById(params.requirementDefinitionCodeOrId)) ||
        (await getRequirementDefinitionByCode(params.requirementDefinitionCodeOrId));
      if (def) {
        reqDefId = def.id;
      }
    }

    const correlationId =
      params.auditCorrelationId || `corr_obl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const id = `obl_${params.legalEntityId}_${params.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newObligation: ComplianceObligation = {
      id,
      code: params.code,
      requirementDefinitionId: reqDefId,
      legalEntityId: params.legalEntityId,
      titleEn: params.titleEn,
      titleAr: params.titleAr,
      description: params.description,
      jurisdiction: params.jurisdiction,
      regulatoryAuthority: params.regulatoryAuthority,
      category: params.category,
      sourceCitation: params.sourceCitation,
      frequency: params.frequency,
      dueDateRule: params.dueDateRule,
      filingRequired: params.filingRequired,
      filingPortal: params.filingPortal,
      evidenceRequired: params.evidenceRequired,
      riskLevel: params.riskLevel,
      ownerUserId: params.ownerUserId,
      responsibleDepartmentId: params.responsibleDepartmentId,
      reviewerUserId: params.reviewerUserId,
      verifierUserId: params.verifierUserId,
      applicabilityStatus: 'PENDING_ASSESSMENT',
      effectiveFrom: params.effectiveFrom,
      effectiveUntil: params.effectiveUntil,
      status: 'ACTIVE',
      auditCorrelationId: correlationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return saveObligation(newObligation, user.id);
  }

  /**
   * Retrieves a single Compliance Obligation by ID with strict scope validation
   */
  public static async getObligation(
    user: User,
    obligationId: string
  ): Promise<ComplianceObligation> {
    const obligation = await getObligationById(obligationId);
    if (!obligation) {
      throw new Error(`Compliance Obligation not found: [${obligationId}]`);
    }

    const context = this.buildContext(obligation.legalEntityId, obligation);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:obligation:view', context);

    if (!evalResult.granted) {
      throw new Error(
        `Unauthorized: User [${user.id}] cannot view obligation [${obligationId}]. ${evalResult.reason}`
      );
    }

    return obligation;
  }

  /**
   * Lists all compliance obligations for a Legal Entity with scope filtering
   */
  public static async listObligationsForEntity(
    user: User,
    legalEntityId: string,
    filter?: {
      jurisdiction?: GovernanceJurisdiction;
      status?: string;
      category?: string;
      searchQuery?: string;
    }
  ): Promise<ComplianceObligation[]> {
    const baseContext = this.buildContext(legalEntityId, null, {
      jurisdiction: filter?.jurisdiction
    });

    const hasEntityPerm = PermissionResolver.hasPermission(user, 'governance:obligation:view', baseContext);
    if (!hasEntityPerm) {
      // Return empty array to prevent metadata discovery and leakage
      return [];
    }

    const allRecords = await listObligationsByEntity(legalEntityId, filter);

    // Apply fine-grained record scope filter
    const visibleRecords = allRecords.filter((rec) => {
      const recContext = this.buildContext(legalEntityId, rec);
      return PermissionResolver.hasPermission(user, 'governance:obligation:view', recContext);
    });

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      return visibleRecords.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.titleEn.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.regulatoryAuthority.toLowerCase().includes(q)
      );
    }

    return visibleRecords;
  }

  /**
   * Exports compliance obligation register with export authorization check
   */
  public static async exportObligationMatrix(
    user: User,
    legalEntityId: string,
    format: 'JSON' | 'CSV' = 'JSON'
  ): Promise<{ data: string; mimeType: string; count: number }> {
    const context = this.buildContext(legalEntityId, null);
    const evalResult = PermissionResolver.evaluateDetailed(user, 'governance:obligation:export', context);

    if (!evalResult.granted) {
      await createAuditLog({
        actorUserId: user.id,
        action: 'UNAUTHORIZED_OBLIGATION_EXPORT_DENIED',
        entityType: 'COMPLIANCE_OBLIGATION',
        entityId: legalEntityId,
        metadata: {
          reason: evalResult.reason
        }
      });
      throw new Error(`Unauthorized: User [${user.id}] lacks 'governance:obligation:export' privilege.`);
    }

    const records = await this.listObligationsForEntity(user, legalEntityId);

    await createAuditLog({
      actorUserId: user.id,
      action: 'EXPORT_COMPLIANCE_OBLIGATIONS',
      entityType: 'COMPLIANCE_OBLIGATION',
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

    // CSV format
    const headers = [
      'Code',
      'Title',
      'Jurisdiction',
      'Regulatory Authority',
      'Category',
      'Frequency',
      'Applicability Status',
      'Risk Level',
      'Owner User ID'
    ];
    const rows = records.map((r) => [
      r.code,
      `"${r.titleEn.replace(/"/g, '""')}"`,
      r.jurisdiction,
      `"${r.regulatoryAuthority.replace(/"/g, '""')}"`,
      r.category,
      r.frequency,
      r.applicabilityStatus,
      r.riskLevel,
      r.ownerUserId
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return {
      data: csvContent,
      mimeType: 'text/csv',
      count: records.length
    };
  }
}
