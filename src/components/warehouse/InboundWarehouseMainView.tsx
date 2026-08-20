import React, { useState, useEffect } from 'react';
import {
  Truck,
  FileCheck,
  ClipboardList,
  ShieldAlert,
  Boxes,
  QrCode,
  Radio,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Clock,
  ArrowDownRight,
  TrendingUp,
  UserCheck,
  CheckSquare,
  Maximize2,
  Zap,
  Building2,
  Layers,
  Bot,
  PackageCheck,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Tag,
  BarChart3,
  ArrowRightLeft
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  AdvancedShippingNotice,
  GoodsReceiptNote,
  QualityInspectionRecord,
  DirectedPutawayTask,
  DockAppointment,
  OSDRecord,
  NCRRecord,
  InboundContainer,
  CrossDockRecord,
  InboundLabelJob,
  InboundAnalyticsKPIs,
  AIInboundWarehouseResult
} from '../../types/inboundWarehouse';
import { InboundWarehouseClient } from '../../services/inboundWarehouseClient';

import ASNManagementView from './inbound/ASNManagementView';
import DockSchedulingView from './inbound/DockSchedulingView';
import ReceivingWorkbenchView from './inbound/ReceivingWorkbenchView';
import GRNAndOSDView from './inbound/GRNAndOSDView';
import QualityAndNCRView from './inbound/QualityAndNCRView';
import PutawayPreparationView from './inbound/PutawayPreparationView';
import ContainerAndCrossDockView from './inbound/ContainerAndCrossDockView';
import InboundLabelHubView from './inbound/InboundLabelHubView';
import ExecutiveInboundAnalyticsView from './inbound/ExecutiveInboundAnalyticsView';

