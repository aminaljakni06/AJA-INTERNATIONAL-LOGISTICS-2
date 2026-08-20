import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Plus,
  Building2,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Clock,
  PieChart,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { CapexProject } from '../../../types/fpa';

export const CapexOpexManagementView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [capexProjects, setCapexProjects] = useState<CapexProject[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Capex State
  const [newProject, setNewProject] = useState({
    projectNameEn: '',
    projectNameAr: '',
    department: 'Transport & Fleet Operations',
    requestedAmountSAR: 5000000,
    projectedRoiPercent: 18.5,
    npvSAR: 1200000,
    irrPercent: 16.0,
    paybackPeriodMonths: 24,
    sponsor: 'Operations Director'
  });

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => setCapexProjects(snapshot.capexProjects));
  }, []);

  const handleCreateCapex = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: CapexProject = {
      id: `cap-${Date.now()}`,
      projectCode: `CAP-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectNameEn: newProject.projectNameEn || 'New Equipment Expansion',
      projectNameAr: newProject.projectNameAr || 'مشروع توسعة جديد',
      department: newProject.department,
      requestedAmountSAR: Number(newProject.requestedAmountSAR),
      approvedAmountSAR: Number(newProject.requestedAmountSAR),
      spentToDateSAR: 0,
      projectedRoiPercent: Number(newProject.projectedRoiPercent),
      npvSAR: Number(newProject.npvSAR),
      irrPercent: Number(newProject.irrPercent),
      paybackPeriodMonths: Number(newProject.paybackPeriodMonths),
      status: 'IN_PROGRESS',
      sponsor: newProject.sponsor
    };

    const { snapshot } = await FPAClient.addCapexProject(created);
    setCapexProjects(snapshot.capexProjects);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{isAr ? 'منظومة إدارة النفقات الرأسمالية والتشغيلية (CAPEX & OPEX)' : 'Capital Expenditure (CAPEX) & Operating Expense (OPEX) Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'دراسات جدوى الاستثمار، صافي القيمة الحالية (NPV) ومعدل العائد الداخلي (IRR)' : 'Capital Project Evaluation, NPV, IRR & Payback Period Analytics'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تقييم وتتبع مشاريع التوسعة الرأسمالية والتحكم بالنفقات التشغيلية الدورية' : 'Analyze ROI, Net Present Value (NPV), Internal Rate of Return (IRR), and track capital deployment across all logistics assets.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'تقديم طلب مشروع رأسمالي (New CAPEX)' : 'New Capital Project Request'}</span>
        </button>
      </div>

      {/* CAPEX Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capexProjects.map(project => (
          <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{project.projectCode} • {project.department}</span>
                <h3 className="text-base font-bold text-white">{isAr ? project.projectNameAr : project.projectNameEn}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                project.status === 'IN_PROGRESS' || project.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {project.status}
              </span>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الميزانية المعتمدة' : 'Approved Budget'}</div>
                <div className="text-sm font-bold text-white">SAR {(project.approvedAmountSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'المصروف حتى الآن' : 'Spent to Date'}</div>
                <div className="text-sm font-bold text-sky-400">SAR {(project.spentToDateSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'العائد المتوقع (ROI)' : 'Projected ROI'}</div>
                <div className="text-sm font-bold text-emerald-400">+{project.projectedRoiPercent}%</div>
              </div>
            </div>

            {/* Investment Valuation Indicators */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'صافي القيمة الحالية (NPV):' : 'Net Present Value (NPV):'}</span>
                <span className="text-emerald-400 font-bold">SAR {(project.npvSAR / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'معدل العائد الداخلي (IRR):' : 'Internal Rate of Return (IRR):'}</span>
                <span className="text-sky-400 font-bold">{project.irrPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'فترة استرداد رأس المال:' : 'Payback Period:'}</span>
                <span className="text-amber-400 font-bold">{project.paybackPeriodMonths} {isAr ? 'شهر' : 'Months'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for New Capital Request */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              {isAr ? 'تقديم مشروع رأسمالي جديد (CAPEX Proposal)' : 'New Capital Project Evaluation Form'}
            </h3>

            <form onSubmit={handleCreateCapex} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'}</label>
                <input
                  type="text"
                  required
                  value={newProject.projectNameEn}
                  onChange={e => setNewProject({ ...newProject, projectNameEn: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'}</label>
                <input
                  type="text"
                  required
                  value={newProject.projectNameAr}
                  onChange={e => setNewProject({ ...newProject, projectNameAr: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'المبلغ المطلوب (SAR)' : 'Requested Capital (SAR)'}</label>
                  <input
                    type="number"
                    value={newProject.requestedAmountSAR}
                    onChange={e => setNewProject({ ...newProject, requestedAmountSAR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'العائد المتوقع (%)' : 'Projected ROI (%)'}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProject.projectedRoiPercent}
                    onChange={e => setNewProject({ ...newProject, projectedRoiPercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  {isAr ? 'إرسال للمراجعة' : 'Submit for Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
