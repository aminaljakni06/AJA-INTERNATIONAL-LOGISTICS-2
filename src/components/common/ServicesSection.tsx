import React, { useState } from 'react';
import {
  Globe2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  X,
  CheckCircle2,
  Ship,
  Truck,
  FileCheck,
  Warehouse,
  PackageCheck,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SERVICES_DATA, ServiceData } from '../../data/services';
import { ServiceCard } from './ServiceCard';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from './Button';

export interface ServicesSectionProps {
  id?: string;
  services?: ServiceData[];
  onSelectService?: (service: ServiceData) => void;
  onRequestQuote?: (serviceId?: string) => void;
  className?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  id = 'services-section',
  services = SERVICES_DATA,
  onSelectService,
  onRequestQuote,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  // Filter tabs
  const filterTabs = [
    { id: 'all', labelAr: 'جميع الخدمات', labelEn: 'All Services' },
    { id: 'sea-freight', labelAr: 'الشحن البحري', labelEn: 'Sea Freight' },
    { id: 'land-transport', labelAr: 'النقل البري', labelEn: 'Land Transport' },
    { id: 'container-management', labelAr: 'الفسح والحاويات', labelEn: 'Customs & Containers' },
    { id: 'warehousing', labelAr: 'التخزين والمستودعات', labelEn: 'Warehousing' },
    { id: 'distribution', labelAr: 'التوزيع والتسليم', labelEn: 'Distribution' },
    { id: 'supply-chain-visibility', labelAr: 'تتبع سلاسل الإمداد', labelEn: 'Control Tower' },
  ];

  const filteredServices =
    activeTab === 'all'
      ? services
      : services.filter(
          (s) =>
            s.id === activeTab ||
            s.slug === activeTab ||
            (s.icon && s.icon.toLowerCase().includes(activeTab.split('-')[0]))
        );

  const handleCardClick = (service: ServiceData) => {
    setSelectedService(service);
    if (onSelectService) {
      onSelectService(service);
    }
  };

  const handleModalQuote = (serviceId: string) => {
    setSelectedService(null);
    if (onRequestQuote) {
      onRequestQuote(serviceId);
    }
  };

  return (
    <section id={id} className={`relative py-12 sm:py-20 bg-[#082F49] text-white ${className}`}>
      {/* Background Ambient Dark Blue Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-[#0F4C75]/15 rounded-full blur-[140px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F4C75]/30 border border-[#0F4C75] text-blue-300 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? 'منظومة الخدمات اللوجستية المتكاملة' : 'INTEGRATED LOGISTICS ECOSYSTEM'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {isAr ? (
              <span>
                حلول اللوجستيات و <span className="text-blue-400">سلاسل الإمداد</span>
              </span>
            ) : (
              <span>
                Logistics &amp; <span className="text-blue-400">Supply Chain Solutions</span>
              </span>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isAr
              ? 'نقدم منظومة خدمات رقمية متكاملة تربط الموانئ البحرية، وأساطيل النقل البري، والمستودعات الذكية، والتتبع المباشر.'
              : 'End-to-end digital logistics linking ocean ports, overland fleets, smart warehousing, and real-time telemetry.'}
          </p>

          {/* Filter Bar */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 pb-2 no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-[#00F0FF] text-[#030712] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.35)] font-black'
                    : 'bg-[#0B172A]/90 text-slate-300 border-[#1E293B] hover:border-[#0EA5E9] hover:text-white'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid (Data-driven: automatically renders any number of items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handleCardClick}
              actionText={isAr ? 'استكشف الخدمة ←' : 'Explore Solution ←'}
            />
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="bg-[#0B172A]/90 backdrop-blur-xl border border-[#0EA5E9]/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 text-start">
            <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 font-bold">
              <Zap className="w-6 h-6 text-[#00F0FF]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {isAr ? 'هل تبحث عن حلول شحن مخصصة لشركتك؟' : 'Need Tailored Supply Chain Solutions?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isAr
                  ? 'يتوفر فريق المهندسين والخبراء اللوجستيين لتصميم مسارات ونماذج تسعير خاصة.'
                  : 'Our logistics architects can build customized routing and pricing frameworks for your cargo.'}
              </p>
            </div>
          </div>

          {onRequestQuote && (
            <Button
              onClick={() => onRequestQuote()}
              className="bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black px-6 py-3.5 rounded-xl text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] shrink-0 cursor-pointer gap-2 border-none transition-all"
            >
              <span>{isAr ? 'طلب عرض سعر مخصص' : 'Get Custom Quote'}</span>
              <ArrowIcon className="w-4 h-4 text-[#030712]" />
            </Button>
          )}
        </div>
      </div>

      {/* SERVICE DETAIL MODAL DIALOG */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-bold text-sky-300 bg-[#0F4C75]/50 border border-[#0F4C75] px-3 py-1 rounded-full inline-block uppercase">
                {selectedService.arabicBadge || selectedService.badge || 'LOGISTICS SOLUTION'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {isAr ? selectedService.arabicTitle || selectedService.titleAr : selectedService.title || selectedService.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isAr ? selectedService.arabicDescription || selectedService.descriptionAr : selectedService.description || selectedService.descriptionEn}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 bg-[#082F49]/80 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
                <span>{isAr ? 'المزايا الاستراتيجية والتشغيلية:' : 'Strategic & Operational Benefits:'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(isAr ? selectedService.arabicBenefits || selectedService.benefitsAr : selectedService.benefits || selectedService.benefitsEn)?.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Steps */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {isAr ? 'مراحل وخطوات تنفيذ الخدمة:' : 'Execution Workflow Steps:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isAr ? selectedService.arabicProcess || selectedService.processAr : selectedService.process || selectedService.processEn)?.map((proc, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-[#0F4C75] text-white text-[11px] font-black flex items-center justify-center shrink-0 border border-blue-400/30">
                        {proc.step || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {proc.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug pl-7 rtl:pl-0 rtl:pr-7">
                      {proc.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedService(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </button>

              <button
                onClick={() => handleModalQuote(selectedService.id)}
                className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{isAr ? 'طلب عرض سعر لهذه الخدمة' : 'Request Quote for Service'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
