import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  Plus, 
  Clock, 
  Users,
  AlertCircle
} from 'lucide-react';
import { AccessReviewCampaign, AccessReviewDecision } from '../../../types/identityGovernance';

export const AccessCertificationView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [campaigns, setCampaigns] = useState<AccessReviewCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<AccessReviewDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<'QUARTERLY_AUDIT' | 'MANAGER_REVIEW' | 'DEPARTMENT_REVIEW'>('QUARTERLY_AUDIT');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/access-review/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: AccessReviewCampaign[] = await res.json();
        setCampaigns(data);
        if (data.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(data[0].id);
        }
      }
    } catch (err) {
      console.error('[AccessCertificationView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDecisions = async (cId: string) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/governance/access-review/decisions/${cId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDecisions(await res.json());
    } catch (err) {
      console.error('[Decisions] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchDecisions(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const handleCreateCampaign = async () => {
    if (!campaignName) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/governance/access-review/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: campaignName,
          type: campaignType,
          durationDays: 30
        })
      });

      if (res.ok) {
        setShowNewModal(false);
        setCampaignName('');
        fetchCampaigns();
      }
    } catch (err) {
      console.error('[CreateCampaign] Error:', err);
    }
  };

  const handleDecision = async (decId: string, status: 'APPROVED' | 'REVOKED') => {
    if (!selectedCampaignId) return;
    try {
      const token = localStorage.getItem('aja_auth_token');
      await fetch('/api/governance/access-review/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          userId: 'usr_sample',
          userName: 'Sample Employee',
          role: 'DISPATCHER',
          permissionOrAccess: 'SHIPMENT_DISPATCH_WRITE',
          status,
          comments: status === 'APPROVED' ? 'Access verified during certification audit' : 'Access privilege revoked per SoD policy'
        })
      });

      fetchDecisions(selectedCampaignId);
      fetchCampaigns();
    } catch (err) {
      console.error('[Decision] Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'مركز مراجعة وتوثيق الصلاحيات (Access Certification)' : 'Access Certification & Periodic Audit'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'حملات المراجعة الدورية لصلاحيات المستخدمين' : 'Enterprise Access Certification Campaigns'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'ضمان الامتثال عبر مراجعة صلاحيات المدرين والمدراء المباشرين دورياً، وتأكيد تجريد الصلاحيات غير الزائدة وفق مبدأ Least Privilege.'
              : 'Conduct periodic identity certification, manager reviews, and immediate revocation of unneeded permissions.'}
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء حملة مراجعة جديدة' : 'New Certification Campaign'}</span>
        </button>
      </div>

      {/* Campaigns Grid & Selected Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Campaigns */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>{isAr ? 'الحملات النشطة والمستمرة' : 'Active Campaigns'}</span>
            <span className="text-xs text-slate-500 font-normal">Total: {campaigns.length}</span>
          </h3>

          <div className="space-y-2">
            {campaigns.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCampaignId(c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedCampaignId === c.id 
                    ? 'bg-amber-50 border-amber-300 shadow-sm' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{c.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{c.name}</h4>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>Reviewer: {c.reviewerName}</span>
                  <span className="font-mono text-[11px]">{c.approvedDecisions} / {c.totalDecisions} Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Details & Decision Execution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isAr ? 'تفاصيل وقرارات الحملة المحددة' : 'Campaign Certification Decisions'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'اتخاذ قرار التأكيد (Approve) أو التجريد (Revoke) للصلاحيات الممنوحة' : 'Review user roles & permissions for mandatory certification.'}
              </p>
            </div>

            <button 
              onClick={() => handleDecision('new_dec', 'APPROVED')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'إجراء تقييم جديد' : 'Record Review'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {decisions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span>{isAr ? 'لا توجد قرارات مدونة لهذه الحملة بعد' : 'No review decisions recorded yet for this campaign.'}</span>
              </div>
            ) : (
              decisions.map(d => (
                <div key={d.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{d.userName}</span>
                      <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono">{d.role}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-mono">
                      Access: {d.permissionOrAccess}
                    </div>
                    {d.comments && <p className="text-xs text-slate-500 italic mt-1">{d.comments}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(d.id, 'APPROVED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        d.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'اعتماد' : 'Approve'}</span>
                    </button>

                    <button
                      onClick={() => handleDecision(d.id, 'REVOKED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        d.status === 'REVOKED' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تجريد' : 'Revoke'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: New Campaign */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">{isAr ? 'إنشاء حملة مراجعة صلاحيات جديدة' : 'Create Access Certification Campaign'}</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'اسم الحملة' : 'Campaign Title'}</label>
              <input 
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. Q4 2026 Financial & ERP Audit"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isAr ? 'نوع التدقيق' : 'Audit Type'}</label>
              <select
                value={campaignType}
                onChange={e => setCampaignType(e.target.value as any)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="QUARTERLY_AUDIT">QUARTERLY_AUDIT (تدقيق ربع سنوي شامل)</option>
                <option value="MANAGER_REVIEW">MANAGER_REVIEW (مراجعة المديرين المباشرين)</option>
                <option value="DEPARTMENT_REVIEW">DEPARTMENT_REVIEW (مراجعة رؤساء الأقسام)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                {isAr ? 'حفظ وتنشيط' : 'Create & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
