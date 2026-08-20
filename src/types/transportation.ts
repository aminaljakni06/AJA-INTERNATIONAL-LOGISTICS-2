export type TransportMode =
  | 'ROAD_FREIGHT'
  | 'AIR_FREIGHT'
  | 'OCEAN_FREIGHT'
  | 'RAIL_FREIGHT'
  | 'EXPRESS'
  | 'COURIER'
  | 'INTERMODAL'
  | 'MULTIMODAL';

export type TransportOrderStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'APPROVED'
  | 'BOOKED'
  | 'SCHEDULED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AT_HUB'
  | 'TRANSFERRED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RouteWaypoint {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  estimatedArrival: string;
  actualArrival?: string;
  isCustomsCheckpoint?: boolean;
}

export interface TransportLoadDetails {
  weightKg: number;
  volumeCbm: number;
  palletCount: number;
  containerType?: string; // e.g. '40FT_REEFER', '20FT_DRY'
  containerUtilizationPercentage: number;
  isDangerousGoods: boolean;
  temperatureControlled: boolean;
  targetTempRange?: string; // e.g. '+2C to +8C'
}

export interface TransportDocument {
  id: string;
  documentType: 'WAYBILL' | 'BILL_OF_LADING' | 'CMR' | 'AIR_WAYBILL' | 'PACKING_LIST' | 'PROOF_OF_DELIVERY';
  documentNumber: string;
  fileUrl?: string;
  uploadedAt: string;
}

export interface TransportTrackingEvent {
  id: string;
  timestamp: string;
  status: TransportOrderStatus;
  locationName: string;
  notes: string;
  updatedBy: string;
}

export interface TransportationOrder {
  id: string;
  transportOrderNumber: string;
  customerId: string;
  customerName: string;
  salesOrderRef?: string;
  shipmentRef?: string;
  transportMode: TransportMode;
  originName: string;
  destinationName: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  estimatedEta: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: TransportOrderStatus;
  carrierName: string;
  assignedDriverName?: string;
  assignedVehiclePlate?: string;
  distanceKm: number;
  loadDetails: TransportLoadDetails;
  waypoints: RouteWaypoint[];
  documents: TransportDocument[];
  trackingEvents: TransportTrackingEvent[];
  costAmount: number;
  revenueAmount: number;
  currency: 'SAR' | 'USD';
  createdAt: string;
  updatedAt: string;
}

export interface DockScheduleSlot {
  id: string;
  dockNumber: string;
  facilityLocation: string;
  scheduledTime: string;
  orderRef: string;
  assignedVehiclePlate: string;
  dockStatus: 'AVAILABLE' | 'RESERVED' | 'LOADING' | 'UNLOADING' | 'COMPLETED' | 'DELAYED';
  estimatedDurationMinutes: number;
}

export interface CarrierPerformanceProfile {
  id: string;
  carrierName: string;
  mode: TransportMode;
  slaOnTimeRate: number; // e.g. 98.2%
  ratingStars: number; // 1 to 5
  costPerKmSAR: number;
  activeVehiclesCount: number;
  greenScore: number; // 1 to 100
  totalCompletedShipments: number;
  preferredStatus: 'PREFERRED' | 'APPROVED' | 'UNDER_REVIEW';
}

export interface CarbonEmissionMetrics {
  totalCo2Tons: number;
  avgCo2PerKmKg: number;
  fleetGreenScore: number;
  co2SavedTonsThisMonth: number;
  fuelEfficiencyKmPerLiter: number;
  electricVehicleSharePercentage: number;
}

export interface ShipmentConsolidationPlan {
  id: string;
  planNumber: string;
  routeRegion: string;
  mergedOrderIds: string[];
  totalWeightKg: number;
  totalVolumeCbm: number;
  utilizationPercentage: number;
  estimatedCostSavingsSAR: number;
  status: 'PROPOSED' | 'APPROVED' | 'IN_EXECUTION';
}

export interface TransportationKpis {
  onTimePickupRate: number; // e.g. 98.5%
  onTimeDeliveryRate: number; // e.g. 97.2%
  avgTransitTimeHours: number;
  fleetCapacityUtilization: number; // e.g. 88.4%
  totalDistanceKm: number;
  totalFreightCostSAR: number;
  avgCostPerShipmentSAR: number;
  carbonEmissionMetrics?: CarbonEmissionMetrics;
}

export interface AITransportOptimizationRequest {
  origin: string;
  destination: string;
  weightKg: number;
  volumeCbm: number;
  transportMode: string;
  temperatureControlled: boolean;
}

export interface AITransportOptimizationResponse {
  recommendedRoute: string;
  distanceKm: number;
  estimatedTransitTimeHours: number;
  recommendedVehicleType: string;
  containerUtilizationPercentage: number;
  delayRiskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  delayRiskFactor: string;
  fuelOptimizationSuggestion: string;
  estimatedCostSAR: number;
}
