import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { GitMerge, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BPDuplicatePair } from '../../../types/businessPartner';

export const BPDuplicateResolutionWizard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [duplicates, setDuplicates] = useState<BPDuplicatePair[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDuplicates = async () => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/business-partners/duplicates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDuplicates(await res.json());
      }
    } catch (err) {
      console.error('Failed to load duplicates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleResolve = async (id: string, action: 'MERGE' | 'DISMISS') => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/business-partners/duplicates/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchDuplicates();
      }
    } catch (err) {
      console.error('Resolve duplicate error', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'معالج كشف وإزالة التكرار (Duplicate Resolution Wizard)' : 'Business Partner Duplicate Resolution Wizard'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isAr ? 'التحقق من السجلات المتشابهة ودمج الكيانات لتفادي الازدواجية في الحسابات.' : 'Detect similar partner records based on CR, VAT, and Name similarity to execute golden record merges.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {duplicates.map(dup => (
          <div key={dup.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                  {dup.similarityScore}% Match
                </span>
                <span className="font-bold text-slate-800">{dup.matchReason}</span>
              </div>

              {dup.status === 'OPEN' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolve(dup.id, 'MERGE')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'دمج الكيانين (Merge)' : 'Merge Partner Records'}</span>
                  </button>
                  <button
                    onClick={() => handleResolve(dup.id, 'DISMISS')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تجاهل' : 'Dismiss'}</span>
                  </button>
                </div>
              ) : (
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold rounded">
                  Resolved: {dup.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200/60">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold block">RECORD A ({dup.partnerAId})</span>
                <p className="font-black text-slate-900">{dup.partnerAName}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold block">RECORD B ({dup.partnerBId})</span>
                <p className="font-black text-slate-900">{dup.partnerBName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
