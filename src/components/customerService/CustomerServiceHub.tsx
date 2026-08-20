import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  BookOpen,
  Star,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Send,
  Building,
  User,
  ArrowUpRight,
  HelpCircle,
  FileText,
  ThumbsUp,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ServiceCase,
  KnowledgeArticle,
  DepartmentQueue,
  ServiceMetricsSummary,
  AIServiceAssistResponse,
  CasePriority,
} from '../../types/customerService';
import { CustomerServiceClient } from '../../services/customerServiceClient';

const EMPTY_METRICS: ServiceMetricsSummary = {
  totalCases: 0,
  openCases: 0,
  resolvedCases: 0,
  avgResponseTimeMinutes: 0,
  slaCompliancePercentage: 0,
  csatScore: 0,
  npsScore: 0,
  cesScore: 0,
};

export const CustomerServiceHub: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'cases' | 'queues-sla' | 'knowledge' | 'csat' | 'ai-assist'>('cases');
  const [cases, setCases] = useState<ServiceCase[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [queues, setQueues] = useState<DepartmentQueue[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetricsSummary>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);

  // New Case Modal State
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('SHIPMENT_ISSUE');
  const [newPriority, setNewPriority] = useState<CasePriority>('HIGH');
  const [newDepartment, setNewDepartment] = useState('CUSTOMS_CLEARANCE');

  // Case Note Input
  const [noteContent, setNoteContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // AI Service Assist State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIServiceAssistResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesData, articlesData] = await Promise.all([
        CustomerServiceClient.getServiceCases(),
        CustomerServiceClient.getKnowledgeArticles()
      ]);
      const queueData = await CustomerServiceClient.getQueuesAndMetrics();
      setCases(casesData);
      setArticles(articlesData);
      setQueues(queueData.queues);
      setMetrics(queueData.metrics);
      if (casesData.length > 0) {
        setSelectedCase(casesData[0]);
      }
    } catch (err) {
      console.error('Error loading service data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCustomerName || !newDescription) return;

    try {
      const created = await CustomerServiceClient.createServiceCase({
        caseNumber: `AJA-CS-${Math.floor(9000 + Math.random() * 1000)}`,
        title: newTitle,
        description: newDescription,
        caseType: newType as any,
        priority: newPriority,
        severity: newPriority === 'CRITICAL' ? 'S1_CRITICAL_OUTAGE' : 'S2_MAJOR_IMPACT',
        status: 'NEW',
        customerId: `CUST-${Date.now()}`,
        customerName: newCustomerName,
        department: newDepartment as any,
        assignedAgentId: 'AGENT-AUTO',
        assignedAgentName: 'فريق الدعم الموزع آلياً',
        firstResponseTimeMinutes: 0,
        slaBreached: false,
        slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        escalationLevel: 0,
        sentimentScore: 'NEUTRAL',
        notes: [],
        timeline: [
          {
            id: `TL-${Date.now()}`,
            timestamp: new Date().toISOString(),
            eventType: 'CASE_CREATED',
            description: 'تم إنشاء التذكرة وإسنادها إلى طابور القسم المختص',
            actorName: 'نظام مركز الخدمة الموحد',
          }
        ]
      });

      setCases([created, ...cases]);
      setSelectedCase(created);
      setShowNewCaseModal(false);
      setNewTitle('');
      setNewCustomerName('');
      setNewDescription('');
    } catch (err) {
      console.error('Error creating service case:', err);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !noteContent.trim()) return;
    try {
      const updated = await CustomerServiceClient.addCaseNote(selectedCase.id, {
        authorId: 'AGENT-ME',
        authorName: 'ممثل خدمة العملاء',
        authorRole: 'AGENT',
        content: noteContent,
        isInternal: isInternalNote,
      });

      if (updated) {
        setSelectedCase(updated);
        setCases(cases.map(c => c.id === updated.id ? updated : c));
        setNoteContent('');
      }
    } catch (err) {
      console.error('Error adding case note:', err);
    }
  };

  const handleEscalateCase = async () => {
    if (!selectedCase) return;
    try {
      const nextLevel = Math.min(3, selectedCase.escalationLevel + 1);
      const updated = await CustomerServiceClient.updateCaseStatus(selectedCase.id, 'ESCALATED', nextLevel);
      if (updated) {
        setSelectedCase(updated);
        setCases(cases.map(c => c.id === updated.id ? updated : c));
      }
    } catch (err) {
      console.error('Error escalating case:', err);
    }
  };

  const handleResolveCase = async () => {
    if (!selectedCase) return;
    try {
      const updated = await CustomerServiceClient.updateCaseStatus(selectedCase.id, 'RESOLVED');
      if (updated) {
        setSelectedCase(updated);
        setCases(cases.map(c => c.id === updated.id ? updated : c));
      }
    } catch (err) {
      console.error('Error resolving case:', err);
    }
  };

  const runAiServiceAssist = async () => {
    if (!selectedCase) return;
    setAiAnalyzing(true);
    setAiResult(null);

    try {
      const token = localStorage.getItem('aja_auth_token');
      if (!token) {
        throw new Error('Authentication token is required for AI service assistance.');
      }
      const res = await fetch('/api/crm/service/ai/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          caseTitle: selectedCase.title,
          caseDescription: selectedCase.description,
          customerName: selectedCase.customerName,
          caseType: selectedCase.caseType,
          priority: selectedCase.priority
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiResult(data.result);
      }
    } catch (err) {
      console.error('AI Service Assist error:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAr ? 'منصة إدارة البلاغات والتذاكر والخدمات الذكية 360' : 'Enterprise Customer Service & Case Management Platform'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isAr
                ? 'إدارة قضايا العملاء، بلاغات الجمارك والتخزين، متابعة SLA، وتوزيع الطوابير التشغيلية بدعم الذكاء الاصطناعي'
                : 'Centralized Case Management, SLA Governance, Queue Routing, Knowledge Base, and AI Agent Assist'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('ai-assist');
              runAiServiceAssist();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 font-medium text-sm transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isAr ? 'مساعد الخدمة الذكي' : 'AI Agent Assist'}
          </button>
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'فتح بلاغ / تذكرة جديدة' : 'New Case'}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
        {[
          { id: 'cases', label: isAr ? 'مركز القضايا والتذاكر' : 'Cases & Tickets Workspace', icon: LifeBuoy },
          { id: 'queues-sla', label: isAr ? 'مراقبة الطوابير وSLA' : 'Queues & SLA Monitor', icon: ShieldAlert },
          { id: 'knowledge', label: isAr ? 'قاعدة المعرفة والحلول' : 'Knowledge Base', icon: BookOpen },
          { id: 'csat', label: isAr ? 'رضا العملاء والتقييم (CSAT)' : 'CSAT & Feedback', icon: Star },
          { id: 'ai-assist', label: isAr ? 'المساعد الذكي للبلاغات' : 'AI Case Assistant', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-red-600 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Sections */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: CASES WORKSPACE */}
          {activeTab === 'cases' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Case Search & List */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isAr ? 'بحث برقم التذكرة، العنوان، اسم العميل...' : 'Search cases...'}
                    className="w-full bg-transparent border-none text-sm focus:outline-none text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredCases.map((c) => {
                    const isSelected = selectedCase?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                            {c.caseNumber}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              c.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm mt-2 line-clamp-1">{c.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {c.customerName}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-500">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-medium">
                            {c.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Case Workspace Details */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                {selectedCase ? (
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                            {selectedCase.caseNumber}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                            {selectedCase.department}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold mt-2">{selectedCase.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {selectedCase.customerName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleEscalateCase}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium text-xs hover:bg-amber-600 transition-colors flex items-center gap-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          {isAr ? 'تصعيد المشكلة' : 'Escalate'}
                        </button>
                        <button
                          onClick={handleResolveCase}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isAr ? 'إغلاق البلاغ' : 'Resolve'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs space-y-2 border border-gray-200 dark:border-gray-800">
                      <span className="font-bold block text-gray-700 dark:text-gray-300">{isAr ? 'تفاصيل وشرح البلاغ:' : 'Issue Description:'}</span>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{selectedCase.description}</p>
                    </div>

                    {/* Internal / External Notes Log */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-red-600" />
                        {isAr ? 'ملاحظات التواصل وسجل المتابعة' : 'Notes & Interaction History'}
                      </h4>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedCase.notes.map((note) => (
                          <div
                            key={note.id}
                            className={`p-3 rounded-xl text-xs space-y-1 ${
                              note.isInternal
                                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40'
                                : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{note.authorName} ({note.authorRole})</span>
                              {note.isInternal && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                                  {isAr ? 'ملاحظة داخلية' : 'Internal'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add Note Input */}
                      <div className="pt-2 space-y-2">
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder={isAr ? 'اكتب ملاحظة جديدة للعميل أو للفريق الداخلي...' : 'Type note...'}
                          rows={2}
                          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs focus:outline-none"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isInternalNote}
                              onChange={(e) => setIsInternalNote(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span>{isAr ? 'ملاحظة سرية فريق عمل داخلي' : 'Internal note only'}</span>
                          </label>

                          <button
                            onClick={handleAddNote}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isAr ? 'إضافة الملاحظة' : 'Add Note'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    {isAr ? 'يرجى اختيار قضية لعرض المتابعة' : 'Select a case to view details'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: QUEUES & SLA */}
          {activeTab === 'queues-sla' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: isAr ? 'إجمالي البلاغات المسجلة' : 'Total Cases', value: metrics.totalCases, icon: LifeBuoy },
                  { title: isAr ? 'معدل الالتزام باتفاقية SLA' : 'SLA Compliance', value: `${metrics.slaCompliancePercentage}%`, icon: ShieldAlert },
                  { title: isAr ? 'متوسط زمن الاستجابة الأولى' : 'Avg Response Time', value: `${metrics.avgResponseTimeMinutes} دقيقة`, icon: Clock },
                  { title: isAr ? 'مؤشر رضا العملاء (CSAT)' : 'CSAT Score', value: `${metrics.csatScore} / 5.0`, icon: Star },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{item.title}</span>
                        <span className="text-xl font-bold mt-0.5 block">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Department Queues */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  {isAr ? 'حالة طوابير الأقسام والضغط التشغيلي' : 'Department Queue Distribution'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {queues.map((q) => (
                    <div key={q.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span>{q.departmentName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          SLA: {q.slaComplianceRatePercentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 pt-1">
                        <span>الممثلين النشطين: {q.activeAgentsCount}</span>
                        <span>البلاغات المفتوحة: {q.openCasesCount}</span>
                        <span>متوسط الحل: {q.avgResolutionTimeHours} ساعة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {isAr ? 'دليل قاعدة المعرفة والحلول اللوجستية المعتمدة' : 'Logistics Knowledge Base'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((art) => (
                    <div key={art.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">{art.articleNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                          {art.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm">{art.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{art.summary}</p>
                      <div className="flex items-center justify-between text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span>المؤلف: {art.authorName}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                          {art.helpfulCount} فائدة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CSAT & FEEDBACK */}
          {activeTab === 'csat' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    {isAr ? 'مؤشرات ونتائج رضا العملاء (CSAT & NPS)' : 'Customer Satisfaction Analytics'}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-center space-y-2">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block">{isAr ? 'مؤشر CSAT العام' : 'Overall CSAT'}</span>
                  <span className="text-4xl font-extrabold text-amber-600 block">{metrics.csatScore} / 5.0</span>
                  <p className="text-xs text-gray-500">{isAr ? 'استناداً إلى 840 تقييم بعد إغلاق التذاكر' : 'Based on 840 resolved surveys'}</p>
                </div>

                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-center space-y-2">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">{isAr ? 'مؤشر ترويج العملاء NPS' : 'Net Promoter Score'}</span>
                  <span className="text-4xl font-extrabold text-emerald-600 block">+{metrics.npsScore}</span>
                  <p className="text-xs text-gray-500">{isAr ? 'تصنيف ممتاز في قطاع اللوجستيات' : 'Excellent rating in logistics'}</p>
                </div>

                <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl text-center space-y-2">
                  <span className="text-xs text-blue-800 dark:text-blue-300 font-bold block">{isAr ? 'مؤشر المجهود المبذول CES' : 'Customer Effort Score'}</span>
                  <span className="text-4xl font-extrabold text-blue-600 block">{metrics.cesScore} / 5.0</span>
                  <p className="text-xs text-gray-500">{isAr ? 'سهولة وسرعة حل المشكلات' : 'Ease of issue resolution'}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: AI ASSISTANT PANEL */}
          {activeTab === 'ai-assist' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2 text-red-600">
                  <Sparkles className="w-5 h-5" />
                  {isAr ? 'مساعد البلاغات الذكي (Gemini Service AI)' : 'AI Service Assistant'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'تحليل الشكوى المحددة تلقائياً لإجراء التصنيف، توليد الرد الرسمى، واقتراح الخطوة القادمة للممثل.'
                    : 'Auto analyze issue description to generate response drafts and root cause analysis.'}
                </p>

                <button
                  onClick={runAiServiceAssist}
                  disabled={aiAnalyzing || !selectedCase}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {aiAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isAr ? 'جاري التقييم والتحليل...' : 'Analyzing with Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{isAr ? 'تشغيل المساعد الذكي للتذكرة الحالية' : 'Analyze Current Ticket'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Results Output */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                {aiResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl space-y-2">
                      <span className="font-bold text-red-900 dark:text-red-300 block">
                        {isAr ? 'الرد العربي الرسمي الموصى به للعميل:' : 'Suggested Arabic Customer Reply:'}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiResult.suggestedReplyAr}</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100 block">
                        {isAr ? 'تحليل السبب الجذري للمشكلة:' : 'Root Cause Analysis:'}
                      </span>
                      <p className="text-gray-600 dark:text-gray-300">{aiResult.rootCauseAnalysis}</p>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                        {isAr ? 'الإجراء التشغيلي الفوري الموصى به (Next Best Action):' : 'Next Best Action:'}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">{aiResult.nextBestAction}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400 text-xs">
                    {isAr ? 'اضغط على تشغيل المساعد الذكي لتوليد الردود والتحليلات' : 'Click analyze to generate AI recommendations'}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* NEW CASE MODAL */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg">{isAr ? 'فتح تذكرة / بلاغ خدمة جديد' : 'New Service Case'}</h3>
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">{isAr ? 'عنوان البلاغ' : 'Case Title'}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isAr ? 'تأخير فسح جمركي / طلب فحص مبرد' : 'Case title'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{isAr ? 'اسم العميل' : 'Customer Name'}</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder={isAr ? 'شركة المراعي / شركة السيف' : 'Customer name'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'القسم المختص' : 'Department'}</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <option value="CUSTOMS_CLEARANCE">الجمارك والفسح الجمركي</option>
                    <option value="LOGISTICS_OPS">العمليات وشحن الطرق</option>
                    <option value="WAREHOUSING">إدارة المستودعات</option>
                    <option value="FINANCE_BILLING">المالية والفوترة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{isAr ? 'الأولوية' : 'Priority'}</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <option value="CRITICAL">CRITICAL (حرجة جداً)</option>
                    <option value="HIGH">HIGH (عالية)</option>
                    <option value="MEDIUM">MEDIUM (متوسطة)</option>
                    <option value="LOW">LOW (منخفضة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">{isAr ? 'وصف تفاصيل المشكلة' : 'Problem Description'}</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={isAr ? 'ادخل التفاصيل التشغيلية ورقم الحاوية أو بوليصة الشحن...' : 'Enter problem details...'}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  {isAr ? 'فتح التذكرة' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
