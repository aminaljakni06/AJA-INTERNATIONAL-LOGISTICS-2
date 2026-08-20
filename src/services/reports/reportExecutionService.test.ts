/**
 * AJA INTERNATIONAL LOGISTICS — Report Execution Engine & API Unit & Integration Tests
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 */

import assert from 'node:assert';
import { test } from 'node:test';
import { reportExecutionService } from './reportExecutionService';
import { reportRepository } from '../../db/repositories/reportRepository';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';

const mockAuthorizedContext: ServerAnalyticsContext = {
  userId: 'user_rpt_tester_01',
  tenantId: 'tenant_aja_default',
  companyId: 'comp_01',
  branchId: 'branch_riyadh',
  permissions: ['analytics:view', 'reports:view', 'control_tower:view', 'customer:view', 'crm:customer:view', 'finance:view'],
  timezone: 'Asia/Riyadh',
};

const mockRestrictedContext: ServerAnalyticsContext = {
  userId: 'user_restricted',
  tenantId: 'tenant_aja_default',
  permissions: ['unrelated_perm'],
  timezone: 'Asia/Riyadh',
};

test('1. Execute System Template: Executive Logistics Summary', async () => {
  const result = await reportExecutionService.executeReport({
    reportDefinitionId: 'rpt_tpl_exec_logistics_summary',
    context: mockAuthorizedContext,
  });

  assert.ok(result);
  assert.strictEqual(result.reportDefinitionId, 'rpt_tpl_exec_logistics_summary');
  assert.ok(result.completeness === 'COMPLETE' || result.completeness === 'EMPTY');
  assert.ok(result.metrics.shp_total_shipments);
  assert.ok(result.metrics.shp_total_shipments.value !== undefined);
  assert.ok(result.executionTimeMs >= 0);
});

test('2. Execute System Template: Finance & AR Executive Statement', async () => {
  const result = await reportExecutionService.executeReport({
    reportDefinitionId: 'rpt_tpl_finance_executive',
    parameterValues: { currency: 'SAR' },
    context: mockAuthorizedContext,
  });

  assert.ok(result);
  assert.strictEqual(result.reportingCurrency, 'SAR');
  assert.ok(result.metrics.fin_invoiced_revenue);
  assert.strictEqual(typeof result.metrics.fin_invoiced_revenue.value, 'number');
});

test('3. Execute System Template: Control Tower Exceptions Report', async () => {
  const result = await reportExecutionService.executeReport({
    reportDefinitionId: 'rpt_tpl_control_tower_exceptions',
    context: mockAuthorizedContext,
  });

  assert.ok(result);
  assert.ok(result.metrics.ct_active_shipments);
  assert.ok(result.metrics.ct_open_exceptions);
  assert.ok(result.groupedResults.severity);
});

test('4. Custom Report Definition Lifecycle & Parameterized Execution', async () => {
  const createdDef = await reportRepository.createReportDefinition(
    {
      nameEn: 'Custom Test Report',
      nameAr: 'تقرير تجريبي مخصص',
      resource: 'shipments',
      domain: 'OPERATIONS',
      metricIds: ['shp_total_shipments', 'shp_delivered_shipments'],
      dimensions: ['status'],
      outputFormats: ['PDF', 'CSV'],
    },
    mockAuthorizedContext.userId,
    mockAuthorizedContext.tenantId
  );

  assert.ok(createdDef.id);

  const result = await reportExecutionService.executeReport({
    reportDefinitionId: createdDef.id,
    context: mockAuthorizedContext,
  });

  assert.ok(result);
  assert.strictEqual(result.reportTitleEn, 'Custom Test Report');
  assert.ok(result.metrics.shp_total_shipments);
  assert.ok(result.groupedResults !== undefined);
});

test('5. Permission Denial on Unauthorized Report Execution', async () => {
  await assert.rejects(
    async () => {
      await reportExecutionService.executeReport({
        reportDefinitionId: 'rpt_tpl_exec_logistics_summary',
        context: mockRestrictedContext,
      });
    },
    (err: any) => {
      assert.strictEqual(err.code, 'ANALYTICS_PERMISSION_REQUIRED');
      return true;
    }
  );
});

test('6. Scheduled Report Definition Persistence', async () => {
  const schedule = await reportRepository.createScheduledReport(
    {
      reportDefinitionId: 'rpt_tpl_exec_logistics_summary',
      nameEn: 'Daily Morning Executive Dispatch',
      nameAr: 'التقرير التنفيذي الصباحي اليومي',
      frequency: 'DAILY',
      timeOfDay: '07:30',
      recipients: ['exec@ajalogistics.com'],
    },
    mockAuthorizedContext.userId,
    mockAuthorizedContext.tenantId
  );

  assert.ok(schedule.id);
  assert.strictEqual(schedule.frequency, 'DAILY');
  assert.strictEqual(schedule.lastStatus, 'DEFERRED');

  const list = await reportRepository.getScheduledReports(mockAuthorizedContext.tenantId);
  assert.ok(list.some((s) => s.id === schedule.id));
});
