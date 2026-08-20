import React, { useState } from 'react';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Ship,
  Plane,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface InteractiveTrackingSectionProps {
  onTrackShipment?: (trackingNum: string) => void;
  onNavigate?: (tab: string) => void;
}

export const InteractiveTrackingSection: React.FC<InteractiveTrackingSectionProps> = ({
  onTrackShipment,
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [inputVal, setInputVal] = useState<string>('AJA-892410-SA');
  const [activeTab, setActiveTab] = useState<'container' | 'airway' | 'road'>('container');

  // Sample tracking result for instant live simulation
  const demoResult = {
    trackingNo: inputVal || 'AJA-892410-SA',
    status: isAr ? 'قيد الترانزيت الملاحي' : 'In Maritime Transit',
    origin: isAr ? 'ميناء شنغهاي، الصين (CNSHA)' : 'Port of Shanghai, CN (CNSHA)',
    destination: isAr ? 'ميناء جدة الإسلامي، السعودية (SAJED)' : 'Jeddah Islamic Port, KSA (SAJED)',
    eta: isAr ? '14 أغسطس 2026 - 16:30' : 'Aug 14, 2026 - 16:30',
    carrier: 'AJA Global Ocean Express',
    vessel: 'MV AJA Horizon (V.882)',
    progress: 68,
    milestones: [
      {
        title: isAr ? 'تم استلام الشحنة وتجهيز الحاوية' : 'Cargo Gate-In & Container Loading',
        location: 'Shanghai Logistics Hub',
        time: '02 Aug, 09:15',
        completed: true,
      },
      {
        title: isAr ? 'مغادرة ميناء المغادرة (شنغهاي)' : 'Vessel Departed Origin Port',
        location: 'Port of Shanghai (CNSHA)',
        time: '04 Aug, 14:00',
        completed: true,
      },
      {
        title: isAr ? 'العبور بالقرب من مضيق باب المندب' : 'In Transit (Bab-el-Mandeb Route)',
        location: 'Red Sea Maritime Corridor',
        time: '08 Aug, 21:45',
        completed: true,
        current: true,
      },
      {
        title: isAr ? 'الوصول المتوقع لميناء جدة والفسح' : 'Port Arrival & FASAH Clearance',
        location: 'Jeddah Islamic Port (SAJED)',
        time: '14 Aug, 16:30 (ETA)',
        completed: false,
      },
    ],
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTrackShipment && inputVal.trim()) {
      onTrackShipment(inputVal.trim());
    } else if (onNavigate) {
      onNavigate('tracking');
    }
  };

  const sampleNumbers = [
    'AJA-892410-SA',
    'BOL-99214-JED',
    'AWB-77123-RUH',
  ];

  return (
    <section id="tracking" className="py-20 bg-slate-950 relative overflow-hidden border-t border-slate-800">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" />
            <span>{isAr ? 'منظومة التتبع المباشر' : 'LIVE TRACKING & TELEMETRY'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isAr ? 'تتبع شحناتك وحاوياتك في الوقت الفعلي' : 'Real-Time Cargo & Container Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'أدخل رقم بوليصة الشحن الجوي، رقم الحاوية، أو رقم الشحنة لمتابعة حركة بضائعك خطوة بخطوة.'
              : 'Enter Bill of Lading, Container ID, or Airway Bill for instant GPS updates.'}
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setActiveTab('container')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'container'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Ship className="w-3.5 h-3.5" />
              <span>{isAr ? 'رقم الحاوية / البوليصة' : 'Container / B/L'}</span>
            </button>
            <button
              onClick={() => setActiveTab('airway')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'airway'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>{isAr ? 'بوليصة جوية (AWB)' : 'Air Waybill (AWB)'}</span>
            </button>
            <button
              onClick={() => setActiveTab('road')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'road'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{isAr ? 'شحنة برية / طرد' : 'Land Transport ID'}</span>
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rtl:right-4 rtl:left-auto" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isAr
                    ? 'مثال: AJA-892410-SA أو Container ID...'
                    : 'Enter ID e.g. AJA-892410-SA...'
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rtl:pr-12 rtl:pl-4 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0"
            >
              <span>{isAr ? 'تتبع الآن' : 'Track Cargo'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Numbers */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
            <span>{isAr ? 'أرقام شحنات تجريبية:' : 'Try sample numbers:'}</span>
            {sampleNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setInputVal(num)}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 font-mono text-[11px]"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Snippet */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 max-w-4xl mx-auto shadow-2xl">
          {/* Top Bar Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">ID:</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {demoResult.trackingNo}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  {demoResult.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>{demoResult.carrier}</span>
                <span>•</span>
                <span>{demoResult.vessel}</span>
              </div>
            </div>

            <div className="text-start sm:text-end">
              <div className="text-[11px] text-slate-400">{isAr ? 'الوصول المتوقع (ETA)' : 'Estimated Arrival'}</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 sm:justify-end">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{demoResult.eta}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Route */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{demoResult.origin}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{demoResult.destination}</span>
              </div>
            </div>

            {/* Custom Bar */}
            <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 transition-all duration-500"
                style={{ width: `${demoResult.progress}%` }}
              />
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {demoResult.milestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border space-y-1.5 ${
                  m.current
                    ? 'bg-cyan-950/40 border-cyan-500/50'
                    : m.completed
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      m.completed ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400">{m.time}</span>
                </div>
                <div className="text-xs font-semibold text-white leading-tight">
                  {m.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{m.location}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate?.('tracking')}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>{isAr ? 'فتح الخريطة التفاعلية وتفاصيل المستندات' : 'Open Detailed Telemetry Map'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
