import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Award,
  TrendingUp,
  Search,
  Users,
  MapPin,
  Building2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { ProfitabilitySegment } from '../../../types/fpa';

export const ProfitabilityAnalysisView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [segments, setSegments] = useState<ProfitabilitySegment[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => setSegments(snapshot.profitabilitySegments));
  }, []);

  const filtered = segments.filter(s => filterType === 'ALL' || s.segmentType === filterType);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'منظومة تحليل الربحية متعددة الأبعاد (Multi-Dimensional Profitability Ledger)' : 'Customer, Route, Branch & Service Line Profitability Ledger'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'ربحية العملاء، مسارات الشحن، الموانئ والفروع التشغيلية' : 'Gross Revenue, Direct Costs, Overhead Deductions & Net Profitability Ranking'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تحليل هامش الربح الصافي لكل عميل رئيسي أو مسار لوجستي بعد احتساب التكاليف المباشرة وغير المباشرة' : 'Evaluate net margins after deducting direct transport/warehouse costs and allocated central overheads.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filterType === 'ALL' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilterType('CUSTOMER')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filterType === 'CUSTOMER' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'العملاء' : 'Customers'}
          </button>
          <button
            onClick={() => setFilterType('ROUTE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filterType === 'ROUTE' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'المسارات' : 'Routes'}
          </button>
          <button
            onClick={() => setFilterType('BRANCH')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filterType === 'BRANCH' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {isAr ? 'الفروع' : 'Branches'}
          </button>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-4">
        {filtered.map(seg => (
          <div key={seg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center border border-sky-500/30 text-xs">
                  #{seg.profitabilityRank}
                </span>
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">{seg.segmentType}</span>
                  <h3 className="text-base font-bold text-white">{isAr ? seg.segmentNameAr : seg.segmentNameEn}</h3>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">{isAr ? 'هامش الربح الصافي:' : 'Net Margin:'}</div>
                <div className="text-lg font-extrabold text-emerald-400">+{seg.netMarginPercent}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الإيراد الإجمالي:' : 'Gross Revenue:'}</div>
                <div className="text-sm font-bold text-white">SAR {(seg.grossRevenueSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'التكلفة المباشرة:' : 'Direct Cost:'}</div>
                <div className="text-sm font-bold text-rose-400">SAR {(seg.directCostSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'التكاليف الموزعة:' : 'Allocated Overhead:'}</div>
                <div className="text-sm font-bold text-amber-400">SAR {(seg.allocatedOverheadSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'صافي الربح:' : 'Net Profit:'}</div>
                <div className="text-sm font-bold text-emerald-400">SAR {(seg.netProfitSAR / 1000000).toFixed(2)}M</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
