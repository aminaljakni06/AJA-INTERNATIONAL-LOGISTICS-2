import React, { useState } from 'react';
import { Plane, Ship, Truck, Warehouse, FileCheck, Activity, Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import { ServiceData, SERVICES_DATA } from '../../data/services';
import { ServiceCard } from './ServiceCard';
import { useLanguage } from '../../i18n/LanguageContext';

interface ServicesGridProps {
  onSelectService: (service: ServiceData) => void;
  onNavigateToQuote?: (serviceSlug?: string) => void;
  initialCategory?: string;
  className?: string;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  onSelectService,
  onNavigateToQuote,
  initialCategory = 'all',
  className = ''
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const filterTabs = [
    { id: 'all', labelAr: 'جميع الخدمات', labelEn: 'All Services', icon: Layers },
    { id: 'air-freight', labelAr: 'الشحن الجوي', labelEn: 'Air Freight', icon: Plane },
    { id: 'sea-freight', labelAr: 'الشحن البحري', labelEn: 'Sea Freight', icon: Ship },
    { id: 'land-transport', labelAr: 'النقل البري', labelEn: 'Land Transport', icon: Truck },
    { id: 'warehousing', labelAr: 'التخزين والمستودعات', labelEn: 'Warehousing', icon: Warehouse },
    { id: 'customs', labelAr: 'التخليص الجمركي', labelEn: 'Customs Clearance', icon: FileCheck },
    { id: 'supply-chain-solutions', labelAr: 'سلاسل الإمداد', labelEn: 'Supply Chain', icon: Activity },
  ];

  const filteredServices = SERVICES_DATA.filter((service) => {
    if (activeCategory === 'all') return true;
    return (
      service.slug === activeCategory ||
      service.id === activeCategory ||
      (activeCategory === 'customs' && (service.id === 'customs' || service.slug === 'container-management')) ||
      (activeCategory === 'supply-chain-solutions' && (service.id === 'supply-chain-solutions' || service.slug === 'supply-chain-visibility'))
    );
  });

  return (
    <div className={`space-y-10 ${className}`}>
      {/* Header Description */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#0F4C75] text-white border border-[#0F4C75] text-xs font-bold tracking-wide">
          {isAr ? 'منظومة الخدمات اللوجستية المتكاملة' : 'INTEGRATED LOGISTICS ECOSYSTEM'}
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {isAr ? 'حلول شحن وتخزين مصممة لنمو أعمالك' : 'Logistics Solutions Designed to Scale Your Business'}
        </h2>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
          {isAr
            ? 'نقدم مجموعة متكاملة من خدمات الشحن البحري، الجوي، البري، والتخزين الذكي مع التخليص الجمركي الفوري عبر كافة منافذ المملكة والعالم.'
            : 'Explore our complete array of air, sea, land freight, customs clearance, and smart warehousing services tailored to modern global trade.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-[#0F4C75] text-white shadow-lg scale-105 border border-[#0F4C75]'
                  : 'bg-[#082F49] text-slate-300 hover:text-white border border-[#0F4C75] hover:border-[#0F4C75]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={onSelectService}
            onQuoteRequest={onNavigateToQuote}
          />
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="relative rounded-3xl bg-[#082F49] border border-[#0F4C75] p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-start relative z-10">
          <h3 className="text-2xl md:text-3xl font-black text-white">
            {isAr ? 'هل تبحث عن حلول لوجستية مخصصة لشركتك؟' : 'Need a Tailored Logistics Package?'}
          </h3>
          <p className="text-slate-300 text-sm max-w-xl">
            {isAr
              ? 'يتواجد مهندسو ومستشارو شركة أجا لمساعدتك في تخطيط سلاسل الإمداد وحساب التكلفة المباشرة.'
              : 'Our logistics architects are available 24/7 to design custom routes and provide instant rate calculations.'}
          </p>
        </div>

        <button
          onClick={() => onNavigateToQuote?.()}
          className="relative z-10 px-8 py-4 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-black text-sm flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 shrink-0 border border-[#0F4C75]"
        >
          <span>{isAr ? 'طلب عرض سعر مباشر' : 'Get Instant Custom Quote'}</span>
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
