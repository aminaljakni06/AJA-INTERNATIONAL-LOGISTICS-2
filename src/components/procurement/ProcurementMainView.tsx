import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Building2,
  Award,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  BadgeCheck,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Sliders,
  Check,
  Download,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SupplierInvoicesView } from './ap/SupplierInvoicesView';
import { ThreeWayMatchingView } from './ap/ThreeWayMatchingView';
import { PaymentAutomationView } from './ap/PaymentAutomationView';
import { SupplierReconciliationView } from './ap/SupplierReconciliationView';
import { APAgingAnalyticsView } from './ap/APAgingAnalyticsView';
import { SpendIntelligenceDashboard } from './analytics/SpendIntelligenceDashboard';
import { SpendCubeExplorer } from './analytics/SpendCubeExplorer';
import { SupplierPerformanceCenter } from './analytics/SupplierPerformanceCenter';
import { SupplierScorecardsView } from './analytics/SupplierScorecardsView';
import { ContractComplianceDashboard } from './analytics/ContractComplianceDashboard';
import { PurchaseCycleAnalyticsView } from './analytics/PurchaseCycleAnalyticsView';
import { ExecutiveProcurementCockpit } from './analytics/ExecutiveProcurementCockpit';
import { AIProcurementIntelligenceCenter } from './analytics/AIProcurementIntelligenceCenter';
import {
  VendorMaster,
  PurchasingOrganization,
  PurchasingGroup,
  SupplierContract,
  ProcurementPolicy,
  SupplierRiskAlert,
  ProcurementSummaryKPIs,
  VendorCategoryType,
  VendorStatus,
  RiskLevel,
  PurchaseRequisition,
  SourcingEvent,
  SupplierQuotation,
  StrategicSourcingAnalytics,
  SourcingEventType,
  SupplierInvoice,
  APPaymentRun,
  SupplierReconciliationStatement,
  APAgingAnalytics,
  AIAPIntelligence,
  ThreeWayMatchResult,
  PaymentRunMethod,
  SpendCubeData,
  SupplierScorecard,
  ContractComplianceMetric,
  ContractComplianceSummary,
  PurchaseCycleAnalytics,
  ExecutiveProcurementKPIs,
  AIProcurementIntelligenceData
} from '../../types/procurement';
import { ProcurementClient } from '../../services/procurementClient';

