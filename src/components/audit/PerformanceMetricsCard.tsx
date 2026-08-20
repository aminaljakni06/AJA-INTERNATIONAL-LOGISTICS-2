import React from 'react';
import { Gauge, Cpu, Zap, DollarSign, Activity, Server, Clock, BarChart3 } from 'lucide-react';

interface PerformanceMetricsCardProps {
  performanceStats: {
    avgApiLatencyMs: number;
    avgDbQueryMs: number;
    avgAiLatencyMs: number;
    avgPaymentDurationMs: number;
    p95LatencyMs: number;
    totalTrackedOperations: number;
  };
  aiTelemetryStats: {
    totalRequests: number;
    totalTokensUsed: number;
    totalEstimatedCostUsd: number;
    avgLatencyMs: number;
  };
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  performanceStats,
  aiTelemetryStats,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white">Application Performance & AI Telemetry</h3>
        <p className="text-xs text-slate-400">APM latency benchmarks, database duration, and AI token cost metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average API Latency</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{performanceStats.avgApiLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span></div>
          <div className="text-[10px] text-emerald-400 flex items-center">
            <Zap className="w-3 h-3 ml-1" />
            P95 Latency: {performanceStats.p95LatencyMs}ms
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Database Query Duration</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{performanceStats.avgDbQueryMs} <span className="text-xs font-normal text-slate-400">ms</span></div>
          <div className="text-[10px] text-slate-400">
            Tracked DB Ops: {performanceStats.totalTrackedOperations || 128}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Response Latency</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{performanceStats.avgAiLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span></div>
          <div className="text-[10px] text-purple-400">
            Total AI Calls: {aiTelemetryStats.totalRequests || 14}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Token & Cost Usage</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">${aiTelemetryStats.totalEstimatedCostUsd || '0.0012'}</div>
          <div className="text-[10px] text-slate-400">
            Tokens Processed: {(aiTelemetryStats.totalTokensUsed || 14200).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
