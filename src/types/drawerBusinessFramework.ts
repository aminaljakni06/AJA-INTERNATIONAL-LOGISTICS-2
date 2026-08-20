/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Business Interaction Types
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Business Interaction Patterns
 * Version: 1.0
 */

import React from 'react';
import { DrawerSize, DrawerPosition, DrawerDensity, DrawerAction } from './drawerFramework';
import { DrawerFilterGroup } from './drawerInteractionFramework';

/**
 * Enterprise Form Drawer Props & Options
 */
export interface EnterpriseFormDrawerProps<T = any> {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'custom';
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon?: React.ReactNode;
  size?: DrawerSize;
  position?: DrawerPosition;
  density?: DrawerDensity;
  initialValues?: Partial<T>;
  isDirty?: boolean;
  isLoading?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  submitLabelEn?: string;
  submitLabelAr?: string;
  cancelLabelEn?: string;
  cancelLabelAr?: string;
  onSubmit: (values?: T) => void | Promise<void>;
  onReset?: () => void;
  children: React.ReactNode;
  isAr?: boolean;
  customActions?: DrawerAction[];
}

/**
 * Enterprise Entity Detail Drawer Props & Options
 */
export interface DetailField {
  id: string;
  labelEn: string;
  labelAr?: string;
  value: React.ReactNode;
  span?: number;
}

export interface EnterpriseDetailDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  entityId?: string;
  entityType?: string;
  statusBadge?: {
    labelEn: string;
    labelAr?: string;
    variant?: 'active' | 'pending' | 'approved' | 'rejected' | 'completed' | 'info' | 'warning' | 'success' | 'danger' | 'draft' | 'cancelled';
  };
  icon?: React.ReactNode;
  size?: DrawerSize;
  position?: DrawerPosition;
  density?: DrawerDensity;
  isLoading?: boolean;
  error?: string | null;
  summaryFields?: DetailField[];
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  readOnly?: boolean;
  children?: React.ReactNode;
  isAr?: boolean;
  customActions?: DrawerAction[];
}

/**
 * Enterprise Filter Drawer Props & Options
 */
export interface EnterpriseFilterDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn?: string;
  titleAr?: string;
  filterGroups: DrawerFilterGroup[];
  draftValues: Record<string, any>;
  appliedValues?: Record<string, any>;
  activeCount?: number;
  onChangeField: (fieldId: string, value: any) => void;
  onApply: () => void;
  onReset: () => void;
  size?: DrawerSize;
  position?: DrawerPosition;
  isAr?: boolean;
}

/**
 * Enterprise Lookup / Selection Drawer Props & Options
 */
export interface LookupItem {
  id: string;
  titleEn: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  code?: string;
  badge?: string;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface EnterpriseLookupDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr?: string;
  items: LookupItem[];
  selectedIds?: string[];
  multiSelect?: boolean;
  isLoading?: boolean;
  searchPlaceholderEn?: string;
  searchPlaceholderAr?: string;
  onSearch?: (query: string) => void;
  onSelect: (selectedItems: LookupItem[]) => void;
  size?: DrawerSize;
  position?: DrawerPosition;
  isAr?: boolean;
}

/**
 * Enterprise Workflow / Action Drawer Props & Options
 */
export interface WorkflowStep {
  id: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isValid?: boolean;
  content: React.ReactNode;
}

export interface EnterpriseWorkflowDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr?: string;
  steps: WorkflowStep[];
  currentStepIndex?: number;
  onStepChange?: (index: number) => void;
  onComplete: () => void | Promise<void>;
  isSubmitting?: boolean;
  size?: DrawerSize;
  position?: DrawerPosition;
  isAr?: boolean;
}
