import React, { useState, useEffect } from 'react';
import {
  Mail,
  QrCode,
  FileText,
  CheckCircle2,
  ExternalLink,
  Send,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Eye,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export interface EmailReceiptPreviewProps {
  pspReference?: string;
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  className?: string;
}

export const EmailReceiptPreview: React.FC<EmailReceiptPreviewProps> = ({
  pspReference = 'ADYEN-PSP-9941284-SAR',
  invoiceNumber = 'INV-784920',
  amount = 12500,
  currency = 'SAR',
  paymentMethod = 'MADA',
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [receiptHtml, setReceiptHtml] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');

  const fetchReceiptPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/payments/adyen/receipt/preview?pspReference=${encodeURIComponent(
          pspReference
        )}&invoiceNumber=${encodeURIComponent(invoiceNumber)}&amount=${amount}&currency=${currency}&paymentMethod=${paymentMethod}`,
        {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setQrCodeUrl(data.qrCodeUrl);
        setReceiptHtml(data.html);
      }
    } catch (err) {
      console.error('Failed fetching email receipt preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiptPreview();
  }, [pspReference, invoiceNumber, amount, currency, paymentMethod, token]);

  const handleSendEmail = async () => {
    setSending(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/payments/adyen/receipt/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pspReference,
          invoiceNumber,
          amount,
          currency,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg(
          isAr
            ? 'تم إرسال إشعار الإيصال الإلكتروني بالبريد بنجاح!'
            : 'Automated receipt email sent successfully!'
        );
      }
    } catch (err) {
      console.error('Failed sending receipt email:', err);
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://ajalogistics.sa/invoices/${invoiceNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {isAr ? 'نظام إشعارات البريد الإلكتروني للدفعة' : 'Automated Email Receipt & Proof System'}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold">
                Auto-Triggered
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'قالب تفاعلي يُرسل تلقائياً للعميل يتضمن تفاصيل الفاتورة، رابط التحميل، ورمز QR للإثبات الفيزيائي.'
                : 'Automated email notification template with transaction breakdown, invoice PDF link, and QR proof.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleSendEmail}
            disabled={sending}
            className="bg-[#00F0FF] hover:bg-[#00D0FF] text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isAr ? 'إرسال الإيصال بالبريد الآن' : 'Send Email Receipt'}</span>
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive QR Code & Proof Metadata */}
        <div className="space-y-4 lg:col-span-1">
          {/* QR Proof Box */}
          <div className="p-5 bg-slate-950/80 rounded-2xl border border-sky-500/30 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[9px] font-mono font-bold">
              Physical Proof
            </div>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'رمز الإثبات الفيزيائي' : 'Physical Proof QR Code'}</span>
            </h4>

            {qrCodeUrl ? (
              <div className="flex justify-center my-2">
                <img
                  src={qrCodeUrl}
                  alt="Payment Receipt QR"
                  className="w-40 h-40 rounded-xl border-2 border-white shadow-xl"
                />
              </div>
            ) : (
              <div className="w-40 h-40 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                {isAr ? 'جاري توليد الرمز...' : 'Generating QR...'}
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed px-2">
              {isAr
                ? 'يمكن إبراز الرمز ضوئياً لموظفي المعاينة والاستلام الميداني للتحقق من السداد فوراً.'
                : 'Scan code on field entry to verify official physical proof of payment.'}
            </p>

            <a
              href={qrCodeUrl || '#'}
              download={`Payment-Proof-${invoiceNumber}.png`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00F0FF] hover:underline pt-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل رمز QR للمعاينة الميدانية' : 'Download Proof QR Image'}</span>
            </a>
          </div>

          {/* Quick Invoice Details */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-300 flex items-center justify-between">
              <span>{isAr ? 'بيانات العملية المسددة:' : 'Transaction Summary:'}</span>
              <span className="font-mono text-[10px] text-emerald-400">Authorised</span>
            </h4>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-500">{isAr ? 'الفاتورة:' : 'Invoice:'}</span>
                <span className="text-white font-bold">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-500">{isAr ? 'مرجع Adyen:' : 'Adyen PSP:'}</span>
                <span className="text-[#00F0FF]">{pspReference}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-500">{isAr ? 'المبلغ:' : 'Amount:'}</span>
                <span className="text-emerald-400 font-bold">
                  {amount.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'طريقة الدفع:' : 'Method:'}</span>
                <span className="text-white">{paymentMethod}</span>
              </div>
            </div>

            <Button
              onClick={handleCopyLink}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم نسخ رابط الفاتورة!' : 'Copied!') : (isAr ? 'نسخ رابط الفاتورة المباشر' : 'Copy Invoice Link')}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Live Email Template Preview Frame */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00F0FF]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {isAr ? 'معاينة القالب التفاعلي للبريد الإلكتروني' : 'Automated Email Template Live Preview'}
              </h4>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'visual' ? 'bg-[#00F0FF] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'معاينة القالب' : 'Live Render'}
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'code' ? 'bg-[#00F0FF] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'كود HTML' : 'HTML Code'}
              </button>
            </div>
          </div>

          {activeTab === 'visual' ? (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden min-h-[480px]">
              {receiptHtml ? (
                <iframe
                  title="Receipt Email Preview"
                  srcDoc={receiptHtml}
                  className="w-full h-[480px] rounded-xl border-0 bg-slate-900"
                />
              ) : (
                <div className="h-[480px] flex items-center justify-center text-slate-500 text-xs">
                  {isAr ? 'جاري تحميل المعاينة...' : 'Loading preview...'}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-[11px] text-sky-300 overflow-x-auto h-[480px]">
              <pre>{receiptHtml || ''}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
