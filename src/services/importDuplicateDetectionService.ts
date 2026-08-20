/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Duplicate Detection & Resolution Service
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Import & Duplicate Resolution Framework (STEP 05.18.09)
 * Version: 1.0
 */

import {
  DuplicateHandlingStrategy,
  DuplicateType,
  ImportDuplicateGroup,
  ImportDuplicateMatch,
  ImportDuplicateSummary,
  ImportDuplicateDetectionResult,
  ImportRowValidation,
} from '../types/dataTransferFramework';
import { resolveImportSchema } from '../lib/exchange/importSchemaResolver';
import { getAdminFirestore } from '../server/firebaseAdmin';

/**
 * Capped maximum for sample rows returned to client (protects against giant JSON responses)
 */
export const BOUNDED_DUPLICATE_SAMPLE_LIMIT = 50;

/**
 * Maximum items per Firestore `in` query batch
 */
export const FIRESTORE_IN_QUERY_BATCH_SIZE = 30;

/**
 * Resource Capability Mapping for Duplicate Handling Strategies
 */
export const RESOURCE_DUPLICATE_CAPABILITIES: Record<
  string,
  {
    uniqueLookupKeys: string[];
    supportedStrategies: DuplicateHandlingStrategy[];
    requiredEditPermission: string;
  }
> = {
  shipments: {
    uniqueLookupKeys: ['trackingNumber', 'referenceNumber'],
    supportedStrategies: ['SKIP', 'OVERWRITE', 'CREATE_COPY'],
    requiredEditPermission: 'shipments.edit',
  },
  customers: {
    uniqueLookupKeys: ['email', 'vatNumber', 'commercialRegistration'],
    supportedStrategies: ['SKIP', 'OVERWRITE'],
    requiredEditPermission: 'customers.edit',
  },
  quotes: {
    uniqueLookupKeys: ['quoteNumber'],
    supportedStrategies: ['SKIP', 'OVERWRITE', 'CREATE_COPY'],
    requiredEditPermission: 'quotes.edit',
  },
};

/**
 * Protected System Fields that must NEVER be overwritten or exposed in duplicate matching
 */
export const SYSTEM_PROTECTED_FIELDS = [
  'id',
  '_id',
  'tenantId',
  'companyId',
  'branchId',
  'createdAt',
  'createdBy',
  'permissions',
  'password',
  'roles',
];

export interface SystemRecordMatch {
  id: string;
  tenantId?: string;
  companyId?: string;
  data: Record<string, any>;
}

export interface DuplicateDetectionOptions {
  duplicateStrategy?: DuplicateHandlingStrategy;
  tenantContext?: {
    userId?: string;
    tenantId?: string;
    companyId?: string;
    branchId?: string;
    userPermissions?: string[];
  };
  existingValidationRows?: ImportRowValidation[];
  customSystemLookupHandler?: (
    resource: string,
    lookupKey: string,
    values: string[],
    tenantId?: string
  ) => Promise<Map<string, SystemRecordMatch>>;
}

export class ImportDuplicateDetectionService {
  /**
   * Normalizes a field value for duplicate detection comparison.
   * Preserves formula protection (inert text) and trims whitespace.
   */
  public static normalizeDuplicateKeyValue(value: any, fieldKey: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    let str = String(value).trim();
    if (str.length === 0) {
      return '';
    }

    // Preserve formula protection: leading single quote stays attached to preserve inert text
    if (str.startsWith("'") && /^[=+\-@\t\r]/.test(str.slice(1))) {
      // Keep as inert string
    }

    // Case normalization for email or reference keys
    const lowerKey = fieldKey.toLowerCase();
    if (lowerKey.includes('email')) {
      str = str.toLowerCase();
    } else if (lowerKey.includes('tracking') || lowerKey.includes('number') || lowerKey.includes('code')) {
      // Clean standard alphanumeric formatting if applicable
      str = str.toUpperCase();
    }

    return str;
  }

