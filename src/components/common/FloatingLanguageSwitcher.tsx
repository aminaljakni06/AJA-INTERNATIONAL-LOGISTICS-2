import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, Sparkles, ArrowRightLeft, Languages } from 'lucide-react';
import { useLanguage, Language } from '../../i18n/LanguageContext';

export interface FloatingLanguageSwitcherProps {
  className?: string;
  position?: 'bottom-start' | 'bottom-end';
}

export const FloatingLanguageSwitcher: React.FC<FloatingLanguageSwitcherProps> = ({
  className = '',
  position = 'bottom-start',
}) => {
  const { language, setLanguage, direction, isAr } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang);
    }
    setIsOpen(false);
  };

  const handleQuickToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const positionClasses =
    position === 'bottom-start'
      ? 'fixed bottom-6 rtl:right-6 ltr:left-6 z-40'
      : 'fixed bottom-6 rtl:left-6 ltr:right-6 z-40';

  return (
    <div
      ref={containerRef}
      id="floating-language-switcher-container"
      className={`${positionClasses} ${className}`}
      role="region"
      aria-label={isAr ? 'مبدل اللغة واتجاه الصفحة' : 'Language and layout direction switcher'}
    >
      {/* Expanded Language Selection Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-language-popover"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute bottom-16 rtl:right-0 ltr:left-0 w-72 rounded-2xl bg-[#081726]/95 backdrop-blur-xl border border-[#1C3D5A] shadow-2xl p-3 text-slate-100 overflow-hidden"
          >
            {/* Header / Info Badge */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 px-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0B5FFF]/20 text-[#0B5FFF]">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isAr ? 'لغة العرض والاتجاه' : 'Language & Layout'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {isAr ? 'نظام الخطوط والاتجاه التلقائي' : 'Auto font & RTL/LTR switch'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold">
                {direction.toUpperCase()}
              </span>
            </div>

            {/* Language Options */}
            <div className="space-y-1.5">
              {/* Arabic Option */}
              <button
                type="button"
                id="lang-option-ar"
                onClick={() => handleSelectLanguage('ar')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-all ${
                  language === 'ar'
                    ? 'bg-[#0B5FFF] text-white shadow-lg shadow-[#0B5FFF]/25 font-semibold'
                    : 'hover:bg-white/10 text-slate-200'
                }`}
                aria-pressed={language === 'ar'}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none select-none">🇸🇦</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold font-arabic">العربية</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-slate-100 font-mono">
                        RTL
                      </span>
                    </div>
                    <p className={`text-[11px] font-arabic ${language === 'ar' ? 'text-white/80' : 'text-slate-400'}`}>
                      خط IBM Plex Sans Arabic
                    </p>
                  </div>
                </div>
                {language === 'ar' && (
                  <div className="w-5 h-5 rounded-full bg-white text-[#0B5FFF] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* English Option */}
              <button
                type="button"
                id="lang-option-en"
                onClick={() => handleSelectLanguage('en')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-all ${
                  language === 'en'
                    ? 'bg-[#0B5FFF] text-white shadow-lg shadow-[#0B5FFF]/25 font-semibold'
                    : 'hover:bg-white/10 text-slate-200'
                }`}
                aria-pressed={language === 'en'}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none select-none">🇬🇧</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold font-sans">English</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-slate-100 font-mono">
                        LTR
                      </span>
                    </div>
                    <p className={`text-[11px] ${language === 'en' ? 'text-white/80' : 'text-slate-400'}`}>
                      Inter System Typography
                    </p>
                  </div>
                </div>
                {language === 'en' && (
                  <div className="w-5 h-5 rounded-full bg-white text-[#0B5FFF] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            {/* Quick Direction Info Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-[#0B5FFF]" />
                {isAr ? 'تبديل الاتجاه الفوري' : 'Instant layout flip'}
              </span>
              <button
                type="button"
                onClick={handleQuickToggle}
                className="text-[#0B5FFF] hover:text-[#3884FF] font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'تبديل سريع' : 'Quick Flip'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Pill Button */}
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center rounded-full p-1 bg-[#081726]/90 hover:bg-[#0C2238] backdrop-blur-xl border border-[#1E446B]/80 hover:border-[#0B5FFF]/60 shadow-xl shadow-black/40 transition-colors"
      >
        {/* Main Trigger Pill */}
        <button
          type="button"
          id="floating-language-trigger-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={isAr ? `اللغة الحالية: العربية. انقر لتغيير اللغة أو الاتجاه` : `Current language: English. Click to toggle language or direction`}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]"
        >
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#0B5FFF]/20 text-[#0B5FFF]">
            <Globe className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#14B86A] ring-2 ring-[#081726]" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
            <span>{isAr ? 'العربية' : 'English'}</span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {language.toUpperCase()}
            </span>
          </div>
        </button>

        {/* Quick Instant Toggle Arrow Button */}
        <div className="h-4 w-px bg-white/15 mx-0.5" />
        <button
          type="button"
          id="floating-language-quick-toggle-btn"
          onClick={handleQuickToggle}
          title={isAr ? 'التبديل الفوري إلى الإنجليزية (LTR)' : 'Switch immediately to Arabic (RTL)'}
          aria-label={isAr ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
};
