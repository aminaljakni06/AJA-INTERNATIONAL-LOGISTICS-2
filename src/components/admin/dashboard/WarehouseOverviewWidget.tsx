import React from 'react';
import { 
  Boxes, 
  Layers, 
  ThermometerSnowflake, 
  ShieldAlert, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronRight, 
  Building2,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { Card } from '../../common/Card';

interface WarehouseOverviewWidgetProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const WarehouseOverviewWidget: React.FC<WarehouseOverviewWidgetProps> = ({
  isAr,
  onNavigate
}) => {
  const warehouseHubs = [
    {
      id: 'riyadh-central',
      nameEn: 'Riyadh Central Logistics Park (Hub CR-101)',
      nameAr: 'مجمع الرياض اللوجستي المركزي (CR-101)',
      capacity: 88,
      totalVolume: '85,000 m³',
      occupied: '74,800 m³',
      available: '10,200 m³',
      docks: '18 / 20 Active',
      coldChainStatus: 'OPTIMAL (-20°C)',
      status: 'HIGH UTILIZATION'
    },
    {
      id: 'jeddah-port',
      nameEn: 'Jeddah Islamic Port Gateway Hub (Hub W-202)',
      nameAr: 'مركز ميناء جدة الإسلامي (W-202)',
      capacity: 78,
      totalVolume: '60,000 m³',
      occupied: '46,800 m³',
      available: '13,200 m³',
      docks: '14 / 16 Active',
      coldChainStatus: 'OPTIMAL (+4°C)',
      status: 'STABLE'
    },
    {
      id: 'dammam-bonded',
      nameEn: 'Dammam King Abdulaziz Bonded Zone (Hub E-303)',
      nameAr: 'المنطقة الإيداعية بالدمام (E-303)',
      capacity: 92,
      totalVolume: '45,000 m³',
      occupied: '41,400 m³',
      available: '3,600 m³',
      docks: '10 / 12 Active',
      coldChainStatus: 'HAZMAT & BONDED',
      status: 'NEAR CAPACITY'
    }
  ];

  const zones = [
    { nameEn: 'General Cargo Storage', nameAr: 'تخزين البضائع العامة', occupied: '65%', color: 'bg-sky-500' },
    { nameEn: 'Cold Chain Pharma & Foods', nameAr: 'سلسلة التبريد والأدوية', occupied: '20%', color: 'bg-[#00F0FF]' },
    { nameEn: 'Hazardous (HAZMAT) Vault', nameAr: 'منطقة المواد الخطرة', occupied: '8%', color: 'bg-amber-500' },
    { nameEn: 'Bonded Customs Storage', nameAr: 'المستودع الجمركي المعتمد', occupied: '7%', color: 'bg-purple-500' }
  ];

  return (
    <Card
      title={isAr ? 'حالة وشغل المستودعات وسلسلة الإمداد (Warehouse Overview - WMS)' : 'Enterprise Warehouse Capacity & Fulfillment (WMS)'}
      subtitle={isAr ? 'متابعة الطاقة الاستيعابية، الأرصفة، وسلسلة التبريد بالمستودعات' : 'Live storage occupancy, dock throughput, and temperature-controlled vaults'}
      headerAction={
        <button
          onClick={() => onNavigate('admin-warehouse')}
          className="text-xs font-bold text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isAr ? 'نظام WMS الكامل ←' : 'Open WMS Control ←'}</span>
        </button>
      }
    >
      <div className="space-y-5">
        {/* Top Capacity Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {warehouseHubs.map((wh) => (
            <div
              key={wh.id}
              onClick={() => onNavigate('admin-warehouse')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 transition-all cursor-pointer shadow-2xs group space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {isAr ? wh.nameAr : wh.nameEn}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Total: {wh.totalVolume}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                  wh.capacity > 90 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {wh.capacity}% Full
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Occupied: {wh.occupied}</span>
                  <span>Available: {wh.available}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B5FFF] to-[#00F0FF] rounded-full transition-all duration-500"
                    style={{ width: `${wh.capacity}%` }}
                  />
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1 text-slate-400">
                  <Boxes className="w-3 h-3 text-[#00F0FF]" />
                  <span>Docks: {wh.docks}</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400 font-bold">
                  <ThermometerSnowflake className="w-3 h-3" />
                  <span>{wh.coldChainStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Storage Zones Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F0FF]" />
            <span>{isAr ? 'توزيع مناطق التخزين والنوعيات' : 'Storage Zone Allocation & Commodity Types'}</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {zones.map((z, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] truncate">
                    {isAr ? z.nameAr : z.nameEn}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Capacity Share</span>
                </div>
                <span className="font-mono font-black text-[#00F0FF] text-sm shrink-0">{z.occupied}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
