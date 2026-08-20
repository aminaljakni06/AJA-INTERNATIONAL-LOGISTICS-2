import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe2, 
  Ship, 
  Plane, 
  Truck, 
  Navigation, 
  Layers, 
  Anchor, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Zap, 
  X, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  ORIGIN_POINTS, 
  DESTINATION_POINTS, 
  GLOBAL_ROUTES, 
  NetworkLocation, 
  NetworkRoute 
} from '../../data/networkData';

interface GlobalInteractiveMapProps {
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const GlobalInteractiveMap: React.FC<GlobalInteractiveMapProps> = ({ 
  onNavigate, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Filters State
  const [selectedTransport, setSelectedTransport] = useState<'ALL' | 'SEA' | 'AIR' | 'LAND'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  
  // Selection / Hover State
  const [activeLocation, setActiveLocation] = useState<NetworkLocation | null>(null);
  const [activeRoute, setActiveRoute] = useState<NetworkRoute | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Filter logic
  const allLocations = [...DESTINATION_POINTS, ...ORIGIN_POINTS];

  const filteredRoutes = GLOBAL_ROUTES.filter((route) => {
    if (selectedTransport !== 'ALL' && route.type !== selectedTransport) return false;
    
    if (selectedRegion !== 'ALL') {
      const fromPoint = ORIGIN_POINTS.find(p => p.id === route.fromId);
      if (fromPoint && fromPoint.region !== selectedRegion) return false;
    }
    return true;
  });

  // Canvas animation setup for flowing pulse particles
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles = filteredRoutes.map((route, i) => ({
      routeId: route.id,
      fromId: route.fromId,
      toId: route.toId,
      progress: (i * 0.15) % 1,
      speed: 0.003 + (i % 3) * 0.0015,
    }));

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        // Draw route particles
        filteredRoutes.forEach((route) => {
          const fromLoc = allLocations.find((l) => l.id === route.fromId);
          const toLoc = allLocations.find((l) => l.id === route.toId);

          if (!fromLoc || !toLoc) return;

          const x1 = (fromLoc.xPercent / 100) * width;
          const y1 = (fromLoc.yPercent / 100) * height;
          const x2 = (toLoc.xPercent / 100) * width;
          const y2 = (toLoc.yPercent / 100) * height;

          // Bezier control point calculation
          const curvature = route.curvature || -0.2;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const cx = x1 + dx * 0.5 - dy * curvature;
          const cy = y1 + dy * 0.5 + dx * curvature;

          // Find particle
          let particle = particles.find((p) => p.routeId === route.id);
          if (!particle) {
            particle = {
              routeId: route.id,
              fromId: route.fromId,
              toId: route.toId,
              progress: Math.random(),
              speed: 0.003 + Math.random() * 0.002,
            };
            particles.push(particle);
          }

          // Advance particle
          particle.progress += particle.speed;
          if (particle.progress > 1) particle.progress = 0;

          const t = particle.progress;
          // Quadratic Bezier formula: (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
          const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
          const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

          const isRouteActive = activeRoute?.id === route.id;
          const pColor = isRouteActive ? '#FFFFFF' : '#0F4C75';

          // Draw Glowing Particle
          ctx.beginPath();
          ctx.arc(px, py, isRouteActive ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = pColor;
          ctx.shadowColor = pColor;
          ctx.shadowBlur = isRouteActive ? 12 : 6;
          ctx.fill();

          // Draw trailing line pulse
          ctx.beginPath();
          const prevT = Math.max(0, t - 0.08);
          const pPrevX = (1 - prevT) * (1 - prevT) * x1 + 2 * (1 - prevT) * prevT * cx + prevT * prevT * x2;
          const pPrevY = (1 - prevT) * (1 - prevT) * y1 + 2 * (1 - prevT) * prevT * cy + prevT * prevT * y2;
          
          const gradient = ctx.createLinearGradient(pPrevX, pPrevY, px, py);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, pColor);

          ctx.moveTo(pPrevX, pPrevY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = isRouteActive ? 2.5 : 1.5;
          ctx.stroke();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [filteredRoutes, prefersReducedMotion, activeRoute]);

  return (
    <div className={`relative bg-[#082F49] text-white overflow-hidden rounded-3xl border border-[#0F4C75] shadow-2xl ${className}`}>
      
      {/* Map Header & Controls */}
      <div className="p-6 md:p-8 bg-[#082F49] backdrop-blur-md border-b border-[#0F4C75] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C75] text-white text-xs font-bold border border-[#0F4C75]">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'الشبكة التفاعلية الحية' : 'Live Interactive Network'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isAr ? 'الشبكة اللوجستية العالمية لأجا' : 'AJA Global Shipping Network'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            {isAr 
              ? 'انقر على أي ميناء أو مسار إبحار لاستعراض أوقات الترانزيت الشحنات الحية، وحجز السعة اللوجستية.' 
              : 'Click any port hub or corridor to view active vessel status, SLA transit days, and book freight capacity.'}
          </p>
        </div>

        {/* Transport Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTransport('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTransport === 'ALL'
                ? 'bg-[#0F4C75] text-white shadow-md'
                : 'bg-[#082F49] text-slate-200 hover:bg-[#082F49]/80 border border-[#0F4C75]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'جميع المسارات' : 'All Routes'}</span>
          </button>

          <button
            onClick={() => setSelectedTransport('SEA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTransport === 'SEA'
                ? 'bg-[#0F4C75] text-white shadow-md'
                : 'bg-[#082F49] text-slate-200 hover:bg-[#082F49]/80 border border-[#0F4C75]'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>{isAr ? 'بحري (Ocean)' : 'Ocean Freight'}</span>
          </button>

          <button
            onClick={() => setSelectedTransport('AIR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTransport === 'AIR'
                ? 'bg-[#0F4C75] text-white shadow-md'
                : 'bg-[#082F49] text-slate-200 hover:bg-[#082F49]/80 border border-[#0F4C75]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{isAr ? 'جوي (Air Cargo)' : 'Air Cargo'}</span>
          </button>

          <button
            onClick={() => setSelectedTransport('LAND')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTransport === 'LAND'
                ? 'bg-[#082F49] text-white shadow-md'
                : 'bg-[#0F4C75] text-slate-200 hover:bg-[#0F4C75]/80'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isAr ? 'بري (Overland)' : 'Land Transport'}</span>
          </button>
        </div>
      </div>

      {/* Region Selector Bar */}
      <div className="px-6 py-2.5 bg-[#082F49] border-b border-[#0F4C75] flex items-center gap-3 overflow-x-auto text-xs font-semibold relative z-20 no-scrollbar">
        <span className="text-slate-300 whitespace-nowrap">{isAr ? 'تصفية الإقليم:' : 'Region Filter:'}</span>
        {[
          { id: 'ALL', ar: 'كل الأقاليم', en: 'All World' },
          { id: 'Asia', ar: 'شرق آسيا والهند', en: 'Asia & India' },
          { id: 'Europe', ar: 'أوروبا والمحيط الأطلسي', en: 'Europe' },
          { id: 'Americas', ar: 'أمريكا الشمالية', en: 'Americas' },
          { id: 'MiddleEast', ar: 'الشرق الأوسط والخليج', en: 'Middle East' },
          { id: 'Africa', ar: 'أفريقيا وقناة السويس', en: 'Africa & Suez' },
        ].map((reg) => (
          <button
            key={reg.id}
            onClick={() => setSelectedRegion(reg.id)}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
              selectedRegion === reg.id
                ? 'bg-[#0F4C75] text-white border border-[#0F4C75] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {isAr ? reg.ar : reg.en}
          </button>
        ))}
      </div>

      {/* Main Map Viewport Area */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] md:min-h-[540px] bg-[#082F49] overflow-hidden select-none">
        
        {/* Geographic Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#0F4C75_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Simplified Vector World Map Outlines (SVG) */}
        <svg 
          className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none" 
          viewBox="0 0 1000 500" 
          preserveAspectRatio="none"
        >
          {/* Map Base Continents in surface-dark-elevated (#0F4C75) */}
          <path d="M720,120 Q820,100 880,180 T820,320 T700,280 Z" fill="#0F4C75" />
          <path d="M680,240 Q710,240 700,320 T670,260 Z" fill="#0F4C75" />
          <path d="M580,210 Q640,200 650,280 T570,270 Z" fill="#0F4C75" />
          <path d="M480,110 Q560,90 580,180 T470,170 Z" fill="#0F4C75" />
          <path d="M470,200 Q560,210 540,360 T450,280 Z" fill="#0F4C75" />
          <path d="M140,110 Q320,100 300,240 T160,220 Z" fill="#0F4C75" />
          <path d="M260,260 Q340,270 300,420 T240,320 Z" fill="#0F4C75" />
          <path d="M780,310 Q840,330 810,380 Z" fill="#0F4C75" />
        </svg>

        {/* SVG Curved Route Arcs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {filteredRoutes.map((route) => {
            const fromLoc = allLocations.find((l) => l.id === route.fromId);
            const toLoc = allLocations.find((l) => l.id === route.toId);
            if (!fromLoc || !toLoc) return null;

            const x1 = fromLoc.xPercent;
            const y1 = fromLoc.yPercent;
            const x2 = toLoc.xPercent;
            const y2 = toLoc.yPercent;

            const curvature = route.curvature || -0.2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx = x1 + dx * 0.5 - dy * curvature;
            const cy = y1 + dy * 0.5 + dx * curvature;

            const isSelected = activeRoute?.id === route.id;

            return (
              <g key={route.id}>
                {/* Arc Line: brand-gentian-blue (#0F4C75), Active Route: brand-white (#FFFFFF) */}
                <path
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  fill="none"
                  stroke={isSelected ? '#FFFFFF' : '#0F4C75'}
                  strokeWidth={isSelected ? 2.2 : 1.2}
                  strokeDasharray={route.type === 'AIR' ? '2, 2' : route.type === 'LAND' ? '3, 2' : 'none'}
                  opacity={isSelected ? 1 : 0.75}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Canvas Animation Layer for Moving Particles */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none z-15 canvas-3d-container"
          data-canvas-3d="true"
          role="img"
          aria-label={isAr ? "خريطة تفاعلية لتتبع الحركة عبر المسارات اللوجستية" : "Interactive logistics network route flow visualization"}
        />

        {/* Interactive Location Points */}
        {allLocations.map((loc) => {
          const isHovered = hoveredLocationId === loc.id;
          const isActive = activeLocation?.id === loc.id;
          const isPointActive = isActive || isHovered;

          // Check if this location is attached to any filtered route
          const hasRoute = filteredRoutes.some(
            (r) => r.fromId === loc.id || r.toId === loc.id
          );

          if (!hasRoute && loc.type !== 'DESTINATION') return null;

          return (
            <div
              key={loc.id}
              style={{ left: `${loc.xPercent}%`, top: `${loc.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onClick={() => {
                setActiveLocation(loc);
                // find primary route
                const relatedRoute = filteredRoutes.find(
                  (r) => r.fromId === loc.id || r.toId === loc.id
                );
                if (relatedRoute) setActiveRoute(relatedRoute);
              }}
              onMouseEnter={() => setHoveredLocationId(loc.id)}
              onMouseLeave={() => setHoveredLocationId(null)}
            >
              {/* Connection Point: brand-gentian-blue (#0F4C75), Active Point: brand-white (#FFFFFF) */}
              <div className="relative flex items-center justify-center">
                {isPointActive ? (
                  <>
                    <div className="absolute w-8 h-8 rounded-full bg-white/20 border border-white animate-ping" />
                    <div className="w-4 h-4 rounded-full bg-[#FFFFFF] border-2 border-[#0F4C75] shadow-lg shadow-white/40 flex items-center justify-center">
                      <MapPin className="w-2.5 h-2.5 text-[#0F4C75]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0F4C75] border border-white shadow-md group-hover:scale-125 transition-transform" />
                    <div className="absolute w-6 h-6 rounded-full bg-[#0F4C75]/30 animate-pulse pointer-events-none" />
                  </>
                )}
              </div>

              {/* Label Tag */}
              <div
                className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-xl pointer-events-none transition-all ${
                  isPointActive
                    ? 'bg-[#FFFFFF] text-[#0F4C75] border border-[#0F4C75]'
                    : 'bg-[#0F4C75]/95 border border-[#0F4C75] text-white'
                }`}
              >
                {isAr ? loc.nameAr : loc.nameEn}
              </div>
            </div>
          );
        })}

        {/* Saudi Arabia Primary Logistics Center Visual Badge */}
        <div className="absolute bottom-4 left-4 z-20 p-3 bg-[#0F4C75]/95 border border-[#0F4C75] rounded-2xl backdrop-blur-md max-w-xs space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-white font-black">
            <Anchor className="w-4 h-4 text-[#EA580C]" />
            <span>{isAr ? 'المركز الرئيسي: المملكة العربية السعودية' : 'Saudi Arabia Global Hub'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {isAr 
              ? 'موانئ جدة، الدمام، ونيوم متصلة مباشرة بأكثر من 40 خط إبحار عالمي.' 
              : 'Direct deepwater container access connecting 40+ global trade lanes.'}
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-20 p-3 bg-[#0F4C75]/95 border border-[#0F4C75] rounded-2xl backdrop-blur-md flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C75]" />
            <span className="text-slate-200">{isAr ? 'نقاط الربط والمسارات' : 'Connection Points & Routes'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
            <span className="text-slate-200">{isAr ? 'المسار / النقطة النشطة' : 'Active Point & Route'}</span>
          </div>
        </div>
      </div>

      {/* Selected Location / Route Detailed Drawer Panel */}
      {(activeLocation || activeRoute) && (
        <div className="p-6 bg-[#082F49] border-t border-[#0F4C75] relative z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => {
              setActiveLocation(null);
              setActiveRoute(null);
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#0F4C75] text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Column 1: Point / Route Overview */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full bg-[#0F4C75] border border-[#0F4C75]">
                {activeLocation?.type === 'DESTINATION' 
                  ? (isAr ? 'ميناء المقصد بالمملكة' : 'Saudi Hub Portal') 
                  : (isAr ? 'ميناء المنشأ العالمي' : 'Global Origin Port')}
              </span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {activeLocation ? (isAr ? activeLocation.nameAr : activeLocation.nameEn) : (isAr ? activeRoute?.nameAr : activeRoute?.nameEn)}
                <span className="text-xs font-mono text-slate-300">({activeLocation?.code || activeRoute?.id})</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeLocation ? (isAr ? activeLocation.descriptionAr : activeLocation.descriptionEn) : ''}
              </p>
            </div>

            {/* Column 2: Route Live SLA & Stats */}
            {activeRoute ? (
              <div className="bg-[#0F4C75] p-4 rounded-2xl border border-[#0F4C75] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-white">
                    <Clock className="w-3.5 h-3.5" />
                    {isAr ? 'زمن الترانزيت (SLA):' : 'Transit Time:'}
                  </span>
                  <span className="text-white text-sm font-black">{activeRoute.transitDays}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 border-t border-[#082F49] pt-1.5">
                  <span>{isAr ? 'تكرار الرحلات:' : 'Sailing Frequency:'}</span>
                  <span className="font-semibold text-slate-100">{activeRoute.frequency}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 border-t border-[#082F49] pt-1.5">
                  <span>{isAr ? 'الشحنات النشطة الآن:' : 'Active Shipments:'}</span>
                  <span className="font-bold text-white">{activeRoute.activeShipments} {isAr ? 'حاوية / شحنة' : 'units'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#0F4C75] p-4 rounded-2xl border border-[#0F4C75] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الطاقة الاستيعابية والمناولة:' : 'Capacity & Handling:'}</span>
                </div>
                <p className="text-sm font-black text-white">{activeLocation?.volume}</p>
                <p className="text-[11px] text-slate-300">
                  {isAr ? 'جاهزية كاملة للتخليص الجمركي الفوري عبر منصة فسح' : 'FASAH integrated priority customs clearance.'}
                </p>
              </div>
            )}

            {/* Column 3: Call to Action */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
              <button
                onClick={() => onNavigate?.('quote-request')}
                className="w-full px-5 py-3 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>{isAr ? 'طلب عرض سعر لهذا المسار' : 'Book Freight on This Route'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#EA580C]" />
              </button>
              <button
                onClick={() => onNavigate?.('contact')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F4C75] hover:bg-[#0F4C75]/80 text-white font-semibold text-xs text-center border border-slate-600"
              >
                {isAr ? 'الاستفسار عن جدولة السفن' : 'Inquire Vessel Schedule'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
