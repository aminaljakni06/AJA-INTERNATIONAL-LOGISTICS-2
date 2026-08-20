import {
  AIWarehouseInsight,
  AIWarehouseSpaceResult,
  StorageRule,
  WarehouseAisle,
  WarehouseBin,
  WarehouseBuilding,
  WarehouseCapacityKPIs,
  WarehouseFloor,
  WarehouseLocation,
  WarehouseRack,
  WarehouseShelf,
  WarehouseShift,
  WarehouseZone,
} from '../types/warehouse';

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

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

async function requestPayload<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const response = await fetch(`/api/warehouse${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Warehouse request failed: ${response.status}`));
  }

  return payload as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface WarehouseSpaceOptimizeRequest {
  warehouseId: string;
  skuCode: string;
  itemCategoryAr: string;
  isTemperatureSensitive: boolean;
  palletCount?: number;
}

export const WarehouseClient = {
  getWarehouses: async () => {
    const payload = await requestPayload<{ warehouses: WarehouseLocation[] }>('/registry');
    return payload.warehouses;
  },
  getWarehouseZones: async (warehouseId?: string) => {
    const payload = await requestPayload<{ zones: WarehouseZone[] }>(withQuery('/zones', { warehouseId }));
    return payload.zones;
  },
  getWarehouseBins: async (zoneId?: string) => {
    const payload = await requestPayload<{ bins: WarehouseBin[] }>(withQuery('/bins', { zoneId }));
    return payload.bins;
  },
  getWarehouseCapacityKPIs: async () => {
    const payload = await requestPayload<{ kpis: WarehouseCapacityKPIs }>('/kpis');
    return payload.kpis;
  },
  getWarehouseBuildings: async (warehouseId?: string) => {
    const payload = await requestPayload<{ buildings: WarehouseBuilding[] }>(
      withQuery('/buildings', { warehouseId })
    );
    return payload.buildings;
  },
  getWarehouseFloors: async (buildingId?: string) => {
    const payload = await requestPayload<{ floors: WarehouseFloor[] }>(withQuery('/floors', { buildingId }));
    return payload.floors;
  },
  getWarehouseAisles: async (zoneId?: string) => {
    const payload = await requestPayload<{ aisles: WarehouseAisle[] }>(withQuery('/aisles', { zoneId }));
    return payload.aisles;
  },
  getWarehouseRacks: async (aisleId?: string) => {
    const payload = await requestPayload<{ racks: WarehouseRack[] }>(withQuery('/racks', { aisleId }));
    return payload.racks;
  },
  getWarehouseShelves: async (rackId?: string) => {
    const payload = await requestPayload<{ shelves: WarehouseShelf[] }>(withQuery('/shelves', { rackId }));
    return payload.shelves;
  },
  getStorageRules: async (warehouseId?: string) => {
    const payload = await requestPayload<{ rules: StorageRule[] }>(
      withQuery('/storage-rules', { warehouseId })
    );
    return payload.rules;
  },
  getWarehouseShifts: async (warehouseId?: string) => {
    const payload = await requestPayload<{ shifts: WarehouseShift[] }>(withQuery('/shifts', { warehouseId }));
    return payload.shifts;
  },
  getAIWarehouseInsights: async (warehouseId?: string) => {
    const payload = await requestPayload<{ insights: AIWarehouseInsight[] }>(
      withQuery('/ai/insights', { warehouseId })
    );
    return payload.insights;
  },
  optimizeSpace: async (request: WarehouseSpaceOptimizeRequest) => {
    const payload = await post<{ result: AIWarehouseSpaceResult }>('/ai/space-optimize', request);
    return payload.result;
  },
};
