import React, { useEffect, useState } from 'react';
import {
  Truck,
  RotateCcw,
  Wrench,
  AlertOctagon,
  Trash2,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { AssetStatus, FixedAsset } from '../../../types/fixedAssetsReporting';

export const AssetLifecycleView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);

  const refreshAssets = (nextAssets: FixedAsset[], selectedId?: string) => {
    setAssets(nextAssets);
    setSelectedAsset(nextAssets.find(asset => asset.id === selectedId) || nextAssets[0] || null);
  };

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => refreshAssets(snapshot.assets));
  }, []);

  const handleUpdateStatus = async (status: AssetStatus) => {
    if (!selectedAsset) return;
    const { snapshot } = await FixedAssetsReportingClient.updateAssetStatus(selectedAsset.id, status);
    refreshAssets(snapshot.assets, selectedAsset.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Truck className="w-4 h-4" />
            <span>{isAr ? 'منظومة إدارة دورة حياة الأصول والتحويلات والافتراضات' : 'Asset Lifecycle, Movement, Maintenance & Disposal Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'نقل الأصول بين الفروع، الصيانة الوقائية، انخفاض القيمة (IAS 36) والتكهين' : 'Physical Location Transfer, Preventive Maintenance, IAS 36 Impairment & Disposal'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تتبع الانتقالات اللوجستية، جدول أعمال الصيانة، مراجعة هبوط القيمة العادلة وإقفال الأصول' : 'Manage asset transfers across KSA & GCC hubs, record maintenance logs, and trigger disposal gain/loss postings.'}
          </p>
        </div>
      </div>

      {/* Selector & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white font-mono border-b border-slate-800 pb-2">{isAr ? 'اختر الأصل لإدارة دورة حياته' : 'Select Asset for Lifecycle Actions'}</h3>
          {assets.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedAsset(a)}
              className={`p-4 rounded-xl border cursor-pointer font-mono text-xs transition-all ${
                selectedAsset?.id === a.id ? 'bg-sky-500/10 border-sky-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="font-bold text-sky-400">{a.assetNumber}</div>
              <div className="text-white font-bold">{isAr ? a.assetNameAr : a.assetNameEn}</div>
              <div className="text-[10px] text-slate-400 mt-1">{a.branchLocation}</div>
            </div>
          ))}
        </div>

        {/* Right Lifecycle Operations Card */}
        {selectedAsset && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-sky-400">{selectedAsset.assetNumber}</span>
              <h3 className="text-xl font-bold text-white">{isAr ? selectedAsset.assetNameAr : selectedAsset.assetNameEn}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">{isAr ? 'الحالة الحالية:' : 'Current Status:'} <span className="text-emerald-400 font-bold">{selectedAsset.status}</span></p>
            </div>

            {/* Lifecycle Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <button
                onClick={() => handleUpdateStatus('OPERATIONAL')}
                className="p-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isAr ? 'تشغيل / جاهز' : 'Operational'}</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('UNDER_MAINTENANCE')}
                className="p-4 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 font-bold flex flex-col items-center gap-2"
              >
                <Wrench className="w-5 h-5" />
                <span>{isAr ? 'صيانة وإصلاح' : 'Maintenance'}</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('IMPAIRED')}
                className="p-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-400 font-bold flex flex-col items-center gap-2"
              >
                <AlertOctagon className="w-5 h-5" />
                <span>{isAr ? 'هبوط قيمة (IAS 36)' : 'Impairment'}</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('DISPOSED')}
                className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex flex-col items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>{isAr ? 'استبعاد / تكهين' : 'Disposal'}</span>
              </button>
            </div>

            {/* History Timeline */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2 font-mono text-xs">
              <h4 className="font-bold text-slate-200">{isAr ? 'سجل تحركات وعمليات الأصل:' : 'Asset Lifecycle Timeline:'}</h4>
              <div className="text-slate-400 border-l-2 border-sky-500 pl-3 space-y-1">
                <div>2026-08-01: {isAr ? 'تم إجراء الفحص الفني والتحقق من القيمة الدفترية' : 'Annual physical audit verified by finance team.'}</div>
                <div>2024-04-01: {isAr ? 'تمت الرأسمالية والتشغيل الميداني' : 'Initial commissioning and General Ledger capitalization.'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
