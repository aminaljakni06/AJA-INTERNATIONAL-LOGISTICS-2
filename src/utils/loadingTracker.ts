/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Request Loading Tracker & Utilities
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Loading Experience
 * Version: 1.0
 */

import { LoadingRequestTracker, LoadingMetrics } from '../types/loading';

class EnterpriseRequestTrackerService {
  private history: LoadingRequestTracker[] = [];
  private readonly MAX_HISTORY = 200;

  public recordRequestCompletion(tracker: LoadingRequestTracker) {
    const duration = tracker.finishedTime && tracker.startedTime
      ? tracker.finishedTime - tracker.startedTime
      : undefined;

    const completedRecord: LoadingRequestTracker = {
      ...tracker,
      durationMs: duration,
    };

    this.history.unshift(completedRecord);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }
  }

  public getMetrics(): LoadingMetrics {
    const total = this.history.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        averageDurationMs: 0,
        slowRequestsCount: 0,
        failedRequestsCount: 0,
        activeRequestsCount: 0,
      };
    }

    let totalDuration = 0;
    let slowCount = 0;
    let failedCount = 0;

    for (const item of this.history) {
      const dur = item.durationMs || 0;
      totalDuration += dur;
      if (dur > 3000) {
        slowCount++;
      }
      if (item.status === 'FAILED') {
        failedCount++;
      }
    }

    return {
      totalRequests: total,
      averageDurationMs: Math.round(totalDuration / total),
      slowRequestsCount: slowCount,
      failedRequestsCount: failedCount,
      activeRequestsCount: 0,
    };
  }

  public getHistory(): LoadingRequestTracker[] {
    return [...this.history];
  }
}

export const requestTrackerService = new EnterpriseRequestTrackerService();
