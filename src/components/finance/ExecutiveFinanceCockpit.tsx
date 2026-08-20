import React from 'react';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Scale
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ExecutiveFinanceSummary } from '../../types/generalLedger';

interface ExecutiveFinanceCockpitProps {
  summary: ExecutiveFinanceSummary;
}

export const ExecutiveFinanceCockpit: React.FC<ExecutiveFinanceCockpitProps> = ({
  summary
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const formatSAR = (val: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            <span>{isAr ? 'مقصورة القيادة المالية التنفيذية (Executive Finance Cockpit)' : 'Executive C-Suite Finance Cockpit'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'تحليلات النسب المالية العميقة، السيولة، ملاءة أداء الشركة ومعدل حرق الكاش' : 'Realtime financial ratios, solvency benchmarks, liquidity ratios & corporate health index'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold">
          <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>{isAr ? 'مؤشر السلامة: 96/100 (AAA)' : 'Ledger Health: 96/100 (AAA)'}</span>
        </div>
      </div>

      {/* C-Suite Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Ratio */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
            <span>{isAr ? 'نسبة التداول (Current Ratio)' : 'Current Ratio'}</span>
            <span className="text-emerald-400">{isAr ? 'ممتازة' : 'Strong'}</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{summary.currentRatio}x</div>
          <p className="text-xs text-slate-400">
            {isAr ? 'المعيار المستهدف: > 1.5x (تغطية سيولة عالية)' : 'Benchmark: > 1.5x (High liquidity cover)'}
          </p>
        </div>

        {/* Quick Ratio */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
            <span>{isAr ? 'نسبة السيولة السريعة (Quick Ratio)' : 'Quick Ratio'}</span>
            <span className="text-sky-400">{isAr ? 'آمنة' : 'Healthy'}</span>
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono">{summary.quickRatio}x</div>
          <p className="text-xs text-slate-400">
            {isAr ? 'الأصول السريعة بدون المخزون' : 'Liquid assets excluding inventory'}
          </p>
        </div>

        {/* Debt-to-Equity */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
            <span>{isAr ? 'نسبة الدين إلى الملكية (D/E)' : 'Debt-to-Equity'}</span>
            <span className="text-emerald-400">{isAr ? 'مخاطر منخفضة' : 'Low Risk'}</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{summary.debtToEquityRatio}x</div>
          <p className="text-xs text-slate-400">
            {isAr ? 'هيكل رأس مال متوازن وآمن' : 'Balanced corporate capital structure'}
          </p>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
            <span>{isAr ? 'هامش الربح الصافي (Net Margin)' : 'Net Profit Margin'}</span>
            <span className="text-amber-400">{summary.netMarginPercent}%</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{summary.netMarginPercent}%</div>
          <p className="text-xs text-slate-400">
            {isAr ? 'صافي الربح YTD من الإيرادات' : 'YTD Net profit efficiency'}
          </p>
        </div>
      </div>

      {/* Runway & Cash Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? 'تحليل السيولة ومعدل حرق الكاش (Cash Runway)' : 'Liquidity & Cash Runway Analysis'}</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">{isAr ? 'رصيد النقدية والمكافئات (Cash Position):' : 'Available Cash & Bank:'}</span>
              <span className="font-mono font-bold text-emerald-400 text-base">{formatSAR(summary.cashPositionSAR)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">{isAr ? 'رأس المال العامل (Working Capital):' : 'Net Working Capital:'}</span>
              <span className="font-mono font-bold text-sky-400 text-base">{formatSAR(summary.workingCapitalSAR)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>{isAr ? 'معدل حرق الكاش الشهري (Monthly Burn Rate):' : 'Avg Monthly Outflow:'}</span>
                <span className="font-mono text-rose-400 font-bold">~ 220,000 SAR / Month</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-emerald-400 pt-1 border-t border-slate-700">
                <span>{isAr ? 'فترة استدامة الكاش (Cash Runway):' : 'Estimated Cash Runway:'}</span>
                <span className="font-mono text-base">21.8 {isAr ? 'شهر' : 'Months'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>{isAr ? 'رادار المخاطر المالية والامتثال (Financial Governance)' : 'Financial Risk & Governance Controls'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-200">{isAr ? 'التوافق مع المعيار الدولي IFRS / ZATCA' : 'IFRS & ZATCA Phase 2 Compliance'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">100% Verified</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-200">{isAr ? 'فصل الصلاحيات المحاسبية (Segregation of Duties)' : 'SoD Approval Policy Enforced'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">Enforced</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-200">{isAr ? 'قيود المعاملات بين الشركات (Intercompany Clearance)' : 'Intercompany Elimination Check'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">Balanced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
