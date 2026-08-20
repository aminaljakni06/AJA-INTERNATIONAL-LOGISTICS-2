import React from 'react';
import { 
  Building2, 
  Car, 
  Stethoscope, 
  ShoppingBag, 
  Zap, 
  Factory, 
  Apple, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2,
  Globe,
  Ship,
  Plane
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../design-system/primitives/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { IndustriesGrid } from '../../components/industries/IndustriesGrid';

interface IndustriesPageProps {
  onNavigate?: (tab: string) => void;
}

export const IndustriesPage: React.FC<IndustriesPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-16 py-12 bg-slate-950 text-white min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#082F49] text-white py-16 lg:py-20 border-b border-[#0F4C75]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F4C75] text-white text-xs font-bold">
            <Building2 className="w-4 h-4 text-[#EA580C]" />
            <span>{isAr ? 'حلول لوجستية متخصصة لكل قطاع' : 'Specialized Sector Solutions'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
            {isAr 
              ? 'نلبي متطلبات قطاعك اللوجستي بدقة ومعايير عالمية' 
              : 'Tailored Logistics Engineered for Your Specific Industry'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'تتمتع أجا الدولية للخدمات اللوجستية ببرامج وخبرات عملية مخصصة لدعم 10 قطاعات حيوية، من التجارة الإلكترونية والرعاية الصحية حتى السيارات، التكنولوجيا، والطاقة.'
              : 'AJA International Logistics powers 10 critical industries with specialized equipment, strict compliance protocols, and dedicated supply chain managers.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate?.('quote-request')}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold border-0 cursor-pointer"
            >
              <span>{isAr ? 'طلب عرض سعر لقطاعك' : 'Get Industry Quote'}</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate?.('contact')}
              className="border-slate-600 text-slate-200 hover:bg-white/10"
            >
              <span>{isAr ? 'تواصل مع مستشار القطاع' : 'Consult an Industry Expert'}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 10 Industries Interactive Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'القطاعات والصناعات المخدومة (10 قطاعات)' : '10 Key Industries We Power'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            {isAr 
              ? 'اختر قطاعك لاستعراض المزايا اللوجستية، المواصفات المخصصة، وااشتراطات الاعتماد والجودة.' 
              : 'Select your industry to explore tailored equipment, regulatory compliance, and dedicated transport channels.'}
          </p>
        </div>

        <IndustriesGrid onNavigate={onNavigate} />
      </section>

      {/* Global Compliance & Quality Standards */}
      <section className="bg-[#082F49] py-16 border-y border-[#0F4C75]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black text-[#EA580C] uppercase tracking-wider">
              {isAr ? 'الالتزام والمعايير التنظيمية' : 'Compliance & Standards'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {isAr 
                ? 'تراخيص معتمدة وتدقيق جودة متواصل لكل القطاعات' 
                : 'Full Certification & Quality Audits for Every Sector'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'تلتزم شركة أجا الدولية بأعلى اشتراطات السلامة والترخيص من هيئة الزكاة والضريبة والجمارك (ZATCA)، هيئة الغذاء والدواء (SFDA)، وهيئة النقل (TGA).'
                : 'AJA International Logistics maintains full licensing from Saudi Customs, SFDA, TGA, and international shipping conferences.'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ISO 9001:2015 Quality</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SFDA Cold Chain Certified</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ZATCA / Fasah Approved</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dangerous Goods Hazmat</div>
            </div>
          </div>

          <div className="bg-[#0F4C75]/60 text-white p-8 rounded-3xl border border-[#0F4C75] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none">
              <Globe className="w-48 h-48" />
            </div>
            <h3 className="text-xl font-black text-white">
              {isAr ? 'هل تحتاج إلى استشارة لوجستية لمشروعك؟' : 'Need Custom Industry Logistics?'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'فريق المهندسين والخبراء اللوجستيين في أجا جاهز لتصميم خطة شحن وتخزين مخصصة لقطاعك بأسعار تنافسية.'
                : 'Our dedicated industry logistics specialists design customized route plans, vessel charters, and fulfillment networks.'}
            </p>
            <Button
              variant="primary"
              onClick={() => onNavigate?.('quote-request')}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold w-full sm:w-auto border-0 cursor-pointer"
            >
              <span>{isAr ? 'ابدأ الآن واحصل على الاستشارة' : 'Get Started Now'}</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
