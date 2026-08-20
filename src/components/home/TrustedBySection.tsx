import React from 'react';
import { Shield, Award, CheckCircle2, Building2, Globe2, Anchor } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const TrustedBySection: React.FC = () => {
  const { isAr } = useLanguage();

  const clients = [
    { name: 'Saudi Aramco', category: isAr ? 'طاقة ونفط' : 'Energy & Oil', logo: 'ARAMCO' },
    { name: 'SABIC', category: isAr ? 'بتروكيماويات' : 'Petrochemicals', logo: 'SABIC' },
    { name: 'NEOM', category: isAr ? 'مشاريع عملاقة' : 'Giga Projects', logo: 'NEOM' },
    { name: 'Red Sea Global', category: isAr ? 'تطوير وسياحة' : 'Development', logo: 'RSG' },
    { name: 'STC Group', category: isAr ? 'تقنية واتصالات' : 'Telecom & Tech', logo: 'STC' },
    { name: 'Maersk Partner', category: isAr ? 'شحن بحري' : 'Ocean Freight', logo: 'MAERSK' },
    { name: 'Schlumberger', category: isAr ? 'خدمات حقول النفط' : 'Oilfield Services', logo: 'SLB' },
    { name: 'Hyundai Logistics', category: isAr ? 'سيارات وصناعة' : 'Automotive', logo: 'HYUNDAI' },
  ];

  const highlights = [
    {
      icon: Shield,
      title: isAr ? 'مرخص جمركياً بامتياز' : 'AEO Customs Certified',
      desc: isAr ? 'اعتماد الفسح السريع والتخليص الذكي مع هيئة الزكاة والضريبة والجمارك' : 'Authorized Economic Operator with fast-track ZATCA clearance',
    },
    {
      icon: Award,
      title: isAr ? 'شريك لوجستي موثوق' : 'Vision 2030 Partner',
      desc: isAr ? 'مساهم رئيسي في تحويل المملكة إلى مركز لوجستي عالمي' : 'Key contributor to Saudi Arabia global logistics hub strategy',
    },
    {
      icon: Anchor,
      title: isAr ? 'تغطية للموانئ العالمية' : '45+ Global Port Hubs',
      desc: isAr ? 'ربط مباشر بأكبر الموانئ البحرية والجوية عبر خطوط إستراتيجية' : 'Direct access to major maritime ports & air freight hubs',
    },
  ];

  return (
    <section className="py-12 bg-slate-950/60 border-y border-slate-800/60 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-cyan-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            {isAr ? 'شركاء النجاح والقيادة المؤسسية' : 'TRUSTED BY GLOBAL LOGISTICS LEADERS'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isAr ? 'نقل موثوق لأكبر الشركات الإقليمية والعالمية' : 'Powering Supply Chains for Global Enterprises'}
          </h2>
        </div>

        {/* Client Logos Grid / Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center">
          {clients.map((client, idx) => (
            <div
              key={idx}
              className="group p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all duration-300 text-center flex flex-col items-center justify-center h-24"
            >
              <div className="text-lg font-black tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">
                {client.logo}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                {client.name}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start space-x-4 space-x-reverse p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {item.title}
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
