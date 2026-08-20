import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Send,
  Printer,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { CustomerInvoice, InvoiceStatus } from '../../../types/accountsReceivable';

export const InvoiceManagementWorkspace: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  // Status badge styling
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{isAr ? 'مدفوعة بالكامل' : 'Paid'}</span>;
      case 'PARTIALLY_PAID':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{isAr ? 'مدفوعة جزئياً' : 'Partially Paid'}</span>;
      case 'SENT':
      case 'ISSUED':
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">{isAr ? 'صادرة ومعتمدة' : 'Issued & Sent'}</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">{isAr ? 'مسودة' : 'Draft'}</span>;
      case 'CANCELLED':
      case 'VOIDED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{isAr ? 'ملغاة / باطلة' : 'Voided'}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{status}</span>;
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.poNumber && inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(snapshot => setInvoices(snapshot.invoices));
  }, []);

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    const { invoice, snapshot } = await AccountsReceivableClient.updateInvoiceStatus(
      id,
      newStatus,
      `Status updated to ${newStatus}`,
      `تعديل الحالة إلى ${newStatus}`,
      'AR Finance Officer'
    );
    setInvoices(snapshot.invoices);
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice({ ...invoice });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isAr ? 'بحث برقم الفاتورة، اسم العميل أو PO...' : 'Search invoice #, customer name, PO...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1 font-semibold">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            {isAr ? 'الحالة:' : 'Filter:'}
          </span>
          {['ALL', 'DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'VOIDED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedStatus === st
                  ? 'bg-sky-500 text-white font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {st === 'ALL' ? (isAr ? 'الكل' : 'All') : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-mono">
                <th className="p-3.5 min-w-[140px]">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                <th className="p-3.5 min-w-[200px]">{isAr ? 'اسم العميل' : 'Customer Account'}</th>
                <th className="p-3.5 min-w-[110px]">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                <th className="p-3.5 min-w-[110px]">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                <th className="p-3.5 min-w-[120px]">{isAr ? 'المبلغ الإجمالي' : 'Total Amount'}</th>
                <th className="p-3.5 min-w-[120px]">{isAr ? 'المتبقي' : 'Balance Due'}</th>
                <th className="p-3.5 min-w-[110px]">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3.5 min-w-[90px] text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition-all">
                  <td className="p-3.5 font-mono text-sky-400 font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{inv.invoiceNumber}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{isAr ? inv.customerNameAr : inv.customerNameEn}</div>
                    <div className="text-[10px] text-slate-400 font-mono">VAT: {inv.customerTaxNumber}</div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{inv.issueDate}</td>
                  <td className="p-3.5 font-mono text-slate-300">{inv.dueDate}</td>
                  <td className="p-3.5 font-mono font-bold text-white">
                    SAR {inv.totalAmountSAR.toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    SAR {inv.balanceDueSAR.toLocaleString()}
                  </td>
                  <td className="p-3.5">{getStatusBadge(inv.status)}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استعراض' : 'View'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal / Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-sky-400 font-bold">{selectedInvoice.series} • REVISION {selectedInvoice.revisionNumber}</div>
                <h3 className="text-xl font-extrabold text-white font-mono">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-400">{isAr ? selectedInvoice.customerNameAr : selectedInvoice.customerNameEn}</p>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedInvoice.status)}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Line Items Detail */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{isAr ? 'بنود الفاتورة' : 'Invoice Line Items'}</h4>
              <div className="bg-slate-800/60 rounded-xl p-3 divide-y divide-slate-700/60 text-xs">
                {selectedInvoice.lines.map((line, idx) => (
                  <div key={line.id} className="py-2.5 flex items-center justify-between font-mono">
                    <div>
                      <div className="font-semibold text-white">{isAr ? line.descriptionAr : line.descriptionEn}</div>
                      <div className="text-[10px] text-slate-400">Qty: {line.quantity} × SAR {line.unitPriceSAR.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">SAR {line.totalIncVatSAR.toLocaleString()}</div>
                      <div className="text-[10px] text-amber-400">VAT ({line.vatRatePercent}%): SAR {line.vatAmountSAR.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Financial Breakdown */}
            <div className="bg-slate-800/80 rounded-xl p-4 flex flex-wrap justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">{isAr ? 'المجموع قبل الضريبة:' : 'Subtotal:'} </span>
                <span className="text-slate-200 font-bold">SAR {selectedInvoice.subtotalSAR.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'إجمالي الضريبة:' : 'Total VAT:'} </span>
                <span className="text-amber-400 font-bold">SAR {selectedInvoice.totalVatSAR.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'المبلغ الإجمالي:' : 'Grand Total:'} </span>
                <span className="text-white font-extrabold">SAR {selectedInvoice.totalAmountSAR.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'المتبقي للسداد:' : 'Balance Due:'} </span>
                <span className="text-emerald-400 font-extrabold">SAR {selectedInvoice.balanceDueSAR.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions for Status Transition */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {selectedInvoice.status !== 'PAID' && (
                  <button
                    onClick={() => handleStatusChange(selectedInvoice.id, 'PAID')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isAr ? 'تسجيل كمدفوعة بالكامل' : 'Mark as Full Paid'}</span>
                  </button>
                )}
                {selectedInvoice.status !== 'VOIDED' && (
                  <button
                    onClick={() => handleStatusChange(selectedInvoice.id, 'VOIDED')}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isAr ? 'إلغاء الفاتورة (Void)' : 'Void Invoice'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة / PDF' : 'Print / Export PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
