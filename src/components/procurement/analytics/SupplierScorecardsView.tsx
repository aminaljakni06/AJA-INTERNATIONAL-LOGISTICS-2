import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Filter,
  Download,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { SupplierScorecard } from '../../../types/procurement';

interface SupplierScorecardsViewProps {
  scorecards: SupplierScorecard[];
}

export const SupplierScorecardsView: React.FC<SupplierScorecardsViewProps> = ({ scorecards }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [reviewTypeFilter, setReviewTypeFilter] = useState<'ALL' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-Q2');

  const filteredScorecards = scorecards.filter(sc => {
    if (reviewTypeFilter !== 'ALL' && sc.reviewType !== reviewTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              SCORECARDS & BENCHMARKING
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'نظام بطاقات التقييم الشامل وترتيب الموردين' : 'Supplier Scorecards & Benchmarking Engine'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'إدارة بطاقات الأداء الشاملة، المراجعات الشهرية والربع سنوية، والترتيب التنافسي للموردين'
              : 'Periodical reviews, weighted KPI benchmarking, and comparative ranking for supply base'}
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3">
          <select
            value={reviewTypeFilter}
            onChange={(e) => setReviewTypeFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2"
          >
            <option value="ALL">{isAr ? 'جميع المراجعات (All Reviews)' : 'All Reviews'}</option>
            <option value="MONTHLY">{isAr ? 'شهرية (Monthly)' : 'Monthly'}</option>
            <option value="QUARTERLY">{isAr ? 'ربع سنوية (Quarterly)' : 'Quarterly'}</option>
            <option value="ANNUAL">{isAr ? 'سنوية (Annual)' : 'Annual'}</option>
          </select>
        </div>
      </div>

      {/* SCORECARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScorecards.map((sc) => (
          <div key={sc.id} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md font-mono">
                    {sc.reviewType} REVIEW
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{sc.vendorName}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{sc.vendorCode} • {sc.category}</p>
                </div>

                <div className="text-right bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-medium">{isAr ? 'الترتيب' : 'Rank'}</span>
                  <p className="text-xl font-black text-amber-400 font-mono">#{sc.ranking}</p>
                </div>
              </div>

              {/* Score Indicator */}
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">{isAr ? 'إجمالي النقاط:' : 'Overall Rating:'}</span>
                <span className="text-lg font-black text-amber-300 font-mono">{sc.overallScore} / 100</span>
              </div>

              {/* Key KPI Highlights */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{isAr ? 'الالتزام بالتسليم:' : 'Delivery:'}</span>
                  <span className="font-mono font-bold text-emerald-400">{sc.onTimeDeliveryPct}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{isAr ? 'نسبة الجودة:' : 'Quality:'}</span>
                  <span className="font-mono font-bold text-emerald-400">{(100 - sc.defectRatePct).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{isAr ? 'استجابة الاقتباس:' : 'RFQ Response:'}</span>
                  <span className="font-mono font-bold text-cyan-400">{sc.rfqResponseHours}h</span>
                </div>
              </div>

              {/* Historical Score Trend */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium">{isAr ? 'تطور الأداء التاريخي:' : 'Performance Trend:'}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  {sc.historyTrends.map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-800 p-1.5 rounded-lg text-center border border-slate-700/60">
                      <p className="text-[8px] text-slate-400 font-mono">{h.period}</p>
                      <p className="text-[10px] font-bold text-amber-400 font-mono">{h.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>{isAr ? 'قيم بواسطة: ' : 'Evaluator: '}{sc.evaluatedBy}</span>
              <span className="font-mono">{new Date(sc.evaluatedAt).toLocaleDateString('en-US')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
