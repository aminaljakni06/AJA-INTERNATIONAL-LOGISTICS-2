import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Scale,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ExecutiveFinanceSummary, JournalEntry, ChartOfAccount } from '../../types/generalLedger';

interface FinanceDashboardProps {
  summary: ExecutiveFinanceSummary;
  recentJournals: JournalEntry[];
  accounts: ChartOfAccount[];
  onNavigateTab: (tab: string) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  summary,
  recentJournals,
  accounts,
  onNavigateTab
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAr ? 'إجمالي الأصول (Assets)' : 'Total Assets'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {formatSAR(summary.totalAssetsSAR)}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isAr ? '+8.4% عن الربع السابق' : '+8.4% vs previous quarter'}</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* YTD Revenue */}
        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAr ? 'إيرادات العام (YTD Revenue)' : 'YTD Revenue'}
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {formatSAR(summary.ytdRevenueSAR)}
            </h3>
            <p className="text-xs text-sky-400 mt-1 flex items-center gap-1 font-medium">
              <span>{isAr ? 'هامش الربح الصافي: ' : 'Net Margin: '}</span>
              <span className="font-bold text-emerald-400">{summary.netMarginPercent}%</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Working Capital */}
        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAr ? 'رأس المال العامل (Working Capital)' : 'Working Capital'}
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {formatSAR(summary.workingCapitalSAR)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span>{isAr ? 'نسبة التداول: ' : 'Current Ratio: '}</span>
              <span className="font-bold text-amber-400">{summary.currentRatio}</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Ledger Health & Controls */}
        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAr ? 'مؤشر سلامة الدفتر (Ledger Health)' : 'Ledger Health Score'}
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-emerald-400 tracking-tight">
                {summary.ledgerHealthScore}%
              </h3>
              <span className="text-xs font-bold text-slate-400">{isAr ? 'ممتاز (AAA)' : 'Excellent'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{isAr ? 'الفترة المالية الحالية: ' : 'Open Period: '}</span>
              <span className="text-sky-400 font-semibold">{summary.openFiscalPeriod}</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Main Grid: Balance Sheet / Income Snapshot + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Sheet & Income Statement Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statement Snapshot Box */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700/80">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                  <span>{isAr ? 'ملخص القوائم المالية العامة (GAAP/IFRS)' : 'Financial Statements Summary'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'نظرة سريعة على توازن الأصول والالتزامات وصافي الربح' : 'Realtime Balance Sheet & P&L Snapshot'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('trial-balance')}
                className="px-3 py-1.5 bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                {isAr ? 'ميزان المراجعة الكامل' : 'View Full Trial Balance'}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Sheet Column */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase pb-2 border-b border-slate-700/40">
                  <span>{isAr ? 'الميزانية العمومية' : 'Balance Sheet'}</span>
                  <span className="text-emerald-400">{isAr ? 'متوازنة ✓' : 'Balanced ✓'}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{isAr ? 'إجمالي الأصول' : 'Total Assets'}</span>
                    <span className="font-semibold text-white">{formatSAR(summary.totalAssetsSAR)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{isAr ? 'خصم: الالتزامات' : 'Less: Liabilities'}</span>
                    <span className="font-semibold text-rose-400">-{formatSAR(summary.totalLiabilitiesSAR)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center font-bold text-emerald-400">
                    <span>{isAr ? 'صافي حقوق الملكية' : 'Net Equity'}</span>
                    <span>{formatSAR(summary.totalEquitySAR + summary.netProfitSAR)}</span>
                  </div>
                </div>
              </div>

              {/* Income Statement Column */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase pb-2 border-b border-slate-700/40">
                  <span>{isAr ? 'قائمة الدخل (P&L)' : 'Income Statement'}</span>
                  <span className="text-sky-400">{isAr ? 'ربح صافي' : 'Profitable'}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{isAr ? 'إجمالي الإيرادات' : 'Gross Revenue'}</span>
                    <span className="font-semibold text-emerald-400">{formatSAR(summary.ytdRevenueSAR)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{isAr ? 'تكلفة المبيعات' : 'Cost of Goods Sold'}</span>
                    <span className="font-semibold text-rose-300">-{formatSAR(summary.ytdCostOfSalesSAR)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{isAr ? 'المصاريف التشغيلية' : 'Operating Expenses'}</span>
                    <span className="font-semibold text-rose-300">-{formatSAR(summary.ytdOperatingExpensesSAR)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center font-bold text-sky-400">
                    <span>{isAr ? 'صافي أرباح الفترة' : 'Net Profit'}</span>
                    <span>{formatSAR(summary.netProfitSAR)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posted Journals */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700/80">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'آخر قيود اليومية المحاسبية' : 'Recent Journal Entries'}</span>
              </h3>
              <button
                onClick={() => onNavigateTab('journal-workspace')}
                className="px-3 py-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                {isAr ? '+ إنشاء قيد جديد' : '+ New Journal Entry'}
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">{isAr ? 'رقم القيد' : 'Journal #'}</th>
                    <th className="px-4 py-3">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="px-4 py-3">{isAr ? 'النوع' : 'Type'}</th>
                    <th className="px-4 py-3">{isAr ? 'البيان / الشرح' : 'Narration'}</th>
                    <th className="px-4 py-3 text-right">{isAr ? 'المبلغ (SAR)' : 'Amount (SAR)'}</th>
                    <th className="px-4 py-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentJournals.map(journal => (
                    <tr key={journal.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-sky-400">{journal.journalNumber}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{journal.postingDate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {journal.journalType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 text-xs max-w-xs truncate">
                        {isAr ? journal.narrationAr : journal.narrationEn}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-right">
                        {formatSAR(journal.totalDebitSAR)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          journal.status === 'POSTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {journal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Modules & Currency Exposure */}
        <div className="space-y-6">
          {/* Quick Module Shortcuts */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'وحدات المالية الرئيسية' : 'Finance Modules Navigation'}</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('chart-of-accounts')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-sm font-medium cursor-pointer"
              >
                <span>{isAr ? 'شجرة الحسابات (Chart of Accounts)' : 'Chart of Accounts (COA)'}</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded font-mono text-sky-300">{accounts.length}</span>
              </button>

              <button
                onClick={() => onNavigateTab('financial-dimensions')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-sm font-medium cursor-pointer"
              >
                <span>{isAr ? 'الأبعاد المالية (Financial Dimensions)' : 'Financial Dimensions'}</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded font-mono text-emerald-300">9</span>
              </button>

              <button
                onClick={() => onNavigateTab('fiscal-calendar')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-sm font-medium cursor-pointer"
              >
                <span>{isAr ? 'التقويم المالي والفترات (Fiscal Calendar)' : 'Fiscal Calendar & Periods'}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">FY 2026</span>
              </button>

              <button
                onClick={() => onNavigateTab('currency-management')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-sm font-medium cursor-pointer"
              >
                <span>{isAr ? 'إدارة العملات وأسعار الصرف (Multi-Currency)' : 'Multi-Currency & FX Rates'}</span>
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">SAR Base</span>
              </button>

              <button
                onClick={() => onNavigateTab('intercompany-center')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-sm font-medium cursor-pointer"
              >
                <span>{isAr ? 'محاسبة المعاملات بين الشركات (Intercompany)' : 'Intercompany Accounting'}</span>
                <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">Active</span>
              </button>

              <button
                onClick={() => onNavigateTab('ai-finance-intelligence')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-slate-800 hover:from-purple-900/60 text-purple-200 border border-purple-500/30 transition-all text-sm font-medium cursor-pointer"
              >
                <span>{isAr ? 'مركز الذكاء الاصطناعي المالي (AI Finance)' : 'AI Finance Intelligence'}</span>
                <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">AI Active</span>
              </button>
            </div>
          </div>

          {/* Currency Exposure Box */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'التعرض المالي بالعملات (FX Exposure)' : 'Currency Exposure Risk'}</span>
            </h3>

            <div className="space-y-3">
              {summary.currencyExposureSAR.map(exp => (
                <div key={exp.currency} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>{exp.currency} Reserves</span>
                    <span className="font-mono text-emerald-400">{formatSAR(exp.exposureAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.min(100, (exp.exposureAmount / summary.cashPositionSAR) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
