import React, { useState, useEffect } from 'react';
import {
  Truck,
  User,
  Activity,
  Gauge,
  Fuel,
  Disc,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  Sparkles,
  Search,
  Plus,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  RefreshCw,
  Zap,
  TrendingDown,
  Layers,
  Thermometer,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Vehicle,
  DriverProfile,
  FuelLog,
  TireLog,
  MaintenanceRecord,
  VehicleInspectionReport,
  FleetIncident,
  FleetKpiSummary,
  AIFleetDiagnosticsResult
} from '../../types/fleet';
import { FleetClient } from '../../services/fleetClient';

const EMPTY_FLEET_KPIS: FleetKpiSummary = {
  totalVehicles: 0,
  activeInTransit: 0,
  underMaintenance: 0,
  availableVehicles: 0,
  avgFleetAgeYears: 0,
  totalFuelSpentSAR: 0,
  avgFleetEfficiencyKmPerL: 0,
  avgFleetSafetyScore: 0,
};

export const FleetCoreMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'vehicles' | 'telematics' | 'drivers' | 'maintenance' | 'fuel-tires' | 'inspections' | 'ai-fleet'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [tires, setTires] = useState<TireLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [inspections, setInspections] = useState<VehicleInspectionReport[]>([]);
  const [incidents, setIncidents] = useState<FleetIncident[]>([]);
  const [kpis, setKpis] = useState<FleetKpiSummary>(EMPTY_FLEET_KPIS);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // AI Diagnostics state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIFleetDiagnosticsResult | null>(null);

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    setLoading(true);
    try {
      const [vehicleData, dList, fList, tList, mList, inspectionData] = await Promise.all([
        FleetClient.getVehicles(),
        FleetClient.getDrivers(),
        FleetClient.getFuelLogs(),
        FleetClient.getTireLogs(),
        FleetClient.getMaintenanceRecords(),
        FleetClient.getInspectionsAndIncidents(),
      ]);
      const vList = vehicleData.vehicles;
      setVehicles(vList);
      setDrivers(dList);
      setFuelLogs(fList);
      setTires(tList);
      setMaintenance(mList);
      setInspections(inspectionData.inspections);
      setIncidents(inspectionData.incidents);
      setKpis(vehicleData.kpis);
      if (vList.length > 0) {
        setSelectedVehicle(vList[0]);
      }
    } catch (err) {
      console.error('Error loading fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: Vehicle['status']) => {
    const updated = await FleetClient.updateVehicleStatus(vehicleId, newStatus);
    if (updated) {
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const handleRunAiDiagnostics = async (veh: Vehicle) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const response = await fetch('/api/fleet/ai/diagnostics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: veh.id,
          licensePlate: veh.licensePlate,
          mileageKm: veh.mileageKm,
          engineTempCelsius: veh.engineTempCelsius,
          fuelLevelPercent: veh.fuelLevelPercent,
          vehicleType: veh.vehicleType,
        })
      });
      const data = await response.json();
      if (data.success && data.result) {
        setAiResult(data.result);
      }
    } catch (err) {
      console.error('AI Fleet error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.licensePlate.includes(searchTerm) ||
    v.fleetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.branchLocation.includes(searchTerm) ||
    (v.currentDriverName && v.currentDriverName.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isAr ? 'منصة إدارة الأسطول والتتبع التليماتيكي' : 'Enterprise Fleet & Telematics Management'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'إدارة الشاحنات والسائقين والوقود وتتبع GPS والتنبؤ بالصيانة بالذكاء الاصطناعي' : 'Real-time GPS Tracking, Driver Performance, Fuel Efficiency & AI Predictive Maintenance'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFleetData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all">
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مركبة للأسطول' : 'Register Vehicle'}</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPIS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>{isAr ? 'إجمالي الأسطول' : 'Total Fleet Vehicles'}</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {kpis.totalVehicles} <span className="text-xs font-normal text-gray-500">{isAr ? 'شاحنة' : 'Trucks'}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{kpis.activeInTransit} {isAr ? 'نشطة في الطريق الآن' : 'In Transit'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>{isAr ? 'المركبات تحت الصيانة' : 'Under Maintenance'}</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {kpis.underMaintenance} <span className="text-xs font-normal text-gray-500">{isAr ? 'شاحنة' : 'Trucks'}</span>
          </div>
          <div className="text-[10px] text-gray-500">
            {kpis.availableVehicles} {isAr ? 'شاحنات متاحة في المستودعات' : 'Available in Yards'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>{isAr ? 'مصروفات الوقود هذا الشهر' : 'Monthly Fuel Cost'}</span>
            <Fuel className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {kpis.totalFuelSpentSAR.toLocaleString()} <span className="text-xs font-normal text-gray-500">ر.س</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">
            معدل الكفاءة: {kpis.avgFleetEfficiencyKmPerL} كم / لتر ديزل
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>{isAr ? 'مؤشر أمان السائقين' : 'Fleet Safety Score'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {kpis.avgFleetSafetyScore}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {isAr ? 'أداء ممتاز للسائقين وفق اشتراطات السلامة' : 'High Compliance Score'}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'vehicles', label: isAr ? 'سجل الأسطول والمركبات' : 'Fleet Registry', icon: Truck },
          { id: 'telematics', label: isAr ? 'التتبع الحي وGPS Telematics' : 'Live Telematics & GPS', icon: Navigation },
          { id: 'drivers', label: isAr ? 'السائقين والأداء والسلبيات' : 'Drivers & Safety Scorecard', icon: User },
          { id: 'maintenance', label: isAr ? 'إدارة الصيانة والورش' : 'Maintenance & Workshop', icon: Wrench },
          { id: 'fuel-tires', label: isAr ? 'الوقود والإطارات' : 'Fuel & Tires Log', icon: Fuel },
          { id: 'inspections', label: isAr ? 'الفحص والحوادث' : 'Inspections & Incidents', icon: ClipboardCheck },
          { id: 'ai-fleet', label: isAr ? 'مُحلل الأسطول الذكي AI' : 'AI Fleet Diagnostics', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-6">
        {/* TAB 1: FLEET VEHICLES REGISTRY */}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isAr ? 'بحث برقم اللوحة، كود الأسطول، الفرع، السائق...' : 'Search plate, fleet code, driver...'}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVehicles.map((veh) => (
                  <div
                    key={veh.id}
                    onClick={() => setSelectedVehicle(veh)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      selectedVehicle?.id === veh.id
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-bold text-gray-600 dark:text-gray-300">
                          {veh.fleetCode}
                        </span>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 mt-1">
                          {veh.licensePlate}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        veh.status === 'IN_TRANSIT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        veh.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {veh.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <p className="font-medium">{veh.manufacturer} {veh.model} ({veh.year})</p>
                      <p className="text-gray-400 text-[11px]">{veh.branchLocation}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500">
                      <span>السائق: <strong className="text-gray-800 dark:text-gray-200">{veh.currentDriverName || 'غير معين'}</strong></span>
                      <span>العداد: <strong className="text-blue-600">{veh.mileageKm.toLocaleString()} كم</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VEHICLE DETAILS CARD */}
            {selectedVehicle && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">{selectedVehicle.fleetCode}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg font-bold">
                      {selectedVehicle.vehicleType}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
                    {selectedVehicle.licensePlate}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedVehicle.manufacturer} {selectedVehicle.model}</p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-gray-100 dark:border-gray-700 py-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الهيكل VIN:</span>
                    <span className="font-mono font-bold">{selectedVehicle.vin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الفرع الرئيسي:</span>
                    <span className="font-bold">{selectedVehicle.branchLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">مستوى الوقود الحالي:</span>
                    <span className="font-bold text-indigo-600">{selectedVehicle.fuelLevelPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">درجة حرارة المحرك:</span>
                    <span className="font-bold text-amber-600">{selectedVehicle.engineTempCelsius}°C</span>
                  </div>
                  {selectedVehicle.reeferCurrentTemp && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>حرارة الثلاجة الحالية:</span>
                      <span>{selectedVehicle.reeferCurrentTemp} (المستهدف: {selectedVehicle.reeferTargetTemp})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    {isAr ? 'تغيير حالة المركبة التشغيلية' : 'Update Operating Status'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'] as Vehicle['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedVehicle.id, st)}
                        className={`py-2 rounded-xl font-bold text-[11px] border transition-all ${
                          selectedVehicle.status === st
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRunAiDiagnostics(selectedVehicle)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'تشغيل التشخيص الذكي AI للمركبة' : 'Run AI Vehicle Diagnostics'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE TELEMATICS & GPS */}
        {activeTab === 'telematics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
                  {isAr ? 'مراقبة التتبع الحي والسرعة وتحديد المواقع GPS Telematics' : 'Live GPS & Telematics Monitoring'}
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full">
                  Signal Quality: 99.8% GPS HD
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-3">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="text-blue-600 dark:text-blue-400">{v.licensePlate} ({v.fleetCode})</span>
                      <span className="text-gray-500">{v.lastGpsLocation.timestamp.split('T')[1]?.substring(0, 5)} GMT</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Navigation className="w-5 h-5 text-indigo-600 transform rotate-45" />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{v.lastGpsLocation.locationName}</p>
                        <p className="text-gray-400 text-[10px]">
                          Lat: {v.lastGpsLocation.latitude}, Lng: {v.lastGpsLocation.longitude} | الاتجاه: {v.lastGpsLocation.headingDegree}°
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <span className="text-gray-400 text-[10px] block">السرعة الحالية</span>
                        <strong className="text-blue-600 text-sm">{v.lastGpsLocation.speedKmH} كم/س</strong>
                      </div>
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                        <span className="text-gray-400 text-[10px] block">الوقود المتبقي</span>
                        <strong className="text-indigo-600 text-sm">{v.fuelLevelPercent}%</strong>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <span className="text-gray-400 text-[10px] block">حرارة المحرك</span>
                        <strong className="text-amber-600 text-sm">{v.engineTempCelsius}°C</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVERS & SAFETY SCORECARD */}
        {activeTab === 'drivers' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {isAr ? 'سجل السائقين وبطاقات أداء السلامة (Driver Safety Scorecards)' : 'Drivers Registry & Safety Performance'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {drivers.map((drv) => (
                <div key={drv.id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400">{drv.employeeCode}</span>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{drv.name}</h4>
                    </div>
                    <span className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {drv.ratingStars}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                    <p>رخصة القيادة: <strong className="text-gray-800 dark:text-gray-200">{drv.licenseNumber}</strong></p>
                    <p>فئة الرخصة: <strong className="text-gray-800 dark:text-gray-200">{drv.licenseCategory}</strong></p>
                    <p>انتهاء الرخصة: <strong className="text-gray-800 dark:text-gray-200">{drv.licenseExpiryDate}</strong></p>
                    <p>الشاحنة المعينة: <strong className="text-blue-600">{drv.assignedVehiclePlate || 'غير معين'}</strong></p>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">مؤشر السلامة والقيادة الآمنة</span>
                      <strong className="text-emerald-600 text-base">{drv.drivingSafetyScore} / 100</strong>
                    </div>
                    <div className="text-right text-[10px] text-gray-500 space-y-0.5">
                      <p>الفرملة المفاجئة: <strong className="text-amber-600">{drv.harshBrakingCount} مرات</strong></p>
                      <p>ساعات التوقف مع تشغيل المحرك: <strong>{drv.idleTimeHoursThisMonth} ساعة</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MAINTENANCE & WORKSHOP */}
        {activeTab === 'maintenance' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              {isAr ? 'سجل الصيانة والورش والإصلاح الدوري' : 'Fleet Maintenance & Workshop Center'}
            </h3>

            <div className="space-y-3 text-xs">
              {maintenance.map((mnt) => (
                <div key={mnt.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-blue-600">{mnt.licensePlate}</span>
                      <span className="text-gray-400">|</span>
                      <span>{mnt.description}</span>
                    </div>
                    <p className="text-gray-500">الورشة / المورد: {mnt.workshopVendorName} • التاريخ: {mnt.scheduledDate.split('T')[0]}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-extrabold text-sm block text-gray-900 dark:text-gray-100">{mnt.costSAR} ر.س</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{mnt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FUEL & TIRES LOG */}
        {activeTab === 'fuel-tires' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-indigo-600">
                <Fuel className="w-5 h-5" />
                {isAr ? 'عمليات التزود بالوقود والبطاقات' : 'Fuel Cards & Transactions'}
              </h3>
              <div className="space-y-3 text-xs">
                {fuelLogs.map((fl) => (
                  <div key={fl.id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{fl.licensePlate} - {fl.driverName}</span>
                      <span className="text-indigo-600">{fl.costSAR} ر.س ({fl.liters} لتر)</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{fl.stationName} • كفاءة الاستهلاك: {fl.fuelEfficiencyKmPerLiter} كم/لتر</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-blue-600">
                <Disc className="w-5 h-5" />
                {isAr ? 'مراقبة حالة وضغط الإطارات' : 'Tire Pressure & Wear Monitor'}
              </h3>
              <div className="space-y-3 text-xs">
                {tires.map((tr) => (
                  <div key={tr.id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{tr.licensePlate} ({tr.position})</span>
                      <span className="text-emerald-600">عمق النقشة: {tr.treadDepthMm} مم</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{tr.brand} • ضغط الهواء: {tr.pressurePsi} PSI</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: INSPECTIONS & INCIDENTS */}
        {activeTab === 'inspections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-emerald-600">
                <ClipboardCheck className="w-5 h-5" />
                {isAr ? 'تقارير فحص قبل وبعد الرحلة' : 'Pre & Post-trip Inspection Logs'}
              </h3>
              <div className="space-y-3 text-xs">
                {inspections.map((ins) => (
                  <div key={ins.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>{ins.licensePlate} ({ins.inspectionType})</span>
                      <span className="text-emerald-600">اجتاز الفحص ✓</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{ins.notes}</p>
                    <p className="text-gray-400 text-[10px]">السائق: {ins.driverName} • {ins.inspectionDate}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                {isAr ? 'سجل المخالفات والحوادث الطارئة' : 'Incidents & Violations Log'}
              </h3>
              <div className="space-y-3 text-xs">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-800 dark:text-amber-300">{inc.licensePlate} - {inc.incidentType}</span>
                      <span className="text-amber-600">{inc.severity}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{inc.description}</p>
                    <p className="text-gray-500 text-[10px]">الموقع: {inc.locationName} • الحالة: {inc.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AI FLEET INTELLIGENCE */}
        {activeTab === 'ai-fleet' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                  {isAr ? 'المحلل الذكي للتنبؤ بأعطال الأسطول والتكلفة (AI Fleet Intelligence)' : 'AI Fleet Predictive Maintenance'}
                </h3>
                <p className="text-xs text-gray-500">
                  استخدام نماذج Gemini للذكاء الاصطناعي لتوقع التلف الميكانيكي وتوجيه السائقين وتوفير الوقود
                </p>
              </div>
            </div>

            {selectedVehicle && (
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">الشاحنة المختارة للتحليل:</span>
                    <h4 className="font-black text-lg text-gray-900 dark:text-gray-100">{selectedVehicle.licensePlate} ({selectedVehicle.fleetCode})</h4>
                  </div>
                  <button
                    onClick={() => handleRunAiDiagnostics(selectedVehicle)}
                    disabled={aiLoading}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLoading ? 'جاري التحليل والتشخيص...' : 'تشخيص العطل والتنبؤ'}</span>
                  </button>
                </div>

                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-800 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                        <span className="text-gray-400 text-[10px] block">مستوى مخاطر الأعطال</span>
                        <strong className="text-base text-amber-600">{aiResult.failureRiskLevel}</strong>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">{aiResult.failureRiskFactor}</p>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                        <span className="text-gray-400 text-[10px] block">الإجراء الوقائي الموصى به</span>
                        <p className="mt-1 font-bold text-indigo-600">{aiResult.recommendedMaintenanceAction}</p>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                        <span className="text-gray-400 text-[10px] block">العمر المتبقي للفراميل</span>
                        <strong className="text-base text-emerald-600">{aiResult.estimatedRemainingBrakeLifePercent}%</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                      <p className="font-bold text-gray-900 dark:text-gray-100">توجيه السائق الموصى به:</p>
                      <p className="text-gray-600 dark:text-gray-300">{aiResult.driverCoachingRecommendation}</p>
                      <p className="font-bold text-emerald-600 mt-2">نصيحة توفير الوقود: {aiResult.fuelOptimizationTip}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetCoreMainView;
