import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  ArrowRightLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { JournalEntry } from '../../types/generalLedger';

interface GeneralLedgerExplorerProps {
  journals: JournalEntry[];
  onPostJournal: (journalId: string) => void;
}

export const GeneralLedgerExplorer: React.FC<GeneralLedgerExplorerProps> = ({
  journals,
  onPostJournal
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>('jv-1');

  const filteredJournals = journals.filter(j => {
    const matchesSearch =
      j.journalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.narrationEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.narrationAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.referenceNumber && j.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || j.journalType === selectedType;

    return matchesSearch && matchesType;
  });

  const formatSAR = (val: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-400" />
            <span>{isAr ? 'مكتشف حركات دفتر الأستاذ العام (General Ledger Explorer)' : 'General Ledger Transaction Explorer'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'تتبع واستعراض وتدقيق قيود اليومية المرحلة والحركات المالية بالكامل' : 'Search, inspect, and audit all general ledger journal transactions'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>{isAr ? 'طباعة / تصدير التقرير' : 'Print / Export Ledger'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'البحث برقم القيد، المرجع، أو البيان العربي/الإنجليزي...' : 'Search by journal #, ref, or narration...'}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">{isAr ? 'جميع أنواع القيود' : 'All Journal Types'}</option>
            <option value="MANUAL">{isAr ? 'قيد يدوي (Manual)' : 'Manual'}</option>
            <option value="INTERCOMPANY">{isAr ? 'قيد بين الشركات (Intercompany)' : 'Intercompany'}</option>
            <option value="RECURRING">{isAr ? 'قيد دوري (Recurring)' : 'Recurring'}</option>
            <option value="ADJUSTING">{isAr ? 'قيد تسوية (Adjusting)' : 'Adjusting'}</option>
          </select>
        </div>
      </div>

      {/* Journals List */}
      <div className="space-y-4">
        {filteredJournals.map(journal => {
          const isExpanded = expandedJournalId === journal.id;

          return (
            <div
              key={journal.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-sm transition-all"
            >
              {/* Journal Card Summary Bar */}
              <div
                onClick={() => setExpandedJournalId(isExpanded ? null : journal.id)}
                className="p-4 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400 text-base">{journal.journalNumber}</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {journal.journalType}
                      </span>
                      {journal.referenceNumber && (
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded">
                          Ref: {journal.referenceNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white mt-1">
                      {isAr ? journal.narrationAr : journal.narrationEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right font-mono">
                    <div className="text-xs text-slate-400">{journal.postingDate}</div>
                    <div className="text-sm font-bold text-emerald-400">{formatSAR(journal.totalDebitSAR)}</div>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    journal.status === 'POSTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {journal.status}
                  </span>

                  {journal.status === 'SUBMITTED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPostJournal(journal.id);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      {isAr ? 'ترحيل القيد (Post)' : 'Post Journal'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Journal Details Table */}
              {isExpanded && (
                <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div>
                      <span>{isAr ? 'إعداد بواسطة:' : 'Prepared By:'} <strong className="text-slate-200">{journal.preparedBy}</strong></span>
                      <span className="mx-2">•</span>
                      <span>{isAr ? 'التاريخ:' : 'Date:'} {journal.preparedAt.split('T')[0]}</span>
                    </div>
                    {journal.postedBy && (
                      <div className="text-emerald-400 font-semibold">
                        ✓ {isAr ? 'مرحل بواسطة:' : 'Posted By:'} {journal.postedBy}
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="uppercase bg-slate-800 text-slate-400 font-semibold">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">{isAr ? 'رمز الحساب' : 'Code'}</th>
                          <th className="px-3 py-2">{isAr ? 'اسم الحساب' : 'Account Name'}</th>
                          <th className="px-3 py-2">{isAr ? 'البيان Line Narration' : 'Description'}</th>
                          <th className="px-3 py-2 text-right">{isAr ? 'مدين Debit' : 'Debit'}</th>
                          <th className="px-3 py-2 text-right">{isAr ? 'دائن Credit' : 'Credit'}</th>
                          <th className="px-3 py-2">{isAr ? 'الأبعاد Dimensions' : 'Dimensions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {journal.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 text-slate-500">{line.lineNumber}</td>
                            <td className="px-3 py-2 text-sky-400 font-bold">{line.accountCode}</td>
                            <td className="px-3 py-2 text-slate-200 font-sans">
                              {isAr ? line.accountNameAr : line.accountNameEn}
                            </td>
                            <td className="px-3 py-2 text-slate-300 font-sans">
                              {isAr ? line.descriptionAr : line.descriptionEn}
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-400 font-bold">
                              {line.debitSAR > 0 ? formatSAR(line.debitSAR) : '-'}
                            </td>
                            <td className="px-3 py-2 text-right text-rose-400 font-bold">
                              {line.creditSAR > 0 ? formatSAR(line.creditSAR) : '-'}
                            </td>
                            <td className="px-3 py-2 text-[10px] text-slate-400 font-sans">
                              {line.costCenterCode && <span className="bg-slate-800 px-1.5 py-0.5 rounded mr-1">{line.costCenterCode}</span>}
                              {line.branchId && <span className="bg-slate-800 px-1.5 py-0.5 rounded">{line.branchId}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
