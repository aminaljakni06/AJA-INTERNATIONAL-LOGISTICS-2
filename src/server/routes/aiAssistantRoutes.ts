import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { processAIAssistantChat } from '../services/aiAssistantService';

const router = Router();

/**
 * POST /api/ai/chat
 * Secure AI assistant endpoint utilizing Gemini 3.6 Flash & controlled tools.
 */
router.post('/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  try {
    const { message, history } = req.body;
    const user = req.user!;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'الرسالة مطلوبة للتحدث مع مساعد أجا الذكي' });
      return;
    }

    console.log(`[AI CHAT REQUEST] User: ${user.email} (${user.role}) | Message: "${message.slice(0, 80)}"`);

    const result = await processAIAssistantChat(message.trim(), history || [], user);

    const durationMs = Date.now() - startTime;
    console.log(`[AI CHAT RESPONSE] Completed in ${durationMs}ms | Tool Calls: ${result.toolLogs.length}`);

    res.json({
      reply: result.reply,
      toolLogs: result.toolLogs,
      durationMs,
    });
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Error processing AI chat request';
    console.error(`[AI CHAT ERROR] (${durationMs}ms):`, errorMessage);

    if (errorMessage.includes('GEMINI_API_KEY')) {
      res.status(503).json({
        error: 'خدمة مساعد أجا الذكي غير متوفرة حالياً (لم يتم تهيئة مفتاح API الخاص بـ Gemini). يمكنك التواصل مع الدعم الفني.',
      });
      return;
    }

    res.status(500).json({
      error: 'عذراً، حدث خطأ مؤقت أثناء معالجة استفسارك عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.',
      details: errorMessage,
    });
  }
});

export default router;
