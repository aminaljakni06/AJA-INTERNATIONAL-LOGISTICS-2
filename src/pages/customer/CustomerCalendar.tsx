import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Truck,
  Ship,
  Plane,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../i18n/LanguageContext';

export interface CustomerCalendarProps {
  onNavigate?: (tab: string) => void;
}

interface CalendarEvent {
  id: string;
  trackingNumber: string;
  type: 'pickup' | 'delivery' | 'customs' | 'vessel';
  titleEn: string;
  titleAr: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  mode: 'ocean' | 'air' | 'road';
}

export const CustomerCalendar: React.FC<CustomerCalendarProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [filterType, setFilterType] = useState<string>('all');

  const sampleEvents: CalendarEvent[] = [
    {
      id: 'EV-101',
      trackingNumber: 'AJA-8921-DXB',
      type: 'delivery',
      titleEn: 'Scheduled Port Delivery - Jebel Ali Terminal 2',
      titleAr: 'موعد تسليم الميناء - جبل علي المحطة 2',
      date: '2026-08-08',
      time: '09:00 AM',
      location: 'Dubai, UAE',
      status: 'scheduled',
      mode: 'ocean'
    },
    {
      id: 'EV-102',
      trackingNumber: 'AJA-4412-FRA',
      type: 'customs',
      titleEn: 'Customs Clearance Inspection',
      titleAr: 'تفتيش الفحص الجمركي',
      date: '2026-08-10',
      time: '02:30 PM',
      location: 'Frankfurt Airport Cargo Hub',
      status: 'in-progress',
      mode: 'air'
    },
    {
      id: 'EV-103',
      trackingNumber: 'AJA-9910-RIY',
      type: 'pickup',
      titleEn: 'Warehouse Warehouse Pickup - Riyadh Logistics Zone',
      titleAr: 'استلام الشحنة من مستودع الرياض اللوجستي',
      date: '2026-08-12',
      time: '11:00 AM',
      location: 'Riyadh, KSA',
      status: 'scheduled',
      mode: 'road'
    },
    {
      id: 'EV-104',
      trackingNumber: 'AJA-3301-SHA',
      type: 'vessel',
      titleEn: 'Vessel Arrival - Express Liner V.402',
      titleAr: 'وصول الناقلة البحرية - إكسبريس لاينر',
      date: '2026-08-15',
      time: '06:00 AM',
      location: 'Shanghai Deepwater Terminal',
      status: 'completed',
      mode: 'ocean'
    }
  ];

  const filteredEvents = sampleEvents.filter(ev => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  const getStatusBadge = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{isAr ? 'مجدول' : 'Scheduled'}</span>;
      case 'in-progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{isAr ? 'قيد التنفيذ' : 'In Progress'}</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{isAr ? 'مكتمل' : 'Completed'}</span>;
      case 'delayed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{isAr ? 'متأخر' : 'Delayed'}</span>;
    }
  };

  const getModeIcon = (mode: CalendarEvent['mode']) => {
    switch (mode) {
      case 'ocean': return <Ship className="w-4 h-4 text-[#00F0FF]" />;
      case 'air': return <Plane className="w-4 h-4 text-blue-400" />;
      case 'road': return <Truck className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#080E1A] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F0FF] uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{isAr ? 'جدول المواعيد اللوجستية' : 'Logistics Schedule & Calendar'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'تقويم الشحنات والمواعيد' : 'Shipments & Milestone Calendar'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'جدولة المواعيد وتتبع الاستلام والتسليم والتفتيش الجمركي مباشرة'
              : 'Track upcoming pickups, vessel berthing, customs checkpoints, and final deliveries'}
          </p>
        </div>

        {/* Filter Controls & Sync */}
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">{isAr ? 'جميع المواعيد' : 'All Events'}</option>
            <option value="pickup">{isAr ? 'مواعيد الاستلام' : 'Pickups'}</option>
            <option value="delivery">{isAr ? 'مواعيد التسليم' : 'Deliveries'}</option>
            <option value="customs">{isAr ? 'التخليص الجمركي' : 'Customs Check'}</option>
            <option value="vessel">{isAr ? 'وصول السفن' : 'Vessel Arrival'}</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => alert(isAr ? 'تم تصدير ملف التقويم (.ics)' : 'Calendar sync file (.ics) downloaded')}
          >
            <Download className="w-4 h-4 inline-block me-1.5" />
            {isAr ? 'مزامنة التقويم' : 'Sync iCal'}
          </Button>
        </div>
      </div>

      {/* Main Calendar Matrix & Schedule Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Calendar View Box */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#00F0FF]" />
              <span>{isAr ? 'أغسطس 2026' : 'August 2026'}</span>
            </h2>

            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 py-1">
            <span>{isAr ? 'الأحد' : 'Sun'}</span>
            <span>{isAr ? 'الاثنين' : 'Mon'}</span>
            <span>{isAr ? 'الثلاثاء' : 'Tue'}</span>
            <span>{isAr ? 'الأربعاء' : 'Wed'}</span>
            <span>{isAr ? 'الخميس' : 'Thu'}</span>
            <span>{isAr ? 'الجمعة' : 'Fri'}</span>
            <span>{isAr ? 'السبت' : 'Sat'}</span>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-2 text-xs font-medium">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const hasEvent = [8, 10, 12, 15].includes(dayNum);
              return (
                <div
                  key={i}
                  className={`min-h-[64px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    hasEvent
                      ? 'bg-cyan-500/10 border-[#00F0FF]/40 ring-1 ring-[#00F0FF]/20'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <span className={`font-mono text-xs font-bold ${hasEvent ? 'text-[#00F0FF]' : 'text-slate-500 dark:text-slate-400'}`}>
                    {dayNum}
                  </span>
                  {hasEvent && (
                    <div className="w-full bg-[#00F0FF] text-slate-950 font-bold text-[9px] px-1 py-0.5 rounded-md truncate">
                      {dayNum === 8 ? 'Port Arrival' : dayNum === 10 ? 'Customs' : dayNum === 12 ? 'Pickup' : 'Vessel'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Side: Event List */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            {isAr ? 'المواعيد القادمة' : 'Upcoming Milestones'}
          </h3>

          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <Card key={ev.id} className="p-4 space-y-3 hover:border-[#00F0FF]/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      {getModeIcon(ev.mode)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">
                        {ev.trackingNumber}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {isAr ? ev.titleAr : ev.titleEn}
                      </h4>
                    </div>
                  </div>
                  {getStatusBadge(ev.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>{ev.date} ({ev.time})</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
