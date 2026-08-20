import React, { useState } from 'react';
import { Sliders, ToggleRight, Layers, User, ShieldCheck } from 'lucide-react';
import { SystemSettingsForm } from '../../components/config/SystemSettingsForm';
import { FeatureFlagManager } from '../../components/config/FeatureFlagManager';
import { ModuleConfigStatusCard } from '../../components/config/ModuleConfigStatusCard';
import { UserPreferencesPanel } from '../../components/config/UserPreferencesPanel';
import { ConfigValidationViewer } from '../../components/config/ConfigValidationViewer';
import { useConfig } from '../../hooks/useConfig';

export const AdminConfigCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'FLAGS' | 'MODULES' | 'PREFS' | 'VALIDATION'>('SETTINGS');
  const { systemSettings, featureFlags, moduleConfigs, validationIssues } = useConfig();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Configuration & Feature Flag Center</h1>
              <p className="text-xs text-slate-400">
                Single Source of Truth for ERP System Settings, Hierarchical Overrides, Canary Feature Flags & Diagnostics
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'SETTINGS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 ml-1.5" />
            إعدادات النظام ({systemSettings.length})
          </button>

          <button
            onClick={() => setActiveTab('FLAGS')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'FLAGS' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ToggleRight className="w-4 h-4 ml-1.5" />
            مفاتيح الميزات ({featureFlags.length})
          </button>

          <button
            onClick={() => setActiveTab('MODULES')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'MODULES' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 ml-1.5" />
            حالات الوحدات ({moduleConfigs.length})
          </button>

          <button
            onClick={() => setActiveTab('PREFS')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'PREFS' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 ml-1.5" />
            تفضلات الحساب
          </button>

          <button
            onClick={() => setActiveTab('VALIDATION')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'VALIDATION' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 ml-1.5" />
            فحص التهيئة ({validationIssues.length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {activeTab === 'SETTINGS' && <SystemSettingsForm />}
        {activeTab === 'FLAGS' && <FeatureFlagManager />}
        {activeTab === 'MODULES' && <ModuleConfigStatusCard />}
        {activeTab === 'PREFS' && <UserPreferencesPanel />}
        {activeTab === 'VALIDATION' && <ConfigValidationViewer />}
      </div>
    </div>
  );
};
