import React from 'react';
import { WorkflowState } from '../../types/workflow';

interface Props {
  state: WorkflowState;
  className?: string;
}

export const WorkflowStatusBadge: React.FC<Props> = ({ state, className = '' }) => {
  const getStyle = (st: WorkflowState) => {
    switch (st?.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'WAITING':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'DRAFT':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800';
    }
  };

  return (
    <span
      id={`badge-wf-state-${state.toLowerCase()}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(
        state
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {state.replace('_', ' ')}
    </span>
  );
};
