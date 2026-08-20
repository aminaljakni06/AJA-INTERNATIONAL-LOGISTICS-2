/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise XLSX Export Engine Unit Tests
 * Phase: Enterprise UI System
 * Module: File-Based Operations, XLSX Export Engine (STEP 05.18.05)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import ExcelJS from 'exceljs';
import {
  serializeXLSXValue,
  generateHeaderRow,
  generateXLSXWorksheet,
  generateXLSXBuffer,
  generateXLSXBase64,
  sanitizeXLSXFilename,
  sanitizeWorksheetName,
  XLSX_MIME_TYPE,
} from './xlsxExportEngine';
import { ExportFieldDefinition, DATA_EXCHANGE_LIMITS } from '../../types/dataTransferFramework';
import { ResolvedExportPolicy, resolveExportPolicy } from './exportPolicyResolver';

const mockFields: ExportFieldDefinition[] = [
  { id: 'f1', key: 'id', labelEn: 'Shipment ID', labelAr: 'معرف الشحنة', type: 'string', exportable: true, isDefault: true },
  { id: 'f2', key: 'trackingNumber', labelEn: 'Tracking Number', labelAr: 'رقم التتبع', type: 'string', exportable: true, isDefault: true },
  { id: 'f3', key: 'senderName', labelEn: 'Sender Name', labelAr: 'اسم المرسل', type: 'string', exportable: true, isDefault: true },
  { id: 'f4', key: 'weightKg', labelEn: 'Weight (kg)', labelAr: 'الوزن (كجم)', type: 'number', exportable: true, isDefault: true },
  { id: 'f5', key: 'isExpress', labelEn: 'Express Delivery', labelAr: 'تسليم سريع', type: 'boolean', exportable: true, isDefault: true },
  { id: 'f6', key: 'notes', labelEn: 'Special Notes', labelAr: 'ملاحظات خاصة', type: 'string', exportable: true, isDefault: true },
];

const mockPolicy: ResolvedExportPolicy = {
  resource: 'shipments',
  resourceAdapter: {} as any,
  format: 'xlsx',
  operationalFormatStatus: 'SUPPORTED',
  selection: {
    mode: 'QUERY',
    resource: 'shipments',
    query: { search: '', filters: {}, sort: { field: 'createdAt', direction: 'desc' }, pagination: { page: 1, pageSize: 25 } },
    excludedIds: [],
  },
  effectiveSelectionMode: 'QUERY',
  requestedFields: mockFields.map((f) => f.key),
  allowedFields: mockFields,
  allowedFieldKeys: mockFields.map((f) => f.key),
  sensitiveFieldsExcluded: [],
  deniedFieldsByPermission: [],
  tenantScope: { companyId: 'COMP-AJA-01' },
  globalLimit: 10000,
  resourceLimit: 10000,
  effectiveRecordLimit: 10000,
  estimatedRecordCount: 2,
  includeHeaders: true,
  fileName: 'AJA_shipments_test.xlsx',
  auditMetadata: {
    resource: 'shipments',
    format: 'xlsx',
    selectionMode: 'QUERY',
    recordCount: 2,
    allowedFieldCount: 6,
    executionTimeMs: 10,
    effectiveLimit: 10000,
    requestedByUserId: 'usr_admin',
    companyId: 'COMP-AJA-01',
  },
};

test('1. XLSX Value Serialization & Data Types', () => {
  // Null and undefined
  assert.strictEqual(serializeXLSXValue(null), null);
  assert.strictEqual(serializeXLSXValue(undefined), null);

  // Numbers & Booleans
  assert.strictEqual(serializeXLSXValue(1250.75), 1250.75);
  assert.strictEqual(serializeXLSXValue(true), true);
  assert.strictEqual(serializeXLSXValue(false), false);

  // Dates
  const testDate = new Date('2026-08-09T12:00:00.000Z');
  assert.strictEqual(serializeXLSXValue(testDate), '2026-08-09T12:00:00.000Z');

  // Plain strings
  assert.strictEqual(serializeXLSXValue('Riyadh Logistics Hub'), 'Riyadh Logistics Hub');
});

