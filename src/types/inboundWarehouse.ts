export type ASNStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'ARRIVED_AT_DOCK' | 'RECEIVING_IN_PROGRESS' | 'COMPLETED' | 'EXCEPTION';

export type QualityInspectionResult = 'PASSED' | 'FAILED' | 'QUARANTINE' | 'PARTIAL_PASS' | 'CONDITIONAL_PASS' | 'HOLD' | 'REWORK';

export type PutawayTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type DockStatus = 'RESERVED' | 'OCCUPIED' | 'RELEASED' | 'OVERDUE' | 'MAINTENANCE';

export type ReceivingType = 'BLIND_RECEIVING' | 'PO_RECEIVING' | 'ASN_RECEIVING' | 'CONTAINER_RECEIVING' | 'PALLET_RECEIVING' | 'MIXED' | 'CROSS_DOCK';

export type NCRStatus = 'OPEN' | 'UNDER_REVIEW' | 'CAPA_PENDING' | 'APPROVED' | 'CLOSED';

export interface ASNItem {
  id: string;
  skuCode: string;
  productNameAr: string;
  productNameEn: string;
  expectedQuantity: number;
  unitOfMeasure: string;
  expectedWeightKg: number;
  expectedVolumeCbm: number;
  lotNumber?: string;
  expiryDate?: string;
}

export interface AdvancedShippingNotice {
  id: string;
  asnNumber: string; // e.g. ASN-2026-901
  purchaseOrderNumber: string; // e.g. PO-AJA-9081
  supplierNameAr: string;
  carrierNameAr: string;
  expectedArrivalDate: string;
  warehouseId: string;
  dockNumber: string;
  totalExpectedPackages: number;
  totalExpectedPallets: number;
  totalWeightKg?: number;
  totalVolumeCbm?: number;
  containerNumber?: string;
  status: ASNStatus;
  driverName?: string;
  truckPlateNumber?: string;
  temperatureControlled: boolean;
  targetTemperatureCelsius?: number;
  items?: ASNItem[];
  attachments?: string[];
  revisionHistory?: Array<{
    revNumber: number;
    updatedAt: string;
    updatedBy: string;
    noteAr: string;
  }>;
}

export interface GoodsReceiptNoteItem {
  id: string;
  skuCode: string;
  productNameAr: string;
  expectedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  pendingQty: number;
  unitPriceSar: number;
  conditionStatus: 'GOOD' | 'DAMAGED' | 'SHORT' | 'OVER';
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. GRN-2026-401
  asnNumber: string;
  purchaseOrderNumber?: string;
  warehouseId: string;
  dockNumber: string;
  supplierNameAr: string;
  receivedDate: string;
  expectedQuantity: number;
  receivedQuantity: number;
  varianceQuantity: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  inspectionRequired: boolean;
  receivedByInspector: string;
  status: 'PENDING_INSPECTION' | 'APPROVED' | 'REJECTED' | 'POSTED_TO_GL';
  notesAr?: string;
  items?: GoodsReceiptNoteItem[];
  attachments?: string[];
  autoPostedToGL?: boolean;
}

export interface OSDRecord {
  id: string;
  osdNumber: string; // e.g. OSD-2026-101
  grnNumber: string;
  supplierNameAr: string;
  overQuantity: number;
  shortQuantity: number;
  damagedQuantity: number;
  missingItemsCount: number;
  replacementRequested: boolean;
  incidentDescriptionAr: string;
  claimStatus: 'REPORTED' | 'CLAIM_FILED' | 'SUPPLIER_REIMBURSED' | 'REJECTED';
  photoUrls?: string[];
  reportedAt: string;
}

export interface QualityChecklistItem {
  id: string;
  checkpointAr: string;
  passed: boolean;
  notesAr?: string;
}

