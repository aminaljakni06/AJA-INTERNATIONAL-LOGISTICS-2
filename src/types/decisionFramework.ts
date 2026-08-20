/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Confirmation, Alert & Decision Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import React from 'react';

/**
 * Standardized Risk Levels across business actions
 */
export type RiskLevel =
  | 'LOW'
  | 'NORMAL'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | 'EMERGENCY'
  | 'SECURITY'
  | 'COMPLIANCE'
  | 'AUDIT';

/**
 * Dialog Severity Categories
 */
export type DialogSeverity = 'info' | 'warning' | 'error' | 'success' | 'danger' | 'critical';

/**
 * Business Operation Action Categories
 */
export type BusinessActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'DUPLICATE'
  | 'CLONE'
  | 'SUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'RETURN'
  | 'CANCEL'
  | 'ASSIGN'
  | 'REASSIGN'
  | 'TRANSFER'
  | 'MERGE'
  | 'SPLIT'
  | 'IMPORT'
  | 'EXPORT'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'API_KEY_ROTATION'
  | 'AI_EXECUTION'
  | 'SYNCHRONIZATION'
  | 'BULK_OPERATION';

/**
 * Standardized Pre-configured Decision Reasons
 */
export interface DecisionReasonOption {
  code: string;
  labelEn: string;
  labelAr: string;
  requiresComment?: boolean;
}

/**
 * Captured Audit Metadata
 */
export interface AuditMetadata {
  userId?: string;
  userRole?: string;
  userEmail?: string;
  timestamp: number;
  action: BusinessActionType | string;
  moduleName: string;
  recordId?: string;
  riskLevel: RiskLevel;
  correlationId: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  tenantId?: string;
}

/**
 * Summary Card Data for Business Object Context
 */
export interface BusinessObjectSummary {
  recordId: string;
  title: string;
  subtitle?: string;
  statusLabel?: string;
  statusVariant?: 'info' | 'warning' | 'success' | 'danger' | 'neutral';
  attributes?: { labelEn: string; labelAr: string; value: string }[];
  amount?: string;
  currency?: string;
}

/**
 * Decision & Confirmation Request Descriptor
 */
export interface DecisionRequest {
  id?: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  actionType: BusinessActionType;
  riskLevel?: RiskLevel;
  severity?: DialogSeverity;
  moduleName: string;
  recordSummary?: BusinessObjectSummary;
  impactDescriptionEn?: string;
  impactDescriptionAr?: string;
  warningTextEn?: string;
  warningTextAr?: string;

  // Decision Input Options
  predefinedReasons?: DecisionReasonOption[];
  requireReason?: boolean;
  requireComment?: boolean;
  minCommentLength?: number;
  maxCommentLength?: number;

  // Safety Controls
  requireExplicitPhrase?: string; // Phrase user must type
  requireConfirmationCheckbox?: boolean;
  checkboxLabelEn?: string;
  checkboxLabelAr?: string;
  holdToConfirmMs?: number; // Press and hold button duration (e.g. 2000ms)
  countdownSeconds?: number; // Delayed activation button timer

  // Multiple Choice Decisions
  decisionOptions?: {
    id: string;
    labelEn: string;
    labelAr: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    descriptionEn?: string;
    descriptionAr?: string;
  }[];

  // Permissions & Guards
  requiredPermission?: string;
  requiredRole?: string;

  isAr?: boolean;
  onDecision?: (result: DecisionResult) => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Captured Result from a Decision/Confirmation
 */
export interface DecisionResult {
  requestId: string;
  decisionId: string; // Chosen option ID, 'confirm', 'approve', 'reject', etc.
  confirmed: boolean;
  selectedReasonCode?: string;
  comment?: string;
  typedPhrase?: string;
  auditMetadata: AuditMetadata;
  durationMs: number;
}

/**
 * Protected Action Guard Definition
 */
export interface ProtectedActionConfig {
  actionId: string;
  actionNameEn: string;
  actionNameAr: string;
  riskLevel: RiskLevel;
  requiredPermission?: string;
  requireDoubleConfirmation?: boolean;
  requireReason?: boolean;
  requirePhrase?: string;
}
