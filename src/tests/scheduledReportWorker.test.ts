/**
 * AJA INTERNATIONAL LOGISTICS — STEP 24 Scheduled Report Runner & Background Worker Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { reportRepository } from '../db/repositories/reportRepository';
import { scheduledReportRunnerService } from '../services/reports/scheduledReportRunnerService';
import { ScheduledReportDefinition } from '../types/reportFramework';

test('STEP 24 — Scheduled Report Runner & Background Worker', async (t) => {
  await t.test('1. Due evaluation correctly handles frequency, day of week and last run', () => {
    const dailySchedule: ScheduledReportDefinition = {
      id: 'sch_test_daily',
      reportDefinitionId: 'rpt_tpl_exec_logistics_summary',
      nameEn: 'Daily Logistics Brief',
      nameAr: 'ملخص يومي',
      timeOfDay: '08:00',
      timezone: 'Asia/Riyadh',
      parameterValues: {},
      frequency: 'DAILY',
      deliveryFormat: 'PDF',
      deliveryTarget: 'IN_APP',
      recipients: ['user_01'],
      active: true,
      createdBy: 'user_01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assert.equal(scheduledReportRunnerService.isScheduleDue(dailySchedule, new Date()), true, 'Daily schedule with no last run is due');

    // If already ran 1 hour ago, should not be due
    dailySchedule.lastRunAt = new Date(Date.now() - 3600 * 1000).toISOString();
    assert.equal(scheduledReportRunnerService.isScheduleDue(dailySchedule, new Date()), false, 'Daily schedule that ran recently is not due');

    // If ran 22 hours ago, is due
    dailySchedule.lastRunAt = new Date(Date.now() - 22 * 3600 * 1000).toISOString();
    assert.equal(scheduledReportRunnerService.isScheduleDue(dailySchedule, new Date()), true, 'Daily schedule that ran 22 hours ago is due');

    // Inactive schedule is never due
    dailySchedule.active = false;
    assert.equal(scheduledReportRunnerService.isScheduleDue(dailySchedule, new Date()), false, 'Inactive schedule is never due');
  });

  await t.test('2. Execute scheduled report runs successfully and records execution history', async () => {
    const schedule = await reportRepository.createScheduledReport(
      {
        reportDefinitionId: 'rpt_tpl_exec_logistics_summary',
        nameEn: 'Executive Shipment Summary',
        nameAr: 'ملخص شحنات تنفيذي',
        timeOfDay: '08:00',
        frequency: 'DAILY',
        deliveryFormat: 'PDF',
        deliveryTarget: 'IN_APP',
        recipients: ['user_exec_01'],
      },
      'admin_user_01',
      'tenant_aja_default',
      'comp_01'
    );

    const runResult = await scheduledReportRunnerService.executeScheduledReport(schedule, true);

    assert.equal(runResult.status, 'SUCCESS', 'Execution must succeed');
    assert.ok(runResult.executionId && runResult.executionId.length > 0, 'Execution ID must be generated');
    assert.equal(runResult.recipientsCount, 1);

    const history = scheduledReportRunnerService.getHistory(schedule.id);
    assert.equal(history.length >= 1, true, 'Execution history must be recorded');
  });

  await t.test('3. Skips execution cleanly when schedule is disabled', async () => {
    const schedule = await reportRepository.createScheduledReport(
      {
        reportDefinitionId: 'rpt_tpl_finance_executive',
        nameEn: 'Inactive Financial Report',
        nameAr: 'تقرير مالي غير نشط',
        timeOfDay: '08:00',
        frequency: 'DAILY',
        active: false,
        deliveryFormat: 'PDF',
        deliveryTarget: 'IN_APP',
        recipients: ['user_exec_01'],
      },
      'admin_user_01',
      'tenant_aja_default'
    );

    const runResult = await scheduledReportRunnerService.executeScheduledReport(schedule, false);
    assert.equal(runResult.status, 'SKIPPED_INACTIVE', 'Disabled schedule must be cleanly skipped');
  });
});
