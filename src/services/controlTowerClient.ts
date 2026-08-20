import {
  AILogisticsAnalysisResult,
  GeofenceZone,
  ProofOfDeliveryRecord,
  ShipmentException,
  ShipmentExecutionOrder,
  ShipmentMilestone,
  TelemetrySensors,
} from '../types/controlTower';

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

  const response = await fetch(`/api/control-tower${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Control Tower request failed: ${response.status}`));
  }

  return payload as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface ControlTowerShipmentAnalysisRequest {
  executionId: string;
  trackingNumber: string;
  currentStage: string;
  telemetry: TelemetrySensors;
  originCity: string;
  destinationCity: string;
}

export const ControlTowerClient = {
  getExecutionsAndGeofences: async () => {
    const payload = await requestPayload<{
      executions: ShipmentExecutionOrder[];
      geofences: GeofenceZone[];
    }>('/executions');
    return payload;
  },
  getExceptions: async () => {
    const payload = await requestPayload<{ exceptions: ShipmentException[] }>('/exceptions');
    return payload.exceptions;
  },
  getMilestones: async (executionId: string) => {
    const payload = await requestPayload<{ milestones: ShipmentMilestone[] }>(
      `/milestones/${encodeURIComponent(executionId)}`
    );
    return payload.milestones;
  },
  getProofOfDelivery: async (executionId: string) => {
    const payload = await requestPayload<{ pod: ProofOfDeliveryRecord | null }>(
      `/pod/${encodeURIComponent(executionId)}`
    );
    return payload.pod;
  },
  resolveException: async (exceptionId: string, resolutionActionAr: string) => {
    await post<{ message: string }>('/exceptions/resolve', {
      exceptionId,
      resolutionActionAr,
    });
  },
  analyzeShipment: async (request: ControlTowerShipmentAnalysisRequest) => {
    const payload = await post<{ result: AILogisticsAnalysisResult }>('/ai/analyze-shipment', request);
    return payload.result;
  },
};
