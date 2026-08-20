import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  ShieldCheck,
  Building2,
  Wrench
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WarehouseShift, WarehouseLocation } from '../../../types/warehouse';
import { WarehouseClient } from '../../../services/warehouseClient';

export const WarehouseOperationsView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [shifts, setShifts] = useState<WarehouseShift[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadOpsData();
  }, []);

  const loadOpsData = async () => {
    setLoading(true);
    try {
      const [shiftData, whData] = await Promise.all([
        WarehouseClient.getWarehouseShifts(),
        WarehouseClient.getWarehouses()
      ]);
      setShifts(shiftData);
      setWarehouses(whData);
    } catch (err) {
      console.error('Error loading ops shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              {isAr ? 'منظومة عمليات التشغيل والورديات (Warehouse Operations & Shifts)' : 'Operations, Shifts & Operational Calendar'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'إدارة ورديات العمل، فتح وإغلاق المستودعات، جداول الصيانة الدورية وطواقم التشغيل' : 'Manage shift schedules, operational calendar, opening/closing controls and maintenance windows'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'الورديات نشطة 24/7' : '24/7 Ops Active'}</span>
          </span>
        </div>
      </div>

      {/* OPERATIONS SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>إجمالي الكادر والعمالة المخصصة</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-600">92 موظف</span>
          </div>
          <p className="text-xs text-gray-500">توزيع عمالة الاستلام، التخزين، الانتقاء، ومشغلي الـ Forklift على الورديات.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>المستودعات التشغيلية النشطة</span>
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600">3 مراكز</span>
          </div>
          <p className="text-xs text-gray-500">الرياض والدمام وجدة تعمل بكامل الطاقة الاستيعابية والأنظمة الذكية.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-600" />
              <span>فترات الصيانة الوقائية</span>
            </h3>
            <span className="text-xs font-mono font-bold text-purple-600">ليلي 22:00</span>
          </div>
          <p className="text-xs text-gray-500">فحص السيور الآلية، أجهزة RFID، والروبوتات في نافذة الصيانة الليلية.</p>
        </div>
      </div>

      {/* SHIFTS SCHEDULE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span>جدول الورديات النشطة اليوم (Active Daily Shifts)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map((s) => {
            const wh = warehouses.find(w => w.id === s.warehouseId);
            return (
              <div key={s.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-gray-900 dark:text-gray-100">{s.shiftNameAr}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>التوقيت التشغيلي:</span>
                    <strong className="font-mono text-amber-600">{s.startTime} - {s.endTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>مشرف الوردية:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{s.supervisorName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد العمالة المخصصة:</span>
                    <strong className="text-indigo-600">{s.assignedWorkersCount} موظف</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>المستودع:</span>
                    <strong className="text-gray-700 dark:text-gray-300">{wh ? wh.nameAr : s.warehouseId}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
