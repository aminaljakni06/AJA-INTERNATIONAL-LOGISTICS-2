export interface CountryMaster {
  id: string;
  isoAlpha2: string; // e.g. "SA"
  isoAlpha3: string; // e.g. "SAU"
  numericCode: string; // e.g. "682"
  arabicName: string;
  englishName: string;
  currency: string;
  phoneCode: string;
  timeZone: string;
  vatRatePercent: number;
  taxRegistrationFormat?: string;
  sanctionStatus: 'CLEAR' | 'SANCTIONED' | 'HIGH_RISK' | 'RESTRICTED';
  tradeStatus: 'ACTIVE' | 'BLOCKED' | 'SPECIAL_PERMIT_REQUIRED';
  primaryLanguages: string[];
  flagEmoji?: string;
  isGccMember: boolean;
  metadata?: Record<string, any>;
}

export interface CityMaster {
  id: string;
  countryId: string;
  countryCode: string;
  cityNameEn: string;
  cityNameAr: string;
  provinceRegion: string;
  district?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  populationEstimate?: number;
  deliveryCoverageStatus: 'FULL' | 'PARTIAL' | 'OUT_OF_DELIVERY_ZONE';
  isCommercialHub: boolean;
}

export type PortType = 'SEA_PORT' | 'DRY_PORT' | 'RIVER_PORT' | 'OIL_TERMINAL' | 'BULK_TERMINAL' | 'CONTAINER_TERMINAL';

export interface PortMaster {
  id: string;
  unLocode: string; // e.g. "SADMN" for Dammam
  portNameEn: string;
  portNameAr: string;
  portType: PortType;
  countryCode: string;
  cityId?: string;
  latitude: number;
  longitude: number;
  annualTeuCapacity?: number;
  supportedCargoTypes: ('CONTAINER' | 'HAZMAT' | 'REEFER' | 'RO_RO' | 'BULK_LIQUID')[];
  customsOfficeCode?: string;
  status: 'OPERATIONAL' | 'CONGESTED' | 'MAINTENANCE' | 'CLOSED';
}

export type AirportType = 'INTERNATIONAL' | 'REGIONAL' | 'CARGO_HUB' | 'MILITARY_SHARED';

export interface AirportMaster {
  id: string;
  iataCode: string; // e.g. "RUH"
  icaoCode: string; // e.g. "OERK"
  airportNameEn: string;
  airportNameAr: string;
  airportType: AirportType;
  countryCode: string;
  cityName: string;
  latitude: number;
  longitude: number;
  cargoTerminalCapacityTonsPerYear?: number;
  hasReeferColdChain: boolean;
  hasHazmatHub: boolean;
  status: 'OPERATIONAL' | 'RESTRICTED' | 'CLOSED';
}

export type WarehouseType = 'DISTRIBUTION_CENTER' | 'CROSS_DOCK' | 'BONDED_WAREHOUSE' | 'COLD_STORAGE' | 'HAZMAT_HUB' | 'LAST_MILE_HUB';

export interface WarehouseMaster {
  id: string;
  warehouseCode: string; // e.g. "WH-RUH-01"
  warehouseNameEn: string;
  warehouseNameAr: string;
  type: WarehouseType;
  organizationNodeId?: string; // Link to Org Master
  countryCode: string;
  cityName: string;
  addressStreet: string;
  latitude: number;
  longitude: number;
  totalCapacitySqm: number;
  storageZoneCount: number;
  dockCount: number;
  supportsHazmat: boolean;
  supportsTemperatureControlled: boolean;
  minTempCelsius?: number;
  maxTempCelsius?: number;
  workingHours: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
}

export interface BorderCrossing {
  id: string;
  crossingCode: string; // e.g. "BC-SA-AE-BATA"
  nameEn: string;
  nameAr: string;
  countryACode: string; // e.g. "SA"
  countryBCode: string; // e.g. "AE"
  customsOfficeName: string;
  borderType: 'LAND' | 'RAIL' | 'BRIDGE' | 'FERRY';
  operatingHours: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  avgCustomsClearanceHours: number;
  status: 'OPEN' | 'CONGESTED' | 'CLOSED';
}

export type TransportMode = 'AIR' | 'SEA' | 'ROAD' | 'RAIL' | 'MULTIMODAL';

export interface TradeLane {
  id: string;
  laneCode: string; // e.g. "TL-SA-CN-SEA"
  originCountryCode: string;
  originHubName: string;
  destinationCountryCode: string;
  destinationHubName: string;
  mode: TransportMode;
  distanceKm: number;
  estimatedTransitDays: number;
  preferredCarrierId?: string;
  preferredCarrierName?: string;
  carbonScoreCo2PerTon: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface GeofenceZone {
  id: string;
  zoneCode: string;
  zoneName: string;
  type: 'POLYGON' | 'CIRCLE';
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  polygonCoordinates?: { lat: number; lng: number }[];
  associatedLocationId?: string; // Warehouse or Port link
  entryAlertEnabled: boolean;
  exitAlertEnabled: boolean;
  speedLimitKmh?: number;
}

export interface HolidayCalendarItem {
  id: string;
  countryCode: string;
  holidayNameEn: string;
  holidayNameAr: string;
  date: string; // YYYY-MM-DD
  type: 'NATIONAL' | 'RELIGIOUS' | 'OPERATIONAL_SHUTDOWN' | 'BANK_HOLIDAY';
  affectsCustoms: boolean;
  affectsPortOperations: boolean;
}

export interface LocationAnalytics {
  totalCountries: number;
  totalCities: number;
  totalPorts: number;
  totalAirports: number;
  totalWarehouses: number;
  totalTradeLanes: number;
  totalWarehouseSqm: number;
  sanctionedCountriesCount: number;
}
