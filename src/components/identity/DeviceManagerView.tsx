import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Laptop, ShieldCheck, ShieldAlert, ShieldX, MapPin, Clock, Fingerprint, Check, Ban } from 'lucide-react';
import { DeviceTrustStatus } from '../../types/identity';

export const DeviceManagerView: React.FC = () => {
  const { devices, setDeviceTrust, refreshIdentity } = useIdentity();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTrustChange = async (deviceId: string, status: DeviceTrustStatus) => {
    const res = await setDeviceTrust(deviceId, status);
    if (res.success) {
      setFeedback(isAr ? 'تم تحديث حالة ثقة الجهاز بنجاح' : 'Device trust status updated');
    } else {
      setFeedback(res.error || (isAr ? 'فشل تحديث حالة الجهاز' : 'Failed to update device status'));
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Laptop className="w-6 h-6 text-indigo-600" />
          {isAr ? 'إدارة الأجهزة الموثوقة (Device Registry)' : 'Trusted Device Manager'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {isAr 
            ? 'سجل الأجهزة ومتصفحات العمل المصرح لها بالوصول إلى حسابك المؤسسي مع البصمة الرقمية' 
            : 'Registered enterprise browsers and hardware devices with digital fingerprints.'}
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-medium">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-gray-500">
            {isAr ? 'لا توجد أجهزة مسجلة حالياً.' : 'No registered devices found.'}
          </div>
        ) : (
          devices.map((device) => {
            const isTrusted = device.trustStatus === 'TRUSTED';
            const isRevoked = device.trustStatus === 'REVOKED';

            return (
              <div
                key={device.deviceId}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        isTrusted 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : isRevoked
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        <Laptop className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {device.deviceName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {device.browser} • {device.os}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                      isTrusted 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                        : isRevoked
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>
                      {isTrusted && <ShieldCheck className="w-3.5 h-3.5" />}
                      {isRevoked && <ShieldX className="w-3.5 h-3.5" />}
                      {!isTrusted && !isRevoked && <ShieldAlert className="w-3.5 h-3.5" />}
                      {device.trustStatus}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5 text-xs text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'البصمة الرقمية:' : 'Fingerprint:'}</span>
                      <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-800 dark:text-slate-200">
                        {device.serialFingerprint}
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>IP: {device.ipAddress} ({device.location || 'المملكة العربية السعودية'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{isAr ? 'آخر ظهور:' : 'Last active:'} {new Date(device.lastActive).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-700">
                  {!isTrusted && (
                    <button
                      onClick={() => handleTrustChange(device.deviceId, 'TRUSTED')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isAr ? 'تعيين كجهاز موثوق' : 'Mark as Trusted'}
                    </button>
                  )}

                  {!isRevoked && (
                    <button
                      onClick={() => handleTrustChange(device.deviceId, 'REVOKED')}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      {isAr ? 'إلغاء الوصول (Revoke)' : 'Revoke Device'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
