/**
 * AJA INTERNATIONAL LOGISTICS — Import Parser Resolver Registry
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Upload & Parser Framework (STEP 05.18.07)
 * Version: 1.0
 */

import { CSVImportParser } from './csvImportParser';
import { XLSXImportParser } from './xlsxImportParser';
import { ImportParser, ImportParserError } from './importParserInterface';

const csvParser = new CSVImportParser();
const xlsxParser = new XLSXImportParser();

/**
 * Resolve the appropriate server-side ImportParser for a given file extension or format
 */
export function resolveImportParser(formatOrExtension: string): ImportParser {
  if (!formatOrExtension) {
    throw new ImportParserError(
      'UNSUPPORTED_IMPORT_FORMAT',
      'Import format or extension is missing.',
      'صيغة الاستيراد أو امتداد الملف مفقود.'
    );
  }

  const normalized = formatOrExtension.toLowerCase().replace(/^\./, '').trim();

  if (normalized === 'csv' || normalized === 'text/csv') {
    return csvParser;
  }

  if (
    normalized === 'xlsx' ||
    normalized === 'excel' ||
    normalized === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return xlsxParser;
  }

  throw new ImportParserError(
    'UNSUPPORTED_IMPORT_FORMAT',
    `Unsupported import format/extension "${formatOrExtension}". Only CSV (.csv) and Excel (.xlsx) formats are supported.`,
    `صيغة/امتداد الملف "${formatOrExtension}" غير مدعومة للاستيراد. تدعم المنظومة ملفات CSV (.csv) و Excel (.xlsx) فقط.`
  );
}
