import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Wrench, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  PackageSearch, 
  GitCompare, 
  Truck, 
  Milestone, 
  FileSpreadsheet,
  Zap,
  User,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  Globe,
  Radio
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  sendAIAssistantMessage, 
  LOGISTICS_AI_PROMPTS, 
  AI_GUARDRAILS,
  AIToolLog 
} from '../../services/aiLogisticsService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolLogs?: AIToolLog[];
  isError?: boolean;
}

export const CustomerAIAssistant: React.FC = () => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `أهلاً بك أ. ${user?.fullName || 'العميل العزيز'} في مركز **مساعد أجا اللوجستي الذكي** (AJA AI Logistics Assistant). 🚢✨\n\nأنا هنا لمساعدتك في 5 مجالات تشغيلية معتمدة مع التزام كامل بالشفافية وقواعد الأمان:\n1. 📦 **اختيار الخدمة المناسبة** لنوع وسعة بضاعتك.\n2. 🚢 **فهم الفرق بين Sea Freight وLand Transportation** ووسائط النقل.\n3. 📍 **فهم حالة الشحنة المباشرة** وتتبع تحركاتها.\n4. 🗺️ **شرح مراحل الشحن اللوجستي** والوثائق المطلوبة.\n5. 📝 **المساعدة في تجهيز طلب عرض السعر (Quote Request)**.\n\n🔒 **ملاحظة أمان:** لا أقوم باختراع أي أسعار، أو مواعيد مؤكدة، أو حالات شحنات غير موجودة. وفي حال عدم توفر البيانات، أبلغك فوراً بأن "البيانات غير متاحة حالياً".`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [speechLang, setSpeechLang] = useState<'ar-SA' | 'en-US'>('ar-SA');

  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript: speechTranscript,
    error: speechError,
    toggleListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: speechLang,
    onResult: (text) => {
      if (text) {
        setInput(text);
      }
    },
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || loading || !token) return;

    if (isListening) {
      stopListening();
    }
    resetTranscript();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.text }],
        }));

      // Call decoupled AI Service Layer (No API keys exposed on client)
      const responseData = await sendAIAssistantMessage(userMsg.text, history, token);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: responseData.reply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        toolLogs: responseData.toolLogs,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ ${err.message || 'حدث خطأ غير متوقع أثناء معالجة الاستفسار'}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLogs = (id: string) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'PackageSearch': return <PackageSearch className="w-4 h-4 text-amber-500" />;
      case 'GitCompare': return <GitCompare className="w-4 h-4 text-sky-500" />;
      case 'Truck': return <Truck className="w-4 h-4 text-emerald-500" />;
      case 'Milestone': return <Milestone className="w-4 h-4 text-purple-500" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      default: return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Integration Architecture Info */}
      <div className="bg-[#082F49] text-white p-6 rounded-3xl shadow-sm border border-[#0F4C75] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F4C75] text-white flex items-center justify-center shrink-0 font-black shadow-lg">
              <Bot className="w-8 h-8 text-[#EA580C]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>مساعد أجا الذكي اللوجستي (AI Logistics Assistant)</span>
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                طبقة ذكاء اصطناعي (AI Layer) قابلة للربط بالسيرفر • بدون API Keys بالفرونت إند • حماية من اختلاق البيانات
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-emerald-500/10 text-emerald-300 text-xs px-3.5 py-1.5 rounded-2xl border border-emerald-500/20 font-bold flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>معمارية آمنة (Decoupled API Layer)</span>
            </div>
            <div className="bg-amber-400/10 text-amber-300 text-xs px-3.5 py-1.5 rounded-2xl border border-amber-400/20 font-bold flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ضوابط منع الاختلاق (Anti-Hallucination)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Feature Prompt Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {LOGISTICS_AI_PROMPTS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSendMessage(item.prompt)}
            className="p-3.5 bg-white hover:bg-amber-50/80 border border-slate-200/90 hover:border-amber-300 rounded-2xl text-right transition-all group shadow-2xs hover:shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-amber-100/60 transition-colors">
                {getTopicIcon(item.iconName)}
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {item.category}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-900 transition-colors">
              {item.titleAr}
            </h4>
          </button>
        ))}
      </div>

      {/* Main Chat Layout & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Thread Component */}
        <div className="lg:col-span-3 flex flex-col h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>محادثة مشفرة عبر سيرفر Gemini 3.6 Flash وأدوات أجا</span>
            </div>

            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة تهيئة المحادثة</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const hasTools = msg.toolLogs && msg.toolLogs.length > 0;
              const isLogsExpanded = expandedLogs[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-9 h-9 rounded-2xl bg-[#082F49] text-white flex items-center justify-center shrink-0 font-black border border-[#0F4C75] shadow-sm">
                      <Bot className="w-5 h-5 text-[#EA580C]" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAssistant
                          ? msg.isError
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tr-none'
                          : 'bg-[#082F49] text-white rounded-tl-none font-medium'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans">
                        {msg.text}
                      </div>

                      {/* Tools Invocation Drawer */}
                      {hasTools && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            onClick={() => toggleLogs(msg.id)}
                            className="text-xs font-bold text-slate-800 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center justify-between w-full transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-[#0F4C75]" />
                              <span>استدعاء {msg.toolLogs!.length} أدوات خادم متصلة بقواعد البيانات</span>
                            </span>
                            {isLogsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {isLogsExpanded && (
                            <div className="mt-2 space-y-1.5 text-xs font-mono bg-slate-950 text-slate-200 p-3 rounded-2xl border border-slate-800">
                              {msg.toolLogs!.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-slate-800 pb-1.5 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-amber-300 font-bold">{log.toolName}</span>
                                  </div>
                                  <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800 text-[10px]">
                                    {log.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className={`text-[10px] text-slate-400 px-1 ${isAssistant ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  </div>

                  {!isAssistant && (
                    <div className="w-9 h-9 rounded-2xl bg-[#0F4C75] text-white flex items-center justify-center shrink-0 font-black shadow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-slate-600 bg-white p-4 rounded-3xl border border-slate-200 max-w-[70%] shadow-xs animate-pulse">
                <Bot className="w-5 h-5 text-[#0F4C75] animate-spin" />
                <span>جاري معالجة الاستفسار والتحقق عبر السيرفر الخادمي...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form Input Bar & Speech Dictation */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-2">
            {/* Live Speech Recognition Activity Banner & Audio Waveform Visualizer */}
            {isListening && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between animate-fadeIn text-xs shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-6 h-6 bg-red-500/30 rounded-full animate-ping" />
                    <div className="relative z-10 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                      <Mic className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <div className="font-extrabold text-red-900 flex items-center gap-2">
                      <span>الإملاء الصوتي المباشر نشط</span>
                      {/* Animated Soundwave Visualizer Bars */}
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-1 bg-red-600 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                        <span className="w-1 bg-red-500 rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
                        <span className="w-1 bg-red-600 rounded-full animate-[bounce_1s_infinite_200ms] h-1.5" />
                        <span className="w-1 bg-red-500 rounded-full animate-[bounce_1s_infinite_400ms] h-3" />
                      </div>
                    </div>
                    <p className="text-[11px] text-red-700 font-medium">
                      تحدث بوضوح بالقرب من الميكروفون ({speechLang === 'ar-SA' ? 'اللغة العربية 🇸🇦' : 'English 🇺🇸'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeechLang(speechLang === 'ar-SA' ? 'en-US' : 'ar-SA')}
                    className="px-2.5 py-1 bg-white hover:bg-red-100/60 border border-red-300 text-red-900 text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    title="تغيير لغة الإملاء الصوتي"
                  >
                    <Globe className="w-3 h-3 text-red-600" />
                    <span>{speechLang === 'ar-SA' ? 'العربية' : 'English'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopListening}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>إيقاف</span>
                  </button>
                </div>
              </div>
            )}

            {/* Speech Error Banner */}
            {speechError && !isListening && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{speechError}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleListening()}
                  className="text-amber-800 underline font-bold hover:text-amber-950 text-[11px] cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Speech Recognition Toggle Button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => toggleListening()}
                  disabled={loading}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                    isListening
                      ? 'bg-red-600 text-white border-red-700 shadow-md animate-pulse ring-2 ring-red-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                  title={isListening ? 'إيقاف الإملاء الصوتي' : 'بدء الإملاء الصوتي (Web Speech API)'}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-[#0F4C75]" />
                  )}
                </button>
              )}

              <input
                type="text"
                placeholder={
                  isListening
                    ? speechLang === 'ar-SA'
                      ? 'جاري الاستماع لصوتك... اكتب أو واصل التحدث'
                      : 'Listening to your voice... speak now'
                    : 'اسأل عن اختيار الخدمة، الفرق بين الوسائط، حالة الشحنة، أو تجهيز طلب عرض السعر...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className={`flex-1 bg-slate-50 border text-slate-900 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#0F4C75] focus:bg-white outline-none disabled:opacity-50 transition-all ${
                  isListening ? 'border-red-400 bg-red-50/20 ring-2 ring-red-200' : 'border-slate-200'
                }`}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim() || loading}
                className="bg-[#082F49] hover:bg-[#0F4C75] text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm gap-2 shrink-0 disabled:opacity-40 shadow-sm border border-[#0F4C75]"
              >
                <span>إرسال</span>
                <Send className="w-4 h-4 rotate-180 text-[#EA580C]" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar: Guardrails & Architecture Summary */}
        <div className="space-y-4">
          <Card title="ضوابط الذكاء الاصطناعي (Guardrails)" className="space-y-3">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ممنوعات وحظر الذكاء الاصطناعي:
                </div>
                <ul className="space-y-1 text-[11px] text-rose-900 list-disc list-inside">
                  <li>اختراع أسعار أو تسعيرات وهمية.</li>
                  <li>توفير مواعيد وصول مؤكدة بدون بيانات الجداول.</li>
                  <li>افتراض شحنات غير موجودة بالنظام.</li>
                  <li>تقديم معلومات تشغيلية غير متوفرة.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  عند عدم توفر بيانات حقيقية:
                </div>
                <p className="text-[11px] text-amber-900 font-medium">
                  يصرح المساعد بوضوح تام بعبارة: <span className="font-black underline decoration-amber-500">"البيانات غير متاحة حالياً"</span> بدلاً من التخمين.
                </p>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  فصل الخدمات (Architecture):
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تم فصل طبقة <code className="text-amber-300 font-mono">aiLogisticsService.ts</code> تماماً عن مكون الواجهة UI Chat Component، ولا توجد أي مفاتيح API Keys بالواجهة الأمامية.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

