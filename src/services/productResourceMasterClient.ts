import {
  AssetRecord,
  CommodityRecord,
  ContainerRecord,
  DigitalAssetRecord,
  DriverResourceRecord,
  EquipmentRecord,
  ProductMaster,
  ServiceItem,
  ServicePackage,
  ShipmentTypeDefinition,
  UomRecord,
  VehicleRecord,
} from '../types/productResourceMaster';

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

  const response = await fetch(`/api/product-resources${path}`, { ...init, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Product resource request failed: ${response.status}`);
  }

  return response.json();
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function remove(path: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(path, { method: 'DELETE' });
}

export const ProductResourceMasterClient = {
  getProducts: () => request<ProductMaster[]>('/products'),
  createProduct: (data: Omit<ProductMaster, 'id' | 'createdAt' | 'updatedAt'>, _userId?: string) =>
    post<ProductMaster>('/products', data),
  updateProduct: (id: string, data: Partial<ProductMaster>, _userId?: string) =>
    put<ProductMaster>(`/products/${encodeURIComponent(id)}`, data),
  deleteProduct: (id: string, _userId?: string) => remove(`/products/${encodeURIComponent(id)}`),
  getServices: () => request<ServiceItem[]>('/services'),
  createService: (data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>, _userId?: string) =>
    post<ServiceItem>('/services', data),
  updateService: (id: string, data: Partial<ServiceItem>, _userId?: string) =>
    put<ServiceItem>(`/services/${encodeURIComponent(id)}`, data),
  deleteService: (id: string, _userId?: string) => remove(`/services/${encodeURIComponent(id)}`),
  getServicePackages: () => request<ServicePackage[]>('/service-packages'),
  getShipmentTypes: () => request<ShipmentTypeDefinition[]>('/shipment-types'),
  getVehicles: () => request<VehicleRecord[]>('/vehicles'),
  createVehicle: (data: Omit<VehicleRecord, 'id' | 'createdAt' | 'updatedAt'>, _userId?: string) =>
    post<VehicleRecord>('/vehicles', data),
  updateVehicle: (id: string, data: Partial<VehicleRecord>, _userId?: string) =>
    put<VehicleRecord>(`/vehicles/${encodeURIComponent(id)}`, data),
  deleteVehicle: (id: string, _userId?: string) => remove(`/vehicles/${encodeURIComponent(id)}`),
  getContainers: () => request<ContainerRecord[]>('/containers'),
  createContainer: (data: Omit<ContainerRecord, 'id' | 'createdAt' | 'updatedAt'>, _userId?: string) =>
    post<ContainerRecord>('/containers', data),
  updateContainer: (id: string, data: Partial<ContainerRecord>, _userId?: string) =>
    put<ContainerRecord>(`/containers/${encodeURIComponent(id)}`, data),
  deleteContainer: (id: string, _userId?: string) => remove(`/containers/${encodeURIComponent(id)}`),
  getDrivers: () => request<DriverResourceRecord[]>('/drivers'),
  updateDriver: (id: string, data: Partial<DriverResourceRecord>, _userId?: string) =>
    put<DriverResourceRecord>(`/drivers/${encodeURIComponent(id)}`, data),
  deleteDriver: (id: string, _userId?: string) => remove(`/drivers/${encodeURIComponent(id)}`),
  getEquipment: () => request<EquipmentRecord[]>('/equipment'),
  updateEquipment: (id: string, data: Partial<EquipmentRecord>, _userId?: string) =>
    put<EquipmentRecord>(`/equipment/${encodeURIComponent(id)}`, data),
  deleteEquipment: (id: string, _userId?: string) => remove(`/equipment/${encodeURIComponent(id)}`),
  getAssets: () => request<AssetRecord[]>('/assets'),
  updateAsset: (id: string, data: Partial<AssetRecord>, _userId?: string) =>
    put<AssetRecord>(`/assets/${encodeURIComponent(id)}`, data),
  deleteAsset: (id: string, _userId?: string) => remove(`/assets/${encodeURIComponent(id)}`),
  getDigitalAssets: () => request<DigitalAssetRecord[]>('/digital-assets'),
  updateDigitalAsset: (id: string, data: Partial<DigitalAssetRecord>, _userId?: string) =>
    put<DigitalAssetRecord>(`/digital-assets/${encodeURIComponent(id)}`, data),
  deleteDigitalAsset: (id: string, _userId?: string) => remove(`/digital-assets/${encodeURIComponent(id)}`),
  getUoms: () => request<UomRecord[]>('/uoms'),
  createUom: (data: Omit<UomRecord, 'id'>, _userId?: string) =>
    post<UomRecord>('/uoms', data),
  updateUom: (id: string, data: Partial<UomRecord>, _userId?: string) =>
    put<UomRecord>(`/uoms/${encodeURIComponent(id)}`, data),
  deleteUom: (id: string, _userId?: string) => remove(`/uoms/${encodeURIComponent(id)}`),
  getCommodities: () => request<CommodityRecord[]>('/commodities'),
  createCommodity: (data: Omit<CommodityRecord, 'id' | 'createdAt' | 'updatedAt'>, _userId?: string) =>
    post<CommodityRecord>('/commodities', data),
  updateCommodity: (id: string, data: Partial<CommodityRecord>, _userId?: string) =>
    put<CommodityRecord>(`/commodities/${encodeURIComponent(id)}`, data),
  deleteCommodity: (id: string, _userId?: string) => remove(`/commodities/${encodeURIComponent(id)}`),
  convertUomValue: (value: number, fromCode: string, toCode: string) =>
    post<{ resultValue: number; formula: string }>('/uom-conversion', { value, fromCode, toCode }),
};
