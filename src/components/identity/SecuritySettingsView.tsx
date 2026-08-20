import React, { useState, useEffect } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { KeyRound, ShieldCheck, Smartphone, Lock, AlertTriangle, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';

export const SecuritySettingsView: React.FC = () => {
  const { mfaConfig, passwordPolicy, setupMFA, disableMFA, validatePassword } = useIdentity();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passErrors, setPassErrors] = useState<string[]>([]);
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // MFA State
  const [mfaStatusMsg, setMfaStatusMsg] = useState<string | null>(null);

  // Validate live password input
  useEffect(() => {
    if (!newPassword) {
      setPassErrors([]);
      return;
    }
    validatePassword(newPassword).then(res => {
      setPassErrors(res.errors || []);
    });
  }, [newPassword]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassStatus({ type: 'error', message: isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }
    if (passErrors.length > 0) {
      setPassStatus({ type: 'error', message: isAr ? 'يرجى استيفاء شروط سياسة كلمة المرور' : 'Password does not meet requirements' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aja_auth_token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassStatus({ type: 'success', message: isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassStatus({ type: 'error', message: data.error || (isAr ? 'فشل تغيير كلمة المرور' : 'Failed to change password') });
      }
    } catch {
      setPassStatus({ type: 'error', message: isAr ? 'تعذر الاتصال بالخادم' : 'Server error' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggleMFA = async () => {
    if (mfaConfig?.mfaEnabled) {
      const res = await disableMFA();
      if (res.success) {
        setMfaStatusMsg(isAr ? 'تم تعطيل التحقق الثنائي (MFA)' : 'MFA disabled successfully');
      }
    } else {
      const res = await setupMFA('TOTP');
      if (res.success) {
        setMfaStatusMsg(isAr ? 'تم تفعيل التحقق الثنائي وإصدار رموز الإستعادة' : 'MFA enabled successfully');
      }
    }
    setTimeout(() => setMfaStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          {isAr ? 'إعدادات الأمان وسياسة المرور' : 'Security & Password Policy Settings'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {isAr 
            ? 'تغيير كلمة المرور، تفعيل التحقق الثنائي (MFA)، وإدارة معايير الأمان المتقدمة' 
            : 'Password changes, MFA configuration, and enterprise security policies.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Change Form */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
            <KeyRound className="w-5 h-5 text-blue-600" />
            {isAr ? 'تحديث كلمة المرور' : 'Change Password'}
          </h4>

          {passStatus && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold ${
              passStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {passStatus.message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPass ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Live Policy Rules Checklist */}
            {passwordPolicy && newPassword && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'متطلبات سياسة المرور المؤسسية:' : 'Enterprise Password Policy Requirements:'}
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                  <span className={newPassword.length >= passwordPolicy.minLength ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                    ✓ {passwordPolicy.minLength}+ {isAr ? 'أحرف' : 'characters'}
                  </span>
                  <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                    ✓ {isAr ? 'حرف كبير (A-Z)' : 'Uppercase (A-Z)'}
                  </span>
                  <span className={/[a-z]/.test(newPassword) ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                    ✓ {isAr ? 'حرف صغير (a-z)' : 'Lowercase (a-z)'}
                  </span>
                  <span className={/[0-9]/.test(newPassword) ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                    ✓ {isAr ? 'رقم (0-9)' : 'Number (0-9)'}
                  </span>
                  <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                    ✓ {isAr ? 'رمز خاص (!@#$)' : 'Symbol (!@#$)'}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass || passErrors.length > 0}
              className="w-full py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition shadow-sm"
            >
              {isChangingPass ? (isAr ? 'جاري التحديث...' : 'Updating...') : (isAr ? 'تحديث كلمة المرور' : 'Update Password')}
            </button>
          </form>
        </div>

        {/* Multi-Factor Authentication (MFA) Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            {isAr ? 'التحقق الثنائي (MFA Infrastructure)' : 'Multi-Factor Authentication (MFA)'}
          </h4>

          {mfaStatusMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
              {mfaStatusMsg}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {isAr ? 'حالة MFA' : 'MFA Status'}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  mfaConfig?.mfaEnabled 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                    : 'bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-slate-300'
                }`}>
                  {mfaConfig?.mfaEnabled ? (isAr ? 'مُفعل' : 'Enabled') : (isAr ? 'معطل' : 'Disabled')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {isAr ? 'تطبيق المصادقة TOTP / رمز الإستعادة' : 'TOTP Authenticator Apps / Backup Codes'}
              </p>
            </div>

            <button
              onClick={handleToggleMFA}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                mfaConfig?.mfaEnabled 
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {mfaConfig?.mfaEnabled ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل الآن' : 'Enable Now')}
            </button>
          </div>

          {/* Backup Codes view if MFA is enabled */}
          {mfaConfig?.mfaEnabled && mfaConfig.backupCodes.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                {isAr ? 'رموز إستعادة الطوارئ (Backup Codes)' : 'Emergency Backup Codes'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs">
                {mfaConfig.backupCodes.map((code, idx) => (
                  <div key={idx} className="tracking-wider text-center py-1 bg-slate-800 rounded">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500">
                {isAr ? 'احفظ هذه الرموز في مكان آمن لاستخدامها في حال فقدان هاتف المصادقة.' : 'Save these codes safely for emergency recovery.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
