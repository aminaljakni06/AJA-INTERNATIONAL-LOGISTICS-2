import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Clock,
  Sparkles,
  AlertTriangle,
  DollarSign,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { APAgingAnalytics, AIAPIntelligence } from '../../../types/procurement';

interface APAgingAnalyticsViewProps {
  apAging: APAgingAnalytics | null;
  apAiIntel: AIAPIntelligence | null;
  isAr: boolean;
}

export const APAgingAnalyticsView: React.FC<APAgingAnalyticsViewProps> = ({
  apAging,
  apAiIntel,
  isAr
}) => {
  if (!apAging) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/90 rounded-2xl border border-slate-800">
        {isAr ? 'جاري تحميل تحليلات الذمم المالية وتوقعات السيولة...' : 'Loading AP Aging & Cash Analytics...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'تحليلات أعمار الذمم والسيولة المالية (AP Aging & Cash Outflow Forecast)' : 'AP Aging & Cash Outflow Analytics'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'مراقبة هرم استحقاقات فواتير الموردين، وتوقعات التدفقات النقدية الخارجة، وتوصيات الذكاء الاصطناعي لإدارة رأس المال العامل'
              : 'Monitor aging buckets, 30-day cash outflow forecasts, and AI-driven working capital optimization'}
          </p>
        </div>

        {/* AGING BUCKETS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'غير مستحق (حالي)' : 'Not Due Yet'}</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {apAging.currentNotDueSAR.toLocaleString()} SAR
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-sky-500/30">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'مستحق (1-30 يوم)' : '1-30 Days'}</span>
            <span className="font-mono font-bold text-sky-300 text-sm">
              {apAging.aging1To30DaysSAR.toLocaleString()} SAR
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-indigo-500/30">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'مستحق (31-60 يوم)' : '31-60 Days'}</span>
            <span className="font-mono font-bold text-indigo-300 text-sm">
              {apAging.aging31To60DaysSAR.toLocaleString()} SAR
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'متأخر (61-90 يوم)' : '61-90 Days'}</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {apAging.aging61To90DaysSAR.toLocaleString()} SAR
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-rose-500/30">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'متأخر جداً (+90 يوم)' : 'Overdue 90+ Days'}</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {apAging.agingOver90DaysSAR.toLocaleString()} SAR
            </span>
          </div>
        </div>
      </div>

      {/* CASH OUTFLOW FORECAST CHART & AI RECOMMENDATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OUTFLOW FORECAST */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'توقعات التدفقات النقدية الخارجة (30 يوم قادمة)' : '30-Day Cash Outflow Forecast'}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <span className="text-slate-300">{isAr ? 'إجمالي التدفقات المتوقعة لـ 30 يوم:' : 'Predicted 30-Day Outflow:'}</span>
              <span className="font-mono font-bold text-rose-400 text-sm">
                {(apAiIntel?.predictedNext30DaysCashOutflowSAR || 4800000).toLocaleString()} SAR
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <span className="text-slate-300">{isAr ? 'متوسط دورة السداد:' : 'Avg Payment Cycle:'}</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {apAging.avgPaymentCycleDays} {isAr ? 'يوم' : 'Days'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <span className="text-slate-300">{isAr ? 'وفر الخصم المبكر المحقق:' : 'Early Payment Discount Savings:'}</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {apAging.earlyPaymentDiscountSavingsSAR.toLocaleString()} SAR
              </span>
            </div>
          </div>
        </div>

        {/* AI AP FINANCIAL INTELLIGENCE */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'رؤى الذكاء الاصطناعي للمالية والذمم (AI AP Intelligence)' : 'AI AP Financial Intelligence'}</span>
          </h3>

          {apAiIntel ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-300 block">{isAr ? 'فرص خصم السداد المبكر المتاحة:' : 'Early Payment Opportunities:'}</span>
                <div className="font-mono font-bold text-amber-400 text-xs">
                  {apAiIntel.earlyDiscountOpportunitiesSAR.toLocaleString()} SAR
                </div>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-sky-300 block">{isAr ? 'معدل المطابقة الثلاثية التلقائية:' : 'Auto 3-Way Match Rate:'}</span>
                <p className="text-slate-200 font-mono font-bold">{apAiIntel.autoMatched3WayPercentage}%</p>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-purple-300 block">{isAr ? 'توصيات الذكاء الاصطناعي:' : 'AI AP Recommendations:'}</span>
                <ul className="list-disc list-inside text-slate-200 space-y-0.5">
                  {apAiIntel.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs italic">{isAr ? 'جاري تحليل البيانات بواسطة Gemini AI...' : 'Analyzing AP metrics with Gemini AI...'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
