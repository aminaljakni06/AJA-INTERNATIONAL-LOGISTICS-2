/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data Export & Import Framework Types
 * Phase: Enterprise UI System
 * Module: File-Based Operations, Data Export & Import (STEP 05.18)
 * Version: 1.1 — Integrated with Shared Data Transfer Framework (STEP 05.18.02)
 */

import { BulkSelectionDescriptor } from './bulkFramework';
import {
  ExchangeFormat,
  ExchangeScope,
  DuplicateHandlingStrategy,
  ImportStage,
  ColumnMapping,
  ImportRowValidation as SharedImportRowValidation,
  ImportParseResult,
  EnterpriseExportRequest,
  EnterpriseExportResult,
  EnterpriseImportRequest,
  EnterpriseImportResult,
} from './dataTransferFramework';

export type {
  ExchangeFormat,
  ExchangeScope,
  DuplicateHandlingStrategy,
  ImportStage,
  ColumnMapping,
  ImportParseResult,
};

export interface FieldAllowlistEntry {
  key: string;
  labelEn: string;
  labelAr: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  isDefault: boolean;
  isRequiredForImport?: boolean;
  requiredPermission?: string;
}

export interface ResourceAllowlistSchema {
  resource: string;
  allowedFields: FieldAllowlistEntry[];
  primaryKey: string; // e.g. 'id' or 'trackingNumber'
  uniqueLookupKeys: string[]; // e.g. ['trackingNumber', 'email', 'code']
}

export type ExportRequest = EnterpriseExportRequest;

export type ExportResult = EnterpriseExportResult;

export type ImportRowValidation = SharedImportRowValidation;

export interface ImportValidationResult {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  rowResults: ImportRowValidation[];
}

export type ImportExecutionRequest = EnterpriseImportRequest;

export type ImportExecutionResult = EnterpriseImportResult;
