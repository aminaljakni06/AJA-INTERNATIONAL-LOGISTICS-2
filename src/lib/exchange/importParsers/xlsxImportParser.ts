/**
 * AJA INTERNATIONAL LOGISTICS — XLSX Excel Import Parser
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Import Upload & Parser Framework (STEP 05.18.07)
 * Version: 1.0
 */

import ExcelJS from 'exceljs';
import { DATA_EXCHANGE_LIMITS, ImportFileMetadata, ParsedImportFile } from '../../../types/dataTransferFramework';
import { ImportParser, ImportParserError, ImportParserOptions } from './importParserInterface';

const MAX_WORKSHEETS_LIMIT = 10;

function cellToPrimitive(cell: ExcelJS.Cell): unknown {
  const value = cell.value;

  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }

  return cell.text || String(value);
}

export class XLSXImportParser implements ImportParser {
  readonly format = 'xlsx' as const;

  canParse(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase();
    return ext === 'xlsx' || ext === 'excel';
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

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer, {
        ignoreNodes: [
          'dataValidations',
          'conditionalFormatting',
          'extLst',
          'hyperlinks',
          'picture',
        ],
      });
    } catch (err: any) {
      throw new ImportParserError(
        'INVALID_WORKBOOK',
        `Failed to parse Excel workbook structure: ${err.message || 'Corrupted file.'}`,
        `فشل في تحليل هيكل جدول بيانات Excel: ${err.message || 'ملف تالف.'}`
      );
    }

    if (!workbook.worksheets || workbook.worksheets.length === 0) {
      throw new ImportParserError(
        'EMPTY_FILE',
        'Excel workbook contains no worksheets.',
        'جدول بيانات Excel لا يحتوي على أية أوراق عمل.'
      );
    }

    // Safety check on sheet count to protect memory against decompressed ZIP expansion
    if (workbook.worksheets.length > MAX_WORKSHEETS_LIMIT) {
      throw new ImportParserError(
        'INVALID_WORKBOOK',
        `Workbook contains ${workbook.worksheets.length} worksheets, exceeding maximum limit of ${MAX_WORKSHEETS_LIMIT}.`,
        `يحتوي الملف على ${workbook.worksheets.length} أوراق عمل، وهو ما يتجاوز الحد الأقصى المسموح به وهو ${MAX_WORKSHEETS_LIMIT}.`
      );
    }

    // Determine target worksheet (first non-empty worksheet or requested worksheet)
    let selectedSheetName = options?.worksheetName;
    if (selectedSheetName && !workbook.getWorksheet(selectedSheetName)) {
      throw new ImportParserError(
        'INVALID_WORKBOOK',
        `Requested worksheet "${selectedSheetName}" was not found in workbook.`,
        `ورقة العمل المطلوبة "${selectedSheetName}" غير موجودة في الملف.`
      );
    }

    if (!selectedSheetName) {
      for (const sheet of workbook.worksheets) {
        if (sheet && sheet.actualRowCount > 0) {
          selectedSheetName = sheet.name;
          break;
        }
      }
      if (!selectedSheetName) {
        selectedSheetName = workbook.worksheets[0].name;
      }
    }

    const worksheet = workbook.getWorksheet(selectedSheetName);
    if (!worksheet || worksheet.actualRowCount === 0) {
      throw new ImportParserError(
        'EMPTY_FILE',
        `Worksheet "${selectedSheetName}" is empty.`,
        `ورقة العمل "${selectedSheetName}" فارغة.`
      );
    }

    const rawMatrix: unknown[][] = [];
    const rowCount = worksheet.rowCount;
    for (let rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex);
      const values: unknown[] = [];
      const colCount = rowIndex === 1 ? row.cellCount : Math.max(row.cellCount, worksheet.getRow(1).cellCount);
      for (let colIndex = 1; colIndex <= colCount; colIndex++) {
        values.push(cellToPrimitive(row.getCell(colIndex)));
      }
      rawMatrix.push(values);
    }

    if (!rawMatrix || rawMatrix.length === 0) {
      throw new ImportParserError(
        'EMPTY_FILE',
        `Worksheet "${selectedSheetName}" contains no readable data rows.`,
        `ورقة العمل "${selectedSheetName}" لا تحتوي على أية صفوف بيانات صالحة للقراءة.`
      );
    }

    // Extract Header Row
    const headerRow = rawMatrix[0] as unknown[];
    if (!headerRow || headerRow.length === 0) {
      throw new ImportParserError(
        'EMPTY_FILE',
        'First row of worksheet is empty. A valid header row is required.',
        'الصف الأول من ورقة العمل فارغ. يلزم وجود صف عناوين صالح.'
      );
    }

    const headers: string[] = [];
    const seenHeaders = new Set<string>();
    const warnings: string[] = [];

    for (let c = 0; c < headerRow.length; c++) {
      const rawHeader = headerRow[c];
      const h = (rawHeader !== undefined && rawHeader !== null ? String(rawHeader) : '').trim();

      if (!h) {
        throw new ImportParserError(
          'EMPTY_HEADER',
          `Column header at position ${c + 1} in sheet "${selectedSheetName}" is blank. All columns must have valid headers.`,
          `عنوان العمود في الموضع ${c + 1} في ورقة العمل "${selectedSheetName}" فارغ. يجب أن تحتوي جميع الأعمدة على عناوين صالحة.`
        );
      }

      if (seenHeaders.has(h.toLowerCase())) {
        throw new ImportParserError(
          'DUPLICATE_HEADERS',
          `Duplicate column header "${h}" detected in worksheet. Column names must be unique.`,
          `تم اكتشاف عنوان عمود مكرر "${h}" في ورقة العمل. يجب أن تكون أسماء الأعمدة فريدة.`
        );
      }

      seenHeaders.add(h.toLowerCase());
      headers.push(h);
    }

    // Check Column Limit
    if (headers.length > maxCols) {
      throw new ImportParserError(
        'TOO_MANY_COLUMNS',
        `Worksheet contains ${headers.length} columns, exceeding maximum allowed limit of ${maxCols} columns.`,
        `تحتوي ورقة العمل على ${headers.length} عموداً، وهو ما يتجاوز الحد الأقصى المسموح به وهو ${maxCols} عموداً.`
      );
    }

    // Extract Data Rows
    const dataRows = rawMatrix.slice(1);

    // Check Row Limit
    if (dataRows.length > maxRows) {
      throw new ImportParserError(
        'IMPORT_LIMIT_EXCEEDED',
        `Worksheet contains ${dataRows.length} data rows, exceeding maximum allowed limit of ${maxRows} rows.`,
        `تحتوي ورقة العمل على ${dataRows.length} صفاً، وهو ما يتجاوز الحد الأقصى المسموح به وهو ${maxRows} صفاً.`
      );
    }

    const rows: Record<string, unknown>[] = [];

    for (let r = 0; r < dataRows.length; r++) {
      const rowArray = (dataRows[r] as unknown[]) || [];
      const rowObj: Record<string, unknown> = {};

      for (let c = 0; c < headers.length; c++) {
        const headerName = headers[c];
        const rawCell = rowArray[c];

        let parsedVal: unknown = '';

        if (rawCell !== undefined && rawCell !== null) {
          if (rawCell instanceof Date) {
            parsedVal = rawCell.toISOString().split('T')[0];
          } else if (typeof rawCell === 'number' || typeof rawCell === 'boolean') {
            parsedVal = rawCell;
          } else {
            let strVal = String(rawCell).trim();

            // Formula injection protection stripping
            if (strVal.startsWith("'") && /^[=+\-@\t\r]/.test(strVal.slice(1))) {
              strVal = strVal.slice(1);
            }

            if (strVal.length > maxCellLen) {
              warnings.push(`Row ${r + 1}, column "${headerName}" truncated from ${strVal.length} to ${maxCellLen} characters.`);
              strVal = strVal.slice(0, maxCellLen);
            }

            parsedVal = strVal;
          }
        }

        rowObj[headerName] = parsedVal;
      }

      rows.push(rowObj);
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      fileMetadata,
      format: 'xlsx',
      worksheetName: selectedSheetName,
      headers,
      rows,
      totalRowCount: rows.length,
      totalColumnCount: headers.length,
      warnings,
      parserMetadata: {
        executionTimeMs,
        parsedAt: new Date().toISOString(),
        sheetCount: workbook.worksheets.length,
      },
    };
  }
}
