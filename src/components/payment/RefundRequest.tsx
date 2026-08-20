import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Send,
  UserCheck,
  Building2,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export interface EligibleTransaction {
  pspReference: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description: string;
  date: string;
  status: string;
  refundable: boolean;
}

export interface RefundRequestItem {
  id: string;
  userId: string;
  userName: string;
  pspReference: string;
  originalAmount: number;
  refundAmount: number;
  currency: string;
  paymentMethod: string;
  invoiceNumber: string;
  reason: string;
  notes?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adyenModificationPspReference?: string;
}

export interface RefundRequestProps {
  className?: string;
}

export const RefundRequest: React.FC<RefundRequestProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const [transactions, setTransactions] = useState<EligibleTransaction[]>([]);
  const [refunds, setRefunds] = useState<RefundRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Refund Request Form State
  const [selectedTx, setSelectedTx] = useState<EligibleTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, refRes] = await Promise.all([
        fetch('/api/payments/adyen/transactions', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }),
        fetch('/api/payments/adyen/refunds', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }),
      ]);

      const txData = await txRes.json();
      const refData = await refRes.json();

      if (txRes.ok) setTransactions(txData.transactions || []);
      if (refRes.ok) setRefunds(refData.refunds || []);
    } catch (err: any) {
      setError(err.message || 'Error loading refund transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSelectTransaction = (tx: EligibleTransaction) => {
    setSelectedTx(tx);
    setRefundAmount(tx.amount);
    setReason('');
    setNotes('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    if (!reason.trim()) {
      setError(isAr ? 'يرجى تقديم سبب استرداد المبلغ' : 'Please provide a reason for the refund');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/payments/adyen/refunds/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pspReference: selectedTx.pspReference,
          originalAmount: selectedTx.amount,
          refundAmount,
          currency: selectedTx.currency,
          paymentMethod: selectedTx.paymentMethod,
          invoiceNumber: selectedTx.invoiceNumber,
          reason,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          isAr
            ? 'تم رفع طلب الاسترداد بنجاح! سيتم رفعه لإدارة الحسابات للموافقة عبر Adyen Engine'
            : 'Refund request submitted! Awaiting financial admin review via Adyen'
        );
        setSelectedTx(null);
        fetchData();
      } else {
        setError(data.error || 'Failed to submit refund request');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminReview = async (refundId: string, action: 'APPROVE' | 'REJECT') => {
    setReviewingId(refundId);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/payments/adyen/refunds/${refundId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          adminNotes: action === 'APPROVE' ? 'Approved by financial manager' : 'Declined per terms',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          action === 'APPROVE'
            ? isAr
              ? `تمت الموافقة على طلب الاسترداد! مرجع الاسترداد من Adyen: ${data.refund.adyenModificationPspReference}`
              : `Refund request approved! Adyen Modification Ref: ${data.refund.adyenModificationPspReference}`
            : isAr
            ? 'تم رفض طلب الاسترداد'
            : 'Refund request rejected'
        );
        fetchData();
      } else {
        setError(data.error || 'Failed to review refund request');
      }
    } catch (err: any) {
      setError(err.message || 'Error reviewing refund request');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {isAr ? 'نظام طلبات استرداد المبالغ' : 'Adyen Payment Refund Requests'}
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold">
                {isAdmin ? 'Admin Approval Portal' : 'Customer Portal'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تقديم ومتابعة طلبات المبالغ المرتجعة للعمليات المسددة مع مراقبة موافقة الإدارة.'
                : 'Select completed transaction, submit refund reason, and track admin review.'}
            </p>
          </div>
        </div>

        <Button
          onClick={fetchData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Transaction Selection & Refund Form Grid */}
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 1: Select Transaction */}
          <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{isAr ? '1. اختر عملية مسددة للاسترداد:' : '1. Select Transaction to Refund:'}</span>
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.pspReference}
                  onClick={() => handleSelectTransaction(tx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTx?.pspReference === tx.pspReference
                      ? 'bg-[#082F49] border-[#00F0FF] text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">{tx.invoiceNumber}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tx.description}</p>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">PSP: {tx.pspReference}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#00F0FF] font-mono block">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Refund Form */}
          <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? '2. تفاصيل سبب طلب الاسترداد:' : '2. Refund Request Details:'}</span>
            </h4>

            {selectedTx ? (
              <form onSubmit={handleSubmitRefund} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'الفاتورة المحددة:' : 'Selected Invoice:'}</span>
                    <strong className="text-white font-mono">{selectedTx.invoiceNumber}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'مرجع Adyen PSP:' : 'Adyen PSP Ref:'}</span>
                    <strong className="text-white font-mono">{selectedTx.pspReference}</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">{isAr ? 'مبلغ الاسترداد المطلوبة (SAR):' : 'Requested Refund Amount:'}</label>
                  <input
                    type="number"
                    max={selectedTx.amount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-[#00F0FF] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    {isAr ? `المبلغ الأصلي المسدد: ${selectedTx.amount} SAR` : `Original Paid: ${selectedTx.amount} SAR`}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">{isAr ? 'سبب الاسترداد:' : 'Refund Reason:'}</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-[#00F0FF] focus:outline-none"
                  >
                    <option value="">{isAr ? '-- اختر سبب الاسترداد --' : '-- Select Reason --'}</option>
                    <option value="Duplicate Payment">{isAr ? 'خصم مكرر للفاتورة' : 'Duplicate Payment'}</option>
                    <option value="Shipment Cancellation">{isAr ? 'إلغاء الشحنة قبل التحميل' : 'Shipment Cancelled'}</option>
                    <option value="Overcharged Invoice">{isAr ? 'خطأ في احتساب تكلفة الفاتورة' : 'Overcharged Invoice'}</option>
                    <option value="Damaged Goods Refund">{isAr ? 'تعويض عن تلف شحنة' : 'Damaged Cargo Claim'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">{isAr ? 'ملاحظات إضافية:' : 'Additional Notes:'}</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isAr ? 'إضافة أية إيضاحات لفريق المالية...' : 'Provide details for finance team...'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isAr ? 'تقديم طلب الاسترداد للإدارة' : 'Submit Refund Request'}</span>
                </Button>
              </form>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                {isAr ? 'اختر عملية مسددة من القائمة للبدء في طلب الاسترداد' : 'Select a completed transaction from the left list'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refunds History & Admin Approval Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center justify-between">
          <span>{isAr ? 'سجل طلبات استرداد المبالغ وحالتها' : 'Refund Requests Status & Approvals'}</span>
          <span className="text-[10px] text-slate-400 font-mono">Adyen Modification Engine</span>
        </h4>

        {refunds.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
            {isAr ? 'لا توجد طلبات استرداد حالياً' : 'No refund requests recorded yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {refunds.map((ref) => (
              <div
                key={ref.id}
                className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">{ref.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-300">
                      {ref.invoiceNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ref.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ref.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{ref.reason}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>{ref.userName}</span>
                    <span>•</span>
                    <span>PSP: {ref.pspReference}</span>
                    <span>•</span>
                    <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                  </div>

                  {ref.adyenModificationPspReference && (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Adyen Refund Ref: {ref.adyenModificationPspReference}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-400 font-mono block">
                      -{ref.refundAmount.toLocaleString()} {ref.currency}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'من أصل:' : 'Original:'} {ref.originalAmount.toLocaleString()} {ref.currency}
                    </span>
                  </div>

                  {/* Admin Approve / Reject Actions */}
                  {isAdmin && ref.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        onClick={() => handleAdminReview(ref.id, 'APPROVE')}
                        disabled={reviewingId === ref.id}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAr ? 'موافقة Adyen' : 'Approve'}</span>
                      </Button>
                      <Button
                        onClick={() => handleAdminReview(ref.id, 'REJECT')}
                        disabled={reviewingId === ref.id}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{isAr ? 'رفض' : 'Reject'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
