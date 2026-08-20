import React, { useState } from 'react';
import { 
  User, 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  Key, 
  ShieldCheck, 
  LogOut, 
  ChevronDown,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export interface UserMenuProps {
  onNavigate?: (tab: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userRoleText = user.role === 'ADMIN' 
    ? (isAr ? 'مدير النظام' : 'System Admin') 
    : user.role === 'STAFF' 
    ? (isAr ? 'موظف العمليات' : 'Logistics Staff') 
    : (isAr ? 'عميل معتمد' : 'Enterprise Client');

  const handleAction = (tab?: string) => {
    setIsOpen(false);
    if (tab && onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B5FFF] to-[#102A43] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-white/20">
          {(user.fullName || (user as any).name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block text-start text-xs">
          <div className="font-bold leading-tight truncate max-w-[120px]">{user.fullName || (user as any).name}</div>
          <div className="text-[10px] text-[#00F0FF] font-semibold">{userRoleText}</div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`absolute top-full ${
              isAr ? 'left-0' : 'right-0'
            } mt-3 w-64 bg-white dark:bg-[#0B172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 text-slate-900 dark:text-slate-100 overflow-hidden animate-fadeIn`}
          >
            {/* User Profile Card Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B5FFF] dark:bg-[#00F0FF] text-white dark:text-[#030712] font-black text-sm flex items-center justify-center shadow-md">
                  {(user.fullName || (user as any).name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold truncate">{user.fullName || (user as any).name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    <Building className="w-3 h-3" />
                    <span className="truncate">{user.companyName || user.companyId || 'AJA Global Partner'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1 text-xs">
              <button
                onClick={() =>
                  handleAction(user.role === 'CUSTOMER' ? 'customer-dashboard' : 'admin-dashboard')
                }
                className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />
                <span>{isAr ? 'لوحة التحكم الرئيسية' : 'Dashboard'}</span>
              </button>

              <button
                onClick={() => handleAction('customer-dashboard')}
                className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'الملف الشخصي والشركة' : 'Profile & Company'}</span>
              </button>

              <button
                onClick={() => handleAction('customer-dashboard')}
                className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'الفواتير والائتمان' : 'Billing & Credit'}</span>
              </button>

              <button
                onClick={() => handleAction('customer-dashboard')}
                className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Key className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'مفاتيح الربط البرمجي API' : 'API Integrations'}</span>
              </button>

              <button
                onClick={() => handleAction('customer-dashboard')}
                className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>{isAr ? 'إعدادات الحساب' : 'Account Settings'}</span>
              </button>
            </div>

            {/* Logout Footer */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
