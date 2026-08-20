export type ABCClassification = 'A' | 'B' | 'C';
export type XYZClassification = 'X' | 'Y' | 'Z';

export interface InventoryItemSKU {
  id: string;
  skuCode: string; // e.g. SKU-MED-9081
  itemCode: string; // e.g. ITEM-4001
  barcode: string; // e.g. 628100090812
  rfidTagPrefix?: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  brand: string;
  unitOfMeasure: string; // e.g. Box, Pallet, Unit
  weightKg: number;
  dimensionsCm: string; // e.g. 30x20x15
  abcClass: ABCClassification;
  xyzClass: XYZClassification;
  reorderPointMin: number;
  maxStockLevel: number;
  safetyStockLevel: number;
  unitCostSAR: number;
}

export interface WarehouseBinStock {
  id: string;
  skuCode: string;
  warehouseId: string;
  zoneCode: string;
  binCode: string;
  availableQty: number;
  reservedQty: number;
  allocatedQty: number;
  damagedQty: number;
  lotNumber?: string;
  expiryDate?: string;
  lastCountedAt: string;
}

export interface InventoryLedgerEntry {
  id: string;
  transactionNumber: string; // e.g. TXN-2026-8801
  timestamp: string;
  skuCode: string;
  warehouseId: string;
  transactionType: 'GOODS_RECEIPT' | 'SALES_ISSUE' | 'WAREHOUSE_TRANSFER' | 'ADJUSTMENT_CYCLE_COUNT' | 'SCRAP_DAMAGE';
  quantityChanged: number; // positive or negative
  resultingBalance: number;
  referenceDocNumber: string; // GRN#, Order#, Transfer#
  operatorNameAr: string;
  notesAr?: string;
}

export interface LotBatchRecord {
  id: string;
  lotNumber: string; // e.g. LOT-2026-A1
  skuCode: string;
  supplierNameAr: string;
  manufacturingDate: string;
  expiryDate: string;
  initialQuantity: number;
  currentQuantity: number;
  status: 'ACTIVE' | 'QUARANTINE' | 'EXPIRED' | 'RECALLED';
  temperatureRequirementAr: string;
}

export interface SerialNumberRecord {
  id: string;
  serialNumber: string; // e.g. SN-AJA-9920101
  skuCode: string;
  warehouseId: string;
  binCode: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'SHIPPED' | 'MAINTENANCE';
  warrantyExpiryDate: string;
  ownerCustomerNameAr?: string;
}

export interface ReplenishmentSuggestion {
  id: string;
  skuCode: string;
  productNameAr: string;
  warehouseId: string;
  currentAvailableQty: number;
  reorderPoint: number;
  recommendedOrderQty: number;
  suggestedSupplierAr: string;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'NORMAL';
  estimatedLeadTimeDays: number;
  status: 'PENDING_PO' | 'PO_GENERATED' | 'DISMISSED';
}

export interface CycleCountRecord {
  id: string;
  countPlanNumber: string; // e.g. CC-2026-004
  warehouseId: string;
  zoneCode: string;
  scheduledDate: string;
  skuCode: string;
  binCode: string;
  systemQuantity: number;
  actualCountedQuantity?: number;
  varianceQuantity?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VARIANCE_APPROVED';
  counterNameAr: string;
}

export interface AIInventoryOptimizationResult {
  skuCode: string;
  healthScorePercent: number;
  predictedDemandNext30Days: number;
  optimalSafetyStockLevel: number;
  recommendedReplenishmentDate: string;
  deadStockRiskAssessmentAr: string;
  rebalancingActionPlanAr: string[];
  aiConfidencePercent: number;
}
