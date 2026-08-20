import React from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Users, 
  Boxes, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  LifeBuoy, 
  Award, 
  ShieldCheck,
  Activity,
  LucideIcon,
  XCircle,
  FileText
} from 'lucide-react';
import { EnterpriseKPIWidget, StatusBadgeType } from '../../common/EnterpriseKPIWidget';
import { useAnalyticsQuery } from '../../../hooks/useAnalyticsQuery';

interface MetricItem {
  id: string;
  metricRegistryId?: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  tooltipEn: string;
  tooltipAr: string;
  icon: LucideIcon;
  colorTheme: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'sky';
  statusBadge?: {
    type: StatusBadgeType;
    labelEn: string;
    labelAr: string;
  };
  targetTab?: string;
  sparkline: number[];
  miniChartType?: 'sparkline' | 'bar';
}

interface BusinessOverviewGridProps {
  isAr: boolean;
  totalShipmentsCount?: number;
  activeShipmentsCount?: number;
  deliveredShipmentsCount?: number;
  newQuotesCount?: number;
  onNavigate: (tab: string) => void;
}

const METRIC_IDS = [
  'shp_total_shipments',
  'shp_active_shipments',
  'shp_delivered_shipments',
  'shp_cancelled_shipments',
  'shp_delivery_completion_rate',
  'shp_total_weight_kg',
  'cust_total_customers',
  'cust_active_customers',
  'quote_total_quotes',
  'quote_pending_quotes',
  'quote_conversion_rate',
  'quote_offered_value',
];

