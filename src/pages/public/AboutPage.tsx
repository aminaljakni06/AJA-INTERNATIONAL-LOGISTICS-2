import React from 'react';
import { ShieldCheck, Anchor, ArrowLeft, Globe } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CompanyStorySection } from '../../components/brand/CompanyStorySection';
import { useLanguage } from '../../i18n/LanguageContext';
import { SEO } from '../../components/common/SEO';

export const AboutPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-12 pb-16 bg-slate-950 min-h-screen text-white">
      <SEO title={isAr ? "من نحن | أجا اللوجستية" : "About Us | AJA Logistics"} />
      {/* Top Banner */}
      <section className="bg-[#082F49] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#0F4C75]">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F4C75] text-white text-xs font-bold">
            <Anchor className="w-4 h-4 text-[#EA580C]" />
            <span>{isAr ? 'عن شركة أجا الدولية للخدمات اللوجستية' : 'ABOUT AJA INTERNATIONAL LOGISTICS'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {isAr 
              ? 'قصة أجا: الموثوقية الشاملة وحركة الأعمال الرقمية'
              : 'AJA Story: Total Reliability & Smart Logistics Movement'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? 'تأسست شركة أجا الدولية لتكون الرائدة في تقديم الحلول المتكاملة للشحن البحري، والبري، والجوي، والتخليص الجمركي، والتخزين الذكي داخل المملكة والعالم.'
              : 'AJA International Logistics powers global supply chains with specialized equipment, strict compliance protocols, and transparent tracking.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Core Company Story Component (ABOUT, VISION, MISSION, VALUES, WHY AJA, PROCESS 01-04) */}
        <CompanyStorySection onNavigate={onNavigate} />

        {/* Stats & Achievements */}
        <div className="bg-[#082F49] text-white rounded-3xl p-8 border border-[#0F4C75] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white">
              {isAr ? 'إنجازات وأرقام أجا اللوجستية' : 'AJA Operational Milestones'}
            </h3>
            <p className="text-xs text-slate-300">
              {isAr ? 'نفخر بثقة آلاف العملاء والشركات الوطنية والدولية' : 'Trusted by global enterprises and regional leaders'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 bg-[#0F4C75]/50 rounded-2xl border border-[#0F4C75] space-y-1">
              <span className="block text-3xl sm:text-4xl font-black text-white">+150,000</span>
              <span className="text-xs font-semibold text-slate-300">
                {isAr ? 'شحنة وحاوية منجزة' : 'Successful Containers'}
              </span>
            </div>
            <div className="p-5 bg-[#0F4C75]/50 rounded-2xl border border-[#0F4C75] space-y-1">
              <span className="block text-3xl sm:text-4xl font-black text-emerald-400">99.8%</span>
              <span className="text-xs font-semibold text-slate-300">
                {isAr ? 'الالتزام بجدول التسليم' : 'SLA Compliance'}
              </span>
            </div>
            <div className="p-5 bg-[#0F4C75]/50 rounded-2xl border border-[#0F4C75] space-y-1">
              <span className="block text-3xl sm:text-4xl font-black text-white">+120</span>
              <span className="text-xs font-semibold text-slate-300">
                {isAr ? 'وجهة وميناء حول العالم' : 'Global Port Corridors'}
              </span>
            </div>
            <div className="p-5 bg-[#0F4C75]/50 rounded-2xl border border-[#0F4C75] space-y-1">
              <span className="block text-3xl sm:text-4xl font-black text-emerald-400">100%</span>
              <span className="text-xs font-semibold text-slate-300">
                {isAr ? 'اعتمادات الفسح الجمركي' : 'FASAH & ZATCA Certified'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#082F49] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-[#0F4C75] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none">
            <Globe className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {isAr ? 'جاهز لبدء تعاون جديد مع أجا اللوجستية؟' : 'Ready to Partner with AJA Logistics?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {isAr
                ? 'احصل على استشارة لوجستية مجانية أو اطلب عرض سعر مخصص لشحنتك القادمة بكل سهولة.'
                : 'Get a tailored shipping consultation or request an instant rate quote.'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-2 relative z-10">
            <Button 
              variant="secondary" 
              onClick={() => onNavigate('quote-request')} 
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold gap-2 px-8 py-3 rounded-2xl shadow-lg border-0 cursor-pointer"
            >
              <span>{isAr ? 'طلب عرض سعر الآن' : 'Request Instant Quote'}</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('contact')} 
              className="text-white border-slate-700 hover:bg-white/10 px-8 py-3 rounded-2xl"
            >
              {isAr ? 'تواصل مع فريقنا' : 'Contact Our Team'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

