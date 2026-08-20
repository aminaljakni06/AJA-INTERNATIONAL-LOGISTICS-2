import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface WorkflowStepProps {
  id?: string;
  stepNumber: number | string;
  title: string;
  description: string;
  icon?: LucideIcon;
  isActive?: boolean;
  className?: string;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  id,
  stepNumber,
  title,
  description,
  icon: Icon,
  isActive = false,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`bg-white p-5 rounded-2xl border shadow-sm text-center space-y-3 transition-all duration-200 ${
        isActive
          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
          : 'border-slate-200 hover:border-amber-300'
      } ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[#0F4C75] text-white font-bold text-sm flex items-center justify-center mx-auto shadow-sm">
        {Icon ? <Icon className="w-5 h-5 text-white" /> : stepNumber}
      </div>
      <h4 className="font-bold text-slate-900 text-sm">
        {title}
      </h4>
      <p className="text-xs text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
