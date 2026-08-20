import React, { useState } from 'react';
import { ArrowRight, Search, User, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export interface HeroActionsProps {
  onGetQuoteClick?: () => void;
  onTrackShipmentClick?: (trackingNum?: string) => void;
  onSignInClick?: () => void;
  className?: string;
}

export const HeroActions: React.FC<HeroActionsProps> = ({
  onGetQuoteClick,
  onTrackShipmentClick,
  onSignInClick,
  className = '',
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';
  const [showQuickTrackInput, setShowQuickTrackInput] = useState(false);
  const [quickNum, setQuickNum] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTrackShipmentClick) {
      onTrackShipmentClick(quickNum.trim());
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Primary Action Button - Electric Cyan Pill */}
        <button
          onClick={onGetQuoteClick}
          className="group relative px-7 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-inter font-black text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2.5 border border-[#00F0FF] animate-fade-in-up animation-delay-100"
        >
          <Sparkles className="w-4 h-4 text-[#030712]" />
          <span>{isAr ? 'طلب عرض سعر الآن' : 'Get a Quote Now'}</span>
          <ArrowRight className="w-4 h-4 text-[#030712] transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
        </button>

        {/* Secondary Action Button - Dark Glass Outline */}
        <button
          onClick={() => setShowQuickTrackInput(!showQuickTrackInput)}
          className="group relative px-6 py-3.5 rounded-full bg-[#0B172A]/90 hover:bg-[#0EA5E9]/20 text-white font-inter font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 border border-[#0EA5E9]/50 animate-fade-in-up animation-delay-200"
        >
          <Search className="w-4 h-4 text-[#00F0FF] group-hover:scale-110 transition-transform" />
          <span>{isAr ? 'تتبع الشحنة 🔍' : 'Track Shipment 🔍'}</span>
        </button>

        {/* Portal / Sign In Button */}
        <button
          onClick={onSignInClick}
          className="group relative px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-inter font-bold text-xs sm:text-sm transition-all duration-300 shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 animate-fade-in-up animation-delay-300"
        >
          <User className="w-4 h-4 text-[#00F0FF]" />
          <span>{user ? (isAr ? 'بوابة النظام' : 'Portal') : (isAr ? 'تسجيل الدخول' : 'Sign In')}</span>
        </button>
      </div>

      {/* Quick Track Search Toggle Popup */}
      {showQuickTrackInput && (
        <form
          onSubmit={handleTrackSubmit}
          className="max-w-md p-2 bg-[#0B172A] border border-[#0EA5E9]/60 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn z-30 relative"
        >
          <input
            type="text"
            placeholder={isAr ? 'أدخل رقم الشحنة (مثال: AJA-20481)' : 'Enter tracking # (e.g. AJA-20481)'}
            value={quickNum}
            onChange={(e) => setQuickNum(e.target.value)}
            className="flex-1 bg-[#050B14] border border-white/15 rounded-xl px-4 py-2 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:border-[#00F0FF]"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#00F0FF] text-[#030712] font-black text-xs rounded-xl hover:bg-[#38BDF8] transition-colors cursor-pointer"
          >
            {isAr ? 'بحث' : 'Track'}
          </button>
        </form>
      )}
    </div>
  );
};

export default HeroActions;
