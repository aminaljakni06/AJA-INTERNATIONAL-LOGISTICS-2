import {
  DriverProfile,
  FleetIncident,
  FleetKpiSummary,
  FuelLog,
  MaintenanceRecord,
  TireLog,
  Vehicle,
  VehicleInspectionReport,
} from '../types/fleet';

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

  const response = await fetch(`/api/fleet${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, `Fleet request failed: ${response.status}`));
  }

  return payload as T;
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return requestPayload<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export const FleetClient = {
  getVehicles: async () => {
    const payload = await requestPayload<{ vehicles: Vehicle[]; kpis: FleetKpiSummary }>('/vehicles');
    return payload;
  },
  updateVehicleStatus: async (vehicleId: string, status: Vehicle['status']) => {
    const payload = await patch<{ vehicle: Vehicle | null }>(`/vehicles/${encodeURIComponent(vehicleId)}/status`, {
      status,
    });
    return payload.vehicle;
  },
  getDrivers: async () => {
    const payload = await requestPayload<{ drivers: DriverProfile[] }>('/drivers');
    return payload.drivers;
  },
  getFuelLogs: async () => {
    const payload = await requestPayload<{ fuelLogs: FuelLog[] }>('/fuel');
    return payload.fuelLogs;
  },
  getTireLogs: async () => {
    const payload = await requestPayload<{ tires: TireLog[] }>('/tires');
    return payload.tires;
  },
  getMaintenanceRecords: async () => {
    const payload = await requestPayload<{ maintenance: MaintenanceRecord[] }>('/maintenance');
    return payload.maintenance;
  },
  getInspectionsAndIncidents: async () => {
    const payload = await requestPayload<{
      inspections: VehicleInspectionReport[];
      incidents: FleetIncident[];
    }>('/inspections');
    return payload;
  },
};
