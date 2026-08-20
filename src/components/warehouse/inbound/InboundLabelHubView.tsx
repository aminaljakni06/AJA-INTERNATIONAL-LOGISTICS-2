import React, { useState } from 'react';
import {
  Tag,
  Printer,
  QrCode,
  Radio,
  CheckCircle2,
  Plus,
  RefreshCw,
  Box,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { InboundLabelJob } from '../../../types/inboundWarehouse';

interface InboundLabelHubViewProps {
  labelJobs: InboundLabelJob[];
  onRefresh?: () => void;
}

export const InboundLabelHubView: React.FC<InboundLabelHubViewProps> = ({ labelJobs, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [jobs, setJobs] = useState<InboundLabelJob[]>(labelJobs);

  const [labelType, setLabelType] = useState<'RECEIVING' | 'PALLET' | 'CONTAINER' | 'LOCATION' | 'BARCODE' | 'RFID'>('PALLET');
  const [targetCode, setTargetCode] = useState('PALLET-AJA-8802');
  const [skuCode, setSkuCode] = useState('SKU-MED-9081');
  const [format, setFormat] = useState<'GS1_128' | 'QR_CODE' | 'RFID_EPC_GEN2'>('RFID_EPC_GEN2');
  const [qty, setQty] = useState(40);

  const handlePrintLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: InboundLabelJob = {
      id: `LBL-${Date.now()}`,
      jobId: `LBL-JOB-${Math.floor(100 + Math.random() * 900)}`,
      labelType: labelType,
      targetCode: targetCode,
      skuOrPalletCode: skuCode,
      format: format,
      quantityToPrint: qty,
      status: 'COMPLETED',
      printedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      printedBy: 'المهندس أحمد الغامدي'
    };

    setJobs([newJob, ...jobs]);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-600" />
          <span>{isAr ? 'مركز طباعة ملصقات الباركود والـ RFID (Barcode & RFID Label Printing Hub)' : 'Barcode & RFID Label Printing Hub'}</span>
        </h3>
        <p className="text-xs text-gray-500">
          {isAr ? 'طباعة ملصقات GS1-128، QR Code وتشفير شرائح RFID EPC Gen2 للطبالي والطرود عند الاستلام' : 'GS1-128, QR Code & RFID EPC Gen2 encoding & printing for incoming pallets & boxes'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRINT FORM & PREVIEW */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-600" />
            <span>{isAr ? 'طلب طباعة وتشفير جديد' : 'New Label Print Job'}</span>
          </h4>

          <form onSubmit={handlePrintLabel} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'نوع الملصق' : 'Label Type'}</label>
              <select
                value={labelType}
                onChange={(e) => setLabelType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none"
              >
                <option value="PALLET">{isAr ? 'ملصق طبلية (Pallet Label)' : 'Pallet Label'}</option>
                <option value="RECEIVING">{isAr ? 'ملصق استلام (Receiving Tag)' : 'Receiving Tag'}</option>
                <option value="CONTAINER">{isAr ? 'ملصق حاوية (Container Label)' : 'Container Label'}</option>
                <option value="LOCATION">{isAr ? 'ملصق الرف (Location Bin)' : 'Bin Location Tag'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'كود الصنف / الطبلية' : 'Pallet or SKU Code'}</label>
              <input
                type="text"
                value={targetCode}
                onChange={(e) => setTargetCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'صيغة التشفير' : 'Format'}</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none"
                >
                  <option value="RFID_EPC_GEN2">RFID EPC Gen2</option>
                  <option value="GS1_128">GS1-128 Barcode</option>
                  <option value="QR_CODE">2D QR Code</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'عدد النسخ' : 'Print Quantity'}</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono outline-none"
                />
              </div>
            </div>

            {/* LABEL MOCK PREVIEW */}
            <div className="p-3 bg-white dark:bg-gray-800 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-xl space-y-2 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{isAr ? 'معاينة الملصق (Label Preview)' : 'Label Preview'}</span>
              <div className="font-mono text-xs font-black text-gray-900 dark:text-gray-100">{targetCode}</div>
              <div className="text-[10px] text-gray-500">{skuCode} • AJA LOGISTICS WMS</div>
              <div className="flex justify-center items-center gap-1 text-[10px] font-bold text-amber-600">
                <Radio className="w-3.5 h-3.5" />
                <span>{format} ENCODED</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'إرسال أمر الطباعة للطابعة الصناعية' : 'Send Print Command'}</span>
            </button>
          </form>
        </div>

        {/* PRINT QUEUE & HISTORY */}
        <div className="lg:col-span-2 space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center justify-between">
            <span>{isAr ? 'سجل عمليات الطباعة والتشفير (Print Jobs Queue)' : 'Print Jobs Queue'}</span>
            <span className="font-mono text-amber-600">{jobs.length} Jobs</span>
          </h4>

          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-600">{j.jobId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {j.labelType}
                    </span>
                  </div>
                  <p className="font-mono text-gray-900 dark:text-gray-100 font-bold">{j.targetCode} ({j.quantityToPrint} copies)</p>
                  <span className="text-[10px] text-gray-400 block">{j.printedAt} • {j.printedBy}</span>
                </div>

                <div className="text-left font-mono">
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {j.status}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">{j.format}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundLabelHubView;
