import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, RefreshCw, CheckCircle2, Filter, Database, Layers } from 'lucide-react';
import { DataQualityIssue } from '../../types/mdm';

export const DataQualityValidationView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const runAudit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/mdm/quality-audit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIssues(await res.json());
      }
    } catch (err) {
      console.error('[QualityAudit] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;

  const filteredIssues = issues.filter(i => severityFilter === 'ALL' || i.severity === severityFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner & Audit Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'محرك جودة البيانات ومطابقة الموثوقية' : 'Data Quality & Stewardship Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{isAr ? 'فحص ومراقبة دقة البيانات الرئيسية' : 'Master Data Quality Audit & Rules Monitor'}</h2>
          <p className="text-xs text-slate-500">
            {isAr ? 'يقوم المحرك التلقائي بالتحقق من الاكتمال، التكرار، الدقة الشكلية، ووجود الأمناء لكل مجال.' : 'Continuous compliance check for record completeness, uniqueness, format validity, and data stewardship.'}
          </p>
        </div>

        <button
          onClick={runAudit}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'بدء فحص الشمول والجودة' : 'Run Quality Audit'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'إجمالي الملاحظات' : 'Total Findings'}</p>
            <h3 className="text-2xl font-black text-slate-900">{issues.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'حرجة (Critical)' : 'Critical Errors'}</p>
            <h3 className="text-2xl font-black text-rose-600">{criticalCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'عالية (High)' : 'High Severity'}</p>
            <h3 className="text-2xl font-black text-amber-600">{highCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sky-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'متوسطة (Medium)' : 'Medium Severity'}</p>
            <h3 className="text-2xl font-black text-sky-600">{mediumCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Issue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">{isAr ? 'قائمة المشاكل والفرص المكتشفة' : 'Audit Findings & Actionable Remediation'}</h3>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">{isAr ? 'جميع مستويات الخطورة' : 'All Severities'}</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="p-3">{isAr ? 'الخطورة' : 'Severity'}</th>
                <th className="p-3">{isAr ? 'المجال' : 'Domain'}</th>
                <th className="p-3">{isAr ? 'السجل الرئيسي' : 'Master Record'}</th>
                <th className="p-3">{isAr ? 'نوع قاعدة الجودة' : 'Quality Rule'}</th>
                <th className="p-3">{isAr ? 'تفاصيل الملاحظة' : 'Issue Description'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      issue.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                      issue.severity === 'MEDIUM' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {issue.severity}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-slate-600 font-bold">{issue.domain}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    <div>{issue.recordCode}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{issue.recordName}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono rounded text-[10px]">
                      {issue.ruleType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{issue.message}</td>
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {isAr ? 'لا توجد ملاحظات أو أخطاء جودة مطابقة!' : 'No quality issues match your filter criteria!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
