import React from 'react';
import {
  Cpu,
  Monitor,
  Code2,
  Bell,
  BarChart3,
  KeyRound,
  Check,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Server
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DigitalPlatformSectionProps {
  onNavigate?: (tab: string) => void;
}

export const DigitalPlatformSection: React.FC<DigitalPlatformSectionProps> = ({
  onNavigate,
}) => {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: Monitor,
      title: isAr ? 'لوحة تحكم برج المراقبة Central Control Tower' : 'Central Logistics Control Tower',
      desc: isAr
        ? 'منصة برمجية موحدة تمنح مدراء سلاسل الإمداد رؤية شاملة لكافة الحاويات، المسارات البرية، والتكاليف.'
        : 'Single pane of glass providing supply chain managers full visibility over containers, fleets, and cost telemetry.',
    },
    {
      icon: Code2,
      title: isAr ? 'بوابة المطورين والربط المباشر API Gateway' : 'Enterprise REST & Webhook APIs',
      desc: isAr
        ? 'ربط تلقائي مع أنظمة SAP, Oracle, Microsoft Dynamics لإصدار أوامر الشحن وتلقي تحديثات التتبع لحظياً.'
        : 'Seamless REST APIs and webhooks for automated order dispatching, status updates, and electronic invoicing.',
    },
    {
      icon: Bell,
      title: isAr ? 'تنبيهات وتكهنات الذكاء الاصطناعي AI Alerts' : 'Predictive Exception & Delay Alerts',
      desc: isAr
        ? 'خوارزميات تنبؤية تحذر من التأخيرات البحرية أو الاختناقات الجمركية وتوفر بدائل توجيهية تلقائية.'
        : 'Predictive ETA analytics flagging port congestion, weather hazards, and route optimizations before delays happen.',
    },
    {
      icon: KeyRound,
      title: isAr ? 'صلاحيات متعددة وإدارة المؤسسات Multi-Tenant' : 'Enterprise Access & Security Rules',
      desc: isAr
        ? 'إدارة صلاحيات الوصول بحسب الفروع، الموردين، والمشروعات مع حماية البيانات طبقاً لمعايير ISO 27001.'
        : 'Role-based access control (RBAC), multi-subsidiary management, and ISO 27001 data security compliance.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>{isAr ? 'المنصة الرقمية الموحدة' : 'ENTERPRISE DIGITAL PLATFORM'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isAr ? 'إدارة لوجستية ذكية مدعومة بالتقنيات الحديثة' : 'Next-Generation Supply Chain Operating System'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'احصل على التحكم الكامل بشحناتك ومستودعاتك عبر واجهات برمجة حديثة ولوحات متابعة فورية.'
              : 'Empower your enterprise with real-time tracking, automated ERP syncing, and AI logistics insights.'}
          </p>
        </div>

        {/* Dashboard Preview Graphic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
                  >
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate?.('login')}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                <span>{isAr ? 'تجربة المنصة الرقمية' : 'Access Enterprise Portal'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate?.('download-app')}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'تحميل تطبيق الهاتف' : 'Download Mobile App'}</span>
              </button>
            </div>
          </div>

          {/* Interactive UI Mockup */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">
                  aja-control-tower.app
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                API LIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400">Active Shipments</div>
                  <div className="text-lg font-bold text-white">1,482 TEU</div>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                  +12.4%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400">Customs FASAH Direct API</div>
                  <div className="text-xs font-bold text-emerald-400">99.9% Auto Cleared</div>
                </div>
                <Server className="w-5 h-5 text-slate-500" />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400">ERP Sync Log</div>
                <div className="text-xs font-mono text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-cyan-400">POST /api/v1/shipments</span>
                    <span className="text-emerald-400">200 OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">GET /api/v1/telemetry/AJA-89</span>
                    <span className="text-emerald-400">200 OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
