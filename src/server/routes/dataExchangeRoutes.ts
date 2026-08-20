/**
 * AJA INTERNATIONAL LOGISTICS — Express API Routes for Data Exchange (Export & Import)
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18)
 * Version: 1.0
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { DataExchangeService } from '../../services/dataExchangeService';
import { ImportParserService } from '../../services/importParserService';
import { getResourceAllowlistSchema } from '../../lib/exchange/fieldAllowlist';
import { resolveExportPolicy } from '../../lib/exchange/exportPolicyResolver';
import { streamCSVResponse, serializeCSVContent, sanitizeFilename } from '../../lib/exchange/csvExportEngine';
import { generateXLSXBuffer, sanitizeXLSXFilename, XLSX_MIME_TYPE } from '../../lib/exchange/xlsxExportEngine';
import { createAuditLog } from '../../db/repositories/auditLogRepository';
import { getImportOperation } from '../../db/repositories/importOperationRepository';
import { ImportExecutionService } from '../../services/importExecutionService';

const router = Router();

router.use(requireAuth);

function permissionsForRequest(req: AuthenticatedRequest): string[] {
  const role = req.user!.role;
  if (role === 'ADMIN') {
    return ['*'];
  }
  if (role === 'STAFF') {
    return ['analytics:view', 'reports:view', 'shipping:shipment:view', 'customer:view', 'quote:view', 'finance:view'];
  }
  return ['customer:view'];
}

/**
 * GET /api/data-exchange/allowlist?resource=shipments
 * Retrieve field allow-list schema for a resource
 */
router.get('/allowlist', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resource = (req.query.resource as string) || 'shipments';
    const schema = getResourceAllowlistSchema(resource);
    return res.json({ success: true, data: schema });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ALLOWLIST_FETCH_ERROR', message: err.message || 'Failed to fetch field allow-list.' },
    });
  }
});

/**
 * POST /api/data-exchange/export
 * Execute Server-Authoritative Export using BulkSelectionDescriptor
 */
router.post('/export', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';

    const result = await DataExchangeService.exportData(req.body, { userId, tenantId });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'EXPORT_EXECUTION_FAILED', message: err.message || 'Data export failed.' },
    });
  }
});

/**
 * POST /api/data-exchange/export/download
 * Secure Streamed CSV File Download Endpoint
 * Validates policy & limits before headers, streams UTF-8 CSV with disposition attachment
 */
router.post('/export/download', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';
    const branchId = (req.headers['x-branch-id'] as string) || undefined;
    const resource = req.body.resource;

    // 1. Resolve Export Policy
    const policyResult = await resolveExportPolicy(
      resource,
      req.body,
      { userId, companyId, branchId, tenantId: companyId }
    );

    if (!policyResult.success || !policyResult.policy) {
      return res.status(400).json({
        success: false,
        error: {
          code: policyResult.errorCode || 'EXPORT_POLICY_FAILED',
          message: policyResult.errorMessageEn || 'Export policy validation failed.',
          messageAr: policyResult.errorMessageAr,
        },
      });
    }

    const policy = policyResult.policy;

    // 2. Resolve Records
    const records = await DataExchangeService['resolveRecordsFromSelection'](resource, policy.selection);

    // 3. Enforce Record Limit before committing stream headers
    if (records.length > policy.effectiveRecordLimit) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'EXPORT_LIMIT_EXCEEDED',
          message: `Export dataset size (${records.length}) exceeds maximum allowed limit of ${policy.effectiveRecordLimit} records.`,
          messageAr: `حجم البيانات المراد تصديرها (${records.length}) يتجاوز الحد الأقصى المسموح به وهو ${policy.effectiveRecordLimit} سجل.`,
        },
      });
    }

    // 4. Handle Format Specific Binary / Stream Output
    if (policy.format === 'xlsx') {
      const safeName = sanitizeXLSXFilename(policy.fileName, resource);
      const xlsxBuffer = await generateXLSXBuffer(records, policy, req.body.locale || 'en');

      res.setHeader('Content-Type', XLSX_MIME_TYPE);
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      res.setHeader('Content-Length', xlsxBuffer.length);

      res.send(xlsxBuffer);

      try {
        await createAuditLog({
          actorUserId: userId,
          action: 'DATA_EXPORT_XLSX_DOWNLOADED',
          entityType: resource,
          entityId: `exp_xlsx_${Date.now()}`,
          after: {
            recordCount: records.length,
            bytesWritten: xlsxBuffer.length,
            fileName: safeName,
            selectedFields: policy.allowedFieldKeys,
            sensitiveFieldsExcluded: policy.sensitiveFieldsExcluded,
          },
        });
      } catch (auditErr) {
        console.warn('[DataExchange] XLSX download audit log error:', auditErr);
      }
    } else {
      // Default CSV Download
      const safeName = sanitizeFilename(policy.fileName, resource);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

      let clientAborted = false;
      res.on('close', () => {
        clientAborted = true;
      });

      const writable = res as any;
      writable.clientAborted = clientAborted;

      const { recordCount, bytesWritten } = await streamCSVResponse(
        records,
        policy,
        writable,
        req.body.locale || 'en'
      );

      try {
        await createAuditLog({
          actorUserId: userId,
          action: 'DATA_EXPORT_CSV_STREAMED',
          entityType: resource,
          entityId: `exp_stream_${Date.now()}`,
          after: {
            recordCount,
            bytesWritten,
            fileName: safeName,
            selectedFields: policy.allowedFieldKeys,
            sensitiveFieldsExcluded: policy.sensitiveFieldsExcluded,
          },
        });
      } catch (auditErr) {
        console.warn('[DataExchange] Stream audit log error:', auditErr);
      }
    }
  } catch (err: any) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: { code: 'EXPORT_STREAM_FAILED', message: err.message || 'CSV download failed.' },
      });
    } else {
      res.end();
    }
  }
});