export const InboundWarehouseMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<
    | 'asn'
    | 'dock'
    | 'receiving-workbench'
    | 'grn-osd'
    | 'quality-ncr'
    | 'putaway'
    | 'container-crossdock'
    | 'labels'
    | 'analytics'
    | 'ai-copilot'
  >('asn');

  const [asns, setAsns] = useState<AdvancedShippingNotice[]>([]);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>([]);
  const [inspections, setInspections] = useState<QualityInspectionRecord[]>([]);
  const [putawayTasks, setPutawayTasks] = useState<DirectedPutawayTask[]>([]);
  const [docks, setDocks] = useState<DockAppointment[]>([]);
  const [osds, setOsds] = useState<OSDRecord[]>([]);
  const [ncrs, setNcrs] = useState<NCRRecord[]>([]);
  const [containers, setContainers] = useState<InboundContainer[]>([]);
  const [crossDocks, setCrossDocks] = useState<CrossDockRecord[]>([]);
  const [labelJobs, setLabelJobs] = useState<InboundLabelJob[]>([]);
  const [kpis, setKpis] = useState<InboundAnalyticsKPIs | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedAsn, setSelectedAsn] = useState<AdvancedShippingNotice | null>(null);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIInboundWarehouseResult | null>(null);

  useEffect(() => {
    loadInboundData();
  }, []);

  const loadInboundData = async () => {
    setLoading(true);
    try {
      const [
        asnData,
        grnData,
        inspData,
        putData,
        dockData,
        osdData,
        ncrData,
        contData,
        xdData,
        lblData,
        kpiData
      ] = await Promise.all([
        InboundWarehouseClient.getASNs(),
        InboundWarehouseClient.getGoodsReceipts(),
        InboundWarehouseClient.getQualityInspections(),
        InboundWarehouseClient.getPutawayTasks(),
        InboundWarehouseClient.getDockAppointments(),
        InboundWarehouseClient.getOSDRecords(),
        InboundWarehouseClient.getNCRRecords(),
        InboundWarehouseClient.getInboundContainers(),
        InboundWarehouseClient.getCrossDockRecords(),
        InboundWarehouseClient.getInboundLabelJobs(),
        InboundWarehouseClient.getInboundAnalyticsKPIs()
      ]);

      setAsns(asnData);
      setGrns(grnData);
      setInspections(inspData);
      setPutawayTasks(putData);
      setDocks(dockData);
      setOsds(osdData);
      setNcrs(ncrData);
      setContainers(contData);
      setCrossDocks(xdData);
      setLabelJobs(lblData);
      setKpis(kpiData);

      if (asnData.length > 0) {
        setSelectedAsn(asnData[0]);
      }
    } catch (err) {
      console.error('Error loading inbound warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiInboundOptimize = async () => {
    if (!selectedAsn) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await InboundWarehouseClient.optimizeInbound({
        asnNumber: selectedAsn.asnNumber,
        supplierNameAr: selectedAsn.supplierNameAr,
        totalExpectedPallets: selectedAsn.totalExpectedPallets,
        temperatureControlled: selectedAsn.temperatureControlled,
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI Inbound Optimizer Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-2xl text-white shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isAr ? 'منظومة الاستلام اللوجستي المتقدم بـ WMS (Inbound Logistics & Putaway)' : 'Enterprise Inbound Logistics, Receiving & Directed Putaway Platform'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'إدارة الشحنات الواردة ASN، جدولة الأرصفة Docks، طاولة الاستلام، محاضر GRN، مطالبات OS&D، جودة NCR وتوجيه التخزين Putaway' : 'ASN Management, Dock Scheduling, Receiving Workbench, GRN/OS&D, Quality Inspection, NCR, Directed Putaway & Cross-Docking'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInboundData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'منظومة الاستلام تعمل بكفاءة' : 'Inbound Platform Active'}</span>
          </div>
        </div>
      </div>

      {/* KPIS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'الإشعارات المسبقة ASN' : 'Active ASNs'}</span>
          <div className="text-xl font-black text-amber-600">{asns.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'شحنة واردة' : 'ASNs'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'محاضر الاستلام GRN' : 'Goods Receipts'}</span>
          <div className="text-xl font-black text-indigo-600">{grns.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'محضر' : 'GRNs'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'مطالبات الفروقات OS&D' : 'OS&D Claims'}</span>
          <div className="text-xl font-black text-rose-600">{osds.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'مطالبة' : 'Claims'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'تقارير عدم المطابقة NCR' : 'NCR Reports'}</span>
          <div className="text-xl font-black text-amber-600">{ncrs.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'تقرير' : 'Reports'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'مهام Putaway الجارية' : 'Putaway Tasks'}</span>
          <div className="text-xl font-black text-blue-600">{putawayTasks.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'مهمة' : 'Tasks'}</span></div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'asn', label: isAr ? 'مركز الإشعارات (ASN Center)' : 'ASN Management', icon: ClipboardList },
          { id: 'dock', label: isAr ? 'جدولة الأرصفة (Dock Calendar)' : 'Dock Scheduling', icon: Truck },
          { id: 'receiving-workbench', label: isAr ? 'طاولة الاستلام (Receiving)' : 'Receiving Workbench', icon: PackageCheck },
          { id: 'grn-osd', label: isAr ? 'سندات GRN & OS&D' : 'GRN & OS&D Center', icon: FileText },
          { id: 'quality-ncr', label: isAr ? 'الجودة و NCR' : 'Quality & NCR', icon: ShieldCheck },
          { id: 'putaway', label: isAr ? 'التخزين الموجه (Putaway)' : 'Directed Putaway', icon: ArrowUpRight },
          { id: 'container-crossdock', label: isAr ? 'الحاويات & Cross-Dock' : 'Containers & Cross-Dock', icon: ArrowRightLeft },
          { id: 'labels', label: isAr ? 'الباركود و RFID Labels' : 'Label Printing', icon: Tag },
          { id: 'analytics', label: isAr ? 'التحليلات ومؤشرات Performance' : 'Executive Analytics', icon: BarChart3 },
          { id: 'ai-copilot', label: isAr ? 'مساعد الاستلام بـ AI' : 'AI Inbound Copilot', icon: Sparkles },
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
        {/* TAB 1: ASN MANAGEMENT */}
        {activeTab === 'asn' && (
          <ASNManagementView asns={asns} onRefresh={loadInboundData} />
        )}

        {/* TAB 2: DOCK SCHEDULING */}
        {activeTab === 'dock' && (
          <DockSchedulingView docks={docks} onRefresh={loadInboundData} />
        )}

        {/* TAB 3: RECEIVING WORKBENCH */}
        {activeTab === 'receiving-workbench' && (
          <ReceivingWorkbenchView />
        )}

        {/* TAB 4: GRN & OSD */}
        {activeTab === 'grn-osd' && (
          <GRNAndOSDView grns={grns} osds={osds} onRefresh={loadInboundData} />
        )}

        {/* TAB 5: QUALITY & NCR */}
        {activeTab === 'quality-ncr' && (
          <QualityAndNCRView inspections={inspections} ncrs={ncrs} onRefresh={loadInboundData} />
        )}

        {/* TAB 6: DIRECTED PUTAWAY */}
        {activeTab === 'putaway' && (
          <PutawayPreparationView tasks={putawayTasks} onRefresh={loadInboundData} />
        )}

        {/* TAB 7: CONTAINER & CROSS DOCK */}
        {activeTab === 'container-crossdock' && (
          <ContainerAndCrossDockView containers={containers} crossDocks={crossDocks} onRefresh={loadInboundData} />
        )}

        {/* TAB 8: BARCODE & RFID LABELS */}
        {activeTab === 'labels' && (
          <InboundLabelHubView labelJobs={labelJobs} onRefresh={loadInboundData} />
        )}

        {/* TAB 9: EXECUTIVE ANALYTICS */}
        {activeTab === 'analytics' && kpis && (
          <ExecutiveInboundAnalyticsView kpis={kpis} />
        )}

        {/* TAB 10: AI INBOUND COPILOT */}
        {activeTab === 'ai-copilot' && selectedAsn && (
          <div className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-amber-600 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>مساعد الذكاء الاصطناعي للاستلام وتوجيه التخزين (AI Inbound Copilot)</span>
                </h3>
                <p className="text-xs text-gray-500">تحليل الموديلات الذكية لتنسيق الأرصفة، زمن التفريغ وتوجيه Putaway</p>
              </div>

              <button
                onClick={handleRunAiInboundOptimize}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'جاري التحليل الذكي...' : 'توليد توصيات الاستلام والتخزين بـ AI'}</span>
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <span className="text-gray-400 font-bold block">الشحنة المختارة للتحليل:</span>
              <div className="flex justify-between font-bold">
                <span className="text-amber-600 font-mono">{selectedAsn.asnNumber}</span>
                <span className="text-gray-800 dark:text-gray-200">{selectedAsn.supplierNameAr}</span>
                <span className="text-indigo-600">{selectedAsn.totalExpectedPallets} طبلية متوقعة</span>
              </div>
            </div>

            {aiResult && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 text-[10px] block">كفاءة المسار التخزيني المتوقعة</span>
                    <strong className="text-xl font-black text-amber-600">{aiResult.putawayEfficiencyScorePercent}%</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 text-[10px] block">الرصيف الموصى بالتوجيه إليه</span>
                    <strong className="text-sm font-black text-gray-900 dark:text-gray-100">{aiResult.recommendedOptimalDockAr}</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 text-[10px] block">زمن التفريغ والمطابقة المتوقع</span>
                    <strong className="text-xl font-black text-indigo-600">{aiResult.predictedUnloadingTimeMinutes} دقيقة</strong>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">تقييم عينة الفحص والمخاطر:</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{aiResult.inspectionRiskAssessmentAr}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">استراتيجية Putaway الموصى بها:</h4>
                    <p className="text-indigo-600 font-bold mt-1">{aiResult.directedPutawayStrategyAr}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">توصيات منع تكدس الأرصفة:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                      {aiResult.congestionPreventionRecommendationsAr.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InboundWarehouseMainView;
