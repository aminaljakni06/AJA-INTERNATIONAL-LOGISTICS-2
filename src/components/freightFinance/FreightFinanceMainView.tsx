import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  PieChart,
  BarChart3,
  FileCheck,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  RefreshCw,
  Truck,
  Building2,
  FileText,
  ShieldAlert,
  ArrowRight,
  Layers,
  Scale,
  Percent,
  Receipt,
  HelpCircle,
  ChevronRight,
  Edit,
  Sliders,
  DollarSign as CurrencyIcon
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ShipmentCostBreakdown,
  FreightLandedCostCalculation,
  FreightInvoiceAuditRecord,
  ProfitabilityByRoute,
  AIFreightFinanceResult
} from '../../types/freightFinance';
import { FreightFinanceClient } from '../../services/freightFinanceClient';

export const FreightFinanceMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'cost-breakdown' | 'invoice-audit' | 'landed-cost' | 'profitability-routes' | 'executive-kpis' | 'ai-finance-copilot'>('cost-breakdown');

  const [costBreakdowns, setCostBreakdowns] = useState<ShipmentCostBreakdown[]>([]);
  const [invoiceAudits, setInvoiceAudits] = useState<FreightInvoiceAuditRecord[]>([]);
  const [landedCosts, setLandedCosts] = useState<FreightLandedCostCalculation[]>([]);
  const [routesProfitability, setRoutesProfitability] = useState<ProfitabilityByRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCostItem, setSelectedCostItem] = useState<ShipmentCostBreakdown | null>(null);

  // Invoice Dispute / Approval Modal State
  const [auditTargetInvoice, setAuditTargetInvoice] = useState<FreightInvoiceAuditRecord | null>(null);
  const [auditActionStatus, setAuditActionStatus] = useState<'APPROVED' | 'DISPUTED'>('APPROVED');
  const [auditNotesAr, setAuditNotesAr] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIFreightFinanceResult | null>(null);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [costs, audits, landed, routes] = await Promise.all([
        FreightFinanceClient.getShipmentCostBreakdowns(),
        FreightFinanceClient.getFreightInvoiceAudits(),
        FreightFinanceClient.getFreightLandedCosts(),
        FreightFinanceClient.getProfitabilityRoutes(),
      ]);
      setCostBreakdowns(costs);
      setInvoiceAudits(audits);
      setLandedCosts(landed);
      setRoutesProfitability(routes);

      if (costs.length > 0) {
        setSelectedCostItem(costs[0]);
      }
    } catch (err) {
      console.error('Error loading Freight Finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuditStatus = async () => {
    if (!auditTargetInvoice) return;
    setAuditLoading(true);
    try {
      await FreightFinanceClient.updateInvoiceAuditStatus(auditTargetInvoice.id, auditActionStatus, auditNotesAr);
      setAuditTargetInvoice(null);
      setAuditNotesAr('');
      loadFinanceData();
    } catch (err) {
      console.error('Error updating invoice audit status:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRunAiAnalysis = async (item: ShipmentCostBreakdown) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const result = await FreightFinanceClient.analyzeProfitability({
        shipmentId: item.shipmentId,
        trackingNumber: item.trackingNumber,
        totalActualCostSAR: item.totalActualCostSAR,
        totalBilledRevenueSAR: item.totalBilledRevenueSAR,
        marginPercent: item.marginPercent,
      });
      setAiAnalysis(result);
    } catch (err) {
      console.error('AI Freight Finance Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // KPI Computations
  const totalRevenue = costBreakdowns.reduce((acc, c) => acc + c.totalBilledRevenueSAR, 0);
  const totalCost = costBreakdowns.reduce((acc, c) => acc + c.totalActualCostSAR, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const filteredCosts = costBreakdowns.filter(c =>
    c.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerName.includes(searchTerm) ||
    c.originCity.includes(searchTerm) ||
    c.destinationCity.includes(searchTerm) ||
    c.costCenterCode.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-2xl text-white shadow-md">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isAr ? 'منصة التكاليف، الفوترة والربحية اللوجستية (Freight Finance & Audit)' : 'Enterprise Freight Costing, Billing & Profitability Platform'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'التحليل المالي الدقيق للتكاليف المباشرة، التكاليف الكلية Landed Cost، التدقيق التلقائي للناقلين وتحسين الهوامش' : 'Cost Breakdown, Freight Audit, Invoice Reconciliation, Landed Cost & AI Profitability'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFinanceData}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'الربط المالي بالربحية متكامل' : 'Finance Engine Operational'}</span>
          </div>
        </div>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'إجمالي إيرادات النقل المفوترة' : 'Billed Freight Revenue'}</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalRevenue.toLocaleString()} <span className="text-xs font-normal text-gray-500">{isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            مفوترة بالكامل وفق عقود 2026
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'إجمالي التكاليف المباشرة' : 'Direct Logistics Costs'}</span>
            <Calculator className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-500 dark:text-rose-400">
            {totalCost.toLocaleString()} <span className="text-xs font-normal text-gray-500">{isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          <div className="text-[10px] text-gray-400">
            شاملة الوقود، العمالة والصيانة
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'صافي أرباح النقل' : 'Net Freight Profit'}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {totalProfit.toLocaleString()} <span className="text-xs font-normal text-gray-500">{isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          <div className="text-[10px] text-blue-600 font-bold">
            متوسط الهامش: {avgMargin}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>{isAr ? 'تدقيق فواتير الناقلين Audit' : 'Audited Invoices'}</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {invoiceAudits.length} <span className="text-xs font-normal text-gray-500">{isAr ? 'فاتورة' : 'Invoices'}</span>
          </div>
          <div className="text-[10px] text-amber-600 font-bold">
            تم كشف فروقات بقيمة 300 ر.س
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'cost-breakdown', label: isAr ? 'تفاصيل تكاليف الشحنات' : 'Shipment Cost Breakdown', icon: PieChart },
          { id: 'invoice-audit', label: isAr ? 'تدقيق ومطابقة فواتير الناقلين Audit' : 'Freight Invoice Audit', icon: FileCheck },
          { id: 'landed-cost', label: isAr ? 'حاسبة التكلفة الكلية Landed Cost' : 'Landed Cost Calculator', icon: Calculator },
          { id: 'profitability-routes', label: isAr ? 'ربحية المسارات ومراكز التكلفة' : 'Route Profitability & Cost Centers', icon: TrendingUp },
          { id: 'executive-kpis', label: isAr ? 'مؤشرات الأداء المالي اللوجستي' : 'Executive Finance KPIs', icon: BarChart3 },
          { id: 'ai-finance-copilot', label: isAr ? 'تحليل الربحية الذكي AI' : 'AI Freight Profitability', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
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

        {/* TAB 1: SHIPMENT COST BREAKDOWN */}
        {activeTab === 'cost-breakdown' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* SEARCH */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? 'بحث برقم التتبع، العميل، مركز التكلفة، أو المدن...' : 'Search tracking #, customer, cost center...'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                />
              </div>

              {/* TABLE */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-extrabold text-sm flex items-center justify-between">
                  <span>جدول تفكيك عناصر التكلفة وإيراد الشحنات</span>
                  <span className="text-xs font-normal text-gray-400">{filteredCosts.length} شحنة</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="p-3">رقم التتبع</th>
                        <th className="p-3">العميل</th>
                        <th className="p-3">مركز التكلفة</th>
                        <th className="p-3">التكلفة المباشرة</th>
                        <th className="p-3">الإيراد المفوتر</th>
                        <th className="p-3">صافي الربح</th>
                        <th className="p-3">هامش الربح %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredCosts.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedCostItem(item)}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                            selectedCostItem?.id === item.id ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-blue-600">{item.trackingNumber}</td>
                          <td className="p-3 font-extrabold">{item.customerName}</td>
                          <td className="p-3 font-mono text-gray-500">{item.costCenterCode}</td>
                          <td className="p-3 font-bold text-rose-600">{item.totalActualCostSAR.toLocaleString()} ر.س</td>
                          <td className="p-3 font-bold text-emerald-600">{item.totalBilledRevenueSAR.toLocaleString()} ر.س</td>
                          <td className="p-3 font-extrabold text-blue-600">{item.netProfitMarginSAR.toLocaleString()} ر.س</td>
                          <td className="p-3 font-bold text-emerald-600">{item.marginPercent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* DETAILED DRILLDOWN COST BREAKDOWN PANEL */}
            {selectedCostItem && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600">{selectedCostItem.trackingNumber}</span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    تفكيك التكاليف التفصيلية (Itemized Cost Structure)
                  </h3>
                  <p className="text-xs text-gray-500">مركز التكلفة: {selectedCostItem.costCenterCode}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <span className="text-gray-500">أجور النقل الأساسية:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{selectedCostItem.baseTransportationCostSAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <span className="text-gray-500">إضافي وقود السولار:</span>
                    <strong className="text-amber-600 font-bold">{selectedCostItem.fuelSurchargeSAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <span className="text-gray-500">أجور وساعات السائق:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{selectedCostItem.driverLaborCostSAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <span className="text-gray-500">التخزين والخدمات المبردة:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{selectedCostItem.warehouseStorageCostSAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <span className="text-gray-500">التأمين والجمارك:</span>
                    <strong className="text-gray-900 dark:text-gray-100">{(selectedCostItem.insuranceCostSAR + selectedCostItem.customsDutySAR).toLocaleString()} ر.س</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <span className="text-gray-500">ضريبة القيمة المضافة VAT (15%):</span>
                    <strong className="text-gray-900 dark:text-gray-100">{selectedCostItem.vatTaxSAR.toLocaleString()} ر.س</strong>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <span>إجمالي الإيراد المفوتر للعميل:</span>
                    <span>{selectedCostItem.totalBilledRevenueSAR.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-rose-600">
                    <span>إجمالي التكلفة المباشرة:</span>
                    <span>- {selectedCostItem.totalActualCostSAR.toLocaleString()} ر.س</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between text-sm font-black text-emerald-900 dark:text-emerald-200">
                    <span>صافي هامش الربح:</span>
                    <span>{selectedCostItem.netProfitMarginSAR.toLocaleString()} ر.س ({selectedCostItem.marginPercent}%)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('ai-finance-copilot');
                    handleRunAiAnalysis(selectedCostItem);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-3 rounded-xl shadow transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تحليل الهامش والربحية بـ AI</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVOICE AUDIT & RECONCILIATION */}
        {activeTab === 'invoice-audit' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-indigo-600">
                <FileCheck className="w-5 h-5" />
                <span>نظام التدقيق التلقائي لفواتير الناقلين والشركاء (Freight Invoice Audit)</span>
              </h3>
              <p className="text-xs text-gray-500">فحص أسعار العقود التلقائي، اكتشاف الفروقات والرسوم العشوائية والحد من النفقات</p>
            </div>

            <div className="space-y-4">
              {invoiceAudits.map((inv) => (
                <div
                  key={inv.id}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    inv.auditStatus === 'DISCREPANCY'
                      ? 'bg-amber-50/40 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/40'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600">{inv.invoiceNumber}</span>
                      <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{inv.partyName}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      inv.auditStatus === 'MATCHED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {inv.auditStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-gray-400 text-[10px] block">المبلغ المفوتر بالفاتورة</span>
                      <strong className="text-sm font-black text-gray-900 dark:text-gray-100">{inv.billedAmountSAR.toLocaleString()} ر.س</strong>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-gray-400 text-[10px] block">المبلغ المتوقع حسب العقد</span>
                      <strong className="text-sm font-black text-emerald-600">{inv.expectedContractAmountSAR.toLocaleString()} ر.س</strong>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-gray-400 text-[10px] block">مقدار الفارق والتفاوت</span>
                      <strong className={`text-sm font-black ${inv.varianceSAR > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {inv.varianceSAR} ر.س ({inv.variancePercentage}%)
                      </strong>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-gray-400 text-[10px] block">تاريخ الاستحقاق</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{inv.dueDate}</span>
                    </div>
                  </div>

                  {inv.discrepancyReasonAr && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 font-medium">
                      ملاحظة التدقيق التلقائي: {inv.discrepancyReasonAr}
                    </p>
                  )}

                  {inv.auditStatus === 'DISCREPANCY' && (
                    <button
                      onClick={() => setAuditTargetInvoice(inv)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تسوية واتماد / الاعتراض على الفاتورة</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LANDED COST CALCULATOR */}
        {activeTab === 'landed-cost' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-teal-600">
                <Calculator className="w-5 h-5" />
                <span>حاسبة التكلفة الكلية للمنتجات (Freight Landed Cost Calculator)</span>
              </h3>
              <p className="text-xs text-gray-500">حساب تكلفة الوحدة الكلية شاملة الشحن الدولي، الجمارك، التأمين، التناول والتوزيع</p>
            </div>

            {landedCosts.map((lc) => (
              <div key={lc.id} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">{lc.orderNumber}</span>
                    <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{lc.productDescriptionAr}</h4>
                  </div>
                  <span className="text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-3 py-1 rounded-xl">
                    عدد الوحدات: {lc.unitQuantity} قطعة
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-[10px] block">سعر شراء المنتج الأصلي</span>
                    <strong className="text-sm font-black">{lc.productBaseCostSAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-[10px] block">تكلفة الشحن اللوجستي</span>
                    <strong className="text-sm font-black text-blue-600">{lc.freightCostSAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-[10px] block">الجمارك والضريبة</span>
                    <strong className="text-sm font-black text-rose-600">{lc.customsDutySAR.toLocaleString()} ر.س</strong>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-[10px] block">التأمين والتناول</span>
                    <strong className="text-sm font-black text-amber-600">{(lc.insuranceCostSAR + lc.handlingCostSAR).toLocaleString()} ر.س</strong>
                  </div>

                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 col-span-2 md:col-span-1">
                    <span className="text-teal-600 dark:text-teal-400 text-[10px] font-bold block">إجمالي التكلفة الكلية Landed</span>
                    <strong className="text-lg font-black text-teal-700 dark:text-teal-300">{lc.totalLandedCostSAR.toLocaleString()} ر.س</strong>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">تكلفة القطعة الواحدة الكلية (Unit Landed Cost):</span>
                    <p className="text-xl font-black text-teal-600">{lc.unitLandedCostSAR} ر.س / قطعة</p>
                  </div>
                  <div>
                    <span className="text-gray-500">معامل إضافة التكاليف (Multiplier Factor):</span>
                    <p className="text-xl font-black text-indigo-600">{lc.effectiveLandedMultiplier}x (زيادة {((lc.effectiveLandedMultiplier - 1) * 100).toFixed(1)}% عن سعر الشراء)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ROUTE PROFITABILITY & COST CENTERS */}
        {activeTab === 'profitability-routes' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-5 h-5" />
                <span>ربحية خطوط النقل الرئيسية ومراكز التكلفة (Route Profitability Analytics)</span>
              </h3>
              <p className="text-xs text-gray-500">تحليل الأداء المالي لكل مسار، متوسط تكلفة الكيلومتر والهوامش المتحققة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routesProfitability.map((rt, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{rt.routeKey}</h4>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {rt.totalShipmentsCount} شحنة
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">الإيرادات المفوترة:</span>
                      <strong className="text-emerald-600 font-bold">{rt.totalRevenueSAR.toLocaleString()} ر.س</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">التكاليف المباشرة:</span>
                      <strong className="text-rose-600 font-bold">{rt.totalCostSAR.toLocaleString()} ر.س</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">صافي الربح المتحقق:</span>
                      <strong className="text-blue-600 font-extrabold">{rt.netProfitSAR.toLocaleString()} ر.س</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">تكلفة الكيلومتر الواحد:</span>
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{rt.averageCostPerKmSAR} ر.س / كم</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold">متوسط الهامش:</span>
                    <span className="text-sm font-black text-emerald-600">{rt.averageMarginPercent}%</span>
                  </div>
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
                <span>لوحة القيادة التنفيذية للتكاليف والربحية (Executive Finance Analytics)</span>
              </h3>
              <p className="text-xs text-gray-500">مؤشرات الإيرادات، وفورات تدقيق الفواتير، متوسط الربح للرحلة والعائد المالي</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">متوسط الربح لكل شحنة</span>
                <p className="text-2xl font-black text-emerald-600">2,530 ر.س</p>
                <span className="text-[10px] text-gray-400">زيادة 8.4% مقارنة بالربع السابق</span>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">وفورات تدقيق الفواتير Audit</span>
                <p className="text-2xl font-black text-indigo-600">42,500 ر.س</p>
                <span className="text-[10px] text-gray-400">تم منع صرف رسوم غير معتمدة</span>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">متوسط الهامش الإجمالي</span>
                <p className="text-2xl font-black text-blue-600">26.3%</p>
                <span className="text-[10px] text-gray-400">الهدف المعتمد: 25.0%</span>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500">نسبة الالتزام بالفوترة OTD</span>
                <p className="text-2xl font-black text-teal-600">99.4%</p>
                <span className="text-[10px] text-gray-400">إصدار آلي مباشر للفواتير</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI FREIGHT PROFITABILITY COPILOT */}
        {activeTab === 'ai-finance-copilot' && selectedCostItem && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
            <div>
              <h3 className="font-black text-lg flex items-center gap-2 text-emerald-600">
                <Sparkles className="w-5 h-5" />
                <span>مساعد الذكاء الاصطناعي لتحسين الهوامش والربحية (AI Freight Finance Intelligence)</span>
              </h3>
              <p className="text-xs text-gray-500">تحليل نماذج Gemini للتنبؤ بالتكاليف، توصيات التسعير واكتشاف الفروقات المالية</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-600">الشحنة المالية المحللة:</span>
                  <h4 className="font-black text-base text-gray-900 dark:text-gray-100">{selectedCostItem.trackingNumber} - {selectedCostItem.customerName}</h4>
                </div>
                <button
                  onClick={() => handleRunAiAnalysis(selectedCostItem)}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'جاري التحليل المالي...' : 'تحديث التحليل بـ AI'}</span>
                </button>
              </div>

              {aiAnalysis && (
                <div className="space-y-4 pt-4 border-t border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-gray-400 text-[10px] block">التكلفة المستقبلية المتوقعة</span>
                      <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                        {aiAnalysis.predictedFutureCostSAR.toLocaleString()} ر.س
                      </strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-gray-400 text-[10px] block">تقييم كفاءة الربحية</span>
                      <strong className="text-lg font-black text-blue-600">{aiAnalysis.marginOptimizationScorePercent}%</strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-gray-400 text-[10px] block">نسبة ثقة الذكاء الاصطناعي</span>
                      <strong className="text-lg font-black text-indigo-600">{aiAnalysis.aiConfidencePercent}%</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                    <p className="font-bold text-gray-900 dark:text-gray-100">فرص خفض التكلفة المباشرة:</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      {aiAnalysis.costReductionOpportunitiesAr.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    <p className="font-bold text-gray-900 dark:text-gray-100 mt-3">توصية تسعير الناقل الشريك:</p>
                    <p className="text-blue-600 font-bold">{aiAnalysis.carrierRateRecommendationAr}</p>

                    <p className="font-bold text-gray-900 dark:text-gray-100 mt-3">تقييم المخاطر المالية:</p>
                    <p className="text-gray-600 dark:text-gray-300">{aiAnalysis.financialRiskAssessmentAr}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AUDIT RESOLUTION MODAL */}
      {auditTargetInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <span>اعتماد أو الاعتراض على الفاتورة</span>
            </h3>

            <p className="text-xs text-gray-500">
              الفاتورة: <strong>{auditTargetInvoice.invoiceNumber}</strong> - {auditTargetInvoice.partyName}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">القرار المالي:</label>
              <select
                value={auditActionStatus}
                onChange={(e) => setAuditActionStatus(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs outline-none"
              >
                <option value="APPROVED">اعتماد الفاتورة للتسوية والصرف</option>
                <option value="DISPUTED">تسجيل اعتراض رسمي ورفض الفارق المالية</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">ملاحظات وقرار التدقيق:</label>
              <textarea
                value={auditNotesAr}
                onChange={(e) => setAuditNotesAr(e.target.value)}
                placeholder="ادخل الملاحظات أو مبررات الاعتماد/الاعتراض..."
                className="w-full h-24 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAuditTargetInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateAuditStatus}
                disabled={auditLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow disabled:opacity-50"
              >
                {auditLoading ? 'جاري الحفظ...' : 'تأكيد وحفظ القرار'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreightFinanceMainView;
