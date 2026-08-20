export type RobotType = 'AMR_PALLET_MOVER' | 'AGV_TOW_TRACTOR' | 'PICKING_ARM_ROBOT' | 'SORTING_BOT';
export type RobotStatus = 'CHARGING' | 'IDLE_READY' | 'EXECUTING_MISSION' | 'MAINTENANCE_REQUIRED' | 'OBSTACLE_BLOCKED';

export interface WarehouseRobotRecord {
  id: string;
  robotCode: string; // e.g. AMR-RUH-01
  modelName: string; // e.g. AJA AutoMover X1000
  type: RobotType;
  warehouseId: string;
  currentZone: string;
  batteryLevelPercent: number;
  status: RobotStatus;
  currentMissionNumber?: string;
  assignedPayloadKg: number;
  operatingHoursTotal: number;
}

export interface ASRSUnitRecord {
  id: string;
  asrsCode: string; // e.g. ASRS-CRANE-01
  warehouseId: string;
  totalRackBins: number;
  occupiedBins: number;
  craneStatus: 'OPERATIONAL' | 'PALLET_RETRIEVAL' | 'PALLET_PUTAWAY' | 'CRANE_CALIBRATION';
  retrievalSpeedMetersPerSec: number;
  healthScorePercent: number;
}

export interface ConveyorLineRecord {
  id: string;
  conveyorLineCode: string; // e.g. CONVEYOR-LINE-A
  warehouseId: string;
  zoneCode: string;
  beltSpeedMetersPerSec: number;
  status: 'RUNNING_OPTIMAL' | 'JAM_DETECTED' | 'DIVERTER_STOPPED';
  itemsProcessedToday: number;
  diverterGateActive: boolean;
}

export interface RFIDPortalEvent {
  id: string;
  portalCode: string; // e.g. RFID-GATE-DOCK04
  warehouseId: string;
  timestamp: string;
  rfidTagHex: string; // e.g. E2801170000002
  detectedSkuCode: string;
  eventDirection: 'INBOUND_PASS' | 'OUTBOUND_PASS' | 'ZONE_TRANSFER';
  verificationStatus: 'VERIFIED' | 'UNAUTHORIZED_MOVEMENT_ALERT';
}

export interface IoTSensorTelemetry {
  id: string;
  sensorCode: string; // e.g. IOT-TEMP-ZONE1
  warehouseId: string;
  zoneCode: string;
  sensorType: 'TEMPERATURE' | 'HUMIDITY' | 'SMOKE' | 'SHOCK_VIBRATION' | 'DOOR_OPEN';
  currentValue: number;
  unit: string; // e.g. °C, %, PPM
  normalMinThreshold: number;
  normalMaxThreshold: number;
  status: 'NORMAL' | 'WARNING_HIGH' | 'CRITICAL_ALERT';
  lastPingAt: string;
}

export interface PredictiveMaintenanceAlert {
  id: string;
  equipmentCode: string; // e.g. AMR-RUH-01
  equipmentType: 'ROBOT' | 'ASRS_CRANE' | 'CONVEYOR' | 'HVAC_COLD_CHILLER';
  healthScorePercent: number;
  predictedFailureRisk: 'LOW' | 'MEDIUM' | 'HIGH_IMMINENT';
  recommendedActionAr: string;
  estimatedHoursToMaintenance: number;
}

export interface AISmartWarehouseOptimizationResult {
  warehouseId: string;
  robotFleetEfficiencyScorePercent: number;
  conveyorTrafficStatusAr: string;
  recommendedRobotDispatchPlanAr: string[];
  predictiveMaintenanceWarningsAr: string[];
  energyOptimizationSavingsPercent: number;
  aiConfidencePercent: number;
}
