import React, { useEffect, useState } from 'react';
import {
  Award,
  TrendingUp,
  DollarSign,
  PieChart,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient, FPASnapshot } from '../../../services/fpaClient';

export const ExecutiveFPADashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [snapshot, setSnapshot] = useState<FPASnapshot | null>(null);

  useEffect(() => {
    void FPAClient.getSnapshot().then(setSnapshot);
  }, []);

  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل لوحة FP&A التنفيذية...' : 'Loading executive FP&A dashboard...'}
      </div>
    );
  }

  const { executiveKPIs: kpis, metrics } = snapshot;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'مقصورة الإدارة التنفيذية ومؤشرات الأداء المالي الرئيسي (C-Suite FP&A Cockpit)' : 'C-Suite Executive Financial Performance Cockpit & Board Scorecard'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'المؤشرات القياسية: الأرباح (EBITDA)، العائد على رأس المال (ROIC)، الميزانيات ونسب النمو' : 'Executive Scorecard: Revenue, EBITDA Margins, ROIC & Capital Efficiency'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'ملخص تحليلي متكامل لأعضاء مجلس الإدارة والإدارة التنفيذية للتحكم بالاستدامة المالية' : 'Executive level summary of financial performance, quarterly goals, and strategic capital allocation targets.'}
          </p>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-slate-400 font-bold">{isAr ? 'إجمالي الميزانية السنوية المعتمدة' : 'Master Approved Budget'}</div>
          <div className="text-2xl font-extrabold text-white">SAR {(metrics.masterBudgetTotalSAR / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-emerald-400">{isAr ? 'مقفلة بواسطة مجلس الإدارة' : 'Board Baseline Locked'}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-slate-400 font-bold">{isAr ? 'إجمالي المصروف الفعلي' : 'Total Actual Spent'}</div>
          <div className="text-2xl font-extrabold text-sky-400">SAR {(metrics.totalSpentSAR / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-400">{isAr ? 'معدل الحرق ضمن النطاق' : 'Burn rate within target'}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-slate-400 font-bold">{isAr ? 'المتبقي من الاعتمادات' : 'Remaining Budget Cap'}</div>
          <div className="text-2xl font-extrabold text-emerald-400">SAR {(metrics.remainingBudgetSAR / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-emerald-400">{isAr ? 'رصيد متاح للتطوير' : 'Available capacity'}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-slate-400 font-bold">{isAr ? 'متوسط هامش EBITDA' : 'Average EBITDA Margin'}</div>
          <div className="text-2xl font-extrabold text-sky-400">{metrics.avgEbitdaMarginPercent}%</div>
          <div className="text-[10px] text-emerald-400">+3.2% vs target</div>
        </div>
      </div>

      {/* KPI Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map(kpi => (
          <div key={kpi.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">{isAr ? kpi.kpiNameAr : kpi.kpiNameEn}</h3>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {kpi.status}
              </span>
            </div>

            <div className="flex items-end justify-between font-mono">
              <div>
                <div className="text-xs text-slate-400">{isAr ? 'القيمة الحالية:' : 'Current Metric:'}</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">
                  {kpi.unit === 'SAR' ? `SAR ${(kpi.currentValue / 1000000).toFixed(1)}M` : `${kpi.currentValue}%`}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">{isAr ? 'الهدف المستهدف:' : 'Target:'}</div>
                <div className="text-sm font-bold text-sky-400">
                  {kpi.unit === 'SAR' ? `SAR ${(kpi.targetValue / 1000000).toFixed(1)}M` : `${kpi.targetValue}%`}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'نسبة النمو السنوي (YoY Growth):' : 'YoY Growth Rate:'}</span>
              <span className="text-emerald-400 font-bold">+{kpi.yoyGrowthPercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
