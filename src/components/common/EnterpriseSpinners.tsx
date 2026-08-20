/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Spinner & Overlay System
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Loading Experience
 * Version: 1.0
 */

import React from 'react';
import { Loader2, Sparkles, Cpu, RefreshCw } from 'lucide-react';
import { AILoadingStage } from '../../types/loading';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'white';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-14 h-14 border-4',
};

const variantClasses = {
  cyan: 'border-[#00F0FF]/20 border-t-[#00F0FF]',
  emerald: 'border-emerald-500/20 border-t-emerald-500',
  amber: 'border-amber-500/20 border-t-amber-500',
  rose: 'border-rose-500/20 border-t-rose-500',
  indigo: 'border-indigo-500/20 border-t-indigo-500',
  white: 'border-white/20 border-t-white',
};

export const EnterpriseSpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'cyan',
  className = '',
  label = 'Loading...',
}) => {
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div
        className={`rounded-full animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export const ButtonLoadingSpinner: React.FC<{ labelEn?: string; labelAr?: string; isAr?: boolean }> = ({
  labelEn = 'Processing...',
  labelAr = 'جاري المعالجة...',
  isAr = false,
}) => (
  <span className="inline-flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin text-current" />
    <span>{isAr ? labelAr : labelEn}</span>
  </span>
);

export const AILoadingIndicator: React.FC<{ stage?: AILoadingStage; isAr?: boolean }> = ({
  stage = 'PROCESSING',
  isAr = false,
}) => {
  const stageLabelsEn: Record<AILoadingStage, string> = {
    THINKING: 'AI Agent Analyzing Query & Context...',
    PROCESSING: 'Executing Algorithmic Optimization...',
    STREAMING: 'Streaming Intelligent Logistics Pipeline...',
    GENERATING: 'Synthesizing Enterprise Output...',
    COMPLETED: 'AI Operations Completed',
    FAILED: 'AI Processing Error',
  };

  const stageLabelsAr: Record<AILoadingStage, string> = {
    THINKING: 'جارٍ تحليل السياق واستعلام الذكاء الاصطناعي...',
    PROCESSING: 'جارٍ تنفيذ الخوارزميات وتحسين المسارات...',
    STREAMING: 'جارٍ دفق نتائج خطة اللوجستيات...',
    GENERATING: 'جارٍ توليد التقارير وتوليف البيانات...',
    COMPLETED: 'اكتملت عملية الذكاء الاصطناعي بنجاح',
    FAILED: 'حدث خطأ أثناء معالجة الذكاء الاصطناعي',
  };

  return (
    <div
      role="status"
      className="p-4 rounded-2xl bg-slate-900/80 border border-[#00F0FF]/30 backdrop-blur-md flex items-center gap-4 shadow-xl shadow-[#00F0FF]/5"
    >
      <div className="relative p-3 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 animate-pulse">
        <Sparkles className="w-5 h-5 animate-spin text-[#00F0FF]" style={{ animationDuration: '4s' }} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded">
            AJA AI Engine
          </span>
          <Cpu className="w-3.5 h-3.5 text-[#00F0FF]/70 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-white">
          {isAr ? stageLabelsAr[stage] : stageLabelsEn[stage]}
        </p>
      </div>
    </div>
  );
};

export const FullScreenLoadingOverlay: React.FC<{ messageEn?: string; messageAr?: string; isAr?: boolean }> = ({
  messageEn = 'Loading enterprise system data...',
  messageAr = 'جاري تحميل بيانات النظام المؤسسي...',
  isAr = false,
}) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Loading"
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-lg p-6 space-y-4"
  >
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-[#00F0FF]/20 border-t-[#00F0FF] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-mono font-bold text-[#00F0FF]">AJA</span>
      </div>
    </div>
    <div className="text-center space-y-1 max-w-sm">
      <h4 className="text-sm font-bold text-white tracking-wide">
        {isAr ? messageAr : messageEn}
      </h4>
      <p className="text-[11px] text-slate-400 font-mono">
        AJA International Logistics Enterprise Platform
      </p>
    </div>
  </div>
);

export const SectionLoadingOverlay: React.FC<{ messageEn?: string; messageAr?: string; isAr?: boolean }> = ({
  messageEn = 'Refreshing content...',
  messageAr = 'جاري تحديث المحتوى...',
  isAr = false,
}) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs rounded-2xl p-4 transition-all duration-300">
    <div className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-3 shadow-xl">
      <Loader2 className="w-5 h-5 animate-spin text-[#00F0FF]" />
      <span className="text-xs font-semibold text-slate-200">
        {isAr ? messageAr : messageEn}
      </span>
    </div>
  </div>
);
