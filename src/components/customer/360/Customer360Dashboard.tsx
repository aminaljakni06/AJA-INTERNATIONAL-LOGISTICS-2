import React from 'react';
import {
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Customer360Profile, Customer360KpiSummary, CustomerTimelineEntry } from '../../../types/customer360';

interface Customer360DashboardProps {
  kpis: Customer360KpiSummary | null;
  customers: Customer360Profile[];
  recentTimeline: CustomerTimelineEntry[];
  onSelectCustomer: (cust: Customer360Profile) => void;
  onNavigateTab: (tab: string) => void;
}

export const Customer360Dashboard: React.FC<Customer360DashboardProps> = ({
  kpis,
  customers,
  recentTimeline,
  onSelectCustomer,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 text-slate-100">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/90 border-slate-700/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">إجمالي العملاء المسجلين</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{kpis?.totalCustomers || customers.length}</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{kpis?.activeCustomers || 0} حساب نشط بنسبة 100%</span>
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">متوسط مؤشر الصحة للعملاء</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{kpis?.averageHealthScore || 90}/100</h3>
              <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>تقييم ممتازة وأداء مستقر</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">إجمالي القيمة التراكمية (LTV)</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">
                {(kpis?.totalLifetimeRevenue || 0).toLocaleString()} <span className="text-xs">ر.س</span>
              </h3>
              <p className="text-[11px] text-blue-300 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>نمو سنوي +24.5% في المحفظة</span>
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">الحسابات تحت المتابعة المباشرة</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{kpis?.vipCustomers || 1}</h3>
              <p className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>حسابات كبار العملاء (VIP Enterprise)</span>
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Customers List & Recent Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span>دليل العملاء والحسابات الموحدة 360</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('profile')}
              className="text-xs border-slate-600 text-slate-200"
            >
              عرض كافة الملفات
            </Button>
          </div>

          <Card className="bg-slate-800 border-slate-700 text-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3">اسم الشركة / العميل</th>
                    <th className="p-3">النوع / القطاع</th>
                    <th className="p-3">مؤشر الصحة</th>
                    <th className="p-3">المخاطر</th>
                    <th className="p-3">القيمة التراكمية LTV</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{cust.companyName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                          <span>{cust.id}</span>
                          <span>•</span>
                          <span className="text-amber-300/80">{cust.bpId}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-amber-300">
                          {cust.customerType}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cust.industry}</div>
                      </td>
                      <td className="p-3 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cust.healthScore?.overallScore >= 85
                                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-900/50 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {cust.healthScore?.overallScore}/100 ({cust.healthScore?.status})
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            cust.riskScore?.overallRisk === 'LOW'
                              ? 'bg-blue-900/50 text-blue-300 border border-blue-500/40'
                              : 'bg-rose-900/50 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {cust.riskScore?.overallRisk}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-300">
                        {(cust.clv?.totalRevenue || 0).toLocaleString()} SAR
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectCustomer(cust)}
                          className="text-amber-400 hover:text-amber-300 text-[11px] p-1 flex items-center gap-1"
                        >
                          <span>عرض 360</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Timeline Widget & AI Insight Teaser */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>آخر الأحداث والأنشطة 360</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('timeline')}
              className="text-xs text-slate-300"
            >
              التسلسل الكامل
            </Button>
          </div>

          <Card className="bg-slate-800 border-slate-700 p-4 space-y-3">
            {recentTimeline.slice(0, 4).map((item) => (
              <div key={item.id} className="p-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">{item.title}</span>
                  <span className="text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>بواسطة: {item.actorName}</span>
                  <span className="px-1.5 py-0.2 bg-slate-800 rounded font-mono text-amber-400/80">
                    {item.category || item.type}
                  </span>
                </div>
              </div>
            ))}
          </Card>

          {/* AI Platform Teaser */}
          <Card className="bg-gradient-to-br from-amber-950/40 via-slate-800 to-slate-900 border border-amber-500/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>تحليلات الذكاء الاصطناعي المباشرة (Gemini AI)</span>
            </div>
            <p className="text-xs text-slate-200">
              تم رصد فرص توسع ونمو بنسبة 18% للعميل الرئيسي شركة السيف عبر تفعيل مستودعات التبريد الذكية.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('ai-insights')}
              className="w-full text-xs gap-1.5 mt-2 bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              استعراض توصيات الذكاء الاصطناعي
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
