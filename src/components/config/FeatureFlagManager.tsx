import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, AlertOctagon, Sliders, Calendar, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { FeatureFlag } from '../../types/config';

export const FeatureFlagManager: React.FC = () => {
  const { featureFlags, updateFeatureFlag } = useConfig();
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const modules = ['ALL', ...Array.from(new Set(featureFlags.map((f) => f.module)))];

  const filteredFlags = selectedModule === 'ALL'
    ? featureFlags
    : featureFlags.filter((f) => f.module === selectedModule);

  const handleToggle = (flag: FeatureFlag) => {
    updateFeatureFlag(flag.key, { enabled: !flag.enabled });
  };

  const handleKillSwitch = (flag: FeatureFlag) => {
    updateFeatureFlag(flag.key, { killSwitch: !flag.killSwitch });
  };

  const handleRolloutChange = (flag: FeatureFlag, percentage: number) => {
    updateFeatureFlag(flag.key, { percentageRollout: percentage });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Module Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ToggleRight className="w-5 h-5 text-emerald-400" />
            Enterprise Feature Flags & Dynamic Rollouts
          </h2>
          <p className="text-xs text-slate-400">
            Control feature activation, percentage canary rollouts, kill switches & environment policies
          </p>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-xs text-slate-400">تصفية حسب الوحده:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                {m === 'ALL' ? 'جميع الوحدات' : m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map((flag) => (
          <div
            key={flag.key}
            className={`p-5 rounded-2xl border transition-all ${
              flag.killSwitch
                ? 'bg-rose-950/20 border-rose-500/30'
                : flag.enabled
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950 border-slate-900 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-emerald-400 rounded-md uppercase tracking-wider">
                    {flag.module}
                  </span>
                  <h3 className="text-sm font-bold text-white">{flag.name}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{flag.description}</p>
                <code className="inline-block text-[11px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {flag.key}
                </code>
              </div>

              {/* Main Enable Toggle */}
              <button
                onClick={() => handleToggle(flag)}
                disabled={flag.killSwitch}
                className={`p-1.5 rounded-xl transition-colors ${
                  flag.enabled && !flag.killSwitch
                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-slate-600 hover:bg-slate-800'
                }`}
                title={flag.enabled ? 'إيقاف التفعيل' : 'تفعيل الميزة'}
              >
                {flag.enabled && !flag.killSwitch ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Kill Switch & Rollout Slider */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleKillSwitch(flag)}
                    className={`flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      flag.killSwitch
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-900'
                        : 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-750'
                    }`}
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>{flag.killSwitch ? 'مفتاح الإيقاف الطارئ (مُفعل)' : 'مفتاح إيقاف طارئ (Kill Switch)'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 space-x-reverse text-slate-400 font-mono text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>نسبة النشر: {flag.percentageRollout ?? 100}%</span>
                </div>
              </div>

              {/* Rollout Slider Control */}
              {!flag.killSwitch && (
                <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.percentageRollout ?? 100}
                    onChange={(e) => handleRolloutChange(flag, parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-400 min-w-[35px]">
                    {flag.percentageRollout ?? 100}%
                  </span>
                </div>
              )}

              {/* Dependencies & Targets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                {flag.dependencies && flag.dependencies.length > 0 && (
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                    <Layers className="w-3 h-3 text-amber-400" />
                    تعتمد على: {flag.dependencies.join(', ')}
                  </span>
                )}
                {flag.environmentRollout && (
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    البيئات: {flag.environmentRollout.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
