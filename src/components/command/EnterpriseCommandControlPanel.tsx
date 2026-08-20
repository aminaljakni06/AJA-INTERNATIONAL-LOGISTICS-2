import React, { useState, useEffect } from 'react';
import {
  Globe,
  Radio,
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Compass,
  Play,
  RotateCw,
  RefreshCw,
  BarChart3,
  Layers,
  MapPin,
  Building2,
  Truck,
  Cpu,
  DollarSign,
  Briefcase,
  FileText,
  Sliders,
  Flame,
  Clock,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const EnterpriseCommandControlPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'cockpit' | 'twin' | 'ai_decision' | 'crisis' | 'simulations'>('cockpit');

  const [overview, setOverview] = useState<any>(null);
  const [twinEntities, setTwinEntities] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCommandData();
  }, []);

  const fetchAllCommandData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, twinRes, aiRes, crisisRes, simRes] = await Promise.all([
        fetch('/api/command/overview', { headers }),
        fetch('/api/command/digital-twin/entities', { headers }),
        fetch('/api/command/ai-decision/recommendations', { headers }),
        fetch('/api/command/crisis/incidents', { headers }),
        fetch('/api/command/simulations/scenarios', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (twinRes.ok) {
        const data = await twinRes.json();
        setTwinEntities(data.entities || []);
      }
      if (aiRes.ok) {
        const data = await aiRes.json();
        setAiRecommendations(data.recommendations || []);
      }
      if (crisisRes.ok) {
        const data = await crisisRes.json();
        setIncidents(data.incidents || []);
      }
      if (simRes.ok) {
        const data = await simRes.json();
        setSimulations(data.scenarios || []);
      }
    } catch (err) {
      console.error('Error fetching command & control platform data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAiRecommendation = async (recommendationId: string) => {
    setProcessingId(recommendationId);
    setActionMessage(null);
    try {
      const res = await fetch('/api/command/ai-decision/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recommendationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        await fetchAllCommandData();
      }
    } catch (err) {
      console.error('Error approving recommendation', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRunSimulation = async (scenarioId: string) => {
    setProcessingId(scenarioId);
    setActionMessage(null);
    try {
      const res = await fetch('/api/command/simulations/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scenarioId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.executionLogsAr);
        await fetchAllCommandData();
      }
    } catch (err) {
      console.error('Error running simulation scenario', err);
    } finally {
      setProcessingId(null);
    }
  };

  const kpis = overview?.kpis;

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0B0F19] via-[#1E1B4B] to-[#311B92] text-white p-6 rounded-3xl shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">مركز القيادة والسيطرة والتوأم الرقمي Enterprise C4I & Digital Twin</h1>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/40 text-[10px] font-extrabold">
                Global Operations Cockpit
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              النظام التشغيلي التنفيذي الشامل للشركة: رؤية لحظية ثلاثية الأبعاد (Digital Twin)، اتخاذ القرارات المدعومة بالذكاء الاصطناعي (AI Decision Center)، وغرفة إدارة الأزمات (Crisis War Room).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllCommandData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 transition-all font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الرادار التنفيذي</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards Overview */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">الإيراد الشهري المباشر</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 font-mono">{(kpis.grossRevenueMonthlySar / 1000000).toFixed(1)}M</span>
              <span className="text-[10px] text-emerald-600 font-bold">SAR</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">هامش أرباح {kpis.operatingMarginPct}%</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">السيولة النقدية الخزينة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-indigo-600 font-mono">{(kpis.cashPositionSar / 1000000).toFixed(1)}M</span>
              <span className="text-[10px] text-indigo-600 font-bold">SAR</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">رأس المال العامل { (kpis.workingCapitalSar / 1000000).toFixed(1) }M</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">الطلبات والشحنات النشطة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-sky-600 font-mono">{kpis.activeOrdersCount.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-sky-700 font-bold">جاهزية الأسطول {kpis.fleetAvailabilityPct}%</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">رضا العملاء والامتثال</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-600 font-mono">{kpis.customerSatisfactionScore}</span>
              <span className="text-[10px] text-slate-400 font-bold">/ 5.0</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">امتثال {kpis.complianceScorePct}%</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">دقة قرارات الذكاء AI</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-indigo-600 font-mono">{kpis.aiAgentDecisionAccuracyPct}%</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">Autonomous Actions Active</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">تقييم المخاطر الإجمالي</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-600 font-mono">طبيعي منخفض</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">ISO 31000 Compliant</span>
          </div>
        </div>
      )}

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'cockpit'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>مقصورة القيادة التنفيذية Executive Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab('twin')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'twin'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>التوأم الرقمي للمؤسسة Digital Twin</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_decision')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'ai_decision'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>مركز قرارات الذكاء الاصطناعي AI Decision</span>
        </button>

        <button
          onClick={() => setActiveTab('crisis')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'crisis'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>غرفة إدارة الأزمات Crisis War Room</span>
        </button>

        <button
          onClick={() => setActiveTab('simulations')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'simulations'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>محرك محاكاة السيناريوهات What-If</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE COCKPIT */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>المؤشرات المالية والتنفيذية الاستراتيجية</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">الإيراد الشهري المباشر (Monthly Gross Revenue):</span>
                <span className="font-black font-mono text-slate-900">48,500,000 SAR</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">هامش الربح التشغيلي (Operating Margin):</span>
                <span className="font-black font-mono text-emerald-600">24.8%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">سيولة الخزينة والصكوك (Cash & Treasury):</span>
                <span className="font-black font-mono text-indigo-600">128,400,000 SAR</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">نسبة الاستفادة من المستودعات:</span>
                <span className="font-black font-mono text-sky-600">86.2%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <span>الحوكمة والامتثال والسلامة التشغيلية</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">معدل الامتثال الجمركي والتنظيمي (ZATCA / Port):</span>
                <span className="font-black font-mono text-emerald-600">99.9%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">دقة توجيه وكلاء الذكاء الاصطناعي Autonomous AI:</span>
                <span className="font-black font-mono text-indigo-600">98.8%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">درجة رضا العملاء كبار الحسابات (Enterprise CSAT):</span>
                <span className="font-black font-mono text-emerald-600">4.94 / 5.0</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">مؤشر الاستدامة البيئية وتقليل الانبعاثات (ESG):</span>
                <span className="font-black font-mono text-emerald-600">A+ Certified</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: DIGITAL TWIN */}
      {activeTab === 'twin' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <span>التمثيل الرقمي الحكيم للمؤسسة (Live Enterprise Digital Twin)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مزامنة لحظية ثلاثية الأبعاد للمستودعات، الموانئ، أسطول الشاحنات الباردة، وعناقيد خوادم الذكاء الاصطناعي.
              </p>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-mono">
              Live Spatial Mesh Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {twinEntities.map((e) => (
              <div key={e.entityId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                    {e.entityId}
                  </span>
                  <Badge className="bg-emerald-500 text-white text-[10px] font-mono">
                    {e.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-xs text-slate-900">{e.nameAr}</h3>
                  <p className="text-xs text-slate-500 font-mono">{e.locationGeographic.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 font-mono text-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Utilization Rate:</span>
                    <span className="font-bold text-slate-900">{e.utilizationPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Load Units:</span>
                    <span className="font-bold text-indigo-700">{e.activeLoadUnits.toLocaleString()}</span>
                  </div>
                  {e.temperatureCelsius !== undefined && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cold-Chain Temp:</span>
                      <span className="font-bold text-sky-600">{e.temperatureCelsius} °C</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: AI DECISION CENTER */}
      {activeTab === 'ai_decision' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-sky-600" />
                <span>مركز توصيات وقرارات الذكاء الاصطناعي (AI Decision Center)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                توصيات توجيه اللوجستيات، إعادة توزيع السيولة، وإعادة توزيع المخزون مع نسب الثقة والأثر المالي المحسوب بالريال.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {aiRecommendations.map((rec) => (
              <div key={rec.recommendationId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-bold">
                      {rec.recommendationId}
                    </span>
                    <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-mono">
                      {rec.domain}
                    </Badge>
                  </div>
                  <Badge className={rec.status === 'EXECUTED_AUTO' ? 'bg-emerald-500 text-white text-[10px]' : 'bg-amber-500 text-white text-[10px]'}>
                    {rec.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-xs text-slate-900">{rec.titleAr}</h3>
                  <p className="text-xs text-slate-600 mt-1">{rec.supportingEvidenceAr}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Financial Benefit:</span>
                    <strong className="text-emerald-700 font-bold">+{rec.impactEstimateSar.toLocaleString()} SAR</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Confidence:</span>
                    <strong className="text-indigo-700 font-bold">{rec.confidencePct}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">AI Model:</span>
                    <span className="text-slate-700 font-bold">{rec.aiAgentModel}</span>
                  </div>
                  {rec.status === 'PENDING_APPROVAL' && (
                    <Button
                      onClick={() => handleApproveAiRecommendation(rec.recommendationId)}
                      disabled={processingId === rec.recommendationId}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      {processingId === rec.recommendationId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      <span>اعتماد وتنفيذ التوصية</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: CRISIS WAR ROOM */}
      {activeTab === 'crisis' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <span>غرفة العمليات والأزمات الطارئة (Crisis War Room & BCM)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة الحوادث التشغيلية، الظروف الجوية، الخطط البديلة، واستمرارية الأعمال الميدانية وفق ISO 22301.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {incidents.map((inc) => (
              <div key={inc.incidentId} className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                      {inc.incidentId}
                    </span>
                    <Badge className="bg-amber-600 text-white text-[10px] font-bold">
                      {inc.severity}
                    </Badge>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{new Date(inc.declaredAt).toLocaleTimeString('ar-SA')}</span>
                </div>

                <div>
                  <h3 className="font-black text-xs text-amber-950">{inc.titleAr}</h3>
                  <p className="text-xs text-amber-800">المنطقة المتأثرة: {inc.affectedRegion} | القائد الميداني: {inc.leadCommander}</p>
                </div>

                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-amber-200 text-xs">
                  <span className="font-bold text-slate-900 block text-[11px]">قائمة إجراءات التدخل العاجل:</span>
                  {inc.actionItems.map((act: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${act.completed ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span>{act.actionAr}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">[{act.owner}]</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: WHAT-IF SIMULATIONS */}
      {activeTab === 'simulations' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>محرك محاكاة السيناريوهات الافتراضية (What-If Simulation Engine)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اختبار القرارات قبل تطبيقها: محاكاة أثر توسعة الأسطول، افتتاحات الفروع، وتغيير تسعير الشحنات.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulations.map((s) => (
              <div key={s.scenarioId} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                    {s.scenarioId}
                  </span>
                  <Badge className="bg-indigo-600 text-white text-[10px] font-mono">
                    Physics Engine Verified
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-xs text-slate-900">{s.titleAr}</h3>
                  <p className="text-xs text-slate-500 font-mono">{s.parameterAdjustments}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 font-mono text-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">تغير الهامش:</span>
                    <strong className="text-emerald-600 font-bold">{s.simulatedMarginChangePct > 0 ? `+${s.simulatedMarginChangePct}%` : `${s.simulatedMarginChangePct}%`}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">تأخير التسليم:</span>
                    <strong className="text-sky-600 font-bold">{s.simulatedDeliveryTimeChangeHours} hrs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">تقليل المخاطر:</span>
                    <strong className="text-indigo-600 font-bold">{s.riskReductionScorePct}%</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-600 italic">{s.recommendationNote}</span>
                  <Button
                    onClick={() => handleRunSimulation(s.scenarioId)}
                    disabled={processingId === s.scenarioId}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {processingId === s.scenarioId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-sky-400" />}
                    <span>تشغيل المحاكاة</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
