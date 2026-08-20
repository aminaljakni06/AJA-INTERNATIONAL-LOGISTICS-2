import React from 'react';
import { 
  Users, 
  Building2, 
  UserCheck, 
  Award, 
  LifeBuoy, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Card } from '../../common/Card';

interface CustomerOverviewWidgetProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const CustomerOverviewWidget: React.FC<CustomerOverviewWidgetProps> = ({
  isAr,
  onNavigate
}) => {
  const topEnterpriseClients = [
    { name: 'SABIC Industrial Corporation', sector: 'Petrochemicals', volume: '142 TEU / mo', tier: 'PLATINUM VIP' },
    { name: 'Saudi Aramco Energy Operations', sector: 'Energy & Oil', volume: '98 Heavy Freight / mo', tier: 'PLATINUM VIP' },
    { name: 'Olayan Commercial Group', sector: 'FMCG & Logistics', volume: '76 Trailers / mo', tier: 'GOLD' },
    { name: 'Ma\'aden Mining & Metals', sector: 'Mining & Metals', volume: '64 Flatbed Cargo / mo', tier: 'GOLD' },
  ];

  return (
    <Card
      title={isAr ? 'حسابات ورضا العملاء المؤسسيين (Customer 360 & CSAT)' : 'Corporate Client Relations & Enterprise Accounts (Customer 360)'}
      subtitle={isAr ? 'متابعة كبار العملاء التجاريين، تذاكر الدعم، ومعدل الاستبقاء' : 'Top enterprise accounts, corporate retention rates, CSAT metrics, and key client telemetry'}
      headerAction={
        <button
          onClick={() => onNavigate('admin-customers')}
          className="text-xs font-bold text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isAr ? 'دليل العملاء 360 ←' : 'Open Customer 360 ←'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Key Client Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
              {isAr ? 'العملاء الجدد هذا الشهر' : 'New Enterprise Accounts'}
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">+18 Clients</div>
            <span className="text-[10px] text-emerald-400 font-bold">+24.5% Growth</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
              {isAr ? 'معدل استبقاء العملاء' : 'Client Retention Rate'}
            </span>
            <div className="text-lg font-black text-[#00F0FF] font-mono">96.8%</div>
            <span className="text-[10px] text-slate-400">Industry Leader</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
              {isAr ? 'تقييم رضا العملاء CSAT' : 'CSAT Satisfaction Rating'}
            </span>
            <div className="text-lg font-black text-amber-400 font-mono flex items-center gap-1">
              <span>4.9 / 5.0</span>
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-[10px] text-slate-400">Based on 1,280 PODs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">
              {isAr ? 'قضايا الدعم المفتوحة' : 'Support SLA Health'}
            </span>
            <div className="text-lg font-black text-purple-400 font-mono">9 Active</div>
            <span className="text-[10px] text-purple-300">Avg Resolution: 12m</span>
          </div>
        </div>

        {/* Top Enterprise Accounts Table */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'كبار العملاء الحصريين (Key Strategic Accounts)' : 'Key Strategic Accounts & Contract Volume'}</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Top 4 Tier-1 Partners</span>
          </div>

          <div className="space-y-2">
            {topEnterpriseClients.map((client, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('admin-customers')}
                className="p-3 rounded-xl bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 transition-colors cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-[#00F0FF] flex items-center justify-center font-bold font-mono border border-slate-200 dark:border-white/10">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{client.name}</span>
                    <span className="text-[10px] text-slate-400">{client.sector} • {client.volume}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {client.tier}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
