import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  MapPin, 
  Sun, 
  CloudSun, 
  Activity, 
  CheckCircle2, 
  Plus, 
  Package, 
  Download, 
  RefreshCw, 
  Sparkles,
  ShieldCheck,
  Radio,
  Sliders,
  Globe
} from 'lucide-react';
import { Button } from '../../common/Button';

interface ExecutiveWelcomeProps {
  userName: string;
  userRole: string;
  isAr: boolean;
  newQuotesCount: number;
  activeShipmentsCount: number;
  onNavigate: (tab: string) => void;
  onExportReport: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const ExecutiveWelcome: React.FC<ExecutiveWelcomeProps> = ({
  userName,
  userRole,
  isAr,
  newQuotesCount,
  activeShipmentsCount,
  onNavigate,
  onExportReport,
  onRefresh,
  refreshing
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [selectedWorkspace, setSelectedWorkspace] = useState('Riyadh HQ Gateway (Hub CR-101)');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time and date
  const formattedTime = time.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Time-of-day greeting
  const hour = time.getHours();
  let greetingEn = 'Good morning';
  let greetingAr = 'صباح الخير';
  if (hour >= 12 && hour < 17) {
    greetingEn = 'Good afternoon';
    greetingAr = 'مساء الخير';
  } else if (hour >= 17) {
    greetingEn = 'Good evening';
    greetingAr = 'مساء الخير';
  }

  return (
    <div className="bg-gradient-to-r from-[#030712] via-[#0B172A] to-[#082F49] text-white p-6 sm:p-8 rounded-3xl border border-[#00F0FF]/30 shadow-2xl relative overflow-hidden transition-all">
      {/* Ambient background glowing effects */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-1/3 w-64 h-64 bg-[#0B5FFF]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header Bar: Greetings & Live Status Badges */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{isAr ? 'مركز العمليات والقيادة التنفيذية' : 'Executive Operations Center'}</span>
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{isAr ? 'الأنظمة متصلة 100%' : 'ALL SYSTEMS OPERATIONAL'}</span>
              </span>
              <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-[11px] font-mono">
                SLA 99.98%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight pt-1">
              {isAr ? `${greetingAr}، ${userName}` : `${greetingEn}, ${userName}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {isAr
                ? 'أهلاً بك في غرفة القيادة الرئيسية لأجا العالمية للخدمات اللوجستية. نظرة شمولية وحية على الشحنات، المالية، والأسطول.'
                : 'Welcome to the AJA International Logistics Central Command. Live executive oversight across operations, finance, and telematics.'}
            </p>
          </div>

          {/* Live Clock & Workspace Info Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#0B172A]/80 border border-white/10 p-3.5 rounded-2xl shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-sky-300">
              <Clock className="w-5 h-5 text-[#00F0FF] shrink-0" />
              <div>
                <div className="text-sm font-mono font-black text-white dir-ltr">{formattedTime}</div>
                <div className="text-[10px] text-slate-400 font-medium dir-ltr">{formattedDate} • AST (UTC+3)</div>
              </div>
            </div>
            
            <div className="hidden sm:block h-8 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white truncate max-w-[180px]">AJA Logistics Ltd.</div>
                <div className="text-[10px] text-sky-300 truncate max-w-[180px]">{selectedWorkspace}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Weather & System Clearance Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Weather Container Placeholder */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{isAr ? 'الرياض • مركز اللوجستيات' : 'Riyadh Hub Weather'}</span>
                  <span className="text-[10px] text-amber-300 font-mono">34°C</span>
                </div>
                <div className="text-[10px] text-slate-300">
                  {isAr ? 'رياح الميناء: 12 عقدة • حالة البحر: مستقرة' : 'Port Winds: 12 kt • Sea Conditions: Calm'}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              OPTIMAL
            </span>
          </div>

          {/* Customs Gateway Status */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">
                  {isAr ? 'منصة التخليص الجمركي' : 'ZATCA & Customs API'}
                </div>
                <div className="text-[10px] text-emerald-300">
                  {isAr ? 'زكاة وضريبة والدخل: متصل مباشر' : 'Fatoora Phase 2 Live Sync'}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          {/* Active Workspaces & Action Hub */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">
                  {isAr ? 'الموانئ والمنافذ الفعالة' : 'Active Port Gateways'}
                </div>
                <div className="text-[10px] text-cyan-300">
                  {isAr ? 'جدة، الدمام، الملك عبد الله، نيوم' : 'Jeddah, Dammam, KAEC, NEOM'}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              4 HUBS
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
            <span>{isAr ? 'التحديث الآلي مفعل كل 30 ثانية' : 'Auto-refresh active (30s interval)'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => onNavigate('admin-quotes')}
              className="flex-1 sm:flex-initial text-xs font-black bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8] shadow-[0_0_15px_rgba(0,240,255,0.25)] min-h-[40px] px-4"
            >
              <Plus className="w-4 h-4 text-[#030712]" />
              <span>{isAr ? 'طلبات الأسعار' : 'New Quote Requests'} ({newQuotesCount})</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate('admin-shipments')}
              className="flex-1 sm:flex-initial text-xs font-bold text-white border-white/20 hover:bg-white/10 min-h-[40px] px-4"
            >
              <Package className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'إدارة الشحنات' : 'Active Shipments'} ({activeShipmentsCount})</span>
            </Button>

            <button
              onClick={onExportReport}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all cursor-pointer min-h-[40px] text-xs font-semibold flex items-center gap-1.5"
              title={isAr ? 'تصدير تقرير العمليات التنفيذي PDF' : 'Export Executive Operations PDF'}
            >
              <Download className="w-4 h-4 text-[#00F0FF]" />
              <span className="hidden sm:inline">{isAr ? 'تصدير PDF' : 'Export PDF'}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all cursor-pointer min-h-[40px]"
              title={isAr ? 'تحديث البيانات' : 'Refresh Data'}
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
