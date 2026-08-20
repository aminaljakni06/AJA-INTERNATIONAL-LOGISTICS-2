import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Building2,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Receipt,
  Download,
  Sparkles,
  ChevronLeft,
  Wallet,
  Globe,
  XCircle,
  HelpCircle,
  Link2,
  Calendar,
  Calculator,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAdyenPayment } from '../../hooks/useAdyenPayment';
import { Button } from '../common/Button';
import { generatePaymentInvoicePDF } from '../../utils/pdfExport';
import { CurrencySelector } from './CurrencySelector';
import { PayByLinkManager } from './PayByLinkManager';
import { InstallmentCalculator } from './InstallmentCalculator';
import { OfflinePaymentQueueManagerUI } from './OfflinePaymentQueueManagerUI';

export interface PaymentPortalProps {
  amount: number;
  currency?: string;
  referenceNumber: string;
  entityType?: 'QUOTE' | 'SHIPMENT' | 'QUOTE_REQUEST' | 'INVOICE';
  entityId?: string;
  description?: string;
  onPaymentSuccess?: (pspReference: string, amount: number) => void;
  onPaymentFailure?: (reason: string) => void;
  onViewShipment?: () => void;
  onGoToDashboard?: () => void;
  className?: string;
  showCardOnly?: boolean;
}