/**
 * POST /api/data-exchange/import/parse
 * Enterprise Import Upload & Parser Framework Endpoint (STEP 05.18.07)
 * Authoritatively validates file, mime type, extension, signature, size limits and parses CSV / XLSX
 */
router.post('/import/parse', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';
    const branchId = (req.headers['x-branch-id'] as string) || undefined;
    const userPermissions = permissionsForRequest(req);

    const {
      resource = 'shipments',
      fileContent,
      fileBufferBase64,
      fileName = 'import_file.csv',
      fileMimeType,
      worksheetName,
    } = req.body;

    let buffer: Buffer;

    if (fileBufferBase64) {
      buffer = Buffer.from(fileBufferBase64, 'base64');
    } else if (fileContent) {
      if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
        const base64Parts = fileContent.split(';base64,');
        if (base64Parts.length === 2) {
          buffer = Buffer.from(base64Parts[1], 'base64');
        } else {
          buffer = Buffer.from(fileContent, 'utf-8');
        }
      } else if (typeof fileContent === 'string') {
        // If file is binary or base64 or plain string
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        if (ext === 'xlsx') {
          buffer = Buffer.from(fileContent, 'base64');
        } else {
          buffer = Buffer.from(fileContent, 'utf-8');
        }
      } else {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Invalid fileContent payload.' },
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_FILE', message: 'fileContent or fileBufferBase64 parameter is required.' },
      });
    }

    const parseResult = await ImportParserService.parseUpload(
      resource,
      buffer,
      {
        name: fileName,
        mimeType: fileMimeType,
      },
      {
        userId,
        companyId,
        branchId,
        tenantId: companyId,
        userPermissions,
      },
      {
        worksheetName,
      }
    );

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error,
      });
    }

    return res.json({
      success: true,
      data: parseResult.data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'IMPORT_PARSE_FAILED', message: err.message || 'Failed to parse file.' },
    });
  }
});

import { ImportValidationService, importValidationService } from '../../services/importValidationService';
import { ImportDuplicateDetectionService } from '../../services/importDuplicateDetectionService';
import { ImportExecutionPlanningService } from '../../services/importExecutionPlanningService';

/**
 * POST /api/data-exchange/import/plan
 * STEP 05.18.10: Enterprise Pre-Execution Dry-Run Planning & Preview Endpoint
 * Generates bounded preview, execution plan, write & batch estimates without writing to database.
 */
