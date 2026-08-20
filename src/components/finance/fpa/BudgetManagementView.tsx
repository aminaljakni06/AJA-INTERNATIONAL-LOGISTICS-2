import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Plus,
  CheckCircle2,
  Lock,
  FileText,
  Search,
  Building2,
  DollarSign,
  Layers,
  Award,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { BudgetVersion, DepartmentBudgetLine, BudgetStatus } from '../../../types/fpa';

export const BudgetManagementView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [budgetVersions, setBudgetVersions] = useState<BudgetVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<BudgetVersion | null>(null);
  const [deptBudgets, setDeptBudgets] = useState<DepartmentBudgetLine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshBudgetData = (versions: BudgetVersion[], departments: DepartmentBudgetLine[], selectedId?: string) => {
    setBudgetVersions(versions);
    setDeptBudgets(departments);
    setSelectedVersion(versions.find(v => v.id === selectedId) || versions[0] || null);
  };

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => refreshBudgetData(snapshot.budgetVersions, snapshot.departmentBudgets));
  }, []);

  const filteredDepts = deptBudgets.filter(d =>
    d.departmentNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.costCenterCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveBudget = async () => {
    if (!selectedVersion) return;
    const { snapshot } = await FPAClient.updateBudgetStatus(selectedVersion.id, 'APPROVED', 'Board of Directors');
    refreshBudgetData(snapshot.budgetVersions, snapshot.departmentBudgets, selectedVersion.id);
  };

  const handleLockBudget = async () => {
    if (!selectedVersion) return;
    const { snapshot } = await FPAClient.updateBudgetStatus(selectedVersion.id, 'LOCKED');
    refreshBudgetData(snapshot.budgetVersions, snapshot.departmentBudgets, selectedVersion.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <PieChart className="w-4 h-4" />
            <span>{isAr ? 'منظومة إدارة الميزانيات التخطيطية والاعتمادات المالية' : 'Enterprise Budgeting, Versioning & Expenditure Controls'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مركز إعداد وتخصيص الميزانيات التشغيلية والرأسمالية' : 'Master Budget Allocations, Departmental Caps & Board Approval Matrix'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'إدارة إصدارات الميزانية السنوية والربع سنوية، قفل الاعتمادات ومتابعة سقف النفقات' : 'Manage master budget baselines, budget locking, departmental cost-center ceilings & variance limits.'}
          </p>
        </div>
      </div>

      {/* Grid: Versions & Department Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Budget Versions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono">{isAr ? 'إصدارات الميزانية' : 'Budget Versions'}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400">{budgetVersions.length}</span>
          </div>

          <div className="space-y-3">
            {budgetVersions.map(v => (
              <div
                key={v.id}
                onClick={() => setSelectedVersion(v)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedVersion && selectedVersion.id === v.id
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 font-mono">{v.versionCode}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    v.status === 'APPROVED' || v.status === 'LOCKED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {v.status}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-bold">{isAr ? v.budgetNameAr : v.budgetNameEn}</div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'إجمالي الاعتماد:' : 'Total Approved:'}</span>
                  <span className="text-emerald-400 font-extrabold">SAR {(v.totalBudgetSAR / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Department Allocations Inspector */}
        {selectedVersion && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-400 font-bold">{selectedVersion.versionCode} • Fiscal Year {selectedVersion.fiscalYear}</div>
                  <h3 className="text-xl font-bold text-white">{isAr ? selectedVersion.budgetNameAr : selectedVersion.budgetNameEn}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedVersion.status === 'UNDER_REVIEW' && (
                    <button
                      onClick={handleApproveBudget}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'اعتماد الميزانية (Board Approval)' : 'Approve Budget'}</span>
                    </button>
                  )}

                  {selectedVersion.status === 'APPROVED' && (
                    <button
                      onClick={handleLockBudget}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isAr ? 'قفل الميزانية (Lock Budget)' : 'Lock Baseline'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Version Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'إجمالي ميزانية الشركة' : 'Master Budget Total'}</div>
                  <div className="text-lg font-bold text-white">SAR {(selectedVersion.totalBudgetSAR / 1000000).toFixed(2)}M</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'ميزانية المشاريع الرأسمالية (CAPEX)' : 'CAPEX Allocation'}</div>
                  <div className="text-lg font-bold text-sky-400">SAR {(selectedVersion.allocatedCapexSAR / 1000000).toFixed(2)}M</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'الميزانية التشغيلية (OPEX)' : 'OPEX Allocation'}</div>
                  <div className="text-lg font-bold text-emerald-400">SAR {(selectedVersion.allocatedOpexSAR / 1000000).toFixed(2)}M</div>
                </div>
              </div>

              {/* Departmental Allocations Table */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{isAr ? 'اعتمادات ومصروفات الأقسام ومراكز التكلفة' : 'Departmental Cost-Center Budget Allocations'}</h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={isAr ? 'بحث بالقسم أو المركز...' : 'Search dept or cost center...'}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                        <th className="p-3">{isAr ? 'القسم / مركز التكلفة' : 'Department & Cost Center'}</th>
                        <th className="p-3">{isAr ? 'الميزانية السنوية' : 'Annual Budget'}</th>
                        <th className="p-3">{isAr ? 'المصروف الفعلي' : 'Actual Spent'}</th>
                        <th className="p-3">{isAr ? 'المحجوز (Encumbered)' : 'Encumbered'}</th>
                        <th className="p-3">{isAr ? 'المتبقي' : 'Remaining'}</th>
                        <th className="p-3">{isAr ? 'الانحراف' : 'Variance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredDepts.map(dept => (
                        <tr key={dept.id} className="hover:bg-slate-800/80">
                          <td className="p-3 font-bold text-white space-y-0.5">
                            <div>{isAr ? dept.departmentNameAr : dept.departmentNameEn}</div>
                            <div className="text-[10px] text-sky-400">{dept.costCenterCode}</div>
                          </td>
                          <td className="p-3 font-bold text-white">SAR {(dept.annualBudgetSAR / 1000000).toFixed(2)}M</td>
                          <td className="p-3 text-slate-200">SAR {(dept.actualSpentSAR / 1000000).toFixed(2)}M</td>
                          <td className="p-3 text-amber-400">SAR {(dept.encumberedSAR / 1000000).toFixed(2)}M</td>
                          <td className="p-3 text-emerald-400 font-bold">SAR {(dept.remainingSAR / 1000000).toFixed(2)}M</td>
                          <td className={`p-3 font-bold ${dept.varianceSAR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {dept.variancePercent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
