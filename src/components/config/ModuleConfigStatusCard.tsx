import React from 'react';
import { Layers, ShieldAlert, CheckCircle, Wrench, Eye, AlertTriangle } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { ModuleConfigStatus } from '../../types/config';

export const ModuleConfigStatusCard: React.FC = () => {
  const { moduleConfigs, updateModuleConfig } = useConfig();

  const statusBadges: Record<ModuleConfigStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PRODUCTION: { label: 'إنتاجي (Live)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    BETA: { label: 'تجريبي (Beta)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Layers className="w-3.5 h-3.5" /> },
    EXPERIMENTAL: { label: 'مختبري (Experimental)', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    MAINTENANCE: { label: 'صيانة (Maintenance)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: <Wrench className="w-3.5 h-3.5" /> },
    READ_ONLY: { label: 'قراءة فقط (Read Only)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Eye className="w-3.5 h-3.5" /> },
    DISABLED: { label: 'معطل (Disabled)', color: 'bg-slate-800 text-slate-500 border-slate-700', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  };

  const statusOptions: ModuleConfigStatus[] = ['PRODUCTION', 'BETA', 'EXPERIMENTAL', 'MAINTENANCE', 'READ_ONLY', 'DISABLED'];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          حالات الوحدات التشغيلية للمنظومة (ERP Module Lifecycle)
        </h2>
        <p className="text-xs text-slate-400">
          إدارة الصيانة والتحكم الشامل بحالة الجاهزية التشغيلية لكل وحدة برمجية في النظام
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleConfigs.map((mod) => {
          const badge = statusBadges[mod.status];
          return (
            <div key={mod.moduleKey} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{mod.moduleName}</h3>
                  <code className="text-[10px] text-slate-500 font-mono">{mod.moduleKey}</code>
                </div>
                <span className={`flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-semibold text-slate-400">تعديل الحالة التشغيلية:</label>
                <select
                  value={mod.status}
                  onChange={(e) => updateModuleConfig(mod.moduleKey, e.target.value as ModuleConfigStatus)}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {statusBadges[opt].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
