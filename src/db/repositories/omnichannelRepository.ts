import { getAdminFirestore } from '../../server/firebaseAdmin';
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

const EMAILS_COLLECTION = 'omnichannel_emails';
const SMS_COLLECTION = 'omnichannel_sms';
const WHATSAPP_COLLECTION = 'omnichannel_whatsapp';
const CHATS_COLLECTION = 'omnichannel_live_chats';
const CALLS_COLLECTION = 'omnichannel_calls';
const MEETINGS_COLLECTION = 'omnichannel_meetings';
const CALENDAR_COLLECTION = 'omnichannel_calendar';
const TASKS_COLLECTION = 'omnichannel_tasks';
const NOTES_COLLECTION = 'omnichannel_notes';
const DOCUMENTS_COLLECTION = 'omnichannel_documents';

// Seed initial data for fallback & demonstration
const SEED_EMAILS: EmailMessage[] = [
  {
    id: 'EMAIL-001',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    threadId: 'TH-1001',
    subject: 'طلب تحديث أسعار الشحن البحري لميناء جدة الإسلامي - الربع الثالث 2026',
    body: 'السلام عليكم ورحمة الله وبركاته، نود طلب تحديث جدول الأسعار للكونتينرات 40 قدم الجافة والقادمة من ميناء شنغهاي إلى جدة الإسلامي. يرجى توفير عروض الأسعار والشروط المتاحة.',
    senderEmail: 'k.alseef@alseef-logistics.sa',
    senderName: 'م. خالد السيف',
    recipientEmails: ['sales@aja-logistics.sa'],
    direction: 'INBOUND',
    status: 'READ',
    priority: 'HIGH',
    category: 'SALES',
    provider: 'MICROSOFT_365',
    sentAt: '2026-08-02T10:30:00Z',
    readAt: '2026-08-02T10:35:00Z',
  },
  {
    id: 'EMAIL-002',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    threadId: 'TH-1001',
    subject: 'رد: طلب تحديث أسعار الشحن البحري لميناء جدة الإسلامي - الربع الثالث 2026',
    body: 'أهلاً م. خالد، نشكركم على التواصل. تم إرفاق تسعيرة المجموعات والتخفيض الخاص بحسابكم الاستراتيجي لعملاء الترانزيت الشامل.',
    senderEmail: 'sales@aja-logistics.sa',
    senderName: 'فريق المبيعات - أجا اللوجستية',
    recipientEmails: ['k.alseef@alseef-logistics.sa'],
    direction: 'OUTBOUND',
    status: 'DELIVERED',
    priority: 'HIGH',
    category: 'SALES',
    provider: 'MICROSOFT_365',
    attachments: [{ fileName: 'AJA_RateCard_Q3_2026_Jeddah.pdf', fileUrl: '#' }],
    sentAt: '2026-08-02T11:15:00Z',
  },
];

const SEED_SMS: SmsMessage[] = [
  {
    id: 'SMS-101',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    phoneNumber: '+966501234567',
    messageText: 'عزيزي العميل، تم فسح الشحنة رقم SHP-2026-9901 جمركياً بمركز الملك عبد الله وتوجهها لمستودعاتكم.',
    smsType: 'TRANSACTIONAL',
    direction: 'OUTBOUND',
    status: 'DELIVERED',
    sentAt: '2026-08-03T08:00:00Z',
  }
];

const SEED_WHATSAPP: WhatsAppMessage[] = [
  {
    id: 'WA-201',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    phoneNumber: '+966501234567',
    direction: 'INBOUND',
    messageType: 'TEXT',
    content: 'مرحباً، هل يمكنكم تزويدي برقم تتبع الشاحنة المتجهة إلى الدمام الميناء الجاف؟',
    status: 'READ',
    timestamp: '2026-08-03T09:12:00Z',
  },
  {
    id: 'WA-202',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    phoneNumber: '+966501234567',
    direction: 'OUTBOUND',
    messageType: 'TEXT',
    content: 'مرحباً م. خالد، الشاحنة رقم TRK-8822 في الطريق حالياً وموقعها المباشر متاح عبر الرابط التالي.',
    quickReplies: ['تتبع المباشر', 'الاتصال بالسائق', 'طلب إيصال الاستلام'],
    status: 'DELIVERED',
    timestamp: '2026-08-03T09:14:00Z',
  },
];

