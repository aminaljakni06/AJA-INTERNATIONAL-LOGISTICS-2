import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Table,
  Layers,
  Smartphone,
  Eye,
  Sliders,
  Download,
  FileCode,
  Sparkles,
  Zap
} from 'lucide-react';

export interface EnterpriseTableSystemCertificationProps {
  isAr?: boolean;
}

export const EnterpriseTableSystemCertification: React.FC<EnterpriseTableSystemCertificationProps> = ({
  isAr = false,
}) => {
  const auditMilestones = [
    {
      id: 'm1',
      titleEn: 'Table Foundation & Grid Architecture',
      titleAr: 'هيكلية شبكة وقواعد الأساس للجدول',
      descEn: 'Standardized design tokens, density controls (comfortable, default, compact), sticky headers, and sticky actions column.',
      descAr: 'رموز تصميم موحدة، ومستويات كثافة (مريح، افتراضي، مدمج)، وعناوين وأعمدة ثابتة.',
      status: 'certified',
    },
    {
      id: 'm2',
      titleEn: 'Enterprise Search & Real-time Filtering',
      titleAr: 'البحث المتقدم والتصفية الفورية',
      descEn: 'Live debounce search, multi-faceted filter drawer, active filter pills, and saved view presets.',
      descAr: 'بحث فوري، ودرج تصفية متعدد الأوجه، وشارات تصفية نشطة، وحفظ العروض المفضلة.',
      status: 'certified',
    },
    {
      id: 'm3',
      titleEn: 'Bulk Operations & Contextual Actions',
      titleAr: 'العمليات الجماعية والإجراءات السياقية',
      descEn: 'Floating multi-selection bar, batch status updates, mass export trigger, and destructive action safeguards.',
      descAr: 'شريط التحديد المتعدد العائم، وتحديثات الحالة الجماعية، والتصدير المجمع، وإجراءات السلامة.',
      status: 'certified',
    },
    {
      id: 'm4',
      titleEn: 'Pagination & State Management',
      titleAr: 'التنقل وإدارة حالات الجدول',
      descEn: 'Adaptive pagination bar, per-page selector, skeleton loaders, empty state graphics, and error fallback components.',
      descAr: 'شريط تنقل متكيف، ومحدد عدد العناصر، ورسوم تحميل هيكلية، وحالات الفارغ والأخطاء.',
      status: 'certified',
    },
    {
      id: 'm5',
      titleEn: 'Export & Data Exchange Hub',
      titleAr: 'مركز التصدير وتبادل البيانات',
      descEn: 'Multi-format support (.xlsx, .csv, .pdf, .json), email reporting modal, and download center history.',
      descAr: 'دعم تنسيقات متعددة (إكسل، CSV، PDF، JSON)، وإرسال التقرير بالبريد، وسجل التنزيلات.',
      status: 'certified',
    },
    {
      id: 'm6',
      titleEn: 'Responsive & Touch Card Transformation',
      titleAr: 'التجاوب وتجربة بطاقات اللمس',
      descEn: 'Adaptive column priorities (1-4), automatic tablet/mobile card view layout, and 44px touch targets.',
      descAr: 'أولويات الأعمدة المتكيفة (1-4)، والتحول التلقائي للبطاقات في الهواتف، وأهداف لمس 44px.',
    },
  ];

  return (
    <div className="p-6 bg-[#030712] text-white border border-white/10 rounded-3xl space-y-6 shadow-2xl">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                CERTIFIED V1.0
              </span>
              <span className="text-xs text-slate-400 font-mono">AJA LOGISTICS SYSTEM</span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">
              {isAr
                ? 'شهادة اعتماد نظام الجداول المؤسسية الموحدة'
                : 'Enterprise Data Table System Certification'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
          <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          <span>WCAG AA & RTL Certified</span>
        </div>
      </div>

      {/* Audit Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {auditMilestones.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2 hover:border-[#00F0FF]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-wider font-extrabold">
                {item.id.toUpperCase()}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Passed QA</span>
              </span>
            </div>

            <h3 className="text-xs font-bold text-white">
              {isAr ? item.titleAr : item.titleEn}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr ? item.descAr : item.descEn}
            </p>
          </div>
        ))}
      </div>

      {/* System Specifications Footer */}
      <div className="p-4 bg-[#080E1A] border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Framework: <strong className="text-white font-sans">Laravel 12 / Filament v4 / Livewire 3</strong>
          </span>
          <span>
            Styling: <strong className="text-[#00F0FF] font-sans">Tailwind CSS v4 Design Tokens</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold">
          <Zap className="w-4 h-4" />
          <span>Production Ready for All ERP Modules</span>
        </div>
      </div>
    </div>
  );
};
