import React, { useState } from 'react';
import {
  FileText,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  Image as ImageIcon,
  Paperclip,
  Share2,
  X,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { GoodsReceiptNote, OSDRecord } from '../../../types/inboundWarehouse';

interface GRNAndOSDViewProps {
  grns: GoodsReceiptNote[];
  osds: OSDRecord[];
  onRefresh?: () => void;
}

export const GRNAndOSDView: React.FC<GRNAndOSDViewProps> = ({ grns, osds, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [grnList, setGrnList] = useState<GoodsReceiptNote[]>(grns);
  const [osdList, setOsdList] = useState<OSDRecord[]>(osds);

  const [showOsdModal, setShowOsdModal] = useState(false);
  const [selectedGrnForOsd, setSelectedGrnForOsd] = useState('GRN-2026-401');
  const [shortQty, setShortQty] = useState(5);
  const [damagedQty, setDamagedQty] = useState(5);
  const [incidentDescription, setIncidentDescription] = useState('وجود 5 طرود بها أضرار كرتونية بسبب اهتزاز الشحن الجوي.');

  const handlePostToGL = (grnId: string) => {
    setGrnList(grnList.map(g => g.id === grnId ? { ...g, autoPostedToGL: true, status: 'POSTED_TO_GL' as any } : g));
  };

  const handleCreateOsdClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const createdOsd: OSDRecord = {
      id: `OSD-${Date.now()}`,
      osdNumber: `OSD-2026-${Math.floor(100 + Math.random() * 900)}`,
      grnNumber: selectedGrnForOsd,
      supplierNameAr: 'شركة المورد المتقدم للصناعات الطبية (ألمانيا)',
      overQuantity: 0,
      shortQuantity: shortQty,
      damagedQuantity: damagedQty,
      missingItemsCount: 0,
      replacementRequested: true,
      incidentDescriptionAr: incidentDescription,
      claimStatus: 'CLAIM_FILED',
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      photoUrls: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80']
    };

    setOsdList([createdOsd, ...osdList]);
    setShowOsdModal(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'سندات الاستلام (GRN) وإدارة الفروقات والتلفيات (OS&D Center)' : 'GRN & OS&D Center'}</span>
          </h3>
          <p className="text-xs text-gray-500">
            {isAr ? 'إنشاء وقيد سندات الاستلام في دفتر اليومية العام تلقائياً وتوثيق المطالبات والتلفيات' : 'Auto-GL posting, Over/Short/Damaged incident reports & replacement claims'}
          </p>
        </div>

        <button
          onClick={() => setShowOsdModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>{isAr ? 'تسجيل بلاغ/مطالبة OS&D' : 'Report OS&D Incident'}</span>
        </button>
      </div>

      {/* TWO SECTIONS: GRN TABLE & OSD CLAIMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRN SECTION */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center justify-between">
            <span>{isAr ? 'سندات الاستلام المحررة (Goods Receipt Notes)' : 'Goods Receipt Notes'}</span>
            <span className="font-mono text-amber-600">{grnList.length} GRNs</span>
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {grnList.map((g) => (
              <div key={g.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-amber-600 text-xs">{g.grnNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    g.status === 'POSTED_TO_GL' || g.autoPostedToGL
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {g.autoPostedToGL ? (isAr ? 'مرحل لدفتر اليومية GL' : 'Posted to GL') : g.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{g.supplierNameAr}</p>
                  <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                    <span>ASN: {g.asnNumber}</span>
                    <span>{g.receivedDate}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {isAr ? `الكمية المستلمة: ${g.receivedQuantity}` : `Received Qty: ${g.receivedQuantity}`}
                  </span>

                  {!g.autoPostedToGL && (
                    <button
                      onClick={() => handlePostToGL(g.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow"
                    >
                      {isAr ? 'ترحيل فوري للـ GL' : 'Post to GL'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OSD CLAIMS SECTION */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-rose-600 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{isAr ? 'مطالبات الزيادة والنقص والتلفيات (OS&D Incident Register)' : 'OS&D Incident Register'}</span>
            </span>
            <span className="font-mono">{osdList.length} Claims</span>
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {osdList.map((osd) => (
              <div key={osd.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-200 dark:border-rose-950/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-rose-600 text-xs">{osd.osdNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    {osd.claimStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{osd.supplierNameAr}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">{osd.incidentDescriptionAr}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <span className="text-gray-400 block">{isAr ? 'نقص (Short):' : 'Short:'}</span>
                    <strong className="text-amber-600 font-bold">{osd.shortQuantity}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{isAr ? 'تلف (Damaged):' : 'Damaged:'}</span>
                    <strong className="text-rose-600 font-bold">{osd.damagedQuantity}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{isAr ? 'زيادة (Over):' : 'Over:'}</span>
                    <strong className="text-emerald-600 font-bold">{osd.overQuantity}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                  <span>{osd.reportedAt}</span>
                  <span className="text-indigo-600 font-bold">{isAr ? 'طلب شحنة تعويضية مفعل' : 'Replacement Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE OSD MODAL */}
      {showOsdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <span>{isAr ? 'تسجيل مطالبة تلفيات / عجز شحنة (OS&D Claim)' : 'File OS&D Claim'}</span>
              </h3>
              <button onClick={() => setShowOsdModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOsdClaim} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'سند الاستلام المرتبط (GRN Number)' : 'Linked GRN'}</label>
                <select
                  value={selectedGrnForOsd}
                  onChange={(e) => setSelectedGrnForOsd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold outline-none"
                >
                  {grnList.map(g => (
                    <option key={g.id} value={g.grnNumber}>{g.grnNumber} - {g.supplierNameAr}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'كمية العجز النقص (Short Qty)' : 'Short Qty'}</label>
                  <input
                    type="number"
                    value={shortQty}
                    onChange={(e) => setShortQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'الكمية التالفة (Damaged Qty)' : 'Damaged Qty'}</label>
                  <input
                    type="number"
                    value={damagedQty}
                    onChange={(e) => setDamagedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">{isAr ? 'وصف الحادثة وأسباب المطالبة' : 'Incident Description'}</label>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOsdModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow"
                >
                  {isAr ? 'تأكيد وإصدار مطالبة OS&D' : 'Submit OS&D Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNAndOSDView;
