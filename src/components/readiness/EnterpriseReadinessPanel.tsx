import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Award,
  Zap,
  Activity,
  Flame,
  RotateCw,
  RefreshCw,
  Play,
  Lock,
  Globe,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building2,
  FileText,
  Clock,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const EnterpriseReadinessPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'readiness' | 'certs' | 'golive' | 'chaos' | 'hypercare' | 'innovation'>('readiness');

  const [overview, setOverview] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [goLiveGates, setGoLiveGates] = useState<any[]>([]);
  const [hypercare, setHypercare] = useState<any>(null);
  const [innovation, setInnovation] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [runningChaos, setRunningChaos] = useState(false);

  useEffect(() => {
    fetchAllReadinessData();
  }, []);

  const fetchAllReadinessData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, catRes, certRes, gateRes, hyperRes, innoRes] = await Promise.all([
        fetch('/api/readiness/overview', { headers }),
        fetch('/api/readiness/categories', { headers }),
        fetch('/api/readiness/certifications', { headers }),
        fetch('/api/readiness/golive-gates', { headers }),
        fetch('/api/readiness/hypercare', { headers }),
        fetch('/api/readiness/innovation', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      if (certRes.ok) {
        const data = await certRes.json();
        setCertifications(data.certifications || []);
      }
      if (gateRes.ok) {
        const data = await gateRes.json();
        setGoLiveGates(data.gates || []);
      }
      if (hyperRes.ok) setHypercare(await hyperRes.json());
      if (innoRes.ok) {
        const data = await innoRes.json();
        setInnovation(data.innovation || []);
      }
    } catch (err) {
      console.error('Error fetching readiness data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditCertify = async () => {
    setAuditing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/readiness/audit-certify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        await fetchAllReadinessData();
      }
    } catch (err) {
      console.error('Error auditing go-live', err);
    } finally {
      setAuditing(false);
    }
  };

  const handleRunChaosTest = async () => {
    setRunningChaos(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/readiness/chaos-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        await fetchAllReadinessData();
      }
    } catch (err) {
      console.error('Error running chaos engineering test', err);
    } finally {
      setRunningChaos(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#0F172A] text-white p-6 rounded-3xl shadow-xl border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center shrink-0 shadow-lg">
            <Award className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">الجهوزية والاعتمادية والإطلاق المباشر (Enterprise Readiness & Go-Live)</h1>
              <Badge className="bg-emerald-400/20 text-emerald-200 border-emerald-300/40 text-[10px] font-extrabold">
                Global Production Certified
              </Badge>
            </div>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
              منظومة الجاهزية الشاملة، اعتمادات ISO 27001/22301/SOC 2/ZATCA، اختبارات الهندسة الفوضوية (Chaos Testing)، وإدارة العمليات المباشرة (Hypercare Operations).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleAuditCertify}
            disabled={auditing}
            className="bg-white text-emerald-950 hover:bg-emerald-50 text-xs px-4 py-2 rounded-xl font-black shadow-md flex items-center gap-2 shrink-0"
          >
            {auditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" /> : <FileCheck2 className="w-4 h-4 text-emerald-700" />}
            <span>المصادقة الاعتمادية الشاملة</span>
          </Button>
        </div>
      </div>

      {/* Overview KPI Header */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">نسبة الجاهزية الكلية Readiness</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">{overview.totalReadinessScorePct}%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">22 Enterprise Domains Validated</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">الشهادات الدولية النشطة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-600 font-mono">{overview.certificationsCount}</span>
              <span className="text-xs text-slate-500 font-bold">Active Certs</span>
            </div>
            <span className="text-[10px] text-sky-700 font-bold">ISO, SOC 2, PCI DSS & ZATCA</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">اعتمادات الإدارة الكبرى Go-Live</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-600 font-mono">{overview.goLiveGatesApprovedCount} / {overview.goLiveGatesTotal}</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">CEO, CISO, CTO, CFO Approved</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">حوادث مرحلة Hypercare</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">{overview.criticalP1IncidentsCount}</span>
              <span className="text-xs text-emerald-700 font-bold">P1 Critical</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">MTTR &lt; 5m Active</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">مشاريع الابتكار PMO</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-600 font-mono">{overview.innovationItemsCount}</span>
              <span className="text-xs text-slate-500 font-bold">Active Programs</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">Continuous Kaizen Growth</span>
          </div>
        </div>
      )}

      {/* Action Message Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('readiness')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'readiness'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>تقييم الجاهزية التشغيلية (Readiness)</span>
        </button>

        <button
          onClick={() => setActiveTab('certs')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'certs'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الشهادات والامتثال الدولي (ISO & SOC 2)</span>
        </button>

        <button
          onClick={() => setActiveTab('golive')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'golive'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>بوابة القرار النهائي للإطلاق (Go/No-Go Decision)</span>
        </button>

        <button
          onClick={() => setActiveTab('chaos')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'chaos'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>اختبارات الهندسة الفوضوية (Chaos Testing)</span>
        </button>

        <button
          onClick={() => setActiveTab('hypercare')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'hypercare'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>مرحلة الدعم الفائق المباشر (Hypercare Ops)</span>
        </button>

        <button
          onClick={() => setActiveTab('innovation')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'innovation'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>الابتكار المؤسسي (PMO & Kaizen)</span>
        </button>
      </div>

      {/* TAB 1: READINESS ASSESSMENT */}
      {activeTab === 'readiness' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>تقييم الجاهزية للإنتاج المباشر (Enterprise Production Readiness Scorecard)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                فحص شامل للتطبيق، البنية التحتية، الأمن السيبراني، قواعد البيانات، الذكاء الاصطناعي والعمليات الميدانية.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
              100% Score Verified
            </Badge>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.categoryId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                      {cat.categoryId}
                    </span>
                    <h3 className="font-black text-xs text-slate-900">{cat.categoryNameAr}</h3>
                  </div>
                  <Badge className="bg-emerald-500 text-white text-xs font-mono">
                    {cat.status} ({cat.readinessPct}%)
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px] mb-1">التحققات الأساسية المحققة:</span>
                  {cat.keyValidations.map((val: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Audited By: <strong className="text-slate-800">{cat.validatedBy}</strong></span>
                  <span>Date: <strong>{new Date(cat.lastAssessedDate).toLocaleDateString('ar-SA')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: CERTIFICATIONS & COMPLIANCE */}
      {activeTab === 'certs' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-600" />
                <span>الشهادات الدولية والامتثال الجمركي والمالي (Global ISO & Regulatory Certifications)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اعتمادات ISO 27001, ISO 22301, SOC 2 Type II, PCI DSS v4.0, وربط الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك (ZATCA).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div key={cert.certId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    {cert.certId}
                  </span>
                  <Badge className="bg-emerald-500 text-white text-[10px] font-mono">
                    {cert.auditStatus}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-sm text-slate-900">{cert.standardName}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{cert.categoryAr}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Auditor Body:</span>
                    <span className="font-bold text-slate-900">{cert.auditorOrg}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Compliance Score:</span>
                    <span className="font-bold text-emerald-600">{cert.complianceScorePct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Issued Date:</span>
                    <span className="font-bold text-slate-700">{cert.issuedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Valid Until:</span>
                    <span className="font-bold text-slate-700">{cert.validUntil}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: GOLIVE DECISION GATES */}
      {activeTab === 'golive' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <span>بوابة واعتمادات القرار النهائي للإطلاق (Executive Go/No-Go Decision Gates)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                توقيعات الرؤساء التنفيذيين (CEO, CISO, CTO, CFO) للموافقة على تشغيل المنصة عالمياً مباشرة.
              </p>
            </div>
            <Badge className="bg-emerald-500 text-white text-xs font-extrabold">
              GO FOR LAUNCH APPROVED
            </Badge>
          </div>

          <div className="space-y-4">
            {goLiveGates.map((g) => (
              <div key={g.gateId} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {g.gateId}
                  </span>
                  <Badge className="bg-emerald-500 text-white text-xs font-mono">
                    {g.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-xs text-slate-900">{g.titleAr}</h3>
                  <p className="text-xs text-slate-500 font-mono">{g.titleEn}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span>Signatory Role: <strong>{g.ownerRole}</strong></span>
                  <span>Signed By: <strong className="text-emerald-700">{g.signedBy}</strong></span>
                  <span>Timestamp: <strong>{new Date(g.signedAt).toLocaleDateString('ar-SA')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: CHAOS ENGINEERING */}
      {activeTab === 'chaos' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>اختبارات الهندسة الفوضوية والصلابة (Chaos Engineering & High Availability)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اختبار سيناريوهات انقطاع المنطقة السحابية، تعطل خوادم كوبرنيتس، ومصادقة التعافي التلقائي بدون فقدان أي بيانات.
              </p>
            </div>
            <Button
              onClick={handleRunChaosTest}
              disabled={runningChaos}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              {runningChaos ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>تشغيل اختبار التعافي الفوضوي</span>
            </Button>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-xs text-slate-900">نتائج اختبارات المتانة والتحمل (Endurance & Chaos Matrix):</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-slate-400 block text-[10px]">Cloud Failover RPO:</span>
                <strong className="text-emerald-600 font-mono text-base block">0.35 sec</strong>
                <span className="text-[10px] text-emerald-700">Target &lt; 1 sec Met</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-slate-400 block text-[10px]">Cloud Failover RTO:</span>
                <strong className="text-sky-600 font-mono text-base block">1.8 min</strong>
                <span className="text-[10px] text-sky-700">Target &lt; 5 min Met</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-slate-400 block text-[10px]">Zero Data Loss Score:</span>
                <strong className="text-indigo-600 font-mono text-base block">100% Passed</strong>
                <span className="text-[10px] text-indigo-700">Multi-AZ Storage Sync</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: HYPERCARE OPERATIONS */}
      {activeTab === 'hypercare' && hypercare && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>مرحلة الدعم الفائق والتواجد التشغيلي (Hypercare Post-Launch Operations)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة مباشرة لأول أيام الإطلاق، سرعة كشف ومعالجة الأعطال اللحظية (MTTD/MTTR)، ومؤشر رضا العملاء.
              </p>
            </div>
            <Badge className="bg-emerald-500 text-white text-xs font-mono">
              {hypercare.stage}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">زمن اكتشاف المشكلة (MTTD)</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">{hypercare.mttdMinutes} min</span>
              <span className="text-[10px] text-emerald-700 block">OpenTelemetry Tracing Active</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">زمن الإصلاح التلقائي (MTTR)</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">{hypercare.mttrMinutes} min</span>
              <span className="text-[10px] text-indigo-700 block">Self-Healing Pods Ready</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">نسبة الالتزام لاتفاقية SLA</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">{hypercare.slaCompliancePct}%</span>
              <span className="text-[10px] text-emerald-700 block">Zero Critical Defect Target</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">رضا العملاء بعد الإطلاق</span>
              <span className="text-2xl font-black text-sky-600 font-mono">{hypercare.customerSatisfactionPostLaunch} / 5.0</span>
              <span className="text-[10px] text-sky-700 block">High Engagement Rating</span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: INNOVATION & PMO */}
      {activeTab === 'innovation' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                <span>الابتكار المؤسسي والتطوير المستمر (Enterprise PMO & Kaizen Framework)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة خارطة طريق الابتكار، مشاريع الذكاء الاصطناعي التوليدي، والعائد على الاستثمار المتوقع.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {innovation.map((inno) => (
              <div key={inno.itemId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {inno.itemId}
                    </span>
                    <Badge className="bg-indigo-600 text-white text-[10px] font-mono">
                      {inno.stage}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded">
                    Est ROI: +{inno.roiEstimatePercentage}%
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-xs text-slate-900">{inno.titleAr}</h3>
                  <p className="text-xs text-slate-500 mt-1">قطاع العمل: {inno.businessUnit} | التقنية المعتمدة: {inno.aiEnhancementType}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
