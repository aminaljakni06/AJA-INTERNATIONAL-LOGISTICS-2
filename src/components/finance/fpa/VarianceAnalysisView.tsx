import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  Building2,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { VarianceItem } from '../../../types/fpa';

export const VarianceAnalysisView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [variances, setVariances] = useState<VarianceItem[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'FAVORABLE' | 'UNFAVORABLE'>('ALL');

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => setVariances(snapshot.varianceItems));
  }, []);

  const filtered = variances.filter(v => filterType === 'ALL' || v.varianceType === filterType);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{isAr ? 'منظومة تحليل انحرافات الميزانية والأسباب الجوهرية' : 'Budget vs. Actual Variance & Root Cause Analysis Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مراقبة الانحرافات الإيجابية والسلبية للأقسام ومراكز التكلفة' : 'Departmental Expense Variance & Favorable vs. Unfavorable Audit'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تحديد الأسباب الجذرية للانحراف المالي، تقييم الأثر وتحليل التجاوزات المالية' : 'Identify root causes of cost overruns, track favorable operational savings, and trigger automated alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilterType('UNFAVORABLE')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${filterType === 'UNFAVORABLE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'انحراف سلبي' : 'Unfavorable'}
          </button>
          <button
            onClick={() => setFilterType('FAVORABLE')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${filterType === 'FAVORABLE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'انحراف إيجابي' : 'Favorable'}
          </button>
        </div>
      </div>

      {/* Variance Items List */}
      <div className="space-y-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{item.costCenterCode}</span>
                <h3 className="text-base font-bold text-white">{isAr ? item.accountNameAr : item.accountNameEn}</h3>
              </div>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                item.varianceType === 'FAVORABLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {item.varianceType} ({item.variancePercent}%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الميزانية المعتمدة:' : 'Budget Amount:'}</div>
                <div className="text-sm font-bold text-white">SAR {(item.budgetAmountSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'المصروف الفعلي:' : 'Actual Spent:'}</div>
                <div className="text-sm font-bold text-sky-400">SAR {(item.actualAmountSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'مبلغ الانحراف:' : 'Variance Amount:'}</div>
                <div className={`text-sm font-bold ${item.varianceSAR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  SAR {(Math.abs(item.varianceSAR) / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Root Cause Card */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/80 space-y-1 text-xs font-mono">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>{isAr ? 'تحليل السبب الجذري (Root Cause Analysis):' : 'Root Cause Explanation:'}</span>
              </div>
              <p className="text-slate-300 pl-6">{isAr ? item.rootCauseAr : item.rootCauseEn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
