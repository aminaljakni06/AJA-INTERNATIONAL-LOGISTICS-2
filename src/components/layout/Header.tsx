import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Globe, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  ChevronDown, 
  Plane, 
  Truck, 
  ShieldCheck, 
  Boxes, 
  Layers, 
  Search,
  PhoneCall,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
  Headphones,
  Building2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../design-system/primitives/Button';
import { AnnouncementBar } from './AnnouncementBar';
import { MegaMenu } from './MegaMenu';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationsMenu } from './NotificationsMenu';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'home', setActiveTab }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const isAr = language === 'ar';

  return (
    <>
      {/* Search Modal (CTRL + K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavClick}
      />

      {/* Sticky Top Header Wrapper */}
      <header className="sticky top-0 left-0 right-0 z-[1200] transition-all duration-300">
        
        {/* Optional Announcement Bar */}
        <AnnouncementBar onNavigate={handleNavClick} />

        {/* Top Utility Bar */}
        <div className="hidden lg:block bg-[#07131F] text-slate-300 text-xs border-b border-white/10 py-2">
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a
                href="tel:+442079460000"
                className="flex items-center gap-1.5 text-slate-300 hover:text-[#00F0FF] transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="font-mono text-[11px]" dir="ltr">+44 20 7946 0000</span>
              </a>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{isAr ? 'دعم لوجستي على مدار الساعة 24/7' : '24/7 Global Logistics Desk'}</span>
              </span>
              <span className="hidden xl:flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'المقر الرئيسي: الكناري وورف، لندن • خطوط نقل عالمية' : 'HQ: Canary Wharf, London • Global Hubs'}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavClick('tracking')}
                className="hover:text-[#00F0FF] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Search className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{isAr ? 'التتبع الحي للشحنات' : 'Live Tracking'}</span>
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => handleNavClick('contact')}
                className="hover:text-[#00F0FF] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Headphones className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{isAr ? 'مركز المساعدة' : 'Help Center'}</span>
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => handleNavClick('about')}
                className="hover:text-[#00F0FF] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAr ? 'عن أجا' : 'About AJA'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Enterprise Header (Heights: Desktop 84px, Tablet 76px, Mobile 68px) */}
        <div className={`bg-[#07131F]/95 backdrop-blur-2xl border-b border-white/10 text-white transition-all duration-300 ${
          isScrolled 
            ? 'shadow-[0_12px_24px_-4px_rgba(16,42,67,0.4)] py-2' 
            : 'py-3'
        }`}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[68px] md:h-[76px] lg:h-[84px]">
              
              {/* Brand Logo */}
              <div
                className="flex items-center gap-3 cursor-pointer group shrink-0"
                onClick={() => handleNavClick('home')}
              >
                <div className="w-11 h-11 bg-gradient-to-br from-[#0B5FFF] to-[#102A43] p-0.5 rounded-xl shadow-[0_0_15px_rgba(11,95,255,0.4)] group-hover:scale-105 transition-all duration-200">
                  <div className="w-full h-full rounded-[10px] bg-[#07131F] flex items-center justify-center text-white">
                    <Ship className="w-5.5 h-5.5 text-[#00F0FF]" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight block leading-none text-white group-hover:text-[#00F0FF] transition-colors">
                    AJA
                  </span>
                  <span className="text-[9px] text-[#00F0FF] font-black tracking-widest uppercase block mt-1">
                    INTERNATIONAL LOGISTICS
                  </span>
                </div>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden xl:flex items-center gap-1.5 relative">
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nav.home}
                </button>

                <button
                  onClick={() => handleNavClick('about')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'about'
                      ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nav.aboutUs}
                </button>

                {/* Mega Menu Toggle */}
                <div 
                  className="relative"
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('services')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      activeTab === 'services' || activeTab.startsWith('service-') || megaMenuOpen
                        ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{t.nav.services}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Mega Menu Overlay */}
                  {megaMenuOpen && (
                    <MegaMenu
                      onNavigate={handleNavClick}
                      onClose={() => setMegaMenuOpen(false)}
                    />
                  )}
                </div>

                <button
                  onClick={() => handleNavClick('industries')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'industries'
                      ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nav.industries}
                </button>

                <button
                  onClick={() => handleNavClick('global-network')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'global-network'
                      ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nav.globalNetwork}
                </button>

                <button
                  onClick={() => handleNavClick('tracking')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'tracking'
                      ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nav.tracking}
                </button>

                <button
                  onClick={() => handleNavClick('contact')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'contact'
                      ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nav.contact}
                </button>
              </nav>

              {/* Right Utility Buttons */}
              <div className="hidden lg:flex items-center gap-2.5">
                {/* Global Search Shortcut Button */}
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="px-3 py-2 rounded-xl text-slate-300 hover:text-[#00F0FF] bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
                  title={isAr ? 'البحث اللوجستي الشامل (CTRL + K)' : 'Search (CTRL + K)'}
                >
                  <Search className="w-4 h-4 text-[#00F0FF]" />
                  <span className="hidden xl:inline">{isAr ? 'البحث' : 'Search'}</span>
                  <span className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/10 text-slate-400">
                    Ctrl K
                  </span>
                </button>

                {/* Notifications Menu Dropdown */}
                <NotificationsMenu onNavigate={handleNavClick} />

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl text-slate-300 hover:text-[#00F0FF] bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                  title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#00F0FF]" />}
                </button>

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#00F0FF]" />
                  <span>{isAr ? 'EN' : 'العربية'}</span>
                </button>

                {/* Authentication User Menu or CTA */}
                {user ? (
                  <UserMenu onNavigate={handleNavClick} />
                ) : (
                  <div className="flex items-center gap-2 ms-1">
                    <button 
                      onClick={() => handleNavClick('login')} 
                      className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 rounded-xl hover:bg-white/5"
                    >
                      <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>{isAr ? 'دخول العملاء' : 'Client Login'}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleNavClick('quote-request')}
                      className="px-4 py-2.5 bg-[#00F0FF] hover:bg-[#38BDF8] text-[#030712] font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#030712]" />
                      <span>{t.nav.getQuote}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Control Buttons */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="p-2 rounded-xl border border-white/10 text-slate-300 bg-white/5"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-[#00F0FF]" />
                </button>

                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1.5 border border-white/20 rounded-xl flex items-center gap-1 text-xs font-bold text-white bg-white/10"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>{isAr ? 'EN' : 'عربي'}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl border border-white/20 text-white bg-white/10"
                  aria-label="Toggle navigation drawer"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Full-Screen Mobile Navigation Drawer (250ms animation) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1300] lg:hidden transition-opacity duration-250"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide Drawer */}
            <div
              className={`fixed top-0 bottom-0 ${
                isAr ? 'right-0 border-l' : 'left-0 border-r'
              } w-[320px] max-w-[88vw] bg-[#07131F] text-white border-white/15 z-[1310] shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden transform transition-all duration-250 ease-out`}
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 backdrop-blur-md z-10 bg-[#07131F]/95">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => handleNavClick('home')}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#0B5FFF] to-[#102A43] p-0.5 rounded-xl shadow-md">
                    <div className="w-full h-full rounded-[9px] flex items-center justify-center bg-[#07131F] text-white">
                      <Ship className="w-4 h-4 text-[#00F0FF]" />
                    </div>
                  </div>
                  <div>
                    <span className="text-lg font-extrabold tracking-tight block leading-none text-white">
                      AJA
                    </span>
                    <span className="text-[9px] text-[#00F0FF] font-black tracking-widest uppercase block mt-0.5">
                      LOGISTICS SERVICES
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Body */}
              <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                <div className="p-3 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 rounded-xl border border-[#00F0FF]/30 transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{isAr ? 'English (EN)' : 'العربية (AR)'}</span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-amber-400 bg-white/10 border border-white/10"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#00F0FF]" />
                    )}
                  </button>
                </div>

                <nav className="space-y-1.5">
                  <button
                    onClick={() => handleNavClick('home')}
                    className={`w-full text-start px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      activeTab === 'home'
                        ? 'bg-[#00F0FF] text-[#030712] font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{t.nav.home}</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('about')}
                    className={`w-full text-start px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      activeTab === 'about'
                        ? 'bg-[#00F0FF] text-[#030712] font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{t.nav.aboutUs}</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('services')}
                    className={`w-full text-start px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      activeTab === 'services'
                        ? 'bg-[#00F0FF] text-[#030712] font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{t.nav.services}</span>
                  </button>

                  {/* Sub Services */}
                  <div className={`${isAr ? 'mr-4 pr-3 border-r-2' : 'ml-4 pl-3 border-l-2'} border-white/10 space-y-1 my-1`}>
                    <button
                      onClick={() => handleNavClick('air-freight')}
                      className="w-full text-start py-2 px-3 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                    >
                      <Plane className="w-4 h-4 text-[#00F0FF]" />
                      <span>{t.nav.airFreight}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('sea-freight')}
                      className="w-full text-start py-2 px-3 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                    >
                      <Ship className="w-4 h-4 text-[#00F0FF]" />
                      <span>{t.nav.seaFreight}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('land-transport')}
                      className="w-full text-start py-2 px-3 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                    >
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>{t.nav.landFreight}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('warehousing')}
                      className="w-full text-start py-2 px-3 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                    >
                      <Boxes className="w-4 h-4 text-amber-400" />
                      <span>{t.nav.warehousing}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('customs')}
                      className="w-full text-start py-2 px-3 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span>{t.nav.customs}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleNavClick('industries')}
                    className={`w-full text-start px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      activeTab === 'industries'
                        ? 'bg-[#00F0FF] text-[#030712] font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{t.nav.industries}</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('tracking')}
                    className={`w-full text-start px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      activeTab === 'tracking'
                        ? 'bg-[#00F0FF] text-[#030712] font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{t.nav.tracking}</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('contact')}
                    className={`w-full text-start px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      activeTab === 'contact'
                        ? 'bg-[#00F0FF] text-[#030712] font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{t.nav.contact}</span>
                  </button>
                </nav>
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-5 border-t border-white/10 space-y-3 sticky bottom-0 bg-[#07131F]/95 backdrop-blur-md">
                <button
                  className="w-full py-3 bg-[#00F0FF] text-[#030712] font-black rounded-xl text-center shadow-lg transition-all"
                  onClick={() => handleNavClick('quote-request')}
                >
                  {t.nav.getQuote}
                </button>

                {user ? (
                  <button
                    className="w-full py-2.5 bg-white/10 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() =>
                      handleNavClick(user.role === 'CUSTOMER' ? 'customer-dashboard' : 'admin-dashboard')
                    }
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#00F0FF]" />
                    <span>{user.role === 'CUSTOMER' ? t.nav.portal : t.nav.adminDashboard}</span>
                  </button>
                ) : (
                  <button
                    className="w-full py-2.5 border border-white/20 text-white font-bold rounded-xl text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/5"
                    onClick={() => handleNavClick('login')}
                  >
                    <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>{isAr ? 'تسجيل دخول العملاء' : 'Client Login'}</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
};
