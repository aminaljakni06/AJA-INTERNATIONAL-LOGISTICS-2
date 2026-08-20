import React from 'react';
import { 
  Globe, 
  Anchor, 
  MapPin, 
  Ship, 
  Plane, 
  Truck, 
  Building, 
  ShieldCheck, 
  ArrowLeft,
  Search,
  Navigation
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../design-system/primitives/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { GlobalInteractiveMap } from '../../components/network/GlobalInteractiveMap';

interface GlobalNetworkPageProps {
  onNavigate?: (tab: string) => void;
}

export const GlobalNetworkPage: React.FC<GlobalNetworkPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const hubs = [
    {
      city: isAr ? 'جدة - ميناء جدة الإسلامي' : 'Jeddah - Jeddah Islamic Port',
      type: isAr ? 'مركز بحري إقليمي رئيسي' : 'Primary Regional Ocean Hub',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      capacity: '3,800,000+ TEU / Year',
      status: 'Active / 24/7 Ops',
    },
    {
      city: isAr ? 'الدمام - ميناء الملك عبد العزيز' : 'Dammam - King Abdulaziz Port',
      type: isAr ? 'بوابة الخليج والشرقية' : 'GCC & Eastern Gateway',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      capacity: '2,900,000+ TEU / Year',
      status: 'Active / 24/7 Ops',
    },
    {
      city: isAr ? 'الرياض - الميناء الجاف والمركز المتقدم' : 'Riyadh - Dry Port & Logistics Hub',
      type: isAr ? 'مركز توزيع وتخزين وتخليص' : 'Central Distribution & Inland Port',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      capacity: '150,000 sqm Warehousing',
      status: 'Active / Fully Integrated',
    },
    {
      city: isAr ? 'دبي - جبل علي' : 'Dubai - Jebel Ali Freezone',
      type: isAr ? 'مركز إعادة التصدير والترانزيت' : 'GCC Transshipment Hub',
      country: isAr ? 'الإمارات العربية المتحدة' : 'United Arab Emirates',
      capacity: 'Transshipment Gateway',
      status: 'Connected Partner Hub',
    },
    {
      city: isAr ? 'شانغهاي - الصين' : 'Shanghai Port',
      type: isAr ? 'الميناء المباشر للتصدير الآسيوي' : 'East Asia Export Terminal',
      country: isAr ? 'الصين' : 'China',
      capacity: 'Global Direct Ocean Feeder',
      status: 'Daily Direct Sailings',
    },
    {
      city: isAr ? 'روتردام - هولندا' : 'Rotterdam Port',
      type: isAr ? 'بوابة أوروبا البحرية' : 'European Gateway Terminal',
      country: isAr ? 'هولندا' : 'Netherlands',
      capacity: 'Europe Trade Corridor',
      status: 'Weekly Scheduled Lines',
    },
  ];

  return (
    <div className="space-y-16 py-12 bg-slate-950 text-white min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[#082F49] text-white py-16 lg:py-20 border-b border-[#0F4C75]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F4C75] text-white text-xs font-bold">
            <Globe className="w-4 h-4 text-[#EA580C]" />
            <span>{isAr ? 'الشبكة العالمية والتغطية اللوجستية' : 'Global Logistics Coverage & Ports'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
            {isAr 
              ? 'شبكة أجا الدولية: نربط الموانئ السعودية بأكثر من 120 دولة حول العالم' 
              : 'Connecting Saudi Ports to Over 120 Global Maritime & Cargo Corridors'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'تغطي أجا الدولية للخدمات اللوجستية الخطوط البحرية والجوية والبرية عبر الموانئ والمنافذ الجمركية الرئيسية في السعودية والخليج وآسيا وإفريقيا وأوروبا والأمريكتين.'
              : 'Our strategic alliances, port agreements, and bonded customs terminals guarantee unbroken visibility for your shipments everywhere.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate?.('quote-request')}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold border-0 cursor-pointer"
            >
              <span>{isAr ? 'حساب تكلفة النقل الدولي' : 'Calculate Freight Cost'}</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate?.('tracking')}
              className="border-slate-600 text-slate-200 hover:bg-white/10"
            >
              <span>{isAr ? 'تتبع خريطة الشحنات الحية' : 'Live Global Tracking'}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Global Network Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <GlobalInteractiveMap onNavigate={onNavigate} />
      </section>

      {/* Primary Strategic Hubs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'الموانئ والمراكز اللوجستية الرئيسية' : 'Primary Ports & Strategic Hubs'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            {isAr 
              ? 'موجودون في جميع الموانئ البحرية، المنافذ الحدودية، والمطارات الدولية بأسطول متكامل ومكاتب تخليص جمركي موثوقة.' 
              : 'Direct physical presence, customs clearing agents, and bonded warehouse yards across primary trade gateways.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub, idx) => (
            <Card
              key={idx}
              className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 border-[#0F4C75] bg-[#082F49] text-white border-t-4 border-t-[#0F4C75]"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0F4C75] text-white flex items-center justify-center font-bold">
                  <Anchor className="w-5 h-5 text-[#EA580C]" />
                </div>
                <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                  {hub.status}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {hub.city}
                </h3>
                <p className="text-xs text-slate-300 font-semibold">{hub.type}</p>
                <p className="text-xs text-slate-400">{hub.country}</p>
              </div>

              <div className="pt-3 border-t border-[#0F4C75] flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] bg-[#0F4C75]/60 border border-[#0F4C75] px-2 py-0.5 rounded text-slate-200">
                  {hub.capacity}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Modal Transport Operations Banner */}
      <section className="bg-[#082F49] text-white py-16 border-y border-[#0F4C75]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-[#0F4C75]/50 rounded-2xl border border-[#0F4C75] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F4C75] text-white mx-auto flex items-center justify-center">
              <Ship className="w-6 h-6 text-[#EA580C]" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'خطوط الشحن البحري' : 'Ocean Freight Corridors'}
            </h3>
            <p className="text-xs text-slate-300">
              {isAr ? 'ربط بحري مباشر بين ميناء جدة والدمام وأكبر الموانئ العالمية (FCL & LCL).' : 'Direct container ocean liners linking Saudi ports to Asia, Europe, and America.'}
            </p>
          </div>

          <div className="p-6 bg-[#0F4C75]/50 rounded-2xl border border-[#0F4C75] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F4C75] text-white mx-auto flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#EA580C]" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'أسطول النقل البري والخليجي' : 'GCC Cross-Border Fleet'}
            </h3>
            <p className="text-xs text-slate-300">
              {isAr ? 'نقل بري مباشر بين مدن المملكة ودول الخليج مع تتبع GPS وتبريد متكامل.' : 'Heavy truck transport covering Saudi Arabia, UAE, Kuwait, Qatar, Oman & Bahrain.'}
            </p>
          </div>

          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'الشحن الجوي السريع' : 'Air Cargo Network'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'رحلات طيران يومية عبر مطارات الرياض، جدة، والدمام للشحنات الحساسة للوقت.' : 'Daily express air cargo flights handling time-critical shipments worldwide.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

