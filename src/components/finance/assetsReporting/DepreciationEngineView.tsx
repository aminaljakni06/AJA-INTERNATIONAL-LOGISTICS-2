import React, { useEffect, useState } from 'react';
import {
  TrendingDown,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  DollarSign,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { DepreciationEntry } from '../../../types/fixedAssetsReporting';

export const DepreciationEngineView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [depreciations, setDepreciations] = useState<DepreciationEntry[]>([]);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setDepreciations(snapshot.depreciationSchedule));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <TrendingDown className="w-4 h-4" />
            <span>{isAr ? 'مُحرك الإهلاك التلقائي والقيود المزدوجة الموازية (Parallel Book & Tax Depreciation Engine)' : 'Automated Parallel Depreciation Engine (Book & Tax Schedules)'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'جداول إهلاك الأصول الدفترية والضريبية والترحيل التلقائي للدفتر العام' : 'Automated Journal Posting, Parallel Tax Schedules & Monthly Depreciation Runs'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'احتساب وتوزيع مخصص الإهلاك الشهري التلقائي مع الربط المباشر مع حسابات الأصول بالدفتر العام' : 'Simulate multi-year depreciation rules, parallel tax books, and automated monthly journal vouchers.'}
          </p>
        </div>
      </div>

      {/* Depreciation Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase">{isAr ? 'جدول قيود الإهلاك المرحّلة والجدولة' : 'Depreciation Postings & Schedule Matrix'}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'رقم الأصل' : 'Asset Number'}</th>
                <th className="p-3">{isAr ? 'الفترة المالية' : 'Period'}</th>
                <th className="p-3">{isAr ? 'إهلاك الدفتر المالي' : 'Book Depreciation'}</th>
                <th className="p-3">{isAr ? 'إهلاك الدفتر الضريبي' : 'Tax Depreciation'}</th>
                <th className="p-3">{isAr ? 'المجمع التراكمي' : 'Total Accumulated'}</th>
                <th className="p-3">{isAr ? 'المتبقي' : 'Remaining Book Value'}</th>
                <th className="p-3">{isAr ? 'حالة الترحيل' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {depreciations.map(dep => (
                <tr key={dep.id} className="hover:bg-slate-800/80">
                  <td className="p-3 font-bold text-sky-400">{dep.assetNumber}</td>
                  <td className="p-3 font-bold text-white">{dep.periodLabel}</td>
                  <td className="p-3 text-rose-400 font-bold">SAR {dep.bookDepreciationSAR.toLocaleString()}</td>
                  <td className="p-3 text-amber-400 font-bold">SAR {dep.taxDepreciationSAR.toLocaleString()}</td>
                  <td className="p-3 text-slate-300">SAR {dep.accumulatedTotalSAR.toLocaleString()}</td>
                  <td className="p-3 text-emerald-400 font-bold">SAR {dep.remainingBookValueSAR.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {dep.postingStatus}
                    </span>
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
