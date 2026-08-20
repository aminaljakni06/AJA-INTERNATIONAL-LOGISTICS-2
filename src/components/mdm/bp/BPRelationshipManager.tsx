import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Network, Plus, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { BPRelationship } from '../../../types/businessPartner';

export const BPRelationshipManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [relationships, setRelationships] = useState<BPRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRels = async () => {
      try {
        const token = localStorage.getItem('aja_auth_token');
        const res = await fetch('/api/business-partners/relationships', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setRelationships(await res.json());
        }
      } catch (err) {
        console.error('Failed to load relationships', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRels();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'شبكة علاقات شركاء الأعمال (Cross-Partner Relationships)' : 'Business Partner Relationship Network'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isAr ? 'ربط الشركات التابعة، اتفاقيات المورد والعميل، والشراكات الاستراتيجية.' : 'Map Parent-Subsidiary hierarchy, Vendor-Customer contracts, and Strategic Partnerships.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {relationships.map(rel => (
          <div key={rel.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-sm text-center">
                <p className="font-black text-xs">{rel.sourceBpName}</p>
                <span className="text-[10px] text-slate-400 block font-mono">{rel.sourceBpId}</span>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {rel.relationshipType}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 my-1 rtl:rotate-180" />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-sm text-center">
                <p className="font-black text-xs">{rel.targetBpName}</p>
                <span className="text-[10px] text-slate-400 block font-mono">{rel.targetBpId}</span>
              </div>
            </div>

            <div className="text-right rtl:text-left space-y-1">
              <p className="text-slate-600 font-medium">{rel.description}</p>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Effective: {rel.effectiveDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
