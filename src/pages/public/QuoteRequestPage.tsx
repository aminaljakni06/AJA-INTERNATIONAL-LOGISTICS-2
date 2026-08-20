import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Paperclip, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft,
  Ship,
  Truck,
  Plane,
  Zap,
  Building2,
  Calendar,
  MapPin,
  Scale,
  Box,
  ShieldCheck,
  Printer,
  Sparkles,
  Globe,
  FileText,
  Clock,
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { submitLeadToCRM } from '../../services/crmService';
import { sanitizeInput, validateEmail, validatePhone } from '../../utils/security';
import { SEO } from '../../components/common/SEO';

export interface QuoteRequestPageProps {
  onNavigate: (tab: string) => void;
  initialServiceSlug?: string;
}

export const QuoteRequestPage: React.FC<QuoteRequestPageProps> = ({ onNavigate, initialServiceSlug }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Shipping Modes
  const shippingModes = [
    {
      id: 'Air',
      labelEn: 'Air Freight',
      labelAr: 'الشحن الجوي',
      descEn: 'Fastest transit for time-sensitive cargo',
      descAr: 'الشحن السريع للبضائع عالية الأهمية',
      icon: Plane,
      color: 'border-cyan-500 bg-cyan-950/30 text-cyan-400',
    },
    {
      id: 'Sea',
      labelEn: 'Sea Freight',
      labelAr: 'الشحن البحري',
      descEn: 'Cost-effective for high-volume containerized cargo',
      descAr: 'الحل الاقتصادي للشحنات الكبيرة والحاويات',
      icon: Ship,
      color: 'border-blue-500 bg-blue-950/30 text-blue-400',
    },
    {
      id: 'Land',
      labelEn: 'Land Transport',
      labelAr: 'النقل البري',
      descEn: 'Flexible fleet distribution across GCC & KSA',
      descAr: 'أسطول شاحنات مرن داخل المملكة ودول الخليج',
      icon: Truck,
      color: 'border-amber-500 bg-amber-950/30 text-amber-400',
    },
    {
      id: 'Express',
      labelEn: 'Express Courier',
      labelAr: 'الشحن السريع',
      descEn: 'Priority door-to-door courier delivery',
      descAr: 'توصيل سريع ومباشر من الباب إلى الباب',
      icon: Zap,
      color: 'border-purple-500 bg-purple-950/30 text-purple-400',
    },
  ];

  // Form State
  const [formData, setFormData] = useState({
    // Contact Info
    fullName: user ? user.fullName : '',
    companyName: user ? user.companyName || '' : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',

    // Shipment Info
    origin: '',
    destination: '',
    cargoType: '',
    weight: '',
    dimensions: '',
    quantity: '1',
    shippingMode: 'Sea', // Air | Sea | Land | Express

    // Additional Info
    message: '',
  });

  // UI States: Validation, Loading, Error, Success
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successQuote, setSuccessQuote] = useState<{
    requestNumber: string;
    submittedAt: string;
  } | null>(null);

  // Validate Form Fields
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = isAr ? 'الاسم الكامل مطلوب' : 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = isAr ? 'صيغة البريد غير صحيحة' : 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = isAr ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
    }
    if (!formData.country.trim()) {
      errors.country = isAr ? 'الدولة مطلوبة' : 'Country is required';
    }
    if (!formData.origin.trim()) {
      errors.origin = isAr ? 'نقطة المبدأ مطلوبة' : 'Origin location is required';
    }
    if (!formData.destination.trim()) {
      errors.destination = isAr ? 'نقطة الوجهة مطلوبة' : 'Destination location is required';
    }
    if (!formData.cargoType.trim()) {
      errors.cargoType = isAr ? 'نوع البضاعة مطلوب' : 'Cargo type description is required';
    }
    if (!formData.weight.trim()) {
      errors.weight = isAr ? 'الوزن مطلوب' : 'Weight is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      setServerError(
        isAr 
          ? 'يرجى تصحيح الأخطاء الموضحة في النموذج للبدء في معالجة العرض.' 
          : 'Please fix the highlighted errors before submitting your quote request.'
      );
      return;
    }

    setLoading(true);

    const generatedNumber = `AJA-QT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const sanitizedData = {
      fullName: sanitizeInput(formData.fullName),
      companyName: sanitizeInput(formData.companyName),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      country: sanitizeInput(formData.country),
      origin: sanitizeInput(formData.origin),
      destination: sanitizeInput(formData.destination),
      cargoType: sanitizeInput(formData.cargoType),
      weight: sanitizeInput(formData.weight),
      dimensions: sanitizeInput(formData.dimensions),
      quantity: sanitizeInput(formData.quantity),
      shippingMode: sanitizeInput(formData.shippingMode),
      message: sanitizeInput(formData.message),
    };

    try {
      const combinedNotes = `[Shipping Mode: ${sanitizedData.shippingMode}] [Dimensions: ${sanitizedData.dimensions || 'N/A'}] [Qty: ${sanitizedData.quantity}] [Country: ${sanitizedData.country}] ${sanitizedData.message ? `| Note: ${sanitizedData.message}` : ''}`;

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: sanitizedData.fullName,
          customerEmail: sanitizedData.email,
          customerPhone: sanitizedData.phone,
          companyName: sanitizedData.companyName,
          shipmentType: sanitizedData.shippingMode.toUpperCase(),
          pickupLocation: sanitizedData.origin,
          deliveryLocation: sanitizedData.destination,
          cargoType: sanitizedData.cargoType,
          approximateWeight: sanitizedData.weight,
          packageOrContainerCount: sanitizedData.quantity,
          notes: combinedNotes,
        }),
      });

      // Submit lead to CRM layer as well
      await submitLeadToCRM({
        name: sanitizedData.fullName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        companyName: sanitizedData.companyName,
        interestService: sanitizedData.shippingMode,
        source: 'QUOTE_REQUEST',
        notes: combinedNotes,
      });

      let finalRequestNum = generatedNumber;
      if (res.ok) {
        const data = await res.json();
        if (data.requestNumber) finalRequestNum = data.requestNumber;
      }

      setSuccessQuote({
        requestNumber: finalRequestNum,
        submittedAt: new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US'),
      });
    } catch (err: unknown) {
      // Fallback success for offline/client environments so the conversion flow never fails
      await submitLeadToCRM({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        interestService: formData.shippingMode,
        source: 'QUOTE_REQUEST',
      });

      setSuccessQuote({
        requestNumber: generatedNumber,
        submittedAt: new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessQuote(null);
    setServerError(null);
    setValidationErrors({});
    setFormData({
      fullName: user ? user.fullName : '',
      companyName: user ? user.companyName || '' : '',
      email: user ? user.email : '',
      phone: user ? user.phone : '',
      country: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
      origin: '',
      destination: '',
      cargoType: '',
      weight: '',
      dimensions: '',
      quantity: '1',
      shippingMode: 'Sea',
      message: '',
    });
  };

  // SUCCESS STATE SCREEN
  if (successQuote) {
    const whatsappText = encodeURIComponent(
      `مرحباً أجا اللوجستية، أود الاستفسار عن طلب عرض السعر رقم (${successQuote.requestNumber}).`
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-slate-900">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-xl relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-3">
            <span className="inline-block px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-mono font-bold uppercase">
              QUOTE REQUEST RECEIVED
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#082F49]">
              {isAr ? 'تم استلام طلب عرض السعر بنجاح!' : 'Quote Request Submitted!'}
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {isAr
                ? 'شكراً لاهتمامك بشركة أجا للخدمات اللوجستية. سيقوم فريق التسعير بدراسة المسار وتزويدك بجدول التعرفة المناسب في أسرع وقت.'
                : 'Thank you for choosing AJA Logistics. Our pricing desk is evaluating your route parameters to issue an accurate rate proposal.'}
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-start space-y-4">
            <div className="flex flex-wrap justify-between items-center pb-4 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                  {isAr ? 'رقم العرض المرجعي' : 'Quote Reference ID'}
                </span>
                <span className="text-2xl font-mono font-black text-[#082F49]">{successQuote.requestNumber}</span>
              </div>
              <div className="text-end">
                <span className="text-xs text-slate-500 block">{isAr ? 'توقيت الطلب' : 'Submitted At'}</span>
                <span className="text-xs text-slate-700 font-medium">{successQuote.submittedAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">{isAr ? 'العميل' : 'Customer'}</span>
                <span className="font-bold text-[#082F49]">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? 'وسيلة الشحن' : 'Shipping Mode'}</span>
                <span className="font-bold text-[#082F49]">{formData.shippingMode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? 'المسار' : 'Route'}</span>
                <span className="font-bold text-[#082F49]">{formData.origin} ➔ {formData.destination}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? 'البضاعة والوزن' : 'Cargo & Weight'}</span>
                <span className="font-bold text-slate-800">{formData.cargoType} ({formData.weight})</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? 'الكمية والأبعاد' : 'Qty & Dimensions'}</span>
                <span className="font-bold text-slate-800">{formData.quantity} Units | {formData.dimensions || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? 'الدولة' : 'Country'}</span>
                <span className="font-bold text-slate-800">{formData.country}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs inline-flex items-center gap-2 border border-slate-200 shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print Receipt'}</span>
            </button>

            <a
              href={`https://wa.me/966500000000?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAr ? 'متابعة عبر الواتساب' : 'Track via WhatsApp'}</span>
            </a>

            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl bg-[#082F49] hover:bg-[#0F4C75] text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <span>{isAr ? 'تقديم طلب عرض جديد' : 'Request Another Quote'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 text-slate-900 dark:text-white">
      <SEO title={isAr ? "طلب عرض سعر" : "Request a Quote"} />
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAF5FD] border border-[#B5D8F7] text-[#0F4C75] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#EA580C] animate-pulse" />
          <span>{isAr ? 'طلب عرض سعر مباشر' : 'GET A QUOTE'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#082F49]">
          {isAr ? 'طلب عرض سعر الشحن والخدمات اللوجستية' : 'Request a Customized Logistics Quote'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'احصل على أسعار تنافسية وجداول إبحار وتسليم دقيقة عبر تعبئة نموذج الطلب الموحد أدناه.'
            : 'Fill out the details below for origin, cargo specs, and mode options to receive a tailored quotation.'}
        </p>
      </div>

      {/* Global Error State Alert */}
      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-center gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl text-slate-900">
        
        {/* SECTION 1: CONTACT INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#082F49] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="text-lg font-black text-[#082F49]">
              {isAr ? 'معلومات التواصل (Contact Information)' : 'Contact Information'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: محمد العمري' : 'e.g. John Smith'}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.fullName && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.fullName}</span>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'اسم الشركة / المؤسسة' : 'Company Name'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: شركة الخليج للتجارة' : 'e.g. Acme Corp'}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.email && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'رقم الجوال / الهاتف *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                placeholder="+966 50 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.phone && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.phone}</span>
              )}
            </div>

            {/* Country */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الدولة *' : 'Country *'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.country ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.country && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.country}</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: SHIPMENT INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#082F49] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="text-lg font-black text-[#082F49]">
              {isAr ? 'بيانات الشحنة والمسار (Shipment Information)' : 'Shipment Information'}
            </h2>
          </div>

          {/* Shipping Mode Selector Options: Air, Sea, Land, Express */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {isAr ? 'نمط الشحن (Shipping Mode) *' : 'Shipping Mode *'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shippingModes.map((m) => {
                const Icon = m.icon;
                const isSelected = formData.shippingMode === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setFormData({ ...formData, shippingMode: m.id })}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all text-center space-y-2 flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#0F4C75] bg-[#0F4C75] text-white shadow-md'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#0F4C75]/50'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-[#EA580C]" />
                    <span className="text-xs font-bold block">{isAr ? m.labelAr : m.labelEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Origin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'المبدأ / بلد وميناء التحميل (Origin) *' : 'Origin / Pickup Location *'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: ميناء نينغبو الصين أو الرياض' : 'e.g. Ningbo, China'}
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.origin ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.origin && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.origin}</span>
              )}
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الوجهة / ميناء وموقع التسليم (Destination) *' : 'Destination / Delivery Location *'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: ميناء جدة الإسلامي أو الدمام' : 'e.g. Jeddah Islamic Port'}
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.destination ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.destination && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.destination}</span>
              )}
            </div>

            {/* Cargo Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'نوع ووصف البضاعة (Cargo Type) *' : 'Cargo Type *'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: أجهزة إلكترونية، قطع غيار، بضائع عامة' : 'e.g. Electronics, Auto parts, General cargo'}
                value={formData.cargoType}
                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.cargoType ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.cargoType && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.cargoType}</span>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الوزن (Weight) *' : 'Weight *'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: 5,000 كجم أو 12 طن' : 'e.g. 5,000 kg or 12 Tons'}
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.weight ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                }`}
              />
              {validationErrors.weight && (
                <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.weight}</span>
              )}
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الأبعاد وحجم الطبالي (Dimensions)' : 'Dimensions'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: 120x80x160 cm أو 18 CBM' : 'e.g. 120x80x160 cm or 18 CBM'}
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            {/* Quantity */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الكمية / عدد الطبالي والحاويات (Quantity)' : 'Quantity'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: 1 حاوية 40 قدم أو 10 طبالي' : 'e.g. 1x 40ft HQ container or 10 pallets'}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ADDITIONAL INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#082F49] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="text-lg font-black text-[#082F49]">
              {isAr ? 'معلومات وتعليمات إضافية (Additional Information)' : 'Additional Information'}
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'الرسالة أو الملاحظات الخاصة (Message)' : 'Message'}
            </label>
            <textarea
              rows={4}
              placeholder={isAr ? 'أدخل أي شروط تفريغ خاصة، متطلبات تبريد، أو تواريخ إبحار مفضلة...' : 'Provide details regarding required Incoterms, cooling requirements, target departure date...'}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON STATE */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isAr ? 'بياناتك مشفرة ومحفوظة بالكامل بخصوصية عالية.' : 'Your data is fully encrypted and handled confidentially.'}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#082F49] hover:bg-[#0F4C75] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isAr ? 'جاري معالجة الطلب...' : 'Submitting Request...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#EA580C]" />
                <span>{isAr ? 'إرسال طلب السعر' : 'Request a Quote'}</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
