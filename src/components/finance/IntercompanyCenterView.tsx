import React from 'react';
import {
  Building2,
  ArrowRightLeft,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Send,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { IntercompanyAccount } from '../../types/generalLedger';

interface IntercompanyCenterViewProps {
  intercompanyAccounts: IntercompanyAccount[];
  onEliminate: (id: string) => void;
}

export const IntercompanyCenterView: React.FC<IntercompanyCenterViewProps> = ({
  intercompanyAccounts,
  onEliminate
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

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
            <Building2 className="w-6 h-6 text-teal-400" />
            <span>{isAr ? 'محاسبة وتسوية المعاملات بين الشركات (Intercompany Center)' : 'Intercompany Accounting & Eliminations'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'إدارة الذمم المدينة/الدائنة المتبادلة بين الفروع وتوليد قيود الاستبعاد التلقائي عند التجميع' : 'Manage Due To / Due From balances and perform consolidated elimination journals'}
          </p>
        </div>

        <button
          onClick={() => alert(isAr ? 'تم تشغيل مطابقة الحسابات وتأكيد توازن الذمم المتبادلة' : 'Intercompany Reconciliation Triggered')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{isAr ? 'مطابقة الحسابات المتبادلة' : 'Run Reconcile & Match'}</span>
        </button>
      </div>

      {/* Intercompany Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intercompanyAccounts.map(ic => (
          <div
            key={ic.id}
            className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold text-xs font-mono">
                  {ic.accountCode}
                </span>
                <span className="text-sm font-bold text-white">{ic.fromCompanyName}</span>
              </div>
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-300">{ic.toCompanyName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <span className="text-xs text-slate-400 block font-sans">{isAr ? 'رصيد مستحق لنا (Due From):' : 'Due From Balance:'}</span>
                <span className="text-lg font-bold text-emerald-400">{formatSAR(ic.dueFromBalanceSAR)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-sans">{isAr ? 'رصيد مستحق علينا (Due To):' : 'Due To Balance:'}</span>
                <span className="text-lg font-bold text-rose-400">{formatSAR(ic.dueToBalanceSAR)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">{isAr ? 'حالة التجميع:' : 'Consolidation Status:'}</span>
                {ic.autoEliminationEnabled ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مستبعد تلقائياً (Eliminated)' : 'Auto-Eliminated'}</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">{isAr ? 'يتطلب استبعاد' : 'Pending'}</span>
                )}
              </div>

              <button
                onClick={() => onEliminate(ic.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                {isAr ? 'إنشاء قيد الاستبعاد' : 'Generate Elimination JV'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
