/**
 * AJA INTERNATIONAL LOGISTICS — STEP 05.18.08 IMPORT MAPPING & VALIDATION SUITE
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveImportSchema, PROHIBITED_INTERNAL_FIELDS } from './importSchemaResolver';
import { autoMapImportHeaders, validateImportMappings } from './importHeaderMatcher';
import { normalizeCellValue } from './importValueNormalizer';
import { validateImportRows } from './importRowValidator';
import { importValidationService } from '../../services/importValidationService';
import { ParsedImportFile, DATA_EXCHANGE_LIMITS } from '../../types/dataTransferFramework';

test('=== STEP 05.18.08 IMPORT MAPPING & VALIDATION SUITE ===', async (t) => {
  await t.test('1. Schema Resolver — Resource Schema Resolution & Prohibited Internal Fields', () => {
    const shipmentSchema = resolveImportSchema('shipments');
    assert.equal(shipmentSchema.resource, 'shipments');
    assert.ok(shipmentSchema.columns.length > 5);
    assert.equal(shipmentSchema.primaryKey, 'id');
    assert.ok(shipmentSchema.requiredFields.includes('trackingNumber'));

    const customerSchema = resolveImportSchema('customers');
    assert.equal(customerSchema.resource, 'customers');
    assert.ok(customerSchema.requiredFields.includes('companyName'));
    assert.ok(customerSchema.requiredFields.includes('email'));

    const quoteSchema = resolveImportSchema('quotes');
    assert.equal(quoteSchema.resource, 'quotes');
    assert.ok(quoteSchema.requiredFields.includes('quoteNumber'));

    // Check unknown resource error
    assert.throws(() => resolveImportSchema('unknown_resource'), {
      name: 'ImportParserError',
      code: 'UNAUTHORIZED_RESOURCE',
    });

    // Check prohibited internal fields are disallowed
    for (const col of shipmentSchema.columns) {
      assert.equal(PROHIBITED_INTERNAL_FIELDS.has(col.field.toLowerCase()), false);
    }

    console.log('[PASS] 1. Schema Resolver correctly resolves schemas and excludes prohibited fields.');
  });

  await t.test('2. Header Matching — Priority, Aliases & Arabic Matching', () => {
    const schema = resolveImportSchema('shipments');

    const headers = [
      'trackingNumber', // Priority 1: Exact key
      'مدينة المبدأ', // Priority 4: Exact Arabic label
      'Carrier Partner', // Priority 3: Exact English label
      'Tracking #', // Priority 2: Alias
      '   STATUS   ', // Priority 5: Normalized label
      'Random Extra Header', // Unmapped
    ];

    const mappings = autoMapImportHeaders(headers, schema);

    assert.equal(mappings.length, 6);
    assert.equal(mappings[0].targetField, 'trackingNumber');
    assert.equal(mappings[1].targetField, 'originCity');
    assert.equal(mappings[2].targetField, 'carrierPartner');
    assert.equal(mappings[4].targetField, 'currentStatus');
    assert.equal(mappings[5].mappingStatus, 'UNMAPPED');

    console.log('[PASS] 2. Header matching accurately maps exact keys, Arabic labels, English labels and aliases.');
  });

  await t.test('3. Mapping Security — Rejects Duplicate Targets & System Internal Fields', () => {
    const schema = resolveImportSchema('shipments');

    // Test duplicate target field mapping
    const duplicateTargetMappings = [
      { sourceColumn: 'Col 1', targetField: 'trackingNumber', mappingStatus: 'MATCHED' as const },
      { sourceColumn: 'Col 2', targetField: 'trackingNumber', mappingStatus: 'MATCHED' as const },
    ];

    const dupCheck = validateImportMappings(duplicateTargetMappings, schema);
    assert.equal(dupCheck.isValid, false);
    assert.ok(dupCheck.errors.some((e) => e.includes('Multiple source columns')));

    // Test prohibited internal field mapping
    const prohibitedMappings = [
      { sourceColumn: 'Tenant ID', targetField: 'tenantId', mappingStatus: 'MATCHED' as const },
    ];

    const prohCheck = validateImportMappings(prohibitedMappings, schema);
    assert.equal(prohCheck.isValid, false);
    assert.ok(prohCheck.errors.some((e) => e.includes('cannot be mapped to system internal field')));

    console.log('[PASS] 3. Mapping security strictly rejects duplicate target fields and internal fields.');
  });

  await t.test('4. Value Normalizer — Primitives, Dates, Enums & Formula Protection', () => {
    const schema = resolveImportSchema('shipments');
    const colTracking = schema.columns.find((c) => c.field === 'trackingNumber')!;
    const colWeight = schema.columns.find((c) => c.field === 'weightKg')!;
    const colStatus = schema.columns.find((c) => c.field === 'currentStatus')!;
    const colDate = schema.columns.find((c) => c.field === 'estimatedDeliveryDate')!;

    // 1. Required string check
    const emptyReq = normalizeCellValue('', colTracking);
    assert.equal(emptyReq.error?.code, 'REQUIRED_FIELD');

    // 2. String & Formula protection (never execute formula, preserve text)
    const formulaVal = normalizeCellValue("'=SUM(1,2)", colTracking);
    assert.equal(formulaVal.normalizedValue, '=SUM(1,2)');
    assert.equal(formulaVal.error, undefined);

    const arithmeticVal = normalizeCellValue('-500', colTracking);
    assert.equal(arithmeticVal.normalizedValue, '-500');

    // 3. Number normalization
    const numOk = normalizeCellValue('1500.75', colWeight);
    assert.equal(numOk.normalizedValue, 1500.75);

    const numBad = normalizeCellValue('12abc', colWeight);
    assert.equal(numBad.error?.code, 'INVALID_NUMBER');

    // 4. Enum normalization
    const enumOk = normalizeCellValue('in_transit', colStatus);
    assert.equal(enumOk.normalizedValue, 'IN_TRANSIT');

    const enumBad = normalizeCellValue('INVALID_STATUS', colStatus);
    assert.equal(enumBad.error?.code, 'INVALID_ENUM');

    // 5. Date normalization
    const dateOk = normalizeCellValue('2026-08-15', colDate);
    assert.equal(dateOk.normalizedValue, '2026-08-15');

    const dateBad = normalizeCellValue('not-a-date', colDate);
    assert.equal(dateBad.error?.code, 'INVALID_DATE');

    console.log('[PASS] 4. Value normalizer correctly processes primitives, dates, enums and formula-like inputs.');
  });

  await t.test('5. Row Validator — Validates Rows, Missing Required Fields & Bounded Summary', async () => {
    const schema = resolveImportSchema('shipments');

    const parsedFile: ParsedImportFile = {
      fileMetadata: { name: 'test.csv', size: 1000, mimeType: 'text/csv', extension: 'csv' },
      format: 'csv',
      headers: ['Tracking Number', 'Status', 'Weight'],
      rows: [
        { 'Tracking Number': 'SHP-101', Status: 'IN_TRANSIT', Weight: '1500' }, // Valid
        { 'Tracking Number': '', Status: 'DELIVERED', Weight: '2000' }, // Missing required tracking number
        { 'Tracking Number': 'SHP-103', Status: 'WRONG_ENUM', Weight: 'invalid_num' }, // Invalid enum & number
      ],
      totalRowCount: 3,
      totalColumnCount: 3,
      warnings: [],
    };

    const mappings = autoMapImportHeaders(parsedFile.headers, schema);

    const { summary, boundedSample } = await validateImportRows(
      parsedFile,
      mappings,
      schema,
      { userId: 'usr_1', companyId: 'cmp_1' }
    );

    assert.equal(summary.totalRows, 3);
    assert.equal(summary.validRows, 1);
    assert.equal(summary.invalidRows, 2);
    assert.ok(summary.missingRequiredFields! >= 1);
    assert.ok(summary.invalidTypeFormats! >= 2);
    assert.equal(boundedSample.length, 3);

    console.log('[PASS] 5. Row validator accurately produces row statuses, validation summary and bounded sample.');
  });

  await t.test('6. Import Validation Service — Authoritative Full Pipeline Integration', async () => {
    const parsedFile: ParsedImportFile = {
      fileMetadata: { name: 'customers.xlsx', size: 2000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' },
      format: 'xlsx',
      headers: ['اسم الشركة', 'البريد الإلكتروني', 'الحد الائتماني'],
      rows: [
        { 'اسم الشركة': 'شركة الأمل اللوجستية', 'البريد الإلكتروني': 'info@alamal.sa', 'الحد الائتماني': '50000' },
      ],
      totalRowCount: 1,
      totalColumnCount: 3,
      warnings: [],
    };

    const result = await importValidationService.validateImportPayload(
      {
        resource: 'customers',
        parsedFile,
      },
      { userId: 'usr_admin', companyId: 'tenant_aja' }
    );

    assert.equal(result.resource, 'customers');
    assert.equal(result.mappingValid, true);
    assert.equal(result.summary.validRows, 1);
    assert.equal(result.summary.invalidRows, 0);

    console.log('[PASS] 6. Import validation service completes end-to-end pipeline successfully.');
  });
});
