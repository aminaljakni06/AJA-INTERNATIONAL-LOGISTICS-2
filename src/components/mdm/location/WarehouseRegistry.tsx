import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Building2, Plus, Search, MapPin, Thermometer, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { WarehouseMaster } from '../../../types/locationMaster';
import { LocationMasterClient as LocationMasterService } from '../../../services/locationMasterClient';

export const WarehouseRegistry: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [warehouses, setWarehouses] = useState<WarehouseMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [warehouseCode, setWarehouseCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [capacitySqm, setCapacitySqm] = useState(25000);
  const [cityName, setCityName] = useState('Riyadh');
  const [dockCount, setDockCount] = useState(16);

  const loadData = async () => {
    const list = await LocationMasterService.getWarehouses();
    setWarehouses(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseCode || !nameEn) return;

    await LocationMasterService.createWarehouse(
      {
        warehouseCode: warehouseCode.toUpperCase(),
        warehouseNameEn: nameEn,
        warehouseNameAr: nameAr || nameEn,
        type: 'DISTRIBUTION_CENTER',
        countryCode: 'SA',
        cityName,
        addressStreet: 'Logistics Park Highway',
        latitude: 24.6,
        longitude: 46.7,
        totalCapacitySqm: capacitySqm,
        storageZoneCount: 8,
        dockCount,
        supportsHazmat: true,
        supportsTemperatureControlled: true,
        minTempCelsius: -20,
        maxTempCelsius: 25,
        workingHours: '24/7',
        status: 'ACTIVE'
      },
      'admin'
    );
    setIsAdding(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{isAr ? 'سجل المستودعات ومراكز التوزيع' : 'Warehouse & Distribution Park Registry'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{isAr ? 'إدارة المستودعات المركزية، التبريد، المواد الخطرة، وأرصفة التحميل' : 'Master registry for mega hubs, cold chains, hazmat zones & dock bays'}</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مستودع جديد' : 'Register Warehouse'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-amber-400">{isAr ? 'تسجيل مستودع أو مركز توزيع جديد' : 'Register New Warehouse Master'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'كود المستودع' : 'Warehouse Code'}</label>
              <input
                type="text"
                required
                value={warehouseCode}
                onChange={e => setWarehouseCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                placeholder="WH-RUH-02"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'اسم المستودع (EN)' : 'Name (EN)'}</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="Riyadh East Hub"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'اسم المستودع (AR)' : 'Name (AR)'}</label>
              <input
                type="text"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="مستودع شرق الرياض"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'المساحة الإجمالية (م²)' : 'Capacity (Sqm)'}</label>
              <input
                type="number"
                value={capacitySqm}
                onChange={e => setCapacitySqm(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'عدد أرصفة التحميل' : 'Dock Bays Count'}</label>
              <input
                type="number"
                value={dockCount}
                onChange={e => setDockCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'المدينة' : 'City'}</label>
              <input
                type="text"
                value={cityName}
                onChange={e => setCityName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400">{isAr ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl">{isAr ? 'حفظ المستودع' : 'Save Warehouse'}</button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={isAr ? 'بحث بكود المستودع، المدينة أو الاسم...' : 'Search warehouse code, city, name...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses
          .filter(w => w.warehouseNameEn.toLowerCase().includes(searchTerm.toLowerCase()) || w.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(w => (
            <div key={w.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-amber-500 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[11px] font-bold rounded">
                    {w.warehouseCode}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-2">{isAr ? w.warehouseNameAr : w.warehouseNameEn}</h3>
                  <div className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{w.cityName} ({w.countryCode}) • {w.addressStreet}</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                  {w.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'المساحة' : 'Capacity'}</div>
                  <div className="font-bold text-slate-900">{w.totalCapacitySqm.toLocaleString()} m²</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'أرصفة التحميل' : 'Docks'}</div>
                  <div className="font-bold text-slate-900">{w.dockCount} Bays</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'المناطق' : 'Zones'}</div>
                  <div className="font-bold text-slate-900">{w.storageZoneCount} Zones</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-semibold pt-1">
                {w.supportsTemperatureControlled && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تبريد' : 'Cold Chain'} ({w.minTempCelsius}°C to {w.maxTempCelsius}°C)</span>
                  </span>
                )}
                {w.supportsHazmat && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مواد خطرة' : 'Hazmat Ready'}</span>
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{w.workingHours}</span>
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
