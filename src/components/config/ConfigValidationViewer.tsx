import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, RefreshCw } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';

export const ConfigValidationViewer: React.FC = () => {
  const { validationIssues, refreshConfig } = useConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            فاحص تكامل وإشعارات التهيئة (Configuration Integrity Diagnostics)
          </h2>
          <p className="text-xs text-slate-400">
            فحص أوتوماتيكي لكشف التعارضات التراكمية، الاعتماديات الدائرية، والأنواع غير المطابقة
          </p>
        </div>

        <button
          onClick={refreshConfig}
          className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة الفحص الان</span>
        </button>
      </div>

      {validationIssues.length === 0 ? (
        <div className="p-8 bg-slate-900 rounded-2xl border border-emerald-500/20 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">التهيئة سليمة 100% وخالية من أي تعارضات</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            تم فحص جميع الإعدادات العامة والوظيفية ومفاتيح الميزات المتزامنة ولم يتم رصد أي تعارض دائري أو قيم مفقودة.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800">
          {validationIssues.map((issue, idx) => (
            <div key={idx} className="p-4 flex items-start space-x-3 space-x-reverse">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  issue.severity === 'ERROR'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {issue.severity === 'ERROR' ? (
                  <AlertOctagon className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-xs font-bold text-white">{issue.key}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      issue.severity === 'ERROR'
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {issue.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{issue.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
