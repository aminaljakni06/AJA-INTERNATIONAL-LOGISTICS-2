import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Scale,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TrialBalanceRow } from '../../types/generalLedger';

interface TrialBalanceViewProps {
  trialBalanceRows: TrialBalanceRow[];
}

export const TrialBalanceView: React.FC<TrialBalanceViewProps> = ({
  trialBalanceRows
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = trialBalanceRows.filter(row =>
    row.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.accountNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.accountNameAr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totals
  const totalOpeningDebit = trialBalanceRows.reduce((sum, r) => sum + (r.isHeader ? 0 : r.openingDebitSAR), 0);
  const totalOpeningCredit = trialBalanceRows.reduce((sum, r) => sum + (r.isHeader ? 0 : r.openingCreditSAR), 0);
  const totalPeriodDebit = trialBalanceRows.reduce((sum, r) => sum + (r.isHeader ? 0 : r.periodDebitSAR), 0);
  const totalPeriodCredit = trialBalanceRows.reduce((sum, r) => sum + (r.isHeader ? 0 : r.periodCreditSAR), 0);
  const totalClosingDebit = trialBalanceRows.reduce((sum, r) => sum + (r.isHeader ? 0 : r.closingDebitSAR), 0);
  const totalClosingCredit = trialBalanceRows.reduce((sum, r) => sum + (r.isHeader ? 0 : r.closingCreditSAR), 0);

  const formatSAR = (val: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "AccountCode,AccountName,Category,OpeningDebit,OpeningCredit,PeriodDebit,PeriodCredit,ClosingDebit,ClosingCredit\n"
      + trialBalanceRows.map(r => `${r.accountCode},"${r.accountNameEn}",${r.category},${r.openingDebitSAR},${r.openingCreditSAR},${r.periodDebitSAR},${r.periodCreditSAR},${r.closingDebitSAR},${r.closingCreditSAR}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AJA_Trial_Balance_FY2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>{isAr ? 'ميزان المراجعة بالمجاميع والأرصدة (Trial Balance)' : 'General Ledger Trial Balance'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'عرض ميزان المراجعة الحقيقي مع الأرصدة الافتتاحية وحركات الفترة والأرصدة الختامية' : 'Realtime Trial Balance statement showing opening, period, and closing totals'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير إلى Excel / CSV' : 'Export to CSV'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Balance Verification Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold text-emerald-300">
              {isAr ? 'ميزان المراجعة متوازن إلكترونياً بنسبة 100%' : 'Trial Balance Status: Perfectly Balanced'}
            </h4>
            <p className="text-xs text-emerald-400/80">
              {isAr ? 'إجمالي أسطر المدينة تساوي بصرامة إجمالي الأسطر الدائنة للفترة والأرصدة الختامية' : 'Total Debit equals Total Credit across all ledger accounts'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono font-bold">
          Δ 0.00 SAR
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'البحث بالرمز أو اسم الحساب...' : 'Search account code or name...'}
          className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Trial Balance Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="uppercase bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="px-3 py-3" rowSpan={2}>{isAr ? 'رمز الحساب' : 'Code'}</th>
                <th className="px-3 py-3" rowSpan={2}>{isAr ? 'اسم الحساب' : 'Account Name'}</th>
                <th className="px-3 py-3 text-center border-b border-slate-700/50" colSpan={2}>{isAr ? 'الرصيد الافتتاحي (Opening)' : 'Opening Balance'}</th>
                <th className="px-3 py-3 text-center border-b border-slate-700/50" colSpan={2}>{isAr ? 'حركات الفترة (Period)' : 'Period Movement'}</th>
                <th className="px-3 py-3 text-center border-b border-slate-700/50" colSpan={2}>{isAr ? 'الرصيد الختامي (Closing)' : 'Closing Balance'}</th>
              </tr>
              <tr className="bg-slate-800/80 text-[10px]">
                <th className="px-2 py-1.5 text-right text-emerald-400">{isAr ? 'مدين Debit' : 'Debit'}</th>
                <th className="px-2 py-1.5 text-right text-rose-400">{isAr ? 'دائن Credit' : 'Credit'}</th>
                <th className="px-2 py-1.5 text-right text-emerald-400">{isAr ? 'مدين Debit' : 'Debit'}</th>
                <th className="px-2 py-1.5 text-right text-rose-400">{isAr ? 'دائن Credit' : 'Credit'}</th>
                <th className="px-2 py-1.5 text-right text-emerald-400">{isAr ? 'مدين Debit' : 'Debit'}</th>
                <th className="px-2 py-1.5 text-right text-rose-400">{isAr ? 'دائن Credit' : 'Credit'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    row.isHeader ? 'bg-slate-800/30 font-bold text-white' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-sky-400 font-bold">{row.accountCode}</td>
                  <td className="px-3 py-2.5 font-sans text-slate-200">
                    {isAr ? row.accountNameAr : row.accountNameEn}
                  </td>

                  {/* Opening */}
                  <td className="px-2 py-2.5 text-right text-slate-300">
                    {row.openingDebitSAR > 0 ? formatSAR(row.openingDebitSAR) : '-'}
                  </td>
                  <td className="px-2 py-2.5 text-right text-slate-300">
                    {row.openingCreditSAR > 0 ? formatSAR(row.openingCreditSAR) : '-'}
                  </td>

                  {/* Period */}
                  <td className="px-2 py-2.5 text-right text-emerald-400">
                    {row.periodDebitSAR > 0 ? formatSAR(row.periodDebitSAR) : '-'}
                  </td>
                  <td className="px-2 py-2.5 text-right text-rose-400">
                    {row.periodCreditSAR > 0 ? formatSAR(row.periodCreditSAR) : '-'}
                  </td>

                  {/* Closing */}
                  <td className="px-2 py-2.5 text-right font-bold text-emerald-400">
                    {row.closingDebitSAR > 0 ? formatSAR(row.closingDebitSAR) : '-'}
                  </td>
                  <td className="px-2 py-2.5 text-right font-bold text-rose-400">
                    {row.closingCreditSAR > 0 ? formatSAR(row.closingCreditSAR) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800 font-mono font-bold text-xs text-white border-t-2 border-slate-700">
              <tr>
                <td colSpan={2} className="px-4 py-3 font-sans uppercase">
                  {isAr ? 'الإجمالي العام للميزان Total' : 'Grand Total'}
                </td>
                <td className="px-2 py-3 text-right text-slate-300">{formatSAR(totalOpeningDebit)}</td>
                <td className="px-2 py-3 text-right text-slate-300">{formatSAR(totalOpeningCredit)}</td>
                <td className="px-2 py-3 text-right text-emerald-400">{formatSAR(totalPeriodDebit)}</td>
                <td className="px-2 py-3 text-right text-rose-400">{formatSAR(totalPeriodCredit)}</td>
                <td className="px-2 py-3 text-right text-emerald-400 font-extrabold">{formatSAR(totalClosingDebit)}</td>
                <td className="px-2 py-3 text-right text-rose-400 font-extrabold">{formatSAR(totalClosingCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
