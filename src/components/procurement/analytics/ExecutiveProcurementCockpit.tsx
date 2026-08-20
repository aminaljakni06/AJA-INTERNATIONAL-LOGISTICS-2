import React, { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Award,
  FileCheck,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Download,
  Building2,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ExecutiveProcurementKPIs, SpendCubeData, AIProcurementIntelligenceData } from '../../../types/procurement';

interface ExecutiveProcurementCockpitProps {
  kpis: ExecutiveProcurementKPIs | null;
  spendCube: SpendCubeData | null;
  aiIntel: AIProcurementIntelligenceData | null;
}

export const ExecutiveProcurementCockpit: React.FC<ExecutiveProcurementCockpitProps> = ({ kpis, spendCube, aiIntel }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [reportType, setReportType] = useState<'EXECUTIVE' | 'BOARD' | 'STRATEGIC'>('EXECUTIVE');

  if (!kpis) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-800">
        <LayoutDashboard className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-pulse" />
        <p>{isAr ? 'جاري تحميل لوحة القيادة التنفيذية للمشتريات...' : 'Loading Executive Procurement Cockpit...'}</p>
      </div>
    );
  }

  const formatSAR = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M SAR`;
    return `${(val / 1000).toFixed(0)}K SAR`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER & REPORT SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              CFO & CPO COCKPIT
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'غرفة القيادة والتقارير التنفيذية للمشتريات' : 'Executive Procurement Cockpit & Board Center'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'مؤشرات الأداء العليا للرئيس التنفيذي CPO ومجلس الإدارة: عائد الاستثمار ROI، الوفورات المالية، وإدارة المخاطر'
              : 'High-level C-suite metrics: Procurement ROI, Spend Under Management, Savings Ratio, and Risk Footprint'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2"
          >
            <option value="EXECUTIVE">{isAr ? 'التقرير التنفيذي الشامل (Executive Summary)' : 'Executive Summary'}</option>
            <option value="BOARD">{isAr ? 'تقرير مجلس الإدارة (Board Presentation)' : 'Board Presentation'}</option>
            <option value="STRATEGIC">{isAr ? 'تقرير الاستراتيجية والوفورات (Strategic Savings)' : 'Strategic Savings Report'}</option>
          </select>

          <button
            onClick={() => alert(isAr ? 'جاري طباعة تقرير مجلس الإدارة...' : 'Printing Board Report...')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة تقرير الإدارة' : 'Print Board Report'}</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE HIGHLIGHT TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spend Under Management */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'الإنفاق المدار تحت الشراء المعتمد' : 'Spend Under Management'}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{formatSAR(kpis.spendUnderManagementSAR)}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis.spendUnderManagementPct}% {isAr ? 'من إجمالي الميزانية' : 'of Total Spend'}</span>
          </p>
        </div>

        {/* Procurement ROI Ratio */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'عائد استثمار قطاع المشتريات (ROI)' : 'Procurement ROI Ratio'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{kpis.procurementROIRatio}x</p>
          <p className="text-[11px] text-emerald-400 font-mono">
            {isAr ? 'كل 1 ر.س تشغيلي يحقق 8.4 ر.س وفورات' : '8.4x returns on operating cost'}
          </p>
        </div>

        {/* Cost Savings */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'إجمالي الوفورات المالية' : 'Total Financial Savings'}</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 font-mono">{formatSAR(kpis.totalSavingsSAR)}</p>
          <p className="text-[11px] text-cyan-300 font-mono">
            {kpis.costSavingsPct}% {isAr ? 'نسبة خفض التكاليف' : 'Cost Reduction Ratio'}
          </p>
        </div>

        {/* Contract Compliance */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'نسبة الامتثال التعاقدي' : 'Contract Compliance'}</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-mono">{kpis.contractCompliancePct}%</p>
          <p className="text-[11px] text-purple-300 font-mono">
            {kpis.activeSuppliersCount} {isAr ? 'مورد معتمد' : 'Active Approved Vendors'}
          </p>
        </div>
      </div>

      {/* BENCHMARK COMPARISON MATRIX */}
      {aiIntel?.benchmarkMetrics && (
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'مقارنة الأداء المعياري مع قطاع اللوجستيات (Industry Benchmarking)' : 'Industry Benchmark Comparisons'}</span>
            </h2>
            <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              AJA vs LOGISTICS SECTOR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {aiIntel.benchmarkMetrics.map((bm, idx) => (
              <div key={idx} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                <p className="text-xs font-bold text-slate-300 truncate">{bm.category}</p>
                <div className="flex items-baseline justify-between font-mono">
                  <div>
                    <p className="text-[10px] text-slate-400">AJA ERP</p>
                    <p className="text-lg font-black text-emerald-400">{bm.ajaMetric}{bm.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Benchmark</p>
                    <p className="text-sm font-bold text-slate-400">{bm.industryBenchmark}{bm.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXECUTIVE INSIGHTS BULLETS */}
      {aiIntel?.executiveInsights && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-500/30 space-y-3">
          <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'الملخص والتوصيات الاستراتيجية لمجلس الإدارة' : 'Executive Board Strategic Directives'}</span>
          </h2>

          <div className="space-y-2 text-xs text-slate-200">
            {aiIntel.executiveInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  #{idx + 1}
                </span>
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
