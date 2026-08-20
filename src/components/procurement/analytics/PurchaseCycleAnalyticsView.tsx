import React from 'react';
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  Zap,
  RotateCcw,
  BarChart3,
  CheckCheck,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { PurchaseCycleAnalytics } from '../../../types/procurement';

interface PurchaseCycleAnalyticsViewProps {
  analytics: PurchaseCycleAnalytics | null;
}

export const PurchaseCycleAnalyticsView: React.FC<PurchaseCycleAnalyticsViewProps> = ({ analytics }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-800">
        <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-spin" />
        <p>{isAr ? 'جاري تحميل تحليلات دورة الشراء ورشاقة العمليات...' : 'Loading Purchase Cycle Analytics...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              CYCLE TIME & AGILITY
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'منصة تحليلات زمن دورة الشراء ورشاقة المشتريات' : 'Purchase Cycle Analytics & Operational Agility'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تتبع زمن التحول من طلب الشراء PR إلى أمر الشراء PO، سرعة الموافقات، استجابة الموردين، ومعدل المطابقة الثلاثية'
              : 'End-to-end cycle times from PR generation, approval latency, vendor fulfillment, to 3-Way matching'}
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PR to PO Lead Time */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'زمن إجابة طلب الشراء (PR → PO)' : 'PR to PO Cycle Time'}</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono mt-1">
              {analytics.avgPRtoPOHours} hrs
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>34% Faster vs 2025</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* PO Approval Lead Time */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'زمن الاعتماد الإداري والمالي' : 'Approval Lead Time'}</p>
            <h3 className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {analytics.avgPOApprovalHours} hrs
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Multi-tier Workflow</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* 3-Way Match Rate */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'معدل المطابقة الثلاثية الآلية' : '3-Way Match Rate'}</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {analytics.threeWayMatchRatePct}%
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">High Automation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Fulfillment OTIF Rate */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'نسبة استيفاء التوريد OTIF' : 'Fulfillment Rate (OTIF)'}</p>
            <h3 className="text-2xl font-black text-purple-400 font-mono mt-1">
              {analytics.onTimeInFullFulfillmentPct}%
            </h3>
            <p className="text-[11px] text-purple-300 mt-1 font-mono">On Time In Full</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TREND COMPARISON BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'اتجاه التحسن في زمن دورة طلب الشراء (PR to PO)' : 'PR to PO Cycle Hours Reduction'}</span>
          </h2>

          <div className="space-y-3 pt-2">
            {analytics.prToPoCycleTrend.map((item, idx) => (
              <div key={idx} className="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-200">{item.month}</span>
                  <span className="font-mono font-bold text-amber-400">{item.hours} hrs</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${(item.hours / 30) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>{isAr ? 'اتجاه تسريع موافقات الاعتماد الإداري' : 'PO Approval Time Trend'}</span>
          </h2>

          <div className="space-y-3 pt-2">
            {analytics.poApprovalTrend.map((item, idx) => (
              <div key={idx} className="space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-200">{item.month}</span>
                  <span className="font-mono font-bold text-cyan-400">{item.hours} hrs</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${(item.hours / 15) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
