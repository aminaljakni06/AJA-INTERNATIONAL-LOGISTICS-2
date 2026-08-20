import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  FileCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Download,
  Layers,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { FinancialStatementLine } from '../../../types/fixedAssetsReporting';

export const FinancialStatementsView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [lines, setLines] = useState<FinancialStatementLine[]>([]);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setLines(snapshot.financialStatements));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <BarChart3 className="w-4 h-4" />
            <span>{isAr ? 'منظومة القوائم المالية والمعايير الدولية (IFRS Financial Statements Hub)' : 'IFRS Financial Statements Hub (P&L, Balance Sheet, Cash Flow)'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'الميزانية العمومية، قائمة الدخل، التدفقات النقدية والتغير في حقوق الملكية' : 'Balance Sheet, Income Statement (P&L), Cash Flow & Comparative Reports'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'عرض وتوليد التقارير المالية المعتمدة مطابق لمعايير المحاسبة الدولية IFRS مع التحليل المقارن' : 'Generate IFRS compliant statements with multi-period variance analytics and drill-down capability.'}
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg font-mono">
          <Download className="w-4 h-4" />
          <span>{isAr ? 'تصدير القوائم (Export IFRS Statement)' : 'Export Financial Statements'}</span>
        </button>
      </div>

      {/* Financial Statement Rows */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase">{isAr ? 'القوائم المالية للشركة الموحدة (IFRS Balance Sheet & P&L)' : 'Consolidated IFRS Financial Statements Ledger'}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
                <th className="p-3">{isAr ? 'فئة الحساب' : 'Category'}</th>
                <th className="p-3">{isAr ? 'اسم البند / الحساب' : 'Line Item Name'}</th>
                <th className="p-3">{isAr ? 'الفترة الحالية (SAR)' : 'Current Period (SAR)'}</th>
                <th className="p-3">{isAr ? 'الفترة السابقة (SAR)' : 'Prior Period (SAR)'}</th>
                <th className="p-3">{isAr ? 'نسبة التغير (%)' : 'Variance (%)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {lines.map(line => (
                <tr key={line.id} className="hover:bg-slate-800/80">
                  <td className="p-3 font-bold text-sky-400">{line.accountCategory}</td>
                  <td className="p-3 font-bold text-white">{isAr ? line.accountNameAr : line.accountNameEn}</td>
                  <td className="p-3 font-extrabold text-emerald-400">SAR {line.currentPeriodSAR.toLocaleString()}</td>
                  <td className="p-3 text-slate-300">SAR {line.priorPeriodSAR.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`font-bold ${line.variancePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {line.variancePercent >= 0 ? `+${line.variancePercent}%` : `${line.variancePercent}%`}
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
