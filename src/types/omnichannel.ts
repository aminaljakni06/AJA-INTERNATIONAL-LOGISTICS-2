export type OmnichannelChannel =
  | 'EMAIL'
  | 'SMS'
  | 'WHATSAPP'
  | 'LIVE_CHAT'
  | 'VOICE_CALL'
  | 'VIDEO_MEETING'
  | 'INTERNAL_NOTE'
  | 'SYSTEM_EVENT';

export type CommunicationDirection = 'INBOUND' | 'OUTBOUND' | 'INTERNAL';

export type CommunicationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type MessageStatus = 'DRAFT' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'ARCHIVED';

// Email Entity
export interface EmailMessage {
  id: string;
  customerId: string;
  customerName?: string;
  threadId: string;
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  recipientEmails: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  direction: CommunicationDirection;
  status: MessageStatus;
  priority: CommunicationPriority;
  category: 'SALES' | 'SUPPORT' | 'BILLING' | 'OPERATIONS' | 'GENERAL';
  attachments?: { fileName: string; fileUrl: string; fileSize?: string }[];
  provider?: 'MICROSOFT_365' | 'GOOGLE_WORKSPACE' | 'INTERNAL_SMTP';
  sentAt: string;
  readAt?: string;
}

// SMS Entity
export interface SmsMessage {
  id: string;
  customerId: string;
  customerName?: string;
  phoneNumber: string;
  messageText: string;
  smsType: 'TRANSACTIONAL' | 'MARKETING' | 'OTP' | 'ALERT';
  direction: CommunicationDirection;
  status: MessageStatus;
  scheduledAt?: string;
  sentAt: string;
}

// WhatsApp Entity
export interface WhatsAppMessage {
  id: string;
  customerId: string;
  customerName?: string;
  phoneNumber: string;
  direction: CommunicationDirection;
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'LOCATION' | 'AUDIO' | 'TEMPLATE';
  content: string;
  mediaUrl?: string;
  templateName?: string;
  quickReplies?: string[];
  status: MessageStatus;
  timestamp: string;
}

// Live Chat Entity
export interface LiveChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'AGENT' | 'BOT' | 'SYSTEM';
  text: string;
  attachments?: { fileName: string; fileUrl: string }[];
  timestamp: string;
}

export interface LiveChatSession {
  id: string;
  customerId: string;
  customerName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  department: 'SUPPORT' | 'SALES' | 'CUSTOMS' | 'FINANCE' | 'GENERAL';
  status: 'QUEUED' | 'ACTIVE' | 'TRANSFERRED' | 'RESOLVED' | 'CLOSED';
  priority: CommunicationPriority;
  messages: LiveChatMessage[];
  unreadCountAgent: number;
  unreadCountCustomer: number;
  typingStatus?: { isTyping: boolean; user: string };
  startedAt: string;
  resolvedAt?: string;
}

// Voice Call Log
export interface VoiceCallLog {
  id: string;
  customerId: string;
  customerName: string;
  contactName: string;
  phoneNumber: string;
  direction: CommunicationDirection;
  durationSeconds: number;
  outcome: 'ANSWERED' | 'BUSY' | 'NO_ANSWER' | 'VOICEMAIL' | 'REJECTED';
  recordingUrl?: string;
  notes: string;
  assignedUserId: string;
  assignedUserName: string;
  callTags: string[];
  timestamp: string;
}

// Video Meeting Manager
export interface VideoMeeting {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  agenda: string;
  meetingLink: string;
  startTime: string;
  endTime: string;
  organizerId: string;
  organizerName: string;
  participants: { name: string; email: string; role: string; status: 'ACCEPTED' | 'PENDING' | 'DECLINED' }[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  recordingUrl?: string;
  meetingNotes?: string;
  actionItems?: { id: string; text: string; assignedTo: string; isDone: boolean }[];
  createdAt: string;
}

// Calendar Events
export interface CalendarEvent {
  id: string;
  title: string;
  eventType: 'APPOINTMENT' | 'MEETING' | 'CALL' | 'FOLLOW_UP' | 'DEADLINE' | 'TASK';
  start: string;
  end: string;
  isAllDay?: boolean;
  timeZone: string;
  customerId?: string;
  customerName?: string;
  location?: string;
  description?: string;
  organizerId: string;
  organizerName: string;
  department?: string;
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  attendees: string[];
}

// Activity Task & Checklist
export interface TaskChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ActivityTask {
  id: string;
  customerId: string;
  customerName?: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  reminderAt?: string;
  assignedToId: string;
  assignedToName: string;
  checklist: TaskChecklistItem[];
  dependentTaskIds?: string[];
  isRecurring?: boolean;
  recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  completionHistory?: { completedAt: string; completedBy: string; notes?: string }[];
  createdAt: string;
}

// Omnichannel Note
export interface OmnichannelNote {
  id: string;
  customerId: string;
  customerName?: string;
  authorId: string;
  authorName: string;
  title: string;
  contentHtml: string;
  isPrivate: boolean;
  isPinned: boolean;
  attachments?: { fileName: string; fileUrl: string }[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Shared Document
export interface SharedDocument {
  id: string;
  customerId: string;
  customerName?: string;
  documentType: 'CONTRACT' | 'INVOICE' | 'QUOTATION' | 'SHIPPING_DOC' | 'POD' | 'CERTIFICATE' | 'IMAGE' | 'OTHER';
  title: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  version: number;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  tags: string[];
}

// AI Communication Analytics & Request Models
export interface AIConversationSummaryRequest {
  channel: OmnichannelChannel;
  title: string;
  content: string;
  contextLanguage?: 'ar' | 'en';
}

export interface AIConversationSummaryResponse {
  summary: string;
  keyTakeaways: string[];
  detectedSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedFollowUps: string[];
  responseSuggestions: string[];
  detectedCategory: string;
}

export interface AITranslateRequest {
  text: string;
  targetLanguage: 'ar' | 'en';
}

export interface AITranslateResponse {
  translatedText: string;
  sourceLanguage: string;
}
