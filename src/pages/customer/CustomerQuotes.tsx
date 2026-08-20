import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, MessageCircle, PhoneCall, Paperclip, Clock, Tag, Check, CheckCircle2, X, CreditCard, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdyenCheckoutModal } from '../../components/payment/AdyenCheckoutModal';
import { useAuth } from '../../context/AuthContext';
import { QuoteRequest } from '../../types/quote';

export const CustomerQuotes: React.FC<{ onNewQuote: () => void }> = ({ onNewQuote }) => {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adyenModalOpen, setAdyenModalOpen] = useState(false);

  const fetchQuotes = () => {
    if (!token) return;
    fetch('/api/quotes', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setQuotes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, [token]);

  const handleAcceptQuote = async () => {
    if (!selectedQuote || !token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote.id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedQuote(updated);
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت عملية الموافقة على عرض السعر');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineQuote = async () => {
    if (!selectedQuote || !token) return;
    const reason = window.prompt('الرجاء إدخال سبب عدم مناسبة عرض السعر (اختياري):');
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${selectedQuote.id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedQuote(updated);
        fetchQuotes();
      } else {
        const err = await res.json();
        alert(err.error || 'فشلت عملية رفض عرض السعر');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const reqNo = (q.requestNumber || q.id).toLowerCase();
    const cargo = (q.cargoType || q.cargoDetails || '').toLowerCase();
    const origin = (q.pickupLocation || q.origin || '').toLowerCase();
    const dest = (q.deliveryLocation || q.destination || '').toLowerCase();
    return reqNo.includes(term) || cargo.includes(term) || origin.includes(term) || dest.includes(term);
  });

  if (loading) return <LoadingSpinner label="جاري تحميل طلبات عروض الأسعار..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">طلبات عروض الأسعار الخاصة بي</h2>
          <p className="text-xs text-slate-500">متابعة طلبات التسعير والعروض المقدمة من فريق عمليات أجا</p>
        </div>
        <Button variant="primary" onClick={onNewQuote} className="gap-2 font-bold text-xs shrink-0">
          <Plus className="w-4 h-4" />
          <span>تقديم طلب عرض سعر جديد</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="ابحث برقم الطلب، الوجهة، نوع البضاعة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-9 py-2 text-xs"
        />
      </div>

      <Card>
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-bold">لا توجد طلبات عروض أسعار مطابقة.</p>
            <Button variant="outline" size="sm" onClick={onNewQuote} className="text-xs">
              تقديم طلب جديد الآن
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">نوع الخدمة</th>
                  <th className="p-3">مسار النقل (من - إلى)</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">عرض السعر المقدم</th>
                  <th className="p-3">تاريخ الطلب</th>
                  <th className="p-3">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => {
                  const reqNo = q.requestNumber || q.id;
                  const pickup = q.pickupLocation || q.origin || '-';
                  const delivery = q.deliveryLocation || q.destination || '-';
                  const price = q.quoteResponse?.offeredPrice || q.offeredPrice;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold font-mono text-[#082F49]">{reqNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[11px]">
                          {q.shipmentType || q.serviceType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{pickup} ← {delivery}</td>
                      <td className="p-3"><StatusBadge type="quote" status={q.status} /></td>
                      <td className="p-3 font-bold text-emerald-700">
                        {price ? `${Number(price).toLocaleString()} ${q.quoteResponse?.currency || 'SAR'}` : 'قيد الدراسة والتقدير'}
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(q.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" onClick={() => setSelectedQuote(q)} className="gap-1 font-bold text-[11px]">
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quote Details Modal */}
      <Modal isOpen={!!selectedQuote} onClose={() => setSelectedQuote(null)} title={`تفاصيل طلب عرض السعر: ${selectedQuote?.requestNumber || selectedQuote?.id}`}>
        {selectedQuote && (
          <div className="space-y-6 text-slate-900 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-500">حالة الطلب الحالية</p>
                <div className="mt-1"><StatusBadge type="quote" status={selectedQuote.status} /></div>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-500">تاريخ التقديم</p>
                <p className="font-bold text-slate-700">{new Date(selectedQuote.createdAt).toLocaleString('ar-SA')}</p>
              </div>
            </div>

            {/* Official Response from Company */}
            {(selectedQuote.quoteResponse?.offeredPrice || selectedQuote.offeredPrice) && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-700" />
                    عرض السعر الرسمي المقدم من شركة أجا للخدمات اللوجستية
                  </span>
                  <span className="text-lg font-black text-emerald-700 font-mono">
                    {(selectedQuote.quoteResponse?.offeredPrice || selectedQuote.offeredPrice)?.toLocaleString()} {selectedQuote.quoteResponse?.currency || 'SAR'}
                  </span>
                </div>
                {selectedQuote.quoteResponse?.validUntil && (
                  <p className="text-emerald-800 text-[11px]">العرض ساري حتى: <span className="font-bold">{selectedQuote.quoteResponse.validUntil}</span></p>
                )}
                {selectedQuote.quoteResponse?.terms && (
                  <p className="text-emerald-800 text-[11px]">الشروط والأحكام: {selectedQuote.quoteResponse.terms}</p>
                )}

                {/* Customer Action: Accept or Decline or Pay via Adyen */}
                {(selectedQuote.status === 'QUOTE_SENT' || selectedQuote.status === 'UNDER_REVIEW' || selectedQuote.status === 'CONTACTED' || selectedQuote.status === 'NEGOTIATING' || selectedQuote.status === 'AGREED') && (
                  <div className="pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>الدفع الإلكتروني الآمن بواسطة بوابة Adyen (مدى / Visa / Apple Pay)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedQuote.status !== 'AGREED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeclineQuote}
                          isLoading={actionLoading}
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                        >
                          رفض العرض
                        </Button>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setAdyenModalOpen(true)}
                        className="bg-[#082F49] hover:bg-[#0F4C75] text-emerald-400 border border-emerald-400/40 text-xs font-black gap-1.5 shadow-md px-4 py-2"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>الدفع الآن عبر Adyen (مدى / Visa)</span>
                      </Button>
                    </div>
                  </div>
                )}
                {selectedQuote.status === 'AGREED' && (
                  <div className="pt-2 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تمت الموافقة على عرض السعر هذا من قبلكم، وقيد الإصدار كشحنة رسمية لدى قسم العمليات.</span>
                  </div>
                )}
              </div>
            )}

            {/* Shipment Specifications */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#082F49] border-r-2 border-[#0F4C75] pr-2">مواصفات الشحنة المطلوب تسعيرها</h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block">نوع الخدمة:</span>
                  <span className="font-bold">{selectedQuote.shipmentType || selectedQuote.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">طبيعة البضاعة:</span>
                  <span className="font-bold">{selectedQuote.cargoType || selectedQuote.cargoDetails}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">نقطة التحميل (Origin):</span>
                  <span className="font-bold">{selectedQuote.pickupLocation || selectedQuote.origin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">نقطة التسليم (Destination):</span>
                  <span className="font-bold">{selectedQuote.deliveryLocation || selectedQuote.destination}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الوزن التقديري:</span>
                  <span className="font-bold">{selectedQuote.approximateWeight || selectedQuote.weightKg || '-'} كجم</span>
                </div>
                <div>
                  <span className="text-slate-500 block">عدد الطرود / الحاويات:</span>
                  <span className="font-bold">{selectedQuote.packageOrContainerCount || selectedQuote.volumeCbm || '-'}</span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-[#082F49]">الملفات والمرفقات</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedQuote.attachments.map((att, i) => (
                    <span key={i} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                      <span>{typeof att === 'string' ? att : att.name || 'ملف'}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Contact Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/966500000000?text=${encodeURIComponent(`استفسار بخصوص عرض السعر رقم (${selectedQuote.requestNumber || selectedQuote.id})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>استفسار عبر الواتساب</span>
              </a>

              <a
                href="tel:920000000"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>اتصال هاتف</span>
              </a>

              <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Adyen Payment Modal */}
      {selectedQuote && (
        <AdyenCheckoutModal
          isOpen={adyenModalOpen}
          onClose={() => setAdyenModalOpen(false)}
          referenceNumber={selectedQuote.requestNumber || selectedQuote.id}
          entityType="QUOTE"
          entityId={selectedQuote.id}
          amount={Number(selectedQuote.quoteResponse?.offeredPrice || selectedQuote.offeredPrice || 1500)}
          currency={selectedQuote.quoteResponse?.currency || 'SAR'}
          description={`تسديد قيمة عرض السعر رقم (${selectedQuote.requestNumber || selectedQuote.id}) - شركة أجا`}
          onPaymentSuccess={() => {
            fetchQuotes();
            setSelectedQuote(null);
          }}
        />
      )}
    </div>
  );
};

