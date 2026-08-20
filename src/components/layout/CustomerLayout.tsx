import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';
import { AIAssistantWidget } from '../ai/AIAssistantWidget';
import { SupportChatWidget } from '../customer/SupportChatWidget';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans pb-16 md:pb-0 transition-colors">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 max-w-7xl w-full mx-auto my-3 md:my-6 px-3 sm:px-6 lg:px-8 gap-6">
        <Sidebar currentTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 bg-white dark:bg-[#0B172A] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm min-h-[500px] transition-colors">
          {children}
        </main>
      </div>
      <Footer onNavigate={setActiveTab} />
      <BottomNav currentTab={activeTab} onSelectTab={setActiveTab} />
      <SupportChatWidget onNavigate={setActiveTab} />
      <AIAssistantWidget />
      <PWAInstallPrompt />
    </div>
  );
};
