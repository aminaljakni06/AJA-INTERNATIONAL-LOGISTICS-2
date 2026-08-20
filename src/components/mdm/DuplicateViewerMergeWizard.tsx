import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { GitMerge, AlertTriangle, Check, ArrowRight, ShieldCheck, Database, RefreshCw } from 'lucide-react';
import { DuplicatePair, MasterDataRecord } from '../../types/mdm';

export const DuplicateViewerMergeWizard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [selectedPair, setSelectedPair] = useState<DuplicatePair | null>(null);
  const [recordA, setRecordA] = useState<MasterDataRecord | null>(null);
  const [recordB, setRecordB] = useState<MasterDataRecord | null>(null);
  const [fieldResolutions, setFieldResolutions] = useState<Partial<MasterDataRecord>>({});
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/mdm/duplicates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDuplicates(await res.json());
      }
    } catch (err) {
      console.error('[DuplicateViewer] Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleSelectPair = async (pair: DuplicatePair) => {
    setSelectedPair(pair);
    const token = localStorage.getItem('aja_auth_token');

    try {
      const [resA, resB] = await Promise.all([
        fetch(`/api/mdm/records/${pair.recordAId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/mdm/records/${pair.recordBId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resA.ok && resB.ok) {
        const dataA = await resA.json();
        const dataB = await resB.json();
        setRecordA(dataA.record);
        setRecordB(dataB.record);

        // Default resolutions to Record A
        setFieldResolutions({
          code: dataA.record.code,
          nameAr: dataA.record.nameAr,
          nameEn: dataA.record.nameEn,
          description: dataA.record.description || dataB.record.description,
          owner: dataA.record.owner,
          steward: dataA.record.steward
        });
      }
    } catch (err) {
      console.error('[SelectPair] Error:', err);
    }
  };

  const executeMerge = async () => {
    if (!selectedPair || !recordA || !recordB) return;
    setMerging(true);

    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/mdm/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          primaryId: recordA.id,
          secondaryId: recordB.id,
          fieldResolutions
        })
      });

      if (res.ok) {
        setSelectedPair(null);
        setRecordA(null);
        setRecordB(null);
        fetchDuplicates();
      }
    } catch (err) {
      console.error('[ExecuteMerge] Error:', err);
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-2xl p-6 shadow-md border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <GitMerge className="w-4 h-4" />
            <span>{isAr ? 'مركز اكتشاف ودمج البيانات المكررة' : 'Duplicate Detection & Merge Center'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'إدارة الثنائيات المكررة وتصفية السجلات' : 'Master Record Deduplication & Merge Wizard'}</h2>
          <p className="text-xs text-amber-200/80">
            {isAr ? 'خوارزمية الذكاء الاصطناعي تقوم بفحص وتقييم التشابه بين السجلات لحماية صحة موثوقية البيانات.' : 'Automated fuzzy matching highlights candidate duplicate records and provides side-by-side merging.'}
          </p>
        </div>

        <button
          onClick={fetchDuplicates}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'إعادة فحص التكرار' : 'Re-scan Duplicates'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flagged Duplicates List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>{isAr ? 'الثنائيات المكتشفة' : 'Flagged Duplicate Pairs'}</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {duplicates.filter(d => d.status === 'OPEN').length}
            </span>
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {duplicates.filter(d => d.status === 'OPEN').map(pair => (
              <div
                key={pair.id}
                onClick={() => handleSelectPair(pair)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  selectedPair?.id === pair.id
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                    {pair.similarityScore}% {isAr ? 'تشابه' : 'Similarity'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{pair.domain}</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-semibold text-slate-800 truncate">A: {pair.recordAName}</div>
                  <div className="font-semibold text-slate-800 truncate">B: {pair.recordBName}</div>
                </div>

                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg font-mono leading-tight">
                  {pair.matchReason}
                </div>
              </div>
            ))}

            {duplicates.filter(d => d.status === 'OPEN').length === 0 && (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold">{isAr ? 'لا توجد سجلات مكررة غير معالجة!' : 'No open duplicate candidates found!'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Merge Wizard Side-by-Side Comparison */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {selectedPair && recordA && recordB ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{isAr ? 'معالج الدمج والربط الهيكلي' : 'Field Resolution & Merge Wizard'}</h3>
                  <p className="text-xs text-slate-500">{isAr ? 'حدد القيم المفضلة لكل حقل لدمج السجل الفرعي بالسجل الأساسي.' : 'Select preferred field values to merge secondary into primary.'}</p>
                </div>

                <button
                  onClick={executeMerge}
                  disabled={merging}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  <GitMerge className="w-4 h-4" />
                  <span>{merging ? (isAr ? 'جاري الدمج...' : 'Merging...') : (isAr ? 'تأفيذ الدمج والتصفية' : 'Execute Merge')}</span>
                </button>
              </div>

              {/* Side by Side Resolution Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="p-3">{isAr ? 'الحقل' : 'Field'}</th>
                      <th className="p-3 text-emerald-400">Record A (Primary - Keep ID)</th>
                      <th className="p-3 text-amber-400">Record B (Secondary - Archive)</th>
                      <th className="p-3 text-sky-400">{isAr ? 'النتيجة المختارة' : 'Merged Output'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {/* Business Code */}
                    <tr>
                      <td className="p-3 font-sans font-bold text-slate-700">{isAr ? 'الكود' : 'Code'}</td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, code: recordA.code })}
                        className={`p-3 cursor-pointer hover:bg-emerald-50 ${fieldResolutions.code === recordA.code ? 'bg-emerald-100/60 font-bold' : ''}`}
                      >
                        {recordA.code}
                      </td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, code: recordB.code })}
                        className={`p-3 cursor-pointer hover:bg-amber-50 ${fieldResolutions.code === recordB.code ? 'bg-amber-100/60 font-bold' : ''}`}
                      >
                        {recordB.code}
                      </td>
                      <td className="p-3 font-bold text-slate-900 bg-slate-50">{fieldResolutions.code}</td>
                    </tr>

                    {/* Arabic Name */}
                    <tr>
                      <td className="p-3 font-sans font-bold text-slate-700">{isAr ? 'الاسم بالعربية' : 'Arabic Name'}</td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, nameAr: recordA.nameAr })}
                        className={`p-3 font-sans cursor-pointer hover:bg-emerald-50 ${fieldResolutions.nameAr === recordA.nameAr ? 'bg-emerald-100/60 font-bold' : ''}`}
                      >
                        {recordA.nameAr}
                      </td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, nameAr: recordB.nameAr })}
                        className={`p-3 font-sans cursor-pointer hover:bg-amber-50 ${fieldResolutions.nameAr === recordB.nameAr ? 'bg-amber-100/60 font-bold' : ''}`}
                      >
                        {recordB.nameAr}
                      </td>
                      <td className="p-3 font-sans font-bold text-slate-900 bg-slate-50">{fieldResolutions.nameAr}</td>
                    </tr>

                    {/* English Name */}
                    <tr>
                      <td className="p-3 font-sans font-bold text-slate-700">{isAr ? 'الاسم بالإنجليزية' : 'English Name'}</td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, nameEn: recordA.nameEn })}
                        className={`p-3 font-sans cursor-pointer hover:bg-emerald-50 ${fieldResolutions.nameEn === recordA.nameEn ? 'bg-emerald-100/60 font-bold' : ''}`}
                      >
                        {recordA.nameEn}
                      </td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, nameEn: recordB.nameEn })}
                        className={`p-3 font-sans cursor-pointer hover:bg-amber-50 ${fieldResolutions.nameEn === recordB.nameEn ? 'bg-amber-100/60 font-bold' : ''}`}
                      >
                        {recordB.nameEn}
                      </td>
                      <td className="p-3 font-sans font-bold text-slate-900 bg-slate-50">{fieldResolutions.nameEn}</td>
                    </tr>

                    {/* Description */}
                    <tr>
                      <td className="p-3 font-sans font-bold text-slate-700">{isAr ? 'الوصف' : 'Description'}</td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, description: recordA.description })}
                        className={`p-3 font-sans text-xs cursor-pointer hover:bg-emerald-50 ${fieldResolutions.description === recordA.description ? 'bg-emerald-100/60 font-bold' : ''}`}
                      >
                        {recordA.description || '-'}
                      </td>
                      <td 
                        onClick={() => setFieldResolutions({ ...fieldResolutions, description: recordB.description })}
                        className={`p-3 font-sans text-xs cursor-pointer hover:bg-amber-50 ${fieldResolutions.description === recordB.description ? 'bg-amber-100/60 font-bold' : ''}`}
                      >
                        {recordB.description || '-'}
                      </td>
                      <td className="p-3 font-sans text-xs font-bold text-slate-900 bg-slate-50">{fieldResolutions.description || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Database className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">{isAr ? 'اختر ثنائياً من القائمة الجانبية لبدء معالجة الدمج' : 'Select a duplicate pair from the left sidebar to initiate merging.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
