/**
 * AJA INTERNATIONAL LOGISTICS — Report Definition & Schedule Persistence Repository
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 */

import {
  ReportDefinition,
  CreateReportDefinitionPayload,
  ScheduledReportDefinition,
  CreateScheduledReportPayload,
} from '../../types/reportFramework';
import { SYSTEM_REPORT_TEMPLATES } from '../../lib/reports/systemReportTemplates';

const reportDefinitionsStore: Map<string, ReportDefinition> = new Map();
const scheduledReportsStore: Map<string, ScheduledReportDefinition> = new Map();

// Initialize with system templates
function seedSystemTemplates() {
  if (reportDefinitionsStore.size === 0) {
    for (const tpl of SYSTEM_REPORT_TEMPLATES) {
      reportDefinitionsStore.set(tpl.id, { ...tpl });
    }
  }
}

seedSystemTemplates();

export class ReportRepository {
  /**
   * List report definitions visible to tenant / user.
   */
  public async getReportDefinitions(tenantId?: string): Promise<ReportDefinition[]> {
    seedSystemTemplates();
    const reports = Array.from(reportDefinitionsStore.values());
    if (!tenantId) {
      return reports.filter((r) => r.status === 'ACTIVE');
    }
    return reports.filter(
      (r) =>
        r.status === 'ACTIVE' &&
        (r.visibility === 'SYSTEM' || !r.tenantId || r.tenantId === tenantId)
    );
  }

  /**
   * Get report definition by ID.
   */
  public async getReportDefinitionById(id: string): Promise<ReportDefinition | null> {
    seedSystemTemplates();
    return reportDefinitionsStore.get(id) || null;
  }

  /**
   * Create a custom report definition.
   */
  public async createReportDefinition(
    payload: CreateReportDefinitionPayload,
    createdBy: string,
    tenantId?: string,
    companyId?: string,
    branchId?: string
  ): Promise<ReportDefinition> {
    seedSystemTemplates();
    const id = `rpt_def_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const report: ReportDefinition = {
      id,
      nameEn: payload.nameEn,
      nameAr: payload.nameAr,
      descriptionEn: payload.descriptionEn,
      descriptionAr: payload.descriptionAr,
      resource: payload.resource,
      domain: payload.domain,
      metricIds: payload.metricIds,
      dimensions: payload.dimensions || [],
      timeSeries: payload.timeSeries,
      parameters: payload.parameters || [],
      sections: payload.sections || [
        {
          id: `sec_kpi_${Date.now()}`,
          type: 'KPI_SUMMARY',
          titleEn: 'Report Key Performance Indicators',
          titleAr: 'مؤشرات التقرير الرئيسية',
          metricIds: payload.metricIds,
        },
      ],
      outputFormats: payload.outputFormats || ['PDF', 'CSV', 'XLSX'],
      requiredPermissions: payload.requiredPermissions || ['analytics:view'],
      visibility: payload.visibility || 'SHARED',
      status: 'ACTIVE',
      savedViewId: payload.savedViewId,
      createdBy,
      tenantId,
      companyId,
      branchId,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    reportDefinitionsStore.set(id, report);
    return report;
  }

  /**
   * List scheduled reports for tenant.
   */
  public async getScheduledReports(tenantId?: string): Promise<ScheduledReportDefinition[]> {
    const schedules = Array.from(scheduledReportsStore.values());
    if (!tenantId) return schedules;
    return schedules.filter((s) => !s.tenantId || s.tenantId === tenantId);
  }

  /**
   * Get scheduled report by ID.
   */
  public async getScheduledReportById(id: string): Promise<ScheduledReportDefinition | null> {
    return scheduledReportsStore.get(id) || null;
  }

  /**
   * Create scheduled report definition.
   */
  public async createScheduledReport(
    payload: CreateScheduledReportPayload,
    createdBy: string,
    tenantId?: string,
    companyId?: string
  ): Promise<ScheduledReportDefinition> {
    const id = `sch_rpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const schedule: ScheduledReportDefinition = {
      id,
      reportDefinitionId: payload.reportDefinitionId,
      nameEn: payload.nameEn,
      nameAr: payload.nameAr,
      frequency: payload.frequency,
      dayOfWeek: payload.dayOfWeek,
      dayOfMonth: payload.dayOfMonth,
      timeOfDay: payload.timeOfDay || '08:00',
      timezone: payload.timezone || 'Asia/Riyadh',
      parameterValues: payload.parameterValues || {},
      deliveryFormat: payload.deliveryFormat || 'PDF',
      deliveryTarget: payload.deliveryTarget || 'IN_APP',
      recipients: payload.recipients || [],
      active: payload.active !== undefined ? payload.active : true,
      lastStatus: 'DEFERRED',
      createdBy,
      tenantId,
      companyId,
      createdAt: now,
      updatedAt: now,
    };

    scheduledReportsStore.set(id, schedule);
    return schedule;
  }

  /**
   * Update scheduled report status or active state.
   */
  public async updateScheduledReportActive(id: string, active: boolean): Promise<boolean> {
    const schedule = scheduledReportsStore.get(id);
    if (!schedule) return false;
    schedule.active = active;
    schedule.updatedAt = new Date().toISOString();
    return true;
  }
}

export const reportRepository = new ReportRepository();
