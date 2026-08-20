import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Building2, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  ArrowUpRight
} from 'lucide-react';
import { MasterOrganizationNode } from '../../../types/organizationMaster';

export const CostProfitCenterManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [nodes, setNodes] = useState<MasterOrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/organization/master/nodes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: MasterOrganizationNode[] = await res.json();
        // Filter nodes with financial information
        setNodes(data.filter(n => n.financial && (n.financial.costCenterCode || n.financial.profitCenterCode)));
      }
    } catch (err) {
      console.error('[CostProfitCenterManager] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const filteredNodes = nodes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fin = n.financial;
    return (
      fin.costCenterCode?.toLowerCase().includes(q) ||
      fin.costCenterName?.toLowerCase().includes(q) ||
      fin.profitCenterCode?.toLowerCase().includes(q) ||
      n.name.toLowerCase().includes(q) ||
      n.nameAr.includes(q)
    );
  });

  // Calculate totals
  const totalAllocated = filteredNodes.reduce((acc, curr) => acc + (curr.financial?.budgetAllocated || 0), 0);
  const totalSpent = filteredNodes.reduce((acc, curr) => acc + (curr.financial?.budgetSpent || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const spentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Financial KPIs Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'إجمالي الميزانيات المعتمدة' : 'Total Allocated Budget'}</p>
          <h3 className="text-xl font-black text-slate-900">
            SAR {(totalAllocated / 1000000).toFixed(2)}M
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'إجمالي المصروف المترتب' : 'Total Spent Budget'}</p>
          <h3 className="text-xl font-black text-amber-600">
            SAR {(totalSpent / 1000000).toFixed(2)}M
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'المتبقي في المراكز' : 'Remaining Budget'}</p>
          <h3 className="text-xl font-black text-emerald-600">
            SAR {(totalRemaining / 1000000).toFixed(2)}M
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'نسبة الاستهلاك الكلي' : 'Overall Utilization'}</p>
          <h3 className="text-xl font-black text-sky-600">{spentPct}%</h3>
        </div>
      </div>

      {/* Header & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'إدارة مراكز التكلفة والربحية (Cost & Profit Centers)' : 'Cost & Profit Center Financial Governance'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'ربط الميزانيات والمسؤوليات المالية بالكيانات التنظيمية، مراقبة الاستهلاك والمسؤولين عن مراكز الربحية.'
                : 'Central registry linking financial cost centers, profit centers, budget allocations, and budget owners.'}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 rtl:right-3.5 rtl:left-auto" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث برمز مركز التكلفة أو الاسم...' : 'Search by cost center code or name...'}
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      </div>

      {/* Financial Centers List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
          {isAr ? 'جاري تحميل مراكز التكلفة والربحية...' : 'Loading Cost & Profit Centers...'}
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          {isAr ? 'لا توجد مراكز تكلفة مطابقة.' : 'No matching cost/profit centers registered.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNodes.map(node => {
            const fin = node.financial!;
            const usagePct = fin.budgetAllocated > 0 ? Math.round((fin.budgetSpent / fin.budgetAllocated) * 100) : 0;

            return (
              <div key={node.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono">
                        {fin.costCenterCode}
                      </span>
                      {fin.profitCenterCode && (
                        <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-mono">
                          PC: {fin.profitCenterCode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-slate-900">{fin.costCenterName || (isAr ? node.nameAr : node.name)}</h3>
                    <p className="text-xs text-slate-500 font-medium">{isAr ? `الكيان المالك: ${node.nameAr}` : `Org Entity: ${node.name}`}</p>
                  </div>

                  <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl font-mono">
                    {fin.currency}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">{isAr ? 'نسبة الاستهلاك' : 'Budget Usage'}</span>
                    <span className={usagePct > 85 ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'}>
                      {usagePct}% ({fin.currency} {fin.budgetSpent.toLocaleString()} / {fin.budgetAllocated.toLocaleString()})
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePct > 85 ? 'bg-rose-500' : usagePct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(usagePct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Additional Finance Details */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isAr ? 'مركز المسؤولية' : 'Responsibility Center'}</span>
                    <span className="font-bold text-slate-800">{fin.responsibilityCenter || 'Corporate Finance'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isAr ? 'المسؤول عن الميزانية' : 'Budget Owner'}</span>
                    <span className="font-bold text-slate-800">{fin.budgetOwnerName || node.dataSteward}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
