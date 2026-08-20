import {
  AITransportOptimizationRequest,
  AITransportOptimizationResponse,
  CarbonEmissionMetrics,
  CarrierPerformanceProfile,
  DockScheduleSlot,
  ShipmentConsolidationPlan,
  TransportationKpis,
  TransportationOrder,
  TransportOrderStatus,
} from '../types/transportation';

export type CreateTransportationOrderRequest = Omit<TransportationOrder, 'id' | 'createdAt' | 'updatedAt'>;

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

async function requestPayload<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const response = await fetch(`/api/tms${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Transportation request failed: ${response.status}`));
  }

  return payload as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export const TransportationClient = {
  getOrders: async () => {
    const payload = await requestPayload<{
      orders: TransportationOrder[];
      kpis: TransportationKpis;
    }>('/orders');
    return payload;
  },
  createOrder: async (request: CreateTransportationOrderRequest) => {
    const payload = await post<{ order: TransportationOrder }>('/orders', request);
    return payload.order;
  },
  updateOrderStatus: async (orderId: string, status: TransportOrderStatus, note?: string) => {
    const payload = await patch<{ order: TransportationOrder | null }>(
      `/orders/${encodeURIComponent(orderId)}/status`,
      { status, note }
    );
    return payload.order;
  },
  assignDriverAndVehicle: async (orderId: string, driverName: string, vehiclePlate: string) => {
    const payload = await patch<{ order: TransportationOrder | null }>(
      `/orders/${encodeURIComponent(orderId)}/dispatch`,
      { driverName, vehiclePlate }
    );
    return payload.order;
  },
  getDockScheduleSlots: async () => {
    const payload = await requestPayload<{ slots: DockScheduleSlot[] }>('/docks');
    return payload.slots;
  },
  getCarrierPerformanceProfiles: async () => {
    const payload = await requestPayload<{ carriers: CarrierPerformanceProfile[] }>('/carriers');
    return payload.carriers;
  },
  getCarbonAnalytics: async () => {
    const payload = await requestPayload<{ metrics: CarbonEmissionMetrics }>('/carbon');
    return payload.metrics;
  },
  getConsolidationPlans: async () => {
    const payload = await requestPayload<{ plans: ShipmentConsolidationPlan[] }>('/consolidation');
    return payload.plans;
  },
  optimizeRoute: async (request: AITransportOptimizationRequest) => {
    const payload = await post<{ result: AITransportOptimizationResponse }>('/ai/optimize', request);
    return payload.result;
  },
};