const SEED_CHATS: LiveChatSession[] = [
  {
    id: 'CHAT-301',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    assignedAgentId: 'USR-8801',
    assignedAgentName: 'عبدالرحمن العتيبي',
    department: 'SUPPORT',
    status: 'ACTIVE',
    priority: 'HIGH',
    unreadCountAgent: 0,
    unreadCountCustomer: 0,
    startedAt: '2026-08-03T11:00:00Z',
    messages: [
      {
        id: 'M-01',
        sessionId: 'CHAT-301',
        senderId: 'CONT-01',
        senderName: 'م. خالد السيف',
        senderRole: 'CUSTOMER',
        text: 'السلام عليكم، نحتاج الدعم الفني لإضافة بيان التخليص الجمركي للشحنة المبردة.',
        timestamp: '2026-08-03T11:00:10Z',
      },
      {
        id: 'M-02',
        sessionId: 'CHAT-301',
        senderId: 'USR-8801',
        senderName: 'عبدالرحمن العتيبي',
        senderRole: 'AGENT',
        text: 'وعليكم السلام ورحمة الله وبركاته، أهلاً بك أخي الكريم. يسعدني مساعدتك فوراً، تم استلام الطلب وتوجيهه لقسم الجمارك المبرد.',
        timestamp: '2026-08-03T11:01:05Z',
      },
    ],
  },
];

const SEED_CALLS: VoiceCallLog[] = [
  {
    id: 'CALL-401',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    contactName: 'م. خالد السيف',
    phoneNumber: '+966501234567',
    direction: 'OUTBOUND',
    durationSeconds: 340,
    outcome: 'ANSWERED',
    recordingUrl: 'https://storage.aja-logistics.sa/calls/REC-401.mp3',
    notes: 'تمت مناقشة تجديد اتفاقية مستوى الخدمة SLA وتمديد فترة التخزين المجاني في مستودعات الرياض لمدة 5 أيام إضافية.',
    assignedUserId: 'USR-8801',
    assignedUserName: 'عبدالرحمن العتيبي',
    callTags: ['SLA_RENEWAL', 'WAREHOUSING', 'CONTRACT_NEGOTIATION'],
    timestamp: '2026-08-02T14:20:00Z',
  },
];

const SEED_MEETINGS: VideoMeeting[] = [
  {
    id: 'MEET-501',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    title: 'اجتماع مراجعة الأداء الدوري والتوسعات اللوجستية لعام 2027',
    agenda: '1. مراجعة كفاءة النقل الشامل\n2. خطة أسطول الشاحنات المبردة\n3. مراجعة الفواتير المجمعة والتسهيلات الائتمانية',
    meetingLink: 'https://meet.google.com/aja-seef-2026',
    startTime: '2026-08-05T10:00:00Z',
    endTime: '2026-08-05T11:00:00Z',
    organizerId: 'USR-8801',
    organizerName: 'عبدالرحمن العتيبي',
    participants: [
      { name: 'م. خالد السيف', email: 'k.alseef@alseef-logistics.sa', role: 'Customer Lead', status: 'ACCEPTED' },
      { name: 'سارة الغامدي', email: 's.ghamdi@alseef-logistics.sa', role: 'Finance Lead', status: 'ACCEPTED' },
      { name: 'عبدالرحمن العتيبي', email: 'a.otaibi@aja-logistics.sa', role: 'Account Director', status: 'ACCEPTED' },
    ],
    status: 'SCHEDULED',
    createdAt: '2026-08-01T09:00:00Z',
  },
];

const SEED_CALENDAR: CalendarEvent[] = [
  {
    id: 'CAL-601',
    title: 'مراجعة عقود التخزين - مجموعة السيف',
    eventType: 'MEETING',
    start: '2026-08-05T10:00:00Z',
    end: '2026-08-05T11:00:00Z',
    timeZone: 'Asia/Riyadh',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    location: 'قاعة الاجتماعات الرئيسية / Google Meet',
    description: 'مراجعة بنود العقد وشروط الحماية المبردة',
    organizerId: 'USR-8801',
    organizerName: 'عبدالرحمن العتيبي',
    department: 'SALES',
    attendees: ['k.alseef@alseef-logistics.sa', 'a.otaibi@aja-logistics.sa'],
  },
];

const SEED_TASKS: ActivityTask[] = [
  {
    id: 'TASK-701',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    title: 'إعداد مقترح اتفاقية الضمان البنكي للشحنات المباشرة',
    description: 'التنسيق مع القسم المالي لإصدار صياغة خطابات الضمان البنكي المعتمدة وتجهيز المرفقات الرسمية.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-08-06T17:00:00Z',
    assignedToId: 'USR-8802',
    assignedToName: 'سارة آل سعود',
    checklist: [
      { id: 'CK-1', title: 'مراجعة نموذج البنك الأهلي', isCompleted: true },
      { id: 'CK-2', title: 'موافقة المدير المالي', isCompleted: false },
      { id: 'CK-3', title: 'إرسال النسخة المعتمدة للعميل', isCompleted: false },
    ],
    createdAt: '2026-08-02T08:00:00Z',
  },
];

