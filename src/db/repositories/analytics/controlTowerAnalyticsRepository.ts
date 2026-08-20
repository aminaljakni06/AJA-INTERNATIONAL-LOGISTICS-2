/**
 * AJA INTERNATIONAL LOGISTICS — Control Tower Domain Analytics Repository
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Control Tower Operational Analytics, Telemetry & Exception Intelligence (STEP 05.19.09)
 * Version: 1.0
 */

import { TranslatedQueryFilters } from '../../../lib/analytics/analyticsFilterTranslator';
import { AnalyticsGroupedItem, AnalyticsTimeSeriesPoint, safeAnalyticsDivide } from '../../../types/analyticsFramework';
import { aggregateRecordsIntoTimeSeries, TimeBucketInterval } from '../../../lib/analytics/analyticsTimeBucket';
import {
  getControlTowerExecutions,
  getControlTowerExceptions,
} from '../controlTowerRepository';
import { ShipmentExecutionOrder, ShipmentException } from '../../../types/controlTower';

export interface ControlTowerAnalyticsQueryOptions {
  filters: TranslatedQueryFilters;
  dimension?: string;
  timeBucket?: TimeBucketInterval;
  timeField?: string;
  timezone?: string;
}

/**
 * Filter executions by tenant, company, branch, and date range filters.
 */
