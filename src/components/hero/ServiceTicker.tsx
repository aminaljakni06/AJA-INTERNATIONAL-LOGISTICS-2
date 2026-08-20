import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export const ServiceTicker: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const tickerItems = isAr
    ? [
        'الشحن الجوي',
        'الشحن البحري',
        'النقل البري',
        'التخزين والمستودعات',
        'إدارة الطلبات والتنفيذ',
        'التخليص الجمركي',
        'التسليم للميل الأخير',
        'التتبع والمتابعة الحية',
        'اللوجستيات العكسية',
      ]
    : [
        'AIR FREIGHT',
        'OCEAN FREIGHT',
        'ROAD FREIGHT',
        'WAREHOUSING',
        'FULFILLMENT',
        'CUSTOMS CLEARANCE',
        'LAST-MILE DELIVERY',
        'TRACK & TRACE',
        'REVERSE LOGISTICS',
      ];

  // Repeat twice for seamless infinite loop
  const repeatedItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="relative w-full py-4 bg-[#082F49] border-y border-[#0B3D5C] overflow-hidden z-20">
      {/* Edge Gradient Masks for Soft Fade */}
      <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#082F49] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#082F49] to-transparent z-10 pointer-events-none" />

      {/* Infinite Moving Track */}
      <div className="flex w-max animate-ticker">
        {repeatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-6 px-6 shrink-0 font-inter text-xs font-bold tracking-[0.15em] text-white uppercase hover:text-[#EA580C] transition-colors"
          >
            <span>{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTicker;
