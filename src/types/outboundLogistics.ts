export type OutboundOrderPriority = 'STANDARD' | 'EXPRESS' | 'CRITICAL_MEDICAL' | 'SAME_DAY';
export type OutboundOrderStatus = 'PENDING_ALLOCATION' | 'ALLOCATED' | 'RELEASED_TO_WAVE' | 'PICKING' | 'PACKING' | 'STAGED' | 'LOADED' | 'DISPATCHED';

export type PickingStrategy = 'SINGLE_ORDER' | 'WAVE_PICKING' | 'BATCH_PICKING' | 'ZONE_PICKING' | 'CLUSTER_PICKING';

export interface OutboundSalesOrder {
  id: string;
  orderNumber: string; // e.g. SO-2026-901
  customerNameAr: string;
  customerCode: string;
  destinationCityAr: string;
  orderPriority: OutboundOrderPriority;
  status: OutboundOrderStatus;
  requestedDeliveryDate: string;
  totalItemsCount: number;
  totalWeightKg: number;
  totalVolumeCbm: number;
  pickingStrategy: PickingStrategy;
  assignedWaveId?: string;
  createdAt: string;
}

export interface PickingWave {
  id: string;
  waveNumber: string; // e.g. WAVE-2026-0801
  warehouseId: string;
  zoneCode: string;
  strategy: PickingStrategy;
  assignedPickerNameAr: string;
  totalOrdersCount: number;
  totalPickTasksCount: number;
  completedPickTasksCount: number;
  status: 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  pickToLightActive: boolean;
  voicePickingActive: boolean;
  startedAt?: string;
}

export interface PickTaskItem {
  id: string;
  waveId: string;
  orderNumber: string;
  skuCode: string;
  productNameAr: string;
  sourceBinCode: string;
  targetCartonId?: string;
  quantityRequired: number;
  quantityPicked: number;
  status: 'PENDING' | 'PICKED' | 'SHORTAGE_EXCEPTION' | 'CANCELLED';
  lightModuleCode?: string; // e.g. PTL-ZONE-A-012
  voiceCommandPromptAr?: string;
}

export interface PackingStationRecord {
  id: string;
  stationNumber: string; // e.g. PACK-STATION-01
  packerNameAr: string;
  currentOrderNumber?: string;
  cartonCode: string; // e.g. CTN-HEAVY-MED
  weightVerifiedKg: number;
  recommendedBoxTypeAr: string; // e.g. كرتون سميك ذو حماية حرارية (Type-B)
  checklistPassed: boolean;
  status: 'IDLE' | 'PACKING_IN_PROGRESS' | 'SEALED_PASSED' | 'WEIGHT_DISCREPANCY';
}

export interface ShippingManifest {
  id: string;
  manifestNumber: string; // e.g. MAN-2026-8809
  carrierNameAr: string;
  truckPlateNumber: string;
  dockDoorNumber: string; // e.g. DOCK-04
  totalPackages: number;
  totalWeightKg: number;
  dispatchStatus: 'PREPARING' | 'LOADING_VERIFIED' | 'DISPATCHED' | 'DELIVERED';
  proofOfShipmentSignatureAr?: string;
  dispatchedAt?: string;
}

export interface OutboundExceptionRecord {
  id: string;
  exceptionNumber: string; // e.g. EXC-OUT-102
  orderNumber: string;
  skuCode: string;
  exceptionType: 'MISSING_ITEM' | 'WRONG_ITEM' | 'DAMAGED_IN_PACKING' | 'WEIGHT_MISMATCH' | 'LOADING_BARCODE_ERROR';
  reportedByAr: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REPLACED' | 'WRITTEN_OFF';
  timestamp: string;
  resolutionDetailsAr?: string;
}

export interface AIOutboundOptimizationResult {
  waveNumber: string;
  optimalPickPathBins: string[];
  recommendedCartonsCount: number;
  suggestedLaborCount: number;
  dockLoadingSequence: string[];
  estimatedFulfillmentTimeMinutes: number;
  riskWarningAr?: string;
  aiConfidencePercent: number;
}
