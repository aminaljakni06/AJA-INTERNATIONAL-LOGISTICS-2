import {
  EnterpriseErrorCode,
  EnterprisePaginationContract,
  EnterpriseResponseMetadata,
  ValidationErrorDetail,
} from './apiResponse';

declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }

    interface Response {
      apiSuccess<T>(data: T, messageEn?: string, messageAr?: string, statusCode?: number): this;
      apiCreated<T>(data: T, messageEn?: string, messageAr?: string): this;
      apiNoContent(messageEn?: string, messageAr?: string): this;
      apiError(
        errorCode: EnterpriseErrorCode,
        messageEn?: string,
        messageAr?: string,
        statusCode?: number,
        details?: unknown
      ): this;
      apiValidationFailed(
        details: ValidationErrorDetail[],
        messageEn?: string,
        messageAr?: string
      ): this;
      apiPaginated<T>(
        items: T[],
        pagination: EnterprisePaginationContract,
        messageEn?: string,
        messageAr?: string,
        summary?: Record<string, unknown>
      ): this;
      apiAI<T>(
        generatedContent: T,
        provider: string,
        model: string,
        executionTimeMs: number,
        options?: {
          confidence?: number;
          tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
          warnings?: string[];
        }
      ): this;
      apiUpload(
        filename: string,
        mimeType: string,
        sizeBytes: number,
        storageLocation: string,
        publicUrl?: string,
        checksum?: string
      ): this;
      apiIntegration<T>(
        externalSystem: string,
        transactionId: string,
        status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RETRYING',
        synchronizationState: 'SYNCHRONIZED' | 'OUT_OF_SYNC' | 'PARTIAL',
        payload?: T,
        retryInfo?: { attempts: number; maxAttempts: number; nextRetryAt?: string }
      ): this;
    }
  }
}
