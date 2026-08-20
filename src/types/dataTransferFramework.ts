/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data Transfer Framework Contracts
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Shared Data Transfer Contracts & Alignment (STEP 05.18.02)
 * Version: 1.0
 */

import { BulkSelectionDescriptor, BulkExecutionPolicy } from './bulkFramework';
import { EnterpriseQueryState } from './queryFramework';
import type { ImportValidationResult } from '../services/importValidationService';

export type { BulkSelectionDescriptor, BulkExecutionPolicy, ImportValidationResult };
export type FieldAllowlistEntry = ExportFieldDefinition;
export type ExportResult = EnterpriseExportResult;
export type ImportExecutionResult = EnterpriseImportResult;

/**
 * Centralized Operation Limits & Guardrails
 */
export const DATA_EXCHANGE_LIMITS = {
  MAX_SYNCHRONOUS_RECORDS: 10000,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_IMPORT_ROWS: 10000,
  MAX_IMPORT_COLUMNS: 100,
  MAX_CELL_CHARACTER_LENGTH: 32767,
} as const;

/**
 * Supported File Exchange Formats
 */
export type ExchangeFormat = 'csv' | 'xlsx' | 'excel' | 'json' | 'pdf';
export type DataExchangeFormat = ExchangeFormat;

/**
 * Export Scope Definition
 */
export type ExchangeScope = 'selected' | 'query' | 'all';

/**
 * Export Processing Status
 */
export type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * Strongly Typed Field Definition for Export Field Allow-Lists & Selection
 */
export interface ExportFieldDefinition {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  exportable: boolean;
  isDefault: boolean;
  isRequiredForImport?: boolean;
  sensitive?: boolean;
  requiredPermission?: string;
  formatter?: string;
}

/**
 * Standard Server-Authoritative Export Request Contract
 * Reuses BulkSelectionDescriptor from STEP 05.17 for selection scope (EXPLICIT, PAGE, QUERY + excludedIds)
 */
export interface EnterpriseExportRequest {
  resource: string;
  format: ExchangeFormat;
  selection?: BulkSelectionDescriptor;
  scope?: ExchangeScope;
  selectedFields?: string[];
  fields?: string[];
  selectedIds?: string[];
  queryState?: EnterpriseQueryState;
  excludedIds?: string[];
  includeHeaders?: boolean;
  fileName?: string;
  locale?: 'en' | 'ar';
  timezone?: string;
}

/**
 * Standard Server-Authoritative Export Result Metadata Contract
 */
export interface EnterpriseExportResult {
  operationId: string;
  exportId: string;
  resource: string;
  format: ExchangeFormat;
  status: ExportStatus;
  recordCount: number;
  content: string; // CSV text, JSON text, or base64 stream
  fileName: string;
  fileSize: string;
  executionTimeMs: number;
  downloadUrl?: string;
  expiresAt?: string;
}

/**
 * File Metadata for Import Operations
 */
export interface ImportFileMetadata {
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  checksum?: string;
}

/**
 * Import Column Definition Contract
 */
export interface ImportColumnDefinition {
  field: string;
  labelEn: string;
  labelAr: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  aliases?: string[];
  allowImport: boolean;
  requiredPermission?: string;
  validationKey?: string;
  duplicateKeyParticipation?: boolean;
  allowedEnumValues?: string[];
  referenceResource?: string;
}

/**
 * Summary Statistics for Import Row Validation
 */
export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  totalErrors: number;
  totalWarnings: number;
  missingRequiredFields?: number;
  invalidTypeFormats?: number;
}

/**
 * Resource Schema Contract for Import Schema Alignment
 */
export interface ImportSchema {
  resource: string;
  templateVersion: string;
  columns: ImportColumnDefinition[];
  requiredFields: string[];
  optionalFields: string[];
  primaryKey: string;
  uniqueLookupKeys: string[];
}

/**
 * Column Mapping Status Types
 */
export type MappingStatus = 'MATCHED' | 'MANUAL' | 'UNMAPPED' | 'INVALID';

/**
 * Import Column Mapping Entry
 */
export interface ImportColumnMappingEntry {
  sourceColumn: string;
  targetField: string;
  mappingStatus: MappingStatus;
  confidence?: number;
}

export type ColumnMapping = Record<string, string>;

/**
 * Import Row Validation Status
 */
export type ImportValidationStatus = 'VALID' | 'WARNING' | 'INVALID' | 'DUPLICATE';

/**
 * Structured Validation Error Contract for Import Rows
 */
export interface ImportValidationError {
  rowNumber: number;
  sourceColumn?: string;
  targetField?: string;
  code: string;
  messageEn: string;
  messageAr: string;
  severity: 'error' | 'warning';
  originalValue?: any;
}

/**
 * Duplicate Match Source Type
 */
export type DuplicateType = 'FILE' | 'SYSTEM';

/**
 * Structured Duplicate Record Match Contract
 */
