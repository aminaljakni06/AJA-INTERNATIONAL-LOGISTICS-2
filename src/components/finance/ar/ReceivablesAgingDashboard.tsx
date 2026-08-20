import React, { useEffect, useState } from 'react';
import {
  Clock,
  BarChart3,
  Layers,
  ArrowUpRight,
  User,
  Filter,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient, AccountsReceivableSnapshot } from '../../../services/accountsReceivableClient';

export const ReceivablesAgingDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [snapshot, setSnapshot] = useState<AccountsReceivableSnapshot | null>(null);

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(setSnapshot);
  }, []);

  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل أعمار الديون...' : 'Loading receivables aging...'}
      </div>
    );
  }

  const { analytics } = snapshot;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'مصفوفة أعمار الديون والمستحقات الماليّة' : 'Receivables Aging & DSO Analytics'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تحليل الفترات الزمنية للديون القائمة (Aging Portfolio Matrix)' : 'Receivables Aging Buckets & Customer Credit Exposure'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تصنيف الديون حسب فترات التأخير 0-30، 31-60، 61-90، وأكثر من 90 يوماً مع تحليلات DSO' : 'Categorization of outstanding balances by age buckets (Current, 30, 60, 90+ days) and DSO metrics.'}
          </p>
        </div>
      </div>

      {/* Aging Buckets Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
        {/* Bucket 1: Current (0-30 Days) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 border-t-4 border-t-emerald-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'جارية (0 - 30 يوم)' : 'Current (0-30 Days)'}</div>
          <div className="text-xl font-extrabold text-emerald-400">
            SAR {analytics.currentReceivablesSAR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">38% {isAr ? 'من إجمالي المحفظة' : 'of Portfolio'}</div>
        </div>

        {/* Bucket 2: Overdue 31-60 Days */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 border-t-4 border-t-sky-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'متأخرة (31 - 60 يوم)' : 'Overdue (31-60 Days)'}</div>
          <div className="text-xl font-extrabold text-sky-400">
            SAR {analytics.overdue1_30SAR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">30% {isAr ? 'من إجمالي المحفظة' : 'of Portfolio'}</div>
        </div>

        {/* Bucket 3: Overdue 61-90 Days */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 border-t-4 border-t-amber-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'متأخرة (61 - 90 يوم)' : 'Overdue (61-90 Days)'}</div>
          <div className="text-xl font-extrabold text-amber-400">
            SAR {analytics.overdue31_60SAR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">12% {isAr ? 'من إجمالي المحفظة' : 'of Portfolio'}</div>
        </div>

        {/* Bucket 4: Overdue 90+ Days */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 border-t-4 border-t-rose-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'حرجة (أكثر من 90 يوم)' : 'Critical (90+ Days)'}</div>
          <div className="text-xl font-extrabold text-rose-400">
            SAR {analytics.overdue90PlusSAR.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">20% {isAr ? 'من إجمالي المحفظة' : 'of Portfolio'}</div>
        </div>

        {/* DSO Metric Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 border-t-4 border-t-blue-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'معدل أيام التحصيل (DSO)' : 'DSO Portfolio Metric'}</div>
          <div className="text-xl font-extrabold text-blue-400">
            {analytics.dsoDays} {isAr ? 'أيام' : 'Days'}
          </div>
          <div className="text-[10px] text-emerald-400">Target: 35 Days</div>
        </div>
      </div>

      {/* Customer Aging Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span>{isAr ? 'جدول توزيع أعمار الديون لكل عميل' : 'Customer Aging Ledger Breakdown'}</span>
          <span className="text-xs text-sky-400 font-normal">Base Currency: SAR</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'اسم العميل' : 'Customer Account'}</th>
                <th className="p-3">{isAr ? '0-30 يوم' : '0-30 Days'}</th>
                <th className="p-3">{isAr ? '31-60 يوم' : '31-60 Days'}</th>
                <th className="p-3">{isAr ? '61-90 يوم' : '61-90 Days'}</th>
                <th className="p-3">{isAr ? '90+ يوم' : '90+ Days'}</th>
                <th className="p-3">{isAr ? 'إجمالي الديون' : 'Total Balance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">SABIC Petrochemicals Co.</td>
                <td className="p-3 text-emerald-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 font-bold text-emerald-400">SAR 0 (Paid)</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">Panda Retail Group KSA</td>
                <td className="p-3 text-emerald-400">SAR 148,400</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 font-bold text-white">SAR 148,400</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">Almarai Logistics Division</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-sky-400 font-bold">SAR 368,000</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 font-bold text-amber-400">SAR 368,000</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">Landmark Retail Dubai FZCO</td>
                <td className="p-3 text-emerald-400">SAR 145,000</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 text-slate-400">SAR 0</td>
                <td className="p-3 font-bold text-white">SAR 145,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
