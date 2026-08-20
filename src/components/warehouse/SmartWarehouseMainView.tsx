import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Bot,
  Zap,
  Activity,
  Layers,
  Radio,
  Thermometer,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Gauge,
  Wifi,
  Eye,
  Sliders,
  Battery,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  WarehouseRobotRecord,
  ASRSUnitRecord,
  ConveyorLineRecord,
  RFIDPortalEvent,
  IoTSensorTelemetry,
  PredictiveMaintenanceAlert,
  AISmartWarehouseOptimizationResult
} from '../../types/smartWarehouse';
import { SmartWarehouseClient } from '../../services/smartWarehouseClient';

export const SmartWarehouseMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'robotics' | 'asrs-conveyors' | 'rfid-iot' | 'predictive-maint' | 'digital-twin' | 'ai-orchestrator'>('robotics');

  const [robots, setRobots] = useState<WarehouseRobotRecord[]>([]);
  const [asrs, setAsrs] = useState<ASRSUnitRecord[]>([]);
  const [conveyors, setConveyors] = useState<ConveyorLineRecord[]>([]);
  const [rfidEvents, setRfidEvents] = useState<RFIDPortalEvent[]>([]);
  const [iotTelemetry, setIotTelemetry] = useState<IoTSensorTelemetry[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<PredictiveMaintenanceAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // AI Orchestrator state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISmartWarehouseOptimizationResult | null>(null);

  // Digital Twin Simulation state
  const [simulationActive, setSimulationActive] = useState(false);
  const [simTimeSpeed, setSimTimeSpeed] = useState<number>(1);

  useEffect(() => {
    loadSmartWarehouseData();
  }, []);

  const loadSmartWarehouseData = async () => {
    setLoading(true);
    try {
      const [robotData, asrsData, conveyorData, rfidData, iotData, maintData] = await Promise.all([
        SmartWarehouseClient.getSmartRobots(),
        SmartWarehouseClient.getASRSUnits(),
        SmartWarehouseClient.getConveyorLines(),
        SmartWarehouseClient.getRFIDEvents(),
        SmartWarehouseClient.getIoTSensorTelemetry(),
        SmartWarehouseClient.getPredictiveMaintenanceAlerts(),
      ]);
      setRobots(robotData);
      setAsrs(asrsData);
      setConveyors(conveyorData);
      setRfidEvents(rfidData);
      setIotTelemetry(iotData);
      setMaintenanceAlerts(maintData);
    } catch (err) {
      console.error('Error loading smart warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAutomationOptimize = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await SmartWarehouseClient.optimizeAutomation('WH-RUH-01');
      setAiResult(result);
    } catch (err) {
      console.error('AI Smart Warehouse Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredRobots = robots.filter(r =>
    r.robotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.currentZone.includes(searchTerm)
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl text-white shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isAr ? 'منصة الأتمتة والروبوتات والمستودع الذكي (Smart Warehouse Automation & Digital Twin)' : 'Enterprise Smart Warehouse & Robotics Automation Platform'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'إدارة روبوتات AMR/AGV، التخزين الآلي AS/RS، السيور الناقلة، RFID/IoT، الصيانة التنبؤية والتأوم الرقمي Digital Twin' : 'AMR/AGV Fleet, AS/RS, Automated Conveyors, RFID Gate Portals, IoT Telemetry, Predictive Maintenance & Digital Twin'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSmartWarehouseData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 px-3 py-1.5 rounded-xl text-cyan-700 dark:text-cyan-300 text-xs font-bold">
            <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
            <span>{isAr ? 'شبكة IoT والروبوتات متصلة' : 'IoT & Robotics Grid Live'}</span>
          </div>
        </div>
      </div>

      {/* KPIS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'أسطول الروبوتات AMR/AGV' : 'Robots Fleet'}</span>
          <div className="text-xl font-black text-cyan-600">{robots.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'روبوت' : 'Units'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'وحدات AS/RS الآلية' : 'AS/RS Cranes'}</span>
          <div className="text-xl font-black text-indigo-600">{asrs.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'رافع' : 'Cranes'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'خطوط السيور الناقلة' : 'Conveyors'}</span>
          <div className="text-xl font-black text-emerald-600">{conveyors.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'خط' : 'Lines'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'بوابات RFID النشطة' : 'RFID Portals'}</span>
          <div className="text-xl font-black text-amber-600">{rfidEvents.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'حدث' : 'Passes'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'حساسات البيئة IoT' : 'IoT Sensors'}</span>
          <div className="text-xl font-black text-blue-600">{iotTelemetry.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'حساس' : 'Sensors'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'بلاغات الصيانة التنبؤية' : 'Predictive Maintenance'}</span>
          <div className="text-xl font-black text-rose-600">{maintenanceAlerts.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'تنبيه' : 'Alerts'}</span></div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'robotics', label: isAr ? 'أسطول الروبوتات (AMR / AGV)' : 'Robotics Fleet Center', icon: Bot },
          { id: 'asrs-conveyors', label: isAr ? 'التخزين الآلي والسيور (AS/RS & Conveyors)' : 'AS/RS & Conveyor Systems', icon: Layers },
          { id: 'rfid-iot', label: isAr ? 'شبكة RFID وحساسات IoT' : 'RFID & Environmental IoT', icon: Wifi },
          { id: 'predictive-maint', label: isAr ? 'الصيانة التنبؤية (Predictive Maintenance)' : 'Predictive Equipment Maintenance', icon: ShieldAlert },
          { id: 'digital-twin', label: isAr ? 'التوأم الرقمي والمحاكاة (Digital Twin)' : 'Digital Twin & Simulation', icon: Eye },
          { id: 'ai-orchestrator', label: isAr ? 'مُوجه الأتمتة بالذكاء الاصطناعي AI' : 'AI Robotics Orchestrator', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-6">

        {/* TAB 1: ROBOTICS FLEET */}
        {activeTab === 'robotics' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث بكود الروبوت، الموديل، المنطقة...' : 'Search Robot Code, Model, Zone...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRobots.map((r) => (
                <div key={r.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-cyan-600">{r.robotCode}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {r.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{r.modelName}</h4>
                    <p className="text-xs text-gray-500">النوع: {r.type} • المنطقة: {r.currentZone}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5 text-emerald-500" /> نسبة البطارية:</span>
                      <strong className="text-emerald-600 font-mono font-bold">{r.batteryLevelPercent}%</strong>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${r.batteryLevelPercent}%` }}></div>
                    </div>

                    <div className="flex justify-between text-gray-500 pt-1">
                      <span>المهمة الحالية:</span>
                      <strong className="text-indigo-600 font-mono">{r.currentMissionNumber || 'في الانتظار'}</strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>ساعات التشغيل الكلية:</span>
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">{r.operatingHoursTotal} ساعة</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ASRS & CONVEYORS */}
        {activeTab === 'asrs-conveyors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>نظام التخزين والاسترجاع الآلي (AS/RS High-Bay Racks)</span>
              </h4>

              {asrs.map((a) => (
                <div key={a.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-indigo-600">{a.asrsCode}</span>
                    <span className="text-emerald-600">{a.craneStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-500">
                    <div>إجمالي الخانات الآلية: <strong className="text-gray-800 dark:text-gray-200 font-mono">{a.totalRackBins}</strong></div>
                    <div>المشغولة حالياً: <strong className="text-blue-600 font-mono">{a.occupiedBins}</strong></div>
                    <div>سرعة الرافعة: <strong className="text-emerald-600 font-mono">{a.retrievalSpeedMetersPerSec} م/ث</strong></div>
                    <div>مؤشر صحة الرافعة: <strong className="text-amber-600 font-mono">{a.healthScorePercent}%</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>منظومة السيور والفرز الآلي (Conveyor & Sorting)</span>
              </h4>

              {conveyors.map((c) => (
                <div key={c.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-emerald-600">{c.conveyorLineCode}</span>
                    <span className="text-emerald-600">{c.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-500">
                    <div>سرعة الحزام: <strong className="text-gray-800 dark:text-gray-200 font-mono">{c.beltSpeedMetersPerSec} م/ث</strong></div>
                    <div>القطع المعالجة اليوم: <strong className="text-blue-600 font-mono">{c.itemsProcessedToday}</strong></div>
                    <div>بوابة التوجيه والفرز: <strong className="text-indigo-600 font-mono">{c.diverterGateActive ? 'نشطة' : 'متوقفة'}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RFID & IOT */}
        {activeTab === 'rfid-iot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-600" />
                <span>سجل قراءات بوابات RFID (RFID Portal Gate Logs)</span>
              </h4>

              {rfidEvents.map((r) => (
                <div key={r.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-amber-600">{r.portalCode}</span>
                    <span className="text-emerald-600">{r.verificationStatus}</span>
                  </div>
                  <p className="text-gray-500">رمز Tag Hex: <strong className="text-gray-800 dark:text-gray-200 font-mono">{r.rfidTagHex}</strong></p>
                  <p className="text-gray-500">الصنف: <strong className="text-indigo-600 font-mono">{r.detectedSkuCode}</strong> • الاتجاه: {r.eventDirection}</p>
                  <p className="text-gray-400 text-[10px]">{r.timestamp}</p>
                </div>
              ))}
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600" />
                <span>قراءات حساسات البيئة المباشرة IoT (Environmental Sensors)</span>
              </h4>

              {iotTelemetry.map((iot) => (
                <div key={iot.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-blue-600">{iot.sensorCode}</span>
                    <span className="text-emerald-600">{iot.status}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500">القراءة الحالية:</span>
                    <strong className="text-2xl font-black text-emerald-600 font-mono">{iot.currentValue} {iot.unit}</strong>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>النطاق الطبيعي المسموح: {iot.normalMinThreshold} - {iot.normalMaxThreshold} {iot.unit}</span>
                    <span>آخر إشارة: {iot.lastPingAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PREDICTIVE MAINTENANCE */}
        {activeTab === 'predictive-maint' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>مركز الصيانة التنبؤية للروبوتات والمعدات (Predictive Maintenance Hub)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {maintenanceAlerts.map((m) => (
                <div key={m.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-3">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-rose-600">{m.equipmentCode} ({m.equipmentType})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                      مستوى المخاطرة: {m.predictedFailureRisk}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>مؤشر السلامة والصحة: <strong className="text-emerald-600 font-mono">{m.healthScorePercent}%</strong></span>
                    <span>الوقت المتبقي حتى إجراء الصيانة: <strong className="text-indigo-600 font-mono">{m.estimatedHoursToMaintenance} ساعة</strong></span>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-indigo-700 dark:text-indigo-300 font-bold">
                    التوصية الذكية: {m.recommendedActionAr}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DIGITAL TWIN & SIMULATION */}
        {activeTab === 'digital-twin' && (
          <div className="p-6 bg-gray-900 text-white rounded-3xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-cyan-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>التأوم الرقمي والمحاكاة ثلاثية الأبعاد (Digital Twin Realtime Spatial Grid)</span>
                </h3>
                <p className="text-xs text-gray-400">تتبع حي لمسارات حركة روبوتات AMR، تدفق الخانات ومناطق الازدحام</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimulationActive(!simulationActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    simulationActive ? 'bg-rose-600 text-white' : 'bg-cyan-600 text-white'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{simulationActive ? 'إيقاف المحاكاة' : 'بدء محاكاة التدفق'}</span>
                </button>
              </div>
            </div>

            {/* DIGITAL TWIN GRID VISUALIZER */}
            <div className="p-6 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
              <div className="grid grid-cols-6 gap-3 text-center text-[10px] font-mono">
                {['Z-COLD-01 (مبرد)', 'Z-BULK-02 (ثقيل)', 'Z-PACK-01 (تغليف)', 'ASRS-RACK-A', 'CONVEYOR-L1', 'DOCK-04'].map((zone, i) => (
                  <div key={i} className="p-4 bg-gray-900/80 rounded-xl border border-cyan-900/50 space-y-2">
                    <span className="text-cyan-400 font-bold block">{zone}</span>
                    <div className="flex justify-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${simulationActive ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`}></span>
                      <span className="text-gray-400">AMR-0{i+1}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-900 rounded-xl text-xs text-gray-300 flex justify-between items-center">
                <span>حالة خريطة التدفق الحيزي Spatial Twin: <strong>طبيعية دون وجود اختناقات (Zero Traffic Congestion)</strong></span>
                <span className="text-cyan-400 font-mono">دقة التزامن: 99.98%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI ROBOTICS ORCHESTRATOR */}
        {activeTab === 'ai-orchestrator' && (
          <div className="p-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-3xl border border-cyan-200 dark:border-cyan-900/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-cyan-600 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>مُوجّه الأتمتة بالذكاء الاصطناعي (AI Robotics & Automation Orchestrator)</span>
                </h3>
                <p className="text-xs text-gray-500">استخدام Gemini لتنسيق حركة الروبوتات وتوفير استهلاك الطاقة وترتيب الأولويات</p>
              </div>

              <button
                onClick={handleRunAiAutomationOptimize}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'جاري التحليل وتوزيع التكليفات...' : 'توليد خطة الأتمتة بـ AI'}</span>
              </button>
            </div>

            {aiResult && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/40">
                    <span className="text-gray-400 text-[10px] block">كفاءة أسطول الروبوتات AMR/AGV</span>
                    <strong className="text-xl font-black text-cyan-600">{aiResult.robotFleetEfficiencyScorePercent}%</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/40">
                    <span className="text-gray-400 text-[10px] block">نسبة الوفر المتوقع بالطاقة</span>
                    <strong className="text-xl font-black text-emerald-600">{aiResult.energyOptimizationSavingsPercent}%</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/40">
                    <span className="text-gray-400 text-[10px] block">نسبة ثقة الخوارزمية</span>
                    <strong className="text-xl font-black text-indigo-600">{aiResult.aiConfidencePercent}%</strong>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/40 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">تقرير حالة حركة السيور الناقلة:</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{aiResult.conveyorTrafficStatusAr}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">خطة إعادة توزيع وتكليف الروبوتات (Recommended Dispatch):</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                      {aiResult.recommendedRobotDispatchPlanAr.map((plan, idx) => (
                        <li key={idx}>{plan}</li>
                      ))}
                    </ul>
                  </div>

                  {aiResult.predictiveMaintenanceWarningsAr.length > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-amber-800 dark:text-amber-300">
                      <strong>تنبيه صيانة أجهزة الأتمتة: </strong> {aiResult.predictiveMaintenanceWarningsAr.join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartWarehouseMainView;
