import React, { useEffect, useState } from 'react';
import {
  Zap,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Brain,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { AITreasuryInsight } from '../../../types/treasury';

export const AITreasuryIntelligenceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [insights, setInsights] = useState<AITreasuryInsight[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const loadInsights = async () => {
    const snapshot = await TreasuryClient.getSnapshot();
    setInsights(snapshot.aiInsights);
  };

  useEffect(() => {
    void loadInsights();
  }, []);

  const handleReanalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      void loadInsights().finally(() => setAnalyzing(false));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Zap className="w-4 h-4" />
            <span>{isAr ? 'منظومة الذكاء الاصطناعي للتنبؤ بالسيولة وتحسين العوائد' : 'AI Treasury Intelligence, Cash Forecasting & Yield Optimization Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تنبؤات خوارزمية بالسيولة، كشف المخاطر، واستراتيجيات التحوّط' : 'Algorithmic Liquidity Forecasting, Yield Enhancement & Auto-Matching Intelligence'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تحليل تدفقات الخزينة بالذكاء الاصطناعي، تقديم اقتراحات التوزيع الذكي، وتحليل المخاطر المصرفية' : 'Autonomous analysis of corporate cash reserves, AI auto-recon, and yield optimization alerts.'}
          </p>
        </div>

        <button
          onClick={handleReanalyze}
          disabled={analyzing}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50 font-mono"
        >
          <Brain className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? (isAr ? 'جاري التحليل...' : 'Analyzing Treasury...') : (isAr ? 'إعادة تحليل السيولة بالذكاء الاصطناعي' : 'Run AI Treasury Analysis')}</span>
        </button>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map(item => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between border-t-4 border-t-amber-400 font-mono"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.category}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  {item.confidenceScore}% Confidence
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">
                {isAr ? item.titleAr : item.titleEn}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr ? item.descriptionAr : item.descriptionEn}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{isAr ? 'الأثر المالي المباشر:' : 'Financial Impact:'}</span>
                <span className="text-emerald-400 font-extrabold">+SAR {item.impactSAR.toLocaleString()}</span>
              </div>

              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? item.recommendedActionAr : item.recommendedActionEn}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
