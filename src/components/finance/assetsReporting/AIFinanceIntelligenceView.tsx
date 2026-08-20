import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Brain,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { AIFinanceAssetInsight } from '../../../types/fixedAssetsReporting';

export const AIFinanceIntelligenceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [insights, setInsights] = useState<AIFinanceAssetInsight[]>([]);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setInsights(snapshot.aiInsights));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Brain className="w-4 h-4" />
            <span>{isAr ? 'محرك الذكاء الاصطناعي للأصول والتحليل المالي (AI Financial Asset Intelligence Hub)' : 'AI Financial Asset Intelligence & Impairment Prediction Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تنبؤات العمر الافتراضي، تحسين الضرائب، كشف هبوط القيمة ومخاطر الفوترة' : 'Asset Useful Life Predictions, Tax Optimization & ZATCA Audit Risk Prevention'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'خوارزميات ذكية توفّر توصيات عملية لتحسين التدفقات النقدية والالتزام الضريبي التام' : 'Machine learning routines identifying depreciation policy shifts, lease liability savings, and tax risks.'}
          </p>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="space-y-4">
        {insights.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-sky-400 uppercase">{item.category}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {item.confidencePercent}% AI Confidence
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{isAr ? item.titleAr : item.titleEn}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{isAr ? item.descriptionAr : item.descriptionEn}</p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="text-emerald-400 font-extrabold">
                {isAr ? 'الأثر المالي المتوقع:' : 'Estimated Financial Impact:'} SAR {item.estimatedImpactSAR.toLocaleString()}
              </div>

              <button className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{isAr ? item.actionRequiredAr : item.actionRequiredEn}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
