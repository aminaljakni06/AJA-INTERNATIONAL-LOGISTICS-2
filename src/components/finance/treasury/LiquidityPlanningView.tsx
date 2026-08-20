import React, { useEffect, useState } from 'react';
import {
  Clock,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { LiquidityForecastItem, ScenarioType } from '../../../types/treasury';

export const LiquidityPlanningView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [forecasts, setForecasts] = useState<LiquidityForecastItem[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('BASE_CASE');

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(snapshot => setForecasts(snapshot.liquidityForecasts));
  }, []);

  const scenarioMultiplier = selectedScenario === 'OPTIMISTIC' ? 1.15 : selectedScenario === 'STRESS_SCENARIO' ? 0.75 : 1.0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'منظومة تخطيط السيولة والتنبؤ بالتدفقات النقدية' : 'Rolling Liquidity Planning & Cash Gap Simulator'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'التنبؤ المتداول بالسيولة (4 أسابيع) ونماذج محاكاة السيناريوهات' : '4-Week Rolling Cash Flow Forecast & Stress Testing Engine'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'توقع التدفقات النقدية الداخلة والخارجة، اكتشاف الفجوات المالية، وتحليل السيناريوهات المتحفظة والمتفائلة' : 'Predict weekly liquidity positions, identify prospective funding gaps & run scenario models.'}
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          {(['BASE_CASE', 'OPTIMISTIC', 'STRESS_SCENARIO'] as ScenarioType[]).map(sc => (
            <button
              key={sc}
              onClick={() => setSelectedScenario(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedScenario === sc
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sc.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Weekly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {forecasts.map(f => {
          const adjInflow = f.projectedInflowSAR * scenarioMultiplier;
          const net = adjInflow - f.projectedOutflowSAR;

          return (
            <div
              key={f.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white">{f.periodLabel}</span>
                <span className="text-[10px] text-sky-400 font-bold">{f.confidenceLevelPercent}% Conf</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? 'التدفق الوارد المتوقع:' : 'Projected Inflow:'}</span>
                  <span className="text-emerald-400 font-bold">SAR {(adjInflow / 1000000).toFixed(2)}M</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? 'التدفق الصادر المتوقع:' : 'Projected Outflow:'}</span>
                  <span className="text-rose-400 font-bold">SAR {(f.projectedOutflowSAR / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">{isAr ? 'صافي السيولة:' : 'Net Position:'}</span>
                <span className={`font-extrabold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  SAR {(net / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liquidity Gap & Working Capital Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span>{isAr ? 'جدول الفجوات المالية والرصيد المتوقع نهاية كل أسبوع' : 'Ending Cash Position & Funding Gap Ledger'}</span>
          <span className="text-xs text-sky-400">Scenario: {selectedScenario}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'الفترة الزمنية' : 'Forecast Horizon'}</th>
                <th className="p-3">{isAr ? 'التدفقات النقدية الواردة' : 'Inflows (SAR)'}</th>
                <th className="p-3">{isAr ? 'التدفقات النقدية الصادرة' : 'Outflows (SAR)'}</th>
                <th className="p-3">{isAr ? 'صافي الحركة' : 'Net Movement'}</th>
                <th className="p-3">{isAr ? 'رصيد السيولة المتوقع في النهاية' : 'Ending Liquidity'}</th>
                <th className="p-3">{isAr ? 'الفجوة المالية (Funding Gap)' : 'Funding Gap Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {forecasts.map(f => {
                const adjInflow = f.projectedInflowSAR * scenarioMultiplier;
                const net = adjInflow - f.projectedOutflowSAR;

                return (
                  <tr key={f.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white">{f.periodLabel}</td>
                    <td className="p-3 text-emerald-400">SAR {adjInflow.toLocaleString()}</td>
                    <td className="p-3 text-rose-400">SAR {f.projectedOutflowSAR.toLocaleString()}</td>
                    <td className={`p-3 font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      SAR {net.toLocaleString()}
                    </td>
                    <td className="p-3 font-extrabold text-white">SAR {(f.endingCashPositionSAR + (net - f.netCashFlowSAR)).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ NO GAP (SURPLUS)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
