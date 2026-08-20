import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  AlertTriangle,
  Zap,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AISalesInsightsResponse } from '../../types/sales';

interface AISalesCopilotPanelProps {
  onFetchAIInsights: () => Promise<AISalesInsightsResponse>;
}

export const AISalesCopilotPanel: React.FC<AISalesCopilotPanelProps> = ({ onFetchAIInsights }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AISalesInsightsResponse | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const res = await onFetchAIInsights();
      setInsights(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-sky-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/20 rounded-xl border border-sky-500/40 text-sky-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <span>مساعد المبيعات الذكي (Gemini AI Sales Copilot)</span>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                Gemini 2.5 Flash
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              تحليل مباشر لأنبوب المبيعات، حساب احتمالية الفوز بالصفقات، وتحديد إجراءات الإغلاق المثالية
            </p>
          </div>
        </div>

        <Button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-[#EA580C] to-amber-600 hover:opacity-90 text-white font-bold px-4 py-2 flex items-center gap-2 shadow-md shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'جاري التحليل المباشر...' : 'تشغيل التحليل الذكي'}</span>
        </Button>
      </div>

      {/* Initial State / Insights Content */}
      {!insights && !loading && (
        <Card className="p-8 text-center bg-slate-900/80 border border-slate-700/80 space-y-3">
          <Sparkles className="w-10 h-10 text-sky-400 mx-auto opacity-60" />
          <h4 className="font-bold text-slate-200 text-sm">اضغط على "تشغيل التحليل الذكي" لاستخلاص التوصيات</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            سيقوم المحرك بتحليل بيانات العروض الفنية، تقييم درجات العوامل اللوجستية، وتوجيه ممثلي المبيعات بالخطوة التالية.
          </p>
        </Card>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <Card className="p-5 bg-slate-900/90 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>الملخص التحليلي للأنبوب البيعي</span>
              </h4>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                مؤشر صحة الأنبوب: {insights.pipelineHealthScore}%
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
              {insights.summary}
            </p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">التوقع المالي المباشر للربع القادم:</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                {insights.revenueForecastNextQuarter.toLocaleString()} SAR
              </span>
            </div>
          </Card>

          {/* Grid of Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Next Best Actions */}
            <Card className="p-5 bg-slate-900/90 border border-slate-700/80 space-y-3">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>أفضل الإجراءات القادمة (Next Best Actions)</span>
              </h4>

              <div className="space-y-2.5">
                {insights.nextBestActions.map((act, i) => (
                  <div key={i} className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">{act.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          act.priority === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {act.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{act.description}</p>
                    <span className="text-[11px] text-sky-400 font-semibold block pt-1">
                      الجهة المستهدفة: {act.targetEntity}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Alerts */}
            <Card className="p-5 bg-slate-900/90 border border-slate-700/80 space-y-3">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>تنبيهات المخاطر وحماية الصفقات (Risk Alerts)</span>
              </h4>

              <div className="space-y-2.5">
                {insights.pipelineRiskAlerts.map((risk, i) => (
                  <div key={i} className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-200">{risk.opportunityName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        مخاطر {risk.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong className="text-rose-400">خطة التخفيف:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
