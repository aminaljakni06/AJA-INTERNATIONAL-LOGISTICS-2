import {
  CreateReportDefinitionPayload,
  CreateScheduledReportPayload,
  ReportDefinition,
  ReportExecutionResult,
  ScheduledReportDefinition,
} from '../types/reportFramework';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-User-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh',
  };
};

const extractErrorMessage = (payload: any, fallback: string) => {
  if (typeof payload?.error === 'string') return payload.error;
  if (typeof payload?.error?.message === 'string') return payload.error.message;
  return fallback;
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/reports${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(extractErrorMessage(payload, 'Reports request failed'));
  }

  return payload.data as T;
};

export const ReportsClient = {
  async getReportDefinitions(): Promise<ReportDefinition[]> {
    return requestPayload<ReportDefinition[]>('/definitions');
  },

  async getScheduledReports(): Promise<ScheduledReportDefinition[]> {
    return requestPayload<ScheduledReportDefinition[]>('/schedules');
  },

  async createReportDefinition(payload: CreateReportDefinitionPayload): Promise<ReportDefinition> {
    return requestPayload<ReportDefinition>('/definitions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async executeReport(reportDefinition: ReportDefinition): Promise<ReportExecutionResult> {
    return requestPayload<ReportExecutionResult>('/execute', {
      method: 'POST',
      body: JSON.stringify({ reportDefinition }),
    });
  },

  async createScheduledReport(payload: CreateScheduledReportPayload): Promise<ScheduledReportDefinition> {
    return requestPayload<ScheduledReportDefinition>('/schedules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
