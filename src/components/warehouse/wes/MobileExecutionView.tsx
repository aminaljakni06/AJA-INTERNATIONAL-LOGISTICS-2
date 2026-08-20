import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Split, GitMerge, AlertCircle, RefreshCw, Send, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export const MobileExecutionView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTaskNumber, setActiveTaskNumber] = useState('WES-TSK-2026-101');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [taskCompleted, setTaskCompleted] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* MOBILE DEVICE FRAME SIMULATION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-amber-500 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-2 text-amber-600 font-black">
            <Smartphone className="w-5 h-5" />
            <span>{isAr ? 'واجهة الشاشة الميدانية الذكية (WES Mobile RF Terminal)' : 'WES Mobile RF Execution Terminal'}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            {isAr ? 'متصل بالماتريكس اللحظي' : 'RF Network Online'}
          </span>
        </div>

        {/* ACTIVE TASK DISPATCH CARD */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-black text-amber-700 dark:text-amber-300">{activeTaskNumber}</span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] animate-pulse">
              EMERGENCY PUTAWAY
            </span>
          </div>

          <div>
            <h3 className="font-black text-base text-gray-900 dark:text-gray-100">
              {isAr ? 'إيداع مصل لقاحات مبردة عالية الحساسية' : 'Deposit Cold Medical Vaccines'}
            </h3>
            <p className="text-xs text-gray-500 font-mono">SKU-PHARM-2201 • 120 BOX</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono py-2 bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/40">
            <div>
              <span className="text-gray-400 text-[10px] block">{isAr ? 'من الموقع Source' : 'From Source'}</span>
              <strong className="text-gray-800 dark:text-gray-200">DOCK-RECEIVING-02</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block">{isAr ? 'إلى الخانة Dest' : 'To Bin'}</span>
              <strong className="text-emerald-600 font-bold">B-A01-R02-S03</strong>
            </div>
          </div>
        </div>

        {/* SCANNER INPUT */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            {isAr ? 'مسح باركود/RFID الخانة للتحقق وإتمام المهمة:' : 'Scan Bin Barcode / RFID Tag:'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              placeholder="B-A01-R02-S03..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button
              onClick={() => setTaskCompleted(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'تأكيد الإيداع' : 'Confirm'}</span>
            </button>
          </div>
        </div>

        {/* TASK ACTIONS */}
        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          <button className="py-2.5 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-blue-600" />
            <span>{isAr ? 'تقسيم (Split)' : 'Split Task'}</span>
          </button>
          <button className="py-2.5 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAr ? 'دمج (Merge)' : 'Merge Task'}</span>
          </button>
          <button className="py-2.5 px-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصعيد (Escalate)' : 'Escalate Exception'}</span>
          </button>
        </div>

        {taskCompleted && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'تم تأكيد الإيداع بنجاح وتحديث موقع المخزون في السجل!' : 'Task confirmed successfully and bin updated!'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
