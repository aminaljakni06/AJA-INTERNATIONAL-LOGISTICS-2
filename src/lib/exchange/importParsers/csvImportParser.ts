/**
 * AJA INTERNATIONAL LOGISTICS — CSV Import Parser
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Upload & Parser Framework (STEP 05.18.07)
 * Version: 1.0
 */

import Papa from 'papaparse';
import { DATA_EXCHANGE_LIMITS, ImportFileMetadata, ParsedImportFile } from '../../../types/dataTransferFramework';
import { ImportParser, ImportParserError, ImportParserOptions } from './importParserInterface';

export class CSVImportParser implements ImportParser {
  readonly format = 'csv' as const;

  canParse(mimeType: string, extension: string): boolean {
    return extension.toLowerCase() === 'csv';
  }

  async parse(
    buffer: Buffer,
    fileMetadata: ImportFileMetadata,
    options?: ImportParserOptions
  ): Promise<ParsedImportFile> {
    const startTime = Date.now();
    const maxRows = options?.maxRows || DATA_EXCHANGE_LIMITS.MAX_IMPORT_ROWS;
    const maxCols = options?.maxColumns || DATA_EXCHANGE_LIMITS.MAX_IMPORT_COLUMNS;
    const maxCellLen = options?.maxCellLength || DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH;

    // 1. Convert buffer to string, handling UTF-8 BOM
    let content = buffer.toString('utf-8');
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    if (!content || content.trim().length === 0) {
      throw new ImportParserError(
        'EMPTY_FILE',
        'CSV file content is empty.',
        'محتوى ملف CSV فارغ.'
      );
    }

    // 2. Parse using PapaParse with strict configuration
    const parseResult = Papa.parse<string[]>(content, {
      header: false,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: undefined,
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      // Check for critical fatal syntax errors
      const fatalErrors = parseResult.errors.filter(
        (e) => e.code !== 'UndetectableDelimiter' && e.type !== 'FieldMismatch'
      );
      if (fatalErrors.length > 0 && (!parseResult.data || parseResult.data.length === 0)) {
        throw new ImportParserError(
          'PARSE_FAILED',
          `CSV parsing error: ${fatalErrors[0].message}`,
          `خطأ في تحليل ملف CSV: ${fatalErrors[0].message}`
        );
      }
    }

    const rawGrid = parseResult.data || [];
    if (rawGrid.length === 0) {
      throw new ImportParserError(
        'EMPTY_FILE',
        'CSV file contains no readable records.',
        'ملف CSV لا يحتوي على أية سجلات صالحة للقراءة.'
      );
    }

    // 3. Extract & Validate Headers
    const rawHeaderRow = rawGrid[0];
    const headers: string[] = [];
    const seenHeaders = new Set<string>();
    const warnings: string[] = [];

    for (let c = 0; c < rawHeaderRow.length; c++) {
      let h = (rawHeaderRow[c] || '').toString().trim();
      // Remove leading/trailing quotes if present
      h = h.replace(/^["']+|["']+$|\r$/g, '').trim();

      if (!h) {
        throw new ImportParserError(
          'EMPTY_HEADER',
          `Column header at position ${c + 1} is blank. All columns must have non-empty headers.`,
          `عنوان العمود في الموضع ${c + 1} فارغ. يجب أن تحتوي جميع الأعمدة على عناوين غير فارغة.`
        );
      }

      if (seenHeaders.has(h.toLowerCase())) {
        throw new ImportParserError(
          'DUPLICATE_HEADERS',
          `Duplicate column header "${h}" detected in CSV. Source column names must be unique.`,
          `تم اكتشاف عنوان عمود مكرر "${h}" في ملف CSV. يجب أن تكون أسماء الأعمدة فريدة.`
        );
      }

      seenHeaders.add(h.toLowerCase());
      headers.push(h);
    }

    // Check Column Limit
    if (headers.length > maxCols) {
      throw new ImportParserError(
        'TOO_MANY_COLUMNS',
        `CSV file contains ${headers.length} columns, exceeding maximum allowed limit of ${maxCols} columns.`,
        `يحتوي ملف CSV على ${headers.length} عموداً، وهو ما يتجاوز الحد الأقصى المسموح به وهو ${maxCols} عموداً.`
      );
    }

    // 4. Extract Data Rows
    const dataRows = rawGrid.slice(1);

    // Check Row Limit before building objects
    if (dataRows.length > maxRows) {
      throw new ImportParserError(
        'IMPORT_LIMIT_EXCEEDED',
        `CSV file contains ${dataRows.length} data rows, exceeding maximum allowed limit of ${maxRows} rows.`,
        `يحتوي ملف CSV على ${dataRows.length} صفاً، وهو ما يتجاوز الحد الأقصى المسموح به وهو ${maxRows} صفاً.`
      );
    }

    const rows: Record<string, unknown>[] = [];

    for (let r = 0; r < dataRows.length; r++) {
      const rowArr = dataRows[r];
      const rowObj: Record<string, unknown> = {};

      for (let c = 0; c < headers.length; c++) {
        const headerName = headers[c];
        let val = rowArr[c] !== undefined && rowArr[c] !== null ? String(rowArr[c]).trim() : '';

        // Unquote if wrapped
        if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
          val = val.slice(1, -1).replace(/""/g, '"').trim();
        }

        // Formula injection protection stripping at parser level
        if (val.startsWith("'") && /^[=+\-@\t\r]/.test(val.slice(1))) {
          val = val.slice(1);
        }

        // Cell length boundary check
        if (val.length > maxCellLen) {
          warnings.push(`Row ${r + 1}, column "${headerName}" truncated from ${val.length} to ${maxCellLen} characters.`);
          val = val.slice(0, maxCellLen);
        }

        rowObj[headerName] = val;
      }

      rows.push(rowObj);
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      fileMetadata,
      format: 'csv',
      headers,
      rows,
      totalRowCount: rows.length,
      totalColumnCount: headers.length,
      warnings,
      parserMetadata: {
        executionTimeMs,
        parsedAt: new Date().toISOString(),
        encoding: 'UTF-8',
      },
    };
  }
}
