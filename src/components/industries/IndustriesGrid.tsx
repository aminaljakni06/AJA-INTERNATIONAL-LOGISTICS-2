import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Store, 
  Factory, 
  Car, 
  Stethoscope, 
  Cpu, 
  UtensilsCrossed, 
  HardHat, 
  Zap, 
  Globe2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  X,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { INDUSTRIES_DATA, IndustryItem } from '../../data/industriesData';

interface IndustriesGridProps {
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const IndustriesGrid: React.FC<IndustriesGridProps> = ({ 
  onNavigate, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedIndustry, setSelectedIndustry] = useState<IndustryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Map icon name to Lucide Component
  const renderIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'Store': return <Store className={className} />;
      case 'Factory': return <Factory className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Stethoscope': return <Stethoscope className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'UtensilsCrossed': return <UtensilsCrossed className={className} />;
      case 'HardHat': return <HardHat className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Globe2': return <Globe2 className={className} />;
      default: return <Factory className={className} />;
    }
  };

  const filteredIndustries = INDUSTRIES_DATA.filter((item) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'COMMERCIAL' && ['e-commerce', 'retail', 'food-beverage', 'trade'].includes(item.id)) return true;
    if (activeCategory === 'INDUSTRIAL' && ['manufacturing', 'automotive', 'construction', 'energy'].includes(item.id)) return true;
    if (activeCategory === 'HIGH_TECH' && ['technology', 'healthcare'].includes(item.id)) return true;
    return true;
  });

  return (
    <div className={`space-y-10 ${className}`}>
      
      {/* Category Tabs Header */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {[
          { id: 'ALL', ar: 'جميع القطاعات (10)', en: 'All 10 Sectors' },
          { id: 'COMMERCIAL', ar: 'التجارة والتجزئة والربط', en: 'Commercial & Retail' },
          { id: 'INDUSTRIAL', ar: 'الصناعة والطاقة والإنشاءات', en: 'Industrial & Energy' },
          { id: 'HIGH_TECH', ar: 'التكنولوجيا والرعاية الصحية', en: 'Tech & Healthcare' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#0F4C75] text-white shadow-lg scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            {isAr ? cat.ar : cat.en}
          </button>
        ))}
      </div>

      {/* 10 Industries Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIndustries.map((ind) => (
          <div
            key={ind.id}
            className="group relative bg-[#082F49] border border-[#0F4C75] hover:border-[#0F4C75] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer"
            onClick={() => setSelectedIndustry(ind)}
          >
            {/* Top Hover Gradient Light Glow */}
            <div 
              className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: ind.glowColor }}
            />

            <div className="space-y-5 relative z-10">
              
              {/* Card Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-[#0F4C75] text-white border border-[#0F4C75] group-hover:scale-110 transition-transform duration-300`}>
                  {renderIcon(ind.iconName, "w-6 h-6")}
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-[#0F4C75] text-white border border-[#0F4C75]`}>
                  {isAr ? ind.badgeAr : ind.badgeEn}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white group-hover:text-slate-200 transition-colors">
                  {isAr ? ind.titleAr : ind.titleEn}
                </h3>
                <p className="text-xs font-semibold text-slate-300">
                  {isAr ? ind.subtitleAr : ind.subtitleEn}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {isAr ? ind.descriptionAr : ind.descriptionEn}
              </p>

              {/* Highlight Metric */}
              <div className="pt-2 flex items-center gap-3 border-t border-[#0F4C75]">
                <div className="text-base font-black text-white font-mono">
                  {ind.metricsValue}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {isAr ? ind.metricsLabelAr : ind.metricsLabelEn}
                </div>
              </div>

            </div>

            {/* Bottom Card Action Footer */}
            <div className="pt-4 mt-5 border-t border-[#0F4C75] flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1.5 transition-colors">
                <span>{isAr ? 'استعراض حلول القطاع' : 'Explore Sector Specs'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 opacity-80" />
            </div>

          </div>
        ))}
      </div>

      {/* Selected Industry Detail Modal / Slide-over */}
      {selectedIndustry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#082F49] border border-[#0F4C75] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedIndustry(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0F4C75] text-white border border-[#0F4C75]`}>
                {renderIcon(selectedIndustry.iconName, "w-7 h-7")}
              </div>
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0F4C75] text-white border border-[#0F4C75]`}>
                  {isAr ? selectedIndustry.badgeAr : selectedIndustry.badgeEn}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {isAr ? selectedIndustry.titleAr : selectedIndustry.titleEn}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-b border-[#0F4C75] pb-4">
              {isAr ? selectedIndustry.descriptionAr : selectedIndustry.descriptionEn}
            </p>

            {/* Features List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'المزايا اللوجستية المتخصصة للقطاع:' : 'Specialized Sector Capabilities:'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedIndustry.features.map((feat, idx) => (
                  <div key={idx} className="p-3 bg-[#082F49] rounded-2xl border border-[#0F4C75] space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{isAr ? feat.titleAr : feat.titleEn}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {isAr ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications & Compliance Badges */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-400">{isAr ? 'الاعتماد والمعايير التنظيمية:' : 'Certifications & Compliance:'}</div>
              <div className="flex flex-wrap gap-2">
                {(isAr ? selectedIndustry.certificationsAr : selectedIndustry.certificationsEn).map((cert, cIdx) => (
                  <span key={cIdx} className="px-3 py-1 rounded-xl bg-[#0F4C75] border border-[#0F4C75] text-white text-xs font-semibold">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#0F4C75] flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSelectedIndustry(null);
                  onNavigate?.('quote-request');
                }}
                className="flex-1 px-6 py-3 rounded-2xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg border border-[#0F4C75]"
              >
                <span>{isAr ? 'طلب عرض سعر لهذا القطاع' : 'Request Industry Quote'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => setSelectedIndustry(null)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