const SEED_NOTES: OmnichannelNote[] = [
  {
    id: 'NOTE-801',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    authorId: 'USR-8801',
    authorName: 'عبدالرحمن العتيبي',
    title: 'ملاحظة سرية: تفضيلات التخزين المبرد للشحنات الاستراتيجية',
    contentHtml: '<p>العميل يفضل جدولة الشاحنات في الفترات المسائية فقط لتفادي حرارة الصيف وطلب فريق تفريغ مخصص للمواد الغذائية.</p>',
    isPrivate: false,
    isPinned: true,
    version: 1,
    createdAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },
];

const SEED_DOCUMENTS: SharedDocument[] = [
  {
    id: 'DOC-901',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    documentType: 'CONTRACT',
    title: 'اتفاقية الخدمات اللوجستية والتخزين الموحدة 2026-2028',
    fileName: 'SLA_Contract_AlSeef_Signed_2026.pdf',
    fileUrl: '#',
    fileSizeBytes: 2450000,
    version: 2,
    uploadedById: 'USR-8801',
    uploadedByName: 'عبدالرحمن العتيبي',
    uploadedAt: '2026-07-28T09:30:00Z',
    tags: ['CONTRACT', 'SLA', 'SIGNED'],
  },
];

// Helper to safely execute Firestore reads with fallback
async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[OmnichannelRepo] Firestore read fallback for ${collName}:`, err);
  }
  return seed;
}

// EMAILS
export async function getEmailMessages(customerId?: string): Promise<EmailMessage[]> {
  const items = await safeFetchCollection<EmailMessage>(EMAILS_COLLECTION, SEED_EMAILS);
  if (customerId) {
    return items.filter(e => e.customerId === customerId);
  }
  return items;
}

export async function sendEmailMessage(msg: Omit<EmailMessage, 'id' | 'sentAt'>): Promise<EmailMessage> {
  const id = `EMAIL-${Date.now()}`;
  const fullMsg: EmailMessage = {
    ...msg,
    id,
    sentAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(EMAILS_COLLECTION).doc(id).set(fullMsg);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for email:', err);
  }

  SEED_EMAILS.unshift(fullMsg);
  return fullMsg;
}

// SMS
export async function getSmsMessages(customerId?: string): Promise<SmsMessage[]> {
  const items = await safeFetchCollection<SmsMessage>(SMS_COLLECTION, SEED_SMS);
  if (customerId) {
    return items.filter(s => s.customerId === customerId);
  }
  return items;
}

export async function sendSmsMessage(msg: Omit<SmsMessage, 'id' | 'sentAt'>): Promise<SmsMessage> {
  const id = `SMS-${Date.now()}`;
  const fullSms: SmsMessage = {
    ...msg,
    id,
    sentAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(SMS_COLLECTION).doc(id).set(fullSms);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for SMS:', err);
  }

  SEED_SMS.unshift(fullSms);
  return fullSms;
}

// WHATSAPP
export async function getWhatsAppMessages(customerId?: string): Promise<WhatsAppMessage[]> {
  const items = await safeFetchCollection<WhatsAppMessage>(WHATSAPP_COLLECTION, SEED_WHATSAPP);
  if (customerId) {
    return items.filter(w => w.customerId === customerId);
  }
  return items;
}

export async function sendWhatsAppMessage(msg: Omit<WhatsAppMessage, 'id' | 'timestamp'>): Promise<WhatsAppMessage> {
  const id = `WA-${Date.now()}`;
  const fullWa: WhatsAppMessage = {
    ...msg,
    id,
    timestamp: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(WHATSAPP_COLLECTION).doc(id).set(fullWa);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for WhatsApp:', err);
  }

  SEED_WHATSAPP.push(fullWa);
  return fullWa;
}

// LIVE CHAT
export async function getLiveChatSessions(customerId?: string): Promise<LiveChatSession[]> {
  const items = await safeFetchCollection<LiveChatSession>(CHATS_COLLECTION, SEED_CHATS);
  if (customerId) {
    return items.filter(c => c.customerId === customerId);
  }
  return items;
}

export async function addLiveChatMessage(sessionId: string, message: Omit<LiveChatSession['messages'][0], 'id' | 'timestamp'>): Promise<LiveChatSession> {
  const sessions = await getLiveChatSessions();
  const session = sessions.find(s => s.id === sessionId) || SEED_CHATS[0];

  const newMsg = {
    ...message,
    id: `M-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  session.messages.push(newMsg);

  try {
    await getAdminFirestore().collection(CHATS_COLLECTION).doc(sessionId).update({
      messages: session.messages,
    });
  } catch (err) {
    console.warn('[OmnichannelRepo] updateDoc error for chat:', err);
  }

  return session;
}

