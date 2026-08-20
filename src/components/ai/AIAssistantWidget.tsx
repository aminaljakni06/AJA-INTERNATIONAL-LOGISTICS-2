import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Wrench, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  ShieldCheck, 
  Package, 
  FileText, 
  Ship, 
  ArrowLeft,
  User,
  Mic,
  MicOff,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolLogs?: Array<{ toolName: string; args: any; status: string; timestamp: string }>;
  isError?: boolean;
}

export const AIAssistantWidget: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen: externalIsOpen, onClose }) => {
  const { token, user } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `مرحباً بك${user?.fullName ? ` أ. ${user.fullName}` : ''}! أنا **مساعد شركة أجا اللوجستية الذكي**. 👋\n\nيمكنني مساعدتك عبر الأدوات المعتمدة المربوطة بنظامنا المباشر للقيام بـ:\n• 📦 **متابعة شحناتك** وجدول المواعيد المباشر\n• 📄 **الاستعلام عن طلبات عروض الأسعار**\n• 📋 **معرفة المستندات المطلوبة** للفسح الجمركي والشحن\n• 🚢 **استعراض كافة خدمات شركة أجا اللوجستية**\n\nكيف يمكنني مساعدتك اليوم؟`,
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

  const suggestedPrompts = [
    { label: 'أين شحناتي الحالية؟', prompt: 'استعرض لي جميع شحناتي الحالية وحالاتها في النظام' },
    { label: 'الوثائق المطلوبة للشحن البحري', prompt: 'ما هي المستندات والوثائق المطلوبة للشحن البحري من الصين إلى السعودية؟' },
    { label: 'استعلام عن عرض سعر', prompt: 'هل هناك تحديث أو سعر معتمد لطلب عرض السعر الخاص بي؟' },
    { label: 'خدمات شركة أجا اللوجستية', prompt: 'ما هي كافة الخدمات والحلول اللوجستية التي تقدمها شركة أجا اللوجستية؟' },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (customText?: string) => {
    const messageText = customText || input;
    if (!messageText.trim() || loading || !token) return;

    if (isListening) {
      stopListening();
    }
    resetTranscript();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      // Build history for backend API
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg.text,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل الاتصال بمساعد أجا الذكي');
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        toolLogs: data.toolLogs,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ ${err.message || 'عذراً، تعذر الاتصال بالذكاء الاصطناعي حالياً. يرجى المحاولة لاحقاً.'}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLogs = (msgId: string) => {
    setExpandedLogs((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `مرحباً بك! تم بدء محادثة جديدة مع **مساعد أجا اللوجستية الذكي**. كيف يمكنني مساعدتك؟`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const toggleWidget = () => {
    if (onClose && externalIsOpen) {
      onClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (when modal is closed) */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-20 md:bottom-6 left-4 z-40 bg-[#082F49] hover:bg-[#082F49]/90 text-white p-3.5 rounded-full shadow-2xl border-2 border-[#0F4C75] flex items-center gap-2.5 transition-all hover:scale-105 group active:scale-95"
          title="افتح مساعد أجا الذكي AI"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#082F49] animate-pulse" />
          </div>
          <span className="text-xs font-black text-white hidden sm:inline pl-1">مساعد أجا الذكي</span>
          <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full border border-white/30 font-extrabold hidden md:inline">
            Gemini AI
          </span>
        </button>
      )}

      {/* Main AI Chat Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-50 w-full sm:w-[440px] h-full sm:h-[620px] bg-white rounded-none sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-[#082F49] text-white p-4 flex items-center justify-between border-b border-[#0F4C75] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F4C75] text-white flex items-center justify-center shrink-0 shadow-md font-black">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>مساعد أجا اللوجستية الذكي</span>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-300 font-medium">ربط مباشر مع أدوات النظام المشفرة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="text-slate-300 hover:text-amber-400 p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="إعادة المحادثة"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleWidget}
                className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const hasTools = msg.toolLogs && msg.toolLogs.length > 0;
              const isLogsExpanded = expandedLogs[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#0F4C75] text-white flex items-center justify-center shrink-0 border border-[#0F4C75] text-xs font-bold shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isAssistant
                          ? msg.isError
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tr-none'
                          : 'bg-[#0F4C75] text-white rounded-tl-none font-medium'
                      }`}
                    >
                      <div className="whitespace-pre-line text-xs font-sans">
                        {msg.text}
                      </div>

                      {/* Tool Execution Badges */}
                      {hasTools && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => toggleLogs(msg.id)}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 transition-colors w-full justify-between"
                          >
                            <span className="flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-amber-500" />
                              <span>تم تنفيذ {msg.toolLogs!.length} أدوات آمنة معتمدة</span>
                            </span>
                            {isLogsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isLogsExpanded && (
                            <div className="mt-1.5 space-y-1 text-[10px] font-mono bg-slate-900 text-slate-200 p-2 rounded-xl border border-slate-800">
                              {msg.toolLogs!.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-slate-800 pb-1 last:border-0 last:pb-0">
                                  <span className="text-amber-400 font-bold">⚡ {log.toolName}</span>
                                  <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                                    {log.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className={`text-[9px] text-slate-400 px-1 ${isAssistant ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#082F49] text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm border border-[#0F4C75]">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 max-w-[75%] shadow-sm animate-pulse">
                <Bot className="w-4 h-4 text-amber-500 animate-spin" />
                <span>جاري معالجة الاستفسار والاتصال بأدوات شركة أجا اللوجستية...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggested Prompt Chips */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 shrink-0 overflow-x-auto">
              <p className="text-[10px] font-bold text-slate-500 mb-1.5 px-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> أسئلة سريعة شائعة:
              </p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {suggestedPrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp.prompt)}
                    className="text-[11px] font-medium bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200 transition-all shrink-0 whitespace-nowrap shadow-2xs"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input & Voice Dictation */}
          <div className="p-3 bg-white border-t border-slate-200/90 shrink-0 space-y-2">
            {/* Listening Banner & Soundwave */}
            {isListening && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-5 h-5 bg-red-500/30 rounded-full animate-ping" />
                    <div className="relative z-10 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                      <Mic className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <div className="font-extrabold text-red-900 flex items-center gap-1.5">
                      <span>جاري التقاط الصوت...</span>
                      <div className="flex items-end gap-0.5 h-2.5">
                        <span className="w-0.5 bg-red-600 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                        <span className="w-0.5 bg-red-500 rounded-full animate-[bounce_1s_infinite_300ms] h-2.5" />
                        <span className="w-0.5 bg-red-600 rounded-full animate-[bounce_1s_infinite_200ms] h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpeechLang(speechLang === 'ar-SA' ? 'en-US' : 'ar-SA')}
                    className="px-2 py-0.5 bg-white border border-red-300 text-red-900 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Globe className="w-2.5 h-2.5 text-red-600" />
                    <span>{speechLang === 'ar-SA' ? 'العربية' : 'EN'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopListening}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    إيقاف
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {speechError && !isListening && (
              <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[10px] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{speechError}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleListening()}
                  className="text-amber-800 underline font-bold hover:text-amber-950 cursor-pointer"
                >
                  إعادة
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
              {/* Mic Toggle Button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => toggleListening()}
                  disabled={loading}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
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
                      ? 'تحدث الآن بوضوح...'
                      : 'Speak clearly now...'
                    : 'اكتب استفسارك هنا (مثلاً: أين شحنتي AJA-123456)...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className={`flex-1 bg-slate-50 border text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#0F4C75] focus:bg-white outline-none disabled:opacity-50 transition-all ${
                  isListening ? 'border-red-400 bg-red-50/20 ring-2 ring-red-200' : 'border-slate-200'
                }`}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim() || loading}
                className="bg-[#0F4C75] hover:bg-[#082F49] text-white p-2.5 rounded-xl shrink-0 font-bold text-xs disabled:opacity-40"
              >
                <Send className="w-4 h-4 rotate-180" />
              </Button>
            </form>
            <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                إملاء صوتي مجاني + حماية البيانات
              </span>
              <span>Gemini 3.6 Flash</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
