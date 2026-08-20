import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FileText, Loader2, Power, Trash2 } from 'lucide-react';
import { AssetRecord, DigitalAssetRecord } from '../../../types/productResourceMaster';
import { ProductResourceMasterClient as ProductResourceMasterService } from '../../../services/productResourceMasterClient';
import { useEnterpriseConfirmation } from '../../../hooks/useEnterpriseConfirmation';
import { useEnterpriseToast } from '../../../hooks/useEnterpriseToast';

export const AssetManager: React.FC = () => {
  const { language } = useLanguage();
  const { confirmAction } = useEnterpriseConfirmation();
  const { toastSuccess, toastError } = useEnterpriseToast();
  const isAr = language === 'ar';

  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [digitalAssets, setDigitalAssets] = useState<DigitalAssetRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'DIGITAL'>('ASSETS');
  const [busyResourceId, setBusyResourceId] = useState<string | null>(null);

  const loadData = async () => {
    const aList = await ProductResourceMasterService.getAssets();
    const daList = await ProductResourceMasterService.getDigitalAssets();
    setAssets(aList);
    setDigitalAssets(daList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAssetStatus = async (asset: AssetRecord) => {
    const busyKey = `asset:${asset.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = asset.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateAsset(asset.id, { status: nextStatus });
      toastSuccess('Asset status updated', 'تم تحديث حالة الأصل', `${asset.assetTagNumber}: ${nextStatus}`, `${asset.assetTagNumber}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update asset status';
      toastError('Asset status failed', 'فشل تحديث حالة الأصل', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteAsset = async (asset: AssetRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete asset',
      titleAr: 'حذف الأصل',
      messageEn: `Delete asset ${asset.assetTagNumber}? This action cannot be undone.`,
      messageAr: `هل تريد حذف الأصل ${asset.assetTagNumber}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`asset:${asset.id}`);
        try {
          await ProductResourceMasterService.deleteAsset(asset.id);
          toastSuccess('Asset deleted', 'تم حذف الأصل', asset.assetTagNumber, asset.assetTagNumber);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete asset';
          toastError('Asset delete failed', 'فشل حذف الأصل', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  const handleDeleteDigitalAsset = async (asset: DigitalAssetRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete digital asset',
      titleAr: 'حذف الوثيقة الرقمية',
      messageEn: `Delete digital asset ${asset.fileName}? This action cannot be undone.`,
      messageAr: `هل تريد حذف الوثيقة الرقمية ${asset.fileName}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`digital:${asset.id}`);
        try {
          await ProductResourceMasterService.deleteDigitalAsset(asset.id);
          toastSuccess('Digital asset deleted', 'تم حذف الوثيقة الرقمية', asset.fileName, asset.fileName);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete digital asset';
          toastError('Digital asset delete failed', 'فشل حذف الوثيقة الرقمية', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {isAr ? 'إدارة الأصول والملفات الرقمية (Enterprise & Digital Asset Master)' : 'Enterprise Asset & Digital Document Repository'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAr
              ? 'تتبع الأصول الثابتة، البنية التحتية، قيم الإهلاك، الوثائق، الشهادات والتقارير الفنية'
              : 'Track fixed/movable assets, IT hardware, depreciation values, certificates & CAD documentation'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ASSETS')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'ASSETS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'سجل الأصول المؤسسية' : 'Enterprise Assets'} ({assets.length})
          </button>

          <button
            onClick={() => setActiveTab('DIGITAL')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'DIGITAL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الأصول والوثائق الرقمية' : 'Digital Assets & CADs'} ({digitalAssets.length})
          </button>
        </div>
      </div>

      {activeTab === 'ASSETS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map(ast => (
            <div key={ast.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-emerald-500 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">
                    {ast.assetTagNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{isAr ? ast.nameAr : ast.nameEn}</h3>
                  <div className="text-slate-400 text-xs mt-0.5">Class: {ast.assetClass} | Serial: {ast.serialNumber}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                    {ast.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAssetStatus(ast)}
                    disabled={busyResourceId === `asset:${ast.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={ast.status === 'ACTIVE' ? (isAr ? 'إيقاف الأصل' : 'Deactivate asset') : (isAr ? 'تفعيل الأصل' : 'Activate asset')}
                    aria-label={ast.status === 'ACTIVE' ? (isAr ? 'إيقاف الأصل' : 'Deactivate asset') : (isAr ? 'تفعيل الأصل' : 'Activate asset')}
                  >
                    {busyResourceId === `asset:${ast.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(ast)}
                    disabled={busyResourceId === `asset:${ast.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف الأصل' : 'Delete asset'}
                    aria-label={isAr ? 'حذف الأصل' : 'Delete asset'}
                  >
                    {busyResourceId === `asset:${ast.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'القيمة الشرائية:' : 'Purchase Value:'}</span>
                  <span className="font-bold text-slate-900">{ast.purchaseValueSar.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'القيمة الدفترية حالياً:' : 'Current Book Value:'}</span>
                  <span className="font-bold text-emerald-700">{ast.currentValueSar.toLocaleString()} SAR</span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">{isAr ? 'الموقع:' : 'Location:'}</span> {ast.locationName}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {digitalAssets.map(da => (
            <div key={da.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-indigo-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{isAr ? da.titleAr : da.titleEn}</h3>
                    <div className="text-slate-400 text-xs font-mono">{da.fileName} ({(da.fileSizeBytes / 1024 / 1024).toFixed(2)} MB)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs">
                    {da.assetType}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDigitalAsset(da)}
                    disabled={busyResourceId === `digital:${da.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAr ? 'حذف الوثيقة الرقمية' : 'Delete digital asset'}
                    aria-label={isAr ? 'حذف الوثيقة الرقمية' : 'Delete digital asset'}
                  >
                    {busyResourceId === `digital:${da.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {da.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
