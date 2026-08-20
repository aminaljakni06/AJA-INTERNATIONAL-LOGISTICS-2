import React, { useEffect, useState } from 'react';
import {
  Globe2,
  Building2,
  Layers,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { ConsolidatedEntity } from '../../../types/fixedAssetsReporting';

export const CorporateConsolidationView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [entities, setEntities] = useState<ConsolidatedEntity[]>([]);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setEntities(snapshot.consolidatedEntities));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Globe2 className="w-4 h-4" />
            <span>{isAr ? 'منظومة التجميع المالي والتسويات المتبادلة بين الشركات (Corporate Consolidation Engine)' : 'Multi-Entity Group Consolidation & Intercompany Elimination Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تجميع القوائم المالية، استبعاد المعاملات البينية وتحويل العملات' : 'Multi-Company Consolidation, Foreign Currency Translation & Elimination Journals'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تجميع نتائج فروع الخليج والمملكة مع تسوية وشطب الشحنات والمعاملات المتبادلة آلياً' : 'Automate intercompany trade eliminations, multi-currency SAR/AED/USD FX translations, and group minority interest.'}
          </p>
        </div>
      </div>

      {/* Entities Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entities.map(ent => (
          <div key={ent.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{ent.entityCode}</span>
                <h3 className="text-base font-bold text-white">{isAr ? ent.entityNameAr : ent.entityNameEn}</h3>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {ent.ownershipPercentage}% Ownership
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الإيراد المستقل' : 'Standalone Revenue'}</div>
                <div className="text-sm font-bold text-white">SAR {(ent.standaloneRevenueSAR / 1000000).toFixed(1)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الاستبعاد البيني' : 'Intercompany Elimination'}</div>
                <div className="text-sm font-bold text-rose-400">SAR {(ent.intercompanyEliminationSAR / 1000000).toFixed(1)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الإيراد المجمع' : 'Consolidated Net'}</div>
                <div className="text-sm font-bold text-emerald-400">SAR {(ent.consolidatedRevenueSAR / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
