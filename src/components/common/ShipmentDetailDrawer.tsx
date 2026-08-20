import React, { useState } from 'react';
import {
  X,
  MapPin,
  Truck,
  Anchor,
  Box,
  Scale,
  ShieldCheck,
  FileText,
  Clock,
  CreditCard,
  MessageSquare,
  Copy,
  Check,
  Building2,
  Phone,
  User,
  Compass,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
  Map as MapIcon,
  PackageCheck
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { ShipmentDocumentsManager } from '../documents/ShipmentDocumentsManager';
import { InteractiveShipmentMap } from './InteractiveShipmentMap';
import { ShipmentLifecycleStepper } from './ShipmentLifecycleStepper';
import { generateShipmentPDF } from '../../utils/pdfExport';
import {
  EnterpriseDrawer,
  DrawerHeader,
  DrawerTabs,
  DrawerBody,
  DrawerFooter
} from '../drawer';
import { DrawerTab } from '../../types/drawerInteractionFramework';

interface ShipmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any;
  onTrack?: (trackingNum: string) => void;
  onOpenPayment?: () => void;
  isAr?: boolean;
}

const SHIPMENT_STAGES = [
  { id: 'RECEIVED', labelAr: 'الحجز والاستلام', labelEn: 'Booked & Received', icon: Box },
  { id: 'LOADING', labelAr: 'التحميل والميناء', labelEn: 'Loading & Port', icon: Anchor },
  { id: 'IN_TRANSIT', labelAr: 'في الطريق الدولي', labelEn: 'In Transit', icon: Truck },
  { id: 'CUSTOMS', labelAr: 'التخليص الجمركي', labelEn: 'Customs Clearance', icon: ShieldCheck },
  { id: 'DELIVERED', labelAr: 'التسليم النهائي', labelEn: 'Delivered', icon: MapPin },
];

const getStageIndex = (statusStr: string): number => {
  const s = (statusStr || '').toUpperCase();
  if (s === 'DELIVERED') return 4;
  if (['CUSTOMS', 'CUSTOMS_CLEARANCE', 'OUT_FOR_DELIVERY'].includes(s)) return 3;
  if (['IN_TRANSIT', 'ARRIVED_AT_PORT', 'AT_PORT'].includes(s)) return 2;
  if (['PREPARING', 'LOADING', 'LOADED', 'PICKUP'].includes(s)) return 1;
  return 0;
};

