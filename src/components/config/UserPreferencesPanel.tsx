import React from 'react';
import { User, Moon, Sun, Globe, Clock, DollarSign, Bell } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';

export const UserPreferencesPanel: React.FC = () => {
  const { userPreferences, updateUserPreferences } = useConfig();

  const handleChannelToggle = (channel: 'email' | 'sms' | 'whatsapp' | 'push') => {
    updateUserPreferences({
      notificationChannels: {
        ...userPreferences.notificationChannels,
        [channel]: !userPreferences.notificationChannels[channel],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          تفضلات المستخدم والمظهر (Personal User Preferences & Workspace)
        </h2>
        <p className="text-xs text-slate-400">
          تخصيص اللغة، المظهر، النطاق الزمني، والعملة وقنوات الإشعارات المفضلة لحسابك
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual & Localization Preferences */}
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe className="w-4 h-4 text-emerald-400" />
            التوطين والعرض Visual & Regional
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">اللغة المفضلة (Language)</label>
              <select
                value={userPreferences.language}
                onChange={(e) => updateUserPreferences({ language: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">المظهر (Theme)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateUserPreferences({ theme: t })}
                    className={`flex items-center justify-center space-x-1 space-x-reverse px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      userPreferences.theme === t
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {t === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">المنطقة الزمنية (Timezone)</label>
              <select
                value={userPreferences.timezone}
                onChange={(e) => updateUserPreferences({ timezone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">العملة المفضلة (Preferred Currency)</label>
              <select
                value={userPreferences.currency}
                onChange={(e) => updateUserPreferences({ currency: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Channels Preference */}
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-amber-400" />
            قنوات التنبيهات المفضلة Notification Channels
          </h3>

          <div className="space-y-3">
            {[
              { key: 'email', label: 'الإشعارات عبر البريد الإلكتروني (Email)' },
              { key: 'sms', label: 'الرسائل النصية القصيرة (SMS Messages)' },
              { key: 'whatsapp', label: 'تنبيهات وتحديثات واتساب (WhatsApp Business)' },
              { key: 'push', label: 'إشعارات المتصفح والتطبيق (Push Notifications)' },
            ].map((ch) => {
              const channelKey = ch.key as 'email' | 'sms' | 'whatsapp' | 'push';
              const enabled = userPreferences.notificationChannels[channelKey];
              return (
                <div key={ch.key} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">{ch.label}</span>
                  <button
                    onClick={() => handleChannelToggle(channelKey)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enabled ? 'bg-amber-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