test('2. Formula Injection Protection in XLSX Cell Strings', () => {
  // Leading =
  assert.strictEqual(serializeXLSXValue('=1+2'), "'=1+2");
  assert.strictEqual(serializeXLSXValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");

  // Leading +, -, @
  assert.strictEqual(serializeXLSXValue('+966500000000'), "'+966500000000");
  assert.strictEqual(serializeXLSXValue('-100 SAR'), "'-100 SAR");
  assert.strictEqual(serializeXLSXValue('@cmd'), "'@cmd");

  // Leading \t, \r
  assert.strictEqual(serializeXLSXValue('\tTabbed'), "'\tTabbed");
});

test('3. Large String Cell Truncation (32,767 max)', () => {
  const giantString = 'A'.repeat(DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH + 500);
  const serialized = serializeXLSXValue(giantString);
  assert.strictEqual(serialized.length, DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH);
});

test('4. Header Generation (English & Arabic)', () => {
  const headerEn = generateHeaderRow(mockFields, 'en');
  assert.deepStrictEqual(headerEn, [
    'Shipment ID',
    'Tracking Number',
    'Sender Name',
    'Weight (kg)',
    'Express Delivery',
    'Special Notes',
  ]);

  const headerAr = generateHeaderRow(mockFields, 'ar');
  assert.deepStrictEqual(headerAr, [
    'معرف الشحنة',
    'رقم التتبع',
    'اسم المرسل',
    'الوزن (كجم)',
    'تسليم سريع',
    'ملاحظات خاصة',
  ]);
});

test('5. Worksheet Generation & Arabic RTL Setting', () => {
  const records = [
    { id: 'SHP-001', trackingNumber: 'AJA-001', senderName: 'سابك', weightKg: 500, isExpress: true, notes: 'عاجل' },
  ];

  const ws = generateXLSXWorksheet(records, mockPolicy, 'ar');
  assert.ok(ws, 'Worksheet must be generated');

  assert.strictEqual(ws.views[0].rightToLeft, true);
});

test('6. Complete XLSX Workbook Buffer & Round-Trip Parsing', async () => {
  const records = [
    { id: 'SHP-001', trackingNumber: 'AJA-001', senderName: 'SABIC Ltd', weightKg: 1250, isExpress: true, notes: 'Fragile' },
    { id: 'SHP-002', trackingNumber: 'AJA-002', senderName: 'Aramco', weightKg: 3400, isExpress: false, notes: '=Top Secret' },
  ];

  const buf = await generateXLSXBuffer(records, mockPolicy, 'en');
  assert.ok(Buffer.isBuffer(buf), 'Output must be a NodeJS Buffer');
  assert.ok(buf.length > 0, 'Buffer must not be empty');

  const parsedWb = new ExcelJS.Workbook();
  await parsedWb.xlsx.load(buf);
  const sheet = parsedWb.getWorksheet('shipments');
  assert.ok(sheet, 'Expected shipments worksheet');

  assert.strictEqual(sheet!.rowCount, 3);
  assert.strictEqual(sheet!.getRow(2).getCell(1).value, 'SHP-001');
  assert.strictEqual(sheet!.getRow(2).getCell(3).value, 'SABIC Ltd');
  assert.strictEqual(sheet!.getRow(2).getCell(4).value, 1250);
  assert.strictEqual(sheet!.getRow(3).getCell(6).value, "'=Top Secret");
});

test('7. Filename Sanitization Security for XLSX', () => {
  // Path traversal stripping
  const bad1 = sanitizeXLSXFilename('../../../etc/passwd', 'shipments');
  assert.ok(!bad1.includes('/'), 'Must strip /');
  assert.ok(bad1.endsWith('.xlsx'), 'Must end with .xlsx');

  // CR/LF injection stripping
  const bad2 = sanitizeXLSXFilename('export\r\nHeader-Injection: true', 'shipments');
  assert.ok(!bad2.includes('\r') && !bad2.includes('\n'), 'Must strip CR/LF');

  // Empty filename fallback
  const empty = sanitizeXLSXFilename('', 'shipments');
  assert.ok(empty.startsWith('AJA_shipments_export_'));
  assert.ok(empty.endsWith('.xlsx'));
});

test('8. Worksheet Name Sanitization', () => {
  // Remove forbidden Excel sheet characters \ / ? * : [ ] and cap length at 31
  const badName = 'Shipments/Main?List:[Active]*2026';
  const sanitized = sanitizeWorksheetName(badName);
  assert.ok(!/[\\/\?\*:\[\]]/.test(sanitized), 'Must strip forbidden sheet characters');
  assert.ok(sanitized.length <= 31, 'Sheet name must not exceed 31 characters');
});

test('9. Base64 Generation for JSON Contracts', async () => {
  const records = [
    { id: 'SHP-001', trackingNumber: 'AJA-001', senderName: 'AJA', weightKg: 100, isExpress: true, notes: 'OK' },
  ];

  const b64 = await generateXLSXBase64(records, mockPolicy, 'en');
  assert.ok(typeof b64 === 'string' && b64.length > 0);

  const buf = Buffer.from(b64, 'base64');
  const parsedWb = new ExcelJS.Workbook();
  await parsedWb.xlsx.load(buf);
  assert.strictEqual(parsedWb.worksheets.length, 1);
});

test('10. Export Policy Format Normalization for XLSX / Excel', async () => {
  const authContext = { userId: 'usr_admin', companyId: 'COMP-AJA-01', userPermissions: ['shipments.export'] };

  const xlsxRequest = {
    resource: 'shipments',
    format: 'excel' as const, // test alias 'excel'
    selection: {
      mode: 'EXPLICIT' as const,
      ids: ['SHP-001'],
    },
  };

  const policyRes = await resolveExportPolicy('shipments', xlsxRequest, authContext);
  assert.ok(policyRes.success && policyRes.policy);
  assert.strictEqual(policyRes.policy.format, 'xlsx');
  assert.strictEqual(policyRes.policy.operationalFormatStatus, 'SUPPORTED');
});
