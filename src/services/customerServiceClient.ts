import {
  CaseNote,
  CaseStatus,
  DepartmentQueue,
  KnowledgeArticle,
  ServiceCase,
  ServiceMetricsSummary,
} from '../types/customerService';

type ServiceCasePayload = Omit<ServiceCase, 'id' | 'createdAt' | 'updatedAt'>;
type CaseNotePayload = Omit<CaseNote, 'id' | 'createdAt'>;
type KnowledgeArticlePayload = Omit<KnowledgeArticle, 'id' | 'updatedAt'>;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aja_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: string | { message?: string } }).error;
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
  }

  return fallback;
}

async function request<T>(path: string, dataKey: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const response = await fetch(`/api/crm/service${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Customer service request failed: ${response.status}`));
  }

  return payload[dataKey] as T;
}

async function requestQueuesAndMetrics(): Promise<{ queues: DepartmentQueue[]; metrics: ServiceMetricsSummary }> {
  const headers = getAuthHeaders();
  const response = await fetch('/api/crm/service/queues', { headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Customer service queue request failed: ${response.status}`));
  }

  return {
    queues: payload.queues as DepartmentQueue[],
    metrics: payload.metrics as ServiceMetricsSummary,
  };
}

function toQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

function post<T>(path: string, dataKey: string, body: unknown): Promise<T> {
  return request<T>(path, dataKey, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function patch<T>(path: string, dataKey: string, body: unknown): Promise<T> {
  return request<T>(path, dataKey, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export const CustomerServiceClient = {
  getServiceCases: (customerId?: string) =>
    request<ServiceCase[]>(`/cases${toQuery({ customerId })}`, 'cases'),
  createServiceCase: (serviceCase: ServiceCasePayload) =>
    post<ServiceCase>('/cases', 'case', serviceCase),
  addCaseNote: (caseId: string, note: CaseNotePayload) =>
    post<ServiceCase | null>(`/cases/${encodeURIComponent(caseId)}/notes`, 'case', note),
  updateCaseStatus: (caseId: string, status: CaseStatus, escalationLevel?: number) =>
    patch<ServiceCase | null>(`/cases/${encodeURIComponent(caseId)}/status`, 'case', {
      status,
      escalationLevel,
    }),
  getKnowledgeArticles: () =>
    request<KnowledgeArticle[]>('/knowledge', 'articles'),
  createKnowledgeArticle: (article: KnowledgeArticlePayload) =>
    post<KnowledgeArticle>('/knowledge', 'article', article),
  getQueuesAndMetrics: requestQueuesAndMetrics,
};
