/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Integration Feedback Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { IntegrationFeedbackStatus } from '../../types/feedbackFramework';
import { enterpriseToastService } from './toastService';

export interface IntegrationFeedbackEvent {
  status: IntegrationFeedbackStatus;
  provider: string; // e.g. 'DHL', 'Maersk', 'Saudi Customs', 'Stripe'
  detailsEn?: string;
  detailsAr?: string;
}

class EnterpriseIntegrationFeedbackService {
  public notifyIntegrationEvent(event: IntegrationFeedbackEvent): void {
    const provider = event.provider;

    switch (event.status) {
      case 'connected':
        enterpriseToastService.success(
          `${provider} Connected`,
          `تم الاتصال بـ ${provider}`,
          event.detailsEn || 'API integration initialized successfully.',
          event.detailsAr || 'تم إعداد الربط بنجاح.'
        );
        break;

      case 'disconnected':
        enterpriseToastService.warning(
          `${provider} Disconnected`,
          `تم قطع الاتصال بـ ${provider}`,
          event.detailsEn || 'Integration session ended.',
          event.detailsAr || 'انتهت جلسة الربط.'
        );
        break;

      case 'sync_complete':
        enterpriseToastService.success(
          `${provider} Sync Complete`,
          `اكتملت المزامنة مع ${provider}`,
          event.detailsEn || 'All records updated.',
          event.detailsAr || 'تم تحديث جميع السجلات.'
        );
        break;

      case 'sync_failed':
        enterpriseToastService.error(
          `${provider} Sync Failed`,
          `فشلت المزامنة مع ${provider}`,
          event.detailsEn || 'Synchronization error occurred.',
          event.detailsAr || 'حدث خطأ أثناء المزامنة.'
        );
        break;

      case 'connection_lost':
        enterpriseToastService.error(
          `Connection Lost: ${provider}`,
          `انقطع الاتصال بـ ${provider}`,
          'Retrying integration connection automatically...',
          'جاري إعادة الاتصال تلقائياً...'
        );
        break;

      case 'connection_restored':
        enterpriseToastService.success(
          `Connection Restored: ${provider}`,
          `تم استعادة الاتصال بـ ${provider}`,
          'Integration link restored.',
          'تم استعادة رابط المزامنة.'
        );
        break;

      case 'import_complete':
        enterpriseToastService.success(
          `Data Import Finished (${provider})`,
          `اكتمل استيراد البيانات (${provider})`,
          event.detailsEn,
          event.detailsAr
        );
        break;

      case 'export_complete':
        enterpriseToastService.success(
          `Data Export Finished (${provider})`,
          `اكتمل تصدير البيانات (${provider})`,
          event.detailsEn,
          event.detailsAr
        );
        break;

      default:
        break;
    }
  }
}

export const enterpriseIntegrationFeedbackService = new EnterpriseIntegrationFeedbackService();
