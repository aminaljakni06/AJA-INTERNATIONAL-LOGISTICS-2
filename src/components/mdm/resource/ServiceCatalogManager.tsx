import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Plane, Anchor, Truck, ShieldAlert, PackageCheck, Layers, Plus, DollarSign, Clock, ShieldCheck, Power, Trash2, Edit3, Loader2 } from 'lucide-react';
import { ServiceItem, ServicePackage, ShipmentTypeDefinition } from '../../../types/productResourceMaster';
import { ProductResourceMasterClient as ProductResourceMasterService } from '../../../services/productResourceMasterClient';
import { useEnterpriseToast } from '../../../hooks/useEnterpriseToast';
import { useEnterpriseConfirmation } from '../../../hooks/useEnterpriseConfirmation';
import { formatProductResourceValidationMessage, validateProductResourcePayload } from '../../../utils/productResourceValidators';

export const ServiceCatalogManager: React.FC = () => {
  const { language } = useLanguage();
  const { toastSuccess, toastError } = useEnterpriseToast();
  const { confirmAction } = useEnterpriseConfirmation();
  const isAr = language === 'ar';

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [shipmentTypes, setShipmentTypes] = useState<ShipmentTypeDefinition[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'SERVICES' | 'PACKAGES' | 'SHIPMENT_TYPES'>('SERVICES');
  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);

  // Service form state
  const [serviceCode, setServiceCode] = useState('');
  const [category, setCategory] = useState<any>('AIR_FREIGHT');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [rate, setRate] = useState(25);

  const loadData = async () => {
    const sList = await ProductResourceMasterService.getServices();
    const pList = await ProductResourceMasterService.getServicePackages();
    const stList = await ProductResourceMasterService.getShipmentTypes();
    setServices(sList);
    setPackages(pList);
    setShipmentTypes(stList);
  };

  const resetServiceForm = () => {
    setServiceCode('');
    setCategory('AIR_FREIGHT');
    setNameAr('');
    setNameEn('');
    setRate(25);
    setEditingService(null);
  };

  const openCreateServiceForm = () => {
    resetServiceForm();
    setIsAdding(true);
  };

  const openEditServiceForm = (service: ServiceItem) => {
    setEditingService(service);
    setServiceCode(service.serviceCode);
    setCategory(service.category);
    setNameAr(service.nameAr);
    setNameEn(service.nameEn);
    setRate(service.defaultRate);
    setIsAdding(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceCode || !nameEn || !nameAr || isSavingService) return;

    const validation = validateProductResourcePayload(
      'service',
      { defaultRate: rate },
      editingService ? 'update' : 'create'
    );
    if (!validation.valid) {
      toastError(
        'Invalid service data',
        'بيانات الخدمة غير صالحة',
        formatProductResourceValidationMessage(validation, 'en'),
        formatProductResourceValidationMessage(validation, 'ar')
      );
      return;
    }

    setIsSavingService(true);
    try {
      if (editingService) {
        await ProductResourceMasterService.updateService(
          editingService.id,
          {
            category,
            nameAr,
            nameEn,
            descriptionAr: nameAr,
            descriptionEn: nameEn,
            defaultRate: rate
          },
          'admin'
        );

        toastSuccess('Service updated', 'تم تحديث الخدمة', serviceCode, serviceCode);
      } else {
        await ProductResourceMasterService.createService(
          {
            serviceCode: serviceCode.toUpperCase(),
            category,
            nameAr,
            nameEn,
            descriptionAr: nameAr,
            descriptionEn: nameEn,
            baseCurrency: 'SAR',
            defaultRate: rate,
            rateUnit: 'PER_KG',
            leadTimeHours: 24,
            status: 'ACTIVE'
          },
          'admin'
        );

        toastSuccess('Service created', 'تم إنشاء الخدمة', serviceCode.toUpperCase(), serviceCode.toUpperCase());
      }

      setIsAdding(false);
      resetServiceForm();
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save service';
      toastError('Service save failed', 'فشل حفظ الخدمة', message, message);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleToggleServiceStatus = async (service: ServiceItem) => {
    if (busyServiceId) return;
    setBusyServiceId(service.id);
    try {
      const nextStatus = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateService(service.id, { status: nextStatus });
      toastSuccess('Service status updated', 'تم تحديث حالة الخدمة', `${service.serviceCode}: ${nextStatus}`, `${service.serviceCode}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update service status';
      toastError('Service status failed', 'فشل تحديث حالة الخدمة', message, message);
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleDeleteService = async (service: ServiceItem) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete service',
      titleAr: 'حذف الخدمة',
      messageEn: `Delete service ${service.serviceCode}? This action cannot be undone.`,
      messageAr: `هل تريد حذف الخدمة ${service.serviceCode}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyServiceId(service.id);
        try {
          await ProductResourceMasterService.deleteService(service.id);
          toastSuccess('Service deleted', 'تم حذف الخدمة', service.serviceCode, service.serviceCode);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete service';
          toastError('Service delete failed', 'فشل حذف الخدمة', message, message);
        } finally {
          setBusyServiceId(null);
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
            {isAr ? 'دليل الخدمات اللوجستية والباقات (Service Catalog & Packages)' : 'Global Service Catalog & Package Matrix'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAr
              ? 'إدارة الخدمات الجوية، البحرية، البرية، التبريد، الباقات الشاملة وتعاريف أنواع الشحنات'
              : 'Define logistics catalog offerings, SLA lead times, tariff rates, bundled packages & shipment matrices'}
          </p>
        </div>

        <button
          onClick={openCreateServiceForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة خدمة لوجستية' : 'Create Service Entry'}</span>
        </button>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('SERVICES')}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'SERVICES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isAr ? 'قائمة الخدمات اللوجستية' : 'Service Catalog Items'} ({services.length})
        </button>
        <button
          onClick={() => setActiveSubTab('PACKAGES')}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'PACKAGES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isAr ? 'باقات الخدمات المدمجة (Bundles)' : 'Service Packages'} ({packages.length})
        </button>
        <button
          onClick={() => setActiveSubTab('SHIPMENT_TYPES')}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'SHIPMENT_TYPES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isAr ? 'تعاريف أنواع الشحنات' : 'Shipment Types Matrix'} ({shipmentTypes.length})
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateService} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-blue-400">
            {editingService
              ? (isAr ? 'تعديل بيانات الخدمة اللوجستية' : 'Edit Logistics Service Offering')
              : (isAr ? 'تعريف خدمة لوجستية جديدة' : 'Define New Logistics Service Offering')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'كود الخدمة' : 'Service Code'}</label>
              <input
                type="text"
                required
                value={serviceCode}
                onChange={e => setServiceCode(e.target.value)}
                disabled={Boolean(editingService)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="SRV-SEA-FCL-EXP"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'تصنيف الخدمة' : 'Category'}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="AIR_FREIGHT">Air Freight (شحن جوي)</option>
                <option value="SEA_FREIGHT">Sea Freight (شحن بحري)</option>
                <option value="LAND_FREIGHT">Land Freight (شحن بري)</option>
                <option value="EXPRESS">Express Courier (شحن سريع)</option>
                <option value="COLD_CHAIN">Cold Chain (سلسلة التبريد)</option>
                <option value="WAREHOUSING">Warehousing & Storage (تخزين)</option>
                <option value="CUSTOMS_CLEARANCE">Customs Clearance (تخليص جمركي)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'السعر الأساسي (SAR)' : 'Default Base Rate (SAR)'}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'اسم الخدمة بالإنجليزية' : 'Service Name (EN)'}</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'اسم الخدمة بالعربية' : 'Service Name (AR)'}</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={isSavingService}
              onClick={() => {
                setIsAdding(false);
                resetServiceForm();
              }}
              className="px-4 py-2 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSavingService}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingService && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingService ? (isAr ? 'تحديث الخدمة' : 'Update Service') : (isAr ? 'حفظ الخدمة' : 'Save Service')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      {activeSubTab === 'SERVICES' && (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-500 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {s.category.includes('AIR') && <Plane className="w-6 h-6" />}
                    {s.category.includes('SEA') && <Anchor className="w-6 h-6" />}
                    {s.category.includes('LAND') && <Truck className="w-6 h-6" />}
                    {!s.category.includes('AIR') && !s.category.includes('SEA') && !s.category.includes('LAND') && <PackageCheck className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                        {s.serviceCode}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{s.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-1">{isAr ? s.nameAr : s.nameEn}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{isAr ? s.descriptionAr : s.descriptionEn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'التعرفة' : 'Default Tariff Rate'}</span>
                    <span className="font-bold text-slate-900">{s.defaultRate} {s.baseCurrency} / {s.rateUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isAr ? 'مدة التنفيذ SLA' : 'SLA Target'}</span>
                    <span className="font-bold text-slate-900">{s.leadTimeHours} {isAr ? 'ساعة' : 'hours'}</span>
                  </div>
                  <span className={`px-3 py-1 font-bold rounded-xl ${
                    s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>{s.status}</span>
                  <button
                    type="button"
                    onClick={() => openEditServiceForm(s)}
                    disabled={busyServiceId === s.id}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'تعديل الخدمة' : 'Edit service'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleServiceStatus(s)}
                    disabled={busyServiceId === s.id}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'تفعيل/تعطيل الخدمة' : 'Toggle service status'}
                  >
                    {busyServiceId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(s)}
                    disabled={busyServiceId === s.id}
                    className="w-8 h-8 rounded-xl border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف الخدمة' : 'Delete service'}
                  >
                    {busyServiceId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Packages List */}
      {activeSubTab === 'PACKAGES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map(p => (
            <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-blue-500 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded">
                    {p.packageCode}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{isAr ? p.nameAr : p.nameEn}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{isAr ? p.descriptionAr : p.descriptionEn}</p>
                </div>

                <span className="px-3 py-1 bg-purple-100 text-purple-900 font-bold rounded-xl text-xs">
                  {p.bundleDiscountPercentage}% Discount
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">{isAr ? 'القطاع المستهدف:' : 'Target Market Segment:'}</span>
                <span>{p.targetMarket}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shipment Types List */}
      {activeSubTab === 'SHIPMENT_TYPES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shipmentTypes.map(st => (
            <div key={st.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-blue-500 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">
                    {st.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{isAr ? st.nameAr : st.nameEn}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{isAr ? st.descriptionAr : st.descriptionEn}</p>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                  {st.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'أقصى وزن:' : 'Max Weight:'}</span>
                  <span className="font-bold text-slate-900">{st.maxWeightKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'أقصى حجم:' : 'Max Volume:'}</span>
                  <span className="font-bold text-slate-900">{st.maxVolumeCbm} cbm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
