import React, { useState, useEffect } from 'react';
import { Layers, TrendingUp, Navigation, RefreshCw, Sparkles, ArrowRightLeft, Boxes, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { DynamicSlottingProfile } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const DynamicSlottingCenter: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [profiles, setProfiles] = useState<DynamicSlottingProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getSlottingProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error loading slotting profiles:', err);
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
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>{isAr ? 'مركز التوزيع والتقسيم الديناميكي (Dynamic Slotting & ABC Velocity)' : 'Dynamic Slotting & ABC Velocity Center'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'تحليل معدل سحب البضائع (Velocity ABC)، وتقليل مسافات التنقل والتوصية بالـ Re-Slotting الآلي' : 'ABC Velocity Analysis, Travel Distance Optimization & Automatic Re-Slotting Recommendations'}
          </p>
        </div>

        <button
          onClick={loadProfiles}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'إعادة تشغيل خوارزمية التسكين' : 'Run Dynamic Slotting Algorithm'}</span>
        </button>
      </div>

      {/* ABC VELOCITY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{isAr ? 'فئة A (سريعة الحركة - Fast Movers)' : 'Class A Fast Movers'}</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100">80% <span className="text-xs font-normal text-gray-500">{isAr ? 'من طلبات الشحن' : 'of shipments'}</span></div>
          <p className="text-xs text-gray-500">{isAr ? 'توضع بالقرب من رصيف الشحن لتقليل مسافة المشي بنسبة 35%' : 'Placed closest to shipping docks for minimum pick time'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{isAr ? 'فئة B (متوسطة الحركة - Medium)' : 'Class B Medium Movers'}</span>
            <Boxes className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100">15% <span className="text-xs font-normal text-gray-500">{isAr ? 'من الحركات' : 'of movements'}</span></div>
          <p className="text-xs text-gray-500">{isAr ? 'تخزن في الممرات المتوسطة والرفوف الوسطى' : 'Stored in mid-aisle positions'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'فئة C (بطيئة الحركة - Slow)' : 'Class C Slow Movers'}</span>
            <Navigation className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100">5% <span className="text-xs font-normal text-gray-500">{isAr ? 'من الحركة' : 'of movements'}</span></div>
          <p className="text-xs text-gray-500">{isAr ? 'تخزن في الأرفف العليا أو الممرات الخلفية' : 'Stored in high shelves or deep aisles'}</p>
        </div>
      </div>

      {/* SLOTTING PROFILES TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center justify-between">
          <span>{isAr ? 'ملفات التسكين الديناميكي وتوصيات إعادة التوزيع (Re-Slotting Recommendations)' : 'Re-Slotting Recommendations'}</span>
          <span className="text-xs text-indigo-600 font-bold">{isAr ? 'تحديث تلقائي قائم على الطلب' : 'Demand-Driven Auto Reslot'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-3">رمز الصنف (SKU)</th>
                <th className="p-3">اسم المنتج والفئة</th>
                <th className="p-3">تصنيف السرعة Velocity</th>
                <th className="p-3">معدل الطلب اليومي</th>
                <th className="p-3">الرف الحالي</th>
                <th className="p-3">الرف المقترح الموصى به</th>
                <th className="p-3">مؤشر مسافة التنقل</th>
                <th className="p-3">توصية Re-Slotting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {profiles.map((prof) => (
                <tr key={prof.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono font-black text-indigo-600">{prof.skuCode}</td>
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                    <div>{prof.productNameAr}</div>
                    <span className="text-[10px] text-gray-400 font-normal">{prof.familyGroupCode}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      prof.velocityClass === 'FAST_A'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : prof.velocityClass === 'MEDIUM_B'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {prof.velocityClass}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-900 dark:text-gray-100 font-bold">
                    {prof.demandRatePerDay} {isAr ? 'وحدة/يوم' : 'units/day'}
                  </td>
                  <td className="p-3 font-mono text-slate-500">{prof.currentBinCode}</td>
                  <td className="p-3 font-mono font-black text-emerald-600">{prof.recommendedBinCode}</td>
                  <td className="p-3 font-mono text-indigo-600 font-bold">{prof.travelDistanceScoreMeters} م</td>
                  <td className="p-3">
                    {prof.reslottingRecommended ? (
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{isAr ? 'يوصى بنقل الرف' : 'Reslot Advised'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? 'الموقع مثالي' : 'Optimal Location'}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
