import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Network, Plus, Trash2, ArrowRight, Database, RefreshCw, Layers } from 'lucide-react';
import { MasterRelationship, MasterDataRecord } from '../../types/mdm';

export const ReferenceRelationshipGraphView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [relationships, setRelationships] = useState<MasterRelationship[]>([]);
  const [records, setRecords] = useState<MasterDataRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for new relationship
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relationshipType, setRelationshipType] = useState<MasterRelationship['relationshipType']>('BELONGS_TO');
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const [resRels, resRecords] = await Promise.all([
        fetch('/api/mdm/relationships', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mdm/records', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resRels.ok && resRecords.ok) {
        setRelationships(await resRels.json());
        setRecords(await resRecords.json());
      }
    } catch (err) {
      console.error('[Relationships] Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    const sourceRec = records.find(r => r.id === sourceId);
    const targetRec = records.find(r => r.id === targetId);
    if (!sourceRec || !targetRec) return;

    setAdding(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const payload = {
        sourceEntityId: sourceRec.id,
        sourceDomain: sourceRec.domain,
        targetEntityId: targetRec.id,
        targetDomain: targetRec.domain,
        relationshipType
      };

      const res = await fetch('/api/mdm/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSourceId('');
        setTargetId('');
        fetchData();
      }
    } catch (err) {
      console.error('[AddRelationship] Error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/mdm/relationships/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('[DeleteRelationship] Error:', err);
    }
  };

  const getRecordLabel = (id: string) => {
    const r = records.find(rec => rec.id === id);
    if (!r) return id;
    return `${r.code} - ${isAr ? r.nameAr : r.nameEn} (${r.domain})`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs tracking-wider uppercase">
            <Network className="w-4 h-4" />
            <span>{isAr ? 'شبكة العلاقات بين الكيانات الرئيسية' : 'Inter-Entity Master Relationship Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{isAr ? 'روابط واقتران البيانات الرئيسية' : 'Cross-Domain Master Entity Relationships'}</h2>
          <p className="text-xs text-slate-500">
            {isAr ? 'ربط السجلات عبر المجالات اللوجستية (مثل ربط الميناء بالدولة، والمركبة بالسائق، والمستودع بالفرع).' : 'Map parent-child, operational, and structural dependencies across all master data domains.'}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {/* Add New Relationship Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" />
          <span>{isAr ? 'إضافة رابطة جديدة بين سجلين' : 'Establish New Entity Relationship'}</span>
        </h3>

        <form onSubmit={handleAddRelationship} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'السجل المصدر (Source Entity)' : 'Source Entity'}</label>
            <select
              value={sourceId}
              onChange={e => setSourceId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="">{isAr ? '-- اختر السجل المصدر --' : '-- Select Source --'}</option>
              {records.map(r => (
                <option key={r.id} value={r.id}>{r.code} - {isAr ? r.nameAr : r.nameEn} ({r.domain})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'نوع العلاقة (Type)' : 'Relationship Type'}</label>
            <select
              value={relationshipType}
              onChange={e => setRelationshipType(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="BELONGS_TO">BELONGS_TO (ينتمي إلى)</option>
              <option value="OPERATED_BY">OPERATED_BY (مشغّل بواسطة)</option>
              <option value="PARENT_CHILD">PARENT_CHILD (أب - ابن)</option>
              <option value="ASSIGNED_TO">ASSIGNED_TO (مخصص لـ)</option>
              <option value="MAPPED_TO">MAPPED_TO (مقترن بـ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'السجل الهدف (Target Entity)' : 'Target Entity'}</label>
            <select
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="">{isAr ? '-- اختر السجل الهدف --' : '-- Select Target --'}</option>
              {records.map(r => (
                <option key={r.id} value={r.id}>{r.code} - {isAr ? r.nameAr : r.nameEn} ({r.domain})</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding || !sourceId || !targetId}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              {adding ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'ربط السجلين' : 'Create Link')}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Relationships List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relationships.map(rel => (
          <div key={rel.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex items-center justify-between">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-900">{getRecordLabel(rel.sourceEntityId)}</div>

              <div className="flex items-center gap-2 my-1">
                <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-mono font-bold rounded text-[10px]">
                  {rel.relationshipType}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 text-slate-400 ${isAr ? 'rotate-180' : ''}`} />
              </div>

              <div className="font-semibold text-slate-700">{getRecordLabel(rel.targetEntityId)}</div>
            </div>

            <button
              onClick={() => handleDeleteRelationship(rel.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              title={isAr ? 'حذف العلاقة' : 'Delete Link'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {relationships.length === 0 && !loading && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            {isAr ? 'لا توجد روابط بين السجلات حالياً.' : 'No entity relationships established yet.'}
          </div>
        )}
      </div>
    </div>
  );
};
