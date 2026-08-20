import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  BookmarkCheck,
  PackageCheck,
  ShieldAlert,
  Truck,
  Sliders,
  BarChart3,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Layers,
  Zap,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  StockMovement,
  InventoryReservation,
  InventoryAllocation,
  InventoryHold,
  StockTransfer,
  InventoryAdjustment,
  ATPMetrics,
  InventoryTimelineEvent,
  AIInventoryOptimizationResult
} from '../../types/inventoryOperations';
import { InventoryOperationsClient } from '../../services/inventoryOperationsClient';

export const InventoryOperationsMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<
    'movements' | 'reservations' | 'allocations' | 'holds' | 'transfers' | 'adjustments' | 'atp' | 'ai-intelligence'
  >('movements');

  const [loading, setLoading] = useState<boolean>(true);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [reservations, setReservations] = useState<InventoryReservation[]>([]);
  const [allocations, setAllocations] = useState<InventoryAllocation[]>([]);
  const [holds, setHolds] = useState<InventoryHold[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [atpData, setAtpData] = useState<ATPMetrics | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<InventoryTimelineEvent[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('SKU-MED-9901');

  // AI Copilot state
  const [aiResult, setAiResult] = useState<AIInventoryOptimizationResult | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [selectedSku]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, r, a, h, t, adj, atpRes, tlRes] = await Promise.all([
        InventoryOperationsClient.getStockMovements(),
        InventoryOperationsClient.getInventoryReservations(),
        InventoryOperationsClient.getInventoryAllocations(),
        InventoryOperationsClient.getInventoryHolds(),
        InventoryOperationsClient.getStockTransfers(),
        InventoryOperationsClient.getInventoryAdjustments(),
        InventoryOperationsClient.getATPMetrics(selectedSku),
        InventoryOperationsClient.getInventoryTimeline(selectedSku)
      ]);
      setMovements(m);
      setReservations(r);
      setAllocations(a);
      setHolds(h);
      setTransfers(t);
      setAdjustments(adj);
      setAtpData(atpRes);
      setTimelineEvents(tlRes);
    } catch (err) {
      console.error('Error loading inventory operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAiOptimization = async () => {
    setAiLoading(true);
    try {
      const result = await InventoryOperationsClient.optimizeInventoryOperations({
        skuCode: selectedSku,
        warehouseId: 'WH-RUH-01',
        currentOnHand: atpData?.onHandQuantity || 500,
        leadTimeDays: 5
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI optimization request failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#082F49] via-[#0F4C75] to-[#1E56A0] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold tracking-wider uppercase mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'حزمة العمليات المخزونية المؤسسية Enterprise Inventory Operations' : 'Enterprise Inventory Operations Pack'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isAr ? 'مركز عمليات وترحيل المخزون والحيوزات (Inventory Operations)' : 'Inventory Operations & Reservation Center'}
            </h1>
            <p className="text-sky-100 text-sm mt-1 max-w-3xl">
              {isAr
                ? 'إدارة محرك التحويلات بين المستودعات، الحجز المسبق، التخصيص التلقائي (FEFO/FIFO)، الحظر الإداري، المتاح للوعد (ATP)، وتسويات الجرد اللحظية'
                : 'Manage stock movements, reservations, automated allocation, quality holds, inter-warehouse transfers, ATP metrics, and real-time inventory adjustments.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-sm transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث العمليات' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-sky-200">{isAr ? 'حركات المخزون اليوم' : 'Movements Today'}</div>
            <div className="text-xl font-bold mt-1">{movements.length} {isAr ? 'حركة' : 'txns'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-sky-200">{isAr ? 'الحجوزات النشطة' : 'Active Reservations'}</div>
            <div className="text-xl font-bold mt-1 text-emerald-300">{reservations.filter(r => r.status === 'ACTIVE').length} {isAr ? 'حجز' : 'active'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-sky-200">{isAr ? 'المخزون المحظور (Holds)' : 'Held Stock'}</div>
            <div className="text-xl font-bold mt-1 text-amber-300">{holds.filter(h => h.status === 'ACTIVE_HOLD').length} {isAr ? 'دفعة' : 'lots'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-sky-200">{isAr ? 'التحويلات جارية النقل' : 'In-Transit Transfers'}</div>
            <div className="text-xl font-bold mt-1 text-sky-300">{transfers.filter(t => t.status === 'DISPATCHED_IN_TRANSIT').length} {isAr ? 'شحنة' : 'transfers'}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'movements'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>{isAr ? 'حركات الأسهم والمخزون' : 'Stock Movements'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reservations')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'reservations'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>{isAr ? 'حجز المخزون (Reservations)' : 'Reservations'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('allocations')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'allocations'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>{isAr ? 'التخصيص FEFO/FIFO' : 'Allocations'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('holds')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'holds'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isAr ? 'حظر وجرائم الجودة (Holds)' : 'Inventory Holds'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'transfers'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{isAr ? 'تحويلات الفروع والمستودعات' : 'Stock Transfers'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('adjustments')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'adjustments'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isAr ? 'تسويات وتعديلات الجرد' : 'Adjustments'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('atp')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'atp'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isAr ? 'المتاح للوعد (ATP Realtime)' : 'ATP Metrics'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai-intelligence')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeSubTab === 'ai-intelligence'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'ذكاء عمليات المخزون AI' : 'AI Intelligence'}</span>
        </button>
      </div>

      {/* Main Tab Contents */}
      {activeSubTab === 'movements' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-sky-600" />
              <span>{isAr ? 'سجل حركات المخزون اللحظية (Stock Movement Ledger)' : 'Stock Movements Ledger'}</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث برقم الحركة أو الرمز...' : 'Search by code or SKU...'}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">{isAr ? 'رقم الحركة' : 'Movement #'}</th>
                  <th className="px-4 py-3">{isAr ? 'نوع الحركة' : 'Type'}</th>
                  <th className="px-4 py-3">{isAr ? 'المنتج / SKU' : 'SKU / Product'}</th>
                  <th className="px-4 py-3">{isAr ? 'الكمية' : 'Quantity'}</th>
                  <th className="px-4 py-3">{isAr ? 'المصدر' : 'Source'}</th>
                  <th className="px-4 py-3">{isAr ? 'الوجهة' : 'Destination'}</th>
                  <th className="px-4 py-3">{isAr ? 'المستند المرجعي' : 'Ref Doc'}</th>
                  <th className="px-4 py-3">{isAr ? 'المشغّل' : 'User'}</th>
                  <th className="px-4 py-3">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {movements
                  .filter(
                    m =>
                      m.movementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.productNameAr.includes(searchTerm)
                  )
                  .map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-sky-700 dark:text-sky-400">{m.movementNumber}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 rounded-lg text-xs font-semibold">
                          {m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <div>{m.productNameAr}</div>
                        <div className="text-xs font-mono text-slate-400">{m.skuCode}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        +{m.quantity} {m.unitOfMeasure}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">
                        {m.sourceWarehouseId} ({m.sourceBinCode})
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">
                        {m.destinationWarehouseId ? `${m.destinationWarehouseId} (${m.destinationBinCode})` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {m.referenceDocumentNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs">{m.performedByUserNameAr}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(m.timestamp).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'reservations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'حجوزات المخزون (Inventory Reservation Center)' : 'Inventory Reservations'}</span>
            </h2>
            <button className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md">
              <BookmarkCheck className="w-4 h-4" />
              <span>{isAr ? '+ إنشاء حجز جديد' : '+ New Reservation'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.map(r => (
              <div key={r.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.reservationNumber}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">{r.reservationType}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {r.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{r.productNameAr}</div>
                  <div className="text-xs font-mono text-slate-400">{r.skuCode}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">{isAr ? 'الكمية المحجوزة:' : 'Reserved Qty:'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{r.reservedQuantity} وحدة</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">{isAr ? 'أولوية الحجز:' : 'Priority:'}</span>
                    <span className="font-extrabold text-amber-600 text-sm">المستوى {r.priorityOrder}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>{isAr ? 'المحجوز لصالح:' : 'Reserved For:'} <strong className="text-slate-700 dark:text-slate-300">{r.customerOrProjectNameAr}</strong></span>
                  <span className="text-amber-600 font-medium">تنتهي: {new Date(r.expiresAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'allocations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-indigo-600" />
              <span>{isAr ? 'تخصيص الشحنات الأوتوماتيكي (FEFO/FIFO Allocation Engine)' : 'Inventory Allocations'}</span>
            </h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">FEFO Enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">{isAr ? 'رقم التخصيص' : 'Alloc #'}</th>
                  <th className="px-4 py-3">{isAr ? 'أمر البيع' : 'Order #'}</th>
                  <th className="px-4 py-3">{isAr ? 'المنتج / SKU' : 'SKU'}</th>
                  <th className="px-4 py-3">{isAr ? 'الخانة المخصصة' : 'Bin'}</th>
                  <th className="px-4 py-3">{isAr ? 'الدفعة Batch' : 'Batch #'}</th>
                  <th className="px-4 py-3">{isAr ? 'الكمية' : 'Qty'}</th>
                  <th className="px-4 py-3">{isAr ? 'المبدأ المطبق' : 'Strategy'}</th>
                  <th className="px-4 py-3">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allocations.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">{a.allocationNumber}</td>
                    <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200 font-semibold">{a.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div>{a.productNameAr}</div>
                      <div className="text-xs font-mono text-slate-400">{a.skuCode}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{a.allocatedBinCode}</td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-600">{a.batchNumber || 'N/A'}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{a.allocatedQuantity} وحدة</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 font-extrabold text-xs rounded-md">
                        {a.strategyUsed}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs rounded-lg">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'holds' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>{isAr ? 'مركز الحظر والإيقاف الإداري/الجودة (Inventory Holds)' : 'Inventory Holds'}</span>
            </h2>
            <button className="px-3.5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all shadow-md">
              {isAr ? '+ تطبيق حظر جديد' : '+ Apply Hold'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {holds.map(h => (
              <div key={h.id} className="p-4 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-amber-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-400">{h.holdNumber}</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">{h.reason}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500 text-white font-bold text-xs rounded-lg shadow-sm">
                    {h.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{h.productNameAr}</div>
                  <div className="text-xs font-mono text-slate-400">{h.skuCode} | الخانة: {h.binCode}</div>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="text-slate-500">{isAr ? 'السبب الملاحظ:' : 'Reason:'} <span className="font-semibold text-slate-800 dark:text-slate-200">{h.notesAr}</span></div>
                  <div className="text-slate-400 text-[11px]">{isAr ? 'بواسطة:' : 'By:'} {h.blockedByUserNameAr}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'transfers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" />
              <span>{isAr ? 'تحويلات المخزون بين المستودعات والفروع (Stock Transfers)' : 'Stock Transfers'}</span>
            </h2>
            <button className="px-3.5 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all shadow-md">
              {isAr ? '+ أمر تحويل جديد' : '+ New Transfer'}
            </button>
          </div>

          <div className="space-y-3">
            {transfers.map(t => (
              <div key={t.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400">{t.transferNumber}</span>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded">{t.transferType}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{t.productNameAr}</div>
                  <div className="text-xs text-slate-500">
                    من: <strong className="text-slate-800 dark:text-slate-200">{t.sourceWarehouseNameAr}</strong> إلى: <strong className="text-slate-800 dark:text-slate-200">{t.destinationWarehouseNameAr}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">{isAr ? 'الكمية المحولة:' : 'Qty:'}</span>
                    <span className="font-extrabold text-sky-600 text-sm">{t.quantity} وحدة</span>
                  </div>
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-800 font-bold rounded-xl text-xs">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'adjustments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600" />
              <span>{isAr ? 'تسويات وتعديلات نتائج الجرد الدوري (Inventory Adjustments)' : 'Inventory Adjustments'}</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">{isAr ? 'رقم التسوية' : 'Adj #'}</th>
                  <th className="px-4 py-3">{isAr ? 'نوع التعديل' : 'Type'}</th>
                  <th className="px-4 py-3">{isAr ? 'المنتج / SKU' : 'SKU'}</th>
                  <th className="px-4 py-3">{isAr ? 'الكمية السابقة' : 'Prev Qty'}</th>
                  <th className="px-4 py-3">{isAr ? 'الكمية الفعلية' : 'New Qty'}</th>
                  <th className="px-4 py-3">{isAr ? 'الفارق' : 'Diff'}</th>
                  <th className="px-4 py-3">{isAr ? 'الأثر المالي (SAR)' : 'Financial Value'}</th>
                  <th className="px-4 py-3">{isAr ? 'الحالة والاعتماد' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {adjustments.map(adj => (
                  <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700 dark:text-purple-400">{adj.adjustmentNumber}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-md">
                        {adj.adjustmentType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>{adj.productNameAr}</div>
                      <div className="text-xs font-mono text-slate-400">{adj.skuCode}</div>
                    </td>
                    <td className="px-4 py-3 font-mono">{adj.previousQuantity}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{adj.adjustedQuantity}</td>
                    <td className={`px-4 py-3 font-bold ${adj.differenceQuantity >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {adj.differenceQuantity > 0 ? `+${adj.differenceQuantity}` : adj.differenceQuantity}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{adj.financialValueImpactSar.toLocaleString()} ر.س</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                        {adj.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'atp' && atpData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                <span>{isAr ? 'لوحة حساب المتاح للوعد اللحظية ATP (Available To Promise)' : 'ATP Metrics Real-Time'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{atpData.productNameAr} ({atpData.skuCode})</p>
            </div>
            <div className="text-left dir-ltr">
              <span className="text-2xl font-extrabold text-emerald-600">{atpData.availableToPromiseQuantity}</span>
              <span className="text-xs text-slate-400 block">{isAr ? 'وحدة متاحة للوعد' : 'Units Available to Promise'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-400 block">{isAr ? 'الموجود بالحيازة (On-Hand)' : 'On-Hand Qty'}</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">{atpData.onHandQuantity}</span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
              <span className="text-xs text-amber-600 dark:text-amber-400 block">{isAr ? 'المحجوز (Reserved)' : 'Reserved'}</span>
              <span className="text-lg font-extrabold text-amber-700 dark:text-amber-300 mt-1 block">-{atpData.reservedQuantity}</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 block">{isAr ? 'المخصص (Allocated)' : 'Allocated'}</span>
              <span className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 mt-1 block">-{atpData.allocatedQuantity}</span>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
              <span className="text-xs text-red-600 dark:text-red-400 block">{isAr ? 'المحظور (Hold)' : 'Hold'}</span>
              <span className="text-lg font-extrabold text-red-700 dark:text-red-300 mt-1 block">-{atpData.holdQuantity}</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block">{isAr ? 'القادم بطلب الشراء (PO)' : 'Incoming PO'}</span>
              <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 block">+{atpData.incomingPoQuantity}</span>
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>{isAr ? 'مخطط التغيرات الزمني (Inventory Event Timeline)' : 'Inventory Event Timeline'}</span>
            </h3>
            <div className="space-y-2">
              {timelineEvents.map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded">{evt.eventType}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{evt.descriptionAr}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>{evt.operatorNameAr}</span>
                    <span className="font-mono text-slate-500">{new Date(evt.timestamp).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ai-intelligence' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>{isAr ? 'الذكاء الاصطناعي لاستراتيجية العمليات والاحتياطي AI Inventory Intelligence' : 'AI Inventory Intelligence'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'توصيات التنبؤ بمعدل استهلاك المخزون وضبط حد إعادة الطلب وتفادي النقص' : 'Automated AI recommendations for safety stock, reorder point, and stockout risk detection'}
              </p>
            </div>
            <button
              onClick={runAiOptimization}
              disabled={aiLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'تشغيل تحليل الذكاء الاصطناعي' : 'Run AI Analysis')}</span>
            </button>
          </div>

          {aiResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <span className="text-xs text-amber-700 dark:text-amber-300 block">{isAr ? 'الاحتياطي الموصى به (Safety Stock)' : 'Recommended Safety Stock'}</span>
                  <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1 block">{aiResult.recommendedSafetyStock} وحدة</span>
                </div>
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-900/50">
                  <span className="text-xs text-sky-700 dark:text-sky-300 block">{isAr ? 'نقطة إعادة الطلب المتوقعة' : 'Predicted Reorder Point'}</span>
                  <span className="text-2xl font-extrabold text-sky-900 dark:text-sky-200 mt-1 block">{aiResult.predictedReorderPoint} وحدة</span>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
                  <span className="text-xs text-red-700 dark:text-red-300 block">{isAr ? 'نسبة مخاطر العجز (Stockout Risk)' : 'Stockout Risk'}</span>
                  <span className="text-2xl font-extrabold text-red-900 dark:text-red-200 mt-1 block">{aiResult.riskOfStockoutPercent}%</span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 block">{isAr ? 'مؤشر كفاءة المخزون' : 'AI Health Score'}</span>
                  <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1 block">{aiResult.aiHealthScorePercent}%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'توصيات الذكاء الاصطناعي:' : 'AI Optimization Advice:'}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{aiResult.atpOptimizationAdviceAr}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Bot className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">{isAr ? 'اضغط على زر تشغيل تحليل الذكاء الاصطناعي لاستخلاص التوصيات التلقائية' : 'Click "Run AI Analysis" to view optimization insights'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
