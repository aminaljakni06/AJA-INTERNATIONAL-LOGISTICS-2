import React from 'react';
import { 
  PackagePlus, 
  FilePlus, 
  UserPlus, 
  Receipt, 
  Truck, 
  Boxes, 
  FileText, 
  BarChart2, 
  Calendar, 
  UploadCloud,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Card } from '../../common/Card';

interface QuickActionsHubProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

export const QuickActionsHub: React.FC<QuickActionsHubProps> = ({
  isAr,
  onNavigate
}) => {
  const actions = [
    {
      id: 'create-shipment',
      titleEn: 'Create New Shipment B/L',
      titleAr: 'إنشاء بوليصة شحن جديدة',
      subEn: 'Sea, Air & Land Freight Waybill',
      subAr: 'إصدار بوليصة بحرية، جوية أو برية',
      icon: PackagePlus,
      color: 'bg-gradient-to-br from-[#0B5FFF] to-[#00F0FF] text-[#030712]',
      targetTab: 'admin-shipments'
    },
    {
      id: 'price-quote',
      titleEn: 'Issue Freight Quote Offer',
      titleAr: 'تسعير وإصدار عرض سعر',
      subEn: 'Instant B2B pricing calculation',
      subAr: 'احتساب التكلفة الفورية للعملاء',
      icon: FilePlus,
      color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      targetTab: 'admin-quotes'
    },
    {
      id: 'register-customer',
      titleEn: 'Register Corporate Client',
      titleAr: 'تسجيل شركة تجارية جديدة',
      subEn: 'Onboard B2B enterprise account',
      subAr: 'اعتماد حساب مؤسسي تجاري',
      icon: UserPlus,
      color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      targetTab: 'admin-customers'
    },
    {
      id: 'generate-invoice',
      titleEn: 'Generate ZATCA Invoice',
      titleAr: 'إصدار فاتورة ZATCA ضريبية',
      subEn: 'E-Invoicing Phase 2 Fatoora',
      subAr: 'فاتورة معتمدة إلكترونياً من الزكاة',
      icon: Receipt,
      color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      targetTab: 'admin-payments'
    },
    {
      id: 'assign-driver',
      titleEn: 'Dispatch Fleet Driver',
      titleAr: 'تعيين وتوجيه شاحنة وسائق',
      subEn: 'TMS vehicle route assignment',
      subAr: 'إرسال الرحلة لنظام تتبع الأسطول',
      icon: Truck,
      color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      targetTab: 'admin-tms'
    },
    {
      id: 'manage-warehouse',
      titleEn: 'Dock & Storage Entry',
      titleAr: 'إدخال شحنة بالمستودع WMS',
      subEn: 'Cold chain & general storage receipt',
      subAr: 'تسجيل بضائع بالرصيف وسلسلة التبريد',
      icon: Boxes,
      color: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      targetTab: 'admin-warehouse'
    },
    {
      id: 'open-reports',
      titleEn: 'Executive BI Reports',
      titleAr: 'تقارير أداء العمليات والذكاء',
      subEn: 'Financial & KPI analytics',
      subAr: 'تحليلات الميزانية والمؤشرات',
      icon: BarChart2,
      color: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      targetTab: 'admin-audits'
    }
  ];

  return (
    <Card
      title={isAr ? 'الإجراءات السريعة واختصارات التشغيل (Quick Action Hub)' : 'Executive Shortcuts & Quick Command Hub'}
      subtitle={isAr ? 'اختصارات فورية لإجراء المهام الرئيسية بنقرة واحدة' : 'One-click shortcuts to issue waybills, quotes, invoices, and fleet dispatches'}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              onClick={() => onNavigate(act.targetTab)}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF] transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md"
            >
              <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1">
                  {isAr ? act.titleAr : act.titleEn}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">
                  {isAr ? act.subAr : act.subEn}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-[#00F0FF] pt-2 border-t border-slate-200 dark:border-white/5">
                <span>{isAr ? 'تنفيذ' : 'Execute'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform dir-rtl:rotate-180" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