export const ProcurementMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'spend-intelligence'
    | 'spend-cube'
    | 'supplier-performance-center'
    | 'supplier-scorecards'
    | 'contract-compliance-dashboard'
    | 'purchase-cycle-analytics'
    | 'executive-cockpit'
    | 'ai-procurement-center'
    | 'sourcing-requisitions'
    | 'sourcing-events'
    | 'quotations-bids'
    | 'supplier-invoices'
    | 'three-way-matching'
    | 'payment-runs'
    | 'supplier-reconciliation'
    | 'ap-aging-analytics'
    | 'vendor-master'
    | 'srm-performance'
    | 'risk-center'
    | 'purchasing-org'
    | 'contracts'
    | 'ai-intelligence'
  >('dashboard');

  // State Data
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKPIs] = useState<ProcurementSummaryKPIs | null>(null);
  const [vendors, setVendors] = useState<VendorMaster[]>([]);
  const [orgs, setOrgs] = useState<PurchasingOrganization[]>([]);
  const [groups, setGroups] = useState<PurchasingGroup[]>([]);
  const [contracts, setContracts] = useState<SupplierContract[]>([]);
  const [policies, setPolicies] = useState<ProcurementPolicy[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<SupplierRiskAlert[]>([]);
  const [aiIntelligence, setAiIntelligence] = useState<any>(null);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [sourcingEvents, setSourcingEvents] = useState<SourcingEvent[]>([]);
  const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
  const [sourcingAnalytics, setSourcingAnalytics] = useState<StrategicSourcingAnalytics | null>(null);

  // AP State Data
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [paymentRuns, setPaymentRuns] = useState<APPaymentRun[]>([]);
  const [reconciliations, setReconciliations] = useState<SupplierReconciliationStatement[]>([]);
  const [apAging, setApAging] = useState<APAgingAnalytics | null>(null);
  const [apAiIntel, setApAiIntel] = useState<AIAPIntelligence | null>(null);

  // Procurement Intelligence State Data (ALBP-007.005)
  const [spendCubeData, setSpendCubeData] = useState<SpendCubeData | null>(null);
  const [scorecardsData, setScorecardsData] = useState<SupplierScorecard[]>([]);
  const [contractComplianceData, setContractComplianceData] = useState<{ summary: ContractComplianceSummary; metrics: ContractComplianceMetric[] } | null>(null);
  const [purchaseCycleData, setPurchaseCycleData] = useState<PurchaseCycleAnalytics | null>(null);
  const [executiveKpiData, setExecutiveKpiData] = useState<ExecutiveProcurementKPIs | null>(null);
  const [aiIntelCenterData, setAiIntelCenterData] = useState<AIProcurementIntelligenceData | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals / Selection
  const [selectedVendor, setSelectedVendor] = useState<VendorMaster | null>(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState<boolean>(false);
  const [showAddPRModal, setShowAddPRModal] = useState<boolean>(false);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState<boolean>(false);
  const [showBidEvalModal, setShowBidEvalModal] = useState<boolean>(false);
  const [bidEvalResult, setBidEvalResult] = useState<any>(null);
  const [bidEvalLoading, setBidEvalLoading] = useState<boolean>(false);
  const [showAiEvalModal, setShowAiEvalModal] = useState<boolean>(false);
  const [aiEvalResult, setAiEvalResult] = useState<any>(null);
  const [aiEvalLoading, setAiEvalLoading] = useState<boolean>(false);
  const [showOCRCaptureModal, setShowOCRCaptureModal] = useState<boolean>(false);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrRawText, setOcrRawText] = useState<string>('');
  const [show3WayMatchModal, setShow3WayMatchModal] = useState<boolean>(false);
  const [selectedInvoiceForMatching, setSelectedInvoiceForMatching] = useState<SupplierInvoice | null>(null);
  const [matchResultState, setMatchResultState] = useState<ThreeWayMatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState<boolean>(false);
  const [showPaymentRunModal, setShowPaymentRunModal] = useState<boolean>(false);
  const [selectedInvoiceIdsForPay, setSelectedInvoiceIdsForPay] = useState<string[]>([]);
  const [paymentRunMethod, setPaymentRunMethod] = useState<PaymentRunMethod>('ADYEN_GATEWAY');
  const [paymentRunLoading, setPaymentRunLoading] = useState<boolean>(false);

  // New Invoice Form
  const [newInvNumber, setNewInvNumber] = useState('INV-AJA-2026-0099');
  const [newInvSupplierId, setNewInvSupplierId] = useState('VEN-SA-1001');
  const [newInvSupplierName, setNewInvSupplierName] = useState('SASCO Petroleum Services');
  const [newInvPO, setNewInvPO] = useState('PO-AJA-2026-809');
  const [newInvGRN, setNewInvGRN] = useState('GRN-AJA-2026-091');
  const [newInvTotal, setNewInvTotal] = useState<number>(540960);
  const [newInvVAT, setNewInvVAT] = useState<number>(70560);
  const [newInvDueDate, setNewInvDueDate] = useState('2026-08-31');

  // New PR Form
  const [newPRDepartment, setNewPRDepartment] = useState('إدارة أسطول النقل البري');
  const [newPRCostCenter, setNewPRCostCenter] = useState('CC-1002-FLEET');
  const [newPRRequestedBy, setNewPRRequestedBy] = useState('مهندس / فهد العتيبي');
  const [newPRPriority, setNewPRPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newPRItemDesc, setNewPRItemDesc] = useState('توريد وقود ديزل يورو 5 وتأمين قطع الغيار');
  const [newPRCategory, setNewPRCategory] = useState<VendorCategoryType>('Fuel');
  const [newPRQty, setNewPRQty] = useState<number>(100000);
  const [newPRUnitPrice, setNewPRUnitPrice] = useState<number>(2.5);

  // New Sourcing Event Form
  const [newEventTitle, setNewEventTitle] = useState('منافسة توريد قطع غيار وإطارات الشاحنات 2026');
  const [newEventType, setNewEventType] = useState<SourcingEventType>('RFQ');
  const [newEventCategory, setNewEventCategory] = useState<VendorCategoryType>('Equipment');
  const [newEventDeadline, setNewEventDeadline] = useState('2026-08-30');
  const [newEventBudget, setNewEventBudget] = useState<number>(500000);

  // New Vendor Form
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorLegalName, setNewVendorLegalName] = useState('');
  const [newVendorType, setNewVendorType] = useState<VendorCategoryType>('Transportation');
  const [newVendorTaxId, setNewVendorTaxId] = useState('');
  const [newVendorCR, setNewVendorCR] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorCity, setNewVendorCity] = useState('الرياض');

  useEffect(() => {
    loadProcurementData();
  }, []);

  const loadProcurementData = async () => {
    setLoading(true);
    try {
      const [
        kpiData,
        vendorList,
        orgData,
        contractList,
        policyList,
        alertList,
        aiIntel,
        prList,
        evtList,
        quoteList,
        analytics,
        invList,
        prunList,
        recList,
        agingData,
        apIntelData,
        scCube,
        scCards,
        cComp,
        pCycle,
        execKpi,
        aiIntelData
      ] = await Promise.all([
        ProcurementClient.getKPIs(),
        ProcurementClient.getVendors(),
        ProcurementClient.getPurchasingOrgsAndGroups(),
        ProcurementClient.getSupplierContracts(),
        ProcurementClient.getProcurementPolicies(),
        ProcurementClient.getSupplierRiskAlerts(),
        ProcurementClient.getAIProcurementIntelligence(),
        ProcurementClient.getPurchaseRequisitions(),
        ProcurementClient.getSourcingEvents(),
        ProcurementClient.getSupplierQuotations(),
        ProcurementClient.getStrategicSourcingAnalytics(),
        ProcurementClient.getSupplierInvoices(),
        ProcurementClient.getPaymentRuns(),
        ProcurementClient.getReconciliations(),
        ProcurementClient.getAPAgingAnalytics(),
        ProcurementClient.getAIAPIntelligence(),
        ProcurementClient.getSpendCubeData(),
        ProcurementClient.getSupplierScorecards(),
        ProcurementClient.getContractComplianceMetrics(),
        ProcurementClient.getPurchaseCycleAnalytics(),
        ProcurementClient.getExecutiveProcurementKPIs(),
        ProcurementClient.getAIProcurementIntelligenceData()
      ]);

      setKPIs(kpiData);
      setVendors(vendorList);
      setOrgs(orgData.orgs);
      setGroups(orgData.groups);
      setContracts(contractList);
      setPolicies(policyList);
      setRiskAlerts(alertList);
      setAiIntelligence(aiIntel);
      setRequisitions(prList);
      setSourcingEvents(evtList);
      setQuotations(quoteList);
      setSourcingAnalytics(analytics);
      setInvoices(invList);
      setPaymentRuns(prunList);
      setReconciliations(recList);
      setApAging(agingData);
      setApAiIntel(apIntelData);
      setSpendCubeData(scCube);
      setScorecardsData(scCards);
      setContractComplianceData(cComp);
      setPurchaseCycleData(pCycle);
      setExecutiveKpiData(execKpi);
      setAiIntelCenterData(aiIntelData);
    } catch (err) {
      console.error('[ProcurementMainView] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalEst = newPRQty * newPRUnitPrice;
    const newPR: PurchaseRequisition = {
      id: `PR-${Date.now()}`,
      requisitionNumber: `PR-AJA-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      department: newPRDepartment,
      businessUnit: 'AJA Logistics Division',
      costCenter: newPRCostCenter,
      requestedBy: newPRRequestedBy,
      requestedByEmail: 'buyer@aja.com.sa',
      requiredDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: newPRPriority,
      budgetReference: `BUD-2026-${newPRCostCenter}`,
      lineItems: [
        {
          id: `PR-LINE-${Date.now()}`,
          itemDescription: newPRItemDesc,
          category: newPRCategory,
          quantity: newPRQty,
          unitOfMeasure: 'PCS / Litre',
          estimatedUnitPriceSAR: newPRUnitPrice,
          totalPriceSAR: totalEst
        }
      ],
      totalEstimatedAmountSAR: totalEst,
      budgetAvailabilityStatus: 'AVAILABLE',
      status: 'SUBMITTED',
      approvalHistory: [
        { stage: 'Department Request', actionBy: newPRRequestedBy, actionDate: new Date().toISOString().split('T')[0], status: 'APPROVED', comments: 'تم تقديم طلب الشراء والتحقق من الميزانية' }
      ],
      attachmentsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ProcurementClient.savePurchaseRequisition(newPR);
    setShowAddPRModal(false);
    loadProcurementData();
  };

  const handleCreateSourcingEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: SourcingEvent = {
      id: `SOURCING-EVT-${Date.now()}`,
      eventNumber: `${newEventType}-AJA-2026-${Math.floor(Math.random() * 900 + 100)}`,
      eventType: newEventType,
      title: newEventTitle,
      category: newEventCategory,
      costCenter: 'CC-1002-FLEET',
      budgetReference: 'BUD-2026-FLEET-Q3',
      responseDeadline: newEventDeadline,
      targetDeliveryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'PUBLISHED',
      invitedVendorIds: ['VEN-SA-1001', 'VEN-SA-1002'],
      invitedVendorNames: ['SASCO Petroleum Services', 'Almajdouie Logistics 3PL'],
      technicalWeightPercent: 40,
      commercialWeightPercent: 50,
      complianceWeightPercent: 10,
      requirementsLines: [
        { id: `RL-${Date.now()}`, description: newEventTitle, category: newEventCategory, quantity: 1, unit: 'Lot', targetPriceSAR: newEventBudget }
      ],
      estimatedValueSAR: newEventBudget,
      createdBy: 'إبراهيم السحيمي',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ProcurementClient.saveSourcingEvent(newEvt);
    setShowAddEventModal(false);
    loadProcurementData();
  };

  const handleRunAIBidEvaluation = async () => {
    setBidEvalLoading(true);
    try {
      const result = await ProcurementClient.evaluateBids({
        sourcingEventTitle: 'طلب عروض أسعار لتوريد الوقود والخدمات اللوجستية للأسطول',
        category: 'Fuel',
        budgetSAR: 600000,
        quotationsList: quotations
      });
      setBidEvalResult(result);
    } catch (err) {
      console.error('[AI Bid Eval Error]', err);
    } finally {
      setBidEvalLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const net = newInvTotal - newInvVAT;
    const newInv: SupplierInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: newInvNumber,
      supplierId: newInvSupplierId,
      supplierName: newInvSupplierName,
      purchaseOrderId: newInvPO,
      poNumber: newInvPO,
      grnReference: newInvGRN,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: newInvDueDate,
      postingDate: new Date().toISOString().split('T')[0],
      currency: 'SAR',
      vatRegistrationNumber: '300192837400003',
      netAmountSAR: net,
      vatAmountSAR: newInvVAT,
      withholdingTaxAmountSAR: 0,
      totalAmountSAR: newInvTotal,
      paidAmountSAR: 0,
      remainingBalanceSAR: newInvTotal,
      status: 'UNDER_MATCHING',
      captureChannel: 'MANUAL',
      matchingStatus: 'PENDING',
      lineItems: [
        {
          id: `INV-LINE-${Date.now()}`,
          itemDescription: 'توريد خدمات وبضائع لوجستية بموجب أمر الشراء',
          quantity: 1,
          unitPriceSAR: net,
          taxAmountSAR: newInvVAT,
          totalAmountSAR: newInvTotal
        }
      ],
      paymentTerms: 'NET_30',
      attachmentsCount: 1,
      zatcaComplianceStatus: 'PASSED',
      approvalFlow: [
        { stage: 'Manual Capture & Validation', actionBy: 'مسؤول المشتريات والمالية', actionDate: '2026-08-04', status: 'APPROVED' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ProcurementClient.saveSupplierInvoice(newInv);
    setShowAddInvoiceModal(false);
    loadProcurementData();
  };

  const handleRunOCRExtraction = async () => {
    setOcrLoading(true);
    try {
      const ext = await ProcurementClient.extractInvoice(ocrRawText);
      setNewInvNumber(ext.invoiceNumber || `INV-OCR-${Date.now()}`);
      setNewInvSupplierName(ext.supplierName || 'SASCO Petroleum Services');
      setNewInvPO(ext.poNumber || 'PO-AJA-2026-809');
      setNewInvGRN(ext.grnReference || 'GRN-AJA-2026-091');
      setNewInvTotal(ext.totalAmountSAR || 540960);
      setNewInvVAT(ext.vatAmountSAR || 70560);
      if (ext.dueDate) setNewInvDueDate(ext.dueDate);
      setShowOCRCaptureModal(false);
      setShowAddInvoiceModal(true);
    } catch (err) {
      console.error('[OCR Extraction Error]', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleRun3WayMatch = async (invoice: SupplierInvoice) => {
    setSelectedInvoiceForMatching(invoice);
    setMatchLoading(true);
    setShow3WayMatchModal(true);
    try {
      const matchResult = await ProcurementClient.runThreeWayMatch({
        invoiceTotalSAR: invoice.totalAmountSAR,
        poTotalSAR: invoice.threeWayMatch?.poTotalSAR || invoice.totalAmountSAR,
        grnTotalSAR: invoice.threeWayMatch?.grnTotalSAR || invoice.totalAmountSAR,
        toleranceAllowedPercent: 2.0
      });
      setMatchResultState(matchResult);
      // Update invoice matching status in state & backend
      const updatedInvoice: SupplierInvoice = {
        ...invoice,
        matchingStatus: matchResult.matchingStatus,
        status: matchResult.matchPassed ? 'APPROVED_FOR_PAYMENT' : 'DISCREPANCY_HOLD',
        threeWayMatch: matchResult
      };
      await ProcurementClient.saveSupplierInvoice(updatedInvoice);
      loadProcurementData();
    } catch (err) {
      console.error('[3-Way Match Error]', err);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleExecutePaymentRun = async () => {
    if (selectedInvoiceIdsForPay.length === 0) return;
    setPaymentRunLoading(true);
    try {
      const selectedInvs = invoices.filter(i => selectedInvoiceIdsForPay.includes(i.id));
      const totalAmount = selectedInvs.reduce((acc, i) => acc + i.remainingBalanceSAR, 0);

      await ProcurementClient.savePaymentRun({
        paymentRunDate: new Date().toISOString().split('T')[0],
        scheduledExecutionDate: new Date().toISOString().split('T')[0],
        totalPaymentAmountSAR: totalAmount,
        totalInvoicesCount: selectedInvoiceIdsForPay.length,
        paymentMethod: paymentRunMethod,
        status: paymentRunMethod === 'ADYEN_GATEWAY' ? 'COMPLETED' : 'APPROVED_SCHEDULED',
        selectedInvoiceIds: selectedInvoiceIdsForPay,
        discountSavingsAchievedSAR: totalAmount * 0.01,
        initiatedBy: 'مدير المشتريات والمالية (أجا ERP)',
        bankAccountReference: 'SA-ALRAJHI-99201928374'
      });
      setShowPaymentRunModal(false);
      setSelectedInvoiceIdsForPay([]);
      loadProcurementData();
    } catch (err) {
      console.error('[Execute Payment Run Error]', err);
    } finally {
      setPaymentRunLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const newVendor: VendorMaster = {
      id: `VEN-SA-${Date.now()}`,
      vendorCode: `VEN-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: newVendorName,
      legalName: newVendorLegalName || newVendorName,
      taxId: newVendorTaxId || '300099881100003',
      commercialRegisterNo: newVendorCR || '1010889900',
      vendorType: newVendorType,
      status: 'ONBOARDING',
      companyDetails: {
        website: 'https://supplier.sa',
        phone: newVendorPhone || '+966 11 000 0000',
        email: newVendorEmail || 'info@supplier.sa',
        country: 'المملكة العربية السعودية',
        city: newVendorCity,
        address: 'شارع الملك فهد',
        postalCode: '11564'
      },
      financial: {
        bankName: 'البنك الأهلي السعودي (SNB)',
        iban: 'SA0010000000000000000000',
        swift: 'NCBKSARIXXX',
        paymentTerms: 'NET_30',
        currency: 'SAR',
        creditLimitSAR: 1000000
      },
      categories: [newVendorType],
      regionsServed: ['المملكة العربية السعودية'],
      qualifications: {
        complianceValidated: true,
        backgroundCheckPassed: true,
        isoCertified: true,
        zatcaTaxVerified: true,
        commercialRegisterVerified: true,
        documentsCollectedCount: 4,
        verificationDate: new Date().toISOString().split('T')[0]
      },
      scorecard: {
        qualityScore: 90,
        deliveryPerformance: 95,
        priceCompetitiveness: 90,
        leadTimeDays: 2,
        responseTimeHours: 4,
        complianceScore: 92,
        overallRating: 4.5
      },
      riskProfile: {
        financialRisk: 'LOW',
        operationalRisk: 'LOW',
        complianceRisk: 'LOW',
        cyberRisk: 'LOW',
        esgScore: 85,
        countryRisk: 'LOW',
        supplyChainRisk: 'LOW',
        overallRiskScore: 15,
        riskLevel: 'LOW'
      },
      contractCount: 1,
      totalSpendYTD: 0,
      activeOrdersCount: 0,
      primaryContactName: 'ممثل المورد',
      primaryContactEmail: newVendorEmail || 'contact@supplier.sa',
      primaryContactPhone: newVendorPhone || '+966 50 000 0000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ProcurementClient.saveVendor(newVendor);
    setShowAddVendorModal(false);
    resetNewVendorForm();
    loadProcurementData();
  };

  const resetNewVendorForm = () => {
    setNewVendorName('');
    setNewVendorLegalName('');
    setNewVendorType('Transportation');
    setNewVendorTaxId('');
    setNewVendorCR('');
    setNewVendorPhone('');
    setNewVendorEmail('');
    setNewVendorCity('الرياض');
  };

  const handleRunAIEvaluation = async () => {
    setAiEvalLoading(true);
    try {
      const result = await ProcurementClient.evaluateSupplier({
        vendorName: selectedVendor?.name || 'عقد تزويد أسطول النقل والوقود السنوي',
        category: selectedVendor?.vendorType || 'Transportation',
        expectedSpendSAR: selectedVendor?.totalSpendYTD || 5000000,
        requirements: 'الالتزام بمعايير ZATCA والربط مع شبكة أجا اللوجستية وتفعيل معايير السلامة'
      });
      setAiEvalResult(result);
    } catch (err) {
      console.error('[AI Eval Error]', err);
    } finally {
      setAiEvalLoading(false);
    }
  };

  // Filtered Vendor List
  const filteredVendors = vendors.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.legalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || v.vendorType === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'STRATEGIC':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'PREFERRED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'APPROVED':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'CONDITIONAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ONBOARDING':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'SUSPENDED':
      case 'BLOCKED':
      case 'BLACKLISTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isAr ? 'منصة المشتريات وإدارة الموردين Enterprise P2P & SRM' : 'Enterprise Procurement & SRM'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                PACK 007
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'تدبير المشتريات، سجل الموردين الرئيسي (Vendor Master)، الحوكمة والعقود الإطارية الذكية'
                : 'Procurement Organization, Vendor Master, SRM Governance & AI Spend Intelligence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOCRCaptureModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'قراءة فاتورة بالذكاء الاصطناعي (OCR)' : 'OCR Invoice Capture'}</span>
          </button>
          <button
            onClick={() => setShowAddPRModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'طلب شراء (PR)' : 'New Requisition'}</span>
          </button>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>{isAr ? 'طرح منافسة (RFQ/RFP)' : 'Launch RFQ/RFP'}</span>
          </button>
          <button
            onClick={() => setShowAddVendorModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مورد' : 'New Vendor'}</span>
          </button>
          <button
            onClick={loadProcurementData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isAr ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'dashboard', label: isAr ? 'لوحة المشتريات القيادية' : 'Procurement KPI', icon: BarChart3 },
          { id: 'executive-cockpit', label: isAr ? 'غرفة القيادة التنفيذية (CFO/CPO)' : 'Executive Cockpit', icon: Layers },
          { id: 'spend-intelligence', label: isAr ? 'تحليلات الإنفاق الذكية (Spend Intel)' : 'Spend Intelligence', icon: DollarSign },
          { id: 'spend-cube', label: isAr ? 'مكعب الإنفاق المتعدد (Spend Cube)' : 'Spend Cube Explorer', icon: Sliders },
          { id: 'supplier-performance-center', label: isAr ? 'مركز أداء الموردين SRM 360' : 'Supplier SRM 360', icon: Award },
          { id: 'supplier-scorecards', label: isAr ? 'بطاقات التقييم والترتيب' : 'Scorecards & Ranking', icon: BadgeCheck },
          { id: 'contract-compliance-dashboard', label: isAr ? 'امتثال العقود والتسرب' : 'Contract Compliance', icon: ShieldCheck },
          { id: 'purchase-cycle-analytics', label: isAr ? 'زمن دورة الشراء ورشاقة PR/PO' : 'Purchase Cycle & Agility', icon: Clock },
          { id: 'ai-procurement-center', label: isAr ? 'ذكاء المشتريات التنبؤي (AI P2P)' : 'AI P2P Intelligence', icon: Sparkles },
          { id: 'supplier-invoices', label: isAr ? 'فواتير الموردين والمسح الذكي (Invoices & OCR)' : 'Supplier Invoices & OCR', icon: FileCheck },
          { id: 'three-way-matching', label: isAr ? 'المطابقة الثلاثية (3-Way Match)' : '3-Way Matching Engine', icon: CheckCircle },
          { id: 'payment-runs', label: isAr ? 'سجل المدفوعات والـ Adyen' : 'AP Payment Automation', icon: DollarSign },
          { id: 'supplier-reconciliation', label: isAr ? 'مطابقة كشوف حساب الموردين' : 'Supplier Reconciliation', icon: FileSpreadsheet },
          { id: 'ap-aging-analytics', label: isAr ? 'تحليلات اعمار الذمم والسيولة (AP Aging)' : 'AP Aging & Cash Forecast', icon: TrendingUp },
          { id: 'sourcing-requisitions', label: isAr ? 'طلبات الشراء والاعتمادات (PR)' : 'Purchase Requisitions', icon: FileText },
          { id: 'sourcing-events', label: isAr ? 'منافسات التوريد (RFI/RFQ/RFP)' : 'Sourcing Events', icon: Zap },
          { id: 'quotations-bids', label: isAr ? 'عروض الأسعار والترسية (Bids & AI)' : 'Bids & AI Evaluation', icon: Award },
          { id: 'vendor-master', label: isAr ? 'سجل الموردين (Vendor Master)' : 'Vendor Master', icon: Building2 },
          { id: 'srm-performance', label: isAr ? 'تقييم وأداء الموردين' : 'SRM Scorecard', icon: Award },
          { id: 'risk-center', label: isAr ? 'مركز المخاطر' : 'Risk Center', icon: ShieldAlert },
          { id: 'purchasing-org', label: isAr ? 'منظمات الشراء والسياسات' : 'Purchasing Orgs & Policies', icon: Layers },
          { id: 'contracts', label: isAr ? 'العقود الإطارية' : 'Contracts', icon: FileCheck },
          { id: 'ai-intelligence', label: isAr ? 'ذكاء المشتريات (AI SRM)' : 'AI Intelligence', icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUMMARY KPI CARDS */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'إجمالي الموردين المعتمدين' : 'Total Approved Vendors'}</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {kpis.approvedVendors} <span className="text-xs font-normal text-slate-400">/ {kpis.totalVendors}</span>
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{kpis.preferredStrategicVendors} {isAr ? 'مورد استراتيجي ومفضل' : 'Strategic/Preferred'}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'إجمالي الإنفاق السنوي (YTD)' : 'Total YTD Vendor Spend'}</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">
                {(kpis.totalYTDSpendSAR / 1000000).toFixed(1)}M <span className="text-xs font-normal text-slate-400">SAR</span>
              </h3>
              <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{isAr ? 'إنفاق موثق بالنظام المالي' : 'Verified in Freight Finance'}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'قيمة العقود الإطارية النشطة' : 'Active Contracts Value'}</p>
              <h3 className="text-2xl font-bold text-sky-400 mt-1">
                {(kpis.activeContractsValueSAR / 1000000).toFixed(1)}M <span className="text-xs font-normal text-slate-400">SAR</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{contracts.length} {isAr ? 'عقود إطارية سارية' : 'Active Framework Agreements'}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{isAr ? 'تنبيهات مخاطر الموردين' : 'Supplier Risk Alerts'}</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">
                {kpis.openRiskAlertsCount} <span className="text-xs font-normal text-slate-400">{isAr ? 'مفتوح' : 'Open'}</span>
              </h3>
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{isAr ? 'متوسط أداء الموردين: ' : 'Avg Score: '}{kpis.avgSupplierPerformanceScore} / 5.0</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SPEND BY CATEGORY BREAKDOWN */}
            <div className="lg:col-span-2 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? 'توزيع الإنفاق حسب فئات المشتريات' : 'Category Spend Distribution'}</span>
                </h2>
                <span className="text-xs font-mono text-slate-400">YTD 2026</span>
              </div>

              {aiIntelligence?.categorySpendDistribution ? (
                <div className="space-y-3 pt-2">
                  {aiIntelligence.categorySpendDistribution.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1.5 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{item.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{item.vendorCount} {isAr ? 'مورد' : 'vendors'}</span>
                          <span className="font-mono font-bold text-amber-400">
                            {(item.spendSAR / 1000000).toFixed(2)}M SAR ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">Loading Spend Distribution...</div>
              )}
            </div>

            {/* STRATEGIC VENDORS DIRECTORY PREVIEW */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>{isAr ? 'أبرز الموردين الاستراتيجيين' : 'Strategic Vendors'}</span>
              </h2>

              <div className="space-y-3">
                {vendors
                  .filter(v => v.status === 'STRATEGIC' || v.status === 'PREFERRED')
                  .slice(0, 4)
                  .map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVendor(v)}
                      className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">{v.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono">{v.vendorCode}</span>
                          <span>•</span>
                          <span>{v.vendorType}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(v.status)}`}>
                          {v.status}
                        </span>
                        <p className="text-[10px] text-amber-300 font-bold mt-1">
                          ⭐ {v.scorecard.overallRating} / 5.0
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* ACTIVE RISK ALERTS AND CONTRACT RENEWALS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>{isAr ? 'تنبيهات المخاطر النشطة' : 'Active Supplier Risk Alerts'}</span>
              </h2>

              <div className="space-y-3">
                {riskAlerts.map(alert => (
                  <div key={alert.id} className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300">{alert.vendorName}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getRiskBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{alert.title}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{alert.description}</p>
                    <div className="pt-1 text-[10px] text-amber-300 font-mono">
                      {isAr ? 'خطة المعالجة: ' : 'Mitigation: '}{alert.mitigationPlan}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>{isAr ? 'العقود الإطارية والاتفاقيات الرئيسية' : 'Key Framework Contracts'}</span>
              </h2>

              <div className="space-y-3">
                {contracts.map(contract => (
                  <div key={contract.id} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300">{contract.contractNumber}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {(contract.valueSAR / 1000000).toFixed(1)}M SAR
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white">{contract.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{contract.vendorName}</span>
                      <span className="font-mono text-slate-300">
                        {contract.startDate} → {contract.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PACK 007.005: EXECUTIVE COCKPIT */}
      {activeTab === 'executive-cockpit' && (
        <ExecutiveProcurementCockpit
          kpis={executiveKpiData}
          spendCube={spendCubeData}
          aiIntel={aiIntelCenterData}
        />
      )}

      {/* PACK 007.005: SPEND INTELLIGENCE DASHBOARD */}
      {activeTab === 'spend-intelligence' && (
        <SpendIntelligenceDashboard spendData={spendCubeData} />
      )}

      {/* PACK 007.005: SPEND CUBE EXPLORER */}
      {activeTab === 'spend-cube' && (
        <SpendCubeExplorer spendCubeData={spendCubeData} />
      )}

      {/* PACK 007.005: SUPPLIER PERFORMANCE CENTER */}
      {activeTab === 'supplier-performance-center' && (
        <SupplierPerformanceCenter
          scorecards={scorecardsData}
          vendors={vendors}
        />
      )}

      {/* PACK 007.005: SUPPLIER SCORECARDS & BENCHMARKING */}
      {activeTab === 'supplier-scorecards' && (
        <SupplierScorecardsView scorecards={scorecardsData} />
      )}

      {/* PACK 007.005: CONTRACT COMPLIANCE DASHBOARD */}
      {activeTab === 'contract-compliance-dashboard' && (
        <ContractComplianceDashboard data={contractComplianceData} />
      )}

      {/* PACK 007.005: PURCHASE CYCLE ANALYTICS */}
      {activeTab === 'purchase-cycle-analytics' && (
        <PurchaseCycleAnalyticsView analytics={purchaseCycleData} />
      )}

      {/* PACK 007.005: AI PROCUREMENT INTELLIGENCE CENTER */}
      {activeTab === 'ai-procurement-center' && (
        <AIProcurementIntelligenceCenter aiData={aiIntelCenterData} />
      )}

      {/* TAB: SUPPLIER INVOICES & OCR CAPTURE */}
      {activeTab === 'supplier-invoices' && (
        <SupplierInvoicesView
          invoices={invoices}
          isAr={isAr}
          onOpenOCR={() => setShowOCRCaptureModal(true)}
          onOpenAddInvoice={() => setShowAddInvoiceModal(true)}
          onRun3WayMatch={handleRun3WayMatch}
        />
      )}

      {/* TAB: THREE-WAY MATCHING ENGINE */}
      {activeTab === 'three-way-matching' && (
        <ThreeWayMatchingView
          invoices={invoices}
          isAr={isAr}
          onRunMatch={handleRun3WayMatch}
        />
      )}

      {/* TAB: PAYMENT AUTOMATION & ADYEN */}
      {activeTab === 'payment-runs' && (
        <PaymentAutomationView
          invoices={invoices}
          paymentRuns={paymentRuns}
          isAr={isAr}
          onExecutePaymentRun={(ids, method) => {
            setSelectedInvoiceIdsForPay(ids);
            setPaymentRunMethod(method);
            handleExecutePaymentRun();
          }}
        />
      )}

      {/* TAB: SUPPLIER RECONCILIATION */}
      {activeTab === 'supplier-reconciliation' && (
        <SupplierReconciliationView
          reconciliations={reconciliations}
          isAr={isAr}
        />
      )}

      {/* TAB: AP AGING ANALYTICS & CASH FORECAST */}
      {activeTab === 'ap-aging-analytics' && (
        <APAgingAnalyticsView
          apAging={apAging}
          apAiIntel={apAiIntel}
          isAr={isAr}
        />
      )}

      {/* TAB: PURCHASE REQUISITIONS (PR) */}
      {activeTab === 'sourcing-requisitions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>{isAr ? 'طلبات الشراء والاعتماد الداخلي (Purchase Requisitions)' : 'Purchase Requisitions & Approvals'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isAr ? 'إدارة طلبات الشراء الواردة من الأقسام، التحقق من الميزانيات، وتدفق الاعتمادات الإدارية' : 'Manage department requisitions, budget checks, and hierarchical delegation approvals'}
              </p>
            </div>
            <button
              onClick={() => setShowAddPRModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'تقديم طلب شراء جديد' : 'Create Requisition'}</span>
            </button>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-4">{isAr ? 'رقم الطلب / القسم' : 'PR Number / Dept'}</th>
                    <th className="p-4">{isAr ? 'مقدم الطلب / مركز التكلفة' : 'Requested By / Cost Center'}</th>
                    <th className="p-4">{isAr ? 'الوصف الرئيسي' : 'Item Description'}</th>
                    <th className="p-4">{isAr ? 'القيمة التقديرية' : 'Estimated Value SAR'}</th>
                    <th className="p-4">{isAr ? 'الأولوية' : 'Priority'}</th>
                    <th className="p-4">{isAr ? 'حالة الميزانية' : 'Budget Status'}</th>
                    <th className="p-4">{isAr ? 'حالة الاعتماد' : 'Approval Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {requisitions.map(pr => (
                    <tr key={pr.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <p className="font-mono font-bold text-sky-300 text-xs">{pr.requisitionNumber}</p>
                        <p className="text-[11px] text-slate-400">{pr.department}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white text-xs">{pr.requestedBy}</p>
                        <p className="text-[10px] text-amber-400 font-mono">{pr.costCenter}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-200 line-clamp-1">{pr.lineItems[0]?.itemDescription}</p>
                        <p className="text-[10px] text-slate-400">{pr.lineItems.length} {isAr ? 'بند مطلوب' : 'items'}</p>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                        {pr.totalEstimatedAmountSAR.toLocaleString()} SAR
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pr.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          pr.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {pr.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                          {pr.budgetAvailabilityStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          pr.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          pr.status === 'SUBMITTED' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SOURCING EVENTS (RFQ / RFP / RFI) */}
      {activeTab === 'sourcing-events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>{isAr ? 'منافسات التوريد والاستدراج (Strategic Sourcing RFQ/RFP)' : 'Strategic Sourcing Events'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isAr ? 'طرح طلبات عروض الأسعار والحلول الفنية، دعوة الموردين، وإدارة المواعيد النهائية' : 'Issue RFQs, RFPs, invite qualified vendors, and set technical & commercial weights'}
              </p>
            </div>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'طرح منافسة جديدة' : 'Launch RFQ/RFP'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sourcingEvents.map(evt => (
              <div key={evt.id} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">{evt.eventNumber} • {evt.eventType}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{evt.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-[10px] font-bold">
                    {evt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'الميزانية التقديرية' : 'Est. Budget'}</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {evt.estimatedValueSAR.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'الموعد النهائي للعروض' : 'Response Deadline'}</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">{evt.responseDeadline}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] font-bold">{isAr ? 'وزن المعايير (أوزان التقييم):' : 'Evaluation Weighting:'}</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-1 bg-slate-800 text-sky-300 rounded font-mono">فني Technical: {evt.technicalWeightPercent}%</span>
                    <span className="px-2 py-1 bg-slate-800 text-emerald-300 rounded font-mono">تجاري Commercial: {evt.commercialWeightPercent}%</span>
                    <span className="px-2 py-1 bg-slate-800 text-purple-300 rounded font-mono">امتثال Compliance: {evt.complianceWeightPercent}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'الموردين المدعوين:' : 'Invited:'} <strong className="text-white">{evt.invitedVendorNames.length}</strong></span>
                  <button
                    onClick={() => setActiveTab('quotations-bids')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'استعراض العروض المقدمة' : 'View Bids'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUOTATIONS & AI BID EVALUATION */}
      {activeTab === 'quotations-bids' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 rounded-2xl border border-amber-500/30 gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'تقييم عروض الأسعار والترسية الذكية (Supplier Quotations & AI Bid Evaluation)' : 'Supplier Bids & AI Evaluation'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isAr ? 'مقارنة العروض الفنية والمالية، وتحليل التوصيات المؤتمتة عبر نموذج Gemini 3.6 Flash' : 'Side-by-side bid comparison with AI automated award recommendation engine'}
              </p>
            </div>

            <button
              onClick={handleRunAIBidEvaluation}
              disabled={bidEvalLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{bidEvalLoading ? (isAr ? 'جاري تقييم العروض بـ AI...' : 'Evaluating Bids...') : (isAr ? 'تشغيل تقييم الذكاء الاصطناعي للعروض' : 'Run Gemini AI Bid Evaluation')}</span>
            </button>
          </div>

          {bidEvalResult && (
            <div className="bg-slate-900 border border-amber-500/40 p-6 rounded-2xl space-y-4 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">{isAr ? 'نتائج تقييم الذكاء الاصطناعي والتوصية بالترسية:' : 'AI Evaluation & Award Recommendation:'}</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/40">
                  {isAr ? 'المورد الفائز الموصى به: ' : 'Recommended Winner: '}{bidEvalResult.recommendedVendorName}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                {bidEvalResult.executiveSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                  <h4 className="font-bold text-amber-300">{isAr ? 'نقاط القوة والمزايا الفنية:' : 'Key Technical Strengths:'}</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                    {bidEvalResult.keyStrengths?.map((str: string, i: number) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                  <h4 className="font-bold text-sky-300">{isAr ? 'توفيرات الميزانية والتوفير المالي:' : 'Estimated Savings:'}</h4>
                  <p className="text-lg font-bold font-mono text-emerald-400">
                    +{bidEvalResult.estimatedSavingsSAR?.toLocaleString()} SAR ({bidEvalResult.savingsPercentage}%)
                  </p>
                  <p className="text-[11px] text-slate-400">{bidEvalResult.savingsJustification}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotations.map(quote => (
              <div key={quote.id} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{quote.quotationNumber}</span>
                    <h3 className="text-sm font-bold text-white">{quote.vendorName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    quote.status === 'UNDER_EVALUATION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    quote.status === 'RECOMMENDED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {quote.status}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isAr ? 'السعر الإجمالي المقدم:' : 'Total Price:'}</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      {quote.totalQuotationSAR.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{isAr ? 'شروط الدفع:' : 'Payment Terms:'}</span>
                    <span className="font-mono text-sky-300">{quote.paymentTerms}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{isAr ? 'مدة التوريد:' : 'Delivery Time:'}</span>
                    <span className="font-mono text-amber-300">{quote.leadTimeDays} {isAr ? 'أيام' : 'Days'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'فني' : 'Technical'}</span>
                    <span className="font-bold text-sky-400">{quote.technicalScore} / 100</span>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'تجاري' : 'Commercial'}</span>
                    <span className="font-bold text-emerald-400">{quote.commercialScore} / 100</span>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'امتثال' : 'Compliance'}</span>
                    <span className="font-bold text-purple-400">{quote.complianceScore} / 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR MASTER DIRECTORY */}
      {activeTab === 'vendor-master' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                placeholder={isAr ? 'البحث باسم المورد، الكود، أو السجل التجاري...' : 'Search vendor name, code, CR...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">{isAr ? 'جميع الفئات (All Categories)' : 'All Categories'}</option>
                <option value="Transportation">Transportation</option>
                <option value="Warehousing">Warehousing</option>
                <option value="Fuel">Fuel</option>
                <option value="Customs">Customs</option>
                <option value="Packaging">Packaging</option>
                <option value="Insurance">Insurance</option>
                <option value="Equipment">Equipment</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">{isAr ? 'جميع الحالات (All Statuses)' : 'All Statuses'}</option>
                <option value="STRATEGIC">Strategic</option>
                <option value="PREFERRED">Preferred</option>
                <option value="APPROVED">Approved</option>
                <option value="CONDITIONAL">Conditional</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* VENDOR TABLE */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-4">{isAr ? 'المورد / الكود' : 'Vendor / Code'}</th>
                    <th className="p-4">{isAr ? 'الفئة الرئيسية' : 'Category'}</th>
                    <th className="p-4">{isAr ? 'الرقم الضريبي / السجل' : 'Tax / CR No.'}</th>
                    <th className="p-4">{isAr ? 'شروط الدفع' : 'Payment Terms'}</th>
                    <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="p-4">{isAr ? 'التقييم' : 'Scorecard'}</th>
                    <th className="p-4">{isAr ? 'المخاطر' : 'Risk'}</th>
                    <th className="p-4">{isAr ? 'الإنفاق YTD' : 'YTD Spend'}</th>
                    <th className="p-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        {isAr ? 'لا يوجد موردين مطابقين لمعايير البحث' : 'No vendors matching filter criteria'}
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map(vendor => (
                      <tr key={vendor.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white text-xs">{vendor.name}</p>
                            <p className="text-[10px] text-amber-400 font-mono">{vendor.vendorCode}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium">
                            {vendor.vendorType}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-300">
                          <div>VAT: {vendor.taxId}</div>
                          <div className="text-slate-400">CR: {vendor.commercialRegisterNo}</div>
                        </td>
                        <td className="p-4 font-mono text-xs text-sky-300">{vendor.financial.paymentTerms}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-amber-300">⭐ {vendor.scorecard.overallRating}</span>
                            <p className="text-[10px] text-slate-400">SLA: {vendor.scorecard.deliveryPerformance}%</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(vendor.riskProfile.riskLevel)}`}>
                            {vendor.riskProfile.riskLevel}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          {(vendor.totalSpendYTD / 1000000).toFixed(2)}M SAR
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedVendor(vendor)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            {isAr ? 'التفاصيل' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SRM PERFORMANCE & SCORECARDS */}
      {activeTab === 'srm-performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map(vendor => (
              <div key={vendor.id} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400">{vendor.vendorCode}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{vendor.name}</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusBadge(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">{isAr ? 'جودة الخدمات' : 'Quality Score'}</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">{vendor.scorecard.qualityScore}%</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">{isAr ? 'الالتزام بالتسليم SLA' : 'Delivery SLA'}</p>
                    <p className="text-lg font-bold text-sky-400 mt-0.5">{vendor.scorecard.deliveryPerformance}%</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">{isAr ? 'التنافسية السعرية' : 'Price Comp.'}</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">{vendor.scorecard.priceCompetitiveness}%</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <p className="text-[10px] text-slate-400">{isAr ? 'الامتثال والحوكمة' : 'Compliance'}</p>
                    <p className="text-lg font-bold text-purple-400 mt-0.5">{vendor.scorecard.complianceScore}%</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'مسؤول الاتصال الرئيسي:' : 'Contact:'}</span>
                  <span className="font-bold text-slate-200">{vendor.primaryContactName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RISK CENTER */}
      {activeTab === 'risk-center' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>{isAr ? 'مصفوفة تقييم مخاطر سلاسل الإمداد والموردين' : 'Supplier Supply Chain Risk Matrix'}</span>
              </h2>

              <div className="space-y-3">
                {vendors.map(vendor => (
                  <div key={vendor.id} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{vendor.name}</h3>
                        <p className="text-[11px] text-slate-400">{vendor.vendorType} • {vendor.companyDetails.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{isAr ? 'مؤشر المخاطر:' : 'Risk Score:'}</span>
                        <span className="text-sm font-bold font-mono text-amber-400">
                          {vendor.riskProfile.overallRiskScore} / 100
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded border ${getRiskBadge(vendor.riskProfile.riskLevel)}`}>
                          {vendor.riskProfile.riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="bg-slate-800/40 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'مالي' : 'Financial'}</span>
                        <span className="font-bold text-slate-200">{vendor.riskProfile.financialRisk}</span>
                      </div>
                      <div className="bg-slate-800/40 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'تشغيلي' : 'Operational'}</span>
                        <span className="font-bold text-slate-200">{vendor.riskProfile.operationalRisk}</span>
                      </div>
                      <div className="bg-slate-800/40 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'امتثال' : 'Compliance'}</span>
                        <span className="font-bold text-slate-200">{vendor.riskProfile.complianceRisk}</span>
                      </div>
                      <div className="bg-slate-800/40 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'ESG البيئي' : 'ESG Score'}</span>
                        <span className="font-bold text-emerald-400">{vendor.riskProfile.esgScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'سجل الإجراءات والتنبيهات' : 'Alert Log & Actions'}</span>
              </h2>

              <div className="space-y-3">
                {riskAlerts.map(alert => (
                  <div key={alert.id} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-amber-400">{alert.detectedAt.slice(0, 10)}</span>
                    <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{alert.description}</p>
                    <div className="p-2 bg-slate-800 rounded-lg text-[10px] text-emerald-300 font-mono mt-2">
                      ✔ {alert.mitigationPlan}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PURCHASING ORGS & POLICIES */}
      {activeTab === 'purchasing-org' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PURCHASING ORGS & GROUPS */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'منظمات ومجموعات الشراء (Purchasing Orgs & Groups)' : 'Purchasing Organizations'}</span>
              </h2>

              <div className="space-y-4">
                {orgs.map(org => (
                  <div key={org.id} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-amber-400">{org.code}</span>
                        <h3 className="text-xs font-bold text-white">{org.name}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                        {org.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{org.description}</p>

                    <div className="border-t border-slate-700/60 pt-3 space-y-2">
                      <p className="text-[11px] font-bold text-slate-300">{isAr ? 'مجموعات الشراء التابعة:' : 'Purchasing Groups:'}</p>
                      {groups
                        .filter(g => g.purchasingOrgId === org.id)
                        .map(g => (
                          <div key={g.id} className="p-2.5 bg-slate-900/60 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-sky-300">{g.name}</span>
                              <p className="text-[10px] text-slate-400">
                                {isAr ? 'مسؤول المشتريات: ' : 'Lead Buyer: '}{g.leadBuyerName}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-800 text-amber-400 font-mono text-[10px] rounded">
                              {g.categorySpecialization}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROCUREMENT POLICIES & APPROVAL TIERS */}
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>{isAr ? 'سياسات المشتريات ومصفوفة الاعتمادات' : 'Procurement Policies & Delegation'}</span>
              </h2>

              <div className="space-y-3">
                {policies.map(pol => (
                  <div key={pol.id} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{pol.policyCode}</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
                        Tier: {pol.approvalTier}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{pol.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{pol.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-sky-300 pt-2 border-t border-slate-700/40">
                      <span>N نطاق المبلغ: {(pol.minAmountSAR / 1000).toFixed(0)}k - {(pol.maxAmountSAR / 1000000).toFixed(1)}M SAR</span>
                      <span>عروض المطلوبة: {pol.requiredQuotesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPLIER CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-4">{isAr ? 'رقم العقد / العنوان' : 'Contract No. / Title'}</th>
                    <th className="p-4">{isAr ? 'المورد' : 'Vendor'}</th>
                    <th className="p-4">{isAr ? 'نوع العقد' : 'Type'}</th>
                    <th className="p-4">{isAr ? 'القيمة الإجمالية' : 'Value SAR'}</th>
                    <th className="p-4">{isAr ? 'الفترة' : 'Validity Period'}</th>
                    <th className="p-4">{isAr ? 'التجديد' : 'Auto Renew'}</th>
                    <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {contracts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-xs">{c.title}</p>
                        <p className="text-[10px] text-amber-400 font-mono">{c.contractNumber}</p>
                      </td>
                      <td className="p-4 font-bold text-sky-300">{c.vendorName}</td>
                      <td className="p-4 font-mono text-xs text-slate-300">{c.contractType}</td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {(c.valueSAR / 1000000).toFixed(2)}M SAR
                      </td>
                      <td className="p-4 font-mono text-slate-300 text-[11px]">
                        {c.startDate} → {c.endDate}
                      </td>
                      <td className="p-4 text-xs font-bold text-amber-300">
                        {c.autoRenew ? 'تلقائي (Yes)' : 'يدوي (No)'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AI PROCUREMENT INTELLIGENCE */}
      {activeTab === 'ai-intelligence' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 rounded-2xl border border-amber-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {isAr ? 'محرك ذكاء المشتريات والتحليل التنبؤي Gemini AI Procurement' : 'Gemini AI Procurement Intelligence'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? 'توصيات الترسية الذكية، التنبؤ بفرص التوفير المالي، وتقييم مخاطر العقود تلقائياً'
                      : 'AI Supplier Recommendations, Contract Renewal Optimization & Spend Forecasting'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAIEvaluation}
                disabled={aiEvalLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{aiEvalLoading ? (isAr ? 'جاري التحليل...' : 'Analyzing...') : (isAr ? 'تشغيل تقييم الذكاء الاصطناعي' : 'Run AI Analysis')}</span>
              </button>
            </div>

            {aiEvalResult && (
              <div className="p-5 bg-slate-900/90 border border-amber-500/40 rounded-xl space-y-4 mt-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-amber-400">
                    {isAr ? 'نتائج توصية AI المباشرة:' : 'AI Evaluation Result:'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded border border-emerald-500/30">
                    {aiEvalResult.recommendedVendorStatus} (Suitability: {aiEvalResult.suitabilityScorePercent}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'مؤشر المخاطرة المتوقع' : 'Predicted Risk Score'}</span>
                    <span className="text-lg font-bold text-emerald-400">{aiEvalResult.predictedRiskScore} / 100 ({aiEvalResult.predictedRiskLevel})</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'نسبة التوفير المالي المتوقعة' : 'Estimated Cost Savings'}</span>
                    <span className="text-lg font-bold text-amber-400">+{aiEvalResult.estimatedSavingsPercent}%</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'شروط الدفع الموصى بها' : 'Recommended Payment Terms'}</span>
                    <span className="text-lg font-bold text-sky-400 font-mono">{aiEvalResult.recommendedPaymentTerms}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-200">{isAr ? 'خطة التخفيف من المخاطر الموصى بها:' : 'Risk Mitigation Strategy:'}</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                    {aiEvalResult.riskMitigationPlan}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'توصيات الذكاء الاصطناعي لتحسين العقود السارية' : 'AI Contract Optimization Insights'}</span>
              </h3>

              <div className="space-y-3">
                {aiIntelligence?.AIContractInsights?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{item.contractNumber}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Savings: +{(item.potentialSavingsSAR / 1000).toFixed(0)}k SAR
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white">{item.vendorName}</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'أفضل الموردين الموصى بهم حسب الأداء' : 'Top AI Recommended Suppliers'}</span>
              </h3>

              <div className="space-y-3">
                {aiIntelligence?.topRecommendedSuppliers?.map((v: VendorMaster) => (
                  <div key={v.id} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{v.name}</h4>
                      <p className="text-[10px] text-slate-400">{v.vendorType} • {v.vendorCode}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300 block">⭐ {v.scorecard.overallRating} / 5.0</span>
                      <span className="text-[10px] text-emerald-400 font-mono">SLA: {v.scorecard.deliveryPerformance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VENDOR MASTER */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'إضافة مورد جديد في السجل الرئيسي (Vendor Master)' : 'Register New Vendor Master'}</span>
              </h3>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'اسم المورد التجارية' : 'Vendor Name'}</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة ساسكو للوقود"
                    value={newVendorName}
                    onChange={e => setNewVendorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الاسم القانوني الرسمي' : 'Legal Entity Name'}</label>
                  <input
                    type="text"
                    placeholder="الاسم المسجل بالسجل التجاري"
                    value={newVendorLegalName}
                    onChange={e => setNewVendorLegalName(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الفئة الرئيسية للمورد' : 'Category'}</label>
                  <select
                    value={newVendorType}
                    onChange={e => setNewVendorType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Warehousing">Warehousing</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Customs">Customs</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Equipment">Equipment</option>
                    <option value="IT Services">IT Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الرقم الضريبي (VAT)' : 'Tax VAT Number'}</label>
                  <input
                    type="text"
                    placeholder="3000..."
                    value={newVendorTaxId}
                    onChange={e => setNewVendorTaxId(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'رقم السجل التجاري (CR)' : 'Commercial Register (CR)'}</label>
                  <input
                    type="text"
                    placeholder="1010..."
                    value={newVendorCR}
                    onChange={e => setNewVendorCR(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'المدينة' : 'City'}</label>
                  <input
                    type="text"
                    value={newVendorCity}
                    onChange={e => setNewVendorCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input
                    type="email"
                    placeholder="procurement@vendor.sa"
                    value={newVendorEmail}
                    onChange={e => setNewVendorEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={newVendorPhone}
                    onChange={e => setNewVendorPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
                >
                  {isAr ? 'حفظ وتفعيل التوثيق' : 'Save & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE REQUISITION */}
      {showAddPRModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>{isAr ? 'تقديم طلب شراء جديد (Purchase Requisition)' : 'Create Purchase Requisition'}</span>
              </h3>
              <button
                onClick={() => setShowAddPRModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'القسم / الإدارة الطالبات' : 'Department'}</label>
                  <input
                    type="text"
                    required
                    value={newPRDepartment}
                    onChange={e => setNewPRDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'مركز التكلفة' : 'Cost Center'}</label>
                  <input
                    type="text"
                    required
                    value={newPRCostCenter}
                    onChange={e => setNewPRCostCenter(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'مقدم الطلب' : 'Requested By'}</label>
                  <input
                    type="text"
                    required
                    value={newPRRequestedBy}
                    onChange={e => setNewPRRequestedBy(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الأولوية' : 'Priority'}</label>
                  <select
                    value={newPRPriority}
                    onChange={e => setNewPRPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{isAr ? 'وصف البنود والمواصفات المطلوبة' : 'Item Description & Specs'}</label>
                <textarea
                  required
                  rows={2}
                  value={newPRItemDesc}
                  onChange={e => setNewPRItemDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الكمية' : 'Quantity'}</label>
                  <input
                    type="number"
                    required
                    value={newPRQty}
                    onChange={e => setNewPRQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'السعر التقديري للوحدة (SAR)' : 'Est. Unit Price'}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPRUnitPrice}
                    onChange={e => setNewPRUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'إجمالي الميزانية التقديرية:' : 'Total Est. Amount:'}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {(newPRQty * newPRUnitPrice).toLocaleString()} SAR
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPRModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold cursor-pointer"
                >
                  {isAr ? 'تقديم طلب الشراء والتحقق' : 'Submit Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LAUNCH SOURCING EVENT */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>{isAr ? 'طرح منافسة جديدة (Sourcing Event RFQ/RFP)' : 'Launch Sourcing Event'}</span>
              </h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSourcingEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{isAr ? 'عنوان المنافسة / المشروع' : 'Event Title'}</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'نوع المنافسة' : 'Event Type'}</label>
                  <select
                    value={newEventType}
                    onChange={e => setNewEventType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="RFQ">RFQ - طلب عروض أسعار (Commercial)</option>
                    <option value="RFP">RFP - طلب عروض فنية ومالية (Solutions)</option>
                    <option value="RFI">RFI - طلب معلومات وسجل تأهيل (Information)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'فئة الموردين المطلوبين' : 'Category'}</label>
                  <select
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Warehousing">Warehousing</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Customs">Customs</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الميزانية التقديرية (SAR)' : 'Estimated Budget'}</label>
                  <input
                    type="number"
                    required
                    value={newEventBudget}
                    onChange={e => setNewEventBudget(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'الموعد النهائي لتقديم العروض' : 'Response Deadline'}</label>
                  <input
                    type="date"
                    required
                    value={newEventDeadline}
                    onChange={e => setNewEventDeadline(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold cursor-pointer"
                >
                  {isAr ? 'طرح المنافسة وإرسال الدعوات' : 'Publish & Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VENDOR DETAILS DRAWER */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-mono text-amber-400">{selectedVendor.vendorCode}</span>
                <h3 className="text-lg font-bold text-white">{selectedVendor.name}</h3>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <p className="font-bold text-amber-300 border-b border-slate-700 pb-1">{isAr ? 'بيانات المنشأة والسجل' : 'Company & Registration'}</p>
                <p><span className="text-slate-400">{isAr ? 'الاسم القانوني:' : 'Legal Name:'}</span> {selectedVendor.legalName}</p>
                <p><span className="text-slate-400">{isAr ? 'الرقم الضريبي ZATCA:' : 'Tax VAT:'}</span> <span className="font-mono">{selectedVendor.taxId}</span></p>
                <p><span className="text-slate-400">{isAr ? 'السجل التجاري CR:' : 'CR No:'}</span> <span className="font-mono">{selectedVendor.commercialRegisterNo}</span></p>
                <p><span className="text-slate-400">{isAr ? 'العنوان:' : 'Address:'}</span> {selectedVendor.companyDetails.city}, {selectedVendor.companyDetails.country}</p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <p className="font-bold text-amber-300 border-b border-slate-700 pb-1">{isAr ? 'المعلومات المالية والبنكية' : 'Financial & Banking'}</p>
                <p><span className="text-slate-400">{isAr ? 'اسم البنك:' : 'Bank:'}</span> {selectedVendor.financial.bankName}</p>
                <p><span className="text-slate-400">IBAN:</span> <span className="font-mono text-sky-300">{selectedVendor.financial.iban}</span></p>
                <p><span className="text-slate-400">{isAr ? 'شروط الدفع:' : 'Terms:'}</span> <span className="font-mono text-amber-400">{selectedVendor.financial.paymentTerms}</span></p>
                <p><span className="text-slate-400">{isAr ? 'حد الائتمان:' : 'Credit Limit:'}</span> <span className="font-mono text-emerald-400">{(selectedVendor.financial.creditLimitSAR / 1000000).toFixed(1)}M SAR</span></p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OCR INVOICE CAPTURE WORKSPACE */}
      {showOCRCaptureModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? 'بيئة المسح الذكي واستخراج بيانات الفواتير (AI OCR Capture)' : 'AI OCR Invoice Extraction'}</span>
              </h3>
              <button
                onClick={() => setShowOCRCaptureModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                {isAr
                  ? 'قم بلصق النص الخام للفاتورة الإلكترونية أو الفاتورة الضوئية لاستخراج البنود والضريبة ورقم PO عبر Gemini AI:'
                  : 'Paste raw invoice text or electronic receipt to extract invoice #, line items, VAT 15%, and PO matching references using Gemini AI:'}
              </p>

              <textarea
                rows={6}
                value={ocrRawText}
                onChange={e => setOcrRawText(e.target.value)}
                placeholder={isAr ? 'مثال: فاتورة شركة ساسكو للخدمات البترولية رقم INV-998811 الموعد 2026-08-30 المجموع 540,960 ر.س الضريبة 70,560 ر.س PO-AJA-2026-809' : 'Paste raw invoice text...'}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOCRCaptureModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer text-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={ocrLoading || !ocrRawText.trim()}
                onClick={handleRunOCRExtraction}
                className={`px-5 py-2 rounded-xl font-bold cursor-pointer text-xs flex items-center gap-2 ${
                  ocrLoading ? 'bg-slate-800 text-amber-400' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'
                }`}
              >
                {ocrLoading ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Sparkles className="w-4 h-4" />}
                <span>{ocrLoading ? (isAr ? 'جاري التحليل واستخراج البنود...' : 'Extracting with Gemini AI...') : (isAr ? 'استخراج الفاتورة بالذكاء الاصطناعي' : 'Run OCR Extraction')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / VERIFY INVOICE FORM */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'تسجيل فاتورة مورد جديدة' : 'Record Supplier Invoice'}</span>
              </h3>
              <button
                onClick={() => setShowAddInvoiceModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</label>
                  <input
                    type="text"
                    required
                    value={newInvNumber}
                    onChange={e => setNewInvNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'اسم المورد' : 'Supplier Name'}</label>
                  <input
                    type="text"
                    required
                    value={newInvSupplierName}
                    onChange={e => setNewInvSupplierName(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'رقم أمر الشراء (PO)' : 'PO Reference'}</label>
                  <input
                    type="text"
                    required
                    value={newInvPO}
                    onChange={e => setNewInvPO(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'سند الاستلام (GRN)' : 'GRN Reference'}</label>
                  <input
                    type="text"
                    value={newInvGRN}
                    onChange={e => setNewInvGRN(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'المبلغ الإجمالي (SAR)' : 'Total Amount SAR'}</label>
                  <input
                    type="number"
                    required
                    value={newInvTotal}
                    onChange={e => setNewInvTotal(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'مبلغ ضريبة القيمة المضافة (VAT 15%)' : 'VAT Amount SAR'}</label>
                  <input
                    type="number"
                    required
                    value={newInvVAT}
                    onChange={e => setNewInvVAT(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                  <input
                    type="date"
                    required
                    value={newInvDueDate}
                    onChange={e => setNewInvDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer text-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer text-xs"
                >
                  {isAr ? 'حفظ الفاتورة وإرسالها للمطابقة' : 'Save & Submit for Matching'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 3-WAY MATCHING RESULT MODAL */}
      {show3WayMatchModal && selectedInvoiceForMatching && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-sky-400" />
                <span>{isAr ? 'نتائج فحص المطابقة الثلاثية' : '3-Way Matching Evaluation Result'}</span>
              </h3>
              <button
                onClick={() => setShow3WayMatchModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {matchLoading ? (
              <div className="p-8 text-center text-slate-300 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
                <p className="text-xs font-bold">{isAr ? 'جاري مقارنة الفاتورة مع PO و GRN...' : 'Matching PO vs GRN vs Invoice...'}</p>
              </div>
            ) : matchResultState ? (
              <div className="space-y-4 text-xs">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  matchResultState.matchPassed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}>
                  {matchResultState.matchPassed ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                  <div>
                    <div className="font-bold text-sm">{matchResultState.matchingStatus}</div>
                    <div className="text-[11px] font-mono mt-0.5">{matchResultState.discrepancyNotes}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">{isAr ? 'نسبة الانحراف السعري' : 'Price Variance'}</span>
                    <span className="text-white font-bold">{matchResultState.priceVariancePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">{isAr ? 'نسبة انحراف الكمية' : 'Quantity Variance'}</span>
                    <span className="text-white font-bold">{matchResultState.quantityVariancePercent}%</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShow3WayMatchModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
