import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  Brain,
  Target,
  BarChart,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AIProcurementIntelligenceData } from '../../../types/procurement';

interface AIProcurementIntelligenceCenterProps {
  aiData: AIProcurementIntelligenceData | null;
}

export const AIProcurementIntelligenceCenter: React.FC<AIProcurementIntelligenceCenterProps> = ({ aiData }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'savings' | 'risk' | 'forecast' | 'category'>('savings');

  if (!aiData) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-800">
        <Brain className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-pulse" />
        <p>{isAr ? 'جاري تشغيل محرك الذكاء الاصطناعي للمشتريات...' : 'Launching AI Procurement Intelligence Engine...'}</p>
      </div>
    );
  }

  const formatSAR = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M SAR`;
    return `${(val / 1000).toFixed(0)}K SAR`;
  };

  const runFreshAIAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AI INTEL ENGINE</span>
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مركز الذكاء الاصطناعي والتوصيات الذكية للمشتريات' : 'AI Procurement Intelligence & Optimization Center'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'محرك الذكاء الاصطناعي للتنبؤ بالمخاطر، كشف فرص الوفورات، التنبؤ بالطلب المستقبلي، وترشيد فئات الشراء'
              : 'AI-driven forecasting, risk predictions, savings opportunity discovery, and category optimization'}
          </p>
        </div>

        <button
          onClick={runFreshAIAnalysis}
          disabled={analyzing}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'إعادة تحليل البيانات الآن' : 'Re-Run AI Analytics')}</span>
        </button>
      </div>

      {/* AI INTELLIGENCE NAVIGATION TABS */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('savings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'savings'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>{isAr ? 'فرص التوفير الذكية (Savings)' : 'Savings Opportunities'}</span>
          <span className="px-1.5 py-0.5 text-[9px] bg-slate-950/30 rounded-md font-mono">
            {aiData.spendOptimizationOpportunities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'risk'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isAr ? 'التنبؤ بمخاطر الموردين (Risk)' : 'Risk Predictions'}</span>
          <span className="px-1.5 py-0.5 text-[9px] bg-slate-950/30 rounded-md font-mono">
            {aiData.supplierRiskPredictions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'forecast'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{isAr ? 'التنبؤ بالطلب والأسعار (Demand)' : 'Demand Forecast'}</span>
        </button>

        <button
          onClick={() => setActiveTab('category')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'category'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>{isAr ? 'تحسين فئات الشراء (Optimization)' : 'Category Optimization'}</span>
        </button>
      </div>

      {/* TAB 1: SAVINGS OPPORTUNITIES */}
      {activeTab === 'savings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiData.spendOptimizationOpportunities.map((opp) => (
              <div key={opp.id} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md font-mono">
                      {opp.impact} IMPACT
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{opp.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{opp.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{opp.recommendation}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{isAr ? 'الوفورات المتوقعة:' : 'Potential Savings:'}</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{formatSAR(opp.potentialSavingsSAR)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{isAr ? 'إطار التنفيذ:' : 'Timeframe:'}</span>
                    <span className="font-mono text-slate-300">{opp.implementationTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIER RISK PREDICTIONS */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiData.supplierRiskPredictions.map((risk, idx) => (
              <div key={idx} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{risk.vendorName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">AI Predicted Supply Chain Risk</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg font-mono">
                      {risk.probabilityPct}% Probability
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">{isAr ? 'عامل الخطر المكتشف:' : 'Risk Factor:'}</p>
                  <p className="text-xs text-slate-200">{risk.riskFactor}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">{isAr ? 'إستراتيجية التخفيف الموصى بها:' : 'Mitigation Strategy:'}</p>
                  <p className="text-xs text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
                    {risk.mitigationStrategy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEMAND FORECAST */}
      {activeTab === 'forecast' && (
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'التنبؤ بالإنفاق وتوجهات الأسعار المستقبلي (30 - 90 يوماً)' : '30-90 Days Category Demand & Price Forecast'}</span>
          </h2>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">{isAr ? 'الفئة' : 'Category'}</th>
                  <th className="p-3 text-center">{isAr ? 'الطلب المتوقع 30 يوماً' : '30-Day Demand'}</th>
                  <th className="p-3 text-center">{isAr ? 'الطلب المتوقع 90 يوماً' : '90-Day Demand'}</th>
                  <th className="p-3 text-center">{isAr ? 'تغير السعر المتوقع' : 'Price Trend'}</th>
                  <th className="p-3 text-center">{isAr ? 'ثقة النموذج' : 'Confidence'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {aiData.demandForecasts.map((fc, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3 font-bold text-white">{fc.category}</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-300">{formatSAR(fc.forecastedSpend30DaysSAR)}</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{formatSAR(fc.forecastedSpend90DaysSAR)}</td>
                    <td className={`p-3 text-center font-mono font-bold ${fc.expectedPriceTrendPct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {fc.expectedPriceTrendPct > 0 ? `+${fc.expectedPriceTrendPct}%` : `${fc.expectedPriceTrendPct}%`}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-cyan-400">{fc.confidencePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY OPTIMIZATION */}
      {activeTab === 'category' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiData.categoryOptimizations.map((cat, i) => (
            <div key={i} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{cat.category}</h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Benchmark: {cat.benchmarkComparisonPct > 0 ? `+${cat.benchmarkComparisonPct}%` : `${cat.benchmarkComparisonPct}%`}
                </span>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'الموردين الحاليين / الأمثل:' : 'Vendors Current / Optimal:'}</span>
                <span className="font-mono font-bold text-amber-400">{cat.currentVendorsCount} → {cat.optimalVendorsCount}</span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                {cat.strategy}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
