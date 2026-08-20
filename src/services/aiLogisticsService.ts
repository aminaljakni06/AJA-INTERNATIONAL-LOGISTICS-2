/**
 * AJA LOGISTICS - AI Service Layer
 * Fully decoupled frontend service communicating with server-side Gemini AI & Tool Services.
 * STRICT SECURITY: Zero API keys stored or exposed in client-side code.
 */

export interface ChatMessageHistory {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface AIToolLog {
  toolName: string;
  args: any;
  status: string;
  timestamp: string;
}

export interface AIChatResponse {
  reply: string;
  toolLogs: AIToolLog[];
  durationMs?: number;
}

export interface PromptTopic {
  id: string;
  category: string;
  titleAr: string;
  titleEn: string;
  prompt: string;
  iconName: string;
}

/**
 * Sends chat message to secure server endpoint (/api/ai/chat)
 */
export async function sendAIAssistantMessage(
  message: string,
  history: ChatMessageHistory[],
  token: string
): Promise<AIChatResponse> {
  if (!token) {
    throw new Error('يرجى تسجيل الدخول للوصول لمساعد أجا الذكي');
  }

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      history,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'حدث خطأ أثناء التواصل مع سيرفر الذكاء الاصطناعي');
  }

  return {
    reply: data.reply,
    toolLogs: data.toolLogs || [],
    durationMs: data.durationMs,
  };
}

/**
 * Standard Prompt Templates mapped to the 5 key business features
 */
export const LOGISTICS_AI_PROMPTS: PromptTopic[] = [
  {
    id: 'select-service',
    category: 'اختيار الخدمة',
    titleAr: '1. اختيار الخدمة المناسبة',
    titleEn: 'Service Selection',
    prompt: 'ما هي الخدمة اللوجستية المناسبة لنقل شحنة حواسيب ومعدات إلكترونية بحجم 15 CBM من الصين إلى الرياض؟',
    iconName: 'PackageSearch',
  },
  {
    id: 'compare-freight',
    category: 'الفرق بين وسائل الشحن',
    titleAr: '2. الفرق بين Sea Freight & Land Freight',
    titleEn: 'Sea vs Land Transportation',
    prompt: 'وضح لي الفرق التفصيلي بين الشحن البحري Sea Freight والنقل البري Land Transportation من حيث السعة والتكلفة والسرعة.',
    iconName: 'GitCompare',
  },
  {
    id: 'shipment-status',
    category: 'حالة الشحنة',
    titleAr: '3. فهم حالة الشحنة الحالية',
    titleEn: 'Shipment Tracking',
    prompt: 'أعطني قائمة بشحناتي المسجلة ومواقعها الحالية وهل توجد أية تحديثات جديدة؟',
    iconName: 'Truck',
  },
  {
    id: 'shipping-stages',
    category: 'مراحل الشحن',
    titleAr: '4. شرح مراحل الشحن والتخليص',
    titleEn: 'Shipping Stages Explained',
    prompt: 'ما هي الخطوات والمراحل التفصيلية التي تمر بها الشحنة منذ الاستلام بالمصنع حتى التسليم بمستودع العميل؟',
    iconName: 'Milestone',
  },
  {
    id: 'quote-prep',
    category: 'تجهيز Quote Request',
    titleAr: '5. المساعدة في تجهيز Quote Request',
    titleEn: 'Quote Request Preparation',
    prompt: 'كيف أجهز طلب عرض سعر (Quote Request) دقيق ومكتمل؟ وما البيانات المطلوبة لإدخال الطلب؟',
    iconName: 'FileSpreadsheet',
  },
];

/**
 * Safety Guardrails definition exported for UI transparency
 */
export const AI_GUARDRAILS = {
  noPriceHallucination: 'عدم اختراع أسعار محددة إلا عبر العروض المالية الرسمية.',
  noFakeDates: 'عدم توفير مواعيد وصول مؤكدة بدون بيانات الجداول الملاحية المعتمدة.',
  noNonExistentShipments: 'الامتناع التام عن افتراض شحنات غير مسجلة بقواعد البيانات.',
  transparentDataNotice: 'إذا لم تتوفر بيانات حقيقية يتم التوضيح بعبارة: "البيانات غير متاحة حالياً".',
  serverSecurity: 'كافة المعالجات تتم خادمياً عبر Gemini 3.6 Flash وأدوات أجا الآمنة.',
};
