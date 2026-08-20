import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Landmark,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { CashMovement } from '../../../types/treasury';

export const CashPositionView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(snapshot => setMovements(snapshot.cashMovements));
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesDir = filterDirection === 'ALL' || m.direction === filterDirection;
    const matchesSearch =
      m.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDir && matchesSearch;
  });

  const totalInflowSAR = movements
    .filter(m => m.direction === 'INFLOW')
    .reduce((acc, m) => acc + m.amountSAR, 0);

  const totalOutflowSAR = movements
    .filter(m => m.direction === 'OUTFLOW')
    .reduce((acc, m) => acc + m.amountSAR, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{isAr ? 'سجل وحركات السيولة النقدية اليومية' : 'Daily Cash Position & Movement Ledger'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'موقف السيولة، التدفقات النقدية الواردة والصادرة' : 'Real-time Cash Position, Liquidity Inflows & Outflows'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تتبع فوري لكافة التحويلات المصرفية، تسويات التجارة الإلكترونية، مدفوعات الموردين وحركات الخزينة' : 'Monitor all inbound remittances, vendor disbursements, Adyen settlements & treasury shifts.'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-emerald-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'إجمالي المقبوضات والتدفقات الواردة' : 'Total Inbound Cash (Inflows)'}</div>
          <div className="text-2xl font-extrabold text-emerald-400">
            SAR {totalInflowSAR.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحويلات العملاء وتسويات أدين' : 'Customer Wires & Adyen Cleared'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-rose-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'إجمالي المدفوعات والتدفقات الصادرة' : 'Total Outbound Cash (Outflows)'}</div>
          <div className="text-2xl font-extrabold text-rose-400">
            SAR {totalOutflowSAR.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-300 font-semibold flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{isAr ? 'مدفوعات الموردين وعقود الشحن' : 'Supplier Batches & Freight Wires'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-sky-500">
          <div className="text-[11px] text-slate-400">{isAr ? 'صافي التدفق النقدي التشغيلي' : 'Net Operating Cash Flow'}</div>
          <div className="text-2xl font-extrabold text-sky-400">
            SAR {(totalInflowSAR - totalOutflowSAR).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">Positive Cash Surplus</div>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {(['ALL', 'INFLOW', 'OUTFLOW'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => setFilterDirection(dir)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  filterDirection === dir
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {dir === 'ALL' ? (isAr ? 'جميع الحركات' : 'All Movements') : dir}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث بالمرجع أو الوصف...' : 'Search ref or description...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* Cash Movements Ledger */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'تاريخ الحركة' : 'Date'}</th>
                <th className="p-3">{isAr ? 'رقم المرجع' : 'Reference'}</th>
                <th className="p-3">{isAr ? 'الحساب المصرفي' : 'Bank Account'}</th>
                <th className="p-3">{isAr ? 'الطرف المقابل / التفاصيل' : 'Counterparty & Description'}</th>
                <th className="p-3">{isAr ? 'الفئة' : 'Category'}</th>
                <th className="p-3">{isAr ? 'المبلغ (العملة الأصلية)' : 'Original Amount'}</th>
                <th className="p-3">{isAr ? 'المبلغ (SAR)' : 'Equivalent SAR'}</th>
                <th className="p-3">{isAr ? 'مطابق' : 'Reconciled'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMovements.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/50">
                  <td className="p-3 text-slate-400">{m.movementDate}</td>
                  <td className="p-3 text-sky-400 font-bold">{m.referenceNumber}</td>
                  <td className="p-3 text-white truncate max-w-[150px]">{m.accountNameEn}</td>
                  <td className="p-3 space-y-0.5">
                    <div className="font-bold text-white">{m.counterpartyName}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[220px]">{isAr ? m.descriptionAr : m.descriptionEn}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">
                    {m.currency} {m.amount.toLocaleString()}
                  </td>
                  <td className={`p-3 font-bold ${m.direction === 'INFLOW' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.direction === 'INFLOW' ? '+' : '-'} SAR {m.amountSAR.toLocaleString()}
                  </td>
                  <td className="p-3">
                    {m.reconciled ? (
                      <span className="text-emerald-400 text-[10px] font-bold">✓ Reconciled</span>
                    ) : (
                      <span className="text-amber-400 text-[10px] font-bold">● Pending</span>
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
