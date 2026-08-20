import React from 'react';
import {
  Flame,
  Car,
  Pill,
  ShoppingBag,
  Cpu,
  Shield,
  Building2,
  Apple,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface IndustriesServedSectionProps {
  onNavigate?: (tab: string) => void;
}

export const IndustriesServedSection: React.FC<IndustriesServedSectionProps> = ({
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const industries = [
    {
      id: 'oil-gas',
      title: isAr ? 'النفط والغاز والطاقة' : 'Oil, Gas & Energy',
      desc: isAr
        ? 'شحن وإمداد المعدات الثقيلة، الأنابيب، والتجهيزات البترولية مع حراسة وتراخيص متخصصة لحقول النفط.'
        : 'Specialized logistics for heavy drilling rigs, pipelines, valves, and hazardous energy cargo.',
      icon: Flame,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      tag: isAr ? 'حقول ومعامل' : 'Rig & Field Transport',
    },
    {
      id: 'automotive',
      title: isAr ? 'صناعة وسلاسل السيارات' : 'Automotive & Fleet',
      desc: isAr
        ? 'نقل المركبات، قطع الغيار، ومكونات التجميع عبر ناقلات سيارات متخصصة وشحن حاويات أمان عالي.'
        : 'CBU vehicle transport, spare parts distribution, and inbound OEM assembly line logistics.',
      icon: Car,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30',
      tag: isAr ? 'قطع غيار وسيارت' : 'OEM & Aftermarket',
    },
    {
      id: 'healthcare',
      title: isAr ? 'الصيدلة والرعاية الصحية' : 'Pharma & Healthcare',
      desc: isAr
        ? 'سلاسل مبردة معتمدة من الهيئة العامة للغذاء والدواء لتوصيل الأدوية والأجهزة الطبية بدرجات حرارة مضبوطة.'
        : 'SFDA GDP-certified cold chain logistics for vaccines, life sciences, and medical equipment.',
      icon: Pill,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      tag: isAr ? 'اعتماد SFDA' : 'GDP Pharma Clean',
    },
    {
      id: 'retail-fmcg',
      title: isAr ? 'التجزئة والأغذية (FMCG)' : 'Retail & FMCG',
      desc: isAr
        ? 'حلول إمداد التجزئة، التوزيع اليومي، والمخازن ذات الكثافة العالية مع ضمان التدفق المستمر للمنافذ.'
        : 'High-velocity retail fulfillment, cross-docking, and shelf-replenishment for consumer goods.',
      icon: Apple,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      tag: isAr ? 'توزيع سريع' : 'Cross-Dock Retail',
    },
    {
      id: 'e-commerce',
      title: isAr ? 'التجارة الإلكترونية' : 'E-Commerce & Omnichannel',
      desc: isAr
        ? 'ربط المتاجر الإلكترونية بمستودعات التجهيز وتوصيل الميل الأخير السريع مع متابعة مرتجعات سلسة.'
        : 'Automated picking, fulfillment, and last-mile dispatch integrated with major e-com platforms.',
      icon: ShoppingBag,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
      tag: isAr ? 'تجهيز طلبات' : 'Fulfillment Hub',
    },
    {
      id: 'high-tech',
      title: isAr ? 'التقنية والإلكترونيات' : 'High-Tech & Electronics',
      desc: isAr
        ? 'شحن الخوادم الحساسة والأجهزة الذكية مع تدابير أمنية مشددة (TAPA) وبيئات تخزين فائقة النظافة.'
        : 'High-security transport for semiconductors, data center servers, and sensitive tech hardware.',
      icon: Cpu,
      color: 'from-cyan-500/20 to-sky-500/10 text-cyan-400 border-cyan-500/30',
      tag: isAr ? 'أمان TAPA' : 'Secure Hardware',
    },
    {
      id: 'defense-aerospace',
      title: isAr ? 'الدفاع والطيران' : 'Defense & Aerospace',
      desc: isAr
        ? 'حلول نقل قطع غيار الطائرات (AOG)، المعدات العسكرية الحساسة، والتصاريح السيادية الاستثنائية.'
        : 'Time-critical AOG aircraft spare parts, defense equipment, and government-cleared transport.',
      icon: Shield,
      color: 'from-slate-500/20 to-gray-500/10 text-slate-300 border-slate-500/30',
      tag: isAr ? 'تصاريح دفاعية' : 'AOG & Defense',
    },
    {
      id: 'construction',
      title: isAr ? 'البناء والمشاريع الكبرى' : 'Construction & Giga-Projects',
      desc: isAr
        ? 'إمداد مواد البناء والمنشآت الضخمة في نيوم، البحر الأحمر، والقدية وفق جداول تسليم دقيقة.'
        : 'Heavy materials, pre-fabricated modules, and site logistics for Saudi Vision 2030 developments.',
      icon: Building2,
      color: 'from-amber-600/20 to-yellow-600/10 text-amber-300 border-amber-600/30',
      tag: isAr ? 'مشاريع 2030' : 'Giga Construction',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              {isAr ? 'القطاعات الصناعية' : 'INDUSTRIES WE SERVE'}
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {isAr ? 'خبرات لوجستية متخصصة لكل قطاع تجاري' : 'Domain-Specific Logistics Expertise'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isAr
                ? 'لكل قطاع متطلبات ونظم لوجستية خاصة. نوفر حلول نقل متكيفة مع المعايير والتراخيص الحكومية لكل صناعة.'
                : 'Tailored logistics protocols, specialized permits, and compliance for key economic sectors.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate?.('industries')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-white flex items-center gap-2 transition-all w-fit shrink-0"
          >
            <span>{isAr ? 'جميع القطاعات' : 'View All Industries'}</span>
            <ArrowIcon className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Grid of Industry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.id}
                className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-slate-950 border ${ind.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                      {ind.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {ind.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ind.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => onNavigate?.('industries')}
                    className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1.5"
                  >
                    <span>{isAr ? 'متطلبات القطاع' : 'Sector Standards'}</span>
                    <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
