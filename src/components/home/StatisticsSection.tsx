import React from 'react';
import { ShieldCheck, Globe, Truck, Users, Award, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const StatisticsSection: React.FC = () => {
  const { isAr } = useLanguage();

  const stats = [
    {
      value: '150,000+',
      label: isAr ? 'حاوية وشحنة منجزة' : 'Delivered Cargo Units',
      desc: isAr ? 'شحن بحري، جوي، وبري ناجح' : 'Successful shipments across all corridors',
      icon: ShieldCheck,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      value: '45+',
      label: isAr ? 'دولة وميناء رئيسي' : 'Global Port Connections',
      desc: isAr ? 'شبكة وكلاء وخطوط ملاحية عالمية' : 'International network & shipping lines',
      icon: Globe,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    },
    {
      value: '1,200+',
      label: isAr ? 'شاحنة ومعدة نقل حديثة' : 'Fleet & Heavy Equipment Units',
      desc: isAr ? 'أسطول مجهز بـ GPS ومستشعرات حرارة' : 'GPS & thermally monitored trucks',
      icon: Truck,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      value: '99.8%',
      label: isAr ? 'نسبة الالتزام بالمواعيد' : 'On-Time SLA Delivery',
      desc: isAr ? 'التزام تام بالجداول الزمانية والمستندات' : 'Strict SLA adherence for timeline',
      icon: TrendingUp,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
  ];

  return (
    <section className="py-16 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-cyan-950/20 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            {isAr ? 'أرقام وإنجازات مؤسسية' : 'PERFORMANCE AT A GLANCE'}
          </p>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            {isAr ? 'أرقام تعكس ريادتنا في سوق اللوجستيات' : 'Proven Track Record of Excellence'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 text-center space-y-4 group"
              >
                <div className={`p-3.5 rounded-2xl border w-fit mx-auto ${st.color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                    {st.value}
                  </div>
                  <div className="text-sm font-bold text-slate-200">{st.label}</div>
                  <div className="text-xs text-slate-400">{st.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
