import React, { useState } from 'react';
import { Ship, Truck, FileCheck, Warehouse, PackageCheck, CheckCircle2, ArrowLeft, ArrowRight, HelpCircle, Building2, Send } from 'lucide-react';
import { ServiceInfo } from '../../types/cms';
import { Card } from './Card';
import { Button } from './Button';
import { WorkflowStep } from './WorkflowStep';
import { CTA } from './CTA';
import { useLanguage } from '../../i18n/LanguageContext';

export interface ServiceDetailViewProps {
  id?: string;
  service: ServiceInfo;
  onNavigateToQuote?: (serviceType?: string) => void;
  className?: string;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  id,
  service,
  onNavigateToQuote,
  className = '',
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [quickQuoteSubmitted, setQuickQuoteSubmitted] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ship': return <Ship className="w-8 h-8 text-[#0F4C75]" />;
      case 'Truck': return <Truck className="w-8 h-8 text-[#0F4C75]" />;
      case 'FileCheck': return <FileCheck className="w-8 h-8 text-emerald-600" />;
      case 'Warehouse': return <Warehouse className="w-8 h-8 text-indigo-600" />;
      default: return <PackageCheck className="w-8 h-8 text-[#0F4C75]" />;
    }
  };

  const handleQuickQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail) return;
    setQuickQuoteSubmitted(true);
  };

  const title = isAr ? service.titleAr : service.titleEn;
  const description = isAr ? service.descriptionAr : service.descriptionEn;
  const benefits = isAr ? (service.benefitsAr || service.featuresAr) : (service.benefitsEn || service.featuresEn);
  const processSteps = isAr ? service.processAr : service.processEn;
  const industries = isAr ? service.industriesAr : service.industriesEn;
  const faqs = service.faq || [];

  return (
    <article id={id} className={`space-y-12 ${className}`}>
      {/* 1. Title & Header */}
      <header className="bg-[#082F49] text-white rounded-3xl p-8 sm:p-12 space-y-6 border border-[#0F4C75] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              {getIcon(service.iconName)}
            </div>
            <div>
              {/* Slug Badge */}
              {service.slug && (
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#0F4C75] text-white text-xs font-mono font-bold mb-1">
                  /{service.slug}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-black text-white">{title}</h1>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onNavigateToQuote?.(service.slug || service.serviceType || 'sea-freight')}
            className="font-bold gap-2"
          >
            <span>{isAr ? 'طلب عرض سعر مباشر' : 'Request Instant Quote'}</span>
            <ArrowIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* 2. Description */}
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl">
          {description}
        </p>
      </header>

      {/* 3. Benefits Section */}
      {benefits && benefits.length > 0 && (
        <section className="space-y-6">
          <div className="text-center sm:text-start space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{isAr ? 'فوائد ومميزات الخدمة' : 'Service Benefits & Key Features'}</h2>
            <p className="text-xs text-slate-500">{isAr ? 'ما يُميّز خدماتنا في هذا المجال' : 'Why clients choose our services'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="p-4 border-slate-200 hover:border-amber-400 transition-colors flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">{benefit}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 4. Process Workflow */}
      {processSteps && processSteps.length > 0 && (
        <section className="space-y-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{isAr ? 'مراحل وخطوات تنفيذ الخدمة' : 'Service Workflow & Process'}</h2>
            <p className="text-xs text-slate-500">{isAr ? 'خطوات عمل واضحة وموثوقة لضمان أمان شحنتك' : 'Clear structured steps for guaranteed reliability'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {processSteps.map((step) => (
              <WorkflowStep
                key={step.step}
                stepNumber={step.step}
                title={step.title}
                description={step.desc}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Industries Served */}
      {industries && industries.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{isAr ? 'القطاعات والصناعات المستهدفة' : 'Industries Served'}</h2>
          <div className="flex flex-wrap gap-2">
            {industries.map((ind, idx) => (
              <span key={idx} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 shadow-sm">
                <Building2 className="w-4 h-4 text-[#0F4C75]" />
                {ind}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQ Accordion */}
      {faqs && faqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'الأسئلة الشائعة حول هذه الخدمة' : 'Frequently Asked Questions'}</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const q = isAr ? faq.questionAr : faq.questionEn;
              const a = isAr ? faq.answerAr : faq.answerEn;
              const isOpen = openFaqIndex === idx;

              return (
                <div key={idx} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-start p-4 text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50"
                  >
                    <span>{q}</span>
                    <span className="text-lg font-mono text-slate-400">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7 & 8. CTA & Quick Quote Form */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CTA
            title={isAr ? `احصل على استشارة مجانية لخدمة ${title}` : `Get a Free Consultation for ${title}`}
            description={isAr ? 'يتواجد فريقنا الفني على مدار الساعة لتقديم الاستشارات وإصدار التكلفة المبدئية.' : 'Our logistics specialists are available 24/7 to provide estimates.'}
            onQuoteClick={() => onNavigateToQuote?.(service.slug || service.serviceType)}
          />
        </div>

        {/* Embedded Quick Quote Form */}
        <Card className="p-6 bg-slate-900 text-white border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-400">{isAr ? 'طلب سريع لهذه الخدمة' : 'Quick Quote Inquiry'}</h3>
            <p className="text-xs text-slate-300">{isAr ? 'أدخل بريدك الإلكتروني وسيصلك كتيب التسعير والخدمات فوراً.' : 'Enter your email for immediate brochure and rates.'}</p>
          </div>

          {quickQuoteSubmitted ? (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold text-center">
              {isAr ? '✓ تم تسجيل طلبك بنجاح وسيتواصل معك الأخصائي!' : '✓ Inquiry submitted successfully! An agent will contact you.'}
            </div>
          ) : (
            <form onSubmit={handleQuickQuoteSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder={isAr ? 'البريد الإلكتروني للشركة...' : 'Company email address...'}
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <Button type="submit" variant="secondary" className="w-full justify-center text-xs font-bold gap-2">
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال الطلب السريع' : 'Submit Quick Inquiry'}</span>
              </Button>
            </form>
          )}
        </Card>
      </section>
    </article>
  );
};
