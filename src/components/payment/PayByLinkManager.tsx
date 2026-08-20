import React, { useState, useEffect } from 'react';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Send,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
  Share2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  Download,
  Eye,
  Trash2,
  Sparkles,
  Lock,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export interface PaymentLinkItem {
  id: string;
  url: string;
  status: 'active' | 'completed' | 'expired';
  amount: { currency: string; value: number };
  reference: string;
  description?: string;
  shopperEmail?: string;
  expiresAt: string;
  createdAt: string;
  reusable: boolean;
  qrCodeUrl?: string;
}

export interface PayByLinkManagerProps {
  initialAmount?: number;
  initialCurrency?: string;
  initialReference?: string;
  className?: string;
}

export const PayByLinkManager: React.FC<PayByLinkManagerProps> = ({
  initialAmount = 15000,
  initialCurrency = 'SAR',
  initialReference = 'INV-992481',
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { token } = useAuth();

  // Form state
  const [amount, setAmount] = useState<number>(initialAmount);
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [reference, setReference] = useState<string>(initialReference);
  const [description, setDescription] = useState<string>(
    'خدمات شحن وتخليد جمركي - شركة أجا اللوجستية'
  );
  const [shopperEmail, setShopperEmail] = useState<string>('client@ajalogistics.sa');
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [reusable, setReusable] = useState<boolean>(false);

  // Status & List state
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingList, setFetchingList] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<PaymentLinkItem | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLinkItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active testing modal
  const [testModalUrl, setTestModalUrl] = useState<string | null>(null);

  const fetchPaymentLinks = async () => {
    setFetchingList(true);
    try {
      const res = await fetch('/api/payments/adyen/payment-links', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentLinks(data.paymentLinks || []);
      }
    } catch (err) {
      console.error('Failed fetching payment links:', err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    fetchPaymentLinks();
  }, [token]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedLink(null);

    try {
      const res = await fetch('/api/payments/adyen/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount,
          currency,
          reference,
          description,
          shopperEmail,
          expiresInHours,
          reusable,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedLink(data.paymentLink);
        fetchPaymentLinks();
      } else {
        setError(data.error || 'فشل في إنشاء رابط الدفع عبر Adyen');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating payment link';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExpireLink = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/adyen/payment-links/${id}/expire`, {
        method: 'PATCH',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        fetchPaymentLinks();
        if (createdLink?.id === id) {
          setCreatedLink((prev) => (prev ? { ...prev, status: 'expired' } : null));
        }
      }
    } catch (err) {
      console.error('Failed expiring payment link:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {isAr ? 'مدفوع (Paid)' : 'Completed'}
          </span>
        );
      case 'expired':
        return (
          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {isAr ? 'منتهي (Expired)' : 'Expired'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00F0FF] animate-pulse" />
            {isAr ? 'نشط ومتاح بالسداد' : 'Active'}
          </span>
        );
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-[#00F0FF]">
              <Link2 className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {isAr ? 'خدمة الدفع عبر الرابط المباشر (Adyen Pay by Link)' : 'Adyen Pay by Link Gateway'}
              </h3>
              <span className="px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full text-[10px] font-mono font-bold">
                v71 Unified Commerce
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'إنشاء روابط سداد مشفرة وآمنة ومشاركتها عبر الواتساب والبريد لإتمام الدفع بضغطة زر.'
                : 'Generate secure, multi-currency payment links sent via SMS, WhatsApp, or Email.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://docs.adyen.com/unified-commerce/pay-by-link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-bold text-slate-400 hover:text-[#00F0FF] flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Adyen Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Grid: Left Creation Form / Right Result & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Creation Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'إنشاء رابط سداد جديد' : 'Generate New Payment Link'}</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Hosted Checkout</span>
          </div>

          <form onSubmit={handleCreateLink} className="space-y-3.5 text-xs">
            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'المبلغ المطلوب (Amount)' : 'Payment Amount'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'العملة' : 'Currency'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-2.5 py-2 text-white font-mono font-bold text-xs outline-none cursor-pointer"
                >
                  <option value="SAR">SAR (ر.س)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="QAR">QAR (ر.ق)</option>
                  <option value="KWD">KWD (د.ك)</option>
                </select>
              </div>
            </div>

            {/* Reference Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">
                {isAr ? 'رقم المرجع / الفاتورة (Reference)' : 'Merchant Reference'}
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                placeholder="INV-2026-991"
              />
            </div>

            {/* Shopper Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">
                {isAr ? 'بريد العميل الإلكتروني' : 'Customer Email'}
              </label>
              <input
                type="email"
                value={shopperEmail}
                onChange={(e) => setShopperEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                placeholder="client@ajalogistics.sa"
              />
            </div>

            {/* Description / Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">
                {isAr ? 'وصف الخدمة أو الشحنة' : 'Line Item Description'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-3 py-2 text-white text-xs outline-none"
              />
            </div>

            {/* Expiration Hours */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'صلاحية الرابط' : 'Link Expiration'}
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-2.5 py-2 text-white font-mono text-xs outline-none cursor-pointer"
                >
                  <option value={1}>1 Hour (ساعة واحدة)</option>
                  <option value={12}>12 Hours (12 ساعة)</option>
                  <option value={24}>24 Hours (يوم واحد)</option>
                  <option value={168}>7 Days (أسبوع)</option>
                  <option value={720}>30 Days (شهر)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'نوع الاستخدام' : 'Usage Limit'}
                </label>
                <select
                  value={reusable ? 'true' : 'false'}
                  onChange={(e) => setReusable(e.target.value === 'true')}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-2.5 py-2 text-white font-mono text-xs outline-none cursor-pointer"
                >
                  <option value="false">{isAr ? 'استخدام مرة واحدة' : 'Single-use Link'}</option>
                  <option value="true">{isAr ? 'متعدد الاستخدامات' : 'Reusable Link'}</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00F0FF] to-sky-500 hover:from-[#00D0FF] hover:to-sky-400 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00F0FF]/10 mt-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isAr ? 'توليد رابط Adyen Pay by Link' : 'Generate Adyen Payment Link'}</span>
            </Button>
          </form>
        </div>

        {/* Generated Link Result & History List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Generated Link Card */}
          {createdLink ? (
            <div className="bg-gradient-to-br from-sky-950/80 to-slate-950 border-2 border-[#00F0FF] rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {isAr ? 'تم توليد رابط السداد المباشر بنجاح!' : 'Payment Link Created Successfully!'}
                    </h4>
                    <p className="text-[10px] font-mono text-sky-300">ID: {createdLink.id}</p>
                  </div>
                </div>

                {getStatusBadge(createdLink.status)}
              </div>

              {/* Link Box */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {isAr ? 'رابط الدفع المشفر المباشر (Adyen URL)' : 'Adyen Encrypted Payment URL'}
                </label>

                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-xs text-[#00F0FF]">
                  <input
                    type="text"
                    readOnly
                    value={createdLink.url}
                    className="bg-transparent w-full text-xs outline-none truncate text-[#00F0FF]"
                  />
                  <button
                    onClick={() => copyToClipboard(createdLink.url, createdLink.id)}
                    className="px-3 py-1.5 bg-[#00F0FF] text-slate-950 rounded-lg font-bold hover:bg-[#00D0FF] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedId === createdLink.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === createdLink.id ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Share Options & Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `مرحباً، يمكنك سداد الفاتورة #${createdLink.reference} بمبلغ ${
                      createdLink.amount.value / 100
                    } ${createdLink.amount.currency} عبر رابط السداد الآمن:\n${createdLink.url}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'مشاركة عبر واتساب' : 'WhatsApp'}</span>
                </a>

                <a
                  href={`mailto:${createdLink.shopperEmail || ''}?subject=${encodeURIComponent(
                    `رابط سداد الفاتورة #${createdLink.reference}`
                  )}&body=${encodeURIComponent(
                    `عزيزنا العميل،\nيرجى سداد الفاتورة عبر رابط Adyen الآمن التالي:\n${createdLink.url}\n\nشكراً لك، شركة أجا اللوجستية.`
                  )}`}
                  className="p-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? 'إرسال بالبريد' : 'Email'}</span>
                </a>

                <button
                  onClick={() => setTestModalUrl(createdLink.url)}
                  className="p-2 bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 text-[#00F0FF] border border-[#00F0FF]/40 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer col-span-2 sm:col-span-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isAr ? 'اختبار صفحة الدفع' : 'Test Checkout'}</span>
                </button>
              </div>

              {/* QR Proof Box if present */}
              {createdLink.qrCodeUrl && (
                <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                  <img
                    src={createdLink.qrCodeUrl}
                    alt="Payment Link QR"
                    className="w-20 h-20 rounded-lg border-2 border-white shadow-md shrink-0"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>{isAr ? 'رمز QR مسح سريع للسداد' : 'Scan to Pay QR Code'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isAr
                        ? 'يمكن للعميل مسح الرمز من الجوال والدفع فوراً عبر مدى أو Apple Pay.'
                        : 'Shopper can scan with mobile camera to launch Adyen Checkout.'}
                    </p>
                    <a
                      href={createdLink.qrCodeUrl}
                      download={`Adyen-PayLink-QR-${createdLink.reference}.png`}
                      className="inline-flex items-center gap-1 text-[10px] text-[#00F0FF] font-bold hover:underline pt-0.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>{isAr ? 'حفظ رمز QR' : 'Download QR'}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/30 text-[#00F0FF] flex items-center justify-center">
                <Link2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {isAr ? 'جاهز لتوليد روابط الدفع' : 'Ready to Generate Pay by Link'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isAr
                  ? 'أدخل بيانات الفاتورة أو المرجع والمبلغ على اليسار للبدء بتوليد روابط سداد Adyen معتمدة.'
                  : 'Fill in the reference and amount on the left to generate an Adyen payment link.'}
              </p>
            </div>
          )}

          {/* Historical Generated Links Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAr ? 'سجل روابط الدفع المنشأة سابقاً' : 'Generated Payment Links History'}</span>
              </h4>
              <button
                onClick={fetchPaymentLinks}
                disabled={fetchingList}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingList ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'تحديث' : 'Refresh'}</span>
              </button>
            </div>

            {paymentLinks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {isAr ? 'لا توجد روابط سداد مسجلة حالياً' : 'No active payment links found'}
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {paymentLinks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{item.reference}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-[11px] font-mono text-[#00F0FF]">
                        {(item.amount.value / 100).toLocaleString()} {item.amount.currency}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(item.url, item.id)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                        title={isAr ? 'نسخ الرابط' : 'Copy link'}
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => setTestModalUrl(item.url)}
                        className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-all cursor-pointer"
                        title={isAr ? 'معاينة صفحة الدفع' : 'Preview Checkout'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {item.status === 'active' && (
                        <button
                          onClick={() => handleExpireLink(item.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer"
                          title={isAr ? 'إلغاء الرابط' : 'Expire link'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Checkout Modal Drawer */}
      {testModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00F0FF]" />
                <h4 className="text-xs font-bold text-white">
                  {isAr ? 'معاينة صفحة السداد الآمنة (Adyen Hosted Checkout)' : 'Adyen Hosted Checkout Test Preview'}
                </h4>
              </div>
              <button
                onClick={() => setTestModalUrl(null)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-4 bg-slate-950 border border-sky-500/30 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isAr ? 'رابط الدفع المباشر:' : 'Payment URL:'}</span>
                  <span className="font-mono text-[#00F0FF] truncate max-w-xs">{testModalUrl}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <a
                    href={testModalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#00F0FF] text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-[#00D0FF]"
                  >
                    <span>{isAr ? 'فتح في نافذة جديدة' : 'Open in New Tab'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Simulated Adyen Hosted Checkout Page inside Modal */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-black text-white">
                    {isAr ? 'بوابة الدفع الإلكتروني - شركة أجا اللوجستية' : 'Aja Logistics - Adyen Secure Checkout'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr
                      ? 'صفحة سداد مستضافة آمنة ومعتمدة عبر خوادم Adyen v71'
                      : 'Encrypted hosted checkout powered by Adyen N.V.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl text-left font-mono text-xs space-y-2 border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isAr ? 'التاجر (Merchant):' : 'Merchant:'}</span>
                    <span className="text-white">AJA Logistics Global</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isAr ? 'الخدمة:' : 'Service:'}</span>
                    <span className="text-white">Freight & Logistics Clearance</span>
                  </div>
                  <div className="flex justify-between text-[#00F0FF] font-bold text-sm pt-1 border-t border-slate-800">
                    <span>{isAr ? 'الإجمالي:' : 'Total Amount:'}</span>
                    <span>15,000.00 SAR</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'جاهز لاستقبال بطاقات مدى و Visa و Apple Pay' : 'Ready for MADA, Visa, Mastercard & Apple Pay'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
