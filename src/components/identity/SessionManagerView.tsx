import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Monitor, Smartphone, Globe, ShieldAlert, LogOut, CheckCircle, Clock, Trash2, RefreshCw } from 'lucide-react';

export const SessionManagerView: React.FC = () => {
  const { sessions, revokeSession, revokeOtherSessions, refreshIdentity } = useIdentity();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRevokeSingle = async (sessionId: string) => {
    setIsProcessing(true);
    const res = await revokeSession(sessionId);
    setIsProcessing(false);
    if (res.success) {
      setFeedback(isAr ? 'تم إنهاء الجلسة بنجاح' : 'Session terminated successfully');
    } else {
      setFeedback(res.error || (isAr ? 'فشل إنهاء الجلسة' : 'Failed to terminate session'));
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRevokeOthers = async () => {
    setIsProcessing(true);
    const res = await revokeOtherSessions();
    setIsProcessing(false);
    if (res.success) {
      setFeedback(isAr ? 'تم إنهاء جميع الجلسات الأخرى بنجاح' : 'All other sessions terminated successfully');
    } else {
      setFeedback(res.error || (isAr ? 'فشل إنهاء الجلسات' : 'Failed to terminate sessions'));
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Monitor className="w-6 h-6 text-blue-600" />
            {isAr ? 'إدارة الجلسات النشطة (Session Manager)' : 'Active Session Manager'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {isAr 
              ? 'مراقبة وإدارة جميع المتصفحات والأجهزة المتصلة بحسابك حالياً في الوقت الفعلي' 
              : 'Monitor and terminate active sessions across all devices in real-time.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshIdentity()}
            className="p-2.5 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeOthers}
              disabled={isProcessing}
              className="px-4 py-2.5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isAr ? 'إنهاء كافة الجلسات الأخرى' : 'Terminate All Other Sessions'}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-300 text-sm font-medium">
          {feedback}
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-gray-500">
            {isAr ? 'لا توجد جلسات نشطة مسجلة حالياً.' : 'No active sessions found.'}
          </div>
        ) : (
          sessions.map((sess, idx) => {
            const isMobile = sess.os === 'iOS' || sess.os === 'Android';

            return (
              <div
                key={sess.sessionId}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-gray-200 dark:hover:border-slate-600"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-xl">
                    {isMobile ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {sess.deviceName || `${sess.browser} on ${sess.os}`}
                      </h4>
                      {idx === 0 && (
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {isAr ? 'الجلسة الحالية' : 'Current Session'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        IP: {sess.ipAddress}
                      </span>
                      <span>•</span>
                      <span>{sess.browser} ({sess.os})</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {isAr ? 'آخر نشاط:' : 'Last active:'} {new Date(sess.lastActivityAt).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t md:border-t-0 border-gray-100 dark:border-slate-700 pt-3 md:pt-0">
                  <button
                    onClick={() => handleRevokeSingle(sess.sessionId)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isAr ? 'إنهاء الجلسة' : 'Revoke Session'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
