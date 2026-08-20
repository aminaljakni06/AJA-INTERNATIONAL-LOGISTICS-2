import React, { useState } from 'react';
import {
  PackageCheck,
  Scan,
  AlertTriangle,
  CheckCircle2,
  Box,
  Layers,
  ArrowRight,
  RotateCcw,
  Zap,
  Tag,
  Boxes,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ReceivingType, GoodsReceiptNoteItem } from '../../../types/inboundWarehouse';

export const ReceivingWorkbenchView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [receivingMode, setReceivingMode] = useState<ReceivingType>('ASN_RECEIVING');
  const [selectedAsnOrPo, setSelectedAsnOrPo] = useState('ASN-2026-901');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);

  const [receivingItems, setReceivingItems] = useState<GoodsReceiptNoteItem[]>([
    {
      id: 'ITM-01',
      skuCode: 'SKU-MED-9081',
      productNameAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة',
      expectedQty: 800,
      acceptedQty: 795,
      rejectedQty: 5,
      pendingQty: 0,
      unitPriceSar: 1250,
      conditionStatus: 'SHORT'
    },
    {
      id: 'ITM-02',
      skuCode: 'SKU-PHARM-2201',
      productNameAr: 'مصل لقاحات مبردة شديدة الحساسية',
      expectedQty: 400,
      acceptedQty: 395,
      rejectedQty: 5,
      pendingQty: 0,
      unitPriceSar: 3400,
      conditionStatus: 'DAMAGED'
    }
  ]);

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode) return;

    setLastScannedItem(scannedBarcode);
    // Increment accepted qty for matching item or add new for blind receiving
    const updated = receivingItems.map(item => {
      if (item.skuCode.toLowerCase() === scannedBarcode.toLowerCase() || scannedBarcode.includes('PALLET')) {
        return {
          ...item,
          acceptedQty: item.acceptedQty + 1,
          pendingQty: Math.max(0, item.pendingQty - 1)
        };
      }
      return item;
    });

    setReceivingItems(updated);
    setScannedBarcode('');
  };

  const totalExpected = receivingItems.reduce((acc, curr) => acc + curr.expectedQty, 0);
  const totalAccepted = receivingItems.reduce((acc, curr) => acc + curr.acceptedQty, 0);
  const totalRejected = receivingItems.reduce((acc, curr) => acc + curr.rejectedQty, 0);
  const progressPercent = Math.min(100, Math.round(((totalAccepted + totalRejected) / totalExpected) * 100));

  return (
    <div className="space-y-6">
      {/* HEADER & RECEIVING MODES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'منصة وطاولة الاستلام الفعلي بـ WMS (Inbound Receiving Workbench)' : 'Inbound Receiving Workbench'}</span>
          </h3>
          <p className="text-xs text-gray-500">
            {isAr ? 'مسح Barcode/RFID، الاستلام المباشر، الاستلام الأعمى Blind Receiving والاستلام المختلط' : 'Barcode/RFID scanning, blind receiving, multi-pack & cross-docking workflows'}
          </p>
        </div>

        {/* SELECT RECEIVING TYPE */}
        <div className="flex flex-wrap gap-1.5 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
          {[
            { type: 'ASN_RECEIVING', labelAr: 'إشعار ASN', labelEn: 'ASN Mode' },
            { type: 'PO_RECEIVING', labelAr: 'أمر شراء PO', labelEn: 'PO Mode' },
            { type: 'BLIND_RECEIVING', labelAr: 'استلام أعمى (Blind)', labelEn: 'Blind Mode' },
            { type: 'CONTAINER_RECEIVING', labelAr: 'حاوية كاملة', labelEn: 'Container' },
            { type: 'CROSS_DOCK', labelAr: 'Cross-Docking', labelEn: 'Cross Dock' }
          ].map((mode) => (
            <button
              key={mode.type}
              onClick={() => setReceivingMode(mode.type as ReceivingType)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                receivingMode === mode.type
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {isAr ? mode.labelAr : mode.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* SCANNING & PROGRESS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BARCODE SCANNER INTERFACE */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Scan className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'ماسح الـ Barcode و الـ RFID' : 'Barcode / RFID Scanner'}</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {isAr ? 'متصل وجاهز' : 'Connected'}
            </span>
          </div>

          <form onSubmit={handleSimulateScan} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500">{isAr ? 'امسح كود الطبلية أو الصنف (Barcode/RFID):' : 'Scan SKU / Pallet Barcode:'}</label>
              <div className="relative">
                <input
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  placeholder="SKU-MED-9081 OR PALLET-8801"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <Scan className="w-4 h-4 absolute left-3 top-3 text-amber-600" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScannedBarcode('SKU-MED-9081')}
                className="flex-1 py-1.5 px-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-[10px] font-mono hover:bg-gray-300"
              >
                + Scan SKU-MED-9081
              </button>
              <button
                type="button"
                onClick={() => setScannedBarcode('SKU-PHARM-2201')}
                className="flex-1 py-1.5 px-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-[10px] font-mono hover:bg-gray-300"
              >
                + Scan SKU-PHARM-2201
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'تسجيل القراءة وحفظ الاستلام' : 'Record Scan'}</span>
            </button>
          </form>

          {lastScannedItem && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">{isAr ? 'آخر قراءة مسجلة بنجاح:' : 'Last Recorded Scan:'}</span>
              <strong className="font-mono text-emerald-700 dark:text-emerald-400 block">{lastScannedItem}</strong>
              <span className="text-[10px] text-emerald-600">{isAr ? 'تم تحديث الكمية وتجهيز ملصق الاستلام' : 'Quantity updated & label queued'}</span>
            </div>
          )}
        </div>

        {/* PROGRESS & SUMMARY */}
        <div className="lg:col-span-2 space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
            <div>
              <span className="text-xs text-gray-400 font-bold block">{isAr ? 'جلسة الاستلام النشطة:' : 'Active Session:'}</span>
              <strong className="font-mono text-amber-600 text-sm">{selectedAsnOrPo}</strong>
            </div>

            <div className="text-left font-mono text-xs">
              <span className="text-gray-500 block">{isAr ? 'إجمالي نسبة الإنجاز:' : 'Completion Progress:'}</span>
              <strong className="text-lg text-emerald-600 font-black">{progressPercent}%</strong>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-1">
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: `${(totalAccepted / totalExpected) * 100}%` }}></div>
              <div className="h-full bg-rose-500" style={{ width: `${(totalRejected / totalExpected) * 100}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-bold">
              <span>{isAr ? `مقبول: ${totalAccepted}` : `Accepted: ${totalAccepted}`}</span>
              <span className="text-rose-600">{isAr ? `مرفوض/محتجز: ${totalRejected}` : `Rejected: ${totalRejected}`}</span>
              <span>{isAr ? `المتوقع: ${totalExpected}` : `Expected: ${totalExpected}`}</span>
            </div>
          </div>

          {/* RECEIVING ITEMS TABLE */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">اسم المنتج</th>
                  <th className="p-3">المتوقع</th>
                  <th className="p-3">المقبول</th>
                  <th className="p-3">المرفوض</th>
                  <th className="p-3">حالة الفروقات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {receivingItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-mono font-bold text-amber-600">{item.skuCode}</td>
                    <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{item.productNameAr}</td>
                    <td className="p-3 font-mono">{item.expectedQty}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{item.acceptedQty}</td>
                    <td className="p-3 font-mono font-bold text-rose-600">{item.rejectedQty}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.conditionStatus === 'GOOD'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.conditionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceivingWorkbenchView;
