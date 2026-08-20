export type PutawayType =
  | 'DIRECTED'
  | 'RANDOM'
  | 'FIXED_LOCATION'
  | 'OVERFLOW_LOCATION'
  | 'FAST_MOVING'
  | 'SLOW_MOVING'
  | 'HAZMAT'
  | 'COLD_STORAGE'
  | 'CROSS_DOCK';

export type RotationStrategy = 'FIFO' | 'FEFO' | 'LIFO';

export interface PutawayRule {
  id: string;
  ruleCode: string; // e.g. PWR-HAZMAT-01
  ruleNameAr: string;
  ruleNameEn: string;
  warehouseId: string;
  putawayType: PutawayType;
  rotationStrategy: RotationStrategy;
  priorityOrder: number;
  minTempCelsius?: number;
  maxTempCelsius?: number;
  hazmatClass?: string;
  targetZoneCode: string;
  active: boolean;
}

export type ABCVelocityClass = 'FAST_A' | 'MEDIUM_B' | 'SLOW_C';

export interface DynamicSlottingProfile {
  id: string;
  skuCode: string;
  productNameAr: string;
  velocityClass: ABCVelocityClass;
  demandRatePerDay: number;
  seasonalPeakMonth?: string;
  familyGroupCode: string;
  recommendedBinCode: string;
  currentBinCode: string;
  travelDistanceScoreMeters: number;
  reslottingRecommended: boolean;
  reslottingReasonAr?: string;
}

export interface LocationConstraintValidation {
  binCode: string;
  skuCode: string;
  weightValid: boolean;
  volumeValid: boolean;
  heightValid: boolean;
  dimensionValid: boolean;
  temperatureValid: boolean;
  hazmatValid: boolean;
  securityValid: boolean;
  compatibilityValid: boolean;
  overallStatus: 'APPROVED' | 'REJECTED_CONSTRAINT_VIOLATION';
  violationReasonAr?: string;
}

export type WESTaskType =
  | 'PUTAWAY'
  | 'MOVE'
  | 'REPLENISHMENT'
  | 'CONSOLIDATION'
  | 'INSPECTION'
  | 'CYCLE_COUNT'
  | 'EXCEPTION';

export type WESTaskPriority = 'EMERGENCY' | 'URGENT' | 'NORMAL' | 'LOW';

export type WESTaskStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'ESCALATED';

export interface WarehouseTask {
  id: string;
  taskNumber: string; // e.g. WES-TSK-2026-101
  taskType: WESTaskType;
  priority: WESTaskPriority;
  status: WESTaskStatus;
  warehouseId: string;
  sourceLocationCode: string;
  destinationLocationCode: string;
  skuCode: string;
  productNameAr: string;
  quantity: number;
  unitOfMeasure: string;
  assignedResourceId?: string;
  assignedResourceNameAr?: string;
  assignedEquipmentCode?: string;
  estimatedTravelDistanceMeters: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type ResourceEquipmentType =
  | 'EMPLOYEE'
  | 'FORKLIFT'
  | 'REACH_TRUCK'
  | 'AGV_ROBOT'
  | 'AMR_PALLET_MOVER';

export interface WarehouseResource {
  id: string;
  resourceCode: string; // e.g. OPERATOR-01 or FLT-RUH-03
  resourceNameAr: string;
  equipmentType: ResourceEquipmentType;
  warehouseId: string;
  assignedZoneCode: string;
  shiftNameAr: string;
  activeTasksCount: number;
  completedTasksTodayCount: number;
  status: 'AVAILABLE' | 'BUSY_EXECUTING' | 'ON_BREAK' | 'MAINTENANCE';
}

export type ReplenishmentType =
  | 'FORWARD_PICKING'
  | 'BULK'
  | 'EMERGENCY'
  | 'AUTOMATIC'
  | 'MANUAL';

export interface ReplenishmentTask {
  id: string;
  replenishmentNumber: string; // e.g. REP-2026-801
  type: ReplenishmentType;
  skuCode: string;
  productNameAr: string;
  pickingBinCode: string;
  bulkReserveBinCode: string;
  minThresholdQuantity: number;
  maxTargetQuantity: number;
  currentQuantityInPickingBin: number;
  requestedReplenishQuantity: number;
  status: 'TRIGGERED' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';
}

export type ExceptionType =
  | 'LOCATION_FULL'
  | 'LOCATION_BLOCKED'
  | 'DAMAGED_BIN'
  | 'CAPACITY_EXCEEDED'
  | 'TEMP_ALERT'
  | 'HAZMAT_CONFLICT'
  | 'INVENTORY_CONFLICT'
  | 'TASK_FAILURE';

export interface WarehouseException {
  id: string;
  exceptionNumber: string; // e.g. EXP-2026-401
  exceptionType: ExceptionType;
  warehouseId: string;
  locationCode: string;
  taskId?: string;
  skuCode?: string;
  descriptionAr: string;
  severity: 'CRITICAL' | 'MAJOR' | 'WARNING';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotesAr?: string;
}

export interface WESPerformanceKPIs {
  avgPutawayTimeMins: number;
  totalTravelDistanceKmToday: number;
  workerProductivityTasksPerHour: number;
  equipmentUtilizationPercent: number;
  taskCompletionRatePercent: number;
  replenishmentEfficiencyPercent: number;
  hourlyWarehouseThroughputPallets: number;
  openExceptionsCount: number;
}

export interface AIWESOptimizationResult {
  warehouseId: string;
  recommendedBinCode: string;
  optimalTravelPathAr: string[];
  congestionRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  taskPrioritizationPlanAr: string[];
  laborDistributionAdviceAr: string;
  predictedExceptionsCount: number;
  aiConfidencePercent: number;
}
