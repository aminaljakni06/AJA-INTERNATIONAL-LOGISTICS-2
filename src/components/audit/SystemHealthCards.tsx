import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Server,
  Sparkles,
  CreditCard,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { HealthStatusRecord } from '../../types/audit';

interface SystemHealthCardsProps {
  healthStatus: HealthStatusRecord[];
  onRefresh?: () => void;
}

export const SystemHealthCards: React.FC<SystemHealthCardsProps> = ({ healthStatus, onRefresh }) => {
  const getComponentIcon = (comp: string) => {
    switch (comp) {
      case 'FIRESTORE':
      case 'DATABASE':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'API':
      case 'APP':
        return <Server className="w-5 h-5 text-blue-400" />;
      case 'AI_SERVICE':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'PAYMENT_GATEWAY':
        return <CreditCard className="w-5 h-5 text-amber-400" />;
      case 'NOTIFICATION_SERVICE':
        return <Bell className="w-5 h-5 text-pink-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        };
      case 'DEGRADED':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          icon: <XCircle className="w-4 h-4 text-red-400" />,
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">System Diagnostics & Component Health</h3>
          <p className="text-xs text-slate-400">Real-time health telemetry across storage, API, AI, and payments</p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
            Run Diagnostics
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStatus.map((item) => {
          const badge = getStatusBadge(item.status);

          return (
            <div
              key={item.component}
              className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">{getComponentIcon(item.component)}</div>
                <div className={`flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 rounded-full text-[10px] font-medium border ${badge.bg}`}>
                  {badge.icon}
                  <span>{item.status}</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-xs text-white uppercase tracking-wider">{item.component}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.message}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                <span>Latency: {item.latencyMs || 15}ms</span>
                <span>{new Date(item.lastChecked).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
