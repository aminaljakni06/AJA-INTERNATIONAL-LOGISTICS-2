import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  BarChart3, 
  Users, 
  UserX, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { IdentityGovernanceAnalytics } from '../../../types/identityGovernance';

export const GovernanceAnalyticsView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [stats, setStats] = useState<IdentityGovernanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error('[GovernanceAnalyticsView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>{isAr ? 'تحليلات الحوكمة والامتثال (Identity Governance Analytics)' : 'Identity Compliance Analytics & Metrics'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'مؤشرات أداء الحوكمة ورصد الحسابات الخاملة' : 'Identity Governance Risk & Compliance Dashboard'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'مراقبة فورية لمقاييس الامتثال، الحسابات الفائقة الصلاحية (Privileged Users)، الحسابات الخاملة، ونسبة اكتمال مراجعات الصلاحيات.'
              : 'Real-time visibility into compliance metrics, dormant identities, privilege distribution, and lifecycle stage statistics.'}
          </p>
        </div>

        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'المستخدمون النشطون' : 'Active Identities'}</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.activeUsers ?? 0}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Verified Active Profiles</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'الحسابات الخاملة (>90 يوم)' : 'Dormant Accounts (>90 days)'}</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.dormantAccountsCount ?? 0}</div>
          <p className="text-[11px] text-amber-600 font-medium">Require Security Attestation</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'أصحاب الصلاحيات العالية' : 'Privileged Users'}</span>
            <ShieldAlert className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.privilegedUsersCount ?? 0}</div>
          <p className="text-[11px] text-purple-600 font-medium">Admins & Super Admins</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{isAr ? 'مخالفات SoD المسجلة' : 'SoD Violations'}</span>
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.sodViolationsCount ?? 0}</div>
          <p className="text-[11px] text-rose-600 font-medium">Total Intercepted Conflicts</p>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-600" />
          <span>{isAr ? 'توزيع هويات المنظمة حسب مراحل دورة الحياة' : 'Lifecycle Stage Breakdown'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stats?.lifecycleStageBreakdown && Object.entries(stats.lifecycleStageBreakdown).length > 0 ? (
            Object.entries(stats.lifecycleStageBreakdown).map(([stage, count]) => (
              <div key={stage} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase font-mono">{stage}</span>
                <div className="text-xl font-bold text-slate-900">{count}</div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-xs text-slate-400 p-4 text-center">
              {isAr ? 'جاري تجميع توزيع مراحـل دورة الحياة...' : 'Lifecycle distribution metrics compiled.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
