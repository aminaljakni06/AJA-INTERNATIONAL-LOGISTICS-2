import React from 'react';
import { Star, Quote, Building2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const CustomerTestimonialsSection: React.FC = () => {
  const { isAr } = useLanguage();

  const testimonials = [
    {
      name: isAr ? 'م. عبد العزيز الشمري' : 'Eng. Abdulaziz Al-Shammari',
      role: isAr ? 'مدير سلاسل الإمداد - قطاع الطاقة' : 'Supply Chain Director - Energy Sector',
      company: 'PetroTech Logistics KSA',
      comment: isAr
        ? 'تتميز أجا السرعة والدقة العالية في التخليص الجمركي عبر منصة فسح. نقلنا أكثر من 400 حاوية ثقيلة دون أي تأخير ملاحي.'
        : 'AJA demonstrated flawless execution and rapid FASAH customs clearance. We moved 400+ heavy containers with zero transit delays.',
      rating: 5,
      impact: isAr ? 'خفض تكاليف الترانزيت بنسبة 22%' : '22% Transit Cost Reduction',
    },
    {
      name: isAr ? 'د. سارة التميمي' : 'Dr. Sarah Al-Tamimi',
      role: isAr ? 'رئيسة الخدمات اللوجستية والدوائية' : 'VP Pharma Supply Chain',
      company: 'Saudi Life Sciences',
      comment: isAr
        ? 'تضمن لنا أجا المراقبة الحرارية المستمرة على شحنات الأدوية الحساسة وفق اشتراطات SFDA مع تقارير لحظية دقيقة.'
        : 'The strict SFDA cold chain compliance and continuous temperature telemetry give us 100% confidence for critical vaccines.',
      rating: 5,
      impact: isAr ? 'امتثال حراري تام بنسبة 100%' : '100% Thermal Compliance',
    },
    {
      name: isAr ? 'أحمد الغامدي' : 'Ahmed Al-Ghamdi',
      role: isAr ? 'المدير التشغيلي للتجارة الإلكترونية' : 'E-Commerce Operations Head',
      company: 'Express Retail Gulf',
      comment: isAr
        ? 'الربط المباشر مع واجهات برمجة أجا سارع عملية شحن وتوزيع الطلبات اليومية في كافة مناطق المملكة والدول الخليجية.'
        : 'Direct API syncing streamlined our daily order fulfillments across KSA and GCC, improving last-mile delivery SLA significantly.',
      rating: 5,
      impact: isAr ? 'تسريع زمن التسليم 35%' : '35% Faster Last-Mile SLA',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
            {isAr ? 'آراء العملاء والشركاء' : 'CLIENT TESTIMONIALS & CASE STUDIES'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isAr ? 'ماذا يقول كبار التنفيذيين عن شراكتنا اللوجستية' : 'Trusted by Supply Chain Leaders'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'تجارب واقعية للشركات الرائدة التي تعتمد على أجا الدولية لإدارة عمليات النقل والتخزين.'
              : 'Real-world results achieved by top enterprises leveraging AJA Logistics.'}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-700 group-hover:text-cyan-500/40 transition-colors" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.role}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{item.company}</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{item.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
