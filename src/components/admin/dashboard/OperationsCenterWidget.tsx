import React from 'react';
import { 
  Radio, 
  Truck, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Boxes, 
  Navigation, 
  Zap, 
  ChevronRight,
  Anchor,
  Plane,
  Server
} from 'lucide-react';
import { Card } from '../../common/Card';

interface OperationsCenterWidgetProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const OperationsCenterWidget: React.FC<OperationsCenterWidgetProps> = ({
  isAr,
  onNavigate
}) => {
  const opsCards = [
    {
      id: 'transit',
      titleEn: 'Shipments in Transit',
      titleAr: 'شحنات قيد العبور المباشر',
      count: '86',
      subEn: '42 Sea • 32 Land • 12 Air',
      subAr: '42 بحري • 32 بري • 12 جوي',
      status: 'ON TIME',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Truck,
      tab: 'admin-shipments'
    },
    {
      id: 'awaiting-pickup',
      titleEn: 'Awaiting Pickup & Loading',
      titleAr: 'في انتظار الاستلام والتحميل',
      count: '18',
      subEn: 'Suppliers ready in Dammam & Jeddah',
      subAr: 'جاهزة لدى الموردين بالدمام وجدة',
      status: 'READY',
      statusColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: Clock,
      tab: 'admin-tms'
    },
    {
      id: 'pending-customs',
      titleEn: 'Port Customs Clearance',
      titleAr: 'التخليص الجمركي بالموانئ',
      count: '14',
      subEn: 'Jeddah Port: 8 • King Abdulaziz Port: 6',
      subAr: 'ميناء جدة: 8 • ميناء الملك عبد العزيز: 6',
      status: 'IN INSPECTION',
      statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Anchor,
      tab: 'admin-controltower'
    },
    {
      id: 'delayed-shipments',
      titleEn: 'Delayed / Route Exception',
      titleAr: 'حالات تأخير وتغير مسار',
      count: '3',
      subEn: 'Weather delay near Bab al-Mandab',
      subAr: 'تأخير بسبب الأحوال الجوية بمضيق باب المندب',
      status: 'CRITICAL',
      statusColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
      icon: AlertTriangle,
      tab: 'admin-controltower'
    },
    {
      id: 'delivered-today',
      titleEn: 'Delivered Today (POD)',
      titleAr: 'تم تسليمها اليوم بنجاح',
      count: '24',
      subEn: 'Confirmed by digital POD signature',
      subAr: 'مؤكدة بالتوقيع الرقمي والتسلم',
      status: 'COMPLETED',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      tab: 'admin-shipments'
    },
    {
      id: 'high-priority',
      titleEn: 'High Priority V.I.P Orders',
      titleAr: 'طلب أولوية خاصة VIP',
      count: '7',
      subEn: 'Cold chain pharmaceuticals & high-value',
      subAr: 'أدوية سلسلة التبريد وشحنات عالية القيمة',
      status: 'MONITORED',
      statusColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: Zap,
      tab: 'admin-shipments'
    },
    {
      id: 'warehouse-activity',
      titleEn: 'Warehouse Dock Activity',
      titleAr: 'نشاط أرصفة المستودعات',
      count: '12 Docks Active',
      subEn: 'Inbound: 18 TEU • Outbound: 24 TEU',
      subAr: 'وارد: 18 حاوية • صادر: 24 حاوية',
      status: 'NORMAL',
      statusColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: Boxes,
      tab: 'admin-warehouse'
    },
    {
      id: 'fleet-status',
      titleEn: 'Fleet GPS Telematics',
      titleAr: 'مراقبة تتبع الأسطول الحي',
      count: '142 Route Vehicles',
      subEn: '100% OBD-II and Satellite active',
      subAr: 'متصلة بالتتبع الفضائي OBD-II بنسبة 100%',
      status: '100% ONLINE',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Navigation,
      tab: 'admin-fleet'
    }
  ];

  return (
    <Card
      title={isAr ? 'غرفة العمليات المباشرة والتحكم اللوجستي (Operations Center)' : 'Central Operations & Logistics Tower'}
      subtitle={isAr ? 'نظرة فورية على حالة الشحنات، الجمارك، الأسطول، والمستودعات' : 'Live operational matrix covering active transit, customs inspection, and dock status'}
      headerAction={
        <button
          onClick={() => onNavigate('admin-controltower')}
          className="px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{isAr ? 'برج التحكم C4I ←' : 'Open C4I Tower ←'}</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {opsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.tab)}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F4C75]/20 text-[#00F0FF] border border-[#0F4C75]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${card.statusColor}`}>
                  {card.status}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block truncate">
                  {isAr ? card.titleAr : card.titleEn}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
                  {card.count}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {isAr ? card.subAr : card.subEn}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-[#00F0FF]">
                <span>{isAr ? 'استعراض التفاصيل' : 'View Module Details'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform dir-rtl:rotate-180" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
