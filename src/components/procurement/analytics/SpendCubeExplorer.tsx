import React, { useState } from 'react';
import {
  Box,
  Filter,
  Layers,
  Search,
  RefreshCw,
  Building2,
  Tag,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Sliders,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { SpendCubeData, SpendCubeFilter } from '../../../types/procurement';

interface SpendCubeExplorerProps {
  spendCubeData: SpendCubeData | null;
}

export const SpendCubeExplorer: React.FC<SpendCubeExplorerProps> = ({ spendCubeData }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [filter, setFilter] = useState<SpendCubeFilter>({
    category: 'ALL',
    region: 'ALL',
    department: 'ALL',
    businessUnit: 'ALL',
    year: 2026
  });

  const [primaryDimension, setPrimaryDimension] = useState<'category' | 'supplier' | 'department' | 'region' | 'project' | 'bu'>('category');
  const [secondaryDimension, setSecondaryDimension] = useState<'supplier' | 'department' | 'region' | 'project' | 'bu'>('supplier');

  if (!spendCubeData) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-800">
        <Box className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-bounce" />
        <p>{isAr ? 'جاري تحميل مكعب الإنفاق التفاعلي (Spend Cube)...' : 'Loading Interactive Spend Cube...'}</p>
      </div>
    );
  }

  const formatSAR = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)}M SAR`;
    }
    return `${(val / 1000).toFixed(0)}K SAR`;
  };

  const getDimensionData = (dim: string) => {
    switch (dim) {
      case 'category':
        return spendCubeData.categoryBreakdown;
      case 'supplier':
        return spendCubeData.supplierBreakdown;
      case 'department':
        return spendCubeData.departmentBreakdown;
      case 'region':
        return spendCubeData.regionBreakdown;
      case 'project':
        return spendCubeData.projectBreakdown;
      case 'bu':
        return spendCubeData.buBreakdown;
      default:
        return spendCubeData.categoryBreakdown;
    }
  };

  const primaryItems = getDimensionData(primaryDimension);
  const secondaryItems = getDimensionData(secondaryDimension);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              SPEND CUBE 7D
            </span>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Box className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مستكشف مكعب الإنفاق سباعي الأبعاد (7D Spend Cube Explorer)' : '7D Interactive Spend Cube Explorer'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'أداة الاستكشاف والتقطيع والتحليل التفاعلي للإنفاق عبر الموردين، الفئات، المناطق، الإدارات، المشاريع، وحدات الأعمال، والزمان'
              : 'Multi-dimensional slice & dice engine for Supplier, Category, Region, Department, Project, Business Unit, and Time'}
          </p>
        </div>

        <button
          onClick={() => setFilter({ category: 'ALL', region: 'ALL', department: 'ALL', businessUnit: 'ALL', year: 2026 })}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 self-start lg:self-center"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}</span>
        </button>
      </div>

      {/* FILTER BAR / SLICE & DICE CONTROLS */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'لوحة التحكم بفلترة وتصفية المكعب (Slice & Dice Controls)' : 'Cube Slicing & Filtering Parameters'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter Category */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">{isAr ? 'فئة الشراء:' : 'Category:'}</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{isAr ? 'جميع الفئات (All Categories)' : 'All Categories'}</option>
              <option value="Fuel">Fuel & Petroleum</option>
              <option value="Transportation">Transportation & Fleet</option>
              <option value="Warehousing">Warehousing & Storage</option>
              <option value="Equipment">Equipment & Maint</option>
              <option value="Customs">Customs & Freight</option>
            </select>
          </div>

          {/* Filter Region */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">{isAr ? 'المنطقة:' : 'Region:'}</label>
            <select
              value={filter.region}
              onChange={(e) => setFilter({ ...filter, region: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{isAr ? 'جميع المناطق (All Regions)' : 'All Regions'}</option>
              <option value="REG-RIYADH">الرياض (Central)</option>
              <option value="REG-EASTERN">الشرقية (Dammam)</option>
              <option value="REG-WESTERN">الغربية (Jeddah)</option>
              <option value="REG-GCC">دول الخليج (GCC)</option>
            </select>
          </div>

          {/* Filter Department */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">{isAr ? 'الإدارة:' : 'Department:'}</label>
            <select
              value={filter.department}
              onChange={(e) => setFilter({ ...filter, department: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{isAr ? 'جميع الإدارات (All Departments)' : 'All Departments'}</option>
              <option value="DEPT-FLEET">Fleet Operations</option>
              <option value="DEPT-WH">Warehousing</option>
              <option value="DEPT-CUSTOMS">Customs Logistics</option>
              <option value="DEPT-CORP">Corporate Facilities</option>
            </select>
          </div>

          {/* Filter BU */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">{isAr ? 'وحدة الأعمال BU:' : 'Business Unit:'}</label>
            <select
              value={filter.businessUnit}
              onChange={(e) => setFilter({ ...filter, businessUnit: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{isAr ? 'جميع وحدات الأعمال (All BUs)' : 'All Business Units'}</option>
              <option value="BU-SAUDI">AJA Saudi Logistics</option>
              <option value="BU-EXPRESS">AJA Express</option>
              <option value="BU-XBORDER">Cross-Border Freight</option>
            </select>
          </div>
        </div>
      </div>

      {/* MATRIX DRILL DOWN ENGINE */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'تحليل المصفوفة المتقاطعة (Cross-Filtering Matrix)' : 'Cross-Filtering Matrix & Pivot View'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{isAr ? 'البعد الأساسي:' : 'Primary Axis:'}</span>
              <select
                value={primaryDimension}
                onChange={(e) => setPrimaryDimension(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-amber-400 font-bold rounded-lg px-2.5 py-1 text-xs"
              >
                <option value="category">Category</option>
                <option value="supplier">Supplier</option>
                <option value="department">Department</option>
                <option value="region">Region</option>
                <option value="project">Project</option>
                <option value="bu">Business Unit</option>
              </select>
            </div>

            <span className="text-slate-600">×</span>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{isAr ? 'البعد الفرعي:' : 'Secondary Axis:'}</span>
              <select
                value={secondaryDimension}
                onChange={(e) => setSecondaryDimension(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-lg px-2.5 py-1 text-xs"
              >
                <option value="supplier">Supplier</option>
                <option value="category">Category</option>
                <option value="department">Department</option>
                <option value="region">Region</option>
                <option value="project">Project</option>
                <option value="bu">Business Unit</option>
              </select>
            </div>
          </div>
        </div>

        {/* SPEND CUBE GRID HEATMAP */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-800 text-slate-200 font-bold border-b border-slate-700">
              <tr>
                <th className="p-3 font-mono">{primaryDimension.toUpperCase()} \ {secondaryDimension.toUpperCase()}</th>
                {secondaryItems.slice(0, 4).map((sec, i) => (
                  <th key={i} className="p-3 text-center truncate max-w-[140px]">{sec.name}</th>
                ))}
                <th className="p-3 text-center">{isAr ? 'إجمالي البعد' : 'Axis Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {primaryItems.map((pri, idx) => {
                return (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-all">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>{pri.name}</span>
                    </td>
                    {secondaryItems.slice(0, 4).map((sec, secIdx) => {
                      // Simulated cross cell spend calculation
                      const cellValue = (pri.spendSAR * (sec.percentage / 100)).toFixed(0);
                      return (
                        <td key={secIdx} className="p-3 text-center font-mono text-slate-200 bg-slate-900/30">
                          {formatSAR(Number(cellValue))}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-mono font-bold text-amber-400 bg-slate-800/30">
                      {formatSAR(pri.spendSAR)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
