/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Data View & Personalization Types
 * Phase: Enterprise UI System
 * Module: Data Views, Saved Views & Personalization (STEP 05.16)
 * Version: 1.0
 */

import { EnterpriseQueryState, SortRule } from './queryFramework';
import { TableDensity } from './tableFramework';
import { DataTransferResourceCapabilities } from './dataTransferFramework';

export type EnterpriseDataViewOwnerType = 'SYSTEM' | 'USER' | 'ORGANIZATION';

export type EnterpriseDataViewVisibility = 'PRIVATE' | 'SHARED' | 'ORGANIZATION' | 'SYSTEM';

export interface TablePersonalizationConfig {
  visibleColumns?: string[];
  columnOrder?: string[];
  columnWidths?: Record<string, string>;
  density?: TableDensity;
}

export interface PersistedAnalyticsConfig {
  selectedMetricIds?: string[];
  dimension?: string;
  interval?: 'DAY' | 'WEEK' | 'MONTH';
  resource?: string;
  visibleKpiIds?: string[];
}

export interface PersistedQueryConfig {
  search?: string;
  filters?: Record<string, any>;
  sort?: SortRule | null;
  pageSize?: number;
  analytics?: PersistedAnalyticsConfig;
}

export interface EnterpriseDataView {
  id: string;
  schemaVersion: number;
  resource: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  ownerType: EnterpriseDataViewOwnerType;
  ownerId?: string;
  visibility: EnterpriseDataViewVisibility;
  isDefault: boolean;
  isSystem?: boolean;
  query: PersistedQueryConfig;
  table: TablePersonalizationConfig;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateDataViewPayload {
  resource: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  visibility?: EnterpriseDataViewVisibility;
  isDefault?: boolean;
  query?: PersistedQueryConfig;
  table?: TablePersonalizationConfig;
}

export interface UpdateDataViewPayload {
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  visibility?: EnterpriseDataViewVisibility;
  isDefault?: boolean;
  query?: PersistedQueryConfig;
  table?: TablePersonalizationConfig;
}

export interface DataViewResourceColumn {
  id: string;
  labelEn: string;
  labelAr: string;
  required?: boolean;
  defaultVisible?: boolean;
}

export interface DataViewResourceAdapter {
  resource: string;
  labelEn: string;
  labelAr: string;
  allowedFilters: string[];
  allowedSortFields: string[];
  availableColumns: DataViewResourceColumn[];
  requiredColumns: string[];
  defaultColumns: string[];
  defaultDensity: TableDensity;
  defaultPageSize: number;
  systemDefaultView: EnterpriseDataView;
  dataTransferCapabilities?: DataTransferResourceCapabilities;
}
