import React, { useState } from 'react';
import { Sparkles, TrendingUp, ShieldCheck, Target, Zap, AlertTriangle, RefreshCw, BarChart2 } from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Customer360Profile, CustomerAIInsights } from '../../../types/customer360';

interface CustomerAIInsightsPanelProps {
  customer: Customer360Profile;
  insights: CustomerAIInsights | null;
  onRefreshInsights: () => Promise<void>;
}

export const CustomerAIInsightsPanel: React.FC<CustomerAIInsightsPanelProps> = ({
  customer,
  insights,
  onRefreshInsights,
}) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefreshInsights();
    setLoading(false);
  };

  if (!insights) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
        <h3 className="font-bold text-slate-200 text-sm">جاري إنشاء وتحليل استنتاجات الذكاء الاصطناعي...</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} isLoading={loading}>
          بدء التحليل الآن
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-950/60 via-slate-800 to-slate-900 border border-amber-500/40 rounded-xl">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>منصة استنتاجات الذكاء الاصطناعي المتقدمة (AI Customer Intelligence)</span>
          </h2>
          <p className="text-slate-300 text-xs">
            تحليل النماذج التنبؤية، التوصيات الذكية للنمو، وتقييم احتمالية الانقطاع وتوسيع المحفظة
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleRefresh}
          isLoading={loading}
          className="gap-2 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          إعادة إنشاء التحليل الحقيقي
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary & Health/Risk Analysis */}
        <Card className="bg-slate-800 border-slate-700 p-5 space-y-4">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 pb-2 border-b border-slate-700">
            <Zap className="w-4 h-4" />
            <span>الملخص التنفيذي وتقييم الحالة المباشرة</span>
          </h3>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-1.5 leading-relaxed text-slate-200">
            <span className="font-bold text-amber-300 block text-[11px]">الملخص الاستراتيجي للعميل:</span>
            <p>{insights.summary}</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block text-[11px]">تحليل مؤشر الصحة:</span>
              <p className="text-slate-300">{insights.healthAnalysis}</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
              <span className="font-bold text-blue-400 block text-[11px]">تحليل تقييم المخاطر:</span>
              <p className="text-slate-300">{insights.riskAnalysis}</p>
            </div>
          </div>
        </Card>

        {/* Growth & Upsell Opportunities */}
        <Card className="bg-slate-800 border-slate-700 p-5 space-y-4">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 pb-2 border-b border-slate-700">
            <Target className="w-4 h-4" />
            <span>فرص التوسع والبيع المتقاطع (Upsell & Cross-Sell)</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-2">
              <span className="font-bold text-amber-300 block text-[11px]">فرص ترقية الخدمات (Upsell Opportunities):</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                {insights.upsellOpportunities.map((op, idx) => (
                  <li key={idx} className="text-xs">{op}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-2">
              <span className="font-bold text-blue-300 block text-[11px]">البيع المتقاطع للخدمات اللوجستية (Cross-Sell):</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                {insights.crossSellOpportunities.map((op, idx) => (
                  <li key={idx} className="text-xs">{op}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Churn Prediction & Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700 p-5 space-y-3">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>توقع الاستمرارية والاحتفاظ (Retention & Churn Model)</span>
          </h3>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center">
            <span className="text-slate-300 font-medium">مستوى خطورة الانقطاع (Churn Risk):</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-bold font-mono">
              {insights.retentionPrediction.riskLevel} ({insights.retentionPrediction.probabilityOfChurnPct}%)
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-slate-300 block text-[11px]">استراتيجية المحافظة الموصى بها:</span>
            <p className="text-slate-200">{insights.retentionPrediction.retentionStrategy}</p>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-5 space-y-3">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>التوقعات المالية للربع القادم (Revenue Forecast)</span>
          </h3>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center">
            <span className="text-slate-300 font-medium">تقدير إيرادات الربع القادم:</span>
            <span className="font-mono font-extrabold text-emerald-400 text-sm">
              {insights.revenueForecast.nextQuarterEstimate.toLocaleString()} SAR
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-slate-300 block text-[11px]">نسبة الموثوقية والدقة:</span>
            <p className="text-slate-200 font-mono">
              {(insights.revenueForecast.confidenceScore * 100).toFixed(0)}% بناءً على أنماط الشحن التاريخية للفصول المماثلة.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
