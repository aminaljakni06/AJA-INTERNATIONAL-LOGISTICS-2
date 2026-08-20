import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

export interface MetricCardProps {
  id?: string;
  title: string;
  value?: string | number;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  description,
  icon: Icon,
  iconBgColor = 'bg-amber-100 text-amber-800',
  className = '',
}) => {
  return (
    <Card id={id} className={`text-center space-y-3 p-6 border-slate-200 hover:shadow-md transition-shadow ${className}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${iconBgColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      {value && (
        <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
          {value}
        </div>
      )}
      <h3 className="font-bold text-slate-900 text-base">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </Card>
  );
};
