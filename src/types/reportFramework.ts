/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Parameterized Reporting Framework Types
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 * Version: 1.0
 */

import { EnterpriseQueryState } from './queryFramework';
import { AnalyticsMetricId, AnalyticsValueType } from './analyticsFramework';

export type TimeBucketInterval = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

export interface DateRangeFilter {
  start?: string;
  end?: string;
  preset?: string;
}

export type ReportResourceDomain = 'OPERATIONS' | 'EXECUTIVE' | 'FINANCE' | 'SALES' | 'CUSTOMER';

export type ReportVisibility = 'PRIVATE' | 'SHARED' | 'SYSTEM';

export type ReportStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export type ReportOutputFormat = 'PDF' | 'CSV' | 'XLSX';

export type ReportSectionType =
  | 'KPI_SUMMARY'
  | 'GROUPED_TABLE'
  | 'TIME_SERIES'
  | 'DATA_TABLE'
  | 'NARRATIVE'
  | 'FOOTER';

export type ReportParameterType =
  | 'DATE_RANGE'
  | 'TEXT'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'BOOLEAN';

export interface ReportParameterDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  type: ReportParameterType;
  targetFilterKey: string;
  required?: boolean;
  defaultValue?: any;
  allowedValues?: { value: string; labelEn: string; labelAr: string }[];
}

export interface ReportSectionConfig {
  id: string;
  type: ReportSectionType;
  titleEn: string;
  titleAr: string;
  metricIds?: AnalyticsMetricId[];
  dimension?: string;
  timeBucket?: TimeBucketInterval;
  contentEn?: string;
  contentAr?: string;
}

export interface ReportDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  resource: string;
  domain: ReportResourceDomain;
  metricIds: AnalyticsMetricId[];
  dimensions?: string[];
  timeSeries?: {
    enabled: boolean;
    timeBucket: TimeBucketInterval;
    timeField?: string;
  };
  defaultQueryState?: EnterpriseQueryState;
  parameters: ReportParameterDefinition[];
  sections: ReportSectionConfig[];
  outputFormats: ReportOutputFormat[];
  requiredPermissions: string[];
  visibility: ReportVisibility;
  status: ReportStatus;
  savedViewId?: string;
  createdBy: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDefinitionPayload {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  resource: string;
  domain: ReportResourceDomain;
  metricIds: AnalyticsMetricId[];
  dimensions?: string[];
  timeSeries?: {
    enabled: boolean;
    timeBucket: TimeBucketInterval;
    timeField?: string;
  };
  parameters?: ReportParameterDefinition[];
  sections?: ReportSectionConfig[];
  outputFormats?: ReportOutputFormat[];
  requiredPermissions?: string[];
  visibility?: ReportVisibility;
  savedViewId?: string;
}

export interface ReportMetricValueResult {
  metricId: AnalyticsMetricId;
  labelEn: string;
  labelAr: string;
  value: number | null;
  formattedValue: string;
  valueType: AnalyticsValueType;
  unit?: string;
  unitAr?: string;
  precision?: number;
}

export interface ReportGroupedResult {
  dimension: string;
  groups: {
    key: string;
    labelEn: string;
    labelAr: string;
    value: number | null;
    count?: number;
  }[];
}

export interface ReportTimeSeriesPoint {
  timestamp: string;
  label: string;
  value: number | null;
  count?: number;
}

export interface ReportTimeSeriesResult {
  metricId: AnalyticsMetricId;
  timeBucket: TimeBucketInterval;
  timeField: string;
  points: ReportTimeSeriesPoint[];
}

export interface ReportExecutionResult {
  executionId: string;
  reportDefinitionId: string;
  reportTitleEn: string;
  reportTitleAr: string;
  generatedAt: string;
  queryScope: {
    tenantId?: string;
    companyId?: string;
    branchId?: string;
    customerId?: string;
    dateRange?: DateRangeFilter;
    filters: Record<string, any>;
    timezone: string;
  };
  metrics: Record<AnalyticsMetricId, ReportMetricValueResult>;
  groupedResults: Record<string, ReportGroupedResult>;
  timeSeriesResults: Record<AnalyticsMetricId, ReportTimeSeriesResult>;
  completeness: 'COMPLETE' | 'PARTIAL' | 'EMPTY';
  reportingCurrency: string;
  warnings: string[];
  executionTimeMs: number;
}

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface ScheduledReportDefinition {
  id: string;
  reportDefinitionId: string;
  nameEn: string;
  nameAr: string;
  frequency: ScheduleFrequency;
  dayOfWeek?: number; // 0-6 (Sun-Sat) for WEEKLY
  dayOfMonth?: number; // 1-31 for MONTHLY
  timeOfDay: string; // "HH:MM" 24hr format
  timezone: string;
  parameterValues: Record<string, any>;
  deliveryFormat: ReportOutputFormat;
  deliveryTarget: 'IN_APP' | 'EMAIL';
  recipients: string[];
  active: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  lastStatus?: 'SUCCESS' | 'FAILED' | 'DEFERRED';
  createdBy: string;
  tenantId?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduledReportPayload {
  reportDefinitionId: string;
  nameEn: string;
  nameAr: string;
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay: string;
  timezone?: string;
  parameterValues?: Record<string, any>;
  deliveryFormat?: ReportOutputFormat;
  deliveryTarget?: 'IN_APP' | 'EMAIL';
  recipients: string[];
  active?: boolean;
}
