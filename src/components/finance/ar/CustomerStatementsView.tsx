import React, { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  Send,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { CustomerStatement } from '../../../types/accountsReceivable';

export const CustomerStatementsView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-101');
  const [periodStart, setPeriodStart] = useState<string>('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-02-28');
  const [sentNotice, setSentNotice] = useState<boolean>(false);
  const [statement, setStatement] = useState<CustomerStatement | null>(null);

  useEffect(() => {
    void AccountsReceivableClient.getCustomerStatement(selectedCustomerId, periodStart, periodEnd).then(setStatement);
  }, [selectedCustomerId, periodStart, periodEnd]);

  const handleSendStatementEmail = () => {
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3500);
  };

  if (!statement) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل كشف الحساب...' : 'Loading customer statement...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isAr ? 'كشوف حسابات العملاء' : 'Customer Account Statements Engine'}</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isAr ? 'كشف الحساب التفصيلي والمستحقات المفتوحة' : 'Detailed Customer Statement & Ledger Running Balance'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة الكشف PDF' : 'Print Statement'}</span>
            </button>
            <button
              onClick={handleSendStatementEmail}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isAr ? 'إرسال الكشف بالبريد للعميل' : 'Send Statement Email'}</span>
            </button>
          </div>
        </div>

        {sentNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{isAr ? 'تم إرسال كشف الحساب بنجاح إلى البريد المعتمد للعميل.' : 'Customer Statement PDF sent successfully via registered email.'}</span>
          </div>
        )}

        {/* Customer & Period Selection Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'اختر العميل' : 'Select Customer'}</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-sky-500"
            >
              <option value="cust-101">SABIC Petrochemicals Co. (سابك)</option>
              <option value="cust-102">Panda Retail Group KSA (بنده)</option>
              <option value="cust-103">Almarai Logistics Division (المراعي)</option>
              <option value="cust-104">Landmark Retail Dubai FZCO (لاندمارك)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'بداية الفترة' : 'Period Start'}</label>
            <input
              type="date"
              value={periodStart}
              onChange={e => setPeriodStart(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'نهاية الفترة' : 'Period End'}</label>
            <input
              type="date"
              value={periodEnd}
              onChange={e => setPeriodEnd(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Statement Sheet Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Printable Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="text-xl font-extrabold text-white">AJA INTERNATIONAL LOGISTICS</div>
            <div className="text-xs text-slate-400">{isAr ? 'كشف حساب عميل رسمي ومستند تحصيل' : 'Official Customer Statement of Account'}</div>
            <div className="text-xs text-sky-400 font-mono pt-1">Period: {statement.statementPeriodStart} to {statement.statementPeriodEnd}</div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-right">
            <div className="text-xs text-slate-400 font-mono">{isAr ? 'الحساب المالي للعميل:' : 'Customer Account:'}</div>
            <div className="text-base font-bold text-white">{isAr ? statement.customerNameAr : statement.customerNameEn}</div>
            <div className="text-xs text-emerald-400 font-mono font-bold pt-1">
              {isAr ? 'الرصيد القائم المتبقي:' : 'Closing Balance Due:'} SAR {statement.closingBalanceSAR.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Summary Financial Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">{isAr ? 'الرصيد الافتتاحي' : 'Opening Balance'}</div>
            <div className="text-sm font-bold text-slate-200">SAR {statement.openingBalanceSAR.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">{isAr ? 'إجمالي المفوتر' : 'Total Invoiced'}</div>
            <div className="text-sm font-bold text-white">SAR {statement.totalInvoicedSAR.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-slate-400">{isAr ? 'إجمالي المسدد' : 'Total Paid'}</div>
            <div className="text-sm font-bold text-emerald-400">SAR {statement.totalPaidSAR.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
            <div className="text-sky-300">{isAr ? 'الرصيد النهائي المستحق' : 'Net Outstanding'}</div>
            <div className="text-sm font-bold text-sky-400">SAR {statement.closingBalanceSAR.toLocaleString()}</div>
          </div>
        </div>

        {/* Open Items Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'الفواتير المستحقة القائمة (Open Items)' : 'Open & Overdue Invoices'}</span>
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                  <th className="p-3">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="p-3">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                  <th className="p-3">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                  <th className="p-3">{isAr ? 'إجمالي الفاتورة' : 'Invoice Total'}</th>
                  <th className="p-3">{isAr ? 'المسدد' : 'Paid'}</th>
                  <th className="p-3">{isAr ? 'الرصيد المتبقي' : 'Balance Due'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {statement.openInvoices.length > 0 ? (
                  statement.openInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-sky-400 font-bold">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-300">{inv.issueDate}</td>
                      <td className="p-3 text-slate-300">{inv.dueDate}</td>
                      <td className="p-3 text-white">SAR {inv.totalAmountSAR.toLocaleString()}</td>
                      <td className="p-3 text-emerald-400">SAR {inv.paidAmountSAR.toLocaleString()}</td>
                      <td className="p-3 text-amber-400 font-extrabold">SAR {inv.balanceDueSAR.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      {isAr ? 'لا توجد فواتير مفتوحة لهذا العميل' : 'No open items found for this customer.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paid Items Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'الفواتير المسددة بالكامل (Paid Items)' : 'Fully Settled Invoices History'}</span>
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                  <th className="p-3">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="p-3">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                  <th className="p-3">{isAr ? 'إجمالي السداد' : 'Settled Amount'}</th>
                  <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {statement.paidInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 text-slate-400">
                    <td className="p-3 font-bold text-slate-200">{inv.invoiceNumber}</td>
                    <td className="p-3">{inv.issueDate}</td>
                    <td className="p-3 text-emerald-400 font-bold">SAR {inv.totalAmountSAR.toLocaleString()}</td>
                    <td className="p-3 text-emerald-400">✓ Fully Settled</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
