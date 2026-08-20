/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise XLSX Export Engine
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18.05)
 * Version: 1.0
 */

import ExcelJS from 'exceljs';
import { ExportFieldDefinition, DATA_EXCHANGE_LIMITS } from '../../types/dataTransferFramework';
import { ResolvedExportPolicy } from './exportPolicyResolver';
import { sanitizeCSVValue } from './fieldAllowlist';

/**
 * XLSX MIME Content Type
 */
export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Centralized Filename Sanitizer for XLSX
 * Removes path traversal characters, control characters, CR/LF, and forces .xlsx extension
 */
export function sanitizeXLSXFilename(fileName?: string, defaultResource = 'export'): string {
  if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
    return `AJA_${defaultResource}_export_${Date.now()}.xlsx`;
  }

  let cleaned = fileName.trim();

  // Strip path traversal attempts (\ and /) and control characters
  cleaned = cleaned.replace(/[\/\\]/g, '_').replace(/[\r\n\0]/g, '');

  // Strip non-printable ASCII / unsafe characters except letters, numbers, hyphens, underscores, dots, spaces
  cleaned = cleaned.replace(/[^\w\s\.-]/g, '_');

  // Strip existing extension if present
  cleaned = cleaned.replace(/\.[a-zA-Z0-9]+$/i, '');

  if (cleaned.length === 0) {
    cleaned = `AJA_${defaultResource}_export_${Date.now()}`;
  }

  return `${cleaned}.xlsx`;
}

/**
 * Sanitizes worksheet name to comply with Excel 31-character limit and forbidden characters \ / ? * : [ ]
 */
export function sanitizeWorksheetName(resourceName: string, locale: 'en' | 'ar' = 'en'): string {
  if (!resourceName || typeof resourceName !== 'string') {
    return locale === 'ar' ? 'البيانات' : 'Data';
  }

  // Remove forbidden Excel sheet name characters: \ / ? * : [ ]
  let cleaned = resourceName.replace(/[\/\\?\*:\[\]]/g, '_').trim();

  if (cleaned.length === 0) {
    cleaned = 'ExportData';
  }

  // Excel worksheet names are capped at 31 characters
  if (cleaned.length > 31) {
    cleaned = cleaned.slice(0, 31);
  }

  return cleaned;
}

/**
 * Cell Value Formatter & Sanitizer for XLSX Cells
 * Preserves native types (number, boolean, Date) while protecting string cells against formula injection.
 */
export function serializeXLSXValue(value: any, fieldDef?: ExportFieldDefinition): any {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return null;
    }
    return value;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  let strValue = String(value);

  // Enforce cell character length limit (32,767)
  if (strValue.length > DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH) {
    strValue = strValue.slice(0, DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH);
  }

  // Formula injection protection for string cells starting with =, +, -, @, \t, \r
  const sanitized = sanitizeCSVValue(strValue);

  return sanitized;
}

/**
 * Generate Header Row Labels
 */
export function generateHeaderRow(
  fields: ExportFieldDefinition[],
  locale: 'en' | 'ar' = 'en'
): string[] {
  return fields.map((field) => {
    let label = locale === 'ar' ? field.labelAr || field.labelEn : field.labelEn || field.labelAr;
    if (!label) label = field.key;

    // Enforce cell character limit on headers as well
    if (label.length > DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH) {
      label = label.slice(0, DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH);
    }
    return label;
  });
}

/**
 * Constructs a SheetJS WorkSheet from dataset records and export policy
 */
export function generateXLSXWorksheet(
  records: Record<string, any>[],
  policy: ResolvedExportPolicy,
  locale: 'en' | 'ar' = 'en'
): ExcelJS.Worksheet {
  const workbook = new ExcelJS.Workbook();
  const rawSheetName = policy.resource || 'Export';
  const sheetName = sanitizeWorksheetName(rawSheetName, locale);
  const worksheet = workbook.addWorksheet(sheetName);
  const fields = policy.allowedFields;

  if (policy.includeHeaders) {
    worksheet.addRow(generateHeaderRow(fields, locale));
  }

  records.forEach((record) => {
    const rowValues = fields.map((field) => {
      const rawVal = record[field.key];
      return serializeXLSXValue(rawVal, field);
    });
    worksheet.addRow(rowValues);
  });

  if (locale === 'ar') {
    worksheet.views = [{ rightToLeft: true }];
  }

  return worksheet;
}

/**
 * Generates an in-memory XLSX Workbook Buffer
 */
export async function generateXLSXBuffer(
  records: Record<string, any>[],
  policy: ResolvedExportPolicy,
  locale: 'en' | 'ar' = 'en'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AJA International Logistics';
  workbook.created = new Date();
  workbook.modified = new Date();

  const rawSheetName = policy.resource || 'Export';
  const sheetName = sanitizeWorksheetName(rawSheetName, locale);
  const worksheet = workbook.addWorksheet(sheetName);
  const fields = policy.allowedFields;

  if (policy.includeHeaders) {
    worksheet.addRow(generateHeaderRow(fields, locale));
  }

  records.forEach((record) => {
    worksheet.addRow(fields.map((field) => serializeXLSXValue(record[field.key], field)));
  });

  if (locale === 'ar') {
    worksheet.views = [{ rightToLeft: true }];
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}

/**
 * Generates Base64 encoded XLSX payload for JSON response contracts
 */
export async function generateXLSXBase64(
  records: Record<string, any>[],
  policy: ResolvedExportPolicy,
  locale: 'en' | 'ar' = 'en'
): Promise<string> {
  const buffer = await generateXLSXBuffer(records, policy, locale);
  return buffer.toString('base64');
}
