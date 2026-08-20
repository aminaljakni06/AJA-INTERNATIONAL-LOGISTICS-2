import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Send,
  FileCode,
  Download,
  ShieldCheck,
  Plus,
  Building2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TreasuryClient } from '../../../services/treasuryClient';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/treasury';

export const PaymentFactoryView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);

  const refreshBatches = (nextBatches: PaymentBatch[], selectedId?: string) => {
    setBatches(nextBatches);
    setSelectedBatch(nextBatches.find(b => b.id === selectedId) || nextBatches[0] || null);
  };

  useEffect(() => {
    void TreasuryClient.getSnapshot().then(snapshot => refreshBatches(snapshot.paymentBatches));
  }, []);

  const handleApproveBatch = async () => {
    if (!selectedBatch) return;
    const { snapshot } = await TreasuryClient.updatePaymentBatchStatus(selectedBatch.id, 'APPROVED', 'Fahad Al-Otaibi (Group CFO)');
    refreshBatches(snapshot.paymentBatches, selectedBatch.id);
  };

  const handleTransmitBatch = async () => {
    if (!selectedBatch) return;
    const { snapshot } = await TreasuryClient.updatePaymentBatchStatus(selectedBatch.id, 'TRANSMITTED');
    refreshBatches(snapshot.paymentBatches, selectedBatch.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <CreditCard className="w-4 h-4" />
            <span>{isAr ? 'مصنع المدفوعات والتحويلات البنكية المجمعة' : 'Payment Factory & Corporate Batch Settlement Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'إرسال الحوالات المجمعة، ملفات ISO20022، ومصفوفة الاعتمادات' : 'Batch Payment Files (SARIE / SWIFT / SEPA) & Approval Workflow'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'إنشاء دفعة مدفوعات، توليد ملفات MT103 و XML للبنك، اعتماد الحوالات الكبيرة وتتبع حالة التنفيذ' : 'Generate ISO20022 XML & SARIE MT103 files, execute dual-signatory approvals & monitor gateway execution.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Batches List & Active Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batches List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono">{isAr ? 'دفعات المدفوعات القائمة' : 'Payment Batches'}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">{batches.length}</span>
          </div>

          <div className="space-y-3">
            {batches.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedBatch(b)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedBatch && selectedBatch.id === b.id
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 font-mono">{b.batchNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    b.status === 'APPROVED' || b.status === 'SETTLED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-bold">{b.paymentMethod} • {b.fileFormat}</div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                  <span className="text-emerald-400 font-extrabold">SAR {b.totalAmountSAR.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Batch Inspector */}
        {selectedBatch && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-400 font-bold">{selectedBatch.batchNumber} • Format: {selectedBatch.fileFormat}</div>
                  <h3 className="text-xl font-bold text-white">{selectedBatch.sourceAccountNameEn}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedBatch.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={handleApproveBatch}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'اعتماد الدفعة (CFO Approval)' : 'Approve Payment Batch'}</span>
                    </button>
                  )}

                  {selectedBatch.status === 'APPROVED' && (
                    <button
                      onClick={handleTransmitBatch}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isAr ? 'إرسال الملف للبنك (Transmit File)' : 'Transmit Batch to Bank'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status and Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'قيمة الدفعة الكليّة' : 'Total Batch Amount'}</div>
                  <div className="text-lg font-bold text-white">SAR {selectedBatch.totalAmountSAR.toLocaleString()}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'عدد العمليات' : 'Item Count'}</div>
                  <div className="text-lg font-bold text-sky-400">{selectedBatch.items.length} Payments</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'معد بواسطة' : 'Prepared By'}</div>
                  <div className="text-slate-200 font-bold">{selectedBatch.preparedBy}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'المعتمد النهائي' : 'Approved By'}</div>
                  <div className="text-emerald-400 font-bold">{selectedBatch.approvedBy || 'Pending CFO'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{isAr ? 'تفاصيل الأطراف المستفيدة في الدفعة' : 'Beneficiary Payment Items'}</h4>

                <div className="bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                        <th className="p-3">{isAr ? 'اسم المستفيد' : 'Beneficiary Customer'}</th>
                        <th className="p-3">{isAr ? 'الحساب / الأيبان' : 'IBAN / Account'}</th>
                        <th className="p-3">{isAr ? 'رقم الفاتورة' : 'Invoice Ref'}</th>
                        <th className="p-3">{isAr ? 'المبلغ' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedBatch.items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/80">
                          <td className="p-3 font-bold text-white">{isAr ? item.vendorOrBeneficiaryNameAr : item.vendorOrBeneficiaryNameEn}</td>
                          <td className="p-3 text-slate-400 select-all">{item.ibanOrAccount}</td>
                          <td className="p-3 text-sky-400">{item.invoiceRef}</td>
                          <td className="p-3 text-emerald-400 font-bold">{item.currency} {item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
