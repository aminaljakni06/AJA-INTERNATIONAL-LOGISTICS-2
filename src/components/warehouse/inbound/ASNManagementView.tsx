import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  PackageCheck,
  History,
  Paperclip,
  Thermometer,
  Boxes,
  Maximize2,
  X
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AdvancedShippingNotice, ASNItem } from '../../../types/inboundWarehouse';

interface ASNManagementViewProps {
  asns: AdvancedShippingNotice[];
  onRefresh?: () => void;
}

export const ASNManagementView: React.FC<ASNManagementViewProps> = ({ asns, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsn, setSelectedAsn] = useState<AdvancedShippingNotice | null>(asns[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ASN Form State
  const [newPoNumber, setNewPoNumber] = useState('PO-AJA-9099');
  const [newSupplier, setNewSupplier] = useState('شركة الرعاية الصحية المتقدمة (ألمانيا)');
  const [newCarrier, setNewCarrier] = useState('AJA Freight Logistics');
  const [newPallets, setNewPallets] = useState(30);
  const [newPackages, setNewPackages] = useState(900);
  const [newTempControlled, setNewTempControlled] = useState(true);

  const filteredAsns = asns.filter(a =>
    a.asnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.supplierNameAr.includes(searchTerm) ||
    a.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAsn = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AdvancedShippingNotice = {
      id: `ASN-${Date.now()}`,
      asnNumber: `ASN-2026-${Math.floor(100 + Math.random() * 900)}`,
      purchaseOrderNumber: newPoNumber,
      supplierNameAr: newSupplier,
      carrierNameAr: newCarrier,
      expectedArrivalDate: new Date(Date.now() + 86400000).toISOString().replace('T', ' ').substring(0, 16),
      warehouseId: 'WH-RUH-01',
      dockNumber: 'Dock Gate Alpha-03',
      totalExpectedPackages: newPackages,
      totalExpectedPallets: newPallets,
      status: 'SCHEDULED',
      temperatureControlled: newTempControlled,
      targetTemperatureCelsius: newTempControlled ? 4 : undefined,
      items: [
        {
          id: 'ITM-NEW-1',
          skuCode: 'SKU-MED-880',
          productNameAr: 'مستلزمات طبية وأدوية مبردة معتمدة',
          productNameEn: 'Medical Cooling Supplies',
          expectedQuantity: newPackages,
          unitOfMeasure: 'BOX',
          expectedWeightKg: newPallets * 300,
          expectedVolumeCbm: newPallets * 1.5,
          lotNumber: 'LOT-2026-N1',
          expiryDate: '2028-06-30'
        }
      ]
    };

    asns.unshift(created);
    setSelectedAsn(created);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'بحث برقم الإشعار المسبق ASN، أمر الشراء PO، المورد، أو الناقل...' : 'Search ASN#, PO#, Supplier, Carrier...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء إشعار شحن مسبق (New ASN)' : 'New ASN Notice'}</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ASN LIST */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {isAr ? `قائمة الشحنات الواردة (${filteredAsns.length})` : `Inbound ASNs (${filteredAsns.length})`}
          </h4>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredAsns.map((a) => {
              const isSelected = selectedAsn?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAsn(a)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-amber-600 text-xs">{a.asnNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.status === 'ARRIVED_AT_DOCK'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : a.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-gray-100">{a.supplierNameAr}</p>
                    <p className="text-[11px] text-gray-500 font-mono">PO: {a.purchaseOrderNumber}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium pt-1 border-t border-gray-200/60 dark:border-gray-800">
                    <span>{a.totalExpectedPallets} {isAr ? 'طبلية' : 'pallets'} ({a.totalExpectedPackages} {isAr ? 'طرد' : 'pkgs'})</span>
                    <span className="font-mono">{a.expectedArrivalDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ASN DETAILS VIEW */}
        <div className="lg:col-span-2 space-y-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          {selectedAsn ? (
            <div className="space-y-6">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-amber-600">{selectedAsn.asnNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {selectedAsn.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">{selectedAsn.supplierNameAr}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{isAr ? 'رقم أمر الشراء المرتبط:' : 'Linked PO:'}</span>
                  <span className="font-mono font-bold text-xs bg-gray-200 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                    {selectedAsn.purchaseOrderNumber}
                  </span>
                </div>
              </div>

              {/* SPECIFICATION GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-0.5">
                  <span className="text-gray-400 block">{isAr ? 'الناقل ووسيلة النقل' : 'Carrier'}</span>
                  <strong className="text-gray-900 dark:text-gray-100 block">{selectedAsn.carrierNameAr}</strong>
                  <span className="text-[10px] text-gray-500">{selectedAsn.truckPlateNumber || '—'}</span>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-0.5">
                  <span className="text-gray-400 block">{isAr ? 'رقم الحاوية' : 'Container#'}</span>
                  <strong className="text-indigo-600 font-mono block">{selectedAsn.containerNumber || 'MSKU-882019-1'}</strong>
                  <span className="text-[10px] text-emerald-600 font-bold">{isAr ? 'ختم جمركي سلامة' : 'Customs Sealed'}</span>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-0.5">
                  <span className="text-gray-400 block">{isAr ? 'إجمالي الوزن والحجم' : 'Weight & Volume'}</span>
                  <strong className="text-gray-900 dark:text-gray-100 block">
                    {selectedAsn.totalWeightKg || 12400} كجم
                  </strong>
                  <span className="text-[10px] text-gray-500">{selectedAsn.totalVolumeCbm || 68} CBM</span>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-0.5">
                  <span className="text-gray-400 block">{isAr ? 'متطلبات التبريد' : 'Temperature'}</span>
                  <strong className="text-cyan-600 font-bold flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    {selectedAsn.temperatureControlled ? `مبرد (+${selectedAsn.targetTemperatureCelsius}°C)` : 'جاف'}
                  </strong>
                  <span className="text-[10px] text-gray-500">{isAr ? 'حاوية تبريد مفعلة' : 'Reefer Unit'}</span>
                </div>
              </div>

              {/* EXPECTED ITEMS TABLE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'جدول الأصناف المتوقعة الشحن (Expected Line Items)' : 'Expected Line Items'}</span>
                </h4>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="p-3">SKU / الصنف</th>
                        <th className="p-3">اسم المنتج</th>
                        <th className="p-3">الكمية المتوقعة</th>
                        <th className="p-3">رقم التشغيلة (Lot)</th>
                        <th className="p-3">تاريخ الانتهاء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {(selectedAsn.items || [
                        {
                          id: 'ITM-01',
                          skuCode: 'SKU-MED-9081',
                          productNameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
                          productNameEn: 'Precision Medical Cooling Units',
                          expectedQuantity: 800,
                          unitOfMeasure: 'BOX',
                          expectedWeightKg: 8000,
                          expectedVolumeCbm: 42,
                          lotNumber: 'LOT-2026-X88',
                          expiryDate: '2028-12-31'
                        }
                      ]).map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 font-mono font-bold text-amber-600">{item.skuCode}</td>
                          <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{item.productNameAr}</td>
                          <td className="p-3 font-mono font-bold">{item.expectedQuantity} {item.unitOfMeasure}</td>
                          <td className="p-3 font-mono text-gray-500">{item.lotNumber || '—'}</td>
                          <td className="p-3 font-mono text-emerald-600 font-bold">{item.expiryDate || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REVISION HISTORY */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>{isAr ? 'سجل المراجعات والاعتمادات (Revision History)' : 'Revision History'}</span>
                </h4>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                  {(selectedAsn.revisionHistory || [
                    { revNumber: 1, updatedAt: '2026-08-04 18:00', updatedBy: 'مدير المشتريات / أحمد الراشد', noteAr: 'تعديل موعد الوصول وتحديد حاوية التبريد' }
                  ]).map((rev, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 last:border-0 pb-2 last:pb-0">
                      <div>
                        <strong className="text-amber-600 font-mono">Rev #{rev.revNumber}</strong>
                        <span className="text-gray-600 dark:text-gray-300 mr-2 ml-2">{rev.noteAr}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{rev.updatedAt} • {rev.updatedBy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              {isAr ? 'اختر إشعار شحن لعرض التفاصيل' : 'Select an ASN to view details'}
            </div>
          )}
        </div>
      </div>

      {/* CREATE ASN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                {isAr ? 'إنشاء إشعار شحن مسبق جديد (New ASN)' : 'Create New Advance Shipping Notice'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsn} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'رقم أمر الشراء (PO Number)' : 'PO Number'}</label>
                <input
                  type="text"
                  value={newPoNumber}
                  onChange={(e) => setNewPoNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'اسم المورد' : 'Supplier Name'}</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'عدد الطبالي المتوقعة' : 'Expected Pallets'}</label>
                  <input
                    type="number"
                    value={newPallets}
                    onChange={(e) => setNewPallets(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'عدد الطرود المتوقعة' : 'Expected Packages'}</label>
                  <input
                    type="number"
                    value={newPackages}
                    onChange={(e) => setNewPackages(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tempControl"
                  checked={newTempControlled}
                  onChange={(e) => setNewTempControlled(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-gray-300"
                />
                <label htmlFor="tempControl" className="font-bold text-gray-700 dark:text-gray-300">
                  {isAr ? 'تتطلب التحكم بدرجة الحرارة (Chilled Cargo)' : 'Temperature Controlled Cargo'}
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow"
                >
                  {isAr ? 'حفظ وتأكيد ASN' : 'Save ASN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ASNManagementView;