export const ShipmentDetailDrawer: React.FC<ShipmentDetailDrawerProps> = ({
  isOpen,
  onClose,
  shipment,
  onTrack,
  onOpenPayment,
  isAr = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!shipment) return null;

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    await generateShipmentPDF(shipment);
    setIsExportingPDF(false);
  };

  const handleCopy = () => {
    if (shipment.trackingNumber) {
      navigator.clipboard.writeText(shipment.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusKey = shipment.currentStatus || shipment.status || 'IN_TRANSIT';
  const activeStageIdx = getStageIndex(statusKey);
  const estimatedDeliveryDate = shipment.estimatedArrivalDate || shipment.estimatedDelivery || '2026-08-05';

  // Derived / fallback values for address details
  const originAddress = {
    senderName: shipment.senderName || shipment.originContactName || 'شركة التوريد الآسيوي المحدودة',
    phone: shipment.senderPhone || '+86 21 5888 9022',
    street: shipment.originStreet || 'طريق المرفأ الصناعي - رصيف 14',
    city: shipment.originCity || shipment.origin || 'شنغهاي / Shanghai',
    country: shipment.originCountry || 'الصين / China',
    postalCode: shipment.originPostal || '200000',
    port: shipment.originPort || 'ميناء شنغهاي البحري الدولي (CN SHA)',
  };

  const destinationAddress = {
    receiverName: shipment.receiverName || shipment.customerName || 'شركة أجا اللوجستية - مستودع الرياض',
    phone: shipment.receiverPhone || shipment.customerPhone || '+966 50 123 4567',
    street: shipment.deliveryAddressLine || 'حي السلي - مخرج 18 - شارع المستودعات',
    city: shipment.destinationCity || shipment.destination || 'الرياض / Riyadh',
    country: shipment.destinationCountry || 'المملكة العربية السعودية / KSA',
    postalCode: shipment.destinationPostal || '14233',
    port: shipment.destinationPort || 'ميناء الملك عبد العزيز - الدمام (SA DMM)',
  };

  // Specific Customs Clearance Status details
  const customsDetails = {
    declarationNo: shipment.customsDeclarationNo || `DEC-2026-${shipment.trackingNumber?.slice(-5) || '88401'}`,
    portOfClearance: shipment.customsPort || 'منفذ ميناء الملك عبد العزيز الجمركي (الدمام)',
    dutyStatus: shipment.customsDutyStatus || (activeStageIdx >= 3 ? 'تم السداد والمقاصة الإلكترونية (Paid & Cleared)' : 'قيد التدقيق وحساب الرسوم الجمركية'),
    inspectionStatus: shipment.customsInspection || (activeStageIdx >= 3 ? 'تم اجتياز الفحص بالمرور الآلي (Passed Automated X-Ray)' : 'في انتظار المطابقة المستندية'),
    customsNotes: shipment.customsNotes || 'الشحنة مستوفية لمتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) ومطابقة للمواصفات السعودية (SASO).',
    dutyAmountSAR: shipment.customsDutyAmount || 450,
  };

  // Itemized Freight Weight & Dimensions details
  const freightSpecs = {
    grossWeightKg: shipment.grossWeightKg || shipment.weightKg || 1450,
    volumetricWeightKg: shipment.volumetricWeightKg || Math.round((shipment.weightKg || 1450) * 1.2),
    lengthCm: shipment.lengthCm || 120,
    widthCm: shipment.widthCm || 100,
    heightCm: shipment.heightCm || 160,
    totalCbm: shipment.totalCbm || '7.68 م³ (CBM)',
    packageCount: shipment.packageCount || '4 طبليات خشبية معالجة (Euro Pallets)',
    hsCode: shipment.hsCode || '8471.30.00 (أجهزة كمبيوتر ومعدات معالجة البيانات)',
    cargoDescription: shipment.cargoDescription || shipment.shipmentType || 'معدات إلكترونية وقطع غيار صناعية حساسة عالية الجودة',
  };

  const tabs: DrawerTab[] = [
    { id: 'overview', labelEn: 'Overview & Timeline', labelAr: 'الخط الزمني والنظرة العامة' },
    { id: 'map', labelEn: 'Live Map', labelAr: 'الخريطة المباشرة GPS', icon: <MapIcon className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'addresses', labelEn: 'Addresses', labelAr: 'عناوين المصدر والوجهة' },
    { id: 'customs', labelEn: 'Customs', labelAr: 'التخليص الجمركي' },
    { id: 'dimensions', labelEn: 'Specs & Weight', labelAr: 'الوزن والأبعاد الحجمية' },
    { id: 'documents', labelEn: 'Documents & Invoice', labelAr: 'المستندات والفاتورة' },
  ];

  return (
    <EnterpriseDrawer
      id="shipment-detail-drawer"
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      position="right"
      isAr={isAr}
    >
      <div className="flex flex-col h-full min-h-0">
        <DrawerHeader
          titleEn={`Waybill #${shipment.trackingNumber}`}
          titleAr={`بوليصة رقم #${shipment.trackingNumber}`}
          descriptionEn="Comprehensive shipment tracking & logistics details"
          descriptionAr="تفاصيل وتتبع الشحنة اللوجستية الشاملة"
          icon={<PackageCheck className="w-5 h-5 text-brand-navy dark:text-brand-gold" />}
          statusBadge={{
            labelEn: statusKey,
            labelAr: statusKey,
            variant: activeStageIdx === 4 ? 'completed' : 'info',
          }}
          onClose={onClose}
          isAr={isAr}
          headerActions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-border-default hover:bg-surface-secondary transition-colors text-text-muted hover:text-text-primary"
                title={isAr ? 'نسخ رقم البوليصة' : 'Copy Waybill Number'}
              >
                {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-2.5 py-1.5 bg-brand-navy text-white hover:bg-brand-navy/90 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold/90 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPDF ? (isAr ? 'جاري التصدير...' : 'Exporting...') : (isAr ? 'تصدير PDF' : 'PDF')}</span>
              </button>
            </div>
          }
        />

        <DrawerTabs
          tabs={tabs}
          activeTabId={activeTab}
          onChangeTab={setActiveTab}
          isAr={isAr}
        />

        <DrawerBody isAr={isAr}>
          {/* Prominent Estimated Delivery Indicator Card */}
          <div className="bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy text-white p-4 rounded-2xl border border-brand-navy/30 shadow-md space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <Clock className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <span className="text-[11px] text-white/80 font-bold block">
                    {isAr ? 'موعد الوصول المتوقع الرسمي' : 'Official Estimated Delivery'}
                  </span>
                  <span className="text-base font-mono font-black text-white">{estimatedDeliveryDate}</span>
                </div>
              </div>

              <div className="text-right sm:text-left space-y-0.5">
                <span className="text-[10px] text-white/70 block">{isAr ? 'الموقع الحالي للشحنة:' : 'Current Location:'}</span>
                <span className="text-xs font-bold text-brand-gold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  {shipment.currentLocation || shipment.pickupLocation || (isAr ? 'في طريق النقل الدولي' : 'In Transit')}
                </span>
              </div>
            </div>

            {/* Step Progress Line */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold text-white/90 mb-1.5">
                <span>{isAr ? `المرحلة الحالية: ${SHIPMENT_STAGES[activeStageIdx].labelAr}` : `Current Stage: ${SHIPMENT_STAGES[activeStageIdx].labelEn}`}</span>
                <span className="font-mono text-white font-black">{Math.round(((activeStageIdx + 1) / SHIPMENT_STAGES.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-brand-gold via-amber-400 to-status-success transition-all duration-700 rounded-full"
                  style={{ width: `${((activeStageIdx + 1) / SHIPMENT_STAGES.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* TAB CONTENT: 1. OVERVIEW & TIMELINE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ShipmentLifecycleStepper shipment={shipment} />

              <div className="p-4 bg-surface-secondary/50 border border-border-default rounded-2xl space-y-4">
                <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-navy dark:text-brand-gold" />
                  <span>{isAr ? 'مراحل الشحن والتتبع الميداني المباشر' : 'Milestone Stages & Live Tracking'}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SHIPMENT_STAGES.map((st, idx) => {
                    const Icon = st.icon;
                    const isCompleted = idx < activeStageIdx;
                    const isActive = idx === activeStageIdx;

                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                          isActive
                            ? 'bg-brand-navy text-white border-brand-navy shadow-md ring-2 ring-brand-navy/30 dark:bg-brand-gold dark:text-brand-navy dark:border-brand-gold'
                            : isCompleted
                            ? 'bg-status-success-subtle/30 border-status-success/30 text-status-success font-semibold'
                            : 'bg-surface-primary border-border-default text-text-muted'
                        }`}
                      >
                        <div className="flex justify-center">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white dark:text-brand-navy' : isCompleted ? 'text-status-success' : 'text-text-muted'}`} />
                        </div>
                        <div className="text-[11px] font-bold leading-tight">{isAr ? st.labelAr : st.labelEn}</div>
                        <div className="text-[9px] opacity-80 font-mono">
                          {isActive ? (isAr ? 'نشط الان' : 'Active') : isCompleted ? (isAr ? 'مكتمل' : 'Completed') : (isAr ? 'قادم' : 'Upcoming')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted block text-[11px] mb-0.5">{isAr ? 'نوع وسيلة الشحن:' : 'Shipment Mode:'}</span>
                  <span className="font-bold text-text-primary">{shipment.shipmentType || shipment.serviceType || 'شحن بحري دولي (FCL)'}</span>
                </div>
                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted block text-[11px] mb-0.5">{isAr ? 'تاريخ الحجز الانطلاق:' : 'Booking Date:'}</span>
                  <span className="font-bold font-mono text-text-primary">{shipment.shippingDate || shipment.createdAt?.slice(0, 10) || '2026-07-20'}</span>
                </div>
                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted block text-[11px] mb-0.5">{isAr ? 'رقم الحاوية / البوليسة:' : 'Container / B/L No:'}</span>
                  <span className="font-bold font-mono text-brand-navy dark:text-brand-gold">{shipment.containerNumber || 'TGHU-994012-0'}</span>
                </div>
                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted block text-[11px] mb-0.5">{isAr ? 'الوزن الإجمالي القائم:' : 'Gross Weight:'}</span>
                  <span className="font-bold text-text-primary">{freightSpecs.grossWeightKg} kg</span>
                </div>
                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted block text-[11px] mb-0.5">{isAr ? 'الحجم الكلي (CBM):' : 'Total Volume:'}</span>
                  <span className="font-bold text-text-primary">{freightSpecs.totalCbm}</span>
                </div>
                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted block text-[11px] mb-0.5">{isAr ? 'حالة التخليص الجمركي:' : 'Customs Duty:'}</span>
                  <span className="font-bold text-status-success">{customsDetails.dutyStatus.split(' ')[0]}</span>
                </div>
              </div>

              <div className="border-t border-border-default pt-4 space-y-3">
                <h4 className="font-bold text-text-primary text-sm">{isAr ? 'التحديثات الميدانية والجدول الزمني' : 'Field Updates & Timeline'}</h4>

                {shipment.events && shipment.events.length > 0 ? (
                  <div className="relative border-r-2 border-border-default pr-5 space-y-4 mr-2">
                    {shipment.events.map((evt: any, idx: number) => (
                      <div key={evt.id || idx} className="relative">
                        <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-brand-navy border-2 border-surface-primary dark:bg-brand-gold"></div>
                        <div className="bg-surface-secondary/30 border border-border-default p-3 rounded-xl space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <StatusBadge type="shipment" status={evt.status} />
                            <span className="text-[10px] text-text-muted font-mono">
                              {evt.createdAt ? new Date(evt.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US') : ''}
                            </span>
                          </div>
                          <p className="font-bold text-text-primary text-xs mt-1">{isAr ? evt.descriptionAr || evt.description : evt.description || evt.descriptionAr}</p>
                          {evt.location && (
                            <div className="flex items-center gap-1 text-text-muted text-[11px]">
                              <MapPin className="w-3 h-3 text-status-error" />
                              <span>{isAr ? 'الموقع:' : 'Location:'} {evt.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface-secondary/30 border border-border-default rounded-xl p-4 text-center text-text-muted space-y-1">
                    <Clock className="w-6 h-6 text-text-muted/60 mx-auto" />
                    <p className="font-bold text-text-primary">{isAr ? 'جاري تسجيل المحطات القادمة مع فريق النقل الميداني' : 'Awaiting field milestone updates'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: INTERACTIVE MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <InteractiveShipmentMap shipment={shipment} height="400px" />
            </div>
          )}

          {/* TAB CONTENT: 2. ORIGIN & DESTINATION ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="bg-brand-navy/5 border border-brand-navy/20 p-3.5 rounded-xl text-text-primary flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-navy dark:text-brand-gold shrink-0" />
                <p className="text-xs">
                  {isAr ? 'بيانات الموقع الجغرافي المسجلة رسمياً لمستودعات الشحن والاستلام والناقل الدولي.' : 'Officially registered geo-locations for origin, destination, and hub warehouses.'}
                </p>
              </div>

              <div className="p-4 bg-surface-primary border border-border-default rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border-default pb-2.5">
                  <span className="font-extrabold text-sm text-brand-navy dark:text-brand-gold flex items-center gap-2">
                    <Anchor className="w-4 h-4" />
                    {isAr ? 'عنوان المصدر والتحميل (Origin Address)' : 'Origin Address & Loading Port'}
                  </span>
                  <span className="px-2 py-0.5 bg-brand-navy/10 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold font-bold rounded text-[10px]">
                    {isAr ? 'منطقة الشحن' : 'Shipper Hub'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'اسم المرسل / الشركة الموردة:' : 'Shipper / Vendor:'}</span>
                    <strong className="text-text-primary text-xs flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-text-muted" />
                      {originAddress.senderName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'هاتف التواصل:' : 'Phone Contact:'}</span>
                    <strong className="text-text-primary text-xs font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      {originAddress.phone}
                    </strong>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-text-muted text-[10px] block">{isAr ? 'عنوان الشارع والمنفذ:' : 'Street Address:'}</span>
                    <strong className="text-text-primary text-xs flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-status-error" />
                      {originAddress.street}
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'المدينة والدولة:' : 'City & Country:'}</span>
                    <strong className="text-text-primary text-xs">{originAddress.city} - {originAddress.country}</strong>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'ميناء المغادرة:' : 'Port of Origin:'}</span>
                    <strong className="text-text-primary text-xs">{originAddress.port}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center py-1">
                <div className="bg-brand-navy text-white p-2 rounded-full shadow-xs flex items-center justify-center dark:bg-brand-gold dark:text-brand-navy">
                  <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
                </div>
              </div>

              <div className="p-4 bg-surface-primary border border-border-default rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border-default pb-2.5">
                  <span className="font-extrabold text-sm text-status-error flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-status-error" />
                    {isAr ? 'عنوان الوجهة والتسليم (Destination Address)' : 'Destination Address & Final Delivery'}
                  </span>
                  <span className="px-2 py-0.5 bg-status-error-subtle/40 text-status-error font-bold rounded text-[10px]">
                    {isAr ? 'نقطة الوصول' : 'Destination Hub'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'اسم المستلم / الجهة المستلمة:' : 'Consignee Name:'}</span>
                    <strong className="text-text-primary text-xs flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-text-muted" />
                      {destinationAddress.receiverName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'هاتف التواصل مع المستلم:' : 'Consignee Phone:'}</span>
                    <strong className="text-text-primary text-xs font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      {destinationAddress.phone}
                    </strong>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-text-muted text-[10px] block">{isAr ? 'عنوان التسليم النهائي والمستودع:' : 'Delivery Warehouse Street:'}</span>
                    <strong className="text-text-primary text-xs flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-status-success" />
                      {destinationAddress.street}
                    </strong>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'المدينة والدولة والرمز البريدي:' : 'City, Country & Zip:'}</span>
                    <strong className="text-text-primary text-xs">{destinationAddress.city} - {destinationAddress.country} ({destinationAddress.postalCode})</strong>
                  </div>

                  <div>
                    <span className="text-text-muted text-[10px] block">{isAr ? 'ميناء / منفذ الوصول الجمركي:' : 'Port of Entry:'}</span>
                    <strong className="text-text-primary text-xs">{destinationAddress.port}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. CUSTOMS CLEARANCE */}
          {activeTab === 'customs' && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-primary rounded-2xl border border-border-default space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <span className="font-bold text-sm text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-status-success" />
                    {isAr ? 'تقرير وحالة التخليص الجمركي الرسمي' : 'Official Customs Declaration Report'}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-status-success-subtle/30 text-status-success border border-status-success/30 text-[10px] font-bold font-mono">
                    ZATCA Compliance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface-secondary/50 rounded-xl border border-border-default">
                    <span className="text-text-muted text-[11px] block mb-0.5">{isAr ? 'رقم الإقرار الجمركي (Declaration No):' : 'Declaration No:'}</span>
                    <span className="font-mono font-black text-brand-navy dark:text-brand-gold text-sm">{customsDetails.declarationNo}</span>
                  </div>

                  <div className="p-3 bg-surface-secondary/50 rounded-xl border border-border-default">
                    <span className="text-text-muted text-[11px] block mb-0.5">{isAr ? 'منفذ التخليص الجمركي:' : 'Customs Port:'}</span>
                    <span className="font-bold text-text-primary text-xs">{customsDetails.portOfClearance}</span>
                  </div>

                  <div className="p-3 bg-surface-secondary/50 rounded-xl border border-border-default">
                    <span className="text-text-muted text-[11px] block mb-0.5">{isAr ? 'حالة الرسوم والضريبة الجمركية:' : 'Customs Duty Status:'}</span>
                    <span className="font-bold text-status-success text-xs">{customsDetails.dutyStatus}</span>
                  </div>

                  <div className="p-3 bg-surface-secondary/50 rounded-xl border border-border-default">
                    <span className="text-text-muted text-[11px] block mb-0.5">{isAr ? 'نتيجة الفحص والمعاينة:' : 'Inspection Clearance:'}</span>
                    <span className="font-bold text-brand-navy dark:text-brand-gold text-xs">{customsDetails.inspectionStatus}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-surface-secondary/30 border border-border-default rounded-xl space-y-1">
                  <span className="text-brand-navy dark:text-brand-gold text-[11px] font-bold block">{isAr ? 'إرشادات وملاحظات المخلص الجمركي:' : 'Broker Notes & Instructions:'}</span>
                  <p className="text-text-primary text-xs leading-relaxed">{customsDetails.customsNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. SPECIFICATIONS & DIMENSIONS */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-primary border border-border-default rounded-2xl shadow-xs space-y-4">
                <h3 className="font-extrabold text-text-primary text-sm flex items-center gap-2 border-b border-border-default pb-2.5">
                  <Scale className="w-5 h-5 text-brand-navy dark:text-brand-gold" />
                  {isAr ? 'مواصفات وأوزان البضاعة التفصيلية' : 'Detailed Freight Weight & Volume Specs'}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-surface-secondary/50 border border-border-default rounded-xl text-center">
                    <span className="text-text-muted text-[10px] block">{isAr ? 'الوزن الإجمالي القائم:' : 'Gross Weight:'}</span>
                    <span className="font-mono font-black text-sm text-brand-navy dark:text-brand-gold">{freightSpecs.grossWeightKg} kg</span>
                  </div>

                  <div className="p-3 bg-surface-secondary/50 border border-border-default rounded-xl text-center">
                    <span className="text-text-muted text-[10px] block">{isAr ? 'الوزن الحجمي الخاضع:' : 'Volumetric Weight:'}</span>
                    <span className="font-mono font-black text-sm text-status-error">{freightSpecs.volumetricWeightKg} kg</span>
                  </div>

                  <div className="p-3 bg-surface-secondary/50 border border-border-default rounded-xl text-center">
                    <span className="text-text-muted text-[10px] block">{isAr ? 'الحجم الكلي للشحنة:' : 'Total Volume:'}</span>
                    <span className="font-mono font-bold text-xs text-text-primary">{freightSpecs.totalCbm}</span>
                  </div>

                  <div className="p-3 bg-surface-secondary/50 border border-border-default rounded-xl text-center">
                    <span className="text-text-muted text-[10px] block">{isAr ? 'عدد الطبليات/الطرود:' : 'Pallet Count:'}</span>
                    <span className="font-bold text-xs text-text-primary">4 Pallets</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border-default pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{isAr ? 'أبعاد الطرد الفردي (L × W × H):' : 'Package Dimensions:'}</span>
                    <span className="font-mono font-bold text-text-primary">{freightSpecs.lengthCm} × {freightSpecs.widthCm} × {freightSpecs.heightCm} cm</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{isAr ? 'رمز التنسيق الجمركي (HS Code):' : 'HS Tariff Code:'}</span>
                    <span className="font-mono font-bold text-brand-navy dark:text-brand-gold">{freightSpecs.hsCode}</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-secondary/40 border border-border-default rounded-xl">
                  <span className="text-text-muted text-[10px] block mb-1 font-bold">{isAr ? 'وصف البضاعة والمحتويات المقررة:' : 'Cargo Description:'}</span>
                  <p className="text-text-primary text-xs font-medium">{freightSpecs.cargoDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 5. DOCUMENTS & INVOICES */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy text-white rounded-2xl border border-brand-navy/30 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-brand-gold">
                    <CreditCard className="w-4 h-4 text-status-success" />
                    {isAr ? 'فاتورة الشحن والسداد عبر بوابات البنوك' : 'Freight Invoice & Online Payment (Adyen)'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      shipment.paymentStatus === 'PAID'
                        ? 'bg-status-success-subtle/30 text-status-success border border-status-success/40'
                        : 'bg-status-warning-subtle/30 text-status-warning border border-status-warning/40'
                    }`}
                  >
                    {shipment.paymentStatus === 'PAID' ? (isAr ? 'تم السداد بالكامل' : 'Paid') : (isAr ? 'بانتظار التحصيل' : 'Pending Payment')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-white/80">{isAr ? 'إجمالي فاتورة الشحن الشاملة:' : 'Total Freight Amount:'}</span>
                  <span className="font-mono font-black text-brand-gold text-base">
                    {(shipment.declaredValue || shipment.totalCost || 2500).toLocaleString()} SAR
                  </span>
                </div>

                {shipment.paymentStatus !== 'PAID' && onOpenPayment && (
                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenPayment}
                      className="bg-status-success hover:bg-status-success/90 text-white font-bold text-xs gap-1.5 shadow-md px-4 py-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isAr ? 'سداد الفاتورة الآن عبر Adyen' : 'Pay Freight Invoice Now'}</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-border-default pt-2">
                <ShipmentDocumentsManager
                  ownerType="SHIPMENT"
                  ownerId={shipment.id}
                  title={isAr ? 'مستندات ووثائق الشحنة الرسمية' : 'Official Shipment Documents'}
                />
              </div>
            </div>
          )}
        </DrawerBody>

        <DrawerFooter
          isAr={isAr}
          actions={[
            {
              id: 'support',
              labelEn: 'Direct Support',
              labelAr: 'محادثة الدعم المباشر',
              onClick: () => {
                window.open(
                  `https://wa.me/966500000000?text=${encodeURIComponent(`استفسار عن تفاصيل الشحنة رقم ${shipment.trackingNumber}`)}`,
                  '_blank'
                );
              },
              icon: <MessageSquare className="w-4 h-4" />,
            },
            {
              id: 'download-pdf',
              labelEn: isExportingPDF ? 'Exporting...' : 'Download PDF',
              labelAr: isExportingPDF ? 'جاري التصدير...' : 'تحميل PDF',
              onClick: handleExportPDF,
              disabled: isExportingPDF,
              icon: <Download className="w-4 h-4" />,
            },
            ...(onTrack
              ? [
                  {
                    id: 'live-track',
                    labelEn: 'Live Map Tracking',
                    labelAr: 'تتبع الخريطة الحية',
                    onClick: () => {
                      onClose();
                      onTrack(shipment.trackingNumber);
                    },
                    variant: 'primary' as const,
                    icon: <Compass className="w-4 h-4" />,
                  },
                ]
              : []),
          ]}
        />
      </div>
    </EnterpriseDrawer>
  );
};

