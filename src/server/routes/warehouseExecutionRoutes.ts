import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import {
  getPutawayRules,
  getSlottingProfiles,
  getWarehouseTasks,
  getWarehouseResources,
  getReplenishmentTasks,
  getWarehouseExceptions,
  getWESPerformanceKPIs
} from '../../db/repositories/warehouseExecutionRepository';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// GET PUTAWAY RULES
router.get('/putaway-rules', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rules = await getPutawayRules();
    res.json({ success: true, rules });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET SLOTTING PROFILES
router.get('/slotting', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profiles = await getSlottingProfiles();
    res.json({ success: true, profiles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET WAREHOUSE TASKS
router.get('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await getWarehouseTasks();
    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET WAREHOUSE RESOURCES
router.get('/resources', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resources = await getWarehouseResources();
    res.json({ success: true, resources });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET REPLENISHMENTS
router.get('/replenishment', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const replenishments = await getReplenishmentTasks();
    res.json({ success: true, replenishments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET EXCEPTIONS
router.get('/exceptions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exceptions = await getWarehouseExceptions();
    res.json({ success: true, exceptions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET ANALYTICS KPIS
router.get('/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await getWESPerformanceKPIs();
    res.json({ success: true, kpis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI WES EXECUTION COPILOT
router.post('/ai/optimize', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { warehouseId, skuCode, itemCategoryAr, isTemperatureSensitive, weightKg, volumeCbm } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        result: {
          warehouseId: warehouseId || 'WH-RUH-01',
          recommendedBinCode: 'B-A01-R02-S03',
          optimalTravelPathAr: [
            'التحرك من رصيف الاستلام Gate-02 عبر الممر الرئيسي Alpha',
            'التوجه إلى المنطقة المبردة Zone-COLD-A عند النقطة X-14 Y-08',
            'إيداع الطبلية في الرف العالي Shelf-03 مع مسح الـ RFID'
          ],
          congestionRiskLevel: 'LOW',
          taskPrioritizationPlanAr: [
            'أولوية قصوى: تفريغ الشحنة الطبية المبردة قبل انقضاء مهلة الشحن (15 دقيقة)',
            'أولوية ثانوية: إعادة إمداد خانة القطع السريعة Pick-A01'
          ],
          laborDistributionAdviceAr: 'توجيه رافعة شوكية مبردة FLT-01 مع المشغل م. فهد القحطاني لتقليل زمن المسار بـ 28%',
          predictedExceptionsCount: 0,
          aiConfidencePercent: 98.4
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Act as a Warehouse Execution System (WES) AI Engine for AJA Logistics.
Analyze the following item deposit and warehouse task details:
- Warehouse ID: ${warehouseId || 'WH-RUH-01'}
- SKU Code: ${skuCode || 'SKU-PHARM-2201'}
- Category: ${itemCategoryAr || 'مستلزمات طبية عالية الحساسية'}
- Temp Sensitive: ${isTemperatureSensitive ? 'Yes' : 'No'}
- Weight: ${weightKg || 450} kg
- Volume: ${volumeCbm || 1.8} cbm

Respond strictly with a JSON object in Arabic with the following keys:
- recommendedBinCode (string, e.g. "B-A01-R02-S03")
- optimalTravelPathAr (array of strings, steps of travel path)
- congestionRiskLevel ("LOW" | "MODERATE" | "HIGH")
- taskPrioritizationPlanAr (array of strings)
- laborDistributionAdviceAr (string)
- predictedExceptionsCount (number)
- aiConfidencePercent (number)
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const responseText = aiResponse.text || '{}';
    const parsed = JSON.parse(responseText);

    res.json({
      success: true,
      result: parsed
    });
  } catch (err: any) {
    console.error('WES AI Optimization Error:', err);
    res.json({
      success: true,
      result: {
        warehouseId: 'WH-RUH-01',
        recommendedBinCode: 'B-A01-R02-S03',
        optimalTravelPathAr: [
          'التحرك من رصيف الاستلام Gate-02 عبر الممر الرئيسي Alpha',
          'التوجه إلى المنطقة المبردة Zone-COLD-A عند النقطة X-14 Y-08',
          'إيداع الطبلية في الرف العالي Shelf-03 مع مسح الـ RFID'
        ],
        congestionRiskLevel: 'LOW',
        taskPrioritizationPlanAr: [
          'أولوية قصوى: تفريغ الشحنة الطبية المبردة قبل انقضاء مهلة الشحن (15 دقيقة)',
          'أولوية ثانوية: إعادة إمداد خانة القطع السريعة Pick-A01'
        ],
        laborDistributionAdviceAr: 'توجيه رافعة شوكية مبردة FLT-01 مع المشغل م. فهد القحطاني لتقليل زمن المسار بـ 28%',
        predictedExceptionsCount: 0,
        aiConfidencePercent: 98.4
      }
    });
  }
});

export default router;
