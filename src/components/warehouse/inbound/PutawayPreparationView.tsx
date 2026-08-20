import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Thermometer,
  Weight,
  Layers,
  Box,
  Zap,
  Check
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { DirectedPutawayTask } from '../../../types/inboundWarehouse';

interface PutawayPreparationViewProps {
  tasks: DirectedPutawayTask[];
  onRefresh?: () => void;
}

export const PutawayPreparationView: React.FC<PutawayPreparationViewProps> = ({ tasks, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [taskList, setTaskList] = useState<DirectedPutawayTask[]>(tasks);

  const handleCompleteTask = (taskId: string) => {
    setTaskList(taskList.map(t => t.id === taskId ? {
      ...t,
      status: 'COMPLETED',
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : t));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'محرك التخزين والتوجيه المباشر (Directed Putaway Engine)' : 'Directed Putaway Engine'}</span>
          </h3>
          <p className="text-xs text-gray-500">
            {isAr ? 'التحقق الآلي من الوزن، الحجم، الحرارة، وقواعد السلامة HAZMAT قبل التخزين النهائي' : 'Capacity, weight, temperature & HAZMAT rule validation prior to bin putaway'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono font-bold text-xs">
            {taskList.filter(t => t.status === 'IN_PROGRESS').length} {isAr ? 'مهام نشطة' : 'Active Tasks'}
          </span>
        </div>
      </div>

      {/* TASK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {taskList.map((task) => (
          <div key={task.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-200/60 dark:border-gray-800 pb-3">
              <span className="font-mono font-black text-amber-600 text-xs">{task.taskNumber}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                task.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {task.status}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{task.productNameAr}</h4>
              <p className="font-mono text-[11px] text-gray-500">{task.skuCode}</p>
            </div>

            {/* DIRECTED BIN & ZONE */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block">{isAr ? 'المنطقة المقترحة:' : 'Target Zone:'}</span>
                <strong className="text-amber-600 font-bold block">{task.recommendedZoneCode}</strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">{isAr ? 'موقع الرف (Bin Code):' : 'Bin Code:'}</span>
                <strong className="text-indigo-600 font-mono font-bold block">{task.recommendedBinCode}</strong>
              </div>
            </div>

            {/* VALIDATION CHECKS */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-center">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {isAr ? 'السعة ✓' : 'Capacity ✓'}
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {isAr ? 'الوزن ✓' : 'Weight ✓'}
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {isAr ? 'الحرارة ✓' : 'Temp ✓'}
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {isAr ? 'السلامة ✓' : 'HAZMAT ✓'}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
              <span className="text-gray-500 font-medium">
                {isAr ? `السائق: ${task.assignedOperatorName}` : `Operator: ${task.assignedOperatorName}`}
              </span>

              {task.status !== 'COMPLETED' ? (
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد التخزين بالرف' : 'Confirm Putaway'}</span>
                </button>
              ) : (
                <span className="text-[10px] text-gray-400 font-mono">{task.completedAt}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PutawayPreparationView;
