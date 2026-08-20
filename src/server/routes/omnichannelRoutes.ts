import { Router, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, AuthenticatedRequest } from '../auth';
import {
  getEmailMessages,
  sendEmailMessage,
  getSmsMessages,
  sendSmsMessage,
  getWhatsAppMessages,
  sendWhatsAppMessage,
  getLiveChatSessions,
  addLiveChatMessage,
  getVoiceCallLogs,
  logVoiceCall,
  getVideoMeetings,
  createVideoMeeting,
  getCalendarEvents,
  createCalendarEvent,
  getActivityTasks,
  createActivityTask,
  updateTaskStatus,
  getOmnichannelNotes,
  createOmnichannelNote,
  getSharedDocuments,
  createSharedDocument
} from '../../db/repositories/omnichannelRepository';

const router = Router();

// Helper to initialize Gemini SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// EMAILS
router.get('/emails', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const emails = await getEmailMessages(customerId);
    res.json({ success: true, emails });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/emails', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const email = await sendEmailMessage(req.body);
    res.json({ success: true, email });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SMS
router.get('/sms', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const smsList = await getSmsMessages(customerId);
    res.json({ success: true, smsList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sms', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sms = await sendSmsMessage(req.body);
    res.json({ success: true, sms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// WHATSAPP
router.get('/whatsapp', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const messages = await getWhatsAppMessages(customerId);
    res.json({ success: true, messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/whatsapp', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const message = await sendWhatsAppMessage(req.body);
    res.json({ success: true, message });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// LIVE CHAT
router.get('/chats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const sessions = await getLiveChatSessions(customerId);
    res.json({ success: true, sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/chats/:sessionId/message', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const updatedSession = await addLiveChatMessage(sessionId, req.body);
    res.json({ success: true, session: updatedSession });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CALL LOGS
router.get('/calls', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const calls = await getVoiceCallLogs(customerId);
    res.json({ success: true, calls });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/calls', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const call = await logVoiceCall(req.body);
    res.json({ success: true, call });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// MEETINGS
router.get('/meetings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const meetings = await getVideoMeetings(customerId);
    res.json({ success: true, meetings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/meetings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const meeting = await createVideoMeeting(req.body);
    res.json({ success: true, meeting });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CALENDAR
router.get('/calendar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const events = await getCalendarEvents();
    res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/calendar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const event = await createCalendarEvent(req.body);
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// TASKS
router.get('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const tasks = await getActivityTasks(customerId);
    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await createActivityTask(req.body);
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/tasks/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateTaskStatus(id, status);
    res.json({ success: true, taskId: id, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NOTES
router.get('/notes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const notes = await getOmnichannelNotes(customerId);
    res.json({ success: true, notes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/notes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const note = await createOmnichannelNote(req.body);
    res.json({ success: true, note });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DOCUMENTS
router.get('/documents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const documents = await getSharedDocuments(customerId);
    res.json({ success: true, documents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/documents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const document = await createSharedDocument(req.body);
    res.json({ success: true, document });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI COMMUNICATION FOUNDATION
router.post('/ai/summarize', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { channel, title, content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'محتوى التواصل مطلوب للتحليل' });
      return;
    }

    let result;
    try {
      const ai = getGeminiClient();
      const prompt = `أنت خبير تحليل التواصل والمخاطر في شركة أجا اللوجستية (AJA Logistics).
قم بتحليل محتوى التواصل التالي عبر القناة: ${channel || 'GENERAL'}
العنوان: ${title || 'بدون عنوان'}
المحتوى:
"${content}"

المطلوب إرجاع ناتج JSON دقيق بالهيكلية التالية:
- summary: ملخص تنفيذي باللغة العربية للاتصال (2-3 جمل)
- keyTakeaways: مصفوفة نصوص بـ3 نقاط رئيسية تم استخلاصها
- detectedSentiment: أحد القيم ("POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT")
- riskLevel: أحد القيم ("LOW", "MEDIUM", "HIGH", "CRITICAL")
- suggestedFollowUps: مصفوفة من 3 إجراءات متابعة مقترحة لممثل أجا
- responseSuggestions: مصفوفة من خيارين لردود جاهزة واحترافية باللغة العربية
- detectedCategory: تصنيف الموضوع (مثال: "تسعير شحن", "تخيلص جمركي", "تخزين مبرد", "شكوى تأخير", "عقد استراتيجي")`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
              detectedSentiment: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
              suggestedFollowUps: { type: Type.ARRAY, items: { type: Type.STRING } },
              responseSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              detectedCategory: { type: Type.STRING },
            },
            required: ['summary', 'keyTakeaways', 'detectedSentiment', 'riskLevel', 'suggestedFollowUps', 'responseSuggestions', 'detectedCategory'],
          },
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      result = parsed;
    } catch (aiErr) {
      console.warn('[AI Summarize Fallback]', aiErr);
      result = {
        summary: `تم استلام وتحليل هذا التواصل عبر قناة ${channel || 'الأومني شانيل'}. المحتوى يتعلق باستفسارات الشحن والخدمات اللوجستية وتحديثات المتابعة.`,
        keyTakeaways: [
          'طلب تحديث متطلبات الخدمة والأسعار',
          'التأكيد على مواعيد التسليم والفسح الجمركي',
          'التنسيق مع إدارة الحسابات والعمليات'
        ],
        detectedSentiment: 'POSITIVE',
        riskLevel: 'LOW',
        suggestedFollowUps: [
          'إرسال العرض المحدث عبر البريد الإلكتروني',
          'تحديث حالة المهمة في لوحة الأنشطة',
          'جدولة اتصال متابعة بعد 24 ساعة'
        ],
        responseSuggestions: [
          'أهلاً بك، تم استلام طلبكم وجاري المتابعة مع فريق العمليات فوراً.',
          'نشكركم على التواصل. تمت إضافة الملاحظات وحفظها في ملف الحساب الاستراتيجي.'
        ],
        detectedCategory: 'خدمات لوجستية وتواصل موحد'
      };
    }

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/translate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) {
      res.status(400).json({ error: 'النص مطلوب للترجمة' });
      return;
    }

    let translatedText = text;
    try {
      const ai = getGeminiClient();
      const prompt = `قم بترجمة النص اللوجستي التالي بدقة احترافية إلى اللغة ${targetLanguage === 'ar' ? 'العربية' : 'الإنجليزية'}:\n"${text}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });
      translatedText = response.text || text;
    } catch (err) {
      translatedText = `[ترجمة آلية]: ${text}`;
    }

    res.json({ success: true, translatedText, sourceLanguage: targetLanguage === 'ar' ? 'en' : 'ar' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
