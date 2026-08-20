/**
 * AJA INTERNATIONAL LOGISTICS — Analytics Client Service
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: REST API & Tenant-Aware Middleware Integration (STEP 05.19.04)
 */

import {
  AnalyticsMetricResult,
  AnalyticsGroupedResult,
  AnalyticsTimeSeriesPoint,
} from '../types/analyticsFramework';
import { EnterpriseQueryState } from '../types/queryFramework';
import { PublicAnalyticsMetricDTO } from '../lib/analytics/analyticsDtoMapper';
import { AnalyticsExecutionResponse } from '../lib/analytics/analyticsExecutionTypes';

export class AnalyticsService {
  private static baseUrl = '/api/analytics';

  private static getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aja_auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Discovers authorized metrics for current user, optionally filtered by resource.
   */
  public static async getAvailableMetrics(resource?: string): Promise<PublicAnalyticsMetricDTO[]> {
    const url = resource
      ? `${this.baseUrl}/metrics?resource=${encodeURIComponent(resource)}`
      : `${this.baseUrl}/metrics`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to fetch available metrics.');
    }

    return body.data;
  }

  /**
   * Discovers authorized metrics for a specific resource.
   */
  public static async getMetricsForResource(resource: string): Promise<PublicAnalyticsMetricDTO[]> {
    const response = await fetch(`${this.baseUrl}/resources/${encodeURIComponent(resource)}/metrics`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || `Failed to fetch metrics for resource ${resource}.`);
    }

    return body.data;
  }

  /**
   * Executes scalar KPI metrics query.
   */
  public static async queryMetrics(payload: {
    metricIds: string[];
    queryState?: EnterpriseQueryState;
  }): Promise<AnalyticsExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/metrics/query`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      const err = new Error(body.error?.message || 'Failed to execute analytics query.');
      (err as any).code = body.error?.code;
      throw err;
    }

    return body.data;
  }

  /**
   * Executes grouped analytics query.
   */
  public static async queryGroupedAnalytics(payload: {
    metricId: string;
    dimension: string;
    queryState?: EnterpriseQueryState;
  }): Promise<AnalyticsGroupedResult> {
    const response = await fetch(`${this.baseUrl}/grouped`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      const err = new Error(body.error?.message || 'Failed to execute grouped analytics.');
      (err as any).code = body.error?.code;
      throw err;
    }

    return body.data;
  }

  /**
   * Executes time-series analytics query.
   */
  public static async queryTimeSeriesAnalytics(payload: {
    metricId: string;
    interval: 'DAY' | 'WEEK' | 'MONTH';
    dateRange?: { startDate: string; endDate: string };
    queryState?: EnterpriseQueryState;
  }): Promise<{
    metricId: string;
    interval: 'DAY' | 'WEEK' | 'MONTH';
    dateRange: { startDate: string; endDate: string } | null;
    points: AnalyticsTimeSeriesPoint[];
    computedAt: string;
  }> {
    const response = await fetch(`${this.baseUrl}/timeseries`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      const err = new Error(body.error?.message || 'Failed to execute time-series analytics.');
      (err as any).code = body.error?.code;
      throw err;
    }

    return body.data;
  }
}
