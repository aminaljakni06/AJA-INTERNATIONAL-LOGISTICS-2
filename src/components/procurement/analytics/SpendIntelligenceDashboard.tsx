import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Filter,
  Download,
  Building2,
  Tag,
  MapPin,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Percent,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { SpendCubeData } from '../../../types/procurement';

interface SpendIntelligenceDashboardProps {
  spendData: SpendCubeData | null;
}

export const SpendIntelligenceDashboard: React.FC<SpendIntelligenceDashboardProps> = ({ spendData }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeDimension, setActiveDimension] = useState<'category' | 'supplier' | 'department' | 'region' | 'project' | 'bu'>('category');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  if (!spendData) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="inline-block p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 animate-pulse">
          <BarChart3 className="w-8 h-8" />
        </div>
        <p className="text-sm">{isAr ? 'جاري تحميل بيانات تحليلات الإنفاق...' : 'Loading Spend Intelligence Data...'}</p>
      </div>
    );
  }

  const formatSAR = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)}M SAR`;
    }
    return `${(val / 1000).toFixed(0)}K SAR`;
  };

  const getDimensionData = () => {
    switch (activeDimension) {
      case 'category':
        return spendData.categoryBreakdown;
      case 'supplier':
        return spendData.supplierBreakdown;
      case 'department':
        return spendData.departmentBreakdown;
      case 'region':
        return spendData.regionBreakdown;
      case 'project':
        return spendData.projectBreakdown;
      case 'bu':
        return spendData.buBreakdown;
      default:
        return spendData.categoryBreakdown;
    }
  };

  const currentBreakdown = getDimensionData();

  return (
    <div className="space-y-6">
      {/* HEADER & SUMMARY METRICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              ALBP-007.005
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'منصة ذكاء الإنفاق وتحليلات الشراء الاستراتيجية' : 'Spend Intelligence & Spend Analytics Platform'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تحليل شامل للإنفاق حسب الفئات، الموردين، الإدارات، المشاريع، والمناطق مع تتبع الوفورات والإنفاق غير المعتمد'
              : 'Comprehensive spend breakdown by Category, Vendor, Department, Project, and Region with savings & maverick spend tracking'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert(isAr ? 'جاري تصدير تقرير تحليلات الإنفاق...' : 'Exporting Spend Analytics Report...')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'تصدير التقرير (Excel/PDF)' : 'Export Analytics'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Spend */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'إجمالي الإنفاق (YTD)' : 'Total YTD Spend'}</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono mt-1">
              {formatSAR(spendData.totalSpendSAR)}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8.4% vs 2025</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Contracted Spend */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'إنفاق وتحت العقود' : 'Contracted Spend'}</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatSAR(spendData.contractedSpendSAR)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {((spendData.contractedSpendSAR / spendData.totalSpendSAR) * 100).toFixed(1)}% {isAr ? 'من الإنفاق' : 'of Total'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Maverick Spend */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'إنفاق خارج العقود (Maverick)' : 'Maverick Spend'}</p>
            <h3 className="text-2xl font-black text-rose-400 font-mono mt-1">
              {formatSAR(spendData.maverickSpendSAR)}
            </h3>
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{((spendData.maverickSpendSAR / spendData.totalSpendSAR) * 100).toFixed(1)}% {isAr ? 'مستهدف خفضه' : 'Target Reduction'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Realized Savings */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'الوفورات المحققة' : 'Realized Savings'}</p>
            <h3 className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {formatSAR(spendData.savingsSAR)}
            </h3>
            <p className="text-[11px] text-cyan-300 mt-1 font-mono">
              {((spendData.savingsSAR / spendData.totalSpendSAR) * 100).toFixed(1)}% {isAr ? 'وفورات تفاوض' : 'Negotiation Savings'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Tax (VAT) Paid */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'ضريبة القيمة المضافة VAT' : 'VAT Tax Paid'}</p>
            <h3 className="text-2xl font-black text-purple-400 font-mono mt-1">
              {formatSAR(spendData.taxSAR)}
            </h3>
            <p className="text-[11px] text-purple-300 mt-1 font-mono">15% ZATCA VAT</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* DIMENSION SELECTOR & BREAKDOWN CHART/TABLE */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'تحليل أبعاد الإنفاق' : 'Spend Dimension Breakdown'}
            </h2>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setActiveDimension('category')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeDimension === 'category'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isAr ? 'فئات الشراء' : 'Categories'}</span>
            </button>
            <button
              onClick={() => setActiveDimension('supplier')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeDimension === 'supplier'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'الموردين' : 'Suppliers'}</span>
            </button>
            <button
              onClick={() => setActiveDimension('department')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeDimension === 'department'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isAr ? 'الإدارات' : 'Departments'}</span>
            </button>
            <button
              onClick={() => setActiveDimension('region')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeDimension === 'region'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAr ? 'المناطق' : 'Regions'}</span>
            </button>
            <button
              onClick={() => setActiveDimension('project')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeDimension === 'project'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'المشاريع' : 'Projects'}</span>
            </button>
            <button
              onClick={() => setActiveDimension('bu')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeDimension === 'bu'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'وحدات الأعمال BU' : 'Business Units'}</span>
            </button>
          </div>
        </div>

        {/* VISUAL BARS & DETAIL LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Distribution Progress Bars */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isAr ? 'الوزن النسبي والتسلسل الهرمي للإنفاق' : 'Relative Weight & Hierarchy'}
            </h3>
            <div className="space-y-3">
              {currentBreakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({item.code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{formatSAR(item.spendSAR)}</span>
                      <span className="text-slate-400 text-[10px] font-mono">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(item.contractedSpendSAR / item.spendSAR) * 100}%` }}
                      title={`Contracted: ${formatSAR(item.contractedSpendSAR)}`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{ width: `${(item.maverickSpendSAR / item.spendSAR) * 100}%` }}
                      title={`Maverick: ${formatSAR(item.maverickSpendSAR)}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      {isAr ? 'تحت العقود: ' : 'Contracted: '}{formatSAR(item.contractedSpendSAR)}
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      {isAr ? 'خارج العقود: ' : 'Maverick: '}{formatSAR(item.maverickSpendSAR)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Data Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isAr ? 'جدول التفاصيل والوفورات المالي' : 'Financial Detail & Savings Matrix'}
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3">{isAr ? 'البعد / الاسم' : 'Dimension Name'}</th>
                    <th className="p-3 text-center">{isAr ? 'إجمالي الإنفاق' : 'Total Spend'}</th>
                    <th className="p-3 text-center">{isAr ? 'الوفورات' : 'Savings'}</th>
                    <th className="p-3 text-center">{isAr ? 'الضريبة VAT' : 'VAT Tax'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {currentBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-3 font-semibold text-white">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.itemCount} {isAr ? 'صنف / أمر' : 'items'}</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300">
                        {formatSAR(item.spendSAR)}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-400">
                        {formatSAR(item.savingsSAR)}
                      </td>
                      <td className="p-3 text-center font-mono text-purple-300">
                        {formatSAR(item.taxSAR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY SPEND TREND CHART */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'اتجاهات الإنفاق الشهري والميزانية المعتمدة' : 'Monthly Spend vs Budget Trend'}
            </h2>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            2026 YTD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-2">
          {spendData.monthlyTrends.map((monthData, idx) => {
            const isOver = monthData.spendSAR > monthData.budgetSAR;
            const pctOfBudget = (monthData.spendSAR / monthData.budgetSAR) * 100;
            return (
              <div key={idx} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2 text-center">
                <p className="text-xs font-bold text-slate-200">{monthData.month}</p>
                <p className="text-base font-black text-amber-400 font-mono">
                  {(monthData.spendSAR / 1000000).toFixed(2)}M
                </p>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pctOfBudget, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] flex items-center justify-between text-slate-400 pt-1 font-mono">
                  <span>{isAr ? 'الميزانية: ' : 'Budget: '}{(monthData.budgetSAR / 1000000).toFixed(1)}M</span>
                  <span className={isOver ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {pctOfBudget.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
