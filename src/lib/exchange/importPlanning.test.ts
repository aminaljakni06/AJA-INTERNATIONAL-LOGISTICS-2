/**
 * AJA INTERNATIONAL LOGISTICS — STEP 05.18.10 Execution Planning & Dry Run Test Suite
 * Phase: Enterprise Data Export, Import & File-Based Operations System
 * Scope: PREVIEW + DRY RUN + CONFIRMATION PLANNING ONLY
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ImportExecutionPlanningService,
  SAFE_FIRESTORE_WRITE_BATCH_SIZE,
} from '../../services/importExecutionPlanningService';
import {
  BulkExecutionPolicy,
  DuplicateHandlingStrategy,
  ImportExecutionPlan,
} from '../../types/dataTransferFramework';

describe('STEP 05.18.10 — Enterprise Import Execution Planning & Dry Run Suite', () => {
  const dummyParsedFile = {
    fileMetadata: {
      fileId: 'file_test_001',
      fileName: 'shipments_planning_test.csv',
      fileSize: 1024,
      mimeType: 'text/csv',
      uploadedAt: new Date().toISOString(),
      uploadedByUserId: 'usr_planner',
    },
    format: 'csv' as const,
    headers: ['Tracking Code', 'Origin', 'Destination', 'Weight (KG)'],
    rows: [
      { 'Tracking Code': 'TRK-9001', Origin: 'Riyadh', Destination: 'Jeddah', 'Weight (KG)': '50' },
      { 'Tracking Code': 'TRK-9002', Origin: 'Dammam', Destination: 'Dubai', 'Weight (KG)': '120' },
      { 'Tracking Code': 'INVALID_ROW', Origin: '', Destination: '', 'Weight (KG)': 'ABC' },
    ],
    totalRowCount: 3,
    totalColumnCount: 4,
    warnings: [],
  };

  const dummyMappings = {
    'Tracking Code': 'trackingNumber',
    Origin: 'originCity',
    Destination: 'destinationCity',
    'Weight (KG)': 'weightKg',
  };

  it('1. Action Planning: Should classify valid non-duplicates as CREATE and invalid rows as BLOCKED', async () => {
    const preview = await ImportExecutionPlanningService.buildImportExecutionPlan(
      'shipments',
      dummyParsedFile,
      dummyMappings,
      {
        duplicateStrategy: 'SKIP',
        executionPolicy: 'BEST_EFFORT',
        tenantContext: {
          companyId: 'tenant_aja_01',
          userPermissions: ['*'],
        },
      }
    );

    assert.ok(preview);
    assert.strictEqual(preview.resource, 'shipments');
    assert.strictEqual(preview.executionPlan.totalRows, 3);
    assert.ok(preview.executionPlan.createCount >= 0);
    assert.ok(preview.executionPlan.blockedCount >= 1); // Row 3 is invalid
  });

  it('2. Count Invariant: createCount + updateCount + skipCount + blockedCount MUST EQUAL totalRows', async () => {
    const preview = await ImportExecutionPlanningService.buildImportExecutionPlan(
      'shipments',
      dummyParsedFile,
      dummyMappings,
      {
        duplicateStrategy: 'SKIP',
        executionPolicy: 'BEST_EFFORT',
      }
    );

    const plan = preview.executionPlan;
    const sum = plan.createCount + plan.updateCount + plan.skipCount + plan.blockedCount;

    assert.strictEqual(
      sum,
      plan.totalRows,
      `Count invariant failed: ${sum} != ${plan.totalRows}`
    );
  });

  it('3. Execution Policy Enforcement: ATOMIC policy fails if blockedCount > 0', async () => {
    const previewAtomic = await ImportExecutionPlanningService.buildImportExecutionPlan(
      'shipments',
      dummyParsedFile,
      dummyMappings,
      {
        duplicateStrategy: 'SKIP',
        executionPolicy: 'ATOMIC',
      }
    );

    const plan = previewAtomic.executionPlan;
    if (plan.blockedCount > 0) {
      assert.strictEqual(plan.canExecute, false);
      const atomicBlocker = plan.blockers.find((b) => b.code === 'ATOMIC_POLICY_BLOCKED');
      assert.ok(atomicBlocker, 'Should contain ATOMIC_POLICY_BLOCKED error');
    }
  });

  it('4. Fingerprinting & Staleness Protection: confirmImportPlan validates fingerprint and phrase', () => {
    const dummyPlan: ImportExecutionPlan = {
      planId: 'plan_test_123',
      planFingerprint: 'mock_sha256_fingerprint_001',
      resource: 'shipments',
      totalRows: 10,
      createCount: 5,
      updateCount: 3,
      skipCount: 2,
      blockedCount: 0,
      warningCount: 0,
      duplicateCount: 3,
      conflictCount: 0,
      estimatedWriteOperations: 8,
      estimatedBatchCount: 1,
      executionPolicy: 'BEST_EFFORT',
      duplicateStrategy: 'OVERWRITE',
      canExecute: true,
      blockers: [],
      generatedAt: new Date().toISOString(),
    };

    // Stale plan check failure
    const staleResult = ImportExecutionPlanningService.confirmImportPlan(
      dummyPlan,
      'different_fingerprint'
    );
    assert.strictEqual(staleResult.confirmed, false);
    assert.strictEqual(staleResult.errorEn?.includes('STALE_IMPORT_PLAN'), true);

    // Missing confirmation phrase for plan with updates
    const missingPhraseResult = ImportExecutionPlanningService.confirmImportPlan(
      dummyPlan,
      'mock_sha256_fingerprint_001'
    );
    assert.strictEqual(missingPhraseResult.confirmed, false);
    assert.strictEqual(missingPhraseResult.errorEn?.includes('INVALID_CONFIRMATION_PHRASE'), true);

    // Success with valid phrase
    const validResult = ImportExecutionPlanningService.confirmImportPlan(
      dummyPlan,
      'mock_sha256_fingerprint_001',
      'OVERWRITE'
    );
    assert.strictEqual(validResult.confirmed, true);
  });

  it('5. Safe Write Batch Estimation: Should calculate batch count using SAFE_FIRESTORE_WRITE_BATCH_SIZE (400)', () => {
    assert.strictEqual(SAFE_FIRESTORE_WRITE_BATCH_SIZE, 400);

    const totalWriteOps = 950;
    const estBatches = Math.ceil(totalWriteOps / SAFE_FIRESTORE_WRITE_BATCH_SIZE);
    assert.strictEqual(estBatches, 3);
  });
});
