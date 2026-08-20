/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Empty States Framework Types
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Empty, Zero & Placeholder States
 * Version: 1.0
 */

import React from 'react';

export type EmptyStateType =
  | 'INITIAL'
  | 'NO_DATA'
  | 'NO_RESULTS'
  | 'NO_SEARCH_MATCHES'
  | 'NO_FILTERS_MATCH'
  | 'NO_NOTIFICATIONS'
  | 'NO_MESSAGES'
  | 'NO_DOCUMENTS'
  | 'NO_SHIPMENTS'
  | 'NO_QUOTES'
  | 'NO_CUSTOMERS'
  | 'NO_WAREHOUSES'
  | 'NO_INVENTORY'
  | 'NO_REPORTS'
  | 'NO_ANALYTICS'
  | 'NO_CALENDAR_EVENTS'
  | 'NO_TASKS'
  | 'NO_ACTIVITY'
  | 'NO_AI_HISTORY'
  | 'NO_INTEGRATIONS'
  | 'ZERO_STATE'
  | 'PERMISSION_RESTRICTED'
  | 'OFFLINE'
  | 'ARCHIVE';

export type EmptyStateCategory =
  | 'DATA'
  | 'SEARCH'
  | 'FILTER'
  | 'ZERO'
  | 'PERMISSION'
  | 'OFFLINE'
  | 'AI'
  | 'INTEGRATION'
  | 'ARCHIVE';

export interface EmptyStateCTA {
  labelEn: string;
  labelAr: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ElementType;
  disabled?: boolean;
  loading?: boolean;
}

export interface EmptyStateAnalytics {
  module: string;
  screen: string;
  emptyType: EmptyStateType | string;
  userAction?: string;
  retryCount?: number;
  recoverySuccess?: boolean;
}

export interface EnterpriseEmptyStateProps {
  type?: EmptyStateType | string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon?: React.ElementType;
  illustration?: React.ReactNode;
  primaryAction?: EmptyStateCTA;
  secondaryAction?: EmptyStateCTA;
  helpLink?: {
    labelEn: string;
    labelAr: string;
    href: string;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  contextBadgeEn?: string;
  contextBadgeAr?: string;
  isAr?: boolean;
  className?: string;
  analytics?: EmptyStateAnalytics;
  children?: React.ReactNode;
}
