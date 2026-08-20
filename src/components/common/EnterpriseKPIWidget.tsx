import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

export type WidgetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'half' | 'third' | 'quarter';

export type StatusBadgeType = 'success' | 'warning' | 'critical' | 'info' | 'offline' | 'maintenance' | 'processing';

export interface KPIWidgetProps {
  id?: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  value: string | number;
  secondaryValueEn?: string;
  secondaryValueAr?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  comparisonPeriodEn?: string;
  comparisonPeriodAr?: string;
  icon: LucideIcon;
  statusBadge?: {
    type: StatusBadgeType;
    labelEn: string;
    labelAr: string;
  };
  tooltipEn?: string;
  tooltipAr?: string;
  lastUpdatedEn?: string;
  lastUpdatedAr?: string;
  sparklineData?: number[];
  miniChartType?: 'sparkline' | 'bar' | 'donut';
  size?: WidgetSize;
  colorTheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'sky';
  isAr?: boolean;
  loading?: boolean;
  empty?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
  onViewDetails?: () => void;
  quickLinkTab?: string;
}

export const EnterpriseKPIWidget: React.FC<KPIWidgetProps> = ({
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  value,
  secondaryValueEn,
  secondaryValueAr,
  change,
  trend = 'neutral',
  comparisonPeriodEn = 'vs last period',
  comparisonPeriodAr = 'مقارنة بالفترة السابقة',
  icon: Icon,
  statusBadge,
  tooltipEn,
  tooltipAr,
  lastUpdatedEn = 'Just now',
  lastUpdatedAr = 'الآن',
  sparklineData = [],
  miniChartType = 'sparkline',
  size = 'third',
  colorTheme = 'cyan',
  isAr = false,
  loading = false,
  empty = false,
  error = null,
  onRetry,
  onRefresh,
  onViewDetails,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Status Badge styling helper
  const getBadgeStyle = (type: StatusBadgeType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
      case 'info':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'offline':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'maintenance':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'processing':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Color theme for icon & borders
  const getThemeClasses = () => {
    switch (colorTheme) {
      case 'emerald':
        return { iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', line: '#10B981' };
      case 'amber':
        return { iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', line: '#F59E0B' };
      case 'rose':
        return { iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', line: '#F43F5E' };
      case 'indigo':
        return { iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', line: '#6366F1' };
      case 'purple':
        return { iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', line: '#A855F7' };
      case 'sky':
        return { iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', line: '#38BDF8' };
      case 'cyan':
      default:
        return { iconBg: 'bg-cyan-500/10 text-[#00F0FF] border-cyan-500/20', line: '#00F0FF' };
    }
  };

  const theme = getThemeClasses();

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded-md" />
          <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="h-8 w-20 bg-slate-200 dark:bg-white/10 rounded-lg" />
        <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
        <div className="h-8 w-full bg-slate-100 dark:bg-white/5 rounded-xl mt-2" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center text-center space-y-2 min-h-[140px]">
        <AlertCircle className="w-6 h-6" />
        <p className="text-xs font-bold">{isAr ? 'فشل تحميل المؤشر' : 'Failed to load metric'}</p>
        <p className="text-[10px] text-slate-400">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
          </button>
        )}
      </div>
    );
  }

  // Empty State
  if (empty) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-dashed border-slate-200 dark:border-white/10 text-slate-400 flex flex-col items-center justify-center text-center space-y-2 min-h-[140px]">
        <HelpCircle className="w-6 h-6 opacity-40" />
        <p className="text-xs font-bold">{isAr ? 'لا توجد بيانات متاحة' : 'No metric data available'}</p>
        <p className="text-[10px]">{isAr ? 'لم يتم تسجيل بيانات لهذا المؤشر مؤخراً' : 'No recent records found for this KPI'}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-2.5 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
          >
            {isAr ? 'تحديث' : 'Refresh'}
          </button>
        )}
      </div>
    );
  }

  // Mini Chart Rendering
  const renderMiniChart = () => {
    if (!sparklineData || sparklineData.length === 0) return null;

    if (miniChartType === 'bar') {
      const maxVal = Math.max(...sparklineData) || 1;
      return (
        <div className="flex items-end gap-1 h-6 w-20">
          {sparklineData.slice(-7).map((val, idx) => {
            const heightPct = Math.max(15, Math.round((val / maxVal) * 100));
            return (
              <div
                key={idx}
                className="flex-1 rounded-xs transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: theme.line,
                }}
              />
            );
          })}
        </div>
      );
    }

    // Default Sparkline Polyline
    const maxVal = Math.max(...sparklineData);
    const minVal = Math.min(...sparklineData);
    const range = maxVal - minVal || 1;
    const points = sparklineData
      .map((v, idx) => {
        const x = (idx / (sparklineData.length - 1)) * 60;
        const y = 18 - ((v - minVal) / range) * 14;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20">
        <polyline
          fill="none"
          stroke={trend === 'down' ? '#F43F5E' : theme.line}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div
      onClick={onViewDetails}
      className={`p-4 rounded-2xl bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 shadow-xs hover:shadow-lg transition-all duration-150 cursor-pointer group flex flex-col justify-between relative overflow-hidden`}
    >
      {/* Top Header: Title, Subtitle, Tooltip & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider line-clamp-1">
              {isAr ? titleAr : titleEn}
            </h3>
            {(tooltipEn || tooltipAr) && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                  }}
                  className="text-slate-400 hover:text-[#00F0FF] transition-colors cursor-pointer"
                  title={isAr ? tooltipAr : tooltipEn}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                {showTooltip && (
                  <div className="absolute z-30 start-0 top-5 w-48 p-2 bg-[#030712] text-white text-[10px] rounded-xl border border-white/10 shadow-xl pointer-events-none">
                    {isAr ? tooltipAr : tooltipEn}
                  </div>
                )}
              </div>
            )}
          </div>
          {(subtitleAr || subtitleEn) && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {isAr ? subtitleAr : subtitleEn}
            </p>
          )}
        </div>

        {/* Icon & Status Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {statusBadge && (
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getBadgeStyle(statusBadge.type)}`}>
              {isAr ? statusBadge.labelAr : statusBadge.labelEn}
            </span>
          )}
          <div className={`w-8 h-8 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold border group-hover:scale-110 transition-transform`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Primary & Secondary Metric */}
      <div className="my-1 space-y-1">
        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-2">
          <span>{value}</span>
          {change && (
            <span
              className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${
                trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : trend === 'down'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'neutral' && <Minus className="w-3 h-3" />}
              <span>{change}</span>
            </span>
          )}
        </div>

        {(secondaryValueAr || secondaryValueEn) && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            {isAr ? secondaryValueAr : secondaryValueEn}
          </p>
        )}
      </div>

      {/* Mini Visualization & Footer */}
      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3 h-3 text-[#00F0FF]" />
          <span>{isAr ? lastUpdatedAr : lastUpdatedEn}</span>
        </div>

        <div className="flex items-center gap-2">
          {renderMiniChart()}
          {onViewDetails && (
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00F0FF] transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
};
