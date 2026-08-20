import React from 'react';
import {
  LucideIcon,
  ArrowLeft,
  ArrowRight,
  Ship,
  Truck,
  FileCheck,
  Warehouse,
  PackageCheck,
  Activity,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ServiceData } from '../../data/services';

// Icon Map helper for dynamic string mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Ship,
  Truck,
  FileCheck,
  Warehouse,
  PackageCheck,
  Activity,
};

export interface ServiceCardProps {
  service?: ServiceData;
  id?: string;
  title?: string;
  arabicTitle?: string;
  description?: string;
  arabicDescription?: string;
  icon?: LucideIcon | string;
  badge?: string;
  arabicBadge?: string;
  benefits?: string[];
  arabicBenefits?: string[];
  processStepsCount?: number;
  onSelect?: (service: ServiceData | any) => void;
  onAction?: () => void;
  actionText?: string;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  id,
  title,
  arabicTitle,
  description,
  arabicDescription,
  icon,
  badge,
  arabicBadge,
  benefits,
  arabicBenefits,
  processStepsCount,
  onSelect,
  onAction,
  actionText,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Resolve values prioritizing service object if supplied
  const displayTitle = service
    ? isAr
      ? service.arabicTitle || service.titleAr
      : service.title || service.titleEn
    : isAr
    ? arabicTitle || title
    : title || arabicTitle;

  const displayDescription = service
    ? isAr
      ? service.arabicDescription || service.descriptionAr
      : service.description || service.descriptionEn
    : isAr
    ? arabicDescription || description
    : description || arabicDescription;

  const displayBadge = service
    ? isAr
      ? service.arabicBadge || service.badge
      : service.badge || service.arabicBadge
    : isAr
    ? arabicBadge || badge
    : badge || arabicBadge;

  const displayBenefits = service
    ? isAr
      ? service.arabicBenefits || service.benefitsAr
      : service.benefits || service.benefitsEn
    : isAr
    ? arabicBenefits || benefits
    : benefits || arabicBenefits;

  // Resolve Icon
  let IconComponent: LucideIcon = Ship;
  const rawIcon = service ? service.icon || service.iconName : icon;
  if (typeof rawIcon === 'string') {
    IconComponent = ICON_MAP[rawIcon] || Ship;
  } else if (rawIcon) {
    IconComponent = rawIcon;
  }

  const handleCardClick = () => {
    if (onSelect && service) {
      onSelect(service);
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <div
      id={id || (service ? `service-card-${service.id}` : undefined)}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-[#082F49]/90 hover:bg-[#082F49] backdrop-blur-xl border border-[#0F4C75]/60 hover:border-[#0F4C75] transition-all duration-300 shadow-xl hover:-translate-y-1.5 cursor-pointer overflow-hidden ${className}`}
    >
      {/* Background Subtle Gradient Glow Effect on Hover */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all duration-500" />

      {/* Top Header Row: Icon + Badge */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4C75] border border-blue-400/30 text-white flex items-center justify-center group-hover:bg-[#135D8D] transition-all duration-300 shadow-md group-hover:scale-110">
            <IconComponent className="w-6 h-6 stroke-[2.2] text-[#EA580C]" />
          </div>

          {displayBadge && (
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#0F4C75]/50 text-sky-300 border border-[#0F4C75] tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#EA580C]" />
              <span>{displayBadge}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-sky-300 transition-colors leading-snug">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
          {displayDescription}
        </p>

        {/* Key Benefits List */}
        {displayBenefits && displayBenefits.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-white/10">
            <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
              {isAr ? 'أبرز المزايا:' : 'Key Advantages:'}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {displayBenefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom CTA Bar */}
      <div className="pt-5 mt-5 border-t border-white/10 relative z-10 flex items-center justify-between">
        <span className="text-xs font-black text-sky-300 group-hover:text-white transition-colors flex items-center gap-1.5">
          <span>{actionText || (isAr ? 'استكشف التفاصيل' : 'Explore Details')}</span>
          <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </span>

        <span className="w-8 h-8 rounded-full bg-white/5 border border-white/15 text-slate-300 flex items-center justify-center group-hover:bg-[#0F4C75] group-hover:text-white group-hover:border-[#0F4C75] transition-all">
          <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
        </span>
      </div>
    </div>
  );
};

export default ServiceCard;
