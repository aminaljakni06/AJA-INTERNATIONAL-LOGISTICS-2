export type VehicleStatus = 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type VehicleType = '40FT_REEFER_TRAILER' | '8TON_DRY_TRUCK' | '15TON_CURTAINSIDER' | 'HEAVY_TRACTOR_HEAD' | 'VAN_EXPRESS';
export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'ON_LEAVE' | 'REST';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION' | 'TIRE_SERVICE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GpsLocation {
  latitude: number;
  longitude: number;
  locationName: string;
  speedKmH: number;
  headingDegree: number;
  timestamp: string;
}

export interface Vehicle {
  id: string;
  fleetCode: string; // e.g. AJA-FL-101
  licensePlate: string; // e.g. أ ج ا - 5582
  vin: string;
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  year: number;
  branchLocation: string;
  status: VehicleStatus;
  currentDriverId?: string;
  currentDriverName?: string;
  mileageKm: number;
  fuelLevelPercent: number;
  engineTempCelsius: number;
  lastGpsLocation: GpsLocation;
  nextMaintenanceKm: number;
  insuranceExpiryDate: string;
  inspectionExpiryDate: string;
  reeferTargetTemp?: string;
  reeferCurrentTemp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile {
  id: string;
  employeeCode: string; // e.g. EMP-DRV-201
  name: string;
  licenseNumber: string;
  licenseCategory: string; // e.g. Heavy Commercial
  licenseExpiryDate: string;
  phoneNumber: string;
  status: DriverStatus;
  ratingStars: number;
  drivingSafetyScore: number; // 0 to 100
  harshBrakingCount: number;
  idleTimeHoursThisMonth: number;
  totalDistanceDrivenKm: number;
  assignedVehiclePlate?: string;
  medicalCertExpiryDate: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  licensePlate: string;
  driverName: string;
  timestamp: string;
  fuelCardNumber: string;
  stationName: string;
  liters: number;
  costSAR: number;
  odometerKm: number;
  fuelEfficiencyKmPerLiter: number;
  theftAlertFlag: boolean;
}

export interface TireLog {
  id: string;
  vehicleId: string;
  licensePlate: string;
  position: 'FRONT_LEFT' | 'FRONT_RIGHT' | 'REAR_LEFT_OUTER' | 'REAR_LEFT_INNER' | 'REAR_RIGHT_OUTER' | 'REAR_RIGHT_INNER';
  serialNumber: string;
  brand: string;
  treadDepthMm: number;
  pressurePsi: number;
  installedAtKm: number;
  status: 'GOOD' | 'NEEDS_ROTATION' | 'NEEDS_REPLACEMENT';
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  licensePlate: string;
  maintenanceType: MaintenanceType;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  costSAR: number;
  workshopVendorName: string;
  status: MaintenanceStatus;
  downtimeHours: number;
}

export interface VehicleInspectionReport {
  id: string;
  vehicleId: string;
  licensePlate: string;
  driverName: string;
  inspectionDate: string;
  inspectionType: 'PRE_TRIP' | 'POST_TRIP';
  passed: boolean;
  brakesOk: boolean;
  tiresOk: boolean;
  lightsOk: boolean;
  reeferEngineOk: boolean;
  fluidLevelsOk: boolean;
  notes?: string;
}

export interface FleetIncident {
  id: string;
  vehicleId: string;
  licensePlate: string;
  driverName: string;
  incidentType: 'ACCIDENT' | 'BREAKDOWN' | 'SPEED_VIOLATION' | 'GEOFENCE_BREACH';
  severity: IncidentSeverity;
  timestamp: string;
  locationName: string;
  description: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED';
}

export interface FleetKpiSummary {
  totalVehicles: number;
  activeInTransit: number;
  underMaintenance: number;
  availableVehicles: number;
  avgFleetAgeYears: number;
  totalFuelSpentSAR: number;
  avgFleetEfficiencyKmPerL: number;
  avgFleetSafetyScore: number;
}

export interface AIFleetDiagnosticsResult {
  vehicleId: string;
  licensePlate: string;
  failureRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  failureRiskFactor: string;
  recommendedMaintenanceAction: string;
  driverCoachingRecommendation: string;
  estimatedRemainingBrakeLifePercent: number;
  fuelOptimizationTip: string;
}
