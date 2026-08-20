import React, { useState } from 'react';
import { 
  PackageCheck, 
  MapPin, 
  Clock, 
  Calendar, 
  Compass, 
  Copy, 
  Check, 
  Share2, 
  Truck, 
  Anchor, 
  ShieldCheck, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  User, 
  MessageSquare,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Printer
} from 'lucide-react';
import { DetailedShipment, CORE_STATUS_CONFIG, CoreShipmentStatus } from '../../data/shipmentsData';
import { useLanguage } from '../../i18n/LanguageContext';
import { InteractiveShipmentMap } from '../common/InteractiveShipmentMap';
import { ShipmentLifecycleStepper } from '../common/ShipmentLifecycleStepper';
import { ShipmentPrintSummaryModal } from './ShipmentPrintSummaryModal';

interface TrackingResultProps {
  shipment: DetailedShipment;
  className?: string;
}

export const TrackingResult: React.FC<TrackingResultProps> = ({ shipment, className = '' }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [copied, setCopied] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/track-shipment?num=${shipment.trackingNumber}`;
    if (navigator.share) {
      navigator.share({
        title: `تتبع الشحنة ${shipment.trackingNumber} - أجا اللوجستية`,
        text: `تتبع حي ومباشر لمسار الشحنة رقم ${shipment.trackingNumber}`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentStatusConfig = CORE_STATUS_CONFIG[shipment.currentStatus as CoreShipmentStatus] || {
    labelAr: shipment.statusAr,
    labelEn: shipment.statusEn,
    descriptionAr: 'الشحنة قيد المتابعة والمعالجة بالمحطة اللوجستية.',
    descriptionEn: 'Cargo under active logistics management.',
    badgeVariant: 'active',
    stepOrder: 3
  };

  const statusLabel = isAr ? currentStatusConfig.labelAr : currentStatusConfig.labelEn;
  const eventsList = shipment.events || [];
  const visibleEvents = showAllEvents ? eventsList : eventsList.slice(0, 4);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 1. HEADER CARD: Shipment Number & Current Status */}
      <div className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0F4C75]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0F4C75] pb-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                {isAr ? 'رقم الشحنة الرئيسي' : 'Shipment Tracking Number'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#0F4C75]/20 text-white border border-[#0F4C75]">
                <Sparkles className="w-3 h-3 text-white" />
                <span>{shipment.shipmentTypeAr || shipment.shipmentType}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 id="shipment-number-display" className="text-3xl md:text-4xl font-black font-mono text-white tracking-tight">
                #{shipment.trackingNumber}
              </h2>
              <button
                onClick={handleCopyTracking}
                className="p-2 rounded-xl bg-[#0F4C75] hover:bg-[#0F4C75]/80 text-slate-200 transition-colors border border-slate-600"
                title={isAr ? 'نسخ رقم التتبع' : 'Copy Tracking Number'}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg border ${
              shipment.currentStatus === 'SHIPMENT_CREATED' || shipment.currentStatus === 'PICKED_UP'
                ? 'bg-[#0F4C75]/20 border-[#0F4C75] text-sky-200'
                : shipment.currentStatus === 'IN_TRANSIT'
                ? 'bg-[#0F4C75] border-[#0F4C75] text-white'
                : shipment.currentStatus === 'AT_CUSTOMS'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                : shipment.currentStatus === 'OUT_FOR_DELIVERY'
                ? 'bg-slate-800 border-slate-600 text-slate-100'
                : shipment.currentStatus === 'DELIVERED'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500 text-rose-300'
            }`}>
              <div className={`w-3 h-3 rounded-full animate-ping ${
                shipment.currentStatus === 'SHIPMENT_CREATED' || shipment.currentStatus === 'PICKED_UP'
                  ? 'bg-[#0F4C75]'
                  : shipment.currentStatus === 'IN_TRANSIT'
                  ? 'bg-white'
                  : shipment.currentStatus === 'AT_CUSTOMS'
                  ? 'bg-amber-500'
                  : shipment.currentStatus === 'OUT_FOR_DELIVERY'
                  ? 'bg-slate-400'
                  : shipment.currentStatus === 'DELIVERED'
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
              }`} />
              <div>
                <span className="text-[10px] font-bold opacity-80 block uppercase">
                  {isAr ? 'الحالة الحالية' : 'Current Status'}
                </span>
                <span id="current-status-display" className="text-base font-black">
                  {statusLabel}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all border border-[#EA580C] font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              title={isAr ? 'طباعة ملخص الشحنة مع QR' : 'Print Shipment Summary with QR'}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? 'طباعة ملخص الشحنة' : 'Print Summary'}</span>
            </button>

            <button
              onClick={handleShareLink}
              className="p-3.5 rounded-2xl bg-[#0F4C75] hover:bg-[#0F4C75]/80 text-slate-200 transition-colors border border-slate-600 cursor-pointer"
              title={isAr ? 'مشاركة رابط الشحنة' : 'Share Tracking Link'}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. CORE ATTRIBUTES GRID: Origin, Destination, Estimated Delivery, Current Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Origin */}
          <div className="bg-[#0F4C75]/60 border border-[#0F4C75] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <Anchor className="w-4 h-4 text-white" />
              <span>{isAr ? 'مكان الاستلام / المنشأ (Origin)' : 'Origin Location'}</span>
            </div>
            <p id="origin-display" className="text-sm font-bold text-white line-clamp-2">
              {shipment.origin}
            </p>
          </div>

          {/* Destination */}
          <div className="bg-[#0F4C75]/60 border border-[#0F4C75] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>{isAr ? 'مكان التسليم / الوجهة (Destination)' : 'Destination Location'}</span>
            </div>
            <p id="destination-display" className="text-sm font-bold text-white line-clamp-2">
              {shipment.destination}
            </p>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-[#0F4C75]/60 border border-[#0F4C75] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <Calendar className="w-4 h-4 text-white" />
              <span>{isAr ? 'الوصول المتوقع (Estimated Delivery)' : 'Estimated Delivery'}</span>
            </div>
            <p id="estimated-delivery-display" className="text-base font-black font-mono text-white">
              {shipment.estimatedDelivery}
            </p>
          </div>

          {/* Current Location */}
          <div className="bg-[#0F4C75]/60 border border-[#0F4C75] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>{isAr ? 'الموقع الحالي (Current Location)' : 'Current Location'}</span>
            </div>
            <p id="current-location-display" className="text-sm font-bold text-white line-clamp-2">
              {shipment.currentLocation}
            </p>
          </div>
        </div>
      </div>

      {/* 2.5 INTERACTIVE LEAFLET GPS ROUTE MAP */}
      <div id="shipment-leaflet-map-section" className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0F4C75] pb-4">
          <div>
            <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block">
              {isAr ? 'الخريطة التفاعلية الجغرافية' : 'Interactive Geospatial Map'}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'مسار الشحنة المباشر على الخريطة (Leaflet Transit Map)' : 'Live Route & Transit Map'}
            </h3>
          </div>
          <span className="text-xs text-slate-300 font-mono bg-[#0F4C75] px-3 py-1 rounded-xl border border-slate-600 self-start sm:self-auto">
            GPS Live Tracking Engine
          </span>
        </div>

        <InteractiveShipmentMap shipment={shipment} height="420px" />
      </div>

      {/* 3. TIMELINE & DYNAMIC LIFECYCLE STEPPER SECTION */}
      <div className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#0F4C75] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block">
              {isAr ? 'مراحل دورة حياة الشحنة التفاعلية' : 'Interactive Lifecycle Milestones'}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'مسار تقدم الشحنة ومراحل الإنجاز (Status Lifecycle Stepper)' : 'Shipment Status Lifecycle Stepper'}
            </h3>
          </div>

          <span className="text-xs font-mono font-bold text-[#00F0FF] bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            {isAr ? `نسبة التقدم: ${shipment.progressPercent}%` : `Progress: ${shipment.progressPercent}%`}
          </span>
        </div>

        {/* Dynamic Visual Progress Stepper Component with Hover Tooltips */}
        <ShipmentLifecycleStepper shipment={shipment} />

        {/* 6-Step Visual Cards Grid */}
        <div className="pt-4 border-t border-[#0F4C75]/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isAr ? 'تفاصيل سجل المراحل 01 - 06 (Milestones Grid)' : 'Milestone Log Summary Grid'}
          </h4>

          <div id="shipment-timeline-container" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
            {shipment.timeline.map((step) => {
              const isCompleted = step.completed;
              const isCurrent = step.current;

              return (
                <div
                  key={step.status}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 relative space-y-2 ${
                    isCurrent
                      ? 'bg-[#0F4C75] border-[#00F0FF] ring-2 ring-[#00F0FF]/40 shadow-xl'
                      : isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-[#082F49]/60 border-[#0F4C75] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                      isCurrent
                        ? 'bg-[#EA580C] text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      0{step.order}
                    </span>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isCurrent ? (isAr ? 'نشطة الان' : 'Active') : isCompleted ? (isAr ? 'مكتملة' : 'Done') : (isAr ? 'قادمة' : 'Pending')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                    {isAr ? step.titleAr : step.titleEn}
                  </h4>

                  <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
                    {isAr ? step.descriptionAr : step.descriptionEn}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span className="truncate">{step.location}</span>
                    <span className="shrink-0">{step.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. SHIPMENT EVENTS SECTION: Detailed Timestamped Audit Log */}
      <div className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#0F4C75] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'سجل الفعاليات والتحديثات' : 'Detailed Audit Log'}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'سجل أحداث الشحنة المباشر (Shipment Events)' : 'Live Shipment Events'}
            </h3>
          </div>

          <span className="text-xs font-mono text-slate-300">
            {isAr ? `إجمالي الأحداث: ${eventsList.length}` : `Total Events: ${eventsList.length}`}
          </span>
        </div>

        {/* Events Table / Timeline List */}
        <div id="shipment-events-container" className="space-y-4">
          {visibleEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#0F4C75]/40 hover:bg-[#0F4C75] border border-[#0F4C75] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0F4C75]/20 text-white border border-[#0F4C75] font-mono text-[11px] font-bold">
                    {evt.statusLabelAr}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {evt.location}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {evt.descriptionAr}
                </p>

                {evt.operatorOrFacility && (
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {isAr ? `المنشأة / المشغل: ${evt.operatorOrFacility}` : `Facility: ${evt.operatorOrFacility}`}
                  </span>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between text-xs text-slate-300 font-mono shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#0F4C75]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.timestamp}</span>
                </span>
                <span className="text-[10px] text-slate-400">{evt.id}</span>
              </div>
            </div>
          ))}

          {eventsList.length > 4 && (
            <button
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="w-full py-3 rounded-2xl bg-[#082F49] hover:bg-[#0F4C75] border border-[#0F4C75] text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>
                {showAllEvents
                  ? (isAr ? 'عرض أقل' : 'Show Less')
                  : (isAr ? `عرض باقي الأحداث (${eventsList.length - 4} أحداث إضافية)` : `View All Events (${eventsList.length - 4} more)`)}
              </span>
              {showAllEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 5. CARGO & CARRIER SPECIFICATIONS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#082F49] border border-[#0F4C75] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#0F4C75] pb-2">
            <PackageCheck className="w-4 h-4 text-white" />
            <span>{isAr ? 'مواصفات الحشوة والوزن' : 'Cargo Specs'}</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <p><span className="text-slate-400">{isAr ? 'الوصف:' : 'Desc:'}</span> <strong className="text-white">{shipment.cargoDescriptionAr}</strong></p>
            <p><span className="text-slate-400">{isAr ? 'الوزن الفعلي:' : 'Weight:'}</span> <strong className="text-white font-mono">{shipment.weightKg.toLocaleString()} {isAr ? 'كجم' : 'kg'}</strong></p>
            {shipment.containerNumber && (
              <p><span className="text-slate-400">{isAr ? 'رقم الحاوية:' : 'Container:'}</span> <strong className="text-white font-mono">{shipment.containerNumber}</strong></p>
            )}
          </div>
        </div>

        <div className="bg-[#082F49] border border-[#0F4C75] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#0F4C75] pb-2">
            <Truck className="w-4 h-4 text-[#0F4C75]" />
            <span>{isAr ? 'الناقل والسائق' : 'Carrier & Driver'}</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <p><span className="text-slate-400">{isAr ? 'شركة النقل:' : 'Carrier:'}</span> <strong className="text-white">{shipment.carrierName || 'أجا للخدمات اللوجستية'}</strong></p>
            <p><span className="text-slate-400">{isAr ? 'المركبة/السفينة:' : 'Vessel/Truck:'}</span> <strong className="text-white font-mono">{shipment.vesselOrFleetName || 'AJA FLEET'}</strong></p>
            {shipment.driverName && (
              <p><span className="text-slate-400">{isAr ? 'السائق المسؤول:' : 'Driver:'}</span> <strong className="text-white">{shipment.driverName}</strong></p>
            )}
          </div>
        </div>

        <div className="bg-[#082F49] border border-[#0F4C75] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#0F4C75] pb-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'الأطراف المعتمدة' : 'Parties'}</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <p><span className="text-slate-400">{isAr ? 'المرسل (Shipper):' : 'Shipper:'}</span> <strong className="text-white">{shipment.senderName}</strong></p>
            <p><span className="text-slate-400">{isAr ? 'المستلم (Consignee):' : 'Consignee:'}</span> <strong className="text-white">{shipment.receiverName}</strong></p>
            <p><span className="text-slate-400">{isAr ? 'حساب العميل:' : 'Customer:'}</span> <strong className="text-white">{shipment.customerName}</strong></p>
          </div>
        </div>
      </div>

      {/* 6. INTEGRATION ARCHITECTURE READY BANNER */}
      <div className="rounded-2xl bg-[#082F49]/80 border border-[#0F4C75] p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C75]/20 text-white border border-[#0F4C75] flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-200">
              {isAr ? 'جاهزية الربط البرمجي والانظمه اللوجستية (System Integration Ready)' : 'Logistics API & ERP Integration Architecture'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'النظام مهيأ هيكلياً للربط المباشر مع APIs الشحن، قواعد البيانات، أنظمة ERP (SAP / Oracle)، ومنصات LMS.'
                : 'Data engine structured for direct hookup with Tracking APIs, Firestore, SAP/Oracle ERPs, and LMS platforms.'}
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-[#0F4C75] text-slate-200 font-mono font-bold border border-slate-600 shrink-0">
          AJA Data Service API v2
        </span>
      </div>

      {/* 7. PRINTER-FRIENDLY SHIPMENT SUMMARY MODAL */}
      <ShipmentPrintSummaryModal
        shipment={shipment}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
