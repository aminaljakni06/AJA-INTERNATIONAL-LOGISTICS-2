import {
  AIOutboundOptimizationResult,
  OutboundExceptionRecord,
  OutboundSalesOrder,
  PackingStationRecord,
  PickTaskItem,
  PickingWave,
  ShippingManifest,
} from '../types/outboundLogistics';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/outbound-logistics${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Outbound logistics request failed');
  }

  return payload as T;
};

export const OutboundLogisticsClient = {
  async getOutboundSalesOrders(): Promise<OutboundSalesOrder[]> {
    const payload = await requestPayload<{ orders: OutboundSalesOrder[] }>('/orders');
    return payload.orders;
  },

  async getPickingWaves(): Promise<PickingWave[]> {
    const payload = await requestPayload<{ waves: PickingWave[] }>('/waves');
    return payload.waves;
  },

  async getPickTasks(): Promise<PickTaskItem[]> {
    const payload = await requestPayload<{ pickTasks: PickTaskItem[] }>('/pick-tasks');
    return payload.pickTasks;
  },

  async getPackingStations(): Promise<PackingStationRecord[]> {
    const payload = await requestPayload<{ stations: PackingStationRecord[] }>('/packing-stations');
    return payload.stations;
  },

  async getShippingManifests(): Promise<ShippingManifest[]> {
    const payload = await requestPayload<{ manifests: ShippingManifest[] }>('/manifests');
    return payload.manifests;
  },

  async getOutboundExceptions(): Promise<OutboundExceptionRecord[]> {
    const payload = await requestPayload<{ exceptions: OutboundExceptionRecord[] }>('/exceptions');
    return payload.exceptions;
  },

  async optimizeOutbound(request: {
    waveNumber: string;
    warehouseId: string;
    totalOrdersCount: number;
    pickingStrategy: PickingWave['strategy'];
  }): Promise<AIOutboundOptimizationResult> {
    const payload = await requestPayload<{ result: AIOutboundOptimizationResult }>('/ai/outbound-optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return payload.result;
  },
};
