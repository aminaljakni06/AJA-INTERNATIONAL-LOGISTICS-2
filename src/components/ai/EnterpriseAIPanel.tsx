import React, { useState, useEffect } from 'react';
import {
  Bot,
  BrainCircuit,
  Cpu,
  Search,
  Zap,
  ShieldCheck,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Send,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Database,
  Lock,
  Globe2,
  LineChart,
  Users,
  Compass,
  SlidersHorizontal,
  DollarSign,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface Agent {
  id: string;
  nameEn: string;
  nameAr: string;
  department: string;
  description: string;
  capabilities: string[];
  securityLevel: string;
  modelPreference: string;
  status: string;
}

export const EnterpriseAIPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'agents' | 'rag' | 'decision' | 'document' | 'telemetry'>('agents');

  // Agent Workbench State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('EXECUTIVE_ADVISOR');
  const [agentQuery, setAgentQuery] = useState('');
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<any>(null);
  const [loadingRag, setLoadingRag] = useState(false);

  // Decision Intelligence State
  const [decisionType, setDecisionType] = useState<string>('CARRIER_SELECTION');
  const [decisionResult, setDecisionResult] = useState<any>(null);
  const [loadingDecision, setLoadingDecision] = useState(false);

  // Document Intelligence State
  const [docType, setDocType] = useState<'BILL_OF_LADING' | 'COMMERCIAL_INVOICE' | 'CUSTOMS_DECLARATION'>('BILL_OF_LADING');
  const [docName, setDocName] = useState('Bill_of_Lading_MAEU98210.pdf');
  const [docResult, setDocResult] = useState<any>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Telemetry State
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchTelemetry();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/ai/platform/agents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('Failed to fetch AI agents catalog', err);
    }
  };

  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const res = await fetch('/api/ai/platform/telemetry', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI telemetry', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  const handleInvokeAgent = async () => {
    if (!agentQuery.trim() || loadingAgent) return;
    setLoadingAgent(true);
    try {
      const res = await fetch('/api/ai/platform/agent/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentRole: selectedAgentId,
          query: agentQuery.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAgentResponse(data);
      }
    } catch (err) {
      console.error('Error invoking agent', err);
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleRagSearch = async () => {
    if (!ragQuery.trim() || loadingRag) return;
    setLoadingRag(true);
    try {
      const res = await fetch('/api/ai/platform/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: ragQuery.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setRagResult(data);
      }
    } catch (err) {
      console.error('Error executing RAG search', err);
    } finally {
      setLoadingRag(false);
    }
  };

  const handleRunDecision = async () => {
    setLoadingDecision(true);
    try {
      const res = await fetch('/api/ai/platform/decision-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decisionType,
          parameters: { origin: 'China Ningbo', destination: 'Jeddah Port', cbm: 45, weightKg: 14000 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDecisionResult(data);
      }
    } catch (err) {
      console.error('Error running decision intelligence', err);
    } finally {
      setLoadingDecision(false);
    }
  };

  const handleDocExtract = async () => {
    setLoadingDoc(true);
    try {
      const res = await fetch('/api/ai/platform/doc-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: docType,
          fileName: docName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDocResult(data);
      }
    } catch (err) {
      console.error('Error extracting document OCR', err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#082F49] via-[#0F4C75] to-[#1B262C] text-white p-6 rounded-3xl shadow-xl border border-sky-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <BrainCircuit className="w-8 h-8 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">منصة الذكاء الاصطناعي المؤسسي والعمليات المستقلة</h1>
              <Badge className="bg-sky-400/20 text-sky-300 border-sky-400/40 text-[10px] font-extrabold">
                AJA AI Orchestrator
              </Badge>
            </div>
            <p className="text-xs text-sky-100/80 mt-1 max-w-2xl">
              21 مساعداً ذكياً متقناً، محرك القرارات والتحليل التنبؤي، البحث المعرفي RAG الموثق بالمرجعيات، واستخراج مستندات الشحن والجمارك الرقمية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTelemetry}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 transition-all font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTelemetry ? 'animate-spin' : ''}`} />
            <span>تحديث المؤشرات</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'agents'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>المساعدون الذكيون (21 Agent)</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'rag'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>البحث المعرفي الموثق (RAG)</span>
        </button>

        <button
          onClick={() => setActiveTab('decision')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'decision'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>محرك القرارات والتنبؤ الذكي</span>
        </button>

        <button
          onClick={() => setActiveTab('document')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'document'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>استخراج مستندات OCR الرقمية</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'telemetry'
              ? 'bg-[#082F49] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>مؤشرات الأمان والنمذجة المتعددة</span>
        </button>
      </div>

      {/* TAB 1: Specialized Agents Catalog & Workbench */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Catalog Selector */}
          <Card className="lg:col-span-1 p-4 space-y-3 max-h-[620px] overflow-y-auto">
            <h3 className="font-extrabold text-xs text-slate-700 flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F4C75]" />
                <span>كتالوج المساعدين التخصصيين ({agents.length})</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Active Platform
              </span>
            </h3>

            <div className="space-y-2">
              {agents.map((ag) => {
                const isSelected = ag.id === selectedAgentId;
                return (
                  <button
                    key={ag.id}
                    onClick={() => {
                      setSelectedAgentId(ag.id);
                      setAgentResponse(null);
                    }}
                    className={`w-full text-right p-3 rounded-2xl border text-xs transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#0F4C75] text-white border-[#082F49] shadow-md'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0F4C75]'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black truncate">{ag.nameAr}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ag.securityLevel}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                        {ag.department}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Agent Workbench Panel */}
          <Card className="lg:col-span-2 p-5 space-y-4 flex flex-col justify-between min-h-[620px]">
            {selectedAgent ? (
              <div className="space-y-4">
                {/* Agent Detail Banner */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-sm text-slate-900">{selectedAgent.nameAr}</h2>
                      <span className="text-xs text-slate-500 font-mono">({selectedAgent.nameEn})</span>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {selectedAgent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{selectedAgent.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedAgent.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-medium"
                        >
                          ⚡ {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-[10px] font-mono bg-sky-50 text-sky-800 px-2 py-1 rounded-lg border border-sky-200 block">
                      {selectedAgent.modelPreference}
                    </span>
                  </div>
                </div>

                {/* Prompt Input Form */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    توجيه استفسار أو مهمة للمساعد الذكي ({selectedAgent.nameAr}):
                  </label>
                  <textarea
                    rows={3}
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                    placeholder={`اكتب استفسارك بالتفصيل (مثلاً: حلل التغيرات في الهامش الربحي للشحن البحري أو اقترح توصية تخزين)...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#0F4C75] focus:bg-white outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      سيتم التوجيه آلياً لأفضل نموذج ذكاء اصطناعي مع فحص ضوابط السلامة وحماية البيانات.
                    </span>
                    <Button
                      onClick={handleInvokeAgent}
                      disabled={!agentQuery.trim() || loadingAgent}
                      className="bg-[#0F4C75] hover:bg-[#082F49] text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold"
                    >
                      {loadingAgent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
                      <span>تنفيذ مهمة المساعد</span>
                    </Button>
                  </div>
                </div>

                {/* Response Display Box */}
                {agentResponse && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-extrabold text-[#0F4C75] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>رد المساعد المؤسسي والمراجع</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Model: {agentResponse.modelRoute?.selectedModel} ({agentResponse.modelRoute?.estimatedLatencyMs}ms)
                      </span>
                    </div>

                    <div className="whitespace-pre-line text-xs leading-relaxed text-slate-800">
                      {agentResponse.responseText}
                    </div>

                    {agentResponse.ragContext?.documents?.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                        <span className="font-extrabold text-slate-700 block">📚 المراجع والمصادر المستخدمة في التحليل:</span>
                        {agentResponse.ragContext.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="text-slate-600 text-[10px] font-mono">
                            • {doc.citation} - درجة المطابقة ({Math.round(doc.relevanceScore * 100)}%)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
                <Bot className="w-10 h-10 stroke-1" />
                <p className="text-xs">يرجى اختيار مساعد ذكي من القائمة لبدء التفاعل المباشر.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: Enterprise Hybrid RAG Search */}
      {activeTab === 'rag' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#0F4C75]" />
                <span>محرك البحث المعرفي الهجين المؤسسي (Enterprise RAG Engine)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                استعلام فوري وموثق في سياسات التخليص الجمركي، اتفاقيات الشحن، لوائح ZATCA، وقواعد WMS بالمستودعات مع إرجاع المراجع الدقيقة.
              </p>
            </div>
            <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-mono">
              Vector + Semantic Hybrid Search
            </Badge>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="ابحث في قاعدة المعرفة المؤسسية (مثلاً: متطلبات الفسح الجمركي عبر منصة فسح أو سياسة الشحن البحري)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#0F4C75] focus:bg-white outline-none"
            />
            <Button
              onClick={handleRagSearch}
              disabled={!ragQuery.trim() || loadingRag}
              className="bg-[#0F4C75] hover:bg-[#082F49] text-white text-xs px-5 py-3 rounded-xl flex items-center gap-2 font-bold"
            >
              {loadingRag ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>بحث موثق RAG</span>
            </Button>
          </div>

          {ragResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-900">النتيجة المعرفية المجمعة:</span>
                  <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                    Confidence: {Math.round(ragResult.confidenceScore * 100)}%
                  </span>
                </div>
                <div className="whitespace-pre-line text-xs text-slate-800 leading-relaxed">
                  {ragResult.synthesizedAnswer}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-700">المستندات ذات الصلة المسحوبة من السجل:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ragResult.documents?.map((doc: any, i: number) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 truncate">{doc.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{doc.snippet}</p>
                      <div className="text-[9px] text-[#0F4C75] font-mono pt-1 border-t border-slate-100">
                        {doc.citation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: Decision Intelligence & Predictive Optimizer */}
      {activeTab === 'decision' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>محرك القرارات والتنبؤ الذكي (Decision Intelligence Engine)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليل القرارات الديناميكية لاختيار الناقل الملاحي، التوجيه البري، التسعير الديناميكي، والتنبؤ بحجم الطلب ومخاطر التأخير.
              </p>
            </div>
            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
              Real-Time Optimization
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">نوع القرار المطلوب:</label>
              <select
                value={decisionType}
                onChange={(e) => setDecisionType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#0F4C75] outline-none"
              >
                <option value="CARRIER_SELECTION">اختيار الناقل الملاحي الأمثل (Carrier Selection)</option>
                <option value="ROUTE_OPTIMIZATION">تحسين مسار الشاحنات البرية (Route Optimization)</option>
                <option value="DYNAMIC_PRICING">التسعير الديناميكي لطلبات الأسعار (Dynamic Pricing)</option>
                <option value="INVENTORY_ALLOCATION">تخصيص وتوزيع المخزون الذكي (Inventory Allocation)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2 flex items-end justify-end">
              <Button
                onClick={handleRunDecision}
                disabled={loadingDecision}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md"
              >
                {loadingDecision ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>تشغيل محرك القرارات والتحسين</span>
              </Button>
            </div>
          </div>

          {decisionResult && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-black text-xs text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>التوصية النهائية للقرار الذكي ({decisionResult.decisionType})</span>
                </span>
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Score: {Math.round(decisionResult.confidenceScore * 100)}%
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900">
                {decisionResult.recommendation}
              </div>

              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-extrabold block text-slate-900">موجز التحليل والتعليل الذكي:</span>
                <p className="leading-relaxed text-slate-600">{decisionResult.reasoningSummary}</p>
              </div>

              {decisionResult.costSavingsEstimatedSAR && (
                <div className="flex items-center gap-4 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-extrabold flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    وفر مالي متوقع: {decisionResult.costSavingsEstimatedSAR.toLocaleString()} SAR
                  </span>
                  {decisionResult.timeSavingsMinutes && (
                    <span className="font-extrabold flex items-center gap-1 border-r border-emerald-200 pr-4">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      اختصار زمن: {Math.round(decisionResult.timeSavingsMinutes / 60)} ساعة
                    </span>
                  )}
                </div>
              )}

              {decisionResult.alternativeOptions?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-800 block">الخيارات البديلة التي تم تحليلها:</span>
                  <div className="space-y-1.5">
                    {decisionResult.alternativeOptions.map((alt: any, i: number) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{alt.option}</span>
                        <span className="text-slate-500">{alt.tradeOff}</span>
                        <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          Score: {alt.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: Document Intelligence & OCR */}
      {activeTab === 'document' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>ذكاء تحليل واستخراج المستندات الرقمية (Document OCR Intelligence)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                استخراج الحقول الهيكلية، الفواتير التجارية، بوالص الشحن، وإعلانات الفسح الجمركي والتحقق التلقائي من مطابقتها.
              </p>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-mono">
              AI OCR & Entity Matching
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">نوع المستند اللوجستي:</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="BILL_OF_LADING">بوليصة شحن بحري (Bill of Lading)</option>
                <option value="COMMERCIAL_INVOICE">فاتورة تجارية (Commercial Invoice ZATCA)</option>
                <option value="CUSTOMS_DECLARATION">بيان فسح جمركي (Fasah Customs Declaration)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2 flex items-end justify-end">
              <Button
                onClick={handleDocExtract}
                disabled={loadingDoc}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md"
              >
                {loadingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                <span>استخراج الحقول ومطابقة الامتثال</span>
              </Button>
            </div>
          </div>

          {docResult && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-black text-xs text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>نتائج الاستخراج الرقمي والتحقق الجمركي ({docResult.documentType})</span>
                </span>
                <span className="text-xs font-mono bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded font-bold">
                  OCR Accuracy: {Math.round(docResult.ocrConfidence * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(docResult.extractedFields || {}).map(([key, val], idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                    <span className="font-bold text-slate-600">{key}:</span>
                    <span className="font-mono text-slate-900 font-extrabold truncate max-w-[200px]">
                      {Array.isArray(val) ? val.join(', ') : String(val)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{docResult.complianceNotes}</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: AI Safety, Model Routing & Telemetry */}
      {activeTab === 'telemetry' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>مؤشرات الأمان والنمذجة المتعددة (AI Safety & Multi-Model Telemetry)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة أداء نماذج الذكاء الاصطناعي، زمن الاستجابة SLO، التكلفة التقديرية، وحاجز حماية بيانات العملاء وPrompt Injection.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
              SOC2 & ISO 27001 AI Shield
            </Badge>
          </div>

          {telemetry ? (
            <div className="space-y-6">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">إجمالي عمليات الاستدلال</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {telemetry.telemetry?.totalInferences?.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">متوسط زمن الاستجابة (Latency)</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">
                    {telemetry.telemetry?.avgLatencyMs} ms
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">المساعدون النشطون (Agents)</span>
                  <span className="text-lg font-black text-[#0F4C75] font-mono">
                    {telemetry.telemetry?.activeAgentsCount} Active
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">التدخلات الأمنية والحجب المحمي</span>
                  <span className="text-lg font-black text-amber-600 font-mono">
                    {telemetry.telemetry?.safetyBlocksCount} Blocks
                  </span>
                </div>
              </div>

              {/* Available Models Breakdown Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800">مصفوفة النماذج المدعومة واستراتيجية التوجيه الآلي:</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="p-3">اسم النموذج (Model Alias)</th>
                        <th className="p-3">مزود الخدمة</th>
                        <th className="p-3">متوسط الاستجابة</th>
                        <th className="p-3">مستوى الأمان</th>
                        <th className="p-3">حالة التوجيه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {telemetry.models?.availableModels?.map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-extrabold text-slate-900 font-mono">{m.model}</td>
                          <td className="p-3 text-slate-600">{m.provider}</td>
                          <td className="p-3 font-mono text-emerald-700">{m.avgLatencyMs} ms</td>
                          <td className="p-3 font-mono font-extrabold text-sky-800">{m.securityScore}/100</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              {m.model === 'gemini-3.6-flash' ? 'Primary Active' : 'Available Route'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              جاري تحميل بيانات المؤشرات...
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
