/**
 * AJA INTERNATIONAL LOGISTICS — Central Analytics Aggregation Engine
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Server-Side Aggregation Engine & Multi-Domain Analytics Repositories (STEP 05.19.03)
 */

import {
  AnalyticsMetricId,
  AnalyticsMetricResult,
  AnalyticsGroupedResult,
  AnalyticsTimeSeriesPoint,
  AnalyticsError,
  safeAnalyticsDivide,
} from '../../types/analyticsFramework';
import { EnterpriseQueryState } from '../../types/queryFramework';
import {
  ServerAnalyticsContext,
  AnalyticsExecutionOptions,
  AnalyticsExecutionResponse,
} from '../../lib/analytics/analyticsExecutionTypes';
import { planMetricExecution } from '../../lib/analytics/analyticsExecutionPlanner';
import { translateAnalyticsFilters } from '../../lib/analytics/analyticsFilterTranslator';
import { shipmentAnalyticsRepository } from '../../db/repositories/analytics/shipmentAnalyticsRepository';
import { customerAnalyticsRepository } from '../../db/repositories/analytics/customerAnalyticsRepository';
import { quoteAnalyticsRepository } from '../../db/repositories/analytics/quoteAnalyticsRepository';
import { financeAnalyticsRepository } from '../../db/repositories/analytics/financeAnalyticsRepository';
import { controlTowerAnalyticsRepository } from '../../db/repositories/analytics/controlTowerAnalyticsRepository';

export class AnalyticsAggregationEngine {
  /**
   * Evaluates a single registered metric following the 16-step deterministic pipeline.
   */
  public async executeMetric(
    metricId: AnalyticsMetricId,
    queryState: EnterpriseQueryState | undefined,
    context: ServerAnalyticsContext
  ): Promise<AnalyticsMetricResult> {
    const startTime = Date.now();

    // 1-6. Plan execution, authorize user, resolve descriptor & tenant scope
    const plan = planMetricExecution(metricId, context);
    const metric = plan.metric;

    // 7-9. Translate filters (ignoring UI page pagination for KPI totals)
    const translatedFilters = translateAnalyticsFilters(
      metric,
      queryState,
      context.tenantId,
      context.companyId,
      context.branchId
    );

    let rawValue: number | null = null;

    // 10-13. Execute repository aggregation based on resource
    if (metric.aggregationType === 'RATIO' || metric.aggregationType === 'PERCENTAGE') {
      const numResult = await this.executeMetric(metric.numeratorMetricId!, queryState, context);
      const denResult = await this.executeMetric(metric.denominatorMetricId!, queryState, context);

      const multiplier = metric.multiplier ?? (metric.valueType === 'PERCENTAGE' ? 100 : 1);
      rawValue = safeAnalyticsDivide(numResult.value, denResult.value, multiplier);
    } else {
      rawValue = await this.executeDirectResourceAggregation(metric, translatedFilters, context);
    }

    // 14-16. Produce metadata & typed result
    return {
      metricId: metric.id,
      value: rawValue,
      valueType: metric.valueType,
      currency: metric.format.defaultCurrency || null,
      unit: metric.format.unit || null,
      computedAt: new Date().toISOString(),
      completeness: 'COMPLETE',
    };
  }

  /**
   * Evaluates direct aggregations (COUNT, SUM, AVG) for base metrics.
   */
  private async executeDirectResourceAggregation(
    metric: any,
    filters: any,
    context: ServerAnalyticsContext
  ): Promise<number | null> {
    const timeField = metric.timeField || 'createdAt';

    switch (metric.resource) {
      case 'shipments':
        if (metric.aggregationType === 'COUNT') {
          return shipmentAnalyticsRepository.getShipmentCount({ filters });
        }
        if (metric.aggregationType === 'SUM' && metric.sourceField) {
          return shipmentAnalyticsRepository.getShipmentSum({ filters }, metric.sourceField);
        }
        break;

      case 'customers':
        if (metric.aggregationType === 'COUNT') {
          return customerAnalyticsRepository.getCustomerCount({ filters });
        }
        break;

      case 'quotes':
        if (metric.aggregationType === 'COUNT') {
          return quoteAnalyticsRepository.getQuoteCount({ filters });
        }
        if (metric.aggregationType === 'SUM' && metric.sourceField === 'offeredPrice') {
          // Check currency policy enforcement
          const currencyGroups = await quoteAnalyticsRepository.getQuoteOfferedValueGroupedByCurrency({ filters });
          if (currencyGroups.length === 0) return 0;
          if (currencyGroups.length === 1) return currencyGroups[0].value;

          // If multiple currencies exist and metric requires grouping, throw error or return sum if single currency filter is applied
          throw new AnalyticsError(
            'ANALYTICS_CURRENCY_MISMATCH',
            `Metric "${metric.id}" contains records with multiple currencies (${currencyGroups.map((c) => c.key).join(', ')}). Grouped currency execution must be used.`
          );
        }
        break;

      case 'finance':
        switch (metric.id) {
          case 'fin_recognized_revenue':
            return financeAnalyticsRepository.getRecognizedRevenue({ filters });
          case 'fin_invoiced_revenue':
            return financeAnalyticsRepository.getInvoicedRevenue({ filters });
          case 'fin_cash_collected':
            return financeAnalyticsRepository.getCashCollected({ filters });
          case 'fin_outstanding_ar':
            return financeAnalyticsRepository.getOutstandingAR({ filters });
          case 'fin_operating_expenses':
            return financeAnalyticsRepository.getOperatingExpenses({ filters });
          case 'fin_direct_cost':
            return financeAnalyticsRepository.getDirectCost({ filters });
          case 'fin_gross_profit':
            return financeAnalyticsRepository.getGrossProfit({ filters });
          case 'fin_ar_overdue':
            return financeAnalyticsRepository.getAROverdue({ filters });
          case 'fin_ar_current':
            return financeAnalyticsRepository.getARCurrent({ filters });
          default:
            return 0;
        }

      case 'control_tower':
        return controlTowerAnalyticsRepository.getMetricValue(metric.id, { filters });

      default:
        throw new AnalyticsError(
          'ANALYTICS_INVALID_METRIC',
          `Resource "${metric.resource}" is not yet supported by analytics aggregation repositories`
        );
    }

    return 0;
  }

