import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User, Shield, Building, MapPin, Briefcase, Mail, Phone, Calendar, CheckCircle2, AlertCircle, Edit3, Save, X } from 'lucide-react';

export const IdentityProfileView: React.FC = () => {
  const { profile, updateProfile, isLoading } = useIdentity();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    secondaryEmail: profile?.secondaryEmail || '',
    timezone: profile?.timezone || 'Asia/Riyadh',
    preferredLanguage: profile?.preferredLanguage || 'ar',
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        {isAr ? 'جاري تحميل سجل الهوية...' : 'Loading Identity Profile...'}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-800 dark:text-yellow-300">
        {isAr ? 'لم يتم العثور على سجل هوية مسجل للمستخدم الحالي.' : 'No identity record found for current user.'}
      </div>
    );
  }

  const handleSave = async () => {
    const res = await updateProfile(formData);
    if (res.success) {
      setSaveMessage(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      setIsEditing(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage(res.error || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving changes'));
    }
  };

  return (
    <div className="space-y-6">
      {saveMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{saveMessage}</span>
          <button onClick={() => setSaveMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md shadow-blue-500/20">
              {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h2>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  profile.accountStatus === 'ACTIVE' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                }`}>
                  {profile.accountStatus}
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                  {profile.identityType}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-4">
                <span>ID: {profile.identityId}</span>
                {profile.employeeId && <span>• {isAr ? 'الرقم الوظيفي:' : 'Emp ID:'} {profile.employeeId}</span>}
                {profile.customerId && <span>• {isAr ? 'رقم العميل:' : 'Cust ID:'} {profile.customerId}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-xl transition flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {isAr ? 'تعديل البيانات' : 'Edit Profile'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isAr ? 'حفظ' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            {isAr ? 'البيانات الشخصية والاتصال' : 'Personal & Contact Info'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'البريد الإلكتروني الأساسي' : 'Primary Email'}</label>
              <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {profile.primaryEmail}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'البريد الإلكتروني الثانوي' : 'Secondary Email'}</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              ) : (
                <div className="text-sm text-gray-700 dark:text-slate-300 mt-0.5">
                  {profile.secondaryEmail || (isAr ? 'غير محدد' : 'Not set')}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'رقم الهاتف الأساسي' : 'Primary Phone'}</label>
              <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {profile.primaryPhone || (isAr ? 'غير محدد' : 'Not set')}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'المنطقة الزمنية واللغة' : 'Timezone & Language'}</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as any })}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English</option>
                  </select>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-700 dark:text-slate-300 mt-0.5">
                  {profile.preferredLanguage === 'ar' ? 'العربية' : 'English'} • {profile.timezone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organizational Context & Security Level */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
            <Building className="w-5 h-5 text-indigo-600" />
            {isAr ? 'السياق المؤسسي والمستوى الأمنية' : 'Organizational Context & Security'}
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'الشركة' : 'Company'}</label>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                  {profile.companyName || (isAr ? 'شركة أجا للخدمات اللوجستية' : 'Aja Logistics Co.')}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'الفرع' : 'Branch'}</label>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                  {profile.branchName || (isAr ? 'الفرع الرئيسي - الرياض' : 'Main Branch - Riyadh')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'القسم' : 'Department'}</label>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                  {profile.departmentName || (isAr ? 'إدارة العمليات اللوجستية' : 'Logistics Operations')}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'المسؤول المباشر' : 'Manager'}</label>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                  {profile.managerName || (isAr ? 'إدارة الموارد البشرية' : 'HR Dept')}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'مستوى الأمان (Security Level)' : 'Security Clearance Level'}</label>
                <div className="flex items-center gap-1.5 mt-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-2 rounded-full ${
                        idx < profile.securityLevel 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                          : 'bg-gray-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300 ml-2">
                    L{profile.securityLevel}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{isAr ? 'آخر تسجيل دخول' : 'Last Login'}</label>
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-1">
                  {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString(isAr ? 'ar-SA' : 'en-US') : (isAr ? 'الآن' : 'Just now')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
