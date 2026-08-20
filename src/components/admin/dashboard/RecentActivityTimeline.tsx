import React, { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  UserPlus, 
  Boxes, 
  Truck, 
  LifeBuoy, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../common/Card';

interface ActivityItem {
  id: string;
  type: 'shipment' | 'payment' | 'user' | 'warehouse' | 'fleet' | 'support' | 'security';
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  timestamp: string;
  user: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ALERT' | 'INFO';
  targetTab: string;
}

interface RecentActivityTimelineProps {
  isAr: boolean;
  auditLogs: any[];
  onNavigate: (tab: string) => void;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  isAr,
  auditLogs,
  onNavigate
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const defaultActivities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'shipment',
      titleEn: 'Ocean B/L #AJA-2026-9042 Created',
      titleAr: 'إنشاء بوليصة شحن بحري #AJA-2026-9042',
      descEn: 'Origin: Shanghai Port → Destination: Jeddah Islamic Port (40ft High Cube Container)',
      descAr: 'المنشأ: ميناء شانغهاي ← الوجهة: ميناء جدة الإسلامي (حاوية 40 قدم)',
      timestamp: '2 mins ago',
      user: 'Capt. Fahad Al-Otaibi',
      status: 'COMPLETED',
      targetTab: 'admin-shipments'
    },
    {
      id: 'act-2',
      type: 'payment',
      titleEn: 'Adyen Corporate Settlement Confirmed',
      titleAr: 'تأكيد التسوية المالية للشركة عبر Adyen',
      descEn: 'Invoice #INV-2026-8812 paid (Amount: 142,500 SAR via Credit Card)',
      descAr: 'تم سداد الفاتورة #INV-2026-8812 (المبلغ: 142,500 ريال عبر البطاقة)',
      timestamp: '8 mins ago',
      user: 'ZATCA Gateway System',
      status: 'COMPLETED',
      targetTab: 'admin-payments'
    },
    {
      id: 'act-3',
      type: 'fleet',
      titleEn: 'Driver & Truck Dispatched to Highway 10',
      titleAr: 'انطلاق شاحنة وسائق على طريق الرياض - الدمام',
      descEn: 'Vehicle Actros #KSA-8812 assigned to Riyadh-Dammam express haul',
      descAr: 'المركبة أكتروس #KSA-8812 تم تعيينها للرحلة السريعة بين الرياض والدمام',
      timestamp: '15 mins ago',
      user: 'TMS Dispatch Control',
      status: 'IN_PROGRESS',
      targetTab: 'admin-tms'
    },
    {
      id: 'act-4',
      type: 'warehouse',
      titleEn: 'Riyadh Hub Inbound Dock Received Cargo',
      titleAr: 'استلام بضائع برصيف مستودع الرياض الرئيسي',
      descEn: '18 Pallets Cold Chain Pharmaceuticals unloaded into Vault B',
      descAr: 'تفريغ 18 طبلية أدوية مجمدة بقسم التبريد ب',
      timestamp: '28 mins ago',
      user: 'WMS Operator Lead',
      status: 'COMPLETED',
      targetTab: 'admin-warehouse'
    },
    {
      id: 'act-5',
      type: 'user',
      titleEn: 'New B2B Corporate Client Registered',
      titleAr: 'تسجيل حساب شركة تجارية جديدة',
      descEn: 'Almarai Food Logistics Division verified & onboarded',
      descAr: 'تم توثيق واعتماد قسم اللوجستيات بشركة المراعي',
      timestamp: '42 mins ago',
      user: 'KYC Compliance Desk',
      status: 'INFO',
      targetTab: 'admin-customers'
    },
    {
      id: 'act-6',
      type: 'security',
      titleEn: 'Zero-Trust IAM Privilege Escalation Audited',
      titleAr: 'تدقيق أمني على صلاحيات الوصول الحساسة',
      descEn: 'Security Manager granted temporary admin access to Customs Gateway',
      descAr: 'منح مدير الأمن صلاحية وصول مؤقتة لبوابة التخليص الجمركي',
      timestamp: '1 hour ago',
      user: 'SOC Security Engine',
      status: 'ALERT',
      targetTab: 'admin-security'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment': return Package;
      case 'payment': return DollarSign;
      case 'fleet': return Truck;
      case 'warehouse': return Boxes;
      case 'user': return UserPlus;
      case 'support': return LifeBuoy;
      case 'security': return ShieldCheck;
      default: return Clock;
    }
  };

  const filteredList = defaultActivities.filter(a => {
    if (filterType === 'ALL') return true;
    return a.type === filterType;
  });

  return (
    <Card
      title={isAr ? 'سجل الأنشطة والأحداث التشغيلية الحي (Activity Timeline)' : 'Chronological Operations Activity Stream'}
      subtitle={isAr ? 'متابعة مباشرة للإجراءات، الشحنات، الفواتير والأحداث الأمنية' : 'Realtime audit trail of shipments, payment settlements, fleet dispatches, and system events'}
      headerAction={
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'shipment', 'payment', 'fleet', 'security'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                filterType === type ? 'bg-[#00F0FF] text-[#030712]' : 'text-slate-400 hover:text-white bg-slate-100 dark:bg-white/5'
              }`}
            >
              {type === 'ALL' ? (isAr ? 'الكل' : 'All') : type.toUpperCase()}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3 relative">
        {/* Vertical Timeline Line */}
        <div className="absolute start-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-white/10" />

        {filteredList.map((item) => {
          const Icon = getActivityIcon(item.type);
          let badgeStyle = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
          if (item.status === 'COMPLETED') badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          if (item.status === 'ALERT') badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.targetTab)}
              className="relative ps-10 p-3 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              {/* Timeline Icon Badge */}
              <div className="absolute start-1.5 top-3.5 w-6 h-6 rounded-full bg-[#082F49] border-2 border-[#00F0FF] text-[#00F0FF] flex items-center justify-center shrink-0 z-10">
                <Icon className="w-3 h-3" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {isAr ? item.titleAr : item.titleEn}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${badgeStyle}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px] font-mono text-slate-400 shrink-0">
                <span>By: {item.user}</span>
                <span className="text-[#00F0FF] font-bold">{item.timestamp}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
