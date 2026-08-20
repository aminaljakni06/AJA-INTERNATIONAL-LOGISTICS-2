import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MessageCircle } from 'lucide-react';
import { SEO } from '../common/SEO';

interface PublicLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, activeTab = 'home', setActiveTab }) => {
  const isHome = activeTab === 'home' || !activeTab;

  return (
    <div className="min-h-screen flex flex-col bg-surface-dark text-text-on-dark font-sans relative">
      <SEO />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main id="main-content" className={`flex-1 focus:outline-none ${isHome ? '' : 'pt-20'}`} tabIndex={-1}>
        {children}
      </main>
      
      {/* Floating WhatsApp CTA Button */}
      <a
        href="https://wa.me/966500000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B9%D8%AC%D8%A7%20%D9%84%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D9%84%D9%88%D8%AC%D8%B3%D8%AA%D9%8A%D8%A9%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B4%D8%AD%D9%86%D8%A9"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا عبر واتساب / Contact via WhatsApp"
        className="fixed bottom-6 rtl:left-6 ltr:right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 group border-2 border-emerald-400/40 focus:ring-4 focus:ring-emerald-400 focus:outline-none"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 rtl:group-hover:ml-2 ltr:group-hover:mr-2 text-xs font-bold">
          تحدث معنا عبر واتساب
        </span>
      </a>

      <Footer onNavigate={setActiveTab} />
    </div>
  );
};

