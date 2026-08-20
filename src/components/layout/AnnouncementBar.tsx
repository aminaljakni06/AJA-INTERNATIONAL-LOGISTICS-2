import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface AnnouncementBarProps {
  onNavigate?: (tab: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#07131F] via-[#0B5FFF] to-[#102A43] text-white text-xs font-semibold py-2 px-4 border-b border-white/10 relative z-[1300] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 mx-auto sm:mx-0 truncate">
          <span className="px-2 py-0.5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] text-[10px] font-black uppercase tracking-wider shrink-0 border border-[#00F0FF]/30">
            {isAr ? 'تحديث العمليات' : 'Logistics Alert'}
          </span>
          <span className="truncate text-slate-200">
            {isAr
              ? 'توسيع خطوط الشحن البحري والجوي بين موانئ المملكة الرئيسية وأوروبا مع خدمات تخليص فوري.'
              : 'New express maritime and air freight corridors launched between KSA ports & European hubs.'}
          </span>
          <button
            onClick={() => onNavigate && onNavigate('quote-request')}
            className="hidden md:inline-flex items-center gap-1 text-[#00F0FF] font-bold hover:underline shrink-0 cursor-pointer ml-2"
          >
            <span>{isAr ? 'احسب السعر الآن' : 'View Special Rates'}</span>
            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
          </button>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
          title={isAr ? 'إغلاق' : 'Close'}
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
