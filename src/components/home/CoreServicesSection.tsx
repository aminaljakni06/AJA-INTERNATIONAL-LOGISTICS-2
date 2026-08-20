import React, { useState } from 'react';
import {
  Plane,
  Ship,
  Truck,
  Warehouse,
  FileCheck,
  Boxes,
  ThermometerSnowflake,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Clock,
  Globe2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface CoreServicesSectionProps {
  onNavigate?: (tab: string) => void;
  onRequestQuote?: (serviceId: string) => void;
}

export const CoreServicesSection: React.FC<CoreServicesSectionProps> = ({
  onNavigate,
  onRequestQuote,
}) => {
  const { isAr } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const categories = [
    { id: 'all', label: isAr ? 'جميع الخدمات' : 'All Services' },
    { id: 'freight', label: isAr ? 'الشحن الدولي' : 'Global Freight' },
    { id: 'logistics', label: isAr ? 'التخزين والخدمات' : 'Contract Logistics' },
    { id: 'specialized', label: isAr ? 'حلول متخصصة' : 'Specialized Cargo' },
  ];

  const services = [
    {
      id: 'ocean-freight',
      category: 'freight',
      title: isAr ? 'الشحن البحري (FCL & LCL)' : 'Ocean Freight Shipping',
      desc: isAr
        ? 'خدمات نقل بالحاويات الكاملة والجزئية عبر شراكات مع أساطيل الملاحة العالمية بربط مباشر بموانئ الملك عبد الله وجدة الإسلامي والدمام.'
        : 'Full Container Load (FCL) & Less than Container Load (LCL) connecting Saudi ports to major trade corridors globally.',
      icon: Ship,
      badge: isAr ? 'الأنشط عالمياً' : 'High Capacity',
      color: 'from-blue-600/20 to-cyan-600/10 border-blue-500/30 text-blue-400',
      features: [
        isAr ? 'تتبع بالحاويات عبر الأقمار الصناعية' : 'Satellite container tracking',
        isAr ? 'تخليص جمركي موانئ متكامل' : 'Integrated port clearance',
        isAr ? 'حجز مساحات مؤمنة في المواسم' : 'Guaranteed seasonal space',
      ],
    },
    {
      id: 'air-freight',
      category: 'freight',
      title: isAr ? 'الشحن الجوي السريع' : 'Air Cargo Express',
      desc: isAr
        ? 'حلول الشحن الجوي الفائق السرعة للرحلات المباشرة والشارتر مع دعم نقل المواد الحساسة للوقت والحرارة وإدارة الوثائق الجوية.'
        : 'Priority air freight solutions including full charters, temperature-controlled cargo, and door-to-door express deliveries.',
      icon: Plane,
      badge: isAr ? 'سرعة فائقة' : 'Time Critical',
      color: 'from-sky-600/20 to-blue-600/10 border-sky-500/30 text-sky-400',
      features: [
        isAr ? 'توصيل خلال 24-48 ساعة دولياً' : '24-48h global door delivery',
        isAr ? 'عضوية IATA معتمدة' : 'IATA certified air handling',
        isAr ? 'مراقبة بدرجات الحرارة الحرج' : 'Strict cold-chain monitoring',
      ],
    },
    {
      id: 'road-freight',
      category: 'freight',
      title: isAr ? 'النقل البري والخليجي' : 'Cross-Border Road Transport',
      desc: isAr
        ? 'أسطول شاحنات حديث مجهز بأنظمة GPS ومستشعرات حرارة لنقل البضائع عبر جميع مدن المملكة ودول مجلس التعاون الخليجي.'
        : 'Modern GPS-monitored fleet offering FTL and LTL road transport across KSA and GCC cross-border routes.',
      icon: Truck,
      badge: isAr ? 'أسطول ذكي' : 'GCC Fleet',
      color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
      features: [
        isAr ? 'تتبع لحظي عبر أنظمة هجينة' : 'Real-time hybrid Telemetry',
        isAr ? 'تأمين شامل على البضائع' : 'Full transit cargo insurance',
        isAr ? 'تصاريح نقل المواد الخطرة' : 'Hazmat transport certified',
      ],
    },
    {
      id: 'warehousing',
      category: 'logistics',
      title: isAr ? 'التخزين وإدارة سلاسل الإمداد' : 'Smart Warehousing & Fulfillment',
      desc: isAr
        ? 'مستودعات حديثة مكيفة ومجمدة ومناطق حرة مدعومة بنظام WMS ذكي لإدارة المخزون والتجميع والتجهيز والشحن.'
        : 'Bonded and temperature-controlled smart logistics centers powered by automated WMS for high-density inventory.',
      icon: Warehouse,
      badge: isAr ? 'مستودعات ذكية' : 'Smart WMS',
      color: 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400',
      features: [
        isAr ? 'مناطق حرة ومستودعات فسح' : 'Bonded & duty-free zones',
        isAr ? 'دقة مخزون بنسبة 99.9%' : '99.9% inventory precision',
        isAr ? 'ربط WMS مع أنظمة ERP' : 'Direct WMS-ERP API integration',
      ],
    },
    {
      id: 'customs-clearance',
      category: 'logistics',
      title: isAr ? 'التخليص الجمركي والاستشارات' : 'Customs Brokerage & FASAH',
      desc: isAr
        ? 'تخليص جمركي ذكي عبر منصة فسح (FASAH) وهيئة الزكاة والضريبة والجمارك مع تخليص أولي قبل وصول الشحنات.'
        : 'Rapid customs brokerage via FASAH integration, handling import/export tariffs, compliance, and pre-arrival release.',
      icon: FileCheck,
      badge: isAr ? 'فسح < 24h' : 'Rapid FASAH',
      color: 'from-purple-600/20 to-indigo-600/10 border-purple-500/30 text-purple-400',
      features: [
        isAr ? 'فسح جمركي مسبق قبل الوصول' : 'Pre-arrival clearance protocol',
        isAr ? 'استشارات التعريفة والتصنيف' : 'Tariff & HS code advisory',
        isAr ? 'إصدار أشهادات سابر ومواصفات' : 'SABER & SFDA compliance',
      ],
    },
    {
      id: 'cold-chain',
      category: 'specialized',
      title: isAr ? 'اللوجستيات المبردة والدوائية' : 'Cold Chain & Pharma Logistics',
      desc: isAr
        ? 'حلول النقل المبرد والمجمد للمنتجات الأدوية والأغذية وفق معايير SFDA ومراقبة رقمية حرارية على مدار الساعة.'
        : 'SFDA-certified cold chain logistics for pharmaceuticals, vaccines, and perishables with continuous thermal sensors.',
      icon: ThermometerSnowflake,
      badge: isAr ? 'اعتماد SFDA' : 'SFDA Pharma',
      color: 'from-cyan-600/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
      features: [
        isAr ? 'نطاقات حرارية من -80م إلى +25م' : 'Thermal range -80°C to +25°C',
        isAr ? 'تقرير حراري رقمي معتمد' : 'Digital thermal compliance log',
        isAr ? 'شاحنات مبردة بأمان مضاعف' : 'Dual-redundant cooling trucks',
      ],
    },
    {
      id: 'project-cargo',
      category: 'specialized',
      title: isAr ? 'شحن المشاريع والأحمال الثقيلة' : 'Project Cargo & Heavy Lift',
      desc: isAr
        ? 'إدارة الحمولات الشاذة والتجهيزات الصناعية الثقيلة للقطاعات النفطية والعسكرية والمشاريع الكبرى في رؤية 2030.'
        : 'End-to-end heavy equipment and breakbulk transport for oil & gas, defense, and Saudi Giga-projects.',
      icon: Boxes,
      badge: isAr ? 'أحمال ثقيلة' : 'Heavy Lift',
      color: 'from-rose-600/20 to-red-600/10 border-rose-500/30 text-rose-400',
      features: [
        isAr ? 'تخطيط واستطلاع المسارات البرية' : 'Route surveying & feasibility',
        isAr ? 'معدات رافعة وتأمين متخصص' : 'Heavy crane & rigging operations',
        isAr ? 'تصاريح نقل استثنائية' : 'Specialized transit permits',
      ],
    },
  ];

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <section id="services" className="py-20 bg-slate-900/80 relative overflow-hidden">
      {/* Grid Pattern Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'خدمات لوجستية متكاملة' : 'CORE LOGISTICS SOLUTIONS'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isAr ? 'حلول نقل وإمداد مصممة للمؤسسات العالمية' : 'Comprehensive Supply Chain & Transport Services'}
            </h2>
            <p className="text-sm text-slate-300">
              {isAr
                ? 'نربط أعمالك بالأسواق العالمية عبر خدمات نقل متعددة الوسائط، مستودعات ذكية، وتخليص جمركي عالي السرعة.'
                : 'Connecting your business to global markets via multimodal transport, automated warehousing, and high-speed customs.'}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/40 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-slate-900 border ${service.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {service.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-xs text-slate-300 gap-2">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() =>
                      onRequestQuote
                        ? onRequestQuote(service.id)
                        : onNavigate?.('quote-request')
                    }
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{isAr ? 'طلب عرض سعر الخدمة' : 'Request Quote'}</span>
                    <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => onNavigate?.('services')}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-4"
                  >
                    {isAr ? 'التفاصيل' : 'Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
