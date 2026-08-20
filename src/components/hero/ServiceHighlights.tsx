import React from 'react';
import { Plane, Ship, Truck, Warehouse, FileCheck, PackageCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const ServiceHighlights: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const services = [
    { icon: Plane, labelEn: 'Air Freight', labelAr: 'الشحن الجوي' },
    { icon: Ship, labelEn: 'Ocean Freight', labelAr: 'الشحن البحري' },
    { icon: Truck, labelEn: 'Road Transport', labelAr: 'النقل البري' },
    { icon: Warehouse, labelEn: 'Warehousing', labelAr: 'المستودعات' },
    { icon: FileCheck, labelEn: 'Customs', labelAr: 'التخليص الجمركي' },
    { icon: PackageCheck, labelEn: 'Last Mile', labelAr: 'الميل الأخير' },
  ];

  return (
    <div className="pt-6 border-t border-white/10 max-w-[620px]">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0B172A]/80 hover:bg-[#0EA5E9]/20 border border-[#1E293B] hover:border-[#0EA5E9] transition-all duration-300 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#00F0FF] text-[#00F0FF] group-hover:text-[#030712] flex items-center justify-center mb-1.5 transition-colors">
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[11px] font-inter font-bold text-slate-200 group-hover:text-white transition-colors text-center truncate w-full">
                {isAr ? item.labelAr : item.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceHighlights;
