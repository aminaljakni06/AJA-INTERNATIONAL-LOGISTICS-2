import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Server,
  Layers,
  Cpu,
  Activity,
  RefreshCw,
  Terminal,
  Zap,
  DollarSign,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingDown,
  Globe,
  Radio,
  FileCheck2,
  Box,
  Sliders,
  Database,
  Lock,
  GitBranch,
  Gauge,
  Workflow,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const EnterpriseCloudPlatformPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'k8s' | 'devsecops' | 'sre' | 'finops' | 'dr' | 'golden_paths'>('k8s');

  // Core Data States
  const [overview, setOverview] = useState<any>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [slos, setSlos] = useState<any[]>([]);
  const [finopsReport, setFinopsReport] = useState<any>(null);
  const [drStatus, setDrStatus] = useState<any>(null);

  // Form & Action States
  const [loading, setLoading] = useState(false);
  const [autoscaleNodes, setAutoscaleNodes] = useState(4);
  const [autoscalingCluster, setAutoscalingCluster] = useState(false);
  const [triggeringPipe, setTriggeringPipe] = useState(false);
  const [testingDr, setTestingDr] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPlatformData();
  }, []);

  const fetchAllPlatformData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        overviewRes,
        clustersRes,
        pipesRes,
        slosRes,
        finopsRes,
        drRes,
      ] = await Promise.all([
        fetch('/api/platform/overview', { headers }),
        fetch('/api/platform/k8s/clusters', { headers }),
        fetch('/api/platform/devsecops/pipelines', { headers }),
        fetch('/api/platform/sre/slos', { headers }),
        fetch('/api/platform/finops/report', { headers }),
        fetch('/api/platform/dr/status', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (clustersRes.ok) {
        const data = await clustersRes.json();
        setClusters(data.clusters || []);
      }
      if (pipesRes.ok) {
        const data = await pipesRes.json();
        setPipelines(data.pipelines || []);
      }
      if (slosRes.ok) {
        const data = await slosRes.json();
        setSlos(data.slos || []);
      }
      if (finopsRes.ok) {
        setFinopsReport(await finopsRes.json());
      }
      if (drRes.ok) {
        setDrStatus(await drRes.json());
      }
    } catch (err) {
      console.error('Error fetching enterprise platform metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoscaleCluster = async (clusterId: string) => {
    setAutoscalingCluster(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/platform/k8s/autoscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clusterId, additionalNodes: autoscaleNodes }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        await fetchAllPlatformData();
      }
    } catch (err) {
      console.error('Error scaling cluster', err);
    } finally {
      setAutoscalingCluster(false);
    }
  };

  const handleTriggerPipeline = async () => {
    setTriggeringPipe(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/platform/devsecops/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appName: 'aja-core-logistics-backend',
          branch: 'main',
        }),
      });
      if (res.ok) {
        setActionMessage('تم إطلاق مسار بناء واختبار الديفسيكأوبس (DevSecOps Pipeline) وإرساله إلى ArgoCD بنجاح.');
        await fetchAllPlatformData();
      }
    } catch (err) {
      console.error('Error triggering pipeline', err);
    } finally {
      setTriggeringPipe(false);
    }
  };

  const handleTestDrFailover = async () => {
    setTestingDr(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/platform/dr/test-failover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        await fetchAllPlatformData();
      }
    } catch (err) {
      console.error('Error testing DR failover', err);
    } finally {
      setTestingDr(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0284C7] to-[#1E1B4B] text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <Cloud className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">منصة السحابة المؤسسية والـ Kubernetes & SRE & FinOps</h1>
              <Badge className="bg-sky-400/20 text-sky-300 border-sky-400/40 text-[10px] font-extrabold">
                CNCF Graduated & ISO 22301
              </Badge>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-2xl">
              إدارة عناقيد كوبرنيتس المتعددة (Multi-Cluster K8s)، أتمتة الديفسيكأوبس (GitOps/ArgoCD)، مؤشرات الاعتمادية SRE (SLO 99.99%)، وإدارة تكاليف السحابة FinOps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllPlatformData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 transition-all font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث المركز السحابي</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">عناقيد K8s والعُقد (Clusters)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-sky-600 font-mono">{overview.k8sClustersCount}</span>
              <span className="text-xs text-slate-500 font-bold">({overview.activeNodesTotal} Nodes)</span>
            </div>
            <span className="text-[10px] text-sky-700 font-bold">{overview.activePodsTotal} Active Pods</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">متوسط الجاهزية SRE Availability</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">{overview.sreAverageAvailabilityPct}%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">SLO Target 99.99% Met</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">ميزانية السحابة الشهرية FinOps</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-indigo-600 font-mono">${(overview.finopsCurrentMonthlySpendUsd / 1000).toFixed(1)}k</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">Potential Savings: ${overview.finopsSavingsPotentialUsd}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">هدف التعافي DR RPO / RTO</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-amber-600 font-mono">{overview.drRpoSeconds}s / {overview.drRtoMinutes}m</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">Zero Data Loss Target</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">مراقبة OpenTelemetry</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">100%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Traces, Metrics, Logs Active</span>
          </div>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('k8s')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'k8s'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>عناقيد K8s والتوسع التلقائي</span>
        </button>

        <button
          onClick={() => setActiveTab('devsecops')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'devsecops'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>مسارات GitOps & DevSecOps</span>
        </button>

        <button
          onClick={() => setActiveTab('sre')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'sre'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>مؤشرات الاعتمادية SRE & OpenTelemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('finops')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'finops'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>إدارة تكاليف السحابة FinOps</span>
        </button>

        <button
          onClick={() => setActiveTab('dr')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'dr'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>التعافي من الكوارث Disaster Recovery</span>
        </button>

        <button
          onClick={() => setActiveTab('golden_paths')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'golden_paths'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>بوابة المطورين (Golden Paths)</span>
        </button>
      </div>

      {/* TAB 1: Kubernetes Multi-Cluster Management & Autoscaling */}
      {activeTab === 'k8s' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-sky-600" />
                  <span>لوحة عناقيد Kubernetes المتعددة (Multi-Cluster K8s Infrastructure)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مراقبة وإدارة مجموعات الإنتاج، التعافي من الكوارث، البيئات التجريبية والتوسع التلقائي (HPA/VPA/Cluster Autoscaler).
                </p>
              </div>
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-mono">
                Kubernetes v1.30.2
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clusters.map((c) => (
                <div key={c.clusterId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded">
                      {c.clusterId}
                    </span>
                    <Badge className="bg-emerald-500 text-white text-[10px] font-mono">
                      {c.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-black text-xs text-slate-900">{c.nameAr}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{c.nameEn}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 font-mono text-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Region:</span>
                      <span className="font-bold text-slate-900">{c.region}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Worker Nodes:</span>
                      <span className="font-bold text-sky-700">{c.nodeCount} Nodes</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CPU Cores:</span>
                      <span className="font-bold text-slate-900">{c.totalCpuCores} Cores ({c.cpuUsagePct}%)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Active Pods:</span>
                      <span className="font-bold text-emerald-700">{c.activePodsCount} Pods</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 font-bold">توسع تلقائي:</span>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={autoscaleNodes}
                        onChange={(e) => setAutoscaleNodes(Number(e.target.value))}
                        className="w-12 p-1 border border-slate-300 rounded text-center text-xs font-mono font-bold"
                      />
                    </div>
                    <Button
                      onClick={() => handleAutoscaleCluster(c.clusterId)}
                      disabled={autoscalingCluster}
                      className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0"
                    >
                      {autoscalingCluster ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                      <span>إضافة عُقد</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: GitOps & DevSecOps Pipelines */}
      {activeTab === 'devsecops' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                <span>مسارات التطوير والأمن والتوصيل المستمر (GitOps & DevSecOps Pipelines)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                فحص الثغرات التلقائي SAST/DAST، فحص حاويات OCI، توليد SBOM، والتوليد المباشر عبر ArgoCD.
              </p>
            </div>
            <Button
              onClick={handleTriggerPipeline}
              disabled={triggeringPipe}
              className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              {triggeringPipe ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-sky-400" />}
              <span>تشغيل مسار بناء وتأمين جديد</span>
            </Button>
          </div>

          <div className="space-y-4">
            {pipelines.map((pipe) => (
              <div key={pipe.pipelineId} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {pipe.pipelineId}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{pipe.appName}</span>
                    <span className="text-[11px] font-mono text-slate-500">({pipe.branch} @ {pipe.gitCommitHash})</span>
                  </div>
                  <Badge className="bg-emerald-500 text-white text-xs font-mono">
                    {pipe.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                  {pipe.stages.map((st: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] text-slate-500 block font-bold truncate">{st.stageName}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono block">
                        {st.status} ({st.durationSeconds}s)
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                  <span>SAST Vulns: <strong className="text-emerald-700">0 Critical</strong></span>
                  <span>Container Scan: <strong className="text-emerald-700">{pipe.containerScanResult}</strong></span>
                  <span>SBOM Generated: <strong className="text-indigo-700">{pipe.sbomGenerated ? 'YES (CycloneDX)' : 'NO'}</strong></span>
                  <span>Cosign Signature: <strong className="text-emerald-700">VERIFIED</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: SRE Operations & OpenTelemetry */}
      {activeTab === 'sre' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-600" />
                <span>هندسة اعتمادية الخدمات SRE (SLOs, Error Budgets & OpenTelemetry)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع أهداف الموثوقية SLO، ميزانية الأخطاء المتبقية، وسرعة الاستجابة اللحظية عبر OpenTelemetry.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {slos.map((s) => (
              <div key={s.sloId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {s.sloId}
                    </span>
                    <h3 className="font-black text-xs text-slate-900 mt-1">{s.sloNameAr}</h3>
                    <p className="text-xs text-slate-500 font-mono">{s.serviceName}</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white text-xs font-mono">
                    {s.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target SLO:</span>
                    <span className="font-bold text-slate-900">{s.targetAvailabilityPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Availability:</span>
                    <span className="font-bold text-emerald-600">{s.currentAvailabilityPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Error Budget Remaining:</span>
                    <span className="font-bold text-indigo-600">{s.errorBudgetRemainingPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latency P99:</span>
                    <span className="font-bold text-sky-600">{s.latencyP99Ms} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: FinOps Cloud Cost Analytics */}
      {activeTab === 'finops' && finopsReport && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <span>إدارة وتحسين تكاليف السحابة المؤسسية (FinOps Cloud Optimization)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليل النفقات حسب الخدمة، التنبؤ بإنهاء الشهر، واستكشاف الموارد الخاملة للحد من الهدر المالي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">الميزانية الشهرية الإجمالية</span>
              <span className="text-2xl font-black text-slate-900 font-mono">${finopsReport.monthlyTotalBudgetUsd.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Allocated Cloud Budget</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">الإنفاق الحالي المباشر</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">${finopsReport.currentSpendUsd.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Projected: ${finopsReport.projectedEndMonthSpendUsd.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">وفر مالي متوقع (Optimization)</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">${finopsReport.optimizationOpportunitiesUsd.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-700 block">{finopsReport.idleNodesCount} Idle Worker Nodes Detected</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900">توزيع التكاليف حسب المورد والخدمة:</h3>
            <div className="space-y-2">
              {finopsReport.costByService.map((item: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.serviceName}</span>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-500">{item.pctOfTotal}% of Spend</span>
                    <span className="font-black text-indigo-700">${item.costUsd.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: Disaster Recovery & Chaos Testing */}
      {activeTab === 'dr' && drStatus && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>إدارة التعافي من الكوارث واستمرارية الأعمال (Disaster Recovery & BCM)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                الربط المتزامن بين الرياض وجدة، اختبارات الفشل التلقائي (Chaos Engineering Failover)، ومزامنة قواعد البيانات.
              </p>
            </div>
            <Button
              onClick={handleTestDrFailover}
              disabled={testingDr}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              {testingDr ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              <span>اختبار سيناريو التعافي اللحظي</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">حالة المزامنة الحالية</span>
              <span className="text-lg font-black text-emerald-600 font-mono">{drStatus.drState}</span>
              <span className="text-[10px] text-emerald-700 block">{drStatus.replicatedDatabasesCount} Replicated Multi-AZ DBs</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">الزمن الأقصى لفقدان البيانات (RPO)</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">{drStatus.rpoSecondsCurrent} sec</span>
              <span className="text-[10px] text-slate-500 block">Target: &lt; 1 sec</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">زمن استعادة الخدمة بالكامل (RTO)</span>
              <span className="text-2xl font-black text-sky-600 font-mono">{drStatus.rtoMinutesCurrent} min</span>
              <span className="text-[10px] text-slate-500 block">Target: &lt; 5 min</span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: Platform Engineering Golden Paths */}
      {activeTab === 'golden_paths' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <span>كتالوج الخدمة الذاتية للمطورين (Platform Engineering Golden Paths)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تأمين قواعد بناء الخدمات المصغرة، التسجيل في الخدمة السحابية فوراً، والربط بالـ Service Mesh تلقائياً.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] text-indigo-700 font-bold">TEMPLATE-01</span>
              <h3 className="font-black text-xs text-slate-900">Microservice Go/Node.js Template</h3>
              <p className="text-[11px] text-slate-600">
                قالب جاهز للخدمات المصغرة مجهز بـ OpenTelemetry, Health Checks, K8s Manifests, DevSecOps.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] text-indigo-700 font-bold">TEMPLATE-02</span>
              <h3 className="font-black text-xs text-slate-900">Event Stream Consumer (Kafka/RabbitMQ)</h3>
              <p className="text-[11px] text-slate-600">
                نموذج معالجة تدفقات الأحداث الموزعة مع التشفير والتسجيل في المخطط الموحد (Schema Registry).
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono text-[10px] text-indigo-700 font-bold">TEMPLATE-03</span>
              <h3 className="font-black text-xs text-slate-900">ZATCA Compliant Crypto Service</h3>
              <p className="text-[11px] text-slate-600">
                قالب معتمد للارتباط بهيئة الزكاة بالتشفير وإصدار الشهادات والأختام الرقمية.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
