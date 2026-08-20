import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Database,
  BarChart3,
  QrCode,
  Tag,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Sliders,
  FileSpreadsheet,
  PackageCheck,
  RotateCcw,
  CheckSquare,
  Building2,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  InventoryItemSKU,
  WarehouseBinStock,
  InventoryLedgerEntry,
  LotBatchRecord,
  SerialNumberRecord,
  ReplenishmentSuggestion,
  CycleCountRecord,
  AIInventoryOptimizationResult
} from '../../types/inventoryControl';
import { InventoryControlClient } from '../../services/inventoryControlClient';

export const InventoryControlMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'skus' | 'stocks' | 'ledger' | 'lots-serials' | 'replenishment' | 'cycle-counts' | 'ai-copilot'>('skus');

  const [skus, setSkus] = useState<InventoryItemSKU[]>([]);
  const [stocks, setStocks] = useState<WarehouseBinStock[]>([]);
  const [ledger, setLedger] = useState<InventoryLedgerEntry[]>([]);
  const [lots, setLots] = useState<LotBatchRecord[]>([]);
  const [serials, setSerials] = useState<SerialNumberRecord[]>([]);
  const [replenishments, setReplenishments] = useState<ReplenishmentSuggestion[]>([]);
  const [cycleCounts, setCycleCounts] = useState<CycleCountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSku, setSelectedSku] = useState<InventoryItemSKU | null>(null);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIInventoryOptimizationResult | null>(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [skuData, stockData, ledgerData, lotData, serialData, repData, ccData] = await Promise.all([
        InventoryControlClient.getInventorySKUs(),
        InventoryControlClient.getWarehouseBinStocks(),
        InventoryControlClient.getInventoryLedger(),
        InventoryControlClient.getLotBatches(),
        InventoryControlClient.getSerialNumbers(),
        InventoryControlClient.getReplenishmentSuggestions(),
        InventoryControlClient.getCycleCountRecords(),
      ]);
      setSkus(skuData);
      setStocks(stockData);
      setLedger(ledgerData);
      setLots(lotData);
      setSerials(serialData);
      setReplenishments(repData);
      setCycleCounts(ccData);

      if (skuData.length > 0) {
        setSelectedSku(skuData[0]);
      }
    } catch (err) {
      console.error('Error loading inventory control data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiInventoryOptimize = async () => {
    if (!selectedSku) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await InventoryControlClient.optimizeInventory({
        skuCode: selectedSku.skuCode,
        nameAr: selectedSku.nameAr,
        currentAvailableQty: stocks.reduce((sum, s) => s.skuCode === selectedSku.skuCode ? sum + s.availableQty : sum, 0),
        reorderPointMin: selectedSku.reorderPointMin,
        categoryAr: selectedSku.categoryAr,
      });
      setAiResult(result);
    } catch (err) {
      console.error('AI Inventory Optimizer Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredSkus = skus.filter(s =>
    s.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nameAr.includes(searchTerm) ||
    s.categoryAr.includes(searchTerm) ||
    s.brand.includes(searchTerm)
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-2xl text-white shadow-md">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isAr ? 'منظومة إدارة المخزون، التحكم والطلب الآلي (Enterprise Inventory Control)' : 'Enterprise Inventory Management, Stock Control & Replenishment'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'سجل المنتجات SKU، تتبع الدفعات والسر الرقمي، دفتر الأستاذ اللوجستي، التجديد التلقائي ومصنّفات ABC/XYZ' : 'SKU Registry, Lot/Serial Tracking, Realtime Stock Ledger, Automated Replenishment & ABC/XYZ Analytics'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInventoryData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'المخزون محدّث لحظياً' : 'Stock Engine Synced'}</span>
          </div>
        </div>
      </div>

      {/* KPIS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'إجمالي الأصناف المعرفة SKU' : 'Defined SKUs'}</span>
          <div className="text-xl font-black text-amber-600">{skus.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'صنف' : 'SKUs'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'الكميات المتوفرة بالخانات' : 'Available Stock'}</span>
          <div className="text-xl font-black text-emerald-600">
            {stocks.reduce((sum, s) => sum + s.availableQty, 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">{isAr ? 'وحدة' : 'Units'}</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'تنبيهات طلب التجديد' : 'Replenishments'}</span>
          <div className="text-xl font-black text-rose-600">{replenishments.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'أمر تجديد' : 'Orders'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'سجلات الدفعات النشطة Lot' : 'Active Lots'}</span>
          <div className="text-xl font-black text-indigo-600">{lots.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'دفعة' : 'Lots'}</span></div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
          <span className="text-gray-400 text-[10px] font-bold block">{isAr ? 'الجرد الدوري المكتمل' : 'Approved Counts'}</span>
          <div className="text-xl font-black text-cyan-600">{cycleCounts.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'عملية' : 'Counts'}</span></div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'skus', label: isAr ? 'دليل المنتجات (SKU Master)' : 'SKU Master Catalog', icon: Database },
          { id: 'stocks', label: isAr ? 'المخزون الفعلي بالخانات (Bin Stock)' : 'Realtime Bin Stock', icon: Layers },
          { id: 'ledger', label: isAr ? 'دفتر الأستاذ (Stock Ledger)' : 'Inventory Ledger', icon: FileSpreadsheet },
          { id: 'lots-serials', label: isAr ? 'الدفعات والأرقام التسلسلية (Lot & Serial)' : 'Lot & Serial Control', icon: QrCode },
          { id: 'replenishment', label: isAr ? 'التجديد التلقائي (Replenishment)' : 'Auto Replenishment', icon: RotateCcw },
          { id: 'cycle-counts', label: isAr ? 'الجرد الدوري مطابقة الفوارق' : 'Cycle Counting', icon: CheckSquare },
          { id: 'ai-copilot', label: isAr ? 'تحليلات وتوقعات AI' : 'AI Inventory Intelligence', icon: Sparkles },
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

        {/* TAB 1: SKU MASTER CATALOG */}
        {activeTab === 'skus' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث برقم SKU، اسم المنتج، الصنف، الباركود أو العلامة التجارية...' : 'Search SKU, Product Name, Category, Barcode...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredSkus.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSku(s)}
                  className={`p-5 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                    selectedSku?.id === s.id
                      ? 'bg-amber-50/40 border-amber-500 dark:bg-amber-950/20'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-600">{s.skuCode}</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        تصنيف ABC: {s.abcClass}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        XYZ: {s.xyzClass}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{s.nameAr}</h4>
                    <p className="text-xs text-gray-500">{s.categoryAr} • {s.brand}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>الباركود / RFID:</span>
                      <strong className="font-mono text-gray-800 dark:text-gray-200">{s.barcode}</strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>حد إعادة الطلب (Min / Max):</span>
                      <strong className="text-amber-600 font-mono">{s.reorderPointMin} / {s.maxStockLevel} {s.unitOfMeasure}</strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>مخزون الأمان (Safety Stock):</span>
                      <strong className="text-emerald-600 font-mono">{s.safetyStockLevel} {s.unitOfMeasure}</strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>تكلفة الوحدة (Unit Cost):</span>
                      <strong className="text-indigo-600 font-mono">{s.unitCostSAR.toLocaleString()} ر.س</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REALTIME BIN STOCK */}
        {activeTab === 'stocks' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>تفاصيل المخزون الفعلي الموزع بالخانات (Realtime Bin Inventory)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">كود SKU</th>
                    <th className="p-3">المستودع / المنطقة</th>
                    <th className="p-3">كود الرف (Bin Code)</th>
                    <th className="p-3">المتوفر الفعلي (Available)</th>
                    <th className="p-3">المحجوز (Reserved)</th>
                    <th className="p-3">التالف (Damaged)</th>
                    <th className="p-3">رقم الدفعة Lot</th>
                    <th className="p-3">تاريخ الانتهاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stocks.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 font-mono font-black text-amber-600">{st.skuCode}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{st.warehouseId} • {st.zoneCode}</td>
                      <td className="p-3 font-mono font-black text-indigo-600">{st.binCode}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{st.availableQty.toLocaleString()}</td>
                      <td className="p-3 font-mono text-amber-600">{st.reservedQty}</td>
                      <td className="p-3 font-mono text-rose-600">{st.damagedQty}</td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-300">{st.lotNumber || '—'}</td>
                      <td className="p-3 font-mono text-gray-500">{st.expiryDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>دفتر الأستاذ وحركات المخزون (Stock Transaction Ledger)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">رقم العملية (Txn#)</th>
                    <th className="p-3">التاريخ والوقت</th>
                    <th className="p-3">كود SKU</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">مقدار التغيير</th>
                    <th className="p-3">الرصيد النهائي</th>
                    <th className="p-3">المستند المرجعي</th>
                    <th className="p-3">المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {ledger.map((lg) => (
                    <tr key={lg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 font-mono font-black text-amber-600">{lg.transactionNumber}</td>
                      <td className="p-3 font-mono text-gray-500">{lg.timestamp}</td>
                      <td className="p-3 font-mono font-bold text-gray-900 dark:text-gray-100">{lg.skuCode}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {lg.transactionType}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+{lg.quantityChanged}</td>
                      <td className="p-3 font-mono font-black text-indigo-600">{lg.resultingBalance}</td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-300">{lg.referenceDocNumber}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{lg.operatorNameAr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LOT & SERIAL TRACKING */}
        {activeTab === 'lots-serials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>سجلات الدفعات والتشغيلات (Lot & Batch Tracking)</span>
              </h4>

              <div className="space-y-3 text-xs">
                {lots.map((lt) => (
                  <div key={lt.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between font-mono font-bold">
                      <span className="text-amber-600">{lt.lotNumber}</span>
                      <span className="text-emerald-600">{lt.status}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">SKU: {lt.skuCode}</p>
                    <p className="text-gray-500">تاريخ الإنتاج: {lt.manufacturingDate} • الانتهاء: {lt.expiryDate}</p>
                    <p className="text-indigo-600 font-bold">{lt.temperatureRequirementAr}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>تتبع الأرقام التسلسلية والضمان (Serial Number Tracking)</span>
              </h4>

              <div className="space-y-3 text-xs">
                {serials.map((sr) => (
                  <div key={sr.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between font-mono font-bold">
                      <span className="text-indigo-600">{sr.serialNumber}</span>
                      <span className="text-emerald-600">{sr.status}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">SKU: {sr.skuCode}</p>
                    <p className="text-gray-500">الموقع: {sr.warehouseId} ({sr.binCode})</p>
                    <p className="text-gray-400">نهاية الضمان: {sr.warrantyExpiryDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUTO REPLENISHMENT */}
        {activeTab === 'replenishment' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>تنبؤات وتنبيهات إعادة الطلب التلقائي (Auto Replenishment Engine)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {replenishments.map((rep) => (
                <div key={rep.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-rose-600">تنبيه حرِج: {rep.urgencyLevel}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {rep.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{rep.productNameAr}</h4>
                    <p className="text-xs text-gray-500 font-mono">SKU: {rep.skuCode} • {rep.warehouseId}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">المتنوع الحالي:</span>
                      <strong className="text-rose-600 font-mono">{rep.currentAvailableQty} (انخفض عن الحد {rep.reorderPoint})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الكمية المقترحة للشراء:</span>
                      <strong className="text-emerald-600 font-mono">{rep.recommendedOrderQty} وحدة</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المورد المقترح:</span>
                      <strong className="text-gray-800 dark:text-gray-200">{rep.suggestedSupplierAr}</strong>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all">
                    توليد أمر شراء فورى (Generate Purchase Order)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CYCLE COUNTING */}
        {activeTab === 'cycle-counts' && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <span>إدارة عمليات الجرد الدوري المجدول (Cycle Counting & Variance Audit)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">خطة الجرد</th>
                    <th className="p-3">المستودع / المنطقة</th>
                    <th className="p-3">الرف (Bin)</th>
                    <th className="p-3">كود SKU</th>
                    <th className="p-3">كمية النظام (System Qty)</th>
                    <th className="p-3">الجرد الفعلي (Counted Qty)</th>
                    <th className="p-3">الفارق (Variance)</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cycleCounts.map((cc) => (
                    <tr key={cc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 font-mono font-black text-amber-600">{cc.countPlanNumber}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{cc.warehouseId} • {cc.zoneCode}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{cc.binCode}</td>
                      <td className="p-3 font-mono text-gray-700 dark:text-gray-300">{cc.skuCode}</td>
                      <td className="p-3 font-mono font-bold">{cc.systemQuantity}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{cc.actualCountedQuantity}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{cc.varianceQuantity}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {cc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AI INVENTORY INTELLIGENCE */}
        {activeTab === 'ai-copilot' && selectedSku && (
          <div className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-amber-600 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>مساعد الذكاء الاصطناعي للمخزون والتنبؤ بالطلب (AI Inventory Intelligence)</span>
                </h3>
                <p className="text-xs text-gray-500">تحليل نماذج Gemini للتنبؤ بالطلب، حساب Safety Stock وتفادي التكدس</p>
              </div>

              <button
                onClick={handleRunAiInventoryOptimize}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'جاري التحليل الذكي...' : 'توليد توصيات المخزون بـ AI'}</span>
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <span className="text-gray-400 font-bold block">المنتج المختار للتحليل:</span>
              <div className="flex justify-between font-bold">
                <span className="text-amber-600 font-mono">{selectedSku.skuCode}</span>
                <span className="text-gray-800 dark:text-gray-200">{selectedSku.nameAr}</span>
                <span className="text-indigo-600">{selectedSku.categoryAr}</span>
              </div>
            </div>

            {aiResult && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 text-[10px] block">مؤشر صحة واستقرار المخزون</span>
                    <strong className="text-xl font-black text-amber-600">{aiResult.healthScorePercent}%</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 text-[10px] block">الطلب المتوقع (30 يوم قادمة)</span>
                    <strong className="text-xl font-black text-indigo-600">{aiResult.predictedDemandNext30Days} وحدة</strong>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <span className="text-gray-400 text-[10px] block">تاريخ إعطاء أمر الشراء الموصى به</span>
                    <strong className="text-sm font-black text-emerald-600">{aiResult.recommendedReplenishmentDate}</strong>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">تقييم مخاطر التكدس والمخزون الميت:</h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{aiResult.deadStockRiskAssessmentAr}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">خطوات إعادة التوازن والتوزيع بين المستودعات:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                      {aiResult.rebalancingActionPlanAr.map((step, idx) => (
                        <li key={idx}>{step}</li>
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

export default InventoryControlMainView;
