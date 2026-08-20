import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Layers,
  CheckCircle2,
  RefreshCw,
  Cpu,
  BarChart3,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WarehouseLocation, AIWarehouseSpaceResult, AIWarehouseInsight } from '../../../types/warehouse';
import { WarehouseClient } from '../../../services/warehouseClient';

export const AIWarehouseIntelligenceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [insights, setInsights] = useState<AIWarehouseInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Custom AI Optimization Form
  const [skuCode, setSkuCode] = useState<string>('SKU-PHARMA-8809');
  const [itemCategory, setItemCategory] = useState<string>('مستلزمات وأنسولين طبية مبردة');
  const [isTempSensitive, setIsTempSensitive] = useState<boolean>(true);
  const [palletCount, setPalletCount] = useState<number>(120);

  const [aiRunning, setAiRunning] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIWarehouseSpaceResult | null>(null);

  useEffect(() => {
    loadAiData();
  }, []);

  const loadAiData = async () => {
    setLoading(true);
    try {
      const [whData, insData] = await Promise.all([
        WarehouseClient.getWarehouses(),
        WarehouseClient.getAIWarehouseInsights()
      ]);
      setWarehouses(whData);
      setInsights(insData);
      if (whData.length > 0) setSelectedWarehouseId(whData[0].id);
    } catch (err) {
      console.error('Error loading AI warehouse intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiOptimize = async () => {
    if (!selectedWarehouseId) return;
    setAiRunning(true);
    setAiResult(null);
    try {
      const result = await WarehouseClient.optimizeSpace({
        warehouseId: selectedWarehouseId,
        skuCode,
        itemCategoryAr: itemCategory,
        isTemperatureSensitive: isTempSensitive,
        palletCount
      });
      setAiResult(result);
    } catch (err) {
      console.error('Error triggering AI warehouse space optimizer:', err);
    } finally {
      setAiRunning(false);
    }
  };

  const selectedWh = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              {isAr ? 'منظومة الذكاء الاصطناعي لتخطيط وتحسين المستودعات (AI WMS Intelligence Engine)' : 'AI Warehouse Layout & Space Intelligence'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'توليد توصيات الإيداع Putaway، تنبؤات السعة والتحكم في الازدراد باستخدام نماذج Gemini اللوجستية' : 'Gemini-powered spatial optimization, automated putaway recommendations and congestion prediction'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Gemini AI WMS Active</span>
          </span>
        </div>
      </div>

      {/* INPUT FORM FOR SIMULATION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
        <div>
          <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span>{isAr ? 'محاكاة أمر إيداع وحساب أنسب مكان تخزين (Putaway Optimizer Simulator)' : 'Interactive Putaway Recommendation Simulator'}</span>
          </h3>
          <p className="text-xs text-gray-500">{isAr ? 'أدخل معلومات الشحنة لتحليل أنسب ممر ورف وخانة مبردة أو جافة تلقائياً' : 'Input incoming shipment details to calculate optimal bin and aisle placement'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">{isAr ? 'المستودع المستهدف:' : 'Target Warehouse:'}</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.nameAr} ({w.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">{isAr ? 'كود الصنف SKU:' : 'SKU Code:'}</label>
            <input
              type="text"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">{isAr ? 'فئة المنتج:' : 'Category:'}</label>
            <input
              type="text"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">{isAr ? 'عدد الطبالي Pallets:' : 'Pallet Count:'}</label>
            <input
              type="number"
              value={palletCount}
              onChange={(e) => setPalletCount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isTempSensitive}
              onChange={(e) => setIsTempSensitive(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span>{isAr ? 'يتطلب تبريد وحفظ تحت درجة حرارة مراقبة' : 'Requires Cold Storage (-20°C to +4°C)'}</span>
          </label>

          <button
            onClick={handleRunAiOptimize}
            disabled={aiRunning}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${aiRunning ? 'animate-spin' : ''}`} />
            <span>{aiRunning ? 'جاري التحليل واستدعاء Gemini...' : 'تشغيل تحسين التخزين بـ AI'}</span>
          </button>
        </div>

        {/* RESULT BOX */}
        {aiResult && (
          <div className="p-6 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">معدل تحسين المساحة المقترح</span>
                <span className="text-2xl font-black text-indigo-600">{aiResult.spaceOptimizationScorePercent}%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold block">المنطقة والخانة الموصى بها</span>
                <span className="text-sm font-black text-gray-900 dark:text-gray-100">{aiResult.recommendedPutawayZoneAr} — <span className="text-indigo-600 font-mono">{aiResult.recommendedPutawayBinAr}</span></span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-indigo-100 dark:border-indigo-900/40">
              <p className="font-bold text-gray-900 dark:text-gray-100">خطوات التنفيذ الموصى بها:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                {aiResult.actionableSpaceRecommendationsAr.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* REUSABLE AI INSIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((ins) => (
          <div key={ins.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {ins.category}
              </span>
              <span className="text-xs font-bold text-emerald-600">{ins.impactScore}</span>
            </div>

            <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{ins.titleAr}</h3>
            <p className="text-xs text-gray-500">{ins.descriptionAr}</p>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs font-bold text-indigo-600">
              <span>{ins.recommendedActionAr}</span>
              <span>دقة {ins.confidencePercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
