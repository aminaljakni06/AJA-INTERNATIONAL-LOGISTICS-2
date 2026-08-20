import React, { useEffect, useState } from 'react';
import { Card } from '../../common/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AnalyticsService } from '../../../services/analyticsService';
import { AnalyticsGroupedResult } from '../../../types/analyticsFramework';

interface DashboardChartsGridProps {
  isAr: boolean;
  onNavigate: (tab: string) => void;
}

const COLOR_PALETTE = ['#00F0FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

export const DashboardChartsGrid: React.FC<DashboardChartsGridProps> = ({
  isAr,
}) => {
  const [serviceTypeGrouped, setServiceTypeGrouped] = useState<AnalyticsGroupedResult | null>(null);
  const [statusGrouped, setStatusGrouped] = useState<AnalyticsGroupedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(false);
        const [stRes, statusRes] = await Promise.all([
          AnalyticsService.queryGroupedAnalytics({
            metricId: 'shp_total_shipments',
            dimension: 'serviceType',
          }),
          AnalyticsService.queryGroupedAnalytics({
            metricId: 'shp_total_shipments',
            dimension: 'status',
          }),
        ]);

        if (isMounted) {
          setServiceTypeGrouped(stRes);
          setStatusGrouped(statusRes);
        }
      } catch (err) {
        console.warn('[DashboardChartsGrid] Failed to fetch grouped analytics:', err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChartData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Map serviceType grouped results
  const transportModeData = (serviceTypeGrouped?.groups || []).map((grp, idx) => ({
    name: grp.labelEn || grp.key,
    value: typeof grp.value === 'number' ? grp.value : Number(grp.value) || 0,
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
  }));

  // Map status grouped results
  const statusVolumeData = (statusGrouped?.groups || []).map((grp) => ({
    statusKey: grp.labelEn || grp.key,
    shipments: typeof grp.value === 'number' ? grp.value : Number(grp.value) || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Transport Mode Volume Breakdown */}
      <Card
        title={
          isAr
            ? 'توزيع الشحنات حسب نوع الخدمة (Service Type Breakdown)'
            : 'Shipment Distribution by Service Type'
        }
        subtitle={
          isAr
            ? 'معدل توزيع الشحنات الحية حسب نوع الخدمة اللوجستية المعتمدة'
            : 'Live freight allocation across registered logistics service types'
        }
      >
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-xs font-bold text-rose-400">
            {isAr
              ? 'تعذر تحميل بيانات الرسم البياني لنوع الخدمة'
              : 'Failed to load service type distribution'}
          </div>
        ) : transportModeData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
            {isAr ? 'لا توجد بيانات متاحة حالياً' : 'No service type data available'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-64">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transportModeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {transportModeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B172A', borderColor: '#1E293B', borderRadius: '12px', color: '#FFF' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {transportModeData.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  </div>
                  <span className="font-mono font-black text-[#00F0FF]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Chart 2: Status Volume Breakdown */}
      <Card
        title={
          isAr
            ? 'حجم الشحنات حسب حالة التنفيذ (Shipment Status Throughput)'
            : 'Shipment Volume Throughput by Status'
        }
        subtitle={
          isAr
            ? 'عدد بوالص الشحن الحية لكل مرحلة من مراحل الشحن'
            : 'Total active waybills aggregated by current shipment operational status'
        }
      >
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-xs font-bold text-rose-400">
            {isAr
              ? 'تعذر تحميل بيانات حالات الشحن'
              : 'Failed to load status breakdown data'}
          </div>
        ) : statusVolumeData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
            {isAr ? 'لا توجد بيانات متاحة حالياً' : 'No status breakdown data available'}
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusVolumeData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="statusKey" stroke="#94A3B8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B172A', borderColor: '#1E293B', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="shipments" name={isAr ? 'عدد الشحنات' : 'Shipments Count'} fill="#00F0FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

