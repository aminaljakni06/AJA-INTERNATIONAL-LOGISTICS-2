import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  Plus, 
  Slash, 
  FileText,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { SoDRule, SoDViolation } from '../../../types/identityGovernance';

export const SoDRuleManagerView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [rules, setRules] = useState<SoDRule[]>([]);
  const [violations, setViolations] = useState<SoDViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'violations'>('rules');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const [rRes, vRes] = await Promise.all([
        fetch('/api/governance/sod/rules', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/governance/sod/violations', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (rRes.ok) setRules(await rRes.json());
      if (vRes.ok) setViolations(await vRes.json());
    } catch (err) {
      console.error('[SoDRuleManagerView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRule = async (rule: SoDRule) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const updated = { ...rule, enabled: !rule.enabled };
      const res = await fetch('/api/governance/sod/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('[ToggleSoD] Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-medium text-xs tracking-wider uppercase mb-1">
            <Slash className="w-4 h-4" />
            <span>{isAr ? 'محرك الفصل بين المهام والحظر التلقائي (SoD Engine)' : 'Separation of Duties (SoD) Framework'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'منع تضارب المصالح وحظر الصلاحيات المزدوجة' : 'Separation of Duties Rules & Active Violations'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'فرض قواعد الفصل بين المهام لمنع طالب الشحنة من اعتمادها، ولمنع منشئ الفواتير من الموافقة على الدفعات المالية، مع الحظر أو التدقيق المستمر.'
              : 'Prevent toxic combinations of roles and conflicting actions (Requester ≠ Approver, Billing ≠ Payout).'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'rules' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isAr ? 'قواعد الفصل بين المهام (SoD Rules)' : 'Configured Rules'}</span>
        </button>

        <button
          onClick={() => setActiveTab('violations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'violations' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>{isAr ? 'سجل المخالفات والمحاولات المحظورة' : 'Violation Audit Log'}</span>
          {violations.length > 0 && (
            <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">{violations.length}</span>
          )}
        </button>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map(rule => (
              <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {rule.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    rule.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rule.severity}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">{isAr ? 'التضارب:' : 'Conflicting Roles:'}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-900">{rule.conflictingRoleA} ⚡ {rule.conflictingRoleB}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">{isAr ? 'الإجراء عند التضارب:' : 'Enforcement:'}</span>
                    <span className={`font-bold ${rule.actionOnViolation === 'BLOCK' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {rule.actionOnViolation}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">{isAr ? 'تفعيل القاعدة' : 'Rule Active'}</span>
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      rule.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      rule.enabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : ''
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            {isAr ? 'المخالفات المسجلة ومحاولات خرق قواعد SoD' : 'Detected SoD Violations & Blocked Actions'}
          </h3>

          {violations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
              <span>{isAr ? 'لا توجد أي مخالفات SoD مسجلة، النظام متوافق تماماً.' : 'Zero SoD violations detected. System is compliant.'}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map(v => (
                <div key={v.id} className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">{v.ruleCode}</span>
                      <span className="font-bold text-slate-900 text-sm">{v.userName}</span>
                      <span className="text-xs text-rose-700 font-semibold font-mono">[{v.status}]</span>
                    </div>
                    <p className="text-xs text-slate-700">{v.details}</p>
                    <p className="text-[11px] text-slate-400">Attempted Action: {v.attemptedAction}</p>
                  </div>

                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    {new Date(v.timestamp).toLocaleString('ar-SA')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
