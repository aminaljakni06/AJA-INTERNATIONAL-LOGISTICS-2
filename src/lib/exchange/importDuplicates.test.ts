/**
 * AJA INTERNATIONAL LOGISTICS — STEP 05.18.09 Duplicate Detection & Resolution Test Suite
 * Mode: Automated Unit & Integration Tests
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ImportDuplicateDetectionService,
  SystemRecordMatch,
  BOUNDED_DUPLICATE_SAMPLE_LIMIT,
} from '../../services/importDuplicateDetectionService';
import { DuplicateHandlingStrategy } from '../../types/dataTransferFramework';

describe('STEP 05.18.09 — Enterprise Duplicate Detection & Resolution Framework', () => {
  describe('1. File-Level Duplicate Detection (O(N) Map-Based Grouping)', () => {
    test('1.1 Should report 0 file duplicates when all unique keys are distinct', async () => {
      const rows = [
        { trackingNumber: 'AJA-100-SA', referenceNumber: 'REF-01', originCity: 'Riyadh' },
        { trackingNumber: 'AJA-101-SA', referenceNumber: 'REF-02', originCity: 'Jeddah' },
        { trackingNumber: 'AJA-102-SA', referenceNumber: 'REF-03', originCity: 'Dammam' },
      ];

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('shipments', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['shipments.edit'] },
        customSystemLookupHandler: async () => new Map(),
      });

      assert.equal(res.summary.totalRows, 3);
      assert.equal(res.summary.fileDuplicateRows, 0);
      assert.equal(res.summary.duplicateGroupsCount, 0);
      assert.equal(res.summary.rowsEligibleForImport, 3);
    });

    test('1.2 Should detect file duplicates sharing the same tracking number across multiple rows', async () => {
      const rows = [
        { trackingNumber: 'AJA-999-SA', referenceNumber: 'REF-01' }, // Row 1
        { trackingNumber: 'AJA-888-SA', referenceNumber: 'REF-02' }, // Row 2
        { trackingNumber: 'AJA-999-SA', referenceNumber: 'REF-03' }, // Row 3 (Dup of Row 1)
        { trackingNumber: 'AJA-777-SA', referenceNumber: 'REF-04' }, // Row 4
      ];

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('shipments', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['shipments.edit'] },
        customSystemLookupHandler: async () => new Map(),
      });

      assert.equal(res.summary.totalRows, 4);
      assert.equal(res.summary.fileDuplicateRows, 2);
      assert.equal(res.summary.duplicateGroupsCount, 1);
      assert.deepEqual(res.duplicateGroups[0].rowNumbers, [1, 3]);
      assert.equal(res.duplicateGroups[0].duplicateKey, 'AJA-999-SA');
    });

    test('1.3 Should normalize whitespace, casing and Arabic text without executing formulas', async () => {
      const rows = [
        { email: '  User@Example.com  ', companyName: 'الشركة العربية' },
        { email: 'user@example.com', companyName: 'الشركة العربية' },
        { email: "'=SUM(1,2)@test.com", companyName: 'شركة النقل' },
      ];

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('customers', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['customers.edit'] },
        customSystemLookupHandler: async () => new Map(),
      });

      assert.equal(res.summary.totalRows, 3);
      assert.equal(res.summary.fileDuplicateRows, 2); // Row 1 and Row 2 match on normalized email
      assert.equal(res.sampleRows[2].mappedData.email, "'=SUM(1,2)@test.com"); // Inert formula preserved
    });

    test('1.4 Should ignore empty or null lookup values during file duplicate grouping', async () => {
      const rows = [
        { trackingNumber: '', referenceNumber: '' },
        { trackingNumber: null as any, referenceNumber: undefined as any },
        { trackingNumber: 'AJA-001-SA', referenceNumber: 'REF-99' },
      ];

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('shipments', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['shipments.edit'] },
        customSystemLookupHandler: async () => new Map(),
      });

      assert.equal(res.summary.fileDuplicateRows, 0);
    });
  });

  describe('2. System-Level Duplicate Detection (Batched Lookup & Tenant Isolation)', () => {
    test('2.1 Should identify existing system records and return matched record IDs', async () => {
      const rows = [
        { trackingNumber: 'AJA-SYS-001', referenceNumber: 'REF-01' },
        { trackingNumber: 'AJA-NEW-002', referenceNumber: 'REF-02' },
      ];

      const customHandler = async (resource: string, lookupKey: string, values: string[]) => {
        const matches = new Map<string, SystemRecordMatch>();
        if (values.includes('AJA-SYS-001')) {
          matches.set('AJA-SYS-001', {
            id: 'SHP-EXISTING-99',
            companyId: 'company_aja',
            data: { id: 'SHP-EXISTING-99', trackingNumber: 'AJA-SYS-001' },
          });
        }
        return matches;
      };

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('shipments', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['shipments.edit'] },
        customSystemLookupHandler: customHandler,
      });

      assert.equal(res.summary.systemDuplicateRows, 1);
      assert.equal(res.sampleRows[0].status, 'DUPLICATE');
      assert.equal(res.sampleRows[0].duplicateType, 'SYSTEM');
      assert.equal(res.sampleRows[0].existingRecordId, 'SHP-EXISTING-99');
      assert.equal(res.sampleRows[1].status, 'VALID');
    });

    test('2.2 Should enforce strict tenant isolation and ignore cross-tenant system matches', async () => {
      const rows = [{ trackingNumber: 'AJA-CROSS-TENANT' }];

      const customHandler = async (resource: string, lookupKey: string, values: string[], tenantId?: string) => {
        const matches = new Map<string, SystemRecordMatch>();
        // Match belongs to OTHER tenant 'company_other'
        if (tenantId === 'company_other') {
          matches.set('AJA-CROSS-TENANT', {
            id: 'SHP-OTHER-123',
            companyId: 'company_other',
            data: { id: 'SHP-OTHER-123', trackingNumber: 'AJA-CROSS-TENANT' },
          });
        }
        return matches;
      };

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('shipments', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_my_tenant', userPermissions: ['shipments.edit'] },
        customSystemLookupHandler: customHandler,
      });

      assert.equal(res.summary.systemDuplicateRows, 0); // Must NOT match cross-tenant record
      assert.equal(res.sampleRows[0].isDuplicate, false);
    });

    test('2.3 Should detect conflicting matches when distinct unique keys point to different system records', async () => {
      const rows = [
        { email: 'conflict@example.com', vatNumber: '300099988800003' },
      ];

      const customHandler = async (resource: string, lookupKey: string, values: string[]) => {
        const matches = new Map<string, SystemRecordMatch>();
        if (lookupKey === 'email' && values.includes('conflict@example.com')) {
          matches.set('conflict@example.com', {
            id: 'CUST-ACC-111',
            data: { id: 'CUST-ACC-111', email: 'conflict@example.com' },
          });
        }
        if (lookupKey === 'vatNumber' && values.includes('300099988800003')) {
          matches.set('300099988800003', {
            id: 'CUST-ACC-222', // Different existing customer ID!
            data: { id: 'CUST-ACC-222', vatNumber: '300099988800003' },
          });
        }
        return matches;
      };

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('customers', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['customers.edit'] },
        customSystemLookupHandler: customHandler,
      });

      assert.equal(res.summary.conflictRows, 1);
      assert.equal(res.sampleDuplicateMatches[0].isConflict, true);
    });
  });

  describe('3. Resolution Policy & Strategy Authorization', () => {
    test('3.1 Should authorize SKIP strategy for all supported resources', () => {
      const auth = ImportDuplicateDetectionService.validateStrategyAuthorization('shipments', 'SKIP', []);
      assert.equal(auth.authorized, true);
    });

    test('3.2 Should authorize OVERWRITE strategy only when user possesses edit permissions', () => {
      const authDenied = ImportDuplicateDetectionService.validateStrategyAuthorization('shipments', 'OVERWRITE', ['shipments.view']);
      assert.equal(authDenied.authorized, false);

      const authGranted = ImportDuplicateDetectionService.validateStrategyAuthorization('shipments', 'OVERWRITE', ['shipments.edit']);
      assert.equal(authGranted.authorized, true);
    });

    test('3.3 Should reject unsupported strategies (e.g., CREATE_COPY on customers)', () => {
      const auth = ImportDuplicateDetectionService.validateStrategyAuthorization('customers', 'CREATE_COPY', ['customers.edit']);
      assert.equal(auth.authorized, false);
      assert.match(auth.reasonEn || '', /not supported for resource "customers"/);
    });
  });

  describe('4. Bounded Response Payload & Capping', () => {
    test('4.1 Should cap detailed sample rows and matches at BOUNDED_DUPLICATE_SAMPLE_LIMIT (50)', async () => {
      const rows = Array.from({ length: 120 }, (_, i) => ({
        trackingNumber: `AJA-BULK-${i % 10}-SA`, // 10 unique keys repeated 12 times
      }));

      const res = await ImportDuplicateDetectionService.detectAndClassifyDuplicates('shipments', rows, {
        duplicateStrategy: 'SKIP',
        tenantContext: { companyId: 'company_aja', userPermissions: ['shipments.edit'] },
        customSystemLookupHandler: async () => new Map(),
      });

      assert.equal(res.summary.totalRows, 120);
      assert.equal(res.summary.fileDuplicateRows, 120);
      assert.equal(res.sampleRows.length, BOUNDED_DUPLICATE_SAMPLE_LIMIT); // Capped at 50
      assert.equal(res.sampleDuplicateMatches.length, BOUNDED_DUPLICATE_SAMPLE_LIMIT); // Capped at 50
    });
  });
});
