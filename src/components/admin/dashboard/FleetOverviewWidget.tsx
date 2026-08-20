import React from 'react';
import { 
  Truck, 
  Navigation, 
  Users, 
  Wrench, 
  Fuel, 
  MapPin, 
  Radio, 
  Activity, 
  ChevronRight,
  Globe,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Card } from '../../common/Card';

interface FleetOverviewWidgetProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const FleetOverviewWidget: React.FC<FleetOverviewWidgetProps> = ({
  isAr,
  onNavigate
}) => {
  const fleetStats = [
    {
      labelEn: 'Total Fleet Size',
      labelAr: 'إجمالي أسطول الشاحنات',
      val: '210 Heavy Vehicles',
      subEn: 'Mercedes Actros & Volvo FH',
      subAr: 'مرسيدس أكتروس وفولفو FH',
      icon: Truck,
      color: 'sky'
    },
    {
      labelEn: 'Active Vehicles on Route',
      labelAr: 'الشاحنات بالرحلات المباشرة',
      val: '142 Units (67.6%)',
      subEn: 'Satellite GPS OBD-II Active',
      subAr: 'متصل بالتتبع الفضائي المباشر',
      icon: Navigation,
      color: 'emerald'
    },
    {
      labelEn: 'Available Fleet at Hubs',
      labelAr: 'الشاحنات الجاهزة بالمراكز',
      val: '54 Units (25.7%)',
      subEn: 'Ready for instant dispatch',
      subAr: 'جاهزة للانطلاق الفوري',
      icon: Zap,
      color: 'cyan'
    },
    {
      labelEn: 'Scheduled Maintenance',
      labelAr: 'الشاحنات بالصيانة الدورية',
      val: '14 Units (6.7%)',
      subEn: 'Routine service & oil check',
      subAr: 'صيانة دورية وفحص سلامة',
      icon: Wrench,
      color: 'amber'
    },
    {
      labelEn: 'Drivers Assigned / Active',
      labelAr: 'السائقون المعتمدون بالرحلات',
      val: '174 Certified Drivers',
      subEn: 'Fatigue monitoring active',
      subAr: 'نظام مراقبة الإرهاق والسلامة مفعل',
      icon: Users,
      color: 'purple'
    },
    {
      labelEn: 'Average Fuel Efficiency',
      labelAr: 'كفاءة استهلاك الوقود',
      val: '94.2% Optimal',
      subEn: 'Ecofleet route optimization',
      subAr: 'مسارات صديقة للبيئة والوقود',
      icon: Fuel,
      color: 'emerald'
    }
  ];

  return (
    <Card
      title={isAr ? 'حالة وتتبع أسطول الشاحنات والرحلات (Fleet Telematics Overview)' : 'Fleet Telematics & Highway Logistics Overview'}
      subtitle={isAr ? 'مراقبة حركة المركبات الثقيلة، السائقين، كفاءة الوقود والصيانة' : 'Live vehicle availability, satellite telematics, driver duty logs, and route map'}
      headerAction={
        <button
          onClick={() => onNavigate('admin-fleet')}
          className="text-xs font-bold text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isAr ? 'خريطة الأسطول الحية ←' : 'Open Fleet Telematics ←'}</span>
        </button>
      }
    >
      <div className="space-y-5">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {fleetStats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate('admin-fleet')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-[#0F4C75]/20 text-[#00F0FF] flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight block truncate">
                    {isAr ? s.labelAr : s.labelEn}
                  </span>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5 truncate">
                    {s.val}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 mt-2 block truncate">
                  {isAr ? s.subAr : s.subEn}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spatial Route Map Canvas Placeholder Container */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden text-white space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-10 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {isAr ? 'شبكة التتبع المكاني المباشر للرحلات (Spatial Telematics Map Topology)' : 'Saudi Highway Telematics Spatial Topology'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isAr ? 'متابعة حية لمسارات الرياض - جدة - الدمام - الموانئ' : 'Live arterial highway tracking across Riyadh, Jeddah, Dammam & NEOM routes'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>142 VEHICLES ACTIVE ON ROUTE</span>
            </div>
          </div>

          {/* Interactive Map Visualizer Box */}
          <div className="h-44 w-full rounded-xl bg-[#030712] border border-white/10 relative overflow-hidden flex items-center justify-center">
            {/* Grid Mesh Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            {/* Simulated Animated Highway Route Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-cyan-500/40 stroke-2 fill-none">
              <path d="M 50 120 Q 200 40 380 90 T 700 60" className="animate-pulse" strokeDasharray="6 6" />
              <path d="M 100 30 Q 300 130 550 70 T 800 120" stroke="#10B981" opacity="0.6" strokeDasharray="4 4" />
            </svg>

            {/* Route Hub Markers */}
            <div className="absolute left-[15%] top-[30%] flex items-center gap-1 bg-[#0B172A] p-1.5 rounded-lg border border-cyan-500/40 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Jeddah Port Hub (42 Trucks)</span>
            </div>

            <div className="absolute left-[50%] top-[45%] flex items-center gap-1 bg-[#0B172A] p-1.5 rounded-lg border border-amber-500/40 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Riyadh HQ Central (68 Trucks)</span>
            </div>

            <div className="absolute right-[15%] top-[25%] flex items-center gap-1 bg-[#0B172A] p-1.5 rounded-lg border border-emerald-500/40 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dammam Gateway (32 Trucks)</span>
            </div>

            <div className="relative z-10 text-center space-y-1">
              <p className="text-xs font-mono text-slate-300">
                {isAr ? 'الخريطة التفاعلية للرحلات متصلة بنظام GPS الفضائي' : 'Interactive Spatial Route Telematics Engine Active'}
              </p>
              <button
                onClick={() => onNavigate('admin-fleet')}
                className="px-3 py-1 bg-[#00F0FF] text-[#030712] font-black text-[11px] rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                {isAr ? 'استعراض التتبع الفضائي للأسطول 3D' : 'Open 3D Fleet Spatial View'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
