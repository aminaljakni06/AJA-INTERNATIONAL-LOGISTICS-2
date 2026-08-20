import React, { useState, useEffect } from 'react';
import { Package, Search, MapPin, Copy, Check, Share2, MessageSquare, ArrowUpRight, Clock, ShieldCheck, CreditCard, Receipt, Truck, Anchor, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShipmentDocumentsManager } from '../../components/documents/ShipmentDocumentsManager';
import { AdyenCheckoutModal } from '../../components/payment/AdyenCheckoutModal';
import { ShipmentDetailDrawer } from '../../components/common/ShipmentDetailDrawer';
import { DateRangePicker, DateRange } from '../../components/common/DateRangePicker';
import { useAuth } from '../../context/AuthContext';

// Visual Horizontal Progress Timeline Component using Enterprise Colors (#082F49, #0F4C75, #EA580C)
const SHIPMENT_STAGES = [
  { id: 'PENDING', labelAr: 'قيد الانتظار والربط', labelEn: 'Pending / Booked', icon: Package, percent: 20 },
  { id: 'LOADING', labelAr: 'التحميل والميناء', labelEn: 'Loading & Port', icon: Anchor, percent: 40 },
  { id: 'IN_TRANSIT', labelAr: 'في الطريق الدولي', labelEn: 'In Transit', icon: Truck, percent: 60 },
  { id: 'CUSTOMS', labelAr: 'التخليص الجمركي', labelEn: 'Customs Clearance', icon: ShieldCheck, percent: 80 },
  { id: 'DELIVERED', labelAr: 'تم التسليم النهائي', labelEn: 'Delivered', icon: MapPin, percent: 100 },
];

const getStageIndex = (statusStr: string): number => {
  const s = (statusStr || '').toUpperCase().trim();
  if (s.includes('DELIVER') || s.includes('COMPLET') || s === 'تم التسليم') return 4;
  if (s.includes('CUSTOM') || s.includes('INSPECTION') || s === 'التخليص الجمركي') return 3;
  if (s.includes('TRANSIT') || s.includes('WAY') || s.includes('PORT') || s.includes('SHIPPED') || s === 'في الطريق') return 2;
  if (s.includes('LOAD') || s.includes('PREPAR') || s.includes('PICKUP') || s === 'قيد التحميل') return 1;
  return 0; // PENDING, BOOKED, RECEIVED, NEW
};

