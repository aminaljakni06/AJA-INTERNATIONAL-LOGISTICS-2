/**
 * AJA INTERNATIONAL LOGISTICS — Server-Side Export Policy Resolver
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18.03)
 * Version: 1.0
 */

import {
  EnterpriseExportRequest,
  ExchangeFormat,
  DataTransferErrorCode,
  ExportFieldDefinition,
  DATA_EXCHANGE_LIMITS,
} from '../../types/dataTransferFramework';
import { BulkSelectionDescriptor } from '../../types/bulkFramework';
import { EnterpriseQueryState, ServerQueryValidationConfig } from '../../types/queryFramework';
import { DataViewResourceAdapter } from '../../types/dataViewFramework';
import { getResourceAdapter } from '../dataView/resourceAdapters';
import { validateServerQuery } from '../query/enterpriseQueryEngine';
import { PermissionResolver } from '../permissions/permissionResolver';
import { User } from '../../types/user';

export interface ExportAuthContext {
  user?: User | null;
  userId: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  userPermissions?: string[];
}

export interface ExportAuditMetadata {
  resource: string;
  format: ExchangeFormat;
  selectionMode: 'EXPLICIT' | 'PAGE' | 'QUERY';
  recordCount: number;
  allowedFieldCount: number;
  executionTimeMs: number;
  effectiveLimit: number;
  requestedByUserId: string;
  companyId?: string;
  branchId?: string;
}

export interface ResolvedExportPolicy {
  resource: string;
  resourceAdapter: DataViewResourceAdapter;
  format: ExchangeFormat;
  operationalFormatStatus: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED';
  selection: BulkSelectionDescriptor;
  effectiveSelectionMode: 'EXPLICIT' | 'PAGE' | 'QUERY';
  validatedQuery?: EnterpriseQueryState;
  requestedFields: string[];
  allowedFields: ExportFieldDefinition[];
  allowedFieldKeys: string[];
  sensitiveFieldsExcluded: string[];
  deniedFieldsByPermission: string[];
  tenantScope: {
    companyId?: string;
    branchId?: string;
  };
  effectiveRecordLimit: number;
  globalLimit: number;
  resourceLimit: number;
  formatLimit?: number;
  estimatedRecordCount: number;
  includeHeaders: boolean;
  fileName: string;
  auditMetadata: ExportAuditMetadata;
}

export interface ExportPolicyValidationResult {
  success: boolean;
  policy?: ResolvedExportPolicy;
  errorCode?: DataTransferErrorCode;
  errorMessageEn?: string;
  errorMessageAr?: string;
  validationErrors?: any[];
}

/**
 * Operational Format Normalizer
 */
export function normalizeExportFormat(format: string): {
  normalizedFormat: ExchangeFormat;
  status: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED';
} {
  const fmt = (format || '').toLowerCase().trim();

  if (fmt === 'csv') {
    return { normalizedFormat: 'csv', status: 'SUPPORTED' };
  }
  if (fmt === 'xlsx' || fmt === 'excel') {
    return { normalizedFormat: 'xlsx', status: 'SUPPORTED' };
  }
  if (fmt === 'json') {
    return { normalizedFormat: 'json', status: 'SUPPORTED' };
  }
  if (fmt === 'pdf') {
    return { normalizedFormat: 'pdf', status: 'UNSUPPORTED' };
  }

  return { normalizedFormat: 'csv', status: 'UNSUPPORTED' };
}

/**
 * Resolves legacy ExchangeScope to BulkSelectionDescriptor authority model
 */
export function resolveSelectionDescriptor(request: EnterpriseExportRequest): BulkSelectionDescriptor {
  if (request.selection) {
    return request.selection;
  }

  // Legacy scope mapping fallback
  const scope = request.scope || 'selected';
  const resource = request.resource || 'shipments';

  if (scope === 'selected' || request.selectedIds?.length) {
    return {
      mode: 'EXPLICIT',
      ids: request.selectedIds || [],
    };
  }

  if (scope === 'query') {
    return {
      mode: 'QUERY',
      resource,
      query: request.queryState || {
        search: '',
        filters: {},
        sort: { field: 'createdAt', direction: 'desc' },
        pagination: { page: 1, pageSize: 25 },
      },
      excludedIds: request.excludedIds || [],
    };
  }

  // 'all' maps to QUERY mode within user's tenant scope
  return {
    mode: 'QUERY',
    resource,
    query: {
      search: '',
      filters: {},
      sort: { field: 'createdAt', direction: 'desc' },
      pagination: { page: 1, pageSize: 25 },
    },
    excludedIds: [],
  };
}

