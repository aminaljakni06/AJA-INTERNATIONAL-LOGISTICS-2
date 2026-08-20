import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Thermometer, Flame, ArrowUpRight, CheckCircle2, Layers, Shuffle, Clock, Plus, Zap } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { PutawayRule } from '../../../types/warehouseExecution';
import { WarehouseExecutionClient } from '../../../services/warehouseExecutionClient';

export const PutawayStrategyDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [rules, setRules] = useState<PutawayRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStrategyFilter, setActiveStrategyFilter] = useState<string>('ALL');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await WarehouseExecutionClient.getPutawayRules();
      setRules(data);
    } catch (err) {
      console.error('Error loading putaway rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(r => {
    if (activeStrategyFilter === 'ALL') return true;
    return r.putawayType === activeStrategyFilter || r.rotationStrategy === activeStrategyFilter;
  });

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-600" />
            <span>{isAr ? 'مُحرك قواعد وسياسات الإيداع والتخزين الموجه (Putaway Rule Engine)' : 'Putaway Rule & Rotation Engine'}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'إدارة التخزين الموجه Directed، العشوائي Random، الثابت، وقواعد FEFO/FIFO للمواد المبردة والخطرة' : 'Manage Directed, Random, Fixed, Overflow, Cold Storage FEFO and Hazmat Class Putaway Rules'}
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all">
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة قاعدة إيداع جديدة' : 'Add Putaway Rule'}</span>
        </button>
      </div>

      {/* STRATEGY SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{isAr ? 'التخزين الموجه المباشر' : 'Directed Putaway'}</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-gray-100">94.8%</div>
          <div className="text-[10px] text-emerald-600 font-bold">{isAr ? 'تخصيص آلي بدون إدخال يدوياً' : 'Auto bin allocation active'}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{isAr ? 'قواعد FEFO المبردة' : 'FEFO Expiry Strategy'}</span>
            <Thermometer className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400">100%</div>
          <div className="text-[10px] text-cyan-600 font-bold">{isAr ? 'الأقرب انتهاءً يُودع أولاً' : 'First Expire First Out'}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{isAr ? 'عزل المواد الخطرة Hazmat' : 'Hazmat Isolation'}</span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-black text-red-600 dark:text-red-400">Class 3 & 8</div>
          <div className="text-[10px] text-red-600 font-bold">{isAr ? 'منطقة معزولة ومحمية' : 'Class 3 Flammable isolated'}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{isAr ? 'الشحن العابر Cross-Dock' : 'Cross-Dock Bypass'}</span>
            <Shuffle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">12.5%</div>
          <div className="text-[10px] text-indigo-600 font-bold">{isAr ? 'تفريغ وتحميل مباشر' : 'Direct dock to dock'}</div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: isAr ? 'جميع القواعد' : 'All Rules' },
          { id: 'COLD_STORAGE', label: isAr ? 'تخزين مبرد (FEFO)' : 'Cold FEFO' },
          { id: 'HAZMAT', label: isAr ? 'مواد خطرة (Hazmat)' : 'Hazmat Rules' },
          { id: 'FAST_MOVING', label: isAr ? 'سريع الحركة (Class A)' : 'Fast Moving' },
          { id: 'CROSS_DOCK', label: isAr ? 'شحن عابر (Cross-Dock)' : 'Cross Dock' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveStrategyFilter(btn.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeStrategyFilter === btn.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* RULES LIST TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100">
          {isAr ? 'قواعد وسياسات التخزين النشطة بالمنظومة' : 'Active Putaway Strategy Rules'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-3">كود القاعدة</th>
                <th className="p-3">اسم القاعدة والوصف</th>
                <th className="p-3">نوع التخزين</th>
                <th className="p-3">استراتيجية الدوران</th>
                <th className="p-3">منطقة التخزين المستهدفة</th>
                <th className="p-3">الأولوية</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono font-black text-amber-600">{rule.ruleCode}</td>
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{rule.ruleNameAr}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {rule.putawayType}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      rule.rotationStrategy === 'FEFO'
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {rule.rotationStrategy}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-700 dark:text-gray-300">{rule.targetZoneCode}</td>
                  <td className="p-3 font-black text-amber-600">Priority #{rule.priorityOrder}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {rule.active ? 'مفعلة' : 'معطلة'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
