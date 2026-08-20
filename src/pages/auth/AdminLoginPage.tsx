import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  ShieldCheck,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogOut,
  Sparkles,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Server
} from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (tab: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { user, login, logout, requestPasswordReset, resetPassword } = useAuth();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaTransactionId, setMfaTransactionId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaExpiresAt, setMfaExpiresAt] = useState<string | null>(null);

  // Password reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const isAr = language === 'ar';

  useEffect(() => {
    const savedEmail = localStorage.getItem('aja_remembered_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const fillDemoEmail = (role: 'ADMIN' | 'STAFF') => {
    let targetEmail = 'admin@aja-logistics.com';

    if (role === 'STAFF') {
      targetEmail = 'staff@aja-logistics.com';
    }

    setEmail(targetEmail);
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password.');
      return;
    }
    if (mfaTransactionId && !mfaCode.trim()) {
      setError(isAr ? 'يرجى إدخال رمز التحقق الثنائي' : 'Please enter the MFA verification code.');
      return;
    }

    setError(null);
    setLoading(true);
    const result = await login(email.trim(), password.trim(), mfaTransactionId ? {
      mfaTransactionId,
      mfaCode: mfaCode.trim(),
    } : undefined);
    setLoading(false);

    if (result.mfaRequired && result.mfaTransactionId) {
      setMfaTransactionId(result.mfaTransactionId);
      setMfaExpiresAt(result.expiresAt || null);
      setMfaCode('');
      setError(isAr ? 'أدخل رمز التحقق الثنائي لإكمال دخول Admin Pro.' : 'Enter the MFA code to complete Admin Pro sign-in.');
      return;
    }

    if (!result.success) {
      setError(result.error || (isAr ? 'خطأ في بيانات الاعتماد الخاصة بالإدارة' : 'Invalid admin credentials.'));
    } else {
      setMfaTransactionId(null);
      setMfaCode('');
      setMfaExpiresAt(null);
      if (rememberMe) {
        localStorage.setItem('aja_remembered_admin_email', email.trim());
      } else {
        localStorage.removeItem('aja_remembered_admin_email');
      }
      onNavigate('admin-dashboard');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    const res = await requestPasswordReset(resetEmail.trim());
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(isAr ? 'تم إرسال رمز الاستعادة بنجاح. تفقد بريدك الإلكتروني.' : 'Reset code sent. Please check your inbox.');
      setResetStep(2);
    } else {
      setResetError(res.error || (isAr ? 'فشل طلب إعادة تعيين كلمة المرور' : 'Failed to request password reset'));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword.trim()) return;
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    const res = await resetPassword(resetEmail.trim(), resetToken.trim(), newPassword.trim());
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(isAr ? 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.' : 'Password reset successful! You can login now.');
      setTimeout(() => {
        setIsResetModalOpen(false);
      }, 2000);
    } else {
      setResetError(res.error || (isAr ? 'الرمز غير صحيح أو منتهي الصلاحية' : 'Invalid or expired reset token'));
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 dir-rtl">
      {/* Active User Banner */}
      {user ? (
        <Card className="p-6 sm:p-8 mb-6 border-[#00F0FF]/40 bg-gradient-to-br from-[#0B172A] via-[#030712] to-[#082F49] text-white shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center sm:text-start">
              <div className="w-14 h-14 bg-[#00F0FF]/15 border border-[#00F0FF]/40 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#00F0FF]" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 mb-1">
                  {user.role === 'ADMIN' ? (isAr ? 'مدير النظام' : 'System Admin') : (isAr ? 'فريق العمليات والتخليص' : 'Operations Staff')}
                </span>
                <h3 className="text-lg font-black text-white">{user.fullName}</h3>
                <p className="text-xs text-slate-300 dir-ltr text-start">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <Button
                onClick={() => onNavigate('admin-dashboard')}
                variant="primary"
                className="justify-center gap-2 text-xs font-black shadow-lg bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8]"
              >
                <span>{isAr ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}</span>
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

      {/* Main Admin Portal Card */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-2xl border-[#0F4C75]/50 bg-gradient-to-b from-[#0B172A] to-[#030712] text-white rounded-3xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-72 h-32 bg-[#0F4C75]/30 blur-3xl pointer-events-none" />

        {/* Portal Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0F4C75] to-[#082F49] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <ShieldCheck className="w-8 h-8 text-[#00F0FF]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-[11px] font-mono font-extrabold uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>Staff & Operations Command Center</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {isAr ? 'بوابة دخول الإدارة والتخليص الجمركي' : 'Admin & Operations Portal'}
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {isAr ? 'منصة الإدارة والعمليات الموحدة لشركة أجا اللوجستية المخصصة للمشرفين ومسؤولي التخليص' : 'Authorized access for AJA Logistics operational staff and system administrators'}
          </p>
        </div>

        {/* Alert Error Box */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              {isAr ? 'البريد الإلكتروني الإداري *' : 'Admin Email *'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aja-logistics.com"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-[#030712] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent min-h-[44px]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t.auth.password} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-[#030712] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent min-h-[44px] pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-[#00F0FF] focus:ring-[#00F0FF] bg-[#030712]"
                />
                <span>{isAr ? 'حفظ جلسة الإدارة' : 'Keep Admin Session'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail(email || 'admin@aja-logistics.com');
                  setResetError(null);
                  setResetSuccess(null);
                  setResetStep(1);
                  setIsResetModalOpen(true);
                }}
                className="text-[#00F0FF] font-bold hover:underline cursor-pointer"
              >
                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </button>
            </div>
          </div>

          {mfaTransactionId && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isAr ? 'رمز التحقق الثنائي *' : 'MFA Code *'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-[#030712] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent min-h-[44px] font-mono tracking-widest"
              />
              {mfaExpiresAt && (
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'تنتهي صلاحية التحدي في: ' : 'Challenge expires at: '}
                  <span className="font-mono">{new Date(mfaExpiresAt).toLocaleTimeString()}</span>
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full justify-center font-black shadow-xl min-h-[46px] text-sm bg-gradient-to-r from-[#0F4C75] via-[#135D8D] to-[#082F49] hover:from-[#1b6b9d] text-white border border-[#00F0FF]/30"
          >
            <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
            <span>{isAr ? 'تسجيل دخول كمسؤول / موظف عمليات' : 'Sign In to Admin Operations'}</span>
          </Button>
        </form>

        {/* Development account email presets */}
        <div className="pt-4 border-t border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{isAr ? 'اختصارات بريد التطوير لكادر الإدارة والعمليات:' : 'Development email presets:'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemoEmail('ADMIN')}
              className="p-3 bg-white/5 hover:bg-[#00F0FF]/10 border border-white/10 hover:border-[#00F0FF]/50 rounded-xl transition-all cursor-pointer text-start flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black shrink-0 border border-purple-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-extrabold text-white block truncate">
                  {isAr ? 'مدير النظام Executive' : 'System Admin'}
                </span>
                <span className="text-[10px] text-purple-300 font-mono block">admin@aja-logistics.com</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('STAFF')}
              className="p-3 bg-white/5 hover:bg-[#00F0FF]/10 border border-white/10 hover:border-[#00F0FF]/50 rounded-xl transition-all cursor-pointer text-start flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0 border border-sky-500/30">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-extrabold text-white block truncate">
                  {isAr ? 'فريق العمليات والتخليص' : 'Operations Staff'}
                </span>
                <span className="text-[10px] text-sky-300 font-mono block">staff@aja-logistics.com</span>
              </div>
            </button>
          </div>
        </div>

        {/* Security & Link to Customer Portal */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'اتصال مؤمن 256-bit TLS | سجلات الدخول مفعّلة' : '256-bit Encrypted Admin Portal'}</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-[#00F0FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'هل أنت عميل؟ انتقل لبوابة العملاء' : 'Are you a client? Client Portal'}</span>
          </button>
        </div>
      </Card>

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-[#0B172A] border border-[#0F4C75] text-white shadow-2xl space-y-4 rounded-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black flex items-center gap-2 text-white">
                <KeyRound className="w-5 h-5 text-[#00F0FF]" />
                <span>{isAr ? 'استعادة كلمة مرور الإدارة' : 'Admin Password Reset'}</span>
              </h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-slate-300">
                  {isAr
                    ? 'أدخل بريدك الإلكتروني المسجل في كادر الإدارة لإرسال رمز التأكيد:'
                    : 'Enter your registered admin email address to receive reset code:'}
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@aja-logistics.com"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-[#030712] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={resetLoading}
                  className="w-full justify-center bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8] font-bold"
                >
                  {isAr ? 'إرسال رمز الاستعادة' : 'Send Reset Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-300">
                  {isAr ? 'أدخل الرمز المستلم وكلمة المرور الجديدة:' : 'Enter code received and new password:'}
                </p>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-[#030712] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isAr ? 'كلمة المرور الجديدة' : 'New password'}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-[#030712] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={resetLoading}
                  className="w-full justify-center bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8] font-bold"
                >
                  {isAr ? 'تأكيد وحفظ كلمة المرور' : 'Confirm & Save Password'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
