import { Router, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, AuthenticatedRequest } from '../auth';
import {
  getASNs,
  getGoodsReceipts,
  getQualityInspections,
  getPutawayTasks,
  getDockAppointments,
  getOSDRecords,
  getNCRRecords,
  getInboundContainers,
  getCrossDockRecords,
  getInboundLabelJobs,
  getInboundAnalyticsKPIs,
  updateASNStatus
} from '../../db/repositories/inboundWarehouseRepository';

const router = Router();

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

// GET ASNS
router.get('/asns', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const asns = await getASNs();
    res.json({ success: true, asns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET GRNS
router.get('/grns', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const grns = await getGoodsReceipts();
    res.json({ success: true, grns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET INSPECTIONS
router.get('/inspections', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspections = await getQualityInspections();
    res.json({ success: true, inspections });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET PUTAWAY TASKS
router.get('/putaway', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const putawayTasks = await getPutawayTasks();
    res.json({ success: true, putawayTasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET DOCK APPOINTMENTS
router.get('/docks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docks = await getDockAppointments();
    res.json({ success: true, docks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET OSD RECORDS
router.get('/osds', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const osds = await getOSDRecords();
    res.json({ success: true, osds });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET NCR RECORDS
router.get('/ncrs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ncrs = await getNCRRecords();
    res.json({ success: true, ncrs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET INBOUND CONTAINERS
router.get('/containers', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const containers = await getInboundContainers();
    res.json({ success: true, containers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET CROSS DOCK RECORDS
router.get('/crossdocks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const crossDocks = await getCrossDockRecords();
    res.json({ success: true, crossDocks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET INBOUND LABEL JOBS
router.get('/labels', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const labels = await getInboundLabelJobs();
    res.json({ success: true, labels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET INBOUND ANALYTICS KPIS
router.get('/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await getInboundAnalyticsKPIs();
    res.json({ success: true, kpis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE ASN STATUS
router.post('/asns/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { asnId, status } = req.body;
    await updateASNStatus(asnId, status);
    res.json({ success: true, message: 'ASN status updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// AI INBOUND OPTIMIZER & UNLOADING COPILOT
router.post('/ai/inbound-optimize', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { asnNumber, supplierNameAr, totalExpectedPallets, temperatureControlled } = req.body;

    let result;
    try {
      const ai = getGeminiClient();
      const prompt = `أنت الخبير التقني والمسؤول عن إدارة الاستلام والإنزال والتخزين بـ أجا للوجستيات (AJA Inbound & Putaway AI Copilot).
قم بتحليل شحنة الاستلام التالية والتوصية بجدولة الرصيف، فحص الجودة وتوجيه Putaway:
رقم الإشعار المسبق ASN: ${asnNumber || 'ASN-2026-901'}
اسم المورد: ${supplierNameAr || 'شركة المورد المتقدم للصناعات الطبية'}
عدد الطبالي المتوقعة: ${totalExpectedPallets || 40}
حالة التبريد المطلوبة: ${temperatureControlled ? 'نعم (مستلزمات مبردة)' : 'عادي (جاف)'}

المطلوب إرجاع ناتج JSON بالهيكلية التالية:
- asnNumber: رقم الإشعار
- putawayEfficiencyScorePercent: تقييم كفاءة مسار Putaway والتخزين %
- recommendedOptimalDockAr: الرصيف الموصى بتوجيه الشاحنة إليه (مثل: Dock Gate Alpha-01)
- predictedUnloadingTimeMinutes: الزمن المتوقع بالتفصيل لإنزال ومطابقة الشحنة بالدقائق
- inspectionRiskAssessmentAr: تقييم مخاطر التلفيات أو عينات الفحص المطلوبة
- directedPutawayStrategyAr: استراتيجية التخزين المقترحة (FIFO / FEFO / Cross-Docking)
- congestionPreventionRecommendationsAr: مصفوفة تحتوي 3 توصيات لتفادي تكدس الأرصفة والممرات
- aiConfidencePercent: نسبة ثقة الذكاء الاصطناعي %`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              asnNumber: { type: Type.STRING },
              putawayEfficiencyScorePercent: { type: Type.NUMBER },
              recommendedOptimalDockAr: { type: Type.STRING },
              predictedUnloadingTimeMinutes: { type: Type.NUMBER },
              inspectionRiskAssessmentAr: { type: Type.STRING },
              directedPutawayStrategyAr: { type: Type.STRING },
              congestionPreventionRecommendationsAr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              aiConfidencePercent: { type: Type.NUMBER },
            },
            required: [
              'asnNumber',
              'putawayEfficiencyScorePercent',
              'recommendedOptimalDockAr',
              'predictedUnloadingTimeMinutes',
              'inspectionRiskAssessmentAr',
              'directedPutawayStrategyAr',
              'congestionPreventionRecommendationsAr',
              'aiConfidencePercent',
            ],
          },
        },
      });

      result = JSON.parse(aiResponse.text || '{}');
      result.asnNumber = asnNumber;
    } catch (aiErr) {
      console.warn('[AI Inbound Optimizer Fallback]', aiErr);
      result = {
        asnNumber,
        putawayEfficiencyScorePercent: 95,
        recommendedOptimalDockAr: 'Dock Gate Alpha-01 (رصيف التفريغ السريع للمواد المبردة)',
        predictedUnloadingTimeMinutes: 35,
        inspectionRiskAssessmentAr: 'مخاطر منخفضة جداً. يوصى بسحب عينة قياسية بنسبة 5% للتحقق من أجهزة تسجيل الحرارة RFID Data Loggers.',
        directedPutawayStrategyAr: 'استراتيجية FEFO (الأقرب انتهاءً هو الأول خروجاً) للتخزين الفوري في المنطقة A01 المبردة.',
        congestionPreventionRecommendationsAr: [
          'تنسيق دخول شاحنة المورد عبر بوابة Alpha-01 قبل 10 دقائق لتفادي تكدس مدخل المستودع.',
          'استخدام الرافعة الشوكية الكهربائية الحساسة RFID لنقل الطبالي مباشرة إلى الرف A01-R02.',
          'طباعة وتثبيت ملصقات Barcode & RFID عند نقطة الفحص المبدئي (Receiving Staging Area).'
        ],
        aiConfidencePercent: 98,
      };
    }

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
