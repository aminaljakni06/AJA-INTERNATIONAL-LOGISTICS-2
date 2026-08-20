import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  Layers,
  Box,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  ShieldAlert,
  Mic,
  Lightbulb,
  Barcode,
  Navigation,
  CheckSquare,
  Bot,
  Scale
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  OutboundSalesOrder,
  PickingWave,
  PickTaskItem,
  PackingStationRecord,
  ShippingManifest,
  OutboundExceptionRecord,
  AIOutboundOptimizationResult
} from '../../types/outboundLogistics';
import { OutboundLogisticsClient } from '../../services/outboundLogisticsClient';

export const OutboundLogisticsMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'orders' | 'waves' | 'packing' | 'shipping' | 'dock-loading' | 'exceptions' | 'ai-copilot'>('orders');

  const [orders, setOrders] = useState<OutboundSalesOrder[]>([]);
  const [waves, setWaves] = useState<PickingWave[]>([]);
  const [pickTasks, setPickTasks] = useState<PickTaskItem[]>([]);
  const [packingStations, setPackingStations] = useState<PackingStationRecord[]>([]);
  const [manifests, setManifests] = useState<ShippingManifest[]>([]);
  const [exceptions, setExceptions] = useState<OutboundExceptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedWave, setSelectedWave] = useState<PickingWave | null>(null);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIOutboundOptimizationResult | null>(null);

  useEffect(() => {
    loadOutboundData();
  }, []);

  const loadOutboundData = async () => {
    setLoading(true);
    try {
      const [orderData, waveData, taskData, packData, manifestData, excData] = await Promise.all([
        OutboundLogisticsClient.getOutboundSalesOrders(),
        OutboundLogisticsClient.getPickingWaves(),
        OutboundLogisticsClient.getPickTasks(),
        OutboundLogisticsClient.getPackingStations(),
        OutboundLogisticsClient.getShippingManifests(),
        OutboundLogisticsClient.getOutboundExceptions(),
      ]);
      setOrders(orderData);
      setWaves(waveData);
      setPickTasks(taskData);
      setPackingStations(packData);
      setManifests(manifestData);
      setExceptions(excData);

      if (waveData.length > 0) {
        setSelectedWave(waveData[0]);
      }
    } catch (err) {
      console.error('Error loading outbound logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiOutboundOptimize = async () => {
    if (!selectedWave) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await OutboundLogisticsClient.optimizeOutbound({
        waveNumber: selectedWave.waveNumber,
        warehouseId: selectedWave.warehouseId,
        totalOrdersCount: selectedWave.totalOrdersCount,
        pickingStrategy: selectedWave.strategy,
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI Outbound Optimizer Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerNameAr.includes(searchTerm) ||
    o.destinationCityAr.includes(searchTerm)
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isAr ? 'منظومة الشحن والتحضير الصادر (Enterprise Outbound Logistics)' : 'Enterprise Outbound Logistics & Picking Wave Platform'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'إدارة طلبات البيع، تحضير الموجات Wave/Batch/Zone، كراتين Cartonization، التحقق بالرموز والتحميل بالأرصفة Docks' : 'Sales Orders, Wave/Batch Picking, Pick-to-Light, Cartonization, Dock Loading & Shipping Manifests'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOutboundData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'منصة الصادر نشطة بالكامل' : 'Outbound Engine Active'}</span>
          </div>
        </div>
      </div>

      {/* KPIS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'طلبات البيع الصادرة' : 'Outbound Orders'}</span>
          <div className="text-xl font-black text-blue-600">{orders.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'طلب' : 'Orders'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'موجات التحضير النشطة' : 'Active Waves'}</span>
          <div className="text-xl font-black text-indigo-600">{waves.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'موجة' : 'Waves'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'مهام التلتقيط والتجميع' : 'Pick Tasks'}</span>
          <div className="text-xl font-black text-emerald-600">{pickTasks.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'مهمة' : 'Tasks'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'محطات التغليف Cartonization' : 'Packing Stations'}</span>
          <div className="text-xl font-black text-amber-600">{packingStations.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'محطة' : 'Stations'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'منافيست الشحن والتحميل' : 'Manifests'}</span>
          <div className="text-xl font-black text-cyan-600">{manifests.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'منافيست' : 'Manifests'}</span></div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'orders', label: isAr ? 'طلبات البيع والتخصيص (Sales Orders)' : 'Sales Order Fulfillment', icon: Package },
          { id: 'waves', label: isAr ? 'موجات التجميع (Wave & Picking)' : 'Wave & Pick Management', icon: Navigation },
          { id: 'packing', label: isAr ? 'محطات التغليف (Packing & Cartonization)' : 'Packing Station & Cartonization', icon: Box },
          { id: 'shipping', label: isAr ? 'منافيست الشحن (Shipping Manifests)' : 'Shipping & Dispatch', icon: Truck },
          { id: 'dock-loading', label: isAr ? 'تحقق أرصفة التحميل (Dock Verification)' : 'Dock Loading & Scanning', icon: Barcode },
          { id: 'exceptions', label: isAr ? 'بلاغات واستثناءات الصادر' : 'Outbound Exceptions', icon: ShieldAlert },
          { id: 'ai-copilot', label: isAr ? 'ذكاء مسارات الصادر AI' : 'AI Outbound Intelligence', icon: Sparkles },
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

        {/* TAB 1: SALES ORDER FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث برقم طلب البيع، العميل، الوجهة...' : 'Search Sales Order Number, Customer, City...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredOrders.map((o) => (
                <div key={o.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-blue-600">{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {o.orderPriority}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{o.customerNameAr}</h4>
                    <p className="text-xs text-gray-500">{o.destinationCityAr}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>إجمالي الأغراض / الوزن:</span>
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">{o.totalItemsCount} صنف ({o.totalWeightKg} كجم)</strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>استراتيجية التحضير:</span>
                      <strong className="text-indigo-600 font-bold">{o.pickingStrategy}</strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>موعد التسليم المطلوب:</span>
                      <strong className="text-emerald-600 font-mono">{o.requestedDeliveryDate}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WAVE & PICK MANAGEMENT */}
        {activeTab === 'waves' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>موجات التحضير المعتمدة (Picking Waves)</span>
                </h4>

                <div className="space-y-3 text-xs">
                  {waves.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWave(w)}
                      className={`p-4 rounded-xl border space-y-2 cursor-pointer transition-all ${
                        selectedWave?.id === w.id
                          ? 'bg-blue-50/50 border-blue-500 dark:bg-blue-950/20'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between font-mono font-bold">
                        <span className="text-blue-600">{w.waveNumber}</span>
                        <span className="text-emerald-600">{w.status}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{w.assignedPickerNameAr}</p>
                      <p className="text-gray-500">المستودع: {w.warehouseId} ({w.zoneCode})</p>
                      <div className="flex gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Lightbulb className="w-3.5 h-3.5" /> Pick-to-Light
                        </span>
                        <span className="flex items-center gap-1 text-indigo-600 font-bold">
                          <Mic className="w-3.5 h-3.5" /> Voice Picking
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>مهام التلتقيط والتوجيه (Pick Tasks)</span>
                </h4>

                <div className="space-y-3 text-xs">
                  {pickTasks.map((pt) => (
                    <div key={pt.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between font-mono font-bold">
                        <span className="text-indigo-600">{pt.skuCode}</span>
                        <span className="text-emerald-600">{pt.status}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{pt.productNameAr}</p>
                      <div className="flex justify-between text-gray-500">
                        <span>الخانة المصدر: <strong className="text-blue-600 font-mono">{pt.sourceBinCode}</strong></span>
                        <span>الكمية: <strong className="text-emerald-600 font-mono">{pt.quantityPicked} / {pt.quantityRequired}</strong></span>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-800 dark:text-amber-300 text-[11px] font-mono">
                        نواة التوجيه الصوتي: "{pt.voiceCommandPromptAr}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACKING & CARTONIZATION */}
        {activeTab === 'packing' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Box className="w-5 h-5 text-amber-600" />
              <span>محطات التغليف والخوارزمية الذكية لنوع الكرتون (Cartonization Engine)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packingStations.map((ps) => (
                <div key={ps.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-amber-600">{ps.stationNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {ps.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{ps.packerNameAr}</h4>
                    <p className="text-xs text-gray-500 font-mono">الطلب الحالي: {ps.currentOrderNumber}</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">نوع الكرتون المقترح بـ AI:</span>
                      <strong className="text-indigo-600">{ps.recommendedBoxTypeAr}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الوزن الذي تم التحقق منه:</span>
                      <strong className="text-emerald-600 font-mono">{ps.weightVerifiedKg} كجم</strong>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all">
                    طباعة ملصق الشحن والبارلود (Print Carrier Label)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SHIPPING MANIFESTS */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span>منافيست الشحن وأوامر المغادرة (Shipping Manifests & Dispatch)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">رقم المنافيست</th>
                    <th className="p-3">اسم الناقل</th>
                    <th className="p-3">رقم لوحة الشاحنة</th>
                    <th className="p-3">رصيف التحميل (Dock Door)</th>
                    <th className="p-3">عدد الطرود</th>
                    <th className="p-3">الوزن الإجمالي</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {manifests.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 font-mono font-black text-blue-600">{m.manifestNumber}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{m.carrierNameAr}</td>
                      <td className="p-3 font-mono text-gray-700 dark:text-gray-300">{m.truckPlateNumber}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{m.dockDoorNumber}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{m.totalPackages}</td>
                      <td className="p-3 font-mono">{m.totalWeightKg} كجم</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {m.dispatchStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DOCK LOADING & SCANNING */}
        {activeTab === 'dock-loading' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-emerald-600" />
              <span>التحقق من التحميل بالأرصفة والمسح بالباركود / RFID (Dock Loading Verification)</span>
            </h3>

            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 dark:text-gray-200">الرصيف الحالي: DOCK-04 (أرصفة التبريد)</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl font-bold">جاهز للتحميل</span>
              </div>
              <p className="text-gray-500">قم بمسح الباركود على الطبلية أو الكرتون لتأكيد الصعود للشاحنة (أ ج ا - 5542)</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="امسح رمز الباركود Barcode/RFID Tag..."
                  className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono outline-none"
                />
                <button className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow">
                  تأكيد التحميل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OUTBOUND EXCEPTIONS */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>سجل بلاغات واستثناءات التحضير والتغليف (Outbound Exceptions)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {exceptions.map((ex) => (
                <div key={ex.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-rose-600">{ex.exceptionNumber}</span>
                    <span className="text-amber-600">{ex.status}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">الطلب: {ex.orderNumber} • صنف: {ex.skuCode}</p>
                  <p className="text-gray-500">نوع الاستثناء: {ex.exceptionType} • أبلغ عنه: {ex.reportedByAr}</p>
                  <p className="text-indigo-600 font-bold">{ex.resolutionDetailsAr}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: AI OUTBOUND LOGISTICS INTELLIGENCE */}
        {activeTab === 'ai-copilot' && selectedWave && (
          <div className="p-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-3xl border border-blue-200 dark:border-blue-900/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-blue-600 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>مساعد الذكاء الاصطناعي لمسارات التحضير والشحن (AI Outbound Intelligence)</span>
                </h3>
                <p className="text-xs text-gray-500">تحليل نماذج Gemini لحساب المسار الأقصر بالخانات، تحسين التعبئة وتدفق أرصفة Docks</p>
              </div>

              <button
                onClick={handleRunAiOutboundOptimize}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'جاري التحليل الذكي...' : 'تحسين مسار الموجة بـ AI'}</span>
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <span className="text-gray-400 font-bold block">الموجة المختارة للتحليل:</span>
              <div className="flex justify-between font-bold">
                <span className="text-blue-600 font-mono">{selectedWave.waveNumber}</span>
                <span className="text-gray-800 dark:text-gray-200">{selectedWave.assignedPickerNameAr}</span>
                <span className="text-indigo-600">{selectedWave.strategy}</span>
              </div>
            </div>

            {aiResult && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-gray-400 text-[10px] block">الوقت المتوقع لإتمام الموجة بالكامل</span>
                    <strong className="text-xl font-black text-blue-600">{aiResult.estimatedFulfillmentTimeMinutes} دقيقة</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-gray-400 text-[10px] block">عدد الكراتين المقترحة بـ Cartonization</span>
                    <strong className="text-xl font-black text-amber-600">{aiResult.recommendedCartonsCount} كرتون</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-gray-400 text-[10px] block">العمالة الموصى بها</span>
                    <strong className="text-xl font-black text-emerald-600">{aiResult.suggestedLaborCount} مشغّل</strong>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">مسار الخانات الأمثل بأقل مسافة قطع (Optimal Pick Path):</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                      {aiResult.optimalPickPathBins.map((bin, idx) => (
                        <li key={idx} className="font-mono">{bin}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">تسلسل التحميل بالأرصفة Docks:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                      {aiResult.dockLoadingSequence.map((seq, idx) => (
                        <li key={idx}>{seq}</li>
                      ))}
                    </ul>
                  </div>

                  {aiResult.riskWarningAr && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-amber-800 dark:text-amber-300">
                      <strong>تنبيه السلامة الحرج: </strong> {aiResult.riskWarningAr}
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

export default OutboundLogisticsMainView;