/**
 * Central Server-Side Export Policy Resolver
 * Validates permissions, tenant scope, field allow-lists, query constraints, and export limits.
 */
export async function resolveExportPolicy(
  resource: string,
  request: EnterpriseExportRequest,
  authContext: ExportAuthContext
): Promise<ExportPolicyValidationResult> {
  const startTime = Date.now();

  // 1. Resource Adapter Resolution & Unknown Resource Handling
  if (!resource || typeof resource !== 'string' || resource.trim() === '') {
    return {
      success: false,
      errorCode: 'UNAUTHORIZED_RESOURCE',
      errorMessageEn: 'Export request rejected: missing or invalid resource name.',
      errorMessageAr: 'تم رفض طلب التصدير: اسم المورد مفقود أو غير صالحة.',
    };
  }

  const normalizedResource = resource.toLowerCase().trim();
  const adapter = getResourceAdapter(normalizedResource);

  // Check if adapter is explicit registered adapter vs fallback for non-existent resource
  const knownResources = ['shipments', 'customers', 'quotes'];
  if (!knownResources.includes(normalizedResource)) {
    return {
      success: false,
      errorCode: 'UNAUTHORIZED_RESOURCE',
      errorMessageEn: `Export capability is not authorized or supported for resource: "${resource}".`,
      errorMessageAr: `خاصية التصدير غير مصرح بها أو غير مدعومة للمورد: "${resource}".`,
    };
  }

  // 2. Resource Export Permission Validation
  const requiredExportPerm =
    adapter.dataTransferCapabilities?.exportPermission || `${normalizedResource}.export`;

  const rawUser = authContext.user || null;
  const userPermissions = authContext.userPermissions || [];
  const user = rawUser
    ? {
        ...rawUser,
        customPermissions: Array.from(
          new Set([...(rawUser.customPermissions || []), ...userPermissions])
        ),
      }
    : null;

  let hasResourcePermission = false;
  if (user) {
    hasResourcePermission = PermissionResolver.hasPermission(user, requiredExportPerm);
  } else if (userPermissions.length > 0) {
    hasResourcePermission =
      userPermissions.includes('*') ||
      userPermissions.includes(requiredExportPerm) ||
      userPermissions.includes(`${normalizedResource}:view`);
  }

  if (!hasResourcePermission && user) {
    // Admin override check
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'ERP_ADMIN' || user.role === 'CEO') {
      hasResourcePermission = true;
    }
  }

  if (!hasResourcePermission) {
    return {
      success: false,
      errorCode: 'UNAUTHORIZED_RESOURCE',
      errorMessageEn: `Access Denied: You do not have permission ("${requiredExportPerm}") to export ${normalizedResource}.`,
      errorMessageAr: `تم رفض الوصول: ليس لديك صلاحية ("${requiredExportPerm}") لتصدير ${normalizedResource}.`,
    };
  }

  // 3. Format Normalization & Validation
  const requestedFormat = request.format || 'csv';
  const { normalizedFormat, status: formatStatus } = normalizeExportFormat(requestedFormat);

  if (formatStatus === 'UNSUPPORTED') {
    return {
      success: false,
      errorCode: 'INVALID_FILE_TYPE',
      errorMessageEn: `Export format "${requestedFormat}" is unsupported. Supported formats: CSV, XLSX, JSON.`,
      errorMessageAr: `تنسيق التصدير "${requestedFormat}" غير مدعوم. التنسيقات المدعومة: CSV, XLSX, JSON.`,
    };
  }

  // 4. Tenant Scope Extraction (Never trust client-supplied tenant/company IDs)
  const companyId = authContext.companyId || authContext.tenantId || user?.companyId || undefined;
  const branchId = authContext.branchId || user?.branchId || undefined;
  const tenantScope = { companyId, branchId };

  // 5. Selection Authority & Query Normalization
  const selection = resolveSelectionDescriptor(request);
  const effectiveSelectionMode = selection.mode;

  let validatedQuery: EnterpriseQueryState | undefined;
  let estimatedRecordCount = 0;

  if (effectiveSelectionMode === 'QUERY' && selection.mode === 'QUERY') {
    const queryConfig: ServerQueryValidationConfig = {
      allowedFilterKeys: Array.from(new Set([...(adapter.allowedFilters || ['status', 'dateRange', 'type']), 'companyId', 'branchId'])),
      allowedSortFields: adapter.allowedSortFields || ['id', 'createdAt'],
      maxSearchLength: 100,
    };

    const queryResult = validateServerQuery(
      selection.query || { search: '', filters: {}, sort: { field: 'createdAt', direction: 'desc' }, pagination: { page: 1, pageSize: 25 } },
      queryConfig,
      tenantScope
    );

    if (!queryResult.isValid || !queryResult.sanitizedState) {
      return {
        success: false,
        errorCode: 'INVALID_QUERY',
        errorMessageEn: `Invalid query state for export: ${queryResult.validationErrors?.map((e) => e.messageEn).join(', ') || 'Validation error'}`,
        errorMessageAr: `استعلام التصدير غير صالحة: ${queryResult.validationErrors?.map((e) => e.messageAr).join(', ') || 'خطأ في التحقق'}`,
        validationErrors: queryResult.validationErrors,
      };
    }

    validatedQuery = queryResult.sanitizedState;
    const excludedCount = selection.excludedIds?.length || 0;
    // Estimate total records matching query (mock base record set size minus exclusions)
    const baseMockCount = normalizedResource === 'shipments' ? 5 : 10;
    estimatedRecordCount = Math.max(0, baseMockCount - excludedCount);
  } else if (effectiveSelectionMode === 'EXPLICIT' && selection.mode === 'EXPLICIT') {
    const ids = selection.ids || [];
    if (ids.length === 0) {
      return {
        success: false,
        errorCode: 'INVALID_SELECTION',
        errorMessageEn: 'Export failed: No items were selected for EXPLICIT export mode.',
        errorMessageAr: 'فشل التصدير: لم يتم تحديد أي عناصر لتحديد التصدير المباشر.',
      };
    }
    estimatedRecordCount = ids.length;
  } else if (effectiveSelectionMode === 'PAGE' && selection.mode === 'PAGE') {
    const ids = selection.ids || [];
    estimatedRecordCount = ids.length || adapter.defaultPageSize || 25;
  }

  // 6. Field Allow-list & Sensitive Field Protection
  const exportableDefinitions = adapter.dataTransferCapabilities?.exportableFields || [];
  const sensitiveFieldsExcluded: string[] = [];
  const deniedFieldsByPermission: string[] = [];
  const allowedFields: ExportFieldDefinition[] = [];

  exportableDefinitions.forEach((fieldDef) => {
    let fieldPermitted = true;

    // Check sensitive flag & field-level permission
    if (fieldDef.sensitive) {
      const requiredFieldPerm = fieldDef.requiredPermission || `${normalizedResource}.${fieldDef.key}.view`;
      let hasFieldPerm = false;
      if (user) {
        hasFieldPerm = PermissionResolver.hasPermission(user, requiredFieldPerm);
        if (!hasFieldPerm && (user.role === 'SYSTEM_ADMIN' || user.role === 'ERP_ADMIN' || user.role === 'CEO')) {
          hasFieldPerm = true;
        }
      } else if (userPermissions.length > 0) {
        hasFieldPerm = userPermissions.includes('*') || userPermissions.includes(requiredFieldPerm);
      }

      if (!hasFieldPerm) {
        fieldPermitted = false;
        sensitiveFieldsExcluded.push(fieldDef.key);
        deniedFieldsByPermission.push(fieldDef.key);
      }
    } else if (fieldDef.requiredPermission) {
      let hasFieldPerm = false;
      if (user) {
        hasFieldPerm = PermissionResolver.hasPermission(user, fieldDef.requiredPermission);
      } else if (userPermissions.length > 0) {
        hasFieldPerm = userPermissions.includes('*') || userPermissions.includes(fieldDef.requiredPermission);
      }

      if (!hasFieldPerm) {
        fieldPermitted = false;
        deniedFieldsByPermission.push(fieldDef.key);
      }
    }

    if (fieldPermitted) {
      allowedFields.push(fieldDef);
    }
  });

  // Calculate requested vs allowed field key intersection
  let activeFieldKeys: string[] = [];

  const rawRequestedFields = request.selectedFields || request.fields || [];

  if (rawRequestedFields.length > 0) {
    // User explicitly specified fields or saved view columns
    activeFieldKeys = rawRequestedFields.filter((key) => allowedFields.some((f) => f.key === key));
  } else {
    // Default fields
    activeFieldKeys = allowedFields.filter((f) => f.isDefault).map((f) => f.key);
  }

  if (activeFieldKeys.length === 0) {
    return {
      success: false,
      errorCode: 'INVALID_EXPORT_FIELDS',
      errorMessageEn: 'Export request rejected: No valid or authorized fields were selected for export.',
      errorMessageAr: 'تم رفض طلب التصدير: لم يتم تحديد أي حقول صالحة أو مصرح بها للتصدير.',
    };
  }

  // Filter allowedFields list to only active keys
  const finalAllowedFields = allowedFields.filter((f) => activeFieldKeys.includes(f.key));

  // 7. Export Limits Validation (Global vs Resource vs Format)
  const globalLimit = DATA_EXCHANGE_LIMITS.MAX_SYNCHRONOUS_RECORDS;
  const resourceLimit = adapter.dataTransferCapabilities?.maxSynchronousExportRecords || globalLimit;
  const formatLimit = normalizedFormat === 'json' ? 10000 : 10000;
  const effectiveRecordLimit = Math.min(globalLimit, resourceLimit, formatLimit);

  if (estimatedRecordCount > effectiveRecordLimit) {
    return {
      success: false,
      errorCode: 'EXPORT_LIMIT_EXCEEDED',
      errorMessageEn: `Export dataset size (${estimatedRecordCount}) exceeds maximum allowed limit of ${effectiveRecordLimit} records. Please refine search filters.`,
      errorMessageAr: `حجم البيانات المراد تصديرها (${estimatedRecordCount}) يتجاوز الحد الأقصى المسموح به وهو ${effectiveRecordLimit} سجل. يرجى تضييق نطاق البحث.`,
    };
  }

  // 8. File Naming & Headers
  const includeHeaders = request.includeHeaders !== false;
  const timestamp = Date.now();
  const fileName = request.fileName || `AJA_${normalizedResource}_export_${timestamp}.${normalizedFormat}`;

  // 9. Audit Metadata Construction
  const auditMetadata: ExportAuditMetadata = {
    resource: normalizedResource,
    format: normalizedFormat,
    selectionMode: effectiveSelectionMode,
    recordCount: estimatedRecordCount,
    allowedFieldCount: finalAllowedFields.length,
    executionTimeMs: Date.now() - startTime,
    effectiveLimit: effectiveRecordLimit,
    requestedByUserId: authContext.userId,
    companyId: tenantScope.companyId,
    branchId: tenantScope.branchId,
  };

  const policy: ResolvedExportPolicy = {
    resource: normalizedResource,
    resourceAdapter: adapter,
    format: normalizedFormat,
    operationalFormatStatus: formatStatus,
    selection,
    effectiveSelectionMode,
    validatedQuery,
    requestedFields: rawRequestedFields,
    allowedFields: finalAllowedFields,
    allowedFieldKeys: activeFieldKeys,
    sensitiveFieldsExcluded,
    deniedFieldsByPermission,
    tenantScope,
    effectiveRecordLimit,
    globalLimit,
    resourceLimit,
    formatLimit,
    estimatedRecordCount,
    includeHeaders,
    fileName,
    auditMetadata,
  };

  return {
    success: true,
    policy,
  };
}
