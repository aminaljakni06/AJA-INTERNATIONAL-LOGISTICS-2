import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  CreditCard,
  Building2,
  FileText,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { FinancialSettlement } from '../../../types/treasury';

export const FinancialSettlementView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [settlements, setSettlements] = useState<FinancialSettlement[]>([]);

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(snapshot => setSettlements(snapshot.financialSettlements));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'منظومة التسويات المالية ومقاصة البوابات' : 'Financial Settlement & Merchant Gateway Clearing Platform'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تسويات أدين، الحوالات المصرفية ومقاصة المستحقات' : 'Adyen Merchant Gateway Clearing, Banking Settlements & GL Matching'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تصفية وتسوية الإيرادات والرسوم الاقتطاعية من بوابات الدفع وحسابات ساريه وسويفت' : 'Reconcile gross card settlements, Adyen gateway processing fees, SARIE transfers & GL journals.'}
          </p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span>{isAr ? 'سجل التسويات المالية والربط مع دفتر اليومية' : 'Financial Settlement Ledger'}</span>
          <span className="text-xs text-sky-400">{settlements.length} Records</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'تاريخ التسوية' : 'Settlement Date'}</th>
                <th className="p-3">{isAr ? 'مرجع التسوية' : 'Reference'}</th>
                <th className="p-3">{isAr ? 'نوع التسوية والقناة' : 'Type & Channel'}</th>
                <th className="p-3">{isAr ? 'المبلغ الإجمالي (Gross)' : 'Gross (SAR)'}</th>
                <th className="p-3">{isAr ? 'الرسوم الاقتطاعية' : 'Fees (SAR)'}</th>
                <th className="p-3">{isAr ? 'الصافي المسلم (Net)' : 'Net Amount (SAR)'}</th>
                <th className="p-3">{isAr ? 'مرجع قيد اليومية' : 'Matched Journal Ref'}</th>
                <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {settlements.map(set => (
                <tr key={set.id} className="hover:bg-slate-800/50">
                  <td className="p-3 text-slate-400">{set.settlementDate}</td>
                  <td className="p-3 font-bold text-sky-400">{set.settlementRef}</td>
                  <td className="p-3 text-white">
                    <span className="font-bold">{set.type}</span> • {set.channel}
                  </td>
                  <td className="p-3 text-white font-bold">SAR {set.grossAmountSAR.toLocaleString()}</td>
                  <td className="p-3 text-amber-400">SAR {set.feeAmountSAR.toLocaleString()}</td>
                  <td className="p-3 text-emerald-400 font-extrabold">SAR {set.netAmountSAR.toLocaleString()}</td>
                  <td className="p-3 text-sky-400">{set.matchedJournalId || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ {set.status}
                    </span>
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
