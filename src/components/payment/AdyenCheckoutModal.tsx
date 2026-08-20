import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Sparkles, 
  Printer, 
  Building2, 
  Smartphone, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Receipt,
  FileCheck2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAdyenPayment } from '../../hooks/useAdyenPayment';

export interface AdyenCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceNumber: string;
  entityType?: 'QUOTE' | 'SHIPMENT';
  entityId?: string;
  amount: number;
  currency?: string;
  description?: string;
  onPaymentSuccess?: (pspReference: string, amount: number) => void;
}

export const AdyenCheckoutModal: React.FC<AdyenCheckoutModalProps> = ({
  isOpen,
  onClose,
  referenceNumber,
  entityType = 'QUOTE',
  entityId,
  amount,
  currency = 'SAR',
  description,
  onPaymentSuccess,
}) => {
  const { language } = useLanguage();
  const { token, user } = useAuth();
  const isAr = language === 'ar';

  const { 
    status: adyenStatus, 
    processPayment, 
    createSession,
    error: adyenError, 
    isLoading: adyenLoading,
    resetState: resetAdyen 
  } = useAdyenPayment();

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MADA' | 'APPLE_PAY' | 'BANK_TRANSFER'>('MADA');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'FORM' | '3DS_CHALLENGE' | 'SUCCESS'>('FORM');
  const [pspReference, setPspReference] = useState<string>('');
  const [paidAt, setPaidAt] = useState<string>('');

  // Adyen Config loaded from backend
  const [adyenConfig, setAdyenConfig] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('FORM');
      setError(null);
      resetAdyen();
      // Fetch Adyen configuration
      fetch('/api/payments/adyen/config')
        .then((res) => res.json())
        .then((data) => setAdyenConfig(data))
        .catch((err) => console.error('Failed to load Adyen config:', err));

      // Also create Adyen session in background for session-based checkout
      createSession({
        amount,
        currency,
        reference: referenceNumber,
        description: description || `Adyen Payment ${referenceNumber}`,
      });
    }
  }, [isOpen, referenceNumber, amount, currency, description, resetAdyen, createSession]);

  const handleFormatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleFormatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  const fillTestCard = (type: 'MADA' | 'VISA' | 'DECLINED') => {
    setError(null);
    if (type === 'MADA') {
      setPaymentMethod('MADA');
      setCardNumber('5888 5000 0000 1234');
      setExpiry('12/28');
      setCvv('321');
    } else if (type === 'VISA') {
      setPaymentMethod('CARD');
      setCardNumber('4111 1111 1111 1111');
      setExpiry('10/29');
      setCvv('888');
    } else {
      setPaymentMethod('CARD');
      setCardNumber('4000 0000 0000 0000');
      setExpiry('05/27');
      setCvv('000');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (paymentMethod === 'CARD' || paymentMethod === 'MADA') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
        setError(isAr ? 'الرجاء إدخال رقم بطاقة صحيح' : 'Please enter a valid card number');
        return;
      }
      if (!expiry || expiry.length < 5) {
        setError(isAr ? 'الرجاء إدخال تاريخ انتهاء الصلاحية' : 'Please enter expiry date');
        return;
      }
      if (!cvv || cvv.length < 3) {
        setError(isAr ? 'الرجاء إدخال رمز الأمان CVC/CVV' : 'Please enter CVV code');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      setStep('3DS_CHALLENGE');

      const paymentTypeMap = {
        MADA: 'mada' as const,
        APPLE_PAY: 'applepay' as const,
        CARD: 'scheme' as const,
        BANK_TRANSFER: 'directEbanking' as const,
      };

      const result = await processPayment({
        amount,
        currency,
        reference: referenceNumber,
        entityType,
        entityId,
        description: description || `Adyen Logistics Payment - ${referenceNumber}`,
        paymentMethod: {
          type: paymentTypeMap[paymentMethod] || 'scheme',
        },
        cardDetails: {
          number: cardNumber.replace(/\s/g, ''),
          holder: cardHolder,
          expiry,
        },
      });

      if (result && result.resultCode === 'Authorised') {
        setPspReference(result.pspReference);
        setPaidAt(result.timestamp || new Date().toISOString());
        setStep('SUCCESS');
        if (onPaymentSuccess) {
          onPaymentSuccess(result.pspReference, amount);
        }
      } else {
        setStep('FORM');
        setError(result?.refusalReason || adyenError || (isAr ? 'تم رفض عملية الدفع من البنك المصدر' : 'Payment declined by issuer bank'));
      }
    } catch (err: any) {
      console.error(err);
      setStep('FORM');
      setError(isAr ? 'حدث خطأ في الاتصال ببوابة Adyen' : 'Network error connecting to Adyen Payment Gateway');
    } finally {
      setLoading(false);
    }
  };

  const vatAmount = Math.round(amount * 0.15 * 100) / 100;
  const netAmount = Math.round((amount - vatAmount) * 100) / 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'بوابة الدفع الإلكتروني المعتمدة - Adyen' : 'Adyen Secure Payment Gateway'}
    >
      <div className="space-y-5 text-xs text-slate-900 rtl:text-right ltr:text-left">
        
        {/* Adyen Gateway Brand Banner */}
        <div className="bg-[#082F49] text-white p-3.5 rounded-2xl border border-[#0F4C75] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C75] border border-[#0F4C75] flex items-center justify-center font-black text-emerald-400 text-sm tracking-wider">
              adyen
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-white">Adyen Payment Gateway</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                  PCI-DSS Level 1
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isAr ? 'بوابة دفع عالمية مشفرة ومؤمنة بالكامل لشركة أجا الدولية' : 'Global encrypted checkout for AJA International Logistics'}
              </p>
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        </div>

        {/* STEP 1: FORM PAYMENT */}
        {step === 'FORM' && (
          <form onSubmit={handlePay} className="space-y-5">
            
            {/* Amount Breakdown Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>{isAr ? 'مرجع الفاتورة / الطلب:' : 'Invoice / Reference:'}</span>
                <span className="font-mono font-bold text-[#0F4C75]">{referenceNumber}</span>
              </div>
              {description && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>{isAr ? 'الوصف:' : 'Description:'}</span>
                  <span className="font-medium text-slate-800">{description}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                <span>{isAr ? 'المبلغ القابل للخضوع للضريبة:' : 'Subtotal (Net):'}</span>
                <span>{netAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{isAr ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
                <span>{vatAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-300">
                <span>{isAr ? 'إجمالي السداد المطلوب:' : 'Total Payable Amount:'}</span>
                <span className="text-emerald-700 font-mono text-base font-black">
                  {amount.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block text-xs">
                {isAr ? 'اختر طريقة الدفع المناسبة عبر Adyen:' : 'Select Adyen Payment Method:'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MADA')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'MADA'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-2 ring-emerald-500/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span className="font-black text-xs text-emerald-700 font-sans tracking-wide">مدى MADA</span>
                  <span className="text-[10px] text-slate-500">{isAr ? 'البطاقة السعودية' : 'Saudi National Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-sky-600 bg-sky-50/80 text-sky-900 font-bold ring-2 ring-sky-500/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  <span className="text-[10px] text-slate-600">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('APPLE_PAY')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'APPLE_PAY'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold ring-2 ring-slate-800/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-slate-900" />
                  <span className="text-[10px] font-bold">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold ring-2 ring-indigo-500/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] text-slate-600">{isAr ? 'سداد / تحويل' : 'SADAD / Wire'}</span>
                </button>
              </div>
            </div>

            {/* CARD / MADA INPUT FIELDS */}
            {(paymentMethod === 'MADA' || paymentMethod === 'CARD') && (
              <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? 'اسم صاحب البطاقة (كما هو مدون عليها)' : 'Cardholder Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="E.g. AHMED MOHAMMED"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C75] font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? 'رقم البطاقة (16 رقم)' : 'Card Number'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleFormatCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0F4C75] tracking-widest text-slate-900"
                    />
                    <CreditCard className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isAr ? 'تاريخ الانتهاء (شهر/سنة)' : 'Expiry Date (MM/YY)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => handleFormatExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C75] font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isAr ? 'رمز الأمان (CVV/CVC)' : 'Security Code (CVV)'}
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C75] font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* TEST CARD PRESET BUTTONS FOR EASY TESTING */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                    {isAr ? 'عينات بطاقات اختبار Adyen السريعة:' : 'Adyen Test Cards:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillTestCard('MADA')}
                      className="px-2 py-1 text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded border border-emerald-300 cursor-pointer transition-all"
                    >
                      {isAr ? 'مدى صالحة' : 'MADA Valid'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fillTestCard('VISA')}
                      className="px-2 py-1 text-[10px] font-bold bg-sky-100 hover:bg-sky-200 text-sky-900 rounded border border-sky-300 cursor-pointer transition-all"
                    >
                      {isAr ? 'فيزا 3DS2' : 'Visa 3DS2'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fillTestCard('DECLINED')}
                      className="px-2 py-1 text-[10px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 rounded border border-rose-300 cursor-pointer transition-all"
                    >
                      {isAr ? 'بطاقة مرفوضة' : 'Declined Card'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* APPLE PAY BANNER */}
            {paymentMethod === 'APPLE_PAY' && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-3">
                <Smartphone className="w-10 h-10 text-white mx-auto animate-pulse" />
                <h4 className="font-bold text-sm">{isAr ? 'الدفع بنقرة واحدة عبر Apple Pay' : 'One-Touch Apple Pay Checkout'}</h4>
                <p className="text-xs text-slate-300">
                  {isAr ? 'سيتم استخدام بطاقتك الافتراضية المحفوظة في محفظة Apple Pay للدفع الآمن' : 'Uses your saved default card in Apple Wallet with Touch/Face ID authentication.'}
                </p>
              </div>
            )}

            {/* BANK TRANSFER / SADAD BANNER */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-900">
                  <Building2 className="w-4 h-4 text-indigo-700" />
                  <span>{isAr ? 'نظام سداد والدفع البنكي المباشر (Adyen Direct)' : 'SADAD & Direct Bank Transfer'}</span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  {isAr 
                    ? 'سيتم توليد رمز سداد المباشر المرتبط ببنكك للتحويل الفوري وإصدار الفاتورة الإلكترونية المعتمدة.' 
                    : 'A SADAD bill code will be issued instantly to process your freight payment.'}
                </p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <Button variant="outline" type="button" onClick={onClose} className="text-xs">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl gap-2 shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isAr 
                    ? `إتمام السداد بـ (${amount.toLocaleString()} ${currency}) عبر Adyen` 
                    : `Pay (${amount.toLocaleString()} ${currency}) via Adyen`}
                </span>
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: 3D SECURE 2 CHALLENGE */}
        {step === '3DS_CHALLENGE' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 mx-auto flex items-center justify-center animate-spin">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {isAr ? 'جاري التحقق من الحماية ثلاثية الأبعاد (Adyen 3D Secure 2)...' : 'Authenticating 3D Secure 2 via Adyen...'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isAr ? 'يرجى عدم إغلاق النافذة أثناء الاتصال الآمن بالبنك المصدر لخصم المبلغ وقبول المعاملة.' : 'Please wait while we connect with your issuing bank.'}
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS & OFFICIAL RECEIPT */}
        {step === 'SUCCESS' && (
          <div className="space-y-5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-emerald-950">
                {isAr ? 'تمت عملية الدفع بنجاح عبر Adyen!' : 'Payment Authorised Successfully via Adyen!'}
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                {isAr ? 'تم اعتماد السداد وتحديث حالة العرض/الشحنة في المنظومة اللوجستية.' : 'Your invoice has been settled and status updated in AJA system.'}
              </p>
            </div>

            {/* Official Adyen Receipt Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm font-mono text-[11px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isAr ? 'رقم عملية Adyen (PSP Ref):' : 'PSP Reference:'}</span>
                <span className="font-bold text-slate-900 text-xs">{pspReference}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isAr ? 'رقم المرجع (Invoice/Quote):' : 'Merchant Ref:'}</span>
                <span className="font-bold text-[#0F4C75]">{referenceNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isAr ? 'المبلغ المسدد:' : 'Amount Paid:'}</span>
                <span className="font-bold text-emerald-700">{amount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span className="font-bold text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">{isAr ? 'تاريخ وساعة السداد:' : 'Timestamp:'}</span>
                <span className="text-slate-700">{new Date(paidAt).toLocaleString('ar-SA')}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="text-xs font-bold gap-1.5 border-slate-300 text-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة الإيصال' : 'Print Receipt'}</span>
              </Button>

              <Button
                variant="primary"
                onClick={onClose}
                className="bg-[#0F4C75] hover:bg-[#082F49] text-white font-bold text-xs px-6"
              >
                <span>{isAr ? 'تم ومتابعة الشحنات' : 'Done & Return'}</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
