import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Bell, 
  X, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../../common/Card';

interface AlertItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  timestamp: string;
  read: boolean;
  actionEn: string;
  actionAr: string;
  targetTab: string;
}

interface AlertsCenterWidgetProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const AlertsCenterWidget: React.FC<AlertsCenterWidgetProps> = ({
  isAr,
  onNavigate
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      severity: 'CRITICAL',
      titleEn: 'Severe Weather Warning: Bab al-Mandab Strait',
      titleAr: 'تحذير أحوال جوية طارئة: مضيق باب المندب',
      bodyEn: 'Heavy sea swell & wind gusting 45 knots. 2 container vessels diverted to safe anchorage.',
      bodyAr: 'ارتفاع بالأمواج وسرعة رياح 45 عقدة. تم توجيه سفينتي حاويات لمخطاف آمن.',
      timestamp: '10 mins ago',
      read: false,
      actionEn: 'Reroute Vessels',
      actionAr: 'تعديل المسار البحري',
      targetTab: 'admin-controltower'
    },
    {
      id: 'alt-[#',
      severity: 'WARNING',
      titleEn: 'Jeddah Islamic Port Gate 4 Congestion',
      titleAr: 'ازدحام مروري عند البوابة 4 بميناء جدة الإسلامي',
      bodyEn: 'Truck queue delay +45 mins. Alternate Gate 7 opened for container trucks.',
      bodyAr: 'تأخير في طابور الشاحنات +45 دقيقة. تم تفعيل البوابة الفرعية 7 لتسهيل الدخول.',
      timestamp: '25 mins ago',
      read: false,
      actionEn: 'Notify Fleet Drivers',
      actionAr: 'إشعار سائقي الشاحنات',
      targetTab: 'admin-fleet'
    },
    {
      id: 'alt-3',
      severity: 'INFO',
      titleEn: 'ZATCA E-Invoicing Phase 2 Certificate Renewal',
      titleAr: 'تجديد شهادة الربط الإلكتروني لزكاة وضريبة والدخل',
      bodyEn: 'API compliance certificate successfully auto-renewed for Q3 2026.',
      bodyAr: 'تم تجديد شهادة المواءمة مع الهيئة بنجاح للربع الثالث 2026.',
      timestamp: '1 hour ago',
      read: true,
      actionEn: 'View ZATCA Logs',
      actionAr: 'سجل الزكاة والضريبة',
      targetTab: 'admin-payments'
    }
  ]);

  const toggleRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: !a.read } : a));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <Card
      title={isAr ? 'مركز التنبيهات وإدارة المخاطر (Alerts Center)' : 'Operational Risk & Critical Alerts Center'}
      subtitle={isAr ? 'تنبيهات طارئة للأحوال الجوية، الموانئ، والامتثال الأمن والتنظيمي' : 'Critical route exceptions, weather hazards, customs delays, and compliance alerts'}
      headerAction={
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Bell className="w-3 h-3 animate-bounce" />
            <span>{unreadCount} {isAr ? 'تنبيهات جاري معالجتها' : 'Active Risk Alerts'}</span>
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        {alerts.map((alt) => {
          let borderStyle = 'border-slate-200 dark:border-white/10';
          let iconBg = 'bg-sky-500/10 text-sky-400';
          let Icon = Info;

          if (alt.severity === 'CRITICAL') {
            borderStyle = 'border-rose-500/40 bg-rose-500/5';
            iconBg = 'bg-rose-500/20 text-rose-400';
            Icon = ShieldAlert;
          } else if (alt.severity === 'WARNING') {
            borderStyle = 'border-amber-500/40 bg-amber-500/5';
            iconBg = 'bg-amber-500/20 text-amber-400';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border ${borderStyle} transition-all space-y-2 relative`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                        alt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {alt.severity}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {isAr ? alt.titleAr : alt.titleEn}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {isAr ? alt.bodyAr : alt.bodyEn}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {alt.timestamp}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleRead(alt.id)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${alt.read ? 'text-emerald-400' : ''}`} />
                  <span>{alt.read ? (isAr ? 'مروء ومقروء' : 'Marked Read') : (isAr ? 'تحديد كـ مقروء' : 'Mark Read')}</span>
                </button>

                <button
                  onClick={() => onNavigate(alt.targetTab)}
                  className="px-3 py-1 bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{isAr ? alt.actionAr : alt.actionEn}</span>
                  <ChevronRight className="w-3.5 h-3.5 dir-rtl:rotate-180" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
