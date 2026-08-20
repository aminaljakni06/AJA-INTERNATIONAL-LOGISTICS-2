import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Sliders,
  Calendar,
  FilePlus,
  Search,
  FileSpreadsheet,
  DollarSign,
  Building2,
  Award,
  Brain,
  ShieldCheck,
  RefreshCw,
  Globe,
  Receipt,
  FileText,
  Clock,
  UserCheck,
  PieChart,
  Zap,
  TrendingUp,
  CreditCard,
  Landmark,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { GeneralLedgerClient, GeneralLedgerSnapshot } from '../../services/generalLedgerClient';

// Import GL sub-components
import { FinanceDashboard } from './FinanceDashboard';
import { ChartOfAccountsView } from './ChartOfAccountsView';
import { FinancialDimensionsView } from './FinancialDimensionsView';
import { FiscalCalendarView } from './FiscalCalendarView';
import { JournalWorkspaceView } from './JournalWorkspaceView';
import { GeneralLedgerExplorer } from './GeneralLedgerExplorer';
import { TrialBalanceView } from './TrialBalanceView';
import { CurrencyManagementView } from './CurrencyManagementView';
import { IntercompanyCenterView } from './IntercompanyCenterView';
import { ExecutiveFinanceCockpit } from './ExecutiveFinanceCockpit';
import { AIFinanceIntelligenceCenter } from './AIFinanceIntelligenceCenter';

// Import Accounts Receivable sub-components
import { ARDashboard } from './ar/ARDashboard';
import { CustomerBillingCenterView } from './ar/CustomerBillingCenterView';
import { InvoiceManagementWorkspace } from './ar/InvoiceManagementWorkspace';
import { RevenueRecognitionCenterView } from './ar/RevenueRecognitionCenterView';
import { CustomerStatementsView } from './ar/CustomerStatementsView';
import { CollectionsWorkspaceView } from './ar/CollectionsWorkspaceView';
import { CreditManagementCenterView } from './ar/CreditManagementCenterView';
import { ReceivablesAgingDashboard } from './ar/ReceivablesAgingDashboard';
import { ExecutiveO2CDashboard } from './ar/ExecutiveO2CDashboard';
import { AIReceivablesIntelligenceView } from './ar/AIReceivablesIntelligenceView';

// Import Treasury sub-components
import { TreasuryDashboard } from './treasury/TreasuryDashboard';
import { BankManagementView } from './treasury/BankManagementView';
import { CashPositionView } from './treasury/CashPositionView';
import { PaymentFactoryView } from './treasury/PaymentFactoryView';
import { BankReconciliationView } from './treasury/BankReconciliationView';
import { LiquidityPlanningView } from './treasury/LiquidityPlanningView';
import { FXManagementView } from './treasury/FXManagementView';
import { FinancialSettlementView } from './treasury/FinancialSettlementView';
import { ExecutiveTreasuryDashboard } from './treasury/ExecutiveTreasuryDashboard';
import { AITreasuryIntelligenceView } from './treasury/AITreasuryIntelligenceView';

// Import FP&A sub-components
import { BudgetManagementView } from './fpa/BudgetManagementView';
import { CapexOpexManagementView } from './fpa/CapexOpexManagementView';
import { RollingForecastView } from './fpa/RollingForecastView';
import { ScenarioPlanningView } from './fpa/ScenarioPlanningView';
import { VarianceAnalysisView } from './fpa/VarianceAnalysisView';
import { CostAccountingView } from './fpa/CostAccountingView';
import { ProfitabilityAnalysisView } from './fpa/ProfitabilityAnalysisView';
import { ExecutiveFPADashboard } from './fpa/ExecutiveFPADashboard';
import { AIFPAIntelligenceView } from './fpa/AIFPAIntelligenceView';

// Import Fixed Assets & Financial Reporting sub-components
import { FixedAssetsRegisterView } from './assetsReporting/FixedAssetsRegisterView';
import { AssetLifecycleView } from './assetsReporting/AssetLifecycleView';
import { DepreciationEngineView } from './assetsReporting/DepreciationEngineView';
import { LeaseAccountingView } from './assetsReporting/LeaseAccountingView';
import { TaxZatcaComplianceView } from './assetsReporting/TaxZatcaComplianceView';
import { FinancialStatementsView } from './assetsReporting/FinancialStatementsView';
import { CorporateConsolidationView } from './assetsReporting/CorporateConsolidationView';
import { ExecutiveCFODashboard } from './assetsReporting/ExecutiveCFODashboard';
import { AIFinanceIntelligenceView } from './assetsReporting/AIFinanceIntelligenceView';

