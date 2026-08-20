import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface HeroContentProps {
  className?: string;
}

export const HeroContent: React.FC<HeroContentProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Words breakdown for staggered reveal animation
  const headlineWords = isAr
    ? [
        { text: 'حرك', highlight: false },
        { text: 'العالم..', highlight: false },
        { text: 'نحن', highlight: true },
        { text: 'ندفع', highlight: true },
        { text: 'أعمالك', highlight: true },
        { text: 'نحو', highlight: false },
        { text: 'المستقبل.', highlight: false },
      ]
    : [
        { text: 'MOVE', highlight: false },
        { text: 'THE', highlight: false },
        { text: 'WORLD.', highlight: false, lineBreakAfter: true },
        { text: 'WE', highlight: true },
        { text: 'MOVE', highlight: true },
        { text: 'YOUR', highlight: true, lineBreakAfter: true },
        { text: 'BUSINESS', highlight: false },
        { text: 'FORWARD.', highlight: false },
      ];

  return (
    <div className={`space-y-6 sm:space-y-8 text-left rtl:text-right max-w-[680px] ${className}`}>
      
      {/* Brand Company Name & Eyebrow */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-black tracking-[0.2em] text-[#0EA5E9] uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
          <span>{isAr ? 'أجا الدولية للخدمات اللوجستية' : 'AJA INTERNATIONAL LOGISTICS'}</span>
        </div>
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0B172A]/90 border border-[#0EA5E9]/40 text-xs font-mono tracking-wider uppercase text-slate-200 shadow-lg backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F0FF]" />
          </span>
          <span className="font-bold text-[11px] sm:text-xs text-[#00F0FF]">
            {isAr ? 'الخدمات اللوجستية • العالمية • مدعومة بالتقنية • الذكية' : 'GLOBAL LOGISTICS • POWERED BY SMART TECH'}
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <h1 className="font-urbanist font-black text-[38px] sm:text-[54px] lg:text-[68px] xl:text-[76px] leading-[1.02] tracking-[-0.03em] text-white">
        {isAr ? (
          <div>
            <span className="text-white block">حلول اللوجستيات</span>
            <span className="text-[#00F0FF] block font-black drop-shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              و الشحن المتكاملة
            </span>
          </div>
        ) : (
          <div>
            <span className="text-white block">INTEGRATED</span>
            <span className="text-[#00F0FF] block font-black drop-shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              LOGISTICS
            </span>
            <span className="text-white block">SOLUTIONS</span>
          </div>
        )}
      </h1>

      {/* Hero Description */}
      <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed max-w-[620px]">
        {isAr
          ? 'ابتداءً من الميل الأول وحتى الوجهة النهائية، تربط شركة أجا الدولية للخدمات اللوجستية بين عمليات الشحن والنقل، التخليص الجمركي، التخزين، والتوزيع عبر منظومة لوجستية ذكية وموحدة.'
          : 'From first mile to final destination, AJA International Logistics seamlessly connects ocean, air, road transport, customs clearance, warehousing, and distribution through a unified digital ecosystem.'}
      </p>
    </div>
  );
};

export default HeroContent;
