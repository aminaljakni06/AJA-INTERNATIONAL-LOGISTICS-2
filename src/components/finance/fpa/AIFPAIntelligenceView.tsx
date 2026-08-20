import React, { useEffect, useState } from 'react';
import {
  Brain,
  Zap,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { AIFPAInsight } from '../../../types/fpa';

export const AIFPAIntelligenceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [insights, setInsights] = useState<AIFPAInsight[]>([]);

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => setInsights(snapshot.aiInsights));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Brain className="w-4 h-4" />
            <span>{isAr ? 'مركز الذكاء الاصطناعي للميزانيات والتوقعات التنبؤية (AI Financial Intelligence)' : 'AI Financial Planning, Cost Optimization & Predictive Budget Intelligence'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'توصيات الخوارزميات، اكتشاف المخاطر، والفرص التوفيرية للميزانية' : 'Machine Learning Recommendations, Cost Savings & Financial Risk Mitigation'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'خوارزميات تعلّم الآلة لتحليل انحراف النفقات، تحسين العائد الاستثماري (IRR) والتنبؤ بالسيولة' : 'Automated AI hooks analyzing budget variances, capital investment efficiency, and cost optimizations.'}
          </p>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{isAr ? item.titleAr : item.titleEn}</h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-400">{isAr ? 'درجة الثقة:' : 'Confidence:'}</div>
                <div className="text-sm font-bold text-emerald-400">{item.confidenceScore}%</div>
              </div>
            </div>

            <p className="text-xs text-slate-300">{isAr ? item.descriptionAr : item.descriptionEn}</p>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isAr ? 'الأثر المالي المباشر:' : 'Estimated Financial Impact:'}</span>
                <span className="text-emerald-400 font-bold">SAR {(item.impactSAR / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700/60 pt-2">
                <span className="text-slate-400">{isAr ? 'الإجراء المقترح:' : 'Recommended Action:'}</span>
                <span className="text-sky-400 font-bold">{isAr ? item.recommendedActionAr : item.recommendedActionEn}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
