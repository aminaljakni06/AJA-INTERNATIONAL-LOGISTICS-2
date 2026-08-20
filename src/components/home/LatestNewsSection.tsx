import React from 'react';
import { Newspaper, ArrowRight, ArrowLeft, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface LatestNewsSectionProps {
  onNavigate?: (tab: string) => void;
}

export const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const news = [
    {
      id: 1,
      title: isAr
        ? 'أجا الدولية توسع مسارات الشحن البحري عبر الموانئ الرئيسية بالبحر الأحمر'
        : 'AJA Expands Maritime Routes Across Key Red Sea Port Hubs',
      date: isAr ? '04 أغسطس 2026' : 'Aug 04, 2026',
      category: isAr ? 'أخبار الشركة' : 'Company News',
      summary: isAr
        ? 'تعزيز الطاقة الاستيعابية للشحن البحري بنسبة 25% مع إضافة رحلات مباشرة جديدة بين موانئ جدة والشرق الأقصى.'
        : 'Adding 25% extra TEU capacity and direct liner services connecting Jeddah Islamic Port with Asian trade hubs.',
    },
    {
      id: 2,
      title: isAr
        ? 'إطلاق تقنيات التتبع الفوري بالحساسات الحرارية لشحنات الأدوية والأغذية'
        : 'Launch of Real-Time Thermal Telemetry for Pharma & Food Cold Chain',
      date: isAr ? '28 يوليو 2026' : 'Jul 28, 2026',
      category: isAr ? 'ابتكار وسلاسل إمداد' : 'Innovation',
      summary: isAr
        ? 'دمج أجهزة الاستشعار عبر الأقمار الصناعية لإصدار تنبيهات فورية عند تغيير درجات الحرارة أثناء الترانزيت.'
        : 'Satellite-linked IoT temperature sensors providing instant alerts for SFDA cold-chain compliance.',
    },
    {
      id: 3,
      title: isAr
        ? 'تقرير: تحول المملكة إلى المركز اللوجستي العالمي الأول وفق رؤية 2030'
        : 'Report: Saudi Arabia Ascends as Premier Global Logistics Hub in Vision 2030',
      date: isAr ? '15 يوليو 2026' : 'Jul 15, 2026',
      category: isAr ? 'تقارير القطاع' : 'Industry Insights',
      summary: isAr
        ? 'دراسة شاملة حول تسريع الفسح الجمركي وتطوير المناطق اللوجستية الخاصة في الرياض وجدة والدمام.'
        : 'In-depth analysis of custom clearance speeds, bonded zones, and multimodal infrastructure growth.',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              {isAr ? 'الأخبار والتحليلات اللوجستية' : 'NEWS & LOGISTICS INSIGHTS'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isAr ? 'آخر مستجدات أجا ورؤى سلاسل الإمداد' : 'Latest Updates & Industry Analysis'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate?.('about')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 shrink-0"
          >
            <span>{isAr ? 'جميع الأخبار والتقارير' : 'View All Insights'}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                    <Tag className="w-3 h-3" />
                    <span>{item.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <button
                onClick={() => onNavigate?.('about')}
                className="pt-3 border-t border-slate-800 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1"
              >
                <span>{isAr ? 'قراءة الخبر الكامل' : 'Read Article'}</span>
                <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
