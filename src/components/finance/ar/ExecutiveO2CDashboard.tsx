import React, { useEffect, useState } from 'react';
import {
  Award,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Clock,
  Building2,
  CheckCircle2,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient, AccountsReceivableSnapshot } from '../../../services/accountsReceivableClient';

export const ExecutiveO2CDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [snapshot, setSnapshot] = useState<AccountsReceivableSnapshot | null>(null);

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(setSnapshot);
  }, []);

  const handleApproveWriteOff = async (id: string) => {
    const { snapshot: nextSnapshot } = await AccountsReceivableClient.approveWriteOff(id, 'Chief Financial Officer (CFO)');
    setSnapshot(nextSnapshot);
  };

  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل مؤشرات O2C...' : 'Loading O2C dashboard...'}
      </div>
    );
  }

  const { badDebtProvisions: provisions } = snapshot;

  return (
    <div className="space-y-6">
      {/* C-Suite Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'مقصورة الإدارة التنفيذية لدورة الطلب إلى النقد' : 'C-Suite Order-to-Cash (O2C) Cockpit'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مؤشرات الأداء التنفيذي لدورة O2C وتوقعات التدفقات النقدية' : 'Executive O2C KPIs, Cash Conversion Cycle & Adyen Settlement Sync'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'قياس كفاءة دورة النقدية، المبالغ المستردة عبر بوابة Adyen ومخصصات الديون المشكوك فيها' : 'Executive financial metrics, Adyen gateway reconciliation, cash conversion cycle & bad debt controls.'}
          </p>
        </div>
      </div>

      {/* C-Suite Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[11px] text-slate-400">{isAr ? 'دورة تحويل النقدية (CCC)' : 'Cash Conversion Cycle'}</div>
          <div className="text-2xl font-extrabold text-emerald-400">22 Days</div>
          <div className="text-[10px] text-emerald-400 font-semibold">↑ 4 Days faster than target</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[11px] text-slate-400">{isAr ? 'تسويات بوابات Adyen القائمة' : 'Adyen Gateway Sync'}</div>
          <div className="text-2xl font-extrabold text-sky-400">SAR 189,750</div>
          <div className="text-[10px] text-emerald-400 font-semibold">100% Reconciled</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[11px] text-slate-400">{isAr ? 'توقع التحصيل لشهر فبراير' : 'Feb Cash Forecast'}</div>
          <div className="text-2xl font-extrabold text-blue-400">SAR 1.18M</div>
          <div className="text-[10px] text-blue-300 font-semibold">High Confidence Model</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-[11px] text-slate-400">{isAr ? 'نسبة الديون المشكوك فيها' : 'Bad Debt Provision Ratio'}</div>
          <div className="text-2xl font-extrabold text-amber-400">0.8%</div>
          <div className="text-[10px] text-emerald-400 font-semibold">Below 1.5% Industry Cap</div>
        </div>
      </div>

      {/* Bad Debt Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'مخصصات الديون المشكوك فيها والشطب المعياري (IFRS 9 ECL)' : 'Bad Debt Provisions & Write-Off Approvals (IFRS 9)'}</span>
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'العميل' : 'Customer Account'}</th>
                <th className="p-3">{isAr ? 'رقم الفاتورة' : 'Invoice Ref'}</th>
                <th className="p-3">{isAr ? 'مبلغ الفاتورة' : 'Invoice Amount'}</th>
                <th className="p-3">{isAr ? 'نسبة المخصص' : 'Provision %'}</th>
                <th className="p-3">{isAr ? 'قيمة المخصص' : 'Provision SAR'}</th>
                <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3 text-center">{isAr ? 'إجراء اعتماد الشطب' : 'Approval Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {provisions.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-white">{p.customerNameEn}</td>
                  <td className="p-3 text-sky-400">{p.invoiceNumber}</td>
                  <td className="p-3 text-white">SAR {p.invoiceAmountSAR.toLocaleString()}</td>
                  <td className="p-3 text-amber-400">{p.provisionPercent}%</td>
                  <td className="p-3 text-rose-400 font-bold">SAR {p.provisionAmountSAR.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {p.status === 'PROVISIONED' ? (
                      <button
                        onClick={() => handleApproveWriteOff(p.id)}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-all"
                      >
                        {isAr ? 'اعتماد الشطب (CFO Approval)' : 'Approve Write-Off'}
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[10px] font-bold">✓ Approved by {p.approvedBy}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
