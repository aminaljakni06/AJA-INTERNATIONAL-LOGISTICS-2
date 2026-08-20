import React, { useState } from 'react';
import {
  Layers,
  Building2,
  GitBranch,
  Target,
  Truck,
  Box,
  Plus,
  CheckCircle2,
  XCircle,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { FinancialDimensionValue, FinancialDimensionType } from '../../types/generalLedger';

interface FinancialDimensionsViewProps {
  dimensions: FinancialDimensionValue[];
  onAddDimension: (dim: Omit<FinancialDimensionValue, 'id'>) => void;
}

export const FinancialDimensionsView: React.FC<FinancialDimensionsViewProps> = ({
  dimensions,
  onAddDimension
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeDimensionType, setActiveDimensionType] = useState<FinancialDimensionType>('COST_CENTER');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');

  const dimensionTypesList: { type: FinancialDimensionType; labelEn: string; labelAr: string; icon: any }[] = [
    { type: 'COMPANY', labelEn: 'Company', labelAr: 'الشركة الحسابية', icon: Building2 },
    { type: 'BRANCH', labelEn: 'Branch', labelAr: 'الفرع التشغيلي', icon: GitBranch },
    { type: 'COST_CENTER', labelEn: 'Cost Center', labelAr: 'مركز التكلفة', icon: Target },
    { type: 'PROJECT', labelEn: 'Project', labelAr: 'المشروع', icon: Sliders },
    { type: 'VEHICLE', labelEn: 'Vehicle / Fleet', labelAr: 'المركبة / الأسطول', icon: Truck },
    { type: 'WAREHOUSE', labelEn: 'Warehouse', labelAr: 'المستودع', icon: Box }
  ];

  const currentTypeDimensions = dimensions.filter(d => d.dimensionType === activeDimensionType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !nameEn || !nameAr) return;

    onAddDimension({
      dimensionType: activeDimensionType,
      code,
      nameEn,
      nameAr,
      isActive: true,
      companyId: 'comp-101'
    });

    setIsModalOpen(false);
    setCode('');
    setNameEn('');
    setNameAr('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-400" />
            <span>{isAr ? 'الأبعاد والقطاعات المالية (Financial Dimensions)' : 'Financial Dimensions & Cost Centers'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'ربط قيود اليومية بمراكز التكلفة، الفروع، المشاريع، المركبات والمستودعات' : 'Configure dimension tags required for General Ledger transaction analytics'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة قيمة بعد جديد' : 'Add Dimension Value'}</span>
        </button>
      </div>

      {/* Dimension Types Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {dimensionTypesList.map(item => {
          const Icon = item.icon;
          const isActive = activeDimensionType === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setActiveDimensionType(item.type)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-700/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{isAr ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Dimensions Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <span>{isAr ? 'قائمة القيم المسجلة للبعد:' : 'Active Values for:'}</span>
            <span className="text-emerald-400 font-mono">
              {dimensionTypesList.find(d => d.type === activeDimensionType)?.labelEn}
            </span>
          </span>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-mono">
            {currentTypeDimensions.length} {isAr ? 'سجلات' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">{isAr ? 'الرمز Code' : 'Code'}</th>
                <th className="px-4 py-3">{isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}</th>
                <th className="px-4 py-3">{isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}</th>
                <th className="px-4 py-3">{isAr ? 'الشركة المالكة' : 'Company'}</th>
                <th className="px-4 py-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentTypeDimensions.map(dim => (
                <tr key={dim.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{dim.code}</td>
                  <td className="px-4 py-3 text-white font-medium">{dim.nameEn}</td>
                  <td className="px-4 py-3 text-slate-200">{dim.nameAr}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{dim.companyId}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {isAr ? 'نشط' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {isAr ? 'إضافة قيمة جديدة للبعد المالي' : 'Add Financial Dimension Value'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  {isAr ? 'الرمز Code' : 'Code'}
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. CC-EAST-02"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  {isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. Eastern Region Fleet"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  {isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="مثال: أسطول المنطقة الشرقية"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {isAr ? 'إضافة' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
