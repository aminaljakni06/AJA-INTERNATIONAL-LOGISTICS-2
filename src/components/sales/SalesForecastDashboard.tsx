import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart2,
  CheckCircle2,
  PieChart,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Opportunity, SalesKpiSummary } from '../../types/sales';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface SalesForecastDashboardProps {
  kpis: SalesKpiSummary | null;
  opportunities: Opportunity[];
}

export const SalesForecastDashboard: React.FC<SalesForecastDashboardProps> = ({
  kpis,
  opportunities,
}) => {
  // Calculate Forecast Categories breakdown
  const commitOpps = opportunities.filter(o => o.forecastCategory === 'COMMIT');
  const bestCaseOpps = opportunities.filter(o => o.forecastCategory === 'BEST_CASE');
  const pipelineOpps = opportunities.filter(o => o.forecastCategory === 'PIPELINE');
  const wonOpps = opportunities.filter(o => o.stage === 'WON');

  const commitTotal = commitOpps.reduce((acc, o) => acc + o.expectedRevenue, 0);
  const bestCaseTotal = bestCaseOpps.reduce((acc, o) => acc + o.expectedRevenue, 0);
  const pipelineTotal = pipelineOpps.reduce((acc, o) => acc + o.expectedRevenue, 0);
  const wonTotal = wonOpps.reduce((acc, o) => acc + o.expectedRevenue, 0);

  const forecastData = [
    { category: 'الصفقات المحسومة (Won)', amount: wonTotal, fill: '#10B981' },
    { category: 'التزامات مؤكدة (Commit)', amount: commitTotal, fill: '#3B82F6' },
    { category: 'أفضل سيناريو (Best Case)', amount: bestCaseTotal, fill: '#F59E0B' },
    { category: 'أنبوب الاستكشاف (Pipeline)', amount: pipelineTotal, fill: '#6B7280' },
  ];

  const stageData = [
    {
      stage: 'استكشاف',
      value: opportunities.filter(o => o.stage === 'PROSPECTING').reduce((acc, o) => acc + o.expectedRevenue, 0),
    },
    {
      stage: 'تأهيل',
      value: opportunities.filter(o => o.stage === 'QUALIFICATION').reduce((acc, o) => acc + o.expectedRevenue, 0),
    },
    {
      stage: 'العروض',
      value: opportunities.filter(o => o.stage === 'PROPOSAL').reduce((acc, o) => acc + o.expectedRevenue, 0),
    },
    {
      stage: 'المفاوضات',
      value: opportunities.filter(o => o.stage === 'NEGOTIATION').reduce((acc, o) => acc + o.expectedRevenue, 0),
    },
    {
      stage: 'الاعتماد',
      value: opportunities.filter(o => o.stage === 'APPROVAL').reduce((acc, o) => acc + o.expectedRevenue, 0),
    },
    {
      stage: 'تم الفوز',
      value: wonTotal,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Forecast Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الأنبوب البيعي</span>
            <DollarSign className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {kpis?.totalPipelineValue.toLocaleString()} SAR
          </div>
          <div className="text-[11px] text-slate-400 mt-1">القيمة الإجمالية للفرص النشطة</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>القيمة الموزونة بالاحتمال</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {kpis?.weightedPipelineValue.toLocaleString()} SAR
          </div>
          <div className="text-[11px] text-slate-400 mt-1">محسوبة بناءً على احتمال إغلاق كل صفقة</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>الهدف الربع سنوي (Q1 2026)</span>
            <Target className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {kpis?.quarterlyTarget.toLocaleString()} SAR
          </div>
          <div className="text-[11px] text-sky-400 mt-1 font-bold">
            محتسب بنسبة إنجاز {kpis?.targetAchievementPct}%
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>متوسط دورة البيع الإقليمية</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {kpis?.avgDealCycleDays} يوماً
          </div>
          <div className="text-[11px] text-purple-300 mt-1">من الاستكشاف الأول حتى إغلاق العقد</div>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Categories Chart */}
        <Card className="p-5 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#EA580C]" />
                <span>توزيع فئات التنبؤ المالي (Forecast Categories)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">تصنيف حجم المبيعات حسب درجة الموثوقية</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} SAR`, 'المبلغ']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {forecastData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pipeline Value by Stage Chart */}
        <Card className="p-5 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-400" />
                <span>قيمة الأنبوب حسب مرحلة البيع</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5"> توزيع المبالغ على مراحل التفاوض والتقديم</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="stage" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} SAR`, 'القيمة']}
                />
                <Bar dataKey="value" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Target Progress Bar */}
      <Card className="p-5 bg-slate-900/90 border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EA580C]" />
            <h3 className="font-bold text-sm text-slate-100">تقدم إنجاز الأهداف الربع سنوية - Q1 2026</h3>
          </div>
          <span className="font-mono font-bold text-sm text-emerald-400">
            {wonTotal.toLocaleString()} SAR / {kpis?.quarterlyTarget.toLocaleString()} SAR
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-[#EA580C] to-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, kpis?.targetAchievementPct || 0)}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 text-right">
          تم تحقيق <strong className="text-slate-200">{kpis?.targetAchievementPct}%</strong> من الإيراد المستهدف لـ Q1
          2026 عبر عقود الشحن والتخليص الجمركي المبرمة.
        </p>
      </Card>
    </div>
  );
};
