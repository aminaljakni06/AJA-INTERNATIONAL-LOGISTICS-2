import React, { useState } from 'react';
import {
  Truck,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Zap,
  Building2,
  X,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { DockAppointment, DockStatus } from '../../../types/inboundWarehouse';

interface DockSchedulingViewProps {
  docks: DockAppointment[];
  onRefresh?: () => void;
}

export const DockSchedulingView: React.FC<DockSchedulingViewProps> = ({ docks, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [dockList, setDockList] = useState<DockAppointment[]>(docks);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // New Booking State
  const [dockGate, setDockGate] = useState('Dock Gate Alpha-03');
  const [supplier, setSupplier] = useState('شركة المورد المتقدم للصناعات الطبية');
  const [carrier, setCarrier] = useState('AJA Express Reefer Fleet');
  const [slot, setSlot] = useState('2026-08-05 12:00 - 13:30');
  const [truckType, setTruckType] = useState('مقطورة تبريد 40 قدم');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'EXPRESS'>('HIGH');

  const handleBookDock = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: DockAppointment = {
      id: `DOCK-${Date.now()}`,
      dockNumber: dockGate,
      warehouseId: 'WH-RUH-01',
      supplierNameAr: supplier,
      carrierNameAr: carrier,
      scheduledTimeSlot: slot,
      arrivalTimeWindow: '12:00',
      departureTimeWindow: '13:15',
      loadingBayNameAr: 'الممر 03 - بوابات التبريد',
      priorityLevel: priority,
      truckType: truckType,
      status: 'RESERVED',
      dockUtilizationPercent: 85
    };

    setDockList([newAppointment, ...dockList]);
    setShowBookingModal(false);
  };

  const getStatusBadge = (status: DockStatus) => {
    switch (status) {
      case 'OCCUPIED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{isAr ? 'مشغول حالياً (Unloading)' : 'Occupied'}</span>;
      case 'RESERVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{isAr ? 'محجوز (Reserved)' : 'Reserved'}</span>;
      case 'RELEASED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{isAr ? 'متاح للخدمة' : 'Released'}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'جدولة ومصفوفة الأرصفة بـ WMS (Dock Calendar & Gate Matrix)' : 'Dock Scheduling & Gate Matrix'}</span>
          </h3>
          <p className="text-xs text-gray-500">
            {isAr ? 'حجز المواعيد، تخصيص ممرات الإنزال وتتبع نسبة استغلال الأرصفة' : 'Appointment booking, loading bay allocation & dock utilization metrics'}
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'حجز موعد رصيف جديد' : 'Book Dock Appointment'}</span>
        </button>
      </div>

      {/* DOCK UTILIZATION KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-gray-400 font-bold block">{isAr ? 'إجمالي الأرصفة المتاحة' : 'Total Dock Gates'}</span>
          <div className="text-xl font-black text-amber-600">12 <span className="text-xs font-normal text-gray-500">{isAr ? 'رصيف محدد' : 'Gates'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-gray-400 font-bold block">{isAr ? 'نسبة استغلال الأرصفة' : 'Dock Utilization'}</span>
          <div className="text-xl font-black text-emerald-600">88.5% <span className="text-xs font-normal text-gray-500">{isAr ? 'سعة مستغلة' : 'Efficiency'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-gray-400 font-bold block">{isAr ? 'متوسط وقت تفريغ المقطورة' : 'Avg Unload Duration'}</span>
          <div className="text-xl font-black text-indigo-600">35 <span className="text-xs font-normal text-gray-500">{isAr ? 'دقيقة/شاحنة' : 'min/truck'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-gray-400 font-bold block">{isAr ? 'الشاحنات بالانتظار (Yard)' : 'Yard Waiting Queue'}</span>
          <div className="text-xl font-black text-blue-600">2 <span className="text-xs font-normal text-gray-500">{isAr ? 'شاحنات جاهزة' : 'Trucks'}</span></div>
        </div>
      </div>

      {/* DOCK APPOINTMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dockList.map((dock) => (
          <div
            key={dock.id}
            className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-center border-b border-gray-200/60 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl font-mono font-black text-xs">
                  {dock.dockNumber}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {dock.loadingBayNameAr || (isAr ? 'الممر الرئيسي 01' : 'Main Bay 01')}
                </span>
              </div>
              {getStatusBadge(dock.status)}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">{isAr ? 'المورد:' : 'Supplier:'}</span>
                <strong className="text-gray-900 dark:text-gray-100">{dock.supplierNameAr}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">{isAr ? 'الناقل والشاحنة:' : 'Carrier:'}</span>
                <strong className="text-gray-800 dark:text-gray-200">{dock.carrierNameAr} ({dock.truckType})</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">{isAr ? 'الفترة الزمنية المحجوزة:' : 'Time Slot:'}</span>
                <strong className="text-indigo-600 font-mono font-bold">{dock.scheduledTimeSlot}</strong>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500">{isAr ? 'مستوى الأولوية:' : 'Priority:'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {dock.priorityLevel || 'EXPRESS'}
                </span>
              </div>
            </div>

            {/* PROGRESS BAR FOR OCCUPIED DOCK */}
            {dock.status === 'OCCUPIED' && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  <span>{isAr ? 'تقدم عملية الإنزال ومطابقة الـ Barcode' : 'Unloading Progress'}</span>
                  <span className="text-amber-600">75%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                {isAr ? 'حجز موعد رصيف استلام جديد' : 'Book Dock Appointment'}
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookDock} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'الرصيف المطلوب (Dock Gate)' : 'Dock Gate'}</label>
                <select
                  value={dockGate}
                  onChange={(e) => setDockGate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold outline-none"
                >
                  <option value="Dock Gate Alpha-01">Dock Gate Alpha-01 (مبرد)</option>
                  <option value="Dock Gate Alpha-02">Dock Gate Alpha-02 (مبرد)</option>
                  <option value="Dock Gate Alpha-03">Dock Gate Alpha-03 (جاف وسريع)</option>
                  <option value="Dock Gate Bravo-01">Dock Gate Bravo-01 (مواد كيميائية HAZMAT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'اسم المورد' : 'Supplier Name'}</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'الفترة الزمنية المحجوزة' : 'Scheduled Time Slot'}</label>
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'نوع الشاحنة' : 'Truck Type'}</label>
                  <input
                    type="text"
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'الأولوية' : 'Priority'}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold outline-none"
                  >
                    <option value="NORMAL">{isAr ? 'عادية (Normal)' : 'Normal'}</option>
                    <option value="HIGH">{isAr ? 'عالية (High)' : 'High'}</option>
                    <option value="EXPRESS">{isAr ? 'سريعة جداً (Express)' : 'Express'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow"
                >
                  {isAr ? 'تأكيد وحجز الرصيف' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DockSchedulingView;
