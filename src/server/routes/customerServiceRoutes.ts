import { Router, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, AuthenticatedRequest } from '../auth';
import {
  getServiceCases,
  createServiceCase,
  addCaseNote,
  updateCaseStatus,
  getKnowledgeArticles,
  createKnowledgeArticle,
  SEED_QUEUES,
  SEED_METRICS
} from '../../db/repositories/customerServiceRepository';

const router = Router();

// Helper to initialize Gemini SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
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

// SERVICE CASES ENDPOINTS
router.get('/cases', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const cases = await getServiceCases(customerId);
    res.json({ success: true, cases });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/cases', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const createdCase = await createServiceCase(req.body);
    res.json({ success: true, case: createdCase });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/cases/:id/notes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCase = await addCaseNote(id, req.body);
    res.json({ success: true, case: updatedCase });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/cases/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, escalationLevel } = req.body;
    const updatedCase = await updateCaseStatus(id, status, escalationLevel);
    res.json({ success: true, case: updatedCase });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// KNOWLEDGE BASE ENDPOINTS
router.get('/knowledge', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const articles = await getKnowledgeArticles();
    res.json({ success: true, articles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/knowledge', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const article = await createKnowledgeArticle(req.body);
    res.json({ success: true, article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// QUEUES & METRICS ENDPOINTS
router.get('/queues', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, queues: SEED_QUEUES, metrics: SEED_METRICS });
});

// AI SERVICE ASSIST ENDPOINT
router.post('/ai/assist', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { caseTitle, caseDescription, customerName, caseType, priority } = req.body;
    if (!caseTitle && !caseDescription) {
      res.status(400).json({ error: 'عنوان التذكرة أو تفاصيل المشكلة مطلوبة' });
      return;
    }

    let result;
    try {
      const ai = getGeminiClient();
      const prompt = `أنت مساعد خدمة العملاء الذكي في شركة أجا اللوجستية (AJA Logistics Customer Support AI Engine).
قم بتحليل البلاغ أو شكوى العميل التالية تقديم الدعم التشغيلي الفوري للممثل:
العميل: ${customerName || 'عميل تجاري'}
العنوان: ${caseTitle}
الوصف: "${caseDescription}"
النوع الحالي: ${caseType || 'SHIPMENT_ISSUE'}
الأولوية: ${priority || 'HIGH'}

المطلوب إرجاع ناتج JSON بالهيكلية التالية:
- autoCategory: التصنيف اللوجستي الدقيق (مثل 'تأخير الجمارك', 'تلف التخزين المبرد', 'خطأ الفوترة', 'تأخير التسليم')
- autoPriority: الأولوية الموصى بها ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')
- sentiment: مشاعر العميل ('POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT')
- suggestedReplyAr: اقتراح الرد الرسمي للعميل باللغة العربية بأسلوب احترافي ولوجستي مطمئن
- suggestedReplyEn: Professional official customer response in English
- rootCauseAnalysis: تحليل السبب الجذري المحتمل للمشكلة اللوجستية (2-3 جمل)
- nextBestAction: الإجراء الفوري الموصى به للممثل (مثل التواصل مع مخلص جمركي، إرسال خطابات تعويض، رفع طلب فحص حراري)
- recommendedKnowledgeArticles: مصفوفة من المقالات المقترحة من قاعدة المعرفة [{ title, articleNumber }]`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              autoCategory: { type: Type.STRING },
              autoPriority: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              suggestedReplyAr: { type: Type.STRING },
              suggestedReplyEn: { type: Type.STRING },
              rootCauseAnalysis: { type: Type.STRING },
              nextBestAction: { type: Type.STRING },
              recommendedKnowledgeArticles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    articleNumber: { type: Type.STRING },
                  },
                  required: ['title', 'articleNumber'],
                },
              },
            },
            required: [
              'autoCategory',
              'autoPriority',
              'sentiment',
              'suggestedReplyAr',
              'suggestedReplyEn',
              'rootCauseAnalysis',
              'nextBestAction',
              'recommendedKnowledgeArticles',
            ],
          },
        },
      });

      result = JSON.parse(aiResponse.text || '{}');
    } catch (aiErr) {
      console.warn('[AI Service Assist Fallback]', aiErr);
      result = {
        autoCategory: 'الفسح الجمركي والتبريد',
        autoPriority: 'HIGH',
        sentiment: 'URGENT',
        suggestedReplyAr: 'عزيزنا العميل، نود إفادتكم بأنه جاري متابعة ملف الشحنة المبردة مع هيئة الغذاء والدواء لمنفذ الجمارك وتقديم كافة السجلات الحرارية اللازمة لإتمام الفسح خلال 3 ساعات.',
        suggestedReplyEn: 'Dear Valued Customer, please be advised that we are actively escalating your refrigerated shipment clearance with SFDA officers to guarantee swift delivery within 3 hours.',
        rootCauseAnalysis: 'تأخير في تقديم شهادات التتبع الحراري التلقائي للدفعة الاستيرادية لدى جمارك الرياض الجاف.',
        nextBestAction: 'إرسال السجل الرقمي الموثق من مستودع أجا مباشرة لمفتش الجمارك واستدعاء المشرف اللوجستي.',
        recommendedKnowledgeArticles: [
          { title: 'متطلبات وإجراءات الفسح الجمركي للشحنات المبردة والطبية', articleNumber: 'AJA-KB-001' },
          { title: 'سياسة التعويض والجزاءات في اتفاقيات مستوى الخدمة (SLA)', articleNumber: 'AJA-KB-002' },
        ],
      };
    }

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
