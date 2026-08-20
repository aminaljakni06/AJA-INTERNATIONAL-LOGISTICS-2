import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  UserCheck,
  AlertTriangle,
  Zap,
  Activity,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Sliders,
  FileCheck2,
  Cpu,
  CheckCircle2,
  Clock,
  Eye,
  Server,
  Fingerprint,
  Globe,
  Radio,
  FileKey,
  Database,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const EnterpriseSecurityPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'iam_zerotrust' | 'pam' | 'siem' | 'soar' | 'secrets' | 'soc'>('iam_zerotrust');

  // Core Data States
  const [overview, setOverview] = useState<any>(null);
  const [identities, setIdentities] = useState<any[]>([]);
  const [zeroTrustPolicies, setZeroTrustPolicies] = useState<any[]>([]);
  const [pamRequests, setPamRequests] = useState<any[]>([]);
  const [secretsVault, setSecretsVault] = useState<any[]>([]);
  const [siemEvents, setSiemEvents] = useState<any[]>([]);
  const [soarPlaybooks, setSoarPlaybooks] = useState<any[]>([]);
  const [socDashboard, setSocDashboard] = useState<any>(null);

  // Form & Interaction States
  const [loading, setLoading] = useState(false);
  const [pamRole, setPamRole] = useState('CUSTOMS_EMERGENCY_OVERRIDE');
  const [pamReason, setPamReason] = useState('إعادة توجيه حاسبة للجمارك بميناء الملك عبد الله بخليج العقبة');
  const [submittingPam, setSubmittingPam] = useState(false);
  const [executingSoar, setExecutingSoar] = useState(false);
  const [soarResult, setSoarResult] = useState<any>(null);

  useEffect(() => {
    fetchAllSecurityData();
  }, []);

  const fetchAllSecurityData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        overviewRes,
        iamRes,
        ztRes,
        pamRes,
        secRes,
        siemRes,
        soarRes,
        socRes,
      ] = await Promise.all([
        fetch('/api/security/overview', { headers }),
        fetch('/api/security/iam/identities', { headers }),
        fetch('/api/security/zero-trust/policies', { headers }),
        fetch('/api/security/pam/requests', { headers }),
        fetch('/api/security/secrets/vault', { headers }),
        fetch('/api/security/siem/events', { headers }),
        fetch('/api/security/soar/playbooks', { headers }),
        fetch('/api/security/soc/dashboard', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (iamRes.ok) {
        const data = await iamRes.json();
        setIdentities(data.identities || []);
      }
      if (ztRes.ok) {
        const data = await ztRes.json();
        setZeroTrustPolicies(data.policies || []);
      }
      if (pamRes.ok) {
        const data = await pamRes.json();
        setPamRequests(data.requests || []);
      }
      if (secRes.ok) {
        const data = await secRes.json();
        setSecretsVault(data.vaultItems || []);
      }
      if (siemRes.ok) {
        const data = await siemRes.json();
        setSiemEvents(data.events || []);
      }
      if (soarRes.ok) {
        const data = await soarRes.json();
        setSoarPlaybooks(data.playbooks || []);
      }
      if (socRes.ok) {
        setSocDashboard(await socRes.json());
      }
    } catch (err) {
      console.error('Error fetching security metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPam = async () => {
    setSubmittingPam(true);
    try {
      const res = await fetch('/api/security/pam/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requesterName: 'فهد الحربي (Fahad Al-Harbi)',
          requestedRole: pamRole,
          justificationReason: pamReason,
          timeWindowMinutes: 60,
        }),
      });
      if (res.ok) {
        await fetchAllSecurityData();
      }
    } catch (err) {
      console.error('Error requesting PAM elevation', err);
    } finally {
      setSubmittingPam(false);
    }
  };

  const handleTriggerSoar = async (playbookId: string) => {
    setExecutingSoar(true);
    try {
      const res = await fetch('/api/security/soar/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playbookId }),
      });
      if (res.ok) {
        setSoarResult(await res.json());
        await fetchAllSecurityData();
      }
    } catch (err) {
      console.error('Error executing SOAR playbook', err);
    } finally {
      setExecutingSoar(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#31103F] text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">منصة إدارة الهوية والأمن السيبراني والـ Zero Trust (IAM & SOC)</h1>
              <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/40 text-[10px] font-extrabold">
                NIST SP 800-207 Compliant
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              تأمين كافة الهويات والخدمات والعملاء الأوتوماتيكيين (AI Agents)، وإدارة الوصول المتميز (PAM)، الخزنة السيبرانية، ومراقبة الحوادث اللحظية SIEM & SOAR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllSecurityData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 transition-all font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث المركز الأمني</span>
          </button>
        </div>
      </div>

      {/* Top KPI Stat Cards */}
      {socDashboard && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">مؤشر أمن الهويات (Identity Score)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">{socDashboard.identityHealthScore}%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">100% Passkey & MFA</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">امتثال NIST Zero Trust</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-indigo-600 font-mono">{socDashboard.zeroTrustCompliancePct}%</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">Explicit Microsegmentation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">التهديدات النشطة (Active Threats)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-amber-600 font-mono">{socDashboard.activeThreatCount}</span>
              <span className="text-xs text-slate-500 font-bold">Alert</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">Tor Exit Node IP Contained</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">متوسط زمن الاستجابة SOAR</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-sky-600 font-mono">{socDashboard.avgIncidentResolutionMinutes} m</span>
            </div>
            <span className="text-[10px] text-sky-700 font-bold">Automated Isolation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">امتثال ISO 27001 & PCI-DSS</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">{socDashboard.iso27001CompliancePct}%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Fully Certified</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('iam_zerotrust')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'iam_zerotrust'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>سجل الهويات وسياسات Zero Trust</span>
        </button>

        <button
          onClick={() => setActiveTab('pam')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'pam'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>إدارة الوصول المتميز (PAM & Just-In-Time)</span>
        </button>

        <button
          onClick={() => setActiveTab('siem')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'siem'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>رصد الأحداث السيبرانية (SIEM & MITRE)</span>
        </button>

        <button
          onClick={() => setActiveTab('soar')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'soar'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>الأتمتة والاستجابة التلقائية (SOAR Playbooks)</span>
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'secrets'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileKey className="w-4 h-4" />
          <span>خزنة السرية والتشفير (Secrets & PKI)</span>
        </button>

        <button
          onClick={() => setActiveTab('soc')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'soc'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>غرفة العمليات الأمنية (SOC Dashboard)</span>
        </button>
      </div>

      {/* TAB 1: IAM Directory & Zero Trust Microsegmentation Policies */}
      {activeTab === 'iam_zerotrust' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-600" />
                  <span>دليل الهويات المؤسسية الموحد (Enterprise Identity Directory)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إدارة هويات الموظفين، الشركاء، حسابات الخدمات M2M، أجهزة الـ IoT، وعملاء الذكاء الاصطناعي المستقلين.
                </p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-mono">
                OAuth 2.1 & Passkeys FIDO2
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">اسم الهوية والبريد</th>
                    <th className="p-3">نوع الهوية</th>
                    <th className="p-3">الأدوار الممنوحة</th>
                    <th className="p-3">طريقة التوثيق (MFA)</th>
                    <th className="p-3">مستوى المخاطرة</th>
                    <th className="p-3">الموقع وأجهزة الربط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {identities.map((id) => (
                    <tr key={id.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{id.fullNameAr}</span>
                        <span className="font-mono text-[10px] text-slate-500">{id.username}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 border border-slate-200 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded text-slate-800">
                          {id.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{id.roles.join(', ')}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {id.mfaMethod}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                            id.riskScore < 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          Risk Score: {id.riskScore}/100
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-800 font-bold block">{id.ipAddressLocation}</span>
                        <span className="text-slate-400 text-[10px]">{id.associatedDevicesCount} Registered Devices</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Zero Trust Microsegmentation Policies */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              <span>سياسات Zero Trust والتحقق المستمر (Continuous Verification Policies)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zeroTrustPolicies.map((p) => (
                <div key={p.policyId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-indigo-700 font-bold">{p.policyId}</span>
                    <Badge className="bg-emerald-500 text-white text-[10px] font-mono">
                      {p.enforcementMode}
                    </Badge>
                  </div>
                  <h4 className="font-black text-xs text-slate-900">{p.policyNameAr}</h4>
                  <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                    <div>Target: <span className="font-mono font-bold text-slate-900">{p.resourceTarget}</span></div>
                    <div>mTLS Enforced: <span className="font-bold text-emerald-700">{p.mTLSEnforced ? 'YES' : 'NO'}</span></div>
                    <div>Restriction: <span className="font-bold text-slate-800">{p.locationRestriction}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Privileged Access Management (PAM & Just-In-Time) */}
      {activeTab === 'pam' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <span>رفع الصلاحيات المؤقتة Just-In-Time PAM Request</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تقديم طلب للحصول على صلاحيات عالية الحساسية لفترة زمنية محددة مع التدوين في سجل التدقيق غير القابل للتعديل.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الدور الحساس المطلوب</label>
                <select
                  value={pamRole}
                  onChange={(e) => setPamRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none font-mono"
                >
                  <option value="CUSTOMS_EMERGENCY_OVERRIDE">PORT_CUSTOMS_EMERGENCY_OVERRIDE</option>
                  <option value="ZATCA_PROD_DEPLOYER">ZATCA_PROD_DEPLOYER</option>
                  <option value="DATABASE_ROOT_ACCESS">DATABASE_ROOT_ACCESS</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">المبرر التشغيلي الموثق</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pamReason}
                    onChange={(e) => setPamReason(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none"
                  />
                  <Button
                    onClick={handleRequestPam}
                    disabled={submittingPam}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shrink-0"
                  >
                    {submittingPam ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>طلب الصلاحية JIT</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Active PAM Requests */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              سجل طلبات الوصول المتميز النشطة (Active PAM Clearances)
            </h3>

            <div className="space-y-3">
              {pamRequests.map((req) => (
                <div key={req.requestId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                        {req.requestId}
                      </span>
                      <h4 className="font-black text-xs text-slate-900 mt-1">{req.requesterName}</h4>
                    </div>
                    <Badge className="bg-emerald-500 text-white text-xs font-mono">
                      Status: {req.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 font-bold bg-white p-2.5 rounded-xl border border-slate-200">
                    المبرر: {req.justificationReason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Approved By: {req.approvedBy}</span>
                    <span>Valid Until: {new Date(req.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SIEM Security Events & Threat Intelligence */}
      {activeTab === 'siem' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>سجل الفعاليات الأمنية الموحد SIEM & MITRE ATT&CK Tracking</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تجميع وتحليل السجلات الأمنية من كافة الخوادم والواجهات وتدفقات البيانات المباشرة.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {siemEvents.map((evt) => (
              <div key={evt.eventId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900">{evt.eventId}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 text-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">المصدر والأيزو:</span>
                    <span className="font-mono font-bold text-slate-900">{evt.sourceIp} ({evt.sourceLocation})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الهدف المتأثر:</span>
                    <span className="font-mono font-bold text-indigo-700">{evt.affectedTarget}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">تقنية MITRE ATT&CK:</span>
                    <span className="font-mono font-bold text-rose-700">{evt.mitreTechniqueId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: SOAR Automated Playbooks */}
      {activeTab === 'soar' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>سيناريوهات الاستجابة الأمنية التلقائية (SOAR Playbooks)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تضمين الأوامر التلقائية لعزل العنوان المتطفل، إلغاء الجلسات المشبوهة، وتدوير المفاتيح فوراً.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {soarPlaybooks.map((pb) => (
              <div key={pb.playbookId} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                      {pb.playbookId}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 mt-1">{pb.nameAr}</h3>
                    <p className="text-xs text-slate-500 font-mono">{pb.nameEn}</p>
                  </div>
                  <Button
                    onClick={() => handleTriggerSoar(pb.playbookId)}
                    disabled={executingSoar}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2 shrink-0"
                  >
                    {executingSoar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>تشغيل السيناريو الآن</span>
                  </Button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block mb-1">الخطوات التلقائية المنفذة:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 font-mono text-[11px]">
                    {pb.automatedActions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {soarResult && (
            <div className="bg-[#0F172A] p-4 rounded-2xl text-white font-mono text-xs space-y-2">
              <span className="text-emerald-400 font-bold block">Execution Result: {soarResult.status}</span>
              <pre className="text-slate-300 text-[11px] p-2 bg-slate-900 rounded-xl overflow-x-auto">
                {JSON.stringify(soarResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: Secrets Vault & PKI Certificates */}
      {activeTab === 'secrets' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileKey className="w-5 h-5 text-indigo-600" />
                <span>خزنة المفاتيح والتشفير المترابط Secrets Vault & mTLS PKI</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة المفاتيح السرية للواجهات، شهادات التشفير الرقمي لـ ZATCA، وتدوين وتطبيق مفاتيح JWT التلقائي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {secretsVault.map((sec) => (
              <div key={sec.secretId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-700 font-bold">{sec.secretId}</span>
                  <Badge className="bg-emerald-500 text-white text-[10px] font-mono">
                    Auto-Rotate
                  </Badge>
                </div>
                <h4 className="font-black text-xs text-slate-900">{sec.secretName}</h4>
                <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 font-mono">
                  <div>Version: <span className="font-bold text-slate-900">{sec.version}</span></div>
                  <div>Category: <span className="font-bold text-indigo-700">{sec.category}</span></div>
                  <div>Next Rotation: <span className="font-bold text-emerald-700">{new Date(sec.nextRotationDueAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 6: SOC Command Center & Compliance Dashboard */}
      {activeTab === 'soc' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600" />
                <span>لوحة التحكم وغرفة العمليات الأمنية (SOC Command Dashboard)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مراقبة الامتثال للمعايير العالمية NIST CSF, ISO 27001, PCI-DSS, SOC 2, و ZATCA Security Framework.
              </p>
            </div>
          </div>

          {socDashboard && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">معيار NIST CSF / 800-207</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">{socDashboard.nistCompliancePct}%</span>
                <span className="text-[10px] text-slate-500 block">Strict Zero Trust Enforced</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">معيار ISO 27001 / ISO 27701</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">{socDashboard.iso27001CompliancePct}%</span>
                <span className="text-[10px] text-slate-500 block">ISMS Certified</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">معيار PCI-DSS v4.0</span>
                <span className="text-2xl font-black text-sky-600 font-mono">{socDashboard.pciDssCompliancePct}%</span>
                <span className="text-[10px] text-slate-500 block">Payment Tokenization Secure</span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
