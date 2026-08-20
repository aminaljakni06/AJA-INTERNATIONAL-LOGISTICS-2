import React from 'react';
import { PhoneCall, MapPin, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../i18n/LanguageContext';

export interface CTAProps {
  id?: string;
  badge?: string;
  title: string;
  description: string;
  phone?: string;
  location?: string;
  onQuoteClick?: () => void;
  whatsappUrl?: string;
  className?: string;
}

export const CTA: React.FC<CTAProps> = ({
  id,
  badge,
  title,
  description,
  phone = '920000000',
  location,
  onQuoteClick,
  whatsappUrl = 'https://wa.me/966500000000?text=Hello%20Aja%20Logistics',
  className = '',
}) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id={id} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="relative overflow-hidden bg-[#082F49] rounded-3xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl border border-[#0F4C75]">
        
        {/* Background Ambient Dark Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#0F4C75]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 text-center lg:text-start">
          <span className="px-3.5 py-1 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 text-xs font-black tracking-wide shadow-md inline-block">
            {badge || (isAr ? 'تواصل مباشر مع أخصائي الشحن' : 'Direct Support with Logistics Expert')}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-200 font-mono">
            {phone && (
              <span className="flex items-center gap-1.5 font-bold">
                <PhoneCall className="w-4 h-4 text-[#00F0FF]" />
                {phone}
              </span>
            )}
            {phone && location && <span>•</span>}
            {location && (
              <span className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-4 h-4 text-amber-400" />
                {location}
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
          {onQuoteClick && (
            <button
              type="button"
              onClick={onQuoteClick}
              className="px-6 py-3 bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black rounded-xl text-sm inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <span>{t.nav.requestQuote}</span>
              <ArrowIcon className="w-4 h-4 text-[#030712]" />
            </button>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>{t.common.whatsapp}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
