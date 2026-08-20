import React from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { FiscalYear, FiscalPeriod } from '../../types/generalLedger';

interface FiscalCalendarViewProps {
  fiscalYear: FiscalYear;
  onUpdatePeriodStatus: (periodId: string, status: FiscalPeriod['status']) => void;
}

export const FiscalCalendarView: React.FC<FiscalCalendarViewProps> = ({
  fiscalYear,
  onUpdatePeriodStatus
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const statusBadge = (status: FiscalPeriod['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-max">
            <Unlock className="w-3.5 h-3.5" />
            <span>{isAr ? 'مفتوحة للترحيل (OPEN)' : 'Open for Posting'}</span>
          </span>
        );
      case 'SOFT_CLOSE':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-max">
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'إغلاق مؤقت (SOFT CLOSE)' : 'Soft Closed'}</span>
          </span>
        );
      case 'HARD_CLOSE':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-max">
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? 'إغلاق نهائي محمي (HARD CLOSE)' : 'Hard Closed'}</span>
          </span>
        );
      case 'FUTURE_ENTRY':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 w-max">
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'فترة مستقبلية (FUTURE)' : 'Future Period'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>{isAr ? 'التقويم المالي وحظر الفترات (Fiscal Calendar & Locking)' : 'Fiscal Calendar & Period Control'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'إدارة إغلاق الأشهر المالية الحسابية والسيطرة على عدم إدخال قيود بأثر رجعي' : 'Control financial period closing and enforce strict posting freeze rules'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl font-mono">
            {isAr ? `السنة المالية ${fiscalYear.year}` : `Fiscal Year ${fiscalYear.year}`}
          </span>
          <button
            onClick={() => alert(isAr ? 'تم بدء إجراءات إقفال السنة المالية إلكترونياً' : 'Year-End Closing Procedure Initiated')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm cursor-pointer transition-all"
          >
            {isAr ? 'إقفال السنة المالية (Year End Close)' : 'Year-End Close'}
          </button>
        </div>
      </div>

      {/* Fiscal Periods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fiscalYear.periods.map(period => (
          <div
            key={period.id}
            className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between gap-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                  PERIOD M{period.periodNumber.toString().padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {isAr ? period.periodNameAr : period.periodNameEn}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {period.startDate} → {period.endDate}
                </p>
              </div>
              <div>{statusBadge(period.status)}</div>
            </div>

            {period.closedBy && (
              <div className="text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40 flex items-center justify-between">
                <span>{isAr ? 'تم الإغلاق بواسطة:' : 'Closed By:'} <strong className="text-slate-200">{period.closedBy}</strong></span>
                <span className="font-mono text-slate-500">{period.closedAt?.split('T')[0]}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {period.status === 'OPEN' && (
                <>
                  <button
                    onClick={() => onUpdatePeriodStatus(period.id, 'SOFT_CLOSE')}
                    className="px-3 py-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isAr ? 'إغلاق مؤقت (Soft Close)' : 'Soft Close'}
                  </button>
                  <button
                    onClick={() => onUpdatePeriodStatus(period.id, 'HARD_CLOSE')}
                    className="px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isAr ? 'إغلاق نهائي (Hard Close)' : 'Hard Close'}
                  </button>
                </>
              )}

              {period.status === 'SOFT_CLOSE' && (
                <>
                  <button
                    onClick={() => onUpdatePeriodStatus(period.id, 'OPEN')}
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isAr ? 'إعادة الفتح (Re-Open)' : 'Re-Open'}
                  </button>
                  <button
                    onClick={() => onUpdatePeriodStatus(period.id, 'HARD_CLOSE')}
                    className="px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isAr ? 'تأكيد الإغلاق النهائي' : 'Lock Period'}
                  </button>
                </>
              )}

              {period.status === 'HARD_CLOSE' && (
                <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'الفترة محمية ومقفلة بصرامة' : 'Period Protected & Locked'}</span>
                </div>
              )}

              {period.status === 'FUTURE_ENTRY' && (
                <button
                  onClick={() => onUpdatePeriodStatus(period.id, 'OPEN')}
                  className="px-3 py-1.5 bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {isAr ? 'تفعيل الفترة الآن' : 'Activate Period'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