export interface ImportDuplicateMatch {
  rowNumber: number;
  resource: string;
  duplicateKey: string;
  existingRecordId?: string;
  duplicateType: DuplicateType;
  matchField: string;
  matchValue: string;
  isConflict?: boolean;
  conflictDetailsEn?: string;
  conflictDetailsAr?: string;
}

/**
  * Summary Statistics for Import Duplicate Detection
  */
export interface ImportDuplicateSummary {
  totalRows: number;
  uniqueRows: number;
  fileDuplicateRows: number;
  systemDuplicateRows: number;
  conflictRows: number;
  duplicateGroupsCount: number;
  rowsEligibleForImport: number;
}

/**
  * Duplicate Key Grouping Details
  */
export interface ImportDuplicateGroup {
  duplicateKey: string;
  matchField: string;
  duplicateType: DuplicateType;
  rowNumbers: number[];
}

/**
  * Bounded Result Contract for Duplicate Detection Pipeline Stage
  */
export interface ImportDuplicateDetectionResult {
  resource: string;
  duplicateStrategy: DuplicateHandlingStrategy;
  supportedStrategies: DuplicateHandlingStrategy[];
  summary: ImportDuplicateSummary;
  sampleDuplicateMatches: ImportDuplicateMatch[];
  sampleRows: ImportRowValidation[];
  duplicateGroups: ImportDuplicateGroup[];
}

/**
 * Strategy for Handling Duplicate Records on Import
 */
export type DuplicateHandlingStrategy = 'SKIP' | 'OVERWRITE' | 'CREATE_COPY';

/**
 * Import Pipeline Workflow Stages
 */
export type ImportStage =
  | 'UPLOAD'
  | 'PARSING'
  | 'MAPPING'
  | 'VALIDATION'
  | 'DUPLICATE_CHECK'
  | 'PREVIEW'
  | 'CONFIRMATION'
  | 'EXECUTING'
  | 'SUMMARY';

/**
 * Per-Row Import Validation Details
 */
export interface ImportRowValidation {
  rowIndex: number;
  rawData: Record<string, any>;
  mappedData: Record<string, any>;
  isValid: boolean;
  status: ImportValidationStatus;
  errors: Array<{ field: string; messageEn: string; messageAr: string }>;
  isDuplicate: boolean;
  existingRecordId?: string;
  duplicateType?: DuplicateType;
}

/**
 * Server Parse Result for Uploaded Import Payload
 */
export interface ImportParseResult {
  headers: string[];
  rows: Record<string, any>[];
  totalRowCount: number;
  fileMetadata?: ImportFileMetadata;
}

/**
 * Bounded Import Preview Result Contract
 */
export interface ImportPreviewResult {
  totalRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  duplicateRows: number;
  sampleRows: ImportRowValidation[];
  validationSummary: {
    missingRequiredFields: number;
    invalidTypeFormats: number;
    duplicateMatches: number;
  };
}

/**
 * Import Processing Status Types
 */
export type ImportStatus =
  | 'PARSING'
  | 'VALIDATING'
  | 'READY'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

/**
 * Standard Import Execution Request
 * Reuses BulkExecutionPolicy from STEP 05.17 (ATOMIC vs BEST_EFFORT)
 */
export interface EnterpriseImportRequest {
  resource: string;
  mappedRows: Record<string, any>[];
  duplicateStrategy: DuplicateHandlingStrategy;
  executionPolicy?: BulkExecutionPolicy;
}

/**
 * Standard Import Execution Result
 */
export interface EnterpriseImportResult {
  importId: string;
  operationId: string;
  resource: string;
  totalProcessed: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  warningCount: number;
  status: ImportStatus;
  executionTimeMs: number;
  errors: Array<{ row: number; errorEn: string; errorAr: string; code?: string }>;
}

/**
 * Downloadable Import Error Report Contract
 */
export interface ImportErrorReport {
  operationId: string;
  resource: string;
  failedCount: number;
  format: 'csv' | 'xlsx' | 'json';
  content: string;
  fileName: string;
}

/**
 * Resource Capabilities Contract for Data Transfer
 */
export interface DataTransferResourceCapabilities {
  resource: string;
  supportedExportFormats: ExchangeFormat[];
  supportedImportFormats: ExchangeFormat[];
  maxSynchronousExportRecords: number;
  maxSynchronousImportRows: number;
  exportableFields: ExportFieldDefinition[];
  importableFields: ImportColumnDefinition[];
  primaryKey: string;
  uniqueLookupKeys: string[];
  supportedDuplicateStrategies: DuplicateHandlingStrategy[];
  exportPermission?: string;
  importPermission?: string;
}

/**
 * Standardized Domain Error Codes for Data Transfer Operations
 */
