import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Lock, 
  LogOut, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound,
  X
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { CustomerProfileDoc } from '../../types/firestore';

export const CustomerProfile: React.FC = () => {
  const { user, token, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('السعودية');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Account Deletion Modal State
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  // Status Alerts
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletionMsg, setDeletionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch full profile info on load
  const fetchProfileDetails = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const userData = data.user;
        const custData: CustomerProfileDoc | null = data.customerProfile;

        setFullName(userData?.displayName || userData?.fullName || '');
        setEmail(userData?.email || '');
        setPhone(userData?.phone || custData?.phone || '');
        setCompanyName(custData?.companyName || '');
        setAddress(custData?.address || '');
        setCity(custData?.city || '');
        setCountry(custData?.country || 'السعودية');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [token]);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setProfileMsg({ type: 'error', text: 'يرجى إدخال الحقول الأساسية: الاسم، البريد، ورقم الهاتف' });
      return;
    }

    setSavingProfile(true);
    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        companyName: companyName.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
      });

      if (result.success) {
        setProfileMsg({ type: 'success', text: 'تم تحديث البيانات الشخصية ومعلومات التواصل بنجاح!' });
      } else {
        setProfileMsg({ type: 'error', text: result.error || 'فشل تحديث البيانات' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'يرجى تعبئة جميع حقول كلمة المرور' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'فشل تغيير كلمة المرور' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'حدث خطأ في الاتصال بالشبكة' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Account Deletion Request
  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletionMsg(null);
    setRequestingDeletion(true);

    try {
      const res = await fetch('/api/auth/request-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: deletionReason.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setDeletionMsg({ type: 'success', text: data.message });
        setShowDeletionModal(false);
        setDeletionReason('');
      } else {
        setDeletionMsg({ type: 'error', text: data.error || 'فشل رفع طلب الحذف' });
      }
    } catch {
      setDeletionMsg({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
    } finally {
      setRequestingDeletion(false);
    }
  };

  if (loading) return <LoadingSpinner label="جاري تحميل بيانات الملف الشخصي..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#082F49] dark:text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-[#EA580C]" />
            الملف الشخصي وإعدادات الحساب
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بياناتك الشخصية، معلومات التواصل، العنوان، وأمان حسابك في منصة شركة أجا اللوجستية
          </p>
        </div>

        <Button
          variant="outline"
          onClick={logout}
          className="gap-2 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 font-bold self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>

      {deletionMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            deletionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {deletionMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold">{deletionMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Personal Data Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="بيانات العميل ومعلومات التواصل">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <Input
                  label="الاسم الكامل *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: محمد أحمد علي"
                  required
                />

                {/* Email Address */}
                <Input
                  label="البريد الإلكتروني *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />

                {/* Phone Number */}
                <Input
                  label="رقم الجوال / الهاتف *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0500000000"
                  required
                />

                {/* Company Name */}
                <Input
                  label="اسم الشركة / المؤسسة (اختياري)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: شركة النقل المتقدمة"
                />

                {/* Address */}
                <Input
                  label="العنوان الوطني / الحي والشارع"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: طريق الملك فهد - حي العليا"
                />

                {/* City */}
                <Input
                  label="المدينة"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: الرياض"
                />

                {/* Country */}
                <Input
                  label="الدولة"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="مثال: المملكة العربية السعودية"
                />

                {/* Protected Role Notice */}
                <div className="flex flex-col justify-end">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      نوع الحساب والصلاحيات:
                    </span>
                    <p className="text-slate-500 font-bold">
                      حساب عميل مفعّل ({user?.role === 'CUSTOMER' ? 'عميل مسجل' : user?.role})
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={savingProfile}
                  className="bg-[#082F49] hover:bg-[#0F4C75] text-white font-bold gap-2 text-xs px-6 py-2.5 rounded-xl border border-[#0F4C75]"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التغييرات</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar: Password Change & Security Options */}
        <div className="space-y-6">
          <Card title="تغيير كلمة المرور والأمان">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <Input
                label="كلمة المرور الحالية *"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="كلمة المرور الجديدة *"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 خانات على الأقل"
                required
              />

              <Input
                label="تأكيد كلمة المرور الجديدة *"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                variant="secondary"
                isLoading={changingPassword}
                className="w-full gap-2 text-xs font-bold py-2.5 rounded-xl"
              >
                <KeyRound className="w-4 h-4" />
                <span>تحديث كلمة المرور</span>
              </Button>
            </form>
          </Card>

          {/* Danger Zone: Account Deletion */}
          <Card className="border-rose-200 bg-rose-50/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>طلب إغلاق وحذف الحساب</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                في حال رغبتك في إغلاق حسابك وحذف بياناتك نهائياً من المنظومة، يمكنك تقديم طلب رسمي للإدارة.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeletionModal(true)}
                className="w-full text-xs font-bold border-rose-300 text-rose-700 hover:bg-rose-100/70"
              >
                تقديم طلب حذف الحساب
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Account Deletion Request Modal */}
      {showDeletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>طلب حذف الحساب والبيانات</span>
              </div>
              <button
                onClick={() => setShowDeletionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              يرجى توضيح سبب الطلب (اختياري). عند رفع هذا الطلب، سيتواصل معك فريق خدمة العملاء لتأكيد تسوية الشحنات والالتزامات ثم إكمال إجراءات الحذف.
            </p>

            <form onSubmit={handleRequestDeletion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب طلب الحذف (اختياري)</label>
                <textarea
                  rows={3}
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="اكتب سبب طلب الحذف أو أي ملاحظات أخرى..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  isLoading={requestingDeletion}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl"
                >
                  تأكيد وإرسال الطلب
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeletionModal(false)}
                  className="text-xs border-slate-300 text-slate-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
