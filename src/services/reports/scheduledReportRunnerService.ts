/**
 * AJA INTERNATIONAL LOGISTICS — Scheduled Report Runner & Background Worker Engine
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Scheduled Report Execution & Automated Delivery Runner (STEP 24 Remediation)
 */

import { reportRepository } from '../../db/repositories/reportRepository';
import { reportExecutionService } from './reportExecutionService';
import { ScheduledReportDefinition, ReportExecutionResult } from '../../types/reportFramework';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';
import * as notificationRepository from '../../db/repositories/notificationRepository';
import { AuditService } from '../auditService';

export interface ScheduledRunResult {
  scheduleId: string;
  scheduleName: string;
  tenantId?: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED_INACTIVE' | 'SKIPPED_NOT_DUE' | 'SKIPPED_LOCKED';
  executedAt: string;
  executionId?: string;
  recipientsCount: number;
  deliveryTarget: string;
  error?: string;
}

export class ScheduledReportRunnerService {
  private activeLocks: Set<string> = new Set();
  private executionHistory: Map<string, ScheduledRunResult[]> = new Map();

  /**
   * Evaluates whether a scheduled report is due for execution at the given reference time.
   */
  public isScheduleDue(schedule: ScheduledReportDefinition, referenceTime: Date = new Date()): boolean {
    if (!schedule.active) return false;

    // Check last run timestamp to prevent duplicate execution within the same cycle
    if (schedule.lastRunAt) {
      const lastRun = new Date(schedule.lastRunAt);
      const diffMs = referenceTime.getTime() - lastRun.getTime();
      
      if (schedule.frequency === 'DAILY' && diffMs < 20 * 3600 * 1000) {
        return false;
      }
      if (schedule.frequency === 'WEEKLY' && diffMs < 6 * 24 * 3600 * 1000) {
        return false;
      }
      if (schedule.frequency === 'MONTHLY' && diffMs < 25 * 24 * 3600 * 1000) {
        return false;
      }
    }

    if (schedule.frequency === 'DAILY') {
      return true;
    }

    if (schedule.frequency === 'WEEKLY') {
      const currentDay = referenceTime.getDay(); // 0 is Sunday, 1 is Monday, etc.
      return schedule.dayOfWeek === undefined || schedule.dayOfWeek === currentDay;
    }

    if (schedule.frequency === 'MONTHLY') {
      const currentDate = referenceTime.getDate();
      return schedule.dayOfMonth === undefined || schedule.dayOfMonth === currentDate;
    }

    return true;
  }

