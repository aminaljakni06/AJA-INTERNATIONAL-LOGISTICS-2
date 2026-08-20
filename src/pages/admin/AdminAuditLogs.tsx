import React, { useState } from 'react';
import { ShieldCheck, Activity, Server, Cpu, Layers } from 'lucide-react';
import { useAudit } from '../../hooks/useAudit';
import { AuditTrailViewer } from '../../components/audit/AuditTrailViewer';
import { ActivityTimelineViewer } from '../../components/audit/ActivityTimelineViewer';
import { SystemHealthCards } from '../../components/audit/SystemHealthCards';
import { PerformanceMetricsCard } from '../../components/audit/PerformanceMetricsCard';

export const AdminAuditLogs: React.FC = () => {
  const {
    auditLogs,
    activityLogs,
    activeSessions,
    healthStatus,
    performanceStats,
    aiTelemetryStats,
    refreshHealth,
    refreshAll,
  } = useAudit();

  const [activeTab, setActiveTab] = useState<'AUDIT' | 'ACTIVITY' | 'HEALTH' | 'METRICS'>('AUDIT');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Observability & Audit Platform</h1>
              <p className="text-xs text-slate-400">
                Immutable Audit Trail, Activity Timeline, System Health Diagnostics & AI Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'AUDIT' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 ml-1.5" />
            Audit Trail ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITY')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'ACTIVITY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 ml-1.5" />
            Activity Log ({activityLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'HEALTH' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4 ml-1.5" />
            System Health ({healthStatus.length})
          </button>

          <button
            onClick={() => setActiveTab('METRICS')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'METRICS' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 ml-1.5" />
            APM & Telemetry
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="space-y-6">
        {activeTab === 'AUDIT' && <AuditTrailViewer auditLogs={auditLogs} />}

        {activeTab === 'ACTIVITY' && (
          <ActivityTimelineViewer activityLogs={activityLogs} activeSessions={activeSessions} />
        )}

        {activeTab === 'HEALTH' && (
          <div className="space-y-6">
            <SystemHealthCards healthStatus={healthStatus} onRefresh={refreshHealth} />
          </div>
        )}

        {activeTab === 'METRICS' && (
          <div className="space-y-6">
            <PerformanceMetricsCard performanceStats={performanceStats} aiTelemetryStats={aiTelemetryStats} />
            <SystemHealthCards healthStatus={healthStatus} onRefresh={refreshHealth} />
          </div>
        )}
      </div>
    </div>
  );
};
