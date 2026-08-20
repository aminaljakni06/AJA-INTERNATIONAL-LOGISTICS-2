import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Building2,
  PieChart,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  FixedAssetsReportingClient,
  FixedAssetsReportingSummaryMetrics,
} from '../../../services/fixedAssetsReportingClient';

export const ExecutiveCFODashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [metrics, setMetrics] = useState<FixedAssetsReportingSummaryMetrics | null>(null);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setMetrics(snapshot.metrics));
  }, []);

  if (!metrics) {
    return <div className="text-xs text-slate-400 font-mono">{isAr ? 'جاري تحميل مؤشرات الأصول المالية...' : 'Loading fixed assets financial metrics...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <PieChart className="w-4 h-4" />
            <span>{isAr ? 'لوحة قيادة الرئيس التنفيذي المالي (Executive CFO Cockpit & Financial Ratios)' : 'Executive CFO Cockpit — Fixed Assets, Capital Efficiency & Returns'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مؤشرات كفاءة رأس المال، العائد على الأصول (ROA)، الميزانية والسيولة' : 'Return on Assets (ROA), Capital Expenditure (CapEx), Net Asset Value & ROU Ratios'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'نظرة شاملة على الأصول الرأسمالية والديون التأجيرية ونسب الربحية وحقوق الملكية للشركة' : 'Real-time financial asset performance metrics, capital allocation analytics, and solvency metrics.'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'إجمالي الأصول الثابتة (Gross Cost)' : 'Gross Fixed Assets'}</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-extrabold text-white">SAR {(metrics.totalGrossCostSAR / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+8.4% YoY CapEx Growth</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'صافي القيمة الدفترية (Net Book Value)' : 'Net Book Value (NBV)'}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">SAR {(metrics.netBookValueSAR / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-400">Asset Depreciation Retention</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'التزامات عقود الإيجار (IFRS 16)' : 'IFRS 16 Lease Liabilities'}</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400">SAR {(metrics.totalLeaseLiabilitiesSAR / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-400">Long-term ROU obligations</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'نسبة الامتثال الفاتورة الإلكترونية' : 'ZATCA Compliance Rate'}</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400">{metrics.zatcaComplianceRatePercent}%</div>
          <div className="text-[10px] text-emerald-400">Phase 2 Audit Ready</div>
        </div>
      </div>
    </div>
  );
};
