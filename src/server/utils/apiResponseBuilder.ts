/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise API Response Builder
 * Phase: Enterprise Shared Infrastructure Foundation
 * Version: 1.0
 */

import crypto from 'crypto';
import {
  EnterpriseErrorCode,
  EnterpriseSuccessResponse,
  EnterpriseErrorResponse,
  EnterpriseCollectionResponse,
  EnterpriseEmptyResponse,
  EnterprisePaginationContract,
  EnterpriseResponseMetadata,
  EnterpriseAIResponseContract,
  EnterpriseFileUploadResponse,
  EnterpriseIntegrationResponse,
  ValidationErrorDetail,
} from '../../types/apiResponse';
import { getHttpStatusMapping } from './httpStatus';

export interface ResponseBuilderOptions {
  requestId?: string;
  executionTimeMs?: number;
  locale?: string;
  correlationId?: string;
  apiVersion?: string;
}

const DEFAULT_API_VERSION = '1.0';

export function buildMetadata(options?: ResponseBuilderOptions): EnterpriseResponseMetadata {
  return {
    apiVersion: options?.apiVersion || DEFAULT_API_VERSION,
    executionTimeMs: options?.executionTimeMs,
    locale: options?.locale || 'en',
    correlationId: options?.correlationId,
    serverNode: process.env.NODE_ENV || 'development',
  };
}

export function generateRequestId(providedId?: string): string {
  if (providedId && providedId.trim().length > 0) {
    return providedId;
  }
  return `req_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
}

export function buildSuccessResponse<T>(
  data: T,
  messageEn = 'Operation completed successfully',
  messageAr = 'تمت العملية بنجاح',
  options?: ResponseBuilderOptions
): EnterpriseSuccessResponse<T> {
  const reqId = generateRequestId(options?.requestId);
  return {
    success: true,
    message: messageEn,
    messageAr,
    data,
    metadata: buildMetadata(options),
    timestamp: new Date().toISOString(),
    requestId: reqId,
  };
}

export function buildErrorResponse(
  errorCode: EnterpriseErrorCode,
  messageEn?: string,
  messageAr?: string,
  details?: Record<string, unknown> | ValidationErrorDetail[] | unknown,
  stack?: string,
  options?: ResponseBuilderOptions
): EnterpriseErrorResponse {
  const reqId = generateRequestId(options?.requestId);
  const isProduction = process.env.NODE_ENV === 'production';

  const defaultMsg = messageEn || 'An error occurred';
  const defaultMsgAr = messageAr || 'حدث خطأ في النظام';

  return {
    success: false,
    errorCode,
    message: defaultMsg,
    messageAr: defaultMsgAr,
    details: details ?? undefined,
    error: {
      code: errorCode,
      message: defaultMsg,
      messageAr: defaultMsgAr,
      details: details as Record<string, unknown> | ValidationErrorDetail[],
      stack: isProduction ? undefined : stack,
    },
    metadata: buildMetadata(options),
    timestamp: new Date().toISOString(),
    requestId: reqId,
  };
}

export function buildCollectionResponse<T>(
  items: T[],
  pagination: EnterprisePaginationContract,
  messageEn = 'Collection retrieved successfully',
  messageAr = 'تم استرداد المجموعة بنجاح',
  summary?: Record<string, unknown>,
  options?: ResponseBuilderOptions
): EnterpriseCollectionResponse<T> {
  const reqId = generateRequestId(options?.requestId);
  return {
    success: true,
    message: messageEn,
    messageAr,
    items,
    pagination,
    summary,
    metadata: buildMetadata(options),
    timestamp: new Date().toISOString(),
    requestId: reqId,
  };
}

export function buildEmptyResponse(
  messageEn = 'Success',
  messageAr = 'تم بنجاح',
  options?: ResponseBuilderOptions
): EnterpriseEmptyResponse {
  const reqId = generateRequestId(options?.requestId);
  return {
    success: true,
    message: messageEn,
    messageAr,
    metadata: buildMetadata(options),
    timestamp: new Date().toISOString(),
    requestId: reqId,
  };
}

export function buildAIResponse<T = unknown>(
  generatedContent: T,
  provider: string,
  model: string,
  executionTimeMs: number,
  options?: {
    confidence?: number;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
    warnings?: string[];
  }
): EnterpriseAIResponseContract<T> {
  return {
    generatedContent,
    provider,
    model,
    executionTimeMs,
    confidence: options?.confidence,
    tokenUsage: options?.tokenUsage,
    warnings: options?.warnings,
  };
}

export function buildFileUploadResponse(
  filename: string,
  mimeType: string,
  sizeBytes: number,
  storageLocation: string,
  publicUrl?: string,
  checksum?: string
): EnterpriseFileUploadResponse {
  return {
    filename,
    mimeType,
    sizeBytes,
    storageLocation,
    publicUrl,
    checksum,
  };
}

export function buildIntegrationResponse<T = unknown>(
  externalSystem: string,
  transactionId: string,
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RETRYING',
  synchronizationState: 'SYNCHRONIZED' | 'OUT_OF_SYNC' | 'PARTIAL',
  payload?: T,
  retryInformation?: {
    attempts: number;
    maxAttempts: number;
    nextRetryAt?: string;
  }
): EnterpriseIntegrationResponse<T> {
  return {
    externalSystem,
    transactionId,
    status,
    synchronizationState,
    payload,
    retryInformation,
  };
}
