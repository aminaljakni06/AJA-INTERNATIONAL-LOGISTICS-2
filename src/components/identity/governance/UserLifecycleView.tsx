import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  UserPlus, 
  ArrowRightLeft, 
  UserMinus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Building2,
  GitCommit,
  ShieldCheck,
  Send,
  UserCheck
} from 'lucide-react';
import { LifecycleEventRecord, MoverRequest } from '../../../types/identityGovernance';
import { IdentityProfile } from '../../../types/identity';

export const UserLifecycleView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'joiner' | 'mover' | 'leaver' | 'timeline'>('joiner');
  const [events, setEvents] = useState<LifecycleEventRecord[]>([]);
  const [movers, setMovers] = useState<MoverRequest[]>([]);
  const [users, setUsers] = useState<IdentityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [dept, setDept] = useState('');
  const [branch, setBranch] = useState('');
  const [leaverReason, setLeaverReason] = useState('Employment Terminated');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const [evRes, mvRes, usrRes] = await Promise.all([
        fetch('/api/governance/lifecycle/events', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/governance/lifecycle/mover', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/identity/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (evRes.ok) setEvents(await evRes.json());
      if (mvRes.ok) setMovers(await mvRes.json());
      if (usrRes.ok) setUsers(await usrRes.json());
    } catch (err) {
      console.error('[UserLifecycleView] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExecuteJoiner = async () => {
    if (!selectedUserId) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/lifecycle/joiner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          onboardingData: {
            role,
            departmentName: dept || 'Logistics Operations',
            branchName: branch || 'Riyadh Central Hub'
          }
        })
      });

      if (res.ok) {
        setMessage(isAr ? 'تم تشغيل إجراءات تهيئة الموظف الجديد (Joiner Workflow) بنجاح' : 'Joiner onboarding executed successfully');
        fetchData();
      }
    } catch (err) {
      console.error('[Joiner] Error:', err);
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleExecuteLeaver = async () => {
    if (!selectedUserId) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/lifecycle/leaver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          reason: leaverReason
        })
      });

      if (res.ok) {
        setMessage(isAr ? 'تم تنشيط مسار إنهاء الخدمة وإنهاء الوصول (Leaver Offboarding) بنجاح' : 'Leaver offboarding completed successfully');
        fetchData();
      }
    } catch (err) {
      console.error('[Leaver] Error:', err);
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
            <GitCommit className="w-4 h-4" />
            <span>{isAr ? 'إدارة دورة حياة الهوية (Joiner / Mover / Leaver Engine)' : 'Identity Lifecycle Orchestration'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'أتمتة انضمام وتنقل وإنهاء خدمة الهويات' : 'User Lifecycle & Onboarding Automation'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'أتمتة التهيئة التلقائية للأنظمة، النقل الإداري بين الفروع والأقسام، والتجريد الفوري للأنظمة والأصول عند مغادرة المنظمة.'
              : 'Automated identity onboarding, department/branch mobility transfers, and instant offboarding checklists.'}
          </p>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Sub-tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('joiner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'joiner' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAr ? 'الانضمام والتهيئة (Joiner)' : 'Joiner Onboarding'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'mover' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{isAr ? 'النقل والتنقل الإداري (Mover)' : 'Mover Mobility'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaver')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'leaver' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>{isAr ? 'إنهاء الخدمة وتجريد الوصول (Leaver)' : 'Leaver Offboarding'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeSubTab === 'timeline' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isAr ? 'سجل أحداث دورة الحياة' : 'Lifecycle Audit Log'}</span>
        </button>
      </div>

      {/* TAB CONTENT: Joiner */}
      {activeSubTab === 'joiner' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <span>{isAr ? 'تشغيل مسار انضمام موظف جديد' : 'Execute Joiner Onboarding Workflow'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'اختر المستخدم/الهوية' : 'Select Target Identity'}</label>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">{isAr ? '-- اختر مستخدم --' : '-- Select User --'}</option>
                {users.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.username} ({u.primaryEmail}) - [{u.accountStatus}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الدور الوظيفي' : 'Assigned System Role'}</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="DISPATCHER">DISPATCHER</option>
                <option value="ACCOUNTANT">ACCOUNTANT</option>
                <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'القسم الإداري' : 'Department'}</label>
              <input 
                type="text" 
                value={dept} 
                onChange={e => setDept(e.target.value)}
                placeholder="e.g. Supply Chain & Logistics"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الفرع التشغيلي' : 'Branch / Location'}</label>
              <input 
                type="text" 
                value={branch} 
                onChange={e => setBranch(e.target.value)}
                placeholder="e.g. Riyadh Central Warehouse"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider">{isAr ? 'الإجراءات التلقائية المضمونة' : 'Automated Orchestration Tasks'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {isAr ? 'تحديث حالة الحساب إلى ACTIVE' : 'Account Activation'}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {isAr ? 'ربط صلاحيات ERP & WMS' : 'ERP & WMS Role Mapping'}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {isAr ? 'إنشاء مسارات الموافقة الافتراضية' : 'Default Workflow Assignments'}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {isAr ? 'تسجيل حدث التدقيق والبريد الترحيبي' : 'Audit Log & Notification Trigger'}</span>
            </div>
          </div>

          <button
            onClick={handleExecuteJoiner}
            disabled={!selectedUserId}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'تنفيذ تهيئة الموظف' : 'Execute Joiner Onboarding'}</span>
          </button>
        </div>
      )}

      {/* TAB CONTENT: Leaver */}
      {activeSubTab === 'leaver' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2 text-rose-700">
            <UserMinus className="w-5 h-5 text-rose-600" />
            <span>{isAr ? 'إنهاء الخدمة وتجريد الوصول الصارم (Leaver Offboarding)' : 'Execute Instant Leaver Offboarding'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'اختر المستهدف بإنهاء الخدمة' : 'Select Target User'}</label>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">{isAr ? '-- اختر مستخدم --' : '-- Select User --'}</option>
                {users.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.username} ({u.primaryEmail})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'سبب المغادرة / إنهاء الخدمة' : 'Offboarding Reason'}</label>
              <input 
                type="text" 
                value={leaverReason} 
                onChange={e => setLeaverReason(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
            <div className="font-bold uppercase tracking-wider">{isAr ? 'خطوات التجريد الفوري المتزامنة:' : 'Immediate Revocation Checklist:'}</div>
            <ul className="list-disc list-inside space-y-1">
              <li>{isAr ? 'تعطيل الحساب فوراً وإسقاط حالة الرتبة إلى DISABLED' : 'Account status set to DISABLED'}</li>
              <li>{isAr ? 'إلغاء كافة الجلسات النشطة عبر الأجهزة ومحو رموز JWT Token' : 'All active JWT sessions revoked'}</li>
              <li>{isAr ? 'إلغاء الأجهزة الموثوقة ومفاتيح المرور البايومترية Passkeys' : 'Passkeys & Trusted devices revoked'}</li>
              <li>{isAr ? 'توثيق قائمة استلام العهدة والأصول الفيزيائية' : 'Hardware & Key asset checklist logged'}</li>
            </ul>
          </div>

          <button
            onClick={handleExecuteLeaver}
            disabled={!selectedUserId}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            <UserMinus className="w-4 h-4" />
            <span>{isAr ? 'تنفيذ إنهاء الخدمة فوراً' : 'Execute Instant Offboarding'}</span>
          </button>
        </div>
      )}

      {/* TAB CONTENT: Audit Log Timeline */}
      {(activeSubTab === 'timeline' || activeSubTab === 'mover') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            {isAr ? 'سجل وقائع وإجراءات دورة الحياة' : 'Lifecycle Event Timeline'}
          </h3>

          <div className="divide-y divide-slate-100">
            {events.map(ev => (
              <div key={ev.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      ev.eventType === 'JOINER' ? 'bg-emerald-100 text-emerald-800' :
                      ev.eventType === 'LEAVER' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ev.eventType}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">User ID: {ev.userId}</span>
                  </div>
                  <p className="text-xs text-slate-600">{ev.reason}</p>
                </div>

                <div className="text-right text-xs text-slate-400 font-mono">
                  {new Date(ev.timestamp).toLocaleString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
