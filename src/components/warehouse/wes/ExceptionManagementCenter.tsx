import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Clock, ShieldAlert, Thermometer, Flame, RefreshCw, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WarehouseException } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const ExceptionManagementCenter: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [exceptions, setExceptions] = useState<WarehouseException[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExceptions();
  }, []);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getWarehouseExceptions();
      setExceptions(data);
    } catch (err) {
      console.error('Error loading exceptions:', err);
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
            <AlertOctagon className="w-6 h-6 text-red-600" />
            <span>{isAr ? 'مركز معالجة الاستثناءات والأعطال الميدانية (WES Exception Center)' : 'WES Exception & Resolution Management'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'معالجة بلاغات الخانات الممتلئة، المغلقة، الأرفف التالفة، تنبيهات الحرارة وتعارض المواد الخطرة' : 'Location Full, Blocked, Damaged Bin, Temperature Alerts & Hazmat Conflicts Resolution'}
          </p>
        </div>

        <button
          onClick={loadExceptions}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث قائمة الاستثناءات' : 'Refresh Incident Feed'}</span>
        </button>
      </div>

      {/* EXCEPTIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exceptions.map((exp) => (
          <div key={exp.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-red-600">{exp.exceptionNumber}</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                exp.severity === 'CRITICAL'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {exp.severity}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {exp.exceptionType}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">{exp.locationCode}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-2">{exp.descriptionAr}</p>
            </div>

            {exp.resolutionNotesAr && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'إجراء المعالجة والإغلاق:' : 'Resolution Notes:'}</span>
                </div>
                <p>{exp.resolutionNotesAr}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
              <span>{isAr ? 'وقت البلاغ:' : 'Reported:'} {exp.reportedAt}</span>
              <span className={`font-bold ${exp.status === 'RESOLVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {exp.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
