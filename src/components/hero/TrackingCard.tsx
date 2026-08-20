import React from 'react';
import { Navigation, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const TrackingCard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="glass-panel glass-panel-glow p-4 rounded-2xl w-[230px] text-left rtl:text-right space-y-3 shadow-2xl border border-[#4DE7FF]/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#4DE7FF]" />
          <span className="font-mono text-[10px] font-bold text-[#AAB6C8] uppercase tracking-wider">
            {isAr ? 'عينة التتبع' : 'TRACKING DEMO'}
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-[#4DE7FF]/15 text-[#4DE7FF] px-1.5 py-0.5 rounded">
          {isAr ? 'حي 3D' : 'LIVE 3D'}
        </span>
      </div>

      {/* Shipment Identifier */}
      <div>
        <span className="text-[10px] text-[#AAB6C8] block font-mono">{isAr ? 'رقم الشحنة' : 'Shipment ID'}</span>
        <span className="text-xs font-mono font-bold text-white tracking-wide">
          #AJA-20481
        </span>
      </div>

      {/* Route Stops */}
      <div className="space-y-1.5 font-mono text-[11px] text-slate-200 pl-1 rtl:pl-0 rtl:pr-1 border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#4DA3FF]/40 ml-1 rtl:ml-0 rtl:mr-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">{isAr ? 'دبي' : 'Dubai'}</span>
          <span className="text-[9px] text-[#4DE7FF]">{isAr ? 'المصدر' : 'Origin'}</span>
        </div>

        <div className="flex items-center gap-1 text-[#4DE7FF]">
          <ArrowDown className="w-3 h-3 animate-bounce" />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#4DE7FF]">{isAr ? 'الرياض' : 'Riyadh'}</span>
          <span className="text-[9px] text-amber-400">{isAr ? 'مركز العمليات' : 'Hub'}</span>
        </div>

        <div className="flex items-center gap-1 text-[#4DE7FF]">
          <ArrowDown className="w-3 h-3 animate-bounce" />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-white/70">{isAr ? 'جدة' : 'Jeddah'}</span>
          <span className="text-[9px] text-[#AAB6C8]">{isAr ? 'الوجهة' : 'Dest'}</span>
        </div>
      </div>

      {/* Status Pill */}
      <div className="pt-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#4DE7FF]/15 border border-[#4DE7FF]/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4DE7FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4DA3FF]" />
          </span>
          <span className="text-[10px] font-bold text-[#4DE7FF]">{isAr ? 'في الطريق' : 'In Transit'}</span>
        </div>
        <span className="text-[9px] text-[#AAB6C8] italic">{isAr ? 'تتبع مباشر' : 'Visual Demo'}</span>
      </div>
    </div>
  );
};

export default TrackingCard;
