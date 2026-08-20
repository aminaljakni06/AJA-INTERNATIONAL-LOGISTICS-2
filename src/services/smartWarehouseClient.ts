import {
  AISmartWarehouseOptimizationResult,
  ASRSUnitRecord,
  ConveyorLineRecord,
  IoTSensorTelemetry,
  PredictiveMaintenanceAlert,
  RFIDPortalEvent,
  WarehouseRobotRecord,
} from '../types/smartWarehouse';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aja_auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const requestPayload = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/smart-warehouse${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Smart warehouse request failed');
  }

  return payload as T;
};

export const SmartWarehouseClient = {
  async getSmartRobots(): Promise<WarehouseRobotRecord[]> {
    const payload = await requestPayload<{ robots: WarehouseRobotRecord[] }>('/robots');
    return payload.robots;
  },

  async getASRSUnits(): Promise<ASRSUnitRecord[]> {
    const payload = await requestPayload<{ asrs: ASRSUnitRecord[] }>('/asrs');
    return payload.asrs;
  },

  async getConveyorLines(): Promise<ConveyorLineRecord[]> {
    const payload = await requestPayload<{ conveyors: ConveyorLineRecord[] }>('/conveyors');
    return payload.conveyors;
  },

  async getRFIDEvents(): Promise<RFIDPortalEvent[]> {
    const payload = await requestPayload<{ rfidEvents: RFIDPortalEvent[] }>('/rfid-events');
    return payload.rfidEvents;
  },

  async getIoTSensorTelemetry(): Promise<IoTSensorTelemetry[]> {
    const payload = await requestPayload<{ telemetry: IoTSensorTelemetry[] }>('/iot-telemetry');
    return payload.telemetry;
  },

  async getPredictiveMaintenanceAlerts(): Promise<PredictiveMaintenanceAlert[]> {
    const payload = await requestPayload<{ alerts: PredictiveMaintenanceAlert[] }>('/maintenance-alerts');
    return payload.alerts;
  },

  async optimizeAutomation(warehouseId: string): Promise<AISmartWarehouseOptimizationResult> {
    const payload = await requestPayload<{ result: AISmartWarehouseOptimizationResult }>('/ai/automation-optimize', {
      method: 'POST',
      body: JSON.stringify({ warehouseId }),
    });
    return payload.result;
  },
};
