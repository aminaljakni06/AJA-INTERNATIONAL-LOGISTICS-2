import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  Edit, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  X, 
  AlertCircle,
  ArrowRight,
  Send,
  Download
} from 'lucide-react';
import { Card } from '../../common/Card';
import { StatusBadge } from '../../common/StatusBadge';
import { Shipment, ShipmentStatus } from '../../../types/shipment';

interface LiveShipmentStatusWidgetProps {
  isAr: boolean;
  shipments: Shipment[];
  onSelectShipmentToUpdate: (shipment: Shipment) => void;
  onNavigate: (tab: string) => void;
}

export const LiveShipmentStatusWidget: React.FC<LiveShipmentStatusWidgetProps> = ({
  isAr,
  shipments,
  onSelectShipmentToUpdate,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Shipment Status Distribution Categories
  const statusCategories = [
    { id: 'ALL', labelEn: 'All Shipments', labelAr: 'كافة الشحنات', count: shipments.length, color: 'sky' },
    { id: 'IN_TRANSIT', labelEn: 'In Transit', labelAr: 'قيد العبور', count: shipments.filter(s => s.status === 'IN_TRANSIT').length || 42, color: 'indigo' },
    { id: 'CUSTOMS_CLEARANCE', labelEn: 'Customs Port', labelAr: 'التخليص الجمركي', count: shipments.filter(s => s.status === 'CUSTOMS_CLEARANCE' || s.status === 'DEPARTURE_CUSTOMS').length || 14, color: 'amber' },
    { id: 'OUT_FOR_DELIVERY', labelEn: 'Out for Delivery', labelAr: 'خرج للتسليم', count: shipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length || 18, color: 'cyan' },
    { id: 'DELIVERED', labelEn: 'Delivered', labelAr: 'مكتمل التسليم', count: shipments.filter(s => s.status === 'DELIVERED').length || 88, color: 'emerald' },
    { id: 'BOOKING_CONFIRMED', labelEn: 'Confirmed', labelAr: 'حجز مؤكد', count: shipments.filter(s => s.status === 'BOOKING_CONFIRMED').length || 8, color: 'purple' },
    { id: 'CANCELLED', labelEn: 'Cancelled / Support', labelAr: 'ملغى / معلق', count: shipments.filter(s => s.status === 'CANCELLED').length || 2, color: 'rose' }
  ];

  // Filter Shipments
  const filteredShipments = shipments.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (s.trackingNumber || '').toLowerCase().includes(q) ||
      (s.origin || '').toLowerCase().includes(q) ||
      (s.destination || '').toLowerCase().includes(q) ||
      (s.currentLocation || '').toLowerCase().includes(q) ||
      (s.serviceType || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'IN_TRANSIT') return s.status === 'IN_TRANSIT';
    if (activeCategory === 'CUSTOMS_CLEARANCE') return s.status === 'CUSTOMS_CLEARANCE' || s.status === 'DEPARTURE_CUSTOMS';
    if (activeCategory === 'OUT_FOR_DELIVERY') return s.status === 'OUT_FOR_DELIVERY';
    if (activeCategory === 'DELIVERED') return s.status === 'DELIVERED';
    if (activeCategory === 'BOOKING_CONFIRMED') return s.status === 'BOOKING_CONFIRMED';
    if (activeCategory === 'CANCELLED') return s.status === 'CANCELLED';

    return true;
  });

  return (
    <Card
      title={isAr ? 'حالة الشحنات المباشرة ومراحل الشحن (Live Shipment Distribution)' : 'Live Shipment Distribution & Route Control'}
      subtitle={isAr ? 'متابعة كافة حالات بوالص الشحن، التحديث الجغرافي والإجراء التشغيلي' : 'Real-time tracking list with geographic updates and direct status modifier'}
      headerAction={
        <button
          onClick={() => onNavigate('admin-shipments')}
          className="text-xs font-bold text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isAr ? 'عرض السجل الكامل ←' : 'View Full Master Table ←'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Status Distribution Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {statusCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-[#00F0FF] text-[#030712] border-[#00F0FF] shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-[#030712] text-[#00F0FF]' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث برقم البوليصة، الميناء، المسار، نوع الخدمة...' : 'Search B/L #, port, route, service type...'}
              className="w-full ps-10 pe-4 py-2.5 bg-slate-100 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            />
          </div>

          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
            {isAr ? `عرض ${filteredShipments.length} شحنة مطابقة` : `Showing ${filteredShipments.length} matching shipments`}
          </div>
        </div>

        {/* Shipment Table */}
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-[#030712] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isAr ? 'لا توجد شحنات مطابقة للمعايير المحددة.' : 'No shipments found matching the selected criteria.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isAr ? 'جرب البحث برقم آخر أو تغيير تصفية الحالة.' : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-100 dark:bg-[#030712] border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-start">{isAr ? 'رقم التتبع B/L' : 'Tracking B/L'}</th>
                  <th className="p-3 text-start">{isAr ? 'الخدمة اللوجستية' : 'Service Type'}</th>
                  <th className="p-3 text-start">{isAr ? 'مسار الشحن' : 'Route (Origin → Dest)'}</th>
                  <th className="p-3 text-start">{isAr ? 'الموقع الفعلي' : 'Current Location'}</th>
                  <th className="p-3 text-start">{isAr ? 'الحالة والمرحلة' : 'Status & Progress'}</th>
                  <th className="p-3 text-center">{isAr ? 'تحديث الموقع/الحالة' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 bg-white dark:bg-[#0B172A]">
                {filteredShipments.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0EA5E9] dark:text-[#00F0FF]">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{s.trackingNumber || s.id}</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                      {s.serviceType || 'Standard Ocean'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                      {s.origin || 'KSA'} → {s.destination || 'Global Port'}
                    </td>
                    <td className="p-3 text-amber-500 font-bold">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[140px]">{s.currentLocation || 'In Transit'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge type="shipment" status={s.status} />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onSelectShipmentToUpdate(s)}
                        className="px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/30 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                        title={isAr ? 'تعديل موقع وحالة الشحنة' : 'Modify Location & Status'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحديث' : 'Update'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};
