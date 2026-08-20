import React, { useState } from 'react';
import { Sliders, Layers, ShieldCheck, ListTodo, Users, Smartphone, ArrowDownRight, AlertOctagon, TrendingUp, Sparkles, Box, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { PutawayStrategyDashboard } from './PutawayStrategyDashboard';
import { DynamicSlottingCenter } from './DynamicSlottingCenter';
import { LocationOptimizationView } from './LocationOptimizationView';
import { TaskEngineCenter } from './TaskEngineCenter';
import { ResourceAssignmentBoard } from './ResourceAssignmentBoard';
import { MobileExecutionView } from './MobileExecutionView';
import { ReplenishmentCenter } from './ReplenishmentCenter';
import { ExceptionManagementCenter } from './ExceptionManagementCenter';
import { ExecutiveWESDashboard } from './ExecutiveWESDashboard';
import { AIExecutionCopilotView } from './AIExecutionCopilotView';

export const WarehouseExecutionMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<
    | 'putaway-rules'
    | 'slotting'
    | 'location-optimization'
    | 'task-engine'
    | 'resources'
    | 'mobile-execution'
    | 'replenishment'
    | 'exceptions'
    | 'executive-wes'
    | 'ai-wes-copilot'
  >('putaway-rules');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-600 to-orange-600 rounded-2xl text-white shadow-md">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isAr ? 'منصة تنفيذ وتوجيه العمليات الميدانية للمستودعات (WES Execution Platform)' : 'Enterprise Warehouse Execution System (WES)'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAr ? 'قواعد الإيداع Putaway، التوزيع التكتيكي Slotting، محرك المهام، إعادة التغذية، والمساعد الذكي AI' : 'Directed Putaway, ABC Slotting, Task Engine, Workload Assignment, Replenishment & AI Execution Copilot'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{isAr ? 'مُحرك WES متصل بـ AI' : 'WES Engine Online'}</span>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'putaway-rules', label: isAr ? 'قواعد الإيداع (Putaway Rules)' : 'Putaway Rules', icon: Sliders },
          { id: 'slotting', label: isAr ? 'التوزيع التكتيكي (Dynamic Slotting)' : 'Dynamic Slotting', icon: Layers },
          { id: 'location-optimization', label: isAr ? 'قيود الأرفف (Location Matrix)' : 'Location Optimization', icon: ShieldCheck },
          { id: 'task-engine', label: isAr ? 'مُحرك المهام (WES Task Engine)' : 'Task Engine', icon: ListTodo },
          { id: 'resources', label: isAr ? 'الموارد والمعدات (Resources)' : 'Resource Assignment', icon: Users },
          { id: 'mobile-execution', label: isAr ? 'الشاشة الميدانية (RF Mobile)' : 'Mobile Execution', icon: Smartphone },
          { id: 'replenishment', label: isAr ? 'إعادة التغذية (Replenishment)' : 'Replenishment', icon: ArrowDownRight },
          { id: 'exceptions', label: isAr ? 'معالجة الأعطال (Exceptions)' : 'Exceptions Management', icon: AlertOctagon },
          { id: 'executive-wes', label: isAr ? 'الأداء التنفيذي (Executive WES)' : 'Executive WES Dashboard', icon: TrendingUp },
          { id: 'ai-wes-copilot', label: isAr ? 'ذكاء التنفيذ AI' : 'AI Execution Copilot', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-6">
        {activeTab === 'putaway-rules' && <PutawayStrategyDashboard />}
        {activeTab === 'slotting' && <DynamicSlottingCenter />}
        {activeTab === 'location-optimization' && <LocationOptimizationView />}
        {activeTab === 'task-engine' && <TaskEngineCenter />}
        {activeTab === 'resources' && <ResourceAssignmentBoard />}
        {activeTab === 'mobile-execution' && <MobileExecutionView />}
        {activeTab === 'replenishment' && <ReplenishmentCenter />}
        {activeTab === 'exceptions' && <ExceptionManagementCenter />}
        {activeTab === 'executive-wes' && <ExecutiveWESDashboard />}
        {activeTab === 'ai-wes-copilot' && <AIExecutionCopilotView />}
      </div>
    </div>
  );
};

export default WarehouseExecutionMainView;
