import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  FileCheck2,
  Clipboard,
  X,
  UserCheck,
  Check
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { QualityInspectionRecord, NCRRecord, QualityInspectionResult } from '../../../types/inboundWarehouse';

interface QualityAndNCRViewProps {
  inspections: QualityInspectionRecord[];
  ncrs: NCRRecord[];
  onRefresh?: () => void;
}

export const QualityAndNCRView: React.FC<QualityAndNCRViewProps> = ({ inspections, ncrs, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [inspectionList, setInspectionList] = useState<QualityInspectionRecord[]>(inspections);
  const [ncrList, setNcrList] = useState<NCRRecord[]>(ncrs);
  const [showNcrModal, setShowNcrModal] = useState(false);

  // New NCR State
  const [skuCode, setSkuCode] = useState('SKU-PHARM-2201');
  const [productName, setProductName] = useState('مصل لقاحات مبردة شديدة الحساسية');
  const [supplier, setSupplier] = useState('شركة المورد المتقدم للصناعات الطبية (ألمانيا)');
  const [rootCause, setRootCause] = useState('ضعف التثبيت الداخلي في الحاوية أثناء النقل الجوي الدولي.');
  const [correctiveAction, setCorrectiveAction] = useState('استبدال الشحنة المتضررة وإرسال طرد بديل عبر أساطيل أجا المبردة السريعة.');

  const handleCreateNcr = (e: React.FormEvent) => {
    e.preventDefault();
    const createdNcr: NCRRecord = {
      id: `NCR-${Date.now()}`,
      ncrNumber: `NCR-2026-${Math.floor(100 + Math.random() * 900)}`,
      grnNumber: 'GRN-2026-401',
      supplierNameAr: supplier,
      skuCode: skuCode,
      productNameAr: productName,
      rootCauseAr: rootCause,
      correctiveActionAr: correctiveAction,
      preventiveActionAr: 'إلزام المورد باستخدام فوم مقوى وسدادات تمتص الصدمات لكل شحنة مسقبلية.',
      status: 'CAPA_PENDING',
      createdBy: 'المهندس أحمد الغامدي (مفتش الجودة)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setNcrList([createdNcr, ...ncrList]);
    setShowNcrModal(false);
  };

  const getResultBadge = (result: QualityInspectionResult) => {
    switch (result) {
      case 'PASSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{isAr ? 'مقابلة المواصفات (Passed)' : 'Passed'}</span>;
      case 'FAILED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">{isAr ? 'مرفوض جودة (Failed)' : 'Failed'}</span>;
      case 'QUARANTINE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{isAr ? 'حجر صحي/طبي (Quarantine)' : 'Quarantine'}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{result}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'فحص الجودة وإدارة عدم المطابقة (Quality & NCR Platform)' : 'Quality Inspection & NCR Platform'}</span>
          </h3>
          <p className="text-xs text-gray-500">
            {isAr ? 'خطط الفحص، قواعد سحب العينات، تقارير عدم المطابقة NCR وتحليل الأسباب الجوهرية CAPA' : 'Sampling rules, inspection checklists, Non-Conformance Reports & CAPA workflows'}
          </p>
        </div>

        <button
          onClick={() => setShowNcrModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'اصدار تقرير عدم مطابقة NCR' : 'Issue NCR Report'}</span>
        </button>
      </div>

      {/* TWO SECTIONS: QUALITY INSPECTION RECORDS & NCR REGISTRY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INSPECTION RECORDS */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center justify-between">
            <span>{isAr ? 'تقارير فحص الجودة (Quality Inspections)' : 'Quality Inspection Logs'}</span>
            <span className="font-mono text-amber-600">{inspectionList.length} Records</span>
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {inspectionList.map((insp) => (
              <div key={insp.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-amber-600 text-xs">{insp.grnNumber}</span>
                  {getResultBadge(insp.inspectionResult)}
                </div>

                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100">{insp.productNameAr}</h5>
                  <p className="font-mono text-[11px] text-gray-500">{insp.skuCode}</p>
                </div>

                {/* CHECKLIST */}
                {insp.checklist && (
                  <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-1.5 text-[11px]">
                    <span className="text-gray-400 font-bold block">{isAr ? 'قائمة الفحص والتحقق (Checklist):' : 'Inspection Checklist:'}</span>
                    {insp.checklist.map((ck) => (
                      <div key={ck.id} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-gray-700 dark:text-gray-300">{ck.checkpointAr}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                  <span>{isAr ? `المفتش: ${insp.inspectorName}` : `Inspector: ${insp.inspectorName}`}</span>
                  <span className="font-mono">{insp.inspectionTimestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NCR REGISTRY */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-rose-600 flex items-center justify-between">
            <span>{isAr ? 'سجل تقارير عدم المطابقة (NCR Registry & CAPA)' : 'NCR Registry & CAPA'}</span>
            <span className="font-mono">{ncrList.length} NCRs</span>
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {ncrList.map((ncr) => (
              <div key={ncr.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-200 dark:border-rose-950/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-rose-600 text-xs">{ncr.ncrNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {ncr.status}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100">{ncr.productNameAr}</h5>
                  <p className="text-[11px] text-gray-500">{ncr.supplierNameAr}</p>
                </div>

                <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg space-y-1 text-[11px]">
                  <div>
                    <strong className="text-rose-700 dark:text-rose-400 block">{isAr ? 'السبب الجوهري (Root Cause):' : 'Root Cause:'}</strong>
                    <p className="text-gray-700 dark:text-gray-300">{ncr.rootCauseAr}</p>
                  </div>
                  <div className="pt-1">
                    <strong className="text-emerald-700 dark:text-emerald-400 block">{isAr ? 'الإجراء التصحيحي CAPA:' : 'CAPA Action:'}</strong>
                    <p className="text-gray-700 dark:text-gray-300">{ncr.correctiveActionAr}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>{ncr.createdBy}</span>
                  <span className="font-mono">{ncr.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE NCR MODAL */}
      {showNcrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                {isAr ? 'إصدار تقرير عدم مطابقة (Create NCR)' : 'Issue Non-Conformance Report'}
              </h3>
              <button onClick={() => setShowNcrModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNcr} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'كود الصنف (SKU Code)' : 'SKU Code'}</label>
                <input
                  type="text"
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'اسم المنتج' : 'Product Name'}</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'تحليل السبب الجوهري (Root Cause Analysis)' : 'Root Cause Analysis'}</label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'الإجراء التصحيحي والوقائي (CAPA)' : 'Corrective Action (CAPA)'}</label>
                <textarea
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNcrModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow"
                >
                  {isAr ? 'اعتماد وإصدار تقرير NCR' : 'Issue NCR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAndNCRView;
