import React from 'react';
import { WorkflowTask } from '../../types/workflow';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Clock, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';

interface Props {
  tasks: WorkflowTask[];
  onSelectTask?: (task: WorkflowTask) => void;
  className?: string;
}

export const WorkflowTaskWidget: React.FC<Props> = ({ tasks, onSelectTask, className = '' }) => {
  const { transitionWorkflow } = useWorkflow();
  const { user } = useAuth();

  const handleQuickComplete = async (e: React.MouseEvent, task: WorkflowTask) => {
    e.stopPropagation();
    try {
      await transitionWorkflow({
        instanceId: task.workflowInstanceId,
        action: 'APPROVE',
        userId: user?.id || 'sys_user',
        userName: user?.fullName || 'User',
        userRole: user?.role || 'STAFF',
        comments: 'Quick task approval from task widget',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'NORMAL':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div id="workflow-task-widget-container" className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Pending ERP Workflow Tasks ({tasks.length})
        </h3>
        <span className="text-xs text-slate-400">Assigned Tasks</span>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No pending workflow tasks assigned to you.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask && onSelectTask(task)}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.escalated && (
                    <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      ESCALATED
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px] font-mono">{task.templateCode}</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-1 truncate">{task.title}</h4>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1">
                  {task.assignedRole && (
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {task.assignedRole}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleQuickComplete(e, task)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded shadow-sm transition-colors shrink-0"
              >
                Approve
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
