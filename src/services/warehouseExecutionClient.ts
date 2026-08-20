import {
  AIWESOptimizationResult,
  DynamicSlottingProfile,
  PutawayRule,
  ReplenishmentTask,
  WarehouseException,
  WarehouseResource,
  WarehouseTask,
  WESPerformanceKPIs,
} from '../types/warehouseExecution';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/wes${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Warehouse execution request failed');
  }

  return payload as T;
};

export const WarehouseExecutionClient = {
  async getPutawayRules(): Promise<PutawayRule[]> {
    const payload = await requestPayload<{ rules: PutawayRule[] }>('/putaway-rules');
    return payload.rules;
  },

  async getSlottingProfiles(): Promise<DynamicSlottingProfile[]> {
    const payload = await requestPayload<{ profiles: DynamicSlottingProfile[] }>('/slotting');
    return payload.profiles;
  },

  async getWarehouseTasks(): Promise<WarehouseTask[]> {
    const payload = await requestPayload<{ tasks: WarehouseTask[] }>('/tasks');
    return payload.tasks;
  },

  async getWarehouseResources(): Promise<WarehouseResource[]> {
    const payload = await requestPayload<{ resources: WarehouseResource[] }>('/resources');
    return payload.resources;
  },

  async getReplenishmentTasks(): Promise<ReplenishmentTask[]> {
    const payload = await requestPayload<{ replenishments: ReplenishmentTask[] }>('/replenishment');
    return payload.replenishments;
  },

  async getWarehouseExceptions(): Promise<WarehouseException[]> {
    const payload = await requestPayload<{ exceptions: WarehouseException[] }>('/exceptions');
    return payload.exceptions;
  },

  async getWESPerformanceKPIs(): Promise<WESPerformanceKPIs> {
    const payload = await requestPayload<{ kpis: WESPerformanceKPIs }>('/analytics');
    return payload.kpis;
  },

  async optimizeExecution(request: {
    warehouseId: string;
    skuCode: string;
    itemCategoryAr: string;
    isTemperatureSensitive: boolean;
    weightKg: number;
    volumeCbm: number;
  }): Promise<AIWESOptimizationResult> {
    const payload = await requestPayload<{ result: AIWESOptimizationResult }>('/ai/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return payload.result;
  },
};
