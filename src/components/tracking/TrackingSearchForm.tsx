import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getSampleTrackingNumbers } from '../../services/trackingService';

interface TrackingSearchFormProps {
  onSearch: (trackingNum: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  className?: string;
}

export const TrackingSearchForm: React.FC<TrackingSearchFormProps> = ({
  onSearch,
  isLoading = false,
  initialValue = '',
  className = ''
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [query, setQuery] = useState(initialValue);
  const sampleNumbers = getSampleTrackingNumbers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleSampleClick = (code: string) => {
    setQuery(code);
    onSearch(code);
  };

  return (
    <div className={`bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          {isAr ? 'البحث برقم بوليصة الشحن (Tracking Number)' : 'Search by Waybill / Tracking Number'}
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-4 rtl:right-4 ltr:left-4 ltr:right-auto top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="tracking-number-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? 'أدخل رقم التتبع (مثال: AJA-2026-000001)...' : 'Enter tracking number (e.g. AJA-2026-000001)...'}
              className="w-full py-4 pr-12 pl-4 rtl:pr-12 rtl:pl-4 ltr:pl-12 ltr:pr-4 bg-[#082F49]/80 border border-[#0F4C75] rounded-2xl text-white font-mono font-bold text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:border-transparent transition-all placeholder:text-slate-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-[#0F4C75] hover:bg-[#082F49] active:scale-95 text-white font-black text-sm md:text-base rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md disabled:opacity-50 shrink-0 border border-[#0F4C75]"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-white" />
            )}
            <span>{isAr ? 'تتبع الشحنة' : 'Track Shipment'}</span>
          </button>
        </div>

        {/* Quick Sample Tracking Numbers for Easy Demo Testing */}
        <div className="pt-3 border-t border-[#0F4C75] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{isAr ? 'نماذج جاهزة للتجربة الفورية:' : 'Sample numbers for quick test:'}</span>
          </span>

          {sampleNumbers.map((sample) => (
            <button
              key={sample.code}
              type="button"
              onClick={() => handleSampleClick(sample.code)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all duration-200 ${
                sample.status === 'ERROR'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-[#0F4C75]/30 text-white border-[#0F4C75] hover:bg-[#0F4C75]/50'
              }`}
            >
              <span>{sample.code}</span>
              <span className="opacity-75 text-[10px] mr-1.5 rtl:mr-1.5 ltr:ml-1.5">({isAr ? sample.labelAr : sample.labelEn})</span>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
