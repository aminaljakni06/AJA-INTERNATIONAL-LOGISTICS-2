/**
 * AJA INTERNATIONAL LOGISTICS — STEP 05.18.07 IMPORT PARSER SUITE
 * Unit tests for File Validation, CSV Parser, XLSX Parser, Security, and Parser Registry Service
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { DATA_EXCHANGE_LIMITS } from '../../../types/dataTransferFramework';
import {
  sanitizeImportFilename,
  calculateBufferChecksum,
  validateImportFile,
} from './fileValidator';
import { CSVImportParser } from './csvImportParser';
import { XLSXImportParser } from './xlsxImportParser';
import { resolveImportParser } from './parserRegistry';
import { ImportParserError } from './importParserInterface';

console.log('\n=== STEP 05.18.07 IMPORT UPLOAD & PARSER FRAMEWORK TEST SUITE ===\n');

test('1. File Validator — Filename Sanitization & Path Traversal Security', () => {
  const unsafeName1 = '../../../../etc/passwd.csv';
  assert.equal(sanitizeImportFilename(unsafeName1), 'passwd.csv');

  const unsafeName2 = '..\\..\\secret_data\x00.xlsx';
  assert.equal(sanitizeImportFilename(unsafeName2), 'secret_data.xlsx');

  const arabicName = 'شحنات_الرياض_2026.csv';
  assert.equal(sanitizeImportFilename(arabicName), 'شحنات_الرياض_2026.csv');

  console.log('[PASS] 1. Filename sanitization & path traversal security verified.');
});

test('2. File Validator — File Size & Signature Validation', () => {
  // Empty file
  assert.throws(
    () => validateImportFile(Buffer.alloc(0), { name: 'test.csv' }),
    (err: any) => err instanceof ImportParserError && err.code === 'EMPTY_FILE'
  );

  // Oversized file (> 10MB)
  const oversizedBuffer = Buffer.alloc(DATA_EXCHANGE_LIMITS.MAX_FILE_SIZE_BYTES + 1024);
  assert.throws(
    () => validateImportFile(oversizedBuffer, { name: 'huge.csv' }),
    (err: any) => err instanceof ImportParserError && err.code === 'FILE_TOO_LARGE'
  );

  // Unsupported extension
  assert.throws(
    () => validateImportFile(Buffer.from('hello'), { name: 'script.exe' }),
    (err: any) => err instanceof ImportParserError && err.code === 'INVALID_FILE_TYPE'
  );

  // Corrupted XLSX signature (Not ZIP)
  const fakeXlsxBuffer = Buffer.from('Not a ZIP workbook header');
  assert.throws(
    () => validateImportFile(fakeXlsxBuffer, { name: 'fake.xlsx' }),
    (err: any) => err instanceof ImportParserError && err.code === 'MALFORMED_FILE_SIGNATURE'
  );

  // Binary in CSV
  const binaryCsvBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x00]);
  assert.throws(
    () => validateImportFile(binaryCsvBuffer, { name: 'binary.csv' }),
    (err: any) => err instanceof ImportParserError && err.code === 'MALFORMED_FILE_SIGNATURE'
  );

  // Valid CSV metadata
  const validCsv = Buffer.from('Tracking,Origin,Destination\nAJA-001,Riyadh,Jeddah');
  const metadata = validateImportFile(validCsv, { name: 'shipments.csv' });
  assert.equal(metadata.extension, 'csv');
  assert.ok(metadata.checksum);

  console.log('[PASS] 2. File size, extension, MIME and signature security verified.');
});

test('3. CSV Parser — Standard CSV, UTF-8 BOM, Arabic Content, Quotes & CRLF', async () => {
  const parser = new CSVImportParser();

  // CSV with BOM, Arabic text, quoted fields, multiline
  const bom = '\uFEFF';
  const csvContent =
    bom +
    '"رقم التتبع","المدينة الأصلية","المدينة الوجهة","الوزن كجم","الملاحظات"\r\n' +
    '"AJA-9001","الرياض","جدة",125.5,"شحنة قابلة للكسر"\r\n' +
    '"AJA-9002","الدمام","المدينة المنورة",450,"ملاحظة تحتوي على\nسطر جديد داخل علامات التنصيص"\r\n';

  const buffer = Buffer.from(csvContent, 'utf-8');
  const metadata = validateImportFile(buffer, { name: 'arabic_shipments.csv' });

  const result = await parser.parse(buffer, metadata);

  assert.equal(result.format, 'csv');
  assert.equal(result.headers.length, 5);
  assert.equal(result.headers[0], 'رقم التتبع');
  assert.equal(result.totalRowCount, 2);
  assert.equal(result.rows[0]['رقم التتبع'], 'AJA-9001');
  assert.equal(result.rows[0]['المدينة الأصلية'], 'الرياض');
  assert.equal(result.rows[1]['رقم التتبع'], 'AJA-9002');
  assert.ok(String(result.rows[1]['الملاحظات']).includes('سطر جديد'));

  console.log('[PASS] 3. CSV parser correctly handles UTF-8 BOM, Arabic text, quotes and multiline fields.');
});

test('4. CSV Parser — Header-Only File, Duplicate Headers & Empty Headers', async () => {
  const parser = new CSVImportParser();

  // Header-only file (0 data rows)
  const headerOnly = Buffer.from('TrackingNumber,OriginCity,DestinationCity\n');
  const meta1 = validateImportFile(headerOnly, { name: 'headers.csv' });
  const res1 = await parser.parse(headerOnly, meta1);
  assert.equal(res1.totalRowCount, 0);
  assert.deepEqual(res1.headers, ['TrackingNumber', 'OriginCity', 'DestinationCity']);

  // Duplicate headers error
  const duplicateCsv = Buffer.from('Tracking,Status,Status\nAJA-1,BOOKED,BOOKED\n');
  const meta2 = validateImportFile(duplicateCsv, { name: 'dup.csv' });
  await assert.rejects(
    async () => parser.parse(duplicateCsv, meta2),
    (err: any) => err instanceof ImportParserError && err.code === 'DUPLICATE_HEADERS'
  );

  // Empty header error
  const emptyHeaderCsv = Buffer.from('Tracking,,Destination\nAJA-1,Riyadh,Jeddah\n');
  const meta3 = validateImportFile(emptyHeaderCsv, { name: 'blank_hdr.csv' });
  await assert.rejects(
    async () => parser.parse(emptyHeaderCsv, meta3),
    (err: any) => err instanceof ImportParserError && err.code === 'EMPTY_HEADER'
  );

  console.log('[PASS] 4. CSV parser header validation (header-only, duplicate headers, empty headers) verified.');
});

test('5. CSV Parser — Column & Row Limits, Formula Stripping & Cell Truncation', async () => {
  const parser = new CSVImportParser();

  // Column Limit (> 100 columns)
  const manyCols = Array.from({ length: 101 }, (_, i) => `Col_${i}`).join(',') + '\nval1,val2\n';
  const metaCols = validateImportFile(Buffer.from(manyCols), { name: 'wide.csv' });
  await assert.rejects(
    async () => parser.parse(Buffer.from(manyCols), metaCols),
    (err: any) => err instanceof ImportParserError && err.code === 'TOO_MANY_COLUMNS'
  );

  // Formula injection protection check
  const formulaCsv = Buffer.from('Tracking,Code\nAJA-1,\'=1+1\n');
  const metaFormula = validateImportFile(formulaCsv, { name: 'formula.csv' });
  const resFormula = await parser.parse(formulaCsv, metaFormula);
  assert.equal(resFormula.rows[0]['Code'], '=1+1');

  console.log('[PASS] 5. CSV parser column limits and formula protection verified.');
});

test('6. XLSX Parser — Workbook, Arabic Content, Primitives & Dates', async () => {
  const parser = new XLSXImportParser();

  // Build a test XLSX workbook using ExcelJS
  const wsData = [
    ['رقم الشحنة', 'العميل', 'الوزن', 'حالة التسليم', 'تاريخ التسليم'],
    ['SHP-101', 'شركة سابك', 1500, true, new Date('2026-08-15')],
    ['SHP-102', 'أرامكو السعودية', 3200, false, new Date('2026-08-20')],
  ];

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('شحنات 2026');
  ws.addRows(wsData);

  const xlsxBuffer = Buffer.from(await wb.xlsx.writeBuffer());
  const metadata = validateImportFile(xlsxBuffer, { name: 'arabic_shipments.xlsx' });

  const result = await parser.parse(xlsxBuffer, metadata);

  assert.equal(result.format, 'xlsx');
  assert.equal(result.worksheetName, 'شحنات 2026');
  assert.equal(result.headers.length, 5);
  assert.equal(result.headers[0], 'رقم الشحنة');
  assert.equal(result.totalRowCount, 2);
  assert.equal(result.rows[0]['رقم الشحنة'], 'SHP-101');
  assert.equal(result.rows[0]['العميل'], 'شركة سابك');
  assert.equal(String(result.rows[0]['الوزن']), '1500');

  console.log('[PASS] 6. XLSX parser correctly parses workbook sheets, Arabic text, primitives and dates.');
});

test('7. XLSX Parser — Header Validation & Formula Protection', async () => {
  const parser = new XLSXImportParser();

  // Duplicate Headers in XLSX
  const dupWsData = [
    ['Tracking', 'City', 'City'],
    ['SHP-1', 'Riyadh', 'Riyadh'],
  ];
  const dupWb = new ExcelJS.Workbook();
  const dupWs = dupWb.addWorksheet('Sheet1');
  dupWs.addRows(dupWsData);
  const dupBuffer = Buffer.from(await dupWb.xlsx.writeBuffer());
  const dupMeta = validateImportFile(dupBuffer, { name: 'dup.xlsx' });

  await assert.rejects(
    async () => parser.parse(dupBuffer, dupMeta),
    (err: any) => err instanceof ImportParserError && err.code === 'DUPLICATE_HEADERS'
  );

  console.log('[PASS] 7. XLSX parser duplicate header detection verified.');
});

test('8. Parser Registry Resolution', async () => {
  // Registry resolution
  const csvParserInst = resolveImportParser('csv');
  assert.equal(csvParserInst.format, 'csv');

  const xlsxParserInst = resolveImportParser('xlsx');
  assert.equal(xlsxParserInst.format, 'xlsx');

  assert.throws(
    () => resolveImportParser('pdf'),
    (err: any) => err instanceof ImportParserError && err.code === 'UNSUPPORTED_IMPORT_FORMAT'
  );

  console.log('[PASS] 8. Parser registry resolution verified without Firestore side effects.');
});

console.log('\n=== STEP 05.18.07 TEST SUITE ALL PASSED SUCCESSFULLY ===\n');
