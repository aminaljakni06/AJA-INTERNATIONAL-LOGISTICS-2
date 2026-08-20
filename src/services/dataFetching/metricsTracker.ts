/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Performance Metrics Tracker
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { PerformanceMetrics, RequestMetadata } from '../../types/dataFetchingFramework';

class EnterpriseMetricsTracker {
  private totalRequests: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private totalRetries: number = 0;
  private failedRequests: number = 0;
  private totalLatencyMs: number = 0;
  private slowRequestsCount: number = 0;
  private logs: RequestMetadata[] = [];
  private maxLogs: number = 200;

  public recordRequest(meta: RequestMetadata): void {
    this.totalRequests++;

    if (meta.cacheStatus === 'HIT') {
      this.cacheHits++;
    } else if (meta.cacheStatus === 'MISS' || meta.cacheStatus === 'STALE') {
      this.cacheMisses++;
    }

    if (meta.retries > 0) {
      this.totalRetries += meta.retries;
    }

    const duration = meta.durationMs || 0;
    this.totalLatencyMs += duration;

    if (duration > 1000) {
      this.slowRequestsCount++;
    }

    // Append log with limit ring buffer
    if (this.logs.length >= this.maxLogs) {
      this.logs.shift();
    }
    this.logs.push(meta);
  }

  public recordFailure(): void {
    this.failedRequests++;
  }

  public getMetrics(): PerformanceMetrics {
    const executedRequests = Math.max(1, this.totalRequests);
    return {
      totalRequests: this.totalRequests,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      totalRetries: this.totalRetries,
      failedRequests: this.failedRequests,
      averageLatencyMs: Math.round((this.totalLatencyMs / executedRequests) * 100) / 100,
      slowRequestsCount: this.slowRequestsCount,
    };
  }

  public getRecentLogs(): RequestMetadata[] {
    return [...this.logs];
  }

  public reset(): void {
    this.totalRequests = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalRetries = 0;
    this.failedRequests = 0;
    this.totalLatencyMs = 0;
    this.slowRequestsCount = 0;
    this.logs = [];
  }
}

export const enterpriseMetricsTracker = new EnterpriseMetricsTracker();
