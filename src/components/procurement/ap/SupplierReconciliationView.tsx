import React from 'react';
import {
  FileSpreadsheet,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileCheck,
  Search,
  Plus
} from 'lucide-react';
import { SupplierReconciliationStatement } from '../../../types/procurement';

interface SupplierReconciliationViewProps {
  reconciliations: SupplierReconciliationStatement[];
  isAr: boolean;
}

export const SupplierReconciliationView: React.FC<SupplierReconciliationViewProps> = ({
  reconciliations,
  isAr
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = reconciliations.filter(rec =>
    rec.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.statementNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-400" />
              <span>{isAr ? 'مطابقة كشوف حسابات الموردين (Supplier Account Reconciliation)' : 'Supplier Account Reconciliation'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'مطابقة الأرصدة الدائنة بين دفتر الأستاذ في أجا ERP ودفعات وكشوف حسابات الموردين لتسوية الفروقات'
                : 'Audit supplier ledger balances, reconcile period statements, and confirm zero-discrepancy balances'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مصادقة رصيد جديدة' : 'New Reconciliation Statement'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECONCILIATIONS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(rec => {
          const isBalanced = rec.discrepancyAmountSAR === 0;

          return (
            <div key={rec.id} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{rec.statementNumber}</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white mt-0.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{rec.supplierName}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isBalanced
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {rec.reconciliationStatus}
                </span>
              </div>

              {/* PERIOD DATES */}
              <div className="text-xs text-slate-400 font-mono">
                {isAr ? 'فترة المطابقة:' : 'Period:'} {rec.periodStartDate} {isAr ? 'إلى' : 'to'} {rec.periodEndDate}
              </div>

              {/* COMPARISON MATRIX */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'رصيد الفواتير Total Invoiced' : 'Total Invoiced'}</span>
                  <span className="font-mono font-bold text-sky-300">{rec.totalInvoicedSAR.toLocaleString()} SAR</span>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي المدفوع Total Paid' : 'Total Paid'}</span>
                  <span className="font-mono font-bold text-emerald-400">{rec.totalPaidSAR.toLocaleString()} SAR</span>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'مقدار الفرق' : 'Discrepancy'}</span>
                  <span className={`font-mono font-bold ${isBalanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {rec.discrepancyAmountSAR.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* NOTES */}
              {rec.notes && (
                <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-300 italic border border-slate-800">
                  "{rec.notes}"
                </div>
              )}

              {/* AUDIT ACTIONS */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800 text-slate-400">
                <span>{isAr ? 'مسؤول التسوية:' : 'Auditor:'} <strong className="text-white">{rec.reconciledBy}</strong></span>
                <span className="font-mono text-[10px]">{rec.reconciledAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
