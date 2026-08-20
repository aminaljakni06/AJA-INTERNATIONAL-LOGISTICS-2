import React, { useState } from 'react';
import { WorkflowInstance } from '../../types/workflow';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, XCircle, Send, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  instance: WorkflowInstance;
  onSuccess?: () => void;
  className?: string;
}

export const WorkflowApprovalCard: React.FC<Props> = ({ instance, onSuccess, className = '' }) => {
  const { transitionWorkflow } = useWorkflow();
  const { user } = useAuth();
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    try {
      setSubmitting(true);
      setError(null);

      await transitionWorkflow({
        instanceId: instance.id,
        action,
        userId: user?.id || 'sys_user',
        userName: user?.fullName || 'User',
        userRole: user?.role || 'STAFF',
        comments: comments || (action === 'APPROVE' ? 'Approved step' : 'Rejected step'),
      });

      setComments('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit approval action');
    } finally {
      setSubmitting(false);
    }
  };

  if (instance.status !== 'ACTIVE') {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-500 text-center">
        Workflow is currently <span className="font-semibold">{instance.status}</span>. No pending action required.
      </div>
    );
  }

  return (
    <div id="workflow-approval-card" className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${className}`}>
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-amber-500" />
        Approval Decision Panel
      </h4>

      {error && (
        <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="wf-comment-input" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Comments / Decision Notes (Optional)
          </label>
          <textarea
            id="wf-comment-input"
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add justification or approval notes..."
            className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            id="btn-wf-approve"
            type="button"
            disabled={submitting}
            onClick={() => handleAction('APPROVE')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Step
          </button>
          <button
            id="btn-wf-reject"
            type="button"
            disabled={submitting}
            onClick={() => handleAction('REJECT')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject Step
          </button>
        </div>
      </div>
    </div>
  );
};
