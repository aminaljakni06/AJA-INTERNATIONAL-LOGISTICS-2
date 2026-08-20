import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Landmark,
  Zap,
  DollarSign,
  PieChart,
  BarChart3,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient, TreasurySnapshot } from '../../../services/treasuryClient';

export const ExecutiveTreasuryDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [snapshot, setSnapshot] = useState<TreasurySnapshot | null>(null);

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(setSnapshot);
  }, []);

  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل لوحة الخزينة التنفيذية...' : 'Loading executive treasury dashboard...'}
      </div>
    );
  }

  const { metrics, bankAccounts: accounts } = snapshot;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'لوحة قيادة الخزينة والسيولة للإدارة التنفيذية' : 'Executive Treasury & C-Suite Liquidity Cockpit'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'المؤشرات المالية الاستراتيجية، إدارة مخاطر البنوك والدورة النقدية' : 'Executive Financial Health, Bank Risk Exposure & Cash Conversion Cycle (CCC)'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'رؤية شاملة لأداء الخزينة، توزيع السيولة بين البنوك، ونسب كفاية رأس المال والتغطية' : 'C-level synthesis of counterparty banking risks, liquidity ratios & treasury yields.'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-sky-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'إجمالي الأصول النقدية' : 'Total Treasury Assets'}</div>
          <div className="text-2xl font-extrabold text-white">SAR {(metrics.totalCashSAR / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-emerald-400">100% Fully Liquified</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-emerald-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'دورة التحويل النقدي (CCC)' : 'Cash Conversion Cycle (CCC)'}</div>
          <div className="text-2xl font-extrabold text-emerald-400">18.4 {isAr ? 'يوم' : 'Days'}</div>
          <div className="text-[10px] text-emerald-300">Top-Tier Efficiency (-3.2 days vs Q3)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-amber-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'متوسط عائد استثمارات الصكوك' : 'Avg Treasury Yield'}</div>
          <div className="text-2xl font-extrabold text-amber-400">6.02% p.a.</div>
          <div className="text-[10px] text-amber-300">Outperforming SAIBOR +75 bps</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-blue-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'نسبة تغطية السيولة السريعة' : 'Liquidity Coverage Ratio'}</div>
          <div className="text-2xl font-extrabold text-blue-400">385%</div>
          <div className="text-[10px] text-emerald-400">Basel III Compliant (&gt;100%)</div>
        </div>
      </div>

      {/* Counterparty Risk Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span>{isAr ? 'توزيع المخاطر والسيولة على البنوك المعتمدة (Bank Counterparty Allocation)' : 'Counterparty Bank Risk & Cash Concentration Matrix'}</span>
          <span className="text-xs text-sky-400">Risk Policy: Max 50% per Single Institution</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => {
            const fx = acc.currency === 'USD' ? 3.75 : acc.currency === 'EUR' ? 4.08 : 1;
            const balanceSAR = acc.currentBalance * fx;
            const sharePercent = (balanceSAR / metrics.totalCashSAR) * 100;

            return (
              <div key={acc.id} className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{isAr ? acc.bankNameAr : acc.bankNameEn}</span>
                  <span className="text-sky-400 font-bold text-xs">{sharePercent.toFixed(1)}% {isAr ? 'من السيولة' : 'Share'}</span>
                </div>

                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${sharePercent}%` }} />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>IBAN: {acc.iban}</span>
                  <span className="text-emerald-400 font-bold">SAR {balanceSAR.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
