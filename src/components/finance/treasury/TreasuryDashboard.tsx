import React, { useEffect, useState } from 'react';
import {
  Landmark,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Layers,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient, TreasurySnapshot } from '../../../services/treasuryClient';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const TreasuryDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [snapshot, setSnapshot] = useState<TreasurySnapshot | null>(null);

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(setSnapshot);
  }, []);

  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل بيانات الخزينة...' : 'Loading treasury dashboard...'}
      </div>
    );
  }

  const { metrics, bankAccounts, aiInsights } = snapshot;
  const pendingBatches = snapshot.paymentBatches.filter(b => b.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Landmark className="w-4 h-4" />
            <span>{isAr ? 'منظومة إدارة الخزينة والسيولة والعمليات المصرفية' : 'Enterprise Treasury & Cash Management Platform'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isAr ? 'مركز قيادة السيولة وإدارة الحسابات البنكية' : 'Treasury, Liquidity Planning & Financial Settlement Hub'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'مراقبة السيولة النقدية، التسويات المالية، مطابقة الحسابات، الدفع الجماعي والتنبؤ التلقائي' : 'Real-time multi-bank balances, liquidity gap forecasting, payment factory & AI cash intelligence.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('treasury-payment-factory')}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isAr ? 'دفع دفعة سداد جديدة' : 'New Payment Batch'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-emerald-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'إجمالي الرصيد النقدي والسيولة' : 'Total Cash & Liquid Reserves'}</div>
          <div className="text-2xl font-extrabold text-white">
            SAR {(metrics.totalCashSAR / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+4.2% {isAr ? 'نمو الأسبوع الحالي' : 'vs last week'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-sky-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'استثمارات الخزينة والصكوك' : 'Treasury Deals & Sukuk'}</div>
          <div className="text-2xl font-extrabold text-sky-400">
            SAR {(metrics.activeDealsSAR / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-slate-400">Avg Yield: 6.02%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-amber-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'مدفوعات قيد الاعتماد' : 'Pending Payment Batches'}</div>
          <div className="text-2xl font-extrabold text-amber-400">
            SAR {(metrics.pendingPaymentsSAR / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-amber-300 font-semibold">{pendingBatches.length} {isAr ? 'دفعة تحتاج موافقة' : 'Batches Pending'}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-blue-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'نسبة التغطية ومعدل السيولة' : 'Quick Liquidity Ratio'}</div>
          <div className="text-2xl font-extrabold text-blue-400">
            {metrics.liquidityRatio}x
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">Optimal Range &gt; 2.5x</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 'treasury-banks', labelEn: 'Bank Accounts', labelAr: 'الحسابات البنكية', count: `${metrics.bankAccountsCount} Accounts`, color: 'border-sky-500/30' },
          { id: 'treasury-cash-pos', labelEn: 'Cash Positions', labelAr: 'موقف السيولة اليومي', count: 'Realtime Feed', color: 'border-emerald-500/30' },
          { id: 'treasury-reconciliation', labelEn: 'Bank Recon Engine', labelAr: 'مطابقة الحسابات', count: '98.2% Auto Match', color: 'border-blue-500/30' },
          { id: 'treasury-liquidity', labelEn: 'Liquidity Forecast', labelAr: 'التنبؤ بالسيولة', count: '4-Week Rolling', color: 'border-amber-500/30' }
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => onNavigateTab(nav.id)}
            className={`p-4 rounded-xl bg-slate-900 border ${nav.color} hover:bg-slate-800 transition-all text-left space-y-1 shadow-md group`}
          >
            <div className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
              {isAr ? nav.labelAr : nav.labelEn}
            </div>
            <div className="text-[10px] font-mono text-slate-400">{nav.count}</div>
          </button>
        ))}
      </div>

      {/* Main Grid: Bank Balances Breakdown & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Accounts Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Landmark className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'أرصدة الحسابات المصرفية المعتمدة' : 'Corporate Bank Account Balances'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('treasury-banks')}
              className="text-xs font-mono text-sky-400 hover:underline"
            >
              {isAr ? 'إدارة الحسابات الكاملة ←' : 'Manage All Accounts →'}
            </button>
          </div>

          <div className="space-y-3">
            {bankAccounts.map(account => {
              const fx = account.currency === 'USD' ? 3.75 : account.currency === 'EUR' ? 4.08 : 1;
              const balanceSAR = account.currentBalance * fx;

              return (
                <div
                  key={account.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{isAr ? account.bankNameAr : account.bankNameEn}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        {account.currency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">IBAN: {account.iban}</div>
                    <div className="text-[11px] text-slate-300">{isAr ? account.accountNameAr : account.accountNameEn}</div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-lg font-extrabold text-white">
                      {account.currency} {account.currentBalance.toLocaleString()}
                    </div>
                    {account.currency !== 'SAR' && (
                      <div className="text-xs text-slate-400">≈ SAR {balanceSAR.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Treasury Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'تحليلات الذكاء الاصطناعي للخزينة' : 'AI Treasury Insights'}</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">Live</span>
          </div>

          <div className="space-y-3">
            {aiInsights.map(insight => (
              <div
                key={insight.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{isAr ? insight.titleAr : insight.titleEn}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {insight.confidenceScore}% Score
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isAr ? insight.descriptionAr : insight.descriptionEn}
                </p>
                <div className="text-[11px] text-sky-400 font-semibold pt-1 border-t border-slate-700/60">
                  💡 {isAr ? insight.recommendedActionAr : insight.recommendedActionEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