  /**
   * Checks whether a duplicate handling strategy is valid and authorized for the requested resource and user context.
   */
  public static validateStrategyAuthorization(
    resource: string,
    requestedStrategy: DuplicateHandlingStrategy,
    userPermissions: string[] = []
  ): { authorized: boolean; reasonEn?: string; reasonAr?: string } {
    const config = RESOURCE_DUPLICATE_CAPABILITIES[resource] || {
      uniqueLookupKeys: ['id'],
      supportedStrategies: ['SKIP', 'OVERWRITE'],
      requiredEditPermission: `${resource}.edit`,
    };

    if (!config.supportedStrategies.includes(requestedStrategy)) {
      return {
        authorized: false,
        reasonEn: `Strategy "${requestedStrategy}" is not supported for resource "${resource}". Supported strategies: ${config.supportedStrategies.join(', ')}.`,
        reasonAr: `استراتيجية التكرار "${requestedStrategy}" غير مدعومة للمورد "${resource}". الاستراتيجيات المدعومة: ${config.supportedStrategies.join(', ')}.`,
      };
    }

    if (requestedStrategy === 'OVERWRITE') {
      const hasPermission =
        userPermissions.includes('*') ||
        userPermissions.includes('*.write') ||
        userPermissions.includes(config.requiredEditPermission) ||
        userPermissions.includes(`${resource}.write`);

      if (!hasPermission) {
        return {
          authorized: false,
          reasonEn: `User lacks update permission "${config.requiredEditPermission}" required for OVERWRITE strategy on resource "${resource}".`,
          reasonAr: `يفتقر المستخدم إلى صلاحية التحديث "${config.requiredEditPermission}" المطلوبة لاستراتيجية الاستبدال على المورد "${resource}".`,
        };
      }
    }

    return { authorized: true };
  }

