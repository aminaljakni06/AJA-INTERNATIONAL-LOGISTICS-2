import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Building, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Clock, 
  UserCheck, 
  Shield 
} from 'lucide-react';
import { DelegatedAdminRecord } from '../../../types/identityGovernance';

export const DelegatedAdminView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [delegates, setDelegates] = useState<DelegatedAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [adminUserId, setAdminUserId] = useState('');
  const [adminUserName, setAdminUserName] = useState('');
  const [scopeType, setScopeType] = useState<'COMPANY' | 'BRANCH' | 'DEPARTMENT'>('BRANCH');
  const [scopeId, setScopeId] = useState('');
  const [scopeName, setScopeName] = useState('');
  const [durationDays, setDurationDays] = useState(30);

  const fetchDelegates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/delegated-admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDelegates(await res.json());
    } catch (err) {
      console.error('[DelegatedAdminView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelegates();
  }, []);

  const handleAssign = async () => {
    if (!adminUserName || !scopeName) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/delegated-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminUserId: adminUserId || 'usr_delegated',
          adminUserName,
          scopeType,
          scopeId: scopeId || `scope_${Date.now()}`,
          scopeName,
          durationDays
        })
      });

      if (res.ok) {
        setShowModal(false);
        setAdminUserName('');
        setScopeName('');
        fetchDelegates();
      }
    } catch (err) {
      console.error('[AssignDelegate] Error:', err);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/governance/delegated-admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchDelegates();
    } catch (err) {
      console.error('[RevokeDelegate] Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
            <Shield className="w-4 h-4" />
            <span>{isAr ? 'الإدارة التفويضية المقيدة النطاق (Delegated Administration)' : 'Delegated Administration Framework'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'تفويض الصلاحيات الإدارية حسب الشركات، الفروع والأقسام' : 'Scope-Bound Admin Delegations'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'تمكين مدراء الفروع والأقسام والشركات التابعة من إدارة مستخدميهم ضمن حدودهم الجغرافية والإدارية دون صلاحيات فائقة على كامل النظام.'
              : 'Empower company, branch, and department managers to administer users strictly within their scope.'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مسؤول مفوض جديد' : 'Assign Delegated Admin'}</span>
        </button>
      </div>

      {/* Grid of Delegated Admins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {delegates.map(del => (
          <div key={del.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                del.scopeType === 'COMPANY' ? 'bg-purple-100 text-purple-800' :
                del.scopeType === 'BRANCH' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {del.scopeType} ADMIN
              </span>

              <button 
                onClick={() => handleRevoke(del.id)}
                className="text-slate-400 hover:text-rose-600 transition p-1"
                title={isAr ? 'إلغاء التفويض' : 'Revoke Delegation'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base">{del.adminUserName}</h4>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                {del.scopeType === 'BRANCH' && <MapPin className="w-3.5 h-3.5 text-amber-600" />}
                {del.scopeType === 'COMPANY' && <Building className="w-3.5 h-3.5 text-purple-600" />}
                {del.scopeType === 'DEPARTMENT' && <Briefcase className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="font-medium text-slate-700">{del.scopeName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Granted by: {del.grantedBy}</span>
              {del.expiresAt && (
                <span className="text-amber-700 font-mono">Expires: {new Date(del.expiresAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">{isAr ? 'إسناد تفويض إداري جديد' : 'Assign Scope-Bound Delegated Admin'}</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'اسم المسؤول المفوض' : 'Admin User Name'}</label>
              <input 
                type="text"
                value={adminUserName}
                onChange={e => setAdminUserName(e.target.value)}
                placeholder="e.g. Abdullah - Riyadh Operations Lead"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'نطاق التفويض (Scope)' : 'Delegation Scope'}</label>
              <select
                value={scopeType}
                onChange={e => setScopeType(e.target.value as any)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="BRANCH">BRANCH (مسؤول فرع تشغيلي)</option>
                <option value="DEPARTMENT">DEPARTMENT (مسؤول قسم إداري)</option>
                <option value="COMPANY">COMPANY (مسؤول شركة تابعة)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'اسم الفرع/القسم/الشركة' : 'Scope Name'}</label>
              <input 
                type="text"
                value={scopeName}
                onChange={e => setScopeName(e.target.value)}
                placeholder="e.g. Dammam Logistics Hub"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                {isAr ? 'حفظ وإسناد' : 'Assign Delegation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
