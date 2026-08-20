/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Interaction System Types
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Interaction System
 * Version: 1.0
 */

import React from 'react';
import { DrawerDensity } from './drawerFramework';

/**
 * Drawer Tabs Configuration & Contracts
 */
export interface DrawerTab {
  id: string;
  labelEn: string;
  labelAr?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  visible?: boolean;
  lazy?: boolean;
  content?: React.ReactNode;
}

export interface DrawerTabsProps {
  tabs: DrawerTab[];
  activeTabId?: string;
  onChangeTab?: (id: string) => void;
  isAr?: boolean;
  density?: DrawerDensity;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

/**
 * Drawer Contextual Breadcrumb Navigation
 */
export interface DrawerBreadcrumbItem {
  id: string;
  labelEn: string;
  labelAr?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface DrawerBreadcrumbsProps {
  items: DrawerBreadcrumbItem[];
  isAr?: boolean;
  className?: string;
}

/**
 * Drawer Internal Search Bar Contract
 */
export interface DrawerSearchProps {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  placeholderEn?: string;
  placeholderAr?: string;
  isLoading?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
  isAr?: boolean;
  className?: string;
}

/**
 * Drawer Filter Fields & Grouping Contracts
 */
export type FilterFieldType =
  | 'text'
  | 'select'
  | 'multi-select'
  | 'date-range'
  | 'number-range'
  | 'boolean';

export interface FilterOption {
  value: string;
  labelEn: string;
  labelAr?: string;
}

export interface DrawerFilterField {
  id: string;
  labelEn: string;
  labelAr?: string;
  type: FilterFieldType;
  options?: FilterOption[];
  value?: any;
  placeholderEn?: string;
  placeholderAr?: string;
  disabled?: boolean;
}

export interface DrawerFilterGroup {
  id: string;
  titleEn: string;
  titleAr?: string;
  fields: DrawerFilterField[];
}

export interface DrawerFiltersProps {
  groups: DrawerFilterGroup[];
  draftValues: Record<string, any>;
  appliedValues?: Record<string, any>;
  onChangeField: (fieldId: string, value: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isAr?: boolean;
  className?: string;
  activeCount?: number;
}

/**
 * Related Records List / Cards Contract
 */
export interface DrawerRelatedRecordAction {
  id: string;
  labelEn: string;
  labelAr?: string;
  icon?: React.ReactNode;
  onClick: (recordId: string) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export interface DrawerRelatedRecord {
  id: string;
  titleEn: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  statusBadge?: {
    labelEn: string;
    labelAr?: string;
    variant?: 'active' | 'pending' | 'approved' | 'rejected' | 'completed' | 'info' | 'warning';
  };
  icon?: React.ReactNode;
  metadata?: Record<string, string>;
  onClick?: (id: string) => void;
  actions?: DrawerRelatedRecordAction[];
}

export interface DrawerRelatedRecordsProps {
  titleEn?: string;
  titleAr?: string;
  records: DrawerRelatedRecord[];
  isLoading?: boolean;
  emptyTitleEn?: string;
  emptyTitleAr?: string;
  onAddRecord?: () => void;
  addLabelEn?: string;
  addLabelAr?: string;
  isAr?: boolean;
  className?: string;
}

/**
 * Drawer Timeline & Milestone Audit Component Contract
 */
export type TimelineEventStatus = 'completed' | 'in_progress' | 'pending' | 'failed' | 'info';

export interface DrawerTimelineEvent {
  id: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  timestamp: string | number;
  actor?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  status?: TimelineEventStatus;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export interface DrawerTimelineProps {
  titleEn?: string;
  titleAr?: string;
  events: DrawerTimelineEvent[];
  isLoading?: boolean;
  isAr?: boolean;
  className?: string;
}

/**
 * Sticky / Collapsible Section Wrapper Contract
 */
export interface DrawerSectionProps {
  id?: string;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  stickyHeader?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  isAr?: boolean;
  className?: string;
  density?: DrawerDensity;
}
