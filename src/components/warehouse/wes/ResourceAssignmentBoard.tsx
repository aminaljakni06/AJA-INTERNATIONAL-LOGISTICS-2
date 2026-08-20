import React, { useState, useEffect } from 'react';
import { Users, Truck, Bot, CheckCircle2, Clock, Zap, Shield, Activity, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WarehouseResource } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const ResourceAssignmentBoard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [resources, setResources] = useState<WarehouseResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getWarehouseResources();
      setResources(data);
    } catch (err) {
      console.error('Error loading resources:', err);
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
            <Users className="w-6 h-6 text-indigo-600" />
            <span>{isAr ? 'لوحة توزيع الموارد البشرية والآليات (Resource & Workload Assignment)' : 'Resource & Workload Assignment Board'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'تخصيص المشغلين، الرافصات الشوكية Reach Trucks، روبوتات AMR، موازنة أحمال العمل والورديات' : 'Employee, Forklift, Reach Truck, AGV/AMR robot assignment and shift workload balancing'}
          </p>
        </div>

        <button
          onClick={loadResources}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث كفاءة الكادر والمعدات' : 'Refresh Resource Roster'}</span>
        </button>
      </div>

      {/* RESOURCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div key={res.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl">
                  {res.equipmentType === 'AMR_PALLET_MOVER' ? <Bot className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600">{res.resourceCode}</span>
                  <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">{res.resourceNameAr}</h3>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                res.status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {res.status}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-gray-100 dark:border-gray-700 py-3">
              <div className="flex justify-between">
                <span className="text-gray-500">{isAr ? 'المنطقة المخصصة Zone:' : 'Assigned Zone:'}</span>
                <strong className="text-indigo-600 font-mono">{res.assignedZoneCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isAr ? 'نوع المعدات Equipment:' : 'Equipment Type:'}</span>
                <strong className="text-gray-800 dark:text-gray-200">{res.equipmentType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isAr ? 'الوردية Shift:' : 'Shift:'}</span>
                <strong className="text-gray-800 dark:text-gray-200">{res.shiftNameAr}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-gray-400 text-[10px] block">{isAr ? 'مهام جارية الان' : 'Active Tasks'}</span>
                <strong className="text-lg font-black text-amber-600">{res.activeTasksCount}</strong>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-gray-400 text-[10px] block">{isAr ? 'مهام مكتملة اليوم' : 'Done Today'}</span>
                <strong className="text-lg font-black text-emerald-600">{res.completedTasksTodayCount}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
