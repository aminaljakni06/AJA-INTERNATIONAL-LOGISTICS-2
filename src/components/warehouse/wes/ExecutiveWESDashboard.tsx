import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Navigation, Users, Truck, CheckCircle2, Zap, ArrowDownRight, BarChart3, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WESPerformanceKPIs } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const ExecutiveWESDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [kpis, setKpis] = useState<WESPerformanceKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getWESPerformanceKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Error loading WES KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <span>{isAr ? 'لوحة القيادة التنفيذية لمُحرك تنفيذ المستودعات (Executive WES Dashboard)' : 'Executive WES Performance Dashboard'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'مؤشرات الأداء الرئيسية لسرعة الإيداع Putaway Time، مسافة المشي، إنتاجية العمالة وكفاءة المعدات' : 'Putaway Speed, Travel Distance, Labor Productivity & Equipment Utilization Metrics'}
          </p>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>{isAr ? 'متوسط زمن الإيداع Putaway Time' : 'Avg Putaway Time'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">{kpis.avgPutawayTimeMins} <span className="text-xs font-normal text-gray-500">{isAr ? 'دقيقة' : 'mins'}</span></div>
          <div className="text-[10px] text-emerald-600 font-bold">{isAr ? 'تحسن بنسبة 18% مقارنة بالشهر السابق' : '18% faster than last month'}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>{isAr ? 'إجمالي مسافات المشي اليوم' : 'Travel Distance Today'}</span>
            <Navigation className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">{kpis.totalTravelDistanceKmToday} <span className="text-xs font-normal text-gray-500">كم</span></div>
          <div className="text-[10px] text-indigo-600 font-bold">{isAr ? 'تقليل المسار بفضل Dynamic Slotting' : 'Path optimized via AI'}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>{isAr ? 'إنتاجية العامل بالساعة' : 'Worker Productivity'}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{kpis.workerProductivityTasksPerHour} <span className="text-xs font-normal text-gray-500">{isAr ? 'مهمة/ساعة' : 'tasks/hr'}</span></div>
          <div className="text-[10px] text-emerald-600 font-bold">{isAr ? 'فوق المعدل المستهدف' : 'Above target milestone'}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>{isAr ? 'معدل استغلال المعدات' : 'Equipment Utilization'}</span>
            <Truck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-cyan-600">{kpis.equipmentUtilizationPercent}%</div>
          <div className="text-[10px] text-cyan-600 font-bold">{isAr ? 'تشغيل مكثف مع صيانة وقائية' : 'Optimal fleet workload'}</div>
        </div>
      </div>

      {/* SECONDARY KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
          <span className="text-xs font-bold text-gray-500">{isAr ? 'نسبة إنجاز المهام Task Completion' : 'Task Completion Rate'}</span>
          <div className="text-3xl font-black text-emerald-600">{kpis.taskCompletionRatePercent}%</div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpis.taskCompletionRatePercent}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
          <span className="text-xs font-bold text-gray-500">{isAr ? 'كفاءة التغذية Replenishment' : 'Replenishment Efficiency'}</span>
          <div className="text-3xl font-black text-amber-600">{kpis.replenishmentEfficiencyPercent}%</div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${kpis.replenishmentEfficiencyPercent}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
          <span className="text-xs font-bold text-gray-500">{isAr ? 'إنتاجية المستودع بالساعة Throughput' : 'Hourly Throughput'}</span>
          <div className="text-3xl font-black text-indigo-600">{kpis.hourlyWarehouseThroughputPallets} <span className="text-xs font-normal text-gray-500">{isAr ? 'طبلية/ساعة' : 'pallets/hr'}</span></div>
          <p className="text-[10px] text-gray-400">{isAr ? 'معدل قياسي في مواسم الذروة' : 'Peak operational throughput'}</p>
        </div>
      </div>
    </div>
  );
};
