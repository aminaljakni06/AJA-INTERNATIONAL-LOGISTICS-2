/**
 * AJA INTERNATIONAL LOGISTICS — Server-Authoritative Import Parser Service
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Upload & Parser Framework (STEP 05.18.07)
 * Version: 1.0
 */

import { ParsedImportFile, ImportFileMetadata } from '../types/dataTransferFramework';
import { validateImportFile } from '../lib/exchange/importParsers/fileValidator';
import { resolveImportParser } from '../lib/exchange/importParsers/parserRegistry';
import { ImportParserError, ImportParserOptions } from '../lib/exchange/importParsers/importParserInterface';
import { getResourceAllowlistSchema } from '../lib/exchange/fieldAllowlist';
import { createAuditLog } from '../db/repositories/auditLogRepository';

export interface ImportParseContext {
  userId: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  userPermissions?: string[];
}

export class ImportParserService {
  /**
   * Authoritative Server-Side Entry Point for Parsing Import Files (CSV & XLSX)
   */
  static async parseUpload(
    resource: string,
    buffer: Buffer,
    rawMetadata: Partial<ImportFileMetadata>,
    context: ImportParseContext,
    options?: ImportParserOptions
  ): Promise<{ success: boolean; data?: ParsedImportFile; error?: { code: string; message: string; messageAr?: string } }> {
    try {
      // 1. Validate Target Resource & Capabilities
      if (!resource) {
        throw new ImportParserError(
          'UNAUTHORIZED_RESOURCE',
          'Resource name is required for import parsing.',
          'اسم المورد مطلوب لعملية تحليل الملف.'
        );
      }

      const knownResources = ['shipments', 'customers', 'quotes'];
      if (!knownResources.includes(resource.toLowerCase())) {
        throw new ImportParserError(
          'UNAUTHORIZED_RESOURCE',
          `Unknown or unsupported resource "${resource}" for import operations.`,
          `المورد "${resource}" غير معروف أو غير مدعوم لعمليات الاستيراد.`
        );
      }

      let schema;
      try {
        schema = getResourceAllowlistSchema(resource);
      } catch {
        throw new ImportParserError(
          'UNAUTHORIZED_RESOURCE',
          `Unknown or unsupported resource "${resource}" for import operations.`,
          `المورد "${resource}" غير معروف أو غير مدعوم عمليات الاستيراد.`
        );
      }

      if (!schema || !schema.allowedFields || schema.allowedFields.length === 0) {
        throw new ImportParserError(
          'RESOURCE_NOT_IMPORTABLE',
          `Resource "${resource}" does not accept import operations.`,
          `المورد "${resource}" لا يقبل عمليات الاستيراد.`
        );
      }

      // 2. Validate Import Permissions if explicit permission defined
      if (context.userPermissions && context.userPermissions.length > 0) {
        const requiredPerm = `${resource}:import`;
        const hasPerm = context.userPermissions.includes(requiredPerm) || context.userPermissions.includes('admin');
        if (!hasPerm) {
          throw new ImportParserError(
            'UNAUTHORIZED_RESOURCE',
            `User lacking required permission "${requiredPerm}" to import resource "${resource}".`,
            `المستخدم يفتقر إلى الإذن المطلوب "${requiredPerm}" لاستيراد البيانات.`
          );
        }
      }

      // 3. Perform Server-Authoritative Security & File Metadata Validation
      const validatedMetadata = validateImportFile(buffer, rawMetadata);

      // 4. Resolve Parser Strategy
      const parser = resolveImportParser(validatedMetadata.extension);

      // 5. Parse File Buffer into Domain-Neutral Representation
      const parsedResult = await parser.parse(buffer, validatedMetadata, options);

      // 6. Record Audit Log for File Parse Operation
      try {
        await createAuditLog({
          actorUserId: context.userId || 'usr_system',
          action: `DATA_IMPORT_FILE_PARSED`,
          entityType: resource,
          entityId: `imp_parse_${Date.now()}`,
          after: {
            fileName: validatedMetadata.name,
            fileSize: validatedMetadata.size,
            format: validatedMetadata.extension,
            totalRowCount: parsedResult.totalRowCount,
            totalColumnCount: parsedResult.totalColumnCount,
            checksum: validatedMetadata.checksum,
          },
        });
      } catch (auditErr) {
        console.warn('[ImportParserService] Audit log warning:', auditErr);
      }

      return {
        success: true,
        data: parsedResult,
      };
    } catch (err: any) {
      if (err instanceof ImportParserError) {
        return {
          success: false,
          error: {
            code: err.code,
            message: err.message,
            messageAr: err.messageAr,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'PARSE_FAILED',
          message: err.message || 'File parsing failed due to an unexpected system error.',
          messageAr: 'فشل تحليل الملف بسبب خطأ غير متوقع في النظام.',
        },
      };
    }
  }
}
