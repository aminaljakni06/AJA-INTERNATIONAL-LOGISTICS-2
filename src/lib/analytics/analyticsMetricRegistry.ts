/**
 * AJA INTERNATIONAL LOGISTICS — Canonical KPI & Analytics Metric Registry
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Core Analytics Types & KPI Registry (STEP 05.19.02)
 */

import {
  AnalyticsMetricDescriptor,
  AnalyticsResourceId,
  AnalyticsDomain,
  AnalyticsMetricId,
  AnalyticsDimensionDescriptor,
  AnalyticsError,
} from '../../types/analyticsFramework';
import { validateMetricRegistry } from './analyticsMetricValidator';
import { SHIPMENT_METRICS } from './metrics/shipmentMetrics';
import { CUSTOMER_METRICS } from './metrics/customerMetrics';
import { QUOTE_METRICS } from './metrics/quoteMetrics';
import { FINANCE_METRICS } from './metrics/financeMetrics';
import { CONTROL_TOWER_METRICS } from './metrics/controlTowerMetrics';

export class AnalyticsMetricRegistry {
  private readonly metricMap: ReadonlyMap<AnalyticsMetricId, AnalyticsMetricDescriptor>;
  private readonly metricsByResourceMap: ReadonlyMap<AnalyticsResourceId, readonly AnalyticsMetricDescriptor[]>;
  private readonly metricsByDomainMap: ReadonlyMap<AnalyticsDomain, readonly AnalyticsMetricDescriptor[]>;

  constructor(initialMetrics: readonly AnalyticsMetricDescriptor[] = []) {
    // Validate initial metric set before freezing registry
    validateMetricRegistry(initialMetrics);

    const map = new Map<AnalyticsMetricId, AnalyticsMetricDescriptor>();
    const resourceMap = new Map<AnalyticsResourceId, AnalyticsMetricDescriptor[]>();
    const domainMap = new Map<AnalyticsDomain, AnalyticsMetricDescriptor[]>();

    for (const metric of initialMetrics) {
      // Freeze individual descriptors to prevent runtime mutation
      const frozenMetric = Object.freeze({ ...metric });
      map.set(frozenMetric.id, frozenMetric);

      if (!resourceMap.has(frozenMetric.resource)) {
        resourceMap.set(frozenMetric.resource, []);
      }
      resourceMap.get(frozenMetric.resource)!.push(frozenMetric);

      if (!domainMap.has(frozenMetric.domain)) {
        domainMap.set(frozenMetric.domain, []);
      }
      domainMap.get(frozenMetric.domain)!.push(frozenMetric);
    }

    this.metricMap = map;

    // Freeze inner lists
    const frozenResourceMap = new Map<AnalyticsResourceId, readonly AnalyticsMetricDescriptor[]>();
    for (const [res, list] of resourceMap.entries()) {
      frozenResourceMap.set(res, Object.freeze(list));
    }
    this.metricsByResourceMap = frozenResourceMap;

    const frozenDomainMap = new Map<AnalyticsDomain, readonly AnalyticsMetricDescriptor[]>();
    for (const [dom, list] of domainMap.entries()) {
      frozenDomainMap.set(dom, Object.freeze(list));
    }
    this.metricsByDomainMap = frozenDomainMap;

    Object.freeze(this);
  }

  /**
   * Retrieves a metric descriptor by ID, or undefined if not found.
   */
  public getMetric(id: AnalyticsMetricId): AnalyticsMetricDescriptor | undefined {
    return this.metricMap.get(id);
  }

  /**
   * Retrieves a metric descriptor by ID, throwing ANALYTICS_METRIC_NOT_FOUND if missing.
   */
  public requireMetric(id: AnalyticsMetricId): AnalyticsMetricDescriptor {
    const metric = this.getMetric(id);
    if (!metric) {
      throw new AnalyticsError(
        'ANALYTICS_METRIC_NOT_FOUND',
        `Analytics metric "${id}" is not registered in the canonical registry`,
        { metricId: id }
      );
    }
    return metric;
  }

  /**
   * Lists all registered metrics.
   */
  public listMetrics(): AnalyticsMetricDescriptor[] {
    return Array.from(this.metricMap.values());
  }

  /**
   * Lists all active metrics for a given resource identity.
   */
  public listMetricsByResource(resource: AnalyticsResourceId): AnalyticsMetricDescriptor[] {
    const list = this.metricsByResourceMap.get(resource);
    return list ? Array.from(list) : [];
  }

  /**
   * Lists all active metrics for a given domain.
   */
  public listMetricsByDomain(domain: AnalyticsDomain): AnalyticsMetricDescriptor[] {
    const list = this.metricsByDomainMap.get(domain);
    return list ? Array.from(list) : [];
  }

  /**
   * Returns whether a metric ID exists in the registry.
   */
  public verifyMetricAvailability(id: AnalyticsMetricId): boolean {
    return this.metricMap.has(id);
  }

  /**
   * Retrieves valid dimensions for a given metric.
   */
  public getMetricDimensions(id: AnalyticsMetricId): AnalyticsDimensionDescriptor[] {
    const metric = this.requireMetric(id);
    return metric.dimensions ? Array.from(metric.dimensions) : [];
  }

  /**
   * Resolves required permission keys for a metric.
   */
  public resolvePermissions(id: AnalyticsMetricId): string[] {
    const metric = this.requireMetric(id);
    return metric.requiredPermissions ? Array.from(metric.requiredPermissions) : [];
  }
}

/**
 * Standard default canonical metrics collection across registered domains.
 */
export const CANONICAL_DOMAINS_INITIAL_METRICS: readonly AnalyticsMetricDescriptor[] = Object.freeze([
  ...SHIPMENT_METRICS,
  ...CUSTOMER_METRICS,
  ...QUOTE_METRICS,
  ...FINANCE_METRICS,
  ...CONTROL_TOWER_METRICS,
]);

/**
 * Default global immutable instance of the Analytics Metric Registry.
 */
export const analyticsMetricRegistry = new AnalyticsMetricRegistry(CANONICAL_DOMAINS_INITIAL_METRICS);