  /**
   * Core Enterprise Duplicate Detection Pipeline
   * Runs File-Level Duplicate Detection (O(N)) + System-Level Batched Lookup.
   */
  public static async detectAndClassifyDuplicates(
    resource: string,
    mappedRows: Record<string, any>[],
    options: DuplicateDetectionOptions = {}
  ): Promise<ImportDuplicateDetectionResult> {
    const requestedStrategy = options.duplicateStrategy || 'SKIP';
    const tenantContext = options.tenantContext || {};
    const tenantId = tenantContext.companyId || tenantContext.tenantId || 'tenant_default';
    const userPermissions = tenantContext.userPermissions || [];

    // 1. Resolve Schema & Configured Unique Lookup Keys
    const schema = resolveImportSchema(resource);
    const capConfig = RESOURCE_DUPLICATE_CAPABILITIES[resource];
    const uniqueKeys = capConfig ? capConfig.uniqueLookupKeys : schema.uniqueLookupKeys || ['id'];
    const supportedStrategies = capConfig
      ? capConfig.supportedStrategies
      : (['SKIP', 'OVERWRITE'] as DuplicateHandlingStrategy[]);

    // 2. Validate Requested Strategy & Permissions
    const authCheck = this.validateStrategyAuthorization(resource, requestedStrategy, userPermissions);
    if (!authCheck.authorized) {
      throw new Error(authCheck.reasonEn);
    }

    // 3. File-Level Duplicate Detection (O(N) Map-based grouping)
    // Key format: `${fieldKey}:${normalizedValue}` -> Array of 1-based row numbers
    const fileKeyToRowNumbers = new Map<string, number[]>();

    mappedRows.forEach((row, idx) => {
      const rowNum = idx + 1;
      uniqueKeys.forEach((key) => {
        const rawVal = row[key];
        const normVal = this.normalizeDuplicateKeyValue(rawVal, key);
        if (normVal !== '') {
          const mapKey = `${key}:${normVal}`;
          const existing = fileKeyToRowNumbers.get(mapKey) || [];
          existing.push(rowNum);
          fileKeyToRowNumbers.set(mapKey, existing);
        }
      });
    });

    // Identify rows that are file duplicates
    const fileDuplicateRowSet = new Set<number>();
    const duplicateGroupsMap = new Map<string, ImportDuplicateGroup>();

    fileKeyToRowNumbers.forEach((rowNums, mapKey) => {
      if (rowNums.length > 1) {
        rowNums.forEach((r) => fileDuplicateRowSet.add(r));
        const [matchField, duplicateKey] = mapKey.split(':');
        duplicateGroupsMap.set(mapKey, {
          duplicateKey,
          matchField,
          duplicateType: 'FILE',
          rowNumbers: rowNums,
        });
      }
    });

    // 4. System-Level Duplicate Detection (Batched Lookup)
    // Collect distinct lookup values per key
    const systemLookupValuesPerKey = new Map<string, Set<string>>();
    uniqueKeys.forEach((k) => systemLookupValuesPerKey.set(k, new Set<string>()));

    mappedRows.forEach((row) => {
      uniqueKeys.forEach((key) => {
        const rawVal = row[key];
        const normVal = this.normalizeDuplicateKeyValue(rawVal, key);
        if (normVal !== '') {
          systemLookupValuesPerKey.get(key)!.add(normVal);
        }
      });
    });

    // Execute batched system lookups with request-scoped cache
    // Cache map: `${matchField}:${normalizedValue}` -> SystemRecordMatch
    const systemRecordCache = new Map<string, SystemRecordMatch>();

    for (const key of uniqueKeys) {
      const distinctVals = Array.from(systemLookupValuesPerKey.get(key) || []);
      if (distinctVals.length === 0) continue;

      if (options.customSystemLookupHandler) {
        const customMatches = await options.customSystemLookupHandler(resource, key, distinctVals, tenantId);
        customMatches.forEach((match, val) => {
          systemRecordCache.set(`${key}:${val}`, match);
        });
      } else {
        // Query database in controlled chunks of FIRESTORE_IN_QUERY_BATCH_SIZE (30)
        for (let i = 0; i < distinctVals.length; i += FIRESTORE_IN_QUERY_BATCH_SIZE) {
          const batchVals = distinctVals.slice(i, i + FIRESTORE_IN_QUERY_BATCH_SIZE);
          try {
            const snap = await getAdminFirestore()
              .collection(resource)
              .where(key, 'in', batchVals)
              .get();
            snap.docs.forEach((d) => {
              const data = d.data();
              // Tenant isolation filter: record must match authenticated tenant context
              const recTenantId = data.companyId || data.tenantId;
              if (!recTenantId || recTenantId === tenantId || tenantId === 'tenant_default') {
                const matchedVal = this.normalizeDuplicateKeyValue(data[key], key);
                if (matchedVal) {
                  systemRecordCache.set(`${key}:${matchedVal}`, {
                    id: d.id,
                    tenantId: data.tenantId,
                    companyId: data.companyId,
                    data,
                  });
                }
              }
            });
          } catch (dbErr) {
            console.warn(`[DuplicateDetection] Database batch query failed for ${resource}.${key}:`, dbErr);
          }
        }
      }
    }

    // 5. Per-Row Duplicate Classification & Conflict Evaluation
    const matchesList: ImportDuplicateMatch[] = [];
    const rowValidationResults: ImportRowValidation[] = [];

    let fileDuplicateCount = 0;
    let systemDuplicateCount = 0;
    let conflictCount = 0;

    mappedRows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const isFileDup = fileDuplicateRowSet.has(rowNum);

      // Check system duplicate matches
      const systemMatchesForRow: Array<{ key: string; val: string; record: SystemRecordMatch }> = [];
      uniqueKeys.forEach((key) => {
        const rawVal = row[key];
        const normVal = this.normalizeDuplicateKeyValue(rawVal, key);
        if (normVal !== '') {
          const mapKey = `${key}:${normVal}`;
          if (systemRecordCache.has(mapKey)) {
            systemMatchesForRow.push({
              key,
              val: normVal,
              record: systemRecordCache.get(mapKey)!,
            });
          }
        }
      });

      // Conflict detection: if multiple keys point to DIFFERENT system records
      const distinctSystemRecordIds = new Set(systemMatchesForRow.map((m) => m.record.id));
      const isConflict = distinctSystemRecordIds.size > 1;

      let isSystemDup = false;
      let primaryMatchedRecordId: string | undefined;

      if (isConflict) {
        conflictCount++;
        isSystemDup = true;
        const matchedIds = Array.from(distinctSystemRecordIds).join(', ');
        matchesList.push({
          rowNumber: rowNum,
          resource,
          duplicateKey: systemMatchesForRow.map((m) => `${m.key}=${m.val}`).join(' & '),
          existingRecordId: Array.from(distinctSystemRecordIds)[0],
          duplicateType: 'SYSTEM',
          matchField: systemMatchesForRow.map((m) => m.key).join('+'),
          matchValue: systemMatchesForRow.map((m) => m.val).join('+'),
          isConflict: true,
          conflictDetailsEn: `Row matches multiple distinct system records (${matchedIds}). Manual review required.`,
          conflictDetailsAr: `الصف يطابق سجلات متعددة مختلفة في النظام (${matchedIds}). تتطلب مراجعة يدوية.`,
        });
      } else if (systemMatchesForRow.length > 0) {
        isSystemDup = true;
        systemDuplicateCount++;
        primaryMatchedRecordId = systemMatchesForRow[0].record.id;
        systemMatchesForRow.forEach((m) => {
          matchesList.push({
            rowNumber: rowNum,
            resource,
            duplicateKey: m.val,
            existingRecordId: m.record.id,
            duplicateType: 'SYSTEM',
            matchField: m.key,
            matchValue: m.val,
          });
        });
      }

      if (isFileDup) {
        fileDuplicateCount++;
        uniqueKeys.forEach((key) => {
          const rawVal = row[key];
          const normVal = this.normalizeDuplicateKeyValue(rawVal, key);
          const mapKey = `${key}:${normVal}`;
          if (normVal && (fileKeyToRowNumbers.get(mapKey)?.length || 0) > 1) {
            matchesList.push({
              rowNumber: rowNum,
              resource,
              duplicateKey: normVal,
              duplicateType: 'FILE',
              matchField: key,
              matchValue: normVal,
            });
          }
        });
      }

      // Preserve existing structural validation errors if provided
      const existingRowVal = options.existingValidationRows?.[idx];
      const existingErrors = existingRowVal?.errors || [];

      const isDuplicate = isFileDup || isSystemDup;
      let status: ImportRowValidation['status'] = 'VALID';

      if (existingErrors.length > 0) {
        status = 'INVALID';
      } else if (isDuplicate) {
        status = 'DUPLICATE';
      }

      rowValidationResults.push({
        rowIndex: rowNum,
        rawData: row,
        mappedData: row,
        isValid: existingErrors.length === 0,
        status,
        errors: existingErrors,
        isDuplicate,
        existingRecordId: primaryMatchedRecordId,
        duplicateType: isSystemDup ? 'SYSTEM' : isFileDup ? 'FILE' : undefined,
      });
    });

    // 6. Summary Statistics Calculation
    const totalRows = mappedRows.length;
    const uniqueRows = totalRows - (fileDuplicateRowSet.size + (systemDuplicateCount - conflictCount));
    const duplicateGroups = Array.from(duplicateGroupsMap.values());

    let rowsEligibleForImport = 0;
    if (requestedStrategy === 'SKIP') {
      rowsEligibleForImport = rowValidationResults.filter((r) => r.isValid && !r.isDuplicate).length;
    } else if (requestedStrategy === 'OVERWRITE') {
      rowsEligibleForImport = rowValidationResults.filter((r) => r.isValid && (!r.isDuplicate || r.duplicateType === 'SYSTEM')).length;
    } else if (requestedStrategy === 'CREATE_COPY') {
      rowsEligibleForImport = rowValidationResults.filter((r) => r.isValid).length;
    }

    const summary: ImportDuplicateSummary = {
      totalRows,
      uniqueRows: Math.max(0, uniqueRows),
      fileDuplicateRows: fileDuplicateRowSet.size,
      systemDuplicateRows: systemDuplicateCount,
      conflictRows: conflictCount,
      duplicateGroupsCount: duplicateGroups.length,
      rowsEligibleForImport,
    };

    // 7. Bounded Sample Capping (Max 50 items returned to client)
    const sampleDuplicateMatches = matchesList.slice(0, BOUNDED_DUPLICATE_SAMPLE_LIMIT);
    const sampleRows = rowValidationResults.slice(0, BOUNDED_DUPLICATE_SAMPLE_LIMIT);

    return {
      resource,
      duplicateStrategy: requestedStrategy,
      supportedStrategies,
      summary,
      sampleDuplicateMatches,
      sampleRows,
      duplicateGroups,
    };
  }
}
