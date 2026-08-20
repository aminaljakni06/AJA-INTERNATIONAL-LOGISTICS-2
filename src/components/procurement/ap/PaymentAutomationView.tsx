import React from 'react';
import {
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  ShieldCheck,
  Percent,
  Plus
} from 'lucide-react';
import { SupplierInvoice, APPaymentRun, PaymentRunMethod } from '../../../types/procurement';

interface PaymentAutomationViewProps {
  invoices: SupplierInvoice[];
  paymentRuns: APPaymentRun[];
  isAr: boolean;
  onExecutePaymentRun: (selectedIds: string[], method: PaymentRunMethod) => void;
}

export const PaymentAutomationView: React.FC<PaymentAutomationViewProps> = ({
  invoices,
  paymentRuns,
  isAr,
  onExecutePaymentRun
}) => {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = React.useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentRunMethod>('ADYEN_GATEWAY');

  const approvedForPaymentInvoices = invoices.filter(i => i.status === 'APPROVED_FOR_PAYMENT');

  const toggleSelectInvoice = (id: string) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter(i => i !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  const selectAllApproved = () => {
    if (selectedInvoiceIds.length === approvedForPaymentInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(approvedForPaymentInvoices.map(i => i.id));
    }
  };

  const selectedTotalSAR = invoices
    .filter(i => selectedInvoiceIds.includes(i.id))
    .reduce((acc, i) => acc + i.remainingBalanceSAR, 0);

  const estimatedEarlyDiscountSavingsSAR = selectedTotalSAR * 0.01; // 1% early payment discount opportunity

  return (
    <div className="space-y-6">
      {/* HEADER & PAYMENT RUN BUILDER */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'جدولة وأتمتة المدفوعات وبوابة Adyen (AP Payment Automation)' : 'Payment Scheduling & Adyen Execution'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'إعداد الدفعات الجماعية، الاستفادة من خصومات السداد المبكر، والربط الفوري مع بوابة Adyen والحوالات البنكية'
                : 'Batch payment run execution, early payment discount optimization, and direct Adyen API settlement'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={selectedInvoiceIds.length === 0}
              onClick={() => onExecutePaymentRun(selectedInvoiceIds, paymentMethod)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                selectedInvoiceIds.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 cursor-pointer shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {isAr
                  ? `تنفيذ دفعة سداد (${selectedInvoiceIds.length}) بقيمة ${selectedTotalSAR.toLocaleString()} ر.س`
                  : `Execute Payment Run (${selectedInvoiceIds.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* METHOD SELECTION & DISCOUNT SAVINGS BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'وسيلة السداد المحددة' : 'Selected Payment Gateway'}</span>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="bg-slate-900 text-emerald-300 font-bold p-1.5 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="ADYEN_GATEWAY">Adyen Corporate Gateway (Instant)</option>
                <option value="BANK_TRANSFER">KSA Real-Time Bank Transfer (SARIE)</option>
                <option value="CORPORATE_CHECK">Corporate Check / Draft</option>
              </select>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400 opacity-80" />
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{isAr ? 'وفر خصم السداد المبكر المتوقع' : 'Early Payment Discount Savings'}</span>
              <span className="font-mono font-bold text-amber-300 text-base">
                {estimatedEarlyDiscountSavingsSAR.toLocaleString()} SAR
              </span>
            </div>
            <Percent className="w-6 h-6 text-amber-400 opacity-80" />
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-sky-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{isAr ? 'الفواتير المعمدة للصرف' : 'Ready Approved Invoices'}</span>
              <span className="font-mono font-bold text-sky-300 text-base">{approvedForPaymentInvoices.length} Invoices</span>
            </div>
            <CheckCircle className="w-6 h-6 text-sky-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* APPROVED INVOICES SELECTABLE TABLE */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3 p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'الفواتير المعتمدة الجاهزة للإدراج بالدفعة' : 'Approved Invoices Ready for Payment Run'}</span>
          </h3>

          <button
            onClick={selectAllApproved}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
          >
            {selectedInvoiceIds.length === approvedForPaymentInvoices.length
              ? (isAr ? 'إلغاء تحديد الكل' : 'Deselect All')
              : (isAr ? 'تحديد كل المعمد' : 'Select All Approved')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
              <tr>
                <th className="p-3 text-center">#</th>
                <th className="p-3">{isAr ? 'الفاتورة / المورد' : 'Invoice / Supplier'}</th>
                <th className="p-3">{isAr ? 'أمر الشراء' : 'PO Reference'}</th>
                <th className="p-3">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                <th className="p-3">{isAr ? 'شروط الدفع' : 'Payment Terms'}</th>
                <th className="p-3">{isAr ? 'المبلغ المستحق' : 'Amount Due'}</th>
                <th className="p-3 text-center">{isAr ? 'اختيار' : 'Select'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {approvedForPaymentInvoices.map(inv => {
                const isSelected = selectedInvoiceIds.includes(inv.id);

                return (
                  <tr
                    key={inv.id}
                    onClick={() => toggleSelectInvoice(inv.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="p-3 font-mono font-bold text-white">
                      <div>{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans font-normal">{inv.supplierName}</div>
                    </td>

                    <td className="p-3 font-mono text-sky-300">{inv.poNumber || 'N/A'}</td>

                    <td className="p-3 font-mono text-amber-300">{inv.dueDate}</td>

                    <td className="p-3 font-mono text-slate-300">{inv.paymentTerms}</td>

                    <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                      {inv.remainingBalanceSAR.toLocaleString()} SAR
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected ? (isAr ? 'محدد' : 'Selected') : (isAr ? 'إدراج' : 'Include')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT PAYMENT RUNS EXECUTED */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>{isAr ? 'سجل دفعات السداد المنفذة والـ Payment Runs' : 'Executed Payment Runs Log'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentRuns.map(prun => (
            <div key={prun.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-purple-300 font-bold">{prun.paymentRunNumber}</span>
                  <div className="text-xs text-slate-300 font-bold">{prun.initiatedBy}</div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  prun.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {prun.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">{isAr ? 'إجمالي المحول SAR' : 'Total Amount'}</span>
                  <span className="font-bold text-emerald-400 text-sm">{prun.totalPaymentAmountSAR.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">{isAr ? 'مرجع Gateway' : 'Gateway Ref'}</span>
                  <span className="text-sky-300 text-[11px]">{prun.adyenPaymentRef || prun.paymentMethod}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
