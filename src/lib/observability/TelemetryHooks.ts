import { AITelemetryHookData } from '../../types/audit';

export class TelemetryHooks {
  private static aiTelemetryLog: AITelemetryHookData[] = [];

  /**
   * Track AI API invocation metrics
   */
  public static trackAIInvocation(data: Omit<AITelemetryHookData, 'id' | 'timestamp'>): AITelemetryHookData {
    const promptTokens = data.promptTokens || 0;
    const completionTokens = data.completionTokens || 0;
    const totalTokens = data.totalTokens || promptTokens + completionTokens;

    // Approximate cost estimation (Gemini 2.5 Flash blend)
    const estimatedCostUsd = Number(((promptTokens * 0.000000075) + (completionTokens * 0.0000003)).toFixed(6));

    const record: AITelemetryHookData = {
      id: `aitel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      model: data.model || 'gemini-2.5-flash',
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: data.estimatedCostUsd ?? estimatedCostUsd,
      durationMs: data.durationMs,
      success: data.success,
      userId: data.userId,
      feature: data.feature || 'General Assistant',
    };

    this.aiTelemetryLog.unshift(record);
    if (this.aiTelemetryLog.length > 200) {
      this.aiTelemetryLog.pop();
    }

    return record;
  }

  public static getAITelemetryLogs(): AITelemetryHookData[] {
    return [...this.aiTelemetryLog];
  }

  public static getAITelemetrySummary(): {
    totalRequests: number;
    totalTokensUsed: number;
    totalEstimatedCostUsd: number;
    avgLatencyMs: number;
  } {
    const logs = this.aiTelemetryLog;
    if (logs.length === 0) {
      return {
        totalRequests: 0,
        totalTokensUsed: 0,
        totalEstimatedCostUsd: 0,
        avgLatencyMs: 0,
      };
    }

    const totalTokensUsed = logs.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0);
    const totalEstimatedCostUsd = Number(logs.reduce((acc, curr) => acc + (curr.estimatedCostUsd || 0), 0).toFixed(4));
    const avgLatencyMs = Math.round(logs.reduce((acc, curr) => acc + curr.durationMs, 0) / logs.length);

    return {
      totalRequests: logs.length,
      totalTokensUsed,
      totalEstimatedCostUsd,
      avgLatencyMs,
    };
  }
}
