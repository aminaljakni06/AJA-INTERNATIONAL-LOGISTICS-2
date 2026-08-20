/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Import Execution Planning Service
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Execution Planning & Dry Run Framework (STEP 05.18.10)
 * Version: 1.0
 */

import {
  BulkExecutionPolicy,
  DuplicateHandlingStrategy,
  ImportExecutionPlan,
  ImportPreviewResponse,
  ImportPreviewRow,
  PlannedAction,
} from '../types/dataTransferFramework';
import {
  ImportDuplicateDetectionService,
  RESOURCE_DUPLICATE_CAPABILITIES,
} from './importDuplicateDetectionService';
import { importValidationService } from './importValidationService';
import { createHash } from 'crypto';

/**
 * Safe Firestore write batch size constant for estimation and future chunking.
 * Strictly bounded well below Firestore's 500-operation transaction hard limit.
 */
export const SAFE_FIRESTORE_WRITE_BATCH_SIZE = 400;

/**
 * Capped maximum for sample preview rows returned to client (prevents massive payload transfers)
 */
export const BOUNDED_PREVIEW_SAMPLE_LIMIT = 50;

export interface PlanningOptions {
  duplicateStrategy?: DuplicateHandlingStrategy;
  executionPolicy?: BulkExecutionPolicy;
  tenantContext?: {
    userId?: string;
    tenantId?: string;
    companyId?: string;
    branchId?: string;
    userPermissions?: string[];
  };
}

export class ImportExecutionPlanningService {
  /**
   * Generates a deterministic SHA-256 fingerprint for the plan parameters
   * to guarantee stale plan detection if parameters change before confirmation.
   */
  public static generatePlanFingerprint(
    resource: string,
    totalRows: number,
    duplicateStrategy: DuplicateHandlingStrategy,
    executionPolicy: BulkExecutionPolicy,
    createCount: number,
    updateCount: number,
    skipCount: number,
    blockedCount: number,
    tenantId: string
  ): string {
    const raw = [
      resource,
      String(totalRows),
      duplicateStrategy,
      executionPolicy,
      String(createCount),
      String(updateCount),
      String(skipCount),
      String(blockedCount),
      tenantId,
    ].join('|');

    return createHash('sha256').update(raw).digest('hex').substring(0, 32);
  }

