import React, { useState, useEffect } from 'react';
import {
  FileText,
  Package,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileCode,
  Award,
  Download,
  Building,
  Calendar,
  Send,
  Zap,
  ChevronRight,
  TrendingUp,
  Layers,
  BarChart2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  CommercialContract,
  SalesOrder,
  AIContractAnalysisResponse
} from '../../types/contract';
import { ContractClient } from '../../services/contractClient';

export const ContractPlatformMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'contracts' | 'sales-orders' | 'rate-cards' | 'sla-compliance' | 'renewals' | 'ai-analyzer'>('contracts');
  const [contracts, setContracts] = useState<CommercialContract[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<CommercialContract | null>(null);

  // New Contract Modal State
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newContractType, setNewContractType] = useState('MASTER_SERVICE_AGREEMENT');
  const [newContractValue, setNewContractValue] = useState('1500000');

  // AI Analyzer State
  const [aiTextPrompt, setAiTextPrompt] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIContractAnalysisResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, sData] = await Promise.all([
        ContractClient.getContracts(),
        ContractClient.getSalesOrders()
      ]);
      setContracts(cData);
      setSalesOrders(sData);
      if (cData.length > 0) {
        setSelectedContract(cData[0]);
      }
    } catch (err) {
      console.error('Error loading contracts data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractTitle || !newCustomerName) return;

    try {
      const created = await ContractClient.createContract({
        contractNumber: `AJA-CTR-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: newContractTitle,
        contractType: newContractType as any,
        version: 1,
        revision: 0,
        status: 'ACTIVE',
        customerId: `CUST-${Date.now()}`,
        customerName: newCustomerName,
        effectiveDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        renewalDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenewal: true,
        businessOwner: 'م. أحمد الشمري',
        legalOwner: 'د. طارق الزهراني',
        commercialOwner: 'عبدالرحمن العتيبي',
        currency: 'SAR',
        contractValue: parseFloat(newContractValue) || 1000000,
        jurisdiction: 'المملكة العربية السعودية - المحكمة التجارية بالرياض',
        governingLaw: 'أنظمة الهيئة العامة للنقل والجمارك',
        languages: ['ar', 'en'],
        clauses: [
          {
            id: 'CLS-NEW-1',
            title: 'بند الخصم الكمي وشروط السعة',
            content: 'خصم تشغيلي 10% عند تجاوز حجم التخزين 1000 طبلية شهرياً.',
            category: 'PRICING',
            isMandatory: true,
          }
        ],
        slaRules: [
          {
            id: 'SLA-NEW-1',
            metricName: 'دقة المواعيد المحددة',
            targetValue: '99.0% على الأقل',
            penaltyRule: 'تعويض بقيمة 3% عند الإخلال',
            escalationContact: 'sla@aja-logistics.sa',
          }
        ],
        rateCards: [],
        signatures: [],
        versionHistory: [
          {
            versionNumber: 1,
            revisedAt: new Date().toISOString(),
            revisedBy: 'نظام إدارة العقود',
            changeSummary: 'إنشاء العقد المبدئي',
          }
        ],
        riskFlags: [],
        complianceCheck: {
          insuranceValid: true,
          taxValid: true,
          licenseValid: true,
          auditPassed: true,
        }
      });

      setContracts([created, ...contracts]);
      setSelectedContract(created);
      setShowNewContractModal(false);
      setNewContractTitle('');
      setNewCustomerName('');
    } catch (err) {
      console.error('Error creating contract:', err);
    }
  };

  const runAiAnalysis = async () => {
    if (!aiTextPrompt && !selectedContract) return;
    setAiAnalyzing(true);
    setAiResult(null);

    const promptText = aiTextPrompt || (selectedContract ? selectedContract.clauses.map(c => `${c.title}: ${c.content}`).join('\n') : '');

    try {
      const token = localStorage.getItem('aja_auth_token');
      if (!token) {
        throw new Error('Authentication token is required for AI analysis.');
      }
      const res = await fetch('/api/crm/contracts/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contractTitle: selectedContract?.title || 'تحليل اتفاقية تجارية',
          contractType: selectedContract?.contractType || 'MASTER_SERVICE_AGREEMENT',
          clausesText: promptText,
          slaText: selectedContract?.slaRules.map(s => `${s.metricName}: ${s.targetValue}`).join('\n')
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiResult(data.result);
      }
    } catch (err) {
      console.error('AI Analysis error:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const filteredContracts = contracts.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isAr ? 'منصة العقود التجارية وأوامر المبيعات 360' : 'Enterprise Contracts & Sales Orders Platform'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {isAr
                  ? 'إدارة عقود الخدمات اللوجستية، اتفاقيات المستويات (SLA)، تعرفة الأسعار، وأوامر المبيعات المعتمدة مع تحليلات الذكاء الاصطناعي'
                  : 'Commercial Agreements, SLA Governance, Rate Cards, Sales Orders, and AI Contract Intelligence'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('ai-analyzer');
              runAiAnalysis();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-medium text-sm transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isAr ? 'تحليل العقد بالذكاء الاصطناعي' : 'AI Contract Intelligence'}
          </button>
          <button
            onClick={() => setShowNewContractModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إبرام عقد جديد' : 'New Contract'}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
        {[
          { id: 'contracts', label: isAr ? 'مركز العقود والاتفاقيات' : 'Contracts Center', icon: FileText },
          { id: 'sales-orders', label: isAr ? 'أوامر المبيعات (Sales Orders)' : 'Sales Orders', icon: Package },
          { id: 'rate-cards', label: isAr ? 'جدول التعرفات (Rate Cards)' : 'Rate Cards Matrix', icon: DollarSign },
          { id: 'sla-compliance', label: isAr ? 'اتفاقية المستويات والامتثال (SLA)' : 'SLA & Compliance', icon: ShieldCheck },
          { id: 'renewals', label: isAr ? 'التجديدات والتعديلات' : 'Renewals & Revisions', icon: RefreshCw },
          { id: 'ai-analyzer', label: isAr ? 'ذكاء العقود الاصطناعي' : 'AI Intelligence', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Areas */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: CONTRACTS CENTER */}
          {activeTab === 'contracts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Contract List & Filters */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isAr ? 'بحث برقم العقد، اسم العميل، العنوان...' : 'Search contracts...'}
                    className="w-full bg-transparent border-none text-sm focus:outline-none text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredContracts.map((c) => {
                    const isSelected = selectedContract?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedContract(c)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 shadow-sm'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {c.contractNumber}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm mt-2 line-clamp-1">{c.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {c.customerName}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {c.contractValue.toLocaleString()} {c.currency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(c.expirationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Contract Details */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                {selectedContract ? (
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {selectedContract.contractNumber}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                            v{selectedContract.version}.{selectedContract.revision}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold mt-2">{selectedContract.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {selectedContract.customerName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{isAr ? 'القيمة الإجمالية' : 'Contract Value'}</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedContract.contractValue.toLocaleString()} {selectedContract.currency}
                        </span>
                      </div>
                    </div>

                    {/* Key Attributes Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{isAr ? 'نوع العقد' : 'Type'}</span>
                        <span className="font-semibold mt-1 block">{selectedContract.contractType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{isAr ? 'تاريخ البدء' : 'Effective'}</span>
                        <span className="font-semibold mt-1 block">{new Date(selectedContract.effectiveDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{isAr ? 'تاريخ الانتهاء' : 'Expiration'}</span>
                        <span className="font-semibold mt-1 block">{new Date(selectedContract.expirationDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{isAr ? 'المسؤول التجاري' : 'Commercial Owner'}</span>
                        <span className="font-semibold mt-1 block">{selectedContract.commercialOwner}</span>
                      </div>
                    </div>

                    {/* Contract Clauses */}
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        {isAr ? 'البنود القانونية والتجاري الرئيسية' : 'Key Legal & Commercial Clauses'}
                      </h4>
                      <div className="space-y-3">
                        {selectedContract.clauses.map((clause) => (
                          <div key={clause.id} className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
                            <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-gray-100">
                              <span>{clause.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                                {clause.category}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                              {clause.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Digital Signatures Status */}
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        {isAr ? 'التوقيع الرقمي والشهادات المعتمدة' : 'Digital Signatures & Verification'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedContract.signatures.map((sig) => (
                          <div key={sig.id} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-300">
                              <span>{sig.signerName}</span>
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">{sig.signerEmail} ({sig.signerRole})</p>
                            <p className="font-mono text-[10px] text-gray-400 truncate">Hash: {sig.verificationHash}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    {isAr ? 'يرجى اختيار عقد لعرض تفاصيله' : 'Select a contract to view details'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: SALES ORDERS */}
          {activeTab === 'sales-orders' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  {isAr ? 'سجل أمر المبيعات التنفيذية' : 'Sales Orders Registry'}
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                  {salesOrders.length} {isAr ? 'أوامر مبيعات قائمة' : 'Orders'}
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right rtl:text-right ltr:text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="p-3.5">{isAr ? 'رقم الأمر' : 'Order #'}</th>
                        <th className="p-3.5">{isAr ? 'العميل' : 'Customer'}</th>
                        <th className="p-3.5">{isAr ? 'العقد المرجعي' : 'Contract Ref'}</th>
                        <th className="p-3.5">{isAr ? 'المبلغ الإجمالي' : 'Grand Total'}</th>
                        <th className="p-3.5">{isAr ? 'جدول الفوترة' : 'Billing Schedule'}</th>
                        <th className="p-3.5">{isAr ? 'نسبة الإنجاز' : 'Completion'}</th>
                        <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                      {salesOrders.map((so) => (
                        <tr key={so.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{so.orderNumber}</td>
                          <td className="p-3.5 font-medium">{so.customerName}</td>
                          <td className="p-3.5 font-mono text-gray-500">{so.contractRef || 'N/A'}</td>
                          <td className="p-3.5 font-bold text-gray-900 dark:text-gray-100">
                            {so.grandTotal.toLocaleString()} {so.currency}
                          </td>
                          <td className="p-3.5 text-gray-500">{so.billingSchedule}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${so.completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold">{so.completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                              {so.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RATE CARDS */}
          {activeTab === 'rate-cards' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: isAr ? 'الشحن البحري (Sea Freight)' : 'Sea Freight', count: '12 مسار معتمد', icon: Layers },
                  { title: isAr ? 'التخزين المبرد والجاف' : 'Warehousing', count: '5 مستودعات رئيسية', icon: Building },
                  { title: isAr ? 'النقل البري والسريع' : 'Land Transport', count: '24 وجهة داخلية', icon: TrendingUp },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{card.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rate Matrix */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  {isAr ? 'جدول تسعير التعرفات الفعالة حسب العقد' : 'Active Rate Card Matrix'}
                </h3>
                {selectedContract?.rateCards && selectedContract.rateCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContract.rateCards.map((rc) => (
                      <div key={rc.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-blue-600 dark:text-blue-400">{rc.category}</span>
                          <span className="text-base text-emerald-600 dark:text-emerald-400">
                            {rc.baseRate} {rc.currency} / {rc.unitOfMeasure}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500">
                          <span>{isAr ? 'المسار/المنشأة:' : 'Route:'} {rc.origin} ➔ {rc.destination}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-6 text-center">
                    {isAr ? 'لا توجد تعرفات مخصصة مرتبطة بهذا العقد حالياً' : 'No custom rate cards associated with this contract'}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: SLA & COMPLIANCE */}
          {activeTab === 'sla-compliance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  {isAr ? 'مؤشرات أداء مستويات الخدمة (SLA Target vs Real)' : 'SLA Performance Commitments'}
                </h3>
                <div className="space-y-3">
                  {selectedContract?.slaRules.map((sla) => (
                    <div key={sla.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span>{sla.metricName}</span>
                        <span className="text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30">
                          المستهدف: {sla.targetValue}
                        </span>
                      </div>
                      <p className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/40">
                        <strong>{isAr ? 'شرط الجزاء:' : 'Penalty:'}</strong> {sla.penaltyRule}
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        {isAr ? 'مسؤول التصعيد:' : 'Escalation:'} {sla.escalationContact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  {isAr ? 'سجل الامتثال والتراخيص' : 'Compliance & Audit Checklist'}
                </h3>
                {selectedContract && (
                  <div className="space-y-3 text-xs">
                    {[
                      { label: isAr ? 'صلاحية بوليصة التأمين الشامل' : 'Insurance Policy Valid', ok: selectedContract.complianceCheck.insuranceValid },
                      { label: isAr ? 'المطابقة الضريبية (ZATCA)' : 'Tax Compliance', ok: selectedContract.complianceCheck.taxValid },
                      { label: isAr ? 'ترخيص الهيئة العامة للنقل' : 'Transport License', ok: selectedContract.complianceCheck.licenseValid },
                      { label: isAr ? 'اجتياز التدقيق القانوني' : 'Legal Audit Status', ok: selectedContract.complianceCheck.auditPassed },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                        <span>{item.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.ok ? (isAr ? 'معتمد' : 'Passed') : (isAr ? 'معلق' : 'Pending')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: RENEWALS */}
          {activeTab === 'renewals' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                    {isAr ? 'مركز تجديد العقود والتعديلات التشغيلية' : 'Contract Renewal & Revisions Engine'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAr ? 'متابعة العقود القريبة من الانتهاء والتجديد التلقائي' : 'Monitor upcoming contract expirations and auto-renewals'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {contracts.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-mono font-bold text-blue-600">
                        <span>{c.contractNumber}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-900 dark:text-gray-100 font-sans">{c.title}</span>
                      </div>
                      <p className="text-gray-500 mt-1">
                        {isAr ? 'تاريخ التجديد المقترح:' : 'Renewal Date:'} {new Date(c.renewalDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        c.autoRenewal ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {c.autoRenewal ? (isAr ? 'تجديد تلقائي مفعل' : 'Auto-Renewal ON') : (isAr ? 'تجديد يدوي' : 'Manual')}
                      </span>
                      <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                        {isAr ? 'تنشيط مسار التجديد' : 'Trigger Renewal'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 6: AI ANALYZER */}
          {activeTab === 'ai-analyzer' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                  {isAr ? 'محلل العقود الذكي (Gemini Contract AI)' : 'AI Contract Analyzer Input'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'أدخل نصوص البنود والشروط للحصول على ملخص تنفيذي، اكتشاف المخاطر اللوجستية والقانونية، واقتراحات التسعير.'
                    : 'Analyze custom clause text for risk flags, missing clauses, and pricing recommendations.'}
                </p>

                <textarea
                  value={aiTextPrompt}
                  onChange={(e) => setAiTextPrompt(e.target.value)}
                  placeholder={
                    isAr
                      ? 'الصق نصوص البنود والأسعار هنا للتحليل الدقيق...'
                      : 'Paste contract text or clauses here...'
                  }
                  rows={8}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <button
                  onClick={runAiAnalysis}
                  disabled={aiAnalyzing}
                  className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  {aiAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isAr ? 'جاري التحليل المعمق...' : 'Analyzing with Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{isAr ? 'تشغيل التحليل الذكي' : 'Analyze Contract'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Results Output */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                {aiResult ? (
                  <div className="space-y-5 text-xs">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-purple-900 dark:text-purple-300">
                          {isAr ? 'الملخص التنفيذي الذكي' : 'AI Executive Summary'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                          SLA Score: {aiResult.slaQualityScore}%
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiResult.summary}</p>
                    </div>

                    {/* Detected Risks */}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {isAr ? 'المخاطر المكتشفة والتوصيات' : 'Detected Risks & Mitigation'}
                      </h4>
                      <div className="space-y-2">
                        {aiResult.detectedRisks.map((risk, i) => (
                          <div key={i} className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1">
                            <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                              <span>{risk.riskType}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                                {risk.severity}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{risk.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Renewal AI Advice */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl">
                        <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                          {isAr ? 'توصية التسعير الهامشي' : 'Pricing Recommendation'}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">{aiResult.pricingRecommendation}</p>
                      </div>

                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                          {isAr ? 'توصية التجديد والشروط' : 'Renewal Recommendation'}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">{aiResult.renewalRecommendation}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400 text-xs">
                    {isAr ? 'اضغط على تشغيل التحليل لعرض نتائج ذكاء العقود الاصطناعي' : 'Run analysis to view AI Contract Insights'}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* NEW CONTRACT MODAL */}
      {showNewContractModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg">{isAr ? 'إبرام عقد خدمات تجاري جديد' : 'New Commercial Contract'}</h3>
            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">{isAr ? 'عنوان العقد' : 'Contract Title'}</label>
                <input
                  type="text"
                  required
                  value={newContractTitle}
                  onChange={(e) => setNewContractTitle(e.target.value)}
                  placeholder={isAr ? 'عقد خدمات لوجستية وتخزين مبرد' : 'Logistics Agreement Title'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{isAr ? 'اسم العميل' : 'Customer Name'}</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder={isAr ? 'شركة المراعي / شركة النهدي' : 'Customer Company Name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'نوع العقد' : 'Contract Type'}</label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <option value="MASTER_SERVICE_AGREEMENT">Master Service Agreement</option>
                    <option value="TRANSPORTATION_CONTRACT">Transportation Contract</option>
                    <option value="WAREHOUSE_AGREEMENT">Warehouse Agreement</option>
                    <option value="CUSTOMS_AGREEMENT">Customs Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'قيمة العقد (SAR)' : 'Contract Value (SAR)'}</label>
                  <input
                    type="number"
                    value={newContractValue}
                    onChange={(e) => setNewContractValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  {isAr ? 'حفظ وإبرام العقد' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
