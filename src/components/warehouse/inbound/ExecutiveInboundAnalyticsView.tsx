import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Building2,
  Percent,
  Timer,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { InboundAnalyticsKPIs } from '../../../types/inboundWarehouse';

interface ExecutiveInboundAnalyticsViewProps {
  kpis: InboundAnalyticsKPIs;
}

export const ExecutiveInboundAnalyticsView: React.FC<ExecutiveInboundAnalyticsViewProps> = ({ kpis }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-600" />
          <span>{isAr ? 'لوحة قيادة وتحليلات الاستلام اللوجستي (Executive Inbound Analytics)' : 'Executive Inbound Analytics'}</span>
        </h3>
        <p className="text-xs text-gray-500">
          {isAr ? 'مؤشرات أداء استلام البضائع، دقة الاستلام، أداء الموردين، ونسبة استغلال أرصفة المستودع' : 'Receiving accuracy, dock utilization, supplier SLA compliance & lead time KPIs'}
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <span className="text-gray-400 font-bold block">{isAr ? 'إجمالي الشحنات ASN المنجزة' : 'Total ASNs Processed'}</span>
          <div className="text-2xl font-black text-amber-600 font-mono">{kpis.totalAsnsThisMonth}</div>
          <span className="text-[10px] text-emerald-600 font-bold">{isAr ? '+14% مقارنة بالشهر السابق' : '+14% MoM growth'}</span>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <span className="text-gray-400 font-bold block">{isAr ? 'متوسط زمن التنزيل والتفريغ' : 'Avg Unload Duration'}</span>
          <div className="text-2xl font-black text-indigo-600 font-mono">{kpis.avgUnloadingTimeMins} <span className="text-xs font-normal text-gray-500">min</span></div>
          <span className="text-[10px] text-emerald-600 font-bold">{isAr ? 'أسرع بـ 8 دقائق من الهدف' : '8 min ahead of SLA'}</span>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <span className="text-gray-400 font-bold block">{isAr ? 'نسبة استغلال الأرصفة' : 'Dock Utilization'}</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">{kpis.dockUtilizationPercent}%</div>
          <span className="text-[10px] text-gray-500">{isAr ? 'كفاءة تشغيل ممتازة' : 'Optimal Capacity'}</span>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <span className="text-gray-400 font-bold block">{isAr ? 'دقة الاستلام بدون فروقات' : 'Receiving Accuracy'}</span>
          <div className="text-2xl font-black text-blue-600 font-mono">{kpis.receivingAccuracyPercent}%</div>
          <span className="text-[10px] text-emerald-600 font-bold">{isAr ? 'معدل خطأ أقل من 0.6%' : 'Error rate <0.6%'}</span>
        </div>
      </div>

      {/* SECONDARY KPIS & PERFORMANCE BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{isAr ? 'التزام الموردين بالمواعيد والجودة (Supplier SLA)' : 'Supplier SLA Performance'}</h4>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-bold">
                <span className="text-gray-600 dark:text-gray-400">{isAr ? 'التزام الموردين بمواعيد التسليم (On-Time Delivery)' : 'Supplier On-Time Rate'}</span>
                <span className="text-amber-600 font-mono">{kpis.supplierOnTimePercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${kpis.supplierOnTimePercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-bold">
                <span className="text-gray-600 dark:text-gray-400">{isAr ? 'نسبة اجتياز فحص الجودة (Quality Pass Rate)' : 'Quality Pass Rate'}</span>
                <span className="text-emerald-600 font-mono">{kpis.qualityPassRatePercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpis.qualityPassRatePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{isAr ? 'زمن الاستجابة ومعدل التلفيات' : 'Lead Time & Incident Rate'}</h4>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="text-gray-400 text-[10px] block">{isAr ? 'معدل التلفيات OS&D' : 'OS&D Incident Rate'}</span>
              <strong className="text-rose-600 text-lg font-black font-mono block">{kpis.osdIncidentRatePercent}%</strong>
              <span className="text-[10px] text-emerald-600 font-bold">{isAr ? 'ضمن النسبة المستهدفة (<2%)' : 'Within Target'}</span>
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="text-gray-400 text-[10px] block">{isAr ? 'زمن دورة الاستلام الكامل' : 'Receiving Cycle Time'}</span>
              <strong className="text-indigo-600 text-lg font-black font-mono block">{kpis.receivingLeadTimeHours} hr</strong>
              <span className="text-[10px] text-gray-500">{isAr ? 'من الشاحنة لـ Bin Putaway' : 'Gate to Bin'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveInboundAnalyticsView;
