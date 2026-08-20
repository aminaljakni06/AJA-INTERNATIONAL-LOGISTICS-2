export type ResourceLifecycleStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'MAINTENANCE'
  | 'SUSPENDED'
  | 'ARCHIVED'
  | 'RETIRED'
  | 'DELETED';

// ----------------------------------------------------------------------
// 1. Product Master & SKU Registry
// ----------------------------------------------------------------------
export interface ProductMaster {
  id: string;
  globalProductId: string;
  productCode: string; // SKU code
  sku: string;
  barcode: string; // EAN-13 / UPC
  qrCode: string;
  rfidTag: string;
  nameAr: string;
  nameEn: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  longDescriptionAr?: string;
  longDescriptionEn?: string;
  commodityCategory: string; // e.g. Electronics, Pharmaceuticals
  hsCode: string; // Harmonized System Code
  brand: string;
  model: string;
  serialNumber?: string;
  countryOfOrigin: string; // ISO-2 code
  uom: string; // e.g., 'PCS', 'KG', 'BOX'
  weightKg: number;
  volumeCbm: number;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  packagingType: 'BOX' | 'PALLET' | 'DRUM' | 'CRATE' | 'BAG' | 'LOOSE' | 'CONTAINER';
  temperatureClass: 'AMBIENT' | 'CHILLED' | 'FROZEN' | 'DEEP_FREEZE' | 'CONTROLLED_ROOM';
  isHazmat: boolean;
  unNumber?: string; // UN Hazmat number e.g. UN1263
  hazmatClass?: string;
  shelfLifeDays?: number;
  status: ResourceLifecycleStatus;
  owner: string;
  steward?: string;
  version: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// 2. Service Catalog & Service Packages
// ----------------------------------------------------------------------
export type ServiceCategory =
  | 'AIR_FREIGHT'
  | 'SEA_FREIGHT'
  | 'LAND_FREIGHT'
  | 'EXPRESS'
  | 'COURIER'
  | 'WAREHOUSING'
  | 'CROSS_DOCKING'
  | 'FULFILLMENT'
  | 'CUSTOMS_CLEARANCE'
  | 'PACKAGING'
  | 'INSURANCE'
  | 'LAST_MILE'
  | 'REVERSE_LOGISTICS'
  | 'COLD_CHAIN'
  | 'VALUE_ADDED';

export interface ServiceItem {
  id: string;
  serviceCode: string;
  category: ServiceCategory;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  baseCurrency: string;
  defaultRate: number;
  rateUnit: string; // e.g. PER_KG, PER_CBM, PER_CONTAINER, PER_HOUR
  leadTimeHours: number;
  slaTermsAr?: string;
  slaTermsEn?: string;
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  packageCode: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  includedServiceIds: string[];
  bundleDiscountPercentage: number;
  targetMarket: string;
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// 3. Shipment Types
// ----------------------------------------------------------------------
export type ShipmentTypeCode =
  | 'DOCUMENT'
  | 'PARCEL'
  | 'PALLET'
  | 'CONTAINER'
  | 'BULK'
  | 'VEHICLE'
  | 'PROJECT_CARGO'
  | 'DANGEROUS_GOODS'
  | 'PERISHABLE'
  | 'OVERSIZED_CARGO'
  | 'HEAVY_LIFT'
  | 'LIVESTOCK'
  | 'MEDICAL'
  | 'PHARMACEUTICAL';

export interface ShipmentTypeDefinition {
  id: string;
  code: ShipmentTypeCode;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  maxWeightKg: number;
  maxVolumeCbm: number;
  requiresTemperatureControl: boolean;
  requiresHazmatClearance: boolean;
  specialHandlingInstructionsAr?: string;
  specialHandlingInstructionsEn?: string;
  status: ResourceLifecycleStatus;
}

// ----------------------------------------------------------------------
// 4. Asset Master & Digital Assets
// ----------------------------------------------------------------------
export type AssetClass =
  | 'ENTERPRISE'
  | 'FLEET'
  | 'WAREHOUSE'
  | 'IT'
  | 'OFFICE'
  | 'OPERATIONAL'
  | 'MOVABLE'
  | 'FIXED'
  | 'DIGITAL';

export interface AssetRecord {
  id: string;
  assetTagNumber: string;
  nameAr: string;
  nameEn: string;
  assetClass: AssetClass;
  category: string;
  serialNumber: string;
  purchaseValueSar: number;
  currentValueSar: number;
  depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
  locationId: string;
  locationName: string;
  assignedToUserOrDept?: string;
  warrantyExpiryDate?: string;
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export type DigitalAssetType =
  | 'IMAGE'
  | 'DOCUMENT'
  | 'CERTIFICATE'
  | 'VIDEO'
  | 'CAD_FILE'
  | 'INSPECTION_REPORT'
  | 'MAINTENANCE_MANUAL'
  | 'CONTRACT';

export interface DigitalAssetRecord {
  id: string;
  titleAr: string;
  titleEn: string;
  fileName: string;
  assetType: DigitalAssetType;
  fileSizeBytes: number;
  fileUrl: string;
  mimeType: string;
  associatedEntityDomain: string; // e.g., 'VEHICLE', 'PRODUCT', 'DRIVER'
  associatedEntityId: string;
  uploadedBy: string;
  tags: string[];
  createdAt: string;
}

// ----------------------------------------------------------------------
// 5. Vehicle & Container Master
// ----------------------------------------------------------------------
export type VehicleType =
  | 'TRUCK'
  | 'VAN'
  | 'PICKUP'
  | 'TRAILER'
  | 'FORKLIFT'
  | 'CRANE'
  | 'REACH_STACKER'
  | 'TERMINAL_TRACTOR';

export interface VehicleRecord {
  id: string;
  vehicleCode: string;
  type: VehicleType;
  vin: string; // Vehicle Identification Number
  licensePlate: string;
  engineNumber: string;
  makeBrand: string;
  model: string;
  modelYear: number;
  fuelType: 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'HYDROGEN';
  maxPayloadKg: number;
  maxVolumeCbm: number;
  maintenanceStatus: 'ACTIVE' | 'DUE_FOR_SERVICE' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE';
  odometerKm: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export type IsoContainerType =
  | '20GP'
  | '40GP'
  | '40HC'
  | '45HC'
  | 'REEFER'
  | 'OPEN_TOP'
  | 'FLAT_RACK'
  | 'TANK'
  | 'SPECIAL';

export interface ContainerRecord {
  id: string;
  containerNumber: string; // ISO 6346 compliant (e.g., MSCU1234567)
  type: IsoContainerType;
  tareWeightKg: number;
  maxPayloadKg: number;
  maxVolumeCbm: number;
  ownerName: string;
  operatorName: string;
  isReeferUnit: boolean;
  minTempCelsius?: number;
  maxTempCelsius?: number;
  lastInspectionDate: string;
  maintenanceHistoryCount: number;
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// 6. Equipment & Driver Resource Master
// ----------------------------------------------------------------------
export type WarehouseEquipmentCategory =
  | 'FORKLIFT'
  | 'CRANE'
  | 'CONVEYOR'
  | 'SCANNER'
  | 'RF_DEVICE'
  | 'IOT_DEVICE'
  | 'WAREHOUSE_ROBOT'
  | 'PACKAGING_MACHINE'
  | 'LOADING_EQUIPMENT';

export interface EquipmentRecord {
  id: string;
  equipmentCode: string;
  category: WarehouseEquipmentCategory;
  nameAr: string;
  nameEn: string;
  serialNumber: string;
  warehouseHubName: string;
  powerSource: 'ELECTRIC_BATTERY' | 'DIESEL' | 'MANUAL' | 'SOLAR_PNEUMATIC';
  operationalStatus: 'OPERATIONAL' | 'IN_REPAIR' | 'CALIBRATION_DUE' | 'DECOMMISSIONED';
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DriverResourceRecord {
  id: string;
  driverCode: string;
  fullNameAr: string;
  fullNameEn: string;
  nationalIdOrIqama: string;
  licenseType: 'HEAVY_TRUCK' | 'LIGHT_VEHICLE' | 'HAZMAT_CERTIFIED' | 'EQUIPMENT_OPERATOR' | 'INTERNATIONAL';
  licenseNumber: string;
  licenseExpiryDate: string;
  medicalClearanceStatus: 'PASSED' | 'DUE' | 'EXPIRED';
  workingHoursToday: number;
  maxAllowedDutyHours: number;
  availabilityStatus: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'ON_LEAVE';
  assignedVehicleVin?: string;
  assignedVehiclePlate?: string;
  safetyPerformanceScore: number; // 0 - 100
  certifications: string[];
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// 7. Unit of Measure (UOM) & Commodity Master
// ----------------------------------------------------------------------
export type UomCategory = 'LENGTH' | 'WEIGHT' | 'VOLUME' | 'AREA' | 'TIME' | 'QUANTITY';

export interface UomRecord {
  id: string;
  code: string; // e.g. KG, TON, M, CBM, PCS
  nameAr: string;
  nameEn: string;
  category: UomCategory;
  isBaseUnit: boolean;
  conversionFactorToBase: number; // e.g. 1 TON = 1000 KG
  status: ResourceLifecycleStatus;
}

export interface UomConversionRule {
  id: string;
  sourceUom: string;
  targetUom: string;
  category: UomCategory;
  multiplier: number;
  formulaDescription: string;
}

export type HazmatRegulationClass =
  | 'IMDG'
  | 'ADR'
  | 'IATA_DGR'
  | 'LITHIUM_BATTERIES'
  | 'FOOD'
  | 'MEDICAL'
  | 'CHEMICAL'
  | 'INDUSTRIAL'
  | 'NONE';

export interface CommodityRecord {
  id: string;
  hsCode: string; // Harmonized Commodity Description & Coding System
  unNumber?: string; // UN 4-digit code e.g. UN1993
  hazmatClass: HazmatRegulationClass;
  titleAr: string;
  titleEn: string;
  categoryName: string;
  importDutyRatePercent: number;
  vatRatePercent: number;
  isRestrictedImport: boolean;
  requiresSpecialPermit: boolean;
  specialPermitAgencyAr?: string;
  specialPermitAgencyEn?: string;
  status: ResourceLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}
