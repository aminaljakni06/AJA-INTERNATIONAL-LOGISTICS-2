/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise API Response Middleware
 * Phase: Enterprise Shared Infrastructure Foundation
 * Version: 1.0
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  EnterpriseErrorCode,
  EnterprisePaginationContract,
  ValidationErrorDetail,
} from '../../types/apiResponse';
import {
  buildSuccessResponse,
  buildErrorResponse,
  buildCollectionResponse,
  buildEmptyResponse,
  buildAIResponse,
  buildFileUploadResponse,
  buildIntegrationResponse,
} from '../utils/apiResponseBuilder';
import { getHttpStatusMapping } from '../utils/httpStatus';

export function enterpriseApiResponseMiddleware(req: Request, res: Response, next: NextFunction) {
  // Capture start time and request ID
  req.startTime = Date.now();
  const reqHeaderId = req.headers['x-request-id'] as string;
  req.requestId = reqHeaderId || `req_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

  // Always reflect x-request-id header back in response
  res.setHeader('x-request-id', req.requestId);

  const getOptions = () => ({
    requestId: req.requestId,
    executionTimeMs: req.startTime ? Date.now() - req.startTime : undefined,
    locale: (req.headers['accept-language']?.includes('ar') ? 'ar' : 'en') as 'ar' | 'en',
    correlationId: (req.headers['x-correlation-id'] as string) || undefined,
  });

  // Attach res.apiSuccess
  res.apiSuccess = function <T>(
    data: T,
    messageEn = 'Operation completed successfully',
    messageAr = 'تمت العملية بنجاح',
    statusCode = 200
  ) {
    const payload = buildSuccessResponse(data, messageEn, messageAr, getOptions());
    return this.status(statusCode).json(payload);
  };

  // Attach res.apiCreated
  res.apiCreated = function <T>(
    data: T,
    messageEn = 'Resource created successfully',
    messageAr = 'تم إنشاء المورد بنجاح'
  ) {
    const payload = buildSuccessResponse(data, messageEn, messageAr, getOptions());
    return this.status(201).json(payload);
  };

  // Attach res.apiNoContent
  res.apiNoContent = function (messageEn = 'No Content', messageAr = 'لا يوجد محتوى') {
    const payload = buildEmptyResponse(messageEn, messageAr, getOptions());
    return this.status(200).json(payload);
  };

  // Attach res.apiError
  res.apiError = function (
    errorCode: EnterpriseErrorCode,
    messageEn?: string,
    messageAr?: string,
    statusCode = 500,
    details?: unknown
  ) {
    const mapping = getHttpStatusMapping(statusCode);
    const finalErrorCode = errorCode || mapping.errorCode;
    const finalMsgEn = messageEn || mapping.defaultMessageEn;
    const finalMsgAr = messageAr || mapping.defaultMessageAr;

    const payload = buildErrorResponse(
      finalErrorCode,
      finalMsgEn,
      finalMsgAr,
      details,
      undefined,
      getOptions()
    );

    return this.status(statusCode).json(payload);
  };

  // Attach res.apiValidationFailed
  res.apiValidationFailed = function (
    details: ValidationErrorDetail[],
    messageEn = 'Validation failed for submitted data',
    messageAr = 'فشل التحقق من صحة البيانات المدخلة'
  ) {
    const payload = buildErrorResponse(
      EnterpriseErrorCode.VALIDATION_FAILED,
      messageEn,
      messageAr,
      details,
      undefined,
      getOptions()
    );

    return this.status(400).json(payload);
  };

  // Attach res.apiPaginated
  res.apiPaginated = function <T>(
    items: T[],
    pagination: EnterprisePaginationContract,
    messageEn = 'Collection retrieved successfully',
    messageAr = 'تم استرداد المجموعة بنجاح',
    summary?: Record<string, unknown>
  ) {
    const payload = buildCollectionResponse(
      items,
      pagination,
      messageEn,
      messageAr,
      summary,
      getOptions()
    );
    return this.status(200).json(payload);
  };

  // Attach res.apiAI
  res.apiAI = function <T>(
    generatedContent: T,
    provider: string,
    model: string,
    executionTimeMs: number,
    options?: {
      confidence?: number;
      tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
      warnings?: string[];
    }
  ) {
    const aiContract = buildAIResponse(generatedContent, provider, model, executionTimeMs, options);
    const payload = buildSuccessResponse(
      aiContract,
      'AI response generated successfully',
      'تمت توليد استجابة الذكاء الاصطناعي بنجاح',
      getOptions()
    );
    return this.status(200).json(payload);
  };

  // Attach res.apiUpload
  res.apiUpload = function (
    filename: string,
    mimeType: string,
    sizeBytes: number,
    storageLocation: string,
    publicUrl?: string,
    checksum?: string
  ) {
    const uploadContract = buildFileUploadResponse(
      filename,
      mimeType,
      sizeBytes,
      storageLocation,
      publicUrl,
      checksum
    );
    const payload = buildSuccessResponse(
      uploadContract,
      'File uploaded successfully',
      'تم تحميل الملف بنجاح',
      getOptions()
    );
    return this.status(201).json(payload);
  };

  // Attach res.apiIntegration
  res.apiIntegration = function <T>(
    externalSystem: string,
    transactionId: string,
    status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RETRYING',
    synchronizationState: 'SYNCHRONIZED' | 'OUT_OF_SYNC' | 'PARTIAL',
    payload?: T,
    retryInfo?: { attempts: number; maxAttempts: number; nextRetryAt?: string }
  ) {
    const integrationContract = buildIntegrationResponse(
      externalSystem,
      transactionId,
      status,
      synchronizationState,
      payload,
      retryInfo
    );
    const resPayload = buildSuccessResponse(
      integrationContract,
      'Integration transaction processed',
      'تمت معالجة معاملة التكامل بنجاح',
      getOptions()
    );
    return this.status(200).json(resPayload);
  };

  next();
}
