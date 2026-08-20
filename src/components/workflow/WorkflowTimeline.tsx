import React from 'react';
import { WorkflowInstance, WorkflowHistoryRecord } from '../../types/workflow';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, User } from 'lucide-react';

interface Props {
  instance: WorkflowInstance;
  className?: string;
}

export const WorkflowTimeline: React.FC<Props> = ({ instance, className = '' }) => {
  const history = instance.history || [];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE':
      case 'WORKFLOW_STARTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'REJECT':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'SLA_VIOLATED':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div id="workflow-timeline-container" className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{instance.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ID: <span className="font-mono">{instance.id}</span> • Entity: {instance.entityType} ({instance.entityId})
          </p>
        </div>
        <WorkflowStatusBadge state={instance.currentState} />
      </div>

      <div className="mt-5 space-y-4">
        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No history records recorded yet.</p>
        ) : (
          history.map((record: WorkflowHistoryRecord, idx: number) => (
            <div key={record.id || idx} className="relative flex items-start gap-3 text-xs">
              {idx !== history.length - 1 && (
                <span className="absolute left-[17px] top-6 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-800" />
              )}
              <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0">
                {getActionIcon(record.action)}
              </div>
              <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {record.action.replace('_', ' ')}
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{record.toState}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
                {record.performedByUserName && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <User className="w-3 h-3" />
                    <span>{record.performedByUserName}</span>
                    {record.performedByUserRole && (
                      <span className="text-slate-400">({record.performedByUserRole})</span>
                    )}
                  </div>
                )}
                {record.comments && (
                  <p className="mt-1.5 text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2 rounded border border-slate-100 dark:border-slate-800/60">
                    "{record.comments}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
