import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Zap,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { BankStatement } from '../../../types/treasury';

export const BankReconciliationView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [selectedStmt, setSelectedStmt] = useState<BankStatement | null>(null);
  const [matching, setMatching] = useState(false);

  const refreshStatements = (nextStatements: BankStatement[], selectedId?: string) => {
    setStatements(nextStatements);
    setSelectedStmt(nextStatements.find(s => s.id === selectedId) || nextStatements[0] || null);
  };

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(snapshot => refreshStatements(snapshot.bankStatements));
  }, []);

  const handleRunAutoMatch = () => {
    if (!selectedStmt) return;
    setMatching(true);
    setTimeout(() => {
      void TreasuryClient.matchStatementLine(selectedStmt.id, 'line-3', 'MANUALLY_MATCHED', 'JV-2026-00115')
        .then(({ snapshot }) => refreshStatements(snapshot.bankStatements, selectedStmt.id))
        .finally(() => setMatching(false));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <FileCheck className="w-4 h-4" />
            <span>{isAr ? 'محرك المطابقة البنكية الإلكترونية الذكية' : 'Electronic Bank Statement Reconciliation Platform (MT940 / CAMT.053)'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مطابقة كشوف الحساب، معالجة التسويات والاستثناءات' : 'Bank Statement Matching, GL Journal Sync & Auto-Reconciliation'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'المطابقة الآلية لكشوف الحساب البنكية مع قيود اليومية، وتسويات بوابة Adyen والتحويلات' : 'Automated 1-click matching engine linking bank deposits to GL journal entries and Adyen transactions.'}
          </p>
        </div>

        <button
          onClick={handleRunAutoMatch}
          disabled={matching}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${matching ? 'animate-spin' : ''}`} />
          <span>{matching ? (isAr ? 'جاري المطابقة...' : 'Matching Statements...') : (isAr ? 'تشغيل محرك المطابقة الآلي' : 'Run 1-Click AI Auto Match')}</span>
        </button>
      </div>

      {/* Statement Details & Lines */}
      {selectedStmt && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-sky-400 font-bold">{selectedStmt.statementNumber} • Date: {selectedStmt.statementDate}</div>
              <h3 className="text-xl font-bold text-white">{selectedStmt.bankNameEn}</h3>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
              <div>
                <span className="text-slate-400 block">{isAr ? 'رصيد البداية:' : 'Opening Bal:'}</span>
                <span className="text-white font-bold">SAR {selectedStmt.openingBalance.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? 'رصيد الإغلاق:' : 'Closing Bal:'}</span>
                <span className="text-emerald-400 font-extrabold">SAR {selectedStmt.closingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Statement Lines Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{isAr ? 'حركات كشف الحساب المصرفي' : 'Bank Statement Transactions'}</h4>

            <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                    <th className="p-3">{isAr ? 'تاريخ الاستحقاق' : 'Value Date'}</th>
                    <th className="p-3">{isAr ? 'المرجع البنكي' : 'Bank Ref'}</th>
                    <th className="p-3">{isAr ? 'البيان والتفاصيل' : 'Description'}</th>
                    <th className="p-3">{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th className="p-3">{isAr ? 'حالة المطابقة' : 'Match Status'}</th>
                    <th className="p-3">{isAr ? 'مرجع قيد اليومية' : 'Matched GL Ref'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedStmt.lines.map(line => (
                    <tr key={line.id} className="hover:bg-slate-800/80">
                      <td className="p-3 text-slate-400">{line.valueDate}</td>
                      <td className="p-3 text-sky-400 font-bold">{line.reference}</td>
                      <td className="p-3 text-white">{isAr ? line.descriptionAr : line.descriptionEn}</td>
                      <td className={`p-3 font-bold ${line.direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {line.direction === 'CREDIT' ? '+' : '-'} SAR {line.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {line.matchStatus === 'AUTO_MATCHED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ AUTO MATCHED
                          </span>
                        )}
                        {line.matchStatus === 'MANUALLY_MATCHED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            ✓ MANUALLY MATCHED
                          </span>
                        )}
                        {line.matchStatus === 'UNMATCHED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ● UNMATCHED
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">{line.matchedGlJournalRef || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
