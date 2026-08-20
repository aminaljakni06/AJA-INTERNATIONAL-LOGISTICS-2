export type WarehouseType =
  | 'DISTRIBUTION_CENTER'
  | 'REGIONAL_WAREHOUSE'
  | 'CENTRAL_WAREHOUSE'
  | 'COLD_STORAGE'
  | 'BONDED_WAREHOUSE'
  | 'CROSS_DOCK'
  | 'FULFILLMENT_CENTER'
  | 'RETURNS_WAREHOUSE';

export type ZoneType =
  | 'RECEIVING'
  | 'INSPECTION'
  | 'STORAGE'
  | 'PICKING'
  | 'PACKING'
  | 'SHIPPING'
  | 'RETURNS'
  | 'HAZMAT'
  | 'COLD_ZONE'
  | 'HIGH_VALUE'
  | 'QUARANTINE'
  | 'BONDED_AREA';

export type BinStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'BLOCKED';

export type StorageStrategy = 'FIFO' | 'LIFO' | 'FEFO' | 'BATCH' | 'SERIAL' | 'HAZMAT' | 'TEMP_CONTROLLED';

export interface StorageRule {
  id: string;
  warehouseId: string;
  zoneId?: string;
  ruleNameEn: string;
  ruleNameAr: string;
  strategy: StorageStrategy;
  maxStorageDays?: number;
  hazmatLevel?: string;
  minTempCelsius?: number;
  maxTempCelsius?: number;
  securityLevel: 'STANDARD' | 'HIGH' | 'RESTRICTED';
  active: boolean;
}

export interface WarehouseBuilding {
  id: string;
  warehouseId: string;
  buildingCode: string;
  buildingNameEn: string;
  buildingNameAr: string;
  totalFloors: number;
}

export interface WarehouseFloor {
  id: string;
  buildingId: string;
  floorNumber: number;
  floorCode: string;
  floorNameAr: string;
  totalZones: number;
}

export interface WarehouseAisle {
  id: string;
  zoneId: string;
  aisleCode: string;
  aisleNameAr: string;
  totalRacks: number;
}

export interface WarehouseRack {
  id: string;
  aisleId: string;
  rackCode: string;
  totalShelves: number;
  maxWeightCapacityKg: number;
  currentWeightKg: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'FULL';
}

export interface WarehouseShelf {
  id: string;
  rackId: string;
  shelfCode: string;
  totalBins: number;
  maxWeightKg: number;
}

export interface WarehouseShift {
  id: string;
  warehouseId: string;
  shiftNameEn: string;
  shiftNameAr: string;
  startTime: string;
  endTime: string;
  supervisorName: string;
  assignedWorkersCount: number;
  status: 'OPEN' | 'CLOSED' | 'MAINTENANCE_WINDOW';
}

export interface AIWarehouseInsight {
  id: string;
  warehouseId: string;
  category: 'STORAGE_OPTIMIZATION' | 'LAYOUT_RECOMMENDATION' | 'CAPACITY_FORECAST' | 'CONGESTION_PREDICTION';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  confidencePercent: number;
  recommendedActionEn: string;
  recommendedActionAr: string;
  impactScore: string;
}

export interface WarehouseLocation {
  id: string;
  code: string; // e.g. WH-RUH-01
  nameAr: string;
  nameEn: string;
  type: WarehouseType;
  companyName?: string;
  branchName?: string;
  city: string;
  region: string;
  country?: string;
  addressAr: string;
  managerName: string;
  managerPhone: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  totalCapacityPallets: number;
  occupiedCapacityPallets: number;
  utilizationPercent: number;
  temperatureControlled: boolean;
  rfidEnabled: boolean;
  workingHours: string;
  totalVolumeCbm?: number;
  occupiedVolumeCbm?: number;
  totalWeightCapacityTons?: number;
}

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  code: string; // e.g. ZN-COLD-A
  nameAr: string;
  zoneType: ZoneType;
  temperatureMinCelsius?: number;
  temperatureMaxCelsius?: number;
  totalBinsCount: number;
  occupiedBinsCount: number;
  utilizationPercent: number;
  hasHazmatPermit: boolean;
  securityLevel: 'HIGH' | 'STANDARD' | 'RESTRICTED';
}

export interface WarehouseBin {
  id: string;
  zoneId: string;
  binCode: string; // e.g. B-A01-R02-S03 (Aisle 1, Rack 2, Shelf 3)
  barcode: string;
  qrCode: string;
  rfidTagId: string;
  aisle: string;
  rack: string;
  shelf: string;
  position: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  maxWeightKg: number;
  currentWeightKg: number;
  maxVolumeCbm: number;
  currentVolumeCbm: number;
  status: BinStatus;
  currentSkuCode?: string;
  currentProductNameAr?: string;
  quantityInside?: number;
}

export interface WarehouseCapacityKPIs {
  totalPalletPositions: number;
  occupiedPalletPositions: number;
  availablePalletPositions: number;
  overallUtilizationPercent: number;
  activeWarehousesCount: number;
  coldStorageUtilizationPercent: number;
  activeBinsCount: number;
  rfidScannedRatePercent: number;
}

export interface AIWarehouseSpaceResult {
  warehouseId: string;
  spaceOptimizationScorePercent: number;
  recommendedPutawayZoneAr: string;
  recommendedPutawayBinAr: string;
  congestionRiskAssessmentAr: string;
  capacityForecastMonthsAr: string;
  actionableSpaceRecommendationsAr: string[];
  aiConfidencePercent: number;
}

