import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  WarehouseRobotRecord,
  ASRSUnitRecord,
  ConveyorLineRecord,
  RFIDPortalEvent,
  IoTSensorTelemetry,
  PredictiveMaintenanceAlert
} from '../../types/smartWarehouse';

const ROBOTS_COLLECTION = 'smart_robots';
const ASRS_COLLECTION = 'smart_asrs';
const CONVEYORS_COLLECTION = 'smart_conveyors';
const RFID_COLLECTION = 'smart_rfid_events';
const IOT_COLLECTION = 'smart_iot_telemetry';
const MAINTENANCE_COLLECTION = 'smart_maintenance_alerts';

export const SEED_ROBOTS: WarehouseRobotRecord[] = [
  {
    id: 'ROBOT-001',
    robotCode: 'AMR-RUH-01',
    modelName: 'AJA AutoMover X1000',
    type: 'AMR_PALLET_MOVER',
    warehouseId: 'WH-RUH-01',
    currentZone: 'Z-COLD-01',
    batteryLevelPercent: 88,
    status: 'EXECUTING_MISSION',
    currentMissionNumber: 'MIS-2026-901',
    assignedPayloadKg: 850,
    operatingHoursTotal: 1420,
  },
  {
    id: 'ROBOT-002',
    robotCode: 'AGV-RUH-02',
    modelName: 'AJA Heavy Tow Tractor v4',
    type: 'AGV_TOW_TRACTOR',
    warehouseId: 'WH-RUH-01',
    currentZone: 'Z-BULK-02',
    batteryLevelPercent: 95,
    status: 'IDLE_READY',
    assignedPayloadKg: 0,
    operatingHoursTotal: 2100,
  },
  {
    id: 'ROBOT-003',
    robotCode: 'BOT-ARM-03',
    modelName: 'AJA Smart Pick Arm 6DoF',
    type: 'PICKING_ARM_ROBOT',
    warehouseId: 'WH-DMM-02',
    currentZone: 'Z-PACK-01',
    batteryLevelPercent: 100,
    status: 'EXECUTING_MISSION',
    currentMissionNumber: 'MIS-2026-905',
    assignedPayloadKg: 25,
    operatingHoursTotal: 890,
  },
];

export const SEED_ASRS: ASRSUnitRecord[] = [
  {
    id: 'ASRS-001',
    asrsCode: 'ASRS-CRANE-01',
    warehouseId: 'WH-RUH-01',
    totalRackBins: 1200,
    occupiedBins: 1050,
    craneStatus: 'OPERATIONAL',
    retrievalSpeedMetersPerSec: 3.5,
    healthScorePercent: 97,
  },
];

export const SEED_CONVEYORS: ConveyorLineRecord[] = [
  {
    id: 'CONV-001',
    conveyorLineCode: 'CONVEYOR-LINE-A',
    warehouseId: 'WH-RUH-01',
    zoneCode: 'Z-MAIN-CONVEYOR',
    beltSpeedMetersPerSec: 1.8,
    status: 'RUNNING_OPTIMAL',
    itemsProcessedToday: 4820,
    diverterGateActive: true,
  },
];

export const SEED_RFID_EVENTS: RFIDPortalEvent[] = [
  {
    id: 'RFID-001',
    portalCode: 'RFID-GATE-DOCK04',
    warehouseId: 'WH-RUH-01',
    timestamp: '2026-08-05 11:20:15',
    rfidTagHex: 'E2801170000002889A',
    detectedSkuCode: 'SKU-MED-9081',
    eventDirection: 'OUTBOUND_PASS',
    verificationStatus: 'VERIFIED',
  },
];

export const SEED_IOT_TELEMETRY: IoTSensorTelemetry[] = [
  {
    id: 'IOT-001',
    sensorCode: 'IOT-TEMP-COLD-01',
    warehouseId: 'WH-RUH-01',
    zoneCode: 'Z-COLD-01',
    sensorType: 'TEMPERATURE',
    currentValue: 3.8,
    unit: '°C',
    normalMinThreshold: 2.0,
    normalMaxThreshold: 8.0,
    status: 'NORMAL',
    lastPingAt: 'منذ 10 ثوانٍ',
  },
  {
    id: 'IOT-002',
    sensorCode: 'IOT-HUMID-Z2',
    warehouseId: 'WH-RUH-01',
    zoneCode: 'Z-BULK-02',
    sensorType: 'HUMIDITY',
    currentValue: 45.0,
    unit: '%',
    normalMinThreshold: 30.0,
    normalMaxThreshold: 60.0,
    status: 'NORMAL',
    lastPingAt: 'منذ 15 ثانية',
  },
];

export const SEED_MAINTENANCE_ALERTS: PredictiveMaintenanceAlert[] = [
  {
    id: 'MAINT-001',
    equipmentCode: 'AMR-RUH-01',
    equipmentType: 'ROBOT',
    healthScorePercent: 82,
    predictedFailureRisk: 'MEDIUM',
    recommendedActionAr: 'فحص عجلات التوجيه ومعايرة الحساسات الليدار (Lidar Re-calibration)',
    estimatedHoursToMaintenance: 48,
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[SmartWarehouseRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getSmartRobots(): Promise<WarehouseRobotRecord[]> {
  return safeFetchCollection<WarehouseRobotRecord>(ROBOTS_COLLECTION, SEED_ROBOTS);
}

export async function getASRSUnits(): Promise<ASRSUnitRecord[]> {
  return safeFetchCollection<ASRSUnitRecord>(ASRS_COLLECTION, SEED_ASRS);
}

export async function getConveyorLines(): Promise<ConveyorLineRecord[]> {
  return safeFetchCollection<ConveyorLineRecord>(CONVEYORS_COLLECTION, SEED_CONVEYORS);
}

export async function getRFIDEvents(): Promise<RFIDPortalEvent[]> {
  return safeFetchCollection<RFIDPortalEvent>(RFID_COLLECTION, SEED_RFID_EVENTS);
}

export async function getIoTSensorTelemetry(): Promise<IoTSensorTelemetry[]> {
  return safeFetchCollection<IoTSensorTelemetry>(IOT_COLLECTION, SEED_IOT_TELEMETRY);
}

export async function getPredictiveMaintenanceAlerts(): Promise<PredictiveMaintenanceAlert[]> {
  return safeFetchCollection<PredictiveMaintenanceAlert>(MAINTENANCE_COLLECTION, SEED_MAINTENANCE_ALERTS);
}
