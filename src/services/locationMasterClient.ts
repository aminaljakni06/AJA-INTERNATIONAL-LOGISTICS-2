import {
  AirportMaster,
  BorderCrossing,
  CityMaster,
  CountryMaster,
  GeofenceZone,
  HolidayCalendarItem,
  LocationAnalytics,
  PortMaster,
  TradeLane,
  WarehouseMaster,
} from '../types/locationMaster';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aja_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };

  const response = await fetch(`/api/locations${path}`, { ...init, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Location request failed: ${response.status}`);
  }

  return response.json();
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

export const LocationMasterClient = {
  getAnalytics: () => request<LocationAnalytics>('/analytics'),
  getCountries: (filter?: { search?: string; sanctionStatus?: string }) =>
    request<CountryMaster[]>(`/countries${toQuery(filter || {})}`),
  createCountry: (data: Omit<CountryMaster, 'id'>, _userId?: string) => post<CountryMaster>('/countries', data),
  getCities: (countryCode?: string) => request<CityMaster[]>(`/cities${toQuery({ countryCode })}`),
  createCity: (data: Omit<CityMaster, 'id'>, _userId?: string) => post<CityMaster>('/cities', data),
  getPorts: (countryCode?: string) => request<PortMaster[]>(`/ports${toQuery({ countryCode })}`),
  createPort: (data: Omit<PortMaster, 'id'>, _userId?: string) => post<PortMaster>('/ports', data),
  getAirports: (countryCode?: string) => request<AirportMaster[]>(`/airports${toQuery({ countryCode })}`),
  createAirport: (data: Omit<AirportMaster, 'id'>, _userId?: string) => post<AirportMaster>('/airports', data),
  getWarehouses: () => request<WarehouseMaster[]>('/warehouses'),
  createWarehouse: (data: Omit<WarehouseMaster, 'id'>, _userId?: string) => post<WarehouseMaster>('/warehouses', data),
  getBorderCrossings: () => request<BorderCrossing[]>('/border-crossings'),
  getTradeLanes: () => request<TradeLane[]>('/trade-lanes'),
  createTradeLane: (data: Omit<TradeLane, 'id'>, _userId?: string) => post<TradeLane>('/trade-lanes', data),
  getGeofences: () => request<GeofenceZone[]>('/geofences'),
  createGeofence: (data: Omit<GeofenceZone, 'id'>, _userId?: string) => post<GeofenceZone>('/geofences', data),
  getHolidays: (countryCode?: string) => request<HolidayCalendarItem[]>(`/holidays${toQuery({ countryCode })}`),
};
