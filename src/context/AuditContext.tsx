import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuditRecord,
  ActivityRecord,
  UserSessionRecord,
  EntityHistoryRecord,
  ErrorRecord,
  HealthStatusRecord,
  AuditFilterParams,
  AuditErrorCategory,
} from '../types/audit';
import { AuditEngine, CreateAuditRecordInput } from '../lib/observability/AuditEngine';
import { ActivityTracker, LogActivityInput, StartSessionInput } from '../lib/observability/ActivityTracker';
import { useAuth } from './AuthContext';

interface PerformanceStats {
  avgApiLatencyMs: number;
  avgDbQueryMs: number;
  avgAiLatencyMs: number;
  avgPaymentDurationMs: number;
  p95LatencyMs: number;
  totalTrackedOperations: number;
}

interface AITelemetryStats {
  totalRequests: number;
  totalTokensUsed: number;
  totalEstimatedCostUsd: number;
  avgLatencyMs: number;
}

interface LogErrorInput {
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
}

interface EntityHistoryInput {
  entityType: string;
  entityId: string;
  updatedByUserId: string;
  updatedByUserName?: string;
  changeSummary: string;
  snapshot: Record<string, any>;
}

interface AuditContextType {
  auditLogs: AuditRecord[];
  activityLogs: ActivityRecord[];
  activeSessions: UserSessionRecord[];
  errorLogs: ErrorRecord[];
  healthStatus: HealthStatusRecord[];
  performanceStats: PerformanceStats;
  aiTelemetryStats: AITelemetryStats;
  logAudit: (input: CreateAuditRecordInput) => Promise<AuditRecord>;
  logActivity: (input: LogActivityInput) => ActivityRecord;
  startSession: (input: StartSessionInput) => UserSessionRecord;
  logError: (input: LogErrorInput) => ErrorRecord;
  recordEntityHistory: (input: EntityHistoryInput) => EntityHistoryRecord;
  queryAuditLogs: (params?: AuditFilterParams) => AuditRecord[];
  queryEntityHistory: (entityType: string, entityId: string) => EntityHistoryRecord[];
  refreshHealth: () => Promise<HealthStatusRecord[]>;
  refreshAll: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const EMPTY_PERFORMANCE_STATS: PerformanceStats = {
  avgApiLatencyMs: 0,
  avgDbQueryMs: 0,
  avgAiLatencyMs: 0,
  avgPaymentDurationMs: 0,
  p95LatencyMs: 0,
  totalTrackedOperations: 0,
};

const EMPTY_AI_TELEMETRY_STATS: AITelemetryStats = {
  totalRequests: 0,
  totalTokensUsed: 0,
  totalEstimatedCostUsd: 0,
  avgLatencyMs: 0,
};

async function fetchAuditResource<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || payload?.messageEn || 'Failed to fetch audit data');
  }

  return (payload?.data ?? payload) as T;
}

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityRecord[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSessionRecord[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorRecord[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatusRecord[]>([]);
  const [entityHistory, setEntityHistory] = useState<EntityHistoryRecord[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>(EMPTY_PERFORMANCE_STATS);
  const [aiTelemetryStats, setAiTelemetryStats] = useState<AITelemetryStats>(EMPTY_AI_TELEMETRY_STATS);

  const refreshAll = useCallback(() => {
    if (!token) {
      setAuditLogs([]);
      setActivityLogs([]);
      setActiveSessions([]);
      setErrorLogs([]);
      setPerformanceStats(EMPTY_PERFORMANCE_STATS);
      setAiTelemetryStats(EMPTY_AI_TELEMETRY_STATS);
      return;
    }

    void Promise.all([
      fetchAuditResource<AuditRecord[]>('/api/audit-logs', token).catch(() => []),
      fetchAuditResource<ActivityRecord[]>('/api/audit-logs/activity', token).catch(() => []),
      fetchAuditResource<UserSessionRecord[]>('/api/audit-logs/sessions', token).catch(() => []),
      fetchAuditResource<ErrorRecord[]>('/api/audit-logs/errors', token).catch(() => []),
      fetchAuditResource<{ performance: PerformanceStats; aiTelemetry: AITelemetryStats }>(
        '/api/audit-logs/metrics',
        token
      ).catch(() => ({ performance: EMPTY_PERFORMANCE_STATS, aiTelemetry: EMPTY_AI_TELEMETRY_STATS })),
    ]).then(([audits, activities, sessions, errors, metrics]) => {
      setAuditLogs(audits);
      setActivityLogs(activities);
      setActiveSessions(sessions);
      setErrorLogs(errors);
      setPerformanceStats(metrics.performance);
      setAiTelemetryStats(metrics.aiTelemetry);
    });
  }, [token]);

  const refreshHealth = useCallback(async () => {
    if (!token) {
      setHealthStatus([]);
      return [];
    }

    const health = await fetchAuditResource<HealthStatusRecord[]>('/api/audit-logs/health', token);
    setHealthStatus(health);
    return health;
  }, [token]);

  useEffect(() => {
    refreshAll();
    refreshHealth();

    const interval = setInterval(() => {
      refreshAll();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshAll, refreshHealth]);

  const logAudit = useCallback(
    async (input: CreateAuditRecordInput): Promise<AuditRecord> => {
      const localRecord = AuditEngine.createRecord(input);
      if (!token) {
        setAuditLogs((items) => [localRecord, ...items].slice(0, 500));
        return localRecord;
      }

      const record = await fetchAuditResource<AuditRecord>('/api/audit-logs/log', token, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      refreshAll();
      return record;
    },
    [refreshAll, token]
  );

  const logActivity = useCallback(
    (input: LogActivityInput): ActivityRecord => {
      const record = ActivityTracker.createActivityRecord(input);
      setActivityLogs((items) => [record, ...items].slice(0, 500));
      return record;
    },
    []
  );

  const startSession = useCallback(
    (input: StartSessionInput): UserSessionRecord => {
      const record = ActivityTracker.createSessionRecord(input);
      setActiveSessions((items) => [record, ...items].slice(0, 500));
      return record;
    },
    []
  );

  const logError = useCallback(
    (input: LogErrorInput): ErrorRecord => {
      const record: ErrorRecord = {
        id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        traceId: `trc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toISOString(),
        category: input.category,
        module: input.module,
        message: input.message,
        stack: input.stack,
        code: input.code,
        userId: input.userId,
        companyId: input.companyId || 'aja-holding',
        branchId: input.branchId,
        requestUrl: input.requestUrl,
        requestMethod: input.requestMethod,
        resolved: false,
      };
      setErrorLogs((items) => [record, ...items].slice(0, 200));
      return record;
    },
    []
  );

  const recordEntityHistory = useCallback(
    (input: EntityHistoryInput): EntityHistoryRecord => {
      const version = entityHistory.filter(
        (item) => item.entityType === input.entityType && item.entityId === input.entityId
      ).length + 1;
      const record: EntityHistoryRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        entityType: input.entityType,
        entityId: input.entityId,
        version,
        updatedByUserId: input.updatedByUserId,
        updatedByUserName: input.updatedByUserName || 'System Operator',
        timestamp: new Date().toISOString(),
        changeSummary: input.changeSummary,
        snapshot: input.snapshot,
      };
      setEntityHistory((items) => [record, ...items]);
      return record;
    },
    [entityHistory]
  );

  const queryAuditLogs = useCallback((params?: AuditFilterParams): AuditRecord[] => {
    let filtered = [...auditLogs];
    if (!params) return filtered;
    if (params.module) filtered = filtered.filter((item) => item.module.toLowerCase() === params.module?.toLowerCase());
    if (params.action) filtered = filtered.filter((item) => item.action === params.action);
    if (params.severity) filtered = filtered.filter((item) => item.severity === params.severity);
    if (params.userId) filtered = filtered.filter((item) => item.actorId === params.userId);
    if (params.entityType) filtered = filtered.filter((item) => item.entityType.toLowerCase() === params.entityType?.toLowerCase());
    if (params.entityId) filtered = filtered.filter((item) => item.entityId === params.entityId);
    if (params.searchQuery) {
      const query = params.searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.description.toLowerCase().includes(query) ||
        item.entityId.toLowerCase().includes(query) ||
        item.actorName?.toLowerCase().includes(query) ||
        item.actorEmail?.toLowerCase().includes(query) ||
        item.traceId.toLowerCase().includes(query)
      );
    }
    return params.limit ? filtered.slice(0, params.limit) : filtered;
  }, [auditLogs]);

  const queryEntityHistory = useCallback((entityType: string, entityId: string): EntityHistoryRecord[] => {
    return entityHistory
      .filter((item) => item.entityType.toLowerCase() === entityType.toLowerCase() && item.entityId === entityId)
      .sort((a, b) => b.version - a.version);
  }, [entityHistory]);

  return (
    <AuditContext.Provider
      value={{
        auditLogs,
        activityLogs,
        activeSessions,
        errorLogs,
        healthStatus,
        performanceStats,
        aiTelemetryStats,
        logAudit,
        logActivity,
        startSession,
        logError,
        recordEntityHistory,
        queryAuditLogs,
        queryEntityHistory,
        refreshHealth,
        refreshAll,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export function useAuditContext() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditContext must be used within an AuditProvider');
  }
  return context;
}
