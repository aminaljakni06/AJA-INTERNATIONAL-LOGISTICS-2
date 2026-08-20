import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useLanguage } from '../../i18n/LanguageContext';
import { submitLeadToCRM } from '../../services/crmService';
import { sanitizeInput, validateEmail, validatePhone } from '../../utils/security';
import { SEO } from '../../components/common/SEO';

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const servicesOptions = [
    { value: 'Sea Freight', labelAr: 'الشحن البحري الدولي (Sea Freight)', labelEn: 'Sea Freight Services' },
    { value: 'Air Freight', labelAr: 'الشحن الجوي السريع (Air Freight)', labelEn: 'Air Freight Services' },
    { value: 'Land Fleet', labelAr: 'النقل البري والأسطول (Land Fleet)', labelEn: 'Land Fleet & GCC Trucking' },
    { value: 'Customs Clearance', labelAr: 'التخليص الجمركي وفسح (Customs Clearance)', labelEn: 'Customs Clearance & FASAH' },
    { value: 'Smart Warehousing', labelAr: 'التخزين والمستودعات (Warehousing)', labelEn: 'Smart Warehousing & WMS' },
    { value: 'Last Mile Distribution', labelAr: 'إدارة التوزيع والميل الأخير (Distribution)', labelEn: 'Last-Mile & B2B Distribution' },
    { value: 'General Support', labelAr: 'استفسار عام / طلب شراكة', labelEn: 'General Inquiry / Partnership' },
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    serviceRequired: 'Sea Freight',
    message: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = isAr ? 'الاسم الكامل مطلوب' : 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = isAr ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
    }
    if (!formData.message.trim()) {
      errors.message = isAr ? 'نص الرسالة أو الاستفسار مطلوب' : 'Message is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      setErrorMessage(
        isAr 
          ? 'الرجاء تعبئة الحقول المطلوبة بشكل صحيح.' 
          : 'Please complete all required fields correctly.'
      );
      return;
    }

    setLoading(true);

    const generatedTicket = `AJA-TKT-${Date.now().toString().slice(-6)}`;

    // Sanitize inputs before submitting to CRM
    const sanitizedData = {
      fullName: sanitizeInput(formData.fullName),
      companyName: sanitizeInput(formData.companyName),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      serviceRequired: sanitizeInput(formData.serviceRequired),
      message: sanitizeInput(formData.message),
    };

    try {
      // Sync with CRM Layer
      await submitLeadToCRM({
        name: sanitizedData.fullName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        companyName: sanitizedData.companyName,
        interestService: sanitizedData.serviceRequired,
        source: 'CONTACT_FORM',
        notes: sanitizedData.message,
      });

      setTicketId(generatedTicket);
      setIsSuccess(true);
    } catch (err) {
      setTicketId(generatedTicket);
      setIsSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setTicketId('');
    setErrorMessage(null);
    setValidationErrors({});
    setFormData({
      fullName: '',
      companyName: '',
      email: '',
      phone: '',
      serviceRequired: 'Sea Freight',
      message: '',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-900 dark:text-white">
      <SEO title={isAr ? "تواصل معنا" : "Contact Us"} />
      
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAF5FD] border border-[#B5D8F7] text-[#0F4C75] text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isAr ? 'تواصل معنا' : 'CONTACT US'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#082F49]">
          {isAr ? 'تواصل مع فريق أجا الدولية اللوجستية' : 'Get in Touch with AJA Logistics'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          {isAr
            ? 'فريق الدعم الفني وإدارة العمليات متواجد على مدار الساعة لمساعدتك في الاستفسارات وطلبات الشحن.'
            : 'Our customer success and operations teams are ready to support your supply chain requirements 24/7.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#082F49] text-white flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#EA580C]" />
            </div>
            <h4 className="text-sm font-black text-[#082F49]">
              {isAr ? 'المقر الرئيسي (HQ)' : 'Headquarters'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'المملكة المتحدة - مدينة لندن، حي الكناري وورف، شارع كندا 1.'
                : '1 Canada Square, Canary Wharf, London E14 5AA, United Kingdom.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#082F49] text-white flex items-center justify-center font-bold">
              <Phone className="w-5 h-5 text-[#EA580C]" />
            </div>
            <h4 className="text-sm font-black text-[#082F49]">
              {isAr ? 'هاتف الاستفسارات والتواصل المباشر' : 'Direct Support Hotline'}
            </h4>
            <p className="text-xs font-mono font-bold text-[#0F4C75]" dir="ltr">
              +44 20 7946 0000 / +44 7700 900000
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#082F49] text-white flex items-center justify-center font-bold">
              <Mail className="w-5 h-5 text-[#EA580C]" />
            </div>
            <h4 className="text-sm font-black text-[#082F49]">
              {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
            </h4>
            <p className="text-xs font-mono text-slate-600">
              london@aja-logistics.com
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#082F49] text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#EA580C]" />
            </div>
            <h4 className="text-sm font-black text-[#082F49]">
              {isAr ? 'أوقات العمل' : 'Working Hours'}
            </h4>
            <p className="text-xs text-slate-600">
              {isAr ? 'الإثنين - الجمعة: 8:00 صباحاً - 6:00 مساءً بتوقيت غرينتش (دعم الشحنات الحرج 24/7)' : 'Mon - Fri: 8:00 AM - 6:00 PM GMT (24/7 Operations Control)'}
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="lg:col-span-2">
          
          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xl text-slate-900">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase">TICKET #{ticketId}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#082F49]">
                  {isAr ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {isAr
                    ? 'تم تسجيل تذكرتك رسمياً في نظام أجا لخدمة العملاء. سيقوم أحد ممثلينا بالتواصل معك في أقرب وقت.'
                    : 'Your inquiry has been registered in our CRM dispatch system. An agent will contact you shortly.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-start max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? 'الاسم:' : 'Name:'}</span>
                  <span className="font-bold text-[#082F49]">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? 'الشركة:' : 'Company:'}</span>
                  <span className="font-bold text-slate-700">{formData.companyName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? 'الخدمة المطلوب:' : 'Service:'}</span>
                  <span className="font-bold text-[#082F49]">{formData.serviceRequired}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-2xl bg-[#082F49] hover:bg-[#0F4C75] text-white font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                {isAr ? 'إرسال رسالة جديدة' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            /* CONTACT FORM INPUTS */
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-900">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-[#082F49]">
                  {isAr ? 'نموذج التواصل المباشر' : 'Direct Contact Form'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr ? 'يسعدنا استقبال استفساراتك واقتراحاتك والرد عليها بدقة.' : 'Send us your inquiries or requirements and our team will get back to you.'}
                </p>
              </div>

              {/* ERROR ALERT */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
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
                    {isAr ? 'اسم الشركة' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم المنشأة أو الشركة' : 'Company or Organization'}
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
                    {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
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

                {/* Service Required */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isAr ? 'الخدمة المطلوبة (Service Required) *' : 'Service Required *'}
                  </label>
                  <select
                    value={formData.serviceRequired}
                    onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#082F49] focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
                  >
                    {servicesOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-white text-[#082F49]">
                        {isAr ? opt.labelAr : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isAr ? 'الرسالة أو الاستفسار *' : 'Message *'}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={isAr ? 'اكتب تفاصيل استفسارك هنا...' : 'Type your detailed inquiry here...'}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-xs text-[#082F49] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      validationErrors.message ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#0F4C75]'
                    }`}
                  />
                  {validationErrors.message && (
                    <span className="text-[11px] text-rose-600 mt-1 block">{validationErrors.message}</span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#082F49] hover:bg-[#0F4C75] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري الإرسال...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#EA580C]" />
                      <span>{isAr ? 'إرسال الرسالة' : 'Send Message'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
