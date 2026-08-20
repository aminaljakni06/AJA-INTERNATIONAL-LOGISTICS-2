/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Error Framework Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Version: 1.0
 */

import { EnterpriseErrorCode } from './apiResponse';

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  BUSINESS_RULE = 'BUSINESS_RULE',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  INTEGRATION = 'INTEGRATION',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  UPLOAD = 'UPLOAD',
  AI_PROVIDER = 'AI_PROVIDER',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  UNEXPECTED = 'UNEXPECTED',
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL',
}

export interface ErrorContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  module?: string;
  endpoint?: string;
  timestamp?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface EnterpriseErrorOptions {
  code: EnterpriseErrorCode;
  category: ErrorCategory;
  severity?: ErrorSeverity;
  httpStatusCode?: number;
  isRetryable?: boolean;
  messageEn: string;
  messageAr?: string;
  details?: unknown;
  context?: ErrorContext;
  cause?: Error;
}

export class EnterpriseAppError extends Error {
  public readonly code: EnterpriseErrorCode;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly httpStatusCode: number;
  public readonly isRetryable: boolean;
  public readonly messageEn: string;
  public readonly messageAr: string;
  public readonly details?: unknown;
  public readonly context?: ErrorContext;
  public readonly cause?: Error;

  constructor(options: EnterpriseErrorOptions) {
    super(options.messageEn);
    this.name = this.constructor.name;
    this.code = options.code;
    this.category = options.category;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.httpStatusCode = options.httpStatusCode || 500;
    this.isRetryable = options.isRetryable ?? false;
    this.messageEn = options.messageEn;
    this.messageAr = options.messageAr || 'حدث خطأ غير متوقع في النظام';
    this.details = options.details;
    this.context = options.context;
    this.cause = options.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Subclasses for Specific Classifications

export class EnterpriseValidationError extends EnterpriseAppError {
  constructor(messageEn = 'Validation failed for request data', details?: unknown, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.VALIDATION_FAILED,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      httpStatusCode: 400,
      isRetryable: false,
      messageEn,
      messageAr: 'فشل التحقق من صحة البيانات المدخلة',
      details,
      context,
    });
  }
}

export class EnterpriseAuthenticationError extends EnterpriseAppError {
  constructor(messageEn = 'Authentication required or invalid credentials', context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.UNAUTHENTICATED,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.WARNING,
      httpStatusCode: 401,
      isRetryable: false,
      messageEn,
      messageAr: 'المصادقة مطلوبة أو بيانات الاعتماد غير صالحة',
      context,
    });
  }
}

export class EnterpriseAuthorizationError extends EnterpriseAppError {
  constructor(messageEn = 'Insufficient permissions to execute action', context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.UNAUTHORIZED,
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.WARNING,
      httpStatusCode: 403,
      isRetryable: false,
      messageEn,
      messageAr: 'ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء',
      context,
    });
  }
}

export class EnterpriseBusinessRuleError extends EnterpriseAppError {
  constructor(messageEn: string, messageAr?: string, details?: unknown, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.BUSINESS_RULE_VIOLATION,
      category: ErrorCategory.BUSINESS_RULE,
      severity: ErrorSeverity.WARNING,
      httpStatusCode: 422,
      isRetryable: false,
      messageEn,
      messageAr: messageAr || 'مخالفة لقواعد العمل والتشغيل',
      details,
      context,
    });
  }
}

export class EnterpriseNotFoundError extends EnterpriseAppError {
  constructor(resourceName = 'Resource', resourceId?: string, context?: ErrorContext) {
    const msg = resourceId ? `${resourceName} with ID '${resourceId}' was not found` : `${resourceName} not found`;
    super({
      code: EnterpriseErrorCode.RESOURCE_NOT_FOUND,
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.INFO,
      httpStatusCode: 404,
      isRetryable: false,
      messageEn: msg,
      messageAr: `المورد المطلوب (${resourceName}) غير موجود في النظام`,
      context,
    });
  }
}

export class EnterpriseConflictError extends EnterpriseAppError {
  constructor(messageEn = 'Resource conflict or duplicate record', details?: unknown, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.RESOURCE_CONFLICT,
      category: ErrorCategory.CONFLICT,
      severity: ErrorSeverity.WARNING,
      httpStatusCode: 409,
      isRetryable: false,
      messageEn,
      messageAr: 'تعارض في بيانات المورد أو السجل مكرر بالفعل',
      details,
      context,
    });
  }
}

export class EnterpriseDatabaseError extends EnterpriseAppError {
  constructor(messageEn = 'Database operation failed', cause?: Error, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.DATABASE_ERROR,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.ERROR,
      httpStatusCode: 500,
      isRetryable: true,
      messageEn,
      messageAr: 'حدث خطأ أثناء الاتصال بقاعدة البيانات',
      cause,
      context,
    });
  }
}

export class EnterpriseIntegrationError extends EnterpriseAppError {
  constructor(externalSystem: string, messageEn?: string, isRetryable = true, cause?: Error, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.INTEGRATION_ERROR,
      category: ErrorCategory.INTEGRATION,
      severity: ErrorSeverity.ERROR,
      httpStatusCode: 502,
      isRetryable,
      messageEn: messageEn || `Integration failure with external system: ${externalSystem}`,
      messageAr: `فشل الاتصال والتكامل مع النظام الخارجي: ${externalSystem}`,
      cause,
      context,
    });
  }
}

export class EnterpriseAIError extends EnterpriseAppError {
  constructor(provider: string, messageEn?: string, details?: unknown, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.AI_SERVICE_ERROR,
      category: ErrorCategory.AI_PROVIDER,
      severity: ErrorSeverity.ERROR,
      httpStatusCode: 500,
      isRetryable: true,
      messageEn: messageEn || `AI provider service error (${provider})`,
      messageAr: `حدث خطأ في خدمة الذكاء الاصطناعي (${provider})`,
      details,
      context,
    });
  }
}

export class EnterpriseTimeoutError extends EnterpriseAppError {
  constructor(operation = 'Operation', timeoutMs = 30000, context?: ErrorContext) {
    super({
      code: EnterpriseErrorCode.EXTERNAL_SERVICE_TIMEOUT,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.ERROR,
      httpStatusCode: 504,
      isRetryable: true,
      messageEn: `${operation} timed out after ${timeoutMs}ms`,
      messageAr: `انتهت مهلة تنفيذ العملية (${operation}) بعد ${timeoutMs} مللي ثانية`,
      context,
    });
  }
}
