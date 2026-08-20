import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  QrCode,
  Barcode,
  Search,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Layers,
  Award,
  Truck
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { FixedAsset, AssetClass, AssetStatus } from '../../../types/fixedAssetsReporting';

export const FixedAssetsRegisterView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(assets[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => {
      setAssets(snapshot.assets);
      setSelectedAsset(snapshot.assets[0] || null);
    });
  }, []);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    assetNameEn: '',
    assetNameAr: '',
    assetClass: 'TRANSPORT_FLEET' as AssetClass,
    serialNumber: '',
    purchaseCostSAR: 500000,
    salvageValueSAR: 50000,
    usefulLifeYears: 8,
    branchLocation: 'Riyadh Main Terminal',
    custodian: 'Operations Manager'
  });

  const filteredAssets = assets.filter(a =>
    a.assetNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: FixedAsset = {
      id: `ast-${Date.now()}`,
      assetNumber: `AST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      assetNameEn: newAsset.assetNameEn || 'New Equipment Asset',
      assetNameAr: newAsset.assetNameAr || 'أصل معدات جديد',
      assetClass: newAsset.assetClass,
      serialNumber: newAsset.serialNumber || `SN-${Date.now()}`,
      barcode: `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      qrCode: `QR-AST-${Math.floor(100000 + Math.random() * 900000)}`,
      companyName: 'AJA International Logistics Co.',
      branchLocation: newAsset.branchLocation,
      costCenterCode: 'CC-301-FLEET',
      custodian: newAsset.custodian,
      purchaseCostSAR: Number(newAsset.purchaseCostSAR),
      salvageValueSAR: Number(newAsset.salvageValueSAR),
      usefulLifeYears: Number(newAsset.usefulLifeYears),
      depreciationMethod: 'STRAIGHT_LINE',
      accumulatedDepreciationSAR: 0,
      netBookValueSAR: Number(newAsset.purchaseCostSAR),
      acquisitionDate: new Date().toISOString().slice(0, 10),
      commissionDate: new Date().toISOString().slice(0, 10),
      status: 'OPERATIONAL'
    };

    const { snapshot } = await FixedAssetsReportingClient.addAsset(created);
    setAssets(snapshot.assets);
    setSelectedAsset(snapshot.assets.find(asset => asset.id === created.id) || created);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'سجل الأصول الثابتة والترميز الذكي (Enterprise Fixed Asset Register)' : 'Enterprise Fixed Asset Master Register & RFID/QR Tagging'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'سجل الأصول، الباركود، القيمة الدفترية ومراكز التكلفة' : 'Asset Capitalization, Serial Tracking, Net Book Value & Custody Registry'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تسجيل وتقييم الأصول اللوجستية، الشاحنات والمستودعات بالباركود ورمز الاستجابة السريعة (QR Code)' : 'Track equipment acquisition, location tagging, net book value, and physical custodian assignments.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة أصل ثابت جديد (Capitalize Asset)' : 'Capitalize New Fixed Asset'}</span>
        </button>
      </div>

      {/* Grid Layout: Asset List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono">{isAr ? 'قائمة الأصول الثابتة' : 'Fixed Assets Register'}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400">{assets.length}</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث بالاسم، الرقم أو الرقم التسلسلي...' : 'Search asset name, code, serial...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="space-y-3">
            {filteredAssets.map(ast => (
              <div
                key={ast.id}
                onClick={() => setSelectedAsset(ast)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedAsset && selectedAsset.id === ast.id
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 font-mono">{ast.assetNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {ast.status}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-bold">{isAr ? ast.assetNameAr : ast.assetNameEn}</div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'القيمة الدفترية:' : 'Net Book Value:'}</span>
                  <span className="text-emerald-400 font-extrabold">SAR {(ast.netBookValueSAR / 1000).toFixed(0)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Inspector */}
        {selectedAsset && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-400 font-bold">{selectedAsset.assetNumber} • {selectedAsset.assetClass}</div>
                  <h3 className="text-xl font-bold text-white">{isAr ? selectedAsset.assetNameAr : selectedAsset.assetNameEn}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span>{selectedAsset.qrCode}</span>
                  </span>
                </div>
              </div>

              {/* Financial & Valuation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'تكلفة الشراء التاريخية' : 'Historical Cost'}</div>
                  <div className="text-lg font-bold text-white">SAR {selectedAsset.purchaseCostSAR.toLocaleString()}</div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'مجمع الإهلاك التراكمي' : 'Accumulated Depreciation'}</div>
                  <div className="text-lg font-bold text-rose-400">SAR {selectedAsset.accumulatedDepreciationSAR.toLocaleString()}</div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'صافي القيمة الدفترية الحالية' : 'Current Net Book Value'}</div>
                  <div className="text-lg font-bold text-emerald-400">SAR {selectedAsset.netBookValueSAR.toLocaleString()}</div>
                </div>
              </div>

              {/* Custody & Location Details */}
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">{isAr ? 'الرقم التسلسلي المصنعي (Serial):' : 'Manufacturer Serial No:'}</span>
                  <span className="text-white font-bold">{selectedAsset.serialNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">{isAr ? 'الموقع التشغيلي / الفرع:' : 'Branch Location:'}</span>
                  <span className="text-sky-400 font-bold">{selectedAsset.branchLocation}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">{isAr ? 'العهد الشخصية / المسؤول:' : 'Physical Custodian:'}</span>
                  <span className="text-amber-400 font-bold">{selectedAsset.custodian}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'طريقة الإهلاك المعتمدة:' : 'Depreciation Method:'}</span>
                  <span className="text-emerald-400 font-bold">{selectedAsset.depreciationMethod} ({selectedAsset.usefulLifeYears} Years)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal to Capitalize New Asset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              {isAr ? 'إضافة أصل ثابت ورأسمالته (Capitalize Fixed Asset)' : 'Capitalize New Fixed Asset Record'}
            </h3>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'اسم الأصل (إنجليزي)' : 'Asset Name (English)'}</label>
                <input
                  type="text"
                  required
                  value={newAsset.assetNameEn}
                  onChange={e => setNewAsset({ ...newAsset, assetNameEn: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'اسم الأصل (عربي)' : 'Asset Name (Arabic)'}</label>
                <input
                  type="text"
                  required
                  value={newAsset.assetNameAr}
                  onChange={e => setNewAsset({ ...newAsset, assetNameAr: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'تكلفة الشراء (SAR)' : 'Purchase Cost (SAR)'}</label>
                  <input
                    type="number"
                    value={newAsset.purchaseCostSAR}
                    onChange={e => setNewAsset({ ...newAsset, purchaseCostSAR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'العمر الإنتاجي (سنوات)' : 'Useful Life (Years)'}</label>
                  <input
                    type="number"
                    value={newAsset.usefulLifeYears}
                    onChange={e => setNewAsset({ ...newAsset, usefulLifeYears: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  {isAr ? 'حفظ ورأسمالة الأصل' : 'Capitalize Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
