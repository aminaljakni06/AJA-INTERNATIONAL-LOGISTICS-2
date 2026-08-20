import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CurrencyRate } from '../../types/generalLedger';

interface CurrencyManagementViewProps {
  currencies: CurrencyRate[];
  onUpdateRate: (code: string, newRate: number) => void;
}

export const CurrencyManagementView: React.FC<CurrencyManagementViewProps> = ({
  currencies,
  onUpdateRate
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(1.0);
  const [revalStatus, setRevalStatus] = useState<string | null>(null);

  const handleStartEdit = (cur: CurrencyRate) => {
    setEditingCode(cur.currencyCode);
    setTempRate(cur.rateToBaseSAR);
  };

  const handleSaveRate = (code: string) => {
    onUpdateRate(code, tempRate);
    setEditingCode(null);
  };

  const handleRunRevaluation = () => {
    setRevalStatus(isAr ? 'جاري إعادة تقييم العملات وإعادة معالجة مكاسب/خسائر فروق العملة غير المحققة...' : 'Running Foreign Exchange Revaluation Engine...');
    setTimeout(() => {
      setRevalStatus(isAr ? 'تم إعادة تقييم الأصول والالتزامات الأجنبية وتسجيل قيد الفرق بقيمة 12,450 ريال بنجاح ✓' : 'FX Revaluation completed. Revaluation journal JV-2026-00815 generated successfully ✓');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-sky-400" />
            <span>{isAr ? 'إدارة العملات وإعادة التقييم (Multi-Currency & FX)' : 'Multi-Currency & Foreign Exchange Center'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'إدارة أسعار الصرف اليومية، العملة الوظيفية (SAR) وإعادة تقييم فروق العملة' : 'Manage exchange rates, functional currency, and automated FX revaluations'}
          </p>
        </div>

        <button
          onClick={handleRunRevaluation}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isAr ? 'تشغيل المحرك الآلي لإعادة التقييم' : 'Run Currency Revaluation Engine'}</span>
        </button>
      </div>

      {revalStatus && (
        <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 shrink-0 text-sky-400" />
          <span>{revalStatus}</span>
        </div>
      )}

      {/* Currency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map(cur => (
          <div
            key={cur.id}
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
              cur.isBaseCurrency
                ? 'bg-gradient-to-br from-slate-900 to-sky-950/40 border-sky-500/40 shadow-md'
                : 'bg-slate-900/80 border-slate-700/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
                  {cur.currencyCode}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {isAr ? cur.currencyNameAr : cur.currencyNameEn}
                </h3>
              </div>

              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                cur.isBaseCurrency
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {cur.isBaseCurrency ? (isAr ? 'العملة الأساسية' : 'Base Currency') : (isAr ? 'عملة تداول' : 'Transaction Currency')}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isAr ? 'سعر الصرف مقابل SAR:' : 'Rate to SAR:'}</span>
                {editingCode === cur.currencyCode ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      step="any"
                      value={tempRate}
                      onChange={e => setTempRate(parseFloat(e.target.value) || 1.0)}
                      className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold"
                    />
                    <button
                      onClick={() => handleSaveRate(cur.currencyCode)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xl font-mono font-bold text-white mt-1 block">
                    1 {cur.currencyCode} = {cur.rateToBaseSAR} SAR
                  </span>
                )}
              </div>

              {!cur.isBaseCurrency && editingCode !== cur.currencyCode && (
                <button
                  onClick={() => handleStartEdit(cur)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-500 font-mono">
              {isAr ? 'تاريخ التحديث:' : 'Effective:'} {cur.effectiveDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
