export type MovementType =
  | 'GOODS_RECEIPT'
  | 'GOODS_ISSUE'
  | 'STOCK_ADJUSTMENT'
  | 'WAREHOUSE_TRANSFER'
  | 'BIN_TRANSFER'
  | 'LOCATION_TRANSFER'
  | 'OWNERSHIP_TRANSFER'
  | 'STATUS_CHANGE'
  | 'INVENTORY_CONSUMPTION'
  | 'INVENTORY_RETURN';

export interface StockMovement {
  id: string;
  movementNumber: string; // e.g. MOV-2026-901
  type: MovementType;
  skuCode: string;
  productNameAr: string;
  quantity: number;
  unitOfMeasure: string;
  sourceWarehouseId: string;
  sourceBinCode: string;
  destinationWarehouseId?: string;
  destinationBinCode?: string;
  referenceDocumentNumber?: string; // e.g. PO-8801 or SO-9921
  performedByUserId: string;
  performedByUserNameAr: string;
  timestamp: string;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'CANCELLED';
}

export type ReservationType = 'SOFT' | 'HARD' | 'ORDER' | 'SHIPMENT' | 'PROJECT' | 'MANUAL';

export interface InventoryReservation {
  id: string;
  reservationNumber: string; // e.g. RSV-2026-101
  reservationType: ReservationType;
  skuCode: string;
  productNameAr: string;
  warehouseId: string;
  binCode?: string;
  reservedQuantity: number;
  customerOrProjectNameAr: string;
  priorityOrder: number;
  expiresAt: string;
  status: 'ACTIVE' | 'RELEASED' | 'FULFILLED' | 'EXPIRED';
  createdAt: string;
}

export type AllocationStrategy = 'FIFO' | 'FEFO' | 'PRIORITY' | 'WAVE' | 'MANUAL';

export interface InventoryAllocation {
  id: string;
  allocationNumber: string; // e.g. ALLOC-2026-401
  orderNumber: string;
  skuCode: string;
  productNameAr: string;
  warehouseId: string;
  allocatedBinCode: string;
  batchNumber?: string;
  allocatedQuantity: number;
  strategyUsed: AllocationStrategy;
  status: 'ALLOCATED' | 'PICKING_IN_PROGRESS' | 'DISPATCHED';
  allocatedAt: string;
}

export type HoldReason = 'QUALITY' | 'DAMAGE' | 'COMPLIANCE' | 'CUSTOMER' | 'FINANCIAL' | 'MANUAL';

export interface InventoryHold {
  id: string;
  holdNumber: string; // e.g. HLD-2026-055
  reason: HoldReason;
  skuCode: string;
  productNameAr: string;
  warehouseId: string;
  binCode: string;
  quantityOnHold: number;
  blockedByUserNameAr: string;
  notesAr: string;
  status: 'ACTIVE_HOLD' | 'RELEASED' | 'SCRAPPED';
  placedAt: string;
  releasedAt?: string;
}

export type TransferType =
  | 'WAREHOUSE_TO_WAREHOUSE'
  | 'BIN_TO_BIN'
  | 'ZONE_TO_ZONE'
  | 'COMPANY_TRANSFER'
  | 'BRANCH_TRANSFER'
  | 'INTERCOMPANY'
  | 'TRANSIT_INVENTORY';

export interface StockTransfer {
  id: string;
  transferNumber: string; // e.g. TRF-2026-301
  transferType: TransferType;
  skuCode: string;
  productNameAr: string;
  sourceWarehouseId: string;
  sourceWarehouseNameAr: string;
  sourceBinCode: string;
  destinationWarehouseId: string;
  destinationWarehouseNameAr: string;
  destinationBinCode: string;
  quantity: number;
  carrierDriverNameAr?: string;
  estimatedArrivalAt?: string;
  status: 'REQUESTED' | 'DISPATCHED_IN_TRANSIT' | 'RECEIVED' | 'REJECTED';
  initiatedAt: string;
}

export type AdjustmentType =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'CYCLE_COUNT'
  | 'DAMAGE'
  | 'SHRINKAGE'
  | 'FOUND'
  | 'WRITE_OFF';

export interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string; // e.g. ADJ-2026-701
  adjustmentType: AdjustmentType;
  skuCode: string;
  productNameAr: string;
  warehouseId: string;
  binCode: string;
  previousQuantity: number;
  adjustedQuantity: number;
  differenceQuantity: number;
  financialValueImpactSar: number;
  reasonAr: string;
  approvedByManagerAr: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  adjustedAt: string;
}

export interface ATPMetrics {
  skuCode: string;
  productNameAr: string;
  warehouseId: string;
  onHandQuantity: number;
  reservedQuantity: number;
  allocatedQuantity: number;
  holdQuantity: number;
  incomingPoQuantity: number;
  availableToPromiseQuantity: number; // ATP = OnHand - Reserved - Allocated - Hold + Incoming
  futureAvailabilityDate: string;
}

export interface InventoryTimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'MOVEMENT' | 'RESERVATION' | 'ALLOCATION' | 'HOLD' | 'TRANSFER' | 'ADJUSTMENT';
  skuCode: string;
  descriptionAr: string;
  operatorNameAr: string;
  quantityChange: number;
  resultOnHand: number;
}

export interface AIInventoryOptimizationResult {
  skuCode: string;
  recommendedSafetyStock: number;
  predictedReorderPoint: number;
  riskOfStockoutPercent: number;
  atpOptimizationAdviceAr: string;
  aiHealthScorePercent: number;
}
