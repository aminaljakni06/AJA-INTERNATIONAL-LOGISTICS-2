import React from 'react';
import { WorkflowAISuggestion } from '../../types/workflow';
import { Bot, Sparkles, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  suggestion?: WorkflowAISuggestion;
  className?: string;
}

export const WorkflowAISuggestionBox: React.FC<Props> = ({ suggestion, className = '' }) => {
  if (!suggestion) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      case 'MEDIUM':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'LOW':
      default:
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div
      id="workflow-ai-suggestion-box"
      className={`bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
          <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>AI Decision & Risk Recommendation</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </div>
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getRiskColor(
            suggestion.riskScore
          )}`}
        >
          RISK: {suggestion.riskScore}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
          <span className="text-slate-500 text-[10px] block">Suggested Action</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            {suggestion.suggestion}
          </span>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
          <span className="text-slate-500 text-[10px] block">Confidence & Resolution</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            {Math.round(suggestion.confidenceScore * 100)}% ({suggestion.predictedResolutionMinutes}m)
          </span>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white/40 dark:bg-slate-900/40 p-2 rounded border border-indigo-100/60 dark:border-indigo-900/20">
        "{suggestion.rationale}"
      </p>
    </div>
  );
};
