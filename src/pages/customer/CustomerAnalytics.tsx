import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Package,
  Clock,
  ShieldCheck,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Ship,
  Plane,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  AlertCircle,
  FileText,
  Bookmark,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAnalyticsQuery } from '../../hooks/useAnalyticsQuery';
import { AnalyticsService } from '../../services/analyticsService';
import { EnterpriseQueryState } from '../../types/queryFramework';
import { AnalyticsGroupedResult, AnalyticsTimeSeriesPoint } from '../../types/analyticsFramework';
import { jsPDF } from 'jspdf';

export interface CustomerAnalyticsProps {
  onNavigate?: (tab: string) => void;
}

const CUSTOMER_METRIC_IDS = [
  'shp_total_shipments',
  'shp_active_shipments',
  'shp_delivered_shipments',
  'shp_delivery_completion_rate',
  'quote_total_requests',
  'quote_approved_count',
  'quote_conversion_rate',
];

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [queryState, setQueryState] = useState<EnterpriseQueryState>({
    filters: {},
    search: '',
    sort: { field: 'createdAt', direction: 'desc' },
    pagination: { page: 1, pageSize: 20 },
  });

  // Grouped state
  const [modeDistribution, setModeDistribution] = useState<any[]>([]);
  const [corridorPerformance, setCorridorPerformance] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [groupedLoading, setGroupedLoading] = useState(false);

  // Time Series interval
  const [timeSeriesInterval, setTimeSeriesInterval] = useState<'DAY' | 'WEEK' | 'MONTH'>('MONTH');

  // Compute date range based on selected time range
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (timeRange === 'month') {
      start.setMonth(start.getMonth() - 1);
    } else if (timeRange === 'quarter') {
      start.setMonth(start.getMonth() - 3);
    } else if (timeRange === 'year') {
      start.setFullYear(start.getFullYear() - 1);
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [timeRange]);

  // Combined Query State with Date Range
  const activeQueryState: EnterpriseQueryState = useMemo(() => {
    return {
      ...queryState,
      filters: {
        ...(queryState.filters || {}),
        dateRange,
      },
    };
  }, [queryState, dateRange]);

  // Main KPI & Time Series Hook
  const {
    metrics,
    timeSeries,
    isLoading: isKpiLoading,
    isError,
    error,
    refetch: refetchKpis,
  } = useAnalyticsQuery({
    metricIds: CUSTOMER_METRIC_IDS,
    queryState: activeQueryState,
    interval: timeSeriesInterval,
    autoFetch: true,
  });

  // Fetch Grouped Analytics (Service Modes, Corridors, Statuses)
  const fetchGroupedData = async () => {
    setGroupedLoading(true);
    try {
      const [modesRes, corridorsRes, statusRes] = await Promise.all([
        AnalyticsService.queryGroupedAnalytics({
          metricId: 'shp_total_shipments',
          dimension: 'serviceType',
          queryState: activeQueryState,
        }).catch(() => null),
        AnalyticsService.queryGroupedAnalytics({
          metricId: 'shp_total_shipments',
          dimension: 'corridor',
          queryState: activeQueryState,
        }).catch(() => null),
        AnalyticsService.queryGroupedAnalytics({
          metricId: 'shp_total_shipments',
          dimension: 'status',
          queryState: activeQueryState,
        }).catch(() => null),
      ]);

      // Process Modes
      if (modesRes?.groups && modesRes.groups.length > 0) {
        const COLORS: Record<string, string> = {
          SEA_FREIGHT: '#00F0FF',
          AIR_FREIGHT: '#3B82F6',
          LAND_FREIGHT: '#10B981',
          CUSTOMS_CLEARANCE: '#F59E0B',
          WAREHOUSING: '#8B5CF6',
          DOOR_TO_DOOR: '#EC4899',
        };
        const totalVol = modesRes.groups.reduce((acc, g) => acc + g.value, 0) || 1;
        const mappedModes = modesRes.groups.map((g) => {
          let name = g.key;
          if (g.key === 'SEA_FREIGHT') name = isAr ? 'شحن بحري' : 'Ocean Freight';
          else if (g.key === 'AIR_FREIGHT') name = isAr ? 'شحن جوي' : 'Air Freight';
          else if (g.key === 'LAND_FREIGHT') name = isAr ? 'نقل بري' : 'Road Transport';
          else if (g.key === 'CUSTOMS_CLEARANCE') name = isAr ? 'تخليص جمركي' : 'Customs Clearance';
          else if (g.key === 'WAREHOUSING') name = isAr ? 'تخزين' : 'Warehousing';

          return {
            name,
            key: g.key,
            value: g.value,
            percentage: Math.round((g.value / totalVol) * 100),
            color: COLORS[g.key] || '#64748B',
          };
        });
        setModeDistribution(mappedModes);
      } else {
        setModeDistribution([]);
      }

      // Process Corridors
      if (corridorsRes?.groups) {
        const mappedCorridors = corridorsRes.groups.map((c) => ({
          route: c.key === 'UNKNOWN' ? (isAr ? 'ممر غير محدد' : 'Unspecified Corridor') : c.key,
          volume: `${c.value} ${isAr ? 'شحنة' : 'Shipments'}`,
          count: c.value,
        }));
        setCorridorPerformance(mappedCorridors);
      } else {
        setCorridorPerformance([]);
      }

      // Process Statuses
      if (statusRes?.groups) {
        setStatusDistribution(statusRes.groups);
      } else {
        setStatusDistribution([]);
      }
    } catch (err) {
      console.warn('[CustomerAnalytics] Failed to fetch grouped analytics:', err);
    } finally {
      setGroupedLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupedData();
  }, [activeQueryState, isAr]);

  const handleRefreshAll = () => {
    refetchKpis();
    fetchGroupedData();
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const totalShp = metrics?.shp_total_shipments?.value ?? 0;
    const activeShp = metrics?.shp_active_shipments?.value ?? 0;
    const deliveredShp = metrics?.shp_delivered_shipments?.value ?? 0;
    const completionRate = metrics?.shp_delivery_completion_rate?.value ?? 0;

    doc.setFontSize(18);
    doc.text('AJA INTERNATIONAL LOGISTICS', 14, 20);
    doc.setFontSize(12);
    doc.text('Customer Logistics Performance Report', 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

    doc.line(14, 38, 196, 38);

    doc.setFontSize(12);
    doc.text('Key Performance Indicators:', 14, 46);
    doc.setFontSize(10);
    doc.text(`- Total Volume Shipped: ${totalShp} Shipments`, 20, 54);
    doc.text(`- Active In-Transit: ${activeShp} Shipments`, 20, 60);
    doc.text(`- Delivered Shipments: ${deliveredShp} Shipments`, 20, 66);
    doc.text(`- On-Time Completion SLA: ${completionRate.toFixed(1)}%`, 20, 72);

    if (corridorPerformance.length > 0) {
      doc.setFontSize(12);
      doc.text('Top Active Corridors:', 14, 84);
      doc.setFontSize(10);
      let y = 92;
      corridorPerformance.slice(0, 5).forEach((corr) => {
        doc.text(`* ${corr.route}: ${corr.volume}`, 20, y);
        y += 6;
      });
    }

    doc.save(`Customer_Logistics_Analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Format Time Series Chart Data
  const timeSeriesChartData = useMemo(() => {
    if (!timeSeries?.points || timeSeries.points.length === 0) return [];
    return timeSeries.points.map((pt) => {
      const date = new Date(pt.timestamp);
      const label = isAr
        ? date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        volume: pt.value,
      };
    });
  }, [timeSeries, isAr]);

  const isLoading = isKpiLoading || groupedLoading;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#080E1A] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F0FF] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>{isAr ? 'تحليلات الأداء والتقارير المباشرة' : 'Live Customer Performance Analytics'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'لوحة تحليلات الشحن المتقدمة' : 'Logistics Intelligence Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'مراقبة أحجام الشحن، كفاءة الأداء، واستخبارات الممرات اللوجستية المباشرة'
              : 'Real-time monitoring of volume, SLA completion, and freight corridor intelligence'}
          </p>
        </div>

        {/* Time Range Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'month'
                  ? 'bg-[#00F0FF] text-slate-950 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'شهري' : 'Monthly'}
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'quarter'
                  ? 'bg-[#00F0FF] text-slate-950 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'ربع سنوي' : 'Quarterly'}
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'year'
                  ? 'bg-[#00F0FF] text-slate-950 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'سنوي' : 'Annual'}
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={handleRefreshAll} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 inline-block me-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isAr ? 'تحديث' : 'Refresh'}
          </Button>

          <Button variant="secondary" size="sm" onClick={handleExportPDF}>
            <Download className="w-3.5 h-3.5 inline-block me-1.5" />
            {isAr ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Financial Spend Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            {isAr
              ? 'تنويه مالي: ستتوفر تحليلات الإنفاق والتكاليف المالية الدقيقة فور ربط وحدة تحليلات المالية المؤسسية'
              : 'Financial spending analytics will be available after Finance Analytics integration.'}
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold">
          {isAr ? 'مرحلة الربط القادمة' : 'Finance Integration Pending'}
        </span>
      </div>

      {/* Error Alert */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error?.message || (isAr ? 'حدث خطأ أثناء تحميل بيانات التحليلات المباشرة' : 'Failed to load live analytics data')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <Card className="p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي عدد الشحنات' : 'Total Volume Shipped'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isKpiLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics?.shp_total_shipments?.value ?? 0}
              </span>
            )}
            <span className="flex items-center text-xs font-bold text-blue-500">
              <Package className="w-3.5 h-3.5 me-1" />
              {isAr ? 'شحنة' : 'Shipments'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isAr ? 'إجمالي الشحنات المسجلة بالحساب' : 'Total customer record volume'}
          </span>
        </Card>

        {/* Active Shipments */}
        <Card className="p-5 border-l-4 border-l-[#00F0FF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'الشحنات النشطة قيد العبور' : 'Active In-Transit'}
            </span>
            <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF]">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isKpiLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics?.shp_active_shipments?.value ?? 0}
              </span>
            )}
            <span className="flex items-center text-xs font-bold text-emerald-500">
              <Clock className="w-3.5 h-3.5 me-1" />
              {isAr ? 'نشطة' : 'Active'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isAr ? 'جاري التنفيذ أو النقل الحركي' : 'Currently in operational transit'}
          </span>
        </Card>

        {/* On-Time Delivery SLA */}
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'معدل إنجاز التسليم' : 'Delivery Completion SLA'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isKpiLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics?.shp_delivery_completion_rate?.value != null
                  ? `${metrics.shp_delivery_completion_rate.value.toFixed(1)}%`
                  : '100%'}
              </span>
            )}
            <span className="flex items-center text-xs font-bold text-emerald-500">
              <ArrowUpRight className="w-3.5 h-3.5" />
              SLA
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isAr ? 'نسبة الشحنات المسلّمة بنجاح' : 'Delivered over total shipment ratio'}
          </span>
        </Card>

        {/* Quote Conversion Rate */}
        <Card className="p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'طلبات وعروض الأسعار' : 'Quotes & Conversion'}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isKpiLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            ) : (
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {metrics?.quote_total_requests?.value ?? 0}
              </span>
            )}
            <span className="flex items-center text-xs font-bold text-purple-400">
              {metrics?.quote_conversion_rate?.value != null
                ? `${metrics.quote_conversion_rate.value.toFixed(0)}%`
                : '0%'}{' '}
              {isAr ? 'اعتماد' : 'Converted'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isAr ? 'طلبات الأسعار المعتمدة للحساب' : 'Approved quote request volume'}
          </span>
        </Card>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Activity Time Series */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'نشاط وحجم الشحنات عبر الزمن' : 'Shipment Activity & Volume Over Time'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'تتبع زمني لحركة الشحنات وتغير الحجم' : 'Time-series shipment activity analysis'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setTimeSeriesInterval('DAY')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  timeSeriesInterval === 'DAY'
                    ? 'bg-[#00F0FF] text-slate-950'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isAr ? 'يومي' : 'Day'}
              </button>
              <button
                onClick={() => setTimeSeriesInterval('WEEK')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  timeSeriesInterval === 'WEEK'
                    ? 'bg-[#00F0FF] text-slate-950'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isAr ? 'أسبوعي' : 'Week'}
              </button>
              <button
                onClick={() => setTimeSeriesInterval('MONTH')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  timeSeriesInterval === 'MONTH'
                    ? 'bg-[#00F0FF] text-slate-950'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isAr ? 'شهري' : 'Month'}
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {isKpiLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : timeSeriesChartData.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <span>{isAr ? 'لا توجد بيانات حركة للفترة المحددة' : 'No time-series data available for this range'}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080E1A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#00F0FF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Freight Mode Distribution */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              {isAr ? 'توزيع وسائط النقل اللوجستي' : 'Freight Transport Modes'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isAr ? 'الحصة النسبية حسب وسائط النقل المباشرة' : 'Live breakdown by freight transport channel'}
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              {groupedLoading ? (
                <LoadingSpinner />
              ) : modeDistribution.length === 0 ? (
                <div className="text-xs text-slate-400">
                  {isAr ? 'لا توجد وسائط نقل مسجلة' : 'No transport mode data'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {modeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#080E1A',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
            {modeDistribution.map((mode, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: mode.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{mode.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">{mode.value}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{mode.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trade Corridor Intelligence Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F0FF] uppercase mb-1">
              <Globe className="w-4 h-4" />
              <span>{isAr ? 'استخبارات الممرات اللوجستية' : 'Freight Corridor Intelligence'}</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'أداء الممرات اللوجستية والتجارية الحية' : 'Primary Freight Corridor Performance'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'تحليل مباشر لمسارات الشحن النشطة وتوزيع الحجم بين الموانئ والمحطات' : 'Live server-authoritative trade lane distribution'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {groupedLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : corridorPerformance.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {isAr ? 'لا توجد ممرات لوجستية مسجلة للفترة المحددة' : 'No active trade lane corridors recorded for this filter'}
            </div>
          ) : (
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase font-mono">
                  <th className="py-3 px-4 text-start">{isAr ? 'ممر الشحن اللوجستي' : 'Trade Lane Corridor'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'حجم الشحنات' : 'Shipment Volume'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الحالة الحالية' : 'Operational Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                {corridorPerformance.map((lane, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>{lane.route}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{lane.volume}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {isAr ? 'ممر نشط' : 'Active Lane'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
