import React, { useState } from 'react';
import {
  Calculator,
  ArrowRightLeft,
  Scale,
  Box,
  Plane,
  Ship,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface UnitConversionCalculatorProps {
  className?: string;
  defaultTab?: 'weight' | 'volume' | 'volumetric' | 'cbm';
}

export const UnitConversionCalculator: React.FC<UnitConversionCalculatorProps> = ({
  className = '',
  defaultTab = 'weight'
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'weight' | 'volume' | 'volumetric' | 'cbm'>(defaultTab);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 1. Weight Conversion State (kg <-> lbs)
  const [weightKg, setWeightKg] = useState<string>('1000');
  const [weightLbs, setWeightLbs] = useState<string>('2204.62');
  const [weightTons, setWeightTons] = useState<string>('1');

  // Handle Weight Changes
  const handleKgChange = (val: string) => {
    setWeightKg(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setWeightLbs((num * 2.2046226218).toFixed(2));
      setWeightTons((num / 1000).toFixed(3));
    } else {
      setWeightLbs('');
      setWeightTons('');
    }
  };

  const handleLbsChange = (val: string) => {
    setWeightLbs(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const kgVal = num / 2.2046226218;
      setWeightKg(kgVal.toFixed(2));
      setWeightTons((kgVal / 1000).toFixed(3));
    } else {
      setWeightKg('');
      setWeightTons('');
    }
  };

  // 2. Volume Conversion State (m3 <-> ft3)
  const [volumeM3, setVolumeM3] = useState<string>('10');
  const [volumeFt3, setVolumeFt3] = useState<string>('353.15');

  const handleM3Change = (val: string) => {
    setVolumeM3(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setVolumeFt3((num * 35.3146667).toFixed(2));
    } else {
      setVolumeFt3('');
    }
  };

  const handleFt3Change = (val: string) => {
    setVolumeFt3(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setVolumeM3((num / 35.3146667).toFixed(2));
    } else {
      setVolumeM3('');
    }
  };

  // 3. Air Freight Volumetric Weight Calculator State
  // Formula: (Length cm * Width cm * Height cm) / 6000 * Quantity = Volumetric Weight kg
  const [pkgLength, setPkgLength] = useState<string>('120'); // cm
  const [pkgWidth, setPkgWidth] = useState<string>('80');   // cm
  const [pkgHeight, setPkgHeight] = useState<string>('100'); // cm
  const [pkgCount, setPkgCount] = useState<string>('5');
  const [grossWeight, setGrossWeight] = useState<string>('450'); // kg
  const [courierDivisor, setCourierDivisor] = useState<number>(6000); // 6000 for standard IATA, 5000 for express

  const len = parseFloat(pkgLength) || 0;
  const wid = parseFloat(pkgWidth) || 0;
  const hgt = parseFloat(pkgHeight) || 0;
  const qty = parseFloat(pkgCount) || 1;
  const grossKg = parseFloat(grossWeight) || 0;

  const totalCbm = (len * wid * hgt * qty) / 1000000;
  const volumetricKg = (len * wid * hgt * qty) / courierDivisor;
  const chargeableKg = Math.max(grossKg, volumetricKg);

  // 4. Container CBM Packing Estimator
  const cbmPer20ft = 33.2; // m3
  const cbmPer40ftHC = 76.2; // m3
  const container20ftUsage = ((totalCbm / cbmPer20ft) * 100).toFixed(1);
  const container40ftUsage = ((totalCbm / cbmPer40ftHC) * 100).toFixed(1);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={`bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-[#0F4C75] rounded-3xl p-5 md:p-6 shadow-xl space-y-5 ${className}`}>
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#082F49] dark:bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block">
              {isAr ? 'حاسبة تحويل الأوزان والأحجام اللوجستية' : 'Freight Unit Converter'}
            </span>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              {isAr ? 'حاسبة الأوزان والأحجام للشحن (Freight Calculator)' : 'Logistics Unit & CBM Calculator'}
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 self-start sm:self-auto font-mono">
          IATA & WCO Standard Rates
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-[#030712] p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('weight')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'weight'
              ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'الأوزان (kg ↔ lbs)' : 'Weight (kg / lbs)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('volume')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'volume'
              ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Box className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'الأحجام (m³ ↔ ft³)' : 'Volume (m³ / ft³)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('volumetric')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'volumetric'
              ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Plane className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'الوزن الحجمي (Air)' : 'Volumetric Weight'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cbm')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'cbm'
              ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-[#030712] shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Ship className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'سعة الحاوية (CBM)' : 'Container CBM'}</span>
        </button>
      </div>

      {/* TAB 1: WEIGHT CONVERTER */}
      {activeTab === 'weight' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'تحويل سريع ودقيق بين الكيلوجرامات (kg)، الباوند/الرطل (lbs)، والطن المتري (Tons) لتحديد أوزان الشحنات البضائع.'
              : 'Convert instantly between Kilograms (kg), Pounds (lbs), and Metric Tons for cargo freight calculation.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Kilograms */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الكيلوجرام (kg)' : 'Kilograms (kg)'}
                </label>
                <button
                  onClick={() => copyToClipboard(weightKg, 'kg')}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors"
                  title={isAr ? 'نسخ القيمة' : 'Copy'}
                >
                  {copiedField === 'kg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => handleKgChange(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              />
              <span className="text-[10px] text-slate-400 block">{isAr ? '1 كجم = 2.20462 باوند' : '1 kg = 2.20462 lbs'}</span>
            </div>

            {/* Field 2: Pounds */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الباوند / الرطل (lbs)' : 'Pounds (lbs)'}
                </label>
                <button
                  onClick={() => copyToClipboard(weightLbs, 'lbs')}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors"
                  title={isAr ? 'نسخ القيمة' : 'Copy'}
                >
                  {copiedField === 'lbs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => handleLbsChange(e.target.value)}
                placeholder="2204.62"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              />
              <span className="text-[10px] text-slate-400 block">{isAr ? '1 باوند = 0.453592 كجم' : '1 lb = 0.453592 kg'}</span>
            </div>

            {/* Field 3: Metric Tons */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'الطن المتري (Tonnes)' : 'Metric Tons (MT)'}
                </label>
                <button
                  onClick={() => copyToClipboard(weightTons, 'tons')}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors"
                  title={isAr ? 'نسخ القيمة' : 'Copy'}
                >
                  {copiedField === 'tons' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={weightTons}
                className="w-full px-3 py-2.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-[10px] text-slate-400 block">{isAr ? '1 طن متري = 1000 كجم' : '1 MT = 1,000 kg'}</span>
            </div>
          </div>

          {/* Quick Preset Weight Buttons */}
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
            <span className="text-slate-500 font-bold text-[11px]">{isAr ? 'أوزان شائعة:' : 'Quick Presets:'}</span>
            {[
              { label: '500 kg', val: '500' },
              { label: '1,000 kg (1 Ton)', val: '1000' },
              { label: '5,000 kg', val: '5000' },
              { label: '20,000 kg (20T Container)', val: '20000' }
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => handleKgChange(p.val)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 hover:bg-[#082F49] hover:text-white dark:hover:bg-[#00F0FF] dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 transition-colors font-mono text-[11px] cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VOLUME CONVERTER */}
      {activeTab === 'volume' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'تحويل أحجام الشحنات بين المتر المكعب (m³) والقدم المكعب (Cubic Feet / ft³) المستخدم في حسابات تكلفة الشحن البحري والجوي.'
              : 'Convert bulk cargo dimensions between Cubic Meters (m³) and Cubic Feet (ft³) for ocean & air freight billing.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cubic Meters */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'المتر المكعب (CBM / m³)' : 'Cubic Meters (m³ / CBM)'}
                </label>
                <button
                  onClick={() => copyToClipboard(volumeM3, 'm3')}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors"
                >
                  {copiedField === 'm3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="number"
                value={volumeM3}
                onChange={(e) => handleM3Change(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              />
              <span className="text-[10px] text-slate-400 block">{isAr ? '1 متر مكعب = 35.3147 قدم مكعب' : '1 m³ = 35.3147 cu ft'}</span>
            </div>

            {/* Cubic Feet */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'القدم المكعب (ft³ / CFT)' : 'Cubic Feet (ft³ / CFT)'}
                </label>
                <button
                  onClick={() => copyToClipboard(volumeFt3, 'ft3')}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors"
                >
                  {copiedField === 'ft3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="number"
                value={volumeFt3}
                onChange={(e) => handleFt3Change(e.target.value)}
                placeholder="353.15"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
              />
              <span className="text-[10px] text-slate-400 block">{isAr ? '1 قدم مكعب = 0.0283168 متر مكعب' : '1 cu ft = 0.0283168 m³'}</span>
            </div>
          </div>

          {/* Quick Presets Volume */}
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
            <span className="text-slate-500 font-bold text-[11px]">{isAr ? 'أحجام شائعة:' : 'Quick Presets:'}</span>
            {[
              { label: '1 m³ (LCL Minimum)', val: '1' },
              { label: '5 m³', val: '5' },
              { label: '33 m³ (20ft Container)', val: '33' },
              { label: '76 m³ (40ft High Cube)', val: '76' }
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => handleM3Change(p.val)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 hover:bg-[#082F49] hover:text-white dark:hover:bg-[#00F0FF] dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 transition-colors font-mono text-[11px] cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VOLUMETRIC WEIGHT CALCULATOR (AIR FREIGHT) */}
      {activeTab === 'volumetric' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'احتساب الوزن الحجمي الخاضع للرسوم (Chargeable Weight) وفق معايير الاتحاد الدولي للنقل الجوي IATA.'
                : 'Calculate Volumetric Chargeable Weight for Air Freight & Express based on IATA industry standard standards.'}
            </p>

            {/* Divisor Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
              <button
                onClick={() => setCourierDivisor(6000)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  courierDivisor === 6000
                    ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                IATA Air (6000)
              </button>
              <button
                onClick={() => setCourierDivisor(5000)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  courierDivisor === 5000
                    ? 'bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Express Courier (5000)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Length */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'الطول (cm):' : 'Length (cm):'}
              </label>
              <input
                type="number"
                value={pkgLength}
                onChange={(e) => setPkgLength(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Width */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'العرض (cm):' : 'Width (cm):'}
              </label>
              <input
                type="number"
                value={pkgWidth}
                onChange={(e) => setPkgWidth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Height */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'الارتفاع (cm):' : 'Height (cm):'}
              </label>
              <input
                type="number"
                value={pkgHeight}
                onChange={(e) => setPkgHeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'العدد (Packages):' : 'Count / Qty:'}
              </label>
              <input
                type="number"
                value={pkgCount}
                onChange={(e) => setPkgCount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Actual Gross Weight */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'الوزن الفعلي (Gross kg):' : 'Actual Weight (kg):'}
              </label>
              <input
                type="number"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#030712] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-amber-500"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-[#0F4C75] text-white">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الحجم الإجمالي:' : 'Total Volume (CBM):'}</span>
              <strong className="text-sm font-mono font-bold text-[#00F0FF]">{totalCbm.toFixed(3)} m³</strong>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الوزن الحجمي (Volumetric):' : 'Volumetric Weight:'}</span>
              <strong className="text-sm font-mono font-bold text-sky-400">{volumetricKg.toFixed(2)} kg</strong>
            </div>

            <div className="space-y-0.5 bg-[#082F49] p-2 rounded-xl border border-amber-500/40">
              <span className="text-[10px] text-amber-300 block font-bold">{isAr ? 'الوزن المعتمد للرسوم (Chargeable):' : 'Final Chargeable Weight:'}</span>
              <strong className="text-base font-mono font-black text-amber-400">{chargeableKg.toFixed(2)} kg</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTAINER CBM ESTIMATOR */}
      {activeTab === 'cbm' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'مقارنة حجم البضائع الإجمالي مع سعة الحاويات البحرية القياسية (20ft Dry Container & 40ft High Cube).'
              : 'Compare total cargo CBM against standard ocean container capacities (20ft Dry & 40ft High Cube).'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 20ft Container Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    20ft Standard Dry Container
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Capacity: ~33.2 m³
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{isAr ? 'نسبة الاستغلال:' : 'Space Utilized:'}</span>
                  <strong className="text-slate-900 dark:text-white">{container20ftUsage}%</strong>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      parseFloat(container20ftUsage) > 100
                        ? 'bg-rose-500'
                        : parseFloat(container20ftUsage) > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, parseFloat(container20ftUsage))}%` }}
                  />
                </div>
              </div>

              <span className="text-[10px] text-slate-400 block">
                {parseFloat(container20ftUsage) > 100
                  ? (isAr ? '⚠️ الشحنة تتجاوز سعة حاوية 20 قدم (تتطلب حاوية 40 قدم أو شحن جزئي LCL).' : '⚠️ Cargo exceeds 20ft capacity. Requires 40ft HC or LCL.')
                  : (isAr ? '✅ تتسع الشحنة داخل حاوية 20 قدم FCL.' : '✅ Fits inside 20ft FCL Container.')}
              </span>
            </div>

            {/* 40ft HC Container Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-[#00F0FF]" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    40ft High Cube Container (HC)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#00F0FF]/20 text-[#00F0FF] px-2 py-0.5 rounded border border-[#00F0FF]/30">
                  Capacity: ~76.2 m³
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{isAr ? 'نسبة الاستغلال:' : 'Space Utilized:'}</span>
                  <strong className="text-slate-900 dark:text-white">{container40ftUsage}%</strong>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0F4C75] to-[#00F0FF] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, parseFloat(container40ftUsage))}%` }}
                  />
                </div>
              </div>

              <span className="text-[10px] text-slate-400 block">
                {parseFloat(container40ftUsage) > 100
                  ? (isAr ? '⚠️ الحجم يتطلب أكثر من حاوية 40 قدم HC.' : '⚠️ Requires multiple 40ft HC containers.')
                  : (isAr ? '✅ مناسبة جداً لحاويات الشحن الكبيرة FCL.' : '✅ Optimal for 40ft High Cube ocean freight.')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
