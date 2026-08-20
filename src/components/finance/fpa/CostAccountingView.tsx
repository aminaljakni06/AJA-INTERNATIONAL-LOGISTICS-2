import React, { useEffect, useState } from 'react';
import {
  Layers,
  PieChart,
  Sliders,
  TrendingUp,
  Building2,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FPAClient } from '../../../services/fpaClient';
import { CostAllocationRule } from '../../../types/fpa';

export const CostAccountingView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [rules, setRules] = useState<CostAllocationRule[]>([]);

  useEffect(() => {
    void FPAClient.getSnapshot().then(snapshot => setRules(snapshot.costAllocationRules));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'منظومة محاسبة التكاليف والتوزيعات الإدارية (Activity-Based Costing)' : 'Cost Accounting, Overhead Pools & Activity-Based Costing (ABC) Rules'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'توزيع التكاليف غير المباشرة ومجمعات المصاريف على مراكز الربحية' : 'Overhead Cost Pools, Drivers & Activity Allocation Matrices'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'قواعد توزيع التكاليف المشتركة والمراكز اللوجستية بناءً على ساعات التشغيل أو الكيلومترات المقطوعة' : 'Allocate central logistics overhead, hub utilities, and management pools to operational profit centers.'}
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-6">
        {rules.map(rule => (
          <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{rule.ruleCode}</span>
                <h3 className="text-base font-bold text-white">{isAr ? rule.sourcePoolAr : rule.sourcePoolEn}</h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">{isAr ? 'إجمالي المجمع (Pool):' : 'Total Pool:'}</div>
                <div className="text-lg font-bold text-emerald-400">SAR {(rule.poolAmountSAR / 1000000).toFixed(2)}M</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'محرك التوزيع (Allocation Driver):' : 'Allocation Driver:'}</span>
              <span className="text-sky-400 font-bold">{isAr ? rule.allocationDriverAr : rule.allocationDriverEn}</span>
            </div>

            {/* Target Departments Breakdown */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{isAr ? 'توزيع الحصص على القطاعات التشغيلية' : 'Target Allocation Breakdown'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {rule.targetDepartments.map((t, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="text-white font-bold">{isAr ? t.departmentAr : t.departmentEn}</div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700/60">
                      <span>{t.percentage}%</span>
                      <span className="text-emerald-400 font-bold">SAR {(t.allocatedAmountSAR / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
