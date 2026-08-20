import React, { useState } from 'react';
import {
  FilePlus,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Scale,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { JournalEntry, JournalLine, ChartOfAccount, JournalType } from '../../types/generalLedger';

interface JournalWorkspaceViewProps {
  accounts: ChartOfAccount[];
  onCreateJournal: (journal: Omit<JournalEntry, 'id' | 'journalNumber' | 'preparedAt' | 'status'>) => void;
}

export const JournalWorkspaceView: React.FC<JournalWorkspaceViewProps> = ({
  accounts,
  onCreateJournal
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Form State
  const [journalType, setJournalType] = useState<JournalType>('MANUAL');
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split('T')[0]);
  const [narrationEn, setNarrationEn] = useState('');
  const [narrationAr, setNarrationAr] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [companyId, setCompanyId] = useState('comp-101');

  // Lines State
  const [lines, setLines] = useState<Omit<JournalLine, 'id'>[]>([
    {
      lineNumber: 1,
      accountCode: '502000',
      accountNameEn: 'Fuel & Fleet Operations Expense',
      accountNameAr: 'مصاريف الوقود وتشغيل الأسطول',
      debitSAR: 50000,
      creditSAR: 0,
      descriptionEn: 'Fleet fuel refill - Riyadh hub',
      descriptionAr: 'وقود أسطول - مركز الرياض',
      companyId: 'comp-101',
      costCenterCode: 'CC-FLEET'
    },
    {
      lineNumber: 2,
      accountCode: '101100',
      accountNameEn: 'Al Rajhi Bank - Main Operating SAR',
      accountNameAr: 'مصرف الراجحي - الحساب التشغيلي الرئيسي (SAR)',
      debitSAR: 0,
      creditSAR: 50000,
      descriptionEn: 'Bank payment to fuel vendor',
      descriptionAr: 'سداد بنكي لمورد الوقود',
      companyId: 'comp-101',
      branchId: 'BR-RUH'
    }
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const postingAccounts = accounts.filter(a => a.isPosting && a.status === 'ACTIVE');

  const totalDebit = lines.reduce((sum, line) => sum + (line.debitSAR || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.creditSAR || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    const defaultAcc = postingAccounts[0] || accounts[0];
    setLines([
      ...lines,
      {
        lineNumber: lines.length + 1,
        accountCode: defaultAcc.accountCode,
        accountNameEn: defaultAcc.accountNameEn,
        accountNameAr: defaultAcc.accountNameAr,
        debitSAR: 0,
        creditSAR: 0,
        descriptionEn: narrationEn || 'Journal Entry Line',
        descriptionAr: narrationAr || 'سطر قيد اليومية',
        companyId: 'comp-101'
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      alert(isAr ? 'يجب أن يتكون القيد من سطرين على الأقل' : 'A journal entry must contain at least 2 lines.');
      return;
    }
    const updated = lines.filter((_, i) => i !== index).map((line, idx) => ({ ...line, lineNumber: idx + 1 }));
    setLines(updated);
  };

  const handleLineAccountChange = (index: number, newAccountCode: string) => {
    const selectedAcc = accounts.find(a => a.accountCode === newAccountCode);
    if (!selectedAcc) return;

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      accountCode: selectedAcc.accountCode,
      accountNameEn: selectedAcc.accountNameEn,
      accountNameAr: selectedAcc.accountNameAr
    };
    setLines(updated);
  };

  const handleLineAmountChange = (index: number, field: 'debitSAR' | 'creditSAR', val: number) => {
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setLines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isBalanced) {
      setErrorMessage(
        isAr
          ? `القيد غير متوازن! الفرق بين المدين والدائن يساوي ${difference} ريال.`
          : `Journal is not balanced! Difference is ${difference} SAR.`
      );
      return;
    }

    if (!narrationEn || !narrationAr) {
      setErrorMessage(isAr ? 'يرجى إدخال الشرح والبيان باللغتين العربية والإنجليزية' : 'Please provide narration in English and Arabic.');
      return;
    }

    onCreateJournal({
      journalType,
      postingDate,
      fiscalPeriodId: 'fp-2026-02',
      companyId,
      companyName: 'AJA Logistics Saudi Arabia Co.',
      referenceNumber: referenceNumber || undefined,
      sourceModule: 'GENERAL_LEDGER',
      narrationEn,
      narrationAr,
      totalDebitSAR: totalDebit,
      totalCreditSAR: totalCredit,
      preparedBy: 'Senior Accountant',
      lines: lines.map((l, idx) => ({ ...l, id: `line-${idx + 1}` }))
    });

    alert(isAr ? 'تم إنشاء القيد وإرساله للاعتماد والترحيل بنجاح' : 'Journal Entry created & submitted successfully!');
    // Reset form
    setNarrationEn('');
    setNarrationAr('');
    setReferenceNumber('');
  };

  const formatSAR = (val: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-sky-400" />
            <span>{isAr ? 'مساحة إنشاء قيود اليومية (Journal Entry Workspace)' : 'Journal Entry Creation Workspace'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'إعداد، توازن، وتوثيق قيود اليومية المحاسبية مع ربط الأبعاد ومراكز التكلفة' : 'Create, balance, and post double-entry General Ledger journals'}
          </p>
        </div>

        {/* Live Balance Status Badge */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm ${
          isBalanced
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          <Scale className="w-5 h-5" />
          <span>
            {isBalanced
              ? (isAr ? 'القيد متوازن ✓' : 'Balanced ✓')
              : (isAr ? `غير متوازن (الفرق: ${difference} SAR)` : `Unbalanced (Diff: ${difference} SAR)`)}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-sm flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Journal Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Metadata Grid */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {isAr ? 'نوع القيد Journal Type' : 'Journal Type'}
            </label>
            <select
              value={journalType}
              onChange={e => setJournalType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="MANUAL">{isAr ? 'قيد يدوي (Manual)' : 'Manual'}</option>
              <option value="RECURRING">{isAr ? 'قيد دوري (Recurring)' : 'Recurring'}</option>
              <option value="ADJUSTING">{isAr ? 'قيد تسوية (Adjusting)' : 'Adjusting'}</option>
              <option value="REVERSING">{isAr ? 'قيد عكسي (Reversing)' : 'Reversing'}</option>
              <option value="INTERCOMPANY">{isAr ? 'قيد بين الشركات (Intercompany)' : 'Intercompany'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {isAr ? 'تاريخ الترحيل Posting Date' : 'Posting Date'}
            </label>
            <input
              type="date"
              required
              value={postingDate}
              onChange={e => setPostingDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {isAr ? 'الرقم المرجعي / المستند' : 'Reference Number'}
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              placeholder="e.g. INV-9912 / PO-8812"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {isAr ? 'الشركة الحسابية' : 'Company'}
            </label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="comp-101">AJA Logistics Saudi Arabia Co.</option>
              <option value="comp-102">AJA Express UAE FZCO</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {isAr ? 'بيان / شرح القيد (باللغة العربية)' : 'Narration (Arabic)'}
            </label>
            <input
              type="text"
              required
              value={narrationAr}
              onChange={e => setNarrationAr(e.target.value)}
              placeholder="مثال: تسوية مصاريف الشحن والوقود الشهرية لفرع الرياض"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {isAr ? 'بيان / شرح القيد (باللغة الإنجليزية)' : 'Narration (English)'}
            </label>
            <input
              type="text"
              required
              value={narrationEn}
              onChange={e => setNarrationEn(e.target.value)}
              placeholder="e.g. Monthly fleet fuel allocation and maintenance adjustment"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Lines Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
            <span className="text-sm font-bold text-white">
              {isAr ? 'أسطر قيد اليومية التفصيلية' : 'Journal Lines & Dimension Allocation'}
            </span>
            <button
              type="button"
              onClick={handleAddLine}
              className="px-3 py-1.5 bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? '+ إضافة سطر' : '+ Add Line'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-3 py-3 w-12">#</th>
                  <th className="px-3 py-3 w-64">{isAr ? 'الحساب Account' : 'Account'}</th>
                  <th className="px-3 py-3">{isAr ? 'البيان Line Description' : 'Description'}</th>
                  <th className="px-3 py-3 w-36 text-right">{isAr ? 'مدين Debit (SAR)' : 'Debit (SAR)'}</th>
                  <th className="px-3 py-3 w-36 text-right">{isAr ? 'دائن Credit (SAR)' : 'Credit (SAR)'}</th>
                  <th className="px-3 py-3 w-36">{isAr ? 'مركز التكلفة' : 'Cost Center'}</th>
                  <th className="px-3 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">{line.lineNumber}</td>

                    {/* Account Select */}
                    <td className="px-3 py-3">
                      <select
                        value={line.accountCode}
                        onChange={e => handleLineAccountChange(idx, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      >
                        {postingAccounts.map(acc => (
                          <option key={acc.id} value={acc.accountCode}>
                            {acc.accountCode} - {isAr ? acc.accountNameAr : acc.accountNameEn}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={isAr ? line.descriptionAr : line.descriptionEn}
                        onChange={e => {
                          const updated = [...lines];
                          updated[idx] = {
                            ...updated[idx],
                            descriptionEn: e.target.value,
                            descriptionAr: e.target.value
                          };
                          setLines(updated);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </td>

                    {/* Debit */}
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={line.debitSAR}
                        onChange={e => handleLineAmountChange(idx, 'debitSAR', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold text-right focus:outline-none focus:border-emerald-500"
                      />
                    </td>

                    {/* Credit */}
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={line.creditSAR}
                        onChange={e => handleLineAmountChange(idx, 'creditSAR', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 font-mono font-bold text-right focus:outline-none focus:border-rose-500"
                      />
                    </td>

                    {/* Cost Center */}
                    <td className="px-3 py-3">
                      <select
                        value={line.costCenterCode || ''}
                        onChange={e => {
                          const updated = [...lines];
                          updated[idx] = { ...updated[idx], costCenterCode: e.target.value };
                          setLines(updated);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                      >
                        <option value="">{isAr ? 'بدون مركز تكلفة' : 'None'}</option>
                        <option value="CC-FLEET">CC-FLEET (الأسطول)</option>
                        <option value="CC-WH-RUH">CC-WH-RUH (مستودع الرياض)</option>
                      </select>
                    </td>

                    {/* Remove Action */}
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800/90 font-mono font-bold text-white border-t border-slate-700">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">
                    {isAr ? 'الإجمالي Total:' : 'Total:'}
                  </td>
                  <td className="px-3 py-3 text-right text-emerald-400">
                    {formatSAR(totalDebit)}
                  </td>
                  <td className="px-3 py-3 text-right text-rose-400">
                    {formatSAR(totalCredit)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Submit & Post Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={!isBalanced}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              isBalanced
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'حفظ وتثبيت القيد المحاسبي' : 'Submit & Post Journal Entry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
