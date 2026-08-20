import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, PhoneCall, Headphones } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface CTASectionProps {
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
  title?: string;
  description?: string;
  primaryActionLabel?: string;
  primaryActionTab?: string;
  secondaryActionLabel?: string;
  secondaryActionTab?: string;
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  variant = 'dark',
  title,
  description,
  primaryActionLabel,
  primaryActionTab = 'quote-request',
  secondaryActionLabel,
  secondaryActionTab = 'contact',
  onNavigate,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultTitle = isAr
    ? 'جاهز لتطوير سلاسل الإمداد وشحن بضائعك بأعلى كفاءة؟'
    : 'Ready to elevate your global supply chain & logistics performance?';

  const defaultDesc = isAr
    ? 'احصل على جدول أسعار تنافسي وخطة شحن مخصصة تناسب متطلبات أعمالك خلال دقائق مع خبراء أجا.'
    : 'Get instant competitive freight quotes and tailored logistics planning with AJA logistics experts.';

  const defaultPrimaryLabel = primaryActionLabel || (isAr ? 'طلب عرض سعر شامل' : 'Get Custom Quote');
  const defaultSecondaryLabel = secondaryActionLabel || (isAr ? 'تواصل مع خبير الشحن' : 'Talk to Expert');

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#0B5FFF] text-white border-2 border-blue-400/30';
      case 'secondary':
        return 'bg-[#102A43] text-white border-2 border-slate-700/60';
      case 'gradient':
        return 'bg-gradient-to-r from-[#102A43] via-[#0B5FFF] to-[#07131F] text-white border border-[#00F0FF]/30';
      case 'dark':
      default:
        return 'bg-[#07131F] text-white border border-[#0EA5E9]/30';
    }
  };

  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 ${getVariantStyles()}`}>
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0B5FFF]/20 rounded-full blur-[90px] pointer-events-none" />

          {/* Left Text Content */}
          <div className="space-y-4 max-w-2xl relative z-10 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'حلول شحن عالمية معتمدة' : 'Enterprise Logistics Guarantee'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {title || defaultTitle}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {description || defaultDesc}
            </p>

            {/* Quick Benefits Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span>{isAr ? 'تغطية عالمية لأكثر من 180 دولة' : '180+ Countries Global Network'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span>{isAr ? 'تخليص جمركي معتمد عبر فاسح' : 'Licensed Customs Brokerage'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span>{isAr ? 'تتبع حي بموقع الشحنة 24/7' : 'Real-time GPS Container Tracking'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span>{isAr ? 'ضمان أمان وسلامة البضائع' : 'Comprehensive Freight Insurance'}</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigate && onNavigate(primaryActionTab)}
              className="w-full sm:w-auto px-8 py-4 bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{defaultPrimaryLabel}</span>
              <ArrowRight className="w-4 h-4 text-[#030712] rtl:rotate-180" />
            </button>

            <button
              onClick={() => onNavigate && onNavigate(secondaryActionTab)}
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Headphones className="w-4 h-4 text-[#00F0FF]" />
              <span>{defaultSecondaryLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