import {
  ChartOfAccount,
  JournalEntry,
  FinancialDimensionValue,
  FiscalYear,
  CurrencyRate,
  ExecutiveFinanceSummary,
  IntercompanyAccount,
  AccountStatus,
  FiscalPeriod,
  TrialBalanceRow
} from '../../types/generalLedger';

export const GeneralLedgerFinanceMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [summary, setSummary] = useState<ExecutiveFinanceSummary | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [dimensions, setDimensions] = useState<FinancialDimensionValue[]>([]);
  const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [intercompanyAccounts, setIntercompanyAccounts] = useState<IntercompanyAccount[]>([]);
  const [trialBalanceRows, setTrialBalanceRows] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applySnapshot = (snapshot: GeneralLedgerSnapshot) => {
    setSummary(snapshot.summary);
    setAccounts(snapshot.accounts);
    setJournals(snapshot.journals);
    setDimensions(snapshot.dimensions);
    setFiscalYear(snapshot.fiscalYear);
    setCurrencies(snapshot.currencies);
    setIntercompanyAccounts(snapshot.intercompanyAccounts);
    setTrialBalanceRows(snapshot.trialBalanceRows);
  };

  const loadLedgerSnapshot = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      applySnapshot(await GeneralLedgerClient.getSnapshot());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load general ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLedgerSnapshot();
  }, []);

  // Handlers
  const handleAddAccount = async (newAcc: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt' | 'currentBalanceSAR' | 'ytdDebitSAR' | 'ytdCreditSAR'>) => {
    const { snapshot } = await GeneralLedgerClient.addAccount(newAcc);
    applySnapshot(snapshot);
  };

  const handleUpdateAccountStatus = async (code: string, status: AccountStatus) => {
    const { snapshot } = await GeneralLedgerClient.updateAccountStatus(code, status);
    applySnapshot(snapshot);
  };

  const handleCreateJournal = async (journalData: Omit<JournalEntry, 'id' | 'journalNumber' | 'preparedAt' | 'status'>) => {
    const { snapshot } = await GeneralLedgerClient.createJournalEntry(journalData);
    applySnapshot(snapshot);
    setActiveTab('gl-explorer');
  };

  const handlePostJournal = async (journalId: string) => {
    const { snapshot } = await GeneralLedgerClient.postJournalEntry(journalId, 'Chief Financial Controller');
    applySnapshot(snapshot);
  };

  const handleAddDimension = async (dim: Omit<FinancialDimensionValue, 'id'>) => {
    const { snapshot } = await GeneralLedgerClient.addDimensionValue(dim);
    applySnapshot(snapshot);
  };

  const handleUpdatePeriodStatus = async (periodId: string, status: FiscalPeriod['status']) => {
    const { snapshot } = await GeneralLedgerClient.updatePeriodStatus(periodId, status, 'Finance Director');
    applySnapshot(snapshot);
  };

  const handleUpdateCurrencyRate = async (code: string, newRate: number) => {
    const { snapshot } = await GeneralLedgerClient.updateCurrencyRate(code, newRate);
    applySnapshot(snapshot);
  };

  const handleEliminateIntercompany = async (id: string) => {
    const { snapshot } = await GeneralLedgerClient.eliminateIntercompanyAccount(id);
    applySnapshot(snapshot);
  };

  const navTabs = [
    { id: 'dashboard', labelEn: 'GL Dashboard', labelAr: 'دفتر الحسابات العام', icon: LayoutDashboard },
    { id: 'ar-dashboard', labelEn: 'AR Dashboard', labelAr: 'لوحة قيادة الحسابات المدينة', icon: Receipt },
    { id: 'ar-billing', labelEn: 'Customer Billing', labelAr: 'مركز الفوترة', icon: FileText },
    { id: 'ar-invoices', labelEn: 'Sales Invoices', labelAr: 'سجل فواتير المبيعات', icon: DollarSign },
    { id: 'ar-rev-rec', labelEn: 'IFRS 15 Revenue Rec', labelAr: 'الاعتراف بالإيرادات', icon: ShieldCheck },
    { id: 'ar-statements', labelEn: 'Customer Statements', labelAr: 'كشوف الحسابات', icon: FileSpreadsheet },
    { id: 'ar-collections', labelEn: 'Collections & Dunning', labelAr: 'التحصيل والمطالبات', icon: Clock },
    { id: 'ar-credit', labelEn: 'Credit Management', labelAr: 'إدارة الائتمان', icon: UserCheck },
    { id: 'ar-aging', labelEn: 'Receivables Aging', labelAr: 'أعمار الديون', icon: PieChart },
    { id: 'ar-exec-o2c', labelEn: 'Executive O2C', labelAr: 'المقصورة التنفيذية O2C', icon: Award },
    { id: 'ar-ai-intelligence', labelEn: 'AI Receivables', labelAr: 'الذكاء المالي للمستحقات', icon: Zap },
    { id: 'treasury-dashboard', labelEn: 'Treasury Hub', labelAr: 'منظومة الخزينة والسيولة', icon: Landmark },
    { id: 'treasury-banks', labelEn: 'Bank Accounts', labelAr: 'الحسابات المصرفية', icon: Building2 },
    { id: 'treasury-cash-pos', labelEn: 'Cash Position', labelAr: 'موقف السيولة اليومي', icon: TrendingUp },
    { id: 'treasury-payment-factory', labelEn: 'Payment Factory', labelAr: 'مصنع المدفوعات', icon: CreditCard },
    { id: 'treasury-reconciliation', labelEn: 'Bank Recon Engine', labelAr: 'مطابقة الحسابات', icon: FileCheck },
    { id: 'treasury-liquidity', labelEn: 'Liquidity Planning', labelAr: 'التنبؤ بالسيولة', icon: Clock },
    { id: 'treasury-fx', labelEn: 'FX Risk & Rates', labelAr: 'إدارة مخاوف العملات', icon: Globe },
    { id: 'treasury-settlement', labelEn: 'Financial Settlement', labelAr: 'التسويات المالية', icon: ShieldCheck },
    { id: 'treasury-executive', labelEn: 'Executive Treasury', labelAr: 'مقصورة الخزينة التنفيذية', icon: Award },
    { id: 'treasury-ai', labelEn: 'AI Treasury Intelligence', labelAr: 'ذكاء الخزينة الاصطناعي', icon: Brain },
    { id: 'fpa-budget', labelEn: 'Budget Center', labelAr: 'إدارة الميزانيات', icon: PieChart },
    { id: 'fpa-capex-opex', labelEn: 'CAPEX & OPEX', labelAr: 'النفقات الرأسمالية والتشغيلية', icon: TrendingUp },
    { id: 'fpa-forecast', labelEn: 'Rolling Forecast', labelAr: 'التنبؤ المالي المتجدد', icon: Clock },
    { id: 'fpa-scenarios', labelEn: 'Scenario Planning', labelAr: 'تخطيط السيناريوهات', icon: Sliders },
    { id: 'fpa-variance', labelEn: 'Variance Analysis', labelAr: 'تحليل الانحرافات', icon: AlertTriangle },
    { id: 'fpa-cost-acc', labelEn: 'Cost Accounting (ABC)', labelAr: 'محاسبة التكاليف', icon: Layers },
    { id: 'fpa-profitability', labelEn: 'Profitability Ledger', labelAr: 'تحليل الربحية', icon: Award },
    { id: 'fpa-executive', labelEn: 'Executive FP&A', labelAr: 'مقصورة التخطيط المالي التنفيذية', icon: ShieldCheck },
    { id: 'fpa-ai', labelEn: 'AI FP&A Intelligence', labelAr: 'ذكاء التخطيط المالي الاصطناعي', icon: Brain },
    { id: 'fa-register', labelEn: 'Fixed Asset Register', labelAr: 'سجل الأصول الثابتة', icon: Building2 },
    { id: 'fa-lifecycle', labelEn: 'Asset Lifecycle', labelAr: 'دورة حياة الأصول', icon: RefreshCw },
    { id: 'fa-depreciation', labelEn: 'Depreciation Engine', labelAr: 'مُحرك الإهلاك', icon: TrendingUp },
    { id: 'fa-leases', labelEn: 'IFRS 16 Leases', labelAr: 'إيجارات IFRS 16', icon: FileText },
    { id: 'tax-zatca', labelEn: 'Tax & ZATCA Fatoora', labelAr: 'الضريبة وزاتكا', icon: ShieldCheck },
    { id: 'fin-statements', labelEn: 'Financial Statements', labelAr: 'القوائم المالية', icon: FileCheck },
    { id: 'corp-consolidation', labelEn: 'Group Consolidation', labelAr: 'التجميع المالي', icon: Globe },
    { id: 'cfo-dashboard', labelEn: 'Executive CFO Cockpit', labelAr: 'مقصورة CFO التنفيذية', icon: Award },
    { id: 'fa-ai-intelligence', labelEn: 'AI Asset Intelligence', labelAr: 'الذكاء المالي للأصول', icon: Brain },
    { id: 'chart-of-accounts', labelEn: 'Chart of Accounts', labelAr: 'دليل الحسابات', icon: Layers },
    { id: 'financial-dimensions', labelEn: 'Dimensions & Cost Centers', labelAr: 'الأبعاد التكلفية', icon: Sliders },
    { id: 'fiscal-calendar', labelEn: 'Fiscal Calendar', labelAr: 'التقويم المالي', icon: Calendar },
    { id: 'journal-workspace', labelEn: 'New Journal Entry', labelAr: 'قيد يومية', icon: FilePlus },
    { id: 'gl-explorer', labelEn: 'GL Explorer', labelAr: 'مكتشف الحركات', icon: Search },
    { id: 'trial-balance', labelEn: 'Trial Balance', labelAr: 'ميزان المراجعة', icon: FileSpreadsheet },
    { id: 'currency-management', labelEn: 'Multi-Currency & FX', labelAr: 'إعادة التقييم', icon: DollarSign },
    { id: 'intercompany-center', labelEn: 'Intercompany', labelAr: 'المعاملات بين الشركات', icon: Building2 },
    { id: 'executive-cockpit', labelEn: 'C-Suite Ratios', labelAr: 'مؤشرات الأداء', icon: Award },
    { id: 'ai-finance-intelligence', labelEn: 'AI Intelligence', labelAr: 'الذكاء المالي العام', icon: Brain }
  ];

  if (loading && (!summary || !fiscalYear)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="text-xs font-mono text-sky-400 mb-2">GENERAL LEDGER</div>
          <div className="text-lg font-bold text-white">{isAr ? 'جاري تحميل بيانات الدفتر العام...' : 'Loading general ledger data...'}</div>
        </div>
      </div>
    );
  }

  if (!summary || !fiscalYear) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 shadow-xl">
          <div className="text-xs font-mono text-red-400 mb-2">GENERAL LEDGER</div>
          <div className="text-lg font-bold text-white">{isAr ? 'تعذر تحميل بيانات الدفتر العام' : 'Unable to load general ledger data'}</div>
          <p className="text-sm text-slate-400 mt-2">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadLedgerSnapshot()}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
          >
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Bar Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold uppercase tracking-wider">
              PACK 008 • ENTERPRISE FINANCE FOUNDATION
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              GAAPP / IFRS Compliant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            {isAr ? 'المنظومة المالية وإدارة الدفتر العام (General Ledger ERP)' : 'Enterprise General Ledger & Finance Platform'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            {isAr
              ? 'إدارة الحسابات العامة، التقويم المالي، القيود المزدوجة، الأبعاد المالية، الميزانيات التجميعية والمعاملات بين الشركات'
              : 'Multi-company, multi-currency General Ledger, Chart of Accounts, trial balance & financial control center.'}
          </p>
        </div>

        {/* Global Company Context */}
        <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shrink-0">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">{isAr ? 'الشركة الحسابية المفعلة:' : 'Active Entity:'}</div>
            <div className="text-xs font-bold text-white">AJA Logistics Saudi Arabia Co.</div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold">Base: SAR • Open: Feb 2026</div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-800">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20 border border-sky-400/40'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <div className="pt-2">
        {activeTab === 'dashboard' && (
          <FinanceDashboard
            summary={summary}
            recentJournals={journals.slice(0, 5)}
            accounts={accounts}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'ar-dashboard' && (
          <ARDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'ar-billing' && (
          <CustomerBillingCenterView onInvoiceCreated={() => setActiveTab('ar-invoices')} />
        )}

        {activeTab === 'ar-invoices' && (
          <InvoiceManagementWorkspace />
        )}

        {activeTab === 'ar-rev-rec' && (
          <RevenueRecognitionCenterView />
        )}

        {activeTab === 'ar-statements' && (
          <CustomerStatementsView />
        )}

        {activeTab === 'ar-collections' && (
          <CollectionsWorkspaceView />
        )}

        {activeTab === 'ar-credit' && (
          <CreditManagementCenterView />
        )}

        {activeTab === 'ar-aging' && (
          <ReceivablesAgingDashboard />
        )}

        {activeTab === 'ar-exec-o2c' && (
          <ExecutiveO2CDashboard />
        )}

        {activeTab === 'ar-ai-intelligence' && (
          <AIReceivablesIntelligenceView />
        )}

        {activeTab === 'treasury-dashboard' && (
          <TreasuryDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'treasury-banks' && (
          <BankManagementView />
        )}

        {activeTab === 'treasury-cash-pos' && (
          <CashPositionView />
        )}

        {activeTab === 'treasury-payment-factory' && (
          <PaymentFactoryView />
        )}

        {activeTab === 'treasury-reconciliation' && (
          <BankReconciliationView />
        )}

        {activeTab === 'treasury-liquidity' && (
          <LiquidityPlanningView />
        )}

        {activeTab === 'treasury-fx' && (
          <FXManagementView />
        )}

        {activeTab === 'treasury-settlement' && (
          <FinancialSettlementView />
        )}

        {activeTab === 'treasury-executive' && (
          <ExecutiveTreasuryDashboard />
        )}

        {activeTab === 'treasury-ai' && (
          <AITreasuryIntelligenceView />
        )}

        {activeTab === 'fpa-budget' && (
          <BudgetManagementView />
        )}

        {activeTab === 'fpa-capex-opex' && (
          <CapexOpexManagementView />
        )}

        {activeTab === 'fpa-forecast' && (
          <RollingForecastView />
        )}

        {activeTab === 'fpa-scenarios' && (
          <ScenarioPlanningView />
        )}

        {activeTab === 'fpa-variance' && (
          <VarianceAnalysisView />
        )}

        {activeTab === 'fpa-cost-acc' && (
          <CostAccountingView />
        )}

        {activeTab === 'fpa-profitability' && (
          <ProfitabilityAnalysisView />
        )}

        {activeTab === 'fpa-executive' && (
          <ExecutiveFPADashboard />
        )}

        {activeTab === 'fpa-ai' && (
          <AIFPAIntelligenceView />
        )}

        {activeTab === 'fa-register' && (
          <FixedAssetsRegisterView />
        )}

        {activeTab === 'fa-lifecycle' && (
          <AssetLifecycleView />
        )}

        {activeTab === 'fa-depreciation' && (
          <DepreciationEngineView />
        )}

        {activeTab === 'fa-leases' && (
          <LeaseAccountingView />
        )}

        {activeTab === 'tax-zatca' && (
          <TaxZatcaComplianceView />
        )}

        {activeTab === 'fin-statements' && (
          <FinancialStatementsView />
        )}

        {activeTab === 'corp-consolidation' && (
          <CorporateConsolidationView />
        )}

        {activeTab === 'cfo-dashboard' && (
          <ExecutiveCFODashboard />
        )}

        {activeTab === 'fa-ai-intelligence' && (
          <AIFinanceIntelligenceView />
        )}

        {activeTab === 'chart-of-accounts' && (
          <ChartOfAccountsView
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateStatus={handleUpdateAccountStatus}
          />
        )}

        {activeTab === 'financial-dimensions' && (
          <FinancialDimensionsView
            dimensions={dimensions}
            onAddDimension={handleAddDimension}
          />
        )}

        {activeTab === 'fiscal-calendar' && (
          <FiscalCalendarView
            fiscalYear={fiscalYear}
            onUpdatePeriodStatus={handleUpdatePeriodStatus}
          />
        )}

        {activeTab === 'journal-workspace' && (
          <JournalWorkspaceView
            accounts={accounts}
            onCreateJournal={handleCreateJournal}
          />
        )}

        {activeTab === 'gl-explorer' && (
          <GeneralLedgerExplorer
            journals={journals}
            onPostJournal={handlePostJournal}
          />
        )}

        {activeTab === 'trial-balance' && (
          <TrialBalanceView
            trialBalanceRows={trialBalanceRows}
          />
        )}

        {activeTab === 'currency-management' && (
          <CurrencyManagementView
            currencies={currencies}
            onUpdateRate={handleUpdateCurrencyRate}
          />
        )}

        {activeTab === 'intercompany-center' && (
          <IntercompanyCenterView
            intercompanyAccounts={intercompanyAccounts}
            onEliminate={handleEliminateIntercompany}
          />
        )}

        {activeTab === 'executive-cockpit' && (
          <ExecutiveFinanceCockpit
            summary={summary}
          />
        )}

        {activeTab === 'ai-finance-intelligence' && (
          <AIFinanceIntelligenceCenter />
        )}
      </div>
    </div>
  );
};
