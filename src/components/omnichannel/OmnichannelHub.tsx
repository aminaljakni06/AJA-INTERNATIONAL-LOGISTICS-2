import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  PhoneCall,
  Video,
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  Paperclip,
  Clock,
  Sparkles,
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  User,
  Shield,
  Phone,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Tag,
  Building2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AISummaryPanel } from './AISummaryPanel';
import {
  EmailMessage,
  SmsMessage,
  WhatsAppMessage,
  LiveChatSession,
  VoiceCallLog,
  VideoMeeting,
  CalendarEvent,
  ActivityTask,
  OmnichannelNote,
  SharedDocument
} from '../../types/omnichannel';

export const OmnichannelHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'UNIFIED' | 'EMAIL' | 'SMS_WA' | 'CHAT' | 'CALLS' | 'MEETINGS' | 'CALENDAR' | 'TASKS' | 'NOTES_DOCS' | 'TIMELINE'
  >('UNIFIED');

  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [smsList, setSmsList] = useState<SmsMessage[]>([]);
  const [whatsappList, setWhatsappList] = useState<WhatsAppMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<LiveChatSession[]>([]);
  const [callLogs, setCallLogs] = useState<VoiceCallLog[]>([]);
  const [meetings, setMeetings] = useState<VideoMeeting[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<ActivityTask[]>([]);
  const [notes, setNotes] = useState<OmnichannelNote[]>([]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);

  // Selected item for AI Analysis
  const [aiFocusContent, setAiFocusContent] = useState<{ channel: string; title: string; content: string }>({
    channel: 'EMAIL',
    title: 'طلب تحديث أسعار الشحن البحري لميناء جدة الإسلامي - الربع الثالث 2026',
    content: 'السلام عليكم ورحمة الله وبركاته، نود طلب تحديث جدول الأسعار للكونتينرات 40 قدم الجافة والقادمة من ميناء شنغهاي إلى جدة الإسلامي. يرجى توفير عروض الأسعار والشروط المتاحة.',
  });

  // Modal / Form states
  const [newEmailModal, setNewEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [newCallModal, setNewCallModal] = useState(false);
  const [callCustomer, setCallCustomer] = useState('شركة السيف اللوجستية للصناعة والتجارة');
  const [callContact, setCallContact] = useState('م. خالد السيف');
  const [callDuration, setCallDuration] = useState('300');
  const [callNotes, setCallNotes] = useState('');
  const [callTags, setCallTags] = useState('CONTRACT, RENEWAL');

  const [newTaskModal, setNewTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  const [newNoteModal, setNewNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [waInput, setWaInput] = useState('');

  // Fetch all Omnichannel data
  const loadData = async () => {
    setLoading(true);
    try {
      const [
        resEmails,
        resSms,
        resWa,
        resChats,
        resCalls,
        resMeetings,
        resCal,
        resTasks,
        resNotes,
        resDocs
      ] = await Promise.all([
        fetch('/api/crm/omnichannel/emails').then(r => r.json()),
        fetch('/api/crm/omnichannel/sms').then(r => r.json()),
        fetch('/api/crm/omnichannel/whatsapp').then(r => r.json()),
        fetch('/api/crm/omnichannel/chats').then(r => r.json()),
        fetch('/api/crm/omnichannel/calls').then(r => r.json()),
        fetch('/api/crm/omnichannel/meetings').then(r => r.json()),
        fetch('/api/crm/omnichannel/calendar').then(r => r.json()),
        fetch('/api/crm/omnichannel/tasks').then(r => r.json()),
        fetch('/api/crm/omnichannel/notes').then(r => r.json()),
        fetch('/api/crm/omnichannel/documents').then(r => r.json()),
      ]);

      if (resEmails?.success) setEmails(resEmails.emails || []);
      if (resSms?.success) setSmsList(resSms.smsList || []);
      if (resWa?.success) setWhatsappList(resWa.messages || []);
      if (resChats?.success) setChatSessions(resChats.sessions || []);
      if (resCalls?.success) setCallLogs(resCalls.calls || []);
      if (resMeetings?.success) setMeetings(resMeetings.meetings || []);
      if (resCal?.success) setCalendarEvents(resCal.events || []);
      if (resTasks?.success) setTasks(resTasks.tasks || []);
      if (resNotes?.success) setNotes(resNotes.notes || []);
      if (resDocs?.success) setDocuments(resDocs.documents || []);
    } catch (err) {
      console.error('[OmnichannelHub Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit Handlers
  const handleSendEmail = async () => {
    if (!emailSubject || !emailRecipient) return;
    try {
      await fetch('/api/crm/omnichannel/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-360-1001',
          customerName: 'شركة السيف اللوجستية',
          threadId: `TH-${Date.now()}`,
          subject: emailSubject,
          body: emailBody,
          senderEmail: 'sales@aja-logistics.sa',
          senderName: 'فريق التواصل أجا اللوجستية',
          recipientEmails: [emailRecipient],
          direction: 'OUTBOUND',
          status: 'DELIVERED',
          priority: 'NORMAL',
          category: 'SALES',
        }),
      });
      setEmailSubject('');
      setEmailRecipient('');
      setEmailBody('');
      setNewEmailModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogCall = async () => {
    if (!callNotes) return;
    try {
      await fetch('/api/crm/omnichannel/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-360-1001',
          customerName: callCustomer,
          contactName: callContact,
          phoneNumber: '+966501234567',
          direction: 'OUTBOUND',
          durationSeconds: parseInt(callDuration) || 180,
          outcome: 'ANSWERED',
          notes: callNotes,
          assignedUserId: 'USR-8801',
          assignedUserName: 'عبدالرحمن العتيبي',
          callTags: callTags.split(',').map(s => s.trim()),
        }),
      });
      setCallNotes('');
      setNewCallModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle) return;
    try {
      await fetch('/api/crm/omnichannel/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-360-1001',
          customerName: 'شركة السيف اللوجستية',
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          status: 'TODO',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          assignedToId: 'USR-8801',
          assignedToName: 'عبدالرحمن العتيبي',
          checklist: [
            { id: 'CK-1', title: 'مراجعة المتطلبات اللوجستية', isCompleted: false },
            { id: 'CK-2', title: 'التأكيد مع العميل', isCompleted: false },
          ],
        }),
      });
      setTaskTitle('');
      setTaskDesc('');
      setNewTaskModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!waInput) return;
    try {
      await fetch('/api/crm/omnichannel/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-360-1001',
          customerName: 'شركة السيف اللوجستية',
          phoneNumber: '+966501234567',
          direction: 'OUTBOUND',
          messageType: 'TEXT',
          content: waInput,
          status: 'DELIVERED',
        }),
      });
      setWaInput('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle || !noteContent) return;
    try {
      await fetch('/api/crm/omnichannel/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-360-1001',
          customerName: 'شركة السيف اللوجستية',
          authorId: 'USR-8801',
          authorName: 'عبدالرحمن العتيبي',
          title: noteTitle,
          contentHtml: `<p>${noteContent}</p>`,
          isPrivate: false,
          isPinned: true,
        }),
      });
      setNoteTitle('');
      setNoteContent('');
      setNewNoteModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 dir-rtl text-right font-sans bg-slate-950 text-slate-100 min-h-screen">
      {/* Platform Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              ALBP-004.003 Enterprise Pack
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Omnichannel Hub
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            منصة التواصل الشامل والأنشطة الموحدة (Omnichannel & Activity Platform)
          </h1>
          <p className="text-xs text-slate-400">
            مركز الاتصال المتكامل: البريد، الرسائل، واتساب، الاتصالات المرئية والترددية، والجدولة الذكية بمدخلات الذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={loadData}
            variant="outline"
            className="border-slate-800 text-slate-300 hover:bg-slate-900 h-9 gap-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>

          <Button
            size="sm"
            onClick={() => setNewEmailModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-9 gap-1.5 text-xs shadow-md shadow-sky-900/30"
          >
            <Plus className="w-4 h-4" />
            تواصل جديد
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">البريد الإلكتروني</span>
            <Mail className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">{emails.length} رسالة</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">واتساب والأعمال</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">{whatsappList.length} محادثة</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">سجل المكالمات</span>
            <PhoneCall className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">{callLogs.length} مكالمة</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">الاجتماعات والمرئي</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">{meetings.length} اجتماع</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">المهام القائمة</span>
            <CheckSquare className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">{tasks.length} مهمة</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">المستندات والملاحظات</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-1">{documents.length + notes.length} ملف</div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('UNIFIED')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'UNIFIED'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          صندوق التواصل الموحد (Unified Inbox)
        </button>

        <button
          onClick={() => setActiveTab('EMAIL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'EMAIL'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          البريد الإلكتروني (Email)
        </button>

        <button
          onClick={() => setActiveTab('SMS_WA')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'SMS_WA'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          واتساب ورسائل SMS
        </button>

        <button
          onClick={() => setActiveTab('CHAT')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'CHAT'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          المحادثات المباشرة (Live Chat)
        </button>

        <button
          onClick={() => setActiveTab('CALLS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'CALLS'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          المكالمات الصوتية (Calls)
        </button>

        <button
          onClick={() => setActiveTab('MEETINGS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'MEETINGS'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          الاجتماعات المرئية (Meetings)
        </button>

        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'CALENDAR'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          التقويم والجدولة (Calendar)
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'TASKS'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          المهام والأنشطة (Tasks)
        </button>

        <button
          onClick={() => setActiveTab('NOTES_DOCS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'NOTES_DOCS'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          الملاحظات والوثائق
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'TIMELINE'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          الخط الزمني (Activity Timeline)
        </button>
      </div>

      {/* Embedded AI Intelligence Panel */}
      <AISummaryPanel
        channel={aiFocusContent.channel}
        title={aiFocusContent.title}
        content={aiFocusContent.content}
        onApplyReply={(replyText) => {
          setEmailBody(prev => prev ? `${prev}\n\n${replyText}` : replyText);
          setWaInput(replyText);
        }}
      />

      {/* Main Tab Views */}
      {activeTab === 'UNIFIED' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              أحدث التفاعلات عبر جميع القنوات
            </h3>

            {emails.map((e) => (
              <Card key={e.id} className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0 border border-sky-500/20">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{e.senderName}</span>
                        <span className="text-[10px] text-slate-400 dir-ltr">{e.senderEmail}</span>
                      </div>
                      <h4 className="font-bold text-sm text-sky-300 mt-1">{e.subject}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{e.body}</p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-[10px] text-slate-400 block">{new Date(e.sentAt).toLocaleTimeString('ar-SA')}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAiFocusContent({ channel: 'EMAIL', title: e.subject, content: e.body })}
                      className="text-[10px] h-6 px-2 mt-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      تحليل الذكاء
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {whatsappList.map((wa) => (
              <Card key={wa.id} className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 border border-emerald-500/20">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{wa.customerName || wa.phoneNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300">WhatsApp</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{wa.content}</p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-[10px] text-slate-400 block">{new Date(wa.timestamp).toLocaleTimeString('ar-SA')}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAiFocusContent({ channel: 'WHATSAPP', title: 'محادثة واتساب', content: wa.content })}
                      className="text-[10px] h-6 px-2 mt-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      تحليل الذكاء
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions & Tasks Overview */}
          <div className="space-y-4">
            <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-400" />
                مهام اليوم العاجلة
              </h4>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">{t.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300">{t.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{t.description}</p>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => setNewTaskModal(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-8 gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة مهمة جديدة
              </Button>
            </Card>

            <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                الاجتماع القادم
              </h4>
              {meetings.length > 0 ? (
                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-2">
                  <div className="font-bold text-xs text-purple-300">{meetings[0].title}</div>
                  <div className="text-[11px] text-slate-300">{new Date(meetings[0].startTime).toLocaleString('ar-SA')}</div>
                  <a
                    href={meetings[0].meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:underline font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    الانضمام عبر رابط الاجتماع
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400">لا توجد اجتماعات مقبلة اليوم.</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* EMAIL TAB */}
      {activeTab === 'EMAIL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              صندوق البريد الإلكتروني وشراكة Microsoft 365 / Google Workspace
            </h3>
            <Button
              size="sm"
              onClick={() => setNewEmailModal(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              إنشاء رسالة بريد إلكتروني
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {emails.map((e) => (
              <Card key={e.id} className="p-4 bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{e.senderName}</span>
                      <span className="text-[11px] text-slate-400">&lt;{e.senderEmail}&gt;</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-300">{e.provider || 'M365'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-sky-300">{e.subject}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(e.sentAt).toLocaleString('ar-SA')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{e.body}</p>
                {e.attachments && e.attachments.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    {e.attachments.map((att, i) => (
                      <span key={i} className="text-[11px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                        {att.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SMS & WHATSAPP TAB */}
      {activeTab === 'SMS_WA' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* WhatsApp Chat Simulation */}
          <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                واتساب الأعمال (WhatsApp Business Cloud API)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">متصل</span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
              {whatsappList.map((wa) => (
                <div
                  key={wa.id}
                  className={`p-3 rounded-xl max-w-[80%] text-xs space-y-1 ${
                    wa.direction === 'OUTBOUND'
                      ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/50 mr-auto'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 ml-auto'
                  }`}
                >
                  <p>{wa.content}</p>
                  <span className="text-[9px] text-slate-400 block text-left">{new Date(wa.timestamp).toLocaleTimeString('ar-SA')}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="اكتب رسالة واتساب..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <Button
                size="sm"
                onClick={handleSendWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3 gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                إرسال
              </Button>
            </div>
          </Card>

          {/* SMS Transactional & OTP Log */}
          <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                سجل الرسائل النصية SMS المعاملاتية والتسويقية
              </h3>
            </div>

            <div className="space-y-2">
              {smsList.map((sms) => (
                <div key={sms.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{sms.phoneNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-300">{sms.smsType}</span>
                  </div>
                  <p className="text-xs text-slate-300">{sms.messageText}</p>
                  <span className="text-[9px] text-slate-500 block">{new Date(sms.sentAt).toLocaleString('ar-SA')}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* CALLS TAB */}
      {activeTab === 'CALLS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              سجل الاتصالات الصوتية والمكالمات (Voice Call Log)
            </h3>
            <Button
              size="sm"
              onClick={() => setNewCallModal(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              تسجيل مكالمة جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {callLogs.map((c) => (
              <Card key={c.id} className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{c.customerName}</h4>
                    <p className="text-xs text-slate-400">الجهة: {c.contactName} ({c.phoneNumber})</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {c.durationSeconds} ثانية
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {c.notes}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>بواسطة: {c.assignedUserName}</span>
                  <a href={c.recordingUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 font-bold">
                    <Phone className="w-3 h-3" />
                    استماع للتسجيل الصوتي
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MEETINGS TAB */}
      {activeTab === 'MEETINGS' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-400" />
            إدارة الاجتماعات المرئية ومحاضر الجلسات (Video Meetings)
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {meetings.map((m) => (
              <Card key={m.id} className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-purple-300">{m.title}</h4>
                    <p className="text-xs text-slate-400">العميل: {m.customerName}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {m.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">جدول الأعمال:</span>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap">{m.agenda}</pre>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">الوقت: {new Date(m.startTime).toLocaleString('ar-SA')}</span>
                  <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-bold flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    رابط Google Meet المباشر
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-rose-400" />
              لوحة المهام والأنشطة والقوائم المتقاطعة (Tasks & Checklists)
            </h3>
            <Button
              size="sm"
              onClick={() => setNewTaskModal(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              مهمة جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.map((tk) => (
              <Card key={tk.id} className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-xs text-slate-100">{tk.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    tk.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tk.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{tk.description}</p>
                {tk.checklist && (
                  <div className="space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">قائمة التحقق:</span>
                    {tk.checklist.map((ck) => (
                      <div key={ck.id} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <input type="checkbox" checked={ck.isCompleted} readOnly className="rounded border-slate-700 bg-slate-900" />
                        <span>{ck.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                  <span>المسؤول: {tk.assignedToName}</span>
                  <span>تاريخ الاستحقاق: {new Date(tk.dueDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* NOTES & DOCUMENTS TAB */}
      {activeTab === 'NOTES_DOCS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              الملاحظات والوثائق والملفات المشتركة
            </h3>
            <Button
              size="sm"
              onClick={() => setNewNoteModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة ملاحظة جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notes List */}
            <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-teal-400">الملاحظات الخاصة والمشاركة</h4>
              {notes.map((n) => (
                <div key={n.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{n.title}</span>
                    <span className="text-[9px] text-slate-400">v{n.version}</span>
                  </div>
                  <div className="text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: n.contentHtml }} />
                  <span className="text-[9px] text-slate-500 block">بواسطة: {n.authorName}</span>
                </div>
              ))}
            </Card>

            {/* Documents List */}
            <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-sky-400">الوثائق والعقود المرفقة</h4>
              {documents.map((d) => (
                <div key={d.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-200 block">{d.title}</span>
                    <span className="text-[10px] text-slate-400">{d.fileName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-300">{d.documentType}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'TIMELINE' && (
        <Card className="p-5 bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            السجل الزمني التفاعلي الموحد (Unified Customer Activity Timeline)
          </h3>
          <div className="relative border-r-2 border-slate-800 pr-6 space-y-6">
            {emails.map((e) => (
              <div key={e.id} className="relative">
                <div className="absolute -right-[31px] top-0.5 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-950" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-sky-400">[بريد إلكتروني]</span>
                    <span className="text-xs text-slate-200">{e.subject}</span>
                    <span className="text-[10px] text-slate-500">{new Date(e.sentAt).toLocaleString('ar-SA')}</span>
                  </div>
                  <p className="text-xs text-slate-400">{e.body}</p>
                </div>
              </div>
            ))}

            {callLogs.map((c) => (
              <div key={c.id} className="relative">
                <div className="absolute -right-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-950" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-400">[مكالمة صوتية]</span>
                    <span className="text-xs text-slate-200">الجهة: {c.contactName}</span>
                    <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleString('ar-SA')}</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* NEW EMAIL MODAL */}
      {newEmailModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-5 bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">إرسال بريد إلكتروني جديد</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">المستلم (Email):</label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="customer@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">الموضوع:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="موضوع البريد..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">نص الرسالة:</label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="محتوى الرسالة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setNewEmailModal(false)} className="text-xs">إلغاء</Button>
              <Button size="sm" onClick={handleSendEmail} className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs">إرسال البريد</Button>
            </div>
          </Card>
        </div>
      )}

      {/* NEW CALL MODAL */}
      {newCallModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-5 bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">تسجيل مكالمة صوتية جديدة</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم العميل:</label>
                <input
                  type="text"
                  value={callCustomer}
                  onChange={(e) => setCallCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">جهة الاتصال:</label>
                <input
                  type="text"
                  value={callContact}
                  onChange={(e) => setCallContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ملاحظات ونتيجة الاتصال:</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="ملاحظات الاتصال..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setNewCallModal(false)} className="text-xs">إلغاء</Button>
              <Button size="sm" onClick={handleLogCall} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">حفظ المكالمة</Button>
            </div>
          </Card>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {newTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-5 bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">إضافة مهمة جديدة</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">عنوان المهمة:</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="عنوان المهمة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">الوصف التفصيلي:</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="تفاصيل المهمة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setNewTaskModal(false)} className="text-xs">إلغاء</Button>
              <Button size="sm" onClick={handleCreateTask} className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs">حفظ المهمة</Button>
            </div>
          </Card>
        </div>
      )}

      {/* NEW NOTE MODAL */}
      {newNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-5 bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">إضافة ملاحظة موحدة</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">عنوان الملاحظة:</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="عنوان الملاحظة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">المحتوى:</label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="محتوى الملاحظة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setNewNoteModal(false)} className="text-xs">إلغاء</Button>
              <Button size="sm" onClick={handleCreateNote} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs">حفظ الملاحظة</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
