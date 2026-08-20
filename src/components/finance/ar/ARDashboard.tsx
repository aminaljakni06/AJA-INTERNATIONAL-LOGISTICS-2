import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient, AccountsReceivableSnapshot } from '../../../services/accountsReceivableClient';

interface ARDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const ARDashboard: React.FC<ARDashboardProps> = ({ onNavigateTab }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [snapshot, setSnapshot] = useState<AccountsReceivableSnapshot | null>(null);

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(setSnapshot);
  }, []);

  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm">
        {isAr ? 'جاري تحميل بيانات الحسابات المدينة...' : 'Loading accounts receivable dashboard...'}
      </div>
    );
  }

  const { analytics, invoices, aiInsights } = snapshot;

  const openInvoicesCount = invoices.filter(i => i.balanceDueSAR > 0).length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'SENT' || i.status === 'PARTIALLY_PAID').length;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receivables Portfolio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              {isAr ? 'إجمالي المحفظة المدينة' : 'Total Receivables'}
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            SAR {analytics.totalReceivablesSAR.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>+4.2% {isAr ? 'مقارنة بالشهر الماضي' : 'vs last month'}</span>
          </div>
        </div>

        {/* Days Sales Outstanding (DSO) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              {isAr ? 'أيام التحصيل (DSO)' : 'Days Sales Outstanding'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {analytics.dsoDays} {isAr ? 'يوم' : 'Days'}
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{isAr ? 'ممتاز' : 'Target:'} 35 {isAr ? 'يوم' : 'Days'}</span>
            <span>• {isAr ? 'سداد أسرع بـ 3 أيام' : '3 days faster'}</span>
          </div>
        </div>

        {/* Collection Efficiency Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              {isAr ? 'كفاءة التحصيل (CEI)' : 'Collection Efficiency'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
            {analytics.collectionEfficiencyPercent}%
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="text-blue-400 font-medium">{isAr ? 'نسبة الاسترداد النقدي' : 'Cash Inflow Rate'}</span>
          </div>
        </div>

        {/* High Risk Accounts & Holds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              {isAr ? 'حسابات تحت الإيقاف والخطورة' : 'Credit Holds & High Risk'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {analytics.highRiskCustomersCount} {isAr ? 'حسابات' : 'Accounts'}
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-amber-400/90 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{isAr ? 'تتطلب مراجعة فورية' : 'Immediate review needed'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Aging Breakdown & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receivables Aging Portfolio Summary */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {isAr ? 'ملخص أعمار الديون والمستحقات (AR Aging Buckets)' : 'Receivables Aging Breakdown'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'توزيع المستحقات المالية حسب فترات التأخير والسداد' : 'Distribution of open balances by aging categories'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('ar-aging')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 transition-all border border-slate-700"
            >
              {isAr ? 'عرض الميزانية بالتفصيل ←' : 'Full Aging Dashboard →'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Current (0-30 Days) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">{isAr ? 'الحالية (0 - 30 يوم)' : 'Current (0-30 Days)'}</span>
                <span className="text-slate-300 font-bold">SAR {analytics.currentReceivablesSAR.toLocaleString()} (38%)</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>

            {/* Overdue 31-60 Days */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">{isAr ? 'متأخرة (31 - 60 يوم)' : 'Overdue (31-60 Days)'}</span>
                <span className="text-slate-300 font-bold">SAR {analytics.overdue1_30SAR.toLocaleString()} (30%)</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            {/* Overdue 61-90 Days */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">{isAr ? 'متأخرة (61 - 90 يوم)' : 'Overdue (61-90 Days)'}</span>
                <span className="text-slate-300 font-bold">SAR {analytics.overdue31_60SAR.toLocaleString()} (12%)</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            {/* Overdue 90+ Days */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">{isAr ? 'حرجة جداً (أكثر من 90 يوم)' : 'Critical Overdue (90+ Days)'}</span>
                <span className="text-slate-300 font-bold">SAR {analytics.overdue90PlusSAR.toLocaleString()} (20%)</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] text-slate-400">{isAr ? 'الفواتير المفتوحة' : 'Open Invoices'}</div>
              <div className="text-lg font-bold text-white font-mono">{openInvoicesCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] text-slate-400">{isAr ? 'فواتير متأخرة السداد' : 'Overdue Invoices'}</div>
              <div className="text-lg font-bold text-rose-400 font-mono">{overdueInvoicesCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] text-slate-400">{isAr ? 'إجمالي الحدود الائتمانية' : 'Credit Portfolio'}</div>
              <div className="text-lg font-bold text-sky-400 font-mono">
                SAR {(analytics.totalCreditLimitsSAR / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-[11px] text-slate-400">{isAr ? 'تحصيل 30 يوم المتوقع' : '30-Day Forecast'}</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                SAR {(analytics.predictedCollection30DaysSAR / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>

        {/* AI Receivables Intelligence Quick Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'الذكاء الاصطناعي للمستحقات' : 'AI Receivables Advisor'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                LIVE AI
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {aiInsights.slice(0, 2).map(insight => (
                <div
                  key={insight.id}
                  className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2 hover:border-sky-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{isAr ? insight.titleAr : insight.titleEn}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      insight.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {insight.confidenceScore}% {isAr ? 'دقة' : 'Conf'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isAr ? insight.descriptionAr : insight.descriptionEn}
                  </p>
                  <div className="pt-1 text-[11px] text-sky-400 font-semibold border-t border-slate-700/50">
                    💡 {isAr ? insight.recommendedActionAr : insight.recommendedActionEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('ar-ai-intelligence')}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <Zap className="w-4 h-4" />
            <span>{isAr ? 'فتح مركز التحليلات والتنبؤ الذكي' : 'Open AI Receivables Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-bold text-slate-200">
          {isAr ? 'الإجراءات السريعة في منظومة تحصيل وإصدار فواتير العملاء:' : 'Quick Navigation Actions:'}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('ar-billing')}
            className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'مركز الفوترة وإصدار السلسلة' : 'Customer Billing Center'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('ar-invoices')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>{isAr ? 'إدارة وسجل الفواتير' : 'Invoices Workspace'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('ar-collections')}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'إدارة التحصيل والمطالبات' : 'Collections & Dunning'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('ar-credit')}
            className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isAr ? 'إدارة الائتمان والحدود' : 'Credit Management'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
