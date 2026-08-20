import React, { useState } from 'react';
import { Settings, Shield, Globe, Bell, CreditCard, Cpu, Wrench, Save, Check } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { SettingCategory, SystemSettingItem } from '../../types/config';

export const SystemSettingsForm: React.FC = () => {
  const { systemSettings, updateSetting } = useConfig();
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('SECURITY');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});

  const categories: { key: SettingCategory; name: string; icon: React.ReactNode }[] = [
    { key: 'SECURITY', name: 'الأمان والتصاريح', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { key: 'AUTHENTICATION', name: 'المصادقة والجلسات', icon: <Settings className="w-4 h-4 text-blue-400" /> },
    { key: 'LOCALIZATION', name: 'التوطين والعملات', icon: <Globe className="w-4 h-4 text-purple-400" /> },
    { key: 'NOTIFICATIONS', name: 'التنبيهات والإشعارات', icon: <Bell className="w-4 h-4 text-amber-400" /> },
    { key: 'PAYMENTS', name: 'بوابات الدفع', icon: <CreditCard className="w-4 h-4 text-teal-400" /> },
    { key: 'AI_PROVIDERS', name: 'الذكاء الاصطناعي', icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
    { key: 'MAINTENANCE', name: 'الصيانة والنظام', icon: <Wrench className="w-4 h-4 text-rose-400" /> },
  ];

  const categorySettings = systemSettings.filter((s) => s.category === activeCategory);

  const handleValueChange = (key: string, val: any) => {
    setEditingValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (setting: SystemSettingItem) => {
    const valToSave = editingValues[setting.key] !== undefined ? editingValues[setting.key] : setting.value;
    setSavingKey(setting.key);
    await updateSetting(setting.key, valToSave, setting.scope, setting.scopeId);
    setSavingKey(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat.key
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800/80">
        {categorySettings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">لا توجد إعدادات مسجلة في هذه الفئة.</div>
        ) : (
          categorySettings.map((setting) => {
            const currentValue = editingValues[setting.key] !== undefined ? editingValues[setting.key] : setting.value;
            const isDirty = editingValues[setting.key] !== undefined && editingValues[setting.key] !== setting.value;

            return (
              <div key={setting.key} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h4 className="text-sm font-bold text-white">{setting.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                      {setting.scope}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{setting.description}</p>
                  <code className="text-[11px] text-slate-500 font-mono">{setting.key}</code>
                </div>

                {/* Input Controls according to type */}
                <div className="flex items-center space-x-3 space-x-reverse min-w-[240px]">
                  {setting.valueType === 'BOOLEAN' ? (
                    <button
                      onClick={() => handleValueChange(setting.key, !currentValue)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        currentValue ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          currentValue ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  ) : setting.valueType === 'NUMBER' ? (
                    <input
                      type="number"
                      value={currentValue}
                      onChange={(e) => handleValueChange(setting.key, parseFloat(e.target.value))}
                      className="px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 w-full"
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleValueChange(setting.key, e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 w-full"
                    />
                  )}

                  <button
                    onClick={() => handleSave(setting)}
                    disabled={savingKey === setting.key}
                    className={`flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isDirty
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {savingKey === setting.key ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isDirty ? (
                      <Save className="w-3.5 h-3.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{isDirty ? 'حفظ' : 'محفوظ'}</span>
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