  /**
   * Executes a single scheduled report with strict tenant isolation and error handling.
   */
  public async executeScheduledReport(
    schedule: ScheduledReportDefinition,
    forced: boolean = false,
    referenceTime: Date = new Date()
  ): Promise<ScheduledRunResult> {
    const lockKey = `lock_${schedule.id}`;
    const executedAt = referenceTime.toISOString();

    if (!schedule.active && !forced) {
      return {
        scheduleId: schedule.id,
        scheduleName: schedule.nameEn,
        tenantId: schedule.tenantId,
        status: 'SKIPPED_INACTIVE',
        executedAt,
        recipientsCount: schedule.recipients?.length || 0,
        deliveryTarget: schedule.deliveryTarget,
      };
    }

    if (!forced && !this.isScheduleDue(schedule, referenceTime)) {
      return {
        scheduleId: schedule.id,
        scheduleName: schedule.nameEn,
        tenantId: schedule.tenantId,
        status: 'SKIPPED_NOT_DUE',
        executedAt,
        recipientsCount: schedule.recipients?.length || 0,
        deliveryTarget: schedule.deliveryTarget,
      };
    }

    if (this.activeLocks.has(lockKey)) {
      return {
        scheduleId: schedule.id,
        scheduleName: schedule.nameEn,
        tenantId: schedule.tenantId,
        status: 'SKIPPED_LOCKED',
        executedAt,
        recipientsCount: schedule.recipients?.length || 0,
        deliveryTarget: schedule.deliveryTarget,
        error: 'Execution skipped: Job already running concurrently.',
      };
    }

    this.activeLocks.add(lockKey);

    try {
      // Build tenant-isolated analytics context
      const context: ServerAnalyticsContext = {
        userId: schedule.createdBy || 'system_worker',
        tenantId: schedule.tenantId || 'tenant_aja_default',
        companyId: schedule.companyId || 'comp_01',
        permissions: ['analytics:view', 'reports:view', 'control_tower:view', 'finance:view'],
        timezone: schedule.timezone || 'Asia/Riyadh',
      };

      // Execute report
      const result: ReportExecutionResult = await reportExecutionService.executeReport({
        reportDefinitionId: schedule.reportDefinitionId,
        parameterValues: schedule.parameterValues,
        context,
      });

      // Dispatch deliveries
      await this.dispatchDelivery(schedule, result);

      // Update schedule state
      schedule.lastRunAt = executedAt;
      schedule.lastStatus = 'SUCCESS';

      const runResult: ScheduledRunResult = {
        scheduleId: schedule.id,
        scheduleName: schedule.nameEn,
        tenantId: schedule.tenantId,
        status: 'SUCCESS',
        executedAt,
        executionId: result.executionId,
        recipientsCount: schedule.recipients?.length || 0,
        deliveryTarget: schedule.deliveryTarget,
      };

      this.recordHistory(schedule.id, runResult);

      AuditService.logActivity({
        category: 'MODULE',
        module: 'REPORTS',
        userId: schedule.createdBy || 'system_worker',
        title: `Scheduled Report Executed: ${schedule.nameEn}`,
        details: `Execution ID: ${result.executionId}, Target: ${schedule.deliveryTarget}`,
        metadata: { scheduleId: schedule.id, executionId: result.executionId },
      });

      return runResult;
    } catch (err: any) {
      schedule.lastRunAt = executedAt;
      schedule.lastStatus = 'FAILED';

      const failureResult: ScheduledRunResult = {
        scheduleId: schedule.id,
        scheduleName: schedule.nameEn,
        tenantId: schedule.tenantId,
        status: 'FAILED',
        executedAt,
        recipientsCount: schedule.recipients?.length || 0,
        deliveryTarget: schedule.deliveryTarget,
        error: err.message || 'Unknown scheduled report execution error',
      };

      this.recordHistory(schedule.id, failureResult);
      return failureResult;
    } finally {
      this.activeLocks.delete(lockKey);
    }
  }

  /**
   * Runs all due scheduled reports for a specific tenant or globally.
   */
  public async runAllDueSchedules(tenantId?: string): Promise<ScheduledRunResult[]> {
    const schedules = await reportRepository.getScheduledReports(tenantId);
    const results: ScheduledRunResult[] = [];

    for (const schedule of schedules) {
      if (schedule.active) {
        const res = await this.executeScheduledReport(schedule, false);
        results.push(res);
      }
    }

    return results;
  }

  /**
   * Delivers the generated report to designated recipients via specified target.
   */
  private async dispatchDelivery(
    schedule: ScheduledReportDefinition,
    result: ReportExecutionResult
  ): Promise<void> {
    const recipients = schedule.recipients || [];
    if (recipients.length === 0) return;

    if (schedule.deliveryTarget === 'IN_APP' || schedule.deliveryTarget === 'EMAIL') {
      for (const recipient of recipients) {
        try {
          await notificationRepository.createNotification({
            recipientUserId: recipient,
            tenantId: schedule.tenantId,
            type: 'SYSTEM',
            title: `تقرير مجدول: ${schedule.nameAr || schedule.nameEn}`,
            body: `تم توليد التقرير المجدول (${schedule.nameEn}) بنجاح بصيغة ${schedule.deliveryFormat}. معرف التنفيذ: ${result.executionId}`,
            actionUrl: `/reports/view/${result.executionId}`,
          } as any);
        } catch {
          // Non-blocking notification
        }
      }
    }
  }

  private recordHistory(scheduleId: string, result: ScheduledRunResult) {
    const history = this.executionHistory.get(scheduleId) || [];
    history.unshift(result);
    if (history.length > 20) history.pop();
    this.executionHistory.set(scheduleId, history);
  }

  public getHistory(scheduleId: string): ScheduledRunResult[] {
    return this.executionHistory.get(scheduleId) || [];
  }
}

export const scheduledReportRunnerService = new ScheduledReportRunnerService();