function filterExecutions(executions: ShipmentExecutionOrder[], filters: TranslatedQueryFilters): ShipmentExecutionOrder[] {
  return executions.filter((exec) => {
    // Tenant isolation
    if (filters.tenantId && (exec as any).tenantId && (exec as any).tenantId !== filters.tenantId) {
      return false;
    }
    if (filters.companyId && (exec as any).companyId && (exec as any).companyId !== filters.companyId) {
      return false;
    }
    if (filters.branchId && (exec as any).branchId && (exec as any).branchId !== filters.branchId) {
      return false;
    }

    // Equality filters
    for (const [key, val] of Object.entries(filters.equalityFilters)) {
      const execVal = (exec as any)[key];
      if (execVal !== undefined && execVal !== val) {
        return false;
      }
    }

    // In filters
    for (const [key, vals] of Object.entries(filters.inFilters)) {
      if (vals && vals.length > 0) {
        const execVal = (exec as any)[key];
        if (execVal !== undefined && !vals.includes(execVal)) {
          return false;
        }
      }
    }

    // Date range filter
    if (filters.dateRangeFilter) {
      const timeField = filters.dateRangeFilter.field || 'updatedAt';
      const recordTime = (exec as any)[timeField] || exec.updatedAt;
      if (recordTime) {
        if (filters.dateRangeFilter.startDate && recordTime < filters.dateRangeFilter.startDate) {
          return false;
        }
        if (filters.dateRangeFilter.endDate && recordTime > filters.dateRangeFilter.endDate) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Filter exceptions by tenant, company, branch, and date range filters.
 */
function filterExceptions(exceptions: ShipmentException[], filters: TranslatedQueryFilters): ShipmentException[] {
  return exceptions.filter((exc) => {
    // Tenant isolation
    if (filters.tenantId && (exc as any).tenantId && (exc as any).tenantId !== filters.tenantId) {
      return false;
    }
    if (filters.companyId && (exc as any).companyId && (exc as any).companyId !== filters.companyId) {
      return false;
    }
    if (filters.branchId && (exc as any).branchId && (exc as any).branchId !== filters.branchId) {
      return false;
    }

    // Equality filters
    for (const [key, val] of Object.entries(filters.equalityFilters)) {
      const excVal = (exc as any)[key];
      if (excVal !== undefined && excVal !== val) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRangeFilter) {
      const timeField = filters.dateRangeFilter.field || 'reportedAt';
      const recordTime = (exc as any)[timeField] || exc.reportedAt;
      if (recordTime) {
        if (filters.dateRangeFilter.startDate && recordTime < filters.dateRangeFilter.startDate) {
          return false;
        }
        if (filters.dateRangeFilter.endDate && recordTime > filters.dateRangeFilter.endDate) {
          return false;
        }
      }
    }

    return true;
  });
}

export class ControlTowerAnalyticsRepository {
  /**
   * Calculates scalar value for requested metric ID.
   */
  public async getMetricValue(metricId: string, options: ControlTowerAnalyticsQueryOptions): Promise<number> {
    const [allExecutions, allExceptions] = await Promise.all([
      getControlTowerExecutions().catch(() => []),
      getControlTowerExceptions().catch(() => []),
    ]);

    const executions = filterExecutions(allExecutions, options.filters);
    const exceptions = filterExceptions(allExceptions, options.filters);

    switch (metricId) {
      case 'ct_active_operations':
      case 'ct_active_shipments':
        return executions.length;

      case 'ct_open_exceptions':
        return exceptions.filter((e) => e.status !== 'RESOLVED' && e.status !== 'CLOSED').length;

      case 'ct_critical_exceptions':
        return exceptions.filter(
          (e) => (e.status !== 'RESOLVED' && e.status !== 'CLOSED') && e.severity === 'CRITICAL'
        ).length;

      case 'ct_delayed_shipments':
        return executions.filter(
          (exec) =>
            exec.delayRiskFactor === 'MEDIUM' ||
            exec.delayRiskFactor === 'HIGH' ||
            exec.delayRiskFactor === 'CRITICAL' ||
            (exec.currentETA && exec.plannedETA && new Date(exec.currentETA) > new Date(exec.plannedETA))
        ).length;

      case 'ct_sla_breaches': {
        const breachedExecs = executions.filter((exec) => exec.hasActiveException || exec.delayRiskFactor === 'HIGH');
        const breachedExcs = exceptions.filter((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL');
        return breachedExecs.length + breachedExcs.length;
      }

      case 'ct_sla_breach_rate': {
        const breaches = await this.getMetricValue('ct_sla_breaches', options);
        const total = executions.length || 1;
        return safeAnalyticsDivide(breaches, total, 100);
      }

      case 'ct_unresolved_tasks': {
        const activeExcs = exceptions.filter((e) => e.status !== 'RESOLVED').length;
        const pendingExecs = executions.filter((e) => e.hasActiveException).length;
        return activeExcs + pendingExecs;
      }

      case 'ct_completed_operations':
        return executions.filter((exec) => exec.progressPercent === 100 || (exec.currentStage as string) === 'DELIVERED').length;

      case 'ct_resolution_rate': {
        const totalExcs = exceptions.length;
        if (totalExcs === 0) return 100;
        const resolved = exceptions.filter((e) => e.status === 'RESOLVED' || e.status === 'CLOSED').length;
        return safeAnalyticsDivide(resolved, totalExcs, 100);
      }

      case 'ct_otd_rate': {
        const totalCompleted = executions.filter((exec) => exec.progressPercent === 100 || (exec.currentStage as string) === 'DELIVERED').length;
        if (totalCompleted === 0) {
          // If no completed shipments in dataset, calculate on-time ratio of active shipments without delay
          const onTimeActive = executions.filter((exec) => exec.delayRiskFactor === 'NONE').length;
          return safeAnalyticsDivide(onTimeActive, executions.length || 1, 100);
        }
        const onTimeCompleted = executions.filter(
          (exec) =>
            (exec.progressPercent === 100 || (exec.currentStage as string) === 'DELIVERED') &&
            exec.delayRiskFactor === 'NONE'
        ).length;
        return safeAnalyticsDivide(onTimeCompleted, totalCompleted, 100);
      }

      case 'ct_logistics_health_score': {
        if (executions.length === 0) return 100;
        const totalHealth = executions.reduce((sum, exec) => sum + (exec.healthScorePercent || 100), 0);
        return Math.round((totalHealth / executions.length) * 10) / 10;
      }

      default:
        return 0;
    }
  }

  /**
   * Grouped aggregation across requested dimension for Control Tower.
   */
  public async getGroupedControlTowerData(
    options: ControlTowerAnalyticsQueryOptions,
    dimension: string
  ): Promise<AnalyticsGroupedItem[]> {
    const [allExecutions, allExceptions] = await Promise.all([
      getControlTowerExecutions().catch(() => []),
      getControlTowerExceptions().catch(() => []),
    ]);

    const executions = filterExecutions(allExecutions, options.filters);
    const exceptions = filterExceptions(allExceptions, options.filters);

    const counts: Record<string, { value: number; count: number }> = {};

    if (dimension === 'category' || dimension === 'severity') {
      for (const exc of exceptions) {
        const key = (exc as any)[dimension] || 'UNKNOWN';
        if (!counts[key]) {
          counts[key] = { value: 0, count: 0 };
        }
        counts[key].value += 1;
        counts[key].count += 1;
      }
    } else if (dimension === 'status') {
      for (const exc of exceptions) {
        const key = exc.status || 'UNKNOWN';
        if (!counts[key]) {
          counts[key] = { value: 0, count: 0 };
        }
        counts[key].value += 1;
        counts[key].count += 1;
      }
    } else if (dimension === 'stage' || dimension === 'currentStage') {
      for (const exec of executions) {
        const key = exec.currentStage || 'UNKNOWN';
        if (!counts[key]) {
          counts[key] = { value: 0, count: 0 };
        }
        counts[key].value += 1;
        counts[key].count += 1;
      }
    } else if (dimension === 'corridor' || dimension === 'originCity') {
      for (const exec of executions) {
        const key = `${exec.originCity} → ${exec.destinationCity}`;
        if (!counts[key]) {
          counts[key] = { value: 0, count: 0 };
        }
        counts[key].value += 1;
        counts[key].count += 1;
      }
    } else if (dimension === 'carrier' || dimension === 'carrierPartnerName') {
      for (const exec of executions) {
        const key = exec.carrierPartnerName || 'DIRECT_FLEET';
        if (!counts[key]) {
          counts[key] = { value: 0, count: 0 };
        }
        counts[key].value += 1;
        counts[key].count += 1;
      }
    }

    return Object.entries(counts).map(([key, data]) => ({
      key,
      labelEn: key,
      labelAr: key,
      value: data.value,
      count: data.count,
    }));
  }

  /**
   * Time series points for Control Tower metrics.
   */
  public async getTimeSeries(
    options: ControlTowerAnalyticsQueryOptions,
    timeBucket: TimeBucketInterval,
    timeField = 'updatedAt',
    timezone = 'Asia/Riyadh'
  ): Promise<AnalyticsTimeSeriesPoint[]> {
    const allExecutions = await getControlTowerExecutions().catch(() => []);
    const executions = filterExecutions(allExecutions, options.filters);

    return aggregateRecordsIntoTimeSeries(
      executions as any[],
      timeField as any,
      timeBucket,
      () => 1,
      timezone
    );
  }
}

export const controlTowerAnalyticsRepository = new ControlTowerAnalyticsRepository();
