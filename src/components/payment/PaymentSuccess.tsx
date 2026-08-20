import React, { useState } from 'react';
import {
  CheckCircle2,
  Receipt,
  Copy,
  Check,
  Truck,
  ArrowRight,
  Printer,
  Download,
  ShieldCheck,
  ExternalLink,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import { generatePaymentInvoicePDF } from '../../utils/pdfExport';

export interface PaymentSuccessProps {
  pspReference: string;
  referenceNumber: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paidAt?: string;
  shipmentId?: string;
  entityType?: 'SHIPMENT' | 'QUOTE' | 'INVOICE';
  onViewShipment?: (shipmentIdOrRef: string) => void;
  onGoToDashboard?: () => void;
  onDownloadReceipt?: () => void;
  className?: string;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  pspReference,
  referenceNumber,
  amount,
  currency = 'SAR',
  paymentMethod = 'MADA / Adyen Checkout',
  paidAt,
  shipmentId,
  entityType = 'SHIPMENT',
  onViewShipment,
  onGoToDashboard,
  onDownloadReceipt,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [copiedPsp, setCopiedPsp] = useState(false);

  const formattedDate = paidAt
    ? new Date(paidAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  const handleCopyPsp = () => {
    navigator.clipboard.writeText(pspReference);
    setCopiedPsp(true);
    setTimeout(() => setCopiedPsp(false), 2000);
  };

  const handleDownloadPDFInvoice = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt();
    } else {
      generatePaymentInvoicePDF({
        pspReference,
        referenceNumber,
        amount,
        currency,
        paymentMethod,
        paidAt,
        entityType,
        description: `Logistics Service Payment - ${referenceNumber}`,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-[#0F4C75] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 ${className}`}>
      {/* Visual Header / Success Icon Badge */}
      <div className="text-center space-y-3">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاملة مؤكدة ومشفرة عبر Adyen PSP' : 'Verified Adyen Encrypted Payment'}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isAr ? 'تمت عملية الدفع وتأكيد السداد بنجاح!' : 'Payment Authorized & Confirmed!'}
          </h2>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
            {isAr
              ? 'تم قبول ومعالجة المعاملة المالية بنجاح عبر ممر Adyen البنكي الآمن، وتم تحديث حالة الشحنة/العرض تلقائياً.'
              : 'Your payment was successfully processed and authorized via Adyen Gateway. Order status updated instantly.'}
          </p>
        </div>
      </div>

      {/* Official Transaction Receipt Card */}
      <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#00F0FF]" />
            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {isAr ? 'إيصال المعاملة المالية المعتمد' : 'Official Payment Receipt'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            AUTHORISED
          </span>
        </div>

        {/* Receipt Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount Paid */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
              {isAr ? 'المبلغ المستلم:' : 'Amount Paid:'}
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {amount.toLocaleString()} <span className="text-xs text-slate-700 dark:text-slate-300">{currency}</span>
            </div>
          </div>

          {/* Adyen PSP Reference */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
              {isAr ? 'رقم مرجع Adyen (PSP Reference):' : 'Adyen PSP Reference:'}
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <strong className="text-xs text-[#0F4C75] dark:text-[#00F0FF] truncate font-bold">
                {pspReference}
              </strong>
              <button
                onClick={handleCopyPsp}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                title={isAr ? 'نسخ المرجع' : 'Copy'}
              >
                {copiedPsp ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Reference / Shipment Number */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
              {entityType === 'QUOTE'
                ? (isAr ? 'رقم عرض السعر:' : 'Quote Ref:')
                : (isAr ? 'رقم الشحنة اللوجستية:' : 'Shipment Ref:')}
            </span>
            <strong className="text-xs text-slate-900 dark:text-white block mt-1 font-bold">
              {referenceNumber}
            </strong>
          </div>

          {/* Payment Method & Date */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
              {isAr ? 'طريقة السداد والتاريخ:' : 'Payment Method & Date:'}
            </span>
            <div className="text-xs text-slate-800 dark:text-slate-200 font-bold mt-1">
              <span className="text-amber-600 dark:text-amber-400 uppercase">{paymentMethod}</span>
              <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
          <span>{isAr ? 'شركة أجا اللوجستية ش.م.م - النقل الدولي والتخليص الجمركي' : 'AJA Logistics Corp - Freight & Customs'}</span>
          <span>100% Secure PCI-DSS Level 1</span>
        </div>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Shipment Details Button */}
          {(shipmentId || referenceNumber) && onViewShipment && (
            <Button
              onClick={() => onViewShipment(shipmentId || referenceNumber)}
              className="w-full sm:w-auto bg-[#082F49] dark:bg-[#00F0FF] text-white dark:text-slate-950 font-black text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 shadow-md cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{isAr ? 'تتبع الشحنة وعرض التفاصيل' : 'View & Track Shipment'}</span>
            </Button>
          )}

          {/* Download Branded PDF Invoice Button */}
          <Button
            onClick={handleDownloadPDFInvoice}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تحميل الفاتورة الضريبية PDF' : 'Download PDF Invoice'}</span>
          </Button>

          {/* Print Receipt */}
          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full sm:w-auto border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </Button>
        </div>

        {/* Back to Dashboard Button */}
        {onGoToDashboard && (
          <button
            onClick={onGoToDashboard}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors py-2 cursor-pointer"
          >
            <span>{isAr ? 'العودة للوحة التحكم الرئيسية' : 'Back to Dashboard'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};
