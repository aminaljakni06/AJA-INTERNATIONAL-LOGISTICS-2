import React, { useState, useEffect } from 'react';
import {
  Building2,
  Building,
  Boxes,
  Layers,
  QrCode,
  Radio,
  BarChart3,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Shield,
  Truck,
  ArrowRight,
  TrendingUp,
  Sliders,
  Maximize2,
  Zap,
  Tag,
  Cpu,
  Database,
  PackageCheck,
  Navigation,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  WarehouseLocation,
  WarehouseZone,
  WarehouseBin,
  WarehouseCapacityKPIs,
  AIWarehouseSpaceResult
} from '../../types/warehouse';
import { WarehouseClient } from '../../services/warehouseClient';
import { InboundWarehouseMainView } from './InboundWarehouseMainView';
import { InventoryControlMainView } from '../inventory/InventoryControlMainView';
import { InventoryOperationsMainView } from '../inventory/InventoryOperationsMainView';
import { OutboundLogisticsMainView } from './OutboundLogisticsMainView';
import { SmartWarehouseMainView } from './SmartWarehouseMainView';
import { WarehouseHierarchyView } from './foundation/WarehouseHierarchyView';
import { StorageRulesView } from './foundation/StorageRulesView';
import { WarehouseOperationsView } from './foundation/WarehouseOperationsView';
import { ExecutiveWMSDashboard } from './foundation/ExecutiveWMSDashboard';
import { AIWarehouseIntelligenceView } from './foundation/AIWarehouseIntelligenceView';
import { WarehouseExecutionMainView } from './wes/WarehouseExecutionMainView';

