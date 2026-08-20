import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Cpu, Loader2, Power, Trash2 } from 'lucide-react';
import { EquipmentRecord, DriverResourceRecord } from '../../../types/productResourceMaster';
import { ProductResourceMasterClient as ProductResourceMasterService } from '../../../services/productResourceMasterClient';
import { useEnterpriseConfirmation } from '../../../hooks/useEnterpriseConfirmation';
import { useEnterpriseToast } from '../../../hooks/useEnterpriseToast';

export const EquipmentManager: React.FC = () => {
  const { language } = useLanguage();
  const { confirmAction } = useEnterpriseConfirmation();
  const { toastSuccess, toastError } = useEnterpriseToast();
  const isAr = language === 'ar';

  const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
  const [drivers, setDrivers] = useState<DriverResourceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'EQUIPMENT' | 'DRIVERS'>('EQUIPMENT');
  const [busyResourceId, setBusyResourceId] = useState<string | null>(null);

  const loadData = async () => {
    const eList = await ProductResourceMasterService.getEquipment();
    const dList = await ProductResourceMasterService.getDrivers();
    setEquipment(eList);
    setDrivers(dList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleEquipmentStatus = async (item: EquipmentRecord) => {
    const busyKey = `equipment:${item.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const nextOperationalStatus = nextStatus === 'ACTIVE' ? 'OPERATIONAL' : 'DECOMMISSIONED';
      await ProductResourceMasterService.updateEquipment(item.id, {
        status: nextStatus,
        operationalStatus: nextOperationalStatus
      });
      toastSuccess('Equipment status updated', 'تم تحديث حالة المعدة', `${item.equipmentCode}: ${nextStatus}`, `${item.equipmentCode}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update equipment status';
      toastError('Equipment status failed', 'فشل تحديث حالة المعدة', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteEquipment = async (item: EquipmentRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete equipment',
      titleAr: 'حذف المعدة',
      messageEn: `Delete equipment ${item.equipmentCode}? This action cannot be undone.`,
      messageAr: `هل تريد حذف المعدة ${item.equipmentCode}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`equipment:${item.id}`);
        try {
          await ProductResourceMasterService.deleteEquipment(item.id);
          toastSuccess('Equipment deleted', 'تم حذف المعدة', item.equipmentCode, item.equipmentCode);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete equipment';
          toastError('Equipment delete failed', 'فشل حذف المعدة', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  const handleToggleDriverStatus = async (driver: DriverResourceRecord) => {
    const busyKey = `driver:${driver.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = driver.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const nextAvailability = nextStatus === 'ACTIVE' ? 'AVAILABLE' : 'OFF_DUTY';
      await ProductResourceMasterService.updateDriver(driver.id, {
        status: nextStatus,
        availabilityStatus: nextAvailability
      });
      toastSuccess('Driver status updated', 'تم تحديث حالة السائق', `${driver.driverCode}: ${nextStatus}`, `${driver.driverCode}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update driver status';
      toastError('Driver status failed', 'فشل تحديث حالة السائق', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteDriver = async (driver: DriverResourceRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete driver',
      titleAr: 'حذف السائق',
      messageEn: `Delete driver ${driver.driverCode}? This action cannot be undone.`,
      messageAr: `هل تريد حذف السائق ${driver.driverCode}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`driver:${driver.id}`);
        try {
          await ProductResourceMasterService.deleteDriver(driver.id);
          toastSuccess('Driver deleted', 'تم حذف السائق', driver.driverCode, driver.driverCode);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete driver';
          toastError('Driver delete failed', 'فشل حذف السائق', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {isAr ? 'معدات المستودعات والكوادر البشرية والسائقين (Equipment & Driver Resource Master)' : 'Warehouse Equipment & Driver Resource Platform'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAr
              ? 'تتبع الروبوتات الذكية، الرافعات الشوكية، أجهزة RF، ملفات السائقين، ساعات العمل اليومية وتصنيفات السلامة'
              : 'Monitor warehouse robots, forklifts, IoT scanners, driver duty hours, certifications & safety scores'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('EQUIPMENT')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'EQUIPMENT' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'معدات المستودعات والروبوتات' : 'Warehouse Equipment'} ({equipment.length})
          </button>

          <button
            onClick={() => setActiveTab('DRIVERS')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'DRIVERS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'سجل السائقين والكوادر' : 'Driver Resources'} ({drivers.length})
          </button>
        </div>
      </div>

      {activeTab === 'EQUIPMENT' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipment.map(eq => (
            <div key={eq.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-teal-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded">
                      {eq.equipmentCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{isAr ? eq.nameAr : eq.nameEn}</h3>
                    <div className="text-slate-400 text-xs">Hub: {eq.warehouseHubName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                    {eq.operationalStatus}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleEquipmentStatus(eq)}
                    disabled={busyResourceId === `equipment:${eq.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={eq.status === 'ACTIVE' ? (isAr ? 'إيقاف المعدة' : 'Deactivate equipment') : (isAr ? 'تفعيل المعدة' : 'Activate equipment')}
                    aria-label={eq.status === 'ACTIVE' ? (isAr ? 'إيقاف المعدة' : 'Deactivate equipment') : (isAr ? 'تفعيل المعدة' : 'Activate equipment')}
                  >
                    {busyResourceId === `equipment:${eq.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEquipment(eq)}
                    disabled={busyResourceId === `equipment:${eq.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف المعدة' : 'Delete equipment'}
                    aria-label={isAr ? 'حذف المعدة' : 'Delete equipment'}
                  >
                    {busyResourceId === `equipment:${eq.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'مصدر الطاقة:' : 'Power Source:'}</span>
                  <span className="font-bold text-slate-900">{eq.powerSource}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'الرقم التسلسلي:' : 'Serial No:'}</span>
                  <span className="font-mono font-bold text-slate-900">{eq.serialNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map(drv => (
            <div key={drv.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-amber-500 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">
                    {drv.driverCode}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{isAr ? drv.fullNameAr : drv.fullNameEn}</h3>
                  <div className="text-slate-400 text-xs">License: <span className="font-bold text-slate-700">{drv.licenseType}</span></div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                    {drv.availabilityStatus}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleDriverStatus(drv)}
                    disabled={busyResourceId === `driver:${drv.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={drv.status === 'ACTIVE' ? (isAr ? 'إيقاف السائق' : 'Deactivate driver') : (isAr ? 'تفعيل السائق' : 'Activate driver')}
                    aria-label={drv.status === 'ACTIVE' ? (isAr ? 'إيقاف السائق' : 'Deactivate driver') : (isAr ? 'تفعيل السائق' : 'Activate driver')}
                  >
                    {busyResourceId === `driver:${drv.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDriver(drv)}
                    disabled={busyResourceId === `driver:${drv.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف السائق' : 'Delete driver'}
                    aria-label={isAr ? 'حذف السائق' : 'Delete driver'}
                  >
                    {busyResourceId === `driver:${drv.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'ساعات اليوم:' : 'Hours Today:'}</span>
                  <span className="font-bold text-slate-900">{drv.workingHoursToday} / {drv.maxAllowedDutyHours} hrs</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'مؤشر السلامة:' : 'Safety Score:'}</span>
                  <span className="font-bold text-emerald-600">{drv.safetyPerformanceScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'الفحص الطبي:' : 'Medical Check:'}</span>
                  <span className="font-bold text-slate-900">{drv.medicalClearanceStatus}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {drv.certifications.map((c, idx) => (
                  <span key={idx} className="bg-amber-50 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-amber-200">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
