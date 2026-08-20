/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Error Utilities & Normalizers
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Error Handling Framework
 * Version: 1.0
 */

import {
  EnterpriseAppError,
  EnterpriseAIError,
  EnterpriseIntegrationError,
  ErrorCategory,
  ErrorSeverity,
} from '../types/errors';
import { EnterpriseErrorCode } from '../types/apiResponse';

/**
 * Safely format error messages into bilingual localized strings
 */
export function formatErrorMessage(
  error: unknown,
  isAr = false
): { message: string; errorCode: string } {
  if (error instanceof EnterpriseAppError) {
    return {
      message: isAr ? error.messageAr : error.messageEn,
      errorCode: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      errorCode: EnterpriseErrorCode.UNKNOWN_ERROR,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      errorCode: EnterpriseErrorCode.UNKNOWN_ERROR,
    };
  }

  return {
    message: isAr ? 'حدث خطأ غير معروف' : 'An unknown error occurred',
    errorCode: EnterpriseErrorCode.UNKNOWN_ERROR,
  };
}

/**
 * Normalizes AI Service exceptions without exposing raw provider details
 */
export function normalizeAIError(provider: string, error: unknown): EnterpriseAIError {
  const messageEn = error instanceof Error ? error.message : 'AI generation model failure';
  return new EnterpriseAIError(provider, messageEn, {
    rawErrorName: error instanceof Error ? error.name : 'Unknown',
  });
}

/**
 * Normalizes Integration & Carrier API exceptions
 */
export function normalizeIntegrationError(
  externalSystem: string,
  error: unknown
): EnterpriseIntegrationError {
  const messageEn =
    error instanceof Error
      ? `Integration error with ${externalSystem}: ${error.message}`
      : `Failed to communicate with ${externalSystem}`;

  const isRetryable =
    error instanceof TypeError ||
    (typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      [502, 503, 504].includes((error as any).status));

  return new EnterpriseIntegrationError(
    externalSystem,
    messageEn,
    isRetryable,
    error instanceof Error ? error : undefined
  );
}

/**
 * Provides offline state error information
 */
export function getOfflineErrorDetails(isAr = false): {
  message: string;
  code: EnterpriseErrorCode;
  category: ErrorCategory;
} {
  return {
    message: isAr
      ? 'انقطع الاتصال بالشبكة. سيتم حفظ الإجراءات ومزامنتها تلقائياً عند إعادة الاتصال'
      : 'Network connection lost. Actions will be queued and synchronized upon reconnection.',
    code: EnterpriseErrorCode.SERVICE_UNAVAILABLE,
    category: ErrorCategory.NETWORK,
  };
}
