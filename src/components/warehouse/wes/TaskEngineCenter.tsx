import React, { useState, useEffect } from 'react';
import { ListTodo, Zap, AlertCircle, Clock, CheckCircle2, RefreshCw, Plus, ArrowUpRight, Filter, Layers } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WarehouseTask, WESTaskType, WESTaskPriority, WESTaskStatus } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const TaskEngineCenter: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tasks, setTasks] = useState<WarehouseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getWarehouseTasks();
      setTasks(data);
    } catch (err) {
      console.error('Error loading warehouse tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedType !== 'ALL' && t.taskType !== selectedType) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-amber-600" />
            <span>{isAr ? 'مُحرك المهام والأوامر الميدانية (WES Task Engine)' : 'WES Task Engine & Dispatch Center'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'إدارة أوامر الإيداع، النقل، إعادة الإمداد، التجميع، الفحص وعد المخزون الدوري بالصلاحيات والأولويات' : 'Putaway, Move, Replenishment, Consolidation, Inspection, Cycle Count Task Management'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTasks}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all">
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء أمر عمل جديد' : 'Create WES Task'}</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {isAr ? 'نوع المهمة:' : 'Type:'}
          </span>
          {['ALL', 'PUTAWAY', 'REPLENISHMENT', 'MOVE', 'CYCLE_COUNT', 'CONSOLIDATION'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === type
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">{isAr ? 'الأولوية:' : 'Priority:'}</span>
          {['ALL', 'EMERGENCY', 'URGENT', 'NORMAL'].map((pri) => (
            <button
              key={pri}
              onClick={() => setSelectedPriority(pri)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPriority === pri
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* TASKS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100">
          {isAr ? 'طابور المهام النشطة وأوامر التوجيه Mapped Tasks' : 'Active Task Queue'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-3">رقم المهمة</th>
                <th className="p-3">نوع المهمة</th>
                <th className="p-3">الأولوية</th>
                <th className="p-3">المنتج والكمية</th>
                <th className="p-3">الموقع الحالي ← المستهدف</th>
                <th className="p-3">المعدّة / الموظف المعين</th>
                <th className="p-3">مسافة المشي المقدرة</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono font-black text-amber-600">{t.taskNumber}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {t.taskType}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      t.priority === 'EMERGENCY'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                        : t.priority === 'URGENT'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                    <div>{t.productNameAr} ({t.skuCode})</div>
                    <span className="text-[10px] text-amber-600 font-mono">{t.quantity} {t.unitOfMeasure}</span>
                  </td>
                  <td className="p-3 font-mono text-xs">
                    <span className="text-gray-400">{t.sourceLocationCode}</span>
                    <span className="mx-1 text-amber-600 font-bold">➔</span>
                    <span className="text-emerald-600 font-bold">{t.destinationLocationCode}</span>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                    {t.assignedResourceNameAr ? (
                      <div>
                        <div>{t.assignedResourceNameAr}</div>
                        <span className="text-[10px] text-gray-400 font-mono">{t.assignedEquipmentCode}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">{isAr ? 'بانتظار التعيين الآلي...' : 'Unassigned'}</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-indigo-600 font-bold">{t.estimatedTravelDistanceMeters}m</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${
                      t.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : t.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : t.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {t.status}
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
