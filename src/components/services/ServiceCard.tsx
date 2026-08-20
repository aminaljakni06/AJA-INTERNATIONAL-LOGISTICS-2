import React from 'react';
import { 
  Plane, 
  Ship, 
  Truck, 
  Warehouse, 
  FileCheck, 
  Activity, 
  PackageCheck,
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { ServiceData } from '../../data/services';
import { useLanguage } from '../../i18n/LanguageContext';

interface ServiceCardProps {
  service: ServiceData;
  onSelect: (service: ServiceData) => void;
  onQuoteRequest?: (serviceSlug: string) => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelect,
  onQuoteRequest,
  className = ''
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const title = isAr ? (service.arabicTitle || service.title) : service.title;
  const description = isAr ? (service.arabicDescription || service.description) : service.description;
  const badge = isAr ? (service.arabicBadge || service.badge) : service.badge;

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const renderIcon = (iconName: string) => {
    const iconClass = "w-7 h-7 transition-transform duration-300 group-hover:scale-110";
    switch (iconName) {
      case 'Plane':
        return <Plane className={`${iconClass} text-sky-400`} />;
      case 'Ship':
        return <Ship className={`${iconClass} text-[#0F4C75] dark:text-sky-400`} />;
      case 'Truck':
        return <Truck className={`${iconClass} text-[#0F4C75] dark:text-white`} />;
      case 'Warehouse':
        return <Warehouse className={`${iconClass} text-amber-400`} />;
      case 'FileCheck':
        return <FileCheck className={`${iconClass} text-emerald-400`} />;
      case 'Activity':
      default:
        return <Activity className={`${iconClass} text-indigo-400`} />;
    }
  };

  return (
    <div
      onClick={() => onSelect(service)}
      className={`group relative bg-[#082F49] hover:bg-[#0F4C75] border border-[#0F4C75] hover:border-[#0F4C75] rounded-2xl p-6 md:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden ${className}`}
    >
      {/* Background Animated SVG Route Line on Hover */}
      <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity duration-500">
        <svg className="w-full h-full" viewBox="0 0 400 250" fill="none" preserveAspectRatio="none">
          <path
            d="M -20 220 Q 120 180 200 120 T 420 30"
            stroke="url(#card-route-gradient)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-[dash_15s_linear_infinite]"
          />
          <path
            d="M -10 100 Q 150 40 280 180 T 430 190"
            stroke="#0F4C75"
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeDasharray="4 4"
            className="animate-[dash_20s_linear_infinite]"
          />
          <defs>
            <linearGradient id="card-route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F4C75" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Subtle Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F4C75]/20 rounded-full blur-2xl transition-all duration-500 -mr-10 -mt-10 pointer-events-none" />

      {/* Top Content Area */}
      <div className="relative z-10 space-y-4">
        {/* Header: Icon & Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-14 h-14 rounded-xl bg-slate-900/90 border border-slate-700/80 group-hover:border-[#0F4C75] flex items-center justify-center shrink-0 shadow-inner transition-all duration-300">
            {renderIcon(service.icon)}
          </div>

          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0F4C75] text-white border border-[#0F4C75] transition-all duration-300">
              <Sparkles className="w-3 h-3" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        {/* Service Title */}
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-slate-200 transition-colors duration-300 tracking-tight">
            {title}
          </h3>
          {service.titleEn && isAr && (
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
              {service.titleEn}
            </p>
          )}
        </div>

        {/* Service Description */}
        <p className="text-sm text-slate-300 group-hover:text-slate-200 leading-relaxed line-clamp-3 transition-colors">
          {description}
        </p>

        {/* Benefits Preview */}
        {service.benefits && service.benefits.length > 0 && (
          <ul className="space-y-2 pt-2 border-t border-[#0F4C75]">
            {(isAr ? service.arabicBenefits : service.benefits).slice(0, 2).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-400 group-hover:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C75] shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom CTA & Interactive Arrow */}
      <div className="relative z-10 pt-6 mt-6 border-t border-[#0F4C75] flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1.5 transition-colors duration-300">
          <span>{isAr ? 'استكشف التفاصيل' : 'Explore Service Details'}</span>
        </span>

        <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 group-hover:bg-[#0F4C75] group-hover:border-[#0F4C75] text-slate-300 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:translate-x-1 group-hover:rtl:-translate-x-1">
          <ArrowIcon className="w-4 h-4 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
};
