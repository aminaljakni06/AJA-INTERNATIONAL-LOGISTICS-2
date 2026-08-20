import React from 'react';
import {
  Award,
  AlertOctagon,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Percent,
  RefreshCcw
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Customer360Profile } from '../../../types/customer360';

interface CustomerHealthDashboardProps {
  customer: Customer360Profile;
  onRecalculate: () => void;
}

export const CustomerHealthDashboard: React.FC<CustomerHealthDashboardProps> = ({
  customer,
  onRecalculate,
}) => {
  const health = customer.healthScore;
  const risk = customer.riskScore;
  const clv = customer.clv;

  const getHealthBadge = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50', label: 'ممتاز (EXCELLENT)' };
    if (score >= 75) return { bg: 'bg-blue-900/60 text-blue-300 border-blue-500/50', label: 'جيد جداً (GOOD)' };
    if (score >= 60) return { bg: 'bg-amber-900/60 text-amber-300 border-amber-500/50', label: 'متوسط (AVERAGE)' };
    return { bg: 'bg-rose-900/60 text-rose-300 border-rose-500/50', label: 'حرج (CRITICAL)' };
  };

  const getRiskBadge = (r: string) => {
    if (r === 'LOW') return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
    if (r === 'MEDIUM') return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
    return 'bg-rose-900/60 text-rose-300 border-rose-500/50';
  };

  const badge = getHealthBadge(health?.overallScore || 80);

  return (
    <div className="space-y-6 text-slate-100 text-xs">
      {/* Top Banner & Health Metric Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Main Card */}
        <Card className="bg-slate-800 border-slate-700 p-5 space-y-4 md:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>مؤشر الصحة الكلي (Health Score)</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={onRecalculate} className="p-1 text-slate-400 hover:text-white" title="إعادة الحساب">
              <RefreshCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-emerald-500/30 bg-slate-900">
              <span className="text-4xl font-extrabold text-emerald-400 font-mono">
                {health?.overallScore || 85}
              </span>
              <span className="text-[10px] text-slate-400 absolute bottom-3 font-mono">/ 100</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-700 leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 inline ml-1" />
            {health?.aiRecommendation || 'مؤشر أداء صحي ممتاز. يظهر العميل نموذج تعامل مستقر مع نسبة وفاء عالية.'}
          </p>
        </Card>

        {/* Risk Score & Trend */}
        <Card className="bg-slate-800 border-slate-700 p-5 space-y-4 md:col-span-1">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>مؤشر تقييم المخاطر (Risk Engine)</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
              <span className="text-slate-300 font-medium">التقييم الشامل للمخاطر:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getRiskBadge(risk?.overallRisk || 'LOW')}`}>
                {risk?.overallRisk || 'LOW'} ({risk?.riskScore || 12}/100)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-slate-400 block">المخاطر المالية:</span>
                <span className="font-bold text-slate-100">{risk?.financialRisk || 'LOW'}</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-slate-400 block">مخاطر الائتمان:</span>
                <span className="font-bold text-slate-100">{risk?.creditRisk || 'LOW'}</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-slate-400 block">الامتثال والتحقق:</span>
                <span className="font-bold text-slate-100">{risk?.complianceRisk || 'LOW'}</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-slate-400 block">مخاطر الاحتيال:</span>
                <span className="font-bold text-slate-100">{risk?.fraudRisk || 'LOW'}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700 text-[11px] text-slate-300">
              <strong>الاتجاه التاريخي:</strong> {risk?.historicalTrend || 'STABLE'} • {risk?.notes || 'سجل آمن'}
            </div>
          </div>
        </Card>

        {/* Customer Lifetime Value (CLV) */}
        <Card className="bg-slate-800 border-slate-700 p-5 space-y-4 md:col-span-1">
          <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span>القيمة التراكمية والتوقعات (CLV)</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center">
              <span className="text-slate-300 font-medium">إجمالي الإيرادات التراكمية:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {(clv?.totalRevenue || 0).toLocaleString()} SAR
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 text-[11px]">
                <span className="text-slate-400 block">هامش الربحية:</span>
                <span className="font-mono font-bold text-blue-300">{clv?.profitMarginPct || 22}%</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 text-[11px]">
                <span className="text-slate-400 block">النمو السنوي YoY:</span>
                <span className="font-mono font-bold text-emerald-400">+{clv?.yearOverYearGrowthPct || 24.5}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded border border-slate-700 space-y-1">
              <span className="text-slate-400 text-[11px] block">توقع LTV للسنة القادمة (1-Year Forecast):</span>
              <span className="font-mono font-bold text-amber-400 text-sm block">
                {(clv?.forecastedLtv1Yr || 1500000).toLocaleString()} SAR
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Health Components Breakdown Progress Bars */}
      <Card className="bg-slate-800 border-slate-700 p-5 space-y-4">
        <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 pb-2 border-b border-slate-700">
          <Activity className="w-4 h-4" />
          <span>تفاصيل المؤشرات الفرعية لحساب درجة الصحة</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'مساهمة الإيرادات', score: health?.breakdown?.revenueContribution || 95 },
            { label: 'الانتظام في السداد والوفاء', score: health?.breakdown?.paymentPunctuality || 92 },
            { label: 'نمو حجم الشحنات', score: health?.breakdown?.shipmentVolumeTrend || 94 },
            { label: 'سجل الشكاوى والانضباط', score: health?.breakdown?.complaintRate || 98 },
            { label: 'صلاحية العقود والامتداد', score: health?.breakdown?.contractValidity || 90 },
            { label: 'التفاعل ومؤشر NPS', score: health?.breakdown?.npsSatisfaction || 92 },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-700/80">
              <div className="flex justify-between font-bold text-slate-200 text-xs">
                <span>{item.label}</span>
                <span className="font-mono text-amber-400">{item.score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
