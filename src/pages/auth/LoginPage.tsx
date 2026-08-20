import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  Ship, 
  KeyRound, 
  Mail, 
  User as UserIcon,
  HelpCircle,
  Building2,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { user, login, logout, requestPasswordReset, resetPassword } = useAuth();
  const { t, language } = useLanguage();
  
  const [portalTab, setPortalTab] = useState<'ADMIN' | 'CUSTOMER'>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const isAr = language === 'ar';

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('aja_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleTabSwitch = (mode: 'ADMIN' | 'CUSTOMER') => {
    setPortalTab(mode);
    setError(null);
    if (mode === 'ADMIN') {
      setEmail('admin@aja-logistics.com');
    } else {
      setEmail('customer@aja-logistics.com');
    }
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || (isAr ? 'فشل تسجيل الدخول. يرجى التأكد من بيانات الاعتماد.' : 'Login failed. Please check credentials.'));
    } else {
      if (rememberMe) {
        localStorage.setItem('aja_remembered_email', email.trim());
      } else {
        localStorage.removeItem('aja_remembered_email');
      }

      if (result.user?.role === 'CUSTOMER') {
        onNavigate('customer-dashboard');
      } else {
        onNavigate('admin-dashboard');
      }
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    const res = await requestPasswordReset(resetEmail.trim());
    setResetLoading(false);

    if (!res.success) {
      setResetError(res.error || (isAr ? 'فشل في طلب رمز الإعادة' : 'Failed to request reset code'));
    } else {
      setResetStep(2);
      setResetSuccess(res.message || (isAr ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.' : 'Verification code sent to your email.'));
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    const res = await resetPassword(resetEmail.trim(), resetCode.trim(), newPassword);
    setResetLoading(false);

    if (!res.success) {
      setResetError(res.error || (isAr ? 'فشل إعادة تعيين كلمة المرور' : 'Password reset failed'));
    } else {
      setResetSuccess(isAr ? 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.' : 'Password reset successfully! You can now log in.');
      setTimeout(() => {
        setIsResetModalOpen(false);
        setEmail(resetEmail);
        setPassword(newPassword);
        setResetStep(1);
      }, 1500);
    }
  };

  const fillDemoEmail = (role: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    let targetEmail = '';

    if (role === 'ADMIN') {
      targetEmail = 'admin@aja-logistics.com';
    } else if (role === 'STAFF') {
      targetEmail = 'staff@aja-logistics.com';
    } else {
      targetEmail = 'customer@aja-logistics.com';
    }

    setEmail(targetEmail);
    setPassword('');
    setError(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* If already logged in, show status banner */}
      {user ? (
        <Card className="p-6 sm:p-8 mb-6 border-[#00F0FF]/40 bg-gradient-to-br from-[#0B172A] via-[#030712] to-[#082F49] text-white shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center sm:text-start">
              <div className="w-14 h-14 bg-[#00F0FF]/15 border border-[#00F0FF]/40 rounded-2xl flex items-center justify-center shrink-0">
                <UserCheck className="w-7 h-7 text-[#00F0FF]" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 mb-1">
                  {user.role === 'ADMIN' ? (isAr ? 'حساب مدير النظام' : 'System Admin') : user.role === 'STAFF' ? (isAr ? 'فريق العمليات والتخليص' : 'Operations Staff') : (isAr ? 'حساب عميل تجاري' : 'Customer Account')}
                </span>
                <h3 className="text-lg font-black text-white">{user.fullName}</h3>
                <p className="text-xs text-slate-300 dir-ltr text-start">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <Button
                onClick={() => onNavigate(user.role === 'CUSTOMER' ? 'customer-dashboard' : 'admin-dashboard')}
                variant="primary"
                className="justify-center gap-2 text-xs font-black shadow-lg bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8]"
              >
                <span>{isAr ? 'الانتقال للوحة التحكم' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#030712]" />
              </Button>
              <button
                onClick={() => logout()}
                className="px-3.5 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Main Login Card */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B172A] rounded-3xl">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0EA5E9] to-[#030712] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#00F0FF]/40 shadow-lg p-0.5">
            <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
              <Ship className="w-7 h-7 text-[#00F0FF]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isAr ? 'بوابة الدخول الإلكترونية الموحدة' : 'Unified Logistics Login Portal'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {isAr ? 'اختر البوابة المناسبة لحسابك وأدخل بيانات الاعتماد الخاصة بك' : 'Access your customized portal with your account credentials'}
          </p>
        </div>

        {/* Dual Portal Selection Tabs */}
        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 dark:bg-[#030712] p-1 border border-slate-200 dark:border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabSwitch('CUSTOMER')}
            className={`py-3 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              portalTab === 'CUSTOMER'
                ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <div className="text-start">
              <span className="block font-black leading-tight">{isAr ? 'بوابة العملاء' : 'Customer Portal'}</span>
              <span className="text-[10px] opacity-80 block font-normal">{isAr ? 'متابعة الشحنات والأسعار' : 'Clients & Freight'}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('ADMIN')}
            className={`py-3 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              portalTab === 'ADMIN'
                ? 'bg-gradient-to-r from-[#0F4C75] to-[#082F49] text-white shadow-md border border-[#00F0FF]/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
            <div className="text-start">
              <span className="block font-black leading-tight">{isAr ? 'بوابة الإدارة والتخليص' : 'Admin & Staff Portal'}</span>
              <span className="text-[10px] opacity-80 block font-normal">{isAr ? 'إدارة العمليات والتسعير' : 'Operations & Admin'}</span>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={`${t.auth.email} *`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={portalTab === 'ADMIN' ? 'admin@aja-logistics.com' : 'customer@aja-logistics.com'}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t.auth.password} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent min-h-[44px] pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-[#0EA5E9] focus:ring-[#00F0FF] dark:bg-[#030712]"
                />
                <span>{isAr ? 'تذكر بياناتي' : 'Remember me'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail(email || 'customer@aja-logistics.com');
                  setResetError(null);
                  setResetSuccess(null);
                  setResetStep(1);
                  setIsResetModalOpen(true);
                }}
                className="text-[#0EA5E9] dark:text-[#00F0FF] font-bold hover:underline cursor-pointer"
              >
                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className={`w-full justify-center font-black shadow-lg min-h-[46px] text-sm ${
              portalTab === 'ADMIN'
                ? 'bg-gradient-to-r from-[#0F4C75] to-[#082F49] text-white hover:from-[#135D8D]'
                : 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white hover:from-[#f97316]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? `دخول ${portalTab === 'ADMIN' ? 'بوابة الإدارة والتخليص' : 'بوابة العملاء'}` : `Login to ${portalTab === 'ADMIN' ? 'Admin Portal' : 'Customer Portal'}`}</span>
          </Button>
        </form>

        {/* Development account email presets */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? 'اختصارات بريد التطوير:' : 'Development email presets:'}</span>
            </span>
          </div>

          {portalTab === 'ADMIN' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoEmail('ADMIN')}
                className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-purple-500/10 border border-slate-200 dark:border-white/10 hover:border-purple-500/40 rounded-xl transition-all cursor-pointer text-start flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                    {isAr ? 'مدير النظام التنفيذي' : 'Executive Admin'}
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono block">admin@aja-logistics.com</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoEmail('STAFF')}
                className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-sky-500/10 border border-slate-200 dark:border-white/10 hover:border-sky-500/40 rounded-xl transition-all cursor-pointer text-start flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                    {isAr ? 'موظف العمليات والتخليص' : 'Operations Staff'}
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono block">staff@aja-logistics.com</span>
                </div>
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => fillDemoEmail('CUSTOMER')}
                className="w-full p-3 bg-slate-50 dark:bg-white/5 hover:bg-amber-500/10 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer text-start flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      {isAr ? 'حساب العميل التجاري (شركة الأفق للاستيراد)' : 'Corporate Customer Account'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono block">customer@aja-logistics.com</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </button>
            </div>
          )}
        </div>

        {/* Security / Trust Badges & Admin Switch */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isAr ? 'تشفير آمن 256-bit JWT' : '256-bit Encrypted Portal'}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-login')}
            className="text-[#0F4C75] dark:text-[#00F0FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'بوابة دخول الإدارة والتخليص' : 'Admin & Staff Portal'}</span>
          </button>
        </div>

        {/* Register Redirect */}
        <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
          <span>{t.auth.noAccount} </span>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-[#0EA5E9] dark:text-[#00F0FF] font-extrabold hover:underline cursor-pointer"
          >
            {t.auth.registerBtn}
          </button>
        </div>
      </Card>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={isAr ? 'استعادة كلمة المرور' : 'Reset Password'}
      >
        <div className="space-y-4 pt-2">
          {resetError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {resetStep === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAr ? 'أدخل بريدك الإلكتروني لتلقي رمز التحقق لاستعادة الحساب.' : 'Enter your email address to receive a verification code.'}
              </p>
              <Input
                label={`${t.auth.email} *`}
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="customer@aja-logistics.com"
                required
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsResetModalOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={resetLoading}>
                  <Mail className="w-4 h-4" />
                  <span>{isAr ? 'إرسال الرمز' : 'Send Code'}</span>
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAr ? 'أدخل الرمز المرسل إلى بريدك وكلمة المرور الجديدة.' : 'Enter the code sent to your email and your new password.'}
              </p>
              <Input
                label={isAr ? 'رمز التحقق (Code) *' : 'Verification Code *'}
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                required
              />
              <Input
                label={isAr ? 'كلمة المرور الجديدة *' : 'New Password *'}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setResetStep(1)}>
                  {t.common.back}
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={resetLoading}>
                  {t.common.save}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
