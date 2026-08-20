import React, { useState } from 'react';
import { 
  Plane, 
  Ship, 
  Truck, 
  Warehouse, 
  FileCheck, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Send,
  ChevronRight,
  ChevronLeft,
  FileText,
  TrendingUp
} from 'lucide-react';
import { ServiceData } from '../../data/services';
import { useLanguage } from '../../i18n/LanguageContext';

interface ServiceDetailPageProps {
  service: ServiceData;
  onBack: () => void;
  onNavigateToQuote: (serviceSlug?: string) => void;
  className?: string;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  onBack,
  onNavigateToQuote,
  className = ''
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Form State for Quick Quote Request Section
  const [quoteForm, setQuoteForm] = useState({
    companyName: '',
    contactEmail: '',
    phone: '',
    origin: '',
    destination: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const title = isAr ? (service.arabicTitle || service.title) : service.title;
  const description = isAr ? (service.arabicDescription || service.description) : service.description;
  const overview = isAr ? (service.arabicOverview || service.overview || description) : (service.overview || description);
  const badge = isAr ? (service.arabicBadge || service.badge) : service.badge;
  const benefits = isAr ? (service.arabicBenefits || service.benefits) : service.benefits;
  const processSteps = isAr ? (service.arabicProcess || service.process) : service.process;
  const industries = isAr ? (service.arabicIndustries || service.industries) : service.industries;
  const stats = service.stats || [];

  const renderIcon = (iconName: string) => {
    const cls = "w-10 h-10 text-[#38BDF8]";
    switch (iconName) {
      case 'Plane': return <Plane className={cls} />;
      case 'Ship': return <Ship className={cls} />;
      case 'Truck': return <Truck className={cls} />;
      case 'Warehouse': return <Warehouse className={cls} />;
      case 'FileCheck': return <FileCheck className={cls} />;
      case 'Activity':
      default: return <Activity className={cls} />;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.contactEmail) return;
    setFormSubmitted(true);
  };

  return (
    <article className={`space-y-16 py-6 ${className}`}>
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[#0F4C75] pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#082F49] hover:bg-[#0F4C75] border border-[#0F4C75] text-slate-200 text-xs font-bold transition-all duration-300 hover:-translate-x-1 hover:rtl:translate-x-1"
        >
          <ArrowIcon className="w-4 h-4 rotate-180 rtl:rotate-0" />
          <span>{isAr ? 'العودة لقائمة الخدمات' : 'Back to All Services'}</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-300 tracking-widest uppercase">
          AJA Logistics / {service.slug}
        </span>
      </div>

      {/* SECTION 1: HERO */}
      <section className="relative rounded-3xl bg-[#082F49] border border-[#0F4C75] p-8 md:p-14 overflow-hidden shadow-2xl space-y-8">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            {badge && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#0F4C75] text-white border border-[#0F4C75]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed font-normal">
              {description}
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => onNavigateToQuote(service.slug)}
              className="px-8 py-4 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 border border-[#0F4C75]"
            >
              <span>{isAr ? 'طلب تسعيرة لهذه الخدمة' : 'Request Instant Service Quote'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            <a
              href="#quote-form-section"
              className="px-8 py-4 rounded-xl bg-[#082F49] hover:bg-[#0F4C75] border border-[#0F4C75] text-white font-bold text-sm text-center transition-all duration-300"
            >
              {isAr ? 'تواصل مع أخصائي الخدمة' : 'Contact Freight Specialist'}
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: OVERVIEW */}
      <section className="space-y-8 bg-[#082F49] border border-[#0F4C75] rounded-3xl p-8 md:p-12">
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
            {isAr ? 'نظرة عامة شمولية' : 'Comprehensive Service Overview'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {isAr ? 'تفاصيل ومعايير التشغيل اللوجستي' : 'Operational Specifications & Infrastructure'}
          </h2>
        </div>

        <p className="text-slate-300 text-base md:text-lg leading-relaxed">
          {overview}
        </p>

        {/* Operational Stats Cards */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#0F4C75]">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-[#082F49] border border-[#0F4C75] rounded-2xl p-5 space-y-1">
                <span className="text-2xl md:text-3xl font-black text-[#0F4C75] dark:text-white">{stat.value}</span>
                <p className="text-xs font-bold text-slate-300">
                  {isAr ? stat.arabicLabel : stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: BENEFITS */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
            {isAr ? 'القيمة المضافة' : 'Key Advantages'}
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white">
            {isAr ? 'فوائد ومميزات الخدمة لشركتك' : 'Business Benefits & Key Advantages'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-[#082F49] hover:bg-[#0F4C75] border border-[#0F4C75] hover:border-[#0F4C75] rounded-2xl p-6 flex items-start gap-4 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F4C75] border border-[#0F4C75] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm md:text-base font-bold text-white leading-snug">
                  {benefit}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: PROCESS */}
      {processSteps && processSteps.length > 0 && (
        <section className="space-y-8 bg-[#082F49] border border-[#0F4C75] rounded-3xl p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
              {isAr ? 'مراحل التنفيذ' : 'Execution Steps'}
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              {isAr ? 'خطوات ومراحل تقديم الخدمة' : 'Structured Service Workflow'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="bg-[#082F49] border border-[#0F4C75] hover:border-[#0F4C75] rounded-2xl p-6 space-y-4 relative group transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#0F4C75] text-white border border-[#0F4C75] flex items-center justify-center font-black text-base">
                    0{step.step}
                  </span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: INDUSTRIES */}
      {industries && industries.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
              {isAr ? 'القطاعات المستهدفة' : 'Target Sectors'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {isAr ? 'القطاعات والصناعات التي نخدمها' : 'Industries Served'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((industry, idx) => (
              <div
                key={idx}
                className="bg-[#082F49] border border-[#0F4C75] rounded-xl p-4 flex items-center gap-3 text-slate-200 text-xs font-bold shadow-sm"
              >
                <Building2 className="w-4 h-4 text-[#0F4C75] dark:text-sky-400 shrink-0" />
                <span>{industry}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: CTA */}
      <section className="relative rounded-3xl bg-[#082F49] border border-[#0F4C75] p-8 md:p-12 overflow-hidden shadow-2xl text-white space-y-6">
        <div className="max-w-2xl space-y-3 relative z-10">
          <h3 className="text-2xl md:text-4xl font-black">
            {service.cta
              ? (isAr ? service.cta.titleAr : service.cta.titleEn)
              : (isAr ? `احصل على استشارة مجانية لخدمة ${title}` : `Request Free Consultation for ${title}`)}
          </h3>
          <p className="text-sm md:text-base text-slate-100">
            {service.cta
              ? (isAr ? service.cta.descAr : service.cta.descEn)
              : (isAr ? 'يتواجد فريقنا اللوجستي على مدار الساعة لتصميم خطط الشحن والأسعار المناسبة.' : 'Our logistics managers are online 24/7 to provide rate estimates and routing advice.')}
          </p>
        </div>

        <div className="relative z-10 pt-2">
          <button
            onClick={() => onNavigateToQuote(service.slug)}
            className="px-8 py-4 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-black text-sm inline-flex items-center gap-2 shadow-lg transition-all hover:scale-105 border border-[#0F4C75]"
          >
            <span>
              {service.cta
                ? (isAr ? service.cta.buttonTextAr : service.cta.buttonTextEn)
                : (isAr ? 'احجز موعد استشارة' : 'Book Freight Consultation')}
            </span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SECTION 7: QUOTE REQUEST FORM */}
      <section id="quote-form-section" className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-8 md:p-12 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
            {isAr ? 'طلب تسعيرة مباشر' : 'Direct Service Quote Form'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {isAr ? `طلب عرض سعر سريع - ${title}` : `Request Instant Rate Quote for ${title}`}
          </h2>
          <p className="text-xs md:text-sm text-slate-300">
            {isAr
              ? 'أدخل تفاصيل شحنتك وسيتم إرسال العرض المالي الفوري لبريدك الإلكتروني خلال دقائق.'
              : 'Provide your cargo details and our system will route an automated proposal to your email address.'}
          </p>
        </div>

        {formSubmitted ? (
          <div className="p-8 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">
              {isAr ? 'تم استلام طلب التسعيرة بنجاح!' : 'Quote Inquiry Received Successfully!'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {isAr
                ? `شكراً لتواصلك مع أجا للخدمات اللوجستية. قام نظامنا بتوجيه طلبك المتعلق بـ (${title}) لمهندس الحسابات المختص.`
                : `Thank you for contacting AJA Logistics. Our freight management team for (${title}) will contact you shortly.`}
            </p>
            <button
              onClick={() => setFormSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              {isAr ? 'إرسال طلب آخر' : 'Submit Another Request'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {isAr ? 'اسم الشركة / المنشأة' : 'Company Name'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'شركة أجا التجارية...' : 'e.g. AJA Trading Co.'}
                value={quoteForm.companyName}
                onChange={(e) => setQuoteForm({ ...quoteForm, companyName: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {isAr ? 'البريد الإلكتروني' : 'Contact Email'}
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={quoteForm.contactEmail}
                onChange={(e) => setQuoteForm({ ...quoteForm, contactEmail: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {isAr ? 'بلد / مدينة الاستلام (Origin)' : 'Origin Location'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: ميناء شنغهاي، الصين' : 'e.g. Shanghai Port, China'}
                value={quoteForm.origin}
                onChange={(e) => setQuoteForm({ ...quoteForm, origin: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {isAr ? 'بلد / مدينة التسليم (Destination)' : 'Destination Location'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: مستودعات الرياض، السعودية' : 'e.g. Riyadh Depot, Saudi Arabia'}
                value={quoteForm.destination}
                onChange={(e) => setQuoteForm({ ...quoteForm, destination: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {isAr ? 'تفاصيل ومواصفات الشحنة (اختياري)' : 'Cargo Details & Notes (Optional)'}
              </label>
              <textarea
                rows={3}
                placeholder={isAr ? 'اذكر وزن الشحنة، نوع البضاعة، أو تاريخ الشحن المطلوب...' : 'Describe cargo weight, container type, or preferred timeline...'}
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C75]"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 border border-[#0F4C75]"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'إرسال طلب التسعيرة الجاهز' : 'Submit Direct Quote Request'}</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </article>
  );
};
