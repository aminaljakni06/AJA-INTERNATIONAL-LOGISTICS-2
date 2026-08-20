import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ContractComplianceMetric, ContractComplianceSummary } from '../../../types/procurement';

interface ContractComplianceDashboardProps {
  data: {
    summary: ContractComplianceSummary;
    metrics: ContractComplianceMetric[];
  } | null;
}

export const ContractComplianceDashboard: React.FC<ContractComplianceDashboardProps> = ({ data }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-800">
        <FileText className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-pulse" />
        <p>{isAr ? 'جاري تحميل لوحة امتثال العقود...' : 'Loading Contract Compliance Dashboard...'}</p>
      </div>
    );
  }

  const { summary, metrics } = data;

  const formatSAR = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M SAR`;
    return `${(val / 1000).toFixed(0)}K SAR`;
  };

  const getComplianceStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'EXPIRING_SOON':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MAVERICK_RISK':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              CONTRACT COMPLIANCE
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'لوحة تتبع وامتثال العقود المبرمة (Contract Compliance Dashboard)' : 'Contract Compliance & Maverick Spend Control'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'مراقبة نسبة استهلاك قيمة العقود، التجديدات القادمة، الامتثال للأسعار التعاقدية، والحد من الشراء المباشر'
              : 'Monitor contract utilization, expiry timeline, price adherence, and off-contract leakage'}
          </p>
        </div>
      </div>

      {/* KPI TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contracted Spend */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'الإنفاق تحت العقود المعتمدة' : 'Contracted Spend'}</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono mt-1">
              {formatSAR(summary.totalContractedSpendSAR)}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">
              {summary.activeContractsCount} {isAr ? 'عقود نشطة' : 'Active Contracts'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Utilization */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'متوسط نسبة استهلاك العقود' : 'Avg Utilization'}</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {summary.avgContractUtilizationPct}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Optimal Range</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Maverick Spend Rate */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'الإنفاق المباشر غير التعاقدي' : 'Maverick Spend Rate'}</p>
            <h3 className="text-2xl font-black text-rose-400 font-mono mt-1">
              {summary.maverickRatePct}%
            </h3>
            <p className="text-[11px] text-rose-400 mt-1 font-mono">
              {formatSAR(summary.maverickSpendSAR)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{isAr ? 'عقود تنتهي خلال 30 يوماً' : 'Expiring in 30 Days'}</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono mt-1">
              {summary.expiringWithin30DaysCount}
            </h3>
            <p className="text-[11px] text-amber-400 mt-1 font-mono">Action Required</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* METRICS & CONTRACT UTILIZATION TABLE */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>{isAr ? 'تفاصيل استهلاك الامتثال التعاقدي والأسعار' : 'Contract Compliance & Utilization Breakdown'}</span>
        </h2>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
              <tr>
                <th className="p-3">{isAr ? 'العقد / المورد' : 'Contract / Supplier'}</th>
                <th className="p-3 text-center">{isAr ? 'القيمة الإجمالية' : 'Total Value'}</th>
                <th className="p-3 text-center">{isAr ? 'المستهلك (Utilization)' : 'Utilized Amount'}</th>
                <th className="p-3 text-center">{isAr ? 'الامتثال للأسعار' : 'Price Adherence'}</th>
                <th className="p-3 text-center">{isAr ? 'أيام الصلاحية المتبقية' : 'Days Remaining'}</th>
                <th className="p-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {metrics.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-3">
                    <p className="font-bold text-white">{item.contractTitle}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{item.vendorName} • {item.category}</p>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-amber-300">
                    {formatSAR(item.totalContractValueSAR)}
                  </td>
                  <td className="p-3 text-center font-mono">
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-400">{formatSAR(item.utilizedAmountSAR)} ({item.utilizationPct}%)</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden max-w-[120px] mx-auto">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.utilizationPct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-cyan-400">
                    {item.pricingCompliancePct}%
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-amber-400">
                    {item.expirationDaysLeft} {isAr ? 'يوم' : 'days'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${getComplianceStatusBadge(item.status)}`}>
                      {item.status}
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
