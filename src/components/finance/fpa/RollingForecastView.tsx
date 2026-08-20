import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  BarChart2,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { ForecastPeriod } from '../../../types/fpa';

export const RollingForecastView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [forecasts, setForecasts] = useState<ForecastPeriod[]>([]);

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => setForecasts(snapshot.forecastPeriods));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'منظومة التنبؤ المستمر والتحليلات المستقبليّة (12-Month Rolling Forecast)' : '12-Month Rolling Financial Forecast & Adjustment Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'التوقعات المالية المتجددة، الإيرادات وهامش الأرباح (EBITDA)' : 'Quarterly Rolling Forecast Baseline & EBITDA Projection Matrix'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تتبع الإيرادات والمصاريف المتوقعة مقابل الميزانية وتحديث التوقعات دورياً بناءً على نتائج السوق' : 'Dynamic continuous financial forecasting integrating historical actuals with future revenue & cost adjustments.'}
          </p>
        </div>
      </div>

      {/* Forecast Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase">{isAr ? 'جدول التوقعات المالية الربع سنوية (Quarterly Forecast Matrix)' : 'Quarterly Financial Forecast Baseline'}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'الفترة المالية' : 'Fiscal Period'}</th>
                <th className="p-3">{isAr ? 'الميزانية (إيراد)' : 'Budget Revenue'}</th>
                <th className="p-3">{isAr ? 'التوقع (إيراد)' : 'Forecast Revenue'}</th>
                <th className="p-3">{isAr ? 'الفعلي (إيراد)' : 'Actual Revenue'}</th>
                <th className="p-3">{isAr ? 'الميزانية (مصروف)' : 'Budget Expense'}</th>
                <th className="p-3">{isAr ? 'التوقع (مصروف)' : 'Forecast Expense'}</th>
                <th className="p-3">{isAr ? 'متوقع EBITDA' : 'Forecast EBITDA'}</th>
                <th className="p-3">{isAr ? 'هامش EBITDA' : 'EBITDA Margin'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {forecasts.map(fc => (
                <tr key={fc.id} className="hover:bg-slate-800/80">
                  <td className="p-3 font-bold text-white">{fc.periodLabel}</td>
                  <td className="p-3 text-slate-300">SAR {(fc.budgetRevenueSAR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-bold text-sky-400">SAR {(fc.forecastRevenueSAR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {fc.actualRevenueSAR > 0 ? `SAR ${(fc.actualRevenueSAR / 1000000).toFixed(1)}M` : '-'}
                  </td>
                  <td className="p-3 text-slate-300">SAR {(fc.budgetExpenseSAR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-amber-400">SAR {(fc.forecastExpenseSAR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-bold text-emerald-400">SAR {(fc.forecastEbitdaSAR / 1000000).toFixed(1)}M</td>
                  <td className="p-3 font-bold text-sky-400">{fc.ebitdaMarginPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
