import React from 'react';
import {
  MapPin,
  Target,
  Award,
  Users,
  Building2,
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Card } from '../common/Card';
import { SalesTerritory, SalesTarget, CommissionRule } from '../../types/sales';

interface TerritoriesTargetCenterProps {
  territories: SalesTerritory[];
  targets: SalesTarget[];
  commissionRules: CommissionRule[];
  loading: boolean;
}

export const TerritoriesTargetCenter: React.FC<TerritoriesTargetCenterProps> = ({
  territories,
  targets,
  commissionRules,
  loading,
}) => {
  return (
    <div className="space-y-6">
      {/* Territories Overview */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#EA580C]" />
          <span>الأقاليم والمناطق البيعية الاستراتيجية (Sales Territories)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {territories.map(terr => (
            <Card key={terr.id} className="p-4 bg-slate-900/90 border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {terr.code}
                  </span>
                  <h4 className="font-bold text-base text-slate-100 mt-1">{terr.territoryName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">مسؤول القطاع: {terr.teamLeadName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">قيمة الأنبوب</span>
                  <span className="font-bold font-mono text-sm text-emerald-400">
                    {terr.totalPipelineValue.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                {terr.cities.map((city, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {city}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60 font-mono">
                <div>
                  <span className="text-slate-400">الفرص المحتملة:</span>{' '}
                  <strong className="text-slate-200">{terr.activeLeadsCount}</strong>
                </div>
                <div>
                  <span className="text-slate-400">الفرص النشطة:</span>{' '}
                  <strong className="text-slate-200">{terr.activeOpportunitiesCount}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sales Quotas & Performance */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>تتبع المستهدفات الفردية والأداء البيعي (Sales Quotas & Targets)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targets.map(tgt => (
            <Card key={tgt.id} className="p-4 bg-slate-900/90 border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{tgt.salespersonName}</h4>
                  <p className="text-xs text-slate-400">{tgt.territoryName} • {tgt.periodLabel}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">نسبة الإنجاز</span>
                  <span className="font-bold font-mono text-base text-emerald-400">{tgt.achievementPct}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, tgt.achievementPct)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 block">المحقق:</span>
                  <span className="font-bold text-slate-100">{tgt.achievedRevenue.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-slate-400 block">المستهدف الكلي:</span>
                  <span className="font-bold text-slate-300">{tgt.revenueTarget.toLocaleString()} SAR</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Commission Rules */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>قواعد العمولات والمكافآت الحافزة (Commission Rules Engine)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commissionRules.map(rule => (
            <Card key={rule.id} className="p-4 bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-100">{rule.ruleName}</h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  مفعلة
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded border border-slate-700/80">
                {rule.description}
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800 font-mono text-center">
                <div>
                  <span className="text-slate-400 block">النسبة الأساسية</span>
                  <span className="font-bold text-emerald-400">{rule.baseRatePct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">مكافأة التجاوز</span>
                  <span className="font-bold text-amber-400">+{rule.bonusTierRatePct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">الحد الأدنى للربح</span>
                  <span className="font-bold text-slate-200">{rule.minMarginPct}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
