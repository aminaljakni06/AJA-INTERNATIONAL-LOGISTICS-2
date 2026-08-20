/**
 * AJA INTERNATIONAL LOGISTICS — Parameterized Report Execution Engine
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 * Version: 1.0
 */

import {
  ReportDefinition,
  ReportExecutionResult,
  ReportMetricValueResult,
  ReportGroupedResult,
  ReportTimeSeriesResult,
} from '../../types/reportFramework';
import { ServerAnalyticsContext } from '../../lib/analytics/analyticsExecutionTypes';
import { AnalyticsAggregationEngine } from '../analytics/analyticsAggregationEngine';
import { analyticsMetricRegistry } from '../../lib/analytics/analyticsMetricRegistry';
import { reportRepository } from '../../db/repositories/reportRepository';
import { AnalyticsMetricId, AnalyticsError } from '../../types/analyticsFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { AuditService } from '../auditService';

export interface ReportExecutionOptions {
  reportDefinitionId?: string;
  reportDefinition?: ReportDefinition;
  parameterValues?: Record<string, any>;
  context: ServerAnalyticsContext;
}

export class ReportExecutionService {
  private readonly aggregationEngine: AnalyticsAggregationEngine;

  constructor() {
    this.aggregationEngine = new AnalyticsAggregationEngine();
  }

