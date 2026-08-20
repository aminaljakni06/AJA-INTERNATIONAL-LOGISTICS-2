import {
  AIInventoryOptimizationResult,
  ATPMetrics,
  InventoryAdjustment,
  InventoryAllocation,
  InventoryHold,
  InventoryReservation,
  InventoryTimelineEvent,
  StockMovement,
  StockTransfer,
} from '../types/inventoryOperations';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/inventory-ops${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Inventory operations request failed');
  }

  return payload as T;
};

export const InventoryOperationsClient = {
  async getStockMovements(): Promise<StockMovement[]> {
    const payload = await requestPayload<{ movements: StockMovement[] }>('/movements');
    return payload.movements;
  },

  async getInventoryReservations(): Promise<InventoryReservation[]> {
    const payload = await requestPayload<{ reservations: InventoryReservation[] }>('/reservations');
    return payload.reservations;
  },

  async getInventoryAllocations(): Promise<InventoryAllocation[]> {
    const payload = await requestPayload<{ allocations: InventoryAllocation[] }>('/allocations');
    return payload.allocations;
  },

  async getInventoryHolds(): Promise<InventoryHold[]> {
    const payload = await requestPayload<{ holds: InventoryHold[] }>('/holds');
    return payload.holds;
  },

  async getStockTransfers(): Promise<StockTransfer[]> {
    const payload = await requestPayload<{ transfers: StockTransfer[] }>('/transfers');
    return payload.transfers;
  },

  async getInventoryAdjustments(): Promise<InventoryAdjustment[]> {
    const payload = await requestPayload<{ adjustments: InventoryAdjustment[] }>('/adjustments');
    return payload.adjustments;
  },

  async getATPMetrics(skuCode: string): Promise<ATPMetrics> {
    const payload = await requestPayload<{ atp: ATPMetrics }>(`/atp/${encodeURIComponent(skuCode)}`);
    return payload.atp;
  },

  async getInventoryTimeline(skuCode: string): Promise<InventoryTimelineEvent[]> {
    const payload = await requestPayload<{ timeline: InventoryTimelineEvent[] }>(`/timeline/${encodeURIComponent(skuCode)}`);
    return payload.timeline;
  },

  async optimizeInventoryOperations(request: {
    skuCode: string;
    warehouseId: string;
    currentOnHand: number;
    leadTimeDays: number;
  }): Promise<AIInventoryOptimizationResult> {
    const payload = await requestPayload<{ result: AIInventoryOptimizationResult }>('/ai/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return payload.result;
  },
};
