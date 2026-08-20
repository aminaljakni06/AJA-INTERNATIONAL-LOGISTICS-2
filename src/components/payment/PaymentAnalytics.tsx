import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Building2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export interface PaymentAnalyticsProps {
  className?: string;
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { token } = useAuth();

  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'YTD'>('30D');
  const [loading, setLoading] = useState(false);

  // Revenue & Volume Trend Data
  const trendData = [
    { date: 'Jul 01', revenue: 142000, transactions: 128, authorised: 122, refused: 6 },
    { date: 'Jul 05', revenue: 189000, transactions: 164, authorised: 158, refused: 6 },
    { date: 'Jul 10', revenue: 215000, transactions: 192, authorised: 185, refused: 7 },
    { date: 'Jul 15', revenue: 268000, transactions: 240, authorised: 232, refused: 8 },
    { date: 'Jul 20', revenue: 310000, transactions: 285, authorised: 275, refused: 10 },
    { date: 'Jul 25', revenue: 385000, transactions: 340, authorised: 328, refused: 12 },
    { date: 'Jul 30', revenue: 420000, transactions: 380, authorised: 368, refused: 12 },
  ];

  // Payment Method Distribution Data
  const methodDistribution = [
    { name: isAr ? 'بطاقة مدى (MADA)' : 'MADA Local', value: 45, amount: 1890000, color: '#10B981' },
    { name: 'Visa / MasterCard', value: 28, amount: 1176000, color: '#00F0FF' },
    { name: 'Apple Pay', value: 15, amount: 630000, color: '#38BDF8' },
    { name: 'Google Pay', value: 7, amount: 294000, color: '#F59E0B' },
    { name: isAr ? 'سداد المباشر' : 'SADAD Pay', value: 5, amount: 210000, color: '#A855F7' },
  ];

  // Success vs Refusal Breakdown Data
  const statusData = [
    { name: isAr ? 'مقبول (Authorised)' : 'Authorised', value: 96.8, count: 1708, color: '#10B981' },
    { name: isAr ? 'مرفوض من البنك' : 'Refused (Issuer)', value: 2.1, count: 37, color: '#EF4444' },
    { name: isAr ? 'فشل 3D Secure' : '3DS Failed', value: 0.8, count: 14, color: '#F97316' },
    { name: isAr ? 'ملغى من العميل' : 'Cancelled', value: 0.3, count: 5, color: '#64748B' },
  ];

  // Monthly Recurring Billing (Enterprise) Data
  const recurringData = [
    { month: 'Jan', count: 12, volume: 180000 },
    { month: 'Feb', count: 18, volume: 270000 },
    { month: 'Mar', count: 25, volume: 380000 },
    { month: 'Apr', count: 34, volume: 510000 },
    { month: 'May', count: 42, volume: 630000 },
    { month: 'Jun', count: 58, volume: 870000 },
    { month: 'Jul', count: 72, volume: 1080000 },
  ];

  // Key KPI Summary Calculations
  const totalRevenue = 4200000;
  const totalTransactions = 1764;
  const successRate = 96.8;
  const avgTicket = Math.round(totalRevenue / totalTransactions);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl ${className}`}>
      {/* Top Section Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#00F0FF] text-xs uppercase tracking-widest">
              Adyen Payments Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              LIVE GATEWAY LOGS
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            {isAr ? 'تحليلات بوابة السداد وإحصائيات Adyen' : 'Adyen Portal Revenue & Transaction Analytics'}
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {(['7D', '30D', '90D', 'YTD'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-[#082F49] text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed Volume */}
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">
              {isAr ? 'إجمالي الإيرادات المحصلة:' : 'Total Processed Volume:'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#00F0FF] font-mono">
            {totalRevenue.toLocaleString()} <span className="text-xs text-white">SAR</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.5% {isAr ? 'مقارنة بالفترة السابقة' : 'vs last period'}</span>
          </div>
        </div>

        {/* Transaction Success Rate */}
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">
              {isAr ? 'نسبة القبول (Success Rate):' : 'PSP Authorisation Rate:'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {successRate}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'أداء ممتاز شبكة مدى و Adyen' : 'Optimal issuer acceptance'}</span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">
              {isAr ? 'عدد العمليات المنفذة:' : 'Completed Transactions:'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalTransactions.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{isAr ? 'متوسط العملية:' : 'Avg Ticket:'}</span>
            <strong className="text-slate-200 font-mono">{avgTicket.toLocaleString()} SAR</strong>
          </div>
        </div>

        {/* Enterprise Auto-Debit Recurring Volume */}
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">
              {isAr ? 'عقود الخصم الدوري للشركات:' : 'Enterprise Recurring Vault:'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            1,080,000 <span className="text-xs text-white">SAR</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>72 {isAr ? 'عقد شركة نشط' : 'Active Corporate Profiles'}</span>
          </div>
        </div>
      </div>

      {/* Main Revenue Growth Area Chart */}
      <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'نمو الإيرادات وحجم المعاملات المكتملة عبر الزمن' : 'Adyen Revenue Growth & Transaction Velocity'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">SAR (Saudi Riyal)</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D16',
                  borderColor: '#1E293B',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#FFF',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name={isAr ? 'الإيرادات (ر.س)' : 'Revenue (SAR)'}
                stroke="#00F0FF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="authorised"
                name={isAr ? 'العمليات المقبولة' : 'Authorised Count'}
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTrans)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns Grid: Payment Method Breakdown & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'توزيع الوسائل المستعملة (MADA, Visa, Apple Pay...)' : 'Payment Method Share & Volume'}
              </h3>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {methodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D16',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.amount.toLocaleString()} SAR)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300 font-bold">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recurring Billing Enterprise Expansion */}
        <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'نمو الخصم الدوري التلقائي المبرمج للشركات' : 'Adyen Vault Recurring Billing Growth'}
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recurringData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D16',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                />
                <Bar
                  dataKey="volume"
                  name={isAr ? 'حجم الخصم الآلي (ر.س)' : 'Auto Debit Volume (SAR)'}
                  fill="#F59E0B"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
