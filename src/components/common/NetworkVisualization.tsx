import React from 'react';
import { Anchor, Truck, Building2, Globe2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface NetworkHubItem {
  id: string;
  title: string;
  description: string;
  icon: 'port' | 'land' | 'hub' | 'global';
  color: 'amber' | 'blue' | 'emerald' | 'purple';
}

export interface NetworkVisualizationProps {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  id,
  title,
  subtitle,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultHubs: NetworkHubItem[] = [
    {
      id: 'ports',
      title: isAr ? 'الموانئ البحرية' : 'Sea Ports',
      description: isAr ? 'ميناء جدة الإسلامي، ميناء الملك عبد العزيز بالدمام، وميناء الجبيل التجاري.' : 'Jeddah Islamic Port, King Abdulaziz Port Dammam, Jubail Port.',
      icon: 'port',
      color: 'amber'
    },
    {
      id: 'land',
      title: isAr ? 'المنافذ البرية' : 'Land Borders',
      description: isAr ? 'منفذ البطحاء (الإمارات)، منفذ الخفجي (الكويت)، ومنفذ سلوى (قطر).' : 'Batha (UAE), Khafji (Kuwait), Salwa (Qatar), Al-Haditha (Jordan).',
      icon: 'land',
      color: 'blue'
    },
    {
      id: 'hubs',
      title: isAr ? 'المراكز والمستودعات' : 'Logistics Hubs',
      description: isAr ? 'مراكز تخزين وتوزيع رئيسية في الرياض، جدة، الدمام، والمدن الصناعية.' : 'Main distribution hubs in Riyadh, Jeddah, Dammam, and industrial zones.',
      icon: 'hub',
      color: 'emerald'
    },
    {
      id: 'global',
      title: isAr ? 'الربط العالمي' : 'Global Reach',
      description: isAr ? 'شراكات استراتيجية مع وكلاء الشحن في الصين، أوروبا، وأمريكا الشمالية.' : 'Strategic global agency networks across China, Europe, and North America.',
      icon: 'global',
      color: 'purple'
    }
  ];

  return (
    <section id={id} className={`bg-[#082F49] text-white py-14 border-y border-[#0F4C75] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 text-xs font-bold">
            {isAr ? 'تغطية شاملة ومنافذ معتمدة' : 'Wide Network & Authorized Hubs'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {title || (isAr ? 'تغطية شبكتنا الميدانية واللوجستية' : 'Our Network & Regional Coverage')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            {subtitle || (isAr ? 'نغطي كافة المنافذ والموانئ الرئيسية في المملكة العربية السعودية والخليج العربي والعالم.' : 'Covering all major ports and borders across Saudi Arabia, the GCC, and worldwide.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {defaultHubs.map((hub) => {
            return (
              <div key={hub.id} className="p-6 bg-[#0B172A]/90 rounded-2xl border border-[#1E293B] hover:border-[#0EA5E9] transition-all shadow-lg hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3.5 ${
                  hub.color === 'amber' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' :
                  hub.color === 'blue' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' :
                  hub.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                  'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                }`}>
                  {hub.icon === 'port' && <Anchor className="w-5 h-5" />}
                  {hub.icon === 'land' && <Truck className="w-5 h-5" />}
                  {hub.icon === 'hub' && <Building2 className="w-5 h-5" />}
                  {hub.icon === 'global' && <Globe2 className="w-5 h-5" />}
                </div>
                <h4 className="font-bold text-[#00F0FF] text-sm mb-1.5">{hub.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{hub.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
