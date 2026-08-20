import React, { useState } from 'react';
import { Globe2, Anchor, Plane, MapPin, Navigation, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface InteractiveWorldMapSectionProps {
  onNavigate?: (tab: string) => void;
}

export const InteractiveWorldMapSection: React.FC<InteractiveWorldMapSectionProps> = ({
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const hubs = [
    {
      id: 'jeddah',
      name: isAr ? 'ميناء جدة الإسلامي (SAJED)' : 'Jeddah Islamic Port (SAJED)',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      type: 'maritime',
      capacity: '130,000+ TEU / Year',
      transit: 'Direct Red Sea Corridor',
      desc: isAr
        ? 'المركز الرئيسي للملاحة في البحر الأحمر مع ربط مباشر بجميع الموانئ العالمية.'
        : 'Primary Red Sea maritime hub connecting Far East, Europe, and Middle East corridors.',
      x: '58%',
      y: '48%',
    },
    {
      id: 'dammam',
      name: isAr ? 'ميناء الملك عبد العزيز بالدمام (SADMM)' : 'King Abdulaziz Port Dammam',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      type: 'maritime',
      capacity: '95,000+ TEU / Year',
      transit: 'Arabian Gulf Corridor',
      desc: isAr
        ? 'البوابة الشرقية الرئيسية للمملكة والربط البري المباشر مع دول الخليج.'
        : 'Major Eastern Province maritime port with direct rail and truck connections to Riyadh.',
      x: '62%',
      y: '44%',
    },
    {
      id: 'riyadh',
      name: isAr ? 'مطار الملك خالد الدولي بالرياض (RUH)' : 'King Khalid Intl Airport Riyadh',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      type: 'air',
      capacity: '45,000 Tons Air Freight',
      transit: 'Express Air Hub',
      desc: isAr
        ? 'مركز الشحن الجوي الرئيسي للعاصمة مع مستودعات مبردة ومناطق حرّة.'
        : 'Main air cargo logistics hub in central KSA with temperature-controlled warehouses.',
      x: '60%',
      y: '46%',
    },
    {
      id: 'dubai',
      name: isAr ? 'ميناء جبل علي - دبي (AEJEA)' : 'Jebel Ali Port Dubai (AEJEA)',
      country: isAr ? 'الإمارات العربية المتحدة' : 'United Arab Emirates',
      type: 'maritime',
      capacity: '180,000+ TEU / Year',
      transit: 'GCC Transshipment Hub',
      desc: isAr
        ? 'محطة إعادة الشحن الإقليمية البينية لربط شحنات الشرق الأقصى بالخليج.'
        : 'Key regional transshipment hub connecting Far East lines to GCC truck corridors.',
      x: '65%',
      y: '46%',
    },
    {
      id: 'shanghai',
      name: isAr ? 'ميناء شنغهاي - الصين (CNSHA)' : 'Port of Shanghai (CNSHA)',
      country: isAr ? 'الصين' : 'China',
      type: 'maritime',
      capacity: 'Global Trade Hub',
      transit: 'Far East Gateway',
      desc: isAr
        ? 'أكبر مصدر بضائع ومعدات صناعية متجهة لموانئ المملكة والخليج.'
        : 'Primary Far East origin port for raw materials, machinery, and consumer goods.',
      x: '82%',
      y: '42%',
    },
    {
      id: 'rotterdam',
      name: isAr ? 'ميناء روتردام - هولندا (NLRTM)' : 'Port of Rotterdam (NLRTM)',
      country: isAr ? 'هولندا / أوروبا' : 'Netherlands / Europe',
      type: 'maritime',
      capacity: 'European Gateway',
      transit: 'Europe - KSA Direct Line',
      desc: isAr
        ? 'بوابة البضائع والمعدات الأوروبية عالية التكنولوجيا نحو السعودية.'
        : 'Major European export gateway for machinery, pharma, and chemical products.',
      x: '48%',
      y: '32%',
    },
  ];

  const [selectedHub, setSelectedHub] = useState<number>(0);
  const current = hubs[selectedHub];

  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'الشبكة الملاحية والمسارات' : 'GLOBAL NETWORK & TRADE CORRIDORS'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isAr ? 'خريطة المحطات اللوجستية والموانئ العالمية' : 'Interactive Global Corridors & Port Hubs'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'اضغط على أي محطة للاطلاع على طاقة الترانزيت وخطوط الملاحة المباشرة.'
              : 'Select key maritime ports & air freight gateways to explore transit routes.'}
          </p>
        </div>

        {/* Map Grid Container */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Interactive Map Canvas */}
          <div className="lg:col-span-8 relative h-[340px] sm:h-[420px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden p-4 flex flex-col justify-between">
            {/* World Grid Lines Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-cyan-400 font-bold">AJA GLOBAL ROUTE TELEMETRY</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {hubs.length} Active Hubs
              </span>
            </div>

            {/* Hub Hotspot Pins */}
            <div className="absolute inset-0 pointer-events-auto">
              {hubs.map((h, idx) => {
                const isSelected = idx === selectedHub;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHub(idx)}
                    style={{ left: h.x, top: h.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all ${
                      isSelected ? 'z-30 scale-125' : 'z-20 hover:scale-110'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <span className="absolute w-8 h-8 rounded-full bg-cyan-500/40 animate-ping" />
                      )}
                      <div
                        className={`p-2 rounded-full border shadow-lg transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-white shadow-cyan-500/50'
                            : 'bg-slate-900 text-cyan-400 border-slate-700 hover:border-cyan-400'
                        }`}
                      >
                        {h.type === 'maritime' ? (
                          <Anchor className="w-4 h-4" />
                        ) : (
                          <Plane className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Legend */}
            <div className="relative z-10 flex flex-wrap gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                {isAr ? 'موانئ بحرية محورية' : 'Maritime Ports'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                {isAr ? 'محطات شحن جوي' : 'Air Cargo Hubs'}
              </span>
            </div>
          </div>

          {/* Hub Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
                  {current.country}
                </span>
                <span className="text-xs text-slate-400 uppercase font-mono">
                  {current.type}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">{current.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{current.desc}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'الطاقة الاستيعابية:' : 'Capacity:'}</span>
                <span className="text-white font-semibold">{current.capacity}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'نوع الممر اللوجستي:' : 'Trade Corridor:'}</span>
                <span className="text-cyan-400 font-semibold">{current.transit}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.('global-network')}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
            >
              <span>{isAr ? 'استكشف كافة الموانئ والمسارات' : 'Explore All Hubs & Ports'}</span>
              <ArrowIcon className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
