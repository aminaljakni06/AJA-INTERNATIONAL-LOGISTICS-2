import React, { useState } from 'react';
import { ArrowRight, Menu, X, Globe, Search, User } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export interface HeaderProps {
  onNavigate?: (tab: string) => void;
  onGetQuoteClick?: () => void;
  onTrackShipmentClick?: () => void;
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onGetQuoteClick,
  onTrackShipmentClick,
  onSignInClick,
}) => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'services', labelEn: 'Solutions', labelAr: 'الحلول اللوجستية' },
    { id: 'shipping', labelEn: 'Shipping', labelAr: 'الشحن البحري' },
    { id: 'freight', labelEn: 'Freight', labelAr: 'النقل والأسطول' },
    { id: 'warehousing', labelEn: 'Warehousing', labelAr: 'المستودعات' },
    { id: 'tracking', labelEn: 'Tracking', labelAr: 'تتبع الشحنات' },
    { id: 'business', labelEn: 'Business', labelAr: 'حلول الشركات' },
    { id: 'about', labelEn: 'About', labelAr: 'عن الشركة' },
  ];

  const handleNavClick = (id: string) => {
    if (onNavigate) onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-40 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 py-6 transition-all duration-300">
      <div className="flex items-center justify-between gap-6">
        
        {/* Left Side: Brand Typographic Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="cursor-pointer group flex items-center gap-3 shrink-0"
        >
          {/* Brand Logo Container with Enterprise Identity */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#082F49] via-[#0F4C75] to-[#EA580C] p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#082F49] rounded-[10px] flex items-center justify-center font-black text-xs text-[#EA580C] tracking-tighter">
              AJA
            </div>
          </div>

          <div className="flex flex-col text-left rtl:text-right">
            <span className="font-urbanist text-xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors leading-none">
              AJA
            </span>
            <span className="font-inter text-[10px] font-semibold tracking-[0.2em] text-[#AAB6C8] uppercase leading-snug">
              INTERNATIONAL LOGISTICS
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden xl:flex items-center gap-8 text-sm font-medium text-[#AAB6C8]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="relative py-1 text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer group"
            >
              <span>{isAr ? item.labelAr : item.labelEn}</span>
              {/* Subtle hover underline scaling 0 -> 100% */}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4DE7FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rtl:origin-right rounded-full shadow-[0_0_8px_#4DE7FF]" />
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#AAB6C8] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#4DE7FF]" />
            <span>{isAr ? 'EN' : 'العربية'}</span>
          </button>

          {/* Track Shipment Link */}
          <button
            onClick={onTrackShipmentClick || (() => handleNavClick('tracking'))}
            className="text-xs font-semibold text-[#AAB6C8] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#4DA3FF]" />
            <span>{isAr ? 'تتبع الشحنة' : 'Track Shipment'}</span>
          </button>

          {/* Sign In Link / Portal Button */}
          <button
            onClick={
              onSignInClick ||
              (() =>
                handleNavClick(
                  user
                    ? user.role === 'CUSTOMER'
                      ? 'customer-dashboard'
                      : 'admin-dashboard'
                    : 'login'
                ))
            }
            className="text-xs font-bold text-[#4DE7FF] hover:text-white bg-white/5 hover:bg-white/10 border border-[#4DE7FF]/30 hover:border-[#4DE7FF] rounded-full transition-all flex items-center gap-2 px-4 py-2 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(77,231,255,0.3)]"
          >
            <User className="w-4 h-4 text-[#4DE7FF]" />
            <span>
              {user
                ? user.fullName
                : isAr
                ? 'تسجيل الدخول للنظام'
                : 'Sign In'}
            </span>
          </button>

          {/* Get a Quote Conic Border Button */}
          <button
            onClick={onGetQuoteClick || (() => handleNavClick('quote-request'))}
            className="btn-conic-border group relative px-6 py-2.5 rounded-full text-xs font-bold text-white transition-all duration-300 cursor-pointer flex items-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(77,163,255,0.2)] hover:shadow-[0_0_30px_rgba(77,231,255,0.4)]"
          >
            <span className="relative z-10 tracking-wide">
              {isAr ? 'طلب عرض سعر' : 'GET A QUOTE'}
            </span>
            <ArrowRight className="relative z-10 w-4 h-4 text-[#4DE7FF] transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex xl:hidden items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-[#AAB6C8]"
          >
            {isAr ? 'EN' : 'عربي'}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#4DE7FF]" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-4 top-24 z-50 p-6 rounded-3xl bg-[#0B1220]/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-start py-2 px-4 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-[#4DE7FF] transition-all"
              >
                {isAr ? item.labelAr : item.labelEn}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                handleNavClick(
                  user
                    ? user.role === 'CUSTOMER'
                      ? 'customer-dashboard'
                      : 'admin-dashboard'
                    : 'login'
                );
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-white/10 border border-[#4DE7FF]/40 text-xs font-bold text-[#4DE7FF] flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-[#4DE7FF]" />
              <span>
                {user
                  ? user.fullName
                  : isAr
                  ? 'تسجيل الدخول للنظام'
                  : 'Sign In'}
              </span>
            </button>

            <button
              onClick={() => {
                if (onTrackShipmentClick) onTrackShipmentClick();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#4DE7FF]" />
              <span>{isAr ? 'تتبع الشحنة' : 'Track Shipment'}</span>
            </button>

            <button
              onClick={() => {
                if (onGetQuoteClick) onGetQuoteClick();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4DA3FF] to-[#4DE7FF] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>{isAr ? 'طلب عرض سعر' : 'GET A QUOTE →'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