export interface QualityInspectionRecord {
  id: string;
  grnNumber: string;
  skuCode: string;
  productNameAr: string;
  sampleQuantityInspected: number;
  damagedQuantityFound: number;
  inspectionResult: QualityInspectionResult;
  inspectorName: string;
  inspectionTimestamp: string;
  quarantineReasonAr?: string;
  photoAttachmentUrls?: string[];
  inspectionPlanCode?: string;
  samplingRuleDescriptionAr?: string;
  checklist?: QualityChecklistItem[];
  reportPdfGenerated?: boolean;
}

export interface NCRRecord {
  id: string;
  ncrNumber: string; // e.g. NCR-2026-301
  grnNumber: string;
  supplierNameAr: string;
  skuCode: string;
  productNameAr: string;
  rootCauseAr: string;
  correctiveActionAr: string;
  preventiveActionAr: string;
  status: NCRStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface DirectedPutawayTask {
  id: string;
  taskNumber: string; // e.g. PUT-2026-8801
  grnNumber: string;
  skuCode: string;
  productNameAr: string;
  palletBarcode: string;
  rfidTagId: string;
  recommendedZoneCode: string;
  recommendedBinCode: string;
  capacityValid?: boolean;
  weightValid?: boolean;
  temperatureValid?: boolean;
  hazmatValid?: boolean;
  priorityScore?: number;
  assignedOperatorName: string;
  status: PutawayTaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface DockAppointment {
  id: string;
  dockNumber: string;
  warehouseId: string;
  supplierNameAr: string;
  carrierNameAr: string;
  scheduledTimeSlot: string; // e.g. "2026-08-05 09:00 - 10:30"
  arrivalTimeWindow?: string;
  departureTimeWindow?: string;
  loadingBayNameAr?: string;
  priorityLevel?: 'NORMAL' | 'HIGH' | 'EXPRESS';
  truckType: string;
  status: DockStatus;
  dockUtilizationPercent?: number;
}

export interface InboundContainer {
  id: string;
  containerNumber: string; // e.g. MSKU-882019-1
  sealNumber: string;
  containerType: '20FT' | '40FT_REEFER' | '40FT_HC';
  status: 'ARRIVED' | 'UNLOADING' | 'INSPECTED' | 'RELEASED';
  unloadProgressPercent: number;
  expectedPallets: number;
  unloadedPallets: number;
  temperatureCelsius?: number;
}

export interface CrossDockRecord {
  id: string;
  crossDockNumber: string; // e.g. XD-2026-001
  inboundAsnNumber: string;
  outboundShipmentNumber: string;
  skuCode: string;
  productNameAr: string;
  transferQuantity: number;
  fromDockNumber: string;
  toOutboundDockNumber: string;
  status: 'RESERVED' | 'TRANSFERRING' | 'COMPLETED';
}

export interface InboundLabelJob {
  id: string;
  jobId: string;
  labelType: 'RECEIVING' | 'PALLET' | 'CONTAINER' | 'LOCATION' | 'BARCODE' | 'RFID';
  targetCode: string;
  skuOrPalletCode: string;
  format: 'GS1_128' | 'QR_CODE' | 'RFID_EPC_GEN2';
  quantityToPrint: number;
  printedAt?: string;
  printedBy?: string;
  status: 'QUEUED' | 'PRINTING' | 'COMPLETED';
}

export interface InboundAnalyticsKPIs {
  totalAsnsThisMonth: number;
  avgUnloadingTimeMins: number;
  dockUtilizationPercent: number;
  receivingAccuracyPercent: number;
  supplierOnTimePercent: number;
  qualityPassRatePercent: number;
  osdIncidentRatePercent: number;
  receivingLeadTimeHours: number;
}

export interface AIInboundWarehouseResult {
  asnNumber: string;
  putawayEfficiencyScorePercent: number;
  recommendedOptimalDockAr: string;
  predictedUnloadingTimeMinutes: number;
  inspectionRiskAssessmentAr: string;
  directedPutawayStrategyAr: string;
  congestionPreventionRecommendationsAr: string[];
  dockOptimizationPlanAr?: string;
  receivingWorkforceRequirement?: number;
  supplierPerformanceRiskScore?: number;
  aiConfidencePercent: number;
}

