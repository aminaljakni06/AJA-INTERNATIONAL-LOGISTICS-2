import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Network,
  Truck,
  Plane,
  Ship,
  Building,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface GlobalLogisticsSolutionsSectionProps {
  onNavigate?: (tab: string) => void;
}

export const GlobalLogisticsSolutionsSection: React.FC<GlobalLogisticsSolutionsSectionProps> = ({
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [activeSolution, setActiveSolution] = useState<number>(0);

  const solutions = [
    {
      id: 'end-to-end',
      title: isAr ? 'حلول إمداد متكاملة من الباب للباب' : 'Door-to-Door End-to-End Solutions',
      subtitle: isAr ? 'إدارة الدورة الكاملة للشحنة من المصنع للمستلم النهائي' : 'Complete cargo lifecycle management from origin factory to destination site.',
      desc: isAr
        ? 'نغطي كافة مراحل سلسلة الإمداد بما في ذلك الاستلام من المصنع، الشحن البحري أو الجوي، التخليص الجمركي في الموانئ، التخزين المؤقت، والتسليم النهائي.'
        : 'Comprehensive handling including factory pickup, international transport, customs clearance, hub warehousing, and final last-mile delivery.',
      icon: Network,
      features: [
        isAr ? 'مدير حساب موحد ومستشار لوجستي مخصص' : 'Single point of contact & dedicated account manager',
        isAr ? 'عقد موحد وشروط شحن إنكوتيرمز (Incoterms 2020)' : 'Unified contract & Incoterms 2020 compliance',
        isAr ? 'شفافية كاملة في تكاليف الشحن والرسوم الجمركية' : 'Transparent landed cost forecasting & reporting',
      ],
      stats: [
        { label: isAr ? 'توفير التكاليف التشغيلية' : 'Cost Reduction', value: '18%' },
        { label: isAr ? 'دقة التسليم في الموعد' : 'On-Time SLA', value: '99.4%' },
      ],
    },
    {
      id: 'multimodal',
      title: isAr ? 'الشحن متعدد الوسائط (بحر - بر - جو)' : 'Multimodal Freight Optimization',
      subtitle: isAr ? 'دمج وسائط النقل المختلفة لتحقيق الموازنة المثالية بين السرعة والتكلفة' : 'Combining ocean, air, and road routes for optimal speed and cost efficiency.',
      desc: isAr
        ? 'نحل معضلة المهل الزمنية والتكاليف عبر الربط بين الشحن البحري الحاوي للشحنات الكبيرة مع الربط الجوي أو البري السريع للتوزيع الإقليمي.'
        : 'Optimize transit times and freight budgets by combining sea freight with air charters or fast-track GCC truck transport.',
      icon: Layers,
      features: [
        isAr ? 'مرونة عالية في توجيه البضائع عند التكدسات' : 'Route re-routing during port congestion events',
        isAr ? 'بوليصة شحن واحدة متعددة الوسائط (MTBL)' : 'Single Multimodal Transport Bill of Lading (MTBL)',
        isAr ? 'تنسيق محطات الترانزيت والموانئ الجافة' : 'Seamless dry port & transit hub coordination',
      ],
      stats: [
        { label: isAr ? 'تسريع زمن الترانزيت' : 'Transit Time Cut', value: '35%' },
        { label: isAr ? 'تغطية شبكات إقليمية' : 'Regional Reach', value: 'GCC+' },
      ],
    },
    {
      id: 'cross-border',
      title: isAr ? 'النقل العابر للحدود الخليجية والشرق الأوسط' : 'Cross-Border GCC Logistics',
      subtitle: isAr ? 'شحن بري سريع مع تسريع المعاملات الجمركية البينية' : 'Fast-track overland trucking connecting KSA with UAE, Kuwait, Oman, Qatar, Bahrain.',
      desc: isAr
        ? 'نربط مدن ومحافظات المملكة بالأسواق الخليجية مع إدارة متخصصة للبيانات الجمركية وحوافل النقل المؤمنة بسلامة عالية.'
        : 'Direct road corridors linking Saudi hubs with UAE, Bahrain, Kuwait, Oman, and Jordan with specialized border post dispatchers.',
      icon: Truck,
      features: [
        isAr ? 'تفريغ وتحميل سريع في المنافذ الحدودية' : 'Priority border clearance at Batha, Khafji, King Fahd Causeway',
        isAr ? 'مستندات مقاصة جمركية بينية معتمدة' : 'GCC unified customs duty clearing & transit bonds',
        isAr ? 'أسطول شاحنات مغلقة ومبردة بـ GPS' : 'GPS tracked closed and temperature-controlled trailers',
      ],
      stats: [
        { label: isAr ? 'رحلات أسبوعية للخليج' : 'Weekly Trips', value: '250+' },
        { label: isAr ? 'معدل الفسح الحدودي' : 'Border Clearance', value: '< 6h' },
      ],
    },
  ];

  const current = solutions[activeSolution];
  const CurrentIcon = current.icon;

  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
            {isAr ? 'حلول سلاسل الإمداد المخصصة' : 'INTEGRATED SUPPLY CHAIN SOLUTIONS'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isAr ? 'حلول لوجستية عالمية مصممة لننمو مع أعمالك' : 'Global Solutions Built for Scale & Reliability'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'اختر النموذج اللوجستي المناسب لمتطلبات بضائعك واعتمد على خبراتنا الميدانية الممتدة.'
              : 'Tailor your transport model to balance inventory velocity, security, and cost efficiency.'}
          </p>
        </div>

        {/* Interactive Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {solutions.map((sol, index) => {
            const Icon = sol.icon;
            const isSelected = index === activeSolution;
            return (
              <button
                key={sol.id}
                onClick={() => setActiveSolution(index)}
                className={`p-6 rounded-2xl text-start transition-all duration-300 border flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-xl shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-xl w-fit ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-cyan-400 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{sol.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{sol.subtitle}</p>
                </div>

                <div className="flex items-center text-xs font-medium text-cyan-400 gap-1 pt-2">
                  <span>{isAr ? 'استكشف المزايا' : 'Explore Solution'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Solution Expanded View */}
        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <CurrentIcon className="w-3.5 h-3.5" />
              <span>{current.title}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {current.subtitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {current.desc}
            </p>

            <div className="space-y-2.5 pt-2">
              {current.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('quote-request')}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                <span>{isAr ? 'اطلب استشارة وتصميم مسار' : 'Design Custom Route'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {current.stats.map((st, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2"
              >
                <div className="text-3xl font-black text-cyan-400">{st.value}</div>
                <div className="text-xs text-slate-300 font-medium">{st.label}</div>
              </div>
            ))}
            <div className="col-span-2 p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-900/40 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>{isAr ? 'تحديثات ومسارات بضائع مرنة' : 'Dynamic Route Re-Routing'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {isAr
                  ? 'أنظمتنا تحلل أحوال الطقس والازدحام الملاحي لإعادة توجيه البضائع تلقائياً.'
                  : 'Automated AI routing recalculates transit corridors during port congestion.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
