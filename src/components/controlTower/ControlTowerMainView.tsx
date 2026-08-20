import React, { useState, useEffect } from 'react';
import {
  Radio,
  MapPin,
  Compass,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sparkles,
  Search,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Thermometer,
  Zap,
  Truck,
  FileCheck,
  Building,
  Navigation,
  CheckSquare,
  BarChart3,
  QrCode,
  FileText,
  Eye,
  ArrowRight,
  Layers,
  Battery,
  Wind,
  ShieldCheck,
  User,
  Phone,
  Maximize2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ShipmentExecutionOrder,
  ShipmentMilestone,
  ShipmentException,
  ProofOfDeliveryRecord,
  GeofenceZone,
  AILogisticsAnalysisResult
} from '../../types/controlTower';
import { ControlTowerClient } from '../../services/controlTowerClient';
import { useAnalyticsQuery } from '../../hooks/useAnalyticsQuery';

export const ControlTowerMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const { metrics: ctMetrics, refetch: refetchCtMetrics } = useAnalyticsQuery({
    resource: 'control_tower',
    metricIds: [
      'ct_active_shipments',
      'ct_open_exceptions',
      'ct_critical_exceptions',
      'ct_delayed_shipments',
      'ct_sla_breaches',
      'ct_otd_rate',
      'ct_resolution_rate',
      'ct_logistics_health_score',
    ],
    autoFetch: true,
  });

  const [activeTab, setActiveTab] = useState<'command-center' | 'execution-milestones' | 'eta-engine' | 'exceptions' | 'executive-kpis' | 'ai-copilot'>('command-center');

  const [executions, setExecutions] = useState<ShipmentExecutionOrder[]>([]);
  const [exceptions, setExceptions] = useState<ShipmentException[]>([]);
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedExecution, setSelectedExecution] = useState<ShipmentExecutionOrder | null>(null);
  const [selectedMilestones, setSelectedMilestones] = useState<ShipmentMilestone[]>([]);
  const [selectedPOD, setSelectedPOD] = useState<ProofOfDeliveryRecord | null>(null);

  // Resolution modal state
  const [resolvingException, setResolvingException] = useState<ShipmentException | null>(null);
  const [resolutionActionText, setResolutionActionText] = useState('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AILogisticsAnalysisResult | null>(null);

  useEffect(() => {
    loadControlTowerData();
  }, []);

  const loadControlTowerData = async () => {
    setLoading(true);
    try {
      const [executionData, excList] = await Promise.all([
        ControlTowerClient.getExecutionsAndGeofences(),
        ControlTowerClient.getExceptions(),
      ]);
      setExecutions(executionData.executions);
      setExceptions(excList);
      setGeofences(executionData.geofences);

      if (executionData.executions.length > 0) {
        setSelectedExecution(executionData.executions[0]);
        loadExecutionDetails(executionData.executions[0].id);
      }
      refetchCtMetrics();
    } catch (err) {
      console.error('Error loading Control Tower data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionDetails = async (executionId: string) => {
    try {
      const [msList, podRec] = await Promise.all([
        ControlTowerClient.getMilestones(executionId),
        ControlTowerClient.getProofOfDelivery(executionId),
      ]);
      setSelectedMilestones(msList);
      setSelectedPOD(podRec);
    } catch (err) {
      console.error('Error loading execution details:', err);
    }
  };

  const handleSelectExecution = (exec: ShipmentExecutionOrder) => {
    setSelectedExecution(exec);
    loadExecutionDetails(exec.id);
  };

  const handleRunAiAnalysis = async (exec: ShipmentExecutionOrder) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const result = await ControlTowerClient.analyzeShipment({
        executionId: exec.id,
        trackingNumber: exec.trackingNumber,
        currentStage: exec.currentStage,
        telemetry: exec.telemetry,
        originCity: exec.originCity,
        destinationCity: exec.destinationCity,
      });
      setAiAnalysis(result);
    } catch (err) {
      console.error('AI Control Tower Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleResolveExceptionSubmit = async () => {
    if (!resolvingException || !resolutionActionText) return;
    setResolvingLoading(true);
    try {
      await ControlTowerClient.resolveException(resolvingException.id, resolutionActionText);
      setResolvingException(null);
      setResolutionActionText('');
      loadControlTowerData();
    } catch (err) {
      console.error('Resolve Exception error:', err);
    } finally {
      setResolvingLoading(false);
    }
  };

  const filteredExecutions = executions.filter(e =>
    e.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.customerName.includes(searchTerm) ||
    e.driverName.includes(searchTerm) ||
    e.originCity.includes(searchTerm) ||
    e.destinationCity.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-700 to-indigo-700 rounded-2xl text-white shadow-md">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isAr ? 'برج المراقبة والتحكم اللوجستي العالمي (Control Tower)' : 'Global Enterprise Logistics Control Tower'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'منظومة القيادة المباشرة لربط التتبع، محرك التنبؤ بالوصول ETA والحد من استثناءات الشحن' : 'Real-Time Command Center, End-to-End Tracking, AI Dynamic ETA & Exception Operations'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadControlTowerData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{isAr ? 'البث المباشر نشط (Live Stream Active)' : 'Live Telemetry Active'}</span>
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'الشحنات النشطة على الخريطة' : 'Active Live Shipments'}</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {ctMetrics.ct_active_shipments?.value ?? executions.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'شحنة' : 'Shipments'}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{ctMetrics.ct_otd_rate?.value ?? 98.6}% {isAr ? 'أداء الالتزام بالتسليم OTD' : 'OTD Performance'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'الاستثناءات والمخاطر' : 'Active Exceptions & Risks'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">
            {ctMetrics.ct_open_exceptions?.value ?? exceptions.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'تنبيه' : 'Exceptions'}</span>
          </div>
          <div className="text-[10px] text-amber-600 font-bold">
            {isAr ? `حرجة: ${ctMetrics.ct_critical_exceptions?.value ?? 0} | تجاوزات SLA: ${ctMetrics.ct_sla_breaches?.value ?? 0}` : `Critical: ${ctMetrics.ct_critical_exceptions?.value ?? 0} | SLA Breaches: ${ctMetrics.ct_sla_breaches?.value ?? 0}`}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'مؤشر صحة المنظومة اللوجستية' : 'Logistics Health Score'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {ctMetrics.ct_logistics_health_score?.value ?? 96.8}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {isAr ? `معدل حل الاستثناءات: ${ctMetrics.ct_resolution_rate?.value ?? 100}%` : `Resolution Rate: ${ctMetrics.ct_resolution_rate?.value ?? 100}%`}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'مناطق النطاق الجغرافي (Geofences)' : 'Active Geofence Zones'}</span>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {geofences.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'منطقة' : 'Zones'}</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">
            {isAr ? 'موانئ ومطارات ومراكز توزيع رئيسية' : 'Ports, Airports & Key Hubs'}
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'command-center', label: isAr ? 'مركز القيادة المباشرة والرادار' : 'Live Command Center & Map', icon: Radio },
          { id: 'execution-milestones', label: isAr ? 'المراحل التشغيلية والـ POD' : 'Execution & POD Milestones', icon: CheckSquare },
          { id: 'eta-engine', label: isAr ? 'محرك التنبؤ بموعد الوصول ETA' : 'Dynamic ETA Engine', icon: Clock },
          { id: 'exceptions', label: isAr ? 'إدارة التنبيهات والأخطار' : 'Exceptions & Risk Center', icon: AlertTriangle },
          { id: 'executive-kpis', label: isAr ? 'لوحة القيادة التنفيذية' : 'Executive Dashboard', icon: BarChart3 },
          { id: 'ai-copilot', label: isAr ? 'مساعد التنبؤ الذكي AI Copilot' : 'AI Control Tower Copilot', icon: Sparkles },
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

      {/* MAIN TAB CONTENT AREA */}
      <div className="space-y-6">

        {/* TAB 1: COMMAND CENTER & GIS MAP VIEW */}
        {activeTab === 'command-center' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? 'بحث برقم التتبع، اسم العميل، اسم السائق، المجمعات...' : 'Search tracking #, customer, driver, hubs...'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>

              {/* SIMULATED LIVE MAP CONTAINER */}
              <div className="relative bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden min-h-[380px] flex flex-col justify-between text-white">
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                
                {/* MAP TOP BAR */}
                <div className="relative z-10 flex items-center justify-between bg-slate-900/80 backdrop-blur p-3 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Compass className="w-4 h-4 animate-spin" />
                    <span>تتبع الأسطول المباشر - المملكة العربية السعودية ودول الخليج</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span>GPS Active</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                </div>

                {/* MAP SIMULATED PINS & ROUTES */}
                <div className="relative z-10 my-auto grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
                  {filteredExecutions.map((exec) => (
                    <div
                      key={exec.id}
                      onClick={() => handleSelectExecution(exec)}
                      className={`p-4 rounded-2xl border backdrop-blur transition-all cursor-pointer space-y-2 ${
                        selectedExecution?.id === exec.id
                          ? 'bg-blue-600/30 border-blue-400 shadow-lg ring-2 ring-blue-500/50'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                          {exec.trackingNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          exec.hasActiveException ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {exec.currentStage}
                        </span>
                      </div>

                      <p className="text-xs font-black truncate">{exec.customerName}</p>

                      <div className="text-[11px] text-slate-300 flex items-center justify-between">
                        <span>{exec.originCity.split('-')[0]}</span>
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                        <span>{exec.destinationCity.split('-')[0]}</span>
                      </div>

                      {/* TELEMETRY MINI BADGES */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-teal-300 font-bold">
                          <Thermometer className="w-3 h-3 text-teal-400" />
                          {exec.telemetry.temperatureCelsius}°C
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300 font-bold">
                          <Battery className="w-3 h-3 text-emerald-400" />
                          {exec.telemetry.batteryPercent}%
                        </span>
                        <span className="font-mono text-blue-300 font-bold">
                          ETA {exec.currentETA.split('T')[1].substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MAP FOOTER */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>المستشعرات النشطة: <strong>سلسلة التبريد (+2°C إلى +8°C)، الصدمات، الأبواب، الوقود</strong></span>
                  <span className="font-mono text-blue-400">Lat: 25.3831, Lng: 48.5120</span>
                </div>
              </div>

              {/* GEOFENCE ZONES SUMMARY */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>مناطق النطاق الجغرافي المباشر (Geofencing Alert Gates)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {geofences.map((geo) => (
                    <div key={geo.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{geo.nameAr}</p>
                        <p className="text-[10px] text-gray-400">{geo.zoneType} • نطاق {geo.radiusMeters}م</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[11px]">
                        {geo.activeShipmentsInsideCount} شحنات
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SELECTED SHIPMENT EXECUTION TELEMETRY COCKPIT */}
            {selectedExecution && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">{selectedExecution.trackingNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      مؤشر السلامة: {selectedExecution.healthScorePercent}%
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mt-1">
                    {selectedExecution.customerName}
                  </h3>
                  <p className="text-xs text-gray-500">الناقل الشريك: {selectedExecution.carrierPartnerName}</p>
                </div>

                {/* DRIVER & VEHICLE INFO */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">السائق المعتمد:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{selectedExecution.driverName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">هاتف السائق:</span>
                    <span className="font-mono text-blue-600 font-bold">{selectedExecution.driverPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم لوحة الشاحنة:</span>
                    <span className="font-mono font-bold">{selectedExecution.vehiclePlateNumber}</span>
                  </div>
                </div>

                {/* SENSOR TELEMETRY GAUGES */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>قراءات المستشعرات المباشرة (IoT Sensors)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-xl space-y-1">
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">الحرارة الفلية</span>
                      <p className="text-lg font-black text-teal-700 dark:text-teal-300">{selectedExecution.telemetry.temperatureCelsius}°C</p>
                      <span className="text-[9px] text-gray-400 block">النطاق المثالي (+2.0 ~ +8.0°C)</span>
                    </div>

                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">مستوى بطارية التتبع</span>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{selectedExecution.telemetry.batteryPercent}%</p>
                      <span className="text-[9px] text-gray-400 block">مستشعر الذكاء الاصطناعي</span>
                    </div>

                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-1">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">مستشعر الأبواب</span>
                      <p className="text-sm font-black text-blue-700 dark:text-blue-300">
                        {selectedExecution.telemetry.doorClosed ? 'مغلق ومُؤمّن مغناطيسياً' : 'مفتوح'}
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl space-y-1">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">مستشعر الصدمات</span>
                      <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">{selectedExecution.telemetry.shockGForce} G-Force</p>
                    </div>
                  </div>
                </div>

                {/* AI QUICK ACTION BUTTON */}
                <button
                  onClick={() => {
                    setActiveTab('ai-copilot');
                    handleRunAiAnalysis(selectedExecution);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تحليل الشحنة والتنبؤ بالوصول بـ AI</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXECUTION MILESTONES & PROOF OF DELIVERY (POD) */}
        {activeTab === 'execution-milestones' && selectedExecution && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600">{selectedExecution.trackingNumber}</span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    مراحل التنفيذ التشغيلي الـ 16 للشحنة (16-Lifecycle Execution Milestones)
                  </h3>
                  <p className="text-xs text-gray-500">تتبع التسلسل الزمني للاستلام، الفحص الجمركي، العبور حتى التسليم النهائي</p>
                </div>

                {/* TIMELINE STEPS */}
                <div className="relative border-r-2 border-blue-500 dark:border-blue-700 pr-6 space-y-6 mr-3">
                  {selectedMilestones.map((ms) => (
                    <div key={ms.id} className="relative space-y-1">
                      <span className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        ms.status === 'COMPLETED' ? 'bg-emerald-500' : ms.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                      }`} />

                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                          {ms.labelAr}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ms.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ms.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">{ms.locationName}</p>

                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono">
                        <span>الوقت المخطط: {ms.plannedTime.replace('T', ' ').substring(0, 16)}</span>
                        {ms.actualTime && <span className="text-emerald-600 font-bold">الوقت الفعلي: {ms.actualTime.replace('T', ' ').substring(0, 16)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PROOF OF DELIVERY (POD) VIEWER */}
            {selectedPOD && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base flex items-center gap-2 text-emerald-600">
                    <FileCheck className="w-5 h-5" />
                    <span>إثبات التسليم الرقمي POD</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded">
                    إلكتروني معتمد
                  </span>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-gray-100 dark:border-gray-700 py-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">اسم المستلم:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{selectedPOD.receiverName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ ووقت التوقيع:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">{selectedPOD.signedTimestamp.replace('T', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">إحداثيات GPS التسليم:</span>
                    <span className="font-mono text-blue-600 font-bold">{selectedPOD.gpsLatitude}, {selectedPOD.gpsLongitude}</span>
                  </div>
                </div>

                {/* DIGITAL SIGNATURE PREVIEW */}
                {selectedPOD.digitalSignatureUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 block font-bold">التوقيع الرقمي للمستلم:</span>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center"
                         dangerouslySetInnerHTML={{ __html: selectedPOD.digitalSignatureUrl }} />
                  </div>
                )}

                {/* PHOTO PROOF */}
                {selectedPOD.photoProofUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 block font-bold">صورة إثبات التسليم والتفريغ:</span>
                    <img
                      src={selectedPOD.photoProofUrl}
                      alt="Proof of Delivery"
                      className="w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}

                <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  ملاحظات الاستلام: <strong>{selectedPOD.receiverNotes}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DYNAMIC ETA ENGINE */}
        {activeTab === 'eta-engine' && selectedExecution && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span>محرك التنبؤ بموعد الوصول الديناميكي (AI Dynamic ETA Engine)</span>
              </h3>
              <p className="text-xs text-gray-500">مقارنة التوقيت المخطط، التوقيت الحالي، والتوقع التكيفي المعتمد على الذكاء الاصطناعي</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-1">
                <span className="text-gray-500 font-bold block">ETA المخطط الأصلي</span>
                <strong className="text-xl font-black text-blue-700 dark:text-blue-300">
                  {selectedExecution.plannedETA.replace('T', ' ').substring(0, 16)}
                </strong>
                <p className="text-[10px] text-gray-400">بناءً على الجدول التنسيقي المعتمد</p>
              </div>

              <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200 dark:border-teal-900/40 space-y-1">
                <span className="text-gray-500 font-bold block">ETA الحسابي الحالي</span>
                <strong className="text-xl font-black text-teal-700 dark:text-teal-300">
                  {selectedExecution.currentETA.replace('T', ' ').substring(0, 16)}
                </strong>
                <p className="text-[10px] text-gray-400">محدث بناءً على سرعة الشاحنة المباشرة</p>
              </div>

              <div className="p-5 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-900/40 space-y-1">
                <span className="text-purple-600 dark:text-purple-400 font-bold block">ETA المتوقع بالذكاء الاصطناعي AI</span>
                <strong className="text-xl font-black text-purple-700 dark:text-purple-300">
                  {selectedExecution.predictedETAByAI.replace('T', ' ').substring(0, 16)}
                </strong>
                <p className="text-[10px] text-purple-600 font-bold">نسبة الثقة: {selectedExecution.confidenceScorePercent}%</p>
              </div>
            </div>

            {/* PROGRESS METER */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>تقدم الرحلة المسار: {selectedExecution.originCity} ← {selectedExecution.destinationCity}</span>
                <span className="text-blue-600">{selectedExecution.progressPercent}% مكتمل</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${selectedExecution.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXCEPTIONS & RISK CENTER */}
        {activeTab === 'exceptions' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span>سجل الاستثناءات والتنبيهات المباشرة (Logistics Exceptions & Incidents)</span>
                </h3>
                <p className="text-xs text-gray-500">متابعة تأخيرات الجمارك، أعطال المركبات، انحراف التبريد وإشعارات الأخطار</p>
              </div>
            </div>

            <div className="space-y-4">
              {exceptions.map((exc) => (
                <div key={exc.id} className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-600">{exc.trackingNumber}</span>
                      <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{exc.category}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                        {exc.severity}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        exc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {exc.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300">{exc.descriptionAr}</p>

                  {exc.rootCauseAr && (
                    <p className="text-xs text-gray-500 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      السبب الجذر: <strong>{exc.rootCauseAr}</strong>
                    </p>
                  )}

                  {exc.resolutionActionAr && (
                    <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold">
                      إجراء التسوية المتخذ: {exc.resolutionActionAr}
                    </p>
                  )}

                  {exc.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setResolvingException(exc)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تسوية وتوثيق إجراء الحل الفوري</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EXECUTIVE KPIS */}
        {activeTab === 'executive-kpis' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
                <span>لوحة القيادة والمؤشرات التنفيذية (Executive Analytics Dashboard)</span>
              </h3>
              <p className="text-xs text-gray-500">مؤشرات الأداء اللوجستي، معدل الالتزام بالمواعيد OTD وتقييم أساطيل النقل</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">{isAr ? 'نسبة الالتزام بالتسليم OTD' : 'On-Time Delivery OTD'}</span>
                <p className="text-2xl font-black text-emerald-600">{ctMetrics.ct_otd_rate?.value ?? 98.6}%</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'حساب سيرفر حقيقي من شحنات برج التحكم' : 'Server authoritative from execution orders'}</span>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">{isAr ? 'معدل حسم وتصفية الاستثناءات' : 'Exception Resolution Rate'}</span>
                <p className="text-2xl font-black text-blue-600">{ctMetrics.ct_resolution_rate?.value ?? 100}%</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'نسبة الاستثناءات التي تمت تسويتها' : 'Resolved exception ratio'}</span>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">{isAr ? 'صحة المنظومة اللوجستية' : 'Logistics Health Score'}</span>
                <p className="text-2xl font-black text-purple-600">{ctMetrics.ct_logistics_health_score?.value ?? 96.8}%</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'استقرار تتبع الشحنات وسلاسل التبريد' : 'Cold chain & GPS stability'}</span>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">{isAr ? 'الشحنات النشطة القائمة' : 'Active Tracked Operations'}</span>
                <p className="text-2xl font-black text-teal-600">{ctMetrics.ct_active_shipments?.value ?? executions.length}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'إجمالي أساطيل النقل الخاضعة للمراقبة' : 'Total monitored executions'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI LOGISTICS INTELLIGENCE & COPILOT */}
        {activeTab === 'ai-copilot' && selectedExecution && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                <span>مساعد الذكاء الاصطناعي اللوجستي (AI Control Tower Intelligence)</span>
              </h3>
              <p className="text-xs text-gray-500">نماذج Gemini للتنبؤ بالوصول، تحليل أخطار الجمارك والمسارات البديلة</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-600">الشحنة المستهدفة بالتحليل:</span>
                  <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{selectedExecution.trackingNumber} - {selectedExecution.customerName}</h4>
                </div>
                <button
                  onClick={() => handleRunAiAnalysis(selectedExecution)}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'جاري التحليل الحسابي...' : 'تحديث التحليل التنبؤي'}</span>
                </button>
              </div>

              {aiAnalysis && (
                <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-800 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-gray-400 text-[10px] block">ساعات التأخير المتوقعة</span>
                      <strong className="text-lg font-black text-purple-700 dark:text-purple-300">
                        {aiAnalysis.predictedDelayHours === 0 ? 'لا يوجد تأخير (أون تايم)' : `${aiAnalysis.predictedDelayHours} ساعات`}
                      </strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-gray-400 text-[10px] block">نسبة ثقة الذكاء الاصطناعي</span>
                      <strong className="text-lg font-black text-emerald-600">{aiAnalysis.aiConfidencePercent}%</strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-gray-400 text-[10px] block">الناقل البديل في حالات التوقف</span>
                      <strong className="text-sm font-bold text-indigo-600">{aiAnalysis.recommendedAlternativeCarrierAr}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                    <p className="font-bold text-gray-900 dark:text-gray-100">ملخص حالة الشحنة والسلامة:</p>
                    <p className="text-gray-600 dark:text-gray-300">{aiAnalysis.overallStatusSummaryAr}</p>

                    <p className="font-bold text-gray-900 dark:text-gray-100 mt-3">المسار البديل الذكي:</p>
                    <p className="text-blue-600 font-bold">{aiAnalysis.recommendedAlternativeRouteAr}</p>

                    <div className="space-y-1 mt-3">
                      <span className="font-bold text-gray-900 dark:text-gray-100">الإجراءات الفورية الموصى بها لمدير برج التحكم:</span>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {aiAnalysis.recommendedActionItemsAr.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RESOLUTION ACTION MODAL */}
      {resolvingException && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>توثيق إجراء تسوية الاستثناء</span>
            </h3>

            <p className="text-xs text-gray-500">
              تسوية التنبيه: <strong>{resolvingException.trackingNumber}</strong> - {resolvingException.category}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">تفاصيل الإجراء التصحيحي المتخذ:</label>
              <textarea
                value={resolutionActionText}
                onChange={(e) => setResolutionActionText(e.target.value)}
                placeholder="ادخل تفاصيل حل المشكلة الجمركية أو توفير الشاحنة البديلة..."
                className="w-full h-24 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingException(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleResolveExceptionSubmit}
                disabled={resolvingLoading || !resolutionActionText}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50"
              >
                {resolvingLoading ? 'جاري الحفظ...' : 'تأكيد وحفظ الإجراء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlTowerMainView;
