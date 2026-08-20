/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Form, Entity & Multi-Step Wizard Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import React from 'react';
import { DialogSize, DialogMetadata, DialogStatusBadge } from './dialogFramework';

/**
 * Entity Dialog Operational Modes
 */
export type EntityDialogMode =
  | 'CREATE'
  | 'EDIT'
  | 'VIEW'
  | 'DETAILS'
  | 'QUICK_VIEW'
  | 'PREVIEW'
  | 'CLONE'
  | 'DUPLICATE'
  | 'IMPORT'
  | 'EXPORT'
  | 'BULK_UPDATE'
  | 'WORKFLOW'
  | 'AUDIT'
  | 'HISTORY';

/**
 * Single Step Definition in a Multi-Step Wizard
 */
export interface WizardStep<T = any> {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  icon?: React.ReactNode;
  isCompleted?: boolean;
  isOptional?: boolean;
  isHidden?: boolean;
  isValid?: boolean;
  canJumpTo?: boolean;
  component?: React.ComponentType<{
    data: T;
    onChange: (partial: Partial<T>) => void;
    setValid: (isValid: boolean) => void;
    isAr?: boolean;
  }>;
}

/**
 * Configuration Options for Multi-Step Wizards
 */
export interface WizardConfiguration {
  mode?: 'linear' | 'non-linear' | 'conditional' | 'branching';
  allowSkip?: boolean;
  autoSaveDraft?: boolean;
  autoSaveIntervalMs?: number;
  allowResume?: boolean;
  showCompletionSummary?: boolean;
  enableStepJump?: boolean;
  preventCloseIfDirty?: boolean;
  size?: DialogSize;
}

/**
 * Internal Active State of a Wizard
 */
export interface WizardState<T = any> {
  activeStepIndex: number;
  completedStepIds: string[];
  stepData: T;
  isSubmitting: boolean;
  isDraftSaved: boolean;
  lastSavedAt?: number;
  validationErrors: Record<string, string[]>;
}

/**
 * Related Records Count for Entity Dialog Header Tabs
 */
export interface EntityRelatedCounts {
  shipmentsCount?: number;
  documentsCount?: number;
  invoicesCount?: number;
  activitiesCount?: number;
  auditLogsCount?: number;
}

/**
 * Enterprise Entity Summary Metadata
 */
export interface EntityMetadata {
  entityType: string;
  entityId: string;
  recordTitle: string;
  recordCode?: string;
  avatarUrl?: string;
  statusBadge?: DialogStatusBadge;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  relatedCounts?: EntityRelatedCounts;
  auditClassification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

/**
 * Entity Record Sequential Navigation State
 */
export interface EntityRecordNavigation {
  currentRecordIndex: number;
  totalRecords: number;
  hasNextRecord: boolean;
  hasPreviousRecord: boolean;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
}

/**
 * Form Draft State Model
 */
export interface DraftState<T = any> {
  draftId: string;
  entityType: string;
  entityId?: string;
  data: T;
  activeStepIndex?: number;
  userId: string;
  lastSavedAt: number;
}
