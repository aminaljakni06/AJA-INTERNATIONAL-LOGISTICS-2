/**
 * AJA INTERNATIONAL LOGISTICS — Import Validation Service
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Schema Mapping & Validation Engine (STEP 05.18.08)
 * Version: 1.0
 */

import {
  ParsedImportFile,
  ImportColumnMappingEntry,
  ImportSchema,
  ImportValidationSummary,
  ImportRowValidation,
  ColumnMapping,
} from '../types/dataTransferFramework';
import { resolveImportSchema } from '../lib/exchange/importSchemaResolver';
import { autoMapImportHeaders, validateImportMappings } from '../lib/exchange/importHeaderMatcher';
import { validateImportRows, ImportParseContext } from '../lib/exchange/importRowValidator';

export interface ImportValidationPayload {
  resource: string;
  parsedFile: ParsedImportFile;
  userMappings?: ImportColumnMappingEntry[] | ColumnMapping;
}

export interface ImportValidationResult {
  resource: string;
  schema: ImportSchema;
  mappings: ImportColumnMappingEntry[];
  mappingValid: boolean;
  mappingErrors: string[];
  summary: ImportValidationSummary;
  sampleRows: ImportRowValidation[];
}

export class ImportValidationService {
  /**
   * Perform authoritative server-side import mapping & row validation
   */
  public async validateImportPayload(
    payload: ImportValidationPayload,
    context: ImportParseContext
  ): Promise<ImportValidationResult> {
    const { resource, parsedFile, userMappings } = payload;

    // 1. Resolve Server-Authoritative Import Schema
    const schema = resolveImportSchema(resource);

    // 2. Resolve Column Mappings (auto-map if none provided, or validate user mappings)
    let mappings: ImportColumnMappingEntry[];

    if (!userMappings || (Array.isArray(userMappings) && userMappings.length === 0)) {
      mappings = autoMapImportHeaders(parsedFile.headers || [], schema);
    } else if (Array.isArray(userMappings)) {
      mappings = userMappings;
    } else {
      // Convert ColumnMapping record to array
      mappings = (parsedFile.headers || []).map((sourceCol) => {
        const targetField = userMappings[sourceCol] || '';
        return {
          sourceColumn: sourceCol,
          targetField,
          mappingStatus: targetField ? 'MATCHED' : 'UNMAPPED',
        };
      });
    }

    // 3. Authoritative Mapping Security & Coverage Validation
    const mappingCheck = validateImportMappings(mappings, schema);

    // 4. Authoritative Row & Reference Validation
    const { summary, boundedSample } = await validateImportRows(
      parsedFile,
      mappingCheck.validatedMappings,
      schema,
      context
    );

    return {
      resource,
      schema,
      mappings: mappingCheck.validatedMappings,
      mappingValid: mappingCheck.isValid,
      mappingErrors: mappingCheck.errors,
      summary,
      sampleRows: boundedSample,
    };
  }
}

export const importValidationService = new ImportValidationService();
