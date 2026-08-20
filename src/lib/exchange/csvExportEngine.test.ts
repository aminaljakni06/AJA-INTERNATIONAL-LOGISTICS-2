/**
 * AJA INTERNATIONAL LOGISTICS — CSV Export Engine & Download Unit Tests
 * Phase: Enterprise UI System
 * Module: File-Based Operations, CSV Export Engine (STEP 05.18.04)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import {
  serializeValue,
  serializeHeader,
  serializeRow,
  serializeCSVContent,
  sanitizeFilename,
  streamCSVResponse,
  UTF8_BOM,
} from './csvExportEngine';
import { ExportFieldDefinition, DATA_EXCHANGE_LIMITS } from '../../types/dataTransferFramework';
import { ResolvedExportPolicy, resolveExportPolicy } from './exportPolicyResolver';
import { Writable } from 'stream';

const mockFields: ExportFieldDefinition[] = [
  { id: 'f1', key: 'id', labelEn: 'Shipment ID', labelAr: 'معرف الشحنة', type: 'string', exportable: true, isDefault: true },
  { id: 'f2', key: 'trackingNumber', labelEn: 'Tracking Number', labelAr: 'رقم التتبع', type: 'string', exportable: true, isDefault: true },
  { id: 'f3', key: 'senderName', labelEn: 'Sender Name', labelAr: 'اسم المرسل', type: 'string', exportable: true, isDefault: true },
  { id: 'f4', key: 'weightKg', labelEn: 'Weight (kg)', labelAr: 'الوزن (كجم)', type: 'number', exportable: true, isDefault: true },
  { id: 'f5', key: 'notes', labelEn: 'Special Notes', labelAr: 'ملاحظات خاصة', type: 'string', exportable: true, isDefault: true },
];

const mockPolicy: ResolvedExportPolicy = {
  resource: 'shipments',
  resourceAdapter: {} as any,
  format: 'csv',
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
  estimatedRecordCount: 5,
  includeHeaders: true,
  fileName: 'AJA_shipments_test.csv',
  auditMetadata: {
    resource: 'shipments',
    format: 'csv',
    selectionMode: 'QUERY',
    recordCount: 5,
    allowedFieldCount: 5,
    executionTimeMs: 10,
    effectiveLimit: 10000,
    requestedByUserId: 'usr_admin',
    companyId: 'COMP-AJA-01',
  },
};

test('1. CSV Value Serialization & Escaping', () => {
  // Null, undefined -> empty
  assert.strictEqual(serializeValue(null), '');
  assert.strictEqual(serializeValue(undefined), '');

  // Numbers & Booleans
  assert.strictEqual(serializeValue(1250), '1250');
  assert.strictEqual(serializeValue(true), 'true');
  assert.strictEqual(serializeValue(false), 'false');

  // Simple string
  assert.strictEqual(serializeValue('Riyadh'), 'Riyadh');

  // String containing comma -> wrapped in quotes
  assert.strictEqual(serializeValue('Riyadh, Saudi Arabia'), '"Riyadh, Saudi Arabia"');

  // String containing double quotes -> doubled quotes + wrapped in quotes
  assert.strictEqual(serializeValue('AJA "Express" Cargo'), '"AJA ""Express"" Cargo"');

  // String containing newlines / carriage returns
  assert.strictEqual(serializeValue('Line1\nLine2\rLine3'), '"Line1\nLine2\rLine3"');
});

test('2. Formula Injection Protection in CSV Cells', () => {
  // Leading =
  assert.strictEqual(serializeValue('=1+2'), "'=1+2");
  assert.strictEqual(serializeValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");

  // Leading +, -, @
  assert.strictEqual(serializeValue('+966500000000'), "'+966500000000");
  assert.strictEqual(serializeValue('-100 SAR'), "'-100 SAR");
  assert.strictEqual(serializeValue('@cmd'), "'@cmd");

  // Leading \t, \r
  assert.strictEqual(serializeValue('\tTabbed'), "'\tTabbed");
});

test('3. Large String Cell Truncation', () => {
  const giantString = 'A'.repeat(DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH + 500);
  const serialized = serializeValue(giantString);
  assert.strictEqual(serialized.length, DATA_EXCHANGE_LIMITS.MAX_CELL_CHARACTER_LENGTH);
});

test('4. Header Generation (English & Arabic)', () => {
  const headerEn = serializeHeader(mockFields, 'en', true);
  assert.strictEqual(headerEn, 'Shipment ID,Tracking Number,Sender Name,Weight (kg),Special Notes');

  const headerAr = serializeHeader(mockFields, 'ar', true);
  assert.strictEqual(headerAr, 'معرف الشحنة,رقم التتبع,اسم المرسل,الوزن (كجم),ملاحظات خاصة');

  const headerDisabled = serializeHeader(mockFields, 'en', false);
  assert.strictEqual(headerDisabled, '');
});

test('5. Row Serialization in Deterministic Field Order', () => {
  const rowObj = {
    id: 'SHP-001',
    trackingNumber: 'AJA-99210-SA',
    senderName: 'SABIC, Ltd',
    weightKg: 1250,
    notes: '=Fragile = handle with care',
    extraUnapprovedKey: 'SECRET_DATA',
  };

  const serialized = serializeRow(rowObj, mockFields);
  assert.strictEqual(
    serialized,
    'SHP-001,AJA-99210-SA,"SABIC, Ltd",1250,\'=Fragile = handle with care'
  );
  assert.strictEqual(serialized.includes('SECRET_DATA'), false);
});

test('6. Complete CSV Content Generation with UTF-8 BOM & Arabic', () => {
  const records = [
    { id: 'SHP-001', trackingNumber: 'AJA-001', senderName: 'سابك للصناعات', weightKg: 500, notes: 'عاجل' },
    { id: 'SHP-002', trackingNumber: 'AJA-002', senderName: 'شركة أرامكو', weightKg: 1200, notes: 'شحنة محليّة' },
  ];

  const csv = serializeCSVContent(records, mockPolicy, 'ar');
  assert.ok(csv.startsWith(UTF8_BOM), 'CSV must start with UTF-8 BOM');
  assert.ok(csv.includes('معرف الشحنة,رقم التتبع,اسم المرسل,الوزن (كجم),ملاحظات خاصة'));
  assert.ok(csv.includes('SHP-001,AJA-001,سابك للصناعات,500,عاجل'));
  assert.ok(csv.includes('SHP-002,AJA-002,شركة أرامكو,1200,شحنة محليّة'));
});

test('7. Filename Sanitization Security', () => {
  // Path traversal stripping
  const bad1 = sanitizeFilename('../../../etc/passwd', 'shipments');
  assert.ok(!bad1.includes('/'), 'Must strip /');
  assert.ok(bad1.endsWith('.csv'), 'Must end with .csv');

  // CR/LF injection stripping
  const bad2 = sanitizeFilename('export\r\nHeader-Injection: true', 'shipments');
  assert.ok(!bad2.includes('\r') && !bad2.includes('\n'), 'Must strip CR/LF');

  // Empty filename fallback
  const empty = sanitizeFilename('', 'shipments');
  assert.ok(empty.startsWith('AJA_shipments_export_'));
  assert.ok(empty.endsWith('.csv'));
});

test('8. Stream CSV Response Integration', async () => {
  const records = [
    { id: 'SHP-001', trackingNumber: 'AJA-001', senderName: 'SABIC', weightKg: 500, notes: 'OK' },
    { id: 'SHP-002', trackingNumber: 'AJA-002', senderName: 'Aramco', weightKg: 1000, notes: 'Fast' },
  ];

  const chunks: string[] = [];
  const mockWritable = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk.toString('utf-8'));
      callback();
    },
  });

  const result = await streamCSVResponse(records, mockPolicy, mockWritable as any, 'en');
  const fullOutput = chunks.join('');

  assert.strictEqual(result.recordCount, 2);
  assert.ok(fullOutput.startsWith(UTF8_BOM));
  assert.ok(fullOutput.includes('Shipment ID,Tracking Number,Sender Name,Weight (kg),Special Notes'));
  assert.ok(fullOutput.includes('SHP-001,AJA-001,SABIC,500,OK'));
  assert.ok(fullOutput.includes('SHP-002,AJA-002,Aramco,1000,Fast'));
});

test('9. Export Record Limit Enforced', async () => {
  const authContext = { userId: 'usr_admin', companyId: 'COMP-AJA-01', userPermissions: ['shipments.export'] };
  const largeRequest = {
    resource: 'shipments',
    format: 'csv' as const,
    selection: {
      mode: 'QUERY' as const,
      resource: 'shipments',
      query: { search: '', filters: {}, sort: { field: 'createdAt', direction: 'desc' as const }, pagination: { page: 1, pageSize: 25 } },
      excludedIds: [],
    },
  };

  const policyRes = await resolveExportPolicy('shipments', largeRequest, authContext);
  assert.ok(policyRes.success && policyRes.policy);
  assert.strictEqual(policyRes.policy.effectiveRecordLimit, 10000);
});
