import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Thermometer,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Sliders,
  Sparkles,
  Search
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { StorageRule, WarehouseLocation } from '../../../types/warehouse';
import { WarehouseClient } from '../../../services/warehouseClient';

export const StorageRulesView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [rules, setRules] = useState<StorageRule[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadRulesData();
  }, []);

  const loadRulesData = async () => {
    setLoading(true);
    try {
      const [rulesData, whData] = await Promise.all([
        WarehouseClient.getStorageRules(),
        WarehouseClient.getWarehouses()
      ]);
      setRules(rulesData);
      setWarehouses(whData);
    } catch (err) {
      console.error('Error loading storage rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(r =>
    r.ruleNameAr.includes(searchTerm) ||
    r.ruleNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.strategy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              {isAr ? 'قواعد واستراتيجيات التخزين المتقدمة (Warehouse Storage Rules Engine)' : 'Storage Rules & Strategy Engine'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'تطبيق قواعد FIFO, FEFO, LIFO، التخزين حسب التشغيلة Batch، التحكم في المواد الخطرة والحرارة' : 'Rule enforcement for FIFO, FEFO, LIFO, Batch/Serial tracking, Hazmat and Thermal parameters'}
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all">
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة قاعدة تخزين جديدة' : 'New Storage Rule'}</span>
        </button>
      </div>

      {/* STRATEGY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1 shadow-sm">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>قواعد الأدوية والأغذية (FEFO)</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
            {rules.filter(r => r.strategy === 'FEFO').length} <span className="text-xs font-normal text-gray-500">قواعد نشطة</span>
          </div>
          <div className="text-[10px] text-rose-600 font-bold">صلاحيات المنتجات الحساسة</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1 shadow-sm">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>قواعد الوارد أولاً (FIFO)</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {rules.filter(r => r.strategy === 'FIFO').length} <span className="text-xs font-normal text-gray-500">قواعد نشطة</span>
          </div>
          <div className="text-[10px] text-amber-600 font-bold">تدفق المواد القياسية</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1 shadow-sm">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>المواد الخطرة (Hazmat)</span>
            <ShieldAlert className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-600">
            {rules.filter(r => r.strategy === 'HAZMAT').length} <span className="text-xs font-normal text-gray-500">تصاريح</span>
          </div>
          <div className="text-[10px] text-orange-600 font-bold">مطابقة معايير أمان المواد</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1 shadow-sm">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>التحكم بالمناخ والحرارة</span>
            <Thermometer className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-600">
            {rules.filter(r => r.minTempCelsius !== undefined).length} <span className="text-xs font-normal text-gray-500">منطقة مبردة</span>
          </div>
          <div className="text-[10px] text-cyan-600 font-bold">مراقبة على مدار الساعة</div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isAr ? 'بحث باسم القاعدة، الاستراتيجية (FIFO, FEFO, HAZMAT)...' : 'Search rule name or strategy...'}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
        />
      </div>

      {/* RULES LIST TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="p-4">{isAr ? 'اسم القاعدة والتفاصيل' : 'Rule Name & Details'}</th>
              <th className="p-4">{isAr ? 'استراتيجية التخزين' : 'Strategy'}</th>
              <th className="p-4">{isAr ? 'المستودع / المنطقة' : 'Warehouse / Zone'}</th>
              <th className="p-4">{isAr ? 'القيود والحرارة' : 'Thermal & Restrictions'}</th>
              <th className="p-4">{isAr ? 'مستوى الأمان' : 'Security Level'}</th>
              <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRules.map((rule) => {
              const wh = warehouses.find(w => w.id === rule.warehouseId);
              return (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 space-y-0.5">
                    <strong className="block text-gray-900 dark:text-gray-100">{rule.ruleNameAr}</strong>
                    <span className="text-[10px] text-gray-400">{rule.ruleNameEn}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      rule.strategy === 'FEFO'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : rule.strategy === 'FIFO'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : rule.strategy === 'HAZMAT'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {rule.strategy}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 font-bold">
                    {wh ? wh.nameAr : rule.warehouseId}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {rule.minTempCelsius !== undefined ? (
                      <span className="flex items-center gap-1 text-cyan-600 font-bold">
                        <Thermometer className="w-3.5 h-3.5" />
                        {rule.minTempCelsius}°C إلى {rule.maxTempCelsius}°C
                      </span>
                    ) : rule.hazmatLevel ? (
                      <span className="text-orange-600 font-bold">{rule.hazmatLevel}</span>
                    ) : (
                      'قياسي'
                    )}
                  </td>
                  <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      {rule.securityLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" />
                      {isAr ? 'مفعلة' : 'Active'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
