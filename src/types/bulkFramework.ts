/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Bulk Actions & Selection Framework Types
 * Phase: Enterprise UI System
 * Module: Bulk Actions, Selection & Mass Operations (STEP 05.17)
 * Version: 1.0
 */

import { EnterpriseQueryState } from './queryFramework';

export type BulkSelectionMode = 'NONE' | 'EXPLICIT' | 'PAGE' | 'QUERY';

export type BulkActionVariant = 'primary' | 'danger' | 'warning' | 'secondary' | 'success';

export type BulkExecutionPolicy = 'ATOMIC' | 'BEST_EFFORT';

export type BulkOperationStatus = 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'CANCELLED';

/**
 * Server-safe descriptor representing selection scope without transferring thousands of IDs
 */
export type BulkSelectionDescriptor =
  | {
      mode: 'EXPLICIT';
      ids: string[];
    }
  | {
      mode: 'PAGE';
      ids: string[];
      page: number;
    }
  | {
      mode: 'QUERY';
      resource: string;
      query: EnterpriseQueryState;
      excludedIds: string[];
    };

/**
 * Client-side rich selection state
 */
export interface BulkSelectionState {
  mode: BulkSelectionMode;
  selectedIds: Set<string>;
  excludedIds: Set<string>;
  resource: string;
  querySnapshot: EnterpriseQueryState | null;
  pageIds: string[];
  totalMatchingCount: number;
  visibleCount: number;
  version: number;
}

/**
 * Action Input Field Requirement
 */
export interface BulkActionInputField {
  name: string;
  labelEn: string;
  labelAr: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'number';
  placeholderEn?: string;
  placeholderAr?: string;
  options?: Array<{ value: string; labelEn: string; labelAr: string }>;
  required?: boolean;
  defaultValue?: any;
}

/**
 * Bulk Action Confirmation Contract
 */
export interface BulkActionConfirmation {
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  isDestructive?: boolean;
  requiredTypedPhrase?: string;
}

/**
 * Bulk Action Definition Contract
 */
export interface BulkActionDefinition<TPayload = Record<string, any>> {
  id: string;
  resource: string;
  labelEn: string;
  labelAr: string;
  icon?: string;
  variant?: BulkActionVariant;
  permission?: string;
  supportedSelectionModes?: BulkSelectionMode[];
  requiresConfirmation?: boolean;
  confirmation?: BulkActionConfirmation;
  inputFields?: BulkActionInputField[];
  supportsQuerySelection?: boolean;
  maxExplicitSelection?: number;
  executionPolicy?: BulkExecutionPolicy;
  isRestricted?: boolean;
  restrictionReasonEn?: string;
  restrictionReasonAr?: string;
  handler?: (
    selection: BulkSelectionDescriptor,
    payload?: TPayload
  ) => Promise<BulkOperationResult>;
}

/**
 * Standard Bulk Operation Request Payload
 */
export interface BulkOperationRequest<TPayload = Record<string, any>> {
  operationId: string;
  resource: string;
  actionId: string;
  selection: BulkSelectionDescriptor;
  payload?: TPayload;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

/**
 * Individual Record Error Details for Partial Failures
 */
export interface BulkRecordError {
  recordId?: string;
  code: string;
  messageEn: string;
  messageAr: string;
}

/**
 * Standard Bulk Operation Result Contract
 */
export interface BulkOperationResult {
  operationId: string;
  resource: string;
  actionId: string;
  requestedCount: number;
  processedCount: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
  status: BulkOperationStatus;
  recordErrors?: BulkRecordError[];
  executionTimeMs: number;
  auditLogId?: string;
}