export const BusinessOverviewGrid: React.FC<BusinessOverviewGridProps> = ({
  isAr,
  onNavigate,
}) => {
  const { metrics, isLoading, isError } = useAnalyticsQuery({
    metricIds: METRIC_IDS,
    autoFetch: true,
  });

  const getMetricVal = (id: string, fallbackUnit = '') => {
    const res = metrics[id];
    if (!res || res.value === null || res.value === undefined) {
      return isAr ? 'غير متوفر' : 'Unavailable';
    }
    if (res.formattedValue) {
      return res.formattedValue;
    }
    if (typeof res.value === 'number') {
      return res.value.toLocaleString();
    }
    return String(res.value) + (fallbackUnit ? ` ${fallbackUnit}` : '');
  };

  const metricCards: MetricItem[] = [
    {
      id: 'total-shipments',
      metricRegistryId: 'shp_total_shipments',
      titleEn: 'Total Freight Shipments',
      titleAr: 'إجمالي الشحنات اللوجستية',
      subtitleEn: 'Sea, Air & Land Freight',
      subtitleAr: 'الشحن البحري والبري والجوي',
      value: getMetricVal('shp_total_shipments'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'All sea, air, and land waybills registered in certified analytics backend',
      tooltipAr: 'كافة بوالص الشحن المسجلة بالنظام التحليلي المعتمد',
      icon: Package,
      colorTheme: 'sky',
      statusBadge: { type: 'success', labelEn: 'Verified', labelAr: 'موثق' },
      targetTab: 'admin-shipments',
      sparkline: [10, 20, 35, 50, 70, 85, 100],
    },
    {
      id: 'active-transit',
      metricRegistryId: 'shp_active_shipments',
      titleEn: 'Active Transit Orders',
      titleAr: 'الشحنات النشطة قيد العبور',
      subtitleEn: 'In Motion Worldwide',
      subtitleAr: 'في طريق الشحن والتوزيع',
      value: getMetricVal('shp_active_shipments'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Cargo currently moving via ocean or highway routes',
      tooltipAr: 'البضائع المنقولة بحراً أو براً حالياً',
      icon: Truck,
      colorTheme: 'indigo',
      statusBadge: { type: 'info', labelEn: 'In Transit', labelAr: 'قيد الترانزيت' },
      targetTab: 'admin-tms',
      sparkline: [5, 15, 25, 40, 60, 75, 86],
    },
    {
      id: 'delivered-shipments',
      metricRegistryId: 'shp_delivered_shipments',
      titleEn: 'Delivered Successfully',
      titleAr: 'شحنات مكتملة التسليم',
      subtitleEn: 'Confirmed POD Issued',
      subtitleAr: 'مستلمة ومؤكدة بتقرير التسليم',
      value: getMetricVal('shp_delivered_shipments'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Confirmed POD (Proof of Delivery) shipments',
      tooltipAr: 'الشحنات المستلمة والمؤكدة بإثبات التسليم',
      icon: CheckCircle2,
      colorTheme: 'emerald',
      statusBadge: { type: 'success', labelEn: 'Completed', labelAr: 'مكتمل' },
      targetTab: 'admin-shipments',
      sparkline: [20, 40, 60, 80, 100, 120, 140],
    },
    {
      id: 'delivery-completion-rate',
      metricRegistryId: 'shp_delivery_completion_rate',
      titleEn: 'Delivery Completion Rate',
      titleAr: 'نسبة إنجاز التسليم',
      subtitleEn: 'Ratio of Delivered / Total',
      subtitleAr: 'نسبة الشحنات المسلمة لإجمالي الشحنات',
      value: getMetricVal('shp_delivery_completion_rate'),
      change: 'Live Ratio',
      trend: 'neutral',
      tooltipEn: 'Live completion ratio computed server-side in Aggregation Engine',
      tooltipAr: 'نسبة الإنجاز المحسوبة مباشرة عبر محرك التجميع بالسيرفر',
      icon: Award,
      colorTheme: 'emerald',
      statusBadge: { type: 'success', labelEn: 'Calculated', labelAr: 'محسوب' },
      targetTab: 'admin-shipments',
      sparkline: [50, 65, 75, 80, 85, 90, 95],
    },
    {
      id: 'cancelled-shipments',
      metricRegistryId: 'shp_cancelled_shipments',
      titleEn: 'Cancelled Shipments',
      titleAr: 'الشحنات الملغاة',
      subtitleEn: 'Exceptions & Rejections',
      subtitleAr: 'حالات الإلغاء والاستثناءات',
      value: getMetricVal('shp_cancelled_shipments'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Count of cancelled shipments registered in backend',
      tooltipAr: 'عدد الشحنات الملغاة المسجلة بالنظام',
      icon: XCircle,
      colorTheme: 'rose',
      statusBadge: { type: 'warning', labelEn: 'Monitored', labelAr: 'مراقب' },
      targetTab: 'admin-shipments',
      sparkline: [1, 2, 2, 1, 3, 2, 1],
    },
    {
      id: 'total-customers',
      metricRegistryId: 'cust_total_customers',
      titleEn: 'Total B2B Accounts',
      titleAr: 'إجمالي الحسابات التجارية',
      subtitleEn: 'Enterprise & SME Clients',
      subtitleAr: 'العملاء المؤسسيون والشركات',
      value: getMetricVal('cust_total_customers'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Verified corporate accounts in system',
      tooltipAr: 'الحسابات التجارية المعتمدة بالمنظومة',
      icon: Users,
      colorTheme: 'purple',
      statusBadge: { type: 'info', labelEn: 'Verified', labelAr: 'موثق' },
      targetTab: 'admin-customers',
      sparkline: [10, 20, 30, 45, 60, 80, 100],
    },
    {
      id: 'active-customers',
      metricRegistryId: 'cust_active_customers',
      titleEn: 'Active B2B Clients',
      titleAr: 'العملاء النشطون',
      subtitleEn: 'Active, VIP & Strategic',
      subtitleAr: 'الحسابات النشطة والاستراتيجية',
      value: getMetricVal('cust_active_customers'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Count of active and VIP enterprise accounts',
      tooltipAr: 'عدد الحسابات التجارية النشطة بالمنظومة',
      icon: Users,
      colorTheme: 'indigo',
      statusBadge: { type: 'success', labelEn: 'Active', labelAr: 'نشط' },
      targetTab: 'admin-customers',
      sparkline: [5, 12, 22, 35, 50, 70, 90],
    },
    {
      id: 'total-quotes',
      metricRegistryId: 'quote_total_quotes',
      titleEn: 'Total Quote Requests',
      titleAr: 'إجمالي طلبات العروض',
      subtitleEn: 'Freight Price Inquiries',
      subtitleAr: 'استفسارات عروض أسعار الشحن',
      value: getMetricVal('quote_total_quotes'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Total freight quote requests logged',
      tooltipAr: 'إجمالي طلبات التسعير المسجلة',
      icon: FileText,
      colorTheme: 'cyan',
      statusBadge: { type: 'processing', labelEn: 'Inquiries', labelAr: 'طلبات' },
      targetTab: 'admin-quotes',
      sparkline: [8, 16, 28, 42, 60, 80, 95],
    },
    {
      id: 'pending-quotes',
      metricRegistryId: 'quote_pending_quotes',
      titleEn: 'Pending / Review Quotes',
      titleAr: 'عروض قيد التسعير والمراجعة',
      subtitleEn: 'New & Under Review',
      subtitleAr: 'الطلبات القائمة تحت الدراسة',
      value: getMetricVal('quote_pending_quotes'),
      change: 'Live API',
      trend: 'neutral',
      tooltipEn: 'Quotes awaiting rate calculation or negotiation',
      tooltipAr: 'العروض القائمة تحت الاحتساب والتفاوض',
      icon: Clock,
      colorTheme: 'amber',
      statusBadge: { type: 'warning', labelEn: 'Reviewing', labelAr: 'قيد المراجعة' },
      targetTab: 'admin-quotes',
      sparkline: [2, 5, 8, 12, 10, 14, 11],
    },
    {
      id: 'quote-conversion-rate',
      metricRegistryId: 'quote_conversion_rate',
      titleEn: 'Quote Conversion Rate',
      titleAr: 'نسبة تحويل العروض',
      subtitleEn: 'Accepted / Total Quotes',
      subtitleAr: 'نسبة العروض المقبولة',
      value: getMetricVal('quote_conversion_rate'),
      change: 'Live Ratio',
      trend: 'neutral',
      tooltipEn: 'Ratio of accepted quote offers over total submitted queries',
      tooltipAr: 'نسبة تحويل عروض الأسعار المقبولة',
      icon: TrendingUp,
      colorTheme: 'emerald',
      statusBadge: { type: 'success', labelEn: 'Calculated', labelAr: 'محسوب' },
      targetTab: 'admin-quotes',
      sparkline: [30, 40, 50, 60, 65, 70, 75],
    },
    {
      id: 'quote-offered-value',
      metricRegistryId: 'quote_offered_value',
      titleEn: 'Offered Quote Value',
      titleAr: 'إجمالي قيمة العروض المقدمة',
      subtitleEn: 'Sum of Offered Rates',
      subtitleAr: 'مجموع أصل أسعار العروض',
      value: getMetricVal('quote_offered_value'),
      change: 'Currency Grouped',
      trend: 'neutral',
      tooltipEn: 'Aggregated total value of quotes offered to B2B clients',
      tooltipAr: 'إجمالي قيمة العروض الصادرة للعملاء',
      icon: DollarSign,
      colorTheme: 'emerald',
      statusBadge: { type: 'success', labelEn: 'Financial', labelAr: 'مالي' },
      targetTab: 'admin-quotes',
      sparkline: [100, 200, 350, 500, 750, 900, 1100],
    },
    {
      id: 'total-weight',
      metricRegistryId: 'shp_total_weight_kg',
      titleEn: 'Total Tonnage Handled',
      titleAr: 'إجمالي الحمولة المسجلة',
      subtitleEn: 'Sum of Weight (kg)',
      subtitleAr: 'مجموع وزن البضائع بالكيلوجرام',
      value: getMetricVal('shp_total_weight_kg'),
      change: 'Live Sum',
      trend: 'neutral',
      tooltipEn: 'Total gross cargo weight managed by logistics fleet',
      tooltipAr: 'إجمالي أوزان الشحنات التي تم تداولها',
      icon: Boxes,
      colorTheme: 'purple',
      statusBadge: { type: 'info', labelEn: 'Tonnage', labelAr: 'الحمولة' },
      targetTab: 'admin-shipments',
      sparkline: [500, 1200, 2500, 4000, 6500, 8000, 10500],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00F0FF]" />
            <span>
              {isAr
                ? 'مؤشرات أداء الأعمال المباشرة (Live Certified Executive Analytics)'
                : 'Live Certified Executive Analytics & Core Metrics'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'مؤشرات حية مسحوبة مباشرة عبر محرك التجميع والخدمات التحليلية المعتمدة (STEP 05.19)'
              : 'Live metrics powered directly by the certified STEP 05.19 Aggregation Engine & REST API'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse border border-slate-200 dark:border-white/10 p-4"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
          {isAr
            ? 'تعذر تحميل مؤشرات الأداء الحية. يرجى التحقق من الاتصال وإعادة المحاولة.'
            : 'Failed to load live analytics metrics. Please check connection and try again.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {metricCards.map((m) => (
            <EnterpriseKPIWidget
              key={m.id}
              id={m.id}
              titleEn={m.titleEn}
              titleAr={m.titleAr}
              subtitleEn={m.subtitleEn}
              subtitleAr={m.subtitleAr}
              value={m.value}
              change={m.change}
              trend={m.trend}
              icon={m.icon}
              statusBadge={m.statusBadge}
              tooltipEn={m.tooltipEn}
              tooltipAr={m.tooltipAr}
              sparklineData={m.sparkline}
              miniChartType={m.miniChartType || 'sparkline'}
              colorTheme={m.colorTheme}
              isAr={isAr}
              onViewDetails={() => m.targetTab && onNavigate(m.targetTab)}
            />
          ))}
        </div>
      )}
    </div>
  );
};


