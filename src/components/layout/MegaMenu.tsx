import React from 'react';
import { 
  Plane, 
  Ship, 
  Truck, 
  Boxes, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  HelpCircle, 
  Globe2, 
  FileText
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface MegaMenuProps {
  onNavigate: (tab: string) => void;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onNavigate, onClose }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const handleClick = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 z-50 animate-fadeIn">
      <div className="bg-[#0B172A] border border-[#0EA5E9]/30 text-white rounded-3xl shadow-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 backdrop-blur-2xl">
        
        {/* Col 1: Primary Services */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#00F0FF] font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Ship className="w-4 h-4" />
            <span>{isAr ? 'الخدمات اللوجستية الرئيسية' : 'Core Freight Services'}</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleClick('air-freight')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-[#00F0FF] group-hover:bg-[#00F0FF] group-hover:text-[#030712] transition-colors">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-[#00F0FF]">
                  {isAr ? 'الشحن الجوي السريع' : 'Air Cargo Express'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'طائرات خاصة وشحن مباشر لكل الموانئ' : 'Door-to-door global charter & express flights'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleClick('sea-freight')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-[#00F0FF] group-hover:bg-[#00F0FF] group-hover:text-[#030712] transition-colors">
                <Ship className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-[#00F0FF]">
                  {isAr ? 'الشحن البحري والجاف' : 'Ocean Container Freight'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'حاويات كلي FCL وشحن جزئي LCL' : 'FCL, LCL & consolidated liner shipping'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleClick('land-transport')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-[#030712] transition-colors">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                  {isAr ? 'النقل البري والأسطول' : 'Road Fleet & Trucking'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'شاحنات مبردة وعابرة للحدود' : 'Cross-border refrigerated & heavy cargo'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Col 2: Storage & Customs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Boxes className="w-4 h-4" />
            <span>{isAr ? 'التخزين والتخليص' : '3PL & Customs'}</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleClick('warehousing')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-amber-400 group-hover:bg-amber-400 group-hover:text-[#030712] transition-colors">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-amber-400">
                  {isAr ? 'المستودعات والربط الآلي' : 'Smart Warehousing'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'مستودعات مبردة وحرة وإدارة مخزون' : 'Temperature zoned hubs & WMS control'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleClick('customs')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-sky-400 group-hover:bg-sky-400 group-hover:text-[#030712] transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-sky-400">
                  {isAr ? 'التخليص الجمركي' : 'Customs Brokerage'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'فسح جمركي فوري عبر منصة فسح' : 'Fast-track ZATCA clearance across all ports'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleClick('supply-chain-visibility')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-purple-400 group-hover:bg-purple-400 group-hover:text-[#030712] transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-purple-400">
                  {isAr ? 'سلاسل الإمداد المتكاملة' : 'Supply Chain Visibility'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'تتبع فوري مع تحليلات الذكاء الاصطناعي' : 'End-to-end IoT tracking & ETA models'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Col 3: Industries & Network */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'القطاعات والشبكة' : 'Industries & Network'}</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleClick('industries')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-[#030712] transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                  {isAr ? 'الحلول المتخصصة حسب القطاع' : 'Industry Solutions'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'قطاع الطاقة، الأدوية، التجزئة والسيارات' : 'Pharma cold-chain, Oil & Gas, Automotive'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleClick('global-network')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-[#030712] transition-colors">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-cyan-400">
                  {isAr ? 'الشبكة العالمية والمكاتب' : 'Global Hubs & Network'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'تغطية أكثر من 180 دولة مع خطوط مباشرة' : '180+ global trade lanes & office hubs'}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleClick('contact')}
              className="w-full text-start p-2.5 rounded-xl hover:bg-white/5 flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-white/5 text-[#00F0FF] group-hover:bg-[#00F0FF] group-hover:text-[#030712] transition-colors">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-[#00F0FF]">
                  {isAr ? 'الدعم والاستشارات اللوجستية' : '24/7 Logistics Desk'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'فريق مستشاري الشحن متواجد لخدمتك' : 'Direct expert support & route planning'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Col 4: Featured Card */}
        <div className="bg-[#030712] border border-[#00F0FF]/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 mb-3">
              <Sparkles className="w-3 h-3" />
              {isAr ? 'عروض الشحن لعام 2026' : 'Featured Route'}
            </span>
            <h4 className="text-sm font-extrabold text-white mb-2">
              {isAr ? 'خطوط الشحن السريعة بين الخليج وأوروبا' : 'GULF - EUROPE EXPRESS LINE'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {isAr
                ? 'أسعار تنافسية خاصة للشحن البحري والجوي المنتظم مع خيارات تخليص فوري في الموانئ الرئيسية.'
                : 'Discounted contract rates for air & sea freight with guaranteed transit times.'}
            </p>
          </div>

          <button
            onClick={() => handleClick('quote-request')}
            className="w-full py-2.5 px-4 bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAr ? 'احسب سعر الشحنة الآن' : 'Get Express Quote'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

      </div>
    </div>
  );
};
