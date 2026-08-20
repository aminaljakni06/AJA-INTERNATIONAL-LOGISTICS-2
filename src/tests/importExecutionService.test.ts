/**
 * AJA INTERNATIONAL LOGISTICS — Unit & Integration Tests
 * STEP 05.18.11 — ENTERPRISE IMPORT EXECUTION, PARTIAL RESULTS & ERROR REPORTING
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ImportExecutionService } from '../services/importExecutionService';
import { clearInMemoryOperationsStore } from '../db/repositories/importOperationRepository';
import { ParsedImportFile } from '../types/dataTransferFramework';

describe('STEP 05.18.11 — Enterprise Import Execution Engine', () => {
  beforeEach(() => {
    clearInMemoryOperationsStore();
  });

  const mockParsedFile: ParsedImportFile = {
    fileMetadata: {
      name: 'shipments_test.csv',
      size: 1024,
      mimeType: 'text/csv',
      extension: 'csv',
    },
    format: 'csv',
    totalRowCount: 3,
    totalColumnCount: 6,
    warnings: [],
    headers: ['Tracking Number', 'Status', 'Origin City', 'Destination City', 'Weight (kg)', 'Declared Value (SAR)'],
    rows: [
      { 'Tracking Number': 'AJA-1001', Status: 'BOOKED', 'Origin City': 'Riyadh', 'Destination City': 'Jeddah', 'Weight (kg)': '15', 'Declared Value (SAR)': '1200' },
      { 'Tracking Number': 'AJA-1002', Status: 'IN_TRANSIT', 'Origin City': 'Dammam', 'Destination City': 'Khobar', 'Weight (kg)': '25', 'Declared Value (SAR)': '2500' },
      { 'Tracking Number': 'AJA-1003', Status: 'DELIVERED', 'Origin City': 'Jeddah', 'Destination City': 'Medina', 'Weight (kg)': '5', 'Declared Value (SAR)': '500' },
    ],
  };

  const userMappings = {
    'Tracking Number': 'trackingNumber',
    Status: 'currentStatus',
    'Origin City': 'originCity',
    'Destination City': 'destinationCity',
    'Weight (kg)': 'weightKg',
    'Declared Value (SAR)': 'declaredValueSar',
  };

  it('1. Rejects execution if user authentication context is missing', async () => {
    await assert.rejects(
      async () => {
        await ImportExecutionService.executeImportPlan({
          planId: 'plan_test_01',
          planFingerprint: 'plan_test_01_fp',
          resource: 'shipments',
          parsedFile: mockParsedFile,
          userMappings,
          tenantContext: {
            userId: '', // missing authentication
          },
        });
      },
      (err: any) => {
        assert.equal(err.code, 'UNAUTHORIZED_RESOURCE');
        return true;
      }
    );
  });

  it('2. Rejects execution if plan fingerprint is stale or invalid', async () => {
    await assert.rejects(
      async () => {
        await ImportExecutionService.executeImportPlan({
          planId: 'plan_test_02',
          planFingerprint: 'STALE_FINGERPRINT_123',
          resource: 'shipments',
          parsedFile: mockParsedFile,
          userMappings,
          tenantContext: {
            userId: 'usr_test_admin',
            tenantId: 'tenant_aja_default',
          },
        });
      },
      (err: any) => {
        assert.equal(err.code, 'STALE_IMPORT_PLAN');
        return true;
      }
    );
  });

  it('3. Sanitizes row payload by removing protected system fields while preserving commercial string values', () => {
    const dangerousPayload = {
      trackingNumber: 'AJA-FORMULA-1',
      tenantId: 'HACKED_TENANT',
      companyId: 'HACKED_COMPANY',
      password: 'stolen_password',
      permissions: ['ALL_ADMIN'],
      originCity: "=CMD('calc.exe')",
      destinationCity: 'Jeddah',
    };

    const sanitized = ImportExecutionService.sanitizeRowPayload(dangerousPayload, 'shipments');

    assert.equal(sanitized.tenantId, undefined);
    assert.equal(sanitized.companyId, undefined);
    assert.equal(sanitized.password, undefined);
    assert.equal(sanitized.permissions, undefined);
    assert.equal(sanitized.trackingNumber, 'AJA-FORMULA-1');
    assert.equal(sanitized.originCity, "=CMD('calc.exe')"); // Preserved in DB persistence (CSV export handles formula escaping)
    assert.equal(sanitized.destinationCity, 'Jeddah');
  });

  it('4. Generates downloadable CSV Error Report format cleanly', () => {
    const failures = [
      {
        row: 2,
        plannedAction: 'UPDATE' as const,
        errorCode: 'UPDATE_TARGET_NOT_FOUND',
        errorEn: 'Target record SHP-999 not found for update.',
        errorAr: 'السجل المستهدف غير موجود.',
        retryable: false,
      },
      {
        row: 5,
        plannedAction: 'CREATE' as const,
        errorCode: 'VALIDATION_FAILED',
        errorEn: 'Weight must be a positive number.',
        errorAr: 'الوزن يجب أن يكون رقماً موجباً.',
        retryable: true,
      },
    ];

    const csvOutput = ImportExecutionService.generateCSVErrorReport('op_test_err_1', 'shipments', failures);

    assert.ok(csvOutput.includes('Row,Planned Action,Result,Error Code,Error Message,Retryable'));
    assert.ok(csvOutput.includes('2,UPDATE,FAILED,UPDATE_TARGET_NOT_FOUND,Target record SHP-999 not found for update.,NO'));
    assert.ok(csvOutput.includes('5,CREATE,FAILED,VALIDATION_FAILED,Weight must be a positive number.,YES'));
  });

  it('5. Executes valid import plan and preserves idempotency on re-execution', async () => {
    // Reconstruct valid plan to obtain exact fingerprint
    const planRes = await import('../services/importExecutionPlanningService').then((m) =>
      m.ImportExecutionPlanningService.buildImportExecutionPlan('shipments', mockParsedFile, userMappings, {
        tenantContext: { userId: 'usr_test_admin', tenantId: 'tenant_aja_default' },
      })
    );

    const plan = planRes.executionPlan;

    // First execution
    const firstResult = await ImportExecutionService.executeImportPlan({
      planId: plan.planId,
      planFingerprint: plan.planFingerprint,
      idempotencyKey: 'idemp_unique_test_key_01',
      typedPhrase: plan.updateCount > 0 ? 'OVERWRITE' : undefined,
      resource: 'shipments',
      parsedFile: mockParsedFile,
      userMappings,
      tenantContext: {
        userId: 'usr_test_admin',
        tenantId: 'tenant_aja_default',
      },
    });

    assert.ok(firstResult.operationId);
    assert.equal(firstResult.status, 'COMPLETED');
    assert.equal(firstResult.totalProcessed, 3);
    assert.equal(firstResult.insertedCount + firstResult.updatedCount + firstResult.skippedCount + firstResult.failedCount, 3);

    // Second execution with same idempotency key returns exact same result
    const secondResult = await ImportExecutionService.executeImportPlan({
      planId: plan.planId,
      planFingerprint: plan.planFingerprint,
      idempotencyKey: 'idemp_unique_test_key_01',
      typedPhrase: plan.updateCount > 0 ? 'OVERWRITE' : undefined,
      resource: 'shipments',
      parsedFile: mockParsedFile,
      userMappings,
      tenantContext: {
        userId: 'usr_test_admin',
        tenantId: 'tenant_aja_default',
      },
    });

    assert.deepEqual(secondResult, firstResult);
  });
});
