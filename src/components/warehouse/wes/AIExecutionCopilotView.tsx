import React, { useState } from 'react';
import { Sparkles, Navigation, Layers, Users, Zap, ShieldAlert, CheckCircle2, Bot } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AIWESOptimizationResult } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const AIExecutionCopilotView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [skuCode, setSkuCode] = useState('SKU-PHARM-2201');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIWESOptimizationResult | null>(null);

  const handleRunAiOptimize = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      const result = await WarehouseExecutionClient.optimizeExecution({
        warehouseId: 'WH-RUH-01',
        skuCode: skuCode,
        itemCategoryAr: 'مستلزمات طبية وأدوية مبردة عالية الحساسية',
        isTemperatureSensitive: true,
        weightKg: 450,
        volumeCbm: 1.8
      });
      setAiResult(result);
    } catch (err) {
      console.error('Error running AI WES optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span>{isAr ? 'مساعد الذكاء الاصطناعي لإدارة وتوجيه التنفيذ (AI WES Execution Intelligence)' : 'AI WES Execution Copilot'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'توصيات الخانات المثالية Optimal Bin، توجيه المسار اللحظي، التنبؤ بازدحام الممرات وتحسين أولوية المهام بـ Gemini' : 'Optimal Bin Recommendation, Congestion Prediction, Travel Path & Task Prioritization via Gemini AI'}
          </p>
        </div>

        <button
          onClick={handleRunAiOptimize}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? (isAr ? 'جاري التحليل والتحسين...' : 'Optimizing Execution...') : (isAr ? 'توليد خطة التنفيذ بـ AI' : 'Run WES AI Copilot')}</span>
        </button>
      </div>

      {/* INPUT CONTROLLER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">{isAr ? 'مدخلات تحليل الذكاء الاصطناعي للشحنة والمرور' : 'WES AI Optimization Inputs'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{isAr ? 'كود الشحنة / الصنف Target SKU' : 'Target SKU Code'}</label>
            <input
              type="text"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{isAr ? 'المستودع المستهدف Warehouse' : 'Target Warehouse'}</label>
            <input
              type="text"
              value="WH-RUH-01 (مستودع الرياض المركزي)"
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunAiOptimize}
              disabled={loading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>{isAr ? 'تحليل التوصية المثالية' : 'Analyze Optimal Deposit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI RESULT DISPLAY */}
      {aiResult && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-sm">
              <Sparkles className="w-5 h-5" />
              <span>{isAr ? 'توصيات ومخرجات محرك الذكاء الاصطناعي للتنفيذ WES AI' : 'WES AI Execution Recommendations'}</span>
            </div>
            <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-extrabold shadow">
              Confidence {aiResult.aiConfidencePercent}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-1">
              <span className="text-[10px] text-gray-400 block font-bold">{isAr ? 'الرف الموصى به Optimal Bin' : 'Optimal Bin'}</span>
              <strong className="text-xl font-mono font-black text-indigo-600">{aiResult.recommendedBinCode}</strong>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-1">
              <span className="text-[10px] text-gray-400 block font-bold">{isAr ? 'خطر الازدحام بالممر Congestion' : 'Congestion Risk'}</span>
              <strong className="text-lg font-black text-emerald-600">{aiResult.congestionRiskLevel} RISK</strong>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-1">
              <span className="text-[10px] text-gray-400 block font-bold">{isAr ? 'توقعات الاستثناءات والأخطاء' : 'Predicted Exceptions'}</span>
              <strong className="text-lg font-black text-emerald-600">{aiResult.predictedExceptionsCount} Incidents</strong>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-2">
              <h4 className="font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'مسار التنقل الأقصر والأمثل (Travel Path Optimization):' : 'Optimal Travel Path:'}</span>
              </h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {aiResult.optimalTravelPathAr.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-2">
              <h4 className="font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'توجيه العمالة والمعدات المناسبة (Labor Advice):' : 'Labor Allocation Advice:'}</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 font-bold">{aiResult.laborDistributionAdviceAr}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
