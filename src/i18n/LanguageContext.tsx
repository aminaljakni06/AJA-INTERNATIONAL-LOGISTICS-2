import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from './ar';
import { en } from './en';

export type Language = 'ar' | 'en';
type Translations = typeof ar;

interface LanguageContextType {
  language: Language;
  isAr: boolean;
  direction: 'rtl' | 'ltr';
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aja_language');
      if (saved === 'en' || saved === 'ar') return saved;
    } catch (e) {
      // Ignore localStorage errors
    }
    return 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const t = language === 'ar' ? ar : (en as unknown as Translations);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('aja_language', lang);
    } catch (e) {
      // Ignore localStorage errors
    }
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const isAr = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, isAr, direction, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
