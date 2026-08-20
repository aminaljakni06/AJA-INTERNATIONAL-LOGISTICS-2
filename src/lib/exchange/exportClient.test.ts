/**
 * AJA INTERNATIONAL LOGISTICS — Export Client Unit Tests
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Export API & Table Integration (STEP 05.18.06)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import {
  buildEnterpriseExportRequest,
  parseContentDispositionFilename,
  SYSTEM_UI_COLUMN_KEYS,
  ExportClientError,
} from './exportClient';
import { BulkSelectionDescriptor } from '../../types/bulkFramework';

test('1. Request Builder — Default Fields & Selection', () => {
  const selection: BulkSelectionDescriptor = {
    mode: 'EXPLICIT',
    ids: ['SHP-001', 'SHP-002'],
  };

  const request = buildEnterpriseExportRequest({
    resource: 'shipments',
    format: 'csv',
    selection,
    fieldMode: 'DEFAULT_FIELDS',
    locale: 'en',
  });

  assert.strictEqual(request.resource, 'shipments');
  assert.strictEqual(request.format, 'csv');
  assert.strictEqual(request.selectedFields, undefined, 'Default fields mode should leave selectedFields undefined');
  assert.deepStrictEqual(request.selection, selection);
});

test('2. Request Builder — Visible Columns Mode (Filters out System UI Columns)', () => {
  const visibleKeys = ['select', '__select__', 'trackingNumber', 'senderName', '__actions__', 'status'];

  const request = buildEnterpriseExportRequest({
    resource: 'shipments',
    format: 'excel',
    fieldMode: 'VISIBLE_COLUMNS',
    visibleFieldKeys: visibleKeys,
    locale: 'ar',
  });

  assert.strictEqual(request.format, 'xlsx', 'Format "excel" should normalize to "xlsx"');
  assert.deepStrictEqual(request.selectedFields, ['trackingNumber', 'senderName', 'status']);
});

test('3. Request Builder — Scope Fallback to Selection Descriptor', () => {
  const requestSelected = buildEnterpriseExportRequest({
    resource: 'customers',
    format: 'csv',
    scope: 'selected',
    selectedIds: ['CUST-100', 'CUST-200'],
  });

  assert.strictEqual(requestSelected.selection?.mode, 'EXPLICIT');
  assert.deepStrictEqual(requestSelected.selection?.ids, ['CUST-100', 'CUST-200']);

  const queryState = {
    search: 'SABIC',
    filters: { status: 'ACTIVE' },
    sort: { field: 'name', direction: 'asc' as const },
    pagination: { page: 1, pageSize: 50 },
  };

  const requestQuery = buildEnterpriseExportRequest({
    resource: 'customers',
    format: 'xlsx',
    scope: 'query',
    queryState,
    excludedIds: ['CUST-999'],
  });

  assert.strictEqual(requestQuery.selection?.mode, 'QUERY');
  assert.deepStrictEqual(requestQuery.selection?.query, queryState);
  assert.deepStrictEqual(requestQuery.selection?.excludedIds, ['CUST-999']);
});

test('4. Content-Disposition Filename Parsing', () => {
  // UTF-8 encoded filename
  const utf8Header = "attachment; filename*=UTF-8''AJA_shipments_%D8%B4%D8%AD%D9%86%D8%A7%D8%AA.csv";
  assert.strictEqual(parseContentDispositionFilename(utf8Header), 'AJA_shipments_شحنات.csv');

  // Standard quoted filename
  const stdHeader = 'attachment; filename="AJA_customers_2026.xlsx"';
  assert.strictEqual(parseContentDispositionFilename(stdHeader), 'AJA_customers_2026.xlsx');

  // Fallback filename
  assert.strictEqual(parseContentDispositionFilename(null, 'default.csv'), 'default.csv');
});

test('5. System UI Column Key Detection', () => {
  assert.ok(SYSTEM_UI_COLUMN_KEYS.has('select'));
  assert.ok(SYSTEM_UI_COLUMN_KEYS.has('selection'));
  assert.ok(SYSTEM_UI_COLUMN_KEYS.has('__actions__'));
  assert.ok(SYSTEM_UI_COLUMN_KEYS.has('__expand__'));
  assert.ok(!SYSTEM_UI_COLUMN_KEYS.has('trackingNumber'));
});

test('6. Export Client Error Class', () => {
  const err = new ExportClientError('EXPORT_LIMIT_EXCEEDED', 'Max 10,000 records allowed', 'تجاوزت الحد الأقصى');
  assert.strictEqual(err.code, 'EXPORT_LIMIT_EXCEEDED');
  assert.strictEqual(err.message, 'Max 10,000 records allowed');
  assert.strictEqual(err.messageAr, 'تجاوزت الحد الأقصى');
});
