import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Radio,
  Thermometer,
  Sparkles,
  Building2,
  Maximize2,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  WarehouseLocation,
  WarehouseCapacityKPIs,
  AIWarehouseInsight
} from '../../../types/warehouse';
import { WarehouseClient } from '../../../services/warehouseClient';

export const ExecutiveWMSDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);
  const [kpis, setKpis] = useState<WarehouseCapacityKPIs | null>(null);
  const [insights, setInsights] = useState<AIWarehouseInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [whData, kpiData, aiData] = await Promise.all([
        WarehouseClient.getWarehouses(),
        WarehouseClient.getWarehouseCapacityKPIs(),
        WarehouseClient.getAIWarehouseInsights()
      ]);
      setWarehouses(whData);
      setKpis(kpiData);
      setInsights(aiData);
    } catch (err) {
      console.error('Error loading executive WMS dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-800">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">AJA Logistics • Executive Suite</div>
              <h1 className="text-2xl font-black">
                {isAr ? 'لوحة قيادة إدارة المستودعات التنفيذية (Executive WMS Cockpit)' : 'Executive WMS Performance & Analytics Cockpit'}
              </h1>
            </div>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl">
            {isAr ? 'نظرة شاملة لمراكز التوزيع والشبكة التخزينية الممتدة، استغلال المساحات، كفاءة التبريد المركزي والتنبؤات الذكية بـ AI' : 'Comprehensive performance analytics across national distribution centers, spatial capacity, cold chain monitoring and AI space intelligence.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-gray-400 font-bold block">{isAr ? 'نسبة الأشغال العامة' : 'Overall Utilization'}</span>
            <span className="text-2xl font-black text-amber-400">{kpis?.overallUtilizationPercent || 78.4}%</span>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
              <span>{isAr ? 'إجمالي مواضع الطبالي' : 'Total Pallet Bins'}</span>
              <Boxes className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {kpis.totalPalletPositions.toLocaleString()} <span className="text-xs font-normal text-gray-400">موقف</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{kpis.occupiedPalletPositions.toLocaleString()} طبلية مشغولة حالياً</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
              <span>{isAr ? 'المواضع المتاحة فوراً' : 'Immediately Available'}</span>
              <Maximize2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {kpis.availablePalletPositions.toLocaleString()} <span className="text-xs font-normal text-gray-400">شاغر</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">جاهزة لاستلام شحنات الموردين</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
              <span>{isAr ? 'استغلال التبريد المركزي' : 'Cold Chain Utilization'}</span>
              <Thermometer className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {kpis.coldStorageUtilizationPercent}%
            </div>
            <div className="text-[10px] text-cyan-600 font-bold">تتبع الحرارة بـ IoT لحظياً</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
              <span>{isAr ? 'دقة المسح بـ RFID' : 'RFID Scan Accuracy'}</span>
              <Radio className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {kpis.rfidScannedRatePercent}%
            </div>
            <div className="text-[10px] text-indigo-600 font-bold">بدون خطأ بشري في الفرز</div>
          </div>
        </div>
      )}

      {/* MAIN TWO COLUMN SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WAREHOUSE NETWORK CAPACITY HEATMAP */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>{isAr ? 'خريطة السعة التخزينية للمراكز اللوجستية' : 'Distribution Center Capacity Matrix'}</span>
              </h3>
              <p className="text-xs text-gray-500">{isAr ? 'مقارنة نسبة إشغال وطاقة التخزين بين مراكز الرياض، الدمام وجدة' : 'Capacity utilization across key hubs'}</p>
            </div>
          </div>

          <div className="space-y-4">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{wh.nameAr}</h4>
                    <span className="text-xs font-mono text-amber-600">{wh.code} • {wh.city}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-gray-900 dark:text-gray-100">{wh.occupiedCapacityPallets.toLocaleString()} / {wh.totalCapacityPallets.toLocaleString()}</span>
                    <span className="block text-[10px] text-gray-400 font-bold">طبلية مشغولة</span>
                  </div>
                </div>

                {/* CAPACITY BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-gray-500">معدل الاستغلال</span>
                    <span className="text-amber-600">{wh.utilizationPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${wh.utilizationPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI INSIGHTS & BOTTLENECK PREDICTIONS */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
          <div>
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>{isAr ? 'التوصيات والتنبؤات الذكية بـ AI' : 'AI Predictive Intelligence'}</span>
            </h3>
            <p className="text-xs text-gray-500">{isAr ? 'توصيات المساعد الذكي لتفادي الازدراد وتحسين إيداع الشحنات' : 'Real-time AI logistics optimization'}</p>
          </div>

          <div className="space-y-4">
            {insights.map((ins) => (
              <div key={ins.id} className="p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                    دقة {ins.confidencePercent}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">{ins.impactScore}</span>
                </div>

                <h4 className="font-extrabold text-xs text-gray-900 dark:text-gray-100">{ins.titleAr}</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-300">{ins.descriptionAr}</p>

                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{ins.recommendedActionAr}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
