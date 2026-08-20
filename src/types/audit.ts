export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string;
  timestamp: string;
}

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'ASSIGN'
  | 'IMPORT'
  | 'EXPORT'
  | 'PRINT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_CHANGE'
  | 'CONFIG_CHANGE'
  | 'WORKFLOW_CHANGE'
  | 'API_ACCESS'
  | 'AI_REQUEST'
  | 'PAYMENT_EVENT'
  | string;

export type AuditSeverity = 'LOW' | 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type ActivityCategory =
  | 'USER'
  | 'MODULE'
  | 'BUSINESS'
  | 'BACKGROUND_JOB'
  | 'WORKFLOW'
  | 'NOTIFICATION'
  | 'SYSTEM';

export type AuditErrorCategory =
  | 'UNHANDLED'
  | 'API_FAILURE'
  | 'REPOSITORY_ERROR'
  | 'VALIDATION'
  | 'WORKFLOW_ERROR'
  | 'AUTH'
  | 'INTEGRATION';

export type HealthComponent =
  | 'APP'
  | 'DATABASE'
  | 'FIRESTORE'
  | 'API'
  | 'AI_SERVICE'
  | 'PAYMENT_GATEWAY'
  | 'NOTIFICATION_SERVICE'
  | 'STORAGE';

export interface AuditRecord {
  id: string;
  traceId: string;
  correlationId?: string;
  timestamp: string;
  actorId: string;
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  action: AuditActionType;
  severity: AuditSeverity;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  previousState?: Record<string, any> | null;
  newState?: Record<string, any> | null;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  checksum: string; // Tamper detection hash
  isTamperVerified?: boolean;
}

export interface ActivityRecord {
  id: string;
  timestamp: string;
  category: ActivityCategory;
  module: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  companyId?: string;
  branchId?: string;
  title: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  companyId?: string;
  branchId?: string;
  loginTimestamp: string;
  logoutTimestamp?: string;
  durationSeconds?: number;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  timezone?: string;
  active: boolean;
}

export interface EntityHistoryRecord {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  updatedByUserId: string;
  updatedByUserName?: string;
  timestamp: string;
  changeSummary: string;
  snapshot: Record<string, any>;
}

export interface ErrorRecord {
  id: string;
  traceId: string;
  timestamp: string;
  category: AuditErrorCategory;
  module: string;
  message: string;
  stack?: string;
  code?: string;
  userId?: string;
  companyId?: string;
  branchId?: string;
  requestUrl?: string;
  requestMethod?: string;
  resolved: boolean;
}

export interface PerformanceMetricRecord {
  id: string;
  timestamp: string;
  metricName: string; // e.g., 'API_LATENCY', 'DB_QUERY_TIME', 'AI_RESPONSE_TIME', 'PAYMENT_LATENCY'
  module: string;
  durationMs: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface HealthStatusRecord {
  component: HealthComponent;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs?: number;
  message?: string;
  lastChecked: string;
}

export interface AITelemetryHookData {
  id: string;
  timestamp: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  durationMs: number;
  success: boolean;
  userId?: string;
  feature?: string;
}

export interface AuditFilterParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  companyId?: string;
  branchId?: string;
  module?: string;
  action?: AuditActionType;
  severity?: AuditSeverity;
  entityType?: string;
  entityId?: string;
  searchQuery?: string;
  limit?: number;
}