  /**
   * Masks sensitive fields in mapped row data if the user lacks sensitive field permissions.
   */
  public static maskSensitiveFields(
    mappedData: Record<string, any>,
    resource: string,
    userPermissions: string[] = []
  ): Record<string, any> {
    const hasSensitiveAccess =
      userPermissions.includes('*') ||
      userPermissions.includes('*.sensitive') ||
      userPermissions.includes(`${resource}.sensitive`);

    if (hasSensitiveAccess) {
      return mappedData;
    }

    const masked = { ...mappedData };
    const sensitiveKeys = ['vatNumber', 'bankAccount', 'iban', 'salary', 'taxId'];

    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        masked[key] = '***MASKED***';
      }
    }

    return masked;
  }

  /**
   * Core Dry-Run Execution Planning Engine
   * Consolidates Validation (05.18.08) and Duplicate Detection (05.18.09) without performing ANY database writes.
   */
  public static async buildImportExecutionPlan(
    resource: string,
    parsedFile: any,
    userMappings: Record<string, string>,
    options: PlanningOptions = {}
  ): Promise<ImportPreviewResponse> {
    const duplicateStrategy: DuplicateHandlingStrategy = options.duplicateStrategy || 'SKIP';
    const executionPolicy: BulkExecutionPolicy = options.executionPolicy || 'BEST_EFFORT';
    const tenantContext = options.tenantContext || {};
    const tenantId = tenantContext.companyId || tenantContext.tenantId || 'tenant_default';
    const userPermissions = tenantContext.userPermissions || ['*'];

    const blockers: Array<{ code: string; messageEn: string; messageAr: string }> = [];

    // 1. Revalidate Resource & Strategy Authorization
    const capConfig = RESOURCE_DUPLICATE_CAPABILITIES[resource];
    const authCheck = ImportDuplicateDetectionService.validateStrategyAuthorization(
      resource,
      duplicateStrategy,
      userPermissions
    );

    if (!authCheck.authorized) {
      blockers.push({
        code: 'UNSUPPORTED_DUPLICATE_STRATEGY',
        messageEn: authCheck.reasonEn || 'Requested duplicate strategy is not authorized.',
        messageAr: authCheck.reasonAr || 'استراتيجية التكرار المطلوبة غير مخولة.',
      });
    }

    // 2. Execute Validation Pipeline (STEP 05.18.08)
    const valResult = await importValidationService.validateImportPayload(
      {
        resource,
        parsedFile,
        userMappings,
      },
      {
        userId: tenantContext.userId,
        companyId: tenantId,
        tenantId,
        branchId: tenantContext.branchId,
      }
    );

    const validationRows = valResult.sampleRows || [];
    const activeMappedRows = validationRows.map((r) => r.mappedData);

    // 3. Execute Duplicate Detection Pipeline (STEP 05.18.09)
    let duplicateResult;
    try {
      duplicateResult = await ImportDuplicateDetectionService.detectAndClassifyDuplicates(
        resource,
        activeMappedRows,
        {
          duplicateStrategy,
          tenantContext: {
            userId: tenantContext.userId,
            tenantId,
            companyId: tenantId,
            branchId: tenantContext.branchId,
            userPermissions,
          },
          existingValidationRows: validationRows,
        }
      );
    } catch (dupErr: any) {
      blockers.push({
        code: 'DUPLICATE_LOOKUP_FAILED',
        messageEn: dupErr.message || 'Duplicate detection failed during execution planning.',
        messageAr: 'فشل التنسيق والتحقق من التكرارات أثناء تخطيط التنفيذ.',
      });
    }

    // 4. Determine Per-Row Planned Actions according to deterministic rules
    const samplePreviewRows: ImportPreviewRow[] = [];

    let createCount = 0;
    let updateCount = 0;
    let skipCount = 0;
    let blockedCount = 0;
    let warningCount = 0;

    const totalRows = parsedFile.totalRowCount || activeMappedRows.length;

    validationRows.forEach((valRow, idx) => {
      const rowNum = valRow.rowIndex;
      const dupRow = duplicateResult?.sampleRows.find((r) => r.rowIndex === rowNum) || valRow;
      const dupMatch = duplicateResult?.sampleDuplicateMatches.find((m) => m.rowNumber === rowNum);

      const hasErrors = !valRow.isValid || valRow.errors.length > 0;
      const isConflict = dupMatch?.isConflict === true;
      const isSystemDup = dupRow.duplicateType === 'SYSTEM';
      const isFileDup = dupRow.duplicateType === 'FILE';

      let plannedAction: PlannedAction = 'CREATE';

      if (hasErrors || isConflict) {
        plannedAction = 'BLOCKED';
        blockedCount++;
      } else if (isSystemDup) {
        if (duplicateStrategy === 'SKIP') {
          plannedAction = 'SKIP';
          skipCount++;
        } else if (duplicateStrategy === 'OVERWRITE') {
          plannedAction = 'UPDATE';
          updateCount++;
        } else if (duplicateStrategy === 'CREATE_COPY') {
          plannedAction = 'CREATE';
          createCount++;
        }
      } else if (isFileDup) {
        // For file duplicates, first occurrence can be CREATE, secondary occurrences SKIP
        const fileGroup = duplicateResult?.duplicateGroups.find((g) => g.rowNumbers.includes(rowNum));
        const isFirstInGroup = fileGroup ? fileGroup.rowNumbers[0] === rowNum : true;

        if (duplicateStrategy === 'SKIP' || duplicateStrategy === 'OVERWRITE') {
          if (isFirstInGroup) {
            plannedAction = 'CREATE';
            createCount++;
          } else {
            plannedAction = 'SKIP';
            skipCount++;
          }
        } else if (duplicateStrategy === 'CREATE_COPY') {
          plannedAction = 'CREATE';
          createCount++;
        }
      } else {
        // Valid non-duplicate row
        plannedAction = 'CREATE';
        createCount++;
      }

      if (valRow.errors.length === 0 && valRow.status === 'WARNING') {
        warningCount++;
      }

      // Collect sample preview rows up to BOUNDED_PREVIEW_SAMPLE_LIMIT (50)
      if (idx < BOUNDED_PREVIEW_SAMPLE_LIMIT) {
        const maskedFields = this.maskSensitiveFields(valRow.mappedData, resource, userPermissions);
        samplePreviewRows.push({
          rowNumber: rowNum,
          validationStatus: valRow.status,
          duplicateType: dupRow.duplicateType,
          plannedAction,
          mappedFieldsSample: maskedFields,
          errors: valRow.errors.map((e) => ({
            field: e.field,
            messageEn: e.messageEn,
            messageAr: e.messageAr,
          })),
          warnings: [],
          isConflict,
        });
      }
    });

    // 5. Enforce Count Invariant Rule:
    // createCount + updateCount + skipCount + blockedCount === totalRows
    const sumCount = createCount + updateCount + skipCount + blockedCount;
    if (sumCount !== totalRows) {
      blockers.push({
        code: 'COUNT_INVARIANT_VIOLATION',
        messageEn: `Execution plan count invariant failure: sum(${sumCount}) != totalRows(${totalRows}).`,
        messageAr: `فشل موازنة أعداد خطة التنفيذ: المجموع (${sumCount}) لا يساوي إجمالي الصفوف (${totalRows}).`,
      });
    }

    // 6. Policy Planning Evaluation (ATOMIC vs BEST_EFFORT)
    if (executionPolicy === 'ATOMIC' && blockedCount > 0) {
      blockers.push({
        code: 'ATOMIC_POLICY_BLOCKED',
        messageEn: `ATOMIC execution policy requires 0 blocked rows before execution. Currently ${blockedCount} blocked rows exist.`,
        messageAr: `سياسة التنفيذ الذرية (ATOMIC) تتطلب 0 صفوف محظورة قبل البدء. يوجد حالياً ${blockedCount} صفوف محظورة.`,
      });
    }

    if (createCount + updateCount === 0 && totalRows > 0) {
      blockers.push({
        code: 'NO_EXECUTABLE_ROWS',
        messageEn: 'Execution plan contains 0 write operations (all rows are skipped or blocked).',
        messageAr: 'خطة التنفيذ لا تحتوي على أي عمليات كتابة (جميع الصفوف تم تخطيها أو حظرها).',
      });
    }

    // 7. Calculate Write Estimates & Batch Count
    const estimatedWriteOperations = createCount + updateCount;
    const estimatedBatchCount =
      estimatedWriteOperations === 0 ? 0 : Math.ceil(estimatedWriteOperations / SAFE_FIRESTORE_WRITE_BATCH_SIZE);

    const canExecute = blockers.length === 0;

    // 8. Generate Plan ID & Deterministic Fingerprint
    const generatedAt = new Date().toISOString();
    const planId = `plan_imp_${resource}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const planFingerprint = this.generatePlanFingerprint(
      resource,
      totalRows,
      duplicateStrategy,
      executionPolicy,
      createCount,
      updateCount,
      skipCount,
      blockedCount,
      tenantId
    );

    const executionPlan: ImportExecutionPlan = {
      planId,
      planFingerprint,
      resource,
      totalRows,
      createCount,
      updateCount,
      skipCount,
      blockedCount,
      warningCount,
      duplicateCount: (duplicateResult?.summary.fileDuplicateRows || 0) + (duplicateResult?.summary.systemDuplicateRows || 0),
      conflictCount: duplicateResult?.summary.conflictRows || 0,
      estimatedWriteOperations,
      estimatedBatchCount,
      executionPolicy,
      duplicateStrategy,
      canExecute,
      blockers,
      generatedAt,
    };

    const requiresTypedConfirmation = updateCount > 0;

    return {
      resource,
      executionPlan,
      previewSummary: {
        totalRows,
        validRows: valResult.summary?.validRows || 0,
        warningRows: warningCount,
        invalidRows: valResult.summary?.invalidRows || 0,
        duplicateRows: (duplicateResult?.summary.fileDuplicateRows || 0) + (duplicateResult?.summary.systemDuplicateRows || 0),
        fileDuplicateRows: duplicateResult?.summary.fileDuplicateRows || 0,
        systemDuplicateRows: duplicateResult?.summary.systemDuplicateRows || 0,
        conflictRows: duplicateResult?.summary.conflictRows || 0,
      },
      samplePreviewRows,
      confirmationRequirements: {
        requiresTypedConfirmation,
        confirmationPhrase: requiresTypedConfirmation ? 'OVERWRITE' : undefined,
      },
    };
  }

  /**
   * Verifies plan confirmation against fingerprint and required confirmation phrase without performing database writes.
   */
  public static confirmImportPlan(
    plan: ImportExecutionPlan,
    clientFingerprint: string,
    typedPhrase?: string
  ): { confirmed: boolean; errorEn?: string; errorAr?: string } {
    if (!plan.canExecute) {
      return {
        confirmed: false,
        errorEn: 'Cannot confirm a plan with execution blockers.',
        errorAr: 'لا يمكن تأكيد خطة تحتوي على عوائق تنفيذ.',
      };
    }

    if (plan.planFingerprint !== clientFingerprint) {
      return {
        confirmed: false,
        errorEn: 'STALE_IMPORT_PLAN: Plan parameters have changed since plan generation.',
        errorAr: 'خطة المستورد قديمة: تغيرت شروط الخطة منذ تاريخ إنشائها.',
      };
    }

    if (plan.updateCount > 0) {
      if (!typedPhrase || typedPhrase.trim().toUpperCase() !== 'OVERWRITE') {
        return {
          confirmed: false,
          errorEn: 'INVALID_CONFIRMATION_PHRASE: Typed phrase "OVERWRITE" is required for plans containing updates.',
          errorAr: 'عبارة التأكيد غير صالحة: يجب كتابة "OVERWRITE" لتأكيد الخطة التي تحتوي على تحديثات.',
        };
      }
    }

    return { confirmed: true };
  }
}
