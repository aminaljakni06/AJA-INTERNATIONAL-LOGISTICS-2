import React, { useState, useEffect } from 'react';
import { ArrowDownRight, Zap, AlertTriangle, RefreshCw, Layers, CheckCircle2, Plus } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ReplenishmentTask } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const ReplenishmentCenter: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [replenishments, setReplenishments] = useState<ReplenishmentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReplenishments();
  }, []);

  const loadReplenishments = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getReplenishmentTasks();
      setReplenishments(data);
    } catch (err) {
      console.error('Error loading replenishments:', err);
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
            <ArrowDownRight className="w-6 h-6 text-amber-600" />
            <span>{isAr ? 'منظومة إعادة التغذية والإمداد التلقائي (Replenishment Engine)' : 'Replenishment & Min/Max Trigger Engine'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'إعادة الإمداد الآلي لمواقع الالتقاط Forward Picking من مستودعات التخزين الضخم Bulk Storage وفق حدود Min/Max' : 'Forward Picking, Bulk, Emergency & Min/Max Inventory Replenishment Workflows'}
          </p>
        </div>

        <button
          onClick={loadReplenishments}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'فحص مستويات المخزون والحد الأدنى' : 'Check Stock Thresholds'}</span>
        </button>
      </div>

      {/* REPLENISHMENTS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100">
          {isAr ? 'أوامر إعادة التغذية النشطة بطلب الإمداد' : 'Triggered Replenishment Orders'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-3">رقم الأمر</th>
                <th className="p-3">نوع الإمداد</th>
                <th className="p-3">المنتج والرمز</th>
                <th className="p-3">رف الالتقاط Picking Bin</th>
                <th className="p-3">رف التخزين Bulk Reserve</th>
                <th className="p-3">الرصيد الحرج / الحد الأدنى</th>
                <th className="p-3">الكمية المطلوبة للإمداد</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {replenishments.map((rep) => (
                <tr key={rep.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono font-black text-amber-600">{rep.replenishmentNumber}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                      rep.type === 'EMERGENCY'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {rep.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                    <div>{rep.productNameAr}</div>
                    <span className="text-[10px] text-gray-400 font-mono">{rep.skuCode}</span>
                  </td>
                  <td className="p-3 font-mono text-emerald-600 font-bold">{rep.pickingBinCode}</td>
                  <td className="p-3 font-mono text-slate-500">{rep.bulkReserveBinCode}</td>
                  <td className="p-3 font-mono">
                    <span className="text-red-600 font-bold">{rep.currentQuantityInPickingBin}</span> / <span className="text-gray-400">{rep.minThresholdQuantity} Min</span>
                  </td>
                  <td className="p-3 font-mono font-black text-amber-600">+{rep.requestedReplenishQuantity} unit</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {rep.status}
                    </span>
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