  /**
   * Executes a parameterized report definition and returns a normalized ReportExecutionResult.
   */
  public async executeReport(options: ReportExecutionOptions): Promise<ReportExecutionResult> {
    const startTime = Date.now();

    // 1. Resolve Report Definition
    let definition: ReportDefinition | null = options.reportDefinition || null;
    if (!definition && options.reportDefinitionId) {
      definition = await reportRepository.getReportDefinitionById(options.reportDefinitionId);
    }

    if (!definition) {
      throw new AnalyticsError('ANALYTICS_INVALID_METRIC', 'Report definition not found or deleted.');
    }

    if (definition.status !== 'ACTIVE') {
      throw new AnalyticsError('ANALYTICS_PERMISSION_REQUIRED', 'Report definition is inactive or archived.');
    }

    // 2. Authorize Caller for Report Level Permissions
    if (definition.requiredPermissions && definition.requiredPermissions.length > 0) {
      const userPermissions = options.context.permissions || [];
      const hasPermission = definition.requiredPermissions.some((perm) => userPermissions.includes(perm));
      if (!hasPermission) {
        throw new AnalyticsError(
          'ANALYTICS_PERMISSION_REQUIRED',
          `Caller lacks required permission [${definition.requiredPermissions.join(', ')}] to run this report.`
        );
      }
    }

    // 3. Resolve Parameters & Merged Filters
    const paramValues = options.parameterValues || {};
    const mergedFilters: Record<string, any> = {};

    if (definition.defaultQueryState?.filters) {
      Object.assign(mergedFilters, definition.defaultQueryState.filters);
    }

    // Process parameters
    for (const paramDef of definition.parameters) {
      const value = paramValues[paramDef.id] ?? paramDef.defaultValue;
      if (paramDef.required && (value === undefined || value === null || value === '')) {
        throw new AnalyticsError('ANALYTICS_INVALID_METRIC', `Required report parameter '${paramDef.nameEn}' is missing.`);
      }
      if (value !== undefined && value !== null && value !== '') {
        if (paramDef.type === 'DATE_RANGE' && typeof value === 'object') {
          mergedFilters.dateRange = value;
        } else {
          mergedFilters[paramDef.targetFilterKey] = value;
        }
      }
    }

    const queryState: EnterpriseQueryState = {
      search: '',
      filters: mergedFilters,
      sort: null,
      pagination: { page: 1, pageSize: 100 },
    };

    // 4. Execute Metrics via Analytics Engine
    const metricResults: Record<AnalyticsMetricId, ReportMetricValueResult> = {};
    const warnings: string[] = [];

    for (const metricId of definition.metricIds) {
      const descriptor = analyticsMetricRegistry.getMetric(metricId);
      if (!descriptor) {
        warnings.push(`Metric descriptor '${metricId}' not registered.`);
        continue;
      }

      try {
        const metricVal = await this.aggregationEngine.executeMetric(metricId, queryState, options.context);
        metricResults[metricId] = {
          metricId,
          labelEn: descriptor.labelEn,
          labelAr: descriptor.labelAr,
          value: metricVal.value,
          formattedValue: metricVal.formattedValue,
          valueType: descriptor.valueType,
          unit: descriptor.format?.unit,
          unitAr: descriptor.format?.unitAr,
          precision: descriptor.format?.precision,
        };
      } catch (err: any) {
        warnings.push(`Metric execution error for '${metricId}': ${err.message}`);
        metricResults[metricId] = {
          metricId,
          labelEn: descriptor.labelEn,
          labelAr: descriptor.labelAr,
          value: null,
          formattedValue: 'N/A',
          valueType: descriptor.valueType,
        };
      }
    }

    // 5. Execute Grouped Sections
    const groupedResults: Record<string, ReportGroupedResult> = {};
    if (definition.dimensions && definition.dimensions.length > 0) {
      const primaryMetricId = definition.metricIds[0];
      if (primaryMetricId) {
        for (const dim of definition.dimensions) {
          try {
            const grouped = await this.aggregationEngine.executeGroupedMetric(
              primaryMetricId,
              dim,
              queryState,
              options.context
            );
            groupedResults[dim] = {
              dimension: dim,
              groups: grouped.groups.map((g) => ({
                key: g.key,
                labelEn: g.labelEn,
                labelAr: g.labelAr,
                value: g.value,
                count: g.count,
              })),
            };
          } catch (err: any) {
            warnings.push(`Grouped query failed for dimension '${dim}': ${err.message}`);
          }
        }
      }
    }

    // 6. Execute Time-Series Section
    const timeSeriesResults: Record<AnalyticsMetricId, ReportTimeSeriesResult> = {};
    if (definition.timeSeries?.enabled) {
      const primaryMetricId = definition.metricIds[0];
      if (primaryMetricId) {
        try {
          const bucket = (definition.timeSeries.timeBucket as 'DAY' | 'WEEK' | 'MONTH') || 'DAY';
          const tsPoints = await this.aggregationEngine.executeTimeSeries(
            primaryMetricId,
            bucket,
            queryState,
            options.context
          );
          timeSeriesResults[primaryMetricId] = {
            metricId: primaryMetricId,
            timeBucket: definition.timeSeries.timeBucket,
            timeField: definition.timeSeries.timeField || 'createdAt',
            points: tsPoints.map((p) => ({
              timestamp: p.timestamp,
              label: p.label,
              value: p.value,
            })),
          };
        } catch (err: any) {
          warnings.push(`Time series query failed: ${err.message}`);
        }
      }
    }

    // Determine completeness
    const totalMetrics = definition.metricIds.length;
    const resolvedMetrics = Object.values(metricResults).filter((m) => m.value !== null).length;
    let completeness: 'COMPLETE' | 'PARTIAL' | 'EMPTY' = 'COMPLETE';
    if (resolvedMetrics === 0) {
      completeness = 'EMPTY';
    } else if (resolvedMetrics < totalMetrics) {
      completeness = 'PARTIAL';
    }

    const executionId = `exec_rpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const executionTimeMs = Date.now() - startTime;

    const result: ReportExecutionResult = {
      executionId,
      reportDefinitionId: definition.id,
      reportTitleEn: definition.nameEn,
      reportTitleAr: definition.nameAr,
      generatedAt: new Date().toISOString(),
      queryScope: {
        tenantId: options.context.tenantId,
        companyId: options.context.companyId,
        branchId: options.context.branchId,
        dateRange: mergedFilters.dateRange,
        filters: mergedFilters,
        timezone: options.context.timezone || 'Asia/Riyadh',
      },
      metrics: metricResults,
      groupedResults,
      timeSeriesResults,
      completeness,
      reportingCurrency: mergedFilters.currency || 'SAR',
      warnings,
      executionTimeMs,
    };

    // Audit Log
    try {
      AuditService.logActivity({
        category: 'MODULE',
        module: 'REPORTS',
        userId: options.context.userId || 'system',
        title: `Executed report definition ${definition.nameEn}`,
        details: `Execution ID: ${executionId}`,
        metadata: {
          executionId,
          completeness,
          executionTimeMs,
        },
      });
    } catch {
      // Non-blocking audit log
    }

    return result;
  }
}

export const reportExecutionService = new ReportExecutionService();
