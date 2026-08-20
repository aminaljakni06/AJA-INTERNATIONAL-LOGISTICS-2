import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Cpu, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Sparkles, 
  Target, 
  Lightbulb, 
  Award, 
  Handshake, 
  BarChart3, 
  Truck, 
  Navigation,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface CompanyStorySectionProps {
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const CompanyStorySection: React.FC<CompanyStorySectionProps> = ({ 
  onNavigate, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Process Steps Data
  const processSteps = [
    {
      num: '01',
      titleEn: 'PLAN',
      titleAr: 'التخطيط والتحليل',
      descEn: 'Strategic route mapping, cargo classification, customs pre-clearance, and capacity allocation tailored to your SLA requirements.',
      descAr: 'تخطيط وتحديد المسار الأمثل، تصنيف الشحنات، إعداد المستندات الجمركية المسبقة، وحجز السعة الاستيعابية المخصصة.',
      icon: Compass,
      metricEn: 'Route Optimization',
      metricAr: 'تحسين المسارات 100%',
      color: '#0F4C75',
    },
    {
      num: '02',
      titleEn: 'MOVE',
      titleAr: 'التحريك والتحميل',
      descEn: 'Precision loading at origin ports, smart vessel stage placement, and rapid cross-docking execution across air, sea, and land lines.',
      descAr: 'المناولة الدقيقة بموانئ المنشأ، التثبيت الآمن بالحاويات الشاملة، والتحريك الفوري عبر الخطوط البحرية والبرية والجوية.',
      icon: Truck,
      metricEn: '24/7 Dispatch',
      metricAr: 'تحريك مستمر على مدار الساعة',
      color: '#082F49',
    },
    {
      num: '03',
      titleEn: 'TRACK',
      titleAr: 'التتبع الحي والمتابعة',
      descEn: 'Real-time telemetry, IoT temperature monitoring, automated FASAH customs status updates, and predictive ETA calculations.',
      descAr: 'تتبع بالأقمار الصناعية لحظة بلحظة، مراقبة التبريد الحية، التحديث الآلي للفسح الجمركي، وحساب وقت الوصول الدقيق.',
      icon: Eye,
      metricEn: 'Real-Time Telemetry',
      metricAr: 'شفافية وتتبع حقيقي 100%',
      color: '#0F4C75',
    },
    {
      num: '04',
      titleEn: 'DELIVER',
      titleAr: 'التسليم المضمن',
      descEn: 'Final door-to-door delivery, site offloading, digital proof of delivery (e-POD), and post-shipment analytics reporting.',
      descAr: 'التسليم المباشر للمرحلة الأخيرة، التفريغ بالموقع، التوقيع الرقمي الفوري للوصول (e-POD)، والتقارير التجميعية.',
      icon: CheckCircle2,
      metricEn: 'Guaranteed SLA',
      metricAr: 'تأكيد وصول وتسليم مضمون',
      color: '#10B981',
    },
  ];

  // Auto cycle process steps
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Core Values Data
  const values = [
    {
      en: 'Reliability',
      ar: 'الموثوقية',
      descEn: 'Unwavering commitment to delivery timelines and asset safety.',
      descAr: 'التزام مطلق بجداول التوصيل وسلامة البضائع في جميع المراحل.',
      icon: ShieldCheck,
    },
    {
      en: 'Transparency',
      ar: 'الشفافية',
      descEn: 'Complete visibility into costs, tracking status, and operations.',
      descAr: 'شفافية كاملة بالأسعار، حالات التخليص، وتتبع المسار دون تكاليف خفية.',
      icon: Eye,
    },
    {
      en: 'Precision',
      ar: 'الدقة',
      descEn: 'Meticulous execution in cargo handling and customs filings.',
      descAr: 'دقة متناهية في معالجة المستندات الجمركية والمناولة.',
      icon: Target,
    },
    {
      en: 'Innovation',
      ar: 'الابتكار',
      descEn: 'Leveraging cutting-edge tech to streamline global logistics.',
      descAr: 'تسخير أحدث التقنيات الرقمية لتبسيط العمليات اللوجستية.',
      icon: Lightbulb,
    },
    {
      en: 'Partnership',
      ar: 'الشراكة',
      descEn: 'Building long-term collaborative value with our clients.',
      descAr: 'بناء روابط شريك استراتيجي طويل الأجل لتمكين توسع أعمالكم.',
      icon: Handshake,
    },
    {
      en: 'Responsibility',
      ar: 'المسؤولية',
      descEn: 'Strict adherence to global safety, compliance, and sustainability.',
      descAr: 'الامتثال الصارم لمعايير الجودة، السلامة المهنية، والاستدامة.',
      icon: Award,
    },
  ];

  // Why AJA Pillars Data
  const whyAjaPillars = [
    {
      titleEn: 'Reliability',
      titleAr: 'الموثوقية التشغيلية',
      descEn: 'Consistent execution, guaranteed SLAs, and continuous risk mitigation for critical supply chains.',
      descAr: 'تشغيل ثابت بضمان زمني عالي ومراقبة مستمرة لمخاطر سلاسل التوريد الحيوية.',
      icon: ShieldCheck,
      accent: 'border-[#0F4C75] text-[#0F4C75]',
      bg: 'bg-[#0F4C75]/10',
    },
    {
      titleEn: 'Visibility',
      titleAr: 'الشفافية والشفافية الحية',
      descEn: '24/7 real-time tracking, instant alerts, and automated customs release status via FASAH.',
      descAr: 'تتبع حي على مدار الساعة، تنبيهات فورية، ورصد مباشر لفسح الشحنات عبر منصة فسح.',
      icon: Eye,
      accent: 'border-[#0F4C75] text-[#0F4C75] dark:text-white',
      bg: 'bg-[#0F4C75]/10',
    },
    {
      titleEn: 'Global Reach',
      titleAr: 'الوصول والربط العالمي',
      descEn: 'Direct access to major ports, shipping lines, and cross-border corridors linking Saudi Arabia to the world.',
      descAr: 'ربط مباشر بأهم الموانئ والخطوط الملاحية الدولية التي تصل المملكة العربية السعودية بالعالم.',
      icon: Globe,
      accent: 'border-amber-400 text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      titleEn: 'Smart Logistics',
      titleAr: 'اللوجستيات الرقمية الذكية',
      descEn: 'Automated warehouse systems, route optimization algorithms, and digital documentation.',
      descAr: 'أنظمة إدارة المستودعات الرقمية، خوارزميات تحسين المسارات، والأتمتة الشاملة.',
      icon: Cpu,
      accent: 'border-emerald-400 text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <section className={`space-y-16 py-8 ${className}`}>
      
      {/* 1. ABOUT SECTION - Header Banner */}
      <div className="relative rounded-3xl bg-[#082F49] p-8 sm:p-12 border border-[#0F4C75] shadow-2xl overflow-hidden text-white">
        
        {/* Background Glow Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F4C75]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isAr ? 'عن شركة أجا اللوجستية' : 'ABOUT AJA LOGISTICS'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase">
            MOVING BUSINESS.<br />
            <span className="text-white">
              CONNECTING THE WORLD.
            </span>
          </h2>

          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            <p className="font-semibold text-white">
              {isAr 
                ? 'تأسست أجا الدولية للخدمات اللوجستية بناءً على قناعة بسيطة: اللوجستيات يجب أن تدفع الأعمال للأمام، لا أن تبطئها.'
                : 'AJA International Logistics is built around one simple belief: logistics should move business forward, not slow it down.'}
            </p>
            <p className="text-slate-400">
              {isAr
                ? 'نحن نجمع بين الموثوقية التشغيلية، والربط العالمي، والتقنية الحديثة، والحلول الموجهة لخدمة العملاء لمساعدة الشركات على النقل والتوسع بثقة مطلقة.'
                : 'We combine operational reliability, global connectivity, technology, and customer-focused solutions to help businesses move with confidence.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. VISION & MISSION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* VISION */}
        <div className="group relative bg-[#082F49] border border-[#0F4C75] hover:border-[#EA580C] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl space-y-4 overflow-hidden text-white">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4C75] text-white flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#EA580C]">
              {isAr ? 'رؤيتنا المستقبليّة' : 'OUR VISION'}
            </span>
            <h3 className="text-xl font-black text-white">
              {isAr ? 'الرؤية (Vision)' : 'Vision'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed pt-1 font-medium">
              "To become a trusted global logistics partner powering smarter movement across markets."
            </p>
            {isAr && (
              <p className="text-xs text-slate-300 pt-1">
                "أن نكون الشريك اللوجستي العالمي الموثوق الذي يُمكّن النقل والتطوير الذكي عبر الأسواق."
              </p>
            )}
          </div>
        </div>

        {/* MISSION */}
        <div className="group relative bg-[#082F49] border border-[#0F4C75] hover:border-[#EA580C] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl space-y-4 overflow-hidden text-white">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4C75] text-white flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#EA580C]">
              {isAr ? 'رسالتنا وهدفنا' : 'OUR MISSION'}
            </span>
            <h3 className="text-xl font-black text-white">
              {isAr ? 'الرسالة (Mission)' : 'Mission'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed pt-1 font-medium">
              "To simplify logistics through reliable operations, intelligent technology, and solutions designed around the needs of modern businesses."
            </p>
            {isAr && (
              <p className="text-xs text-slate-300 pt-1">
                "تبسيط الخدمات اللوجستية من خلال عمليات موثوقة، وتقنيات ذكية، وحلول مصممة لتلبية تطلعات الشركات الحديثة."
              </p>
            )}
          </div>
        </div>

      </div>

      {/* 3. VALUES GRID */}
      <div className="space-y-8 bg-[#082F49] p-8 sm:p-10 rounded-3xl border border-[#0F4C75] text-white">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#EA580C]">
            {isAr ? 'قيمنا الجوهرية' : 'OUR CORE VALUES'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'القيم التي تحكم تميزنا' : 'Values That Drive Our Excellence'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div 
                key={i} 
                className="p-5 bg-[#0F4C75]/50 border border-[#0F4C75] hover:border-[#EA580C] rounded-2xl text-center space-y-3 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#082F49] border border-[#0F4C75] text-white group-hover:border-[#EA580C] group-hover:bg-[#0F4C75] flex items-center justify-center mx-auto transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white transition-colors">
                    {v.en}
                  </h4>
                  {isAr && (
                    <p className="text-xs text-slate-300 font-semibold">{v.ar}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WHY AJA SECTION */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F4C75] dark:text-sky-400">
            {isAr ? 'لماذا تختار أجا؟' : 'WHY AJA'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isAr ? 'أركان التفوق والاعتماد' : 'Four Pillars of Strategic Advantage'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyAjaPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-white dark:bg-[#082F49] border border-slate-200 dark:border-[#0F4C75] transition-all duration-300 space-y-4 relative overflow-hidden group`}
              >
                <div className={`w-12 h-12 rounded-2xl ${p.bg} border ${p.accent} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white transition-colors">
                    {p.titleEn}
                  </h3>
                  {isAr && (
                    <p className="text-xs font-bold text-[#0F4C75] dark:text-sky-300">{p.titleAr}</p>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr ? p.descAr : p.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PROCESS SECTION (01 PLAN -> 02 MOVE -> 03 TRACK -> 04 DELIVER) */}
      <div className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-8 sm:p-12 space-y-10 relative overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F4C75] text-white text-xs font-bold">
            <Navigation className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسار العمل الموحد' : 'OUR OPERATIONAL PROCESS'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isAr ? 'مراحل تنفيذ وحركة الشحنة' : '4-Stage Seamless Cargo Flow'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr 
              ? 'انقر على أي مرحلة للاطلاع على تفاصيل الأتمتة وضمان السرعة والأمان.'
              : 'Click any stage to view process specifics and real-time execution guarantees.'}
          </p>
        </div>

        {/* Process Flow Diagram */}
        <div className="relative pt-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.num}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`cursor-pointer p-6 rounded-3xl transition-all duration-300 relative border flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#0F4C75] border-white text-white shadow-xl scale-105'
                      : 'bg-[#0F4C75]/50 border-[#0F4C75] hover:border-slate-500 opacity-90'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-black font-mono tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {step.num}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                        isActive 
                          ? 'bg-white text-[#0F4C75] font-bold' 
                          : 'bg-[#082F49] text-slate-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white tracking-wider">
                        {step.titleEn}
                      </h3>
                      {isAr && (
                        <p className="text-xs font-bold text-slate-200">{step.titleAr}</p>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {isAr ? step.descAr : step.descEn}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300">{isAr ? 'الضمان:' : 'SLA Target:'}</span>
                    <span className="font-bold text-white">{isAr ? step.metricAr : step.metricEn}</span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Step Deep Dive Banner */}
        <div className="p-6 bg-[#0F4C75]/50 border border-[#0F4C75] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-white">
              <MapPin className="w-4 h-4 text-[#EA580C]" />
              <span>
                {isAr 
                  ? `المرحلة الحالية: ${processSteps[activeStep].num} — ${processSteps[activeStep].titleAr}`
                  : `Active Stage: ${processSteps[activeStep].num} — ${processSteps[activeStep].titleEn}`}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {isAr ? processSteps[activeStep].descAr : processSteps[activeStep].descEn}
            </p>
          </div>

          <button
            onClick={() => onNavigate?.('quote-request')}
            className="px-6 py-3 rounded-2xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shrink-0"
          >
            <span>{isAr ? 'بدء شحنة جديدة وفق هذا المسار' : 'Book Shipment on This Flow'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#EA580C]" />
          </button>
        </div>

      </div>

    </section>
  );
};
