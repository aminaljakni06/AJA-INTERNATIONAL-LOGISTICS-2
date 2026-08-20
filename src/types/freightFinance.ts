export type CostCategory =
  | 'TRANSPORTATION'
  | 'FUEL'
  | 'LABOR'
  | 'VEHICLE_MAINTENANCE'
  | 'WAREHOUSE_STORAGE'
  | 'PACKAGING'
  | 'INSURANCE'
  | 'HANDLING'
  | 'CUSTOMS_DUTY'
  | 'TAX_VAT'
  | 'ACCESSORIAL'
  | 'MISCELLANEOUS';

export type InvoiceType =
  | 'CUSTOMER_INVOICE'
  | 'CARRIER_INVOICE'
  | 'VENDOR_INVOICE'
  | 'INTERCOMPANY';

export type AuditStatus = 'MATCHED' | 'DISCREPANCY' | 'PENDING_AUDIT' | 'DISPUTED' | 'APPROVED';

export interface ShipmentCostBreakdown {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  customerName: string;
  originCity: string;
  destinationCity: string;
  costCenterCode: string; // e.g. CC-EAST-01

  // Detailed Cost Elements (SAR)
  baseTransportationCostSAR: number;
  fuelSurchargeSAR: number;
  driverLaborCostSAR: number;
  vehicleDepreciationSAR: number;
  warehouseStorageCostSAR: number;
  insuranceCostSAR: number;
  customsDutySAR: number;
  accessorialChargesSAR: number;
  vatTaxSAR: number;

  totalActualCostSAR: number;
  totalBilledRevenueSAR: number;
  netProfitMarginSAR: number;
  marginPercent: number;

  createdAt: string;
}

export interface FreightLandedCostCalculation {
  id: string;
  orderNumber: string;
  productDescriptionAr: string;
  unitQuantity: number;
  productBaseCostSAR: number;
  freightCostSAR: number;
  insuranceCostSAR: number;
  customsDutySAR: number;
  handlingCostSAR: number;
  totalLandedCostSAR: number;
  unitLandedCostSAR: number;
  effectiveLandedMultiplier: number;
}

export interface FreightInvoiceAuditRecord {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  partyName: string;
  carrierOrVendorCode: string;
  billedAmountSAR: number;
  expectedContractAmountSAR: number;
  varianceSAR: number;
  variancePercentage: number;
  auditStatus: AuditStatus;
  discrepancyReasonAr?: string;
  invoiceDate: string;
  dueDate: string;
}

export interface ProfitabilityByRoute {
  routeKey: string; // e.g. Dammam -> Riyadh
  originCity: string;
  destinationCity: string;
  totalShipmentsCount: number;
  totalRevenueSAR: number;
  totalCostSAR: number;
  netProfitSAR: number;
  averageMarginPercent: number;
  averageCostPerKmSAR: number;
}

export interface FreightFinanceKPIs {
  totalFreightRevenueSAR: number;
  totalFreightCostSAR: number;
  netFreightProfitSAR: number;
  averageGrossMarginPercent: number;
  totalAuditedInvoicesCount: number;
  discrepancySavingsSAR: number;
  averageCostPerKmSAR: number;
  averageRevenuePerShipmentSAR: number;
}

export interface AIFreightFinanceResult {
  shipmentId: string;
  predictedFutureCostSAR: number;
  marginOptimizationScorePercent: number;
  costReductionOpportunitiesAr: string[];
  anomaliesDetectedAr: string[];
  carrierRateRecommendationAr: string;
  financialRiskAssessmentAr: string;
  aiConfidencePercent: number;
}
