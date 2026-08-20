import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, ShieldCheck, CheckCircle2, MapPin, Calendar, Truck, Package, Building2, User, Sparkles } from 'lucide-react';
import { DetailedShipment, CORE_STATUS_CONFIG, CoreShipmentStatus } from '../../data/shipmentsData';
import { useLanguage } from '../../i18n/LanguageContext';

interface ShipmentPrintSummaryModalProps {
  shipment: DetailedShipment;
  isOpen: boolean;
  onClose: () => void;
}

export const ShipmentPrintSummaryModal: React.FC<ShipmentPrintSummaryModalProps> = ({
  shipment,
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track-shipment?num=${shipment.trackingNumber}`
    : `https://aja-logistics.com/track-shipment?num=${shipment.trackingNumber}`;

  const currentStatusConfig = CORE_STATUS_CONFIG[shipment.currentStatus as CoreShipmentStatus] || {
    labelAr: shipment.statusAr,
    labelEn: shipment.statusEn,
    descriptionAr: 'الشحنة قيد المتابعة والمعالجة بالمحطة اللوجستية.',
    descriptionEn: 'Cargo under active logistics management.',
  };

  const statusLabel = isAr ? currentStatusConfig.labelAr : currentStatusConfig.labelEn;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-[#0F4C75] text-slate-100 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border-2">
        
        {/* Modal Top Action Bar (Hidden in Browser Print) */}
        <div className="no-print bg-[#082F49] px-6 py-4 border-b border-[#0F4C75] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F4C75] flex items-center justify-center text-[#00F0FF]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isAr ? 'طباعة ملخص الشحنة المعاين' : 'Shipment Printable Summary'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAr ? 'مستند رسمي شامل يتضمن كود QR للتتبع المباشر' : 'Official summary sheet featuring quick-scan QR code'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-700"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Scroll Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950 text-slate-900 flex-1">
          {/* Printable White Sheet Canvas */}
          <div
            ref={printRef}
            className="print-sheet bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl max-w-3xl mx-auto border border-slate-200 text-xs space-y-6"
            style={{ fontFamily: isAr ? 'IBM Plex Sans Arabic, Tajawal, sans-serif' : 'Inter, sans-serif' }}
          >
            {/* Header: Company Name + Document Type + QR Code */}
            <div className="flex flex-row items-start justify-between border-b-2 border-[#082F49] pb-6 gap-4">
              <div className="space-y-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#082F49] text-white flex items-center justify-center font-bold font-mono text-sm">
                    AJA
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-[#082F49] uppercase tracking-tight leading-none">
                      أجا للخدمات اللوجستية | AJA LOGISTICS
                    </h1>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      المملكة العربية السعودية - أنظمة الشحن المتقدمة والتخليص الجمركي
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-[#082F49] font-black text-xs rounded-md border border-slate-300 uppercase tracking-wider">
                    {isAr ? 'ملخص الشحنة ومستند التتبع المباشر' : 'OFFICIAL SHIPMENT SUMMARY & TRACKING DOCUMENT'}
                  </span>
                </div>
              </div>

              {/* QR Code Block */}
              <div className="flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-300 shrink-0 text-center">
                <QRCodeSVG
                  value={trackingUrl}
                  size={90}
                  level="M"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#082F49"
                />
                <span className="text-[9px] font-bold text-[#082F49] mt-1.5 font-mono">
                  #{shipment.trackingNumber}
                </span>
                <span className="text-[8px] text-slate-500 font-medium">
                  {isAr ? 'امسح للتتبع الحي' : 'Scan for Live GPS'}
                </span>
              </div>
            </div>

            {/* Core Summary Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">{isAr ? 'رقم التتبع:' : 'Tracking No:'}</span>
                <strong className="text-sm font-black font-mono text-[#082F49]">#{shipment.trackingNumber}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">{isAr ? 'الحالة الحالية:' : 'Current Status:'}</span>
                <strong className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  {statusLabel}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">{isAr ? 'نوع الشحن:' : 'Service Type:'}</span>
                <strong className="text-xs font-bold text-slate-800">{shipment.shipmentTypeAr || shipment.shipmentType}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">{isAr ? 'الوصول المتوقع:' : 'ETA Delivery:'}</span>
                <strong className="text-xs font-bold text-slate-900 font-mono">{shipment.estimatedDelivery}</strong>
              </div>
            </div>

            {/* Origin & Destination Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200 space-y-1">
                <span className="text-[10px] font-bold text-[#0F4C75] uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isAr ? 'موقع الاستلام / المنشأ (Origin)' : 'Origin Facility'}</span>
                </span>
                <p className="font-bold text-slate-900 text-xs">{shipment.origin}</p>
                {shipment.originPort && (
                  <p className="text-[10px] text-slate-500 font-mono">{shipment.originPort}</p>
                )}
                <span className="text-[10px] text-slate-600 block pt-1">{isAr ? `تاريخ الاستلام: ${shipment.pickupDate || '-'}` : `Pickup: ${shipment.pickupDate || '-'}`}</span>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isAr ? 'موقع التسليم / الوجهة (Destination)' : 'Destination Facility'}</span>
                </span>
                <p className="font-bold text-slate-900 text-xs">{shipment.destination}</p>
                {shipment.destinationPort && (
                  <p className="text-[10px] text-slate-500 font-mono">{shipment.destinationPort}</p>
                )}
                <span className="text-[10px] text-slate-600 block pt-1">{isAr ? `الوصول المتوقع: ${shipment.estimatedDelivery}` : `ETA: ${shipment.estimatedDelivery}`}</span>
              </div>
            </div>

            {/* Specifications & Parties Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#082F49] text-xs uppercase border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#0F4C75]" />
                <span>{isAr ? 'مواصفات الشحنة والجهات المعنية' : 'Shipment Cargo & Party Specifications'}</span>
              </h4>

              <table className="w-full border-collapse text-left text-xs border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-2 font-bold text-slate-600 w-1/4 border-r border-slate-200">{isAr ? 'وصف البضاعة:' : 'Cargo Description:'}</td>
                    <td className="p-2 font-bold text-slate-900 w-1/4 border-r border-slate-200">{shipment.cargoDescriptionAr || shipment.cargoDescriptionEn || '-'}</td>
                    <td className="p-2 font-bold text-slate-600 w-1/4 border-r border-slate-200">{isAr ? 'الوزن الاجمالي:' : 'Total Weight:'}</td>
                    <td className="p-2 font-mono font-bold text-slate-900 w-1/4">{shipment.weightKg.toLocaleString()} kg</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold text-slate-600 border-r border-slate-200">{isAr ? 'رقم الحاوية / البوليصة:' : 'Container / Waybill:'}</td>
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">{shipment.containerNumber || 'AJA-WB-99823'}</td>
                    <td className="p-2 font-bold text-slate-600 border-r border-slate-200">{isAr ? 'الشركة الناقلة:' : 'Carrier Provider:'}</td>
                    <td className="p-2 font-bold text-slate-900">{shipment.carrierName || 'AJA Logistics Fleet'}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-2 font-bold text-slate-600 border-r border-slate-200">{isAr ? 'المرسل (Shipper):' : 'Shipper Name:'}</td>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-200">{shipment.senderName}</td>
                    <td className="p-2 font-bold text-slate-600 border-r border-slate-200">{isAr ? 'المستلم (Consignee):' : 'Consignee Name:'}</td>
                    <td className="p-2 font-bold text-slate-900">{shipment.receiverName}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-600 border-r border-slate-200">{isAr ? 'بيان فسح الجمركي:' : 'FASAH Customs Ref:'}</td>
                    <td className="p-2 font-mono font-bold text-[#0F4C75] border-r border-slate-200">{(shipment as any).fasahDeclarationNumber || 'FASH-2026-99218'}</td>
                    <td className="p-2 font-bold text-slate-600 border-r border-slate-200">{isAr ? 'حساب العملاء:' : 'Client Account:'}</td>
                    <td className="p-2 font-bold text-slate-900">{shipment.customerName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stage Timeline Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#082F49] text-xs uppercase border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#0F4C75]" />
                <span>{isAr ? 'مراحل المسار الرئيسية (Milestones)' : 'Transit Milestones Summary'}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shipment.timeline.map((stg) => (
                  <div
                    key={stg.order}
                    className={`p-2 rounded-lg border text-[11px] ${
                      stg.completed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : stg.current
                        ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold uppercase">Stage 0{stg.order}</span>
                      {stg.completed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </div>
                    <p className="font-bold truncate mt-0.5">{isAr ? stg.titleAr : stg.titleEn}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{stg.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Verification & Seal */}
            <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
              <div className="space-y-1 text-center sm:text-start">
                <div className="flex items-center gap-1 text-[#082F49] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'مستند مصدق إلكترونياً من أجا اللوجستية' : 'Electronically Verified Document - AJA Logistics'}</span>
                </div>
                <p className="text-[9px] text-slate-400">
                  {isAr ? 'تاريخ الاستخراج: ' + new Date().toLocaleDateString('ar-SA') + ' - رقم المرجع: AJA-CERT-' + shipment.id : 'Generated: ' + new Date().toLocaleDateString('en-US') + ' - Ref: AJA-CERT-' + shipment.id}
                </p>
              </div>

              {/* Official Seal / Stamp Representation */}
              <div className="flex items-center gap-3 border border-slate-300 p-2 rounded-xl bg-slate-50 shrink-0">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#082F49] flex items-center justify-center font-black font-mono text-[9px] text-[#082F49] text-center leading-none p-1">
                  AJA SEAL
                </div>
                <div>
                  <span className="font-bold text-[#082F49] block text-[10px]">{isAr ? 'ختم التوثيق اللوجستي' : 'Logistics Security Seal'}</span>
                  <span className="text-[9px] font-mono text-slate-400">STATUS: VERIFIED</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
