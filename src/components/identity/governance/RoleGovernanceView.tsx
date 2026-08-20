import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Plus, 
  Key,
  Calendar,
  Lock
} from 'lucide-react';
import { RoleGovernanceRequest } from '../../../types/identityGovernance';

export const RoleGovernanceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [requests, setRequests] = useState<RoleGovernanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form states
  const [targetUserId, setTargetUserId] = useState('');
  const [requestedRole, setRequestedRole] = useState('BRANCH_MANAGER');
  const [reason, setReason] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [durationDays, setDurationDays] = useState(7);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/role-governance/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch (err) {
      console.error('[RoleGovernance] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmitRequest = async () => {
    if (!requestedRole || !reason) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/role-governance/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: targetUserId || 'usr_self',
          targetUserName: 'Self / Employee',
          requestedRole,
          reason,
          isTemporary,
          isEmergency,
          durationDays: isTemporary ? durationDays : undefined
        })
      });

      if (res.ok) {
        setShowRequestModal(false);
        setReason('');
        fetchRequests();
      }
    } catch (err) {
      console.error('[SubmitRoleReq] Error:', err);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/role-governance/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      if (res.ok) fetchRequests();
    } catch (err) {
      console.error('[ApproveRole] Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>{isAr ? 'حاكمة الأدوار وتخصيص الصلاحيات المؤقتة (Role Governance)' : 'Role Governance & Elevated Privilege Control'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'إدارة طلبات الرتب، الأدوار المؤقتة والطوارئ (Break-Glass)' : 'Role Requests, Temporary Privileges & Emergency Access'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'تقديم وموافقة طلبات ترقية الأدوار، تفعيل أدوار الطوارئ مؤقتاً بالصلاحيات الكاملة مع انتهاء الصلاحية التلقائي وتدقيق الموافقات.'
              : 'Govern privilege elevations, temporary roles, and emergency break-glass access with automatic expiration.'}
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'طلب دور/صلاحيات مؤقتة' : 'Request Elevated Role'}</span>
        </button>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>{isAr ? 'طلبات ترقية وتغيير الأدوار الوظيفية' : 'Role Elevation & Temporary Access Requests'}</span>
          <span className="text-xs text-slate-500 font-normal">Count: {requests.length}</span>
        </h3>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {isAr ? 'لا توجد طلبات ترقية أدوار قيد الانتظار حالياً.' : 'No role governance requests currently pending.'}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{r.targetUserName}</span>
                    <span className="text-xs font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      → {r.requestedRole}
                    </span>
                    {r.isEmergency && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> BREAK-GLASS
                      </span>
                    )}
                    {r.isTemporary && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.durationDays} Days
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">Reason: {r.reason}</p>
                  <p className="text-[11px] text-slate-400">Requested by: {r.requesterName} on {new Date(r.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>

                  {r.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'اعتماد الطلب' : 'Approve Role'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Requesting Role */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">{isAr ? 'تقديم طلب ترقية دور أو صلاحية مؤقتة' : 'Request Role Elevation'}</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'الدور المطلوب' : 'Target Role'}</label>
              <select
                value={requestedRole}
                onChange={e => setRequestedRole(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="DISPATCHER">DISPATCHER (مسؤول تشغيل الشحنات)</option>
                <option value="ACCOUNTANT">ACCOUNTANT (المحاسب المالي)</option>
                <option value="BRANCH_MANAGER">BRANCH_MANAGER (مدير الفرع)</option>
                <option value="ADMIN">ADMIN (مدير النظام)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'سبب الطلب والحاجة المبررة' : 'Business Justification'}</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Temporary coverage for Riyadh warehouse operations during audit"
                rows={3}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isTemporary} 
                  onChange={e => setIsTemporary(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500" 
                />
                <span>{isAr ? 'تخصيص مؤقت بزمن انتهاء محدد' : 'Temporary Access (Auto-expires)'}</span>
              </label>

              {isTemporary && (
                <div className="pl-6">
                  <label className="block text-xs text-slate-500 mb-1">{isAr ? 'المدة بالأيام' : 'Duration in Days'}</label>
                  <input 
                    type="number" 
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-28 text-sm px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-xs font-medium text-rose-700 cursor-pointer pt-1">
                <input 
                  type="checkbox" 
                  checked={isEmergency} 
                  onChange={e => setIsEmergency(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500" 
                />
                <span>{isAr ? 'طلب طوارئ استثنائي (Break-Glass Emergency)' : 'Break-Glass Emergency Access'}</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                onClick={handleSubmitRequest}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                {isAr ? 'إرسال الطلب' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
