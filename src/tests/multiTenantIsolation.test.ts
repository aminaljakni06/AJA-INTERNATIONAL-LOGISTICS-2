/**
 * AJA INTERNATIONAL LOGISTICS — STEP 24 Multi-Tenant Runtime Attack Matrix Test Suite
 * Validates strict isolation between Tenant A and Tenant B across all resources.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { reportRepository } from '../db/repositories/reportRepository';
import { scheduledReportRunnerService } from '../services/reports/scheduledReportRunnerService';
import { resolveExportPolicy } from '../lib/exchange/exportPolicyResolver';
import { ServerAnalyticsContext } from '../lib/analytics/analyticsExecutionTypes';

test('STEP 24 — Multi-Tenant Runtime Isolation Matrix', async (t) => {
  const tenantA = 'tenant_enterprise_alpha';
  const tenantB = 'tenant_enterprise_beta';

  await t.test('1. Report Definitions are isolated by tenant scope', async () => {
    // Create report definition in Tenant A
    const rptA = await reportRepository.createReportDefinition(
      {
        nameEn: 'Alpha Revenue Report',
        nameAr: 'تقرير إيرادات ألفا',
        resource: 'finance_invoices',
        domain: 'FINANCE',
        metricIds: ['finance_total_invoiced_revenue'],
      },
      'user_alpha_admin',
      tenantA,
      'comp_alpha'
    );

    // Create report definition in Tenant B
    const rptB = await reportRepository.createReportDefinition(
      {
        nameEn: 'Beta Shipment SLA Report',
        nameAr: 'تقرير شحنات بيتا',
        resource: 'shipments',
        domain: 'OPERATIONS',
        metricIds: ['ops_shipments_total_count'],
      },
      'user_beta_admin',
      tenantB,
      'comp_beta'
    );

    // Query reports for Tenant A
    const reportsForA = await reportRepository.getReportDefinitions(tenantA);
    const hasA = reportsForA.some((r) => r.id === rptA.id);
    const leaksB = reportsForA.some((r) => r.id === rptB.id && r.tenantId === tenantB);

    assert.equal(hasA, true, 'Tenant A must access its own report definition');
    assert.equal(leaksB, false, 'Tenant A must NEVER see Tenant B report definitions');

    // Query reports for Tenant B
    const reportsForB = await reportRepository.getReportDefinitions(tenantB);
    const hasB = reportsForB.some((r) => r.id === rptB.id);
    const leaksA = reportsForB.some((r) => r.id === rptA.id && r.tenantId === tenantA);

    assert.equal(hasB, true, 'Tenant B must access its own report definition');
    assert.equal(leaksA, false, 'Tenant B must NEVER see Tenant A report definitions');
  });

  await t.test('2. Scheduled Report Runner executes only within authorized tenant scope', async () => {
    const schA = await reportRepository.createScheduledReport(
      {
        reportDefinitionId: 'rpt_tpl_exec_logistics_summary',
        nameEn: 'Alpha Daily Delivery Digest',
        nameAr: 'ملخص التسليم اليومي ألفا',
        timeOfDay: '08:00',
        frequency: 'DAILY',
        deliveryFormat: 'PDF',
        deliveryTarget: 'IN_APP',
        recipients: ['user_alpha_01'],
      },
      'user_alpha_admin',
      tenantA,
      'comp_alpha'
    );

    const schB = await reportRepository.createScheduledReport(
      {
        reportDefinitionId: 'rpt_tpl_finance_executive',
        nameEn: 'Beta Daily Cash Summary',
        nameAr: 'ملخص النقد اليومي بيتا',
        timeOfDay: '08:00',
        frequency: 'DAILY',
        deliveryFormat: 'PDF',
        deliveryTarget: 'IN_APP',
        recipients: ['user_beta_01'],
      },
      'user_beta_admin',
      tenantB,
      'comp_beta'
    );

    // Run due schedules for Tenant A only
    const resultsA = await scheduledReportRunnerService.runAllDueSchedules(tenantA);
    const executedForA = resultsA.some((r) => r.scheduleId === schA.id);
    const contaminatedWithB = resultsA.some((r) => r.scheduleId === schB.id);

    assert.equal(executedForA, true, 'Tenant A scheduled run must execute');
    assert.equal(contaminatedWithB, false, 'Tenant A scheduled run must NOT execute Tenant B schedules');
  });

  await t.test('3. Export Policy Resolver strictly enforces tenant bounds', async () => {
    const authContextA = {
      userId: 'user_alpha_admin',
      tenantId: 'tenant_alpha',
      companyId: 'comp_alpha',
      branchId: 'branch_alpha_riyadh',
      userPermissions: ['shipments.export', 'shipments:view', '*'],
    };

    const resolvedA = await resolveExportPolicy(
      'shipments',
      {
        resource: 'shipments',
        format: 'csv',
        fields: ['trackingNumber', 'status', 'customerName'],
        selection: { mode: 'PAGE', page: 1, ids: [] },
      },
      authContextA
    );

    assert.equal(resolvedA.success, true);
    assert.equal(resolvedA.policy?.tenantScope.companyId, 'comp_alpha', 'Export policy must lock companyId to Tenant A');
    assert.equal(resolvedA.policy?.tenantScope.branchId, 'branch_alpha_riyadh', 'Export policy must lock branchId to Tenant A');
  });
});