export const PaymentPortal: React.FC<PaymentPortalProps> = ({
  amount,
  currency = 'SAR',
  referenceNumber,
  entityType,
  entityId,
  description,
  onPaymentSuccess,
  onPaymentFailure,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { user, token } = useAuth();

  const [portalMode, setPortalMode] = useState<'checkout' | 'pay_by_link'>('checkout');

  const {
    status: adyenStatus,
    session,
    paymentResult,
    error: adyenError,
    isLoading,
    createSession,
    processPayment,
    resetState,
  } = useAdyenPayment();

  // Multi-Currency & FX Exchange Rate State
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency || 'SAR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, { rate: number; symbol: string; nameEn: string; nameAr: string }> | null>(null);
  const [fetchingRates, setFetchingRates] = useState<boolean>(false);

  // Fetch real-time exchange rates via Adyen FX API
  useEffect(() => {
    setFetchingRates(true);
    fetch('/api/payments/adyen/rates')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch((err) => console.error('Failed to fetch Adyen exchange rates:', err))
      .finally(() => setFetchingRates(false));
  }, []);

  const currentRate = exchangeRates && selectedCurrency !== 'SAR' ? exchangeRates[selectedCurrency]?.rate || 1 : 1;
  const effectiveAmount = selectedCurrency === 'SAR' ? amount : Math.round(amount * currentRate * 100) / 100;
  const currencySymbol = exchangeRates?.[selectedCurrency]?.symbol || selectedCurrency;

  // Local Form & Portal State
  const [paymentMethod, setPaymentMethod] = useState<'MADA' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'SADAD'>('MADA');
  const [installmentPlan, setInstallmentPlan] = useState<1 | 3 | 6>(1);
  const [showInstallmentCalc, setShowInstallmentCalc] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveForRecurring, setSaveForRecurring] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const [copiedPsp, setCopiedPsp] = useState(false);
  const [adyenConfig, setAdyenConfig] = useState<{
    environment: string;
    clientKey: string;
    merchantAccount: string;
    isConfigured: boolean;
  } | null>(null);

  const dropinContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Adyen client configuration on load
  useEffect(() => {
    fetch('/api/payments/adyen/config')
      .then((res) => res.json())
      .then((data) => {
        setAdyenConfig(data);
      })
      .catch((err) => {
        console.error('Failed to load Adyen config:', err);
      });

    // Create session via hook
    createSession({
      amount: effectiveAmount,
      currency: selectedCurrency,
      reference: referenceNumber,
      description: description || `Payment for ${referenceNumber}`,
    });
  }, [amount, effectiveAmount, selectedCurrency, referenceNumber, description, createSession]);

  // Card input formatters
  const handleFormatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleFormatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Submit direct payment request
  const handleSubmitPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);

    // Basic Validation for Cards
    if (paymentMethod === 'MADA' || paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setLocalError(isAr ? 'يرجى إدخال رقم بطاقة صحيح (16 رقم)' : 'Please enter a valid 16-digit card number');
        return;
      }
      if (!expiry || expiry.length < 5) {
        setLocalError(isAr ? 'يرجى إدخال تاريخ انتهاء صلاحية صحيح (MM/YY)' : 'Please enter a valid expiration date (MM/YY)');
        return;
      }
      if (!cvv || cvv.length < 3) {
        setLocalError(isAr ? 'يرجى إدخال رمز الأمان CVC/CVV' : 'Please enter CVC/CVV security code');
        return;
      }
    }

    const typeMap = {
      MADA: 'mada' as const,
      CARD: 'scheme' as const,
      APPLE_PAY: 'applepay' as const,
      GOOGLE_PAY: 'paywithgoogle' as const,
      SADAD: 'directEbanking' as const,
    };

    const res = await processPayment({
      amount: effectiveAmount,
      currency: selectedCurrency,
      reference: referenceNumber,
      entityType: entityType === 'INVOICE' ? 'SHIPMENT' : (entityType || 'SHIPMENT'),
      entityId,
      description: description || `Payment - ${referenceNumber}`,
      paymentMethod: {
        type: typeMap[paymentMethod],
      },
      ...(installmentPlan > 1 ? { installments: { value: installmentPlan } } : {}),
      ...(paymentMethod === 'MADA' || paymentMethod === 'CARD'
        ? {
            cardDetails: {
              number: cardNumber.replace(/\s/g, ''),
              holder: cardHolder,
              expiry,
              cvv,
            },
          }
        : {}),
    });

    if (res && res.resultCode === 'Authorised') {
      // Auto-tokenize card into recurring billing profile if requested
      if (saveForRecurring && (paymentMethod === 'MADA' || paymentMethod === 'CARD') && cardNumber) {
        try {
          fetch('/api/payments/adyen/recurring/tokenize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              cardNumber,
              cardHolder,
              expiry,
              variant: paymentMethod === 'MADA' ? 'mada' : 'scheme',
              billingFrequency: 'AUTO_INVOICE',
              maxAutoChargeLimit: 50000,
              autoDebitEnabled: true,
            }),
          }).catch((e) => console.error('Error auto-saving token:', e));
        } catch (e) {
          console.error('Failed to register recurring token:', e);
        }
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(res.pspReference, amount);
      }
    } else if (res && res.resultCode === 'Refused') {
      if (onPaymentFailure) {
        onPaymentFailure(res.refusalReason || 'Payment refused');
      }
    }
  };

  const fillTestCard = (type: 'MADA' | 'VISA' | 'MASTER') => {
    if (type === 'MADA') {
      setPaymentMethod('MADA');
      handleFormatCardNumber('5888450000000000');
      setCardHolder('AJA CORPORATE TEST');
      setExpiry('12/28');
      setCvv('123');
    } else if (type === 'VISA') {
      setPaymentMethod('CARD');
      handleFormatCardNumber('4111111111111111');
      setCardHolder('AJA TEST USER');
      setExpiry('10/27');
      setCvv('456');
    } else {
      setPaymentMethod('CARD');
      handleFormatCardNumber('5500000000000004');
      setCardHolder('AJA TEST USER');
      setExpiry('08/29');
      setCvv('789');
    }
  };

  const copyPspReference = () => {
    if (paymentResult?.pspReference) {
      navigator.clipboard.writeText(paymentResult.pspReference);
      setCopiedPsp(true);
      setTimeout(() => setCopiedPsp(false), 2000);
    }
  };

  return (
    <div
      className={`bg-slate-900 border border-[#0F4C75] text-white rounded-3xl p-6 shadow-2xl space-y-6 ${className}`}
    >
      {/* Top Banner & Adyen Gateway Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#00F0FF] text-xs uppercase tracking-widest">
                Adyen Payments
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {adyenConfig?.environment || 'TEST SANDBOX'}
              </span>
            </div>
            <h3 className="text-xl font-black text-white">
              {isAr ? 'بوابة السداد الإلكتروني المعتمدة (Adyen Portal)' : 'Adyen Encrypted Payment Portal'}
            </h3>
          </div>
        </div>

        {/* Amount & Multi-Currency Switcher Badge */}
        <div className="bg-[#082F49] border border-[#00F0FF]/30 p-3.5 rounded-2xl text-right flex flex-col justify-between gap-1 min-w-[220px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#00F0FF]" />
              {isAr ? 'العملة المختارة:' : 'Settlement Currency:'}
            </span>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={(curr) => setSelectedCurrency(curr)}
              baseAmount={amount}
              compact={true}
            />
          </div>

          <div className="text-2xl font-black text-[#00F0FF] font-mono mt-1">
            {effectiveAmount.toLocaleString()} <span className="text-xs text-white">{selectedCurrency}</span>
          </div>

          {selectedCurrency !== 'SAR' && (
            <div className="text-[10px] font-mono text-emerald-300 flex items-center justify-end gap-1 pt-0.5 border-t border-white/10">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>
                1 SAR = {currentRate} {selectedCurrency} (Adyen FX)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Offline Connectivity & Payment Queue Manager */}
      <OfflinePaymentQueueManagerUI />

      {/* OFFLINE QUEUED CONFIRMATION VIEW */}
      {adyenStatus === 'offline_queued' && paymentResult ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-amber-950/40 border border-amber-500/40 p-6 rounded-2xl text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-amber-300">
              {isAr ? 'تم إدراج المعاملة في قائمة الانتظار غير المتصلة (Offline Queue)' : 'Payment Safely Queued Offline!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'نظرًا لانقطاع الاتصال بالشبكة، تم حفظ بيانات الدفع المشفرة محلياً بأمان. ستتم عملية المعالجة والمزامنة التلقائية مع بوابة Adyen فور إعادة الاتصال بالإنترنت.'
                : 'Due to offline status or network connection drop, your encrypted transaction is saved in local storage. It will auto-sync with Adyen Gateway as soon as connectivity is restored.'}
            </p>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left font-mono text-xs text-slate-300 space-y-2 max-w-md mx-auto mt-4">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">{isAr ? 'معرف المعاملة المعلقة:' : 'Queue Reference:'}</span>
                <span className="text-[#00F0FF] font-bold">{paymentResult.pspReference}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">{isAr ? 'المبلغ المحجوز:' : 'Queued Amount:'}</span>
                <span className="text-white font-bold">{paymentResult.amount.value.toLocaleString()} {paymentResult.amount.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span className="text-amber-400 font-bold uppercase">{paymentResult.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => resetState()}
                className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              >
                {isAr ? 'بدء معاملة جديدة' : 'Initiate New Transaction'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* SUCCESS STATE RECEIPT */}
      {adyenStatus === 'authorised' && paymentResult ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-emerald-300">
              {isAr ? 'تمت عملية الدفع وتأكيد السداد بنجاح!' : 'Payment Successfully Authorized!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {isAr
                ? 'تم خصم المبلغ واعتماده عبر شبكة Adyen البنكية المباشرة، وحفظ الإيصال في سجل المعاملات المالية.'
                : 'Transaction processed and verified via Adyen Checkout API. Official receipt recorded in ledger.'}
            </p>
          </div>

          {/* Official PSP Receipt Details */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#00F0FF]" />
                {isAr ? 'مرجع المعاملة (Adyen PSP Ref):' : 'PSP Reference:'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#00F0FF] font-bold">{paymentResult.pspReference}</span>
                <button
                  onClick={copyPspReference}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy PSP Ref"
                >
                  {copiedPsp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">{isAr ? 'رقم الشحنة/العرض:' : 'Merchant Ref:'}</span>
              <span className="text-white font-bold">{referenceNumber}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">{isAr ? 'تاريخ العملية:' : 'Date & Time:'}</span>
              <span className="text-slate-300">{new Date(paymentResult.timestamp).toLocaleString()}</span>
            </div>

            {paymentResult.installments && (
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">{isAr ? 'خطة التقسيط (Adyen Installments):' : 'Installment Plan:'}</span>
                <span className="text-[#00F0FF] font-bold">
                  {paymentResult.installments.value} {isAr ? 'أشهر' : 'Months'} ({paymentResult.installments.monthlyAmount.toFixed(2)} {selectedCurrency}/{isAr ? 'شهر' : 'mo'})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
              <span className="text-emerald-400 font-bold uppercase">{paymentResult.paymentMethod}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => {
                if (paymentResult) {
                  generatePaymentInvoicePDF({
                    pspReference: paymentResult.pspReference,
                    referenceNumber,
                    amount,
                    currency: selectedCurrency,
                    paymentMethod: paymentResult.paymentMethod,
                    paidAt: paymentResult.timestamp,
                    customerName: user?.fullName,
                    customerEmail: user?.email,
                    entityType,
                    description: description || `Payment for ${referenceNumber}`,
                    installments: paymentResult.installments,
                  });
                }
              }}
              className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تحميل الفاتورة الضريبية PDF' : 'Download PDF Invoice'}</span>
            </Button>

            <Button
              onClick={() => resetState()}
              variant="outline"
              className="w-full sm:w-1/2 justify-center border-slate-700 text-slate-300 hover:bg-slate-800 py-3 text-xs"
            >
              {isAr ? 'إجراء عملية سداد أخرى' : 'Make Another Payment'}
            </Button>
          </div>
        </div>
      ) : adyenStatus === '3ds_challenge' ? (
        /* 3D SECURE CHALLENGE SIMULATION */
        <div className="bg-slate-950/80 p-8 rounded-2xl border border-sky-500/30 text-center space-y-4 my-4 animate-pulse">
          <div className="w-14 h-14 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mx-auto border border-sky-400/40">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-sky-300">
              {isAr ? 'جاري الاتصال بنظام الحماية ثلاثي الأبعاد (Adyen 3D Secure 2)...' : 'Authenticating 3D Secure 2 via Adyen...'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'يرجى عدم إغلاق النافذة، يتم التشفير الآمن والتحقق من البنك المصدر.'
                : 'Verifying credentials securely with issuer bank via Adyen protocol.'}
            </p>
          </div>
        </div>
      ) : (
        /* PAYMENT FORM & METHOD SELECTOR */
        <form onSubmit={handleSubmitPayment} className="space-y-5">
          {/* Enhanced Failed Transaction & Error Handling State with Framer Motion */}
          <AnimatePresence mode="wait">
            {(adyenStatus === 'refused' || adyenStatus === 'error' || localError || adyenError) && (
              <motion.div
                key="adyen-error-banner"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  x: [0, -5, 5, -3, 3, 0],
                }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                  x: { duration: 0.4, ease: 'easeInOut' },
                }}
                className="bg-rose-950/40 border border-rose-500/40 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: [0.8, 1.15, 1], rotate: [-10, 5, 0] }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0"
                  >
                    <XCircle className="w-6 h-6" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-rose-200">
                        {isAr ? 'فشلت عملية السداد / تم رفض البطاقة' : 'Payment Failed / Declined by Bank'}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                        {paymentResult?.resultCode || 'REFUSED'}
                      </span>
                    </div>
                    <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                      {localError ||
                        adyenError ||
                        paymentResult?.refusalReason ||
                        (isAr
                          ? 'تعذر إتمام العملية. يرجى التحقق من بيانات البطاقة، الرصيد المتاح، أو رمز الأمان CVV.'
                          : 'Unable to authorize charge. Please verify card details, available limit, or CVC code.')}
                    </p>
                    {paymentResult?.pspReference && (
                      <div className="text-[10px] font-mono text-rose-400/80 mt-1">
                        Adyen Ref: {paymentResult.pspReference}
                      </div>
                    )}
                  </div>
                </div>

                {/* Retry & Recovery Action Row */}
                <div className="pt-2 border-t border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {isAr
                        ? 'البيانات المُدخلة محفوظة تلقائياً، يمكنك إعادة المحاولة فوراً:'
                        : 'Entered details preserved. You can retry immediately:'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.button
                      type="button"
                      onClick={() => handleSubmitPayment()}
                      disabled={isLoading}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      animate={
                        isLoading
                          ? {}
                          : {
                              scale: [1, 1.03, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(244, 63, 94, 0.4)',
                                '0 0 0 10px rgba(244, 63, 94, 0)',
                                '0 0 0 0 rgba(244, 63, 94, 0)',
                              ],
                            }
                      }
                      transition={
                        isLoading
                          ? {}
                          : {
                              scale: {
                                repeat: Infinity,
                                duration: 2,
                                ease: 'easeInOut',
                              },
                              boxShadow: {
                                repeat: Infinity,
                                duration: 2,
                                ease: 'easeInOut',
                              },
                            }
                      }
                      className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>{isAr ? 'إعادة المحاولة الآن' : 'Retry Payment'}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portal Mode Tabs: Direct Checkout vs Adyen Pay by Link */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPortalMode('checkout')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                portalMode === 'checkout'
                  ? 'bg-gradient-to-r from-sky-900 to-slate-900 text-[#00F0FF] border border-[#00F0FF]/40 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'الدفع الإلكتروني المباشر (Adyen Checkout)' : 'Direct Online Checkout'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalMode('pay_by_link')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                portalMode === 'pay_by_link'
                  ? 'bg-gradient-to-r from-sky-900 to-slate-900 text-[#00F0FF] border border-[#00F0FF]/40 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4 text-[#00F0FF]" />
              <span>{isAr ? 'إنشاء ومشاركة رابط الدفع (Pay by Link)' : 'Adyen Pay by Link'}</span>
            </button>
          </div>

          {portalMode === 'pay_by_link' ? (
            <PayByLinkManager
              initialAmount={amount}
              initialCurrency={selectedCurrency}
              initialReference={referenceNumber}
            />
          ) : (
            <>
              {/* Real-time Currency Selector & FX Conversion Engine */}
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={(curr) => {
                  setSelectedCurrency(curr);
                }}
                baseAmount={amount}
                showBreakdown={true}
              />

              {/* Adyen Enterprise Installment Option */}
              <div className="space-y-3 bg-slate-950/90 p-4 rounded-2xl border border-sky-500/30 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-[#00F0FF] flex items-center justify-center border border-sky-500/30">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-white block">
                        {isAr ? 'تقسيط فواتير اللوجستية (Adyen Installments)' : 'Enterprise Invoice Installments'}
                      </label>
                      <span className="text-[10px] text-slate-400 block">
                        {isAr ? 'تقسيط 3 أو 6 أشهر بدون فوائد تمويلية لحسابات الشركات' : 'Split invoice into 3 or 6 monthly payments at 0% interest'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInstallmentCalc(!showInstallmentCalc)}
                      className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-[#00F0FF] border border-sky-500/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{showInstallmentCalc ? (isAr ? 'إخفاء الحاسبة' : 'Hide Calculator') : (isAr ? 'حاسبة الأقساط' : 'Installment Calculator')}</span>
                    </button>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hidden sm:inline-block">
                      {isAr ? '0% فائدة إضافية' : '0% Interest Fee'}
                    </span>
                  </div>
                </div>

                {showInstallmentCalc ? (
                  <InstallmentCalculator
                    amount={effectiveAmount}
                    currency={selectedCurrency}
                    selectedPlanMonths={installmentPlan}
                    onSelectPlan={(months) => {
                      setInstallmentPlan(months);
                      setShowInstallmentCalc(false);
                    }}
                    showCustomAmountInput={true}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {/* 1 Payment (Full) */}
                      <button
                        type="button"
                        onClick={() => setInstallmentPlan(1)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          installmentPlan === 1
                            ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] ring-1 ring-[#00F0FF] shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-extrabold block">{isAr ? 'دفعة واحدة (كامل)' : 'Full Payment'}</span>
                        <span className="text-[10px] font-mono opacity-80">
                          {effectiveAmount.toLocaleString()} {selectedCurrency}
                        </span>
                      </button>

                      {/* 3 Monthly Installments */}
                      <button
                        type="button"
                        onClick={() => setInstallmentPlan(3)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          installmentPlan === 3
                            ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] ring-1 ring-[#00F0FF] shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-extrabold block">{isAr ? 'تقسيط 3 أشهر' : '3 Installments'}</span>
                        <span className="text-[10px] font-mono opacity-80">
                          {(effectiveAmount / 3).toFixed(2)} {selectedCurrency} / {isAr ? 'شهر' : 'mo'}
                        </span>
                      </button>

                      {/* 6 Monthly Installments */}
                      <button
                        type="button"
                        onClick={() => setInstallmentPlan(6)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          installmentPlan === 6
                            ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] ring-1 ring-[#00F0FF] shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-extrabold block">{isAr ? 'تقسيط 6 أشهر' : '6 Installments'}</span>
                        <span className="text-[10px] font-mono opacity-80">
                          {(effectiveAmount / 6).toFixed(2)} {selectedCurrency} / {isAr ? 'شهر' : 'mo'}
                        </span>
                      </button>
                    </div>

                    {/* Installment Breakdown Schedule Preview Card */}
                    {installmentPlan > 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-slate-900/90 border border-sky-500/20 p-3.5 rounded-xl space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between text-[11px] text-sky-300 font-bold border-b border-white/10 pb-1.5">
                          <span>{isAr ? `جدول دفع الأقساط الشهري (${installmentPlan} دفعات)` : `Installment Schedule (${installmentPlan} Months)`}</span>
                          <span>{isAr ? 'الإجمالي:' : 'Total:'} {effectiveAmount.toLocaleString()} {selectedCurrency}</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {Array.from({ length: installmentPlan }).map((_, idx) => {
                            const dueDate = new Date();
                            dueDate.setMonth(dueDate.getMonth() + idx);
                            const monthlyValue = (effectiveAmount / installmentPlan).toFixed(2);
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] ${
                                  idx === 0
                                    ? 'bg-sky-500/10 border border-sky-400/30 text-sky-200 font-bold'
                                    : 'bg-slate-950/60 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    idx === 0 ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span>
                                    {idx === 0
                                      ? isAr ? 'الدفعة الأولى (تُخصم الآن)' : '1st Payment (Charged Today)'
                                      : isAr ? `الدفعة رقم ${idx + 1} (${dueDate.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })})` : `Payment #${idx + 1} (${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                                  </span>
                                </div>
                                <span className="font-extrabold">{monthlyValue} {selectedCurrency}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>


          {/* Payment Method Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {isAr ? 'اختر طريقة الدفع عبر Adyen:' : 'Select Payment Method:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* MADA */}
              <button
                type="button"
                onClick={() => setPaymentMethod('MADA')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'MADA'
                    ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] shadow-lg ring-1 ring-[#00F0FF]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold block">{isAr ? 'بطاقة مدى' : 'MADA Card'}</span>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] shadow-lg ring-1 ring-[#00F0FF]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-bold block">Visa / MC</span>
              </button>

              {/* Apple Pay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('APPLE_PAY')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'APPLE_PAY'
                    ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] shadow-lg ring-1 ring-[#00F0FF]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-white" />
                <span className="text-xs font-bold block">Apple Pay</span>
              </button>

              {/* Google Pay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('GOOGLE_PAY')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'GOOGLE_PAY'
                    ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] shadow-lg ring-1 ring-[#00F0FF]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Wallet className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold block">Google Pay</span>
              </button>

              {/* SADAD / Direct Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('SADAD')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'SADAD'
                    ? 'bg-[#082F49] border-[#00F0FF] text-[#00F0FF] shadow-lg ring-1 ring-[#00F0FF]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold block">{isAr ? 'سداد' : 'SADAD'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Card Inputs */}
          {(paymentMethod === 'MADA' || paymentMethod === 'CARD') && (
            <div className="space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  {isAr ? 'رقم البطاقة (Card Number):' : 'Card Number:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleFormatCardNumber(e.target.value)}
                    placeholder="5888 4500 0000 0000"
                    maxLength={19}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                  />
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? 'اسم حامل البطاقة:' : 'Cardholder Name:'}
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="AJA LOGISTICS"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      {isAr ? 'الانتهاء:' : 'Expiry:'}
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => handleFormatExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-2.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white text-center focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">CVV:</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-2.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white text-center focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                    />
                  </div>
                </div>

                {/* Save to Enterprise Recurring Vault Checkbox */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveForRecurring"
                    checked={saveForRecurring}
                    onChange={(e) => setSaveForRecurring(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-[#00F0FF] focus:ring-[#00F0FF] cursor-pointer"
                  />
                  <label htmlFor="saveForRecurring" className="text-[11px] text-slate-300 cursor-pointer select-none">
                    {isAr
                      ? 'حفظ هذه البطاقة مشفرة لدى Adyen Vault لخصم الفواتير اللوجستية الشهرية آلياً'
                      : 'Save tokenized card to Adyen Vault for automatic monthly logistics billing'}
                  </label>
                </div>
              </div>

              {/* Quick Fill Test Cards */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold">{isAr ? 'بطاقات اختبار Adyen:' : 'Test Preset:'}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fillTestCard('MADA')}
                    className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono hover:bg-emerald-500/30 transition-colors"
                  >
                    MADA
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard('VISA')}
                    className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded font-mono hover:bg-sky-500/30 transition-colors"
                  >
                    VISA
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard('MASTER')}
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono hover:bg-amber-500/30 transition-colors"
                  >
                    MasterCard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* APPLE PAY EXPRESS CONTAINER */}
          {paymentMethod === 'APPLE_PAY' && (
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-white/10 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                    
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-sm block">Apple Pay via Adyen</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Safari / Touch ID / Face ID Express Ready</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                  {isAr ? 'مُفعّل آلياً' : 'Active Express'}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {isAr
                  ? 'قم بإجراء السداد بنقرة واحدة مستخدماً بطاقاتك المسجلة في محفظة Apple Wallet المشفرة بواسطة ممر Adyen.'
                  : 'Pay in one tap using cards saved in your encrypted Apple Wallet securely relayed through Adyen Checkout API.'}
              </p>

              <button
                type="button"
                onClick={() => handleSubmitPayment()}
                disabled={isLoading}
                className="w-full py-4 bg-black text-white hover:bg-slate-900 border border-white/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <span className="text-lg"></span>
                <span>
                  {isLoading
                    ? (isAr ? 'جاري توثيق Face ID / Touch ID...' : 'Authenticating Apple Pay...')
                    : (isAr ? `دفع سريع بـ Apple Pay (${amount.toLocaleString()} ${currency})` : `Pay with Apple Pay (${amount.toLocaleString()} ${currency})`)}
                </span>
              </button>
            </div>
          )}

          {/* GOOGLE PAY EXPRESS CONTAINER */}
          {paymentMethod === 'GOOGLE_PAY' && (
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black">
                    G
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-sm block">Google Pay via Adyen</span>
                    <span className="text-[10px] text-amber-400 font-mono">Chrome / Android Passkey / GPay Ready</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold">
                  {isAr ? 'مُفعّل آلياً' : 'Active Express'}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {isAr
                  ? 'إتمام السداد بلمسة واحدة باستخدام بطاقاتك المسجلة في Google Account والمحمية بتشفير Adyen PayWithGoogle.'
                  : 'Fast, secure 1-click payment using cards saved to your Google Account backed by Adyen PayWithGoogle encryption.'}
              </p>

              <button
                type="button"
                onClick={() => handleSubmitPayment()}
                disabled={isLoading}
                className="w-full py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Wallet className="w-5 h-5 text-amber-500" />
                <span>
                  {isLoading
                    ? (isAr ? 'جاري توثيق Google Pay...' : 'Authenticating Google Pay...')
                    : (isAr ? `دفع سريع بـ Google Pay (${amount.toLocaleString()} ${currency})` : `Pay with Google Pay (${amount.toLocaleString()} ${currency})`)}
                </span>
              </button>
            </div>
          )}

          {/* SADAD / Direct Bank Info */}
          {paymentMethod === 'SADAD' && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Building2 className="w-4 h-4" />
                <span>{isAr ? 'نظام سداد المباشر (SADAD Olp / Direct Bank)' : 'SADAD Direct Bank Integration'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {isAr
                  ? 'عند النزول والدفع، سيتولى ممر Adyen التمرير المباشر للحساب البنكي لإصدار الفاتورة وتأكيد السداد الآلي فورياً.'
                  : 'Adyen gateway will connect directly to your Saudi Bank SADAD service to authorize instant payment settlement.'}
              </p>
            </div>
          )}

          {/* Container for drop-in if rendered */}
          <div ref={dropinContainerRef} id="adyen-dropin-container" className="my-2" />

          {/* Submit Action Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#0F4C75] via-[#3282B8] to-[#00F0FF] text-slate-950 font-black text-sm rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isAr ? 'جاري الاتصال بـ Adyen Security...' : 'Connecting to Adyen Security...'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-950" />
                <span>
                  {installmentPlan > 1
                    ? isAr
                      ? `سداد القسط الأول (1 من ${installmentPlan}) - ${(effectiveAmount / installmentPlan).toFixed(2)} ${selectedCurrency}`
                      : `Pay 1st Installment (1 of ${installmentPlan}) - ${(effectiveAmount / installmentPlan).toFixed(2)} ${selectedCurrency}`
                    : isAr
                      ? `إتمام السداد بـ (${effectiveAmount.toLocaleString()} ${selectedCurrency}) عبر Adyen`
                      : `Pay (${effectiveAmount.toLocaleString()} ${selectedCurrency}) via Adyen`}
                </span>
              </>
            )}
          </Button>

          {/* Footer Security Badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              PCI-DSS Level 1 & 256-Bit SSL Encrypted
            </span>
            <span className="font-mono text-slate-300">Powered by Adyen Checkout API</span>
          </div>
        </>
      )}
    </form>
      )}
    </div>
  );
};