export type DataTransferErrorCode =
  | 'EXPORT_LIMIT_EXCEEDED'
  | 'INVALID_EXPORT_FIELDS'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_SCHEMA'
  | 'INVALID_MAPPING'
  | 'INVALID_QUERY'
  | 'INVALID_SELECTION'
  | 'VALIDATION_FAILED'
  | 'IMPORT_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_RESOURCE'
  | 'TENANT_ISOLATION_VIOLATION'
  | 'RESOURCE_NOT_EXPORTABLE'
  | 'RESOURCE_NOT_IMPORTABLE'
  | 'EMPTY_FILE'
  | 'PARSE_FAILED'
  | 'TOO_MANY_COLUMNS'
  | 'DUPLICATE_HEADERS'
  | 'EMPTY_HEADER'
  | 'INVALID_WORKBOOK'
  | 'CELL_LENGTH_EXCEEDED'
  | 'UNSUPPORTED_IMPORT_FORMAT'
  | 'MALFORMED_FILE_SIGNATURE'
  | 'DUPLICATE_LOOKUP_FAILED'
  | 'DUPLICATE_CONFLICT'
  | 'UNSUPPORTED_DUPLICATE_STRATEGY'
  | 'DUPLICATE_PERMISSION_DENIED'
  | 'STALE_IMPORT_PLAN'
  | 'INVALID_CONFIRMATION_PHRASE'
  | 'PLAN_EXECUTION_BLOCKED'
  | 'IMPORT_ALREADY_EXECUTED'
  | 'IMPORT_EXECUTION_IN_PROGRESS'
  | 'IMPORT_EXECUTION_FAILED'
  | 'IMPORT_PARTIAL_FAILURE'
  | 'ATOMIC_IMPORT_LIMIT_EXCEEDED'
  | 'UPDATE_TARGET_NOT_FOUND'
  | 'UPDATE_TARGET_STALE'
  | 'IMPORT_IDEMPOTENCY_CONFLICT'
  | 'COUNT_INVARIANT_VIOLATION'
  | 'NO_EXECUTABLE_ROWS';

/**
 * Planned Action for an individual row in dry-run execution planning
 */
export type PlannedAction = 'CREATE' | 'UPDATE' | 'SKIP' | 'BLOCKED';

/**
 * Authoritative Pre-Execution Import Execution Plan Contract
 */
export interface ImportExecutionPlan {
  planId: string;
  planFingerprint: string;
  resource: string;
  totalRows: number;
  createCount: number;
  updateCount: number;
  skipCount: number;
  blockedCount: number;
  warningCount: number;
  duplicateCount: number;
  conflictCount: number;
  estimatedWriteOperations: number;
  estimatedBatchCount: number;
  executionPolicy: BulkExecutionPolicy;
  duplicateStrategy: DuplicateHandlingStrategy;
  canExecute: boolean;
  blockers: Array<{ code: string; messageEn: string; messageAr: string }>;
  generatedAt: string;
}

/**
 * Bounded Sample Row in Import Preview Output
 */
export interface ImportPreviewRow {
  rowNumber: number;
  validationStatus: ImportValidationStatus;
  duplicateType?: DuplicateType;
  plannedAction: PlannedAction;
  mappedFieldsSample: Record<string, any>;
  errors: Array<{ field?: string; messageEn: string; messageAr: string }>;
  warnings: Array<{ field?: string; messageEn: string; messageAr: string }>;
  isConflict?: boolean;
}

/**
 * Complete Bounded Response for Import Execution Planning Pipeline Stage
 */
export interface ImportPreviewResponse {
  resource: string;
  executionPlan: ImportExecutionPlan;
  previewSummary: {
    totalRows: number;
    validRows: number;
    warningRows: number;
    invalidRows: number;
    duplicateRows: number;
    fileDuplicateRows: number;
    systemDuplicateRows: number;
    conflictRows: number;
  };
  samplePreviewRows: ImportPreviewRow[];
  confirmationRequirements: {
    requiresTypedConfirmation: boolean;
    confirmationPhrase?: string;
  };
}

/**
 * Domain-Neutral Parsed Import File Contract
 */
export interface ParsedImportFile {
  fileMetadata: ImportFileMetadata;
  format: 'csv' | 'xlsx';
  worksheetName?: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRowCount: number;
  totalColumnCount: number;
  warnings: string[];
  parserMetadata?: {
    executionTimeMs: number;
    parsedAt: string;
    sheetCount?: number;
    encoding?: string;
  };
}

/**
 * Standard Audit Log Payload Metadata for Exports
 */
export interface ExportAuditMetadata {
  resource: string;
  format: ExchangeFormat;
  selectionMode: string;
  recordCount: number;
  fileSize: string;
  executionTimeMs: number;
}

/**
 * Standard Audit Log Payload Metadata for Imports
 */
export interface ImportAuditMetadata {
  resource: string;
  fileMetadata?: ImportFileMetadata;
  totalProcessed: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  duplicateStrategy: DuplicateHandlingStrategy;
  executionPolicy: BulkExecutionPolicy;
  executionTimeMs: number;
}
