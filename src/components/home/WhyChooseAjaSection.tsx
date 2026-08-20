import React from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Headphones,
  Award,
  Lock,
  Cpu,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface WhyChooseAjaSectionProps {
  onNavigate?: (tab: string) => void;
}

export const WhyChooseAjaSection: React.FC<WhyChooseAjaSectionProps> = ({
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: Activity,
      title: isAr ? 'تتبع فوري عبر الأقمار الصناعية' : 'Satellite Telemetry & GPS',
      desc: isAr
        ? 'ربط مباشر بأجهزة استشعار الحرارة والسرعة والأماكن المغلقة للحاويات مع تحديثات لحظية عبر منصة التحكم.'
        : 'Live container sensor tracking (location, temperature, door events) fed into our 24/7 central portal.',
      stat: '99.8%',
      statLabel: isAr ? 'دقة بيانات التتبع' : 'Telemetry Accuracy',
    },
    {
      icon: Zap,
      title: isAr ? 'تخليص جمركي ذكي < 24 ساعة' : 'Fast-Track FASAH Customs',
      desc: isAr
        ? 'فسح جمركي متكامل مع هيئة الزكاة والضريبة والجمارك مع تخليص أولي قبل وصول الشحنة للموانئ.'
        : 'Automated electronic declaration, fast-track green channels, and pre-arrival release across all KSA entries.',
      stat: '< 24h',
      statLabel: isAr ? 'معدل الفسح الجمركي' : 'Clearance Speed',
    },
    {
      icon: Headphones,
      title: isAr ? 'غرفة عمليات وتحكم 24/7' : '24/7 Control Tower Operations',
      desc: isAr
        ? 'فريق متخصص لمتابعة الشحنات الحيوية وإدارة الطوارئ وحل المعوقات قبل تأثيرها على مواعيد التسليم.'
        : 'Dedicated logistics controllers monitoring routes, traffic delays, and thermal variations around the clock.',
      stat: '24/7',
      statLabel: isAr ? 'متابعة بضائع فورية' : 'Active Support',
    },
    {
      icon: Lock,
      title: isAr ? 'تأمين وسلامة شحنات مؤسسية' : 'Enterprise Safety & Insurance',
      desc: isAr
        ? 'تغطية تأمينية شاملة ومعايير أمنية عالية للنقل الجوي والبحري والبري للمواد عالية القيمة والخطرة.'
        : 'Comprehensive cargo insurance options and TAPA-compliant security standards for high-value logistics.',
      stat: '100%',
      statLabel: isAr ? 'تغطية تأمينية متاحة' : 'Insurable Coverage',
    },
  ];

  const highlights = [
    isAr ? 'عضوية معتمدة في منظمات الشحن العالمية IATA & FIATA' : 'IATA & FIATA accredited global logistics agent',
    isAr ? 'شبكة مستودعات مرخصة ومناطق حرة في الرياض وجدة والدمام' : 'Licensed bonded & free-zone warehouses across KSA',
    isAr ? 'ربط البرمجيات المباشر عبر API مع أنظمة SAP & Oracle' : 'Direct API integration with ERPs (SAP, Oracle, Dynamics)',
    isAr ? 'أسطول شاحنات حديث متوافق مع معايير SFDA والأحمال الثقيلة' : 'SFDA & Hazmat compliant modern vehicle fleet',
  ];

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden border-t border-slate-800/80">
      {/* Background Decorative Accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Award className="w-3 h-3" />
            <span>{isAr ? 'لماذا أجا الدولية اللوجستية؟' : 'WHY CHOOSE AJA LOGISTICS'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isAr
              ? 'التميز التشغيلي والابتكار التقني في خدمات اللوجستيات'
              : 'Operational Excellence & Cutting-Edge Logistics Tech'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? 'نجمع بين الخبرة الميدانية العميقة وأنظمة التحكم الرقمية لتقديم تجربة نقل سلسة ترفع كفاءة سلاسل إمداد مؤسستك.'
              : 'Combining decades of logistics expertise with real-time digital intelligence for seamless supply chain performance.'}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-cyan-400 tracking-tight">
                    {feat.stat}
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">
                    {feat.statLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Trust Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-xl font-bold text-white">
              {isAr ? 'معايير جودة وحوكمة عالمية لحماية استثمارك' : 'Global Governance & Quality Standards'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button
              onClick={() => onNavigate?.('about')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <span>{isAr ? 'تعرف على إمكانياتنا' : 'Explore Capabilities'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate?.('contact')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700 text-center"
            >
              {isAr ? 'تواصل مع مستشارينا' : 'Contact Specialists'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