export const WarehouseCoreMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'registry' | 'wes-execution' | 'inbound-receiving' | 'inventory-control' | 'inventory-ops' | 'outbound-shipping' | 'smart-automation' | 'hierarchy' | 'zones' | 'bins' | 'storage-rules' | 'operations' | 'capacity' | 'rfid-barcode' | 'executive-wms' | 'ai-space-copilot'>('registry');

  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [kpis, setKpis] = useState<WarehouseCapacityKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseLocation | null>(null);
  const [selectedZone, setSelectedZone] = useState<WarehouseZone | null>(null);

  // AI Space Optimization State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSpaceResult, setAiSpaceResult] = useState<AIWarehouseSpaceResult | null>(null);

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const loadWarehouseData = async () => {
    setLoading(true);
    try {
      const [whData, zoneData, binData, kpiData] = await Promise.all([
        WarehouseClient.getWarehouses(),
        WarehouseClient.getWarehouseZones(),
        WarehouseClient.getWarehouseBins(),
        WarehouseClient.getWarehouseCapacityKPIs(),
      ]);
      setWarehouses(whData);
      setZones(zoneData);
      setBins(binData);
      setKpis(kpiData);

      if (whData.length > 0) {
        setSelectedWarehouse(whData[0]);
      }
      if (zoneData.length > 0) {
        setSelectedZone(zoneData[0]);
      }
    } catch (err) {
      console.error('Error loading warehouse core data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiSpaceOptimize = async () => {
    if (!selectedWarehouse) return;
    setAiLoading(true);
    setAiSpaceResult(null);
    try {
      const result = await WarehouseClient.optimizeSpace({
        warehouseId: selectedWarehouse.id,
        skuCode: 'SKU-MED-9081',
        itemCategoryAr: 'مستلزمات طبية وأدوية مبردة',
        isTemperatureSensitive: selectedWarehouse.temperatureControlled,
      });
      setAiSpaceResult(result);
    } catch (err) {
      console.error('AI Warehouse Space Optimizer Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter(w =>
    w.nameAr.includes(searchTerm) ||
    w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city.includes(searchTerm) ||
    w.managerName.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-2xl text-white shadow-md">
              <Boxes className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isAr ? 'منصة إدارة المستودعات وسلاسل الإمداد المركزية (Enterprise WMS)' : 'Enterprise Warehouse Management System (WMS)'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'إدارة المستودعات المتعددة Multi-Warehouse، الهيكلية والتخزين، تتبع RFID وBarcode، والسعة التخزينية المتقدمة' : 'Multi-Warehouse Network, Hierarchy, RFID Tracking, Landed Inventory & AI Space Optimization'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadWarehouseData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>{isAr ? 'نظام المستودعات متصل' : 'WMS Engine Active'}</span>
          </div>
        </div>
      </div>

      {/* KPIS SUMMARY */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>{isAr ? 'إجمالي مواضع الطبالي (Pallets)' : 'Total Pallet Positions'}</span>
              <Boxes className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {kpis.totalPalletPositions.toLocaleString()} <span className="text-xs font-normal text-gray-500">{isAr ? 'موقف' : 'Positions'}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">
              نسبة الإشغال الإجمالية: {kpis.overallUtilizationPercent}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>{isAr ? 'المواضع الشاغرة المتاحة' : 'Available Pallet Bins'}</span>
              <Maximize2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {kpis.availablePalletPositions.toLocaleString()} <span className="text-xs font-normal text-gray-500">{isAr ? 'شاغر' : 'Available'}</span>
            </div>
            <div className="text-[10px] text-gray-400">
              جاهزة فورية لاستقبال الشحنات
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>{isAr ? 'استغلال التبريد المركزي Cold' : 'Cold Storage Usage'}</span>
              <Thermometer className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {kpis.coldStorageUtilizationPercent}%
            </div>
            <div className="text-[10px] text-cyan-600 font-bold">
              نظام تبريد مراقب بـ IoT
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>{isAr ? 'دقة المسح البصري والـ RFID' : 'RFID Scan Accuracy'}</span>
              <Radio className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {kpis.rfidScannedRatePercent}%
            </div>
            <div className="text-[10px] text-indigo-600 font-bold">
              تتبع آلي بدون تدابير يدوية
            </div>
          </div>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'registry', label: isAr ? 'سجل المستودعات الشبكية' : 'Warehouse Registry', icon: Building2 },
          { id: 'wes-execution', label: isAr ? 'محرك تنفيذ المستودعات (WES Execution)' : 'WES Execution Platform', icon: Sliders },
          { id: 'hierarchy', label: isAr ? 'الهيكلية التخزينية (Hierarchy)' : 'Warehouse Hierarchy', icon: Building },
          { id: 'inbound-receiving', label: isAr ? 'الاستلام والشحن الوارد (Inbound & Putaway)' : 'Inbound & Putaway', icon: Truck },
          { id: 'inventory-control', label: isAr ? 'إدارة وحركة المخزون (Inventory Control)' : 'Inventory Control', icon: PackageCheck },
          { id: 'inventory-ops', label: isAr ? 'عمليات المخزون والحجوزات (Inventory Operations)' : 'Inventory Operations', icon: Sliders },
          { id: 'outbound-shipping', label: isAr ? 'التحضير والشحن المغادر (Outbound & Wave)' : 'Outbound & Wave Picking', icon: Navigation },
          { id: 'smart-automation', label: isAr ? 'الأتمتة والروبوتات والمستودع الذكي (Smart Automation)' : 'Robotics & Smart Automation', icon: Bot },
          { id: 'zones', label: isAr ? 'إدارة المناطق (Zones)' : 'Zone Management', icon: Layers },
          { id: 'bins', label: isAr ? 'مصفوفة الخانات والأرفف (Bins)' : 'Bin Location Matrix', icon: Boxes },
          { id: 'storage-rules', label: isAr ? 'قواعد التخزين (Rules Engine)' : 'Storage Rules', icon: Sliders },
          { id: 'operations', label: isAr ? 'العمليات والورديات (Operations)' : 'Operations & Shifts', icon: Zap },
          { id: 'capacity', label: isAr ? 'تحليل السعة والتوزيع' : 'Capacity Analytics', icon: BarChart3 },
          { id: 'rfid-barcode', label: isAr ? 'منظومة RFID والـ Barcode' : 'RFID & Barcode Hub', icon: QrCode },
          { id: 'executive-wms', label: isAr ? 'لوحة القيادة التنفيذية (Executive WMS)' : 'Executive WMS Dashboard', icon: TrendingUp },
          { id: 'ai-space-copilot', label: isAr ? 'ذكاء المستودعات AI' : 'AI WMS Intelligence', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
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

        {/* TAB 1: WAREHOUSE REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث باسم المستودع، الكود، المدينة، أو المدير المسؤول...' : 'Search warehouse name, code, city, manager...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredWarehouses.map((wh) => (
                <div
                  key={wh.id}
                  onClick={() => setSelectedWarehouse(wh)}
                  className={`p-6 rounded-3xl border bg-white dark:bg-gray-800 space-y-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedWarehouse?.id === wh.id ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600">{wh.code}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {wh.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-gray-900 dark:text-gray-100">{wh.nameAr}</h3>
                    <p className="text-xs text-gray-500">{wh.city} • {wh.addressAr}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">سعة الطبالي الإجمالية:</span>
                      <strong className="text-gray-900 dark:text-gray-100">{wh.totalCapacityPallets.toLocaleString()} طبلية</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الطبالي المشغولة:</span>
                      <strong className="text-amber-600">{wh.occupiedCapacityPallets.toLocaleString()} طبلية</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المدير المسؤول:</span>
                      <strong className="text-gray-700 dark:text-gray-300">{wh.managerName}</strong>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-400">نسبة الاستغلال</span>
                      <span className="text-amber-600">{wh.utilizationPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${wh.utilizationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[10px] font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                      {wh.temperatureControlled ? 'مستودع مبرد' : 'مستودع جاف'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-indigo-600" />
                      {wh.rfidEnabled ? 'داعم لـ RFID' : 'باركود عادي'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB WES EXECUTION PLATFORM */}
        {activeTab === 'wes-execution' && (
          <WarehouseExecutionMainView />
        )}

        {/* TAB HIERARCHY */}
        {activeTab === 'hierarchy' && (
          <WarehouseHierarchyView />
        )}

        {/* TAB 1.5: INBOUND LOGISTICS & PUTAWAY */}
        {activeTab === 'inbound-receiving' && (
          <InboundWarehouseMainView />
        )}

        {/* TAB 1.8: INVENTORY CONTROL & REPLENISHMENT */}
        {activeTab === 'inventory-control' && (
          <InventoryControlMainView />
        )}

        {/* TAB 1.85: INVENTORY OPERATIONS & RESERVATIONS */}
        {activeTab === 'inventory-ops' && (
          <InventoryOperationsMainView />
        )}

        {/* TAB 1.9: OUTBOUND LOGISTICS & WAVE PICKING */}
        {activeTab === 'outbound-shipping' && (
          <OutboundLogisticsMainView />
        )}

        {/* TAB 1.95: SMART WAREHOUSE & AUTOMATION */}
        {activeTab === 'smart-automation' && (
          <SmartWarehouseMainView />
        )}

        {/* TAB STORAGE RULES */}
        {activeTab === 'storage-rules' && (
          <StorageRulesView />
        )}

        {/* TAB OPERATIONS */}
        {activeTab === 'operations' && (
          <WarehouseOperationsView />
        )}

        {/* TAB EXECUTIVE WMS */}
        {activeTab === 'executive-wms' && (
          <ExecutiveWMSDashboard />
        )}

        {/* TAB AI SPACE INTELLIGENCE */}
        {activeTab === 'ai-space-copilot' && (
          <AIWarehouseIntelligenceView />
        )}

        {/* TAB 2: ZONE MANAGEMENT */}
        {activeTab === 'zones' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-amber-600">
                <Layers className="w-5 h-5" />
                <span>إدارة مناطق التخزين والانتقاء (Warehouse Zone Manager)</span>
              </h3>
              <p className="text-xs text-gray-500">تقسيم المستودع إلى مناطق تبريد، تجميع، مواد خطرة، واستلام</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zones.map((zn) => (
                <div
                  key={zn.id}
                  onClick={() => setSelectedZone(zn)}
                  className={`p-5 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                    selectedZone?.id === zn.id
                      ? 'bg-amber-50/50 border-amber-500 dark:bg-amber-950/20'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">{zn.code}</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                      {zn.zoneType}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-gray-900 dark:text-gray-100">{zn.nameAr}</h4>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">عدد الخانات الإجمالي:</span>
                      <strong className="text-gray-900 dark:text-gray-100">{zn.totalBinsCount} bin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الخانات المشغولة:</span>
                      <strong className="text-amber-600">{zn.occupiedBinsCount} bin ({zn.utilizationPercent}%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">درجة الحماية والأمان:</span>
                      <strong className="text-indigo-600">{zn.securityLevel}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BIN LOCATION MATRIX */}
        {activeTab === 'bins' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-amber-600">
                <Boxes className="w-5 h-5" />
                <span>مصفوفة الخانات والأرفف التفصيلية (Bin Location Matrix)</span>
              </h3>
              <p className="text-xs text-gray-500">تتبع الخانات بالـ Aisle (الممر)، Rack (الرف)، Shelf (الرف الفرعي)، والـ Position</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="p-3">كود الخانة (Bin Code)</th>
                    <th className="p-3">الممر - الرف</th>
                    <th className="p-3">الباركود & RFID Tag</th>
                    <th className="p-3">المنتج المخزن حالياً</th>
                    <th className="p-3">الوزن / الحجم</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {bins.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 font-mono font-black text-amber-600">{b.binCode}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">ممر {b.aisle} • رف {b.rack}</td>
                      <td className="p-3 space-y-0.5 font-mono text-[10px]">
                        <div className="text-blue-600 font-bold">{b.barcode}</div>
                        <div className="text-indigo-600">{b.rfidTagId}</div>
                      </td>
                      <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                        {b.currentProductNameAr || '— لا يوجد شحنة (شاغر) —'}
                      </td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-300">
                        {b.currentWeightKg} / {b.maxWeightKg} كجم
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'OCCUPIED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CAPACITY ANALYTICS */}
        {activeTab === 'capacity' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
                <span>تحليلات السعة التخزينية المتقدمة (Warehouse Capacity Analytics)</span>
              </h3>
              <p className="text-xs text-gray-500">تنبؤات السعة، معدلات الدوران والافتراضات اللوجستية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-black text-sm text-gray-900 dark:text-gray-100">توزيع السعة حسب المناطق الإقليمية</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>الرياض (المنطقة الوسطى)</span>
                      <span className="text-amber-600">79.2%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '79.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>الدمام (المنطقة الشرقية)</span>
                      <span className="text-amber-600">78.8%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '78.8%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>جدة (المنطقة الغربية)</span>
                      <span className="text-amber-600">74.1%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '74.1%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-black text-sm text-gray-900 dark:text-gray-100">معدل دوران المخزون (Inventory Turnover)</h4>
                <p className="text-xs text-gray-500">متوسط بقاء الشحنة في المستودع قبل الشحن النهائي: <strong>4.2 يوم</strong></p>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-emerald-600">
                  كفاءة التفريغ والشحن السريع (Cross Docking Efficiency): 96.8%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RFID & BARCODE HUB */}
        {activeTab === 'rfid-barcode' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-indigo-600">
                <QrCode className="w-5 h-5" />
                <span>منظومة تتبع الباركود وشرائح الـ RFID اللوجستية (Barcode & RFID Engine)</span>
              </h3>
              <p className="text-xs text-gray-500">مولد الملصقات، أجهزة القراءة الآلية RFID Readers، والتتبع اللحظي للشحنات</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  <span>أجهزة قراءة الـ RFID بالبوابات اللوجستية</span>
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <strong className="block text-gray-900 dark:text-gray-100">بوابة الاستلام 01 (Gate Alpha)</strong>
                      <span className="text-gray-400 text-[10px]">قراءة تلقائية عند العبور بسرعة 15 كم/س</span>
                    </div>
                    <span className="text-emerald-600 font-bold">متصل بـ IoT</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <strong className="block text-gray-900 dark:text-gray-100">بوابة الشحن 04 (Gate Bravo)</strong>
                      <span className="text-gray-400 text-[10px]">مطابقة تلقائية للـ Shipping Manifest</span>
                    </div>
                    <span className="text-emerald-600 font-bold">متصل بـ IoT</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>مولد طباعة ملصقات الطبالي والشحنات</span>
                </h4>
                <p className="text-gray-500">طباعة ملصقات QR Code مخصصة تحتوي على رقم التتبع، نوع الصنف وحالة التبريد.</p>
                <button className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition-all">
                  إرسال أمر طباعة دفعة ملصقات (Print Batch Labels)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI SPACE OPTIMIZER & PUTAWAY COPILOT */}
        {activeTab === 'ai-space-copilot' && selectedWarehouse && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-amber-600">
                <Sparkles className="w-5 h-5" />
                <span>مساعد الذكاء الاصطناعي لتخزين ومساحات المستودع (AI WMS Space Optimizer)</span>
              </h3>
              <p className="text-xs text-gray-500">تحليل نماذج Gemini لتوصيات الإيداع Putaway، وتفادي ازدحام الممرات والتنبؤ بالسعة</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-600">المستودع المستهدف:</span>
                  <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{selectedWarehouse.nameAr} ({selectedWarehouse.code})</h4>
                </div>
                <button
                  onClick={handleRunAiSpaceOptimize}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'جاري التحليل التخزيني...' : 'توليد توصية التخزين بـ AI'}</span>
                </button>
              </div>

              {aiSpaceResult && (
                <div className="space-y-4 pt-4 border-t border-amber-200 dark:border-amber-800 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <span className="text-gray-400 text-[10px] block">تقييم استغلال المساحة الحالي</span>
                      <strong className="text-lg font-black text-amber-600">{aiSpaceResult.spaceOptimizationScorePercent}%</strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <span className="text-gray-400 text-[10px] block">المنطقة الموصى بها (Putaway Zone)</span>
                      <strong className="text-sm font-black text-gray-900 dark:text-gray-100">{aiSpaceResult.recommendedPutawayZoneAr}</strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <span className="text-gray-400 text-[10px] block">كود الرف/الخانة المقترح</span>
                      <strong className="text-lg font-mono font-black text-indigo-600">{aiSpaceResult.recommendedPutawayBinAr}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/40 space-y-2">
                    <p className="font-bold text-gray-900 dark:text-gray-100">التوصيات الذكية لإعادة ترتيب المساحة:</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      {aiSpaceResult.actionableSpaceRecommendationsAr.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>

                    <p className="font-bold text-gray-900 dark:text-gray-100 mt-3">توقع السعة للأشهر القادمة:</p>
                    <p className="text-amber-700 dark:text-amber-300">{aiSpaceResult.capacityForecastMonthsAr}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseCoreMainView;
