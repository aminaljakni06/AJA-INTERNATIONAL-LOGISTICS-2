import React from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { SupplierInvoice } from '../../../types/procurement';

interface SupplierInvoicesViewProps {
  invoices: SupplierInvoice[];
  isAr: boolean;
  onOpenOCR: () => void;
  onOpenAddInvoice: () => void;
  onRun3WayMatch: (invoice: SupplierInvoice) => void;
}

export const SupplierInvoicesView: React.FC<SupplierInvoicesViewProps> = ({
  invoices,
  isAr,
  onOpenOCR,
  onOpenAddInvoice,
  onRun3WayMatch
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.poNumber && inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_PAID':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'APPROVED_FOR_PAYMENT':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'MATCHED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'UNDER_MATCHING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DISCREPANCY_HOLD':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const totalInvoicedSAR = invoices.reduce((acc, i) => acc + i.totalAmountSAR, 0);
  const totalPaidSAR = invoices.reduce((acc, i) => acc + i.paidAmountSAR, 0);
  const totalRemainingSAR = invoices.reduce((acc, i) => acc + i.remainingBalanceSAR, 0);

  return (
    <div className="space-y-6">
      {/* HEADER BAR & SUMMARY METRICS */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'إدارة فواتير الموردين والمسح الضوئي (Supplier Invoice Management & OCR)' : 'Supplier Invoices & OCR Capture'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'استلام وتدقيق فواتير الموردين عبر الـ OCR الإلكتروني مع التحقق من الهيئة العامة للزكاة والدخل (ZATCA Phase 2)'
                : 'Import, scan, and validate e-invoices with automatic ZATCA VAT compliance and line item breakdown'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenOCR}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isAr ? 'مسح ضوئي ذكي (AI OCR Invoice)' : 'Scan AI OCR Invoice'}</span>
            </button>
            <button
              onClick={onOpenAddInvoice}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'إدخال يدوي لفاتورة' : 'Manual Invoice Entry'}</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي قيم الفواتير المستلمة' : 'Total Invoiced SAR'}</span>
            <span className="font-mono font-bold text-white text-base">
              {totalInvoicedSAR.toLocaleString()} SAR
            </span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي المبالغ المسددة' : 'Total Paid SAR'}</span>
            <span className="font-mono font-bold text-emerald-400 text-base">
              {totalPaidSAR.toLocaleString()} SAR
            </span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'رصيد الذمم المتبقية' : 'Outstanding Liabilities'}</span>
            <span className="font-mono font-bold text-amber-300 text-base">
              {totalRemainingSAR.toLocaleString()} SAR
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder={isAr ? 'بحث برقم الفاتورة، اسم المورد، أو PO...' : 'Search Invoice #, Vendor, PO...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="UNDER_MATCHING">UNDER_MATCHING</option>
            <option value="MATCHED">MATCHED</option>
            <option value="APPROVED_FOR_PAYMENT">APPROVED_FOR_PAYMENT</option>
            <option value="DISCREPANCY_HOLD">DISCREPANCY_HOLD</option>
            <option value="FULLY_PAID">FULLY_PAID</option>
          </select>
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
              <tr>
                <th className="p-4">{isAr ? 'رقم الفاتورة / المورد' : 'Invoice # / Vendor'}</th>
                <th className="p-4">{isAr ? 'أمر الشراء / الاستلام' : 'PO / GRN Reference'}</th>
                <th className="p-4">{isAr ? 'قناة القراءة' : 'Capture Channel'}</th>
                <th className="p-4">{isAr ? 'التاريخ والاستحقاق' : 'Dates'}</th>
                <th className="p-4">{isAr ? 'مبلغ الضريبة (VAT 15%)' : 'VAT 15%'}</th>
                <th className="p-4">{isAr ? 'الإجمالي شامل الضريبة' : 'Total Amount'}</th>
                <th className="p-4">{isAr ? 'حالة ZATCA' : 'ZATCA Status'}</th>
                <th className="p-4">{isAr ? 'حالة الفاتورة' : 'Invoice Status'}</th>
                <th className="p-4 text-center">{isAr ? 'الإجراء المالي' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white text-sm">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{inv.supplierName}</span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    <div className="text-sky-300">{inv.poNumber || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400">{inv.grnReference || 'No GRN'}</div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-purple-300 border border-slate-700">
                      {inv.captureChannel}
                    </span>
                  </td>

                  <td className="p-4 text-slate-300 text-[11px]">
                    <div>{isAr ? 'التاريخ:' : 'Date:'} {inv.invoiceDate}</div>
                    <div className="text-amber-300 font-mono">{isAr ? 'الاستحقاق:' : 'Due:'} {inv.dueDate}</div>
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    {inv.vatAmountSAR.toLocaleString()} SAR
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                    {inv.totalAmountSAR.toLocaleString()} SAR
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                      inv.zatcaComplianceStatus === 'PASSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      <span>ZATCA {inv.zatcaComplianceStatus || 'PASSED'}</span>
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => onRun3WayMatch(inv)}
                      className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'المطابقة الثلاثية' : '3-Way Match'}</span>
                    </button>
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