  /**
   * Evaluates grouped aggregations across a specified dimension.
   */
  public async executeGroupedMetric(
    metricId: AnalyticsMetricId,
    dimension: string,
    queryState: EnterpriseQueryState | undefined,
    context: ServerAnalyticsContext
  ): Promise<AnalyticsGroupedResult> {
    const plan = planMetricExecution(metricId, context, dimension);
    const metric = plan.metric;

    const translatedFilters = translateAnalyticsFilters(
      metric,
      queryState,
      context.tenantId,
      context.companyId,
      context.branchId
    );

    let groups: any[] = [];

    if (metric.resource === 'quotes' && metric.id === 'quote_offered_value' && dimension === 'currency') {
      groups = await quoteAnalyticsRepository.getQuoteOfferedValueGroupedByCurrency({ filters: translatedFilters });
    } else if (metric.resource === 'finance') {
      groups = await financeAnalyticsRepository.getGroupedFinanceData({ filters: translatedFilters }, dimension);
    } else if (metric.resource === 'shipments') {
      groups = await shipmentAnalyticsRepository.getGroupedShipments({ filters: translatedFilters }, dimension);
    } else if (metric.resource === 'customers') {
      groups = await customerAnalyticsRepository.getGroupedCustomers({ filters: translatedFilters }, dimension);
    } else if (metric.resource === 'quotes') {
      groups = await quoteAnalyticsRepository.getGroupedQuotes({ filters: translatedFilters }, dimension);
    } else if (metric.resource === 'control_tower') {
      groups = await controlTowerAnalyticsRepository.getGroupedControlTowerData({ filters: translatedFilters }, dimension);
    }

    return {
      metricId: metric.id,
      dimension,
      groups,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates time-series points across requested time bucket.
   */
  public async executeTimeSeries(
    metricId: AnalyticsMetricId,
    timeBucket: 'DAY' | 'WEEK' | 'MONTH',
    queryState: EnterpriseQueryState | undefined,
    context: ServerAnalyticsContext
  ): Promise<AnalyticsTimeSeriesPoint[]> {
    const plan = planMetricExecution(metricId, context);
    const metric = plan.metric;

    const translatedFilters = translateAnalyticsFilters(
      metric,
      queryState,
      context.tenantId,
      context.companyId,
      context.branchId
    );

    const timeField = metric.timeField || 'createdAt';
    const timezone = context.timezone || 'Asia/Riyadh';

    if (metric.resource === 'shipments') {
      return shipmentAnalyticsRepository.getTimeSeries({ filters: translatedFilters }, timeBucket, timeField, timezone);
    }
    if (metric.resource === 'customers') {
      return customerAnalyticsRepository.getTimeSeries({ filters: translatedFilters }, timeBucket, timeField, timezone);
    }
    if (metric.resource === 'quotes') {
      return quoteAnalyticsRepository.getTimeSeries({ filters: translatedFilters }, timeBucket, timeField, timezone);
    }
    if (metric.resource === 'finance') {
      return financeAnalyticsRepository.getTimeSeries({ filters: translatedFilters }, timeBucket, timeField, timezone);
    }
    if (metric.resource === 'control_tower') {
      return controlTowerAnalyticsRepository.getTimeSeries({ filters: translatedFilters }, timeBucket, timeField, timezone);
    }

    return [];
  }

  /**
   * Executes batch metrics request with bounded parallelism.
   */
  public async executeMetrics(
    metricIds: AnalyticsMetricId[],
    options: AnalyticsExecutionOptions | undefined,
    context: ServerAnalyticsContext
  ): Promise<AnalyticsExecutionResponse> {
    const startTime = Date.now();

    if (!metricIds || metricIds.length === 0) {
      throw new AnalyticsError('ANALYTICS_INVALID_METRIC', 'At least one metric ID must be provided');
    }

    // Safeguard: Limit max metrics per query request
    if (metricIds.length > 20) {
      throw new AnalyticsError(
        'ANALYTICS_QUERY_TOO_EXPENSIVE',
        `Request exceeds maximum limit of 20 metrics per single execution (received ${metricIds.length})`
      );
    }

    const queryState = options?.queryState;

    // Execute metrics
    const results: AnalyticsMetricResult[] = [];
    for (const id of metricIds) {
      const res = await this.executeMetric(id, queryState, context);
      results.push(res);
    }

    const groupedResults: AnalyticsGroupedResult[] = [];
    if (options?.dimension) {
      for (const id of metricIds) {
        try {
          const g = await this.executeGroupedMetric(id, options.dimension, queryState, context);
          groupedResults.push(g);
        } catch (e: any) {
          // Ignore if dimension is unsupported for specific metrics in batch
        }
      }
    }

    const duration = Date.now() - startTime;

    return {
      metrics: results,
      groupedResults: groupedResults.length > 0 ? groupedResults : undefined,
      metadata: {
        executionTimeMs: duration,
        tenantId: context.tenantId,
        companyId: context.companyId,
        branchId: context.branchId,
        timezone: context.timezone || 'Asia/Riyadh',
        cached: false,
      },
    };
  }
}

export const analyticsAggregationEngine = new AnalyticsAggregationEngine();
