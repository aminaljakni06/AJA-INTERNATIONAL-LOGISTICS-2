import React from 'react';
import { LayoutDashboard, Package, FileText, Folder, User, Bot } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, unreadCount = 0 }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'customer-dashboard', label: t.bottomNav.home, icon: LayoutDashboard },
    { id: 'customer-ai', label: t.bottomNav.aiAssistant, icon: Bot },
    { id: 'customer-shipments', label: t.bottomNav.myShipments, icon: Package },
    { id: 'customer-quotes', label: t.bottomNav.quotes, icon: FileText },
    { id: 'customer-documents', label: t.bottomNav.docs, icon: Folder },
    { id: 'customer-profile', label: t.bottomNav.profile, icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#082F49] border-t border-[#0F4C75] shadow-lg px-2 py-1.5 backdrop-blur-lg bg-opacity-95 text-white">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const badge = (item as any).badge;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[52px] min-h-[48px] rounded-xl transition-all relative ${
                isActive
                  ? 'text-amber-400 font-bold bg-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-400' : ''}`} />
                {badge && badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-[#082F49] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#082F49]">
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[60px]">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-amber-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
