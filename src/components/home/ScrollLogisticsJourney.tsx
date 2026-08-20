import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  PackageCheck, 
  Ship, 
  Plane, 
  ShieldCheck, 
  Truck, 
  Warehouse, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Activity, 
  ArrowLeft,
  Navigation,
  Globe
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../../design-system/primitives/Button';

interface ScrollLogisticsJourneyProps {
  onNavigate?: (tab: string) => void;
}

export const ScrollLogisticsJourney: React.FC<ScrollLogisticsJourneyProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Optimized Scroll Listener using requestAnimationFrame
  useEffect(() => {
    if (isReducedMotion) return;

    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate start and end bounds inside the section viewport
      const totalDist = rect.height - windowHeight;
      if (totalDist <= 0) return;

      const currentY = -rect.top;
      let progress = currentY / totalDist;
      progress = Math.max(0, Math.min(1, progress));

      setScrollProgress(progress);

      // Determine active step index (0 to 6 for 7 steps)
      const stepIdx = Math.min(6, Math.floor(progress * 7));
      setActiveStepIndex(stepIdx);
    };

    const onScroll = () => {
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion]);

  // Steps definition for 7-Stage Logistics Journey
  const journeySteps = [
    {
      id: 'origin',
      stepNumber: '01',
      title: isAr ? '1. المنشأ والمصنع (Origin)' : '1. Origin & Supplier Facility',
      subtitle: isAr ? 'استلام بيانات الشحنة من المصنّع' : 'Manufacturer dispatch & cargo verification',
      desc: isAr
        ? 'تبدأ الرحلة في منشأة المورد أو المصنع الرئيسي، حيث يتم تجهيز البضائع وفحص الحمولات وتوثيق البيانات الأولية بترميز رقمي موحد.'
        : 'The cargo journey begins at the origin factory, where goods are packaged, weighed, and assigned digital RFID tracking IDs.',
      icon: Building2,
      transportType: 'factory',
      badge: isAr ? 'نقطة الانطلاق' : 'Origin Node',
      location: isAr ? 'شانغهاي / الرياض' : 'Origin Facility Hub',
      stat: '100% Quality Checked',
    },
    {
      id: 'pickup',
      stepNumber: '02',
      title: isAr ? '2. استلام الشحنة (Shipment Pickup)' : '2. Cargo Pickup & Inspection',
      subtitle: isAr ? 'تحميل الأسطول الذكي للميل الأول' : 'Smart fleet dispatch & first-mile loading',
      desc: isAr
        ? 'ينطلق أسطول أجا اللوجستي لاستلام الشحنة وتثبيتها في الحاويات الآمنة مع تفعيل أجهزة استشعار درجة الحرارة والصدمات.'
        : 'AJA dedicated fleet handles first-mile pickup with real-time GPS sensors monitoring cargo environment and security locks.',
      icon: PackageCheck,
      transportType: 'truck',
      badge: isAr ? 'الميل الأول' : 'First-Mile Pickup',
      location: isAr ? 'شاحنات أجا المعتمدة' : 'AJA Express Fleet',
      stat: 'GPS & Telemetry Active',
    },
    {
      id: 'route',
      stepNumber: '03',
      title: isAr ? '3. مسار الشحن الدولي (Logistics Route)' : '3. Multimodal Transit Route',
      subtitle: isAr ? 'الشحن البحري والجوي عبر المحيطات' : 'International ocean & air cargo transit',
      desc: isAr
        ? 'انتقال الشحنة عبر خطوط الملاحة البحرية الدولية أو الشحن الجوي الفائق مع تتبع موقع السفينة/الطائرة لحظة بلحظة عبر الأقمار الصناعية.'
        : 'Cargo moves seamlessly across international ocean lanes or air corridors with continuous satellite position telemetry.',
      icon: Ship,
      transportType: 'ship',
      badge: isAr ? 'العبور الدولي' : 'Global Corridor',
      location: isAr ? 'الخطوط البحرية / الجوية' : 'International Ocean Line',
      stat: 'Satellite Live Telemetry',
    },
    {
      id: 'connection',
      stepNumber: '04',
      title: isAr ? '4. الربط الجمركي (Global Connection)' : '4. Customs Clearance & Port Hub',
      subtitle: isAr ? 'تخليص فوري عبر الموانئ ومنصة "فسح"' : 'FASAH rapid port clearance & customs release',
      desc: isAr
        ? 'وصول الشحنة لميناء جدة الإسلامي أو ميناء الملك عبد العزيز بالدمام، وتخليصها بمرونة وسرعة قياسية عبر الربط الفوري المباشر مع هيئة الجمارك.'
        : 'Arrival at Jeddah or Dammam port, where AJA automated customs clearance clears documentation in under 24 hours.',
      icon: ShieldCheck,
      transportType: 'customs',
      badge: isAr ? 'التخليص المباشر' : 'Customs Cleared',
      location: isAr ? 'ميناء جدة / ميناء الدمام' : 'Saudi Port Terminals',
      stat: 'SLA < 24 Hours Release',
    },
    {
      id: 'transit',
      stepNumber: '05',
      title: isAr ? '5. العبور البري والترانزيت (Transit)' : '5. Regional Highway Transit',
      subtitle: isAr ? 'النقل السريع عبر شرايين المملكة والخليج' : 'Cross-border overland express transport',
      desc: isAr
        ? 'انطلاق الشاحنات والمقطورات المبردة على الطرق السريعة للربط بين الموانئ والمستودعات الإقليمية بكفاءة وأمان كامل.'
        : 'Heavy container transport moving along primary highways connecting sea ports to central inland dry hubs.',
      icon: Truck,
      transportType: 'truck',
      badge: isAr ? 'الأسطول البري' : 'Overland Freight',
      location: isAr ? 'شبكة الطرق السريعة' : 'GCC Express Arteries',
      stat: 'Cold-Chain Controlled',
    },
    {
      id: 'destination',
      stepNumber: '06',
      title: isAr ? '6. مستودع الوجهة (Destination Hub)' : '6. Regional Fulfillment Hub',
      subtitle: isAr ? 'الفرز، التخزين، والوفاء بالطلبات' : 'Smart warehousing & inventory sorting',
      desc: isAr
        ? 'تفريغ وتنسيق الشحنة في مستودعات أجا المركزية المعتمدة وتجهيزها للتوزيع النهائي وفق أحدث نظم إدارة المستودعات WMS.'
        : 'Cargo enters AJA temperature-controlled bonded warehouses for automated inventory sorting and local order fulfillment.',
      icon: Warehouse,
      transportType: 'warehouse',
      badge: isAr ? 'المستودع الذكي' : 'Bonded Hub',
      location: isAr ? 'المركز اللوجستي بالرياض' : 'Riyadh Central Hub',
      stat: 'WMS Automated Sorting',
    },
    {
      id: 'delivery',
      stepNumber: '07',
      title: isAr ? '7. التسليم النهائي (Final Delivery)' : '7. Last-Mile Doorstep Handover',
      subtitle: isAr ? 'تسليم الشحنة للعميل بنجاح تام' : 'Verified doorstep delivery & POD digital sign',
      desc: isAr
        ? 'وصول الشحنة إلى مقر العميل أو منفذ البيع النهائي، والحصول على إثبات التسليم الرقمي POD وتوثيق اكتمال الرحلة بنجاح.'
        : 'Final delivery executed to customer door or warehouse with instant electronic Proof of Delivery (e-POD) confirmation.',
      icon: CheckCircle2,
      transportType: 'delivered',
      badge: isAr ? 'تم التسليم بنجاح' : 'Delivered Successfully',
      location: isAr ? 'مقر العميل النهائي' : 'Client Doorstep',
      stat: '100% POD Confirmed',
    },
  ];

  const currentStep = journeySteps[activeStepIndex] || journeySteps[0];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[320vh] bg-[#082F49] text-white py-16 overflow-hidden border-y border-[#0F4C75]"
    >
      {/* Dynamic Background Mesh & Glowing Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-radial from-[#0F4C75]/30 via-transparent to-transparent rounded-full blur-[160px]" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(15, 76, 117, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 76, 117, 0.2) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Sticky Storytelling Content Container */}
      <div className="sticky top-20 min-h-[85vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6">
        
        {/* Story Header & Live Scroll Progress Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0F4C75] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C75] text-white text-xs font-bold uppercase tracking-wider mb-2">
                <Navigation className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{isAr ? 'رحلة الشحنة التفاعلية' : 'LIVE CARGO JOURNEY SIMULATOR'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {isAr ? 'تتبع مسار شحنتك من المورد حتى باب بيتك' : 'Interactive End-to-End Cargo Lifecycle'}
              </h2>
            </div>

            {/* Scroll Progress Metric & Live Percentage */}
            <div className="flex items-center gap-4 bg-[#082F49] p-3 rounded-2xl border border-[#0F4C75] shadow-lg">
              <div className="text-end">
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">
                  {isAr ? 'نسبة إنجاز الرحلة' : 'Journey Progress'}
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0F4C75] border border-[#0F4C75] flex items-center justify-center text-white font-bold text-xs font-mono">
                {activeStepIndex + 1}/7
              </div>
            </div>
          </div>

          {/* Top Progress Track Lines */}
          <div className="relative w-full h-2 bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
            <div 
              className="absolute top-0 bottom-0 start-0 bg-[#0F4C75] transition-all duration-150 ease-out"
              style={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
            />
          </div>
        </div>

        {/* Middle Stage: SVG Animated Logistics Map & Active Stage Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">
          
          {/* Left Column (7 cols): Visual Route Canvas & Interactive Node Markers */}
          <div className="lg:col-span-7 bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 sm:p-8 backdrop-blur-md relative shadow-2xl overflow-hidden min-h-[340px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-[#0F4C75] pb-3">
              <span className="flex items-center gap-1.5 text-blue-300 font-bold">
                <Activity className="w-4 h-4 text-white animate-pulse" />
                {isAr ? 'محاكاة تتبع الأقمار الصناعية' : 'SATELLITE TELEMETRY FEED'}
              </span>
              <span className="bg-emerald-950/80 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[10px] font-bold">
                LIVE STATUS: {currentStep.stat}
              </span>
            </div>

            {/* SVG Interactive Logistics Route Lines */}
            <div className="relative my-8 py-4">
              <svg 
                className="w-full h-28 overflow-visible"
                viewBox="0 0 700 100"
                fill="none"
              >
                {/* Background Route Path */}
                <path
                  d="M 20 50 Q 150 10, 350 50 T 680 50"
                  stroke="#0F4C75"
                  strokeWidth="4"
                  fill="none"
                />

                {/* Animated Glowing Progress Line */}
                <path
                  d="M 20 50 Q 150 10, 350 50 T 680 50"
                  stroke="url(#journeyGradient)"
                  strokeWidth="5"
                  strokeDasharray="700"
                  strokeDashoffset={700 - scrollProgress * 700}
                  fill="none"
                  className="transition-all duration-100 ease-out"
                />

                <defs>
                  <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F4C75" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* 7 Node Dots on the Route Line */}
                {journeySteps.map((step, idx) => {
                  const percent = idx / 6;
                  // Approximate coordinates along the SVG curve
                  const cx = 20 + percent * 660;
                  const cy = 50 + Math.sin(percent * Math.PI * 2) * 20;
                  const isActive = idx === activeStepIndex;
                  const isPassed = idx <= activeStepIndex;

                  return (
                    <g 
                      key={step.id} 
                      onClick={() => {
                        setActiveStepIndex(idx);
                        setScrollProgress(idx / 6);
                      }}
                      className="cursor-pointer group"
                    >
                      {isActive && (
                        <circle cx={cx} cy={cy} r="16" fill="#0F4C75" fillOpacity="0.25" className="animate-ping" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? "10" : "6"}
                        fill={isActive ? "#0F4C75" : isPassed ? "#082F49" : "#334155"}
                        stroke="#082F49"
                        strokeWidth="2"
                        className="transition-all duration-300 group-hover:scale-125"
                      />
                      <text
                        x={cx}
                        y={cy + 24}
                        textAnchor="middle"
                        fill={isActive ? "#0F4C75" : isPassed ? "#94A3B8" : "#475569"}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {step.stepNumber}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Moving Cargo Badge Vehicle Marker along current active node */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${Math.min(92, Math.max(2, (activeStepIndex / 6) * 92))}%`,
                }}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#0F4C75] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce" style={{ animationDuration: '3s' }}>
                  {activeStepIndex === 2 ? (
                    <Ship className="w-5 h-5" />
                  ) : activeStepIndex === 3 ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : activeStepIndex === 5 ? (
                    <Warehouse className="w-5 h-5" />
                  ) : activeStepIndex === 6 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Truck className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Step Select Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400">{isAr ? 'انقر على أي مرحلة للانتقال:' : 'Click any milestone:'}</span>
              <div className="flex flex-wrap gap-1.5">
                {journeySteps.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setScrollProgress(idx / 6);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                      idx === activeStepIndex
                        ? 'bg-[#0F4C75] text-white shadow'
                        : idx < activeStepIndex
                        ? 'bg-[#082F49] text-slate-200 hover:bg-[#0F4C75]'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {s.stepNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Active Stage Detail Showcase */}
          <div className="lg:col-span-5 bg-[#082F49] border-2 border-[#0F4C75] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#0F4C75] text-white border border-[#0F4C75] text-xs font-bold font-mono">
                {currentStep.badge}
              </span>
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F4C75]" />
                {currentStep.location}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-300 font-bold">
                {currentStep.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentStep.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-[#0F4C75] flex items-center justify-between text-xs">
              <span className="text-slate-400">{isAr ? 'المتابعة المباشرة:' : 'Real-Time Status:'}</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {currentStep.stat}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Finale Banner inside Scroll Experience: AJA MOVING BUSINESS FORWARD */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-start">
            <div className="w-10 h-10 bg-[#0F4C75] rounded-xl flex items-center justify-center p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#082F49] rounded-[10px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-widest block leading-none">
                AJA
              </span>
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] block mt-1">
                MOVING BUSINESS FORWARD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate?.('quote-request')}
              className="bg-[#0F4C75] hover:bg-[#082F49] text-white font-bold border border-[#0F4C75]"
            >
              <span>{isAr ? 'طلب عرض سعر الشحنة' : 'Get Cargo Quote'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('tracking')}
              className="border-slate-700 text-slate-200 hover:bg-white/10"
            >
              <span>{isAr ? 'تتبع شحنتك الحية' : 'Track Shipment Live'}</span>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};
