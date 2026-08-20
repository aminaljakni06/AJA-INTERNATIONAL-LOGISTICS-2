/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise API Response Standard
 * Phase: Enterprise Shared Infrastructure Foundation
 * Version: 1.0
 */

export enum EnterpriseErrorCode {
  // Validation
  VALIDATION_FAILED = 'VAL_400_01',
  INVALID_FIELD = 'VAL_400_02',
  MISSING_REQUIRED_FIELD = 'VAL_400_03',

  // Authentication
  UNAUTHENTICATED = 'AUTH_401_01',
  TOKEN_EXPIRED = 'AUTH_401_02',
  INVALID_CREDENTIALS = 'AUTH_401_03',

  // Authorization
  UNAUTHORIZED = 'AUTH_403_01',
  FORBIDDEN = 'AUTH_403_02',
  INSUFFICIENT_PERMISSIONS = 'AUTH_403_03',

  // Business Rules
  BUSINESS_RULE_VIOLATION = 'BUS_422_01',
  INVALID_STATUS_TRANSITION = 'BUS_422_02',
  LIMIT_EXCEEDED = 'BUS_422_03',

  // Resource Not Found
  RESOURCE_NOT_FOUND = 'RES_404_01',
  ROUTE_NOT_FOUND = 'RES_404_02',

  // Conflict
  RESOURCE_CONFLICT = 'CONF_409_01',
  DUPLICATE_ENTRY = 'CONF_409_02',

  // Integration
  INTEGRATION_ERROR = 'INT_502_01',
  EXTERNAL_SERVICE_TIMEOUT = 'INT_504_01',
  THIRD_PARTY_FAILURE = 'INT_502_02',

  // Database
  DATABASE_ERROR = 'DB_500_01',
  QUERY_FAILED = 'DB_500_02',
  TRANSACTION_FAILED = 'DB_500_03',

  // AI
  AI_SERVICE_ERROR = 'AI_500_01',
  MODEL_TIMEOUT = 'AI_504_01',
  PROMPT_SAFETY_VIOLATION = 'AI_400_01',

  // General & Unknown
  INTERNAL_SERVER_ERROR = 'SYS_500_01',
  RATE_LIMIT_EXCEEDED = 'SYS_429_01',
  SERVICE_UNAVAILABLE = 'SYS_503_01',
  UNKNOWN_ERROR = 'SYS_500_00',
}

export interface EnterpriseResponseMetadata {
  executionTimeMs?: number;
  apiVersion: string;
  locale?: 'en' | 'ar' | string;
  timezone?: string;
  correlationId?: string;
  serverNode?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  messageAr?: string;
  rule: string;
  rejectedValue?: unknown;
}

export interface EnterpriseSuccessResponse<T> {
  success: true;
  message: string;
  messageAr?: string;
  data: T;
  metadata?: EnterpriseResponseMetadata;
  timestamp: string;
  requestId: string;
}

export interface EnterpriseErrorDetail {
  code: EnterpriseErrorCode;
  message: string;
  messageAr?: string;
  details?: Record<string, unknown> | ValidationErrorDetail[];
  stack?: string;
}

export interface EnterpriseErrorResponse {
  success: false;
  error: EnterpriseErrorDetail;
  errorCode: EnterpriseErrorCode;
  message: string;
  messageAr?: string;
  details?: unknown;
  metadata?: EnterpriseResponseMetadata;
  timestamp: string;
  requestId: string;
}

export interface EnterprisePaginationContract {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  filters?: Record<string, unknown>;
}

export interface EnterpriseCollectionResponse<T> {
  success: true;
  message: string;
  messageAr?: string;
  items: T[];
  pagination: EnterprisePaginationContract;
  summary?: Record<string, unknown>;
  metadata?: EnterpriseResponseMetadata;
  timestamp: string;
  requestId: string;
}

export interface EnterpriseEmptyResponse {
  success: true;
  message: string;
  messageAr?: string;
  metadata?: EnterpriseResponseMetadata;
  timestamp: string;
  requestId: string;
}

export interface EnterpriseAIResponseContract<T = unknown> {
  generatedContent: T;
  confidence?: number;
  provider: string;
  model: string;
  executionTimeMs: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  warnings?: string[];
}

export interface EnterpriseFileUploadResponse {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageLocation: string;
  publicUrl?: string;
  checksum?: string;
}

export interface EnterpriseIntegrationResponse<T = unknown> {
  externalSystem: string;
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RETRYING';
  synchronizationState: 'SYNCHRONIZED' | 'OUT_OF_SYNC' | 'PARTIAL';
  retryInformation?: {
    attempts: number;
    maxAttempts: number;
    nextRetryAt?: string;
  };
  payload?: T;
}

export type EnterpriseApiResponse<T> =
  | EnterpriseSuccessResponse<T>
  | EnterpriseErrorResponse
  | EnterpriseCollectionResponse<T>
  | EnterpriseEmptyResponse;