// CALL LOGS
export async function getVoiceCallLogs(customerId?: string): Promise<VoiceCallLog[]> {
  const items = await safeFetchCollection<VoiceCallLog>(CALLS_COLLECTION, SEED_CALLS);
  if (customerId) {
    return items.filter(c => c.customerId === customerId);
  }
  return items;
}

export async function logVoiceCall(call: Omit<VoiceCallLog, 'id' | 'timestamp'>): Promise<VoiceCallLog> {
  const id = `CALL-${Date.now()}`;
  const fullCall: VoiceCallLog = {
    ...call,
    id,
    timestamp: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(CALLS_COLLECTION).doc(id).set(fullCall);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for voice call:', err);
  }

  SEED_CALLS.unshift(fullCall);
  return fullCall;
}

// MEETINGS
export async function getVideoMeetings(customerId?: string): Promise<VideoMeeting[]> {
  const items = await safeFetchCollection<VideoMeeting>(MEETINGS_COLLECTION, SEED_MEETINGS);
  if (customerId) {
    return items.filter(m => m.customerId === customerId);
  }
  return items;
}

export async function createVideoMeeting(meeting: Omit<VideoMeeting, 'id' | 'createdAt'>): Promise<VideoMeeting> {
  const id = `MEET-${Date.now()}`;
  const fullMeeting: VideoMeeting = {
    ...meeting,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(MEETINGS_COLLECTION).doc(id).set(fullMeeting);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for meeting:', err);
  }

  SEED_MEETINGS.unshift(fullMeeting);
  return fullMeeting;
}

// CALENDAR
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return await safeFetchCollection<CalendarEvent>(CALENDAR_COLLECTION, SEED_CALENDAR);
}

export async function createCalendarEvent(evt: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const id = `CAL-${Date.now()}`;
  const fullEvt: CalendarEvent = {
    ...evt,
    id,
  };

  try {
    await getAdminFirestore().collection(CALENDAR_COLLECTION).doc(id).set(fullEvt);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for calendar event:', err);
  }

  SEED_CALENDAR.push(fullEvt);
  return fullEvt;
}

// TASKS
export async function getActivityTasks(customerId?: string): Promise<ActivityTask[]> {
  const items = await safeFetchCollection<ActivityTask>(TASKS_COLLECTION, SEED_TASKS);
  if (customerId) {
    return items.filter(t => t.customerId === customerId);
  }
  return items;
}

export async function createActivityTask(task: Omit<ActivityTask, 'id' | 'createdAt'>): Promise<ActivityTask> {
  const id = `TASK-${Date.now()}`;
  const fullTask: ActivityTask = {
    ...task,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(TASKS_COLLECTION).doc(id).set(fullTask);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for task:', err);
  }

  SEED_TASKS.unshift(fullTask);
  return fullTask;
}

export async function updateTaskStatus(taskId: string, status: ActivityTask['status']): Promise<void> {
  const tasks = await getActivityTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    try {
      await getAdminFirestore().collection(TASKS_COLLECTION).doc(taskId).update({ status });
    } catch (err) {
      console.warn('[OmnichannelRepo] updateDoc error for task:', err);
    }
  }
}

// NOTES
export async function getOmnichannelNotes(customerId?: string): Promise<OmnichannelNote[]> {
  const items = await safeFetchCollection<OmnichannelNote>(NOTES_COLLECTION, SEED_NOTES);
  if (customerId) {
    return items.filter(n => n.customerId === customerId);
  }
  return items;
}

export async function createOmnichannelNote(note: Omit<OmnichannelNote, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<OmnichannelNote> {
  const id = `NOTE-${Date.now()}`;
  const now = new Date().toISOString();
  const fullNote: OmnichannelNote = {
    ...note,
    id,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await getAdminFirestore().collection(NOTES_COLLECTION).doc(id).set(fullNote);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for note:', err);
  }

  SEED_NOTES.unshift(fullNote);
  return fullNote;
}

// DOCUMENTS
export async function getSharedDocuments(customerId?: string): Promise<SharedDocument[]> {
  const items = await safeFetchCollection<SharedDocument>(DOCUMENTS_COLLECTION, SEED_DOCUMENTS);
  if (customerId) {
    return items.filter(d => d.customerId === customerId);
  }
  return items;
}

export async function createSharedDocument(docData: Omit<SharedDocument, 'id' | 'uploadedAt'>): Promise<SharedDocument> {
  const id = `DOC-${Date.now()}`;
  const fullDoc: SharedDocument = {
    ...docData,
    id,
    uploadedAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(DOCUMENTS_COLLECTION).doc(id).set(fullDoc);
  } catch (err) {
    console.warn('[OmnichannelRepo] setDoc error for document:', err);
  }

  SEED_DOCUMENTS.unshift(fullDoc);
  return fullDoc;
}
