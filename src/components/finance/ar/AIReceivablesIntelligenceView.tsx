import React, { useEffect, useState } from 'react';
import {
  Zap,
  TrendingUp,
  ShieldAlert,
  Brain,
  CheckCircle2,
  Sparkles,
  UserCheck,
  DollarSign,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { AIReceivablesInsight } from '../../../types/accountsReceivable';

export const AIReceivablesIntelligenceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [insights, setInsights] = useState<AIReceivablesInsight[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(snapshot => setInsights(snapshot.aiInsights));
  }, []);

  const handleRefreshAI = () => {
    setAnalyzing(true);
    setTimeout(() => {
      void AccountsReceivableClient.getSnapshot()
        .then(snapshot => setInsights(snapshot.aiInsights))
        .finally(() => setAnalyzing(false));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Zap className="w-4 h-4" />
            <span>{isAr ? 'منظومة الذكاء الاصطناعي للمستحقات والتحصيل' : 'AI Receivables Predictive Intelligence Platform'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'التنبؤ بالسداد، تقييم المخاطر وتوصيات الائتمان الآلية' : 'AI Late Payment Predictor, Revenue Forecast & Credit Risk Optimizer'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'نماذج التعلم الآلي للتنبؤ بسلوكيات الدفع وتوصيات حظر الائتمان وتحسين التدفق النقدي' : 'Machine learning hooks predicting payment delay probability, auto-suggesting credit holds & cash inflows.'}
          </p>
        </div>

        <button
          onClick={handleRefreshAI}
          disabled={analyzing}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? (isAr ? 'جاري التحليل والتدقيق...' : 'Running Predictive AI...') : (isAr ? 'إعادة تشغيل النماذج التنبؤية' : 'Re-Run AI Intelligence Engine')}</span>
        </button>
      </div>

      {/* AI Customer Risk Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">SABIC Petrochemicals Co.</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              98% On-Time Prob
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {isAr ? 'نموذج التنبؤ يؤكد سداد جميع الفواتير الصادرة قبل تاريخ الاستحقاق بمعدل ثقة 96%.' : 'High probability of settling all future invoices before due date with 96% confidence.'}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-800/80 text-[11px] text-emerald-400 font-semibold border border-slate-700/80">
            💡 {isAr ? 'التوصية: زيادة الحد الائتماني بمقدار 2.5 مليون ريال' : 'Recommendation: Expand credit limit by SAR 2.5M'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Panda Retail Group KSA</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              91% On-Time Prob
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {isAr ? 'نمط السداد منتظم عبر الدفعات الجزئية مع التزام تام بالتحويل البنكي الأسبوعي.' : 'Consistent partial remittance pattern with weekly bank transfers.'}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-800/80 text-[11px] text-blue-300 font-semibold border border-slate-700/80">
            💡 {isAr ? 'التوصية: المحافظة على الترتيبات الحالية وتفعيل السحب الآلي' : 'Recommendation: Maintain auto-debit arrangements'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Almarai Logistics Division</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              84% Delay Risk
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {isAr ? 'النموذج يتوقع تأخراً إضافياً بـ 20 يوماً بسبب إجراءات التدقيق الداخلي للعميل.' : 'Model predicts 20+ extra days delay due to customer internal audit holds.'}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-800/80 text-[11px] text-rose-300 font-semibold border border-slate-700/80">
            💡 {isAr ? 'التوصية: تفعيل إيقاف الائتمان الآلي لحجوزات الأسطول' : 'Recommendation: Trigger credit hold on new fleet bookings'}
          </div>
        </div>
      </div>

      {/* AI Strategic Recommendations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'التوصيات المالية والاستراتيجية الصادرة من الذكاء الاصطناعي' : 'AI Strategic Finance & Risk Recommendations'}</span>
          </span>
        </h3>

        <div className="space-y-3">
          {insights.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-sky-500/30 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{isAr ? item.titleAr : item.titleEn}</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Confidence: {item.confidenceScore}%
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? item.descriptionAr : item.descriptionEn}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-slate-700/60">
                <span className="text-sky-400 font-semibold">
                  💡 Action: {isAr ? item.recommendedActionAr : item.recommendedActionEn}
                </span>
                <span className="text-emerald-400 font-bold">
                  Impact: SAR {item.impactSAR.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