router.post('/import/plan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';
    const branchId = (req.headers['x-branch-id'] as string) || undefined;
    const userPermissions = permissionsForRequest(req);

    const {
      resource,
      parsedFile,
      userMappings,
      mappings,
      columnMappings,
      duplicateStrategy = 'SKIP',
      executionPolicy = 'BEST_EFFORT',
    } = req.body;

    if (!resource || !parsedFile) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Parameters "resource" and "parsedFile" are required for import planning.' },
      });
    }

    const activeMappings = userMappings || mappings || columnMappings || {};

    const previewResponse = await ImportExecutionPlanningService.buildImportExecutionPlan(
      resource,
      parsedFile,
      activeMappings,
      {
        duplicateStrategy,
        executionPolicy,
        tenantContext: {
          userId,
          companyId,
          branchId,
          tenantId: companyId,
          userPermissions,
        },
      }
    );

    return res.json({
      success: true,
      data: previewResponse,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PLAN_EXECUTION_BLOCKED',
        message: err.message || 'Import execution planning failed.',
      },
    });
  }
});

/**
 * POST /api/data-exchange/import/confirm
 * STEP 05.18.10: Enterprise Plan Confirmation Endpoint
 * Validates plan fingerprint and typed confirmation without performing ANY database writes.
 */
router.post('/import/confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { executionPlan, clientFingerprint, typedPhrase } = req.body;

    if (!executionPlan || !clientFingerprint) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Parameters "executionPlan" and "clientFingerprint" are required.' },
      });
    }

    const confirmationResult = ImportExecutionPlanningService.confirmImportPlan(
      executionPlan,
      clientFingerprint,
      typedPhrase
    );

    if (!confirmationResult.confirmed) {
      return res.status(400).json({
        success: false,
        error: {
          code: confirmationResult.errorEn?.startsWith('STALE')
            ? 'STALE_IMPORT_PLAN'
            : 'INVALID_CONFIRMATION_PHRASE',
          message: confirmationResult.errorEn,
          messageAr: confirmationResult.errorAr,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        confirmed: true,
        planId: executionPlan.planId,
        status: 'CONFIRMED',
        messageEn: 'Import plan successfully confirmed and ready for execution planning stage.',
        messageAr: 'تم تأكيد خطة الاستيراد بنجاح وهي جاهزة لمرحلة التنفيذ المستقبلي.',
      },
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PLAN_EXECUTION_BLOCKED',
        message: err.message || 'Plan confirmation failed.',
      },
    });
  }
});

/**
 * POST /api/data-exchange/import/duplicates
 * STEP 05.18.09: Enterprise Duplicate Detection & Resolution Framework Endpoint
 * Detects file & system duplicates, evaluates composite/conflicting matches, and validates duplicate strategies
 */
router.post('/import/duplicates', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';
    const branchId = (req.headers['x-branch-id'] as string) || undefined;
    const userPermissions = permissionsForRequest(req);

    const {
      resource,
      parsedFile,
      userMappings,
      mappings,
      columnMappings,
      mappedRows: rawMappedRows,
      duplicateStrategy = 'SKIP',
    } = req.body;

    if (!resource) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Parameter "resource" is required for duplicate detection.' },
      });
    }

    let activeMappedRows: Record<string, any>[] = [];
    let existingValidationRows: any[] | undefined;

    if (parsedFile) {
      const activeMappings = userMappings || mappings || columnMappings;
      const valResult = await importValidationService.validateImportPayload(
        {
          resource,
          parsedFile,
          userMappings: activeMappings,
        },
        { userId, companyId, branchId, tenantId: companyId }
      );
      activeMappedRows = (valResult.sampleRows || []).map((r) => r.mappedData);
      existingValidationRows = valResult.sampleRows;
    } else if (Array.isArray(rawMappedRows)) {
      activeMappedRows = rawMappedRows;
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Either "parsedFile" or "mappedRows" must be provided for duplicate detection.' },
      });
    }

    const detectionResult = await ImportDuplicateDetectionService.detectAndClassifyDuplicates(
      resource,
      activeMappedRows,
      {
        duplicateStrategy,
        tenantContext: {
          userId,
          companyId,
          branchId,
          tenantId: companyId,
          userPermissions,
        },
        existingValidationRows,
      }
    );

    return res.json({
      success: true,
      data: detectionResult,
    });
  } catch (err: any) {
    const isAuthErr = err.message?.includes('not supported') || err.message?.includes('lacks update permission');
    return res.status(400).json({
      success: false,
      error: {
        code: isAuthErr ? 'UNSUPPORTED_DUPLICATE_STRATEGY' : 'DUPLICATE_LOOKUP_FAILED',
        message: err.message || 'Duplicate detection failed.',
      },
    });
  }
});

