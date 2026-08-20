import { CommercialContract, SalesOrder } from '../types/contract';

type ContractPayload = Omit<CommercialContract, 'id' | 'createdAt' | 'updatedAt'>;
type SalesOrderPayload = Omit<SalesOrder, 'id' | 'createdAt'>;

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

  const response = await fetch(`/api/crm/contracts${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Contract request failed: ${response.status}`));
  }

  return payload[dataKey] as T;
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

export const ContractClient = {
  getContracts: (customerId?: string) =>
    request<CommercialContract[]>(toQuery({ customerId }), 'contracts'),
  createContract: (contract: ContractPayload) =>
    post<CommercialContract>('', 'contract', contract),
  getSalesOrders: (customerId?: string) =>
    request<SalesOrder[]>(`/sales-orders${toQuery({ customerId })}`, 'salesOrders'),
  createSalesOrder: (order: SalesOrderPayload) =>
    post<SalesOrder>('/sales-orders', 'salesOrder', order),
};
