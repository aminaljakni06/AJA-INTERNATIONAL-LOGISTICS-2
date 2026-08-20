import React, { useState } from 'react';
import {
  Award,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserCheck,
  Search,
  Zap,
  BarChart2
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { VendorMaster, SupplierScorecard } from '../../../types/procurement';

interface SupplierPerformanceCenterProps {
  scorecards: SupplierScorecard[];
  vendors: VendorMaster[];
}

export const SupplierPerformanceCenter: React.FC<SupplierPerformanceCenterProps> = ({ scorecards, vendors }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedVendorId, setSelectedVendorId] = useState<string>(scorecards[0]?.vendorId || '');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const selectedScorecard = scorecards.find(s => s.vendorId === selectedVendorId) || scorecards[0];
  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const formatRating = (score: number) => {
    if (score >= 95) return { label: isAr ? 'ممتاز جداً (A+)' : 'Excellent (A+)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 90) return { label: isAr ? 'ممتاز (A)' : 'Outstanding (A)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score >= 80) return { label: isAr ? 'جيد جداً (B)' : 'Good (B)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    return { label: isAr ? 'تحت التقييم (C)' : 'Needs Review (C)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              SRM SCORECARD 360
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مركز تقييم وأداء الموردين الاستراتيجي (Supplier Performance Center)' : 'Supplier Performance & SRM Intelligence Center'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تتبع أداء الموردين، سرعة التوريد، معدل الجودة، الالتزام بالعقود، وتوليد بطاقات الأداء المتوازنة'
              : 'Continuous vendor performance monitoring across Delivery, Quality, Pricing, Compliance, ESG, and Claims'}
          </p>
        </div>
      </div>

      {/* SUPPLIER SELECTOR & OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SUPPLIER DIRECTORY LIST */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'دليل الموردين المقيّمين' : 'Evaluated Vendors'}</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">{scorecards.length} {isAr ? 'مورد' : 'vendors'}</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {scorecards.map((sc) => {
              const isSelected = sc.vendorId === selectedVendorId;
              const rating = formatRating(sc.overallScore);
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedVendorId(sc.vendorId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{sc.vendorName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{sc.vendorCode}</span>
                      <span>•</span>
                      <span>{sc.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-amber-400 font-mono">{sc.overallScore} / 100</p>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${rating.color}`}>
                      {rating.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED SUPPLIER SCORECARD DETAILS */}
        {selectedScorecard && (
          <div className="lg:col-span-2 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md font-mono">
                    {selectedScorecard.tier} TIER
                  </span>
                  <h2 className="text-lg font-bold text-white">{selectedScorecard.vendorName}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {isAr ? 'رمز المورد: ' : 'Vendor Code: '}{selectedScorecard.vendorCode} | {isAr ? 'الفترة: ' : 'Period: '}{selectedScorecard.period}
                </p>
              </div>

              <div className="text-right bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400 font-medium">{isAr ? 'الدرجة التراكمية الشاملة' : 'Overall Score'}</p>
                <p className="text-2xl font-black text-amber-400 font-mono">{selectedScorecard.overallScore} / 100</p>
              </div>
            </div>

            {/* KPI METRIC TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Delivery */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? 'الالتزام بالتسليم OTIF' : 'On-Time Delivery'}</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{selectedScorecard.onTimeDeliveryPct}%</p>
                <p className="text-[10px] text-emerald-400 font-mono">Target: 95.0%</p>
              </div>

              {/* Quality */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? 'نسبة الجودة والخلو من العيوب' : 'Quality & Defect Rate'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{(100 - selectedScorecard.defectRatePct).toFixed(1)}%</p>
                <p className="text-[10px] text-slate-400 font-mono">Defect: {selectedScorecard.defectRatePct}%</p>
              </div>

              {/* Response Time */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? 'زمن الاستجابة للاقتباس' : 'RFQ Response Time'}</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{selectedScorecard.rfqResponseHours} hrs</p>
                <p className="text-[10px] text-cyan-400 font-mono">Fast Response</p>
              </div>

              {/* Claims */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? 'عدد المطالبات والشكاوى' : 'Claims Count'}</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{selectedScorecard.claimsCount}</p>
                <p className="text-[10px] text-slate-400 font-mono">Low Claims</p>
              </div>

              {/* Lead Time */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? 'متوسط مدة التوريد' : 'Avg Lead Time'}</span>
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{selectedScorecard.leadTimeAvgDays} days</p>
                <p className="text-[10px] text-purple-300 font-mono">Very Fast</p>
              </div>

              {/* Ranking */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? 'الترتيب بين الموردين' : 'Vendor Ranking'}</span>
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-lg font-bold text-amber-400 font-mono">#{selectedScorecard.ranking}</p>
                <p className="text-[10px] text-amber-300 font-mono">Top Category Tier</p>
              </div>
            </div>

            {/* WEIGHTED BALANCED SCORECARD TABLE */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'بطاقة الأداء المتوازنة والمقاييس الموزونة (Balanced Scorecard)' : 'Balanced Scorecard Breakdown'}</span>
              </h3>

              <div className="space-y-2">
                {Object.entries(selectedScorecard.kpis).map(([key, kpi], idx) => (
                  <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-[10px] text-slate-400">Weight: {(kpi.weight * 100)}% | Target: {kpi.target}{kpi.unit}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-300">Actual: <strong className="text-white">{kpi.actual}{kpi.unit}</strong></span>
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        {kpi.score} / 100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
