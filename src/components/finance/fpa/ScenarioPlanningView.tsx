import React, { useEffect, useState } from 'react';
import {
  Sliders,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  PieChart,
  Activity,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { ScenarioModel } from '../../../types/fpa';

export const ScenarioPlanningView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [scenarios, setScenarios] = useState<ScenarioModel[]>([]);
  const [activeScenario, setActiveScenario] = useState<ScenarioModel | null>(null);

  // Dynamic simulation controls
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
  const [fuelIncrease, setFuelIncrease] = useState<number>(0);

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => {
      setScenarios(snapshot.scenarioModels);
      const firstScenario = snapshot.scenarioModels[0] || null;
      setActiveScenario(firstScenario);
      setRevenueGrowth(firstScenario?.revenueGrowthAssumptionPercent || 0);
      setFuelIncrease(firstScenario?.fuelCostIncreasePercent || 0);
    });
  }, []);

  const calculatedEbitda = Math.round(
    (activeScenario?.projectedEbitdaSAR || 0) * (1 + (revenueGrowth - (activeScenario?.revenueGrowthAssumptionPercent || 0)) / 100) * (1 - fuelIncrease * 0.005)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Sliders className="w-4 h-4" />
            <span>{isAr ? 'مختبر محاكاة السيناريوهات والتخطيط الافتراضي (What-If Simulation Studio)' : 'Scenario Planning, Sensitivity & What-If Financial Simulation Studio'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مقارنة السيناريوهات المالية: الأساسي، المتفائل، واختبار الضغط التحفظي' : 'Best Case, Base Case & Pessimistic Stress-Test Financial Modeling'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'محاكاة تأثير التغير في نمو الإيرادات، تضخم أسعار الوقود والعمالة على صافي الربحية وEBITDA' : 'Simulate financial outcomes by tweaking revenue trajectory, fuel cost spikes, and labor inflation rates.'}
          </p>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map(scen => (
          <div
            key={scen.id}
            onClick={() => {
              setActiveScenario(scen);
              setRevenueGrowth(scen.revenueGrowthAssumptionPercent);
              setFuelIncrease(scen.fuelCostIncreasePercent);
            }}
            className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 shadow-xl ${
              activeScenario.id === scen.id
                ? 'bg-sky-500/10 border-sky-500 shadow-sky-500/5'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                scen.scenarioType === 'OPTIMISTIC'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : scen.scenarioType === 'PESSIMISTIC_STRESS'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
              }`}>
                {scen.scenarioType}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{isAr ? scen.scenarioNameAr : scen.scenarioNameEn}</h3>

            <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'افتراض نمو الإيراد:' : 'Revenue Growth:'}</span>
                <span className="text-white font-bold">+{scen.revenueGrowthAssumptionPercent}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'تضخم الوقود:' : 'Fuel Inflation:'}</span>
                <span className="text-amber-400 font-bold">+{scen.fuelCostIncreasePercent}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'EBITDA المتوقع:' : 'Projected EBITDA:'}</span>
                <span className="text-emerald-400 font-bold">SAR {(scen.projectedEbitdaSAR / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic What-If Interactive Simulator */}
      {activeScenario && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">
              {isAr ? 'محاكي الحساسية والتأثير المالي المباشر (Interactive Sensitivity Playground)' : 'Live Interactive Financial Sensitivity Playground'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'قم بتحريك المؤشرات أدناه لمشاهدة التغير الفوري على EBITDA الأرباح المستهدفة' : 'Adjust variables to simulate instant impact on total company projected EBITDA.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="space-y-5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-2">
                  <span>{isAr ? 'معدل نمو الإيرادات المتوقع (Revenue Growth %):' : 'Projected Revenue Growth %:'}</span>
                  <span className="text-sky-400 font-bold">{revenueGrowth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={revenueGrowth}
                  onChange={e => setRevenueGrowth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-2">
                  <span>{isAr ? 'نسبة زيادة أسعار الوقود (Fuel Cost Spike %):' : 'Fuel Cost Spike %:'}</span>
                  <span className="text-amber-400 font-bold">{fuelIncrease}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={fuelIncrease}
                  onChange={e => setFuelIncrease(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Calculated Impact Card */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-mono text-slate-400">{isAr ? 'الأرباح المستهدفة المحاكاة (Simulated EBITDA):' : 'Simulated Projected EBITDA:'}</div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                  SAR {(calculatedEbitda / 1000000).toFixed(2)}M
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300 space-y-1 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-sky-400">{isAr ? 'تقييم المخاطر الاستراتيجية:' : 'Strategic Risk Assessment:'}</div>
                <p className="text-slate-400">{isAr ? activeScenario.riskAssessmentAr : activeScenario.riskAssessmentEn}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