/**
 * POST /api/data-exchange/import/validate
 * STEP 05.18.08: Authoritative Server-Side Schema Mapping & Row Validation Endpoint
 */
router.post('/import/validate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';
    const branchId = (req.headers['x-branch-id'] as string) || undefined;
    const userPermissions = permissionsForRequest(req);

    const { resource, parsedFile, userMappings, mappings, columnMappings, mappedRows } = req.body;

    if (!resource) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Parameter "resource" is required for import validation.' },
      });
    }

    if (parsedFile) {
      const activeMappings = userMappings || mappings || columnMappings;
      const validationResult = await importValidationService.validateImportPayload(
        {
          resource,
          parsedFile,
          userMappings: activeMappings,
        },
        {
          userId,
          companyId,
          branchId,
          tenantId: companyId,
        }
      );

      return res.json({
        success: true,
        data: validationResult,
      });
    }

    if (Array.isArray(mappedRows)) {
      const validationResult = await DataExchangeService.validateAndDetectDuplicates(resource, mappedRows);
      return res.json({
        success: true,
        data: validationResult,
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PAYLOAD', message: 'Either "parsedFile" or "mappedRows" must be provided for import validation.' },
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code || 'IMPORT_VALIDATION_FAILED',
        message: err.message || 'Validation failed.',
        messageAr: err.messageAr,
      },
    });
  }
});

/**
 * POST /api/data-exchange/import/execute
 * STEP 05.18.11: Execute Confirmed Import Plan with Real Database Writes & Idempotency
 */
router.post('/import/execute', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';
    const branchId = (req.headers['x-branch-id'] as string) || undefined;
    const userPermissions = permissionsForRequest(req);

    const result = await DataExchangeService.executeImport(req.body, {
      userId,
      tenantId: companyId,
      companyId,
      branchId,
      userPermissions,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code || 'IMPORT_EXECUTION_FAILED',
        message: err.messageEn || err.message || 'Import execution failed.',
        messageAr: err.messageAr,
      },
    });
  }
});

/**
 * GET /api/data-exchange/import/errors/:operationId
 * STEP 05.18.11: Download CSV Error Report for Failed/Problematic Import Rows
 */
router.get('/import/errors/:operationId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const operationId = req.params.operationId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';

    const opDoc = await getImportOperation(operationId, companyId);
    if (!opDoc) {
      return res.status(404).json({
        success: false,
        error: { code: 'OPERATION_NOT_FOUND', message: `Import operation "${operationId}" not found or unauthorized.` },
      });
    }

    const csvContent = opDoc.errorReportCsv || 'Row,Planned Action,Result,Error Code,Error Message,Retryable\n';
    const filename = sanitizeFilename(`import_errors_${operationId}.csv`);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.send(Buffer.from(csvContent, 'utf-8'));
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ERROR_REPORT_FETCH_FAILED', message: err.message || 'Failed to fetch error report.' },
    });
  }
});

/**
 * GET /api/data-exchange/import/status/:operationId
 * STEP 05.18.11: Retrieve Import Operation Status & Execution Result
 */
router.get('/import/status/:operationId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const operationId = req.params.operationId;
    const companyId = (req.headers['x-company-id'] as string) || (req.headers['x-tenant-id'] as string) || 'tenant_aja_default';

    const opDoc = await getImportOperation(operationId, companyId);
    if (!opDoc) {
      return res.status(404).json({
        success: false,
        error: { code: 'OPERATION_NOT_FOUND', message: `Import operation "${operationId}" not found or unauthorized.` },
      });
    }

    return res.json({
      success: true,
      data: {
        operationId: opDoc.operationId,
        planId: opDoc.planId,
        status: opDoc.status,
        result: opDoc.result,
        hasErrorReport: !!opDoc.errorReportCsv,
        createdAt: opDoc.createdAt,
        updatedAt: opDoc.updatedAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'STATUS_FETCH_FAILED', message: err.message || 'Failed to fetch operation status.' },
    });
  }
});

export default router;
