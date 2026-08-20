import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { FXRate, FXExposure } from '../../../types/treasury';

export const FXManagementView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [rates, setRates] = useState<FXRate[]>([]);
  const [exposures, setExposures] = useState<FXExposure[]>([]);
  const [revaluing, setRevaluing] = useState(false);

  const loadFxData = async () => {
    const snapshot = await TreasuryClient.getSnapshot();
    setRates(snapshot.fxRates);
    setExposures(snapshot.fxExposures);
  };

  useEffect(() => {
    void loadFxData();
  }, []);

  const handleRunRevaluation = () => {
    setRevaluing(true);
    setTimeout(() => {
      void loadFxData().finally(() => setRevaluing(false));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <DollarSign className="w-4 h-4" />
            <span>{isAr ? 'منظومة أسعار الصرف وإعادة التقييم والتحوّط' : 'Foreign Exchange (FX) Risk & Currency Revaluation Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'أسعار الصرف اللحظية، الانكشاف بالعملات الأجنبية وأرباح وخسائر الصرف' : 'Spot Rates, Net FX Exposure, Realized/Unrealized Gain & Loss'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'مراقبة أسعار الصرف، حساب فروق العملة وإعادة تقييم الأرصدة المصرفية الأجنبية' : 'Track FX rates, manage currency risks, run IAS 21 revaluation & hedge exposures.'}
          </p>
        </div>

        <button
          onClick={handleRunRevaluation}
          disabled={revaluing}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${revaluing ? 'animate-spin' : ''}`} />
          <span>{revaluing ? (isAr ? 'جاري إعادة التقييم...' : 'Revaluing FX...') : (isAr ? 'تشغيل إعادة التقييم (IAS 21 Run)' : 'Execute FX Revaluation Run')}</span>
        </button>
      </div>

      {/* Spot Rates Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {rates.map(r => (
          <div
            key={r.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 border-t-4 border-t-sky-500"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">{r.pair}</span>
              <span className="text-[10px] text-slate-400">{r.lastUpdated}</span>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {r.spotRate.toFixed(4)}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{r.dailyChangePercent}% {isAr ? 'تغير يومي' : 'daily change'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FX Exposures Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between border-b border-slate-800 pb-3">
          <span>{isAr ? 'جدول الانكشاف بالعملات الأجنبية والتوصيات' : 'Net Foreign Currency Exposure & Hedging Strategy'}</span>
          <span className="text-xs text-sky-400">Base Currency: SAR</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'العملة الأجنبية' : 'Currency'}</th>
                <th className="p-3">{isAr ? 'الأصول بالعملة (SAR)' : 'FX Assets (SAR)'}</th>
                <th className="p-3">{isAr ? 'الالتزامات بالعملة (SAR)' : 'FX Liabilities (SAR)'}</th>
                <th className="p-3">{isAr ? 'صافي الانكشاف' : 'Net Exposure (SAR)'}</th>
                <th className="p-3">{isAr ? 'أرباح / خسائر غير محققة' : 'Unrealized Gain/Loss'}</th>
                <th className="p-3">{isAr ? 'توصية التحوّط' : 'Hedging Strategy'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {exposures.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-sky-400">{exp.currency}</td>
                  <td className="p-3 text-emerald-400">SAR {exp.assetExposureSAR.toLocaleString()}</td>
                  <td className="p-3 text-rose-400">SAR {exp.liabilityExposureSAR.toLocaleString()}</td>
                  <td className="p-3 font-bold text-white">SAR {exp.netExposureSAR.toLocaleString()}</td>
                  <td className="p-3 text-emerald-400 font-bold">+SAR {exp.unrealizedGainLossSAR.toLocaleString()}</td>
                  <td className="p-3 text-slate-300">{isAr ? exp.recommendedHedgeActionAr : exp.recommendedHedgeActionEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
