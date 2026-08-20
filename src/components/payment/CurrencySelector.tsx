import React, { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  TrendingUp,
  Sparkles,
  ArrowRightLeft,
  Check,
  ChevronDown,
  Info,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface CurrencyDetails {
  rate: number;
  symbol: string;
  nameEn: string;
  nameAr: string;
  flag: string;
}

export interface CurrencyRatesData {
  baseCurrency: string;
  timestamp: string;
  adyenDccFeePercentage: number;
  rates: Record<string, CurrencyDetails>;
}

// Pre-configured currency metadata with flags
export const CURRENCY_FLAGS: Record<string, string> = {
  SAR: '🇸🇦',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AED: '🇦🇪',
  QAR: '🇶🇦',
  KWD: '🇰🇼',
};

export const DEFAULT_RATES: Record<string, CurrencyDetails> = {
  SAR: { rate: 1.0, symbol: 'ر.س', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', flag: '🇸🇦' },
  USD: { rate: 0.2666, symbol: '$', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', flag: '🇺🇸' },
  EUR: { rate: 0.2452, symbol: '€', nameEn: 'Euro', nameAr: 'يورو', flag: '🇪🇺' },
  GBP: { rate: 0.2095, symbol: '£', nameEn: 'British Pound', nameAr: 'جنيه إسترليني', flag: '🇬🇧' },
  AED: { rate: 0.9789, symbol: 'د.إ', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', flag: '🇦🇪' },
  QAR: { rate: 0.9705, symbol: 'ر.ق', nameEn: 'Qatari Riyal', nameAr: 'ريال قطري', flag: '🇶🇦' },
  KWD: { rate: 0.0818, symbol: 'د.ك', nameEn: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', flag: '🇰🇼' },
};

export interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string, convertedAmount: number, rate: number) => void;
  baseAmount: number;
  baseCurrency?: string;
  compact?: boolean;
  showBreakdown?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  baseAmount,
  baseCurrency = 'SAR',
  compact = false,
  showBreakdown = true,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [rates, setRates] = useState<Record<string, CurrencyDetails>>(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dccFee, setDccFee] = useState<number>(0.5);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/adyen/rates');
      if (res.ok) {
        const data: CurrencyRatesData = await res.json();
        if (data && data.rates) {
          const formattedRates: Record<string, CurrencyDetails> = {};
          Object.keys(data.rates).forEach((code) => {
            formattedRates[code] = {
              ...data.rates[code],
              flag: CURRENCY_FLAGS[code] || '🌐',
            };
          });
          setRates(formattedRates);
          setLastUpdated(data.timestamp);
          if (data.adyenDccFeePercentage !== undefined) {
            setDccFee(data.adyenDccFeePercentage);
          }
        }
      }
    } catch (err) {
      console.error('Failed fetching real-time FX rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const currentRate = rates[selectedCurrency]?.rate ?? (selectedCurrency === 'SAR' ? 1 : 1);
  const convertedAmount =
    selectedCurrency === 'SAR'
      ? baseAmount
      : Math.round(baseAmount * currentRate * 100) / 100;

  // Trigger parent state update whenever currency or base amount changes
  useEffect(() => {
    onCurrencyChange(selectedCurrency, convertedAmount, currentRate);
  }, [selectedCurrency, baseAmount, currentRate]);

  const activeCurrencyInfo = rates[selectedCurrency] || DEFAULT_RATES[selectedCurrency] || {
    rate: 1,
    symbol: selectedCurrency,
    nameEn: selectedCurrency,
    nameAr: selectedCurrency,
    flag: CURRENCY_FLAGS[selectedCurrency] || '🌐',
  };

  // Compact Header / Inline Badge Mode
  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        <div className="flex items-center gap-2 bg-slate-900/90 border border-sky-500/30 rounded-xl p-1.5 shadow-lg">
          <span className="text-base leading-none">{activeCurrencyInfo.flag}</span>
          <select
            value={selectedCurrency}
            onChange={(e) => {
              const newCurr = e.target.value;
              const newRate = rates[newCurr]?.rate || 1;
              const newAmount = newCurr === 'SAR' ? baseAmount : Math.round(baseAmount * newRate * 100) / 100;
              onCurrencyChange(newCurr, newAmount, newRate);
            }}
            className="bg-transparent text-[#00F0FF] text-xs font-mono font-bold focus:outline-none cursor-pointer pr-1"
          >
            {Object.keys(rates).map((code) => (
              <option key={code} value={code} className="bg-slate-900 text-white">
                {code} ({rates[code].symbol}) - {isAr ? rates[code].nameAr : rates[code].nameEn}
              </option>
            ))}
          </select>
          {loading && <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-950 border border-sky-500/30 rounded-2xl p-4 text-white space-y-4 shadow-xl ${className}`}>
      {/* Header & Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#00F0FF]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{isAr ? 'مُحول العملات المباشر (Adyen FX Engine)' : 'Real-time Currency Selector & FX Calculator'}</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-mono">
                Live FX
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              {isAr ? 'أسعار الصرف الديناميكية المعتمدة لتصفية الفواتير بالعملة المفضلة' : 'Real-time exchange rates with guaranteed checkout price lock'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchRates}
          disabled={loading}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-mono"
          title="Refresh rates"
        >
          <RefreshCw className={`w-3 h-3 text-[#00F0FF] ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isAr ? 'تحديث الأسعار' : 'Refresh'}</span>
        </button>
      </div>

      {/* Primary Selector Grid / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.keys(rates).map((code) => {
          const item = rates[code];
          const isSelected = selectedCurrency === code;
          const converted = code === 'SAR' ? baseAmount : Math.round(baseAmount * item.rate * 100) / 100;

          return (
            <button
              key={code}
              onClick={() => {
                onCurrencyChange(code, converted, item.rate);
              }}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-sky-950/80 to-slate-900 border-[#00F0FF] text-white shadow-lg ring-1 ring-[#00F0FF]/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[#00F0FF] text-slate-950 flex items-center justify-center font-bold">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <span className="text-lg leading-none">{item.flag}</span>
                <span className="font-mono font-black text-xs text-white">{code}</span>
              </div>

              <div className="mt-2 text-left">
                <div className="text-xs font-mono font-bold text-[#00F0FF]">
                  {converted.toLocaleString()} <span className="text-[10px] text-slate-400">{item.symbol}</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono truncate">
                  1 SAR = {item.rate} {code}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Breakdown Card */}
      {showBreakdown && (
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
              {isAr ? 'تفاصيل عملية التحويل:' : 'Exchange Conversion Breakdown:'}
            </span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isAr ? 'مضمونة بدعم Adyen DCC' : 'Adyen DCC Guaranteed'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-500 block text-[10px]">{isAr ? 'المبلغ الأساسي:' : 'Base Amount:'}</span>
              <span className="font-bold text-white">{baseAmount.toLocaleString()} SAR</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">{isAr ? 'سعر الصرف:' : 'Exchange Rate:'}</span>
              <span className="font-bold text-sky-300">
                1 SAR = {currentRate} {selectedCurrency}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">{isAr ? 'الإجمالي النهائي:' : 'Final Settlement Total:'}</span>
              <span className="font-bold text-[#00F0FF] text-sm">
                {convertedAmount.toLocaleString()} {selectedCurrency}
              </span>
            </div>
          </div>

          {lastUpdated && (
            <div className="text-[9px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>
                {isAr ? 'آخر تحديث للأسعار:' : 'Rates updated:'} {new Date(lastUpdated).toLocaleTimeString()}
              </span>
              <span>{isAr ? `عمولة التحويل FX Markup: ${dccFee}%` : `Adyen DCC Markup: ${dccFee}%`}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
