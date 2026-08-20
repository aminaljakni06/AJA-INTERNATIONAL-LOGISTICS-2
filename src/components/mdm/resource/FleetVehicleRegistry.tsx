import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Truck, Anchor, ShieldCheck, Plus, Gauge, Wrench, Fuel, CheckCircle2, Power, Trash2, Edit3, Loader2 } from 'lucide-react';
import { VehicleRecord, ContainerRecord } from '../../../types/productResourceMaster';
import { ProductResourceMasterClient as ProductResourceMasterService } from '../../../services/productResourceMasterClient';
import { useEnterpriseToast } from '../../../hooks/useEnterpriseToast';
import { useEnterpriseConfirmation } from '../../../hooks/useEnterpriseConfirmation';
import { formatProductResourceValidationMessage, normalizeVin, validateProductResourcePayload } from '../../../utils/productResourceValidators';

export const FleetVehicleRegistry: React.FC = () => {
  const { language } = useLanguage();
  const { toastSuccess, toastError } = useEnterpriseToast();
  const { confirmAction } = useEnterpriseConfirmation();
  const isAr = language === 'ar';

  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [containers, setContainers] = useState<ContainerRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'VEHICLES' | 'CONTAINERS'>('VEHICLES');
  const [isAdding, setIsAdding] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);
  const [editingContainer, setEditingContainer] = useState<ContainerRecord | null>(null);
  const [busyResourceId, setBusyResourceId] = useState<string | null>(null);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [isSavingContainer, setIsSavingContainer] = useState(false);

  // Vehicle form
  const [vehicleCode, setVehicleCode] = useState('');
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('Volvo Trucks');
  const [model, setModel] = useState('FH16 750');
  const [type, setType] = useState<any>('TRUCK');
  const [fuelType, setFuelType] = useState<any>('DIESEL');
  const [payloadKg, setPayloadKg] = useState(25000);

  // Container edit form
  const [containerOwner, setContainerOwner] = useState('');
  const [containerOperator, setContainerOperator] = useState('');
  const [containerTareKg, setContainerTareKg] = useState(2200);
  const [containerPayloadKg, setContainerPayloadKg] = useState(24000);
  const [containerVolumeCbm, setContainerVolumeCbm] = useState(33);

  const loadData = async () => {
    const vList = await ProductResourceMasterService.getVehicles();
    const cList = await ProductResourceMasterService.getContainers();
    setVehicles(vList);
    setContainers(cList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetVehicleForm = () => {
    setVehicleCode('');
    setVin('');
    setPlate('');
    setBrand('Volvo Trucks');
    setModel('FH16 750');
    setType('TRUCK');
    setFuelType('DIESEL');
    setPayloadKg(25000);
    setEditingVehicle(null);
  };

  const resetContainerForm = () => {
    setContainerOwner('');
    setContainerOperator('');
    setContainerTareKg(2200);
    setContainerPayloadKg(24000);
    setContainerVolumeCbm(33);
    setEditingContainer(null);
  };

  const openCreateVehicleForm = () => {
    resetContainerForm();
    resetVehicleForm();
    setActiveTab('VEHICLES');
    setIsAdding(true);
  };

  const openEditVehicleForm = (vehicle: VehicleRecord) => {
    resetContainerForm();
    setEditingVehicle(vehicle);
    setVehicleCode(vehicle.vehicleCode);
    setVin(vehicle.vin);
    setPlate(vehicle.licensePlate);
    setBrand(vehicle.makeBrand);
    setModel(vehicle.model);
    setType(vehicle.type);
    setFuelType(vehicle.fuelType);
    setPayloadKg(vehicle.maxPayloadKg);
    setActiveTab('VEHICLES');
    setIsAdding(true);
  };

  const openEditContainerForm = (container: ContainerRecord) => {
    setIsAdding(false);
    resetVehicleForm();
    setEditingContainer(container);
    setContainerOwner(container.ownerName);
    setContainerOperator(container.operatorName);
    setContainerTareKg(container.tareWeightKg);
    setContainerPayloadKg(container.maxPayloadKg);
    setContainerVolumeCbm(container.maxVolumeCbm);
    setActiveTab('CONTAINERS');
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleCode || !vin || !plate || isSavingVehicle) return;

    const cleanVin = normalizeVin(vin);
    const validation = validateProductResourcePayload(
      'vehicle',
      { vin: cleanVin, maxPayloadKg: payloadKg },
      editingVehicle ? 'update' : 'create'
    );
    if (!validation.valid) {
      toastError(
        'Invalid vehicle data',
        'بيانات المركبة غير صالحة',
        formatProductResourceValidationMessage(validation, 'en'),
        formatProductResourceValidationMessage(validation, 'ar')
      );
      return;
    }

    setIsSavingVehicle(true);
    try {
      if (editingVehicle) {
        await ProductResourceMasterService.updateVehicle(
          editingVehicle.id,
          {
            type,
            vin: cleanVin,
            licensePlate: plate,
            engineNumber: editingVehicle.engineNumber || `ENG-${cleanVin.slice(-6)}`,
            makeBrand: brand,
            model,
            fuelType,
            maxPayloadKg: payloadKg
          },
          'admin'
        );

        toastSuccess('Vehicle updated', 'تم تحديث المركبة', vehicleCode, vehicleCode);
      } else {
        await ProductResourceMasterService.createVehicle(
          {
            vehicleCode: vehicleCode.toUpperCase(),
            type,
            vin: cleanVin,
            licensePlate: plate,
            engineNumber: `ENG-${cleanVin.slice(-6)}`,
            makeBrand: brand,
            model,
            modelYear: 2026,
            fuelType,
            maxPayloadKg: payloadKg,
            maxVolumeCbm: 75,
            maintenanceStatus: 'ACTIVE',
            odometerKm: 15000,
            status: 'ACTIVE'
          },
          'admin'
        );

        toastSuccess('Vehicle created', 'تم إنشاء المركبة', vehicleCode.toUpperCase(), vehicleCode.toUpperCase());
      }

      setIsAdding(false);
      resetVehicleForm();
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save vehicle';
      toastError('Vehicle save failed', 'فشل حفظ المركبة', message, message);
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleUpdateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContainer || isSavingContainer) return;

    const validation = validateProductResourcePayload(
      'container',
      {
        ownerName: containerOwner,
        operatorName: containerOperator,
        tareWeightKg: containerTareKg,
        maxPayloadKg: containerPayloadKg,
        maxVolumeCbm: containerVolumeCbm
      },
      'update'
    );
    if (!validation.valid) {
      toastError(
        'Invalid container data',
        'بيانات الحاوية غير صالحة',
        formatProductResourceValidationMessage(validation, 'en'),
        formatProductResourceValidationMessage(validation, 'ar')
      );
      return;
    }

    setIsSavingContainer(true);
    try {
      await ProductResourceMasterService.updateContainer(
        editingContainer.id,
        {
          ownerName: containerOwner.trim(),
          operatorName: containerOperator.trim(),
          tareWeightKg: containerTareKg,
          maxPayloadKg: containerPayloadKg,
          maxVolumeCbm: containerVolumeCbm
        },
        'admin'
      );

      toastSuccess('Container updated', 'تم تحديث الحاوية', editingContainer.containerNumber, editingContainer.containerNumber);
      resetContainerForm();
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save container';
      toastError('Container save failed', 'فشل حفظ الحاوية', message, message);
    } finally {
      setIsSavingContainer(false);
    }
  };

  const handleToggleVehicleStatus = async (vehicle: VehicleRecord) => {
    const busyKey = `vehicle:${vehicle.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = vehicle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateVehicle(vehicle.id, {
        status: nextStatus,
        maintenanceStatus: nextStatus === 'ACTIVE' ? 'ACTIVE' : 'OUT_OF_SERVICE'
      });
      toastSuccess('Vehicle status updated', 'تم تحديث حالة المركبة', `${vehicle.vehicleCode}: ${nextStatus}`, `${vehicle.vehicleCode}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update vehicle status';
      toastError('Vehicle status failed', 'فشل تحديث حالة المركبة', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteVehicle = async (vehicle: VehicleRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete vehicle',
      titleAr: 'حذف المركبة',
      messageEn: `Delete vehicle ${vehicle.vehicleCode}? This action cannot be undone.`,
      messageAr: `هل تريد حذف المركبة ${vehicle.vehicleCode}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`vehicle:${vehicle.id}`);
        try {
          await ProductResourceMasterService.deleteVehicle(vehicle.id);
          toastSuccess('Vehicle deleted', 'تم حذف المركبة', vehicle.vehicleCode, vehicle.vehicleCode);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete vehicle';
          toastError('Vehicle delete failed', 'فشل حذف المركبة', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  const handleToggleContainerStatus = async (container: ContainerRecord) => {
    const busyKey = `container:${container.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = container.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateContainer(container.id, { status: nextStatus });
      toastSuccess('Container status updated', 'تم تحديث حالة الحاوية', `${container.containerNumber}: ${nextStatus}`, `${container.containerNumber}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update container status';
      toastError('Container status failed', 'فشل تحديث حالة الحاوية', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteContainer = async (container: ContainerRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete container',
      titleAr: 'حذف الحاوية',
      messageEn: `Delete container ${container.containerNumber}? This action cannot be undone.`,
      messageAr: `هل تريد حذف الحاوية ${container.containerNumber}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`container:${container.id}`);
        try {
          await ProductResourceMasterService.deleteContainer(container.id);
          toastSuccess('Container deleted', 'تم حذف الحاوية', container.containerNumber, container.containerNumber);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete container';
          toastError('Container delete failed', 'فشل حذف الحاوية', message, message);
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
            {isAr ? 'سجل الأسطول الشاحنات والحاويات المعيارية (ISO 6346 Fleet & Containers)' : 'Fleet Vehicles & ISO 6346 Container Registry'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAr
              ? 'إدارة المركبات (VIN)، لوحات الترخيص، أنواع الوقود، وسجل الحاويات المعيارية (20GP, 40HC, Reefer)'
              : 'Master registry for truck/trailer fleet VINs, plates, fuel types & ISO 6346 intermodal containers'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('VEHICLES')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'VEHICLES' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'سجل الشاحنات والمركبات' : 'Fleet Vehicles'} ({vehicles.length})
            </button>

            <button
              onClick={() => setActiveTab('CONTAINERS')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'CONTAINERS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'سجل الحاويات (ISO 6346)' : 'ISO Containers'} ({containers.length})
            </button>
          </div>

          <button
            onClick={openCreateVehicleForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'تسجيل مركبة' : 'Register Vehicle'}</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateVehicle} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-amber-400">
            {editingVehicle
              ? (isAr ? 'تعديل بيانات مركبة الأسطول' : 'Edit Fleet Vehicle Entity')
              : (isAr ? 'تسجيل مركبة أسطول جديدة' : 'Register Fleet Vehicle Entity')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'كود المركبة' : 'Vehicle Code'}</label>
              <input
                type="text"
                required
                value={vehicleCode}
                onChange={e => setVehicleCode(e.target.value)}
                disabled={Boolean(editingVehicle)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="TRK-RUH-9901"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'رقم الهيكل (VIN)' : 'VIN Number (17 chars)'}</label>
              <input
                type="text"
                required
                maxLength={17}
                value={vin}
                onChange={e => setVin(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                placeholder="1M8GDM9A2KP098123"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'رقم لوحة الترخيص' : 'License Plate'}</label>
              <input
                type="text"
                required
                value={plate}
                onChange={e => setPlate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="أ ب ج 1234"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'نوع المركبة' : 'Vehicle Type'}</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="TRUCK">Heavy Duty Truck (شاحنة ثقيلة)</option>
                <option value="VAN">Delivery Van (فان توزيع)</option>
                <option value="PICKUP">Pickup (بيك آب)</option>
                <option value="TRAILER">Trailer Flatbed (مقطورة)</option>
                <option value="TERMINAL_TRACTOR">Terminal Tractor (جرار موانئ)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'نوع الوقود/المحرك' : 'Fuel/Power Source'}</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="DIESEL">Diesel Engine (ديزل)</option>
                <option value="ELECTRIC">Electric Battery EV (كهربائي)</option>
                <option value="HYBRID">Hybrid (هجين)</option>
                <option value="HYDROGEN">Hydrogen Cell (هيدروجين)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الحمولة القصوى (كجم)' : 'Max Payload (kg)'}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={payloadKg}
                onChange={e => setPayloadKg(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={isSavingVehicle}
              onClick={() => {
                setIsAdding(false);
                resetVehicleForm();
              }}
              className="px-4 py-2 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSavingVehicle}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingVehicle && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingVehicle ? (isAr ? 'تحديث المركبة' : 'Update Vehicle') : (isAr ? 'حفظ المركبة' : 'Save Vehicle')}</span>
            </button>
          </div>
        </form>
      )}

      {editingContainer && (
        <form onSubmit={handleUpdateContainer} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-blue-400">
            {isAr ? `تعديل بيانات الحاوية ${editingContainer.containerNumber}` : `Edit Container ${editingContainer.containerNumber}`}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'المالك' : 'Owner'}</label>
              <input
                type="text"
                required
                value={containerOwner}
                onChange={e => setContainerOwner(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'المشغل' : 'Operator'}</label>
              <input
                type="text"
                required
                value={containerOperator}
                onChange={e => setContainerOperator(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'وزن الحاوية (كجم)' : 'Tare Weight (kg)'}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={containerTareKg}
                onChange={e => setContainerTareKg(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'أقصى حمولة (كجم)' : 'Max Payload (kg)'}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={containerPayloadKg}
                onChange={e => setContainerPayloadKg(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الحجم الأقصى (CBM)' : 'Max Volume (cbm)'}</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={containerVolumeCbm}
                onChange={e => setContainerVolumeCbm(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={resetContainerForm}
              disabled={isSavingContainer}
              className="px-4 py-2 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSavingContainer}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingContainer && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isAr ? 'تحديث الحاوية' : 'Update Container'}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'VEHICLES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-amber-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">
                      {v.vehicleCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{v.makeBrand} - {v.model}</h3>
                    <div className="text-slate-400 text-xs">Plate: <span className="font-bold text-slate-700">{v.licensePlate}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 font-bold rounded-xl text-xs ${
                      v.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {v.status}
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-lg text-[10px]">
                      {v.maintenanceStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditVehicleForm(v)}
                    disabled={busyResourceId === `vehicle:${v.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'تعديل المركبة' : 'Edit vehicle'}
                    aria-label={isAr ? 'تعديل المركبة' : 'Edit vehicle'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVehicleStatus(v)}
                    disabled={busyResourceId === `vehicle:${v.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={v.status === 'ACTIVE' ? (isAr ? 'إيقاف المركبة' : 'Deactivate vehicle') : (isAr ? 'تفعيل المركبة' : 'Activate vehicle')}
                    aria-label={v.status === 'ACTIVE' ? (isAr ? 'إيقاف المركبة' : 'Deactivate vehicle') : (isAr ? 'تفعيل المركبة' : 'Activate vehicle')}
                  >
                    {busyResourceId === `vehicle:${v.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(v)}
                    disabled={busyResourceId === `vehicle:${v.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف المركبة' : 'Delete vehicle'}
                    aria-label={isAr ? 'حذف المركبة' : 'Delete vehicle'}
                  >
                    {busyResourceId === `vehicle:${v.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'رقم الهيكل VIN:' : 'VIN:'}</span>
                  <span className="font-mono font-bold text-slate-900">{v.vin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'نوع المحرك:' : 'Fuel:'}</span>
                  <span className="font-bold text-slate-900">{v.fuelType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'عداد الكيلومترات:' : 'Odometer:'}</span>
                  <span className="font-bold text-slate-900">{v.odometerKm.toLocaleString()} km</span>
                </div>
              </div>

              {v.assignedDriverName && (
                <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-800">{isAr ? 'السائق المعين:' : 'Assigned Driver:'}</span> {v.assignedDriverName}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {containers.map(c => (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-blue-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Anchor className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                      {c.containerNumber} (ISO 6346)
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{c.type} Container</h3>
                    <div className="text-slate-400 text-xs">Owner: {c.ownerName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 font-bold rounded-xl text-xs ${
                    c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditContainerForm(c)}
                    disabled={busyResourceId === `container:${c.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'تعديل الحاوية' : 'Edit container'}
                    aria-label={isAr ? 'تعديل الحاوية' : 'Edit container'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleContainerStatus(c)}
                    disabled={busyResourceId === `container:${c.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={c.status === 'ACTIVE' ? (isAr ? 'إيقاف الحاوية' : 'Deactivate container') : (isAr ? 'تفعيل الحاوية' : 'Activate container')}
                    aria-label={c.status === 'ACTIVE' ? (isAr ? 'إيقاف الحاوية' : 'Deactivate container') : (isAr ? 'تفعيل الحاوية' : 'Activate container')}
                  >
                    {busyResourceId === `container:${c.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContainer(c)}
                    disabled={busyResourceId === `container:${c.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف الحاوية' : 'Delete container'}
                    aria-label={isAr ? 'حذف الحاوية' : 'Delete container'}
                  >
                    {busyResourceId === `container:${c.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'وزن الحاوية:' : 'Tare Weight:'}</span>
                  <span className="font-bold text-slate-900">{c.tareWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'أقصى حمولة:' : 'Max Payload:'}</span>
                  <span className="font-bold text-slate-900">{c.maxPayloadKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'الحجم:' : 'Max Vol:'}</span>
                  <span className="font-bold text-slate-900">{c.maxVolumeCbm} cbm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
