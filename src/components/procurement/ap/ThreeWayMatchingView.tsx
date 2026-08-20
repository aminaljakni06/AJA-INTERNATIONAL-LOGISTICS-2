import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldAlert,
  Sliders,
  RefreshCw,
  Building2,
  DollarSign
} from 'lucide-react';
import { SupplierInvoice, ThreeWayMatchResult } from '../../../types/procurement';

interface ThreeWayMatchingViewProps {
  invoices: SupplierInvoice[];
  isAr: boolean;
  onRunMatch: (invoice: SupplierInvoice) => void;
}

export const ThreeWayMatchingView: React.FC<ThreeWayMatchingViewProps> = ({
  invoices,
  isAr,
  onRunMatch
}) => {
  const [toleranceLimit, setToleranceLimit] = React.useState<number>(2.0);

  const matchedInvoicesCount = invoices.filter(i => i.threeWayMatch?.matchPassed).length;
  const mismatchInvoicesCount = invoices.filter(i => i.status === 'DISCREPANCY_HOLD' || i.matchingStatus === 'PRICE_MISMATCH').length;
  const pendingMatchingCount = invoices.filter(i => i.matchingStatus === 'PENDING' || i.status === 'UNDER_MATCHING').length;

  return (
    <div className="space-y-6">
      {/* CONTROL & TOLERANCE BANNER */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-sky-400" />
              <span>{isAr ? 'محرك المطابقة الثلاثية الآلي (Three-Way Matching Engine)' : 'Three-Way Matching Engine'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'مطابقة بنود وأسعار وقيم أمر الشراء (PO) وسند استلام المستودع (GRN) وفاتورة المورد تلقائياً'
                : 'Automated alignment between Purchase Orders (PO), Goods Receipts (GRN), and Supplier Invoices'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <Sliders className="w-4 h-4 text-amber-400" />
            <label className="text-xs text-slate-300 font-bold">{isAr ? 'نسبة التسامح المسموح بها:' : 'Allowed Tolerance:'}</label>
            <select
              value={toleranceLimit}
              onChange={e => setToleranceLimit(Number(e.target.value))}
              className="bg-slate-900 text-amber-300 font-mono font-bold text-xs p-1.5 rounded-lg border border-slate-700 focus:outline-none"
            >
              <option value={0.5}>0.5% Exact Tight</option>
              <option value={1.5}>1.5% Standard ERP</option>
              <option value={2.0}>2.0% Default Enterprise</option>
              <option value={3.0}>3.0% Flexible Logistics</option>
            </select>
          </div>
        </div>

        {/* MATCH STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{isAr ? 'فواتير مطابقة ومسندة' : 'Passed & Matched'}</span>
              <span className="font-mono font-bold text-emerald-400 text-base">{matchedInvoicesCount} Invoices</span>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-400 opacity-80" />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{isAr ? 'فروقات معلقة للمراجعة' : 'Discrepancies on Hold'}</span>
              <span className="font-mono font-bold text-rose-400 text-base">{mismatchInvoicesCount} Invoices</span>
            </div>
            <ShieldAlert className="w-6 h-6 text-rose-400 opacity-80" />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{isAr ? 'قيد المطابقة والتدقيق' : 'Pending Matching'}</span>
              <span className="font-mono font-bold text-amber-300 text-base">{pendingMatchingCount} Invoices</span>
            </div>
            <RefreshCw className="w-6 h-6 text-amber-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* MATCHING CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoices.map(inv => {
          const match = inv.threeWayMatch;
          const isPassed = match?.matchPassed;

          return (
            <div
              key={inv.id}
              className={`bg-slate-900/90 p-6 rounded-2xl border space-y-4 shadow-xl ${
                isPassed
                  ? 'border-slate-800 hover:border-emerald-500/50'
                  : 'border-rose-900/50 bg-slate-900/95'
              }`}
            >
              {/* CARD HEADER */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {inv.invoiceNumber} • {inv.supplierName}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isAr ? 'أمر الشراء:' : 'PO:'} {inv.poNumber || 'N/A'}</span>
                    <span className="text-slate-600">|</span>
                    <span>{isAr ? 'سند الاستلام:' : 'GRN:'} {inv.grnReference || 'N/A'}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isPassed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : inv.status === 'DISCREPANCY_HOLD'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isPassed ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  <span>{inv.matchingStatus}</span>
                </span>
              </div>

              {/* COMPARISON MATRIX (PO vs GRN vs INVOICE) */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي PO' : 'PO Total'}</span>
                  <span className="font-mono font-bold text-sky-300">
                    {(match?.poTotalSAR || inv.totalAmountSAR).toLocaleString()} SAR
                  </span>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'استلام المستودع GRN' : 'GRN Received'}</span>
                  <span className="font-mono font-bold text-purple-300">
                    {(match?.grnTotalSAR || inv.totalAmountSAR).toLocaleString()} SAR
                  </span>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'مبلغ الفاتورة' : 'Invoice Total'}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {inv.totalAmountSAR.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* VARIANCE DETAILS */}
              {match && (
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{isAr ? 'نسبة الانحراف السعري:' : 'Price Variance:'}</span>
                    <span className={`font-mono font-bold ${match.priceVariancePercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {match.priceVariancePercent > 0 ? `+${match.priceVariancePercent}%` : `${match.priceVariancePercent}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans italic border-t border-slate-800/60 pt-1.5">
                    "{match.discrepancyNotes}"
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  onClick={() => onRunMatch(inv)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تشغيل فحص المطابقة' : 'Re-Run Match Test'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
