import React, { useState, useEffect } from 'react';
import {
  Share2,
  Server,
  Zap,
  ShieldCheck,
  Code2,
  GitBranch,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Activity,
  Key,
  Globe2,
  Terminal,
  Cpu,
  BarChart3,
  FileCheck,
  Sliders,
  Send,
  Boxes,
  MessageSquare,
  Building,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const EnterpriseIntegrationPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'gateway' | 'events' | 'mesh' | 'workflows' | 'webhooks' | 'portal'>('gateway');

  // Core Integration States
  const [overview, setOverview] = useState<any>(null);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sagas, setSagas] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [meshTelemetry, setMeshTelemetry] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [devPortal, setDevPortal] = useState<any>(null);

  // Interaction States
  const [loading, setLoading] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState('API-SHIP-01');
  const [invokeResult, setInvokeResult] = useState<any>(null);
  const [invoking, setInvoking] = useState(false);
  const [publishingEvent, setPublishingEvent] = useState(false);
  const [testTopic, setTestTopic] = useState('aja.logistics.shipment.lifecycle');
  const [testEventType, setTestEventType] = useState('ShipmentStatusUpdatedEvent');
  const [publishResult, setPublishResult] = useState<any>(null);

  useEffect(() => {
    fetchAllIntegrationData();
  }, []);

  const fetchAllIntegrationData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        overviewRes,
        apisRes,
        eventsRes,
        wfRes,
        meshRes,
        whRes,
        connRes,
        devRes,
      ] = await Promise.all([
        fetch('/api/integration/overview', { headers }),
        fetch('/api/integration/apis', { headers }),
        fetch('/api/integration/events', { headers }),
        fetch('/api/integration/workflows', { headers }),
        fetch('/api/integration/service-mesh', { headers }),
        fetch('/api/integration/webhooks', { headers }),
        fetch('/api/integration/connectors', { headers }),
        fetch('/api/integration/developer-portal', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (apisRes.ok) {
        const data = await apisRes.json();
        setEndpoints(data.endpoints || []);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setTopics(data.topics || []);
        setSagas(data.sagas || []);
      }
      if (wfRes.ok) {
        const data = await wfRes.json();
        setWorkflows(data.workflows || []);
      }
      if (meshRes.ok) {
        const data = await meshRes.json();
        setMeshTelemetry(data.meshTelemetry || []);
      }
      if (whRes.ok) {
        const data = await whRes.json();
        setWebhooks(data.webhooks || []);
      }
      if (connRes.ok) {
        const data = await connRes.json();
        setConnectors(data.connectors || []);
      }
      if (devRes.ok) {
        setDevPortal(await devRes.json());
      }
    } catch (err) {
      console.error('Error fetching integration platform metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestInvoke = async () => {
    setInvoking(true);
    try {
      const res = await fetch('/api/integration/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpointId: selectedEndpointId,
          payload: { testBookingRef: 'AJA-TEST-9920', simulatedBy: 'GatewayConsole' },
        }),
      });
      if (res.ok) {
        setInvokeResult(await res.json());
      }
    } catch (err) {
      console.error('Error testing gateway endpoint', err);
    } finally {
      setInvoking(false);
    }
  };

  const handlePublishTestEvent = async () => {
    setPublishingEvent(true);
    try {
      const res = await fetch('/api/integration/event/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicName: testTopic,
          eventType: testEventType,
          eventPayload: {
            shipmentId: 'SH-88201',
            status: 'OUT_FOR_DELIVERY',
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        setPublishResult(await res.json());
        await fetchAllIntegrationData();
      }
    } catch (err) {
      console.error('Error publishing event', err);
    } finally {
      setPublishingEvent(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F4C75] text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <Share2 className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">منصة التكامل المؤسسي الموحدة (Enterprise iPaaS & Service Mesh)</h1>
              <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/40 text-[10px] font-extrabold">
                Zero Trust Architecture
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              إدارة بوابة الواجهات (API Gateway)، البث المباشر للفعاليات (Event Bus)، الربط الشبكي للخدمات المصغرة (Service Mesh)، محرك الأتمتة B2B EDI، والموصلات الموحدة لكافة الأنظمة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllIntegrationData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 transition-all font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث المنصة</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {overview?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">طلبات Gateway اليوم</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 font-mono">
                {(overview.summary.totalGatewayRequestsToday / 1000000).toFixed(2)}M
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Latency: {overview.summary.avgGatewayLatencyMs} ms</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">فعاليات ناقل البيانات (Events)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#0F4C75] font-mono">
                {(overview.summary.totalEventMessagesToday / 1000000).toFixed(1)}M
              </span>
            </div>
            <span className="text-[10px] text-sky-600 font-bold">Kafka & RabbitMQ</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">الموصلات المعتمدة (Connectors)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">{overview.summary.healthyConnectorsCount}</span>
              <span className="text-xs text-slate-500 font-bold">Active</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">SAP, ZATCA, Fasah, Adyen</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">معاملات Saga الأوركسترا</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-amber-600 font-mono">{overview.summary.activeSagasCount}</span>
              <span className="text-xs text-slate-500 font-bold">Active Sagas</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">Distributed Transactions</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">اشتراكات Webhook الشركاء</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-indigo-600 font-mono">{overview.summary.activeWebhooksCount}</span>
              <span className="text-xs text-slate-500 font-bold">Active</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">HMAC Signature Secured</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'gateway'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>بوابة الواجهات البرمجية (API Gateway)</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>ناقل الفعاليات ونمط Saga (Event Bus & Saga)</span>
        </button>

        <button
          onClick={() => setActiveTab('mesh')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'mesh'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>شبكة الخدمات والأمن (Service Mesh & mTLS)</span>
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'workflows'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>أوركسترا مسارات العمل B2B EDI</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'webhooks'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>الموصلات والـ Webhooks المعتمدة</span>
        </button>

        <button
          onClick={() => setActiveTab('portal')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'portal'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>بوابة المطورين والتحليلات (Developer Portal)</span>
        </button>
      </div>

      {/* TAB 1: API Gateway & Rate Limiting / Circuit Breaker */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-600" />
                  <span>دليل الواجهات البرمجية المدارة (Managed API Gateway Catalogue)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  توجيه حركة المرور، توثيق OAuth 2.1/mTLS/HMAC، حدود المعدل، وقواطع الدائرة الحامية (Circuit Breakers).
                </p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-mono">
                Envoy High Throughput Core
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">اسم الواجهة البرمجية</th>
                    <th className="p-3">المسار (Path)</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">آلية التوثيق</th>
                    <th className="p-3">حد المعدل / دقيقة</th>
                    <th className="p-3">زمن الاستجابة</th>
                    <th className="p-3">قاطع الدائرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {endpoints.map((ep) => (
                    <tr key={ep.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{ep.nameAr}</span>
                        <span className="font-mono text-[10px] text-slate-500">{ep.nameEn} ({ep.version})</span>
                      </td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{ep.path}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 border border-slate-200 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded text-slate-800">
                          {ep.type} ({ep.method})
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{ep.authMethod}</td>
                      <td className="p-3 font-mono text-slate-900">{ep.rateLimitPerMinute.toLocaleString()} req/m</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">{ep.avgLatencyMs} ms</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {ep.circuitBreaker}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Live API Gateway Test Sandbox */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <span>مختبر تجربة واستدعاء البوابة اللحظي (API Gateway Live Test Sandbox)</span>
            </h3>

            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={selectedEndpointId}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 flex-1 outline-none font-mono"
              >
                {endpoints.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.method} {e.path} — {e.nameAr}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleTestInvoke}
                disabled={invoking}
                className="bg-[#0F4C75] hover:bg-[#082F49] text-white text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shrink-0"
              >
                {invoking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>إرسال طلب تجريبي عبر Gateway</span>
              </Button>
            </div>

            {invokeResult && (
              <div className="bg-[#0F172A] p-4 rounded-2xl text-white font-mono text-xs space-y-2 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-emerald-400 font-bold">Status: {invokeResult.status} OK</span>
                  <span className="text-slate-400">Latency: {invokeResult.latencyMs} ms</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto text-[11px] p-2 bg-slate-900 rounded-xl">
                  {JSON.stringify(invokeResult, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: Event-Driven Architecture (EDA), Event Bus & Saga Pattern */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>مواضيع ناقل الفعاليات المركزي (Apache Kafka & RabbitMQ Event Bus Topics)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  بث الفعاليات غير المتزامن للشحنات والمدفوعات والأسطول مع الدعم التام لـ Dead Letter Queues.
                </p>
              </div>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-mono">
                Exactly-Once Processing
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((top) => (
                <div key={top.topicId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900">{top.topicName}</span>
                    <Badge className="bg-amber-500 text-white text-[10px] font-mono">
                      {top.brokerType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span>المعدل اللحظي:</span>
                      <span className="font-mono font-bold text-slate-900 block">{top.messagesPerSecond} msg/s</span>
                    </div>
                    <div>
                      <span>المجموع اليومي:</span>
                      <span className="font-mono font-bold text-slate-900 block">{top.totalMessagesToday.toLocaleString()}</span>
                    </div>
                    <div>
                      <span>عدد الأقسام (Partitions):</span>
                      <span className="font-mono font-bold text-slate-900 block">{top.partitionCount}</span>
                    </div>
                    <div>
                      <span>رسائل DLQ المتبقية:</span>
                      <span className="font-mono font-bold text-emerald-600 block">{top.deadLetterCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Distributed Saga Pattern Transactions */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-sky-600" />
                  <span>تنسيق المعاملات الموزعة بنمط Saga (Distributed Saga Transactions)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ضمان التنسيق والتراجع التعويضي (Compensation Actions) عبر الخدمات المستقلة دون التنازل عن الأداء.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sagas.map((s) => (
                <div key={s.sagaId} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">
                        {s.sagaId}
                      </span>
                      <h4 className="font-black text-xs text-slate-900 mt-1">{s.workflowName}</h4>
                    </div>
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-mono">
                      Status: {s.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
                    {s.stepsDetail.map((step: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[10px] space-y-1 text-center">
                        <span className="font-bold text-slate-800 block truncate">{step.stepName}</span>
                        <span className="text-slate-500 font-mono block">{step.service}</span>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                            step.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Service Mesh & Zero Trust Security */}
      {activeTab === 'mesh' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>شبكة الخدمات المصغرة والتشفير المتبادل (Istio Service Mesh & mTLS)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تأمين الاتصال الداخلي بين الخدمات ببروتوكول mTLS وتطبيق سياسات Canary Deployments التدرجية.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
              Strict mTLS Enforced
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meshTelemetry.map((mesh) => (
              <div key={mesh.serviceId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-slate-900">{mesh.serviceName}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    mTLS ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                  <div>
                    <span>عدد النسخ (Pods):</span>
                    <span className="font-mono font-bold text-slate-900 block">{mesh.instanceCount} Replicas</span>
                  </div>
                  <div>
                    <span>حركة المرور التجريبية:</span>
                    <span className="font-mono font-bold text-sky-700 block">{mesh.canaryTrafficPct}% Canary</span>
                  </div>
                  <div>
                    <span>متوسط الاستجابة:</span>
                    <span className="font-mono font-bold text-emerald-700 block">{mesh.avgLatencyMs} ms</span>
                  </div>
                  <div>
                    <span>استهلاك المعالج:</span>
                    <span className="font-mono font-bold text-slate-900 block">{mesh.cpuUsagePct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: Workflows & B2B EDI */}
      {activeTab === 'workflows' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-[#0F4C75]" />
                <span>أوركسترا مسارات العمل والتكامل الإلكتروني (B2B EDI & Workflow Orchestration)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                دعم قياسي لوثائق EDI 204/214/997، الفواتير التلقائية، وربط عمليات الشحن مع الزكاة ZATCA.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => (
              <div key={wf.workflowId} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                      {wf.workflowId}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 mt-1">{wf.nameAr}</h3>
                    <p className="text-xs text-slate-500 font-mono">{wf.nameEn}</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
                    Success: {wf.successRatePct}%
                  </Badge>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block mb-1">تسلسل خطوات الأتمتة:</span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
                    {wf.steps.map((st: string, idx: number) => (
                      <React.Fragment key={idx}>
                        <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-bold">
                          {idx + 1}. {st}
                        </span>
                        {idx < wf.steps.length - 1 && <span className="text-slate-400 font-mono">➔</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: Webhooks & Pre-Built Enterprise Connectors */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Boxes className="w-5 h-5 text-emerald-600" />
              <span>الموصلات المؤسسية المجهزة مسبقاً (Pre-built Enterprise Connectors)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map((conn) => (
                <div key={conn.connectorId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">{conn.nameAr}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      {conn.healthStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>مزود الخدمة:</span>
                      <span className="font-bold text-slate-900">{conn.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>البروتوكول:</span>
                      <span className="font-mono text-indigo-700 font-bold">{conn.protocol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معاملات اليوم:</span>
                      <span className="font-mono text-slate-900 font-bold">{conn.totalTransactionsToday.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Webhook Subscriptions */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              <span>اشتراكات الـ Webhooks وتوثيق التوقيع الرقمي HMAC</span>
            </h3>

            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.subscriptionId} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">{wh.partnerName}</span>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-mono">
                      Success: {wh.deliverySuccessRatePct}%
                    </Badge>
                  </div>

                  <div className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 truncate">
                    Target: {wh.targetUrl}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>الفعاليات المشتركة: {wh.subscribedEvents.join(', ')}</span>
                    <span className="font-mono text-emerald-700 font-bold">Key: {wh.secretKeyHmac}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: Developer Portal & API Analytics */}
      {activeTab === 'portal' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#0F4C75]" />
                <span>بوابة المطورين وتحليلات استخدام الواجهات (Developer Portal & API Analytics)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليلات معدل الاستهلاك، مواصفات OpenAPI / AsyncAPI، وإدارة مفاتيح API Keys المعتمدة.
              </p>
            </div>
          </div>

          {devPortal?.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">المطورون المسجلون</span>
                <span className="text-xl font-black text-slate-900 font-mono">{devPortal.metrics.totalRegisteredDevs}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">المفاتيح النشطة (API Keys)</span>
                <span className="text-xl font-black text-emerald-600 font-mono">{devPortal.metrics.activeApiKeys}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">مستندات OpenAPI</span>
                <span className="text-xl font-black text-[#0F4C75] font-mono">{devPortal.metrics.openApiDocCount} Specs</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">تجاوز حدود الاستخدام</span>
                <span className="text-xl font-black text-amber-600 font-mono">{devPortal.metrics.rateLimitExceededCount} Violations</span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
