import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
} from 'lucide-react';
import { AuditRecord, AuditSeverity, AuditActionType } from '../../types/audit';
import { AuditEngine } from '../../lib/observability/AuditEngine';

interface AuditTrailViewerProps {
  auditLogs: AuditRecord[];
  onFilterChange?: (filters: any) => void;
  title?: string;
  subtitle?: string;
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({
  auditLogs,
  title = 'Enterprise Immutable Audit Trail',
  subtitle = 'Cryptographically verified, tamper-evident log of all system mutations and access events',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const modules = ['ALL', 'SHIPPING', 'FINANCE', 'CUSTOMS', 'WORKFLOW', 'SECURITY', 'ORGANIZATION', 'AI'];
  const severities = ['ALL', 'INFO', 'LOW', 'WARNING', 'HIGH', 'CRITICAL'];
  const actions = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'PERMISSION_CHANGE', 'WORKFLOW_CHANGE', 'PAYMENT_EVENT'];

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedModule !== 'ALL' && log.module.toUpperCase() !== selectedModule) return false;
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.actorName?.toLowerCase().includes(q) ||
        log.actorEmail?.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Timestamp', 'Actor', 'Email', 'Role', 'Action', 'Severity', 'Module', 'Entity Type', 'Entity ID', 'Trace ID', 'Description'].join(','),
      ...filteredLogs.map((l) =>
        [
          l.id,
          l.timestamp,
          `"${l.actorName || l.actorId}"`,
          l.actorEmail || '',
          l.actorRole || '',
          l.action,
          l.severity,
          l.module,
          l.entityType,
          l.entityId,
          l.traceId,
          `"${l.description.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aja_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5 ml-1.5" />
            Immutable Checksum Active
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 ml-1.5" />
            Export Audit Logs
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, ID, actor, trace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                Module: {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                Severity: {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                Action: {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor / User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Entity & ID</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No audit records found matching selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isVerified = AuditEngine.verifyTamperProof(log);

                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 space-x-reverse">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{log.actorName || log.actorId}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole || log.actorEmail}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-slate-300 font-medium">{log.module}</span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div className="text-slate-200">{log.entityType}</div>
                        <div className="text-slate-400">{log.entityId}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {isVerified ? (
                          <span className="inline-flex items-center text-[10px] text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Tamper Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] text-red-400">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            Checksum Mismatch
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="inline-flex items-center px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                          {isExpanded ? 'Hide' : 'View Diff'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Diff Detail View */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-b border-slate-800">
                        <td colSpan={8} className="p-4">
                          <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="font-semibold text-slate-200">
                                <span className="text-emerald-400 ml-1">Log Description:</span> {log.description}
                              </div>
                              <div className="font-mono text-[10px] text-slate-500">
                                Trace ID: {log.traceId} | IP: {log.ipAddress}
                              </div>
                            </div>

                            {log.changedFields && log.changedFields.length > 0 && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-slate-400 text-[11px]">Changed Fields:</span>
                                {log.changedFields.map((f) => (
                                  <span key={f} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px]">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div>
                                <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center">
                                  <FileCode2 className="w-3.5 h-3.5 ml-1 text-red-400" />
                                  Previous State
                                </div>
                                <pre className="bg-slate-900 border border-slate-800 rounded p-3 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48">
                                  {log.previousState ? JSON.stringify(log.previousState, null, 2) : 'null'}
                                </pre>
                              </div>

                              <div>
                                <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center">
                                  <FileCode2 className="w-3.5 h-3.5 ml-1 text-emerald-400" />
                                  New State
                                </div>
                                <pre className="bg-slate-900 border border-slate-800 rounded p-3 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                                  {log.newState ? JSON.stringify(log.newState, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
