export type ExecutionStage = 
  | 'DISPATCH'
  | 'PICKUP'
  | 'LOADING'
  | 'CROSS_DOCK'
  | 'PORT'
  | 'AIRPORT'
  | 'BORDER'
  | 'WAREHOUSE'
  | 'DELIVERY'
  | 'COMPLETION';

export type MilestoneKey =
  | 'CREATED'
  | 'APPROVED'
  | 'VEHICLE_ASSIGNED'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP_STARTED'
  | 'PICKUP_COMPLETED'
  | 'LOADED'
  | 'DEPARTED'
  | 'ARRIVED_HUB'
  | 'CUSTOMS_STARTED'
  | 'CUSTOMS_CLEARED'
  | 'TRANSFERRED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'POD_SIGNED'
  | 'CLOSED';

export type MilestoneStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED';

export type ExceptionCategory =
  | 'DELAY'
  | 'TRAFFIC'
  | 'WEATHER'
  | 'VEHICLE_BREAKDOWN'
  | 'CUSTOMS_HOLD'
  | 'DAMAGE'
  | 'LOST'
  | 'MISSING_DOCS'
  | 'CAPACITY'
  | 'SECURITY';

export type ExceptionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ExceptionStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export type GeofenceType =
  | 'WAREHOUSE'
  | 'PORT'
  | 'AIRPORT'
  | 'DC'
  | 'CUSTOMER_SITE'
  | 'RESTRICTED'
  | 'BORDER';

export interface TelemetrySensors {
  temperatureCelsius: number;
  humidityPercent: number;
  shockGForce: number;
  lightLux: number;
  doorClosed: boolean;
  batteryPercent: number;
  fuelLevelPercent: number;
  weightTons: number;
}

export interface ShipmentMilestone {
  id: string;
  executionId: string;
  milestoneKey: MilestoneKey;
  labelAr: string;
  labelEn: string;
  plannedTime: string;
  actualTime?: string | null;
  status: MilestoneStatus;
  locationName: string;
  latitude: number;
  longitude: number;
}

export interface ShipmentException {
  id: string;
  executionId: string;
  trackingNumber: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  descriptionAr: string;
  rootCauseAr?: string;
  resolutionActionAr?: string;
  reportedAt: string;
  resolvedAt?: string | null;
}

export interface ProofOfDeliveryRecord {
  id: string;
  executionId: string;
  trackingNumber: string;
  receiverName: string;
  digitalSignatureUrl?: string;
  qrCodeData: string;
  gpsLatitude: number;
  gpsLongitude: number;
  signedTimestamp: string;
  photoProofUrl?: string;
  receiverNotes?: string;
}

export interface GeofenceZone {
  id: string;
  nameAr: string;
  zoneType: GeofenceType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  activeShipmentsInsideCount: number;
}

export interface ShipmentExecutionOrder {
  id: string; // e.g. EXEC-2026-9001
  shipmentId: string; // e.g. SHP-90412
  trackingNumber: string; // e.g. AJA-881920
  customerName: string;
  originCity: string;
  destinationCity: string;
  currentStage: ExecutionStage;
  healthScorePercent: number; // e.g. 96
  driverName: string;
  driverPhone: string;
  vehiclePlateNumber: string;
  carrierPartnerName: string;

  // GPS Location & Telemetry
  currentLat: number;
  currentLng: number;
  lastGpsUpdateTimestamp: string;
  telemetry: TelemetrySensors;

  // ETA Engine metrics
  plannedETA: string;
  currentETA: string;
  predictedETAByAI: string;
  confidenceScorePercent: number;
  delayRiskFactor: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // Stats
  progressPercent: number;
  hasActiveException: boolean;
  exceptionCount: number;

  updatedAt: string;
}

export interface ControlTowerKPIs {
  totalActiveShipments: number;
  inTransitCount: number;
  totalDelayed: number;
  criticalExceptionsCount: number;
  onTimeDeliveryRate: number; // e.g. 98.6
  onTimePickupRate: number; // e.g. 99.1
  averageTransitDays: number; // e.g. 1.8
  fleetActiveUtilizationPercent: number; // e.g. 92.4
  overallLogisticsHealthScore: number; // e.g. 95.2
}

export interface AILogisticsAnalysisResult {
  executionId: string;
  trackingNumber: string;
  overallStatusSummaryAr: string;
  predictedDelayHours: number;
  riskAssessmentReasoningAr: string;
  recommendedAlternativeRouteAr: string;
  recommendedAlternativeCarrierAr: string;
  recommendedActionItemsAr: string[];
  aiConfidencePercent: number;
}
