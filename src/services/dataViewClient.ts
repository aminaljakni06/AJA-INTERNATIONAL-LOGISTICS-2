import {
  CreateDataViewPayload,
  EnterpriseDataView,
  UpdateDataViewPayload,
} from '../types/dataViewFramework';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string | { message?: string };
}

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const response = await fetch(`/api/data-views${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Data view request failed: ${response.status}`));
  }

  return payload.data;
}

function toQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export const DataViewClient = {
  listViews: (resource: string) =>
    request<EnterpriseDataView[]>(toQuery({ resource })),
  getViewById: (id: string, resource?: string) =>
    request<EnterpriseDataView | null>(`/${encodeURIComponent(id)}${toQuery({ resource })}`),
  createView: (payload: CreateDataViewPayload, _userId?: string, _userName?: string) =>
    post<EnterpriseDataView>('', payload),
  updateView: (id: string, payload: UpdateDataViewPayload, _userId?: string, _userName?: string) =>
    patch<EnterpriseDataView>(`/${encodeURIComponent(id)}`, payload),
  deleteView: (id: string, _userId?: string, resource?: string) =>
    request<{ deleted: boolean; id: string }>(`/${encodeURIComponent(id)}${toQuery({ resource })}`, {
      method: 'DELETE',
    }),
  setDefaultView: (viewId: string, _userId: string, resource: string) =>
    post<{ defaultSet: boolean; id: string }>(`/${encodeURIComponent(viewId)}/default`, { resource }),
};
