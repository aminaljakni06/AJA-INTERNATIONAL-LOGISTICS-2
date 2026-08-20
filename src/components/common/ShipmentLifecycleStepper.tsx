import React, { useState } from 'react';
import {
  Box,
  Anchor,
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Info,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Building2,
  FileCheck2,
  Navigation
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface MilestoneStage {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  statusKey: string;
  location?: string;
  date?: string;
  completed: boolean;
  current: boolean;
  icon?: any;
  facilityRef?: string;
}

interface ShipmentLifecycleStepperProps {
  shipment: any;
  className?: string;
  compact?: boolean;
}

const DEFAULT_STAGES = [
  {
    id: 'BOOKED',
    order: 1,
    titleAr: 'تم الحجز والتأكيد',
    titleEn: 'Booked & Documented',
    descriptionAr: 'تم إصدار بوليصة الشحن وحجز المساحة لدى الخط الملاحي.',
    descriptionEn: 'Bill of Lading issued and space booked with primary carrier.',
    statusKey: 'BOOKED',
    icon: Box,
  },
  {
    id: 'LOADING',
    order: 2,
    titleAr: 'عقود التحميل والميناء',
    titleEn: 'Port Loading & Staging',
    descriptionAr: 'تم استلام الحاوية بساحة الميناء وإنهاء الفحص الأولي.',
    descriptionEn: 'Container received at port yard and initial safety inspection passed.',
    statusKey: 'LOADING',
    icon: Anchor,
  },
  {
    id: 'IN_TRANSIT',
    order: 3,
    titleAr: 'في الطريق الدولي',
    titleEn: 'In Transit',
    descriptionAr: 'الشحنة في المسار الملاحي/الجوي الدولي باتجاه وجهة الوصول.',
    descriptionEn: 'Shipment actively navigating international sea/air corridor.',
    statusKey: 'IN_TRANSIT',
    icon: Truck,
  },
  {
    id: 'CUSTOMS',
    order: 4,
    titleAr: 'التخليص الجمركي (فسح)',
    titleEn: 'Customs & FASAH',
    descriptionAr: 'تحت المعاينة الجمركية وإصدار بيان الفسح عبر منصة فسح.',
    descriptionEn: 'Under customs inspection and FASAH clearance declaration issuance.',
    statusKey: 'CUSTOMS',
    icon: ShieldCheck,
  },
  {
    id: 'HUB_ARRIVAL',
    order: 5,
    titleAr: 'وصول مستودع الوجهة',
    titleEn: 'Destination Hub Arrival',
    descriptionAr: 'وصلت الشحنة لمركز التوزيع اللوجستي وتفريغ الشحنة.',
    descriptionEn: 'Arrived at central logistics hub for sorting & final dispatch.',
    statusKey: 'HUB_ARRIVAL',
    icon: Building2,
  },
  {
    id: 'DELIVERED',
    order: 6,
    titleAr: 'تم التسليم بالكامل',
    titleEn: 'Delivered',
    descriptionAr: 'تم تسليم الشحنة للمستلم واستلام إشعارات التوقيع الإلكتروني.',
    descriptionEn: 'Cargo delivered to end consignee with electronic proof of delivery.',
    statusKey: 'DELIVERED',
    icon: MapPin,
  },
];

export const ShipmentLifecycleStepper: React.FC<ShipmentLifecycleStepperProps> = ({
  shipment,
  className = '',
  compact = false,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Normalize stages list from shipment.timeline or fallback to DEFAULT_STAGES
  let stages: MilestoneStage[] = [];

  if (shipment?.timeline && Array.isArray(shipment.timeline) && shipment.timeline.length > 0) {
    stages = shipment.timeline.map((stg: any, index: number) => {
      let stageIcon = DEFAULT_STAGES[index % DEFAULT_STAGES.length]?.icon || Box;
      const statusUpper = (stg.status || '').toUpperCase();

      if (statusUpper.includes('BOOK') || statusUpper.includes('CREATE')) stageIcon = Box;
      else if (statusUpper.includes('LOAD') || statusUpper.includes('PORT')) stageIcon = Anchor;
      else if (statusUpper.includes('TRANSIT') || statusUpper.includes('WAY')) stageIcon = Truck;
      else if (statusUpper.includes('CUSTOM') || statusUpper.includes('FASAH')) stageIcon = ShieldCheck;
      else if (statusUpper.includes('DELIVER') || statusUpper.includes('ARRIV')) stageIcon = MapPin;

      return {
        id: stg.status || `stage-${index}`,
        order: stg.order || index + 1,
        titleAr: stg.titleAr || stg.title || 'مرحلة شحن',
        titleEn: stg.titleEn || stg.title || 'Logistics Milestone',
        descriptionAr: stg.descriptionAr || stg.description || 'تم إنجاز التحديثات اللوجستية لهذه المرحلة.',
        descriptionEn: stg.descriptionEn || stg.description || 'Logistics operations milestone recorded.',
        statusKey: stg.status || 'IN_TRANSIT',
        location: stg.location || (index === 0 ? shipment.origin : index === shipment.timeline.length - 1 ? shipment.destination : shipment.currentLocation),
        date: stg.date || (index === 0 ? shipment.pickupDate : index === shipment.timeline.length - 1 ? shipment.estimatedDelivery : undefined),
        completed: Boolean(stg.completed),
        current: Boolean(stg.current),
        icon: stageIcon,
        facilityRef: stg.operatorOrFacility || stg.facilityRef || (stg.current ? shipment.currentLocation : undefined)
      };
    });
  } else {
    // Generate derived stages based on shipment currentStatus or progressPercent
    const currentStatusStr = (shipment?.currentStatus || shipment?.status || 'IN_TRANSIT').toUpperCase();
    let currentIdx = 2; // Default to in transit

    if (currentStatusStr.includes('DELIVER')) currentIdx = 5;
    else if (currentStatusStr.includes('CUSTOM') || currentStatusStr.includes('FASAH')) currentIdx = 3;
    else if (currentStatusStr.includes('TRANSIT')) currentIdx = 2;
    else if (currentStatusStr.includes('LOAD') || currentStatusStr.includes('PORT')) currentIdx = 1;
    else if (currentStatusStr.includes('BOOK')) currentIdx = 0;

    stages = DEFAULT_STAGES.map((stg, idx) => ({
      ...stg,
      completed: idx < currentIdx,
      current: idx === currentIdx,
      location: idx === 0 ? shipment?.origin : idx === 5 ? shipment?.destination : shipment?.currentLocation,
      date: idx === 0 ? shipment?.pickupDate || '2026-07-20' : idx === 5 ? shipment?.estimatedDelivery || '2026-08-05' : undefined,
    }));
  }

  // Find active / current stage index
  const activeStageIndex = stages.findIndex((s) => s.current);
  const currentStage = activeStageIndex !== -1 ? stages[activeStageIndex] : stages[Math.floor(stages.length / 2)];

  // Calculate progress percent line filling
  const completedCount = stages.filter((s) => s.completed).length;
  const progressPercent = activeStageIndex !== -1
    ? Math.round(((activeStageIndex + 0.5) / stages.length) * 100)
    : Math.round((completedCount / stages.length) * 100);

  // Determine active displayed stage detail (hovered > selected > active current)
  const inspectedIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex !== null ? selectedIndex : (activeStageIndex !== -1 ? activeStageIndex : 0);
  const inspectedStage = stages[inspectedIndex] || stages[0];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner with Status & Progress Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#082F49] p-4 rounded-2xl border border-[#0F4C75] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C75] flex items-center justify-center text-[#00F0FF] shrink-0 border border-[#00F0FF]/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#00F0FF] uppercase tracking-wider block">
              {isAr ? 'مؤشر مسار دورة حياة الشحنة المباشر' : 'Live Shipment Lifecycle Stepper'}
            </span>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>{isAr ? inspectedStage.titleAr : inspectedStage.titleEn}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                inspectedStage.current
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : inspectedStage.completed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {inspectedStage.current
                  ? (isAr ? 'المرحلة الحالية' : 'Active Stage')
                  : inspectedStage.completed
                  ? (isAr ? 'مكتملة' : 'Completed')
                  : (isAr ? 'قادمة' : 'Pending')}
              </span>
            </h4>
          </div>
        </div>

        {/* Overall Completion Percentage Badge */}
        <div className="flex items-center gap-3 bg-black/30 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto shrink-0">
          <div className="text-end">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'نسبة التقدم الكلي' : 'Overall Progress'}</span>
            <span className="font-mono font-black text-[#00F0FF] text-sm">{progressPercent}%</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-[#00F0FF] p-0.5 flex items-center justify-center">
            <div
              className="w-full h-full rounded-full bg-[#00F0FF]"
              style={{ opacity: progressPercent / 100 }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Progress Stepper Line */}
      <div className="relative px-2 sm:px-6 pt-4 pb-2 bg-slate-950/80 p-6 rounded-2xl border border-[#0F4C75]/60 shadow-xl overflow-x-auto">
        {/* Progress Connecting Track Line */}
        <div className="absolute top-10 left-8 right-8 h-1 bg-slate-800 rounded-full z-0 hidden sm:block">
          <div
            className="h-full bg-gradient-to-r from-[#0F4C75] via-[#00F0FF] to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#00F0FF]"
            style={{
              width: isAr
                ? `${100 - (progressPercent)}%`
                : `${progressPercent}%`,
            }}
          />
        </div>

        {/* Milestone Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-2 relative z-10">
          {stages.map((stage, idx) => {
            const IconComp = stage.icon || Box;
            const isCompleted = stage.completed;
            const isCurrent = stage.current;
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={stage.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedIndex(idx)}
                className="relative group cursor-pointer flex flex-col items-center text-center focus:outline-none"
              >
                {/* Node Circle Button */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative shadow-lg ${
                    isCurrent
                      ? 'bg-[#EA580C] text-white ring-4 ring-[#EA580C]/40 scale-110 shadow-[0_0_20px_rgba(234,88,12,0.6)]'
                      : isCompleted
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-900 text-slate-500 border border-slate-700 hover:border-[#00F0FF] hover:text-slate-200'
                  } ${isHovered || isSelected ? 'ring-2 ring-[#00F0FF] -translate-y-1' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <IconComp className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
                  )}

                  {/* Pulsing Active Ping Ring for Current Node */}
                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-2xl border-2 border-[#EA580C] animate-ping opacity-75 pointer-events-none" />
                  )}

                  {/* Stage Order Badge */}
                  <span
                    className={`absolute -bottom-2 -right-1 text-[9px] font-black font-mono px-1.5 py-0.5 rounded-md border ${
                      isCurrent
                        ? 'bg-[#082F49] text-white border-amber-400'
                        : isCompleted
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    0{stage.order}
                  </span>
                </div>

                {/* Milestone Node Title */}
                <div className="mt-3 space-y-0.5 max-w-[120px]">
                  <span
                    className={`text-xs font-bold block transition-colors line-clamp-1 ${
                      isCurrent
                        ? 'text-amber-300 font-black'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {isAr ? stage.titleAr : stage.titleEn}
                  </span>

                  {stage.date && (
                    <span className="text-[10px] text-slate-500 font-mono block truncate">
                      {stage.date.split(' ')[0]}
                    </span>
                  )}
                </div>

                {/* HOVER TOOLTIP POPOVER (Positioned dynamically above node) */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 z-50 w-64 p-3.5 bg-[#0B172A] border border-[#00F0FF]/50 text-white rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none text-start space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
                        <span className="text-[10px] font-mono font-bold text-[#00F0FF] uppercase">
                          Stage 0{stage.order} Details
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          isCurrent
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isCurrent
                          ? (isAr ? 'جارية الان' : 'In Progress')
                          : isCompleted
                          ? (isAr ? 'مكتملة' : 'Completed')
                          : (isAr ? 'مستقبلية' : 'Pending')}
                      </span>
                    </div>

                    <h5 className="font-extrabold text-xs text-white">
                      {isAr ? stage.titleAr : stage.titleEn}
                    </h5>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr ? stage.descriptionAr : stage.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-white/10 space-y-1 text-[10px] text-slate-400">
                      {stage.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00F0FF] shrink-0" />
                          <span className="truncate">{stage.location}</span>
                        </div>
                      )}

                      {stage.date && (
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{stage.date}</span>
                        </div>
                      )}

                      {stage.facilityRef && (
                        <div className="flex items-center gap-1 font-mono text-slate-400">
                          <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{stage.facilityRef}</span>
                        </div>
                      )}
                    </div>

                    {/* Tooltip Arrow Caret */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0B172A]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected / Inspected Milestone Detail Card */}
      <div className="bg-[#082F49] border border-[#0F4C75] p-4 md:p-5 rounded-2xl text-white space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#0F4C75] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center font-mono font-bold text-xs border border-[#00F0FF]/30">
              0{inspectedStage.order}
            </div>
            <div>
              <span className="text-[10px] text-[#00F0FF] font-bold block uppercase tracking-wider">
                {isAr ? 'معلومات التحديث الميداني للمرحلة' : 'Inspected Milestone Details'}
              </span>
              <h5 className="font-bold text-white text-sm">
                {isAr ? inspectedStage.titleAr : inspectedStage.titleEn}
              </h5>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${
              inspectedStage.current
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : inspectedStage.completed
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {inspectedStage.current
              ? (isAr ? 'المرحلة النشطة الآن' : 'Active Stage')
              : inspectedStage.completed
              ? (isAr ? 'تم الاستكمال بنجاح' : 'Completed')
              : (isAr ? 'مرحلة قادمة متوقعة' : 'Upcoming Stage')}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isAr ? inspectedStage.descriptionAr : inspectedStage.descriptionEn}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الموقع / المحطة:' : 'Location / Terminal:'}</span>
            <span className="font-bold text-white block truncate">{inspectedStage.location || '-'}</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'التاريخ والوقت:' : 'Recorded Timestamp:'}</span>
            <span className="font-mono font-bold text-amber-300 block truncate">{inspectedStage.date || (isAr ? 'جاري تحديث النظام' : 'Pending Update')}</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'حالة التوثيق الرقمي:' : 'Security Verification:'}</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'مصدق إلكترونياً (AJA Secured)' : 'Verified'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
