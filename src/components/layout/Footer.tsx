import React, { useState } from 'react';
import { 
  Ship, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Globe,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Award,
  CheckCircle2,
  Search,
  Building2,
  FileCheck2,
  CreditCard,
  Send,
  Download
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const isAr = language === 'ar';

  const [quickTracking, setQuickTracking] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTracking.trim() && onNavigate) {
      onNavigate('tracking');
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#07131F] text-slate-300 pt-16 pb-12 border-t border-white/10 relative overflow-hidden rounded-t-[28px] mt-12">
      {/* Background Glow Overlays */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0B5FFF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Callout Card & Interactive Tracking & Newsletter Header */}
        <div className="mb-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Custom Quote & WhatsApp Callout */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-[#102A43]/80 border border-[#0EA5E9]/40 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 text-start">
              <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {isAr ? 'هل تحتاج إلى استشارة لوجستية أو عرض سعر مخصص؟' : 'Need custom freight rates or 3PL consultation?'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {isAr ? 'فريق خبراء أجا متواجد 24/7 لتقديم خيارات شحن تنافسية تضمن السرعة والأمان.' : 'Our logistics specialists structure competitive ocean, air & land routes 24/7.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onNavigate?.('quote-request')}
                className="w-full sm:w-auto px-6 py-3 bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isAr ? 'طلب عرض سعر' : 'Get Quote'}</span>
                <ArrowRight className="w-4 h-4 text-[#030712] rtl:rotate-180" />
              </button>
              <a
                href="https://wa.me/442079460000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Quick Tracking & Newsletter Signup Form */}
          <div className="lg:col-span-5 p-6 bg-[#102A43]/50 border border-white/10 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
            {/* Quick Waybill Tracking */}
            <form onSubmit={handleTrackSubmit} className="space-y-2">
              <label className="block text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
                {isAr ? 'التتبع السريع للبوليسة' : 'Quick Waybill Tracking'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isAr ? 'أدخل رقم AJA-...' : 'Waybill # AJA-...'}
                  value={quickTracking}
                  onChange={(e) => setQuickTracking(e.target.value)}
                  className="flex-1 bg-[#07131F] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F0FF]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0B5FFF] hover:bg-[#0847C7] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تتبع' : 'Track'}</span>
                </button>
              </div>
            </form>

            {/* Newsletter Subscription */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'النشرة اللوجستية وتحديثات الأسعار' : 'Subscribe to Global Logistics Updates'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder={isAr ? 'البريد الإلكتروني للشركة...' : 'Company Email Address...'}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-1 bg-[#07131F] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F0FF]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>{subscribed ? (isAr ? 'تم الاشتراك!' : 'Subscribed!') : (isAr ? 'اشتراك' : 'Subscribe')}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Main Footer Links Grid (5 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Certifications */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0B5FFF] to-[#102A43] rounded-xl flex items-center justify-center text-white p-0.5 shadow-md">
                <div className="w-full h-full bg-[#07131F] rounded-[10px] flex items-center justify-center">
                  <Ship className="w-5 h-5 text-[#00F0FF]" />
                </div>
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-none">
                  AJA INTERNATIONAL
                </span>
                <span className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest block mt-1">
                  LOGISTICS SERVICES
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'شركة أجا الدولية توفر حلول الشحن المتكاملة (البحري، الجوي، البري)، التخليص الجمركي، والتخزين الذكي عبر السعودية والشبكة العالمية.'
                : 'AJA International Logistics delivers integrated ocean, air, road freight, customs clearance, and smart warehousing across global trade lanes.'}
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#00F0FF] font-bold">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isAr ? 'مرخص ومعتمد من هيئة الزكاة والضريبة والجمارك' : 'Licensed Customs & Logistics Provider'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">ISO 9001</span>
                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">ISO 27001</span>
                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">IATA</span>
                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">FIATA</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 pt-2">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#00F0FF] text-slate-300 hover:text-[#030712] border border-white/10 flex items-center justify-center transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#00F0FF] text-slate-300 hover:text-[#030712] border border-white/10 flex items-center justify-center transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#00F0FF] text-slate-300 hover:text-[#030712] border border-white/10 flex items-center justify-center transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[#00F0FF] text-slate-300 hover:text-[#030712] border border-white/10 flex items-center justify-center transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Logistics Services */}
          <div>
            <h4 className={`text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider mb-4 ${isAr ? 'border-r-2 pr-2.5' : 'border-l-2 pl-2.5'} border-[#00F0FF]`}>
              {t.footer.servicesTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => onNavigate?.('air-freight')} className="hover:text-[#00F0FF] transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#00F0FF]/60" />{t.nav.airFreight}</button></li>
              <li><button onClick={() => onNavigate?.('sea-freight')} className="hover:text-[#00F0FF] transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#00F0FF]/60" />{t.nav.seaFreight}</button></li>
              <li><button onClick={() => onNavigate?.('land-transport')} className="hover:text-[#00F0FF] transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#00F0FF]/60" />{t.nav.landFreight}</button></li>
              <li><button onClick={() => onNavigate?.('customs')} className="hover:text-[#00F0FF] transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#00F0FF]/60" />{t.nav.customs}</button></li>
              <li><button onClick={() => onNavigate?.('warehousing')} className="hover:text-[#00F0FF] transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#00F0FF]/60" />{t.nav.warehousing}</button></li>
              <li><button onClick={() => onNavigate?.('supply-chain-visibility')} className="hover:text-[#00F0FF] transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#00F0FF]/60" />{t.nav.supplyChain}</button></li>
            </ul>
          </div>

          {/* Col 3: Solutions & Industries */}
          <div>
            <h4 className={`text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider mb-4 ${isAr ? 'border-r-2 pr-2.5' : 'border-l-2 pl-2.5'} border-[#00F0FF]`}>
              {isAr ? 'القطاعات والحلول' : 'Industries & Solutions'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => onNavigate?.('industries')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{isAr ? 'شحن الطاقة والنفط' : 'Energy & Oil Logistics'}</button></li>
              <li><button onClick={() => onNavigate?.('industries')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{isAr ? 'سلسلة التبريد الدوائية' : 'Pharma Cold Chain'}</button></li>
              <li><button onClick={() => onNavigate?.('industries')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{isAr ? 'التجارة الإلكترونية' : 'E-Commerce Fulfillment'}</button></li>
              <li><button onClick={() => onNavigate?.('industries')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{isAr ? 'قطع السيارات والمعدات' : 'Automotive & Heavy Parts'}</button></li>
              <li><button onClick={() => onNavigate?.('global-network')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{isAr ? 'الممرات البحرية العالمية' : 'Global Trade Lanes'}</button></li>
              <li><button onClick={() => onNavigate?.('quote-request')} className="text-[#00F0FF] font-bold hover:underline transition-colors cursor-pointer">{t.nav.getQuote}</button></li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation & Portals */}
          <div>
            <h4 className={`text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider mb-4 ${isAr ? 'border-r-2 pr-2.5' : 'border-l-2 pl-2.5'} border-[#00F0FF]`}>
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => onNavigate?.('about')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{t.nav.aboutUs}</button></li>
              <li><button onClick={() => onNavigate?.('tracking')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{t.nav.tracking}</button></li>
              <li><button onClick={() => onNavigate?.('customer-dashboard')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{isAr ? 'بوابة العملاء' : 'Client Portal'}</button></li>
              <li><button onClick={() => onNavigate?.('contact')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{t.nav.contact}</button></li>
              <li><button onClick={() => onNavigate?.('privacy')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{t.footer.privacyPolicy}</button></li>
              <li><button onClick={() => onNavigate?.('terms')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">{t.footer.terms}</button></li>
            </ul>
          </div>

          {/* Col 5: Global Office Locations & Contact */}
          <div>
            <h4 className={`text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider mb-4 ${isAr ? 'border-r-2 pr-2.5' : 'border-l-2 pl-2.5'} border-[#00F0FF]`}>
              {t.footer.contactTitle}
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{isAr ? 'لندن - الكناري وورف - برج كندا 1' : 'London HQ - 1 Canada Square, Canary Wharf'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                <span>{isAr ? 'الرياض - حي الملك فهد - المركز اللوجستي' : 'Riyadh Hub - King Fahd District'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span dir="ltr">+44 20 7946 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span>contact@aja-logistics.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00F0FF] shrink-0" />
                <span>{t.footer.workingHours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Compliance Badges, Language Switcher */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-start">
            <p>© {new Date().getFullYear()} AJA INTERNATIONAL LOGISTICS. {t.footer.copyright}</p>
            <span className="hidden sm:inline text-white/20">|</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{isAr ? 'دفع إلكتروني آمن: مدى • سداد • فيزا' : 'Accepted: Visa • Mada • Sadad • Wire'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => onNavigate?.('privacy')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.privacyPolicy}
            </button>
            <span>•</span>
            <button 
              onClick={() => onNavigate?.('terms')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.terms}
            </button>
            <span>•</span>
            <button 
              onClick={() => onNavigate?.('cookies')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.cookiePolicy}
            </button>

            {/* Language Switcher in Footer */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#102A43] hover:bg-[#0B5FFF] text-white border border-white/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