const ShipmentProgressTimeline: React.FC<{ status: string; estimatedDelivery?: string; compact?: boolean }> = ({ status, estimatedDelivery, compact = false }) => {
  const activeIdx = getStageIndex(status);
  const currentStage = SHIPMENT_STAGES[activeIdx];
  const progressPercent = Math.round(((activeIdx + 1) / SHIPMENT_STAGES.length) * 100);
  const deliveryDateDisplay = estimatedDelivery || '2026-08-05';

  if (compact) {
    return (
      <div className="space-y-2 w-full min-w-[200px] max-w-xs">
        {/* Horizontal Progress Header */}
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-[#082F49] flex items-center gap-1 font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-pulse" />
            {currentStage.labelAr}
          </span>
          <span className="font-mono text-[#0F4C75] font-black bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
            {progressPercent}%
          </span>
        </div>

        {/* Dynamic Horizontal Progress Track */}
        <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#082F49] via-[#0F4C75] to-[#EA580C] transition-all duration-700 ease-out rounded-full shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Horizontal Milestone Ticks */}
        <div className="flex items-center justify-between px-0.5">
          {SHIPMENT_STAGES.map((stg, i) => {
            const isDone = i <= activeIdx;
            const isCurrent = i === activeIdx;
            return (
              <div
                key={stg.id}
                className="flex flex-col items-center"
                title={`${stg.labelAr} (${stg.labelEn})`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-[#EA580C] ring-2 ring-[#EA580C]/30 scale-125'
                      : isDone
                      ? 'bg-[#082F49]'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Estimated Arrival Badge */}
        <div className="flex items-center justify-between text-[10px] font-bold text-[#082F49] bg-sky-50/90 px-2 py-1 rounded-lg border border-sky-200">
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-3 h-3 text-[#0F4C75]" />
            <span>التسليم المتوقع:</span>
          </span>
          <span className="font-mono font-black text-[#082F49]">{deliveryDateDisplay}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-br from-[#082F49] to-[#0F4C75] text-white rounded-2xl border border-[#0F4C75] shadow-xl space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-md">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span>مخطط السير المباشر للشحنة</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-sky-200">
                {currentStage.labelEn}
              </span>
            </h4>
            <p className="text-[11px] text-sky-200/80">
              تتبع افقي تفاعلي لجميع مراحل الشحن والتخليص والتسليم
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-[#EA580C] text-white shadow-sm border border-orange-400/30">
            {progressPercent}% مكتمل
          </span>
        </div>
      </div>

      {/* Prominent Estimated Delivery Date Indicator */}
      <div className="p-3.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#082F49] text-white flex items-center justify-center shrink-0 border border-sky-400/30 shadow-sm">
            <Clock className="w-5 h-5 text-[#EA580C]" />
          </div>
          <div>
            <span className="text-[10px] text-sky-300 font-bold block">موعد الوصول المتوقع (Estimated Delivery)</span>
            <span className="text-sm font-mono font-black text-white">{deliveryDateDisplay}</span>
          </div>
        </div>

        <div className="text-left">
          <span className="px-2.5 py-1 rounded-lg text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/30 inline-block">
            جدول موثّق آلياً
          </span>
        </div>
      </div>

      {/* Horizontal Multi-Node Track */}
      <div className="relative pt-3 pb-2 px-2">
        {/* Progress Line Behind Nodes */}
        <div className="absolute top-[28px] left-8 right-8 h-2 bg-slate-800/80 rounded-full z-0 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-[#0F4C75] to-[#EA580C] transition-all duration-700 ease-out rounded-full shadow-lg"
            style={{ width: `${(activeIdx / (SHIPMENT_STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {/* Milestone Stage Nodes */}
        <div className="relative z-10 flex items-center justify-between">
          {SHIPMENT_STAGES.map((stage, idx) => {
            const IconComponent = stage.icon;
            const isCompleted = idx < activeIdx;
            const isActive = idx === activeIdx;

            return (
              <div key={stage.id} className="flex flex-col items-center gap-2 text-center flex-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 font-bold border-2 ${
                    isActive
                      ? 'bg-[#EA580C] text-white border-white ring-4 ring-[#EA580C]/40 scale-110 shadow-2xl'
                      : isCompleted
                      ? 'bg-[#0F4C75] text-sky-200 border-sky-400/50 shadow-md'
                      : 'bg-slate-900/90 text-slate-500 border-slate-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="space-y-0.5">
                  <span
                    className={`text-[10px] sm:text-xs font-bold block max-w-[80px] sm:max-w-[100px] leading-tight ${
                      isActive
                        ? 'text-white font-black scale-105'
                        : isCompleted
                        ? 'text-sky-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.labelAr}
                  </span>
                  <span className="text-[9px] font-mono text-slate-300/80 block">
                    {stage.labelEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const CustomerShipments: React.FC<{ onTrack: (trackingNum: string) => void }> = ({ onTrack }) => {
  const { token } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [adyenShipmentModalOpen, setAdyenShipmentModalOpen] = useState(false);

  const fetchShipments = () => {
    if (!token) return;
    fetch('/api/shipments', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setShipments(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShipments();
  }, [token]);

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenDetail = async (shp: any) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/shipments/${shp.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fullData = await res.json();
        setSelectedShipment(fullData);
      } else {
        setSelectedShipment(shp);
      }
    } catch {
      setSelectedShipment(shp);
    }
  };

  if (loading) return <LoadingSpinner label="جاري تحميل قائمة الشحنات الخاصة بك..." />;

  const filtered = shipments.filter((s) => {
    const q = filter.toLowerCase();
    const matchesSearch =
      !filter ||
      (s.trackingNumber && s.trackingNumber.toLowerCase().includes(q)) ||
      (s.pickupLocation && s.pickupLocation.toLowerCase().includes(q)) ||
      (s.deliveryLocation && s.deliveryLocation.toLowerCase().includes(q)) ||
      (s.origin && s.origin.toLowerCase().includes(q)) ||
      (s.destination && s.destination.toLowerCase().includes(q)) ||
      (s.shipmentType && s.shipmentType.toLowerCase().includes(q));

    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const sDateVal = s.createdAt || s.createdDate || s.estimatedArrivalDate || s.estimatedDelivery || s.date;
      if (sDateVal) {
        const itemDateStr = typeof sDateVal === 'string' ? sDateVal.substring(0, 10) : '';
        if (itemDateStr) {
          if (dateRange.startDate && itemDateStr < dateRange.startDate) matchesDate = false;
          if (dateRange.endDate && itemDateStr > dateRange.endDate) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <h2 className="text-xl font-black text-text-primary">شحناتي المحفوظة ومتابعة خط السير</h2>
          <p className="text-xs text-text-secondary">متابعة فورية لجميع الشحنات النشطة والمكتملة الخاصة بحسابك</p>
        </div>
      </div>

      {/* Filter Toolbar Container */}
      <div className="p-4 rounded-2xl bg-surface-primary border border-border-default shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="بحث برقم التتبع، المصدر، أو الوجهة..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pr-9 pl-3.5 py-2 text-xs rounded-xl border border-border-default focus:border-border-focus focus:ring-2 focus:ring-border-focus/20 bg-surface-primary text-text-primary placeholder:text-text-muted transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            isAr={true}
            placeholder="تصفية حسب نطاق التاريخ"
          />
        </div>
      </div>

      {/* Featured Active Shipment Horizontal Progress Visualization */}
      {filtered.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1.5 text-[#082F49] font-black">
              <Truck className="w-4 h-4 text-[#EA580C]" />
              <span>نظرة عامة على تقدم الشحنة النشطة الحالية:</span>
              <span className="font-mono font-black text-[#0F4C75] bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {(filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).trackingNumber}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
              {(filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).pickupLocation || (filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).origin} ← {(filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).deliveryLocation || (filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).destination}
            </span>
          </div>

          <ShipmentProgressTimeline
            status={(filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).currentStatus || (filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).status}
            estimatedDelivery={(filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).estimatedArrivalDate || (filtered.find(s => (s.currentStatus || s.status || '').toUpperCase() !== 'DELIVERED') || filtered[0]).estimatedDelivery}
            compact={false}
          />
        </div>
      )}

      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">لا توجد شحنات مسجلة حالياً</p>
            <p className="text-xs text-slate-400">عند الموافقة على طلبات الأسعار أو الشحن المباشر ستظهر شحناتك هنا تلقائياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">رقم التتبع</th>
                  <th className="p-3">نوع الخدمة</th>
                  <th className="p-3">المسار (المصدر ← الوجهة)</th>
                  <th className="p-3">الحالة الحالية</th>
                  <th className="p-3">الموقع الحالي</th>
                  <th className="p-3">التاريخ المتوقع</th>
                  <th className="p-3">إجراءات والتتبع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((shp) => (
                  <tr
                    key={shp.id}
                    onClick={() => handleOpenDetail(shp)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="p-3 font-mono font-bold text-[#082F49] dark:text-sky-400">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:underline">{shp.trackingNumber}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(shp.trackingNumber, shp.id);
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title="نسخ رقم التتبع"
                        >
                          {copiedId === shp.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{shp.shipmentType || shp.serviceType}</td>
                    <td className="p-3 text-slate-800">
                      {shp.pickupLocation || shp.origin} ← {shp.deliveryLocation || shp.destination}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1.5">
                        <StatusBadge type="shipment" status={shp.currentStatus || shp.status} />
                        <ShipmentProgressTimeline
                          status={shp.currentStatus || shp.status}
                          estimatedDelivery={shp.estimatedArrivalDate || shp.estimatedDelivery}
                          compact={true}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {shp.currentLocation || shp.pickupLocation || 'غير محدد'}
                    </td>
                    <td className="p-3 font-mono">
                      {shp.estimatedArrivalDate || shp.estimatedDelivery || '-'}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenDetail(shp)}
                          className="text-[11px] font-bold gap-1 py-1 px-2.5 bg-[#082F49] hover:bg-[#0F4C75]"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>التفاصيل العميقة والخط الزمني</span>
                        </Button>
                        <button
                          onClick={() => onTrack(shp.trackingNumber)}
                          className="text-[11px] font-bold text-[#0F4C75] hover:underline flex items-center gap-0.5"
                          title="الانتقال للتتبع المباشر"
                        >
                          تتبع حياً <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Shipment Deep-Dive Slide-Over Drawer */}
      <ShipmentDetailDrawer
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        shipment={selectedShipment}
        onTrack={onTrack}
        onOpenPayment={() => setAdyenShipmentModalOpen(true)}
      />

      {/* Adyen Payment Modal */}
      {selectedShipment && (
        <AdyenCheckoutModal
          isOpen={adyenShipmentModalOpen}
          onClose={() => setAdyenShipmentModalOpen(false)}
          referenceNumber={selectedShipment.trackingNumber || selectedShipment.id}
          entityType="SHIPMENT"
          entityId={selectedShipment.id}
          amount={Number(selectedShipment.declaredValue || selectedShipment.totalCost || 2500)}
          currency="SAR"
          description={`سداد رسوم الشحنة وتكلفة النقل رقم (${selectedShipment.trackingNumber || selectedShipment.id})`}
          onPaymentSuccess={() => {
            fetchShipments();
            setSelectedShipment(null);
          }}
        />
      )}
    </div>
  );
};
