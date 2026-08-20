import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { RevenueSchedule } from '../../../types/accountsReceivable';

export const RevenueRecognitionCenterView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [schedules, setSchedules] = useState<RevenueSchedule[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(snapshot => setSchedules(snapshot.revenueSchedules));
  }, []);

  const totalContractValueSAR = schedules.reduce((sum, s) => sum + s.totalContractValueSAR, 0);
  const totalDeferredRevenueSAR = schedules.reduce((sum, s) => sum + s.deferredRevenueBalanceSAR, 0);
  const totalRecognizedRevenueSAR = schedules.reduce((sum, s) => sum + s.recognizedRevenueBalanceSAR, 0);

  const handleRecognizeMilestone = async (schedId: string, milestoneId: string) => {
    try {
      const { snapshot } = await AccountsReceivableClient.recognizeMilestone(schedId, milestoneId);
      setSchedules(snapshot.revenueSchedules);
      setSuccessMsg(
        isAr
          ? 'تم الاعتراف بالإيراد وتحرير القيد المالي بنجاح وفق المعيار الدولي IFRS 15'
          : 'Revenue recognized and IFRS 15 GL journal posted successfully!'
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'الامتثال للمعيار المحاسبي الدولي IFRS 15' : 'IFRS 15 Revenue Recognition Engine'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isAr ? 'مركز الاعتراف بالإيرادات المؤجلة والعقود' : 'Revenue Recognition & Deferred Revenue Schedules'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تتبع إلتزامات الأداء والاعتراف بالإيرادات حسب المراحل والإنجاز الزمني مع القيد المالي الآلي' : 'Track performance obligations, milestone triggers, deferred revenue & automated GL postings.'}
          </p>
        </div>

        {/* Global Financial Metrics */}
        <div className="grid grid-cols-3 gap-4 shrink-0 font-mono text-center">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-[10px] text-slate-400">{isAr ? 'إجمالي العقود' : 'Contract Value'}</div>
            <div className="text-sm font-bold text-white">SAR {(totalContractValueSAR / 1000).toFixed(0)}k</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <div className="text-[10px] text-amber-300">{isAr ? 'الإيراد المؤجل' : 'Deferred Rev'}</div>
            <div className="text-sm font-bold text-amber-400">SAR {(totalDeferredRevenueSAR / 1000).toFixed(0)}k</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-[10px] text-emerald-300">{isAr ? 'الإيراد المعترف به' : 'Recognized Rev'}</div>
            <div className="text-sm font-bold text-emerald-400">SAR {(totalRecognizedRevenueSAR / 1000).toFixed(0)}k</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Schedules List */}
      <div className="space-y-6">
        {schedules.map(sched => {
          const recPercent = Math.round((sched.recognizedRevenueBalanceSAR / (sched.totalContractValueSAR || 1)) * 100);

          return (
            <div key={sched.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Schedule Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-xs font-bold">
                      {sched.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Rule: {sched.revRecRule}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white pt-1">
                    {isAr ? sched.performanceObligationDescriptionAr : sched.performanceObligationDescriptionEn}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {isAr ? 'العميل:' : 'Customer:'} <span className="text-slate-200 font-semibold">{sched.customerNameEn}</span>
                  </div>
                </div>

                <div className="text-right font-mono space-y-1">
                  <div className="text-xs text-slate-400">{isAr ? 'القيمة الكلية للعقد' : 'Contract Total'}</div>
                  <div className="text-lg font-extrabold text-white">SAR {sched.totalContractValueSAR.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">{recPercent}% {isAr ? 'معترف به' : 'Recognized'}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{isAr ? 'مؤجل (Deferred): SAR ' + sched.deferredRevenueBalanceSAR.toLocaleString() : 'Deferred: SAR ' + sched.deferredRevenueBalanceSAR.toLocaleString()}</span>
                  <span>{isAr ? 'معترف به (Recognized): SAR ' + sched.recognizedRevenueBalanceSAR.toLocaleString() : 'Recognized: SAR ' + sched.recognizedRevenueBalanceSAR.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${recPercent}%` }}></div>
                  <div className="bg-amber-500/80 h-full transition-all" style={{ width: `${100 - recPercent}%` }}></div>
                </div>
              </div>

              {/* Milestones Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">
                  {isAr ? 'مراحل التزام الأداء والاعتراف بالإيراد' : 'Performance Obligation Milestones'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sched.milestones.map(ms => (
                    <div
                      key={ms.milestoneId}
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        ms.status === 'RECOGNIZED'
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{isAr ? ms.nameAr : ms.nameEn}</span>
                        {ms.status === 'RECOGNIZED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ Recognized
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Amount:</span>
                        <span className="text-white font-bold">SAR {ms.amountSAR.toLocaleString()}</span>
                      </div>

                      {ms.status === 'RECOGNIZED' ? (
                        <div className="pt-2 text-[10px] font-mono text-emerald-400/90 border-t border-emerald-500/20 flex justify-between">
                          <span>Date: {ms.recognizedDate}</span>
                          <span className="font-bold">JV: {ms.glPostingJvRef}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRecognizeMilestone(sched.id, ms.milestoneId)}
                          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'اعتماد والاعتراف بالإيراد' : 'Recognize & Post GL JV'}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
