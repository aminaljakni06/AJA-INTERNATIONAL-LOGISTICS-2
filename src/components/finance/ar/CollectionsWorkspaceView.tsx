import React, { useEffect, useState } from 'react';
import {
  Clock,
  ShieldAlert,
  PhoneCall,
  Calendar,
  MessageSquare,
  AlertOctagon,
  CheckCircle2,
  Plus,
  Send,
  User,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { CollectionCase, DunningLevel } from '../../../types/accountsReceivable';

export const CollectionsWorkspaceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CollectionCase | null>(null);

  // New Note form
  const [newNoteEn, setNewNoteEn] = useState('');
  const [newNoteAr, setNewNoteAr] = useState('');

  // Promise form
  const [promiseDate, setPromiseDate] = useState('2026-02-15');
  const [promiseAmountSAR, setPromiseAmountSAR] = useState(368000);

  const refreshCases = (nextCases: CollectionCase[], selectedId?: string) => {
    setCases(nextCases);
    setSelectedCase(nextCases.find(c => c.id === selectedId) || nextCases[0] || null);
  };

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(snapshot => refreshCases(snapshot.collectionCases));
  }, []);

  const handleAddNote = async () => {
    if (!selectedCase || (!newNoteEn && !newNoteAr)) return;
    const { snapshot } = await AccountsReceivableClient.addCollectionNote(
      selectedCase.caseNumber,
      newNoteEn || 'Collection call note added',
      newNoteAr || 'ملاحظة متابعة تحصيل جديدة',
      'Collections Agent'
    );
    refreshCases(snapshot.collectionCases, selectedCase.id);
    setNewNoteEn('');
    setNewNoteAr('');
  };

  const handleUpdateDunning = async (level: DunningLevel) => {
    if (!selectedCase) return;
    const { snapshot } = await AccountsReceivableClient.updateDunningLevel(selectedCase.caseNumber, level);
    refreshCases(snapshot.collectionCases, selectedCase.id);
  };

  const handleRegisterPromise = async () => {
    if (!selectedCase) return;
    const { snapshot } = await AccountsReceivableClient.updatePromiseToPay(selectedCase.caseNumber, promiseDate, promiseAmountSAR);
    refreshCases(snapshot.collectionCases, selectedCase.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'إدارة التحصيل والمطالبات الميدانية' : 'Collections & Dunning Management Center'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'متابعة الديون المتأخرة والوعود بالسداد' : 'Collection Strategy, Dunning Levels & Promises-to-Pay'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'متابعة العملاء المتأخرين عن السداد، تصعيد المطالبات، تسجيل المكالمات والوعود المالية' : 'Manage dunning levels, payment promises, collection logs, and legal escalation triggers.'}
          </p>
        </div>
      </div>

      {/* Grid Layout: Case List & Active Case Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>{isAr ? 'حالات التحصيل القائمة' : 'Active Collection Cases'}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">{cases.length}</span>
          </h3>

          <div className="space-y-3">
            {cases.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedCase && selectedCase.id === c.id
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 font-mono">{c.caseNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {c.overdueDays} {isAr ? 'يوم تأخير' : 'Days Overdue'}
                  </span>
                </div>

                <div className="font-bold text-white text-xs">{isAr ? c.customerNameAr : c.customerNameEn}</div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'المستحق:' : 'Due:'}</span>
                  <span className="text-amber-400 font-extrabold">SAR {c.outstandingAmountSAR.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Case Inspector */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold">{selectedCase.caseNumber} • {selectedCase.assignedAgent}</div>
                  <h3 className="text-xl font-bold text-white">{isAr ? selectedCase.customerNameAr : selectedCase.customerNameEn}</h3>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">{isAr ? 'المبلغ المستحق للتحصيل' : 'Outstanding Amount'}</div>
                  <div className="text-2xl font-extrabold text-amber-400">SAR {selectedCase.outstandingAmountSAR.toLocaleString()}</div>
                </div>
              </div>

              {/* Dunning Strategy Controls */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 font-mono">{isAr ? 'مستوى الإنذار والمطالبة (Dunning Level):' : 'Active Dunning Level Escalation:'}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'LEVEL_1_REMINDER', label: '1. Reminder' },
                    { id: 'LEVEL_2_NOTICE', label: '2. Notice' },
                    { id: 'LEVEL_3_WARNING', label: '3. Warning' },
                    { id: 'LEVEL_4_LEGAL', label: '4. Legal' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => handleUpdateDunning(lvl.id as DunningLevel)}
                      className={`p-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                        selectedCase.dunningLevel === lvl.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promise to Pay Box */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{isAr ? 'تسجيل وعد جديد بالسداد (Promise to Pay)' : 'Register Promise-to-Pay'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'تاريخ السداد الموعود' : 'Promised Date'}</label>
                    <input
                      type="date"
                      value={promiseDate}
                      onChange={e => setPromiseDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'المبلغ الموعود (SAR)' : 'Promised Amount'}</label>
                    <input
                      type="number"
                      value={promiseAmountSAR}
                      onChange={e => setPromiseAmountSAR(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRegisterPromise}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'حفظ الوعد بالسداد وتأكيد الاتفاق' : 'Save Promise-to-Pay Commitment'}</span>
                </button>
              </div>

              {/* Call Log Notes */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? 'سجل الاتصالات وملاحظات التحصيل' : 'Collection Notes & History'}</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCase.notes.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 text-xs">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-sky-400">{n.author}</span>
                        <span>{n.date}</span>
                      </div>
                      <p className="text-slate-200">{isAr ? n.noteAr : n.noteEn}</p>
                    </div>
                  ))}
                </div>

                {/* Add New Note */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder={isAr ? 'أدخل ملاحظة الاتصال أو المتابعة...' : 'Add call note or response...'}
                    value={isAr ? newNoteAr : newNoteEn}
                    onChange={e => isAr ? setNewNoteAr(e.target.value) : setNewNoteEn(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 flex items-center gap-2 ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة الملاحظة للسجل' : 'Add Note to Log'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
