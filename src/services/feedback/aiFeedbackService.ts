/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise AI Feedback Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { AIFeedbackStatus } from '../../types/feedbackFramework';
import { enterpriseToastService } from './toastService';

export interface AIFeedbackEvent {
  status: AIFeedbackStatus;
  provider?: string;
  model?: string;
  messageEn?: string;
  messageAr?: string;
  tokenCount?: number;
}

class EnterpriseAIFeedbackService {
  private currentToastId: string | null = null;

  public notifyAIFeedback(event: AIFeedbackEvent): void {
    const providerStr = event.provider ? ` (${event.provider})` : '';

    switch (event.status) {
      case 'thinking':
        this.currentToastId = enterpriseToastService.loading(
          `AI Assistant is thinking...${providerStr}`,
          `المساعد الذكي يفكر...${providerStr}`
        );
        break;

      case 'generating':
      case 'streaming':
        if (!this.currentToastId) {
          this.currentToastId = enterpriseToastService.loading(
            `AI is generating response...${providerStr}`,
            `المساعد الذكي يقوم بإنشاء الإجابة...${providerStr}`
          );
        }
        break;

      case 'completed':
        if (this.currentToastId) {
          enterpriseToastService.dismiss(this.currentToastId);
          this.currentToastId = null;
        }
        enterpriseToastService.success(
          `AI processing complete${providerStr}`,
          `يكتمل معالجة الذكاء الاصطناعي${providerStr}`,
          event.messageEn,
          event.messageAr
        );
        break;

      case 'failed':
        if (this.currentToastId) {
          enterpriseToastService.dismiss(this.currentToastId);
          this.currentToastId = null;
        }
        enterpriseToastService.error(
          `AI processing failed${providerStr}`,
          `فشلت معالجة الذكاء الاصطناعي${providerStr}`,
          event.messageEn || 'Please try again later',
          event.messageAr || 'يرجى المحاولة مرة أخرى لاحقاً'
        );
        break;

      case 'rate_limited':
        if (this.currentToastId) {
          enterpriseToastService.dismiss(this.currentToastId);
          this.currentToastId = null;
        }
        enterpriseToastService.warning(
          'AI Rate limit reached',
          'تم الوصول إلى حد استخدام الذكاء الاصطناعي',
          'Request throttled. Retrying shortly.',
          'تم إبطاء الطلب. سيتم إعادة المحاولة قريباً.'
        );
        break;

      case 'provider_switched':
        enterpriseToastService.info(
          `AI Provider Switched to ${event.provider || 'Fallback'}`,
          `تم التبديل إلى مزود الذكاء الاصطناعي البديل ${event.provider || ''}`,
          'Seamlessly failed over to backup provider.',
          'تم الانتقال التلقائي إلى المزود الاحتياطي.'
        );
        break;

      case 'provider_unavailable':
        enterpriseToastService.error(
          'AI Service Unavailable',
          'خدمة الذكاء الاصطناعي غير متاحة',
          'Primary AI model unreachable.',
          'تعذر الاتصال بنموذج الذكاء الاصطناعي.'
        );
        break;

      default:
        break;
    }
  }
}

export const enterpriseAIFeedbackService = new EnterpriseAIFeedbackService();
