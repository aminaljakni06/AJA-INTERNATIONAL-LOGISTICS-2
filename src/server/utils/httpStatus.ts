/**
 * AJA INTERNATIONAL LOGISTICS — HTTP Status Code & Error Code Mapping
 * Phase: Enterprise Shared Infrastructure Foundation
 * Version: 1.0
 */

import { EnterpriseErrorCode } from '../../types/apiResponse';

export interface HttpStatusMapping {
  httpStatus: number;
  errorCode: EnterpriseErrorCode;
  defaultMessageEn: string;
  defaultMessageAr: string;
}

export const HTTP_STATUS_MAPPINGS: Record<number, HttpStatusMapping> = {
  200: {
    httpStatus: 200,
    errorCode: EnterpriseErrorCode.VALIDATION_FAILED, // Default placeholder if success
    defaultMessageEn: 'Operation completed successfully',
    defaultMessageAr: 'تمت العملية بنجاح',
  },
  201: {
    httpStatus: 201,
    errorCode: EnterpriseErrorCode.VALIDATION_FAILED,
    defaultMessageEn: 'Resource created successfully',
    defaultMessageAr: 'تم إنشاء المورد بنجاح',
  },
  202: {
    httpStatus: 202,
    errorCode: EnterpriseErrorCode.VALIDATION_FAILED,
    defaultMessageEn: 'Request accepted for processing',
    defaultMessageAr: 'تم قبول الطلب للمعالجة',
  },
  204: {
    httpStatus: 204,
    errorCode: EnterpriseErrorCode.VALIDATION_FAILED,
    defaultMessageEn: 'No content',
    defaultMessageAr: 'لا يوجد محتوى',
  },
  400: {
    httpStatus: 400,
    errorCode: EnterpriseErrorCode.VALIDATION_FAILED,
    defaultMessageEn: 'Bad request or validation error',
    defaultMessageAr: 'طلب غير صالحة أو خطأ في التحقق',
  },
  401: {
    httpStatus: 401,
    errorCode: EnterpriseErrorCode.UNAUTHENTICATED,
    defaultMessageEn: 'Authentication required',
    defaultMessageAr: 'يتطلب تسجيل الدخول المصادقة',
  },
  403: {
    httpStatus: 403,
    errorCode: EnterpriseErrorCode.FORBIDDEN,
    defaultMessageEn: 'Access forbidden. Insufficient permissions',
    defaultMessageAr: 'الوصول محظور. الصلاحيات غير كافية',
  },
  404: {
    httpStatus: 404,
    errorCode: EnterpriseErrorCode.RESOURCE_NOT_FOUND,
    defaultMessageEn: 'Requested resource not found',
    defaultMessageAr: 'المورد المطلوب غير موجود',
  },
  409: {
    httpStatus: 409,
    errorCode: EnterpriseErrorCode.RESOURCE_CONFLICT,
    defaultMessageEn: 'Resource conflict or duplicate entry',
    defaultMessageAr: 'تعارض في الموارد أو إدخال مكرر',
  },
  422: {
    httpStatus: 422,
    errorCode: EnterpriseErrorCode.BUSINESS_RULE_VIOLATION,
    defaultMessageEn: 'Unprocessable entity or business rule violation',
    defaultMessageAr: 'الكيان غير قابل للمعالجة أو انتهاك لقواعد العمل',
  },
  429: {
    httpStatus: 429,
    errorCode: EnterpriseErrorCode.RATE_LIMIT_EXCEEDED,
    defaultMessageEn: 'Rate limit exceeded. Too many requests',
    defaultMessageAr: 'تم تجاوز حد الطلبات. الكثير من المحاولات',
  },
  500: {
    httpStatus: 500,
    errorCode: EnterpriseErrorCode.INTERNAL_SERVER_ERROR,
    defaultMessageEn: 'Internal server error occurred',
    defaultMessageAr: 'حدث خطأ داخلي في الخادم',
  },
  502: {
    httpStatus: 502,
    errorCode: EnterpriseErrorCode.INTEGRATION_ERROR,
    defaultMessageEn: 'Bad gateway or external integration error',
    defaultMessageAr: 'خطأ في البوابة أو في التكامل الخارجي',
  },
  503: {
    httpStatus: 503,
    errorCode: EnterpriseErrorCode.SERVICE_UNAVAILABLE,
    defaultMessageEn: 'Service temporarily unavailable',
    defaultMessageAr: 'الخدمة غير متوفرة حالياً',
  },
  504: {
    httpStatus: 504,
    errorCode: EnterpriseErrorCode.EXTERNAL_SERVICE_TIMEOUT,
    defaultMessageEn: 'Gateway timeout',
    defaultMessageAr: 'انتهت مهلة استجابة البوابة',
  },
};

export function getHttpStatusMapping(statusCode: number): HttpStatusMapping {
  return (
    HTTP_STATUS_MAPPINGS[statusCode] || {
      httpStatus: statusCode,
      errorCode: EnterpriseErrorCode.UNKNOWN_ERROR,
      defaultMessageEn: 'An unexpected error occurred',
      defaultMessageAr: 'حدث خطأ غير متوقع',
    }
  );
}
